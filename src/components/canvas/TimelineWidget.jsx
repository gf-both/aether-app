import { useMemo } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'

function getAge(dob) {
  if (!dob) return 0
  const [y, m, d] = dob.split('-').map(Number)
  const birth = new Date(y, m - 1, d)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  if (now < new Date(now.getFullYear(), m - 1, d)) age--
  return Math.max(0, age)
}

function buildMiniEvents(dob) {
  if (!dob) return []
  const by = parseInt(dob.split('-')[0])
  const all = []

  // Saturn returns
  all.push({ age: 29, label: 'Saturn Return I', icon: '♄', color: '#e8a040' })
  all.push({ age: 59, label: 'Saturn Return II', icon: '♄', color: '#e8a040' })
  // Uranus
  all.push({ age: 42, label: 'Uranus Opposition', icon: '♅', color: '#00c8ff' })
  // Chiron
  all.push({ age: 50, label: 'Chiron Return', icon: '⚷', color: '#ff6090' })
  // Jupiter returns
  for (let jr = 12; jr <= 72; jr += 12) {
    all.push({ age: jr, label: `Jupiter Return`, icon: '♃', color: '#60b030' })
  }
  // Numerology 9-year
  for (let n = 9; n <= 81; n += 9) {
    all.push({ age: n, label: `Cycle ${n/9} Complete`, icon: '∞', color: '#40ccdd' })
  }

  return all.sort((a, b) => a.age - b.age)
}

export default function TimelineWidget() {
  const primaryProfile = useAboveInsideStore((s) => s.primaryProfile)
  const activeViewProfile = useAboveInsideStore((s) => s.activeViewProfile)
  const profile = activeViewProfile || primaryProfile

  const currentAge = getAge(profile.dob)
  const events = useMemo(() => buildMiniEvents(profile.dob), [profile.dob])

  const upcoming = events.filter(e => e.age >= currentAge).slice(0, 6)
  const nextBig = upcoming[0]

  // Mini timeline bar: show ages 0–90
  const nowPct = (currentAge / 90) * 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 4px' }}>
      {/* Header */}
      <div className="ch">
        <span className="ct">◈ Life Timeline · Cosmic Arc</span>
        <span className="ci" style={{ fontSize: 11 }}>Age {currentAge}</span>
      </div>

      {/* Mini timeline bar */}
      <div style={{ padding: '8px 16px 4px', flexShrink: 0 }}>
        <div style={{ position: 'relative', height: 24, background: 'rgba(255,255,255,.03)', borderRadius: 12, overflow: 'visible' }}>
          {/* Progress fill */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${nowPct}%`,
            background: 'linear-gradient(90deg, rgba(201,168,76,.08), rgba(201,168,76,.2))',
            borderRadius: 12,
          }} />
          {/* Timeline line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: '50%',
            height: 1, background: 'rgba(201,168,76,.2)', transform: 'translateY(-50%)',
          }} />
          {/* Event dots on bar */}
          {events.map((e, i) => (
            <div key={i} title={`Age ${e.age}: ${e.label}`} style={{
              position: 'absolute',
              left: `${(e.age / 90) * 100}%`,
              top: '50%', transform: 'translate(-50%, -50%)',
              width: e.age >= currentAge ? 6 : 4,
              height: e.age >= currentAge ? 6 : 4,
              borderRadius: '50%',
              background: e.age >= currentAge ? e.color : 'rgba(255,255,255,.15)',
              boxShadow: e.age >= currentAge ? `0 0 6px ${e.color}` : 'none',
              zIndex: 2,
            }} />
          ))}
          {/* NOW marker */}
          <div style={{
            position: 'absolute',
            left: `${nowPct}%`,
            top: '50%', transform: 'translate(-50%, -50%)',
            width: 12, height: 12, borderRadius: '50%',
            background: 'rgba(255,255,255,.9)',
            boxShadow: '0 0 12px rgba(255,255,255,.8)',
            zIndex: 3,
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
          <span style={{ fontSize: 8, color: 'var(--text3)', fontFamily: "'Inconsolata',monospace" }}>0</span>
          <span style={{ fontSize: 8, color: 'var(--gold)', fontFamily: "'Inconsolata',monospace" }}>NOW {currentAge}</span>
          <span style={{ fontSize: 8, color: 'var(--text3)', fontFamily: "'Inconsolata',monospace" }}>90</span>
        </div>
      </div>

      {/* Next event highlight */}
      {nextBig && (
        <div style={{ margin: '4px 16px 8px', padding: '10px 14px', borderRadius: 10, background: `rgba(${nextBig.color.replace('#','').match(/../g).map(x=>parseInt(x,16)).join(',')}, .08)`, border: `1px solid ${nextBig.color}40` }}>
          <div style={{ fontSize: 9, color: 'var(--text2)', letterSpacing: '.08em', fontFamily: "'Cinzel',serif", marginBottom: 4 }}>NEXT MAJOR EVENT</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{nextBig.icon}</span>
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, color: nextBig.color, letterSpacing: '.04em' }}>{nextBig.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 2 }}>Age {nextBig.age} · {nextBig.age - currentAge} years away</div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming events list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        <div style={{ fontSize: 8, color: 'var(--text3)', letterSpacing: '.12em', fontFamily: "'Cinzel',serif", marginBottom: 8, textTransform: 'uppercase' }}>Upcoming</div>
        {upcoming.slice(1).map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
            <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{e.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: e.color, fontFamily: "'Cinzel',serif", letterSpacing: '.03em' }}>{e.label}</div>
              <div style={{ fontSize: 9, color: 'var(--text2)' }}>Age {e.age} · in {e.age - currentAge}y</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
