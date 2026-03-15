const MAJOR_ARCANA = [
  null,
  { num: 1,  name: 'The Magician',       archetype: 'The Creator',      keywords: 'Will, skill, manifestation, mastery' },
  { num: 2,  name: 'The High Priestess', archetype: 'The Oracle',       keywords: 'Intuition, mystery, the unconscious' },
  { num: 3,  name: 'The Empress',        archetype: 'The Mother',       keywords: 'Abundance, nature, creativity, fertility' },
  { num: 4,  name: 'The Emperor',        archetype: 'The Father',       keywords: 'Authority, structure, stability, protection' },
  { num: 5,  name: 'The Hierophant',     archetype: 'The Teacher',      keywords: 'Tradition, wisdom, spiritual guidance' },
  { num: 6,  name: 'The Lovers',         archetype: 'The Soul Mate',    keywords: 'Love, choice, union, values alignment' },
  { num: 7,  name: 'The Chariot',        archetype: 'The Victor',       keywords: 'Determination, control, triumph, direction' },
  { num: 8,  name: 'Strength',           archetype: 'The Courageous',   keywords: 'Inner strength, patience, compassion, courage' },
  { num: 9,  name: 'The Hermit',         archetype: 'The Seeker',       keywords: 'Solitude, inner wisdom, guidance, introspection' },
  { num: 10, name: 'Wheel of Fortune',   archetype: 'The Turner',       keywords: 'Cycles, fate, turning points, destiny' },
  { num: 11, name: 'Justice',            archetype: 'The Adjudicator',  keywords: 'Balance, truth, cause and effect, fairness' },
  { num: 12, name: 'The Hanged Man',     archetype: 'The Mystic',       keywords: 'Suspension, sacrifice, new perspective' },
  { num: 13, name: 'Death',              archetype: 'The Transformer',  keywords: 'Endings, transformation, transition, renewal' },
  { num: 14, name: 'Temperance',         archetype: 'The Alchemist',    keywords: 'Balance, moderation, patience, purpose' },
  { num: 15, name: 'The Devil',          archetype: 'The Shadow',       keywords: 'Bondage, materialism, shadow self, release' },
  { num: 16, name: 'The Tower',          archetype: 'The Awakener',     keywords: 'Sudden change, revelation, upheaval, breakthrough' },
  { num: 17, name: 'The Star',           archetype: 'The Dreamer',      keywords: 'Hope, inspiration, serenity, renewal' },
  { num: 18, name: 'The Moon',           archetype: 'The Dreamer',      keywords: 'Illusion, intuition, dreams, the unconscious' },
  { num: 19, name: 'The Sun',            archetype: 'The Child',        keywords: 'Joy, vitality, success, clarity, innocence' },
  { num: 20, name: 'Judgement',          archetype: 'The Awakened',     keywords: 'Rebirth, reckoning, absolution, calling' },
  { num: 21, name: 'The World',          archetype: 'The Dancer',       keywords: 'Completion, integration, wholeness, the universe' },
  { num: 22, name: 'The Fool',           archetype: 'The Innocent',     keywords: 'New beginnings, spontaneity, leap of faith' },
];

const CARD_PAIRS = {
  1: 10, 10: 1,
  2: 11, 11: 2,
  3: 12, 12: 3,
  4: 13, 13: 4,
  5: 14, 14: 5,
  6: 15, 15: 6,
  7: 16, 16: 7,
  8: 17, 17: 8,
  9: 18, 18: 9,
  19: 19,
  20: 20,
  21: 21,
  22: 22,
};

export function getTarotBirthCards({ day, month, year }) {
  const dateStr = String(month).padStart(2, '0') + String(day).padStart(2, '0') + String(year);
  const sumDigits = (n) => String(n).split('').reduce((a, b) => a + parseInt(b), 0);

  let sum = sumDigits(dateStr.split('').reduce((a, b) => a + parseInt(b), 0));

  while (sum > 22) {
    sum = sumDigits(sum);
  }

  const primaryCard = MAJOR_ARCANA[sum];
  const pairNum     = CARD_PAIRS[sum];
  const pairCard    = pairNum !== sum ? MAJOR_ARCANA[pairNum] : null;

  const monthReduced = sumDigits(month);
  const dayReduced   = sumDigits(day);
  const yearReduced  = sumDigits(sumDigits(sumDigits(year)));
  const lifePath     = sumDigits(monthReduced + dayReduced + yearReduced);
  const lifePathCard = MAJOR_ARCANA[lifePath] || MAJOR_ARCANA[sumDigits(lifePath)];

  return {
    primaryCard,
    pairCard,
    lifePathCard,
    birthNumber:    sum,
    lifePathNumber: lifePath,
  };
}

export { MAJOR_ARCANA };
