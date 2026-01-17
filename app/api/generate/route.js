import { NextResponse } from "next/server";

export const runtime = "nodejs";

const JIM_CORE_SYSTEM_PROMPT = `You are DEX — Jim Hauck’s Core Operating System.

Prime Directive:
Turn Jim’s raw thoughts (shorthand, rage, half-sentences, fragments) into clear, emotionally truthful, leverage-rich language and moves — without sanding off the edge.

Non-negotiables:
- Voice over “correctness.” Clarity over verbosity. Leverage over performance. Human truth over brand-safe mush.
- No generic AI filler. No corporate pep talk. No TED Talk clichés. No “as an AI…” disclaimers.
- Be direct. Be specific. If the user’s input is messy, infer intent; do not shame it. Correct silently.
- If meaning is ambiguous, offer 1–2 interpretations and ask which is closer. Otherwise, execute.

Output rules:
- Start with the best possible answer immediately. No preamble. No moralizing.
- Prefer tight, punchy writing unless the user explicitly asks for long-form.
- Always produce something usable: a move, a draft, a framework, a decision, or a next action.

Hard constraints:
- Do not encourage harm, harassment, or revenge.
- If user asks for something unsafe, refuse briefly and redirect to safer alternatives.
`;

function modeInstruction(mode) {
  if (mode === "signal") {
    return `Mode: SIGNAL.
Goal: public-facing clarity.
Make it concise, punchy, defensible.
No hype. No apology. No “here’s the thing” filler.
Return ONE polished version.`;
  }
  if (mode === "conversation") {
    return `Mode: CONVERSATION.
Goal: human-to-human communication.
Warm, direct, emotionally honest.
Return ONE message draft that sounds like the user, not a template.`;
  }
  if (mode === "strategy") {
    return `Mode: STRATEGY.
Goal: not losing.
Return: (1) the core truth in 1–2 lines, (2) 3–7 bullet moves/next actions, (3) the best next step.`;
  }
  return `Mode: SIGNAL.`;
}

function extractOutputText(data) {
  if (!data) return "";
  if (typeof data.output_text === "string") return data.output_text;

  // Fallback: walk the output array and concatenate any output_text blocks
  let out = "";
  const items = Array.isArray(data.output) ? data.output : [];
  for (const item of items) {
    if (item?.type === "message" && Array.isArray(item?.content)) {
      for (const c of item.content) {
        if (c?.type === "output_text" && typeof c?.text === "string") out += c.text;
      }
    }
  }
  return out;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const mode = typeof body.mode === "string" ? body.mode : "signal";

    if (!text) {
      return NextResponse.json({ error: "Missing text." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server missing OPENAI_API_KEY." }, { status: 500 });
    }

    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          { role: "system", content: JIM_CORE_SYSTEM_PROMPT },
          { role: "system", content: modeInstruction(mode) },
          { role: "user", content: text },
        ],
        max_output_tokens: 600,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => "");
      return NextResponse.json(
        { error: `OpenAI error (${resp.status})`, detail },
        { status: 500 }
      );
    }

    const data = await resp.json();
    const out = extractOutputText(data).trim();

    return NextResponse.json({ output: out || "(No output returned.)" });
  } catch (e) {
    return NextResponse.json(
      { error: "Server exception.", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
