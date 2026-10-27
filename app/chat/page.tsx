"use client";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AssistantTurn } from "@/lib/schemas";
import CardRenderer from "@/components/cards/CardRenderer";
import CitationList from "@/components/CitationList";
import ChatWorkspace from "@/components/chat/ChatWorkspace";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  data?: AssistantTurn;
  pipeline_trace?: any;
  responseTimeMs?: number;
};

function markdownToSpeechText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*(?:[-+*]|\d+[.)])\s+/gm, "")
    .replace(/[*_~`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function preferredEnglishVoice() {
  const voices = window.speechSynthesis
    .getVoices()
    .filter((voice) => /^en-US/i.test(voice.lang));
  const naturalVoice = voices.find((voice) =>
    /(natural|online|aria|ava|jenny|samantha|zira|google us english)/i.test(
      voice.name,
    ),
  );
  return naturalVoice ?? voices[0] ?? null;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clientState, setClientState] = useState<Record<string, unknown>>({});
  const [appConfig, setAppConfig] = useState<Record<string, string | null>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestResponseRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(
    null,
  );
  const preRecordInputRef = useRef("");

  const revealAssistantMessage = async (messageId: string, content: string) => {
    const charactersPerFrame = 4;
    for (let index = charactersPerFrame; index < content.length; index += charactersPerFrame) {
      setMessages((previous) =>
        previous.map((message) =>
          message.id === messageId ? { ...message, content: content.slice(0, index) } : message,
        ),
      );
      await new Promise<void>((resolve) => window.setTimeout(resolve, 16));
    }
    setMessages((previous) =>
      previous.map((message) =>
        message.id === messageId ? { ...message, content } : message,
      ),
    );
  };

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SR);
    setTtsSupported(typeof window.speechSynthesis !== "undefined");
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedState = localStorage.getItem("navigator_client_state");
    if (storedState) {
      try {
        setClientState(JSON.parse(storedState));
      } catch {
        setClientState({});
      }
    }

    if (sessionStorage.getItem("navigator_session_active")) {
      const loadHistory = async () => {
        try {
          const response = await fetch("/api/chat/history");
          const payload = await response.json();
          if (payload?.messages) {
            const history = payload.messages.map((message: any) => ({
              id: message.id ?? crypto.randomUUID(),
              role: message.role,
              content: message.content,
              data: message.assistant_turn ?? undefined,
              pipeline_trace: message.assistant_turn?.pipeline_trace ?? null,
            }));
            setMessages(history);
            const lastAssistant = history
              .filter((msg: ChatMessage) => msg.role === "assistant")
              .pop();
            if (lastAssistant?.data) {
              sessionStorage.setItem(
                "navigator_last_response",
                JSON.stringify(lastAssistant.data),
              );
            }
          }
        } catch (error) {
          console.error("Failed to load history", error);
        }
      };

      loadHistory();
    }
    sessionStorage.setItem("navigator_session_active", "1");

    const loadConfig = async () => {
      try {
        const response = await fetch("/api/config");
        const data = await response.json();
        if (data?.config) {
          setAppConfig(data.config);
        }
      } catch (error) {
        console.error("Failed to load config", error);
      }
    };

    loadConfig();
  }, []);

  //fixed: scrolls to chatbot when prompted
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "user") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (lastMessage.role === "assistant") {
      latestResponseRef.current?.scrollIntoView({
        behavior: loading ? "auto" : "smooth",
        block: "start",
      });
    }
  }, [messages, loading]);

  const handleSend = async (messageOverride?: string) => {
    const messageText = (messageOverride ?? input).trim();
    if (!messageText || loading) return;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    const assistantMessageId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "", responseTimeMs: undefined },
    ]);

    try {
      const requestStart = performance.now();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_message: userMessage.content,
          client_state: clientState,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.assistant_message) {
        throw new Error("Invalid response");
      }
      const data = payload as AssistantTurn;

      await revealAssistantMessage(assistantMessageId, data.assistant_message);
      setMessages((previous) =>
        previous.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                data,
                pipeline_trace: payload.pipeline_trace ?? null,
                responseTimeMs: Math.round(performance.now() - requestStart),
              }
            : message,
        ),
      );
      if (typeof window !== "undefined") {
        sessionStorage.setItem("navigator_last_response", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Chat error", error);
      setMessages((previous) =>
        previous.map((message) =>
          message.id === assistantMessageId
            ? { ...message, content: "Sorry, something went wrong. Please try again." }
            : message,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (value: string) => {
    setInput(value);
    window.requestAnimationFrame(() => {
      const inputElement = inputRef.current;
      inputElement?.focus({ preventScroll: true });
      inputElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const handleNavigate = (href: string) => {
    window.location.href = href;
  };

  const handleShareSummary = () => {
    const lastAssistant = [...messages]
      .reverse()
      .find((msg) => msg.role === "assistant" && msg.data);
    if (lastAssistant?.data) {
      sessionStorage.setItem(
        "navigator_last_response",
        JSON.stringify(lastAssistant.data),
      );
    }
    window.location.href = "/checklist";
  };

  const handleSymptomUpdate = (selected: string[]) => {
    const nextState = { ...clientState, selectedSymptoms: selected };
    setClientState(nextState);
    localStorage.setItem("navigator_client_state", JSON.stringify(nextState));
  };

  const handleClearHistory = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      await fetch("/api/session/delete", { method: "POST" });
      setMessages([]);
      setInput("");
      setClientState({});
      if (typeof window !== "undefined") {
        localStorage.removeItem("navigator_client_state");
        sessionStorage.removeItem("navigator_last_response");
      }
    } catch (error) {
      console.error("Failed to clear history", error);
    } finally {
      setClearing(false);
    }
  };

  function createRecognition() {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return null;

    const recognition = new SR() as SpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      const prefix = preRecordInputRef.current;
      const separator = prefix && !prefix.endsWith(" ") ? " " : "";
      setInput(prefix + separator + finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    return recognition;
  }

  const toggleSpeak = (messageId: string, text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const speechText = markdownToSpeechText(text);
    if (!speechText) return;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = "en-US";
    utterance.voice = preferredEnglishVoice();
    utterance.rate = 0.96;
    utterance.pitch = 1;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    window.speechSynthesis.speak(utterance);
    setSpeakingMessageId(messageId);
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (!speechSupported) return;

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }

    const recognition = createRecognition();
    if (!recognition) return;

    preRecordInputRef.current = input;
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  return (
    <ChatWorkspace
      isEmpty={messages.length === 0}
      clearing={clearing}
      clinicDescription={appConfig.clinic_description ?? undefined}
      onNewChat={handleClearHistory}
      onQuestionSelect={handleQuickReply}
      conversation={
        <>
          <section className="chat-message-list" aria-label="Messages">
      <div className="chat-message-stack">
        {messages.map((message, index) => (
          <article
            key={message.id}
            // This inline check handles the scroll target safely without changing brackets
            ref={
              index === messages.length - 1 && message.role === "assistant"
                ? latestResponseRef
                : null
            }
            className={`chat-turn scroll-mt-24 ${message.role === "user" ? "chat-turn--user" : "chat-turn--assistant"}`}
          >
            <div className="chat-turn-header">
              <div className="chat-turn-speaker">
                {message.role === "user" ? "You" : "Navigator"}
              </div>
              {message.role === "assistant" && ttsSupported && (
                <button
                  type="button"
                  onClick={() => toggleSpeak(message.id, message.content)}
                  aria-label={
                    speakingMessageId === message.id
                      ? "Stop reading"
                      : "Read message aloud"
                  }
                  className="chat-read-aloud-button"
                >
                  {speakingMessageId === message.id ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden
                    >
                      <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            {/* react */}

            <div className="chat-turn-copy">
              {message.role === "user" ? (
                <p className="chat-user-bubble">{message.content}</p>
              ) : !message.content && loading ? (
                <div className="flex items-center gap-1.5" aria-label="Navigator is preparing a response">
                  <span className="thinking-dot" />
                  <span className="thinking-dot thinking-dot-delay-1" />
                  <span className="thinking-dot thinking-dot-delay-2" />
                </div>
              ) : (
                <div className="chat-markdown">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  urlTransform={(url) =>
                    /^citation:\d+$/.test(url) ? url : ""
                  }
                  components={{
                    h1: ({ children }) => (
                      <h1 className="chat-markdown-heading chat-markdown-h1">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="chat-markdown-heading chat-markdown-h2">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="chat-markdown-heading chat-markdown-h3">
                        {children}
                      </h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="chat-markdown-heading chat-markdown-h4">
                        {children}
                      </h4>
                    ),
                    p: ({ children }) => (
                      <p className="mb-3 whitespace-pre-line leading-relaxed last:mb-0">
                        {children}
                      </p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
                    ol: ({ children }) => (
                      <ol className="my-3 ml-6 list-decimal space-y-2 block">
                        {children}
                      </ol>
                    ),
                    ul: ({ children }) => (
                      <ul className="my-3 ml-6 list-disc space-y-2 block">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="block w-full list-item pl-1 leading-relaxed">
                        {children}
                      </li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="chat-markdown-quote">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="chat-markdown-code">
                        {children}
                      </code>
                    ),
                    a: ({ href, children }) => {
                      const citationNumber = href?.match(/^citation:(\d+)$/)?.[1];
                      const citationIndex = citationNumber
                        ? Number(citationNumber) - 1
                        : -1;
                      const citation = message.data?.citations[citationIndex];

                      if (citation) {
                        return (
                          <span
                            className="chat-markdown-citation"
                            title={`Source ${citationNumber}; see Sources below`}
                            aria-label={`Source ${citationNumber}`}
                          >
                            {children}
                          </span>
                        );
                      }

                      return <span>{children}</span>;
                    },
                  }}
                >
                  {message.content.replace(/###\s*Questions You Might Want to Ask[\s\S]*/gi, "")}
                </ReactMarkdown>
                </div>
              )}
            </div>

            {message.role === "assistant" && message.responseTimeMs != null && (
              <p className="chat-response-time">
                Response time: {(message.responseTimeMs / 1000).toFixed(1)} seconds
              </p>
            )}

            {message.role === "assistant" && message.data && (
              <div className="chat-response-extras">
                {message.data.triage_level !== "none" && (
                  <div className="chat-triage-box">
                    <div className="font-semibold">Care guidance</div>
                    <div>
                      {(() => {
                        if (message.data.triage_level === "contact_clinic") {
                          return "Please call your clinic to discuss concerns about symptoms or follow up procedures.";
                        }
                        if (message.data.triage_level === "urgent") {
                          return "Please go to urgent care or call your doctor today about your symptoms.";
                        }
                        return "If your symptoms are serious, call 911 or go to the emergency room right away.";
                      })()}
                    </div>
                  </div>
                )}

                {/* <div className="text-xs uppercase tracking-[0.2em] text-uwred">
                  Mode: {message.data.mode} | Triage:{" "}
                  {message.data.triage_level}
                </div> */}

                {message.data.citations.length > 0 && (
                  <CitationList citations={message.data.citations} />
                )}

                <div className="grid gap-3">
                  {message.data.ui_cards.map((card, index) => (
                    <CardRenderer
                      key={`${card.type}-${index}`}
                      card={card}
                      onQuickReply={handleQuickReply}
                      selectedSymptoms={
                        Array.isArray(clientState?.selectedSymptoms)
                          ? (clientState.selectedSymptoms as string[])
                          : []
                      }
                      onSymptomSubmit={handleSymptomUpdate}
                      onShareSummary={handleShareSummary}
                      config={{
                        billing_phone: appConfig.billing_phone ?? null,
                        scheduling_link: appConfig.scheduling_link ?? null,
                        what_to_bring: appConfig.what_to_bring ?? null,
                        emergency_guidance:
                          appConfig.emergency_guidance ?? null,
                      }}
                    />
                  ))}
                </div>

                {/* {message.data.suggested_actions?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {message.data.suggested_actions.map((action) => (
                      <button
                        key={`${action.label}-${action.action_type}`}
                        onClick={() => {
                          if (
                            action.action_type === "quick_reply" &&
                            action.payload.value
                          ) {
                            handleQuickReply(action.payload.value);
                          }
                          if (
                            action.action_type === "navigate" &&
                            action.payload.href
                          ) {
                            handleNavigate(action.payload.href);
                          }
                          if (action.action_type === "share_summary") {
                            handleShareSummary();
                          }
                        }}
                        className="rounded-full border border-uwred px-4 py-2 text-xs font-semibold text-uwred"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )} */}

                {/* {message.pipeline_trace && (
                  <PipelineTraceCard trace={message.pipeline_trace} />
                )} */}
              </div>
            )}
          </article>
        ))}

        <div ref={messagesEndRef} />
      </div>
      </section>

        </>
      }
    >
      <div className="chat-composer">
        <div className="chat-composer-box">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            rows={2}
            aria-label="Ask a question about adrenal nodules"
            placeholder="Ask a question about adrenal nodules…"
            className="chat-message-input"
          />
          <div className="chat-composer-actions">
            <div className="chat-composer-hint">Ask about testing, imaging, hormones, or follow-up</div>
            <div className="chat-composer-buttons">
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={loading}
                  aria-label={isRecording ? "Stop recording" : "Start voice input"}
                  className={`chat-microphone-button${isRecording ? " chat-microphone-button--recording" : ""}`}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 10a7 7 0 0 0 14 0M12 17v5M9 22h6" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSend()}
                className="chat-send-button"
                aria-label="Send message"
                disabled={loading || !input.trim()}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
          {isRecording && (
            <div className="chat-recording-status">
              <span className="chat-recording-dot" />Listening… speak now
            </div>
          )}
        </div>
        <p className="chat-privacy-note">
          Protect your privacy: avoid sharing your date of birth, Social Security number, or insurance details.
        </p>
      </div>
    </ChatWorkspace>
  );
}
