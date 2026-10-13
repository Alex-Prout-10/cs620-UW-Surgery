import { runSafetyScopeRouter } from './agents';
import type { PipelineTrace } from './schemas';

export type PipelineOutcome =
  | { action: 'proceed'; trace: PipelineTrace }
  | { action: 'block'; reason: string; trace: PipelineTrace }
  | { action: 'medical_emergency'; reason: string; trace: PipelineTrace }
  | { action: 'self_harm_crisis'; reason: string; trace: PipelineTrace }
  | { action: 'clarify'; question: string; trace: PipelineTrace }
  | { action: 'unavailable'; trace: PipelineTrace };

function canAnswerOrResolveFromContext(
  userMessage: string,
  recentConversation: string[]
) {
  const message = userMessage.trim();
  const hasQuestionShape =
    /[?？]/.test(message) ||
    /^(how|what|why|when|where|who|can|could|do|does|did|is|are|will|would|should|explain|tell me)\b/i.test(message) ||
    /\b(?:wondering|curious)\b.*\b(?:how|what|why|when|where|who)\b/i.test(message);

  const lastNavigatorMessage = [...recentConversation]
    .reverse()
    .find((entry) => entry.startsWith('Navigator:'));
  const isMeaningfulClarificationReply =
    message.length >= 12 &&
    !!lastNavigatorMessage &&
    /\b(?:what specific|what information|what are you looking for|could you clarify|can you clarify|tell me more)\b/i.test(
      lastNavigatorMessage
    );

  return hasQuestionShape || isMeaningfulClarificationReply;
}

export async function runAgentPipeline(
  rawQuery: string,
  recentConversation: string[] = []
): Promise<PipelineOutcome> {
  const routing = await runSafetyScopeRouter(rawQuery, recentConversation);

  // Fail closed: a router outage must not allow a normal model-generated
  // medical answer to bypass safety and scope handling.
  if (!routing) return { action: 'unavailable', trace: { gatekeeper: null, analyzer: null, scope: null } };

  const trace: PipelineTrace = {
    gatekeeper: { category: routing.category, reason: routing.reason },
    analyzer: null,
    scope: {
      in_scope: routing.in_scope,
      needs_clarification: routing.needs_clarification,
      clarification_question: routing.clarification_question,
      reason: routing.reason
    }
  };

  if (routing.category === 'self_harm_crisis') {
    return { action: 'self_harm_crisis', reason: routing.reason, trace };
  }

  if (routing.category === 'medical_emergency') {
    return { action: 'medical_emergency', reason: routing.reason, trace };
  }

  if (routing.category === 'harmful') {
    return { action: 'block', reason: routing.reason, trace };
  }

  if (!routing.in_scope) {
    return { action: 'block', reason: routing.reason, trace };
  }

  if (routing.needs_clarification && routing.clarification_question) {
    if (canAnswerOrResolveFromContext(rawQuery, recentConversation)) {
      if (trace.scope) {
        trace.scope = {
          ...trace.scope,
          needs_clarification: false,
          clarification_question: null,
          reason: 'Proceeding because the question is answerable from its wording or recent clarification context.'
        };
      }
      return { action: 'proceed', trace };
    }
    return { action: 'clarify', question: routing.clarification_question, trace };
  }

  return { action: 'proceed', trace };
}
