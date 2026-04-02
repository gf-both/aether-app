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

// Return null for missing/placeholder values
function val(v) { return v && v !== '?' ? v : null }

function profileSummary(p) {
  const parts = []
  if (val(p.sign)) parts.push(`${p.sign} Sun`)
  if (val(p.moon)) parts.push(`${p.moon} Moon`)
  if (val(p.asc)) parts.push(`${p.asc} Rising`)
  if (val(p.hdType)) parts.push(`${p.hdType}${val(p.hdProfile) ? ` ${p.hdProfile}` : ''}`.trim())
  if (val(p.lifePath)) parts.push(`Life Path ${p.lifePath}`)
  if (p.enneagramType) parts.push(`Enneagram ${p.enneagramType}`)
  if (p.mbtiType) parts.push(p.mbtiType)
  return parts.join(' · ') || 'Unknown profile'
}

// Template-based fallback responses — gracefully handle missing data
const TEMPLATES = [
  (speaker, other) => {
    const ss = val(speaker.sign), os = val(other.sign)
    return `I've been thinking about how my ${ss || 'inner'} nature interacts with your ${os || 'essence'}. There's something almost electric in the space between us — a pull that's hard to name but impossible to ignore.`
  },
  (speaker, other) => {
    const sh = val(speaker.hdType), oh = val(other.hdType)
    const otherVerb = oh === 'Generator' ? 'respond with your gut' : oh === 'Projector' ? 'see so clearly' : oh === 'Manifestor' ? 'initiate boldly' : 'hold space the way you do'
    const selfVerb = sh === 'Generator' ? 'wait for something to light up' : sh === 'Projector' ? 'wait until I\'m truly seen' : sh === 'Manifestor' ? 'feel the urge to just begin' : 'need to process from the outside in'
    return `As ${sh ? `a ${sh}` : 'the being I am'}, I process our connection differently. Where you ${otherVerb}, I ${selfVerb}.`
  },
  (speaker, other) => {
    const sl = val(speaker.lifePath), ol = val(other.lifePath)
    if (sl && ol) return `Your Life Path ${ol} asks fundamentally different questions than my ${sl}. But I think that's where the alchemy lives — in the gap between what we're each seeking.`
    return `We're walking fundamentally different paths, and that difference is exactly what creates the charge between us. The tension is not accidental — it's where the growth lives.`
  },
  (speaker, other) => {
    const sm = val(speaker.moon), om = val(other.moon)
    if (sm && om) return `What strikes me most is how your ${om} Moon holds space in a way my ${sm} Moon desperately needs. We process feelings through such different lenses, and yet somehow it works.`
    return `What strikes me is how differently we process emotion. You hold space in a way I need, and I suspect I mirror something back to you that you can't easily access alone.`
  },
  () => `I keep noticing how our shadows interlock. Where I contract, you expand. The Gene Keys would say we're activating each other's gift frequencies just by being in proximity.`,
  () => `From a Kabbalistic view, we're walking different paths on the Tree of Life. But they intersect at the most interesting sephiroth. That's not coincidence — that's architecture.`,
  (speaker, other) => {
    const sa = val(speaker.asc), oa = val(other.asc)
    if (sa && oa) return `Sometimes I wonder if our charts were designed to be read together. Your ${oa} ascendant softens what my ${sa} ascendant sharpens. It's like cosmic call and response.`
    return `Sometimes I wonder if our patterns were designed to be read together. What you soften, I sharpen. What I open, you ground. It's like cosmic call and response.`
  },
  (speaker, other) => {
    const sl = val(speaker.lifePath), ol = val(other.lifePath)
    if (sl && ol) return `The numerology between us is fascinating. My ${sl} and your ${ol} — the hidden harmonics there speak to a deeper purpose in our connection.`
    return `There's a resonance between our numbers, our timing, our arrival in each other's lives. Nothing about this feels random.`
  },
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
    const response = await callAI({
      systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      maxTokens: 600,
    })
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
