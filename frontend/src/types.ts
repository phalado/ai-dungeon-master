export type Lang = 'pt-br' | 'en' | 'es'

export type CharacterSheet = {
  name: string
  klass: string
  background: string
  goal: string
}

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type Campaign = {
  id: string
  createdAt: string
  updatedAt: string
  language: Lang
  tags: string
  sheet: CharacterSheet
  history: ChatMessage[]
}
