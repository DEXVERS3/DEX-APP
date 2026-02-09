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
- Start immediately with the output. No preamble.
- Don’t narrate the process. Just execute.
- Prefer short, punchy writing by default.
- Preserve the user’s tone. Do NOT professionalize unless explicitly asked.
- If the input is sharp, stay sharp.
- If the input is restrained, stay restrained.
- If the input is fragmented, do not over-smooth.
- Amplify distinct phrasing. Do not normalize it.
- Always produce something usable.

Hard constraints:
- Do not encourage harm, harassment, or revenge.
- If unsafe, refuse briefly and redirect.
`;

const JIM_COPY_ENFORCEMENT = `COPY STANDARD — NON-NEGOTIABLE:

1. Ban generic radio clichés and empty urgency unless intentionally subverted:
   “Don’t wait,” “Hurry in,” “Now’s the time,” “Limited time,”
   “Friendly staff,” “Great service,” “Quality you can trust,” etc.

2. Delete any sentence that could apply to any business in America.

3. Every line must either:
   - introduce tension,
   - sharpen the offer,
   - or move toward an earned conclusion.

4. Opening must use contrast, specificity, or disruption.
   Never neutral openers.

5. Compress aggressively. Shorter is stronger when meaning survives.

6. CTA must feel earned. If stapled on, restructure the script.

7. Remove filler transitions and empty enthusiasm.

8. If the draft reads statistically average, rewrite once for elevation.

Return ONLY the final script.
No explanations.
`;

function modeInstruction(mode) {
  if (mode === "signal") {
    return `Mode: SIGNAL.
Output ONE version only.
Keep it punchy, defensible, clean.

${JIM_COPY_ENFORCEMENT}`;
  }

  if (mode === "conversation") {
    return `Mode: CONVERSATION.
Output ONLY the message.
Dry allowed. Snark allowed when earned.
Keep it tight.

${JIM_COPY_ENFORCEMENT}`;
  }

  if (mode === "strategy") {
    return `Mode: STRATEGY.
Return:
1) Core truth (1–2 lines).
2) 3–6 bullet moves.
3) Best next step.

No fluff.

${JIM_COPY_ENFORCEMENT}`;
  }

  return `Mode: SIGNAL.

${JIM_COPY_ENFORCEMENT}`;
}

function extractOutputText(data) {
  if (!data) return "";
  if (typeof data.output_text === "string") return data.output_text;

  let out = "";
  const items = Array.isArray(data.output) ? data.output : [];
  for (const item of items) {
    if (item?.type === "message" && Array.isArray(item?.content)) {
      for (const c of item.content) {
        if (c?.type === "output_text" && typeof c?.text === "string") {
          out += c.text;
        }
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
