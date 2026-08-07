# Chatbot Changes and Performance Notes

Updated: August 7, 2026

## Why these changes were made

The chatbot had two related issues:

1. It could not reliably identify one conversation across multiple messages.
2. Its final-answer model was never given earlier questions or answers, so follow-up questions had no usable memory.

The work so far keeps the existing OpenAI agent pipeline and retrieval-augmented generation (RAG) design. The changes add a small, bounded layer of conversation memory and reduce the amount of retrieval context sent to the answer model.

## Change summary

| Change | Files | Plain-language result |
| --- | --- | --- |
| Server-issued session ID | `app/api/chat/route.ts`, `app/chat/page.tsx` | A browser keeps one chat session across messages. |
| Recent-turn memory | `lib/dialogueEngine.ts` | The answer model can see the most recent three user/assistant exchanges. |
| Smaller RAG context | `lib/dialogueEngine.ts` | The answer model receives 6 retrieved passages instead of 12. |
| Removed adrenal-insufficiency sources | Neon knowledge database | 41 chunks from two adrenal-insufficiency documents no longer participate in retrieval. |
| Draft common questions | `lib/commonQuestions.ts`, `app/chat/page.tsx` | Four editable starter prompts are available while clinician-reviewed answers are pending. |
| UW emblem in header | `components/Nav.tsx`, `public/uw-madison-emblem.png` | The site header now displays the UW emblem beside the application title. |

## 1. Session IDs and cookies

### What changed

Previously, the browser sent `session_id: null` with every chat request. The server could look for a session cookie, but it never created one. As a result, messages were not consistently saved under a single conversation.

Now, the chat API creates a UUID on the first valid message when no session already exists. It sends the UUID back in a cookie named `session_id`. On later requests, the browser automatically sends that cookie back to the same site.

### Important terms

- **UUID (Universally Unique Identifier):** A long, randomly generated identifier, such as `550e8400-e29b-41d4-a716-446655440000`. It is used as a label for one conversation, not as a user name.
- **Cookie:** A small value stored by the browser and automatically returned to the same website with future requests.
- **HttpOnly:** Browser JavaScript cannot read the cookie. This helps protect it if a page ever has a cross-site scripting vulnerability.
- **SameSite=Lax:** The browser limits when the cookie is sent during cross-site navigation, which reduces cross-site request risks.
- **Secure:** In production, the cookie is sent only over HTTPS.

### How the current flow works

1. The user sends their first message.
2. The server creates a UUID and sets it as the `session_id` cookie.
3. The server saves the user message and assistant answer under that UUID in PostgreSQL.
4. Later messages include the cookie automatically.
5. The server uses the UUID to load recent messages from the same conversation.

## 2. Stateful chatbot memory

### What changed

Before asking the final-answer model for a response, `runDialogueEngine()` now reads the six most recent saved messages for the current session. This is normally three user/assistant pairs.

The prompt now contains three parts:

1. **Prior conversation:** recent messages, marked as untrusted reference text.
2. **Current user message:** the new question that needs an answer.
3. **Knowledge chunks:** the RAG passages retrieved from the clinical source material.

This lets a follow-up question such as "How do I prepare for that?" refer to a test that was discussed in the previous answer.

### Why the history is bounded

Each stored message is capped at 1,200 characters and the model receives only six recent messages. This prevents prompt size and cost from growing forever during a long conversation.

The database lookup begins in parallel with app-configuration loading and knowledge retrieval. Parallel work means the server starts independent tasks at the same time instead of waiting for one before starting the next.

### Current scope and next possible improvement

This first memory implementation is intentionally limited. It adds recent history only to the final answer request. The safety pipeline and router still receive the current user message alone.

A later improvement could store a small **rolling summary** and a **structured state** (for example, nodule size, imaging modality, tests already discussed, and unanswered questions). That would retain useful long-term context without sending an entire transcript to the model.

## 3. RAG context adjustment

### What changed

