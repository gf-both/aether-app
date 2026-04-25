import { useState } from 'react'
import { useGolemStore } from '../../store/useGolemStore'
import { LOVE_LANG_QUESTIONS, LOVE_LANGUAGES, getLoveLanguageProfile } from '../../engines/loveLangEngine'

const LANG_COLORS = {
  words: { color: '#f0c040', bg: 'rgba(240,192,64,.08)',  border: 'rgba(240,192,64,.25)'  },
  acts:  { color: '#44ccaa', bg: 'rgba(68,204,170,.08)',  border: 'rgba(68,204,170,.25)'  },
  gifts: { color: '#dd88cc', bg: 'rgba(221,136,204,.08)', border: 'rgba(221,136,204,.25)' },
  time:  { color: '#88aaee', bg: 'rgba(136,170,238,.08)', border: 'rgba(136,170,238,.25)' },
  touch: { color: '#ee8866', bg: 'rgba(238,136,102,.08)', border: 'rgba(238,136,102,.25)' },
}

const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(14px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24,
  },
  panel: {
    background: 'var(--glass-bg, rgba(5,5,26,.92))',
    border: '1px solid rgba(238,136,102,.18)',
    borderRadius: 18, padding: '32px 36px',
    width: '100%', maxWidth: 540, maxHeight: '90vh',
    overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 24,
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    color: 'var(--text, #e8e0d0)',
  },
  heading: {
    fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 600,
    letterSpacing: '.18em', color: '#ee8866',
  },
  sub: { fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.5 },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: '#ee8866',
    paddingBottom: 8, borderBottom: '1px solid rgba(238,136,102,.15)',
  },
  question: {
    fontFamily: "'Cormorant Garamond', serif", fontSize: 16, lineHeight: 1.6,
    color: 'var(--foreground)', textAlign: 'center', fontStyle: 'italic',
  },
  optBtn: (selected) => ({
    flex: 1, padding: '18px 20px', borderRadius: 12, cursor: 'pointer',
    background: selected ? 'rgba(238,136,102,.1)' : 'rgba(5,5,26,.7)',
    border: `1px solid ${selected ? 'rgba(238,136,102,.4)' : 'rgba(238,136,102,.1)'}`,
    transition: 'all .2s', textAlign: 'center',
  }),
  counter: {
    fontFamily: "'Inconsolata', monospace", fontSize: 11,
    color: 'var(--muted-foreground)', letterSpacing: '.1em', textAlign: 'center',
  },
  progressWrap: { display: 'flex', gap: 3, height: 4, borderRadius: 2, overflow: 'hidden' },
  closeBtn: {
    alignSelf: 'flex-end', fontFamily: "'Cinzel', serif", fontSize: 10,
    fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase',
    color: '#999', cursor: 'pointer',
    padding: '8px 18px', borderRadius: 20,
    border: '2px solid #444', background: '#1a1a2e',
  },
  doneBtn: {
    fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, letterSpacing: '.18em',
    textTransform: 'uppercase', color: '#fff', cursor: 'pointer',
    padding: '10px 28px', borderRadius: 20, alignSelf: 'flex-end',
    border: '2px solid #ee8866', background: '#c05530',
    boxShadow: '0 0 16px rgba(238,136,102,.35)',
    transition: 'all .2s',
  },
}

