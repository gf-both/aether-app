/**
 * MBTIQuiz.jsx — standalone modal quiz overlay
 * 20 questions across 4 dichotomies (E/I, N/S, T/F, J/P)
 * Saves result to Zustand store via setMbtiType
 */
import { useState } from 'react'
import { useGolemStore } from '../../store/useGolemStore'

/* ── Data ────────────────────────────────────────────────── */
const QUESTIONS = [
  // E/I
  { q: 'At parties, you:', a: 'Interact with many, including strangers', b: 'Interact with a few people you know well', dim: 'EI', aScore: 'E', bScore: 'I' },
  { q: 'You prefer to:', a: 'Work in a team', b: 'Work alone', dim: 'EI', aScore: 'E', bScore: 'I' },
  { q: 'Social interactions:', a: 'Energize you', b: 'Drain you', dim: 'EI', aScore: 'E', bScore: 'I' },
  { q: "You're seen as:", a: 'Easy to get to know', b: 'Private and reserved', dim: 'EI', aScore: 'E', bScore: 'I' },
  { q: 'You prefer:', a: 'Many friends with broad interests', b: 'A few close friends with deep interests', dim: 'EI', aScore: 'E', bScore: 'I' },
  // N/S
  { q: 'You trust more:', a: 'Your imagination and hunches', b: 'Your direct experience and facts', dim: 'NS', aScore: 'N', bScore: 'S' },
  { q: "You're more interested in:", a: 'The big picture and possibilities', b: 'Concrete details and practicalities', dim: 'NS', aScore: 'N', bScore: 'S' },
  { q: 'You tend to:', a: 'Think about the future', b: 'Focus on the present', dim: 'NS', aScore: 'N', bScore: 'S' },
  { q: 'You prefer work that is:', a: 'Creative and varied', b: 'Practical and predictable', dim: 'NS', aScore: 'N', bScore: 'S' },
  { q: "You're drawn to:", a: 'Theories and concepts', b: 'Facts and applications', dim: 'NS', aScore: 'N', bScore: 'S' },
  // T/F
  { q: 'Decisions feel better when based on:', a: 'Logic and analysis', b: 'Personal values and impact on people', dim: 'TF', aScore: 'T', bScore: 'F' },
  { q: 'In conflicts, you prioritize:', a: 'Being right', b: 'Being kind', dim: 'TF', aScore: 'T', bScore: 'F' },
  { q: "You're more persuaded by:", a: 'A well-reasoned argument', b: 'An emotional appeal', dim: 'TF', aScore: 'T', bScore: 'F' },
  { q: 'At work you value:', a: 'Fairness and consistency', b: 'Harmony and support', dim: 'TF', aScore: 'T', bScore: 'F' },
  { q: "You're seen as:", a: 'Analytical and objective', b: 'Warm and empathetic', dim: 'TF', aScore: 'T', bScore: 'F' },
  // J/P
  { q: 'You prefer:', a: 'A settled, decided approach', b: 'A flexible, spontaneous approach', dim: 'JP', aScore: 'J', bScore: 'P' },
  { q: 'Plans and structure:', a: 'Give you peace of mind', b: 'Feel restrictive', dim: 'JP', aScore: 'J', bScore: 'P' },
  { q: 'Deadlines:', a: 'Are respected and planned for', b: 'Are motivating at the last minute', dim: 'JP', aScore: 'J', bScore: 'P' },
  { q: 'You feel better after:', a: 'Making a decision', b: 'Keeping your options open', dim: 'JP', aScore: 'J', bScore: 'P' },
  { q: 'Your desk/space is typically:', a: 'Organized and tidy', b: 'Piled but you know where things are', dim: 'JP', aScore: 'J', bScore: 'P' },
]

const MBTI_TYPES = {
  INTJ: { name: 'The Architect',     desc: 'Strategic, independent, decisive, private' },
  INTP: { name: 'The Logician',      desc: 'Innovative, curious, flexible, logical' },
  ENTJ: { name: 'The Commander',     desc: 'Bold, strategic, natural leader' },
  ENTP: { name: 'The Debater',       desc: 'Smart, curious, loves intellectual challenges' },
  INFJ: { name: 'The Advocate',      desc: 'Insightful, principled, compassionate, private' },
  INFP: { name: 'The Mediator',      desc: 'Poetic, kind, idealistic, altruistic' },
  ENFJ: { name: 'The Protagonist',   desc: 'Charismatic, inspiring, natural teacher' },
  ENFP: { name: 'The Campaigner',    desc: 'Enthusiastic, creative, sociable, free-spirited' },
  ISTJ: { name: 'The Logistician',   desc: 'Practical, reliable, dutiful, reserved' },
  ISFJ: { name: 'The Defender',      desc: 'Warm, dedicated, reliable, patient' },
  ESTJ: { name: 'The Executive',     desc: 'Organized, loyal, practical manager' },
  ESFJ: { name: 'The Consul',        desc: 'Caring, social, popular, traditional' },
  ISTP: { name: 'The Virtuoso',      desc: 'Bold, practical, experimental, mechanic' },
  ISFP: { name: 'The Adventurer',    desc: 'Flexible, charming, artist, explorer' },
  ESTP: { name: 'The Entrepreneur',  desc: 'Smart, energetic, perceptive, tactical' },
  ESFP: { name: 'The Entertainer',   desc: 'Spontaneous, energetic, entertaining' },
}

