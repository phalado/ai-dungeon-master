type CampaignEntryStateProps = {
  title: string;
  message: string;
  startLabel: string;
  onStart: () => void;
};

export const CampaignEntryState = ({
  title,
  message,
  startLabel,
  onStart,
}: CampaignEntryStateProps) => {
  return (
    <section
      className="rounded-[22px] border border-amber-950/15 bg-[rgba(255,250,240,0.84)] p-5 shadow-[0_16px_32px_-20px_rgba(31,31,31,0.15)] backdrop-blur md:p-6 flex flex-col items-center justify-center text-center"
      aria-label="No saved campaign"
    >
      <h2 className="mb-2 font-display text-3xl text-stone-950 md:text-4xl">{title}</h2>
      <p className="text-sm text-stone-700 md:text-base">{message}</p>
      <button
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-400 disabled:text-stone-200"
        type="button"
        onClick={onStart}
      >
        {startLabel}
      </button>
    </section>
  );
};
