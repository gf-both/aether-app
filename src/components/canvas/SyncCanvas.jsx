import { useEffect, useRef, useMemo } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { SYNC_CATEGORIES, starPosition, analyzeSyncPatterns } from '../../engines/synchronicityEngine'

// Parse hex/rgba color to [r, g, b]
function parseColor(str) {
  const hex = str.match(/^#([0-9a-f]{6})$/i)
  if (hex) {
    const v = parseInt(hex[1], 16)
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
  }
  return [200, 180, 120]
}

export default function SyncCanvas({ syncs = [] }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(null)

  useCanvasResize(canvasRef)

  const patterns = useMemo(() => analyzeSyncPatterns(syncs), [syncs])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Background nebula particles — slow drift
    const NEBULA_COUNT = 60
    const nebulaParticles = Array.from({ length: NEBULA_COUNT }, () => ({
      x: Math.random(), y: Math.random(),
      r: 40 + Math.random() * 80,
      opacity: 0.015 + Math.random() * 0.03,
      dx: (Math.random() - 0.5) * 0.00008,
      dy: (Math.random() - 0.5) * 0.00008,
      hue: 200 + Math.random() * 120,
    }))

    // Background micro-stars (static)
    const BG_STARS = Array.from({ length: 80 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.3 + Math.random() * 0.9,
      opacity: 0.1 + Math.random() * 0.4,
      twinkleOffset: Math.random() * Math.PI * 2,
    }))

    // Mouse tracking for hover tooltip
    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      hovRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onMouseLeave() { hovRef.current = null }
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)

    function draw(t) {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr
      const H = canvas.height / dpr
      const ctx = canvas.getContext('2d')

      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, W, H)

      // ── Deep space background ──────────────────────────────────────────────
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7)
      bg.addColorStop(0, 'rgba(12, 8, 28, 1)')
      bg.addColorStop(0.5, 'rgba(6, 4, 18, 1)')
      bg.addColorStop(1, 'rgba(2, 1, 8, 1)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Drifting nebula blobs
      for (const p of nebulaParticles) {
        p.x += p.dx; p.y += p.dy
        if (p.x < -0.1) p.x = 1.1
        if (p.x > 1.1) p.x = -0.1
        if (p.y < -0.1) p.y = 1.1
        if (p.y > 1.1) p.y = -0.1
        const grd = ctx.createRadialGradient(p.x * W, p.y * H, 0, p.x * W, p.y * H, p.r)
        grd.addColorStop(0, `hsla(${p.hue}, 70%, 55%, ${p.opacity})`)
        grd.addColorStop(1, 'transparent')
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, W, H)
      }

      // Background micro-stars
      for (const s of BG_STARS) {
        const twinkle = s.opacity * (0.6 + 0.4 * Math.sin(t * 0.0012 + s.twinkleOffset))
        ctx.beginPath()
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 190, 240, ${twinkle})`
        ctx.fill()
      }

      if (syncs.length === 0) {
        // Empty state — single pulsing attractor with message
        const pulse = 0.85 + 0.15 * Math.sin(t * 0.001)
        const cx = W / 2, cy = H / 2
        const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 * pulse)
        aura.addColorStop(0, 'rgba(180, 140, 100, 0.18)')
        aura.addColorStop(1, 'transparent')
        ctx.fillStyle = aura
        ctx.fillRect(0, 0, W, H)
        ctx.beginPath()
        ctx.arc(cx, cy, 3 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201, 168, 76, ${0.7 * pulse})`
        ctx.fill()
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(201, 168, 76, 0.4)'
        ctx.font = `${Math.max(7, Math.min(W, H) * 0.075)}px 'Cinzel', serif`
        ctx.fillText('begin noticing', cx, cy + Math.min(W, H) * 0.18)
        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }

      // ── Compute star positions ──────────────────────────────────────────────
      const stars = syncs.map(s => {
        const pos = starPosition(s.id, W, H)
        const cat = SYNC_CATEGORIES[s.category] || SYNC_CATEGORIES.other
        const [r, g, b] = parseColor(cat.color)
        const brightness = 0.4 + (s.intensity || 3) * 0.12
        const baseR = 2.5 + (s.intensity || 3) * 0.9
        return { ...pos, s, cat, r, g, b, brightness, baseR }
      })

      // ── Constellation lines between same-category stars ────────────────────
      const byCategory = {}
      for (const star of stars) {
        const key = star.s.category
        if (!byCategory[key]) byCategory[key] = []
        byCategory[key].push(star)
      }

      for (const [, group] of Object.entries(byCategory)) {
        if (group.length < 2) continue
        // Connect nearest neighbors in the same category
        for (let i = 0; i < group.length; i++) {
          // Find the closest star in the same category
          let minDist = Infinity, closest = null
          for (let j = 0; j < group.length; j++) {
            if (i === j) continue
            const d = Math.hypot(group[i].x - group[j].x, group[i].y - group[j].y)
            if (d < minDist) { minDist = d; closest = group[j] }
          }
          if (closest && minDist < Math.min(W, H) * 0.55) {
            const { r, g, b } = group[i]
            const alpha = Math.max(0.04, 0.18 - minDist / (Math.min(W, H) * 3))
            ctx.beginPath()
            ctx.moveTo(group[i].x, group[i].y)
            ctx.lineTo(closest.x, closest.y)
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`
            ctx.lineWidth = 0.5
            ctx.setLineDash([2, 6])
            ctx.stroke()
            ctx.setLineDash([])
          }
        }
      }

      // ── Explicit thread links ──────────────────────────────────────────────
      const idToStar = Object.fromEntries(stars.map(s => [s.s.id, s]))
      for (const star of stars) {
        for (const linkedId of (star.s.linked || [])) {
          const other = idToStar[linkedId]
          if (!other) continue
          const { r, g, b } = star
          ctx.beginPath()
          ctx.moveTo(star.x, star.y)
          ctx.lineTo(other.x, other.y)
          ctx.strokeStyle = `rgba(${r},${g},${b},0.35)`
          ctx.lineWidth = 0.7
          ctx.stroke()
        }
      }

      // ── Draw stars ────────────────────────────────────────────────────────
      const hov = hovRef.current
      let hoveredStar = null
      if (hov) {
        let best = 999, bestStar = null
        for (const star of stars) {
          const d = Math.hypot(star.x - hov.x, star.y - hov.y)
          if (d < best && d < 24) { best = d; bestStar = star }
        }
        hoveredStar = bestStar
      }

      for (const star of stars) {
        const isHov = hoveredStar === star
        const age = (Date.now() - star.s.id) / 864e5 // days old
        const isRecent = age < 7
        const pulse = isRecent ? 0.85 + 0.15 * Math.sin(t * 0.002 + star.s.id * 0.001) : 1
        const starR = star.baseR * pulse * (isHov ? 1.5 : 1)
        const { r, g, b, brightness } = star

        // Outer glow
        const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, starR * (isRecent ? 5 : 3))
        glow.addColorStop(0, `rgba(${r},${g},${b},${brightness * 0.4})`)
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(star.x, star.y, starR * 5, 0, Math.PI * 2)
        ctx.fill()

        // Star point
        ctx.beginPath()
        ctx.arc(star.x, star.y, starR, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${brightness})`
        ctx.fill()

        // Core white glint
        ctx.beginPath()
        ctx.arc(star.x, star.y, starR * 0.35, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.7})`
        ctx.fill()
      }

      // ── Hover tooltip ─────────────────────────────────────────────────────
      if (hoveredStar) {
        const { x, y, s, cat } = hoveredStar
        const label = s.title || 'Untitled'
        const maxW = 140
        const boxH = 40
        let bx = x + 12, by = y - boxH / 2
        if (bx + maxW > W - 4) bx = x - maxW - 12
        if (by < 4) by = 4
        if (by + boxH > H - 4) by = H - boxH - 4
        ctx.fillStyle = 'rgba(10, 6, 24, 0.92)'
        ctx.strokeStyle = cat.color + 'aa'
        ctx.lineWidth = 0.7
        roundRect(ctx, bx, by, maxW, boxH, 6)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = cat.color
        ctx.font = `500 9px 'Cinzel', serif`
        ctx.textAlign = 'left'
        ctx.fillText(cat.emoji + ' ' + s.date, bx + 8, by + 14)
        ctx.fillStyle = 'rgba(220, 210, 240, 0.85)'
        ctx.font = `11px 'Cormorant Garamond', serif`
        const truncated = label.length > 20 ? label.slice(0, 18) + '…' : label
        ctx.fillText(truncated, bx + 8, by + 30)
      }

      // ── Stats overlay ─────────────────────────────────────────────────────
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(201, 168, 76, 0.45)'
      ctx.font = `500 ${Math.max(7, Math.min(W, H) * 0.07)}px 'Cinzel', serif`
      ctx.fillText(`${syncs.length} sign${syncs.length === 1 ? '' : 's'}`, W / 2, H - Math.min(W, H) * 0.1)

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

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
