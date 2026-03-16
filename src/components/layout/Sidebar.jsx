import { useAboveInsideStore } from '../../store/useAboveInsideStore'

// Section-grouped nav structure
const NAV_SECTIONS = [
  { type: 'item', icon: '◎', label: 'Dashboard', id: 'dashboard' },

  { type: 'section', label: 'CHARTS' },
  { type: 'item', icon: '☉', label: 'Natal Chart', id: 'natal', widget: 'natal' },
  { type: 'item', icon: '☽', label: 'Transits', id: 'transits', widget: 'tr' },
  { type: 'item', icon: '⊕', label: 'Synastry', id: 'synastry', widget: 'synastry' },

  { type: 'section', label: 'ENERGY SYSTEMS' },
  { type: 'item', icon: '◈', label: 'Human Design', id: 'hd', widget: 'hd' },
  { type: 'item', icon: '✡', label: 'Kabbalah', id: 'kab', widget: 'kab' },
  { type: 'item', icon: '⬡', label: 'Gene Keys', id: 'gk', widget: 'gk' },

  { type: 'section', label: 'CYCLES' },
  { type: 'item', icon: '🌸', label: 'Mayan Calendar', id: 'mayan', widget: 'mayan' },
  { type: 'item', icon: '☯', label: 'Enneagram', id: 'enn', widget: 'enn' },
  { type: 'item', icon: '🐉', label: 'Chinese Zodiac', id: 'chi', widget: 'chi' },
  { type: 'item', icon: '∞', label: 'Numerology', id: 'num', widget: 'num' },

  { type: 'section', label: 'PATTERNS' },
  { type: 'item', icon: '🔠', label: 'Gematria', id: 'gem', widget: 'gem' },
  { type: 'item', icon: '🕸', label: 'Patterns', id: 'pat', widget: 'pat' },
  { type: 'item', icon: '🧠', label: 'Myers-Briggs', id: 'mbti', widget: 'mbti' },
  { type: 'item', icon: '🏛', label: 'Egyptian', id: 'egyptian', widget: 'egyptian' },

  { type: 'section', label: 'IDENTITY' },
  { type: 'item', icon: '🪬', label: 'Golem', id: 'golem', widget: 'golem' },
  { type: 'item', icon: '💫', label: 'Dating', id: 'dating', widget: 'dating' },
  { type: 'item', icon: '🧭', label: 'Career', id: 'career', widget: 'career' },
  { type: 'item', icon: '🤖', label: 'AI Agents', id: 'aether', widget: 'aether' },
  { type: 'item', icon: '🧬', label: 'Wendy', id: 'wendy', widget: 'wendy' },

  { type: 'section', label: 'TOOLS' },
  { type: 'item', icon: '💬', label: 'AI Guide', id: 'aichat', panel: 'aichat' },
  { type: 'item', icon: '💎', label: 'Pricing', id: 'pricing', widget: 'pricing' },
  { type: 'item', icon: '🏥', label: 'Practitioner', id: 'practitioner', widget: 'practitioner' },
  { type: 'item', icon: '📋', label: 'Client Portal', id: 'client', widget: 'client' },
  { type: 'item', icon: '🏛️', label: 'Company', id: 'company', widget: 'company' },
]

export default function Sidebar() {
  const activeNav = useAboveInsideStore((s) => s.activeNav)
  const setActiveNav = useAboveInsideStore((s) => s.setActiveNav)
  const setActivePanel = useAboveInsideStore((s) => s.setActivePanel)
  const activeDetail = useAboveInsideStore((s) => s.activeDetail)
  const setActiveDetail = useAboveInsideStore((s) => s.setActiveDetail)
  const sidebarCollapsed = useAboveInsideStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useAboveInsideStore((s) => s.setSidebarCollapsed)

  function handleClick(item) {
    if (item.id === 'dashboard') {
      setActiveDetail(null)
      setActiveNav('dashboard')
      return
    }
    setActiveNav(item.id)
    if (item.panel) {
      setActivePanel(item.panel)
      return
    }
    if (item.widget) {
      if (activeDetail === item.widget) {
        setActiveDetail(null)
        setActiveNav('dashboard')
      } else {
        setActiveDetail(item.widget)
      }
    }
  }

  const effectiveNav = activeDetail
    ? NAV_SECTIONS.find(n => n.type === 'item' && n.widget === activeDetail)?.id || 'dashboard'
    : activeNav

  const collapsed = sidebarCollapsed

  return (
    <nav className={`sb${collapsed ? ' sb-collapsed' : ' sb-expanded'}`}>
      {/* Logo + collapse toggle row */}
      <div className="sb-header">
        <svg
          className="logo"
          viewBox="0 0 24 24"
          fill="none"
          onClick={() => { setActiveDetail(null); setActiveNav('dashboard') }}
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
          <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="0.75" opacity="0.8" />
          <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.9" />
        </svg>
        {!collapsed && (
          <span className="sb-brand">AETHER</span>
        )}
        <button
          className="sb-toggle"
          onClick={() => setSidebarCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav items */}
      <div className="sb-nav">
        {NAV_SECTIONS.map((entry, i) => {
          if (entry.type === 'section') {
            return (
              <div key={`sec-${i}`} className="sb-section-label">
                {!collapsed && <span>{entry.label}</span>}
                {collapsed && <div className="sb-section-line" />}
              </div>
            )
          }

          const isActive = effectiveNav === entry.id
          return (
            <div
              key={entry.id}
              className={`ni${isActive ? ' on' : ''}${collapsed ? ' ni-collapsed' : ' ni-expanded'}`}
              onClick={() => handleClick(entry)}
              title={collapsed ? entry.label : undefined}
            >
              <span className="ni-icon">{entry.icon}</span>
              {!collapsed && <span className="ni-label">{entry.label}</span>}
              {collapsed && <div className="ntip">{entry.label}</div>}
            </div>
          )
        })}
      </div>

      {/* Bottom: profile + settings */}
      <div className="sb-bottom">
        <div
          className={`ni${(activeNav === 'profile' || activeDetail === 'profile') ? ' on' : ''}${collapsed ? ' ni-collapsed' : ' ni-expanded'}`}
          onClick={() => { setActiveDetail('profile'); setActiveNav('profile') }}
          title={collapsed ? 'Profiles' : undefined}
        >
          <span className="ni-icon">👤</span>
          {!collapsed && <span className="ni-label">Profiles</span>}
          {collapsed && <div className="ntip">Profiles</div>}
        </div>
        <div
          className={`ni${(activeDetail === 'settings') ? ' on' : ''}${collapsed ? ' ni-collapsed' : ' ni-expanded'}`}
          onClick={() => { setActiveDetail(activeDetail === 'settings' ? null : 'settings'); setActiveNav(activeDetail === 'settings' ? 'dashboard' : 'settings') }}
          title={collapsed ? 'Settings' : undefined}
        >
          <span className="ni-icon">⚙</span>
          {!collapsed && <span className="ni-label">Settings</span>}
          {collapsed && <div className="ntip">Settings</div>}
        </div>
      </div>
    </nav>
  )
}
