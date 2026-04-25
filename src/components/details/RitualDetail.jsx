import { useState, useMemo, useRef, useEffect } from 'react'
import { useActiveProfile } from '../../hooks/useActiveProfile'
import { getRecommendedRituals, TRADITIONS, getRitualById } from '../../engines/ritualEngine'
import { getMoonPhase } from '../../engines/cycleEngine'

const ELEMENTS = { fire: '🔥', water: '💧', air: '🌬', earth: '🌍', spirit: '✦' }
const DIFFICULTY = { beginner: { label: 'Beginner', color: '#60b030' }, intermediate: { label: 'Intermediate', color: '#e8a040' }, advanced: { label: 'Advanced', color: '#d44070' } }
const TAU = Math.PI * 2

// ─── Step-aware particle animation ───
// Parses the ritual step text to determine what shape to render
// fire/candle → flame, breath → expanding circle, eyes → eye shape,
// heart → heart, water → waves, earth/sit → mountain, spin/turn → spiral, etc.

function detectShape(text) {
  if (!text) return 'sphere'
  const t = text.toLowerCase()
  if (t.includes('fire') || t.includes('flame') || t.includes('candle') || t.includes('light') || t.includes('burn') || t.includes('ignite')) return 'flame'
  if (t.includes('breath') || t.includes('inhale') || t.includes('exhale') || t.includes('pranayama')) return 'breath'
  if (t.includes('heart') || t.includes('love') || t.includes('compassion') || t.includes('kindness')) return 'heart'
  if (t.includes('eye') || t.includes('gaze') || t.includes('see') || t.includes('vision') || t.includes('third eye') || t.includes('perceive')) return 'eye'
  if (t.includes('water') || t.includes('ocean') || t.includes('river') || t.includes('wave') || t.includes('flow') || t.includes('lake')) return 'water'
  if (t.includes('earth') || t.includes('ground') || t.includes('mountain') || t.includes('root') || t.includes('floor') || t.includes('sit')) return 'mountain'
  if (t.includes('spin') || t.includes('turn') || t.includes('whirl') || t.includes('orbit') || t.includes('spiral') || t.includes('circl')) return 'spiral'
  if (t.includes('tree') || t.includes('spine') || t.includes('channel') || t.includes('pillar') || t.includes('vertical')) return 'tree'
  if (t.includes('star') || t.includes('crown') || t.includes('above') || t.includes('heaven') || t.includes('sky') || t.includes('divine')) return 'star'
  if (t.includes('hand') || t.includes('palm') || t.includes('touch') || t.includes('finger')) return 'hands'
  if (t.includes('silence') || t.includes('still') || t.includes('quiet') || t.includes('listen') || t.includes('rest')) return 'stillness'
  if (t.includes('sun') || t.includes('sunrise') || t.includes('dawn') || t.includes('east')) return 'sun'
  if (t.includes('moon') || t.includes('lunar') || t.includes('night')) return 'moon'
  if (t.includes('speak') || t.includes('chant') || t.includes('mantra') || t.includes('vibrat') || t.includes('voice') || t.includes('repeat') || t.includes('say')) return 'sound'
  return 'sphere'
}

