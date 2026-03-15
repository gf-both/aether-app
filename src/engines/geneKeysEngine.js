/**
 * geneKeysEngine.js
 *
 * Derives a person's Gene Keys Hologenetic Profile (Activation Sequence)
 * from birth data using the same Mandala / gate calculation as Human Design.
 *
 * The 4 core spheres:
 *   Life's Work = Personality Sun  gate + line
 *   Evolution   = Personality Earth gate + line  (Sun longitude + 180°)
 *   Radiance    = Design Sun  gate + line         (Sun position 88° before birth)
 *   Purpose     = Design Earth gate + line        (Design Sun longitude + 180°)
 */

// ─── Gene Keys full dataset (all 64) ────────────────────────────────────────
const GENE_KEYS_DATA = {
  1:  { shadow: 'Entropy',          gift: 'Freshness',       siddhi: 'Beauty',           iching: 'The Creative' },
  2:  { shadow: 'Dislocation',      gift: 'Orientation',     siddhi: 'Unity',            iching: 'The Receptive' },
  3:  { shadow: 'Chaos',            gift: 'Innovation',      siddhi: 'Innocence',        iching: 'Difficulty at the Beginning' },
  4:  { shadow: 'Intolerance',      gift: 'Understanding',   siddhi: 'Forgiveness',      iching: 'Youthful Folly' },
  5:  { shadow: 'Impatience',       gift: 'Patience',        siddhi: 'Timelessness',     iching: 'Waiting' },
  6:  { shadow: 'Conflict',         gift: 'Diplomacy',       siddhi: 'Peace',            iching: 'Conflict' },
  7:  { shadow: 'Division',         gift: 'Guidance',        siddhi: 'Virtue',           iching: 'The Army' },
  8:  { shadow: 'Mediocrity',       gift: 'Style',           siddhi: 'Exquisiteness',    iching: 'Holding Together' },
  9:  { shadow: 'Inertia',          gift: 'Determination',   siddhi: 'Invincibility',    iching: 'The Taming Power of the Small' },
  10: { shadow: 'Self-Obsession',   gift: 'Naturalness',     siddhi: 'Being',            iching: 'Treading' },
  11: { shadow: 'Obscurity',        gift: 'Idealism',        siddhi: 'Light',            iching: 'Peace' },
  12: { shadow: 'Vanity',           gift: 'Discrimination',  siddhi: 'Purity',           iching: 'Standstill' },
  13: { shadow: 'Discord',          gift: 'Empathy',         siddhi: 'Cosmic Memory',    iching: 'Fellowship' },
  14: { shadow: 'Compromise',       gift: 'Competence',      siddhi: 'Bounteousness',    iching: 'Possession in Great Measure' },
  15: { shadow: 'Dullness',         gift: 'Magnetism',       siddhi: 'Florescence',      iching: 'Modesty' },
  16: { shadow: 'Indifference',     gift: 'Versatility',     siddhi: 'Mastery',          iching: 'Enthusiasm' },
  17: { shadow: 'Opinion',          gift: 'Far-Sightedness', siddhi: 'Omniscience',      iching: 'Following' },
  18: { shadow: 'Judgment',         gift: 'Integrity',       siddhi: 'Perfection',       iching: 'Work on What Has Been Spoiled' },
  19: { shadow: 'Co-Dependence',    gift: 'Sensitivity',     siddhi: 'Sacrifice',        iching: 'Approach' },
  20: { shadow: 'Superficiality',   gift: 'Self-Assurance',  siddhi: 'Presence',         iching: 'Contemplation' },
  21: { shadow: 'Control',          gift: 'Authority',       siddhi: 'Valour',           iching: 'Biting Through' },
  22: { shadow: 'Dishonour',        gift: 'Graciousness',    siddhi: 'Grace',            iching: 'Grace' },
  23: { shadow: 'Complexity',       gift: 'Simplicity',      siddhi: 'Quintessence',     iching: 'Splitting Apart' },
  24: { shadow: 'Addiction',        gift: 'Invention',       siddhi: 'Silence',          iching: 'Return' },
  25: { shadow: 'Constriction',     gift: 'Acceptance',      siddhi: 'Universal Love',   iching: 'Innocence' },
  26: { shadow: 'Pride',            gift: 'Artfulness',      siddhi: 'Invisibility',     iching: 'The Taming Power of the Great' },
  27: { shadow: 'Selfishness',      gift: 'Altruism',        siddhi: 'Selflessness',     iching: 'Nourishment' },
  28: { shadow: 'Purposelessness',  gift: 'Totality',        siddhi: 'Immortality',      iching: 'Preponderance of the Great' },
  29: { shadow: 'Half-Heartedness', gift: 'Commitment',      siddhi: 'Devotion',         iching: 'The Abysmal' },
  30: { shadow: 'Desire',           gift: 'Lightness',       siddhi: 'Rapture',          iching: 'The Clinging' },
  31: { shadow: 'Arrogance',        gift: 'Leadership',      siddhi: 'Humility',         iching: 'Influence' },
  32: { shadow: 'Failure',          gift: 'Preservation',    siddhi: 'Veneration',       iching: 'Duration' },
  33: { shadow: 'Forgetting',       gift: 'Mindfulness',     siddhi: 'Revelation',       iching: 'Retreat' },
  34: { shadow: 'Force',            gift: 'Strength',        siddhi: 'Majesty',          iching: 'The Power of the Great' },
  35: { shadow: 'Hunger',           gift: 'Adventure',       siddhi: 'Boundlessness',    iching: 'Progress' },
  36: { shadow: 'Turbulence',       gift: 'Humanity',        siddhi: 'Compassion',       iching: 'Darkening of the Light' },
  37: { shadow: 'Weakness',         gift: 'Equality',        siddhi: 'Tenderness',       iching: 'The Family' },
  38: { shadow: 'Struggle',         gift: 'Perseverance',    siddhi: 'Honour',           iching: 'Opposition' },
  39: { shadow: 'Provocation',      gift: 'Dynamism',        siddhi: 'Liberation',       iching: 'Obstruction' },
  40: { shadow: 'Exhaustion',       gift: 'Resolve',         siddhi: 'Divine Will',      iching: 'Deliverance' },
  41: { shadow: 'Fantasy',          gift: 'Anticipation',    siddhi: 'Emanation',        iching: 'Decrease' },
  42: { shadow: 'Expectation',      gift: 'Detachment',      siddhi: 'Celebration',      iching: 'Increase' },
  43: { shadow: 'Deafness',         gift: 'Insight',         siddhi: 'Epiphany',         iching: 'Breakthrough' },
  44: { shadow: 'Interference',     gift: 'Teamwork',        siddhi: 'Synarchy',         iching: 'Coming to Meet' },
  45: { shadow: 'Dominance',        gift: 'Synergy',         siddhi: 'Communion',        iching: 'Gathering Together' },
  46: { shadow: 'Seriousness',      gift: 'Delight',         siddhi: 'Ecstasy',          iching: 'Pushing Upward' },
  47: { shadow: 'Oppression',       gift: 'Transmutation',   siddhi: 'Transfiguration',  iching: 'Exhaustion' },
  48: { shadow: 'Inadequacy',       gift: 'Resourcefulness', siddhi: 'Wisdom',           iching: 'The Well' },
  49: { shadow: 'Reaction',         gift: 'Revolution',      siddhi: 'Rebirth',          iching: 'Revolution' },
  50: { shadow: 'Corruption',       gift: 'Equilibrium',     siddhi: 'Harmony',          iching: 'The Cauldron' },
  51: { shadow: 'Agitation',        gift: 'Initiative',      siddhi: 'Awakening',        iching: 'The Arousing' },
  52: { shadow: 'Stress',           gift: 'Restraint',       siddhi: 'Stillness',        iching: 'Keeping Still' },
  53: { shadow: 'Immaturity',       gift: 'Expansion',       siddhi: 'Superabundance',   iching: 'Development' },
  54: { shadow: 'Greed',            gift: 'Aspiration',      siddhi: 'Ascension',        iching: 'The Marrying Maiden' },
  55: { shadow: 'Victimisation',    gift: 'Freedom',         siddhi: 'Freedom',          iching: 'Abundance' },
  56: { shadow: 'Distraction',      gift: 'Enrichment',      siddhi: 'Intoxication',     iching: 'The Wanderer' },
  57: { shadow: 'Unease',           gift: 'Intuition',       siddhi: 'Clarity',          iching: 'The Gentle' },
  58: { shadow: 'Dissatisfaction',  gift: 'Vitality',        siddhi: 'Bliss',            iching: 'The Joyous' },
  59: { shadow: 'Dishonesty',       gift: 'Intimacy',        siddhi: 'Transparency',     iching: 'Dispersion' },
  60: { shadow: 'Limitation',       gift: 'Realism',         siddhi: 'Justice',          iching: 'Limitation' },
  61: { shadow: 'Psychosis',        gift: 'Inspiration',     siddhi: 'Sanctity',         iching: 'Inner Truth' },
  62: { shadow: 'Intellect',        gift: 'Precision',       siddhi: 'Impeccability',    iching: 'Preponderance of the Small' },
  63: { shadow: 'Doubt',            gift: 'Inquiry',         siddhi: 'Truth',            iching: 'After Completion' },
  64: { shadow: 'Confusion',        gift: 'Imagination',     siddhi: 'Illumination',     iching: 'Before Completion' },
}

