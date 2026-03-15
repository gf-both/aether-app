import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'

// Planet symbols in draw order (matches natalEngine keys)
const PLANET_KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'northNode']
const PLANET_SYMS = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇', northNode: '☊',
}

const SIGN_SYMS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']

/**
 * SynastryWheel
 * Props:
 *   mode       – 'romantic' | 'family'
 *   nameA/nameB – display names
 *   chartA/chartB – natalEngine chart objects (optional – uses placeholder when absent)
 *   aspects    – synastry aspects array from getSynastryReport (optional)
 */
export default function SynastryWheel({ mode = 'romantic', nameA = 'A', nameB = 'B', chartA, chartB, aspects }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let rot = 0
    const colA = 'rgba(201,168,76,'
    const colB = mode === 'romantic' ? 'rgba(212,48,112,' : 'rgba(64,204,221,'

    // Extract real planet longitudes or fall back to evenly spaced placeholders
    function getPlanetLons(chart, fallbackOffset = 0) {
      if (chart && chart.planets) {
        return PLANET_KEYS.map(k => chart.planets[k]?.lon ?? (fallbackOffset + PLANET_KEYS.indexOf(k) * 30))
      }
      // Placeholder positions
      return PLANET_KEYS.map((_, i) => fallbackOffset + i * (360 / PLANET_KEYS.length))
    }

    // Build aspect line pairs from real aspects data
    function getAspectPairs(plonsA, plonsB) {
      if (!aspects || aspects.length === 0) {
        // Default decorative pairs
        return mode === 'romantic'
          ? [[0,1],[1,2],[2,4],[3,0],[4,3],[5,6]]
          : [[0,0],[1,1],[2,3],[3,5],[4,2]]
      }
      // Map real aspects to index pairs (capped at 8 lines for readability)
      const pairs = []
      for (const asp of aspects.slice(0, 8)) {
        const iA = PLANET_KEYS.indexOf(asp.reversed ? asp.p2 : asp.p1)
        const iB = PLANET_KEYS.indexOf(asp.reversed ? asp.p1 : asp.p2)
        if (iA >= 0 && iB >= 0) pairs.push([iA, iB, asp.harmony])
      }
      return pairs
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr
      const H = canvas.height / dpr
      if (W === 0 || H === 0) { animRef.current = requestAnimationFrame(draw); return }

      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const cx = W / 2, cy = H / 2, R = Math.min(cx, cy) * 0.92
      ctx.clearRect(0, 0, W, H)

      // Background
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R)
      bg.addColorStop(0, 'rgba(15,8,40,.6)')
      bg.addColorStop(1, 'rgba(1,1,10,.1)')
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = bg; ctx.fill()

      // Rings
      ;[0.95, 0.78, 0.60, 0.42].forEach((rf, i) => {
        ctx.beginPath(); ctx.arc(cx, cy, R * rf, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(201,168,76,${[.2,.15,.1,.07][i]})`
        ctx.lineWidth = 0.5; ctx.stroke()
      })

      // Sign segments (zodiac wheel outer ring)
      for (let i = 0; i < 12; i++) {
        const a0 = (i * 30 - 90 + rot) * Math.PI / 180
        const a1 = ((i + 1) * 30 - 90 + rot) * Math.PI / 180
        ctx.beginPath()
        ctx.arc(cx, cy, R * 0.95, a0, a1)
        ctx.arc(cx, cy, R * 0.78, a1, a0, true)
        ctx.closePath()
        ctx.strokeStyle = `rgba(201,168,76,${i % 2 === 0 ? .08 : .04})`
        ctx.lineWidth = 0.4; ctx.stroke()
        const am = (i * 30 + 15 - 90 + rot) * Math.PI / 180
        ctx.font = `${R * 0.055}px serif`
        ctx.fillStyle = 'rgba(201,168,76,.25)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(SIGN_SYMS[i], cx + R * 0.865 * Math.cos(am), cy + R * 0.865 * Math.sin(am))
      }

      const lonsA = getPlanetLons(chartA, 0)
      const lonsB = getPlanetLons(chartB, 15)
      const syms = PLANET_KEYS.map(k => PLANET_SYMS[k])

      // A planets (outer ring at 0.68R)
      lonsA.forEach((deg, i) => {
        const a = (deg - 90 + rot) * Math.PI / 180
        const rp = R * 0.68
        const px = cx + rp * Math.cos(a)
        const py = cy + rp * Math.sin(a)
        ctx.beginPath(); ctx.arc(px, py, R * 0.018, 0, Math.PI * 2)
        ctx.fillStyle = colA + '0.8)'; ctx.fill()
        ctx.font = `${R * 0.05}px serif`
        ctx.fillStyle = colA + '0.9)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(syms[i], px, py - R * 0.038)
      })

      // B planets (inner ring at 0.50R)
      lonsB.forEach((deg, i) => {
        const a = (deg - 90 + rot) * Math.PI / 180
        const rp = R * 0.50
        const px = cx + rp * Math.cos(a)
        const py = cy + rp * Math.sin(a)
        ctx.beginPath(); ctx.arc(px, py, R * 0.018, 0, Math.PI * 2)
        ctx.fillStyle = colB + '0.8)'; ctx.fill()
        ctx.font = `${R * 0.05}px serif`
        ctx.fillStyle = colB + '0.9)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(syms[i], px, py - R * 0.038)
      })

      // Aspect lines between rings
      const pairs = getAspectPairs(lonsA, lonsB)
      pairs.forEach(([ai, bi, harmony]) => {
        const aa = (lonsA[ai] - 90 + rot) * Math.PI / 180
        const ab = (lonsB[bi] - 90 + rot) * Math.PI / 180
        const rpA = R * 0.68, rpB = R * 0.50
        ctx.beginPath()
        ctx.moveTo(cx + rpA * Math.cos(aa), cy + rpA * Math.sin(aa))
        ctx.lineTo(cx + rpB * Math.cos(ab), cy + rpB * Math.sin(ab))
        const lineColor = harmony === 'harmonious'
          ? 'rgba(100,220,100,.25)'
          : harmony === 'challenging'
            ? 'rgba(220,80,80,.2)'
            : (mode === 'romantic' ? 'rgba(212,48,112,.2)' : 'rgba(64,204,221,.18)')
        ctx.strokeStyle = lineColor
        ctx.lineWidth = 0.7; ctx.stroke()
      })

      // Ring labels (A = outer, B = inner)
      const labelFont = `${R * 0.032}px 'Cinzel',serif`
      ctx.font = labelFont; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = colA + '0.45)'
      ctx.fillText(nameA, cx, cy - R * 0.68 - R * 0.06)
      ctx.fillStyle = colB + '0.45)'
      ctx.fillText(nameB, cx, cy - R * 0.50 - R * 0.06)

      // Center labels
      ctx.font = `bold ${R * 0.075}px serif`
      ctx.fillStyle = colA + '0.6)'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(nameA[0], cx - R * 0.1, cy)
      ctx.font = `${R * 0.04}px 'Cinzel',serif`
      ctx.fillStyle = 'rgba(201,168,76,.25)'
      ctx.fillText('\u2295', cx, cy)
      ctx.font = `bold ${R * 0.075}px serif`
      ctx.fillStyle = colB + '0.6)'
      ctx.fillText(nameB[0], cx + R * 0.1, cy)

      ctx.restore()
      rot += 0.004
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [mode, nameA, nameB, chartA, chartB, aspects])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