const DIM_LABELS = {
  EI: 'Energy',
  NS: 'Perception',
  TF: 'Judgment',
  JP: 'Lifestyle',
}

function calcType(answers) {
  const scores = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 }
  QUESTIONS.forEach((q, i) => {
    const pick = answers[i]
    if (pick === 'A') scores[q.aScore]++
    else if (pick === 'B') scores[q.bScore]++
  })
  return {
    code:
      (scores.E >= scores.I ? 'E' : 'I') +
      (scores.N >= scores.S ? 'N' : 'S') +
      (scores.T >= scores.F ? 'T' : 'F') +
      (scores.J >= scores.P ? 'J' : 'P'),
    scores,
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
  glass: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 13, padding: 18, backdropFilter: 'blur(12px)',
  },
  question: {
    fontSize: 15, lineHeight: 1.65, color: 'var(--foreground)', fontWeight: 500,
  },
  optBtn: (active) => ({
    flex: 1, padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
    fontFamily: "'Cormorant Garamond', serif", fontSize: 13, lineHeight: 1.5,
    textAlign: 'left',
    background: active ? 'rgba(201,168,76,.14)' : 'var(--secondary)',
    border: `1px solid ${active ? 'rgba(201,168,76,.4)' : 'rgba(255,255,255,.07)'}`,
    color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
    transition: 'all .18s',
    display: 'flex', alignItems: 'flex-start', gap: 10,
  }),
  btn: (primary) => ({
    padding: primary ? '11px 28px' : '9px 22px',
    borderRadius: 10, cursor: 'pointer',
    fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: '.12em',
    background: primary ? '#b8860b' : '#1a1a2e',
    border: `2px solid ${primary ? '#d4a017' : '#444'}`,
    color: primary ? '#fff' : '#999',
    transition: 'all .18s',
    boxShadow: primary ? '0 0 16px rgba(201,168,76,.35)' : 'none',
  }),
  resultCode: {
    fontFamily: "'Cinzel', serif", fontSize: 36, letterSpacing: '.2em',
    color: 'var(--foreground)', textAlign: 'center',
  },
  resultName: {
    fontFamily: "'Cinzel', serif", fontSize: 14, letterSpacing: '.1em',
    color: 'var(--foreground)', textAlign: 'center',
  },
  barTrack: {
    flex: 1, height: 8, borderRadius: 4,
    background: 'rgba(255,255,255,.05)', overflow: 'hidden',
  },
  barFill: (pct, primary) => ({
    height: '100%', borderRadius: 4,
    width: `${pct * 100}%`,
    background: primary ? 'var(--foreground)' : 'rgba(201,168,76,.3)',
    transition: 'width .6s ease',
  }),
  mono: {
    fontFamily: "'Inconsolata', monospace", fontSize: 12, color: 'var(--muted-foreground)',
  },
}

