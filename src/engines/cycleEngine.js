/**
 * Cycle Engine — Menstrual cycle tracking linked to moon phases.
 * Inspired by Stardust app. Computes cycle phases, moon phase correlation,
 * fertility windows, and energy patterns.
 */

// Moon phase calculation (simplified Meeus)
export function getMoonPhase(date = new Date()) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  let c = 0
  let y = year
  let m = month
  if (m < 3) { y--; m += 12 }
  c = Math.floor(y / 100)
  const b = 2 - c + Math.floor(c / 4)
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5

  const daysSinceNew = jd - 2451550.1
  const newMoons = daysSinceNew / 29.530588853
  const phase = newMoons - Math.floor(newMoons)

  const phaseAngle = phase * 360
  let phaseName, phaseEmoji, phaseEnergy

  if (phaseAngle < 22.5) { phaseName = 'New Moon'; phaseEmoji = '🌑'; phaseEnergy = 'Inward reflection, planting seeds' }
  else if (phaseAngle < 67.5) { phaseName = 'Waxing Crescent'; phaseEmoji = '🌒'; phaseEnergy = 'Setting intentions, gentle growth' }
  else if (phaseAngle < 112.5) { phaseName = 'First Quarter'; phaseEmoji = '🌓'; phaseEnergy = 'Taking action, overcoming challenges' }
  else if (phaseAngle < 157.5) { phaseName = 'Waxing Gibbous'; phaseEmoji = '🌔'; phaseEnergy = 'Refinement, building momentum' }
  else if (phaseAngle < 202.5) { phaseName = 'Full Moon'; phaseEmoji = '🌕'; phaseEnergy = 'Peak energy, illumination, release' }
  else if (phaseAngle < 247.5) { phaseName = 'Waning Gibbous'; phaseEmoji = '🌖'; phaseEnergy = 'Gratitude, sharing wisdom' }
  else if (phaseAngle < 292.5) { phaseName = 'Last Quarter'; phaseEmoji = '🌗'; phaseEnergy = 'Letting go, forgiveness' }
  else if (phaseAngle < 337.5) { phaseName = 'Waning Crescent'; phaseEmoji = '🌘'; phaseEnergy = 'Rest, surrender, dreaming' }
  else { phaseName = 'New Moon'; phaseEmoji = '🌑'; phaseEnergy = 'Inward reflection, planting seeds' }

  return { phase, phaseAngle, phaseName, phaseEmoji, phaseEnergy, illumination: Math.round(Math.abs(Math.cos(phase * Math.PI * 2) * -50 + 50)) }
}

// Cycle phase names and their moon correlations
const CYCLE_PHASES = [
  { name: 'Menstrual', days: [1, 5], moonCorrelation: 'New Moon', color: '#c44d7a', emoji: '🌑', archetype: 'The Wise Woman', energy: 'Release, rest, inner vision. Your body is shedding — honor the descent.', element: 'Water' },
  { name: 'Follicular', days: [6, 13], moonCorrelation: 'Waxing Moon', color: '#60b030', emoji: '🌒', archetype: 'The Maiden', energy: 'Rising energy, creativity, new beginnings. Estrogen climbs — you are becoming.', element: 'Air' },
  { name: 'Ovulatory', days: [14, 17], moonCorrelation: 'Full Moon', color: '#f0c040', emoji: '🌕', archetype: 'The Mother', energy: 'Peak magnetism, communication, connection. You radiate.', element: 'Fire' },
  { name: 'Luteal', days: [18, 28], moonCorrelation: 'Waning Moon', color: '#aa66ff', emoji: '🌘', archetype: 'The Enchantress', energy: 'Turning inward, nesting, truth-telling. Progesterone asks for honesty.', element: 'Earth' },
]

export function getCyclePhase(cycleDay) {
  for (const phase of CYCLE_PHASES) {
    if (cycleDay >= phase.days[0] && cycleDay <= phase.days[1]) return phase
  }
  return CYCLE_PHASES[3] // default to luteal
}

export function computeCycleProfile(lastPeriodDate, cycleLength = 28) {
  const today = new Date()
  const lastPeriod = new Date(lastPeriodDate)
  const diffMs = today - lastPeriod
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const cycleDay = ((diffDays % cycleLength) + cycleLength) % cycleLength + 1

  const currentPhase = getCyclePhase(cycleDay)
  const moonPhase = getMoonPhase(today)

  // Calculate fertility window (typically days 10-17 of a 28-day cycle)
  const fertileStart = Math.round(cycleLength * 0.36)
  const fertileEnd = Math.round(cycleLength * 0.61)
  const isFertile = cycleDay >= fertileStart && cycleDay <= fertileEnd
  const ovulationDay = Math.round(cycleLength * 0.5)
  const daysToOvulation = ovulationDay - cycleDay

  // Moon-cycle alignment score
  const moonCycleAlignment = computeMoonAlignment(currentPhase, moonPhase)

  // Next period prediction
  const daysToNextPeriod = cycleLength - cycleDay + 1
  const nextPeriodDate = new Date(today.getTime() + daysToNextPeriod * 24 * 60 * 60 * 1000)

  // Energy forecast for the week
  const weekForecast = []
  for (let i = 0; i < 7; i++) {
    const futureDay = ((cycleDay + i - 1) % cycleLength) + 1
    const futureDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
    const futureMoon = getMoonPhase(futureDate)
    const futurePhase = getCyclePhase(futureDay)
    weekForecast.push({
      day: futureDay,
      date: futureDate,
      phase: futurePhase,
      moon: futureMoon,
      alignment: computeMoonAlignment(futurePhase, futureMoon),
    })
  }

  return {
    cycleDay,
    cycleLength,
    currentPhase,
    moonPhase,
    moonCycleAlignment,
    isFertile,
    fertileWindow: { start: fertileStart, end: fertileEnd },
    ovulationDay,
    daysToOvulation,
    daysToNextPeriod,
    nextPeriodDate,
    weekForecast,
    phases: CYCLE_PHASES,
  }
}

function computeMoonAlignment(cyclePhase, moonPhase) {
  // Higher score when cycle phase matches its traditional moon correlation
  const correlationMap = {
    'Menstrual': ['New Moon', 'Waning Crescent'],
    'Follicular': ['Waxing Crescent', 'First Quarter'],
    'Ovulatory': ['Full Moon', 'Waxing Gibbous'],
    'Luteal': ['Waning Gibbous', 'Last Quarter'],
  }

  const matchPhases = correlationMap[cyclePhase.name] || []
  if (matchPhases.includes(moonPhase.phaseName)) return { score: 95, label: 'Deep Alignment', description: `Your ${cyclePhase.name.toLowerCase()} phase aligns with the ${moonPhase.phaseName} — ancient wisdom says this is the "White Moon" or "Red Moon" cycle, amplifying your ${cyclePhase.archetype} archetype.` }

  // Partial alignment
  const phaseIndex = CYCLE_PHASES.findIndex(p => p.name === cyclePhase.name)
  const moonIndex = Math.floor(moonPhase.phaseAngle / 90)
  const distance = Math.abs(phaseIndex - moonIndex)
  if (distance <= 1) return { score: 65, label: 'Partial Resonance', description: `Your cycle and the moon are in neighboring phases — there's a gentle pull between your ${cyclePhase.element} energy and the lunar tide.` }

  return { score: 35, label: 'Creative Tension', description: `Your ${cyclePhase.name.toLowerCase()} phase runs counter to the ${moonPhase.phaseName} — this creates productive tension. Your inner rhythm has its own authority.` }
}

export { CYCLE_PHASES }
