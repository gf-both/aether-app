import { useEffect, useRef, useMemo } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { getNatalChart } from '../../engines/natalEngine'

const SIGN_GLYPHS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']
const PLANET_GLYPHS = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', chiron: '⚷',
}

const PLANET_COLORS = {
  sun: '#b87800', moon: '#5060a0', mercury: '#2277aa', venus: '#aa5533',
  mars: '#bb2222', jupiter: '#997700', saturn: '#5a6645', uranus: '#2288aa',
  neptune: '#3355cc', pluto: '#774488', northNode: '#886633', chiron: '#885544',
}

const CHART_BG = '#fafaf8'
const CHART_RING_BG = '#f0ede6'
const CHART_INNER = '#ffffff'

const SIGN_ELEMENT_COLORS = {
  fire: '#cc4444', earth: '#8b6914', air: '#4488cc', water: '#2a8899',
}
const SIGN_ELEMENT_BG = {
  fire: 'rgba(204,68,68,0.07)', earth: 'rgba(139,105,20,0.07)',
  air: 'rgba(68,136,204,0.07)', water: 'rgba(42,136,153,0.07)',
}
const ELEMS = ['fire','earth','air','water','fire','earth','air','water','fire','earth','air','water']

const ASPECT_COLORS_CHART = {
  conjunction: 'rgba(100,50,200,', opposition: 'rgba(180,50,50,',
  trine: 'rgba(50,100,180,', square: 'rgba(180,80,50,',
  sextile: 'rgba(50,150,80,', quincunx: 'rgba(150,120,80,',
}

const RING_STROKE      = 'rgba(80,65,40,0.28)'
const RING_STROKE_BOLD = 'rgba(80,65,40,0.50)'
const HOUSE_STROKE     = 'rgba(80,65,40,0.22)'
const HOUSE_STROKE_ANG = 'rgba(80,65,40,0.60)'
const GOLD             = '#8b6914'
const GOLD_LIGHT       = '#c4932a'
const TEXT_DARK        = 'rgba(50,40,25,0.85)'
const TEXT_MID         = 'rgba(70,55,30,0.60)'

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
  // Resolve coords from pob if lat/lon not set
  let lat = profile.birthLat || 0
  let lon = profile.birthLon || 0
  let tz  = profile.birthTimezone ?? 0
  if (!lat && !lon && profile.pob) {
    const pob = (profile.pob || '').toLowerCase()
    if (pob.includes('buenos aires')) { lat=-34.6037; lon=-58.3816; tz=-3 }
    else if (pob.includes('montevideo')) { lat=-34.9011; lon=-56.1645; tz=-3 }
    else if (pob.includes('new york')) { lat=40.7128; lon=-74.0060; tz=-5 }
    else if (pob.includes('london')) { lat=51.5074; lon=-0.1278; tz=0 }
    else if (pob.includes('paris')) { lat=48.8566; lon=2.3522; tz=1 }
    else if (pob.includes('madrid')) { lat=40.4168; lon=-3.7038; tz=1 }
    else if (pob.includes('mexico')) { lat=19.4326; lon=-99.1332; tz=-6 }
    else if (pob.includes('bogota')) { lat=4.7110; lon=-74.0721; tz=-5 }
    else if (pob.includes('lima')) { lat=-12.0464; lon=-77.0428; tz=-5 }
    else if (pob.includes('santiago')) { lat=-33.4489; lon=-70.6693; tz=-3 }
  }
  try {
    return getNatalChart({ day: dob.day, month: dob.month, year: dob.year, hour: tob.hour, minute: tob.minute, lat, lon, timezone: tz })
  } catch { return null }
}

