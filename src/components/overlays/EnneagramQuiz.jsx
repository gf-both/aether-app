/**
 * EnneagramQuiz.jsx — standalone modal quiz overlay
 * 18 self-assessment statements (2 per type), rated 0/1/2
 * Tallies scores to determine top type + wing suggestion
 * Saves result to Zustand store via setEnneagramType(type, wing)
 */
import { useState } from 'react'
import { useGolemStore } from '../../store/useGolemStore'

/* ── Data ────────────────────────────────────────────────── */
const QUESTIONS = [
  { q: 'I have a strong inner critic and high personal standards.', types: [1] },
  { q: 'I feel responsible for making things right and correct.', types: [1] },
  { q: 'I naturally tune into others\u2019 needs and find ways to help.', types: [2] },
  { q: 'I feel most fulfilled when I know people need and appreciate me.', types: [2] },
  { q: 'I\u2019m highly motivated by success and how others perceive me.', types: [3] },
  { q: 'I adapt my image to fit different situations and goals.', types: [3] },
  { q: 'I have a deep sense of being fundamentally different from others.', types: [4] },
  { q: 'I\u2019m drawn to beauty, depth, and authentic self-expression.', types: [4] },
  { q: 'I need lots of alone time and tend to withdraw to think.', types: [5] },
  { q: 'I value knowledge and feel most secure when I understand things deeply.', types: [5] },
  { q: 'I frequently anticipate what could go wrong and prepare for it.', types: [6] },
  { q: 'I value loyalty and trust, and can be suspicious of hidden motives.', types: [6] },
  { q: 'I seek variety and stimulation, and get bored with limitations.', types: [7] },
  { q: 'I stay positive and reframe difficulties as opportunities.', types: [7] },
  { q: 'I\u2019m direct, assertive, and comfortable with confrontation.', types: [8] },
  { q: 'I need to feel in control and resist being controlled by others.', types: [8] },
  { q: 'I avoid conflict and naturally see all sides of a situation.', types: [9] },
  { q: 'I merge with others\u2019 priorities, often forgetting my own.', types: [9] },
]

const TYPES = {
  1: { name: 'The Reformer',    core: 'Principled, purposeful, self-controlled',    fear: 'Being corrupt or defective',                   desire: 'To be good, to have integrity' },
  2: { name: 'The Helper',      core: 'Caring, generous, people-pleasing',           fear: 'Being unloved, unwanted',                      desire: 'To feel loved and appreciated' },
  3: { name: 'The Achiever',    core: 'Adaptable, excelling, driven',                fear: 'Being worthless or a failure',                 desire: 'To feel valuable and worthwhile' },
  4: { name: 'The Individualist',core: 'Expressive, dramatic, self-absorbed',        fear: 'Having no identity or personal significance',  desire: 'To find themselves and their significance' },
  5: { name: 'The Investigator',core: 'Perceptive, innovative, isolated',            fear: 'Being helpless, incompetent, incapable',       desire: 'To be capable and competent' },
  6: { name: 'The Loyalist',    core: 'Committed, security-oriented, anxious',       fear: 'Being without support or guidance',            desire: 'To have security and support' },
  7: { name: 'The Enthusiast',  core: 'Spontaneous, versatile, scattered',           fear: 'Being deprived or trapped in pain',            desire: 'To be satisfied and content' },
  8: { name: 'The Challenger',  core: 'Powerful, dominating, self-confident',        fear: 'Being harmed or controlled by others',         desire: 'To protect themselves and be in control' },
  9: { name: 'The Peacemaker',  core: 'Receptive, reassuring, complacent',           fear: 'Loss and separation',                          desire: 'To have inner stability and peace' },
}

// Adjacent wings (wrapping 1↔9)
function getWings(type) {
  const prev = type === 1 ? 9 : type - 1
  const next = type === 9 ? 1 : type + 1
  return [prev, next]
}

function tallyResults(scores) {
  const sorted = Object.entries(scores)
    .map(([t, s]) => ({ type: parseInt(t), score: s }))
    .sort((a, b) => b.score - a.score)

  const topType = sorted[0].type
  const [wingA, wingB] = getWings(topType)
  const scoreA = scores[wingA] || 0
  const scoreB = scores[wingB] || 0
  const suggestedWing = scoreA >= scoreB ? wingA : wingB

  return {
    type: topType,
    wing: suggestedWing,
    wingLabel: `${topType}w${suggestedWing}`,
    ranked: sorted,
  }
}

