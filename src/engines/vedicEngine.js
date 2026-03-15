import * as Astronomy from 'astronomy-engine';

// Lahiri Ayanamsa (most common in India): ~23.85° in 2000, increases ~50.3"/year
function getLahiriAyanamsa(date) {
  // Reference: Ayanamsa on Jan 1 2000 = 23.853°
  const refDate = new Date('2000-01-01T00:00:00Z');
  const yearsDiff = (date - refDate) / (365.25 * 24 * 3600 * 1000);
  return 23.853 + yearsDiff * (50.3 / 3600); // 50.3 arcseconds per year
}

function norm(lon) { return ((lon % 360) + 360) % 360; }
function toSidereal(tropicalLon, ayanamsa) { return norm(tropicalLon - ayanamsa); }

// 27 Nakshatras (lunar mansions), each 13°20' = 13.333°
export const NAKSHATRAS = [
  { name: 'Ashwini',     lord: 'Ketu',    deity: 'Ashwini Kumaras', symbol: "Horse's head" },
  { name: 'Bharani',     lord: 'Venus',   deity: 'Yama',            symbol: 'Yoni' },
  { name: 'Krittika',    lord: 'Sun',     deity: 'Agni',            symbol: 'Razor/flame' },
  { name: 'Rohini',      lord: 'Moon',    deity: 'Brahma',          symbol: 'Chariot/cart' },
  { name: 'Mrigashira',  lord: 'Mars',    deity: 'Soma',            symbol: "Deer's head" },
  { name: 'Ardra',       lord: 'Rahu',    deity: 'Rudra',           symbol: 'Teardrop/diamond' },
  { name: 'Punarvasu',   lord: 'Jupiter', deity: 'Aditi',           symbol: 'Bow and quiver' },
  { name: 'Pushya',      lord: 'Saturn',  deity: 'Brihaspati',      symbol: 'Flower/circle' },
  { name: 'Ashlesha',    lord: 'Mercury', deity: 'Nagas',           symbol: 'Coiled serpent' },
  { name: 'Magha',       lord: 'Ketu',    deity: 'Pitrs',           symbol: 'Royal throne' },
  { name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga',          symbol: 'Fig tree/hammock' },
  { name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman',         symbol: 'Bed/fig tree' },
  { name: 'Hasta',       lord: 'Moon',    deity: 'Savitar',         symbol: 'Hand/fist' },
  { name: 'Chitra',      lord: 'Mars',    deity: 'Tvashtr',         symbol: 'Pearl/bright jewel' },
  { name: 'Swati',       lord: 'Rahu',    deity: 'Vayu',            symbol: 'Coral/sword' },
  { name: 'Vishakha',    lord: 'Jupiter', deity: 'Indra-Agni',      symbol: 'Triumphal arch' },
  { name: 'Anuradha',    lord: 'Saturn',  deity: 'Mitra',           symbol: 'Lotus/staff' },
  { name: 'Jyeshtha',    lord: 'Mercury', deity: 'Indra',           symbol: 'Circular amulet' },
  { name: 'Mula',        lord: 'Ketu',    deity: 'Nirriti',         symbol: "Bunch of roots/lion's tail" },
  { name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas',            symbol: 'Elephant tusk/fan' },
  { name: 'Uttara Ashadha', lord: 'Sun',  deity: 'Vishvedevas',     symbol: 'Elephant tusk/planks' },
  { name: 'Shravana',    lord: 'Moon',    deity: 'Vishnu',          symbol: 'Ear/three footprints' },
  { name: 'Dhanishtha',  lord: 'Mars',    deity: 'Vasus',           symbol: 'Drum/flute' },
  { name: 'Shatabhisha', lord: 'Rahu',    deity: 'Varuna',          symbol: 'Empty circle/100 stars' },
  { name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Aja Ekapada', symbol: 'Swords/front of funeral cot' },
  { name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahir Budhnya', symbol: 'Twins/back of funeral cot' },
  { name: 'Revati',      lord: 'Mercury', deity: 'Pushan',          symbol: 'Fish/drum' },
];

// Vimshottari Dasha periods (120-year cycle)
export const DASHA_LORDS = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
export const DASHA_YEARS = { Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17 };
const NAKSHATRA_DASHA = [
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury', // nakshatras 1-9
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury', // 10-18
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury', // 19-27
];

function getNakshatra(lon) {
  const idx = Math.floor(lon / (360 / 27));
  const pada = Math.floor((lon % (360 / 27)) / (360 / 108)) + 1;
  return { ...NAKSHATRAS[idx % 27], index: idx % 27, pada, longitude: lon };
}

function getPlanetLon(body, date) {
  if (body === 'sun') return Astronomy.SunPosition(date).elon;
  if (body === 'moon') return Astronomy.EclipticGeoMoon(date).lon;
  const vec = Astronomy.GeoVector(body.charAt(0).toUpperCase() + body.slice(1), date, true);
  return ((Astronomy.Ecliptic(vec).elon % 360) + 360) % 360;
}

function getVimshottariDasha(moonNakshatraIdx, moonLonInNakshatra, birthDate) {
  // Current dasha lord based on Moon nakshatra
  const dashaLord = NAKSHATRA_DASHA[moonNakshatraIdx];
  const dashaYears = DASHA_YEARS[dashaLord];
  // Fraction of nakshatra completed
  const nakshatraSpan = 360 / 27; // 13.333°
  const fractionCompleted = moonLonInNakshatra / nakshatraSpan;
  const dashaElapsed = fractionCompleted * dashaYears;
  const dashaStart = new Date(birthDate.getTime() - dashaElapsed * 365.25 * 24 * 3600 * 1000);

  // Build dasha sequence from birth
  const sequence = [];
  let startIdx = DASHA_LORDS.indexOf(dashaLord);
  let currentDate = dashaStart;
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_LORDS[(startIdx + i) % 9];
    const years = DASHA_YEARS[lord];
    const end = new Date(currentDate.getTime() + years * 365.25 * 24 * 3600 * 1000);
    sequence.push({ lord, years, start: currentDate.toISOString().split('T')[0], end: end.toISOString().split('T')[0] });
    currentDate = end;
  }
  return { currentDasha: dashaLord, sequence };
}

export const VEDIC_SIGNS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
export const VEDIC_SIGN_MEANINGS = {
  'Mesha':'Aries - Courageous, pioneering', 'Vrishabha':'Taurus - Patient, determined',
  'Mithuna':'Gemini - Versatile, communicative', 'Karka':'Cancer - Emotional, nurturing',
  'Simha':'Leo - Confident, creative', 'Kanya':'Virgo - Analytical, practical',
  'Tula':'Libra - Balanced, diplomatic', 'Vrishchika':'Scorpio - Intense, transformative',
  'Dhanu':'Sagittarius - Philosophical, adventurous', 'Makara':'Capricorn - Ambitious, disciplined',
  'Kumbha':'Aquarius - Humanitarian, inventive', 'Meena':'Pisces - Intuitive, compassionate'
};

export function getVedicChart({ day, month, year, hour, minute, lat, lon, timezone }) {
  const utcH = hour - timezone;
  const date = new Date(Date.UTC(year, month - 1, day, utcH, minute, 0));
  const ayanamsa = getLahiriAyanamsa(date);

  const BODIES = ['sun','moon','mercury','venus','mars','jupiter','saturn'];
  const planets = {};

  for (const b of BODIES) {
    const tropLon = getPlanetLon(b, date);
    const sidLon = toSidereal(tropLon, ayanamsa);
    const signIdx = Math.floor(sidLon / 30);
    planets[b] = {
      tropicalLon: +tropLon.toFixed(4),
      siderealLon: +sidLon.toFixed(4),
      sign: VEDIC_SIGNS[signIdx],
      signIndex: signIdx,
      degree: +(sidLon % 30).toFixed(2),
      nakshatra: getNakshatra(sidLon),
    };
  }

  // Rahu/Ketu (mean node)
  const anchor = new Date('1997-01-08T00:00:00Z');
  const nnTrop = (((-0.052954 * (date - anchor) / 86400000) % 360) + 360) % 360;
  const nnSid = toSidereal(nnTrop, ayanamsa);
  planets.rahu = { siderealLon: +nnSid.toFixed(4), sign: VEDIC_SIGNS[Math.floor(nnSid/30)], degree: +(nnSid%30).toFixed(2), nakshatra: getNakshatra(nnSid) };
  planets.ketu = { siderealLon: +((nnSid+180)%360).toFixed(4), sign: VEDIC_SIGNS[Math.floor(((nnSid+180)%360)/30)], degree: +(((nnSid+180)%360)%30).toFixed(2) };

  // Lagna (sidereal ASC) - simplified
  const jd = Astronomy.MakeTime(date).ut + 2451545.0;
  const T = (jd - 2451545.0) / 36525;
  const GMST = norm(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T);
  const LST = norm(GMST + lon);
  const eps = 23.439291111 - 0.013004167 * T;
  const r = LST * Math.PI / 180, e = eps * Math.PI / 180, l = lat * Math.PI / 180;
  const tropAsc = norm((Math.atan2(-Math.cos(r), Math.sin(e) * Math.tan(l) + Math.cos(e) * Math.sin(r))) * 180 / Math.PI);
  const sidAsc = toSidereal(tropAsc, ayanamsa);
  const lagna = { siderealLon: +sidAsc.toFixed(4), sign: VEDIC_SIGNS[Math.floor(sidAsc/30)], degree: +(sidAsc%30).toFixed(2), nakshatra: getNakshatra(sidAsc) };

  // Moon nakshatra details for Dasha
  const moonNakIdx = planets.moon.nakshatra.index;
  const moonLonInNak = planets.moon.siderealLon % (360/27);
  const dasha = getVimshottariDasha(moonNakIdx, moonLonInNak, date);

  return {
    planets,
    lagna,
    ayanamsa: +ayanamsa.toFixed(4),
    dasha,
    moonNakshatra: planets.moon.nakshatra,
    meta: { system: 'Jyotish', ayanamsaType: 'Lahiri', birthDate: date.toISOString() }
  };
}
