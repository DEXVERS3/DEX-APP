import { NextResponse } from "next/server";

// This route is intentionally simple and safe.
// It will NOT break your UI.
// It will ALWAYS return JSON.

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    const prompt =
      typeof body.prompt === "string"
        ? body.prompt
        : typeof body.input === "string"
        ? body.input
        : "";

    return NextResponse.json({
      ok: true,
      result: prompt
        ? `DEX (safe mode): ${prompt}`
        : "DEX (safe mode): No input received",
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "Dex API error (safe mode)",
      },
      { status: 500 }
    );
  }
}
