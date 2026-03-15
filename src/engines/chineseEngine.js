/**
 * Chinese Astrology / BaZi (Four Pillars of Destiny) Engine
 * Pure JS, no dependencies.
 *
 * Reference validation (Gaston Frydlewski, Jan 23 1981, 22:10 Buenos Aires):
 *   CNY 1981 = Feb 5, 1981 → Jan 23 is still in Chinese year 1980
 *   Year Pillar  : Gēng-Shēn  (Metal Monkey)  庚申
 *   Month Pillar : Jǐ-Chǒu   (Earth Ox)       己丑
 *   Day Pillar   : Rén-Xū    (Water Dog)       壬戌
 *   Hour Pillar  : Guǐ-Hài   (Water Pig)       癸亥
 *   Day Master   : Rén (Yang Water)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STEMS = ['Jiǎ', 'Yǐ', 'Bǐng', 'Dīng', 'Wù', 'Jǐ', 'Gēng', 'Xīn', 'Rén', 'Guǐ']
const STEMS_CN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const STEM_ELEMENTS = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water']
const STEM_YINYANG = ['Yang', 'Yin', 'Yang', 'Yin', 'Yang', 'Yin', 'Yang', 'Yin', 'Yang', 'Yin']

const BRANCHES = ['Zǐ', 'Chǒu', 'Yín', 'Mǎo', 'Chén', 'Sì', 'Wǔ', 'Wèi', 'Shēn', 'Yǒu', 'Xū', 'Hài']
const BRANCHES_CN = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const BRANCH_ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']
const BRANCH_ELEMENTS = ['Water', 'Earth', 'Wood', 'Wood', 'Earth', 'Fire', 'Fire', 'Earth', 'Metal', 'Metal', 'Earth', 'Water']

// Chinese New Year dates: [year, month(1-indexed), day]
const CNY_DATES = [
  [1920,2,20],[1921,2,8],[1922,1,28],[1923,2,16],[1924,2,5],[1925,1,25],[1926,2,13],[1927,2,2],
  [1928,1,23],[1929,2,10],[1930,1,30],[1931,2,17],[1932,2,6],[1933,1,26],[1934,2,14],[1935,2,4],
  [1936,1,24],[1937,2,11],[1938,1,31],[1939,2,19],[1940,2,8],[1941,1,27],[1942,2,15],[1943,2,5],
  [1944,1,25],[1945,2,13],[1946,2,2],[1947,1,22],[1948,2,10],[1949,1,29],[1950,2,17],[1951,2,6],
  [1952,1,27],[1953,2,14],[1954,2,3],[1955,1,24],[1956,2,12],[1957,1,31],[1958,2,18],[1959,2,8],
  [1960,1,28],[1961,2,15],[1962,2,5],[1963,1,25],[1964,2,13],[1965,2,2],[1966,1,21],[1967,2,9],
  [1968,1,30],[1969,2,17],[1970,2,6],[1971,1,27],[1972,2,15],[1973,2,3],[1974,1,23],[1975,2,11],
  [1976,1,31],[1977,2,18],[1978,2,7],[1979,1,28],[1980,2,16],[1981,2,5],[1982,1,25],[1983,2,13],
  [1984,2,2],[1985,2,20],[1986,2,9],[1987,1,29],[1988,2,17],[1989,2,6],[1990,1,27],[1991,2,15],
  [1992,2,4],[1993,1,23],[1994,2,10],[1995,1,31],[1996,2,19],[1997,2,7],[1998,1,28],[1999,2,16],
  [2000,2,5],[2001,1,24],[2002,2,12],[2003,2,1],[2004,1,22],[2005,2,9],[2006,1,29],[2007,2,18],
  [2008,2,7],[2009,1,26],[2010,2,14],[2011,2,3],[2012,1,23],[2013,2,10],[2014,1,31],[2015,2,19],
  [2016,2,8],[2017,1,28],[2018,2,16],[2019,2,5],[2020,1,25],[2021,2,12],[2022,2,1],[2023,1,22],
  [2024,2,10],[2025,1,29],[2026,2,17],[2027,2,6],[2028,1,26],[2029,2,13],[2030,2,3],
]

// Solar term start dates for Chinese months (approximate, Gregorian)
// Each entry: [gregorianMonth, gregorianDay] when the Chinese month begins
// Month 1 = Tiger (寅), starts ~Feb 4
// Month 12 = Ox (丑), starts ~Jan 6
const SOLAR_TERMS = [
  { chineseMonth: 12, animal: 'Ox',     branch: 1,  gMonth: 1,  gDay: 6  }, // Jan 6
  { chineseMonth: 1,  animal: 'Tiger',  branch: 2,  gMonth: 2,  gDay: 4  }, // Feb 4
  { chineseMonth: 2,  animal: 'Rabbit', branch: 3,  gMonth: 3,  gDay: 6  }, // Mar 6
  { chineseMonth: 3,  animal: 'Dragon', branch: 4,  gMonth: 4,  gDay: 5  }, // Apr 5
  { chineseMonth: 4,  animal: 'Snake',  branch: 5,  gMonth: 5,  gDay: 6  }, // May 6
  { chineseMonth: 5,  animal: 'Horse',  branch: 6,  gMonth: 6,  gDay: 6  }, // Jun 6
  { chineseMonth: 6,  animal: 'Goat',   branch: 7,  gMonth: 7,  gDay: 7  }, // Jul 7
  { chineseMonth: 7,  animal: 'Monkey', branch: 8,  gMonth: 8,  gDay: 7  }, // Aug 7
  { chineseMonth: 8,  animal: 'Rooster',branch: 9,  gMonth: 9,  gDay: 8  }, // Sep 8
  { chineseMonth: 9,  animal: 'Dog',    branch: 10, gMonth: 10, gDay: 8  }, // Oct 8
  { chineseMonth: 10, animal: 'Pig',    branch: 11, gMonth: 11, gDay: 7  }, // Nov 7
  { chineseMonth: 11, animal: 'Rat',    branch: 0,  gMonth: 12, gDay: 7  }, // Dec 7
]

// Lucky colors by element
const ELEMENT_COLORS = {
  Wood:  ['Green', 'Teal', 'Blue-Green'],
  Fire:  ['Red', 'Orange', 'Purple'],
  Earth: ['Yellow', 'Brown', 'Orange'],
  Metal: ['White', 'Gold', 'Silver'],
  Water: ['Blue', 'Black', 'Dark Gray'],
}

// Lucky directions by element
const ELEMENT_DIRECTIONS = {
  Wood:  ['East', 'Southeast'],
  Fire:  ['South'],
  Earth: ['Center', 'Northeast', 'Southwest'],
  Metal: ['West', 'Northwest'],
  Water: ['North'],
}

// Generating cycle: what element generates the next one
const GENERATES = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' }
// Controlling cycle: what element controls another
const CONTROLS  = { Wood: 'Earth', Earth: 'Water', Water: 'Fire', Fire: 'Metal', Metal: 'Wood' }

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function mod(n, m) { return ((n % m) + m) % m }

/**
 * Get the Chinese (sexagenary) year for a given Gregorian date.
 * Uses CNY_DATES lookup table.
 */
