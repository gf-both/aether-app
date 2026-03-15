export const DEFAULT_PRIMARY_PROFILE = {
  name: 'Gaston Frydlewski',
  dob: '1981-01-23',
  tob: '22:10',
  pob: 'Buenos Aires, Argentina',
  gender: 'male',
  emoji: '♒',
  sign: 'Aquarius',
  asc: 'Virgo',
  moon: 'Virgo',
  hdType: 'Projector',
  hdProfile: '3/5',
  hdAuth: 'Emotional',
  hdDef: 'Split',
  lifePath: 7,
  crossGK: '41/31|28/27',
  // Birth location for natal chart calculation
  birthLat: -34.6037,
  birthLon: -58.3816,
  birthTimezone: -3,
}

export const DEFAULT_PEOPLE = [
  { id: 1, name: 'Father', dob: '1952-06-15', tob: '08:00', pob: 'Buenos Aires, AR', rel: 'father', gender: 'male', emoji: '♊', notes: '', sign: 'Gemini' },
  { id: 2, name: 'Mother', dob: '1955-11-22', tob: '', pob: 'Rosario, AR', rel: 'mother', gender: 'female', emoji: '♏', notes: '', sign: 'Scorpio' },
]

export const REL_CONFIG = {
  father:  { label: 'Father',  emoji: '👨', col: 'rgba(64,204,221,',  badge: 'family' },
  mother:  { label: 'Mother',  emoji: '👩', col: 'rgba(212,48,112,',  badge: 'family' },
  partner: { label: 'Partner', emoji: '💑', col: 'rgba(212,48,112,',  badge: 'romantic' },
  spouse:  { label: 'Spouse',  emoji: '💍', col: 'rgba(240,160,60,',  badge: 'romantic' },
  sibling: { label: 'Sibling', emoji: '🧑', col: 'rgba(144,80,224,',  badge: 'family' },
  child:   { label: 'Child',   emoji: '👶', col: 'rgba(96,176,48,',   badge: 'family' },
  friend:  { label: 'Friend',  emoji: '✨', col: 'rgba(136,68,255,',  badge: 'family' },
  other:   { label: 'Other',   emoji: '🌟', col: 'rgba(201,168,76,',  badge: 'family' },
}
