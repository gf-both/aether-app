import { useState, useEffect, useRef, useMemo } from 'react'
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
  sun: '#f0c040', moon: '#d0d8f0', mercury: '#99ccee', venus: '#ddaa88',
  mars: '#ee6644', jupiter: '#e8cc50', saturn: '#aabb88', uranus: '#88ddcc',
  neptune: '#6699ee', pluto: '#997799', northNode: '#ccaa66', chiron: '#cc9988',
}
const SIGN_COLORS = [
  '#e85555','#a08050','#7799dd','#66bbaa','#f0c040','#88aa77',
  '#cc9966','#8b2244','#dd8833','#667788','#44aacc','#6699bb',
]
const ELEMS = ['fire','earth','air','water','fire','earth','air','water','fire','earth','air','water']
const eBg = {
  fire: 'rgba(220,80,50,.1)', earth: 'rgba(120,100,60,.1)',
  air: 'rgba(100,160,220,.08)', water: 'rgba(60,150,170,.09)',
}

const ASPECT_COLORS = {
  conjunction: 'rgba(170,80,220,',
  opposition:  'rgba(120,160,255,',
  trine:       'rgba(255,220,80,',
  square:      'rgba(220,80,80,',
  sextile:     'rgba(80,200,160,',
  quincunx:    'rgba(180,140,100,',
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
  const dob = parseDOB(profile.dob)
  const tob = parseTOB(profile.tob)
  if (!dob) return null
  return getNatalChart({
    day: dob.day, month: dob.month, year: dob.year,
    hour: tob.hour, minute: tob.minute,
    lat: profile.birthLat ?? -34.6037,
    lon: profile.birthLon ?? -58.3816,
    timezone: profile.birthTimezone ?? -3,
  })
}

