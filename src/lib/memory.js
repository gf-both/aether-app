/**
 * memory.js — GOLEM Memory Layer (JS client)
 *
 * Calls the Graphiti memory server (Python/FastAPI on :8765)
 * via the Supabase edge function proxy in production,
 * or directly in development.
 *
 * Usage:
 *   import { storeAgentMemory, getAgentMemories, storeTasteSignal } from './memory'
 */

import { supabase } from './supabase'

const DEV_MEMORY_URL = 'http://localhost:8765'
const IS_DEV = import.meta.env.DEV

// ── Core fetch helper ─────────────────────────────────────────────────────────

async function memoryFetch(path, body) {
  if (IS_DEV) {
    // Direct call to local Python server in development
    try {
      const res = await fetch(`${DEV_MEMORY_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      return res.ok ? await res.json() : null
    } catch {
      console.warn('[memory] Local memory server not running — start with: python3.11 src/memory/graphitiMemory.py')
      return null
    }
  } else {
    // Production: route through Supabase edge function
    const { data, error } = await supabase.functions.invoke('memory-proxy', {
      body: { path, ...body },
    })
    if (error) { console.warn('[memory] Proxy error:', error); return null }
    return data
  }
}

// ── Watercooler agent memory ──────────────────────────────────────────────────

/**
 * Store a Watercooler conversation thread in an agent's memory.
 * Call after generating each conversation batch.
 */
export async function storeAgentMemory(agentId, topic, messages) {
  const content = messages
    .map(m => `${m.agentName}: ${m.text}`)
    .join('\n')

  return memoryFetch('/memory/add', {
    group_id: `watercooler-${agentId}`,
    name: `${topic}-${Date.now()}`,
    content: `Topic: ${topic}\n\n${content}`,
    episode_type: 'message',
    source_description: 'Watercooler',
  })
}

/**
 * Get an agent's relevant memories before generating their next conversation.
 * Returns array of fact strings to inject into the generation prompt.
 */
export async function getAgentMemories(agentId, topic) {
  const result = await memoryFetch('/memory/search', {
    group_id: `watercooler-${agentId}`,
    query: `What has ${agentId} said or felt about: ${topic}? Any ongoing tensions or alliances?`,
    limit: 4,
  })
  return result?.results?.map(r => r.fact) ?? []
}

// ── Dating match memory ───────────────────────────────────────────────────────

/**
 * Store a dating profile encounter (scoring + decision).
 */
export async function storeMatchMemory(matchId, profileData, score, decision) {
  const content = [
    `Name: ${profileData.name || 'Unknown'}, Age: ${profileData.age || '?'}`,
    `Sign: ${profileData.sign || 'unknown'}, HD: ${profileData.esoteric_info?.hd_type || 'unknown'}`,
    `Bio: ${profileData.bio || '(none)'}`,
    `Vibe: ${profileData.vibe || '(none)'}`,
    `Compatibility score: ${score}/100`,
    `Decision: ${decision}`,
  ].join('\n')

  return memoryFetch('/memory/add', {
    group_id: `dating-match-${matchId}`,
    name: `encounter-${Date.now()}`,
    content,
    source_description: 'Bumble Assistant',
  })
}

/**
 * Get prior context for a match (if we've seen them before).
 */
export async function getMatchMemories(matchId) {
  const result = await memoryFetch('/memory/search', {
    group_id: `dating-match-${matchId}`,
    query: 'What happened last time? What do we know about this person?',
    limit: 3,
  })
  return result?.results?.map(r => r.fact) ?? []
}

// ── Taste learning ────────────────────────────────────────────────────────────

/**
 * Store a swipe decision as a taste learning signal.
 * Called from bumble-assistant.js after each Y/N.
 */
export async function storeTasteSignal({ sign, hdType, lifePath, score, decision, notes = '' }) {
  return memoryFetch('/memory/taste', {
    profile_sign: sign || 'unknown',
    profile_hd_type: hdType || 'unknown',
    profile_lp: lifePath || 0,
    score,
    decision,
    notes,
  })
}

/**
 * Get taste pattern insights (call after 20+ decisions).
 * Returns array of insight strings.
 */
export async function getTasteInsights() {
  if (IS_DEV) {
    try {
      const res = await fetch(`${DEV_MEMORY_URL}/memory/taste/insights`)
      const data = res.ok ? await res.json() : null
      return data?.insights ?? []
    } catch { return [] }
  } else {
    const { data } = await supabase.functions.invoke('memory-proxy', {
      body: { path: '/memory/taste/insights', method: 'GET' },
    })
    return data?.insights ?? []
  }
}

// ── RelatEngine memory ────────────────────────────────────────────────────────

/**
 * Store a relationship simulation step result.
 */
export async function storeRelationshipStep(simId, step, narrative, metadata) {
  return memoryFetch('/memory/add', {
    group_id: `relatsim-${simId}`,
    name: `T${step}-${Date.now()}`,
    content: `Step T${step}: ${narrative}\nTension: ${metadata.tension}/10, Growth: ${metadata.growth}/10\nTheme: ${metadata.keyTheme}`,
    source_description: 'RelatEngine',
  })
}

/**
 * Get prior sim steps for context in the next step.
 */
export async function getRelationshipContext(simId, currentStep) {
  const result = await memoryFetch('/memory/search', {
    group_id: `relatsim-${simId}`,
    query: `What has happened so far in this relationship simulation? What patterns are emerging?`,
    limit: 4,
  })
  return result?.results?.map(r => r.fact) ?? []
}
