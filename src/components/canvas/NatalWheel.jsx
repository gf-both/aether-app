import { useState, useEffect, useRef, useCallback } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'

const signs = ['\u2648','\u2649','\u264A','\u264B','\u264C','\u264D','\u264E','\u264F','\u2650','\u2651','\u2652','\u2653']
const scols = ['#e85555','#a08050','#7799dd','#66bbaa','#f0c040','#88aa77','#cc9966','#8b2244','#dd8833','#667788','#44aacc','#6699bb']
const elems = ['fire','earth','air','water','fire','earth','air','water','fire','earth','air','water']
const eBg = { fire: 'rgba(220,80,50,.1)', earth: 'rgba(120,100,60,.1)', air: 'rgba(100,160,220,.08)', water: 'rgba(60,150,170,.09)' }
// Verified against Swiss Ephemeris (Kerykeion/pyswisseph) for Jan 23 1981, 22:10 Buenos Aires
const planets = [
  { s: '\u2609', d: 304, r: .67, c: '#f0c040', n: 'Sun', sign: 'Aquarius', deg: "3\u00B057\u2032", h: 5 },
  { s: '\u263D', d: 168, r: .63, c: '#d0d8f0', n: 'Moon', sign: 'Virgo', deg: "18\u00B026\u2032", h: 1 },
  { s: '\u263F', d: 319, r: .71, c: '#99ccee', n: 'Mercury', sign: 'Aquarius', deg: "19\u00B001\u2032", h: 6 },
  { s: '\u2640', d: 286, r: .59, c: '#ddaa88', n: 'Venus', sign: 'Capricorn', deg: "15\u00B058\u2032", h: 5 },
  { s: '\u2642', d: 319, r: .65, c: '#ee6644', n: 'Mars', sign: 'Aquarius', deg: "19\u00B000\u2032", h: 6 },
  { s: '\u2643', d: 190, r: .69, c: '#e8cc50', n: 'Jupiter', sign: 'Libra', deg: "10\u00B023\u2032", h: 1 },
  { s: '\u2644', d: 190, r: .61, c: '#aabb88', n: 'Saturn', sign: 'Libra', deg: "9\u00B045\u2032", h: 1 },
  { s: '\u2645', d: 239, r: .66, c: '#88ddcc', n: 'Uranus', sign: 'Scorpio', deg: "29\u00B023\u2032", h: 2 },
  { s: '\u2646', d: 264, r: .57, c: '#6699ee', n: 'Neptune', sign: 'Sagittarius', deg: "23\u00B049\u2032", h: 4 },
  { s: '\u2647', d: 204, r: .55, c: '#997799', n: 'Pluto', sign: 'Libra', deg: "24\u00B020\u2032", h: 1 },
  { s: 'AC', d: 168, r: .80, c: 'rgba(201,168,76,.85)', n: 'ASC', sign: 'Virgo', deg: "18\u00B013\u2032", h: 1 },
]

// Aspect types with colors and labels
const ASPECT_TYPES = {
  '\u25B3': { name: 'Trine',       col: 'rgba(255,220,80,', orb: '120\u00B0' },
  '\u25A1': { name: 'Square',      col: 'rgba(220,80,80,',  orb: '90\u00B0' },
  '\u260C': { name: 'Conjunction', col: 'rgba(170,80,220,', orb: '0\u00B0' },
  '\u260D': { name: 'Opposition',  col: 'rgba(120,160,255,', orb: '180\u00B0' },
  '\u26BA': { name: 'Sextile',     col: 'rgba(80,200,160,', orb: '60\u00B0' },
  '\u22BC': { name: 'Quincunx',    col: 'rgba(180,140,100,', orb: '150\u00B0' },
}

