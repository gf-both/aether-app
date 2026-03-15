/* ============================================================
   CLASSICAL MAYAN CALENDAR ENGINE
   Uses the GMT correlation constant: 584283
   Reference: Thompson (1950), Goodman-Martinez-Thompson
   Computes Tzolkin, Haab, Long Count, and related values
   from any Gregorian date.
   ============================================================ */

const GMT = 584283 // Julian Day Number correlation constant

// ---- Tzolkin: 20 Day Signs ----
export const TZOLKIN_DAY_SIGNS = [
  {
    index: 0, name: 'Imix', meaning: 'Primordial Waters',
    description: 'The energy of the primordial sea, the first light of creation. Associated with birth, nurturing, and the cosmic source.',
    color: 'red', direction: 'East', element: 'Water',
  },
  {
    index: 1, name: 'Ik', meaning: 'Wind / Spirit',
    description: 'The breath of life, wind and spirit. Represents communication, truth, and the invisible forces that animate the world.',
    color: 'white', direction: 'North', element: 'Air',
  },
  {
    index: 2, name: 'Akbal', meaning: 'Night / Darkness',
    description: 'The deep night, the underworld, and sacred fire. Associated with dreaming, intuition, and hidden knowledge.',
    color: 'blue', direction: 'West', element: 'Fire',
  },
  {
    index: 3, name: 'Kan', meaning: 'Seed / Corn',
    description: 'The seed of life and abundance. Represents fertility, growth, sexual energy, and the potential of creation.',
    color: 'yellow', direction: 'South', element: 'Earth',
  },
  {
    index: 4, name: 'Chicchan', meaning: 'Serpent',
    description: 'The feathered serpent, kundalini life force. Represents sexuality, vitality, and the awakening of primal energy.',
    color: 'red', direction: 'East', element: 'Fire',
  },
  {
    index: 5, name: 'Cimi', meaning: 'Death / Transformation',
    description: 'Death as transformation and renewal. Associated with endings that create new beginnings, sacrifice, and rebirth.',
    color: 'white', direction: 'North', element: 'Air',
  },
  {
    index: 6, name: 'Manik', meaning: 'Deer / Hand',
    description: 'The deer, symbol of the healing arts and sacrifice. Represents compassion, service, spiritual authority, and healing.',
    color: 'blue', direction: 'West', element: 'Water',
  },
  {
    index: 7, name: 'Lamat', meaning: 'Star / Venus',
    description: 'The planet Venus, the morning and evening star. Represents cycles of completion, abundance, and the seed of higher consciousness.',
    color: 'yellow', direction: 'South', element: 'Earth',
  },
  {
    index: 8, name: 'Muluc', meaning: 'Water / Rain',
    description: 'The offering, rain, and purification. Associated with emotions, divine communication, and the cleansing power of water.',
    color: 'red', direction: 'East', element: 'Water',
  },
  {
    index: 9, name: 'Oc', meaning: 'Dog / Loyalty',
    description: 'The guide of the underworld, loyal companion. Represents unconditional love, loyalty, cooperation, and the heart.',
    color: 'white', direction: 'North', element: 'Air',
  },
  {
    index: 10, name: 'Chuen', meaning: 'Monkey / Artisan',
    description: 'The divine craftsman, spider monkey of the arts. Represents creativity, play, illusion, and the weaving of time.',
    color: 'blue', direction: 'West', element: 'Fire',
  },
  {
    index: 11, name: 'Eb', meaning: 'Human / Road',
    description: 'The human path and free will. Associated with the road of life, collective consciousness, and the cornstalk of humanity.',
    color: 'yellow', direction: 'South', element: 'Earth',
  },
  {
    index: 12, name: 'Ben', meaning: 'Reed / Corn Stalk',
    description: 'The sacred corn, pillar between heaven and earth. Represents family, leadership, and the staff of authority.',
    color: 'red', direction: 'East', element: 'Earth',
  },
  {
    index: 13, name: 'Ix', meaning: 'Jaguar / Shaman',
    description: 'The jaguar, spirit of the night and earth magic. Represents the shaman, mysteries of the feminine, and the force of nature.',
    color: 'white', direction: 'North', element: 'Earth',
  },
  {
    index: 14, name: 'Men', meaning: 'Eagle / Vision',
    description: 'The eagle, highest flight of the spirit. Represents vision, wisdom, collective mind, and aspiration toward the divine.',
    color: 'blue', direction: 'West', element: 'Air',
  },
  {
    index: 15, name: 'Cib', meaning: 'Warrior / Owl',
    description: 'The cosmic warrior, owl of wisdom. Represents inner strength, forgiveness, intelligence, and evolution through challenge.',
    color: 'yellow', direction: 'South', element: 'Earth',
  },
  {
    index: 16, name: 'Caban', meaning: 'Earth / Earthquake',
    description: 'The living earth, force of movement and synchronicity. Represents the earthly mind, evolution, and resonance with the planet.',
    color: 'red', direction: 'East', element: 'Earth',
  },
  {
    index: 17, name: 'Etznab', meaning: 'Mirror / Flint',
    description: 'The obsidian mirror, the sword of truth. Represents clarity, timelessness, the hall of mirrors, and cutting through illusion.',
    color: 'white', direction: 'North', element: 'Air',
  },
  {
    index: 18, name: 'Cauac', meaning: 'Storm / Thunder',
    description: 'The thunder and lightning of transformation. Represents the final test before enlightenment, catharsis, and the purifying storm.',
    color: 'blue', direction: 'West', element: 'Water',
  },
  {
    index: 19, name: 'Ahau', meaning: 'Sun / Lord',
    description: 'The great lord and sun, the face of the divine. Represents unconditional love, enlightenment, and the completion of cycles.',
    color: 'yellow', direction: 'South', element: 'Fire',
  },
]

