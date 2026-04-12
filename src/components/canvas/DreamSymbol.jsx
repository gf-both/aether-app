import { useEffect, useRef, useMemo } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { getMoonPhaseForDate, getDreamStreak, DREAM_EMOTIONS } from '../../engines/dreamEngine'

// Palette
const C = {
  void: '#05020f',
  indigo: 'rgba(100, 80, 200, ',
  violet: 'rgba(160, 100, 255, ',
  silver: 'rgba(200, 190, 240, ',
  gold: 'rgba(201, 168, 76, ',
}

function lerp(a, b, t) { return a + (b - a) * t }

export default function DreamSymbol({ dreams = [] }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const frameRef = useRef(0)

  useCanvasResize(canvasRef)

  const streak = useMemo(() => getDreamStreak(dreams), [dreams])
  const lastEmotion = dreams[0]?.emotion || null
  const emotionData = lastEmotion ? DREAM_EMOTIONS.find(e => e.id === lastEmotion) : null
  const moon = getMoonPhaseForDate(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Seed particles once
    const PARTICLE_COUNT = 38
    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      angle: (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.4,
      radius: 0.25 + Math.random() * 0.55,
      size: 0.5 + Math.random() * 1.8,
      speed: (0.0003 + Math.random() * 0.0007) * (Math.random() > 0.5 ? 1 : -1),
      opacity: 0.2 + Math.random() * 0.6,
      drift: Math.random() * Math.PI * 2,
      driftSpeed: 0.001 + Math.random() * 0.002,
    }))

    // Mandala rings: each rotates at different speed
    const RINGS = [
      { n: 6,  r: 0.12, dotR: 2.2, speed: 0.0006,  opacity: 0.35 },
      { n: 12, r: 0.21, dotR: 1.6, speed: -0.0004, opacity: 0.28 },
      { n: 18, r: 0.30, dotR: 1.2, speed: 0.00025, opacity: 0.22 },
      { n: 24, r: 0.40, dotR: 0.9, speed: -0.00015,opacity: 0.15 },
    ]

    function draw(t) {
      frameRef.current = t
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr
      const H = canvas.height / dpr
      const cx = W / 2
      const cy = H / 2
      const R = Math.min(W, H) * 0.5

      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Save/restore so DPR scale stays applied
      ctx.save()
      ctx.scale(dpr, dpr)

      // Deep void background gradient
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R)
      bg.addColorStop(0, 'rgba(20, 10, 45, 0.95)')
      bg.addColorStop(0.6, 'rgba(8, 4, 22, 0.98)')
      bg.addColorStop(1, 'rgba(3, 1, 10, 1)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Central aura — breathing pulse
      const pulse = Math.sin(t * 0.0008) * 0.15 + 0.85
      const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.38 * pulse)
      aura.addColorStop(0, `rgba(130, 90, 220, 0.22)`)
      aura.addColorStop(0.4, `rgba(90, 60, 180, 0.10)`)
      aura.addColorStop(1, `rgba(60, 30, 120, 0)`)
      ctx.fillStyle = aura
      ctx.fillRect(0, 0, W, H)

      // Outermost faint ring
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.44, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(160, 120, 255, 0.08)`
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Floating star particles
      for (const p of particles) {
        p.angle += p.speed
        p.drift += p.driftSpeed
        const pr = R * p.radius + Math.sin(p.drift) * R * 0.04
        const px = cx + Math.cos(p.angle) * pr
        const py = cy + Math.sin(p.angle) * pr
        const twinkle = p.opacity * (0.7 + 0.3 * Math.sin(t * 0.001 + p.drift * 3))
        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 185, 255, ${twinkle})`
        ctx.fill()
      }

      // Rotating mandala dot rings
      for (const ring of RINGS) {
        const ringAngle = t * ring.speed
        const ringR = R * ring.r
        for (let i = 0; i < ring.n; i++) {
          const a = ringAngle + (i / ring.n) * Math.PI * 2
          const rx = cx + Math.cos(a) * ringR
          const ry = cy + Math.sin(a) * ringR
          ctx.beginPath()
          ctx.arc(rx, ry, ring.dotR, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(180, 150, 255, ${ring.opacity})`
          ctx.fill()
        }
      }

      // Inner glow core
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.07 * pulse)
      coreGlow.addColorStop(0, `rgba(210, 190, 255, 0.9)`)
      coreGlow.addColorStop(0.5, `rgba(150, 110, 230, 0.5)`)
      coreGlow.addColorStop(1, `rgba(90, 60, 180, 0)`)
      ctx.fillStyle = coreGlow
      ctx.fillRect(0, 0, W, H)

      // Center point
      ctx.beginPath()
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(220, 210, 255, 0.95)`
      ctx.fill()

      // Stats overlay — streak
      if (streak > 0 || dreams.length > 0) {
        ctx.textAlign = 'center'
        ctx.fillStyle = `rgba(201, 168, 76, 0.75)`
        ctx.font = `500 ${Math.max(8, R * 0.09)}px 'Cinzel', serif`
        ctx.fillText(`${dreams.length} dreams`, cx, cy + R * 0.58)
        if (streak > 1) {
          ctx.font = `500 ${Math.max(7, R * 0.07)}px 'Cinzel', serif`
          ctx.fillStyle = `rgba(160, 130, 220, 0.6)`
          ctx.fillText(`${streak} day streak`, cx, cy + R * 0.68)
        }
      } else {
        ctx.textAlign = 'center'
        ctx.fillStyle = `rgba(160, 130, 220, 0.45)`
        ctx.font = `${Math.max(7, R * 0.075)}px 'Cinzel', serif`
        ctx.fillText('begin your', cx, cy + R * 0.58)
        ctx.fillText('dream journey', cx, cy + R * 0.70)
      }

      // Moon phase — bottom right
      ctx.textAlign = 'right'
      ctx.font = `${Math.max(9, R * 0.12)}px sans-serif`
      ctx.fillStyle = `rgba(200, 185, 255, 0.55)`
      ctx.fillText(moon.emoji, cx + R * 0.4, cy - R * 0.42)

      // Last emotion color ring accent
      if (emotionData) {
        ctx.beginPath()
        ctx.arc(cx, cy, R * 0.105 * pulse, 0, Math.PI * 2)
        ctx.strokeStyle = emotionData.color + '55'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [streak, dreams.length, emotionData, moon.emoji])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
