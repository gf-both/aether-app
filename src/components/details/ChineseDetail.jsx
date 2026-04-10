import { useMemo } from 'react'
import { useComputedProfile as useActiveProfile } from '../../hooks/useActiveProfile'
import { CHINESE_ANIMALS, FIVE_ELEMENTS, CHINESE_PROFILE as STATIC_PROFILE } from '../../data/chineseData'
import { getChineseProfileFromDob } from '../../engines/chineseEngine'

/* ---- shared styles (matching app conventions) ---- */
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

const ELEM_COLORS = { Wood: '#4caf50', Fire: '#e53935', Earth: '#d4a017', Metal: '#cfd8dc', Water: '#1e88e5' }

export default function ChineseDetail() {
  const profile = useActiveProfile()

  const P = useMemo(() => {
    try {
      const dob = profile?.dob || ''
      const tob = profile?.tob || '12:00'
      if (!dob) return null
      const [hour, minute] = (tob || '12:00').split(':').map(Number)
      const computed = getChineseProfileFromDob(dob, { hour: isNaN(hour) ? 12 : hour, minute: isNaN(minute) ? 0 : minute })

      // Find static animal data for the computed year animal (for compat, lucky, etc.)
      const staticAnimalEntry = CHINESE_ANIMALS.find(a => a.name === computed.animal)

      // Build a merged profile: computed pillars + static enrichment data
      return {
        // From engine
        ...computed,
        dob: profile?.dob || '',
        // Compatibility & lucky from static animal data
        compatible:    staticAnimalEntry?.compatible   || STATIC_PROFILE.compatible,
        incompatible:  staticAnimalEntry?.incompatible || STATIC_PROFILE.incompatible,
        bestFriend:    staticAnimalEntry?.compatible?.[0] || STATIC_PROFILE.bestFriend,
        conflictAnimal: staticAnimalEntry?.incompatible?.[0] || STATIC_PROFILE.conflictAnimal,
        // Lucky attributes
        lucky: {
          numbers:    STATIC_PROFILE.lucky.numbers,
          colors:     computed.luckyColors.length ? computed.luckyColors : STATIC_PROFILE.lucky.colors,
          flowers:    STATIC_PROFILE.lucky.flowers,
          directions: computed.luckyDirections.length ? computed.luckyDirections : STATIC_PROFILE.lucky.directions,
          day:        STATIC_PROFILE.lucky.day,
        },
        // Polarity string
        polarity: `${computed.yinYang} ${computed.element}`,
        // Branch pinyin from BRANCHES array (engine exposes .branch already)
        branchPinyin: computed.branch,
        // Chinese characters
        stemChinese:    computed.stemCn,
        elementChinese: computed.yearPillar?.stemCn || computed.stemCn,
        // fourPillars in the shape the template expects
        fourPillars: {
          year:  { stem: computed.yearPillar.stem, branch: computed.yearPillar.branch, label: computed.yearPillar.label, desc: computed.yearPillar.desc },
          month: { stem: computed.monthPillar.stem, branch: computed.monthPillar.branch, label: computed.monthPillar.label, desc: computed.monthPillar.desc },
          day:   { stem: computed.dayPillar.stem, branch: computed.dayPillar.branch, label: computed.dayPillar.label, desc: computed.dayPillar.desc },
          hour:  { stem: computed.hourPillar.stem, branch: computed.hourPillar.branch, label: computed.hourPillar.label, desc: computed.hourPillar.desc },
        },
        // Current year influence (enrich static text if same year, else generate)
        currentYear: (() => {
          const cy = computed.currentYear
          const staticCY = STATIC_PROFILE.currentYear
          // Use static influence text if it matches the computed current year animal
          const useStatic = staticCY && staticCY.animal === cy.animal && staticCY.year === cy.year
          return {
            year:         cy.year,
            animal:       cy.animal,
            element:      cy.element,
            stem:         cy.stem,
            label:        cy.label,
            chinese:      cy.chinese_str,
            ratingColor:  useStatic ? staticCY.ratingColor : '#e57c22',
            rating:       useStatic ? staticCY.rating : 'Dynamic Year',
            influence:    useStatic
              ? staticCY.influence
              : `The ${cy.label} year brings ${cy.element} energy into your ${computed.element} ${computed.animal} chart. The interplay of these forces shapes career, relationships, and personal growth through the year.`,
          }
        })(),
      }
    } catch {
      console.error('ChineseEngine error:', e)
      return null
    }
  }, [profile?.dob, profile?.tob])

  if (!P) return <div style={S.panel}>Error computing Chinese profile.</div>

  const animalData = CHINESE_ANIMALS.find(a => a.name === P.animal)

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>{animalData.emoji} Chinese Astrology</div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          Four Pillars of Destiny (Ba Zi), zodiac animals, five elements, and annual forecast
        </div>
      </div>

      {/* PRIMARY SIGN OVERVIEW */}
      <div>
        <div style={S.sectionTitle}>Primary Sign</div>
        <div style={{ ...S.glass, display: 'flex', gap: 24, alignItems: 'center', padding: '24px 22px' }}>
          {/* Large emblem */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--accent)', border: '2px solid rgba(201,168,76,.25)',
            fontSize: 44, flexShrink: 0,
          }}>
            {animalData.emoji}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 20, letterSpacing: '.15em', color: 'var(--foreground)',
            }}>
              {P.polarity} {P.animal}
            </div>
            <div style={{ ...S.monoSm, color: 'var(--muted-foreground)' }}>
              {P.stemChinese}{P.branch} &middot; {P.stem} {P.branchPinyin} &middot; Born {P.dob}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              <span style={S.badge('var(--accent)', 'rgba(201,168,76,.25)', 'var(--foreground)')}>
                {P.yinYang}
              </span>
              <span style={S.badge('rgba(207,216,220,.1)', 'rgba(207,216,220,.25)', '#cfd8dc')}>
                {P.element}
              </span>
              <span style={S.badge('rgba(201,168,76,.06)', 'var(--accent)', 'var(--muted-foreground)')}>
                Order #{animalData.order}
              </span>
              <span style={S.badge('rgba(201,168,76,.06)', 'var(--accent)', 'var(--muted-foreground)')}>
                {animalData.season}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>
              Traits: {animalData.traits.join(' \u00B7 ')}
            </div>
          </div>
        </div>
      </div>

      {/* FOUR PILLARS */}
      <div>
        <div style={S.sectionTitle}>Four Pillars of Destiny (Ba Zi)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {['year', 'month', 'day', 'hour'].map(key => {
            const pillar = P.fourPillars[key]
            return (
              <div key={key} style={{
                ...S.glass, textAlign: 'center', padding: '20px 12px',
                borderColor: key === 'day' ? 'rgba(30,136,229,.2)' : 'var(--accent)',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em',
                  textTransform: 'uppercase',
                  color: key === 'day' ? '#1e88e5' : 'var(--muted-foreground)',
                }}>
                  {key} pillar {key === 'day' ? '(day master)' : ''}
                </div>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 15, letterSpacing: '.1em',
                  color: key === 'day' ? '#1e88e5' : 'var(--foreground)',
                }}>
                  {pillar.label}
                </div>
                <div style={{ ...S.monoSm, fontSize: 10, color: 'var(--muted-foreground)' }}>
                  {pillar.stem} {pillar.branch}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4, marginTop: 4 }}>
                  {pillar.desc}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{
          marginTop: 12, padding: '12px 16px', borderRadius: 8,
          background: 'rgba(30,136,229,.04)', border: '1px solid rgba(30,136,229,.12)',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.18em',
            textTransform: 'uppercase', color: '#1e88e5', marginBottom: 4,
          }}>Day Master</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: '#1e88e5', marginBottom: 4 }}>
            {P.dayMaster}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.5 }}>
            {P.dayMasterDesc}
          </div>
        </div>
      </div>

      {/* INNER & SECRET ANIMALS */}
      <div>
        <div style={S.sectionTitle}>Inner & Secret Animals</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'Year Animal (Outer)', animal: P.animal, branch: P.branch, element: P.element, stem: P.stem,
              desc: 'How others perceive you. The public persona \u2014 clever, curious, and versatile.' },
            { label: 'Month Animal (Inner)', animal: P.innerAnimal, branch: P.innerBranch, element: P.innerElement, stem: P.innerStem,
              desc: 'Your inner self, revealed in close relationships. The Ox within brings patience, determination, and quiet perseverance that grounds the Monkey\'s restless brilliance.' },
            { label: 'Hour Animal (Secret)', animal: P.secretAnimal, branch: P.secretBranch, element: P.secretElement, stem: P.secretStem,
              desc: 'Your truest, most hidden self. The Pig reveals warmth, generosity, and an honest sincerity that operates beneath the Monkey\'s clever exterior.' },
          ].map((item, i) => {
            const animalData = CHINESE_ANIMALS.find(a => a.name === item.animal)
            const elemCol = ELEM_COLORS[item.element] || '#ccc'
            return (
              <div key={i} style={{
                ...S.glass, textAlign: 'center', padding: '20px 14px',
                borderColor: i === 0 ? 'rgba(201,168,76,.2)' : 'var(--border)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em',
                  textTransform: 'uppercase', color: 'var(--muted-foreground)',
                }}>{item.label}</div>
                <div style={{ fontSize: 36 }}>{animalData?.emoji}</div>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 14, letterSpacing: '.1em',
                  color: i === 0 ? 'var(--foreground)' : 'var(--foreground)',
                }}>
                  {item.element} {item.animal}
                </div>
                <div style={{ ...S.monoSm, fontSize: 10, color: 'var(--muted-foreground)' }}>
                  {item.stem} {item.branch}
                </div>
                <span style={S.badge(elemCol + '12', elemCol + '30', elemCol)}>
                  {item.element}
                </span>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4, marginTop: 4 }}>
                  {item.desc}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* COMPATIBILITY */}
      <div>
        <div style={S.sectionTitle}>Compatibility</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{
            ...S.glass, padding: '16px 18px',
            borderColor: 'rgba(96,176,48,.15)',
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em',
              textTransform: 'uppercase', color: '#60b030', marginBottom: 10,
            }}>Best Matches</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {P.compatible.map((name, i) => {
                const a = CHINESE_ANIMALS.find(x => x.name === name)
                return (
                  <div key={i} style={{ ...S.row, borderColor: 'rgba(96,176,48,.1)' }}>
                    <span style={{ fontSize: 22 }}>{a?.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: '#60b030' }}>{name}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{a?.traits?.slice(0, 2).join(' \u00B7 ')}</div>
                    </div>
                    {name === P.bestFriend && (
                      <span style={S.badge('rgba(96,176,48,.12)', 'rgba(96,176,48,.3)', '#60b030')}>
                        Best friend
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div style={{
            ...S.glass, padding: '16px 18px',
            borderColor: 'rgba(220,60,60,.15)',
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em',
              textTransform: 'uppercase', color: '#dc5050', marginBottom: 10,
            }}>Challenging Matches</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {P.incompatible.map((name, i) => {
                const a = CHINESE_ANIMALS.find(x => x.name === name)
                return (
                  <div key={i} style={{ ...S.row, borderColor: 'rgba(220,60,60,.1)' }}>
                    <span style={{ fontSize: 22 }}>{a?.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: '#dc5050' }}>{name}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{a?.traits?.slice(0, 2).join(' \u00B7 ')}</div>
                    </div>
                    {name === P.conflictAnimal && (
                      <span style={S.badge('rgba(220,60,60,.12)', 'rgba(220,60,60,.3)', '#dc5050')}>
                        Conflict
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ALL 12 ANIMALS TABLE */}
      <div>
        <div style={S.sectionTitle}>The Twelve Animals</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {CHINESE_ANIMALS.map((animal, i) => {
            const isActive = animal.name === P.animal
            const elemCol = ELEM_COLORS[animal.fixedElement] || '#ccc'
            return (
              <div key={i} style={{
                ...S.row,
                borderColor: isActive ? 'rgba(201,168,76,.2)' : 'var(--secondary)',
                background: isActive ? 'var(--secondary)' : 'rgba(255,255,255,.015)',
                padding: '6px 12px',
              }}>
                <span style={{ fontSize: 20, minWidth: 32, textAlign: 'center' }}>{animal.emoji}</span>
                <div style={{ width: 72 }}>
                  <div style={{
                    fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.08em',
                    color: isActive ? 'var(--foreground)' : 'var(--foreground)',
                  }}>{animal.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--muted-foreground)' }}>{animal.branch}</div>
                </div>
                <span style={S.badge(elemCol + '10', elemCol + '28', elemCol)}>
                  {animal.fixedElement}
                </span>
                <span style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 10, color: 'var(--muted-foreground)',
                  width: 30, textAlign: 'center',
                }}>{animal.yinYang}</span>
                <div style={{ flex: 1, fontSize: 10, color: 'var(--muted-foreground)' }}>
                  {animal.traits.join(' \u00B7 ')}
                </div>
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

      {/* FIVE ELEMENTS */}
      <div>
        <div style={S.sectionTitle}>The Five Elements (Wu Xing)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {FIVE_ELEMENTS.map((elem, i) => {
            const isActive = elem.name === P.element
            return (
              <div key={i} style={{
                ...S.glass, textAlign: 'center', padding: '16px 10px',
                borderColor: isActive ? elem.color + '44' : 'var(--secondary)',
                background: isActive ? elem.color + '08' : 'rgba(5,5,26,.7)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <div style={{ fontSize: 28, color: elem.color }}>{elem.chinese}</div>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.1em', color: elem.color,
                }}>{elem.name}</div>
                <div style={{ fontSize: 9, color: 'var(--muted-foreground)' }}>
                  {elem.yin}/{elem.yang}
                </div>
                <div style={{ fontSize: 9, color: 'var(--muted-foreground)' }}>
                  {elem.season} &middot; {elem.direction}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.3, marginTop: 4 }}>
                  {elem.qualities.join(', ')}
                </div>
                {isActive && (
                  <span style={S.badge(elem.color + '18', elem.color + '40', elem.color)}>
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
          The five elements cycle through generation (Wood feeds Fire, Fire creates Earth, Earth bears Metal, Metal collects Water, Water nourishes Wood) and control (Wood parts Earth, Earth dams Water, Water extinguishes Fire, Fire melts Metal, Metal chops Wood).
        </div>
      </div>

      {/* 2026 FORECAST */}
      <div>
        <div style={S.sectionTitle}>2026 Annual Forecast</div>
        <div style={{
          ...S.glass, padding: '24px 22px',
          borderColor: P.currentYear.ratingColor + '22',
          background: P.currentYear.ratingColor + '04',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: P.currentYear.ratingColor + '10',
              border: '2px solid ' + P.currentYear.ratingColor + '33',
              fontSize: 34, flexShrink: 0,
            }}>
              {CHINESE_ANIMALS.find(a => a.name === P.currentYear.animal)?.emoji}
            </div>
            <div>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 16, letterSpacing: '.12em',
                color: P.currentYear.ratingColor,
              }}>
                Year of the {P.currentYear.label}
              </div>
              <div style={{ ...S.monoSm, fontSize: 10, color: 'var(--muted-foreground)' }}>
                {P.currentYear.chinese} &middot; {P.currentYear.stem} {P.currentYear.animal} &middot; {P.currentYear.year}
              </div>
              <span style={S.badge(
                P.currentYear.ratingColor + '15',
                P.currentYear.ratingColor + '35',
                P.currentYear.ratingColor,
              )}>
                {P.currentYear.rating}
              </span>
            </div>
          </div>
          <div style={S.interpretation}>
            <span style={{ color: 'var(--foreground)' }}>Metal Monkey in the Year of the Fire Horse:</span>{' '}
            {P.currentYear.influence}
          </div>
        </div>
      </div>

      {/* LUCKY ATTRIBUTES */}
      <div>
        <div style={S.sectionTitle}>Lucky Attributes</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'Lucky Numbers', items: P.lucky.numbers.map(String), icon: '#' },
            { label: 'Lucky Colors', items: P.lucky.colors, icon: '\u25CF' },
            { label: 'Lucky Directions', items: P.lucky.directions, icon: '\u2192' },
            { label: 'Lucky Flowers', items: P.lucky.flowers, icon: '\u2740' },
            { label: 'Lucky Day', items: [P.lucky.day], icon: '\u2606' },
            { label: 'Fixed Element', items: [P.element + ' (' + P.elementChinese + ')'], icon: '\u2726' },
          ].map((group, i) => (
            <div key={i} style={{
              ...S.glass, padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.18em',
                textTransform: 'uppercase', color: 'var(--muted-foreground)',
              }}>{group.label}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {group.items.map((item, j) => (
                  <span key={j} style={S.badge('var(--accent)', 'rgba(201,168,76,.18)', 'var(--foreground)')}>
                    {group.icon} {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HOLISTIC INTERPRETATION */}
      <div>
        <div style={S.sectionTitle}>Holistic Interpretation</div>
        <div style={S.interpretation}>
          As a <span style={{ color: 'var(--foreground)' }}>Yang Metal Monkey</span> with a{' '}
          <span style={{ color: '#1e88e5' }}>Ren Water day master</span>, your chart reveals a
          fascinating interplay between the surface and the depths. The Monkey's sharp intellect and
          versatile nature (Metal) serves as the outer vessel for a far more fluid, adaptable inner
          reality (Water). Your <span style={{ color: '#4caf50' }}>inner Ox</span> (month pillar)
          adds unexpected steadiness and patient determination to this quick-witted exterior, while the{' '}
          <span style={{ color: '#e53935' }}>secret Pig</span> (hour pillar) reveals a generous warmth
          and honest sincerity operating beneath conscious awareness. The Metal element in your year
          pillar grants exceptional clarity and discrimination, but the day master's Water nature
          ensures this sharpness is tempered by{' '}
          <span style={{ color: '#1e88e5' }}>wisdom and flow</span> rather than rigidity.
          In relationships, the Monkey-Rat-Dragon triangle forms your natural alliance --
          clever, dynamic partners who appreciate your ingenuity. The current{' '}
          <span style={{ color: P.currentYear.ratingColor }}>Fire Horse year</span> challenges
          you to harness your mental agility and channel it into bold, decisive action.
        </div>
      </div>
    </div>
  )
}
