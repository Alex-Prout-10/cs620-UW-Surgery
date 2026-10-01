export default function QuestionsToAskCard({
  questions,
  onSelect,
}: {
  questions: string[];
  onSelect?: (question: string) => void;
}) {
  if (questions.length === 0) return null;

  return (
    <section
      aria-label="Follow-up questions"
      className="rounded-2xl border border-accent/60 bg-white/70 p-3"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-darkgray">
          Follow-up questions
        </h3>
        <span className="text-[0.6875rem] text-muted">Scroll to browse</span>
      </div>
      <div
        aria-label="Browse follow-up questions"
        className="common-questions-scroller flex gap-2 overflow-x-auto pb-1.5"
        role="region"
        tabIndex={0}
      >
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onSelect?.(question)}
            className="shrink-0 snap-start rounded-full border border-uwred/25 bg-uwred/[0.03] px-3 py-1.5 text-left text-xs font-semibold text-darkgray transition hover:border-uwred hover:bg-uwred hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-uwred focus-visible:ring-offset-2"
          >
            {question}
          </button>
        ))}
      </div>
    </section>
  );
}
