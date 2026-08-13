import { NextRequest, NextResponse } from 'next/server';
import { runDialogueEngine } from '@/lib/dialogueEngine';
import { runAgentPipeline } from '@/lib/agents/pipeline';
import type { PipelineTrace } from '@/lib/agents/schemas';
import { prisma } from '@/lib/prisma';
import { BASE_DISCLAIMERS, stripPromptInjection } from '@/lib/safety';

export const runtime = 'nodejs';

const DISCLAIMER = `${BASE_DISCLAIMERS[0]} ${BASE_DISCLAIMERS[1]}`;

function jsonWithSession(data: object, sessionId: string) {
  const response = NextResponse.json(data);
  response.cookies.set('session_id', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production'
  });
  return response;
}

async function getScopeConversationContext(sessionId: string): Promise<string[]> {
  if (!process.env.DATABASE_URL) return [];

  try {
    const messages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      // Two complete prior exchanges can contain up to four stored messages.
      take: 4,
      select: { role: true, contentText: true, contentJson: true }
    });

    return messages.reverse().flatMap((message): string[] => {
      if (message.role === 'user' && message.contentText) {
        return [`User: ${message.contentText.slice(0, 1200)}`];
      }
      if (message.role === 'assistant') {
        const turn = message.contentJson as {
          assistant_message?: unknown;
          ui_cards?: unknown;
        } | null;
        const context: string[] = [];
        if (typeof turn?.assistant_message === 'string' && turn.assistant_message.trim()) {
          context.push(`Navigator: ${turn.assistant_message.slice(0, 1200)}`);
        }
        const cardQuestions = Array.isArray(turn?.ui_cards)
          ? turn.ui_cards.flatMap((card): string[] => {
              const questions = (card as { content?: { questions?: unknown } })?.content?.questions;
              return Array.isArray(questions)
                ? questions.filter((question): question is string => typeof question === 'string')
                : [];
            })
          : [];
        if (cardQuestions.length > 0) {
          context.push(`Navigator follow-up questions: ${cardQuestions.join(' | ').slice(0, 1200)}`);
        }
        return context;
      }
      return [];
    });
  } catch (error) {
    console.warn('Unable to load recent conversation for scope validation.', error);
    return [];
  }
}

async function saveChatTurn(
  sessionId: string,
  userMessage: string,
  assistantResponse: object,
) {
  if (!process.env.DATABASE_URL) return;

  await prisma.session.upsert({
    where: { id: sessionId },
    update: {},
    create: { id: sessionId }
  });
  await prisma.message.create({
    data: {
      sessionId,
      role: 'user',
      contentText: userMessage.trim().slice(0, 1200)
    }
  });
  await prisma.message.create({
    data: {
      sessionId,
      role: 'assistant',
      contentJson: assistantResponse
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userMessage = typeof body?.user_message === 'string' ? body.user_message : '';
    if (!userMessage.trim()) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const injectionScan = stripPromptInjection(userMessage);
    const cleanedMessage = injectionScan.cleaned;
    const sanitizedMessage = cleanedMessage || userMessage.trim();
    const requestedSessionId = typeof body?.session_id === 'string' ? body.session_id : null;
    const sessionId = requestedSessionId || request.cookies.get('session_id')?.value || crypto.randomUUID();

    if (injectionScan.isLikely && !cleanedMessage) {
      const response = {
        mode: 'faq',
        assistant_message:
          'I can help with general questions about adrenal nodules and testing, but I cannot follow requests to ' +
          'change system rules or reveal internal prompts. Please rephrase your medical question.',
        disclaimer: DISCLAIMER,
        citations: [],
        ui_cards: [],
        suggested_actions: [
          { label: 'Rephrase my question', action_type: 'quick_reply', payload: { href: null, value: null } }
        ],
        triage_level: 'none',
        pipeline_trace: null
      };
      await saveChatTurn(sessionId, userMessage, response);
      return jsonWithSession(response, sessionId);
    }

    // Run agent pipeline before dialogue engine
    let pipelineTrace: PipelineTrace | null = null;
    const agentsEnabled =
      !!process.env.OPENAI_API_KEY &&
      process.env.ENABLE_AGENT_PIPELINE !== 'false' &&
      process.env.NODE_ENV !== 'test';

    if (agentsEnabled) {
      const scopeConversation = await getScopeConversationContext(sessionId);
      const pipelineResult = await runAgentPipeline(sanitizedMessage, scopeConversation);
      pipelineTrace = pipelineResult.trace;

      if (pipelineResult.action === 'medical_emergency') {
        const response = {
          mode: 'triage',
          assistant_message:
            'What you are describing sounds like it needs help right away.\n\n' +
            'Please call **911** or go to your nearest emergency room now.\n\n' +
            'Do not wait — get help as soon as you can.',
          disclaimer: DISCLAIMER,
          citations: [],
          ui_cards: [],
          suggested_actions: [],
          triage_level: 'emergency',
          pipeline_trace: pipelineTrace
        };
        await saveChatTurn(sessionId, sanitizedMessage, response);
        return jsonWithSession(response, sessionId);
      }

      if (pipelineResult.action === 'block') {
        const response = {
          mode: 'faq',
          assistant_message:
            'Sorry, I can only answer questions about adrenal nodules (spots on the adrenal gland). ' +
            'Try asking your question in a different way.\n\n' +
            'If this is an emergency, please call **911**.',
          disclaimer: DISCLAIMER,
          citations: [],
          ui_cards: [],
          suggested_actions: [
            { label: 'Try a different question', action_type: 'quick_reply', payload: { href: null, value: null } }
          ],
          triage_level: 'none',
          pipeline_trace: pipelineTrace
        };
        await saveChatTurn(sessionId, sanitizedMessage, response);
        return jsonWithSession(response, sessionId);
      }

      if (pipelineResult.action === 'clarify') {
        const response = {
          mode: 'faq',
          assistant_message: pipelineResult.question,
          disclaimer: DISCLAIMER,
          citations: [],
          ui_cards: [],
          suggested_actions: [
            { label: 'Try a different question', action_type: 'quick_reply', payload: { href: null, value: null } }
          ],
          triage_level: 'none',
          pipeline_trace: pipelineTrace
        };
        await saveChatTurn(sessionId, sanitizedMessage, response);
        return jsonWithSession(response, sessionId);
      }

      // action === 'proceed': continue with original query
    }

    const dialEngineStart = performance.now();

    const response = await runDialogueEngine({
      sessionId,
      userMessage: sanitizedMessage,
      clientState: body?.client_state
    });

    const dialEngineDuration = Math.round(performance.now() - dialEngineStart);
    console.log(`[final-step] runDialogueEngine completely finished in: ${dialEngineDuration}ms`);
    
    // Attach pipeline trace to response
    const responseWithTrace = {
      ...response,
      pipeline_trace: pipelineTrace
    };

    await saveChatTurn(sessionId, sanitizedMessage, responseWithTrace as unknown as object);

    return jsonWithSession(responseWithTrace, sessionId);
  } catch (error) {
    console.error('Chat API error', error);
    return NextResponse.json(
      { error: 'Unable to process request.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
