import { useMemo } from 'react'
import TransitWheel from '../canvas/TransitWheel'
import { useActiveProfile } from '../../hooks/useActiveProfile'
import { getNatalChart } from '../../engines/natalEngine'

const PLANET_ORDER = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto']
const PLANET_SYMS_T = { sun:'☉',moon:'☽',mercury:'☿',venus:'♀',mars:'♂',jupiter:'♃',saturn:'♄',uranus:'♅',neptune:'♆',pluto:'♇' }
const PLANET_SPEED = { sun:'Normal',moon:'Fast',mercury:'Normal',venus:'Normal',mars:'Normal',jupiter:'Slow',saturn:'Slow',uranus:'Very Slow',neptune:'Very Slow',pluto:'Very Slow' }
const ASPECT_DEFS_T = [
  { aspect: 'Conjunction', angle: 0, orb: 8, type: 'activating', col: '#f0c040' },
  { aspect: 'Sextile',     angle: 60, orb: 6, type: 'flowing',    col: '#50c8a0' },
  { aspect: 'Square',      angle: 90, orb: 8, type: 'challenging', col: '#ee4466' },
  { aspect: 'Trine',       angle: 120, orb: 8, type: 'flowing',   col: '#40ccdd' },
  { aspect: 'Opposition',  angle: 180, orb: 8, type: 'challenging',col: '#7890ee' },
]

function mod360(x) { return ((x % 360) + 360) % 360 }
function formatDeg2(deg) {
  const d = Math.floor(deg); const m = Math.round((deg - d) * 60)
  return `${d}\u00B0${String(m).padStart(2,'0')}\u2032`
}

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

function findAspect(transitLon, natalLon) {
  let diff = Math.abs(mod360(transitLon - natalLon))
  if (diff > 180) diff = 360 - diff
  for (const asp of ASPECT_DEFS_T) {
    const orb = Math.abs(diff - asp.angle)
    if (orb <= asp.orb) return { aspect: asp.aspect, orb, type: asp.type }
  }
  return null
}

/** Compute live transits against natal chart */
function useCurrentTransits() {
  const profile = useActiveProfile()
  return useMemo(() => {
    const dob = parseDOB(profile.dob)
    const tob = parseTOB(profile.tob)
    if (!dob) return []
    let natal
    try {
      natal = getNatalChart({
        day: dob.day, month: dob.month, year: dob.year,
        hour: tob.hour, minute: tob.minute,
        lat: profile.birthLat || 0,
        lon: profile.birthLon || 0,
        timezone: profile.birthTimezone ?? 0,
      })
    } catch { return [] }

    // Current time transits
    const now = new Date()
    let current
    try {
      current = getNatalChart({
        day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear(),
        hour: now.getUTCHours(), minute: now.getUTCMinutes(),
        lat: profile.birthLat || 0,
        lon: profile.birthLon || 0,
        timezone: 0,  // already UTC
      })
    } catch { return [] }

    const transits = []
    for (const key of PLANET_ORDER) {
      const tp = current.planets[key]
      if (!tp) continue
      const bestAsp = { aspect: '—', aspOrb: '—', aspType: 'neutral', natalPlanet: '' }
      let minOrb = 999

      // Check against all natal planets
      for (const [nKey, np] of Object.entries(natal.planets)) {
        const asp = findAspect(tp.lon, np.lon)
        if (asp && asp.orb < minOrb) {
          minOrb = asp.orb
          bestAsp.aspect = `${asp.aspect} Natal ${nKey.charAt(0).toUpperCase() + nKey.slice(1)}`
          bestAsp.aspOrb = formatDeg2(asp.orb)
          bestAsp.aspType = asp.type
        }
      }
      // Check against natal angles
      for (const [aKey, angle] of Object.entries(natal.angles)) {
        const asp = findAspect(tp.lon, angle.lon)
        if (asp && asp.orb < minOrb) {
          minOrb = asp.orb
          bestAsp.aspect = `${asp.aspect} ${aKey.toUpperCase()}`
          bestAsp.aspOrb = formatDeg2(asp.orb)
          bestAsp.aspType = asp.type
        }
      }

      transits.push({
        planet: key.charAt(0).toUpperCase() + key.slice(1),
        sym: PLANET_SYMS_T[key] || '?',
        sign: tp.sign,
        deg: formatDeg2(tp.degree),
        house: 0,  // simplified — not computing house for transits
        retro: tp.retrograde,
        speed: PLANET_SPEED[key] || 'Normal',
        aspect: bestAsp.aspect,
        aspOrb: bestAsp.aspOrb,
        aspType: bestAsp.aspType,
      })
    }
    return transits
  }, [profile.dob, profile.birthLat, profile.birthLon, profile.birthTimezone])
}

