/**
 * palmistryEngine.js — Palm Reading Analysis Framework
 *
 * Defines all palmistry data structures: major/minor lines, mounts,
 * hand shapes, finger analysis, and AI prompt construction for
 * comprehensive palm reading from uploaded images.
 */

// ── Major Lines ──────────────────────────────────────────────────
export const MAJOR_LINES = [
  {
    id: 'life',
    name: 'Life Line',
    sanskrit: 'Pitri Rekha',
    location: 'Curves around thumb base from between thumb and index finger toward wrist',
    meaning: 'Vitality, life force, major life changes, physical well-being',
    variations: [
      { type: 'Long & deep', interpretation: 'Strong vitality, robust health, resilience' },
      { type: 'Short or faint', interpretation: 'Not necessarily short life — may indicate independence, need for personal autonomy' },
      { type: 'Broken', interpretation: 'Major life change, transformation, or health shift at that point' },
      { type: 'Chained', interpretation: 'Periods of vulnerability, emotional sensitivity, multiple small changes' },
      { type: 'Forked at end', interpretation: 'Travel, split between two life paths, adaptability' },
      { type: 'Double', interpretation: 'Extra vitality source — guardian energy, strong ancestral support' },
    ],
  },
  {
    id: 'heart',
    name: 'Heart Line',
    sanskrit: 'Hridaya Rekha',
    location: 'Runs horizontally across upper palm, below fingers',
    meaning: 'Emotional life, romantic patterns, relationship style, cardiac health',
    variations: [
      { type: 'Begins below index finger', interpretation: 'Selective in love, idealistic, high standards' },
      { type: 'Begins below middle finger', interpretation: 'Self-focused in love, may prioritize personal needs' },
      { type: 'Begins between index & middle', interpretation: 'Balanced approach to love, moderate expectations' },
      { type: 'Straight & short', interpretation: 'More interest in physical expression than emotional romance' },
      { type: 'Long & curving', interpretation: 'Deep emotional expression, freely shows feelings' },
      { type: 'Wavy', interpretation: 'Multiple relationships, emotional variability' },
      { type: 'Broken', interpretation: 'Emotional trauma or major heartbreak at that point' },
    ],
  },
  {
    id: 'head',
    name: 'Head Line',
    sanskrit: 'Matri Rekha',
    location: 'Runs horizontally across middle palm',
    meaning: 'Intellect, thinking style, communication, decision-making approach',
    variations: [
      { type: 'Long', interpretation: 'Thorough thinker, considers all angles, sometimes overthinks' },
      { type: 'Short', interpretation: 'Practical, quick decisions, prefers action to analysis' },
      { type: 'Curved/sloping', interpretation: 'Creative, intuitive, imaginative thinking' },
      { type: 'Straight', interpretation: 'Logical, structured, analytical approach' },
      { type: 'Separated from life line', interpretation: 'Independent thinker, adventurous spirit' },
      { type: 'Joined to life line at start', interpretation: 'Cautious, considers consequences, family-influenced' },
      { type: 'Forked (Writer\'s Fork)', interpretation: 'Ability to see both sides, communicative talent' },
    ],
  },
  {
    id: 'fate',
    name: 'Fate Line',
    sanskrit: 'Shani Rekha',
    location: 'Vertical line running from base of palm toward middle finger',
    meaning: 'Life path, career direction, external influences, destiny',
    variations: [
      { type: 'Deep & clear', interpretation: 'Strong sense of purpose, clear direction, career stability' },
      { type: 'Broken in segments', interpretation: 'Career changes, shifts in life direction at break points' },
      { type: 'Starts from life line', interpretation: 'Self-made success, direction comes from personal effort' },
      { type: 'Starts from wrist center', interpretation: 'Independent path, destiny feels "given" or fated' },
      { type: 'Starts from Mount of Luna', interpretation: 'Success through public, creativity, or others\' support' },
      { type: 'Absent', interpretation: 'Not negative — may indicate unconventional path, multi-career, or self-directed life' },
    ],
  },
]

