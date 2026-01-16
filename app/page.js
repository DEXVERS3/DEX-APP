'use client';

import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [out, setOut] = useState('');

  async function generate() {
    const r = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const j = await r.json();
    setOut(j.output ?? JSON.stringify(j));
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0b0b0b',
        color: '#ffffff',
        padding: '60px 24px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont'
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 42, marginBottom: 8 }}>DEX</h1>
        <p style={{ color: '#b5b5b5', marginBottom: 32 }}>
          Your voice. At scale.
        </p>

        <textarea
          placeholder="Drop your raw thoughts here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          style={{
            width: '100%',
            background: '#111',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: 6,
            padding: 14,
            fontSize: 16
          }}
        />

        <div style={{ marginTop: 16 }}>
          <button
            onClick={generate}
            style={{
              background: '#ffffff',
              color: '#000',
              padding: '10px 18px',
              fontSize: 15,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Generate
          </button>
        </div>

        {out && (
          <pre
            style={{
              marginTop: 32,
              whiteSpace: 'pre-wrap',
              background: '#111',
              padding: 16,
              borderRadius: 6,
              border: '1px solid #333'
            }}
          >
            {out}
          </pre>
        )}
      </div>
    </main>
  );
}

