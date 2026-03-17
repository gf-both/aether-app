import { useState, useMemo } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'

function renderBoldMarkdown(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    const match = part.match(/^\*\*(.*?)\*\*$/)
    if (match) {
      return <strong key={i} style={{ color: 'var(--gold, #c9a84c)' }}>{match[1]}</strong>
    }
    return part
  })
}

const THEME_KEYWORDS = [
  'sacral', 'authority', 'emotional', 'wave', 'gate', 'channel', 'profile',
  'shadow', 'gift', 'siddhi', 'conditioning', 'not-self', 'strategy',
  'manifestor', 'generator', 'projector', 'reflector', 'manifesting',
  'resistance', 'fear', 'anger', 'bitterness', 'disappointment',
  'love', 'relationships', 'boundaries', 'purpose', 'career', 'money',
  'family', 'body', 'health', 'creativity', 'expression', 'truth',
  'trust', 'surrender', 'control', 'power', 'vulnerability', 'shame',
  'grief', 'joy', 'breakthrough', 'stuck', 'shift', 'pattern',
]

function analyzePatterns(sessions) {
  if (!sessions || sessions.length === 0) {
    return {
      topThemes: [],
      recurringBlocks: [],
      progressAreas: [],
      suggestedFocus: '',
      completionRate: 0,
      sessionArc: [],
    }
  }

  const allText = sessions.map(s => [
    s.notes || '',
    ...(s.analysis?.insights || []),
    ...(s.analysis?.patterns ? [s.analysis.patterns] : []),
  ].join(' ').toLowerCase()).join(' ')

  // Keyword frequency
  const freq = {}
  THEME_KEYWORDS.forEach(kw => {
    const regex = new RegExp(`\\b${kw}`, 'gi')
    const matches = allText.match(regex)
    if (matches?.length) freq[kw] = matches.length
  })

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1])
  const topThemes = sorted.slice(0, 8).map(([word, count]) => ({
    word,
    count,
    intensity: count >= 5 ? 'high' : count >= 3 ? 'medium' : 'low',
  }))

  // Recurring blocks (words that appear in "stuck" or "resistance" context)
  const blockKeywords = ['stuck', 'resistance', 'fear', 'shadow', 'conditioning', 'not-self', 'control', 'shame', 'grief', 'anger', 'bitterness']
  const recurringBlocks = blockKeywords
    .filter(kw => (allText.match(new RegExp(`\\b${kw}`, 'gi')) || []).length >= 2)
    .map(kw => ({
      theme: kw.charAt(0).toUpperCase() + kw.slice(1),
      sessions: sessions.filter(s => (s.notes || '').toLowerCase().includes(kw)).length,
    }))
    .slice(0, 4)

  // Progress areas
  const progressKeywords = ['breakthrough', 'shift', 'clarity', 'trust', 'joy', 'gift', 'siddhi', 'love', 'truth']
  const progressAreas = progressKeywords
    .filter(kw => (allText.match(new RegExp(`\\b${kw}`, 'gi')) || []).length >= 1)
    .map(kw => ({
      theme: kw.charAt(0).toUpperCase() + kw.slice(1),
      mentions: (allText.match(new RegExp(`\\b${kw}`, 'gi')) || []).length,
    }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 4)

  // Action item completion rate
  const totalItems = sessions.reduce((acc, s) => acc + (s.actionItems?.length || 0), 0)
  const completedItems = sessions.reduce((acc, s) => {
    return acc + Object.values(s.checkedItems || {}).filter(Boolean).length
  }, 0)
  const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  // Session arc (topic distribution per session)
  const sessionArc = sessions.map((s, i) => {
    const noteLength = (s.notes || '').split(' ').filter(Boolean).length
    const topics = THEME_KEYWORDS.filter(kw =>
      (s.notes || '').toLowerCase().includes(kw)
    ).slice(0, 3)
    return {
      index: i + 1,
      date: new Date(s.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      noteLength,
      topics,
      hasAnalysis: !!s.analysis,
    }
  })

  const suggestedFocus = topThemes.length > 0
    ? `Based on ${sessions.length} sessions, the primary work is around **${topThemes[0]?.word}** and **${topThemes[1]?.word || 'self-trust'}**. ${recurringBlocks.length > 0 ? `The pattern of "${recurringBlocks[0]?.theme.toLowerCase()}" has appeared in ${recurringBlocks[0]?.sessions} sessions — this may be the core theme ready for deeper resolution.` : 'The client is building momentum.'} For the next 3 sessions, consider deepening the somatic/embodiment work alongside the intellectual framework.`
    : 'Not enough session data to surface patterns yet. Continue capturing detailed notes.'

  return { topThemes, recurringBlocks, progressAreas, suggestedFocus, completionRate, sessionArc }
}

function ThemeChip({ theme }) {
  const color = theme.intensity === 'high' ? '#c9a84c' : theme.intensity === 'medium' ? '#40ccdd' : '#9050e0'
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: `${color}18`,
      border: `1px solid ${color}44`,
      borderRadius: 20,
      padding: '4px 10px',
      fontSize: '0.8rem',
      fontFamily: 'Cormorant Garamond, serif',
      color,
    }}>
      {theme.word}
      <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>×{theme.count}</span>
    </div>
  )
}