// ── Minor Lines ──────────────────────────────────────────────────
export const MINOR_LINES = [
  {
    id: 'sun',
    name: 'Sun Line (Apollo Line)',
    sanskrit: 'Surya Rekha',
    location: 'Vertical line toward ring finger',
    meaning: 'Success, fame, creativity, public recognition',
    present: 'Indicates potential for public success, artistic talent, or personal fulfillment',
    absent: 'Success possible but may not come with public recognition',
  },
  {
    id: 'mercury',
    name: 'Mercury Line (Health Line)',
    sanskrit: 'Swasthya Rekha',
    location: 'Diagonal from little finger toward wrist',
    meaning: 'Health, business acumen, communication ability',
    present: 'Strong business sense; if broken or wavy, watch digestive/nervous health',
    absent: 'Generally positive — absence often means robust constitution',
  },
  {
    id: 'marriage',
    name: 'Marriage Lines (Union Lines)',
    sanskrit: 'Vivah Rekha',
    location: 'Short horizontal lines on side of hand below little finger',
    meaning: 'Significant partnerships, deep emotional bonds',
    present: 'Number indicates significant relationships (not necessarily legal marriages)',
    absent: 'May indicate independence in relationships or unconventional bonds',
  },
  {
    id: 'intuition',
    name: 'Line of Intuition',
    location: 'Semicircle from Mount of Mercury to Mount of Luna',
    meaning: 'Psychic sensitivity, strong gut instincts, empathic ability',
    present: 'Heightened intuitive faculty, potential for healing or counseling',
    absent: 'Standard intuitive capacity — no deficiency implied',
  },
  {
    id: 'girdle_venus',
    name: 'Girdle of Venus',
    location: 'Semicircle above heart line between index and ring finger',
    meaning: 'Emotional sensitivity, aesthetic appreciation, sensuality',
    present: 'Heightened emotional/sensory awareness, artistic temperament',
    absent: 'More emotionally grounded, practical approach to aesthetics',
  },
  {
    id: 'bracelet',
    name: 'Bracelet Lines (Rascettes)',
    location: 'Horizontal lines at the wrist',
    meaning: 'General health, longevity, balance across life domains',
    present: 'More lines = more resources; first line is health, second wealth, third happiness',
    absent: 'Rarely absent — nearly everyone has at least one',
  },
]

