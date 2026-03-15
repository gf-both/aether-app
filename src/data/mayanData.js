/* ============================================================
   DREAMSPELL MAYAN CALENDAR ENGINE
   Based on Jose Arguelles' Dreamspell system
   Reference: July 26, 1987 = Kin 34 (Harmonic Convergence year)
   Rule: Feb 29 does NOT advance the kin (Dreamspell "0.0 Hunab Ku" day)
   ============================================================ */

function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}

function countFeb29s(d1, d2) {
  // Count Feb 29 dates strictly after d1 and on or before d2 (d1 < d2)
  let count = 0
  for (let y = d1.getFullYear(); y <= d2.getFullYear(); y++) {
    if (isLeapYear(y)) {
      const f = new Date(y, 1, 29)
      if (f > d1 && f <= d2) count++
    }
  }
  return count
}

export function computeDreamspellKin(year, month, day) {
  // Feb 29 gets same kin as Feb 28
  if (month === 2 && day === 29) day = 28
  const REF = new Date(1987, 6, 26) // Jul 26 1987
  const REF_KIN = 34
  const target = new Date(year, month - 1, day)
  const calDays = Math.round((target - REF) / 86400000)
  const feb29s = calDays >= 0 ? countFeb29s(REF, target) : countFeb29s(target, REF)
  const dsDays = calDays >= 0 ? calDays - feb29s : calDays + feb29s
  return ((REF_KIN - 1 + dsDays) % 260 + 260) % 260 + 1
}

export function getSealFromKin(kin) { return ((kin - 1) % 20) + 1 }
export function getToneFromKin(kin) { return ((kin - 1) % 13) + 1 }

function kinFromSealTone(seal, tone) {
  // Chinese Remainder Theorem: x = (seal-1) mod 20, x = (tone-1) mod 13
  const s = seal - 1, t = tone - 1
  const diff = ((t - s) % 13 + 13) % 13
  const k = (diff * 2) % 13 // 7^(-1) mod 13 = 2
  return s + 20 * k + 1
}

// Guide seal offset indexed by tone (1-13)
const GUIDE_OFFSETS = [0, 12, 4, 16, 8, 0, 12, 4, 16, 8, 0, 12, 4]

export function getGuideKin(kin) {
  const seal = getSealFromKin(kin), tone = getToneFromKin(kin)
  const gSeal = ((seal - 1 + GUIDE_OFFSETS[tone - 1]) % 20) + 1
  return kinFromSealTone(gSeal, tone)
}
export function getAnalogKin(kin) {
  const seal = getSealFromKin(kin), tone = getToneFromKin(kin)
  const aSeal = 21 - seal
  return kinFromSealTone(aSeal > 20 ? aSeal - 20 : aSeal, tone)
}
export function getAntipodeKin(kin) {
  const seal = getSealFromKin(kin), tone = getToneFromKin(kin)
  return kinFromSealTone(((seal - 1 + 10) % 20) + 1, tone)
}
export function getOccultKin(kin) { return 261 - kin }

export function getWavespell(kin) {
  const ws = Math.ceil(kin / 13)
  const startKin = (ws - 1) * 13 + 1
  return { number: ws, startKin, sealNum: getSealFromKin(startKin) }
}
export function getCastleNum(kin) { return Math.ceil(Math.ceil(kin / 13) / 4) }

