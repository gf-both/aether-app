import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'

const signs = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']
const scols = ['#e85555','#a08050','#7799dd','#66bbaa','#f0c040','#88aa77','#cc9966','#8b2244','#dd8833','#667788','#44aacc','#6699bb']
const elems = ['fire','earth','air','water','fire','earth','air','water','fire','earth','air','water']
const eBg = { fire: 'rgba(220,80,50,.1)', earth: 'rgba(120,100,60,.1)', air: 'rgba(100,160,220,.08)', water: 'rgba(60,150,170,.09)' }
const planets = [
  { s: '☉', d: 303, r: .67, c: '#f0c040', n: 'Sun', sign: 'Aquarius', deg: "3°44′", h: 5 },
  { s: '☽', d: 222, r: .63, c: '#d0d8f0', n: 'Moon', sign: 'Scorpio', deg: "12°22′", h: 2 },
  { s: '☿', d: 290, r: .71, c: '#99ccee', n: 'Mercury', sign: 'Capricorn', deg: "21°15′", h: 4 },
  { s: '♀', d: 318, r: .59, c: '#ddaa88', n: 'Venus', sign: 'Aquarius', deg: "18°55′", h: 5 },
  { s: '♂', d: 204, r: .65, c: '#ee6644', n: 'Mars', sign: 'Scorpio', deg: "24°07′", h: 2 },
  { s: '♃', d: 177, r: .69, c: '#e8cc50', n: 'Jupiter', sign: 'Libra', deg: "7°31′", h: 1 },
  { s: '♄', d: 158, r: .61, c: '#aabb88', n: 'Saturn', sign: 'Virgo', deg: "8°27′", h: 12 },
  { s: '♅', d: 227, r: .66, c: '#88ddcc', n: 'Uranus', sign: 'Scorpio', deg: "27°12′", h: 2 },
  { s: '♆', d: 270, r: .57, c: '#6699ee', n: 'Neptune', sign: 'Sagittarius', deg: "23°10′", h: 3 },
  { s: '♇', d: 198, r: .55, c: '#997799', n: 'Pluto', sign: 'Libra', deg: "24°01′", h: 1 },
  { s: 'AC', d: -90, r: .80, c: 'rgba(201,168,76,.85)', n: 'ASC', sign: 'Libra', deg: "0°00′", h: 1 },
]
const aspects = [[0,1,'△','rgba(255,220,80,.18)'],[0,4,'□','rgba(220,80,80,.16)'],[0,7,'☌','rgba(170,80,220,.14)'],[1,4,'☌','rgba(170,80,220,.16)'],[3,5,'△','rgba(255,220,80,.1)'],[0,5,'☍','rgba(120,160,255,.1)'],[6,7,'□','rgba(220,80,80,.09)']]

