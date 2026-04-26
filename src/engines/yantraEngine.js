/**
 * yantraEngine.js
 *
 * Vedic timing engine for Yantra creation.
 * Calculates hora (planetary hours), tithis (lunar days),
 * and muhurtas to determine auspicious windows for sacred geometry work.
 */

// ─── Planetary day rulers ─────────────────────────────────────────────────────
const DAY_RULERS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
const HORA_SEQUENCE = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars']

// Planet data for display
const PLANET_DATA = {
  Sun:     { symbol: '☉', color: '#e0a040', element: 'Fire' },
  Moon:    { symbol: '☽', color: '#c0c8e0', element: 'Water' },
  Mars:    { symbol: '♂', color: '#e05040', element: 'Fire' },
  Mercury: { symbol: '☿', color: '#60b880', element: 'Earth' },
  Jupiter: { symbol: '♃', color: '#f0c040', element: 'Ether' },
  Venus:   { symbol: '♀', color: '#d860a0', element: 'Water' },
  Saturn:  { symbol: '♄', color: '#8080a0', element: 'Air' },
}

// ─── Yantra definitions ───────────────────────────────────────────────────────
const YANTRAS = [
  {
    id: 'sri',
    name: 'Sri Yantra',
    sanskrit: 'श्री यन्त्र',
    deity: 'Lakshmi / Tripura Sundari',
    planet: 'Venus',
    purpose: 'Abundance, prosperity, divine feminine power',
    bestDay: 'Friday',
    bestTithis: [5, 10, 15],
    description: 'The supreme yantra — 9 interlocking triangles forming 43 smaller triangles, representing the union of Shiva and Shakti. The most powerful yantra in the Tantric tradition.',
    complexity: 5,
    rings: 9,
    triangles: 43,
  },
  {
    id: 'ganesh',
    name: 'Ganesh Yantra',
    sanskrit: 'गणेश यन्त्र',
    deity: 'Ganesha',
    planet: 'Jupiter',
    purpose: 'Remove obstacles, new beginnings, wisdom',
    bestDay: 'Thursday',
    bestTithis: [4, 5, 13],
    description: 'Invokes the energy of the remover of obstacles. Created at the start of any new venture or when facing blockages in life.',
    complexity: 3,
    rings: 6,
    triangles: 8,
  },
  {
    id: 'durga',
    name: 'Durga Yantra',
    sanskrit: 'दुर्गा यन्त्र',
    deity: 'Durga',
    planet: 'Mars',
    purpose: 'Protection, courage, overcoming enemies',
    bestDay: 'Tuesday',
    bestTithis: [3, 8, 13],
    description: 'Shield of the divine warrior goddess. Used for protection from negative energies, enemies, and inner demons.',
    complexity: 4,
    rings: 7,
    triangles: 16,
  },
  {
    id: 'saraswati',
    name: 'Saraswati Yantra',
    sanskrit: 'सरस्वती यन्त्र',
    deity: 'Saraswati',
    planet: 'Mercury',
    purpose: 'Knowledge, creativity, speech, learning',
    bestDay: 'Wednesday',
    bestTithis: [5, 7, 10],
    description: 'Sacred to the goddess of knowledge and the arts. Enhances intellect, creativity, and eloquent expression.',
    complexity: 3,
    rings: 5,
    triangles: 6,
  },
  {
    id: 'shiva',
    name: 'Shiva Yantra',
    sanskrit: 'शिव यन्त्र',
    deity: 'Shiva',
    planet: 'Sun',
    purpose: 'Transcendence, dissolution of ego, pure consciousness',
    bestDay: 'Sunday',
    bestTithis: [11, 13, 14],
    description: 'The yantra of pure awareness. Used for meditation, spiritual practice, and dissolution of material attachments.',
    complexity: 4,
    rings: 8,
    triangles: 12,
  },
  {
    id: 'kubera',
    name: 'Kubera Yantra',
    sanskrit: 'कुबेर यन्त्र',
    deity: 'Kubera',
    planet: 'Jupiter',
    purpose: 'Material wealth, financial success, treasure',
    bestDay: 'Thursday',
    bestTithis: [2, 5, 10, 15],
    description: 'Yantra of the lord of wealth. Used specifically for attracting material abundance and financial security.',
    complexity: 2,
    rings: 4,
    triangles: 4,
  },
  {
    id: 'kali',
    name: 'Kali Yantra',
    sanskrit: 'काली यन्त्र',
    deity: 'Kali',
    planet: 'Saturn',
    purpose: 'Transformation, destruction of illusion, time mastery',
    bestDay: 'Saturday',
    bestTithis: [8, 14],
    description: 'The fierce yantra of time and transformation. Used for deep shadow work, karmic release, and radical transformation.',
    complexity: 5,
    rings: 8,
    triangles: 15,
  },
  {
    id: 'navagraha',
    name: 'Navagraha Yantra',
    sanskrit: 'नवग्रह यन्त्र',
    deity: 'Nine Planets',
    planet: 'Sun',
    purpose: 'Planetary harmony, balance all cosmic influences',
    bestDay: 'Sunday',
    bestTithis: [1, 5, 9, 15],
    description: 'The yantra of all nine Vedic planets. Creates balance and harmony across all planetary influences in your chart.',
    complexity: 4,
    rings: 9,
    triangles: 9,
  },
]