const CURRENT_TRANSITS = [
  { planet: 'Sun', sym: '\u2609', sign: 'Pisces', deg: '13\u00B047\'', house: 5, retro: false, speed: 'Normal', aspect: 'Trine Natal Moon', aspOrb: '2\u00B005\'', aspType: 'flowing' },
  { planet: 'Moon', sym: '\u263D', sign: 'Virgo', deg: '28\u00B012\'', house: 11, retro: false, speed: 'Fast', aspect: 'Opposition Natal Sun', aspOrb: '5\u00B006\'', aspType: 'challenging' },
  { planet: 'Mercury', sym: '\u263F', sign: 'Aquarius', deg: '7\u00B003\'', house: 4, retro: false, speed: 'Normal', aspect: 'Conjunct Natal Mars', aspOrb: '4\u00B046\'', aspType: 'activating' },
  { planet: 'Venus', sym: '\u2640', sign: 'Aries', deg: '2\u00B055\'', house: 6, retro: false, speed: 'Normal', aspect: 'Square Natal Mars', aspOrb: '0\u00B038\'', aspType: 'challenging' },
  { planet: 'Mars', sym: '\u2642', sign: 'Cancer', deg: '21\u00B018\'', house: 9, retro: false, speed: 'Normal', aspect: 'Conjunct IC', aspOrb: '1\u00B056\'', aspType: 'activating' },
  { planet: 'Jupiter', sym: '\u2643', sign: 'Gemini', deg: '14\u00B044\'', house: 8, retro: false, speed: 'Normal', aspect: 'Trine Natal Jupiter', aspOrb: '6\u00B004\'', aspType: 'flowing' },
  { planet: 'Saturn', sym: '\u2644', sign: 'Pisces', deg: '29\u00B058\'', house: 5, retro: false, speed: 'Slow', aspect: 'Quincunx Natal Jupiter', aspOrb: '0\u00B050\'', aspType: 'adjusting' },
  { planet: 'Uranus', sym: '\u2645', sign: 'Taurus', deg: '24\u00B011\'', house: 7, retro: false, speed: 'Slow', aspect: 'Stationary Direct', aspOrb: '\u2014', aspType: 'activating' },
  { planet: 'Neptune', sym: '\u2646', sign: 'Aries', deg: '3\u00B022\'', house: 6, retro: false, speed: 'Slow', aspect: 'Square Natal Neptune', aspOrb: '0\u00B011\'', aspType: 'dissolving' },
  { planet: 'Pluto', sym: '\u2647', sign: 'Aquarius', deg: '5\u00B007\'', house: 4, retro: false, speed: 'Very Slow', aspect: 'Conjunct Natal Sun', aspOrb: '1\u00B049\'', aspType: 'transforming' },
]

