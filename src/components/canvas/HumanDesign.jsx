import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { CENTERS, CHANNELS, GATES } from '../../data/hdData'

export default function HumanDesign() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    function drawCenter(ctx, name, xf, yf, shape, defined, cB, W, H, sz, pulse) {
      const x = xf * W, y = yf * H, r = sz
      const glow = defined ? (.22 + .07 * Math.sin(pulse)) : 0
      ctx.save()
      if (defined) {
        const aura = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2)
        aura.addColorStop(0, cB + (glow * .75) + ')'); aura.addColorStop(1, cB + '0)')
        ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, Math.PI * 2); ctx.fillStyle = aura; ctx.fill()
      }
      ctx.beginPath()
      if (shape === 'tri_up') { ctx.moveTo(x, y - r * 1.28); ctx.lineTo(x + r * 1.18, y + r * .78); ctx.lineTo(x - r * 1.18, y + r * .78); ctx.closePath() }
      else if (shape === 'tri_down') { ctx.moveTo(x, y + r * 1.28); ctx.lineTo(x + r * 1.18, y - r * .78); ctx.lineTo(x - r * 1.18, y - r * .78); ctx.closePath() }
      else if (shape === 'diamond') { ctx.moveTo(x, y - r * 1.32); ctx.lineTo(x + r * 1.32, y); ctx.lineTo(x, y + r * 1.32); ctx.lineTo(x - r * 1.32, y); ctx.closePath() }
      else if (shape === 'rect') { ctx.roundRect(x - r * 1.3, y - r * .82, r * 2.6, r * 1.64, r * .22) }
      else if (shape === 'tri_left') { ctx.moveTo(x - r * 1.28, y); ctx.lineTo(x + r * .78, y - r * 1.18); ctx.lineTo(x + r * .78, y + r * 1.18); ctx.closePath() }
      else if (shape === 'tri_right') { ctx.moveTo(x + r * 1.28, y); ctx.lineTo(x - r * .78, y - r * 1.18); ctx.lineTo(x - r * .78, y + r * 1.18); ctx.closePath() }
      if (defined) {
        const fg = ctx.createRadialGradient(x, y, 0, x, y, r * 1.1)
        fg.addColorStop(0, cB + '0.52)'); fg.addColorStop(1, cB + '0.18)')
        ctx.fillStyle = fg; ctx.fill(); ctx.strokeStyle = cB + (0.68 + glow * .25) + ')'
      } else {
        ctx.fillStyle = 'rgba(28,34,68,.22)'; ctx.fill(); ctx.strokeStyle = 'rgba(75,85,135,.3)'
      }
      ctx.lineWidth = defined ? 1.4 : .6; ctx.stroke()
      ctx.font = `${Math.max(7, sz * .5)}px 'Cinzel',serif`
      ctx.fillStyle = defined ? cB + (0.82 + glow * .12) + ')' : 'rgba(75,85,135,.38)'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(name, x, y)
      ctx.restore()
    }

    function draw() {
      const dpr = window.devicePixelRatio
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W === 0 || H === 0) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      pulse += .022
      const sz = Math.min(W, H) * .062

      // Channels
      CHANNELS.forEach(([ai, bi, def]) => {
        const cA = CENTERS[ai], cB = CENTERS[bi]
        ctx.beginPath(); ctx.moveTo(cA.xf * W, cA.yf * H); ctx.lineTo(cB.xf * W, cB.yf * H)
        ctx.strokeStyle = def ? `rgba(80,80,200,${.58 + .09 * Math.sin(pulse)})` : 'rgba(65,75,125,.18)'
        ctx.lineWidth = def ? 2.8 : 1; ctx.stroke()
      })

      // Gates
      GATES.forEach(({ x, y, g }) => {
        ctx.font = "6.5px 'Inconsolata',monospace"; ctx.fillStyle = 'rgba(201,168,76,.38)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(g, x * W, y * H)
      })

      // Centers
      CENTERS.forEach(c => drawCenter(ctx, c.name, c.xf, c.yf, c.shape, c.defined, c.col, W, H, sz, pulse))

      // Bottom label
      ctx.font = `bold ${W * .024}px 'Cinzel',serif`; ctx.fillStyle = 'rgba(64,204,221,.65)'
      ctx.textAlign = 'center'; ctx.fillText('5 / 1 · PROJECTOR', W * .5, H * .93)

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
