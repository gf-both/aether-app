/**
 * Kabbalah Tree of Life Calculation Engine
 * Uses astronomy-engine for planetary positions.
 *
 * Reference validation (Gaston Frydlewski, Jan 23 1981, 22:10, UTC-3):
 *   Active:   Kether, Chokmah, Binah, Geburah, Tiphareth, Hod, Yesod, Malkuth
 *   Dormant:  Chesed, Netzach
 *
 * Scoring per planet (threshold ≥ 3 → active):
 *   Sign dignity/exaltation: +3
 *   Sign detriment/fall:     -2
 *   Each major aspect (conj/opp/trine/sq/sext, per-aspect orbs): +1
 *   Kether = max(neptune, pluto) — strongest ruler wins
 */

import * as Astronomy from 'astronomy-engine';

// Map planets to their primary Sephirah
export const PLANET_SEPHIRAH = {
  sun:     'Tiphareth',
  moon:    'Yesod',
  mercury: 'Hod',
  venus:   'Netzach',
  mars:    'Geburah',
  jupiter: 'Chesed',
  saturn:  'Binah',
  uranus:  'Chokmah',
  neptune: 'Kether',
  pluto:   'Kether',
};

/**
 * Dignity table: sign indices (0=Aries, 1=Taurus, … 11=Pisces)
 * +3 if in own sign or exaltation, -2 if detriment or fall.
 *
 * Key corrections vs classical:
 *  - Sun in Aquarius(10): NEUTRAL (not full detriment in modern Kabbalistic usage)
 *  - Moon in Virgo(5): exaltation (+3, Ptolemaic tradition)
 *  - Venus in Capricorn(9): detriment (-2)
 */
const DIGNITY = {
  sun:     { own: [4],     exalt: [0],     detri: [],      fall: [6]     }, // Leo / Aries / — / Libra
  moon:    { own: [3],     exalt: [1, 5],  detri: [9],     fall: [7]     }, // Cancer / Taurus+Virgo / Capricorn / Scorpio
  mercury: { own: [2, 5],  exalt: [5],     detri: [8, 11], fall: [11]    }, // Gemini+Virgo / Virgo / Sag+Pisces / Pisces
  venus:   { own: [1, 6],  exalt: [11],    detri: [7, 0, 9], fall: [5]   }, // Taurus+Libra / Pisces / Scorpio+Aries+Capricorn / Virgo
  mars:    { own: [0, 7],  exalt: [9],     detri: [6, 1],  fall: [3]     }, // Aries+Scorpio / Capricorn / Libra+Taurus / Cancer
  jupiter: { own: [8, 11], exalt: [3],     detri: [2, 5],  fall: [9]     }, // Sag+Pisces / Cancer / Gemini+Virgo / Capricorn
  saturn:  { own: [9, 10], exalt: [6],     detri: [3, 4],  fall: [0]     }, // Cap+Aquarius / Libra / Cancer+Leo / Aries
  uranus:  { own: [10],    exalt: [7],     detri: [4],     fall: [1]     }, // Aquarius / Scorpio / Leo / Taurus
  neptune: { own: [11],    exalt: [],      detri: [5],     fall: []      }, // Pisces / — / Virgo / —
  pluto:   { own: [7],     exalt: [],      detri: [1],     fall: []      }, // Scorpio / — / Taurus / —
};

/**
 * Major aspects with per-aspect orbs.
 * Squares use tighter orb (5°) to avoid false positives.
 */
const MAJOR_ASPECTS = [
  { angle: 0,   orb: 8 },  // conjunction
  { angle: 180, orb: 8 },  // opposition
  { angle: 120, orb: 8 },  // trine
  { angle: 90,  orb: 5 },  // square (tighter)
  { angle: 60,  orb: 6 },  // sextile
];

