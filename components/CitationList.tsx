import type { AssistantTurn } from '@/lib/schemas';
import { parseCitationKey } from '@/lib/citationUtils';

type CitationListProps = {
  citations: AssistantTurn['citations'];
  leadSentences?: Record<string, string>;
};

export default function CitationList({ citations, leadSentences }: CitationListProps) {
  if (!citations.length) return null;

  return (
    <div>
      <div className="font-semibold text-darkgray">Sources</div>
      <ul className="mt-2 flex flex-wrap gap-2">
        {citations.map((item, index) => {
          const parsed = parseCitationKey(item.citation_key);
          if (!parsed) {
            return (
              <li key={`${item.citation_key}-${item.quote ?? 'none'}`} className="text-xs">
                <span className="mr-2 font-semibold text-uwred">[{index + 1}]</span>
                {item.citation_key}
              </li>
            );
          }

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
    </div>
  );
}