/* ── Styles ──────────────────────────────────────────────── */
const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9900,
    background: 'rgba(0,0,0,.72)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px',
  },
  modal: {
    background: 'var(--card)', border: '1px solid rgba(201,168,76,.18)',
    borderRadius: 18, maxWidth: 540, width: '100%', maxHeight: '90vh',
    overflowY: 'auto', padding: '28px 28px 24px',
    display: 'flex', flexDirection: 'column', gap: 22,
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    color: 'var(--foreground)',
    boxShadow: '0 24px 64px rgba(0,0,0,.6)',
  },
  title: {
    fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 600,
    letterSpacing: '.18em', color: 'var(--foreground)',
  },
  subtitle: {
    fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.5,
  },
  sectionLabel: {
    fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 600,
    letterSpacing: '.25em', textTransform: 'uppercase',
    color: 'var(--muted-foreground)', marginBottom: 4,
  },
  progress: {
    height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden',
  },
  progressFill: (pct) => ({
    height: '100%', borderRadius: 2, background: 'var(--foreground)',
    width: `${pct * 100}%`, transition: 'width .35s ease',
  }),
  question: {
    fontSize: 15, lineHeight: 1.65, color: 'var(--foreground)', padding: '2px 0',
  },
  ratingRow: {
    display: 'flex', gap: 10,
  },
  ratingBtn: (active) => ({
    flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
    fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.08em',
    textAlign: 'center', lineHeight: 1.4,
    background: active ? 'rgba(201,168,76,.18)' : 'var(--secondary)',
    border: `1px solid ${active ? 'rgba(201,168,76,.45)' : 'rgba(255,255,255,.07)'}`,
    color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
    transition: 'all .18s',
  }),
  glass: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 13, padding: 18, backdropFilter: 'blur(12px)',
  },
  resultType: {
    fontFamily: "'Cinzel', serif", fontSize: 28, letterSpacing: '.15em',
    color: 'var(--foreground)', textAlign: 'center',
  },
  btn: (primary) => ({
    padding: primary ? '11px 28px' : '9px 22px',
    borderRadius: 10, cursor: 'pointer',
    fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, letterSpacing: '.12em',
    background: primary ? 'linear-gradient(135deg, rgba(201,168,76,.3), rgba(180,140,50,.2))' : 'rgba(255,255,255,.08)',
    border: `1px solid ${primary ? 'rgba(201,168,76,.6)' : 'rgba(255,255,255,.2)'}`,
    color: primary ? '#fff' : 'rgba(255,255,255,.7)',
    transition: 'all .18s',
    boxShadow: primary ? '0 0 10px rgba(201,168,76,.2)' : 'none',
  }),
  keyVal: {
    display: 'flex', gap: 12, padding: '5px 0',
    borderBottom: '1px solid var(--secondary)',
  },
  mono: {
    fontFamily: "'Inconsolata', monospace", fontSize: 12, color: 'var(--muted-foreground)',
  },
}

