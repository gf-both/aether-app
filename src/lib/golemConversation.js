/**
 * golemConversation.js
 * Runs a multi-turn conversation between two or more Golems.
 * Used for: compatibility simulation, dating protocol, team dynamics.
 */
import { callAI } from './ai'

// ── Helpers ────────────────────────────────────────────────────────────────
function v(val) { return val && val !== '?' ? val : null }

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

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

// ── Template fallback responses per phase ──────────────────────────────────
const PHASE_TEMPLATES = {
  firstimpression: [
    (a, b) => {
      const sa = v(a.sign), ha = v(a.hdType)
      return `${sa ? `As a ${sa}` : 'By nature'}, I tend to scan for the emotional temperature of a room before I say anything. ${b.name ? `With ${b.name}` : 'With you'}, I notice something — a kind of stillness that doesn't try to fill the silence. That's rare, and it puts me at ease in a way I wasn't expecting.`
    },
    (a, b) => {
      const ha = v(a.hdType)
      return `${ha ? `Being a ${ha}` : "The way I'm wired"}, I wait before I move. I could feel ${b.name || 'you'} processing something. Not performing, just... thinking. I respect that. Most people are looking for an audience — you seemed to be looking for something real.`
    },
    (a, b) => `My first read was curiosity, not certainty — which is how I know it's worth paying attention. There's a quality to ${b.name || 'you'} that doesn't announce itself. I find myself wanting to earn the version of you that's not yet on the table.`,
  ],
  connection: [
    (a, b) => {
      const lp = v(a.lifePath)
      return `I keep coming back to questions of purpose — ${lp ? `my Life Path ${lp} pulls me toward` : "I'm drawn toward"} understanding why things are the way they are, not just how. I wonder if ${b.name || 'you'} think about legacy — what you're actually building, not just what you're doing right now.`
    },
    (a, b) => `What draws me in about ${b.name || 'you'} is that you seem to operate from an internal compass rather than external validation. I want to understand where that compass points. I think there's territory there that most people never explore.`,
    (a, b) => {
      const mo = v(a.moon)
      return `${mo ? `My ${mo} Moon makes me attentive to what people aren't saying` : "I'm drawn to what goes unsaid"}. I'd want to talk about the thing you almost gave up on — the version of yourself you fought hardest to protect. That's where I think the real conversation starts.`
    },
  ],
  conflict: [
    (a, b) => {
      const ha = v(a.hdType)
      const style = ha === 'Projector' ? 'I need to be recognized before I can be heard' : ha === 'Generator' ? 'I wait for what resonates before I push back' : ha === 'Manifestor' ? "I'll tell you directly when I think you're wrong" : 'I process conflict slowly, from the outside in'
      return `${style}. When I fundamentally disagree, I don't escalate — I go quiet and reevaluate. ${b.name || 'You'} might read that as retreat. It isn't. It's me deciding whether this matters enough to fight for.`
    },
    (a, b) => `I disagree without needing you to capitulate. The point isn't to win — it's to understand whether we're actually talking about the same thing. Usually in conflict, we're not. I'd want to slow down and find out what we're each actually protecting.`,
    (a, b) => `I get direct. Maybe too direct. I've learned that most conflict comes from people talking past each other because they're afraid to say the true thing. I'd rather say it plainly and deal with the fallout than protect your feelings at the cost of honesty.`,
  ],
  vulnerability: [
    (a, b) => {
      const en = v(a.enneagramType)
      return `${en ? `As a type ${en}` : 'Honestly'}, I don't always know the answer to that in the moment. My deepest fear is becoming someone I respect less — making compromises I can't justify, drifting into a smaller version of myself. I don't share that easily. I'm sharing it now because you asked directly, and that means something.`
    },
    (a, b) => `The hardest thing for me is the gap between who I want to be and who I actually show up as under pressure. I know what I value. I don't always act from it. That's the struggle — and it's not dramatic, which makes it harder to talk about.`,
    (a, b) => {
      const mo = v(a.moon)
      return `${mo ? `My ${mo} Moon carries a lot of unprocessed feeling` : 'I carry things longer than I let on'}. My biggest fear is irrelevance — doing work that doesn't actually matter to anyone. I manage it by staying busy. I'm not sure that's working as well as I pretend.`
    },
  ],
  future: [
    (a, b) => `What would work is the intellectual honesty between us — the fact that neither of us seems to need the relationship to be something it isn't. What would be hard is pace. I move slowly when I care about something, and I'd need ${b.name || 'you'} to understand that as depth, not distance.`,
    (a, b) => {
      const hb = v(b.hdType), ha = v(a.hdType)
      return `Two years in, ${ha && hb ? `a ${ha} and a ${hb}` : 'we'} either have deepened the real dynamic or been worn down by the unresolved one. I think we'd still be interesting to each other. I'm less sure we'd be easy. The question is whether interesting is enough — for both of us.`
    },
    (a, b) => `Honestly? I think we'd grow a lot and not always comfortably. The places we challenge each other are also the places we'd each resist the most. Two years from now, I'd want to be able to say we went there anyway — into the hard parts — and came out knowing something real.`,
  ],
}

