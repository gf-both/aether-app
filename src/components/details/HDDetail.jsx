import { useMemo } from 'react'
import HumanDesign from '../canvas/HumanDesign'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { computeHDChart } from '../../engines/hdEngine'
import { PLANET_SYMBOLS, PLANET_ORDER } from '../../data/hdData'

// ── Fallback static profile (used if engine fails) ─────────────────────────
const FALLBACK_PROFILE = {
  type: 'Projector', strategy: 'Wait for the Invitation', authority: 'Emotional - Solar Plexus',
  profile: '3/5', profileNames: 'Martyr / Heretic', definition: 'Split Definition',
  cross: 'Right Angle Cross of the Unexpected (41/31 | 28/27)',
  notSelf: 'Bitterness', signature: 'Success',
}

const GATE_DESCRIPTIONS = {
  41: 'Decrease — Contraction, fantasy, imagination',
  31: 'Influence — Leadership, democracy, elected leader',
  28: 'The Great — Struggle, game player, risk',
  27: 'Nourishment — Caring, altruism, selflessness',
  7:  'The Army — Role of the self, direction, leadership',
  13: 'Fellowship — Listener, secrets, memory',
  33: 'Retreat — Privacy, reflection, spirit',
  19: 'Approach — Wanting, sensitivity, need',
  49: 'Revolution — Principles, rejection, transformation',
  54: 'The Marrying Maiden — Ambition, drive, greed',
  32: 'Duration — Continuity, conservation, transformation',
  53: 'Development — Starting, initiation, new beginnings',
  1:  'Self-Expression — Creative, individual, unique',
  46: 'Pushing Upward — Body, serendipity, love of body',
  5:  'Waiting — Fixed rhythms, patience, habits',
  47: 'Oppression — Realization, mental process, epiphany',
  48: 'The Well — Depth, talent, inadequacy',
  14: 'Possession — Power skills, direction of resources',
  18: 'Work on What Has Been Spoilt — Correction, judgment',
  26: 'The Taming Power — Egoist, memory, accumulation',
  11: 'Peace — Ideas, harmony, conceptualization',
  57: 'The Gentle — Intuition, instinct, clarity',
  34: 'The Power of the Great — Power, strength, energy',
  20: 'Contemplation — Now, awareness, presence',
  17: 'Following — Opinions, organization, opinionated',
  15: 'Modesty — Extremes, love of humanity, flow',
  29: 'The Abysmal — Yes, commitment, perseverance',
  2:  'The Receptive — Direction, higher self, receptivity',
  10: 'Treading — Behaviour, love of self, journey',
  8:  'Holding Together — Contribution, individual, role model',
  25: 'Innocence — Spirit, universal love, universalizing',
  51: 'The Arousing — Shock, initiative, competition',
  40: 'Deliverance — Aloneness, desire, work',
  37: 'The Family — Friendship, equality, community',
  36: 'The Darkening of the Light — Crisis, inexperience, sensitivity',
  22: 'Grace — Openness, social being, emotional expression',
  55: 'Abundance — Spirit, mood, freedom',
  39: 'Obstruction — Provocation, pressure, optimism',
  30: 'The Clinging Fire — Recognition, desire, feelings',
  38: 'Opposition — Fighter, struggle, perseverance',
  58: 'The Joyous — Vitality, aliveness, joy',
  50: 'The Cauldron — Values, responsibility, nurturing',
  44: 'Coming to Meet — Alertness, memory, patterns',
  43: 'Breakthrough — Insight, knowing, individuality',
  24: 'Return — Rationalization, returning, mental renewal',
  4:  'Youthful Folly — Formulization, logic, answers',
  63: 'After Completion — Doubt, questions, completion',
  64: 'Before Completion — Confusion, cycles, transition',
  23: 'Splitting Apart — Assimilation, mutation, fringe',
  62: 'Preponderance of the Small — Detail, precision, small steps',
  16: 'Enthusiasm — Talents, skills, zeal',
  35: 'Progress — Experience, change, hunger',
  12: 'Standstill — Caution, social spirit, articulation',
  45: 'Gathering Together — Ruler, tribe, community',
  21: 'Biting Through — Control, hunter, self-regulation',
  42: 'Increase — Growth, expansion, maturation',
  3:  'Difficulty at the Beginning — Innovation, mutation, chaos',
  60: 'Limitation — Acceptance, mutation, stillness',
  52: 'Keeping Still (Mountain) — Stillness, concentration, inaction',
  9:  'The Taming Power of the Small — Focus, determination, details',
  59: 'Dispersion — Sexuality, openness, breaking down barriers',
  6:  'Conflict — Friction, bonding, intimacy',
}

