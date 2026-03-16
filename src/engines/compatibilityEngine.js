/**
 * compatibilityEngine.js
 * Computes compatibility score between two cosmic profiles.
 * Used by Clone Dating feature.
 */

export function computeCompatibility(profileA, profileB) {
  if (!profileA?.dob || !profileB?.dob) return null

  const scores = {}

  // 1. Western Astrology — Sun sign compatibility
  scores.sunSign = scoreSunSigns(profileA.sign, profileB.sign)

  // 2. Moon compatibility
  scores.moonSign = scoreMoonSigns(profileA.moon, profileB.moon)

  // 3. Human Design — type pairing
  scores.hdType = scoreHDTypes(profileA.hdType, profileB.hdType)

  // 4. Numerology — Life Path
  scores.lifePath = scoreLifePaths(profileA.lifePath, profileB.lifePath)

  // 5. Life Path personal year sync (if dob available)
  scores.lifePathSync = scoreLifePathSync(profileA.lifePath, profileB.lifePath)

  // 6. Expression archetype fit
  scores.expression = scoreExpressions(profileA.expression, profileB.expression)

  // Weighted total (default weights)
  const weights = {
    hdType: 0.25,
    sunSign: 0.15,
    moonSign: 0.15,
    lifePath: 0.20,
    expression: 0.15,
    lifePathSync: 0.10,
  }

  const total = Object.entries(weights).reduce((sum, [key, w]) => {
    return sum + (scores[key] || 0) * w
  }, 0)

  const overallScore = Math.round(total * 100)

  // Top reasons
  const sortedScores = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  const topReasons = sortedScores.map(([key, val]) => ({
    framework: FRAMEWORK_LABELS[key] || key,
    score: Math.round(val * 100),
    label: getCompatibilityLabel(key, profileA, profileB),
  }))

  // Tension points (lowest scores)
  const tensionPoints = Object.entries(scores)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .filter(([, v]) => v < 0.5)
    .map(([key]) => TENSION_LABELS[key]?.(profileA, profileB) || `${FRAMEWORK_LABELS[key]} tension`)

  // Soulmate signal (multiple high scores)
  const highScores = Object.values(scores).filter(s => s > 0.8)
  const soulmate = highScores.length >= 3

  return {
    score: overallScore,
    breakdown: scores,
    topReasons,
    tensionPoints,
    soulmate,
    matchStory: generateMatchStory(profileA, profileB, scores, overallScore),
  }
}

// ── Scoring functions ──────────────────────────────────────────────────────────

const ELEMENT_COMPAT = {
  fire: { fire: 0.85, air: 0.9, earth: 0.5, water: 0.55 },
  earth: { earth: 0.8, water: 0.85, fire: 0.5, air: 0.55 },
  air: { air: 0.85, fire: 0.9, water: 0.5, earth: 0.55 },
  water: { water: 0.8, earth: 0.85, air: 0.5, fire: 0.55 },
}

const SIGN_ELEMENTS = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
}

function scoreSunSigns(signA, signB) {
  if (!signA || !signB || signA === '?' || signB === '?') return 0.5
  const elemA = SIGN_ELEMENTS[signA]
  const elemB = SIGN_ELEMENTS[signB]
  if (!elemA || !elemB) return 0.5
  return ELEMENT_COMPAT[elemA]?.[elemB] || 0.5
}

function scoreMoonSigns(moonA, moonB) {
  // Same element = high emotional resonance
  if (!moonA || !moonB || moonA === '?' || moonB === '?') return 0.5
  const elemA = SIGN_ELEMENTS[moonA]
  const elemB = SIGN_ELEMENTS[moonB]
  if (!elemA || !elemB) return 0.5
  // Moon compat weighted toward same element or complementary water/earth
  if (elemA === elemB) return 0.92
  return ELEMENT_COMPAT[elemA]?.[elemB] || 0.5
}

const HD_TYPE_COMPAT = {
  Generator:               { Generator: 0.75, 'Manifesting Generator': 0.75, Projector: 0.92, Manifestor: 0.65, Reflector: 0.70 },
  'Manifesting Generator': { Generator: 0.75, 'Manifesting Generator': 0.70, Projector: 0.88, Manifestor: 0.65, Reflector: 0.72 },
  Projector:               { Generator: 0.92, 'Manifesting Generator': 0.88, Projector: 0.70, Manifestor: 0.75, Reflector: 0.80 },
  Manifestor:              { Generator: 0.65, 'Manifesting Generator': 0.65, Projector: 0.75, Manifestor: 0.60, Reflector: 0.75 },
  Reflector:               { Generator: 0.70, 'Manifesting Generator': 0.72, Projector: 0.80, Manifestor: 0.75, Reflector: 0.65 },
}

function scoreHDTypes(typeA, typeB) {
  if (!typeA || !typeB || typeA === '?' || typeB === '?') return 0.5
  return HD_TYPE_COMPAT[typeA]?.[typeB] || 0.5
}

