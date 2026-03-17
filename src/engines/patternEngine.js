/**
 * patternEngine.js
 * Cross-system pattern detector — finds meaningful correlations across esoteric frameworks.
 * The "killer feature" of the practitioner portal.
 */

import computeHDChart from './hdEngine.js'
import { getNatalChart } from './natalEngine.js'
import { getGeneKeysProfile } from './geneKeysEngine.js'
import { getNumerologyProfileFromDob } from './numerologyEngine.js'
import { getMayanProfile } from './mayanEngine.js'

// ─── Pattern Definitions ───────────────────────────────────────────────────────

const PATTERN_DEFINITIONS = [
  {
    id: 'creative_initiator',
    name: 'The Creative Initiator',
    icon: '🎨',
    description: 'Consistent theme of new beginnings, imagination, and creative initiation',
    color: 'rgba(240,160,60,',
    check: (profile) => {
      const scores = []
      const contributors = []
      if (profile.geneKeys?.spheres?.lifesWork?.gate === 41) {
        scores.push(3); contributors.push("Gene Key 41 (Life's Work)")
      }
      if (profile.geneKeys?.spheres?.evolution?.gate === 41) {
        scores.push(2); contributors.push('Gene Key 41 (Evolution)')
      }
      if (profile.numerology?.core?.lifePath?.val === 3) {
        scores.push(2); contributors.push('Life Path 3')
      }
      if (['Aries', 'Gemini', 'Leo'].includes(profile.natal?.planets?.sun?.sign)) {
        scores.push(1); contributors.push(`${profile.natal.planets.sun.sign} Sun`)
      }
      if (profile.hd?.personality?.sun?.gate === 41) {
        scores.push(2); contributors.push('HD Gate 41 (Personality Sun)')
      }
      if (['Imix', 'Chuen', 'Ik'].includes(profile.mayan?.tzolkin?.daySign)) {
        scores.push(1); contributors.push(`Mayan Day Sign ${profile.mayan.tzolkin.daySign}`)
      }
      if (profile.mayan?.tzolkin?.tone === 1) {
        scores.push(1); contributors.push('Mayan Tone 1 (Unity)')
      }
      return { score: scores.reduce((a, b) => a + b, 0), contributors }
    },
    minScore: 3,
    insight: 'Channel fantasy into tangible creative expression. This pattern calls for structured outlets — art, writing, performance, or any medium that transforms imagination into reality.',
  },
  {
    id: 'wisdom_seeker',
    name: 'The Wisdom Seeker',
    icon: '🔍',
    description: 'Deep investigator, analyst, truth-finder across multiple frameworks',
    color: 'rgba(64,204,221,',
    check: (profile) => {
      const scores = []
      const contributors = []
      if (profile.numerology?.core?.lifePath?.val === 7) {
        scores.push(3); contributors.push('Life Path 7 (Seeker)')
      }
      if (profile.hd?.type === 'Projector') {
        scores.push(2); contributors.push('HD Projector Type')
      }
      if (profile.enneagram?.type === 5) {
        scores.push(2); contributors.push('Enneagram Type 5 (Investigator)')
      }
      if (profile.mbti && ['INTJ', 'INFJ', 'INTP'].includes(profile.mbti)) {
        scores.push(2); contributors.push(`MBTI ${profile.mbti}`)
      }
      if (['Virgo', 'Scorpio', 'Capricorn'].includes(profile.natal?.planets?.sun?.sign)) {
        scores.push(1); contributors.push(`${profile.natal.planets.sun.sign} Sun`)
      }
      if (profile.geneKeys?.spheres?.lifesWork?.gate === 48) {
        scores.push(2); contributors.push('Gene Key 48 (Depth/Wisdom)')
      }
      return { score: scores.reduce((a, b) => a + b, 0), contributors }
    },
    minScore: 3,
    insight: 'Designed to go deep, not wide. Honor the need for mastery before sharing. Wisdom comes through sustained investigation — trust the process of becoming the authority.',
  },
  {
    id: 'emotional_alchemist',
    name: 'The Emotional Alchemist',
    icon: '🌊',
    description: 'Depth processor, transforms through feeling, natural healer',
    color: 'rgba(136,68,255,',
    check: (profile) => {
      const scores = []
      const contributors = []
      if (profile.hd?.authority === 'Emotional - Solar Plexus') {
        scores.push(3); contributors.push('Emotional Authority (HD)')
      }
      if (['Scorpio', 'Cancer', 'Pisces'].includes(profile.natal?.planets?.moon?.sign)) {
        scores.push(2); contributors.push(`Moon in ${profile.natal.planets.moon.sign}`)
      }
      if (['Scorpio', 'Cancer', 'Pisces'].includes(profile.natal?.angles?.asc?.sign)) {
        scores.push(1); contributors.push(`${profile.natal.angles.asc.sign} Rising`)
      }
      if (profile.enneagram?.type === 4) {
        scores.push(2); contributors.push('Enneagram Type 4 (Individualist)')
      }
      if (profile.numerology?.core?.lifePath?.val === 2) {
        scores.push(1); contributors.push('Life Path 2 (Sensitive)')
      }
      if ([36, 22, 55, 30].includes(profile.hd?.personality?.sun?.gate)) {
        scores.push(2); contributors.push(`HD Gate ${profile.hd.personality.sun.gate} (Solar Plexus)`)
      }
      return { score: scores.reduce((a, b) => a + b, 0), contributors }
    },
    minScore: 3,
    insight: 'Wait for the full emotional wave before major decisions. The gift lies in depth of feeling — transforming personal emotion into universal compassion.',
  },
  {
    id: 'leader_builder',
    name: 'The Leader Builder',
    icon: '⚡',
    description: 'Natural authority, structures systems, manifests at scale',
    color: 'rgba(201,168,76,',
    check: (profile) => {
      const scores = []
      const contributors = []
      if (['Manifestor', 'Manifesting Generator'].includes(profile.hd?.type)) {
        scores.push(2); contributors.push(`HD ${profile.hd.type}`)
      }
      if (profile.numerology?.core?.lifePath?.val === 8) {
        scores.push(3); contributors.push('Life Path 8 (Abundance/Power)')
      }
      if (profile.numerology?.core?.expression?.val === 1) {
        scores.push(2); contributors.push('Expression Number 1 (Initiator)')
      }
      if (['Leo', 'Aries', 'Capricorn'].includes(profile.natal?.planets?.sun?.sign)) {
        scores.push(1); contributors.push(`${profile.natal.planets.sun.sign} Sun`)
      }
      if (profile.enneagram?.type === 8) {
        scores.push(2); contributors.push('Enneagram Type 8 (Challenger)')
      }
      if (profile.hd?.profile?.startsWith('1/')) {
        scores.push(1); contributors.push('HD Line 1 (Foundation Builder)')
      }
      return { score: scores.reduce((a, b) => a + b, 0), contributors }
    },
    minScore: 3,
    insight: 'Built to lead and create at scale. The challenge is to lead through inspiration, not control.',
  },
  {
    id: 'bridge_connector',
    name: 'The Bridge Connector',
    icon: '🌉',
    description: 'Natural networker, bridges worlds and people, opportunist path',
    color: 'rgba(96,176,48,',
    check: (profile) => {
      const scores = []
      const contributors = []
      if (profile.hd?.profile?.includes('4')) {
        scores.push(3); contributors.push('HD Line 4 (Opportunist)')
      }
      if (['Libra', 'Gemini'].includes(profile.natal?.planets?.sun?.sign)) {
        scores.push(1); contributors.push(`${profile.natal.planets.sun.sign} Sun`)
      }
      if (profile.numerology?.core?.lifePath?.val === 2) {
        scores.push(2); contributors.push('Life Path 2 (Diplomat)')
      }
      if (['ENFJ', 'ENFP', 'ENTJ'].includes(profile.mbti)) {
        scores.push(2); contributors.push(`MBTI ${profile.mbti}`)
      }
      if (profile.enneagram?.type === 2) {
        scores.push(1); contributors.push('Enneagram Type 2 (Helper)')
      }
      if (profile.geneKeys?.spheres?.lifesWork?.gate === 45) {
        scores.push(2); contributors.push('Gene Key 45 (Synergy)')
      }
      return { score: scores.reduce((a, b) => a + b, 0), contributors }
    },
    minScore: 3,
    insight: 'Success through network and right relationships. Opportunity comes through existing connections — nurture the network and let it work.',
  },
  {
    id: 'sacred_rebel',
    name: 'The Sacred Rebel',
    icon: '🔮',
    description: 'Challenges systems, disrupts for evolution, experimental path',
    color: 'rgba(212,48,112,',
    check: (profile) => {
      const scores = []
      const contributors = []
      if (profile.hd?.profile?.includes('3')) {
        scores.push(2); contributors.push('HD Line 3 (Martyr/Experimenter)')
      }
      if (profile.hd?.profile?.includes('5')) {
        scores.push(2); contributors.push('HD Line 5 (Heretic/Universalizer)')
      }
      if (['Aquarius'].includes(profile.natal?.planets?.sun?.sign)) {
        scores.push(1); contributors.push('Aquarius Sun')
      }
      if (profile.enneagram?.type === 8) {
        scores.push(1); contributors.push('Enneagram Type 8 (Challenger)')
      }
      if ([14, 28, 38, 39].includes(profile.geneKeys?.spheres?.lifesWork?.gate)) {
        scores.push(2); contributors.push(`Gene Key ${profile.geneKeys.spheres.lifesWork.gate} (Rebel Gate)`)
      }
      if (profile.numerology?.core?.lifePath?.val === 11) {
        scores.push(1); contributors.push('Life Path 11 (Master Rebel/Inspirer)')
      }
      return { score: scores.reduce((a, b) => a + b, 0), contributors }
    },
    minScore: 3,
    insight: 'The evolutionary disruptor. Resistance and failure are the sacred teacher — each trial reveals what truly works.',
  },
  {
    id: 'mystic_channel',
    name: 'The Mystic Channel',
    icon: '✨',
    description: 'Receives direct knowing, spiritual gifts, multi-dimensional awareness',
    color: 'rgba(144,80,224,',
    check: (profile) => {
      const scores = []
      const contributors = []
      if (['Pisces'].includes(profile.natal?.planets?.sun?.sign)) {
        scores.push(1); contributors.push('Pisces Sun')
      }
      if (['Pisces', 'Scorpio'].includes(profile.natal?.planets?.moon?.sign)) {
        scores.push(2); contributors.push(`Moon in ${profile.natal.planets.moon.sign}`)
      }
      if (profile.hd?.authority === 'Splenic') {
        scores.push(2); contributors.push('Splenic Authority (Spontaneous Knowing)')
      }
      if (profile.numerology?.core?.lifePath?.val === 11) {
        scores.push(3); contributors.push('Life Path 11 (Master Intuitive)')
      }
      if (profile.enneagram?.type === 9) {
        scores.push(1); contributors.push('Enneagram Type 9 (Peacemaker/Mystic)')
      }
      if ([57, 48, 20].includes(profile.geneKeys?.spheres?.lifesWork?.gate)) {
        scores.push(2); contributors.push(`Gene Key ${profile.geneKeys.spheres.lifesWork.gate} (Intuition)`)
      }
      if (profile.numerology?.core?.lifePath?.val === 22) {
        scores.push(2); contributors.push('Life Path 22 (Master Builder/Visionary)')
      }
      return { score: scores.reduce((a, b) => a + b, 0), contributors }
    },
    minScore: 3,
    insight: "Trust the body's first response — the knowing comes before the mind can explain it.",
  },
]

