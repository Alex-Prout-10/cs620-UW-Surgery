import { beforeEach, describe, expect, it, vi } from 'vitest';

const { responsesCreateMock } = vi.hoisted(() => ({
  responsesCreateMock: vi.fn()
}));

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    responses: { create: responsesCreateMock }
  }))
}));

import { runSafetyScopeRouter } from '@/lib/agents/agents';

describe('runSafetyScopeRouter', () => {
  beforeEach(() => {
    responsesCreateMock.mockReset();
    vi.stubEnv('OPENAI_API_KEY', 'test-key');
  });

  it('makes one structured model call that returns both safety and scope', async () => {
    responsesCreateMock.mockResolvedValue({
      output_text: JSON.stringify({
        category: 'safe',
        reason: 'Question is about adrenal testing',
        in_scope: true,
        needs_clarification: false,
        clarification_question: null
      })
    });

    const result = await runSafetyScopeRouter('What is this hormone test checking?');

    expect(responsesCreateMock).toHaveBeenCalledTimes(1);
    expect(responsesCreateMock.mock.calls[0][0].text.format.name).toBe(
      'safety_scope_router_result'
    );
    expect(result).toEqual({
      category: 'safe',
      reason: 'Question is about adrenal testing',
      in_scope: true,
      needs_clarification: false,
      clarification_question: null
    });
  });
});
