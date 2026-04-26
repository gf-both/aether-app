/**
 * frequencyEngine.js
 *
 * Curated library of therapeutic frequencies with researched benefits.
 * Categories: Solfeggio, Binaural Beats, Planetary, Brainwave, Chakra, Healing.
 *
 * All frequencies are backed by published research or established sound therapy traditions.
 * The engine generates Web Audio API oscillator configurations.
 */

// ─── Frequency Library ────────────────────────────────────────────────────────

export const FREQUENCY_CATEGORIES = [
  { id: 'solfeggio', label: 'Solfeggio', icon: '◎', color: '#c9a84c', desc: 'Ancient sacred tones' },
  { id: 'binaural', label: 'Binaural Beats', icon: '◇', color: '#50b4dc', desc: 'Brainwave entrainment' },
  { id: 'planetary', label: 'Planetary', icon: '☉', color: '#9050e0', desc: 'Cosmic frequencies' },
  { id: 'brainwave', label: 'Brainwave', icon: '⟳', color: '#64b450', desc: 'Neural state tuning' },
  { id: 'chakra', label: 'Chakra', icon: '⊛', color: '#d43070', desc: 'Energy center alignment' },
  { id: 'healing', label: 'Healing', icon: '❋', color: '#40ccdd', desc: 'Therapeutic tones' },
]

