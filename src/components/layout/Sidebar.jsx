import { useGolemStore } from '../../store/useGolemStore'

// Section-grouped nav structure
// Restructured: YOU (core agents + golem + timeline + career + integral map),
//               OTHERS (synastry, simulation, watercooler, connections),
//               CONSTELLATION (profiles — dynamic, replaces AI Agents)
// Removed: Wendy, Benchmark Lab
const NAV_SECTIONS = [
  { type: 'item', icon: '◎', label: 'Dashboard', id: 'dashboard' },

  { type: 'section', label: 'YOU' },
  { type: 'item', icon: '🜁', label: 'Identity', id: 'identity-agent', widget: 'identity-agent' },
  { type: 'item', icon: '💫', label: 'Relationship', id: 'relationship-agent', widget: 'relationship-agent' },
  { type: 'item', icon: '🧭', label: 'Life Direction', id: 'life-direction', widget: 'life-direction' },
  { type: 'item', icon: '🕸', label: 'Patterns', id: 'pat', widget: 'pat' },
  { type: 'item', icon: '🪬', label: 'Golem', id: 'golem', widget: 'golem' },
  { type: 'item', icon: '⟳', label: 'Timeline', id: 'timeline', widget: 'timeline' },
  { type: 'item', icon: '🧭', label: 'Career', id: 'career', widget: 'career' },
  { type: 'section', label: 'OTHERS' },
  { type: 'item', icon: '✦', label: 'Constellation', id: 'aiagents', widget: 'aiagents' },
  { type: 'item', icon: '⊕', label: 'Synastry', id: 'synastry', widget: 'synastry' },
  { type: 'item', icon: '🔮', label: 'Simulation', id: 'golem-sim', widget: 'golem-sim' },
  { type: 'item', icon: '🐟', label: 'Fishbowl', id: 'watercooler', widget: 'watercooler' },
  { type: 'item', icon: '💫', label: 'Connections', id: 'dating', widget: 'dating' },

  { type: 'section', label: 'HUMAN' },

  { type: 'section', label: 'CORE STRUCTURAL' },
  { type: 'item', icon: '☉', label: 'Natal Chart', id: 'natal', widget: 'natal' },
  { type: 'item', icon: '☽', label: 'Transits', id: 'transits', widget: 'tr' },
  { type: 'item', icon: '◈', label: 'Human Design', id: 'hd', widget: 'hd' },
  { type: 'item', icon: '✡', label: 'Kabbalah', id: 'kab', widget: 'kab' },
  { type: 'item', icon: '⬡', label: 'Gene Keys', id: 'gk', widget: 'gk' },

  { type: 'section', label: 'ARCHETYPAL' },
  { type: 'item', icon: '🔺', label: 'Mayan Calendar', id: 'mayan', widget: 'mayan' },
  { type: 'item', icon: '🐉', label: 'Chinese Zodiac', id: 'chi', widget: 'chi' },
  { type: 'item', icon: '🏛', label: 'Egyptian', id: 'egyptian', widget: 'egyptian' },

  { type: 'section', label: 'SACRED MATHEMATICS' },
  { type: 'item', icon: '∞', label: 'Numerology', id: 'num', widget: 'num' },
  { type: 'item', icon: '🔠', label: 'Gematria', id: 'gem', widget: 'gem' },

  { type: 'section', label: 'SELF KNOWLEDGE' },
  { type: 'item', icon: '☯', label: 'Enneagram', id: 'enn', widget: 'enn' },
  { type: 'item', icon: '🧠', label: 'Myers-Briggs', id: 'mbti', widget: 'mbti' },
  { type: 'item', icon: '🌿', label: 'Dosha', id: 'dosha', widget: 'dosha' },
  { type: 'item', icon: '🎭', label: 'Archetype', id: 'archetype', widget: 'archetype' },
  { type: 'item', icon: '💗', label: 'Love Language', id: 'lovelang', widget: 'lovelang' },

  { type: 'section', label: 'EASTERN WISDOM' },
  { type: 'item', icon: '🪷', label: 'Vedic', id: 'vedic', widget: 'vedic' },
  { type: 'item', icon: '🏔', label: 'Tibetan', id: 'tibetan', widget: 'tibetan' },

  { type: 'section', label: 'TOOLS' },
  { type: 'item', icon: '◈', label: 'Oracle', id: 'oracle', action: 'toggleOracle' },
  { type: 'item', icon: '💎', label: 'Pricing', id: 'pricing', widget: 'pricing' },
  { type: 'item', icon: '🏥', label: 'Practitioner', id: 'practitioner', widget: 'practitioner' },
  { type: 'item', icon: '📋', label: 'Client Portal', id: 'client', widget: 'client' },
  { type: 'item', icon: '⚡', label: 'Admin', id: 'admin', widget: 'admin' },
]

export default function Sidebar() {
  const activeNav = useGolemStore((s) => s.activeNav)
  const setActiveNav = useGolemStore((s) => s.setActiveNav)
  const setActivePanel = useGolemStore((s) => s.setActivePanel)
  const activeDetail = useGolemStore((s) => s.activeDetail)
  const setActiveDetail = useGolemStore((s) => s.setActiveDetail)
  const sidebarCollapsed = useGolemStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useGolemStore((s) => s.setSidebarCollapsed)
  const oracleOpen = useGolemStore((s) => s.oracleOpen)
  const setOracleOpen = useGolemStore((s) => s.setOracleOpen)

  function handleClick(item) {
    if (item.id === 'dashboard') {
      setActiveDetail(null)
      setActiveNav('dashboard')
      return
    }
    if (item.action === 'toggleOracle') {
      setOracleOpen(!oracleOpen)
      return
    }
    setActiveNav(item.id)
    if (item.panel) {
      setActivePanel(item.panel)
      return
    }
    if (item.widget) {
      setActiveDetail(item.widget)
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
          <span className="sb-brand">GOLEM</span>
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
