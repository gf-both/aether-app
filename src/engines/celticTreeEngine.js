const CELTIC_TREES = [
  { name: 'Birch',     ogham: 'Beith',  startDate: [12, 24], endDate: [1,  20], meaning: 'New beginnings, renewal, cleansing',          planet: 'Sun',     element: 'Air',   keyword: 'Initiation'    },
  { name: 'Rowan',     ogham: 'Luis',   startDate: [1,  21], endDate: [2,  17], meaning: 'Protection, insight, quickening',              planet: 'Moon',    element: 'Fire',  keyword: 'Vision'        },
  { name: 'Ash',       ogham: 'Nion',   startDate: [2,  18], endDate: [3,  17], meaning: 'Connection between worlds, cosmic order',      planet: 'Neptune', element: 'Water', keyword: 'Connection'    },
  { name: 'Alder',     ogham: 'Fearn',  startDate: [3,  18], endDate: [4,  14], meaning: 'Confidence, strength, foundation',             planet: 'Venus',   element: 'Fire',  keyword: 'Strength'      },
  { name: 'Willow',    ogham: 'Saille', startDate: [4,  15], endDate: [5,  12], meaning: 'Intuition, dream, lunar mysteries',            planet: 'Moon',    element: 'Water', keyword: 'Intuition'     },
  { name: 'Hawthorn',  ogham: 'Huath',  startDate: [5,  13], endDate: [6,   9], meaning: 'Cleansing, protection, hope',                  planet: 'Mars',    element: 'Fire',  keyword: 'Purification'  },
  { name: 'Oak',       ogham: 'Duir',   startDate: [6,  10], endDate: [7,   7], meaning: 'Strength, endurance, the gateway',             planet: 'Jupiter', element: 'Earth', keyword: 'Endurance'     },
  { name: 'Holly',     ogham: 'Tinne',  startDate: [7,   8], endDate: [8,   4], meaning: 'Balance, warrior energy, protection',          planet: 'Earth',   element: 'Fire',  keyword: 'Balance'       },
  { name: 'Hazel',     ogham: 'Coll',   startDate: [8,   5], endDate: [9,   1], meaning: 'Wisdom, inspiration, knowledge',               planet: 'Mercury', element: 'Air',   keyword: 'Wisdom'        },
  { name: 'Vine',      ogham: 'Muin',   startDate: [9,   2], endDate: [9,  29], meaning: 'Harvest, prophecy, transformation',            planet: 'Venus',   element: 'Water', keyword: 'Harvest'       },
  { name: 'Ivy',       ogham: 'Gort',   startDate: [9,  30], endDate: [10, 27], meaning: 'Patience, perseverance, tenacity',             planet: 'Moon',    element: 'Earth', keyword: 'Perseverance'  },
  { name: 'Reed',      ogham: 'Ngetal', startDate: [10, 28], endDate: [11, 24], meaning: 'Purpose, health, action',                      planet: 'Pluto',   element: 'Water', keyword: 'Purpose'       },
  { name: 'Elder',     ogham: 'Ruis',   startDate: [11, 25], endDate: [12, 23], meaning: 'Endings, rebirth, transition',                 planet: 'Saturn',  element: 'Water', keyword: 'Transformation'},
  { name: 'Mistletoe', ogham: 'Idho',   startDate: [12, 24], endDate: [12, 24], meaning: 'The mysteries, sacred pause, divine gift',     planet: 'Sun',     element: 'All',   keyword: 'Sacred'        },
];

function dateToNum(m, d) { return m * 100 + d; }

export function getCelticTree({ day, month }) {
  const birthNum = dateToNum(month, day);

  for (const tree of CELTIC_TREES) {
    const start = dateToNum(tree.startDate[0], tree.startDate[1]);
    const end   = dateToNum(tree.endDate[0],   tree.endDate[1]);

    if (start > end) {
      if (birthNum >= start || birthNum <= end) return tree;
    } else {
      if (birthNum >= start && birthNum <= end) return tree;
    }
  }

  return CELTIC_TREES[0];
}

export function getCelticTreeProfile({ day, month, year }) {
  const tree = getCelticTree({ day, month });

  const OGHAM_LETTERS = {
    B: 'Beith', L: 'Luis', F: 'Fearn', S: 'Saille', N: 'Nion',
    H: 'Huath', D: 'Duir', T: 'Tinne', C: 'Coll',   Q: 'Quert',
    M: 'Muin',  G: 'Gort', NG: 'Ngetal', R: 'Ruis',  A: 'Ailim',
    O: 'Ohn',   U: 'Ur',   E: 'Edad',  I: 'Idad',   EA: 'Ebad',
    OI: 'Oir',  UI: 'Uillean', IO: 'Iphin', AE: 'Eman', X: 'Mor',
  };

  const now = new Date();

  return {
    birthTree:   tree,
    currentTree: getCelticTree({ day: now.getDate(), month: now.getMonth() + 1 }),
    yearTree:    getCelticTree({ day: 1, month: ((year % 13) + 1) }),
    oghamLetters: OGHAM_LETTERS,
  };
}

export { CELTIC_TREES };
