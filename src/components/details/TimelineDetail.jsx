import { useMemo, useState } from 'react'
import { useActiveProfile } from '../../hooks/useActiveProfile'
import { getVedicChart } from '../../engines/vedicEngine'
import { getNumerologyProfileFromDob } from '../../engines/numerologyEngine'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function reduceNum(n) {
  while (n > 9) { n = String(n).split('').reduce((a, d) => a + +d, 0) }
  return n
}

function getPersonalYear(birthMonth, birthDay, year) {
  return reduceNum(birthMonth + birthDay + year)
}

// ─── Color palette ────────────────────────────────────────────────────────────
const COLORS = {
  dasha:   '#9b59e0',  // purple
  saturn:  '#f0c040',  // gold
  jupret:  '#40b0ff',  // blue
  chiron:  '#20c0b0',  // teal
  numcyc:  '#50c060',  // green
  numchg:  '#c0d060',  // lime
  challenge: '#e05050', // red
  today:   '#ffffff',
  hd:      '#e080ff',  // lavender
  mayan:   '#ff9f40',  // amber-orange
}

const DASHA_GLYPHS = {
  Sun: '☀', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃',
  Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
}

const PERSONAL_YEAR_LABEL = {
  1: 'New Beginnings',  2: 'Cooperation',  3: 'Expansion',
  4: 'Foundation',      5: 'Major Change', 6: 'Harmony',
  7: 'Reflection',      8: 'Abundance',    9: 'Completion',
}

// HD Gate Key themes for 7-year cycles (simplified, based on Rave cycle)
const HD_GATE_CYCLES = [
  { offset: 0,  gate: 1,  theme: 'Self-Expression',    desc: '7-year gate cycle opens: Gate 1 — The Creative Self initiates its arc' },
  { offset: 7,  gate: 13, theme: 'Fellowship & Memory', desc: 'Gate 13 — The Listener. Gathering the stories that will shape the next phase' },
  { offset: 14, gate: 2,  theme: 'Direction & Drive',   desc: 'Gate 2 — The Receptive. Receiving new direction from Higher Self' },
  { offset: 21, gate: 7,  theme: 'Leadership & Role',   desc: 'Gate 7 — The Alpha. Stepping into or releasing leadership position' },
  { offset: 28, gate: 28, theme: 'Struggle & Purpose',  desc: 'Gate 28 — The Game Player. Finding what is worth fighting for' },
  { offset: 35, gate: 35, theme: 'Change & Experience', desc: 'Gate 35 — Change. A hunger for new experience drives transformation' },
  { offset: 42, gate: 3,  theme: 'Ordering Chaos',      desc: 'Gate 3 — Difficulty at the Beginning. New order emerging from disorder' },
  { offset: 49, gate: 49, theme: 'Revolution',          desc: 'Gate 49 — Revolution. Old agreements end; new ones form' },
  { offset: 56, gate: 56, theme: 'Stimulation & Story', desc: 'Gate 56 — The Storyteller. Transmitting the arc of this life cycle' },
]

