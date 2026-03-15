import { useMemo } from 'react'
import HumanDesign from '../canvas/HumanDesign'
import { getHDChart } from '../../data/hdData'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'

const CENTERS_DETAIL = [
  { name: 'Head', defined: false, meaning: 'Open to inspiration from many sources, not pressured by fixed mental patterns' },
  { name: 'Ajna', defined: false, meaning: 'Flexible thinking, can see all perspectives but may feel mental pressure' },
  { name: 'Throat', defined: true, meaning: 'Consistent voice and manifestation capacity, natural communicator' },
  { name: 'G/Self', defined: true, meaning: 'Fixed identity and direction, knows who they are and where they are going' },
  { name: 'Heart/Will', defined: false, meaning: 'Not here to prove worth through willpower, free from ego pressure' },
  { name: 'Sacral', defined: false, meaning: 'Projector \u2014 no consistent life force energy, must manage energy wisely' },
  { name: 'Spleen', defined: true, meaning: 'Consistent intuitive awareness, spontaneous knowing, survival instincts grounded in the body' },
  { name: 'Solar Plexus', defined: true, meaning: 'Emotional authority \u2014 rides the wave, never decides in the moment' },
  { name: 'Root', defined: true, meaning: 'Consistent adrenaline pressure, can handle stress without being overwhelmed' },
]

const CHANNELS = [
  { name: 'Channel of The Alpha', gates: '7-31', type: 'Collective', center1: 'G/Self', center2: 'Throat' },
  { name: 'Channel of The Prodigal', gates: '13-33', type: 'Collective', center1: 'G/Self', center2: 'Throat' },
  { name: 'Channel of Synthesis', gates: '19-49', type: 'Tribal', center1: 'Root', center2: 'Solar Plexus' },
  { name: 'Channel of Transformation', gates: '32-54', type: 'Tribal', center1: 'Spleen', center2: 'Root' },
]

const GATES = [
  { num: 41, line: 3, desc: 'Decrease \u2014 Contraction, fantasy, imagination' },
  { num: 31, line: 3, desc: 'Influence \u2014 Leadership, democracy, elected leader' },
  { num: 28, line: 5, desc: 'The Great \u2014 Struggle, game player, risk' },
  { num: 27, line: 5, desc: 'Nourishment \u2014 Caring, altruism, selflessness' },
  { num: 7, line: 4, desc: 'The Army \u2014 Role of the self, direction, leadership' },
  { num: 13, line: 4, desc: 'Fellowship \u2014 Listener, secrets, memory' },
  { num: 33, line: 4, desc: 'Retreat \u2014 Privacy, reflection, spirit' },
  { num: 19, line: 4, desc: 'Approach \u2014 Wanting, sensitivity, need' },
  { num: 49, line: 1, desc: 'Revolution \u2014 Principles, rejection, transformation' },
  { num: 54, line: 1, desc: 'The Marrying Maiden \u2014 Ambition, drive, greed' },
  { num: 32, line: 2, desc: 'Duration \u2014 Continuity, conservation, transformation' },
  { num: 53, line: 4, desc: 'Development \u2014 Starting, initiation, new beginnings' },
  { num: 1, line: 5, desc: 'Self-Expression \u2014 Creative, individual, unique' },
  { num: 46, line: 1, desc: 'Pushing Upward \u2014 Body, serendipity, love of body' },
  { num: 5, line: 1, desc: 'Waiting \u2014 Fixed rhythms, patience, habits' },
  { num: 47, line: 2, desc: 'Oppression \u2014 Realization, mental process, epiphany' },
  { num: 48, line: 1, desc: 'The Well \u2014 Depth, talent, inadequacy' },
  { num: 14, line: 1, desc: 'Possession \u2014 Power skills, direction of resources' },
  { num: 18, line: 1, desc: 'Work on What Has Been Spoilt \u2014 Correction, judgment' },
  { num: 26, line: 5, desc: 'The Taming Power \u2014 Egoist, memory, accumulation' },
  { num: 11, line: 2, desc: 'Peace \u2014 Ideas, harmony, conceptualization' },
]