const UPCOMING_ASPECTS = [
  { date: 'Mar 6', planet: 'Venus', aspect: 'Exact Square Mars', orb: '0\u00B000\'', type: 'challenging', desc: 'Tension between desire and action. Creative friction in relationships.' },
  { date: 'Mar 9', planet: 'Neptune', aspect: 'Exact Square Natal Neptune', orb: '0\u00B000\'', type: 'dissolving', desc: 'Neptune square itself -- dissolving old spiritual frameworks, heightened sensitivity.' },
  { date: 'Mar 12', planet: 'Mercury', aspect: 'Conjunct Natal Sun', orb: '0\u00B000\'', type: 'activating', desc: 'Mental clarity about identity and purpose. Important communications.' },
  { date: 'Mar 15', planet: 'Sun', aspect: 'Exact Trine Natal Moon', orb: '0\u00B000\'', type: 'flowing', desc: 'Emotional harmony and creative flow. Sense of inner alignment.' },
  { date: 'Mar 20', planet: 'Saturn', aspect: 'Ingress Aries', orb: '\u2014', type: 'activating', desc: 'Saturn enters Aries -- new 29-year cycle of structural initiation begins.' },
  { date: 'Mar 25', planet: 'Pluto', aspect: 'Closest Conjunct Natal Sun', orb: '1\u00B020\'', type: 'transforming', desc: 'Deepening transformation of identity. Power dynamics surface.' },
  { date: 'Apr 1', planet: 'Mars', aspect: 'Trine Natal Moon', orb: '0\u00B000\'', type: 'flowing', desc: 'Emotional courage and drive. Passion aligned with feelings.' },
]

const MOON_PHASES = [
  { name: 'New Moon', date: 'Mar 10', sign: 'Pisces', desc: 'Seed intentions for spiritual renewal and creative vision' },
  { name: 'First Quarter', date: 'Mar 17', sign: 'Gemini', desc: 'Action and decision-making around communication projects' },
  { name: 'Full Moon', date: 'Mar 25', sign: 'Libra', desc: 'Illumination in relationships and partnership dynamics' },
  { name: 'Last Quarter', date: 'Apr 1', sign: 'Capricorn', desc: 'Release of outdated structures, practical completion' },
]

const ECLIPSES = [
  { date: 'Aug 12, 2026', type: 'Partial Solar', sign: 'Leo 19\u00B034\'', icon: '\uD83C\uDF11', color: '#f0c040',
    natalAspect: 'Conjunct Natal 12th House cusp',
    desc: 'Solar eclipse in your 12th house activates subconscious patterns. Powerful for releasing hidden fears and spiritual breakthroughs. Pluto sextile from Aquarius amplifies transformative potential.' },
  { date: 'Aug 28, 2026', type: 'Total Lunar', sign: 'Pisces 4\u00B051\'', icon: '\uD83C\uDF15', color: '#d43070',
    natalAspect: 'Conjunct natal 6th/7th cusp \u00B7 Square Natal Sun',
    desc: 'Total lunar eclipse illuminates health and relationship axis. Your Sun at 3\u00B0 Aquarius receives a tight square. Emotional revelations about daily routines and partnerships.' },
  { date: 'Feb 6, 2027', type: 'Annular Solar', sign: 'Aquarius 17\u00B022\'', icon: '\uD83C\uDF11', color: '#40ccdd',
    natalAspect: 'Conjunct Natal Mercury-Mars conjunction',
    desc: 'Eclipse directly on your natal Mercury-Mars conjunction at 19\u00B0 Aquarius. Major activation of your communication and action axis. New ideas and initiatives seeded here will have lasting impact.' },
  { date: 'Feb 21, 2027', type: 'Penumbral Lunar', sign: 'Virgo 2\u00B044\'', icon: '\uD83C\uDF15', color: '#aabb88',
    natalAspect: 'Near Natal Moon \u00B7 Conjunct Ascendant',
    desc: 'Lunar eclipse near your Ascendant illuminates how others perceive you. Emotional processing around identity and self-presentation. Your natal Moon at 18\u00B0 Virgo is activated.' },
]

