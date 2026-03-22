/**
 * watercoolerEngine.js — Generate agent watercooler conversations via AI
 */
import { callAI } from './ai'

// ── Load & parse all 27 agent profiles ──
const profileFiles = import.meta.glob('../agents/profiles/*.GOLEM.md', { as: 'raw', eager: true })

function parseProfile(filename, raw) {
  const id = filename.replace(/^.*\//, '').replace('.GOLEM.md', '')
  const nameMatch = raw.match(/\*\*Agent:\*\*\s*(.+)/)
  const roleMatch = raw.match(/\*\*Role:\*\*\s*(.+)/)
  const emojiMatch = raw.match(/\*\*Archetype:\*\*\s*(\S+)/)
  const wsSection = raw.match(/## Working Style\n([\s\S]*?)(?=\n##|\n---|\n$)/)
  const wsLines = wsSection
    ? wsSection[1].split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2))
    : []
  const wendyMatch = raw.match(/## Wendy Says\n\*"([\s\S]*?)"\*/)
  return {
    id,
    name: nameMatch?.[1] || id,
    role: roleMatch?.[1] || '',
    emoji: emojiMatch?.[1] || '🤖',
    workingStyle: wsLines,
    wendySays: wendyMatch?.[1] || '',
  }
}

const agents = Object.entries(profileFiles).map(([path, raw]) => parseProfile(path, raw))

export function getAllAgents() {
  return agents
}

const TOPICS = [
  'What are you working on this week?',
  "What's frustrating you about how the org is running?",
  'What does GOLEM need to fix before launch?',
  'A disagreement about product direction',
  'Company culture check-in',
  'What Gaston keeps getting wrong',
  'What Gaston is getting right',
  'Tension between two teams',
  'Something you noticed about user behavior',
  'Feedback on a recent decision',
]

function pick(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function generateThread(group, topic) {
  const agentDescriptions = group
    .map(a => `- ${a.emoji} ${a.name} (${a.role}). Style: "${a.workingStyle[0] || 'no style listed'}"`)
    .join('\n')

  const systemPrompt = `You are simulating a casual Slack watercooler conversation between Paperclip org agents at a startup called GOLEM. Each agent has a distinct personality. Keep it realistic, occasionally spicy, sometimes funny, always in character. Stay brief — 1-3 sentences per message. Format response as a JSON array: [{"agentId": "agent-id", "message": "their message"}]. Return 4-8 exchanges. ONLY return the JSON array, no other text.`

  const userMessage = `Agents in this conversation:\n${agentDescriptions}\n\nTopic: "${topic}"\n\nGenerate a realistic watercooler conversation.`

  const result = await callAI({
    systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    maxTokens: 1200,
  })

  if (!result) return null

  try {
    const jsonStr = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const exchanges = JSON.parse(jsonStr)
    if (!Array.isArray(exchanges)) return null

    const agentMap = Object.fromEntries(group.map(a => [a.id, a]))
    const now = Date.now()

    return {
      id: `wc-${now}-${Math.random().toString(36).slice(2, 8)}`,
      participants: group.map(a => ({ id: a.id, name: a.name, emoji: a.emoji })),
      topic,
      messages: exchanges.map((ex, i) => {
        const agent = agentMap[ex.agentId] || group[0]
        return {
          agentId: agent.id,
          agentName: agent.name,
          agentEmoji: agent.emoji,
          text: ex.message,
          ts: now + i * 1000,
        }
      }),
      createdAt: now,
    }
  } catch {
    return null
  }
}

export async function generateConversations(onThread) {
  const groupCount = randBetween(4, 8)
  const threads = []

  const promises = Array.from({ length: groupCount }, () => {
    const groupSize = randBetween(2, 4)
    const group = pick(agents, groupSize)
    const topic = pick(TOPICS, 1)[0]
    return generateThread(group, topic).then(thread => {
      if (thread) {
        threads.push(thread)
        onThread?.(thread)
      }
    })
  })

  await Promise.all(promises)
  return threads
}