const DEMO_SESSIONS = [
  {
    clientId: 'demo',
    startTime: Date.now() - 28 * 24 * 60 * 60 * 1000,
    endTime: Date.now() - 28 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000,
    notes: 'Client discussed fear around sacral authority and conditioning from family. Resistance to expressing emotional truth. Anger and bitterness around career decisions.',
    actionItems: ['Daily sacral check-in', 'Journal about conditioning'],
    checkedItems: { 0: true },
    analysis: { insights: ['Sacral authority being bypassed'], patterns: 'Resistance to following sacral response' },
  },
  {
    clientId: 'demo',
    startTime: Date.now() - 14 * 24 * 60 * 60 * 1000,
    endTime: Date.now() - 14 * 24 * 60 * 60 * 1000 + 80 * 60 * 1000,
    notes: 'Breakthrough around shadow work. Client recognizing the gift in their emotional wave. Shift in perspective around relationships and boundaries. Still some control patterns showing up.',
    actionItems: ['Practice emotional surfing', 'Have honest conversation', 'Review gate 49'],
    checkedItems: { 0: true, 1: true },
    analysis: { insights: ['Shadow to Gift shift beginning'], patterns: 'Emotional wave clarity emerging' },
  },
  {
    clientId: 'demo',
    startTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
    endTime: Date.now() - 7 * 24 * 60 * 60 * 1000 + 70 * 60 * 1000,
    notes: 'Deep session on trust and surrender. Joy starting to emerge. The siddhi frequency touched in moments. Gate channel discussion. Purpose and life work becoming clearer.',
    actionItems: ['Embodiment practice daily', 'Explore incarnation cross'],
    checkedItems: {},
    analysis: { insights: ['Joy and surrender emerging'], patterns: 'Moving toward Gift and Siddhi frequencies' },
  },
]