export default function LoveLangQuiz({ onClose }) {
  const setLoveLanguage = useGolemStore(s => s.setLoveLanguage)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(null)

  const q = LOVE_LANG_QUESTIONS[step]
  const total = LOVE_LANG_QUESTIONS.length

  function handleChoice(lang) {
    const next = [...answers, lang]
    setAnswers(next)
    if (next.length >= total) {
      const profile = getLoveLanguageProfile(next)
      setResult(profile)
      setLoveLanguage(profile.primary?.name || profile.primary?.id)
    } else {
      setStep(step + 1)
    }
  }

  function handleRetake() {
    setStep(0); setAnswers([]); setResult(null)
  }

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div style={S.panel}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={S.heading}>🤗 Love Languages</div>
            <div style={S.sub}>Choose the option that resonates most</div>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕ Close</button>
        </div>

        {result ? (
          /* ── Results ── */
          <>
            <div style={S.sectionTitle}>Your Primary Love Language</div>
            <div style={{
              borderRadius: 13, padding: 24, textAlign: 'center',
              background: LANG_COLORS[result.primary?.id]?.bg || 'rgba(238,136,102,.08)',
              border: `1px solid ${LANG_COLORS[result.primary?.id]?.border || 'rgba(238,136,102,.25)'}`,
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{result.primary?.emoji}</div>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 22, letterSpacing: '.1em',
                color: LANG_COLORS[result.primary?.id]?.color || '#ee8866',
              }}>
                {result.primary?.name}
              </div>
              <div style={{ fontSize: 14, color: 'var(--muted-foreground)', fontStyle: 'italic', marginTop: 8 }}>
                {result.primary?.desc}
              </div>
            </div>

            {result.secondary && (
              <>
                <div style={S.sectionTitle}>Secondary: {result.secondary?.name}</div>
                <div style={{
                  borderRadius: 10, padding: '12px 16px',
                  background: LANG_COLORS[result.secondary?.id]?.bg || 'var(--secondary)',
                  border: `1px solid ${LANG_COLORS[result.secondary?.id]?.border || 'rgba(255,255,255,.08)'}`,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <span style={{ fontSize: 24 }}>{result.secondary?.emoji}</span>
                  <div>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: LANG_COLORS[result.secondary?.id]?.color, letterSpacing: '.08em' }}>{result.secondary?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', marginTop: 2 }}>{result.secondary?.desc}</div>
                  </div>
                </div>
              </>
            )}

            {/* Score bars */}
            <div style={S.sectionTitle}>All Languages</div>
            {LOVE_LANGUAGES.map(lang => {
              const score = result.scores[lang.id] || 0
              const pct = Math.round(score / total * 100)
              return (
                <div key={lang.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: LANG_COLORS[lang.id].color }}>
                      {lang.emoji} {lang.name}
                    </span>
                    <span style={{ fontFamily: "'Inconsolata', monospace", fontSize: 11, color: 'var(--muted-foreground)' }}>
                      {score}/{total}
                    </span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--secondary)' }}>
                    <div style={{
                      height: '100%', borderRadius: 3, width: pct + '%',
                      background: LANG_COLORS[lang.id].color, transition: 'width .6s ease',
                    }} />
                  </div>
                </div>
              )
            })}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button style={S.closeBtn} onClick={handleRetake}>Retake</button>
              <button style={S.doneBtn} onClick={onClose}>Done</button>
            </div>
          </>
        ) : (
          /* ── Quiz — forced A/B ── */
          <>
            {/* Progress */}
            <div style={S.progressWrap}>
              {LOVE_LANG_QUESTIONS.map((_, i) => (
                <div key={i} style={{
                  flex: 1, borderRadius: 2,
                  background: i < step ? 'rgba(238,136,102,.5)' : i === step ? 'rgba(238,136,102,.3)' : 'var(--border)',
                }} />
              ))}
            </div>

            <div style={S.counter}>QUESTION {step + 1} OF {total}</div>
            <div style={S.question}>Which matters more to you?</div>

            {/* A/B choice */}
            <div style={{ display: 'flex', gap: 14, flexDirection: 'column' }}>
              {[q.a, q.b].map((opt, i) => (
                <div
                  key={i}
                  style={S.optBtn(false)}
                  onClick={() => handleChoice(opt.lang)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(238,136,102,.35)'; e.currentTarget.style.background='rgba(238,136,102,.07)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(238,136,102,.1)'; e.currentTarget.style.background='rgba(5,5,26,.7)' }}
                >
                  <div style={{
                    fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em',
                    color: LANG_COLORS[opt.lang]?.color, marginBottom: 6, textTransform: 'uppercase',
                  }}>
                    {LOVE_LANGUAGES.find(l => l.id === opt.lang)?.emoji}{' '}
                    {LOVE_LANGUAGES.find(l => l.id === opt.lang)?.name}
                  </div>
                  <div style={{ fontSize: 15, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{opt.text}</div>
                </div>
              ))}
            </div>

            <div style={{
              fontFamily: "'Inconsolata', monospace", fontSize: 10,
              color: 'var(--muted-foreground)', textAlign: 'center', letterSpacing: '.08em',
            }}>
              Click to choose — no next button needed
            </div>
          </>
        )}
      </div>
    </div>
  )
}
