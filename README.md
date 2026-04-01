# commit-jugaadism

One command: stage changes, generate a conventional commit message (title + description) with AI, and commit. No more manual commit messages.

Uses **[OpenRouter](https://openrouter.ai)** — same model ids as in Cursor’s OpenRouter list. Default model is **`stepfun/step-3.5-flash:free`**; you can switch to other free tiers (e.g. Nemotron Super, Qwen Next, Minimax) via `OPENROUTER_MODEL` or see [`src/openrouter-models.js`](src/openrouter-models.js).

---

## Why use it

- **Stop wasting time** — No more “what do I write?” or asking your IDE to draft a commit message. Change code, run one command, done.
- **Better history** — Messages are conventional (`feat:`, `fix:`, `chore:`) with a short title and a 2–4 sentence description of what actually changed.
- **Pick your model** — Set `OPENROUTER_MODEL` to match whatever you use in Cursor/OpenRouter (free or paid).
- **Simple setup** — Install the CLI, set one API key (or use a shared Worker URL), and you’re done.
- **Share with a team** — Deploy the optional Cloudflare Worker once; share the URL. Teammates use the CLI with no API keys on their machines—only the deployer ever touches the key.

---

## Simple setup (in 3 steps)

1. **Install**
   ```bash
   npm install
   npm link   # optional: use `commit-ai` from anywhere
   ```

2. **Set one of these**
   - **Team:** Someone deploys the Worker once and shares the URL; you set `COMMIT_JUGAADISM_WORKER_URL`. No API key on your machine.
   - **Solo:** Get an [OpenRouter API key](https://openrouter.ai/keys), set `OPENROUTER_API_KEY` in `.env` or your shell (see `.env.example`). Optionally set `OPENROUTER_MODEL` to a model id from [openrouter.ai/models](https://openrouter.ai/models).

3. **Run** (from any git repo with changes)
   ```bash
   commit-ai
   ```

That’s it. Use `commit-ai --dry-run` to only see the message; `commit-ai --no-stage` to use only already-staged changes.

---

## Requirements

- Node.js 20+
- Either: an [OpenRouter](https://openrouter.ai/keys) key (local), or a Worker URL shared with you (no key)

Instructions below use **npm** and **npx**. If you use pnpm or yarn instead, use the same commands with your tool’s equivalents (`pnpm install`, `pnpm exec wrangler`, etc.).

---

## Setup (detailed)

### Option A — Local (your own OpenRouter key)

1. Copy the example env:
   ```bash
   cp .env.example .env
   ```
   Set `OPENROUTER_API_KEY`. Optionally set `OPENROUTER_MODEL` (default: `stepfun/step-3.5-flash:free`; presets in `src/openrouter-models.js`).

2. The CLI loads `.env` when run from this project (via `dotenv`) or uses your environment.

### Option B — Cloudflare Worker (key in Cloudflare, not on your machine)

1. **One person** deploys the Worker once — see [commit-jugaadism-cloudflare-worker-guide.md](commit-jugaadism-cloudflare-worker-guide.md):
   ```bash
   cd worker
   npm install
   npx wrangler login
   npx wrangler secret put OPENROUTER_API_KEY
   npm run deploy
   ```
2. **Everyone** sets only the Worker URL:
   ```bash
   export COMMIT_JUGAADISM_WORKER_URL="https://commit-jugaadism.<your-subdomain>.workers.dev"
   ```

**Sharing:** Deploy once, share the **Worker URL**. Others install the CLI, set that URL, run `commit-ai`. No OpenRouter key or Wrangler for them.

**Migrating from an old Worker** that used `GEMINI_API_KEY`: remove that secret, add `OPENROUTER_API_KEY`, redeploy (see the Cloudflare guide).

---

## Usage

From inside a git repo:

```bash
commit-ai
cja   # if you aliased it

commit-ai --dry-run
commit-ai --no-stage
```

---

## Shell alias

**Zsh / Bash:**

```bash
alias cja="commit-ai"
export OPENROUTER_API_KEY="your_key"
# Optional: export OPENROUTER_MODEL="nvidia/nemotron-3-super-120b-a12b:free"
# (default is stepfun/step-3.5-flash:free — see src/openrouter-models.js)
# Or: export COMMIT_JUGAADISM_WORKER_URL="https://..."
```

**PowerShell:**

```powershell
Set-Alias -Name cja -Value commit-ai
$env:OPENROUTER_API_KEY = "your_key"
# Or: $env:COMMIT_JUGAADISM_WORKER_URL = "https://..."
```

---

## Cloudflare Worker (optional)

The Worker calls OpenRouter with a server-side key. Model defaults are in `worker/wrangler.toml` `[vars]`. See [commit-jugaadism-cloudflare-worker-guide.md](commit-jugaadism-cloudflare-worker-guide.md).

**If you see `Worker error (502): Gemini API error`:** your deployed Worker is outdated. Redeploy from this repo and set `OPENROUTER_API_KEY` with a key from [openrouter.ai/keys](https://openrouter.ai/keys) (`cd worker && npx wrangler secret put OPENROUTER_API_KEY && npx wrangler deploy`).

---

## License

MIT
