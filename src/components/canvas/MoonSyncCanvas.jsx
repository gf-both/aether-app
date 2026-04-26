import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'

/**
 * MoonSyncCanvas — Shows how the user syncs to the moon.
 * Draws the current moon phase as a lit/shadow sphere,
 * with the user's natal moon sign position and current alignment.
 */
export default function MoonSyncCanvas({ moonPhase, illumination = 50, natalMoon, cycleDay, cycleLength }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Star field background
    const stars = Array.from({ length: 50 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.3 + Math.random() * 0.6,
      alpha: 0.1 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
    }))

    // Moon phase fraction (0=new, 0.5=full, 1=new)
    const phaseFraction = (illumination || 0) / 100

    function draw(t) {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W < 10 || H < 10) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const cx = W / 2, cy = H * 0.42
      const R = Math.min(W, H) * 0.25
      const pulse = Math.sin(t * 0.0006) * 0.08

      // Dark sky background
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 3)
      bg.addColorStop(0, 'rgba(15, 10, 35, 1)')
      bg.addColorStop(1, 'rgba(3, 2, 10, 1)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Stars
      for (const s of stars) {
        const twinkle = s.alpha * (0.5 + 0.5 * Math.sin(t * 0.0008 + s.phase))
        ctx.beginPath()
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 190, 240, ${twinkle})`
        ctx.fill()
      }

      // Moon glow aura
      const glow = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 2.2)
      glow.addColorStop(0, `rgba(200, 190, 240, ${0.08 + pulse * 0.4})`)
      glow.addColorStop(0.5, `rgba(180, 170, 220, ${0.03 + pulse * 0.2})`)
      glow.addColorStop(1, 'rgba(180, 170, 220, 0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, R * 2.2, 0, Math.PI * 2)
      ctx.fill()

      // Moon body — lit side
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      const moonGrad = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, 0, cx, cy, R)
      moonGrad.addColorStop(0, 'rgba(230, 225, 215, 0.95)')
      moonGrad.addColorStop(0.7, 'rgba(200, 195, 185, 0.85)')
      moonGrad.addColorStop(1, 'rgba(160, 155, 145, 0.7)')
      ctx.fillStyle = moonGrad
      ctx.fill()

      // Crater texture (subtle)
      const craters = [[0.2, -0.15, 0.12], [-0.25, 0.2, 0.08], [0.1, 0.3, 0.06], [-0.15, -0.3, 0.1], [0.3, 0.05, 0.07]]
      for (const [ox, oy, cr] of craters) {
        ctx.beginPath()
        ctx.arc(cx + ox * R, cy + oy * R, cr * R, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(140, 135, 125, 0.25)'
        ctx.fill()
      }

      // Shadow overlay for phase
      // phaseFraction: 0 = new moon (all dark), 1 = full moon (all lit)
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, R + 0.5, 0, Math.PI * 2)
      ctx.clip()

      // Shadow: moves from right to left as illumination increases
      const shadowX = cx + R * 2 * (1 - phaseFraction * 2)
      ctx.beginPath()
      ctx.arc(shadowX, cy, R * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(5, 3, 12, 0.9)'
      ctx.fill()
      ctx.restore()

      // Cycle sync ring (if cycle data exists)
      if (cycleDay && cycleLength) {
        const cycleFraction = cycleDay / cycleLength
        const syncR = R + 12
        // Draw cycle arc
        const startAngle = -Math.PI / 2
        const endAngle = startAngle + cycleFraction * Math.PI * 2

        ctx.beginPath()
        ctx.arc(cx, cy, syncR, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(196, 77, 122, 0.12)'
        ctx.lineWidth = 3
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(cx, cy, syncR, startAngle, endAngle)
        ctx.strokeStyle = `rgba(196, 77, 122, ${0.5 + pulse * 2})`
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.stroke()

        // Day marker
        const dayAngle = startAngle + cycleFraction * Math.PI * 2
        const dayX = cx + syncR * Math.cos(dayAngle)
        const dayY = cy + syncR * Math.sin(dayAngle)
        ctx.beginPath()
        ctx.arc(dayX, dayY, 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(196, 77, 122, 0.9)'
        ctx.fill()
      }

      // Natal moon indicator
      if (natalMoon && natalMoon !== '?') {
        ctx.font = `bold ${Math.max(8, R * 0.12)}px 'Cinzel',serif`
        ctx.fillStyle = `rgba(201, 168, 76, ${0.6 + pulse * 2})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`☽ ${natalMoon}`, cx, cy + R + 28)
      }

      // Moon phase name
      if (moonPhase) {
        ctx.font = `bold ${Math.max(9, R * 0.12)}px 'Cinzel',serif`
        ctx.fillStyle = `rgba(200, 190, 240, ${0.65 + pulse * 2})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(moonPhase, cx, H - 18)
      }

      // Illumination
      ctx.font = `${Math.max(7, R * 0.08)}px 'Inconsolata',monospace`
      ctx.fillStyle = 'rgba(200, 190, 240, 0.35)'
      ctx.textAlign = 'center'
      ctx.fillText(`${illumination}% illuminated`, cx, H - 6)

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    animRef.current = requestAnimationFrame(draw)

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [moonPhase, illumination, natalMoon, cycleDay, cycleLength])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