export default function PatternMiner({ clientId, _clientProfile = {} }) {
  const { sessionHistory } = useAboveInsideStore()
  const sessions = (sessionHistory?.[clientId] || []).length > 0
    ? sessionHistory[clientId]
    : DEMO_SESSIONS

  const patterns = useMemo(() => analyzePatterns(sessions), [sessions])

  return (
    <div style={{
      background: 'var(--panel-bg, rgba(15,12,30,0.9))',
      border: '1px solid var(--glass-border, rgba(201,168,76,0.2))',
      borderRadius: 16,
      padding: 24,
      backdropFilter: 'blur(20px)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '1.1rem',
          letterSpacing: '0.1em',
          color: 'var(--gold, #c9a84c)',
          margin: '0 0 4px',
        }}>
          🔬 Pattern Miner
        </h2>
        <p style={{ margin: 0, fontFamily: 'Cormorant Garamond, serif', fontSize: '0.85rem', opacity: 0.6 }}>
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} analyzed
          {sessions === DEMO_SESSIONS && ' (demo data)'}
        </p>
      </div>

      {/* Top Themes chips */}
      {patterns.topThemes.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: '0 0 10px', fontFamily: 'Cinzel, serif', fontSize: '0.78rem', color: 'var(--gold, #c9a84c)', letterSpacing: '0.06em' }}>
            TOP THEMES
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {patterns.topThemes.map(theme => (
              <ThemeChip key={theme.word} theme={theme} />
            ))}
          </div>
        </div>
      )}

      {/* Session timeline */}
      {patterns.sessionArc.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: '0 0 12px', fontFamily: 'Cinzel, serif', fontSize: '0.78rem', color: 'var(--gold, #c9a84c)', letterSpacing: '0.06em' }}>
            SESSION ARC
          </p>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', overflowX: 'auto', paddingBottom: 4 }}>
            {patterns.sessionArc.map((s, i) => {
              const maxLen = Math.max(...patterns.sessionArc.map(x => x.noteLength), 100)
              const height = Math.max(24, (s.noteLength / maxLen) * 80)
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 48 }}>
                  <div
                    style={{
                      width: 36,
                      height,
                      background: s.hasAnalysis
                        ? 'linear-gradient(180deg, var(--gold, #c9a84c), rgba(201,168,76,0.3))'
                        : 'rgba(201,168,76,0.2)',
                      borderRadius: '4px 4px 0 0',
                      border: '1px solid rgba(201,168,76,0.3)',
                      position: 'relative',
                      transition: 'height 0.3s',
                    }}
                    title={s.topics.join(', ')}
                  />
                  <span style={{ fontSize: '0.65rem', opacity: 0.6, fontFamily: 'Cormorant Garamond, serif', textAlign: 'center' }}>
                    #{s.index}<br />{s.date}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {s.topics.map(t => (
                      <span key={t} style={{
                        fontSize: '0.6rem',
                        background: 'rgba(201,168,76,0.12)',
                        borderRadius: 3,
                        padding: '1px 4px',
                        color: 'rgba(201,168,76,0.8)',
                        whiteSpace: 'nowrap',
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {/* Recurring blocks */}
        <div style={{
          background: 'rgba(212,48,112,0.08)',
          border: '1px solid rgba(212,48,112,0.25)',
          borderRadius: 10,
          padding: '12px 14px',
        }}>
          <p style={{ margin: '0 0 8px', fontFamily: 'Cinzel, serif', fontSize: '0.72rem', color: '#d43070', letterSpacing: '0.05em' }}>
            🔴 RECURRING BLOCKS
          </p>
          {patterns.recurringBlocks.length > 0 ? (
            patterns.recurringBlocks.map((b, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.88rem' }}>{b.theme}</span>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.78rem', opacity: 0.65 }}>
                  {b.sessions} session{b.sessions !== 1 ? 's' : ''}
                </span>
              </div>
            ))
          ) : (
            <p style={{ margin: 0, fontFamily: 'Cormorant Garamond, serif', fontSize: '0.85rem', opacity: 0.6 }}>
              No clear blocks yet
            </p>
          )}
        </div>

        {/* Progress areas */}
        <div style={{
          background: 'rgba(96,176,48,0.08)',
          border: '1px solid rgba(96,176,48,0.25)',
          borderRadius: 10,
          padding: '12px 14px',
        }}>
          <p style={{ margin: '0 0 8px', fontFamily: 'Cinzel, serif', fontSize: '0.72rem', color: '#60b030', letterSpacing: '0.05em' }}>
            🟢 PROGRESS AREAS
          </p>
          {patterns.progressAreas.length > 0 ? (
            patterns.progressAreas.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.88rem' }}>{p.theme}</span>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.78rem', opacity: 0.65 }}>
                  ×{p.mentions}
                </span>
              </div>
            ))
          ) : (
            <p style={{ margin: 0, fontFamily: 'Cormorant Garamond, serif', fontSize: '0.85rem', opacity: 0.6 }}>
              Track more sessions
            </p>
          )}
        </div>
      </div>

      {/* Action completion */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', color: 'var(--gold, #c9a84c)', letterSpacing: '0.06em' }}>
            ACTION ITEM COMPLETION
          </span>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.9rem', color: 'var(--gold, #c9a84c)' }}>
            {patterns.completionRate}%
          </span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
          <div style={{
            width: `${patterns.completionRate}%`,
            height: '100%',
            background: patterns.completionRate >= 70
              ? 'linear-gradient(90deg, #60b030, #40dd80)'
              : patterns.completionRate >= 40
              ? 'linear-gradient(90deg, var(--gold, #c9a84c), #e8c97a)'
              : 'linear-gradient(90deg, #d43070, #e85090)',
            borderRadius: 4,
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      {/* AI Suggestion */}
      {patterns.suggestedFocus && (
        <div style={{
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.25)',
          borderRadius: 10,
          padding: 14,
        }}>
          <p style={{ margin: '0 0 8px', fontFamily: 'Cinzel, serif', fontSize: '0.78rem', color: 'var(--gold, #c9a84c)', letterSpacing: '0.06em' }}>
            🤖 SUGGESTED FOCUS — NEXT 3 SESSIONS
          </p>
          <p style={{
            margin: 0,
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '0.92rem',
            lineHeight: 1.7,
            opacity: 0.9,
          }}>
            {renderBoldMarkdown(patterns.suggestedFocus)}
          </p>
        </div>
      )}
    </div>
  )
}
