import { useGolemStore } from '../store/useGolemStore'

const THEME_STYLES = [
  { id: 'cosmic',     label: 'Cosmic',     dot: '#c9a84c', desc: 'Gold on void — the original' },
  { id: 'parchment',  label: 'Parchment',  dot: '#d4a84c', desc: 'Warm amber on sepia' },
  { id: 'crystal',    label: 'Crystal',    dot: '#00c8ff', desc: 'Cyan electric on deep black' },
  { id: 'nebula',     label: 'Nebula',     dot: '#ffb830', desc: 'Amber fire on dark space' },
  { id: 'manuscript', label: 'Manuscript', dot: '#8b6820', desc: 'Ink on aged paper (day)' },
]

const LAYOUTS = [
  { id: 'grid',   icon: '⊞', label: 'Grid',   desc: 'All widgets in adaptive grid' },
  { id: 'focus',  icon: '◎', label: 'Focus',  desc: 'Single widget, full attention' },
  { id: 'stream', icon: '≡', label: 'Stream', desc: 'Vertical scroll, one column' },
]

const ALL_WIDGETS = [
  { id: 'natal',     label: 'Natal Chart',   icon: '☉' },
  { id: 'tr',        label: 'Transits',      icon: '☽' },
  { id: 'hd',        label: 'Human Design',  icon: '◈' },
  { id: 'kab',       label: 'Kabbalah',      icon: '✡' },
  { id: 'gk',        label: 'Gene Keys',     icon: '⬡' },
  { id: 'pat',       label: 'Patterns',      icon: '🕸' },
  { id: 'mayan',     label: 'Mayan Calendar',icon: '🔺' },
  { id: 'chi',       label: 'Chinese Zodiac',icon: '🐉' },
  { id: 'egyptian',  label: 'Egyptian',      icon: '🏛' },
  { id: 'num',       label: 'Numerology',    icon: '∞' },
  { id: 'gem',       label: 'Gematria',      icon: '🔠' },
  { id: 'enn',       label: 'Enneagram',     icon: '☯' },
  { id: 'mbti',      label: 'Myers-Briggs',  icon: '🧠' },
  { id: 'dosha',     label: 'Dosha',         icon: '🌿' },
  { id: 'archetype', label: 'Archetype',     icon: '🎭' },
  { id: 'lovelang',  label: 'Love Language', icon: '💗' },
  { id: 'vedic',     label: 'Vedic',         icon: '🪷' },
  { id: 'tibetan',   label: 'Tibetan',       icon: '🏔' },
  { id: 'timeline',  label: 'Timeline',      icon: '⟳' },
  { id: 'career',    label: 'Career',        icon: '🧭' },
]

