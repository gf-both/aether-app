export function isRomantic(rel) {
  return rel === 'partner' || rel === 'spouse'
}

// ─── Bond Type Styles (used by SynastryPanel for badge rendering) ────────────
export const BOND_STYLES = {
  soulmate:      { bg: 'rgba(240,192,64,.12)', border: 'rgba(240,192,64,.35)', glow: 'rgba(240,192,64,.2)' },
  extraordinary: { bg: 'rgba(187,102,255,.10)', border: 'rgba(187,102,255,.30)', glow: 'rgba(187,102,255,.15)' },
  powerful:      { bg: 'rgba(64,204,221,.10)',  border: 'rgba(64,204,221,.30)',  glow: 'rgba(64,204,221,.15)' },
  meaningful:    { bg: 'rgba(96,176,48,.10)',   border: 'rgba(96,176,48,.30)',   glow: 'rgba(96,176,48,.15)' },
  complex:       { bg: 'rgba(232,160,64,.10)',  border: 'rgba(232,160,64,.30)',  glow: 'rgba(232,160,64,.15)' },
  delicate:      { bg: 'rgba(136,153,204,.10)', border: 'rgba(136,153,204,.30)', glow: 'rgba(136,153,204,.15)' },
  challenging:   { bg: 'rgba(212,64,112,.10)',  border: 'rgba(212,64,112,.30)',  glow: 'rgba(212,64,112,.15)' },
}

