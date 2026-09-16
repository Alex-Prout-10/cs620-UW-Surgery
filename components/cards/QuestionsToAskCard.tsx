export default function QuestionsToAskCard({
  questions,
  onSelect,
}: {
  questions: string[];
  onSelect?: (question: string) => void;
}) {
  if (questions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onSelect?.(question)}
          className="rounded-full border border-uwred/25 bg-uwred/[0.03] px-3 py-1.5 text-left text-xs font-semibold text-darkgray transition hover:border-uwred hover:bg-uwred hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-uwred focus-visible:ring-offset-2"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
