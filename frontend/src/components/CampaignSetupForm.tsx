import type { CharacterSheet, Lang } from '../types';
import type { COPY } from '../constants/copy';
import { themeSugestion } from '../constants/themeSugestion';

type CampaignSetupFormProps = {
  sheet: CharacterSheet;
  tags: string[];
  isLoading: boolean;
  canStart: boolean;
  buttonLabel: string;
  setupCopy: (typeof COPY)[Lang]['setup'];
  error: string;
  onSheetChange: (sheet: CharacterSheet) => void;
  onTagsChange: (tags: string[]) => void;
  onStartAdventure: () => void;
};

const inputClass =
  'w-full rounded-xl border border-stone-300 bg-[#fbf7ef] px-3 py-2.5 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20';

const buttonClass =
  'inline-flex items-center justify-center rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60';

export const CampaignSetupForm = ({
  sheet,
  tags,
  isLoading,
  canStart,
  buttonLabel,
  setupCopy,
  error,
  onSheetChange,
  onTagsChange,
  onStartAdventure,
}: CampaignSetupFormProps) => {
  const toggleTag = (tag: string) => {
    const exists = tags.includes(tag);

    if (exists) {
      onTagsChange(tags.filter((currentTag) => currentTag !== tag));
      return;
    }

    if (tags.length >= 3) {
      return;
    }

    onTagsChange([...tags, tag]);
  };

  return (
    <section
      className="rounded-[22px] border border-amber-950/15 bg-[rgba(255,250,240,0.84)] p-5 shadow-[0_16px_32px_-20px_rgba(31,31,31,0.15)] backdrop-blur md:p-6"
      aria-label="Character setup"
    >
      <h2 className="mb-3 font-display text-3xl text-stone-950 md:text-4xl">{setupCopy.title}</h2>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm text-stone-700">
          {setupCopy.nameLabel}
          <input
            className={inputClass}
            value={sheet.name}
            onChange={(event) => onSheetChange({ ...sheet, name: event.target.value })}
            placeholder={setupCopy.namePlaceholder}
          />
        </label>

        <label className="grid gap-1.5 text-sm text-stone-700">
          {setupCopy.classLabel}
          <input
            className={inputClass}
            value={sheet.klass}
            onChange={(event) => onSheetChange({ ...sheet, klass: event.target.value })}
            placeholder={setupCopy.classPlaceholder}
          />
        </label>

        <label className="grid gap-1.5 text-sm text-stone-700 md:col-span-2">
          {setupCopy.backgroundLabel}
          <textarea
            className={inputClass}
            value={sheet.background}
            onChange={(event) => onSheetChange({ ...sheet, background: event.target.value })}
            placeholder={setupCopy.backgroundPlaceholder}
            rows={3}
          />
        </label>

        <label className="grid gap-1.5 text-sm text-stone-700 md:col-span-2">
          {setupCopy.goalLabel}
          <input
            className={inputClass}
            value={sheet.goal}
            onChange={(event) => onSheetChange({ ...sheet, goal: event.target.value })}
            placeholder={setupCopy.goalPlaceholder}
          />
        </label>

        <label className="grid gap-1.5 text-sm text-stone-700 md:col-span-2">
          {setupCopy.tagsLabel}
          <p className="text-xs text-stone-600">
            {setupCopy.tagsHint} {setupCopy.tagsSelectedCount(tags.length)}
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {themeSugestion.map((tag) => {
              const isSelected = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    isSelected
                      ? 'border-slate-700 bg-slate-700 text-stone-50'
                      : 'border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
      {!error && (tags.length < 1 || tags.length > 3) && (
        <p className="mt-3 text-sm text-red-800">{setupCopy.tagsValidation}</p>
      )}

      <button
        className={`${buttonClass} mt-4`}
        type="button"
        disabled={!canStart || isLoading}
        onClick={onStartAdventure}
      >
        {isLoading ? setupCopy.loadingStart : buttonLabel}
      </button>
    </section>
  );
};
