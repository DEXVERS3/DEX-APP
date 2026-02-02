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
}

const data = await resp.json();
const out = (extractOutputText(data) || "").trim() || "(No output returned.)";

return NextResponse.json({ ok: true, output: out, result: out }, { status: 200 });

} catch (e) {
return NextResponse.json(
{ ok: false, error: "Server exception.", detail: String(e?.message || e) },
{ status: 500 }
);
}
}