/* ── Result screen ───────────────────────────────────────── */
function QuizResult({ code, scores, onSave, onRetake, onClose }) {
  const typeData = MBTI_TYPES[code] || { name: code, desc: '' }

  const dims = [
    { a: 'E', b: 'I', label: 'Energy' },
    { a: 'N', b: 'S', label: 'Perception' },
    { a: 'T', b: 'F', label: 'Judgment' },
    { a: 'J', b: 'P', label: 'Lifestyle' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={S.sectionLabel}>Quiz Result</div>
        <div style={S.title}>{'\u29C9'} MBTI</div>
      </div>

      <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={S.resultCode}>{code}</div>
        <div style={S.resultName}>{typeData.name}</div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic', textAlign: 'center' }}>
          {typeData.desc}
        </div>
      </div>

      {/* Dimension bars */}
      <div>
        <div style={S.sectionLabel}>Dimension Scores</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dims.map(({ a, b, label }) => {
            const scoreA = scores[a] || 0
            const scoreB = scores[b] || 0
            const total = scoreA + scoreB || 1
            const winner = scoreA >= scoreB ? a : b
            return (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>{label}</span>
                  <span style={{ ...S.mono, fontSize: 10, color: 'var(--foreground)' }}>{winner} ({Math.max(scoreA, scoreB)}/{total})</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ ...S.mono, fontSize: 11, color: scoreA >= scoreB ? 'var(--foreground)' : 'var(--muted-foreground)', minWidth: 12, textAlign: 'center' }}>{a}</span>
                  <div style={S.barTrack}>
                    <div style={S.barFill(scoreA / total, scoreA >= scoreB)} />
                  </div>
                  <div style={S.barTrack}>
                    <div style={{ ...S.barFill(scoreB / total, scoreB > scoreA), transform: 'scaleX(-1)', transformOrigin: 'right' }} />
                  </div>
                  <span style={{ ...S.mono, fontSize: 11, color: scoreB > scoreA ? 'var(--foreground)' : 'var(--muted-foreground)', minWidth: 12, textAlign: 'center' }}>{b}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.6 }}>
        This is a simplified self-report indicator. For deeper cognitive analysis, explore the full
        function stack in the MBTI detail view after saving.
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
export default function MBTIQuiz({ onClose }) {
  const setPrimaryProfile = useGolemStore((s) => s.setPrimaryProfile)

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [saved, setSaved] = useState(false)

  const current = QUESTIONS[step]
  const totalSteps = QUESTIONS.length
  const currentAnswer = answers[step]

  function pick(choice) {
    setAnswers((prev) => ({ ...prev, [step]: choice }))
  }

  function goNext() {
    if (currentAnswer === undefined) return
    if (step < totalSteps - 1) {
      setStep(step + 1)
    } else {
      const merged = { ...answers }
      setResult(calcType(merged))
    }
  }

  function goPrev() {
    if (step > 0) setStep(step - 1)
  }

  function handleSave() {
    if (!result) return
    setPrimaryProfile({ mbtiType: result.code })
    setSaved(true)
  }

  function handleRetake() {
    setStep(0)
    setAnswers({})
    setResult(null)
    setSaved(false)
  }

  const dimLabel = DIM_LABELS[current?.dim] || current?.dim

  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={S.modal}>
        {result ? (
          <QuizResult
            code={result.code}
            scores={result.scores}
            onSave={handleSave}
            onRetake={handleRetake}
            onClose={onClose}
          />
        ) : (
          <>
            {/* Header */}
            <div>
              <div style={S.sectionLabel}>MBTI Self-Assessment</div>
              <div style={S.title}>{'\u29C9'} Discover Your Type</div>
              <div style={{ ...S.subtitle, marginTop: 6 }}>
                Choose the option that feels most natural. There are no right answers.
              </div>
            </div>

            {/* Progress dots */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ ...S.sectionLabel, marginBottom: 0 }}>
                  {dimLabel}
                </span>
                <span style={{ fontFamily: "'Inconsolata', monospace", fontSize: 10, color: 'var(--muted-foreground)' }}>
                  {step + 1} / {totalSteps}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 3, height: 4, borderRadius: 2, overflow: 'hidden' }}>
                {QUESTIONS.map((_, i) => (
                  <div key={i} style={{
                    flex: 1, borderRadius: 2,
                    background: i < step
                      ? 'var(--ring)'
                      : i === step
                        ? 'var(--foreground)'
                        : 'var(--border)',
                    transition: 'background .3s',
                  }} />
                ))}
              </div>
            </div>

            {/* Question */}
            <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={S.question}>{current.q}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'A', text: current.a, letter: current.aScore },
                  { key: 'B', text: current.b, letter: current.bScore },
                ].map(({ key, text, _letter }) => (
                  <div
                    key={key}
                    onClick={() => pick(key)}
                    style={S.optBtn(currentAnswer === key)}
                  >
                    <span style={{
                      fontFamily: "'Cinzel', serif", fontSize: 14,
                      color: currentAnswer === key ? 'var(--foreground)' : 'var(--ring)',
                      width: 22, height: 22, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${currentAnswer === key ? 'var(--ring)' : 'rgba(255,255,255,.1)'}`,
                      flexShrink: 0, marginTop: 2,
                    }}>{key}</span>
                    <span>{text}</span>
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
                  opacity: currentAnswer === undefined ? 0.4 : 1,
                  pointerEvents: currentAnswer === undefined ? 'none' : 'auto',
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
