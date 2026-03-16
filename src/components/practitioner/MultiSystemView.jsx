/**
 * MultiSystemView.jsx
 * Side-by-side comparison of two people's esoteric charts.
 * Supports Side-by-Side and Synastry views.
 */

import { useState, useMemo } from 'react'
import { buildFullProfile } from '../../engines/patternEngine.js'
import { MOCK_CLIENTS } from '../../data/practitionerData.js'

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  container: {
    padding: '24px',
    fontFamily: "'Cormorant Garamond',serif",
    color: 'var(--foreground)',
  },
  sectionTitle: {
    fontFamily: "'Cinzel',serif",
    fontSize: '11px',
    letterSpacing: '.18em',
    color: 'var(--foreground)',
    marginBottom: '14px',
    textTransform: 'uppercase',
  },
  card: {
    background: 'var(--secondary)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
  },
  select: {
    background: 'var(--secondary)',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '8px',
    padding: '8px 12px',
    color: 'var(--foreground)',
    fontSize: '12px',
    fontFamily: "'Cormorant Garamond',serif",
    outline: 'none',
    cursor: 'pointer',
    minWidth: '160px',
  },
  viewBtn: (active) => ({
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '10px',
    fontFamily: "'Cinzel',serif",
    letterSpacing: '.06em',
    cursor: 'pointer',
    transition: 'all .2s',
    background: active ? 'var(--accent)' : 'transparent',
    border: active ? '1px solid rgba(201,168,76,.25)' : '1px solid var(--border)',
    color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
  }),
  badge: {
    display: 'inline-block',
    padding: '2px 7px',
    borderRadius: '10px',
    fontSize: '9px',
    letterSpacing: '.06em',
    fontFamily: "'Cinzel',serif",
    background: 'var(--secondary)',
    border: '1px solid var(--accent)',
    color: 'var(--foreground)',
  },
  dataRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '5px 0',
    borderBottom: '1px solid var(--secondary)',
    fontSize: '12px',
  },
}

// ─── Person Column ─────────────────────────────────────────────────────────────

