import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { HEBREW_ALPHABET, GEMATRIA_PROFILE, getGematriaProfile } from '../../data/gematriaData'
import { DEFAULT_PRIMARY_PROFILE } from '../../data/primaryProfile'

// Compute chart data from engine (dynamic, reads primaryProfile)
function getChartData() {
  const { name, dob } = DEFAULT_PRIMARY_PROFILE
  let day = 23, month = 1, year = 1981
  if (dob) {
    const parts = dob.split('-')
    year = parseInt(parts[0], 10)
    month = parseInt(parts[1], 10)
    day = parseInt(parts[2], 10)
  }
  const fullName = name || 'GASTON FRYDLEWSKI'
  const eng = getGematriaProfile({ fullName, day, month, year })

  // Build a letterBreakdown compatible with the canvas drawing code:
  // needs { letter, hebrewEquiv, hebrewValue }
  const letterBreakdown = eng.nameLetterBreakdown.map(({ letter }) => {
    const staticEntry = GEMATRIA_PROFILE.letterBreakdown.find(b => b.letter === letter)
    return {
      letter,
      hebrewEquiv: staticEntry?.hebrewEquiv || '--',
      hebrewChar: staticEntry?.hebrewChar || '',
      hebrewValue: staticEntry?.hebrewValue || 0,
    }
  })

  return {
    fullName,
    breakdown: letterBreakdown,
    totalHebrew: eng.methods.hebrew.fullName.total,
    reducedHebrew: eng.methods.hebrew.fullName.reduced,
  }
}

