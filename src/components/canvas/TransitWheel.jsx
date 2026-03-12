import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'

const signs = ['\u2648','\u2649','\u264A','\u264B','\u264C','\u264D','\u264E','\u264F','\u2650','\u2651','\u2652','\u2653']
const scols = ['#e85555','#a08050','#7799dd','#66bbaa','#f0c040','#88aa77','#cc9966','#8b2244','#dd8833','#667788','#44aacc','#6699bb']
const elems = ['fire','earth','air','water','fire','earth','air','water','fire','earth','air','water']
const eBg = { fire: 'rgba(220,80,50,.08)', earth: 'rgba(120,100,60,.08)', air: 'rgba(100,160,220,.06)', water: 'rgba(60,150,170,.07)' }

// Natal planet positions (corrected astro.com data)
const natal = [
  { s: '\u2609', d: 303, c: '#f0c040', n: 'Sun' },
  { s: '\u263D', d: 168, c: '#d0d8f0', n: 'Moon' },
  { s: '\u263F', d: 291, c: '#99ccee', n: 'Mercury' },
  { s: '\u2640', d: 319, c: '#ddaa88', n: 'Venus' },
  { s: '\u2642', d: 204, c: '#ee6644', n: 'Mars' },
  { s: '\u2643', d: 190, c: '#e8cc50', n: 'Jupiter' },
  { s: '\u2644', d: 158, c: '#aabb88', n: 'Saturn' },
  { s: '\u2645', d: 239, c: '#88ddcc', n: 'Uranus' },
  { s: '\u2646', d: 264, c: '#6699ee', n: 'Neptune' },
  { s: '\u2647', d: 204, c: '#997799', n: 'Pluto' },
]

// Current transit positions (Mar 5 2026)
const transits = [
  { s: '\u2609', d: 344, c: '#f0c040', n: 'T.Sun', sign: 'Pisces 13\u00B047\u2032' },
  { s: '\u263D', d: 178, c: '#d0d8f0', n: 'T.Moon', sign: 'Virgo 28\u00B012\u2032' },
  { s: '\u263F', d: 307, c: '#99ccee', n: 'T.Mercury', sign: 'Aquarius 7\u00B003\u2032' },
  { s: '\u2640', d: 3, c: '#ddaa88', n: 'T.Venus', sign: 'Aries 2\u00B055\u2032' },
  { s: '\u2642', d: 111, c: '#ee6644', n: 'T.Mars', sign: 'Cancer 21\u00B018\u2032' },
  { s: '\u2643', d: 75, c: '#e8cc50', n: 'T.Jupiter', sign: 'Gemini 14\u00B044\u2032' },
  { s: '\u2644', d: 360, c: '#aabb88', n: 'T.Saturn', sign: 'Pisces 29\u00B058\u2032' },
  { s: '\u2645', d: 54, c: '#88ddcc', n: 'T.Uranus', sign: 'Taurus 24\u00B011\u2032' },
  { s: '\u2646', d: 3, c: '#6699ee', n: 'T.Neptune', sign: 'Aries 3\u00B022\u2032' },
  { s: '\u2647', d: 305, c: '#997799', n: 'T.Pluto', sign: 'Aquarius 5\u00B007\u2032' },
]

// Transit-to-natal aspect lines
const transitAspects = [
  { ti: 0, ni: 1, type: 'trine', col: 'rgba(64,204,221,' },  // T.Sun trine N.Moon
  { ti: 1, ni: 0, type: 'opp', col: 'rgba(238,68,102,' },     // T.Moon opp N.Sun
  { ti: 3, ni: 4, type: 'opp', col: 'rgba(238,68,102,' },     // T.Venus opp N.Mars
  { ti: 4, ni: 0, type: 'trine', col: 'rgba(64,204,221,' },   // T.Mars trine N.Sun (approx)
  { ti: 9, ni: 0, type: 'conj', col: 'rgba(144,80,224,' },    // T.Pluto conj N.Sun
  { ti: 8, ni: 8, type: 'square', col: 'rgba(102,153,238,' }, // T.Neptune sq N.Neptune
]

export default function TransitWheel() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef({ ring: null, idx: -1 })

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Fixed rotation: ASC (168°) placed at LEFT (180° canvas)
    // (168 - 90 + rot) = 180 → rot = 102
    const rot = 102

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left, my = e.clientY - rect.top
      const dpr = window.devicePixelRatio
      const cx = canvas.width / dpr / 2, cy = canvas.height / dpr / 2
      const R = Math.min(cx, cy) * .96
      hovRef.current = { ring: null, idx: -1 }

      // Check transit planets (outer ring)
      transits.forEach((p, i) => {
        const a = (p.d - 90 + rot) * Math.PI / 180
        const rp = R * .88
        if (Math.hypot(mx - cx - rp * Math.cos(a), my - cy - rp * Math.sin(a)) < 16) {
          hovRef.current = { ring: 'transit', idx: i }
        }
      })
      // Check natal planets (inner ring)
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

      // Background
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R)
      bg.addColorStop(0, 'rgba(20,10,50,.35)'); bg.addColorStop(1, 'rgba(1,1,10,.08)')
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill()

      // Zodiac sign ring (outer)
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

      // Concentric rings
      ;[.97, .82, .72, .42, .20].forEach((rf, i) => {
        ctx.beginPath(); ctx.arc(cx, cy, R * rf, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(201,168,76,${[.40, .32, .24, .18, .12][i]})`
        ctx.lineWidth = 1.2; ctx.stroke()
      })

      // Transit-to-natal aspect lines
      transitAspects.forEach(({ ti, ni, col }) => {
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

      // Transit planets (outer ring between zodiac and natal)
      transits.forEach((p, i) => {
        const a = (p.d - 90 + rot) * Math.PI / 180
        const rp = R * .77
        const px2 = cx + rp * Math.cos(a), py2 = cy + rp * Math.sin(a)
        const isH = hov.ring === 'transit' && hov.idx === i

        // Connecting line to edge
        ctx.beginPath()
        ctx.moveTo(px2, py2)
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
          ctx.fillText(p.sign, cx, cy - R * .03)
        }
      })

      // "TRANSITS" label on outer ring
      ctx.font = `bold ${R * .045}px 'Cinzel',serif`; ctx.fillStyle = 'rgba(64,204,221,.55)'
      ctx.textAlign = 'center'; ctx.fillText('TRANSITS', cx + R * .77, cy - R * .68)

      // Natal planets (inner ring)
      natal.forEach((p, i) => {
        const a = (p.d - 90 + rot) * Math.PI / 180
        const rp = R * .55
        const px2 = cx + rp * Math.cos(a), py2 = cy + rp * Math.sin(a)
        const isH = hov.ring === 'natal' && hov.idx === i

        ctx.beginPath()
        ctx.moveTo(px2, py2)
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

      // "NATAL" label
      ctx.font = `bold ${R * .045}px 'Cinzel',serif`; ctx.fillStyle = 'rgba(201,168,76,.50)'
      ctx.textAlign = 'center'; ctx.fillText('NATAL', cx - R * .55, cy - R * .42)

      // Center
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
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
