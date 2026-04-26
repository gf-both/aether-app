import { useEffect, useRef, useMemo } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { SYNC_CATEGORIES, analyzeSyncPatterns } from '../../engines/synchronicityEngine'

function parseColor(str) {
  const hex = str.match(/^#([0-9a-f]{6})$/i)
  if (hex) {
    const v = parseInt(hex[1], 16)
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
  }
  return [200, 180, 120]
}

/**
 * SyncCanvas — Network emergence visualization
 * Nodes rise from a central field, connect with electric arcs, pulse with intensity.
 * Visually distinct from DreamSymbol (which is a mandala with concentric rings).
 */
export default function SyncCanvas({ syncs = [] }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(null)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Generate stable node positions based on sync IDs using hash
    function hashPos(id, W, H) {
      const h1 = ((id * 2654435761) >>> 0) / 4294967296
      const h2 = ((id * 340573321) >>> 0) / 4294967296
      const padding = 0.15
      return {
        x: padding * W + h1 * W * (1 - padding * 2),
        y: padding * H + h2 * H * (1 - padding * 2),
      }
    }

    // Field particles — rise from bottom, drift upward slowly
    const FIELD_COUNT = 45
    const fieldParticles = Array.from({ length: FIELD_COUNT }, () => ({
      x: Math.random(),
      y: 0.6 + Math.random() * 0.5,
      size: 0.3 + Math.random() * 0.8,
      speed: 0.0002 + Math.random() * 0.0004,
      alpha: 0.08 + Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.0002,
    }))

    // Mouse tracking
    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      hovRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onMouseLeave() { hovRef.current = null }
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)

    function draw(t) {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, W, H)

      // Background — dark with subtle gradient from bottom
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, 'rgba(5, 3, 15, 1)')
      bg.addColorStop(0.6, 'rgba(8, 5, 22, 1)')
      bg.addColorStop(1, 'rgba(15, 8, 35, 1)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Field particles — rising from bottom (the "field")
      for (const p of fieldParticles) {
        p.y -= p.speed
        p.x += p.drift + Math.sin(t * 0.0005 + p.phase) * 0.00015
        p.phase += 0.003
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random() }

        const px = p.x * W, py = p.y * H
        const twinkle = p.alpha * (0.5 + 0.5 * Math.sin(t * 0.001 + p.phase))

        // Vertical light trail
        const grad = ctx.createLinearGradient(px, py + 8, px, py - 12)
        grad.addColorStop(0, 'rgba(130, 100, 220, 0)')
        grad.addColorStop(0.5, `rgba(130, 100, 220, ${twinkle})`)
        grad.addColorStop(1, 'rgba(130, 100, 220, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(px - 0.4, py - 12, 0.8, 20)

        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180, 160, 255, ${twinkle})`
        ctx.fill()
      }

      if (syncs.length === 0) {
        // Empty state — central attractor with field
        const pulse = 0.85 + 0.15 * Math.sin(t * 0.001)
        const cx = W / 2, cy = H / 2
        const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50 * pulse)
        aura.addColorStop(0, 'rgba(130, 100, 220, 0.15)')
        aura.addColorStop(1, 'transparent')
        ctx.fillStyle = aura
        ctx.fillRect(0, 0, W, H)

        // Pulsing core
        ctx.beginPath()
        ctx.arc(cx, cy, 3 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180, 160, 255, ${0.6 * pulse})`
        ctx.fill()

        // Ripple rings
        for (let i = 0; i < 3; i++) {
          const rPhase = ((t * 0.0005 + i * 0.33) % 1)
          const rR = rPhase * 60
          ctx.beginPath()
          ctx.arc(cx, cy, rR, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(130, 100, 220, ${0.2 * (1 - rPhase)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }

        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(130, 100, 220, 0.4)'
        ctx.font = `${Math.max(7, Math.min(W, H) * 0.075)}px 'Cinzel', serif`
        ctx.fillText('begin noticing', cx, cy + Math.min(W, H) * 0.2)
        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }

      // Compute node positions
      const nodes = syncs.map(s => {
        const pos = hashPos(s.id, W, H)
        const cat = SYNC_CATEGORIES[s.category] || SYNC_CATEGORIES.other
        const [r, g, b] = parseColor(cat.color)
        const intensity = s.intensity || 3
        return { ...pos, s, cat, r, g, b, intensity }
      })

      // Draw connection arcs between linked nodes
      const idToNode = Object.fromEntries(nodes.map(n => [n.s.id, n]))
      for (const node of nodes) {
        for (const linkedId of (node.s.linked || [])) {
          const other = idToNode[linkedId]
          if (!other) continue
          // Curved arc instead of straight line
          const midX = (node.x + other.x) / 2
          const midY = (node.y + other.y) / 2 - 20
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.quadraticCurveTo(midX, midY, other.x, other.y)
          const arcPulse = 0.3 + 0.15 * Math.sin(t * 0.002 + node.s.id * 0.001)
          ctx.strokeStyle = `rgba(${node.r},${node.g},${node.b},${arcPulse})`
          ctx.lineWidth = 1.2
          ctx.stroke()

          // Electric dots traveling along the arc
          const travelT = ((t * 0.001 + node.s.id * 0.1) % 1)
          const tx = (1 - travelT) * (1 - travelT) * node.x + 2 * (1 - travelT) * travelT * midX + travelT * travelT * other.x
          const ty = (1 - travelT) * (1 - travelT) * node.y + 2 * (1 - travelT) * travelT * midY + travelT * travelT * other.y
          ctx.beginPath()
          ctx.arc(tx, ty, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${node.r},${node.g},${node.b},0.8)`
          ctx.fill()
        }
      }

      // Draw proximity lines between nearby same-category nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[i].s.category !== nodes[j].s.category) continue
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
          const maxD = Math.min(W, H) * 0.4
          if (d < maxD) {
            const alpha = (1 - d / maxD) * 0.08
            ctx.beginPath()
            ctx.setLineDash([1, 4])
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(${nodes[i].r},${nodes[i].g},${nodes[i].b},${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
            ctx.setLineDash([])
          }
        }
      }

      // Draw nodes
      const hov = hovRef.current
      let hoveredNode = null
      if (hov) {
        for (const node of nodes) {
          if (Math.hypot(node.x - hov.x, node.y - hov.y) < 18) { hoveredNode = node; break }
        }
      }

      for (const node of nodes) {
        const isHov = hoveredNode === node
        const age = (Date.now() - node.s.id) / 864e5
        const isRecent = age < 7
        const pulse = isRecent ? 0.85 + 0.15 * Math.sin(t * 0.002 + node.s.id * 0.001) : 1
        const baseR = 2 + node.intensity * 0.8
        const nodeR = baseR * pulse * (isHov ? 1.5 : 1)

        // Ripple rings for recent entries
        if (isRecent) {
          for (let ring = 0; ring < 2; ring++) {
            const rPhase = ((t * 0.001 + ring * 0.5 + node.s.id * 0.001) % 1)
            const rR = nodeR + rPhase * 20
            ctx.beginPath()
            ctx.arc(node.x, node.y, rR, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(${node.r},${node.g},${node.b},${0.15 * (1 - rPhase)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }

        // Aura glow
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeR * 4)
        glow.addColorStop(0, `rgba(${node.r},${node.g},${node.b},${node.intensity * 0.08})`)
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeR * 4, 0, Math.PI * 2)
        ctx.fill()

        // Node core
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2)
        const coreGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeR)
        coreGrad.addColorStop(0, `rgba(255,255,255,0.9)`)
        coreGrad.addColorStop(0.3, `rgba(${node.r},${node.g},${node.b},0.8)`)
        coreGrad.addColorStop(1, `rgba(${node.r},${node.g},${node.b},0.3)`)
        ctx.fillStyle = coreGrad
        ctx.fill()
      }

      // Hover tooltip
      if (hoveredNode) {
        const { x, y, s, cat } = hoveredNode
        const maxW = 140, boxH = 40
        let bx = x + 14, by = y - boxH / 2
        if (bx + maxW > W - 4) bx = x - maxW - 14
        if (by < 4) by = 4
        if (by + boxH > H - 4) by = H - boxH - 4
        ctx.fillStyle = 'rgba(10, 6, 28, 0.92)'
        ctx.strokeStyle = cat.color + 'aa'
        ctx.lineWidth = 0.7
        ctx.beginPath()
        ctx.roundRect(bx, by, maxW, boxH, 6)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = cat.color
        ctx.font = `500 9px 'Cinzel', serif`
        ctx.textAlign = 'left'
        ctx.fillText(cat.emoji + ' ' + s.date, bx + 8, by + 14)
        ctx.fillStyle = 'rgba(220, 210, 240, 0.85)'
        ctx.font = `11px 'Cormorant Garamond', serif`
        const label = (s.title || 'Untitled')
        ctx.fillText(label.length > 20 ? label.slice(0, 18) + '…' : label, bx + 8, by + 30)
      }

      // Stats
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(130, 100, 220, 0.5)'
      ctx.font = `500 ${Math.max(7, Math.min(W, H) * 0.065)}px 'Cinzel', serif`
      ctx.fillText(`${syncs.length} sign${syncs.length === 1 ? '' : 's'}`, W / 2, H - Math.min(W, H) * 0.08)

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [syncs])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}
