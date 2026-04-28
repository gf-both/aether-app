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
  { p1: 'chiron',    p2: 'moon',    weight: 7,  category: 'healing',    label: 'Chiron–Moon Wound' },
  { p1: 'chiron',    p2: 'venus',   weight: 6,  category: 'healing',    label: 'Chiron–Venus Heart Healing' },
  { p1: 'chiron',    p2: 'chiron',  weight: 5,  category: 'healing',    label: 'Chiron–Chiron Mirror' },
  { p1: 'neptune',   p2: 'moon',    weight: 5,  category: 'healing',    label: 'Neptune–Moon Transcendence' },
  { p1: 'neptune',   p2: 'venus',   weight: 5,  category: 'healing',    label: 'Neptune–Venus Devotion' },
  // Mental/Communication
  { p1: 'mercury',   p2: 'mercury', weight: 7,  category: 'mental',     label: 'Mercury–Mercury Mind' },
  { p1: 'mercury',   p2: 'moon',    weight: 6,  category: 'mental',     label: 'Mercury–Moon Feeling' },
  { p1: 'jupiter',   p2: 'sun',     weight: 6,  category: 'growth',     label: 'Jupiter–Sun Growth' },
  { p1: 'jupiter',   p2: 'moon',    weight: 6,  category: 'growth',     label: 'Jupiter–Moon Expansion' },
  { p1: 'jupiter',   p2: 'venus',   weight: 5,  category: 'growth',     label: 'Jupiter–Venus Abundance' },
  // Stability
  { p1: 'saturn',    p2: 'sun',     weight: 6,  category: 'karmic',     label: 'Saturn–Sun Structure' },
  { p1: 'saturn',    p2: 'venus',   weight: 5,  category: 'karmic',     label: 'Saturn–Venus Commitment' },
  { p1: 'uranus',    p2: 'sun',     weight: 4,  category: 'growth',     label: 'Uranus–Sun Awakening' },
  { p1: 'uranus',    p2: 'moon',    weight: 4,  category: 'growth',     label: 'Uranus–Moon Liberation' },
  { p1: 'pluto',     p2: 'sun',     weight: 7,  category: 'depth',      label: 'Pluto–Sun Transformation' },
  { p1: 'neptune',   p2: 'sun',     weight: 5,  category: 'depth',      label: 'Neptune–Sun Dissolution' },
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

  // ─── Bond Classification ───────────────────────────────────────────────────
  const bondType = classifyBond(overallScore, categoryScores, aspects)

  // ─── Relationship Themes ──────────────────────────────────────────────────
  const themes = detectThemes(aspects, categoryScores)

  // ─── Deep Narrative Generation ────────────────────────────────────────────
  const narratives = generateNarratives(profileA.name, profileB.name, overallScore, categoryScores, harmonious, challenging, bondType, themes, composite)

  // ─── Timing Windows (simplified composite transits) ───────────────────────
  const timing = computeTimingWindows(composite)

  // Legacy insight field (kept for backward compat)
  const insight = narratives.overview

  return {
    overall: overallScore,
    categoryScores,
    aspects: sorted,
    harmonious,
    challenging,
    composite,
    insight,
    bondType,
    themes,
    narratives,
    timing,
    chartA,
    chartB,
    meta: {
      nameA: profileA.name,
      nameB: profileB.name,
    },
  }
}

// ─── Bond Classification ────────────────────────────────────────────────────

const BOND_TYPES = [
  { key: 'soulmate',      min: 82, label: 'Soulmate',      emoji: '🔥', color: '#f0c040', desc: 'A once-in-many-lifetimes encounter. This bond carries the weight of deep karmic completion — you recognize each other at a cellular level.' },
  { key: 'extraordinary',  min: 72, label: 'Extraordinary',  emoji: '✨', color: '#bb66ff', desc: 'This connection operates on a frequency most people never experience. Multiple systems align to create something rare and catalytic.' },
  { key: 'powerful',       min: 62, label: 'Powerful',       emoji: '⚡', color: '#40ccdd', desc: 'A bond with real gravitational pull. The attraction and depth here are undeniable — what matters is how you channel the intensity.' },
  { key: 'meaningful',     min: 52, label: 'Meaningful',     emoji: '💎', color: '#60b030', desc: 'Solid ground. This connection has genuine resonance and the potential for lasting significance if both people invest.' },
  { key: 'complex',        min: 42, label: 'Complex',        emoji: '🌀', color: '#e8a040', desc: 'Equal parts friction and fascination. This bond demands growth — it will not let either person stay comfortable or stagnant.' },
  { key: 'delicate',       min: 30, label: 'Delicate',       emoji: '🌙', color: '#8899cc', desc: 'A subtle connection that requires careful attention. The threads are there but thin — easily strengthened or broken by how you show up.' },
  { key: 'challenging',    min: 0,  label: 'Challenging',    emoji: '🗡️', color: '#d44070', desc: 'This dynamic activates deep shadow material. Not inherently negative — some of the most transformative relationships live here.' },
]