// ── Mounts ───────────────────────────────────────────────────────
export const MOUNTS = [
  {
    id: 'jupiter',
    name: 'Mount of Jupiter',
    planet: 'Jupiter',
    location: 'Base of index finger',
    meaning: 'Ambition, leadership, confidence, spirituality',
    prominent: 'Natural leader, ambitious, may be drawn to teaching or law',
    flat: 'More reserved, prefers collaboration over command',
    symbol: '♃',
  },
  {
    id: 'saturn',
    name: 'Mount of Saturn',
    planet: 'Saturn',
    location: 'Base of middle finger',
    meaning: 'Responsibility, discipline, wisdom, solitude',
    prominent: 'Deep thinker, serious, drawn to research, philosophy, or solitary pursuits',
    flat: 'Lighter temperament, less inclined toward isolation or heavy introspection',
    symbol: '♄',
  },
  {
    id: 'apollo',
    name: 'Mount of Apollo (Sun)',
    planet: 'Sun',
    location: 'Base of ring finger',
    meaning: 'Creativity, success, charisma, artistic expression',
    prominent: 'Creative talent, desire for recognition, warm personality',
    flat: 'May struggle with self-expression or prefer behind-the-scenes roles',
    symbol: '☉',
  },
  {
    id: 'mercury_mount',
    name: 'Mount of Mercury',
    planet: 'Mercury',
    location: 'Base of little finger',
    meaning: 'Communication, commerce, wit, healing ability',
    prominent: 'Strong communicator, business mind, potential for writing or teaching',
    flat: 'May struggle with verbal expression or public speaking',
    symbol: '☿',
  },
  {
    id: 'venus',
    name: 'Mount of Venus',
    planet: 'Venus',
    location: 'Base of thumb, inside life line',
    meaning: 'Love, sensuality, vitality, passion, family bonds',
    prominent: 'Warm, affectionate, strong libido, love of beauty and comfort',
    flat: 'More detached, less physically oriented, may struggle with intimacy',
    symbol: '♀',
  },
  {
    id: 'luna',
    name: 'Mount of Luna (Moon)',
    planet: 'Moon',
    location: 'Lower palm opposite thumb',
    meaning: 'Imagination, intuition, subconscious, travel, creativity',
    prominent: 'Rich inner world, vivid dreams, drawn to water and travel',
    flat: 'More practical, grounded, less daydreaming',
    symbol: '☽',
  },
  {
    id: 'mars_positive',
    name: 'Upper Mars (Positive)',
    planet: 'Mars',
    location: 'Between heart line and head line, below Mercury',
    meaning: 'Moral courage, resistance, endurance',
    prominent: 'Persistent, can endure hardship, strong moral backbone',
    flat: 'May give in too easily under pressure',
    symbol: '♂',
  },
  {
    id: 'mars_negative',
    name: 'Lower Mars (Negative)',
    planet: 'Mars',
    location: 'Between head line and thumb, above Venus',
    meaning: 'Physical courage, aggression, fighting spirit',
    prominent: 'Bold, confrontational when needed, physical vitality',
    flat: 'More passive, avoids conflict',
    symbol: '♂',
  },
  {
    id: 'plain_mars',
    name: 'Plain of Mars',
    planet: 'Mars',
    location: 'Center of palm',
    meaning: 'Temperament balance, how you handle stress',
    prominent: 'Strong inner core, resilient under pressure',
    flat: 'Standard resilience',
    symbol: '♂',
  },
]

// ── Hand Shapes ──────────────────────────────────────────────────
export const HAND_SHAPES = [
  {
    id: 'earth',
    name: 'Earth Hand',
    element: 'Earth',
    traits: 'Square palm, short fingers',
    personality: 'Practical, reliable, grounded. Values security and tradition. Works with hands. Down-to-earth approach to life.',
    challenges: 'Can be stubborn, resistant to change, overly materialistic',
  },
  {
    id: 'air',
    name: 'Air Hand',
    element: 'Air',
    traits: 'Square or rectangular palm, long fingers, pronounced knuckles',
    personality: 'Intellectual, communicative, curious. Loves ideas, socializing, and mental stimulation. Quick thinker.',
    challenges: 'Can be anxious, overthinking, emotionally detached',
  },
  {
    id: 'water',
    name: 'Water Hand',
    element: 'Water',
    traits: 'Long palm, long fingers, oval/pointed fingertips',
    personality: 'Sensitive, intuitive, creative. Deeply emotional, empathic. Drawn to art, music, healing.',
    challenges: 'Can be moody, impressionable, difficulty with boundaries',
  },
  {
    id: 'fire',
    name: 'Fire Hand',
    element: 'Fire',
    traits: 'Long palm, short fingers, warm skin',
    personality: 'Energetic, charismatic, bold. Natural leader. Acts on instinct. Loves adventure and challenge.',
    challenges: 'Can be impulsive, impatient, insensitive to others\' feelings',
  },
]

