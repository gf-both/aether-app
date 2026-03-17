import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { ARCHETYPES } from '../../engines/archetypeEngine'

const QUADRANTS = [
  { name: 'Soul',  color: 'rgba(100,180,255,', indices: [0, 1, 2] },   // Innocent, Explorer, Sage
  { name: 'Ego',   color: 'rgba(255,100,80,',  indices: [3, 4, 5] },   // Hero, Outlaw, Magician
  { name: 'Self',  color: 'rgba(220,120,255,', indices: [6, 7, 8] },   // Lover, Jester, Everyman
  { name: 'Order', color: 'rgba(96,200,80,',   indices: [9, 10, 11] }, // Caregiver, Creator, Ruler
]

function getQuadrant(idx) {
  return QUADRANTS.find(q => q.indices.includes(idx))
}

export default function ArchetypeSymbol() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(-1)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0
    let rotation = 0

    // Read archetypeType from store via DOM attribute or direct import would break hooks rules
    // Instead we read from the persisted zustand store directly
    let storeUnsub
    let activeArchetype = null
    try {
      const { useGolemStore } = require('../../store/useGolemStore')
      activeArchetype = useGolemStore.getState().archetypeType
      storeUnsub = useGolemStore.subscribe((state) => {
        activeArchetype = state.archetypeType
      })
    } catch (e) { /* fallback */ }

    const handleMouseMove = (e) => {
      const r = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const mx = e.clientX - r.left, my = e.clientY - r.top
      const W = canvas.width / dpr, H = canvas.height / dpr
      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * 0.36
      hovRef.current = -1
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2 + rotation
        const px = cx + R * Math.cos(angle)
        const py = cy + R * Math.sin(angle)
        if (Math.hypot(mx - px, my - py) < 22) { hovRef.current = i; break }
      }
    }
    const handleMouseLeave = () => { hovRef.current = -1 }
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
      pulse += 0.015
      rotation += 0.0003

      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * 0.36
      const hovIdx = hovRef.current

      // Find active archetype index
      const activeIdx = activeArchetype
        ? ARCHETYPES.findIndex(a => a.name === activeArchetype)
        : -1
      const activeData = activeIdx >= 0 ? ARCHETYPES[activeIdx] : null

      // Empty state
      if (activeIdx < 0) {
        // Draw faint wheel anyway
        ctx.beginPath()
        ctx.arc(cx, cy, R, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(201,168,76,0.08)'
        ctx.lineWidth = 1
        ctx.stroke()

        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2 + rotation
          const px = cx + R * Math.cos(angle)
          const py = cy + R * Math.sin(angle)
          const isHov = hovIdx === i
          const q = getQuadrant(i)
          const gp = 0.12 + 0.04 * Math.sin(pulse + i * 0.5)

          ctx.beginPath()
          ctx.arc(px, py, isHov ? 7 : 4.5, 0, Math.PI * 2)
          ctx.fillStyle = isHov ? q.color + '0.5)' : q.color + gp + ')'
          ctx.fill()

          if (isHov) {
            const aura = ctx.createRadialGradient(px, py, 0, px, py, 18)
            aura.addColorStop(0, q.color + '0.2)')
            aura.addColorStop(1, q.color + '0)')
            ctx.beginPath()
            ctx.arc(px, py, 18, 0, Math.PI * 2)
            ctx.fillStyle = aura
            ctx.fill()

            // Show name on hover
            const labelR = R + 24
            const lx = cx + labelR * Math.cos(angle)
            const ly = cy + labelR * Math.sin(angle)
            ctx.font = "8px 'Cinzel',serif"
            ctx.fillStyle = q.color + '0.7)'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(ARCHETYPES[i].name, lx, ly)
            ctx.font = "7px 'Inconsolata',monospace"
            ctx.fillStyle = 'rgba(170,180,200,0.4)'
            ctx.fillText(ARCHETYPES[i].drive, lx, ly + 11)
          }
        }

        ctx.font = `bold ${Math.max(11, R * 0.07)}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,0.4)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Take the Archetype Quiz', cx, cy - 10)
        ctx.font = `${Math.max(9, R * 0.045)}px ui-sans-serif, system-ui`
        ctx.fillStyle = 'rgba(201,168,76,0.25)'
        ctx.fillText('to activate', cx, cy + 14)

        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }

      // ── Active state ──

      // Subtle radial background glow
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4)
      bgGrad.addColorStop(0, 'rgba(201,168,76,.04)')
      bgGrad.addColorStop(1, 'rgba(201,168,76,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.4, 0, Math.PI * 2)
      ctx.fillStyle = bgGrad
      ctx.fill()

      // Outer circle
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(201,168,76,${0.18 + 0.06 * Math.sin(pulse)})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Second outer ring
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.08, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201,168,76,.06)'
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Quadrant arcs
      QUADRANTS.forEach(q => {
        const startAngle = (q.indices[0] / 12) * Math.PI * 2 - Math.PI / 2 + rotation - Math.PI / 24
        const endAngle = (q.indices[2] / 12) * Math.PI * 2 - Math.PI / 2 + rotation + Math.PI / 24
        ctx.beginPath()
        ctx.arc(cx, cy, R * 1.14, startAngle, endAngle)
        ctx.strokeStyle = q.color + '0.08)'
        ctx.lineWidth = 10
        ctx.stroke()
      })

      // Quadrant divider lines (from center outward)
      for (let qi = 0; qi < 4; qi++) {
        const divAngle = (QUADRANTS[qi].indices[0] / 12) * Math.PI * 2 - Math.PI / 2 + rotation - Math.PI / 12
        ctx.beginPath()
        ctx.moveTo(cx + R * 0.2 * Math.cos(divAngle), cy + R * 0.2 * Math.sin(divAngle))
        ctx.lineTo(cx + R * 0.95 * Math.cos(divAngle), cy + R * 0.95 * Math.sin(divAngle))
        ctx.strokeStyle = 'rgba(201,168,76,0.06)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Draw 12 archetype nodes
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2 + rotation
        const px = cx + R * Math.cos(angle)
        const py = cy + R * Math.sin(angle)
        const archetype = ARCHETYPES[i]
        const q = getQuadrant(i)
        const isActive = i === activeIdx
        const isHov = hovIdx === i
        const isSameQuad = getQuadrant(activeIdx)?.name === q.name && !isActive
        const gp = 0.25 + 0.1 * Math.sin(pulse + i * 0.5)

        let dotR = isActive ? 11 : isSameQuad ? 6.5 : 5
        if (isHov && !isActive) dotR += 2

        // Aura for active node
        if (isActive) {
          const aura = ctx.createRadialGradient(px, py, 0, px, py, dotR * 3.5)
          aura.addColorStop(0, `rgba(201,168,76,${0.35 + gp * 0.3})`)
          aura.addColorStop(1, 'rgba(201,168,76,0)')
          ctx.beginPath()
          ctx.arc(px, py, dotR * 3.5, 0, Math.PI * 2)
          ctx.fillStyle = aura
          ctx.fill()

          // Pulsing ring
          const ringR = dotR + 4 + 3 * Math.sin(pulse * 1.5)
          ctx.beginPath()
          ctx.arc(px, py, ringR, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(201,168,76,${0.15 + 0.1 * Math.sin(pulse * 1.5)})`
          ctx.lineWidth = 1
          ctx.stroke()
        }

        // Hover aura
        if (isHov && !isActive) {
          const aura = ctx.createRadialGradient(px, py, 0, px, py, dotR * 2.5)
          aura.addColorStop(0, q.color + '0.2)')
          aura.addColorStop(1, q.color + '0)')
          ctx.beginPath()
          ctx.arc(px, py, dotR * 2.5, 0, Math.PI * 2)
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
        } else if (isSameQuad) {
          ctx.fillStyle = q.color + (0.25 + gp * 0.15) + ')'
          ctx.fill()
          ctx.strokeStyle = q.color + '0.4)'
          ctx.lineWidth = 0.8
          ctx.stroke()
        } else {
          ctx.fillStyle = `rgba(120,130,170,${isHov ? 0.5 : 0.15})`
          ctx.fill()
          ctx.strokeStyle = `rgba(120,130,170,${isHov ? 0.6 : 0.25})`
          ctx.lineWidth = 0.6
          ctx.stroke()
        }

        // Archetype name outside the circle
        const labelR = R + (isActive ? 30 : isHov ? 26 : 22)
        const lx = cx + labelR * Math.cos(angle)
        const ly = cy + labelR * Math.sin(angle)
        const labelSize = isActive ? 9 : isHov ? 8 : 7
        ctx.font = `${isActive ? 'bold ' : ''}${labelSize}px 'Cinzel',serif`
        ctx.fillStyle = isActive ? 'rgba(201,168,76,.9)' :
          isSameQuad ? q.color + '0.55)' :
          isHov ? 'rgba(200,210,230,.7)' : 'rgba(120,130,170,.35)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(archetype.name.replace('The ', ''), lx, ly)

        // Hover detail
        if (isHov && !isActive) {
          ctx.font = "7px 'Inconsolata',monospace"
          ctx.fillStyle = 'rgba(201,168,76,.4)'
          ctx.fillText(archetype.drive + ' / ' + archetype.gift.split(',')[0], lx, ly + 11)
        }

        // Active label: show quadrant badge
        if (isActive) {
          ctx.font = "7px 'Inconsolata',monospace"
          ctx.fillStyle = q.color + '0.5)'
          ctx.fillText(q.name + ' Quadrant', lx, ly + 12)
        }
      }

      // Center content — active archetype info
      if (activeData) {
        const centerSize = Math.max(13, R * 0.1)
        ctx.font = `bold ${centerSize}px 'Cinzel',serif`
        ctx.fillStyle = `rgba(201,168,76,${0.7 + 0.15 * Math.sin(pulse * 0.8)})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(activeData.name, cx, cy - 18)

        ctx.font = `${Math.max(9, R * 0.06)}px 'Inconsolata',monospace`
        ctx.fillStyle = 'rgba(170,180,200,0.5)'
        ctx.fillText('Drive: ' + activeData.drive, cx, cy + 4)

        ctx.font = `${Math.max(8, R * 0.05)}px 'Inconsolata',monospace`
        ctx.fillStyle = 'rgba(170,180,200,0.35)'
        ctx.fillText('Gift: ' + activeData.gift, cx, cy + 20)
      }

      // Hover tooltip — show full details for hovered non-active archetype
      if (hovIdx >= 0 && hovIdx !== activeIdx) {
        const hData = ARCHETYPES[hovIdx]
        const ttW = 140, ttH = 56
        const ttX = Math.min(W - ttW - 8, Math.max(8, cx - ttW / 2))
        const ttY = 8
        ctx.fillStyle = 'rgba(15,15,25,0.85)'
        ctx.beginPath()
        ctx.roundRect(ttX, ttY, ttW, ttH, 6)
        ctx.fill()
        ctx.strokeStyle = 'rgba(201,168,76,0.15)'
        ctx.lineWidth = 0.5
        ctx.stroke()

        ctx.font = "bold 9px 'Cinzel',serif"
        ctx.fillStyle = 'rgba(201,168,76,0.8)'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(hData.name, ttX + 8, ttY + 8)

        ctx.font = "8px 'Inconsolata',monospace"
        ctx.fillStyle = 'rgba(170,180,200,0.6)'
        ctx.fillText('Drive: ' + hData.drive + '  Fear: ' + hData.fear, ttX + 8, ttY + 22)
        ctx.fillText('Gift: ' + hData.gift, ttX + 8, ttY + 34)
        ctx.fillText('Shadow: ' + hData.shadow, ttX + 8, ttY + 44)
      }

      // Legend — quadrant colors
      const legX = 8, legY = H - 44
      const legSize = Math.max(6, R * 0.045)
      QUADRANTS.forEach((q, i) => {
        ctx.fillStyle = q.color + '0.4)'
        ctx.fillRect(legX, legY + i * (legSize + 4), legSize * 1.5, legSize * 0.8)
        ctx.font = `${legSize}px 'Inconsolata',monospace`
        ctx.fillStyle = 'rgba(170,180,200,0.4)'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(q.name, legX + legSize * 2, legY + i * (legSize + 4) + legSize * 0.4)
      })

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      if (storeUnsub) storeUnsub()
    }
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
