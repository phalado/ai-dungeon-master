import type { FormEvent } from 'react';
import type { ChatMessage, Lang } from '../types';
import type { COPY } from '../constants/copy';

type JourneyScreenProps = {
  history: ChatMessage[];
  actionInput: string;
  isLoading: boolean;
  error: string;
  sendLabel: string;
  pendingRollNotation: string | null;
  dicePanelTitle: string;
  noPendingRollLabel: string;
  pendingRollLabel: string;
  lastRollLabel: string;
  lastRollOutput: string | null;
  hasSavedRollForPending: boolean;
  alreadyRolledLabel: string;
  rollNowLabel: string;
  useSavedRollLabel: string;
  rollingLabel: string;
  onRollDice: () => void;
  journeyCopy: (typeof COPY)[Lang]['journey'];
  onActionInputChange: (value: string) => void;
  onSubmitAction: (event: FormEvent) => void;
};

const inputClass =
  'w-full rounded-xl border border-stone-300 bg-[#fbf7ef] px-3 py-2.5 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20';

const buttonClass =
  'inline-flex items-center justify-center rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60';

export const JourneyScreen = ({
  history,
  actionInput,
  isLoading,
  error,
  sendLabel,
  pendingRollNotation,
  dicePanelTitle,
  noPendingRollLabel,
  pendingRollLabel,
  lastRollLabel,
  lastRollOutput,
  hasSavedRollForPending,
  alreadyRolledLabel,
  rollNowLabel,
  useSavedRollLabel,
  rollingLabel,
  onRollDice,
  journeyCopy,
  onActionInputChange,
  onSubmitAction,
}: JourneyScreenProps) => {
  return (
    <section
      className="grid gap-3 rounded-[22px] border border-amber-950/15 bg-[rgba(255,250,240,0.84)] p-5 shadow-[0_16px_32px_-20px_rgba(31,31,31,0.15)] backdrop-blur md:p-6"
      aria-label="Adventure chat"
    >
      <h2 className="font-display text-3xl text-stone-950 md:text-4xl">{journeyCopy.title}</h2>

      <article className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-3">
        <h3 className="mb-2 font-sans text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-emerald-800">
          {dicePanelTitle}
        </h3>

        {pendingRollNotation ? (
          <>
            <p className="mb-1 text-sm text-emerald-900">{pendingRollLabel}</p>
            {hasSavedRollForPending && (
              <p className="mb-2 text-xs font-semibold text-emerald-800">{alreadyRolledLabel}</p>
            )}
            <button
              type="button"
              onClick={onRollDice}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? rollingLabel : hasSavedRollForPending ? useSavedRollLabel : rollNowLabel}
            </button>
          </>
        ) : (
          <p className="text-sm text-emerald-900">{noPendingRollLabel}</p>
        )}

        {lastRollOutput && (
          <p className="mt-3 text-xs text-emerald-900">
            <span className="font-semibold">{lastRollLabel}:</span> {lastRollOutput}
          </p>
        )}
      </article>

      <div className="grid max-h-[50vh] min-h-[280px] gap-2.5 overflow-auto pr-1">
        {history.map((message, index) => (
          <article
            key={`${message.role}-${index}`}
            className={`rounded-xl border px-3 py-3 ${
              message.role === 'assistant'
                ? 'border-slate-300 bg-slate-100/90'
                : 'border-amber-200 bg-amber-50/95'
            }`}
          >
            <h3 className="mb-1.5 font-sans text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-stone-700">
              {message.role === 'assistant' ? journeyCopy.masterLabel : journeyCopy.playerLabel}
            </h3>
            <p className="whitespace-pre-wrap text-sm text-stone-800 md:text-[0.95rem]">
              {message.content}
            </p>
          </article>
        ))}

        {isLoading && <p className="text-sm text-stone-600">{journeyCopy.typingLabel}</p>}

        {error && <p className="text-sm text-red-800">{error}</p>}
      </div>

      <form className="grid gap-2 md:grid-cols-[1fr_auto]" onSubmit={onSubmitAction}>
        <input
          className={inputClass}
          value={actionInput}
          onChange={(event) => onActionInputChange(event.target.value)}
          placeholder={journeyCopy.actionPlaceholder}
          disabled={isLoading || Boolean(pendingRollNotation)}
        />
        <button
          className={buttonClass}
          type="submit"
          disabled={isLoading || Boolean(pendingRollNotation) || !actionInput.trim()}
        >
          {sendLabel}
        </button>
      </form>
    </section>
  );
};
