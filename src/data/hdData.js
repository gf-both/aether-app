export { getHDChart } from '../engines/hdEngine.js'

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

export const CHANNELS = [
  [0,1,false],[1,2,false],[2,3,true],[3,5,false],[3,4,false],
  [5,8,false],[6,5,false],[4,7,false],[7,8,true],[6,8,true],[2,7,false],
]

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

export const DESIGN_PLANETS = [
  { sym: '☉', val: '28.5' }, { sym: '⊕', val: '27.5' }, { sym: '☽', val: '53.4' },
  { sym: '☊', val: '7.4' },  { sym: '☋', val: '13.4' }, { sym: '☿', val: '1.5' },
  { sym: '♀', val: '46.1' }, { sym: '♂', val: '5.1' },  { sym: '♃', val: '46.3' },
  { sym: '♄', val: '18.1' }, { sym: '♅', val: '14.1' }, { sym: '♆', val: '26.5' },
  { sym: '♇', val: '32.2' },
]

export const PERSONALITY_PLANETS = [
  { sym: '☉', val: '41.3' }, { sym: '⊕', val: '31.3' }, { sym: '☽', val: '47.2' },
  { sym: '☊', val: '33.4' }, { sym: '☋', val: '19.4' }, { sym: '☿', val: '49.1' },
  { sym: '♀', val: '54.1' }, { sym: '♂', val: '49.1' }, { sym: '♃', val: '48.1' },
  { sym: '♄', val: '48.1' }, { sym: '♅', val: '14.6' }, { sym: '♆', val: '11.2' },
  { sym: '♇', val: '32.4' },
]

export const HD_TAGS = [
  { label: 'PROJECTOR', bg: 'rgba(64,204,221,.07)', border: 'rgba(64,204,221,.22)', color: 'var(--aqua2)' },
  { label: '3/5 MARTYR·HERETIC', bg: 'rgba(201,168,76,.06)', border: 'rgba(201,168,76,.18)', color: 'var(--gold)' },
  { label: 'EMOTIONAL AUTHORITY', bg: 'rgba(212,48,112,.06)', border: 'rgba(240,96,160,.18)', color: 'var(--rose2)' },
  { label: 'SPLIT DEFINITION', bg: 'rgba(104,32,176,.06)', border: 'rgba(144,80,224,.18)', color: 'var(--violet2)' },
  { label: 'WAIT FOR INVITATION', bg: 'rgba(96,176,48,.06)', border: 'rgba(96,176,48,.18)', color: 'var(--lime2)' },
  { label: 'CROSS UNEXPECTED 41/31|28/27', bg: 'rgba(136,68,255,.06)', border: 'rgba(136,68,255,.18)', color: '#aa80ff' },
]
