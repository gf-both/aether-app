import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { getTarotBirthCards } from '../../engines/tarotEngine'

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
  glass: {
    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
    borderRadius: 13, padding: 18, backdropFilter: 'blur(12px)',
  },
  interpretation: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--text2)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'var(--interp-bg)', border: '1px solid var(--interp-border)',
  },
  badge: (bg, border, color) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: 12,
    fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.1em',
    textTransform: 'uppercase', background: bg, border: `1px solid ${border}`, color,
  }),
}

// Tarot card roman numerals and simple glyphs
const CARD_SYMBOLS = {
  1:  'I',   2:  'II',  3: 'III', 4:  'IV',   5:  'V',
  6: 'VI',   7: 'VII', 8: 'VIII', 9:  'IX',  10:  'X',
  11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV',
  16: 'XVI', 17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX',
  21: 'XXI', 22: '0',
}

const CARD_COLORS = {
  primary:  { main: 'rgba(201,168,76,1)',  bg: 'rgba(201,168,76,.07)', border: 'rgba(201,168,76,.25)' },
  pair:     { main: 'rgba(144,80,224,1)',  bg: 'rgba(144,80,224,.07)', border: 'rgba(144,80,224,.25)' },
  lifepath: { main: 'rgba(64,204,221,1)',  bg: 'rgba(64,204,221,.07)', border: 'rgba(64,204,221,.25)' },
}

function TarotCard({ card, label, colorKey, large = false }) {
  if (!card) return null
  const col = CARD_COLORS[colorKey] || CARD_COLORS.primary

  return (
    <div style={{
      ...S.glass,
      background: col.bg, borderColor: col.border,
      textAlign: 'center', padding: large ? '28px 24px' : '18px 16px',
    }}>
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.25em',
        textTransform: 'uppercase', color: col.main + 'aa', marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: large ? 48 : 36,
        color: col.main, letterSpacing: '.1em', lineHeight: 1, marginBottom: 8,
        textShadow: `0 0 20px ${col.main}44`,
      }}>
        {CARD_SYMBOLS[card.num]}
      </div>
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: large ? 18 : 15,
        color: col.main, letterSpacing: '.12em', marginBottom: 4,
      }}>
        {card.name}
      </div>
      <div style={{
        fontSize: 12, color: 'var(--text2)', fontStyle: 'italic', marginBottom: 10,
      }}>
        {card.archetype}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 5 }}>
        {card.keywords.split(', ').map((kw, i) => (
          <span key={i} style={S.badge(col.bg, col.border, col.main)}>
            {kw}
          </span>
        ))}
      </div>
    </div>
  )
}

function getInterpretation(primary, pair, lifePath) {
  if (!primary) return ''
  let text = `Your soul's journey is anchored by ${primary.name} — ${primary.archetype.toLowerCase()}. `
  text += `You embody the archetypal energy of ${primary.keywords.toLowerCase()}. `
  if (pair) {
    text += `The ${pair.name} appears as your shadow card and complement, bringing ${pair.keywords.toLowerCase()} as the counterforce that deepens and tests your primary archetype. `
    text += `Together, ${primary.name} and ${pair.name} form a complete archetypal pair — teacher and lesson, light and shadow. `
  }
  if (lifePath && lifePath.num !== primary.num) {
    text += `Your Life Path card, ${lifePath.name}, reveals the soul's trajectory through this incarnation — the path of ${lifePath.keywords.toLowerCase()}.`
  }
  return text
}

