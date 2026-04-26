import { useMemo, useState } from 'react'
import { computeGeneKeysData } from '../../data/geneKeysData'
import { GENE_KEYS_DATA } from '../../engines/geneKeysEngine'
import GeneKeysWheel from '../canvas/GeneKeysWheel'
import { useComputedProfile as useActiveProfile } from '../../hooks/useActiveProfile'

/* ─── Sphere color map ──────────────────────────────────────────────────────── */
const SPHERE_COLORS = {
  "Life's Work": '#50b4dc',
  Evolution: '#dc5050',
  Radiance: '#e0a040',
  Purpose: '#9050e0',
  // Venus
  Attraction: '#d43070',
  IQ: '#50b4dc',
  EQ: '#9050e0',
  SQ: '#c9a84c',
  // Pearl
  Vocation: '#f0c040',
  Culture: '#64b450',
  Brand: '#50b4dc',
  Pearl: '#c9a84c',
}

/* ─── Tooltip component ─────────────────────────────────────────────────────── */
function GKTooltip({ gk, children }) {
  const [show, setShow] = useState(false)
  if (!gk) return children
  const d = GENE_KEYS_DATA[gk.gate || gk.num || gk.key] || {}
  return (
    <div
      style={{ position: 'relative', cursor: 'help' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: 'absolute', bottom: '105%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, minWidth: 240, maxWidth: 320, padding: '14px 16px',
          background: 'rgba(14,12,20,.95)', border: '1px solid rgba(201,168,76,.2)',
          borderRadius: 10, backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,.6)',
        }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: 'var(--foreground)', marginBottom: 6 }}>
            Gene Key {gk.gate || gk.num || gk.key} — {gk.sphere || gk.role || ''}
          </div>
          <div style={{ fontFamily: "'Inconsolata',monospace", fontSize: 10, color: 'var(--muted-foreground)', marginBottom: 8 }}>
            Line {gk.line} · {d.iching || ''}
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, background: 'rgba(220,60,60,.1)', color: '#dc6060', border: '1px solid rgba(220,60,60,.2)' }}>
              Shadow: {d.shadow}
            </span>
            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, background: 'rgba(80,180,220,.1)', color: '#50b4dc', border: '1px solid rgba(80,180,220,.2)' }}>
              Gift: {d.gift}
            </span>
          </div>
          <div style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, background: 'rgba(201,168,76,.1)', color: '#c9a84c', border: '1px solid rgba(201,168,76,.2)', display: 'inline-block' }}>
            Siddhi: {d.siddhi}
          </div>
          <div style={{
            position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
            width: 10, height: 10, background: 'rgba(14,12,20,.95)', border: '1px solid rgba(201,168,76,.2)',
            borderTop: 'none', borderLeft: 'none',
            transform: 'translateX(-50%) rotate(45deg)',
          }} />
        </div>
      )}
    </div>
  )
}

/* ─── Spectrum bar ──────────────────────────────────────────────────────────── */
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

