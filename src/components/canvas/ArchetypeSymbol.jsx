import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { ARCHETYPES } from '../../engines/archetypeEngine'

// Unique symbolic shape per archetype — particle path generators
// Each returns array of {x, y} normalized (-1 to 1)
const ARCHETYPE_SHAPES = {
  'The Innocent':  (n) => circle(n),          // Circle — purity, wholeness
  'The Explorer':  (n) => compass(n),         // Compass — direction, seeking
  'The Sage':      (n) => triangle(n),        // Triangle — wisdom, third eye
  'The Hero':      (n) => diamond(n),         // Diamond — strength, valor
  'The Outlaw':    (n) => lightning(n),        // Lightning — disruption, power
  'The Magician':  (n) => infinity(n),        // Infinity — transformation
  'The Lover':     (n) => heart(n),           // Heart — passion, connection
  'The Jester':    (n) => star5(n),           // Star — playfulness, sparkle
  'The Everyman':  (n) => square(n),          // Square — belonging, grounded
  'The Caregiver': (n) => cross(n),           // Cross — service, healing
  'The Creator':   (n) => spiral(n),          // Spiral — creation, emergence
  'The Ruler':     (n) => crown(n),           // Crown — authority, order
}

function circle(n)   { return Array.from({length:n}, (_,i) => { const a = (i/n)*Math.PI*2; return {x: Math.cos(a), y: Math.sin(a)} }) }
function triangle(n) { const pts = []; for (let i=0;i<n;i++) { const t=i/n; const s=Math.floor(t*3); const f=(t*3)%1; const v=[[0,-1],[0.87,0.5],[-0.87,0.5]]; const a=v[s],b=v[(s+1)%3]; pts.push({x:a.x+(b.x-a.x)*f, y:a.y+(b.y-a.y)*f}); } return pts }
function diamond(n)  { const pts = []; for (let i=0;i<n;i++) { const t=i/n; const s=Math.floor(t*4); const f=(t*4)%1; const v=[[0,-1],[0.7,0],[0,1],[-0.7,0]]; const a=v[s],b=v[(s+1)%4]; pts.push({x:a.x+(b.x-a.x)*f, y:a.y+(b.y-a.y)*f}); } return pts }
function square(n)   { const pts = []; for (let i=0;i<n;i++) { const t=i/n; const s=Math.floor(t*4); const f=(t*4)%1; const v=[[-0.8,-0.8],[0.8,-0.8],[0.8,0.8],[-0.8,0.8]]; const a=v[s],b=v[(s+1)%4]; pts.push({x:a.x+(b.x-a.x)*f, y:a.y+(b.y-a.y)*f}); } return pts }
function cross(n)    { const pts = []; const segs = [[-0.3,-1],[0.3,-1],[0.3,-0.3],[1,-0.3],[1,0.3],[0.3,0.3],[0.3,1],[-0.3,1],[-0.3,0.3],[-1,0.3],[-1,-0.3],[-0.3,-0.3]]; for (let i=0;i<n;i++) { const t=i/n; const idx=Math.floor(t*segs.length); const f=(t*segs.length)%1; const a=segs[idx],b=segs[(idx+1)%segs.length]; pts.push({x:a[0]+(b[0]-a[0])*f, y:a[1]+(b[1]-a[1])*f}); } return pts }

function star5(n) {
  const pts = []; const v = []
  for (let i=0;i<5;i++) { const a=(i/5)*Math.PI*2-Math.PI/2; v.push([Math.cos(a),Math.sin(a)]); const a2=((i+0.5)/5)*Math.PI*2-Math.PI/2; v.push([Math.cos(a2)*0.38,Math.sin(a2)*0.38]) }
  for (let i=0;i<n;i++) { const t=i/n; const idx=Math.floor(t*v.length); const f=(t*v.length)%1; const a=v[idx],b=v[(idx+1)%v.length]; pts.push({x:a[0]+(b[0]-a[0])*f, y:a[1]+(b[1]-a[1])*f}) }
  return pts
}