// ─── Mandala gate sequence (same as Human Design) ───────────────────────────
// Gate 41 starts at Capricorn 0° (270° ecliptic), each gate = 5.625° (360/64)
const GATE_SEQUENCE = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42,  3,
  27, 24,  2, 23,  8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33,  7,  4, 29, 59, 40, 64, 47,  6, 46, 18, 48, 57, 32, 50,
  28, 44,  1, 43, 14, 34,  9,  5, 26, 11, 10, 58, 38, 54, 61, 60,
]

// Gate 41 starts at Capricorn 0°.
// Empirically verified offset: 302° (ecliptic longitude where Gate 41 begins).
// This constant ensures the gate sequence maps correctly for known birth data.
const HD_OFFSET = 302

/**
 * Convert a Julian Day Number to Julian centuries since J2000.0
 */
function jdToJulianCenturies(jd) {
  return (jd - 2451545.0) / 36525.0
}

/**
 * Compute Julian Day from UTC calendar date/time.
 * Uses standard Julian Day algorithm valid for any date.
 */
function julianDay(year, month, day, hour, minute, second = 0) {
  const utHour = hour + minute / 60 + second / 3600
  let y = year
  let m = month
  if (m <= 2) { y -= 1; m += 12 }
  const A = Math.floor(y / 100)
  const B = 2 - A + Math.floor(A / 4)
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + utHour / 24 + B - 1524.5
}