// ─── Sunrise / sunset approximation ──────────────────────────────────────────
// Simple solar position calculation — good enough for hora timing
function getSunTimes(date, lat = -34.9, lng = -54.95) {
  // Punta del Este default coordinates
  const rad = Math.PI / 180
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)

  // Solar declination
  const declination = -23.45 * Math.cos(rad * (360 / 365) * (dayOfYear + 10))
  const decRad = declination * rad
  const latRad = lat * rad

  // Hour angle
  const cosH = (Math.sin(-0.833 * rad) - Math.sin(latRad) * Math.sin(decRad)) /
    (Math.cos(latRad) * Math.cos(decRad))

  if (cosH > 1) return { sunrise: 6, sunset: 18, dayLength: 12 } // polar night fallback
  if (cosH < -1) return { sunrise: 4, sunset: 20, dayLength: 16 } // midnight sun fallback

  const H = Math.acos(cosH) / rad / 15 // hours

  // Solar noon (approximate, adjusted for longitude)
  const solarNoon = 12 - lng / 15 + (date.getTimezoneOffset() / 60)

  const sunrise = solarNoon - H
  const sunset = solarNoon + H

  return {
    sunrise,
    sunset,
    dayLength: sunset - sunrise,
    nightLength: 24 - (sunset - sunrise),
  }
}

// ─── Hora calculation ─────────────────────────────────────────────────────────
function getHoras(date, lat, lng) {
  const sun = getSunTimes(date, lat, lng)
  const dayHoraLength = sun.dayLength / 12 // hours
  const nightHoraLength = sun.nightLength / 12

  const dayOfWeek = date.getDay() // 0=Sun
  const dayRuler = DAY_RULERS[dayOfWeek]
  const startIdx = HORA_SEQUENCE.indexOf(dayRuler)

  const horas = []
  for (let i = 0; i < 24; i++) {
    const isDay = i < 12
    const horaLength = isDay ? dayHoraLength : nightHoraLength
    const startHour = isDay
      ? sun.sunrise + i * dayHoraLength
      : sun.sunset + (i - 12) * nightHoraLength

    const planetIdx = (startIdx + i) % 7
    const planet = HORA_SEQUENCE[planetIdx]

    const startTime = new Date(date)
    startTime.setHours(0, 0, 0, 0)
    startTime.setMinutes(Math.round(startHour * 60))

    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + Math.round(horaLength * 60))

    horas.push({
      index: i,
      planet,
      isDay,
      startTime,
      endTime,
      horaLength,
      ...PLANET_DATA[planet],
    })
  }

  return { horas, dayRuler, sun }
}

// ─── Current hora ─────────────────────────────────────────────────────────────
function getCurrentHora(now, lat, lng) {
  const { horas, dayRuler, sun } = getHoras(now, lat, lng)
  const nowMs = now.getTime()

  for (const hora of horas) {
    if (nowMs >= hora.startTime.getTime() && nowMs < hora.endTime.getTime()) {
      return { ...hora, dayRuler, sun, allHoras: horas }
    }
  }

  // Fallback — return first hora
  return { ...horas[0], dayRuler, sun, allHoras: horas }
}

