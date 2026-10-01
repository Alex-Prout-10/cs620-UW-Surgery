import { beforeEach, describe, expect, it, vi } from 'vitest';

const { runSafetyScopeRouterMock } = vi.hoisted(() => ({
  runSafetyScopeRouterMock: vi.fn()
}));

vi.mock('@/lib/agents/agents', () => ({
  runSafetyScopeRouter: runSafetyScopeRouterMock
}));

import { runAgentPipeline } from '@/lib/agents/pipeline';

describe('safety and scope router pipeline', () => {
  beforeEach(() => runSafetyScopeRouterMock.mockReset());

  it('uses one router call and proceeds for an in-scope question', async () => {
    runSafetyScopeRouterMock.mockResolvedValue({
      category: 'safe',
      reason: 'Adrenal nodule question',
      in_scope: true,
      needs_clarification: false,
      clarification_question: null
    });

    const outcome = await runAgentPipeline('What does my CT scan mean?');

    expect(runSafetyScopeRouterMock).toHaveBeenCalledTimes(1);
    expect(outcome.action).toBe('proceed');
  });

  it('routes self-harm to crisis handling', async () => {
    runSafetyScopeRouterMock.mockResolvedValue({
      category: 'self_harm_crisis',
      reason: 'Suicidal thoughts',
      in_scope: false,
      needs_clarification: false,
      clarification_question: null
    });

    const outcome = await runAgentPipeline('I do not want to live');

    expect(runSafetyScopeRouterMock).toHaveBeenCalledTimes(1);
    expect(outcome.action).toBe('self_harm_crisis');
  });

  it('blocks out-of-scope questions without proceeding to answer generation', async () => {
    runSafetyScopeRouterMock.mockResolvedValue({
      category: 'safe',
      reason: 'Unrelated topic',
      in_scope: false,
      needs_clarification: false,
      clarification_question: null
    });

    const outcome = await runAgentPipeline('How do I bake sourdough?');

    expect(outcome.action).toBe('block');
    expect(runSafetyScopeRouterMock).toHaveBeenCalledTimes(1);
  });

  it('fails closed if the router is unavailable', async () => {
    runSafetyScopeRouterMock.mockResolvedValue(null);

    const outcome = await runAgentPipeline('What tests might my doctor order?');

    expect(outcome.action).toBe('unavailable');
    expect(runSafetyScopeRouterMock).toHaveBeenCalledTimes(1);
  });
});
