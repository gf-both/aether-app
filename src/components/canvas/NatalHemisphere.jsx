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

// Day-sect planets extend left; night-sect extend right
const DIURNAL = new Set(['sun', 'jupiter', 'saturn', 'mercury', 'northNode'])

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

function getHouseFor(pLon, houses) {
  for (let i = 0; i < 12; i++) {
    const start = houses[i].lon, end = houses[(i + 1) % 12].lon
    if (start <= end) { if (pLon >= start && pLon < end) return i + 1 }
    else { if (pLon >= start || pLon < end) return i + 1 }
  }
  return 1
}

export default function NatalHemisphere() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const chartRef = useRef(null)
  const hovRef = useRef(null)
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

    const particles = []
    for (let i = 0; i < 40; i++) {
      particles.push({ x: Math.random(), y: Math.random(), speed: 0.0002 + Math.random() * 0.0003, phase: Math.random() * Math.PI * 2, brightness: 0.15 + Math.random() * 0.25, side: Math.random() > 0.5 ? 'day' : 'night' })
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

      const ch = chartRef.current
      const midX = W / 2
      const padTop = 46, padBot = 24
      const spineH = H - padTop - padBot
      const signH = spineH / 12
      const mx = mouseRef.current.x, my = mouseRef.current.y

      // Background: warm left, cool right
      const bg = ctx.createLinearGradient(0, 0, W, 0)
      bg.addColorStop(0, 'rgba(22,20,14,0.97)')
      bg.addColorStop(0.49, 'rgba(16,14,12,0.98)')
      bg.addColorStop(0.51, 'rgba(12,14,20,0.98)')
      bg.addColorStop(1, 'rgba(10,12,22,0.97)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Day/Night gradient overlays
      const dayG = ctx.createLinearGradient(0, 0, midX, 0)
      dayG.addColorStop(0, 'rgba(201,168,76,0.035)')
      dayG.addColorStop(1, 'rgba(201,168,76,0)')
      ctx.fillStyle = dayG; ctx.fillRect(0, padTop, midX, spineH)
      const nightG = ctx.createLinearGradient(midX, 0, W, 0)
      nightG.addColorStop(0, 'rgba(68,102,170,0)')
      nightG.addColorStop(1, 'rgba(68,102,170,0.035)')
      ctx.fillStyle = nightG; ctx.fillRect(midX, padTop, midX, spineH)

      // Section labels
      ctx.font = '9px Cinzel, serif'; ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(201,168,76,0.3)'; ctx.fillText('DIURNAL', midX * 0.5, padTop - 10)
      ctx.fillStyle = 'rgba(100,136,204,0.3)'; ctx.fillText('NOCTURNAL', midX + midX * 0.5, padTop - 10)

      // Central spine line
      ctx.beginPath(); ctx.moveTo(midX, padTop); ctx.lineTo(midX, padTop + spineH)
      ctx.strokeStyle = 'rgba(201,168,76,0.12)'; ctx.lineWidth = 1; ctx.stroke()

      // Zodiac signs along spine with element-colored backgrounds
      for (let i = 0; i < 12; i++) {
        const y = padTop + i * signH
        const elem = ELEMS[i]
        const ec = ELEMENT_COLORS[elem]

        // Faint horizontal band
        ctx.fillStyle = `rgba(${ec.r},${ec.g},${ec.b},0.015)`
        ctx.fillRect(0, y, W, signH)

        // Tick mark
        ctx.beginPath(); ctx.moveTo(midX - 7, y); ctx.lineTo(midX + 7, y)
        ctx.strokeStyle = 'rgba(201,168,76,0.07)'; ctx.lineWidth = 0.3; ctx.stroke()

        // Sign glyph
        ctx.font = '12px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = `rgba(${ec.r},${ec.g},${ec.b},0.35)`
        ctx.fillText(SIGN_GLYPHS[i], midX, y + signH / 2)
      }

      if (!ch) {
        ctx.font = '11px Cinzel, serif'; ctx.fillStyle = 'rgba(201,168,76,0.35)'; ctx.textAlign = 'center'
        ctx.fillText('Add birth data to see your chart', midX, H / 2)
        animRef.current = requestAnimationFrame(draw); return
      }

      const planets = ch.planets || {}
      const houses = ch.houses || []
      const aspects = (ch.aspects || []).slice(0, 12)
      const planetKeys = Object.keys(planets).filter(k => PLANET_GLYPHS[k])
      const planetPos = {}
      let newHov = null

      // Place planets
      planetKeys.forEach(key => {
        const p = planets[key]
        if (!p) return
        const lon = p.lon ?? p.longitude ?? 0
        const signIdx = p.signIndex ?? Math.floor(lon / 30) % 12
        const degInSign = p.degree ?? (lon % 30)
        const house = houses.length ? getHouseFor(lon, houses) : '?'
        const elem = ELEMS[signIdx]
        const ec = ELEMENT_COLORS[elem]
        const isDiurnal = DIURNAL.has(key)
        const pc = PLANET_COLORS[key]
        const isLum = key === 'sun' || key === 'moon'

        // Y position on spine: sign band + offset within sign
        const y = padTop + signIdx * signH + (degInSign / 30) * signH

        // Bar length: luminaries longest, outers shortest, plus breathing
        const importance = isLum ? 0.85 : ['jupiter','saturn','mars','venus'].includes(key) ? 0.65 : key === 'mercury' ? 0.55 : 0.4
        const maxBar = midX * 0.7
        const barLen = maxBar * importance * (0.92 + Math.sin(pulse + lon * 0.04) * 0.05)

        let barStartX, barEndX, dotX, labelX, labelAlign
        if (isDiurnal) {
          barStartX = midX - 10; barEndX = midX - 10 - barLen
          dotX = barEndX; labelX = barEndX - 8; labelAlign = 'right'
        } else {
          barStartX = midX + 10; barEndX = midX + 10 + barLen
          dotX = barEndX; labelX = barEndX + 8; labelAlign = 'left'
        }

        planetPos[key] = { x: dotX, y, isDiurnal, signIdx, degInSign, house, elem, lon }

        // Hover check
        const dx = mx - dotX, dy = my - y
        if (dx * dx + dy * dy < 250) newHov = key

        const isHov = hovRef.current === key

        // Bar: gradient from spine to dot, colored by sign element
        const grad = ctx.createLinearGradient(barStartX, 0, barEndX, 0)
        grad.addColorStop(isDiurnal ? 0 : 0, `rgba(${ec.r},${ec.g},${ec.b},0.02)`)
        grad.addColorStop(isDiurnal ? 1 : 1, `rgba(${ec.r},${ec.g},${ec.b},${isHov ? 0.55 : 0.3})`)
        ctx.beginPath(); ctx.moveTo(barStartX, y); ctx.lineTo(barEndX, y)
        ctx.strokeStyle = grad; ctx.lineWidth = isHov ? 4 : isLum ? 3 : 2; ctx.lineCap = 'round'; ctx.stroke()

        // Planet dot glow
        const glowR = isHov ? 16 : isLum ? 11 : 8
        const glow = ctx.createRadialGradient(dotX, y, 0, dotX, y, glowR)
        glow.addColorStop(0, pc + '40'); glow.addColorStop(1, pc + '00')
        ctx.beginPath(); ctx.arc(dotX, y, glowR, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill()

        // Dot
        const dr = isHov ? 6 : isLum ? 5 : 3.5
        ctx.beginPath(); ctx.arc(dotX, y, dr, 0, Math.PI * 2); ctx.fillStyle = pc; ctx.fill()

        // Glyph on dot
        ctx.font = `${isHov ? 11 : isLum ? 10 : 8}px serif`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = '#fff'; ctx.fillText(PLANET_GLYPHS[key], dotX, y + 1)

        // Name + degree + house label
        ctx.textAlign = labelAlign
        ctx.font = '8px Cinzel, serif'; ctx.fillStyle = pc + 'bb'
        ctx.fillText(PLANET_NAMES[key], labelX, y - 5)
        ctx.font = '7px Inconsolata, monospace'; ctx.fillStyle = pc + '88'
        const deg = Math.floor(degInSign), min = Math.round((degInSign - deg) * 60)
        ctx.fillText(`${deg}°${String(min).padStart(2,'0')}' ${SIGN_GLYPHS[signIdx]}  H${house}`, labelX, y + 6)

        // Retrograde
        if (p.retrograde) {
          ctx.font = '7px serif'; ctx.fillStyle = 'rgba(204,68,68,0.5)'
          ctx.fillText('℞', labelX + (isDiurnal ? -12 : 12), y - 5)
        }
      })
      hovRef.current = newHov

      // Aspect connections crossing spine
      aspects.forEach(asp => {
        const p1 = planetPos[asp.planet1], p2 = planetPos[asp.planet2]
        if (!p1 || !p2) return
        const cpx = midX + (p1.isDiurnal === p2.isDiurnal ? (p1.isDiurnal ? -25 : 25) : 0)
        const cpy = (p1.y + p2.y) / 2
        const col = asp.type === 'trine' ? '#4488cc' : asp.type === 'opposition' ? '#cc4444' : asp.type === 'square' ? '#cc8844' : asp.type === 'sextile' ? '#44aa66' : '#c9a84c'
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.quadraticCurveTo(cpx, cpy, p2.x, p2.y)
        ctx.strokeStyle = col + '18'; ctx.lineWidth = 0.7; ctx.stroke()
      })

      // ASC marker
      if (houses.length && houses[0]) {
        const aLon = houses[0].lon || 0
        const aSignIdx = Math.floor(aLon / 30) % 12
        const aDeg = aLon % 30
        const aY = padTop + aSignIdx * signH + (aDeg / 30) * signH
        ctx.beginPath()
        ctx.moveTo(midX - 9, aY); ctx.lineTo(midX, aY - 5); ctx.lineTo(midX + 9, aY); ctx.lineTo(midX, aY + 5); ctx.closePath()
        ctx.fillStyle = 'rgba(201,168,76,0.35)'; ctx.fill()
        ctx.font = '7px Cinzel, serif'; ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(201,168,76,0.5)'
        ctx.fillText('ASC', midX - 13, aY + 3)
      }
      // MC marker
      if (houses.length >= 10 && houses[9]) {
        const mLon = houses[9].lon || 0
        const mSignIdx = Math.floor(mLon / 30) % 12
        const mDeg = mLon % 30
        const mY = padTop + mSignIdx * signH + (mDeg / 30) * signH
        ctx.beginPath()
        ctx.moveTo(midX - 9, mY); ctx.lineTo(midX, mY - 5); ctx.lineTo(midX + 9, mY); ctx.lineTo(midX, mY + 5); ctx.closePath()
        ctx.fillStyle = 'rgba(68,136,204,0.35)'; ctx.fill()
        ctx.font = '7px Cinzel, serif'; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(68,136,204,0.5)'
        ctx.fillText('MC', midX + 13, mY + 3)
      }

      // Tooltip
      if (hovRef.current) {
        const key = hovRef.current
        const s = planetPos[key], p = planets[key]
        if (s && p) {
          const deg = Math.floor(s.degInSign), min = Math.round((s.degInSign - deg) * 60)
          const lines = [
            `${PLANET_NAMES[key]} ${PLANET_GLYPHS[key]}`,
            `${deg}°${String(min).padStart(2,'0')}' ${SIGN_NAMES[s.signIdx]}`,
            `House ${s.house}  ·  ${ELEMENT_NAMES[s.elem]}`,
            s.isDiurnal ? 'Day Sect (Diurnal)' : 'Night Sect (Nocturnal)',
            p.retrograde ? 'Retrograde ℞' : '',
          ].filter(Boolean)
          const tw = 160, th = lines.length * 16 + 14
          let tx = s.x + 18, ty = s.y - th / 2
          if (tx + tw > W - 10) tx = s.x - tw - 18
          if (ty < 10) ty = 10; if (ty + th > H - 10) ty = H - th - 10

          ctx.fillStyle = 'rgba(12,12,22,0.92)'; ctx.strokeStyle = 'rgba(201,168,76,0.25)'; ctx.lineWidth = 1
          ctx.beginPath(); ctx.roundRect(tx, ty, tw, th, 6); ctx.fill(); ctx.stroke()
          lines.forEach((line, li) => {
            ctx.font = li === 0 ? '11px Cinzel, serif' : '9px Inconsolata, monospace'
            ctx.fillStyle = li === 0 ? '#c9a84c' : 'rgba(255,255,255,0.6)'
            ctx.textAlign = 'left'; ctx.textBaseline = 'top'
            ctx.fillText(line, tx + 10, ty + 8 + li * 16)
          })
        }
      }

      // Element color key (bottom-right)
      const keyX = W - 90, keyY = H - 52
      ctx.fillStyle = 'rgba(12,12,22,0.7)'
      ctx.beginPath(); ctx.roundRect(keyX, keyY, 80, 46, 4); ctx.fill()
      ctx.font = '7px Cinzel, serif'; ctx.fillStyle = 'rgba(201,168,76,0.4)'; ctx.textAlign = 'left'
      ctx.fillText('ELEMENTS', keyX + 6, keyY + 9)
      ;['fire','earth','air','water'].forEach((el, i) => {
        const y = keyY + 16 + i * 7
        const ec = ELEMENT_COLORS[el]
        ctx.fillStyle = `rgba(${ec.r},${ec.g},${ec.b},0.8)`; ctx.fillRect(keyX + 6, y, 8, 4)
        ctx.font = '6px Inconsolata, monospace'; ctx.fillStyle = 'rgba(255,255,255,0.45)'
        ctx.fillText(ELEMENT_NAMES[el], keyX + 18, y + 4)
      })

      // Ambient particles
      particles.forEach(pt => {
        pt.y += pt.speed; if (pt.y > 1) pt.y = 0
        const px = pt.side === 'day' ? pt.x * midX * 0.8 + midX * 0.1 : midX + pt.x * midX * 0.8 + midX * 0.1
        const py = padTop + pt.y * spineH
        const alpha = pt.brightness * (0.15 + Math.sin(pulse * 2 + pt.phase) * 0.08)
        ctx.beginPath(); ctx.arc(px, py, 1, 0, Math.PI * 2)
        ctx.fillStyle = pt.side === 'day' ? `rgba(201,168,76,${alpha})` : `rgba(100,136,204,${alpha})`
        ctx.fill()
      })

      // Title
      ctx.font = '8px Cinzel, serif'; ctx.fillStyle = 'rgba(201,168,76,0.25)'; ctx.textAlign = 'center'
      ctx.fillText('SPLIT HEMISPHERE', midX, H - 8)

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
