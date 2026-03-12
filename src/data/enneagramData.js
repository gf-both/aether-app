export const ENNEAGRAM_TYPES = [
  {
    number: 1, name: 'Reformer', triad: 'Body', center: 'Gut',
    fear: 'Being corrupt, evil, or defective',
    desire: 'To be good, virtuous, and balanced',
    motivation: 'To be right, improve everything, justify self, be beyond criticism',
    vice: 'Anger', virtue: 'Serenity',
    keywords: ['Principled', 'Purposeful', 'Self-controlled', 'Perfectionistic'],
    growth: 7, stress: 4, wings: [9, 2],
    col: 'rgba(220,60,60,',
  },
  {
    number: 2, name: 'Helper', triad: 'Heart', center: 'Feeling',
    fear: 'Being unwanted or unworthy of love',
    desire: 'To feel loved and appreciated',
    motivation: 'To be needed, to express feelings, to gain approval through giving',
    vice: 'Pride', virtue: 'Humility',
    keywords: ['Generous', 'Demonstrative', 'People-pleasing', 'Possessive'],
    growth: 4, stress: 8, wings: [1, 3],
    col: 'rgba(240,96,160,',
  },
  {
    number: 3, name: 'Achiever', triad: 'Heart', center: 'Feeling',
    fear: 'Being worthless or without inherent value',
    desire: 'To feel valuable and worthwhile',
    motivation: 'To distinguish self, to have attention, to be admired, to impress others',
    vice: 'Deceit', virtue: 'Authenticity',
    keywords: ['Adaptable', 'Excelling', 'Driven', 'Image-conscious'],
    growth: 6, stress: 9, wings: [2, 4],
    col: 'rgba(240,200,40,',
  },
  {
    number: 4, name: 'Individualist', triad: 'Heart', center: 'Feeling',
    fear: 'Having no identity or personal significance',
    desire: 'To find themselves and their significance',
    motivation: 'To express individuality, create beauty, withdraw to protect self-image',
    vice: 'Envy', virtue: 'Equanimity',
    keywords: ['Expressive', 'Dramatic', 'Self-absorbed', 'Temperamental'],
    growth: 1, stress: 2, wings: [3, 5],
    col: 'rgba(144,80,224,',
  },
  {
    number: 5, name: 'Investigator', triad: 'Head', center: 'Thinking',
    fear: 'Being useless, helpless, or incapable',
    desire: 'To be capable and competent',
    motivation: 'To possess knowledge, understand the environment, have everything figured out',
    vice: 'Avarice', virtue: 'Non-attachment',
    keywords: ['Perceptive', 'Innovative', 'Secretive', 'Isolated'],
    growth: 8, stress: 7, wings: [4, 6],
    col: 'rgba(64,204,221,',
  },
  {
    number: 6, name: 'Loyalist', triad: 'Head', center: 'Thinking',
    fear: 'Being without support or guidance',
    desire: 'To have security and support',
    motivation: 'To have reassurance, to test attitudes of others, to fight against anxiety',
    vice: 'Fear', virtue: 'Courage',
    keywords: ['Engaging', 'Responsible', 'Anxious', 'Suspicious'],
    growth: 9, stress: 3, wings: [5, 7],
    col: 'rgba(96,176,48,',
  },
  {
    number: 7, name: 'Enthusiast', triad: 'Head', center: 'Thinking',
    fear: 'Being deprived or trapped in pain',
    desire: 'To be satisfied and content',
    motivation: 'To maintain freedom, avoid pain, keep options open, stay stimulated',
    vice: 'Gluttony', virtue: 'Sobriety',
    keywords: ['Spontaneous', 'Versatile', 'Scattered', 'Acquisitive'],
    growth: 5, stress: 1, wings: [6, 8],
    col: 'rgba(240,160,40,',
  },
  {
    number: 8, name: 'Challenger', triad: 'Body', center: 'Gut',
    fear: 'Being harmed or controlled by others',
    desire: 'To protect themselves and determine their own course',
    motivation: 'To be self-reliant, prove strength, resist weakness, be important',
    vice: 'Lust', virtue: 'Innocence',
    keywords: ['Self-confident', 'Decisive', 'Willful', 'Confrontational'],
    growth: 2, stress: 5, wings: [7, 9],
    col: 'rgba(220,80,80,',
  },
  {
    number: 9, name: 'Peacemaker', triad: 'Body', center: 'Gut',
    fear: 'Loss, separation, and fragmentation',
    desire: 'To have inner stability and peace of mind',
    motivation: 'To create harmony, avoid conflict, resist whatever disturbs them',
    vice: 'Sloth', virtue: 'Right Action',
    keywords: ['Receptive', 'Reassuring', 'Complacent', 'Resigned'],
    growth: 3, stress: 6, wings: [8, 1],
    col: 'rgba(150,110,70,',
  },
]