function generateShapePoints(shape, count) {
  const pts = []
  for (let i = 0; i < count; i++) {
    const t = i / count
    let x = 0, y = 0, hueBase = Math.random()
    switch (shape) {
      case 'flame': {
        // Teardrop flame shape, particles rise
        const w = (1 - t) * 0.4 * (0.5 + 0.5 * Math.sin(t * 8))
        x = (Math.random() - 0.5) * w
        y = -0.6 + t * 1.4 // bottom to top
        hueBase = t < 0.4 ? Math.random() * 0.15 : t < 0.7 ? 0.15 + Math.random() * 0.15 : 0.3 + Math.random() * 0.25
        break
      }
      case 'breath': {
        // Concentric expanding/contracting rings
        const ring = Math.floor(t * 5)
        const a = Math.random() * TAU
        const r = 0.12 + ring * 0.15
        x = Math.cos(a) * r; y = Math.sin(a) * r
        hueBase = 0.55 + Math.random() * 0.15
        break
      }
      case 'heart': {
        // Heart curve (parametric)
        const a = t * TAU
        x = 0.5 * 16 * Math.pow(Math.sin(a), 3) / 16
        y = 0.5 * (13 * Math.cos(a) - 5 * Math.cos(2*a) - 2 * Math.cos(3*a) - Math.cos(4*a)) / 16
        hueBase = 0.7 + Math.random() * 0.15
        break
      }
      case 'eye': {
        // Almond eye shape with iris
        if (t < 0.6) {
          // Eye outline (two arcs)
          const a = (t / 0.6) * Math.PI
          const upper = t < 0.3
          x = Math.cos(a) * 0.7
          y = Math.sin(a) * (upper ? 0.35 : 0.35) * (upper ? 1 : -1)
          if (t >= 0.3) y = -Math.sin((t-0.3)/0.3 * Math.PI) * 0.35
        } else {
          // Iris circle
          const a = Math.random() * TAU
          const r = Math.random() * 0.2
          x = Math.cos(a) * r; y = Math.sin(a) * r
        }
        hueBase = 0.55 + Math.random() * 0.2
        break
      }
      case 'water': {
        // Sine waves layered
        const row = Math.floor(t * 5)
        const wt = (t * 5) % 1
        x = -0.8 + wt * 1.6
        y = -0.4 + row * 0.2 + Math.sin(wt * TAU * 2 + row) * 0.08
        hueBase = 0.55 + Math.random() * 0.15
        break
      }
      case 'mountain': {
        // Triangle mountain with base
        if (t < 0.6) {
          // Mountain triangle
          const mt = t / 0.6
          const side = mt < 0.5 ? 0 : 1
          const st = (mt * 2) % 1
          if (side === 0) { x = -0.6 * (1 - st); y = -0.5 + st * 1.0 }
          else { x = 0.6 * (1 - st); y = 0.5 - st * 1.0 }
          x += (Math.random() - 0.5) * 0.06
        } else {
          // Ground line
          x = (Math.random() - 0.5) * 1.4; y = -0.5 + (Math.random() - 0.5) * 0.06
        }
        hueBase = 0.85 + Math.random() * 0.15
        break
      }
      case 'spiral': {
        const a = t * TAU * 4
        const r = 0.05 + t * 0.75
        x = Math.cos(a) * r; y = Math.sin(a) * r
        hueBase = t
        break
      }
      case 'tree': {
        // Trunk + branches
        if (t < 0.3) {
          // Trunk
          x = (Math.random() - 0.5) * 0.08; y = -0.7 + t / 0.3 * 1.0
        } else {
          // Branches radiating from top
          const branch = Math.floor((t - 0.3) / 0.7 * 7)
          const bt = ((t - 0.3) / 0.7 * 7) % 1
          const a = -Math.PI/2 + (branch / 7 - 0.5) * Math.PI * 0.8
          const r = bt * 0.5
          x = Math.cos(a) * r; y = 0.3 + Math.sin(a) * r
        }
        hueBase = 0.85 + Math.random() * 0.15
        break
      }
      case 'star': {
        // 5-pointed star
        const points = 5
        const a = t * TAU
        const spiky = Math.floor(a / (TAU / points / 2)) % 2 === 0
        const r = spiky ? 0.7 : 0.3
        x = Math.cos(a - Math.PI/2) * r; y = Math.sin(a - Math.PI/2) * r
        hueBase = Math.random() * 0.3
        break
      }
      case 'hands': {
        // Two palm shapes (circles with finger lines)
        const hand = t < 0.5 ? -1 : 1
        const ht = (t * 2) % 1
        if (ht < 0.6) {
          // Palm circle
          const a = Math.random() * TAU; const r = Math.random() * 0.25
          x = hand * 0.3 + Math.cos(a) * r; y = Math.sin(a) * r
        } else {
          // Fingers
          const finger = Math.floor((ht - 0.6) / 0.4 * 5)
          const ft = ((ht - 0.6) / 0.4 * 5) % 1
          const fa = (-0.4 + finger * 0.2)
          x = hand * 0.3 + Math.sin(fa) * ft * 0.35; y = 0.25 + ft * 0.35
        }
        hueBase = 0.0 + Math.random() * 0.3
        break
      }
      case 'stillness': {
        // Single point expanding/contracting — sparse, centered
        const a = Math.random() * TAU
        const r = Math.random() * 0.15 + Math.random() * Math.random() * 0.4
        x = Math.cos(a) * r; y = Math.sin(a) * r
        hueBase = 0.0 + Math.random() * 0.25
        break
      }
      case 'sun': {
        // Circle with rays
        if (t < 0.5) {
          const a = Math.random() * TAU; const r = Math.random() * 0.25
          x = Math.cos(a) * r; y = Math.sin(a) * r
        } else {
          const ray = Math.floor((t - 0.5) * 2 * 12)
          const rt = ((t - 0.5) * 24) % 1
          const a = ray * TAU / 12
          const r = 0.3 + rt * 0.45
          x = Math.cos(a) * r; y = Math.sin(a) * r
        }
        hueBase = Math.random() * 0.3
        break
      }
      case 'moon': {
        // Crescent
        const a = Math.random() * TAU
        const r1 = 0.5, r2 = 0.4, offset = 0.2
        const px = Math.cos(a) * r1, py = Math.sin(a) * r1
        const dist = Math.sqrt((px - offset) ** 2 + py ** 2)
        if (dist > r2) { x = px; y = py } else { x = px + 0.15; y = py }
        hueBase = 0.55 + Math.random() * 0.15
        break
      }
      case 'sound': {
        // Sound waves — concentric arcs emanating from center-left
        const wave = Math.floor(t * 5)
        const wt = (t * 5) % 1
        const a = (wt - 0.5) * Math.PI * 0.8
        const r = 0.15 + wave * 0.14
        x = -0.3 + Math.cos(a) * r; y = Math.sin(a) * r
        hueBase = 0.0 + Math.random() * 0.3
        break
      }
      default: {
        const a = Math.random() * TAU; const r = Math.random() * 0.6
        x = Math.cos(a) * r; y = Math.sin(a) * r
      }
    }
    pts.push({ x, y, size: Math.random() * 2.2 + 0.8, phase: Math.random() * TAU, hue: hueBase, speed: 0.3 + Math.random() * 0.7 })
  }
  return pts
}

