'use client';

import { useMemo, useState } from 'react';

const MODE_PRESETS = {
  post: {
    label: 'Post',
    helper: 'Short, punchy, public-facing.',
    placeholder: 'What do you want to say publicly?',
  },
  email: {
    label: 'Email',
    helper: 'Direct, clear, actionable.',
    placeholder: 'What do you need to say in an email?',
  },
  strategy: {
    label: 'Strategy',
    helper: 'Structured thinking. No fluff.',
    placeholder: 'What are we deciding / solving?',
  },
};

function buildMockOutput(input, mode) {
  const trimmed = (input || '').trim();
  if (!trimmed) return '';

  const header =
    mode === 'post'
      ? 'Draft (Post)'
      : mode === 'email'
        ? 'Draft (Email)'
        : 'Notes (Strategy)';

  return `${header}\n\n${trimmed}\n\n—\nDex v1 shell is live. Next: wire the Generate button to your Dex engine.`;
}';
export default function Page() {
  const [mode, setMode] = useState('post');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const preset = useMemo(() => MODE_PRESETS[mode], [mode]);

 const onGenerate = async () => {
  const trimmed = (input || '').trim();
  if (!trimmed) return;

  setOutput('Generating…');

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: trimmed, mode }),
    });

    const data = await res.json();

    if (!res.ok) {
      setOutput(`Error: ${data?.error || 'Request failed.'}\n\n${data?.detail || ''}`);
      return;
    }

    setOutput(data.output || '(Empty output.)');
  } catch (err) {
    setOutput(`Error: ${String(err?.message || err)}`);
  }
};


  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      alert('Copied.');
    } catch {
      alert('Copy failed. Select the text and copy manually.');
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>DEX</div>
            <div style={styles.sub}>Your Voice. On Demand.</div>
          </div>
          <div style={styles.badge}>Control Room</div>
        </div>

        <div style={styles.modeRow}>
          {Object.entries(MODE_PRESETS).map(([key, v]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              style={{
                ...styles.modeBtn,
                ...(mode === key ? styles.modeBtnActive : null),
              }}
              type="button"
            >
              {v.label}
            </button>
          ))}
        </div>

        <div style={styles.helper}>{preset.helper}</div>

        <label style={styles.label}>Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={preset.placeholder}
          style={styles.textarea}
        />

        <div style={styles.actions}>
          <button onClick={onGenerate} style={styles.primary} type="button">
            Generate in My Voice
          </button>
          <button
            onClick={() => {
              setInput('');
              setOutput('');
            }}
            style={styles.secondary}
            type="button"
          >
            Reset
          </button>
        </div>

        <label style={styles.label}>Output</label>
        <div style={styles.outputWrap}>
          <pre style={styles.output}>{output || 'Output will appear here.'}</pre>
          <button
            onClick={onCopy}
            style={{
              ...styles.copyBtn,
              ...(output ? null : styles.copyBtnDisabled),
            }}
            type="button"
            disabled={!output}
            title={output ? 'Copy output' : 'Generate something first'}
          >
            Copy
          </button>
        </div>

        <div style={styles.footer}>
          v1 product surface is live. Next: connect generation + payments.
        </div>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
    background: '#0b0b0f',
    color: '#f5f5f7',
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
  },
  card: {
    width: 'min(900px, 100%)',
    background: '#12121a',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: '16px',
    marginBottom: '14px',
  },
  title: { fontSize: '26px', fontWeight: 800, letterSpacing: '0.5px' },
  sub: { opacity: 0.8, marginTop: '4px' },
  badge: {
    fontSize: '12px',
    padding: '6px 10px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.10)',
    whiteSpace: 'nowrap',
  },
  modeRow: { display: 'flex', gap: '8px', margin: '10px 0 6px' },
  modeBtn: {
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.05)',
    color: '#f5f5f7',
    cursor: 'pointer',
  },
  modeBtnActive: {
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.18)',
  },
  helper: { opacity: 0.75, marginBottom: '12px' },
  label: { display: 'block', fontSize: '12px', opacity: 0.85, marginTop: '10px' },
  textarea: {
    width: '100%',
    minHeight: '140px',
    resize: 'vertical',
    marginTop: '6px',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.10)',
    background: '#0f0f15',
    color: '#f5f5f7',
    outline: 'none',
    lineHeight: 1.4,
  },
  actions: { display: 'flex', gap: '10px', marginTop: '12px' },
  primary: {
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(255,255,255,0.16)',
    color: '#f5f5f7',
    cursor: 'pointer',
    fontWeight: 700,
  },
  secondary: {
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    color: '#f5f5f7',
    cursor: 'pointer',
  },
  outputWrap: {
    position: 'relative',
    marginTop: '6px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.10)',
    background: '#0f0f15',
    padding: '12px',
    minHeight: '140px',
  },
  output: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    lineHeight: 1.4,
    opacity: 0.95,
  },
  copyBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '8px 10px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    color: '#f5f5f7',
    cursor: 'pointer',
    fontSize: '12px',
  },
  copyBtnDisabled: {
    opacity: 0.45,
    cursor: 'not-allowed',
  },
  footer: { marginTop: '14px', opacity: 0.65, fontSize: '12px' },
};
