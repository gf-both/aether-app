import { useMemo } from 'react'
import { useActiveProfile } from '../../hooks/useActiveProfile'
import { HEBREW_ALPHABET, GEMATRIA_METHODS, GEMATRIA_PROFILE, getGematriaProfile } from '../../data/gematriaData'

// Build a dynamically-computed profile from the engine, merged with the rich
// static content (interpretations, kabbalistic paths) that is editorial in nature.
function buildComputedProfile(profileData) {
  const { name, dob } = profileData || {}
  if (!name || !dob) return null
  let day = 1, month = 1, year = 2000
  if (dob) {
    const parts = dob.split('-')
    year = parseInt(parts[0], 10)
    month = parseInt(parts[1], 10)
    day = parseInt(parts[2], 10)
  }
  const fullName = name.toUpperCase()
  const eng = getGematriaProfile({ fullName, day, month, year })

  // Map engine output to the shape expected by the existing template
  const heb = eng.methods.hebrew
  const pyt = eng.methods.pythagorean
  const cha = eng.methods.chaldean
  const ord = eng.methods.ordinal

  return {
    // Identity
    fullName: fullName,
    firstName: fullName.split(' ')[0],
    lastName: fullName.split(' ').slice(1).join(' ') || fullName.split(' ')[0],

    // Hebrew block
    hebrew: {
      fullValue: heb.fullName.total,
      firstNameValue: heb.firstName.total,
      lastNameValue: heb.lastName.total,
      reducedValue: heb.fullName.reduced,
      significantNumbers: [heb.fullName.total, heb.firstName.total, heb.lastName.total, heb.fullName.reduced],
    },

    // Pythagorean block
    pythagorean: {
      fullValue: pyt.fullName.total,
      firstNameValue: pyt.firstName.total,
      lastNameValue: pyt.lastName.total,
      reducedValue: pyt.fullName.reduced,
      nameNumber: pyt.fullName.reduced,
      vowelNumber: eng.soulNumber ? eng.soulNumber.reduced : 0,
      consonantNumber: eng.personalityNumber ? eng.personalityNumber.reduced : 0,
      rawVowelSum: eng.soulNumber ? eng.soulNumber.total : 0,
      rawConsonantSum: eng.personalityNumber ? eng.personalityNumber.total : 0,
    },

    // Chaldean block
    chaldean: {
      fullValue: cha.fullName.total,
      firstNameValue: cha.firstName.total,
      lastNameValue: cha.lastName.total,
      reducedValue: cha.fullName.reduced,
    },

    // English ordinal block
    english: {
      fullValue: ord.fullName.total,
      firstNameValue: ord.firstName.total,
      lastNameValue: ord.lastName.total,
      reducedValue: ord.fullName.reduced,
    },

    // Letter breakdown — build rich version with all system values
    letterBreakdown: eng.nameLetterBreakdown.map(({ letter }) => {
      const hebrewMatch = GEMATRIA_PROFILE.letterBreakdown.find(b => b.letter === letter)
      const pytEntry = pyt.fullName.letterValues.find(lv => lv.letter === letter)
      const chaEntry = cha.fullName.letterValues.find(lv => lv.letter === letter)
      const ordEntry = ord.fullName.letterValues.find(lv => lv.letter === letter)
      return {
        letter,
        hebrewEquiv: hebrewMatch?.hebrewEquiv || '--',
        hebrewChar: hebrewMatch?.hebrewChar || '',
        hebrewValue: hebrewMatch?.hebrewValue || 0,
        pythagoreanValue: pytEntry?.value || 0,
        chaldeanValue: chaEntry?.value || 0,
        ordinalValue: ordEntry?.value || 0,
      }
    }),

    // Engine extras
    engineProfile: eng,

    // Rich editorial content — dynamically generated from computed values
    significantMatches: buildSignificantMatches(eng, pyt, heb, _ord, _cha),
    kabbalisticCorrespondences: buildKabbalisticCorrespondences(pyt, fullName),
  }
}

