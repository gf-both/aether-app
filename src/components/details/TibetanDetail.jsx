import { useMemo } from 'react'
import { useComputedProfile as useActiveProfile } from '../../hooks/useActiveProfile'
import { getTibetanProfile, TIBETAN_ELEMENT_NAMES_TIB } from '../../engines/tibetanEngine'

const ANIMALS = ['Horse','Sheep','Monkey','Bird','Dog','Pig','Mouse','Ox','Tiger','Rabbit','Dragon','Snake']
const ELEMENTS = ['Fire','Earth','Iron','Water','Wood']
const ANIMAL_EMOJI = {
  Horse: '\u{1F40E}', Sheep: '\u{1F411}', Monkey: '\u{1F412}', Bird: '\u{1F426}',
  Dog: '\u{1F415}', Pig: '\u{1F416}', Mouse: '\u{1F401}', Ox: '\u{1F402}',
  Tiger: '\u{1F405}', Rabbit: '\u{1F407}', Dragon: '\u{1F409}', Snake: '\u{1F40D}',
}
const ELEM_COLORS = { Fire: '#e53935', Earth: '#d4a017', Iron: '#b0bec5', Water: '#1e88e5', Wood: '#4caf50' }
const MEWA_DATA = {
  1: { color: 'White', element: 'Iron', meaning: 'Clarity, precision, strength' },
  2: { color: 'Black', element: 'Water', meaning: 'Depth, mystery, introspection' },
  3: { color: 'Blue', element: 'Water', meaning: 'Wisdom, communication, fluidity' },
  4: { color: 'Green', element: 'Wood', meaning: 'Growth, vitality, flexibility' },
  5: { color: 'Yellow', element: 'Earth', meaning: 'Foundation, stability, nourishment' },
  6: { color: 'White', element: 'Iron', meaning: 'Purity, reflection, completion' },
  7: { color: 'Red', element: 'Fire', meaning: 'Passion, transformation, clarity' },
  8: { color: 'White', element: 'Iron', meaning: 'Achievement, accumulation, power' },
  9: { color: 'Maroon/Red', element: 'Fire', meaning: 'Compassion, wisdom, liberation' },
}
const MEWA_BADGE_COLORS = {
  1: '#e0e0e0', 2: '#616161', 3: '#42a5f5', 4: '#66bb6a',
  5: '#fdd835', 6: '#eeeeee', 7: '#ef5350', 8: '#f5f5f5', 9: '#c62828',
}
const ELEMENT_PROPERTIES = {
  Fire:  'Transformative, passionate, illuminating. Fire burns away what is unnecessary and lights the path forward.',
  Earth: 'Stable, nurturing, grounding. Earth provides the foundation on which all things are built and sustained.',
  Iron:  'Precise, clear, enduring. Iron (Metal) cuts through confusion with sharpness and resolve.',
  Water: 'Flowing, deep, adaptive. Water finds its way around obstacles and reflects the truth of things.',
  Wood:  'Growing, flexible, vital. Wood reaches upward with relentless life force and bends without breaking.',
}

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

