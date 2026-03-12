export const HEBREW_ALPHABET = [
  { letter: 'Aleph',   hebrew: '\u05D0', value: 1,   meaning: 'Ox -- primal force, breath, spirit, beginnings' },
  { letter: 'Bet',     hebrew: '\u05D1', value: 2,   meaning: 'House -- duality, container, dwelling, blessing' },
  { letter: 'Gimel',   hebrew: '\u05D2', value: 3,   meaning: 'Camel -- movement, reward, nourishment, generosity' },
  { letter: 'Dalet',   hebrew: '\u05D3', value: 4,   meaning: 'Door -- pathway, humility, poverty, threshold' },
  { letter: 'He',      hebrew: '\u05D4', value: 5,   meaning: 'Window -- breath of God, revelation, feminine' },
  { letter: 'Vav',     hebrew: '\u05D5', value: 6,   meaning: 'Hook -- connection, binding, and/or, completion' },
  { letter: 'Zayin',   hebrew: '\u05D6', value: 7,   meaning: 'Sword -- sustenance, struggle, time, spirit' },
  { letter: 'Chet',    hebrew: '\u05D7', value: 8,   meaning: 'Fence -- enclosure, life, private, grace' },
  { letter: 'Tet',     hebrew: '\u05D8', value: 9,   meaning: 'Serpent -- good, hidden, coiled potential' },
  { letter: 'Yod',     hebrew: '\u05D9', value: 10,  meaning: 'Hand -- creation, deed, metaphysical point' },
  { letter: 'Kaf',     hebrew: '\u05DB', value: 20,  meaning: 'Palm -- crowning, bending, container of potential' },
  { letter: 'Lamed',   hebrew: '\u05DC', value: 30,  meaning: 'Ox goad -- learning, teaching, heart, aspiration' },
  { letter: 'Mem',     hebrew: '\u05DE', value: 40,  meaning: 'Water -- flow, revealed and concealed, womb' },
  { letter: 'Nun',     hebrew: '\u05E0', value: 50,  meaning: 'Fish -- faithfulness, soul, emergence, heir' },
  { letter: 'Samekh',  hebrew: '\u05E1', value: 60,  meaning: 'Prop -- support, cyclical, protection, trust' },
  { letter: 'Ayin',    hebrew: '\u05E2', value: 70,  meaning: 'Eye -- perception, insight, divine providence' },
  { letter: 'Pe',      hebrew: '\u05E4', value: 80,  meaning: 'Mouth -- speech, expression, oral Torah' },
  { letter: 'Tsade',   hebrew: '\u05E6', value: 90,  meaning: 'Fishhook -- righteousness, humility, the just one' },
  { letter: 'Qof',     hebrew: '\u05E7', value: 100, meaning: 'Back of head -- holiness, cycles, monkey/imitation' },
  { letter: 'Resh',    hebrew: '\u05E8', value: 200, meaning: 'Head -- beginning, poverty, wickedness, choice' },
  { letter: 'Shin',    hebrew: '\u05E9', value: 300, meaning: 'Tooth -- fire, transformation, divine power, change' },
  { letter: 'Tav',     hebrew: '\u05EA', value: 400, meaning: 'Mark/Cross -- truth, seal, completion, covenant' },
]

export const ENGLISH_GEMATRIA = {
  A: { ordinal: 1,  pythagorean: 1 },
  B: { ordinal: 2,  pythagorean: 2 },
  C: { ordinal: 3,  pythagorean: 3 },
  D: { ordinal: 4,  pythagorean: 4 },
  E: { ordinal: 5,  pythagorean: 5 },
  F: { ordinal: 6,  pythagorean: 6 },
  G: { ordinal: 7,  pythagorean: 7 },
  H: { ordinal: 8,  pythagorean: 8 },
  I: { ordinal: 9,  pythagorean: 9 },
  J: { ordinal: 10, pythagorean: 1 },
  K: { ordinal: 11, pythagorean: 2 },
  L: { ordinal: 12, pythagorean: 3 },
  M: { ordinal: 13, pythagorean: 4 },
  N: { ordinal: 14, pythagorean: 5 },
  O: { ordinal: 15, pythagorean: 6 },
  P: { ordinal: 16, pythagorean: 7 },
  Q: { ordinal: 17, pythagorean: 8 },
  R: { ordinal: 18, pythagorean: 9 },
  S: { ordinal: 19, pythagorean: 1 },
  T: { ordinal: 20, pythagorean: 2 },
  U: { ordinal: 21, pythagorean: 3 },
  V: { ordinal: 22, pythagorean: 4 },
  W: { ordinal: 23, pythagorean: 5 },
  X: { ordinal: 24, pythagorean: 6 },
  Y: { ordinal: 25, pythagorean: 7 },
  Z: { ordinal: 26, pythagorean: 8 },
}

