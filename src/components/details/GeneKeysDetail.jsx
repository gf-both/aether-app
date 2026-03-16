import { useMemo } from 'react'
import { GK_LIST, computeGeneKeysData } from '../../data/geneKeysData'
import GeneKeysWheel from '../canvas/GeneKeysWheel'
import { useActiveProfile } from '../../hooks/useActiveProfile'
// computeGeneKeysData can be called with custom birth params to derive a live profile

const GK_DETAIL_STATIC = [
  {
    num: 41, sphere: "Life's Work", line: 3,
    shadow: { name: 'Fantasy', desc: 'Lost in dreams, unable to ground visions into reality' },
    gift: { name: 'Anticipation', desc: 'Healthy expectation that life will deliver its promises' },
    siddhi: { name: 'Emanation', desc: 'Pure creative force flowing through without personal agenda' },
    iching: 'Decrease \u2014 The contraction before the next expansion',
    contemplation: 'Where in your life are you still living in fantasy rather than grounded anticipation?',
  },
  {
    num: 31, sphere: 'Evolution', line: 3,
    shadow: { name: 'Arrogance', desc: 'Need to be right, intellectual superiority' },
    gift: { name: 'Leadership', desc: 'Natural democratic leadership through humility' },
    siddhi: { name: 'Humility', desc: 'Complete absence of the need for recognition' },
    iching: 'Influence \u2014 Leading through attraction, not force',
    contemplation: 'How does your need to lead prevent you from truly listening?',
  },
  {
    num: 28, sphere: 'Radiance', line: 5,
    shadow: { name: 'Purposelessness', desc: 'Fear of death, meaninglessness, existential anxiety' },
    gift: { name: 'Totality', desc: 'Living fully in each moment, embracing life completely' },
    siddhi: { name: 'Immortality', desc: 'Transcendence of the fear of death through total presence' },
    iching: 'Preponderance of the Great \u2014 Taking great risks for great purpose',
    contemplation: 'What would you do if you knew you could not fail and had nothing to lose?',
  },
  {
    num: 27, sphere: 'Purpose', line: 5,
    shadow: { name: 'Selfishness', desc: 'Caring only for personal needs, hoarding resources' },
    gift: { name: 'Altruism', desc: 'Natural generosity, caring for others without agenda' },
    siddhi: { name: 'Selflessness', desc: 'Complete dissolution of personal agenda in service' },
    iching: 'Nourishment \u2014 The art of nourishing all beings',
    contemplation: 'Where does your generosity have a hidden string attached?',
  },
]

const SPHERE_COLORS = {
  "Life's Work": '#50b4dc',
  'Evolution': '#dc5050',
  'Radiance': '#dc5050',
  'Purpose': '#dc5050',
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

function SpectrumBar({ shadow, gift, siddhi, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, height: 8, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ flex: 1, height: '100%', background: 'rgba(220,60,60,.5)', borderRadius: '4px 0 0 4px' }} />
        <div style={{ flex: 1, height: '100%', background: color + '88' }} />
        <div style={{ flex: 1, height: '100%', background: 'rgba(201,168,76,.6)', borderRadius: '0 4px 4px 0' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: '#dc6060' }}>Shadow: {shadow}</span>
        <span style={{ fontSize: 10, color: color }}>{'\u2192'} Gift: {gift}</span>
        <span style={{ fontSize: 10, color: 'var(--foreground)' }}>{'\u2192'} Siddhi: {siddhi}</span>
      </div>
    </div>
  )
}

