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
const PLANET_NAMES = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
  northNode: 'N.Node', chiron: 'Chiron',
}
const PLANET_COLORS = {
  sun: '#c9a84c', moon: '#aab8cc', mercury: '#e8c840', venus: '#cc88aa',
  mars: '#cc5544', jupiter: '#8866cc', saturn: '#888888', uranus: '#44aacc',
  neptune: '#4466cc', pluto: '#666688', northNode: '#886633', chiron: '#885544',
}

const ELEMENT_COLORS = {
  fire: '#cc4444', earth: '#c9a84c', air: '#4488cc', water: '#44aaaa',
}
const ELEMS = ['fire','earth','air','water','fire','earth','air','water','fire','earth','air','water']

// Diurnal planets (traditionally day sect)
const DIURNAL_PLANETS = new Set(['sun', 'jupiter', 'saturn', 'mercury', 'northNode'])
// Nocturnal planets (night sect)
const NOCTURNAL_PLANETS = new Set(['moon', 'venus', 'mars', 'uranus', 'neptune', 'pluto', 'chiron'])

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

export default function NatalHemisphere() {
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

    // Particles for ambient effect
    const particles = []
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random(), y: Math.random(),
        speed: 0.0002 + Math.random() * 0.0004,
        phase: Math.random() * Math.PI * 2,
        brightness: 0.15 + Math.random() * 0.3,
        side: Math.random() > 0.5 ? 'day' : 'night',
      })
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr
      const H = canvas.height / dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      pulse += 0.012

      const ch = chartRef.current
      const midX = W / 2
      const padTop = 50
      const padBot = 30
      const spineH = H - padTop - padBot
      const signH = spineH / 12

      // Background
      const bg = ctx.createLinearGradient(0, 0, W, 0)
      bg.addColorStop(0, 'rgba(25,22,14,0.97)')
      bg.addColorStop(0.48, 'rgba(20,18,12,0.98)')
      bg.addColorStop(0.52, 'rgba(12,14,22,0.98)')
      bg.addColorStop(1, 'rgba(10,12,20,0.97)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Day/Night gradient overlays
      const dayGrad = ctx.createLinearGradient(0, 0, midX, 0)
      dayGrad.addColorStop(0, 'rgba(201,168,76,0.04)')
      dayGrad.addColorStop(1, 'rgba(201,168,76,0)')
      ctx.fillStyle = dayGrad
      ctx.fillRect(0, padTop, midX, spineH)

      const nightGrad = ctx.createLinearGradient(midX, 0, W, 0)
      nightGrad.addColorStop(0, 'rgba(68,102,170,0)')
      nightGrad.addColorStop(1, 'rgba(68,102,170,0.04)')
      ctx.fillStyle = nightGrad
      ctx.fillRect(midX, padTop, midX, spineH)

      // Labels
      ctx.font = '9px Cinzel, serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(201,168,76,0.3)'
      ctx.fillText('DIURNAL', midX * 0.5, padTop - 12)
      ctx.fillStyle = 'rgba(100,136,204,0.3)'
      ctx.fillText('NOCTURNAL', midX + midX * 0.5, padTop - 12)

      // Central spine
      ctx.beginPath()
      ctx.moveTo(midX, padTop)
      ctx.lineTo(midX, padTop + spineH)
      ctx.strokeStyle = 'rgba(201,168,76,0.12)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Zodiac signs along spine
      for (let i = 0; i < 12; i++) {
        const y = padTop + i * signH + signH / 2
        const elem = ELEMS[i]
        const ec = ELEMENT_COLORS[elem]

        // Horizontal tick
        ctx.beginPath()
        ctx.moveTo(midX - 7, padTop + i * signH)
        ctx.lineTo(midX + 7, padTop + i * signH)
        ctx.strokeStyle = 'rgba(201,168,76,0.06)'
        ctx.lineWidth = 0.3
        ctx.stroke()

        // Sign glyph
        ctx.font = '13px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = ec + '88'
        ctx.fillText(SIGN_GLYPHS[i], midX, y)
      }

      if (!ch) {
        ctx.font = '12px Cinzel, serif'
        ctx.fillStyle = 'rgba(201,168,76,0.4)'
        ctx.textAlign = 'center'
        ctx.fillText('Add birth data to generate chart', midX, H / 2)
        animRef.current = requestAnimationFrame(draw)
        return
      }

      const planets = ch.planets || {}
      const planetKeys = Object.keys(planets).filter(k => PLANET_GLYPHS[k])
      const aspects = (ch.aspects || []).slice(0, 10)

      // Compute planet positions
      const planetPositions = {}
      planetKeys.forEach(key => {
        const p = planets[key]
        if (!p) return
        const lon = p.longitude || 0
        const signIdx = Math.floor(lon / 30) % 12
        const degInSign = lon % 30
        const y = padTop + signIdx * signH + (degInSign / 30) * signH
        const isDiurnal = DIURNAL_PLANETS.has(key)
        const pc = PLANET_COLORS[key]
        const elem = ELEMS[signIdx]

        // Compute bar length based on planet importance
        const importance = key === 'sun' || key === 'moon' ? 0.8 :
                          key === 'jupiter' || key === 'saturn' || key === 'mars' || key === 'venus' ? 0.6 :
                          key === 'mercury' ? 0.55 : 0.4
        const maxBarLen = midX * 0.65
        const barLen = maxBarLen * importance * (0.9 + Math.sin(pulse + lon * 0.05) * 0.06)

        let x, barStartX, barEndX, textX, textAlign
        if (isDiurnal) {
          // Extend left from spine
          barStartX = midX - 10
          barEndX = midX - 10 - barLen
          x = barEndX
          textX = barEndX - 6
          textAlign = 'right'
        } else {
          // Extend right from spine
          barStartX = midX + 10
          barEndX = midX + 10 + barLen
          x = barEndX
          textX = barEndX + 6
          textAlign = 'left'
        }

        planetPositions[key] = { x: (barStartX + barEndX) / 2, y, isDiurnal }

        // Bar line
        ctx.beginPath()
        ctx.moveTo(barStartX, y)
        ctx.lineTo(barEndX, y)
        const grad = ctx.createLinearGradient(barStartX, 0, barEndX, 0)
        if (isDiurnal) {
          grad.addColorStop(0, pc + '00')
          grad.addColorStop(1, pc + '88')
        } else {
          grad.addColorStop(0, pc + '00')
          grad.addColorStop(1, pc + '88')
        }
        ctx.strokeStyle = grad
        ctx.lineWidth = 2
        ctx.stroke()

        // Planet dot with glow
        const dotR = key === 'sun' || key === 'moon' ? 8 : 6
        const glow = ctx.createRadialGradient(x, y, 0, x, y, dotR * 2)
        glow.addColorStop(0, pc + '33')
        glow.addColorStop(1, pc + '00')
        ctx.beginPath()
        ctx.arc(x, y, dotR * 2, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, y, dotR * 0.6, 0, Math.PI * 2)
        ctx.fillStyle = pc + 'cc'
        ctx.fill()

        // Planet glyph
        ctx.font = key === 'sun' || key === 'moon' ? '11px serif' : '9px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(PLANET_GLYPHS[key], x, y + 1)

        // Planet name and degree label
        ctx.font = '8px Cinzel, serif'
        ctx.textAlign = textAlign
        ctx.fillStyle = pc + 'aa'
        const signN = SIGN_NAMES[signIdx]
        const deg = Math.floor(degInSign)
        ctx.fillText(`${PLANET_NAMES[key]}`, textX, y - 5)
        ctx.font = '7px Inconsolata, monospace'
        ctx.fillStyle = pc + '77'
        ctx.fillText(`${deg}°${SIGN_GLYPHS[signIdx]}`, textX, y + 6)
      })

      // Aspect connections (curved lines crossing spine)
      aspects.forEach(asp => {
        const p1 = planetPositions[asp.planet1]
        const p2 = planetPositions[asp.planet2]
        if (!p1 || !p2) return
        const cpx = midX + (p1.isDiurnal === p2.isDiurnal ? (p1.isDiurnal ? -30 : 30) : 0)
        const cpy = (p1.y + p2.y) / 2
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.quadraticCurveTo(cpx, cpy, p2.x, p2.y)
        ctx.strokeStyle = (ASPECT_COLORS[asp.type] || '#888888') + '22'
        ctx.lineWidth = 0.8
        ctx.stroke()
      })

      // ASC marker on spine
      if (ch.houses && ch.houses[0]) {
        const ascLon = ch.houses[0].lon || 0
        const ascSignIdx = Math.floor(ascLon / 30) % 12
        const ascDeg = ascLon % 30
        const ascY = padTop + ascSignIdx * signH + (ascDeg / 30) * signH
        // Diamond marker
        ctx.beginPath()
        ctx.moveTo(midX - 8, ascY)
        ctx.lineTo(midX, ascY - 5)
        ctx.lineTo(midX + 8, ascY)
        ctx.lineTo(midX, ascY + 5)
        ctx.closePath()
        ctx.fillStyle = 'rgba(201,168,76,0.35)'
        ctx.fill()
        ctx.font = '8px Cinzel, serif'
        ctx.textAlign = 'right'
        ctx.fillStyle = 'rgba(201,168,76,0.5)'
        ctx.fillText('ASC', midX - 12, ascY + 3)
      }

      // MC marker
      if (ch.houses && ch.houses[9]) {
        const mcLon = ch.houses[9].lon || 0
        const mcSignIdx = Math.floor(mcLon / 30) % 12
        const mcDeg = mcLon % 30
        const mcY = padTop + mcSignIdx * signH + (mcDeg / 30) * signH
        ctx.beginPath()
        ctx.moveTo(midX - 8, mcY)
        ctx.lineTo(midX, mcY - 5)
        ctx.lineTo(midX + 8, mcY)
        ctx.lineTo(midX, mcY + 5)
        ctx.closePath()
        ctx.fillStyle = 'rgba(68,136,204,0.35)'
        ctx.fill()
        ctx.font = '8px Cinzel, serif'
        ctx.textAlign = 'left'
        ctx.fillStyle = 'rgba(68,136,204,0.5)'
        ctx.fillText('MC', midX + 12, mcY + 3)
      }

      // Ambient particles
      particles.forEach(pt => {
        pt.y += pt.speed
        if (pt.y > 1) pt.y = 0
        const px = pt.side === 'day' ? pt.x * midX * 0.8 + midX * 0.1 : midX + pt.x * midX * 0.8 + midX * 0.1
        const py = padTop + pt.y * spineH
        const alpha = pt.brightness * (0.2 + Math.sin(pulse * 2 + pt.phase) * 0.1)
        ctx.beginPath()
        ctx.arc(px, py, 1, 0, Math.PI * 2)
        ctx.fillStyle = pt.side === 'day' ? `rgba(201,168,76,${alpha})` : `rgba(100,136,204,${alpha})`
        ctx.fill()
      })

      // Title
      ctx.font = '9px Cinzel, serif'
      ctx.fillStyle = 'rgba(201,168,76,0.25)'
      ctx.textAlign = 'center'
      ctx.fillText('SPLIT HEMISPHERE', midX, H - 10)

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}
