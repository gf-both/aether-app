import { useEffect, useRef, useMemo } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { useGolemStore } from '../../store/useGolemStore'
import { getVedicChart, VEDIC_SIGNS } from '../../engines/vedicEngine'
import { resolvePob } from '../../utils/profileUtils'

const PLANET_ABBR = {
  sun: 'Su', moon: 'Mo', mercury: 'Me', venus: 'Ve', mars: 'Ma',
  jupiter: 'Ju', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke',
}

const PLANET_COLORS = {
  sun: '#c9a84c', moon: '#c9a84c',
  mercury: '#4caa7c', venus: '#4caa7c', jupiter: '#4caa7c',
  mars: '#cc4444', saturn: '#cc4444',
  rahu: '#9966cc', ketu: '#9966cc',
}

function colorToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16) || 0
  const g = parseInt(hex.slice(3, 5), 16) || 0
  const b = parseInt(hex.slice(5, 7), 16) || 0
  return [r, g, b]
}

function computeChart(profile) {
  if (!profile?.dob) return null
  try {
    const [y, m, d] = profile.dob.split('-').map(Number)
    const [h, min] = (profile.tob || '12:00').split(':').map(Number)
    const { lat, lon, tz } = resolvePob(profile)
    return getVedicChart({ day: d, month: m, year: y, hour: h, minute: min, lat, lon, timezone: tz })
  } catch { return null }
}

/* North Indian diamond kundali layout builder.
   Outer square + inner diamond (connecting midpoints of square sides) +
   lines from each square corner to center. Creates 12 houses:
   4 inner kite-shaped (houses 1,4,7,10) + 8 corner triangles (rest). */
function buildHouses(cx, cy, sz) {
  const half = sz / 2
  const NW = [cx - half, cy - half]
  const NE = [cx + half, cy - half]
  const SE = [cx + half, cy + half]
  const SW = [cx - half, cy + half]
  const T  = [cx, cy - half]
  const R  = [cx + half, cy]
  const B  = [cx, cy + half]
  const L  = [cx - half, cy]
  const C  = [cx, cy]
  // Midpoints of diamond edges (where corner-to-center lines cross the diamond)
  const TL = [(T[0] + L[0]) / 2, (T[1] + L[1]) / 2]
  const TR = [(T[0] + R[0]) / 2, (T[1] + R[1]) / 2]
  const BR = [(B[0] + R[0]) / 2, (B[1] + R[1]) / 2]
  const BL = [(B[0] + L[0]) / 2, (B[1] + L[1]) / 2]

  return [
    { poly: [T, TR, C, TL], center: [cx, cy - half * 0.35] },
    { poly: [T, NE, TR],     center: [cx + half * 0.50, cy - half * 0.70] },
    { poly: [TR, NE, R],     center: [cx + half * 0.70, cy - half * 0.50] },
    { poly: [R, TR, C, BR], center: [cx + half * 0.35, cy] },
    { poly: [R, SE, BR],     center: [cx + half * 0.70, cy + half * 0.50] },
    { poly: [BR, SE, B],     center: [cx + half * 0.50, cy + half * 0.70] },
    { poly: [B, BR, C, BL], center: [cx, cy + half * 0.35] },
    { poly: [B, SW, BL],     center: [cx - half * 0.50, cy + half * 0.70] },
    { poly: [BL, SW, L],     center: [cx - half * 0.70, cy + half * 0.50] },
    { poly: [L, BL, C, TL], center: [cx - half * 0.35, cy] },
    { poly: [L, NW, TL],     center: [cx - half * 0.70, cy - half * 0.50] },
    { poly: [TL, NW, T],     center: [cx - half * 0.50, cy - half * 0.70] },
  ]
}

