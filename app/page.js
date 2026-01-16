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
    <main style={{ padding: 40, maxWidth: 900, margin: '0 auto' }}>
      <h1>DEX</h1>

      <textarea
        placeholder="Enter text here"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        style={{ width: '100%', fontSize: 16 }}
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={generate} style={{ padding: '10px 14px', fontSize: 16 }}>
          Generate
        </button>
      </div>

      <pre style={{ marginTop: 18, whiteSpace: 'pre-wrap' }}>{out}</pre>
    </main>
  );
}