function classifyBond(overall, catScores, aspects) {
  // Start with score-based classification
  let bond = BOND_TYPES.find(b => overall >= b.min) || BOND_TYPES[BOND_TYPES.length - 1]

  // Upgrade if karmic + attraction both strong (Pattern-style soulmate detection)
  const karmic = catScores.karmic || 0
  const attraction = catScores.attraction || 0
  const depth = catScores.depth || 0
  const healing = catScores.healing || 0

  // Check for exact aspects (orb < 1°) — these amplify the bond
  const exactCount = aspects.filter(a => a.exact).length

  if (overall >= 70 && karmic >= 75 && (attraction >= 70 || depth >= 70) && exactCount >= 2) {
    bond = BOND_TYPES[0] // Soulmate
  } else if (overall >= 65 && exactCount >= 3 && healing >= 60) {
    bond = BOND_TYPES[1] // Extraordinary
  }

  return { ...bond, exactAspects: exactCount }
}

// ─── Relationship Themes ────────────────────────────────────────────────────

const THEME_DEFS = [
  { key: 'twin-flame',     label: 'Twin Flame',          icon: '🔥', cats: ['karmic', 'depth'], planets: ['northNode', 'pluto'], minScore: 70,
    desc: 'Your charts suggest a twin flame signature — the North Node and Pluto contacts indicate souls that separated to learn independently and are drawn back together for integration.' },
  { key: 'sacred-mirror',  label: 'Sacred Mirror',       icon: '🪞', cats: ['core', 'emotional'], planets: ['sun', 'moon'], minScore: 75,
    desc: 'You mirror each other at the deepest identity level. Sun–Moon contacts this strong mean you see in the other what you need to integrate in yourself.' },
  { key: 'healer-wounded', label: 'Healer & Wounded',    icon: '💚', cats: ['healing'], planets: ['chiron'], minScore: 65,
    desc: 'Chiron contacts dominate this bond. One or both of you carries a wound the other was born to help heal — but only through vulnerability, not fixing.' },
  { key: 'teacher-student',label: 'Teacher & Student',   icon: '🏛️', cats: ['karmic', 'growth'], planets: ['saturn', 'jupiter'], minScore: 65,
    desc: 'Saturn and Jupiter shape this dynamic. There is a natural mentorship axis — one person holds structure, the other expansion. The roles may reverse over time.' },
  { key: 'creative-fire',  label: 'Creative Fire',       icon: '🎨', cats: ['attraction', 'growth'], planets: ['venus', 'jupiter'], minScore: 70,
    desc: 'Venus–Jupiter contacts light up the creative and expansive potential. Together you generate ideas, beauty, and abundance that neither could alone.' },
  { key: 'shadow-work',    label: 'Shadow Catalyst',     icon: '🌑', cats: ['depth'], planets: ['pluto'], minScore: 60,
    desc: 'Pluto aspects dominate — this bond is designed to surface what has been buried. Uncomfortable but transformative. Neither person leaves this connection unchanged.' },
  { key: 'soul-contract',  label: 'Soul Contract',       icon: '📜', cats: ['karmic'], planets: ['northNode', 'saturn'], minScore: 70,
    desc: 'The Nodes and Saturn are activated between your charts. This feels like an agreement made before incarnation — a specific lesson or mission you came to complete together.' },
  { key: 'electric',       label: 'Electric Attraction',  icon: '⚡', cats: ['attraction', 'drive'], planets: ['venus', 'mars'], minScore: 75,
    desc: 'Venus–Mars fire is the dominant signature. The physical and emotional magnetism here is immediate and potent — the challenge is building depth beneath the spark.' },
]

