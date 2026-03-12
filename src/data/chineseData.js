/* ---------------------------------------------------------------
   Chinese Zodiac / Astrology data
   --------------------------------------------------------------- */

export const CHINESE_ANIMALS = [
  {
    name: 'Rat', branch: '\u5B50', emoji: '\uD83D\uDC00', order: 1,
    years: [1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020],
    fixedElement: 'Water', yinYang: 'Yang', season: 'Winter',
    traits: ['Quick-witted', 'Resourceful', 'Versatile', 'Charming'],
    compatible: ['Dragon', 'Monkey', 'Ox'],
    incompatible: ['Horse', 'Rooster'],
  },
  {
    name: 'Ox', branch: '\u4E11', emoji: '\uD83D\uDC02', order: 2,
    years: [1925, 1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021],
    fixedElement: 'Earth', yinYang: 'Yin', season: 'Winter',
    traits: ['Diligent', 'Dependable', 'Patient', 'Determined'],
    compatible: ['Rat', 'Snake', 'Rooster'],
    incompatible: ['Goat', 'Horse'],
  },
  {
    name: 'Tiger', branch: '\u5BC5', emoji: '\uD83D\uDC05', order: 3,
    years: [1926, 1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022],
    fixedElement: 'Wood', yinYang: 'Yang', season: 'Spring',
    traits: ['Brave', 'Confident', 'Competitive', 'Passionate'],
    compatible: ['Dragon', 'Horse', 'Pig'],
    incompatible: ['Monkey', 'Snake'],
  },
  {
    name: 'Rabbit', branch: '\u536F', emoji: '\uD83D\uDC07', order: 4,
    years: [1927, 1939, 1951, 1963, 1975, 1987, 1999, 2011, 2023],
    fixedElement: 'Wood', yinYang: 'Yin', season: 'Spring',
    traits: ['Gentle', 'Elegant', 'Compassionate', 'Vigilant'],
    compatible: ['Goat', 'Pig', 'Dog'],
    incompatible: ['Rooster', 'Rat'],
  },
  {
    name: 'Dragon', branch: '\u8FB0', emoji: '\uD83D\uDC09', order: 5,
    years: [1928, 1940, 1952, 1964, 1976, 1988, 2000, 2012, 2024],
    fixedElement: 'Earth', yinYang: 'Yang', season: 'Spring',
    traits: ['Ambitious', 'Energetic', 'Charismatic', 'Fearless'],
    compatible: ['Rooster', 'Rat', 'Monkey'],
    incompatible: ['Dog', 'Rabbit'],
  },
  {
    name: 'Snake', branch: '\u5DF3', emoji: '\uD83D\uDC0D', order: 6,
    years: [1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, 2025],
    fixedElement: 'Fire', yinYang: 'Yin', season: 'Summer',
    traits: ['Wise', 'Enigmatic', 'Intuitive', 'Graceful'],
    compatible: ['Rooster', 'Ox', 'Dragon'],
    incompatible: ['Tiger', 'Pig'],
  },
  {
    name: 'Horse', branch: '\u5348', emoji: '\uD83D\uDC0E', order: 7,
    years: [1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026],
    fixedElement: 'Fire', yinYang: 'Yang', season: 'Summer',
    traits: ['Spirited', 'Active', 'Warm-hearted', 'Independent'],
    compatible: ['Tiger', 'Goat', 'Dog'],
    incompatible: ['Rat', 'Ox'],
  },
  {
    name: 'Goat', branch: '\u672A', emoji: '\uD83D\uDC0F', order: 8,
    years: [1931, 1943, 1955, 1967, 1979, 1991, 2003, 2015, 2027],
    fixedElement: 'Earth', yinYang: 'Yin', season: 'Summer',
    traits: ['Calm', 'Gentle', 'Creative', 'Sympathetic'],
    compatible: ['Horse', 'Rabbit', 'Pig'],
    incompatible: ['Ox', 'Rat'],
  },
  {
    name: 'Monkey', branch: '\u7533', emoji: '\uD83D\uDC12', order: 9,
    years: [1932, 1944, 1956, 1968, 1980, 1992, 2004, 2016, 2028],
    fixedElement: 'Metal', yinYang: 'Yang', season: 'Autumn',
    traits: ['Clever', 'Curious', 'Inventive', 'Sociable'],
    compatible: ['Rat', 'Dragon', 'Snake'],
    incompatible: ['Tiger', 'Pig'],
  },
  {
    name: 'Rooster', branch: '\u9149', emoji: '\uD83D\uDC13', order: 10,
    years: [1921, 1933, 1945, 1957, 1969, 1981, 1993, 2005, 2017, 2029],
    fixedElement: 'Metal', yinYang: 'Yin', season: 'Autumn',
    traits: ['Observant', 'Hardworking', 'Resourceful', 'Courageous', 'Honest'],
    compatible: ['Ox', 'Snake', 'Dragon'],
    incompatible: ['Rabbit', 'Dog', 'Rooster'],
  },
  {
    name: 'Dog', branch: '\u620C', emoji: '\uD83D\uDC15', order: 11,
    years: [1922, 1934, 1946, 1958, 1970, 1982, 1994, 2006, 2018],
    fixedElement: 'Earth', yinYang: 'Yang', season: 'Autumn',
    traits: ['Loyal', 'Honest', 'Prudent', 'Amiable'],
    compatible: ['Tiger', 'Rabbit', 'Horse'],
    incompatible: ['Dragon', 'Goat', 'Rooster'],
  },
  {
    name: 'Pig', branch: '\u4EA5', emoji: '\uD83D\uDC16', order: 12,
    years: [1923, 1935, 1947, 1959, 1971, 1983, 1995, 2007, 2019],
    fixedElement: 'Water', yinYang: 'Yin', season: 'Winter',
    traits: ['Compassionate', 'Generous', 'Diligent', 'Optimistic'],
    compatible: ['Tiger', 'Rabbit', 'Goat'],
    incompatible: ['Snake', 'Monkey'],
  },
]