// ─── Tithi calculation ────────────────────────────────────────────────────────
// Tithi = (Moon longitude - Sun longitude) / 12°
// We use a simplified lunar/solar position
function getMoonLongitude(jd) {
  const T = (jd - 2451545.0) / 36525
  // Simplified lunar longitude (low precision but good enough for tithi)
  const L0 = 218.3165 + 481267.8813 * T
  const M = 134.9634 + 477198.8676 * T
  const F = 93.2721 + 483202.0175 * T
  const D = 297.8502 + 445267.1115 * T

  let lon = L0
    + 6.2888 * Math.sin((M) * Math.PI / 180)
    + 1.2740 * Math.sin((2 * D - M) * Math.PI / 180)
    + 0.6583 * Math.sin((2 * D) * Math.PI / 180)
    + 0.2136 * Math.sin((2 * M) * Math.PI / 180)
    - 0.1856 * Math.sin((M + 2 * F) * Math.PI / 180)

  return ((lon % 360) + 360) % 360
}

function getSunLongitude(jd) {
  const T = (jd - 2451545.0) / 36525
  const L0 = 280.46646 + 36000.76983 * T
  const M = 357.52911 + 35999.05029 * T
  const C = (1.9146 - 0.004817 * T) * Math.sin(M * Math.PI / 180)
    + 0.019993 * Math.sin(2 * M * Math.PI / 180)

  return ((L0 + C) % 360 + 360) % 360
}

function dateToJD(date) {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate() + (date.getHours() + date.getMinutes() / 60) / 24
  let Y = y, M = m
  if (M <= 2) { Y -= 1; M += 12 }
  const A = Math.floor(Y / 100)
  const B = 2 - A + Math.floor(A / 4)
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + B - 1524.5
}

function getTithi(date) {
  const jd = dateToJD(date)
  const moonLon = getMoonLongitude(jd)
  const sunLon = getSunLongitude(jd)

  let diff = moonLon - sunLon
  if (diff < 0) diff += 360

  const tithiNum = Math.floor(diff / 12) + 1 // 1-30
  const paksha = tithiNum <= 15 ? 'Shukla' : 'Krishna' // Waxing / Waning
  const tithiInPaksha = tithiNum <= 15 ? tithiNum : tithiNum - 15

  const TITHI_NAMES = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
  ]

  // Tithi categories
  const NANDA = [1, 6, 11]      // Joyful
  const BHADRA = [2, 7, 12]     // Auspicious
  const JAYA = [3, 8, 13]       // Victory
  const RIKTA = [4, 9, 14]      // Empty — avoid
  const PURNA = [5, 10, 15]     // Full — best

  let quality = 'neutral'
  if (PURNA.includes(tithiInPaksha)) quality = 'excellent'
  else if (NANDA.includes(tithiInPaksha)) quality = 'good'
  else if (BHADRA.includes(tithiInPaksha)) quality = 'good'
  else if (JAYA.includes(tithiInPaksha)) quality = 'favorable'
  else if (RIKTA.includes(tithiInPaksha)) quality = 'avoid'

  return {
    number: tithiNum,
    tithiInPaksha,
    name: TITHI_NAMES[tithiInPaksha - 1] || 'Unknown',
    paksha,
    pakshaLabel: paksha === 'Shukla' ? 'Waxing (Shukla Paksha)' : 'Waning (Krishna Paksha)',
    quality,
    isWaxing: paksha === 'Shukla',
    moonPhase: Math.round((diff / 360) * 100), // 0-100% of cycle
  }
}

