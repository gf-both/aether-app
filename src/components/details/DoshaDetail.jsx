import { useState } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { DOSHA_DATA } from '../../engines/doshaEngine'
import DoshaQuiz from '../overlays/DoshaQuiz'

const DOSHA_COLORS = {
  vata:  { color: '#6699ee', bg: 'rgba(102,153,238,.08)',  border: 'rgba(102,153,238,.22)'  },
  pitta: { color: '#ee6644', bg: 'rgba(238,102,68,.08)',   border: 'rgba(238,102,68,.22)'   },
  kapha: { color: '#44cc88', bg: 'rgba(68,204,136,.08)',   border: 'rgba(68,204,136,.22)'   },
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
  interpretation: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--muted-foreground)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'var(--accent)', border: '1px solid var(--border)',
  },
  quizBtn: {
    fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.18em',
    textTransform: 'uppercase', color: 'var(--foreground)', cursor: 'pointer',
    padding: '12px 28px', borderRadius: 20,
    border: '1px solid rgba(201,168,76,.3)',
    background: 'rgba(201,168,76,.06)',
    transition: 'all .2s', alignSelf: 'center',
    display: 'inline-block',
  },
}

function DoshaCard({ doshaKey, label }) {
  const data = DOSHA_DATA[doshaKey]
  if (!data) return null
  const c = DOSHA_COLORS[doshaKey]
  return (
    <div style={{ ...S.glass, borderColor: c.border, background: c.bg }}>
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', color: `${c.color}99`, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: c.color, letterSpacing: '.1em', marginBottom: 8 }}>{data.name}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <span style={{
          padding: '2px 8px', borderRadius: 10, fontFamily: "'Cinzel', serif", fontSize: 8,
          letterSpacing: '.1em', textTransform: 'uppercase',
          background: `${c.color}15`, border: `1px solid ${c.color}33`, color: c.color,
        }}>{data.elements}</span>
        <span style={{
          padding: '2px 8px', borderRadius: 10, fontFamily: "'Cinzel', serif", fontSize: 8,
          letterSpacing: '.1em', textTransform: 'uppercase',
          background: `${c.color}0a`, border: `1px solid ${c.color}22`, color: `${c.color}cc`,
        }}>{data.season}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.5 }}>{data.qualities}</div>
      <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.6, marginTop: 8 }}>{data.description}</div>
    </div>
  )
}

export default function DoshaDetail() {
  const doshaType = useAboveInsideStore(s => s.doshaType)
  const [showQuiz, setShowQuiz] = useState(false)

  // Parse constitution string like 'Vata-Pitta'
  const parts = doshaType ? doshaType.toLowerCase().split('-') : []
  const primary = parts[0] || null
  const secondary = parts[1] || null

  return (
    <div style={S.panel}>
      {showQuiz && <DoshaQuiz onClose={() => setShowQuiz(false)} />}

      {/* Header */}
      <div>
        <div style={S.heading}>☯ Ayurvedic Dosha</div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          Mind-body constitution · Tri-dosha system · Vata, Pitta, Kapha
        </div>
      </div>

      {doshaType && primary ? (
        <>
          {/* Constitution */}
          <div>
            <div style={S.sectionTitle}>Your Constitution</div>
            <div style={{ ...S.glass, textAlign: 'center', borderColor: DOSHA_COLORS[primary]?.border }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 28, letterSpacing: '.12em',
                color: DOSHA_COLORS[primary]?.color || 'var(--foreground)',
              }}>
                {doshaType}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', marginTop: 6 }}>
                Prakruti — your natural constitution
              </div>
            </div>
          </div>

          {/* Primary dosha */}
          {primary && (
            <div>
              <div style={S.sectionTitle}>Primary Dosha</div>
              <DoshaCard doshaKey={primary} label="Primary" />
            </div>
          )}

          {/* Secondary dosha */}
          {secondary && secondary !== primary && (
            <div>
              <div style={S.sectionTitle}>Secondary Dosha</div>
              <DoshaCard doshaKey={secondary} label="Secondary" />
            </div>
          )}

          {/* All three overview */}
          <div>
            <div style={S.sectionTitle}>The Three Doshas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(DOSHA_DATA).map(([key, data]) => {
                const c = DOSHA_COLORS[key]
                const isActive = key === primary || key === secondary
                return (
                  <div key={key} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px',
                    borderRadius: 9,
                    background: isActive ? c.bg : 'rgba(255,255,255,.015)',
                    border: `1px solid ${isActive ? c.border : 'var(--secondary)'}`,
                  }}>
                    <div style={{
                      fontFamily: "'Cinzel', serif", fontSize: 15, color: c.color,
                      minWidth: 60, letterSpacing: '.06em',
                    }}>{data.name}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>{data.elements}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{data.qualities}</div>
                    </div>
                    {isActive && (
                      <span style={{
                        padding: '2px 8px', borderRadius: 10, fontFamily: "'Cinzel', serif", fontSize: 7,
                        letterSpacing: '.15em', textTransform: 'uppercase',
                        background: `${c.color}15`, border: `1px solid ${c.color}33`, color: c.color,
                      }}>
                        {key === primary ? 'PRIMARY' : 'SECONDARY'}
                      </span>
                    )}
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
                textTransform: 'uppercase', color: 'var(--muted-foreground)', cursor: 'pointer',
                padding: '8px 20px', borderRadius: 20,
                border: '1px solid rgba(255,255,255,.08)',
                transition: 'all .2s', display: 'inline-block',
              }}
              onClick={() => setShowQuiz(true)}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(201,168,76,.3)'; e.currentTarget.style.color='var(--foreground)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.08)'; e.currentTarget.style.color='var(--muted-foreground)' }}
            >
              Retake Quiz
            </span>
          </div>
        </>
      ) : (
        /* No quiz taken yet */
        <>
          <div>
            <div style={S.sectionTitle}>The Three Doshas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(DOSHA_DATA).map(([key, data]) => {
                const c = DOSHA_COLORS[key]
                return (
                  <div key={key} style={{ ...S.glass, borderColor: c.border, background: c.bg }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: c.color, letterSpacing: '.1em', marginBottom: 6 }}>{data.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', marginBottom: 4 }}>{data.elements} · {data.season}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{data.description}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={S.interpretation}>
            The Ayurvedic system identifies three fundamental biological energies (doshas) that govern
            physical and mental processes. Every person has a unique blend of Vata, Pitta, and Kapha
            that determines their constitution, tendencies, and path to balance.
          </div>

          <div style={{ textAlign: 'center' }}>
            <span
              style={S.quizBtn}
              onClick={() => setShowQuiz(true)}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--ring)'; e.currentTarget.style.background='var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(201,168,76,.3)'; e.currentTarget.style.background='rgba(201,168,76,.06)' }}
            >
              Take the Dosha Quiz
            </span>
          </div>
        </>
      )}
    </div>
  )
}
