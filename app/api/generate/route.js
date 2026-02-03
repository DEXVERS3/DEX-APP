export const runtime = "nodejs";

import { NextResponse } from "next/server";

function extractOutputText(data) {
  if (typeof data?.output_text === "string") return data.output_text;

  let out = "";
  if (Array.isArray(data?.output)) {
    for (const item of data.output) {
      if (item?.type === "message") {
        for (const c of item.content || []) {
          if (c?.type === "output_text") out += c.text;
        }
      }
    }
  }
  return out;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const input = body.input || "";
    const mode = body.mode || "strategy";

    if (!input.trim()) {
      return NextResponse.json({ error: "Missing input." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY." }, { status: 500 });
    }

    const system = `
You are Dex.

You write in the voice of Jim Hauck.
Direct. Clear. Human.
No corporate tone.
No filler.
No explanations.
No coaching language.

You produce finished language, ready to publish.

Mode:
- signal = public-facing post / statement
- conversation = message to one person
- strategy = decision / positioning / leverage
Current mode: ${mode}
`;

    const messages = [
      { role: "system", content: system },
      { role: "user", content: input },
    ];

    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: messages,
        max_output_tokens: 450,
      }),
    });

    const data = await resp.json().catch(() => ({}));
    const output = extractOutputText(data) || "";

    if (!resp.ok) {
      const msg =
        typeof data?.error?.message === "string"
          ? data.error.message
          : `OpenAI error: ${resp.status}`;
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ output });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
