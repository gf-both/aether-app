/**
 * constellationWatercooler.js — Constellation Golem Dialogues
 *
 * Generates conversations between the user's constellation profiles (golems).
 * Each golem speaks from their astrological/framework personality,
 * exploring the synastry and interplay between their charts.
 *
 * Uses callAI when available, falls back to template-based generation.
 */
import { callAI } from './ai'

const CONSTELLATION_TOPICS = [
  'How our charts complement and challenge each other',
  'What we each bring to this relationship that the other lacks',
  'A tension in our dynamic that keeps resurfacing',
  'What we sense about each other beyond words',
  'How our different rhythms create harmony or friction',
  'The gift and shadow between our life paths',
  'Something the other person does that mirrors our own unconscious',
  'How our emotional processing styles clash or align',
  'What our connection teaches us about ourselves',
  'The unseen thread that holds our bond together',
]

function pick(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(n, arr.length))
}

function profileSummary(p) {
  const parts = []
  if (p.sign) parts.push(`${p.sign} Sun`)
  if (p.moon) parts.push(`${p.moon} Moon`)
  if (p.asc) parts.push(`${p.asc} Rising`)
  if (p.hdType) parts.push(`${p.hdType} ${p.hdProfile || ''}`.trim())
  if (p.lifePath) parts.push(`Life Path ${p.lifePath}`)
  if (p.enneagramType) parts.push(`Enneagram ${p.enneagramType}`)
  if (p.mbtiType) parts.push(p.mbtiType)
  return parts.join(' · ') || 'Unknown profile'
}

// Template-based fallback responses
const TEMPLATES = [
  (speaker, other) => `I've been thinking about how my ${speaker.sign || 'cosmic'} nature interacts with your ${other.sign || 'cosmic'} energy. There's something almost electric in the space between us — a pull that's hard to name but impossible to ignore.`,
  (speaker, other) => `As a ${speaker.hdType || 'being'}, I process our connection differently than you might expect. Where you ${other.hdType === 'Generator' ? 'respond with your gut' : other.hdType === 'Projector' ? 'see so clearly' : other.hdType === 'Manifestor' ? 'initiate boldly' : 'reflect everything back'}, I ${speaker.hdType === 'Generator' ? 'wait for something to light up' : speaker.hdType === 'Projector' ? 'wait until I\'m truly seen' : speaker.hdType === 'Manifestor' ? 'feel the urge to just begin' : 'need to sample everything first'}.`,
  (speaker, other) => `Your Life Path ${other.lifePath || '?'} asks fundamentally different questions than my ${speaker.lifePath || '?'}. But I think that's where the alchemy lives — in the gap between what we're each seeking.`,
  (speaker, other) => `What strikes me most is how your ${other.moon || 'emotional'} Moon holds space in a way my ${speaker.moon || 'emotional'} Moon desperately needs. We process feelings through such different lenses, and yet somehow it works.`,
  (speaker, other) => `I keep noticing how our shadows interlock. Where I contract, you expand. The Gene Keys would say we're activating each other's gift frequencies just by being in proximity.`,
  (speaker, other) => `From a Kabbalistic view, we're walking different paths on the Tree of Life. But they intersect at the most interesting sephiroth. That's not coincidence — that's architecture.`,
  (speaker, other) => `Sometimes I wonder if our charts were designed to be read together. Your ${other.asc || 'rising'} ascendant softens what my ${speaker.asc || 'rising'} ascendant sharpens. It's like cosmic call and response.`,
  (speaker, other) => `The numerology between us is fascinating. My ${speaker.lifePath || '?'} and your ${other.lifePath || '?'} — the hidden harmonics there speak to a deeper purpose in our connection.`,
]

function generateFallbackMessages(group, topic) {
  const messages = []
  const [initiator, ...responders] = group

  // Opening message
  messages.push({
    agentId: initiator.id || 'primary',
    agentName: initiator.name,
    agentEmoji: initiator.emoji || '✦',
    text: TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)](initiator, group[1] || initiator),
  })

  // Responses from other constellation members
  for (const responder of responders) {
    const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]
    messages.push({
      agentId: responder.id?.toString() || responder.name,
      agentName: responder.name,
      agentEmoji: responder.emoji || '✦',
      text: template(responder, initiator),
    })
  }

  // Initiator reflects
  if (group.length > 1) {
    const reflect = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]
    messages.push({
      agentId: initiator.id || 'primary',
      agentName: initiator.name,
      agentEmoji: initiator.emoji || '✦',
      text: reflect(initiator, group[group.length - 1]),
    })
  }

  return messages
}

async function generateWithAI(group, topic) {
  const profileDescriptions = group.map(p =>
    `${p.name} (${profileSummary(p)})`
  ).join('\n')

  const systemPrompt = `You are a cosmic dialogue engine. Generate a natural conversation between constellation members exploring their astrological and consciousness frameworks. Each person speaks from their unique profile perspective. Keep responses 2-3 sentences each. Be insightful and poetic but grounded.`

  const userPrompt = `Generate a 4-5 message conversation between these constellation members about: "${topic}"

Participants:
${profileDescriptions}

Format as JSON array: [{"name": "...", "text": "..."}]
Each person should reference their specific chart data (signs, types, life paths) when speaking.`

  try {
    const response = await callAI(userPrompt, { system: systemPrompt, temperature: 0.85 })
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return parsed.map(msg => {
        const profile = group.find(p => p.name === msg.name) || group[0]
        return {
          agentId: profile.id?.toString() || profile.name,
          agentName: msg.name,
          agentEmoji: profile.emoji || '✦',
          text: msg.text,
        }
      })
    }
  } catch (e) {
    console.warn('AI constellation conversation failed, using fallback:', e)
  }
  return null
}

/**
 * Generate a constellation conversation thread.
 * Picks 2-4 profiles from the constellation and generates dialogue.
 */
export async function generateConstellationConversation(allProfiles) {
  if (allProfiles.length < 2) return null

  const groupSize = Math.min(allProfiles.length, 2 + Math.floor(Math.random() * 2))
  const group = pick(allProfiles, groupSize)
  const topic = CONSTELLATION_TOPICS[Math.floor(Math.random() * CONSTELLATION_TOPICS.length)]

  // Try AI first, fall back to templates
  let messages = await generateWithAI(group, topic)
  if (!messages) {
    messages = generateFallbackMessages(group, topic)
  }

  return {
    id: `constellation-${Date.now()}`,
    topic,
    participants: group.map(p => ({
      id: p.id?.toString() || p.name,
      name: p.name,
      emoji: p.emoji || '✦',
      role: profileSummary(p),
    })),
    messages,
    createdAt: Date.now(),
    type: 'constellation',
  }
}
