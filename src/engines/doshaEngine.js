export const DOSHA_QUESTIONS = [
  { q: "Your body frame is:", options: [{text:"Thin, light, variable",dosha:{vata:2}},{text:"Medium, muscular",dosha:{pitta:2}},{text:"Large, solid, heavy",dosha:{kapha:2}}] },
  { q: "Your skin tends to be:", options: [{text:"Dry, rough, or thin",dosha:{vata:2}},{text:"Oily, sensitive, prone to rashes",dosha:{pitta:2}},{text:"Thick, moist, smooth",dosha:{kapha:2}}] },
  { q: "Your hair is naturally:", options: [{text:"Dry, curly, or frizzy",dosha:{vata:2}},{text:"Fine, oily, or prematurely gray",dosha:{pitta:2}},{text:"Thick, wavy, lustrous",dosha:{kapha:2}}] },
  { q: "Your appetite is:", options: [{text:"Variable — sometimes ravenous, sometimes absent",dosha:{vata:2}},{text:"Strong — you get irritable if you miss meals",dosha:{pitta:2}},{text:"Steady — you can skip meals without issue",dosha:{kapha:2}}] },
  { q: "Your digestion is:", options: [{text:"Irregular — bloating, gas, constipation",dosha:{vata:2}},{text:"Sharp — heartburn, loose stools when stressed",dosha:{pitta:2}},{text:"Slow but steady — tendency toward weight gain",dosha:{kapha:2}}] },
  { q: "Under stress, you tend to:", options: [{text:"Become anxious, scattered, overwhelmed",dosha:{vata:2}},{text:"Become irritable, critical, intense",dosha:{pitta:2}},{text:"Withdraw, become lethargic, depressed",dosha:{kapha:2}}] },
  { q: "Your sleep pattern:", options: [{text:"Light, interrupted, sometimes insomnia",dosha:{vata:2}},{text:"Moderate — fall asleep easily but may wake",dosha:{pitta:2}},{text:"Deep, long, hard to wake up",dosha:{kapha:2}}] },
  { q: "Your mental style:", options: [{text:"Quick, creative, scattered, many ideas",dosha:{vata:2}},{text:"Sharp, focused, analytical, goal-oriented",dosha:{pitta:2}},{text:"Steady, methodical, good memory, slow to learn but retains well",dosha:{kapha:2}}] },
  { q: "Your emotional nature:", options: [{text:"Enthusiastic, fearful, changeable",dosha:{vata:2}},{text:"Passionate, jealous, determined",dosha:{pitta:2}},{text:"Calm, attached, loyal, slow to anger",dosha:{kapha:2}}] },
  { q: "Your physical activity:", options: [{text:"Love movement but get tired easily",dosha:{vata:2}},{text:"Moderate, competitive, purposeful",dosha:{pitta:2}},{text:"Prefer gentle activities, great endurance",dosha:{kapha:2}}] },
];

export const DOSHA_DATA = {
  vata:  { name: 'Vata',  elements: 'Air + Space', qualities: 'Light, dry, cold, mobile, subtle',   season: 'Autumn/Winter', description: 'Creative, quick, intuitive, enthusiastic. When balanced: artistic, flexible, spiritual. When imbalanced: anxious, scattered, exhausted.' },
  pitta: { name: 'Pitta', elements: 'Fire + Water', qualities: 'Hot, sharp, oily, light, spreading', season: 'Summer',        description: 'Intelligent, determined, passionate, organized. When balanced: leadership, courage, joy. When imbalanced: irritable, critical, inflammatory.' },
  kapha: { name: 'Kapha', elements: 'Earth + Water', qualities: 'Heavy, cold, moist, stable, smooth',season: 'Spring',        description: 'Steady, compassionate, strong, loyal. When balanced: nurturing, patient, loving. When imbalanced: lethargic, possessive, depressed.' },
};

export function getDoshaProfile(answers) {
  // answers = array of {vata:n, pitta:n, kapha:n} per question
  const totals = { vata: 0, pitta: 0, kapha: 0 };
  for (const ans of answers) {
    for (const [d, v] of Object.entries(ans)) totals[d] = (totals[d] || 0) + v;
  }
  const total = totals.vata + totals.pitta + totals.kapha;
  const primary = Object.entries(totals).sort((a,b) => b[1]-a[1])[0][0];
  const secondary = Object.entries(totals).sort((a,b) => b[1]-a[1])[1][0];

  return {
    scores: { vata: Math.round(totals.vata/total*100), pitta: Math.round(totals.pitta/total*100), kapha: Math.round(totals.kapha/total*100) },
    primary: DOSHA_DATA[primary],
    secondary: DOSHA_DATA[secondary],
    constitution: `${DOSHA_DATA[primary].name}-${DOSHA_DATA[secondary].name}`,
    questions: DOSHA_QUESTIONS,
  };
}