function PersonColumn({ person, profile, isA }) {
  const accentColor = isA ? 'rgba(64,204,221,' : 'rgba(212,48,112,'

  if (!person) {
    return (
      <div style={{
        flex: 1,
        background: 'rgba(10,8,20,.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        color: 'var(--muted-foreground)',
        fontSize: '12px',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{ fontSize: '28px' }}>{isA ? 'Ⓐ' : 'Ⓑ'}</div>
        <div>Select a person above</div>
      </div>
    )
  }

  const natal = profile?.natal
  const hd = profile?.hd
  const geneKeys = profile?.geneKeys
  const numerology = profile?.numerology
  const mayan = profile?.mayan

  const rows = [
    { label: 'Sun Sign', val: natal?.planets?.sun?.sign || person.sign || '—' },
    { label: 'Moon Sign', val: natal?.planets?.moon?.sign || '—' },
    { label: 'Rising', val: natal?.angles?.asc?.sign || person.asc || '—' },
    { label: 'HD Type', val: hd?.type || person.hdType || '—' },
    { label: 'HD Profile', val: hd?.profile || person.hdProfile || '—' },
    { label: 'HD Authority', val: hd?.authority || person.hdAuth || '—' },
    { label: 'Life Path', val: numerology?.core?.lifePath?.val || person.lifePath || '—' },
    { label: 'Expression', val: numerology?.core?.expression?.val || '—' },
    { label: "Gene Key (L's Work)", val: geneKeys?.spheres?.lifesWork?.gate || '—' },
    { label: 'Gene Key (Evol)', val: geneKeys?.spheres?.evolution?.gate || '—' },
    { label: 'Mayan Day Sign', val: mayan?.tzolkin?.daySign || '—' },
    { label: 'Mayan Tone', val: mayan?.tzolkin?.tone || '—' },
    { label: 'MBTI', val: person.mbti || '—' },
    { label: 'Enneagram', val: person.enneagram ? `Type ${person.enneagram}` : '—' },
  ]

  return (
    <div style={{ flex: 1, background: 'rgba(10,8,20,.5)' }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid rgba(255,255,255,.05)',
        background: `${accentColor}0.03)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: `${accentColor}0.1)`,
            border: `1px solid ${accentColor}0.2)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>
            {person.emoji || (isA ? '🅰' : '🅱')}
          </div>
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: '12px', color: 'var(--foreground)', letterSpacing: '.06em', marginBottom: '2px' }}>
              {person.name}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>
              {person.dob} · {person.birthCity || person.pob || '—'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {(natal?.planets?.sun?.sign || person.sign) && (
            <span style={{
              ...s.badge,
              background: `${accentColor}0.07)`,
              borderColor: `${accentColor}0.2)`,
              color: `${accentColor}0.8)`,
            }}>
              {natal?.planets?.sun?.sign || person.sign} ☀
            </span>
          )}
          {(hd?.type || person.hdType) && (
            <span style={{
              ...s.badge,
              background: `${accentColor}0.07)`,
              borderColor: `${accentColor}0.2)`,
              color: `${accentColor}0.8)`,
            }}>
              {hd?.type || person.hdType} {hd?.profile || person.hdProfile || ''}
            </span>
          )}
        </div>
      </div>

      {/* Data rows */}
      <div style={{ padding: '10px 16px' }}>
        {rows.map((row) => (
          <div key={row.label} style={s.dataRow}>
            <span style={{ color: 'var(--muted-foreground)', fontSize: '10px', letterSpacing: '.03em' }}>{row.label}</span>
            <span style={{ color: 'var(--foreground)', fontFamily: "'Inconsolata',monospace", fontSize: '11px' }}>{row.val}</span>
          </div>
        ))}
      </div>

      {/* Patterns */}
      {profile?.patterns?.length > 0 && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--secondary)' }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: '9px', letterSpacing: '.1em', color: `${accentColor}0.7)`, marginBottom: '6px' }}>
            TOP PATTERNS
          </div>
          {profile.patterns.slice(0, 3).map((p) => (
            <div key={p.id} style={{
              padding: '4px 8px',
              borderRadius: '6px',
              background: `${p.color}0.06)`,
              border: `1px solid ${p.color}0.15)`,
              fontSize: '10px',
              color: `${p.color}0.8)`,
              marginBottom: '3px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}>
              <span>{p.icon}</span>
              <span style={{ flex: 1 }}>{p.name}</span>
              <span style={{ fontSize: '9px', opacity: 0.7 }}>{p.strength}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Synastry View ─────────────────────────────────────────────────────────────

function SynastryView({ personA, personB, profileA, profileB }) {
  if (!personA || !personB) {
    return (
      <div style={{ ...s.card, textAlign: 'center', padding: '40px', color: 'var(--muted-foreground)', fontSize: '13px' }}>
        Select two people above to see synastry analysis.
      </div>
    )
  }

  const compatPoints = []
  let score = 0

  // HD Type synastry
  const typeA = profileA?.hd?.type || personA.hdType
  const typeB = profileB?.hd?.type || personB.hdType
  if (typeA && typeB) {
    if ((typeA === 'Projector' && ['Generator', 'Manifesting Generator'].includes(typeB)) ||
        (typeB === 'Projector' && ['Generator', 'Manifesting Generator'].includes(typeA))) {
      compatPoints.push({ icon: '◈', label: `${typeA} × ${typeB}`, note: 'Natural guide-builder dynamic. Projector sees the Generator clearly; Generator provides sustainable energy for both.', impact: 'positive' })
      score += 12
    } else if (typeA === typeB) {
      compatPoints.push({ icon: '◈', label: `Both ${typeA}`, note: 'Same type — deep understanding of each other\'s strategy. Watch for shared conditioning patterns.', impact: 'neutral' })
    }
  }

  // Life Path
  const lpA = profileA?.numerology?.core?.lifePath?.val || personA.lifePath
  const lpB = profileB?.numerology?.core?.lifePath?.val || personB.lifePath
  if (lpA && lpB) {
    if (lpA === lpB) {
      compatPoints.push({ icon: '∞', label: `Both Life Path ${lpA}`, note: 'Mirror dynamic — shared core themes and lessons. Profound understanding but may amplify each other\'s challenges.', impact: 'neutral' })
    } else if (Math.abs(lpA - lpB) === 1 || Math.abs(lpA - lpB) === 8) {
      compatPoints.push({ icon: '∞', label: `Life Paths ${lpA} × ${lpB}`, note: 'Complementary numerological paths — sequential growth themes support each other.', impact: 'positive' })
      score += 8
    }
  }

  // Sun element compatibility
  const FIRE = ['Aries', 'Leo', 'Sagittarius']
  const EARTH = ['Taurus', 'Virgo', 'Capricorn']
  const AIR = ['Gemini', 'Libra', 'Aquarius']
  const WATER = ['Cancer', 'Scorpio', 'Pisces']
  const sunA = profileA?.natal?.planets?.sun?.sign || personA.sign
  const sunB = profileB?.natal?.planets?.sun?.sign || personB.sign
  const getElem = (s) => FIRE.includes(s) ? '🔥 Fire' : EARTH.includes(s) ? '🌱 Earth' : AIR.includes(s) ? '💨 Air' : WATER.includes(s) ? '🌊 Water' : null
  const elemA = getElem(sunA)
  const elemB = getElem(sunB)
  if (elemA && elemB) {
    if (elemA === elemB) {
      compatPoints.push({ icon: '☀️', label: `${elemA} × ${elemA}`, note: 'Same element — natural understanding, shared temperament and approach to life.', impact: 'positive' })
      score += 10
    } else if (
      (FIRE.includes(sunA) && AIR.includes(sunB)) || (AIR.includes(sunA) && FIRE.includes(sunB)) ||
      (EARTH.includes(sunA) && WATER.includes(sunB)) || (WATER.includes(sunA) && EARTH.includes(sunB))
    ) {
      compatPoints.push({ icon: '☀️', label: `${elemA} × ${elemB}`, note: 'Complementary elements — natural support and balance between these energies.', impact: 'positive' })
      score += 8
    }
  }

  // Shared Gene Key
  const gkA = profileA?.geneKeys?.spheres?.lifesWork?.gate
  const gkB = profileB?.geneKeys?.spheres?.lifesWork?.gate
  if (gkA && gkB && gkA === gkB) {
    compatPoints.push({ icon: '✦', label: `Shared Gene Key ${gkA}`, note: "Same Life's Work gate — extraordinary resonance. You are here to learn and demonstrate the same gift.", impact: 'positive' })
    score += 18
  }

  score = Math.min(score + 28, 100)
  const scoreColor = score >= 70 ? '#7bc043' : score >= 50 ? 'var(--foreground)' : '#f0a03c'

  return (
    <div>
      <div style={{
        ...s.card,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        background: 'var(--secondary)',
        border: '1px solid var(--accent)',
      }}>
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: '11px', letterSpacing: '.1em', color: 'var(--foreground)', marginBottom: '4px' }}>
            SYNASTRY COMPATIBILITY
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{personA.name} × {personB.name}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: '34px', color: scoreColor, lineHeight: 1 }}>{score}%</div>
          <div style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>
            {score >= 70 ? 'Strong Resonance' : score >= 50 ? 'Compatible' : 'Growth Dynamic'}
          </div>
        </div>
      </div>

      <div style={s.sectionTitle}><span>🔍</span> Compatibility Indicators</div>

      {compatPoints.length === 0 ? (
        <div style={{ ...s.card, color: 'var(--muted-foreground)', fontSize: '12px', textAlign: 'center', padding: '24px' }}>
          Add birth data for both people to generate detailed synastry analysis.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {compatPoints.map((point, i) => (
            <div key={i} style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: point.impact === 'positive' ? 'rgba(96,176,48,.04)' : 'var(--secondary)',
              border: `1px solid ${point.impact === 'positive' ? 'rgba(96,176,48,.18)' : 'var(--border)'}`,
              marginBottom: '2px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px' }}>{point.icon}</span>
                <span style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: '10px',
                  letterSpacing: '.06em',
                  color: point.impact === 'positive' ? '#7bc043' : 'var(--muted-foreground)',
                }}>
                  {point.label}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.5, paddingLeft: '21px' }}>
                {point.note}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MultiSystemView({ clients }) {
  const allClients = clients || MOCK_CLIENTS
  const [selA, setSelA] = useState(null)
  const [selB, setSelB] = useState(null)
  const [viewMode, setViewMode] = useState('side-by-side')

  const personA = useMemo(() => allClients.find((p) => String(p.id) === String(selA)), [allClients, selA])
  const personB = useMemo(() => allClients.find((p) => String(p.id) === String(selB)), [allClients, selB])

  function buildProfile(person) {
    if (!person?.dob) return null
    const tob = person.tob || (person.birthHour !== undefined
      ? `${String(person.birthHour).padStart(2, '0')}:${String(person.birthMinute || 0).padStart(2, '0')}`
      : '12:00')
    try {
      return buildFullProfile({
        name: person.name, dob: person.dob, tob,
        lat: person.birthLat || 0, lon: person.birthLon || 0,
        timezone: person.birthTimezone || 0,
        enneagram: person.enneagram, mbti: person.mbti,
      })
    } catch { return null }
  }

  const profileA = useMemo(() => buildProfile(personA), [personA])
  const profileB = useMemo(() => buildProfile(personB), [personB])

  return (
    <div style={s.container}>
      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-end',
        marginBottom: '20px',
        flexWrap: 'wrap',
        padding: '16px',
        background: 'var(--secondary)',
        border: '1px solid rgba(255,255,255,.05)',
        borderRadius: '12px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '9px', fontFamily: "'Cinzel',serif", letterSpacing: '.1em', color: 'rgba(64,204,221,.7)' }}>
            PERSON A
          </label>
          <select value={selA || ''} onChange={e => setSelA(e.target.value || null)} style={s.select}>
            <option value="">Select person...</option>
            {allClients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '16px', color: 'var(--muted-foreground)', paddingBottom: '6px' }}>×</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '9px', fontFamily: "'Cinzel',serif", letterSpacing: '.1em', color: 'rgba(212,48,112,.7)' }}>
            PERSON B
          </label>
          <select value={selB || ''} onChange={e => setSelB(e.target.value || null)} style={{ ...s.select, borderColor: 'rgba(212,48,112,.2)' }}>
            <option value="">Select person...</option>
            {allClients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          {['side-by-side', 'synastry'].map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} style={s.viewBtn(viewMode === mode)}>
              {mode === 'side-by-side' ? '⊞ Side by Side' : '🔮 Synastry'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'side-by-side' && (
        <div style={{
          display: 'flex',
          gap: '1px',
          background: 'var(--secondary)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          <PersonColumn person={personA} profile={profileA} isA={true} />
          <PersonColumn person={personB} profile={profileB} isA={false} />
        </div>
      )}

      {viewMode === 'synastry' && (
        <SynastryView personA={personA} personB={personB} profileA={profileA} profileB={profileB} />
      )}
    </div>
  )
}