export default function SettingsPage() {
  const layoutMode      = useGolemStore(s => s.layoutMode)
  const setLayoutMode   = useGolemStore(s => s.setLayoutMode)
  const themeStyle      = useGolemStore(s => s.themeStyle)
  const themeMode       = useGolemStore(s => s.themeMode)
  const setTheme        = useGolemStore(s => s.setTheme)
  const hiddenWidgets   = useGolemStore(s => s.hiddenWidgets || [])
  const toggleWidgetVisibility = useGolemStore(s => s.toggleWidgetVisibility)

  const isDay = themeMode === 'day'

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: '28px 32px',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      display: 'flex', flexDirection: 'column', gap: 32,
    }}>
      {/* Header */}
      <div>
        <div style={{
          fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '.25em',
          textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4,
        }}>⚙ Settings</div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          Appearance, layout, and data preferences
        </div>
      </div>

      {/* Day / Night Mode */}
      <Section title="Mode">
        <div style={{ display: 'flex', gap: 10 }}>
          <ModeCard
            icon="🌙" label="Night" desc="Deep space, dark chrome"
            active={!isDay}
            onClick={() => setTheme(themeStyle || 'cosmic', 'night')}
          />
          <ModeCard
            icon="☀️" label="Day" desc="Light chrome, warm tones"
            active={isDay}
            onClick={() => setTheme(themeStyle || 'cosmic', 'day')}
          />
        </div>
      </Section>

      {/* Theme style */}
      <Section title="Color Theme">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {THEME_STYLES.map(t => {
            const isActive = themeStyle === t.id
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id, themeMode || 'night')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '10px 14px', borderRadius: 9, cursor: 'pointer',
                  background: isActive ? 'var(--accent)' : 'var(--secondary)',
                  border: `1px solid ${isActive ? 'var(--ring)' : 'var(--border)'}`,
                  transition: 'all .15s',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  background: t.dot,
                  boxShadow: isActive ? `0 0 12px ${t.dot}80` : 'none',
                  border: `2px solid ${isActive ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.1)'}`,
                  transition: 'all .2s',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 12, fontFamily: "'Cinzel',serif", letterSpacing: '.06em',
                    color: isActive ? 'var(--foreground)' : 'var(--foreground)', marginBottom: 2,
                  }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{t.desc}</div>
                </div>
                {isActive && <span style={{ fontSize: 10, color: 'var(--gold)' }}>✓</span>}
              </div>
            )
          })}
        </div>
      </Section>

      {/* Layout */}
      <Section title="Dashboard Layout">
        <div style={{ display: 'flex', gap: 8 }}>
          {LAYOUTS.map(l => {
            const isActive = layoutMode === l.id
            return (
              <div
                key={l.id}
                onClick={() => setLayoutMode(l.id)}
                style={{
                  flex: 1, padding: '14px 10px', borderRadius: 10, cursor: 'pointer',
                  textAlign: 'center', transition: 'all .15s',
                  background: isActive ? 'rgba(201,168,76,.12)' : 'var(--secondary)',
                  border: `1px solid ${isActive ? 'rgba(201,168,76,.4)' : 'var(--border)'}`,
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6, color: isActive ? 'var(--gold)' : 'var(--muted-foreground)' }}>{l.icon}</div>
                <div style={{
                  fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: '.08em',
                  textTransform: 'uppercase', marginBottom: 4,
                  color: isActive ? 'var(--gold)' : 'var(--foreground)',
                }}>{l.label}</div>
                <div style={{ fontSize: 10, color: 'var(--muted-foreground)', lineHeight: 1.4 }}>{l.desc}</div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Widget Manager */}
      <Section title="Widget Visibility">
        <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 12, fontStyle: 'italic' }}>
          Click any widget to show or hide it on the dashboard.
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 6,
        }}>
          {ALL_WIDGETS.map(w => {
            const hidden = hiddenWidgets.includes(w.id)
            return (
              <div
                key={w.id}
                onClick={() => toggleWidgetVisibility && toggleWidgetVisibility(w.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 7, cursor: 'pointer',
                  background: hidden ? 'var(--secondary)' : 'rgba(201,168,76,.04)',
                  border: `1px solid ${hidden ? 'var(--border)' : 'rgba(201,168,76,.18)'}`,
                  opacity: hidden ? 0.45 : 1, transition: 'all .15s',
                }}
              >
                <span style={{ fontSize: 13, opacity: hidden ? .4 : 1 }}>{w.icon}</span>
                <span style={{ fontSize: 11, color: 'var(--foreground)', flex: 1 }}>{w.label}</span>
                <span style={{ fontSize: 9, color: hidden ? 'var(--muted-foreground)' : 'var(--gold)' }}>
                  {hidden ? 'off' : 'on'}
                </span>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Data */}
      <Section title="Data">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 4, fontStyle: 'italic' }}>
            Your data is stored locally in your browser. Sign in to sync across devices.
          </div>
          <div
            onClick={() => { localStorage.removeItem('golem-store'); window.location.reload() }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 7, cursor: 'pointer',
              background: 'rgba(220,60,60,.06)', border: '1px solid rgba(220,60,60,.2)',
              fontSize: 11, color: 'rgba(220,80,80,.8)', fontFamily: "'Cinzel',serif",
              letterSpacing: '.08em', textTransform: 'uppercase', transition: 'all .15s',
              alignSelf: 'flex-start',
            }}
          >
            ⚠ Reset All Data
          </div>
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{
        fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.2em',
        textTransform: 'uppercase', color: 'var(--muted-foreground)',
        marginBottom: 12, paddingBottom: 8,
        borderBottom: '1px solid var(--border)',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function ModeCard({ icon, label, desc, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1, padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
        background: active ? 'var(--accent)' : 'var(--secondary)',
        border: `1px solid ${active ? 'var(--ring)' : 'var(--border)'}`,
        transition: 'all .15s',
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{
        fontSize: 11, fontFamily: "'Cinzel',serif", letterSpacing: '.08em',
        textTransform: 'uppercase', marginBottom: 3,
        color: active ? 'var(--foreground)' : 'var(--foreground)',
      }}>{label}</div>
      <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{desc}</div>
      {active && <div style={{ marginTop: 8, fontSize: 9, color: 'var(--gold)', letterSpacing: '.1em' }}>ACTIVE</div>}
    </div>
  )
}
