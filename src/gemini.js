import { GoogleGenAI } from '@google/genai';
import { buildCommitMessagePrompt } from './prompt.js';

/**
 * Generate a commit message using Gemini from git status and staged diff.
 * @param {{ status: string; diff: string }} options
 * @returns {Promise<string>} Single-line commit message
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
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const text = response?.text;
  if (!text || typeof text !== 'string') {
    throw new Error('Gemini did not return a valid commit message.');
  }

  return text.trim().replace(/^["']|["']$/g, '').split('\n')[0].trim();
}
