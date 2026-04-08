class Api::DungeonController < ApplicationController
  before_action :rate_limit!

  def act
    user_message  = params[:message].to_s.strip
    character     = params[:character] || {}
    history       = params[:history]   || []
    tags          = params[:tags]      || []     # array de tags
    roll          = params[:roll]      || {}
    language      = params[:language]  || "pt-br" # novo parâmetro

    if user_message.empty?
      render json: { error: "Campo message e obrigatorio." }, status: :unprocessable_content
      return
    end

    if ENV["OPENAI_API_KEY"].to_s.strip.empty?
      render json: { error: "OPENAI_API_KEY nao configurada no servidor." }, status: :service_unavailable
      return
    end

    system_prompt = build_system_prompt(tags, language)

    client = OpenAI::Client.new(
      access_token: ENV["OPENAI_API_KEY"],
      uri_base: ai_uri_base
    )

    response = client.chat(parameters: openai_parameters(system_prompt, character, history, user_message, roll))

    ai_reply = response.dig("choices", 0, "message", "content")

    if ai_reply.to_s.strip.empty?
      render json: { error: "A IA nao retornou conteudo para a rodada." }, status: :bad_gateway
      return
    end

    render json: {
      reply: ai_reply,
      character: character
    }
  rescue Faraday::UnauthorizedError => error
    Rails.logger.error("DungeonController#act unauthorized: #{error.class} - #{error.message}")
    render json: {
      error: "Falha de autenticacao com o provedor de IA. Verifique OPENAI_API_KEY, OPENAI_URI_BASE e OPENAI_MODEL."
    }, status: :bad_gateway
  rescue Faraday::BadRequestError => error
    upstream_message = provider_error_message(error)
    Rails.logger.error("DungeonController#act bad_request: #{error.class} - #{upstream_message}")
    render json: {
      error: "Requisicao invalida para o provedor de IA: #{upstream_message}"
    }, status: :bad_gateway
  rescue StandardError => error
    Rails.logger.error("DungeonController#act failed: #{error.class} - #{error.message}")
    render json: { error: "Falha ao gerar resposta da aventura." }, status: :bad_gateway
  end

  private

  def ai_uri_base
    ENV.fetch("OPENAI_URI_BASE", "https://api.groq.com/openai/v1/")
  end

  def ai_model
    configured_model = ENV["OPENAI_MODEL"].to_s.strip
    return configured_model unless configured_model.empty?

    ai_uri_base.include?("groq.com") ? "llama-3.3-70b-versatile" : "gpt-4o-mini"
  end

  def openai_parameters(system_prompt, character, history, user_message, roll)
    {
      model: ai_model,
      messages: [
        { role: "system", content: system_prompt },
        { role: "user", content: "Personagem atual: #{character.to_json}\nHistorico recente: #{history.to_json}\nContexto da rolagem: #{roll_context_text(roll)}\nAcao do jogador: #{user_message}" }
      ],
      temperature: 0.85,
      max_tokens: 900
    }
  end

  def roll_context_text(roll)
    return "sem rolagem externa nesta rodada" unless roll.is_a?(Hash)

    notation = roll["notation"] || roll[:notation]
    output = roll["output"] || roll[:output]
    total = roll["total"] || roll[:total]
    external_failed = roll["externalFailed"] || roll[:externalFailed]

    return "sem rolagem externa nesta rodada" if notation.to_s.strip.empty?

    if external_failed
      "rolagem externa falhou para #{notation}; o mestre deve rolar manualmente"
    else
      "rolagem externa executada: notacao=#{notation}, output=#{output}, total=#{total}"
    end
  end

  def provider_error_message(error)
    response = error.respond_to?(:response) ? error.response : nil
    body = response.is_a?(Hash) ? response[:body] || response["body"] : nil

    return body["error"]["message"] if body.is_a?(Hash) && body.dig("error", "message").present?
    return body if body.is_a?(String) && body.present?

    error.message
  end

  def rate_limit!
    key = "dungeon:act:#{request.remote_ip}"
    count = Rails.cache.read(key).to_i + 1
    Rails.cache.write(key, count, expires_in: 1.minute)

    return if count <= 30

    render json: { error: "Muitas requisicoes. Tente novamente em instantes." }, status: :too_many_requests
  end

  def build_system_prompt(tags, language)
    # Tema escolhido
    theme_description = if tags.any?
      "Tema escolhido pelo jogador: #{tags.join(', ')}. Mantenha a história 100% dentro desse tom e estilo."
    else
      "Fantasia genérica medieval leve."
    end

    # Instrução de idioma
    lang_instruction = case language
    when "en"
      "Always respond in clear, natural English."
    when "es"
      "Siempre responde en español claro y natural."
    else
      "Sempre responda em português brasileiro, com narração rica e envolvente."
    end

    <<~PROMPT
      Você é um Mestre de RPG épico, narrador imersivo, justo e criativo.
      #{theme_description}

      #{lang_instruction}

      Regras importantes:
      - Mantenha consistência absoluta com o personagem e com o histórico da campanha.
      - No final de cada resposta, dê 3-4 opções claras de ação para o jogador escolher (no mesmo idioma da resposta).
      - Nunca quebre o personagem ou fale como IA.
      - Seja descritivo, mas não demore demais nas descrições.
      - Quando uma acao exigir rolagem de dado, inclua exatamente um marcador no formato [[ROLL: notacao]] usando notacao valida (ex.: [[ROLL: 1d20]], [[ROLL: 4d6kh3]], [[ROLL: 1d100]]).
      - Quando voce usar [[ROLL: ...]], nao invente o resultado na mesma mensagem; aguarde a mensagem seguinte com o resultado da rolagem para continuar a narrativa.
      - Se receber uma mensagem dizendo que a rolagem externa falhou, faca voce mesmo a rolagem e informe claramente o resultado na resposta.
    PROMPT
  end
end