// ── Finger Analysis ──────────────────────────────────────────────
export const FINGERS = [
  {
    id: 'thumb',
    name: 'Thumb',
    planet: 'Venus / personal will',
    meaning: 'Willpower, logic, determination. The thumb is the most important digit.',
    analysis: [
      { aspect: 'Large', meaning: 'Strong will, leadership, dominant personality' },
      { aspect: 'Small', meaning: 'More yielding, diplomatic, follows rather than leads' },
      { aspect: 'Flexible (bends back)', meaning: 'Adaptable, generous, easy-going' },
      { aspect: 'Stiff (doesn\'t bend)', meaning: 'Stubborn, determined, careful with resources' },
    ],
  },
  {
    id: 'index',
    name: 'Index Finger (Jupiter)',
    planet: 'Jupiter',
    meaning: 'Ambition, self-confidence, leadership, ego',
    analysis: [
      { aspect: 'Long (reaches middle of top phalange of middle finger)', meaning: 'Ambitious, confident, desire to lead' },
      { aspect: 'Short', meaning: 'Low self-esteem, avoids responsibility' },
      { aspect: 'Equal to ring finger', meaning: 'Balanced ambition and creativity' },
    ],
  },
  {
    id: 'middle',
    name: 'Middle Finger (Saturn)',
    planet: 'Saturn',
    meaning: 'Responsibility, boundaries, discipline, sense of right and wrong',
    analysis: [
      { aspect: 'Long', meaning: 'Serious, solitary, philosophical, can be melancholic' },
      { aspect: 'Short', meaning: 'Carefree, dislikes rules, spontaneous' },
      { aspect: 'Leans toward index', meaning: 'Ambitious discipline — uses structure to achieve goals' },
      { aspect: 'Leans toward ring', meaning: 'Creative discipline — structured approach to art' },
    ],
  },
  {
    id: 'ring',
    name: 'Ring Finger (Apollo)',
    planet: 'Sun / Apollo',
    meaning: 'Creativity, expression, desire for recognition, risk-taking',
    analysis: [
      { aspect: 'Long (longer than index)', meaning: 'Creative, expressive, comfortable with risk, may gamble' },
      { aspect: 'Short', meaning: 'Risk-averse, prefers security over adventure' },
      { aspect: 'Equal to index', meaning: 'Well-balanced between ambition and creativity' },
    ],
  },
  {
    id: 'pinky',
    name: 'Little Finger (Mercury)',
    planet: 'Mercury',
    meaning: 'Communication, sexuality, business, healing ability',
    analysis: [
      { aspect: 'Long (reaches top phalange of ring finger)', meaning: 'Articulate, persuasive, strong communicator' },
      { aspect: 'Short', meaning: 'Shy, difficulty expressing self, especially sexually' },
      { aspect: 'Set low on palm', meaning: 'Childhood challenges, delayed emotional maturity' },
      { aspect: 'Crooked', meaning: 'Shrewdness, clever in business, possible deceptiveness' },
    ],
  },
]

// ── Special Markings ─────────────────────────────────────────────
export const SPECIAL_MARKINGS = [
  { id: 'star', name: 'Star', meaning: 'Sudden event — positive on most mounts, negative on Saturn' },
  { id: 'cross', name: 'Cross', meaning: 'Obstacle or turning point — context dependent on location' },
  { id: 'island', name: 'Island', meaning: 'Period of weakness, stress, or divided energy on that line' },
  { id: 'square', name: 'Square', meaning: 'Protection — shields the area from negative influences' },
  { id: 'triangle', name: 'Triangle', meaning: 'Talent, intellectual achievement — positive on any mount' },
  { id: 'grille', name: 'Grille', meaning: 'Scattered energy, confusion, or overindulgence in that area' },
  { id: 'trident', name: 'Trident', meaning: 'Triple blessing — extremely auspicious wherever found' },
  { id: 'circle', name: 'Circle', meaning: 'Rare — fame and distinction when found on mounts' },
]

// ── Dominant Hand ────────────────────────────────────────────────
export const DOMINANT_HAND_INFO = {
  dominant: 'Shows your conscious self — the life you are building, your active choices, public persona',
  nondominant: 'Shows your subconscious self — inherited traits, potential, inner truth, what you were born with',
  both: 'Comparing both hands reveals the gap between inherited potential (non-dominant) and lived reality (dominant)',
}

