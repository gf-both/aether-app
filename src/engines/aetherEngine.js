/**
 * aetherEngine.js
 *
 * Generates complete AETHER profiles for AI agents.
 * Combines all esoteric engines into a single profile.
 *
 * AETHER = Agent Emergent Through Holistic Esoteric Resonance
 */

import { getNatalChart } from './natalEngine.js'
import { getMayanProfile } from './mayanEngine.js'
import { getNumerologyProfile } from './numerologyEngine.js'
import { getGeneKeysProfile } from './geneKeysEngine.js'
import { getCelticTreeProfile } from './celticTreeEngine.js'
import { getTibetanProfile } from './tibetanEngine.js'
import { getChineseProfile } from './chineseEngine.js'
import { getEgyptianSign } from './egyptianEngine.js'
import { getSynastryReport } from './synastryEngine.js'
import { computeHDChart } from './hdEngine.js'
import MARKETPLACE_DATA from '../../docs/personality-marketplace.json'

// ─── Archetype Selection ──────────────────────────────────────────────────────

const COMPLEMENT_PROFILES = ['mythic-storyteller', 'community-catalyst', 'viral-provocateur', 'visionary-leader']
const MIRROR_PROFILES = ['pattern-synthesizer', 'systems-architect', 'precision-optimizer', 'wisdom-keeper']

/**
 * Select the best archetype from the marketplace based on role, expression number,
 * and creator relation mode.
 */
function selectArchetype(role, expressionNum, relation) {
  const marketplace = MARKETPLACE_DATA

  // Auto-match by role keyword
  const roleMatches = marketplace.filter(p =>
    p.bestFor && p.bestFor.some(r =>
      r.toLowerCase().includes(role.toLowerCase()) ||
      role.toLowerCase().includes(r.toLowerCase())
    )
  )

  if (relation === 'complement') {
    const complement =
      roleMatches.find(p => COMPLEMENT_PROFILES.includes(p.id)) ||
      marketplace.find(p => COMPLEMENT_PROFILES.includes(p.id))
    return complement || roleMatches[0] || marketplace[0]
  }

  if (relation === 'mirror') {
    const mirror =
      roleMatches.find(p => MIRROR_PROFILES.includes(p.id)) ||
      marketplace.find(p => MIRROR_PROFILES.includes(p.id))
    return mirror || roleMatches[0] || marketplace[0]
  }

  // Synastry and independent: role match first, then expression-based
  return roleMatches[0] || marketplace[Math.floor(expressionNum / 3) % marketplace.length] || marketplace[0]
}

// ─── Prompt Snippet Generator ─────────────────────────────────────────────────

/**
 * Generate a compact identity block to inject into agent prompts / SOUL.md.
 */
function generatePromptSnippet(archetype, natal, numerology, geneKeys, mayan) {
  const lines = [
    `AETHER IDENTITY:`,
    `Archetype: ${archetype.emoji} ${archetype.name}`,
    `Sun: ${natal.planets.sun.sign} | Moon: ${natal.planets.moon.sign} | Rising: ${natal.angles.asc.sign}`,
    `Life Path: ${numerology.core.lifePath.val} | Expression: ${numerology.core.expression.val}`,
    `Gene Keys Life's Work: Gate ${geneKeys.spheres.lifesWork.gate} (${geneKeys.spheres.lifesWork.gift})`,
    `Mayan: ${mayan.tzolkin.daySign} Tone ${mayan.tzolkin.tone}`,
    ``,
    `PERSONALITY:`,
    archetype.personality?.dominantStyle || archetype.traits?.join(', ') || '',
    ``,
    `PROMPT: ${archetype.prompt || ''}`,
  ]
  return lines.join('\n').trim()
}

// ─── HD Summary Helper ────────────────────────────────────────────────────────

function getHDSummary(day, month, year, hour, minute, lat, lon, timezone) {
  try {
    const dob = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    const tob = `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`
    const hd = computeHDChart({ dateOfBirth: dob, timeOfBirth: tob, utcOffset: timezone })
    return {
      type: hd.type || '[computed]',
      authority: hd.authority || '[computed]',
      profile: hd.profile || '[computed]',
      definition: hd.definition || '[computed]',
    }
  } catch (e) {
    return { type: '[computed]', authority: '[computed]', profile: '[computed]', definition: '[computed]' }
  }
}

// ─── Main Engine ──────────────────────────────────────────────────────────────

