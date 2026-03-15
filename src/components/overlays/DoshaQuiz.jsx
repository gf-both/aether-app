import { useState } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { DOSHA_QUESTIONS, getDoshaProfile } from '../../engines/doshaEngine'

const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(14px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24,
  },
  panel: {
    background: 'var(--glass-bg, rgba(5,5,26,.92))',
    border: '1px solid rgba(201,168,76,.18)',
    borderRadius: 18, padding: '32px 36px',
    width: '100%', maxWidth: 560, maxHeight: '90vh',
    overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 24,
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    color: 'var(--text, #e8e0d0)',
  },
  heading: {
    fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 600,
    letterSpacing: '.18em', color: 'var(--gold, #c9a84c)',
  },
  sub: {
    fontSize: 13, color: 'var(--text2, #b09070)', fontStyle: 'italic', lineHeight: 1.5,
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: 'var(--gold3, #a08040)',
    paddingBottom: 8, borderBottom: '1px solid rgba(201,168,76,.1)',
  },
  question: {
    fontFamily: "'Cormorant Garamond', serif", fontSize: 17, lineHeight: 1.6,
    color: 'var(--text, #e8e0d0)',
  },
  optBtn: (selected) => ({
    display: 'flex', alignItems: 'flex-start', gap: 14,
    padding: '16px 20px', borderRadius: 12, cursor: 'pointer',
    background: selected ? 'rgba(201,168,76,.1)' : 'rgba(5,5,26,.7)',
    border: `1px solid ${selected ? 'rgba(201,168,76,.4)' : 'rgba(201,168,76,.12)'}`,
    transition: 'all .2s',
  }),
  optLabel: (selected) => ({
    fontFamily: "'Cinzel', serif", fontSize: 14, color: 'var(--gold, #c9a84c)',
    width: 28, height: 28, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: selected ? 'rgba(201,168,76,.2)' : 'rgba(201,168,76,.06)',
    border: '1px solid rgba(201,168,76,.2)', flexShrink: 0,
  }),
  counter: {
    fontFamily: "'Inconsolata', monospace", fontSize: 11,
    color: 'var(--text3, #706050)', letterSpacing: '.1em',
  },
  progressWrap: { display: 'flex', gap: 3, height: 4, borderRadius: 2, overflow: 'hidden' },
  closeBtn: {
    alignSelf: 'flex-end', fontFamily: "'Cinzel', serif", fontSize: 9,
    letterSpacing: '.2em', textTransform: 'uppercase',
    color: 'var(--text3, #706050)', cursor: 'pointer',
    padding: '6px 16px', borderRadius: 20,
    border: '1px solid rgba(255,255,255,.08)',
    background: 'none',
  },
  nextBtn: {
    fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.18em',
    textTransform: 'uppercase', color: 'var(--gold, #c9a84c)', cursor: 'pointer',
    padding: '10px 28px', borderRadius: 20, alignSelf: 'flex-end',
    border: '1px solid rgba(201,168,76,.3)',
    background: 'rgba(201,168,76,.06)',
    transition: 'all .2s',
  },
}

const DOSHA_COLORS = {
  vata:  { color: '#6699ee', bg: 'rgba(102,153,238,.08)', border: 'rgba(102,153,238,.25)' },
  pitta: { color: '#ee6644', bg: 'rgba(238,102,68,.08)',  border: 'rgba(238,102,68,.25)'  },
  kapha: { color: '#44cc88', bg: 'rgba(68,204,136,.08)',  border: 'rgba(68,204,136,.25)'  },
}

