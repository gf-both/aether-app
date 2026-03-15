export const LOVE_LANGUAGES = [
  { id: 'words', name: 'Words of Affirmation', desc: 'Verbal expressions of love, appreciation, encouragement', emoji: '💬' },
  { id: 'acts',  name: 'Acts of Service',       desc: 'Doing helpful things, reducing burden, practical care', emoji: '🤝' },
  { id: 'gifts', name: 'Receiving Gifts',       desc: 'Thoughtful presents, symbols of love and remembrance', emoji: '🎁' },
  { id: 'time',  name: 'Quality Time',          desc: 'Undivided attention, shared experiences, presence', emoji: '⏱️' },
  { id: 'touch', name: 'Physical Touch',        desc: 'Hugs, holding hands, physical closeness and comfort', emoji: '🤗' },
];

export const LOVE_LANG_QUESTIONS = [
  { a: { text: "Hearing 'I love you' and verbal appreciation", lang: 'words' }, b: { text: "Getting a hug or physical comfort", lang: 'touch' } },
  { a: { text: "Someone doing a task you hate", lang: 'acts' },                  b: { text: "Spending uninterrupted time together", lang: 'time' } },
  { a: { text: "Receiving a thoughtful gift", lang: 'gifts' },                  b: { text: "Hearing 'you did great' or compliments", lang: 'words' } },
  { a: { text: "A back rub after a hard day", lang: 'touch' },                  b: { text: "Partner handles errands for you", lang: 'acts' } },
  { a: { text: "A surprise present just because", lang: 'gifts' },              b: { text: "Full attention, no phones, just you two", lang: 'time' } },
  { a: { text: "Being told you're appreciated", lang: 'words' },                b: { text: "A thoughtful, symbolic gift", lang: 'gifts' } },
  { a: { text: "Partner making dinner for you", lang: 'acts' },                 b: { text: "Holding hands while walking", lang: 'touch' } },
  { a: { text: "A special date night together", lang: 'time' },                 b: { text: "A heartfelt written note", lang: 'words' } },
  { a: { text: "Physical affection in public", lang: 'touch' },                 b: { text: "A meaningful souvenir from a trip", lang: 'gifts' } },
  { a: { text: "Partner helping with your workload", lang: 'acts' },            b: { text: "A dedicated weekend just together", lang: 'time' } },
];

export function getLoveLanguageProfile(answers) {
  // answers = array of lang IDs chosen
  const counts = { words:0, acts:0, gifts:0, time:0, touch:0 };
  for (const a of answers) counts[a] = (counts[a]||0)+1;
  const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  const primary = LOVE_LANGUAGES.find(l => l.id === sorted[0][0]);
  const secondary = LOVE_LANGUAGES.find(l => l.id === sorted[1][0]);
  return { primary, secondary, scores: counts };
}