// Chaldean system -- distinct from Pythagorean, no letter = 9
const CHALDEAN_MAP = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 7, P: 8, Q: 1, R: 2,
  S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7,
}

export const GEMATRIA_METHODS = [
  {
    name: 'Hebrew',
    description: 'The original system (Mispar Hechrachi) assigns each of the 22 Hebrew letters a numeric value from 1 to 400. English names are transliterated phonetically to approximate Hebrew equivalents.',
  },
  {
    name: 'Pythagorean',
    description: 'Also called the Western or modern system, assigns values 1--9 by reducing each letter\'s ordinal position (A=1, B=2 ... I=9, J=1, K=2 ...). The most common method for name numerology.',
  },
  {
    name: 'Chaldean',
    description: 'An ancient Babylonian system considered more mystical than Pythagorean. Values 1--8 are assigned based on letter vibration rather than alphabetical order. The number 9 is sacred and never assigned.',
  },
  {
    name: 'English Ordinal',
    description: 'The simplest method: A=1, B=2, C=3 through Z=26. The full sum and its digital root reveal the name\'s fundamental vibration in the English language matrix.',
  },
]

// Approximate English-to-Hebrew phonetic mapping
const ENGLISH_TO_HEBREW = {
  A: { hebrew: '\u05D0', name: 'Aleph', value: 1 },
  B: { hebrew: '\u05D1', name: 'Bet', value: 2 },
  C: { hebrew: '\u05DB', name: 'Kaf', value: 20 },
  D: { hebrew: '\u05D3', name: 'Dalet', value: 4 },
  E: { hebrew: '\u05D4', name: 'He', value: 5 },
  F: { hebrew: '\u05E4', name: 'Pe', value: 80 },
  G: { hebrew: '\u05D2', name: 'Gimel', value: 3 },
  H: { hebrew: '\u05D7', name: 'Chet', value: 8 },
  I: { hebrew: '\u05D9', name: 'Yod', value: 10 },
  J: { hebrew: '\u05D9', name: 'Yod', value: 10 },
  K: { hebrew: '\u05DB', name: 'Kaf', value: 20 },
  L: { hebrew: '\u05DC', name: 'Lamed', value: 30 },
  M: { hebrew: '\u05DE', name: 'Mem', value: 40 },
  N: { hebrew: '\u05E0', name: 'Nun', value: 50 },
  O: { hebrew: '\u05E2', name: 'Ayin', value: 70 },
  P: { hebrew: '\u05E4', name: 'Pe', value: 80 },
  Q: { hebrew: '\u05E7', name: 'Qof', value: 100 },
  R: { hebrew: '\u05E8', name: 'Resh', value: 200 },
  S: { hebrew: '\u05E1', name: 'Samekh', value: 60 },
  T: { hebrew: '\u05EA', name: 'Tav', value: 400 },
  U: { hebrew: '\u05D5', name: 'Vav', value: 6 },
  V: { hebrew: '\u05D5', name: 'Vav', value: 6 },
  W: { hebrew: '\u05D5', name: 'Vav', value: 6 },
  X: { hebrew: '\u05E1', name: 'Samekh', value: 60 },
  Y: { hebrew: '\u05D9', name: 'Yod', value: 10 },
  Z: { hebrew: '\u05D6', name: 'Zayin', value: 7 },
}

function reduceToDigit(n) {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((a, d) => a + Number(d), 0)
  }
  return n
}

function hebrewValueOf(name) {
  return name.toUpperCase().split('').filter(c => /[A-Z]/.test(c))
    .reduce((sum, c) => sum + (ENGLISH_TO_HEBREW[c]?.value || 0), 0)
}

function pythagoreanValueOf(name) {
  return name.toUpperCase().split('').filter(c => /[A-Z]/.test(c))
    .reduce((sum, c) => sum + (ENGLISH_GEMATRIA[c]?.pythagorean || 0), 0)
}

