import { useMemo, useRef, useEffect } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'

const FRAMEWORK_COLORS = {
  astro:   { color: '#c9a84c', bg: 'var(--accent)',  border: 'rgba(201,168,76,.4)'  },
  hd:      { color: '#9050e0', bg: 'rgba(144,80,224,.12)', border: 'rgba(144,80,224,.4)'  },
  num:     { color: '#40ccdd', bg: 'rgba(64,204,221,.12)',  border: 'rgba(64,204,221,.4)'  },
  saturn:  { color: '#e8a040', bg: 'rgba(232,160,64,.12)', border: 'rgba(232,160,64,.4)'  },
  jupiter: { color: '#60b030', bg: 'rgba(96,176,48,.12)',  border: 'rgba(96,176,48,.4)'   },
  uranus:  { color: '#00c8ff', bg: 'rgba(0,200,255,.12)',   border: 'rgba(0,200,255,.4)'   },
  chiron:  { color: '#ff6090', bg: 'rgba(255,96,144,.12)',  border: 'rgba(255,96,144,.4)'  },
  chi:     { color: '#d44870', bg: 'rgba(212,72,112,.12)',  border: 'rgba(212,72,112,.4)'  },
  now:     { color: '#ffffff', bg: 'rgba(255,255,255,.15)', border: 'rgba(255,255,255,.8)' },
}

function getAge(dob) {
  if (!dob) return 0
  const [y, m, d] = dob.split('-').map(Number)
  const birth = new Date(y, m - 1, d)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  if (now < new Date(now.getFullYear(), m - 1, d)) age--
  return Math.max(0, age)
}

function getBirthYear(dob) {
  if (!dob) return 1980
  return parseInt(dob.split('-')[0])
}

function buildEvents(dob, name) {
  if (!dob) return []
  const by = getBirthYear(dob)
  const events = []

  // Birth
  events.push({ age: 0, label: 'Birth · Incarnation Cross', sub: `${name || 'You'} arrives`, type: 'hd', icon: '◈' })

  // Saturn Returns (~29.5, ~59)
  events.push({ age: 29, label: 'First Saturn Return', sub: 'Identity crystallizes · New chapter begins', type: 'saturn', icon: '♄' })
  events.push({ age: 59, label: 'Second Saturn Return', sub: 'Wisdom harvest · Legacy solidifies', type: 'saturn', icon: '♄' })

  // Jupiter Returns (~12y cycles)
  for (let jr = 12; jr <= 84; jr += 12) {
    events.push({ age: jr, label: `Jupiter Return`, sub: `Expansion cycle · Age ${jr}`, type: 'jupiter', icon: '♃' })
  }

  // Uranus Opposition (~42)
  events.push({ age: 42, label: 'Uranus Opposition', sub: 'Midlife awakening · Liberation call', type: 'uranus', icon: '♅' })

  // Chiron Return (~50)
  events.push({ age: 50, label: 'Chiron Return', sub: 'Deep healing · Wounded healer awakens', type: 'chiron', icon: '⚷' })

  // Numerology: Life cycles (9-year completions)
  for (let n = 9; n <= 81; n += 9) {
    if (![29, 59].includes(n)) { // skip if overlaps saturn
      events.push({ age: n, label: `Numerology Cycle ${n/9}`, sub: `9-year completion · Release & renewal`, type: 'num', icon: '∞' })
    }
  }

  // Numerology Pinnacles (approximate ages)
  // First pinnacle ends at 36 - life path (simplified)
  const lpApprox = 7
  const p1end = 36 - lpApprox
  events.push({ age: p1end, label: 'Pinnacle I → II', sub: 'Numerology turning point · New pinnacle begins', type: 'num', icon: '△' })
  events.push({ age: p1end + 9, label: 'Pinnacle II → III', sub: 'Numerology shift · Deeper purpose emerges', type: 'num', icon: '△' })
  events.push({ age: p1end + 18, label: 'Pinnacle III → IV', sub: 'Final pinnacle · Life mission', type: 'num', icon: '△' })

  // Chinese 12-year animal cycles
  const chineseAnimals = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig']
  for (let c = 12; c <= 84; c += 12) {
    const animalIdx = ((by + Math.floor(c/12)) % 12 + 12) % 12
    events.push({ age: c, label: `Chinese Cycle · ${chineseAnimals[animalIdx]}`, sub: `12-year wheel returns`, type: 'chi', icon: '☯' })
  }

  // Current age marker
  const currentAge = getAge(dob)
  events.push({ age: currentAge, label: 'NOW', sub: `Age ${currentAge} · Present moment`, type: 'now', icon: '◉', isNow: true })

  // Deduplicate by age+type, sort by age
  const seen = new Set()
  return events
    .filter(e => { const k = `${e.age}-${e.type}`; if (seen.has(k)) return false; seen.add(k); return true })
    .sort((a, b) => a.age - b.age)
}