const aspects = [
  [0, 1, '\u25B3', 0.18],  // Sun trine Moon
  [0, 4, '\u25A1', 0.16],  // Sun square Mars
  [0, 7, '\u260C', 0.14],  // Sun conjunct Uranus
  [1, 4, '\u260C', 0.16],  // Moon conjunct Mars
  [3, 5, '\u25B3', 0.10],  // Venus trine Jupiter
  [0, 5, '\u260D', 0.10],  // Sun opposition Jupiter
  [6, 7, '\u25A1', 0.09],  // Saturn square Uranus
  [2, 8, '\u26BA', 0.12],  // Mercury sextile Neptune
  [4, 9, '\u260C', 0.14],  // Mars conjunct Pluto
  [5, 6, '\u260C', 0.10],  // Jupiter conjunct Saturn
  [1, 7, '\u260C', 0.13],  // Moon conjunct Uranus
  [3, 0, '\u260C', 0.12],  // Venus conjunct Sun
]

export default function NatalWheel({ showAspects = true, showHouses = true }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(-1)
  const showAspectsRef = useRef(showAspects)
  const showHousesRef = useRef(showHouses)

  useCanvasResize(canvasRef)

  useEffect(() => { showAspectsRef.current = showAspects }, [showAspects])
  useEffect(() => { showHousesRef.current = showHouses }, [showHouses])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Fixed rotation: ASC (168°) placed at LEFT (180° canvas)
    // (168 - 90 + rot) = 180 → rot = 102
    const rot = 102

    const handleMouseMove = (e) => {
      const r = canvas.getBoundingClientRect()
      const mx = e.clientX - r.left, my = e.clientY - r.top
      const cx = canvas.width / window.devicePixelRatio / 2
      const cy = canvas.height / window.devicePixelRatio / 2
      const R = Math.min(cx, cy) * .96
      hovRef.current = -1
      planets.forEach((p, i) => {
        const a = (p.d - 90 + rot) * Math.PI / 180
        const rp = R * p.r * .67
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
      const hov = hovRef.current

      // Background gradient
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R)
      bg.addColorStop(0, 'rgba(20,10,50,.42)'); bg.addColorStop(1, 'rgba(1,1,10,.1)')
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill()

      // Sign segments
      for (let i = 0; i < 12; i++) {
        const a0 = (i * 30 - 90 + rot) * Math.PI / 180
        const a1 = ((i + 1) * 30 - 90 + rot) * Math.PI / 180
        ctx.beginPath(); ctx.arc(cx, cy, R * .97, a0, a1); ctx.arc(cx, cy, R * .79, a1, a0, true); ctx.closePath()
        ctx.fillStyle = eBg[elems[i]]; ctx.fill()
        ctx.strokeStyle = scols[i] + '66'; ctx.lineWidth = 1.1; ctx.stroke()
        const am = (i * 30 + 15 - 90 + rot) * Math.PI / 180
        const rG = R * .875
        ctx.font = `bold ${R * .12}px serif`; ctx.fillStyle = scols[i]
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(signs[i], cx + rG * Math.cos(am), cy + rG * Math.sin(am))
        // Tick marks
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
        ctx.strokeStyle = ['.40', '.30', '.22', '.15', '.10'].map(o => `rgba(201,168,76,${o})`)[i]
        ctx.lineWidth = 1.2; ctx.stroke()
      })

      // House cusps
      if (showHousesRef.current) {
        ;[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].forEach((hd, i) => {
          const a = (hd - 90 + rot) * Math.PI / 180
          const ang = i % 3 === 0
          ctx.beginPath()
          ctx.moveTo(cx + R * .79 * Math.cos(a), cy + R * .79 * Math.sin(a))
          ctx.lineTo(cx + R * (ang ? .38 : .51) * Math.cos(a), cy + R * (ang ? .38 : .51) * Math.sin(a))
          ctx.strokeStyle = ang ? 'rgba(201,168,76,.65)' : 'rgba(201,168,76,.30)'
          ctx.lineWidth = ang ? 1.8 : .9; ctx.stroke()
          // House number
          const numA = ((i * 30) + 15 - 90 + rot) * Math.PI / 180
          const hr = R * .45
          ctx.font = `bold ${R * .058}px 'Cinzel',serif`
          ctx.fillStyle = ang ? 'rgba(201,168,76,.70)' : 'rgba(201,168,76,.45)'
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(i + 1, cx + hr * Math.cos(numA), cy + hr * Math.sin(numA))
        })
      }

      // Aspect lines
      if (showAspectsRef.current) {
        aspects.forEach(([a, b, type, alpha]) => {
          const pa = planets[a], pb = planets[b]
          const aa = (pa.d - 90 + rot) * Math.PI / 180
          const ab = (pb.d - 90 + rot) * Math.PI / 180
          const rA = R * .49
          const aspType = ASPECT_TYPES[type]
          ctx.beginPath()
          ctx.moveTo(cx + rA * Math.cos(aa), cy + rA * Math.sin(aa))
          ctx.lineTo(cx + rA * Math.cos(ab), cy + rA * Math.sin(ab))
          ctx.strokeStyle = aspType ? aspType.col + (alpha + 0.18) + ')' : `rgba(201,168,76,${alpha + 0.18})`
          ctx.lineWidth = 1.5; ctx.stroke()
          // Aspect symbol at midpoint
          const mx = (Math.cos(aa) + Math.cos(ab)) / 2
          const my = (Math.sin(aa) + Math.sin(ab)) / 2
          const mLen = Math.hypot(mx, my) || 1
          ctx.font = `bold ${R * .065}px serif`
          ctx.fillStyle = aspType ? aspType.col + (alpha + 0.35) + ')' : 'rgba(201,168,76,.60)'
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(type, cx + rA * .7 * mx / mLen, cy + rA * .7 * my / mLen)
        })
      }

      // Planets
      planets.forEach((p, i) => {
        const a = (p.d - 90 + rot) * Math.PI / 180
        const rp = R * p.r * .67
        const px2 = cx + rp * Math.cos(a), py2 = cy + rp * Math.sin(a)
        const isH = hov === i
        ctx.beginPath()
        ctx.moveTo(px2, py2)
        ctx.lineTo(cx + R * .63 * Math.cos(a), cy + R * .63 * Math.sin(a))
        ctx.strokeStyle = p.c + '66'; ctx.lineWidth = 1.1; ctx.stroke()
        if (isH) {
          const g = ctx.createRadialGradient(px2, py2, 0, px2, py2, R * .09)
          g.addColorStop(0, p.c + '66'); g.addColorStop(1, 'transparent')
          ctx.beginPath(); ctx.arc(px2, py2, R * .09, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
        }
        ctx.beginPath(); ctx.arc(px2, py2, R * .028, 0, Math.PI * 2); ctx.fillStyle = p.c; ctx.fill()
        ctx.font = `bold ${R * (isH ? .13 : .10)}px serif`; ctx.fillStyle = isH ? '#fff' : p.c
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(p.s, px2, py2 - R * .055)
        if (isH) {
          ctx.font = `bold ${R * .075}px 'Cinzel',serif`; ctx.fillStyle = 'rgba(201,168,76,.95)'
          ctx.textAlign = 'center'; ctx.fillText(p.n, cx, cy - R * .12)
          ctx.font = `${R * .055}px serif`; ctx.fillStyle = 'rgba(200,215,255,.90)'
          ctx.fillText(p.sign + ' ' + p.deg + ' \u00B7 H' + p.h, cx, cy + R * .02)
        }
      })

      // Center glow
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * .22)
      cg.addColorStop(0, 'rgba(201,168,76,.14)'); cg.addColorStop(1, 'rgba(1,1,10,0)')
      ctx.beginPath(); ctx.arc(cx, cy, R * .22, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill()
      ctx.font = `bold ${R * .15}px serif`; ctx.fillStyle = 'rgba(201,168,76,.65)'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('\u2652', cx, cy - R * .04)
      ctx.font = `bold ${R * .05}px 'Cinzel',serif`; ctx.fillStyle = 'rgba(201,168,76,.50)'
      ctx.fillText('AQUARIUS \u00B7 VIRGO ASC', cx, cy + R * .09)

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