export default function TarotDetail() {
  const primaryProfile = useAboveInsideStore((s) => s.primaryProfile)

  let result
  if (primaryProfile?.dob) {
    const [y, m, d] = primaryProfile.dob.split('-').map(Number)
    result = getTarotBirthCards({ day: d, month: m, year: y })
  } else {
    result = getTarotBirthCards({ day: 23, month: 1, year: 1981 })
  }

  const { primaryCard, pairCard, lifePathCard, birthNumber, lifePathNumber } = result

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>🃏 Tarot Birth Cards</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>
          Major Arcana soul cards derived from your birth date
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
          <span style={S.badge('rgba(201,168,76,.08)', 'rgba(201,168,76,.2)', 'var(--gold3)')}>
            Birth Number: {birthNumber}
          </span>
          <span style={S.badge('rgba(64,204,221,.08)', 'rgba(64,204,221,.2)', 'rgba(64,204,221,.9)')}>
            Life Path: {lifePathNumber}
          </span>
        </div>
      </div>

      {/* PRIMARY CARD */}
      <div>
        <div style={S.sectionTitle}>Primary Birth Card</div>
        <TarotCard card={primaryCard} label="Your Soul Card" colorKey="primary" large />
      </div>

      {/* PAIR CARD */}
      {pairCard && (
        <div>
          <div style={S.sectionTitle}>Shadow & Complement</div>
          <TarotCard card={pairCard} label="The Complementary Archetype" colorKey="pair" />
          <div style={{ ...S.interpretation, marginTop: 12 }}>
            Birth card pairs are two Major Arcana that share a numerological bond. They represent complementary forces — 
            where your primary card is the conscious archetype you embody, the pair card is its shadow or counterpart, the energy you must integrate.
          </div>
        </div>
      )}

      {/* LIFE PATH CARD */}
      {lifePathCard && lifePathCard.num !== primaryCard?.num && (
        <div>
          <div style={S.sectionTitle}>Life Path Card</div>
          <TarotCard card={lifePathCard} label="The Journey Card" colorKey="lifepath" />
        </div>
      )}

      {/* INTERPRETATION */}
      <div>
        <div style={S.sectionTitle}>Your Tarot Reading</div>
        <div style={S.interpretation}>
          {getInterpretation(primaryCard, pairCard, lifePathCard)}
        </div>
      </div>

      {/* ALL CARDS REFERENCE */}
      <div>
        <div style={S.sectionTitle}>Major Arcana Birth Card Pairs</div>
        <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            [1, 10], [2, 11], [3, 12], [4, 13], [5, 14],
            [6, 15], [7, 16], [8, 17], [9, 18],
          ].map(([a, b]) => {
            const isActive = (primaryCard?.num === a || primaryCard?.num === b)
            return (
              <div key={a} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px',
                borderRadius: 8,
                background: isActive ? 'rgba(201,168,76,.06)' : 'rgba(255,255,255,.02)',
                border: `1px solid ${isActive ? 'rgba(201,168,76,.2)' : 'rgba(255,255,255,.04)'}`,
              }}>
                <span style={{
                  fontFamily: "'Cinzel', serif", fontSize: 10, minWidth: 30, textAlign: 'center',
                  color: isActive ? 'var(--gold)' : 'var(--text3)',
                }}>{CARD_SYMBOLS[a]}</span>
                <span style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 12, flex: 1,
                  color: isActive ? 'var(--gold)' : 'var(--text2)',
                }}>
                  {['The Magician','The High Priestess','The Empress','The Emperor','The Hierophant',
                    'The Lovers','The Chariot','Strength','The Hermit'][a - 1]}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>+</span>
                <span style={{
                  fontFamily: "'Cinzel', serif", fontSize: 10, minWidth: 30, textAlign: 'center',
                  color: isActive ? 'rgba(144,80,224,1)' : 'var(--text3)',
                }}>{CARD_SYMBOLS[b]}</span>
                <span style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 12, flex: 1,
                  color: isActive ? 'rgba(144,80,224,1)' : 'var(--text2)',
                }}>
                  {['Wheel of Fortune','Justice','The Hanged Man','Death','Temperance',
                    'The Devil','The Tower','The Star','The Moon'][b - 10]}
                </span>
              </div>
            )
          })}
          {[19, 20, 21, 22].map(n => {
            const names = { 19: 'The Sun', 20: 'Judgement', 21: 'The World', 22: 'The Fool' }
            const isActive = primaryCard?.num === n
            return (
              <div key={n} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px',
                borderRadius: 8,
                background: isActive ? 'rgba(201,168,76,.06)' : 'rgba(255,255,255,.02)',
                border: `1px solid ${isActive ? 'rgba(201,168,76,.2)' : 'rgba(255,255,255,.04)'}`,
              }}>
                <span style={{
                  fontFamily: "'Cinzel', serif", fontSize: 10, minWidth: 30, textAlign: 'center',
                  color: isActive ? 'var(--gold)' : 'var(--text3)',
                }}>{CARD_SYMBOLS[n]}</span>
                <span style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 12,
                  color: isActive ? 'var(--gold)' : 'var(--text2)',
                }}>{names[n]}</span>
                <span style={{ fontSize: 10, color: 'var(--text3)', fontStyle: 'italic' }}>— stands alone</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
