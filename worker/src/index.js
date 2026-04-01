const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Keep in sync with src/openrouter-models.js */
const DEFAULT_OPENROUTER_MODEL = "stepfun/step-3.5-flash:free";
const OPENROUTER_MODEL_FALLBACK_CHAIN = [
  "stepfun/step-3.5-flash:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "minimax/minimax-m2.5:free",
];

function modelAttemptOrder(primary) {
  const seen = new Set();
  const order = [];
  for (const id of [primary, ...OPENROUTER_MODEL_FALLBACK_CHAIN]) {
    const t = (id || "").trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    order.push(t);
  }
  return order;
}

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

    const primary =
      (env.OPENROUTER_MODEL && env.OPENROUTER_MODEL.trim()) ||
      DEFAULT_OPENROUTER_MODEL;

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
    const headers = {
      Authorization: `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        (env.OPENROUTER_HTTP_REFERER && env.OPENROUTER_HTTP_REFERER.trim()) ||
        "https://github.com/commit-jugaadism",
      "X-Title": "commit-jugaadism",
    };

    const failures = [];
    const models = modelAttemptOrder(primary);
    for (const model of models) {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const errText =
          data !== null && typeof data === "object"
            ? JSON.stringify(data)
            : `non-JSON error body`;
        failures.push(`${model} (${res.status}): ${errText}`);
        continue;
      }

      if (!data) {
        failures.push(`${model}: invalid JSON response`);
        continue;
      }

      const text = data?.choices?.[0]?.message?.content;
      if (!text || typeof text !== "string") {
        failures.push(`${model}: no text in response`);
        continue;
      }

      const commitMessage = text.trim().replace(/^["']|["']$/g, "").trim();
      return Response.json({ commitMessage });
    }

    return Response.json(
      {
        error: "OpenRouter API error",
        details: `all models failed — ${failures.join(" | ")}`,
      },
      { status: 502 }
    );
  },
};