function detectThemes(aspects, catScores) {
  const detected = []
  // Count planet involvement in aspects
  const planetHits = {}
  for (const asp of aspects) {
    planetHits[asp.p1] = (planetHits[asp.p1] || 0) + Math.abs(asp.weighted)
    planetHits[asp.p2] = (planetHits[asp.p2] || 0) + Math.abs(asp.weighted)
  }

  for (const theme of THEME_DEFS) {
    // Check if relevant categories score above threshold
    const catAvg = theme.cats.reduce((sum, cat) => sum + (catScores[cat] || 50), 0) / theme.cats.length
    // Check if key planets are active
    const planetActivity = theme.planets.reduce((sum, p) => sum + (planetHits[p] || 0), 0)

    if (catAvg >= theme.minScore || planetActivity > 15) {
      detected.push({ ...theme, strength: Math.round(catAvg), planetActivity: Math.round(planetActivity) })
    }
  }

  // Sort by strength and return top 3
  return detected.sort((a, b) => (b.strength + b.planetActivity) - (a.strength + a.planetActivity)).slice(0, 3)
}

// ─── Deep Narrative Generation ──────────────────────────────────────────────

function generateNarratives(nameA, nameB, overall, catScores, harmonious, challenging, bondType, themes, composite) {
  const a = nameA, b = nameB

  // Overview narrative — Pattern-style prose
  const overviewParts = []
  overviewParts.push(`${a} and ${b} share a ${bondType.label.toLowerCase()} bond.`)

  if (overall >= 75) {
    overviewParts.push(`The cosmic architecture between these two charts is striking — multiple frameworks converge to create a connection that feels both inevitable and chosen.`)
  } else if (overall >= 60) {
    overviewParts.push(`There is real substance here. The connection has both natural ease and productive friction — the kind that shapes both people if they stay present to it.`)
  } else if (overall >= 45) {
    overviewParts.push(`This dynamic lives in the space between comfort and challenge. Neither person can coast here — the bond demands authenticity and growth from both.`)
  } else {
    overviewParts.push(`This connection activates deep material. The friction is not a flaw — it is the mechanism through which both people confront what they have been avoiding.`)
  }

  // Add top harmonious aspect flavor
  if (harmonious.length > 0) {
    const top = harmonious[0]
    const aspNarrative = getAspectNarrative(top, a, b)
    if (aspNarrative) overviewParts.push(aspNarrative)
  }

  // Category narratives
  const categoryNarratives = {}

  if (catScores.attraction) {
    const s = catScores.attraction
    categoryNarratives.attraction = s >= 80
      ? `The attraction between ${a} and ${b} is immediate and visceral. Venus–Mars contacts at this level create a magnetic pull that both people feel before a word is spoken. This is not subtle chemistry — it is a gravitational event.`
      : s >= 60
      ? `There is genuine physical and emotional attraction here. The Venus–Mars dynamic creates a steady pull rather than a lightning strike — the kind that deepens over time rather than burning out.`
      : `The attraction channel between these charts runs underground. It may not announce itself immediately, but there are deeper currents at work — the kind that surface through shared experience rather than instant chemistry.`
  }

  if (catScores.emotional || catScores.love) {
    const s = Math.max(catScores.emotional || 0, catScores.love || 0)
    categoryNarratives.emotional = s >= 80
      ? `Emotional attunement is exceptional. Moon contacts this strong create an almost telepathic understanding — ${a} and ${b} can read each other's internal weather without words. The risk is enmeshment; the gift is profound intimacy.`
      : s >= 60
      ? `The emotional connection has real depth. There is enough natural understanding to create safety, and enough difference to maintain healthy boundaries. Both people feel genuinely seen here.`
      : `Emotional connection requires more conscious effort in this pairing. The default frequencies are different — but difference is not distance. Learning each other's emotional language is the work and the reward.`
  }

  if (catScores.karmic) {
    const s = catScores.karmic
    categoryNarratives.karmic = s >= 80
      ? `The karmic signature is unmistakable. North Node and Saturn contacts at this level suggest a soul contract — an agreement made before birth to meet, to learn, to complete something together. This bond carries weight from other lifetimes.`
      : s >= 60
      ? `There are real karmic threads here. The connection has a "meant to be" quality that goes beyond compatibility — something in both charts suggests these souls have work to do together.`
      : `The karmic connection is present but subtle. This may be a newer soul contract — less ancient debt, more fresh possibility. The relationship writes new karma rather than resolving old patterns.`
  }

  if (catScores.depth) {
    const s = catScores.depth
    categoryNarratives.depth = s >= 75
      ? `Pluto's presence in this synastry is heavy and transformative. ${a} and ${b} cannot be casual with each other — this bond strips away pretense and demands truth. Shadow material will surface. The question is not if, but how gracefully.`
      : s >= 55
      ? `There is real depth available here. Pluto touches are present but not overwhelming — enough to create meaningful transformation without the intensity becoming destructive.`
      : `The depth dimension is quieter in this pairing. This does not mean the connection is shallow — it means transformation happens gently, through accumulation rather than eruption.`
  }

  if (catScores.healing) {
    const s = catScores.healing
    categoryNarratives.healing = s >= 75
      ? `Chiron is activated in powerful ways between these charts. ${a} and ${b} carry wounds that the other was designed to witness, hold, and help heal — not through fixing, but through the radical act of seeing each other fully.`
      : s >= 55
      ? `The healing potential is genuine. Chiron contacts suggest that being in this relationship creates conditions for old wounds to surface and begin to mend.`
      : `Healing in this connection happens indirectly — not through direct wound work, but through the simple experience of being accepted as-is. Sometimes the gentlest medicine is the most effective.`
  }

  // Growth edges narrative
  const growthEdges = []
  for (const ch of challenging.slice(0, 3)) {
    growthEdges.push(getGrowthNarrative(ch, a, b))
  }
  if (growthEdges.length === 0) {
    growthEdges.push(`Every bond has its growth edges — even the smoothest connections benefit from conscious attention to where friction might eventually appear.`)
  }

  return {
    overview: overviewParts.join(' '),
    categories: categoryNarratives,
    growthEdges,
    themeNarratives: themes.map(t => t.desc),
    bondDescription: bondType.desc,
  }
}

