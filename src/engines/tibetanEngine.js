// ═══════════════════════════════════════════════════════════════════════════
// Tibetan Astrology Engine — Jungtsi (Element Astrology) + Kartsi (White Astrology)
// Full implementation: Losar dating, Animal-Element cycle, Mewa, Parkha, Log-Men
// ═══════════════════════════════════════════════════════════════════════════

// Losar (Tibetan New Year) dates — varies annually based on lunisolar calendar
const LOSAR_DATES = [
  [1970,2,6],[1971,2,27],[1972,2,15],[1973,2,3],[1974,1,23],
  [1975,2,11],[1976,1,31],[1977,2,18],[1978,2,7],[1979,2,28],
  [1980,2,16],[1981,3,5],[1982,2,23],[1983,2,13],[1984,2,2],
  [1985,2,20],[1986,2,9],[1987,1,29],[1988,2,17],[1989,2,6],
  [1990,2,27],[1991,2,15],[1992,3,4],[1993,2,22],[1994,2,10],
  [1995,1,31],[1996,2,19],[1997,2,7],[1998,2,28],[1999,2,17],
  [2000,2,5],[2001,2,24],[2002,2,13],[2003,3,3],[2004,2,21],
  [2005,2,9],[2006,2,28],[2007,2,18],[2008,2,7],[2009,2,25],
  [2010,2,14],[2011,3,5],[2012,2,22],[2013,2,11],[2014,3,2],
  [2015,2,19],[2016,2,9],[2017,2,27],[2018,2,16],[2019,2,5],
  [2020,2,24],[2021,2,12],[2022,3,3],[2023,2,21],[2024,2,10],
  [2025,2,28],[2026,2,17],[2027,2,6],[2028,1,26],[2029,2,13],
  [2030,2,3],
];

// 12 Animals of the Tibetan zodiac (same as Chinese but with different names)
const TIBETAN_ANIMALS = ['Mouse','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Sheep','Monkey','Bird','Dog','Pig'];

// 5 Elements in Tibetan tradition (Jungwa Nga)
const TIBETAN_ELEMENTS = ['Fire','Earth','Iron','Water','Wood'];
export const TIBETAN_ELEMENT_NAMES_TIB = ['Mé','Sa','Chak','Chu','Shing'];

// Element colors and qualities
const ELEMENT_DATA = {
  Fire:  { tibetan: 'Mé',    color: '#e04040', quality: 'Transformation, clarity, passion', direction: 'South', season: 'Summer', organ: 'Heart' },
  Earth: { tibetan: 'Sa',    color: '#c9a84c', quality: 'Stability, nourishment, grounding', direction: 'Center', season: 'Late Summer', organ: 'Spleen' },
  Iron:  { tibetan: 'Chak',  color: '#b0b0c0', quality: 'Precision, strength, cutting through', direction: 'West', season: 'Autumn', organ: 'Lungs' },
  Water: { tibetan: 'Chu',   color: '#4080d0', quality: 'Depth, wisdom, adaptability', direction: 'North', season: 'Winter', organ: 'Kidneys' },
  Wood:  { tibetan: 'Shing', color: '#40a060', quality: 'Growth, vitality, flexibility', direction: 'East', season: 'Spring', organ: 'Liver' },
};