export default function GeneKeysDetail() {
  const profile = useActiveProfile()

  const profileData = useMemo(() => {
    if (!profile?.dob) return null
    try {
      const [year, month, day] = profile.dob.split('-').map(Number)
      const tob = profile.tob || '12:00'
      const [hour, minute] = tob.split(':').map(Number)
      const timezone = profile.birthTimezone ?? -3
      return computeGeneKeysData({ day, month, year, hour: hour || 12, minute: minute || 0, timezone })
    } catch (e) {
      console.error('GeneKeysDetail error:', e)
      return null
    }
  }, [profile?.dob, profile?.tob, profile?.birthTimezone])

  // Dynamic GK data from computed profile (falls back to static for missing keys)
  const GK_DATA = useMemo(() => {
    if (!profileData?.SPHERES) return null

    // Map computed spheres to the full GK_DETAIL_STATIC lookup
    return profileData.SPHERES
      .filter(s => !s.center)
      .map(s => {
        const staticEntry = GK_DETAIL_STATIC.find(d => d.num === s.key)
        return staticEntry
          ? { ...staticEntry, num: s.key, sphere: s.role, line: s.line }
          : {
              num: s.key,
              sphere: s.role || 'Key',
              line: s.line,
              shadow: { name: '\u2014', desc: 'Shadow state \u2014 unconscious pattern' },
              gift: { name: s.gift || '\u2014', desc: 'Gift state \u2014 awakened potential' },
              siddhi: { name: s.siddhi || '\u2014', desc: 'Highest expression' },
              iching: `Gate ${s.key}`,
              contemplation: `Contemplate the shadow and gift of Gate ${s.key}.`,
            }
      })
  }, [profileData])

  const activeGKData = GK_DATA || GK_DETAIL_STATIC // fallback to static if not computed

  const SEQUENCES = useMemo(() => {
    if (!profileData?.SPHERES) return [
      { label: 'Activation', desc: 'The awakening sequence', keys: GK_DETAIL_STATIC.map(d => d.num) },
      { label: 'Venus', desc: 'The love sequence revealing your relationship patterns', keys: GK_DETAIL_STATIC.slice(0, 2).map(d => d.num) },
      { label: 'Pearl', desc: 'The prosperity sequence connecting purpose to abundance', keys: GK_DETAIL_STATIC.slice(2).map(d => d.num) },
    ]
    const keys = profileData.SPHERES.filter(s => !s.center).map(s => s.key)
    return [
      { label: 'Activation', desc: 'The awakening sequence that initiates your journey through the Gene Keys', keys },
      { label: 'Venus', desc: 'The love sequence revealing your relationship patterns', keys: keys.slice(0, 2) },
      { label: 'Pearl', desc: 'The prosperity sequence connecting purpose to abundance', keys: keys.slice(2) },
    ]
  }, [profileData])

  // Empty state — no birth date
  if (!profile?.dob) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: .5, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40 }}>⬡</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--gold)' }}>Add birth date to see your Gene Keys</div>
      </div>
    )
  }

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>{'\u2B21'} Gene Keys</div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          Hologenetic Profile -- activation sequence, shadow/gift/siddhi spectrums, and contemplation
        </div>
      </div>

      {/* HOLOGENETIC WHEEL VISUALIZATION */}
      <div>
        <div style={S.sectionTitle}>Hologenetic Wheel</div>
        <div style={{
          ...S.glass, padding: 0, overflow: 'hidden',
          height: 360, position: 'relative',
        }}>
          <GeneKeysWheel />
        </div>
      </div>

      {/* HOLOGENETIC PROFILE OVERVIEW */}
      <div>
        <div style={S.sectionTitle}>Hologenetic Profile</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {activeGKData.map((gk, i) => {
            const color = SPHERE_COLORS[gk.sphere] || '#40ccdd'
            return (
              <div key={i} style={{
                ...S.glass, textAlign: 'center', padding: '20px 14px',
                borderColor: color + '22',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em',
                  textTransform: 'uppercase', color: color + 'aa',
                }}>{gk.sphere}</div>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: color + '0c', border: `2px solid ${color}44`,
                  fontFamily: "'Cinzel', serif", fontSize: 24, color,
                  fontWeight: 600, position: 'relative',
                }}>
                  {gk.num}
                  <div style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'var(--card)', border: '1px solid ' + color + '44',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Inconsolata', monospace", fontSize: 10, color: 'var(--muted-foreground)',
                  }}>
                    .{gk.line}
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Inconsolata', monospace", fontSize: 10, color: 'var(--muted-foreground)',
                }}>Line {gk.line}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* DETAILED KEY PROFILES */}
      <div>
        <div style={S.sectionTitle}>Gene Key Profiles</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeGKData.map((gk, i) => {
            const color = SPHERE_COLORS[gk.sphere] || '#40ccdd'
            return (
              <div key={i} style={{
                ...S.glass, padding: '20px 22px',
                borderColor: color + '18',
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: color + '0c', border: `2px solid ${color}33`,
                    fontFamily: "'Cinzel', serif", fontSize: 22, color, fontWeight: 600,
                    flexShrink: 0,
                  }}>{gk.num}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Cinzel', serif", fontSize: 14, letterSpacing: '.1em', color,
                    }}>Gene Key {gk.num} -- {gk.sphere}</div>
                    <div style={{ ...S.monoSm, fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2 }}>
                      Line {gk.line} {'\u00B7'} {gk.iching}
                    </div>
                  </div>
                </div>

                {/* Spectrum Bar */}
                <SpectrumBar
                  shadow={gk.shadow.name}
                  gift={gk.gift.name}
                  siddhi={gk.siddhi.name}
                  color={color}
                />

                {/* Three levels */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <div style={{
                    padding: '10px 12px', borderRadius: 8,
                    background: 'rgba(220,60,60,.04)', border: '1px solid rgba(220,60,60,.12)',
                  }}>
                    <div style={{
                      fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.15em',
                      textTransform: 'uppercase', color: '#dc6060', marginBottom: 4,
                    }}>Shadow</div>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: '#dc6060', marginBottom: 4 }}>
                      {gk.shadow.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>
                      {gk.shadow.desc}
                    </div>
                  </div>
                  <div style={{
                    padding: '10px 12px', borderRadius: 8,
                    background: color + '06', border: '1px solid ' + color + '18',
                  }}>
                    <div style={{
                      fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.15em',
                      textTransform: 'uppercase', color, marginBottom: 4,
                    }}>Gift</div>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color, marginBottom: 4 }}>
                      {gk.gift.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>
                      {gk.gift.desc}
                    </div>
                  </div>
                  <div style={{
                    padding: '10px 12px', borderRadius: 8,
                    background: 'var(--secondary)', border: '1px solid var(--accent)',
                  }}>
                    <div style={{
                      fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.15em',
                      textTransform: 'uppercase', color: 'var(--foreground)', marginBottom: 4,
                    }}>Siddhi</div>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: 'var(--foreground)', marginBottom: 4 }}>
                      {gk.siddhi.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>
                      {gk.siddhi.desc}
                    </div>
                  </div>
                </div>

                {/* I-Ching */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                  background: 'var(--secondary)', borderRadius: 6,
                  border: '1px solid var(--secondary)',
                }}>
                  <span style={{ fontSize: 18 }}>{'\u2630'}</span>
                  <div>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
                      I-Ching Hexagram
                    </div>
                    <div style={{ ...S.mono, color: 'var(--muted-foreground)', fontSize: 12 }}>{gk.iching}</div>
                  </div>
                </div>

                {/* Contemplation */}
                <div style={{
                  padding: '12px 16px', borderRadius: 8,
                  background: 'rgba(144,80,224,.04)', border: '1px solid rgba(144,80,224,.12)',
                }}>
                  <div style={{
                    fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.15em',
                    textTransform: 'uppercase', color: 'var(--violet2)', marginBottom: 6,
                  }}>Contemplation Prompt</div>
                  <div style={{ fontSize: 13, color: 'var(--violet2)', fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{gk.contemplation}"
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ACTIVATION SEQUENCE */}
      <div>
        <div style={S.sectionTitle}>The Activation Sequence</div>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
          {activeGKData.map((gk, i) => {
            const color = SPHERE_COLORS[gk.sphere] || '#40ccdd'
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{
                  flex: 1, textAlign: 'center',
                  padding: '16px 8px',
                  background: color + '06', border: '1px solid ' + color + '18',
                  borderRadius: i === 0 ? '10px 0 0 10px' : i === activeGKData.length - 1 ? '0 10px 10px 0' : '0',
                  borderLeft: i === 0 ? undefined : 'none',
                }}>
                  <div style={{
                    fontFamily: "'Cinzel', serif", fontSize: 7, letterSpacing: '.2em',
                    textTransform: 'uppercase', color: color + 'aa', marginBottom: 6,
                  }}>{gk.sphere}</div>
                  <div style={{
                    fontFamily: "'Cinzel', serif", fontSize: 20, color, fontWeight: 600,
                  }}>{gk.num}</div>
                  <div style={{
                    fontSize: 10, color: 'var(--muted-foreground)', marginTop: 4,
                  }}>{gk.gift.name}</div>
                </div>
                {i < activeGKData.length - 1 && (
                  <div style={{
                    fontSize: 16, color: 'var(--muted-foreground)', padding: '0 2px',
                    zIndex: 1, position: 'relative',
                  }}>{'\u2192'}</div>
                )}
              </div>
            )
          })}
        </div>
        <div style={{
          marginTop: 12, fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic',
          textAlign: 'center', lineHeight: 1.5,
        }}>
          The Activation Sequence traces the path from Life's Work through Evolution and Radiance to Purpose,
          revealing how your deepest gifts unfold through life experience.
        </div>
      </div>

      {/* SEQUENCES */}
      <div>
        <div style={S.sectionTitle}>The Three Sequences</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {SEQUENCES.map((seq, i) => {
            const colors = ['#50b4dc', '#d43070', '#f0c040']
            return (
              <div key={i} style={{
                ...S.glass, textAlign: 'center', padding: '18px 14px',
                borderColor: colors[i] + '18',
              }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '.12em',
                  color: colors[i], marginBottom: 6,
                }}>{seq.label} Sequence</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4, marginBottom: 10 }}>
                  {seq.desc}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                  {seq.keys.map((k, j) => (
                    <span key={j} style={{
                      width: 32, height: 32, borderRadius: '50%',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      background: colors[i] + '0c', border: `1px solid ${colors[i]}33`,
                      fontFamily: "'Cinzel', serif", fontSize: 13, color: colors[i],
                    }}>{k}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* OVERALL CONTEMPLATION */}
      <div>
        <div style={S.sectionTitle}>Hologenetic Contemplation</div>
        <div style={S.interpretation}>
          {profile?.name || 'Your'} hologenetic profile weaves a story of{' '}
          <span style={{ color: SPHERE_COLORS[activeGKData[0]?.sphere] || '#50b4dc' }}>
            {activeGKData[0]?.gift?.name || 'creative anticipation'}
          </span>{' '}
          (Gene Key {activeGKData[0]?.num || 41}) learning to become{' '}
          <span style={{ color: SPHERE_COLORS[activeGKData[1]?.sphere] || '#dc5050' }}>
            {activeGKData[1]?.gift?.name || 'humble leadership'}
          </span>{' '}
          (Gene Key {activeGKData[1]?.num || 31}) through the crucible of{' '}
          <span style={{ color: SPHERE_COLORS[activeGKData[2]?.sphere] || '#dc5050' }}>
            {activeGKData[2]?.gift?.name || 'total living'}
          </span>{' '}
          (Gene Key {activeGKData[2]?.num || 28}), ultimately arriving at{' '}
          <span style={{ color: SPHERE_COLORS[activeGKData[3]?.sphere] || '#dc5050' }}>
            {activeGKData[3]?.gift?.name || 'selfless service'}
          </span>{' '}
          (Gene Key {activeGKData[3]?.num || 27}).
          The journey from Shadow to Siddhi in each key is not linear but spiral -- you will revisit
          each frequency many times, each time at a deeper level of integration. The contemplation
          prompts are not questions to be answered intellectually but{' '}
          <span style={{ color: 'var(--violet2)' }}>koans to be lived</span>. Let them sit in your
          awareness without forcing resolution. The Gene Keys teach that{' '}
          <span style={{ color: 'var(--foreground)' }}>transformation happens through contemplation,
          not effort</span> -- by simply holding awareness on a pattern, the pattern begins to shift
          on its own.
        </div>
      </div>
    </div>
  )
}
