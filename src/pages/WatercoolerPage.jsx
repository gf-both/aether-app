import { useState, useEffect, useCallback } from 'react'
import { generateConversations } from '../lib/watercoolerEngine'
import { loadThreads, addThreads, clearThreads } from '../lib/watercoolerStore'

// ── Styles ──
const S = {
  page: {
    width: '100%', height: '100%', overflow: 'auto',
    padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  header: {
    textAlign: 'center', marginBottom: '0.5rem',
  },
  title: {
    fontSize: '2rem', fontFamily: "'Cinzel', serif",
    color: 'var(--foreground)', letterSpacing: '.1em',
  },
  subtitle: {
    color: 'var(--muted-foreground)', fontSize: '1rem',
    marginTop: '0.25rem', fontStyle: 'italic',
  },
  controls: {
    display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap',
  },
  btn: {
    padding: '0.5rem 1.5rem', borderRadius: '6px', border: '1px solid var(--border)',
    background: 'var(--card)', color: 'var(--foreground)', cursor: 'pointer',
    fontFamily: "'Cinzel', serif", fontSize: '0.85rem', letterSpacing: '.05em',
    transition: 'all .15s',
  },
  btnPrimary: {
    padding: '0.5rem 1.5rem', borderRadius: '6px', border: '1px solid var(--accent, var(--border))',
    background: 'var(--accent, #7c3aed)', color: '#fff', cursor: 'pointer',
    fontFamily: "'Cinzel', serif", fontSize: '0.85rem', letterSpacing: '.05em',
    transition: 'all .15s',
  },
  feed: {
    display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '720px',
    width: '100%', margin: '0 auto',
  },
  empty: {
    textAlign: 'center', color: 'var(--muted-foreground)', padding: '4rem 1rem',
    fontSize: '1.1rem',
  },
  thread: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: '10px', overflow: 'hidden', cursor: 'pointer',
    transition: 'border-color .15s',
  },
  threadHeader: {
    padding: '0.75rem 1rem', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap',
  },
  chips: {
    display: 'flex', gap: '0.35rem', flexWrap: 'wrap',
  },
  chip: {
    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
    padding: '0.15rem 0.5rem', borderRadius: '999px',
    background: 'rgba(255,255,255,0.06)', fontSize: '0.75rem',
    color: 'var(--foreground)', whiteSpace: 'nowrap',
  },
  topicLabel: {
    fontSize: '0.8rem', color: 'var(--muted-foreground)', fontStyle: 'italic',
  },
  timestamp: {
    fontSize: '0.7rem', color: 'var(--muted-foreground)', whiteSpace: 'nowrap',
  },
  messages: {
    padding: '0 1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
  },
  bubble: {
    padding: '0.5rem 0.75rem', borderRadius: '8px',
    background: 'rgba(255,255,255,0.04)',
  },
  bubbleName: {
    fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.15rem',
    fontWeight: 600,
  },
  bubbleText: {
    fontSize: '0.9rem', color: 'var(--foreground)', lineHeight: 1.45,
  },
  skeleton: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
  },
  skelLine: {
    height: '0.85rem', borderRadius: '4px',
    background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite',
  },
}

function formatTime(ts) {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function Thread({ thread }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={S.thread} onClick={() => setOpen(o => !o)}>
      <div style={S.threadHeader}>
        <div style={S.chips}>
          {thread.participants.map(p => (
            <span key={p.id} style={S.chip}>{p.emoji} {p.name.split('—')[0].trim().slice(0, 18)}</span>
          ))}
        </div>
        <span style={S.topicLabel}>{thread.topic}</span>
        <span style={S.timestamp}>{formatTime(thread.createdAt)}</span>
      </div>
      {open && (
        <div style={S.messages}>
          {thread.messages.map((m, i) => (
            <div key={i} style={S.bubble}>
              <div style={S.bubbleName}>{m.agentEmoji} {m.agentName}</div>
              <div style={S.bubbleText}>{m.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SkeletonThread() {
  return (
    <div style={S.skeleton}>
      <div style={{ ...S.skelLine, width: '60%' }} />
      <div style={{ ...S.skelLine, width: '80%' }} />
      <div style={{ ...S.skelLine, width: '45%' }} />
    </div>
  )
}

export default function WatercoolerPage() {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setThreads(loadThreads())
  }, [])

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    try {
      const newThreads = await generateConversations((thread) => {
        setThreads(prev => [thread, ...prev])
      })
      if (newThreads.length) {
        const saved = addThreads(newThreads)
        setThreads(saved)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const handleClear = useCallback(() => {
    setThreads(clearThreads())
  }, [])

  return (
    <div style={S.page}>
      <style>{`@keyframes pulse { 0%,100% { opacity: .4 } 50% { opacity: .8 } }`}</style>
      <div style={S.header}>
        <div style={S.title}>☕ Watercooler</div>
        <div style={S.subtitle}>The Paperclip team, unfiltered</div>
      </div>

      <div style={S.controls}>
        <button style={S.btnPrimary} onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate'}
        </button>
        {threads.length > 0 && (
          <button style={S.btn} onClick={handleClear}>Clear All</button>
        )}
      </div>

      <div style={S.feed}>
        {loading && threads.length === 0 && (
          <>
            <SkeletonThread />
            <SkeletonThread />
            <SkeletonThread />
          </>
        )}
        {!loading && threads.length === 0 && (
          <div style={S.empty}>No conversations yet. Hit Generate to get the team talking.</div>
        )}
        {threads.map(t => <Thread key={t.id} thread={t} />)}
      </div>
    </div>
  )
}