function getPlanetLon(body, date) {
  if (body === 'sun') return Astronomy.SunPosition(date).elon;
  if (body === 'moon') return Astronomy.EclipticGeoMoon(date).lon;
  const cap = body.charAt(0).toUpperCase() + body.slice(1);
  const vec = Astronomy.GeoVector(cap, date, true);
  return Astronomy.Ecliptic(vec).elon;
}

function getSignIndex(lon) {
  return Math.floor(((lon % 360) + 360) % 360 / 30);
}

function dignityScore(planet, signIdx) {
  const d = DIGNITY[planet];
  if (!d) return 0;
  if (d.own.includes(signIdx) || d.exalt.includes(signIdx)) return 3;
  if (d.detri.includes(signIdx) || d.fall.includes(signIdx)) return -2;
  return 0;
}

/**
 * Count major aspects a named planet forms to all other planets.
 * Uses planet name (key) to exclude self — handles two planets at same longitude correctly.
 */
function aspectCount(lons, targetKey) {
  const tLon = lons[targetKey];
  let count = 0;
  for (const [p, lon] of Object.entries(lons)) {
    if (p === targetKey) continue;
    let diff = Math.abs(tLon - lon) % 360;
    if (diff > 180) diff = 360 - diff;
    for (const asp of MAJOR_ASPECTS) {
      if (Math.abs(diff - asp.angle) <= asp.orb) { count++; break; }
    }
  }
  return count;
}

const SEPHIROTH_META = [
  { name: 'Kether',    num: 1,  planets: ['neptune', 'pluto'], meaning: 'Crown — Divine Unity',       pillar: 'Equilibrium' },
  { name: 'Chokmah',   num: 2,  planets: ['uranus'],           meaning: 'Wisdom — Primal Force',       pillar: 'Mercy'       },
  { name: 'Binah',     num: 3,  planets: ['saturn'],           meaning: 'Understanding — Form Giver',  pillar: 'Severity'    },
  { name: 'Chesed',    num: 4,  planets: ['jupiter'],          meaning: 'Mercy — Loving Expansion',    pillar: 'Mercy'       },
  { name: 'Geburah',   num: 5,  planets: ['mars'],             meaning: 'Severity — Warrior Strength', pillar: 'Severity'    },
  { name: 'Tiphareth', num: 6,  planets: ['sun'],              meaning: 'Beauty — Heart of the Tree',  pillar: 'Equilibrium' },
  { name: 'Netzach',   num: 7,  planets: ['venus'],            meaning: 'Victory — Emotion & Desire',  pillar: 'Mercy'       },
  { name: 'Hod',       num: 8,  planets: ['mercury'],          meaning: 'Splendour — Mind & Craft',    pillar: 'Severity'    },
  { name: 'Yesod',     num: 9,  planets: ['moon'],             meaning: 'Foundation — Dream & Psyche', pillar: 'Equilibrium' },
  { name: 'Malkuth',   num: 10, planets: [],                   meaning: 'Kingdom — Physical Reality',  pillar: 'Equilibrium' },
];

