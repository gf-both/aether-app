import ROLE_BLUEPRINTS from '../../docs/role-blueprints.json' with { type: 'json' };

// Score a user's chart against each role blueprint
export function getCareerAlignment(userProfile) {
  // userProfile = { natal, hd, geneKeys, numerology, mayan, celtic, ... }
  // (same shape as what getNatalChart + other engines return)

  const scores = [];

  for (const [role, blueprint] of Object.entries(ROLE_BLUEPRINTS)) {
    let score = 0;
    let matches = [];
    let gaps = [];

    const sys = blueprint.systems;
    const natal = userProfile.natal;
    const num = userProfile.numerology;
    const gk = userProfile.geneKeys;
    const hd = userProfile.hd;
    const mayan = userProfile.mayan;

    // ── NATAL SCORING ────────────────────────────────────
    if (natal) {
      // Sun sign match
      if (sys.natal?.sun?.ideal?.includes(natal.planets.sun.sign)) {
        score += 15;
        matches.push(`${natal.planets.sun.sign} Sun ✓`);
      }
      // Moon sign match
      if (sys.natal?.moon?.ideal?.includes(natal.planets.moon.sign)) {
        score += 12;
        matches.push(`${natal.planets.moon.sign} Moon ✓`);
      }
      // ASC match
      if (sys.natal?.asc?.ideal?.includes(natal.angles.asc.sign)) {
        score += 8;
        matches.push(`${natal.angles.asc.sign} Rising ✓`);
      }
      // Mercury match
      if (sys.natal?.mercury?.ideal?.includes(natal.planets.mercury.sign)) {
        score += 5;
        matches.push(`${natal.planets.mercury.sign} Mercury ✓`);
      }
      // Mars match
      if (sys.natal?.mars?.ideal?.includes(natal.planets.mars.sign)) {
        score += 5;
        matches.push(`Mars ${natal.planets.mars.sign} ✓`);
      }
      // Check avoid list
      if (sys.natal?.avoid) {
        for (const avoidStr of sys.natal.avoid) {
          const moonMatch = avoidStr.toLowerCase().includes(natal.planets.moon.sign.toLowerCase());
          const marsMatch = avoidStr.toLowerCase().includes(natal.planets.mars.sign.toLowerCase());
          if (moonMatch || marsMatch) {
            score -= 5;
            gaps.push(avoidStr);
          }
        }
      }
    }

    // ── HD SCORING ────────────────────────────────────────
    if (hd && sys.humanDesign) {
      if (sys.humanDesign.type?.ideal?.includes(hd.type)) {
        score += 18;
        matches.push(`${hd.type} HD Type ✓`);
      }
      if (sys.humanDesign.profile?.ideal?.includes(hd.profile)) {
        score += 12;
        matches.push(`${hd.profile} Profile ✓`);
      }
      if (sys.humanDesign.authority?.ideal?.includes(hd.authority)) {
        score += 8;
        matches.push(`${hd.authority} Authority ✓`);
      }
    }

    // ── NUMEROLOGY SCORING ────────────────────────────────
    if (num && sys.numerology) {
      if (sys.numerology.lifePath?.ideal?.includes(num.core.lifePath.val)) {
        score += 15;
        matches.push(`Life Path ${num.core.lifePath.val} ✓`);
      }
      if (sys.numerology.expression?.ideal?.includes(num.core.expression.val)) {
        score += 8;
        matches.push(`Expression ${num.core.expression.val} ✓`);
      }
    }

    // ── GENE KEYS SCORING ─────────────────────────────────
    if (gk && sys.geneKeys) {
      const userLW = gk.spheres?.lifesWork?.gate;
      if (userLW && sys.geneKeys.lifesWork?.ideal?.includes(userLW)) {
        score += 12;
        matches.push(`GK ${userLW} Life's Work ✓`);
      }
    }

    // ── MAYAN SCORING ─────────────────────────────────────
    if (mayan && sys.mayan) {
      if (sys.mayan.daySign?.ideal?.includes(mayan.tzolkin?.daySign)) {
        score += 8;
        matches.push(`${mayan.tzolkin.daySign} Mayan Sign ✓`);
      }
      if (sys.mayan.tone?.ideal?.includes(mayan.tzolkin?.tone)) {
        score += 5;
        matches.push(`Tone ${mayan.tzolkin.tone} ✓`);
      }
    }

    // ── CELTIC SCORING ────────────────────────────────────
    if (userProfile.celtic && sys.celtic?.ideal) {
      if (sys.celtic.ideal.includes(userProfile.celtic.birthTree?.name)) {
        score += 5;
        matches.push(`${userProfile.celtic.birthTree.name} Celtic Tree ✓`);
      }
    }

    // Normalize to 0-100
    const maxPossible = 111; // max if everything matches
    const normalizedScore = Math.round(Math.min(100, (score / maxPossible) * 100));

    scores.push({
      role,
      score: normalizedScore,
      rawScore: score,
      matches,
      gaps,
      description: blueprint.description,
      idealProfile: blueprint.idealProfile,
      category: getCategoryForRole(role),
    });
  }

  // Sort by score
  scores.sort((a, b) => b.score - a.score);

  // Aggregate category scores for radar
  const categoryScores = aggregateCategoryScores(scores);

  return {
    topRoles: scores.slice(0, 5),
    allRoles: scores,
    primaryCategory: scores[0]?.category,
    categoryScores,
    summary: generateSummary(scores[0], userProfile),
    workStyleInsights: generateWorkStyleInsights(userProfile),
    complementaryProfile: generateComplementaryProfile(scores, userProfile),
  };
}

