import { NextResponse } from 'next/server';

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {}

  const text = typeof body.text === 'string' ? body.text : '';

  return NextResponse.json({
    output: `DEX RECEIVED:\n\n${text}`
  });
}