export default function NatalWheel({ showAspects = true, showHouses = true }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(-1)
  const showAspectsRef = useRef(showAspects)
  const showHousesRef = useRef(showHouses)
  const chartRef = useRef(null)

  const profile = useAboveInsideStore(s => s.activeViewProfile || s.primaryProfile)
  const chart = useMemo(() => {
    try { return computeChart(profile) } catch { return null }
  }, [profile?.dob, profile?.tob, profile?.birthLat, profile?.birthLon, profile?.birthTimezone, profile?.pob])

  useEffect(() => { chartRef.current = chart }, [chart])
  useCanvasResize(canvasRef)
  useEffect(() => { showAspectsRef.current = showAspects }, [showAspects])
  useEffect(() => { showHousesRef.current = showHouses }, [showHouses])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e) => {
      const r = canvas.getBoundingClientRect()
      const mx = e.clientX - r.left, my = e.clientY - r.top
      const cx = canvas.width / window.devicePixelRatio / 2
      const cy = canvas.height / window.devicePixelRatio / 2
      const R = Math.min(cx, cy) * .96
      const ch = chartRef.current
      if (!ch) return
      hovRef.current = -1
      const planetKeys = Object.keys(ch.planets)
      const ascLon = ch.angles.asc.lon
      // Standard Western chart: ASC at left (9 o'clock), zodiac counter-clockwise, MC at top
      planetKeys.forEach((key, i) => {
        const p = ch.planets[key]
        const a = (ascLon - p.lon + 180) * Math.PI / 180
        const rp = R * 0.685
        if (Math.hypot(mx - cx - rp * Math.cos(a), my - cy - rp * Math.sin(a)) < 16) hovRef.current = i
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
      const cx = W / 2, cy = H / 2, R = Math.min(cx, cy) * .96
      ctx.clearRect(0, 0, W, H)

      const ch = chartRef.current
      if (!ch) {
        ctx.font = `${R * .08}px sans-serif`
        ctx.fillStyle = 'rgba(100,80,40,.7)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('Loading chart...', cx, cy)
        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }

      // Safety check: ensure chart has the expected structure
      if (!ch.angles?.asc?.lon || !ch.planets || !ch.houses) {
        ctx.font = `${R * .07}px sans-serif`
        ctx.fillStyle = 'rgba(100,80,40,.7)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('Computing chart...', cx, cy)
        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }
      const ascLon = ch.angles.asc.lon
      // Standard Western chart: ASC at left, zodiac counter-clockwise, MC at top
      // Formula: canvas_angle = (ascLon - lon + 180) = (rot + 90 - lon) where rot = ascLon + 90
      // Standard Western chart: ASC at left (180°), zodiac counter-clockwise
      // l2a maps ecliptic longitude to canvas angle
      // Verified: l2a(ASC) = 180° (left), l2a(MC) ≈ 270° (top), l2a(DC) = 0° (right)
      const l2a = (lon) => (ascLon - lon + 180) * Math.PI / 180

      const hov = hovRef.current
      const planetKeys = Object.keys(ch.planets)

      // ── Background ──
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = CHART_BG; ctx.fill()

      ctx.beginPath(); ctx.arc(cx, cy, R * .82, 0, Math.PI * 2)
      ctx.fillStyle = CHART_RING_BG; ctx.fill()

      ctx.beginPath(); ctx.arc(cx, cy, R * .63, 0, Math.PI * 2)
      ctx.fillStyle = CHART_INNER; ctx.fill()

      // ── Sign segments (counter-clockwise: swap arc direction) ──
      for (let i = 0; i < 12; i++) {
        const elem = ELEMS[i]
        const elemColor = SIGN_ELEMENT_COLORS[elem]
        // Counter-clockwise: sign i goes from i*30 to (i+1)*30 in ecliptic
        // In canvas, a0 > a1 since larger ecliptic = smaller canvas angle
        const a0 = l2a(i * 30)          // canvas angle for sign start
        const a1 = l2a((i + 1) * 30)    // canvas angle for sign end (a1 = a0 - 30°)
        // Draw arc counter-clockwise from a0 to a1 (which is a0 - 30°)
        ctx.beginPath()
        ctx.arc(cx, cy, R * .97, a1, a0)            // clockwise from a1→a0 = same as CCW zodiac
        ctx.arc(cx, cy, R * .82, a0, a1, true)
        ctx.closePath()
        ctx.fillStyle = SIGN_ELEMENT_BG[elem]; ctx.fill()
        ctx.strokeStyle = elemColor + '55'; ctx.lineWidth = 0.8; ctx.stroke()

        // Sign separator line
        const ta = l2a(i * 30)
        ctx.beginPath()
        ctx.moveTo(cx + R * .82 * Math.cos(ta), cy + R * .82 * Math.sin(ta))
        ctx.lineTo(cx + R * .97 * Math.cos(ta), cy + R * .97 * Math.sin(ta))
        ctx.strokeStyle = elemColor + '80'; ctx.lineWidth = 1.3; ctx.stroke()

        // Sign glyph (centered in segment)
        const am = l2a(i * 30 + 15)
        const glyphSz = Math.max(14, R * 0.115)
        ctx.font = `bold ${glyphSz}px serif`
        ctx.fillStyle = elemColor
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(SIGN_GLYPHS[i], cx + R * .895 * Math.cos(am), cy + R * .895 * Math.sin(am))

        // Degree tick marks
        for (let d = 1; d < 30; d++) {
          const ta2 = l2a(i * 30 + d)
          const isMain = d % 10 === 0, isMid = d % 5 === 0
          const r0 = isMain ? .93 : isMid ? .95 : .958
          ctx.beginPath()
          ctx.moveTo(cx + R * r0 * Math.cos(ta2), cy + R * r0 * Math.sin(ta2))
          ctx.lineTo(cx + R * .97 * Math.cos(ta2), cy + R * .97 * Math.sin(ta2))
          ctx.strokeStyle = isMain ? 'rgba(80,65,40,0.50)' : 'rgba(80,65,40,0.25)'
          ctx.lineWidth = isMain ? 1.2 : 0.7; ctx.stroke()
        }
      }

      // ── Degree markers every 30° ──
      for (let i = 0; i < 12; i++) {
        const a = l2a(i * 30)
        const labelSz = Math.max(8, R * 0.048)
        ctx.font = `${labelSz}px 'Inconsolata',monospace`
        ctx.fillStyle = TEXT_MID
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(String(i * 30) + '°', cx + R * .998 * Math.cos(a), cy + R * .998 * Math.sin(a))
      }

      // ── Concentric rings ──
      ;[[.97, RING_STROKE_BOLD, 1.5], [.82, RING_STROKE_BOLD, 1.5],
        [.63, RING_STROKE, 1.1], [.51, RING_STROKE, 0.9], [.38, RING_STROKE, 0.8]
      ].forEach(([rf, stroke, lw]) => {
        ctx.beginPath(); ctx.arc(cx, cy, R * rf, 0, Math.PI * 2)
        ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke()
      })

      // ── House cusps ──
      if (showHousesRef.current) {
        ch.houses.forEach((house, i) => {
          const a = l2a(house.lon)
          const isAngular = i % 3 === 0
          ctx.beginPath()
          ctx.moveTo(cx + R * .63 * Math.cos(a), cy + R * .63 * Math.sin(a))
          ctx.lineTo(cx + R * (isAngular ? .38 : .51) * Math.cos(a), cy + R * (isAngular ? .38 : .51) * Math.sin(a))
          ctx.strokeStyle = isAngular ? HOUSE_STROKE_ANG : HOUSE_STROKE
          ctx.lineWidth = isAngular ? 1.6 : 0.9; ctx.stroke()

          // House number at midpoint
          const nextIdx = (i + 1) % 12
          const nextLon = ch.houses[nextIdx].lon
          const span = (nextLon - house.lon + 360) % 360
          const midLon = (house.lon + span / 2 + 360) % 360
          const numA = l2a(midLon)
          const numSz = Math.max(10, R * 0.070)
          ctx.font = `${numSz}px 'Cinzel',serif`
          ctx.fillStyle = isAngular ? 'rgba(100,80,20,0.75)' : 'rgba(80,65,40,0.48)'
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(i + 1, cx + R * .570 * Math.cos(numA), cy + R * .570 * Math.sin(numA))
        })
      }

      // ── Aspect lines ──
      if (showAspectsRef.current) {
        const rA = R * .46
        (ch?.aspects ?? []).forEach(({ planet1, planet2, aspect, orb }) => {
          const lon1 = ch.planets[planet1]?.lon
          const lon2 = ch.planets[planet2]?.lon
          if (lon1 == null || lon2 == null) return
          const aa = l2a(lon1), ab = l2a(lon2)
          const col = ASPECT_COLORS_CHART[aspect] || 'rgba(100,100,100,'
          const alpha = Math.max(0.25, 0.65 - orb * 0.07)
          const lw = orb < 1 ? 2.0 : orb < 3 ? 1.4 : 0.9
          ctx.beginPath()
          ctx.moveTo(cx + rA * Math.cos(aa), cy + rA * Math.sin(aa))
          ctx.lineTo(cx + rA * Math.cos(ab), cy + rA * Math.sin(ab))
          ctx.strokeStyle = col + alpha + ')'
          ctx.lineWidth = lw; ctx.stroke()
        })
      }

      // ── Planets ──
      planetKeys.forEach((key, i) => {
        const p = ch.planets[key]
        const glyph = PLANET_GLYPHS[key] || '?'
        const color = PLANET_COLORS[key] || '#444444'
        const a = l2a(p.lon)
        const rp = R * 0.685
        const px2 = cx + rp * Math.cos(a), py2 = cy + rp * Math.sin(a)
        const isH = hov === i

        ctx.beginPath()
        ctx.moveTo(cx + R * .63 * Math.cos(a), cy + R * .63 * Math.sin(a))
        ctx.lineTo(cx + R * .655 * Math.cos(a), cy + R * .655 * Math.sin(a))
        ctx.strokeStyle = color + '99'; ctx.lineWidth = 1.0; ctx.stroke()

        if (isH) {
          ctx.beginPath(); ctx.arc(px2, py2, R * .065, 0, Math.PI * 2)
          ctx.fillStyle = color + '18'; ctx.fill()
          ctx.beginPath(); ctx.arc(px2, py2, R * .065, 0, Math.PI * 2)
          ctx.strokeStyle = color + '55'; ctx.lineWidth = 1; ctx.stroke()
        }

        ctx.beginPath(); ctx.arc(px2, py2, R * .024, 0, Math.PI * 2)
        ctx.fillStyle = isH ? color : color + 'cc'; ctx.fill()

        const glyphSz = Math.max(14, R * (isH ? 0.135 : 0.105))
        ctx.font = `bold ${glyphSz}px serif`
        ctx.fillStyle = color
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(glyph, px2, py2 - R * .048)

        if (isH) {
          const signInfo = p.sign + ' ' + Math.floor(p.degree) + '°' + (p.retrograde ? ' Rx' : '')
          ctx.font = `bold ${Math.max(11, R * .072)}px 'Cinzel',serif`
          ctx.fillStyle = GOLD
          ctx.textAlign = 'center'
          ctx.fillText(key.charAt(0).toUpperCase() + key.slice(1), cx, cy - R * .10)
          ctx.font = `${Math.max(10, R * .056)}px serif`
          ctx.fillStyle = TEXT_DARK
          ctx.fillText(signInfo, cx, cy + R * .02)
        }
      })

      // ── ASC / DC / MC / IC axis labels ──
      const mcLon = ch.angles.mc.lon
      const axisLabels = [
        ['ASC', ascLon,                 GOLD],
        ['DC',  (ascLon + 180) % 360,   GOLD],
        ['MC',  mcLon,                  '#3355aa'],
        ['IC',  (mcLon + 180) % 360,    '#3355aa'],
      ]
      axisLabels.forEach(([label, lon, col]) => {
        const a = l2a(lon)
        const lr = R * 0.755
        const lsz = Math.max(9, R * 0.058)
        ctx.font = `bold ${lsz}px 'Cinzel',serif`
        ctx.fillStyle = col
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(label, cx + lr * Math.cos(a), cy + lr * Math.sin(a))
      })

      // ── Center info ──
      ctx.beginPath(); ctx.arc(cx, cy, R * .26, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill()
      ctx.beginPath(); ctx.arc(cx, cy, R * .26, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(80,65,40,0.15)'; ctx.lineWidth = 1; ctx.stroke()

      const sunSign = ch.planets.sun?.sign || ''
      const ascSign = ch.angles.asc?.sign || ''
      const sunGlyph = SIGN_GLYPHS[['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'].indexOf(sunSign)] || '?'
      ctx.font = `bold ${Math.max(22, R * .155)}px serif`
      ctx.fillStyle = GOLD_LIGHT
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(sunGlyph, cx, cy - R * .04)
      ctx.font = `${Math.max(8, R * .040)}px 'Cinzel',serif`
      ctx.fillStyle = TEXT_MID
      ctx.fillText((sunSign + ' · ' + ascSign + ' ↑').toUpperCase(), cx, cy + R * .09)

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