function chaldeanValueOf(name) {
  return name.toUpperCase().split('').filter(c => /[A-Z]/.test(c))
    .reduce((sum, c) => sum + (CHALDEAN_MAP[c] || 0), 0)
}

function englishValueOf(name) {
  return name.toUpperCase().split('').filter(c => /[A-Z]/.test(c))
    .reduce((sum, c) => sum + (ENGLISH_GEMATRIA[c]?.ordinal || 0), 0)
}

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U'])

function vowelSum(name) {
  return name.toUpperCase().split('').filter(c => VOWELS.has(c))
    .reduce((sum, c) => sum + (ENGLISH_GEMATRIA[c]?.pythagorean || 0), 0)
}

function consonantSum(name) {
  return name.toUpperCase().split('').filter(c => /[A-Z]/.test(c) && !VOWELS.has(c))
    .reduce((sum, c) => sum + (ENGLISH_GEMATRIA[c]?.pythagorean || 0), 0)
}

// Pre-computed analysis for Gaston Frydlewski
const FULL_NAME = 'Gaston Frydlewski'
const FIRST = 'Gaston'
const LAST = 'Frydlewski'

// Hebrew values
// G(3) A(1) S(60) T(400) O(70) N(50) = 584
// F(80) R(200) Y(10) D(4) L(30) E(5) W(6) S(60) K(20) I(10) = 425
const hebFull = hebrewValueOf(FULL_NAME)     // 1009
const hebFirst = hebrewValueOf(FIRST)         // 584
const hebLast = hebrewValueOf(LAST)           // 425

// Pythagorean values
// G(7) A(1) S(1) T(2) O(6) N(5) = 22
// F(6) R(9) Y(7) D(4) L(3) E(5) W(5) S(1) K(2) I(9) = 51
const pytFull = pythagoreanValueOf(FULL_NAME) // 73
const pytFirst = pythagoreanValueOf(FIRST)    // 22 (Master Number!)
const pytLast = pythagoreanValueOf(LAST)      // 51

// Chaldean values
// G(3) A(1) S(3) T(4) O(7) N(5) = 23
// F(8) R(2) Y(1) D(4) L(3) E(5) W(6) S(3) K(2) I(1) = 35
const chalFull = chaldeanValueOf(FULL_NAME)   // 58
const chalFirst = chaldeanValueOf(FIRST)      // 23
const chalLast = chaldeanValueOf(LAST)        // 35

// English Ordinal values
// G(7) A(1) S(19) T(20) O(15) N(14) = 76
// F(6) R(18) Y(25) D(4) L(12) E(5) W(23) S(19) K(11) I(9) = 132
const engFull = englishValueOf(FULL_NAME)     // 208
const engFirst = englishValueOf(FIRST)        // 76
const engLast = englishValueOf(LAST)          // 132

// Soul urge (vowels) and personality (consonants) from full name
// Vowels: A(1) O(6) | E(5) I(9) = 21 -> 3
// Consonants: G(7) S(1) T(2) N(5) | F(6) R(9) Y(7) D(4) L(3) W(5) S(1) K(2) = 52 -> 7
const soulUrge = vowelSum(FULL_NAME)       // 21
const personality = consonantSum(FULL_NAME) // 52

const letterBreakdown = FULL_NAME.toUpperCase().split('').filter(c => /[A-Z]/.test(c)).map(c => ({
  letter: c,
  hebrewEquiv: ENGLISH_TO_HEBREW[c]?.name || '--',
  hebrewChar: ENGLISH_TO_HEBREW[c]?.hebrew || '',
  hebrewValue: ENGLISH_TO_HEBREW[c]?.value || 0,
  pythagoreanValue: ENGLISH_GEMATRIA[c]?.pythagorean || 0,
  chaldeanValue: CHALDEAN_MAP[c] || 0,
  ordinalValue: ENGLISH_GEMATRIA[c]?.ordinal || 0,
}))