export default function GematriaChart() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(-1)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    const chartData = getChartData()
    const name = chartData.fullName.toUpperCase().replace(/\s/g, '')
    const breakdown = chartData.breakdown
    const totalHebrew = chartData.totalHebrew

    // Build letter frequency map
    const freq = {}
    breakdown.forEach(b => { freq[b.letter] = (freq[b.letter] || 0) + 1 })
    const freqEntries = Object.entries(freq).sort((a, b) => b[1] - a[1])
    const maxFreq = Math.max(...freqEntries.map(e => e[1]))

    // Map each name letter to its closest Hebrew letter index
    const hebrewNames = HEBREW_ALPHABET.map(h => h.letter)
    function findHebrewIndex(hebrewName) {
      return hebrewNames.indexOf(hebrewName)
    }

    const handleMouseMove = (e) => {
      const r = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const mx = e.clientX - r.left, my = e.clientY - r.top
      const W = canvas.width / dpr, H = canvas.height / dpr
      const cx = W / 2, cy = H * .44
      const outerR = Math.min(W, H) * .38
      hovRef.current = -1
      for (let i = 0; i < 22; i++) {
        const angle = (i / 22) * Math.PI * 2 - Math.PI / 2
        const px = cx + outerR * Math.cos(angle)
        const py = cy + outerR * Math.sin(angle)
        if (Math.hypot(mx - px, my - py) < 16) { hovRef.current = i; break }
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
      pulse += .014

      const cx = W / 2, cy = H * .44
      const outerR = Math.min(W, H) * .38
      const innerR = outerR * .52
      const hovIdx = hovRef.current

      // Subtle radial background glow
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR * 1.5)
      bgGrad.addColorStop(0, 'rgba(201,168,76,.025)')
      bgGrad.addColorStop(1, 'rgba(201,168,76,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, outerR * 1.5, 0, Math.PI * 2)
      ctx.fillStyle = bgGrad
      ctx.fill()

      // Outer ring
      ctx.beginPath()
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(201,168,76,${.14 + .05 * Math.sin(pulse)})`
      ctx.lineWidth = 1.2
      ctx.stroke()

      // Second subtle outer ring
      ctx.beginPath()
      ctx.arc(cx, cy, outerR * 1.06, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201,168,76,.05)'
      ctx.lineWidth = .5
      ctx.stroke()

      // Inner ring (for name arc)
      ctx.beginPath()
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201,168,76,.08)'
      ctx.lineWidth = .6
      ctx.stroke()

      // Connection lines: name letters -> Hebrew equivalents
      const nameLen = breakdown.length
      breakdown.forEach((b, ni) => {
        const nameAngle = ((ni / nameLen) * Math.PI * 1.6) - Math.PI * .8 - Math.PI / 2
        const nx = cx + innerR * Math.cos(nameAngle)
        const ny = cy + innerR * Math.sin(nameAngle)

        const hIdx = findHebrewIndex(b.hebrewEquiv)
        if (hIdx < 0) return
        const hAngle = (hIdx / 22) * Math.PI * 2 - Math.PI / 2
        const hx = cx + outerR * Math.cos(hAngle)
        const hy = cy + outerR * Math.sin(hAngle)

        // Color by value: warm for high, cool for low
        const t = Math.min(b.hebrewValue / 400, 1)
        const r = Math.round(80 + 160 * t)
        const g = Math.round(180 - 80 * t)
        const bv = Math.round(220 - 160 * t)
        const lineAlpha = .12 + .06 * Math.sin(pulse + ni * .4)
        ctx.beginPath()
        ctx.moveTo(nx, ny)
        ctx.lineTo(hx, hy)
        ctx.strokeStyle = `rgba(${r},${g},${bv},${lineAlpha})`
        ctx.lineWidth = .7
        ctx.stroke()
      })

      // Draw 22 Hebrew letters on outer ring
      HEBREW_ALPHABET.forEach((h, i) => {
        const angle = (i / 22) * Math.PI * 2 - Math.PI / 2
        const px = cx + outerR * Math.cos(angle)
        const py = cy + outerR * Math.sin(angle)
        const isHov = hovIdx === i
        const gp = .2 + .08 * Math.sin(pulse + i * .5)

        // Check if any name letter maps to this Hebrew letter
        const isConnected = breakdown.some(b => b.hebrewEquiv === h.letter)

        if (isConnected || isHov) {
          const aura = ctx.createRadialGradient(px, py, 0, px, py, 18)
          aura.addColorStop(0, `rgba(201,168,76,${isHov ? .35 : gp})`)
          aura.addColorStop(1, 'rgba(201,168,76,0)')
          ctx.beginPath()
          ctx.arc(px, py, 18, 0, Math.PI * 2)
          ctx.fillStyle = aura
          ctx.fill()
        }

        // Dot
        const dotR = isHov ? 11 : (isConnected ? 9 : 6.5)
        ctx.beginPath()
        ctx.arc(px, py, dotR, 0, Math.PI * 2)
        if (isConnected) {
          const dg = ctx.createRadialGradient(px, py, 0, px, py, dotR)
          dg.addColorStop(0, `rgba(201,168,76,${.3 + gp * .3})`)
          dg.addColorStop(1, 'rgba(201,168,76,.1)')
          ctx.fillStyle = dg
          ctx.fill()
          ctx.strokeStyle = `rgba(201,168,76,${isHov ? .8 : .45})`
        } else {
          ctx.fillStyle = `rgba(80,90,130,${isHov ? .35 : .12})`
          ctx.fill()
          ctx.strokeStyle = `rgba(80,90,130,${isHov ? .5 : .2})`
        }
        ctx.lineWidth = isConnected ? 1 : .5
        ctx.stroke()

        // Hebrew character
        const charSize = isHov ? 14 : (isConnected ? 12 : 9)
        ctx.font = `${charSize}px serif`
        ctx.fillStyle = isConnected
          ? `rgba(201,168,76,${isHov ? 1 : .75})`
          : `rgba(120,130,170,${isHov ? .7 : .3})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(h.hebrew, px, py)

        // Value label outside ring
        const labelR = outerR + 16
        const lx = cx + labelR * Math.cos(angle)
        const ly = cy + labelR * Math.sin(angle)
        ctx.font = `${isHov ? 8 : 6.5}px 'Inconsolata',monospace`
        ctx.fillStyle = isConnected
          ? `rgba(201,168,76,${isHov ? .7 : .4})`
          : `rgba(100,110,150,${isHov ? .5 : .2})`
        ctx.fillText(String(h.value), lx, ly)

        // Name label on hover
        if (isHov) {
          const nameR = outerR - 18
          const nlx = cx + nameR * Math.cos(angle)
          const nly = cy + nameR * Math.sin(angle)
          ctx.font = "7px 'Cinzel',serif"
          ctx.fillStyle = 'rgba(255,230,180,.6)'
          ctx.fillText(h.letter, nlx, nly)
        }
      })

      // Name letters on inner arc
      breakdown.forEach((b, ni) => {
        const nameAngle = ((ni / nameLen) * Math.PI * 1.6) - Math.PI * .8 - Math.PI / 2
        const nx = cx + innerR * Math.cos(nameAngle)
        const ny = cy + innerR * Math.sin(nameAngle)
        const gp2 = .3 + .12 * Math.sin(pulse + ni * .6)

        // Small aura
        const aura2 = ctx.createRadialGradient(nx, ny, 0, nx, ny, 10)
        aura2.addColorStop(0, `rgba(201,168,76,${gp2 * .4})`)
        aura2.addColorStop(1, 'rgba(201,168,76,0)')
        ctx.beginPath()
        ctx.arc(nx, ny, 10, 0, Math.PI * 2)
        ctx.fillStyle = aura2
        ctx.fill()

        // Letter dot
        ctx.beginPath()
        ctx.arc(nx, ny, 5.5, 0, Math.PI * 2)
        const t = Math.min(b.hebrewValue / 400, 1)
        const r = Math.round(160 + 80 * t)
        const g = Math.round(200 - 60 * t)
        const bv = Math.round(120 - 80 * t)
        ctx.fillStyle = `rgba(${r},${g},${bv},.35)`
        ctx.fill()
        ctx.strokeStyle = `rgba(${r},${g},${bv},.5)`
        ctx.lineWidth = .7
        ctx.stroke()

        // Letter character
        ctx.font = "bold 9px 'Cinzel',serif"
        ctx.fillStyle = 'rgba(255,240,200,.8)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(b.letter, nx, ny)
      })

      // Center: total gematria value
      const centerSize = Math.max(20, outerR * .18)
      ctx.font = `bold ${centerSize}px 'Cinzel',serif`
      ctx.fillStyle = `rgba(201,168,76,${.65 + .18 * Math.sin(pulse * .7)})`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(totalHebrew), cx, cy - 4)

      // Subtitle
      ctx.font = `${Math.max(7, outerR * .055)}px 'Cormorant Garamond',serif`
      ctx.fillStyle = 'rgba(170,180,200,.42)'
      ctx.fillText('Hebrew Gematria', cx, cy + centerSize * .7)

      // Reduced value small
      ctx.font = `${Math.max(6, outerR * .04)}px 'Inconsolata',monospace`
      ctx.fillStyle = 'rgba(201,168,76,.35)'
      ctx.fillText('\u2192 ' + chartData.reducedHebrew, cx, cy + centerSize * 1.1)

      // Bottom: letter frequency bar chart
      const barArea = { x: W * .08, y: H * .86, w: W * .84, h: H * .10 }
      const barW = Math.min(barArea.w / freqEntries.length - 2, 18)
      const totalBarW = freqEntries.length * (barW + 2)
      const barStartX = barArea.x + (barArea.w - totalBarW) / 2

      // Label
      ctx.font = "6px 'Cinzel',serif"
      ctx.fillStyle = 'rgba(201,168,76,.3)'
      ctx.textAlign = 'center'
      ctx.fillText('LETTER FREQUENCY', W / 2, barArea.y - 6)

      freqEntries.forEach(([letter, count], i) => {
        const bx = barStartX + i * (barW + 2)
        const bh = (count / maxFreq) * barArea.h * .75
        const by = barArea.y + barArea.h - bh

        const t = count / maxFreq
        const barGrad = ctx.createLinearGradient(bx, by, bx, by + bh)
        barGrad.addColorStop(0, `rgba(201,168,76,${.15 + t * .25})`)
        barGrad.addColorStop(1, `rgba(201,168,76,${.05 + t * .1})`)
        ctx.fillStyle = barGrad
        ctx.fillRect(bx, by, barW, bh)

        ctx.strokeStyle = `rgba(201,168,76,${.15 + t * .2})`
        ctx.lineWidth = .5
        ctx.strokeRect(bx, by, barW, bh)

        // Letter label
        ctx.font = `${Math.max(6, barW * .55)}px 'Cinzel',serif`
        ctx.fillStyle = `rgba(201,168,76,${.35 + t * .35})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(letter, bx + barW / 2, by + bh + 2)

        // Count
        ctx.font = `${Math.max(5, barW * .4)}px 'Inconsolata',monospace`
        ctx.fillStyle = 'rgba(170,180,200,.35)'
        ctx.textBaseline = 'bottom'
        ctx.fillText(String(count), bx + barW / 2, by - 1)
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
