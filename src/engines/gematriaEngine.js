// ── Gematria Engine ──────────────────────────────────────────────────────────
// Computes multiple Gematria methods for a person's name and birth date.

// English Pythagorean (standard numerology mapping)
const PYTHAGOREAN = {A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8}

// English Ordinal (A=1 to Z=26)
const ORDINAL = {A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:10,K:11,L:12,M:13,N:14,O:15,P:16,Q:17,R:18,S:19,T:20,U:21,V:22,W:23,X:24,Y:25,Z:26}

// Chaldean (ancient Babylonian system, no 9)
const CHALDEAN = {A:1,B:2,C:3,D:4,E:5,F:8,G:3,H:5,I:1,J:1,K:2,L:3,M:4,N:5,O:7,P:8,Q:1,R:2,S:3,T:4,U:6,V:6,W:6,X:5,Y:1,Z:7}

// Hebrew Gematria (for transliterated names)
// Maps English phonemes to Hebrew letter values
const HEBREW_PHONEME = {A:1,B:2,G:3,D:4,H:5,V:6,Z:7,CH:8,T:9,Y:10,K:20,L:30,M:40,N:50,S:60,O:70,P:80,TZ:90,Q:100,R:200,SH:300,TH:400}

// Simple Hebrew approximation: map each English letter to nearest Hebrew equivalent value
const HEBREW_APPROX = {A:1,B:2,G:3,D:4,E:5,F:8,H:5,I:1,J:1,K:20,L:30,M:40,N:50,O:7,P:8,Q:100,R:200,S:60,T:400,U:6,V:6,W:6,X:5,Y:10,Z:7}

export function reduce(n, keepMaster = true) {
  if (keepMaster && (n === 11 || n === 22 || n === 33)) return n
  if (n < 10) return n
  const sum = String(n).split('').reduce((acc, d) => acc + parseInt(d), 0)
  return reduce(sum, keepMaster)
}

export function calcMethod(name, map) {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, '')
  let total = 0
  const letterValues = []
  for (const ch of clean) {
    const val = map[ch] || 0
    total += val
    letterValues.push({ letter: ch, value: val })
  }
  return { total, reduced: reduce(total), letterValues }
}

// Birth date numerology for Gematria context
export function birthDateGematria(day, month, year) {
  const digits = String(day + month + year).split('').map(Number)
  const sum = digits.reduce((a, b) => a + b, 0)
  return { raw: day + month + year, reduced: reduce(sum) }
}

// Core number meanings
export const NUMBER_THEMES = {
  1: 'Leadership · Independence · New Beginnings',
  2: 'Partnership · Balance · Receptivity',
  3: 'Creativity · Expression · Trinity',
  4: 'Foundation · Structure · Earth',
  5: 'Freedom · Change · The Pentagram',
  6: 'Harmony · Service · The Star of David',
  7: 'Mystery · Wisdom · The Divine',
  8: 'Power · Infinity · Material Mastery',
  9: 'Completion · Universal Love · Endings',
  10: 'Perfection · Return to Unity · The Wheel',
  11: 'Master Intuition · Illumination · The Twin Pillars',
  12: 'Sacrifice · Completion of Cycle · The Zodiac',
  13: 'Death & Rebirth · Transformation · The Hidden',
  14: 'Temperance · Balance of Opposites · Movement',
  15: 'The Devil · Material Bondage · Hidden Power',
  16: 'The Tower · Revelation · Sudden Change',
  17: 'The Star · Hope · Divine Guidance',
  18: 'The Moon · Illusion · Hidden Depths',
  19: 'The Sun · Success · Vital Force',
  20: 'Judgement · Awakening · New Awareness',
  21: 'The World · Completion · Integration',
  22: 'Master Builder · Grand Vision · Universal Service',
  26: 'The Lord · Divine Connection',
  33: 'Master Teacher · Christ Consciousness · Healing',
  72: 'The 72 Names of God · Divine Attributes',
  216: 'The Three-Fold Name · Sacred Cube',
  777: 'Divine Perfection · Triple Completion',
}

export function getGematriaProfile({ fullName, day, month, year }) {
  const name = fullName.toUpperCase().replace(/[^A-Z\s]/g, '')
  const firstName = name.split(' ')[0]
  const lastName = name.split(' ').slice(1).join(' ')

  const methods = {
    pythagorean: {
      label: 'Pythagorean (English)',
      fullName: calcMethod(name, PYTHAGOREAN),
      firstName: calcMethod(firstName, PYTHAGOREAN),
      lastName: calcMethod(lastName || firstName, PYTHAGOREAN),
    },
    ordinal: {
      label: 'Ordinal (English)',
      fullName: calcMethod(name, ORDINAL),
      firstName: calcMethod(firstName, ORDINAL),
      lastName: calcMethod(lastName || firstName, ORDINAL),
    },
    chaldean: {
      label: 'Chaldean (Ancient)',
      fullName: calcMethod(name, CHALDEAN),
      firstName: calcMethod(firstName, CHALDEAN),
      lastName: calcMethod(lastName || firstName, CHALDEAN),
    },
    hebrew: {
      label: 'Hebrew Approximation',
      fullName: calcMethod(name, HEBREW_APPROX),
      firstName: calcMethod(firstName, HEBREW_APPROX),
      lastName: calcMethod(lastName || firstName, HEBREW_APPROX),
    },
  }

  // Key numbers and their themes
  const keyNumbers = new Set()
  for (const m of Object.values(methods)) {
    keyNumbers.add(m.fullName.reduced)
    keyNumbers.add(m.firstName.reduced)
  }

  const birthGem = birthDateGematria(day, month, year)
  keyNumbers.add(birthGem.reduced)

  const themes = {}
  for (const n of keyNumbers) {
    if (NUMBER_THEMES[n]) themes[n] = NUMBER_THEMES[n]
  }

  // Soul number: vowels only (Pythagorean)
  const soulNum = calcMethod(name.replace(/[^AEIOU]/g, ''), PYTHAGOREAN)

  // Personality number: consonants only
  const CONSONANTS = { ...PYTHAGOREAN }
  'AEIOU'.split('').forEach(v => delete CONSONANTS[v])
  const personalityNum = calcMethod(name.replace(/[AEIOU]/g, ''), PYTHAGOREAN)

  return {
    methods,
    keyNumbers: [...keyNumbers],
    themes,
    soulNumber: soulNum.total > 0 ? soulNum : null,
    personalityNumber: personalityNum.total > 0 ? personalityNum : null,
    birthGematria: birthGem,
    nameLetterBreakdown: calcMethod(name, ORDINAL).letterValues,
  }
}
