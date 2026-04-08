class Api::DungeonController < ApplicationController
  skip_before_action :verify_authenticity_token

  def act
    user_message = params[:message]
    character     = params[:character] || {}
    history       = params[:history]   || []
    tags          = params[:tags]      || []     # array de tags
    language      = params[:language]  || "pt-br" # novo parâmetro

    system_prompt = build_system_prompt(tags, language)

    client = OpenAI::Client.new(access_token: ENV["OPENAI_API_KEY"])

    response = client.chat(
      parameters: {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system_prompt },
          { role: "user",   content: "Personagem atual: #{character.to_json}\nHistórico recente: #{history.to_json}\nAção do jogador: #{user_message}" }
        ],
        temperature: 0.85,
        max_tokens: 900
      }
    )

    ai_reply = response.dig("choices", 0, "message", "content")

    render json: {
      reply: ai_reply,
      character: character
    }
  end

  private

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
