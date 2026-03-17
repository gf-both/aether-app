/**
 * golemApi.js
 *
 * High-level API for GOLEM profile generation and agent assignment.
 * Uses golemEngine locally — no external API calls needed.
 */

import { generateGolemProfile, generateGolemMd, CREATOR_BIRTH_DATA } from '../engines/golemEngine.js'

// ─── Profile Generation ───────────────────────────────────────────────────────

/**
 * Generate a complete GOLEM profile + markdown output.
 *
 * @param {object} params
 * @param {string} params.name - Agent name
 * @param {string} params.role - Agent role
 * @param {string} [params.timestamp] - ISO UTC timestamp (defaults to now)
 * @param {number} [params.lat] - Latitude
 * @param {number} [params.lon] - Longitude
 * @param {number} [params.timezone] - UTC offset
 * @param {string} [params.location] - Human-readable location
 * @param {string} [params.creatorRelation="complement"] - Relation to creator
 * @param {boolean} [params.includeCreatorSynastry=true] - Whether to run synastry engine
 * @returns {{ profile: object, md: string }}
 */
export async function generateProfile(params) {
  const {
    name,
    role,
    timestamp = new Date().toISOString(),
    lat = -34.9011,
    lon = -56.1645,
    timezone = -3,
    location = 'Montevideo, Uruguay',
    creatorRelation = 'complement',
    includeCreatorSynastry = true,
  } = params

  const creatorBirthData = includeCreatorSynastry ? CREATOR_BIRTH_DATA : null

  const profile = generateGolemProfile({
    name,
    role,
    timestamp,
    lat,
    lon,
    timezone,
    location,
    creatorRelation,
    creatorBirthData,
  })

  const md = generateGolemMd(profile)

  return { profile, md }
}

// ─── Gaston's Chart (for Mirror/Complement UI) ────────────────────────────────

/**
 * Get Gaston's golem profile — used for mirror/complement visualization.
 */
export async function getCreatorProfile() {
  const { CREATOR_BIRTH_DATA: cbd } = await import('../engines/golemEngine.js')
  const { getNatalChart } = await import('../engines/natalEngine.js')
  const { getNumerologyProfile } = await import('../engines/numerologyEngine.js')
  const { getGeneKeysProfile } = await import('../engines/geneKeysEngine.js')

  const natal = getNatalChart({ ...cbd })
  const numerology = getNumerologyProfile({
    day: cbd.day, month: cbd.month, year: cbd.year,
    fullName: 'GASTON FRYDLEWSKI',
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    currentDay: new Date().getDate(),
  })
  const geneKeys = getGeneKeysProfile({ ...cbd })

  return {
    name: 'Gaston Frydlewski',
    sun: `${natal.planets.sun.degree.toFixed(1)}° ${natal.planets.sun.sign}`,
    moon: `${natal.planets.moon.degree.toFixed(1)}° ${natal.planets.moon.sign}`,
    rising: `${natal.angles.asc.degree.toFixed(1)}° ${natal.angles.asc.sign}`,
    lifePath: numerology.core.lifePath.val,
    expression: numerology.core.expression.val,
    gkLifesWork: `Gate ${geneKeys.spheres.lifesWork.gate} — ${geneKeys.spheres.lifesWork.gift}`,
    archetype: 'Aquarius Seeker / LP7 Analyst',
    mirrorProfiles: ['pattern-synthesizer', 'systems-architect', 'wisdom-keeper', 'precision-optimizer'],
    complementProfiles: ['mythic-storyteller', 'community-catalyst', 'visionary-leader', 'viral-provocateur'],
  }
}

// ─── Assign to Paperclip Agent ────────────────────────────────────────────────

/**
 * Assign an GOLEM profile to a Paperclip agent by injecting the promptSnippet
 * into the agent's heartbeat prompt.
 *
 * @param {string} agentId - Paperclip agent ID
 * @param {object} profile - GOLEM profile object (from generateProfile)
 * @param {string} paperclipToken - Paperclip API token
 * @param {string} [paperclipBaseUrl="https://api.paperclip.ai"] - API base URL
 */
export async function assignToAgent(agentId, profile, paperclipToken, paperclipBaseUrl = 'https://api.paperclip.ai') {
  if (!agentId || !profile || !paperclipToken) {
    throw new Error('assignToAgent: agentId, profile, and paperclipToken are required')
  }

  const promptAddendum = `\n\n---\n${profile.promptSnippet}\n---`

  const response = await fetch(`${paperclipBaseUrl}/v1/agents/${agentId}/soul`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${paperclipToken}`,
    },
    body: JSON.stringify({
      golem_prompt: promptAddendum,
      golem_profile: {
        version: profile.version,
        archetype: profile.archetype.id,
        archetypeName: profile.archetype.name,
        archetypeEmoji: profile.archetype.emoji,
        creatorRelation: profile.creatorRelation,
        sun: profile.natal.sun,
        moon: profile.natal.moon,
        rising: profile.natal.rising,
        lifePath: profile.numerology.lifePath,
        expression: profile.numerology.expression,
        gkLifesWork: profile.geneKeys.lifesWork,
        mayan: `${profile.mayan.daySign} Tone ${profile.mayan.tone}`,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Paperclip API error ${response.status}: ${err}`)
  }

  return await response.json()
}

// ─── List Agents with GOLEM Profiles ────────────────────────────────────────

/**
 * Fetch all Paperclip agents and their GOLEM profiles for the discussion board.
 *
 * @param {string} paperclipToken
 * @param {string} [paperclipBaseUrl]
 */
export async function listAgentsWithGolem(paperclipToken, paperclipBaseUrl = 'https://api.paperclip.ai') {
  if (!paperclipToken) return []

  try {
    const response = await fetch(`${paperclipBaseUrl}/v1/agents`, {
      headers: { 'Authorization': `Bearer ${paperclipToken}` },
    })
    if (!response.ok) return []
    const data = await response.json()
    return (data.agents || []).filter(a => a.golem_profile)
  } catch {
    return []
  }
}