function heart(n) {
  return Array.from({length:n}, (_,i) => {
    const t = (i/n)*Math.PI*2
    const x = 16*Math.pow(Math.sin(t),3)/17
    const y = -(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/17
    return {x, y}
  })
}

function lightning(n) {
  const segs = [[0,-1],[0.15,-0.3],[-0.3,-0.1],[0.05,0.35],[-0.15,0.15],[0.3,1],[0,-0.1],[0.2,0.05],[-0.1,-0.25],[0.3,-0.55]]
  const pts = []
  for (let i=0;i<n;i++) { const t=i/n; const idx=Math.floor(t*segs.length); const f=(t*segs.length)%1; const a=segs[idx],b=segs[(idx+1)%segs.length]; pts.push({x:a[0]+(b[0]-a[0])*f, y:a[1]+(b[1]-a[1])*f}) }
  return pts
}

function infinity(n) {
  return Array.from({length:n}, (_,i) => {
    const t = (i/n)*Math.PI*2
    const s = Math.sin(t), c = Math.cos(t)
    return { x: c / (1 + s*s) * 0.9, y: s * c / (1 + s*s) * 0.9 }
  })
}

function spiral(n) {
  return Array.from({length:n}, (_,i) => {
    const t = (i/n) * 3 * Math.PI
    const r = 0.15 + (i/n) * 0.85
    return { x: r * Math.cos(t), y: r * Math.sin(t) }
  })
}

function compass(n) {
  const pts = []
  // 4 pointed compass with long N arrow
  const segs = [[0,-1],[0.15,-0.2],[0.8,0],[0.15,0.15],[0,0.8],[-0.15,0.15],[-0.8,0],[-0.15,-0.2]]
  for (let i=0;i<n;i++) { const t=i/n; const idx=Math.floor(t*segs.length); const f=(t*segs.length)%1; const a=segs[idx],b=segs[(idx+1)%segs.length]; pts.push({x:a[0]+(b[0]-a[0])*f, y:a[1]+(b[1]-a[1])*f}) }
  return pts
}

function crown(n) {
  const segs = [[-0.9,0.4],[-0.6,-0.5],[-0.3,0],[ 0,-0.8],[0.3,0],[0.6,-0.5],[0.9,0.4],[-0.9,0.4]]
  const pts = []
  for (let i=0;i<n;i++) { const t=i/n; const idx=Math.floor(t*(segs.length-1)); const f=(t*(segs.length-1))%1; const a=segs[idx],b=segs[idx+1]; pts.push({x:a[0]+(b[0]-a[0])*f, y:a[1]+(b[1]-a[1])*f}) }
  return pts
}

const PARTICLE_COUNT = 120

export default function ArchetypeSymbol() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Particles with current pos and target pos
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      tx: 0, ty: 0,
      vx: 0, vy: 0,
      size: 0.8 + Math.random() * 1.5,
      alpha: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
    }))

    let activeArchetype = null
    let storeUnsub
    try {
      const { useGolemStore } = require('../../store/useGolemStore')
      const profile = useGolemStore.getState().activeViewProfile || useGolemStore.getState().primaryProfile
      activeArchetype = profile?.archetypeType || useGolemStore.getState().archetypeType
      storeUnsub = useGolemStore.subscribe((state) => {
        const p = state.activeViewProfile || state.primaryProfile
        activeArchetype = p?.archetypeType || state.archetypeType
      })
    } catch (e) {}

    let currentShape = null
    let targetPositions = null

    function updateTargets() {
      const shapeFn = activeArchetype ? ARCHETYPE_SHAPES[activeArchetype] : null
      if (shapeFn) {
        targetPositions = shapeFn(PARTICLE_COUNT)
        particles.forEach((p, i) => {
          p.tx = targetPositions[i].x
          p.ty = targetPositions[i].y
        })
      } else {
        // Scatter in a loose circle
        particles.forEach((p) => {
          const a = Math.random() * Math.PI * 2
          const r = 0.3 + Math.random() * 0.6
          p.tx = Math.cos(a) * r
          p.ty = Math.sin(a) * r
        })
      }
      currentShape = activeArchetype
    }
    updateTargets()

    function draw(t) {
      if (currentShape !== activeArchetype) updateTargets()

      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W < 10 || H < 10) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const cx = W / 2, cy = H / 2
      const scale = Math.min(W, H) * 0.35

      // Subtle background glow
      if (activeArchetype) {
        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 1.6)
        bg.addColorStop(0, 'rgba(201,168,76,.06)')
        bg.addColorStop(1, 'rgba(201,168,76,0)')
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, W, H)
      }

      // Animate particles toward targets with spring physics
      for (const p of particles) {
        const dx = p.tx - p.x, dy = p.ty - p.y
        p.vx += dx * 0.02
        p.vy += dy * 0.02
        p.vx *= 0.92
        p.vy *= 0.92
        p.x += p.vx
        p.y += p.vy
        p.phase += 0.008

        const px = cx + p.x * scale
        const py = cy + p.y * scale
        const twinkle = p.alpha * (0.6 + 0.4 * Math.sin(t * 0.001 + p.phase))

        // Glow
        const glow = ctx.createRadialGradient(px, py, 0, px, py, p.size * 4)
        glow.addColorStop(0, `rgba(201,168,76,${twinkle * 0.3})`)
        glow.addColorStop(1, 'rgba(201,168,76,0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(px, py, p.size * 4, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,168,76,${twinkle})`
        ctx.fill()
      }

      // Draw connecting lines between nearby particles (faint)
      for (let i = 0; i < particles.length; i += 3) {
        for (let j = i + 1; j < Math.min(i + 8, particles.length); j++) {
          const a = particles[i], b = particles[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 0.4) {
            const alpha = (1 - d / 0.4) * 0.08
            ctx.beginPath()
            ctx.moveTo(cx + a.x * scale, cy + a.y * scale)
            ctx.lineTo(cx + b.x * scale, cy + b.y * scale)
            ctx.strokeStyle = `rgba(201,168,76,${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Label
      if (activeArchetype) {
        const archData = ARCHETYPES.find(a => a.name === activeArchetype)
        ctx.font = `bold ${Math.max(10, scale * 0.1)}px 'Cinzel',serif`
        ctx.fillStyle = `rgba(201,168,76,${0.6 + 0.15 * Math.sin(t * 0.0008)})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(activeArchetype.replace('The ',''), cx, cy + scale + 20)
        if (archData) {
          ctx.font = `${Math.max(7, scale * 0.06)}px 'Inconsolata',monospace`
          ctx.fillStyle = 'rgba(170,180,200,.4)'
          ctx.fillText(archData.drive, cx, cy + scale + 33)
        }
      } else {
        ctx.font = `bold ${Math.max(9, scale * 0.08)}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,0.35)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Take Quiz', cx, cy + scale + 20)
      }

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    animRef.current = requestAnimationFrame(draw)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      if (storeUnsub) storeUnsub()
    }
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
