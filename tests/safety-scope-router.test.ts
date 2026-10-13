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

  it('proceeds when the router over-asks clarification on a clear general question', async () => {
    runSafetyScopeRouterMock.mockResolvedValue({
      category: 'safe',
      reason: 'The question is broad',
      in_scope: true,
      needs_clarification: true,
      clarification_question: 'What specific aspect are you asking about?'
    });

    const outcome = await runAgentPipeline(
      'How do I know if an adrenal nodule is not benign?'
    );

    expect(outcome.action).toBe('proceed');
    expect(outcome.trace.scope?.needs_clarification).toBe(false);
  });

  it('uses recent context when the user replies to a clarification question', async () => {
    runSafetyScopeRouterMock.mockResolvedValue({
      category: 'safe',
      reason: 'The follow-up needs clarification',
      in_scope: true,
      needs_clarification: true,
      clarification_question: 'What information are you looking for?'
    });

    const outcome = await runAgentPipeline(
      'I have no concerns; I am just wondering how I would know.',
      [
        'User: How do I know if an adrenal nodule is not benign?',
        'Navigator: What specific aspects are you concerned about regarding the nodule?'
      ]
    );

    expect(outcome.action).toBe('proceed');
    expect(outcome.trace.scope?.needs_clarification).toBe(false);
  });

  it('keeps clarification for a genuinely ambiguous in-scope fragment', async () => {
    runSafetyScopeRouterMock.mockResolvedValue({
      category: 'safe',
      reason: 'The fragment has no recoverable meaning',
      in_scope: true,
      needs_clarification: true,
      clarification_question: 'Which test are you asking about?'
    });

    const outcome = await runAgentPipeline('that one');

    expect(outcome.action).toBe('clarify');
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