export default function NatalWheel() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(-1)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let rot = 0

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
        if (Math.hypot(mx - cx - rp * Math.cos(a), my - cy - rp * Math.sin(a)) < 12) hovRef.current = i
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
        ctx.strokeStyle = scols[i] + '44'; ctx.lineWidth = .5; ctx.stroke()
        const am = (i * 30 + 15 - 90 + rot) * Math.PI / 180
        const rG = R * .875
        ctx.font = `${R * .058}px serif`; ctx.fillStyle = scols[i]
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(signs[i], cx + rG * Math.cos(am), cy + rG * Math.sin(am))
        // Tick marks
        for (let d = 0; d < 30; d++) {
          const ta = (i * 30 + d - 90 + rot) * Math.PI / 180
          const t0 = d % 10 === 0 ? .977 : d % 5 === 0 ? .985 : .991
          ctx.beginPath()
          ctx.moveTo(cx + R * .97 * t0 * Math.cos(ta), cy + R * .97 * t0 * Math.sin(ta))
          ctx.lineTo(cx + R * .97 * Math.cos(ta), cy + R * .97 * Math.sin(ta))
          ctx.strokeStyle = d % 10 === 0 ? 'rgba(201,168,76,.4)' : 'rgba(201,168,76,.15)'
          ctx.lineWidth = d % 10 === 0 ? .7 : .3; ctx.stroke()
        }
      }

      // Concentric rings
      ;[.97, .79, .63, .51, .38].forEach((rf, i) => {
        ctx.beginPath(); ctx.arc(cx, cy, R * rf, 0, Math.PI * 2)
        ctx.strokeStyle = ['.28', '.2', '.13', '.09', '.06'].map(o => `rgba(201,168,76,${o})`)[i]
        ctx.lineWidth = .5; ctx.stroke()
      })

      // House cusps
      ;[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].forEach((hd, i) => {
        const a = (hd - 90 + rot) * Math.PI / 180
        const ang = i % 3 === 0
        ctx.beginPath()
        ctx.moveTo(cx + R * .79 * Math.cos(a), cy + R * .79 * Math.sin(a))
        ctx.lineTo(cx + R * (ang ? .38 : .51) * Math.cos(a), cy + R * (ang ? .38 : .51) * Math.sin(a))
        ctx.strokeStyle = ang ? 'rgba(201,168,76,.42)' : 'rgba(201,168,76,.13)'
        ctx.lineWidth = ang ? 1 : .35; ctx.stroke()
        if (ang) {
          ctx.font = `${R * .026}px 'Cinzel',serif`; ctx.fillStyle = 'rgba(201,168,76,.32)'
          const hr = R * .71; ctx.fillText(i / 3 + 1, cx + hr * Math.cos(a), cy + hr * Math.sin(a))
        }
      })

      // Aspect lines
      aspects.forEach(([a, b, type, col]) => {
        const pa = planets[a], pb = planets[b]
        const aa = (pa.d - 90 + rot) * Math.PI / 180
        const ab = (pb.d - 90 + rot) * Math.PI / 180
        const rA = R * .49
        ctx.beginPath()
        ctx.moveTo(cx + rA * Math.cos(aa), cy + rA * Math.sin(aa))
        ctx.lineTo(cx + rA * Math.cos(ab), cy + rA * Math.sin(ab))
        ctx.strokeStyle = col; ctx.lineWidth = .65; ctx.stroke()
      })

      // Planets
      planets.forEach((p, i) => {
        const a = (p.d - 90 + rot) * Math.PI / 180
        const rp = R * p.r * .67
        const px2 = cx + rp * Math.cos(a), py2 = cy + rp * Math.sin(a)
        const isH = hov === i
        ctx.beginPath()
        ctx.moveTo(px2, py2)
        ctx.lineTo(cx + R * .63 * Math.cos(a), cy + R * .63 * Math.sin(a))
        ctx.strokeStyle = p.c + '33'; ctx.lineWidth = .45; ctx.stroke()
        if (isH) {
          const g = ctx.createRadialGradient(px2, py2, 0, px2, py2, R * .052)
          g.addColorStop(0, p.c + '48'); g.addColorStop(1, 'transparent')
          ctx.beginPath(); ctx.arc(px2, py2, R * .052, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
        }
        ctx.beginPath(); ctx.arc(px2, py2, R * .012, 0, Math.PI * 2); ctx.fillStyle = p.c; ctx.fill()
        ctx.font = `${R * (isH ? .063 : .05)}px serif`; ctx.fillStyle = isH ? '#fff' : p.c
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(p.s, px2, py2 - R * .038)
        if (isH) {
          ctx.font = `${R * .034}px 'Cinzel',serif`; ctx.fillStyle = 'rgba(201,168,76,.9)'
          ctx.textAlign = 'center'; ctx.fillText(p.n, cx, cy - R * .07)
          ctx.font = `${R * .027}px serif`; ctx.fillStyle = 'rgba(200,215,255,.7)'
          ctx.fillText(p.sign + ' ' + p.deg, cx, cy + R * .01)
          ctx.fillStyle = 'rgba(201,168,76,.38)'; ctx.fillText('H' + p.h, cx, cy + R * .06)
        }
      })

      // Center glow
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * .19)
      cg.addColorStop(0, 'rgba(201,168,76,.11)'); cg.addColorStop(1, 'rgba(1,1,10,0)')
      ctx.beginPath(); ctx.arc(cx, cy, R * .19, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill()
      ctx.font = `bold ${R * .088}px serif`; ctx.fillStyle = 'rgba(201,168,76,.48)'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('♒', cx, cy - R * .03)
      ctx.font = `${R * .024}px 'Cinzel',serif`; ctx.fillStyle = 'rgba(201,168,76,.25)'
      ctx.fillText('AQUARIUS · LIBRA ASC', cx, cy + R * .062)

      ctx.restore()
      rot += .006
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
