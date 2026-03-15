/**
 * Arabic Parts (Lots) Engine
 * Sensitive points derived from 3 natal positions: ASC + Planet1 - Planet2.
 * Day/Night chart reversal applied where traditional.
 */

export function getArabicParts(natalChart) {
  const { planets, angles } = natalChart
  const asc = angles.asc.lon
  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']

  function norm(lon) { return ((lon % 360) + 360) % 360 }

  function signOf(lon) {
    const normalized = norm(lon)
    const i = Math.floor(normalized / 30)
    return {
      sign: SIGNS[i],
      signIndex: i,
      degree: +(normalized % 30).toFixed(2),
      lon: +normalized.toFixed(2),
    }
  }

  // Day chart: Sun above horizon (houses 7-12)
  // Simplified: Sun within 180° counterclockwise from ASC = above horizon
  const sunLon = planets.sun.lon
  const sunAbove = ((sunLon - asc + 360) % 360) < 180
  const isDayChart = sunAbove

  const s = planets

  const parts = [
    {
      name: 'Part of Fortune',
      description: 'Material luck, bodily health, worldly prosperity',
      formula: isDayChart ? 'ASC + Moon − Sun' : 'ASC + Sun − Moon',
      lon: isDayChart
        ? norm(asc + s.moon.lon - s.sun.lon)
        : norm(asc + s.sun.lon - s.moon.lon),
    },
    {
      name: 'Part of Spirit',
      description: 'Spiritual path, soul purpose, inner vocation',
      formula: isDayChart ? 'ASC + Sun − Moon' : 'ASC + Moon − Sun',
      lon: isDayChart
        ? norm(asc + s.sun.lon - s.moon.lon)
        : norm(asc + s.moon.lon - s.sun.lon),
    },
    {
      name: 'Part of Love',
      description: 'Romance, partnerships, heart connections',
      formula: 'ASC + Venus − Sun',
      lon: norm(asc + s.venus.lon - s.sun.lon),
    },
    {
      name: 'Part of Marriage',
      description: 'Long-term commitment, marriage timing',
      formula: isDayChart ? 'ASC + Venus − Saturn' : 'ASC + Saturn − Venus',
      lon: isDayChart
        ? norm(asc + s.venus.lon - s.saturn.lon)
        : norm(asc + s.saturn.lon - s.venus.lon),
    },
    {
      name: 'Part of Passion',
      description: 'Deep desires, sexual nature, creative fire',
      formula: 'ASC + Mars − Sun',
      lon: norm(asc + s.mars.lon - s.sun.lon),
    },
    {
      name: 'Part of Career',
      description: 'Vocation, public reputation, life work',
      formula: 'ASC + Mercury − Sun',
      lon: norm(asc + s.mercury.lon - s.sun.lon),
    },
    {
      name: 'Part of Abundance',
      description: 'Financial expansion, generosity, luck in wealth',
      formula: 'ASC + Jupiter − Sun',
      lon: norm(asc + s.jupiter.lon - s.sun.lon),
    },
    {
      name: 'Part of Karma',
      description: 'Past life debts, karmic obligations, soul contracts',
      formula: 'ASC + Saturn − Sun',
      lon: norm(asc + s.saturn.lon - s.sun.lon),
    },
    {
      name: 'Part of Transformation',
      description: 'Death, rebirth, deep change, power',
      formula: 'ASC + Pluto − Sun',
      lon: norm(asc + s.pluto.lon - s.sun.lon),
    },
    {
      name: 'Part of Nobility',
      description: 'Honor, recognition, high achievement',
      formula: 'ASC + Jupiter − Mars',
      lon: norm(asc + s.jupiter.lon - s.mars.lon),
    },
  ]

  return {
    parts: parts.map(p => ({ ...p, ...signOf(p.lon) })),
    isDayChart,
    meta: { asc: +asc.toFixed(2) },
  }
}
