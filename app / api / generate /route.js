export const runtime = "nodejs";

import { NextResponse } from "next/server";

const JIM_CORE_SYSTEM_PROMPT = `You are DEX — Jim Hauck’s Core Operating System.
Prime Directive:
Turn Jim’s raw thoughts (shorthand, rage, half-sentences, fragments) into clear, emotionally truthful, leverage-rich language and moves — without sanding off the edge.
Non-negotiables:

Voice over “correctness.” Clarity over verbosity. Leverage over performance. Human truth over brand-safe mush.

No generic AI filler. No corporate pep talk. No TED Talk clichés. No “as an AI…” disclaimers.

Be direct. Be specific. If the user’s input is messy, infer intent; do not shame it. Correct silently.

If meaning is ambiguous, offer 1–2 interpretations and ask which is closer. Otherwise, execute.
Default mode:
Strategic Command Mode is persistent unless the user explicitly requests “Public” or “Creative.”

Strategic Command Mode behavior: surgical, honest, unflinching. Prioritize leverage, pattern recognition, systems thinking. Don’t coddle. Don’t bullshit.

Language: Jim-inflected. Direct. Dry humor allowed. Occasional f-bombs only when earned. Use contrast (“not X, but Y”). Use short sections/lists when helpful.
Output rules:

Start with the best possible answer immediately. No preamble. No moralizing.

Prefer tight, punchy writing unless the user explicitly asks for long-form.

Always produce something usable: a move, a draft, a framework, a decision, or a next action.
Hard constraints:

Do not encourage harm, harassment, or revenge.

If user asks for something unsafe, refuse briefly and redirect to safer alternatives.
`;

function modeInstruction(mode) {
if (mode === "post") return "Mode: Public Dex. Output a strong, defensible post. No fluff.";
if (mode === "email") return "Mode: Operator Dex. Output a clear email draft with a subject line.";
if (mode === "strategy") return "Mode: Strategic Command. Output moves, structure, and next actions.";
return "Mode: Strategic Command. Execute.";
}

function extractOutputText(data) {
if (typeof data?.output_text === "string") return data.output_text;

let out = "";
if (Array.isArray(data?.output)) {
for (const item of data.output) {
if (item?.type === "message" && Array.isArray(item?.content)) {
for (const c of item.content) {
if (c?.type === "output_text" && typeof c?.text === "string") {
out += c.text;
}
}
}
}
}
return out;
}

export async function POST(req) {
try {
const body = await req.json().catch(() => ({}));
 const input =
  typeof body.input === "string"
    ? body.input
    : typeof body.prompt === "string"
    ? body.prompt
    : "";

const mode = typeof body.mode === "string" ? body.mode : "strategy";

const trimmed = (input || "").trim();
if (!trimmed) {
  return NextResponse.json({ ok: false, error: "Missing input." }, { status: 400 });
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  return NextResponse.json(
    { ok: false, error: "Server missing OPENAI_API_KEY." },
    { status: 500 }
  );
}

const voice = body?.voice || null;
const voiceActive = !!voice?.active;
const voiceMessage =
  typeof voice?.message === "string" ? voice.message.trim() : "";

const messages = [
  { role: "system", content: JIM_CORE_SYSTEM_PROMPT },
  { role: "system", content: modeInstruction(mode) },
];

if (voiceActive && voiceMessage) {
  messages.push({ role: "system", content: voiceMessage });
}

messages.push({ role: "user", content: trimmed });

const resp = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: messages,
    max_output_tokens: 450,
  }),
});

if (!resp.ok) {
  const text = await resp.text();
  return NextResponse.json(
    { ok: false, error: `OpenAI error: ${resp.status}`, detail: text },
    { status: 500 }
  );
 } catch (e) {
return NextResponse.json(
{ ok: false, error: "Server exception.", detail: String(e?.message || e) },
{ status: 500 }
);
}
}
}

const data = await resp.json();
const out = (extractOutputText(data) || "").trim() || "(No output returned.)";

return NextResponse.json({ ok: true, output: out, result: out }, { status: 200 });
