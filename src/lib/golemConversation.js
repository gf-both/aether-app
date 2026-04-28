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
 * Build a Golem system prompt from a profile.
 * mode: 'simulation' = analytical/diagnostic (compatibility test)
 *       'dialogue'   = intimate/personal (constellation conversation)
 */
// Mood modifiers — appended to dialogue system prompts
const MOOD_INSTRUCTIONS = {
  relaxed: `Your energy is calm, unhurried, warm. You lean back. You smile before you speak. There's no rush — you have all the time in the world. Gentle observations, soft humor, easy honesty.`,
  sensual: `Your energy is charged, present, body-aware. You notice texture, breath, proximity. Speak from the senses — what you feel, what you notice physically, what draws you closer. Magnetic, not explicit. Tension, not release.`,
  angry: `Your energy is hot, direct, unfiltered. You're done performing. Say what you actually mean — no cushioning, no diplomacy. Let the frustration show. Name the thing that's been eating at you. Short sentences. Sharp edges.`,
  playful: `Your energy is light, curious, mischievous. You tease. You provoke with a grin. Nothing is too serious to play with — but the play reveals real things. Wit over weight. Quick, surprising, alive.`,
  melancholic: `Your energy is heavy, reflective, bittersweet. You sit with what's been lost. Speak from the ache — not to fix it, but to honor it. Slow, careful words. Beauty in the sadness. No forced optimism.`,
  fierce: `Your energy is intense, protective, unwavering. You stand your ground. You speak from the core — not anger exactly, but absolute conviction. Unapologetic. Clear. You will not be moved.`,
  curious: `Your energy is open, probing, genuinely fascinated. You ask questions that surprise people. You follow the thread wherever it goes. No agenda — just a deep need to understand. Each person here is a mystery worth solving.`,
  vulnerable: `Your energy is open, trembling, brave. You let the armor down completely. Speak from the place that scares you. No strategy, no performance — just the raw truth of what you feel. This is the hardest kind of courage.`,
}

export function buildGolemSystemPrompt(profile, role = 'self', mode = 'simulation', mood = null) {
  const name = profile.name || 'this person'
  const roleDesc = {
    self: `You ARE ${name}. Speak in first person from their values, patterns, and blind spots.`,
    complement: `You are the Complement of ${name} — their energetic opposite who completes what they lack.`,
    antagonist: `You are the Antagonist of ${name} — the force that tests and challenges them.`,
  }

  const identity = `Your identity:
- Sun: ${profile.sign || '?'}, Moon: ${profile.moon || '?'}, Rising: ${profile.asc || '?'}
- Human Design: ${profile.hdType || '?'} ${profile.hdProfile || ''} | Authority: ${profile.hdAuth || '?'}
- Life Path: ${profile.lifePath || '?'} | Expression: ${profile.expression || '?'}
${profile.enneagramType ? `- Enneagram: Type ${profile.enneagramType}` : ''}
${profile.mbtiType ? `- MBTI: ${profile.mbtiType}` : ''}`

  const moodLine = mood && MOOD_INSTRUCTIONS[mood] ? `\n\nMOOD: ${MOOD_INSTRUCTIONS[mood]}` : ''

  if (mode === 'dialogue') {
    return `${roleDesc[role] || roleDesc.self}

${identity}

Unguarded conversation. No performance.
Speak as ${name} speaks when the mask drops. Emotional, not analytical.
Reference framework details ONLY when they cut — don't decorate with them.
Respond to what the other person ACTUALLY said. No monologues. No scene-setting.
MAX 2 sentences. Punch, don't describe. Say the real thing.${moodLine}`
  }

  // Default: simulation mode — diagnostic, evaluative, concise
  return `${roleDesc[role] || roleDesc.self}

${identity}

You are in a structured compatibility assessment. A third party is observing.
Speak authentically as this person but with self-awareness — name your patterns, strategies, and defense mechanisms.
Be diagnostic about yourself. Reference your framework data as tools for self-understanding.
Include blind spots and shadow patterns. Keep responses 2-3 sentences. Direct and analytical.`
}

