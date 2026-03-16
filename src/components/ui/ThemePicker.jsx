/**
 * ThemePicker — full-modal theme selection with 5 theme families (10 variants).
 * Can be used anywhere: pass `onClose` to dismiss.
 */
import { useAboveInsideStore } from '../../store/useAboveInsideStore'

export const THEMES = [
  {
    id: 'cosmic',
    name: 'Cosmic Void',
    desc: 'Deep space observatory',
    emoji: '🌑',
    night: { bg: '#01010a', accent: '#c9a84c', text: '#e8e0d0', card: 'var(--accent)' },
    day:   { bg: '#0f0820', accent: '#d4a547', text: '#f0ece4', card: 'var(--accent)' },
  },
  {
    id: 'parchment',
    name: 'Sacred Parchment',
    desc: 'Ancient grimoire',
    emoji: '📜',
    night: { bg: '#0d0805', accent: '#d4a84c', text: '#e8dcc4', card: 'rgba(212,168,76,0.08)' },
    day:   { bg: '#f5e8c8', accent: '#8b6014', text: '#2a1a0a', card: 'rgba(0,0,0,0.05)' },
  },
  {
    id: 'crystal',
    name: 'Crystal Matrix',
    desc: 'Quantum clarity',
    emoji: '💎',
    night: { bg: '#060810', accent: '#00c8ff', text: '#e2e8f0', card: 'rgba(0,200,255,0.06)' },
    day:   { bg: '#f8faff', accent: '#4f46e5', text: '#1e293b', card: 'rgba(99,102,241,0.08)' },
  },
  {
    id: 'nebula',
    name: 'Nebula Observatory',
    desc: 'Immersive cosmic depths',
    emoji: '🌌',
    night: { bg: '#08060f', accent: '#ffb830', text: '#e8dcc8', card: 'rgba(201,168,76,0.06)' },
    day:   { bg: '#0d0b1a', accent: '#c9a84c', text: '#e8dcc8', card: 'var(--accent)' },
  },
  {
    id: 'manuscript',
    name: 'Sacred Manuscript',
    desc: 'Luminous parchment',
    emoji: '✦',
    night: { bg: '#0d0805', accent: '#d4a84c', text: '#e8dcc4', card: 'rgba(212,168,76,0.08)' },
    day:   { bg: '#f5f0e8', accent: '#8b6820', text: '#2a2520', card: 'rgba(0,0,0,0.04)' },
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
      borderRadius: 16,
      padding: 24,
      backdropFilter: 'blur(20px)',
      boxShadow: 'var(--dropdown-shadow, 0 8px 32px rgba(0,0,0,.5))',
      minWidth: 560,
    }}>
      <div style={{
        fontFamily: "'Cinzel',serif",
        fontSize: 11, letterSpacing: '.22em', color: 'var(--foreground)',
        textAlign: 'center', marginBottom: 20, textTransform: 'uppercase',
      }}>
        ✦ Select Theme ✦
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16 }}>
        {THEMES.map(t => (
          <div key={t.id}>
            <div style={{
              fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.12em',
              color: 'var(--muted-foreground)', textAlign: 'center', marginBottom: 8,
              textTransform: 'uppercase',
            }}>
              {t.emoji} {t.name}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['night', 'day'].map(mode => {
                const colors = t[mode]
                const isActive = themeStyle === t.id && themeMode === mode
                return (
                  <div
                    key={mode}
                    onClick={() => pick(t.id, mode)}
                    style={{
                      flex: 1, height: 88, borderRadius: 10, overflow: 'hidden',
                      background: colors.bg, cursor: 'pointer',
                      border: `2px solid ${isActive ? colors.accent : 'rgba(255,255,255,.12)'}`,
                      boxShadow: isActive ? `0 0 16px ${colors.accent}60, inset 0 0 20px rgba(0,0,0,.2)` : 'none',
                      transition: 'all .2s', position: 'relative',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.border = `2px solid ${colors.accent}60`
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.border = '2px solid rgba(255,255,255,.12)'
                    }}
                  >
                    {/* Mini card preview */}
                    <div style={{
                      position: 'absolute', inset: '10px 7px',
                      background: colors.card,
                      borderRadius: 5, border: `1px solid ${colors.accent}40`,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}>
                      <div style={{ width: 18, height: 2, background: colors.accent, borderRadius: 1 }} />
                      <div style={{ width: 14, height: 1, background: colors.text, borderRadius: 1, opacity: .5 }} />
                      <div style={{ width: 16, height: 1, background: colors.text, borderRadius: 1, opacity: .3 }} />
                    </div>
                    {/* Mode label */}
                    <div style={{
                      position: 'absolute', bottom: 5, left: 0, right: 0, textAlign: 'center',
                      fontSize: 7, fontFamily: "'Cinzel',serif", letterSpacing: '.1em',
                      color: colors.text, opacity: .7, textTransform: 'uppercase',
                    }}>{mode}</div>
                    {/* Active checkmark */}
                    {isActive && (
                      <div style={{
                        position: 'absolute', top: 4, right: 4,
                        width: 14, height: 14, borderRadius: '50%',
                        background: colors.accent,
                        boxShadow: `0 0 8px ${colors.accent}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 8, color: '#01010a', fontWeight: 'bold',
                      }}>✓</div>
                    )}
                  </div>
                )
              })}
            </div>
            <div style={{
              fontSize: 7.5, color: 'var(--muted-foreground)', textAlign: 'center',
              marginTop: 5, fontStyle: 'italic',
            }}>
              {t.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
