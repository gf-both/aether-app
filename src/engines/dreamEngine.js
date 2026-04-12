// ─── Dream Engine: Jungian Symbol Library + Pattern Analysis ──────────────────

export const DREAM_SYMBOLS = {
  water: {
    label: 'Water', emoji: '🌊', color: '#4a90d9',
    archetype: 'The Unconscious',
    meaning: 'The depths of the psyche. Still water signals emotional peace or hidden depths; turbulent water reflects inner conflict or transformation brewing beneath awareness.',
    shadow: 'Drowning, flood — overwhelm from repressed emotion or the collective unconscious breaking through.',
    integration: 'Dive deeper. What feelings have been submerged?',
    keywords: ['water', 'ocean', 'sea', 'river', 'lake', 'rain', 'flood', 'drowning', 'swim', 'wave', 'tide', 'stream', 'pool', 'drown'],
  },
  fire: {
    label: 'Fire', emoji: '🔥', color: '#e05a2b',
    archetype: 'Transformation',
    meaning: 'Passion, purification, and radical change. Fire destroys the old to make room for rebirth. It often signals creative energy, libido, or anger seeking honest expression.',
    shadow: 'Uncontrolled fire — rage, burnout, or the destruction of something precious through carelessness.',
    integration: 'What needs to burn away? What is the fire preparing ground for?',
    keywords: ['fire', 'flame', 'burn', 'burning', 'smoke', 'ash', 'blaze', 'heat', 'inferno', 'torch'],
  },
  house: {
    label: 'House / Building', emoji: '🏛', color: '#c9a84c',
    archetype: 'The Self',
    meaning: 'The dream house is the psyche itself. Each room represents a different aspect of the self — basement is the shadow, attic is higher consciousness, unexplored rooms are disowned potentials.',
    shadow: 'A crumbling, locked, or threatening house — neglected aspects of self or a core identity crisis.',
    integration: 'What room were you in? What does that part of you need attention?',
    keywords: ['house', 'home', 'building', 'room', 'door', 'window', 'basement', 'attic', 'corridor', 'hallway', 'staircase', 'roof', 'wall', 'floor', 'ceiling'],
  },
  flying: {
    label: 'Flying', emoji: '🕊', color: '#88aaff',
    archetype: 'Liberation / Transcendence',
    meaning: 'Freedom from limitation, spiritual aspiration, and the ability to rise above earthly concerns. Often appears during breakthroughs or when you are claiming authority over your own life.',
    shadow: 'Fear of heights, crashing — fear of success, exposure, or the responsibility that comes with full expression.',
    integration: 'Where in life are you ready to stop crawling? What would it feel like to fully rise?',
    keywords: ['fly', 'flying', 'flight', 'soar', 'float', 'hover', 'wings', 'levitate', 'air', 'sky', 'cloud', 'above'],
  },
  falling: {
    label: 'Falling', emoji: '⬇', color: '#9966cc',
    archetype: 'Loss of Control',
    meaning: 'Anxiety about losing control, status, or support. The descent can also be initiatory — the fall into the underworld that precedes deep transformation. The hero always descends before they return.',
    shadow: 'Paralysis, free-fall into void — total collapse of the structures you depend on.',
    integration: 'What are you holding onto too tightly? What would it mean to surrender and trust the fall?',
    keywords: ['fall', 'falling', 'drop', 'plunge', 'descend', 'slip', 'tumble', 'crash', 'collapse'],
  },
  chase: {
    label: 'Being Chased', emoji: '👁', color: '#cc4455',
    archetype: 'The Shadow',
    meaning: 'Something you are avoiding — an emotion, a truth, an aspect of yourself — is demanding acknowledgment. The pursuer is often the most important character: it is a part of you seeking integration.',
    shadow: 'Never confronting what chases you leads to the energy going underground, surfacing as anxiety, compulsion, or projection.',
    integration: 'Stop running. Turn around. What is chasing you, and what does it need from you?',
    keywords: ['chase', 'chased', 'chasing', 'run', 'running', 'escape', 'flee', 'fleeing', 'pursue', 'hunt', 'catch', 'caught'],
  },
  death: {
    label: 'Death', emoji: '☽', color: '#7a6090',
    archetype: 'Ending / Rebirth',
    meaning: 'Rarely literal — dreaming of death signals the end of an identity, relationship, belief, or phase of life. It is the psyche processing profound change. Death in dreams is a form of metamorphosis.',
    shadow: 'Resistance to necessary endings; clinging to what has already passed its natural life.',
    integration: 'What identity or chapter is ending? Can you grieve it consciously so new life can begin?',
    keywords: ['death', 'dead', 'die', 'dying', 'grave', 'funeral', 'corpse', 'ghost', 'spirit', 'coffin', 'cemetery', 'skull', 'bones', 'kill', 'killed'],
  },
  teeth: {
    label: 'Teeth', emoji: '⬡', color: '#80b8c8',
    archetype: 'Power / Expression',
    meaning: 'Teeth represent power, speech, and personal effectiveness. Losing teeth points to anxiety about self-expression, attractiveness, or the fear of being unable to assert yourself in the world.',
    shadow: 'Crumbling teeth — feeling powerless to speak your truth or make your mark.',
    integration: 'Where are you silencing yourself? What needs to be said or asserted?',
    keywords: ['teeth', 'tooth', 'bite', 'jaw', 'mouth', 'dental', 'smile', 'lose teeth', 'falling out'],
  },
  snake: {
    label: 'Snake', emoji: '🐍', color: '#44aa66',
    archetype: 'Kundalini / Wisdom / Danger',
    meaning: 'The snake is among the most archetypal of symbols — healing (caduceus), wisdom (Eden), sexual energy (kundalini), and shadow threat. Context is everything: a coiling snake may be rising energy or lurking danger.',
    shadow: 'Venomous, attacking snake — a repressed drive or deception seeking to poison your clarity.',
    integration: 'Is the snake rising or striking? What primal energy or dangerous truth is awakening?',
    keywords: ['snake', 'serpent', 'viper', 'cobra', 'python', 'reptile', 'slither', 'coil', 'venom', 'hiss'],
  },
  forest: {
    label: 'Forest / Nature', emoji: '🌲', color: '#5a9e6f',
    archetype: 'The Wild Unconscious',
    meaning: 'The forest is the unknown, the untamed psyche, the uncharted terrain of instinct and primordial knowing. Entering the dark forest is the archetypal beginning of every initiation.',
    shadow: 'Being lost in the forest — overwhelming complexity, loss of bearings in life, or being consumed by the unconscious.',
    integration: 'What wild or untamed part of yourself are you entering? What do you fear finding in the dark?',
    keywords: ['forest', 'woods', 'tree', 'trees', 'jungle', 'nature', 'wilderness', 'leaves', 'branches', 'bark', 'path', 'trail'],
  },
  light: {
    label: 'Light / Sun', emoji: '☀', color: '#f0c040',
    archetype: 'Consciousness / The Self',
    meaning: 'Illumination, consciousness, divine presence. A burst of light in a dream often signals a breakthrough in understanding or the approach of the transcendent Self. Associated with clarity, revelation, and solar energy.',
    shadow: 'Blinding or overwhelming light — exposure, spiritual inflation, or the ego overwhelmed by forces larger than itself.',
    integration: 'What is being illuminated? What truth is asking to be seen clearly?',
    keywords: ['light', 'sun', 'glow', 'shine', 'bright', 'radiant', 'beam', 'ray', 'golden', 'brilliant', 'luminous', 'dawn', 'sunrise'],
  },
  darkness: {
    label: 'Darkness / Shadow', emoji: '🌑', color: '#4a3570',
    archetype: 'The Shadow',
    meaning: 'The unlit parts of the self — disowned, repressed, or unacknowledged aspects of the psyche. Darkness in dreams is rarely sinister; it is an invitation to look at what has been hiding from the light of consciousness.',
    shadow: 'Total, suffocating darkness — profound disconnection from self, or a fear so deep it has never been faced.',
    integration: 'What are you refusing to see in yourself? What hides in your darkness that actually has gifts?',
    keywords: ['dark', 'darkness', 'shadow', 'night', 'black', 'void', 'abyss', 'dim', 'blind', 'invisible'],
  },
  child: {
    label: 'Child / Baby', emoji: '✦', color: '#f09090',
    archetype: 'The Divine Child / Inner Child',
    meaning: 'The divine child archetype — new beginnings, pure potential, innocence, vulnerability. May represent a new project, relationship, or aspect of self newly emerging into awareness.',
    shadow: 'An abandoned, hurt, or threatened child — a wounded aspect of the self that has been neglected since childhood.',
    integration: 'What new thing is being born in you? What younger part of you needs care and witnessing?',
    keywords: ['child', 'baby', 'infant', 'kid', 'children', 'young', 'small', 'little', 'born', 'birth', 'newborn'],
  },
  mountain: {
    label: 'Mountain / Ascent', emoji: '⛰', color: '#8899aa',
    archetype: 'The Journey / Aspiration',
    meaning: 'The mountain is the axis mundi, the path between earth and heaven. Climbing represents aspiration, spiritual effort, and the challenge of ego transcendence. The view from the summit is enlightenment.',
    shadow: 'An insurmountable mountain — the ego confronting a challenge that demands it grow beyond its current capacity.',
    integration: 'What summit are you approaching? What are you willing to leave behind to reach it?',
    keywords: ['mountain', 'hill', 'climb', 'peak', 'summit', 'ascend', 'altitude', 'steep', 'rock', 'cliff'],
  },
  door: {
    label: 'Door / Threshold', emoji: '⬡', color: '#c9a84c',
    archetype: 'Transition / Threshold',
    meaning: 'A door or threshold is a boundary between two states of being. Crossing a threshold in dreams often signals a readiness for change, a decision point, or the crossing from one phase of life to another.',
    shadow: 'A locked door, or terror at crossing — fear of change, of what lies beyond the known self.',
    integration: 'What threshold are you standing at? What would change if you walked through?',
    keywords: ['door', 'gate', 'entrance', 'threshold', 'portal', 'arch', 'opening', 'cross', 'enter', 'exit', 'key', 'lock'],
  },
  mirror: {
    label: 'Mirror', emoji: '◎', color: '#aaccee',
    archetype: 'Self-Reflection',
    meaning: 'The mirror demands self-confrontation. Who or what do you see? A distorted reflection suggests a false self-image; seeing a stranger suggests an unrecognized aspect of the self about to emerge.',
    shadow: 'No reflection, broken mirror — identity fragmentation, or a deep refusal to truly see oneself.',
    integration: 'What truth about yourself are you being asked to see? Can you meet your own gaze with compassion?',
    keywords: ['mirror', 'reflection', 'reflect', 'glass', 'see yourself', 'face', 'image'],
  },
  animal: {
    label: 'Animal / Creature', emoji: '🐾', color: '#c88040',
    archetype: 'The Instinctual Self',
    meaning: 'Animals in dreams represent instinct, the body, or specific qualities. The animal encountered carries the energy of that animal — a wolf: social power and intuition; a bird: freedom and perspective; a horse: vital energy and drive.',
    shadow: 'Attacking, threatening, or caged animals — instincts that have been repressed or fears from the body demanding attention.',
    integration: 'What quality does this animal embody? How can you integrate that quality more fully?',
    keywords: ['animal', 'creature', 'beast', 'wolf', 'bear', 'lion', 'tiger', 'eagle', 'bird', 'horse', 'dog', 'cat', 'deer', 'fox', 'crow', 'owl', 'butterfly', 'fish', 'whale', 'dolphin'],
  },
  city: {
    label: 'City / Crowd', emoji: '🌆', color: '#7799bb',
    archetype: 'The Collective / Persona',
    meaning: 'The city and crowds represent the collective, social expectations, and the persona we perform for the world. Being lost in a crowd may signal identity confusion or feeling overwhelmed by external demands.',
    shadow: 'A threatening city, mob, or hostile crowd — social anxiety, conformity pressure, or the fear of being truly seen and judged.',
    integration: 'Where are you losing yourself to external expectations? What does the crowd demand that you cannot authentically give?',
    keywords: ['city', 'town', 'crowd', 'people', 'street', 'building', 'urban', 'bus', 'subway', 'market', 'mall', 'busy', 'public'],
  },
  vehicle: {
    label: 'Vehicle / Journey', emoji: '⟳', color: '#88aacc',
    archetype: 'The Life Journey / Control',
    meaning: 'Vehicles represent the vehicle of the self on the journey of life. Are you driving or a passenger? Is the vehicle in control or out of control? This reveals your sense of agency in your own life direction.',
    shadow: 'Brakes failing, crashing, being driven by someone else — feeling powerless to steer your own life.',
    integration: 'Who is driving your life right now? What would it mean to take the wheel?',
    keywords: ['car', 'vehicle', 'drive', 'driving', 'bus', 'train', 'plane', 'boat', 'ship', 'crash', 'road', 'highway', 'journey', 'travel', 'ride'],
  },
  stranger: {
    label: 'The Stranger', emoji: '⊕', color: '#aa88cc',
    archetype: 'The Shadow / Anima / Animus',
    meaning: 'The unknown figure — often the shadow, anima, or animus presenting itself. A dark, menacing stranger is the shadow; a luminous, fascinating stranger is often the soul image or higher self in disguise.',
    shadow: 'A stranger that attacks, seduces against your will, or feels profoundly uncanny — a disowned aspect demanding integration.',
    integration: 'What quality does this stranger have that you secretly long for or fear in yourself?',
    keywords: ['stranger', 'unknown', 'figure', 'person', 'man', 'woman', 'shadow', 'presence', 'mysterious', 'unfamiliar'],
  },
}

