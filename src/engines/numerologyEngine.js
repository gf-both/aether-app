/**
 * Numerology Calculation Engine
 * Pure JS, no dependencies.
 * Pythagorean system with Master Number support (11, 22, 33).
 *
 * Reference validation (Gaston Frydlewski, Jan 23 1981):
 *   Life Path: 7, Expression: 1 (Master 22 in first name),
 *   Soul Urge: 3, Birthday: 23, Personality: 7, Maturity: 8
 *   Personal Year 2026: 7, Pinnacles: 6/6/3/2, Challenges: 4/4/0/0
 */

// ─────────────────────────────────────────────────────────────────────────────
// Pythagorean Letter Values
// ─────────────────────────────────────────────────────────────────────────────
const LETTER_VALUES = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
}

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U'])

// ─────────────────────────────────────────────────────────────────────────────
// Number Meanings
// ─────────────────────────────────────────────────────────────────────────────
const NUMBER_MEANINGS = {
  1:  { title: 'The Initiator',      desc: 'Independence, originality, leadership, pioneer energy' },
  2:  { title: 'The Diplomat',       desc: 'Cooperation, sensitivity, balance, partnership' },
  3:  { title: 'The Communicator',   desc: 'Self-expression, creativity, joy, artistic talent' },
  4:  { title: 'The Builder',        desc: 'Discipline, stability, hard work, foundation' },
  5:  { title: 'The Adventurer',     desc: 'Freedom, change, versatility, progressive energy' },
  6:  { title: 'The Nurturer',       desc: 'Responsibility, family, love, domestic harmony' },
  7:  { title: 'The Seeker',         desc: 'Introspection, analysis, wisdom, spiritual seeking' },
  8:  { title: 'The Powerhouse',     desc: 'Material mastery, authority, abundance, achievement' },
  9:  { title: 'The Humanitarian',   desc: 'Compassion, completion, universal love, service' },
  11: { title: 'Master Intuitive',   desc: 'Spiritual insight, intuition, illumination, nervous energy' },
  22: { title: 'Master Builder',     desc: 'Turning dreams into reality, large-scale vision, discipline' },
  33: { title: 'Master Teacher',     desc: 'Healing, compassion, spiritual teacher, selfless service' },
}

