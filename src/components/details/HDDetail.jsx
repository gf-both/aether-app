import { useMemo, useState } from 'react'
import HumanDesign from '../canvas/HumanDesign'
import { useActiveProfile } from '../../hooks/useActiveProfile'
import { computeHDChart } from '../../engines/hdEngine'
import { PLANET_SYMBOLS, PLANET_ORDER } from '../../data/hdData'

/* ─── Fallback static profile (generic — shown only when no birth data is available) ── */
const FALLBACK = {
  type: '—', strategy: '—',
  authority: '—', profile: '—',
  profileNames: '', definition: '—',
  cross: '—',
  notSelf: '—', signature: '—',
  personality: {
    sun: { gate: 41, line: 3 }, earth: { gate: 31, line: 3 },
    moon: { gate: 47, line: 2 }, northNode: { gate: 33, line: 4 },
    southNode: { gate: 19, line: 4 }, mercury: { gate: 49, line: 1 },
    venus: { gate: 54, line: 1 }, mars: { gate: 49, line: 1 },
    jupiter: { gate: 48, line: 1 }, saturn: { gate: 48, line: 1 },
    uranus: { gate: 14, line: 6 }, neptune: { gate: 11, line: 2 },
    pluto: { gate: 32, line: 4 },
  },
  design: {
    sun: { gate: 28, line: 5 }, earth: { gate: 27, line: 5 },
    moon: { gate: 53, line: 4 }, northNode: { gate: 7, line: 4 },
    southNode: { gate: 13, line: 4 }, mercury: { gate: 1, line: 5 },
    venus: { gate: 46, line: 1 }, mars: { gate: 5, line: 1 },
    jupiter: { gate: 46, line: 3 }, saturn: { gate: 18, line: 1 },
    uranus: { gate: 14, line: 1 }, neptune: { gate: 26, line: 5 },
    pluto: { gate: 32, line: 2 },
  },
  centers: {
    HEAD: { defined: false }, AJNA: { defined: false },
    THROAT: { defined: true }, G_SELF: { defined: true },
    HEART: { defined: false }, SACRAL: { defined: false },
    SPLEEN: { defined: true }, SOLAR: { defined: true }, ROOT: { defined: false },
  },
  activeChannels: [],
  designDate: '1980-10-27',
}

/* ─── Planet names for labels ────────────────────────────────────────────── */
const PLANET_NAMES = {
  sun: 'Sun', earth: 'Earth', moon: 'Moon',
  northNode: 'North Node', southNode: 'South Node',
  mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus',
  neptune: 'Neptune', pluto: 'Pluto',
}

/* ─── Gate descriptions ──────────────────────────────────────────────────── */
const GATE_DESCRIPTIONS = {
  41: 'Decrease', 31: 'Influence', 28: 'The Great', 27: 'Nourishment',
  7: 'The Army', 13: 'Fellowship', 33: 'Retreat', 19: 'Approach',
  49: 'Revolution', 54: 'The Marrying Maiden', 32: 'Duration', 53: 'Development',
  1: 'Self-Expression', 46: 'Pushing Upward', 5: 'Waiting', 47: 'Oppression',
  48: 'The Well', 14: 'Possession', 18: 'Work on Spoilt', 26: 'Taming Power',
  11: 'Peace', 57: 'The Gentle', 34: 'Power of the Great', 20: 'Contemplation',
  17: 'Following', 15: 'Modesty', 29: 'The Abysmal', 2: 'The Receptive',
  10: 'Treading', 8: 'Holding Together', 25: 'Innocence', 51: 'The Arousing',
  40: 'Deliverance', 37: 'The Family', 36: 'Darkening of the Light',
  22: 'Grace', 55: 'Abundance', 39: 'Obstruction', 30: 'The Clinging Fire',
  38: 'Opposition', 58: 'The Joyous', 50: 'The Cauldron', 44: 'Coming to Meet',
  43: 'Breakthrough', 24: 'Return', 4: 'Youthful Folly', 63: 'After Completion',
  64: 'Before Completion', 23: 'Splitting Apart', 62: 'Preponderance',
  16: 'Enthusiasm', 35: 'Progress', 12: 'Standstill', 45: 'Gathering Together',
  21: 'Biting Through', 42: 'Increase', 3: 'Difficulty at the Beginning',
  60: 'Limitation', 52: 'Keeping Still', 9: 'Taming Power of the Small',
  59: 'Dispersion', 6: 'Conflict',
}

