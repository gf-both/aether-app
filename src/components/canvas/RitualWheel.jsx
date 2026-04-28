import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { getMoonPhase } from '../../engines/cycleEngine'
import { TRADITIONS } from '../../engines/ritualEngine'

const TRADITION_KEYS = Object.keys(TRADITIONS)
const TAU = Math.PI * 2

/**
 * RitualWheel — Canvas widget showing a ring of 12 traditions
 * with the current moon phase at center and the top recommendation highlighted.
 *
 * Props:
 *   topRitual - the top-scored ritual object (or null)
 *   score - alignment score 0-100
 */
export default function RitualWheel({ topRitual, score }) {
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
      pulse += 0.012

      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * 0.40
      const moon = getMoonPhase()

      // Outer ring — tradition segments
      const segAngle = TAU / TRADITION_KEYS.length
      TRADITION_KEYS.forEach((key, i) => {
        const t = TRADITIONS[key]
        const startA = i * segAngle - Math.PI / 2
        const endA = (i + 1) * segAngle - Math.PI / 2

        const isActive = topRitual && topRitual.tradition &&
          (topRitual.tradition.name === t.name || topRitual.tradition === key)

        // Segment arc
        ctx.beginPath()
        ctx.arc(cx, cy, R, startA, endA)
        ctx.arc(cx, cy, R * 0.72, endA, startA, true)
        ctx.closePath()

        const glow = isActive ? 0.55 + 0.15 * Math.sin(pulse * 2.5) : 0.15
        ctx.fillStyle = t.color + Math.round(glow * 255).toString(16).padStart(2, '0')
        ctx.fill()

        if (isActive) {
          ctx.strokeStyle = t.color
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        // Icon
        const midA = (startA + endA) / 2
        const iconR = R * 0.86
        ctx.font = `${Math.max(10, R * 0.09)}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = isActive ? '#fff' : 'var(--muted-foreground)'
        ctx.fillText(t.icon, cx + iconR * Math.cos(midA), cy + iconR * Math.sin(midA))

        // Name (inside arc)
        const nameR = R * 0.6
        ctx.font = `${Math.max(6, R * 0.045)}px 'Cinzel',serif`
        ctx.fillStyle = isActive ? t.color : 'rgba(255,255,255,.25)'
        ctx.fillText(t.name, cx + nameR * Math.cos(midA), cy + nameR * Math.sin(midA))
      })

      // Inner ring glow
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.55, 0, TAU)
      ctx.strokeStyle = `rgba(201,168,76,${0.08 + 0.04 * Math.sin(pulse * 1.3)})`
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Center — moon phase
      const moonSize = R * 0.28
      ctx.font = `${moonSize}px serif`
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(moon.phaseEmoji, cx, cy - R * 0.12)

      // Moon phase name
      ctx.font = `${Math.max(7, R * 0.055)}px 'Cinzel',serif`
      ctx.fillStyle = 'rgba(201,168,76,.65)'
      ctx.fillText(moon.phaseName, cx, cy + R * 0.08)

      // Score or label
      if (topRitual && score != null) {
        ctx.font = `bold ${Math.max(9, R * 0.07)}px 'Inconsolata',monospace`
        ctx.fillStyle = score > 70 ? 'rgba(96,176,48,.8)' : score > 40 ? 'rgba(201,168,76,.7)' : 'var(--muted-foreground)'
        ctx.fillText(`${score}% aligned`, cx, cy + R * 0.25)
      } else {
        ctx.font = `${Math.max(8, R * 0.055)}px 'Cinzel',serif`
        ctx.fillStyle = 'var(--muted-foreground)'
        ctx.fillText('12 Traditions', cx, cy + R * 0.25)
      }

      // Top ritual name (below center)
      if (topRitual) {
        ctx.font = `${Math.max(8, R * 0.05)}px 'Cormorant Garamond',serif`
        ctx.fillStyle = 'var(--muted-foreground)'
        ctx.fillText(topRitual.name, cx, cy + R * 0.38)
      }

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [topRitual, score])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
