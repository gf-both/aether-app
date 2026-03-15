const FIXED_STARS = [
  { name: 'Algol',          lon: 26.1,  sign: 'Taurus',      nature: 'Saturn/Mars',     meaning: 'Intense, transformative, head of Medusa — great challenge or power', keywords: 'Power through crisis' },
  { name: 'Alcyone',        lon: 30.1,  sign: 'Taurus',      nature: 'Moon/Jupiter',    meaning: 'The Pleiades — mystical, melancholic, artistic, sorrowful beauty', keywords: 'Mystical sensitivity' },
  { name: 'Aldebaran',      lon: 70.1,  sign: 'Gemini',      nature: 'Mars',            meaning: 'Royal star — integrity, courage, honor, but requires moral clarity', keywords: 'Integrity and honor' },
  { name: 'Rigel',          lon: 77.1,  sign: 'Gemini',      nature: 'Jupiter/Mars',    meaning: 'Brings success through intellectual and mechanical skill', keywords: 'Technical mastery' },
  { name: 'Betelgeuse',     lon: 89.0,  sign: 'Gemini',      nature: 'Mercury/Mars',    meaning: 'Great success, the explorer, never gives up, martial energy', keywords: 'Persistent success' },
  { name: 'Sirius',         lon: 104.1, sign: 'Cancer',      nature: 'Jupiter/Mars',    meaning: 'The brightest star — ambition, fame, wealth, honor, fierce loyalty', keywords: 'Fame and loyalty' },
  { name: 'Procyon',        lon: 116.1, sign: 'Cancer',      nature: 'Mercury/Mars',    meaning: 'Rashness, sudden success then loss, the Little Dog Star', keywords: 'Rapid change' },
  { name: 'Regulus',        lon: 150.2, sign: 'Virgo',       nature: 'Jupiter/Mars',    meaning: 'Royal star — fame, power, leadership, success if revenge avoided', keywords: 'Royal power' },
  { name: 'Vindemiatrix',   lon: 170.1, sign: 'Virgo',       nature: 'Saturn/Mercury',  meaning: 'The Grape Gatherer — widowhood, loss, separation, but also harvest', keywords: 'Harvest through loss' },
  { name: 'Spica',          lon: 204.1, sign: 'Libra',       nature: 'Venus/Mars',      meaning: 'The most fortunate fixed star — gifts, artistic talent, brilliance', keywords: 'Exceptional gifts' },
  { name: 'Arcturus',       lon: 204.3, sign: 'Libra',       nature: 'Jupiter/Mars',    meaning: 'Success through personal effort, wealth, fame, the Bear Watcher', keywords: 'Earned success' },
  { name: 'Zuben Elgenubi', lon: 225.2, sign: 'Scorpio',     nature: 'Saturn/Mars',     meaning: 'Social reform, rebellion against authority, the Southern Scale', keywords: 'Social justice' },
  { name: 'Zuben Eschamali',lon: 232.0, sign: 'Scorpio',     nature: 'Jupiter/Mercury', meaning: 'Mental brilliance, fortunate, the Northern Scale', keywords: 'Mental fortune' },
  { name: 'Unukalhai',      lon: 222.1, sign: 'Scorpio',     nature: 'Saturn/Mars',     meaning: 'Heart of the Serpent — immorality, crime, but also deep healing power', keywords: 'Serpent wisdom' },
  { name: 'Antares',        lon: 249.9, sign: 'Sagittarius', nature: 'Mars/Jupiter',    meaning: 'Royal star — obsession, recklessness, but also greatness through courage', keywords: 'Courageous obsession' },
  { name: 'Vega',           lon: 285.1, sign: 'Capricorn',   nature: 'Venus/Mercury',   meaning: 'Magical, idealistic, poetic, the Lyra star — artistic genius', keywords: 'Artistic magic' },
  { name: 'Altair',         lon: 301.9, sign: 'Aquarius',    nature: 'Mars/Jupiter',    meaning: 'Bold, confident, decisive, the Eagle — leadership and daring', keywords: 'Eagle boldness' },
  { name: 'Fomalhaut',      lon: 334.1, sign: 'Pisces',      nature: 'Venus/Mercury',   meaning: 'Royal star — idealism, poetic fantasy, mystical beauty, otherworldly', keywords: 'Mystical idealism' },
  { name: 'Scheat',         lon: 339.9, sign: 'Pisces',      nature: 'Mars/Mercury',    meaning: 'Danger, imprisonment, drowning, but also great intellectual power', keywords: 'Intellectual peril' },
  { name: 'Achernar',       lon: 15.2,  sign: 'Aries',       nature: 'Jupiter',         meaning: 'Success in public life, religion, philosophy — the end of the river', keywords: 'Philosophical success' },
];

const ORB = 1.5; // degrees for fixed star conjunctions

export function getFixedStars(natalChart) {
  const results = [];
  const planets = { ...natalChart.planets, asc: natalChart.angles.asc, mc: natalChart.angles.mc };

  for (const [planetName, planet] of Object.entries(planets)) {
    for (const star of FIXED_STARS) {
      let diff = Math.abs(planet.lon - star.lon);
      if (diff > 180) diff = 360 - diff;

      if (diff <= ORB) {
        results.push({
          planet: planetName,
          planetSign: planet.sign,
          planetDegree: planet.degree,
          star: star.name,
          starLon: star.lon,
          starSign: star.sign,
          nature: star.nature,
          meaning: star.meaning,
          keywords: star.keywords,
          orb: +diff.toFixed(2),
          exact: diff < 0.5,
        });
      }
    }
  }

  return results.sort((a, b) => a.orb - b.orb);
}

export { FIXED_STARS };
