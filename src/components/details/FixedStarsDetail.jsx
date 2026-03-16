import { useMemo } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { getFixedStars, FIXED_STARS } from '../../engines/fixedStarsEngine'
import { getNatalChart } from '../../engines/natalEngine'

const NATURE_COLORS = {
  'Jupiter/Mars': '#e8c040',
  'Mars':         '#ee5544',
  'Saturn/Mars':  '#aa8899',
  'Venus/Mars':   '#dd88aa',
  'Venus/Mercury':'#88ddcc',
  'Mercury/Mars': '#88aaee',
  'Moon/Jupiter': '#aaccff',
  'Mars/Jupiter': '#e8a040',
  'Saturn/Mercury':'#99aaaa',
  'Jupiter':      '#e8c888',
  'Jupiter/Mercury':'#aaddaa',
}

const PLANET_SYMBOLS = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', asc: 'ASC', mc: 'MC',
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
    textTransform: 'uppercase', color: 'var(--gold3)', paddingBottom: 8,
    borderBottom: '1px solid rgba(201,168,76,.1)', marginBottom: 4,
  },
  heading: {
    fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 600, letterSpacing: '.18em',
    color: 'var(--gold)', marginBottom: 4,
  },
  glass: {
    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
    borderRadius: 13, padding: 18, backdropFilter: 'blur(12px)',
  },
  starRow: (isExact) => ({
    display: 'flex', alignItems: 'flex-start', gap: 14,
    padding: '14px 16px', borderRadius: 10,
    background: isExact ? 'rgba(201,168,76,.06)' : 'rgba(255,255,255,.015)',
    border: `1px solid ${isExact ? 'rgba(201,168,76,.22)' : 'rgba(255,255,255,.05)'}`,
    marginBottom: 8,
  }),
  badge: (bg, border, color) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: 10,
    fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.1em',
    textTransform: 'uppercase', background: bg, border: `1px solid ${border}`, color,
  }),
  emptyState: {
    textAlign: 'center', padding: '48px 24px',
    fontStyle: 'italic', color: 'var(--text3)', fontSize: 14,
  },
  interpretation: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--text2)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'var(--interp-bg)', border: '1px solid var(--interp-border)',
  },
}

