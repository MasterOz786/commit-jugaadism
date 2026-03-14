import { GoogleGenAI } from '@google/genai';
import { buildCommitMessagePrompt } from './prompt.js';

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

  return text.trim().replace(/^["']|["']$/g, '').split('\n')[0].trim();
}