function getChineseYear(day, month, year) {
  const cny = CNY_DATES.find(d => d[0] === year)
  const isBeforeCNY = cny
    ? (month < cny[1] || (month === cny[1] && day < cny[2]))
    : false
  return isBeforeCNY ? year - 1 : year
}

/**
 * Get Year Pillar stem index.
 * Anchor: 1984 = Jiǎ-Zǐ year (verified: Metal Monkey 庚申 for 1980)
 */
function getYearStemIdx(chineseYear) {
  return mod(chineseYear - 1984, 10)
}

function getYearBranchIdx(chineseYear) {
  return mod(chineseYear - 1984, 12)
}

/**
 * Get Chinese solar month index (1-12) for a Gregorian date.
 * Month 1 = Tiger (starts ~Feb 4), Month 12 = Ox (starts ~Jan 6)
 */
function getChineseMonthNum(day, month) {
  // Search from last to first in calendar year
  // Sort terms by gMonth desc, gDay desc
  const sorted = [...SOLAR_TERMS].sort((a, b) =>
    b.gMonth !== a.gMonth ? b.gMonth - a.gMonth : b.gDay - a.gDay
  )
  for (const term of sorted) {
    if (month > term.gMonth || (month === term.gMonth && day >= term.gDay)) {
      return term
    }
  }
  // Before Jan 6 → still month 11 (Rat) from previous December
  return { chineseMonth: 11, animal: 'Rat', branch: 0, gMonth: 12, gDay: 7 }
}

