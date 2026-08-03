import { z } from 'zod';

export const ModeEnum = z.enum(['faq', 'guided_intake', 'plan_summary', 'triage']);
export const TriageEnum = z.enum(['none', 'contact_clinic', 'urgent', 'emergency']);

//removed 6 UI cards (check previous version)
export const CardTypeEnum = z.enum(['questions_to_ask']);

export const ActionTypeEnum = z.enum(['quick_reply', 'navigate', 'share_summary']);

//removed a the ZOD schema for the removed UI cardtypes
export const CardContentSchema = z.object({
  questions: z.array(z.string())
});

export const UiCardSchema = z.object({
  type: CardTypeEnum,
  title: z.string(),
  content: CardContentSchema
});

//removed disclaimer output on every prompt
export const AssistantTurnSchema = z.object({
  mode: ModeEnum,
  assistant_message: z.string(),
  citations: z.array(
    z.object({
      citation_key: z.string(),
      quote: z.string().nullable()
    })
  ),
  ui_cards: z.array(UiCardSchema),
  suggested_actions: z.array(
    z.object({
      label: z.string(),
      action_type: ActionTypeEnum,
      payload: z.object({
        href: z.string().nullable(),
        value: z.string().nullable()
      })
    })
  ),
  triage_level: TriageEnum
});

export type AssistantTurn = z.infer<typeof AssistantTurnSchema>;
export const RouteDecisionSchema = z.object({
  mode: ModeEnum,
  triage_level: TriageEnum,
  cards: z.array(CardTypeEnum)
});

export type RouteDecision = z.infer<typeof RouteDecisionSchema>;

// removed the "disclaimer" property entirely.
// removed "ui_cards.content" properties to only look for questions
export const AssistantTurnJsonSchema = {
  name: 'assistant_turn',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      mode: { type: 'string', enum: ModeEnum.options },
      assistant_message: { type: 'string' },
      // Disclaimer property deleted from here
      citations: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            citation_key: { type: 'string' },
            quote: { type: ['string', 'null'] }
          },
          required: ['citation_key', 'quote']
        }
      },
      ui_cards: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            type: { type: 'string', enum: CardTypeEnum.options },
            title: { type: 'string' },
            content: {
              type: 'object',
              additionalProperties: false,
              properties: {
                questions: { type: 'array', items: { type: 'string' } }
              },
              required: ['questions'] // requiring questions now
            }
          },
          required: ['type', 'title', 'content']
        }
      },
      suggested_actions: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            label: { type: 'string' },
            action_type: { type: 'string', enum: ActionTypeEnum.options },
            payload: {
              type: 'object',
              additionalProperties: false,
              properties: {
                href: { type: ['string', 'null'] },
                value: { type: ['string', 'null'] }
              },
              required: ['href', 'value']
            }
          },
          required: ['label', 'action_type', 'payload']
        }
      },
      triage_level: { type: 'string', enum: TriageEnum.options }
    },
    // Disclaimer removed from the required array
    required: [
      'mode',
      'assistant_message',
      'citations',
      'ui_cards',
      'suggested_actions',
      'triage_level'
    ]
  }
} as const;

export const RouteDecisionJsonSchema = {
  name: 'route_decision',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      mode: { type: 'string', enum: ModeEnum.options },
      triage_level: { type: 'string', enum: TriageEnum.options },
      cards: { type: 'array', items: { type: 'string', enum: CardTypeEnum.options } }
    },
    required: ['mode', 'triage_level', 'cards']
  }
} as const;