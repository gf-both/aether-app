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
  mars: '#cc5544', jupiter: '#8866cc', saturn: '#888899', uranus: '#44aacc',
  neptune: '#4466cc', pluto: '#776688', northNode: '#886633', chiron: '#885544',
}

const ELEMENT_COLORS = {
  fire:  { r: 204, g: 68,  b: 68  },
  earth: { r: 139, g: 120, b: 50  },
  air:   { r: 68,  g: 136, b: 204 },
  water: { r: 64,  g: 160, b: 160 },
}
const ELEMENT_HEX = { fire: '#cc4444', earth: '#8b7832', air: '#4488cc', water: '#40a0a0' }
const ELEMENT_NAMES = { fire: 'Fire', earth: 'Earth', air: 'Air', water: 'Water' }
const ELEMS = ['fire','earth','air','water','fire','earth','air','water','fire','earth','air','water']

function parseDOB(dob) { if (!dob) return null; const [y,m,d] = dob.split('-').map(Number); return {year:y,month:m,day:d} }
function parseTOB(tob) { if (!tob) return {hour:12,minute:0}; const [h,m] = tob.split(':').map(Number); return {hour:h||0,minute:m||0} }
function computeChart(profile) {
  if (!profile?.dob) return null
  const dob = parseDOB(profile.dob), tob = parseTOB(profile.tob)
  if (!dob) return null
  let lat = profile.birthLat||0, lon = profile.birthLon||0, tz = profile.birthTimezone??0
  if (!lat && !lon && profile.pob) {
    const p = (profile.pob||'').toLowerCase()
    if (p.includes('buenos aires')) { lat=-34.6037; lon=-58.3816; tz=-3 }
    else if (p.includes('montevideo')) { lat=-34.9011; lon=-56.1645; tz=-3 }
    else if (p.includes('new york')) { lat=40.7128; lon=-74.006; tz=-5 }
    else if (p.includes('london')) { lat=51.5074; lon=-0.1278; tz=0 }
  }
  try { return getNatalChart({ day:dob.day, month:dob.month, year:dob.year, hour:tob.hour, minute:tob.minute, lat, lon, timezone:tz }) }
  catch { return null }
}

/** Determine house for a planet longitude */
function getHouseFor(pLon, houses) {
  for (let i = 0; i < 12; i++) {
    const start = houses[i].lon
    const end = houses[(i + 1) % 12].lon
    if (start <= end) { if (pLon >= start && pLon < end) return i + 1 }
    else { if (pLon >= start || pLon < end) return i + 1 }
  }
  return 1
}