// ── Specular Highlight Detection ─────────────────────────────────
/**
 * Analyzes an image for specular highlights (bright reflections)
 * that interfere with palm line visibility.
 * Returns { score: 0-100, hotspots: [{x,y,r}], pass: boolean }
 */
export function detectSpecularHighlights(imageData, width, height) {
  const data = imageData.data
  const hotspots = []
  const blockSize = 16
  let brightCount = 0
  let totalBlocks = 0

  for (let by = 0; by < height; by += blockSize) {
    for (let bx = 0; bx < width; bx += blockSize) {
      let blockBright = 0
      let blockPixels = 0

      for (let y = by; y < Math.min(by + blockSize, height); y++) {
        for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
          const i = (y * width + x) * 4
          const r = data[i], g = data[i + 1], b = data[i + 2]
          // Luminance
          const lum = 0.299 * r + 0.587 * g + 0.114 * b
          // Specular = high luminance + low saturation (whitish bright spots)
          const max = Math.max(r, g, b)
          const min = Math.min(r, g, b)
          const sat = max === 0 ? 0 : (max - min) / max
          if (lum > 220 && sat < 0.15) blockBright++
          blockPixels++
        }
      }

      totalBlocks++
      const brightRatio = blockBright / blockPixels
      if (brightRatio > 0.5) {
        brightCount++
        hotspots.push({
          x: bx + blockSize / 2,
          y: by + blockSize / 2,
          r: blockSize / 2,
          intensity: brightRatio,
        })
      }
    }
  }

  const score = Math.round((brightCount / totalBlocks) * 100)
  return {
    score,
    hotspots,
    pass: score < 15, // Less than 15% bright blocks = acceptable
    message: score < 5
      ? 'Excellent lighting — minimal reflections'
      : score < 15
        ? 'Acceptable — minor highlights detected'
        : score < 30
          ? 'Warning — significant glare detected. Consider repositioning light source.'
          : 'Poor — excessive specular highlights. Retake photo in diffused lighting.',
  }
}

// ── Skin tone detection (for overlay contrast) ───────────────────
export function detectSkinTone(imageData, width, height) {
  const data = imageData.data
  let rSum = 0, gSum = 0, bSum = 0, count = 0
  // Sample center region (40% of image)
  const cx = width * 0.3, cy = height * 0.3
  const cw = width * 0.4, ch = height * 0.4

  for (let y = cy; y < cy + ch; y += 4) {
    for (let x = cx; x < cx + cw; x += 4) {
      const i = (Math.floor(y) * width + Math.floor(x)) * 4
      const r = data[i], g = data[i + 1], b = data[i + 2]
      // Basic skin tone filter (excludes background)
      if (r > 60 && g > 40 && b > 20 && r > g && (r - g) > 10 && r < 250) {
        rSum += r; gSum += g; bSum += b; count++
      }
    }
  }

  if (count === 0) return { r: 180, g: 140, b: 110, isDark: false }
  const avg = { r: rSum / count, g: gSum / count, b: bSum / count }
  avg.isDark = (0.299 * avg.r + 0.587 * avg.g + 0.114 * avg.b) < 130
  return avg
}

// ── Build AI Analysis Prompt ─────────────────────────────────────
/**
 * Constructs a comprehensive prompt for Claude to analyze a palm image.
 * The AI receives the image + this structured prompt and returns
 * a JSON reading covering all palmistry areas.
 */
