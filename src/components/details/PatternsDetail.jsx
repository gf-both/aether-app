import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import {
  CROSS_FRAMEWORK_ALIGNMENTS,
  PATTERN_CATEGORIES,
  PROFILE_PATTERN_MATCHES,
  TIMING_PATTERNS,
} from '../../data/patternsData'

/* ---- type config ---- */
const TYPE_CONFIG = {
  resonance: { col: '#c9a84c',            bg: 'rgba(201,168,76,.08)',  border: 'rgba(201,168,76,.22)', label: 'Resonance' },
  tension:   { col: 'var(--violet2)',      bg: 'rgba(144,80,224,.08)', border: 'rgba(144,80,224,.22)', label: 'Tension' },
  gateway:   { col: '#40ccdd',            bg: 'rgba(64,204,221,.08)', border: 'rgba(64,204,221,.22)', label: 'Gateway' },
  mirror:    { col: 'rgba(255,255,255,.7)', bg: 'rgba(255,255,255,.05)', border: 'rgba(255,255,255,.12)', label: 'Mirror' },
}

const ACTIVATION_CONFIG = {
  active:   { col: '#60b030', bg: 'rgba(96,176,48,.1)',  border: 'rgba(96,176,48,.25)', label: 'ACTIVE' },
  building: { col: '#e09040', bg: 'rgba(224,144,64,.1)', border: 'rgba(224,144,64,.25)', label: 'BUILDING' },
  fading:   { col: 'var(--text3)', bg: 'rgba(255,255,255,.04)', border: 'rgba(255,255,255,.08)', label: 'FADING' },
}

const FRAMEWORK_LABELS = {
  natal: 'Natal', hd: 'Human Design', kab: 'Kabbalah', num: 'Numerology',
  gk: 'Gene Keys', tr: 'Transits', mayan: 'Mayan', enn: 'Enneagram', chi: 'Chinese',
}

const FRAMEWORK_COLORS = {
  natal: '#f0c040', hd: '#40ccdd', kab: '#aa66ff', num: '#e09040',
  gk: '#c44d7a', tr: '#88aacc', mayan: '#cc3333', enn: '#64ccdd', chi: '#cfd8dc',
}

/* ---- shared styles ---- */
const S = {
  panel: {
    width: '100%', height: '100%', overflowY: 'auto', padding: '24px 28px',
    display: 'flex', flexDirection: 'column', gap: 28,
    background: 'var(--panel-bg)', color: 'var(--text)',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: 'var(--gold3)', paddingBottom: 8,
    borderBottom: '1px solid rgba(201,168,76,.1)', marginBottom: 4,
  },
  heading: {
    fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 600, letterSpacing: '.18em',
    color: 'var(--gold)', marginBottom: 4,
  },
  subHeading: {
    fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, letterSpacing: '.15em',
    textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8,
  },
  mono: {
    fontFamily: "'Inconsolata', monospace", fontSize: 12, fontWeight: 500, color: 'var(--text)',
  },
  monoSm: {
    fontFamily: "'Inconsolata', monospace", fontSize: 11, color: 'var(--text2)',
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
    borderRadius: 8, background: 'var(--row-bg)',
    border: '1px solid var(--row-border)', transition: 'background .2s',
  },
  glass: {
    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
    borderRadius: 13, padding: 18, backdropFilter: 'blur(12px)',
  },
  badge: (bg, border, color) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: 12,
    fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.1em',
    textTransform: 'uppercase', background: bg, border: `1px solid ${border}`, color,
  }),
  interpretation: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--text2)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'var(--interp-bg)', border: '1px solid var(--interp-border)',
  },
}

/* ---- helper: circular progress ring ---- */
function CircularProgress({ value, size = 48, stroke = 3, color = '#c9a84c' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="var(--bar-track)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset .8s ease' }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        style={{ fontFamily: "'Inconsolata', monospace", fontSize: size * .26, fill: color }}>
        {value}
      </text>
    </svg>
  )
}