const MAJOR_EVENTS = [
  { date: 'Mar 20, 2026', planet: '\u2644', planetName: 'Saturn', event: 'Ingress Aries', color: '#aabb88', type: 'ingress',
    desc: 'Saturn enters Aries beginning a new 29-year cycle. For you, this shifts structural energy from your 7th house (partnerships) to your 8th house (shared resources, transformation). A new era of disciplined self-initiation.' },
  { date: 'Apr 12, 2026', planet: '\u2643', planetName: 'Jupiter', event: 'Conjunct North Node in Cancer', color: '#f0c040', type: 'conjunction',
    desc: 'Jupiter meets the North Node in your 11th house. Expansion through community, group endeavors, and aligned friendships. This is a once-in-12-year alignment of growth with collective destiny.' },
  { date: 'May 18, 2026', planet: '\u2646', planetName: 'Neptune', event: 'Ingress Aries', color: '#6699ee', type: 'ingress',
    desc: 'Neptune enters Aries for the first time since 1874. A 165-year cycle reset for collective dreams, spirituality, and imagination. For you, Neptune moves into your 8th house \u2014 dissolving boundaries around intimacy, shared finances, and psychological depth.' },
  { date: 'Jun 29, 2026', planet: '\u2643', planetName: 'Jupiter', event: 'Ingress Leo', color: '#f0c040', type: 'ingress',
    desc: 'Jupiter enters Leo and your natal 12th house. A 12-month period of spiritual expansion, inner growth, and preparation. Hidden blessings and behind-the-scenes support emerge. Dreams become vivid and prophetic.' },
  { date: 'Aug 24, 2026', planet: '\u2644 \u260C \u2646', planetName: 'Saturn-Neptune', event: 'Conjunction at 0\u00B0 Aries', color: '#9050e0', type: 'conjunction',
    desc: 'The Saturn-Neptune conjunction at the Aries point is the most significant transit of the decade. A 36-year cycle reset merging structure with vision, reality with dreams. In your 8th house: transformation of your relationship to the unseen, death-rebirth themes, financial restructuring.' },
  { date: 'Nov 5, 2026', planet: '\u2645', planetName: 'Uranus', event: 'Ingress Gemini', color: '#88ddcc', type: 'ingress',
    desc: 'Uranus enters Gemini and your natal 10th house. A 7-year revolution in career, public image, and life direction. Expect sudden changes in professional trajectory, innovative approaches to vocation, and liberation from outdated career structures.' },
  { date: 'Jan 18, 2027', planet: '\u2647', planetName: 'Pluto', event: 'Exact Conjunct Natal Sun', color: '#9050e0', type: 'conjunction',
    desc: 'Pluto reaches exact conjunction with your natal Sun at 3\u00B057\' Aquarius. The most powerful transit of your lifetime \u2014 a complete metamorphosis of identity, ego, and personal power. Who you were dissolves; who you are becoming emerges.' },
  { date: 'Feb 14, 2027', planet: '\u2643 \u25B3 \u2647', planetName: 'Jupiter-Pluto', event: 'Grand Trine with Natal Sun (Leo-Aquarius-Libra)', color: '#f0c040', type: 'pattern',
    desc: 'Jupiter in Leo trines Pluto in Aquarius and your natal Jupiter-Saturn conjunction in Libra. A rare grand fire/air trine bringing expansion, power, and structural growth. Opportunities for leadership and amplified personal influence.' },
]

const MOON_GLYPHS = {
  'New Moon': '\uD83C\uDF11',
  'First Quarter': '\uD83C\uDF13',
  'Full Moon': '\uD83C\uDF15',
  'Last Quarter': '\uD83C\uDF17',
}

const ASP_COLORS = {
  flowing: { color: '#40ccdd', bg: 'rgba(64,204,221,.08)', border: 'rgba(64,204,221,.2)' },
  challenging: { color: '#ee4466', bg: 'rgba(238,68,102,.08)', border: 'rgba(238,68,102,.2)' },
  activating: { color: '#f0c040', bg: 'rgba(240,192,64,.08)', border: 'rgba(240,192,64,.2)' },
  adjusting: { color: '#aabb88', bg: 'rgba(170,187,136,.08)', border: 'rgba(170,187,136,.2)' },
  dissolving: { color: '#6699ee', bg: 'rgba(102,153,238,.08)', border: 'rgba(102,153,238,.2)' },
  transforming: { color: '#9050e0', bg: 'rgba(144,80,224,.08)', border: 'rgba(144,80,224,.2)' },
}