const LP_COMPAT = {
  1:  { 1:0.6, 2:0.9, 3:0.75, 4:0.7, 5:0.8, 6:0.85, 7:0.7, 8:0.65, 9:0.8, 11:0.85, 22:0.75 },
  2:  { 1:0.9, 2:0.7, 3:0.85, 4:0.8, 5:0.7, 6:0.9, 7:0.75, 8:0.65, 9:0.85, 11:0.8, 22:0.8 },
  3:  { 1:0.75, 2:0.85, 3:0.65, 4:0.6, 5:0.85, 6:0.8, 7:0.7, 8:0.7, 9:0.8, 11:0.75, 22:0.65 },
  4:  { 1:0.7, 2:0.8, 3:0.6, 4:0.75, 5:0.65, 6:0.85, 7:0.8, 8:0.85, 9:0.7, 11:0.7, 22:0.9 },
  5:  { 1:0.8, 2:0.7, 3:0.85, 4:0.65, 5:0.65, 6:0.7, 7:0.75, 8:0.7, 9:0.8, 11:0.8, 22:0.7 },
  6:  { 1:0.85, 2:0.9, 3:0.8, 4:0.85, 5:0.7, 6:0.7, 7:0.75, 8:0.7, 9:0.85, 11:0.8, 22:0.85 },
  7:  { 1:0.7, 2:0.75, 3:0.7, 4:0.8, 5:0.75, 6:0.75, 7:0.65, 8:0.7, 9:0.8, 11:0.9, 22:0.8 },
  8:  { 1:0.65, 2:0.65, 3:0.7, 4:0.85, 5:0.7, 6:0.7, 7:0.7, 8:0.6, 9:0.75, 11:0.7, 22:0.9 },
  9:  { 1:0.8, 2:0.85, 3:0.8, 4:0.7, 5:0.8, 6:0.85, 7:0.8, 8:0.75, 9:0.7, 11:0.85, 22:0.8 },
  11: { 1:0.85, 2:0.8, 3:0.75, 4:0.7, 5:0.8, 6:0.8, 7:0.9, 8:0.7, 9:0.85, 11:0.75, 22:0.85 },
  22: { 1:0.75, 2:0.8, 3:0.65, 4:0.9, 5:0.7, 6:0.85, 7:0.8, 8:0.9, 9:0.8, 11:0.85, 22:0.7 },
}

function scoreLifePaths(lpA, lpB) {
  const a = parseInt(lpA), b = parseInt(lpB)
  if (!a || !b || isNaN(a) || isNaN(b)) return 0.5
  return LP_COMPAT[a]?.[b] || LP_COMPAT[b]?.[a] || 0.5
}

function scoreLifePathSync(lpA, lpB) {
  // Are they in complementary phases? (rough approximation)
  const a = parseInt(lpA), b = parseInt(lpB)
  if (!a || !b || isNaN(a) || isNaN(b)) return 0.5
  const diff = Math.abs(a - b)
  if (diff === 0) return 0.7
  if (diff === 4 || diff === 5) return 0.85 // complementary phases
  if (diff === 2 || diff === 3) return 0.75
  return 0.6
}

const EXPRESSION_COMPAT = {
  // Pioneer(1) pairs well with Diplomat(2), Nurturer(6), Humanitarian(9)
  1:  { 1:0.6, 2:0.9, 3:0.7, 4:0.7, 5:0.75, 6:0.88, 7:0.7, 8:0.65, 9:0.85, 11:0.8, 22:0.75 },
  2:  { 1:0.9, 2:0.7, 3:0.8, 4:0.8, 5:0.7, 6:0.85, 7:0.75, 8:0.7, 9:0.85, 11:0.8, 22:0.85 },
  3:  { 1:0.7, 2:0.8, 3:0.65, 4:0.7, 5:0.85, 6:0.75, 7:0.7, 8:0.7, 9:0.8, 11:0.78, 22:0.7 },
  4:  { 1:0.7, 2:0.8, 3:0.7, 4:0.7, 5:0.65, 6:0.82, 7:0.8, 8:0.85, 9:0.7, 11:0.75, 22:0.92 },
  5:  { 1:0.75, 2:0.7, 3:0.85, 4:0.65, 5:0.6, 6:0.7, 7:0.75, 8:0.7, 9:0.8, 11:0.8, 22:0.7 },
  6:  { 1:0.88, 2:0.85, 3:0.75, 4:0.82, 5:0.7, 6:0.7, 7:0.75, 8:0.7, 9:0.85, 11:0.82, 22:0.85 },
  7:  { 1:0.7, 2:0.75, 3:0.7, 4:0.8, 5:0.75, 6:0.75, 7:0.65, 8:0.7, 9:0.8, 11:0.92, 22:0.82 },
  8:  { 1:0.65, 2:0.7, 3:0.7, 4:0.85, 5:0.7, 6:0.7, 7:0.7, 8:0.6, 9:0.75, 11:0.7, 22:0.9 },
  9:  { 1:0.85, 2:0.85, 3:0.8, 4:0.7, 5:0.8, 6:0.85, 7:0.8, 8:0.75, 9:0.7, 11:0.88, 22:0.82 },
  11: { 1:0.8, 2:0.8, 3:0.78, 4:0.75, 5:0.8, 6:0.82, 7:0.92, 8:0.7, 9:0.88, 11:0.75, 22:0.88 },
  22: { 1:0.75, 2:0.85, 3:0.7, 4:0.92, 5:0.7, 6:0.85, 7:0.82, 8:0.9, 9:0.82, 11:0.88, 22:0.7 },
}