/* ─── Center info ────────────────────────────────────────────────────────── */
const CENTER_INFO = {
  HEAD:   { name: 'Head',         glyph: '△',  meaning: 'Inspiration & pressure to think' },
  AJNA:   { name: 'Ajna',         glyph: '◇',  meaning: 'Conceptualization & mental processing' },
  THROAT: { name: 'Throat',       glyph: '◎',  meaning: 'Manifestation, communication & action' },
  G_SELF: { name: 'G/Self',       glyph: '⬡',  meaning: 'Identity, love, and direction' },
  HEART:  { name: 'Heart/Will',   glyph: '♥',  meaning: 'Will power, ego & tribal commitments' },
  SACRAL: { name: 'Sacral',       glyph: '▣',  meaning: 'Life force energy & sustainability' },
  SPLEEN: { name: 'Spleen',       glyph: '◆',  meaning: 'Spontaneous awareness & intuition' },
  SOLAR:  { name: 'Solar Plexus', glyph: '∿',  meaning: 'Emotional wave, feelings & sensitivity' },
  ROOT:   { name: 'Root',         glyph: '■',  meaning: 'Adrenaline pressure & drive to complete' },
}

const TYPE_COLORS = {
  Projector:             { bg: 'var(--accent)',   border: 'var(--ring)',   color: '#c9a84c' },
  Generator:             { bg: 'rgba(212,48,112,.1)',   border: 'rgba(240,96,160,.35)',   color: '#f060a0' },
  'Manifesting Generator': { bg: 'rgba(212,48,112,.1)', border: 'rgba(240,96,160,.35)', color: '#f060a0' },
  Manifestor:            { bg: 'rgba(238,68,68,.1)',    border: 'rgba(238,68,68,.35)',    color: '#ee5544' },
  Reflector:             { bg: 'rgba(144,80,224,.1)',   border: 'rgba(144,80,224,.35)',   color: '#9050e0' },
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const DESIGN_COLOR  = '#cc3333'
const PERSON_COLOR  = 'var(--foreground)'

const S = {
  panel: {
    width: '100%', height: '100%', overflowY: 'auto',
    display: 'flex', flexDirection: 'column',
    background: 'var(--card)', color: 'var(--foreground)',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  tabBar: {
    display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,.1)',
    background: 'rgba(0,0,0,.25)', flexShrink: 0,
  },
  tab: (active) => ({
    padding: '12px 20px', cursor: 'pointer', fontSize: 11,
    fontFamily: "'Cinzel', serif", letterSpacing: '.15em', textTransform: 'uppercase',
    color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
    borderBottom: active ? '2px solid var(--foreground)' : '2px solid transparent',
    background: 'transparent', border: 'none', outline: 'none',
    transition: 'color .15s',
  }),
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: 'var(--muted-foreground)', paddingBottom: 8,
    borderBottom: '1px solid var(--accent)', marginBottom: 12,
  },
  glass: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 12, padding: 16, backdropFilter: 'blur(12px)',
  },
  badge: (bg, border, color) => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '2px 8px', borderRadius: 10, fontSize: 8,
    fontFamily: "'Cinzel', serif", letterSpacing: '.08em', textTransform: 'uppercase',
    background: bg, border: `1px solid ${border}`, color,
  }),
}

