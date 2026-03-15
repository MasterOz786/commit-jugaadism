const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function buildPrompt(status, diff) {
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

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("POST only", { status: 405, headers: { "Allow": "POST" } });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      return Response.json(
        { error: "Worker missing GEMINI_API_KEY. Run: wrangler secret put GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON body. Expected { status, diff }" },
        { status: 400 }
      );
    }

    const { status, diff } = body;
    if (typeof status !== "string" || typeof diff !== "string") {
      return Response.json(
        { error: "Body must include string fields: status, diff" },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(status, diff);
    const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json(
        { error: "Gemini API error", details: err },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text || typeof text !== "string") {
      return Response.json(
        { error: "Gemini returned no text", raw: data },
        { status: 502 }
      );
    }

    const commitMessage = text.trim().replace(/^["']|["']$/g, "").trim();
    return Response.json({ commitMessage });
  },
};