// ---- Tzolkin: 13 Tones (Galactic Tones) ----
export const TZOLKIN_TONES = [
  { number: 1,  name: 'Magnetic',      keyword: 'Purpose',       meaning: 'Unify. The beginning of a new cycle. Pure intent and magnetic attraction. The initiating force that draws things together.' },
  { number: 2,  name: 'Lunar',         keyword: 'Challenge',     meaning: 'Polarize. The duality that reveals what must be overcome. Challenges clarify purpose and reveal the path forward.' },
  { number: 3,  name: 'Electric',      keyword: 'Service',       meaning: 'Activate. The bonding of energy that ignites service. Creative action that connects polarities into a triad.' },
  { number: 4,  name: 'Self-Existing', keyword: 'Form',          meaning: 'Define. The self-contained, stable form. Clarity of purpose expressed through structure and definition.' },
  { number: 5,  name: 'Overtone',      keyword: 'Radiance',      meaning: 'Empower. The commanding center that empowers others. Radiant presence that allows the center to hold.' },
  { number: 6,  name: 'Rhythmic',      keyword: 'Balance',       meaning: 'Organize. The rhythm that creates balance. Organizing to achieve dynamic equilibrium and flow.' },
  { number: 7,  name: 'Resonant',      keyword: 'Attunement',    meaning: 'Channel. The mystic channel of divine inspiration. The resonance that aligns all frequencies in harmony.' },
  { number: 8,  name: 'Galactic',      keyword: 'Integrity',     meaning: 'Harmonize. The galactic integration of all parts. Integrity of being, modeling the higher harmony.' },
  { number: 9,  name: 'Solar',         keyword: 'Intention',     meaning: 'Pulse. The solar intention that realizes pulse. The forward momentum that brings vision into reality.' },
  { number: 10, name: 'Planetary',     keyword: 'Manifestation', meaning: 'Perfect. The perfect manifestation of spirit into matter. Full expression of the ten powers of creation.' },
  { number: 11, name: 'Spectral',      keyword: 'Liberation',    meaning: 'Dissolve. The spectral release of all that was built. Freedom through dissolution and liberation from form.' },
  { number: 12, name: 'Crystal',       keyword: 'Cooperation',   meaning: 'Dedicate. The crystalline cooperation of shared mind. Universal communion through dedication to the whole.' },
  { number: 13, name: 'Cosmic',        keyword: 'Presence',      meaning: 'Endure. The cosmic presence of the completed cycle. Transcendence and the wisdom of totality.' },
]

