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
  Normal: 'var(--text2)',
  Slow: '#f0c040',
  'Very Slow': '#d43070',
}

/* ---- shared styles ---- */
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
  interpretation: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--text2)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'rgba(201,168,76,.03)', border: '1px solid rgba(201,168,76,.06)',
  },
}

export default function TransitsDetail() {
  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>{'\u263F'} Planetary Transits</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>
          March 4, 2026 -- Current sky positions, natal aspects, and upcoming alignments
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
              <span key={i} style={{ fontFamily: "'Inconsolata', monospace", fontSize: 9, color: 'var(--text3)' }}>{h}</span>
            ))}
          </div>
          {CURRENT_TRANSITS.map((t, i) => {
            const ac = ASP_COLORS[t.aspType] || ASP_COLORS.activating
            return (
              <div key={i} style={{
                ...S.row,
                display: 'grid', gridTemplateColumns: '30px 80px 80px 60px 50px 50px 60px 1fr',
                gap: 8, borderLeftColor: ac.color, borderLeftWidth: 2,
              }}>
                <span style={{ fontSize: 18, textAlign: 'center', color: ac.color }}>{t.sym}</span>
                <span style={{ ...S.mono, color: 'var(--gold2)' }}>{t.planet}</span>
                <span style={{ ...S.mono, color: 'var(--text)' }}>{t.sign}</span>
                <span style={S.monoSm}>{t.deg}</span>
                <span style={{ ...S.monoSm, textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.12)',
                    fontFamily: "'Cinzel', serif", fontSize: 10, color: 'var(--gold)',
                  }}>{t.house}</span>
                </span>
                <span style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 9,
                  color: SPEED_COLORS[t.speed] || 'var(--text3)',
                }}>{t.speed}</span>
                <span style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 9,
                  color: t.retro ? 'var(--rose)' : 'var(--text3)',
                }}>
                  {t.retro ? '\u211E Rx' : 'Direct'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <span style={S.badge(ac.bg, ac.border, ac.color)}>
                    {t.aspType}
                  </span>
                  <span style={{ ...S.monoSm, fontSize: 10, color: 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.aspect}
                  </span>
                  {t.aspOrb !== '\u2014' && (
                    <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)', flexShrink: 0 }}>
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
          {CURRENT_TRANSITS.map((t, i) => {
            const isRetro = t.retro
            const isStation = t.aspect.includes('Stationary')
            return (
              <div key={i} style={{
                ...S.glass, padding: '10px 14px', minWidth: 90,
                textAlign: 'center',
                borderColor: isRetro ? 'rgba(212,48,112,.2)' : isStation ? 'rgba(240,192,64,.2)' : 'rgba(255,255,255,.06)',
                background: isRetro ? 'rgba(212,48,112,.04)' : isStation ? 'rgba(240,192,64,.04)' : 'rgba(5,5,26,.5)',
              }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: isRetro ? 'var(--rose)' : isStation ? 'var(--gold)' : 'var(--text3)' }}>
                  {t.sym}
                </div>
                <div style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 10,
                  color: isRetro ? 'var(--rose2)' : isStation ? 'var(--gold2)' : 'var(--text3)',
                }}>
                  {isRetro ? '\u211E Retro' : isStation ? 'Station' : 'Direct'}
                </div>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 7, letterSpacing: '.1em',
                  color: 'var(--text3)', marginTop: 2, textTransform: 'uppercase',
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
                borderColor: isCurrent ? 'rgba(170,170,200,.25)' : 'rgba(201,168,76,.1)',
                background: isCurrent ? 'rgba(170,170,200,.04)' : 'rgba(5,5,26,.7)',
              }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>{MOON_GLYPHS[m.name]}</div>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.1em',
                  color: 'var(--silver2)', marginBottom: 4,
                }}>{m.name}</div>
                <div style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 11,
                  color: 'var(--text3)', marginBottom: 4,
                }}>{m.date} -- {m.sign}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  {m.desc}
                </div>
                {isCurrent && (
                  <span style={{
                    ...S.badge('rgba(170,170,200,.1)', 'rgba(170,170,200,.25)', 'var(--silver2)'),
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
                    color: 'var(--gold)', minWidth: 50, flexShrink: 0,
                  }}>{a.date}</span>
                  <span style={{ ...S.mono, color: 'var(--gold2)', minWidth: 60 }}>{a.planet}</span>
                  <span style={{ ...S.mono, color: 'var(--text)', flex: 1 }}>{a.aspect}</span>
                  <span style={S.badge(ac.bg, ac.border, ac.color)}>{a.type}</span>
                  {a.orb !== '\u2014' && (
                    <span style={{ ...S.monoSm, color: 'var(--text3)', fontSize: 10, flexShrink: 0 }}>{a.orb}</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.4, paddingLeft: 62 }}>
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
          <span style={{ color: 'var(--gold)' }}>High-intensity transformative day.</span>{' '}
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
    </div>
  )
}
