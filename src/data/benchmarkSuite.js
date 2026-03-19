export const BENCHMARK_SUITE = [
  // ── EMPATHY ──
  {
    id: 'emp-1',
    category: 'empathy',
    prompt: 'I keep attracting emotionally unavailable partners. What pattern am I stuck in?',
    idealTraits: ['empathy', 'depth', 'nuance', 'pattern-recognition'],
    antiTraits: ['generic', 'dismissive', 'surface-level'],
  },
  {
    id: 'emp-2',
    category: 'empathy',
    prompt: 'My best friend just got the promotion I wanted. I\'m happy for her but devastated inside. How do I handle these conflicting emotions?',
    idealTraits: ['emotional-intelligence', 'nuance', 'validation', 'honesty'],
    antiTraits: ['dismissive', 'platitude', 'toxic-positivity'],
  },
  {
    id: 'emp-3',
    category: 'empathy',
    prompt: 'I feel like my life looks successful from the outside but feels empty inside. Why?',
    idealTraits: ['depth', 'existential-awareness', 'empathy', 'meaning-making'],
    antiTraits: ['surface', 'generic', 'prescriptive'],
  },
  {
    id: 'emp-4',
    category: 'empathy',
    prompt: 'My parent is aging and becoming someone I don\'t recognize. How do I grieve someone who\'s still alive?',
    idealTraits: ['compassion', 'depth', 'grief-literacy', 'presence'],
    antiTraits: ['clinical', 'solution-rushing', 'minimizing'],
  },
  {
    id: 'emp-5',
    category: 'empathy',
    prompt: 'I just found out my partner has been keeping a major secret from me for years. I don\'t know if I\'m more hurt by the secret or the lying. Help me untangle this.',
    idealTraits: ['empathy', 'nuance', 'trust-dynamics', 'emotional-clarity'],
    antiTraits: ['judgmental', 'binary-thinking', 'advice-rushing'],
  },

  // ── STRATEGY ──
  {
    id: 'str-1',
    category: 'strategy',
    prompt: 'I want to pivot my career from corporate law to coaching but I have a mortgage, two kids, and my spouse thinks I\'m having a midlife crisis. Help me see my options clearly.',
    idealTraits: ['strategic-thinking', 'pragmatism', 'empathy', 'phased-planning'],
    antiTraits: ['reckless', 'dismissive-of-constraints', 'generic'],
  },
  {
    id: 'str-2',
    category: 'strategy',
    prompt: 'My startup is running out of money in 4 months. We have traction but not enough revenue. Should I raise, pivot, or wind down?',
    idealTraits: ['strategic-clarity', 'framework-thinking', 'honesty', 'actionability'],
    antiTraits: ['vague', 'overly-optimistic', 'generic'],
  },
  {
    id: 'str-3',
    category: 'strategy',
    prompt: 'I have three job offers — one pays the most, one has the best culture, one is at a company I admire but in a role below my level. How do I decide?',
    idealTraits: ['multi-dimensional-analysis', 'values-alignment', 'specificity', 'decision-framework'],
    antiTraits: ['simplistic', 'one-dimensional', 'prescriptive'],
  },
  {
    id: 'str-4',
    category: 'strategy',
    prompt: 'I\'m a solo founder trying to do everything — product, marketing, sales, support. I\'m burning out but can\'t afford to hire. What\'s my strategy?',
    idealTraits: ['prioritization', 'resourcefulness', 'empathy', 'phased-approach'],
    antiTraits: ['generic', 'just-hire-someone', 'unrealistic'],
  },
  {
    id: 'str-5',
    category: 'strategy',
    prompt: 'My business partner and I have opposite working styles — I\'m a visionary who moves fast, they\'re methodical and slow. We\'re starting to resent each other. How do we make it work?',
    idealTraits: ['relational-intelligence', 'strategic-reframing', 'specificity', 'actionability'],
    antiTraits: ['taking-sides', 'generic', 'surface'],
  },

  // ── CREATIVITY ──
  {
    id: 'cre-1',
    category: 'creativity',
    prompt: 'I used to be creative but I feel completely blocked. Nothing inspires me anymore. It\'s been months. What\'s happening and how do I come back?',
    idealTraits: ['creative-understanding', 'depth', 'non-prescriptive', 'process-awareness'],
    antiTraits: ['just-start-creating', 'productivity-hacks', 'generic-tips'],
  },
  {
    id: 'cre-2',
    category: 'creativity',
    prompt: 'Write me a metaphor for the experience of outgrowing a friendship that still has love in it.',
    idealTraits: ['originality', 'emotional-resonance', 'poetic-craft', 'specificity'],
    antiTraits: ['cliche', 'generic', 'over-explained'],
  },
  {
    id: 'cre-3',
    category: 'creativity',
    prompt: 'I need to explain quantum entanglement to a room of artists. Give me an approach that would actually resonate with creative minds.',
    idealTraits: ['cross-domain-thinking', 'metaphorical-intelligence', 'audience-awareness', 'originality'],
    antiTraits: ['textbook', 'condescending', 'generic'],
  },
  {
    id: 'cre-4',
    category: 'creativity',
    prompt: 'Design a ritual or practice for someone going through a major life transition — leaving a long career, ending a marriage, or moving countries.',
    idealTraits: ['symbolic-thinking', 'emotional-depth', 'originality', 'embodiment'],
    antiTraits: ['generic-self-care', 'surface', 'prescriptive'],
  },
  {
    id: 'cre-5',
    category: 'creativity',
    prompt: 'I want to create something meaningful but I\'m paralyzed by the fear that everything has already been done. How do I find my unique creative voice?',
    idealTraits: ['creative-philosophy', 'encouragement', 'depth', 'originality'],
    antiTraits: ['platitude', 'just-be-yourself', 'generic'],
  },

  // ── SYNTHESIS ──
  {
    id: 'syn-1',
    category: 'synthesis',
    prompt: 'Connect these three things into a coherent insight: the rise of loneliness in cities, the popularity of astrology among millennials, and the decline of organized religion.',
    idealTraits: ['systems-thinking', 'originality', 'depth', 'coherence'],
    antiTraits: ['surface-connections', 'generic', 'listing-without-integrating'],
  },
  {
    id: 'syn-2',
    category: 'synthesis',
    prompt: 'I\'m an introvert who needs to lead a team of extroverts, I\'m analytical but my role requires emotional intelligence, and I\'m detail-oriented but drowning in big-picture decisions. Synthesize a leadership approach from these tensions.',
    idealTraits: ['integration', 'nuance', 'actionability', 'paradox-holding'],
    antiTraits: ['pick-one-side', 'generic-leadership', 'surface'],
  },
  {
    id: 'syn-3',
    category: 'synthesis',
    prompt: 'What do stoicism, cognitive behavioral therapy, and meditation all have in common at their deepest level? Don\'t just list surface similarities.',
    idealTraits: ['philosophical-depth', 'originality', 'integration', 'insight'],
    antiTraits: ['surface-comparison', 'listing', 'wikipedia-level'],
  },
  {
    id: 'syn-4',
    category: 'synthesis',
    prompt: 'My numerology says I\'m a Life Path 7 (seeker), my Human Design says I\'m a Projector (guide), and my enneagram is 4 (individualist). What\'s the unified story these systems are telling about me?',
    idealTraits: ['framework-integration', 'coherence', 'depth', 'personalization'],
    antiTraits: ['separate-descriptions', 'generic', 'surface'],
  },
  {
    id: 'syn-5',
    category: 'synthesis',
    prompt: 'Synthesize the experience of being a first-generation immigrant, a tech worker, and someone going through a spiritual awakening. What unique tensions and gifts emerge from this intersection?',
    idealTraits: ['intersectional-thinking', 'empathy', 'originality', 'cultural-awareness'],
    antiTraits: ['stereotyping', 'surface', 'generic'],
  },

  // ── DECISION MAKING ──
  {
    id: 'dec-1',
    category: 'decision_making',
    prompt: 'I have a big decision to make and my gut and logic are pointing in opposite directions. My gut says leave, my spreadsheet says stay. What do I do?',
    idealTraits: ['decision-framework', 'nuance', 'somatic-awareness', 'depth'],
    antiTraits: ['just-follow-your-gut', 'just-be-logical', 'binary'],
  },
  {
    id: 'dec-2',
    category: 'decision_making',
    prompt: 'I\'ve been offered my dream job but it would mean uprooting my family to a new country. My kids are 8 and 12. Is this selfish?',
    idealTraits: ['ethical-nuance', 'family-systems-thinking', 'empathy', 'non-judgmental'],
    antiTraits: ['judgmental', 'simplistic', 'one-right-answer'],
  },
  {
    id: 'dec-3',
    category: 'decision_making',
    prompt: 'I\'m stuck between two paths: one safe and predictable, one risky and exciting. Every time I almost choose the risky one, fear pulls me back. But the safe one feels like dying slowly. Help.',
    idealTraits: ['existential-depth', 'fear-literacy', 'nuance', 'empowerment'],
    antiTraits: ['just-take-the-risk', 'play-it-safe', 'motivational-poster'],
  },
  {
    id: 'dec-4',
    category: 'decision_making',
    prompt: 'Should I forgive someone who hurt me deeply but has genuinely changed? They\'re asking for another chance. I can see the change but the wound is still fresh.',
    idealTraits: ['emotional-intelligence', 'boundary-awareness', 'nuance', 'trauma-literacy'],
    antiTraits: ['just-forgive', 'never-trust-again', 'simplistic'],
  },
  {
    id: 'dec-5',
    category: 'decision_making',
    prompt: 'I\'m 45 and realizing I\'ve spent my whole career building someone else\'s dream. I have savings for about a year. Is it too late to start something of my own?',
    idealTraits: ['age-positive', 'strategic', 'empathetic', 'realistic-optimism'],
    antiTraits: ['it\'s-never-too-late-cliche', 'dismissive', 'generic'],
  },

  // ── SELF AWARENESS ──
  {
    id: 'awa-1',
    category: 'self_awareness',
    prompt: 'I notice I always abandon projects at about 80% completion. I\'ve done this my whole life — jobs, relationships, creative works. What\'s driving this pattern?',
    idealTraits: ['pattern-analysis', 'psychological-depth', 'empathy', 'insight'],
    antiTraits: ['just-finish-things', 'productivity-tips', 'surface'],
  },
  {
    id: 'awa-2',
    category: 'self_awareness',
    prompt: 'People tell me I\'m intimidating but I feel deeply insecure inside. How can both things be true at the same time?',
    idealTraits: ['paradox-understanding', 'psychological-insight', 'empathy', 'depth'],
    antiTraits: ['pick-one', 'generic', 'surface-explanation'],
  },
  {
    id: 'awa-3',
    category: 'self_awareness',
    prompt: 'I\'ve realized I use humor to deflect every serious conversation. My friends think I\'m hilarious. My therapist says I\'m avoiding. Who\'s right?',
    idealTraits: ['defense-mechanism-awareness', 'nuance', 'compassion', 'both-and-thinking'],
    antiTraits: ['one-is-right', 'simplistic', 'judgmental'],
  },
  {
    id: 'awa-4',
    category: 'self_awareness',
    prompt: 'I keep saying yes to everything and then resenting people for asking. I know it\'s my fault but I can\'t stop. What\'s the deeper dynamic?',
    idealTraits: ['boundary-psychology', 'compassion', 'depth', 'root-cause-analysis'],
    antiTraits: ['just-say-no', 'generic-boundaries-advice', 'blaming'],
  },
  {
    id: 'awa-5',
    category: 'self_awareness',
    prompt: 'I\'m most productive when I\'m slightly anxious but I know anxiety is supposed to be bad. Am I using my anxiety or is it using me?',
    idealTraits: ['nuance', 'psychological-sophistication', 'non-pathologizing', 'insight'],
    antiTraits: ['anxiety-is-bad', 'generic-mental-health', 'surface'],
  },

  // ── COACHING ──
  {
    id: 'coa-1',
    category: 'coaching',
    prompt: 'I want to start a meditation practice but every time I sit down my mind races and I feel like I\'m failing. I\'ve tried 5 different apps. What am I missing?',
    idealTraits: ['reframing', 'compassion', 'practical-wisdom', 'specificity'],
    antiTraits: ['try-harder', 'another-app', 'generic-meditation-advice'],
  },
  {
    id: 'coa-2',
    category: 'coaching',
    prompt: 'I know exactly what I need to do to change my life. I\'ve known for years. I just don\'t do it. How do I bridge the gap between knowing and doing?',
    idealTraits: ['behavioral-insight', 'compassion', 'depth', 'actionability'],
    antiTraits: ['just-do-it', 'motivational', 'willpower-framing'],
  },
  {
    id: 'coa-3',
    category: 'coaching',
    prompt: 'I\'m a new manager and my team doesn\'t respect me because I\'m younger than all of them. Traditional authority doesn\'t work. What does?',
    idealTraits: ['leadership-insight', 'specificity', 'empathy', 'practical-wisdom'],
    antiTraits: ['assert-dominance', 'generic-leadership', 'age-dismissive'],
  },
  {
    id: 'coa-4',
    category: 'coaching',
    prompt: 'I want to have a difficult conversation with my sibling about our childhood. I want honesty without destroying the relationship. Coach me through this.',
    idealTraits: ['relational-wisdom', 'specificity', 'emotional-preparation', 'nuance'],
    antiTraits: ['just-be-honest', 'avoid-conflict', 'generic-communication-tips'],
  },
  {
    id: 'coa-5',
    category: 'coaching',
    prompt: 'I\'m recovering from burnout but everyone around me is grinding. I feel guilty for resting. How do I stay committed to my recovery when the culture rewards overwork?',
    idealTraits: ['counter-cultural-wisdom', 'compassion', 'boundary-support', 'depth'],
    antiTraits: ['hustle-culture', 'generic-self-care', 'minimizing'],
  },

  // ── PATTERN RECOGNITION ──
  {
    id: 'pat-1',
    category: 'pattern_recognition',
    prompt: 'In my last 3 relationships, I was the "stable one" holding everything together. In my family growing up, I was the peacekeeper. In my job, I\'m the one everyone leans on. What pattern am I living out and what does it cost me?',
    idealTraits: ['pattern-analysis', 'systemic-thinking', 'depth', 'cost-awareness'],
    antiTraits: ['that\'s-just-who-you-are', 'generic', 'surface'],
  },
  {
    id: 'pat-2',
    category: 'pattern_recognition',
    prompt: 'Every time I\'m about to succeed at something big, I self-sabotage. It\'s so predictable my friends joke about it. But knowing doesn\'t stop it. What am I not seeing?',
    idealTraits: ['unconscious-dynamics', 'depth', 'compassion', 'insight'],
    antiTraits: ['just-stop-sabotaging', 'willpower', 'surface'],
  },
  {
    id: 'pat-3',
    category: 'pattern_recognition',
    prompt: 'I\'ve noticed that the people who trigger me the most are usually confident, outspoken women. I\'m a feminist and this bothers me. What\'s this shadow about?',
    idealTraits: ['shadow-work', 'psychological-depth', 'non-judgmental', 'nuance'],
    antiTraits: ['you\'re-not-really-feminist', 'dismissive', 'surface'],
  },
  {
    id: 'pat-4',
    category: 'pattern_recognition',
    prompt: 'Map the connection between these events in my life: getting fired at 25, my divorce at 32, starting my business at 35, and my health crisis at 40. I feel like they\'re connected but I can\'t see the thread.',
    idealTraits: ['narrative-intelligence', 'pattern-weaving', 'depth', 'meaning-making'],
    antiTraits: ['coincidence', 'listing-events', 'surface-connections'],
  },
  {
    id: 'pat-5',
    category: 'pattern_recognition',
    prompt: 'I\'m drawn to starting things but terrible at maintaining them. New relationships, new projects, new hobbies — the beginning is electric and then I lose interest. Is this a flaw or is there a way to work WITH this pattern instead of against it?',
    idealTraits: ['reframing', 'pattern-awareness', 'both-and-thinking', 'practical-wisdom'],
    antiTraits: ['just-commit', 'discipline-lecture', 'pathologizing'],
  },
]

export const BENCHMARK_CATEGORIES = [
  { id: 'empathy', label: 'Empathy', icon: '\u{1F497}' },
  { id: 'strategy', label: 'Strategy', icon: '\u265F' },
  { id: 'creativity', label: 'Creativity', icon: '\u2728' },
  { id: 'synthesis', label: 'Synthesis', icon: '\u{1F52E}' },
  { id: 'decision_making', label: 'Decision Making', icon: '\u2696' },
  { id: 'self_awareness', label: 'Self Awareness', icon: '\u{1FA9E}' },
  { id: 'coaching', label: 'Coaching', icon: '\u{1F9ED}' },
  { id: 'pattern_recognition', label: 'Pattern Recognition', icon: '\u{1F578}' },
]

export const SCORING_DIMENSIONS = [
  { id: 'depth', label: 'Depth', description: 'Goes beyond surface, touches real underlying dynamics' },
  { id: 'empathy', label: 'Empathy', description: 'Reads the emotional reality of the situation' },
  { id: 'specificity', label: 'Specificity', description: 'Personalized, not generic advice' },
  { id: 'actionability', label: 'Actionability', description: 'Gives concrete next steps' },
  { id: 'insight', label: 'Insight', description: 'Surfaces something non-obvious' },
]