export default function TimelineDetail() {
  const primaryProfile = useAboveInsideStore((s) => s.primaryProfile)
  const activeViewProfile = useAboveInsideStore((s) => s.activeViewProfile)
  const profile = activeViewProfile || primaryProfile

  const events = useMemo(() => buildEvents(profile.dob, profile.name), [profile.dob, profile.name])
  const currentAge = getAge(profile.dob)
  const scrollRef = useRef(null)

  // Scroll to NOW on mount
  useEffect(() => {
    if (!scrollRef.current) return
    const nowIdx = events.findIndex(e => e.isNow)
    if (nowIdx < 0) return
    const totalWidth = scrollRef.current.scrollWidth
    const fraction = currentAge / 90
    setTimeout(() => {
      scrollRef.current.scrollLeft = fraction * totalWidth - scrollRef.current.clientWidth / 2
    }, 100)
  }, [events, currentAge])

  const nextEvent = events.find(e => e.age > currentAge && !e.isNow)
  const yearsToNext = nextEvent ? nextEvent.age - currentAge : null

  // Layout: 0–90 years, each year = 80px
  const PX_PER_YEAR = 80
  const TOTAL_WIDTH = 90 * PX_PER_YEAR
  const LINE_Y = 160 // px from top of timeline area

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px 12px', borderBottom: '1px solid var(--accent)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, letterSpacing: '.2em', color: 'var(--foreground)', textTransform: 'uppercase' }}>
              ◈ Cosmic Life Timeline
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 3, fontStyle: 'italic' }}>
              {profile.name || 'Your'} · {profile.dob || '?'} · Age {currentAge}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: 'var(--foreground)' }}>{currentAge}</div>
              <div style={{ fontSize: 9, color: 'var(--muted-foreground)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Current Age</div>
            </div>
            {nextEvent && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: '#60b030' }}>{yearsToNext}y</div>
                <div style={{ fontSize: 9, color: 'var(--muted-foreground)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Next: {nextEvent.label.split('·')[0].trim()}</div>
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: '#40ccdd' }}>{events.length}</div>
              <div style={{ fontSize: 9, color: 'var(--muted-foreground)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Key Events</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
          {[
            { type: 'saturn', label: 'Saturn Return' },
            { type: 'jupiter', label: 'Jupiter Return' },
            { type: 'uranus', label: 'Uranus / Chiron' },
            { type: 'num', label: 'Numerology' },
            { type: 'chi', label: 'Chinese Cycle' },
            { type: 'hd', label: 'Human Design' },
            { type: 'now', label: 'Now' },
          ].map(({ type, label }) => {
            const c = FRAMEWORK_COLORS[type]
            return (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'var(--muted-foreground)', fontFamily: "'Cinzel',serif", letterSpacing: '.06em' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
                {label}
              </div>
            )
          })}
        </div>
      </div>

      {/* Timeline scroll area */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', position: 'relative', cursor: 'grab' }}
        onMouseDown={e => {
          const el = scrollRef.current
          const startX = e.pageX - el.offsetLeft
          const startScroll = el.scrollLeft
          const onMove = ev => { el.scrollLeft = startScroll - (ev.pageX - el.offsetLeft - startX) }
          const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
          document.addEventListener('mousemove', onMove)
          document.addEventListener('mouseup', onUp)
        }}
      >
        <div style={{ width: TOTAL_WIDTH + 120, minHeight: 340, position: 'relative', padding: '0 60px' }}>
          {/* Background decade bands */}
          {Array.from({ length: 9 }, (_, i) => i * 10).map(decade => (
            <div key={decade} style={{
              position: 'absolute',
              left: decade * PX_PER_YEAR + 60,
              top: 0, bottom: 0,
              width: 10 * PX_PER_YEAR,
              background: decade % 20 === 0 ? 'rgba(201,168,76,.02)' : 'transparent',
              borderLeft: '1px solid rgba(201,168,76,.06)',
            }}>
              <div style={{
                position: 'absolute', top: LINE_Y + 28, left: 4,
                fontFamily: "'Cinzel',serif", fontSize: 9, color: 'rgba(201,168,76,.3)', letterSpacing: '.1em',
              }}>
                {decade === 0 ? 'BIRTH' : `${decade}s`}
              </div>
            </div>
          ))}

          {/* Main timeline line */}
          <div style={{
            position: 'absolute',
            left: 60, right: 60,
            top: LINE_Y,
            height: 2,
            background: 'linear-gradient(90deg, rgba(201,168,76,0) 0%, rgba(201,168,76,.6) 5%, rgba(201,168,76,.6) 95%, rgba(201,168,76,0) 100%)',
            boxShadow: '0 0 12px rgba(201,168,76,.2)',
          }} />

          {/* Year ticks */}
          {Array.from({ length: 91 }, (_, i) => i).filter(y => y % 5 === 0).map(yr => (
            <div key={yr} style={{
              position: 'absolute',
              left: yr * PX_PER_YEAR + 60,
              top: LINE_Y - 4,
              width: 1,
              height: yr % 10 === 0 ? 10 : 6,
              background: 'rgba(201,168,76,.4)',
            }} />
          ))}

          {/* Events */}
          {events.map((evt, i) => {
            const c = FRAMEWORK_COLORS[evt.type] || FRAMEWORK_COLORS.astro
            const x = evt.age * PX_PER_YEAR + 60
            const above = i % 2 === 0
            const connectorHeight = above ? 60 + (i % 3) * 18 : 60 + (i % 3) * 18

            return (
              <div key={`${evt.age}-${evt.type}`}>
                {/* Connector line */}
                <div style={{
                  position: 'absolute',
                  left: x,
                  top: above ? LINE_Y - connectorHeight : LINE_Y + 4,
                  width: 1,
                  height: connectorHeight - 4,
                  background: `linear-gradient(${above ? '180deg' : '0deg'}, ${c.color}00, ${c.color}80)`,
                }} />

                {/* Node on line */}
                <div style={{
                  position: 'absolute',
                  left: x - (evt.isNow ? 8 : 5),
                  top: LINE_Y - (evt.isNow ? 8 : 5),
                  width: evt.isNow ? 16 : 10,
                  height: evt.isNow ? 16 : 10,
                  borderRadius: '50%',
                  background: c.bg,
                  border: `2px solid ${c.color}`,
                  boxShadow: `0 0 ${evt.isNow ? 20 : 8}px ${c.color}`,
                  zIndex: 2,
                  animation: evt.isNow ? 'pulse 2s infinite' : 'none',
                }}>
                  {evt.isNow && (
                    <div style={{
                      position: 'absolute', inset: -6,
                      borderRadius: '50%',
                      border: `1px solid ${c.color}`,
                      opacity: 0.4,
                      animation: 'pulse 2s infinite',
                    }} />
                  )}
                </div>

                {/* Label card */}
                <div style={{
                  position: 'absolute',
                  left: x - 60,
                  top: above ? LINE_Y - connectorHeight - 68 : LINE_Y + connectorHeight + 6,
                  width: 120,
                  padding: '6px 8px',
                  borderRadius: 8,
                  background: evt.isNow ? 'rgba(255,255,255,.08)' : c.bg,
                  border: `1px solid ${c.border}`,
                  textAlign: 'center',
                  zIndex: 3,
                }}>
                  <div style={{ fontSize: 14, marginBottom: 2 }}>{evt.icon}</div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, color: c.color, letterSpacing: '.04em', lineHeight: 1.3 }}>{evt.label}</div>
                  <div style={{ fontSize: 8, color: 'var(--muted-foreground)', marginTop: 3, lineHeight: 1.4 }}>{evt.sub}</div>
                  <div style={{ fontFamily: "'Inconsolata',monospace", fontSize: 8, color: c.color, marginTop: 3, opacity: .7 }}>
                    Age {evt.age} · {getBirthYear(profile.dob) + evt.age}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom scroll hint */}
      <div style={{ padding: '8px 24px', borderTop: '1px solid rgba(201,168,76,.06)', flexShrink: 0, textAlign: 'center' }}>
        <span style={{ fontSize: 9, color: 'var(--muted-foreground)', fontFamily: "'Cinzel',serif", letterSpacing: '.1em' }}>
          ← DRAG TO SCROLL · COSMIC JOURNEY FROM BIRTH TO 90 →
        </span>
      </div>
    </div>
  )
}
