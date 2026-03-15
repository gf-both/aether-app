import { useMemo } from 'react'
import NatalWheel from '../canvas/NatalWheel'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { getNatalChart } from '../../engines/natalEngine'

const PLANET_SYMS = {
  sun: '\u2609', moon: '\u263D', mercury: '\u263F', venus: '\u2640', mars: '\u2642',
  jupiter: '\u2643', saturn: '\u2644', uranus: '\u2645', neptune: '\u2646', pluto: '\u2647',
  northNode: '\u260A', chiron: '\u26B7',
}

const ASPECT_SYMBOLS = {
  conjunction: '\u260C', opposition: '\u260D', trine: '\u25B3', square: '\u25A1', sextile: '\u26BA',
}
const ASPECT_COLORS_MAP = {
  conjunction: '#f0c040', opposition: '#7890ee', trine: '#40ccdd', square: '#dd5555', sextile: '#50c8a0',
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

function useNatalChart() {
  const profile = useAboveInsideStore(s => s.primaryProfile)
  return useMemo(() => {
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
  }, [profile.dob, profile.tob, profile.birthLat, profile.birthLon, profile.birthTimezone])
}

/** Determine which house a planet longitude falls in */
function getHouseFor(lon, houses) {
  for (let i = 0; i < 12; i++) {
    const cuspStart = houses[i].lon
    const cuspEnd = houses[(i + 1) % 12].lon
    let within
    if (cuspStart <= cuspEnd) {
      within = lon >= cuspStart && lon < cuspEnd
    } else {
      // Wrap around 0/360
      within = lon >= cuspStart || lon < cuspEnd
    }
    if (within) return i + 1
  }
  return 1
}

function formatDeg(deg) {
  const d = Math.floor(deg)
  const m = Math.round((deg - d) * 60)
  return `${d}\u00B0${String(m).padStart(2,'0')}\u2032`
}

const ELEMENT_COLORS = {
  Fire: '#ee4444',
  Earth: '#60b030',
  Air: '#40ccdd',
  Water: '#4488ee',
}

const MODALITY_COLORS = {
  Cardinal: '#f0c040',
  Fixed: '#d43070',
  Mutable: '#9050e0',
}

const SIGN_ELEMENTS = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
}

/* ---- shared style fragments ---- */
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
  symbolLg: { fontSize: 22, minWidth: 28, textAlign: 'center' },
  interpretation: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--text2)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'var(--interp-bg)', border: '1px solid var(--interp-border)',
  },
  keyVal: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.04)',
  },
}

