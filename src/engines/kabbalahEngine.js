/**
 * Kabbalah Tree of Life Calculation Engine
 * Uses astronomy-engine for planetary positions.
 *
 * Reference validation (Gaston Frydlewski, Jan 23 1981, 22:10, UTC-3):
 *   Active:   Kether, Chokmah, Binah, Geburah, Tiphareth, Hod, Yesod, Malkuth
 *   Dormant:  Chesed, Netzach
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

// Dignity table: sign indices (0=Aries, 1=Taurus, ... 11=Pisces)
// +3 if in own sign or exaltation, -2 if detriment or fall
const DIGNITY = {
  sun:     { own: [4],    exalt: [0],    detri: [10],    fall: [6]     }, // Leo / Aries / Aquarius / Libra
  moon:    { own: [3],    exalt: [1],    detri: [9],     fall: [7]     }, // Cancer / Taurus / Scorpio / Capricorn
  mercury: { own: [2, 5], exalt: [5],    detri: [8, 11], fall: [11]    }, // Gemini+Virgo / Virgo / Sag+Pisces / Pisces
  venus:   { own: [1, 6], exalt: [11],   detri: [7, 0],  fall: [5]     }, // Taurus+Libra / Pisces / Scorpio+Aries / Virgo
  mars:    { own: [0, 7], exalt: [9],    detri: [6, 1],  fall: [3]     }, // Aries+Scorpio / Capricorn / Libra+Taurus / Cancer
  jupiter: { own: [8, 11],exalt: [3],    detri: [2, 5],  fall: [9]     }, // Sag+Pisces / Cancer / Gemini+Virgo / Capricorn
  saturn:  { own: [9, 10],exalt: [6],    detri: [3, 4],  fall: [0]     }, // Cap+Aquarius / Libra / Cancer+Leo / Aries
  uranus:  { own: [10],   exalt: [],     detri: [4],     fall: []      },
  neptune: { own: [11],   exalt: [],     detri: [5],     fall: []      },
  pluto:   { own: [7],    exalt: [],     detri: [1],     fall: []      },
};

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

function aspectCount(lons, targetPlanet) {
  const ASPECTS = [0, 60, 90, 120, 180];
  const ORB = 8;
  let count = 0;
  const tLon = lons[targetPlanet];
  for (const [p, lon] of Object.entries(lons)) {
    if (p === targetPlanet) continue;
    let diff = Math.abs(tLon - lon) % 360;
    if (diff > 180) diff = 360 - diff;
    for (const asp of ASPECTS) {
      if (Math.abs(diff - asp) <= ORB) { count++; break; }
    }
  }
  return count;
}

const SEPHIROTH_META = [
  { name: 'Kether',    num: 1,  planets: ['neptune', 'pluto'], meaning: 'Crown — Divine Unity' },
  { name: 'Chokmah',   num: 2,  planets: ['uranus'],           meaning: 'Wisdom — Primal Force' },
  { name: 'Binah',     num: 3,  planets: ['saturn'],           meaning: 'Understanding — Form Giver' },
  { name: 'Chesed',    num: 4,  planets: ['jupiter'],          meaning: 'Mercy — Loving Expansion' },
  { name: 'Geburah',   num: 5,  planets: ['mars'],             meaning: 'Severity — Warrior Strength' },
  { name: 'Tiphareth', num: 6,  planets: ['sun'],              meaning: 'Beauty — Heart of the Tree' },
  { name: 'Netzach',   num: 7,  planets: ['venus'],            meaning: 'Victory — Emotion & Desire' },
  { name: 'Hod',       num: 8,  planets: ['mercury'],          meaning: 'Splendour — Mind & Craft' },
  { name: 'Yesod',     num: 9,  planets: ['moon'],             meaning: 'Foundation — Dream & Psyche' },
  { name: 'Malkuth',   num: 10, planets: [],                   meaning: 'Kingdom — Physical Reality' },
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
 * @returns {{ sephiroth, activePaths, pillars, dominantPillar, treeBalance }}
 */
export function getKabbalahProfile({ day, month, year, hour, minute, timezone }) {
  const utc = new Date(Date.UTC(year, month - 1, day, hour - timezone, minute));

  const PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const lons = {};
  for (const p of PLANETS) {
    try {
      lons[p] = getPlanetLon(p, utc);
    } catch (e) {
      lons[p] = 0;
    }
  }

  // Score each sephirah based on planetary dignity + aspects
  const sephiroth = SEPHIROTH_META.map(s => {
    if (s.name === 'Malkuth') return { ...s, active: true, score: 10 };
    let score = 0;
    for (const p of s.planets) {
      const signIdx = getSignIndex(lons[p]);
      score += dignityScore(p, signIdx) + aspectCount(lons, p);
    }
    return { ...s, active: score >= 3, score };
  });

  const activeNames = new Set(sephiroth.filter(s => s.active).map(s => s.name));

  const activePaths = PATHS_META.map(p => ({
    ...p,
    active: activeNames.has(p.from) && activeNames.has(p.to),
  }));

  const severityActive = ['Binah', 'Geburah', 'Hod'].filter(n => activeNames.has(n)).length;
  const mercyActive    = ['Chokmah', 'Chesed', 'Netzach'].filter(n => activeNames.has(n)).length;

  return {
    sephiroth,
    activePaths,
    pillars: {
      severity:    { active: severityActive >= 2, sephiroth: ['Binah', 'Geburah', 'Hod'] },
      equilibrium: { active: true,                sephiroth: ['Kether', 'Tiphareth', 'Yesod', 'Malkuth'] },
      mercy:       { active: mercyActive >= 2,    sephiroth: ['Chokmah', 'Chesed', 'Netzach'] },
    },
    dominantPillar: severityActive > mercyActive ? 'Severity' : mercyActive > severityActive ? 'Mercy' : 'Equilibrium',
    treeBalance:    severityActive > mercyActive ? 'Left-leaning' : 'Right-leaning',
  };
}

/**
 * Parse a primaryProfile object into getKabbalahProfile arguments.
 * Expects: { dob: 'YYYY-MM-DD', tob: 'HH:MM', tz?: number }
 * Defaults timezone to -3 (Buenos Aires) if not present.
 */
export function profileToKabArgs(profile) {
  const [year, month, day] = (profile.dob || '1981-01-23').split('-').map(Number);
  const [hour, minute]     = (profile.tob || '22:10').split(':').map(Number);
  const timezone           = profile.tz != null ? profile.tz : -3;
  return { day, month, year, hour, minute, timezone };
}
