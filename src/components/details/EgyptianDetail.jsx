import { useMemo } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { EGYPTIAN_SIGNS, EGYPTIAN_PROFILE, getEgyptianSign } from '../../data/egyptianData'

/* ---- shared styles (matching app conventions) ---- */
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

const ELEM_COLORS = { Fire: '#e53935', Earth: '#d4a017', Water: '#1e88e5', Air: '#88aacc' }

const SIGN_GLYPHS = {
  'Nile': '\u{1F30A}',
  'Amun-Ra': '\u{2600}',
  'Mut': '\u{1F985}',
  'Geb': '\u{1F30D}',
  'Osiris': '\u{2625}',
  'Isis': '\u{1F451}',
  'Thoth': '\u{1F4DC}',
  'Horus': '\u{1F4A0}',
  'Anubis': '\u{1F43E}',
  'Seth': '\u{26A1}',
  'Bastet': '\u{1F408}',
  'Sekhmet': '\u{1F981}',
}

export default function EgyptianDetail() {
  const profile = useAboveInsideStore(s => s.primaryProfile)

  // Compute Egyptian sign dynamically from birth data
  const computedSign = useMemo(() => {
    if (!profile.dob) return null
    const [, m, d] = profile.dob.split('-').map(Number)
    return getEgyptianSign(d, m)
  }, [profile.dob])

  // Use computed sign's name to look up full sign data; fall back to static profile
  const activeSignName = computedSign?.name || EGYPTIAN_PROFILE.sign
  const activeSignData = EGYPTIAN_SIGNS.find(s => s.name === activeSignName) || EGYPTIAN_SIGNS.find(s => s.name === 'Mut')

  // Merge: use static EGYPTIAN_PROFILE for rich data (description, compatibility etc.)
  // but override sign/element/planet if computed sign differs
  const P = activeSignName === EGYPTIAN_PROFILE.sign
    ? EGYPTIAN_PROFILE
    : {
        ...EGYPTIAN_PROFILE,
        sign: activeSignName,
        element: activeSignData?.element || EGYPTIAN_PROFILE.element,
        planet: activeSignData?.planet || EGYPTIAN_PROFILE.planet,
        symbol: activeSignData?.symbol || EGYPTIAN_PROFILE.symbol,
        traits: activeSignData?.traits || EGYPTIAN_PROFILE.traits,
        dates: activeSignData?.dates || EGYPTIAN_PROFILE.dates,
      }

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>{SIGN_GLYPHS['Mut']} Egyptian Astrology</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>
          Ancient Egyptian zodiac signs, deity archetypes, elemental alignments, and divine compatibility
        </div>
      </div>

      {/* PRIMARY SIGN OVERVIEW */}
      <div>
        <div style={S.sectionTitle}>Your Sign</div>
        <div style={{ ...S.glass, display: 'flex', gap: 24, alignItems: 'center', padding: '24px 22px' }}>
          {/* Large emblem */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(201,168,76,.08)', border: '2px solid rgba(201,168,76,.25)',
            fontSize: 44, flexShrink: 0,
          }}>
            {SIGN_GLYPHS[P.sign]}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 20, letterSpacing: '.15em', color: 'var(--gold)',
            }}>
              {P.sign}
            </div>
            <div style={{ ...S.monoSm, color: 'var(--text3)' }}>
              {P.symbol} &middot; {P.dates}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              <span style={S.badge('rgba(201,168,76,.1)', 'rgba(201,168,76,.25)', 'var(--gold)')}>
                {P.element}
              </span>
              <span style={S.badge('rgba(184,160,112,.1)', 'rgba(184,160,112,.25)', '#b8a070')}>
                {P.planet}
              </span>
              <span style={S.badge('rgba(201,168,76,.06)', 'rgba(201,168,76,.15)', 'var(--gold3)')}>
                {P.color}
              </span>
              <span style={S.badge('rgba(201,168,76,.06)', 'rgba(201,168,76,.15)', 'var(--gold3)')}>
                {P.symbol}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
              Traits: {P.traits.join(' \u00B7 ')}
            </div>
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div>
        <div style={S.sectionTitle}>The Mother Goddess</div>
        <div style={S.interpretation}>
          {P.description}
        </div>
      </div>

      {/* TRAITS */}
      <div>
        <div style={S.sectionTitle}>Core Traits</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {P.traits.map((trait, i) => (
            <div key={i} style={{
              ...S.glass, padding: '14px 20px', textAlign: 'center', flex: '1 1 120px',
              borderColor: 'rgba(201,168,76,.12)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.15)',
                fontFamily: "'Cinzel', serif", fontSize: 16, color: 'var(--gold)',
              }}>
                {i + 1}
              </div>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.1em', color: 'var(--gold2)',
              }}>
                {trait}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STRENGTHS & WEAKNESSES */}
      <div>
        <div style={S.sectionTitle}>Strengths & Weaknesses</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{
            ...S.glass, padding: '16px 18px',
            borderColor: 'rgba(96,176,48,.15)',
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em',
              textTransform: 'uppercase', color: '#60b030', marginBottom: 10,
            }}>Strengths</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, fontStyle: 'italic' }}>
              {P.strengths}
            </div>
          </div>
          <div style={{
            ...S.glass, padding: '16px 18px',
            borderColor: 'rgba(220,60,60,.15)',
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em',
              textTransform: 'uppercase', color: '#dc5050', marginBottom: 10,
            }}>Weaknesses</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, fontStyle: 'italic' }}>
              {P.weaknesses}
            </div>
          </div>
        </div>
      </div>

      {/* COMPATIBILITY */}
      <div>
        <div style={S.sectionTitle}>Divine Compatibility</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {P.compatibility.map((name, i) => {
            const compSign = EGYPTIAN_SIGNS.find(s => s.name === name)
            const elemCol = ELEM_COLORS[compSign?.element] || '#ccc'
            return (
              <div key={i} style={{
                ...S.row,
                borderColor: 'rgba(96,176,48,.12)',
                background: 'rgba(96,176,48,.02)',
                padding: '10px 14px',
              }}>
                <span style={{ fontSize: 26 }}>{SIGN_GLYPHS[name] || '\u2726'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Cinzel', serif", fontSize: 14, letterSpacing: '.08em', color: '#60b030',
                  }}>{name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {compSign?.dates}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
                    {compSign?.traits?.join(' \u00B7 ')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <span style={S.badge(elemCol + '12', elemCol + '30', elemCol)}>
                    {compSign?.element}
                  </span>
                  <span style={S.badge('rgba(96,176,48,.12)', 'rgba(96,176,48,.3)', '#60b030')}>
                    Compatible
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ELEMENT & PLANET */}
      <div>
        <div style={S.sectionTitle}>Cosmic Alignments</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Element */}
          <div style={{
            ...S.glass, textAlign: 'center', padding: '20px 18px',
            background: 'rgba(212,160,23,.04)', borderColor: 'rgba(212,160,23,.15)',
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em',
              textTransform: 'uppercase', color: 'rgba(212,160,23,.6)', marginBottom: 6,
            }}>Element</div>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 28, color: '#d4a017',
              letterSpacing: '.15em', lineHeight: 1,
            }}>{P.element}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8, fontStyle: 'italic' }}>
              Grounding, stability, endurance, and practical manifestation
            </div>
          </div>

          {/* Planet */}
          <div style={{
            ...S.glass, textAlign: 'center', padding: '20px 18px',
            background: 'rgba(184,160,112,.04)', borderColor: 'rgba(184,160,112,.15)',
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em',
              textTransform: 'uppercase', color: 'rgba(184,160,112,.6)', marginBottom: 6,
            }}>Ruling Planet</div>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 28, color: '#b8a070',
              letterSpacing: '.15em', lineHeight: 1,
            }}>{P.planet}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8, fontStyle: 'italic' }}>
              Intuition, cycles, reflection, emotional depth, and hidden knowledge
            </div>
          </div>
        </div>
      </div>

      {/* ALL 12 SIGNS TABLE */}
      <div>
        <div style={S.sectionTitle}>The Twelve Egyptian Signs</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {EGYPTIAN_SIGNS.map((sign, i) => {
            const isActive = sign.name === P.sign
            const elemCol = ELEM_COLORS[sign.element] || '#ccc'
            return (
              <div key={i} style={{
                ...S.row,
                borderColor: isActive ? 'rgba(201,168,76,.2)' : 'rgba(255,255,255,.04)',
                background: isActive ? 'rgba(201,168,76,.04)' : 'rgba(255,255,255,.015)',
                padding: '6px 12px',
              }}>
                <span style={{ fontSize: 20, minWidth: 32, textAlign: 'center' }}>
                  {SIGN_GLYPHS[sign.name] || '\u2726'}
                </span>
                <div style={{ width: 80 }}>
                  <div style={{
                    fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.08em',
                    color: isActive ? 'var(--gold)' : 'var(--text)',
                  }}>{sign.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--text3)' }}>{sign.symbol}</div>
                </div>
                <span style={S.badge(elemCol + '10', elemCol + '28', elemCol)}>
                  {sign.element}
                </span>
                <span style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 10, color: 'var(--text3)',
                  width: 50, textAlign: 'center',
                }}>{sign.planet}</span>
                <div style={{ flex: 1, fontSize: 10, color: 'var(--text3)' }}>
                  {sign.traits.join(' \u00B7 ')}
                </div>
                <div style={{
                  width: 12, height: 12, borderRadius: 3,
                  background: sign.color, border: '1px solid rgba(255,255,255,.1)',
                  flexShrink: 0,
                }} />
                {isActive && (
                  <span style={S.badge('rgba(201,168,76,.12)', 'rgba(201,168,76,.3)', 'var(--gold)')}>
                    You
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* HOLISTIC INTERPRETATION */}
      <div>
        <div style={S.sectionTitle}>Holistic Interpretation</div>
        <div style={S.interpretation}>
          As a child of <span style={{ color: 'var(--gold)' }}>Mut, the Mother Goddess</span>, your
          Egyptian astrological blueprint speaks of deep, abiding power rooted in the earth itself.
          Governed by the <span style={{ color: '#b8a070' }}>Moon</span>, you move through life with
          a cyclical awareness -- understanding that growth requires patience, that strength is not
          always loud, and that the greatest empires are built one careful stone at a time. Your{' '}
          <span style={{ color: '#d4a017' }}>Earth element</span> grounds your ambitions in reality,
          ensuring your visions always find form. The vulture that symbolizes Mut soars highest of all
          birds -- and yet it is the most patient, circling above the Nile until the perfect moment
          arrives. This is your gift: panoramic vision paired with unwavering patience. Your divine
          compatibility with <span style={{ color: '#60b030' }}>Amun-Ra</span> and{' '}
          <span style={{ color: '#60b030' }}>Thoth</span> connects you to both the sovereign creative
          fire of the sun god and the cerebral wisdom of the ibis-headed scribe. Together, they
          illuminate the full spectrum of your nature -- the fierce protector who also thinks deeply
          before acting.
        </div>
      </div>
    </div>
  )
}
