/* ---------------------------------------------------------------
   Egyptian Astrology data
   --------------------------------------------------------------- */

export const EGYPTIAN_SIGNS = [
  {
    name: 'Nile',
    dates: 'Jan 1-7, Jun 19-28, Sep 1-7, Nov 18-26',
    element: 'Water',
    planet: 'Venus',
    traits: ['Passionate', 'Peaceful', 'Observant'],
    symbol: 'River',
    color: '#1e6fa0',
  },
  {
    name: 'Amun-Ra',
    dates: 'Jan 8-21, Feb 1-11',
    element: 'Fire',
    planet: 'Sun',
    traits: ['Optimistic', 'Confident', 'Charismatic'],
    symbol: 'Sun Disk',
    color: '#d4a017',
  },
  {
    name: 'Mut',
    dates: 'Jan 22-31, Sep 8-22',
    element: 'Earth',
    planet: 'Moon',
    traits: ['Nurturing', 'Protective', 'Patient'],
    symbol: 'Vulture',
    color: '#8b6914',
  },
  {
    name: 'Geb',
    dates: 'Feb 12-29, Aug 20-31',
    element: 'Earth',
    planet: 'Earth',
    traits: ['Reliable', 'Honest', 'Sensitive'],
    symbol: 'Goose',
    color: '#6b8e23',
  },
  {
    name: 'Osiris',
    dates: 'Mar 1-10, Nov 27-Dec 18',
    element: 'Water',
    planet: 'Pluto',
    traits: ['Independent', 'Dynamic', 'Resilient'],
    symbol: 'Crook & Flail',
    color: '#2e5e4e',
  },
  {
    name: 'Isis',
    dates: 'Mar 11-31, Oct 18-29, Dec 19-31',
    element: 'Water',
    planet: 'Moon',
    traits: ['Intuitive', 'Generous', 'Romantic'],
    symbol: 'Throne',
    color: '#6a5acd',
  },
  {
    name: 'Thoth',
    dates: 'Apr 1-19, Nov 8-17',
    element: 'Air',
    planet: 'Mercury',
    traits: ['Wise', 'Inventive', 'Truthful'],
    symbol: 'Ibis',
    color: '#4682b4',
  },
  {
    name: 'Horus',
    dates: 'Apr 20-May 7, Aug 12-19',
    element: 'Fire',
    planet: 'Sun',
    traits: ['Courageous', 'Willful', 'Optimistic'],
    symbol: 'Falcon',
    color: '#cc5500',
  },
  {
    name: 'Anubis',
    dates: 'May 8-27, Jun 29-Jul 13',
    element: 'Earth',
    planet: 'Mercury',
    traits: ['Compassionate', 'Creative', 'Introspective'],
    symbol: 'Jackal',
    color: '#36454f',
  },
  {
    name: 'Seth',
    dates: 'May 28-Jun 18, Sep 28-Oct 2',
    element: 'Fire',
    planet: 'Mars',
    traits: ['Ambitious', 'Determined', 'Rebellious'],
    symbol: 'Seth Animal',
    color: '#b22222',
  },
  {
    name: 'Bastet',
    dates: 'Jul 14-28, Sep 23-27, Oct 3-17',
    element: 'Air',
    planet: 'Venus',
    traits: ['Charming', 'Intuitive', 'Balanced'],
    symbol: 'Cat',
    color: '#daa520',
  },
  {
    name: 'Sekhmet',
    dates: 'Jul 29-Aug 11, Oct 30-Nov 7',
    element: 'Fire',
    planet: 'Sun',
    traits: ['Powerful', 'Disciplined', 'Just'],
    symbol: 'Lioness',
    color: '#c41e3a',
  },
]

/*
 * EGYPTIAN_PROFILE for Gaston
 * Born January 23, 1981 -- falls under the sign of Mut (Jan 22 - Jan 31).
 * Mut is the mother goddess of Egypt, protector of the pharaoh, sky goddess
 * depicted as a vulture or a woman wearing the double crown.
 */
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
