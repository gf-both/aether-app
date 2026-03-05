const PLANETS = [
  { name: 'Sun', sym: '\u2609', sign: 'Aquarius', deg: '3\u00B018\'', house: 4, retro: false },
  { name: 'Moon', sym: '\u263D', sign: 'Scorpio', deg: '18\u00B042\'', house: 1, retro: false },
  { name: 'Mercury', sym: '\u263F', sign: 'Capricorn', deg: '28\u00B055\'', house: 4, retro: false },
  { name: 'Venus', sym: '\u2640', sign: 'Pisces', deg: '11\u00B003\'', house: 5, retro: false },
  { name: 'Mars', sym: '\u2642', sign: 'Aquarius', deg: '22\u00B017\'', house: 4, retro: false },
  { name: 'Jupiter', sym: '\u2643', sign: 'Libra', deg: '0\u00B048\'', house: 12, retro: true },
  { name: 'Saturn', sym: '\u2644', sign: 'Libra', deg: '9\u00B028\'', house: 12, retro: true },
  { name: 'Uranus', sym: '\u2645', sign: 'Scorpio', deg: '29\u00B033\'', house: 2, retro: false },
  { name: 'Neptune', sym: '\u2646', sign: 'Sagittarius', deg: '23\u00B011\'', house: 3, retro: false },
  { name: 'Pluto', sym: '\u2647', sign: 'Libra', deg: '24\u00B006\'', house: 1, retro: true },
  { name: 'Ascendant', sym: 'AC', sign: 'Libra', deg: '14\u00B022\'', house: 1, retro: false },
]

const HOUSES = [
  { num: 1, sign: 'Libra', deg: '14\u00B022\'' },
  { num: 2, sign: 'Scorpio', deg: '12\u00B048\'' },
  { num: 3, sign: 'Sagittarius', deg: '14\u00B005\'' },
  { num: 4, sign: 'Capricorn', deg: '18\u00B033\'' },
  { num: 5, sign: 'Aquarius', deg: '22\u00B010\'' },
  { num: 6, sign: 'Pisces', deg: '20\u00B044\'' },
  { num: 7, sign: 'Aries', deg: '14\u00B022\'' },
  { num: 8, sign: 'Taurus', deg: '12\u00B048\'' },
  { num: 9, sign: 'Gemini', deg: '14\u00B005\'' },
  { num: 10, sign: 'Cancer', deg: '18\u00B033\'' },
  { num: 11, sign: 'Leo', deg: '22\u00B010\'' },
  { num: 12, sign: 'Virgo', deg: '20\u00B044\'' },
]

const ASPECTS = [
  { p1: 'Sun', p2: 'Mars', type: 'Conjunction', symbol: '\u260C', orb: '1\u00B001\'', color: '#f0c040' },
  { p1: 'Sun', p2: 'Jupiter', type: 'Trine', symbol: '\u25B3', orb: '2\u00B030\'', color: '#40ccdd' },
  { p1: 'Moon', p2: 'Pluto', type: 'Conjunction', symbol: '\u260C', orb: '5\u00B024\'', color: '#f0c040' },
  { p1: 'Moon', p2: 'Uranus', type: 'Conjunction', symbol: '\u260C', orb: '10\u00B051\'', color: '#f0c040' },
  { p1: 'Venus', p2: 'Neptune', type: 'Square', symbol: '\u25A1', orb: '2\u00B008\'', color: '#ee4466' },
  { p1: 'Mars', p2: 'Saturn', type: 'Trine', symbol: '\u25B3', orb: '0\u00B011\'', color: '#40ccdd' },
  { p1: 'Jupiter', p2: 'Saturn', type: 'Conjunction', symbol: '\u260C', orb: '8\u00B040\'', color: '#f0c040' },
  { p1: 'Jupiter', p2: 'Pluto', type: 'Conjunction', symbol: '\u260C', orb: '6\u00B042\'', color: '#f0c040' },
  { p1: 'Saturn', p2: 'Pluto', type: 'Conjunction', symbol: '\u260C', orb: '14\u00B038\'', color: '#f0c040' },
  { p1: 'Neptune', p2: 'MC', type: 'Conjunction', symbol: '\u260C', orb: '3\u00B049\'', color: '#f0c040' },
]

const ELEMENTS = { Fire: 1, Earth: 1, Air: 6, Water: 3 }
const MODALITIES = { Cardinal: 4, Fixed: 4, Mutable: 3 }

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
    background: 'rgba(5,5,22,.97)', color: 'var(--text)',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.25em',
    textTransform: 'uppercase', color: 'var(--gold3)', paddingBottom: 8,
    borderBottom: '1px solid rgba(201,168,76,.1)', marginBottom: 4,
  },
  heading: {
    fontFamily: "'Cinzel', serif", fontSize: 18, letterSpacing: '.18em',
    color: 'var(--gold)', marginBottom: 4,
  },
  subHeading: {
    fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.15em',
    textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8,
  },
  mono: {
    fontFamily: "'Inconsolata', monospace", fontSize: 12, color: 'var(--text)',
  },
  monoSm: {
    fontFamily: "'Inconsolata', monospace", fontSize: 11, color: 'var(--text2)',
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
    borderRadius: 8, background: 'rgba(255,255,255,.02)',
    border: '1px solid rgba(255,255,255,.04)', transition: 'background .2s',
  },
  glass: {
    background: 'rgba(5,5,26,.7)', border: '1px solid rgba(201,168,76,.1)',
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
    background: 'rgba(201,168,76,.03)', border: '1px solid rgba(201,168,76,.06)',
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
          Full birth chart analysis — planets, houses, aspects, and elemental balance
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
                a.type === 'Square' ? 'rgba(238,68,102,.1)' : 'rgba(255,255,255,.05)',
                a.type === 'Conjunction' ? 'rgba(240,192,64,.25)' :
                a.type === 'Trine' ? 'rgba(64,204,221,.25)' :
                a.type === 'Square' ? 'rgba(238,68,102,.25)' : 'rgba(255,255,255,.1)',
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
                <div style={{ height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
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
                <div style={{ height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
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
          <span style={{ color: 'var(--gold)' }}>Aquarius Sun in the 4th House</span> with a{' '}
          <span style={{ color: '#4488ee' }}>Scorpio Moon rising</span> creates an individual
          who is intellectually progressive yet emotionally intense at the deepest levels.
          The stellium of Jupiter, Saturn, and Pluto in Libra across the 12th and 1st houses
          speaks to a generational soul carrying themes of relational transformation and hidden power.
          The tight <span style={{ color: '#40ccdd' }}>Mars-Saturn trine</span> (0{'\u00B0'}11' orb) provides
          exceptional discipline and strategic endurance, while the{' '}
          <span style={{ color: '#ee4466' }}>Venus-Neptune square</span> introduces a creative tension
          between idealized love and grounded connection. With 6 planets in Air signs, the mind is the
          primary vehicle of experience -- ideas, communication, and social architecture are natural
          domains of mastery. The dominant Air emphasis is balanced by the Scorpio Moon and Uranus in
          water, providing emotional depth beneath the intellectual surface.
        </div>
      </div>
    </div>
  )
}
