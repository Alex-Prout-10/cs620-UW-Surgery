import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { runAgentPipelineMock, runDialogueEngineMock } = vi.hoisted(() => ({
  runAgentPipelineMock: vi.fn(),
  runDialogueEngineMock: vi.fn()
}));

vi.mock('@/lib/agents/pipeline', () => ({ runAgentPipeline: runAgentPipelineMock }));
vi.mock('@/lib/dialogueEngine', () => ({ runDialogueEngine: runDialogueEngineMock }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    session: { upsert: vi.fn() },
    message: { create: vi.fn(), findMany: vi.fn() }
  }
}));

import { POST } from '@/app/api/chat/route';

function chatRequest(userMessage: string) {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_message: userMessage })
  });
}

describe('chat API safety routing', () => {
  beforeEach(() => {
    runAgentPipelineMock.mockReset();
    runDialogueEngineMock.mockReset();
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('OPENAI_API_KEY', 'test-key');
    vi.stubEnv('DISABLE_OPENAI', 'false');
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns crisis resources before calling either model path for a direct self-harm statement', async () => {
    const response = await POST(chatRequest("I don't want to live anymore"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.assistant_message).toContain('988');
    expect(body.assistant_message).toContain('911');
    expect(body.triage_level).toBe('urgent');
    expect(runAgentPipelineMock).not.toHaveBeenCalled();
    expect(runDialogueEngineMock).not.toHaveBeenCalled();
  });

  it('returns the helpful out-of-scope response without generating a RAG answer', async () => {
    runAgentPipelineMock.mockResolvedValue({
      action: 'block',
      reason: 'Unrelated topic',
      trace: {
        gatekeeper: { category: 'safe', reason: 'No safety concern' },
        analyzer: null,
        scope: {
          in_scope: false,
          needs_clarification: false,
          clarification_question: null,
          reason: 'Unrelated topic'
        }
      }
    });

    const response = await POST(chatRequest('How do I bake sourdough?'));
    const body = await response.json();

    expect(body.assistant_message).toContain('if it connects to your adrenal care');
    expect(runAgentPipelineMock).toHaveBeenCalledTimes(1);
    expect(runDialogueEngineMock).not.toHaveBeenCalled();
  });

  it('calls the RAG answer path only after the router proceeds', async () => {
    runAgentPipelineMock.mockResolvedValue({
      action: 'proceed',
      trace: {
        gatekeeper: { category: 'safe', reason: 'No safety concern' },
        analyzer: null,
        scope: {
          in_scope: true,
          needs_clarification: false,
          clarification_question: null,
          reason: 'Adrenal question'
        }
      }
    });
    runDialogueEngineMock.mockResolvedValue({
      mode: 'faq',
      assistant_message: 'Your care team can explain the test results.',
      response_overview: 'Your care team can explain the test results.',
      response_details: [],
      citations: [],
      ui_cards: [],
      suggested_actions: [],
      triage_level: 'none'
    });

    const response = await POST(chatRequest('What does my adrenal test check?'));
    const body = await response.json();

    expect(body.assistant_message).toContain('care team');
    expect(runAgentPipelineMock).toHaveBeenCalledTimes(1);
    expect(runDialogueEngineMock).toHaveBeenCalledTimes(1);
  });
});
