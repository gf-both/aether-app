import { useState } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { LOVE_LANGUAGES } from '../../engines/loveLangEngine'
import LoveLangQuiz from '../overlays/LoveLangQuiz'

const LANG_COLORS = {
  words: { color: '#f0c040', bg: 'rgba(240,192,64,.08)',  border: 'rgba(240,192,64,.22)'  },
  acts:  { color: '#44ccaa', bg: 'rgba(68,204,170,.08)',  border: 'rgba(68,204,170,.22)'  },
  gifts: { color: '#dd88cc', bg: 'rgba(221,136,204,.08)', border: 'rgba(221,136,204,.22)' },
  time:  { color: '#88aaee', bg: 'rgba(136,170,238,.08)', border: 'rgba(136,170,238,.22)' },
  touch: { color: '#ee8866', bg: 'rgba(238,136,102,.08)', border: 'rgba(238,136,102,.22)' },
}

const S = {
  panel: {
    width: '100%', height: '100%', overflowY: 'auto', padding: '24px 28px',
    display: 'flex', flexDirection: 'column', gap: 28,
    background: 'var(--card)', color: 'var(--foreground)',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: '#ee8866', paddingBottom: 8,
    borderBottom: '1px solid rgba(238,136,102,.12)', marginBottom: 4,
  },
  heading: {
    fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 600, letterSpacing: '.18em',
    color: '#ee8866', marginBottom: 4,
  },
  glass: {
    background: 'var(--card)', border: '1px solid rgba(238,136,102,.18)',
    borderRadius: 13, padding: 18, backdropFilter: 'blur(12px)',
  },
  interpretation: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--muted-foreground)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'rgba(238,136,102,.03)', border: '1px solid rgba(238,136,102,.1)',
  },
  quizBtn: {
    fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.18em',
    textTransform: 'uppercase', color: '#ee8866', cursor: 'pointer',
    padding: '12px 28px', borderRadius: 20,
    border: '1px solid rgba(238,136,102,.3)',
    background: 'rgba(238,136,102,.06)',
    transition: 'all .2s', display: 'inline-block',
  },
}

export default function LoveLangDetail() {
  const loveLanguage = useAboveInsideStore(s => s.loveLanguage)
  const [showQuiz, setShowQuiz] = useState(false)

  // Match stored language name to LOVE_LANGUAGES data
  const primary = loveLanguage
    ? LOVE_LANGUAGES.find(l => l.name === loveLanguage || l.id === loveLanguage)
    : null

  return (
    <div style={S.panel}>
      {showQuiz && <LoveLangQuiz onClose={() => setShowQuiz(false)} />}

      {/* Header */}
      <div>
        <div style={S.heading}>🤗 Love Languages</div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          Gary Chapman's 5 Love Languages · How you give and receive love
        </div>
      </div>

      {primary ? (
        <>
          {/* Primary language */}
          <div>
            <div style={S.sectionTitle}>Your Love Language</div>
            <div style={{
              ...S.glass,
              borderColor: LANG_COLORS[primary.id]?.border,
              background: LANG_COLORS[primary.id]?.bg,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>{primary.emoji}</div>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 22, letterSpacing: '.1em',
                color: LANG_COLORS[primary.id]?.color, marginBottom: 8,
              }}>
                {primary.name}
              </div>
              <div style={{ fontSize: 14, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.6 }}>
                {primary.desc}
              </div>
            </div>
          </div>

          {/* All 5 languages */}
          <div>
            <div style={S.sectionTitle}>The 5 Love Languages</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LOVE_LANGUAGES.map(lang => {
                const isActive = lang.id === primary.id
                const c = LANG_COLORS[lang.id]
                return (
                  <div key={lang.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                    borderRadius: 9,
                    background: isActive ? c.bg : 'rgba(255,255,255,.015)',
                    border: `1px solid ${isActive ? c.border : 'var(--secondary)'}`,
                  }}>
                    <span style={{ fontSize: 24 }}>{lang.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.06em',
                        color: isActive ? c.color : 'var(--muted-foreground)',
                        fontWeight: isActive ? 700 : 400,
                      }}>
                        {lang.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', marginTop: 2 }}>
                        {lang.desc}
                      </div>
                    </div>
                    {isActive && (
                      <span style={{
                        padding: '2px 8px', borderRadius: 10, fontFamily: "'Cinzel', serif", fontSize: 7,
                        letterSpacing: '.15em', textTransform: 'uppercase',
                        background: `${c.color}15`, border: `1px solid ${c.color}33`, color: c.color,
                      }}>
                        Primary
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Reading */}
          <div>
            <div style={S.sectionTitle}>Reading</div>
            <div style={S.interpretation}>
              Your primary love language is{' '}
              <span style={{ color: LANG_COLORS[primary.id]?.color }}>{primary.name}</span>.{' '}
              {primary.desc}. You feel most loved and appreciated when others express care in
              this way. Understanding your love language — and that of those around you —
              enables deeper connection, reduces misunderstanding, and allows you to both
              give and receive love in the most meaningful way.
            </div>
          </div>

          {/* Retake */}
          <div style={{ textAlign: 'center', paddingBottom: 16 }}>
            <span
              style={{
                fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.2em',
                textTransform: 'uppercase', color: 'var(--muted-foreground)', cursor: 'pointer',
                padding: '8px 20px', borderRadius: 20,
                border: '1px solid rgba(255,255,255,.08)',
                transition: 'all .2s', display: 'inline-block',
              }}
              onClick={() => setShowQuiz(true)}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(238,136,102,.3)'; e.currentTarget.style.color='#ee8866' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.08)'; e.currentTarget.style.color='var(--muted-foreground)' }}
            >
              Retake Quiz
            </span>
          </div>
        </>
      ) : (
        /* No quiz taken */
        <>
          <div>
            <div style={S.sectionTitle}>The 5 Love Languages</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LOVE_LANGUAGES.map(lang => {
                const c = LANG_COLORS[lang.id]
                return (
                  <div key={lang.id} style={{ ...S.glass, borderColor: c.border, background: c.bg }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 28 }}>{lang.emoji}</span>
                      <div>
                        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: c.color, letterSpacing: '.08em' }}>
                          {lang.name}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic', marginTop: 4 }}>
                          {lang.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={S.interpretation}>
            Gary Chapman identified five distinct ways people express and experience love.
            Most people have one dominant love language, though a secondary may also be significant.
            Understanding these languages transforms relationships by closing the gap between
            how love is given and how it is received.
          </div>

          <div style={{ textAlign: 'center' }}>
            <span
              style={S.quizBtn}
              onClick={() => setShowQuiz(true)}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(238,136,102,.5)'; e.currentTarget.style.background='rgba(238,136,102,.12)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(238,136,102,.3)'; e.currentTarget.style.background='rgba(238,136,102,.06)' }}
            >
              Take the Love Languages Quiz
            </span>
          </div>
        </>
      )}
    </div>
  )
}