function buildSignificantMatches(eng, pyt, heb, _ord, _cha) {
  const matches = []
  const hebrewTotal = heb.fullName.total
  const _pytTotal = pyt.fullName.total
  const pytReduced = pyt.fullName.reduced
  const soulUrge = eng.soulNumber?.reduced || eng.vowelSum?.reduced
  const personality = eng.personalityNumber?.reduced

  // Hebrew total significance
  matches.push({
    value: hebrewTotal,
    system: 'Hebrew',
    meaning: `Full name in Hebrew gematria sums to ${hebrewTotal}`,
    detail: hebrewTotal > 999
      ? `Numerical range ${Math.floor(hebrewTotal/10)*10}–${Math.ceil(hebrewTotal/10)*10} carries elevated spiritual significance`
      : `This value resonates with the Hebrew letter ${hebrewTotal <= 22 ? 'archetype' : 'composite'} system`,
  })

  // Master number in Pythagorean
  if (pytReduced === 11 || pytReduced === 22 || pytReduced === 33) {
    matches.push({
      value: pytReduced,
      system: 'Pythagorean',
      meaning: `${pytReduced} is a Master Number — ${pytReduced === 11 ? 'The Illuminator' : pytReduced === 22 ? 'The Master Builder' : 'The Master Teacher'}`,
      detail: pytReduced === 22
        ? '22 Hebrew letters, 22 paths on the Tree of Life, 22 Major Arcana'
        : pytReduced === 11
        ? 'The highest spiritual messenger — bridges the visible and invisible'
        : '33 — the Christ Consciousness frequency, total compassion',
    })
  } else if (pytReduced) {
    matches.push({
      value: pytReduced,
      system: 'Pythagorean',
      meaning: `Name Number ${pytReduced} — ${['','The Initiator','The Peacemaker','The Communicator','The Builder','The Freedom Seeker','The Nurturer','The Seeker','The Powerhouse','The Humanitarian'][pytReduced] || 'The Seeker'}`,
      detail: `Aleph energy: ${pytReduced === 1 ? 'independence, originality, leadership' : pytReduced === 7 ? 'analytical depth, spiritual intensity' : pytReduced === 9 ? 'compassion, global consciousness, completion' : 'unique vibrational signature'}`,
    })
  }

  // Soul Urge
  if (soulUrge) {
    const _hebrewLetterMap = {1:'Aleph',2:'Beth',3:'Gimel',4:'Daleth',5:'He',6:'Vav',7:'Zayin',8:'Cheth',9:'Teth'}
    matches.push({
      value: soulUrge,
      system: 'Soul Urge',
      meaning: `Soul Urge ${soulUrge} — ${['','independence and will','harmony and cooperation','Gimel, the camel, the communicator','foundation and order','freedom and change','love and responsibility','Zayin, the sword, the seeker','power and mastery','universal service'][soulUrge] || 'inner drive'}`,
      detail: `Inner desire for ${soulUrge === 3 ? 'self-expression, creativity, and joy' : soulUrge === 7 ? 'depth, truth, and solitude' : soulUrge === 1 ? 'independence and pioneering' : 'authentic expression of self'}`,
    })
  }

  // Personality
  if (personality) {
    matches.push({
      value: personality,
      system: 'Personality',
      meaning: `Personality ${personality} — ${['','The Pioneer','The Diplomat','The Creator','The Organizer','The Adventurer','The Caregiver','The Analyst','The Executive','The Humanitarian'][personality] || 'The Seeker'}`,
      detail: `The world perceives ${personality === 7 ? 'analytical depth, spiritual intensity' : personality === 8 ? 'authority, ambition, and executive presence' : personality === 1 ? 'confidence, leadership, originality' : 'a distinct energetic signature'}`,
    })
  }

  return matches
}