// ─── computeSynastryFramework ─────────────────────────────────────────────────
// Converts a getSynastryReport() result into the framework format expected by the UI.
// Pass the report and whether the relationship is romantic (true) or family (false).
export function computeSynastryFramework(report, romantic = true) {
  if (!report) return null
  const { categoryScores = {}, harmonious = [], challenging = [], insight = '', meta = {} } = report
  const aName = meta.nameA || 'A'
  const bName = meta.nameB || 'B'

  function pct(cat, fallback = 50) {
    return categoryScores[cat] ?? fallback
  }

  // Build dynamic HD items from report charts
  const hdItems = []
  if (report.chartA?.hdType || report.chartB?.hdType) {
    hdItems.push({ label: `${aName}'s Type`, value: report.chartA?.hdType || '?', color: 'var(--gold)' })
    hdItems.push({ label: `${bName}'s Type`, value: report.chartB?.hdType || '?', color: 'var(--rose2)' })
    hdItems.push({ label: 'Energy Dynamic', value: report.chartA?.hdType === report.chartB?.hdType ? 'Mirror' : 'Complement', color: '#40ccdd' })
  }

  // Build dynamic multi-system scores from report
  const multiSystemScores = [
    { label: 'Kabbalah Axis', pct: pct('karmic', 65), gradient: 'linear-gradient(90deg,#c9a84c,#e8c97a)' },
    { label: 'Numerology Harmony', pct: pct('core', 60), gradient: 'linear-gradient(90deg,#40ccdd,#88eeff)' },
    { label: 'Gene Keys Resonance', pct: pct('depth', 58), gradient: 'linear-gradient(90deg,#9050e0,#bb66ff)' },
    { label: 'Combined Healing', pct: pct('healing', 62), gradient: 'linear-gradient(90deg,#60b030,#88dd44)' },
  ]
  const multiSystemInsight = harmonious.length > 0
    ? `Strongest cross-system link: ${harmonious[0].label} (${harmonious[0].name}, ${harmonious[0].orb}° orb). ${insight || ''}`
    : `Overall multi-system score: ${report.overall || '?'}%. ${insight || ''}`

  if (romantic) {
    return {
      sections: [
        {
          headerLabel: 'ROMANTIC COMPATIBILITY',
          headerColor: 'rgba(240,96,160,.7)',
          scores: [
            { label: 'Attraction',         pct: pct('attraction', 72), gradient: 'linear-gradient(90deg,#d43070,#f060a0)' },
            { label: 'Emotional Resonance', pct: pct('emotional',  68), gradient: 'linear-gradient(90deg,#8844ff,#bb66ff)' },
            { label: 'Love Harmony',        pct: pct('love',       65), gradient: 'linear-gradient(90deg,#c9a84c,#e8c97a)' },
            { label: 'Core Identity',       pct: pct('core',       60), gradient: 'linear-gradient(90deg,#ee6644,#ff9966)' },
            { label: 'Growth Together',     pct: pct('growth',     62), gradient: 'linear-gradient(90deg,#4488ff,#88aaff)' },
            { label: 'Shared Drive',        pct: pct('drive',      58), gradient: 'linear-gradient(90deg,#f0c040,#f8e070)' },
          ],
          insight: () => insight,
        },
        {
          headerLabel: 'SOUL CONNECTION MATRIX',
          headerColor: 'rgba(64,204,221,.7)',
          scores: [
            { label: 'Karmic Bonds',        pct: pct('karmic',  65), gradient: 'linear-gradient(90deg,#1a8899,#40ccdd)' },
            { label: 'Depth & Intensity',   pct: pct('depth',   62), gradient: 'linear-gradient(90deg,#6820b0,#9050e0)' },
            { label: 'Healing Potential',   pct: pct('healing', 60), gradient: 'linear-gradient(90deg,#60b030,#88dd44)' },
            { label: 'Mental Connection',   pct: pct('mental',  65), gradient: 'linear-gradient(90deg,#3355cc,#6688ff)' },
          ],
          insight: () => harmonious.slice(0, 2).map(a =>
            `${a.label}: ${a.name} (${a.orb}° orb)`
          ).join(' · ') || insight,
        },
      ],
      hdSection: romanticFramework.hdSection,
      multiSystemSection: {
        ...romanticFramework.multiSystemSection,
        headerLabel: 'MULTI-SYSTEM RESONANCE',
        headerColor: 'rgba(201,168,76,.6)',
        scores: multiSystemScores,
        insight: () => multiSystemInsight,
      },
      hdItems: hdItems.length > 0 ? hdItems : null,
      multiSystemScores,
      multiSystemInsight,
    }
  } else {
    return {
      karmaSectionData: {
        headerLabel: 'KARMIC INHERITANCE',
        headerColor: 'rgba(64,204,221,.7)',
        scores: [
          { label: 'Karmic Ties',         pct: pct('karmic',     70), gradient: 'linear-gradient(90deg,#aabb88,#ccddaa)' },
          { label: 'Emotional Bond',      pct: pct('emotional',  68), gradient: 'linear-gradient(90deg,#8899cc,#aabbee)' },
          { label: 'Healing Potential',   pct: pct('healing',    62), gradient: 'linear-gradient(90deg,#e09040,#f0b060)' },
          { label: 'Depth of Connection', pct: pct('depth',      60), gradient: 'linear-gradient(90deg,#60b030,#88dd44)' },
          { label: 'Core Identity',       pct: pct('core',       65), gradient: 'linear-gradient(90deg,#1a8899,#40ccdd)' },
          { label: 'Intensity',           pct: pct('growth',     58), gradient: 'linear-gradient(90deg,#6820b0,#9050e0)' },
        ],
        insight,
      },
      genSectionData: {
        headerLabel: 'FAMILY CONSTELLATION',
        headerColor: 'rgba(201,168,76,.6)',
        scores: [
          { label: 'Inherited Strengths', pct: pct('attraction', 62), gradient: 'linear-gradient(90deg,#c9a84c,#e8c97a)' },
          { label: 'Shadow Patterns',     pct: pct('depth',      58), gradient: 'linear-gradient(90deg,#cc2244,#ee4466)' },
          { label: 'Healing Potential',   pct: pct('healing',    65), gradient: 'linear-gradient(90deg,#60b030,#88dd44)' },
          { label: 'Ancestral Gifts',     pct: pct('karmic',     68), gradient: 'linear-gradient(90deg,#8844ff,#bb66ff)' },
        ],
        insight: challenging.length > 0
          ? `Growth edge: ${challenging[0].label} (${challenging[0].name}, ${challenging[0].orb}° orb) — the key transformational axis for ${aName} and ${bName}.`
          : insight,
      },
      hdItems: hdItems.length > 0 ? hdItems : null,
      multiSystemScores,
      multiSystemInsight,
    }
  }
}

export function getSynastryFramework(relA, relB) {
  const romantic = isRomantic(relA) || isRomantic(relB)
  return romantic ? romanticFramework : familyFramework
}

