import 'dotenv/config';
import {
  getRepoRoot,
  getStatus,
  getDiff,
  stageAll,
  commit,
  hasChangesToCommit,
} from './git.js';
import { generateCommitMessage } from './gemini.js';

async function run() {
  const cwd = process.cwd();
  const dryRun = process.argv.includes('--dry-run');
  const noStage = process.argv.includes('--no-stage');

  try {
    await getRepoRoot(cwd);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  if (!noStage) {
    await stageAll(cwd);
  }

  const hasChanges = await hasChangesToCommit(cwd);
  if (!hasChanges) {
    console.error('Nothing to commit. Stage some changes or add new files first.');
    process.exit(1);
  }

  const [status, diff] = await Promise.all([
    getStatus(cwd),
    getDiff({ staged: true, cwd }),
  ]);

  let message;
  try {
    message = await generateCommitMessage({ status, diff });
  } catch (err) {
    if (err.message?.includes('GEMINI_API_KEY')) {
      console.error(err.message);
    } else {
      console.error('Failed to generate commit message:', err.message);
    }
    process.exit(1);
  }

  if (dryRun) {
    console.log(message);
    process.exit(0);
  }

  try {
    await commit(message, cwd);
    console.log('Committed:', message);
  } catch (err) {
    console.error('Commit failed:', err.message);
    process.exit(1);
  }
}

run();