function buildKabbalisticCorrespondences(pyt, fullName) {
  const reduced = pyt.fullName.reduced
  const sephirothMap = {
    1: { name: 'Kether', desc: 'Crown — pure divine will, the source of all' },
    2: { name: 'Chokmah', desc: 'Wisdom — primordial flash of insight' },
    3: { name: 'Binah', desc: 'Understanding — the great mother, form from chaos' },
    4: { name: 'Chesed', desc: 'Mercy — expansion, grace, and abundance' },
    5: { name: 'Geburah', desc: 'Severity — strength, discipline, sacred boundaries' },
    6: { name: 'Tiphareth', desc: 'Beauty — balance, harmony, the heart of the Tree' },
    7: { name: 'Netzach', desc: 'Victory — feeling, desire, the creative force' },
    8: { name: 'Hod', desc: 'Splendor — intellect, communication, mercurial' },
    9: { name: 'Yesod', desc: 'Foundation — the astral, dreams, the unconscious' },
    11: { name: 'Daath', desc: 'Knowledge — the hidden sephirah, the abyss and bridge' },
    22: { name: 'Malkuth → Kether', desc: 'The full Tree — all 22 paths activated' },
  }
  const seph = sephirothMap[reduced] || sephirothMap[7]

  // First letter path
  const firstLetter = fullName.replace(/[^A-Z]/g, '')[0]
  const letterPaths = { A:1, B:12, G:3, D:4, H:15, V:16, Z:17, Ch:18, T:9, I:20, K:11, L:22, M:13, N:14, S:21, O:16, P:17, Q:19, R:30, Sh:31, Th:32 }
  const pathNum = letterPaths[firstLetter] || Math.floor(Math.random() * 22) + 1

  return [
    {
      system: 'Tree of Life',
      sephirah: seph.name,
      path: `${seph.name} — ${seph.desc}`,
      meaning: `Name number ${reduced} resonates with ${seph.name} on the Kabbalistic Tree of Life`,
    },
    {
      system: 'Hebrew Letter Path',
      sephirah: `Path ${pathNum}`,
      path: `First letter ${firstLetter} initiates the consciousness journey`,
      meaning: `Each letter in the name traces a specific path on the Tree, encoding a unique spiritual curriculum`,
    },
  ]
}

/* ---- shared styles ---- */
const S = {
  panel: {
    width: '100%', height: '100%', overflowY: 'auto', padding: '24px 28px',
    display: 'flex', flexDirection: 'column', gap: 28,
    background: 'var(--card)', color: 'var(--foreground)',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: 'var(--muted-foreground)', paddingBottom: 8,
    borderBottom: '1px solid var(--accent)', marginBottom: 4,
  },
  heading: {
    fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 600, letterSpacing: '.18em',
    color: 'var(--foreground)', marginBottom: 4,
  },
  subHeading: {
    fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, letterSpacing: '.15em',
    textTransform: 'uppercase', color: 'var(--foreground)', marginBottom: 8,
  },
  mono: {
    fontFamily: "'Inconsolata', monospace", fontSize: 12, fontWeight: 500, color: 'var(--foreground)',
  },
  monoSm: {
    fontFamily: "'Inconsolata', monospace", fontSize: 11, color: 'var(--muted-foreground)',
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
    borderRadius: 8, background: 'var(--secondary)',
    border: '1px solid var(--border)', transition: 'background .2s',
  },
  glass: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 13, padding: 18, backdropFilter: 'blur(12px)',
  },
  badge: (bg, border, color) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: 12,
    fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.1em',
    textTransform: 'uppercase', background: bg, border: `1px solid ${border}`, color,
  }),
  interpretation: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--muted-foreground)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'var(--accent)', border: '1px solid var(--border)',
  },
}

const METHOD_COLORS = {
  Hebrew: '#f0c040',
  Pythagorean: '#40ccdd',
  Chaldean: '#d43070',
  'English Ordinal': '#9050e0',
}

