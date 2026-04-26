import { useEffect, useRef, useMemo } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { useGolemStore } from '../../store/useGolemStore'
import { getNatalChart } from '../../engines/natalEngine'

const SIGN_GLYPHS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']
const SIGN_NAMES  = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
const PLANET_GLYPHS = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', chiron: '⚷',
}

const ELEMENT_COLORS = {
  fire:  { fill: 'rgba(204,68,68,',  stroke: '#cc4444' },
  earth: { fill: 'rgba(201,168,76,', stroke: '#c9a84c' },
  air:   { fill: 'rgba(68,136,204,', stroke: '#4488cc' },
  water: { fill: 'rgba(68,170,170,', stroke: '#44aaaa' },
}
const ELEMS = ['fire','earth','air','water','fire','earth','air','water','fire','earth','air','water']

// Planet importance weights (for bar height)
const PLANET_WEIGHT = {
  sun: 1.0, moon: 0.9, mercury: 0.65, venus: 0.7, mars: 0.7,
  jupiter: 0.8, saturn: 0.75, uranus: 0.55, neptune: 0.5, pluto: 0.45,
  northNode: 0.35, chiron: 0.4,
}

const ASPECT_COLORS = {
  conjunction: '#f0c040', opposition: '#cc4444', trine: '#4488cc',
  square: '#cc8844', sextile: '#44aa66',
}

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
  if (!profile?.dob) return null
  const dob = parseDOB(profile.dob)
  const tob = parseTOB(profile.tob)
  if (!dob) return null
  let lat = profile.birthLat || 0, lon = profile.birthLon || 0, tz = profile.birthTimezone ?? 0
  if (!lat && !lon && profile.pob) {
    const pob = (profile.pob || '').toLowerCase()
    if (pob.includes('buenos aires')) { lat=-34.6037; lon=-58.3816; tz=-3 }
    else if (pob.includes('montevideo')) { lat=-34.9011; lon=-56.1645; tz=-3 }
  }
  try { return getNatalChart({ day: dob.day, month: dob.month, year: dob.year, hour: tob.hour, minute: tob.minute, lat, lon, timezone: tz }) }
  catch { return null }
}