/* ─── Color-Tone-Base dot row ────────────────────────────────────────────── */
// Each planet row optionally shows color/tone/base as tiny numbered circles.
// We derive them from gate/line as a rough approximation (6 colors, 6 tones, 5 bases).
function getColorToneBase(gate, line) {
  const color = ((gate - 1) % 6) + 1
  const tone  = line
  const base  = ((gate % 5) + 1)
  return { color, tone, base }
}

function CTBDots({ gate, line, side }) {
  const { color, tone, base } = getColorToneBase(gate, line)
  return (
    <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center', marginLeft: side === 'left' ? 4 : 0, marginRight: side === 'right' ? 4 : 0 }}>
      <span title={`Color ${color}`} style={{ width: 14, height: 14, borderRadius: '50%', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontFamily: 'monospace', flexShrink: 0 }}>{color}</span>
      <span title={`Tone ${tone}`}   style={{ width: 14, height: 14, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontFamily: 'monospace', flexShrink: 0 }}>{tone}</span>
      <span title={`Base ${base}`}   style={{ width: 14, height: 14, borderRadius: '50%', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontFamily: 'monospace', flexShrink: 0 }}>{base}</span>
    </span>
  )
}

/* ─── Arrow indicator (▲ ▼ based on line) ────────────────────────────────── */
function LineArrow({ line, color }) {
  // Lines 4-6 point up, lines 1-3 point down (rough convention)
  const arrow = line >= 4 ? '▲' : '▼'
  return <span style={{ fontSize: 9, color, opacity: 0.7 }}>{arrow}</span>
}

/* ─── Planet row for the left (Design) column ────────────────────────────── */
function DesignPlanetRow({ planetKey, planet }) {
  if (!planet) return null
  const sym = PLANET_SYMBOLS[planetKey] || '?'
  const label = `${planet.gate}.${planet.line}`
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0', minWidth: 0 }}>
      <span style={{ fontSize: 16, color: DESIGN_COLOR, minWidth: 18, textAlign: 'center' }}>{sym}</span>
      <span style={{ fontFamily: "'Inconsolata',monospace", fontSize: 12, color: DESIGN_COLOR, fontWeight: 600, minWidth: 36 }}>{label}</span>
      <LineArrow line={planet.line} color={DESIGN_COLOR} />
      <CTBDots gate={planet.gate} line={planet.line} side="left" />
    </div>
  )
}

/* ─── Planet row for the right (Personality) column ──────────────────────── */
function PersonalityPlanetRow({ planetKey, planet }) {
  if (!planet) return null
  const sym = PLANET_SYMBOLS[planetKey] || '?'
  const label = `${planet.gate}.${planet.line}`
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0', justifyContent: 'flex-end', minWidth: 0 }}>
      <CTBDots gate={planet.gate} line={planet.line} side="right" />
      <LineArrow line={planet.line} color={PERSON_COLOR} />
      <span style={{ fontFamily: "'Inconsolata',monospace", fontSize: 12, color: PERSON_COLOR, fontWeight: 600, minWidth: 36, textAlign: 'right' }}>{label}</span>
      <span style={{ fontSize: 16, color: PERSON_COLOR, minWidth: 18, textAlign: 'center' }}>{sym}</span>
    </div>
  )
}