const NUM_TITLES = {
  1:'The Initiator', 2:'The Diplomat', 3:'The Communicator', 4:'The Builder',
  5:'The Adventurer', 6:'The Nurturer', 7:'The Seeker', 8:'The Powerhouse',
  9:'The Humanitarian', 11:'Master Intuitive', 22:'Master Builder', 33:'Master Teacher',
}
const NUM_DESCS = {
  1:'Independence, originality, leadership, pioneer energy',
  2:'Cooperation, sensitivity, balance, partnership',
  3:'Self-expression, creativity, joy, artistic talent',
  4:'Discipline, stability, hard work, foundation',
  5:'Freedom, _change, versatility, progressive energy',
  6:'Responsibility, family, love, domestic harmony',
  7:'Introspection, analysis, wisdom, spiritual seeking',
  8:'Material mastery, authority, abundance, achievement',
  9:'Compassion, completion, universal love, service',
  11:'Spiritual insight, intuition, illumination',
  22:'Turning dreams into reality, large-scale vision',
  33:'Healing, compassion, spiritual teacher',
}
function numTitle(n) { return NUM_TITLES[n] || NUM_TITLES[n % 9 || 9] || '—' }
function numDesc(n) { return NUM_DESCS[n] || NUM_DESCS[n % 9 || 9] || '—' }

function NumCircle({ val, color, size = 54, label, sub }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: color + '0c', border: `2px solid ${color}44`,
        fontFamily: "'Cinzel', serif", fontSize: size * 0.42,
        color, fontWeight: 600, position: 'relative',
      }}>
        {val}
        <div style={{
          position: 'absolute', inset: -3, borderRadius: '50%',
          border: `1px solid ${color}18`, pointerEvents: 'none',
        }} />
      </div>
      {label && (
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.12em',
          textTransform: 'uppercase', color: 'var(--muted-foreground)', textAlign: 'center',
        }}>{label}</div>
      )}
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--muted-foreground)', textAlign: 'center', fontStyle: 'italic', maxWidth: 120 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

