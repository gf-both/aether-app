/**
 * AIAgentsPage.jsx — Constellation
 *
 * Multi-golem dialogue system. Users pick participants, choose a topic,
 * and watch their golems converse in a group chat.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useGolemStore } from '../store/useGolemStore'
import { useComputedProfile, useComputedPeople } from '../hooks/useActiveProfile'
import { runMultiGolemRound } from '../lib/golemConversation'

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

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

// ── Topic definitions ─────────────────────────────────────────────────────────

const TOPICS = [
  {
    id: 'intimate',
    label: 'Intimate',
    icon: '🔥',
    color: '#d43070',
    rounds: [
      names => `No performance. No charm. The question is simple: what do you actually feel when you're in the same room? Not what you think you should feel — what your body tells you. Everyone speak.`,
      names => `Something just shifted in the room. Someone said something real. Now go deeper — what's the wound underneath? The one this group has been circling around without naming it.`,
      names => `Last round. Say the thing you've been holding back since we started. The thing that scares you to say out loud in front of everyone here.`,
    ],
  },
  {
    id: 'shadows',
    label: 'Shadows',
    icon: '🌑',
    color: '#9050e0',
    rounds: [
      names => `Everyone here carries a mask. Name yours. What's the version of yourself you perform for others — and what does it cost you?`,
      names => `Now look at each other. What shadow do you see in someone else here that you recognize in yourself? Be specific. Name names.`,
      names => `The shadow isn't the enemy — it's the teacher. What has your darkest pattern given you that nothing else could? What would you lose if you "fixed" it?`,
    ],
  },
  {
    id: 'work',
    label: 'Work',
    icon: '⚡',
    color: '#40ccdd',
    rounds: [
      names => `If this group had to build something together — starting tomorrow — what would each of you bring? Not your resume. Your actual superpower and your actual limitation.`,
      names => `Someone in this group would drive you crazy as a collaborator. Say who and why — not to attack, but to understand the friction. Friction is data.`,
      names => `What does success actually look like for you? Not the public version — the private one. The thing you'd build if no one was watching and money wasn't the point.`,
    ],
  },
  {
    id: 'family',
    label: 'Family',
    icon: '🏠',
    color: '#f0a03c',
    rounds: [
      names => `Every family has an unspoken script. What role were you assigned — the responsible one, the rebel, the invisible one, the peacekeeper? And do you still play it?`,
      names => `What did you inherit that you didn't choose? A fear, a belief, a pattern of loving. Name it. Then say whether you want to keep it or put it down.`,
      names => `If you could rewrite one family dynamic — not erase it, but rewrite the ending — what would it be? What would healing actually look like, not as performance, but as truth?`,
    ],
  },
  {
    id: 'purpose',
    label: 'Purpose',
    icon: '🧭',
    color: '#60b030',
    rounds: [
      names => `Forget your job title. Forget what you're "supposed" to be doing. What is the thing you can't stop doing even when no one is paying you for it? That's the signal.`,
      names => `What are you afraid you're wasting? Time, talent, potential, life? Be honest about the gap between where you are and where you thought you'd be by now.`,
      names => `If you had 5 years left and unlimited resources — but you had to do it with the people in this room — what would you build? Why?`,
    ],
  },
  {
    id: 'random',
    label: 'Wild Card',
    icon: '🎲',
    color: '#c9a84c',
    rounds: [
      names => pick([
        `If each of you were a force of nature, what would you be? Not what sounds cool — what actually matches your energy? Explain why.`,
        `What's the most important thing you've changed your mind about in the last year? Not a small thing — something that reorganized how you see the world.`,
        `Everyone has a secret theory about how the world works that they don't say out loud because it sounds weird. Share yours.`,
      ]),
      names => pick([
        `React to what just happened. Did someone surprise you? Did someone confirm exactly what you expected? Name it.`,
        `What question would you ask someone in this room that you'd never ask in person? Ask it now.`,
        `Someone here just said something that isn't true — not a lie, but a self-deception. Call it out, gently.`,
      ]),
      names => pick([
        `Final round. One sentence each: what did this conversation teach you about yourself that you didn't know 5 minutes ago?`,
        `If this conversation were a movie, what genre would it be? Comedy, horror, romance, documentary? And who's the protagonist?`,
        `Close with a gift — say one thing to someone in this group that you think they need to hear but probably won't hear from anyone else.`,
      ]),
    ],
  },
]

// ── Participant chip (toggleable) ──────────────────────────────────────────

function ParticipantChip({ p, active, onToggle, isPrimary }) {
  const color = getRelColor(p)
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px',
        borderRadius: 24, cursor: 'pointer', transition: 'all .15s', userSelect: 'none',
        background: active ? `rgba(${hexToRgb(color)},.12)` : 'rgba(255,255,255,.02)',
        border: `1.5px solid ${active ? color : '#333'}`,
        opacity: active ? 1 : 0.45,
      }}
    >
      <div style={{
        width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? `rgba(${hexToRgb(color)},.2)` : 'rgba(255,255,255,.04)',
        fontSize: 13, flexShrink: 0,
      }}>
        {p.emoji || (isPrimary ? '✦' : '👤')}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: active ? 'var(--foreground)' : '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.name}
        </div>
        <div style={{ fontSize: 9, color: active ? color : '#444', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {isPrimary ? 'You' : (p.rel || 'other')}
        </div>
      </div>
      {/* Toggle indicator */}
      <div style={{
        width: 14, height: 14, borderRadius: '50%', flexShrink: 0, marginLeft: 2,
        background: active ? color : 'transparent',
        border: `1.5px solid ${active ? color : '#444'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, color: '#fff',
      }}>
        {active ? '✓' : ''}
      </div>
    </div>
  )
}

// ── Topic pill ──────────────────────────────────────────────────────────────

function TopicPill({ topic, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px',
        borderRadius: 20, cursor: 'pointer', transition: 'all .15s', userSelect: 'none',
        background: active ? topic.color : 'transparent',
        border: `1.5px solid ${active ? topic.color : '#333'}`,
        color: active ? '#fff' : '#888',
        fontSize: 11, fontWeight: active ? 700 : 500,
        fontFamily: "'Cinzel', serif", letterSpacing: '.06em',
      }}
    >
      <span style={{ fontSize: 13 }}>{topic.icon}</span>
      {topic.label}
    </div>
  )
}

// ── Multi-Golem Dialogue ──────────────────────────────────────────────────

function GolemDialogue({ primaryProfile, allPeople, initialParticipantIds, initialTopic, onClose }) {
  const [activeIds, setActiveIds] = useState(initialParticipantIds || [])
  const [topicId, setTopicId] = useState(initialTopic || 'intimate')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [roundNum, setRoundNum] = useState(0)
  const [showSetup, setShowSetup] = useState(true)
  const scrollRef = useRef(null)

  const topic = TOPICS.find(t => t.id === topicId) || TOPICS[0]

  // Build all toggleable profiles: primary always included in list
  const allProfiles = [
    { ...primaryProfile, _isPrimary: true },
    ...allPeople,
  ].filter(p => p.name)

  // Active participants
  const participants = allProfiles.filter(p =>
    p._isPrimary ? activeIds.includes('primary') : activeIds.includes(String(p.id))
  )

  const toggleParticipant = (id) => {
    setActiveIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Color map for messages
  const colorMap = {}
  allProfiles.forEach(p => {
    const key = p._isPrimary ? 'primary' : String(p.id)
    colorMap[p.name] = getRelColor(p)
  })

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const runRound = useCallback(async (roundIdx) => {
    if (participants.length < 2) return
    setLoading(true)
    setShowSetup(false)

    const roundPrompts = topic.rounds
    const promptIdx = Math.min(roundIdx, roundPrompts.length - 1)
    const names = participants.map(p => p.name).join(', ')
    const scenario = roundPrompts[promptIdx](names)

    // Build history from existing messages
    const history = messages.map(m => ({ name: m.name, text: m.text }))

    try {
      const responses = await runMultiGolemRound(participants, scenario, history, 'dialogue')

      // Add round divider
      const newMessages = [
        { type: 'divider', label: `Round ${roundIdx + 1}`, topic: topic.label },
        ...responses.map(r => ({
          type: 'message',
          name: r.name,
          text: r.text,
          color: colorMap[r.name] || '#888',
        })),
      ]

      setMessages(prev => [...prev, ...newMessages])
      setRoundNum(roundIdx + 1)
    } catch (e) {
      console.error('Multi-golem error:', e)
      setMessages(prev => [...prev, { type: 'error', text: e.message }])
    }

    setLoading(false)
  }, [participants, messages, topic, colorMap])

  const startDialogue = useCallback(() => {
    setMessages([])
    setRoundNum(0)
    runRound(0)
  }, [runRound])

  const continueDialogue = useCallback(() => {
    runRound(roundNum)
  }, [runRound, roundNum])

  const canStart = participants.length >= 2
  const maxRounds = topic.rounds.length
  const canContinue = roundNum > 0 && roundNum < maxRounds && !loading

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '14px 20px 12px', borderBottom: '1px solid var(--border, #222)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gold, #c9a84c)' }}>
            Golem Dialogue
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>
            {participants.length} participant{participants.length !== 1 ? 's' : ''} · <span style={{ color: topic.color }}>{topic.icon} {topic.label}</span>
            {roundNum > 0 && <span> · round {roundNum}/{maxRounds}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!showSetup && !loading && (
            <button onClick={() => setShowSetup(s => !s)} style={{
              padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,.05)',
              border: '1px solid #333', color: '#999', cursor: 'pointer',
              fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: '.08em',
            }}>⚙ Setup</button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', fontSize: 20, padding: 0, lineHeight: 1 }}>×</button>
        </div>
      </div>

      {/* Setup panel — topic + participant toggles */}
      {showSetup && (
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border, #222)',
          background: 'rgba(255,255,255,.01)', flexShrink: 0,
        }}>
          {/* Topic selector */}
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: '#666', marginBottom: 10 }}>
            Topic
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {TOPICS.map(t => (
              <TopicPill key={t.id} topic={t} active={topicId === t.id} onClick={() => setTopicId(t.id)} />
            ))}
          </div>

          {/* Participant toggles */}
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: '#666', marginBottom: 10 }}>
            Participants — {participants.length} active
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {allProfiles.map(p => {
              const id = p._isPrimary ? 'primary' : String(p.id)
              return (
                <ParticipantChip
                  key={id}
                  p={p}
                  isPrimary={p._isPrimary}
                  active={activeIds.includes(id)}
                  onToggle={() => toggleParticipant(id)}
                />
              )
            })}
          </div>

          {/* Start / restart button */}
          <button
            onClick={startDialogue}
            disabled={!canStart || loading}
            style={{
              width: '100%', padding: '12px 20px', borderRadius: 10,
              cursor: canStart && !loading ? 'pointer' : 'not-allowed',
              background: canStart ? '#7040c0' : '#1a1a2e',
              border: `2px solid ${canStart ? '#9060e0' : '#333'}`,
              color: canStart ? '#fff' : '#555',
              fontSize: 13, fontFamily: "'Cinzel',serif", fontWeight: 700,
              letterSpacing: '.1em', textTransform: 'uppercase',
              boxShadow: canStart ? '0 0 20px rgba(144,80,224,.4), 0 0 40px rgba(144,80,224,.15)' : 'none',
            }}
          >
            {roundNum > 0 ? '↻ Restart Dialogue' : '▶ Begin Dialogue'}
          </button>
          {!canStart && (
            <div style={{ fontSize: 11, color: '#d43070', textAlign: 'center', marginTop: 8 }}>
              Select at least 2 participants
            </div>
          )}
        </div>
      )}

      {/* Messages area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Empty state */}
        {messages.length === 0 && !loading && !showSetup && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted-foreground)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🪬</div>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>Select participants and a topic, then begin.</div>
          </div>
        )}

        {messages.map((m, i) => {
          if (m.type === 'divider') {
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0 6px',
              }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.06)' }} />
                <span style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: '#555', whiteSpace: 'nowrap' }}>
                  {m.label}
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.06)' }} />
              </div>
            )
          }
          if (m.type === 'error') {
            return (
              <div key={i} style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(220,48,48,.06)', border: '1px solid rgba(220,48,48,.2)', fontSize: 12, color: '#c44' }}>
                {m.text}
              </div>
            )
          }
          // Regular message
          const isFromPrimary = m.name === primaryProfile.name
          return (
            <div key={i} style={{ maxWidth: '82%', alignSelf: isFromPrimary ? 'flex-start' : 'flex-end' }}>
              <div style={{
                fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: m.color,
                marginBottom: 4,
                textAlign: isFromPrimary ? 'left' : 'right',
                paddingLeft: isFromPrimary ? 2 : 0,
                paddingRight: !isFromPrimary ? 2 : 0,
              }}>
                {m.name}
              </div>
              <div style={{
                padding: '10px 14px',
                borderRadius: isFromPrimary ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                background: `rgba(${hexToRgb(m.color)},.07)`,
                border: `1px solid ${m.color}33`,
                fontSize: 12, lineHeight: 1.75, color: 'var(--foreground)',
              }}>
                {m.text}
              </div>
            </div>
          )
        })}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: 4, padding: 16, alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%', background: topic.color,
                animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s`,
                opacity: 0.6,
              }} />
            ))}
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)', marginLeft: 8 }}>
              {participants.length} golems speaking…
            </span>
          </div>
        )}
      </div>

      {/* Bottom bar — continue / new round */}
      {roundNum > 0 && !showSetup && (
        <div style={{
          padding: '12px 20px', borderTop: '1px solid var(--border, #222)',
          display: 'flex', gap: 10, flexShrink: 0, alignItems: 'center',
        }}>
          {canContinue ? (
            <button
              onClick={continueDialogue}
              style={{
                flex: 1, padding: '10px 20px', borderRadius: 8,
                cursor: 'pointer',
                background: topic.color,
                border: `2px solid ${topic.color}`,
                color: '#fff', fontSize: 12, fontFamily: "'Cinzel',serif",
                fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                boxShadow: `0 0 16px ${topic.color}55`,
              }}
            >
              Continue — Round {roundNum + 1}/{maxRounds}
            </button>
          ) : !loading ? (
            <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#666', fontStyle: 'italic' }}>
              Dialogue complete — {maxRounds} rounds
            </div>
          ) : null}
          <button
            onClick={() => { setMessages([]); setRoundNum(0); setShowSetup(true) }}
            disabled={loading}
            style={{
              padding: '10px 16px', borderRadius: 8,
              background: 'rgba(255,255,255,.04)', border: '1px solid #333',
              color: '#999', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 600, letterSpacing: '.06em',
            }}
          >
            ↻ New
          </button>
        </div>
      )}
    </div>
  )
}

