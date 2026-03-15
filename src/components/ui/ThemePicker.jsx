/**
 * ThemePicker — standalone component for selecting from 6 themes.
 * Can be used anywhere: pass `onClose` to dismiss.
 */
import { useAboveInsideStore } from '../../store/useAboveInsideStore'

export const THEMES = [
  {
    id: 'cosmic',
    name: 'Cosmic Void',
    description: 'Deep space observatory',
    night: { bg: '#01010a', accent: '#c9a84c', text: '#e8e0d0', card: 'rgba(201,168,76,0.1)' },
    day:   { bg: '#0f0820', accent: '#d4a547', text: '#f0ece4', card: 'rgba(201,168,76,0.15)' },
  },
  {
    id: 'parchment',
    name: 'Sacred Parchment',
    description: 'Ancient manuscript',
    night: { bg: '#0d0805', accent: '#d4a84c', text: '#e8dcc4', card: 'rgba(212,168,76,0.08)' },
    day:   { bg: '#f5e8c8', accent: '#8b6014', text: '#2a1a0a', card: 'rgba(0,0,0,0.05)' },
  },
  {
    id: 'crystal',
    name: 'Crystal Matrix',
    description: 'Quantum clarity',
    night: { bg: '#060810', accent: '#00c8ff', text: '#e2e8f0', card: 'rgba(0,200,255,0.06)' },
    day:   { bg: '#f8faff', accent: '#4f46e5', text: '#1e293b', card: 'rgba(99,102,241,0.08)' },
  },
]

export default function ThemePicker({ onClose }) {
  const themeStyle = useAboveInsideStore((s) => s.themeStyle)
  const themeMode = useAboveInsideStore((s) => s.themeMode)
  const setTheme = useAboveInsideStore((s) => s.setTheme)

  function pick(style, mode) {
    setTheme(style, mode)
    onClose?.()
  }

  return (
    <div style={{
      background: 'var(--dropdown-bg, rgba(5,5,22,.97))',
      border: '1px solid var(--dropdown-border, rgba(201,168,76,.2))',
      borderRadius: 14,
      padding: 20,
      backdropFilter: 'blur(20px)',
      boxShadow: 'var(--dropdown-shadow, 0 8px 32px rgba(0,0,0,.5))',
    }}>
      <div style={{
        fontFamily: "'Cinzel',serif",
        fontSize: 10, letterSpacing: '.22em', color: 'var(--gold)',
        textAlign: 'center', marginBottom: 16, textTransform: 'uppercase',
      }}>
        Select Theme
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {THEMES.map(t => (
          <div key={t.id}>
            <div style={{
              fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.12em',
              color: 'var(--text2)', textAlign: 'center', marginBottom: 8,
              textTransform: 'uppercase',
            }}>
              {t.name}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['night', 'day'].map(mode => {
                const colors = t[mode]
                const isActive = themeStyle === t.id && themeMode === mode
                return (
                  <div
                    key={mode}
                    onClick={() => pick(t.id, mode)}
                    style={{
                      flex: 1, height: 80, borderRadius: 10, overflow: 'hidden',
                      background: colors.bg, cursor: 'pointer',
                      border: `2px solid ${isActive ? colors.accent : 'rgba(255,255,255,.12)'}`,
                      boxShadow: isActive ? `0 0 14px ${colors.accent}60` : 'none',
                      transition: 'all .2s', position: 'relative',
                    }}
                  >
                    {/* Mini card preview */}
                    <div style={{
                      position: 'absolute', inset: '10px 8px',
                      background: colors.card,
                      borderRadius: 5, border: `1px solid ${colors.accent}40`,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}>
                      <div style={{ width: 16, height: 2, background: colors.accent, borderRadius: 1 }} />
                      <div style={{ width: 12, height: 1, background: colors.text, borderRadius: 1, opacity: .5 }} />
                      <div style={{ width: 14, height: 1, background: colors.text, borderRadius: 1, opacity: .3 }} />
                    </div>
                    {/* Mode label */}
                    <div style={{
                      position: 'absolute', bottom: 5, left: 0, right: 0, textAlign: 'center',
                      fontSize: 7, fontFamily: "'Cinzel',serif", letterSpacing: '.1em',
                      color: colors.text, opacity: .7, textTransform: 'uppercase',
                    }}>{mode}</div>
                    {/* Active indicator */}
                    {isActive && (
                      <div style={{
                        position: 'absolute', top: 4, right: 4,
                        width: 8, height: 8, borderRadius: '50%',
                        background: colors.accent,
                        boxShadow: `0 0 6px ${colors.accent}`,
                      }} />
                    )}
                  </div>
                )
              })}
            </div>
            <div style={{
              fontSize: 8, color: 'var(--text3)', textAlign: 'center',
              marginTop: 5, fontStyle: 'italic',
            }}>
              {t.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