// 9 Mewa (Magic Square numbers) — descending cycle
const MEWA_DATA = {
  1: { color: 'White',      element: 'Iron',  trigram: 'Kham',   quality: 'Clarity, precision, strength', personality: 'Independent, adaptable, diplomatic. Strong connection to water energy. Can be emotionally sensitive beneath a composed exterior.', direction: 'North' },
  2: { color: 'Black',      element: 'Water', trigram: 'Khön',   quality: 'Depth, mystery, introspection', personality: 'Nurturing, receptive, devoted. Natural caretaker with deep loyalty. May struggle with boundaries and self-sacrifice.', direction: 'Southwest' },
  3: { color: 'Blue',       element: 'Water', trigram: 'Zin',    quality: 'Wisdom, communication, fluidity', personality: 'Dynamic, innovative, ambitious. Quick to start but may not finish. Strong voice and presence, prone to frustration when blocked.', direction: 'East' },
  4: { color: 'Green',      element: 'Wood',  trigram: 'Zon',    quality: 'Growth, vitality, flexibility', personality: 'Gentle, creative, adaptable. Moves with the wind — flexible but sometimes indecisive. Strong intuitive and artistic capacities.', direction: 'Southeast' },
  5: { color: 'Yellow',     element: 'Earth', trigram: 'Center', quality: 'Foundation, stability, power', personality: 'Powerful, central, commanding presence. Natural leader who can become controlling. The pivot point around which others revolve.', direction: 'Center' },
  6: { color: 'White',      element: 'Iron',  trigram: 'Khen',   quality: 'Purity, reflection, completion', personality: 'Authoritative, disciplined, principled. Natural executive capacity. May be rigid or overly controlling. Deep sense of duty.', direction: 'Northwest' },
  7: { color: 'Red',        element: 'Fire',  trigram: 'Da',     quality: 'Passion, transformation, clarity', personality: 'Joyful, communicative, persuasive. Natural entertainer and connector. Can be scattered or superficial when ungrounded.', direction: 'West' },
  8: { color: 'White',      element: 'Earth', trigram: 'Kham',   quality: 'Achievement, accumulation, power', personality: 'Contemplative, stable, determined. Builds slowly but surely. Mountain-like presence. Can be stubborn or isolated.', direction: 'Northeast' },
  9: { color: 'Maroon',     element: 'Fire',  trigram: 'Li',     quality: 'Compassion, wisdom, liberation', personality: 'Visionary, charismatic, illuminating. Natural teacher and inspirer. Can burn too bright — prone to burnout or arrogance.', direction: 'South' },
};

// 8 Parkha (Tibetan trigrams — equivalent to I Ching Bagua)
const PARKHA_DATA = {
  Li:   { symbol: '☲', meaning: 'Fire / Clinging',    quality: 'Illumination, clarity, attachment', element: 'Fire',  direction: 'South' },
  Khön: { symbol: '☷', meaning: 'Earth / Receptive',   quality: 'Nourishment, patience, devotion',   element: 'Earth', direction: 'Southwest' },
  Da:   { symbol: '☱', meaning: 'Lake / Joyous',       quality: 'Joy, reflection, communication',    element: 'Iron',  direction: 'West' },
  Khen: { symbol: '☰', meaning: 'Heaven / Creative',   quality: 'Authority, structure, discipline',  element: 'Iron',  direction: 'Northwest' },
  Kham: { symbol: '☵', meaning: 'Water / Abysmal',     quality: 'Depth, danger, hidden wisdom',      element: 'Water', direction: 'North' },
  Gin:  { symbol: '☶', meaning: 'Mountain / Stillness', quality: 'Meditation, stability, boundaries', element: 'Earth', direction: 'Northeast' },
  Zin:  { symbol: '☳', meaning: 'Thunder / Arousing',  quality: 'Initiative, shock, awakening',      element: 'Wood',  direction: 'East' },
  Zon:  { symbol: '☴', meaning: 'Wind / Gentle',       quality: 'Penetration, flexibility, growth',  element: 'Wood',  direction: 'Southeast' },
};

// Parkha cycle for birth years (Male cycle descends, Female ascends)
const PARKHA_MALE_CYCLE   = ['Li','Kham','Khön','Zin','Zon','Khen','Da','Gin','Center'];
const PARKHA_FEMALE_CYCLE = ['Kham','Li','Gin','Da','Khen','Zon','Zin','Khön','Center'];

