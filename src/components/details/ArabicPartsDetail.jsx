import { useMemo } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { getNatalChart } from '../../engines/natalEngine'
import { getArabicParts } from '../../engines/arabicPartsEngine'

function parseDOB(dob) {
  if (!dob) return null
  const [y, m, d] = dob.split('-').map(Number)
  return { year: y, month: m, day: d }
}
function parseTOB(tob) {
  if (!tob) return { hour: 12, minute: 0 }
  const [h, m] = tob.split(':').map(Number)
  return { hour: h || 0, minute: m || 0 }
}

function computeChart(profile) {
  const dob = parseDOB(profile.dob)
  const tob = parseTOB(profile.tob)
  if (!dob) return null
  try {
    return getNatalChart({
      day: dob.day, month: dob.month, year: dob.year,
      hour: tob.hour, minute: tob.minute,
      lat: profile.birthLat ?? -34.6037,
      lon: profile.birthLon ?? -58.3816,
      timezone: profile.birthTimezone ?? -3,
    })
  } catch { return null }
}

const SIGN_GLYPHS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']

const PART_COLORS = [
  '#f0c040', // Fortune — gold
  '#ccd5f0', // Spirit — moon silver
  '#ddaa88', // Love — Venus rose
  '#e8c8d0', // Marriage — soft pink
  '#ee6644', // Passion — Mars red
  '#99ccee', // Career — Mercury blue
  '#e8c040', // Abundance — Jupiter gold
  '#aabb88', // Karma — Saturn olive
  '#bb88cc', // Transformation — Pluto violet
  '#88ddcc', // Nobility — teal
]

const PART_ICONS = ['✦', '✧', '♡', '◈', '⚔', '◉', '✦', '⌛', '⟳', '♔']

const S = {
  panel: {
    width: '100%', height: '100%', overflowY: 'auto', padding: '24px 28px',
    display: 'flex', flexDirection: 'column', gap: 28,
    background: 'var(--card)', color: 'var(--foreground)',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: 'var(--muted-foreground)', paddingBottom: 8,
    borderBottom: '1px solid var(--accent)', marginBottom: 4,
  },
  heading: {
    fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 600, letterSpacing: '.18em',
    color: 'var(--foreground)', marginBottom: 4,
  },
  glass: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 13, padding: 18, backdropFilter: 'blur(12px)',
  },
  chartIndicator: (isDay) => ({
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '6px 14px', borderRadius: 20,
    background: isDay ? 'rgba(240,192,64,.1)' : 'rgba(100,120,200,.1)',
    border: `1px solid ${isDay ? 'rgba(240,192,64,.3)' : 'rgba(100,120,200,.3)'}`,
    fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.15em',
    color: isDay ? '#f0c040' : '#99aaee',
    textTransform: 'uppercase',
  }),
  partCard: (color) => ({
    display: 'flex', flexDirection: 'column', gap: 6, padding: '14px 16px',
    borderRadius: 10, background: 'var(--secondary)',
    border: `1px solid ${color}33`, transition: 'background .2s',
  }),
  partHeader: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  icon: (color) => ({
    fontSize: 18, color: color, width: 28, textAlign: 'center', flexShrink: 0,
  }),
  partName: {
    fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, letterSpacing: '.12em',
    color: 'var(--foreground)', textTransform: 'uppercase',
  },
  position: (color) => ({
    fontFamily: "'Inconsolata', monospace", fontSize: 11, color: color,
    marginLeft: 'auto', flexShrink: 0,
  }),
  formula: {
    fontFamily: "'Inconsolata', monospace", fontSize: 10, color: 'var(--muted-foreground)',
    paddingLeft: 38,
  },
  description: {
    fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)', fontStyle: 'italic',
    paddingLeft: 38,
  },
  intro: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--muted-foreground)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'var(--accent)', border: '1px solid var(--border)',
  },
}

export default function ArabicPartsDetail() {
  const primaryProfile = useAboveInsideStore(s => s.primaryProfile)
  const activeViewProfile = useAboveInsideStore(s => s.activeViewProfile)
  const profile = activeViewProfile || primaryProfile

  const result = useMemo(() => {
    const chart = computeChart(profile)
    if (!chart) return null
    return getArabicParts(chart)
  }, [profile])

  if (!result) {
    return (
      <div style={S.panel}>
        <div style={S.glass}>
          <div style={{ ...S.intro, textAlign: 'center' }}>
            Enter birth data to calculate your Arabic Parts / Lots
          </div>
        </div>
      </div>
    )
  }

  const { parts, isDayChart } = result

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div style={S.glass}>
        <div style={S.heading}>Arabic Parts · Lots</div>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--muted-foreground)', fontStyle: 'italic', marginBottom: 14 }}>
          Sensitive points of synthesis — each Arabic Part is calculated from three natal positions,
          revealing hidden dimensions of fate, fortune, and soul purpose encoded in your chart.
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={S.chartIndicator(isDayChart)}>
            <span>{isDayChart ? '☉' : '☽'}</span>
            <span>{isDayChart ? 'Day Chart' : 'Night Chart'}</span>
          </div>
          <span style={{
            fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.1em',
            padding: '2px 10px', borderRadius: 10,
            background: 'var(--accent)', border: '1px solid rgba(201,168,76,.2)',
            color: 'var(--muted-foreground)',
          }}>
            {isDayChart ? 'Sun above horizon' : 'Sun below horizon'} · Traditional Reversal Applied
          </span>
        </div>
      </div>

      {/* PARTS */}
      <div>
        <div style={S.sectionTitle}>THE TEN LOTS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {parts.map((part, i) => {
            const color = PART_COLORS[i] || 'var(--foreground)'
            const signGlyph = SIGN_GLYPHS[part.signIndex] || ''
            return (
              <div key={part.name} style={S.partCard(color)}>
                <div style={S.partHeader}>
                  <span style={S.icon(color)}>{PART_ICONS[i] || '✦'}</span>
                  <span style={S.partName}>{part.name}</span>
                  <span style={S.position(color)}>
                    {signGlyph} {part.sign} {part.degree.toFixed(1)}°
                  </span>
                </div>
                <div style={S.description}>{part.description}</div>
                <div style={S.formula}>{part.formula}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* NOTE */}
      <div style={{
        padding: '12px 16px', borderRadius: 10,
        background: 'var(--secondary)', border: '1px solid var(--accent)',
        fontSize: 12, lineHeight: 1.6, color: 'var(--muted-foreground)',
        fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic',
      }}>
        Arabic Parts originate in Hellenistic and medieval Arabic astrology. The Part of Fortune
        and Part of Spirit are reversed in Night Charts (Sun below the horizon) per traditional
        Ptolemaic doctrine. All other lots use the same formula regardless of chart type.
      </div>
    </div>
  )
}
