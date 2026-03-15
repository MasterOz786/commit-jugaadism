# commit-jugaadism

One command: stage changes, generate a conventional commit message (title + description) with AI, and commit. No more manual commit messages.

---

## Why use it

- **Stop wasting time** — No more “what do I write?” or asking your IDE to draft a commit message. Change code, run one command, done.
- **Better history** — Messages are conventional (`feat:`, `fix:`, `chore:`) with a short title and a 2–4 sentence description of what actually changed.
- **Simple setup** — Install the CLI, set one env var (or use a shared Worker URL), and you’re done.
- **Share with a team** — Deploy the optional Cloudflare Worker once; share the URL. Teammates use the CLI with no API keys on their machines—only the deployer ever touches the key.

---

## Simple setup (in 3 steps)

1. **Install**
   ```bash
   npm install
   npm link   # optional: use `commit-ai` from anywhere
   ```

2. **Set one of these**
   - **Team:** Someone deploys the Worker once and shares the URL; you set `COMMIT_JUGAADISM_WORKER_URL=https://commit-jugaadism.commititt.workers.dev` to that URL. No API key needed.
   - **Solo:** Get a [Gemini API key](https://aistudio.google.com/apikey) and set `GEMINI_API_KEY` (e.g. in `.env` or your shell).

3. **Run** (from any git repo with changes)
   ```bash
   commit-ai
   ```

That’s it. Use `commit-ai --dry-run` to only see the message; `commit-ai --no-stage` to use only already-staged changes.

---

## Requirements

- Node.js 20+
- Either: a [Gemini API key](https://aistudio.google.com/apikey) (local), or a Worker URL shared with you (no key)

---

## Setup (detailed)

### Option A — Local (your own API key)

1. Copy the example env and add your key:
   ```bash
   cp .env.example .env
   # Edit .env: GEMINI_API_KEY=your_key
   ```
2. The CLI loads `GEMINI_API_KEY` from `.env` (when run from this project) or from your environment.

### Option B — Cloudflare Worker (key in Cloudflare, not on your machine)

1. **One person** deploys the Worker once (see [Cloudflare Worker guide](commit-jugaadism-cloudflare-worker-guide.md)):
   ```bash
   cd worker
   npm install
   npx wrangler login
   npx wrangler secret put GEMINI_API_KEY   # paste key once; stored in Cloudflare
   npm run deploy
   ```
2. **Everyone** (including the deployer) sets only the Worker URL—no API key:
   ```bash
   export COMMIT_JUGAADISM_WORKER_URL="https://commit-jugaadism.<your-subdomain>.workers.dev"
   ```

**Sharing:** Deploy once, share the **Worker URL**. Others install the CLI, set that URL, run `commit-ai`. No Gemini key or Wrangler for them.

---

## Usage

From inside a git repo:

```bash
# Stage all, generate message, commit
commit-ai
# or with alias:
cja

# Preview the message only (no commit)
commit-ai --dry-run

# Use only already-staged changes (no git add)
commit-ai --no-stage
```

Messages are conventional with a title and a short description of what changed.

---

## Shell alias

**Zsh / Bash** — add to `~/.zshrc` or `~/.bashrc`:

```bash
alias cja="commit-ai"   # if you ran npm link
export GEMINI_API_KEY="your_key"
# Or with Worker: export COMMIT_JUGAADISM_WORKER_URL="https://..."
```

If you don’t install globally, use the full path:

```bash
alias cja="node /path/to/commit-jugaadism/src/cli.js"
```

Then run `source ~/.zshrc` (or `~/.bashrc`).

**PowerShell** — add to `$PROFILE`:

```powershell
Set-Alias -Name cja -Value commit-ai
$env:GEMINI_API_KEY = "your_key"
# Or: $env:COMMIT_JUGAADISM_WORKER_URL = "https://..."
```

Reload: `. $PROFILE`

---

## Cloudflare Worker (optional)

The `worker/` folder is a small server that calls Gemini for you. One person deploys it and adds the API key via `wrangler secret put`; after that, everyone uses the Worker URL. Good for teams—one key, stored only in Cloudflare.

- Deploy: `cd worker && npm run deploy`
- Full guide: [commit-jugaadism-cloudflare-worker-guide.md](commit-jugaadism-cloudflare-worker-guide.md)

---

## License

MIT
