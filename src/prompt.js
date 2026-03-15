/**
 * Build the prompt sent to Gemini for commit message generation.
 * @param {{ status: string; diff: string; includeFiles?: boolean }} options
 * @returns {string}
 */
export function buildCommitMessagePrompt(options) {
  const { status, diff } = options;
  return `You are a commit message generator. Given the following git status and diff, produce a conventional commit message with:

1. A short title on the first line (e.g. "feat: add X", "fix: Y", "chore: Z"). Keep it under 72 characters.
2. A blank line, then a brief description of what changed and why (2–4 sentences). Summarize the actual code changes, not generic text.

Do not wrap in quotes. Do not add labels like "Title:" or "Description:". Output only the commit message (title, blank line, body).

Git status:
${status}

Staged diff:
${diff}

Output only the commit message.`;
}
