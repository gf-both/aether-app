import { useMemo } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { getVedicChart } from '../../engines/vedicEngine'
import { getNumerologyProfileFromDob } from '../../engines/numerologyEngine'

const PERSONAL_YEAR_DESC = {
  1: 'New Beginnings', 2: 'Cooperation', 3: 'Expansion',
  4: 'Foundation',     5: 'Major Change', 6: 'Harmony',
  7: 'Reflection & Depth', 8: 'Power & Manifestation', 9: 'Completion',
}

const DASHA_GLYPHS = {
  Sun: '☀', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃',
  Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
}

function reduceNum(n) {
  while (n > 9) { n = String(n).split('').reduce((a, d) => a + +d, 0) }
  return n
}

function getPersonalYear(birthMonth, birthDay, year) {
  return reduceNum(birthMonth + birthDay + year)
}

export default function TimelineWidget() {
  const profile = useAboveInsideStore(s => s.activeViewProfile || s.primaryProfile)

  const data = useMemo(() => {
    try {
      const dob = profile?.dob || ''
      if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null

      const [birthYear, birthMonth, birthDay] = dob.split('-').map(Number)
      const now = new Date()
      const currentYear = now.getFullYear()

      // Vedic dasha — needs birth time; use noon fallback
      const tob = profile?.tob || '12:00'
      const [bh, bm] = tob.split(':').map(Number)
      const lat = profile?.birthLat || 0
      const lon = profile?.birthLon || 0
      const tz = profile?.birthTimezone || 0

      let dasha = null
      try {
        const v = getVedicChart({ day: birthDay, month: birthMonth, year: birthYear, hour: bh || 12, minute: bm || 0, lat, lon, timezone: tz })
        dasha = v.dasha
      } catch (e) { /* fallback: no dasha */ }

      // Current dasha period
      let currentDasha = null
      if (dasha?.sequence) {
        const todayStr = now.toISOString().split('T')[0]
        currentDasha = dasha.sequence.find(d => d.start <= todayStr && d.end >= todayStr) || dasha.sequence[0]
      }

      // Personal Year
      const py = getPersonalYear(birthMonth, birthDay, currentYear)

      // Build upcoming events (next 20 years)
      const events = []

      // Saturn milestones
      const saturnMilestones = [
        { offset: 7.4,  label: 'Saturn Square I' },
        { offset: 14.75, label: 'Saturn Opposition I' },
        { offset: 22.1, label: 'Saturn Square II' },
        { offset: 29.5, label: 'Saturn Return I' },
        { offset: 36.8, label: 'Saturn Square III' },
        { offset: 44.25, label: 'Saturn Opposition II' },
        { offset: 50,   label: 'Chiron Return' },
        { offset: 59,   label: 'Saturn Return II' },
      ]
      for (const { offset, label } of saturnMilestones) {
        const yr = birthYear + offset
        if (yr > currentYear) events.push({ year: yr, label, type: 'saturn' })
      }

      // Jupiter returns
      for (let i = 1; i <= 8; i++) {
        const yr = birthYear + i * 12
        if (yr > currentYear) events.push({ year: yr, label: `Jupiter Return #${i}`, type: 'jupiter' })
      }

      // Dasha changes
      if (dasha?.sequence) {
        for (const d of dasha.sequence) {
          const yr = new Date(d.start).getFullYear()
          if (yr > currentYear) events.push({ year: yr, label: `Dasha: ${d.lord}`, type: 'dasha' })
        }
      }

      // Sort by year and take the 3 soonest
      events.sort((a, b) => a.year - b.year)
      const nextEvents = events.slice(0, 3)

      // Progress in current dasha
      let dashaProgress = 0
      if (currentDasha) {
        const start = new Date(currentDasha.start).getTime()
        const end = new Date(currentDasha.end).getTime()
        const nowMs = now.getTime()
        dashaProgress = Math.max(0, Math.min(1, (nowMs - start) / (end - start)))
      }

      return { currentDasha, py, nextEvents, dashaProgress, birthYear }
    } catch (e) {
      console.error('TimelineWidget error:', e)
      return null
    }
  }, [profile?.dob, profile?.tob, profile?.birthLat, profile?.birthLon, profile?.birthTimezone])

  // Empty state
  if (!data) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', padding: 16, textAlign: 'center',
        fontSize: 11, color: 'var(--muted-foreground)',
        fontFamily: "'Cinzel', serif", letterSpacing: '.1em', textTransform: 'uppercase',
      }}>
        Add your birth date to see your Timeline
      </div>
    )
  }

  const { currentDasha, py, nextEvents, dashaProgress } = data
  const currentYear = new Date().getFullYear()

  const typeColor = { saturn: '#f0c040', jupiter: '#40b0ff', dasha: '#a060e0', chiron: '#40cccc' }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      padding: '10px 12px', height: '100%', boxSizing: 'border-box',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      color: 'var(--foreground)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em',
        textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: 2,
      }}>
        Timeline
      </div>

      {/* Current Dasha */}
      {currentDasha && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, color: '#a060e0' }}>
              {DASHA_GLYPHS[currentDasha.lord] || '✦'}
            </span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#a060e0', lineHeight: 1.2 }}>
                Dasha: {currentDasha.lord}
              </div>
              <div style={{ fontSize: 9, color: 'var(--muted-foreground)', lineHeight: 1.2 }}>
                {currentDasha.start?.slice(0, 4)} – {currentDasha.end?.slice(0, 4)}
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{
            height: 3, borderRadius: 2, background: 'var(--border)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${(dashaProgress * 100).toFixed(1)}%`,
              background: 'linear-gradient(90deg, #7030b0, #a060e0)',
              borderRadius: 2, transition: 'width 0.5s',
            }} />
          </div>
        </div>
      )}

      {/* Personal Year */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          width: 22, height: 22, borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: '#40b03010', border: '1px solid #40b03044',
          fontSize: 11, fontWeight: 700, color: '#60c040',
          fontFamily: "'Cinzel', serif",
        }}>{py}</span>
        <div style={{ fontSize: 10, color: 'var(--foreground)', lineHeight: 1.3 }}>
          <span style={{ fontWeight: 600 }}>Personal Year {py}</span>
          {' — '}
          <span style={{ color: 'var(--muted-foreground)' }}>
            {PERSONAL_YEAR_DESC[py] || ''}
          </span>
        </div>
      </div>

      {/* Next events */}
      {nextEvents.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
          <div style={{
            fontSize: 7.5, letterSpacing: '.15em', textTransform: 'uppercase',
            color: 'var(--muted-foreground)', fontFamily: "'Cinzel', serif",
          }}>Upcoming</div>
          {nextEvents.map((ev, i) => {
            const yr = Math.floor(ev.year)
            const countdown = yr - currentYear
            const col = typeColor[ev.type] || '#888'
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontSize: 9.5, lineHeight: 1.3,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: col, flexShrink: 0,
                  }} />
                  <span style={{ color: 'var(--foreground)' }}>{ev.label}</span>
                </div>
                <div style={{ color: col, fontFamily: "'Cinzel', serif", fontSize: 9, flexShrink: 0, marginLeft: 6 }}>
                  {yr} <span style={{ color: 'var(--muted-foreground)', fontSize: 8 }}>
                    ({countdown > 0 ? `in ${countdown}y` : 'now'})
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