export default function NatalWheel({ showAspects = true, showHouses = true }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(-1)
  const showAspectsRef = useRef(showAspects)
  const showHousesRef = useRef(showHouses)
  const chartRef = useRef(null)

  const profile = useAboveInsideStore(s => s.primaryProfile)

  // Compute natal chart
  const chart = useMemo(() => {
    try { return computeChart(profile) } catch { return null }
  }, [profile.dob, profile.tob, profile.birthLat, profile.birthLon, profile.birthTimezone])

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
      const rot = (180 - (ascLon - 90) + 360) % 360  // place ASC at left (180°)
      planetKeys.forEach((key, i) => {
        const p = ch.planets[key]
        const a = (p.lon - 90 + rot) * Math.PI / 180
        const rp = R * 0.67 * 0.67
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
        ctx.fillStyle = 'rgba(201,168,76,.5)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('Loading chart...', cx, cy)
        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }

      const ascLon = ch.angles.asc.lon
      const rot = (180 - (ascLon - 90) + 360) % 360
      const hov = hovRef.current
      const planetKeys = Object.keys(ch.planets)

      // Background gradient
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R)
      bg.addColorStop(0, 'rgba(20,10,50,.42)'); bg.addColorStop(1, 'rgba(1,1,10,.1)')
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill()

      // Sign segments
      for (let i = 0; i < 12; i++) {
        const a0 = (i * 30 - 90 + rot) * Math.PI / 180
        const a1 = ((i + 1) * 30 - 90 + rot) * Math.PI / 180
        ctx.beginPath(); ctx.arc(cx, cy, R * .97, a0, a1); ctx.arc(cx, cy, R * .79, a1, a0, true); ctx.closePath()
        ctx.fillStyle = eBg[ELEMS[i]]; ctx.fill()
        ctx.strokeStyle = SIGN_COLORS[i] + '66'; ctx.lineWidth = 1.1; ctx.stroke()
        const am = (i * 30 + 15 - 90 + rot) * Math.PI / 180
        ctx.font = `bold ${R * .12}px serif`; ctx.fillStyle = SIGN_COLORS[i]
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(SIGN_GLYPHS[i], cx + R * .875 * Math.cos(am), cy + R * .875 * Math.sin(am))
        for (let d = 0; d < 30; d++) {
          const ta = (i * 30 + d - 90 + rot) * Math.PI / 180
          const t0 = d % 10 === 0 ? .975 : d % 5 === 0 ? .983 : .989
          ctx.beginPath()
          ctx.moveTo(cx + R * .97 * t0 * Math.cos(ta), cy + R * .97 * t0 * Math.sin(ta))
          ctx.lineTo(cx + R * .97 * Math.cos(ta), cy + R * .97 * Math.sin(ta))
          ctx.strokeStyle = d % 10 === 0 ? 'rgba(201,168,76,.75)' : 'rgba(201,168,76,.40)'
          ctx.lineWidth = d % 10 === 0 ? 1.5 : .8; ctx.stroke()
        }
      }

      // Concentric rings
      ;[.97, .79, .63, .51, .38].forEach((rf, i) => {
        ctx.beginPath(); ctx.arc(cx, cy, R * rf, 0, Math.PI * 2)
        ctx.strokeStyle = ['rgba(201,168,76,.40)','rgba(201,168,76,.30)','rgba(201,168,76,.22)','rgba(201,168,76,.15)','rgba(201,168,76,.10)'][i]
        ctx.lineWidth = 1.2; ctx.stroke()
      })

      // House cusps
      if (showHousesRef.current) {
        ch.houses.forEach((house, i) => {
          const a = (house.lon - 90 + rot) * Math.PI / 180
          const isAngular = i % 3 === 0
          ctx.beginPath()
          ctx.moveTo(cx + R * .79 * Math.cos(a), cy + R * .79 * Math.sin(a))
          ctx.lineTo(cx + R * (isAngular ? .38 : .51) * Math.cos(a), cy + R * (isAngular ? .38 : .51) * Math.sin(a))
          ctx.strokeStyle = isAngular ? 'rgba(201,168,76,.65)' : 'rgba(201,168,76,.30)'
          ctx.lineWidth = isAngular ? 1.8 : .9; ctx.stroke()
          // House number
          const nextIdx = (i + 1) % 12
          const nextLon = ch.houses[nextIdx].lon
          let midLon = house.lon + ((nextLon - house.lon + 360) % 360) / 2
          const numA = (midLon - 90 + rot) * Math.PI / 180
          ctx.font = `bold ${R * .058}px 'Cinzel',serif`
          ctx.fillStyle = isAngular ? 'rgba(201,168,76,.70)' : 'rgba(201,168,76,.45)'
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(i + 1, cx + R * .45 * Math.cos(numA), cy + R * .45 * Math.sin(numA))
        })
      }

      // Aspect lines
      if (showAspectsRef.current) {
        const rA = R * .49
        ch.aspects.forEach(({ planet1, planet2, aspect, orb }) => {
          const lon1 = ch.planets[planet1]?.lon
          const lon2 = ch.planets[planet2]?.lon
          if (lon1 == null || lon2 == null) return
          const aa = (lon1 - 90 + rot) * Math.PI / 180
          const ab = (lon2 - 90 + rot) * Math.PI / 180
          const col = ASPECT_COLORS[aspect] || 'rgba(201,168,76,'
          const alpha = Math.max(0.12, 0.38 - orb * 0.03)
          ctx.beginPath()
          ctx.moveTo(cx + rA * Math.cos(aa), cy + rA * Math.sin(aa))
          ctx.lineTo(cx + rA * Math.cos(ab), cy + rA * Math.sin(ab))
          ctx.strokeStyle = col + alpha + ')'
          ctx.lineWidth = 1.5; ctx.stroke()
        })
      }

      // Planets
      planetKeys.forEach((key, i) => {
        const p = ch.planets[key]
        const glyph = PLANET_GLYPHS[key] || '?'
        const color = PLANET_COLORS[key] || '#aaaaaa'
        const a = (p.lon - 90 + rot) * Math.PI / 180
        const rp = R * 0.67 * 0.67
        const px2 = cx + rp * Math.cos(a), py2 = cy + rp * Math.sin(a)
        const isH = hov === i

        ctx.beginPath()
        ctx.moveTo(px2, py2)
        ctx.lineTo(cx + R * .63 * Math.cos(a), cy + R * .63 * Math.sin(a))
        ctx.strokeStyle = color + '66'; ctx.lineWidth = 1.1; ctx.stroke()

        if (isH) {
          const g = ctx.createRadialGradient(px2, py2, 0, px2, py2, R * .09)
          g.addColorStop(0, color + '66'); g.addColorStop(1, 'transparent')
          ctx.beginPath(); ctx.arc(px2, py2, R * .09, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
        }
        ctx.beginPath(); ctx.arc(px2, py2, R * .028, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill()
        ctx.font = `bold ${R * (isH ? .13 : .10)}px serif`; ctx.fillStyle = isH ? '#fff' : color
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(glyph, px2, py2 - R * .055)

        if (isH) {
          const signInfo = p.sign + ' ' + Math.floor(p.degree) + '°' + (p.retrograde ? ' Rx' : '')
          ctx.font = `bold ${R * .075}px 'Cinzel',serif`; ctx.fillStyle = 'rgba(201,168,76,.95)'
          ctx.textAlign = 'center'; ctx.fillText(key.charAt(0).toUpperCase() + key.slice(1), cx, cy - R * .12)
          ctx.font = `${R * .055}px serif`; ctx.fillStyle = 'rgba(200,215,255,.90)'
          ctx.fillText(signInfo, cx, cy + R * .02)
        }
      })

      // ASC/MC markers
      ;[['ASC', ch.angles.asc.lon, 'rgba(201,168,76,.85)'], ['MC', ch.angles.mc.lon, 'rgba(136,190,255,.75)']].forEach(([label, lon, col]) => {
        const a = (lon - 90 + rot) * Math.PI / 180
        const rp = R * 0.76
        ctx.font = `bold ${R * .055}px 'Cinzel',serif`
        ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(label, cx + rp * Math.cos(a), cy + rp * Math.sin(a))
      })

      // Center glow
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * .22)
      cg.addColorStop(0, 'rgba(201,168,76,.14)'); cg.addColorStop(1, 'rgba(1,1,10,0)')
      ctx.beginPath(); ctx.arc(cx, cy, R * .22, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill()
      const sunSign = ch.planets.sun?.sign || ''
      const ascSign = ch.angles.asc?.sign || ''
      ctx.font = `bold ${R * .15}px serif`; ctx.fillStyle = 'rgba(201,168,76,.65)'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('♒', cx, cy - R * .04)
      ctx.font = `bold ${R * .045}px 'Cinzel',serif`; ctx.fillStyle = 'rgba(201,168,76,.50)'
      ctx.fillText((sunSign + ' · ' + ascSign + ' ASC').toUpperCase(), cx, cy + R * .09)

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