The retrieval function still ranks knowledge chunks in the same way. The code now sends the top **6** chunks to the answer model instead of the top **12**.

This is a retrieval-context change, not a source-document chunking change. The ingestion process that splits PDFs into chunks remains unchanged.

### Source removal

The following two source documents were removed from the active Neon knowledge database because they introduced testing information outside this clinic's workflow:

- `Causes of primary adrenal insufficiency (Addison disease) - UpToDate.pdf`
- `Determining the etiology of adrenal insufficiency in adults - UpToDate.pdf`

This removed 41 knowledge chunks. Their embeddings were deleted automatically with the related chunks, so future retrieval cannot cite or use those documents.

### Why it should help

Fewer passages mean fewer input tokens for the answer model. This can reduce latency and cost, and it may make the answer more focused by lowering the chance of including weakly related passages.

### How to evaluate it

Test a few broad and detailed clinical questions. If answers lose useful detail or citations, try 8 chunks before changing the ingestion/chunking algorithm itself.

## 4. Draft common questions

The chat screen now shows four draft common-question prompts based on existing test questions. Selecting one only fills the chat input; it does not provide a hardcoded clinical answer or make an additional API request.

Until endocrinologist-reviewed questions and answers are available, these prompts continue through the normal safety and source-retrieval pipeline. This avoids publishing unreviewed medical content.

When reviewed answers are available, the next step is to store each approved answer with its citations and source version in Neon. Exact common-question matches can then return the approved cached answer without calling the model, while all other questions keep the current full pipeline.

## 5. Remaining chat latency

The application still preserves its existing multi-step safety architecture. A typical live request can include:

1. Gatekeeper and analyzer model calls in parallel.
2. Scope-validator model call.
3. Retrieval work, including embeddings when configured.
4. Router model call.
5. Final structured-answer model call.

The recent-history lookup is parallelized, but the multi-model agent pipeline remains the main source of latency. A later, separate optimization could merge the three safety/routing agent calls into one structured decision call. That should be reviewed carefully because it changes safety behavior, not just speed.

## 6. Session-ID privacy assessment

### Are these IDs anonymous?

They are **pseudonymous**, not fully anonymous. The UUID does not contain a name, email address, or medical fact. However, it consistently links messages from the same browser session, and the database stores those messages. If the messages include identifiable health information, the conversation as a whole can be sensitive.

### Protections already in place

- UUIDs are generated with `crypto.randomUUID()`, which is designed to be difficult to guess.
- The cookie is `HttpOnly`.
- The cookie uses `SameSite=Lax`.
- The cookie uses `Secure` in production.
- The application has a visible "Start New Chat" action that deletes the current session's saved data.

### Risks and recommended next steps

1. **Conversation content is sensitive.** Do not treat a random ID as anonymization. Keep the privacy notice clear, minimize stored data, and set a documented retention/deletion policy.
2. **Do not put session IDs in URLs.** The current export endpoint can accept a `session_id` query parameter. URLs can appear in browser history, logs, and referrer headers. Prefer the HttpOnly cookie for normal user actions.
3. **Do not accept arbitrary session IDs from the chat body.** The chat route still supports a submitted `session_id` for compatibility. The safer long-term design is to trust only the signed or HttpOnly cookie for normal browser requests.
4. **Use access control for administrative/export features.** A UUID is an identifier, not a complete authorization system. If exports are used by more than the current browser user, require authentication and authorization.
5. **Use database protections.** Limit database access, encrypt backups, rotate credentials, and use a production connection string appropriate for serverless deployments.
6. **Limit cookie lifetime.** The current session cookie is a browser-session cookie. Decide whether conversations should expire after a defined number of days and enforce that in both the cookie and database cleanup process.

## Suggested next sequence

1. Test a two-turn follow-up chat locally to confirm recent-memory behavior.
2. Compare answer quality and timing with 6 versus 8 retrieved chunks if needed.
3. Add a session-retention policy and remove URL/body-based session-ID overrides.
