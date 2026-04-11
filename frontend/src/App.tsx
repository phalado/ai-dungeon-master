import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { DiceRoll } from '@dice-roller/rpg-dice-roller';
import { CampaignEntryState } from './components/CampaignEntryState';
import { CampaignSetupForm } from './components/CampaignSetupForm';
import { getCopy } from './constants/copy';
import { JourneyScreen } from './components/JourneyScreen';
import type { Campaign, CharacterSheet, ChatMessage, DiceRollPayload, Lang } from './types';

import braFlag from './assets/bra.svg';
import usaFlag from './assets/eua.svg';
import espFlag from './assets/spain.svg';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);
const CAMPAIGNS_STORAGE_KEY = 'ai-dungeon-master:campaigns';
const ROLL_MARKER_PATTERN = /\[\[ROLL:\s*([^\]]+)\s*\]\]/i;
const DICE_RESULTS_COOKIE = 'ai_dungeon_dice_results';

const emptySheet: CharacterSheet = {
  name: '',
  klass: '',
  background: '',
  goal: '',
};

const buildEmptyCampaign = (language: Lang): Campaign => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    language,
    tags: [],
    sheet: emptySheet,
    history: [],
  };
};

const normalizeTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) {
    return tags.filter((tag): tag is string => typeof tag === 'string');
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

const loadSavedCampaigns = (): Campaign[] => {
  try {
    const raw = window.localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((campaign) => campaign && typeof campaign.id === 'string')
      .map((campaign) => ({
        ...campaign,
        tags: normalizeTags(campaign.tags),
      })) as Campaign[];
  } catch {
    return [];
  }
};

const sortByLatest = (campaigns: Campaign[]): Campaign[] => {
  return [...campaigns].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
};

type StoredDiceResult = {
  notation: string;
  output: string;
  total?: number;
  timestamp: string;
};

type DiceCookieStore = Record<string, StoredDiceResult>;

const readDiceResultsCookie = (): DiceCookieStore => {
  if (typeof document === 'undefined') return {};

  const pair = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${DICE_RESULTS_COOKIE}=`));

  if (!pair) return {};

  const value = pair.substring(DICE_RESULTS_COOKIE.length + 1);

  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    return typeof parsed === 'object' && parsed ? (parsed as DiceCookieStore) : {};
  } catch {
    return {};
  }
};

const writeDiceResultsCookie = (store: DiceCookieStore) => {
  if (typeof document === 'undefined') return;

  const encoded = encodeURIComponent(JSON.stringify(store));
  document.cookie = `${DICE_RESULTS_COOKIE}=${encoded}; path=/; max-age=2592000; SameSite=Lax`;
};

const extractRollRequest = (reply: string): { cleanReply: string; diceNotation: string | null } => {
  const match = reply.match(ROLL_MARKER_PATTERN);
  const cleanReply = reply.replace(ROLL_MARKER_PATTERN, '').trim();

  if (!match) {
    return { cleanReply, diceNotation: null };
  }

  return {
    cleanReply,
    diceNotation: match[1].trim(),
  };
};

const formatCampaignDate = (value: string, language: Lang): string => {
  const localeMap: Record<Lang, string> = {
    'pt-br': 'pt-BR',
    en: 'en-US',
    es: 'es-ES',
  };

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return new Intl.DateTimeFormat(localeMap[language], {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsedDate);
};

const App = () => {
  const [view, setView] = useState<'boot' | 'empty' | 'setup' | 'journey'>('boot');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaign, setCampaign] = useState<Campaign>(() => buildEmptyCampaign('pt-br'));
  const [actionInput, setActionInput] = useState('');
  const [pendingRollNotation, setPendingRollNotation] = useState<string | null>(null);
  const [diceResults, setDiceResults] = useState<DiceCookieStore>({});
  const [showCampaignSelector, setShowCampaignSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const language = campaign.language;
  const copy = getCopy(language);

  useEffect(() => {
    setDiceResults(readDiceResultsCookie());

    const existingCampaigns = sortByLatest(loadSavedCampaigns());
    setCampaigns(existingCampaigns);

    if (existingCampaigns.length > 0) {
      setCampaign(existingCampaigns[0]);
      setPendingRollNotation(null);
      setView('journey');
      return;
    }

    setView('empty');
  }, []);

  const canStart = useMemo(() => {
    return (
      campaign.sheet.name.trim().length > 1 &&
      campaign.sheet.klass.trim().length > 1 &&
      campaign.sheet.background.trim().length > 10
    );
  }, [campaign.sheet]);

  const latestSavedRoll = useMemo(() => {
    const values = Object.values(diceResults);
    if (values.length === 0) return null;

    return [...values].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
  }, [diceResults]);

  const upsertCampaign = (nextCampaign: Campaign) => {
    const stampedCampaign = { ...nextCampaign, updatedAt: new Date().toISOString() };
    const nextList = sortByLatest([
      stampedCampaign,
      ...campaigns.filter((currentCampaign) => currentCampaign.id !== stampedCampaign.id),
    ]);

    setCampaign(stampedCampaign);
    setCampaigns(nextList);
    window.localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(nextList));
  };

  const openSetup = () => {
    setError('');
    setActionInput('');
    setPendingRollNotation(null);
    setShowCampaignSelector(false);
    setCampaign(buildEmptyCampaign(campaign.language));
    setView('setup');
  };

  const loadCampaign = (selectedCampaign: Campaign) => {
    setError('');
    setActionInput('');
    setPendingRollNotation(null);
    setShowCampaignSelector(false);
    setCampaign(selectedCampaign);
    setView('journey');
  };

  const callDungeon = async (
    message: string,
    nextHistory: ChatMessage[],
    sourceCampaign: Campaign,
    roll?: DiceRollPayload,
  ) => {
    const response = await fetch(`${API_BASE_URL}/api/dungeon/act`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        character: {
          name: sourceCampaign.sheet.name,
          class: sourceCampaign.sheet.klass,
          background: sourceCampaign.sheet.background,
          goal: sourceCampaign.sheet.goal,
        },
        history: nextHistory,
        tags: sourceCampaign.tags,
        language: sourceCampaign.language,
        roll,
      }),
    });

    const payload = (await response.json()) as { reply?: string; error?: string };

    if (!response.ok) {
      throw new Error(payload.error || 'Falha ao gerar resposta da aventura.');
    }

    return payload.reply ?? '';
  };

  const processMasterReply = (reply: string, baseHistory: ChatMessage[]): ChatMessage[] => {
    const { cleanReply, diceNotation } = extractRollRequest(reply);
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: cleanReply || reply,
    };

    setPendingRollNotation(diceNotation);
    return [...baseHistory, assistantMessage];
  };

  const storeDiceResult = (result: StoredDiceResult) => {
    const nextStore: DiceCookieStore = {
      ...diceResults,
      [result.notation]: result,
    };

    setDiceResults(nextStore);
    writeDiceResultsCookie(nextStore);
  };

  const resolveDiceFlow = async () => {
    if (!pendingRollNotation || isLoading) return;

    const sourceCampaign = { ...campaign };
    const diceNotation = pendingRollNotation;

    setIsLoading(true);
    setError('');

    try {
      const savedResult = diceResults[diceNotation];

      const roll = savedResult ? null : new DiceRoll(diceNotation);

      const rollOutput = savedResult ? savedResult.output : roll?.output || '';
      const rollTotal = savedResult ? savedResult.total : roll?.total;

      const rollPayload: DiceRollPayload = {
        notation: diceNotation,
        output: rollOutput,
        total: rollTotal,
      };

      if (!savedResult) {
        storeDiceResult({
          notation: diceNotation,
          output: rollOutput,
          total: rollTotal,
          timestamp: new Date().toISOString(),
        });
      }

      const rollMessage: ChatMessage = {
        role: 'user',
        content: savedResult
          ? copy.dice.rollSavedResultMessage(diceNotation, rollOutput)
          : copy.dice.rollResultMessage(diceNotation, rollOutput),
      };

      const historyWithRoll = [...sourceCampaign.history, rollMessage];
      setCampaign({ ...sourceCampaign, history: historyWithRoll });

      const followUpReply = await callDungeon(
        rollMessage.content,
        historyWithRoll,
        sourceCampaign,
        rollPayload,
      );

      const finalHistory = processMasterReply(followUpReply, historyWithRoll);
      upsertCampaign({ ...sourceCampaign, history: finalHistory });
    } catch {
      const fallbackPayload: DiceRollPayload = {
        notation: diceNotation,
        externalFailed: true,
      };

      const fallbackMessage: ChatMessage = {
        role: 'user',
        content: copy.dice.rollFallbackMessage(diceNotation),
      };

      const historyWithFallback = [...sourceCampaign.history, fallbackMessage];
      setCampaign({ ...sourceCampaign, history: historyWithFallback });

      const followUpReply = await callDungeon(
        fallbackMessage.content,
        historyWithFallback,
        sourceCampaign,
        fallbackPayload,
      );

      const finalHistory = processMasterReply(followUpReply, historyWithFallback);
      upsertCampaign({ ...sourceCampaign, history: finalHistory });
    } finally {
      setIsLoading(false);
    }
  };

  const startAdventure = async () => {
    if (campaign.tags.length < 1 || campaign.tags.length > 3) {
      setError(copy.setup.tagsValidation);
      return;
    }

    setError('');
    setPendingRollNotation(null);
    setIsLoading(true);

    const sourceCampaign = { ...campaign };
    const openingPrompt = copy.prompt.opening(sourceCampaign.sheet);

    const userMessage: ChatMessage = { role: 'user', content: openingPrompt };
    const draftHistory = [userMessage];
    setCampaign({ ...sourceCampaign, history: draftHistory });

    try {
      const reply = await callDungeon(openingPrompt, draftHistory, sourceCampaign);
      const finalHistory = processMasterReply(reply, draftHistory);

      const updatedCampaign = {
        ...sourceCampaign,
        history: finalHistory,
      };
      upsertCampaign(updatedCampaign);
      setView('journey');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
      setCampaign(sourceCampaign);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAction = async (event: FormEvent) => {
    event.preventDefault();
    if (!actionInput.trim() || isLoading) return;

    const sourceCampaign = { ...campaign };
    const userAction: ChatMessage = { role: 'user', content: actionInput.trim() };
    const nextHistory = [...sourceCampaign.history, userAction];

    setIsLoading(true);
    setError('');
    setPendingRollNotation(null);
    setActionInput('');
    setCampaign({ ...sourceCampaign, history: nextHistory });

    try {
      const reply = await callDungeon(userAction.content, nextHistory, sourceCampaign);
      const finalHistory = processMasterReply(reply, nextHistory);

      upsertCampaign({
        ...sourceCampaign,
        history: finalHistory,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
      setCampaign(sourceCampaign);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedLanguageClasses =
    'bg-slate-600 text-stone-50 hover:bg-slate-600 border-2 border-amber-500';

  return (
    <main className="relative mx-auto grid min-h-screen max-w-6xl gap-5 overflow-hidden px-4 py-4 md:px-6 md:py-7">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,#f9d9a3_0%,transparent_34%),radial-gradient(circle_at_80%_10%,#9eb4c1_0%,transparent_36%),linear-gradient(130deg,#f3efe3_0%,#ece4d2_100%)]" />
      <div className="pointer-events-none fixed -left-20 -top-16 -z-10 h-[300px] w-[300px] rounded-full bg-[#f2a65a]/45 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-28 -right-24 -z-10 h-[380px] w-[380px] rounded-full bg-[#4f6d7a]/40 blur-3xl" />

      <header className="h-auto animate-[fade-in_0.45s_ease-out] rounded-[22px] border border-amber-950/15 bg-[rgba(255,250,240,0.84)] p-5 shadow-[0_16px_32px_-20px_rgba(31,31,31,0.15)] backdrop-blur md:p-6">
        <p className="mb-3 inline-block rounded-full bg-[#f2a65a] px-3 py-1 text-[0.72rem] uppercase tracking-[0.2em] text-stone-950">
          AI Tabletop Story Engine
        </p>
        <h1 className="mb-2 font-display text-4xl leading-none text-stone-950 md:text-6xl">
          {copy.app.title}
        </h1>
        <p className="max-w-2xl text-sm text-stone-700 md:text-base">{copy.app.subtitle}</p>

        {view === 'journey' && (
          <div className="relative mt-4 flex flex-wrap gap-2">
            <button
              className="inline-flex items-center justify-center rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-semibold text-stone-50 transition hover:bg-stone-800"
              type="button"
              onClick={openSetup}
            >
              {copy.app.newCampaign}
            </button>

            {campaigns.length > 1 && (
              <button
                className="inline-flex items-center justify-center rounded-xl border border-stone-400 bg-white/70 px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-white"
                type="button"
                onClick={() => setShowCampaignSelector((current) => !current)}
              >
                {copy.app.loadCampaign}
              </button>
            )}

            <p className="self-center text-sm text-stone-600">
              {copy.app.savedCampaignsLabel(campaigns.length)}
            </p>

            {showCampaignSelector && campaigns.length > 1 && (
              <div className="absolute left-0 top-full z-20 mt-2 w-full max-w-xl rounded-xl border border-stone-300 bg-[#fffaf0] p-3 shadow-lg">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                  {copy.app.selectCampaignTitle}
                </p>

                <div className="grid gap-2">
                  {campaigns.map((savedCampaign) => {
                    const isCurrent = savedCampaign.id === campaign.id;

                    return (
                      <button
                        key={savedCampaign.id}
                        type="button"
                        onClick={() => loadCampaign(savedCampaign)}
                        className={`flex w-full items-start justify-between rounded-lg border px-3 py-2 text-left transition ${
                          isCurrent
                            ? 'border-slate-600 bg-slate-100'
                            : 'border-stone-300 bg-white hover:bg-stone-50'
                        }`}
                      >
                        <span className="mr-3 text-sm text-stone-800">
                          {savedCampaign.sheet.name || copy.app.unnamedCampaign}
                        </span>
                        <span className="shrink-0 text-xs text-stone-500">
                          {formatCampaignDate(savedCampaign.updatedAt, language)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2 opacity-80">
          <img
            src={braFlag}
            alt="Brazil Flag"
            className={`size-10 rounded-full border ${language === 'pt-br' ? selectedLanguageClasses : 'cursor-pointer'}`}
            onClick={() => setCampaign({ ...campaign, language: 'pt-br' })}
          />
          <img
            src={usaFlag}
            alt="USA Flag"
            className={`size-10 rounded-full border ${language === 'en' ? selectedLanguageClasses : 'cursor-pointer'}`}
            onClick={() => setCampaign({ ...campaign, language: 'en' })}
          />
          <img
            src={espFlag}
            alt="Spain Flag"
            className={`size-10 rounded-full border ${language === 'es' ? selectedLanguageClasses : 'cursor-pointer'}`}
            onClick={() => setCampaign({ ...campaign, language: 'es' })}
          />
        </div>
      </header>

      {view === 'boot' && (
        <section className="rounded-[22px] border border-amber-950/15 bg-[rgba(255,250,240,0.84)] p-5 shadow-[0_16px_32px_-20px_rgba(31,31,31,0.15)] backdrop-blur md:p-6">
          <p className="text-sm text-stone-700">{copy.app.loadingSavedCampaigns}</p>
        </section>
      )}

      {view === 'empty' && (
        <CampaignEntryState
          title={copy.entry.title}
          message={copy.entry.message}
          startLabel={copy.entry.startButton}
          onStart={openSetup}
        />
      )}

      {view === 'setup' && (
        <CampaignSetupForm
          sheet={campaign.sheet}
          tags={campaign.tags}
          canStart={canStart}
          isLoading={isLoading}
          buttonLabel={copy.app.start}
          setupCopy={copy.setup}
          error={error}
          onSheetChange={(sheet) => setCampaign({ ...campaign, sheet })}
          onTagsChange={(tags) => setCampaign({ ...campaign, tags })}
          onStartAdventure={startAdventure}
        />
      )}

      {view === 'journey' && (
        <JourneyScreen
          history={campaign.history}
          actionInput={actionInput}
          pendingRollNotation={pendingRollNotation}
          dicePanelTitle={copy.dice.panelTitle}
          noPendingRollLabel={copy.dice.noPendingRoll}
          pendingRollLabel={
            pendingRollNotation
              ? copy.dice.pendingRollLabel(pendingRollNotation)
              : copy.dice.noPendingRoll
          }
          lastRollLabel={copy.dice.lastRollLabel}
          lastRollOutput={
            pendingRollNotation
              ? diceResults[pendingRollNotation]?.output || null
              : latestSavedRoll?.output || null
          }
          hasSavedRollForPending={Boolean(pendingRollNotation && diceResults[pendingRollNotation])}
          alreadyRolledLabel={copy.dice.alreadyRolledLabel}
          rollNowLabel={copy.dice.rollNowButton}
          useSavedRollLabel={copy.dice.useSavedRollButton}
          rollingLabel={copy.dice.rollingButton}
          onRollDice={resolveDiceFlow}
          isLoading={isLoading}
          error={error}
          sendLabel={copy.app.send}
          journeyCopy={copy.journey}
          onActionInputChange={setActionInput}
          onSubmitAction={submitAction}
        />
      )}
    </main>
  );
};

export default App;
