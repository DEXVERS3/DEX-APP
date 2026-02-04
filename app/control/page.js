'use client';

import { useState } from 'react';

const CORE_INVARIANT = `
DEX CORE (always active):
- Compression over verbosity
- Intent over politeness
- No filler
- No hedging
- Clear moves, not commentary
`;

const MASKS = [
  {
    id: 'founder',
    name: 'Founder Voice',
    description: 'Decisive, directional, stakes-aware. Fewer adjectives. Clear calls.',
    rules: [
      'Short sentences',
      'No metaphors',
      'Assume authority',
      'End with next action'
    ]
  },
  {
    id: 'operator',
    name: 'Operator Voice',
    description: 'Calm, precise, execution-first. Minimal emotion.',
    rules: [
      'Neutral tone',
      'Bullet points preferred',
      'No hype',
      'Concrete steps only'
    ]
  },
  {
    id: 'human',
    name: 'Human Voice',
    description: 'Warm but not soft. Honest, direct, conversational.',
    rules: [
      'Plain language',
      'Light emotion allowed',
      'No jargon',
      'Still decisive'
    ]
  }
];

export default function ControlRoom() {
const [rant, setRant] = useState("");
  const [explain, setExplain] = useState("");
  const [warm, setWarm] = useState("");
  const [saved, setSaved] = useState(false);
  const [activeMask, setActiveMask] = useState(MASKS[0]);

  return (
    <main style={{ padding: 40, fontFamily: 'system-ui', color: '#fff', background: '#0b0b0b', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 42, marginBottom: 10 }}>Control Room</h1>
      <p style={{ color: '#aaa', maxWidth: 720 }}>
        DEX Core is always active.  
        Masks translate output into the user’s voice.
      </p>

      <section style={{ marginTop: 30 }}>
        <h3>DEX Core (Invariant)</h3>
        <pre style={{ background: '#111', padding: 16, borderRadius: 8 }}>{CORE_INVARIANT}</pre>
      </section>

      <section style={{ marginTop: 40 }}>
        <h3>User Voice (AS-Layer)</h3>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {MASKS.map(mask => (
            <button
              key={mask.id}
              onClick={() => setActiveMask(mask)}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #333',
                background: activeMask.id === mask.id ? '#fff' : '#111',
                color: activeMask.id === mask.id ? '#000' : '#fff',
                cursor: 'pointer'
              }}
            >
              {mask.name}
            </button>
          ))}
        </div>

        <div style={{ background: '#111', padding: 20, borderRadius: 10 }}>
          <h4>{activeMask.name}</h4>
          <p style={{ color: '#bbb' }}>{activeMask.description}</p>
          <ul>
            {activeMask.rules.map(r => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