// Emotion taxonomy
export const DREAM_EMOTIONS = [
  { id: 'peaceful',     label: 'Peaceful',     emoji: '☁',  color: '#88aacc' },
  { id: 'joyful',       label: 'Joyful',        emoji: '✦',  color: '#c9a84c' },
  { id: 'anxious',      label: 'Anxious',       emoji: '⟳',  color: '#cc8833' },
  { id: 'fearful',      label: 'Fearful',       emoji: '◎',  color: '#cc4455' },
  { id: 'confused',     label: 'Confused',      emoji: '⊹',  color: '#9966cc' },
  { id: 'transcendent', label: 'Transcendent',  emoji: '⬡',  color: '#44ccaa' },
  { id: 'melancholic',  label: 'Melancholic',   emoji: '☽',  color: '#7a6090' },
  { id: 'erotic',       label: 'Passionate',    emoji: '🔥', color: '#e05a2b' },
]

// Auto-detect symbols from freetext dream content
export function detectSymbols(text) {
  if (!text) return []
  const lower = text.toLowerCase()
  const found = []
  for (const [key, sym] of Object.entries(DREAM_SYMBOLS)) {
    if (sym.keywords.some(kw => lower.includes(kw))) {
      found.push(key)
    }
  }
  return found
}

// Analyze a list of dream entries for patterns
export function analyzePatterns(dreams) {
  if (!dreams || dreams.length === 0) return null

  // Symbol frequency
  const symbolCount = {}
  for (const d of dreams) {
    const symbols = d.symbols || detectSymbols(d.content || '')
    for (const s of symbols) {
      symbolCount[s] = (symbolCount[s] || 0) + 1
    }
  }

  const topSymbols = Object.entries(symbolCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => ({ key, count, ...DREAM_SYMBOLS[key] }))

  // Emotion frequency
  const emotionCount = {}
  for (const d of dreams) {
    if (d.emotion) emotionCount[d.emotion] = (emotionCount[d.emotion] || 0) + 1
  }
  const dominantEmotion = Object.entries(emotionCount).sort((a, b) => b[1] - a[1])[0]

  // Lucid ratio
  const lucidCount = dreams.filter(d => d.lucid).length

  // Moon phase frequency
  const moonCount = {}
  for (const d of dreams) {
    if (d.moonPhase) moonCount[d.moonPhase] = (moonCount[d.moonPhase] || 0) + 1
  }
  const lucidMoon = dreams.filter(d => d.lucid && d.moonPhase).reduce((acc, d) => {
    acc[d.moonPhase] = (acc[d.moonPhase] || 0) + 1
    return acc
  }, {})
  const peakLucidMoon = Object.entries(lucidMoon).sort((a, b) => b[1] - a[1])[0]

  // Recent trend (last 7 vs previous 7)
  const sorted = [...dreams].sort((a, b) => b.date.localeCompare(a.date))
  const recent7 = sorted.slice(0, 7)
  const recent7Symbols = new Set(recent7.flatMap(d => d.symbols || detectSymbols(d.content || '')))

  return {
    totalDreams: dreams.length,
    topSymbols,
    dominantEmotion: dominantEmotion ? dominantEmotion[0] : null,
    lucidRatio: dreams.length > 0 ? Math.round((lucidCount / dreams.length) * 100) : 0,
    peakLucidMoon: peakLucidMoon ? peakLucidMoon[0] : null,
    recentSymbols: [...recent7Symbols],
    symbolCount,
    emotionCount,
  }
}

