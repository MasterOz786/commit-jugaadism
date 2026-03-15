import { GoogleGenAI } from '@google/genai';
import { buildCommitMessagePrompt } from './prompt.js';

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
    const msg = data.error || data.details || res.statusText;
    throw new Error(`Worker error (${res.status}): ${msg}`);
  }
  const message = data.commitMessage;
  if (!message || typeof message !== 'string') {
    throw new Error('Worker did not return commitMessage.');
  }
  return message.trim();
}

/**
 * Generate a commit message using Gemini from git status and staged diff (local).
 * @param {{ status: string; diff: string }} options
 * @returns {Promise<string>}
 */
export async function generateCommitMessage(options) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      'GEMINI_API_KEY is not set. Set it in your environment or .env file. Get a key at https://aistudio.google.com/apikey'
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildCommitMessagePrompt(options);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: prompt,
  });

  const text = response?.text;
  if (!text || typeof text !== 'string') {
    throw new Error('Gemini did not return a valid commit message.');
  }

  return text.trim().replace(/^["']|["']$/g, '').trim();
}

/**
 * Get commit message: from Worker if COMMIT_JUGAADISM_WORKER_URL is set, else from local Gemini.
 * @param {{ status: string; diff: string }} options
 * @returns {Promise<string>}
 */
export async function getCommitMessage(options) {
  if (WORKER_URL && WORKER_URL.trim()) {
    return generateCommitMessageFromWorker(options);
  }
  return generateCommitMessage(options);
}