export const INSTINCTUAL_VARIANTS = [
  { code: 'sp', name: 'Self-Preservation', focus: 'Safety, health, comfort, resources, material security', keyword: 'Survival' },
  { code: 'sx', name: 'Sexual / One-to-One', focus: 'Intensity, chemistry, attraction, merger, deep connection', keyword: 'Intensity' },
  { code: 'so', name: 'Social', focus: 'Community, belonging, group dynamics, social standing, contribution', keyword: 'Belonging' },
]

export const ENNEAGRAM_PROFILE = {
  type: 5,
  wing: 4,
  label: '5w4',
  name: 'The Iconoclast',
  fullName: 'Investigator with Individualist Wing',
  instinctual: { dominant: 'sp', secondary: 'sx', blind: 'so', stacking: 'sp/sx' },
  tritype: {
    types: [5, 4, 1],
    label: '5-4-1',
    name: 'The Researcher',
    description: 'Head center leads with analytical depth (5), heart center seeks unique identity (4), body center demands integrity and precision (1)',
  },
  integration: {
    direction: 8,
    description: 'Moves toward the healthy Challenger -- becomes more assertive, self-confident, decisive, and grounded in physical reality',
  },
  disintegration: {
    direction: 7,
    description: 'Under stress, takes on unhealthy Enthusiast traits -- becomes scattered, impulsive, hyperactive, and avoids depth through distraction',
  },
  level: {
    current: 3,
    name: 'Focused Innovator',
    range: [1, 9],
    healthy: 'Pioneering visionary, discovers something genuinely profound and world-changing',
    average: 'Conceptualizing and preparing, intense mental focus, withdrawn from world',
    unhealthy: 'Nihilistic, eccentric, isolated from reality, phobic detachment',
  },
  wingInfluence: {
    wing4: 'Adds emotional depth, aesthetic sensibility, introspection, and creative originality to the 5s analytical nature',
    wing6: 'Adds loyalty, groundedness, practical problem-solving, and collaborative orientation',
  },
  growth: [
    'Practice staying physically present and embodied rather than retreating into mental models',
    'Share knowledge and observations before they feel complete or perfect',
    'Allow emotional experiences without intellectualizing them immediately',
    'Move toward engagement and assertive action (integration to 8)',
    'Build a small circle of deep trust and let people in consistently',
    'Balance solitary investigation with collaborative creation',
  ],
}