/* ---- helper: strength meter ---- */
function StrengthMeter({ value, max = 10, color = '#c9a84c' }) {
  const pct = (value / max) * 100
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: 'var(--bar-track)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3, width: `${pct}%`,
          background: color, opacity: 0.75, transition: 'width .6s ease',
        }} />
      </div>
      <span style={{ ...S.monoSm, fontSize: 10, minWidth: 22, textAlign: 'right' }}>{value}/{max}</span>
    </div>
  )
}

export default function PatternsDetail() {
  const { people } = useAboveInsideStore()

  // Compute stats
  const totalAlignments = CROSS_FRAMEWORK_ALIGNMENTS.length
  const typeCounts = {}
  CROSS_FRAMEWORK_ALIGNMENTS.forEach((a) => { typeCounts[a.type] = (typeCounts[a.type] || 0) + 1 })
  const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]
  const avgStrength = (CROSS_FRAMEWORK_ALIGNMENTS.reduce((s, a) => s + a.strength, 0) / totalAlignments).toFixed(1)
  const activeTimingCount = TIMING_PATTERNS.filter((t) => t.activation === 'active').length

  // Group alignments by category
  const byCategory = {}
  PATTERN_CATEGORIES.forEach((cat) => { byCategory[cat.id] = [] })
  CROSS_FRAMEWORK_ALIGNMENTS.forEach((a) => {
    if (byCategory[a.category]) byCategory[a.category].push(a)
  })

  return (
    <div style={S.panel}>

      {/* ═══ HEADER ═══ */}
      <div>
        <div style={S.heading}>{'\u2B21'} Your Pattern Map</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic', marginBottom: 12 }}>
          Cross-framework alignments, synchronicities, and hidden correlations across all your esoteric systems
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={S.badge('rgba(201,168,76,.08)', 'rgba(201,168,76,.2)', 'var(--gold)')}>
            {totalAlignments} alignments detected
          </span>
          <span style={S.badge(
            TYPE_CONFIG[dominantType[0]].bg,
            TYPE_CONFIG[dominantType[0]].border,
            TYPE_CONFIG[dominantType[0]].col,
          )}>
            dominant: {dominantType[0]} ({dominantType[1]})
          </span>
          <span style={S.badge('rgba(96,176,48,.08)', 'rgba(96,176,48,.2)', '#60b030')}>
            avg strength {avgStrength}/10
          </span>
          {activeTimingCount > 0 && (
            <span style={S.badge('rgba(96,176,48,.12)', 'rgba(96,176,48,.3)', '#60b030')}>
              {activeTimingCount} pattern{activeTimingCount > 1 ? 's' : ''} active now
            </span>
          )}
        </div>
      </div>

      {/* ═══ ACTIVE TIMING PATTERNS ═══ */}
      <div>
        <div style={S.sectionTitle}>Active Timing Patterns</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TIMING_PATTERNS.map((tp, i) => {
            const ac = ACTIVATION_CONFIG[tp.activation]
            return (
              <div key={i} style={{
                ...S.glass, padding: '14px 16px',
                borderLeft: `3px solid ${ac.col}`,
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={S.badge(ac.bg, ac.border, ac.col)}>{ac.label}</span>
                  <span style={{ ...S.mono, fontSize: 13, color: 'var(--gold2)', flex: 1 }}>{tp.pattern}</span>
                  <span style={{ ...S.monoSm, fontSize: 10 }}>peak {tp.peakDate}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                  {tp.description}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══ CORE ALIGNMENTS GRID ═══ */}
      <div>
        <div style={S.sectionTitle}>Cross-Framework Alignments</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CROSS_FRAMEWORK_ALIGNMENTS.map((a) => {
            const tc = TYPE_CONFIG[a.type]
            return (
              <div key={a.id} style={{
                ...S.glass, padding: '14px 16px',
                borderLeft: `3px solid ${tc.col}`,
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: "'Cinzel', serif", fontSize: 14, letterSpacing: '.08em',
                    color: tc.col, flex: 1,
                  }}>
                    {a.title}
                  </span>
                  <span style={S.badge(tc.bg, tc.border, tc.col)}>{tc.label}</span>
                </div>

                {/* Framework chips */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {a.frameworks.map((fw) => (
                    <span key={fw} style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 10,
                      fontFamily: "'Inconsolata', monospace", fontSize: 9, letterSpacing: '.05em',
                      background: `${FRAMEWORK_COLORS[fw]}11`,
                      border: `1px solid ${FRAMEWORK_COLORS[fw]}33`,
                      color: FRAMEWORK_COLORS[fw],
                    }}>
                      {FRAMEWORK_LABELS[fw]}
                    </span>
                  ))}
                </div>

                {/* Strength meter */}
                <StrengthMeter value={a.strength} color={tc.col} />

                {/* Description */}
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                  {a.description}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══ PATTERN CATEGORIES ═══ */}
      <div>
        <div style={S.sectionTitle}>Patterns by Category</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {PATTERN_CATEGORIES.map((cat) => {
            const items = byCategory[cat.id] || []
            if (items.length === 0) return null
            return (
              <div key={cat.id} style={S.glass}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 18, minWidth: 24, textAlign: 'center' }}>{cat.icon}</span>
                  <div>
                    <div style={S.subHeading}>{cat.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: -4 }}>{cat.description}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {items.map((a) => {
                    const tc = TYPE_CONFIG[a.type]
                    return (
                      <div key={a.id} style={{
                        ...S.row, flexDirection: 'column', alignItems: 'stretch', gap: 6, padding: '10px 14px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%', background: tc.col, flexShrink: 0,
                          }} />
                          <span style={{ ...S.mono, fontSize: 13, color: tc.col, flex: 1 }}>{a.title}</span>
                          <span style={{ ...S.monoSm, fontSize: 10 }}>{a.strength}/10</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5, paddingLeft: 14 }}>
                          {a.description}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══ PROFILE MATCHES ═══ */}
      <div>
        <div style={S.sectionTitle}>Profile Pattern Matches</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, fontStyle: 'italic' }}>
          How your pattern signature resonates with others
          {people.length > 0 && (
            <span style={{ color: 'var(--text2)' }}> — {people.length} profile{people.length > 1 ? 's' : ''} in your circle</span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PROFILE_PATTERN_MATCHES.map((pm, i) => {
            const scoreColor = pm.resonanceScore >= 80 ? '#60b030' :
              pm.resonanceScore >= 60 ? '#e09040' : '#ee4466'
            return (
              <div key={i} style={{
                ...S.glass, padding: '16px 18px',
                display: 'flex', gap: 16, alignItems: 'flex-start',
              }}>
                {/* Circular progress */}
                <CircularProgress value={pm.resonanceScore} color={scoreColor} />

                {/* Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{pm.emoji}</span>
                    <span style={{
                      fontFamily: "'Cinzel', serif", fontSize: 13, letterSpacing: '.08em',
                      color: 'var(--gold)',
                    }}>
                      {pm.personName}
                    </span>
                    <span style={S.badge('rgba(201,168,76,.06)', 'rgba(201,168,76,.15)', 'var(--gold3)')}>
                      {pm.sharedPatterns} shared
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
                    <span style={{ color: '#60b030' }}>{'\u25B2'} </span>
                    {pm.topAlignment}
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>
                    <span style={{ color: '#9050e0' }}>{'\u25BC'} </span>
                    {pm.tensionPoint}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══ THE PATTERN READING ═══ */}
      <div>
        <div style={S.sectionTitle}>The Pattern Reading</div>
        <div style={S.interpretation}>
          <span style={{ color: 'var(--gold)' }}>Your pattern signature</span> is dominated by the number 5 —
          the seeker, the investigator, the one who must understand before acting. This frequency echoes across
          your Enneagram type, Life Path, and Gene Key profile lines with remarkable consistency, suggesting a
          soul whose primary orientation is toward{' '}
          <span style={{ color: '#40ccdd' }}>deep comprehension before engagement</span>.
          <br /><br />
          Yet this investigative nature is not cold or detached. The{' '}
          <span style={{ color: '#9050e0' }}>Scorpio Moon-Emotional Authority-4 wing triple alignment</span>{' '}
          reveals that beneath the analytical surface lies an ocean of transformative feeling. You do not simply
          think about things — you alchemize them through emotional depth. This is the central paradox of your
          pattern map: the mind that seeks distance and the heart that demands total immersion.
          <br /><br />
          The <span style={{ color: '#c9a84c' }}>Tiphareth Bridge</span> — connecting Kabbalah, Libra Rising,
          and your Galactic Tone of Integrity — positions you at the exact center point where these opposing
          forces can find harmony. Your incarnation is not about choosing between observation and participation,
          between the metal blade and the flowing water. It is about being the{' '}
          <span style={{ color: 'var(--gold)' }}>living bridge</span> where both are held simultaneously.
          <br /><br />
          The Cross of the Unexpected is the clearest statement of purpose: your life unfolds through surprise,
          through the willingness to be interrupted by what you could not have anticipated. The{' '}
          <span style={{ color: '#40ccdd' }}>Projector-Libra-Metal Rooster</span> pattern ensures that when
          these unexpected invitations arrive, you bring extraordinary precision and grace to your response.
          You are not here to force doors open — you are here to recognize which ones were always meant for you,
          and to walk through them with the totality that Gene Key 28 demands.
        </div>
      </div>

      {/* ═══ HIDDEN CONNECTIONS ═══ */}
      <div>
        <div style={S.sectionTitle}>Hidden Connections</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', marginBottom: 8 }}>
          Subtle numerological and symbolic coincidences that may carry meaning
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            {
              sym: '#',
              title: 'Kin 138 reduces to 1+3+8 = 12, then 1+2 = 3',
              detail: 'The number 3 is the Creative Expression number — connecting your Mayan signature to the Gene Key 31 (Leadership through creative influence) in your Evolution position.',
            },
            {
              sym: '\u221E',
              title: 'Galactic Tone 8 = Infinity turned upright',
              detail: 'Tone 8 (Integrity) appears as the harmonic midpoint between your Life Path 5 and Enneagram 5. The 8 is the bridge between two 5s — suggesting your integrity is the mechanism that unifies your seeking nature.',
            },
            {
              sym: '\u2609',
              title: 'Aquarius 3\u00B0 = Gate 41, Line 3',
              detail: 'Your Sun at 3 degrees Aquarius maps precisely to Human Design Gate 41 (Anticipation), Line 3 (the Martyr). The same gate is your Gene Keys Life\'s Work. Three systems arrive at the identical celestial point.',
            },
            {
              sym: '\u25B3',
              title: 'Three systems of three: 3/5 profile, 5w4, Tritype 5-4-1',
              detail: 'Your HD profile has two numbers. Your Enneagram has type and wing. Your Tritype has three numbers. In all three formulations, the relationship between investigation (5), individuality (4), and integrity (1 or 3/5) repeats. The triangle of seeking, feeling, and refining.',
            },
            {
              sym: '\u2726',
              title: 'Metal Rooster year (1981) = Universal Year 1+9+8+1 = 19 = 10 = 1',
              detail: 'You were born in a Universal Year 1 — the year of new beginnings and individuation. Combined with the Metal element\'s cutting precision, this suggests your birth year carries the numerological signature of the pioneer who arrives fully formed.',
            },
            {
              sym: '\u263D',
              title: 'Scorpio Moon at 12\u00B0 = Gate 44 (Alertness)',
              detail: 'Gate 44 in Human Design governs pattern recognition — the ability to detect what is coming before it arrives. Your Moon (emotional body) is literally positioned in the gate of recognizing patterns. You feel patterns before you see them.',
            },
          ].map((hc, i) => (
            <div key={i} style={{
              ...S.row, flexDirection: 'column', alignItems: 'stretch', gap: 4, padding: '10px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 16,
                  color: 'var(--gold)', minWidth: 22, textAlign: 'center',
                }}>{hc.sym}</span>
                <span style={{ ...S.mono, fontSize: 12, color: 'var(--gold2)' }}>{hc.title}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5, paddingLeft: 32 }}>
                {hc.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
