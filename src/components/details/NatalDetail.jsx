import NatalWheel from '../canvas/NatalWheel'

// Verified against Swiss Ephemeris (Kerykeion/pyswisseph) — Jan 23, 1981 22:10 Buenos Aires
const PLANETS = [
  { name: 'Sun', sym: '\u2609', sign: 'Aquarius', deg: '3\u00B057\'', house: 5, retro: false },
  { name: 'Moon', sym: '\u263D', sign: 'Virgo', deg: '18\u00B026\'', house: 1, retro: false },
  { name: 'Mercury', sym: '\u263F', sign: 'Aquarius', deg: '19\u00B001\'', house: 6, retro: false },
  { name: 'Venus', sym: '\u2640', sign: 'Capricorn', deg: '15\u00B058\'', house: 5, retro: false },
  { name: 'Mars', sym: '\u2642', sign: 'Aquarius', deg: '19\u00B000\'', house: 6, retro: false },
  { name: 'Jupiter', sym: '\u2643', sign: 'Libra', deg: '10\u00B023\'', house: 1, retro: false },
  { name: 'Saturn', sym: '\u2644', sign: 'Libra', deg: '9\u00B045\'', house: 1, retro: true },
  { name: 'Uranus', sym: '\u2645', sign: 'Scorpio', deg: '29\u00B023\'', house: 2, retro: false },
  { name: 'Neptune', sym: '\u2646', sign: 'Sagittarius', deg: '23\u00B049\'', house: 4, retro: false },
  { name: 'Pluto', sym: '\u2647', sign: 'Libra', deg: '24\u00B020\'', house: 1, retro: true },
  { name: 'Ascendant', sym: 'AC', sign: 'Virgo', deg: '18\u00B013\'', house: 1, retro: false },
  { name: 'Midheaven', sym: 'MC', sign: 'Gemini', deg: '23\u00B001\'', house: 10, retro: false },
]

// Placidus house cusps verified via Swiss Ephemeris
const HOUSES = [
  { num: 1, sign: 'Virgo', deg: '18\u00B013\'' },
  { num: 2, sign: 'Libra', deg: '29\u00B048\'' },
  { num: 3, sign: 'Scorpio', deg: '29\u00B026\'' },
  { num: 4, sign: 'Sagittarius', deg: '23\u00B001\'' },
  { num: 5, sign: 'Capricorn', deg: '15\u00B031\'' },
  { num: 6, sign: 'Aquarius', deg: '11\u00B040\'' },
  { num: 7, sign: 'Pisces', deg: '18\u00B013\'' },
  { num: 8, sign: 'Aries', deg: '29\u00B048\'' },
  { num: 9, sign: 'Taurus', deg: '29\u00B026\'' },
  { num: 10, sign: 'Gemini', deg: '23\u00B001\'' },
  { num: 11, sign: 'Cancer', deg: '15\u00B031\'' },
  { num: 12, sign: 'Leo', deg: '11\u00B040\'' },
]

const ASPECTS = [
  { p1: 'Mercury', p2: 'Mars', type: 'Conjunction', symbol: '\u260C', orb: '0\u00B001\'', color: '#f0c040' },
  { p1: 'Moon', p2: 'Ascendant', type: 'Conjunction', symbol: '\u260C', orb: '0\u00B013\'', color: '#f0c040' },
  { p1: 'Jupiter', p2: 'Saturn', type: 'Conjunction', symbol: '\u260C', orb: '0\u00B038\'', color: '#f0c040' },
  { p1: 'Neptune', p2: 'Pluto', type: 'Sextile', symbol: '\u26BA', orb: '0\u00B031\'', color: '#50c8a0' },
  { p1: 'Neptune', p2: 'MC', type: 'Opposition', symbol: '\u260D', orb: '0\u00B048\'', color: '#7890ee' },
  { p1: 'Venus', p2: 'Moon', type: 'Trine', symbol: '\u25B3', orb: '2\u00B028\'', color: '#40ccdd' },
  { p1: 'Sun', p2: 'Uranus', type: 'Sextile', symbol: '\u26BA', orb: '4\u00B034\'', color: '#50c8a0' },
  { p1: 'Venus', p2: 'Jupiter', type: 'Square', symbol: '\u25A1', orb: '5\u00B035\'', color: '#dd5555' },
  { p1: 'Venus', p2: 'Saturn', type: 'Square', symbol: '\u25A1', orb: '6\u00B013\'', color: '#dd5555' },
  { p1: 'Sun', p2: 'Jupiter', type: 'Trine', symbol: '\u25B3', orb: '6\u00B026\'', color: '#40ccdd' },
  { p1: 'Sun', p2: 'Saturn', type: 'Trine', symbol: '\u25B3', orb: '5\u00B048\'', color: '#40ccdd' },
]

const ELEMENTS = { Fire: 1, Earth: 2, Air: 6, Water: 1 }
const MODALITIES = { Cardinal: 4, Fixed: 4, Mutable: 2 }

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

const RISING_SIGN = {
  sign: 'Virgo',
  degree: '18\u00B013\'',
  ruler: 'Mercury',
  rulerSign: 'Aquarius',
  rulerHouse: 6,
  qualities: ['Analytical', 'Detail-oriented', 'Service-driven', 'Methodical', 'Discerning'],
  appearance: 'Reserved, intellectual demeanor with attentive eyes and precise mannerisms',
  firstImpression: 'Comes across as thoughtful, quietly competent, and observant before engaging',
  lifeApproach: 'Approaches life through analysis and refinement, seeking practical perfection and meaningful service',
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
  const totalEl = Object.values(ELEMENTS).reduce((a, b) => a + b, 0)
  const totalMod = Object.values(MODALITIES).reduce((a, b) => a + b, 0)

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
