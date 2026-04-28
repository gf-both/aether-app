export const SEPHIROTH = [
  { name: 'Kether',    ratio: '7/3', xf: .50, yf: .05, glyph: '✦', active: true,  col: 'rgba(255,255,255', attr: 'Crown',         num: '1' },
  { name: 'Chokmah',   ratio: '4/4', xf: .82, yf: .18, glyph: '○', active: true,  col: 'rgba(160,160,255', attr: 'Wisdom',        num: '2' },
  { name: 'Binah',     ratio: '5/4', xf: .18, yf: .18, glyph: '△', active: true,  col: 'rgba(180,80,220',  attr: 'Understanding', num: '3' },
  { name: 'Chesed',    ratio: '4/4', xf: .80, yf: .38, glyph: '□', active: false, col: 'rgba(64,204,221',  attr: 'Mercy',         num: '4' },
  { name: 'Geburah',   ratio: '6/4', xf: .20, yf: .38, glyph: '★', active: true,  col: 'rgba(220,60,60',   attr: 'Severity',      num: '5' },
  { name: 'Tiphareth', ratio: '13/8', xf: .50, yf: .52, glyph: '☉', active: true, col: 'rgba(240,200,60',  attr: 'Beauty',        num: '6' },
  { name: 'Netzach',   ratio: '4/5', xf: .80, yf: .66, glyph: '♀', active: false, col: 'rgba(80,200,80',   attr: 'Emotions',      num: '7' },
  { name: 'Hod',       ratio: '6/5', xf: .20, yf: .66, glyph: '☿', active: true,  col: 'rgba(220,180,40',  attr: 'Mind',          num: '8' },
  { name: 'Yesod',     ratio: '3/4', xf: .50, yf: .79, glyph: '☽', active: true,  col: 'rgba(170,170,200', attr: 'Foundation',    num: '9' },
  { name: 'Malkuth',   ratio: '4/3', xf: .50, yf: .95, glyph: '◉', active: true,  col: 'rgba(150,110,70',  attr: 'Kingdom',       num: '10' },
]

export const PATHS = [
  [0,1,'11',null],[0,2,'12',null],[1,2,'13',null],[0,5,'14','teal'],[1,3,'15',null],[2,4,'16',null],
  [1,5,'17','blue'],[2,5,'18',null],[3,4,'19',null],[3,5,'20',null],[4,5,'21',null],[3,6,'22',null],
  [4,7,'23',null],[5,6,'24',null],[5,7,'25',null],[5,8,'26',null],[6,7,'27',null],[6,8,'28',null],
  [7,8,'29',null],[8,9,'30','blue'],[6,9,'31','pink'],[7,9,'32',null],[2,7,'7','pink'],[4,8,'11','teal'],
]

export const PATH_COLORS = {
  null: 'rgba(180,160,100,.28)',
  teal: 'rgba(0,184,160,.68)',
  pink: 'rgba(224,64,160,.68)',
  blue: 'rgba(68,136,255,.58)',
}

export { getKabbalahProfile, profileToKabArgs } from '../engines/kabbalahEngine';
