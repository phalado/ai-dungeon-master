# AI Dungeon Master

Aplicacao simples para criar campanhas de RPG narradas por LLM. O backend Rails expõe a API de mestragem e o frontend React/Vite entrega a interface de criacao de personagem e chat da aventura.

## Stack

- Ruby on Rails 8 em modo API
- React 19 + TypeScript + Vite
- OpenAI via gem `ruby-openai`

## Variaveis de ambiente

Backend:

- `OPENAI_API_KEY`: chave da API da OpenAI
- `OPENAI_URI_BASE`: opcional, padrao `https://api.openai.com/v1`
- `OPENAI_MODEL`: opcional, padrao `gpt-4o-mini` (ou `llama-3.1-70b-versatile` se `OPENAI_URI_BASE` apontar para Groq)
- `FRONTEND_ORIGINS`: opcional, lista separada por virgula com origens permitidas no CORS. Exemplo: `http://localhost:5173,http://127.0.0.1:5173`

Exemplo para Groq:

- `OPENAI_URI_BASE=https://api.groq.com/openai`
- `OPENAI_MODEL=llama-3.1-70b-versatile`

Frontend:

- `VITE_API_BASE_URL`: opcional, padrao `http://localhost:3000`

## Como rodar

Backend:

```bash
bundle install
bin/rails server
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Endpoint principal

- `POST /api/dungeon/act`

Payload esperado:

```json
{
  "message": "Entro na taverna e procuro o informante.",
  "character": {
    "name": "Aria",
    "class": "Ladina Arcana",
    "background": "Ex-cartografa de uma ordem proibida",
    "goal": "Recuperar um grimorio perdido"
  },
  "history": [],
  "tags": ["fantasia sombria", "intriga politica"],
  "language": "pt-br"
}
```

## Testes

```bash
bundle exec rspec spec/requests/api/dungeon_controller_spec.rb
```