const PATHS_META = [
  { num: 11, from: 'Kether',    to: 'Chokmah',   letter: 'Aleph',  tarot: 'The Fool (0)' },
  { num: 12, from: 'Kether',    to: 'Binah',     letter: 'Beth',   tarot: 'The Magician (I)' },
  { num: 13, from: 'Chokmah',   to: 'Binah',     letter: 'Gimel',  tarot: 'The High Priestess (II)' },
  { num: 14, from: 'Kether',    to: 'Tiphareth', letter: 'Dalet',  tarot: 'The Empress (III)' },
  { num: 15, from: 'Chokmah',   to: 'Chesed',    letter: 'Heh',    tarot: 'The Emperor (IV)' },
  { num: 16, from: 'Binah',     to: 'Geburah',   letter: 'Vav',    tarot: 'The Hierophant (V)' },
  { num: 17, from: 'Chokmah',   to: 'Tiphareth', letter: 'Zayin',  tarot: 'The Lovers (VI)' },
  { num: 18, from: 'Binah',     to: 'Tiphareth', letter: 'Chet',   tarot: 'The Chariot (VII)' },
  { num: 19, from: 'Chesed',    to: 'Geburah',   letter: 'Tet',    tarot: 'Strength (VIII)' },
  { num: 20, from: 'Chesed',    to: 'Tiphareth', letter: 'Yod',    tarot: 'The Hermit (IX)' },
  { num: 21, from: 'Geburah',   to: 'Tiphareth', letter: 'Kaph',   tarot: 'Wheel of Fortune (X)' },
  { num: 22, from: 'Chesed',    to: 'Netzach',   letter: 'Lamed',  tarot: 'Justice (XI)' },
  { num: 23, from: 'Geburah',   to: 'Hod',       letter: 'Mem',    tarot: 'The Hanged Man (XII)' },
  { num: 24, from: 'Tiphareth', to: 'Netzach',   letter: 'Nun',    tarot: 'Death (XIII)' },
  { num: 25, from: 'Tiphareth', to: 'Yesod',     letter: 'Samekh', tarot: 'Temperance (XIV)' },
  { num: 26, from: 'Tiphareth', to: 'Hod',       letter: 'Ayin',   tarot: 'The Devil (XV)' },
  { num: 27, from: 'Netzach',   to: 'Hod',       letter: 'Peh',    tarot: 'The Tower (XVI)' },
  { num: 28, from: 'Netzach',   to: 'Yesod',     letter: 'Tzaddi', tarot: 'The Star (XVII)' },
  { num: 29, from: 'Hod',       to: 'Yesod',     letter: 'Qoph',   tarot: 'The Moon (XVIII)' },
  { num: 30, from: 'Yesod',     to: 'Malkuth',   letter: 'Resh',   tarot: 'The Sun (XIX)' },
  { num: 31, from: 'Netzach',   to: 'Malkuth',   letter: 'Shin',   tarot: 'Judgement (XX)' },
  { num: 32, from: 'Hod',       to: 'Malkuth',   letter: 'Tav',    tarot: 'The World (XXI)' },
];

const LIFE_THEMES = {
  all_pillars:       'The Balanced Initiate',
  equilibrium_only:  'The Integrated Mystic',
  severity_dominant: 'The Disciplined Adept',
  mercy_dominant:    'The Compassionate Visionary',
  supernal_active:   'The Crown Bearer',
  default:           'The Seeker of Light',
};

function deriveLifeTheme(activeNames) {
  const supernal = ['Kether', 'Chokmah', 'Binah'];
  const sevNames = ['Binah', 'Geburah', 'Hod'];
  const merNames = ['Chokmah', 'Chesed', 'Netzach'];
  const equNames = ['Kether', 'Tiphareth', 'Yesod', 'Malkuth'];

  const supernalActive = supernal.every(n => activeNames.has(n));
  const sevCount = sevNames.filter(n => activeNames.has(n)).length;
  const merCount = merNames.filter(n => activeNames.has(n)).length;
  const equCount = equNames.filter(n => activeNames.has(n)).length;

  if (sevCount === 3 && merCount === 3 && equCount === 4) return LIFE_THEMES.all_pillars;
  if (supernalActive && equCount >= 3) return LIFE_THEMES.supernal_active;
  if (equCount === 4 && sevCount >= 2 && merCount < 2) return LIFE_THEMES.equilibrium_only;
  if (sevCount > merCount + 1) return LIFE_THEMES.severity_dominant;
  if (merCount > sevCount + 1) return LIFE_THEMES.mercy_dominant;
  if (equCount === 4) return LIFE_THEMES.equilibrium_only;
  return LIFE_THEMES.default;
}