// Color palettes per shape type
function getShapeColor(shape, hue, alpha) {
  switch (shape) {
    case 'flame': return hue < 0.15 ? `rgba(255,200,60,${alpha})` : hue < 0.3 ? `rgba(255,140,30,${alpha})` : `rgba(255,80,20,${alpha})`
    case 'water': return hue < 0.6 ? `rgba(80,160,240,${alpha})` : `rgba(120,200,255,${alpha})`
    case 'heart': return hue < 0.75 ? `rgba(230,60,120,${alpha})` : `rgba(255,120,160,${alpha})`
    case 'breath': return `rgba(160,200,255,${alpha})`
    case 'mountain': case 'tree': return hue < 0.9 ? `rgba(100,180,80,${alpha})` : `rgba(160,140,100,${alpha})`
    case 'sun': return hue < 0.15 ? `rgba(255,220,80,${alpha})` : `rgba(255,180,40,${alpha})`
    case 'moon': return `rgba(200,210,240,${alpha})`
    case 'sound': return hue < 0.15 ? `rgba(224,184,90,${alpha})` : `rgba(200,170,255,${alpha})`
    case 'stillness': return `rgba(200,200,220,${alpha})`
    default: {
      if (hue < .3) return `rgba(224,184,90,${alpha})`
      if (hue < .55) return `rgba(242,216,140,${alpha})`
      if (hue < .7) return `rgba(140,166,224,${alpha})`
      if (hue < .85) return `rgba(216,90,140,${alpha})`
      return `rgba(64,200,172,${alpha})`
    }
  }
}