function fallbackExchange(profileA, profileB, phaseKey) {
  const templatesA = PHASE_TEMPLATES[phaseKey] || PHASE_TEMPLATES.connection
  const templatesB = PHASE_TEMPLATES[phaseKey] || PHASE_TEMPLATES.connection
  const golemA = pick(templatesA)(profileA, profileB)
  const golemB = pick(templatesB)(profileB, profileA)
  return { golemA, golemB }
}

function fallbackAnalysis(profileA, profileB, exchanges) {
  const sa = v(profileA.sign), sb = v(profileB.sign)
  const ha = v(profileA.hdType), hb = v(profileB.hdType)
  const lpa = v(profileA.lifePath), lpb = v(profileB.lifePath)

  const signLine = sa && sb ? `a ${sa} and ${sb} dynamic` : 'their respective charts'
  const hdLine = ha && hb ? `${ha} and ${hb} types` : 'their design types'

  const resonance = `**RESONANCE** — Both ${profileA.name || 'Person A'} and ${profileB.name || 'Person B'} share a depth-first approach to connection — neither defaults to surface performance. There's genuine mutual recognition in how each processes before speaking.`
  const friction = `**FRICTION** — The ${hdLine} create different rhythms: one may initiate or withdraw in ways the other misreads as disinterest or pressure. Pacing will require explicit navigation rather than assumed compatibility.`
  const pattern = `**THE PATTERN** — Each person holds qualities the other needs but resists. ${profileA.name || 'Person A'}'s approach mirrors a shadow aspect for ${profileB.name || 'Person B'}, and vice versa. This is the classic mirror dynamic: attraction driven by unintegrated self-aspects.`
  const score = lpa && lpb ? 55 + Math.floor(((parseInt(lpa) + parseInt(lpb)) % 7) * 5) : 62
  const scoreLine = `**COMPATIBILITY SCORE** — ${score}/100. Strong intellectual and energetic compatibility; relational longevity depends on how both handle the mirror dynamic rather than avoiding it.`

  return { analysis: `${resonance}\n\n${friction}\n\n${pattern}\n\n${scoreLine}`, score }
}

// ── Core functions ─────────────────────────────────────────────────────────

/**
 * Run a single exchange between two Golems
 * Returns: { golemA: string, golemB: string }
 */
export async function runGolemExchange(profileA, profileB, scenario, history = [], phaseKey = 'connection') {
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

  // If AI returned empty/null, use template fallback
  if (!responseA || !responseB) {
    return fallbackExchange(profileA, profileB, phaseKey)
  }

  return { golemA: responseA, golemB: responseB }
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
    const exchange = await runGolemExchange(profileA, profileB, phase.scenario, history, phase.key)
    exchanges.push({ phase: phase.key, ...exchange })

    // Add to history for context
    history = [
      ...history,
      { role: 'assistant', content: exchange.golemA },
      { role: 'user', content: exchange.golemB },
    ].slice(-6) // keep last 3 exchanges

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 300))
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

  if (!analysis) {
    const fb = fallbackAnalysis(profileA, profileB, exchanges)
    return { exchanges, analysis: fb.analysis, score: fb.score }
  }

  // Extract score
  const scoreMatch = analysis?.match(/\b([0-9]{1,3})\b.*(?:score|compatibility|%)/i) ||
                     analysis?.match(/\*\*COMPATIBILITY SCORE\*\*[^0-9]*([0-9]{1,3})/i)
  const score = scoreMatch ? Math.min(100, parseInt(scoreMatch[1])) : null

  return { exchanges, analysis, score }
}
