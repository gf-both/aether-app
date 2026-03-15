/**
 * synastryEngine.js
 * Computes cross-chart synastry aspects and compatibility scores
 * using real astronomical positions from natalEngine.
 */
import { getNatalChart } from './natalEngine.js'

// ─── Aspect Definitions ───────────────────────────────────────────────────────

const ASPECTS = [
  { name: 'conjunction', angle: 0,   orb: 8, score: 1.0,  harmony: 'neutral' },
  { name: 'sextile',     angle: 60,  orb: 6, score: 0.7,  harmony: 'harmonious' },
  { name: 'square',      angle: 90,  orb: 8, score: -0.5, harmony: 'challenging' },
  { name: 'trine',       angle: 120, orb: 8, score: 0.9,  harmony: 'harmonious' },
  { name: 'opposition',  angle: 180, orb: 8, score: 0.3,  harmony: 'tense' },
]

function getAspect(lon1, lon2) {
  let diff = Math.abs(lon1 - lon2) % 360
  if (diff > 180) diff = 360 - diff
  for (const asp of ASPECTS) {
    const orb = Math.abs(diff - asp.angle)
    if (orb <= asp.orb) return { ...asp, orb: +orb.toFixed(2), exact: orb < 1 }
  }
  return null
}

// ─── Key Synastry Planet Pairs ────────────────────────────────────────────────

const SYNASTRY_PAIRS = [
  // Romantic
  { p1: 'venus',     p2: 'mars',    weight: 10, category: 'attraction', label: 'Venus–Mars Magnetism' },
  { p1: 'sun',       p2: 'moon',    weight: 9,  category: 'core',       label: 'Sun–Moon Core' },
  { p1: 'moon',      p2: 'moon',    weight: 8,  category: 'emotional',  label: 'Moon–Moon Harmony' },
  { p1: 'venus',     p2: 'venus',   weight: 7,  category: 'love',       label: 'Venus–Venus Love' },
  { p1: 'sun',       p2: 'venus',   weight: 8,  category: 'attraction', label: 'Sun–Venus Affection' },
  { p1: 'sun',       p2: 'sun',     weight: 6,  category: 'core',       label: 'Sun–Sun Identity' },
  { p1: 'mars',      p2: 'mars',    weight: 5,  category: 'drive',      label: 'Mars–Mars Drive' },
  // Soul/Karmic
  { p1: 'northNode', p2: 'sun',     weight: 9,  category: 'karmic',     label: 'Node–Sun Karma' },
  { p1: 'northNode', p2: 'moon',    weight: 8,  category: 'karmic',     label: 'Node–Moon Soul' },
  { p1: 'pluto',     p2: 'moon',    weight: 7,  category: 'depth',      label: 'Pluto–Moon Depth' },
  { p1: 'pluto',     p2: 'venus',   weight: 7,  category: 'depth',      label: 'Pluto–Venus Intensity' },
  { p1: 'saturn',    p2: 'moon',    weight: 6,  category: 'karmic',     label: 'Saturn–Moon Karma' },
  { p1: 'chiron',    p2: 'sun',     weight: 6,  category: 'healing',    label: 'Chiron–Sun Healing' },
  // Mental/Communication
  { p1: 'mercury',   p2: 'mercury', weight: 7,  category: 'mental',     label: 'Mercury–Mercury Mind' },
  { p1: 'mercury',   p2: 'moon',    weight: 6,  category: 'mental',     label: 'Mercury–Moon Feeling' },
  { p1: 'jupiter',   p2: 'sun',     weight: 6,  category: 'growth',     label: 'Jupiter–Sun Growth' },
  { p1: 'jupiter',   p2: 'moon',    weight: 6,  category: 'growth',     label: 'Jupiter–Moon Expansion' },
]

const PLANET_SYMBOLS = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', chiron: '⚷',
}