/* ---- 20 Solar Seals ---- */
export const DREAMSPELL_SEALS = [
  { num: 1,  name: 'Dragon',        mayanName: 'Imix',     color: 'red',    glyph: '\u{1F40A}', action: 'Nurtures',    power: 'Birth',            essence: 'Being',          direction: 'East',  earthFamily: 'Cardinal', col: '#cc3333' },
  { num: 2,  name: 'Wind',          mayanName: 'Ik',       color: 'white',  glyph: '\u{1F32C}', action: 'Communicates',power: 'Spirit',           essence: 'Breath',         direction: 'North', earthFamily: 'Core',     col: '#d0d0d0' },
  { num: 3,  name: 'Night',         mayanName: 'Akbal',    color: 'blue',   glyph: '\u{1F30C}', action: 'Dreams',      power: 'Abundance',        essence: 'Intuition',      direction: 'West',  earthFamily: 'Signal',   col: '#3366aa' },
  { num: 4,  name: 'Seed',          mayanName: 'Kan',      color: 'yellow', glyph: '\u{1F331}', action: 'Targets',     power: 'Flowering',        essence: 'Awareness',      direction: 'South', earthFamily: 'Gateway',  col: '#ccaa22' },
  { num: 5,  name: 'Serpent',       mayanName: 'Chicchan', color: 'red',    glyph: '\u{1F40D}', action: 'Survives',    power: 'Life Force',       essence: 'Instinct',       direction: 'East',  earthFamily: 'Polar',    col: '#cc3333' },
  { num: 6,  name: 'World-Bridger', mayanName: 'Cimi',     color: 'white',  glyph: '\u{1F480}', action: 'Equalizes',   power: 'Death',            essence: 'Opportunity',    direction: 'North', earthFamily: 'Cardinal', col: '#d0d0d0' },
  { num: 7,  name: 'Hand',          mayanName: 'Manik',    color: 'blue',   glyph: '\u{1F91A}', action: 'Knows',       power: 'Accomplishment',   essence: 'Healing',        direction: 'West',  earthFamily: 'Core',     col: '#3366aa' },
  { num: 8,  name: 'Star',          mayanName: 'Lamat',    color: 'yellow', glyph: '\u{2B50}',  action: 'Beautifies',  power: 'Elegance',         essence: 'Art',            direction: 'South', earthFamily: 'Signal',   col: '#ddb833' },
  { num: 9,  name: 'Moon',          mayanName: 'Muluc',    color: 'red',    glyph: '\u{1F4A7}', action: 'Purifies',    power: 'Universal Water',  essence: 'Flow',           direction: 'East',  earthFamily: 'Gateway',  col: '#cc4444' },
  { num: 10, name: 'Dog',           mayanName: 'Oc',       color: 'white',  glyph: '\u{1F43E}', action: 'Loves',       power: 'Heart',            essence: 'Loyalty',        direction: 'North', earthFamily: 'Polar',    col: '#d0d0d0' },
  { num: 11, name: 'Monkey',        mayanName: 'Chuen',    color: 'blue',   glyph: '\u{1F435}', action: 'Plays',       power: 'Magic',            essence: 'Illusion',       direction: 'West',  earthFamily: 'Cardinal', col: '#3344cc' },
  { num: 12, name: 'Human',         mayanName: 'Eb',       color: 'yellow', glyph: '\u{1F6E4}', action: 'Influences',  power: 'Free Will',        essence: 'Wisdom',         direction: 'South', earthFamily: 'Core',     col: '#ccaa22' },
  { num: 13, name: 'Skywalker',     mayanName: 'Ben',      color: 'red',    glyph: '\u{1F3AF}', action: 'Explores',    power: 'Space',            essence: 'Wakefulness',    direction: 'East',  earthFamily: 'Signal',   col: '#cc3333' },
  { num: 14, name: 'Wizard',        mayanName: 'Ix',       color: 'white',  glyph: '\u{1F406}', action: 'Enchants',    power: 'Timelessness',     essence: 'Receptivity',    direction: 'North', earthFamily: 'Gateway',  col: '#ddd8cc' },
  { num: 15, name: 'Eagle',         mayanName: 'Men',      color: 'blue',   glyph: '\u{1F985}', action: 'Creates',     power: 'Vision',           essence: 'Mind',           direction: 'West',  earthFamily: 'Polar',    col: '#3366aa' },
  { num: 16, name: 'Warrior',       mayanName: 'Cib',      color: 'yellow', glyph: '\u{1F989}', action: 'Questions',   power: 'Intelligence',     essence: 'Fearlessness',   direction: 'South', earthFamily: 'Cardinal', col: '#ccaa22' },
  { num: 17, name: 'Earth',         mayanName: 'Caban',    color: 'red',    glyph: '\u{1F30D}', action: 'Evolves',     power: 'Navigation',       essence: 'Synchronicity',  direction: 'East',  earthFamily: 'Core',     col: '#aa3322' },
  { num: 18, name: 'Mirror',        mayanName: 'Etznab',   color: 'white',  glyph: '\u{1FA9E}', action: 'Reflects',    power: 'Endlessness',      essence: 'Order',          direction: 'North', earthFamily: 'Signal',   col: '#d0d0d0' },
  { num: 19, name: 'Storm',         mayanName: 'Cauac',    color: 'blue',   glyph: '\u{26C8}',  action: 'Catalyzes',   power: 'Self-Generation',  essence: 'Energy',         direction: 'West',  earthFamily: 'Gateway',  col: '#3344aa' },
  { num: 20, name: 'Sun',           mayanName: 'Ahau',     color: 'yellow', glyph: '\u{2600}',  action: 'Enlightens',  power: 'Universal Fire',   essence: 'Life',           direction: 'South', earthFamily: 'Polar',    col: '#ddaa22' },
]