export default function FixedStarsDetail() {
  const primaryProfile = useAboveInsideStore(s => s.primaryProfile)
  const activeViewProfile = useAboveInsideStore(s => s.activeViewProfile)
  const profile = activeViewProfile || primaryProfile

  const conjunctions = useMemo(() => {
    try {
      const dob = profile?.dob || '1981-01-23'
      const tob = profile?.tob || '22:10'
      const lat = profile?.lat ?? -34.6037
      const lon = profile?.lon ?? -58.3816

      const [y, m, d] = dob.split('-').map(Number)
      const [h, min] = (tob || '12:00').split(':').map(Number)
      const timezone = profile?.timezone ?? -3

      const chart = getNatalChart({ year: y, month: m, day: d, hour: h, minute: min, lat, lon, timezone })
      return getFixedStars(chart)
    } catch (e) {
      return []
    }
  }, [profile])

  const exactCount = conjunctions.filter(c => c.exact).length

  return (
    <div style={S.panel}>
      {/* Header */}
      <div>
        <div style={S.heading}>✦ Fixed Stars</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>
          Prominent stars conjunct natal planets within {1.5}° — ancient stellar influences
        </div>
      </div>

      {/* Summary */}
      {conjunctions.length > 0 && (
        <div>
          <div style={S.sectionTitle}>Overview</div>
          <div style={{ ...S.glass, display: 'flex', gap: 24, justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 28, color: 'var(--gold)', letterSpacing: '.1em',
              }}>{conjunctions.length}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>Total Conjunctions</div>
            </div>
            {exactCount > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 28, color: '#e8c040', letterSpacing: '.1em',
                }}>{exactCount}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>Exact (&lt;0.5°)</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conjunctions */}
      <div>
        <div style={S.sectionTitle}>
          {conjunctions.length > 0 ? `Natal Conjunctions (${conjunctions.length})` : 'No Conjunctions Found'}
        </div>

        {conjunctions.length === 0 ? (
          <div style={S.emptyState}>
            No fixed star conjunctions within 1.5° found in this natal chart.
            <br />
            <span style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginTop: 8 }}>
              Try widening the orb or check birth data accuracy.
            </span>
          </div>
        ) : (
          conjunctions.map((c, i) => {
            const nc = NATURE_COLORS[c.nature] || '#c9a84c'
            const sym = PLANET_SYMBOLS[c.planet] || c.planet.toUpperCase()
            return (
              <div key={i} style={S.starRow(c.exact)}>
                {/* Planet symbol */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.15)',
                  fontFamily: "'Cinzel', serif", fontSize: 16, color: 'var(--gold)',
                }}>
                  {sym}
                </div>

                <div style={{ flex: 1 }}>
                  {/* Star name + orb */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: "'Cinzel', serif", fontSize: 14, letterSpacing: '.08em',
                      color: nc, fontWeight: 600,
                    }}>
                      {c.star}
                    </span>
                    {c.exact && (
                      <span style={S.badge('rgba(201,168,76,.1)', 'rgba(201,168,76,.3)', 'var(--gold)')}>
                        Exact
                      </span>
                    )}
                    <span style={S.badge(`${nc}15`, `${nc}33`, nc)}>
                      {c.nature}
                    </span>
                    <span style={{
                      fontFamily: "'Inconsolata', monospace", fontSize: 10,
                      color: 'var(--text3)', marginLeft: 'auto',
                    }}>
                      {c.planet} ∿ orb {c.orb}°
                    </span>
                  </div>

                  {/* Keywords */}
                  <div style={{
                    fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.12em',
                    textTransform: 'uppercase', color: `${nc}bb`, marginBottom: 4,
                  }}>
                    {c.keywords}
                  </div>

                  {/* Meaning */}
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    {c.meaning}
                  </div>

                  {/* Degree info */}
                  <div style={{
                    fontFamily: "'Inconsolata', monospace", fontSize: 10,
                    color: 'var(--text3)', marginTop: 6,
                  }}>
                    {c.planetSign} {Number(c.planetDegree).toFixed(1)}° conjunct {c.star} in {c.starSign}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* All stars reference */}
      <div>
        <div style={S.sectionTitle}>Fixed Stars Reference ({FIXED_STARS.length})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {FIXED_STARS.map((star, i) => {
            const nc = NATURE_COLORS[star.nature] || '#c9a84c'
            const isActive = conjunctions.some(c => c.star === star.name)
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
                borderRadius: 8,
                background: isActive ? 'rgba(201,168,76,.06)' : 'rgba(255,255,255,.01)',
                border: `1px solid ${isActive ? 'rgba(201,168,76,.18)' : 'rgba(255,255,255,.04)'}`,
              }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 12, color: nc,
                  minWidth: 120, letterSpacing: '.06em',
                }}>
                  {isActive && '✦ '}{star.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', flex: 1 }}>
                  {star.sign} {star.lon}° · {star.nature}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontStyle: 'italic', maxWidth: 160, textAlign: 'right' }}>
                  {star.keywords}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Interpretation */}
      {conjunctions.length > 0 && (
        <div>
          <div style={S.sectionTitle}>Reading</div>
          <div style={S.interpretation}>
            Your natal chart carries {conjunctions.length} fixed star
            conjunction{conjunctions.length > 1 ? 's' : ''},{' '}
            {exactCount > 0 ? `including ${exactCount} exact alignment${exactCount > 1 ? 's' : ''} under 0.5°. ` : ''}
            The brightest influence is{' '}
            <span style={{ color: NATURE_COLORS[conjunctions[0].nature] || 'var(--gold)' }}>
              {conjunctions[0].star}
            </span>{' '}
            conjunct your {conjunctions[0].planet.toUpperCase()} — bringing{' '}
            <em>{conjunctions[0].keywords?.toLowerCase()}</em>.{' '}
            {conjunctions[0].meaning}
          </div>
        </div>
      )}
    </div>
  )
}