export const romanticFramework = {
  label: '♀ Romantic Synastry',
  badge: 'rel-romantic',
  subtitle: 'Venus/Mars · Soul Contracts · Composite Chart',
  sections: [
    {
      title: 'Venus–Mars Attraction',
      icon: '♀',
      headerLabel: 'ROMANTIC COMPATIBILITY',
      headerColor: 'rgba(240,96,160,.7)',
      scores: [
        { label: 'Physical Magnetism', pct: 94, gradient: 'linear-gradient(90deg,#d43070,#f060a0)' },
        { label: 'Emotional Resonance', pct: 88, gradient: 'linear-gradient(90deg,#8844ff,#bb66ff)' },
        { label: 'Venus Aspects',       pct: 76, gradient: 'linear-gradient(90deg,#c9a84c,#e8c97a)' },
        { label: 'Mars Synergy',        pct: 82, gradient: 'linear-gradient(90deg,#ee6644,#ff9966)' },
        { label: 'Moon Harmony',        pct: 91, gradient: 'linear-gradient(90deg,#4488ff,#88aaff)' },
        { label: 'Sun–Sun Angle',       pct: 65, gradient: 'linear-gradient(90deg,#f0c040,#f8e070)' },
      ],
      insight: (a, b) => `Venus conjunct ${b}'s Mars creates powerful magnetic attraction. Moon trine Moon indicates deep emotional attunement. Soul Contract: 7th house stellium suggests a karmic partnership meant to teach both souls about authentic relating.`,
    },
    {
      title: 'Emotional & Soul Depth',
      icon: '☽',
      headerLabel: 'SOUL CONNECTION MATRIX',
      headerColor: 'rgba(64,204,221,.7)',
      scores: [
        { label: 'Karmic Nodes',    pct: 89, gradient: 'linear-gradient(90deg,#1a8899,#40ccdd)' },
        { label: 'Pluto Depth',     pct: 77, gradient: 'linear-gradient(90deg,#6820b0,#9050e0)' },
        { label: 'Neptune Dreams',  pct: 83, gradient: 'linear-gradient(90deg,#3355cc,#6688ff)' },
        { label: 'Chiron Healing',  pct: 71, gradient: 'linear-gradient(90deg,#60b030,#88dd44)' },
        { label: 'Composite Moon',  pct: 86, gradient: 'linear-gradient(90deg,#ccd5f0,#dde8ff)' },
      ],
      insight: (_a, _b) => `North Node conjunction — a karmic soul contract from past lives. Pluto aspects indicate transformative potential: this union triggers profound shadow integration and spiritual evolution for both.`,
    },
  ],
  hdSection: {
    title: 'Human Design Compatibility',
    icon: '◈',
    items: (a, b, aName, bName) => [
      { icon: '⚡', title: 'Type Chemistry', val: `${a.hdType || 'Projector'} + Generator`, sub: "Optimal pairing — Projector guides Generator's energy" },
      { icon: '🔮', title: 'Channel Bridges', val: '3 Electromagnetic Channels', sub: 'Gates 59–6, 29–46, 14–2 activated together' },
      { icon: '💫', title: 'Profile Harmony', val: '3/5 meets 2/4', sub: 'Martyr-Hermit: deep transformation through relationship' },
      { icon: '✨', title: 'Definition Bridge', val: 'Split → Single', sub: `${bName} bridges ${aName}'s split — feels complete together` },
      { icon: '🌊', title: 'Authority Dance', val: 'Emotional + Sacral', sub: 'Must wait through emotional wave before deciding' },
      { icon: '🎯', title: 'Incarnation Cross', val: 'Cross of Unexpected meets Cross of Service', sub: 'Together you disrupt and heal the collective' },
    ],
  },
  multiSystemSection: {
    title: 'Gene Keys Resonance · ∞ Numerology',
    icon: '⬡',
    headerLabel: 'MULTI-SYSTEM RESONANCE',
    headerColor: 'rgba(201,168,76,.6)',
    scores: [
      { label: 'Gene Key Overlap',         pct: 73, gradient: 'linear-gradient(90deg,#c44d7a,#e8789e)' },
      { label: 'Numerology Compatibility',  pct: 88, gradient: 'linear-gradient(90deg,#c9a84c,#e8c97a)' },
      { label: 'Kabbalah Path Resonance',   pct: 81, gradient: 'linear-gradient(90deg,#6820b0,#aa66ff)' },
      { label: 'Life Path Synergy',         val: '5 + 7 = 12/3', gradient: 'linear-gradient(90deg,#1a8899,#40ccdd)' },
      { label: 'Vedic Nakshatras',          pct: 79, gradient: 'linear-gradient(90deg,#e09040,#f0b060)' },
    ],
    insight: (_a, _b) => `Combined Life Path 5+7=12/3 — The Creative Seekers. Gene Key 28 (Totality) meets Gene Key 22 (Grace): your union holds a frequency of Sacred Partnership designed to inspire others.`,
  },
  wheelMode: 'romantic',
}

