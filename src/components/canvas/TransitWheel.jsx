import { useEffect, useRef, useMemo } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { getNatalChart } from '../../engines/natalEngine'

const signs = ['\u2648','\u2649','\u264A','\u264B','\u264C','\u264D','\u264E','\u264F','\u2650','\u2651','\u2652','\u2653']
const scols = ['#e85555','#a08050','#7799dd','#66bbaa','#f0c040','#88aa77','#cc9966','#8b2244','#dd8833','#667788','#44aacc','#6699bb']
const elems = ['fire','earth','air','water','fire','earth','air','water','fire','earth','air','water']
const eBg = { fire: 'rgba(220,80,50,.08)', earth: 'rgba(120,100,60,.08)', air: 'rgba(100,160,220,.06)', water: 'rgba(60,150,170,.07)' }

const PLANET_KEYS = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto']
const PLANET_SYMS = { sun:'☉', moon:'☽', mercury:'☿', venus:'♀', mars:'♂', jupiter:'♃', saturn:'♄', uranus:'♅', neptune:'♆', pluto:'♇' }
const PLANET_COLORS = { sun:'#f0c040', moon:'#d0d8f0', mercury:'#99ccee', venus:'#ddaa88', mars:'#ee6644', jupiter:'#e8cc50', saturn:'#aabb88', uranus:'#88ddcc', neptune:'#6699ee', pluto:'#997799' }

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

function buildNatalPlanets(chart) {
  if (!chart) return []
  return PLANET_KEYS.map(key => {
    const p = chart.planets?.[key]
    if (!p) return null
    return { s: PLANET_SYMS[key], d: p.lon ?? 0, c: PLANET_COLORS[key], n: key.charAt(0).toUpperCase() + key.slice(1) }
  }).filter(Boolean)
}

function buildTransitPlanets() {
  const now = new Date()
  try {
    const current = getNatalChart({
      day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear(),
      hour: now.getUTCHours(), minute: now.getUTCMinutes(),
      lat: 0, lon: 0, timezone: 0,
    })
    return PLANET_KEYS.map(key => {
      const p = current.planets?.[key]
      if (!p) return null
      const sign = p.sign || ''
      return {
        s: PLANET_SYMS[key],
        d: p.lon ?? 0,
        c: PLANET_COLORS[key],
        n: 'T.' + key.charAt(0).toUpperCase() + key.slice(1),
        sign,
      }
    }).filter(Boolean)
  } catch {
    return []
  }
}

function buildAspects(transitPlanets, natalPlanets) {
  const aspects = []
  const ASPECT_DEFS = [
    { angle: 0, orb: 8, col: 'rgba(144,80,224,' },
    { angle: 60, orb: 6, col: 'rgba(64,204,221,' },
    { angle: 90, orb: 8, col: 'rgba(238,68,102,' },
    { angle: 120, orb: 8, col: 'rgba(64,204,221,' },
    { angle: 180, orb: 8, col: 'rgba(238,68,102,' },
  ]
  transitPlanets.forEach((tp, ti) => {
    natalPlanets.forEach((np, ni) => {
      let diff = Math.abs(((tp.d - np.d) % 360 + 360) % 360)
      if (diff > 180) diff = 360 - diff
      for (const asp of ASPECT_DEFS) {
        if (Math.abs(diff - asp.angle) <= asp.orb) {
          aspects.push({ ti, ni, col: asp.col })
          break
        }
      }
    })
  })
  return aspects
}