/* ── Result screen ───────────────────────────────────────── */
function QuizResult({ result, onSave, onRetake, onClose }) {
  const typeData = TYPES[result.type]
  const wingData = TYPES[result.wing]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={S.sectionLabel}>Quiz Result</div>
        <div style={S.title}>{'\u2B21'} Enneagram</div>
      </div>

      <div style={{ ...S.glass, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={S.resultType}>{result.wingLabel}</div>
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: 13, letterSpacing: '.12em',
          color: 'var(--foreground)',
        }}>{typeData.name}</div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          Wing {result.wing}: {wingData.name}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          ['Core', typeData.core],
          ['Fear', typeData.fear],
          ['Desire', typeData.desire],
        ].map(([lbl, val]) => (
          <div key={lbl} style={S.keyVal}>
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em',
              textTransform: 'uppercase', color: 'var(--muted-foreground)', minWidth: 70,
            }}>{lbl}</span>
            <span style={{ ...S.mono, color: 'var(--foreground)' }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Score breakdown */}
      <div>
        <div style={S.sectionLabel}>Score Breakdown</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {result.ranked.slice(0, 5).map(({ type, score }, i) => {
            const maxScore = result.ranked[0].score || 1
            return (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontFamily: "'Cinzel', serif", fontSize: 13, color: i === 0 ? 'var(--foreground)' : 'var(--muted-foreground)',
                  minWidth: 20, textAlign: 'right',
                }}>{type}</span>
                <div style={{
                  flex: 1, height: 6, borderRadius: 3,
                  background: 'rgba(255,255,255,.05)', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${(score / maxScore) * 100}%`,
                    background: i === 0 ? 'var(--foreground)' : 'rgba(201,168,76,.25)',
                    transition: 'width .6s ease',
                  }} />
                </div>
                <span style={{ ...S.mono, fontSize: 10, color: 'var(--muted-foreground)', minWidth: 26 }}>
                  {score}pts
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.6 }}>
        This is a brief self-assessment indicator. For deeper accuracy, read the full type descriptions
        and reflect on which core fear resonates most.
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div onClick={onSave} style={S.btn(true)}>Save to Profile</div>
        <div onClick={onRetake} style={S.btn(false)}>Retake Quiz</div>
        <div onClick={onClose} style={S.btn(false)}>Close</div>
      </div>
    </div>
  )
}

/* ── Main quiz component ─────────────────────────────────── */
export default function EnneagramQuiz({ onClose }) {
  const setPrimaryProfile = useGolemStore((s) => s.setPrimaryProfile)

  const [step, setStep] = useState(0)
  const [ratings, setRatings] = useState({}) // index → 0|1|2
  const [result, setResult] = useState(null)
  const [saved, setSaved] = useState(false)

  const current = QUESTIONS[step]
  const totalSteps = QUESTIONS.length
  const currentRating = ratings[step]

  function rate(value) {
    setRatings((prev) => ({ ...prev, [step]: value }))
  }

  function goNext() {
    if (currentRating === undefined) return
    if (step < totalSteps - 1) {
      setStep(step + 1)
    } else {
      // Tally scores
      const scores = {}
      QUESTIONS.forEach((q, i) => {
        const r = ratings[i] ?? 0
        q.types.forEach((t) => {
          scores[t] = (scores[t] || 0) + r
        })
      })
      setResult(tallyResults(scores))
    }
  }

  function goPrev() {
    if (step > 0) setStep(step - 1)
  }

  function handleSave() {
    if (!result) return
    setPrimaryProfile({ enneagramType: result.type, enneagramWing: result.wing })
    setSaved(true)
  }

  function handleRetake() {
    setStep(0)
    setRatings({})
    setResult(null)
    setSaved(false)
  }

  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={S.modal}>
        {result ? (
          <QuizResult
            result={result}
            onSave={handleSave}
            onRetake={handleRetake}
            onClose={onClose}
          />
        ) : (
          <>
            {/* Header */}
            <div>
              <div style={S.sectionLabel}>Enneagram Self-Assessment</div>
              <div style={S.title}>{'\u2B21'} Discover Your Type</div>
              <div style={{ ...S.subtitle, marginTop: 6 }}>
                Rate each statement honestly. How much does it describe you?
              </div>
            </div>

            {/* Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ ...S.sectionLabel, marginBottom: 0 }}>Progress</span>
                <span style={{ fontFamily: "'Inconsolata', monospace", fontSize: 10, color: 'var(--muted-foreground)' }}>
                  {step + 1} / {totalSteps}
                </span>
              </div>
              <div style={S.progress}>
                <div style={S.progressFill((step + 1) / totalSteps)} />
              </div>
            </div>

            {/* Question */}
            <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={S.question}>{current.q}</div>
              <div style={S.ratingRow}>
                {[
                  { label: 'Not me', sub: '0', val: 0 },
                  { label: 'Somewhat', sub: '1', val: 1 },
                  { label: 'Definitely me', sub: '2', val: 2 },
                ].map(({ label, _sub, val }) => (
                  <div
                    key={val}
                    onClick={() => rate(val)}
                    style={S.ratingBtn(currentRating === val)}
                  >
                    <div>{label}</div>
                    <div style={{ fontSize: 16, marginTop: 2, color: currentRating === val ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                      {val === 0 ? '○' : val === 1 ? '◑' : '●'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                onClick={goPrev}
                style={{ ...S.btn(false), opacity: step === 0 ? 0.3 : 1, pointerEvents: step === 0 ? 'none' : 'auto' }}
              >
                ← Back
              </div>
              <div
                onClick={goNext}
                style={{
                  ...S.btn(true),
                  opacity: currentRating === undefined ? 0.4 : 1,
                  pointerEvents: currentRating === undefined ? 'none' : 'auto',
                }}
              >
                {step === totalSteps - 1 ? 'See Results →' : 'Next →'}
              </div>
            </div>

            {/* Close */}
            <div style={{ textAlign: 'center' }}>
              <span
                onClick={onClose}
                style={{ fontSize: 11, color: 'var(--muted-foreground)', cursor: 'pointer', fontStyle: 'italic' }}
              >
                Close quiz
              </span>
            </div>
          </>
        )}

        {saved && (
          <div style={{
            padding: '10px 16px', borderRadius: 10,
            background: 'rgba(96,200,80,.08)', border: '1px solid rgba(96,200,80,.2)',
            fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.1em',
            color: '#88dd44', textAlign: 'center',
          }}>
            ✓ Saved to your profile
          </div>
        )}
      </div>
    </div>
  )
}
