import { useState } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { ENNEAGRAM_TYPES, ENNEAGRAM_PROFILE, ENNEAGRAM_QUIZ, INSTINCTUAL_VARIANTS, TRIAD_COLORS } from '../../data/enneagramData'
import EnneagramSymbol from '../canvas/EnneagramSymbol'

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

function EnneagramQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  const handleAnswer = (optIdx) => {
    const q = ENNEAGRAM_QUIZ[step]
    const scores = q.opts[optIdx].scores
    const newAnswers = { ...answers }
    Object.entries(scores).forEach(([type, pts]) => {
      newAnswers[type] = (newAnswers[type] || 0) + pts
    })
    setAnswers(newAnswers)

    if (step < ENNEAGRAM_QUIZ.length - 1) {
      setStep(step + 1)
    } else {
      const sorted = Object.entries(newAnswers).sort((a, b) => b[1] - a[1])
      const topType = parseInt(sorted[0][0])
      const typeData = ENNEAGRAM_TYPES.find(t => t.number === topType)
      setResult({ type: topType, name: typeData?.name, scores: sorted.slice(0, 3) })
    }
  }

  const reset = () => { setStep(0); setAnswers({}); setResult(null) }

  if (result) {
    const typeData = ENNEAGRAM_TYPES.find(t => t.number === result.type)
    const tc = TRIAD_COLORS[typeData?.triad] || TRIAD_COLORS.Head
    return (
      <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold3)' }}>
          Quiz Result
        </div>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: tc.bg, border: `2px solid ${tc.border}`,
          fontFamily: "'Cinzel', serif", fontSize: 32, color: tc.color,
        }}>{result.type}</div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: 'var(--gold)', letterSpacing: '.1em' }}>
          Type {result.type}: {result.name}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {result.scores.map(([t, pts], i) => {
            const td = ENNEAGRAM_TYPES.find(x => x.number === parseInt(t))
            return (
              <span key={i} style={{
                padding: '3px 10px', borderRadius: 12, fontSize: 10,
                background: i === 0 ? 'rgba(201,168,76,.1)' : 'rgba(255,255,255,.04)',
                border: `1px solid ${i === 0 ? 'rgba(201,168,76,.3)' : 'rgba(255,255,255,.08)'}`,
                color: i === 0 ? 'var(--gold)' : 'var(--text3)',
                fontFamily: "'Inconsolata', monospace",
              }}>
                {td?.name} ({pts}pts)
              </span>
            )
          })}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.5 }}>
          This is a brief indicator. For accurate typing, explore the full descriptions below
          and consider which core fear and desire resonate most deeply.
        </div>
        <div onClick={reset} style={{
          padding: '6px 18px', borderRadius: 8, background: 'rgba(201,168,76,.08)',
          border: '1px solid rgba(201,168,76,.2)', cursor: 'pointer', alignSelf: 'center',
          fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.1em', color: 'var(--gold2)',
        }}>Retake Quiz</div>
      </div>
    )
  }

  const q = ENNEAGRAM_QUIZ[step]
  return (
    <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold3)' }}>
          Quick Type Finder
        </span>
        <span style={{ fontFamily: "'Inconsolata', monospace", fontSize: 10, color: 'var(--text3)' }}>
          {step + 1} / {ENNEAGRAM_QUIZ.length}
        </span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: 'var(--bar-track)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 2, background: 'var(--gold)',
          width: `${((step + 1) / ENNEAGRAM_QUIZ.length) * 100}%`,
          transition: 'width .3s ease',
        }} />
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'var(--text)', lineHeight: 1.5 }}>
        {q.q}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {q.opts.map((opt, i) => (
          <div key={i} onClick={() => handleAnswer(i)} style={{
            ...S.row, cursor: 'pointer', padding: '10px 14px',
            transition: 'all .2s',
          }}>
            <span style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.15)',
              fontFamily: "'Cinzel', serif", fontSize: 10, color: 'var(--gold)',
            }}>{String.fromCharCode(65 + i)}</span>
            <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.4 }}>{opt.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function EnneagramDetail() {
  const storeType = useAboveInsideStore((s) => s.enneagramType)
  const storeWing = useAboveInsideStore((s) => s.enneagramWing)
  const storeInstinct = useAboveInsideStore((s) => s.enneagramInstinct)

  // Resolve active type — store override or static default
  const typeNum = storeType || ENNEAGRAM_PROFILE.type
  const activeType = ENNEAGRAM_TYPES.find(t => t.number === typeNum)

  // Resolve wings — primary from store or static, secondary is the other wing
  const primaryWing = storeWing || (storeType ? activeType.wings[0] : ENNEAGRAM_PROFILE.wing)
  const secondaryWing = activeType.wings.find(w => w !== primaryWing) || activeType.wings[1]
  const primaryWingType = ENNEAGRAM_TYPES.find(t => t.number === primaryWing)
  const secondaryWingType = ENNEAGRAM_TYPES.find(t => t.number === secondaryWing)

  // Resolve growth/stress arrows
  const integrationTo = storeType ? activeType.growth : ENNEAGRAM_PROFILE.integration.direction
  const disintegrationTo = storeType ? activeType.stress : ENNEAGRAM_PROFILE.disintegration.direction
  const integType = ENNEAGRAM_TYPES.find(t => t.number === integrationTo)
  const disintType = ENNEAGRAM_TYPES.find(t => t.number === disintegrationTo)

  // Resolve instinctual stacking
  const instinct = storeInstinct || ENNEAGRAM_PROFILE.instinctual.dominant
  // Build stacking info
  const instVariants = ['sp', 'sx', 'so']
  const dominant = instinct
  const remaining = instVariants.filter(v => v !== dominant)
  // Use static stacking if no store override and type matches default
  const useStaticInstinct = !storeInstinct && !storeType
  const stacking = useStaticInstinct ? ENNEAGRAM_PROFILE.instinctual : {
    dominant,
    secondary: remaining[0],
    blind: remaining[1],
    stacking: `${dominant}/${remaining[0]}`,
  }

  // Label
  const label = `${typeNum}w${primaryWing}`
  const fullName = `${activeType.name} with ${primaryWingType.name} Wing`

  // Tritype (static, only applicable when using default profile)
  const tritype = ENNEAGRAM_PROFILE.tritype

  const tc = TRIAD_COLORS[activeType.triad]

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>{'\u2B21'} Enneagram</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>
          Personality architecture -- type, wing, tritype, instincts, and growth paths
        </div>
      </div>

      {/* ENNEAGRAM SYMBOL CANVAS */}
      <div>
        <div style={S.sectionTitle}>Enneagram Symbol</div>
        <div style={{ ...S.glass, padding: 0, overflow: 'hidden', height: 460, position: 'relative' }}>
          <EnneagramSymbol typeOverride={storeType} wingOverride={storeWing} />
        </div>
      </div>

      {/* INTERACTIVE QUIZ — only show if no type set in profile */}
      {!storeType && (
        <div>
          <div style={S.sectionTitle}>Discover Your Type</div>
          <EnneagramQuiz />
        </div>
      )}

      {/* CORE TYPE */}
      <div>
        <div style={S.sectionTitle}>Core Type</div>
        <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            ['Type', `${label} \u2014 ${fullName}`],
            ['Archetype', !storeType ? ENNEAGRAM_PROFILE.name : activeType.name],
            ['Triad', `${activeType.triad} (${activeType.center} Center)`],
            ['Core Fear', activeType.fear],
            ['Core Desire', activeType.desire],
            ['Motivation', activeType.motivation],
          ].map(([lbl, val], i) => (
            <div key={i} style={S.keyVal}>
              <span style={{
                fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em',
                textTransform: 'uppercase', color: 'var(--text3)', minWidth: 140,
              }}>{lbl}</span>
              <span style={{
                ...S.mono, color: i === 0 ? 'var(--gold)' : 'var(--gold2)',
                textAlign: 'right', maxWidth: '60%',
              }}>
                {i === 0
                  ? <span style={{
                      ...S.badge(tc.bg, tc.border, tc.color),
                      fontSize: 10, padding: '4px 14px',
                    }}>{val}</span>
                  : val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* VICE & VIRTUE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{
          ...S.glass,
          background: 'rgba(220,60,60,.04)', borderColor: 'rgba(220,60,60,.15)',
          textAlign: 'center', padding: '20px 18px',
        }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(220,60,60,.6)', marginBottom: 6 }}>
            Passion (Vice)
          </div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: '#ee5544', letterSpacing: '.15em' }}>
            {activeType.vice}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6, fontStyle: 'italic' }}>
            The emotional habit that keeps the ego fixated
          </div>
        </div>
        <div style={{
          ...S.glass,
          background: 'rgba(96,200,80,.04)', borderColor: 'rgba(96,200,80,.15)',
          textAlign: 'center', padding: '20px 18px',
        }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(96,200,80,.6)', marginBottom: 6 }}>
            Virtue
          </div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: '#88dd44', letterSpacing: '.15em' }}>
            {activeType.virtue}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6, fontStyle: 'italic' }}>
            The higher quality that emerges through self-awareness
          </div>
        </div>
      </div>

      {/* WING INFLUENCE — BOTH WINGS */}
      <div>
        <div style={S.sectionTitle}>Wing Influence</div>
        <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Primary wing */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: 24, color: 'var(--gold)',
              width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.18)',
            }}>{primaryWing}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ ...S.mono, color: 'var(--gold2)', fontSize: 14 }}>
                  Wing {primaryWing}: {primaryWingType.name}
                </span>
                <span style={S.badge('rgba(201,168,76,.1)', 'rgba(201,168,76,.25)', 'var(--gold)')}>Primary</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', marginTop: 4 }}>
                {useStaticInstinct && ENNEAGRAM_PROFILE.wingInfluence[`wing${primaryWing}`]
                  ? ENNEAGRAM_PROFILE.wingInfluence[`wing${primaryWing}`]
                  : `Adds ${primaryWingType.name.toLowerCase()} qualities — ${primaryWingType.keywords.slice(0, 2).join(', ').toLowerCase()} — to the core ${activeType.name} pattern`}
              </div>
            </div>
          </div>
          {/* Secondary wing */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: .7 }}>
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: 20, color: 'var(--gold3)',
              width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.1)',
            }}>{secondaryWing}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ ...S.mono, color: 'var(--text2)', fontSize: 13 }}>
                  Wing {secondaryWing}: {secondaryWingType.name}
                </span>
                <span style={S.badge('rgba(255,255,255,.04)', 'rgba(255,255,255,.08)', 'var(--text3)')}>Secondary</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', marginTop: 4 }}>
                {useStaticInstinct && ENNEAGRAM_PROFILE.wingInfluence[`wing${secondaryWing}`]
                  ? ENNEAGRAM_PROFILE.wingInfluence[`wing${secondaryWing}`]
                  : `A subtler influence adding ${secondaryWingType.keywords.slice(0, 2).join(', ').toLowerCase()} tendencies`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRITYPE */}
      <div>
        <div style={S.sectionTitle}>Tritype</div>
        <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Inconsolata', monospace", fontSize: 20, color: 'var(--gold)', fontWeight: 700 }}>
              {tritype.label}
            </span>
            <span style={{ ...S.mono, color: 'var(--text2)' }}>{tritype.name}</span>
          </div>
          {tritype.types.map((tNum, i) => {
            const tData = ENNEAGRAM_TYPES.find(t => t.number === tNum)
            const triC = TRIAD_COLORS[tData.triad]
            const centers = ['Head', 'Heart', 'Body']
            return (
              <div key={i} style={{
                ...S.row,
                borderColor: triC.border,
                background: triC.bg,
              }}>
                <span style={{
                  fontFamily: "'Cinzel', serif", fontSize: 20, minWidth: 36, textAlign: 'center',
                  color: triC.color,
                }}>{tNum}</span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ ...S.mono, color: triC.color, fontSize: 13 }}>{tData.name}</span>
                    <span style={S.badge(triC.bg, triC.border, triC.color)}>
                      {tData.triad} Center
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>
                    {centers[i]} center response: {tData.vice} {'\u2192'} {tData.virtue}
                  </span>
                </div>
              </div>
            )
          })}
          <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', padding: '4px 0' }}>
            {tritype.description}
          </div>
        </div>
      </div>

      {/* INSTINCTUAL STACKING */}
      <div>
        <div style={S.sectionTitle}>Instinctual Stacking</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{
            fontFamily: "'Inconsolata', monospace", fontSize: 20, color: 'var(--gold)',
            fontWeight: 700, letterSpacing: '.1em',
          }}>
            {stacking.stacking.toUpperCase()}
          </span>
          <span style={{ ...S.monoSm, color: 'var(--text3)' }}>
            Dominant {'\u2192'} Secondary (blind spot: {stacking.blind.toUpperCase()})
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {INSTINCTUAL_VARIANTS.map((iv, i) => {
            const isDom = iv.code === stacking.dominant
            const isSec = iv.code === stacking.secondary
            const isBlind = iv.code === stacking.blind
            const lbl = isDom ? 'Dominant' : isSec ? 'Secondary' : 'Blind Spot'
            return (
              <div key={i} style={{
                ...S.row,
                borderColor: isDom ? 'rgba(201,168,76,.2)' : isSec ? 'rgba(64,204,221,.15)' : 'rgba(255,255,255,.04)',
                background: isDom ? 'rgba(201,168,76,.06)' : isSec ? 'rgba(64,204,221,.03)' : 'rgba(255,255,255,.02)',
                opacity: isBlind ? .55 : 1,
              }}>
                <span style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 16, fontWeight: 700,
                  minWidth: 32, textAlign: 'center',
                  color: isDom ? 'var(--gold)' : isSec ? 'var(--aqua2)' : 'var(--text3)',
                }}>{iv.code.toUpperCase()}</span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ ...S.mono, color: isDom ? 'var(--gold2)' : 'var(--text2)', fontSize: 13 }}>
                      {iv.name}
                    </span>
                    <span style={S.badge(
                      isDom ? 'rgba(201,168,76,.1)' : isSec ? 'rgba(64,204,221,.08)' : 'rgba(255,255,255,.04)',
                      isDom ? 'rgba(201,168,76,.25)' : isSec ? 'rgba(64,204,221,.2)' : 'rgba(255,255,255,.08)',
                      isDom ? 'var(--gold)' : isSec ? 'var(--aqua2)' : 'var(--text3)',
                    )}>{lbl}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.4 }}>
                    {iv.focus}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* INTEGRATION & DISINTEGRATION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{
          ...S.glass,
          background: 'rgba(96,200,80,.04)', borderColor: 'rgba(96,200,80,.15)',
        }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(96,200,80,.6)', marginBottom: 8 }}>
            Integration (Growth)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: 14, color: 'var(--gold)',
            }}>{typeNum}</span>
            <span style={{ color: '#88dd44', fontSize: 16 }}>{'\u2192'}</span>
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: 14, color: '#88dd44',
            }}>{integrationTo}</span>
            <span style={{ ...S.mono, color: '#88dd44', fontSize: 11 }}>({integType.name})</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.5 }}>
            {useStaticInstinct
              ? ENNEAGRAM_PROFILE.integration.description
              : `Moves toward the healthy ${integType.name} \u2014 takes on ${integType.keywords.slice(0, 2).join(', ').toLowerCase()} qualities`}
          </div>
        </div>
        <div style={{
          ...S.glass,
          background: 'rgba(220,60,60,.04)', borderColor: 'rgba(220,60,60,.15)',
        }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(220,60,60,.6)', marginBottom: 8 }}>
            Disintegration (Stress)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: 14, color: 'var(--gold)',
            }}>{typeNum}</span>
            <span style={{ color: '#ee5544', fontSize: 16 }}>{'\u2192'}</span>
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: 14, color: '#ee5544',
            }}>{disintegrationTo}</span>
            <span style={{ ...S.mono, color: '#ee5544', fontSize: 11 }}>({disintType.name})</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.5 }}>
            {useStaticInstinct
              ? ENNEAGRAM_PROFILE.disintegration.description
              : `Under stress, takes on unhealthy ${disintType.name} traits \u2014 becomes more ${disintType.keywords.slice(2).join(', ').toLowerCase()}`}
          </div>
        </div>
      </div>

      {/* ALL 9 TYPES TABLE */}
      <div>
        <div style={S.sectionTitle}>The Nine Types</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* header */}
          <div style={{ display: 'grid', gridTemplateColumns: '32px 110px 70px 80px 90px 90px', gap: 8, padding: '4px 12px' }}>
            <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)' }}>#</span>
            <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)' }}>NAME</span>
            <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)' }}>TRIAD</span>
            <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)' }}>VICE</span>
            <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)' }}>VIRTUE</span>
            <span style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)' }}>ARROWS</span>
          </div>
          {ENNEAGRAM_TYPES.map((t, i) => {
            const triC = TRIAD_COLORS[t.triad]
            const isActive = t.number === typeNum
            return (
              <div key={i} style={{
                ...S.row,
                display: 'grid', gridTemplateColumns: '32px 110px 70px 80px 90px 90px', gap: 8,
                borderColor: isActive ? 'rgba(201,168,76,.2)' : 'rgba(255,255,255,.04)',
                background: isActive ? 'rgba(201,168,76,.06)' : 'rgba(255,255,255,.02)',
              }}>
                <span style={{
                  fontFamily: "'Cinzel', serif", fontSize: 16, textAlign: 'center',
                  color: isActive ? 'var(--gold)' : t.col + '0.7)',
                }}>{t.number}</span>
                <span style={{
                  ...S.mono,
                  color: isActive ? 'var(--gold)' : 'var(--text2)',
                  fontWeight: isActive ? 700 : 400,
                }}>{t.name}</span>
                <span style={S.badge(triC.bg, triC.border, triC.color)}>{t.triad}</span>
                <span style={{ ...S.monoSm, color: 'var(--rose2)', fontSize: 10 }}>{t.vice}</span>
                <span style={{ ...S.monoSm, color: '#88dd44', fontSize: 10 }}>{t.virtue}</span>
                <span style={{ ...S.monoSm, fontSize: 10, color: 'var(--text3)' }}>
                  {'\u2191'}{t.growth} {'\u2193'}{t.stress}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* LEVELS OF DEVELOPMENT */}
      <div>
        <div style={S.sectionTitle}>Levels of Development</div>
        <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text3)' }}>
              Current Level
            </span>
            <span style={{
              fontFamily: "'Inconsolata', monospace", fontSize: 18, color: 'var(--gold)', fontWeight: 700,
            }}>{ENNEAGRAM_PROFILE.level.current}</span>
            <span style={{ ...S.mono, color: 'var(--gold2)' }}>{ENNEAGRAM_PROFILE.level.name}</span>
          </div>
          {/* Level bar */}
          <div style={{ display: 'flex', gap: 3, height: 8, borderRadius: 4, overflow: 'hidden' }}>
            {Array.from({ length: 9 }, (_, i) => {
              const lvl = i + 1
              const isCurrent = lvl === ENNEAGRAM_PROFILE.level.current
              const isHealthy = lvl <= 3
              const isAverage = lvl >= 4 && lvl <= 6
              const color = isHealthy ? 'rgba(96,200,80,' : isAverage ? 'rgba(240,200,40,' : 'rgba(220,60,60,'
              return (
                <div key={i} style={{
                  flex: 1, borderRadius: 2,
                  background: color + (isCurrent ? '0.8)' : '0.15)'),
                  border: isCurrent ? `1px solid ${color}1)` : 'none',
                }} />
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: -4 }}>
            <span style={{ fontSize: 9, color: '#88dd44', fontFamily: "'Inconsolata', monospace" }}>Healthy</span>
            <span style={{ fontSize: 9, color: '#f0c828', fontFamily: "'Inconsolata', monospace" }}>Average</span>
            <span style={{ fontSize: 9, color: '#ee5544', fontFamily: "'Inconsolata', monospace" }}>Unhealthy</span>
          </div>
          {[
            ['Healthy (1\u20133)', ENNEAGRAM_PROFILE.level.healthy, '#88dd44'],
            ['Average (4\u20136)', ENNEAGRAM_PROFILE.level.average, '#f0c828'],
            ['Unhealthy (7\u20139)', ENNEAGRAM_PROFILE.level.unhealthy, '#ee5544'],
          ].map(([lbl, desc, color], i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{
                fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em',
                textTransform: 'uppercase', color,
              }}>{lbl}</span>
              <span style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.4 }}>
                {desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* GROWTH RECOMMENDATIONS */}
      <div>
        <div style={S.sectionTitle}>Growth Recommendations</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ENNEAGRAM_PROFILE.growth.map((rec, i) => (
            <div key={i} style={{
              ...S.row, padding: '10px 14px',
            }}>
              <span style={{
                fontFamily: "'Cinzel', serif", fontSize: 14, color: 'var(--gold)',
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.15)',
                flexShrink: 0,
              }}>{i + 1}</span>
              <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                {rec}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* READING */}
      <div>
        <div style={S.sectionTitle}>Profile Reading</div>
        <div style={S.interpretation}>
          As a <span style={{ color: 'var(--gold)' }}>Type {label} ({stacking.stacking})</span> with the{' '}
          <span style={{ color: 'var(--aqua2)' }}>{tritype.label} tritype</span>, you lead with the {activeType.triad}{' '}
          center's core fear of {activeType.fear.toLowerCase()}, colored by the {primaryWingType.name}'s{' '}
          {primaryWingType.keywords[0].toLowerCase()} qualities. The{' '}
          <span style={{ color: 'var(--gold)' }}>{INSTINCTUAL_VARIANTS.find(v => v.code === stacking.dominant)?.name} dominant</span>{' '}
          instinct focuses your {activeType.name.toLowerCase()} nature on {INSTINCTUAL_VARIANTS.find(v => v.code === stacking.dominant)?.keyword.toLowerCase()}.{' '}
          Growth comes through moving toward{' '}
          <span style={{ color: '#88dd44' }}>{integrationTo} ({integType.name})</span> -- taking on{' '}
          {integType.keywords.slice(0, 2).join(' and ').toLowerCase()} qualities.{' '}
          Watch for the <span style={{ color: '#ee5544' }}>stress arrow to {disintegrationTo}</span>, where the{' '}
          impulse toward {disintType.keywords.slice(2).join(' and ').toLowerCase()} replaces your natural strengths.{' '}
          The passion of <span style={{ color: '#ee5544' }}>{activeType.vice}</span> is transformed through the virtue of{' '}
          <span style={{ color: '#88dd44' }}>{activeType.virtue}</span>.
        </div>
      </div>
    </div>
  )
}
