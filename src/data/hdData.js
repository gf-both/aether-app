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
// Spread out for legibility — uses full 0.15-0.85 range horizontally, 0.04-0.88 vertically
export const CENTERS = [
  { name: 'HEAD',   xf: .50, yf: .04, shape: 'tri_up',    defined: false, col: 'rgba(120,130,170,' },
  { name: 'AJNA',   xf: .50, yf: .18, shape: 'tri_down',  defined: false, col: 'rgba(120,130,170,' },
  { name: 'THROAT', xf: .50, yf: .32, shape: 'rect',      defined: true,  col: 'rgba(80,80,200,' },
  { name: 'G/SELF', xf: .50, yf: .48, shape: 'diamond',   defined: true,  col: 'rgba(240,200,40,' },
  { name: 'HEART',  xf: .76, yf: .46, shape: 'tri_right', defined: false, col: 'rgba(120,130,170,' },
  { name: 'SACRAL', xf: .50, yf: .64, shape: 'rect',      defined: false, col: 'rgba(120,130,170,' },
  { name: 'SPLEEN', xf: .24, yf: .53, shape: 'tri_left',  defined: true,  col: 'rgba(80,80,200,' },
  { name: 'SOLAR',  xf: .76, yf: .64, shape: 'tri_right', defined: true,  col: 'rgba(80,80,200,' },
  { name: 'ROOT',   xf: .50, yf: .82, shape: 'rect',      defined: true,  col: 'rgba(80,80,200,' },
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

// Gate label positions on canvas — adjusted to match spread-out centers
export const GATES = [
  { x: .50, y: .11, g: '64 61 63' },          // HEAD-AJNA channel
  { x: .50, y: .24, g: '47 24 4' },            // AJNA area
  { x: .50, y: .28, g: '17 11 43' },            // AJNA-THROAT
  { x: .50, y: .40, g: '62 23 56' },            // THROAT-G
  { x: .50, y: .56, g: '1 13 25 46' },          // G-SACRAL
  { x: .34, y: .53, g: '57 44' },               // SPLEEN side
  { x: .66, y: .53, g: '21 26' },               // HEART side
  { x: .50, y: .73, g: '14 2 5 29' },           // SACRAL-ROOT
  { x: .50, y: .88, g: '53 60 52 19 58 41' },   // ROOT area
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
