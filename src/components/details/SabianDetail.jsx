import { useMemo } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { getNatalChart } from '../../engines/natalEngine'
import { getSabianProfile } from '../../engines/sabianEngine'

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

const PLANET_GLYPHS = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', asc: 'ASC', mc: 'MC',
}

const PLANET_NAMES = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune',
  pluto: 'Pluto', northNode: 'North Node', asc: 'Ascendant', mc: 'Midheaven',
}

const PLANET_COLORS = {
  sun: '#f0c040', moon: '#ccd5f0', mercury: '#99ccee', venus: '#ddaa88',
  mars: '#ee6644', jupiter: '#e8c040', saturn: '#aabb88', uranus: '#88ddcc',
  neptune: '#6699ee', pluto: '#bb88cc', northNode: '#c9a84c', asc: '#c9a84c', mc: '#c9a84c',
}

const GROUPS = [
  { label: 'PERSONAL PLANETS', color: 'var(--foreground)', keys: ['sun','moon','mercury','venus','mars'] },
  { label: 'SOCIAL PLANETS', color: 'rgba(144,80,224,.9)', keys: ['jupiter','saturn'] },
  { label: 'GENERATIONAL PLANETS', color: 'rgba(64,204,221,.9)', keys: ['uranus','neptune','pluto'] },
  { label: 'NODES & ANGLES', color: 'rgba(201,168,76,.7)', keys: ['northNode','asc','mc'] },
]

const SIGN_GLYPHS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']
const SIGN_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']

const S = {
  panel: {
    width: '100%', height: '100%', overflowY: 'auto', padding: '24px 28px',
    display: 'flex', flexDirection: 'column', gap: 28,
    background: 'var(--card)', color: 'var(--foreground)',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  sectionTitle: (color) => ({
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: color || 'var(--muted-foreground)', paddingBottom: 8,
    borderBottom: `1px solid ${color ? color.replace(')', ',.15)').replace('rgba(','rgba(') : 'var(--accent)'}`,
    marginBottom: 4,
  }),
  heading: {
    fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 600, letterSpacing: '.18em',
    color: 'var(--foreground)', marginBottom: 4,
  },
  glass: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 13, padding: 18, backdropFilter: 'blur(12px)',
  },
  planetCard: (color) => ({
    display: 'flex', flexDirection: 'column', gap: 6, padding: '14px 16px',
    borderRadius: 10, background: 'var(--secondary)',
    border: `1px solid ${color}33`,
    transition: 'background .2s',
  }),
  planetHeader: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  glyph: (color) => ({
    fontSize: 20, color: color, width: 28, textAlign: 'center', flexShrink: 0,
    fontFamily: 'serif',
  }),
  planetName: {
    fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, letterSpacing: '.15em',
    color: 'var(--foreground)', textTransform: 'uppercase',
  },
  degree: {
    fontFamily: "'Inconsolata', monospace", fontSize: 11, color: 'var(--muted-foreground)',
    marginLeft: 'auto', flexShrink: 0,
  },
  symbolText: {
    fontSize: 15, lineHeight: 1.6, color: 'var(--foreground)', fontStyle: 'italic',
    paddingLeft: 38,
  },
  themeTag: (color) => ({
    display: 'inline-block', padding: '2px 9px', borderRadius: 10,
    fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.1em',
    textTransform: 'uppercase', background: `${color}18`, border: `1px solid ${color}44`,
    color: color, marginLeft: 38, marginTop: 2, alignSelf: 'flex-start',
  }),
  approxBadge: {
    display: 'inline-block', padding: '1px 7px', borderRadius: 8,
    fontFamily: "'Cinzel', serif", fontSize: 7, letterSpacing: '.1em',
    background: 'rgba(255,200,60,.08)', border: '1px solid rgba(255,200,60,.2)',
    color: 'rgba(255,200,60,.6)', marginLeft: 6,
  },
  intro: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--muted-foreground)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'var(--accent)', border: '1px solid var(--border)',
  },
}

export default function SabianDetail() {
  const primaryProfile = useAboveInsideStore(s => s.primaryProfile)
  const activeViewProfile = useAboveInsideStore(s => s.activeViewProfile)
  const profile = activeViewProfile || primaryProfile

  const sabianProfile = useMemo(() => {
    const chart = computeChart(profile)
    if (!chart) return null
    return getSabianProfile(chart)
  }, [profile])

  if (!sabianProfile) {
    return (
      <div style={S.panel}>
        <div style={S.glass}>
          <div style={{ ...S.intro, textAlign: 'center' }}>
            Enter birth data to reveal your Sabian Symbols
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div style={S.glass}>
        <div style={S.heading}>Sabian Symbols</div>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--muted-foreground)', fontStyle: 'italic', marginBottom: 12 }}>
          360 symbolic images — one for each degree of the zodiac. Your natal planets each fall upon
          a specific Sabian Symbol, revealing the archetypal image encoded in your birth moment.
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Aries → Pisces', 'Exact Degree', 'Rudhyar Interpretation'].map(tag => (
            <span key={tag} style={{
              fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.1em',
              padding: '2px 10px', borderRadius: 10,
              background: 'var(--accent)', border: '1px solid rgba(201,168,76,.2)',
              color: 'var(--muted-foreground)',
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* GROUPS */}
      {GROUPS.map(group => {
        const entries = group.keys
          .map(key => sabianProfile[key] ? { key, data: sabianProfile[key] } : null)
          .filter(Boolean)
        if (entries.length === 0) return null

        return (
          <div key={group.label}>
            <div style={S.sectionTitle(group.color)}>{group.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entries.map(({ key, data }) => {
                const color = PLANET_COLORS[key] || 'var(--foreground)'
                const signIdx = data.lon != null ? Math.floor(data.lon / 30) : 0
                const signGlyph = SIGN_GLYPHS[signIdx] || ''
                const signName = SIGN_NAMES[signIdx] || data.sign || ''
                return (
                  <div key={key} style={S.planetCard(color)}>
                    <div style={S.planetHeader}>
                      <span style={S.glyph(color)}>{PLANET_GLYPHS[key]}</span>
                      <span style={S.planetName}>{PLANET_NAMES[key]}</span>
                      <span style={S.degree}>
                        {signGlyph} {signName} {data.degree}°
                        {data.approximate && <span style={S.approxBadge}>~approx</span>}
                      </span>
                    </div>
                    <div style={S.symbolText}>"{data.sabian}"</div>
                    <span style={S.themeTag(color)}>{data.theme}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
