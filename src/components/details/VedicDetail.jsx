import { useMemo } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { getVedicChart } from '../../engines/vedicEngine'
import { VEDIC_PLANET_GLYPHS, VEDIC_PLANET_COLORS, VEDIC_SIGN_COLORS, VEDIC_SIGN_ELEMENTS } from '../../data/vedicData'

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
  return getVedicChart({
    day: dob.day, month: dob.month, year: dob.year,
    hour: tob.hour, minute: tob.minute,
    lat: profile.birthLat ?? -34.6037,
    lon: profile.birthLon ?? -58.3816,
    timezone: profile.birthTimezone ?? -3,
  })
}

const PLANET_ORDER = ['sun','moon','mercury','venus','mars','jupiter','saturn','rahu','ketu']
const PLANET_NAMES = {
  sun:'Sun', moon:'Moon', mercury:'Mercury', venus:'Venus', mars:'Mars',
  jupiter:'Jupiter', saturn:'Saturn', rahu:'Rahu', ketu:'Ketu'
}

const S = {
  panel: {
    width: '100%', height: '100%', overflowY: 'auto', padding: '24px 28px',
    display: 'flex', flexDirection: 'column', gap: 28,
    background: 'var(--panel-bg)', color: 'var(--text)',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: 'rgba(160,100,255,.8)', paddingBottom: 8,
    borderBottom: '1px solid rgba(160,100,255,.1)', marginBottom: 4,
  },
  heading: {
    fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 600, letterSpacing: '.18em',
    color: 'rgba(200,160,255,1)', marginBottom: 4,
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
    border: '1px solid var(--row-border)',
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

const ELEM_COLORS = { fire: '#e85555', earth: '#d4a017', air: '#7799dd', water: '#66bbaa' }

function formatDasha(d) {
  const today = new Date()
  const start = new Date(d.start)
  const end = new Date(d.end)
  const isCurrent = today >= start && today <= end
  return { ...d, isCurrent }
}

export default function VedicDetail() {
  const primaryProfile = useAboveInsideStore(s => s.primaryProfile)
  const activeViewProfile = useAboveInsideStore(s => s.activeViewProfile)
  const profile = activeViewProfile || primaryProfile

  const chart = useMemo(() => {
    try { return computeChart(profile) } catch { return null }
  }, [profile.dob, profile.tob, profile.birthLat, profile.birthLon, profile.birthTimezone])

  if (!chart) {
    return (
      <div style={{ ...S.panel, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'var(--text3)', fontFamily: "'Cinzel',serif", fontSize: 13 }}>
          No birth data available
        </div>
      </div>
    )
  }

  const { planets, lagna, ayanamsa, dasha, moonNakshatra } = chart
  const dashaSeq = dasha.sequence.map(formatDasha)

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>🕉️ Vedic Astrology — Jyotish</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>
          Sidereal zodiac · Lahiri Ayanamsa · Vimshottari Dasha system
        </div>
      </div>

      {/* LAGNA + SUN + MOON OVERVIEW */}
      <div>
        <div style={S.sectionTitle}>Core Placements</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { label: 'Lagna (ASC)', value: lagna.sign, sub: `${lagna.degree}°`, glyph: '↑', col: 'rgba(160,100,255,1)' },
            { label: 'Sun Rashi', value: planets.sun?.sign, sub: `${planets.sun?.degree}°`, glyph: VEDIC_PLANET_GLYPHS.sun, col: VEDIC_PLANET_COLORS.sun },
            { label: 'Moon Rashi', value: planets.moon?.sign, sub: `${planets.moon?.degree}°`, glyph: VEDIC_PLANET_GLYPHS.moon, col: VEDIC_PLANET_COLORS.moon },
          ].map(({ label, value, sub, glyph, col }) => (
            <div key={label} style={{ ...S.glass, textAlign: 'center', padding: '16px 12px' }}>
              <div style={{ fontSize: 28, color: col, lineHeight: 1 }}>{glyph}</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text3)', margin: '6px 0 4px' }}>{label}</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 15, color: col, letterSpacing: '.1em' }}>{value}</div>
              <div style={{ fontFamily: "'Inconsolata',monospace", fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MOON NAKSHATRA */}
      <div>
        <div style={S.sectionTitle}>Moon Nakshatra</div>
        <div style={{ ...S.glass, display: 'flex', gap: 20, alignItems: 'center', padding: '20px 22px' }}>
          <div style={{
            width: 70, height: 70, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(160,100,255,.08)', border: '2px solid rgba(160,100,255,.2)',
            fontFamily: "'Cinzel',serif", fontSize: 24, color: VEDIC_PLANET_COLORS.moon,
          }}>
            {VEDIC_PLANET_GLYPHS.moon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 20, letterSpacing: '.12em', color: 'rgba(200,160,255,1)' }}>
              {moonNakshatra.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
              Pada {moonNakshatra.pada} · Lord: {moonNakshatra.lord}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6, fontStyle: 'italic' }}>
              {moonNakshatra.deity} · {moonNakshatra.symbol}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={S.badge('rgba(160,100,255,.1)', 'rgba(160,100,255,.25)', 'rgba(200,160,255,1)')}>
              Nak #{moonNakshatra.index + 1}
            </div>
          </div>
        </div>
      </div>

      {/* VIMSHOTTARI DASHA */}
      <div>
        <div style={S.sectionTitle}>Vimshottari Dasha</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {dashaSeq.map((d, i) => (
            <div key={i} style={{
              ...S.row,
              borderColor: d.isCurrent ? 'rgba(160,100,255,.3)' : 'rgba(255,255,255,.04)',
              background: d.isCurrent ? 'rgba(160,100,255,.06)' : 'rgba(255,255,255,.015)',
              padding: '8px 14px',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: d.isCurrent ? 'rgba(160,100,255,.8)' : 'rgba(160,100,255,.2)',
              }} />
              <div style={{ width: 80 }}>
                <div style={{
                  fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: '.06em',
                  color: d.isCurrent ? 'rgba(200,160,255,1)' : 'var(--text)',
                }}>{d.lord}</div>
              </div>
              <div style={{ fontFamily: "'Inconsolata',monospace", fontSize: 10, color: 'var(--text3)', width: 30, textAlign: 'center' }}>
                {d.years}y
              </div>
              <div style={{ flex: 1, fontFamily: "'Inconsolata',monospace", fontSize: 10, color: 'var(--text3)' }}>
                {d.start} → {d.end}
              </div>
              {d.isCurrent && (
                <span style={S.badge('rgba(160,100,255,.14)', 'rgba(160,100,255,.35)', 'rgba(200,160,255,1)')}>
                  Current
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ALL PLANETS */}
      <div>
        <div style={S.sectionTitle}>Planetary Positions (Sidereal)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {PLANET_ORDER.map(body => {
            const p = planets[body]
            if (!p) return null
            const col = VEDIC_PLANET_COLORS[body] || '#cccccc'
            const glyph = VEDIC_PLANET_GLYPHS[body] || '?'
            const signIdx = Math.floor((p.siderealLon || 0) / 30)
            const elemKey = VEDIC_SIGN_ELEMENTS[signIdx]
            const elemCol = ELEM_COLORS[elemKey] || '#aaa'

            return (
              <div key={body} style={{
                ...S.row,
                borderColor: 'rgba(255,255,255,.04)',
                background: 'rgba(255,255,255,.015)',
                padding: '7px 12px',
              }}>
                <span style={{ fontSize: 20, minWidth: 28, textAlign: 'center', color: col }}>{glyph}</span>
                <div style={{ width: 72 }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: '.06em', color: col }}>
                    {PLANET_NAMES[body]}
                  </div>
                </div>
                <div style={{ width: 90 }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, color: 'var(--text)' }}>
                    {p.sign}
                  </div>
                  <div style={{ fontFamily: "'Inconsolata',monospace", fontSize: 10, color: 'var(--text3)' }}>
                    {p.degree}°
                  </div>
                </div>
                {p.nakshatra && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>{p.nakshatra.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>Pada {p.nakshatra.pada} · {p.nakshatra.lord}</div>
                  </div>
                )}
                <span style={S.badge(elemCol + '12', elemCol + '30', elemCol)}>
                  {elemKey}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* LAGNA DETAILS */}
      <div>
        <div style={S.sectionTitle}>Lagna (Ascendant)</div>
        <div style={{ ...S.glass }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
            <div style={{
              fontFamily: "'Cinzel',serif", fontSize: 22, letterSpacing: '.1em', color: 'rgba(160,100,255,1)',
            }}>{lagna.sign}</div>
            <div style={{ fontFamily: "'Inconsolata',monospace", fontSize: 11, color: 'var(--text3)' }}>
              {lagna.siderealLon}° sidereal
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            Nakshatra: <span style={{ color: 'var(--text2)' }}>{lagna.nakshatra?.name}</span>
            {' '}· Pada {lagna.nakshatra?.pada}
            {' '}· Lord: {lagna.nakshatra?.lord}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
            Ayanamsa (Lahiri): {ayanamsa}°
          </div>
        </div>
      </div>

      {/* INTERPRETATION */}
      <div>
        <div style={S.sectionTitle}>Jyotish Reading</div>
        <div style={S.interpretation}>
          Your <span style={{ color: 'rgba(160,100,255,1)' }}>Lagna in {lagna.sign}</span> colors
          the entire lens through which life expresses itself. The Moon's placement in{' '}
          <span style={{ color: VEDIC_PLANET_COLORS.moon }}>{planets.moon?.sign}</span>, nakshatra{' '}
          <span style={{ color: 'rgba(200,160,255,.9)' }}>{moonNakshatra.name}</span> (ruled by{' '}
          {moonNakshatra.lord}), forms the emotional core of your Vedic blueprint — the subconscious
          field from which all desires arise. The current Mahadasha of{' '}
          <span style={{ color: 'rgba(200,160,255,1)' }}>{dasha.currentDasha}</span> shapes the
          overarching theme of this period, coloring what rises to the surface of your lived
          experience. Jyotish sees time itself as rhythmic and purposeful — each dasha a distinct
          season of the soul.
        </div>
      </div>
    </div>
  )
}