// Mayan Wavespell themes (13-day, simplified to annual markers for lifespan)
const MAYAN_WAVESPELLS = [
  { id: 'dragon',   icon: '🐉', name: 'Red Dragon',    theme: 'Nurturing primordial birth energy' },
  { id: 'wind',     icon: '🌬️', name: 'White Wind',    theme: 'Spirit communication; divine breath' },
  { id: 'night',    icon: '🌑', name: 'Blue Night',    theme: 'Dreaming into the abyss; abundance' },
  { id: 'seed',     icon: '🌱', name: 'Yellow Seed',   theme: 'Targeting awareness; flowering' },
  { id: 'serpent',  icon: '🐍', name: 'Red Serpent',   theme: 'Life force, instinct, survival' },
  { id: 'worldbridger', icon: '⚖️', name: 'White Worldbridger', theme: 'Death, change, opportunity' },
  { id: 'hand',     icon: '✋', name: 'Blue Hand',     theme: 'Accomplishment, knowing, healing' },
  { id: 'star',     icon: '⭐', name: 'Yellow Star',   theme: 'Art, elegance, beauty frequency' },
  { id: 'moon',     icon: '🌙', name: 'Red Moon',      theme: 'Universal water; purification' },
  { id: 'dog',      icon: '🐕', name: 'White Dog',     theme: 'Heart, loyalty, unconditional love' },
  { id: 'monkey',   icon: '🐒', name: 'Blue Monkey',   theme: 'Magic, illusion, divine child' },
  { id: 'human',    icon: '🧑', name: 'Yellow Human',  theme: 'Free will, wisdom, influence' },
  { id: 'skywalker',icon: '🌸', name: 'Red Skywalker', theme: 'Space, wakefulness, angelic prophecy' },
  { id: 'wizard',   icon: '🧙', name: 'White Wizard',  theme: 'Timelessness, receptivity, enchantment' },
  { id: 'eagle',    icon: '🦅', name: 'Blue Eagle',    theme: 'Vision, mind, planetary consciousness' },
  { id: 'warrior',  icon: '⚔️', name: 'Yellow Warrior', theme: 'Intelligence, fearlessness, questioning' },
  { id: 'earth',    icon: '🌍', name: 'Red Earth',     theme: 'Evolution, synchronicity, navigation' },
  { id: 'mirror',   icon: '🪞', name: 'White Mirror',  theme: 'Reflection, order, endlessness' },
  { id: 'storm',    icon: '⛈️', name: 'Blue Storm',   theme: 'Self-generation, energy, catalysis' },
  { id: 'sun',      icon: '☀️', name: 'Yellow Sun',    theme: 'Universal fire, life, enlightenment' },
]

// ─── Overlay definitions ──────────────────────────────────────────────────────

const OVERLAYS = [
  { id: 'astrology',  label: 'Astrology',  icon: '☉', desc: 'Saturn, Jupiter, Chiron cycles' },
  { id: 'numerology', label: 'Numerology', icon: '∞', desc: 'Personal Year peaks' },
  { id: 'genekeys',   label: 'Gene Keys',  icon: '⬡', desc: 'Dasha × Gene Key correlations' },
  { id: 'hd',         label: 'Human Design', icon: '◈', desc: '7-year gate cycles' },
  { id: 'mayan',      label: 'Mayan',      icon: '🌸', desc: 'Wavespell 13-day cycles' },
]

// ─── Build timeline events ────────────────────────────────────────────────────

