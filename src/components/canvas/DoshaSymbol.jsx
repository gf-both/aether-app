import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { DOSHA_DATA } from '../../engines/doshaEngine'

const DOSHA_COLORS = {
  vata:  { r: 130, g: 190, b: 235 },
  pitta: { r: 225, g: 110, b: 75 },
  kapha: { r: 100, g: 185, b: 120 },
}

// Symbolic shapes: Vata = wind spiral, Pitta = flame, Kapha = lotus
function windSpiral(n) {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * 4 * Math.PI
    const r = 0.1 + (i / n) * 0.85
    return { x: r * Math.cos(t) * 0.9, y: r * Math.sin(t) * 0.9 }
  })
}

function flame(n) {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2
    // Flame shape — wider at base, pointed at top
    const rBase = 0.5 + 0.3 * Math.cos(t * 2)
    const rTop = Math.max(0, 1 - Math.abs(t - Math.PI) / Math.PI)
    const r = rBase * 0.5 * (1 - rTop) + rTop * 0.15
    const x = Math.sin(t) * r
    const y = -Math.cos(t) * (0.3 + rTop * 0.7)
    return { x: x * 1.2, y }
  })
}

function lotus(n) {
  // 6-petal lotus
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2
    const petal = Math.abs(Math.sin(t * 3))
    const r = 0.35 + petal * 0.55
    return { x: Math.cos(t) * r * 0.85, y: Math.sin(t) * r * 0.85 }
  })
}

const DOSHA_SHAPES = { vata: windSpiral, pitta: flame, kapha: lotus }
const PARTICLE_COUNT = 160

export default function DoshaSymbol({ doshaType, scores }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let primary = null
    if (doshaType) {
      const parts = doshaType.split('-')
      primary = parts[0] ? parts[0].toLowerCase() : null
      if (primary && !DOSHA_COLORS[primary]) primary = null
    }

    const col = primary ? DOSHA_COLORS[primary] : { r: 201, g: 168, b: 76 }
    const shapeFn = primary ? DOSHA_SHAPES[primary] : null

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      tx: 0, ty: 0,
      vx: 0, vy: 0,
      size: 0.5 + Math.random() * 1.8,
      alpha: 0.5 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }))

    if (shapeFn) {
      const targets = shapeFn(PARTICLE_COUNT)
      particles.forEach((p, i) => { p.tx = targets[i].x; p.ty = targets[i].y })
    } else {
      // Three loose clusters for the three doshas
      particles.forEach((p, i) => {
        const cluster = i % 3
        const cx = cluster === 0 ? 0 : cluster === 1 ? -0.5 : 0.5
        const cy = cluster === 0 ? -0.4 : 0.35
        p.tx = cx + (Math.random() - 0.5) * 0.6
        p.ty = cy + (Math.random() - 0.5) * 0.6
      })
    }

    function draw(t) {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W < 10 || H < 10) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const cx = W / 2, cy = H / 2
      const scale = Math.min(W, H) * 0.33

      // Background glow
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 1.8)
      bg.addColorStop(0, `rgba(${col.r},${col.g},${col.b},.05)`)
      bg.addColorStop(1, `rgba(${col.r},${col.g},${col.b},0)`)
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Animate particles
      for (const p of particles) {
        const dx = p.tx - p.x, dy = p.ty - p.y
        p.vx += dx * 0.02
        p.vy += dy * 0.02
        p.vx *= 0.91
        p.vy *= 0.91
        p.x += p.vx
        p.y += p.vy
        p.phase += 0.009

        const px = cx + p.x * scale
        const py = cy + p.y * scale
        const twinkle = p.alpha * (0.65 + 0.35 * Math.sin(t * 0.001 + p.phase))

        // Outer glow
        const glow = ctx.createRadialGradient(px, py, 0, px, py, p.size * 5)
        glow.addColorStop(0, `rgba(${col.r},${col.g},${col.b},${twinkle * 0.3})`)
        glow.addColorStop(0.5, `rgba(${col.r},${col.g},${col.b},${twinkle * 0.08})`)
        glow.addColorStop(1, `rgba(${col.r},${col.g},${col.b},0)`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(px, py, p.size * 5, 0, Math.PI * 2)
        ctx.fill()

        // Bright core with white center
        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        const coreGrad = ctx.createRadialGradient(px, py, 0, px, py, p.size)
        coreGrad.addColorStop(0, `rgba(255,250,240,${twinkle})`)
        coreGrad.addColorStop(0.4, `rgba(${col.r},${col.g},${col.b},${twinkle * 0.9})`)
        coreGrad.addColorStop(1, `rgba(${col.r},${col.g},${col.b},${twinkle * 0.35})`)
        ctx.fillStyle = coreGrad
        ctx.fill()
      }

      // Connecting lines — stronger structural web
      for (let i = 0; i < particles.length; i += 2) {
        for (let j = i + 1; j < Math.min(i + 8, particles.length); j++) {
          const a = particles[i], b = particles[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 0.38) {
            ctx.beginPath()
            ctx.moveTo(cx + a.x * scale, cy + a.y * scale)
            ctx.lineTo(cx + b.x * scale, cy + b.y * scale)
            ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},${(1 - d / 0.38) * 0.16})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Label
      if (doshaType) {
        ctx.font = `bold ${Math.max(10, scale * 0.1)}px 'Cinzel',serif`
        ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${0.6 + 0.15 * Math.sin(t * 0.0008)})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(doshaType, cx, cy + scale + 20)
        if (primary && DOSHA_DATA[primary]) {
          ctx.font = `${Math.max(7, scale * 0.06)}px 'Inconsolata',monospace`
          ctx.fillStyle = 'rgba(170,180,200,.4)'
          ctx.fillText(DOSHA_DATA[primary].elements, cx, cy + scale + 33)
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

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [doshaType, scores])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