// ---- Haab: 18 Months + Wayeb ----
export const HAAB_MONTHS = [
  { index: 0,  name: 'Pop',    meaning: 'The Mat — beginning of the year, authority and leadership' },
  { index: 1,  name: 'Uo',     meaning: 'Frog — rainfall, renewal of the earth' },
  { index: 2,  name: 'Zip',    meaning: 'Red Combined — deer hunting, fishing rites' },
  { index: 3,  name: 'Zotz',   meaning: 'Bat — harvest of cacao, underworld forces' },
  { index: 4,  name: 'Tzec',   meaning: 'Sky & Earth — beekeeping, honey festivals' },
  { index: 5,  name: 'Xul',    meaning: 'Dog — completion, descent into the underworld' },
  { index: 6,  name: 'Yaxkin', meaning: 'New Sun — solstice alignment, new solar force' },
  { index: 7,  name: 'Mol',    meaning: 'Gather Together — water gathering and rainfall' },
  { index: 8,  name: 'Chen',   meaning: 'Black Storm / Cave — the moon, night, dark waters' },
  { index: 9,  name: 'Yax',    meaning: 'Green / New — spring renewal, Venus appearances' },
  { index: 10, name: 'Zac',    meaning: 'White — white frog, frog ceremonies' },
  { index: 11, name: 'Ceh',    meaning: 'Red Deer — deer hunting season' },
  { index: 12, name: 'Mac',    meaning: 'Covered / Enclosed — turtle, harvest gratitude' },
  { index: 13, name: 'Kankin', meaning: 'Yellow Sun / Dog — dry season, solar celebrations' },
  { index: 14, name: 'Muan',   meaning: 'Cloudy / Owl — rainy season approaches' },
  { index: 15, name: 'Pax',    meaning: 'Planting Time — planting festivals, war drum' },
  { index: 16, name: 'Kayab',  meaning: 'Turtle — sea turtle, lunar ceremonies' },
  { index: 17, name: 'Cumku',  meaning: 'Granary / Dark Sky — deep caves, harvest storage' },
  { index: 18, name: 'Wayeb',  meaning: 'Nameless Days — 5 unlucky days at year\'s end, danger and transition' },
]

// ---- Year Bearers ----
// The 4 Year Bearers rotate: Ik, Manik, Eb, Caban (indices 1,6,11,16)
// OR in another system: Muluc, Ix, Cauac, Kan (indices 8,13,18,3)
// Different regions used different sets. The task specifies Muluc, Ix, Cauac, Kan.
const YEAR_BEARER_SIGNS = [3, 8, 13, 18] // Kan, Muluc, Ix, Cauac (indices into TZOLKIN_DAY_SIGNS)

// ---- Convert Gregorian date to Julian Day Number ----
function gregorianToJDN(day, month, year) {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
}

// ---- Main engine function ----
/**
 * Computes a complete Classical Mayan calendar profile from a Gregorian birth date.
 * Uses the GMT correlation constant 584283.
 *
 * @param {number} day   - Day of month (1–31)
 * @param {number} month - Month (1–12)
 * @param {number} year  - Full year (e.g. 1988)
 * @returns {Object} Complete Mayan calendar profile
 */
