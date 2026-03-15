import { HEBREW_ALPHABET, GEMATRIA_METHODS, GEMATRIA_PROFILE, getGematriaProfile } from '../../data/gematriaData'
import { DEFAULT_PRIMARY_PROFILE } from '../../data/primaryProfile'

// Build a dynamically-computed profile from the engine, merged with the rich
// static content (interpretations, kabbalistic paths) that is editorial in nature.
function buildComputedProfile() {
  const { name, dob } = DEFAULT_PRIMARY_PROFILE
  let day = 23, month = 1, year = 1981
  if (dob) {
    const parts = dob.split('-')
    year = parseInt(parts[0], 10)
    month = parseInt(parts[1], 10)
    day = parseInt(parts[2], 10)
  }
  const fullName = name || 'GASTON FRYDLEWSKI'
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

    // Rich editorial content — kept from static profile
    significantMatches: GEMATRIA_PROFILE.significantMatches,
    kabbalisticCorrespondences: GEMATRIA_PROFILE.kabbalisticCorrespondences,
  }
}

/* ---- shared styles ---- */
const S = {
  panel: {
    width: '100%', height: '100%', overflowY: 'auto', padding: '24px 28px',
    display: 'flex', flexDirection: 'column', gap: 28,
    background: 'var(--panel-bg)', color: 'var(--text)',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: 'var(--gold3)', paddingBottom: 8,
    borderBottom: '1px solid rgba(201,168,76,.1)', marginBottom: 4,
  },
  heading: {
    fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 600, letterSpacing: '.18em',
    color: 'var(--gold)', marginBottom: 4,
  },
  subHeading: {
    fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, letterSpacing: '.15em',
    textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8,
  },
  mono: {
    fontFamily: "'Inconsolata', monospace", fontSize: 12, fontWeight: 500, color: 'var(--text)',
  },
  monoSm: {
    fontFamily: "'Inconsolata', monospace", fontSize: 11, color: 'var(--text2)',
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
    borderRadius: 8, background: 'var(--row-bg)',
    border: '1px solid var(--row-border)', transition: 'background .2s',
  },
  glass: {
    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
    borderRadius: 13, padding: 18, backdropFilter: 'blur(12px)',
  },
  badge: (bg, border, color) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: 12,
    fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.1em',
    textTransform: 'uppercase', background: bg, border: `1px solid ${border}`, color,
  }),
  interpretation: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--text2)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'var(--interp-bg)', border: '1px solid var(--interp-border)',
  },
}

const METHOD_COLORS = {
  Hebrew: '#f0c040',
  Pythagorean: '#40ccdd',
  Chaldean: '#d43070',
  'English Ordinal': '#9050e0',
}

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
          textTransform: 'uppercase', color: 'var(--text3)', textAlign: 'center',
        }}>{label}</div>
      )}
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'center', fontStyle: 'italic', maxWidth: 120 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

