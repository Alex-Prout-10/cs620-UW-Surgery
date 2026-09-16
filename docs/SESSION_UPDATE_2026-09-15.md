# Adrenal Nodule Clinic Navigator: Session Update and Verification Guide

**Date:** September 15, 2026  
**Purpose:** A reproducible record of the changes made during this working session, what they are intended to improve, and how to independently verify them before a commit, a demo, or a manuscript-related test.

## Important scope note

This update improves the patient experience, source ingestion, retrieval, and database migration workflow. It **does not implement a mental-health or self-harm response flow**. That issue should be handled next with a deterministic safety check and clinician-approved UW Health language; adding mental-health articles to retrieval alone would not be a reliable safety solution.

An AI response is not proven correct merely because it is fluent or cites sources. The checks below are designed to let a developer and a clinician inspect the evidence behind it.

## What changed

### Homepage and patient-facing content

- Replaced the embedded Lab Testing Resources PDF experience with a four-step visual pathway:
  1. Prepare for the test
  2. The night before
  3. Day of the tests
  4. After the tests
- Removed the obsolete “Your Usual Care Pathway” section.
- Replaced large common-question cards with compact clickable question pills.
- Removed the cancer-risk common-question pill so the remaining pills fit on one line at normal desktop width.
- Redesigned the chat guide to give practical instructions: ask a specific question, use suggested follow-ups, and open sources for detail. Removed the topic tag line and the “Try: …” prompt requested for removal.
- Made post-answer question suggestions small clickable pills that place the question in the chat composer rather than automatically sending it.
- Converted citations from large source cards to compact source chips.

### Common questions

Five common questions are now available as approved, stable answers:

1. What tests do I need to get to evaluate my adrenal nodule?
2. When do I need to treat an adrenal nodule?
3. What is the typical treatment for an adrenal nodule?
4. What is the typical recovery for adrenal surgery?
5. What are the risks of adrenal surgery?

Their substantive content came from the clinical-team text supplied during this session, with only light formatting/plain-language edits. The cancer-risk answer was deliberately removed from the visible common-question list.

When a user asks one of these exact common questions, the API returns the stable answer rather than asking the model to generate a new answer. The conversation/answer can still be recorded in the database when the database is available. These direct answers are not RAG-generated and do not receive document citations; they should receive clinician wording review like any other published patient education.

### Text-to-speech

The speech control now removes Markdown formatting before speech synthesis (for example, asterisks, headings, links, and list markers). It also prefers an available natural-sounding English system voice and uses a slightly slower speech rate. Voice quality still depends on the browser and operating system; this is browser speech synthesis, not a hosted clinical voice service.

### References and ingestion

- Added the six newly supplied PDFs to the ingestion list.
- Renamed the ten files that ended in `- UpToDate` to clean display filenames.
- Updated the ingestion script to use database upserts for chunks/embeddings, making reruns safer if a previous run was interrupted.
- The running full re-index replaces each source’s old chunks before writing its new chunks. It is intentionally a write operation and creates embeddings through the configured OpenAI account.

### Semantic chunking and retrieval

The previous chunking behavior made roughly 200-character semantic segments and could discard segments when they did not resemble the document’s overall topic closely enough. This was risky for clinically useful but specific sections such as risks, recovery, or follow-up.

The updated behavior:

- keeps valid extracted text instead of filtering it with that document-centroid relevance threshold;
- removes likely reference/bibliography-only chunks;
- builds larger semantic chunks (target source segments around 300 characters, with a minimum meaningful semantic chunk size of 800 characters); and
- caps final chunks at 2,200 characters to keep the context readable.

Retrieval now combines semantic similarity (82%) with a keyword score (18%). The keyword component helps when a patient uses an exact term such as “open surgery,” “cortisol,” or “blood draw.”

The system considers a broad candidate set, then sends up to 12 final context chunks with no more than 3 from any one source. This is intentional: sending 20 full chunks to the model would increase cost/latency and can dilute the most relevant evidence. More retrieved chunks are not automatically a better answer.

The response target was also expanded modestly to support a more complete answer. This is a prompt and schema change, not a guarantee of answer quality.

The answer-model output ceiling was raised from 1,200 to 3,000 tokens so structured multi-part responses are less likely to be truncated. The prompt still asks for focused answers; measure latency and cost before treating this as a permanent performance setting.

### Response readability and citation grounding

After reviewing an example that repeated its answer under “Key details,” embedded three follow-up questions in the answer body, and displayed weakly related sources, the response contract was tightened:

- The overview is now asked to be a focused two-to-four sentence answer, rather than a longer response padded with generic advice.
- “Key details” only renders when there are distinct, source-supported details that do not substantially repeat the overview. A server-side overlap filter enforces this even if the model ignores the prompt.
- Questions embedded by the model in the answer body are removed. Follow-up questions belong only in the separate clickable question pills.
- A displayed citation must now include an exact five-to-25-word excerpt found in the retrieved chunk. Citations without a verifiable supporting excerpt are not displayed; the server no longer substitutes the top retrieved sources when the model supplies no valid citation.

This makes the source display more conservative. Some answers may correctly show no source rather than a misleading one. It is still necessary for a clinician to check that the quoted excerpt supports the claim being made.

### Prisma and Neon

The migration history was internally inconsistent: the first migration tried to alter tables before they existed, and the second repeated schema setup. This caused Prisma errors P3005/P3006.

Because preservation of the existing Neon data was not required, the database was reset with explicit authorization and the migration history was replaced by one clean baseline migration. The old Neon data was deleted as part of that reset. Prisma now reports the schema as up to date.

`npm run prisma:migrate` now runs normal Prisma development migrations without forcing every future migration to use the name `init`.

## Current re-index status

A full `--replace-source` index refresh is currently running. At the time this document was written, it had completed many of the major guideline and surgery documents and had reported no errors. Monitor it in a separate PowerShell window:

```powershell
Get-Content .\reingest-progress.log -Tail 30 -Wait
```

When it completes, the log should end with a completion summary. Check errors with:

```powershell
Get-Content .\reingest-progress.err.log -Tail 30
```

To deliberately rerun the complete refresh later:

```powershell
npm.cmd run ingest -- --replace-source
```

Do not start a second ingestion while one is already running.

## How to inspect the changes yourself

### 1. Read the code diff

```powershell
git status
git diff --check
git diff -- app/page.tsx app/chat/page.tsx components/CitationList.tsx components/cards
git diff -- lib/commonQuestions.ts app/api/chat/route.ts
git diff -- lib/ingest/chunking.ts lib/knowledge.ts lib/dialogueEngine.ts scripts/ingest.ts
git diff -- prisma/migrations package.json
```

`git diff --check` should produce no whitespace errors. The current diff includes PDF renames as deleted old filenames plus untracked clean filenames until they are staged; Git will generally detect the moves when staged.

### 2. Run the app locally

Use `npm.cmd` in PowerShell if the `npm` alias behaves unexpectedly.

```powershell
npm.cmd run dev
```

Open `http://localhost:3000`. Check the homepage pathway, then open the chat page and verify:

- common questions are compact and clickable;
- a suggested post-answer question fills the input box;
- source chips are compact and open the referenced document;
- speech does not read Markdown punctuation aloud.

### 3. Inspect the database and chunks

```powershell
npm.cmd run prisma:studio
```

Open `http://localhost:5555`, select **KnowledgeChunk**, and inspect rows. Useful fields to review are `sourceDoc`, page range fields, `text`, and the linked embedding. Search/filter for terms such as `open surgery`, `cortisol`, `aldosterone`, or `recovery` and read the chunk text in the source context.

Check migration state directly:

```powershell
node .\node_modules\prisma\build\index.js migrate status --schema prisma\schema.prisma
```

Expected outcome: one migration found and database schema up to date.

### 4. Test retrieval, not just appearance

Start a new chat for each test. Ask questions that are not one of the five exact common questions, for example:

```text
According to the European guideline, what imaging features matter for an adrenal incidentaloma?
What are the general risks and recovery considerations for open adrenal surgery?
What does the morning dexamethasone suppression test evaluate?
```

For each answer, verify all of the following:

1. The answer directly addresses the question.
2. Its source chips lead to a document that supports the relevant claim.
3. The answer distinguishes general education from an individual recommendation.
4. It does not invent an unsupported number, treatment recommendation, or personal diagnosis.
5. A clinician can read the cited passage and agree the wording is appropriate for patients.

The hardcoded common questions are a separate test: click each and compare the exact output against the approved text in `lib/commonQuestions.ts`.

### 5. Verify the retrieval change empirically

The strongest CS-style check is a small evaluation set rather than judging one attractive answer. Create a table with 15–30 representative questions and record, before/after if possible:

| Measure | What to record |
| --- | --- |
| Retrieval relevance | Whether at least one cited chunk directly answers the question |
| Citation support | Whether the source supports each important factual claim |
| Completeness | Clinician rating, for example 1–5 |
| Safety | Whether it avoids personalized diagnosis/unsafe advice |
| Latency | Displayed response time |