/* ─── RAVECHART TAB ──────────────────────────────────────────────────────── */
function RavechartTab({ chart }) {
  const hd = chart || FALLBACK
  const tc = TYPE_COLORS[hd.type] || TYPE_COLORS.Projector

  return (
    <div style={{ padding: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── DESIGN | BODYGRAPH | PERSONALITY three-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1fr', gap: 0, alignItems: 'start', minHeight: 480, padding: '0 4px' }}>

        {/* LEFT: Design column */}
        <div style={{ padding: '48px 8px 8px 8px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: DESIGN_COLOR, marginBottom: 2 }}>DESIGN</div>
          <div style={{ fontSize: 10, color: DESIGN_COLOR, opacity: 0.7, marginBottom: 12, fontStyle: 'italic' }}>The Unconscious</div>
          {PLANET_ORDER.map(key => (
            <DesignPlanetRow key={key} planetKey={key} planet={hd.design?.[key]} />
          ))}
        </div>

        {/* CENTER: Bodygraph */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden', minHeight: 440 }}>
          <HumanDesign />
        </div>

        {/* RIGHT: Personality column */}
        <div style={{ padding: '48px 8px 8px 8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: PERSON_COLOR, marginBottom: 2 }}>PERSONALITY</div>
          <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginBottom: 12, fontStyle: 'italic' }}>The Conscious</div>
          {PLANET_ORDER.map(key => (
            <PersonalityPlanetRow key={key} planetKey={key} planet={hd.personality?.[key]} />
          ))}
        </div>
      </div>

      {/* ── BOTTOM: Core profile info ── */}
      <div style={{ padding: '0 16px 0 16px', borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!chart ? (
          <div style={{ padding: '16px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>🔮</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>
              Add Birth Data
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
              Enter your birth date, time &amp; location in your profile to unlock your full Human Design chart — Type, Authority, Profile, Definition and more.
            </div>
          </div>
        ) : (
          <>
            {/* Type badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted-foreground)', minWidth: 80 }}>Personality Type</span>
              <span style={{ ...S.badge(tc.bg, tc.border, tc.color), fontSize: 11, padding: '4px 16px', letterSpacing: '.12em' }}>{hd.type}</span>
            </div>

            {/* Profile, Authority, Definition, Strategy */}
            {[
              ['Profile',    hd.profile ? `${hd.profile} — ${hd.profileNames || ''}` : '—'],
              ['Authority',  hd.authority || '—'],
              ['Definition', hd.definition || '—'],
              ['Strategy',   hd.strategy || '—'],
              ['Not-Self',   hd.notSelf || '—'],
              ['Signature',  hd.signature || '—'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted-foreground)', minWidth: 80, paddingTop: 2 }}>{label}</span>
                <span style={{ fontFamily: "'Inconsolata',monospace", fontSize: 12, color: 'var(--foreground)', lineHeight: 1.4 }}>{val}</span>
              </div>
            ))}

            {hd.cross && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted-foreground)', minWidth: 80, paddingTop: 2 }}>Cross</span>
                <span style={{ fontFamily: "'Inconsolata',monospace", fontSize: 11, color: 'var(--muted-foreground)', lineHeight: 1.4 }}>{hd.cross}</span>
              </div>
            )}

            {chart?.designDate && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted-foreground)', minWidth: 80, paddingTop: 2 }}>Design Date</span>
                <span style={{ fontFamily: "'Inconsolata',monospace", fontSize: 11, color: DESIGN_COLOR, lineHeight: 1.4 }}>{chart.designDate}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ─── MECHANICS TAB ──────────────────────────────────────────────────────── */
function MechanicsTab({ chart }) {
  const hd = chart || FALLBACK
  const centers = hd.centers || {}
  const channels = hd.activeChannels || []

  const centerRows = Object.entries(CENTER_INFO).map(([key, info]) => {
    const centerData = centers[key] || { defined: false }
    return { key, ...info, defined: centerData.defined }
  })

  const definedCount = centerRows.filter(c => c.defined).length

  // Group channels by circuit
  const byCircuit = { Individual: [], Tribal: [], Collective: [] }
  channels.forEach(ch => {
    const ckt = ch.circuit || 'Collective'
    if (!byCircuit[ckt]) byCircuit[ckt] = []
    byCircuit[ckt].push(ch)
  })

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* CENTERS */}
      <div>
        <div style={S.sectionTitle}>
          Energy Centers
          <span style={{ float: 'right', fontFamily: "'Inconsolata',monospace", fontSize: 10 }}>
            <span style={{ color: 'var(--foreground)' }}>{definedCount} defined</span>{' / '}
            <span style={{ color: 'var(--muted-foreground)' }}>{centerRows.length - definedCount} undefined</span>
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {centerRows.map((c, i) => (
            <div key={i} style={{
              ...S.glass,
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
              borderColor: c.defined ? 'rgba(201,168,76,.2)' : 'var(--border)',
              background: c.defined ? 'var(--secondary)' : 'var(--secondary)',
            }}>
              <span style={{ fontSize: 22, color: c.defined ? 'var(--foreground)' : 'var(--muted-foreground)', opacity: c.defined ? 1 : 0.4, minWidth: 28, textAlign: 'center' }}>{c.glyph}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontFamily: "'Inconsolata',monospace", fontSize: 12, color: c.defined ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: 600 }}>{c.name}</span>
                  <span style={S.badge(
                    c.defined ? 'var(--accent)' : 'var(--secondary)',
                    c.defined ? 'rgba(201,168,76,.3)'  : 'rgba(255,255,255,.1)',
                    c.defined ? 'var(--foreground)'           : 'var(--muted-foreground)',
                  )}>{c.defined ? 'Defined' : 'Open'}</span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>{c.meaning}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVE CHANNELS */}
      <div>
        <div style={S.sectionTitle}>Active Channels ({channels.length})</div>
        {channels.length === 0
          ? <div style={{ color: 'var(--muted-foreground)', fontStyle: 'italic', fontSize: 13 }}>No channels computed yet</div>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {Object.entries(byCircuit).map(([circuit, chs]) => {
                if (!chs.length) return null
                const circuitColor = circuit === 'Individual' ? 'var(--violet2)' : circuit === 'Tribal' ? 'var(--rose2)' : 'var(--aqua2)'
                const circuitBg = circuit === 'Individual' ? 'rgba(144,80,224,.08)' : circuit === 'Tribal' ? 'rgba(212,48,112,.08)' : 'rgba(64,204,221,.08)'
                const circuitBorder = circuit === 'Individual' ? 'rgba(144,80,224,.2)' : circuit === 'Tribal' ? 'rgba(212,48,112,.2)' : 'rgba(64,204,221,.2)'
                return (
                  <div key={circuit}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: circuitColor, marginBottom: 8 }}>{circuit} Circuit</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {chs.map((ch, i) => (
                        <div key={i} style={{ ...S.glass, padding: '10px 14px', background: circuitBg, borderColor: circuitBorder }}>
                          <div style={{ fontFamily: "'Inconsolata',monospace", fontSize: 13, color: circuitColor, fontWeight: 700, letterSpacing: '.06em', marginBottom: 4 }}>{ch.gates?.join('-') || '?'}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 2 }}>{ch.name}</div>
                          {ch.centers && <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>{ch.centers.join(' ↔ ')}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }
      </div>
    </div>
  )
}

/* ─── VARIABLES & PHS TAB ────────────────────────────────────────────────── */
function VariablesTab({ chart }) {
  const hd = chart || FALLBACK

  // Compute arrows from Design/Personality sun and nodes
  // Design sun arrow (left/right brain) and Personality sun arrow
  // This is a simplified calculation; full PHS requires more data
  const designSun     = hd.design?.sun
  const personalitySun = hd.personality?.sun
  const designNode    = hd.design?.northNode
  const personalityNode = hd.personality?.northNode

  // Arrow direction: even gates → right, odd gates → left (simplified)
  const arrowDir = (p) => p ? (p.gate % 2 === 0 ? '→' : '←') : '–'
  const arrowLabel = (p) => p ? (p.gate % 2 === 0 ? 'Right' : 'Left') : '–'

  const variables = [
    { label: 'Digestion (Design Sun)',       planet: designSun,     arrow: arrowDir(designSun),     side: arrowLabel(designSun) },
    { label: 'Environment (Design Node)',    planet: designNode,    arrow: arrowDir(designNode),    side: arrowLabel(designNode) },
    { label: 'Perspective (P\' Sun)',        planet: personalitySun, arrow: arrowDir(personalitySun), side: arrowLabel(personalitySun) },
    { label: 'Motivation (P\' Node)',        planet: personalityNode, arrow: arrowDir(personalityNode), side: arrowLabel(personalityNode) },
  ]

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={S.sectionTitle}>Primary Health System (PHS)</div>
        <div style={{ ...S.glass, padding: '14px 18px', fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.7 }}>
          PHS is the most advanced level of Human Design, focusing on the four variables
          that optimize your bio-energetic environment, digestion, and perception.
          Full PHS analysis requires advanced chart calculation beyond gate/line positions.
        </div>
      </div>

      <div>
        <div style={S.sectionTitle}>Four Transformations (Variables)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {variables.map((v, i) => (
            <div key={i} style={{ ...S.glass, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted-foreground)', minWidth: 140 }}>{v.label}</span>
              <span style={{ fontFamily: "'Inconsolata',monospace", fontSize: 12, color: 'var(--foreground)', minWidth: 40 }}>
                {v.planet ? `${v.planet.gate}.${v.planet.line}` : '—'}
              </span>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: 'var(--aqua2)', minWidth: 20 }}>{v.arrow}</span>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: 'var(--muted-foreground)' }}>{v.side}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Gates summary */}
      <div>
        <div style={S.sectionTitle}>Active Gates ({chart ? [...new Set([
          ...Object.values(chart.personality).map(p => p.gate),
          ...Object.values(chart.design).map(p => p.gate),
        ])].length : 0})</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {chart && [...new Set([
            ...Object.values(chart.personality).map(p => p.gate),
            ...Object.values(chart.design).map(p => p.gate),
          ])].sort((a, b) => a - b).map(gate => {
            const isPerson = Object.values(chart.personality).some(p => p.gate === gate)
            const isDesign  = Object.values(chart.design).some(p => p.gate === gate)
            const color = (isPerson && isDesign) ? 'var(--foreground)' : isPerson ? PERSON_COLOR : DESIGN_COLOR
            return (
              <div key={gate} style={{
                padding: '6px 10px', borderRadius: 8, border: `1px solid ${(isPerson && isDesign) ? 'rgba(201,168,76,.3)' : isPerson ? 'rgba(255,255,255,.12)' : 'rgba(204,51,51,.3)'}`,
                background: (isPerson && isDesign) ? 'rgba(201,168,76,.06)' : isPerson ? 'var(--secondary)' : 'rgba(204,51,51,.05)',
              }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, color, textAlign: 'center' }}>{gate}</div>
                <div style={{ fontFamily: "'Inconsolata',monospace", fontSize: 9, color: 'var(--muted-foreground)', textAlign: 'center', marginTop: 2 }}>{GATE_DESCRIPTIONS[gate] || `Gate ${gate}`}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function HDDetail() {
  const [activeTab, setActiveTab] = useState('ravechart')
  const profile = useActiveProfile()

  const chart = useMemo(() => {
    try {
      const { dob, tob } = profile
      if (!dob) return null
      return computeHDChart({ dateOfBirth: dob, timeOfBirth: tob || '00:00', utcOffset: profile.birthTimezone ?? -3 })
    } catch (e) {
      console.error('HDDetail chart error:', e)
      return null
    }
  }, [profile])

  const TABS = [
    { id: 'ravechart',   label: 'Ravechart' },
    { id: 'mechanics',   label: 'Mechanics' },
    { id: 'variables',   label: 'Variables & PHS' },
  ]

  return (
    <div style={S.panel}>
      {/* TAB BAR */}
      <div style={S.tabBar}>
        {TABS.map(t => (
          <button key={t.id} style={S.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'ravechart'  && <RavechartTab chart={chart} />}
      {activeTab === 'mechanics'  && <MechanicsTab chart={chart} />}
      {activeTab === 'variables'  && <VariablesTab chart={chart} />}
    </div>
  )
}