const CENTER_MEANINGS = {
  HEAD:   'Inspiration and pressure to think — the source of mental inquiry',
  AJNA:   'Conceptualization and mental processing — fixed ways of thinking',
  THROAT: 'Manifestation, communication, and action — the center of expression',
  'G/SELF': 'Identity, love, and direction — the magnetic core of the self',
  HEART:  'Will power, ego, and tribal commitments — the seat of courage',
  SACRAL: 'Life force energy, sexuality, and sustainability — generator power',
  SPLEEN: 'Spontaneous awareness, immune system, intuition, and survival instincts',
  SOLAR:  'Emotional wave, feelings, and sensitivity — the source of emotional clarity',
  ROOT:   'Adrenaline pressure, stress, and the drive to complete — root force',
}

const CENTER_DISPLAY_NAMES = {
  HEAD: 'Head', AJNA: 'Ajna', THROAT: 'Throat', G_SELF: 'G/Self',
  HEART: 'Heart/Will', SACRAL: 'Sacral', SPLEEN: 'Spleen', SOLAR: 'Solar Plexus', ROOT: 'Root',
}

const TYPE_COLORS = {
  Projector:             { bg: 'rgba(201,168,76,.1)',   border: 'rgba(201,168,76,.3)',   color: 'var(--gold2)' },
  Generator:             { bg: 'rgba(212,48,112,.1)',   border: 'rgba(240,96,160,.3)',   color: 'var(--rose2)' },
  'Manifesting Generator': { bg: 'rgba(212,48,112,.1)', border: 'rgba(240,96,160,.3)', color: 'var(--rose2)' },
  Manifestor:            { bg: 'rgba(238,68,68,.1)',    border: 'rgba(238,68,68,.3)',    color: '#ee5544' },
  Reflector:             { bg: 'rgba(144,80,224,.1)',   border: 'rgba(144,80,224,.3)',   color: 'var(--violet2)' },
}

const CENTER_GLYPHS = {
  Head: '✱', Ajna: '◇', Throat: '◎', 'G/Self': '⬡',
  'Heart/Will': '♥', Sacral: '▣', Spleen: '◆', 'Solar Plexus': '∿', Root: '■',
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
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
  heading: { fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 600, letterSpacing: '.18em', color: 'var(--gold)', marginBottom: 4 },
  mono:   { fontFamily: "'Inconsolata', monospace", fontSize: 12, fontWeight: 500, color: 'var(--text)' },
  monoSm: { fontFamily: "'Inconsolata', monospace", fontSize: 11, color: 'var(--text2)' },
  row: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
    borderRadius: 8, background: 'var(--row-bg)', border: '1px solid var(--row-border)',
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
  keyVal: { display: 'flex', alignItems: 'center', gap: 16, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.04)' },
}