export default function VedicChart() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const chartRef = useRef(null)

  const profile = useGolemStore(s => s.activeViewProfile || s.primaryProfile)
  const chart = useMemo(() => computeChart(profile),
    [profile?.dob, profile?.tob, profile?.birthLat, profile?.birthLon, profile?.birthTimezone, profile?.pob])

  useEffect(() => { chartRef.current = chart }, [chart])
  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let t = 0

    function draw() {
      t += 0.012
      const dpr = window.devicePixelRatio
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W === 0 || H === 0) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const cx = W / 2, cy = H / 2
      const sz = Math.min(W, H) * 0.86
      const half = sz / 2

      const ch = chartRef.current
      if (!ch) {
        ctx.font = "13px 'Cinzel',serif"
        ctx.fillStyle = 'rgba(201,168,76,0.5)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('AWAITING BIRTH DATA', cx, cy)
        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }

      const lagnaIdx = VEDIC_SIGNS.indexOf(ch.lagna.sign)
      const houses = buildHouses(cx, cy, sz)

      // Subtle radial background glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, half * 1.2)
      grad.addColorStop(0, 'rgba(201,168,76,0.05)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // Key geometry points
      const T  = [cx, cy - half]
      const R  = [cx + half, cy]
      const B  = [cx, cy + half]
      const L  = [cx - half, cy]
      const C  = [cx, cy]

      // Outer square
      ctx.strokeStyle = 'rgba(201,168,76,0.45)'
      ctx.lineWidth = 2
      ctx.strokeRect(cx - half, cy - half, sz, sz)

      // Inner diamond
      ctx.beginPath()
      ctx.moveTo(...T); ctx.lineTo(...R); ctx.lineTo(...B); ctx.lineTo(...L); ctx.closePath()
      ctx.strokeStyle = 'rgba(201,168,76,0.5)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Corner-to-center diagonals
      ctx.strokeStyle = 'rgba(201,168,76,0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx - half, cy - half); ctx.lineTo(...C)
      ctx.moveTo(cx + half, cy - half); ctx.lineTo(...C)
      ctx.moveTo(cx + half, cy + half); ctx.lineTo(...C)
      ctx.moveTo(cx - half, cy + half); ctx.lineTo(...C)
      ctx.stroke()

      // House 1 highlight fill
      const h1 = houses[0]
      ctx.beginPath()
      ctx.moveTo(...h1.poly[0])
      for (let j = 1; j < h1.poly.length; j++) ctx.lineTo(...h1.poly[j])
      ctx.closePath()
      ctx.fillStyle = 'rgba(201,168,76,0.08)'
      ctx.fill()

      // Sign labels & house numbers
      const labelSz = Math.max(8, sz * 0.034)
      const signSz = Math.max(7, sz * 0.026)
      houses.forEach((house, i) => {
        const signIdx = (lagnaIdx + i) % 12
        const [hx, hy] = house.center

        ctx.font = `bold ${labelSz}px 'Cinzel',serif`
        ctx.fillStyle = i === 0 ? 'rgba(201,168,76,0.9)' : 'rgba(201,168,76,0.45)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(i + 1), hx, hy - labelSz * 0.9)

        ctx.font = `${signSz}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,0.35)'
        ctx.fillText(VEDIC_SIGNS[signIdx].substring(0, 3), hx, hy - labelSz * 0.9 + signSz * 1.3)
      })

      // Assign planets to houses
      const planetHouses = {}
      for (let i = 0; i < 12; i++) planetHouses[i] = []
      Object.keys(ch.planets).forEach(key => {
        const p = ch.planets[key]
        const pSignIdx = p.signIndex != null ? p.signIndex : VEDIC_SIGNS.indexOf(p.sign)
        const houseIdx = ((pSignIdx - lagnaIdx) + 12) % 12
        planetHouses[houseIdx].push(key)
      })

      // Draw planets in their houses
      const planetSz = Math.max(9, sz * 0.036)
      for (let hi = 0; hi < 12; hi++) {
        const pKeys = planetHouses[hi]
        if (pKeys.length === 0) continue
        const house = houses[hi]
        const [hx, hy] = house.center
        const startY = hy + labelSz * 0.5

        pKeys.forEach((key, pi) => {
          const p = ch.planets[key]
          const col = PLANET_COLORS[key] || '#c9a84c'
          const [r2, g2, b2] = colorToRGB(col)
          const abbr = PLANET_ABBR[key] || key.substring(0, 2)
          const deg = p.degree != null ? Math.floor(p.degree) + '\u00B0' : ''

          // Grid layout for multiple planets per house
          const cols = Math.min(pKeys.length, 3)
          const row = Math.floor(pi / cols)
          const colIdx = pi % cols
          const xOff = (colIdx - (Math.min(pKeys.length, cols) - 1) / 2) * planetSz * 2.2
          const yOff = row * planetSz * 1.4
          const px = hx + xOff
          const py = startY + yOff

          // Animated glow
          const glowAlpha = 0.15 + 0.1 * Math.sin(t * 2 + pi * 1.3 + hi * 0.7)
          const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, planetSz * 0.85)
          glowGrad.addColorStop(0, `rgba(${r2},${g2},${b2},${glowAlpha})`)
          glowGrad.addColorStop(1, `rgba(${r2},${g2},${b2},0)`)
          ctx.beginPath()
          ctx.arc(px, py, planetSz * 0.85, 0, Math.PI * 2)
          ctx.fillStyle = glowGrad
          ctx.fill()

          // Planet abbreviation
          ctx.font = `bold ${planetSz}px 'Cinzel',serif`
          ctx.fillStyle = col
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(abbr, px, py)

          // Degree below
          if (deg) {
            ctx.font = `${Math.max(6, planetSz * 0.55)}px sans-serif`
            ctx.fillStyle = `rgba(${r2},${g2},${b2},0.5)`
            ctx.fillText(deg, px, py + planetSz * 0.72)
          }
        })
      }

      // Lagna label above chart
      ctx.font = `bold ${Math.max(10, sz * 0.032)}px 'Cinzel',serif`
      ctx.fillStyle = '#c9a84c'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        'ASC \u2022 ' + ch.lagna.sign + ' ' + Math.floor(ch.lagna.degree) + '\u00B0',
        cx, cy - half - Math.max(10, sz * 0.028)
      )

      // Chart title below
      ctx.font = `${Math.max(8, sz * 0.022)}px 'Cinzel',serif`
      ctx.fillStyle = 'rgba(201,168,76,0.4)'
      ctx.fillText('RASI CHART \u00B7 NORTH INDIAN', cx, cy + half + Math.max(12, sz * 0.03))

      // Ayanamsa line
      ctx.font = `${Math.max(7, sz * 0.018)}px sans-serif`
      ctx.fillStyle = 'rgba(201,168,76,0.3)'
      ctx.fillText('Lahiri Ayanamsa: ' + ch.ayanamsa + '\u00B0', cx, cy + half + Math.max(24, sz * 0.055))

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
