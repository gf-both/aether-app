import { useState, useMemo, useRef, useEffect } from 'react'
import { useComputedProfile } from '../../hooks/useActiveProfile'
import { getRecommendedRituals, TRADITIONS, getRitualById } from '../../engines/ritualEngine'
import { getMoonPhase } from '../../engines/cycleEngine'

const ELEMENTS = { fire: '🔥', water: '💧', air: '🌬', earth: '🌍', spirit: '✦' }
const DIFFICULTY = { beginner: { label: 'Beginner', color: '#60b030' }, intermediate: { label: 'Intermediate', color: '#e8a040' }, advanced: { label: 'Advanced', color: '#d44070' } }
const TAU = Math.PI * 2

// ─── Step-aware ritual visualization ───
// Uses Canvas 2D paths, lines, curves, and gradients — NOT particle blobs.
// Each shape is rendered as clean geometry with glow, animated smoothly.

function detectShape(text) {
  if (!text) return 'sphere'
  const t = text.toLowerCase()
  if (t.includes('fire') || t.includes('flame') || t.includes('candle') || t.includes('burn') || t.includes('ignite') || t.includes('copal')) return 'flame'
  if (t.includes('breath') || t.includes('inhale') || t.includes('exhale') || t.includes('pranayama')) return 'breath'
  if (t.includes('heart') || t.includes('love') || t.includes('compassion') || t.includes('kindness')) return 'heart'
  if (t.includes('eye') || t.includes('gaze') || t.includes('see') || t.includes('vision') || t.includes('third eye') || t.includes('perceive')) return 'eye'
  if (t.includes('water') || t.includes('ocean') || t.includes('river') || t.includes('wave') || t.includes('flow') || t.includes('lake') || t.includes('offering')) return 'water'
  if (t.includes('earth') || t.includes('ground') || t.includes('mountain') || t.includes('root') || t.includes('floor') || t.includes('sit') || t.includes('descen')) return 'mountain'
  if (t.includes('spin') || t.includes('turn') || t.includes('whirl') || t.includes('orbit') || t.includes('spiral') || t.includes('circl') || t.includes('direction')) return 'spiral'
  if (t.includes('tree') || t.includes('spine') || t.includes('channel') || t.includes('pillar') || t.includes('vertical') || t.includes('central') || t.includes('crown')) return 'tree'
  if (t.includes('star') || t.includes('heaven') || t.includes('sky') || t.includes('divine') || t.includes('light') || t.includes('white')) return 'star'
  if (t.includes('hand') || t.includes('palm') || t.includes('touch') || t.includes('finger') || t.includes('lips') || t.includes('mouth')) return 'hands'
  if (t.includes('silence') || t.includes('still') || t.includes('quiet') || t.includes('listen') || t.includes('rest') || t.includes('awareness')) return 'stillness'
  if (t.includes('sun') || t.includes('sunrise') || t.includes('dawn') || t.includes('east')) return 'sun'
  if (t.includes('moon') || t.includes('lunar') || t.includes('night')) return 'moon'
  if (t.includes('speak') || t.includes('chant') || t.includes('mantra') || t.includes('vibrat') || t.includes('voice') || t.includes('repeat') || t.includes('say')) return 'sound'
  return 'sphere'
}

// ─── Draw functions: clean line/path geometry with glow ───

const SHAPE_COLORS = {
  flame:     { primary: '#ff9030', secondary: '#ff5010', glow: 'rgba(255,140,40,' },
  breath:    { primary: '#80c8ff', secondary: '#a0d8ff', glow: 'rgba(140,200,255,' },
  heart:     { primary: '#e04080', secondary: '#ff6090', glow: 'rgba(230,80,140,' },
  eye:       { primary: '#90a8e0', secondary: '#b0c0ff', glow: 'rgba(160,180,240,' },
  water:     { primary: '#40a0e8', secondary: '#70c0ff', glow: 'rgba(80,170,240,' },
  mountain:  { primary: '#70b050', secondary: '#90c870', glow: 'rgba(110,180,80,' },
  spiral:    { primary: '#c9a84c', secondary: '#e0c070', glow: 'rgba(200,170,80,' },
  tree:      { primary: '#60a848', secondary: '#a0c080', glow: 'rgba(100,170,70,' },
  star:      { primary: '#e0c050', secondary: '#f0d878', glow: 'rgba(230,200,90,' },
  hands:     { primary: '#d0a860', secondary: '#e0c080', glow: 'rgba(210,170,100,' },
  stillness: { primary: '#a0a8b8', secondary: '#c0c8d8', glow: 'rgba(180,185,200,' },
  sun:       { primary: '#f0b030', secondary: '#ffd060', glow: 'rgba(240,180,50,' },
  moon:      { primary: '#b0b8d8', secondary: '#d0d8f0', glow: 'rgba(180,190,220,' },
  sound:     { primary: '#c0a0e0', secondary: '#d8c0f0', glow: 'rgba(190,160,225,' },
  sphere:    { primary: '#c9a84c', secondary: '#e0c070', glow: 'rgba(200,170,80,' },
}

