import { useState } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { ARCHETYPES } from '../../engines/archetypeEngine'
import ArchetypeQuiz from '../overlays/ArchetypeQuiz'

const S = {
  panel: {
    width: '100%', height: '100%', overflowY: 'auto', padding: '24px 28px',
    display: 'flex', flexDirection: 'column', gap: 28,
    background: 'var(--panel-bg)', color: 'var(--text)',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: '#a878e8', paddingBottom: 8,
    borderBottom: '1px solid rgba(144,80,224,.12)', marginBottom: 4,
  },
  heading: {
    fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 600, letterSpacing: '.18em',
    color: '#a878e8', marginBottom: 4,
  },
  glass: {
    background: 'var(--glass-bg)', border: '1px solid rgba(144,80,224,.18)',
    borderRadius: 13, padding: 18, backdropFilter: 'blur(12px)',
  },
  interpretation: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--text2)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'rgba(144,80,224,.03)', border: '1px solid rgba(144,80,224,.1)',
  },
  quizBtn: {
    fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.18em',
    textTransform: 'uppercase', color: '#a878e8', cursor: 'pointer',
    padding: '12px 28px', borderRadius: 20,
    border: '1px solid rgba(144,80,224,.3)',
    background: 'rgba(144,80,224,.06)',
    transition: 'all .2s', display: 'inline-block',
  },
}

export default function ArchetypeDetail() {
  const archetypeType = useAboveInsideStore(s => s.archetypeType)
  const [showQuiz, setShowQuiz] = useState(false)

  const profile = archetypeType ? ARCHETYPES.find(a => a.name === archetypeType) : null

  return (
    <div style={S.panel}>
      {showQuiz && <ArchetypeQuiz onClose={() => setShowQuiz(false)} />}

      {/* Header */}
      <div>
        <div style={S.heading}>⬡ Archetype Assessment</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>
          Jungian archetypes · 12 patterns · Drive, fear, gift, shadow
        </div>
      </div>

      {profile ? (
        <>
          {/* Primary archetype */}
          <div>
            <div style={S.sectionTitle}>Your Archetype</div>
            <div style={{ ...S.glass, textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 28, letterSpacing: '.12em',
                color: '#a878e8', marginBottom: 12,
              }}>
                {profile.name}
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { label: 'Drive', value: profile.drive, color: '#a878e8' },
                  { label: 'Fear', value: profile.fear, color: '#ee7777' },
                  { label: 'Gift', value: profile.gift, color: '#77dd88' },
                  { label: 'Shadow', value: profile.shadow, color: '#aa8877' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{
                    background: `${color}10`, border: `1px solid ${color}25`,
                    borderRadius: 10, padding: '10px 16px', minWidth: 100,
                  }}>
                    <div style={{
                      fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.15em',
                      textTransform: 'uppercase', color: `${color}88`, marginBottom: 4,
                    }}>{label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reading */}
          <div>
            <div style={S.sectionTitle}>Archetypal Reading</div>
            <div style={S.interpretation}>
              As <span style={{ color: '#a878e8' }}>{profile.name}</span>, your soul is driven by{' '}
              <em>{profile.drive.toLowerCase()}</em>. Your greatest gift is{' '}
              <em>{profile.gift.toLowerCase()}</em> — the essence you bring to the world when
              operating from your highest potential. Your deepest fear of{' '}
              <em>{profile.fear.toLowerCase()}</em> is the shadow's doorway, and the{' '}
              <em>{profile.shadow.toLowerCase()}</em> pattern emerges when your archetype
              becomes distorted. Integration comes through embracing both the light and shadow
              aspects of your archetypal pattern.
            </div>
          </div>

          {/* All archetypes grid */}
          <div>
            <div style={S.sectionTitle}>The 12 Archetypes</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {ARCHETYPES.map((a, i) => {
                const isActive = a.name === profile.name
                return (
                  <div key={i} style={{
                    padding: '10px 12px', borderRadius: 9,
                    background: isActive ? 'rgba(144,80,224,.1)' : 'rgba(255,255,255,.015)',
                    border: `1px solid ${isActive ? 'rgba(144,80,224,.35)' : 'rgba(255,255,255,.05)'}`,
                  }}>
                    <div style={{
                      fontFamily: "'Cinzel', serif", fontSize: 10,
                      color: isActive ? '#a878e8' : 'var(--text3)',
                      fontWeight: isActive ? 700 : 400, letterSpacing: '.06em',
                    }}>{a.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', fontStyle: 'italic', marginTop: 2 }}>
                      {a.drive}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Retake */}
          <div style={{ textAlign: 'center', paddingBottom: 16 }}>
            <span
              style={{
                fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.2em',
                textTransform: 'uppercase', color: 'var(--text3)', cursor: 'pointer',
                padding: '8px 20px', borderRadius: 20,
                border: '1px solid rgba(255,255,255,.08)',
                transition: 'all .2s', display: 'inline-block',
              }}
              onClick={() => setShowQuiz(true)}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(144,80,224,.3)'; e.currentTarget.style.color='#a878e8' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.08)'; e.currentTarget.style.color='var(--text3)' }}
            >
              Retake Quiz
            </span>
          </div>
        </>
      ) : (
        /* No quiz taken */
        <>
          <div>
            <div style={S.sectionTitle}>The 12 Archetypes</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {ARCHETYPES.map((a, i) => (
                <div key={i} style={{
                  padding: '12px 14px', borderRadius: 9,
                  background: 'rgba(144,80,224,.04)', border: '1px solid rgba(144,80,224,.1)',
                }}>
                  <div style={{
                    fontFamily: "'Cinzel', serif", fontSize: 11, color: '#a878e8',
                    letterSpacing: '.08em', marginBottom: 4,
                  }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>
                    Drive: {a.drive} · Fear: {a.fear}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={S.interpretation}>
            Carl Jung's 12 archetypes represent fundamental patterns of the human psyche.
            Each archetype has a core drive, a defining fear, a gift to offer, and a shadow
            that emerges under stress. Discovering your primary archetype illuminates your
            deepest motivations and the unconscious patterns shaping your life.
          </div>

          <div style={{ textAlign: 'center' }}>
            <span
              style={S.quizBtn}
              onClick={() => setShowQuiz(true)}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(144,80,224,.5)'; e.currentTarget.style.background='rgba(144,80,224,.12)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(144,80,224,.3)'; e.currentTarget.style.background='rgba(144,80,224,.06)' }}
            >
              Take the Archetype Quiz
            </span>
          </div>
        </>
      )}
    </div>
  )
}