export default function DoshaQuiz({ onClose }) {
  const setDoshaType = useAboveInsideStore(s => s.setDoshaType)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)

  const q = DOSHA_QUESTIONS[step]
  const total = DOSHA_QUESTIONS.length

  function handleSelect(dosha) {
    setSelected(dosha)
  }

  function handleNext() {
    if (!selected) return
    const next = [...answers, selected]
    setAnswers(next)
    setSelected(null)
    if (next.length >= total) {
      const profile = getDoshaProfile(next)
      setResult(profile)
      setDoshaType(profile.constitution)
    } else {
      setStep(step + 1)
    }
  }

  function handleRetake() {
    setStep(0); setAnswers([]); setSelected(null); setResult(null)
  }

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div style={S.panel}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={S.heading}>☯ Ayurvedic Dosha</div>
            <div style={S.sub}>Discover your mind-body constitution</div>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕ Close</button>
        </div>

        {result ? (
          /* ── Results ── */
          <>
            <div style={S.sectionTitle}>Your Constitution</div>
            <div style={{
              background: DOSHA_COLORS[result.primary.name.toLowerCase()]?.bg || 'rgba(201,168,76,.06)',
              border: `1px solid ${DOSHA_COLORS[result.primary.name.toLowerCase()]?.border || 'rgba(201,168,76,.2)'}`,
              borderRadius: 13, padding: 20, textAlign: 'center',
            }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 28, letterSpacing: '.15em',
                color: DOSHA_COLORS[result.primary.name.toLowerCase()]?.color || 'var(--gold)',
              }}>
                {result.constitution}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic', marginTop: 8 }}>
                {result.primary.elements} · {result.primary.season}
              </div>
            </div>

            {/* Score bars */}
            <div style={S.sectionTitle}>Dosha Breakdown</div>
            {(['vata','pitta','kapha']).map(d => (
              <div key={d} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.1em',
                    color: DOSHA_COLORS[d].color,
                  }}>{d.charAt(0).toUpperCase()+d.slice(1)}</span>
                  <span style={{ fontFamily: "'Inconsolata', monospace", fontSize: 12, color: 'var(--text3)' }}>
                    {result.scores[d]}%
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.04)' }}>
                  <div style={{
                    height: '100%', borderRadius: 3, width: result.scores[d] + '%',
                    background: DOSHA_COLORS[d].color, transition: 'width .6s ease',
                  }} />
                </div>
              </div>
            ))}

            <div style={S.sectionTitle}>Primary: {result.primary.name}</div>
            <div style={{
              fontSize: 14, lineHeight: 1.7, color: 'var(--text2)', fontStyle: 'italic',
              padding: '14px 18px', borderRadius: 10,
              background: 'rgba(201,168,76,.03)', border: '1px solid rgba(201,168,76,.08)',
            }}>
              {result.primary.description}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button style={S.closeBtn} onClick={handleRetake}>Retake</button>
              <button style={S.nextBtn} onClick={onClose}>Done</button>
            </div>
          </>
        ) : (
          /* ── Quiz ── */
          <>
            {/* Progress */}
            <div style={S.progressWrap}>
              {DOSHA_QUESTIONS.map((_, i) => (
                <div key={i} style={{
                  flex: 1, borderRadius: 2,
                  background: i < step ? 'rgba(201,168,76,.5)' : i === step ? 'rgba(201,168,76,.3)' : 'rgba(255,255,255,.06)',
                }} />
              ))}
            </div>

            <div style={S.counter}>QUESTION {step + 1} OF {total}</div>
            <div style={S.question}>{q.q}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.options.map((opt, i) => {
                const doshaKey = Object.keys(opt.dosha)[0]
                const isSelected = selected === opt.dosha
                return (
                  <div
                    key={i}
                    style={S.optBtn(isSelected)}
                    onClick={() => handleSelect(opt.dosha)}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor='rgba(201,168,76,.3)'; e.currentTarget.style.background='rgba(201,168,76,.05)' }}}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor='rgba(201,168,76,.12)'; e.currentTarget.style.background='rgba(5,5,26,.7)' }}}
                  >
                    <span style={S.optLabel(isSelected)}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <div style={{ flex: 1, fontSize: 14, lineHeight: 1.6, color: 'var(--text2)' }}>
                      {opt.text}
                    </div>
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