export const GEMATRIA_PROFILE = {
  fullName: FULL_NAME,
  firstName: FIRST,
  lastName: LAST,

  hebrew: {
    fullValue: hebFull,
    firstNameValue: hebFirst,
    lastNameValue: hebLast,
    reducedValue: reduceToDigit(hebFull),
    significantNumbers: [hebFull, hebFirst, hebLast, reduceToDigit(hebFull)],
  },

  pythagorean: {
    fullValue: pytFull,
    firstNameValue: pytFirst,
    lastNameValue: pytLast,
    reducedValue: reduceToDigit(pytFull),
    nameNumber: reduceToDigit(pytFull),       // 73 -> 10 -> 1
    vowelNumber: reduceToDigit(soulUrge),     // 21 -> 3 (Soul Urge)
    consonantNumber: reduceToDigit(personality), // 52 -> 7 (Personality)
    rawVowelSum: soulUrge,
    rawConsonantSum: personality,
  },

  chaldean: {
    fullValue: chalFull,
    firstNameValue: chalFirst,
    lastNameValue: chalLast,
    reducedValue: reduceToDigit(chalFull),
  },

  english: {
    fullValue: engFull,
    firstNameValue: engFirst,
    lastNameValue: engLast,
    reducedValue: reduceToDigit(engFull),
  },

  letterBreakdown,

  significantMatches: [
    { value: hebFull, system: 'Hebrew', matches: [
      'Echad Elohim (One God) variants sum to multiples of this range',
      'The numerical range 1000--1010 connects to Aleph (1) at the millenary scale -- the ox of a thousand hills',
    ]},
    { value: pytFirst, system: 'Pythagorean', matches: [
      '22 is a Master Number -- the Master Builder',
      '22 Hebrew letters, 22 paths on the Tree of Life, 22 Major Arcana',
      'First name vibrates at the frequency of sacred architecture',
    ]},
    { value: reduceToDigit(pytFull), system: 'Pythagorean', matches: [
      'Name Number 1 -- The Initiator, the primal creative force',
      'Aleph energy: independence, originality, leadership',
      'Resonates with Kether (Crown) on the Tree of Life',
    ]},
    { value: reduceToDigit(soulUrge), system: 'Soul Urge', matches: [
      'Soul Urge 3 -- Gimel, the camel, the communicator',
      'Inner desire for self-expression, creativity, and joy',
      'Binah connection: understanding through articulation',
    ]},
    { value: reduceToDigit(personality), system: 'Personality', matches: [
      'Personality 7 -- Zayin, the sword, the seeker',
      'The world perceives analytical depth, spiritual intensity',
      'Resonates with Netzach (Victory/Emotions) -- the mystical questioner',
    ]},
  ],

  kabbalisticCorrespondences: [
    {
      path: 'Aleph (\u05D0) -- Path 11',
      connection: 'Kether to Chokmah',
      tarot: 'The Fool (0)',
      meaning: 'The initial letter of the first name begins at the origin of all things -- pure potentiality and the breath of spirit before form.',
    },
    {
      path: 'Gimel (\u05D2) -- Path 13',
      connection: 'Kether to Tiphareth',
      tarot: 'The High Priestess (II)',
      meaning: 'The G in Gaston carries the camel\'s journey across the Abyss -- connecting crown consciousness directly to the heart of beauty.',
    },
    {
      path: 'Tav (\u05EA) -- Path 32',
      connection: 'Yesod to Malkuth',
      tarot: 'The World (XXI)',
      meaning: 'Tav (T) appears in both first and last names, anchoring the name\'s vibration in the path of completion -- cosmic consciousness manifesting in the material world.',
    },
    {
      path: 'Resh (\u05E8) -- Path 30',
      connection: 'Yesod to Hod',
      tarot: 'The Sun (XIX)',
      meaning: 'The R in Frydlewski carries the solar energy of Resh -- illuminating the intellect (Hod) from the subconscious foundation (Yesod). Value 200 amplifies its influence.',
    },
    {
      path: 'Pe (\u05E4) -- Path 27',
      connection: 'Netzach to Hod',
      tarot: 'The Tower (XVI)',
      meaning: 'The F (Pe) in Frydlewski bridges emotion and intellect -- the mouth that shatters false structures with spoken truth. Value 80 indicates transformative speech.',
    },
    {
      path: 'Master Number 22',
      connection: '22 Paths of the Tree',
      tarot: 'All 22 Major Arcana',
      meaning: 'The first name "Gaston" summing to 22 in Pythagorean gematria means it resonates with the totality of the Tree of Life -- all 22 paths, all 22 letters, the complete architecture of creation.',
    },
  ],
}