export const FIVE_ELEMENTS = [
  { name: 'Wood',  chinese: '\u6728', color: '#4caf50', yin: 'Yi',   yang: 'Jia',  season: 'Spring', direction: 'East',  qualities: ['Growth', 'Flexibility', 'Kindness', 'Creativity'] },
  { name: 'Fire',  chinese: '\u706B', color: '#e53935', yin: 'Ding', yang: 'Bing', season: 'Summer', direction: 'South', qualities: ['Passion', 'Joy', 'Dynamism', 'Illumination'] },
  { name: 'Earth', chinese: '\u571F', color: '#d4a017', yin: 'Ji',   yang: 'Wu',   season: 'Late Summer', direction: 'Center', qualities: ['Stability', 'Nourishment', 'Balance', 'Honesty'] },
  { name: 'Metal', chinese: '\u91D1', color: '#cfd8dc', yin: 'Xin',  yang: 'Geng', season: 'Autumn', direction: 'West',  qualities: ['Precision', 'Discipline', 'Righteousness', 'Clarity'] },
  { name: 'Water', chinese: '\u6C34', color: '#1e88e5', yin: 'Gui',  yang: 'Ren',  season: 'Winter', direction: 'North', qualities: ['Wisdom', 'Adaptability', 'Depth', 'Persistence'] },
]

/*
 * CHINESE_PROFILE for Gaston
 * Born January 23, 1981 -- Chinese New Year 1981 fell on February 5.
 * Since Jan 23 is BEFORE CNY, the Chinese zodiac year is 1980.
 * 1980 is the Year of the Metal Monkey (Geng Shen).
 */
export const CHINESE_PROFILE = {
  name: 'Gaston Frydlewski',
  dob: '1981-01-23',

  /* Primary animal sign -- 1980 Chinese year */
  animal: 'Monkey',
  branch: '\u7533',        // Earthly Branch: Shen
  branchPinyin: 'Shen',
  element: 'Metal',
  elementChinese: '\u91D1',
  stem: 'Geng',            // Heavenly Stem (Yang Metal)
  stemChinese: '\u5E9A',
  yinYang: 'Yang',
  polarity: 'Yang Metal',

  /* Inner animal (month of birth) -- January = Ox month (Chou) */
  innerAnimal: 'Ox',
  innerBranch: '\u4E11',
  innerElement: 'Earth',   // Ji Chou month (Earth Ox) in late 1980 Chinese year
  innerStem: 'Ji',

  /* Secret animal (hour of birth ~22:10) -- Hai hour (21:00-23:00) = Pig */
  secretAnimal: 'Pig',
  secretBranch: '\u4EA5',
  secretElement: 'Water',
  secretStem: 'Gui',

  /* Compatibility */
  compatible: ['Rat', 'Dragon', 'Snake'],
  incompatible: ['Tiger', 'Pig'],
  bestFriend: 'Rat',
  conflictAnimal: 'Tiger',

  /* Lucky attributes */
  lucky: {
    numbers: [1, 7, 8],
    colors: ['White', 'Gold', 'Blue'],
    flowers: ['Chrysanthemum', 'Allium'],
    directions: ['North', 'Northwest', 'West'],
    day: 'Thursday',
  },

  /* Four Pillars (Ba Zi) -- simplified */
  fourPillars: {
    year:  { stem: 'Geng', branch: 'Shen', label: 'Metal Monkey', desc: 'Yang Metal on Yang Metal -- double Metal sharpens intellect, resourcefulness, and strategic thinking' },
    month: { stem: 'Ji',   branch: 'Chou', label: 'Earth Ox',     desc: 'Yin Earth on Yin Earth -- grounding stability beneath the Monkey\'s restless brilliance' },
    day:   { stem: 'Ren',  branch: 'Xu',   label: 'Water Dog',    desc: 'Yang Water on Yang Earth -- the day master reveals an adaptable, deep-thinking core self' },
    hour:  { stem: 'Gui',  branch: 'Hai',  label: 'Water Pig',    desc: 'Yin Water on Yin Water -- nighttime birth deepens intuition, emotional wisdom, and hidden reserves' },
  },
  dayMaster: 'Ren Water',
  dayMasterDesc: 'Yang Water -- vast, flowing, adaptable. Like a great river: powerful yet yielding, seeking the lowest path while shaping landscapes.',

  /* Current year influence (2026) */
  currentYear: {
    year: 2026,
    animal: 'Horse',
    element: 'Fire',
    stem: 'Bing',
    label: 'Fire Horse',
    chinese: '\u4E19\u5348',
    influence: 'The Fire Horse year brings dynamic, restless energy that opposes the Monkey\'s strategic nature. Fire controls Metal -- expect pressure to transform through action rather than planning. Career momentum accelerates but demands decisive moves. The Monkey\'s cleverness becomes an asset when channeled into adaptability rather than overthinking. Relationships benefit from spontaneity. Health focus: heart, circulation, and stress management through play.',
    rating: 'Challenging Growth',
    ratingColor: '#e57c22',
  },
}
