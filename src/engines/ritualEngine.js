/**
 * Ritual Engine — Recommends rituals from ancient traditions
 * based on profile patterns, moon phases, transits, cycle, and numerology.
 *
 * Draws from 12 traditions:
 *   Hindu (Vedic), Buddhist, Kabbalistic, Sufi, Egyptian, Mayan,
 *   Greek/Hermetic, Celtic, Tibetan, Taoist, Shamanic, Yogic
 *
 * Each ritual is mapped to framework conditions (moon phase, numerology day,
 * Gene Keys shadow, HD type, enneagram, dosha, transits, cycle phase, etc.)
 */

import { getMoonPhase } from './cycleEngine'

// ─── Tradition Definitions ──────────────────────────────────
export const TRADITIONS = {
  vedic:     { name: 'Vedic',       origin: 'India',       icon: '🕉️', color: '#e8a040', era: '~3000 BCE' },
  buddhist:  { name: 'Buddhist',    origin: 'India/Tibet', icon: '☸',  color: '#f0c040', era: '~500 BCE' },
  kabbalah:  { name: 'Kabbalistic', origin: 'Hebrew',      icon: '✡',  color: '#c9a84c', era: '~100 CE' },
  sufi:      { name: 'Sufi',        origin: 'Persia',      icon: '☪',  color: '#60b0dd', era: '~800 CE' },
  egyptian:  { name: 'Egyptian',    origin: 'Egypt',       icon: '𓂀',  color: '#d4a030', era: '~3000 BCE' },
  mayan:     { name: 'Mayan',       origin: 'Mesoamerica', icon: '🔺', color: '#40cc88', era: '~2000 BCE' },
  hermetic:  { name: 'Hermetic',    origin: 'Greece/Egypt',icon: '⚗',  color: '#9080e0', era: '~200 CE' },
  celtic:    { name: 'Celtic',      origin: 'British Isles',icon: '🌿', color: '#44cc88', era: '~500 BCE' },
  tibetan:   { name: 'Tibetan',     origin: 'Tibet',       icon: '🏔',  color: '#e06040', era: '~700 CE' },
  taoist:    { name: 'Taoist',      origin: 'China',       icon: '☯',  color: '#80c8e0', era: '~400 BCE' },
  shamanic:  { name: 'Shamanic',    origin: 'Global',      icon: '🪶', color: '#a0785c', era: '~40000 BCE' },
  yogic:     { name: 'Yogic',       origin: 'India',       icon: '🧘', color: '#cc66aa', era: '~3000 BCE' },
}