export default function NatalDetail() {
  const chart = useNatalChart()

  // Build dynamic PLANETS list from chart
  const PLANETS = useMemo(() => {
    if (!chart) return []
    const list = []
    const planetOrder = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto','northNode']
    for (const key of planetOrder) {
      const p = chart.planets[key]
      if (!p) continue
      list.push({
        name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        sym: PLANET_SYMS[key] || '?',
        sign: p.sign,
        deg: formatDeg(p.degree),
        house: getHouseFor(p.lon, chart.houses),
        retro: p.retrograde,
      })
    }
    // Add ASC and MC
    list.push({ name: 'Ascendant', sym: 'AC', sign: chart.angles.asc.sign, deg: formatDeg(chart.angles.asc.degree), house: 1, retro: false })
    list.push({ name: 'Midheaven', sym: 'MC', sign: chart.angles.mc.sign, deg: formatDeg(chart.angles.mc.degree), house: 10, retro: false })
    return list
  }, [chart])

  // Build dynamic HOUSES list from chart
  const HOUSES = useMemo(() => {
    if (!chart) return []
    return chart.houses.map(h => ({ num: h.house, sign: h.sign, deg: formatDeg(h.degree) }))
  }, [chart])

  // Build dynamic ASPECTS list from chart
  const ASPECTS = useMemo(() => {
    if (!chart) return []
    return chart.aspects.slice(0, 15).map(a => ({
      p1: a.planet1.charAt(0).toUpperCase() + a.planet1.slice(1).replace(/([A-Z])/g, ' $1'),
      p2: a.planet2.charAt(0).toUpperCase() + a.planet2.slice(1).replace(/([A-Z])/g, ' $1'),
      type: a.aspect.charAt(0).toUpperCase() + a.aspect.slice(1),
      symbol: ASPECT_SYMBOLS[a.aspect] || '\u25CB',
      orb: formatDeg(a.orb),
      color: ASPECT_COLORS_MAP[a.aspect] || '#aaaaaa',
    }))
  }, [chart])

  // Element/Modality balance from chart planets
  const { ELEMENTS, MODALITIES } = useMemo(() => {
    const elMap = { Fire: 0, Earth: 0, Air: 0, Water: 0 }
    const modMap = { Cardinal: 0, Fixed: 0, Mutable: 0 }
    const signEl = { Aries:'Fire',Leo:'Fire',Sagittarius:'Fire', Taurus:'Earth',Virgo:'Earth',Capricorn:'Earth', Gemini:'Air',Libra:'Air',Aquarius:'Air', Cancer:'Water',Scorpio:'Water',Pisces:'Water' }
    const signMod = { Aries:'Cardinal',Cancer:'Cardinal',Libra:'Cardinal',Capricorn:'Cardinal', Taurus:'Fixed',Leo:'Fixed',Scorpio:'Fixed',Aquarius:'Fixed', Gemini:'Mutable',Virgo:'Mutable',Sagittarius:'Mutable',Pisces:'Mutable' }
    if (chart) {
      for (const p of Object.values(chart.planets)) {
        if (signEl[p.sign]) elMap[signEl[p.sign]]++
        if (signMod[p.sign]) modMap[signMod[p.sign]]++
      }
    }
    return { ELEMENTS: elMap, MODALITIES: modMap }
  }, [chart])

  const totalEl = Object.values(ELEMENTS).reduce((a, b) => a + b, 0)
  const totalMod = Object.values(MODALITIES).reduce((a, b) => a + b, 0)

  const RISING_SIGN = useMemo(() => {
    if (!chart) return { sign: 'Virgo', degree: '18°13\'', ruler: 'Mercury', rulerSign: 'Aquarius', rulerHouse: 6 }
    const asc = chart.angles.asc
    return {
      sign: asc.sign,
      degree: formatDeg(asc.degree),
      ruler: 'Mercury',  // static for Virgo rising; could be computed dynamically
      rulerSign: chart.planets.mercury?.sign || 'Aquarius',
      rulerHouse: chart.planets.mercury ? getHouseFor(chart.planets.mercury.lon, chart.houses) : 6,
      qualities: ['Analytical', 'Detail-oriented', 'Service-driven', 'Methodical', 'Discerning'],
      appearance: 'Reserved, intellectual demeanor with attentive eyes and precise mannerisms',
      firstImpression: 'Comes across as thoughtful, quietly competent, and observant before engaging',
      lifeApproach: 'Approaches life through analysis and refinement, seeking practical perfection and meaningful service',
    }
  }, [chart])

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>{'\u2609'} Natal Astrology</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>
          Full birth chart analysis — planets, houses, aspects, rising sign, and elemental balance
        </div>
      </div>

      {/* INTERACTIVE CHART */}
      <div>
        <div style={S.sectionTitle}>Birth Chart Wheel</div>
        <div style={{
          ...S.glass, padding: 0, overflow: 'hidden',
          height: 460, position: 'relative',
        }}>
          <NatalWheel showAspects={true} showHouses={true} />
        </div>
      </div>

      {/* RISING SIGN / ASCENDANT */}
      <div>
        <div style={S.sectionTitle}>Rising Sign (Ascendant)</div>
        <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(96,176,48,.08)', border: '2px solid rgba(96,176,48,.3)',
              fontFamily: "'Cinzel', serif", fontSize: 28, color: '#60b030',
            }}>{'\u264D'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: 'var(--gold)', letterSpacing: '.1em' }}>
                {RISING_SIGN.sign} Rising
              </div>
              <div style={{ ...S.monoSm, color: 'var(--text3)', marginTop: 2 }}>
                {RISING_SIGN.degree} {'\u00B7'} Ruler: {RISING_SIGN.ruler} in {RISING_SIGN.rulerSign} (House {RISING_SIGN.rulerHouse})
              </div>
            </div>
          </div>
          {[
            ['First Impression', RISING_SIGN.firstImpression],
            ['Life Approach', RISING_SIGN.lifeApproach],
            ['Physical Impression', RISING_SIGN.appearance],
          ].map(([label, val], i) => (
            <div key={i} style={S.keyVal}>
              <span style={{
                fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em',
                textTransform: 'uppercase', color: 'var(--text3)', minWidth: 140,
              }}>{label}</span>
              <span style={{ ...S.mono, color: 'var(--gold2)', textAlign: 'right', maxWidth: '60%' }}>{val}</span>
            </div>
          ))}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            {RISING_SIGN.qualities.map((q, i) => (
              <span key={i} style={{
                padding: '3px 10px', borderRadius: 12, fontSize: 10,
                background: 'rgba(96,176,48,.08)', border: '1px solid rgba(96,176,48,.2)',
                color: '#60b030', fontFamily: "'Cinzel', serif", letterSpacing: '.06em',
              }}>{q}</span>
            ))}
          </div>
        </div>
      </div>

      {/* PLANETS TABLE */}
      <div>
        <div style={S.sectionTitle}>Planetary Placements</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '32px 100px 100px 70px 60px 60px', gap: 8, padding: '4px 12px' }}>
            <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)' }}></span>
            <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)' }}>PLANET</span>
            <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)' }}>SIGN</span>
            <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)' }}>DEGREE</span>
            <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)' }}>HOUSE</span>
            <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)' }}>STATUS</span>
          </div>
          {PLANETS.map((p, i) => {
            const elColor = SIGN_ELEMENTS[p.sign] ? ELEMENT_COLORS[SIGN_ELEMENTS[p.sign]] : 'var(--text2)'
            return (
              <div key={i} style={{
                ...S.row,
                display: 'grid', gridTemplateColumns: '32px 100px 100px 70px 60px 60px', gap: 8,
                animationDelay: `${i * 0.04}s`,
              }}>
                <span style={{ fontSize: 18, textAlign: 'center', color: elColor }}>{p.sym}</span>
                <span style={{ ...S.mono, color: 'var(--gold2)' }}>{p.name}</span>
                <span style={{ ...S.mono, color: elColor }}>{p.sign}</span>
                <span style={S.monoSm}>{p.deg}</span>
                <span style={{ ...S.monoSm, textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.12)',
                    fontFamily: "'Cinzel', serif", fontSize: 11, color: 'var(--gold)',
                  }}>{p.house}</span>
                </span>
                <span style={{ ...S.monoSm, fontSize: 10, textAlign: 'center' }}>
                  {p.retro
                    ? <span style={{ color: 'var(--rose)', fontWeight: 600 }}>{'\u211E'} Rx</span>
                    : <span style={{ color: 'var(--text3)' }}>Direct</span>
                  }
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* HOUSES */}
      <div>
        <div style={S.sectionTitle}>House Cusps</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {HOUSES.map((h, i) => (
            <div key={i} style={{
              ...S.glass, padding: '10px 14px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontFamily: "'Cinzel', serif", fontSize: 16, color: 'var(--gold)',
                  width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.15)',
                }}>{h.num}</span>
                <span style={{ ...S.mono, fontSize: 12, color: ELEMENT_COLORS[SIGN_ELEMENTS[h.sign]] || 'var(--text2)' }}>
                  {h.sign}
                </span>
              </div>
              <span style={{ ...S.monoSm, fontSize: 10, color: 'var(--text3)', textAlign: 'right' }}>{h.deg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ASPECTS TABLE */}
      <div>
        <div style={S.sectionTitle}>Major Aspects</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* header */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px 24px 100px 110px 70px', gap: 8, padding: '4px 12px' }}>
            <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)' }}>PLANET 1</span>
            <span></span>
            <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)' }}>PLANET 2</span>
            <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)' }}>ASPECT</span>
            <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)' }}>ORB</span>
          </div>
          {ASPECTS.map((a, i) => (
            <div key={i} style={{
              ...S.row,
              display: 'grid', gridTemplateColumns: '100px 24px 100px 110px 70px', gap: 8,
            }}>
              <span style={{ ...S.mono, color: 'var(--gold2)' }}>{a.p1}</span>
              <span style={{ fontSize: 16, textAlign: 'center', color: a.color }}>{a.symbol}</span>
              <span style={{ ...S.mono, color: 'var(--gold2)' }}>{a.p2}</span>
              <span style={S.badge(
                a.type === 'Conjunction' ? 'rgba(240,192,64,.1)' :
                a.type === 'Trine' ? 'rgba(64,204,221,.1)' :
                a.type === 'Sextile' ? 'rgba(80,200,160,.1)' :
                a.type === 'Square' ? 'rgba(238,68,102,.1)' :
                a.type === 'Opposition' ? 'rgba(120,144,238,.1)' : 'rgba(255,255,255,.05)',
                a.type === 'Conjunction' ? 'rgba(240,192,64,.25)' :
                a.type === 'Trine' ? 'rgba(64,204,221,.25)' :
                a.type === 'Sextile' ? 'rgba(80,200,160,.25)' :
                a.type === 'Square' ? 'rgba(238,68,102,.25)' :
                a.type === 'Opposition' ? 'rgba(120,144,238,.25)' : 'rgba(255,255,255,.1)',
                a.color,
              )}>{a.type}</span>
              <span style={{ ...S.monoSm, color: 'var(--text3)' }}>{a.orb}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ELEMENT / MODALITY BALANCE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Elements */}
        <div style={S.glass}>
          <div style={S.subHeading}>Element Balance</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(ELEMENTS).map(([el, count]) => (
              <div key={el} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...S.mono, color: ELEMENT_COLORS[el], fontSize: 13 }}>{el}</span>
                  <span style={{ ...S.monoSm, color: 'var(--text3)' }}>{count} / {totalEl}</span>
                </div>
                <div style={{ height: 6, background: 'var(--bar-track)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${(count / totalEl) * 100}%`,
                    background: ELEMENT_COLORS[el],
                    opacity: 0.7,
                    transition: 'width .6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modalities */}
        <div style={S.glass}>
          <div style={S.subHeading}>Modality Balance</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(MODALITIES).map(([mod, count]) => (
              <div key={mod} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...S.mono, color: MODALITY_COLORS[mod], fontSize: 13 }}>{mod}</span>
                  <span style={{ ...S.monoSm, color: 'var(--text3)' }}>{count} / {totalMod}</span>
                </div>
                <div style={{ height: 6, background: 'var(--bar-track)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${(count / totalMod) * 100}%`,
                    background: MODALITY_COLORS[mod],
                    opacity: 0.7,
                    transition: 'width .6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div>
        <div style={S.sectionTitle}>Chart Interpretation</div>
        <div style={S.interpretation}>
          <span style={{ color: 'var(--gold)' }}>Aquarius Sun in the 5th House</span> with a{' '}
          <span style={{ color: '#60b030' }}>Virgo Moon and Virgo Rising</span> creates an individual
          who is intellectually progressive yet emotionally grounded in practical analysis and service.
          The Moon conjunct the Ascendant (0{'\u00B0'}13' orb) means the emotional nature is immediately
          visible to the world {'\u2014'} you <em>are</em> your feelings in the eyes of others.
          The 1st house is heavily populated with{' '}
          <span style={{ color: '#f0c040' }}>Jupiter and Saturn conjunct in Libra</span> (0{'\u00B0'}38' orb),
          plus Pluto at 24{'\u00B0'} Libra {'\u2014'} themes of relational power, justice, and
          transformative partnerships define your public persona.
          The exact <span style={{ color: '#f0c040' }}>Mercury-Mars conjunction in Aquarius</span> (0{'\u00B0'}01' orb)
          in the 6th house gives sharp, incisive mental energy and rapid, decisive communication {'\u2014'}
          the mind acts with martial precision.{' '}
          <span style={{ color: '#40ccdd' }}>Venus in Capricorn trines the Moon</span> (2{'\u00B0'}28'),
          grounding romantic and aesthetic sensibility in practical emotional intelligence.
          With a dominant 6 planets in Air signs, the mind is the primary vehicle of experience {'\u2014'} ideas,
          communication, and social architecture are natural domains. Venus squaring the Jupiter-Saturn
          conjunction creates productive tension between personal values and relational ideals.
          Mercury ruling both your Sun sign and Rising ensures the mind is the integrating force
          of the entire chart.
        </div>
      </div>
    </div>
  )
}
