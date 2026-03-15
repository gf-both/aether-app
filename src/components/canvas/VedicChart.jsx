import { useEffect, useRef, useMemo } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { getVedicChart } from '../../engines/vedicEngine'
import {
  VEDIC_SIGNS, VEDIC_SIGN_COLORS, VEDIC_PLANET_GLYPHS, VEDIC_PLANET_COLORS, VEDIC_SIGN_ELEMENTS,
} from '../../data/vedicData'

function parseDOB(dob) {
  if (!dob) return null
  const [y, m, d] = dob.split('-').map(Number)
  return { year: y, month: m, day: d }
}
function parseTOB(tob) {
  if (!tob) return { hour: 12, minute: 0 }
  const [h, m] = tob.split(':').map(Number)
  return { hour: h || 0, minute: m || 0 }
}

function computeChart(profile) {
  const dob = parseDOB(profile.dob)
  const tob = parseTOB(profile.tob)
  if (!dob) return null
  return getVedicChart({
    day: dob.day, month: dob.month, year: dob.year,
    hour: tob.hour, minute: tob.minute,
    lat: profile.birthLat ?? -34.6037,
    lon: profile.birthLon ?? -58.3816,
    timezone: profile.birthTimezone ?? -3,
  })
}

const PLANET_ORDER = ['sun','moon','mercury','venus','mars','jupiter','saturn','rahu','ketu']

