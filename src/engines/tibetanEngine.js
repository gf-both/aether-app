// Tibetan New Year (Losar) dates - approximately 2 months after Chinese New Year
// Losar is the new moon of the first Tibetan month
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
  [2025,2,28],[2026,2,17],
];

const TIBETAN_ANIMALS = ['Horse','Sheep','Monkey','Bird','Dog','Pig','Mouse','Ox','Tiger','Rabbit','Dragon','Snake'];
const TIBETAN_ELEMENTS = ['Fire','Earth','Iron','Water','Wood'];
export const TIBETAN_ELEMENT_NAMES_TIB = ['Mé','Sa','Chak','Chu','Shing'];

// Tibetan year 1 = 1027 CE (Fire Rabbit year)
// Reference: 1987 = Fire Rabbit (year 961 in Tibetan calendar)
const REF_YEAR = 1987;
const REF_ANIMAL_IDX = 10; // Rabbit
const REF_ELEMENT_IDX = 0; // Fire

export function getTibetanProfile({ day, month, year }) {
  // Find if date is before/after Losar
  const losar = LOSAR_DATES.find(d => d[0] === year);
  const isBeforeLosar = losar && (month < losar[1] || (month === losar[1] && day < losar[2]));
  const tibYear = isBeforeLosar ? year - 1 : year;

  const yearDiff = tibYear - REF_YEAR;
  const animalIdx = ((REF_ANIMAL_IDX + yearDiff) % 12 + 12) % 12;
  const elementIdx = ((REF_ELEMENT_IDX + Math.floor(yearDiff / 2)) % 5 + 5) % 5;
  const yinYang = (tibYear % 2 === 0) ? 'Male' : 'Female'; // Tibetan uses Male/Female

  const animal = TIBETAN_ANIMALS[animalIdx];
  const element = TIBETAN_ELEMENTS[elementIdx];

  // mewa (magic square number) — 9-year cycle
  // Reference: 1987 = mewa 1
  const mewaRef = 1;
  const mewaYear = ((mewaRef - (tibYear - REF_YEAR) % 9 + 9) % 9) || 9;

  const MEWA_MEANINGS = {
    1: { color: 'White', element: 'Iron', meaning: 'Clarity, precision, strength' },
    2: { color: 'Black', element: 'Water', meaning: 'Depth, mystery, introspection' },
    3: { color: 'Blue', element: 'Water', meaning: 'Wisdom, communication, fluidity' },
    4: { color: 'Green', element: 'Wood', meaning: 'Growth, vitality, flexibility' },
    5: { color: 'Yellow', element: 'Earth', meaning: 'Foundation, stability, nourishment' },
    6: { color: 'White', element: 'Iron', meaning: 'Purity, reflection, completion' },
    7: { color: 'Red', element: 'Fire', meaning: 'Passion, transformation, clarity' },
    8: { color: 'White', element: 'Iron', meaning: 'Achievement, accumulation, power' },
    9: { color: 'Maroon/Red', element: 'Fire', meaning: 'Compassion, wisdom, liberation' },
  };

  const ANIMAL_PROFILES = {
    Mouse:  { quality: 'Clever, resourceful, adaptable',         challenge: 'Anxiety, hoarding',           element: 'Water' },
    Ox:     { quality: 'Patient, reliable, diligent',            challenge: 'Stubbornness, rigidity',       element: 'Earth' },
    Tiger:  { quality: 'Brave, passionate, unpredictable',       challenge: 'Impulsiveness, conflict',      element: 'Wood'  },
    Rabbit: { quality: 'Gentle, diplomatic, artistic',           challenge: 'Detachment, avoidance',        element: 'Wood'  },
    Dragon: { quality: 'Powerful, charismatic, visionary',       challenge: 'Arrogance, perfectionism',     element: 'Earth' },
    Snake:  { quality: 'Wise, intuitive, mysterious',            challenge: 'Secretiveness, possessiveness',element: 'Fire'  },
    Horse:  { quality: 'Free-spirited, passionate, independent', challenge: 'Impatience, inconsistency',    element: 'Fire'  },
    Sheep:  { quality: 'Gentle, creative, compassionate',        challenge: 'Indecisiveness, dependence',   element: 'Earth' },
    Monkey: { quality: 'Intelligent, witty, versatile',          challenge: 'Mischievousness, unreliability',element:'Metal'  },
    Bird:   { quality: 'Observant, precise, confident',          challenge: 'Critical, vain',               element: 'Metal' },
    Dog:    { quality: 'Loyal, honest, protective',              challenge: 'Anxious, defensive',           element: 'Earth' },
    Pig:    { quality: 'Generous, diligent, sincere',            challenge: 'Naive, overindulgent',         element: 'Water' },
  };

  return {
    tibetanYear: tibYear,
    animal,
    element,
    yinYang,
    mewaNumber: mewaYear,
    mewaMeaning: MEWA_MEANINGS[mewaYear],
    animalProfile: ANIMAL_PROFILES[animal],
    fullLabel: `${yinYang} ${element} ${animal}`,
  };
}
