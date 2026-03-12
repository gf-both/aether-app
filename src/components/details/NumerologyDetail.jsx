const CORE = {
  lifePath: {
    val: 7, title: 'The Seeker', desc: 'Introspection, analysis, wisdom, spiritual seeking, inner truth',
    derivation: 'Date of Birth: January 23, 1981\nMonth: 1 (January) → 1\nDay: 23 → 2 + 3 = 5\nYear: 1981 → 1 + 9 + 8 + 1 = 19 → 1 + 9 = 10 → 1 + 0 = 1\nTotal: 1 + 5 + 1 = 7\nLife Path = 7',
  },
  expression: {
    val: 1, title: 'The Initiator', desc: 'Independence, originality, leadership, pioneer energy, creative force',
    derivation: 'Full birth name: GASTON FRYDLEWSKI\nGASTON: 7+1+1+2+6+5 = 22 (Master Number!)\nFRYDLEWSKI: 6+9+7+4+3+5+5+1+2+9 = 51 → 6\nExpression = 22 + 6 = 28 → 10 → 1\nNote: First name vibrates at Master Number 22 (Master Builder).',
  },
  soulUrge: {
    val: 3, title: 'The Communicator', desc: 'Self-expression, creativity, joy, artistic talent',
    derivation: 'Sum of all VOWELS (A, E, I, O, U) in the full birth name.\nEach vowel → Pythagorean number value, then reduced.',
  },
  birthday: {
    val: 23, title: 'The Royal Star', desc: 'Born on the 23rd — versatile, communicative, adventurous, progressive',
    derivation: 'Day of birth: 23\nReduced: 2 + 3 = 5\nThe raw day (23) is kept as Birthday Number.\n23 is considered a "Royal Star of the Lion" in Chaldean numerology — one of the most fortunate numbers.',
  },
  personality: {
    val: 7, title: 'The Seeker', desc: 'Analytical depth, spiritual intensity, wisdom projected outward',
    derivation: 'Consonants in GASTON FRYDLEWSKI:\nG(7)+S(1)+T(2)+N(5) = 15\nF(6)+R(9)+Y(7)+D(4)+L(3)+W(5)+S(1)+K(2) = 37\nTotal: 15 + 37 = 52 → 5 + 2 = 7\nPersonality = 7',
  },
  maturity: {
    val: 8, title: 'The Powerhouse', desc: 'Material mastery, authority, power, abundance, achievement in later life',
    derivation: 'Life Path + Expression Number:\n7 + 1 = 8\nMaturity Number = 8\nActivates fully around age 40-50.',
  },
}

const EXTENDED = [
  { label: 'Hidden Passion', val: 1, desc: 'Number appearing most in name — drive for independence, leadership, and originality' },
  { label: 'Karmic Debt', val: 19, desc: 'Lesson of self-sufficiency — learning independence through adversity, misuse of power in past lives (year 1981 → 19 → 10 → 1)' },
]

const MASTERS = [
  { val: 11, label: 'Master Intuitive', desc: 'Spiritual insight, intuition, illumination, nervous energy' },
  { val: 22, label: 'Master Builder', desc: 'Turning dreams into reality, large-scale vision, discipline' },
]

const PINNACLES = [
  { num: 6, label: 'Pinnacle I', ages: '0-29', desc: 'Responsibility, family, love, domestic harmony' },
  { num: 6, label: 'Pinnacle II', ages: '30-38', desc: 'Responsibility deepens, service to others, nurturing' },
  { num: 3, label: 'Pinnacle III', ages: '39-47', desc: 'Creative expression, communication, social expansion, joy' },
  { num: 2, label: 'Pinnacle IV', ages: '48+', desc: 'Cooperation, patience, diplomacy, partnership, sensitivity' },
]

const CHALLENGES = [
  { num: 4, label: 'Challenge I', ages: '0-29' },
  { num: 4, label: 'Challenge II', ages: '30-38' },
  { num: 0, label: 'Challenge III', ages: '39-47' },
  { num: 0, label: 'Challenge IV', ages: '48+' },
]

const PERSONAL_YEAR = { val: 7, title: 'Reflection', desc: 'Inner wisdom, spiritual study, solitude, deep analysis, sabbatical year' }
const PERSONAL_MONTH = { val: 1, title: 'New Beginnings', desc: 'Initiative, fresh starts, independence, planting seeds' }
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
                {data.derivation && (
                  <div style={{
                    marginTop: 8, padding: '8px 10px', borderRadius: 6,
                    background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.08)',
                    fontFamily: "'Inconsolata', monospace", fontSize: 10, lineHeight: 1.5,
                    color: 'var(--text3)', whiteSpace: 'pre-line',
                  }}>
                    <span style={{ fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold3)' }}>How it's derived:</span>
                    {'\n'}{data.derivation}
                  </div>
                )}
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
            const isActive = i === 2 // Pinnacle III for age 45 (2026)
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
            const isActive = i === 2
            const challengeDescs = {
              0: 'The challenge of choice — all numbers are potential challenges, demanding versatility and wisdom',
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
        <div style={S.sectionTitle}>Life Path 7 -- Detailed Interpretation</div>
        <div style={S.interpretation}>
          <span style={{ color: 'var(--gold)' }}>Life Path 7: The Seeker</span> is the path of
          introspection, spiritual seeking, and the relentless pursuit of truth. You are here to go
          deeper than anyone else -- to question, analyze, and penetrate the mysteries that others
          accept on the surface. The 7 energy is fundamentally{' '}
          <span style={{ color: '#40ccdd' }}>contemplative and investigative</span> -- you need
          solitude, silence, and space to process the enormous amount of data your mind naturally absorbs.
          <br /><br />
          With a Life Path 7 combined with Expression 1 (the Master Builder 22 reduced), this seeking quality is{' '}
          <span style={{ color: 'var(--violet2)' }}>amplified to an extraordinary degree</span>.
          You are both the question and the questioner. The Karmic Debt 19 in your year of birth
          warns against misuse of independence -- the 7's tendency to retreat into the mind can become avoidance if
          unchecked. Your Soul Urge 3 reveals that beneath the analyst lies a{' '}
          <span style={{ color: '#d43070' }}>creative communicator</span> -- the desire to share
          what you've discovered, to make the invisible visible through art, writing, or teaching.
          The Personality 7 shows the world the same{' '}
          <span style={{ color: 'var(--violet2)' }}>analytical and spiritual depth</span> that defines
          your Life Path. The Maturity Number 8 promises that in the
          second half of life, the seeker's journey leads to{' '}
          <span style={{ color: '#60b030' }}>material mastery and authority</span> -- transforming
          wisdom into tangible achievement and lasting impact.
        </div>
      </div>
    </div>
  )
}
