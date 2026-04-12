import { useState, useMemo } from 'react'
import { useActiveProfile } from '../../hooks/useActiveProfile'
import { getRecommendedRituals, TRADITIONS, getRitualById } from '../../engines/ritualEngine'
import { getMoonPhase } from '../../engines/cycleEngine'

const ELEMENTS = { fire: '🔥', water: '💧', air: '🌬', earth: '🌍', spirit: '✦' }
const DIFFICULTY = { beginner: { label: 'Beginner', color: '#60b030' }, intermediate: { label: 'Intermediate', color: '#e8a040' }, advanced: { label: 'Advanced', color: '#d44070' } }

export default function RitualDetail() {
  const profile = useActiveProfile()
  const [activeTab, setActiveTab] = useState('recommended') // recommended | traditions | active
  const [activeRitual, setActiveRitual] = useState(null) // ritual id for immersive view
  const [ritualStep, setRitualStep] = useState(0)
  const [filter, setFilter] = useState(null) // tradition key filter

  const result = useMemo(() => getRecommendedRituals(profile), [profile])
  const moon = useMemo(() => getMoonPhase(), [])

  // Active ritual object
  const ritual = activeRitual ? getRitualById(activeRitual) || result.rituals.find(r => r.id === activeRitual) : null

  // ─── Immersive Ritual View ────────────────────────────────
  if (ritual && activeTab === 'active') {
    const step = ritual.instructions[ritualStep]
    const progress = ((ritualStep + 1) / ritual.instructions.length) * 100
    const trad = ritual.tradition || TRADITIONS[ritual.tradition]

    return (
      <div style={{ padding: 0, minHeight: '100%' }}>
        {/* Header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <button onClick={() => { setActiveTab('recommended'); setActiveRitual(null); setRitualStep(0) }}
            style={S.backBtn}>← Back</button>
          <div style={{ textAlign: 'center' }}>
            <div style={S.sectionLabel}>{trad?.name || ''} Tradition</div>
            <div style={{ fontSize: 15, color: '#fff', fontFamily: "'Cinzel',serif" }}>{ritual.name}</div>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{ritual.duration} min</div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 2, background: 'rgba(255,255,255,.06)', margin: '0 20px' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: trad?.color || '#c9a84c', transition: 'width .4s ease', borderRadius: 1 }} />
        </div>

        {/* Step content */}
        <div style={{ padding: '40px 24px', textAlign: 'center', minHeight: 280 }}>
          <div style={{ fontSize: 11, color: trad?.color || '#c9a84c', letterSpacing: '.15em', fontFamily: "'Cinzel',serif", marginBottom: 8 }}>
            Step {ritualStep + 1} of {ritual.instructions.length}
          </div>
          <div style={{ fontSize: 16, lineHeight: 1.9, color: 'rgba(255,255,255,.8)', fontFamily: "'Cormorant Garamond',serif", maxWidth: 480, margin: '0 auto', fontStyle: 'italic' }}>
            {step}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '0 20px 24px' }}>
          <button
            onClick={() => setRitualStep(s => Math.max(0, s - 1))}
            disabled={ritualStep === 0}
            style={{ ...S.navBtn, opacity: ritualStep === 0 ? 0.3 : 1 }}>
            ← Previous
          </button>
          {ritualStep < ritual.instructions.length - 1 ? (
            <button onClick={() => setRitualStep(s => s + 1)} style={{ ...S.navBtn, background: `${trad?.color || '#c9a84c'}20`, borderColor: `${trad?.color || '#c9a84c'}40`, color: trad?.color || '#c9a84c' }}>
              Next Step →
            </button>
          ) : (
            <button onClick={() => { setActiveTab('recommended'); setActiveRitual(null); setRitualStep(0) }}
              style={{ ...S.navBtn, background: 'rgba(96,176,48,.15)', borderColor: 'rgba(96,176,48,.3)', color: '#60b030' }}>
              ✦ Complete Ritual
            </button>
          )}
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '0 0 20px' }}>
          {ritual.instructions.map((_, i) => (
            <div key={i} onClick={() => setRitualStep(i)} style={{
              width: 8, height: 8, borderRadius: '50%', cursor: 'pointer',
              background: i === ritualStep ? (trad?.color || '#c9a84c') : i < ritualStep ? 'rgba(96,176,48,.5)' : 'rgba(255,255,255,.1)',
              transition: 'all .2s',
            }} />
          ))}
        </div>

        {/* Original name + element */}
        <div style={{ textAlign: 'center', padding: '12px 20px 24px', borderTop: '1px solid rgba(255,255,255,.04)' }}>
          {ritual.originalName && (
            <div style={{ fontSize: 18, color: 'rgba(255,255,255,.2)', fontFamily: "'Cormorant Garamond',serif", marginBottom: 6 }}>
              {ritual.originalName}
            </div>
          )}
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>
            {ELEMENTS[ritual.element] || '✦'} {ritual.element} element · {DIFFICULTY[ritual.difficulty]?.label || ritual.difficulty}
          </div>
        </div>
      </div>
    )
  }

  // ─── Main View ────────────────────────────────────────────
  const displayRituals = filter
    ? result.rituals.filter(r => (r.tradition?.name || '').toLowerCase().includes(filter) || r.tradition === filter)
    : activeTab === 'recommended'
      ? result.rituals.slice(0, 8)
      : result.rituals

  return (
    <div style={{ padding: '0 0 30px' }}>

      {/* ── Conditions Banner ── */}
      <div style={{ padding: '16px 20px', background: 'rgba(201,168,76,.04)', borderBottom: '1px solid rgba(201,168,76,.1)' }}>
        <div style={S.sectionLabel}>Current Conditions</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          <Pill color="#c9a84c">{moon.phaseEmoji} {moon.phaseName}</Pill>
          {result.conditions.personalDay && <Pill color="#9080e0">Personal Day {result.conditions.personalDay}</Pill>}
          {result.conditions.cyclePhase && <Pill color="#c44d7a">{result.conditions.cyclePhase} Phase</Pill>}
          {profile.hdType && profile.hdType !== '?' && <Pill color="#60b0dd">{profile.hdType}</Pill>}
          {profile.enneagramType && <Pill color="#d44070">Enn {profile.enneagramType}</Pill>}
          {profile.doshaType && <Pill color="#44cc88">{profile.doshaType}</Pill>}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,.06)', padding: '0 20px' }}>
        {[
          { key: 'recommended', label: 'Recommended' },
          { key: 'traditions', label: 'By Tradition' },
        ].map(tab => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); setFilter(null) }}
            style={{
              padding: '10px 16px', fontSize: 11, fontFamily: "'Cinzel',serif", letterSpacing: '.1em',
              color: activeTab === tab.key ? 'var(--foreground)' : 'var(--muted-foreground)',
              borderBottom: activeTab === tab.key ? '2px solid var(--foreground)' : '2px solid transparent',
              background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid',
              cursor: 'pointer', transition: 'all .2s',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Top Recommendation ── */}
      {activeTab === 'recommended' && result.topRecommendation && (
        <div style={{ margin: '16px 20px', padding: 20, borderRadius: 12, background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={S.sectionLabel}>Today's Ritual</div>
              <div style={{ fontSize: 18, fontFamily: "'Cinzel',serif", color: '#fff', marginTop: 4 }}>
                {result.topRecommendation.name}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>
                {result.topRecommendation.tradition?.name} · {result.topRecommendation.duration} min · {ELEMENTS[result.topRecommendation.element]} {result.topRecommendation.element}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 24, fontWeight: 300, fontFamily: "'Inconsolata',monospace",
                color: result.topRecommendation.score > 70 ? '#60b030' : result.topRecommendation.score > 40 ? '#c9a84c' : 'rgba(255,255,255,.4)',
              }}>
                {result.topRecommendation.score}%
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em' }}>ALIGNMENT</div>
            </div>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,.6)', fontFamily: "'Cormorant Garamond',serif", marginTop: 12 }}>
            {result.topRecommendation.description}
          </div>
          <button
            onClick={() => { setActiveRitual(result.topRecommendation.id); setActiveTab('active'); setRitualStep(0) }}
            style={{ marginTop: 14, padding: '8px 24px', borderRadius: 20, background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.25)', color: '#c9a84c', fontSize: 12, fontFamily: "'Cinzel',serif", letterSpacing: '.08em', cursor: 'pointer', transition: 'all .2s' }}>
            Begin Ritual →
          </button>
        </div>
      )}

      {/* ── Tradition Filter (traditions tab) ── */}
      {activeTab === 'traditions' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '14px 20px' }}>
          <button onClick={() => setFilter(null)} style={{ ...S.filterPill, ...(filter === null ? S.filterActive : {}) }}>All</button>
          {Object.entries(TRADITIONS).map(([key, t]) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{
                ...S.filterPill,
                ...(filter === key ? { background: t.color + '25', borderColor: t.color + '50', color: t.color } : {}),
              }}>
              {t.icon} {t.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Ritual Cards ── */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
        {displayRituals.map(r => {
          const trad = r.tradition || {}
          const diff = DIFFICULTY[r.difficulty] || {}
          return (
            <div key={r.id} style={{
              padding: '14px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)',
              cursor: 'pointer', transition: 'all .2s',
            }}
              onClick={() => { setActiveRitual(r.id); setActiveTab('active'); setRitualStep(0) }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = (trad.color || '#c9a84c') + '40'; e.currentTarget.style.background = 'rgba(255,255,255,.04)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.06)'; e.currentTarget.style.background = 'rgba(255,255,255,.02)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{trad.icon || '✦'}</span>
                  <div>
                    <div style={{ fontSize: 13, fontFamily: "'Cinzel',serif", color: '#fff' }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                      {trad.name} · {r.duration} min · {ELEMENTS[r.element]} {r.element}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {r.moonAlignment && <span style={{ fontSize: 10, color: '#c9a84c' }}>🌙</span>}
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: diff.color + '15', border: `1px solid ${diff.color}25`, color: diff.color }}>
                    {diff.label}
                  </span>
                  <span style={{
                    fontSize: 13, fontFamily: "'Inconsolata',monospace", fontWeight: 600,
                    color: r.score > 70 ? '#60b030' : r.score > 40 ? '#c9a84c' : 'rgba(255,255,255,.35)',
                  }}>
                    {r.score}%
                  </span>
                </div>
              </div>
              {r.originalName && (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.2)', fontFamily: "'Cormorant Garamond',serif", marginTop: 4, fontStyle: 'italic' }}>
                  {r.originalName}
                </div>
              )}
              <div style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,.45)', fontFamily: "'Cormorant Garamond',serif", marginTop: 6 }}>
                {r.description.length > 140 ? r.description.slice(0, 140) + '...' : r.description}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                {r.purpose.slice(0, 4).map(p => (
                  <span key={p} style={{ fontSize: 9, padding: '1px 7px', borderRadius: 8, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', color: 'rgba(255,255,255,.35)' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Moon Alignment Section ── */}
      {activeTab === 'recommended' && result.moonAligned.length > 0 && (
        <div style={{ padding: '20px 20px 0' }}>
          <div style={S.sectionLabel}>
            {moon.phaseEmoji} Aligned with {moon.phaseName}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 4, fontFamily: "'Cormorant Garamond',serif" }}>
            {result.moonAligned.length} ritual{result.moonAligned.length > 1 ? 's' : ''} from {new Set(result.moonAligned.map(r => r.tradition?.name)).size} traditions align with tonight's moon.
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Small Components ───────────────────────────────────────
function Pill({ color, children }) {
  return (
    <span style={{
      fontSize: 10, padding: '3px 10px', borderRadius: 10,
      background: color + '12', border: `1px solid ${color}25`, color: color,
      fontFamily: "'Cinzel',serif", letterSpacing: '.05em',
    }}>
      {children}
    </span>
  )
}

// ─── Styles ─────────────────────────────────────────────────
const S = {
  sectionLabel: {
    fontSize: 9, fontFamily: "'Cinzel',serif", letterSpacing: '.2em',
    textTransform: 'uppercase', color: 'rgba(201,168,76,.5)',
  },
  backBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,.1)',
    color: 'rgba(255,255,255,.4)', padding: '5px 14px', borderRadius: 14,
    fontSize: 11, cursor: 'pointer', fontFamily: "'Cinzel',serif",
  },
  navBtn: {
    padding: '8px 20px', borderRadius: 16,
    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
    color: 'rgba(255,255,255,.6)', fontSize: 12, fontFamily: "'Cinzel',serif",
    letterSpacing: '.06em', cursor: 'pointer', transition: 'all .2s',
  },
  filterPill: {
    padding: '4px 12px', borderRadius: 12, fontSize: 10,
    background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)',
    color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontFamily: "'Cinzel',serif",
    letterSpacing: '.05em', transition: 'all .2s',
  },
  filterActive: {
    background: 'rgba(201,168,76,.12)', borderColor: 'rgba(201,168,76,.3)',
    color: '#c9a84c',
  },
}