export default function HDDetail() {
  const primaryProfile = useAboveInsideStore(s => s.primaryProfile)

  const chart = useMemo(() => {
    try {
      const { dob, tob } = primaryProfile
      if (!dob) return null
      return computeHDChart({ dateOfBirth: dob, timeOfBirth: tob || '00:00', utcOffset: -3 })
    } catch (e) {
      console.error('HDDetail chart error:', e)
      return null
    }
  }, [primaryProfile])

  const hd = chart || FALLBACK_PROFILE
  const tc = TYPE_COLORS[hd.type] || TYPE_COLORS.Projector

  // Build centers list from engine output
  const centersDisplay = chart
    ? Object.entries(chart.centers).map(([key, val]) => ({
        key,
        name: CENTER_DISPLAY_NAMES[key] || key,
        defined: val.defined,
        meaning: CENTER_MEANINGS[key] || CENTER_MEANINGS[CENTER_DISPLAY_NAMES[key] || key] || '',
      }))
    : Object.keys(CENTER_MEANINGS).map(k => ({
        key: k, name: CENTER_DISPLAY_NAMES[k] || k, defined: false, meaning: CENTER_MEANINGS[k],
      }))

  const definedCount   = centersDisplay.filter(c => c.defined).length
  const undefinedCount = centersDisplay.length - definedCount

  // Active channels from engine
  const channelsDisplay = chart
    ? chart.activeChannels.map(ch => ({
        name: ch.name,
        gates: ch.gates.join('-'),
        type: ch.circuit || 'Collective',
        center1: CENTER_DISPLAY_NAMES[ch.centers[0]] || ch.centers[0],
        center2: CENTER_DISPLAY_NAMES[ch.centers[1]] || ch.centers[1],
      }))
    : []

  // Active gates from both personality and design
  const allGates = chart
    ? Array.from(new Set([
        ...Object.values(chart.personality),
        ...Object.values(chart.design),
      ].map(p => p.gate))).sort((a, b) => a - b)
    : []

  // Profile string for display
  const profileDisplay = chart
    ? `${chart.profile} — ${chart.profileNames}`
    : '3/5 — Martyr / Heretic'

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>◈ Human Design</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>
          Rave Chart body graph analysis — type, authority, centers, channels, and gates
          {chart && <span style={{ color: 'var(--text3)', marginLeft: 8, fontSize: 11 }}>
            · Design date: {chart.designDate}
          </span>}
        </div>
      </div>

      {/* BODY GRAPH */}
      <div>
        <div style={S.sectionTitle}>Body Graph</div>
        <div style={{ ...S.glass, padding: 0, overflow: 'hidden', height: 460, position: 'relative' }}>
          <HumanDesign />
        </div>
      </div>

      {/* CORE PROFILE */}
      <div>
        <div style={S.sectionTitle}>Core Profile</div>
        <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            ['Type',             hd.type],
            ['Strategy',         hd.strategy],
            ['Authority',        hd.authority],
            ['Profile',          profileDisplay],
            ['Definition',       hd.definition],
            ['Incarnation Cross', hd.cross],
          ].map(([label, val], i) => (
            <div key={i} style={S.keyVal}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text3)', minWidth: 140 }}>
                {label}
              </span>
              <span style={{ ...S.mono, color: i === 0 ? tc.color : 'var(--gold2)', textAlign: 'right' }}>
                {i === 0
                  ? <span style={{ ...S.badge(tc.bg, tc.border, tc.color), fontSize: 10, padding: '4px 14px' }}>{val}</span>
                  : val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SIGNATURE & NOT-SELF */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ ...S.glass, background: 'rgba(96,176,48,.04)', borderColor: 'rgba(96,176,48,.15)', textAlign: 'center', padding: '20px 18px' }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(96,176,48,.6)', marginBottom: 6 }}>Signature</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: '#88dd44', letterSpacing: '.15em' }}>{hd.signature}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6, fontStyle: 'italic' }}>The feeling that confirms you are living your design</div>
        </div>
        <div style={{ ...S.glass, background: 'rgba(212,48,112,.04)', borderColor: 'rgba(212,48,112,.15)', textAlign: 'center', padding: '20px 18px' }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(212,48,112,.6)', marginBottom: 6 }}>Not-Self Theme</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: 'var(--rose2)', letterSpacing: '.15em' }}>{hd.notSelf}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6, fontStyle: 'italic' }}>The warning signal that you are off-track</div>
        </div>
      </div>

      {/* PLANET TABLES */}
      {chart && (
        <div>
          <div style={S.sectionTitle}>Planetary Activations</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['Personality (Conscious)', chart.personality, 'var(--personality)'], ['Design (Unconscious)', chart.design, 'var(--design)']].map(([title, planets, color]) => (
              <div key={title} style={S.glass}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase', color, marginBottom: 12 }}>{title}</div>
                {PLANET_ORDER.map(key => {
                  const p = planets[key]
                  if (!p) return null
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                      <span style={{ width: 20, textAlign: 'center', fontSize: 14, color }}>{PLANET_SYMBOLS[key]}</span>
                      <span style={{ ...S.monoSm, color, fontWeight: 600, minWidth: 40 }}>{p.gate}.{p.line}</span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CENTERS */}
      <div>
        <div style={S.sectionTitle}>
          Energy Centers
          <span style={{ float: 'right', fontFamily: "'Inconsolata', monospace", fontSize: 10 }}>
            <span style={{ color: 'var(--gold)' }}>{definedCount} defined</span>
            {' / '}
            <span style={{ color: 'var(--text3)' }}>{undefinedCount} undefined</span>
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {centersDisplay.map((c, i) => (
            <div key={i} style={{ ...S.row, borderColor: c.defined ? 'rgba(201,168,76,.12)' : 'rgba(255,255,255,.04)', background: c.defined ? 'rgba(201,168,76,.04)' : 'rgba(255,255,255,.02)' }}>
              <span style={{ fontSize: 20, minWidth: 32, textAlign: 'center', color: c.defined ? 'var(--gold)' : 'var(--text3)', opacity: c.defined ? 1 : 0.5 }}>
                {CENTER_GLYPHS[c.name] || '○'}
              </span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ ...S.mono, color: c.defined ? 'var(--gold2)' : 'var(--text2)', fontSize: 13 }}>{c.name}</span>
                  <span style={S.badge(
                    c.defined ? 'rgba(201,168,76,.1)' : 'rgba(255,255,255,.04)',
                    c.defined ? 'rgba(201,168,76,.25)' : 'rgba(255,255,255,.08)',
                    c.defined ? 'var(--gold)' : 'var(--text3)',
                  )}>{c.defined ? 'Defined' : 'Undefined'}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.4 }}>{c.meaning}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHANNELS */}
      <div>
        <div style={S.sectionTitle}>Active Channels</div>
        {channelsDisplay.length === 0
          ? <div style={{ color: 'var(--text3)', fontStyle: 'italic', fontSize: 13 }}>No chart computed</div>
          : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {channelsDisplay.map((ch, i) => (
              <div key={i} style={{ ...S.glass, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...S.mono, color: 'var(--gold2)', fontSize: 13 }}>{ch.name}</span>
                  <span style={S.badge(
                    ch.type === 'Individual' ? 'rgba(144,80,224,.1)' : 'rgba(64,204,221,.1)',
                    ch.type === 'Individual' ? 'rgba(144,80,224,.25)' : 'rgba(64,204,221,.25)',
                    ch.type === 'Individual' ? 'var(--violet2)' : 'var(--aqua2)',
                  )}>{ch.type}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: "'Inconsolata', monospace", fontSize: 16, color: 'var(--gold)', fontWeight: 700, letterSpacing: '.05em' }}>{ch.gates}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{ch.center1} ↔ {ch.center2}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GATES */}
      <div>
        <div style={S.sectionTitle}>Active Gates</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {allGates.map(gNum => {
            const pGate = Object.values(chart?.personality || {}).find(p => p.gate === gNum)
            const dGate = Object.values(chart?.design || {}).find(p => p.gate === gNum)
            const line = pGate?.line || dGate?.line || 1
            const desc = GATE_DESCRIPTIONS[gNum] || `Gate ${gNum}`
            return (
              <div key={gNum} style={{ ...S.row, flexDirection: 'column', alignItems: 'flex-start', gap: 4, padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: 'var(--gold)', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.15)' }}>{gNum}</span>
                  <span style={{ ...S.monoSm, color: 'var(--text3)', fontSize: 10 }}>Line {line}</span>
                  {pGate && <span style={{ ...S.badge('rgba(51,68,204,.15)', 'rgba(51,68,204,.3)', 'var(--personality)'), fontSize: 7 }}>P</span>}
                  {dGate && <span style={{ ...S.badge('rgba(204,34,68,.15)', 'rgba(204,34,68,.3)', 'var(--design)'), fontSize: 7 }}>D</span>}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.4 }}>{desc}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* READING */}
      <div>
        <div style={S.sectionTitle}>Profile Reading</div>
        <div style={S.interpretation}>
          As a <span style={{ color: 'var(--gold)' }}>{hd.profile} {hd.type}</span>{hd.profileNames ? ` (${hd.profileNames})` : ''} with {hd.definition},
          your life is shaped by the unique configuration of your defined centers and channels.
          Your <span style={{ color: 'var(--rose2)' }}>{hd.authority} authority</span> guides your decision-making process.
          {hd.cross && <span> The <span style={{ color: 'var(--gold)' }}>{hd.cross}</span> carries your soul's purpose in this lifetime.</span>}
          {' '}Your signature is <span style={{ color: '#88dd44' }}>{hd.signature}</span> — the feeling that confirms alignment — while{' '}
          <span style={{ color: 'var(--rose2)' }}>{hd.notSelf}</span> signals you are off-track.
          Strategy: <span style={{ color: 'var(--aqua2)' }}>{hd.strategy}</span>.
        </div>
      </div>
    </div>
  )
}
