import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { useGolemStore } from '../../store/useGolemStore'
import { LOVE_LANGUAGES } from '../../engines/loveLangEngine'

const COLORS = {
  words: { r: 232, g: 197, b: 71,  hex: '#e8c547' },
  acts:  { r: 71,  g: 200, b: 232, hex: '#47c8e8' },
  gifts: { r: 232, g: 71,  b: 168, hex: '#e847a8' },
  time:  { r: 71,  g: 232, b: 140, hex: '#47e88c' },
  touch: { r: 200, g: 71,  b: 232, hex: '#c847e8' },
}

// Symbolic shapes for each love language
function speechBubble(n) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const t = i / n
    if (t < 0.8) {
      const a = (t / 0.8) * Math.PI * 2
      pts.push({ x: Math.cos(a) * 0.8, y: Math.sin(a) * 0.7 - 0.1 })
    } else {
      const f = (t - 0.8) / 0.2
      const tri = [[-0.15, 0.55], [0, 1], [0.15, 0.55]]
      const idx = Math.floor(f * (tri.length - 1))
      const ff = (f * (tri.length - 1)) % 1
      const a = tri[idx], b = tri[Math.min(idx + 1, tri.length - 1)]
      pts.push({ x: a[0] + (b[0] - a[0]) * ff, y: a[1] + (b[1] - a[1]) * ff })
    }
  }
  return pts
}

function handsOpen(n) {
  // Cupped hand shape
  const pts = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI
    const x = Math.cos(t) * 0.8
    const y = Math.sin(t) * 0.5 + Math.pow(Math.cos(t), 2) * 0.3
    pts.push({ x, y })
  }
  return pts
}

function diamondGift(n) {
  const pts = []
  // Faceted diamond
  const segs = [[0, -1], [0.6, -0.2], [0.9, 0], [0.4, 0.8], [0, 1], [-0.4, 0.8], [-0.9, 0], [-0.6, -0.2]]
  for (let i = 0; i < n; i++) {
    const t = i / n
    const idx = Math.floor(t * segs.length)
    const f = (t * segs.length) % 1
    const a = segs[idx], b = segs[(idx + 1) % segs.length]
    pts.push({ x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f })
  }
  return pts
}

function hourglass(n) {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2
    const r = 0.4 + 0.5 * Math.abs(Math.sin(t))
    return { x: Math.cos(t) * r * 0.6, y: Math.sin(t) * 0.9 }
  })
}

function waves(n) {
  // Embrace — two arcs facing each other
  const pts = []
  for (let i = 0; i < n; i++) {
    const t = i / n
    if (t < 0.5) {
      const a = (t / 0.5) * Math.PI
      pts.push({ x: -0.2 + Math.cos(a) * 0.7, y: Math.sin(a) * 0.8 - 0.4 })
    } else {
      const a = ((t - 0.5) / 0.5) * Math.PI
      pts.push({ x: 0.2 - Math.cos(a) * 0.7, y: Math.sin(a) * 0.8 - 0.4 })
    }
  }
  return pts
}

const LANG_SHAPES = {
  words: speechBubble,
  acts: handsOpen,
  gifts: diamondGift,
  time: hourglass,
  touch: waves,
}

const PARTICLE_COUNT = 100

export default function LoveLangSymbol() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const loveLanguage = useGolemStore((s) => {
    const p = s.activeViewProfile || s.primaryProfile
    return p?.loveLanguage || s.loveLanguage
  })

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const activeLang = loveLanguage ? LOVE_LANGUAGES.find(l => l.name === loveLanguage) : null
    const langId = activeLang?.id || null
    const col = langId ? COLORS[langId] : null

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      tx: 0, ty: 0,
      vx: 0, vy: 0,
      size: 0.6 + Math.random() * 1.2,
      alpha: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
    }))

    // Set targets
    const shapeFn = langId ? LANG_SHAPES[langId] : null
    if (shapeFn) {
      const targets = shapeFn(PARTICLE_COUNT)
      particles.forEach((p, i) => { p.tx = targets[i].x; p.ty = targets[i].y })
    } else {
      // Loose petal arrangement
      particles.forEach(p => {
        const a = Math.random() * Math.PI * 2
        const r = 0.2 + Math.random() * 0.7
        p.tx = Math.cos(a) * r
        p.ty = Math.sin(a) * r
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
      const scale = Math.min(W, H) * 0.32

      // Background glow
      if (col) {
        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 1.8)
        bg.addColorStop(0, `rgba(${col.r},${col.g},${col.b},.06)`)
        bg.addColorStop(1, `rgba(${col.r},${col.g},${col.b},0)`)
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, W, H)
      }

      // Animate particles
      for (const p of particles) {
        const dx = p.tx - p.x, dy = p.ty - p.y
        p.vx += dx * 0.025
        p.vy += dy * 0.025
        p.vx *= 0.9
        p.vy *= 0.9
        p.x += p.vx
        p.y += p.vy
        p.phase += 0.01

        const px = cx + p.x * scale
        const py = cy + p.y * scale
        const twinkle = p.alpha * (0.5 + 0.5 * Math.sin(t * 0.001 + p.phase))
        const cr = col ? col.r : 201, cg = col ? col.g : 168, cb = col ? col.b : 76

        // Glow
        const glow = ctx.createRadialGradient(px, py, 0, px, py, p.size * 3.5)
        glow.addColorStop(0, `rgba(${cr},${cg},${cb},${twinkle * 0.25})`)
        glow.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(px, py, p.size * 3.5, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${twinkle})`
        ctx.fill()
      }

      // Connecting lines
      for (let i = 0; i < particles.length; i += 4) {
        for (let j = i + 1; j < Math.min(i + 6, particles.length); j++) {
          const a = particles[i], b = particles[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 0.45) {
            const cr = col ? col.r : 201, cg = col ? col.g : 168, cb = col ? col.b : 76
            ctx.beginPath()
            ctx.moveTo(cx + a.x * scale, cy + a.y * scale)
            ctx.lineTo(cx + b.x * scale, cy + b.y * scale)
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${(1 - d / 0.45) * 0.06})`
            ctx.lineWidth = 0.4
            ctx.stroke()
          }
        }
      }

      // Label
      if (activeLang) {
        ctx.font = `bold ${Math.max(9, scale * 0.09)}px 'Cinzel',serif`
        ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${0.65 + 0.15 * Math.sin(t * 0.0008)})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(activeLang.name, cx, cy + scale + 22)
      } else {
        ctx.font = `bold ${Math.max(9, scale * 0.08)}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,0.35)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Take Quiz', cx, cy + scale + 22)
      }

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    animRef.current = requestAnimationFrame(draw)

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [loveLanguage])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