export function getMayanProfile(day, month, year) {
  // Step 1: Gregorian → Julian Day Number
  const jdn = gregorianToJDN(day, month, year)

  // Step 2: Maya Day Number (MDN)
  const mdn = jdn - GMT

  // ---- Tzolkin ----
  // At MDN=0 (JDN=584283, Maya creation 0.0.0.0.0), the sign is 4 Ahau:
  //   Ahau = index 19, tone 4.
  // Offsets: +19 for day sign, +3 for tone, +159 for kin (since kin 160 = 4 Ahau).
  // This is consistent with the known calendar round for the creation date.
  //
  // Reference: Dec 21, 2012 = 13.0.0.0.0 = 4 Ahau 3 Kankin (verified)
  //            Aug 11, 3114 BCE (0.0.0.0.0) = 4 Ahau 8 Cumku (verified)

  // Tone 1–13 (with +3 offset so MDN=0 → tone 4)
  const tone = ((mdn + 3) % 13) + 1
  // Day sign index 0–19 (with +19 offset so MDN=0 → Ahau = index 19)
  const daySignIndex = ((mdn + 19) % 20 + 20) % 20
  // Kin number 1–260 (with +159 offset so MDN=0 → Kin 160 = 4 Ahau)
  const kinNumber = ((mdn + 159) % 260 + 260) % 260 + 1

  const daySignData = TZOLKIN_DAY_SIGNS[daySignIndex]
  const toneData = TZOLKIN_TONES[tone - 1]

  // Trecena lord: the day sign that started the current 13-day trecena
  // Step back (tone-1) days to reach the Magnetic (tone 1) start of this trecena
  const trecenaStartMdn = mdn - (tone - 1)
  const trecenaLordIndex = ((trecenaStartMdn + 19) % 20 + 20) % 20
  const trecenaLord = TZOLKIN_DAY_SIGNS[trecenaLordIndex].name

  // ---- Haab ----
  // Haab position within 365-day year
  // 0 Pop = the beginning of the Haab year at correlation epoch
  // Standard offset from MDN to Haab position: 348
  const haabPos = ((mdn + 348) % 365 + 365) % 365
  const haabMonthIndex = Math.floor(haabPos / 20)
  const haabDay = haabPos % 20
  const haabMonthData = HAAB_MONTHS[haabMonthIndex]

  // ---- Long Count ----
  // Decompose MDN into baktun.katun.tun.uinal.kin
  let remaining = mdn
  const baktun = Math.floor(remaining / 144000)
  remaining = remaining % 144000
  const katun = Math.floor(remaining / 7200)
  remaining = remaining % 7200
  const tun = Math.floor(remaining / 360)
  remaining = remaining % 360
  const uinal = Math.floor(remaining / 20)
  const kinLC = remaining % 20

  const formatted = `${baktun}.${katun}.${tun}.${uinal}.${kinLC}`

  // ---- Lord of the Night (G1–G9) ----
  // Cycles of 9 starting from creation date
  const lordOfNightNum = ((mdn % 9) + 9) % 9 + 1
  const lordOfNight = `G${lordOfNightNum}`

  // ---- Year Bearer ----
  // Year Bearers: Kan (3), Muluc (8), Ix (13), Cauac (18) — the 4 signs that can begin a new year
  // The Haab new year (0 Pop) always falls on one of these 4 signs.
  // Find the year bearer by looking at the sign on 0 Pop of the current Haab year
  // 0 Pop of the current Haab year: step back haabDay days and then to the start of the current month
  const yearStartMdn = mdn - haabPos // MDN of 0 Pop of current year
  const yearStartSignIndex = ((yearStartMdn % 20) + 20) % 20
  const yearStartTone = ((yearStartMdn % 13) + 13) % 13 + 1
  const yearBearerSign = TZOLKIN_DAY_SIGNS[yearStartSignIndex].name

  return {
    tzolkin: {
      daySign: daySignData.name,
      daySignIndex,
      tone,
      toneName: toneData.name,
      toneKeyword: toneData.keyword,
      kinNumber,
      daySignMeaning: daySignData.meaning,
      daySignDescription: daySignData.description,
      toneMeaning: toneData.meaning,
      daySignColor: daySignData.color,
      daySignDirection: daySignData.direction,
    },
    haab: {
      month: haabMonthData.name,
      monthIndex: haabMonthIndex,
      day: haabDay,
      monthMeaning: haabMonthData.meaning,
      formatted: `${haabDay} ${haabMonthData.name}`,
    },
    longCount: {
      baktun,
      katun,
      tun,
      uinal,
      kin: kinLC,
      formatted,
    },
    yearBearer: {
      daySign: yearBearerSign,
      tone: yearStartTone,
      formatted: `${yearBearerSign} ${yearStartTone}`,
    },
    lordOfNight,
    trecenaLord,
    rawMDN: mdn,
    jdn,
  }
}

// ---- Convenience: get full sign and tone objects by name/number ----
export function getDaySignByName(name) {
  return TZOLKIN_DAY_SIGNS.find(s => s.name === name) || null
}

export function getToneByNumber(num) {
  return TZOLKIN_TONES.find(t => t.number === num) || null
}

export function getHaabMonthByName(name) {
  return HAAB_MONTHS.find(m => m.name === name) || null
}