function getAspectNarrative(asp, nameA, nameB) {
  const p1 = capitalize(asp.p1), p2 = capitalize(asp.p2)
  const tight = asp.orb < 2 ? 'tight' : 'wide'

  const narratives = {
    'venus-mars-conjunction': `${nameA}'s Venus conjunct ${nameB}'s Mars is the classic signature of magnetic attraction — desire meets desirability in a single aspect.`,
    'venus-mars-trine': `Venus trine Mars flows effortlessly — the attraction is natural, warm, and doesn't need to prove itself. It simply exists.`,
    'sun-moon-conjunction': `Sun conjunct Moon is one of the most significant aspects in synastry — ${nameA}'s core identity resonates with ${nameB}'s deepest emotional nature.`,
    'sun-moon-trine': `Sun trine Moon creates an instinctive understanding — what ${nameA} is, ${nameB} feels. The compatibility is unconscious and profound.`,
    'moon-moon-conjunction': `Moon conjunct Moon — you share the same emotional operating system. You process feelings at the same rhythm, in the same key.`,
    'northNode-sun-conjunction': `${nameA}'s North Node conjunct ${nameB}'s Sun is a soul contract signature — ${nameB} embodies the direction ${nameA}'s soul is evolving toward.`,
    'pluto-moon-conjunction': `Pluto conjunct Moon is one of the most intense aspects possible — ${nameA} touches ${nameB}'s deepest emotional core and transforms it from the inside.`,
    'chiron-moon-conjunction': `Chiron conjunct Moon activates the deepest wound and the deepest potential for healing — this aspect alone can be the purpose of the entire connection.`,
  }

  const key = `${asp.p1}-${asp.p2}-${asp.name}`
  if (narratives[key]) return narratives[key]

  // Generic aspect narrative
  if (asp.harmony === 'harmonious') {
    return `${p1} ${asp.name} ${p2} (${tight}, ${asp.orb}° orb) creates natural flow between ${nameA} and ${nameB} — this is one of the strongest supportive aspects in the bond.`
  }
  return null
}