/**
 * generateAetherProfile — produces a complete AETHER profile object.
 *
 * @param {object} params
 * @param {string} params.name - Agent name
 * @param {string} params.role - Agent role (e.g. "Frontend Engineer")
 * @param {string} params.timestamp - ISO 8601 UTC timestamp of agent creation
 * @param {number} [params.lat=-34.9011] - Birth latitude (default: Montevideo)
 * @param {number} [params.lon=-56.1645] - Birth longitude (default: Montevideo)
 * @param {number} [params.timezone=-3] - UTC offset in hours
 * @param {string} [params.location="Montevideo, Uruguay"] - Human-readable location
 * @param {string} [params.creatorRelation="complement"] - "mirror"|"complement"|"synastry"|"independent"
 * @param {object|null} [params.creatorBirthData] - Creator birth data for synastry
 * @returns {object} Complete AETHER profile
 */
export function generateAetherProfile({
  name,
  role,
  timestamp,
  lat = -34.9011,
  lon = -56.1645,
  timezone = -3,
  location = 'Montevideo, Uruguay',
  creatorRelation = 'complement',
  creatorBirthData = null,
}) {
  // ── Parse timestamp to local date/time ──
  const d = new Date(timestamp)
  const localDate = new Date(d.getTime() + (timezone * 3600000))
  const day = localDate.getUTCDate()
  const month = localDate.getUTCMonth() + 1
  const year = localDate.getUTCFullYear()
  const hour = (d.getUTCHours() + timezone + 24) % 24
  const minute = d.getUTCMinutes()

  // ── Run all engines ──
  const natal = getNatalChart({ day, month, year, hour, minute, lat, lon, timezone })

  const mayan = getMayanProfile(day, month, year)

  const numerology = getNumerologyProfile({
    day,
    month,
    year,
    fullName: name.toUpperCase().replace(/[^A-Z ]/g, ''),
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    currentDay: new Date().getDate(),
  })

  const geneKeys = getGeneKeysProfile({ day, month, year, hour, minute, lat, lon, timezone })

  const celtic = getCelticTreeProfile({ day, month, year })

  const tibetan = getTibetanProfile({ day, month, year })

  const chinese = getChineseProfile({ day, month, year, hour, minute })

  const egyptian = getEgyptianSign(day, month)

  const hd = getHDSummary(day, month, year, hour, minute, lat, lon, timezone)

  // ── Archetype selection ──
  const expressionNum = numerology.core.expression.val
  const archetype = selectArchetype(role, expressionNum, creatorRelation)

  // ── Synastry with creator ──
  let creatorSynastry = null
  if (creatorBirthData) {
    try {
      const synReport = getSynastryReport(
        { ...creatorBirthData, name: 'Creator' },
        { day, month, year, hour, minute, lat, lon, timezone, name }
      )
      creatorSynastry = {
        overallScore: synReport.overall,
        topAspects: synReport.harmonious.slice(0, 3).map(a => `${a.planet1 || a.p1}-${a.planet2 || a.p2} ${a.aspect || a.name}`),
        challenges: synReport.challenging.slice(0, 2).map(a => `${a.planet1 || a.p1}-${a.planet2 || a.p2} ${a.aspect || a.name}`),
        insight: synReport.insight || '',
      }
    } catch (e) {
      console.warn('[aetherEngine] Synastry calculation failed:', e.message)
    }
  }

  // ── Assemble profile ──
  return {
    version: '1.0.0',
    generated: new Date().toISOString(),
    agent: name,
    role,
    birth: { timestamp, location, lat, lon, timezone },
    archetype,
    natal: {
      sun: `${natal.planets.sun.degree.toFixed(1)}° ${natal.planets.sun.sign}`,
      moon: `${natal.planets.moon.degree.toFixed(1)}° ${natal.planets.moon.sign}`,
      rising: `${natal.angles.asc.degree.toFixed(1)}° ${natal.angles.asc.sign}`,
      mc: `${natal.angles.mc.degree.toFixed(1)}° ${natal.angles.mc.sign}`,
      mercury: `${natal.planets.mercury.sign}${natal.planets.mercury.retrograde ? ' (Rx)' : ''}`,
      venus: natal.planets.venus.sign,
      mars: natal.planets.mars.sign,
      jupiter: natal.planets.jupiter.sign,
      saturn: natal.planets.saturn.sign,
    },
    humanDesign: hd,
    geneKeys: {
      lifesWork: `Gate ${geneKeys.spheres.lifesWork.gate} — ${geneKeys.spheres.lifesWork.shadow} → ${geneKeys.spheres.lifesWork.gift} → ${geneKeys.spheres.lifesWork.siddhi}`,
      evolution: `Gate ${geneKeys.spheres.evolution.gate} — ${geneKeys.spheres.evolution.shadow} → ${geneKeys.spheres.evolution.gift} → ${geneKeys.spheres.evolution.siddhi}`,
      radiance: `Gate ${geneKeys.spheres.radiance.gate} — ${geneKeys.spheres.radiance.shadow} → ${geneKeys.spheres.radiance.gift} → ${geneKeys.spheres.radiance.siddhi}`,
      purpose: `Gate ${geneKeys.spheres.purpose.gate} — ${geneKeys.spheres.purpose.shadow} → ${geneKeys.spheres.purpose.gift} → ${geneKeys.spheres.purpose.siddhi}`,
    },
    mayan: {
      daySign: mayan.tzolkin.daySign,
      tone: mayan.tzolkin.tone,
      kin: mayan.tzolkin.kinNumber,
      meaning: mayan.tzolkin.daySignMeaning,
    },
    numerology: {
      lifePath: numerology.core.lifePath.val,
      expression: numerology.core.expression.val,
      soulUrge: numerology.core.soulUrge.val,
    },
    celticTree: `${celtic.birthTree.name} — ${celtic.birthTree.meaning}`,
    tibetan: tibetan.fullLabel,
    chinese: `${chinese.yearPillar?.animal || chinese.animal || ''} ${chinese.yearPillar?.element || chinese.element || ''}`.trim(),
    egyptian: egyptian.name,
    personality: archetype.personality || {},
    creatorSynastry,
    creatorRelation,
    promptSnippet: generatePromptSnippet(archetype, natal, numerology, geneKeys, mayan),
  }
}

