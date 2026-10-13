import { describe, expect, it, vi } from 'vitest';

const { retrieveRelevantChunksMock } = vi.hoisted(() => ({
  retrieveRelevantChunksMock: vi.fn().mockResolvedValue({
    chunks: [
      {
        chunk_id: 'dialogue-test-chunk',
        source_doc: 'Dialogue test source',
        page_range: '1-1',
        text_snippet: 'Testing checks adrenal hormone levels and imaging features.',
        lead_sentence: 'Testing checks adrenal hormone levels and imaging features.',
        citation_key: 'DOC:Dialogue test source|CHUNK:dialogue-test-chunk|P:1-1'
      }
    ]
  })
}));

vi.mock('@/lib/knowledge', () => ({
  retrieveRelevantChunks: retrieveRelevantChunksMock
}));
vi.mock('@/lib/appConfig', () => ({ getAppConfigMap: vi.fn().mockResolvedValue({}) }));
vi.mock('@/lib/prisma', () => ({ prisma: { message: { findMany: vi.fn() } } }));

process.env.DISABLE_OPENAI = 'true';
process.env.DATABASE_URL = '';
import { runDialogueEngine } from '@/lib/dialogueEngine';

const baseClientState = { stage: 'intake' };

describe('Dialogue Engine fallback behaviors', () => {
  it('routes surgery question to faq with citations', async () => {
    const result = await runDialogueEngine({
      sessionId: 'test-session',
      userMessage: 'Do I need surgery?',
      clientState: baseClientState
    });

    expect(result.mode).toBe('faq');
    expect(result.triage_level).toBe('none');
    expect(result.assistant_message.toLowerCase()).toContain('scan results');
    expect(result.citations.length).toBeGreaterThan(0);
  });

  it('guards against biopsy requests', async () => {
    const result = await runDialogueEngine({
      sessionId: 'test-session',
      userMessage: 'Can they biopsy it?',
      clientState: null
    });

    expect(result.assistant_message.toLowerCase()).toContain('biopsy');
    expect(result.assistant_message.toLowerCase()).toContain('not usually the first step');
  });

  it('escalates severe symptom report', async () => {
    const result = await runDialogueEngine({
      sessionId: 'test-session',
      userMessage: 'I have severe headache, palpitations, sweating',
      clientState: null
    });

    expect(result.triage_level).toBe('emergency');
    expect(result.mode).toBe('triage');
    expect(result.assistant_message.toLowerCase()).toContain('emergency');
  });

  it('produces test instruction card for DST question', async () => {
    const result = await runDialogueEngine({
      sessionId: 'test-session',
      userMessage: 'How do I do the DST?',
      clientState: null
    });

    expect(result.assistant_message.toLowerCase()).toContain('blood draw the next morning');
    expect(result.citations.length).toBeGreaterThan(0);
  });
});