// ─── Main Detection Function ───────────────────────────────────────────────────

/**
 * Detect cross-system patterns in a compiled profile object.
 * @param {object} profile - compiled profile from buildFullProfile()
 * @returns {Array} detected patterns sorted by score descending
 */
export function detectPatterns(profile) {
  const detected = []
  for (const pattern of PATTERN_DEFINITIONS) {
    const result = pattern.check(profile)
    const score = result.score
    const contributors = result.contributors
    if (score >= pattern.minScore) {
      detected.push({
        id: pattern.id,
        name: pattern.name,
        icon: pattern.icon,
        description: pattern.description,
        insight: pattern.insight,
        color: pattern.color,
        score,
        contributors,
        strength: score >= pattern.minScore * 2
          ? 'strong'
          : score >= pattern.minScore * 1.5
            ? 'moderate'
            : 'subtle',
      })
    }
  }
  return detected.sort((a, b) => b.score - a.score)
}

// ─── Full Profile Builder ──────────────────────────────────────────────────────

/**
 * Build a complete profile object from birth data by running all engines.
 * Returns a unified object consumed by ClientDeepProfile, PatternMiner, etc.
 *
 * @param {object} birthData
 * @param {string} birthData.name        - Full name (for numerology)
 * @param {string} birthData.dob         - 'YYYY-MM-DD'
 * @param {string} [birthData.tob]       - 'HH:MM' (24h)
 * @param {number} [birthData.lat]       - Birth latitude
 * @param {number} [birthData.lon]       - Birth longitude
 * @param {number} [birthData.timezone]  - UTC offset (hours)
 * @param {number} [birthData.enneagram] - Enneagram type (1-9, manual entry)
 * @param {string} [birthData.mbti]      - MBTI type string (manual entry)
 */
