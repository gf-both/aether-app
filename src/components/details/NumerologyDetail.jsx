const CORE = {
  lifePath: { val: 5, title: 'The Adventurer', desc: 'Freedom, change, versatility, sensory experience' },
  expression: { val: 7, title: 'The Seeker', desc: 'Analysis, understanding, knowledge, awareness, studious' },
  soulUrge: { val: 3, title: 'The Communicator', desc: 'Self-expression, creativity, joy, artistic talent' },
  birthday: { val: 5, title: 'Adaptable', desc: 'Born on the 23rd \u2014 versatile, curious, progressive' },
  personality: { val: 9, title: 'The Humanitarian', desc: 'Compassion, global awareness, broad vision' },
  maturity: { val: 4, title: 'The Builder', desc: 'Structure, discipline, practical foundation' },
}

const EXTENDED = [
  { label: 'Hidden Passion', val: 5, desc: 'Number appearing most in name -- craves freedom and variety' },
  { label: 'Karmic Debt', val: 14, desc: 'Lesson of temperance -- overcoming excess and misuse of freedom' },
]

const MASTERS = [
  { val: 11, label: 'Master Intuitive', desc: 'Spiritual insight, intuition, illumination, nervous energy' },
  { val: 22, label: 'Master Builder', desc: 'Turning dreams into reality, large-scale vision, discipline' },
]

const PINNACLES = [
  { num: 6, label: 'Pinnacle I', ages: '0-31', desc: 'Responsibility, family, love, domestic harmony' },
  { num: 2, label: 'Pinnacle II', ages: '32-40', desc: 'Cooperation, patience, diplomacy, sensitivity' },
  { num: 8, label: 'Pinnacle III', ages: '41-49', desc: 'Material mastery, authority, power, achievement' },
  { num: 5, label: 'Pinnacle IV', ages: '50+', desc: 'Freedom returns \u2014 adventure, travel, reinvention' },
]

const CHALLENGES = [
  { num: 4, label: 'Challenge I', ages: '0-31' },
  { num: 1, label: 'Challenge II', ages: '32-40' },
  { num: 3, label: 'Challenge III', ages: '41-49' },
  { num: 1, label: 'Challenge IV', ages: '50+' },
]

const PERSONAL_YEAR = { val: 9, title: 'Completion', desc: 'Endings, release, humanitarian service, preparation for new cycle' }
const PERSONAL_MONTH = { val: 3, title: 'Expression', desc: 'Creativity, communication, social expansion, artistic output' }
const PERSONAL_DAY = { val: 7, title: 'Reflection', desc: 'Contemplation, inner work, spiritual study, solitude' }

const CORE_COLORS = {
  lifePath: '#f0c040',
  expression: '#40ccdd',
  soulUrge: '#d43070',
  birthday: '#f0c040',
  personality: '#9050e0',
  maturity: '#60b030',
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

function NumCircle({ val, color, size = 54, label, sub }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: color + '0c', border: `2px solid ${color}44`,
        fontFamily: "'Cinzel', serif", fontSize: size * 0.42,
        color, fontWeight: 600, position: 'relative',
      }}>
        {val}
        <div style={{
          position: 'absolute', inset: -3, borderRadius: '50%',
          border: `1px solid ${color}18`, pointerEvents: 'none',
        }} />
      </div>
      {label && (
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.12em',
          textTransform: 'uppercase', color: 'var(--text3)', textAlign: 'center',
        }}>{label}</div>
      )}
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'center', fontStyle: 'italic', maxWidth: 120 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