// ── Profile card ──────────────────────────────────────────────────────────

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

// ── Profile detail panel ──────────────────────────────────────────────────

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
            background: '#7040c0',
            border: '2px solid #9060e0',
            color: '#fff', fontFamily: "'Cinzel',serif", fontSize: 10,
            letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, marginTop: 4,
            boxShadow: '0 0 12px rgba(144,80,224,.3)',
          }}
        >
          🪬 Golem Dialogue
        </button>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function AIAgentsPage() {
  const primaryProfile = useComputedProfile()
  const people = useComputedPeople()
  const setActiveDetail = useGolemStore(s => s.setActiveDetail)
  const [selected, setSelected] = useState(null)
  const [dialogueMode, setDialogueMode] = useState(false)
  const [initialParticipants, setInitialParticipants] = useState([])

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

  // Dialogue mode — full screen multi-golem dialogue
  if (dialogueMode) {
    return (
      <div style={{ height: '100%', overflow: 'hidden' }}>
        <GolemDialogue
          primaryProfile={primaryProfile}
          allPeople={people}
          initialParticipantIds={initialParticipants}
          onClose={() => setDialogueMode(false)}
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gold, #c9a84c)' }}>
            Constellation
          </div>
          {/* Open group dialogue button */}
          {all.length >= 2 && (
            <button
              onClick={() => {
                // Pre-select primary + all people
                const ids = ['primary', ...people.map(p => String(p.id))]
                setInitialParticipants(ids)
                setDialogueMode(true)
              }}
              style={{
                padding: '6px 16px', borderRadius: 8, cursor: 'pointer',
                background: '#7040c0', border: '2px solid #9060e0',
                color: '#fff', fontSize: 10, fontFamily: "'Cinzel',serif",
                fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                boxShadow: '0 0 12px rgba(144,80,224,.3)',
              }}
            >
              🪬 Group Dialogue
            </button>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 20 }}>
          {all.length} {all.length === 1 ? 'profile' : 'profiles'} · click to view details
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
          onStartDialogue={(target) => {
            setSelected(null)
            // Pre-select primary + this person for 1-on-1
            setInitialParticipants(['primary', String(target.id)])
            setDialogueMode(true)
          }}
        />
      )}
    </div>
  )
}