function drawShape(ctx, shape, cx, cy, scale, t) {
  const col = SHAPE_COLORS[shape] || SHAPE_COLORS.sphere
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'

  // Outer glow layer
  ctx.shadowColor = col.glow + '0.4)'; ctx.shadowBlur = 20

  switch (shape) {
    case 'flame': {
      // Animated flame with multiple layers
      for (let layer = 0; layer < 3; layer++) {
        const flicker = Math.sin(t * 4 + layer * 2) * 0.05
        const sway = Math.sin(t * 2.5 + layer) * scale * 0.06
        const h = scale * (0.7 - layer * 0.15)
        const w = scale * (0.25 - layer * 0.05)
        ctx.beginPath()
        ctx.moveTo(cx + sway, cy + h * 0.5)
        ctx.bezierCurveTo(cx - w + sway + flicker * scale, cy + h * 0.1, cx - w * 0.6 + sway, cy - h * 0.4, cx + sway, cy - h * 0.5 + Math.sin(t * 5) * scale * 0.03)
        ctx.bezierCurveTo(cx + w * 0.6 + sway, cy - h * 0.4, cx + w + sway - flicker * scale, cy + h * 0.1, cx + sway, cy + h * 0.5)
        ctx.closePath()
        const alpha = 0.35 - layer * 0.1
        ctx.fillStyle = layer === 0 ? `rgba(255,80,20,${alpha})` : layer === 1 ? `rgba(255,150,40,${alpha})` : `rgba(255,220,80,${alpha})`
        ctx.fill()
        ctx.strokeStyle = layer === 2 ? col.secondary : col.primary
        ctx.lineWidth = 1.5 - layer * 0.3; ctx.globalAlpha = 0.6 - layer * 0.15; ctx.stroke(); ctx.globalAlpha = 1
      }
      break
    }
    case 'breath': {
      const breathPhase = Math.sin(t * 0.8)
      for (let ring = 0; ring < 4; ring++) {
        const r = scale * (0.15 + ring * 0.15) * (1 + breathPhase * 0.25)
        const alpha = 0.5 - ring * 0.1
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU)
        ctx.strokeStyle = col.glow + alpha + ')'; ctx.lineWidth = 2 - ring * 0.3; ctx.stroke()
      }
      // Center dot pulses
      const cr = scale * 0.06 * (1.2 + breathPhase * 0.3)
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr)
      cg.addColorStop(0, col.glow + '0.8)'); cg.addColorStop(1, 'transparent')
      ctx.beginPath(); ctx.arc(cx, cy, cr, 0, TAU); ctx.fillStyle = cg; ctx.fill()
      break
    }
    case 'heart': {
      const beat = 1 + Math.sin(t * 2) * 0.06
      const s = scale * 0.028 * beat
      ctx.beginPath()
      for (let i = 0; i <= 200; i++) {
        const a = (i / 200) * TAU
        const hx = cx + s * 16 * Math.pow(Math.sin(a), 3)
        const hy = cy - s * (13 * Math.cos(a) - 5 * Math.cos(2*a) - 2 * Math.cos(3*a) - Math.cos(4*a))
        i === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy)
      }
      ctx.closePath()
      ctx.fillStyle = col.glow + '0.15)'; ctx.fill()
      ctx.strokeStyle = col.primary; ctx.lineWidth = 2; ctx.stroke()
      // Inner glow
      const hg = ctx.createRadialGradient(cx, cy - scale * 0.05, 0, cx, cy, scale * 0.35)
      hg.addColorStop(0, col.glow + '0.25)'); hg.addColorStop(1, 'transparent')
      ctx.beginPath(); ctx.arc(cx, cy - scale * 0.05, scale * 0.35, 0, TAU); ctx.fillStyle = hg; ctx.fill()
      break
    }
    case 'eye': {
      const blink = Math.max(0, Math.sin(t * 0.3)) // open/close
      const eyeH = scale * 0.28 * blink
      // Upper lid
      ctx.beginPath(); ctx.moveTo(cx - scale * 0.5, cy)
      ctx.quadraticCurveTo(cx, cy - eyeH, cx + scale * 0.5, cy)
      // Lower lid
      ctx.quadraticCurveTo(cx, cy + eyeH * 0.7, cx - scale * 0.5, cy)
      ctx.closePath()
      ctx.fillStyle = col.glow + '0.1)'; ctx.fill()
      ctx.strokeStyle = col.primary; ctx.lineWidth = 1.5; ctx.stroke()
      // Iris
      if (blink > 0.3) {
        const ir = scale * 0.12 * blink
        const ig = ctx.createRadialGradient(cx, cy, ir * 0.3, cx, cy, ir)
        ig.addColorStop(0, col.glow + '0.6)'); ig.addColorStop(0.7, col.primary); ig.addColorStop(1, 'transparent')
        ctx.beginPath(); ctx.arc(cx, cy, ir, 0, TAU); ctx.fillStyle = ig; ctx.fill()
        // Pupil
        ctx.beginPath(); ctx.arc(cx, cy, ir * 0.35, 0, TAU); ctx.fillStyle = 'rgba(10,8,20,0.8)'; ctx.fill()
        // Catchlight
        ctx.beginPath(); ctx.arc(cx + ir * 0.2, cy - ir * 0.2, ir * 0.12, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fill()
      }
      break
    }
    case 'water': {
      for (let row = 0; row < 5; row++) {
        const yy = cy + (row - 2) * scale * 0.18
        const alpha = 0.4 - Math.abs(row - 2) * 0.08
        ctx.beginPath()
        for (let x = -1; x <= 1; x += 0.01) {
          const wx = cx + x * scale * 0.7
          const wy = yy + Math.sin(x * 8 + t * 2 + row * 1.5) * scale * 0.06
          x === -1 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy)
        }
        ctx.strokeStyle = col.glow + alpha + ')'; ctx.lineWidth = 2.5 - row * 0.3; ctx.stroke()
      }
      break
    }
    case 'mountain': {
      // Mountain silhouette with snow cap
      ctx.beginPath()
      ctx.moveTo(cx - scale * 0.7, cy + scale * 0.35)
      ctx.lineTo(cx - scale * 0.1, cy - scale * 0.4)
      ctx.lineTo(cx, cy - scale * 0.35) // snow cap notch
      ctx.lineTo(cx + scale * 0.1, cy - scale * 0.4)
      ctx.lineTo(cx + scale * 0.7, cy + scale * 0.35)
      ctx.closePath()
      ctx.fillStyle = col.glow + '0.1)'; ctx.fill()
      ctx.strokeStyle = col.primary; ctx.lineWidth = 1.5; ctx.stroke()
      // Ground line
      ctx.beginPath(); ctx.moveTo(cx - scale * 0.8, cy + scale * 0.35); ctx.lineTo(cx + scale * 0.8, cy + scale * 0.35)
      ctx.strokeStyle = col.glow + '0.3)'; ctx.lineWidth = 1; ctx.stroke()
      // Snow cap glow
      const sg = ctx.createRadialGradient(cx, cy - scale * 0.35, 0, cx, cy - scale * 0.2, scale * 0.15)
      sg.addColorStop(0, 'rgba(220,230,255,0.3)'); sg.addColorStop(1, 'transparent')
      ctx.beginPath(); ctx.arc(cx, cy - scale * 0.35, scale * 0.15, 0, TAU); ctx.fillStyle = sg; ctx.fill()
      break
    }
    case 'spiral': {
      ctx.beginPath()
      for (let i = 0; i <= 300; i++) {
        const a = (i / 300) * TAU * 3 + t * 0.3
        const r = (i / 300) * scale * 0.55
        const sx = cx + Math.cos(a) * r, sy = cy + Math.sin(a) * r
        i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy)
      }
      ctx.strokeStyle = col.primary; ctx.lineWidth = 2; ctx.globalAlpha = 0.6; ctx.stroke(); ctx.globalAlpha = 1
      break
    }
    case 'tree': {
      // Trunk
      ctx.beginPath(); ctx.moveTo(cx, cy + scale * 0.5); ctx.lineTo(cx, cy - scale * 0.1)
      ctx.strokeStyle = col.glow + '0.5)'; ctx.lineWidth = 3; ctx.stroke()
      // Branches
      const branches = 7
      for (let b = 0; b < branches; b++) {
        const a = -Math.PI / 2 + (b / (branches - 1) - 0.5) * Math.PI * 0.8
        const len = scale * (0.25 + Math.sin(t * 0.5 + b) * 0.03)
        ctx.beginPath(); ctx.moveTo(cx, cy - scale * 0.1)
        ctx.lineTo(cx + Math.cos(a) * len, cy - scale * 0.1 + Math.sin(a) * len)
        ctx.strokeStyle = col.glow + '0.4)'; ctx.lineWidth = 1.5; ctx.stroke()
        // Leaf glow at tip
        const lg = ctx.createRadialGradient(cx + Math.cos(a) * len, cy - scale * 0.1 + Math.sin(a) * len, 0, cx + Math.cos(a) * len, cy - scale * 0.1 + Math.sin(a) * len, scale * 0.06)
        lg.addColorStop(0, col.glow + '0.4)'); lg.addColorStop(1, 'transparent')
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * len, cy - scale * 0.1 + Math.sin(a) * len, scale * 0.06, 0, TAU); ctx.fillStyle = lg; ctx.fill()
      }
      break
    }
    case 'star': {
      const rot = t * 0.15
      ctx.beginPath()
      for (let i = 0; i <= 10; i++) {
        const a = (i / 10) * TAU - Math.PI / 2 + rot
        const r = i % 2 === 0 ? scale * 0.5 : scale * 0.2
        const sx = cx + Math.cos(a) * r, sy = cy + Math.sin(a) * r
        i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy)
      }
      ctx.closePath()
      ctx.fillStyle = col.glow + '0.12)'; ctx.fill()
      ctx.strokeStyle = col.primary; ctx.lineWidth = 1.5; ctx.stroke()
      // Center glow
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.15)
      cg.addColorStop(0, col.glow + '0.5)'); cg.addColorStop(1, 'transparent')
      ctx.beginPath(); ctx.arc(cx, cy, scale * 0.15, 0, TAU); ctx.fillStyle = cg; ctx.fill()
      break
    }
    case 'sound': {
      // Sound waves emanating from left
      const ox = cx - scale * 0.3
      for (let w = 0; w < 5; w++) {
        const r = scale * (0.1 + w * 0.1) + Math.sin(t * 3 + w) * scale * 0.02
        const alpha = 0.5 - w * 0.08
        ctx.beginPath(); ctx.arc(ox, cy, r, -Math.PI * 0.4, Math.PI * 0.4)
        ctx.strokeStyle = col.glow + alpha + ')'; ctx.lineWidth = 2.5 - w * 0.3; ctx.stroke()
      }
      // Source dot
      ctx.beginPath(); ctx.arc(ox, cy, scale * 0.04, 0, TAU); ctx.fillStyle = col.primary; ctx.fill()
      break
    }
    case 'sun': {
      // Sun disc + rays
      const pulse = 1 + Math.sin(t * 1.5) * 0.05
      const sr = scale * 0.18 * pulse
      const sg = ctx.createRadialGradient(cx, cy, sr * 0.3, cx, cy, sr)
      sg.addColorStop(0, col.glow + '0.7)'); sg.addColorStop(1, col.glow + '0.1)')
      ctx.beginPath(); ctx.arc(cx, cy, sr, 0, TAU); ctx.fillStyle = sg; ctx.fill()
      // Rays
      for (let r = 0; r < 12; r++) {
        const a = r * TAU / 12 + t * 0.1
        const inner = sr * 1.3, outer = sr * 1.3 + scale * 0.2
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner)
        ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer)
        ctx.strokeStyle = col.glow + '0.35)'; ctx.lineWidth = 2; ctx.stroke()
      }
      break
    }
    case 'moon': {
      const mr = scale * 0.3
      // Outer circle
      ctx.beginPath(); ctx.arc(cx, cy, mr, 0, TAU)
      ctx.fillStyle = col.glow + '0.12)'; ctx.fill()
      ctx.strokeStyle = col.primary; ctx.lineWidth = 1.5; ctx.stroke()
      // Inner cutout for crescent
      ctx.beginPath(); ctx.arc(cx + mr * 0.4, cy, mr * 0.85, 0, TAU)
      ctx.fillStyle = 'rgba(5,3,15,0.8)'; ctx.fill()
      break
    }
    case 'hands': {
      // Open palms
      for (const side of [-1, 1]) {
        const hx = cx + side * scale * 0.22
        // Palm oval
        ctx.beginPath(); ctx.ellipse(hx, cy + scale * 0.05, scale * 0.12, scale * 0.16, 0, 0, TAU)
        ctx.strokeStyle = col.glow + '0.35)'; ctx.lineWidth = 1.5; ctx.stroke()
        // Fingers
        for (let f = 0; f < 5; f++) {
          const fa = (-0.5 + f * 0.25) * side
          const fx = hx + Math.sin(fa) * scale * 0.08
          const fy = cy - scale * 0.12
          ctx.beginPath(); ctx.moveTo(fx, fy)
          ctx.lineTo(fx + Math.sin(fa) * scale * 0.15, fy - scale * 0.18 - (f === 2 ? scale * 0.04 : 0))
          ctx.strokeStyle = col.glow + '0.3)'; ctx.lineWidth = 1.2; ctx.stroke()
        }
      }
      break
    }
    case 'stillness': {
      // Single pulsing glow — minimal
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.6)
      const sr = scale * 0.15 * (0.8 + pulse * 0.4)
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sr * 3)
      sg.addColorStop(0, col.glow + (0.3 + pulse * 0.2).toFixed(2) + ')')
      sg.addColorStop(0.5, col.glow + '0.08)'); sg.addColorStop(1, 'transparent')
      ctx.beginPath(); ctx.arc(cx, cy, sr * 3, 0, TAU); ctx.fillStyle = sg; ctx.fill()
      // Tiny center dot
      ctx.beginPath(); ctx.arc(cx, cy, 2, 0, TAU); ctx.fillStyle = col.primary; ctx.fill()
      break
    }
    default: {
      // Gentle orbiting dots
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU + t * 0.2
        const r = scale * 0.3
        const dx = cx + Math.cos(a) * r, dy = cy + Math.sin(a) * r
        ctx.beginPath(); ctx.arc(dx, dy, 2, 0, TAU)
        ctx.fillStyle = col.glow + '0.5)'; ctx.fill()
      }
    }
  }
  ctx.shadowBlur = 0
}

