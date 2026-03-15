const EGYPTIAN_DATE_RANGES = [
  { name: 'Nile',      ranges: [[1,1],[1,7],[6,19],[6,28],[9,1],[9,7],[11,18],[11,26]], deity: 'Hapi', element: 'Water', planet: 'Venus' },
  { name: 'Amun-Ra',   ranges: [[1,8],[1,21],[2,1],[2,11]],  deity: 'Amun-Ra', element: 'Fire', planet: 'Sun' },
  { name: 'Mut',       ranges: [[1,22],[1,31],[9,8],[9,22]], deity: 'Mut', element: 'Earth', planet: 'Moon' },
  { name: 'Geb',       ranges: [[2,12],[2,29],[8,20],[8,31]], deity: 'Geb', element: 'Earth', planet: 'Earth' },
  { name: 'Osiris',    ranges: [[3,1],[3,10],[11,27],[12,18]], deity: 'Osiris', element: 'Water', planet: 'Pluto' },
  { name: 'Isis',      ranges: [[3,11],[3,31],[10,18],[10,29],[12,19],[12,31]], deity: 'Isis', element: 'Water', planet: 'Moon' },
  { name: 'Thoth',     ranges: [[4,1],[4,19],[11,8],[11,17]], deity: 'Thoth', element: 'Air', planet: 'Mercury' },
  { name: 'Horus',     ranges: [[4,20],[5,7],[8,12],[8,19]], deity: 'Horus', element: 'Fire', planet: 'Sun/Mars' },
  { name: 'Anubis',    ranges: [[5,8],[5,27],[6,29],[7,13]], deity: 'Anubis', element: 'Air', planet: 'Mercury/Pluto' },
  { name: 'Seth',      ranges: [[5,28],[6,18],[9,28],[10,2]], deity: 'Seth', element: 'Fire', planet: 'Mars' },
  { name: 'Bastet',    ranges: [[7,14],[7,28],[9,23],[9,27],[10,3],[10,17]], deity: 'Bastet', element: 'Earth', planet: 'Moon' },
  { name: 'Sekhmet',   ranges: [[7,29],[8,11],[10,30],[11,7]], deity: 'Sekhmet', element: 'Fire', planet: 'Sun/Mars' },
];

export function getEgyptianSign(day, month) {
  // Check each sign's date ranges
  for (const sign of EGYPTIAN_DATE_RANGES) {
    const ranges = sign.ranges;
    // Ranges come in pairs [startMonth,startDay],[endMonth,endDay]
    for (let i = 0; i < ranges.length; i += 2) {
      const [sm, sd] = ranges[i];
      const [em, ed] = ranges[i+1];
      const startDay = sm * 100 + sd;
      const endDay = em * 100 + ed;
      const birthDay = month * 100 + day;
      if (birthDay >= startDay && birthDay <= endDay) {
        return sign;
      }
    }
  }
  return EGYPTIAN_DATE_RANGES[5]; // Isis as fallback
}

export { EGYPTIAN_DATE_RANGES };