const CENTER_GLYPHS = {
  Head: '\u2731', Ajna: '\u25C7', Throat: '\u25CE', 'G/Self': '\u2B21',
  'Heart/Will': '\u2665', Sacral: '\u25A3', Spleen: '\u25C6',
  'Solar Plexus': '\u223F', Root: '\u25A0',
}

const TYPE_COLORS = {
  Projector: { bg: 'rgba(201,168,76,.1)', border: 'rgba(201,168,76,.3)', color: 'var(--gold2)' },
  Generator: { bg: 'rgba(212,48,112,.1)', border: 'rgba(240,96,160,.3)', color: 'var(--rose2)' },
  Manifestor: { bg: 'rgba(238,68,68,.1)', border: 'rgba(238,68,68,.3)', color: '#ee5544' },
  Reflector: { bg: 'rgba(144,80,224,.1)', border: 'rgba(144,80,224,.3)', color: 'var(--violet2)' },
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
  keyVal: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.04)',
  },
}

// Center name map: engine key → display name used in CENTERS_DETAIL
const ENGINE_TO_DISPLAY = {
  HEAD: 'Head', AJNA: 'Ajna', THROAT: 'Throat', G_SELF: 'G/Self',
  HEART: 'Heart/Will', SACRAL: 'Sacral', SPLEEN: 'Spleen',
  SOLAR: 'Solar Plexus', ROOT: 'Root'
}

