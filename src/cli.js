#!/usr/bin/env node

import 'dotenv/config';
import {
  getRepoRoot,
  getStatus,
  getDiff,
  stageAll,
  commit,
  hasChangesToCommit,
} from './git.js';
import { getCommitMessage } from './llm.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const noStage = args.includes('--no-stage');
  return { dryRun, noStage };
}

async function run() {
  const cwd = process.cwd();
  const { dryRun, noStage } = parseArgs();

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

  let result;
  try {
    result = await getCommitMessage({ status, diff });
  } catch (err) {
    if (
      err.message?.includes('OPENROUTER_API_KEY') ||
      err.message?.includes('WORKER') ||
      err.message?.includes('OpenRouter')
    ) {
      console.error(err.message);
    } else {
      console.error('Failed to generate commit message:', err.message);
    }
    process.exit(1);
  }

  const { message, model } = result;

  if (dryRun) {
    console.log(message);
    console.log(`\nModel: ${model}`);
    process.exit(0);
  }

  try {
    await commit(message, cwd);
    console.log('Committed:', message);
    console.log(`Model: ${model}`);
  } catch (err) {
    console.error('Commit failed:', err.message);
    process.exit(1);
  }
}

run();