/**
 * Low-precision Sun longitude (ecliptic, degrees).
 * Accurate to ~0.01° — sufficient for gate/line calculation.
 * Uses Jean Meeus "Astronomical Algorithms" Ch.25 (low-accuracy formula).
 */
function sunLongitude(jd) {
  const T = jdToJulianCenturies(jd)

  // Geometric mean longitude of the Sun (degrees)
  const L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360

  // Mean anomaly of the Sun (degrees)
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360
  const Mr = M * Math.PI / 180

  // Equation of centre
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr)

  // Sun's true longitude
  const sunLon = L0 + C

  // Apparent longitude (apply nutation/aberration approximation)
  const omega = 125.04 - 1934.136 * T
  const apparent = sunLon - 0.00569 - 0.00478 * Math.sin(omega * Math.PI / 180)

  return ((apparent % 360) + 360) % 360
}

/**
 * Map an ecliptic longitude to a Gene Keys gate + line.
 *
 * The Mandala places Gate 41 at the Capricorn ingress (270°).
 * Each gate spans 5.625° (360/64), each line spans 0.9375° (5.625/6).
 *
 * Returns { gate: number, line: number }
 */
function longitudeToGateLine(longitude) {
  // Rotate so Gate 41's start aligns with 0°
  let adjusted = ((longitude - HD_OFFSET) % 360 + 360) % 360

  // Each gate = 5.625°
  const gateSize = 360 / 64
  const lineSize = gateSize / 6

  const gateIndex = Math.floor(adjusted / gateSize)
  const gate = GATE_SEQUENCE[gateIndex]

  const withinGate = adjusted - gateIndex * gateSize
  const line = Math.floor(withinGate / lineSize) + 1  // lines 1-6

  return { gate, line: Math.min(line, 6) }
}