export default function TransitWheel() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef({ ring: null, idx: -1 })

  const profile = useAboveInsideStore(s => s.activeViewProfile || s.primaryProfile)

  const { natalPlanets, transitPlanets, ascLon } = useMemo(() => {
    let chart = null
    try {
      const dob = parseDOB(profile?.dob)
      const tob = parseTOB(profile?.tob)
      if (dob) {
        chart = getNatalChart({
          day: dob.day, month: dob.month, year: dob.year,
          hour: tob.hour, minute: tob.minute,
          lat: profile?.birthLat ?? 0,
          lon: profile?.birthLon ?? 0,
          timezone: profile?.birthTimezone ?? 0,
        })
      }
    } catch { /* ignore */ }
    const natal = buildNatalPlanets(chart)
    const transits = buildTransitPlanets()
    const asc = chart?.angles?.asc?.lon ?? 0
    return { natalPlanets: natal, transitPlanets: transits, ascLon: asc }
  }, [profile?.dob, profile?.tob, profile?.birthLat, profile?.birthLon, profile?.birthTimezone])

  const transitAspects = useMemo(
    () => buildAspects(transitPlanets, natalPlanets),
    [transitPlanets, natalPlanets]
  )

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Rotation: place ASC at left (180° canvas position)
    // rot = 180 - (ascLon - 90) = 270 - ascLon
    const rot = (270 - ascLon + 360) % 360

    const natal = natalPlanets
    const transits = transitPlanets
    const aspects = transitAspects

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left, my = e.clientY - rect.top
      const dpr = window.devicePixelRatio
      const cx = canvas.width / dpr / 2, cy = canvas.height / dpr / 2
      const R = Math.min(cx, cy) * .96
      hovRef.current = { ring: null, idx: -1 }
      transits.forEach((p, i) => {
        const a = (p.d - 90 + rot) * Math.PI / 180
        const rp = R * .88
        if (Math.hypot(mx - cx - rp * Math.cos(a), my - cy - rp * Math.sin(a)) < 16) {
          hovRef.current = { ring: 'transit', idx: i }
        }
      })
      natal.forEach((p, i) => {
        const a = (p.d - 90 + rot) * Math.PI / 180
        const rp = R * .55
        if (Math.hypot(mx - cx - rp * Math.cos(a), my - cy - rp * Math.sin(a)) < 16) {
          hovRef.current = { ring: 'natal', idx: i }
        }
      })
    }
    const handleMouseLeave = () => { hovRef.current = { ring: null, idx: -1 } }
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
      const hov = hovRef.current

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R)
      bg.addColorStop(0, 'rgba(20,10,50,.35)'); bg.addColorStop(1, 'rgba(1,1,10,.08)')
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill()

      for (let i = 0; i < 12; i++) {
        const a0 = (i * 30 - 90 + rot) * Math.PI / 180
        const a1 = ((i + 1) * 30 - 90 + rot) * Math.PI / 180
        ctx.beginPath(); ctx.arc(cx, cy, R * .97, a0, a1); ctx.arc(cx, cy, R * .82, a1, a0, true); ctx.closePath()
        ctx.fillStyle = eBg[elems[i]]; ctx.fill()
        ctx.strokeStyle = scols[i] + '66'; ctx.lineWidth = 1.1; ctx.stroke()
        const am = (i * 30 + 15 - 90 + rot) * Math.PI / 180
        ctx.font = `bold ${R * .10}px serif`; ctx.fillStyle = scols[i]
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(signs[i], cx + R * .895 * Math.cos(am), cy + R * .895 * Math.sin(am))
      }

      ;[.97, .82, .72, .42, .20].forEach((rf, i) => {
        ctx.beginPath(); ctx.arc(cx, cy, R * rf, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(201,168,76,${[.40, .32, .24, .18, .12][i]})`
        ctx.lineWidth = 1.2; ctx.stroke()
      })

      aspects.forEach(({ ti, ni, col }) => {
        if (!transits[ti] || !natal[ni]) return
        const ta = (transits[ti].d - 90 + rot) * Math.PI / 180
        const na = (natal[ni].d - 90 + rot) * Math.PI / 180
        ctx.beginPath()
        ctx.moveTo(cx + R * .72 * Math.cos(ta), cy + R * .72 * Math.sin(ta))
        ctx.lineTo(cx + R * .42 * Math.cos(na), cy + R * .42 * Math.sin(na))
        ctx.strokeStyle = col + '0.45)'
        ctx.lineWidth = 1.5
        ctx.setLineDash([6, 3])
        ctx.stroke()
        ctx.setLineDash([])
      })

      transits.forEach((p, i) => {
        const a = (p.d - 90 + rot) * Math.PI / 180
        const rp = R * .77
        const px2 = cx + rp * Math.cos(a), py2 = cy + rp * Math.sin(a)
        const isH = hov.ring === 'transit' && hov.idx === i
        ctx.beginPath(); ctx.moveTo(px2, py2)
        ctx.lineTo(cx + R * .82 * Math.cos(a), cy + R * .82 * Math.sin(a))
        ctx.strokeStyle = p.c + '66'; ctx.lineWidth = 1.0; ctx.stroke()
        if (isH) {
          const g = ctx.createRadialGradient(px2, py2, 0, px2, py2, R * .08)
          g.addColorStop(0, p.c + '66'); g.addColorStop(1, 'transparent')
          ctx.beginPath(); ctx.arc(px2, py2, R * .08, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
        }
        ctx.beginPath(); ctx.arc(px2, py2, R * .024, 0, Math.PI * 2)
        ctx.fillStyle = p.c; ctx.fill()
        ctx.font = `bold ${R * (isH ? .11 : .085)}px serif`
        ctx.fillStyle = isH ? '#fff' : p.c
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(p.s, px2, py2 - R * .045)
        if (isH) {
          ctx.font = `bold ${R * .07}px 'Cinzel',serif`; ctx.fillStyle = 'rgba(64,204,221,.95)'
          ctx.textAlign = 'center'; ctx.fillText(p.n, cx, cy - R * .12)
          ctx.font = `${R * .055}px serif`; ctx.fillStyle = 'rgba(200,215,255,.90)'
          ctx.fillText(p.sign || '', cx, cy - R * .03)
        }
      })

      ctx.font = `bold ${R * .045}px 'Cinzel',serif`; ctx.fillStyle = 'rgba(64,204,221,.55)'
      ctx.textAlign = 'center'; ctx.fillText('TRANSITS', cx + R * .77, cy - R * .68)

      natal.forEach((p, i) => {
        const a = (p.d - 90 + rot) * Math.PI / 180
        const rp = R * .55
        const px2 = cx + rp * Math.cos(a), py2 = cy + rp * Math.sin(a)
        const isH = hov.ring === 'natal' && hov.idx === i
        ctx.beginPath(); ctx.moveTo(px2, py2)
        ctx.lineTo(cx + R * .42 * Math.cos(a), cy + R * .42 * Math.sin(a))
        ctx.strokeStyle = p.c + '66'; ctx.lineWidth = 1.0; ctx.stroke()
        if (isH) {
          const g = ctx.createRadialGradient(px2, py2, 0, px2, py2, R * .08)
          g.addColorStop(0, p.c + '66'); g.addColorStop(1, 'transparent')
          ctx.beginPath(); ctx.arc(px2, py2, R * .08, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
        }
        ctx.beginPath(); ctx.arc(px2, py2, R * .024, 0, Math.PI * 2)
        ctx.fillStyle = p.c; ctx.fill()
        ctx.font = `bold ${R * (isH ? .11 : .085)}px serif`
        ctx.fillStyle = isH ? '#fff' : p.c
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(p.s, px2, py2 - R * .045)
        if (isH) {
          ctx.font = `bold ${R * .07}px 'Cinzel',serif`; ctx.fillStyle = 'rgba(201,168,76,.95)'
          ctx.textAlign = 'center'; ctx.fillText(p.n + ' (Natal)', cx, cy - R * .12)
        }
      })

      ctx.font = `bold ${R * .045}px 'Cinzel',serif`; ctx.fillStyle = 'rgba(201,168,76,.50)'
      ctx.textAlign = 'center'; ctx.fillText('NATAL', cx - R * .55, cy - R * .42)

      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * .18)
      cg.addColorStop(0, 'rgba(201,168,76,.12)'); cg.addColorStop(1, 'rgba(1,1,10,0)')
      ctx.beginPath(); ctx.arc(cx, cy, R * .18, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill()

      ctx.font = `bold ${R * .13}px serif`; ctx.fillStyle = 'rgba(64,204,221,.60)'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('\u2609\u263D', cx, cy - R * .02)
      ctx.font = `bold ${R * .048}px 'Cinzel',serif`; ctx.fillStyle = 'rgba(201,168,76,.45)'
      ctx.fillText('TRANSIT OVERLAY', cx, cy + R * .075)

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [natalPlanets, transitPlanets, transitAspects, ascLon])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
