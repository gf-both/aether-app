/**
 * AIAgentsPage.jsx — Constellation
 *
 * Displays the user's personal constellation: their primary profile
 * plus all the people they've added. Click any non-primary profile
 * to view their data AND initiate a one-on-one golem dialogue.
 */

import { useState, useCallback, useEffect } from 'react'
import { useGolemStore } from '../store/useGolemStore'
import { useComputedProfile, useComputedPeople } from '../hooks/useActiveProfile'
import { runGolemExchange } from '../lib/golemConversation'

const REL_COLORS = {
  partner: '#d43070', spouse: '#f0a03c',
  'ex-spouse': '#a03050', 'ex-partner': '#a03050',
  mother: '#d43070', father: '#40ccdd',
  sibling: '#9050e0', child: '#60b030',
  grandparent: '#40a0cc', 'close-friend': '#6450ff',
  friend: '#8844ff', colleague: '#60a0c8',
  mentor: '#9050e0', 'business-partner': '#c9a84c',
  other: '#888',
}

function getRelColor(p) {
  if (p._isPrimary) return '#c9a84c'
  return REL_COLORS[p.rel] || '#888'
}

function hexToRgb(hex) {
  if (!hex || !hex.startsWith('#')) return '201,168,76'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

function profileSummary(p) {
  const parts = []
  if (p.sign && p.sign !== '?') parts.push(`${p.sign} Sun`)
  if (p.moon && p.moon !== '?') parts.push(`${p.moon} Moon`)
  if (p.asc && p.asc !== '?') parts.push(`${p.asc} Rising`)
  if (p.hdType && p.hdType !== '?') parts.push(p.hdType)
  if (p.lifePath && p.lifePath !== '?') parts.push(`LP ${p.lifePath}`)
  if (p.enneagramType) parts.push(`E${p.enneagramType}`)
  if (p.mbtiType) parts.push(p.mbtiType)
  return parts.join(' · ') || null
}

const DIALOGUE_PROMPTS = [
  (a, b) => `${b.name}, I've been thinking about what it means that our paths have crossed. What do you make of the connection between us?`,
  (a, b) => `There's something about you I haven't been able to stop thinking about. Tell me — what do you want from this?`,
  (a, b) => `I find myself wondering what you see when you look at me. Not what you say — what you actually see.`,
  (a, b) => `We've been circling each other. I want to have the real conversation. What's the thing you haven't said yet?`,
  (a, b) => `What do you think the point of us is? In the bigger picture — what does this connection actually mean?`,
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

// ── Profile card ──
function ProfileCard({ p, index, selected, onSelect }) {
  const color = getRelColor(p)
  const isSelected = selected === index
  const summary = profileSummary(p)

  return (
    <div
      onClick={() => onSelect(isSelected ? null : index)}
      style={{
        padding: '16px 18px', borderRadius: 12, cursor: 'pointer',
        background: isSelected ? `rgba(${hexToRgb(color)},.08)` : 'var(--card, #111)',
        border: `1px solid ${isSelected ? color : 'var(--border, #222)'}`,
        transition: 'all .15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: summary ? 10 : 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `rgba(${hexToRgb(color)},.12)`,
          border: `1.5px solid ${color}`, fontSize: 18, flexShrink: 0,
        }}>
          {p.emoji || (p._isPrimary ? '✦' : '👤')}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {p.name}
          </div>
          <div style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 1 }}>
            {p._isPrimary ? 'You' : (p.rel || 'other')}
          </div>
        </div>
      </div>
      {summary && (
        <div style={{ fontSize: 11, color: 'var(--muted-foreground, #777)', lineHeight: 1.65 }}>
          {summary}
        </div>
      )}
    </div>
  )
}

