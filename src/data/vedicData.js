/* ---------------------------------------------------------------
   Vedic Astrology (Jyotish) data exports
   --------------------------------------------------------------- */

export { NAKSHATRAS, VEDIC_SIGNS, VEDIC_SIGN_MEANINGS, DASHA_LORDS, DASHA_YEARS } from '../engines/vedicEngine.js';

// Sign colors for canvas rendering
export const VEDIC_SIGN_COLORS = [
  '#e85555', // Mesha (Aries) - fire
  '#a08050', // Vrishabha (Taurus) - earth
  '#7799dd', // Mithuna (Gemini) - air
  '#66bbaa', // Karka (Cancer) - water
  '#f0c040', // Simha (Leo) - fire
  '#88aa77', // Kanya (Virgo) - earth
  '#cc9966', // Tula (Libra) - air
  '#8b2244', // Vrishchika (Scorpio) - water
  '#dd8833', // Dhanu (Sagittarius) - fire
  '#667788', // Makara (Capricorn) - earth
  '#44aacc', // Kumbha (Aquarius) - air
  '#6699bb', // Meena (Pisces) - water
];

// Planet symbols for Vedic astrology
export const VEDIC_PLANET_GLYPHS = {
  sun:     '☉',
  moon:    '☽',
  mercury: '☿',
  venus:   '♀',
  mars:    '♂',
  jupiter: '♃',
  saturn:  '♄',
  rahu:    '☊',
  ketu:    '☋',
};

// Planet colors
export const VEDIC_PLANET_COLORS = {
  sun:     '#f0c040',
  moon:    '#d0d8f0',
  mercury: '#99ccee',
  venus:   '#ddaa88',
  mars:    '#ee6644',
  jupiter: '#e8cc50',
  saturn:  '#aabb88',
  rahu:    '#ccaa66',
  ketu:    '#997799',
};

// Sanskrit element names and colors
export const VEDIC_ELEMENTS = {
  fire:  { name: 'Agni', color: '#e85555' },
  earth: { name: 'Prithvi', color: '#a08050' },
  air:   { name: 'Vayu', color: '#7799dd' },
  water: { name: 'Jala', color: '#66bbaa' },
};

// Sign elements (0-indexed matching VEDIC_SIGNS)
export const VEDIC_SIGN_ELEMENTS = [
  'fire','earth','air','water','fire','earth',
  'air','water','fire','earth','air','water',
];
