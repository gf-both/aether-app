import { useEffect, useRef } from 'react'

export default function Starfield() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const cv = canvasRef.current
    const ctx = cv.getContext('2d')
    let stars = []
    let fr = 0
    let animId = null

    function resize() {
      cv.width = window.innerWidth
      cv.height = window.innerHeight
      stars = []
      const count = Math.floor(window.innerWidth * window.innerHeight / 3500)
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * .8 + .1,
          o: Math.random() * .6 + .1,
          sp: Math.random() * .005 + .001,
          ph: Math.random() * Math.PI * 2,
          warm: Math.random() < .07,
        })
      }
    }

    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height)
      fr += .01
      stars.forEach(s => {
        const o = s.o * (0.35 + 0.65 * Math.sin(fr * 18 * s.sp + s.ph))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = s.warm ? `rgba(255,220,180,${o})` : `rgba(190,210,255,${o})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    resize()
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      if (animId) cancelAnimationFrame(animId)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}