// Animal detailed profiles
const ANIMAL_PROFILES = {
  Mouse:  { quality: 'Clever, resourceful, adaptable',         challenge: 'Anxiety, hoarding',             element: 'Water', ally: 'Dragon',  enemy: 'Horse',  friend: 'Ox',     secret: 'Rabbit',   direction: 'North',     season: 'Early Winter' },
  Ox:     { quality: 'Patient, reliable, diligent',            challenge: 'Stubbornness, rigidity',         element: 'Earth', ally: 'Snake',   enemy: 'Sheep',  friend: 'Mouse',  secret: 'Dragon',   direction: 'North-NE',  season: 'Late Winter' },
  Tiger:  { quality: 'Brave, passionate, unpredictable',       challenge: 'Impulsiveness, conflict',        element: 'Wood',  ally: 'Horse',   enemy: 'Monkey', friend: 'Pig',    secret: 'Snake',    direction: 'East-NE',   season: 'Early Spring' },
  Rabbit: { quality: 'Gentle, diplomatic, artistic',           challenge: 'Detachment, avoidance',          element: 'Wood',  ally: 'Sheep',   enemy: 'Bird',   friend: 'Dog',    secret: 'Horse',    direction: 'East',      season: 'Mid Spring' },
  Dragon: { quality: 'Powerful, charismatic, visionary',       challenge: 'Arrogance, perfectionism',       element: 'Earth', ally: 'Monkey',  enemy: 'Dog',    friend: 'Bird',   secret: 'Sheep',    direction: 'East-SE',   season: 'Late Spring' },
  Snake:  { quality: 'Wise, intuitive, mysterious',            challenge: 'Secretiveness, possessiveness',  element: 'Fire',  ally: 'Ox',      enemy: 'Pig',    friend: 'Monkey', secret: 'Monkey',   direction: 'South-SE',  season: 'Early Summer' },
  Horse:  { quality: 'Free-spirited, passionate, independent', challenge: 'Impatience, inconsistency',      element: 'Fire',  ally: 'Tiger',   enemy: 'Mouse',  friend: 'Sheep',  secret: 'Ox',       direction: 'South',     season: 'Mid Summer' },
  Sheep:  { quality: 'Gentle, creative, compassionate',        challenge: 'Indecisiveness, dependence',     element: 'Earth', ally: 'Rabbit',  enemy: 'Ox',     friend: 'Horse',  secret: 'Tiger',    direction: 'South-SW',  season: 'Late Summer' },
  Monkey: { quality: 'Intelligent, witty, versatile',          challenge: 'Mischief, unreliability',        element: 'Iron',  ally: 'Dragon',  enemy: 'Tiger',  friend: 'Snake',  secret: 'Bird',     direction: 'West-SW',   season: 'Early Autumn' },
  Bird:   { quality: 'Observant, precise, confident',          challenge: 'Critical, vain',                 element: 'Iron',  ally: 'Snake',   enemy: 'Rabbit', friend: 'Dragon', secret: 'Dog',      direction: 'West',      season: 'Mid Autumn' },
  Dog:    { quality: 'Loyal, honest, protective',              challenge: 'Anxious, defensive',             element: 'Earth', ally: 'Pig',     enemy: 'Dragon', friend: 'Rabbit', secret: 'Pig',      direction: 'West-NW',   season: 'Late Autumn' },
  Pig:    { quality: 'Generous, diligent, sincere',            challenge: 'Naive, overindulgent',           element: 'Water', ally: 'Dog',     enemy: 'Snake',  friend: 'Tiger',  secret: 'Mouse',    direction: 'North-NW',  season: 'Early Winter' },
};

// Log-Men — Force calculations (La, Sok, Lü, Wangthang, Lungta)
// These are derived from the interaction of birth mewa + birth parkha + current year
const LOG_MEN_FORCES = {
  La:        { name: 'La (Soul)',       desc: 'The vitality essence — where your soul-force resides. When strong, you feel inspired and connected to purpose.' },
  Sok:       { name: 'Sok (Life Force)', desc: 'Physical vitality and constitutional strength. When depleted, illness and fatigue arise.' },
  Lu:        { name: 'Lü (Body)',       desc: 'Physical health and bodily harmony. Relates to how well your physical form holds energy.' },
  Wangthang: { name: 'Wangthang (Power)', desc: 'Personal power, charisma, and capacity to influence. When strong, efforts bear fruit naturally.' },
  Lungta:    { name: 'Lungta (Wind Horse)', desc: 'Fortune and success energy. The mythical wind horse that carries prayers to heaven. When strong, luck flows.' },
};

// Reference: 1987 = Fire Rabbit year
const REF_YEAR = 1987;
const REF_ANIMAL_IDX = 3; // Rabbit = index 3
const REF_ELEMENT_IDX = 0; // Fire

function getTibetanYear(day, month, year) {
  const losar = LOSAR_DATES.find(d => d[0] === year);
  if (!losar) {
    // Estimate: if before mid-Feb, previous Tibetan year
    return (month < 2 || (month === 2 && day < 15)) ? year - 1 : year;
  }
  const isBeforeLosar = month < losar[1] || (month === losar[1] && day < losar[2]);
  return isBeforeLosar ? year - 1 : year;
}

function computeMewa(tibYear) {
  // Mewa descends: 1987 = mewa 1
  const diff = tibYear - REF_YEAR;
  return ((1 - diff % 9 + 9) % 9) || 9;
}