export function buildFullProfile(birthData) {
  const { name, dob, tob = '12:00', lat = 0, lon = 0, timezone = 0, enneagram, mbti } = birthData

  // Parse date/time components
  const [year, month, day] = dob.split('-').map(Number)
  const [hour, minute] = tob.split(':').map(Number)

  // Run all engines (with safe fallbacks)
  let natal = null
  let hd = null
  let geneKeys = null
  let numerology = null
  let mayan = null

  try {
    natal = getNatalChart({ day, month, year, hour, minute, lat, lon, timezone })
  } catch {
    console.warn('[patternEngine] natal failed:', e.message)
  }

  try {
    hd = computeHDChart({ dateOfBirth: dob, timeOfBirth: tob, utcOffset: timezone })
  } catch {
    console.warn('[patternEngine] hd failed:', e.message)
  }

  try {
    geneKeys = getGeneKeysProfile({ day, month, year, hour, minute, timezone })
  } catch {
    console.warn('[patternEngine] geneKeys failed:', e.message)
  }

  try {
    numerology = getNumerologyProfileFromDob(dob, name || '')
  } catch {
    console.warn('[patternEngine] numerology failed:', e.message)
  }

  try {
    mayan = getMayanProfile(day, month, year)
  } catch {
    console.warn('[patternEngine] mayan failed:', e.message)
  }

  const profile = {
    name,
    birthData,
    natal,
    hd,
    geneKeys,
    numerology,
    mayan,
    enneagram: enneagram ? { type: enneagram } : null,
    mbti: mbti || null,
  }

  // Detect patterns
  profile.patterns = detectPatterns(profile)

  return profile
}