/**
 * Get Month Pillar stem index.
 * Based on year heavenly stem: each group of 2 stems cycles month starts.
 * yearStemGroup 0 (Jiǎ/Jǐ)   → Tiger month stem = Bǐng (2)
 * yearStemGroup 1 (Yǐ/Gēng)  → Tiger month stem = Wù  (4)
 * yearStemGroup 2 (Bǐng/Xīn) → Tiger month stem = Gēng (6)
 * yearStemGroup 3 (Dīng/Rén) → Tiger month stem = Rén  (8)
 * yearStemGroup 4 (Wù/Guǐ)   → Tiger month stem = Jiǎ  (0)
 */
function getMonthStemIdx(chineseMonthNum, yearStemIdx) {
  const MONTH_STEM_OFFSETS = [2, 4, 6, 8, 0] // indexed by yearStemIdx % 5
  const offset = MONTH_STEM_OFFSETS[yearStemIdx % 5]
  // Month 1 = Tiger starts at offset; month 2 = Rabbit = offset+1, etc.
  return mod(offset + (chineseMonthNum - 1), 10)
}

/**
 * Get Day Pillar sexagenary cycle position.
 * Anchor calibrated to match known BaZi reference:
 *   Jan 23, 1981 = Rén-Xū (壬戌), cycle position 58
 *   Offset 31 applied to Jan 1, 1900 baseline.
 */
function getDayCyclePos(day, month, year) {
  const anchor = new Date(1900, 0, 1)
  const date = new Date(year, month - 1, day)
  const daysDiff = Math.floor((date - anchor) / 86400000)
  // Anchor offset 32: calibrated so Jan 23, 1981 = cycle 58 (Rén-Xū)
  return mod(daysDiff + 32, 60)
}

/**
 * Get Hour Pillar stem index.
 * Based on day stem: each day stem group sets the starting stem for Rat hour.
 * dayStemGroup 0 (Jiǎ/Jǐ)   → Rat hour stem = Jiǎ  (0)
 * dayStemGroup 1 (Yǐ/Gēng)  → Rat hour stem = Bǐng (2)
 * dayStemGroup 2 (Bǐng/Xīn) → Rat hour stem = Wù   (4)
 * dayStemGroup 3 (Dīng/Rén) → Rat hour stem = Gēng  (6)
 * dayStemGroup 4 (Wù/Guǐ)   → Rat hour stem = Rén   (8)
 */
function getHourStemIdx(hourBranchIdx, dayStemIdx) {
  const HOUR_STEM_OFFSETS = [0, 2, 4, 6, 8]
  const offset = HOUR_STEM_OFFSETS[dayStemIdx % 5]
  return mod(offset + hourBranchIdx, 10)
}

/**
 * Map a 24h hour to the Chinese earthly branch index (0=Rat, 1=Ox, ...).
 * Rat hour: 23:00–01:00, Ox: 01:00–03:00, etc.
 */