export function buildPalmReadingPrompt(dominantHand = 'right', userProfile = null) {
  const profileContext = userProfile
    ? `The subject was born on ${userProfile.dob || 'unknown date'}` +
      (userProfile.name ? `, name: ${userProfile.name}` : '') +
      (userProfile.gender ? `, gender: ${userProfile.gender}` : '') + '.'
    : ''

  return `You are an expert palmist performing a comprehensive palm reading from this uploaded image.
This is the subject's ${dominantHand === 'right' ? 'RIGHT (dominant)' : 'LEFT (non-dominant)'} hand.
${profileContext}

Analyze the palm image carefully and provide a detailed reading in the following JSON format.
For each line and feature, describe what you observe and its interpretation.
Be specific about the visual characteristics you see (length, depth, curvature, breaks, branches, markings).

Return ONLY valid JSON with this structure:
{
  "handShape": {
    "type": "earth|air|water|fire",
    "description": "Describe the palm shape and finger proportions you observe",
    "elementalAffinity": "Brief personality summary based on hand shape"
  },
  "majorLines": {
    "lifeLine": {
      "observed": "Describe what you see — length, depth, curvature, breaks, branches",
      "interpretation": "What this pattern suggests about vitality and life path",
      "strength": 1-10
    },
    "heartLine": {
      "observed": "Describe what you see",
      "interpretation": "What this suggests about emotional life and relationships",
      "strength": 1-10
    },
    "headLine": {
      "observed": "Describe what you see",
      "interpretation": "What this suggests about thinking style and intellect",
      "strength": 1-10
    },
    "fateLine": {
      "observed": "Describe what you see (or 'not clearly visible')",
      "interpretation": "What this suggests about life direction and career",
      "strength": 1-10
    }
  },
  "minorLines": {
    "sunLine": { "present": true/false, "observed": "...", "interpretation": "..." },
    "mercuryLine": { "present": true/false, "observed": "...", "interpretation": "..." },
    "marriageLines": { "count": 0-3, "observed": "...", "interpretation": "..." },
    "intuitionLine": { "present": true/false, "observed": "...", "interpretation": "..." },
    "girdleOfVenus": { "present": true/false, "observed": "...", "interpretation": "..." },
    "braceletLines": { "count": 1-3, "observed": "...", "interpretation": "..." }
  },
  "mounts": {
    "jupiter": { "prominence": "flat|moderate|prominent", "interpretation": "..." },
    "saturn": { "prominence": "flat|moderate|prominent", "interpretation": "..." },
    "apollo": { "prominence": "flat|moderate|prominent", "interpretation": "..." },
    "mercury": { "prominence": "flat|moderate|prominent", "interpretation": "..." },
    "venus": { "prominence": "flat|moderate|prominent", "interpretation": "..." },
    "luna": { "prominence": "flat|moderate|prominent", "interpretation": "..." },
    "mars": { "prominence": "flat|moderate|prominent", "interpretation": "..." }
  },
  "fingers": {
    "thumb": { "observed": "...", "interpretation": "..." },
    "index": { "observed": "...", "interpretation": "..." },
    "middle": { "observed": "...", "interpretation": "..." },
    "ring": { "observed": "...", "interpretation": "..." },
    "pinky": { "observed": "...", "interpretation": "..." }
  },
  "specialMarkings": [
    { "type": "star|cross|island|square|triangle|grille|trident|circle", "location": "where found", "interpretation": "..." }
  ],
  "synthesis": {
    "dominantElement": "earth|air|water|fire",
    "keyThemes": ["theme1", "theme2", "theme3"],
    "strengths": ["strength1", "strength2", "strength3"],
    "challenges": ["challenge1", "challenge2"],
    "lifePath": "A 2-3 sentence synthesis of the overall palm reading — the narrative that emerges when all features are read together",
    "advice": "Practical guidance based on the reading"
  }
}`
}

// ── Report Sections (for PDF generation) ─────────────────────────
export const REPORT_SECTIONS = [
  'Hand Shape & Element',
  'Life Line',
  'Heart Line',
  'Head Line',
  'Fate Line',
  'Minor Lines',
  'Mounts of the Palm',
  'Finger Analysis',
  'Special Markings',
  'Synthesis & Life Path',
]

export default {
  MAJOR_LINES,
  MINOR_LINES,
  MOUNTS,
  HAND_SHAPES,
  FINGERS,
  SPECIAL_MARKINGS,
  DOMINANT_HAND_INFO,
  REPORT_SECTIONS,
  detectSpecularHighlights,
  detectSkinTone,
  buildPalmReadingPrompt,
}
