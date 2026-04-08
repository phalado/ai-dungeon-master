class Api::DungeonController < ApplicationController
  before_action :rate_limit!

  def act
    user_message  = params[:message].to_s.strip
    character     = params[:character] || {}
    history       = params[:history]   || []
    tags          = params[:tags]      || []     # array de tags
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

    client = OpenAI::Client.new(access_token: ENV["OPENAI_API_KEY"])

    response = client.chat(parameters: openai_parameters(system_prompt, character, history, user_message))

    ai_reply = response.dig("choices", 0, "message", "content")

    if ai_reply.to_s.strip.empty?
      render json: { error: "A IA nao retornou conteudo para a rodada." }, status: :bad_gateway
      return
    end

    render json: {
      reply: ai_reply,
      character: character
    }
  rescue StandardError => error
    Rails.logger.error("DungeonController#act failed: #{error.class} - #{error.message}")
    render json: { error: "Falha ao gerar resposta da aventura." }, status: :bad_gateway
  end

  private

  def openai_parameters(system_prompt, character, history, user_message)
    {
      model: ENV.fetch("OPENAI_MODEL", "gpt-4o-mini"),
      messages: [
        { role: "system", content: system_prompt },
        { role: "user", content: "Personagem atual: #{character.to_json}\nHistorico recente: #{history.to_json}\nAcao do jogador: #{user_message}" }
      ],
      temperature: 0.85,
      max_tokens: 900
    }
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
    PROMPT
  end
end