// ── Element/sign traits for dynamic generation ──────────────────────────────
const SIGN_ELEMENT = { Aries:'fire', Taurus:'earth', Gemini:'air', Cancer:'water', Leo:'fire', Virgo:'earth', Libra:'air', Scorpio:'water', Sagittarius:'fire', Capricorn:'earth', Aquarius:'air', Pisces:'water' }
const SIGN_QUALITY = { Aries:'cardinal', Taurus:'fixed', Gemini:'mutable', Cancer:'cardinal', Leo:'fixed', Virgo:'mutable', Libra:'cardinal', Scorpio:'fixed', Sagittarius:'mutable', Capricorn:'cardinal', Aquarius:'fixed', Pisces:'mutable' }
const HD_STRATEGY = { Projector:'wait for invitation', Generator:'respond to what lights you up', 'Manifesting Generator':'respond then inform', Manifestor:'inform then act', Reflector:'wait a lunar cycle' }
const ENN_CORE = { 1:'perfection & integrity', 2:'being needed & loved', 3:'achievement & image', 4:'authenticity & depth', 5:'knowledge & competence', 6:'security & loyalty', 7:'freedom & experience', 8:'control & strength', 9:'peace & harmony' }
const ENN_FEAR = { 1:'being corrupt or wrong', 2:'being unwanted', 3:'being worthless', 4:'having no identity', 5:'being helpless', 6:'being without support', 7:'being trapped in pain', 8:'being controlled', 9:'loss and separation' }
const LP_THEME = { 1:'independence & leadership', 2:'cooperation & sensitivity', 3:'creativity & expression', 4:'structure & discipline', 5:'freedom & change', 6:'responsibility & love', 7:'introspection & truth', 8:'power & abundance', 9:'humanitarianism & wisdom' }

