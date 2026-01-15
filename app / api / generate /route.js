import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.prompt !== "string") {
      return NextResponse.json(
        { ok: false, error: "Missing `prompt` in request body." },
        { status: 400 }
      );
    }

    const result = `DEX ECHO: ${body.prompt}`;

    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (err) {
    console.error("API /generate error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