function getGrowthNarrative(asp, nameA, nameB) {
  const p1 = capitalize(asp.p1), p2 = capitalize(asp.p2)

  if (asp.p1 === 'saturn' || asp.p2 === 'saturn') {
    return `${p1} ${asp.name} ${p2}: Saturn introduces restriction and responsibility into this area. The lesson is not to resist the structure but to grow within it — ${nameA} and ${nameB} are being asked to mature together.`
  }
  if (asp.p1 === 'pluto' || asp.p2 === 'pluto') {
    return `${p1} ${asp.name} ${p2}: Pluto square aspects can feel like a power struggle. The real battle is internal — this dynamic surfaces control patterns and buried fears that both people brought into the connection.`
  }
  if (asp.p1 === 'mars' || asp.p2 === 'mars') {
    return `${p1} ${asp.name} ${p2}: Mars tension can manifest as arguments, competition, or mismatched energy levels. The invitation is to channel this fire into shared goals rather than opposition.`
  }
  return `${p1} ${asp.name} ${p2} (${asp.orb}° orb): This aspect creates productive tension — the kind that prevents stagnation and pushes both ${nameA} and ${nameB} toward growth they would not choose alone.`
}

// ─── Timing Windows ─────────────────────────────────────────────────────────

function computeTimingWindows(composite) {
  if (!composite || !composite.sun) return []

  const now = new Date()
  const currentYear = now.getFullYear()
  const windows = []

  // Simplified timing based on composite chart sensitive points
  // When transiting planets hit composite angles, the relationship is activated
  const compSun = composite.sun.lon
  const compMoon = composite.moon?.lon || 0
  const compVenus = composite.venus?.lon || 0

  // Solar return window (when transiting Sun conjuncts composite Sun)
  const sunMonth = Math.floor(compSun / 30)
  const sunMonthNames = ['Mar-Apr','Apr-May','May-Jun','Jun-Jul','Jul-Aug','Aug-Sep','Sep-Oct','Oct-Nov','Nov-Dec','Dec-Jan','Jan-Feb','Feb-Mar']
  windows.push({
    label: 'Relationship Solar Return',
    period: sunMonthNames[sunMonth] || 'Annual',
    type: 'activation',
    icon: '☉',
    desc: 'The annual moment when the composite Sun is activated — decisions made during this window carry extra weight for the relationship.',
  })

  // Venus cycle (composite Venus activation ~every 8 months)
  const venusMonth = Math.floor(compVenus / 30)
  windows.push({
    label: 'Venus Activation Cycle',
    period: `Every ~8 months`,
    type: 'romance',
    icon: '♀',
    desc: 'When transiting Venus crosses the composite Venus degree, romance and connection peak. Plan meaningful time together during these windows.',
  })

  // Eclipse sensitivity (if composite Sun or Moon near eclipse axis)
  const eclipseAxis = [compSun, (compSun + 180) % 360]
  const moonNearEclipse = eclipseAxis.some(ax => Math.abs(compMoon - ax) < 15 || Math.abs(compMoon - ax) > 345)
  if (moonNearEclipse) {
    windows.push({
      label: 'Eclipse Sensitivity',
      period: 'Eclipse seasons',
      type: 'transformation',
      icon: '🌑',
      desc: 'Your composite Moon sits near the Sun axis — eclipse seasons (every ~6 months) bring major relationship turning points. These are not crises but evolutionary leaps.',
    })
  }

  // Saturn cycle (composite Saturn return every ~29 years, but square every ~7)
  const saturnLon = composite.saturn?.lon
  if (saturnLon !== undefined) {
    windows.push({
      label: 'Saturn Testing Cycle',
      period: 'Every ~7 years',
      type: 'challenge',
      icon: '♄',
      desc: 'Saturn squares the composite chart on a ~7-year rhythm, testing the relationship\'s structural integrity. These periods feel heavy but ultimately strengthen what is real.',
    })
  }

  // Jupiter expansion (composite Jupiter activated every ~12 months)
  const jupLon = composite.jupiter?.lon
  if (jupLon !== undefined) {
    windows.push({
      label: 'Jupiter Expansion Window',
      period: 'Annual growth peak',
      type: 'growth',
      icon: '♃',
      desc: 'When transiting Jupiter activates the composite chart, the relationship expands — travel together, make big plans, say yes to shared adventures.',
    })
  }

  return windows
}