// ─── Ritual Database ────────────────────────────────────────
// Each ritual has: id, tradition, name, sanskrit/original name,
// description, duration (min), difficulty, element, purpose[],
// moonAffinity[], doshaBalance[], enneagramTypes[], hdTypes[],
// numerologyDays[], cyclePhases[], geneKeyShadows[], instructions[]
export const RITUALS = [
  // ── VEDIC ──
  {
    id: 'sandhya-vandana',
    tradition: 'vedic',
    name: 'Sandhya Vandana',
    originalName: 'संध्यावन्दन',
    description: 'The twilight prayer — performed at the junction of day and night. Aligns your inner rhythm with the solar cycle through mantras and water offerings.',
    duration: 20,
    difficulty: 'intermediate',
    element: 'fire',
    purpose: ['alignment', 'purification', 'daily-rhythm'],
    moonAffinity: ['New Moon', 'Full Moon'],
    doshaBalance: ['pitta', 'vata'],
    enneagramTypes: [1, 4, 5],
    hdTypes: ['Projector', 'Reflector'],
    numerologyDays: [1, 7, 9],
    cyclePhases: ['Menstrual', 'Luteal'],
    geneKeyShadows: ['anxiety', 'impatience', 'control'],
    instructions: [
      'Face east at dawn or west at dusk',
      'Take water in your right palm — offer to the sun',
      'Chant the Gayatri mantra 3, 9, or 108 times',
      'Practice pranayama: 3 rounds of alternate nostril breathing',
      'Sit in silence for 5 minutes. Let the transition land.',
    ],
  },
  {
    id: 'agnihotra',
    tradition: 'vedic',
    name: 'Agnihotra',
    originalName: 'अग्निहोत्र',
    description: 'The fire purification ritual. A small fire offering at sunrise and sunset that purifies the atmosphere and the subtle body.',
    duration: 15,
    difficulty: 'advanced',
    element: 'fire',
    purpose: ['purification', 'transformation', 'release'],
    moonAffinity: ['Full Moon', 'Waning Gibbous'],
    doshaBalance: ['kapha', 'vata'],
    enneagramTypes: [8, 3, 1],
    hdTypes: ['Manifestor', 'Generator'],
    numerologyDays: [1, 5, 9],
    cyclePhases: ['Ovulatory', 'Follicular'],
    geneKeyShadows: ['stagnation', 'frustration', 'anger'],
    instructions: [
      'Prepare a small copper pyramid with dried cow dung and ghee',
      'At exact sunrise, light the fire',
      'Offer two pinches of rice into the flame with each mantra',
      'Chant: "Agnaye Swaha" (I offer to fire) and "Prajaapataye Swaha" (I offer to the creator)',
      'Sit with the smoke. Breathe. Let purification happen.',
    ],
  },

  // ── BUDDHIST ──
  {
    id: 'tonglen',
    tradition: 'buddhist',
    name: 'Tonglen',
    originalName: 'གཏོང་ལེན',
    description: 'The practice of sending and receiving. Breathe in suffering, breathe out compassion. Reverses the ego\'s logic of self-protection.',
    duration: 20,
    difficulty: 'intermediate',
    element: 'air',
    purpose: ['compassion', 'shadow-work', 'heart-opening'],
    moonAffinity: ['Waning Gibbous', 'Last Quarter', 'Waning Crescent'],
    doshaBalance: ['pitta', 'vata-pitta'],
    enneagramTypes: [2, 4, 9],
    hdTypes: ['Projector', 'Generator'],
    numerologyDays: [2, 6, 9],
    cyclePhases: ['Luteal', 'Menstrual'],
    geneKeyShadows: ['rejection', 'self-pity', 'victimhood'],
    instructions: [
      'Sit comfortably. Close your eyes.',
      'Think of someone who is suffering — or your own pain.',
      'Breathe IN their suffering as dark, heavy smoke. Take it into your heart.',
      'Breathe OUT compassion, light, relief — send it to them as white light.',
      'Expand: breathe in all suffering everywhere. Breathe out love for all beings.',
      'Rest in open awareness. You are not diminished by taking in pain — you are expanded.',
    ],
  },
  {
    id: 'metta-bhavana',
    tradition: 'buddhist',
    name: 'Metta Bhavana',
    originalName: 'मैत्री भावना',
    description: 'Loving-kindness meditation. Systematically generate unconditional love — first for yourself, then expanding outward to all beings.',
    duration: 25,
    difficulty: 'beginner',
    element: 'water',
    purpose: ['self-love', 'compassion', 'healing'],
    moonAffinity: ['Waxing Crescent', 'Waxing Gibbous', 'Full Moon'],
    doshaBalance: ['vata', 'pitta'],
    enneagramTypes: [1, 3, 5, 8],
    hdTypes: ['Projector', 'Manifestor', 'Reflector'],
    numerologyDays: [2, 3, 6],
    cyclePhases: ['Follicular', 'Ovulatory'],
    geneKeyShadows: ['self-criticism', 'isolation', 'hardness'],
    instructions: [
      'Sit quietly. Place both hands on your heart.',
      'Repeat: "May I be happy. May I be safe. May I be healthy. May I live with ease."',
      'Picture someone you love. Send the same wishes to them.',
      'Picture someone neutral — a stranger. Send the wishes.',
      'Picture someone difficult. This is the practice. Send the wishes.',
      'Expand to all beings everywhere. Radiate love without boundary.',
    ],
  },

  // ── KABBALISTIC ──
  {
    id: 'tikkun-chatzot',
    tradition: 'kabbalah',
    name: 'Tikkun Chatzot',
    originalName: 'תיקון חצות',
    description: 'The midnight rectification. A lament and longing practice performed at midnight to repair the broken vessels and reconnect with the divine.',
    duration: 30,
    difficulty: 'advanced',
    element: 'water',
    purpose: ['repair', 'longing', 'shadow-work', 'divine-connection'],
    moonAffinity: ['New Moon', 'Waning Crescent', 'Last Quarter'],
    doshaBalance: ['kapha'],
    enneagramTypes: [4, 5, 9],
    hdTypes: ['Reflector', 'Projector'],
    numerologyDays: [7, 4, 9],
    cyclePhases: ['Menstrual', 'Luteal'],
    geneKeyShadows: ['disconnection', 'despair', 'numbness'],
    instructions: [
      'Wake at midnight (or the midpoint between sunset and sunrise)',
      'Sit on the floor — lower yourself. This is about descent.',
      'Read or recite Psalm 137: "By the rivers of Babylon, we sat and wept."',
      'Allow grief to surface — for the world, for yourself, for what is broken.',
      'After grief: shift to longing. What do you ache for? Name it.',
      'Close with silence. The repair happens in the space between grief and hope.',
    ],
  },
  {
    id: 'hitbodedut',
    tradition: 'kabbalah',
    name: 'Hitbodedut',
    originalName: 'התבודדות',
    description: 'Secluded conversation with the divine. Go alone into nature and speak aloud — uncensored, unscripted. Pour out your heart.',
    duration: 30,
    difficulty: 'beginner',
    element: 'air',
    purpose: ['prayer', 'authenticity', 'release', 'divine-connection'],
    moonAffinity: ['Full Moon', 'Waxing Gibbous', 'New Moon'],
    doshaBalance: ['vata', 'pitta', 'kapha'],
    enneagramTypes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    hdTypes: ['Generator', 'Manifestor', 'Projector', 'Manifesting Generator', 'Reflector'],
    numerologyDays: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    cyclePhases: ['Menstrual', 'Follicular', 'Ovulatory', 'Luteal'],
    geneKeyShadows: ['repression', 'dishonesty', 'stagnation'],
    instructions: [
      'Find a secluded place — forest, field, rooftop, closed room.',
      'Set a timer for 30 minutes. This is your appointment with truth.',
      'Speak aloud. To God, the universe, yourself — whoever listens.',
      'Start with whatever is real: frustration, gratitude, confusion, desire.',
      'Do not censor. Do not perform. Let the ugly truth come first — beauty follows.',
      'When words run out, listen. The silence after honesty is where guidance arrives.',
    ],
  },

  // ── SUFI ──
  {
    id: 'dhikr',
    tradition: 'sufi',
    name: 'Dhikr',
    originalName: 'ذِكْر',
    description: 'Remembrance of God through rhythmic repetition. The breath becomes the prayer. The body becomes the instrument.',
    duration: 20,
    difficulty: 'beginner',
    element: 'air',
    purpose: ['devotion', 'presence', 'heart-opening', 'rhythm'],
    moonAffinity: ['Full Moon', 'Waxing Gibbous', 'Waxing Crescent'],
    doshaBalance: ['vata', 'pitta'],
    enneagramTypes: [4, 6, 9, 2],
    hdTypes: ['Generator', 'Manifesting Generator'],
    numerologyDays: [3, 6, 9],
    cyclePhases: ['Follicular', 'Ovulatory'],
    geneKeyShadows: ['forgetfulness', 'anxiety', 'restlessness'],
    instructions: [
      'Sit or stand. Close your eyes.',
      'Begin repeating "La ilaha illallah" (There is no reality but the Real) slowly.',
      'Synchronize with breath: "La ilaha" on exhale, "illallah" on inhale.',
      'Gradually increase speed. Let the words become rhythm, then vibration.',
      'When mind and body dissolve into the repetition — you are in dhikr.',
      'Slow down. Return to silence. The remembrance continues beneath thought.',
    ],
  },
  {
    id: 'sama-whirling',
    tradition: 'sufi',
    name: 'Sama (Whirling)',
    originalName: 'سماع',
    description: 'The Mevlevi whirling practice. Spin with one palm facing heaven, one facing earth — become the axis between worlds.',
    duration: 30,
    difficulty: 'advanced',
    element: 'fire',
    purpose: ['ecstasy', 'surrender', 'axis-mundi', 'embodiment'],
    moonAffinity: ['Full Moon', 'Waxing Gibbous'],
    doshaBalance: ['kapha', 'vata'],
    enneagramTypes: [4, 7, 9],
    hdTypes: ['Manifesting Generator', 'Generator'],
    numerologyDays: [3, 5, 7],
    cyclePhases: ['Follicular', 'Ovulatory'],
    geneKeyShadows: ['heaviness', 'paralysis', 'disconnection'],
    instructions: [
      'Stand with arms crossed over chest. Bow inward.',
      'Slowly unfold arms: right palm faces up (receiving), left palm faces down (giving).',
      'Begin turning counter-clockwise. Left foot pivots, right foot propels.',
      'Head tilts slightly right. Eyes soft or closed.',
      'Spin slowly at first. Do not force speed — let it find you.',
      'When you stop: fold arms again, bow. You have been the still point of the turning world.',
    ],
  },

  // ── EGYPTIAN ──
  {
    id: 'opening-of-mouth',
    tradition: 'egyptian',
    name: 'Opening of the Mouth',
    originalName: 'wpt-rꜣ',
    description: 'An adapted version of the ancient rite. Open the senses to perceive what is normally invisible — activate your subtle perception.',
    duration: 20,
    difficulty: 'intermediate',
    element: 'earth',
    purpose: ['activation', 'perception', 'awakening'],
    moonAffinity: ['New Moon', 'Waxing Crescent'],
    doshaBalance: ['kapha', 'vata'],
    enneagramTypes: [5, 4, 8],
    hdTypes: ['Projector', 'Reflector'],
    numerologyDays: [1, 7, 8],
    cyclePhases: ['Follicular'],
    geneKeyShadows: ['numbness', 'blindness', 'denial'],
    instructions: [
      'Sit in darkness or low light. Face north.',
      'Touch your lips gently. Say: "My mouth is opened by Ptah."',
      'Touch your eyes. "My eyes are opened by Thoth."',
      'Touch your ears. "My ears are opened by Anubis."',
      'Touch your heart center. "My heart is opened by Ma\'at."',
      'Sit in silence. Notice what you now perceive that was hidden before.',
    ],
  },

  // ── MAYAN ──
  {
    id: 'fire-ceremony',
    tradition: 'mayan',
    name: 'Xukulem',
    originalName: 'Fire Ceremony',
    description: 'Sacred fire ceremony to honor the Nawal (spirit) of the day. Offerings of copal, candles, and prayers to align with the Tzolkin count.',
    duration: 30,
    difficulty: 'intermediate',
    element: 'fire',
    purpose: ['alignment', 'offering', 'gratitude', 'daily-rhythm'],
    moonAffinity: ['New Moon', 'Full Moon', 'First Quarter'],
    doshaBalance: ['kapha', 'pitta'],
    enneagramTypes: [1, 3, 8],
    hdTypes: ['Manifestor', 'Generator'],
    numerologyDays: [1, 4, 8, 9],
    cyclePhases: ['Ovulatory', 'Follicular'],
    geneKeyShadows: ['disconnection', 'purposelessness', 'chaos'],
    instructions: [
      'Build a small fire or light a candle. Place copal incense nearby.',
      'Face the four directions: East (red), North (white), West (black), South (yellow). Greet each.',
      'State today\'s Nawal and Tone from the Tzolkin calendar.',
      'Offer candles by color: one for gratitude, one for request, one for ancestors.',
      'Speak your prayers aloud into the fire. Fire carries words to Ajaw (the divine).',
      'Let the fire burn down. Do not extinguish. What fire consumes is released.',
    ],
  },

  // ── HERMETIC ──
  {
    id: 'middle-pillar',
    tradition: 'hermetic',
    name: 'Middle Pillar',
    originalName: 'Ritual of the Middle Pillar',
    description: 'Activate the five energy centers along your spine using the names of God. The Tree of Life mapped onto the human body.',
    duration: 25,
    difficulty: 'intermediate',
    element: 'spirit',
    purpose: ['energy-work', 'balance', 'activation', 'divine-connection'],
    moonAffinity: ['First Quarter', 'Full Moon', 'Last Quarter'],
    doshaBalance: ['vata', 'pitta', 'kapha'],
    enneagramTypes: [3, 5, 7],
    hdTypes: ['Projector', 'Manifesting Generator'],
    numerologyDays: [1, 5, 7],
    cyclePhases: ['Follicular', 'Ovulatory'],
    geneKeyShadows: ['fragmentation', 'imbalance', 'scattered'],
    instructions: [
      'Stand upright. Visualize a sphere of white light above your crown.',
      'Vibrate "Eheieh" (I Am) — feel the crown center activate.',
      'Lower the light to your throat. Vibrate "YHVH Elohim" — throat opens.',
      'Heart center: vibrate "YHVH Eloah Va-Daath" — radiant gold light.',
      'Solar plexus: vibrate "Shaddai El Chai" — violet light.',
      'Feet: vibrate "Adonai Ha-Aretz" — black/olive sphere grounds you.',
      'Circulate energy: up the back, down the front. You are the living Tree.',
    ],
  },

  // ── CELTIC ──
  {
    id: 'caim-circle',
    tradition: 'celtic',
    name: 'Caim Prayer',
    originalName: 'Caim',
    description: 'The encircling prayer. Draw an invisible circle of protection around yourself while invoking the sacred. A shield of intention.',
    duration: 10,
    difficulty: 'beginner',
    element: 'earth',
    purpose: ['protection', 'grounding', 'safety', 'boundary'],
    moonAffinity: ['New Moon', 'Waning Crescent', 'Last Quarter'],
    doshaBalance: ['vata'],
    enneagramTypes: [6, 2, 9],
    hdTypes: ['Projector', 'Reflector'],
    numerologyDays: [2, 4, 6],
    cyclePhases: ['Menstrual', 'Luteal'],
    geneKeyShadows: ['anxiety', 'fear', 'vulnerability'],
    instructions: [
      'Stand and extend your right index finger.',
      'Slowly draw a circle around yourself, moving clockwise (sunwise).',
      'As you draw, speak: "Circle me, Lord. Keep protection near and danger far."',
      'Or use your own words: "I draw a circle of [peace/courage/clarity] around me."',
      'Complete the circle. You are now enclosed in sacred space.',
      'Carry this circle with you. It is invisible but real.',
    ],
  },

  // ── TIBETAN ──
  {
    id: 'tummo',
    tradition: 'tibetan',
    name: 'Tummo',
    originalName: 'གཏུམ་མོ',
    description: 'Inner fire meditation. Generate heat from the navel center through breath and visualization. The foundation of the Six Yogas of Naropa.',
    duration: 25,
    difficulty: 'advanced',
    element: 'fire',
    purpose: ['energy-work', 'transformation', 'resilience', 'awakening'],
    moonAffinity: ['Full Moon', 'Waxing Gibbous', 'First Quarter'],
    doshaBalance: ['kapha', 'vata'],
    enneagramTypes: [8, 3, 1],
    hdTypes: ['Manifestor', 'Generator', 'Manifesting Generator'],
    numerologyDays: [1, 5, 8, 9],
    cyclePhases: ['Follicular', 'Ovulatory'],
    geneKeyShadows: ['coldness', 'withdrawal', 'stagnation'],
    instructions: [
      'Sit in vajra posture. Spine straight.',
      'Visualize a thin, hollow central channel from crown to base — blue, luminous.',
      'At the navel center: a tiny, fierce red flame. Size of a candle flame.',
      'Inhale through both nostrils. Hold. Press breath down gently.',
      'Visualize the flame growing — it rises through the central channel.',
      'Exhale slowly. Feel heat radiating from the navel. Real, physical warmth.',
      'Repeat 7-21 times. Advanced: practice in cold environments.',
    ],
  },

  // ── TAOIST ──
  {
    id: 'microcosmic-orbit',
    tradition: 'taoist',
    name: 'Microcosmic Orbit',
    originalName: '小周天',
    description: 'Circulate qi through the governing and conception vessels — the two primary meridians that form a complete circuit through the body.',
    duration: 20,
    difficulty: 'intermediate',
    element: 'water',
    purpose: ['energy-work', 'balance', 'longevity', 'healing'],
    moonAffinity: ['New Moon', 'Full Moon', 'First Quarter', 'Last Quarter'],
    doshaBalance: ['vata', 'pitta', 'kapha'],
    enneagramTypes: [5, 9, 1],
    hdTypes: ['Projector', 'Generator', 'Reflector'],
    numerologyDays: [2, 4, 7],
    cyclePhases: ['Menstrual', 'Luteal'],
    geneKeyShadows: ['blockage', 'stagnation', 'disconnection'],
    instructions: [
      'Sit with spine straight. Tongue touches the roof of the mouth (connects the circuit).',
      'Focus on the lower dantian (below navel). Gather warmth there.',
      'Guide the energy DOWN through the perineum to the coccyx.',
      'Then UP the spine — vertebra by vertebra — to the crown.',
      'Over the crown, down the forehead, through the tongue to the throat.',
      'Down the front: heart, solar plexus, back to the lower dantian.',
      'One complete orbit. Repeat 9-36 times. Do not force — guide gently.',
    ],
  },

  // ── SHAMANIC ──
  {
    id: 'journeying',
    tradition: 'shamanic',
    name: 'Shamanic Journeying',
    originalName: 'Soul Flight',
    description: 'Enter an altered state through rhythmic drumming to journey to the lower, middle, or upper worlds. Meet your power animal or spirit guide.',
    duration: 30,
    difficulty: 'intermediate',
    element: 'earth',
    purpose: ['guidance', 'healing', 'vision', 'soul-retrieval'],
    moonAffinity: ['New Moon', 'Waning Crescent', 'Full Moon'],
    doshaBalance: ['pitta', 'vata'],
    enneagramTypes: [4, 5, 7, 9],
    hdTypes: ['Reflector', 'Projector'],
    numerologyDays: [7, 9, 2],
    cyclePhases: ['Menstrual', 'Luteal'],
    geneKeyShadows: ['lostness', 'fragmentation', 'disconnection'],
    instructions: [
      'Lie down. Use a recorded shamanic drum track (220bpm, monotonous).',
      'Set an intention: a question, a request for healing, or "show me what I need to see."',
      'Visualize an entry point into the earth — a tree hollow, cave, or pool.',
      'Descend. Follow the tunnel until the landscape opens.',
      'Whatever you encounter — animal, being, landscape — interact. Ask your question.',
      'When the callback drum sounds (tempo change), return the way you came.',
      'Record everything immediately. The journey fades like a dream.',
    ],
  },

  // ── YOGIC ──
  {
    id: 'yoga-nidra',
    tradition: 'yogic',
    name: 'Yoga Nidra',
    originalName: 'योग निद्रा',
    description: 'Psychic sleep — the state between waking and sleeping. A guided rotation of consciousness through the body that accesses the subconscious.',
    duration: 30,
    difficulty: 'beginner',
    element: 'water',
    purpose: ['rest', 'healing', 'subconscious-access', 'integration'],
    moonAffinity: ['New Moon', 'Waning Crescent', 'Last Quarter', 'Waning Gibbous'],
    doshaBalance: ['vata', 'pitta', 'kapha'],
    enneagramTypes: [1, 3, 6, 8],
    hdTypes: ['Manifestor', 'Generator', 'Projector', 'Manifesting Generator', 'Reflector'],
    numerologyDays: [2, 4, 7, 9],
    cyclePhases: ['Menstrual', 'Luteal'],
    geneKeyShadows: ['exhaustion', 'overthinking', 'anxiety', 'burnout'],
    instructions: [
      'Lie in savasana (on your back). Cover your eyes.',
      'State your Sankalpa (resolve) — a short, positive, present-tense intention.',
      'Rotate awareness through the body: right thumb, index finger, middle finger... systematically.',
      'Move through right hand → arm → shoulder → torso → right leg → left leg → left arm → face → skull.',
      'Visualize opposite sensations: heaviness/lightness, cold/hot, pain/pleasure.',
      'Visualize a sequence of images (lake, mountain, sunrise, temple). Do not control — witness.',
      'Repeat your Sankalpa. Slowly externalize awareness. The seed has been planted.',
    ],
  },
  {
    id: 'trataka',
    tradition: 'yogic',
    name: 'Trataka',
    originalName: 'त्राटक',
    description: 'Candle-gazing meditation. Fix your gaze on a single flame until tears come, then close eyes and hold the afterimage. Builds concentration and cleanses the third eye.',
    duration: 15,
    difficulty: 'beginner',
    element: 'fire',
    purpose: ['focus', 'clarity', 'third-eye', 'purification'],
    moonAffinity: ['New Moon', 'Full Moon', 'Waxing Crescent'],
    doshaBalance: ['kapha', 'vata'],
    enneagramTypes: [5, 7, 3],
    hdTypes: ['Projector', 'Manifesting Generator'],
    numerologyDays: [1, 3, 5],
    cyclePhases: ['Follicular', 'Ovulatory'],
    geneKeyShadows: ['confusion', 'scattered', 'distraction'],
    instructions: [
      'Place a candle at eye level, arm\'s length away. Dim the room.',
      'Gaze at the flame without blinking. Fix on the tip — the brightest point.',
      'Hold as long as possible. When tears come, close your eyes.',
      'See the afterimage behind closed lids. Hold it at the third eye center.',
      'When it fades, open eyes and repeat. 3-5 rounds.',
      'End with eyes closed. The flame is now inside you.',
    ],
  },
]