/* ─── Sequence flow visualization ───────────────────────────────────────────── */
function SequenceFlow({ spheres, color, label, desc }) {
  if (!spheres || spheres.length === 0) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: '.12em', color }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', flex: 1 }}>{desc}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
        {spheres.map((s, i) => {
          const sColor = SPHERE_COLORS[s.role] || color
          const d = GENE_KEYS_DATA[s.key] || {}
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <GKTooltip gk={{ gate: s.key, line: s.line, sphere: s.role, role: s.role }}>
                <div style={{
                  flex: 1, textAlign: 'center', padding: '14px 6px',
                  background: sColor + '06', border: '1px solid ' + sColor + '18',
                  borderRadius: i === 0 ? '10px 0 0 10px' : i === spheres.length - 1 ? '0 10px 10px 0' : '0',
                  borderLeft: i === 0 ? undefined : 'none',
                  transition: 'background .2s',
                  cursor: 'help',
                }}>
                  <div style={{
                    fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '.2em',
                    textTransform: 'uppercase', color: sColor + 'aa', marginBottom: 4,
                  }}>{s.role}</div>
                  <div style={{
                    fontFamily: "'Cinzel',serif", fontSize: 18, color: sColor, fontWeight: 600,
                  }}>{s.key}</div>
                  <div style={{ fontSize: 9, color: 'var(--muted-foreground)', marginTop: 2 }}>
                    .{s.line} · {d.gift || ''}
                  </div>
                </div>
              </GKTooltip>
              {i < spheres.length - 1 && (
                <div style={{ fontSize: 14, color: 'var(--muted-foreground)', padding: '0 1px', zIndex: 1 }}>{'\u2192'}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Detailed key card ─────────────────────────────────────────────────────── */
function KeyCard({ gk, color }) {
  const d = GENE_KEYS_DATA[gk.key || gk.num] || {}
  const shadow = gk.shadow?.name || d.shadow || ''
  const gift = gk.gift?.name || d.gift || ''
  const siddhi = gk.siddhi?.name || d.siddhi || ''
  const iching = gk.iching || d.iching || ''
  const shadowDesc = gk.shadow?.desc || `Unconscious pattern of ${shadow.toLowerCase()}`
  const giftDesc = gk.gift?.desc || `Awakened potential of ${gift.toLowerCase()}`
  const siddhiDesc = gk.siddhi?.desc || `Highest expression: ${siddhi.toLowerCase()}`

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 13, padding: '18px 20px', borderColor: color + '18',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: color + '0c', border: `2px solid ${color}33`,
          fontFamily: "'Cinzel',serif", fontSize: 22, color, fontWeight: 600, flexShrink: 0,
        }}>{gk.key || gk.num}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, letterSpacing: '.1em', color }}>
            Gene Key {gk.key || gk.num} — {gk.role || gk.sphere}
          </div>
          <div style={{ fontFamily: "'Inconsolata',monospace", fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2 }}>
            Line {gk.line} · {iching}
          </div>
        </div>
      </div>

      {/* Spectrum Bar */}
      <SpectrumBar shadow={shadow} gift={gift} siddhi={siddhi} color={color} />

      {/* Three levels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(220,60,60,.04)', border: '1px solid rgba(220,60,60,.12)' }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: '#dc6060', marginBottom: 4 }}>Shadow</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: '#dc6060', marginBottom: 4 }}>{shadow}</div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>{shadowDesc}</div>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 8, background: color + '06', border: '1px solid ' + color + '18' }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color, marginBottom: 4 }}>Gift</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color, marginBottom: 4 }}>{gift}</div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>{giftDesc}</div>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--secondary)', border: '1px solid var(--accent)' }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--foreground)', marginBottom: 4 }}>Siddhi</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: 'var(--foreground)', marginBottom: 4 }}>{siddhi}</div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.4 }}>{siddhiDesc}</div>
        </div>
      </div>

      {/* I-Ching */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--secondary)', borderRadius: 6, border: '1px solid var(--secondary)' }}>
        <span style={{ fontSize: 18 }}>{'\u2630'}</span>
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>I-Ching Hexagram</div>
          <div style={{ fontFamily: "'Inconsolata',monospace", fontSize: 12, color: 'var(--muted-foreground)' }}>{iching}</div>
        </div>
      </div>
    </div>
  )
}

/* ─── Shared styles ─────────────────────────────────────────────────────────── */
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
  glass: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 13, padding: 18, backdropFilter: 'blur(12px)',
  },
  interpretation: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--muted-foreground)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'var(--accent)', border: '1px solid var(--border)',
  },
}