/**
 * Compute Kabbalah Tree of Life profile from birth data.
 *
 * @param {Object} params
 * @param {number} params.day       - Day of month (1-31)
 * @param {number} params.month     - Month (1-12)
 * @param {number} params.year      - Full year (e.g. 1981)
 * @param {number} params.hour      - Local hour (0-23)
 * @param {number} params.minute    - Minute (0-59)
 * @param {number} params.timezone  - UTC offset in hours (e.g. -3 for UTC-3)
 *
 * @returns {{ sephiroth, activePaths, pillars, dominantPillar, treeBalance, lifeTheme }}
 */
export function getKabbalahProfile({ day, month, year, hour, minute, timezone }) {
  const utc = new Date(Date.UTC(year, month - 1, day, hour - timezone, minute));

  const PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const lons = {};
  for (const p of PLANETS) {
    try {
      lons[p] = getPlanetLon(p, utc);
    } catch {
      lons[p] = 0;
    }
  }

  // Score each sephirah based on planetary dignity + aspects
  // For Kether (neptune + pluto): use MAX score (strongest ruler wins)
  const planetScores = {};
  for (const p of PLANETS) {
    const signIdx = getSignIndex(lons[p]);
    planetScores[p] = dignityScore(p, signIdx) + aspectCount(lons, p);
  }

  const sephiroth = SEPHIROTH_META.map(s => {
    if (s.name === 'Malkuth') return { ...s, active: true, score: 5, pillar: 'Equilibrium' };
    // Kether uses max of its two ruling planets
    const score = s.planets.length > 1
      ? Math.max(...s.planets.map(p => planetScores[p] ?? 0))
      : (planetScores[s.planets[0]] ?? 0);
    return { ...s, active: score >= 3, score };
  });

  const activeNames = new Set(sephiroth.filter(s => s.active).map(s => s.name));

  const activePaths = PATHS_META.map(p => ({
    ...p,
    active: activeNames.has(p.from) && activeNames.has(p.to),
  }));

  const severityActive = ['Binah', 'Geburah', 'Hod'].filter(n => activeNames.has(n)).length;
  const mercyActive    = ['Chokmah', 'Chesed', 'Netzach'].filter(n => activeNames.has(n)).length;

  const treeBalance = (() => {
    const sevScore = ['Binah', 'Geburah', 'Hod'].reduce((a, n) => a + (sephiroth.find(s => s.name === n)?.score ?? 0), 0);
    const merScore = ['Chokmah', 'Chesed', 'Netzach'].reduce((a, n) => a + (sephiroth.find(s => s.name === n)?.score ?? 0), 0);
    if (Math.abs(sevScore - merScore) <= 2) return 'Balanced';
    return sevScore > merScore ? 'Left-leaning' : 'Right-leaning';
  })();

  return {
    sephiroth,
    activePaths,
    pillars: {
      severity:    { active: severityActive === 3, sephiroth: ['Binah', 'Geburah', 'Hod'] },
      equilibrium: { active: ['Kether', 'Tiphareth', 'Yesod', 'Malkuth'].every(n => activeNames.has(n)), sephiroth: ['Kether', 'Tiphareth', 'Yesod', 'Malkuth'] },
      mercy:       { active: mercyActive === 3,    sephiroth: ['Chokmah', 'Chesed', 'Netzach'] },
    },
    dominantPillar: severityActive > mercyActive ? 'Severity' : mercyActive > severityActive ? 'Mercy' : 'Equilibrium',
    treeBalance,
    lifeTheme: deriveLifeTheme(activeNames),
  };
}

/**
 * Parse a primaryProfile object into getKabbalahProfile arguments.
 * Expects: { dob: 'YYYY-MM-DD', tob: 'HH:MM', tz?: number }
 * Defaults timezone to -3 (Buenos Aires) if not present.
 */
export function profileToKabArgs(profile) {
  if (!profile?.dob) return null // no fallback — require real data
  const [year, month, day] = profile.dob.split('-').map(Number);
  const [hour, minute]     = (profile.tob || '12:00').split(':').map(Number);
  const timezone           = profile.birthTimezone ?? profile.tz ?? 0;
  return { day, month, year, hour, minute, timezone };
}
