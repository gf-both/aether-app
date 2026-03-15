export const ARCHETYPES = [
  { name: 'The Innocent',  drive: 'Safety',          fear: 'Abandonment',    gift: 'Faith, optimism',          shadow: 'Denial' },
  { name: 'The Explorer',  drive: 'Freedom',          fear: 'Conformity',     gift: 'Autonomy, ambition',       shadow: 'Wandering' },
  { name: 'The Sage',      drive: 'Truth',            fear: 'Ignorance',      gift: 'Wisdom, intelligence',     shadow: 'Dogma' },
  { name: 'The Hero',      drive: 'Mastery',          fear: 'Weakness',       gift: 'Courage, discipline',      shadow: 'Arrogance' },
  { name: 'The Outlaw',    drive: 'Liberation',       fear: 'Powerlessness',  gift: 'Radical freedom',          shadow: 'Destructiveness' },
  { name: 'The Magician',  drive: 'Transformation',   fear: 'Stagnation',     gift: 'Vision, power',            shadow: 'Manipulation' },
  { name: 'The Lover',     drive: 'Intimacy',         fear: 'Isolation',      gift: 'Passion, devotion',        shadow: 'Obsession' },
  { name: 'The Jester',    drive: 'Joy',              fear: 'Boredom',        gift: 'Humor, lightness',         shadow: 'Frivolity' },
  { name: 'The Everyman',  drive: 'Belonging',        fear: 'Exclusion',      gift: 'Realism, empathy',         shadow: 'Mediocrity' },
  { name: 'The Caregiver', drive: 'Service',          fear: 'Selfishness',    gift: 'Compassion, generosity',   shadow: 'Martyrdom' },
  { name: 'The Creator',   drive: 'Creation',         fear: 'Stagnation',     gift: 'Creativity, vision',       shadow: 'Perfectionism' },
  { name: 'The Ruler',     drive: 'Control',          fear: 'Chaos',          gift: 'Leadership, order',        shadow: 'Tyranny' },
];

export function getArchetypeQuestions() {
  return [
    { q: "Your deepest drive is:", options: ARCHETYPES.map(a => ({ text: a.drive, archetype: a.name })) },
    { q: "Your greatest fear is:", options: ARCHETYPES.map(a => ({ text: a.fear, archetype: a.name })) },
    { q: "Your greatest gift is:", options: ARCHETYPES.map(a => ({ text: a.gift.split(',')[0], archetype: a.name })) },
  ];
}

export function getArchetypeProfile(selectedArchetypes) {
  // selectedArchetypes = array of archetype names
  const counts = {};
  for (const a of selectedArchetypes) counts[a] = (counts[a]||0)+1;
  const primary = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0];
  return ARCHETYPES.find(a => a.name === primary) || ARCHETYPES[0];
}
