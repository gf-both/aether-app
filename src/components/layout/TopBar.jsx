import { useAetherStore } from '../../store/useAetherStore'
import { useClock } from '../../hooks/useClock'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDOB(dob) {
  if (!dob) return '?'
  try {
    const d = new Date(dob + 'T12:00:00')
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  } catch { return dob }
}

export default function TopBar() {
  const profile = useAetherStore((s) => s.primaryProfile)
  const setActivePanel = useAetherStore((s) => s.setActivePanel)
  const time = useClock()

  return (
    <div className="tb">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <span className="tb-brand">AETHER</span>
        <div className="active-profile-bar">
          <div className="apb-avatar">{profile.emoji}</div>
          <div>
            <div className="apb-name">{profile.name}</div>
            <div className="apb-detail">
              {profile.hdType} {profile.hdProfile} &middot; {formatDOB(profile.dob)} &middot; {profile.tob || '?'} &middot; {profile.pob}
            </div>
          </div>
        </div>
      </div>
      <div className="tb-chips">
        <div className="chip chip-g">{'\u2609'} {profile.sign} &middot; &uarr; {profile.asc} &middot; {'\u263D'} {profile.moon}</div>
        <div className="chip chip-b">{'\u25C8'} {profile.hdType} &middot; {profile.hdProfile} &middot; Martyr/Heretic</div>
        <div className="chip chip-r">{'\u221E'} Life Path {profile.lifePath}</div>
        <div className="chip chip-v">{'\u2721'} Tiphareth 13/8</div>
        <div className="chip chip-b" onClick={() => setActivePanel('synastry')}>{'\u2295'} Synastry</div>
        <span className="ttime">{time}</span>
      </div>
    </div>
  )
}