function generateProfileResponse(a, b, phaseKey) {
  const sa = v(a.sign), sb = v(b.sign), ma = v(a.moon), mb = v(b.moon)
  const ha = v(a.hdType), hb = v(b.hdType), ea = v(a.enneagramType), eb = v(b.enneagramType)
  const lpa = v(a.lifePath), mba = v(a.mbtiType), la = v(a.asc)
  const elemA = sa && SIGN_ELEMENT[sa], elemB = sb && SIGN_ELEMENT[sb]
  const stratA = ha && HD_STRATEGY[ha], ennA = ea && ENN_CORE[ea], fearA = ea && ENN_FEAR[ea]
  const lpTheme = lpa && LP_THEME[lpa]
  const nameB = b.name || 'you'
  const seed = ((a.name || '').length + (b.name || '').length + (ea || 0) + (lpa || 0)) % 3

  switch (phaseKey) {
    case 'firstimpression': {
      if (seed === 0) return `${ha ? `As a ${ha}, my strategy is to ${stratA}` : 'I tend to observe before engaging'}. Meeting ${nameB}, ${sb ? `I immediately sense the ${SIGN_ELEMENT[sb]} element energy — ${elemB === 'fire' ? 'intensity and directness' : elemB === 'earth' ? 'a grounded, deliberate presence' : elemB === 'air' ? 'a quick, probing intelligence' : 'an emotional depth beneath the surface'}` : "I'm reading the emotional field"}. ${la ? `My ${la} rising shapes my first impression — it's the mask I wear` : 'My first impression is often different from who I actually am'}.`
      if (seed === 1) return `${sa ? `My ${sa} Sun` : 'I'} ${sa && SIGN_QUALITY[sa] === 'cardinal' ? 'leads with initiative — I scan for who has agency in the room' : sa && SIGN_QUALITY[sa] === 'fixed' ? 'holds steady — I don\'t rush to judgment, I wait for the real person to show' : 'adapts — I mirror the energy I encounter before showing my own'}. ${nameB} ${hb ? `carries a ${hb} energy that ${hb === ha ? 'I recognize instantly — same operating system, different expression' : 'operates on a different frequency than mine — that creates either friction or fascination'}` : 'carries something I can\'t immediately categorize — and that interests me'}.`
      return `${ma ? `My ${ma} Moon processes first encounters emotionally, not intellectually` : 'I feel people before I understand them'}. With ${nameB}, ${mb ? `I sense a ${mb} Moon underneath — ${elemA === (mb && SIGN_ELEMENT[mb]) ? 'we share the same emotional element, which creates instant recognition' : 'our emotional languages are different, which means we\'ll either complement or misread each other'}` : 'there\'s an emotional signature I haven\'t decoded yet'}. I don't trust first impressions. But I pay close attention to them.`
    }
    case 'connection': {
      if (seed === 0) return `${lpTheme ? `My Life Path ${lpa} drives me toward ${lpTheme}` : 'What drives me is the question of meaning'}. I'd want to know what ${nameB} is actually building — not the polished version, the real one. ${ea && eb ? `A type ${ea} talking to a type ${eb} — ${ea === eb ? 'we understand each other\'s core drive immediately, which is both comforting and slightly dangerous' : `I seek ${ennA}, ${nameB} seeks ${ENN_CORE[eb]} — that difference is where the real conversation lives`}` : 'The most interesting conversations happen at the intersection of different drives'}.`
      if (seed === 1) return `${mba ? `As an ${mba}, I process through ${mba[0] === 'I' ? 'internal reflection before external dialogue' : 'thinking out loud and testing ideas in real time'}` : 'I process deeply before speaking'}. What I'd want to explore with ${nameB} is ${ha && hb ? `how a ${ha} and a ${hb} actually make decisions differently — my strategy is ${stratA}, and I'm curious whether ${nameB} operates from response or initiation` : 'the gap between how we each appear and how we actually function'}. That gap is where authenticity lives.`
      return `${ma ? `My ${ma} Moon makes me attentive to what people aren't saying` : "I'm drawn to what goes unsaid"}. ${sb ? `${nameB}'s ${sb} energy suggests ${SIGN_ELEMENT[sb] === 'water' ? 'a depth that most people won\'t wait long enough to reach' : SIGN_ELEMENT[sb] === 'fire' ? 'a directness that I find either refreshing or exhausting — depending on how real it is' : SIGN_ELEMENT[sb] === 'earth' ? 'something built slowly and meant to last' : 'a mind that\'s always three moves ahead'}` : `There's something about ${nameB} that resists easy categorization`}. I'd want to talk about the thing ${nameB} almost gave up on.`
    }
    case 'conflict': {
      const style = ha === 'Projector' ? 'I need to be recognized before I can be heard — unrecognized, I withdraw and resent' : ha === 'Generator' ? 'I respond to conflict physically — my gut says yes or no before my mind catches up' : ha === 'Manifestor' ? "I'll inform you plainly when I think you're wrong — and I won't wait for permission" : ha === 'Manifesting Generator' ? 'I respond fast, sometimes too fast — then I have to circle back to what I actually meant' : ha === 'Reflector' ? 'I take in your anger and reflect it back — which means I need space to separate your feelings from mine' : 'I process conflict internally before responding externally'
      if (seed === 0) return `${style}. ${ea ? `My type ${ea} fear of ${fearA} gets triggered in conflict — that's the real battle, not the surface disagreement` : 'The surface disagreement is rarely the real issue'}. With ${nameB}, ${hb && hb !== ha ? `the ${ha || 'my'}-${hb} dynamic means we'll have different conflict rhythms — one of us processes faster than the other` : 'I\'d need to check whether we\'re even arguing about the same thing'}.`
      if (seed === 1) return `${sa ? `${sa} handles conflict with ${SIGN_ELEMENT[sa] === 'fire' ? 'directness — I say it, deal with it, move on' : SIGN_ELEMENT[sa] === 'earth' ? 'patience — I dig in and don\'t move until I\'ve fully processed' : SIGN_ELEMENT[sa] === 'air' ? 'reason — I detach emotionally and try to find the logical center' : 'emotional awareness — I feel the wound before I address the words'}` : 'I handle conflict carefully'}. ${nameB}, ${eb ? `as a type ${eb} driven by ${ENN_CORE[eb]}, will likely ${Number(eb) === Number(ea) ? 'fight for the same thing I do, which makes our conflicts about method, not values' : 'protect something fundamentally different than what I\'m protecting — understanding that distinction is everything'}` : 'we need to discover what we\'re each actually defending'}.`
      return `I get direct when it matters. ${ma ? `But my ${ma} Moon means I feel the impact of my words more than I show` : 'But I feel the cost of honesty more than I let on'}. With ${nameB}, I'd want to establish early: ${ha ? `my ${ha} strategy means ${stratA} — if ${nameB} pushes past that, I either shut down or escalate, depending on whether I feel respected` : 'the rules of engagement — how we fight determines whether conflict builds or destroys'}.`
    }
    case 'vulnerability': {
      if (seed === 0) return `${ea ? `As a type ${ea}, my deepest fear is ${fearA}` : 'My deepest fear'}. I manage it by ${ea == 1 ? 'controlling everything around me until it meets my standard' : ea == 2 ? 'making myself indispensable so no one can leave' : ea == 3 ? 'achieving so relentlessly that I forget who I am without the results' : ea == 4 ? 'aestheticizing my pain into something meaningful — which sometimes keeps me from actually healing' : ea == 5 ? 'retreating into my mind where I can observe without being depleted' : ea == 6 ? 'scanning for danger until the scanning itself becomes the danger' : ea == 7 ? 'reframing everything as an opportunity — even when grief is the appropriate response' : ea == 8 ? 'armoring up so completely that tenderness feels like weakness' : ea == 9 ? 'merging with others until I lose track of what I actually want' : 'staying busy enough to avoid the question'}. I'm telling ${nameB} this because ${hb ? `I sense a ${hb} can ${hb === 'Projector' ? 'see through performance — and I\'d rather be honest than be seen through' : hb === 'Generator' ? 'hold space without needing to fix — and that\'s what this requires' : 'handle directness'}` : 'something about this dynamic feels safe enough for honesty'}.`
      if (seed === 1) return `${ma ? `My ${ma} Moon carries ${SIGN_ELEMENT[ma] === 'water' ? 'an ocean of feeling I rarely let anyone see the bottom of' : SIGN_ELEMENT[ma] === 'fire' ? 'a rage that I mistake for passion, and a passion I mistake for purpose' : SIGN_ELEMENT[ma] === 'earth' ? 'a heaviness I disguise as reliability' : 'an anxiety I intellectualize into strategy'}` : 'I carry things longer than I let on'}. The hardest part is the gap between who I know I could be and who I actually show up as ${sa ? `when my ${sa} defaults kick in` : 'under pressure'}. I don't share this because it's comfortable — I share it because performing strength is more exhausting than admitting the struggle.`
      return `${lpa ? `Life Path ${lpa} means my core lesson is ${lpTheme}. The shadow of that lesson` : 'The hardest truth'} is that I don't always ${lpa == 1 ? 'know whether I\'m leading or just running from following' : lpa == 7 ? 'trust the answers I find — depth becomes its own prison when you can\'t stop digging' : lpa == 4 ? 'know if I\'m building something real or just building walls' : 'live from what I know to be true'}. I manage it ${mba ? `through my ${mba[0] === 'I' ? 'introversion — I retreat to process, which others read as coldness' : 'extraversion — I externalize to cope, which others read as confidence'}` : 'in ways that look like strength but are really just strategy'}.`
    }
    case 'future': {
      if (seed === 0) return `Two years in, ${ha && hb ? `a ${ha} and a ${hb}` : 'we'} ${ha === hb ? 'understand each other\'s rhythm but risk enabling each other\'s shadow' : 'have found a way to navigate different speeds — or we haven\'t, and that\'s the defining question'}. ${ea && eb ? `Type ${ea} and type ${eb} ${ea === eb ? 'mirror each other perfectly — which means the growth comes from differentiation, not similarity' : `create a ${Math.abs(Number(ea) - Number(eb)) <= 2 ? 'complementary' : 'challenging'} dynamic — ${ENN_CORE[ea]} meeting ${ENN_CORE[eb]} either fills the gap or exposes it`}` : 'The real question is whether we grow toward each other or in parallel'}.`
      if (seed === 1) return `${sa && sb ? `A ${sa} and ${sb} — ${SIGN_ELEMENT[sa] === SIGN_ELEMENT[sb] ? 'same element means we speak the same language, but we might lack the friction needed for growth' : `${SIGN_ELEMENT[sa]} and ${SIGN_ELEMENT[sb]} either forge something lasting or consume each other — there\'s no lukewarm version of this dynamic`}` : 'What I think would happen'}. The work is ${ea ? `me confronting my fear of ${fearA} within the relationship, not despite it` : 'facing what the relationship surfaces about myself'}. I'd hope ${nameB} does the same. Growth without accountability is just change.`
      return `Honestly? ${lpa ? `My Life Path ${lpa} says I'm here for ${lpTheme}` : 'I know what I\'m building toward'}. The question is whether this relationship serves that or distracts from it — and whether that's even a fair question to ask. ${nameB}, ${eb ? `your drive for ${ENN_CORE[eb]}` : 'what you need'} and ${ea ? `my drive for ${ennA}` : 'what I need'} — ${ea && eb && ea === eb ? 'are identical, which means we\'d either amplify each other or compete' : 'will either create a productive tension or an unresolvable one'}. I'd want to find out.`
    }
    default: return `I'm still processing what ${nameB} means to me. ${ha ? `As a ${ha}, I don't rush to conclusions` : 'I take my time'}. ${sa ? `My ${sa} nature` : 'Something in me'} says there's more here than the surface conversation.`
  }
}

// ── Template fallback responses per phase ──────────────────────────────────
// NOW FULLY DYNAMIC — generated from actual profile data, never generic

function fallbackExchange(profileA, profileB, phaseKey) {
  const golemA = generateProfileResponse(profileA, profileB, phaseKey)
  const golemB = generateProfileResponse(profileB, profileA, phaseKey)
  return { golemA, golemB }
}

/**
 * Compute a REAL compatibility score from profile data.
 * Uses element compatibility, HD strategy alignment, enneagram growth lines,
 * numerology harmonics, and MBTI function stacks.
 */
function computeRealScore(a, b) {
  let score = 50 // baseline
  let factors = 0
  const sa = v(a.sign), sb = v(b.sign), ha = v(a.hdType), hb = v(b.hdType)
  const ea = v(a.enneagramType), eb = v(b.enneagramType)
  const lpa = v(a.lifePath), lpb = v(b.lifePath)
  const ma = v(a.moon), mb = v(b.moon), mba = v(a.mbtiType), mbb = v(b.mbtiType)

  // Element compatibility (fire+air, earth+water = compatible)
  if (sa && sb) {
    const elA = SIGN_ELEMENT[sa], elB = SIGN_ELEMENT[sb]
    if (elA === elB) score += 8 // same element
    else if ((elA === 'fire' && elB === 'air') || (elA === 'air' && elB === 'fire')) score += 10
    else if ((elA === 'earth' && elB === 'water') || (elA === 'water' && elB === 'earth')) score += 10
    else if ((elA === 'fire' && elB === 'water') || (elA === 'water' && elB === 'fire')) score -= 4
    else if ((elA === 'earth' && elB === 'air') || (elA === 'air' && elB === 'earth')) score -= 2
    factors++
  }

  // Moon compatibility (emotional)
  if (ma && mb) {
    const melA = SIGN_ELEMENT[ma], melB = SIGN_ELEMENT[mb]
    if (melA === melB) score += 7
    else if ((melA === 'water' && melB === 'earth') || (melA === 'earth' && melB === 'water')) score += 8
    else if ((melA === 'fire' && melB === 'air') || (melA === 'air' && melB === 'fire')) score += 5
    factors++
  }

  // HD type compatibility
  if (ha && hb) {
    const hdCompat = {
      'Generator+Projector': 12, 'Projector+Generator': 12,
      'Generator+Manifesting Generator': 8, 'Manifesting Generator+Generator': 8,
      'Manifestor+Projector': 6, 'Projector+Manifestor': 6,
      'Manifestor+Generator': 4, 'Generator+Manifestor': 4,
      'Reflector+Projector': 10, 'Projector+Reflector': 10,
    }
    score += hdCompat[`${ha}+${hb}`] || (ha === hb ? 3 : 0)
    factors++
  }

  // Enneagram: growth/stress lines (1-7, 2-4, 3-6, 4-2, 5-8, 6-9, 7-1, 8-5, 9-3)
  if (ea && eb) {
    const growthPairs = [[1,7],[2,4],[3,6],[4,2],[5,8],[6,9],[7,1],[8,5],[9,3]]
    const isGrowth = growthPairs.some(([x,y]) => (Number(ea)===x && Number(eb)===y) || (Number(ea)===y && Number(eb)===x))
    if (Number(ea) === Number(eb)) score += 4 // same type
    else if (isGrowth) score += 10 // growth/integration line
    else if (Math.abs(Number(ea) - Number(eb)) === 1) score += 6 // adjacent
    factors++
  }

  // Numerology: Life Path harmony
  if (lpa && lpb) {
    const lpA = parseInt(lpa), lpB = parseInt(lpb)
    if (lpA === lpB) score += 5
    else if ((lpA + lpB) === 9 || (lpA + lpB) === 10) score += 8 // complementary
    else if ([1,5,7].includes(lpA) && [1,5,7].includes(lpB)) score += 6 // independent triad
    else if ([2,4,8].includes(lpA) && [2,4,8].includes(lpB)) score += 6 // material triad
    else if ([3,6,9].includes(lpA) && [3,6,9].includes(lpB)) score += 7 // creative triad
    factors++
  }

  // MBTI: complementary functions (NT+NF, ST+SF, introvert+extravert bonus)
  if (mba && mbb && mba.length === 4 && mbb.length === 4) {
    if (mba[0] !== mbb[0]) score += 3 // I/E complement
    if (mba[1] === mbb[1]) score += 4 // same perceiving
    if (mba[2] === mbb[2]) score += 3 // same judging
    if (mba[3] !== mbb[3]) score += 2 // J/P complement
    factors++
  }

  // Normalize: if we had many data points, scale range wider; if few, tighter
  if (factors === 0) return 50 + Math.floor(((a.name || '').length * 7 + (b.name || '').length * 13) % 30) - 15
  return Math.max(15, Math.min(95, score))
}

function fallbackAnalysis(profileA, profileB, exchanges) {
  const sa = v(profileA.sign), sb = v(profileB.sign)
  const ha = v(profileA.hdType), hb = v(profileB.hdType)
  const ea = v(profileA.enneagramType), eb = v(profileB.enneagramType)
  const ma = v(profileA.moon), mb = v(profileB.moon)

  const nameA = profileA.name || 'Person A', nameB = profileB.name || 'Person B'
  const elemA = sa && SIGN_ELEMENT[sa], elemB = sb && SIGN_ELEMENT[sb]
  const score = computeRealScore(profileA, profileB)

  // Generate specific resonance
  const resParts = []
  if (sa && sb && elemA === elemB) resParts.push(`Both ${sa} and ${sb} share ${elemA} energy — they speak the same elemental language, which creates instant recognition`)
  else if (sa && sb) resParts.push(`${nameA}'s ${sa} (${elemA}) and ${nameB}'s ${sb} (${elemB}) create a ${elemA === 'fire' && elemB === 'water' || elemA === 'water' && elemB === 'fire' ? 'steam dynamic — intense transformation when these elements meet' : 'productive tension that prevents complacency'}`)
  if (ha && hb) resParts.push(`${ha} and ${hb} ${ha === hb ? `share the same operating system — they understand each other's strategy (${HD_STRATEGY[ha]}) intuitively` : `operate differently: ${nameA} needs to ${HD_STRATEGY[ha]}, while ${nameB} needs to ${HD_STRATEGY[hb]} — navigating this difference is the relationship's central work`}`)

  const resonance = `**RESONANCE** — ${resParts.length > 0 ? resParts.join('. ') : `${nameA} and ${nameB} share an unspoken recognition — their frameworks suggest parallel processing styles that create natural rapport`}.`

  // Generate specific friction
  const fricParts = []
  if (ea && eb && ea !== eb) fricParts.push(`Type ${ea} (driven by ${ENN_CORE[ea]}) and Type ${eb} (driven by ${ENN_CORE[eb]}) will clash when ${nameA}'s fear of ${ENN_FEAR[ea]} triggers ${nameB}'s fear of ${ENN_FEAR[eb]}`)
  if (ma && mb && SIGN_ELEMENT[ma] !== SIGN_ELEMENT[mb]) fricParts.push(`Their emotional languages differ — ${nameA}'s ${ma} Moon (${SIGN_ELEMENT[ma]}) and ${nameB}'s ${mb} Moon (${SIGN_ELEMENT[mb]}) process feelings in fundamentally different ways`)

  const friction = `**FRICTION** — ${fricParts.length > 0 ? fricParts.join('. ') : `The ${ha && hb ? ha + '/' + hb : 'energetic'} dynamic creates different rhythms — one processes faster than the other, and misreading speed as disinterest is the primary risk`}.`

  const pattern = `**THE PATTERN** — ${ea && eb ? `${nameA}'s ${ea}-drive for ${ENN_CORE[ea]} and ${nameB}'s ${eb}-drive for ${ENN_CORE[eb]} ${Math.abs(Number(ea)-Number(eb)) <= 2 ? 'create a growth-oriented mirror — each person reflects what the other needs to integrate' : 'create complementary blindspots — what one over-values, the other under-values, making this a catalyst relationship'}` : `${nameA} and ${nameB} hold complementary shadow material — the qualities each finds challenging in the other are the qualities they haven't yet integrated in themselves`}.`

  const level = score >= 80 ? 'Exceptional resonance across multiple frameworks' : score >= 65 ? 'Strong foundational compatibility with productive growth edges' : score >= 50 ? 'Moderate alignment — success depends on conscious navigation of differences' : 'Challenging dynamic that requires significant intentional work'
  const scoreLine = `**COMPATIBILITY SCORE** — ${score}/100. ${level}.`

  return { analysis: `${resonance}\n\n${friction}\n\n${pattern}\n\n${scoreLine}`, score }
}

// Export for use in synastry
export { computeRealScore }

// ── Core functions ─────────────────────────────────────────────────────────

/**
 * Run a single exchange between two Golems
 * Returns: { golemA: string, golemB: string }
 */
export async function runGolemExchange(profileA, profileB, scenario, history = [], phaseKey = 'connection', mode = 'simulation') {
  // Golem A speaks first
  const responseA = await callAI({
    systemPrompt: buildGolemSystemPrompt(profileA, 'self', mode),
    messages: [
      ...history,
      { role: 'user', content: scenario }
    ],
    maxTokens: mode === 'dialogue' ? 150 : 200,
  })

  // Golem B responds
  const responseB = await callAI({
    systemPrompt: buildGolemSystemPrompt(profileB, 'self', mode),
    messages: [
      ...history,
      { role: 'user', content: scenario },
      { role: 'user', content: `${profileA.name || 'Person A'} said: "${responseA}"\n\nRespond as ${profileB.name || 'Person B'}:` }
    ],
    maxTokens: mode === 'dialogue' ? 150 : 200,
  })

  // If AI returned empty/null, use template fallback
  if (!responseA || !responseB) {
    return fallbackExchange(profileA, profileB, phaseKey)
  }

  return { golemA: responseA, golemB: responseB }
}

/**
 * Run a single round of multi-golem dialogue.
 * Each participant speaks once, responding to the conversation so far.
 * @param {Array} participants - array of profile objects (2+)
 * @param {string} scenario - the prompt / topic for this round
 * @param {Array} history - prior messages [{name, text}]
 * @param {string} mode - 'dialogue' or 'simulation'
 * @returns {Array} [{name, text, color}] one entry per participant
 */
export async function runMultiGolemRound(participants, scenario, history = [], mode = 'dialogue', mood = null) {
  const responses = []
  const conversationSoFar = history.map(h => `${h.name}: "${h.text}"`).join('\n\n')

  for (let i = 0; i < participants.length; i++) {
    const p = participants[i]
    const priorInRound = responses.map(r => `${r.name}: "${r.text}"`).join('\n\n')

    const contextParts = []
    if (conversationSoFar) contextParts.push(`Previous conversation:\n${conversationSoFar}`)
    if (priorInRound) contextParts.push(`This round so far:\n${priorInRound}`)
    contextParts.push(`Topic: ${scenario}`)
    if (i > 0) contextParts.push(`Respond to what was just said. Be specific — reference their words, not just the topic.`)

    const otherNames = participants.filter((_, j) => j !== i).map(x => x.name || 'someone').join(', ')
    const groupContext = `You are in a group conversation with ${otherNames}. Address the group naturally — you can speak to one person specifically or to everyone.`

    const response = await callAI({
      systemPrompt: buildGolemSystemPrompt(p, 'self', mode, mood) + '\n\n' + groupContext,
      messages: [{ role: 'user', content: contextParts.join('\n\n') }],
      maxTokens: mode === 'dialogue' ? 120 : 180,
    })

    responses.push({
      name: p.name || `Person ${i + 1}`,
      text: response || `*${p.name || 'They'} remain${p.name ? 's' : ''} silent, processing what was said.*`,
      profileId: p.id || i,
    })

    // Small delay between participants
    if (i < participants.length - 1) await new Promise(r => setTimeout(r, 200))
  }

  return responses
}

/**
 * Run a full compatibility simulation (5 phases)
 * Returns structured analysis
 */
export async function runCompatibilitySimulation(profileA, profileB, relType = 'romantic') {
  // Determine the actual relationship type from profile data if available
  const actualRel = profileB.rel || relType
  const isFamily = ['father','mother','sibling','child','grandparent'].includes(actualRel)
  const isEx = ['ex-spouse','ex-partner','ex-friend','ex-business-partner'].includes(actualRel)
  const isRomantic = ['partner','spouse'].includes(actualRel) || relType === 'romantic'
  const isBusiness = ['business-partner','colleague','mentor'].includes(actualRel) || relType === 'cofounder' || relType === 'team'
  const isFriend = ['friend','close-friend'].includes(actualRel) || relType === 'friendship'
  const nameB = profileB.name || 'them'
  const relLabel = actualRel === 'father' ? 'your father' : actualRel === 'mother' ? 'your mother' : actualRel === 'sibling' ? 'your sibling' : actualRel === 'child' ? 'your child' : actualRel === 'ex-spouse' ? 'your ex-spouse' : actualRel === 'ex-partner' ? 'your ex-partner' : actualRel === 'mentor' ? 'your mentor' : actualRel === 'colleague' ? 'your colleague' : actualRel === 'business-partner' ? 'your business partner' : nameB

  const phases = isFamily ? [
    { key: 'firstimpression', scenario: `Think about your earliest memory of ${relLabel} (${nameB}). What was the emotional tone? What pattern was already present?` },
    { key: 'connection', scenario: `What did ${nameB} teach you — intentionally or not? What values did they transmit? What did you inherit that you didn't choose?` },
    { key: 'conflict', scenario: `What is the core wound between you and ${nameB}? The thing that was never fully said or resolved? How does it show up in your body?` },
    { key: 'vulnerability', scenario: `If you could say the one thing to ${nameB} that you've never said — with zero consequences — what would it be?` },
    { key: 'future', scenario: `What would healing actually look like between you and ${nameB}? Not forgiveness as performance, but genuine integration. What would have to change?` },
  ] : isEx ? [
    { key: 'firstimpression', scenario: `What first drew you to ${nameB}? What did they represent that you didn't have? Be honest about the projection.` },
    { key: 'connection', scenario: `What was the deepest moment between you and ${nameB}? The moment when the real people showed up, not the versions you performed for each other.` },
    { key: 'conflict', scenario: `What broke it? Not the surface reason — the structural one. The pattern that was always going to surface eventually.` },
    { key: 'vulnerability', scenario: `What did ${nameB} see in you that no one else has seen? And what did you learn about yourself from the ending?` },
    { key: 'future', scenario: `What do you carry from ${nameB} into every relationship after? The gift of the wound. What did this teach you that you couldn't have learned any other way?` },
  ] : isBusiness ? [
    { key: 'firstimpression', scenario: `You're meeting ${nameB} as a potential ${relType === 'cofounder' ? 'co-founder' : 'professional collaborator'}. What do you assess first? What signals matter?` },
    { key: 'connection', scenario: `What would you build with ${nameB}? Where do your capabilities complement? What's the combined superpower?` },
    { key: 'conflict', scenario: `You fundamentally disagree with ${nameB} on strategy. Your approach is different. How do you navigate this?` },
    { key: 'vulnerability', scenario: `What's your biggest professional fear? How do you handle failure? What does ${nameB} need to know about how you operate under pressure?` },
    { key: 'future', scenario: `Two years into working together — what does success look like? What's the most likely failure mode? What would you build?` },
  ] : isFriend ? [
    { key: 'firstimpression', scenario: `What drew you to ${nameB} as a friend? Not attraction — recognition. What did you see in them that you value?` },
    { key: 'connection', scenario: `What do you talk about with ${nameB} that you don't talk about with anyone else? What makes this friendship distinct?` },
    { key: 'conflict', scenario: `${nameB} does something that genuinely bothers you. Not a deal-breaker, but it reveals a difference. How do you handle it?` },
    { key: 'vulnerability', scenario: `What do you need from ${nameB} that you'd never ask for directly? What does friendship mean to you at your core?` },
    { key: 'future', scenario: `What does this friendship look like in 5 years? Does it deepen or drift? What would you need from each other to keep it real?` },
  ] : [
    { key: 'firstimpression', scenario: `You're meeting ${nameB} for the first time. How do you show up? What do you notice about them?` },
    { key: 'connection', scenario: `What would you want to talk about with ${nameB}? What genuinely interests you about who they are?` },
    { key: 'conflict', scenario: `You strongly disagree with ${nameB} on something important to you. How do you respond?` },
    { key: 'vulnerability', scenario: `${nameB} asks you about your biggest fear or struggle. How do you respond?` },
    { key: 'future', scenario: `What would a relationship with ${nameB} actually look like in 2 years? What would work? What would be hard?` },
  ]

  const exchanges = []
  let history = []

  for (const phase of phases) {
    const exchange = await runGolemExchange(profileA, profileB, phase.scenario, history, phase.key, 'simulation')
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

  // Compute the real data-driven score first
  const dataScore = computeRealScore(profileA, profileB)

  // Analysis agent reads the full exchange
  const relContext = isFamily ? `a family relationship (${actualRel})` : isEx ? `a past relationship (${actualRel})` : isBusiness ? `a professional relationship (${actualRel || relType})` : isFriend ? `a friendship` : `a romantic connection`
  const analysisPrompt = `You analyzed a ${relContext} simulation between two people. Here is their exchange:

${exchanges.map(e => `**${e.phase.toUpperCase()}**
${profileA.name}: "${e.golemA}"
${profileB.name}: "${e.golemB}"`).join('\n\n')}

The framework-based compatibility score (computed from their astrological, Human Design, numerological, and personality data) is ${dataScore}/100. Your analysis should be consistent with this baseline — the conversation reveals HOW this score manifests, not a different score.

Based on this exchange, provide:
1. **RESONANCE** — What genuinely clicked? (2 sentences)
2. **FRICTION** — Where will they struggle? (2 sentences)
3. **THE PATTERN** — What unconscious dynamic is playing out? (2 sentences)
4. **COMPATIBILITY SCORE** — ${dataScore}/100. One sentence explaining how the exchange confirmed or nuanced this score.

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

  // Always use the data-driven score for consistency with synastry
  return { exchanges, analysis, score: dataScore }
}