// ── Dialogue view (one-on-one golem exchange) ──
function GolemDialogue({ primaryProfile, otherProfile, onClose }) {
  const colorA = '#c9a84c'
  const colorB = getRelColor(otherProfile)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [initiated, setInitiated] = useState(true) // Auto-initiated

  const startDialogue = useCallback(async () => {
    setLoading(true)
    setInitiated(true)
    setMessages([])

    const prompt = pick(DIALOGUE_PROMPTS)(primaryProfile, otherProfile)
    const turns = []

    // 2 exchange turns — enough for a meaningful dialogue without hanging
    const SCENARIOS = [
      prompt,
      `Continue the conversation. React to what ${otherProfile.name} just said, then bring it to a close.`,
    ]

    for (let i = 0; i < SCENARIOS.length; i++) {
      const history = turns.flatMap(t => [
        { role: 'assistant', content: t.golemA },
        { role: 'user', content: t.golemB },
      ])

      const exchange = await runGolemExchange(primaryProfile, otherProfile, SCENARIOS[i], history, 'connection')
      if (!exchange) break
      turns.push(exchange)

      setMessages(prev => [
        ...prev,
        { from: 'a', name: primaryProfile.name || 'You', text: exchange.golemA, color: colorA },
        { from: 'b', name: otherProfile.name, text: exchange.golemB, color: colorB },
      ])
    }

    setLoading(false)
  }, [primaryProfile, otherProfile])

  // Auto-start dialogue on mount — no intermediate step
  useEffect(() => { startDialogue() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px 10px', borderBottom: '1px solid var(--border, #222)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gold, #c9a84c)' }}>
            Golem Dialogue
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
            {primaryProfile.name || 'You'} · {otherProfile.name}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {initiated && !loading && (
            <button onClick={startDialogue} style={{
              padding: '5px 14px', borderRadius: 8, background: 'rgba(201,168,76,.08)',
              border: '1px solid rgba(201,168,76,.3)', color: '#c9a84c', cursor: 'pointer',
              fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.1em',
            }}>New Dialogue</button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', fontSize: 20, padding: 0, lineHeight: 1 }}>×</button>
        </div>
      </div>

      {/* Profile chips */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border, #222)', display: 'flex', gap: 10, flexShrink: 0 }}>
        {[
          { p: primaryProfile, color: colorA },
          { p: otherProfile, color: colorB },
        ].map(({ p, color }) => (
          <div key={p.name} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
            borderRadius: 20, background: `rgba(${hexToRgb(color)},.06)`, border: `1px solid ${color}44`,
          }}>
            <span style={{ fontSize: 16 }}>{p.emoji || '✦'}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--foreground)' }}>{p.name}</div>
              {(p.hdType && p.hdType !== '?') && (
                <div style={{ fontSize: 9, color, letterSpacing: '.06em' }}>{p.hdType}{p.sign && p.sign !== '?' ? ` · ${p.sign}` : ''}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!initiated && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🪬</div>
            <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.8, marginBottom: 20 }}>
              Initiate a one-on-one golem dialogue between you and {otherProfile.name}. Both golems speak from their astrological and design profiles.
            </div>
            <button onClick={startDialogue} style={{
              padding: '10px 28px', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(144,80,224,.15)', border: '1px solid rgba(144,80,224,.5)',
              color: '#d4aaff', fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.12em',
              textTransform: 'uppercase', fontWeight: 600,
            }}>
              Begin Dialogue
            </button>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.from === 'a' ? 'flex-start' : 'flex-end',
            maxWidth: '78%',
          }}>
            <div style={{
              fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: m.color,
              marginBottom: 4, paddingLeft: m.from === 'a' ? 2 : 0,
              paddingRight: m.from === 'b' ? 2 : 0, textAlign: m.from === 'b' ? 'right' : 'left',
            }}>
              {m.name}
            </div>
            <div style={{
              padding: '10px 14px', borderRadius: m.from === 'a' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
              background: m.from === 'a' ? `rgba(${hexToRgb(colorA)},.07)` : `rgba(${hexToRgb(colorB)},.07)`,
              border: `1px solid ${m.color}33`,
              fontSize: 12, lineHeight: 1.7, color: 'var(--foreground)',
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 4, padding: 16, alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%', background: 'var(--muted-foreground)',
                animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s`,
              }} />
            ))}
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)', marginLeft: 8 }}>Golems speaking…</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Profile detail panel ──
function ProfileDetail({ p, primaryProfile, onClose, onStartDialogue }) {
  const color = getRelColor(p)
  const rows = [
    { label: 'Sun',        value: p.sign !== '?' ? p.sign : null },
    { label: 'Moon',       value: p.moon !== '?' ? p.moon : null },
    { label: 'Rising',     value: p.asc !== '?' ? p.asc : null },
    { label: 'HD Type',    value: p.hdType !== '?' ? p.hdType : null },
    { label: 'HD Profile', value: p.hdProfile !== '?' ? p.hdProfile : null },
    { label: 'HD Auth',    value: p.hdAuth !== '?' ? p.hdAuth : null },
    { label: 'Life Path',  value: p.lifePath !== '?' ? p.lifePath : null },
    { label: 'Gene Keys',  value: p.crossGK !== '?' ? p.crossGK : null },
    { label: 'Enneagram',  value: p.enneagramType ? `Type ${p.enneagramType}${p.enneagramWing ? `w${p.enneagramWing}` : ''}` : null },
    { label: 'MBTI',       value: p.mbtiType || null },
    { label: 'Dosha',      value: p.doshaType || null },
    { label: 'Archetype',  value: p.archetypeType || null },
    { label: 'Love Lang',  value: p.loveLanguage || null },
  ].filter(r => r.value)

  return (
    <div style={{
      width: 280, borderLeft: '1px solid var(--border, #222)',
      padding: '20px', overflowY: 'auto', flexShrink: 0,
      background: 'var(--background)', display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gold, #c9a84c)' }}>
          Profile
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', fontSize: 20, padding: 0, lineHeight: 1 }}>×</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `rgba(${hexToRgb(color)},.12)`, border: `2px solid ${color}`, fontSize: 24,
        }}>
          {p.emoji || '✦'}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--foreground)' }}>{p.name}</div>
          <div style={{ fontSize: 11, color, textTransform: 'uppercase', letterSpacing: '.07em', marginTop: 2 }}>
            {p._isPrimary ? 'You' : (p.rel || 'other')}
          </div>
          {p.dob && (
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>
              {p.dob}{p.pob ? ` · ${p.pob}` : ''}
            </div>
          )}
        </div>
      </div>

      {rows.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map(r => (
            <div key={r.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 10px', borderRadius: 6, background: 'rgba(255,255,255,.03)',
            }}>
              <span style={{ fontSize: 10, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{r.label}</span>
              <span style={{ fontSize: 12, color: 'var(--foreground)', fontWeight: 500 }}>{r.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center', padding: '20px 0' }}>
          No profile data yet
        </div>
      )}

      {/* Dialogue button — only for non-primary profiles */}
      {!p._isPrimary && (
        <button
          onClick={() => onStartDialogue(p)}
          style={{
            width: '100%', padding: '10px 0', borderRadius: 10, cursor: 'pointer',
            background: 'rgba(144,80,224,.1)', border: '1px solid rgba(144,80,224,.4)',
            color: '#d4aaff', fontFamily: "'Cinzel',serif", fontSize: 10,
            letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600, marginTop: 4,
          }}
        >
          🪬 Golem Dialogue
        </button>
      )}
    </div>
  )
}

// ── Main page ──
export default function AIAgentsPage() {
  const primaryProfile = useComputedProfile()
  const people = useComputedPeople()
  const setActiveDetail = useGolemStore(s => s.setActiveDetail)
  const [selected, setSelected] = useState(null)
  const [dialogueTarget, setDialogueTarget] = useState(null)

  const all = [
    { ...primaryProfile, _isPrimary: true },
    ...people,
  ].filter(p => p.name)

  if (all.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', gap: 16, padding: 40, textAlign: 'center',
      }}>
        <div style={{ fontSize: 48 }}>✦</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold, #c9a84c)' }}>
          Constellation
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', maxWidth: 360, lineHeight: 1.85 }}>
          Complete your profile and add people to build your personal constellation.
        </div>
        <button
          onClick={() => setActiveDetail('profile')}
          style={{
            padding: '8px 22px', borderRadius: 8,
            border: '1px solid rgba(201,168,76,.4)', background: 'rgba(201,168,76,.08)',
            color: 'var(--gold, #c9a84c)', cursor: 'pointer',
            fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.1em',
          }}
        >
          Open Profiles
        </button>
      </div>
    )
  }

  const selectedProfile = selected !== null ? all[selected] : null

  // If dialogue mode is active, show full-screen dialogue
  if (dialogueTarget) {
    return (
      <div style={{ height: '100%', overflow: 'hidden' }}>
        <GolemDialogue
          primaryProfile={primaryProfile}
          otherProfile={dialogueTarget}
          onClose={() => setDialogueTarget(null)}
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gold, #c9a84c)', marginBottom: 4 }}>
          Constellation
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 20 }}>
          {all.length} {all.length === 1 ? 'profile' : 'profiles'} · click to view · hold for dialogue
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {all.map((p, i) => (
            <ProfileCard key={p.id || i} p={p} index={i} selected={selected} onSelect={setSelected} />
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selectedProfile && (
        <ProfileDetail
          p={selectedProfile}
          primaryProfile={primaryProfile}
          onClose={() => setSelected(null)}
          onStartDialogue={(target) => { setSelected(null); setDialogueTarget(target) }}
        />
      )}
    </div>
  )
}
