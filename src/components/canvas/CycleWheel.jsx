import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { getMoonPhase, CYCLE_PHASES } from '../../engines/cycleEngine'

export default function CycleWheel({ cycleDay, cycleLength = 28 }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W < 10 || H < 10) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      pulse += 0.015

      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * 0.38
      const moon = getMoonPhase()

      // Empty state
      if (!cycleDay) {
        ctx.font = `bold ${Math.max(11, R * .1)}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(196,77,122,0.4)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('☽', cx, cy - R * .15)
        ctx.font = `${Math.max(9, R * .06)}px 'Cinzel',serif`
        ctx.fillText('Log your cycle to activate', cx, cy + R * .1)
        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }

      // Draw cycle ring — 4 phases as colored arcs
      CYCLE_PHASES.forEach((phase, i) => {
        const startAngle = ((phase.days[0] - 1) / cycleLength) * Math.PI * 2 - Math.PI / 2
        const endAngle = (phase.days[1] / cycleLength) * Math.PI * 2 - Math.PI / 2

        ctx.beginPath()
        ctx.arc(cx, cy, R, startAngle, endAngle)
        ctx.arc(cx, cy, R * 0.7, endAngle, startAngle, true)
        ctx.closePath()

        const isActive = cycleDay >= phase.days[0] && cycleDay <= phase.days[1]
        const glow = isActive ? 0.5 + 0.15 * Math.sin(pulse * 2) : 0
        ctx.fillStyle = phase.color + (isActive ? 'aa' : '44')
        ctx.fill()

        if (isActive) {
          ctx.strokeStyle = phase.color
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        // Phase label
        const midAngle = (startAngle + endAngle) / 2
        const labelR = R * 0.85
        ctx.font = `${Math.max(7, R * .055)}px 'Cinzel',serif`
        ctx.fillStyle = isActive ? '#fff' : 'var(--muted-foreground)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(phase.name, cx + labelR * Math.cos(midAngle), cy + labelR * Math.sin(midAngle))
      })

      // Current day marker
      const dayAngle = ((cycleDay - 1) / cycleLength) * Math.PI * 2 - Math.PI / 2
      const markerR = R * 0.85
      const mx = cx + markerR * Math.cos(dayAngle)
      const my = cy + markerR * Math.sin(dayAngle)

      // Glow
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 12)
      mg.addColorStop(0, 'rgba(201,168,76,.4)')
      mg.addColorStop(1, 'transparent')
      ctx.beginPath(); ctx.arc(mx, my, 12, 0, Math.PI * 2)
      ctx.fillStyle = mg; ctx.fill()

      // Marker dot
      ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#c9a84c'; ctx.fill()
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()

      // Moon phase in center
      const moonSize = R * 0.35
      ctx.font = `${moonSize}px serif`
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(moon.phaseEmoji, cx, cy - R * 0.08)

      // Moon phase name
      ctx.font = `${Math.max(8, R * .06)}px 'Cinzel',serif`
      ctx.fillStyle = 'rgba(201,168,76,.7)'
      ctx.fillText(moon.phaseName, cx, cy + R * 0.18)

      // Day counter
      ctx.font = `bold ${Math.max(10, R * .08)}px 'Inconsolata',monospace`
      ctx.fillStyle = 'var(--muted-foreground)'
      ctx.fillText(`Day ${cycleDay}`, cx, cy + R * 0.35)

      // Moon illumination ring
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.55, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(201,168,76,${0.08 + 0.05 * Math.sin(pulse)})`
      ctx.lineWidth = 0.5
      ctx.stroke()

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [cycleDay, cycleLength])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
