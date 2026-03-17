import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { DOSHA_DATA } from '../../engines/doshaEngine'

const DOSHA_COLORS = {
  vata:  { r: 130, g: 190, b: 235, label: 'Vata',  hex: 'rgba(130,190,235,' },
  pitta: { r: 225, g: 110, b: 75,  label: 'Pitta', hex: 'rgba(225,110,75,' },
  kapha: { r: 100, g: 185, b: 120, label: 'Kapha', hex: 'rgba(100,185,120,' },
}

// Circle layout positions (offsets from center) for a Venn diagram
function getCirclePositions(cx, cy, offset) {
  return {
    vata:  { x: cx,              y: cy - offset * 0.7 },
    pitta: { x: cx - offset * 0.6, y: cy + offset * 0.45 },
    kapha: { x: cx + offset * 0.6, y: cy + offset * 0.45 },
  }
}

export default function DoshaSymbol({ doshaType, scores }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(null)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    // Parse primary and secondary from doshaType like "Vata-Pitta"
    let primary = null
    let secondary = null
    if (doshaType) {
      const parts = doshaType.split('-')
      primary = parts[0] ? parts[0].toLowerCase() : null
      secondary = parts[1] ? parts[1].toLowerCase() : null
    }

    const handleMouseMove = (e) => {
      const r = canvas.getBoundingClientRect()
      const mx = e.clientX - r.left, my = e.clientY - r.top
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * 0.22
      const offset = R * 0.65
      const positions = getCirclePositions(cx, cy, offset)

      hovRef.current = null
      for (const [key, pos] of Object.entries(positions)) {
        if (Math.hypot(mx - pos.x, my - pos.y) < R) {
          hovRef.current = key
          break
        }
      }
    }

    const handleMouseLeave = () => { hovRef.current = null }
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

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
      const R = Math.min(W, H) * 0.22
      const offset = R * 0.65
      const positions = getCirclePositions(cx, cy, offset)
      const hov = hovRef.current

      // Empty state
      if (!doshaType) {
        ctx.font = `bold ${Math.max(11, R * 0.14)}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,0.4)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Take the Dosha Quiz', cx, cy - 10)
        ctx.font = `${Math.max(9, R * 0.1)}px ui-sans-serif, system-ui`
        ctx.fillStyle = 'rgba(201,168,76,0.25)'
        ctx.fillText('to discover your Ayurvedic constitution', cx, cy + 14)
        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }

      // Subtle radial background glow
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2.5)
      bgGrad.addColorStop(0, 'rgba(201,168,76,.03)')
      bgGrad.addColorStop(1, 'rgba(201,168,76,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, R * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = bgGrad
      ctx.fill()

      // Draw three interlocking dosha circles
      const doshaKeys = ['vata', 'pitta', 'kapha']
      // Use globalCompositeOperation for blending
      ctx.globalCompositeOperation = 'source-over'

      for (const key of doshaKeys) {
        const pos = positions[key]
        const col = DOSHA_COLORS[key]
        const isPrimary = key === primary
        const isSecondary = key === secondary
        const isActive = isPrimary || isSecondary
        const isHov = hov === key
        const gp = 0.15 + 0.1 * Math.sin(pulse * 1.3 + doshaKeys.indexOf(key) * 2.1)

        // Glow aura for active doshas
        if (isActive) {
          const auraR = R * (isPrimary ? 1.35 : 1.2)
          const aura = ctx.createRadialGradient(pos.x, pos.y, R * 0.3, pos.x, pos.y, auraR)
          const glowAlpha = isPrimary ? (0.25 + gp * 0.4) : (0.12 + gp * 0.2)
          aura.addColorStop(0, col.hex + glowAlpha + ')')
          aura.addColorStop(1, col.hex + '0)')
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, auraR, 0, Math.PI * 2)
          ctx.fillStyle = aura
          ctx.fill()
        }

        // Filled circle
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, R, 0, Math.PI * 2)
        const fillAlpha = isPrimary ? (0.18 + gp * 0.12) :
                          isSecondary ? (0.1 + gp * 0.08) :
                          isHov ? 0.08 : 0.04
        ctx.fillStyle = col.hex + fillAlpha + ')'
        ctx.fill()

        // Ring stroke
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, R, 0, Math.PI * 2)
        const strokeAlpha = isPrimary ? (0.7 + 0.2 * Math.sin(pulse * 1.5)) :
                            isSecondary ? (0.4 + 0.15 * Math.sin(pulse * 1.2)) :
                            isHov ? 0.35 : 0.15
        ctx.strokeStyle = col.hex + strokeAlpha + ')'
        ctx.lineWidth = isPrimary ? 2.5 : isSecondary ? 1.8 : 1
        ctx.stroke()

        // Second subtle outer ring for active
        if (isPrimary) {
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, R + 4, 0, Math.PI * 2)
          ctx.strokeStyle = col.hex + (0.15 + 0.08 * Math.sin(pulse)) + ')'
          ctx.lineWidth = 0.5
          ctx.stroke()
        }

        // Label: dosha name
        const labelOffset = R + 18
        const angle = Math.atan2(pos.y - cy, pos.x - cx)
        const lx = pos.x + (Math.abs(pos.y - cy) < 5 ? 0 : Math.cos(angle) * 12)
        const ly = key === 'vata' ? pos.y - labelOffset : pos.y + labelOffset + 4
        const labelSize = isPrimary ? 12 : isSecondary ? 10 : 9
        ctx.font = `bold ${labelSize}px 'Cinzel',serif`
        ctx.fillStyle = isPrimary ? col.hex + '0.9)' :
                        isSecondary ? col.hex + '0.65)' :
                        isHov ? col.hex + '0.55)' : col.hex + '0.35)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(DOSHA_DATA[key].name, lx, ly)

        // Elements below name
        const elemSize = Math.max(7, labelSize - 3)
        ctx.font = `${elemSize}px 'Cormorant Garamond',serif`
        ctx.fillStyle = isPrimary ? 'rgba(170,180,200,.6)' :
                        isSecondary ? 'rgba(170,180,200,.45)' :
                        isHov ? 'rgba(170,180,200,.4)' : 'rgba(170,180,200,.2)'
        ctx.fillText(DOSHA_DATA[key].elements, lx, ly + labelSize + 2)

        // Score percentage inside circle if available
        if (scores && scores[key] != null) {
          const scoreSize = isPrimary ? 18 : isSecondary ? 15 : 12
          ctx.font = `bold ${scoreSize}px 'Cinzel',serif`
          const scoreAlpha = isPrimary ? (0.85 + 0.1 * Math.sin(pulse)) :
                             isSecondary ? 0.65 : isHov ? 0.5 : 0.3
          ctx.fillStyle = col.hex + scoreAlpha + ')'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(scores[key] + '%', pos.x, pos.y - 2)

          // Small bar under percentage
          const barW = R * 0.7
          const barH = 3
          const barX = pos.x - barW / 2
          const barY = pos.y + scoreSize * 0.6
          // Background bar
          ctx.fillStyle = 'rgba(255,255,255,0.06)'
          ctx.fillRect(barX, barY, barW, barH)
          // Filled bar
          const fillW = barW * (scores[key] / 100)
          ctx.fillStyle = col.hex + (isPrimary ? '0.6)' : isSecondary ? '0.4)' : '0.2)')
          ctx.fillRect(barX, barY, fillW, barH)
        }

        // Hover tooltip
        if (isHov) {
          const tooltipY = key === 'vata' ? pos.y + R * 0.35 : pos.y - R * 0.35
          ctx.font = `${Math.max(7, R * 0.08)}px 'Inconsolata',monospace`
          ctx.fillStyle = 'rgba(201,168,76,0.5)'
          ctx.textAlign = 'center'
          ctx.fillText(DOSHA_DATA[key].qualities, pos.x, tooltipY)
        }
      }

      // Center label: constitution type
      const centerSize = Math.max(11, R * 0.13)
      ctx.font = `bold ${centerSize}px 'Cinzel',serif`
      ctx.fillStyle = `rgba(201,168,76,${0.6 + 0.15 * Math.sin(pulse * 0.8)})`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(doshaType, cx, cy)

      // Subtitle
      ctx.font = `${Math.max(8, R * 0.08)}px 'Cormorant Garamond',serif`
      ctx.fillStyle = 'rgba(170,180,200,.4)'
      ctx.fillText('Ayurvedic Constitution', cx, cy + centerSize + 2)

      // Legend in bottom left
      const legX = 8, legY = H - 50
      const legSize = Math.max(6, R * 0.07)
      doshaKeys.forEach((key, i) => {
        const col = DOSHA_COLORS[key]
        const isActive = key === primary || key === secondary
        ctx.fillStyle = col.hex + (isActive ? '0.7)' : '0.3)')
        ctx.fillRect(legX, legY + i * (legSize + 5), legSize * 1.5, legSize * 0.8)
        ctx.font = `${legSize}px 'Inconsolata',monospace`
        ctx.fillStyle = isActive ? 'rgba(170,180,200,.6)' : 'rgba(170,180,200,.3)'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        const suffix = key === primary ? ' (primary)' : key === secondary ? ' (secondary)' : ''
        ctx.fillText(DOSHA_DATA[key].name + suffix, legX + legSize * 2, legY + i * (legSize + 5) + legSize * 0.4)
      })

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [doshaType, scores])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
