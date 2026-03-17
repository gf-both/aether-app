import { useState } from 'react'
import { useGolemStore } from '../../store/useGolemStore'
import { getArchetypeQuestions, getArchetypeProfile, ARCHETYPES } from '../../engines/archetypeEngine'

const QUESTIONS = getArchetypeQuestions()

const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(14px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24,
  },
  panel: {
    background: 'var(--glass-bg, rgba(5,5,26,.92))',
    border: '1px solid rgba(144,80,224,.18)',
    borderRadius: 18, padding: '32px 36px',
    width: '100%', maxWidth: 620, maxHeight: '90vh',
    overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 24,
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    color: 'var(--text, #e8e0d0)',
  },
  heading: {
    fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 600,
    letterSpacing: '.18em', color: '#a878e8',
  },
  sub: { fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.5 },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: '#a878e8',
    paddingBottom: 8, borderBottom: '1px solid rgba(144,80,224,.15)',
  },
  question: {
    fontFamily: "'Cormorant Garamond', serif", fontSize: 17, lineHeight: 1.6, color: 'var(--foreground)',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 },
  optBtn: (selected) => ({
    padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
    background: selected ? 'rgba(144,80,224,.12)' : 'rgba(5,5,26,.7)',
    border: `1px solid ${selected ? 'rgba(144,80,224,.4)' : 'rgba(144,80,224,.1)'}`,
    transition: 'all .2s', textAlign: 'left',
  }),
  closeBtn: {
    alignSelf: 'flex-end', fontFamily: "'Cinzel', serif", fontSize: 9,
    letterSpacing: '.2em', textTransform: 'uppercase',
    color: 'var(--muted-foreground)', cursor: 'pointer',
    padding: '6px 16px', borderRadius: 20,
    border: '1px solid rgba(255,255,255,.08)', background: 'none',
  },
  nextBtn: {
    fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.18em',
    textTransform: 'uppercase', color: '#a878e8', cursor: 'pointer',
    padding: '10px 28px', borderRadius: 20, alignSelf: 'flex-end',
    border: '1px solid rgba(144,80,224,.3)', background: 'rgba(144,80,224,.06)',
    transition: 'all .2s',
  },
  counter: {
    fontFamily: "'Inconsolata', monospace", fontSize: 11,
    color: 'var(--muted-foreground)', letterSpacing: '.1em',
  },
  progressWrap: { display: 'flex', gap: 4, height: 4, borderRadius: 2, overflow: 'hidden' },
}

export default function ArchetypeQuiz({ onClose }) {
  const setArchetypeType = useGolemStore(s => s.setArchetypeType)
  const [step, setStep] = useState(0)
  const [selections, setSelections] = useState([])
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)

  const q = QUESTIONS[step]
  const total = QUESTIONS.length

  function handleSelect(archetype) {
    setSelected(archetype)
  }

  function handleNext() {
    if (!selected) return
    const next = [...selections, selected]
    setSelections(next)
    setSelected(null)
    if (next.length >= total) {
      const profile = getArchetypeProfile(next)
      setResult(profile)
      setArchetypeType(profile.name)
    } else {
      setStep(step + 1)
    }
  }

  function handleRetake() {
    setStep(0); setSelections([]); setSelected(null); setResult(null)
  }

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div style={S.panel}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={S.heading}>⬡ Archetype Assessment</div>
            <div style={S.sub}>Discover your Jungian archetypal pattern</div>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕ Close</button>
        </div>

        {result ? (
          /* ── Results ── */
          <>
            <div style={S.sectionTitle}>Your Primary Archetype</div>
            <div style={{
              borderRadius: 13, padding: 24, textAlign: 'center',
              background: 'rgba(144,80,224,.08)', border: '1px solid rgba(144,80,224,.25)',
            }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 28, letterSpacing: '.12em', color: '#a878e8',
              }}>
                {result.name}
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'Drive', value: result.drive },
                  { label: 'Fear', value: result.fear },
                  { label: 'Gift', value: result.gift },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    background: 'rgba(144,80,224,.06)', border: '1px solid rgba(144,80,224,.15)',
                    borderRadius: 10, padding: '10px 16px', minWidth: 100,
                  }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', color: 'rgba(168,120,232,.6)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 16, padding: '10px 16px', borderRadius: 10,
                background: 'rgba(255,100,100,.04)', border: '1px solid rgba(255,100,100,.1)',
                display: 'inline-block',
              }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.15em', color: 'rgba(255,150,120,.6)', textTransform: 'uppercase' }}>Shadow · </span>
                <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{result.shadow}</span>
              </div>
            </div>

            {/* All 12 archetypes */}
            <div style={S.sectionTitle}>The 12 Archetypes</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {ARCHETYPES.map((a, i) => (
                <div key={i} style={{
                  padding: '8px 10px', borderRadius: 8, textAlign: 'center',
                  background: a.name === result.name ? 'rgba(144,80,224,.1)' : 'rgba(255,255,255,.015)',
                  border: `1px solid ${a.name === result.name ? 'rgba(144,80,224,.35)' : 'var(--secondary)'}`,
                }}>
                  <div style={{
                    fontFamily: "'Cinzel', serif", fontSize: 9,
                    color: a.name === result.name ? '#a878e8' : 'var(--muted-foreground)',
                    fontWeight: a.name === result.name ? 700 : 400,
                  }}>{a.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--muted-foreground)', fontStyle: 'italic', marginTop: 2 }}>{a.drive}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button style={S.closeBtn} onClick={handleRetake}>Retake</button>
              <button style={{ ...S.nextBtn }} onClick={onClose}>Done</button>
            </div>
          </>
        ) : (
          /* ── Quiz ── */
          <>
            {/* Progress */}
            <div style={S.progressWrap}>
              {QUESTIONS.map((_, i) => (
                <div key={i} style={{
                  flex: 1, borderRadius: 2,
                  background: i < step ? 'rgba(144,80,224,.5)' : i === step ? 'rgba(144,80,224,.3)' : 'var(--border)',
                }} />
              ))}
            </div>

            <div style={S.counter}>QUESTION {step + 1} OF {total}</div>
            <div style={S.question}>{q.q}</div>

            <div style={S.grid}>
              {q.options.map((opt, i) => {
                const isSelected = selected === opt.archetype
                return (
                  <div
                    key={i}
                    style={S.optBtn(isSelected)}
                    onClick={() => handleSelect(opt.archetype)}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor='rgba(144,80,224,.3)'; e.currentTarget.style.background='rgba(144,80,224,.06)' }}}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor='rgba(144,80,224,.1)'; e.currentTarget.style.background='rgba(5,5,26,.7)' }}}
                  >
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.1em', color: '#a878e8', marginBottom: 4 }}>
                      {ARCHETYPES[i]?.name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{opt.text}</div>
                  </div>
                )
              })}
            </div>

            <button
              style={{ ...S.nextBtn, opacity: selected ? 1 : 0.4, cursor: selected ? 'pointer' : 'default' }}
              onClick={handleNext}
              disabled={!selected}
            >
              {step < total - 1 ? 'Next →' : 'See Results'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
