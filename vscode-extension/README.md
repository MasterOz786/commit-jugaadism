# Commit Jugaadism

AI-powered git commit from VS Code: reads your changes, generates a conventional commit message with Google Gemini, and commits.

## Features

- **Commit with AI** – Stage all changes, generate a one-line conventional commit message (feat/fix/chore) via Gemini, and commit.
- **Preview message (dry run)** – Generate and view the message without committing.

## Setup

1. **Gemini API key**  
   Get a key at [Google AI Studio](https://aistudio.google.com/apikey).

2. **Configure the extension**  
   - Open Settings (`Ctrl+,` / `Cmd+,`).
   - Search for `Commit Jugaadism` or `commitJugaadism.geminiApiKey`.
   - Set **Commit Jugaadism: Gemini Api Key** to your API key.

   Or set the `GEMINI_API_KEY` environment variable (e.g. in your shell profile).

## Usage

1. Open a workspace folder that is a git repository.
2. Make some changes.
3. Run:
   - **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`) → **Commit with AI (Commit Jugaadism)** to stage, generate message, and commit.
   - Or **Commit with AI: Preview message only (dry run)** to only see the suggested message.

## Commands

| Command | Description |
|--------|-------------|
| `Commit with AI (Commit Jugaadism)` | Stage all, generate message with Gemini, commit |
| `Commit with AI: Preview message only (dry run)` | Generate message only, no commit |

## Requirements

- VS Code 1.74+
- Node.js 20+ (used to run the bundled CLI)
- A Gemini API key

## License

MIT