function computeParkha(tibYear, gender) {
  // Male and female have different Parkha cycles
  const diff = tibYear - REF_YEAR;
  const cycle = gender === 'female' ? PARKHA_FEMALE_CYCLE : PARKHA_MALE_CYCLE;
  const idx = ((diff % 9) + 9) % 9;
  const parkhaName = cycle[idx];
  if (parkhaName === 'Center') return { name: 'Center', symbol: '☯', meaning: 'Center / Balance', quality: 'Central equilibrium, the pivot of all directions', element: 'Earth', direction: 'Center' };
  return { name: parkhaName, ...PARKHA_DATA[parkhaName] };
}

function computeLogMen(mewa, element) {
  // Simplified force calculation based on mewa number and birth element
  // In authentic practice these require yearly almanac — we provide baseline
  const base = mewa;
  const elemBonus = { Fire: 1, Earth: 0, Iron: -1, Water: 1, Wood: 0 };
  const bonus = elemBonus[element] || 0;

  return {
    la:        Math.min(10, Math.max(1, base + bonus + 2)),
    sok:       Math.min(10, Math.max(1, 10 - base + bonus + 1)),
    lu:        Math.min(10, Math.max(1, Math.round((base * 1.2 + bonus + 3) % 10) + 1)),
    wangthang: Math.min(10, Math.max(1, Math.round((base + bonus + 5) % 10) + 1)),
    lungta:    Math.min(10, Math.max(1, Math.round((base * 0.8 + bonus + 4) % 10) + 1)),
  };
}

// Rabjung cycle — 60-year cycle (Tibetan calendar uses these for dating)
function computeRabjung(tibYear) {
  // 1st Rabjung began 1027 CE
  const yearInCycle = ((tibYear - 1027) % 60 + 60) % 60;
  const rabjungNumber = Math.floor((tibYear - 1027) / 60) + 1;
  return { cycle: rabjungNumber, yearInCycle: yearInCycle + 1 };
}

// Element relationship (mother/child/friend/enemy)
function getElementRelationships(element) {
  const cycle = ['Wood', 'Fire', 'Earth', 'Iron', 'Water'];
  const idx = cycle.indexOf(element);
  if (idx < 0) return {};
  return {
    mother: cycle[(idx - 1 + 5) % 5],   // generates you
    child: cycle[(idx + 1) % 5],          // you generate
    friend: cycle[(idx + 2) % 5],         // supports
    enemy: cycle[(idx + 3) % 5],          // opposes
  };
}

export function getTibetanProfile({ day, month, year, gender }) {
  const tibYear = getTibetanYear(day, month, year);

  const yearDiff = tibYear - REF_YEAR;
  const animalIdx = ((REF_ANIMAL_IDX + yearDiff) % 12 + 12) % 12;
  const elementIdx = ((REF_ELEMENT_IDX + Math.floor(yearDiff / 2)) % 5 + 5) % 5;
  const polarity = (tibYear % 2 === 0) ? 'Male' : 'Female'; // Pho/Mo

  const animal = TIBETAN_ANIMALS[animalIdx];
  const element = TIBETAN_ELEMENTS[elementIdx];
  const mewaNumber = computeMewa(tibYear);
  const parkha = computeParkha(tibYear, gender || 'male');
  const logMen = computeLogMen(mewaNumber, element);
  const rabjung = computeRabjung(tibYear);
  const elementRelations = getElementRelationships(element);

  return {
    tibetanYear: tibYear,
    animal,
    element,
    polarity,           // Male (Pho) or Female (Mo)
    fullLabel: `${polarity} ${element} ${animal}`,

    // Mewa (Magic Square)
    mewaNumber,
    mewa: MEWA_DATA[mewaNumber],

    // Parkha (Trigram)
    parkha,

    // Animal profile
    animalProfile: ANIMAL_PROFILES[animal],

    // Element data
    elementData: ELEMENT_DATA[element],
    elementRelations,

    // Log-Men forces
    logMen,
    logMenDescriptions: LOG_MEN_FORCES,

    // Rabjung cycle
    rabjung,

    // Compatibility data
    animalAlly: ANIMAL_PROFILES[animal]?.ally,
    animalEnemy: ANIMAL_PROFILES[animal]?.enemy,
    animalFriend: ANIMAL_PROFILES[animal]?.friend,
    animalSecret: ANIMAL_PROFILES[animal]?.secret,
  };
}

// Export for use in detail panel
export { ELEMENT_DATA, MEWA_DATA, PARKHA_DATA, ANIMAL_PROFILES, LOG_MEN_FORCES };
