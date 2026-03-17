/**
 * golemConversation.js
 * Runs a multi-turn conversation between two or more Golems.
 * Used for: compatibility simulation, dating protocol, team dynamics.
 */
import { callAI } from './ai'

/**
 * Build a Golem system prompt from a profile
 */
export function buildGolemSystemPrompt(profile, role = 'self') {
  const roleDesc = {
    self: `You ARE ${profile.name || 'this person'}. Speak in first person from their values, patterns, and blind spots.`,
    complement: `You are the Complement of ${profile.name || 'this person'} — their energetic opposite who completes what they lack.`,
    antagonist: `You are the Antagonist of ${profile.name || 'this person'} — the force that tests and challenges them.`,
  }

  return `${roleDesc[role] || roleDesc.self}

Your identity:
- Sun: ${profile.sign || '?'}, Moon: ${profile.moon || '?'}, Rising: ${profile.asc || '?'}
- Human Design: ${profile.hdType || '?'} ${profile.hdProfile || ''} | Authority: ${profile.hdAuth || '?'}
- Life Path: ${profile.lifePath || '?'} | Expression: ${profile.expression || '?'}
${profile.enneagramType ? `- Enneagram: Type ${profile.enneagramType}` : ''}
${profile.mbtiType ? `- MBTI: ${profile.mbtiType}` : ''}

Speak authentically as this person. Include their blind spots and shadow patterns. Keep responses 2-4 sentences. Be direct.`
}

/**
 * Run a single exchange between two Golems
 * Returns: { golemA: string, golemB: string }
 */
export async function runGolemExchange(profileA, profileB, scenario, history = []) {
  // Golem A speaks first
  const responseA = await callAI({
    systemPrompt: buildGolemSystemPrompt(profileA),
    messages: [
      ...history,
      { role: 'user', content: scenario }
    ],
    maxTokens: 200,
  })

  // Golem B responds
  const responseB = await callAI({
    systemPrompt: buildGolemSystemPrompt(profileB),
    messages: [
      ...history,
      { role: 'user', content: scenario },
      { role: 'user', content: `${profileA.name || 'Person A'} said: "${responseA}"\n\nRespond as ${profileB.name || 'Person B'}:` }
    ],
    maxTokens: 200,
  })

  return { golemA: responseA || '', golemB: responseB || '' }
}

/**
 * Run a full compatibility simulation (5 phases)
 * Returns structured analysis
 */
export async function runCompatibilitySimulation(profileA, profileB, relType = 'romantic') {
  const phases = [
    { key: 'firstimpression', scenario: `You're meeting ${profileB.name || 'them'} for the first time. How do you show up? What do you notice about them?` },
    { key: 'connection', scenario: `What would you want to talk about with this person? What genuinely interests you about who they are?` },
    { key: 'conflict', scenario: `You strongly disagree with ${profileB.name || 'them'} on something important to you. How do you respond?` },
    { key: 'vulnerability', scenario: `This person asks you about your biggest fear or struggle. How do you respond?` },
    { key: 'future', scenario: `What would a relationship with this person actually look like in 2 years? What would work? What would be hard?` },
  ]

  const exchanges = []
  let history = []

  for (const phase of phases) {
    const exchange = await runGolemExchange(profileA, profileB, phase.scenario, history)
    exchanges.push({ phase: phase.key, ...exchange })

    // Add to history for context
    history = [
      ...history,
      { role: 'assistant', content: exchange.golemA },
      { role: 'user', content: exchange.golemB },
    ].slice(-6) // keep last 3 exchanges

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 500))
  }

  // Analysis agent reads the full exchange
  const analysisPrompt = `You analyzed a compatibility simulation between two people. Here is their exchange:

${exchanges.map(e => `**${e.phase.toUpperCase()}**
${profileA.name}: "${e.golemA}"
${profileB.name}: "${e.golemB}"`).join('\n\n')}

Based on this exchange, provide:
1. **RESONANCE** — What genuinely clicked? (2 sentences)
2. **FRICTION** — Where will they struggle? (2 sentences)
3. **THE PATTERN** — What unconscious dynamic is playing out? (2 sentences)
4. **COMPATIBILITY SCORE** — A number 0-100 with one sentence explanation

Be specific to what you actually observed in the exchange, not generic.`

  const analysis = await callAI({
    systemPrompt: 'You are a relationship dynamics analyst. Read the golem interaction exchange and identify the real patterns.',
    messages: [{ role: 'user', content: analysisPrompt }],
    maxTokens: 400,
  })

  // Extract score
  const scoreMatch = analysis?.match(/\b([0-9]{1,3})\b.*(?:score|compatibility|%)/i) ||
                     analysis?.match(/\*\*COMPATIBILITY SCORE\*\*[^0-9]*([0-9]{1,3})/i)
  const score = scoreMatch ? Math.min(100, parseInt(scoreMatch[1])) : null

  return { exchanges, analysis, score }
}
