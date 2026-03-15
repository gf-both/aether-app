import { useState, useEffect, useRef, useCallback } from 'react'
import { getNatalChart } from '../../engines/natalEngine'
import { computeHDChart } from '../../engines/hdEngine'
import { getGeneKeysProfile } from '../../engines/geneKeysEngine'

const FRAMEWORKS = [
  { id: 'hd', label: 'Human Design', short: 'HD' },
  { id: 'natal', label: 'Natal Chart', short: 'Natal' },
  { id: 'geneKeys', label: 'Gene Keys', short: 'Gene K' },
  { id: 'kabbalah', label: 'Kabbalah', short: 'Kab' },
  { id: 'mayan', label: 'Mayan', short: 'Mayan' },
]

const AI_SUGGESTIONS = {
  hd: [
    'As a Projector, Elena succeeds through invitation — ask: "Where are you feeling unseen or uninvited right now?"',
    'Gate 41 (Fantasy/Contraction) — explore: "Where do you feel most limited in creative expression?"',
    '3/5 Profile: The Martyr discovers through trial & error. The Heretic becomes a practical guide for others.',
  ],
  natal: [
    'Sun in Gemini 3rd house — themes of communication, siblings, local environment. Ask: "How are you using your voice?"',
    'Check transiting Saturn aspects for current structural themes.',
    'Venus placement speaks to relationship patterns and values — worth exploring in session.',
  ],
  geneKeys: [
    'Life\'s Work Gate 41: From Contraction → Anticipation → Emanation. Explore the gift frequency.',
    'The Hologenetic Profile reveals four core spheres — explore the Venus sequence for relationship patterns.',
    'Gene Key 30 (Desire → Lightness → Rapture): often paired with Gate 41 in the channel of recognition.',
  ],
  kabbalah: [
    'Explore the Sephira most resonant with current life challenges.',
    'The Tree of Life as a map of consciousness — where does the client feel most "stuck" on the tree?',
    'Path work between Chesed and Geburah: balancing mercy and judgment.',
  ],
  mayan: [
    'Kin energy shapes daily creative expression — explore how the tone and seal interact.',
    'The Tzolkin wavespell: 13-day cycles of intention and manifestation.',
    'White Mirror: reflection, endlessness, truth — ask about patterns they keep seeing.',
  ],
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

function formatSessionDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getClientChartData(client, frameworkId) {
  try {
    const [year, month, day] = client.dob.split('-').map(Number)
    if (frameworkId === 'natal') {
      return getNatalChart({
        day, month, year,
        hour: client.birthHour,
        minute: client.birthMinute,
        lat: client.birthLat,
        lon: client.birthLon,
        timezone: client.birthTimezone,
      })
    }
    if (frameworkId === 'hd') {
      const dateOfBirth = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
      const timeOfBirth = `${String(client.birthHour).padStart(2,'0')}:${String(client.birthMinute).padStart(2,'0')}`
      return computeHDChart({ dateOfBirth, timeOfBirth, utcOffset: client.birthTimezone })
    }
    if (frameworkId === 'geneKeys') {
      return getGeneKeysProfile({
        day, month, year,
        hour: client.birthHour,
        minute: client.birthMinute,
        timezone: client.birthTimezone,
      })
    }
  } catch (e) {
    return null
  }
  return null
}

function HDChartSummary({ chart }) {
  if (!chart) return <div style={cs.chartPlaceholder}>Unable to compute chart</div>
  return (
    <div style={cs.chartContent}>
      <div style={cs.chartRow}>
        <span style={cs.chartLabel}>Type</span>
        <span style={cs.chartValue}>{chart.type || '—'}</span>
      </div>
      <div style={cs.chartRow}>
        <span style={cs.chartLabel}>Strategy</span>
        <span style={cs.chartValue}>{chart.strategy || '—'}</span>
      </div>
      <div style={cs.chartRow}>
        <span style={cs.chartLabel}>Authority</span>
        <span style={cs.chartValue}>{chart.authority || '—'}</span>
      </div>
      <div style={cs.chartRow}>
        <span style={cs.chartLabel}>Profile</span>
        <span style={cs.chartValue}>{chart.profile || '—'}</span>
      </div>
      <div style={cs.chartRow}>
        <span style={cs.chartLabel}>Definition</span>
        <span style={cs.chartValue}>{chart.definition || '—'}</span>
      </div>
      {chart.incarnationCross && (
        <div style={{ ...cs.chartRow, flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
          <span style={cs.chartLabel}>Incarnation Cross</span>
          <span style={{ ...cs.chartValue, fontSize: '11px' }}>{chart.incarnationCross}</span>
        </div>
      )}
      {chart.definedCenters && chart.definedCenters.length > 0 && (
        <div style={{ ...cs.chartRow, flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <span style={cs.chartLabel}>Defined Centers</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {chart.definedCenters.map(c => (
              <span key={c} style={{ fontFamily: "'Cinzel',serif", fontSize: '9px', color: 'var(--gold)', background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)', borderRadius: '4px', padding: '2px 6px' }}>{c}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NatalSummary({ chart }) {
  if (!chart || !chart.planets) return <div style={cs.chartPlaceholder}>Unable to compute chart</div>
  const keyPlanets = ['Sun', 'Moon', 'ASC', 'Mercury', 'Venus', 'Mars']
  const planetsToShow = chart.planets.filter(p => keyPlanets.includes(p.name)).slice(0, 6)
  return (
    <div style={cs.chartContent}>
      {planetsToShow.map(p => (
        <div key={p.name} style={cs.chartRow}>
          <span style={cs.chartLabel}>{p.name}</span>
          <span style={cs.chartValue}>{p.sign} {p.degree ? `${Math.floor(p.degree)}°` : ''}</span>
        </div>
      ))}
      {chart.asc && (
        <div style={cs.chartRow}>
          <span style={cs.chartLabel}>ASC</span>
          <span style={cs.chartValue}>{chart.asc.sign} {chart.asc.degree ? `${Math.floor(chart.asc.degree)}°` : ''}</span>
        </div>
      )}
    </div>
  )
}

function GeneKeysSummary({ profile }) {
  if (!profile) return <div style={cs.chartPlaceholder}>Unable to compute profile</div>
  const spheres = [
    { label: "Life's Work", data: profile.lifesWork },
    { label: 'Evolution', data: profile.evolution },
    { label: 'Radiance', data: profile.radiance },
    { label: 'Purpose', data: profile.purpose },
  ]
  return (
    <div style={cs.chartContent}>
      {spheres.map(sphere => sphere.data && (
        <div key={sphere.label} style={{ marginBottom: '10px' }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: '9px', letterSpacing: '.1em', color: 'var(--text3)', marginBottom: '4px', textTransform: 'uppercase' }}>{sphere.label}</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '13px', color: 'var(--gold)' }}>
            Gate {sphere.data.gate} · Line {sphere.data.line}
          </div>
          {sphere.data.shadow && (
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '11px', color: 'var(--text3)' }}>
              {sphere.data.shadow} → {sphere.data.gift} → {sphere.data.siddhi}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ChartView({ client, frameworkId }) {
  const [chart, setChart] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setChart(getClientChartData(client, frameworkId))
      setLoading(false)
    }, 100)
  }, [client.id, frameworkId])

  if (loading) return <div style={cs.chartPlaceholder}>Computing {frameworkId}…</div>

  if (frameworkId === 'hd') return <HDChartSummary chart={chart} />
  if (frameworkId === 'natal') return <NatalSummary chart={chart} />
  if (frameworkId === 'geneKeys') return <GeneKeysSummary profile={chart} />

  return (
    <div style={cs.chartPlaceholder}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>✦</div>
      <div>{FRAMEWORKS.find(f => f.id === frameworkId)?.label} framework</div>
      <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>{client.birthCity}</div>
    </div>
  )
}

// Inline styles object for chart sub-components
const cs = {
  chartPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '160px',
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '13px',
    color: 'var(--text3)',
  },
  chartContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '4px 0',
  },
  chartRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0',
    borderBottom: '1px solid rgba(255,255,255,.03)',
  },
  chartLabel: {
    fontFamily: "'Cinzel',serif",
    fontSize: '9px',
    letterSpacing: '.1em',
    color: 'var(--text3)',
    textTransform: 'uppercase',
  },
  chartValue: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '13px',
    color: 'var(--text1)',
    textAlign: 'right',
  },
}

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 24px',
    borderBottom: '1px solid var(--glass-border)',
    background: 'rgba(0,0,0,.3)',
    flexShrink: 0,
  },
  backBtn: {
    background: 'rgba(255,255,255,.05)',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '6px',
    padding: '6px 12px',
    fontFamily: "'Cinzel',serif",
    fontSize: '10px',
    letterSpacing: '.12em',
    color: 'var(--text2)',
    cursor: 'pointer',
    transition: 'all .2s',
  },
  sessionTitle: {
    fontFamily: "'Cinzel',serif",
    fontSize: '13px',
    letterSpacing: '.15em',
    color: 'var(--gold)',
    textTransform: 'uppercase',
    flex: 1,
  },
  timer: {
    fontFamily: "'Cinzel',serif",
    fontSize: '18px',
    color: 'var(--text1)',
    background: 'rgba(255,255,255,.05)',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '8px',
    padding: '8px 16px',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all .2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  timerControls: {
    display: 'flex',
    gap: '6px',
  },
  timerBtn: {
    background: 'rgba(255,255,255,.05)',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '6px',
    padding: '6px 10px',
    fontFamily: "'Cinzel',serif",
    fontSize: '9px',
    letterSpacing: '.1em',
    color: 'var(--text2)',
    cursor: 'pointer',
    transition: 'all .2s',
  },
  endBtn: {
    background: 'rgba(220,80,80,.15)',
    border: '1px solid rgba(220,80,80,.3)',
    borderRadius: '6px',
    padding: '8px 16px',
    fontFamily: "'Cinzel',serif",
    fontSize: '10px',
    letterSpacing: '.12em',
    color: '#e06c75',
    cursor: 'pointer',
    transition: 'all .2s',
  },
  body: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1px',
    flex: 1,
    overflow: 'hidden',
    background: 'var(--glass-border)',
  },
  leftPanel: {
    background: 'var(--panel-bg)',
    overflow: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  rightPanel: {
    background: 'var(--panel-bg)',
    overflow: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitle: {
    fontFamily: "'Cinzel',serif",
    fontSize: '10px',
    letterSpacing: '.2em',
    color: 'var(--gold)',
    textTransform: 'uppercase',
    marginBottom: '10px',
  },
  frameworkGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '12px',
  },
  frameworkBtn: {
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '20px',
    padding: '4px 12px',
    fontFamily: "'Cinzel',serif",
    fontSize: '9px',
    letterSpacing: '.1em',
    color: 'var(--text3)',
    cursor: 'pointer',
    transition: 'all .2s',
  },
  frameworkBtnActive: {
    background: 'rgba(201,168,76,.15)',
    border: '1px solid rgba(201,168,76,.4)',
    color: 'var(--gold)',
  },
  chartBox: {
    background: 'rgba(255,255,255,.02)',
    border: '1px solid rgba(255,255,255,.05)',
    borderRadius: '10px',
    padding: '16px',
    minHeight: '180px',
  },
  aiBox: {
    background: 'rgba(201,168,76,.04)',
    border: '1px solid rgba(201,168,76,.15)',
    borderRadius: '10px',
    padding: '16px',
  },
  aiSuggestion: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '13px',
    color: 'var(--text1)',
    fontStyle: 'italic',
    lineHeight: '1.6',
    marginBottom: '10px',
  },
  aiBtn: {
    background: 'rgba(201,168,76,.12)',
    border: '1px solid rgba(201,168,76,.25)',
    borderRadius: '6px',
    padding: '6px 14px',
    fontFamily: "'Cinzel',serif",
    fontSize: '9px',
    letterSpacing: '.12em',
    color: 'var(--gold)',
    cursor: 'pointer',
    transition: 'all .2s',
  },
  notesTextarea: {
    width: '100%',
    minHeight: '120px',
    background: 'rgba(255,255,255,.03)',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '8px',
    padding: '12px',
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '14px',
    color: 'var(--text1)',
    resize: 'vertical',
    outline: 'none',
    lineHeight: '1.6',
    boxSizing: 'border-box',
    transition: 'border .2s',
  },
  prevNote: {
    borderBottom: '1px solid rgba(255,255,255,.04)',
    paddingBottom: '12px',
    marginBottom: '12px',
  },
  prevNoteDate: {
    fontFamily: "'Cinzel',serif",
    fontSize: '9px',
    letterSpacing: '.12em',
    color: 'var(--gold)',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  prevNoteText: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '12px',
    color: 'var(--text2)',
    lineHeight: '1.6',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  actionItemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
    padding: '4px 0',
  },
  actionCheckbox: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: '1px solid rgba(255,255,255,.2)',
    background: 'transparent',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    transition: 'all .2s',
  },
  actionText: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '13px',
    color: 'var(--text2)',
    flex: 1,
  },
  actionDone: {
    color: 'var(--text3)',
    textDecoration: 'line-through',
  },
  addActionInput: {
    width: '100%',
    background: 'rgba(255,255,255,.03)',
    border: '1px solid rgba(255,255,255,.06)',
    borderRadius: '6px',
    padding: '6px 10px',
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '12px',
    color: 'var(--text1)',
    outline: 'none',
    marginTop: '6px',
    boxSizing: 'border-box',
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, rgba(201,168,76,.2), transparent)',
    margin: '4px 0',
  },
}

export default function SessionMode({ client, onBack }) {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(true)
  const [framework, setFramework] = useState('hd')
  const [notes, setNotes] = useState('')
  const [actionItems, setActionItems] = useState(
    client.sessions.length > 0
      ? client.sessions[0].actionItems.map(a => ({ ...a, id: Math.random() }))
      : []
  )
  const [newAction, setNewAction] = useState('')
  const [aiIdx, setAiIdx] = useState(0)
  const [expandedNotes, setExpandedNotes] = useState(null)
  const timerRef = useRef(null)
  const saveRef = useRef(null)

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [running])

  // Auto-save indicator
  const [saved, setSaved] = useState(false)
  const handleNotesChange = useCallback((e) => {
    setNotes(e.target.value)
    setSaved(false)
    clearTimeout(saveRef.current)
    saveRef.current = setTimeout(() => setSaved(true), 1500)
  }, [])

  function toggleAction(id) {
    setActionItems(items => items.map(a => a.id === id ? { ...a, done: !a.done } : a))
  }

  function addAction() {
    if (!newAction.trim()) return
    setActionItems(items => [...items, { id: Math.random(), text: newAction.trim(), done: false }])
    setNewAction('')
  }

  function removeAction(id) {
    setActionItems(items => items.filter(a => a.id !== id))
  }

  const suggestions = AI_SUGGESTIONS[framework] || AI_SUGGESTIONS.hd
  const currentSuggestion = suggestions[aiIdx % suggestions.length]

  const sortedSessions = [...client.sessions].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <button
          style={s.backBtn}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text2)'}
          onClick={onBack}
        >
          ← Back
        </button>
        <div style={s.sessionTitle}>Session: {client.name}</div>

        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ ...s.timer, color: running ? 'var(--lime2)' : 'var(--gold)' }}>
            <span style={{ fontSize: '12px' }}>⏱</span>
            {formatTime(seconds)}
          </div>
          <div style={s.timerControls}>
            <button
              style={{ ...s.timerBtn, ...(running ? {} : { color: 'var(--lime2)', borderColor: 'rgba(100,200,100,.3)' }) }}
              onClick={() => setRunning(r => !r)}
            >
              {running ? '⏸ Pause' : '▶ Resume'}
            </button>
            <button style={s.timerBtn} onClick={() => { setRunning(false); setSeconds(0) }}>
              ↺ Reset
            </button>
          </div>
        </div>

        <button
          style={s.endBtn}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,80,80,.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,80,80,.15)'}
          onClick={onBack}
        >
          ✕ End Session
        </button>
      </div>

      {/* Body */}
      <div style={s.body}>
        {/* Left: Chart + AI */}
        <div style={s.leftPanel}>
          {/* Framework Selector */}
          <div>
            <div style={s.sectionTitle}>Client Chart</div>
            <div style={s.frameworkGrid}>
              {FRAMEWORKS.map(f => (
                <button
                  key={f.id}
                  style={{ ...s.frameworkBtn, ...(framework === f.id ? s.frameworkBtnActive : {}) }}
                  onClick={() => setFramework(f.id)}
                >
                  {f.short}
                </button>
              ))}
            </div>

            <div style={s.chartBox}>
              <ChartView client={client} frameworkId={framework} />
            </div>
          </div>

          {/* AI Assistant */}
          <div style={s.aiBox}>
            <div style={s.sectionTitle}>AI Insight</div>
            <div style={s.aiSuggestion}>"{currentSuggestion}"</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={s.aiBtn}
                onClick={() => setAiIdx(i => i + 1)}
              >
                Next Insight →
              </button>
            </div>
          </div>
        </div>

        {/* Right: Notes + Actions */}
        <div style={s.rightPanel}>
          {/* Session Notes */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={s.sectionTitle}>Session Notes</div>
              {saved && (
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: '9px', color: 'var(--lime2)', letterSpacing: '.1em' }}>
                  ✓ Auto-saved
                </span>
              )}
            </div>
            <textarea
              style={s.notesTextarea}
              placeholder="Start typing session notes…"
              value={notes}
              onChange={handleNotesChange}
              onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,.3)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
            />
          </div>

          {/* Previous Notes */}
          {sortedSessions.length > 0 && (
            <div>
              <div style={s.sectionTitle}>Previous Sessions</div>
              {sortedSessions.map((sess, i) => (
                <div key={sess.id} style={s.prevNote}>
                  <div style={s.prevNoteDate}>{formatSessionDate(sess.date)} · {sess.duration} min</div>
                  <div
                    style={{
                      ...s.prevNoteText,
                      ...(expandedNotes === sess.id ? { WebkitLineClamp: 'unset', overflow: 'visible' } : {}),
                    }}
                  >
                    {sess.notes}
                  </div>
                  <button
                    style={{ background: 'none', border: 'none', fontFamily: "'Cinzel',serif", fontSize: '9px', color: 'var(--text3)', cursor: 'pointer', padding: '4px 0', letterSpacing: '.1em' }}
                    onClick={() => setExpandedNotes(expandedNotes === sess.id ? null : sess.id)}
                  >
                    {expandedNotes === sess.id ? '▲ Collapse' : '▼ Expand'}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={s.divider} />

          {/* Action Items */}
          <div>
            <div style={s.sectionTitle}>Action Items</div>
            {actionItems.map(item => (
              <div key={item.id} style={s.actionItemRow}>
                <div
                  style={{
                    ...s.actionCheckbox,
                    background: item.done ? 'rgba(100,200,100,.2)' : 'transparent',
                    borderColor: item.done ? 'rgba(100,200,100,.4)' : 'rgba(255,255,255,.2)',
                    color: item.done ? 'var(--lime2)' : 'transparent',
                  }}
                  onClick={() => toggleAction(item.id)}
                >
                  {item.done ? '✓' : ''}
                </div>
                <span style={{ ...s.actionText, ...(item.done ? s.actionDone : {}) }}>
                  {item.text}
                </span>
                <span
                  style={{ cursor: 'pointer', color: 'var(--text3)', fontSize: '10px', padding: '0 4px' }}
                  onClick={() => removeAction(item.id)}
                >
                  ✕
                </span>
              </div>
            ))}
            <input
              style={s.addActionInput}
              placeholder="+ Add action item…"
              value={newAction}
              onChange={e => setNewAction(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addAction()}
              onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,.3)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.06)'}
            />
          </div>

          <div style={s.divider} />

          {/* Family Constellation */}
          <div>
            <div style={s.sectionTitle}>Family Constellation</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '13px', color: 'var(--text3)', marginBottom: '10px' }}>
              Map family dynamics and intergenerational patterns
            </div>
            <button style={{ ...s.aiBtn, fontSize: '10px' }}>
              + Add Family Member
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