export default function VedicChart() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(-1)
  const chartRef = useRef(null)

  const profile = useAboveInsideStore(s => s.primaryProfile)

  const chart = useMemo(() => {
    try { return computeChart(profile) } catch { return null }
  }, [profile.dob, profile.tob, profile.birthLat, profile.birthLon, profile.birthTimezone])

  useEffect(() => { chartRef.current = chart }, [chart])
  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    const handleMouseMove = (e) => {
      const r = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      const mx = e.clientX - r.left, my = e.clientY - r.top
      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * 0.36
      hovRef.current = -1
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
        const sx = cx + R * Math.cos(angle), sy = cy + R * Math.sin(angle)
        if (Math.hypot(mx - sx, my - sy) < R * 0.14) { hovRef.current = i; break }
      }
    }
    const handleMouseLeave = () => { hovRef.current = -1 }
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    function norm(lon) { return ((lon % 360) + 360) % 360 }

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W < 10 || H < 10) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      pulse += 0.007

      const ch = chartRef.current
      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * 0.36
      const hov = hovRef.current

      // Lagna sign index (where ASC is)
      const lagnaSignIdx = ch ? Math.floor(ch.lagna.siderealLon / 30) : 0

      // ── Radial background glow ──
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4)
      bg.addColorStop(0, 'rgba(80,40,160,.1)')
      bg.addColorStop(0.5, 'rgba(40,20,80,.06)')
      bg.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.4, 0, Math.PI * 2)
      ctx.fillStyle = bg
      ctx.fill()

      // ── Outer decorative ring ──
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.22, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(160,100,255,${0.12 + 0.04 * Math.sin(pulse)})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Decorative tick marks
      for (let i = 0; i < 72; i++) {
        const angle = (i / 72) * Math.PI * 2
        const len = i % 6 === 0 ? R * 0.04 : R * 0.015
        const r0 = R * 1.22
        ctx.beginPath()
        ctx.moveTo(cx + r0 * Math.cos(angle), cy + r0 * Math.sin(angle))
        ctx.lineTo(cx + (r0 + len) * Math.cos(angle), cy + (r0 + len) * Math.sin(angle))
        ctx.strokeStyle = i % 6 === 0 ? 'rgba(160,100,255,.2)' : 'rgba(160,100,255,.06)'
        ctx.lineWidth = i % 6 === 0 ? 1 : 0.5
        ctx.stroke()
      }

      // ── 12 Rashi (sign) segments ──
      const segArc = (Math.PI * 2) / 12
      for (let i = 0; i < 12; i++) {
        // In Vedic chart, Lagna is at top. Signs go counter-clockwise from lagna.
        const signIdx = (lagnaSignIdx + i) % 12
        const a0 = (i / 12) * Math.PI * 2 - Math.PI / 2 - segArc / 2
        const a1 = a0 + segArc
        const isLagna = i === 0
        const isHov = hov === i
        const col = VEDIC_SIGN_COLORS[signIdx]
        const elem = VEDIC_SIGN_ELEMENTS[signIdx]

        // Segment fill
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, R * 1.18, a0, a1)
        ctx.closePath()
        if (isLagna) {
          ctx.fillStyle = `rgba(160,100,255,${0.14 + 0.06 * Math.sin(pulse * 1.5)})`
        } else if (isHov) {
          ctx.fillStyle = col + '15'
        } else {
          ctx.fillStyle = `rgba(20,10,50,${0.04 + (i % 2) * 0.02})`
        }
        ctx.fill()

        // Segment border
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, R * 1.18, a0, a1)
        ctx.closePath()
        ctx.strokeStyle = isLagna ? 'rgba(160,100,255,.4)' : 'rgba(160,100,255,.08)'
        ctx.lineWidth = isLagna ? 1.2 : 0.5
        ctx.stroke()

        // Radial divider
        ctx.beginPath()
        ctx.moveTo(cx + R * 0.6 * Math.cos(a0), cy + R * 0.6 * Math.sin(a0))
        ctx.lineTo(cx + R * 1.18 * Math.cos(a0), cy + R * 1.18 * Math.sin(a0))
        ctx.strokeStyle = 'rgba(160,100,255,.06)'
        ctx.lineWidth = 0.4
        ctx.stroke()

        // Sign node
        const midAngle = (i / 12) * Math.PI * 2 - Math.PI / 2
        const sx = cx + R * Math.cos(midAngle)
        const sy = cy + R * Math.sin(midAngle)
        const sr = R * 0.11

        // Glow for lagna
        if (isLagna) {
          const aura = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 3)
          aura.addColorStop(0, `rgba(160,100,255,${0.25 + 0.1 * Math.sin(pulse * 1.5)})`)
          aura.addColorStop(1, 'rgba(160,100,255,0)')
          ctx.beginPath()
          ctx.arc(sx, sy, sr * 3, 0, Math.PI * 2)
          ctx.fillStyle = aura
          ctx.fill()
        }

        // Circle
        ctx.beginPath()
        ctx.arc(sx, sy, sr, 0, Math.PI * 2)
        if (isLagna) {
          const cg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr)
          cg.addColorStop(0, 'rgba(160,100,255,.4)')
          cg.addColorStop(1, 'rgba(160,100,255,.1)')
          ctx.fillStyle = cg
          ctx.strokeStyle = `rgba(160,100,255,${isHov ? 0.9 : 0.6})`
        } else {
          ctx.fillStyle = isHov ? col + '20' : 'rgba(10,5,30,.55)'
          ctx.strokeStyle = isHov ? col + '66' : col + '22'
        }
        ctx.fill()
        ctx.lineWidth = isLagna ? 1.4 : 0.6
        ctx.stroke()

        // Sign number (rashi number in the house)
        const sigNum = signIdx + 1
        const numSize = Math.max(8, sr * 1.0)
        ctx.font = `bold ${numSize}px 'Cinzel',serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = isLagna ? 'rgba(200,160,255,.9)' : col + 'cc'
        ctx.fillText(sigNum, sx, sy)

        // Sanskrit name label
        const labelR = R * 1.34
        const lx = cx + labelR * Math.cos(midAngle)
        const ly = cy + labelR * Math.sin(midAngle)
        const labelSize = Math.max(5.5, R * 0.055)
        ctx.font = `${labelSize}px 'Cinzel',serif`
        ctx.fillStyle = isLagna ? 'rgba(200,160,255,.9)' : isHov ? 'rgba(200,160,255,.6)' : 'rgba(180,140,255,.28)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(VEDIC_SIGNS[signIdx], lx, ly)

        // Lagna marker
        if (isLagna) {
          const lagR = R * 0.78
          const lagX = cx + lagR * Math.cos(midAngle)
          const lagY = cy + lagR * Math.sin(midAngle)
          const lagSize = Math.max(5, R * 0.042)
          ctx.font = `${lagSize}px 'Cinzel',serif`
          ctx.fillStyle = 'rgba(200,160,255,.65)'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('ASC', lagX, lagY)
        }

        // Element dot
        const dotR = R * 0.84
        const dx = cx + dotR * Math.cos(midAngle)
        const dy = cy + dotR * Math.sin(midAngle)
        ctx.beginPath()
        ctx.arc(dx, dy, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = col + (isLagna ? 'bb' : '44')
        ctx.fill()
      }

      // ── Planet positions ──
      if (ch) {
        // Build per-sign planet lists
        const signPlanets = Array.from({ length: 12 }, () => [])
        for (const body of PLANET_ORDER) {
          const p = ch.planets[body]
          if (!p || p.siderealLon == null) continue
          // Find which segment (house position) this sign maps to
          const pSignIdx = Math.floor(p.siderealLon / 30)
          // Segment index: difference from lagna sign, going counter-clockwise
          const segIdx = ((pSignIdx - lagnaSignIdx) + 12) % 12
          signPlanets[segIdx].push({ body, ...p })
        }

        for (let segIdx = 0; segIdx < 12; segIdx++) {
          const ps = signPlanets[segIdx]
          if (ps.length === 0) continue
          const midAngle = (segIdx / 12) * Math.PI * 2 - Math.PI / 2
          const baseR = R * 0.52

          ps.forEach((p, j) => {
            const spread = ps.length > 1 ? ((j - (ps.length - 1) / 2) * R * 0.18) : 0
            const perpAngle = midAngle + Math.PI / 2
            const px = cx + baseR * Math.cos(midAngle) + spread * Math.cos(perpAngle)
            const py = cy + baseR * Math.sin(midAngle) + spread * Math.sin(perpAngle)
            const col = VEDIC_PLANET_COLORS[p.body] || '#cccccc'
            const glyph = VEDIC_PLANET_GLYPHS[p.body] || '?'

            // Planet dot
            ctx.beginPath()
            ctx.arc(px, py, R * 0.055, 0, Math.PI * 2)
            const pg = ctx.createRadialGradient(px, py, 0, px, py, R * 0.055)
            pg.addColorStop(0, col + 'cc')
            pg.addColorStop(1, col + '22')
            ctx.fillStyle = pg
            ctx.fill()
            ctx.strokeStyle = col + '66'
            ctx.lineWidth = 0.8
            ctx.stroke()

            // Planet glyph
            const glSize = Math.max(8, R * 0.09)
            ctx.font = `${glSize}px sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = col
            ctx.fillText(glyph, px, py - R * 0.065)
          })
        }
      }

      // ── Inner decorative ring ──
      const innerR = R * 0.58
      ctx.beginPath()
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(160,100,255,.1)'
      ctx.lineWidth = 0.7
      ctx.stroke()

      // Rotating petals
      ctx.save()
      ctx.globalAlpha = 0.04
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + pulse * 0.1
        const r1 = innerR * 0.4, r2 = innerR * 0.85
        const ax = cx + r1 * Math.cos(angle), ay = cy + r1 * Math.sin(angle)
        const bx = cx + r2 * Math.cos(angle + 0.26), by = cy + r2 * Math.sin(angle + 0.26)
        const ccx = cx + r2 * Math.cos(angle - 0.26), ccy = cy + r2 * Math.sin(angle - 0.26)
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.quadraticCurveTo(bx, by, cx + r1 * 0.6 * Math.cos(angle + 0.52), cy + r1 * 0.6 * Math.sin(angle + 0.52))
        ctx.quadraticCurveTo(ccx, ccy, ax, ay)
        ctx.fillStyle = 'rgba(160,100,255,.9)'
        ctx.fill()
      }
      ctx.restore()

      // ── Center: Sri Yantra-inspired motif ──
      const centerR = R * 0.2
      ctx.beginPath()
      ctx.arc(cx, cy, centerR, 0, Math.PI * 2)
      const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerR)
      cGrad.addColorStop(0, 'rgba(30,10,70,.9)')
      cGrad.addColorStop(1, 'rgba(5,2,18,.95)')
      ctx.fillStyle = cGrad
      ctx.fill()
      ctx.strokeStyle = `rgba(160,100,255,${0.3 + 0.1 * Math.sin(pulse)})`
      ctx.lineWidth = 1.2
      ctx.stroke()

      // Inner star
      ctx.save()
      ctx.globalAlpha = 0.08
      for (let ring = 0; ring < 2; ring++) {
        const rr = centerR * (0.4 + ring * 0.35)
        const pts = 6
        ctx.beginPath()
        for (let p = 0; p <= pts; p++) {
          const a = (p / pts) * Math.PI * 2 - Math.PI / 6 + pulse * 0.15
          const rad = p % 2 === 0 ? rr : rr * 0.55
          if (p === 0) ctx.moveTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a))
          else ctx.lineTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a))
        }
        ctx.closePath()
        ctx.strokeStyle = 'rgba(200,160,255,.9)'
        ctx.lineWidth = 0.7
        ctx.stroke()
      }
      ctx.restore()

      // Center text
      if (ch) {
        const nameSize = Math.max(6, centerR * 0.38)
        ctx.font = `${nameSize}px 'Cinzel',serif`
        ctx.fillStyle = `rgba(200,160,255,${0.6 + 0.15 * Math.sin(pulse * 0.8)})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('JYOTISH', cx, cy - nameSize * 0.6)

        const subSize = Math.max(5, centerR * 0.3)
        ctx.font = `${subSize}px 'Inconsolata',monospace`
        ctx.fillStyle = 'rgba(160,100,255,.5)'
        ctx.fillText(ch.lagna.sign, cx, cy + subSize * 0.8)
      }

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
