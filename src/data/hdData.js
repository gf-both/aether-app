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
export const CENTERS = [
  { name: 'HEAD',   xf: .50, yf: .06, shape: 'tri_up',    defined: false, col: 'rgba(120,130,170,' },
  { name: 'AJNA',   xf: .50, yf: .19, shape: 'tri_down',  defined: false, col: 'rgba(120,130,170,' },
  { name: 'THROAT', xf: .50, yf: .31, shape: 'rect',      defined: true,  col: 'rgba(80,80,200,' },
  { name: 'G/SELF', xf: .50, yf: .46, shape: 'diamond',   defined: true,  col: 'rgba(240,200,40,' },
  { name: 'HEART',  xf: .685, yf: .46, shape: 'tri_right', defined: false, col: 'rgba(120,130,170,' },
  { name: 'SACRAL', xf: .50, yf: .61, shape: 'rect',      defined: false, col: 'rgba(120,130,170,' },
  { name: 'SPLEEN', xf: .315, yf: .52, shape: 'tri_left',  defined: true,  col: 'rgba(80,80,200,' },
  { name: 'SOLAR',  xf: .685, yf: .61, shape: 'tri_right', defined: true,  col: 'rgba(80,80,200,' },
  { name: 'ROOT',   xf: .50, yf: .79, shape: 'rect',      defined: true,  col: 'rgba(80,80,200,' },
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

// Gate label positions on canvas
export const GATES = [
  { x: .5, y: .12, g: '64 61 63' },
  { x: .5, y: .25, g: '47 24 4' },
  { x: .5, y: .29, g: '17 11 43' },
  { x: .5, y: .39, g: '62 23 56' },
  { x: .5, y: .535, g: '1 13 25 46' },
  { x: .43, y: .52, g: '57 44' },
  { x: .57, y: .52, g: '21 26' },
  { x: .5, y: .69, g: '14 2 5 29' },
  { x: .5, y: .855, g: '53 60 52 19 58 41' },
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
