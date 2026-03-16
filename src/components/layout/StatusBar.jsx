import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { useClock } from '../../hooks/useClock'

export default function StatusBar() {
  const profile = useAboveInsideStore((s) => s.primaryProfile)
  const people = useAboveInsideStore((s) => s.people)
  const setActivePanel = useAboveInsideStore((s) => s.setActivePanel)
  const time = useClock()

  const items = [
    { dot: 'var(--aqua)', label: 'Type', val: profile.hdType },
    { dot: 'var(--rose)', label: 'Authority', val: profile.hdAuth },
    { dot: 'var(--violet)', label: 'Profile', val: `${profile.hdProfile} Martyr·Heretic` },
    { dot: 'var(--muted-foreground)', label: 'Definition', val: profile.hdDef },
    { dot: 'var(--lime)', label: 'Strategy', val: 'Wait for Invitation' },
    { dot: 'var(--accent-color, #c9a84c)', label: 'Not-Self', val: 'Bitterness' },
    { dot: '#aa80ff', label: 'Inc. Cross', val: 'Right Angle · Unexpected' },
  ]

  return (
    <div className="statusbar">
      {items.map((item, i) => (
        <div key={i} className="sb-item">
          <div className="sb-dot" style={{ background: item.dot }} />
          <div>
            <div className="sb-label">{item.label}</div>
            <div className="sb-val">{item.val}</div>
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
      <div className="sb-item" onClick={() => setActivePanel('profile')} style={{ cursor: 'pointer' }}>
        <div className="sb-dot" style={{ background: 'var(--ring)' }} />
        <div>
          <div className="sb-label">Profiles</div>
          <div className="sb-val">{1 + people.length} profiles</div>
        </div>
      </div>
      <span className="ttime">{time}</span>
    </div>
  )
}
