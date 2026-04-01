const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

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
      return new Response("POST only", { status: 405, headers: { Allow: "POST" } });
    }

    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      return Response.json(
        {
          error:
            "Worker missing OPENROUTER_API_KEY. Run: npx wrangler secret put OPENROUTER_API_KEY",
        },
        { status: 500 }
      );
    }

    const model =
      (env.OPENROUTER_MODEL && env.OPENROUTER_MODEL.trim()) ||
      "nvidia/nemotron-3-super-120b-a12b:free";

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
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          (env.OPENROUTER_HTTP_REFERER && env.OPENROUTER_HTTP_REFERER.trim()) ||
          "https://github.com/commit-jugaadism",
        "X-Title": "commit-jugaadism",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json(
        { error: "OpenRouter API error", details: errText },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text || typeof text !== "string") {
      return Response.json(
        { error: "OpenRouter returned no text", raw: data },
        { status: 502 }
      );
    }

    const commitMessage = text.trim().replace(/^["']|["']$/g, "").trim();
    return Response.json({ commitMessage });
  },
};