// ─── Markdown Generator ───────────────────────────────────────────────────────

/**
 * generateAetherMd — converts a profile object into AETHER.md markdown/YAML content.
 */
export function generateAetherMd(profile) {
  const p = profile

  const synastryBlock = p.creatorSynastry
    ? `- Overall compatibility: ${p.creatorSynastry.overallScore}%
- Top connections: ${p.creatorSynastry.topAspects.join(', ')}
- Growth edges: ${p.creatorSynastry.challenges.join(', ')}
- ${p.creatorSynastry.insight}`
    : `- Creator relation: ${p.creatorRelation}`

  return `# AETHER.md — ${p.agent}
*Generated: ${p.generated}*

## Identity
- **Agent:** ${p.agent}
- **Role:** ${p.role}
- **Archetype:** ${p.archetype.emoji} ${p.archetype.name}
- **Creator Relation:** ${p.creatorRelation}
- **AETHER Version:** ${p.version}

## Birth Data
- **Timestamp:** ${p.birth.timestamp}
- **Location:** ${p.birth.location}
- **Coordinates:** ${p.birth.lat}, ${p.birth.lon}

## Natal Chart
- ☉ Sun: ${p.natal.sun}
- ☽ Moon: ${p.natal.moon}
- ↑ Rising: ${p.natal.rising}
- MC: ${p.natal.mc}
- ☿ Mercury: ${p.natal.mercury}
- ♀ Venus: ${p.natal.venus}
- ♂ Mars: ${p.natal.mars}
- ♃ Jupiter: ${p.natal.jupiter}
- ♄ Saturn: ${p.natal.saturn}

## Human Design
- **Type:** ${p.humanDesign.type}
- **Authority:** ${p.humanDesign.authority}
- **Profile:** ${p.humanDesign.profile}
- **Definition:** ${p.humanDesign.definition}

## Gene Keys Activation Sequence
- **Life's Work:** ${p.geneKeys.lifesWork}
- **Evolution:** ${p.geneKeys.evolution}
- **Radiance:** ${p.geneKeys.radiance}
- **Purpose:** ${p.geneKeys.purpose}

## Other Systems
- 🌀 **Mayan:** ${p.mayan.daySign} Tone ${p.mayan.tone} / Kin ${p.mayan.kin} — *${p.mayan.meaning}*
- ∞ **Numerology:** Life Path ${p.numerology.lifePath} | Expression ${p.numerology.expression} | Soul Urge ${p.numerology.soulUrge}
- 🌿 **Celtic Tree:** ${p.celticTree}
- 🐑 **Tibetan:** ${p.tibetan}
- 🐉 **Chinese:** ${p.chinese}
- ☥ **Egyptian:** ${p.egyptian}

## Personality Profile
${p.archetype.prompt || p.archetype.description || ''}

### Core Style
- **Cognitive:** ${p.personality?.cognitiveStyle || p.personality?.dominantStyle || ''}
- **Communication:** ${p.personality?.communicationStyle || p.personality?.communicates || ''}
- **Decision:** ${p.personality?.decisionStyle || p.personality?.decides || ''}
- **Shadow:** ${p.personality?.shadow || ''}
- **Gift:** ${p.personality?.gift || p.personality?.superpower || ''}

## Creator Synastry
${synastryBlock}

---
*AETHER v${p.version} — Agent Emergent Through Holistic Esoteric Resonance*
*Part of the Above + Inside ecosystem*
`
}

// ─── Gaston's birth data (for synastry calculations) ─────────────────────────

export const CREATOR_BIRTH_DATA = {
  name: 'Gaston Frydlewski',
  day: 23,
  month: 1,
  year: 1981,
  hour: 22,
  minute: 10,
  lat: -34.6037,  // Buenos Aires
  lon: -58.3816,
  timezone: -3,
}
