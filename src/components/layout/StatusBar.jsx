import { useAetherStore } from '../../store/useAetherStore'
import { useClock } from '../../hooks/useClock'

export default function StatusBar() {
  const profile = useAetherStore((s) => s.primaryProfile)
  const people = useAetherStore((s) => s.people)
  const setActivePanel = useAetherStore((s) => s.setActivePanel)
  const time = useClock()

  const items = [
    { dot: 'var(--aqua)', label: 'Type', val: profile.hdType, valColor: 'var(--aqua2)' },
    { dot: 'var(--rose)', label: 'Authority', val: profile.hdAuth, valColor: 'var(--rose2)' },
    { dot: 'var(--violet)', label: 'Profile', val: `${profile.hdProfile} Martyr\u00B7Heretic`, valColor: 'var(--violet2)' },
    { dot: 'var(--silver)', label: 'Definition', val: profile.hdDef, valColor: 'var(--silver2)' },
    { dot: 'var(--lime)', label: 'Strategy', val: 'Wait for Invitation', valColor: 'var(--lime2)' },
    { dot: 'var(--gold)', label: 'Not-Self', val: 'Bitterness', valColor: 'var(--text2)' },
    { dot: '#aa80ff', label: 'Inc. Cross', val: 'Right Angle \u00B7 Unexpected', valColor: '#aa80ff' },
  ]

  return (
    <div className="statusbar">
      {items.map((item, i) => (
        <div key={i} className="sb-item">
          <div className="sb-dot" style={{ background: item.dot }} />
          <div>
            <div className="sb-label">{item.label}</div>
            <div className="sb-val" style={{ color: item.valColor }}>{item.val}</div>
          </div>
        </div>
      ))}
      <div className="sb-item">
        <div className="sb-dot" style={{ background: 'var(--rose)' }} />
        <div>
          <div className="sb-label">Variables</div>
          <div className="sb-val">
            <span style={{ color: 'var(--design)' }}>PRR</span>/<span style={{ color: 'var(--personality)' }}>DLL</span>
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div className="sb-item" onClick={() => setActivePanel('profile')} style={{ cursor: 'none' }}>
        <div className="sb-dot" style={{ background: 'var(--gold)' }} />
        <div>
          <div className="sb-label">Profiles</div>
          <div className="sb-val" style={{ color: 'var(--gold)' }}>{1 + people.length} profiles</div>
        </div>
      </div>
      <span className="ttime">{time}</span>
    </div>
  )
}
