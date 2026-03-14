import simpleGit from 'simple-git';

/**
 * @param {string} [cwd]
 * @returns {import('simple-git').SimpleGit}
 */
function getGit(cwd = process.cwd()) {
  return simpleGit({ baseDir: cwd });
}

/**
 * Ensure cwd is a git repo; return root path or throw.
 * @param {string} [cwd]
 * @returns {Promise<string>} Repo root path
 */
export async function getRepoRoot(cwd = process.cwd()) {
  const git = getGit(cwd);
  try {
    const root = await git.revparse(['--show-toplevel']);
    return root.trim();
  } catch {
    throw new Error('Not a git repository. Run this command from inside a git repo.');
  }
}

/**
 * Get git status as text (for prompt).
 * @param {string} [cwd]
 * @returns {Promise<string>}
 */
export async function getStatus(cwd = process.cwd()) {
  const git = getGit(cwd);
  try {
    const raw = await git.raw(['status', '--short']);
    const branch = await git.raw(['rev-parse', '--abbrev-ref', 'HEAD']).catch(() => 'unknown');
    const lines = [`On branch ${(branch || 'unknown').trim()}`, raw || 'No changes'];
    return lines.join('\n');
  } catch {
    return 'No changes';
  }
}

/**
 * Get diff. By default returns staged diff for use in commit message generation.
 * @param {{ staged?: boolean; cwd?: string }} [options]
 * @returns {Promise<string>}
 */
export async function getDiff(options = {}) {
  const { staged = true, cwd = process.cwd() } = options;
  const git = getGit(cwd);
  try {
    const diff = staged ? await git.diff(['--staged']) : await git.diff();
    return diff || '(no diff)';
  } catch (err) {
    throw new Error(`Failed to get git diff: ${err.message}`);
  }
}

/**
 * Stage all changes.
 * @param {string} [cwd]
 * @returns {Promise<void>}
 */
export async function stageAll(cwd = process.cwd()) {
  const git = getGit(cwd);
  await git.add(['-A']);
}

/**
 * Commit with the given message.
 * @param {string} message
 * @param {string} [cwd]
 * @returns {Promise<string>} Commit hash or result
 */
export async function commit(message, cwd = process.cwd()) {
  const git = getGit(cwd);
  const trimmed = message.trim().replace(/^["']|["']$/g, '');
  const result = await git.commit(trimmed);
  return result.commit;
}

/**
 * Check if there are staged changes to commit.
 * @param {string} [cwd]
 * @returns {Promise<boolean>}
 */
export async function hasChangesToCommit(cwd = process.cwd()) {
  const git = getGit(cwd);
  const diff = await git.diff(['--staged']);
  return !!(diff && diff.trim().length > 0);
}
