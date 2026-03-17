import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { ENNEAGRAM_TYPES, ENNEAGRAM_PROFILE } from '../../data/enneagramData'

export default function EnneagramSymbol({ typeOverride, wingOverride } = {}) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(-1)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    // Only compute type data when typeOverride is set — no fallback to static profile
    const activeType = typeOverride || null
    const typeInfo = activeType ? ENNEAGRAM_TYPES[activeType - 1] : null
    // Show BOTH wings — primary wing from override only
    const primaryWing = typeInfo ? (wingOverride || typeInfo.wings[0]) : null
    const secondaryWing = typeInfo ? (typeInfo.wings.find(w => w !== primaryWing) || typeInfo.wings[1]) : null
    const integrationTo = typeInfo ? typeInfo.growth : null
    const disintegrationTo = typeInfo ? typeInfo.stress : null

    // Triangle: 3-6-9 and Hexad: 1-4-2-8-5-7-1
    // const triangleIndices = [3, 6, 9]
    const hexadOrder = [1, 4, 2, 8, 5, 7]

    const handleMouseMove = (e) => {
      const r = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const mx = e.clientX - r.left, my = e.clientY - r.top
      const W = canvas.width / dpr, H = canvas.height / dpr
      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * .38
      hovRef.current = -1
      for (let i = 0; i < 9; i++) {
        const angle = ((i) / 9) * Math.PI * 2 - Math.PI / 2
        const px = cx + R * Math.cos(angle)
        const py = cy + R * Math.sin(angle)
        if (Math.hypot(mx - px, my - py) < 18) { hovRef.current = i + 1; break }
      }
    }
    const handleMouseLeave = () => { hovRef.current = -1 }
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    function getPointPos(typeNum, cx, cy, R) {
      const idx = typeNum - 1
      const angle = (idx / 9) * Math.PI * 2 - Math.PI / 2
      return { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) }
    }

    function drawArrow(ctx, fromX, fromY, toX, toY, color, lineWidth) {
      const headLen = 8
      const dx = toX - fromX, dy = toY - fromY
      const angle = Math.atan2(dy, dx)
      // Shorten line so arrow doesn't overlap point dot
      const shortenBy = 14
      const dist = Math.hypot(dx, dy)
      const ratio = (dist - shortenBy) / dist
      const endX = fromX + dx * ratio
      const endY = fromY + dy * ratio

      ctx.beginPath()
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(endX, endY)
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.stroke()

      // Arrowhead
      ctx.beginPath()
      ctx.moveTo(endX, endY)
      ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6))
      ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6))
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W < 10 || H < 10) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      pulse += .015

      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * .38
      const hovT = hovRef.current

      // Empty state when no type in store
      if (!typeOverride) {
        ctx.font = `bold ${Math.max(11, R * .06)}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,0.4)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Take the Enneagram Quiz', cx, cy - 10)
        ctx.font = `${Math.max(9, R * .04)}px ui-sans-serif, system-ui`
        ctx.fillStyle = 'rgba(201,168,76,0.25)'
        ctx.fillText('to activate', cx, cy + 14)
        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }

      // Subtle radial background glow
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4)
      bgGrad.addColorStop(0, 'rgba(201,168,76,.03)')
      bgGrad.addColorStop(1, 'rgba(201,168,76,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.4, 0, Math.PI * 2)
      ctx.fillStyle = bgGrad
      ctx.fill()

      // Outer circle
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(201,168,76,${.18 + .06 * Math.sin(pulse)})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Second subtle outer ring
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.06, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201,168,76,.06)'
      ctx.lineWidth = .5
      ctx.stroke()

      // Inner triangle (3-6-9)
      ctx.beginPath()
      const t0 = getPointPos(9, cx, cy, R)
      const t1 = getPointPos(3, cx, cy, R)
      const t2 = getPointPos(6, cx, cy, R)
      ctx.moveTo(t0.x, t0.y)
      ctx.lineTo(t1.x, t1.y)
      ctx.lineTo(t2.x, t2.y)
      ctx.closePath()
      ctx.strokeStyle = 'rgba(201,168,76,.22)'
      ctx.lineWidth = 1.2
      ctx.stroke()

      // Hexad lines (1-4-2-8-5-7-1)
      ctx.beginPath()
      const h0 = getPointPos(hexadOrder[0], cx, cy, R)
      ctx.moveTo(h0.x, h0.y)
      for (let i = 1; i < hexadOrder.length; i++) {
        const hp = getPointPos(hexadOrder[i], cx, cy, R)
        ctx.lineTo(hp.x, hp.y)
      }
      ctx.closePath()
      ctx.strokeStyle = 'rgba(201,168,76,.15)'
      ctx.lineWidth = .8
      ctx.stroke()

      // Integration arrow (5 -> 8) in green
      const intFrom = getPointPos(activeType, cx, cy, R)
      const intTo = getPointPos(integrationTo, cx, cy, R)
      drawArrow(ctx, intFrom.x, intFrom.y, intTo.x, intTo.y, `rgba(96,200,80,${.4 + .15 * Math.sin(pulse * 1.2)})`, 1.8)

      // Disintegration arrow (5 -> 7) in red
      const disFrom = getPointPos(activeType, cx, cy, R)
      const disTo = getPointPos(disintegrationTo, cx, cy, R)
      drawArrow(ctx, disFrom.x, disFrom.y, disTo.x, disTo.y, `rgba(220,60,60,${.35 + .12 * Math.sin(pulse * 1.4)})`, 1.5)

      // Triad arcs (subtle background arcs)
      const triads = [
        { types: [8, 9, 1], color: 'rgba(220,80,80,.06)' },   // Body
        { types: [2, 3, 4], color: 'rgba(240,96,160,.06)' },   // Heart
        { types: [5, 6, 7], color: 'rgba(64,204,221,.06)' },   // Head
      ]
      triads.forEach(triad => {
        const angles = triad.types.map(t => ((t - 1) / 9) * Math.PI * 2 - Math.PI / 2)
        const startA = Math.min(...angles) - Math.PI / 18
        const endA = Math.max(...angles) + Math.PI / 18
        ctx.beginPath()
        ctx.arc(cx, cy, R * 1.12, startA, endA)
        ctx.strokeStyle = triad.color
        ctx.lineWidth = 12
        ctx.stroke()
      })

      // Draw the 9 points
      for (let i = 0; i < 9; i++) {
        const typeNum = i + 1
        const angle = (i / 9) * Math.PI * 2 - Math.PI / 2
        const px = cx + R * Math.cos(angle)
        const py = cy + R * Math.sin(angle)
        const typeData = ENNEAGRAM_TYPES[i]

        const isActive = typeNum === activeType
        const isPrimaryWing = typeNum === primaryWing
        const isSecondaryWing = typeNum === secondaryWing
        const isWing = isPrimaryWing || isSecondaryWing
        const isIntegration = typeNum === integrationTo
        const isDisintegration = typeNum === disintegrationTo
        const isHov = hovT === typeNum
        const gp = .25 + .1 * Math.sin(pulse + i * .9)

        // Point dot radius — primary wing slightly larger than secondary
        let dotR = isActive ? 10 : (isPrimaryWing ? 8 : isSecondaryWing ? 6.5 : 5.5)
        if (isHov) dotR += 2

        // Aura for active/wing/arrow types
        if (isActive || isWing || isIntegration || isDisintegration) {
          const auraColor = isActive ? 'rgba(201,168,76,' :
            isIntegration ? 'rgba(96,200,80,' :
            isDisintegration ? 'rgba(220,60,60,' :
            'rgba(201,168,76,'
          const aura = ctx.createRadialGradient(px, py, 0, px, py, dotR * 3)
          aura.addColorStop(0, auraColor + (isActive ? (.35 + gp * .3) : (.2 + gp * .2)) + ')')
          aura.addColorStop(1, auraColor + '0)')
          ctx.beginPath()
          ctx.arc(px, py, dotR * 3, 0, Math.PI * 2)
          ctx.fillStyle = aura
          ctx.fill()
        }

        // Dot
        ctx.beginPath()
        ctx.arc(px, py, dotR, 0, Math.PI * 2)
        if (isActive) {
          const dg = ctx.createRadialGradient(px, py, 0, px, py, dotR)
          dg.addColorStop(0, 'rgba(240,210,80,.9)')
          dg.addColorStop(1, 'rgba(201,168,76,.6)')
          ctx.fillStyle = dg
          ctx.fill()
          ctx.strokeStyle = 'rgba(255,230,150,.8)'
          ctx.lineWidth = 1.5
          ctx.stroke()
        } else if (isPrimaryWing) {
          ctx.fillStyle = `rgba(201,168,76,${.4 + gp * .3})`
          ctx.fill()
          ctx.strokeStyle = 'rgba(201,168,76,.55)'
          ctx.lineWidth = 1.2
          ctx.stroke()
        } else if (isSecondaryWing) {
          ctx.fillStyle = `rgba(201,168,76,${.2 + gp * .15})`
          ctx.fill()
          ctx.strokeStyle = 'rgba(201,168,76,.3)'
          ctx.lineWidth = .8
          ctx.stroke()
        } else if (isIntegration) {
          ctx.fillStyle = `rgba(96,200,80,${.35 + gp * .25})`
          ctx.fill()
          ctx.strokeStyle = 'rgba(96,200,80,.5)'
          ctx.lineWidth = 1
          ctx.stroke()
        } else if (isDisintegration) {
          ctx.fillStyle = `rgba(220,60,60,${.3 + gp * .2})`
          ctx.fill()
          ctx.strokeStyle = 'rgba(220,60,60,.45)'
          ctx.lineWidth = 1
          ctx.stroke()
        } else {
          ctx.fillStyle = `rgba(120,130,170,${isHov ? .5 : .2})`
          ctx.fill()
          ctx.strokeStyle = `rgba(120,130,170,${isHov ? .6 : .3})`
          ctx.lineWidth = .7
          ctx.stroke()
        }

        // Type number
        const numSize = isActive ? 13 : (isWing ? 11 : 9)
        ctx.font = `bold ${numSize}px 'Cinzel',serif`
        ctx.fillStyle = isActive ? 'rgba(255,255,255,.95)' :
          isWing ? 'rgba(201,168,76,.8)' :
          isIntegration ? 'rgba(96,200,80,.75)' :
          isDisintegration ? 'rgba(220,60,60,.7)' :
          isHov ? 'rgba(200,210,230,.8)' : 'rgba(150,160,190,.55)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(typeNum), px, py)

        // Type name outside the circle
        const labelR = R + (isActive ? 28 : 20)
        const lx = cx + labelR * Math.cos(angle)
        const ly = cy + labelR * Math.sin(angle)
        const labelSize = isActive ? 9 : 7
        ctx.font = `${labelSize}px 'Cinzel',serif`
        ctx.fillStyle = isActive ? 'rgba(201,168,76,.85)' :
          isPrimaryWing ? 'rgba(201,168,76,.55)' :
          isSecondaryWing ? 'rgba(201,168,76,.35)' :
          isHov ? 'rgba(200,210,230,.65)' : 'rgba(120,130,170,.35)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(typeData.name, lx, ly)

        // Hover detail: show triad
        if (isHov && !isActive) {
          ctx.font = "7px 'Inconsolata',monospace"
          ctx.fillStyle = 'rgba(201,168,76,.4)'
          ctx.fillText(typeData.triad + ' Triad', lx, ly + 12)
        }
      }

      // Center label
      const centerLabelSize = Math.max(12, R * .1)
      ctx.font = `bold ${centerLabelSize}px 'Cinzel',serif`
      ctx.fillStyle = `rgba(201,168,76,${.6 + .15 * Math.sin(pulse * .8)})`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const centerLabel = `Type ${activeType}w${primaryWing}`
      ctx.fillText(centerLabel, cx, cy - 6)

      // Subtitle
      ctx.font = `${Math.max(8, R * .06)}px 'Cormorant Garamond',serif`
      ctx.fillStyle = 'rgba(170,180,200,.45)'
      const subtitle = typeInfo ? typeInfo.name : ''
      ctx.fillText(subtitle, cx, cy + centerLabelSize * .8)

      // Legend
      const lx = 8, ly = H - 60
      const legSize = Math.max(6, R * .048)
      const items = [
        [`\u2192 Integration (${integrationTo})`, 'rgba(96,200,80,.6)'],
        [`\u2192 Stress (${disintegrationTo})`, 'rgba(220,60,60,.55)'],
        [`\u25CF Wing ${primaryWing} (primary)`, 'rgba(201,168,76,.55)'],
        [`\u25CB Wing ${secondaryWing}`, 'rgba(201,168,76,.3)'],
      ]
      items.forEach(([label, color], i) => {
        ctx.fillStyle = color
        ctx.fillRect(lx, ly + i * (legSize + 6), legSize * 2, legSize * .8)
        ctx.font = `${legSize}px 'Inconsolata',monospace`
        ctx.fillStyle = 'rgba(170,180,200,.5)'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, lx + legSize * 2.5, ly + i * (legSize + 6) + legSize * .4)
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
  }, [typeOverride, wingOverride])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