export const ENNEAGRAM_QUIZ = [
  {
    q: 'When facing a problem, my first instinct is to:',
    opts: [
      { label: 'Find the correct or ideal solution', scores: { 1: 3, 5: 1 } },
      { label: 'Help someone else who is affected', scores: { 2: 3, 9: 1 } },
      { label: 'Figure out the most efficient approach', scores: { 3: 3, 8: 1 } },
      { label: 'Understand its deeper meaning to me personally', scores: { 4: 3, 5: 1 } },
    ],
  },
  {
    q: 'In social settings I tend to:',
    opts: [
      { label: 'Observe quietly, conserving my energy', scores: { 5: 3, 4: 1 } },
      { label: 'Check if the environment feels safe and reliable', scores: { 6: 3, 1: 1 } },
      { label: 'Seek out new experiences and conversations', scores: { 7: 3, 3: 1 } },
      { label: 'Take charge and set the tone', scores: { 8: 3, 3: 1 } },
    ],
  },
  {
    q: 'My greatest fear is:',
    opts: [
      { label: 'Being corrupt, wrong, or imperfect', scores: { 1: 3 } },
      { label: 'Being unloved or unwanted', scores: { 2: 3 } },
      { label: 'Being worthless or a failure', scores: { 3: 3 } },
      { label: 'Having no identity or significance', scores: { 4: 3 } },
    ],
  },
  {
    q: 'What drains me most:',
    opts: [
      { label: 'Feeling incompetent or unprepared', scores: { 5: 3 } },
      { label: 'Lack of support or security', scores: { 6: 3 } },
      { label: 'Being trapped, bored, or in pain', scores: { 7: 3 } },
      { label: 'Being controlled or vulnerable', scores: { 8: 3 } },
    ],
  },
  {
    q: 'People would describe me as:',
    opts: [
      { label: 'Principled and improvement-oriented', scores: { 1: 3, 3: 1 } },
      { label: 'Warm, caring, and generous', scores: { 2: 3, 9: 1 } },
      { label: 'Driven, polished, and goal-focused', scores: { 3: 3, 8: 1 } },
      { label: 'Creative, sensitive, and unique', scores: { 4: 3, 5: 1 } },
    ],
  },
  {
    q: 'When stressed, I typically:',
    opts: [
      { label: 'Withdraw and research obsessively', scores: { 5: 3, 1: 1 } },
      { label: 'Become anxious and seek reassurance', scores: { 6: 3, 2: 1 } },
      { label: 'Distract myself with plans and options', scores: { 7: 3, 3: 1 } },
      { label: 'Become confrontational and controlling', scores: { 8: 3, 1: 1 } },
    ],
  },
  {
    q: 'I value most:',
    opts: [
      { label: 'Integrity and doing things right', scores: { 1: 3 } },
      { label: 'Deep connection and being needed', scores: { 2: 3 } },
      { label: 'Knowledge and understanding', scores: { 5: 3 } },
      { label: 'Inner peace and harmony', scores: { 9: 3 } },
    ],
  },
  {
    q: 'My relationship to conflict is:',
    opts: [
      { label: 'I engage it head-on when necessary', scores: { 8: 3, 1: 1 } },
      { label: 'I avoid it and seek compromise', scores: { 9: 3, 2: 1 } },
      { label: 'I analyze it from a distance', scores: { 5: 3, 6: 1 } },
      { label: 'I feel it deeply and express it emotionally', scores: { 4: 3, 2: 1 } },
    ],
  },
  {
    q: 'At my best, I am:',
    opts: [
      { label: 'A visionary pioneer discovering profound truths', scores: { 5: 3, 4: 1 } },
      { label: 'A courageous leader empowering others', scores: { 8: 3, 2: 1 } },
      { label: 'A joyful, present, and grateful person', scores: { 7: 3, 9: 1 } },
      { label: 'A wise, serene force for good', scores: { 1: 3, 9: 1 } },
    ],
  },
]

export const TRIAD_COLORS = {
  Head: { bg: 'rgba(64,204,221,.08)', border: 'rgba(64,204,221,.22)', color: 'var(--aqua2)' },
  Heart: { bg: 'rgba(240,96,160,.08)', border: 'rgba(240,96,160,.22)', color: 'var(--rose2)' },
  Body: { bg: 'rgba(220,80,80,.08)', border: 'rgba(220,80,80,.22)', color: '#ee5544' },
}