function buildEvents(profile) {
  const dob = profile?.dob || ''
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null

  const [birthYear, birthMonth, birthDay] = dob.split('-').map(Number)
  const now = new Date()
  const currentYear = now.getFullYear()
  const rangeStart = birthYear
  const rangeEnd = currentYear + 20

  const events = []

  // ── 1. Vedic Dasha periods (→ genekeys overlay) ─────────────────────────────
  try {
    const tob = profile?.tob || '12:00'
    const [bh, bm] = tob.split(':').map(n => +n || 0)
    const lat = profile?.birthLat || 0
    const lon = profile?.birthLon || 0
    const tz = profile?.birthTimezone || 0
    const v = getVedicChart({ day: birthDay, month: birthMonth, year: birthYear, hour: bh || 12, minute: bm || 0, lat, lon, timezone: tz })
    if (v?.dasha?.sequence) {
      for (const d of v.dasha.sequence) {
        const startYr = new Date(d.start).getFullYear() + new Date(d.start).getMonth() / 12
        const endYr = new Date(d.end).getFullYear() + new Date(d.end).getMonth() / 12
        if (endYr < rangeStart || startYr > rangeEnd) continue
        events.push({
          year: startYr,
          yearDisplay: d.start.slice(0, 7),
          icon: DASHA_GLYPHS[d.lord] || '✦',
          label: `Dasha: ${d.lord}`,
          desc: `Vimshottari period governed by ${d.lord} — ${Math.round(d.years)} years (until ${d.end.slice(0,7)})`,
          color: COLORS.dasha,
          type: 'dasha',
          overlay: 'genekeys',
          endYear: endYr,
        })
      }
    }
  } catch { /* skip dasha if birth time unknown */ }

  // ── 2. Saturn milestones (→ astrology overlay) ──────────────────────────────
  const saturnEvents = [
    { offset: 7.4,  label: 'Saturn Square I',      desc: 'First major test of character; childhood pressure and structure emerge', color: COLORS.challenge, icon: '♄' },
    { offset: 14.75,label: 'Saturn Opposition I',   desc: 'Awareness of external authority; tension between self and others', color: COLORS.challenge, icon: '♄' },
    { offset: 22.1, label: 'Saturn Square II',      desc: 'Mid-twenties friction; confronting limitations and ambitions', color: COLORS.challenge, icon: '♄' },
    { offset: 29.5, label: 'Saturn Return I',       desc: 'First Saturn Return — defining adulthood; structures must be real or they collapse', color: COLORS.saturn, icon: '♄' },
    { offset: 36.8, label: 'Saturn Square III',     desc: 'Mid-life friction; re-evaluating commitments and foundations', color: COLORS.challenge, icon: '♄' },
    { offset: 44.25,label: 'Saturn Opposition II',  desc: 'Second opposition — midlife confrontation with authority and time', color: COLORS.challenge, icon: '♄' },
    { offset: 59,   label: 'Saturn Return II',      desc: 'Second Saturn Return — harvesting lifework; radical life review', color: COLORS.saturn, icon: '♄' },
    { offset: 66.5, label: 'Saturn Square IV',      desc: 'Late-life testing; legacy and accountability', color: COLORS.challenge, icon: '♄' },
  ]
  for (const { offset, label, desc, color, icon } of saturnEvents) {
    const yr = birthYear + offset
    if (yr < rangeStart || yr > rangeEnd) continue
    events.push({ year: yr, yearDisplay: String(Math.round(yr)), icon, label, desc, color, type: 'saturn', overlay: 'astrology' })
  }

  // ── 3. Jupiter Returns (→ astrology overlay) ────────────────────────────────
  for (let i = 1; birthYear + i * 12 <= rangeEnd; i++) {
    const yr = birthYear + i * 12
    if (yr < rangeStart) continue
    events.push({
      year: yr, yearDisplay: String(yr), icon: '♃',
      label: `Jupiter Return #${i}`,
      desc: `12-year Jupiter cycle peak — expansion, luck, and philosophical awakening`,
      color: COLORS.jupret, type: 'jupiter', overlay: 'astrology',
    })
  }

  // ── 4. Chiron Return (→ astrology overlay) ──────────────────────────────────
  const chironYr = birthYear + 50
  if (chironYr >= rangeStart && chironYr <= rangeEnd) {
    events.push({
      year: chironYr, yearDisplay: String(chironYr), icon: '⚷',
      label: 'Chiron Return',
      desc: 'Healing the core wound; integration of vulnerability becomes profound wisdom',
      color: COLORS.chiron, type: 'chiron', overlay: 'astrology',
    })
  }

  // ── 5. Numerology cycles (→ numerology overlay) ─────────────────────────────
  try {
    const name = profile?.name || 'Unknown'
    const numProfile = getNumerologyProfileFromDob(dob, name, {
      currentYear, currentMonth: now.getMonth() + 1, currentDay: now.getDate()
    })
    const lifePath = numProfile.core.lifePath.val

    // Pinnacle transitions
    const pinnacles = numProfile.pinnacles
    const ageEnds = numProfile.extended ? [
      36 - lifePath,
      36 - lifePath + 9,
      36 - lifePath + 18,
    ] : []
    const pinnacleYears = ageEnds.map(age => birthYear + age)
    pinnacleYears.forEach((yr, i) => {
      if (yr < rangeStart || yr > rangeEnd) return
      const p = pinnacles[i + 1]
      if (!p) return
      events.push({
        year: yr, yearDisplay: String(yr), icon: `${p.num}`,
        label: `Pinnacle ${['I','II','III','IV'][i + 1] || i + 2} begins`,
        desc: `${p.title} (${p.num}) — ${p.desc}`,
        color: COLORS.numchg, type: 'numerology', overlay: 'numerology',
      })
    })

    // Personal Year 1 cycles (new 9-year cycles)
    for (let yr = birthYear; yr <= rangeEnd; yr++) {
      const py = getPersonalYear(birthMonth, birthDay, yr)
      if (py === 1 && yr >= rangeStart) {
        events.push({
          year: yr, yearDisplay: String(yr), icon: '1',
          label: 'Personal Year 1 — New Cycle',
          desc: 'A fresh 9-year chapter begins: initiation, independence, planting seeds',
          color: COLORS.numcyc, type: 'numerology', overlay: 'numerology',
        })
      }
      // Life Path year (when PY = lifePath number) — significant integration year
      if (py === lifePath && yr >= rangeStart && yr > birthYear) {
        events.push({
          year: yr + 0.1, yearDisplay: String(yr), icon: `${lifePath}★`,
          label: `Life Path Year (PY ${lifePath})`,
          desc: `Personal year matches Life Path ${lifePath} — peak alignment with your core mission`,
          color: '#f0a040', type: 'numerology', overlay: 'numerology',
        })
      }
    }
  } catch { /* skip numerology if engine fails */ }

  // ── 6. Human Design 7-year gate cycles (→ hd overlay) ──────────────────────
  for (const cycle of HD_GATE_CYCLES) {
    const yr = birthYear + cycle.offset
    if (yr < rangeStart || yr > rangeEnd) continue
    events.push({
      year: yr, yearDisplay: String(yr), icon: '◈',
      label: `HD Gate ${cycle.gate} — ${cycle.theme}`,
      desc: cycle.desc,
      color: COLORS.hd, type: 'hd', overlay: 'hd',
    })
  }

  // ── 7. Mayan Wavespell cycles (→ mayan overlay) ─────────────────────────────
  // Approximate: 20-wavespell Tzolkin repeats every 260 days (~0.71 years)
  // We mark year-level wavespell entry points across the lifespan
  const tzolkinYear = 260 / 365.25
  for (let i = 0; i <= Math.ceil((rangeEnd - birthYear) / tzolkinYear); i++) {
    const yr = birthYear + i * tzolkinYear
    if (yr < rangeStart || yr > rangeEnd) continue
    const wavespell = MAYAN_WAVESPELLS[i % MAYAN_WAVESPELLS.length]
    events.push({
      year: yr, yearDisplay: yr.toFixed(1),
      icon: wavespell.icon,
      label: `Wavespell: ${wavespell.name}`,
      desc: wavespell.theme,
      color: COLORS.mayan, type: 'mayan', overlay: 'mayan',
    })
  }

  // Sort by year
  events.sort((a, b) => a.year - b.year)

  return { events, birthYear, currentYear, rangeStart, rangeEnd }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EventDot({ color, size = 12 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color + '20', border: `2px solid ${color}`,
      flexShrink: 0, position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 2, borderRadius: '50%',
        background: color + '60',
      }} />
    </div>
  )
}

