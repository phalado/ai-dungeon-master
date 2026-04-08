import type { CharacterSheet, Lang } from '../types';

type AppCopy = {
  title: string;
  subtitle: string;
  send: string;
  start: string;
  newCampaign: string;
  loadCampaign: string;
  selectCampaignTitle: string;
  unnamedCampaign: string;
  loadingSavedCampaigns: string;
  savedCampaignsLabel: (count: number) => string;
};

type EntryCopy = {
  title: string;
  message: string;
  startButton: string;
};

type SetupCopy = {
  title: string;
  nameLabel: string;
  classLabel: string;
  backgroundLabel: string;
  goalLabel: string;
  tagsLabel: string;
  tagsHint: string;
  tagsValidation: string;
  tagsSelectedCount: (count: number) => string;
  namePlaceholder: string;
  classPlaceholder: string;
  backgroundPlaceholder: string;
  goalPlaceholder: string;
  loadingStart: string;
};

type JourneyCopy = {
  title: string;
  masterLabel: string;
  playerLabel: string;
  typingLabel: string;
  actionPlaceholder: string;
};

type DiceCopy = {
  rollResultMessage: (notation: string, output: string) => string;
  rollSavedResultMessage: (notation: string, output: string) => string;
  rollFallbackMessage: (notation: string) => string;
  panelTitle: string;
  noPendingRoll: string;
  pendingRollLabel: (notation: string) => string;
  lastRollLabel: string;
  alreadyRolledLabel: string;
  pendingRollTitle: string;
  rollNowButton: string;
  useSavedRollButton: string;
  rollingButton: string;
};

type PromptCopy = {
  opening: (sheet: CharacterSheet) => string;
};

type CopySchema = {
  app: AppCopy;
  entry: EntryCopy;
  setup: SetupCopy;
  journey: JourneyCopy;
  dice: DiceCopy;
  prompt: PromptCopy;
};