// ─── Auspiciousness scoring ───────────────────────────────────────────────────
// Score 0-100 for how auspicious the current moment is for yantra creation
function getAuspiciousnessScore(now, yantra, lat, lng) {
  const hora = getCurrentHora(now, lat, lng)
  const tithi = getTithi(now)
  const dayOfWeek = now.getDay()
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]

  let score = 0
  const factors = []

  // Hora match (30 pts max)
  if (hora.planet === yantra.planet) {
    score += 30
    factors.push({ label: `${yantra.planet} Hora active`, value: 30, positive: true })
  } else if (hora.planet === 'Jupiter' || hora.planet === 'Venus') {
    score += 20
    factors.push({ label: `Benefic ${hora.planet} Hora`, value: 20, positive: true })
  } else if (hora.planet === 'Saturn' || hora.planet === 'Mars') {
    if (yantra.planet !== hora.planet) {
      score += 5
      factors.push({ label: `${hora.planet} Hora (malefic)`, value: -10, positive: false })
    }
  } else {
    score += 10
    factors.push({ label: `${hora.planet} Hora (neutral)`, value: 10, positive: true })
  }

  // Day match (25 pts max)
  if (dayName === yantra.bestDay) {
    score += 25
    factors.push({ label: `${dayName} — ${yantra.deity}'s day`, value: 25, positive: true })
  } else if (dayName === 'Thursday' || dayName === 'Friday') {
    score += 15
    factors.push({ label: `${dayName} — generally auspicious`, value: 15, positive: true })
  } else {
    score += 5
    factors.push({ label: `${dayName} — neutral`, value: 5, positive: true })
  }

  // Tithi match (25 pts max)
  if (yantra.bestTithis.includes(tithi.tithiInPaksha)) {
    score += 25
    factors.push({ label: `Tithi ${tithi.tithiInPaksha} (${tithi.name}) — ideal`, value: 25, positive: true })
  } else if (tithi.quality === 'excellent' || tithi.quality === 'good') {
    score += 18
    factors.push({ label: `Tithi ${tithi.tithiInPaksha} (${tithi.name}) — ${tithi.quality}`, value: 18, positive: true })
  } else if (tithi.quality === 'avoid') {
    score += 2
    factors.push({ label: `Tithi ${tithi.tithiInPaksha} (${tithi.name}) — Rikta, avoid`, value: -15, positive: false })
  } else {
    score += 10
    factors.push({ label: `Tithi ${tithi.tithiInPaksha} (${tithi.name})`, value: 10, positive: true })
  }

  // Paksha — waxing preferred for creation (20 pts max)
  if (tithi.isWaxing) {
    score += 20
    factors.push({ label: 'Shukla Paksha (waxing) — creation energy', value: 20, positive: true })
  } else {
    score += 5
    factors.push({ label: 'Krishna Paksha (waning) — dissolution energy', value: 5, positive: false })
  }

  return {
    score: Math.min(100, score),
    factors,
    hora,
    tithi,
    dayName,
    recommendation: score >= 75 ? 'Highly auspicious — proceed' :
      score >= 50 ? 'Moderately auspicious — acceptable' :
      score >= 30 ? 'Low auspiciousness — wait if possible' :
      'Inauspicious — wait for better window',
  }
}

// ─── Find next auspicious window ──────────────────────────────────────────────
function findNextWindow(yantra, lat, lng, minScore = 65) {
  const now = new Date()
  const windows = []

  // Scan next 7 days, check every hora
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const checkDate = new Date(now)
    checkDate.setDate(checkDate.getDate() + dayOffset)
    checkDate.setHours(0, 0, 0, 0)

    const { horas } = getHoras(checkDate, lat, lng)

    for (const hora of horas) {
      // Check midpoint of hora
      const midpoint = new Date((hora.startTime.getTime() + hora.endTime.getTime()) / 2)
      if (midpoint <= now) continue // skip past horas

      const assessment = getAuspiciousnessScore(midpoint, yantra, lat, lng)
      if (assessment.score >= minScore) {
        windows.push({
          start: hora.startTime,
          end: hora.endTime,
          score: assessment.score,
          planet: hora.planet,
          tithi: assessment.tithi,
          dayName: assessment.dayName,
          recommendation: assessment.recommendation,
          factors: assessment.factors,
        })
      }
    }
  }

  // Sort by score descending, then by time
  windows.sort((a, b) => b.score - a.score || a.start - b.start)

  return windows.slice(0, 10)
}

// ─── Countdown helper ─────────────────────────────────────────────────────────
function getCountdown(targetDate) {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()
  if (diff <= 0) return { expired: true, label: 'Now' }

  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)

  if (days > 0) return { expired: false, label: `${days}d ${hours}h ${minutes}m`, days, hours, minutes }
  if (hours > 0) return { expired: false, label: `${hours}h ${minutes}m`, days: 0, hours, minutes }
  return { expired: false, label: `${minutes}m`, days: 0, hours: 0, minutes }
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export {
  YANTRAS,
  PLANET_DATA,
  DAY_RULERS,
  getCurrentHora,
  getHoras,
  getTithi,
  getAuspiciousnessScore,
  findNextWindow,
  getCountdown,
  getSunTimes,
}