/* ─── Tab system ────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'activation', label: 'Activation' },
  { id: 'venus', label: 'Venus' },
  { id: 'pearl', label: 'Pearl' },
  { id: 'map', label: 'Full Map' },
]

export default function GeneKeysDetail() {
  const profile = useActiveProfile()
  const [activeTab, setActiveTab] = useState('overview')

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

  const activationSpheres = profileData?.SPHERES?.filter(s => !s.center) || []
  const venusSpheres = profileData?.VENUS_SPHERES || []
  const pearlSpheres = profileData?.PEARL_SPHERES || []
  const allSpheres = [...activationSpheres, ...venusSpheres, ...pearlSpheres]

  // Empty state
  if (!profile?.dob) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: .5, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40 }}>{'\u2B21'}</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--gold)' }}>Add birth date to see your Gene Keys</div>
      </div>
    )
  }

  if (!activationSpheres.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: .5, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40 }}>{'\u2B21'}</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--gold)' }}>Computing your Gene Keys...</div>
      </div>
    )
  }

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>{'\u2B21'} Gene Keys</div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          Hologenetic Profile — {allSpheres.length} keys across three sequences
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none',
              fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '.1em',
              textTransform: 'uppercase', cursor: 'pointer',
              background: activeTab === tab.id ? 'rgba(201,168,76,.15)' : 'rgba(255,255,255,.03)',
              color: activeTab === tab.id ? '#c9a84c' : 'var(--muted-foreground)',
              border: activeTab === tab.id ? '1px solid rgba(201,168,76,.3)' : '1px solid rgba(255,255,255,.06)',
              transition: 'all .2s',
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* HOLOGENETIC WHEEL */}
      {activeTab === 'overview' && (
        <>
          <div>
            <div style={S.sectionTitle}>Hologenetic Wheel</div>
            <div style={{ ...S.glass, padding: 0, overflow: 'hidden', height: 360, position: 'relative' }}>
              <GeneKeysWheel />
            </div>
          </div>

          {/* HOLOGENETIC PROFILE OVERVIEW — all 12 spheres */}
          <div>
            <div style={S.sectionTitle}>Complete Profile — {allSpheres.length} Spheres</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {allSpheres.map((gk, i) => {
                const color = SPHERE_COLORS[gk.role] || '#40ccdd'
                const d = GENE_KEYS_DATA[gk.key] || {}
                return (
                  <GKTooltip key={i} gk={{ gate: gk.key, line: gk.line, sphere: gk.role, role: gk.role }}>
                    <div style={{
                      ...S.glass, textAlign: 'center', padding: '16px 10px',
                      borderColor: color + '22',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    }}>
                      <div style={{
                        fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '.2em',
                        textTransform: 'uppercase', color: color + 'aa',
                      }}>{gk.role}</div>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: color + '0c', border: `2px solid ${color}44`,
                        fontFamily: "'Cinzel',serif", fontSize: 20, color, fontWeight: 600, position: 'relative',
                      }}>
                        {gk.key}
                        <div style={{
                          position: 'absolute', bottom: -2, right: -2,
                          width: 18, height: 18, borderRadius: '50%',
                          background: 'var(--card)', border: '1px solid ' + color + '44',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: "'Inconsolata',monospace", fontSize: 9, color: 'var(--muted-foreground)',
                        }}>.{gk.line}</div>
                      </div>
                      <div style={{ fontFamily: "'Inconsolata',monospace", fontSize: 9, color: 'var(--muted-foreground)' }}>
                        {d.gift || ''}
                      </div>
                    </div>
                  </GKTooltip>
                )
              })}
            </div>
          </div>

          {/* THREE SEQUENCES SUMMARY */}
          <div>
            <div style={S.sectionTitle}>The Three Sequences</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SequenceFlow
                spheres={activationSpheres}
                color="#50b4dc"
                label="Activation Sequence"
                desc="The awakening path — from Life's Work to Purpose"
              />
              <SequenceFlow
                spheres={venusSpheres}
                color="#d43070"
                label="Venus Sequence"
                desc="The love path — relationships, emotional intelligence, spirit"
              />
              <SequenceFlow
                spheres={pearlSpheres}
                color="#f0c040"
                label="Pearl Sequence"
                desc="The prosperity path — vocation, culture, brand, abundance"
              />
            </div>
          </div>

          {/* CONTEMPLATION */}
          <div>
            <div style={S.sectionTitle}>Hologenetic Contemplation</div>
            <div style={S.interpretation}>
              {profile?.name || 'Your'} hologenetic profile weaves {allSpheres.length} Gene Keys across three
              sequences of awakening. The Activation Sequence ({activationSpheres.map(s => s.key).join('-')})
              reveals your core gifts. The Venus Sequence ({venusSpheres.map(s => s.key).join('-') || 'pending'})
              illuminates your relational field. The Pearl Sequence ({pearlSpheres.map(s => s.key).join('-') || 'pending'})
              maps your path to prosperity. The journey from Shadow to Siddhi in each key is spiral — you will revisit
              each frequency at deeper levels of integration. The Gene Keys teach that{' '}
              <span style={{ color: 'var(--foreground)' }}>transformation happens through contemplation, not effort</span>.
            </div>
          </div>
        </>
      )}

      {/* ACTIVATION TAB */}
      {activeTab === 'activation' && (
        <>
          <div>
            <div style={S.sectionTitle}>Activation Sequence — The Awakening Path</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', marginBottom: 12, lineHeight: 1.5 }}>
              The Activation Sequence traces the path from Life's Work through Evolution and Radiance to Purpose,
              revealing how your deepest gifts unfold through lived experience.
            </div>
            <SequenceFlow spheres={activationSpheres} color="#50b4dc" label="" desc="" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activationSpheres.map((s, i) => (
              <KeyCard key={i} gk={s} color={SPHERE_COLORS[s.role] || '#50b4dc'} />
            ))}
          </div>
        </>
      )}

      {/* VENUS TAB */}
      {activeTab === 'venus' && (
        <>
          <div>
            <div style={S.sectionTitle}>Venus Sequence — The Path of Love</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', marginBottom: 12, lineHeight: 1.5 }}>
              The Venus Sequence opens the heart field. It reveals how you attract others (Attraction), how your mind processes
              relationship (IQ), how your emotions navigate intimacy (EQ), and how your spirit transcends separation (SQ).
            </div>
            {venusSpheres.length > 0 ? (
              <>
                <SequenceFlow spheres={venusSpheres} color="#d43070" label="" desc="" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                  {venusSpheres.map((s, i) => (
                    <KeyCard key={i} gk={s} color={SPHERE_COLORS[s.role] || '#d43070'} />
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', opacity: .4, padding: 40 }}>Venus Sequence requires planetary data</div>
            )}
          </div>
        </>
      )}

      {/* PEARL TAB */}
      {activeTab === 'pearl' && (
        <>
          <div>
            <div style={S.sectionTitle}>Pearl Sequence — The Path of Prosperity</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', marginBottom: 12, lineHeight: 1.5 }}>
              The Pearl Sequence connects your inner gifts to outer abundance. It reveals your true Vocation, the Culture
              you create, the Brand you embody, and the Pearl — the distilled essence of your contribution to the world.
            </div>
            {pearlSpheres.length > 0 ? (
              <>
                <SequenceFlow spheres={pearlSpheres} color="#f0c040" label="" desc="" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                  {pearlSpheres.map((s, i) => (
                    <KeyCard key={i} gk={s} color={SPHERE_COLORS[s.role] || '#f0c040'} />
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', opacity: .4, padding: 40 }}>Pearl Sequence requires planetary data</div>
            )}
          </div>
        </>
      )}

      {/* FULL MAP TAB */}
      {activeTab === 'map' && (
        <>
          <div>
            <div style={S.sectionTitle}>Complete Hologenetic Map — All {allSpheres.length} Keys</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', marginBottom: 16, lineHeight: 1.5 }}>
              Your complete Gene Keys profile across all three sequences. Each key holds a spectrum from Shadow to Gift to Siddhi.
              Hover any key for details.
            </div>
          </div>

          {/* Visual map — three concentric rings */}
          <div style={{
            ...S.glass, padding: '24px 20px', position: 'relative',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            {/* Activation ring */}
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: '#50b4dc88', marginBottom: 8 }}>
                Activation — Awakening
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {activationSpheres.map((s, i) => {
                  const c = SPHERE_COLORS[s.role] || '#50b4dc'
                  const d = GENE_KEYS_DATA[s.key] || {}
                  return (
                    <GKTooltip key={i} gk={{ gate: s.key, line: s.line, sphere: s.role, role: s.role }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                        borderRadius: 10, background: c + '08', border: '1px solid ' + c + '22',
                        cursor: 'help', transition: 'background .2s',
                      }}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: c, fontWeight: 600 }}>{s.key}</div>
                        <div>
                          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: c }}>{s.role}</div>
                          <div style={{ fontFamily: "'Inconsolata',monospace", fontSize: 9, color: 'var(--muted-foreground)' }}>
                            {d.shadow} → {d.gift} → {d.siddhi}
                          </div>
                        </div>
                      </div>
                    </GKTooltip>
                  )
                })}
              </div>
            </div>

            {/* Connection lines placeholder */}
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,.15), transparent)' }} />

            {/* Venus ring */}
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: '#d4307088', marginBottom: 8 }}>
                Venus — Love
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {venusSpheres.map((s, i) => {
                  const c = SPHERE_COLORS[s.role] || '#d43070'
                  const d = GENE_KEYS_DATA[s.key] || {}
                  return (
                    <GKTooltip key={i} gk={{ gate: s.key, line: s.line, sphere: s.role, role: s.role }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                        borderRadius: 10, background: c + '08', border: '1px solid ' + c + '22', cursor: 'help',
                      }}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: c, fontWeight: 600 }}>{s.key}</div>
                        <div>
                          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: c }}>{s.role}</div>
                          <div style={{ fontFamily: "'Inconsolata',monospace", fontSize: 9, color: 'var(--muted-foreground)' }}>
                            {d.shadow} → {d.gift} → {d.siddhi}
                          </div>
                        </div>
                      </div>
                    </GKTooltip>
                  )
                })}
              </div>
            </div>

            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,.15), transparent)' }} />

            {/* Pearl ring */}
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: '#f0c04088', marginBottom: 8 }}>
                Pearl — Prosperity
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {pearlSpheres.map((s, i) => {
                  const c = SPHERE_COLORS[s.role] || '#f0c040'
                  const d = GENE_KEYS_DATA[s.key] || {}
                  return (
                    <GKTooltip key={i} gk={{ gate: s.key, line: s.line, sphere: s.role, role: s.role }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                        borderRadius: 10, background: c + '08', border: '1px solid ' + c + '22', cursor: 'help',
                      }}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: c, fontWeight: 600 }}>{s.key}</div>
                        <div>
                          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: c }}>{s.role}</div>
                          <div style={{ fontFamily: "'Inconsolata',monospace", fontSize: 9, color: 'var(--muted-foreground)' }}>
                            {d.shadow} → {d.gift} → {d.siddhi}
                          </div>
                        </div>
                      </div>
                    </GKTooltip>
                  )
                })}
              </div>
            </div>
          </div>

          {/* All key cards */}
          <div>
            <div style={S.sectionTitle}>All Gene Key Profiles</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {allSpheres.map((s, i) => (
                <KeyCard key={i} gk={s} color={SPHERE_COLORS[s.role] || '#40ccdd'} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
