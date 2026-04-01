# commit-jugaadism Cloudflare Worker

Optional **Worker** that calls **OpenRouter** with your server-side key. CLI sets `COMMIT_JUGAADISM_WORKER_URL`.

Docs use **npm** / **npx**; pnpm/yarn users can substitute equivalents.

## Deploy

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put OPENROUTER_API_KEY
npm run deploy
```

Use an API key from [openrouter.ai/keys](https://openrouter.ai/keys), not Google AI Studio.

## Troubleshooting

### `Worker error (502): Gemini API error` (or `details` mentioning `ai.google.dev`)

Your **live** Worker is still calling **Google Gemini**. Proof: quota errors like `RESOURCE_EXHAUSTED`, links to `ai.google.dev`, or the literal string `Gemini API error` in the response.

This repo’s Worker only calls **openrouter.ai**. Fix:

1. Pull latest `main` (or ensure `worker/src/index.js` contains `openrouter.ai/api/v1/chat/completions`).
2. From the repo: `cd worker && npm install`
3. `npx wrangler secret put OPENROUTER_API_KEY` — must be a key from [openrouter.ai/keys](https://openrouter.ai/keys), **not** Google AI Studio.
4. `npx wrangler deploy`

Clean up: `npx wrangler secret delete GEMINI_API_KEY` (optional).

Confirm you’re deploying **this** project’s `worker/` folder (same Cloudflare account as `wrangler.toml` `name = "commit-jugaadism"`).

### `Worker error (502): OpenRouter API error` with details

OpenRouter rejected the request (bad key, rate limit, invalid model, etc.). The CLI now includes the first part of `details` in the error. Check your key and `OPENROUTER_MODEL` in `wrangler.toml`.

### Test the Worker

```bash
curl -sS -X POST "https://your-worker.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{"status":"On branch main","diff":"diff --git a/a b/a\n+hello\n"}'
```

Expect JSON with `commitMessage`.