// ─── Scoring Engine ─────────────────────────────────────────

/**
 * Compute a relevance score for a ritual given current conditions.
 * Returns 0-100. Higher = more aligned with the user's current state.
 */
function scoreRitual(ritual, conditions) {
  let score = 0
  let maxScore = 0

  const { moonPhase, numerologyDay, cyclePhase, hdType, enneagramType, doshaType, geneKeyShadows } = conditions

  // Moon phase match (weight: 25)
  maxScore += 25
  if (moonPhase && ritual.moonAffinity.includes(moonPhase)) {
    score += 25
  }

  // Numerology personal day (weight: 15)
  maxScore += 15
  if (numerologyDay && ritual.numerologyDays.includes(numerologyDay)) {
    score += 15
  }

  // Cycle phase (weight: 15)
  maxScore += 15
  if (cyclePhase && ritual.cyclePhases.includes(cyclePhase)) {
    score += 15
  }

  // HD type (weight: 10)
  maxScore += 10
  if (hdType && ritual.hdTypes.includes(hdType)) {
    score += 10
  }

  // Enneagram type (weight: 10)
  maxScore += 10
  if (enneagramType && ritual.enneagramTypes.includes(Number(enneagramType))) {
    score += 10
  }

  // Dosha balance (weight: 10)
  maxScore += 10
  if (doshaType && ritual.doshaBalance.some(d => doshaType.toLowerCase().includes(d))) {
    score += 10
  }

  // Gene Key shadow match (weight: 15)
  maxScore += 15
  if (geneKeyShadows && geneKeyShadows.length > 0) {
    const matchCount = geneKeyShadows.filter(s => ritual.geneKeyShadows.includes(s.toLowerCase())).length
    if (matchCount > 0) score += Math.min(15, matchCount * 8)
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 50
}

/**
 * Compute numerology personal day from DOB and current date.
 */
function getPersonalDay(dob) {
  if (!dob) return null
  const [y, m, d] = dob.split('-').map(Number)
  if (!y || !m || !d) return null
  const now = new Date()
  const sum = m + d + (now.getMonth() + 1) + now.getDate() + now.getFullYear()
  let pd = sum
  while (pd > 9) pd = String(pd).split('').reduce((a, b) => a + Number(b), 0)
  return pd
}

/**
 * Main recommendation function.
 * Takes profile data + current conditions, returns sorted ritual recommendations.
 */
export function getRecommendedRituals(profile = {}, options = {}) {
  const now = new Date()
  const moon = getMoonPhase(now)

  const conditions = {
    moonPhase: moon.phaseName,
    numerologyDay: getPersonalDay(profile.dob),
    cyclePhase: options.cyclePhase || null,
    hdType: profile.hdType || null,
    enneagramType: profile.enneagramType || null,
    doshaType: profile.doshaType || null,
    geneKeyShadows: options.geneKeyShadows || [],
  }

  const scored = RITUALS.map(ritual => ({
    ...ritual,
    score: scoreRitual(ritual, conditions),
    tradition: TRADITIONS[ritual.tradition],
    moonAlignment: ritual.moonAffinity.includes(moon.phaseName),
  }))

  // Sort by score descending, then by moon alignment
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.moonAlignment !== a.moonAlignment) return b.moonAlignment ? 1 : -1
    return 0
  })

  return {
    rituals: scored,
    conditions: {
      ...conditions,
      moon,
      personalDay: conditions.numerologyDay,
    },
    topRecommendation: scored[0] || null,
    moonAligned: scored.filter(r => r.moonAlignment),
    byTradition: Object.keys(TRADITIONS).reduce((acc, key) => {
      acc[key] = scored.filter(r => r.tradition.name === TRADITIONS[key].name)
      return acc
    }, {}),
  }
}

/**
 * Get ritual by ID.
 */
export function getRitualById(id) {
  const ritual = RITUALS.find(r => r.id === id)
  if (!ritual) return null
  return { ...ritual, tradition: TRADITIONS[ritual.tradition] }
}

/**
 * Get all traditions.
 */
export function getAllTraditions() {
  return Object.values(TRADITIONS)
}

/**
 * Get rituals for a specific element.
 */
export function getRitualsByElement(element) {
  return RITUALS.filter(r => r.element === element).map(r => ({
    ...r,
    tradition: TRADITIONS[r.tradition],
  }))
}
