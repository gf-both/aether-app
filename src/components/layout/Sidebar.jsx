import { useAboveInsideStore } from '../../store/useAboveInsideStore'

const NAV_ITEMS = [
  { icon: '◎', label: 'Integral Map', id: 'integral', widget: 'integral' },
  'sep',
  { icon: '☉', label: 'Natal Chart', id: 'natal', widget: 'natal' },
  { icon: '☽', label: 'Transits', id: 'transits', widget: 'tr' },
  'sep',
  { icon: '◈', label: 'Human Design', id: 'hd', widget: 'hd' },
  { icon: '✡', label: 'Kabbalah', id: 'kab', widget: 'kab' },
  'sep',
  { icon: '∞', label: 'Numerology', id: 'num', widget: 'num' },
  { icon: '⬡', label: 'Gene Keys', id: 'gk', widget: 'gk' },
  'sep',
  { icon: '🌸', label: 'Mayan Calendar', id: 'mayan', widget: 'mayan' },
  { icon: '☯', label: 'Enneagram', id: 'enn', widget: 'enn' },
  { icon: '🐉', label: 'Chinese Zodiac', id: 'chi', widget: 'chi' },
  'sep',
  { icon: '🔠', label: 'Gematria', id: 'gem', widget: 'gem' },
  { icon: '🕸', label: 'Patterns', id: 'pat', widget: 'pat' },
  'sep',
  { icon: '🧠', label: 'Myers-Briggs', id: 'mbti', widget: 'mbti' },
  { icon: '🏛', label: 'Egyptian', id: 'egyptian', widget: 'egyptian' },
  'sep',
  { icon: '⊕', label: 'Synastry', id: 'synastry', widget: 'synastry' },
  'sep',
  { icon: '💎', label: 'Pricing', id: 'pricing', widget: 'pricing' },
  'sep',
  { icon: '🪬', label: 'Golem', id: 'golem', widget: 'golem' },
  'sep',
  { icon: '💬', label: 'AI Guide', id: 'aichat', panel: 'aichat' },
  { icon: '🏥', label: 'Practitioner', id: 'practitioner', widget: 'practitioner' },
  { icon: '📋', label: 'Client Portal', id: 'client', widget: 'client' },
  'sep',
  { icon: '✨', label: 'AETHER', id: 'aether', widget: 'aether' },
  'sep',
  { icon: '🏛️', label: 'Company', id: 'company', widget: 'company' },
]

export default function Sidebar() {
  const activeNav = useAboveInsideStore((s) => s.activeNav)
  const setActiveNav = useAboveInsideStore((s) => s.setActiveNav)
  const setActivePanel = useAboveInsideStore((s) => s.setActivePanel)
  const activeDetail = useAboveInsideStore((s) => s.activeDetail)
  const setActiveDetail = useAboveInsideStore((s) => s.setActiveDetail)

  function handleClick(item) {
    setActiveNav(item.id)
    if (item.panel) {
      setActivePanel(item.panel)
      return
    }
    if (item.id === 'dashboard') {
      setActiveDetail(null)
      return
    }
    if (item.widget) {
      if (activeDetail === item.widget) {
        setActiveDetail(null)
        setActiveNav('dashboard')
      } else if (activeDetail) {
        setActiveDetail(item.widget)
      } else {
        setActiveDetail(item.widget)
      }
    }
  }

  const effectiveNav = activeDetail
    ? NAV_ITEMS.find(n => typeof n === 'object' && n.widget === activeDetail)?.id || 'dashboard'
    : activeNav

  return (
    <nav className="sb">
      {/* Logo mark */}
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

      {NAV_ITEMS.map((item, i) => {
        if (item === 'sep') return <div key={i} className="sep" />
        return (
          <div
            key={item.id}
            className={`ni${effectiveNav === item.id ? ' on' : ''}`}
            onClick={() => handleClick(item)}
          >
            <span style={{ fontSize: 13 }}>{item.icon}</span>
            <div className="ntip">{item.label}</div>
          </div>
        )
      })}

      <div style={{ flex: 1 }} />

      <div
        className={`ni${activeNav === 'profile' || activeDetail === 'profile' ? ' on' : ''}`}
        onClick={() => { setActiveDetail('profile'); setActiveNav('profile') }}
      >
        <span style={{ fontSize: 13 }}>👤</span>
        <div className="ntip">Profiles</div>
      </div>
      <div className="ni">
        <span style={{ fontSize: 13 }}>⚙</span>
        <div className="ntip">Settings</div>
      </div>
    </nav>
  )
}
