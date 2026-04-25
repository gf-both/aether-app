/**
 * hdData.js — Static layout data for the Human Design canvas.
 *
 * CENTERS, CHANNELS (canvas indices), and GATES drive the body graph rendering.
 * The `defined` state is now computed dynamically by hdEngine.js.
 *
 * DESIGN_PLANETS, PERSONALITY_PLANETS, and HD_TAGS are computed from the engine
 * — see HumanDesign.jsx and HDDetail.jsx for usage.
 */

// Canvas layout data for body graph rendering (positions in 0-1 normalized coords)
// Maximally spread — uses full vertical range 0.05-0.92, horizontal 0.22-0.78
export const CENTERS = [
  { name: 'HEAD',   xf: .50, yf: .05, shape: 'tri_up',    defined: false, col: 'rgba(120,130,170,' },
  { name: 'AJNA',   xf: .50, yf: .20, shape: 'tri_down',  defined: false, col: 'rgba(120,130,170,' },
  { name: 'THROAT', xf: .50, yf: .35, shape: 'rect',      defined: true,  col: 'rgba(80,80,200,' },
  { name: 'G/SELF', xf: .50, yf: .50, shape: 'diamond',   defined: true,  col: 'rgba(240,200,40,' },
  { name: 'HEART',  xf: .78, yf: .48, shape: 'tri_right', defined: false, col: 'rgba(120,130,170,' },
  { name: 'SACRAL', xf: .50, yf: .67, shape: 'rect',      defined: false, col: 'rgba(120,130,170,' },
  { name: 'SPLEEN', xf: .22, yf: .56, shape: 'tri_left',  defined: true,  col: 'rgba(80,80,200,' },
  { name: 'SOLAR',  xf: .78, yf: .67, shape: 'tri_right', defined: true,  col: 'rgba(80,80,200,' },
  { name: 'ROOT',   xf: .50, yf: .85, shape: 'rect',      defined: true,  col: 'rgba(80,80,200,' },
]

// Canvas center index map (name → index in CENTERS array)
export const CENTER_INDEX = {
  HEAD: 0, AJNA: 1, THROAT: 2, G_SELF: 3, HEART: 4,
  SACRAL: 5, SPLEEN: 6, SOLAR: 7, ROOT: 8,
}

// Canvas channel connections [centerIndex1, centerIndex2, defined]
// defined state is updated dynamically from engine output
export const CHANNELS = [
  [0,1,false],[1,2,false],[2,3,true],[3,5,false],[3,4,false],
  [5,8,false],[6,5,false],[4,7,false],[7,8,true],[6,8,true],[2,7,false],
]

// Gate label positions on canvas — matched to maximally-spread centers
export const GATES = [
  { x: .50, y: .12, g: '64 61 63' },          // HEAD-AJNA
  { x: .50, y: .26, g: '47 24 4' },            // AJNA
  { x: .50, y: .30, g: '17 11 43' },            // AJNA-THROAT
  { x: .50, y: .42, g: '62 23 56' },            // THROAT-G
  { x: .50, y: .58, g: '1 13 25 46' },          // G-SACRAL
  { x: .33, y: .56, g: '57 44' },               // SPLEEN side
  { x: .67, y: .56, g: '21 26' },               // HEART side
  { x: .50, y: .76, g: '14 2 5 29' },           // SACRAL-ROOT
  { x: .50, y: .92, g: '53 60 52 19 58 41' },   // ROOT area
]

// Planet symbols (used in planet tables)
export const PLANET_SYMBOLS = {
  sun:       '☉',
  earth:     '⊕',
  moon:      '☽',
  northNode: '☊',
  southNode: '☋',
  mercury:   '☿',
  venus:     '♀',
  mars:      '♂',
  jupiter:   '♃',
  saturn:    '♄',
  uranus:    '♅',
  neptune:   '♆',
  pluto:     '♇',
}

export const PLANET_ORDER = [
  'sun','earth','moon','northNode','southNode',
  'mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto',
]
