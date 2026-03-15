# commit-jugaadism

A terminal tool that reads git changes in the current directory, sends the diff to Gemini, and auto-commits with an AI-generated conventional commit message.

## Requirements

- Node.js 20+
- A [Gemini API key](https://aistudio.google.com/apikey)

## Install

```bash
npm install
```

For global use (so you can run `commit-ai` from anywhere):

```bash
npm link
# or
npm install -g .
```

## Setup (API key)

1. Copy the example env file and add your API key:

   ```bash
   cp .env.example .env
   # Edit .env and set GEMINI_API_KEY=your_key
   ```

2. The CLI loads `GEMINI_API_KEY` from your environment. If you run it from the project directory, it will also load from a `.env` file in the current working directory (via `dotenv`). Otherwise export it in your shell (see shell setup below).

**Optional — Cloudflare Worker:** To hide your API key on a server, you can deploy the Worker in `worker/` and set `COMMIT_JUGAADISM_WORKER_URL` to your Worker URL. The CLI will then send `status` and `diff` to the Worker and use the returned commit message. See [commit-jugaadism-cloudflare-worker-guide.md](commit-jugaadism-cloudflare-worker-guide.md).

## Shell setup (alias + env)

Use one of the following depending on your shell. Replace `/path/to/commit-jugaadism` with the actual path to this repo (e.g. `$HOME/projects/commit-jugaadism`).

### Zsh

1. Open your config:
   ```bash
   nano ~/.zshrc
   ```
   or
   ```bash
   code ~/.zshrc
   ```

2. Add (choose one):

   **If you installed globally** (`npm link` or `npm i -g .`):
   ```bash
   alias cja="commit-ai"
   ```

   **If you run from the repo** (loads `.env` when you run from the repo directory):
   ```bash
   alias cja="node /path/to/commit-jugaadism/src/cli.js"
   ```

3. Set the API key so it works from any directory. Add one of:
   ```bash
   export GEMINI_API_KEY="your_key_here"
   ```
   or to load from this repo’s `.env` whenever you run the alias:
   ```bash
   alias cja='source /path/to/commit-jugaadism/.env 2>/dev/null; node /path/to/commit-jugaadism/src/cli.js'
   ```
   (Note: `source` on a `.env` file only works if it contains `export GEMINI_API_KEY=key`; otherwise use `export GEMINI_API_KEY=...` in `.zshrc`.)

4. Reload:
   ```bash
   source ~/.zshrc
   ```

### Bash

1. Open your config:
   ```bash
   nano ~/.bashrc
   ```
   (or `~/.bash_profile` on macOS if you use that instead.)

2. Add the same alias and export as for Zsh:

   **Global install:**
   ```bash
   alias cja="commit-ai"
   export GEMINI_API_KEY="your_key_here"
   ```

   **Run from repo:**
   ```bash
   alias cja="node /path/to/commit-jugaadism/src/cli.js"
   export GEMINI_API_KEY="your_key_here"
   ```

3. Reload:
   ```bash
   source ~/.bashrc
   ```

### PowerShell

1. Open your profile (create if it doesn’t exist):
   ```powershell
   notepad $PROFILE
   ```
   If you get “cannot be loaded because running scripts is disabled”, run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. Add (replace the path and optionally set the key in the profile):

   **Global install** (after `npm link` from the repo):
   ```powershell
   Set-Alias -Name cja -Value commit-ai
   $env:GEMINI_API_KEY = "your_key_here"
   ```

   **Run via Node from repo:**
   ```powershell
   function cja { node "C:\path\to\commit-jugaadism\src\cli.js" @args }
   $env:GEMINI_API_KEY = "your_key_here"
   ```

3. Reload the profile:
   ```powershell
   . $PROFILE
   ```

## Usage

From inside a git repo:

```bash
# Stage all changes, generate message with Gemini, and commit
commit-ai
# or, after setting the alias:
cja

# Preview the message without committing
commit-ai --dry-run
cja --dry-run

# Use only already-staged changes (do not stage new changes)
commit-ai --no-stage
cja --no-stage
```

## License

MIT