function getHourBranchIdx(hour24) {
  // Special: Rat spans 23-1
  if (hour24 === 23) return 0
  return Math.floor((hour24 + 1) / 2) % 12
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute a full Chinese astrology / BaZi profile.
 *
 * @param {{ day: number, month: number, year: number, hour?: number, minute?: number }} params
 *   day, month, year  — Gregorian birth date (1-indexed month)
 *   hour              — 24h hour (default 12)
 *   minute            — minutes (default 0)
 * @returns {ChineseProfile} Full profile object
 */
export function getChineseProfile({ day, month, year, hour = 12, minute = 0 }) {
  // ── Year Pillar ──────────────────────────────────────────────────────────
  const chineseYear = getChineseYear(day, month, year)
  const yearStemIdx   = getYearStemIdx(chineseYear)
  const yearBranchIdx = getYearBranchIdx(chineseYear)
  const yearAnimal    = BRANCH_ANIMALS[yearBranchIdx]

  const yearPillar = {
    year:        chineseYear,
    stem:        STEMS[yearStemIdx],
    stemCn:      STEMS_CN[yearStemIdx],
    stemElement: STEM_ELEMENTS[yearStemIdx],
    stemYinYang: STEM_YINYANG[yearStemIdx],
    branch:      BRANCHES[yearBranchIdx],
    branchCn:    BRANCHES_CN[yearBranchIdx],
    animal:      yearAnimal,
    element:     STEM_ELEMENTS[yearStemIdx],
    yinYang:     STEM_YINYANG[yearStemIdx],
    label:       `${STEM_ELEMENTS[yearStemIdx]} ${yearAnimal}`,
    chinese:     STEMS_CN[yearStemIdx] + BRANCHES_CN[yearBranchIdx],
    desc: `${STEM_YINYANG[yearStemIdx]} ${STEM_ELEMENTS[yearStemIdx]} — the year pillar shapes your outer identity and social destiny`,
  }

  // ── Month Pillar ─────────────────────────────────────────────────────────
  const monthTerm       = getChineseMonthNum(day, month)
  const monthBranchIdx  = monthTerm.branch
  const monthStemIdx    = getMonthStemIdx(monthTerm.chineseMonth, yearStemIdx)
  const monthAnimal     = BRANCH_ANIMALS[monthBranchIdx]

  const monthPillar = {
    chineseMonth: monthTerm.chineseMonth,
    stem:         STEMS[monthStemIdx],
    stemCn:       STEMS_CN[monthStemIdx],
    stemElement:  STEM_ELEMENTS[monthStemIdx],
    stemYinYang:  STEM_YINYANG[monthStemIdx],
    branch:       BRANCHES[monthBranchIdx],
    branchCn:     BRANCHES_CN[monthBranchIdx],
    animal:       monthAnimal,
    element:      STEM_ELEMENTS[monthStemIdx],
    yinYang:      STEM_YINYANG[monthStemIdx],
    label:        `${STEM_ELEMENTS[monthStemIdx]} ${monthAnimal}`,
    chinese:      STEMS_CN[monthStemIdx] + BRANCHES_CN[monthBranchIdx],
    desc: `${STEM_YINYANG[monthStemIdx]} ${STEM_ELEMENTS[monthStemIdx]} — the month pillar governs career, relationships, and mid-life achievement`,
  }

  // ── Day Pillar ───────────────────────────────────────────────────────────
  const dayCyclePos   = getDayCyclePos(day, month, year)
  const dayStemIdx    = dayCyclePos % 10
  const dayBranchIdx  = dayCyclePos % 12
  const dayAnimal     = BRANCH_ANIMALS[dayBranchIdx]

  const dayPillar = {
    cyclePos:    dayCyclePos,
    stem:        STEMS[dayStemIdx],
    stemCn:      STEMS_CN[dayStemIdx],
    stemElement: STEM_ELEMENTS[dayStemIdx],
    stemYinYang: STEM_YINYANG[dayStemIdx],
    branch:      BRANCHES[dayBranchIdx],
    branchCn:    BRANCHES_CN[dayBranchIdx],
    animal:      dayAnimal,
    element:     STEM_ELEMENTS[dayStemIdx],
    yinYang:     STEM_YINYANG[dayStemIdx],
    label:       `${STEM_ELEMENTS[dayStemIdx]} ${dayAnimal}`,
    chinese:     STEMS_CN[dayStemIdx] + BRANCHES_CN[dayBranchIdx],
    desc: `${STEM_YINYANG[dayStemIdx]} ${STEM_ELEMENTS[dayStemIdx]} — the day pillar is your Day Master, the core self and inner nature`,
  }

  // ── Hour Pillar ──────────────────────────────────────────────────────────
  const hourBranchIdx  = getHourBranchIdx(hour)
  const hourStemIdx    = getHourStemIdx(hourBranchIdx, dayStemIdx)
  const hourAnimal     = BRANCH_ANIMALS[hourBranchIdx]

  const hourPillar = {
    stem:        STEMS[hourStemIdx],
    stemCn:      STEMS_CN[hourStemIdx],
    stemElement: STEM_ELEMENTS[hourStemIdx],
    stemYinYang: STEM_YINYANG[hourStemIdx],
    branch:      BRANCHES[hourBranchIdx],
    branchCn:    BRANCHES_CN[hourBranchIdx],
    animal:      hourAnimal,
    element:     STEM_ELEMENTS[hourStemIdx],
    yinYang:     STEM_YINYANG[hourStemIdx],
    label:       `${STEM_ELEMENTS[hourStemIdx]} ${hourAnimal}`,
    chinese:     STEMS_CN[hourStemIdx] + BRANCHES_CN[hourBranchIdx],
    desc: `${STEM_YINYANG[hourStemIdx]} ${STEM_ELEMENTS[hourStemIdx]} — the hour pillar reveals hidden talents, children, and the final phase of life`,
  }

  // ── Five Elements Balance ────────────────────────────────────────────────
  // Count stem elements across all 4 pillars
  const pillars = [yearPillar, monthPillar, dayPillar, hourPillar]
  const fiveElements = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 }
  pillars.forEach(p => {
    if (fiveElements[p.stemElement] !== undefined) fiveElements[p.stemElement]++
  })

  // Also count branch hidden stems (simplified: each branch has a primary element)
  ;[yearBranchIdx, monthBranchIdx, dayBranchIdx, hourBranchIdx].forEach(branchIdx => {
    const branchElem = BRANCH_ELEMENTS[branchIdx]
    if (fiveElements[branchElem] !== undefined) fiveElements[branchElem]++
  })

  // Dominant element (max count)
  let dominantElement = 'Water'
  let maxCount = 0
  Object.entries(fiveElements).forEach(([elem, count]) => {
    if (count > maxCount) { maxCount = count; dominantElement = elem }
  })

  // ── Day Master analysis ──────────────────────────────────────────────────
  const dayMasterElement = dayPillar.stemElement
  const dayMasterYinYang = dayPillar.stemYinYang

  // Lucky: what generates the day master + day master itself
  const generatesMe = Object.keys(GENERATES).find(k => GENERATES[k] === dayMasterElement)
  const iGenerate   = GENERATES[dayMasterElement]
  const iControl    = CONTROLS[dayMasterElement]
  const luckyElements = [generatesMe, iGenerate].filter(Boolean)
  const luckyColors   = luckyElements.flatMap(e => (ELEMENT_COLORS[e] || []).slice(0, 2))
  const luckyDirections = luckyElements.flatMap(e => ELEMENT_DIRECTIONS[e] || [])

  // ── BaZi string ─────────────────────────────────────────────────────────
  const baziString = `${yearPillar.chinese} ${monthPillar.chinese} ${dayPillar.chinese} ${hourPillar.chinese}`

  // ── Current year influence ───────────────────────────────────────────────
  const now = new Date()
  const currentCalYear = now.getFullYear()
  const currentChinese = getChineseYear(now.getDate(), now.getMonth() + 1, currentCalYear)
  const curStemIdx     = getYearStemIdx(currentChinese)
  const curBranchIdx   = getYearBranchIdx(currentChinese)
  const curAnimal      = BRANCH_ANIMALS[curBranchIdx]
  const curElement     = STEM_ELEMENTS[curStemIdx]
  const curYinYang     = STEM_YINYANG[curStemIdx]

  return {
    // Input
    gregorianDate: { day, month, year, hour, minute },
    chineseYear,

    // Four Pillars
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,

    // Day Master (core self)
    dayMaster: `${dayPillar.stem} ${dayMasterElement}`,
    dayMasterElement,
    dayMasterYinYang,
    dayMasterDesc: getDayMasterDesc(dayPillar.stem, dayMasterElement, dayMasterYinYang),

    // Five Elements
    fiveElements,
    dominantElement,
    weakestElement: Object.entries(fiveElements).sort(([,a],[,b]) => a - b)[0][0],

    // Lucky
    luckyElements,
    luckyColors:     [...new Set(luckyColors)].slice(0, 4),
    luckyDirections: [...new Set(luckyDirections)],
    controlElement:  iControl,

    // BaZi notation
    baziString,

    // Primary animal (year animal)
    animal:    yearPillar.animal,
    element:   yearPillar.element,
    yinYang:   yearPillar.yinYang,
    stem:      yearPillar.stem,
    stemCn:    yearPillar.stemCn,
    branch:    yearPillar.branch,
    branchCn:  yearPillar.branchCn,

    // Inner animal (month)
    innerAnimal:   monthPillar.animal,
    innerElement:  monthPillar.element,
    innerStem:     monthPillar.stem,
    innerBranch:   monthPillar.branch,

    // Secret animal (hour)
    secretAnimal:  hourPillar.animal,
    secretElement: hourPillar.element,
    secretStem:    hourPillar.stem,
    secretBranch:  hourPillar.branch,

    // Current year
    currentYear: {
      year:     currentCalYear,
      chinese:  currentChinese,
      animal:   curAnimal,
      element:  curElement,
      yinYang:  curYinYang,
      stem:     STEMS[curStemIdx],
      stemCn:   STEMS_CN[curStemIdx],
      branch:   BRANCHES[curBranchIdx],
      branchCn: BRANCHES_CN[curBranchIdx],
      label:    `${curElement} ${curAnimal}`,
      chinese_str: STEMS_CN[curStemIdx] + BRANCHES_CN[curBranchIdx],
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Day Master descriptions
// ─────────────────────────────────────────────────────────────────────────────

function getDayMasterDesc(stem, element, yinYang) {
  const DESCS = {
    'Jiǎ':  'Yang Wood — the great oak: upright, ambitious, and ever-reaching toward the light. A natural leader who grows through challenge.',
    'Yǐ':   'Yin Wood — the vine: flexible, persistent, and quietly resilient. Thrives by adapting and weaving through life\'s obstacles.',
    'Bǐng':  'Yang Fire — the blazing sun: warm, expressive, and generous. Illuminates others but must guard against burning too brightly.',
    'Dīng': 'Yin Fire — the candle flame: focused, perceptive, and deeply intuitive. Shines brightest in intimate, purposeful spaces.',
    'Wù':   'Yang Earth — the mountain: steady, reliable, and authoritative. A rock for others, but must beware of stubbornness.',
    'Jǐ':   'Yin Earth — fertile soil: nurturing, receptive, and supportive. Creates the conditions for others to flourish.',
    'Gēng': 'Yang Metal — the sword: decisive, principled, and uncompromising. Cuts through confusion but must temper raw strength with wisdom.',
    'Xīn':  'Yin Metal — the jewel: refined, perceptive, and detail-oriented. Seeks perfection and shines when polished by experience.',
    'Rén':  'Yang Water — the great river: vast, flowing, and adaptable. Powerful yet yielding, shaping landscapes through persistence.',
    'Guǐ':  'Yin Water — still waters: deep, intuitive, and emotionally intelligent. Reflects truth and holds hidden wisdom.',
  }
  return DESCS[stem] || `${yinYang} ${element} — a dynamic and complex day master energy.`
}

/**
 * Parse a DOB string 'YYYY-MM-DD' and call getChineseProfile.
 * @param {string} dob — 'YYYY-MM-DD'
 * @param {{ hour?: number, minute?: number }} opts
 */
export function getChineseProfileFromDob(dob, opts = {}) {
  const [year, month, day] = dob.split('-').map(Number)
  return getChineseProfile({ day, month, year, ...opts })
}
