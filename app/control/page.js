'use client';

import { useState } from 'react';

/* =========================
   DEX CORE (INVARIANT)
========================= */
const CORE_INVARIANT = `
DEX CORE (always active):
- Compression over verbosity
- Intent over politeness
- No filler
- No hedging
- Clear moves, not commentary
`;

/* =========================
   AS-LAYER PRESETS
========================= */
const MASKS = [
  {
    id: 'founder',
    name: 'Founder Voice',
    description: 'Decisive, directional, stakes-aware. Fewer adjectives. Clear calls.',
    rules: [
      'Short sentences',
      'No metaphors',
      'Assume authority',
      'End with next action',
    ],
  },
  {
    id: 'operator',
    name: 'Operator Voice',
    description: 'Calm, precise, execution-first. Minimal emotion.',
    rules: [
      'Neutral tone',
      'Bullet points preferred',
      'No hype',
      'Concrete steps only',
    ],
  },
  {
    id: 'human',
    name: 'Human Voice',
    description: 'Warm but not soft. Honest, direct, conversational.',
    rules: [
      'Plain language',
      'Light emotion allowed',
      'No jargon',
      'Still decisive',
    ],
  },
];

/* =========================
   FULL MASK SCHEMA
========================= */
const FULL_MASK_SCHEMA = {
  schema_version: 'dex-mask-v1',
  mask_id: null,
  mask_name: null,
  created_at: null,
  updated_at: null,

  collection: {
    rant: { text: '' },
    explain: { text: '' },
    warm: { text: '' },
  },

  storage: {
    persistence: {
      local_storage_key: 'dex.active_mask.v1',
      also_store_all_masks_key: 'dex.masks.v1',
    },
    active: {
      is_active: true,
    },
  },
};

/* =========================
   CONTROL ROOM
========================= */
export default function ControlRoom() {
  const [rant, setRant] = useState('');
  const [explain, setExplain] = useState('');
  const [warm, setWarm] = useState('');
  const [saved, setSaved] = useState(false);
  const [activeMask, setActiveMask] = useState(MASKS[0]);

  function saveMask() {
    const now = new Date().toISOString();

    const maskObject = {
      ...FULL_MASK_SCHEMA,
      mask_id: `mask_${now}`,
      mask_name: activeMask.name,
      created_at: now,
      updated_at: now,
      collection: {
        rant: { text: rant },
        explain: { text: explain },
        warm: { text: warm },
      },
      storage: {
        ...FULL_MASK_SCHEMA.storage,
        active: {
          is_active: true,
          as_layer: activeMask.id,
        },
      },
    };

    localStorage.setItem('dex.active_mask.v1', JSON.stringify(maskObject));

    const existing = JSON.parse(localStorage.getItem('dex.masks.v1') || '[]');
    existing.unshift(maskObject);
    localStorage.setItem('dex.masks.v1', JSON.stringify(existing));

    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const boxStyle = {
    width: '100%',
    background: '#0f0f0f',
    color: '#ffffff',
    border: '1px solid #2a2a2a',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    lineHeight: 1.5,
    outline: 'none',
  };

  return (
    <main
      style={{
        padding: 40,
        fontFamily: 'system-ui',
        color: '#fff',
        background: '#0b0b0b',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ fontSize: 42 }}>Control Room</h1>
      <p style={{ color: '#aaa', maxWidth: 720 }}>
        DEX Core is always active. Masks translate output into the user’s voice.
      </p>

      <section style={{ marginTop: 30 }}>
        <h3>DEX Core (Invariant)</h3>
        <pre style={{ background: '#111', padding: 16, borderRadius: 8 }}>
          {CORE_INVARIANT}
        </pre>
      </section>

      <section style={{ marginTop: 40 }}>
        <h3>User Voice (AS-Layer)</h3>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {MASKS.map((mask) => (
            <button
              key={mask.id}
              onClick={() => setActiveMask(mask)}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #333',
                background: activeMask.id === mask.id ? '#fff' : '#111',
                color: activeMask.id === mask.id ? '#000' : '#fff',
                cursor: 'pointer',
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
            {activeMask.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{ marginTop: 40 }}>
        <h3>Voice Mask Collection</h3>

        <h4>RANT</h4>
        <p style={{ color: '#aaa', fontSize: 13, maxWidth: 720 }}>
          Write the way you speak when you’re fed up and not editing yourself.
          No cleanup. No politeness. This is not for publishing.
        </p>
        <textarea
          value={rant}
          onChange={(e) => setRant(e.target.value)}
          rows={4}
          style={boxStyle}
        />

        <h4 style={{ marginTop: 20 }}>EXPLAIN</h4>
        <p style={{ color: '#aaa', fontSize: 13, maxWidth: 720 }}>
          Explain something you understand well to someone smart but unfamiliar.
          Clear. Direct. Natural tone.
        </p>
        <textarea
          value={explain}
          onChange={(e) => setExplain(e.target.value)}
          rows={4}
          style={boxStyle}
        />

        <h4 style={{ marginTop: 20 }}>WARM</h4>
        <p style={{ color: '#aaa', fontSize: 13, maxWidth: 720 }}>
          Write as you would to someone you care about who’s having a rough time.
          Don’t fix. Don’t perform. Just be human.
        </p>
        <textarea
          value={warm}
          onChange={(e) => setWarm(e.target.value)}
          rows={4}
          style={boxStyle}
        />

        <button
          onClick={saveMask}
          disabled={!rant || !explain || !warm}
          style={{
            marginTop: 20,
            padding: '10px 14px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Save Mask
        </button>

        {saved && <span style={{ marginLeft: 10 }}>Saved.</span>}
      </section>
    </main>
  );
}