export default function NumerologyDetail() {
  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>{'\u221E'} Numerology</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>
          Core numbers, master numbers, pinnacles, challenges, and personal cycles
        </div>
      </div>

      {/* CORE NUMBERS */}
      <div>
        <div style={S.sectionTitle}>Core Numbers</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {Object.entries(CORE).map(([key, data]) => (
            <div key={key} style={{
              ...S.glass, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 10, padding: '20px 16px', textAlign: 'center',
            }}>
              <NumCircle val={data.val} color={CORE_COLORS[key]} size={60} />
              <div>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em',
                  textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 4,
                }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 13, letterSpacing: '.1em',
                  color: CORE_COLORS[key], marginBottom: 4,
                }}>{data.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  {data.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EXTENDED NUMBERS */}
      <div>
        <div style={S.sectionTitle}>Extended Numbers</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {EXTENDED.map((e, i) => (
            <div key={i} style={{
              ...S.glass, display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px',
            }}>
              <NumCircle val={e.val} color={i === 0 ? '#f0c040' : '#ee4466'} size={48} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.12em',
                  color: i === 0 ? 'var(--gold2)' : '#ee6688', marginBottom: 4,
                }}>{e.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  {e.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MASTER NUMBERS */}
      <div>
        <div style={S.sectionTitle}>Master Numbers</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {MASTERS.map((m, i) => (
            <div key={i} style={{
              ...S.glass,
              background: 'rgba(104,32,176,.05)', borderColor: 'rgba(144,80,224,.18)',
              display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px',
            }}>
              <NumCircle val={m.val} color='#9050e0' size={52} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.1em',
                  color: 'var(--violet2)', marginBottom: 4,
                }}>{m.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  {m.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 10, fontSize: 12, color: 'var(--text3)', fontStyle: 'italic',
          padding: '8px 12px', background: 'rgba(144,80,224,.03)', borderRadius: 8,
          border: '1px solid rgba(144,80,224,.08)', lineHeight: 1.5,
        }}>
          Master Numbers are not reduced in calculation. They carry higher vibrational potential
          and greater responsibility. An <span style={{ color: 'var(--violet2)' }}>11</span> behind
          the scenes amplifies intuition and spiritual sensitivity, while the{' '}
          <span style={{ color: 'var(--violet2)' }}>22</span> provides the architecture to manifest
          grand visions into material reality.
        </div>
      </div>

      {/* PERSONAL CYCLES */}
      <div>
        <div style={S.sectionTitle}>Personal Cycles (2026)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { ...PERSONAL_YEAR, label: 'Personal Year', color: '#f0c040' },
            { ...PERSONAL_MONTH, label: 'Personal Month', color: '#40ccdd' },
            { ...PERSONAL_DAY, label: 'Personal Day', color: '#d43070' },
          ].map((c, i) => (
            <div key={i} style={{
              ...S.glass, textAlign: 'center', padding: '20px 16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em',
                textTransform: 'uppercase', color: 'var(--text3)',
              }}>{c.label}</div>
              <NumCircle val={c.val} color={c.color} size={50} />
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.08em', color: c.color,
              }}>{c.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.4 }}>
                {c.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PINNACLES */}
      <div>
        <div style={S.sectionTitle}>Pinnacle Cycles</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {PINNACLES.map((p, i) => {
            const isActive = i === 1 // Pinnacle II for the age range
            return (
              <div key={i} style={{
                ...S.glass, textAlign: 'center', padding: '16px 12px',
                borderColor: isActive ? 'rgba(201,168,76,.3)' : 'rgba(201,168,76,.1)',
                background: isActive ? 'rgba(201,168,76,.06)' : 'rgba(5,5,26,.7)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.15em',
                  textTransform: 'uppercase', color: isActive ? 'var(--gold)' : 'var(--text3)',
                }}>{p.label}</div>
                <NumCircle val={p.num} color={isActive ? '#f0c040' : '#7788aa'} size={44} />
                <div style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 10, color: 'var(--text3)',
                }}>Ages {p.ages}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', fontStyle: 'italic', lineHeight: 1.3 }}>
                  {p.desc}
                </div>
                {isActive && (
                  <span style={S.badge('rgba(201,168,76,.12)', 'rgba(201,168,76,.3)', 'var(--gold)')}>
                    Current
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* CHALLENGES */}
      <div>
        <div style={S.sectionTitle}>Challenge Cycles</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {CHALLENGES.map((c, i) => {
            const isActive = i === 1
            const challengeDescs = {
              4: 'Discipline, patience, building solid foundations under pressure',
              1: 'Independence, self-assertion, overcoming fear of standing alone',
              3: 'Self-expression, overcoming scattered energy, finding creative focus',
            }
            return (
              <div key={i} style={{
                ...S.glass, textAlign: 'center', padding: '16px 12px',
                borderColor: isActive ? 'rgba(212,48,112,.3)' : 'rgba(201,168,76,.1)',
                background: isActive ? 'rgba(212,48,112,.04)' : 'rgba(5,5,26,.7)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.15em',
                  textTransform: 'uppercase', color: isActive ? 'var(--rose)' : 'var(--text3)',
                }}>{c.label}</div>
                <NumCircle val={c.num} color={isActive ? '#d43070' : '#556677'} size={40} />
                <div style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 10, color: 'var(--text3)',
                }}>Ages {c.ages}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.3 }}>
                  {challengeDescs[c.num] || ''}
                </div>
                {isActive && (
                  <span style={S.badge('rgba(212,48,112,.12)', 'rgba(212,48,112,.3)', 'var(--rose2)')}>
                    Current
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* LIFE PATH INTERPRETATION */}
      <div>
        <div style={S.sectionTitle}>Life Path 5 -- Detailed Interpretation</div>
        <div style={S.interpretation}>
          <span style={{ color: 'var(--gold)' }}>Life Path 5: The Adventurer</span> is the path of
          freedom, sensory experience, and radical change. You are here to explore the full spectrum
          of human experience -- not from the sidelines but by diving in completely. The 5 energy
          resists routine, confinement, and anything that limits the senses. Your greatest gift is{' '}
          <span style={{ color: '#40ccdd' }}>adaptability</span> -- you can reinvent yourself
          in any context, speak to any audience, and thrive in chaos that would paralyze others.
          <br /><br />
          The shadow of the 5 is <span style={{ color: 'var(--rose2)' }}>excess and restlessness</span>.
          The Karmic Debt 14 behind your Life Path warns against misusing freedom through overindulgence,
          addiction, or irresponsibility. The lesson is to find freedom{' '}
          <span style={{ color: 'var(--gold)' }}>within commitment</span> rather than through escape.
          Your Expression 7 provides the balancing anchor -- the seeker energy that takes the 5's
          experiences and distills them into wisdom and understanding. The Soul Urge 3 reveals that
          beneath all the adventures, what your heart truly desires is to{' '}
          <span style={{ color: '#d43070' }}>create and communicate</span> -- to turn lived experience
          into art, story, and connection. The Maturity Number 4 promises that in the second half of
          life, structure and discipline will become not a cage but a{' '}
          <span style={{ color: '#60b030' }}>foundation for lasting creation</span>.
        </div>
      </div>
    </div>
  )
}
