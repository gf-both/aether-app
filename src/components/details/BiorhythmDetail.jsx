import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { getBiorhythms } from '../../engines/biorhythmEngine'
import BiorhythmChart from '../canvas/BiorhythmChart'

const CYCLE_COLORS = {
  physical:     { main: '#ff6b6b', bg: 'rgba(255,107,107,.08)', border: 'rgba(255,107,107,.22)' },
  emotional:    { main: '#40ccdd', bg: 'rgba(64,204,221,.08)',  border: 'rgba(64,204,221,.22)'  },
  intellectual: { main: '#c9a84c', bg: 'var(--accent)', border: 'rgba(201,168,76,.22)'  },
}

const S = {
  panel: {
    width: '100%', height: '100%', overflowY: 'auto', padding: '24px 28px',
    display: 'flex', flexDirection: 'column', gap: 28,
    background: 'var(--card)', color: 'var(--foreground)',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: 'var(--muted-foreground)', paddingBottom: 8,
    borderBottom: '1px solid var(--accent)', marginBottom: 4,
  },
  heading: {
    fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 600, letterSpacing: '.18em',
    color: 'var(--foreground)', marginBottom: 4,
  },
  glass: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 13, padding: 18, backdropFilter: 'blur(12px)',
  },
  interpretation: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--muted-foreground)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'var(--accent)', border: '1px solid var(--border)',
  },
}

