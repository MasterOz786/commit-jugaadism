import { buildCommitMessagePrompt } from './prompt.js';
import {
  DEFAULT_OPENROUTER_MODEL,
  openRouterModelAttemptOrder,
} from './openrouter-models.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const WORKER_URL = process.env.COMMIT_JUGAADISM_WORKER_URL;

/**
 * Generate commit message by calling the commit-jugaadism Cloudflare Worker.
 * @param {{ status: string; diff: string }} options
 * @returns {Promise<string>}
 */
export async function generateCommitMessageFromWorker(options) {
  const url = (WORKER_URL || '').trim();
  if (!url) throw new Error('COMMIT_JUGAADISM_WORKER_URL is not set.');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: options.status, diff: options.diff }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      typeof data.details === 'string' ? data.details.trim() : '';
    const err = data.error || res.statusText || 'Unknown';
    const msg = detail ? `${err} — ${detail.slice(0, 500)}` : err;
    throw new Error(`Worker error (${res.status}): ${msg}`);
  }
  const message = data.commitMessage;
  if (!message || typeof message !== 'string') {
    throw new Error('Worker did not return commitMessage.');
  }
  return message.trim();
}

/**
 * Generate a commit message via OpenRouter (any model on [OpenRouter](https://openrouter.ai)).
 * @param {{ status: string; diff: string }} options
 * @returns {Promise<string>}
 */
export async function generateCommitMessage(options) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      'OPENROUTER_API_KEY is not set. Get a key at https://openrouter.ai/keys and add it to .env or your environment.'
    );
  }

  const primary =
    (process.env.OPENROUTER_MODEL || '').trim() || DEFAULT_OPENROUTER_MODEL;
  const models = openRouterModelAttemptOrder(primary);
  const prompt = buildCommitMessagePrompt(options);

  const headers = {
    Authorization: `Bearer ${apiKey.trim()}`,
    'Content-Type': 'application/json',
  };
  const referer = process.env.OPENROUTER_HTTP_REFERER?.trim();
  if (referer) headers['HTTP-Referer'] = referer;
  headers['X-Title'] = 'commit-jugaadism';

  const failures = [];
  for (const model of models) {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err =
        data?.error?.message ||
        data?.error ||
        (typeof data === 'string' ? data : JSON.stringify(data));
      failures.push(`${model} (${res.status}): ${err}`);
      continue;
    }

    const text = data?.choices?.[0]?.message?.content;
    if (!text || typeof text !== 'string') {
      failures.push(`${model}: no text in response`);
      continue;
    }

    return text.trim().replace(/^["']|["']$/g, '').trim();
  }

  throw new Error(
    `OpenRouter: all models failed — ${failures.join(' | ')}`
  );
}

/**
 * Get commit message: from Worker if COMMIT_JUGAADISM_WORKER_URL is set, else from OpenRouter.
 * @param {{ status: string; diff: string }} options
 * @returns {Promise<string>}
 */
export async function getCommitMessage(options) {
  if (WORKER_URL && WORKER_URL.trim()) {
    return generateCommitMessageFromWorker(options);
  }
  return generateCommitMessage(options);
}