export default function GematriaDetail() {
  const activeProfile = useActiveProfile()

  // Use engine-computed profile (dynamic, reads from active profile)
  const P = useMemo(() => buildComputedProfile(activeProfile), [activeProfile?.name, activeProfile?.dob])

  if (!P) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', flexDirection:'column', gap:12, opacity:.5 }}>
      <div style={{ fontSize:40 }}>🔠</div>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--gold)' }}>Add name & birth date</div>
      <div style={{ fontSize:11, color:'var(--muted-foreground)' }}>Open Profile to activate Gematria</div>
    </div>
  )

  return (
    <div style={S.panel}>
      {/* 1. HEADER */}
      <div>
        <div style={S.heading}>{'\u05D0'} Gematria</div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          Name numerology -- Hebrew, Pythagorean, Chaldean, and English ordinal analysis
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, marginTop: 16,
        }}>
          <NumCircle val={P.hebrew.fullValue} color="#f0c040" size={68} label="Hebrew Total" />
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 16, letterSpacing: '.12em',
              color: 'var(--foreground)', marginBottom: 4,
            }}>
              {P.fullName}
            </div>
            <div style={S.monoSm}>
              {P.firstName} ({P.hebrew.firstNameValue}) + {P.lastName} ({P.hebrew.lastNameValue}) = {P.hebrew.fullValue}
            </div>
            <div style={{
              ...S.monoSm, color: 'var(--muted-foreground)', marginTop: 2,
            }}>
              Reduced: {P.hebrew.fullValue} {'\u2192'} {P.hebrew.reducedValue}
            </div>
          </div>
        </div>
      </div>

      {/* 2. METHOD COMPARISON TABLE */}
      <div>
        <div style={S.sectionTitle}>Method Comparison</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontFamily: "'Inconsolata', monospace", fontSize: 11,
          }}>
            <thead>
              <tr>
                {['Method', 'Full Name', 'First', 'Last', 'Reduced'].map(h => (
                  <th key={h} style={{
                    padding: '8px 10px', textAlign: 'left',
                    fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.15em',
                    textTransform: 'uppercase', color: 'var(--muted-foreground)',
                    borderBottom: '1px solid var(--accent)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Hebrew', d: P.hebrew, color: METHOD_COLORS.Hebrew },
                { name: 'Pythagorean', d: P.pythagorean, color: METHOD_COLORS.Pythagorean },
                { name: 'Chaldean', d: P.chaldean, color: METHOD_COLORS.Chaldean },
                { name: 'English Ordinal', d: P.english, color: METHOD_COLORS['English Ordinal'] },
              ].map((m, i) => (
                <tr key={i} style={{
                  background: i % 2 === 0 ? 'rgba(255,255,255,.015)' : 'transparent',
                }}>
                  <td style={{
                    padding: '8px 10px', color: m.color,
                    fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.08em',
                  }}>{m.name}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--foreground)' }}>
                    <span style={{ color: m.color, fontWeight: 600 }}>{m.d.fullValue}</span>
                  </td>
                  <td style={{ padding: '8px 10px', color: 'var(--muted-foreground)' }}>{m.d.firstNameValue}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--muted-foreground)' }}>{m.d.lastNameValue}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={S.badge(m.color + '14', m.color + '30', m.color)}>
                      {m.d.reducedValue}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {GEMATRIA_METHODS.map((m, i) => (
            <div key={i} style={{
              flex: '1 1 200px', padding: '8px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,.015)', border: '1px solid var(--secondary)',
            }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.1em',
                color: METHOD_COLORS[m.name] || 'var(--foreground)', marginBottom: 4,
                textTransform: 'uppercase',
              }}>{m.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>
                {m.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. LETTER-BY-LETTER BREAKDOWN */}
      <div>
        <div style={S.sectionTitle}>Letter-by-Letter Breakdown</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontFamily: "'Inconsolata', monospace", fontSize: 11,
          }}>
            <thead>
              <tr>
                {['#', 'Letter', 'Hebrew', '', 'Heb Val', 'Pyth', 'Chald', 'Ord'].map((h, i) => (
                  <th key={i} style={{
                    padding: '6px 8px', textAlign: i < 2 ? 'center' : 'left',
                    fontFamily: "'Cinzel', serif", fontSize: 7, letterSpacing: '.12em',
                    textTransform: 'uppercase', color: 'var(--muted-foreground)',
                    borderBottom: '1px solid var(--accent)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {P.letterBreakdown.map((b, i) => {
                const isFirstOfLast = i === P.firstName.length
                return (
                  <tr key={i} style={{
                    background: i % 2 === 0 ? 'rgba(255,255,255,.015)' : 'transparent',
                    borderTop: isFirstOfLast ? '1px solid var(--accent)' : 'none',
                  }}>
                    <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 9 }}>
                      {i + 1}
                    </td>
                    <td style={{
                      padding: '5px 8px', textAlign: 'center',
                      fontFamily: "'Cinzel', serif", fontSize: 13, color: 'var(--foreground)',
                    }}>
                      {b.letter}
                    </td>
                    <td style={{ padding: '5px 8px', fontSize: 10, color: 'var(--muted-foreground)' }}>
                      {b.hebrewEquiv}
                    </td>
                    <td style={{ padding: '5px 8px', fontSize: 14 }}>
                      {b.hebrewChar}
                    </td>
                    <td style={{ padding: '5px 8px', color: METHOD_COLORS.Hebrew }}>
                      {b.hebrewValue}
                    </td>
                    <td style={{ padding: '5px 8px', color: METHOD_COLORS.Pythagorean }}>
                      {b.pythagoreanValue}
                    </td>
                    <td style={{ padding: '5px 8px', color: METHOD_COLORS.Chaldean }}>
                      {b.chaldeanValue}
                    </td>
                    <td style={{ padding: '5px 8px', color: METHOD_COLORS['English Ordinal'] }}>
                      {b.ordinalValue}
                    </td>
                  </tr>
                )
              })}
              {/* Totals row */}
              <tr style={{
                borderTop: '1px solid rgba(201,168,76,.2)',
                background: 'var(--secondary)',
              }}>
                <td colSpan={4} style={{
                  padding: '6px 8px',
                  fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.1em',
                  color: 'var(--foreground)', textTransform: 'uppercase',
                }}>Total</td>
                <td style={{ padding: '6px 8px', color: METHOD_COLORS.Hebrew, fontWeight: 600 }}>
                  {P.hebrew.fullValue}
                </td>
                <td style={{ padding: '6px 8px', color: METHOD_COLORS.Pythagorean, fontWeight: 600 }}>
                  {P.pythagorean.fullValue}
                </td>
                <td style={{ padding: '6px 8px', color: METHOD_COLORS.Chaldean, fontWeight: 600 }}>
                  {P.chaldean.fullValue}
                </td>
                <td style={{ padding: '6px 8px', color: METHOD_COLORS['English Ordinal'], fontWeight: 600 }}>
                  {P.english.fullValue}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. PYTHAGOREAN ANALYSIS */}
      <div>
        <div style={S.sectionTitle}>Pythagorean Name Analysis</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div style={{
            ...S.glass, textAlign: 'center', padding: '20px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em',
              textTransform: 'uppercase', color: 'var(--muted-foreground)',
            }}>Name Number</div>
            <NumCircle val={P.pythagorean.nameNumber} color="#40ccdd" size={56} />
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.08em',
              color: '#40ccdd',
            }}>{numTitle(P.pythagorean.nameNumber)}</div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>
              {P.pythagorean.fullValue} {'\u2192'} {P.pythagorean.nameNumber} -- {numDesc(P.pythagorean.nameNumber)}
            </div>
          </div>

          <div style={{
            ...S.glass, textAlign: 'center', padding: '20px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            borderColor: 'rgba(212,48,112,.18)', background: 'rgba(212,48,112,.03)',
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em',
              textTransform: 'uppercase', color: 'var(--muted-foreground)',
            }}>Soul Urge (Vowels)</div>
            <NumCircle val={P.pythagorean.vowelNumber} color="#d43070" size={56} />
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.08em',
              color: '#d43070',
            }}>{numTitle(P.pythagorean.vowelNumber)}</div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>
              {P.pythagorean.rawVowelSum} {'\u2192'} {P.pythagorean.vowelNumber} -- {numDesc(P.pythagorean.vowelNumber)}
            </div>
          </div>

          <div style={{
            ...S.glass, textAlign: 'center', padding: '20px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            borderColor: 'rgba(144,80,224,.18)', background: 'rgba(144,80,224,.03)',
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em',
              textTransform: 'uppercase', color: 'var(--muted-foreground)',
            }}>Personality (Consonants)</div>
            <NumCircle val={P.pythagorean.consonantNumber} color="#9050e0" size={56} />
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.08em',
              color: 'var(--violet2)',
            }}>{numTitle(P.pythagorean.consonantNumber)}</div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>
              {P.pythagorean.rawConsonantSum} {'\u2192'} {P.pythagorean.consonantNumber} -- {numDesc(P.pythagorean.consonantNumber)}
            </div>
          </div>
        </div>

        {P.pythagorean.firstNameValue === 22 && (
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 8,
            background: 'var(--secondary)', border: '1px solid var(--accent)',
          }}>
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.1em',
              color: 'var(--foreground)', textTransform: 'uppercase',
            }}>Master Number Alert: </span>
            <span style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
              First name "{P.firstName}" sums to <span style={{ color: 'var(--foreground)' }}>22</span> (Master Builder) in Pythagorean gematria.
              This is not reduced -- it vibrates at the frequency of sacred architecture, the 22 Hebrew letters, and the 22 paths of the Tree of Life.
            </span>
          </div>
        )}
      </div>

      {/* 5. HEBREW LETTER CORRESPONDENCES */}
      <div>
        <div style={S.sectionTitle}>Hebrew Letter Correspondences in Name</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(() => {
            // Deduplicate by Hebrew equivalent
            const seen = new Set()
            return P.letterBreakdown.filter(b => {
              if (seen.has(b.hebrewEquiv)) return false
              seen.add(b.hebrewEquiv)
              return true
            }).map((b, i) => {
              const hebrewEntry = HEBREW_ALPHABET.find(h => h.letter === b.hebrewEquiv)
              if (!hebrewEntry) return null
              const nameLetters = P.letterBreakdown.filter(x => x.hebrewEquiv === b.hebrewEquiv).map(x => x.letter)
              return (
                <div key={i} style={{
                  ...S.row, flexDirection: 'column', alignItems: 'stretch', gap: 6, padding: '12px 16px',
                  borderColor: `var(--accent)`, background: 'rgba(201,168,76,.02)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontSize: 24, minWidth: 36, textAlign: 'center', color: 'var(--foreground)',
                    }}>{hebrewEntry.hebrew}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          fontFamily: "'Cinzel', serif", fontSize: 13, letterSpacing: '.1em',
                          color: 'var(--foreground)',
                        }}>{hebrewEntry.letter}</span>
                        <span style={{
                          fontFamily: "'Inconsolata', monospace", fontSize: 11,
                          color: 'var(--muted-foreground)',
                        }}>= {hebrewEntry.value}</span>
                        <span style={S.badge('var(--accent)', 'rgba(201,168,76,.18)', 'var(--foreground)')}>
                          {nameLetters.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.5, paddingLeft: 48 }}>
                    {hebrewEntry.meaning}
                  </div>
                </div>
              )
            }).filter(Boolean)
          })()}
        </div>
      </div>

      {/* 6. SIGNIFICANT NUMBER MATCHES */}
      <div>
        <div style={S.sectionTitle}>Significant Number Matches</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {P.significantMatches.map((s, i) => {
            const color = s.system === 'Hebrew' ? METHOD_COLORS.Hebrew
              : s.system === 'Pythagorean' ? METHOD_COLORS.Pythagorean
              : s.system === 'Soul Urge' ? METHOD_COLORS.Chaldean
              : METHOD_COLORS['English Ordinal']
            return (
              <div key={i} style={{
                ...S.glass, display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px',
              }}>
                <NumCircle val={s.value} color={color} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={S.badge(color + '14', color + '30', color)}>
                      {s.system}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {(s?.matches ?? []).map((m, j) => (
                      <div key={j} style={{
                        fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4,
                        paddingLeft: 10, borderLeft: `2px solid ${color}22`,
                      }}>
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 7. KABBALISTIC PATH CONNECTIONS */}
      <div>
        <div style={S.sectionTitle}>Kabbalistic Path Connections</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {P.kabbalisticCorrespondences.map((k, i) => (
            <div key={i} style={S.row}>
              <span style={{
                fontFamily: "'Cinzel', serif", fontSize: 14, color: 'var(--foreground)',
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8, background: 'var(--accent)', border: '1px solid var(--accent)',
                flexShrink: 0,
              }}>{k.path.includes('\u05D0') ? '\u05D0' : k.path.includes('\u05D2') ? '\u05D2' : k.path.includes('\u05EA') ? '\u05EA' : k.path.includes('\u05E8') ? '\u05E8' : k.path.includes('\u05E4') ? '\u05E4' : '\u2721'}</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.08em',
                    color: 'var(--foreground)',
                  }}>{k.path}</span>
                </div>
                <span style={{ ...S.monoSm, color: 'var(--muted-foreground)', fontSize: 10 }}>
                  {k.connection}
                </span>
                {k.tarot && (
                  <span style={{
                    ...S.badge('rgba(144,80,224,.1)', 'rgba(144,80,224,.25)', 'var(--violet2)'),
                    alignSelf: 'flex-start', marginTop: 2,
                  }}>{k.tarot}</span>
                )}
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.5, marginTop: 4 }}>
                  {k.meaning}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. FULL 22 HEBREW LETTERS REFERENCE */}
      <div>
        <div style={S.sectionTitle}>The 22 Hebrew Letters</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontFamily: "'Inconsolata', monospace", fontSize: 11,
          }}>
            <thead>
              <tr>
                {['', 'Name', 'Value', 'Meaning'].map((h, i) => (
                  <th key={i} style={{
                    padding: '6px 8px', textAlign: i === 0 ? 'center' : 'left',
                    fontFamily: "'Cinzel', serif", fontSize: 7, letterSpacing: '.12em',
                    textTransform: 'uppercase', color: 'var(--muted-foreground)',
                    borderBottom: '1px solid var(--accent)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HEBREW_ALPHABET.map((h, i) => {
                const inName = P.letterBreakdown.some(b => b.hebrewEquiv === h.letter)
                return (
                  <tr key={i} style={{
                    background: inName ? 'var(--secondary)' : (i % 2 === 0 ? 'rgba(255,255,255,.01)' : 'transparent'),
                    borderLeft: inName ? '2px solid rgba(201,168,76,.3)' : '2px solid transparent',
                  }}>
                    <td style={{
                      padding: '5px 8px', textAlign: 'center', fontSize: 16,
                      color: inName ? 'var(--foreground)' : 'var(--muted-foreground)',
                    }}>{h.hebrew}</td>
                    <td style={{
                      padding: '5px 8px',
                      fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.06em',
                      color: inName ? 'var(--foreground)' : 'var(--muted-foreground)',
                    }}>{h.letter}</td>
                    <td style={{
                      padding: '5px 8px',
                      color: inName ? 'var(--foreground)' : 'var(--muted-foreground)',
                      fontWeight: inName ? 600 : 400,
                    }}>{h.value}</td>
                    <td style={{
                      padding: '5px 8px', fontSize: 11,
                      color: 'var(--muted-foreground)', fontStyle: 'italic',
                    }}>{h.meaning}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. INTERPRETATION / READING */}
      <div>
        <div style={S.sectionTitle}>Gematria Reading</div>
        <div style={S.interpretation}>
          The name <span style={{ color: 'var(--foreground)' }}>{P.fullName}</span> carries a Hebrew gematria
          value of <span style={{ color: '#f0c040' }}>{P.hebrew.fullValue}</span>, which reduces to{' '}
          <span style={{ color: '#f0c040' }}>{P.hebrew.reducedValue}</span> — a number carrying the vibrational
          essence of its bearer, encoded in the ancient alphabet of creation.
          <br /><br />
          {P.pythagorean.firstNameValue === 22 && (
            <>The most striking feature is the first name "<span style={{ color: '#40ccdd' }}>{P.firstName}</span>"
            summing to <span style={{ color: '#40ccdd' }}>22</span> in Pythagorean gematria — a{' '}
            <span style={{ color: 'var(--foreground)' }}>Master Number</span> never reduced. Twenty-two is the number of
            the Master Builder: the 22 Hebrew letters through which creation was spoken, the 22 paths of the
            Tree of Life, the 22 Major Arcana of the Tarot.<br /><br /></>
          )}
          The <span style={{ color: '#d43070' }}>Soul Urge of {P.pythagorean.vowelNumber}</span> (from the vowels) reveals the heart's deepest longing.
          The{' '}
          <span style={{ color: 'var(--violet2)' }}>Personality Number {P.pythagorean.consonantNumber}</span> (from the consonants) shows
          the face presented to the world. Together, name and number tell a story of purpose written before birth —
          encoded in the very letters chosen to identify the soul in this lifetime.
          <br /><br />
          The Hebrew letter composition of <span style={{ color: 'var(--foreground)' }}>{P.fullName}</span> contains
          keys to kabbalistic paths on the Tree of Life. Each letter carries a numerical weight, a planetary
          correspondence, and a path between the sefirot — from the crown of Kether to the kingdom of Malkuth.
        </div>
      </div>
    </div>
  )
}
