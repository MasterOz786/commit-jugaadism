# commit-jugaadism Cloudflare Worker API

This guide describes the **Cloudflare Worker** that powers optional server-side commit message generation for the commit-jugaadism CLI. The Worker holds your Gemini API key; the CLI sends `status` and `diff` and receives a commit message.

**Flow:** CLI → POST `{ status, diff }` → Cloudflare Worker → Gemini API → `{ commitMessage }` → CLI

Users never see your API key.

---

## Current codebase (main branch)

- **CLI** (`src/cli.js`): Parses `--dry-run`, `--no-stage`; ensures git repo; stages (unless `--no-stage`); reads `status` + staged `diff` via `src/git.js`; gets message from Gemini (local or Worker); commits via `src/git.js`.
- **Git** (`src/git.js`): `getRepoRoot`, `getStatus`, `getDiff`, `stageAll`, `commit`, `hasChangesToCommit`.
- **Prompt** (`src/prompt.js`): `buildCommitMessagePrompt({ status, diff })` — conventional commit with a short title (≤72 chars) and a 2–4 sentence body describing what changed.
- **Gemini** (`src/gemini.js`): `generateCommitMessage({ status, diff })` — uses `GEMINI_API_KEY`, `@google/genai`, model `gemini-2.5-flash-lite`; returns full message (title + body).

When `COMMIT_JUGAADISM_WORKER_URL` is set, the CLI sends the same `{ status, diff }` to the Worker and uses the returned `commitMessage` instead of calling Gemini locally.

---

## 1. Install Wrangler

From the `worker/` directory (no global install needed):

```bash
cd worker
npm install
npx wrangler login
```

Or install globally: `npm install -g wrangler` then run `wrangler` from anywhere.

---

## 2. Worker layout

The Worker lives in this repo under `worker/`:

```
worker/
├── src/
│   └── index.js
├── wrangler.toml
└── package.json
```

---

## 3. Store the API key

Never hardcode API keys. Use Wrangler secrets:

```bash
cd worker
npx wrangler secret put GEMINI_API_KEY
```

The Worker reads it as `env.GEMINI_API_KEY`.

---

## 4. Worker implementation

The Worker:

- Accepts **POST** only; body **JSON**: `{ status: string, diff: string }`.
- Builds the **same prompt** as `src/prompt.js` (conventional commit: title + description).
- Calls the **Gemini REST API** (`generativelanguage.googleapis.com`) with that prompt.
- Returns **JSON**: `{ commitMessage: string }`.

See `worker/src/index.js` for the implementation.

---

## 5. Run locally

```bash
cd worker
npm run dev
# or: npx wrangler dev
```

Local endpoint: `http://localhost:8787`

---

## 6. Deploy

```bash
cd worker
npm run deploy
# or: npx wrangler deploy
```

You get a public URL, e.g.:

`https://commit-jugaadism.<your-subdomain>.workers.dev`

---

## 6b. Test the Worker

**1. Set the secret** (if you haven’t):

```bash
cd worker
npx wrangler secret put GEMINI_API_KEY
# Paste your key from https://aistudio.google.com/apikey
```

**2. Test with curl:**

```bash
curl -X POST https://commit-jugaadism.<your-subdomain>.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"status":"On branch main\n M src/foo.js","diff":"diff --git a/src/foo.js b/src/foo.js\n--- a/src/foo.js\n+++ b/src/foo.js\n@@ -1,3 +1,4 @@\n const x = 1;\n+const y = 2;\n"}'
```

You should get JSON like `{"commitMessage":"feat: add y variable\n\nAdd second constant for ..."}`.

**3. Use from the CLI** (from any git repo):

```bash
export COMMIT_JUGAADISM_WORKER_URL="https://commit-jugaadism.<your-subdomain>.workers.dev"
commit-ai
# or: commit-ai --dry-run  to only see the message
```

---

## 7. CLI integration

Set the Worker URL so the CLI uses the Worker instead of local Gemini:

```bash
export COMMIT_JUGAADISM_WORKER_URL="https://commit-jugaadism.<your-subdomain>.workers.dev"
commit-ai
# or
cja
```

The CLI sends:

```json
{ "status": "...", "diff": "..." }
```

and uses `data.commitMessage` from the response.

---

## 8. Abuse prevention

If the endpoint is public, add:

- Rate limiting (e.g. per IP) via Cloudflare rules or Worker logic.
- Optional: require a shared secret header that the CLI sends and the Worker checks.

---

## 9. Cost and payload size

- Sending full `status` + `diff` uses tokens; very large diffs can be truncated in the Worker or summarized before calling Gemini.
- Worker runs at the edge; typical latency ~200–600 ms.

---

## Summary

- **Worker** = proxy: receives `{ status, diff }`, calls Gemini with the same prompt as the CLI, returns `{ commitMessage }`.
- **CLI** = unchanged flow; when `COMMIT_JUGAADISM_WORKER_URL` is set, it uses the Worker instead of local `GEMINI_API_KEY`.
- No VSCode extension in this flow; CLI only.
