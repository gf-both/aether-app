import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'

export default function SynastryWheel({ mode = 'romantic', nameA = 'A', nameB = 'B' }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let rot = 0
    const colA = 'rgba(201,168,76,'
    const colB = mode === 'romantic' ? 'rgba(212,48,112,' : 'rgba(64,204,221,'
    const planetsA = [0, 30, 75, 140, 200, 260, 310, 350]
    const planetsB = [15, 55, 110, 170, 225, 280, 320, 5]
    const syms = ['☉', '☽', '☿', '♀', '♂', '♃', '♄', '♅']

    function draw() {
      const dpr = window.devicePixelRatio
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W === 0 || H === 0) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const cx = W / 2, cy = H / 2, R = Math.min(cx, cy) * .92
      ctx.clearRect(0, 0, W, H)

      // Background
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R)
      bg.addColorStop(0, 'rgba(15,8,40,.6)'); bg.addColorStop(1, 'rgba(1,1,10,.1)')
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill()

      // Rings
      ;[.95, .78, .6, .42].forEach((rf, i) => {
        ctx.beginPath(); ctx.arc(cx, cy, R * rf, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(201,168,76,${[.2, .15, .1, .07][i]})`; ctx.lineWidth = .5; ctx.stroke()
      })

      // Sign segments
      for (let i = 0; i < 12; i++) {
        const a0 = (i * 30 - 90 + rot) * Math.PI / 180
        const a1 = ((i + 1) * 30 - 90 + rot) * Math.PI / 180
        ctx.beginPath(); ctx.arc(cx, cy, R * .95, a0, a1); ctx.arc(cx, cy, R * .78, a1, a0, true); ctx.closePath()
        ctx.strokeStyle = `rgba(201,168,76,${i % 2 === 0 ? .08 : .04})`; ctx.lineWidth = .4; ctx.stroke()
        const am = (i * 30 + 15 - 90 + rot) * Math.PI / 180
        ctx.font = `${R * .055}px serif`; ctx.fillStyle = 'rgba(201,168,76,.25)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'][i], cx + R * .865 * Math.cos(am), cy + R * .865 * Math.sin(am))
      }

      // A planets (outer)
      planetsA.forEach((d, i) => {
        const a = (d - 90 + rot) * Math.PI / 180, rp = R * .68
        ctx.beginPath(); ctx.arc(cx + rp * Math.cos(a), cy + rp * Math.sin(a), R * .018, 0, Math.PI * 2)
        ctx.fillStyle = colA + '0.8)'; ctx.fill()
        ctx.font = `${R * .05}px serif`; ctx.fillStyle = colA + '0.9)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(syms[i], cx + rp * Math.cos(a), cy + rp * Math.sin(a) - R * .038)
      })

      // B planets (inner)
      planetsB.forEach((d, i) => {
        const a = (d - 90 + rot) * Math.PI / 180, rp = R * .5
        ctx.beginPath(); ctx.arc(cx + rp * Math.cos(a), cy + rp * Math.sin(a), R * .018, 0, Math.PI * 2)
        ctx.fillStyle = colB + '0.8)'; ctx.fill()
        ctx.font = `${R * .05}px serif`; ctx.fillStyle = colB + '0.9)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(syms[i], cx + rp * Math.cos(a), cy + rp * Math.sin(a) - R * .038)
      })

      // Aspect lines
      const aspectPairs = mode === 'romantic' ? [[0,1],[1,2],[2,4],[3,0],[4,3],[5,6]] : [[0,0],[1,1],[2,3],[3,5],[4,2]]
      aspectPairs.forEach(([ai, bi]) => {
        const aa = (planetsA[ai] - 90 + rot) * Math.PI / 180
        const ab = (planetsB[bi] - 90 + rot) * Math.PI / 180
        const rpA = R * .68, rpB = R * .5
        ctx.beginPath()
        ctx.moveTo(cx + rpA * Math.cos(aa), cy + rpA * Math.sin(aa))
        ctx.lineTo(cx + rpB * Math.cos(ab), cy + rpB * Math.sin(ab))
        ctx.strokeStyle = mode === 'romantic' ? 'rgba(212,48,112,.2)' : 'rgba(64,204,221,.18)'
        ctx.lineWidth = .7; ctx.stroke()
      })

      // Center labels
      ctx.font = `bold ${R * .075}px serif`; ctx.fillStyle = colA + '0.6)'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(nameA[0], cx - R * .1, cy)
      ctx.font = `${R * .04}px 'Cinzel',serif`; ctx.fillStyle = 'rgba(201,168,76,.25)'
      ctx.fillText('\u2295', cx, cy)
      ctx.font = `bold ${R * .075}px serif`; ctx.fillStyle = colB + '0.6)'
      ctx.fillText(nameB[0], cx + R * .1, cy)

      ctx.restore()
      rot += .004
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [mode, nameA, nameB])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
