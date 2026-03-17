import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { useClock } from '../../hooks/useClock'
import { useActiveProfile } from '../../hooks/useActiveProfile'
import { computeHDChart } from '../../engines/hdEngine'
import { useMemo } from 'react'

const HD_PROFILE_NAMES = {
  '1/3':'Investigator/Martyr','1/4':'Investigator/Opportunist',
  '2/4':'Hermit/Opportunist','2/5':'Hermit/Heretic',
  '3/5':'Martyr/Heretic','3/6':'Martyr/Role Model',
  '4/6':'Opportunist/Role Model','4/1':'Opportunist/Investigator',
  '5/1':'Heretic/Investigator','5/2':'Heretic/Hermit',
  '6/2':'Role Model/Hermit','6/3':'Role Model/Martyr',
}

export default function StatusBar() {
  const profile = useActiveProfile()
  const people = useAboveInsideStore((s) => s.people)
  const setActivePanel = useAboveInsideStore((s) => s.setActivePanel)
  const time = useClock()

  // Compute HD chart live when stored values are missing
  const hdChart = useMemo(() => {
    if (!profile?.dob) return null
    if (profile.hdType && profile.hdType !== '?') return null // already have it
    try {
      return computeHDChart({ dateOfBirth: profile.dob, timeOfBirth: profile.tob || '12:00', utcOffset: profile.birthTimezone ?? -3 })
    } catch { return null }
  }, [profile?.dob, profile?.tob, profile?.birthTimezone, profile?.hdType])

  const hdType     = (profile?.hdType    && profile.hdType    !== '?') ? profile.hdType    : hdChart?.type     || '—'
  const hdAuth     = (profile?.hdAuth    && profile.hdAuth    !== '?') ? profile.hdAuth    : hdChart?.authority || '—'
  const hdProfile  = (profile?.hdProfile && profile.hdProfile !== '?') ? profile.hdProfile : hdChart?.profile  || '—'
  const hdDef      = (profile?.hdDef     && profile.hdDef     !== '?') ? profile.hdDef     : hdChart?.definition || '—'
  const hdStrategy = hdChart?.strategy || (hdType === 'Projector' ? 'Wait for the Invitation' : hdType === 'Generator' ? 'Wait to Respond' : hdType === 'Manifesting Generator' ? 'Wait to Respond, then Inform' : hdType === 'Manifestor' ? 'Inform before acting' : hdType === 'Reflector' ? 'Wait a Lunar Cycle' : '—')
  const hdNotSelf  = hdChart?.notSelf  || (hdType === 'Projector' ? 'Bitterness' : hdType === 'Generator' || hdType === 'Manifesting Generator' ? 'Frustration' : hdType === 'Manifestor' ? 'Anger' : hdType === 'Reflector' ? 'Disappointment' : '—')
  const hdCross    = hdChart?.cross    ? `${hdChart.cross.split('(')[0].trim()}` : '—'
  const hdVarsDesign = hdChart?.variables?.design || '—'
  const hdVarsPers   = hdChart?.variables?.personality || '—'
  const profileLabel = hdProfile !== '—' ? `${hdProfile} ${HD_PROFILE_NAMES[hdProfile] || ''}` : '—'

  const items = [
    { dot: 'var(--aqua)',               label: 'Type',       val: hdType },
    { dot: 'var(--rose)',               label: 'Authority',  val: hdAuth },
    { dot: 'var(--violet)',             label: 'Profile',    val: profileLabel },
    { dot: 'var(--muted-foreground)',   label: 'Definition', val: hdDef },
    { dot: 'var(--lime)',               label: 'Strategy',   val: hdStrategy },
    { dot: 'var(--accent-color, #c9a84c)', label: 'Not-Self', val: hdNotSelf },
    { dot: '#aa80ff',                   label: 'Inc. Cross', val: hdCross },
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
      {hdChart?.variables && (
        <div className="sb-item">
          <div className="sb-dot" style={{ background: 'var(--rose)' }} />
          <div>
            <div className="sb-label">Variables</div>
            <div className="sb-val">
              <span style={{ color: 'var(--design)' }}>{hdVarsDesign}</span>/<span style={{ color: 'var(--personality)' }}>{hdVarsPers}</span>
            </div>
          </div>
        </div>
      )}
      <div style={{ flex: 1 }} />
      <div className="sb-item" onClick={() => setActivePanel('profile')} style={{ cursor: 'pointer' }}>
        <div className="sb-dot" style={{ background: 'var(--ring)' }} />
        <div>
          <div className="sb-label">Profiles</div>
          <div className="sb-val">{1 + (people?.length || 0)} profiles</div>
        </div>
      </div>
      <span className="ttime">{time}</span>
    </div>
  )
}
// StatusBar v2 - force redeploy
