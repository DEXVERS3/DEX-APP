1 file changed
+13
-90
lines changed
 
‎app / api / generate /route.js‎
+13-90Lines changed: 13 additions & 90 deletions
Original file line number	Diff line number	Diff line change
@@ -1,102 +1,25 @@
export const runtime = 'nodejs';
import { NextResponse } from "next/server";

const JIM_CORE_SYSTEM_PROMPT = `You are DEX — Jim Hauck’s Core Operating System.
Prime Directive:
Turn Jim’s raw thoughts (shorthand, rage, half-sentences, fragments) into clear, emotionally truthful, leverage-rich language and moves — without sanding off the edge.
Non-negotiables:
- Voice over “correctness.” Clarity over verbosity. Leverage over performance. Human truth over brand-safe mush.
- No generic AI filler. No corporate pep talk. No TED Talk clichés. No “as an AI…” disclaimers.
- Be direct. Be specific. If the user’s input is messy, infer intent; do not shame it. Correct silently.
- If meaning is ambiguous, offer 1–2 interpretations and ask which is closer. Otherwise, execute.
Default mode:
Strategic Command Mode is persistent unless the user explicitly requests “Public” or “Creative.”
- Strategic Command Mode behavior: surgical, honest, unflinching. Prioritize leverage, pattern recognition, systems thinking. Don’t coddle. Don’t bullshit.
- Language: Jim-inflected. Direct. Dry humor allowed. Occasional f-bombs only when earned. Use contrast (“not X, but Y”). Use short sections/lists when helpful.
Output rules:
- Start with the best possible answer immediately. No preamble. No moralizing.
- Prefer tight, punchy writing unless the user explicitly asks for long-form.
- Always produce something usable: a move, a draft, a framework, a decision, or a next action.
Hard constraints:
- Do not encourage harm, harassment, or revenge.
- If user asks for something unsafe, refuse briefly and redirect to safer alternatives.
`;
function modeInstruction(mode) {
  if (mode === 'post') return 'Mode: Public Dex. Output a strong, defensible post. No fluff.';
  if (mode === 'email') return 'Mode: Operator Dex. Output a clear email draft with a subject line.';
  if (mode === 'strategy') return 'Mode: Strategic Command. Output moves, structure, and next actions.';
  return 'Mode: Strategic Command. Execute.';
}
export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { input, mode } = await req.json();
    const body = await req.json().catch(() => null);

    const trimmed = (input || '').trim();
    if (!trimmed) {
      return Response.json({ error: 'Missing input.' }, { status: 400 });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'Server missing OPENAI_API_KEY.' },
        { status: 500 }
    if (!body || typeof body.prompt !== "string") {
      return NextResponse.json(
        { ok: false, error: "Missing `prompt` in request body." },
        { status: 400 }
      );
    }

    // Minimal call: Responses API
    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: [
          { role: 'system', content: JIM_CORE_SYSTEM_PROMPT },
          { role: 'system', content: modeInstruction(mode) },
          { role: 'user', content: trimmed },
        ],
        // keep it tight; you can raise later
        max_output_tokens: 450,
      }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      return Response.json(
        { error: `OpenAI error: ${resp.status}`, detail: text },
        { status: 500 }
      );
    }
    const data = await resp.json();
    // Extract text safely
    let out = '';
    if (data.output_text) out = data.output_text;
    else if (Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.type === 'message' && Array.isArray(item.content)) {
          for (const c of item.content) {
            if (c.type === 'output_text' && c.text) out += c.text;
          }
        }
      }
    }
    const result = `DEX ECHO: ${body.prompt}`;

    out = (out || '').trim();
    return Response.json({ output: out || '(No output returned.)' });
  } catch (e) {
    return Response.json(
      { error: 'Server exception.', detail: String(e?.message || e) },
    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (err) {
    console.error("API /generate error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
0 commit comments
Comments
0 (0)

You're not receiving notifications from this thread.