export default function NatalRadialBars() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const chartRef = useRef(null)
  const profile = useGolemStore(s => s.activeViewProfile || s.primaryProfile)
  const chart = useMemo(() => { try { return computeChart(profile) } catch { return null } },
    [profile?.dob, profile?.tob, profile?.birthLat, profile?.birthLon, profile?.birthTimezone, profile?.pob])

  useEffect(() => { chartRef.current = chart }, [chart])
  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let pulse = 0
    const particles = []
    for (let i = 0; i < 60; i++) {
      particles.push({ angle: Math.random() * Math.PI * 2, r: 0.35 + Math.random() * 0.6, speed: 0.0003 + Math.random() * 0.0006, phase: Math.random() * Math.PI * 2, brightness: 0.3 + Math.random() * 0.5 })
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr
      const H = canvas.height / dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      pulse += 0.012

      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * 0.42
      const innerR = R * 0.32
      const ch = chartRef.current

      // Background: dark with subtle radial gradient
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.3)
      bg.addColorStop(0, 'rgba(20,20,36,0.95)')
      bg.addColorStop(1, 'rgba(10,10,20,0.98)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Zodiac circle and sign segments
      for (let i = 0; i < 12; i++) {
        const a1 = (i * 30 - 90) * Math.PI / 180
        const a2 = ((i + 1) * 30 - 90) * Math.PI / 180
        const elem = ELEMS[i]
        const ec = ELEMENT_COLORS[elem]

        // Segment background
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, R * 1.08, a1, a2)
        ctx.closePath()
        ctx.fillStyle = ec.fill + '0.03)'
        ctx.fill()

        // Division lines
        const lx = cx + Math.cos(a1) * R * 1.08
        const ly = cy + Math.sin(a1) * R * 1.08
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(a1) * innerR, cy + Math.sin(a1) * innerR)
        ctx.lineTo(lx, ly)
        ctx.strokeStyle = 'rgba(201,168,76,0.06)'
        ctx.lineWidth = 0.5
        ctx.stroke()

        // Sign glyph
        const midA = (a1 + a2) / 2
        const glyphR = R * 1.02
        ctx.font = '13px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = ec.fill + '0.35)'
        ctx.fillText(SIGN_GLYPHS[i], cx + Math.cos(midA) * glyphR, cy + Math.sin(midA) * glyphR)
      }

      // Base rings
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.08, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201,168,76,0.1)'
      ctx.lineWidth = 0.3
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201,168,76,0.08)'
      ctx.lineWidth = 0.3
      ctx.stroke()

      if (!ch) {
        ctx.font = '12px Cinzel, serif'
        ctx.fillStyle = 'rgba(201,168,76,0.4)'
        ctx.textAlign = 'center'
        ctx.fillText('Add birth data to generate chart', cx, cy)
        animRef.current = requestAnimationFrame(draw)
        return
      }

      // Planet bars
      const planets = ch.planets || {}
      const planetKeys = Object.keys(planets).filter(k => PLANET_GLYPHS[k])
      const aspects = (ch.aspects || []).slice(0, 12)

      // Aspect arcs (draw first, behind bars)
      aspects.forEach(asp => {
        const p1 = planets[asp.planet1]
        const p2 = planets[asp.planet2]
        if (!p1 || !p2) return
        const a1 = (p1.longitude - 90) * Math.PI / 180
        const a2 = (p2.longitude - 90) * Math.PI / 180
        const r1 = innerR + (R - innerR) * (PLANET_WEIGHT[asp.planet1] || 0.5) * 0.5
        const r2 = innerR + (R - innerR) * (PLANET_WEIGHT[asp.planet2] || 0.5) * 0.5
        const x1 = cx + Math.cos(a1) * r1
        const y1 = cy + Math.sin(a1) * r1
        const x2 = cx + Math.cos(a2) * r2
        const y2 = cy + Math.sin(a2) * r2
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.quadraticCurveTo(cx + Math.cos((a1 + a2) / 2) * innerR * 0.5, cy + Math.sin((a1 + a2) / 2) * innerR * 0.5, x2, y2)
        ctx.strokeStyle = (ASPECT_COLORS[asp.type] || '#888') + '44'
        ctx.lineWidth = 0.8
        ctx.stroke()
      })

      // Draw bars for each planet
      planetKeys.forEach(key => {
        const p = planets[key]
        if (!p) return
        const lon = p.longitude || 0
        const angle = (lon - 90) * Math.PI / 180
        const weight = PLANET_WEIGHT[key] || 0.5
        const barH = (R - innerR) * weight * (0.85 + Math.sin(pulse + lon * 0.1) * 0.08)
        const barW = 8 + weight * 4
        const signIdx = Math.floor(lon / 30) % 12
        const elem = ELEMS[signIdx]
        const ec = ELEMENT_COLORS[elem]

        // Bar (radial)
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(angle)

        // Bar glow
        const glow = ctx.createLinearGradient(0, -innerR - barH, 0, -innerR)
        glow.addColorStop(0, ec.fill + '0.7)')
        glow.addColorStop(1, ec.fill + '0.15)')

        // Rounded rect bar
        const hw = barW / 2
        const barTop = -innerR - barH
        const barBot = -innerR
        ctx.beginPath()
        ctx.moveTo(-hw, barBot)
        ctx.lineTo(-hw, barTop + 3)
        ctx.quadraticCurveTo(-hw, barTop, -hw + 3, barTop)
        ctx.lineTo(hw - 3, barTop)
        ctx.quadraticCurveTo(hw, barTop, hw, barTop + 3)
        ctx.lineTo(hw, barBot)
        ctx.closePath()
        ctx.fillStyle = glow
        ctx.fill()

        // Bar border
        ctx.strokeStyle = ec.fill + '0.3)'
        ctx.lineWidth = 0.5
        ctx.stroke()

        ctx.restore()

        // Planet glyph at bar top
        const glyphDist = innerR + barH + 14
        const gx = cx + Math.cos(angle) * glyphDist
        const gy = cy + Math.sin(angle) * glyphDist
        ctx.font = '13px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)'
        ctx.fillText(PLANET_GLYPHS[key], gx + 0.5, gy + 0.5)
        ctx.fillStyle = ec.stroke
        ctx.fillText(PLANET_GLYPHS[key], gx, gy)

        // Degree label
        const degDist = innerR + barH + 26
        const dx = cx + Math.cos(angle) * degDist
        const dy = cy + Math.sin(angle) * degDist
        const degInSign = lon % 30
        const deg = Math.floor(degInSign)
        const min = Math.round((degInSign - deg) * 60)
        ctx.font = '7px Inconsolata, monospace'
        ctx.fillStyle = ec.fill + '0.5)'
        ctx.fillText(`${deg}°${SIGN_GLYPHS[signIdx]}`, dx, dy)
      })

      // Center info: element balance
      const elemCounts = { fire: 0, earth: 0, air: 0, water: 0 }
      planetKeys.forEach(key => {
        const p = planets[key]
        if (!p) return
        const signIdx = Math.floor((p.longitude || 0) / 30) % 12
        elemCounts[ELEMS[signIdx]]++
      })

      // Center circle
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR * 0.85)
      cg.addColorStop(0, 'rgba(201,168,76,0.04)')
      cg.addColorStop(1, 'rgba(201,168,76,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, innerR * 0.85, 0, Math.PI * 2)
      ctx.fillStyle = cg
      ctx.fill()

      ctx.font = '9px Cinzel, serif'
      ctx.fillStyle = 'rgba(201,168,76,0.45)'
      ctx.textAlign = 'center'
      ctx.fillText('ELEMENT', cx, cy - 18)
      ctx.fillText('BALANCE', cx, cy - 6)

      // Mini element bars in center
      const elemOrder = ['fire', 'earth', 'air', 'water']
      const elemLabels = ['Fire', 'Earth', 'Air', 'Water']
      elemOrder.forEach((el, i) => {
        const y = cy + 8 + i * 12
        const count = elemCounts[el] || 0
        const barLen = count * 6
        const ec = ELEMENT_COLORS[el]
        ctx.fillStyle = ec.fill + '0.6)'
        ctx.fillRect(cx - 20, y - 3, barLen, 5)
        ctx.font = '7px Inconsolata, monospace'
        ctx.fillStyle = 'rgba(255,255,255,0.35)'
        ctx.textAlign = 'left'
        ctx.fillText(`${count} ${elemLabels[i]}`, cx - 20 + barLen + 4, y + 2)
      })

      // Ambient particles
      particles.forEach(pt => {
        pt.angle += pt.speed
        const pr = innerR + (R * 1.1 - innerR) * pt.r + Math.sin(pulse * 2 + pt.phase) * 4
        const px = cx + Math.cos(pt.angle) * pr
        const py = cy + Math.sin(pt.angle) * pr
        const alpha = pt.brightness * (0.15 + Math.sin(pulse * 3 + pt.phase) * 0.1)
        ctx.beginPath()
        ctx.arc(px, py, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,168,76,${alpha})`
        ctx.fill()
      })

      // Title
      ctx.font = '9px Cinzel, serif'
      ctx.fillStyle = 'rgba(201,168,76,0.3)'
      ctx.textAlign = 'center'
      ctx.letterSpacing = '2px'
      ctx.fillText('RADIAL DATA ARCHITECTURE', cx, H - 10)

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}