// Personal cycle titles (different from core)
const PERSONAL_YEAR_TITLES = {
  1: 'New Beginnings',
  2: 'Cooperation',
  3: 'Expansion',
  4: 'Foundation',
  5: 'Change',
  6: 'Harmony',
  7: 'Reflection',
  8: 'Abundance',
  9: 'Completion',
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Sum all digits of a number */
function sumDigits(n) {
  return String(Math.abs(n))
    .split('')
    .reduce((acc, d) => acc + Number(d), 0)
}

/** Reduce a number to single digit, preserving Master Numbers 11, 22, 33 */
function reduce(n, keepMasters = true) {
  if (keepMasters && (n === 11 || n === 22 || n === 33)) return n
  if (n <= 9) return n
  const s = sumDigits(n)
  return reduce(s, keepMasters)
}

/** Check if a number is a Master Number */
function isMaster(n) {
  return n === 11 || n === 22 || n === 33
}

/**
 * Reduce a number, but return { raw, reduced, master }.
 * Tracks whether the pre-reduction value was a master.
 */
function reduceWithMeta(n) {
  if (isMaster(n)) return { raw: n, reduced: n, master: true }
  if (n <= 9) return { raw: n, reduced: n, master: false }
  const s = sumDigits(n)
  const inner = reduceWithMeta(s)
  return { raw: n, reduced: inner.reduced, master: inner.master }
}

/** Parse 'YYYY-MM-DD' → { day, month, year } */
function parseDob(dob) {
  const [y, m, d] = dob.split('-').map(Number)
  return { year: y, month: m, day: d }
}

/**
 * Get the value of a name word, tracking per-word masters and digit frequencies.
 * Returns { sum, master, masterVal }
 */
function wordValue(word) {
  let sum = 0
  for (const ch of word.toUpperCase()) {
    if (LETTER_VALUES[ch]) sum += LETTER_VALUES[ch]
  }
  const meta = reduceWithMeta(sum)
  return { sum, reduced: meta.reduced, master: meta.master }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Calculations
// ─────────────────────────────────────────────────────────────────────────────

/** Life Path: reduce month, day, year separately, then sum and reduce */
function calcLifePath(day, month, year) {
  const m = reduce(month)
  const d = reduce(day)

  // Reduce year digit-by-digit
  let y = sumDigits(year)
  if (!isMaster(y)) y = reduce(y)

  const total = m + d + y
  const meta = reduceWithMeta(total)

  const derivation = [
    `Month: ${month} (${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month-1]}) → ${m}`,
    `Day: ${day} → ${reduce(day)}`,
    `Year: ${year} → ${sumDigits(year)}${sumDigits(year) !== reduce(year) ? ` → ${reduce(year)}` : ''}`,
    `Total: ${m} + ${d} + ${y} = ${total}${total !== meta.reduced ? ` → ${meta.reduced}` : ''}`,
  ].join('\n')

  return {
    val: meta.reduced,
    master: meta.master,
    reducedMonth: m,
    reducedDay: d,
    reducedYear: y,
    derivation,
  }
}

/**
 * Expression (Destiny): sum all letter values in full name.
 * Preserve master numbers at the word level before combining.
 */
function calcExpression(fullName) {
  const words = fullName.toUpperCase().split(/\s+/).filter(Boolean)
  const wordResults = words.map(w => {
    const sum = [...w].reduce((a, ch) => a + (LETTER_VALUES[ch] || 0), 0)
    const meta = reduceWithMeta(sum)
    return { word: w, sum, reduced: meta.reduced, master: meta.master }
  })

  // Find any master numbers in individual name words
  const masterInName = wordResults.filter(r => r.master).map(r => r.reduced)

  // For total: use reduced word values (masters stay as-is)
  const totalRaw = wordResults.reduce((a, r) => a + r.reduced, 0)
  const meta = reduceWithMeta(totalRaw)

  const wordDerivations = wordResults.map(r =>
    `${r.word}: ${[...r.word].map(ch => `${ch}(${LETTER_VALUES[ch]||0})`).join('+')} = ${r.sum}${r.master ? ' (Master!)' : r.sum !== r.reduced ? ` → ${r.reduced}` : ''}`
  )
  const derivation = [
    ...wordDerivations,
    `Total: ${wordResults.map(r => r.master ? `${r.reduced}(M)` : r.reduced).join('+')} = ${totalRaw}${totalRaw !== meta.reduced ? ` → ${meta.reduced}` : ''}`,
  ].join('\n')

  return {
    val: meta.reduced,
    master: meta.master,
    masterInName: masterInName.length > 0 ? masterInName[0] : null,
    wordResults,
    derivation,
  }
}

/** Soul Urge: sum only vowels (A, E, I, O, U) */
function calcSoulUrge(fullName) {
  const words = fullName.toUpperCase().split(/\s+/).filter(Boolean)
  const wordResults = words.map(w => {
    const vowelChars = [...w].filter(ch => VOWELS.has(ch))
    const sum = vowelChars.reduce((a, ch) => a + (LETTER_VALUES[ch] || 0), 0)
    return { word: w, vowelChars, sum }
  })

  const totalRaw = wordResults.reduce((a, r) => a + r.sum, 0)
  const meta = reduceWithMeta(totalRaw)

  const wordDerivations = wordResults.map(r =>
    `${r.word}: ${r.vowelChars.length ? r.vowelChars.map(ch => `${ch}(${LETTER_VALUES[ch]})`).join('+') + ` = ${r.sum}` : 'no vowels'}`
  )
  const derivation = [
    ...wordDerivations,
    `Total: ${totalRaw}${totalRaw !== meta.reduced ? ` → ${meta.reduced}` : ''}`,
  ].join('\n')

  return {
    val: meta.reduced,
    master: meta.master,
    derivation,
  }
}

/** Personality: sum only consonants */
function calcPersonality(fullName) {
  const words = fullName.toUpperCase().split(/\s+/).filter(Boolean)
  const wordResults = words.map(w => {
    const consChars = [...w].filter(ch => LETTER_VALUES[ch] && !VOWELS.has(ch))
    const sum = consChars.reduce((a, ch) => a + (LETTER_VALUES[ch] || 0), 0)
    return { word: w, consChars, sum }
  })

  const totalRaw = wordResults.reduce((a, r) => a + r.sum, 0)
  const meta = reduceWithMeta(totalRaw)

  const wordDerivations = wordResults.map(r =>
    `${r.word}: ${r.consChars.map(ch => `${ch}(${LETTER_VALUES[ch]})`).join('+')} = ${r.sum}`
  )
  const derivation = [
    ...wordDerivations,
    `Total: ${totalRaw}${totalRaw !== meta.reduced ? ` → ${meta.reduced}` : ''}`,
  ].join('\n')

  return {
    val: meta.reduced,
    master: meta.master,
    derivation,
  }
}

/** Birthday: raw day + reduced form */
function calcBirthday(day) {
  const reduced = reduce(day)
  return {
    val: day,
    reduced,
    derivation: `Day of birth: ${day}${day !== reduced ? ` → ${reduced}` : ''}`,
  }
}

/** Maturity: Life Path + Expression, reduced */
function calcMaturity(lifePath, expression) {
  const raw = lifePath + expression
  const meta = reduceWithMeta(raw)
  return {
    val: meta.reduced,
    master: meta.master,
    derivation: `Life Path (${lifePath}) + Expression (${expression}) = ${raw}${raw !== meta.reduced ? ` → ${meta.reduced}` : ''}`,
  }
}

/**
 * Pinnacles: computed from reduced month/day/year values
 * P1 = month + day
 * P2 = day + year
 * P3 = P1 + P2
 * P4 = month + year
 */
function calcPinnacles(reducedMonth, reducedDay, reducedYear, lifePath) {
  const p1raw = reducedMonth + reducedDay
  const p2raw = reducedDay + reducedYear
  const p1 = reduce(p1raw)
  const p2 = reduce(p2raw)
  const p3 = reduce(p1 + p2)
  const p4raw = reducedMonth + reducedYear
  const p4 = reduce(p4raw)

  // Age ranges
  const end1 = 36 - lifePath
  const end2 = end1 + 9
  const end3 = end2 + 9

  return {
    pinnacles: [
      { num: p1, label: 'Pinnacle I',   ageRange: `0-${end1}` },
      { num: p2, label: 'Pinnacle II',  ageRange: `${end1 + 1}-${end2}` },
      { num: p3, label: 'Pinnacle III', ageRange: `${end2 + 1}-${end3}` },
      { num: p4, label: 'Pinnacle IV',  ageRange: `${end3 + 1}+` },
    ],
    ageEnds: [end1, end2, end3],
    derivation: `P1=${reducedMonth}+${reducedDay}=${p1raw}→${p1}, P2=${reducedDay}+${reducedYear}=${p2raw}→${p2}, P3=${p1}+${p2}=${p1+p2}→${p3}, P4=${reducedMonth}+${reducedYear}=${p4raw}→${p4}`,
  }
}

/**
 * Challenges: absolute differences
 * C1 = |month - day|
 * C2 = |day - year|
 * C3 = |C1 - C2|
 * C4 = |month - year|
 */
function calcChallenges(reducedMonth, reducedDay, reducedYear, lifePath) {
  const end1 = 36 - lifePath
  const end2 = end1 + 9
  const end3 = end2 + 9

  const c1 = reduce(Math.abs(reducedMonth - reducedDay))
  const c2 = reduce(Math.abs(reducedDay - reducedYear))
  const c3 = Math.abs(c1 - c2)
  const c4 = reduce(Math.abs(reducedMonth - reducedYear))

  return {
    challenges: [
      { num: c1, label: 'Challenge I',   ageRange: `0-${end1}` },
      { num: c2, label: 'Challenge II',  ageRange: `${end1 + 1}-${end2}` },
      { num: c3, label: 'Challenge III', ageRange: `${end2 + 1}-${end3}` },
      { num: c4, label: 'Challenge IV',  ageRange: `${end3 + 1}+` },
    ],
    derivation: `C1=|${reducedMonth}-${reducedDay}|=${c1}, C2=|${reducedDay}-${reducedYear}|=${c2}, C3=|${c1}-${c2}|=${c3}, C4=|${reducedMonth}-${reducedYear}|=${c4}`,
  }
}

/** Personal Year = reducedMonth + reducedDay + reduce(currentYear) */
function calcPersonalYear(reducedMonth, reducedDay, currentYear) {
  const ry = reduce(sumDigits(currentYear))
  const raw = reducedMonth + reducedDay + ry
  const val = reduce(raw)
  return {
    val,
    derivation: `Month(${reducedMonth}) + Day(${reducedDay}) + Year(${currentYear}→${sumDigits(currentYear)}→${ry}) = ${raw}→${val}`,
  }
}

/** Personal Month = personalYear + currentMonth, reduced */
function calcPersonalMonth(personalYear, currentMonth) {
  const raw = personalYear + currentMonth
  const val = reduce(raw)
  return { val }
}

/** Personal Day = personalMonth + currentDay, reduced */
function calcPersonalDay(personalMonth, currentDay) {
  const raw = personalMonth + currentDay
  const val = reduce(raw)
  return { val }
}

/** Hidden Passion: most frequent digit in all letter values */
function calcHiddenPassion(fullName) {
  const freq = Array(10).fill(0)
  for (const ch of fullName.toUpperCase()) {
    if (LETTER_VALUES[ch]) freq[LETTER_VALUES[ch]]++
  }
  const maxFreq = Math.max(...freq.slice(1))
  const passions = []
  for (let i = 1; i <= 9; i++) {
    if (freq[i] === maxFreq) passions.push(i)
  }
  return passions.length === 1 ? passions[0] : passions
}

/** Karmic Debt: check if any core number before final reduction was 13, 14, 16, or 19 */
function findKarmicDebt(day, month, year, fullName) {
  const KARMIC = new Set([13, 14, 16, 19])
  const debt = new Set()

  // Check year (pre-reduction step)
  const yearSum = sumDigits(year)
  if (KARMIC.has(yearSum)) debt.add(yearSum)
  if (KARMIC.has(year)) debt.add(year) // raw year unlikely but check

  // Check day before reduction
  if (KARMIC.has(day)) debt.add(day)

  // Check month before reduction
  if (KARMIC.has(month)) debt.add(month)

  // Check expression total before final reduction
  const words = fullName.toUpperCase().split(/\s+/).filter(Boolean)
  for (const w of words) {
    const sum = [...w].reduce((a, ch) => a + (LETTER_VALUES[ch] || 0), 0)
    if (KARMIC.has(sum)) debt.add(sum)
  }

  return [...debt].sort((a, b) => a - b)
}

/** Missing Numbers (Karmic Lessons): digits 1-9 absent from full name */
function findMissingNumbers(fullName) {
  const present = new Set()
  for (const ch of fullName.toUpperCase()) {
    if (LETTER_VALUES[ch]) present.add(LETTER_VALUES[ch])
  }
  const missing = []
  for (let i = 1; i <= 9; i++) {
    if (!present.has(i)) missing.push(i)
  }
  return missing
}

/** Master Numbers found in the name (word-level) */
function findMasterNumbers(fullName) {
  const masters = []
  const words = fullName.toUpperCase().split(/\s+/).filter(Boolean)
  for (const w of words) {
    const sum = [...w].reduce((a, ch) => a + (LETTER_VALUES[ch] || 0), 0)
    if (isMaster(sum)) masters.push(sum)
  }
  return [...new Set(masters)]
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute a full numerology profile.
 *
 * @param {Object} params
 * @param {number} params.day          - Day of birth (1-31)
 * @param {number} params.month        - Month of birth (1-12)
 * @param {number} params.year         - Year of birth (e.g. 1981)
 * @param {string} params.fullName     - Full birth name, e.g. 'GASTON FRYDLEWSKI'
 * @param {number} [params.currentYear]  - Defaults to current year
 * @param {number} [params.currentMonth] - Defaults to current month
 * @param {number} [params.currentDay]   - Defaults to current day
 * @returns {Object} Full numerology profile
 */
export function getNumerologyProfile({
  day,
  month,
  year,
  fullName = 'GASTON FRYDLEWSKI',
  currentYear,
  currentMonth,
  currentDay,
}) {
  const now = new Date()
  const cYear  = currentYear  ?? now.getFullYear()
  const cMonth = currentMonth ?? (now.getMonth() + 1)
  const cDay   = currentDay   ?? now.getDate()

  const name = fullName.toUpperCase()

  // ── Life Path ───────────────────────────────────────────────────────────────
  const lp = calcLifePath(day, month, year)
  const { reducedMonth, reducedDay, reducedYear } = lp

  // ── Expression ─────────────────────────────────────────────────────────────
  const exp = calcExpression(name)

  // ── Soul Urge ──────────────────────────────────────────────────────────────
  const su = calcSoulUrge(name)

  // ── Personality ────────────────────────────────────────────────────────────
  const pers = calcPersonality(name)

  // ── Birthday ───────────────────────────────────────────────────────────────
  const bday = calcBirthday(day)

  // ── Maturity ───────────────────────────────────────────────────────────────
  const mat = calcMaturity(lp.val, exp.val)

  // ── Pinnacles ──────────────────────────────────────────────────────────────
  const pinnacleData = calcPinnacles(reducedMonth, reducedDay, reducedYear, lp.val)

  // ── Challenges ─────────────────────────────────────────────────────────────
  const challengeData = calcChallenges(reducedMonth, reducedDay, reducedYear, lp.val)

  // ── Personal Cycles ────────────────────────────────────────────────────────
  const pyData  = calcPersonalYear(reducedMonth, reducedDay, cYear)
  const pmData  = calcPersonalMonth(pyData.val, cMonth)
  const pdData  = calcPersonalDay(pmData.val, cDay)

  // ── Extended ───────────────────────────────────────────────────────────────
  const hiddenPassion  = calcHiddenPassion(name)
  const karmicDebt     = findKarmicDebt(day, month, year, name)
  const karmicLessons  = findMissingNumbers(name)
  const masterNumbers  = findMasterNumbers(name)

  // ── Determine active pinnacle/challenge (based on current age) ─────────────
  const birthYear = year
  const age = cYear - birthYear - (
    (cMonth < month) || (cMonth === month && cDay < day) ? 1 : 0
  )
  const { ageEnds } = pinnacleData
  const activeIdx = age <= ageEnds[0] ? 0 : age <= ageEnds[1] ? 1 : age <= ageEnds[2] ? 2 : 3

  // ── Helpers to attach meanings ─────────────────────────────────────────────
  const meaning = (n) => NUMBER_MEANINGS[n] || NUMBER_MEANINGS[reduce(n, false)] || { title: '—', desc: '—' }

  // ── Assemble output ────────────────────────────────────────────────────────
  return {
    core: {
      lifePath: {
        val: lp.val,
        master: lp.master,
        ...meaning(lp.val),
      },
      expression: {
        val: exp.val,
        master: exp.master,
        masterInName: exp.masterInName,
        ...meaning(exp.val),
      },
      soulUrge: {
        val: su.val,
        master: su.master,
        ...meaning(su.val),
      },
      birthday: {
        val: bday.val,
        reduced: bday.reduced,
        title: 'The Royal Star',
        desc: `Born on the ${day}th — versatile, communicative, adventurous, progressive`,
      },
      personality: {
        val: pers.val,
        master: pers.master,
        ...meaning(pers.val),
      },
      maturity: {
        val: mat.val,
        master: mat.master,
        ...meaning(mat.val),
      },
    },

    pinnacles: pinnacleData.pinnacles.map((p, i) => ({
      ...p,
      ...meaning(p.num),
      active: i === activeIdx,
    })),

    challenges: challengeData.challenges.map((c, i) => ({
      ...c,
      active: i === activeIdx,
    })),

    personal: {
      year: {
        val: pyData.val,
        title: PERSONAL_YEAR_TITLES[pyData.val] || meaning(pyData.val).title,
        desc: meaning(pyData.val).desc,
      },
      month: {
        val: pmData.val,
        title: PERSONAL_YEAR_TITLES[pmData.val] || meaning(pmData.val).title,
        desc: meaning(pmData.val).desc,
      },
      day: {
        val: pdData.val,
        title: PERSONAL_YEAR_TITLES[pdData.val] || meaning(pdData.val).title,
        desc: meaning(pdData.val).desc,
      },
    },

    extended: {
      hiddenPassion,
      karmicDebt,
      karmicLessons,
      masterNumbers,
      age,
      activePhaseIndex: activeIdx,
    },

    derivations: {
      lifePath:    lp.derivation,
      expression:  exp.derivation,
      soulUrge:    su.derivation,
      personality: pers.derivation,
      birthday:    bday.derivation,
      maturity:    mat.derivation,
      pinnacles:   pinnacleData.derivation,
      challenges:  challengeData.derivation,
      personalYear: pyData.derivation,
    },
  }
}

/**
 * Parse a DOB string 'YYYY-MM-DD' and call getNumerologyProfile.
 * Convenience wrapper for use with store data.
 */
export function getNumerologyProfileFromDob(dob, fullName, opts = {}) {
  const { year, month, day } = parseDob(dob)
  return getNumerologyProfile({ day, month, year, fullName, ...opts })
}