function CycleBar({ label, cycle, color }) {
  const phaseBadge = {
    high:         { bg: 'rgba(96,200,80,.1)',  border: 'rgba(96,200,80,.3)',  color: '#60c850' },
    low:          { bg: 'rgba(220,60,60,.1)',  border: 'rgba(220,60,60,.3)',  color: '#dc3c3c' },
    transitioning:{ bg: 'rgba(255,200,0,.1)', border: 'rgba(255,200,0,.3)', color: '#ffc800' },
  }[cycle.phase]

  return (
    <div style={{
      padding: '12px 16px', borderRadius: 10,
      background: color.bg, border: `1px solid ${color.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.15em', color: color.main }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: "'Inconsolata', monospace", fontSize: 13, fontWeight: 700, color: color.main,
          }}>
            {cycle.value > 0 ? '+' : ''}{cycle.value.toFixed(2)}
          </span>
          <span style={{
            fontSize: 8, fontFamily: "'Cinzel', serif", letterSpacing: '.1em', padding: '2px 7px',
            borderRadius: 8, background: phaseBadge.bg, border: `1px solid ${phaseBadge.border}`,
            color: phaseBadge.color, textTransform: 'uppercase',
          }}>
            {cycle.phase}
          </span>
        </div>
      </div>
      {/* Progress bar: 0-100% where 50% = 0 */}
      <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', position: 'relative', overflow: 'hidden' }}>
        {/* Center marker */}
        <div style={{ position: 'absolute', left: '50%', top: 0, width: 1, height: '100%', background: 'rgba(255,255,255,.2)' }} />
        <div style={{
          position: 'absolute',
          left: cycle.percentage < 50 ? `${cycle.percentage}%` : '50%',
          width: `${Math.abs(cycle.percentage - 50)}%`,
          height: '100%',
          background: color.main,
          opacity: 0.8,
          borderRadius: 3,
          transition: 'width .4s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: "'Inconsolata', monospace" }}>−1</span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: "'Inconsolata', monospace" }}>{cycle.percentage}%</span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: "'Inconsolata', monospace" }}>+1</span>
      </div>
    </div>
  )
}

export default function BiorhythmDetail() {
  const primaryProfile = useAboveInsideStore((s) => s.primaryProfile)
  const activeViewProfile = useAboveInsideStore((s) => s.activeViewProfile)
  const profile = activeViewProfile || primaryProfile

  let bio
  if (profile?.dob) {
    const [y, m, d] = profile.dob.split('-').map(Number)
    bio = getBiorhythms({ day: d, month: m, year: y })
  } else {
    bio = getBiorhythms({ day: 23, month: 1, year: 1981 })
  }

  const { cycles, criticalDays, overallEnergy, insight, date, daysSinceBirth } = bio

  const energyColor = overallEnergy > 66 ? '#60c850' : overallEnergy > 33 ? '#c9a84c' : '#dc3c3c'

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>◈ Biorhythm Cycles</div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          Physical · Emotional · Intellectual sine cycles since birth
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 9, fontFamily: "'Cinzel', serif", letterSpacing: '.1em', padding: '3px 10px',
            borderRadius: 10, background: 'var(--accent)', border: '1px solid rgba(201,168,76,.2)',
            color: 'var(--muted-foreground)',
          }}>
            {date}
          </span>
          <span style={{
            fontSize: 9, fontFamily: "'Cinzel', serif", letterSpacing: '.1em', padding: '3px 10px',
            borderRadius: 10, background: 'var(--secondary)', border: '1px solid rgba(255,255,255,.08)',
            color: 'var(--muted-foreground)',
          }}>
            Day {daysSinceBirth.toLocaleString()} of life
          </span>
        </div>
      </div>

      {/* CHART */}
      <div>
        <div style={S.sectionTitle}>30-Day Wave Chart</div>
        <div style={{ ...S.glass, padding: 0, overflow: 'hidden', height: 280, position: 'relative' }}>
          <BiorhythmChart />
        </div>
      </div>

      {/* OVERALL ENERGY */}
      <div>
        <div style={S.sectionTitle}>Overall Energy Today</div>
        <div style={{ ...S.glass, textAlign: 'center', padding: '20px 24px' }}>
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: 48, fontWeight: 700,
            color: energyColor, lineHeight: 1, letterSpacing: '.1em',
          }}>
            {overallEnergy}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Cinzel', serif", letterSpacing: '.2em', marginTop: 4 }}>
            VITALITY SCORE
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', margin: '12px auto 0', maxWidth: 200, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${overallEnergy}%`, background: energyColor, borderRadius: 3, transition: 'width .5s ease' }} />
          </div>
        </div>
      </div>

      {/* CYCLE BARS */}
      <div>
        <div style={S.sectionTitle}>Today's Cycle Values</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <CycleBar label="Physical"     cycle={cycles.physical}     color={CYCLE_COLORS.physical}     />
          <CycleBar label="Emotional"    cycle={cycles.emotional}    color={CYCLE_COLORS.emotional}    />
          <CycleBar label="Intellectual" cycle={cycles.intellectual} color={CYCLE_COLORS.intellectual} />
        </div>
      </div>

      {/* INSIGHT */}
      <div>
        <div style={S.sectionTitle}>Daily Insight</div>
        <div style={S.interpretation}>{insight}</div>
      </div>

      {/* CRITICAL DAYS */}
      <div>
        <div style={S.sectionTitle}>Next Critical Days (Zero Crossings)</div>
        <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { key: 'physical',     label: 'Physical',     color: CYCLE_COLORS.physical.main,     period: 23 },
            { key: 'emotional',    label: 'Emotional',    color: CYCLE_COLORS.emotional.main,    period: 28 },
            { key: 'intellectual', label: 'Intellectual', color: CYCLE_COLORS.intellectual.main, period: 33 },
          ].map(({ key, label, color, period }) => {
            const days = criticalDays[key]
            const critDate = new Date()
            critDate.setDate(critDate.getDate() + (days || 0))
            return (
              <div key={key} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid var(--secondary)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 3, height: 24, borderRadius: 2, background: color }} />
                  <div>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color, letterSpacing: '.1em' }}>{label}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted-foreground)', fontFamily: "'Inconsolata', monospace", marginTop: 2 }}>
                      {period}-day cycle
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Inconsolata', monospace", fontSize: 13, color: 'var(--foreground)' }}>
                    {days === 1 ? 'Tomorrow' : `in ${days} day${days !== 1 ? 's' : ''}`}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2 }}>
                    {critDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            )
          })}
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', marginTop: 4, lineHeight: 1.5 }}>
            Critical days occur when a cycle crosses zero — extra care and adaptability are recommended during these transitions.
          </div>
        </div>
      </div>

      {/* LEGEND */}
      <div>
        <div style={S.sectionTitle}>About Biorhythms</div>
        <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Physical',      period: 23, color: CYCLE_COLORS.physical.main,     desc: 'Stamina, coordination, strength, and overall physical wellbeing.' },
            { label: 'Emotional',     period: 28, color: CYCLE_COLORS.emotional.main,    desc: 'Mood, sensitivity, creativity, and emotional balance.' },
            { label: 'Intellectual',  period: 33, color: CYCLE_COLORS.intellectual.main, desc: 'Analytical thinking, memory, concentration, and cognitive sharpness.' },
          ].map(({ label, period, color, desc }) => (
            <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 20, height: 3, borderRadius: 2, background: color, marginTop: 7, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color, letterSpacing: '.1em' }}>
                  {label} <span style={{ fontSize: 9, color: 'var(--muted-foreground)' }}>· {period}-day cycle</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 3, lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