// Calculate dream journaling streak (consecutive days ending today or yesterday)
export function getDreamStreak(dreams) {
  if (!dreams || dreams.length === 0) return 0
  const dates = [...new Set(dreams.map(d => d.date))].sort().reverse()
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
  if (dates[0] !== today && dates[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = Math.round((prev - curr) / 864e5)
    if (diff === 1) streak++
    else break
  }
  return streak
}

// Moon phase name from a JS Date (simplified)
export function getMoonPhaseForDate(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date()
  // Reference new moon: Jan 6, 2000
  const ref = new Date('2000-01-06T18:14:00Z')
  const synodicMonth = 29.53058867
  const elapsed = (date - ref) / (1000 * 60 * 60 * 24)
  const phase = ((elapsed % synodicMonth) + synodicMonth) % synodicMonth
  const normalized = phase / synodicMonth

  if (normalized < 0.0625) return { name: 'New Moon', emoji: '🌑' }
  if (normalized < 0.1875) return { name: 'Waxing Crescent', emoji: '🌒' }
  if (normalized < 0.3125) return { name: 'First Quarter', emoji: '🌓' }
  if (normalized < 0.4375) return { name: 'Waxing Gibbous', emoji: '🌔' }
  if (normalized < 0.5625) return { name: 'Full Moon', emoji: '🌕' }
  if (normalized < 0.6875) return { name: 'Waning Gibbous', emoji: '🌖' }
  if (normalized < 0.8125) return { name: 'Last Quarter', emoji: '🌗' }
  if (normalized < 0.9375) return { name: 'Waning Crescent', emoji: '🌘' }
  return { name: 'New Moon', emoji: '🌑' }
}

// Generate a new dream entry skeleton
export function createDreamEntry({ title = '', content = '', emotion = 'peaceful', lucid = false, vividness = 3 } = {}) {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const moonPhase = getMoonPhaseForDate(date)
  const symbols = detectSymbols(content)
  return {
    id: Date.now(),
    date,
    title,
    content,
    symbols,
    emotion,
    lucid,
    vividness,
    moonPhase: moonPhase.name,
    moonEmoji: moonPhase.emoji,
  }
}
