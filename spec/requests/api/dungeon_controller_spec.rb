require "rails_helper"

RSpec.describe "Api::DungeonController", type: :request do
  let(:client) { instance_double(OpenAI::Client) }

  before do
    host! "localhost"

    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:[]).with("OPENAI_API_KEY").and_return("test-key")
    allow(ENV).to receive(:fetch).with("OPENAI_MODEL", "gpt-4o-mini").and_return("gpt-4o-mini")
    allow(OpenAI::Client).to receive(:new).and_return(client)
  end

  describe "POST /api/dungeon/act" do
    it "returns 422 when message is missing" do
      post "/api/dungeon/act", params: { message: "" }, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)).to include("error" => "Campo message e obrigatorio.")
    end

    it "returns AI reply on success" do
      allow(client).to receive(:chat).and_return(
        {
          "choices" => [
            {
              "message" => {
                "content" => "A tocha ilumina um corredor antigo.\n- Avancar\n- Investigar\n- Recuar"
              }
            }
          ]
        }
      )

      post "/api/dungeon/act",
        params: {
          message: "Abro a porta com cuidado",
          character: { name: "Aria", class: "Ladina" },
          history: [ { role: "assistant", content: "Voce esta no salao." } ],
          tags: [ "fantasia", "horror" ],
          language: "pt-br"
        },
        as: :json

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)

      expect(body["reply"]).to include("A tocha ilumina")
      expect(body["character"]).to include("name" => "Aria")
      expect(client).to have_received(:chat)
    end

    it "returns 502 when provider fails" do
      allow(client).to receive(:chat).and_raise(StandardError, "timeout")

      post "/api/dungeon/act", params: { message: "Corro para o norte" }, as: :json

      expect(response).to have_http_status(:bad_gateway)
      expect(JSON.parse(response.body)).to include("error" => "Falha ao gerar resposta da aventura.")
    end
  end
end