export default function TibetanDetail() {
  const profile = useActiveProfile()

  const tib = useMemo(() => {
    if (!profile?.dob) return null
    try {
      const [y, m, d] = profile.dob.split('-').map(Number)
      if (!y || !m || !d) return null
      return getTibetanProfile({ day: d, month: m, year: y })
    } catch { return null }
  }, [profile?.dob])

  if (!tib) {
    return (
      <div style={{ ...S.panel, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ opacity: 0.3, fontSize: 11, letterSpacing: '.1em', fontFamily: "'Cinzel',serif", textTransform: 'uppercase', color: 'var(--gold)' }}>
          Add birth date to view Tibetan Astrology
        </div>
      </div>
    )
  }

  const elemColor = ELEM_COLORS[tib.element] || '#c9a84c'
  const elemIdx = ELEMENTS.indexOf(tib.element)
  const tibElemName = elemIdx >= 0 ? TIBETAN_ELEMENT_NAMES_TIB[elemIdx] : ''
  const mewaColor = MEWA_BADGE_COLORS[tib.mewaNumber] || '#c9a84c'

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>{ANIMAL_EMOJI[tib.animal]} Tibetan Astrology</div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          Jungtsi tradition: birth animal, element, mewa number, and yin-yang polarity
        </div>
      </div>

      {/* FULL LABEL / PRIMARY SIGN */}
      <div>
        <div style={S.sectionTitle}>Your Tibetan Sign</div>
        <div style={{ ...S.glass, display: 'flex', gap: 24, alignItems: 'center', padding: '24px 22px' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--accent)', border: '2px solid rgba(201,168,76,.25)',
            fontSize: 44, flexShrink: 0,
          }}>
            {ANIMAL_EMOJI[tib.animal]}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 20, letterSpacing: '.15em', color: 'var(--foreground)',
            }}>
              {tib.fullLabel}
            </div>
            <div style={{ ...S.monoSm, color: 'var(--muted-foreground)' }}>
              Tibetan Year {tib.tibetanYear} &middot; Born {profile.dob}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              <span style={S.badge('var(--accent)', 'rgba(201,168,76,.25)', 'var(--foreground)')}>
                {tib.yinYang}
              </span>
              <span style={S.badge(elemColor + '12', elemColor + '30', elemColor)}>
                {tib.element} ({tibElemName})
              </span>
              <span style={S.badge(mewaColor + '18', mewaColor + '40', mewaColor)}>
                Mewa {tib.mewaNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BIRTH ANIMAL */}
      <div>
        <div style={S.sectionTitle}>Birth Animal</div>
        <div style={{ ...S.glass, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <span style={{ fontSize: 36 }}>{ANIMAL_EMOJI[tib.animal]}</span>
            <div>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 16, letterSpacing: '.12em', color: 'var(--foreground)',
              }}>{tib.animal}</div>
              <div style={{ ...S.monoSm, fontSize: 10 }}>
                Inherent Element: {tib.animalProfile.element}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{
              padding: '12px 16px', borderRadius: 8,
              background: 'rgba(96,176,48,.04)', border: '1px solid rgba(96,176,48,.12)',
            }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.18em',
                textTransform: 'uppercase', color: '#60b030', marginBottom: 6,
              }}>Qualities</div>
              <div style={{ fontSize: 13, color: 'var(--foreground)', lineHeight: 1.5 }}>
                {tib.animalProfile.quality}
              </div>
            </div>
            <div style={{
              padding: '12px 16px', borderRadius: 8,
              background: 'rgba(220,60,60,.04)', border: '1px solid rgba(220,60,60,.12)',
            }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.18em',
                textTransform: 'uppercase', color: '#dc5050', marginBottom: 6,
              }}>Challenges</div>
              <div style={{ fontSize: 13, color: 'var(--foreground)', lineHeight: 1.5 }}>
                {tib.animalProfile.challenge}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BIRTH ELEMENT */}
      <div>
        <div style={S.sectionTitle}>Birth Element</div>
        <div style={{
          ...S.glass, padding: '20px 22px',
          borderColor: elemColor + '22', background: elemColor + '04',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: elemColor + '15', border: `2px solid ${elemColor}33`,
              fontFamily: "'Cinzel', serif", fontSize: 20, color: elemColor,
            }}>
              {tib.element.charAt(0)}
            </div>
            <div>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 16, letterSpacing: '.12em', color: elemColor,
              }}>{tib.element}</div>
              <div style={{ ...S.monoSm, fontSize: 10 }}>
                Tibetan: {tibElemName}
              </div>
            </div>
          </div>
          <div style={S.interpretation}>
            {ELEMENT_PROPERTIES[tib.element]}
          </div>
        </div>
      </div>

      {/* MEWA NUMBER */}
      <div>
        <div style={S.sectionTitle}>Mewa Number</div>
        <div style={{
          ...S.glass, padding: '20px 22px',
          borderColor: mewaColor + '22',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: mewaColor + '15', border: `2px solid ${mewaColor}33`,
              fontFamily: "'Cinzel', serif", fontSize: 26, fontWeight: 700, color: mewaColor,
            }}>
              {tib.mewaNumber}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 16, letterSpacing: '.12em', color: 'var(--foreground)',
              }}>
                {tib.mewaMeaning.color} Mewa
              </div>
              <div style={{ ...S.monoSm, fontSize: 10 }}>
                Element: {tib.mewaMeaning.element}
              </div>
            </div>
          </div>
          <div style={S.interpretation}>
            {tib.mewaMeaning.meaning}
          </div>
        </div>
      </div>

      {/* MALE/FEMALE POLARITY */}
      <div>
        <div style={S.sectionTitle}>Polarity</div>
        <div style={{ ...S.glass, padding: '20px 22px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>
            {tib.yinYang === 'Male' ? '\u2642' : '\u2640'}
          </div>
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: 16, letterSpacing: '.15em', color: 'var(--foreground)',
            marginBottom: 6,
          }}>
            {tib.yinYang}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
            {tib.yinYang === 'Male'
              ? 'Male (Pho) polarity represents outward, active, expansive energy. It is associated with assertion, initiative, and the manifest world.'
              : 'Female (Mo) polarity represents inward, receptive, consolidating energy. It is associated with intuition, patience, and the subtle world.'}
          </div>
        </div>
      </div>

      {/* ALL 12 ANIMALS OVERVIEW */}
      <div>
        <div style={S.sectionTitle}>The Twelve Animals</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {ANIMALS.map((name, i) => {
            const isActive = name === tib.animal
            // Compute a simple profile for each animal for display
            const animalElem = {
              Horse: 'Fire', Sheep: 'Earth', Monkey: 'Iron', Bird: 'Iron',
              Dog: 'Earth', Pig: 'Water', Mouse: 'Water', Ox: 'Earth',
              Tiger: 'Wood', Rabbit: 'Wood', Dragon: 'Earth', Snake: 'Fire',
            }[name]
            const ae = ELEM_COLORS[animalElem] || '#888'
            return (
              <div key={i} style={{
                ...S.glass, textAlign: 'center', padding: '14px 8px',
                borderColor: isActive ? 'rgba(201,168,76,.3)' : 'var(--border)',
                background: isActive ? 'rgba(201,168,76,.04)' : 'var(--card)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <span style={{ fontSize: 24 }}>{ANIMAL_EMOJI[name]}</span>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.08em',
                  color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                }}>{name}</div>
                <span style={S.badge(ae + '10', ae + '28', ae)}>
                  {animalElem}
                </span>
                {isActive && (
                  <span style={S.badge('var(--accent)', 'rgba(201,168,76,.3)', 'var(--foreground)')}>
                    You
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ALL 5 ELEMENTS OVERVIEW */}
      <div>
        <div style={S.sectionTitle}>The Five Elements ('Byung Ba Lnga)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {ELEMENTS.map((name, i) => {
            const isActive = name === tib.element
            const ec = ELEM_COLORS[name]
            return (
              <div key={i} style={{
                ...S.glass, textAlign: 'center', padding: '16px 10px',
                borderColor: isActive ? ec + '44' : 'var(--secondary)',
                background: isActive ? ec + '08' : 'rgba(5,5,26,.7)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: ec + '18', border: `1px solid ${ec}33`,
                  fontFamily: "'Cinzel', serif", fontSize: 16, color: ec,
                }}>
                  {name.charAt(0)}
                </div>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.1em', color: ec,
                }}>{name}</div>
                <div style={{ ...S.monoSm, fontSize: 9 }}>
                  {TIBETAN_ELEMENT_NAMES_TIB[i]}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.3, marginTop: 2 }}>
                  {ELEMENT_PROPERTIES[name].split('.')[0]}.
                </div>
                {isActive && (
                  <span style={S.badge(ec + '18', ec + '40', ec)}>
                    Your element
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <div style={{
          marginTop: 12, fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic',
          textAlign: 'center', lineHeight: 1.5,
        }}>
          The elements cycle in pairs through the 60-year cycle: Fire-Fire, Earth-Earth, Iron-Iron, Water-Water, Wood-Wood.
          Each element governs two consecutive years, one Male and one Female.
        </div>
      </div>

      {/* MEWA CYCLE OVERVIEW */}
      <div>
        <div style={S.sectionTitle}>The Nine Mewa</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[1,2,3,4,5,6,7,8,9].map(num => {
            const m = MEWA_DATA[num]
            const mc = MEWA_BADGE_COLORS[num]
            const isActive = num === tib.mewaNumber
            return (
              <div key={num} style={{
                ...S.glass, padding: '14px 14px',
                borderColor: isActive ? mc + '44' : 'var(--border)',
                background: isActive ? mc + '06' : 'var(--card)',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: mc + '18', border: `1px solid ${mc}33`,
                    fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: mc,
                    flexShrink: 0,
                  }}>
                    {num}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.08em',
                      color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                    }}>{m.color}</div>
                    <div style={{ ...S.monoSm, fontSize: 9 }}>{m.element}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  {m.meaning}
                </div>
                {isActive && (
                  <span style={S.badge(mc + '18', mc + '40', mc)}>
                    Your mewa
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <div style={{
          marginTop: 12, fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic',
          textAlign: 'center', lineHeight: 1.5,
        }}>
          The nine mewa numbers derive from the magic square (sme ba dgu) and cycle in descending order through the years.
          Each mewa carries a color, element, and karmic meaning that colors the character of those born under it.
        </div>
      </div>

      {/* HOLISTIC INTERPRETATION */}
      <div>
        <div style={S.sectionTitle}>Holistic Interpretation</div>
        <div style={S.interpretation}>
          As a <span style={{ color: 'var(--foreground)' }}>{tib.fullLabel}</span> with{' '}
          <span style={{ color: mewaColor }}>Mewa {tib.mewaNumber} ({tib.mewaMeaning.color})</span>,{' '}
          your Tibetan chart reveals a distinctive interplay of forces.
          The <span style={{ color: elemColor }}>{tib.element}</span> element shapes your fundamental
          nature with its qualities of {ELEMENT_PROPERTIES[tib.element].split('.')[0].toLowerCase()}.
          Your birth animal, the <span style={{ color: 'var(--foreground)' }}>{tib.animal}</span>,
          brings {tib.animalProfile.quality.toLowerCase()} as core strengths, while reminding you
          to watch for tendencies toward {tib.animalProfile.challenge.toLowerCase()}.
          The {tib.yinYang} polarity gives your expression a{' '}
          {tib.yinYang === 'Male' ? 'dynamic, outward-moving' : 'receptive, inward-gathering'} quality.
          Your Mewa {tib.mewaNumber} adds the dimension of {tib.mewaMeaning.meaning.toLowerCase()},
          connected to the {tib.mewaMeaning.element} element, creating{' '}
          {tib.mewaMeaning.element === tib.element
            ? 'a harmonious reinforcement of your natal element.'
            : `an enriching interplay between ${tib.element} and ${tib.mewaMeaning.element} energies.`}
        </div>
      </div>
    </div>
  )
}
