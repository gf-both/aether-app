import { useAboveInsideStore } from '../../store/useAboveInsideStore'

const NAV_ITEMS = [
  { icon: '\u25CE', label: 'Integral Map', id: 'integral', widget: 'integral' },
  'sep',
  { icon: '\u2609', label: 'Natal Chart', id: 'natal', widget: 'natal' },
  { icon: '\u263D', label: 'Transits', id: 'transits', widget: 'tr' },
  'sep',
  { icon: '\u25C8', label: 'Human Design', id: 'hd', widget: 'hd' },
  { icon: '\u2721', label: 'Kabbalah', id: 'kab', widget: 'kab' },
  'sep',
  { icon: '\u221E', label: 'Numerology', id: 'num', widget: 'num' },
  { icon: '\u2B21', label: 'Gene Keys', id: 'gk', widget: 'gk' },
  'sep',
  { icon: '\u{1F4AE}', label: 'Mayan Calendar', id: 'mayan', widget: 'mayan' },
  { icon: '\u262F', label: 'Enneagram', id: 'enn', widget: 'enn' },
  { icon: '\u{1F409}', label: 'Chinese Zodiac', id: 'chi', widget: 'chi' },
  'sep',
  { icon: '\u{1F520}', label: 'Gematria', id: 'gem', widget: 'gem' },
  { icon: '\u{1F578}', label: 'Patterns', id: 'pat', widget: 'pat' },
  'sep',
  { icon: '\u{1F9E0}', label: 'Myers-Briggs', id: 'mbti', widget: 'mbti' },
  { icon: '\u{1F3DB}', label: 'Egyptian', id: 'egyptian', widget: 'egyptian' },
  'sep',
  { icon: '\u2295', label: 'Synastry', id: 'synastry', widget: 'synastry' },
  'sep',
  { icon: '\u{1F48E}', label: 'Pricing', id: 'pricing', widget: 'pricing' },
  'sep',
  { icon: '\uD83D\uDCAC', label: 'AI Guide', id: 'aichat', panel: 'aichat' },
  { icon: '\uD83C\uDFE5', label: 'Practitioner', id: 'practitioner', widget: 'practitioner' },
  { icon: '\uD83D\uDCCB', label: 'Client Portal', id: 'client', widget: 'client' },
  'sep',
  { icon: '\u2728', label: 'AETHER', id: 'aether', widget: 'aether' },
  'sep',
  { icon: '\uD83C\uDFDB\uFE0F', label: 'Company', id: 'company', widget: 'company' },
]

export default function Sidebar() {
  const activeNav = useAboveInsideStore((s) => s.activeNav)
  const setActiveNav = useAboveInsideStore((s) => s.setActiveNav)
  const setActivePanel = useAboveInsideStore((s) => s.setActivePanel)
  const activeDetail = useAboveInsideStore((s) => s.activeDetail)
  const setActiveDetail = useAboveInsideStore((s) => s.setActiveDetail)

  function handleClick(item) {
    setActiveNav(item.id)

    // Open overlay panels
    if (item.panel) {
      setActivePanel(item.panel)
      return
    }

    // Dashboard = go back to grid view
    if (item.id === 'dashboard') {
      setActiveDetail(null)
      return
    }

    // Widget nav items
    if (item.widget) {
      if (activeDetail === item.widget) {
        // Already viewing this detail — go back to dashboard
        setActiveDetail(null)
        setActiveNav('dashboard')
      } else if (activeDetail) {
        // In a different detail view — switch to this one
        setActiveDetail(item.widget)
      } else {
        // On dashboard — open detail view for this widget
        setActiveDetail(item.widget)
      }
    }
  }

  // Determine which nav should show as active
  const effectiveNav = activeDetail
    ? NAV_ITEMS.find(n => typeof n === 'object' && n.widget === activeDetail)?.id || 'dashboard'
    : activeNav

  return (
    <nav className="sb" style={{ background: 'var(--sidebar-bg, rgba(3,3,18,.95))' }}>
      <svg className="logo" viewBox="0 0 28 28" fill="none" onClick={() => { setActiveDetail(null); setActiveNav('dashboard') }} style={{ cursor: 'pointer' }}>
        <circle cx="14" cy="14" r="12" stroke="rgba(201,168,76,.3)" strokeWidth=".5" />
        <circle cx="14" cy="14" r="7.5" stroke="rgba(201,168,76,.5)" strokeWidth=".5" />
        <circle cx="14" cy="14" r="3" stroke="rgba(201,168,76,.8)" strokeWidth=".5" />
        <circle cx="14" cy="14" r="1.2" fill="rgba(201,168,76,.9)" />
        <line x1="14" y1="2" x2="14" y2="26" stroke="rgba(201,168,76,.15)" strokeWidth=".4" />
        <line x1="2" y1="14" x2="26" y2="14" stroke="rgba(201,168,76,.15)" strokeWidth=".4" />
      </svg>

      {NAV_ITEMS.map((item, i) => {
        if (item === 'sep') return <div key={i} className="sep" />
        return (
          <div
            key={item.id}
            className={`ni${effectiveNav === item.id ? ' on' : ''}`}
            onClick={() => handleClick(item)}
          >
            <span>{item.icon}</span>
            <div className="ntip">{item.label}</div>
          </div>
        )
      })}

      <div style={{ flex: 1 }} />

      <div className={`ni${activeNav === 'profile' || activeDetail === 'profile' ? ' on' : ''}`} onClick={() => { setActiveDetail('profile'); setActiveNav('profile') }}>
        <span style={{ fontSize: '13px' }}>{'\uD83D\uDC64'}</span>
        <div className="ntip">Profiles</div>
      </div>
      <div className="ni">
        <span style={{ fontSize: '12px' }}>{'\u2699'}</span>
        <div className="ntip">Settings</div>
      </div>
    </nav>
  )
}
