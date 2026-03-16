import { useAboveInsideStore } from '../store/useAboveInsideStore'

export default function SettingsPage() {
  const { layoutMode, setLayoutMode, themeStyle, setTheme, themeMode, widgetOrder, setWidgetOrder, hiddenWidgets, toggleWidgetVisibility } = useAboveInsideStore(s => ({
    layoutMode: s.layoutMode,
    setLayoutMode: s.setLayoutMode,
    themeStyle: s.themeStyle,
    setTheme: s.setTheme,
    themeMode: s.themeMode,
    widgetOrder: s.widgetOrder,
    setWidgetOrder: s.setWidgetOrder,
    hiddenWidgets: s.hiddenWidgets || [],
    toggleWidgetVisibility: s.toggleWidgetVisibility,
  }))

  const ALL_WIDGETS = ['natal', 'tr', 'hd', 'kab', 'gk', 'integral', 'pat', 'mayan', 'chi', 'egyptian', 'num', 'gem', 'enn', 'mbti', 'dosha', 'archetype', 'lovelang', 'vedic', 'tibetan', 'stars', 'timeline', 'career']

  const WIDGET_LABELS = {
    natal: 'Natal Chart', tr: 'Transits', hd: 'Human Design', kab: 'Kabbalah',
    gk: 'Gene Keys', integral: 'Integral Map', pat: 'Patterns', mayan: 'Mayan Calendar',
    chi: 'Chinese Zodiac', egyptian: 'Egyptian', num: 'Numerology', gem: 'Gematria',
    enn: 'Enneagram', mbti: 'Myers-Briggs', dosha: 'Dosha', archetype: 'Archetype',
    lovelang: 'Love Language', vedic: 'Vedic', tibetan: 'Tibetan', stars: 'Fixed Stars',
    timeline: 'Timeline', career: 'Career',
  }

  return (
    <div style={{ padding: '24px 28px', overflowY: 'auto', height: '100%' }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 24 }}>
        Settings
      </div>

      {/* Layout */}
      <Section title="Layout">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['grid', 'bento', 'focus', 'magazine', 'cosmic'].map(mode => (
            <Chip
              key={mode}
              label={mode.charAt(0).toUpperCase() + mode.slice(1)}
              active={layoutMode === mode}
              onClick={() => setLayoutMode && setLayoutMode(mode)}
            />
          ))}
        </div>
      </Section>

      {/* Theme */}
      <Section title="Theme">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['cosmic-night', 'deep-space', 'aurora', 'starfield', 'void'].map(theme => (
            <Chip
              key={theme}
              label={theme.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
              active={themeStyle === theme}
              onClick={() => setTheme && setTheme(theme, themeMode)}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <Chip label="Dark" active={themeMode === 'dark'} onClick={() => setTheme && setTheme(themeStyle, 'dark')} />
          <Chip label="Light" active={themeMode === 'light'} onClick={() => setTheme && setTheme(themeStyle, 'light')} />
        </div>
      </Section>

      {/* Widget Manager */}
      <Section title="Widget Manager">
        <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 10 }}>
          Toggle widgets on/off. Drag to reorder on the dashboard.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {ALL_WIDGETS.map(id => {
            const isHidden = hiddenWidgets?.includes(id)
            return (
              <div
                key={id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 6,
                  background: isHidden ? 'var(--secondary)' : 'rgba(201,168,76,.05)',
                  border: `1px solid ${isHidden ? 'var(--border)' : 'rgba(201,168,76,.15)'}`,
                  opacity: isHidden ? .5 : 1,
                  transition: 'all .15s', cursor: 'pointer',
                }}
                onClick={() => toggleWidgetVisibility && toggleWidgetVisibility(id)}
              >
                <span style={{ fontSize: 12, color: 'var(--foreground)' }}>{WIDGET_LABELS[id] || id}</span>
                <span style={{ fontSize: 10, color: isHidden ? 'var(--muted-foreground)' : 'var(--gold)' }}>
                  {isHidden ? 'Hidden' : 'Visible'}
                </span>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Data */}
      <Section title="Data">
        <div
          onClick={() => { localStorage.removeItem('above-inside-store'); window.location.reload() }}
          style={{ padding: '8px 16px', borderRadius: 6, cursor: 'pointer', background: 'rgba(220,60,60,.08)', border: '1px solid rgba(220,60,60,.2)', fontSize: 11, color: 'rgba(220,60,60,.7)', display: 'inline-block' }}
        >
          Reset All Data
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--foreground)', opacity: .6, marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Chip({ label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '5px 14px', borderRadius: 16, cursor: 'pointer', fontSize: 11,
        background: active ? 'rgba(201,168,76,.15)' : 'var(--secondary)',
        border: `1px solid ${active ? 'rgba(201,168,76,.4)' : 'var(--border)'}`,
        color: active ? 'var(--gold)' : 'var(--foreground)',
        transition: 'all .15s',
      }}
    >
      {label}
    </div>
  )
}