function TypeBadge({ type, color }) {
  const labels = {
    dasha: 'Vedic', saturn: 'Saturn', jupiter: 'Jupiter',
    chiron: 'Chiron', numerology: 'Numerology',
    hd: 'Human Design', mayan: 'Mayan',
  }
  return (
    <span style={{
      display: 'inline-block', padding: '1px 6px', borderRadius: 8,
      fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase',
      fontFamily: "'Cinzel', serif",
      background: color + '15', border: `1px solid ${color}40`, color,
    }}>
      {labels[type] || type}
    </span>
  )
}

function TimelineEvent({ ev, isPast, isNear }) {
  const isLeft = isPast
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      flexDirection: isLeft ? 'row' : 'row-reverse',
      marginBottom: 6,
      opacity: isPast ? 0.65 : 1,
    }}>
      {/* Content card */}
      <div style={{
        flex: 1, maxWidth: 'calc(50% - 24px)',
        background: isNear ? ev.color + '08' : 'var(--card)',
        border: `1px solid ${isNear ? ev.color + '50' : 'var(--border)'}`,
        borderRadius: 10, padding: '8px 12px',
        textAlign: isLeft ? 'right' : 'left',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: isLeft ? 'flex-end' : 'flex-start', marginBottom: 3 }}>
          <span style={{ fontSize: 15, color: ev.color }}>{ev.icon}</span>
          <span style={{
            fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 600,
            color: ev.color, letterSpacing: '.06em',
          }}>{ev.yearDisplay}</span>
          <TypeBadge type={ev.type} color={ev.color} />
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600, color: 'var(--foreground)',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          lineHeight: 1.3, marginBottom: 3,
        }}>
          {ev.label}
        </div>
        <div style={{
          fontSize: 10.5, color: 'var(--muted-foreground)', lineHeight: 1.5,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
        }}>
          {ev.desc}
        </div>
      </div>

      {/* Dot on spine */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 12 }}>
        <EventDot color={ev.color} />
      </div>

      {/* Year label on opposite side (empty spacer) */}
      <div style={{ flex: 1, maxWidth: 'calc(50% - 24px)' }} />
    </div>
  )
}

