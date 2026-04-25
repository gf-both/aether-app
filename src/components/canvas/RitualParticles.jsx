import { useRef, useEffect } from 'react'

/**
 * RitualParticles — Canvas 2D particle animation showing sacred geometry per tradition.
 * Uses 2D canvas instead of WebGL to avoid context limits (ParticleField already uses WebGL).
 *
 * Props:
 *   tradition - key: 'vedic','buddhist','kabbalah','sufi','egyptian','mayan','hermetic','celtic','tibetan','taoist','shamanic','yogic'
 *   active - whether the ritual is in progress (controls animation intensity)
 */

const TAU = Math.PI * 2

// ─── Shape generators — return [{x,y}] arrays ────────────────

function generatePoints(tradition, count) {
  const pts = []

  switch (tradition) {
    case 'vedic':
    case 'yogic': {
      // Sri Yantra — concentric triangles
      for (let i = 0; i < count; i++) {
        const ring = Math.floor(Math.random() * 5)
        const r = 0.2 + ring * 0.15
        const a = Math.random() * TAU
        const sides = 3
        const sectorAngle = TAU / sides
        const sector = Math.floor(a / sectorAngle)
        const edgeT = (a % sectorAngle) / sectorAngle
        const a1 = sector * sectorAngle - Math.PI / 2
        const a2 = (sector + 1) * sectorAngle - Math.PI / 2
        const flip = ring % 2 === 0 ? 1 : -1
        pts.push({
          x: (Math.cos(a1) * (1 - edgeT) + Math.cos(a2) * edgeT) * r,
          y: (Math.sin(a1) * (1 - edgeT) + Math.sin(a2) * edgeT) * r * flip,
        })
      }
      break
    }
    case 'buddhist': {
      // Dharma wheel — 8-spoked
      for (let i = 0; i < count; i++) {
        const t = Math.random()
        if (t < 0.35) {
          const a = Math.random() * TAU
          pts.push({ x: Math.cos(a) * 0.8, y: Math.sin(a) * 0.8 })
        } else if (t < 0.5) {
          const a = Math.random() * TAU
          pts.push({ x: Math.cos(a) * 0.2, y: Math.sin(a) * 0.2 })
        } else {
          const spoke = Math.floor(Math.random() * 8)
          const a = spoke * TAU / 8
          const r = 0.2 + Math.random() * 0.6
          pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r })
        }
      }
      break
    }
    case 'kabbalah':
    case 'hermetic': {
      // Tree of Life
      const seph = [[0,0.85],[-0.4,0.55],[0.4,0.55],[-0.4,0.15],[0.4,0.15],[0,-0.05],[-0.4,-0.3],[0.4,-0.3],[0,-0.5],[0,-0.85]]
      const paths = [[0,1],[0,2],[1,3],[2,4],[1,5],[2,5],[3,5],[4,5],[3,6],[4,7],[5,6],[5,7],[6,8],[7,8],[8,9],[5,8]]
      for (let i = 0; i < count; i++) {
        if (Math.random() < 0.35) {
          const si = Math.floor(Math.random() * seph.length)
          const r = Math.random() * 0.08
          const a = Math.random() * TAU
          pts.push({ x: seph[si][0] + Math.cos(a) * r, y: seph[si][1] + Math.sin(a) * r })
        } else {
          const pi = Math.floor(Math.random() * paths.length)
          const [a, b] = paths[pi]
          const t = Math.random()
          pts.push({ x: seph[a][0] * (1-t) + seph[b][0] * t, y: seph[a][1] * (1-t) + seph[b][1] * t })
        }
      }
      break
    }
    case 'sufi': {
      // Whirling spiral
      for (let i = 0; i < count; i++) {
        const t = i / count
        const a = t * TAU * 5
        const r = 0.05 + t * 0.8
        pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r })
      }
      break
    }
    case 'egyptian': {
      // Ankh
      for (let i = 0; i < count; i++) {
        const t = Math.random()
        if (t < 0.35) {
          const a = Math.random() * TAU
          pts.push({ x: Math.cos(a) * 0.3, y: Math.sin(a) * 0.45 + 0.4 })
        } else if (t < 0.65) {
          pts.push({ x: (Math.random() - 0.5) * 0.06, y: 0.4 - Math.random() * 1.5 })
        } else {
          pts.push({ x: (Math.random() - 0.5) * 1.0, y: 0.0 + (Math.random() - 0.5) * 0.06 })
        }
      }
      break
    }
    case 'mayan': {
      // Stepped pyramid
      for (let i = 0; i < count; i++) {
        const level = Math.floor(Math.random() * 5)
        const half = 0.8 - level * 0.14
        const yBase = -0.5 + level * 0.22
        const side = Math.floor(Math.random() * 4)
        const t = Math.random()
        if (side < 2) {
          pts.push({ x: -half + t * 2 * half, y: yBase + Math.random() * 0.18 })
        } else {
          pts.push({ x: side === 2 ? -half : half, y: yBase + t * 0.18 })
        }
      }
      break
    }
    case 'celtic': {
      // Triquetra
      for (let i = 0; i < count; i++) {
        const t = i / count
        const a = t * TAU
        const loop = Math.floor(t * 3)
        const offset = loop * TAU / 3
        const la = a * 3 + offset
        pts.push({
          x: (Math.cos(la) + Math.cos(la * 2) * 0.3) * 0.45,
          y: (Math.sin(la) + Math.sin(la * 2) * 0.3) * 0.45,
        })
      }
      break
    }
    case 'tibetan': {
      // Endless knot
      for (let i = 0; i < count; i++) {
        const t = i / count
        const a = t * TAU * 4
        pts.push({
          x: Math.sin(a * 2) * 0.55 * Math.cos(a * 0.5),
          y: Math.cos(a * 3) * 0.55,
        })
      }
      break
    }
    case 'taoist': {
      // Yin-yang
      for (let i = 0; i < count; i++) {
        const t = Math.random()
        if (t < 0.5) {
          const a = Math.random() * TAU
          pts.push({ x: Math.cos(a) * 0.75, y: Math.sin(a) * 0.75 })
        } else if (t < 0.75) {
          const a = Math.random() * Math.PI
          pts.push({ x: Math.cos(a) * 0.375, y: Math.sin(a) * 0.375 + 0.375 })
        } else {
          const a = Math.random() * Math.PI + Math.PI
          pts.push({ x: Math.cos(a) * 0.375, y: Math.sin(a) * 0.375 - 0.375 })
        }
      }
      break
    }
    case 'shamanic': {
      // Medicine wheel
      for (let i = 0; i < count; i++) {
        const t = Math.random()
        if (t < 0.4) {
          const a = Math.random() * TAU
          pts.push({ x: Math.cos(a) * 0.75, y: Math.sin(a) * 0.75 })
        } else if (t < 0.7) {
          const spoke = Math.floor(Math.random() * 4)
          const a = spoke * TAU / 4
          const r = Math.random() * 0.7
          pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r })
        } else {
          const a = Math.random() * TAU
          const r = 0.2 + Math.random() * 0.1
          pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r })
        }
      }
      break
    }
    default: {
      // Default: fibonacci sphere (flat projection)
      for (let i = 0; i < count; i++) {
        const a = Math.random() * TAU
        const r = Math.random() * 0.8
        pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r })
      }
    }
  }

  // Add per-particle properties
  return pts.map((p, i) => ({
    ...p,
    size: Math.random() * 2 + 0.8,
    phase: Math.random() * TAU,
    hue: Math.random(),
    speed: 0.3 + Math.random() * 0.7,
  }))
}