export default function GematriaDetail() {
  // Use engine-computed profile (dynamic, reads from primaryProfile)
  const P = buildComputedProfile()

  return (
    <div style={S.panel}>
      {/* 1. HEADER */}
      <div>
        <div style={S.heading}>{'\u05D0'} Gematria</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>
          Name numerology -- Hebrew, Pythagorean, Chaldean, and English ordinal analysis
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, marginTop: 16,
        }}>
          <NumCircle val={P.hebrew.fullValue} color="#f0c040" size={68} label="Hebrew Total" />
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 16, letterSpacing: '.12em',
              color: 'var(--gold)', marginBottom: 4,
            }}>
              {P.fullName}
            </div>
            <div style={S.monoSm}>
              {P.firstName} ({P.hebrew.firstNameValue}) + {P.lastName} ({P.hebrew.lastNameValue}) = {P.hebrew.fullValue}
            </div>
            <div style={{
              ...S.monoSm, color: 'var(--text3)', marginTop: 2,
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
                    textTransform: 'uppercase', color: 'var(--text3)',
                    borderBottom: '1px solid rgba(201,168,76,.1)',
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
                  <td style={{ padding: '8px 10px', color: 'var(--text)' }}>
                    <span style={{ color: m.color, fontWeight: 600 }}>{m.d.fullValue}</span>
                  </td>
                  <td style={{ padding: '8px 10px', color: 'var(--text2)' }}>{m.d.firstNameValue}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text2)' }}>{m.d.lastNameValue}</td>
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
              background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.04)',
            }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.1em',
                color: METHOD_COLORS[m.name] || 'var(--gold)', marginBottom: 4,
                textTransform: 'uppercase',
              }}>{m.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.4 }}>
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
                    textTransform: 'uppercase', color: 'var(--text3)',
                    borderBottom: '1px solid rgba(201,168,76,.1)',
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
                    borderTop: isFirstOfLast ? '1px solid rgba(201,168,76,.15)' : 'none',
                  }}>
                    <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--text3)', fontSize: 9 }}>
                      {i + 1}
                    </td>
                    <td style={{
                      padding: '5px 8px', textAlign: 'center',
                      fontFamily: "'Cinzel', serif", fontSize: 13, color: 'var(--gold)',
                    }}>
                      {b.letter}
                    </td>
                    <td style={{ padding: '5px 8px', fontSize: 10, color: 'var(--text2)' }}>
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
                background: 'rgba(201,168,76,.04)',
              }}>
                <td colSpan={4} style={{
                  padding: '6px 8px',
                  fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.1em',
                  color: 'var(--gold)', textTransform: 'uppercase',
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
              textTransform: 'uppercase', color: 'var(--text3)',
            }}>Name Number</div>
            <NumCircle val={P.pythagorean.nameNumber} color="#40ccdd" size={56} />
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.08em',
              color: '#40ccdd',
            }}>The Initiator</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.4 }}>
              {P.pythagorean.fullValue} {'\u2192'} {P.pythagorean.nameNumber} -- Leadership, independence, original creation
            </div>
          </div>

          <div style={{
            ...S.glass, textAlign: 'center', padding: '20px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            borderColor: 'rgba(212,48,112,.18)', background: 'rgba(212,48,112,.03)',
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em',
              textTransform: 'uppercase', color: 'var(--text3)',
            }}>Soul Urge (Vowels)</div>
            <NumCircle val={P.pythagorean.vowelNumber} color="#d43070" size={56} />
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.08em',
              color: '#d43070',
            }}>The Communicator</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.4 }}>
              {P.pythagorean.rawVowelSum} {'\u2192'} {P.pythagorean.vowelNumber} -- Self-expression, creativity, artistic joy
            </div>
          </div>

          <div style={{
            ...S.glass, textAlign: 'center', padding: '20px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            borderColor: 'rgba(144,80,224,.18)', background: 'rgba(144,80,224,.03)',
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em',
              textTransform: 'uppercase', color: 'var(--text3)',
            }}>Personality (Consonants)</div>
            <NumCircle val={P.pythagorean.consonantNumber} color="#9050e0" size={56} />
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.08em',
              color: 'var(--violet2)',
            }}>The Seeker</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.4 }}>
              {P.pythagorean.rawConsonantSum} {'\u2192'} {P.pythagorean.consonantNumber} -- Analysis, depth, spiritual inquiry
            </div>
          </div>
        </div>

        {P.pythagorean.firstNameValue === 22 && (
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 8,
            background: 'rgba(201,168,76,.05)', border: '1px solid rgba(201,168,76,.15)',
          }}>
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.1em',
              color: 'var(--gold)', textTransform: 'uppercase',
            }}>Master Number Alert: </span>
            <span style={{ fontSize: 12, color: 'var(--text2)', fontStyle: 'italic' }}>
              First name "{P.firstName}" sums to <span style={{ color: 'var(--gold)' }}>22</span> (Master Builder) in Pythagorean gematria.
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
                  borderColor: `rgba(201,168,76,.1)`, background: 'rgba(201,168,76,.02)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontSize: 24, minWidth: 36, textAlign: 'center', color: 'var(--gold)',
                    }}>{hebrewEntry.hebrew}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          fontFamily: "'Cinzel', serif", fontSize: 13, letterSpacing: '.1em',
                          color: 'var(--gold)',
                        }}>{hebrewEntry.letter}</span>
                        <span style={{
                          fontFamily: "'Inconsolata', monospace", fontSize: 11,
                          color: 'var(--text3)',
                        }}>= {hebrewEntry.value}</span>
                        <span style={S.badge('rgba(201,168,76,.08)', 'rgba(201,168,76,.18)', 'var(--gold)')}>
                          {nameLetters.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.5, paddingLeft: 48 }}>
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
                    {s.matches.map((m, j) => (
                      <div key={j} style={{
                        fontSize: 12, color: 'var(--text2)', fontStyle: 'italic', lineHeight: 1.4,
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
                fontFamily: "'Cinzel', serif", fontSize: 14, color: 'var(--gold)',
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8, background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.15)',
                flexShrink: 0,
              }}>{k.path.includes('\u05D0') ? '\u05D0' : k.path.includes('\u05D2') ? '\u05D2' : k.path.includes('\u05EA') ? '\u05EA' : k.path.includes('\u05E8') ? '\u05E8' : k.path.includes('\u05E4') ? '\u05E4' : '\u2721'}</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.08em',
                    color: 'var(--gold)',
                  }}>{k.path}</span>
                </div>
                <span style={{ ...S.monoSm, color: 'var(--text3)', fontSize: 10 }}>
                  {k.connection}
                </span>
                {k.tarot && (
                  <span style={{
                    ...S.badge('rgba(144,80,224,.1)', 'rgba(144,80,224,.25)', 'var(--violet2)'),
                    alignSelf: 'flex-start', marginTop: 2,
                  }}>{k.tarot}</span>
                )}
                <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.5, marginTop: 4 }}>
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
                    textTransform: 'uppercase', color: 'var(--text3)',
                    borderBottom: '1px solid rgba(201,168,76,.1)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HEBREW_ALPHABET.map((h, i) => {
                const inName = P.letterBreakdown.some(b => b.hebrewEquiv === h.letter)
                return (
                  <tr key={i} style={{
                    background: inName ? 'rgba(201,168,76,.04)' : (i % 2 === 0 ? 'rgba(255,255,255,.01)' : 'transparent'),
                    borderLeft: inName ? '2px solid rgba(201,168,76,.3)' : '2px solid transparent',
                  }}>
                    <td style={{
                      padding: '5px 8px', textAlign: 'center', fontSize: 16,
                      color: inName ? 'var(--gold)' : 'var(--text3)',
                    }}>{h.hebrew}</td>
                    <td style={{
                      padding: '5px 8px',
                      fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.06em',
                      color: inName ? 'var(--gold)' : 'var(--text2)',
                    }}>{h.letter}</td>
                    <td style={{
                      padding: '5px 8px',
                      color: inName ? 'var(--gold)' : 'var(--text2)',
                      fontWeight: inName ? 600 : 400,
                    }}>{h.value}</td>
                    <td style={{
                      padding: '5px 8px', fontSize: 11,
                      color: 'var(--text3)', fontStyle: 'italic',
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
          The name <span style={{ color: 'var(--gold)' }}>Gaston Frydlewski</span> carries a Hebrew gematria
          value of <span style={{ color: '#f0c040' }}>{P.hebrew.fullValue}</span>, which reduces to{' '}
          <span style={{ color: '#f0c040' }}>{P.hebrew.reducedValue}</span> -- the number of{' '}
          <span style={{ color: 'var(--gold)' }}>new beginnings and singular purpose</span>. This
          is the frequency of Aleph, the first letter, the breath of creation before the word is spoken.
          <br /><br />
          The most striking feature is the first name "<span style={{ color: '#40ccdd' }}>Gaston</span>"
          summing to <span style={{ color: '#40ccdd' }}>22</span> in Pythagorean gematria -- a{' '}
          <span style={{ color: 'var(--gold)' }}>Master Number</span> never reduced. Twenty-two is the number of
          the Master Builder: the 22 Hebrew letters through which creation was spoken, the 22 paths of the
          Tree of Life, the 22 Major Arcana of the Tarot. A name that vibrates at 22 carries the blueprint
          of sacred architecture -- the capacity to build structures that bridge heaven and earth.
          <br /><br />
          The <span style={{ color: '#d43070' }}>Soul Urge of 3</span> (from the vowels) reveals that beneath
          the builder's discipline lies a heart that yearns to{' '}
          <span style={{ color: '#d43070' }}>create, express, and communicate</span>. Three is Gimel, the camel
          crossing the desert -- the movement of meaning from the internal to the external. The{' '}
          <span style={{ color: 'var(--violet2)' }}>Personality Number 7</span> (from the consonants) shows the
          world a figure of deep inquiry, spiritual intensity, and analytical precision -- Zayin, the sword that
          cuts through illusion to reach the marrow of truth.
          <br /><br />
          The Hebrew letter composition of the name is dominated by high-value letters:{' '}
          <span style={{ color: 'var(--gold)' }}>Tav (400)</span>,{' '}
          <span style={{ color: 'var(--gold)' }}>Resh (200)</span>, and{' '}
          <span style={{ color: 'var(--gold)' }}>Pe (80)</span> -- together representing completion,
          solar consciousness, and transformative speech. This name is not quiet; it is a name that speaks
          worlds into existence and then has the discipline to build them, brick by brick, letter by letter,
          from the crown of Kether to the kingdom of Malkuth.
        </div>
      </div>
    </div>
  )
}