const SIGN_NAMES = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mod360(x) {
  return ((x % 360) + 360) % 360
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

/**
 * Convert a store profile object into natalEngine params.
 */
export function getBirthParams(profile) {
  if (!profile) return null
  const dob = profile.dob ? new Date(profile.dob) : null
  return {
    day:      profile.birthDay      || (dob ? dob.getDate() : 1),
    month:    profile.birthMonth    || (dob ? dob.getMonth() + 1 : 1),
    year:     profile.birthYear     || (dob ? dob.getFullYear() : 2000),
    hour:     profile.birthHour     ?? 12,
    minute:   profile.birthMinute   ?? 0,
    lat:      profile.birthLat      ?? 0,
    lon:      profile.birthLon      ?? 0,
    timezone: profile.birthTimezone ?? 0,
    name:     profile.name          || 'Person',
  }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * getSynastryReport(profileA, profileB)
 * profileA/B = { day, month, year, hour, minute, lat, lon, timezone, name }
 * Returns full synastry report with aspects, scores, composite, and chart data.
 */
export function getSynastryReport(profileA, profileB) {
  const chartA = getNatalChart(profileA)
  const chartB = getNatalChart(profileB)

  const aspects = []
  let totalWeight = 0
  let weightedScore = 0

  // Cross-chart aspects (A planets vs B planets)
  for (const pair of SYNASTRY_PAIRS) {
    const lonA = chartA.planets[pair.p1]?.lon ?? chartA.angles?.[pair.p1]?.lon
    const lonB = chartB.planets[pair.p2]?.lon ?? chartB.angles?.[pair.p2]?.lon
    if (lonA === undefined || lonB === undefined) continue

    const asp = getAspect(lonA, lonB)
    if (asp) {
      const weighted = asp.score * pair.weight
      weightedScore += weighted
      totalWeight += pair.weight
      aspects.push({
        ...pair,
        ...asp,
        lonA, lonB,
        personA: profileA.name,
        personB: profileB.name,
        symA: PLANET_SYMBOLS[pair.p1] || pair.p1,
        symB: PLANET_SYMBOLS[pair.p2] || pair.p2,
        weighted,
      })
    }

    // Also check B vs A (reversed) for non-same-planet pairs
    if (pair.p1 !== pair.p2) {
      const aspRev = getAspect(lonB, lonA)
      if (aspRev) {
        const weighted = aspRev.score * pair.weight * 0.8
        weightedScore += weighted
        totalWeight += pair.weight * 0.8
        aspects.push({
          ...pair,
          p1: pair.p2, p2: pair.p1,
          label: pair.label + ' (rev)',
          ...aspRev,
          lonA: lonB, lonB: lonA,
          personA: profileB.name,
          personB: profileA.name,
          symA: PLANET_SYMBOLS[pair.p2] || pair.p2,
          symB: PLANET_SYMBOLS[pair.p1] || pair.p1,
          weighted,
          reversed: true,
        })
      }
    }
  }

  // Overall compatibility score (0–100)
  const rawScore = totalWeight > 0 ? weightedScore / totalWeight : 0
  const overallScore = Math.round(Math.min(100, Math.max(0, (rawScore + 1) * 50)))

  // Category scores
  const categories = {}
  for (const asp of aspects) {
    if (!categories[asp.category]) categories[asp.category] = { total: 0, weight: 0 }
    categories[asp.category].total += asp.weighted
    categories[asp.category].weight += asp.weight
  }
  const categoryScores = {}
  for (const [cat, data] of Object.entries(categories)) {
    categoryScores[cat] = Math.round(Math.min(100, Math.max(0, (data.total / data.weight + 1) * 50)))
  }

  // Composite chart (midpoints)
  const composite = {}
  const allPlanets = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto','northNode']
  for (const p of allPlanets) {
    const lA = chartA.planets[p]?.lon
    const lB = chartB.planets[p]?.lon
    if (lA !== undefined && lB !== undefined) {
      let mid = (lA + lB) / 2
      if (Math.abs(lA - lB) > 180) mid = (mid + 180) % 360
      mid = mod360(mid)
      const signIdx = Math.floor(mid / 30)
      composite[p] = {
        lon:    +mid.toFixed(2),
        sign:   SIGN_NAMES[signIdx],
        degree: +(mid % 30).toFixed(2),
        symbol: PLANET_SYMBOLS[p] || p,
      }
    }
  }

  // Top harmonious and challenging aspects
  const sorted = [...aspects].sort((a, b) => Math.abs(b.weighted) - Math.abs(a.weighted))
  const harmonious  = aspects.filter(a => a.harmony === 'harmonious').sort((a, b) => b.weight - a.weight).slice(0, 5)
  const challenging = aspects.filter(a => a.harmony === 'challenging').sort((a, b) => b.weight - a.weight).slice(0, 3)

  // Generate natural-language insight from top aspects
  const insightLines = []
  if (harmonious.length > 0) {
    const top = harmonious[0]
    insightLines.push(
      `${capitalize(top.p1)} ${top.name} ${capitalize(top.p2)} (orb ${top.orb}°) — ${top.harmony} energy flows naturally between ${top.personA} and ${top.personB}.`
    )
  }
  if (harmonious.length > 1) {
    const second = harmonious[1]
    insightLines.push(
      `${capitalize(second.p1)} ${second.name} ${capitalize(second.p2)}: ${second.label} resonates at a soul level.`
    )
  }
  if (challenging.length > 0) {
    const ch = challenging[0]
    insightLines.push(
      `Growth edge: ${capitalize(ch.p1)} ${ch.name} ${capitalize(ch.p2)} creates productive tension — the key to transformation for this connection.`
    )
  }
  const insight = insightLines.join(' ') || `${profileA.name} and ${profileB.name} share a unique cosmic connection.`

  return {
    overall: overallScore,
    categoryScores,
    aspects: sorted,
    harmonious,
    challenging,
    composite,
    insight,
    chartA,
    chartB,
    meta: {
      nameA: profileA.name,
      nameB: profileB.name,
    },
  }
}