function InlineParticles({ stepText, active }) {
  const canvasRef = useRef(null)
  const particlesRef = useRef(null)
  const shapeRef = useRef('sphere')
  const targetRef = useRef(null)
  const transitionRef = useRef(0) // 0=at current, 1=at target

  // When step text changes, generate new target positions
  useEffect(() => {
    const shape = detectShape(stepText)
    shapeRef.current = shape
    const newPts = generateShapePoints(shape, 600)
    if (!particlesRef.current) {
      // First render — set directly
      particlesRef.current = newPts
    } else {
      // Animate transition: store target, let draw loop interpolate
      targetRef.current = newPts
      transitionRef.current = 0
    }
  }, [stepText])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let raf

    function draw(time) {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.offsetWidth, H = canvas.offsetHeight
      if (W < 5 || H < 5) { raf = requestAnimationFrame(draw); return }
      canvas.width = W * dpr; canvas.height = H * dpr
      const ctx = canvas.getContext('2d')
      if (!ctx) { raf = requestAnimationFrame(draw); return }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const particles = particlesRef.current
      if (!particles || particles.length === 0) { raf = requestAnimationFrame(draw); return }

      // Transition interpolation
      if (targetRef.current && transitionRef.current < 1) {
        transitionRef.current = Math.min(1, transitionRef.current + 0.025)
        const lerp = transitionRef.current
        const target = targetRef.current
        for (let i = 0; i < particles.length && i < target.length; i++) {
          particles[i].x = particles[i].x * (1-lerp) + target[i].x * lerp
          particles[i].y = particles[i].y * (1-lerp) + target[i].y * lerp
          particles[i].hue = particles[i].hue * (1-lerp) + target[i].hue * lerp
        }
        if (lerp >= 1) {
          particlesRef.current = target
          targetRef.current = null
        }
      }

      const cx = W/2, cy = H/2, scale = Math.min(W, H) * 0.38
      const t = time * 0.001
      const shape = shapeRef.current

      // Shape-specific animation modifiers
      const isFlame = shape === 'flame'
      const isBreath = shape === 'breath'
      const isSpiral = shape === 'spiral'

      for (const p of particles) {
        let px = p.x, py = p.y

        // Shape-specific motion
        if (isFlame) {
          // Flames flicker and rise
          px += Math.sin(t * 3 + p.phase * 5) * 0.04
          py += Math.sin(t * 2 + p.phase) * 0.02 + t * 0.01 % 0.05
        } else if (isBreath) {
          // Breathing expansion/contraction
          const breathScale = 1 + 0.2 * Math.sin(t * 0.8)
          px *= breathScale; py *= breathScale
        } else if (isSpiral) {
          // Slow rotation
          const a = t * 0.3
          const rx = px * Math.cos(a) - py * Math.sin(a)
          const ry = px * Math.sin(a) + py * Math.cos(a)
          px = rx; py = ry
        } else {
          // Default gentle breathing
          const b = 1 + 0.04 * Math.sin(t * 1.5 + p.phase)
          px *= b; py *= b
        }

        // Gentle float for all
        py += Math.sin(t * 0.6 + p.phase) * 0.008

        const sx = cx + px * scale
        const sy = cy - py * scale
        const alpha = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.2 * p.speed + p.phase))
        const r = p.size * (active ? 1.2 : 0.9)

        // Glow
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 3.5)
        grd.addColorStop(0, getShapeColor(shape, p.hue, alpha.toFixed(2)))
        grd.addColorStop(1, 'transparent')
        ctx.beginPath(); ctx.arc(sx, sy, r * 3.5, 0, TAU); ctx.fillStyle = grd; ctx.fill()

        // Core
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, TAU)
        ctx.fillStyle = getShapeColor(shape, p.hue, Math.min(1, alpha + 0.3).toFixed(2)); ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => { if (raf) cancelAnimationFrame(raf) }
  }, [active])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}

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

        {/* Step-aware particle visualization — shape adapts to instruction content */}
        <div style={{ height: 220, position: 'relative', margin: '0 20px', borderRadius: 12, overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
          <InlineParticles stepText={step} active={true} />
        </div>

        {/* Step content */}
        <div style={{ padding: '20px 24px', textAlign: 'center', minHeight: 180 }}>
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
        <div style={{ margin: '16px 20px', padding: 20, borderRadius: 12, background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.15)', position: 'relative', overflow: 'hidden' }}>
          {/* Background particle visualization */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }}>
            <InlineParticles stepText={result.topRecommendation.description} active={false} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
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