export const familyFramework = {
  label: '◈ Family Synastry',
  badge: 'rel-family',
  subtitle: 'Karmic Bonds · Family Karma · Generational Patterns',
  getKarmaSection: (isParent, aName, bName, bSign) => ({
    title: isParent ? 'Ancestral Karma · Inheritance' : 'Sibling Dynamic · Soul Contracts',
    icon: '🧬',
    headerLabel: isParent ? 'KARMIC INHERITANCE' : 'SOUL SIBLING BOND',
    headerColor: 'rgba(64,204,221,.7)',
    scores: [
      { label: 'Saturn Karmic Ties',  pct: 86, gradient: 'linear-gradient(90deg,#aabb88,#ccddaa)' },
      { label: 'Moon Family Bond',    pct: isParent ? 91 : 78, gradient: 'linear-gradient(90deg,#8899cc,#aabbee)' },
      { label: 'Chiron Wounds',       pct: 74, gradient: 'linear-gradient(90deg,#e09040,#f0b060)' },
      { label: 'Node Ancestral Link', pct: 88, gradient: 'linear-gradient(90deg,#60b030,#88dd44)' },
      { label: '4th House Roots',     pct: isParent ? 93 : 68, gradient: 'linear-gradient(90deg,#1a8899,#40ccdd)' },
      { label: 'Pluto Generational',  pct: 81, gradient: 'linear-gradient(90deg,#6820b0,#9050e0)' },
    ],
    insight: isParent
      ? `Saturn opposition indicates a key karmic lesson carried from ${bName} to ${aName}: learning authentic authority without fear. Moon trine Moon suggests genuine emotional inheritance — you carry ${bName}'s emotional intelligence.`
      : `Venus trine Venus — a soul sibling bond. You chose to incarnate together to mirror each other's gifts. Mercury conjunction indicates shared mental patterns from the same family field.`,
  }),
  getGenerationalSection: (isParent, aName, bName, bSign) => ({
    title: 'Generational Patterns · Family Field',
    icon: '🌳',
    headerLabel: 'FAMILY CONSTELLATION',
    headerColor: 'rgba(201,168,76,.6)',
    scores: [
      { label: 'Inherited Strengths', pct: 79, gradient: 'linear-gradient(90deg,#c9a84c,#e8c97a)' },
      { label: 'Shadow Patterns',     pct: 68, gradient: 'linear-gradient(90deg,#cc2244,#ee4466)' },
      { label: 'Healing Potential',    pct: 84, gradient: 'linear-gradient(90deg,#60b030,#88dd44)' },
      { label: 'Ancestral Gifts',     pct: 77, gradient: 'linear-gradient(90deg,#8844ff,#bb66ff)' },
    ],
    insight: isParent
      ? `${bName}'s Pluto in ${bSign || 'Libra'} sits in ${aName}'s 1st house — their generational wound directly shapes ${aName}'s identity. The healing path: conscious acknowledgment breaks the karmic chain.`
      : `Gene Key 28 (${aName}) + Gene Key 40 (${bName}) = Sibling Circuit of Perseverance. You hold complementary gifts that, when combined, complete a family healing arc.`,
  }),
  hdSection: {
    title: 'HD Family Mechanics',
    icon: '◈',
    items: (isParent, aName, bName) => [
      { icon: '🏛️', title: isParent ? 'Parent–Child Conditioning' : 'Sibling Conditioning', val: isParent ? `${bName} defines ${aName}'s undefined centers` : 'Mutual definition of shared undefined', sub: isParent ? 'Deep conditioning imprint during childhood' : "You complete each other's definition" },
      { icon: '🔗', title: 'Shared Channels', val: isParent ? '1 Electromagnetic + 2 Compromise' : '2 Compromise Channels', sub: 'Family channels create lifelong behavioral patterns' },
      { icon: '🌀', title: 'Authority Clash', val: isParent ? 'Emotional vs Splenic' : 'Both Emotional', sub: isParent ? 'Different decision-making speeds create tension' : 'Share emotional wave timing' },
      { icon: '🎭', title: 'Profile Karma', val: isParent ? '3/5 meets 1/3' : 'Parallel Paths', sub: isParent ? 'Martyr archetype recognized and healed through family' : 'Shared trial-and-error learning style' },
    ],
  },
  multiSystemSection: {
    title: 'Kabbalah · ∞ Numerology · ⬡ Gene Keys',
    icon: '✡',
    headerLabel: 'MULTI-SYSTEM FAMILY ANALYSIS',
    headerColor: 'rgba(150,80,220,.7)',
    getScores: (isParent) => [
      { label: 'Sephiroth Resonance',  pct: isParent ? 85 : 72, gradient: 'linear-gradient(90deg,#6820b0,#aa66ff)' },
      { label: 'Life Path Karma',      val: isParent ? '5+9' : '5+5', gradient: 'linear-gradient(90deg,#c9a84c,#e8c97a)' },
      { label: 'Gene Key Inheritance',  pct: 77, gradient: 'linear-gradient(90deg,#c44d7a,#e8789e)' },
      { label: 'Ancestral Numerology',  pct: 83, gradient: 'linear-gradient(90deg,#1a8899,#40ccdd)' },
    ],
    getInsight: (isParent, aName, bName) => isParent
      ? `Sephirah Binah (Understanding) in both charts — karmic theme of wisdom transmission from parent to child. Numerological inheritance: ${bName}'s Soul Urge feeds ${aName}'s Life Path directly.`
      : `Gene Key 41 (${aName}) and ${bName}'s path share the frequency of Anticipation. Kabbalah shows both souls navigating the path between Yesod and Tiphareth — ego to beauty.`,
  },
  wheelMode: 'family',
}