export default function HDDetail() {
  const primaryProfile = useAboveInsideStore(s => s.primaryProfile)

  // Compute HD chart from birth data
  const hdChart = useMemo(() => {
    try {
      const { dob, tob } = primaryProfile
      if (!dob) return null
      const [year, month, day] = dob.split('-').map(Number)
      const [hour, minute] = (tob || '00:00').split(':').map(Number)
      return getHDChart({ day, month, year, hour: hour || 0, minute: minute || 0, lat: -34.6037, lon: -58.3816, timezone: -3 })
    } catch (e) {
      console.warn('HD chart error in detail:', e)
      return null
    }
  }, [primaryProfile])

  // Derive HD_PROFILE from computed chart or fall back to static
  const HD_PROFILE = useMemo(() => {
    if (!hdChart) return {
      type: 'Projector', strategy: 'Wait for the Invitation', authority: 'Emotional - Solar Plexus',
      profile: '3/5 \u2014 Martyr / Heretic', definition: 'Split Definition',
      cross: 'Right Angle Cross of the Unexpected (41/31 | 28/27)',
      notSelf: 'Bitterness', signature: 'Success',
    }
    return {
      type: hdChart.type,
      strategy: hdChart.strategy,
      authority: hdChart.authority,
      profile: `${hdChart.profile}`,
      definition: `${hdChart.definition} Definition`,
      cross: hdChart.cross.name + ` (${hdChart.cross.key.replace('|', ' | ')})`,
      notSelf: hdChart.notSelf,
      signature: hdChart.signature,
    }
  }, [hdChart])

  // Build CENTERS_DETAIL from engine output
  const centersDetail = useMemo(() => {
    if (!hdChart) return CENTERS_DETAIL
    const definedSet = new Set(hdChart.definedCenters)
    return CENTERS_DETAIL.map(c => {
      // Find engine key for this center
      const engineKey = Object.entries(ENGINE_TO_DISPLAY).find(([k, v]) => v === c.name)?.[0]
      return { ...c, defined: engineKey ? definedSet.has(engineKey) : c.defined }
    })
  }, [hdChart])

  // Build CHANNELS from engine output
  const channels = useMemo(() => {
    if (!hdChart) return CHANNELS
    return hdChart.activeChannels.map(key => {
      const existing = CHANNELS.find(ch => ch.gates === key)
      return existing || { name: `Channel ${key}`, gates: key, type: 'Unknown', center1: '', center2: '' }
    })
  }, [hdChart])

  const tc = TYPE_COLORS[HD_PROFILE.type] || TYPE_COLORS.Projector
  const definedCount = centersDetail.filter(c => c.defined).length
  const undefinedCount = centersDetail.length - definedCount

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>{'\u25C8'} Human Design</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>
          Rave Chart body graph analysis -- type, authority, centers, channels, and gates
        </div>
      </div>

      {/* BODY GRAPH VISUALIZATION */}
      <div>
        <div style={S.sectionTitle}>Body Graph</div>
        <div style={{
          ...S.glass, padding: 0, overflow: 'hidden',
          height: 460, position: 'relative',
        }}>
          <HumanDesign />
        </div>
      </div>

      {/* CORE PROFILE */}
      <div>
        <div style={S.sectionTitle}>Core Profile</div>
        <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            ['Type', HD_PROFILE.type],
            ['Strategy', HD_PROFILE.strategy],
            ['Authority', HD_PROFILE.authority],
            ['Profile', HD_PROFILE.profile],
            ['Definition', HD_PROFILE.definition],
            ['Incarnation Cross', HD_PROFILE.cross],
          ].map(([label, val], i) => (
            <div key={i} style={S.keyVal}>
              <span style={{
                fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em',
                textTransform: 'uppercase', color: 'var(--text3)', minWidth: 140,
              }}>{label}</span>
              <span style={{
                ...S.mono, color: i === 0 ? tc.color : 'var(--gold2)',
                textAlign: 'right',
              }}>
                {i === 0
                  ? <span style={{
                      ...S.badge(tc.bg, tc.border, tc.color),
                      fontSize: 10, padding: '4px 14px',
                    }}>{val}</span>
                  : val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SIGNATURE & NOT-SELF */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{
          ...S.glass,
          background: 'rgba(96,176,48,.04)', borderColor: 'rgba(96,176,48,.15)',
          textAlign: 'center', padding: '20px 18px',
        }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(96,176,48,.6)', marginBottom: 6 }}>
            Signature
          </div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: '#88dd44', letterSpacing: '.15em' }}>
            {HD_PROFILE.signature}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6, fontStyle: 'italic' }}>
            The feeling that confirms you are living your design
          </div>
        </div>
        <div style={{
          ...S.glass,
          background: 'rgba(212,48,112,.04)', borderColor: 'rgba(212,48,112,.15)',
          textAlign: 'center', padding: '20px 18px',
        }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(212,48,112,.6)', marginBottom: 6 }}>
            Not-Self Theme
          </div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: 'var(--rose2)', letterSpacing: '.15em' }}>
            {HD_PROFILE.notSelf}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6, fontStyle: 'italic' }}>
            The warning signal that you are off-track
          </div>
        </div>
      </div>

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
          {centersDetail.map((c, i) => (
            <div key={i} style={{
              ...S.row,
              borderColor: c.defined ? 'rgba(201,168,76,.12)' : 'rgba(255,255,255,.04)',
              background: c.defined ? 'rgba(201,168,76,.04)' : 'rgba(255,255,255,.02)',
            }}>
              <span style={{
                fontSize: 20, minWidth: 32, textAlign: 'center',
                color: c.defined ? 'var(--gold)' : 'var(--text3)',
                opacity: c.defined ? 1 : 0.5,
              }}>
                {CENTER_GLYPHS[c.name] || '\u25CB'}
              </span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ ...S.mono, color: c.defined ? 'var(--gold2)' : 'var(--text2)', fontSize: 13 }}>
                    {c.name}
                  </span>
                  <span style={S.badge(
                    c.defined ? 'rgba(201,168,76,.1)' : 'rgba(255,255,255,.04)',
                    c.defined ? 'rgba(201,168,76,.25)' : 'rgba(255,255,255,.08)',
                    c.defined ? 'var(--gold)' : 'var(--text3)',
                  )}>
                    {c.defined ? 'Defined' : 'Undefined'}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  {c.meaning}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHANNELS */}
      <div>
        <div style={S.sectionTitle}>Active Channels</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {channels.map((ch, i) => (
            <div key={i} style={{
              ...S.glass, padding: '12px 16px',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ ...S.mono, color: 'var(--gold2)', fontSize: 13 }}>{ch.name}</span>
                <span style={S.badge(
                  ch.type === 'Individual' ? 'rgba(144,80,224,.1)' : 'rgba(64,204,221,.1)',
                  ch.type === 'Individual' ? 'rgba(144,80,224,.25)' : 'rgba(64,204,221,.25)',
                  ch.type === 'Individual' ? 'var(--violet2)' : 'var(--aqua2)',
                )}>{ch.type}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 16, color: 'var(--gold)',
                  fontWeight: 700, letterSpacing: '.05em',
                }}>{ch.gates}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {ch.center1} {'\u2194'} {ch.center2}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GATES */}
      <div>
        <div style={S.sectionTitle}>Active Gates</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {GATES.map((g, i) => (
            <div key={i} style={{
              ...S.row, flexDirection: 'column', alignItems: 'flex-start', gap: 4,
              padding: '10px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <span style={{
                  fontFamily: "'Cinzel', serif", fontSize: 18, color: 'var(--gold)',
                  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.15)',
                }}>{g.num}</span>
                <span style={{ ...S.monoSm, color: 'var(--text3)', fontSize: 10 }}>
                  Line {g.line}
                </span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.4 }}>{g.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* VARIABLE */}
      <div>
        <div style={S.sectionTitle}>Variable (Cognitive Architecture)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{
            ...S.glass, textAlign: 'center',
            background: 'rgba(204,34,68,.04)', borderColor: 'rgba(204,34,68,.15)',
          }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--design)', marginBottom: 6 }}>
              Design Variable
            </div>
            <div style={{ fontFamily: "'Inconsolata', monospace", fontSize: 28, color: 'var(--design)', letterSpacing: '.2em' }}>
              {HD_PROFILE.variable.design}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
              Passive Right {'\u2192'} Receptive strategic awareness
            </div>
          </div>
          <div style={{
            ...S.glass, textAlign: 'center',
            background: 'rgba(51,68,204,.04)', borderColor: 'rgba(51,68,204,.15)',
          }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--personality)', marginBottom: 6 }}>
              Personality Variable
            </div>
            <div style={{ fontFamily: "'Inconsolata', monospace", fontSize: 28, color: 'var(--personality)', letterSpacing: '.2em' }}>
              {HD_PROFILE.variable.personality}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
              Active Left {'\u2192'} Focused specific processing
            </div>
          </div>
        </div>
      </div>

      {/* READING */}
      <div>
        <div style={S.sectionTitle}>Profile Reading</div>
        <div style={S.interpretation}>
          As a <span style={{ color: 'var(--gold)' }}>3/5 Emotional Projector</span> with Split Definition,
          your life is a journey of experiential learning through trial and error (Line 3) combined with
          an external reputation as a practical problem-solver and heretic (Line 5). Your{' '}
          <span style={{ color: 'var(--rose2)' }}>Emotional Solar Plexus authority</span> means
          that clarity comes in waves -- never trust the highs or the lows, but the calm recognition
          that emerges after the emotional cycle completes. The{' '}
          <span style={{ color: 'var(--gold)' }}>Right Angle Cross of the Unexpected</span> (41/31 | 28/27)
          carries a deeply personal destiny: to discover purpose through crisis and emerge as a leader
          who nourishes others through authentic experience. Your open Head and Ajna centers make you a
          receiver of collective inspiration, while the defined Throat and G center give you a consistent
          and recognizable voice in the world. Wait for the invitation -- your greatest power comes when
          others recognize your gifts and ask for your guidance.
        </div>
      </div>
    </div>
  )
}
