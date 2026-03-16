import { useMemo } from 'react'
import { useActiveProfile } from '../../hooks/useActiveProfile'
import { getNumerologyProfileFromDob } from '../../engines/numerologyEngine'

const CORE_COLORS = {
  lifePath:    '#f0c040',
  expression:  '#40ccdd',
  soulUrge:    '#d43070',
  birthday:    '#f0c040',
  personality: '#9050e0',
  maturity:    '#60b030',
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

function NumCircle({ val, color, size = 54, label }) {
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
          textTransform: 'uppercase', color: 'var(--muted-foreground)', textAlign: 'center',
        }}>{label}</div>
      )}
    </div>
  )
}

/** Parse profile DOB and name, return {day,month,year,fullName} */
function parseProfileInputs(profile) {
  const dob = profile?.dob || ''
  const [y, m, d] = dob ? dob.split('-').map(Number) : [0, 0, 0]
  // Build full name from profile
  const fullName = profile?.name
    ? profile.name.toUpperCase()
    : ''
  return { day: d, month: m, year: y, fullName }
}

export default function NumerologyDetail() {
  const activeProfile = useActiveProfile()

  const now = new Date()
  const { day, month, year, fullName } = parseProfileInputs(activeProfile)

  const profile = useMemo(() => {
    if (!activeProfile?.dob || !fullName) return null
    try {
      return getNumerologyProfileFromDob(
        activeProfile.dob,
        fullName,
        {
          currentYear:  now.getFullYear(),
          currentMonth: now.getMonth() + 1,
          currentDay:   now.getDate(),
        }
      )
    } catch (e) {
      console.error('NumerologyEngine error:', e)
      return null
    }
  }, [activeProfile?.dob, fullName])

  if (!profile) return <div style={S.panel}>{(!activeProfile?.dob || !fullName) ? 'No profile data. Please set your birth date and name in settings.' : 'Error computing profile.'}</div>

  const { core, pinnacles, challenges, personal, extended, derivations } = profile

  const currentYear = now.getFullYear()

  // Challenge descriptions
  const challengeDescs = {
    0: 'The challenge of choice — all numbers are potential challenges, demanding versatility and wisdom',
    1: 'Independence, self-assertion, overcoming fear of standing alone',
    2: 'Balancing sensitivity and boundaries, partnership dynamics',
    3: 'Self-expression, overcoming scattered energy, finding creative focus',
    4: 'Discipline, patience, building solid foundations under pressure',
    5: 'Managing freedom responsibly, avoiding restlessness',
    6: 'Balancing duty and personal needs, domestic harmony',
    7: 'Faith vs analysis, overcoming isolation, trust in the unseen',
    8: 'Power, materialism, learning authority without ego',
    9: 'Letting go, compassion over selfishness, universal perspective',
  }

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>{'\u221E'} Numerology</div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          Core numbers, master numbers, pinnacles, challenges, and personal cycles
        </div>
      </div>

      {/* CORE NUMBERS */}
      <div>
        <div style={S.sectionTitle}>Core Numbers</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {Object.entries(core).map(([key, data]) => (
            <div key={key} style={{
              ...S.glass, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 10, padding: '20px 16px', textAlign: 'center',
            }}>
              <NumCircle val={data.val} color={CORE_COLORS[key]} size={60} />
              {data.master && (
                <span style={S.badge('rgba(144,80,224,.12)', 'rgba(144,80,224,.3)', '#9050e0')}>
                  Master {data.val}
                </span>
              )}
              {key === 'expression' && data.masterInName && !data.master && (
                <span style={S.badge('rgba(144,80,224,.08)', 'rgba(144,80,224,.2)', '#9050e0')}>
                  M{data.masterInName} in name
                </span>
              )}
              <div>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em',
                  textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: 4,
                }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                {key === 'birthday' && data.reduced && data.reduced !== data.val && (
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 2 }}>
                    Reduced: {data.reduced}
                  </div>
                )}
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 13, letterSpacing: '.1em',
                  color: CORE_COLORS[key], marginBottom: 4,
                }}>{data.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  {data.desc}
                </div>
                {derivations[key] && (
                  <div style={{
                    marginTop: 8, padding: '8px 10px', borderRadius: 6,
                    background: 'var(--secondary)', border: '1px solid var(--accent)',
                    fontFamily: "'Inconsolata', monospace", fontSize: 10, lineHeight: 1.5,
                    color: 'var(--muted-foreground)', whiteSpace: 'pre-line',
                  }}>
                    <span style={{ fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>How it's derived:</span>
                    {'\n'}{derivations[key]}
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
          <div style={{ ...S.glass, display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px' }}>
            <NumCircle
              val={Array.isArray(extended.hiddenPassion) ? extended.hiddenPassion.join('/') : extended.hiddenPassion}
              color='#f0c040'
              size={48}
            />
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.12em',
                color: 'var(--foreground)', marginBottom: 4,
              }}>Hidden Passion</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>
                Number appearing most in name — drive for independence, leadership, and originality
              </div>
            </div>
          </div>
          {extended.karmicDebt.length > 0 && (
            <div style={{ ...S.glass, display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px' }}>
              <NumCircle val={extended.karmicDebt[0]} color='#ee4466' size={48} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.12em',
                  color: '#ee6688', marginBottom: 4,
                }}>Karmic Debt {extended.karmicDebt.join(', ')}</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  Lesson of self-sufficiency — learning independence through adversity
                </div>
              </div>
            </div>
          )}
          {extended.karmicLessons.length > 0 && (
            <div style={{ ...S.glass, display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px' }}>
              <div style={{ fontSize: 14, color: '#ee9955', fontFamily: "'Cinzel', serif" }}>
                {extended.karmicLessons.join(', ')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.12em',
                  color: '#ee9955', marginBottom: 4,
                }}>Karmic Lessons</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  Missing numbers — areas needing development in this lifetime
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MASTER NUMBERS */}
      {extended.masterNumbers.length > 0 && (
        <div>
          <div style={S.sectionTitle}>Master Numbers</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {extended.masterNumbers.map((mn) => {
              const meanings = {
                11: { label: 'Master Intuitive', desc: 'Spiritual insight, intuition, illumination, nervous energy' },
                22: { label: 'Master Builder',   desc: 'Turning dreams into reality, large-scale vision, discipline' },
                33: { label: 'Master Teacher',   desc: 'Healing, compassion, spiritual teacher, selfless service' },
              }
              const info = meanings[mn] || { label: `Master ${mn}`, desc: '' }
              return (
                <div key={mn} style={{
                  ...S.glass,
                  background: 'rgba(104,32,176,.05)', borderColor: 'rgba(144,80,224,.18)',
                  display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px',
                }}>
                  <NumCircle val={mn} color='#9050e0' size={52} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.1em',
                      color: 'var(--violet2)', marginBottom: 4,
                    }}>{info.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>
                      {info.desc}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{
            marginTop: 10, fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic',
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
      )}

      {/* PERSONAL CYCLES */}
      <div>
        <div style={S.sectionTitle}>Personal Cycles ({currentYear})</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { ...personal.year,  label: 'Personal Year',  color: '#f0c040' },
            { ...personal.month, label: 'Personal Month', color: '#40ccdd' },
            { ...personal.day,   label: 'Personal Day',   color: '#d43070' },
          ].map((c, i) => (
            <div key={i} style={{
              ...S.glass, textAlign: 'center', padding: '20px 16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em',
                textTransform: 'uppercase', color: 'var(--muted-foreground)',
              }}>{c.label}</div>
              <NumCircle val={c.val} color={c.color} size={50} />
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.08em', color: c.color,
              }}>{c.title}</div>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>
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
          {pinnacles.map((p, i) => (
            <div key={i} style={{
              ...S.glass, textAlign: 'center', padding: '16px 12px',
              borderColor: p.active ? 'rgba(201,168,76,.3)' : 'var(--accent)',
              background: p.active ? 'rgba(201,168,76,.06)' : 'rgba(5,5,26,.7)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.15em',
                textTransform: 'uppercase', color: p.active ? 'var(--foreground)' : 'var(--muted-foreground)',
              }}>{p.label}</div>
              <NumCircle val={p.num} color={p.active ? '#f0c040' : '#7788aa'} size={44} />
              <div style={{
                fontFamily: "'Inconsolata', monospace", fontSize: 10, color: 'var(--muted-foreground)',
              }}>Ages {p.ageRange}</div>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.3 }}>
                {p.desc}
              </div>
              {p.active && (
                <span style={S.badge('var(--accent)', 'rgba(201,168,76,.3)', 'var(--foreground)')}>
                  Current
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CHALLENGES */}
      <div>
        <div style={S.sectionTitle}>Challenge Cycles</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {challenges.map((c, i) => (
            <div key={i} style={{
              ...S.glass, textAlign: 'center', padding: '16px 12px',
              borderColor: c.active ? 'rgba(212,48,112,.3)' : 'var(--accent)',
              background: c.active ? 'rgba(212,48,112,.04)' : 'rgba(5,5,26,.7)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.15em',
                textTransform: 'uppercase', color: c.active ? 'var(--rose)' : 'var(--muted-foreground)',
              }}>{c.label}</div>
              <NumCircle val={c.num} color={c.active ? '#d43070' : '#556677'} size={40} />
              <div style={{
                fontFamily: "'Inconsolata', monospace", fontSize: 10, color: 'var(--muted-foreground)',
              }}>Ages {c.ageRange}</div>
              <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.3 }}>
                {challengeDescs[c.num] || ''}
              </div>
              {c.active && (
                <span style={S.badge('rgba(212,48,112,.12)', 'rgba(212,48,112,.3)', 'var(--rose2)')}>
                  Current
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* LIFE PATH INTERPRETATION */}
      <div>
        <div style={S.sectionTitle}>Life Path {core.lifePath.val} — Detailed Interpretation</div>
        <div style={S.interpretation}>
          <span style={{ color: 'var(--foreground)' }}>Life Path {core.lifePath.val}: {core.lifePath.title}</span> is the path of
          introspection, spiritual seeking, and the relentless pursuit of truth. You are here to go
          deeper than anyone else — to question, analyze, and penetrate the mysteries that others
          accept on the surface. The 7 energy is fundamentally{' '}
          <span style={{ color: '#40ccdd' }}>contemplative and investigative</span> — you need
          solitude, silence, and space to process the enormous amount of data your mind naturally absorbs.
          <br /><br />
          With a Life Path {core.lifePath.val} combined with Expression {core.expression.val}
          {core.expression.masterInName ? ` (the Master Builder ${core.expression.masterInName} reduced)` : ''}, this seeking quality is{' '}
          <span style={{ color: 'var(--violet2)' }}>amplified to an extraordinary degree</span>.
          {extended.karmicDebt.length > 0 && (
            <> The Karmic Debt {extended.karmicDebt[0]} warns against misuse of independence — the 7's tendency to retreat into the mind can become avoidance if unchecked.</>
          )}
          {' '}Your Soul Urge {core.soulUrge.val} reveals that beneath the analyst lies a{' '}
          <span style={{ color: '#d43070' }}>creative communicator</span> — the desire to share
          what you've discovered, to make the invisible visible through art, writing, or teaching.
          The Personality {core.personality.val} shows the world the same{' '}
          <span style={{ color: 'var(--violet2)' }}>analytical and spiritual depth</span> that defines
          your Life Path. The Maturity Number {core.maturity.val} promises that in the
          second half of life, the seeker's journey leads to{' '}
          <span style={{ color: '#60b030' }}>material mastery and authority</span> — transforming
          wisdom into tangible achievement and lasting impact.
        </div>
      </div>
    </div>
  )
}