function getCategoryForRole(role) {
  const cats = {
    'CEO / Founder': 'Leadership',
    'CTO / Principal Engineer': 'Technical',
    'Frontend Engineer / UX Engineer': 'Technical',
    'Content Marketing / Storyteller': 'Creative',
    'Community Manager / Growth': 'Growth',
    'Research Analyst / Data Scientist': 'Analytical',
    'Product Manager': 'Strategy',
    'QA Engineer / Quality Assurance': 'Technical',
  };
  return cats[role] || 'General';
}

function aggregateCategoryScores(scores) {
  const cats = { Leadership: [], Technical: [], Creative: [], Growth: [], Analytical: [], Strategy: [] };
  for (const s of scores) {
    if (cats[s.category]) cats[s.category].push(s.score);
  }
  const result = {};
  for (const [cat, vals] of Object.entries(cats)) {
    result[cat] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  }
  return result;
}

function generateSummary(topRole, userProfile) {
  if (!topRole) return '';
  const sun = userProfile.natal?.planets?.sun?.sign;
  const lp = userProfile.numerology?.core?.lifePath?.val;
  const hdType = userProfile.hd?.type;
  const parts = [sun && `${sun} Sun`, lp && `Life Path ${lp}`, hdType && `${hdType} Human Design type`]
    .filter(Boolean).join(', ');
  return `Based on your ${parts}, you naturally align with ${topRole.role} roles (${topRole.score}% match). Your strongest cosmic assets: ${topRole.matches.slice(0, 3).join(', ')}.`;
}