export const GALACTIC_TONES = [
  { number: 1,  name: 'Magnetic',       keyword: 'Purpose',        action: 'Unify',       power: 'Attract' },
  { number: 2,  name: 'Lunar',          keyword: 'Challenge',      action: 'Polarize',    power: 'Stabilize' },
  { number: 3,  name: 'Electric',       keyword: 'Service',        action: 'Activate',    power: 'Bond' },
  { number: 4,  name: 'Self-Existing',  keyword: 'Form',           action: 'Define',      power: 'Measure' },
  { number: 5,  name: 'Overtone',       keyword: 'Radiance',       action: 'Empower',     power: 'Command' },
  { number: 6,  name: 'Rhythmic',       keyword: 'Equality',       action: 'Organize',    power: 'Balance' },
  { number: 7,  name: 'Resonant',       keyword: 'Attunement',     action: 'Channel',     power: 'Inspire' },
  { number: 8,  name: 'Galactic',       keyword: 'Integrity',      action: 'Harmonize',   power: 'Model' },
  { number: 9,  name: 'Solar',          keyword: 'Intention',      action: 'Pulse',       power: 'Realize' },
  { number: 10, name: 'Planetary',      keyword: 'Manifestation',  action: 'Perfect',     power: 'Produce' },
  { number: 11, name: 'Spectral',       keyword: 'Liberation',     action: 'Dissolve',    power: 'Release' },
  { number: 12, name: 'Crystal',        keyword: 'Cooperation',    action: 'Dedicate',    power: 'Universalize' },
  { number: 13, name: 'Cosmic',         keyword: 'Presence',       action: 'Endure',      power: 'Transcend' },
]

export const CASTLES = [
  { num: 1, name: 'Red Castle of Turning',      court: 'Birth',          color: '#cc3333', range: [1, 52] },
  { num: 2, name: 'White Castle of Crossing',    court: 'Death',          color: '#d0d0d0', range: [53, 104] },
  { num: 3, name: 'Blue Castle of Burning',      court: 'Magic',          color: '#3366aa', range: [105, 156] },
  { num: 4, name: 'Yellow Castle of Giving',     court: 'Intelligence',   color: '#ccaa22', range: [157, 208] },
  { num: 5, name: 'Green Castle of Enchantment', court: 'Synchronicity',  color: '#44aa66', range: [209, 260] },
]

export const EARTH_FAMILIES = [
  { name: 'Polar',    role: 'Gateway Kin',  chakra: 'Crown',       seals: [20, 5, 10, 15] },
  { name: 'Cardinal', role: 'Signal Kin',   chakra: 'Root',        seals: [1, 6, 11, 16] },
  { name: 'Core',     role: 'Core Kin',     chakra: 'Heart',       seals: [2, 7, 12, 17] },
  { name: 'Signal',   role: 'Signal Kin',   chakra: 'Solar Plexus',seals: [3, 8, 13, 18] },
  { name: 'Gateway',  role: 'Gateway Kin',  chakra: 'Sacral',      seals: [4, 9, 14, 19] },
]

