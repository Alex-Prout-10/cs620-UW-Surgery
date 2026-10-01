import { z } from 'zod';

// The router keeps the legacy trace shape while routing safety and scope once.
export const GatekeeperCategoryEnum = z.enum([
  'safe',
  'harmful',
  'medical_emergency',
  'self_harm_crisis'
]);

export const GatekeeperResultSchema = z.object({
  category: GatekeeperCategoryEnum,
  reason: z.string()
});
export type GatekeeperResult = z.infer<typeof GatekeeperResultSchema>;

// Legacy analyzer trace type retained for stored conversation compatibility.
export const QuestionTypeEnum = z.enum([
  'factual',
  'procedural',
  'diagnostic',
  'emotional',
  'comparison'
]);

export const AnalyzerResultSchema = z.object({
  intent: z.string(),
  type: QuestionTypeEnum
});
export type AnalyzerResult = z.infer<typeof AnalyzerResultSchema>;

// Legacy scope trace type retained for stored conversation compatibility.
export const ScopeResultSchema = z.object({
  in_scope: z.boolean(),
  needs_clarification: z.boolean(),
  clarification_question: z.string().nullable(),
  reason: z.string()
});
export type ScopeResult = z.infer<typeof ScopeResultSchema>;

// One structured result replaces the separate gatekeeper, analyzer, and scope
// model calls. Keep the legacy trace fields below so existing observability
// consumers can still read the routing result.
export const SafetyScopeRouterResultSchema = z.object({
  category: GatekeeperCategoryEnum,
  reason: z.string(),
  in_scope: z.boolean(),
  needs_clarification: z.boolean(),
  clarification_question: z.string().nullable()
});
export type SafetyScopeRouterResult = z.infer<typeof SafetyScopeRouterResultSchema>;

// --- Pipeline Trace (combined output for transparency) ---
export const PipelineTraceSchema = z.object({
  gatekeeper: GatekeeperResultSchema.nullable(),
  analyzer: AnalyzerResultSchema.nullable(),
  scope: ScopeResultSchema.nullable()
});
export type PipelineTrace = z.infer<typeof PipelineTraceSchema>;

// --- Single structured router result (OpenAI structured output) ---
export const SafetyScopeRouterJsonSchema = {
  name: 'safety_scope_router_result',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      category: { type: 'string', enum: GatekeeperCategoryEnum.options },
      reason: { type: 'string' },
      in_scope: { type: 'boolean' },
      needs_clarification: { type: 'boolean' },
      clarification_question: { type: ['string', 'null'] }
    },
    required: [
      'category',
      'reason',
      'in_scope',
      'needs_clarification',
      'clarification_question'
    ]
  }
} as const;
