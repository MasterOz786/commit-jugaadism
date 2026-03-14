export function buildCommitMessagePrompt(options) {
  const { status, diff } = options;
  return `You are a commit message generator. Given the following git status and diff, produce exactly one single-line conventional commit message (e.g. "feat: add X", "fix: Y", "chore: Z"). Do not wrap the message in quotes. Do not add any explanation or extra lines—only the one-line commit message.

Git status:
${status}

Staged diff:
${diff}

Reply with only the one-line commit message, nothing else.`;
}
