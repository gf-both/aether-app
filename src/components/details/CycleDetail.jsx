import { useState } from 'react'
import { useGolemStore } from '../../store/useGolemStore'
import { computeCycleProfile, getMoonPhase } from '../../engines/cycleEngine'
import CycleWheel from '../canvas/CycleWheel'

const S = {
  panel: {
    width: '100%', height: '100%', overflowY: 'auto', padding: '24px 28px',
    display: 'flex', flexDirection: 'column', gap: 24,
    background: 'var(--card)', color: 'var(--foreground)',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: 'var(--muted-foreground)', paddingBottom: 8,
    borderBottom: '1px solid var(--accent)', marginBottom: 4,
  },
}

export default function CycleDetail() {
  const profile = useGolemStore(s => s.activeViewProfile || s.primaryProfile)
  const setPrimaryProfile = useGolemStore(s => s.setPrimaryProfile)
  const [lastPeriod, setLastPeriod] = useState(profile?.lastPeriodDate || '')
  const [cycleLen, setCycleLen] = useState(profile?.cycleLength || 28)

  const cycle = lastPeriod ? computeCycleProfile(lastPeriod, cycleLen) : null
  const moon = getMoonPhase()

  function saveCycleData() {
    setPrimaryProfile({ lastPeriodDate: lastPeriod, cycleLength: cycleLen })
  }

  return (
    <div style={S.panel}>
      {/* Header */}
      <div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, letterSpacing: '.18em', color: 'var(--foreground)', marginBottom: 4 }}>
          CYCLE · MOON PHASES
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
          Your menstrual cycle mapped to lunar rhythms. Ancient wisdom meets modern tracking.
        </div>
      </div>

      {/* Input Section */}
      <div>
        <div style={S.sectionTitle}>CYCLE DATA</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginBottom: 5 }}>Last period start</div>
            <input
              type="date"
              value={lastPeriod}
              onChange={e => setLastPeriod(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 7, background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: 12, fontFamily: 'inherit' }}
            />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginBottom: 5 }}>Cycle length (days)</div>
            <input
              type="number"
              min={21}
              max={40}
              value={cycleLen}
              onChange={e => setCycleLen(Number(e.target.value))}
              style={{ width: 70, padding: '8px 12px', borderRadius: 7, background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: 12, fontFamily: 'inherit' }}
            />
          </div>
          <button
            onClick={saveCycleData}
            style={{
              padding: '8px 18px', borderRadius: 7, cursor: 'pointer',
              background: 'rgba(196,77,122,.12)', border: '1px solid rgba(196,77,122,.3)',
              color: '#c44d7a', fontSize: 11, fontFamily: "'Cinzel',serif",
              letterSpacing: '.1em', textTransform: 'uppercase',
            }}
          >
            Save
          </button>
        </div>
      </div>

      {cycle && (
        <>
          {/* Current State */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 16, borderRadius: 10, background: cycle.currentPhase.color + '15', border: `1px solid ${cycle.currentPhase.color}33` }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{cycle.currentPhase.emoji}</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, color: cycle.currentPhase.color, marginBottom: 4 }}>{cycle.currentPhase.name} Phase</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>Day {cycle.cycleDay} of {cycle.cycleLength}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 4, fontStyle: 'italic' }}>{cycle.currentPhase.archetype}</div>
            </div>
            <div style={{ padding: 16, borderRadius: 10, background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.15)' }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{cycle.moonPhase.phaseEmoji}</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, color: '#c9a84c', marginBottom: 4 }}>{cycle.moonPhase.phaseName}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>{cycle.moonPhase.illumination}% illuminated</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 4, fontStyle: 'italic' }}>{cycle.moonPhase.phaseEnergy}</div>
            </div>
          </div>

          {/* Moon-Cycle Alignment */}
          <div>
            <div style={S.sectionTitle}>MOON-CYCLE ALIGNMENT</div>
            <div style={{ padding: 16, borderRadius: 10, background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 24, color: '#c9a84c' }}>{cycle.moonCycleAlignment.score}%</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, color: cycle.moonCycleAlignment.score > 80 ? '#60b030' : cycle.moonCycleAlignment.score > 50 ? '#e09040' : '#c44d7a' }}>
                  {cycle.moonCycleAlignment.label}
                </div>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,.65)' }}>
                {cycle.moonCycleAlignment.description}
              </div>
            </div>
          </div>

          {/* Cycle Visualization */}
          <div>
            <div style={S.sectionTitle}>CYCLE WHEEL</div>
            <div style={{ height: 280, borderRadius: 10, background: 'rgba(0,0,0,.2)', border: '1px solid var(--border)' }}>
              <CycleWheel cycleDay={cycle.cycleDay} cycleLength={cycle.cycleLength} />
            </div>
          </div>

          {/* Current Phase Energy */}
          <div>
            <div style={S.sectionTitle}>PHASE ENERGY</div>
            <div style={{ padding: 16, borderRadius: 10, background: cycle.currentPhase.color + '08', border: `1px solid ${cycle.currentPhase.color}20` }}>
              <div style={{ fontSize: 13, lineHeight: 1.8, color: 'rgba(255,255,255,.7)' }}>
                {cycle.currentPhase.energy}
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 10, background: cycle.currentPhase.color + '20', color: cycle.currentPhase.color, border: `1px solid ${cycle.currentPhase.color}40` }}>
                  {cycle.currentPhase.element} Element
                </span>
                <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 10, background: 'rgba(201,168,76,.08)', color: '#c9a84c', border: '1px solid rgba(201,168,76,.2)' }}>
                  {cycle.currentPhase.moonCorrelation}
                </span>
              </div>
            </div>
          </div>

          {/* Fertility Window */}
          <div>
            <div style={S.sectionTitle}>FERTILITY WINDOW</div>
            <div style={{ padding: 12, borderRadius: 10, background: 'var(--secondary)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, color: cycle.isFertile ? '#60b030' : 'var(--foreground)' }}>
                    {cycle.isFertile ? '● Fertile Window Active' : '○ Outside Fertile Window'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>
                    Days {cycle.fertileWindow.start}–{cycle.fertileWindow.end} · Ovulation ~Day {cycle.ovulationDay}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
                    {cycle.daysToOvulation > 0 ? `${cycle.daysToOvulation} days to ovulation` : cycle.daysToOvulation === 0 ? 'Ovulation day' : `${Math.abs(cycle.daysToOvulation)} days past ovulation`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div>
            <div style={S.sectionTitle}>7-DAY FORECAST</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {cycle.weekForecast.map((day, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: i === 0 ? 'rgba(201,168,76,.1)' : 'var(--secondary)', border: `1px solid ${i === 0 ? 'rgba(201,168,76,.3)' : 'var(--border)'}` }}>
                  <div style={{ fontSize: 9, color: 'var(--muted-foreground)' }}>{day.date.toLocaleDateString('en', { weekday: 'short' })}</div>
                  <div style={{ fontSize: 14, margin: '4px 0' }}>{day.moon.phaseEmoji}</div>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: day.phase.color, margin: '0 auto 2px' }} />
                  <div style={{ fontSize: 8, color: 'var(--muted-foreground)' }}>D{day.day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Period */}
          <div style={{ padding: 12, borderRadius: 10, background: 'rgba(196,77,122,.06)', border: '1px solid rgba(196,77,122,.12)', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#c44d7a' }}>
              Next period in ~{cycle.daysToNextPeriod} days · {cycle.nextPeriodDate.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </div>
          </div>

          {/* Phase Guide */}
          <div>
            <div style={S.sectionTitle}>ALL PHASES</div>
            {cycle.phases.map((phase, i) => (
              <div key={i} style={{
                padding: '12px 14px', marginBottom: 6, borderRadius: 8,
                background: cycle.currentPhase.name === phase.name ? phase.color + '12' : 'var(--secondary)',
                border: `1px solid ${cycle.currentPhase.name === phase.name ? phase.color + '40' : 'var(--border)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{phase.emoji}</span>
                  <div>
                    <div style={{ fontSize: 12, color: phase.color, fontFamily: "'Cinzel',serif" }}>{phase.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>Days {phase.days[0]}–{phase.days[1]} · {phase.moonCorrelation} · {phase.archetype}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