// ─── Overlay toggle pill ──────────────────────────────────────────────────────

function OverlayPill({ overlay, active, onToggle }) {
  const overlayColors = {
    astrology:  '#f0c040',
    numerology: '#50c060',
    genekeys:   '#9b59e0',
    hd:         '#e080ff',
    mayan:      '#ff9f40',
  }
  const col = overlayColors[overlay.id] || '#888'
  return (
    <button
      onClick={() => onToggle(overlay.id)}
      title={overlay.desc}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 10px', borderRadius: 20, fontSize: 10, cursor: 'pointer',
        fontFamily: "'Cinzel', serif", letterSpacing: '.06em',
        background: active ? col + '20' : 'rgba(255,255,255,.04)',
        border: `1px solid ${active ? col + '70' : 'rgba(255,255,255,.1)'}`,
        color: active ? col : 'rgba(255,255,255,.3)',
        transition: 'all .15s',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: 11 }}>{overlay.icon}</span>
      {overlay.label}
    </button>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function TimelineDetail() {
  const profile = useActiveProfile()
  const [activeOverlays, setActiveOverlays] = useState(['astrology'])

  function toggleOverlay(id) {
    setActiveOverlays(prev =>
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    )
  }

  const result = useMemo(() => {
    try {
      return buildEvents(profile)
    } catch {
      console.error('TimelineDetail error:', e)
      return null
    }
  }, [
    profile?.dob, profile?.name, profile?.tob,
    profile?.birthLat, profile?.birthLon, profile?.birthTimezone,
  ])

  // Empty state
  if (!result) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        height: '100%', gap: 12, color: 'var(--muted-foreground)',
        fontFamily: "'Cinzel', serif", letterSpacing: '.1em', textTransform: 'uppercase',
        textAlign: 'center', padding: 32,
      }}>
        <div style={{ fontSize: 32, opacity: 0.4 }}>⏳</div>
        <div style={{ fontSize: 11 }}>Add your birth date to see your Timeline</div>
      </div>
    )
  }

  const { events, birthYear, currentYear } = result
  const now = new Date()
  const nowDecimal = currentYear + (now.getMonth() / 12)

  // Filter events by active overlays
  const filteredEvents = events.filter(ev => activeOverlays.includes(ev.overlay))

  // Legend items — only show active
  const legendItems = [
    { color: COLORS.dasha,     label: 'Vedic Dasha',        overlay: 'genekeys' },
    { color: COLORS.saturn,    label: 'Saturn Return',       overlay: 'astrology' },
    { color: COLORS.challenge, label: 'Saturn Square/Opp',   overlay: 'astrology' },
    { color: COLORS.jupret,    label: 'Jupiter Return',      overlay: 'astrology' },
    { color: COLORS.chiron,    label: 'Chiron',              overlay: 'astrology' },
    { color: COLORS.numcyc,    label: 'New Cycle (PY1)',     overlay: 'numerology' },
    { color: COLORS.numchg,    label: 'Pinnacle Shift',      overlay: 'numerology' },
    { color: '#f0a040',        label: 'Life Path Year',      overlay: 'numerology' },
    { color: COLORS.hd,        label: 'HD Gate Cycle',       overlay: 'hd' },
    { color: COLORS.mayan,     label: 'Mayan Wavespell',     overlay: 'mayan' },
  ].filter(item => activeOverlays.includes(item.overlay))

  return (
    <div style={{
      width: '100%', height: '100%', overflowY: 'auto',
      padding: '24px 20px 40px', boxSizing: 'border-box',
      background: 'var(--card)', color: 'var(--foreground)',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: 18, letterSpacing: '.25em',
          textTransform: 'uppercase', color: 'var(--foreground)', fontWeight: 600, marginBottom: 6,
        }}>
          Timeline
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          Your life arc across Vedic, astrological & numerological cycles
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4 }}>
          {birthYear} → {currentYear + 20}
        </div>
      </div>

      {/* ── Overlay toggle bar ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center',
        marginBottom: 16, padding: '10px 14px',
        background: 'rgba(0,0,0,.2)', borderRadius: 12,
        border: '1px solid var(--border)',
      }}>
        <div style={{
          width: '100%', textAlign: 'center', fontSize: 8, letterSpacing: '.12em',
          textTransform: 'uppercase', color: 'rgba(201,168,76,.4)',
          fontFamily: "'Cinzel', serif", marginBottom: 4,
        }}>
          System Overlays
        </div>
        {OVERLAYS.map(overlay => (
          <OverlayPill
            key={overlay.id}
            overlay={overlay}
            active={activeOverlays.includes(overlay.id)}
            onToggle={toggleOverlay}
          />
        ))}
      </div>

      {/* Legend (filtered) */}
      {legendItems.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center',
          marginBottom: 28, padding: '10px 14px',
          background: 'var(--accent)', borderRadius: 10,
          border: '1px solid var(--border)',
        }}>
          {legendItems.map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 9, color: 'var(--muted-foreground)', letterSpacing: '.05em' }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty overlay state */}
      {filteredEvents.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          color: 'var(--muted-foreground)', fontFamily: "'Cinzel', serif",
          fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.5,
        }}>
          ◇ No systems active — enable an overlay above
        </div>
      )}

      {/* Timeline */}
      {filteredEvents.length > 0 && (
        <div style={{ position: 'relative' }}>
          {/* Spine */}
          <div style={{
            position: 'absolute',
            left: '50%', top: 0, bottom: 0,
            width: 2,
            background: 'linear-gradient(to bottom, transparent, var(--border) 5%, var(--border) 95%, transparent)',
            transform: 'translateX(-50%)',
            zIndex: 0,
          }} />

          {/* Birth marker */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1, marginBottom: 16,
          }}>
            <div style={{
              background: 'var(--card)', padding: '4px 16px', borderRadius: 20,
              border: '1px solid var(--border)', fontSize: 10,
              fontFamily: "'Cinzel', serif", letterSpacing: '.15em',
              textTransform: 'uppercase', color: 'var(--muted-foreground)',
            }}>
              ✦ Born {birthYear}
            </div>
          </div>

          {/* Events */}
          {filteredEvents.map((ev, i) => {
            const isPast = ev.year < nowDecimal
            const isNear = !isPast && (ev.year - nowDecimal) < 2

            // TODAY marker: insert before first future event
            const prevEv = filteredEvents[i - 1]
            const showToday = !isPast && (i === 0 || (prevEv && prevEv.year < nowDecimal))

            return (
              <div key={`${ev.label}-${ev.year}-${i}`}>
                {showToday && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', zIndex: 2, margin: '8px 0 16px',
                  }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(8px)',
                      padding: '5px 20px', borderRadius: 20,
                      border: '1px solid rgba(255,255,255,0.3)',
                      fontSize: 10, fontFamily: "'Cinzel', serif", letterSpacing: '.2em',
                      textTransform: 'uppercase', color: '#ffffff', fontWeight: 700,
                      boxShadow: '0 0 16px rgba(255,255,255,0.1)',
                    }}>
                      ◈ Today {currentYear}
                    </div>
                  </div>
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <TimelineEvent ev={ev} isPast={isPast} isNear={isNear} />
                </div>
              </div>
            )
          })}

          {/* Future horizon */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1, marginTop: 16,
          }}>
            <div style={{
              background: 'var(--card)', padding: '4px 16px', borderRadius: 20,
              border: '1px solid var(--border)', fontSize: 10,
              fontFamily: "'Cinzel', serif", letterSpacing: '.15em',
              textTransform: 'uppercase', color: 'var(--muted-foreground)', opacity: 0.5,
            }}>
              ∞ Horizon {currentYear + 20}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