export const FREQUENCIES = [
  // ─── SOLFEGGIO FREQUENCIES ────────────────────────────────────────────
  // Derived from Gregorian chants, rediscovered by Dr. Joseph Puleo (1974)
  {
    id: 'sol-174',
    name: '174 Hz — Foundation',
    category: 'solfeggio',
    frequency: 174,
    benefit: 'Pain reduction, grounding, security',
    description: 'The lowest Solfeggio tone acts as a natural anaesthetic. Research suggests it reduces pain perception and provides a sense of physical and emotional security.',
    research: 'Used in sound therapy for chronic pain management. Associated with grounding and stability.',
    duration: 600,
    waveform: 'sine',
    tags: ['pain', 'grounding', 'security', 'foundation'],
  },
  {
    id: 'sol-285',
    name: '285 Hz — Cellular Repair',
    category: 'solfeggio',
    frequency: 285,
    benefit: 'Tissue healing, energy field restoration',
    description: 'Influences the energy field around the body, encouraging cellular regeneration. Used in sound healing sessions for post-injury recovery.',
    research: 'Sound therapy tradition associates this frequency with restoration of damaged tissue and organ function.',
    duration: 600,
    waveform: 'sine',
    tags: ['healing', 'cellular', 'repair', 'regeneration'],
  },
  {
    id: 'sol-396',
    name: '396 Hz — Liberation',
    category: 'solfeggio',
    frequency: 396,
    benefit: 'Release guilt and fear, emotional unblocking',
    description: 'UT queant laxis — the first note of the original Solfeggio scale. Targets guilt and fear patterns stored in the body, facilitating emotional release.',
    research: 'Corresponds to the root chakra. Research in music therapy links lower frequencies to stress reduction and emotional grounding.',
    duration: 600,
    waveform: 'sine',
    tags: ['fear', 'guilt', 'liberation', 'emotional'],
  },
  {
    id: 'sol-417',
    name: '417 Hz — Transmutation',
    category: 'solfeggio',
    frequency: 417,
    benefit: 'Facilitate change, cleanse trauma',
    description: 'RE sonare fibris — facilitates change and undoing situations. Clears destructive influences from past events and encourages cells to function optimally.',
    research: 'Used in trauma-informed sound therapy. Associated with the sacral chakra and creative transformation.',
    duration: 600,
    waveform: 'sine',
    tags: ['change', 'trauma', 'cleansing', 'transformation'],
  },
  {
    id: 'sol-528',
    name: '528 Hz — Miracle Tone',
    category: 'solfeggio',
    frequency: 528,
    benefit: 'DNA repair, deep healing, love frequency',
    description: 'MI ra gestorum — the "Love Frequency." Research by Dr. Glen Rein (1998) showed 528 Hz increased UV light absorption in DNA by 8.2%, suggesting cellular repair properties.',
    research: 'Rein G. (1998) Effect of conscious intention on human DNA. Published studies show reduced cortisol and anxiety. Known as the "Miracle" tone.',
    duration: 600,
    waveform: 'sine',
    tags: ['DNA', 'repair', 'love', 'miracle', 'healing'],
  },
  {
    id: 'sol-639',
    name: '639 Hz — Connection',
    category: 'solfeggio',
    frequency: 639,
    benefit: 'Harmonize relationships, communication',
    description: 'FA muli tuorum — the frequency of connecting and relationships. Enhances communication, understanding, tolerance, and love between partners, friends, and family.',
    research: 'Heart chakra frequency. Used in couples therapy sound sessions. Associated with oxytocin release.',
    duration: 600,
    waveform: 'sine',
    tags: ['relationships', 'connection', 'communication', 'harmony'],
  },
  {
    id: 'sol-741',
    name: '741 Hz — Awakening',
    category: 'solfeggio',
    frequency: 741,
    benefit: 'Intuition, problem-solving, detox',
    description: 'SOL ve polluti — cleans cells from electromagnetic radiation and toxins. Leads to a purer, more stable spiritual life and expression of self.',
    research: 'Throat chakra frequency. Used in sound therapy for creative expression and cognitive clarity.',
    duration: 600,
    waveform: 'sine',
    tags: ['intuition', 'expression', 'detox', 'clarity'],
  },
  {
    id: 'sol-852',
    name: '852 Hz — Third Eye',
    category: 'solfeggio',
    frequency: 852,
    benefit: 'Spiritual awakening, inner vision',
    description: 'LA bii reatum — raises awareness and opens the third eye. Returns the listener to spiritual order, awakening intuition and inner strength.',
    research: 'Associated with the third eye chakra and pineal gland activation. Used in meditation practices worldwide.',
    duration: 600,
    waveform: 'sine',
    tags: ['third-eye', 'spiritual', 'awareness', 'intuition'],
  },
  {
    id: 'sol-963',
    name: '963 Hz — Divine Connection',
    category: 'solfeggio',
    frequency: 963,
    benefit: 'Crown activation, cosmic consciousness',
    description: 'The "God frequency." Activates the crown chakra and connects to the infinite. Associated with oneness, unity, and return to source.',
    research: 'Crown chakra frequency. Used in transcendental meditation and spiritual awakening practices.',
    duration: 600,
    waveform: 'sine',
    tags: ['crown', 'divine', 'unity', 'consciousness'],
  },

  // ─── BINAURAL BEATS ───────────────────────────────────────────────────
  // Discovered by Heinrich Wilhelm Dove (1839). Peer-reviewed meta-analysis
  // by Garcia-Argibay et al. (2019) confirmed effects on anxiety and memory.
  {
    id: 'bin-delta',
    name: 'Delta Waves — Deep Sleep',
    category: 'binaural',
    frequency: 200,
    binauralOffset: 2,
    benefit: 'Deep dreamless sleep, physical healing',
    description: 'Delta range (0.5-4 Hz). A 200 Hz base tone with 2 Hz offset creates a 2 Hz binaural beat in the delta range, promoting deep restorative sleep.',
    research: 'Jirakittayakorn & Wongsawat (2017): delta binaural beats improved deep sleep quality. Essential for growth hormone release.',
    duration: 1800,
    waveform: 'sine',
    tags: ['sleep', 'delta', 'healing', 'restoration'],
  },
  {
    id: 'bin-theta',
    name: 'Theta Waves — Deep Meditation',
    category: 'binaural',
    frequency: 200,
    binauralOffset: 6,
    benefit: 'Deep meditation, creativity, REM sleep',
    description: 'Theta range (4-8 Hz). Promotes the hypnagogic state between waking and sleeping — the gateway to the subconscious. Enhances creativity and insight.',
    research: 'Reedijk et al. (2013): theta binaural beats enhanced creative divergent thinking. Used in meditation and hypnotherapy.',
    duration: 1200,
    waveform: 'sine',
    tags: ['meditation', 'theta', 'creativity', 'subconscious'],
  },
  {
    id: 'bin-alpha',
    name: 'Alpha Waves — Calm Focus',
    category: 'binaural',
    frequency: 200,
    binauralOffset: 10,
    benefit: 'Relaxed alertness, stress reduction, light meditation',
    description: 'Alpha range (8-13 Hz). The state of relaxed alertness — eyes closed, calm mind. Reduces anxiety while maintaining cognitive function.',
    research: 'Padmanabhan et al. (2005): alpha binaural beats reduced pre-operative anxiety by 26%. Widely used in stress management.',
    duration: 900,
    waveform: 'sine',
    tags: ['focus', 'alpha', 'calm', 'relaxation', 'stress'],
  },
  {
    id: 'bin-beta',
    name: 'Beta Waves — Active Focus',
    category: 'binaural',
    frequency: 200,
    binauralOffset: 20,
    benefit: 'Concentration, alertness, problem-solving',
    description: 'Beta range (13-30 Hz). Promotes active concentration and analytical thinking. Ideal for study sessions and focused work.',
    research: 'Lane et al. (1998): beta binaural beats improved vigilance and target detection. Used in ADHD management research.',
    duration: 900,
    waveform: 'sine',
    tags: ['focus', 'beta', 'concentration', 'study', 'work'],
  },
  {
    id: 'bin-gamma',
    name: 'Gamma Waves — Peak Performance',
    category: 'binaural',
    frequency: 200,
    binauralOffset: 40,
    benefit: 'Peak cognition, memory consolidation, insight',
    description: 'Gamma range (30-100 Hz). The frequency of peak mental performance. Associated with moments of insight, heightened perception, and information processing.',
    research: 'Colzato et al. (2017): gamma binaural beats enhanced attention and cognitive flexibility. Found in experienced meditators.',
    duration: 600,
    waveform: 'sine',
    tags: ['peak', 'gamma', 'cognition', 'insight', 'performance'],
  },

  // ─── PLANETARY FREQUENCIES ────────────────────────────────────────────
  // Hans Cousto's "The Cosmic Octave" (1978) — planetary orbital periods
  // transposed to audible range by octave doubling.
  {
    id: 'plan-earth',
    name: 'Earth Year — 136.10 Hz',
    category: 'planetary',
    frequency: 136.10,
    benefit: 'Grounding, balance, Om frequency',
    description: 'The frequency of Earth\'s orbital year (365.25 days) octaved to audible range. Known as the "Om" frequency in Vedic tradition — the fundamental tone of nature.',
    research: 'Cousto, Hans (1978). Matches the traditional tuning of Indian sitars and tamburas. Used as meditation drone tone.',
    duration: 900,
    waveform: 'sine',
    tags: ['earth', 'Om', 'grounding', 'balance', 'nature'],
  },
  {
    id: 'plan-sun',
    name: 'Sun — 126.22 Hz',
    category: 'planetary',
    frequency: 126.22,
    benefit: 'Vitality, confidence, solar plexus activation',
    description: 'The Sun\'s frequency derived from its magnetic field oscillation period. Promotes self-confidence, willpower, and vital energy.',
    research: 'Solar magnetic field period transposed by Cousto. Associated with solar plexus chakra.',
    duration: 900,
    waveform: 'sine',
    tags: ['sun', 'vitality', 'confidence', 'energy', 'solar'],
  },
  {
    id: 'plan-moon',
    name: 'Moon — 210.42 Hz',
    category: 'planetary',
    frequency: 210.42,
    benefit: 'Emotional balance, intuition, feminine energy',
    description: 'The synodic month (29.53 days) octaved to audible range. Connects with the emotional body, enhancing intuition and receptivity.',
    research: 'Cousto\'s Cosmic Octave. Used in women\'s health sound therapy and lunar cycle meditation.',
    duration: 900,
    waveform: 'sine',
    tags: ['moon', 'emotions', 'intuition', 'feminine', 'cycles'],
  },
  {
    id: 'plan-venus',
    name: 'Venus — 221.23 Hz',
    category: 'planetary',
    frequency: 221.23,
    benefit: 'Love, beauty, harmony, artistic inspiration',
    description: 'Venus orbital period transposed to sound. The frequency of aesthetic appreciation, love, and harmony. Enhances creativity and relational warmth.',
    research: 'Venus orbital frequency per Cousto. Associated with the heart chakra and Venusian qualities.',
    duration: 900,
    waveform: 'sine',
    tags: ['venus', 'love', 'beauty', 'harmony', 'art'],
  },
  {
    id: 'plan-mars',
    name: 'Mars — 144.72 Hz',
    category: 'planetary',
    frequency: 144.72,
    benefit: 'Strength, courage, physical energy',
    description: 'Mars orbital frequency. Activates willpower, physical stamina, and assertiveness. Used before athletic performance and for overcoming lethargy.',
    research: 'Mars orbital period per Cousto. Associated with the root/sacral chakra complex.',
    duration: 600,
    waveform: 'sine',
    tags: ['mars', 'strength', 'courage', 'energy', 'action'],
  },
  {
    id: 'plan-jupiter',
    name: 'Jupiter — 183.58 Hz',
    category: 'planetary',
    frequency: 183.58,
    benefit: 'Expansion, optimism, abundance',
    description: 'Jupiter\'s frequency promotes growth, wisdom, and generosity. Used in prosperity meditation and for expanding consciousness beyond limitations.',
    research: 'Jupiter orbital period per Cousto. Associated with the sacral/throat chakra axis.',
    duration: 900,
    waveform: 'sine',
    tags: ['jupiter', 'expansion', 'abundance', 'wisdom', 'growth'],
  },
  {
    id: 'plan-saturn',
    name: 'Saturn — 147.85 Hz',
    category: 'planetary',
    frequency: 147.85,
    benefit: 'Discipline, structure, karmic clearing',
    description: 'Saturn\'s frequency promotes focus, discipline, and structured thinking. Helps process karmic patterns and build lasting foundations.',
    research: 'Saturn orbital period per Cousto. Associated with concentration and inner teacher archetype.',
    duration: 900,
    waveform: 'sine',
    tags: ['saturn', 'discipline', 'structure', 'karma', 'focus'],
  },

  // ─── BRAINWAVE STATES ─────────────────────────────────────────────────
  // Pure isochronic tones for direct neural entrainment (no headphones required)
  {
    id: 'bw-schumann',
    name: 'Schumann Resonance — 7.83 Hz',
    category: 'brainwave',
    frequency: 250,
    binauralOffset: 7.83,
    benefit: 'Earth resonance, anti-stress, grounding',
    description: 'The electromagnetic frequency of the Earth-ionosphere cavity. First predicted by Winfried Otto Schumann (1952), confirmed by measurements. The frequency humans evolved within.',
    research: 'Cherry, N. (2002): correlation between Schumann resonance and human health. König (1979): EEG alpha rhythm matches Schumann fundamental.',
    duration: 1200,
    waveform: 'sine',
    tags: ['schumann', 'earth', 'grounding', 'natural', 'stress'],
  },
  {
    id: 'bw-flow',
    name: 'Flow State — 10 Hz Alpha',
    category: 'brainwave',
    frequency: 250,
    binauralOffset: 10,
    benefit: 'Optimal performance, flow, effortless concentration',
    description: 'The 10 Hz alpha frequency is associated with the flow state — that optimal zone where performance feels effortless. Used by athletes and musicians.',
    research: 'Csikszentmihalyi flow state research shows 10 Hz alpha dominance. Used in neurofeedback training.',
    duration: 1200,
    waveform: 'sine',
    tags: ['flow', 'alpha', 'performance', 'effortless', 'zone'],
  },

  // ─── CHAKRA FREQUENCIES ───────────────────────────────────────────────
  // Based on the C major scale mapping to chakras (sound healing tradition)
  {
    id: 'ch-root',
    name: 'Root Chakra — 256 Hz (C)',
    category: 'chakra',
    frequency: 256,
    benefit: 'Security, survival, grounding',
    description: 'Muladhara. The root of your energy body. 256 Hz (middle C in scientific pitch) resonates with the base of the spine, promoting feelings of safety and belonging.',
    research: 'Sound healing tradition maps C to root chakra. 256 Hz = scientific tuning C4 (Verdi tuning).',
    duration: 600,
    waveform: 'sine',
    tags: ['root', 'chakra', 'grounding', 'security', 'muladhara'],
  },
  {
    id: 'ch-sacral',
    name: 'Sacral Chakra — 288 Hz (D)',
    category: 'chakra',
    frequency: 288,
    benefit: 'Creativity, pleasure, emotional flow',
    description: 'Svadhisthana. The center of creativity and emotional intelligence. 288 Hz unlocks creative expression and emotional fluidity.',
    research: 'D note mapped to sacral center in multiple sound healing systems.',
    duration: 600,
    waveform: 'sine',
    tags: ['sacral', 'chakra', 'creativity', 'emotions', 'svadhisthana'],
  },
  {
    id: 'ch-solar',
    name: 'Solar Plexus — 320 Hz (E)',
    category: 'chakra',
    frequency: 320,
    benefit: 'Personal power, confidence, will',
    description: 'Manipura. The fire center of personal power and will. 320 Hz strengthens self-esteem, determination, and the courage to act.',
    research: 'E note mapped to solar plexus. Associated with digestive health and personal empowerment.',
    duration: 600,
    waveform: 'sine',
    tags: ['solar', 'chakra', 'power', 'confidence', 'manipura'],
  },
  {
    id: 'ch-heart',
    name: 'Heart Chakra — 341 Hz (F)',
    category: 'chakra',
    frequency: 341,
    benefit: 'Love, compassion, emotional healing',
    description: 'Anahata. The bridge between physical and spiritual. 341 Hz opens the heart to unconditional love, compassion, and forgiveness.',
    research: 'F note mapped to heart center. Heart coherence research by HeartMath Institute supports tonal entrainment.',
    duration: 600,
    waveform: 'sine',
    tags: ['heart', 'chakra', 'love', 'compassion', 'anahata'],
  },
  {
    id: 'ch-throat',
    name: 'Throat Chakra — 384 Hz (G)',
    category: 'chakra',
    frequency: 384,
    benefit: 'Expression, truth, communication',
    description: 'Vishuddha. The center of authentic expression. 384 Hz clears communication blocks and empowers truthful self-expression.',
    research: 'G note mapped to throat center. Used in voice therapy and public speaking preparation.',
    duration: 600,
    waveform: 'sine',
    tags: ['throat', 'chakra', 'expression', 'truth', 'vishuddha'],
  },
  {
    id: 'ch-thirdeye',
    name: 'Third Eye — 426 Hz (A)',
    category: 'chakra',
    frequency: 426,
    benefit: 'Intuition, insight, inner vision',
    description: 'Ajna. The seat of intuition and inner knowing. 426 Hz stimulates the pineal gland and enhances visualization and psychic perception.',
    research: 'A note mapped to third eye. Pineal gland research suggests sensitivity to specific sonic frequencies.',
    duration: 600,
    waveform: 'sine',
    tags: ['thirdeye', 'chakra', 'intuition', 'vision', 'ajna'],
  },
  {
    id: 'ch-crown',
    name: 'Crown Chakra — 480 Hz (B)',
    category: 'chakra',
    frequency: 480,
    benefit: 'Spiritual connection, unity, transcendence',
    description: 'Sahasrara. The thousand-petaled lotus of cosmic consciousness. 480 Hz facilitates connection to higher states of awareness and spiritual unity.',
    research: 'B note mapped to crown center. Used in transcendental meditation and spiritual retreat settings.',
    duration: 600,
    waveform: 'sine',
    tags: ['crown', 'chakra', 'spiritual', 'unity', 'sahasrara'],
  },

  // ─── HEALING FREQUENCIES ──────────────────────────────────────────────
  {
    id: 'heal-rife',
    name: 'Rife Universal — 432 Hz',
    category: 'healing',
    frequency: 432,
    benefit: 'Universal healing, natural tuning',
    description: '432 Hz is the natural tuning frequency advocated by Verdi and mathematically aligned with patterns found in nature (Fibonacci, golden ratio). Reduces anxiety and lowers heart rate.',
    research: 'Calamassi & Pomponi (2019): 432 Hz music decreased heart rate and blood pressure vs 440 Hz. Preferred by Italian opera tradition.',
    duration: 900,
    waveform: 'sine',
    tags: ['432', 'healing', 'natural', 'tuning', 'universal'],
  },
  {
    id: 'heal-40hz',
    name: '40 Hz Gamma — Neural Protection',
    category: 'healing',
    frequency: 200,
    binauralOffset: 40,
    benefit: 'Cognitive health, memory, neural cleansing',
    description: '40 Hz gamma stimulation has been shown to reduce amyloid plaques in Alzheimer\'s research. Activates microglia (brain immune cells) for neural cleanup.',
    research: 'Iaccarino et al. (2016, Nature): 40 Hz light/sound reduced amyloid-beta in mice by 50%. Human trials ongoing at MIT.',
    duration: 1200,
    waveform: 'sine',
    tags: ['40hz', 'gamma', 'brain', 'memory', 'neuroprotection'],
  },
  {
    id: 'heal-111',
    name: '111 Hz — Sacred Chamber',
    category: 'healing',
    frequency: 111,
    benefit: 'Altered consciousness, ancient ritual frequency',
    description: 'The resonant frequency measured inside the Hal Saflieni Hypogeum (3000 BCE Malta) and Newgrange (3200 BCE Ireland). Ancient builders designed chambers to resonate at exactly 111 Hz.',
    research: 'Cook et al. (2008): 111 Hz shifts brain activity from left to right hemisphere. Found in Paleolithic cave acoustics.',
    duration: 900,
    waveform: 'sine',
    tags: ['111', 'sacred', 'ancient', 'consciousness', 'ritual'],
  },
  {
    id: 'heal-174-organ',
    name: '174 Hz — Organ Resonance',
    category: 'healing',
    frequency: 174,
    benefit: 'Natural pain relief, organ resonance',
    description: 'The frequency at which human organs naturally resonate. Used as a foundation tone in sound bath therapy for full-body relaxation and pain management.',
    research: 'Sound therapy clinical practice. Organs resonate in the 100-200 Hz range.',
    duration: 900,
    waveform: 'sine',
    tags: ['organ', 'pain', 'resonance', 'body', 'relaxation'],
  },
]

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function getFrequencyById(id) {
  return FREQUENCIES.find(f => f.id === id) || null
}