function generateWorkStyleInsights(userProfile) {
  const insights = [];
  const sun = userProfile.natal?.planets?.sun?.sign;
  const moon = userProfile.natal?.planets?.moon?.sign;
  const lp = userProfile.numerology?.core?.lifePath?.val;
  const hdType = userProfile.hd?.type;
  const hdAuth = userProfile.hd?.authority;

  const sunTraits = {
    Aquarius: 'Systems thinker, sees the future before others do',
    Aries: 'Initiator, thrives on challenge and being first',
    Leo: 'Natural leader, needs recognition and visibility',
    Scorpio: 'Deep researcher, excels at uncovering hidden truths',
    Virgo: 'Precision-oriented, masters the details others miss',
    Capricorn: 'Strategic builder, plays the long game',
    Gemini: 'Connector, synthesizes diverse ideas naturally',
    Sagittarius: 'Visionary, sees the big picture and inspires others',
    Taurus: 'Steady builder, exceptional at follow-through',
    Cancer: 'Emotionally intelligent, builds deep team trust',
    Libra: 'Consensus-builder, excels at diplomacy and design',
    Pisces: 'Creative channel, brings intuitive breakthroughs',
  };

  const moonTraits = {
    Virgo: 'Feels most secure with precision, systems, and clear criteria',
    Cancer: 'Needs emotional safety; thrives in nurturing environments',
    Capricorn: 'Emotionally fueled by achievement and tangible results',
    Scorpio: 'Feels most alive in deep, intense work with real stakes',
    Aquarius: 'Needs intellectual freedom and unconventional structures',
    Aries: 'Energized by challenges, new starts, and direct action',
    Taurus: 'Thrives in stable, consistent environments with clear rewards',
    Gemini: 'Needs variety and intellectual stimulation to feel good',
    Leo: 'Needs recognition; thrives in visible, appreciative roles',
    Libra: 'Harmony-seeker; works best in collaborative, aesthetic environments',
    Sagittarius: 'Needs freedom, growth, and meaningful purpose',
    Pisces: 'Creative and empathic; needs space for intuition to flow',
  };

  const lpTraits = {
    1: 'Independent pioneer — best when leading their own path',
    2: 'Master collaborator — thrives in partnership and mediation',
    3: 'Creative expression — needs outlets for ideas and communication',
    4: 'Foundation builder — excels at structure, process, and reliability',
    5: 'Freedom seeker — needs variety, change, and versatile roles',
    6: 'Responsibility bearer — natural at care, quality, and service',
    7: 'Depth over breadth — research before action, mastery over speed',
    8: 'Power & abundance — built for leadership, business, and impact',
    9: 'Universal service — most fulfilled when work has larger meaning',
    11: 'Spiritual messenger — visionary insight, needs purpose beyond profit',
    22: 'Master builder — can manifest large-scale visions into reality',
    33: 'Master teacher — here to uplift and empower at scale',
  };

  const hdTypeTraits = {
    Projector: 'Guide, don\'t initiate — wait for the invitation, then lead with insight',
    Generator: 'Respond, don\'t initiate — wait for what lights you up, then commit fully',
    'Manifesting Generator': 'Respond and initiate — multi-passionate, built for speed and pivots',
    Manifestor: 'Initiate boldly — inform others, then act independently',
    Reflector: 'Mirror for others — needs full lunar cycle before major decisions',
  };

  if (sun && sunTraits[sun]) insights.push({ label: `Sun in ${sun}`, text: sunTraits[sun] });
  if (moon && moonTraits[moon]) insights.push({ label: `Moon in ${moon}`, text: moonTraits[moon] });
  if (lp && lpTraits[lp]) insights.push({ label: `Life Path ${lp}`, text: lpTraits[lp] });
  if (hdType && hdTypeTraits[hdType]) insights.push({ label: hdType, text: hdTypeTraits[hdType] });
  if (hdAuth) insights.push({ label: `${hdAuth} Authority`, text: `Decision-making: trust your ${hdAuth.toLowerCase().split(' ')[0]}` });

  return insights;
}

function generateComplementaryProfile(scores, userProfile) {
  // Find lowest-scoring categories = blind spots
  const catScores = aggregateCategoryScores(scores);
  const sorted = Object.entries(catScores).sort((a, b) => a[1] - b[1]);
  const blindSpots = sorted.slice(0, 2).map(([cat]) => cat.toLowerCase());

  const complementMap = {
    Creative: { signs: ['Gemini Sun', 'Libra Moon'], lifePaths: [3, 6] },
    Growth: { signs: ['Gemini Sun', 'Cancer Moon'], lifePaths: [3, 1] },
    Leadership: { signs: ['Aries Sun', 'Leo Moon'], lifePaths: [1, 8] },
    Technical: { signs: ['Virgo Sun', 'Aquarius Moon'], lifePaths: [4, 7] },
    Analytical: { signs: ['Virgo Sun', 'Capricorn Moon'], lifePaths: [7, 4] },
    Strategy: { signs: ['Capricorn Sun', 'Sagittarius Moon'], lifePaths: [8, 9] },
  };

  const suggestions = [];
  for (const [cat] of sorted.slice(0, 2)) {
    const c = complementMap[cat];
    if (c) suggestions.push(...c.signs.slice(0, 1), `LP${c.lifePaths[0]} or LP${c.lifePaths[1]}`);
  }

  return {
    blindSpots,
    suggestions: [...new Set(suggestions)],
  };
}
