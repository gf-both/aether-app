/* ---------------------------------------------------------------
   Egyptian Astrology data
   --------------------------------------------------------------- */

export const EGYPTIAN_SIGNS = [
  {
    name: 'Nile',
    dates: 'Jan 1-7, Jun 19-28, Sep 1-7, Nov 18-26',
    element: 'Water',
    planet: 'Venus',
    traits: ['Passionate', 'Peaceful', 'Observant', 'Adaptive', 'Perceptive'],
    symbol: 'River',
    color: '#1e6fa0',
    deityTitle: 'The Sacred River',
    description: 'The Nile is the lifeblood of Egypt, the sacred river from which all civilization emerged. Those born under this sign carry the river\'s dual nature: calm surfaces concealing powerful currents beneath. Like the Nile\'s annual flood that brought fertility to barren land, Nile children possess an extraordinary ability to bring life and abundance to everything they touch. They are natural observers, watching the world with quiet passion before choosing when and where to let their energy flow.',
    strengths: 'Deep emotional intelligence, adaptability, ability to nurture growth in others',
    weaknesses: 'Indecisiveness, tendency to go with the flow rather than lead, emotional overwhelm',
    compatibility: ['Isis', 'Thoth'],
  },
  {
    name: 'Amun-Ra',
    dates: 'Jan 8-21, Feb 1-11',
    element: 'Fire',
    planet: 'Sun',
    traits: ['Optimistic', 'Confident', 'Charismatic', 'Generous', 'Authoritative'],
    symbol: 'Sun Disk',
    color: '#d4a017',
    deityTitle: 'The King of Gods',
    description: 'Amun-Ra is the supreme deity of the Egyptian pantheon, the hidden one who became the visible sun. Those born under his sign carry the solar fire within — a natural radiance that draws others into their orbit. Like the sun that rises each morning without fail, Amun-Ra\'s children possess unwavering optimism and a regal confidence that inspires trust. They are born leaders who illuminate the path for others, their charisma a reflection of the divine creative force that shaped the cosmos.',
    strengths: 'Natural leadership, infectious optimism, ability to inspire and unite others',
    weaknesses: 'Pride, need for recognition, difficulty accepting subordinate roles',
    compatibility: ['Mut', 'Horus'],
  },
  {
    name: 'Mut',
    dates: 'Jan 22-31, Sep 8-22',
    element: 'Earth',
    planet: 'Moon',
    traits: ['Nurturing', 'Protective', 'Patient', 'Devoted', 'Ambitious'],
    symbol: 'Vulture',
    color: '#8b6914',
    deityTitle: 'The Mother Goddess',
    description: 'Mut is the ancient Egyptian mother goddess, the divine queen of the heavens and protector of the pharaoh. Her name literally means "mother," and she was revered as the primal creator from whom all things emerged. Depicted as a vulture or a woman wearing the double crown of Upper and Lower Egypt, Mut embodies the fierce, nurturing power of the feminine divine. Those born under her sign carry an instinctive drive to shield and sustain the people they love. Like the vulture that soars above the Nile surveying the land below, Mut\'s children possess extraordinary patience and a panoramic awareness of the world around them.',
    strengths: 'Natural caretaker, strong willpower, practical wisdom',
    weaknesses: 'Possessive tendencies, stubbornness, resistance to change',
    compatibility: ['Amun-Ra', 'Thoth'],
  },
  {
    name: 'Geb',
    dates: 'Feb 12-29, Aug 20-31',
    element: 'Earth',
    planet: 'Earth',
    traits: ['Reliable', 'Honest', 'Sensitive', 'Grounded', 'Loyal'],
    symbol: 'Goose',
    color: '#6b8e23',
    deityTitle: 'The Earth Father',
    description: 'Geb is the god of the earth itself, whose body forms the ground upon which all life walks. His laughter was said to cause earthquakes, yet his nature is fundamentally nurturing — he is the soil from which all things grow. Those born under Geb\'s sign are the most grounded souls in the Egyptian zodiac, possessing an innate honesty and reliability that makes them the bedrock of their communities. Like the earth that supports without asking for recognition, Geb\'s children find their deepest fulfillment in being the steady foundation others can depend upon.',
    strengths: 'Unwavering loyalty, emotional depth, ability to create stability',
    weaknesses: 'Oversensitivity, difficulty letting go, tendency toward melancholy',
    compatibility: ['Isis', 'Bastet'],
  },
  {
    name: 'Osiris',
    dates: 'Mar 1-10, Nov 27-Dec 18',
    element: 'Water',
    planet: 'Pluto',
    traits: ['Independent', 'Dynamic', 'Resilient', 'Transformative', 'Bold'],
    symbol: 'Crook & Flail',
    color: '#2e5e4e',
    deityTitle: 'The Lord of Resurrection',
    description: 'Osiris is the god of death and rebirth, the ruler of the underworld who conquered mortality itself. His myth — betrayed, dismembered, and resurrected — is the foundational story of transformation in Egyptian cosmology. Those born under Osiris carry this phoenix energy: an extraordinary capacity to reinvent themselves after destruction. They are dynamic and independent, driven by forces that others rarely understand. Like the god who ruled the afterlife, Osiris\'s children see beyond surface realities into the deeper structures of existence.',
    strengths: 'Resilience under pressure, visionary thinking, natural authority in crisis',
    weaknesses: 'Restlessness, difficulty trusting others, tendency to isolate',
    compatibility: ['Isis', 'Thoth'],
  },
  {
    name: 'Isis',
    dates: 'Mar 11-31, Oct 18-29, Dec 19-31',
    element: 'Water',
    planet: 'Moon',
    traits: ['Intuitive', 'Generous', 'Romantic', 'Wise', 'Devoted'],
    symbol: 'Throne',
    color: '#6a5acd',
    deityTitle: 'The Divine Enchantress',
    description: 'Isis is the most powerful goddess in the Egyptian pantheon — the great enchantress who reassembled Osiris, outwitted Ra, and whose magic was said to be stronger than a thousand soldiers. She embodies intuitive wisdom, fierce devotion, and the transformative power of love. Those born under Isis possess a rare combination of emotional depth and practical intelligence. They are the ones who see through deception, who know what others need before they ask, and who will move heaven and earth for those they love.',
    strengths: 'Profound intuition, healing presence, strategic thinking masked as gentleness',
    weaknesses: 'Emotional manipulation when hurt, difficulty setting boundaries, martyr tendencies',
    compatibility: ['Osiris', 'Nile'],
  },
  {
    name: 'Thoth',
    dates: 'Apr 1-19, Nov 8-17',
    element: 'Air',
    planet: 'Mercury',
    traits: ['Wise', 'Inventive', 'Truthful', 'Analytical', 'Eloquent'],
    symbol: 'Ibis',
    color: '#4682b4',
    deityTitle: 'The Scribe of Truth',
    description: 'Thoth is the ibis-headed god of wisdom, writing, and the moon — the divine scribe who recorded the judgment of souls and invented hieroglyphs themselves. He mediated between opposing forces and maintained the balance of the universe through knowledge. Those born under Thoth are the intellectuals of the Egyptian zodiac: endlessly curious, deeply analytical, and committed to truth above all else. Like the ibis that wades carefully through water, Thoth\'s children navigate complexity with patience and precision, always seeking the deeper pattern.',
    strengths: 'Exceptional intellect, gift for communication, natural problem-solver',
    weaknesses: 'Overthinking, emotional detachment, tendency to prioritize logic over feeling',
    compatibility: ['Mut', 'Bastet'],
  },
  {
    name: 'Horus',
    dates: 'Apr 20-May 7, Aug 12-19',
    element: 'Fire',
    planet: 'Sun',
    traits: ['Courageous', 'Willful', 'Optimistic', 'Protective', 'Noble'],
    symbol: 'Falcon',
    color: '#cc5500',
    deityTitle: 'The Sky Warrior',
    description: 'Horus is the falcon-headed god of the sky, the divine warrior who avenged his father Osiris and reclaimed the throne of Egypt. His eyes are the sun and moon, and his wings span the entire heavens. Those born under Horus possess a warrior\'s courage and a king\'s nobility — they are natural protectors who fight not for glory but for justice. Like the falcon that strikes with precision from great heights, Horus\'s children combine visionary perspective with decisive action, seeing opportunities others miss and acting on them with confidence.',
    strengths: 'Fearless leadership, protective instinct, ability to inspire loyalty',
    weaknesses: 'Impulsiveness, difficulty compromising, tendency toward confrontation',
    compatibility: ['Amun-Ra', 'Sekhmet'],
  },
  {
    name: 'Anubis',
    dates: 'May 8-27, Jun 29-Jul 13',
    element: 'Earth',
    planet: 'Mercury',
    traits: ['Compassionate', 'Creative', 'Introspective', 'Perceptive', 'Loyal'],
    symbol: 'Jackal',
    color: '#36454f',
    deityTitle: 'The Guardian of Souls',
    description: 'Anubis is the jackal-headed god who guides souls through the underworld and weighs hearts against the feather of truth. He stands at the threshold between worlds — the guardian who sees what is hidden and protects what is sacred. Those born under Anubis possess an uncanny ability to perceive what lies beneath the surface of people and situations. They are deeply creative, channeling their introspective nature into art, healing, or spiritual pursuits. Like the jackal that navigates the desert\'s edge between civilization and wilderness, Anubis\'s children are comfortable in liminal spaces where others fear to tread.',
    strengths: 'Deep perception, creative vision, ability to comfort and guide others through darkness',
    weaknesses: 'Moodiness, tendency to dwell in shadow, difficulty with lighthearted situations',
    compatibility: ['Bastet', 'Isis'],
  },
  {
    name: 'Seth',
    dates: 'May 28-Jun 18, Sep 28-Oct 2',
    element: 'Fire',
    planet: 'Mars',
    traits: ['Ambitious', 'Determined', 'Rebellious', 'Magnetic', 'Intense'],
    symbol: 'Seth Animal',
    color: '#b22222',
    deityTitle: 'The Lord of Storms',
    description: 'Seth is the god of storms, chaos, and the desert — the necessary disruptor who keeps the universe from stagnating. Though often cast as a villain, Seth was also the protector of Ra\'s solar barque, defending the sun against the serpent of darkness each night. Those born under Seth carry a storm within: intense ambition, magnetic charisma, and a rebellious spirit that refuses to accept the world as it is. Like the desert storm that strips away everything weak and leaves only what is strong, Seth\'s children are agents of necessary change, breaking structures that no longer serve.',
    strengths: 'Unstoppable determination, magnetic presence, ability to thrive in chaos',
    weaknesses: 'Destructive tendencies, difficulty with authority, alienating intensity',
    compatibility: ['Geb', 'Nile'],
  },
  {
    name: 'Bastet',
    dates: 'Jul 14-28, Sep 23-27, Oct 3-17',
    element: 'Air',
    planet: 'Venus',
    traits: ['Charming', 'Intuitive', 'Balanced', 'Graceful', 'Joyful'],
    symbol: 'Cat',
    color: '#daa520',
    deityTitle: 'The Goddess of Joy',
    description: 'Bastet is the cat-headed goddess of joy, music, dance, and protection of the home. Originally a fierce lioness warrior, she evolved into the graceful, playful protector of domestic happiness. Those born under Bastet embody this dual nature — a velvet exterior concealing razor-sharp instincts. They are the most socially gifted of the Egyptian signs, possessing a natural charm and balance that makes them welcome in any setting. Like the cat that moves between the worlds of wild and domestic, Bastet\'s children navigate social complexity with instinctive grace.',
    strengths: 'Social intelligence, emotional balance, ability to create harmony in any environment',
    weaknesses: 'Superficiality under stress, avoidance of deep conflict, possessiveness in love',
    compatibility: ['Geb', 'Thoth'],
  },
  {
    name: 'Sekhmet',
    dates: 'Jul 29-Aug 11, Oct 30-Nov 7',
    element: 'Fire',
    planet: 'Sun',
    traits: ['Powerful', 'Disciplined', 'Just', 'Fierce', 'Commanding'],
    symbol: 'Lioness',
    color: '#c41e3a',
    deityTitle: 'The Lioness of War',
    description: 'Sekhmet is the lioness-headed goddess of war, healing, and divine retribution — the most feared deity in the Egyptian pantheon. Her breath created the desert, and her rage could destroy humanity. Yet she was also the goddess of healing, because only one who understands destruction can truly understand restoration. Those born under Sekhmet carry this paradox within: immense power held in check by equally immense discipline. They are natural leaders who command respect not through charm but through sheer force of will and an unshakable sense of justice.',
    strengths: 'Iron discipline, commanding presence, ability to heal and destroy with equal skill',
    weaknesses: 'Explosive temper, difficulty showing vulnerability, tendency to dominate',
    compatibility: ['Horus', 'Seth'],
  },
]