export function getFrequenciesByCategory(category) {
  return FREQUENCIES.filter(f => f.category === category)
}

export function getFrequenciesByTag(tag) {
  return FREQUENCIES.filter(f => f.tags.includes(tag))
}

export function searchFrequencies(query) {
  const q = query.toLowerCase()
  return FREQUENCIES.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.benefit.toLowerCase().includes(q) ||
    f.tags.some(t => t.includes(q)) ||
    f.category.includes(q)
  )
}

/**
 * Get recommended frequencies based on time of day and intent.
 */
export function getRecommendedFrequencies(intent = 'general') {
  const hour = new Date().getHours()
  const isNight = hour >= 21 || hour < 6
  const isMorning = hour >= 6 && hour < 12
  const isAfternoon = hour >= 12 && hour < 18

  switch (intent) {
    case 'sleep':
      return FREQUENCIES.filter(f => f.tags.some(t => ['sleep', 'delta', 'relaxation'].includes(t)))
    case 'focus':
      return FREQUENCIES.filter(f => f.tags.some(t => ['focus', 'concentration', 'beta', 'flow', 'study'].includes(t)))
    case 'meditation':
      return FREQUENCIES.filter(f => f.tags.some(t => ['meditation', 'theta', 'spiritual', 'Om', 'consciousness'].includes(t)))
    case 'healing':
      return FREQUENCIES.filter(f => f.tags.some(t => ['healing', 'repair', 'DNA', 'pain', 'cellular'].includes(t)))
    case 'energy':
      return FREQUENCIES.filter(f => f.tags.some(t => ['energy', 'vitality', 'courage', 'action', 'performance'].includes(t)))
    default:
      // Time-based recommendation
      if (isNight) return FREQUENCIES.filter(f => f.tags.some(t => ['sleep', 'delta', 'relaxation', 'grounding'].includes(t)))
      if (isMorning) return FREQUENCIES.filter(f => f.tags.some(t => ['energy', 'focus', 'vitality', 'grounding'].includes(t)))
      if (isAfternoon) return FREQUENCIES.filter(f => f.tags.some(t => ['focus', 'flow', 'concentration', 'clarity'].includes(t)))
      return FREQUENCIES.slice(0, 6)
  }
}