export default function NatalRadialBars() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const chartRef = useRef(null)
  const hovRef = useRef(null) // hovered planet key
  const mouseRef = useRef({ x: 0, y: 0 })
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

    // Ambient particles
    const particles = []
    for (let i = 0; i < 50; i++) {
      particles.push({ angle: Math.random() * Math.PI * 2, r: 0.3 + Math.random() * 0.65, speed: 0.0003 + Math.random() * 0.0005, phase: Math.random() * Math.PI * 2, brightness: 0.2 + Math.random() * 0.4 })
    }

    const handleMouseMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    canvas.addEventListener('mousemove', handleMouseMove)

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr
      const H = canvas.height / dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      pulse += 0.01

      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * 0.40
      const innerR = R * 0.28
      const outerR = R * 1.12
      const ch = chartRef.current
      const mx = mouseRef.current.x, my = mouseRef.current.y

      // Dark background
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4)
      bg.addColorStop(0, 'rgba(18,18,32,0.96)')
      bg.addColorStop(1, 'rgba(8,8,16,0.98)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // 12 zodiac segments
      for (let i = 0; i < 12; i++) {
        const a1 = (i * 30 - 90) * Math.PI / 180
        const a2 = ((i + 1) * 30 - 90) * Math.PI / 180
        const elem = ELEMS[i]
        const ec = ELEMENT_COLORS[elem]

        // Faint segment fill
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, outerR, a1, a2)
        ctx.closePath()
        ctx.fillStyle = `rgba(${ec.r},${ec.g},${ec.b},0.03)`
        ctx.fill()

        // Segment divider
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(a1) * innerR, cy + Math.sin(a1) * innerR)
        ctx.lineTo(cx + Math.cos(a1) * outerR, cy + Math.sin(a1) * outerR)
        ctx.strokeStyle = 'rgba(201,168,76,0.06)'
        ctx.lineWidth = 0.5
        ctx.stroke()

        // Sign glyph on outer ring
        const midA = (a1 + a2) / 2
        ctx.font = '12px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = `rgba(${ec.r},${ec.g},${ec.b},0.4)`
        ctx.fillText(SIGN_GLYPHS[i], cx + Math.cos(midA) * (outerR + 14), cy + Math.sin(midA) * (outerR + 14))
      }

      // Base circles
      ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201,168,76,0.08)'; ctx.lineWidth = 0.3; ctx.stroke()
      ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201,168,76,0.06)'; ctx.lineWidth = 0.3; ctx.stroke()
      // Mid ring (15° reference)
      ctx.beginPath(); ctx.arc(cx, cy, innerR + (outerR - innerR) * 0.5, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201,168,76,0.03)'; ctx.lineWidth = 0.3; ctx.stroke()

      if (!ch) {
        ctx.font = '11px Cinzel, serif'
        ctx.fillStyle = 'rgba(201,168,76,0.35)'
        ctx.textAlign = 'center'
        ctx.fillText('Add birth data to see your chart', cx, cy)
        animRef.current = requestAnimationFrame(draw)
        return
      }

      const planets = ch.planets || {}
      const houses = ch.houses || []
      const aspects = (ch.aspects || []).slice(0, 15)
      const planetKeys = Object.keys(planets).filter(k => PLANET_GLYPHS[k])

      // Precompute planet screen positions for aspects + hover
      const planetScreen = {}
      let newHov = null

      planetKeys.forEach(key => {
        const p = planets[key]
        if (!p) return
        const lon = p.lon ?? p.longitude ?? 0
        const signIdx = p.signIndex ?? Math.floor(lon / 30) % 12
        const degInSign = p.degree ?? (lon % 30)
        const house = houses.length ? getHouseFor(lon, houses) : '?'
        const elem = ELEMS[signIdx]
        const ec = ELEMENT_COLORS[elem]

        // Angle: sign segment start + offset within sign
        const angle = ((signIdx * 30 + degInSign) - 90) * Math.PI / 180

        // Distance from center: further from center = further into the sign (0°=inner, 30°=outer)
        const t = degInSign / 30 // 0..1
        const dist = innerR + (outerR - innerR) * (0.1 + t * 0.8)

        const px = cx + Math.cos(angle) * dist
        const py = cy + Math.sin(angle) * dist

        planetScreen[key] = { x: px, y: py, angle, dist, signIdx, degInSign, house, elem, lon }

        // Hover detection
        const dx = mx - px, dy = my - py
        if (dx * dx + dy * dy < 225) newHov = key
      })
      hovRef.current = newHov

      // Aspect arcs (behind planets)
      aspects.forEach(asp => {
        const s1 = planetScreen[asp.planet1]
        const s2 = planetScreen[asp.planet2]
        if (!s1 || !s2) return
        const cpDist = innerR * 0.4
        const midAngle = (s1.angle + s2.angle) / 2
        const cpx = cx + Math.cos(midAngle) * cpDist
        const cpy = cy + Math.sin(midAngle) * cpDist
        const col = asp.type === 'trine' ? '#4488cc' : asp.type === 'opposition' ? '#cc4444' : asp.type === 'square' ? '#cc8844' : asp.type === 'sextile' ? '#44aa66' : '#c9a84c'
        ctx.beginPath()
        ctx.moveTo(s1.x, s1.y)
        ctx.quadraticCurveTo(cpx, cpy, s2.x, s2.y)
        ctx.strokeStyle = col + '20'
        ctx.lineWidth = 0.8
        ctx.stroke()
      })

      // Draw each planet
      planetKeys.forEach(key => {
        const s = planetScreen[key]
        if (!s) return
        const p = planets[key]
        const pc = PLANET_COLORS[key]
        const ec = ELEMENT_COLORS[s.elem]
        const isHov = hovRef.current === key
        const isLum = key === 'sun' || key === 'moon'

        // Radial bar from center to planet position
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(s.angle) * innerR, cy + Math.sin(s.angle) * innerR)
        ctx.lineTo(s.x, s.y)
        const barGrad = ctx.createLinearGradient(
          cx + Math.cos(s.angle) * innerR, cy + Math.sin(s.angle) * innerR,
          s.x, s.y
        )
        barGrad.addColorStop(0, `rgba(${ec.r},${ec.g},${ec.b},0.05)`)
        barGrad.addColorStop(1, `rgba(${ec.r},${ec.g},${ec.b},${isHov ? 0.6 : 0.35})`)
        ctx.strokeStyle = barGrad
        ctx.lineWidth = isHov ? 5 : isLum ? 4 : 3
        ctx.lineCap = 'round'
        ctx.stroke()

        // Planet dot glow
        const glowR = isHov ? 18 : isLum ? 12 : 9
        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR)
        glow.addColorStop(0, pc + '44')
        glow.addColorStop(1, pc + '00')
        ctx.beginPath()
        ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // Planet dot
        const dotR = isHov ? 7 : isLum ? 5 : 4
        ctx.beginPath()
        ctx.arc(s.x, s.y, dotR, 0, Math.PI * 2)
        ctx.fillStyle = pc
        ctx.fill()

        // Planet glyph
        ctx.font = `${isHov ? 13 : isLum ? 12 : 10}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillText(PLANET_GLYPHS[key], s.x + 0.5, s.y + 0.5)
        ctx.fillStyle = '#fff'
        ctx.fillText(PLANET_GLYPHS[key], s.x, s.y)

        // House label next to planet
        const labelAngle = s.angle + (isHov ? 0.15 : 0.1)
        const labelDist = s.dist + (isHov ? 16 : 12)
        const lx = cx + Math.cos(labelAngle) * labelDist
        const ly = cy + Math.sin(labelAngle) * labelDist
        ctx.font = '8px Inconsolata, monospace'
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(201,168,76,0.5)'
        ctx.fillText(`H${s.house}`, lx, ly)

        // Retrograde indicator
        if (p.retrograde) {
          const rx = cx + Math.cos(s.angle - 0.1) * (s.dist + 12)
          const ry = cy + Math.sin(s.angle - 0.1) * (s.dist + 12)
          ctx.font = '7px serif'
          ctx.fillStyle = 'rgba(204,68,68,0.5)'
          ctx.fillText('℞', rx, ry)
        }
      })

      // Tooltip for hovered planet
      if (hovRef.current) {
        const key = hovRef.current
        const s = planetScreen[key]
        const p = planets[key]
        if (s && p) {
          const deg = Math.floor(s.degInSign)
          const min = Math.round((s.degInSign - deg) * 60)
          const signName = SIGN_NAMES[s.signIdx]
          const elemName = ELEMENT_NAMES[s.elem]
          const lines = [
            `${PLANET_NAMES[key]} ${PLANET_GLYPHS[key]}`,
            `${deg}°${String(min).padStart(2,'0')}' ${signName}`,
            `House ${s.house}  ·  ${elemName}`,
            p.retrograde ? 'Retrograde ℞' : '',
          ].filter(Boolean)

          const tw = 150, th = lines.length * 16 + 14
          let tx = s.x + 18, ty = s.y - th / 2
          if (tx + tw > W - 10) tx = s.x - tw - 18
          if (ty < 10) ty = 10
          if (ty + th > H - 10) ty = H - th - 10

          ctx.fillStyle = 'rgba(12,12,22,0.92)'
          ctx.strokeStyle = 'rgba(201,168,76,0.25)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.roundRect(tx, ty, tw, th, 6)
          ctx.fill()
          ctx.stroke()

          lines.forEach((line, li) => {
            ctx.font = li === 0 ? '11px Cinzel, serif' : '9px Inconsolata, monospace'
            ctx.fillStyle = li === 0 ? '#c9a84c' : 'rgba(255,255,255,0.6)'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'
            ctx.fillText(line, tx + 10, ty + 8 + li * 16)
          })
        }
      }

      // Center: element balance
      const elemCounts = { fire: 0, earth: 0, air: 0, water: 0 }
      planetKeys.forEach(key => {
        const s = planetScreen[key]
        if (s) elemCounts[s.elem]++
      })

      const cGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR * 0.9)
      cGlow.addColorStop(0, 'rgba(201,168,76,0.04)')
      cGlow.addColorStop(1, 'rgba(201,168,76,0)')
      ctx.beginPath(); ctx.arc(cx, cy, innerR * 0.9, 0, Math.PI * 2)
      ctx.fillStyle = cGlow; ctx.fill()

      ctx.font = '8px Cinzel, serif'
      ctx.fillStyle = 'rgba(201,168,76,0.4)'
      ctx.textAlign = 'center'
      ctx.fillText('ELEMENT BALANCE', cx, cy - 20)
      ;['fire','earth','air','water'].forEach((el, i) => {
        const y = cy - 6 + i * 13
        const count = elemCounts[el] || 0
        const ec = ELEMENT_COLORS[el]
        ctx.fillStyle = `rgba(${ec.r},${ec.g},${ec.b},0.6)`
        ctx.fillRect(cx - 18, y, count * 5, 5)
        ctx.font = '7px Inconsolata, monospace'
        ctx.fillStyle = 'rgba(255,255,255,0.35)'
        ctx.textAlign = 'left'
        ctx.fillText(`${count} ${ELEMENT_NAMES[el]}`, cx - 18 + count * 5 + 4, y + 5)
      })

      // Element color key (bottom-left corner)
      const keyX = 12, keyY = H - 52
      ctx.fillStyle = 'rgba(12,12,22,0.7)'
      ctx.beginPath(); ctx.roundRect(keyX, keyY, 80, 46, 4); ctx.fill()
      ctx.font = '7px Cinzel, serif'
      ctx.fillStyle = 'rgba(201,168,76,0.4)'
      ctx.textAlign = 'left'
      ctx.fillText('ELEMENTS', keyX + 6, keyY + 9)
      ;['fire','earth','air','water'].forEach((el, i) => {
        const y = keyY + 16 + i * 7
        const ec = ELEMENT_COLORS[el]
        ctx.fillStyle = `rgba(${ec.r},${ec.g},${ec.b},0.8)`
        ctx.fillRect(keyX + 6, y, 8, 4)
        ctx.font = '6px Inconsolata, monospace'
        ctx.fillStyle = 'rgba(255,255,255,0.45)'
        ctx.fillText(ELEMENT_NAMES[el], keyX + 18, y + 4)
      })

      // Ambient particles
      particles.forEach(pt => {
        pt.angle += pt.speed
        const pr = innerR + (outerR - innerR) * pt.r + Math.sin(pulse * 2 + pt.phase) * 3
        const px = cx + Math.cos(pt.angle) * pr
        const py = cy + Math.sin(pt.angle) * pr
        const alpha = pt.brightness * (0.12 + Math.sin(pulse * 3 + pt.phase) * 0.08)
        ctx.beginPath(); ctx.arc(px, py, 1, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,168,76,${alpha})`; ctx.fill()
      })

      // Title
      ctx.font = '8px Cinzel, serif'
      ctx.fillStyle = 'rgba(201,168,76,0.25)'
      ctx.textAlign = 'center'
      ctx.fillText('RADIAL DATA ARCHITECTURE', cx, H - 8)

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }} />
}
