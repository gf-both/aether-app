// ─── Practitioner Mock Data ────────────────────────────────────────────────────

export const MOCK_CLIENTS = [
  {
    id: 1,
    name: 'Elena Vasquez',
    email: 'elena@example.com',
    dob: '1990-06-15',
    birthHour: 14,
    birthMinute: 30,
    birthLat: 40.4168,
    birthLon: -3.7038,
    birthTimezone: 1,
    birthCity: 'Madrid, Spain',
    hdType: 'Projector',
    hdProfile: '3/5',
    lifePath: 3,
    status: 'active',
    sessionRate: 120,
    nextSession: '2026-03-15T14:00:00',
    sessions: [
      {
        id: 's1',
        date: '2026-03-13',
        duration: 60,
        notes: 'Discussed Gate 41 shadow (Fantasy). Elena resonated strongly with the contraction theme. Key insight: her financial blocks tie to the 41-30 channel. Action: explore where she feels most limited in creative expression.',
        actionItems: [
          { text: 'Send HD report', done: true },
          { text: 'Gate 41 contemplation exercise', done: false },
        ],
        frameworks: ['hd', 'geneKeys'],
        revenue: 120,
      },
      {
        id: 's2',
        date: '2026-02-28',
        duration: 90,
        notes: 'First session. Introduced Human Design. Elena is a 3/5 Projector with Emotional Authority. She struggled with the "wait for invitation" strategy. Explored her profile pattern: martyr/heretic. Very receptive. Recommended she track decisions vs. her emotional wave.',
        actionItems: [{ text: 'Read HD primers', done: true }],
        frameworks: ['hd'],
        revenue: 150,
      },
    ],
  },
  {
    id: 2,
    name: 'Marco Reyes',
    email: 'marco@example.com',
    dob: '1985-11-22',
    birthHour: 8,
    birthMinute: 15,
    birthLat: -23.5505,
    birthLon: -46.6333,
    birthTimezone: -3,
    birthCity: 'São Paulo, Brazil',
    hdType: 'Generator',
    hdProfile: '2/4',
    lifePath: 8,
    status: 'active',
    sessionRate: 90,
    nextSession: '2026-03-15T16:30:00',
    sessions: [
      {
        id: 's3',
        date: '2026-03-10',
        duration: 60,
        notes: 'Explored the 2/4 profile. Marco is naturally gifted (line 2) but struggles with being called out of his hermit tendencies. Discussed the Opportunist nature of line 4 — his success comes through networking, not solo effort. Life Path 8 reinforces the theme of material mastery through relationship.',
        actionItems: [
          { text: 'Identify 3 strategic relationships to nurture', done: false },
          { text: 'Journal: when do you hide vs when are you called?', done: false },
        ],
        frameworks: ['hd', 'natal'],
        revenue: 90,
      },
    ],
  },
  {
    id: 3,
    name: 'Sofia Leal',
    email: 'sofia@example.com',
    dob: '1995-03-07',
    birthHour: 22,
    birthMinute: 45,
    birthLat: 38.7223,
    birthLon: -9.1393,
    birthTimezone: 0,
    birthCity: 'Lisbon, Portugal',
    hdType: 'Manifesting Generator',
    hdProfile: '1/3',
    lifePath: 7,
    status: 'active',
    sessionRate: 85,
    nextSession: '2026-03-16T10:00:00',
    sessions: [],
  },
];

export const MOCK_REVENUE = {
  currentMonth: { total: 1840, sessions: 12, newClients: 3, avgSession: 153 },
  lastMonth: { total: 1490, sessions: 10, newClients: 2, avgSession: 149 },
  byClient: [
    { name: 'Elena V.', revenue: 870, sessions: 7 },
    { name: 'Marco R.', revenue: 630, sessions: 7 },
    { name: 'Sofia L.', revenue: 340, sessions: 4 },
  ],
  history: [
    { month: 'Jan', revenue: 980 },
    { month: 'Feb', revenue: 1490 },
    { month: 'Mar', revenue: 1840 },
  ],
};

export const MOCK_ACTIVITY = [
  { time: 'Today', text: 'Completed session with Elena V. — 3 action items', icon: '✓' },
  { time: 'Yesterday', text: 'New client inquiry from David M.', icon: '✉' },
  { time: '2 days ago', text: 'Follow-up sent to Marco R.', icon: '→' },
  { time: '3 days ago', text: 'Sofia L. confirmed next session', icon: '📅' },
];

export const HD_TYPE_COLORS = {
  Generator: '#c9a84c',
  'Manifesting Generator': '#a8845c',
  Projector: '#6fa8dc',
  Manifestor: '#e06c75',
  Reflector: '#98c379',
};

export const HD_TYPE_EMOJIS = {
  Generator: '⚡',
  'Manifesting Generator': '🌀',
  Projector: '🌸',
  Manifestor: '🔥',
  Reflector: '🌕',
};