function scoreExpressions(expA, expB) {
  const a = parseInt(expA), b = parseInt(expB)
  if (!a || !b || isNaN(a) || isNaN(b)) return 0.5
  return EXPRESSION_COMPAT[a]?.[b] || EXPRESSION_COMPAT[b]?.[a] || 0.5
}

const FRAMEWORK_LABELS = {
  sunSign: 'Sun Sign Resonance',
  moonSign: 'Emotional Resonance',
  hdType: 'Human Design Pairing',
  lifePath: 'Life Path Harmony',
  expression: 'Archetype Fit',
  lifePathSync: 'Life Phase Sync',
}

const TENSION_LABELS = {
  sunSign: (a, b) => `${a.sign} and ${b.sign} — elemental friction (productive tension)`,
  hdType: (a, b) => `${a.hdType} + ${b.hdType} — different energetic rhythms`,
  lifePath: (a, b) => `LP ${a.lifePath} meets LP ${b.lifePath} — different life missions`,
  expression: (a, b) => `Expression ${a.expression} and ${b.expression} — different working styles`,
}

function getCompatibilityLabel(key, a, b) {
  const labels = {
    hdType: `${a.hdType || '?'} + ${b.hdType || '?'}`,
    sunSign: `${a.sign || '?'} + ${b.sign || '?'} (${SIGN_ELEMENTS[a.sign] || '?'} + ${SIGN_ELEMENTS[b.sign] || '?'})`,
    moonSign: `${a.moon || '?'} + ${b.moon || '?'} emotional resonance`,
    lifePath: `LP ${a.lifePath || '?'} meets LP ${b.lifePath || '?'}`,
    expression: `Exp ${a.expression || '?'} ${EXPRESSION_NAMES[parseInt(a.expression)] || ''} + Exp ${b.expression || '?'} ${EXPRESSION_NAMES[parseInt(b.expression)] || ''}`,
    lifePathSync: `Life phase alignment`,
  }
  return labels[key] || key
}

const EXPRESSION_NAMES = {
  1: 'Pioneer', 2: 'Diplomat', 3: 'Communicator', 4: 'Builder',
  5: 'Adventurer', 6: 'Nurturer', 7: 'Seeker', 8: 'Executive',
  9: 'Humanitarian', 11: 'Illuminator', 22: 'Master Builder',
}

function generateMatchStory(a, b, scores, totalScore) {
  const aName = a.name?.split(' ')[0] || 'Profile A'
  const bName = b.name?.split(' ')[0] || 'Profile B'
  const topKey = Object.entries(scores).sort((x, y) => y[1] - x[1])[0][0]
  const topScore = scores[topKey]

  const storyMap = {
    hdType: `${aName}'s ${a.hdType} energy meets ${bName}'s ${b.hdType} in the classic pairing — ${topScore > 0.85 ? 'one of the strongest HD combinations' : 'a complementary dynamic'}.`,
    sunSign: `${a.sign} and ${b.sign} share ${SIGN_ELEMENTS[a.sign] === SIGN_ELEMENTS[b.sign] ? 'the same element — mutual understanding comes naturally' : 'complementary elements — what one lacks, the other provides'}.`,
    lifePath: `LP ${a.lifePath} (${EXPRESSION_NAMES[parseInt(a.lifePath)] || 'Unknown'}) and LP ${b.lifePath} (${EXPRESSION_NAMES[parseInt(b.lifePath)] || 'Unknown'}) are ${topScore > 0.85 ? 'a rare high-harmony pairing' : 'aligned in life mission'}.`,
    expression: `Expression ${a.expression} and ${b.expression} work together — ${a.expression === '1' && b.expression === '2' ? 'the Pioneer finds the Diplomat who makes their vision land' : 'complementary working styles that fill each other\'s gaps'}.`,
    moonSign: `${a.moon} and ${b.moon} Moons — emotional resonance at ${Math.round(topScore * 100)}% compatibility.`,
    lifePathSync: `Both are in ${topScore > 0.8 ? 'complementary' : 'compatible'} life phases, which means the timing of this connection is ${topScore > 0.8 ? 'auspicious' : 'workable'}.`,
  }

  return storyMap[topKey] || `Overall compatibility of ${totalScore}% — ${totalScore > 80 ? 'a strong match across multiple frameworks' : 'compatible with areas for growth'}.`
}

export function getCompatibilityDescription(score) {
  if (score >= 90) return 'Rare Alignment'
  if (score >= 80) return 'Strong Match'
  if (score >= 70) return 'Good Compatibility'
  if (score >= 60) return 'Compatible'
  return 'Growth-Oriented'
}