function getColor(hue, alpha) {
  if (hue < 0.3) return `rgba(224,184,90,${alpha})`       // gold
  if (hue < 0.55) return `rgba(242,216,140,${alpha})`      // light gold
  if (hue < 0.7) return `rgba(140,166,224,${alpha})`       // blue
  if (hue < 0.85) return `rgba(216,90,140,${alpha})`       // rose
  return `rgba(64,200,172,${alpha})`                       // teal
}

export default function RitualParticles({ tradition = 'vedic', active = false }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const particlesRef = useRef(null)

  useEffect(() => {
    particlesRef.current = generatePoints(tradition, 1200)
  }, [tradition])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function draw(time) {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      if (W < 10 || H < 10) { rafRef.current = requestAnimationFrame(draw); return }

      canvas.width = W * dpr
      canvas.height = H * dpr
      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const cx = W / 2, cy = H / 2
      const scale = Math.min(W, H) * 0.42
      const t = time * 0.001
      const particles = particlesRef.current
      if (!particles) { rafRef.current = requestAnimationFrame(draw); return }

      // Slow rotation
      const rotAngle = t * 0.15
      const cosR = Math.cos(rotAngle), sinR = Math.sin(rotAngle)

      for (const p of particles) {
        // Rotate
        const rx = p.x * cosR - p.y * sinR
        const ry = p.x * sinR + p.y * cosR

        // Breathing
        const breatheAmt = active ? 0.06 : 0.03
        const breathe = 1 + breatheAmt * Math.sin(t * 1.5 + p.phase)

        // Gentle float
        const floatY = Math.sin(t * 0.8 + p.phase) * 0.01

        const sx = cx + rx * scale * breathe
        const sy = cy - (ry + floatY) * scale * breathe

        // Alpha pulsing
        const alpha = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.2 * p.speed + p.phase))
        const color = getColor(p.hue, alpha.toFixed(2))

        // Draw particle with glow
        const r = p.size * (active ? 1.2 : 0.9)

        // Outer glow
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 3)
        grd.addColorStop(0, color)
        grd.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(sx, sy, r * 3, 0, TAU)
        ctx.fillStyle = grd
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(sx, sy, r, 0, TAU)
        ctx.fillStyle = getColor(p.hue, Math.min(1, alpha + 0.3).toFixed(2))
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [tradition, active])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}
