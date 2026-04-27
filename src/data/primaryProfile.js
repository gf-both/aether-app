// ─────────────────────────────────────────────────────────────────────────────
// DEV SEED PROFILES — REMOVE FOR PRODUCTION
// To clear: set DEFAULT_PRIMARY_PROFILE back to empty fields,
//           set DEFAULT_PEOPLE back to [].
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_PRIMARY_PROFILE = {
  // DEV SEED — Gaston Frydlewski
  name: 'Gaston Frydlewski',
  dob: '1981-01-23',
  tob: '22:10',
  pob: 'Buenos Aires, Argentina',
  gender: 'male',
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
  birthLat: -34.6037,
  birthLon: -58.3816,
  birthTimezone: -3,
  enneagramType: 4,
  enneagramWing: 5,
  enneagramInstinct: 'sx',
  mbtiType: 'INFJ',
  doshaType: 'Tridoshic',
  archetypeType: null,
  loveLanguage: 'Words of Affirmation',
  lastPeriodDate: '',
  cycleLength: 28,
}

export const DEFAULT_PEOPLE = [
  // DEV SEED — Jane Doe (placeholder, remove before launch)
  {
    id: 100001,
    name: 'Jane Doe',
    dob: '1982-04-23',
    tob: '17:25',
    pob: 'Buenos Aires, Argentina',
    gender: 'female',
    rel: 'ex-spouse',
    emoji: '💔',
    sign: '?',
    asc: '?',
    moon: '?',
    hdType: '?',
    hdProfile: '2/4',
    hdAuth: '?',
    hdDef: '?',
    lifePath: '?',
    crossGK: '?',
    birthLat: -34.6037,
    birthLon: -58.3816,
    birthTimezone: -3,
    enneagramType: 2,
    enneagramWing: null,
    enneagramInstinct: 'sx',
    mbtiType: null,
    doshaType: null,
    archetypeType: null,
    loveLanguage: null,
  },
]

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