export const COLOR_FAMILIES = {
  red:    { role: 'Initiate',  theme: 'Birth & ignition of new cycles' },
  white:  { role: 'Refine',    theme: 'Purification & reflection' },
  blue:   { role: 'Transform', theme: 'Transformation & deep change' },
  yellow: { role: 'Ripen',     theme: 'Harvest & fruition of experience' },
}

export const SEAL_COLORS = {
  red: '#cc3333', white: '#d0d0d0', blue: '#3366aa', yellow: '#ddaa22',
}

/* ---- Build a full Dreamspell profile from a date ---- */
export function computeFullProfile(year, month, day) {
  const kin = computeDreamspellKin(year, month, day)
  const sealNum = getSealFromKin(kin)
  const toneNum = getToneFromKin(kin)
  const seal = DREAMSPELL_SEALS[sealNum - 1]
  const tone = GALACTIC_TONES[toneNum - 1]
  const colorLabel = seal.color.charAt(0).toUpperCase() + seal.color.slice(1)
  const signature = `${colorLabel} ${tone.name} ${seal.name}`

  // Oracle
  const guideK = getGuideKin(kin)
  const analogK = getAnalogKin(kin)
  const antipodeK = getAntipodeKin(kin)
  const occultK = getOccultKin(kin)

  function oracleEntry(k) {
    const s = getSealFromKin(k), t = getToneFromKin(k)
    const sd = DREAMSPELL_SEALS[s - 1], td = GALACTIC_TONES[t - 1]
    const cl = sd.color.charAt(0).toUpperCase() + sd.color.slice(1)
    return { kin: k, sealNum: s, toneNum: t, seal: sd, tone: td, signature: `${cl} ${td.name} ${sd.name}` }
  }

  // Wavespell
  const ws = getWavespell(kin)
  const wsSeal = DREAMSPELL_SEALS[ws.sealNum - 1]
  const wsColor = wsSeal.color.charAt(0).toUpperCase() + wsSeal.color.slice(1)

  // Castle
  const castleNum = getCastleNum(kin)
  const castle = CASTLES[castleNum - 1]

  // Earth Family
  const ef = EARTH_FAMILIES.find(f => f.seals.includes(sealNum))

  return {
    birthDate: `${['January','February','March','April','May','June','July','August','September','October','November','December'][month - 1]} ${day}, ${year}`,
    system: 'Dreamspell',
    kin,
    sealNum,
    toneNum,
    seal,
    tone,
    signature,
    color: seal.color,
    direction: seal.direction,
    oracle: {
      destiny:  oracleEntry(kin),
      guide:    oracleEntry(guideK),
      analog:   oracleEntry(analogK),
      antipode: oracleEntry(antipodeK),
      occult:   oracleEntry(occultK),
    },
    wavespell: { ...ws, seal: wsSeal, name: `${wsColor} ${wsSeal.name}`, label: `Wavespell of ${wsSeal.power}` },
    castle,
    earthFamily: ef,
    colorFamily: COLOR_FAMILIES[seal.color],
  }
}

// Pre-computed profile: Gaston Frydlewski — January 23, 1981
export const MAYAN_PROFILE = computeFullProfile(1981, 1, 23)

// Legacy exports for backward compat (Dashboard widget header)
export const MAYAN_DAY_SIGNS = DREAMSPELL_SEALS
export const DIRECTION_COLORS = { East: '#cc3333', North: '#d0d0d0', West: '#3366aa', South: '#ddaa22' }
export const ELEMENT_COLORS = { Fire: '#cc4433', Air: '#88aacc', Water: '#4466aa', Earth: '#aa8833' }

// ---- Classical Maya Engine re-exports ----
// The Classical engine uses the GMT correlation constant (584283) for historically
// accurate Tzolkin, Haab, Long Count, and related computations.
export { getMayanProfile, TZOLKIN_DAY_SIGNS, TZOLKIN_TONES, HAAB_MONTHS } from '../engines/mayanEngine'
