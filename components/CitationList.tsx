import type { AssistantTurn } from '@/lib/schemas';
import { parseCitationKey } from '@/lib/citationUtils';

type CitationListProps = {
  citations: AssistantTurn['citations'];
  leadSentences?: Record<string, string>;
};

export default function CitationList({ citations, leadSentences }: CitationListProps) {
  const databaseCitations = citations.filter((item) => parseCitationKey(item.citation_key));
  if (!databaseCitations.length) return null;

  return (
    <details className="group w-fit max-w-full rounded-xl border border-accent/70 bg-white/70 px-3 py-2">
      <summary className="cursor-pointer list-none text-xs font-semibold text-darkgray marker:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-uwred focus-visible:ring-offset-2">
        <span className="inline-flex items-center gap-2">
          Sources
          <span className="rounded-full bg-uwred/[0.08] px-1.5 py-0.5 text-[10px] font-bold text-uwred">{databaseCitations.length}</span>
          <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-180">⌄</span>
        </span>
      </summary>
      <ul className="mt-2 flex flex-wrap gap-2">
        {databaseCitations.map((item, index) => {
          const parsed = parseCitationKey(item.citation_key);
          if (!parsed) return null;

          // Use the LLM quote if available, otherwise fall back to the
          // lead sentence from the chunk (which is verbatim from the PDF).
          const searchText = item.quote || leadSentences?.[item.citation_key] || '';

          const cardContent = (
            <>
              <span className="font-semibold text-uwred">[{index + 1}]</span>
              <span className="max-w-56 truncate font-medium text-darkgray">{parsed.displayTitle}</span>
              {parsed.pageLabel && <span className="text-muted">{parsed.pageLabel}</span>}
            </>
          );

          const viewerHref = parsed.viewerPath
            ? `${parsed.viewerPath}&chunkId=${encodeURIComponent(parsed.chunkId)}${searchText ? `&quote=${encodeURIComponent(searchText)}` : ''}`
            : '';

          return viewerHref ? (
            <li key={`${item.citation_key}-${item.quote ?? 'none'}`}>
              <a
                href={viewerHref}
                title={`Open ${parsed.displayTitle}${parsed.pageLabel ? `, ${parsed.pageLabel}` : ''}`}
                className="group inline-flex max-w-full items-center gap-1.5 rounded-full border border-accent/70 bg-white/80 px-3 py-1.5 text-xs transition hover:border-uwred hover:bg-uwred/[0.03]"
              >
                {cardContent}
              </a>
            </li>
          ) : (
            <li
              key={`${item.citation_key}-${item.quote ?? 'none'}`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-accent/70 bg-white/80 px-3 py-1.5 text-xs"
            >
              {cardContent}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
