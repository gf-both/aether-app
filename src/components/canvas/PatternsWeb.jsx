import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { CROSS_FRAMEWORK_ALIGNMENTS, TIMING_PATTERNS, PROFILE_PATTERN_MATCHES } from '../../data/patternsData'

function hexToRgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a.toFixed(2)})`
}

const FRAMEWORKS = [
  { id: 'natal',  icon: '\u2609', label: 'Natal',      col: '#f0c040' },
  { id: 'hd',     icon: '\u25C8', label: 'HD',         col: '#40ccdd' },
  { id: 'kab',    icon: '\u2721', label: 'Kabbalah',   col: '#aa66ff' },
  { id: 'num',    icon: '#',      label: 'Numerology', col: '#e09040' },
  { id: 'gk',     icon: '\u2B21', label: 'Gene Keys',  col: '#c44d7a' },
  { id: 'tr',     icon: '\u21BB', label: 'Transits',   col: '#88aacc' },
  { id: 'mayan',  icon: '\u2600', label: 'Mayan',      col: '#cc3333' },
  { id: 'enn',    icon: '\u25CB', label: 'Enneagram',  col: '#64ccdd' },
  { id: 'chi',    icon: '\u91D1', label: 'Chinese',    col: '#cfd8dc' },
]

const TYPE_COLORS = {
  resonance: '#c9a84c',
  tension:   '#9050e0',
  gateway:   '#40ccdd',
  mirror:    'var(--muted-foreground)',
}

// Build connection map from alignments
const connections = []
CROSS_FRAMEWORK_ALIGNMENTS.forEach((a) => {
  for (let i = 0; i < a.frameworks.length; i++) {
    for (let j = i + 1; j < a.frameworks.length; j++) {
      connections.push({
        from: a.frameworks[i],
        to: a.frameworks[j],
        strength: a.strength,
        type: a.type,
        title: a.title,
      })
    }
  }
})

// Find the strongest connections for labeling
const sorted = [...connections].sort((a, b) => b.strength - a.strength)
const labeled = sorted.slice(0, 4)

// Active patterns for pulse effect
const activeFrameworks = new Set()
TIMING_PATTERNS.filter((t) => t.activation === 'active').forEach((t) => {
  // Mark all frameworks from matching alignments
  CROSS_FRAMEWORK_ALIGNMENTS.forEach((a) => {
    if (t.pattern.toLowerCase().includes('shadow')) {
      if (a.id === 'shadow-work') a.frameworks.forEach((f) => activeFrameworks.add(f))
    }
    if (t.pattern.toLowerCase().includes('emotional')) {
      if (a.id === 'emotional-depth') a.frameworks.forEach((f) => activeFrameworks.add(f))
    }
    if (t.pattern.toLowerCase().includes('projector')) {
      if (a.id === 'projector-invitation') a.frameworks.forEach((f) => activeFrameworks.add(f))
    }
  })
})

export default function PatternsWeb() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(-1)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let time = 0

    const handleMouseMove = (e) => {
      const r = canvas.getBoundingClientRect()
      const mx = e.clientX - r.left, my = e.clientY - r.top
      const dpr = window.devicePixelRatio
      const W = canvas.width / dpr, H = canvas.height / dpr
      const cx = W / 2, cy = H / 2, R = Math.min(cx, cy) * .72
      hovRef.current = -1
      FRAMEWORKS.forEach((_, i) => {
        const a = (i / FRAMEWORKS.length) * Math.PI * 2 - Math.PI / 2
        const nx = cx + R * Math.cos(a), ny = cy + R * Math.sin(a)
        if (Math.hypot(mx - nx, my - ny) < 18) hovRef.current = i
      })
    }
    const handleMouseLeave = () => { hovRef.current = -1 }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    function draw() {
      const dpr = window.devicePixelRatio
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W === 0 || H === 0) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const cx = W / 2, cy = H / 2, R = Math.min(cx, cy) * .72
      ctx.clearRect(0, 0, W, H)
      const hov = hovRef.current
      time += 0.008

      // Background radial
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4)
      bg.addColorStop(0, 'rgba(20,12,50,.38)')
      bg.addColorStop(1, 'rgba(2,2,12,.05)')
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.4, 0, Math.PI * 2)
      ctx.fillStyle = bg; ctx.fill()

      // Subtle orbit rings
      ;[.35, .55, .72, .90].forEach((rf) => {
        ctx.beginPath(); ctx.arc(cx, cy, R * rf, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(201,168,76,.05)'; ctx.lineWidth = .5; ctx.stroke()
      })

      // Compute node positions
      const nodes = FRAMEWORKS.map((fw, i) => {
        const a = (i / FRAMEWORKS.length) * Math.PI * 2 - Math.PI / 2
        return { ...fw, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), angle: a }
      })

      // Draw connection lines
      connections.forEach((conn) => {
        const fromNode = nodes.find((n) => n.id === conn.from)
        const toNode = nodes.find((n) => n.id === conn.to)
        if (!fromNode || !toNode) return

        const baseColor = TYPE_COLORS[conn.type] || '#c9a84c'
        const thickness = (conn.strength / 10) * 2.2 + 0.3
        const alpha = 0.12 + (conn.strength / 10) * 0.18

        // Animated flow for active patterns
        const isActive = activeFrameworks.has(conn.from) && activeFrameworks.has(conn.to)
        const pulse = isActive ? 0.5 + Math.sin(time * 3) * 0.3 : 0

        ctx.beginPath()
        // Slight curve via quadratic bezier through center offset
        const mx2 = (fromNode.x + toNode.x) / 2 + (cy - (fromNode.y + toNode.y) / 2) * 0.15
        const my2 = (fromNode.y + toNode.y) / 2 + ((fromNode.x + toNode.x) / 2 - cx) * 0.15
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.quadraticCurveTo(mx2, my2, toNode.x, toNode.y)
        ctx.strokeStyle = baseColor
        ctx.globalAlpha = alpha + pulse * 0.15
        ctx.lineWidth = thickness + pulse * 1.5
        ctx.stroke()
        ctx.globalAlpha = 1

        // Label strongest connections
        const isLabeled = labeled.find((l) => l.from === conn.from && l.to === conn.to && l.title === conn.title)
        if (isLabeled) {
          const lx = (fromNode.x + toNode.x) / 2
          const ly = (fromNode.y + toNode.y) / 2
          ctx.font = `${R * .032}px 'Cinzel',serif`
          ctx.fillStyle = baseColor
          ctx.globalAlpha = 0.5
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(isLabeled.title.length > 22 ? isLabeled.title.slice(0, 22) + '\u2026' : isLabeled.title, lx, ly - R * .03)
          ctx.globalAlpha = 1
        }
      })

      // Draw outer ring people dots
      const peopleR = R * 1.18
      PROFILE_PATTERN_MATCHES.forEach((person, i) => {
        const a = (i / PROFILE_PATTERN_MATCHES.length) * Math.PI * 2 - Math.PI / 2 + Math.PI / 5
        const px = cx + peopleR * Math.cos(a)
        const py = cy + peopleR * Math.sin(a)
        const dotR = 3 + (person.resonanceScore / 100) * 4
        const glow = person.resonanceScore / 100

        // Glow
        const g = ctx.createRadialGradient(px, py, 0, px, py, dotR * 3)
        g.addColorStop(0, `rgba(201,168,76,${glow * 0.15})`); g.addColorStop(1, 'transparent')
        ctx.beginPath(); ctx.arc(px, py, dotR * 3, 0, Math.PI * 2)
        ctx.fillStyle = g; ctx.fill()

        // Dot
        ctx.beginPath(); ctx.arc(px, py, dotR, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,168,76,${0.4 + glow * 0.4})`; ctx.fill()

        // Name
        ctx.font = `${R * .028}px 'Cormorant Garamond',serif`
        ctx.fillStyle = 'var(--muted-foreground)'; ctx.textAlign = 'center'
        ctx.fillText(person.personName.split(' ')[0], px, py + dotR + R * .04)
      })

      // Draw framework nodes
      nodes.forEach((node, i) => {
        const isHov = hov === i
        const isActive2 = activeFrameworks.has(node.id)
        const pulse2 = isActive2 ? 0.5 + Math.sin(time * 2.5 + i) * 0.35 : 0
        const nodeR = R * (isHov ? .075 : .058)

        // Active glow
        if (isActive2) {
          const ag = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeR * 2.5)
          ag.addColorStop(0, hexToRgba(node.col, 0.15 + pulse2 * 0.1))
          ag.addColorStop(1, 'transparent')
          ctx.beginPath(); ctx.arc(node.x, node.y, nodeR * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = ag; ctx.fill()
        }

        // Hover glow
        if (isHov) {
          const hg = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeR * 2)
          hg.addColorStop(0, hexToRgba(node.col, 0.2)); hg.addColorStop(1, 'transparent')
          ctx.beginPath(); ctx.arc(node.x, node.y, nodeR * 2, 0, Math.PI * 2)
          ctx.fillStyle = hg; ctx.fill()
        }

        // Node circle
        ctx.beginPath(); ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(8,8,28,.85)'; ctx.fill()
        ctx.strokeStyle = isHov ? node.col : hexToRgba(node.col, 0.4)
        ctx.lineWidth = isHov ? 1.5 : 0.8; ctx.stroke()

        // Icon
        ctx.font = `${nodeR * (isHov ? 1.1 : .9)}px serif`
        ctx.fillStyle = isHov ? '#fff' : node.col
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(node.icon, node.x, node.y)

        // Label
        const labelDist = nodeR + R * .04
        const lx = node.x + Math.cos(node.angle) * labelDist * .6
        const ly = node.y + Math.sin(node.angle) * labelDist
        ctx.font = `${R * (isHov ? .036 : .03)}px 'Cinzel',serif`
        ctx.fillStyle = isHov ? 'var(--foreground)' : 'rgba(201,168,76,.45)'
        ctx.textAlign = 'center'
        ctx.fillText(node.label, lx, ly)
      })

      // Center node — YOU
      const centerR = R * .13
      const centerPulse = 0.5 + Math.sin(time * 1.5) * 0.15

      // Center glow
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerR * 2.2)
      cg.addColorStop(0, `rgba(201,168,76,${0.08 + centerPulse * 0.04})`)
      cg.addColorStop(1, 'rgba(1,1,10,0)')
      ctx.beginPath(); ctx.arc(cx, cy, centerR * 2.2, 0, Math.PI * 2)
      ctx.fillStyle = cg; ctx.fill()

      // Center circle
      ctx.beginPath(); ctx.arc(cx, cy, centerR, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(8,8,28,.9)'; ctx.fill()
      ctx.strokeStyle = `rgba(201,168,76,${0.3 + centerPulse * 0.15})`
      ctx.lineWidth = 1.2; ctx.stroke()

      // Center text
      ctx.font = `bold ${centerR * .55}px 'Cinzel',serif`
      ctx.fillStyle = `rgba(201,168,76,${0.6 + centerPulse * 0.2})`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('YOU', cx, cy - centerR * .12)
      ctx.font = `${centerR * .22}px 'Cinzel',serif`
      ctx.fillStyle = 'rgba(201,168,76,.3)'
      ctx.fillText(CROSS_FRAMEWORK_ALIGNMENTS.length + ' ALIGNMENTS', cx, cy + centerR * .32)

      // Legend
      const legendX = 14, legendY = H - 56
      ctx.font = `${R * .023}px 'Cinzel',serif`
      ;[
        ['resonance', '#c9a84c'],
        ['tension', '#9050e0'],
        ['gateway', '#40ccdd'],
        ['mirror', 'var(--muted-foreground)'],
      ].forEach(([label, col], i) => {
        const lx2 = legendX, ly2 = legendY + i * 13
        ctx.beginPath()
        ctx.moveTo(lx2, ly2 + 2); ctx.lineTo(lx2 + 16, ly2 + 2)
        ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke()
        ctx.fillStyle = 'var(--muted-foreground)'; ctx.textAlign = 'left'
        ctx.fillText(label, lx2 + 20, ly2 + 5)
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
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