/**
 * Get the opposite longitude (Earth position = Sun + 180°, normalised 0-360).
 */
function opposite(longitude) {
  return (longitude + 180) % 360
}

/**
 * Derive the Gene Keys Hologenetic Profile (Activation Sequence) from birth data.
 *
 * @param {Object} params
 * @param {number} params.day       - Day of birth (1-31)
 * @param {number} params.month     - Month of birth (1-12)
 * @param {number} params.year      - Year of birth
 * @param {number} params.hour      - Hour of birth (0-23, local time)
 * @param {number} params.minute    - Minute of birth (0-59)
 * @param {number} [params.timezone=0] - UTC offset in hours (e.g. -3 for Buenos Aires)
 * @returns {Object} Hologenetic profile
 */
export function getGeneKeysProfile({ day, month, year, hour, minute, timezone = 0 }) {
  // Convert local time to UTC
  const utcHour = hour - timezone
  let utcDay = day
  let utcMonth = month
  let utcYear = year

  // Handle day rollover
  const totalHours = hour * 60 + minute
  const utcTotalMinutes = totalHours - timezone * 60

  let utcMinute = minute
  let adjHour = hour - timezone

  if (adjHour < 0) {
    adjHour += 24
    // Subtract a day
    const d = new Date(Date.UTC(year, month - 1, day))
    d.setUTCDate(d.getUTCDate() - 1)
    utcDay = d.getUTCDate()
    utcMonth = d.getUTCMonth() + 1
    utcYear = d.getUTCFullYear()
  } else if (adjHour >= 24) {
    adjHour -= 24
    // Add a day
    const d = new Date(Date.UTC(year, month - 1, day))
    d.setUTCDate(d.getUTCDate() + 1)
    utcDay = d.getUTCDate()
    utcMonth = d.getUTCMonth() + 1
    utcYear = d.getUTCFullYear()
  }

  // 1. Personality Sun (birth moment in UTC)
  const jdBirth = julianDay(utcYear, utcMonth, utcDay, adjHour, utcMinute)
  const personalitySunLon = sunLongitude(jdBirth)

  // 2. Design Sun = Personality Sun longitude minus 88° of ecliptic arc.
  //    In Human Design / Gene Keys, the Design is calculated by going back 88°
  //    of solar arc (approximately 88 days, but the arc is what matters).
  //    Subtracting 88° directly from the ecliptic longitude is the standard
  //    approach used by HD software and produces the correct gate/line.
  const designSunLon = ((personalitySunLon - 88) % 360 + 360) % 360

  // 3. Map to gates + lines
  const lifesWork = longitudeToGateLine(personalitySunLon)   // Personality Sun
  const evolutionLon = opposite(personalitySunLon)
  const evolution = longitudeToGateLine(evolutionLon)        // Personality Earth

  const radiance = longitudeToGateLine(designSunLon)         // Design Sun
  const purposeLon = opposite(designSunLon)
  const purpose = longitudeToGateLine(purposeLon)            // Design Earth

  // 4. Enrich with Gene Keys data
  function enrich({ gate, line }) {
    const gk = GENE_KEYS_DATA[gate] || {}
    return {
      gate,
      line,
      shadow: gk.shadow || '',
      gift: gk.gift || '',
      siddhi: gk.siddhi || '',
      iching: gk.iching || '',
    }
  }

  return {
    spheres: {
      lifesWork: enrich(lifesWork),
      evolution: enrich(evolution),
      radiance:  enrich(radiance),
      purpose:   enrich(purpose),
    },
    activationSequence: [lifesWork.gate, evolution.gate, radiance.gate, purpose.gate],
    codonRing: null,
    // Debug: raw longitudes (useful for validation)
    _debug: {
      personalitySunLon,
      evolutionLon,
      designSunLon,
      purposeLon,
      jdBirth,
    },
  }
}

// Export raw data for other modules
export { GENE_KEYS_DATA }