const SPEED_COLORS = {
  Fast: '#40ccdd',
  Normal: 'var(--muted-foreground)',
  Slow: '#f0c040',
  'Very Slow': '#d43070',
}

/* ---- shared styles ---- */
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
  subHeading: {
    fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, letterSpacing: '.15em',
    textTransform: 'uppercase', color: 'var(--foreground)', marginBottom: 8,
  },
  mono: {
    fontFamily: "'Inconsolata', monospace", fontSize: 12, fontWeight: 500, color: 'var(--foreground)',
  },
  monoSm: {
    fontFamily: "'Inconsolata', monospace", fontSize: 11, color: 'var(--muted-foreground)',
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
    borderRadius: 8, background: 'var(--secondary)',
    border: '1px solid var(--border)', transition: 'background .2s',
  },
  glass: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 13, padding: 18, backdropFilter: 'blur(12px)',
  },
  badge: (bg, border, color) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: 12,
    fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.1em',
    textTransform: 'uppercase', background: bg, border: `1px solid ${border}`, color,
  }),
  interpretation: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--muted-foreground)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'var(--accent)', border: '1px solid var(--border)',
  },
}

export default function TransitsDetail() {
  const profile = useActiveProfile()
  const liveTransits = useCurrentTransits()
  // Only fall back to static if we have a profile (static data is Gaston's)
  const hasDob = !!(profile?.dob)
  const CURRENT_TRANSITS_LIVE = liveTransits.length > 0 ? liveTransits : (hasDob ? CURRENT_TRANSITS : [])
  const isEmptyState = !hasDob && liveTransits.length === 0

  if (isEmptyState) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', flexDirection:'column', gap:12, opacity:.5 }}>
      <div style={{ fontSize:40 }}>☽</div>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--gold)' }}>Add birth date to see transits</div>
      <div style={{ fontSize:11, color:'var(--muted-foreground)' }}>Transit calculations require your natal chart</div>
    </div>
  )

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>{'\u263F'} Planetary Transits</div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          March 4, 2026 -- Current sky positions, natal aspects, and upcoming alignments
        </div>
      </div>

      {/* TRANSIT WHEEL OVERLAY */}
      <div>
        <div style={S.sectionTitle}>Transit Wheel Overlay</div>
        <div style={{
          ...S.glass, padding: 0, overflow: 'hidden',
          height: 460, position: 'relative',
        }}>
          <TransitWheel />
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--ring)', fontFamily: "'Cinzel',serif" }}>
            {'\u25CF'} Inner Ring: Natal
          </span>
          <span style={{ fontSize: 10, color: 'rgba(64,204,221,.5)', fontFamily: "'Cinzel',serif" }}>
            {'\u25CF'} Outer Ring: Transits
          </span>
          <span style={{ fontSize: 10, color: 'rgba(144,80,224,.4)', fontFamily: "'Cinzel',serif" }}>
            --- Aspect Lines
          </span>
        </div>
      </div>

      {/* CURRENT POSITIONS */}
      <div>
        <div style={S.sectionTitle}>Current Planetary Positions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {/* header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '30px 80px 80px 60px 50px 50px 60px 1fr',
            gap: 8, padding: '4px 12px',
          }}>
            {['', 'PLANET', 'SIGN', 'DEGREE', 'HOUSE', 'SPEED', 'STATUS', 'NATAL ASPECT'].map((h, i) => (
              <span key={i} style={{ fontFamily: "'Inconsolata', monospace", fontSize: 9, color: 'var(--muted-foreground)' }}>{h}</span>
            ))}
          </div>
          {CURRENT_TRANSITS_LIVE.map((t, i) => {
            const ac = ASP_COLORS[t.aspType] || ASP_COLORS.activating
            return (
              <div key={i} style={{
                ...S.row,
                display: 'grid', gridTemplateColumns: '30px 80px 80px 60px 50px 50px 60px 1fr',
                gap: 8, borderLeftColor: ac.color, borderLeftWidth: 2,
              }}>
                <span style={{ fontSize: 18, textAlign: 'center', color: ac.color }}>{t.sym}</span>
                <span style={{ ...S.mono, color: 'var(--foreground)' }}>{t.planet}</span>
                <span style={{ ...S.mono, color: 'var(--foreground)' }}>{t.sign}</span>
                <span style={S.monoSm}>{t.deg}</span>
                <span style={{ ...S.monoSm, textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(201,168,76,.06)', border: '1px solid var(--accent)',
                    fontFamily: "'Cinzel', serif", fontSize: 10, color: 'var(--foreground)',
                  }}>{t.house}</span>
                </span>
                <span style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 9,
                  color: SPEED_COLORS[t.speed] || 'var(--muted-foreground)',
                }}>{t.speed}</span>
                <span style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 9,
                  color: t.retro ? 'var(--rose)' : 'var(--muted-foreground)',
                }}>
                  {t.retro ? '\u211E Rx' : 'Direct'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <span style={S.badge(ac.bg, ac.border, ac.color)}>
                    {t.aspType}
                  </span>
                  <span style={{ ...S.monoSm, fontSize: 10, color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.aspect}
                  </span>
                  {t.aspOrb !== '\u2014' && (
                    <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--muted-foreground)', flexShrink: 0 }}>
                      {t.aspOrb}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* RETROGRADE STATUS */}
      <div>
        <div style={S.sectionTitle}>Retrograde Status</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CURRENT_TRANSITS_LIVE.map((t, i) => {
            const isRetro = t.retro
            const isStation = t.aspect.includes('Stationary')
            return (
              <div key={i} style={{
                ...S.glass, padding: '10px 14px', minWidth: 90,
                textAlign: 'center',
                borderColor: isRetro ? 'rgba(212,48,112,.2)' : isStation ? 'rgba(240,192,64,.2)' : 'var(--border)',
                background: isRetro ? 'rgba(212,48,112,.04)' : isStation ? 'rgba(240,192,64,.04)' : 'rgba(5,5,26,.5)',
              }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: isRetro ? 'var(--rose)' : isStation ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                  {t.sym}
                </div>
                <div style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 10,
                  color: isRetro ? 'var(--rose2)' : isStation ? 'var(--foreground)' : 'var(--muted-foreground)',
                }}>
                  {isRetro ? '\u211E Retro' : isStation ? 'Station' : 'Direct'}
                </div>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 7, letterSpacing: '.1em',
                  color: 'var(--muted-foreground)', marginTop: 2, textTransform: 'uppercase',
                }}>{t.planet}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* MOON PHASES */}
      <div>
        <div style={S.sectionTitle}>Lunar Cycle -- March / April 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {MOON_PHASES.map((m, i) => {
            const isCurrent = i === 0
            return (
              <div key={i} style={{
                ...S.glass, textAlign: 'center', padding: '18px 14px',
                borderColor: isCurrent ? 'rgba(170,170,200,.25)' : 'var(--accent)',
                background: isCurrent ? 'rgba(170,170,200,.04)' : 'rgba(5,5,26,.7)',
              }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>{MOON_GLYPHS[m.name]}</div>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.1em',
                  color: 'var(--muted-foreground)', marginBottom: 4,
                }}>{m.name}</div>
                <div style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 11,
                  color: 'var(--muted-foreground)', marginBottom: 4,
                }}>{m.date} -- {m.sign}</div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  {m.desc}
                </div>
                {isCurrent && (
                  <span style={{
                    ...S.badge('rgba(170,170,200,.1)', 'rgba(170,170,200,.25)', 'var(--muted-foreground)'),
                    marginTop: 8,
                  }}>Upcoming</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* UPCOMING ASPECTS */}
      <div>
        <div style={S.sectionTitle}>Upcoming Exact Aspects (Next 30 Days)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {UPCOMING_ASPECTS.map((a, i) => {
            const ac = ASP_COLORS[a.type] || ASP_COLORS.activating
            return (
              <div key={i} style={{
                ...S.row, flexDirection: 'column', alignItems: 'stretch', gap: 6,
                padding: '10px 14px', borderLeftColor: ac.color, borderLeftWidth: 2,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    fontFamily: "'Inconsolata', monospace", fontSize: 12,
                    color: 'var(--foreground)', minWidth: 50, flexShrink: 0,
                  }}>{a.date}</span>
                  <span style={{ ...S.mono, color: 'var(--foreground)', minWidth: 60 }}>{a.planet}</span>
                  <span style={{ ...S.mono, color: 'var(--foreground)', flex: 1 }}>{a.aspect}</span>
                  <span style={S.badge(ac.bg, ac.border, ac.color)}>{a.type}</span>
                  {a.orb !== '\u2014' && (
                    <span style={{ ...S.monoSm, color: 'var(--muted-foreground)', fontSize: 10, flexShrink: 0 }}>{a.orb}</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4, paddingLeft: 62 }}>
                  {a.desc}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* DAILY FORECAST */}
      <div>
        <div style={S.sectionTitle}>Daily Energy Forecast -- March 4, 2026</div>
        <div style={S.interpretation}>
          <span style={{ color: 'var(--foreground)' }}>High-intensity transformative day.</span>{' '}
          Transiting <span style={{ color: '#9050e0' }}>Pluto conjunct your natal Sun</span> (1{'\u00B0'}49' orb)
          continues its multi-month passage, fundamentally reshaping your sense of identity and personal power.
          Today the <span style={{ color: '#40ccdd' }}>Sun trining your natal Moon</span> provides emotional
          ease that helps you integrate these deep changes with grace rather than resistance.
          <br /><br />
          <span style={{ color: '#ee4466' }}>Venus square natal Mars</span> (0{'\u00B0'}38' -- nearly exact)
          creates friction in desires and relationships. Creative tension may arise between what you want
          and what you are willing to fight for. Channel this energy into artistic or physical expression
          rather than interpersonal conflict.
          <br /><br />
          <span style={{ color: '#6699ee' }}>Neptune squaring itself</span> (0{'\u00B0'}11') -- an
          exceptionally rare generational transit -- dissolves old spiritual certainties. The fog is
          temporary; what emerges will be a more authentic relationship with the numinous. Saturn at
          29{'\u00B0'} Pisces is in its final degree before entering Aries on March 20 -- a{' '}
          <span style={{ color: '#f0c040' }}>critical completion point</span> for Piscean lessons
          of surrender, compassion, and letting go. The new Saturn cycle beginning in Aries will
          demand initiative and courage in entirely new structures.
        </div>
      </div>

      {/* UPCOMING ECLIPSES */}
      <div>
        <div style={S.sectionTitle}>{'\uD83C\uDF11'} Upcoming Eclipses (Next 12 Months)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ECLIPSES.map((e, i) => (
            <div key={i} style={{
              ...S.glass, display: 'flex', gap: 16, alignItems: 'flex-start',
              borderColor: e.color + '33', borderLeftWidth: 3, borderLeftColor: e.color,
            }}>
              <div style={{ textAlign: 'center', minWidth: 60, flexShrink: 0 }}>
                <div style={{ fontSize: 28 }}>{e.icon}</div>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.1em',
                  color: e.color, marginTop: 4, textTransform: 'uppercase',
                }}>{e.type}</div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: "'Inconsolata', monospace", fontSize: 13, fontWeight: 600,
                    color: e.color,
                  }}>{e.date}</span>
                  <span style={{ ...S.mono, color: 'var(--foreground)' }}>{e.sign}</span>
                  <span style={S.badge(e.color + '15', e.color + '30', e.color)}>
                    {e.type}
                  </span>
                </div>
                <div style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 10,
                  color: 'var(--foreground)', background: 'var(--secondary)',
                  padding: '3px 8px', borderRadius: 6, display: 'inline-block',
                  border: '1px solid var(--accent)',
                }}>
                  Natal: {e.natalAspect}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.5 }}>
                  {e.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAJOR CONJUNCTIONS & INGRESSES */}
      <div>
        <div style={S.sectionTitle}>{'\u2726'} Major Conjunctions &amp; Ingresses (Next 12 Months)</div>
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute', left: 10, top: 8, bottom: 8, width: 2,
            background: 'linear-gradient(180deg, rgba(201,168,76,.3), rgba(144,80,224,.3), rgba(64,204,221,.2))',
            borderRadius: 1,
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {MAJOR_EVENTS.map((ev, i) => {
              const typeLabel = ev.type === 'ingress' ? 'Ingress' : ev.type === 'conjunction' ? 'Conjunction' : 'Pattern'
              const typeBg = ev.type === 'ingress' ? 'rgba(136,221,204,.08)' : ev.type === 'conjunction' ? 'rgba(240,192,64,.08)' : 'rgba(144,80,224,.08)'
              const typeBorder = ev.type === 'ingress' ? 'rgba(136,221,204,.2)' : ev.type === 'conjunction' ? 'rgba(240,192,64,.2)' : 'rgba(144,80,224,.2)'
              return (
                <div key={i} style={{ position: 'relative' }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute', left: -22, top: 12, width: 10, height: 10,
                    borderRadius: '50%', background: ev.color, border: '2px solid var(--background)',
                    boxShadow: `0 0 8px ${ev.color}44`,
                  }} />
                  <div style={{
                    ...S.glass, padding: '14px 18px',
                    borderColor: ev.color + '25',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 18 }}>{ev.planet}</span>
                      <span style={{
                        fontFamily: "'Inconsolata', monospace", fontSize: 12, fontWeight: 600,
                        color: ev.color,
                      }}>{ev.date}</span>
                      <span style={{
                        fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.08em',
                        color: 'var(--foreground)',
                      }}>{ev.planetName}</span>
                      <span style={{ ...S.mono, color: 'var(--foreground)' }}>{ev.event}</span>
                      <span style={S.badge(typeBg, typeBorder, ev.color)}>{typeLabel}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.6 }}>
                      {ev.desc}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 12-MONTH OVERVIEW */}
      <div>
        <div style={S.sectionTitle}>12-Month Transit Intensity Overview</div>
        <div style={{ ...S.glass, padding: '20px 18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 4, marginBottom: 12 }}>
            {[
              { m: 'Mar', i: 85 }, { m: 'Apr', i: 55 }, { m: 'May', i: 72 },
              { m: 'Jun', i: 48 }, { m: 'Jul', i: 40 }, { m: 'Aug', i: 92 },
              { m: 'Sep', i: 62 }, { m: 'Oct', i: 45 }, { m: 'Nov', i: 78 },
              { m: 'Dec', i: 50 }, { m: 'Jan', i: 95 }, { m: 'Feb', i: 88 },
            ].map((bar, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{
                  height: 80, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                  marginBottom: 4,
                }}>
                  <div style={{
                    width: '100%', maxWidth: 24, height: `${bar.i}%`,
                    borderRadius: '4px 4px 0 0',
                    background: bar.i > 80
                      ? 'linear-gradient(180deg, #d43070, #9050e0)'
                      : bar.i > 60
                        ? 'linear-gradient(180deg, #f0c040, #ee8866)'
                        : 'linear-gradient(180deg, rgba(64,204,221,.4), rgba(64,204,221,.2))',
                    transition: 'height .3s ease',
                  }} />
                </div>
                <div style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 9,
                  color: bar.i > 80 ? 'var(--rose2)' : bar.i > 60 ? 'var(--foreground)' : 'var(--muted-foreground)',
                }}>{bar.m}</div>
                <div style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 8,
                  color: 'var(--muted-foreground)',
                }}>{bar.i}%</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.5, textAlign: 'center' }}>
            Intensity based on: number of exact aspects to natal chart, eclipse activations, and outer planet ingresses.{' '}
            <span style={{ color: 'var(--rose2)' }}>January 2027</span> peaks with Pluto exact conjunct natal Sun +
            eclipse on Mercury-Mars.
          </div>
        </div>
      </div>
    </div>
  )
}
