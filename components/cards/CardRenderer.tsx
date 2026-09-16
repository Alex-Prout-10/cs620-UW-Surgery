
import type { AssistantTurn } from '@/lib/schemas';
import QuestionsToAskCard from '@/components/cards/QuestionsToAskCard';

export default function CardRenderer({
  card,
  onQuickReply,
  onSymptomSubmit,
  onShareSummary,
  selectedSymptoms,
  config
}: {
  card: AssistantTurn['ui_cards'][number];
  onQuickReply?: (question: string) => void;
  onSymptomSubmit?: (symptoms: string[]) => void;
  onShareSummary?: () => void;
  selectedSymptoms?: string[];
  config?: {
    billing_phone?: string | null;
    scheduling_link?: string | null;
    what_to_bring?: string | null;
    emergency_guidance?: string | null;
  };
}) {
  switch (card.type) {
    case 'questions_to_ask':
      return <QuestionsToAskCard questions={card.content.questions} onSelect={onQuickReply} />;
    default:
      return null;
  }
}
