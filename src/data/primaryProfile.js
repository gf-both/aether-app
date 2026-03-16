export const DEFAULT_PRIMARY_PROFILE = {
  name: '',
  dob: '',
  tob: '',
  pob: '',
  gender: '',
  emoji: '✦',
  sign: '?',
  asc: '?',
  moon: '?',
  hdType: '?',
  hdProfile: '?',
  hdAuth: '?',
  hdDef: '?',
  lifePath: '?',
  crossGK: '?',
  birthLat: 0,
  birthLon: 0,
  birthTimezone: 0,
  enneagramType: null,
  enneagramWing: null,
  mbtiType: null,
  doshaType: null,
  archetypeType: null,
  loveLanguage: null,
}

export const DEFAULT_PEOPLE = []

export const REL_CONFIG = {
  // Family
  father:           { label: 'Father',               emoji: '👨', col: 'rgba(64,204,221,',  badge: 'family' },
  mother:           { label: 'Mother',               emoji: '👩', col: 'rgba(212,48,112,',  badge: 'family' },
  sibling:          { label: 'Sibling',              emoji: '🧑', col: 'rgba(144,80,224,',  badge: 'family' },
  child:            { label: 'Child',                emoji: '👶', col: 'rgba(96,176,48,',   badge: 'family' },
  grandparent:      { label: 'Grandparent',          emoji: '🧓', col: 'rgba(64,204,221,',  badge: 'family' },
  // Romantic
  partner:          { label: 'Partner',              emoji: '💑', col: 'rgba(212,48,112,',  badge: 'romantic' },
  spouse:           { label: 'Spouse',               emoji: '💍', col: 'rgba(240,160,60,',  badge: 'romantic' },
  'ex-spouse':      { label: 'Ex-Spouse',            emoji: '💔', col: 'rgba(180,60,80,',   badge: 'ex' },
  'ex-partner':     { label: 'Ex-Partner',           emoji: '💔', col: 'rgba(180,60,80,',   badge: 'ex' },
  // Professional
  'business-partner': { label: 'Business Partner',  emoji: '🤝', col: 'rgba(201,168,76,',  badge: 'professional' },
  'ex-business-partner': { label: 'Ex-Business Partner', emoji: '🤝', col: 'rgba(150,120,60,', badge: 'ex' },
  colleague:        { label: 'Colleague',            emoji: '💼', col: 'rgba(96,160,200,',  badge: 'professional' },
  mentor:           { label: 'Mentor',               emoji: '🎓', col: 'rgba(144,80,224,',  badge: 'professional' },
  // Social
  friend:           { label: 'Friend',               emoji: '✨', col: 'rgba(136,68,255,',  badge: 'social' },
  'close-friend':   { label: 'Close Friend',         emoji: '💫', col: 'rgba(100,80,255,',  badge: 'social' },
  'ex-friend':      { label: 'Ex-Friend',            emoji: '👤', col: 'rgba(120,100,160,', badge: 'ex' },
  // Other
  other:            { label: 'Other',                emoji: '🌟', col: 'rgba(201,168,76,',  badge: 'other' },
}