Keep the questions, responses, cited sources, and reviewer notes. That gives you evidence for an improvement claim; without it, the accurate wording is that the retrieval strategy was changed with the goal of improving coverage and specificity.

## Validation performed so far

- `git diff --check` was clean apart from Windows LF/CRLF warnings.
- TypeScript checking did not report errors in the files changed this session. The repository still has pre-existing errors in test files, so this is **not** a claim that the entire repository has a clean typecheck.
- A browser visual test could not be run in this environment because no local interactive browser session was available. Perform the local visual checks above.
- The automated test command did not complete in this restricted environment because its tooling could not access required directories. Run it on your machine before push:

```powershell
npm.cmd test
node .\node_modules\typescript\bin\tsc --noEmit
```

Treat newly introduced errors as blockers. If the known test-file errors still appear, capture them in the PR/commit notes rather than hiding them.

## Known limitations and recommended next work

1. **Response presentation decision:** The “Key details” section was removed because it commonly repeated the answer and appeared hardcoded. The current interface shows one clear answer plus separate clickable follow-up questions. Next session, evaluate a deliberate multi-part response layout for complex questions rather than reintroducing a generic secondary section.
2. **Next-session backend TODO: multi-part questions:** A test prompt asking about hormone workup, imaging features, management/surgery, and five doctor questions received one generic paragraph and omitted important requested details. Implement query decomposition: detect separate requests, retrieve evidence for each topic (preferably in parallel), generate one response section per topic, and validate that each requested topic is answered or explicitly marked unsupported. Add that exact prompt as a regression/evaluation test. Do not solve this merely by raising the output-token limit; that can add latency and unsupported filler.
3. **Critical safety gap:** Self-harm/mental-health language is not yet routed to an appropriate crisis response. Do not represent this issue as fixed. The appropriate implementation is a deterministic pre-scope safety classifier/rule with clinician-approved emergency wording, followed by dedicated tests; do not rely on RAG documents for this.
4. **Citations are selective:** A typical response shows only a few source chips, even though the model receives up to 12 chunks. Fewer sources can be more readable, but every displayed citation must still be checked for claim support. One source must not be treated as support for a multi-topic answer; the prompt now instructs topic-level source coverage, but a server-side coverage validator remains future backend work.
5. **Model variability remains:** Better chunking/ranking reduces one failure mode but cannot eliminate hallucinations. Source review and a clinician-reviewed evaluation set are required before clinical study use.
6. **Latency remains separate work:** The multi-step safety/routing/answer pipeline can still take substantial time. The changes here did not target response-time optimization.
7. **Database reset:** The prior Neon records were intentionally discarded to repair migration history. Re-ingestion rebuilds the knowledge base; chat/session history starts fresh.

## Suggested pre-push sequence

Wait for the active ingestion to finish, then run:

```powershell
git status
git diff --check
node .\node_modules\prisma\build\index.js migrate status --schema prisma\schema.prisma
npm.cmd test
node .\node_modules\typescript\bin\tsc --noEmit
npm.cmd run dev
```

Manually check the UI and several retrieval questions, then stage the intended work. Review the staged diff before committing:

```powershell
git add app components lib prisma scripts package.json docs "Reference documents"
git diff --cached --stat
git diff --cached
git commit -m "Improve clinical retrieval and patient chat experience"
git push
```

Do not add `.env`, logs, `node_modules`, `.next`, or `tsconfig.tsbuildinfo`. The ignore rules now cover logs and TypeScript build-info files.

## Conservative email draft to the clinical team

**Subject:** Adrenal Nodule Chatbot Update

Hi all,

I completed an update focused on the common patient questions and the supporting source/retrieval workflow. The site now includes the four-step lab-testing pathway, compact approved common-question prompts, clickable suggested questions, compact source links, and improved text-to-speech formatting.

On the technical side, I added the newly shared references and refreshed the knowledge base using larger semantic chunks plus a hybrid semantic/keyword retrieval score. The aim is to preserve more specific content (for example, risks, recovery, and follow-up details) while still selecting focused supporting context for each answer. I am now validating this with representative questions and source review rather than treating the change as automatically clinically better.

I also repaired the Prisma migration history and rebuilt the development knowledge database, so future schema changes can be handled through normal migrations.

The mental-health/self-harm safety response has not been changed in this update. My proposed next step is a deterministic, clinician-approved crisis-response route with dedicated tests, rather than relying on source retrieval alone.

I would appreciate clinical review of the common-question wording and of a small set of representative chatbot responses/citations before we use the system for manuscript testing.

Best,  
Alex