export const COPY: Record<Lang, CopySchema> = {
  'pt-br': {
    app: {
      title: 'Mestre de Masmorra IA',
      subtitle: 'Crie seu heroi, escolha o tom e inicie sua campanha.',
      send: 'Enviar acao',
      start: 'Comecar campanha',
      newCampaign: 'Nova campanha',
      loadCampaign: 'Carregar campanha',
      selectCampaignTitle: 'Campanhas salvas',
      unnamedCampaign: 'Campanha sem nome',
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
      tagsLabel: 'Tema da campanha',
      tagsHint: 'Escolha de 1 a 3 chips.',
      tagsValidation: 'Selecione entre 1 e 3 temas para iniciar a campanha.',
      tagsSelectedCount: (count) => `${count}/3 selecionadas`,
      namePlaceholder: 'Aria Tempest',
      classPlaceholder: 'Ladina Arcana',
      backgroundPlaceholder: 'Cresceu entre cartografos proibidos e roubou um mapa que sussurra...',
      goalPlaceholder: 'Recuperar o grimorio da propria familia',
      loadingStart: 'Invocando o mestre...',
    },
    journey: {
      title: 'Jornada',
      masterLabel: 'Mestre',
      playerLabel: 'Jogador',
      typingLabel: 'O mestre esta preparando a cena...',
      actionPlaceholder: 'Descreva sua ação...',
    },
    dice: {
      rollResultMessage: (notation, output) =>
        `Rolagem automatica realizada (${notation}): ${output}. Continue a narracao com base nesse resultado.`,
      rollSavedResultMessage: (notation, output) =>
        `Resultado salvo aplicado (${notation}): ${output}. Continue a narracao com base nesse resultado.`,
      rollFallbackMessage: (notation) =>
        `Nao foi possivel realizar a rolagem externa para ${notation}. Faca a rolagem voce mesmo e informe claramente o resultado na narracao.`,
      panelTitle: 'Dados',
      noPendingRoll: 'Sem rolagem pendente no momento.',
      pendingRollLabel: (notation) => `Rolagem pedida: ${notation}`,
      lastRollLabel: 'Ultimo resultado',
      alreadyRolledLabel: 'Esse dado ja foi rolado e esta salvo em cookie.',
      pendingRollTitle: 'Teste requerido pelo mestre',
      rollNowButton: 'Rolar agora',
      useSavedRollButton: 'Usar resultado salvo',
      rollingButton: 'Rolando...',
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
      loadCampaign: 'Load campaign',
      selectCampaignTitle: 'Saved campaigns',
      unnamedCampaign: 'Unnamed campaign',
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
      tagsLabel: 'Campaign theme',
      tagsHint: 'Pick between 1 and 3 chips.',
      tagsValidation: 'Select between 1 and 3 themes before starting your campaign.',
      tagsSelectedCount: (count) => `${count}/3 selected`,
      namePlaceholder: 'Aria Tempest',
      classPlaceholder: 'Arcane Rogue',
      backgroundPlaceholder: 'Raised among forbidden cartographers, she stole a whispering map...',
      goalPlaceholder: 'Recover the lost family grimoire',
      loadingStart: 'Summoning the master...',
    },
    journey: {
      title: 'Journey',
      masterLabel: 'Master',
      playerLabel: 'Player',
      typingLabel: 'The master is preparing the scene...',
      actionPlaceholder: 'Describe your action...',
    },
    dice: {
      rollResultMessage: (notation, output) =>
        `Automatic roll completed (${notation}): ${output}. Continue the narration based on this result.`,
      rollSavedResultMessage: (notation, output) =>
        `Saved result applied (${notation}): ${output}. Continue the narration based on this result.`,
      rollFallbackMessage: (notation) =>
        `External roll for ${notation} could not be completed. Roll it yourself and clearly state the result in your narration.`,
      panelTitle: 'Dice',
      noPendingRoll: 'No pending roll right now.',
      pendingRollLabel: (notation) => `Requested roll: ${notation}`,
      lastRollLabel: 'Last result',
      alreadyRolledLabel: 'This roll was already made and saved in cookies.',
      pendingRollTitle: 'Roll requested by the master',
      rollNowButton: 'Roll now',
      useSavedRollButton: 'Use saved result',
      rollingButton: 'Rolling...',
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
      loadCampaign: 'Cargar campana',
      selectCampaignTitle: 'Campanas guardadas',
      unnamedCampaign: 'Campana sin nombre',
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
      tagsLabel: 'Tema de la campana',
      tagsHint: 'Elige entre 1 y 3 chips.',
      tagsValidation: 'Selecciona entre 1 y 3 temas para comenzar la campana.',
      tagsSelectedCount: (count) => `${count}/3 seleccionadas`,
      namePlaceholder: 'Aria Tempest',
      classPlaceholder: 'Picara Arcana',
      backgroundPlaceholder: 'Crecio entre cartografos prohibidos y robo un mapa que susurra...',
      goalPlaceholder: 'Recuperar el grimorio perdido de su familia',
      loadingStart: 'Invocando al maestro...',
    },
    journey: {
      title: 'Jornada',
      masterLabel: 'Maestro',
      playerLabel: 'Jugador',
      typingLabel: 'El maestro esta preparando la escena...',
      actionPlaceholder: 'Describe tu accion...',
    },
    dice: {
      rollResultMessage: (notation, output) =>
        `Tirada automatica completada (${notation}): ${output}. Continua la narracion con base en este resultado.`,
      rollSavedResultMessage: (notation, output) =>
        `Resultado guardado aplicado (${notation}): ${output}. Continua la narracion con base en este resultado.`,
      rollFallbackMessage: (notation) =>
        `No se pudo completar la tirada externa para ${notation}. Haz la tirada tu mismo e informa claramente el resultado en la narracion.`,
      panelTitle: 'Dados',
      noPendingRoll: 'Sin tirada pendiente por ahora.',
      pendingRollLabel: (notation) => `Tirada solicitada: ${notation}`,
      lastRollLabel: 'Ultimo resultado',
      alreadyRolledLabel: 'Esta tirada ya se realizo y quedo guardada en cookies.',
      pendingRollTitle: 'Tirada solicitada por el maestro',
      rollNowButton: 'Tirar ahora',
      useSavedRollButton: 'Usar resultado guardado',
      rollingButton: 'Tirando...',
    },
    prompt: {
      opening: (sheet) =>
        `Inicia mi campana. Personaje: ${sheet.name}, ${sheet.klass}. Historia: ${sheet.background}. Objetivo: ${sheet.goal}.`,
    },
  },
};

export const getCopy = (language: Lang) => COPY[language];