/*
 * EGYPTIAN_PROFILE for Gaston
 * Born January 23, 1981 -- falls under the sign of Mut (Jan 22 - Jan 31).
 * Mut is the mother goddess of Egypt, protector of the pharaoh, sky goddess
 * depicted as a vulture or a woman wearing the double crown.
 */
// Legacy profile kept for backward compatibility — new code reads from EGYPTIAN_SIGNS directly
export const EGYPTIAN_PROFILE = {
  sign: 'Mut',
  dates: 'Jan 22 - Jan 31, Sep 8 - Sep 22',
  element: 'Earth',
  planet: 'Moon',
  traits: ['Nurturing', 'Protective', 'Patient', 'Devoted', 'Ambitious'],
  strengths: 'Natural caretaker, strong willpower, practical wisdom',
  weaknesses: 'Possessive tendencies, stubbornness, resistance to change',
  compatibility: ['Amun-Ra', 'Thoth'],
  color: 'Brown',
  symbol: 'Vulture',
  deityTitle: 'The Mother Goddess',
  description:
    'Mut is the ancient Egyptian mother goddess, the divine queen of the heavens and protector of the pharaoh. ' +
    'Her name literally means "mother," and she was revered as the primal creator from whom all things emerged. ' +
    'Depicted as a vulture or a woman wearing the double crown of Upper and Lower Egypt, Mut embodies the ' +
    'fierce, nurturing power of the feminine divine. Those born under her sign carry an instinctive drive to ' +
    'shield and sustain the people they love. Like the vulture that soars above the Nile surveying the land below, ' +
    'Mut\'s children possess extraordinary patience and a panoramic awareness of the world around them. They are ' +
    'devoted builders -- grounding their ambitions in practical wisdom while channeling the quiet, reflective ' +
    'energy of the Moon. When obstacles arise, the children of Mut endure with a silent strength that outlasts ' +
    'every storm. Their greatest gift is the ability to transform protective love into lasting legacy.',
}


// Re-export the computed sign lookup from the engine
export { getEgyptianSign } from '../engines/egyptianEngine.js'
