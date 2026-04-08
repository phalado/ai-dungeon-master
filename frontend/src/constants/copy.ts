import type { CharacterSheet, Lang } from '../types'

type AppCopy = {
  title: string
  subtitle: string
  send: string
  start: string
  newCampaign: string
  loadingSavedCampaigns: string
  savedCampaignsLabel: (count: number) => string
}

type EntryCopy = {
  title: string
  message: string
  startButton: string
}

type SetupCopy = {
  title: string
  nameLabel: string
  classLabel: string
  backgroundLabel: string
  goalLabel: string
  tagsLabel: string
  namePlaceholder: string
  classPlaceholder: string
  backgroundPlaceholder: string
  goalPlaceholder: string
  tagsPlaceholder: string
  loadingStart: string
}

type JourneyCopy = {
  title: string
  masterLabel: string
  playerLabel: string
  typingLabel: string
  actionPlaceholder: string
}

type PromptCopy = {
  opening: (sheet: CharacterSheet) => string
}

type CopySchema = {
  app: AppCopy
  entry: EntryCopy
  setup: SetupCopy
  journey: JourneyCopy
  prompt: PromptCopy
}

export const COPY: Record<Lang, CopySchema> = {
  'pt-br': {
    app: {
      title: 'Mestre de Masmorra IA',
      subtitle: 'Crie seu heroi, escolha o tom e inicie sua campanha.',
      send: 'Enviar acao',
      start: 'Comecar campanha',
      newCampaign: 'Nova campanha',
      loadingSavedCampaigns: 'Carregando aventuras salvas...',
      savedCampaignsLabel: (count) => `${count} campanha(s) salva(s)`,
    },
    entry: {
      title: 'Nenhuma aventura salva',
      message: 'Nenhuma aventura salva. Vamos comecar uma?',
      startButton: 'Comecar campanha',
    },
    setup: {
      title: 'Ficha do Personagem',
      nameLabel: 'Nome',
      classLabel: 'Classe',
      backgroundLabel: 'Historia',
      goalLabel: 'Objetivo',
      tagsLabel: 'Tema da campanha (tags separadas por virgula)',
      namePlaceholder: 'Aria Tempest',
      classPlaceholder: 'Ladina Arcana',
      backgroundPlaceholder: 'Cresceu entre cartografos proibidos e roubou um mapa que sussurra...',
      goalPlaceholder: 'Recuperar o grimorio da propria familia',
      tagsPlaceholder: 'horror gotico, conspiracao, exploracao',
      loadingStart: 'Invocando o mestre...',
    },
    journey: {
      title: 'Jornada',
      masterLabel: 'Mestre',
      playerLabel: 'Jogador',
      typingLabel: 'O mestre esta preparando a cena...',
      actionPlaceholder: 'Descreva sua acao...',
    },
    prompt: {
      opening: (sheet) =>
        `Inicie minha campanha. Personagem: ${sheet.name}, ${sheet.klass}. Historia: ${sheet.background}. Objetivo: ${sheet.goal}.`,
    },
  },
  en: {
    app: {
      title: 'Dungeon Master AI',
      subtitle: 'Create your hero, choose a tone, and begin your campaign.',
      send: 'Send action',
      start: 'Begin campaign',
      newCampaign: 'New campaign',
      loadingSavedCampaigns: 'Loading saved adventures...',
      savedCampaignsLabel: (count) => `${count} saved campaign(s)`,
    },
    entry: {
      title: 'No saved adventure',
      message: 'No saved adventure found. Shall we start one?',
      startButton: 'Start campaign',
    },
    setup: {
      title: 'Character Sheet',
      nameLabel: 'Name',
      classLabel: 'Class',
      backgroundLabel: 'Background',
      goalLabel: 'Goal',
      tagsLabel: 'Campaign theme (comma-separated tags)',
      namePlaceholder: 'Aria Tempest',
      classPlaceholder: 'Arcane Rogue',
      backgroundPlaceholder: 'Raised among forbidden cartographers, she stole a whispering map...',
      goalPlaceholder: 'Recover the lost family grimoire',
      tagsPlaceholder: 'dark fantasy, conspiracy, exploration',
      loadingStart: 'Summoning the master...',
    },
    journey: {
      title: 'Journey',
      masterLabel: 'Master',
      playerLabel: 'Player',
      typingLabel: 'The master is preparing the scene...',
      actionPlaceholder: 'Describe your action...',
    },
    prompt: {
      opening: (sheet) =>
        `Start my campaign. Character: ${sheet.name}, ${sheet.klass}. Background: ${sheet.background}. Goal: ${sheet.goal}.`,
    },
  },
  es: {
    app: {
      title: 'Maestro de Calabozos IA',
      subtitle: 'Crea tu heroe, define el tono y comienza tu campana.',
      send: 'Enviar accion',
      start: 'Comenzar campana',
      newCampaign: 'Nueva campana',
      loadingSavedCampaigns: 'Cargando aventuras guardadas...',
      savedCampaignsLabel: (count) => `${count} campana(s) guardada(s)`,
    },
    entry: {
      title: 'No hay aventura guardada',
      message: 'No hay aventura guardada. Quieres empezar una?',
      startButton: 'Comenzar campana',
    },
    setup: {
      title: 'Ficha del Personaje',
      nameLabel: 'Nombre',
      classLabel: 'Clase',
      backgroundLabel: 'Historia',
      goalLabel: 'Objetivo',
      tagsLabel: 'Tema de la campana (etiquetas separadas por comas)',
      namePlaceholder: 'Aria Tempest',
      classPlaceholder: 'Picara Arcana',
      backgroundPlaceholder: 'Crecio entre cartografos prohibidos y robo un mapa que susurra...',
      goalPlaceholder: 'Recuperar el grimorio perdido de su familia',
      tagsPlaceholder: 'fantasia oscura, conspiracion, exploracion',
      loadingStart: 'Invocando al maestro...',
    },
    journey: {
      title: 'Jornada',
      masterLabel: 'Maestro',
      playerLabel: 'Jugador',
      typingLabel: 'El maestro esta preparando la escena...',
      actionPlaceholder: 'Describe tu accion...',
    },
    prompt: {
      opening: (sheet) =>
        `Inicia mi campana. Personaje: ${sheet.name}, ${sheet.klass}. Historia: ${sheet.background}. Objetivo: ${sheet.goal}.`,
    },
  },
}

export const getCopy = (language: Lang) => COPY[language]