function InlineParticles({ stepText, active }) {
  const canvasRef = useRef(null)
  const shapeRef = useRef('sphere')

  useEffect(() => {
    shapeRef.current = detectShape(stepText)
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

      const cx = W / 2, cy = H / 2, scale = Math.min(W, H) * 0.4
      const t = time * 0.001

      drawShape(ctx, shapeRef.current, cx, cy, scale, t)

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => { if (raf) cancelAnimationFrame(raf) }
  }, [stepText, active])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}

export default function RitualDetail() {
  const profile = useComputedProfile()
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
            style={{ marginTop: 14, padding: '10px 28px', borderRadius: 20, background: '#b8860b', border: '2px solid #d4a017', color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: "'Cinzel',serif", letterSpacing: '.08em', cursor: 'pointer', transition: 'all .2s', boxShadow: '0 0 16px rgba(201,168,76,.35)' }}>
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
    background: '#1a1a2e', border: '2px solid #444',
    color: '#999', padding: '7px 16px', borderRadius: 14,
    fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'Cinzel',serif",
  },
  navBtn: {
    padding: '10px 22px', borderRadius: 16,
    background: '#252540', border: '2px solid #555',
    color: '#ccc', fontSize: 12, fontWeight: 700, fontFamily: "'Cinzel',serif",
    letterSpacing: '.06em', cursor: 'pointer', transition: 'all .2s',
  },
  filterPill: {
    padding: '6px 14px', borderRadius: 12, fontSize: 10,
    background: '#1a1a2e', border: '2px solid #444',
    color: '#999', cursor: 'pointer', fontFamily: "'Cinzel',serif",
    fontWeight: 700, letterSpacing: '.05em', transition: 'all .2s',
  },
  filterActive: {
    background: '#b8860b', borderColor: '#d4a017',
    color: '#fff',
  },
}
