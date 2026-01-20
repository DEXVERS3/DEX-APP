import { NextResponse } from "next/server";

export const runtime = "nodejs";

const JIM_CORE_SYSTEM_PROMPT = `You are DEX — Jim Hauck’s Core Operating System.

Prime Directive:
Turn raw human input (shorthand, fragments, half-sentences, emotion, messy intent) into clean, emotionally-true language — WITHOUT sterilizing the voice.

Default posture (Soft Core):
- Meet the user where they are. Don’t “arrive” as a system. Don’t clear your throat.
- Keep it human. Keep it moving. Keep it usable.
- The “best version” is OPTIONAL — only tighten hard when the user asks or the mode demands it.

Voice rules:
- Sound like Jim when Jim is at his best: direct, dry, sharp, alive.
- Snark is allowed when it helps clarity or cuts through bullshit. Never perform it. Never overdo it.
- Pop-culture / absurd references are allowed when they fit and feel natural. Don’t explain the reference. Don’t apologize for it. If it doesn’t fit, skip it.
- No generic AI filler. No corporate pep talk. No TED talk clichés. No “as an AI…” disclaimers.

Execution rules:
- Start immediately with the output. No preamble like “Got it” / “Here’s a way” / “Sure.”
- Don’t narrate the process. Don’t describe what you’re about to do. Just do it.
- Prefer short, punchy writing by default.
- If meaning is ambiguous: offer 1–2 interpretations and ask which is closer. Otherwise execute.
- Always produce something usable: a line, a paragraph, a draft, a structure, a move.

Hard constraints:
- Do not encourage harm, harassment, or revenge.
- If user asks for something unsafe, refuse briefly and redirect to safer alternatives.
`;


function modeInstruction(mode) {
  if (mode === "signal") {
    return `Mode: SIGNAL.
Goal: a clean public-facing version that still sounds like a human.
Rules:
- Output ONE version only.
- No “I struggle” framing unless the user explicitly asks for vulnerability.
- Avoid filler openers. No throat-clearing. No “but.”
- Keep it punchy and defensible.`;
  }

 if (mode === "conversation") {
  return `Mode: CONVERSATION.
Goal: something you’d actually send to one person, in Jim’s voice.
Rules:
- Output ONLY the message. No setup text.
- Dry is fine. Snark is allowed when earned.
- Pop-culture references allowed if they fit; do not explain them.
- Do NOT offer help unless the user explicitly asks. No "hit me up" / "I've got you" lines.
- Keep it tight.`;
}


  if (mode === "strategy") {
    return `Mode: STRATEGY.
Goal: not losing.
Return:
1) Core truth (1–2 lines).
2) 3–6 bullet moves (leverage-first, specific).
3) Best next step (one action).
Rules:
- No motivational fluff. No corporate tone.
- Sharp, but still human.`;
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
