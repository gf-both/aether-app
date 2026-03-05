import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'

const nums = [5, 7, 3, 11, 5, 4, 22, 9, 6, 2]
const labs = ['LP', 'Ex', 'SU', 'M11', 'BD', 'Mt', 'M22', 'Pe', 'P1', 'P2']
const cols = ['#c9a84c', '#4dccd8', '#c44d7a', '#a060e0', '#88cc55', '#e09040', '#7030b0', '#99ccee', '#ee6644', '#e8cc50']

export default function NumerologyBars() {
  const canvasRef = useRef(null)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let animId = null

    function draw() {
      const dpr = window.devicePixelRatio
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W === 0 || H === 0) return
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      const bw = W / nums.length, pad = 3
      nums.forEach((n, i) => {
        const maxN = 22, h = (n / maxN) * (H - 14), x = i * bw + pad, bWidth = bw - pad * 2
        const g = ctx.createLinearGradient(0, H - h, 0, H)
        g.addColorStop(0, cols[i] + 'ee'); g.addColorStop(1, cols[i] + '44')
        ctx.beginPath()
        if (ctx.roundRect) ctx.roundRect(x, H - h, bWidth, h, 2.5)
        else ctx.rect(x, H - h, bWidth, h)
        ctx.fillStyle = g; ctx.fill()
        ctx.font = '6.5px Inconsolata,monospace'; ctx.fillStyle = cols[i]
        ctx.textAlign = 'center'; ctx.fillText(n, i * bw + bw / 2, H - h - 2)
        ctx.fillStyle = 'rgba(100,110,150,.45)'; ctx.fillText(labs[i], i * bw + bw / 2, H - 1)
      })
      ctx.restore()
    }

    // Draw once and on resize
    const ro = new ResizeObserver(() => draw())
    ro.observe(canvas)
    draw()
    return () => { ro.disconnect() }
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '50px', flexShrink: 0, borderRadius: '7px' }} />
}
