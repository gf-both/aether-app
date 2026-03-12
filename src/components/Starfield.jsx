import { useRef, useEffect } from 'react'

/**
 * Animated starfield background with floating golden particles.
 * Renders behind everything via position:fixed + z-index:0.
 */
export default function Starfield() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let stars = []
    const STAR_COUNT = 180
    const TWINKLE_COUNT = 40

    function resize() {
      canvas.width = window.innerWidth * devicePixelRatio
      canvas.height = window.innerHeight * devicePixelRatio
      canvas.style.width = '100vw'
      canvas.style.height = '100vh'
      init()
    }

    function init() {
      stars = []
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.2 + 0.3,
          alpha: Math.random() * 0.5 + 0.15,
          drift: (Math.random() - 0.5) * 0.08,
          fall: Math.random() * 0.12 + 0.02,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.003 + 0.001,
          // Color: mostly warm gold/white, some silver
          hue: Math.random() > 0.3 ? 38 + Math.random() * 20 : 220 + Math.random() * 30,
          sat: Math.random() > 0.3 ? 60 + Math.random() * 30 : 20 + Math.random() * 20,
        })
      }
      // Add a few larger "twinkle" stars
      for (let i = 0; i < TWINKLE_COUNT; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.8 + 0.8,
          alpha: Math.random() * 0.3 + 0.1,
          drift: (Math.random() - 0.5) * 0.04,
          fall: Math.random() * 0.06 + 0.01,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.008 + 0.003,
          hue: 38 + Math.random() * 15,
          sat: 70,
          twinkle: true,
        })
      }
    }

    let t = 0
    function draw() {
      t++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const s of stars) {
        // Animate
        s.x += s.drift
        s.y += s.fall
        if (s.y > canvas.height + 4) { s.y = -4; s.x = Math.random() * canvas.width }
        if (s.x < -4) s.x = canvas.width + 4
        if (s.x > canvas.width + 4) s.x = -4

        const twinkle = Math.sin(t * s.speed + s.phase)
        const a = s.alpha + twinkle * (s.twinkle ? 0.2 : 0.1)
        if (a <= 0) continue

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * devicePixelRatio, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${s.hue},${s.sat}%,${s.twinkle ? 85 : 75}%,${Math.max(0, a)})`
        ctx.fill()

        // Glow for twinkle stars
        if (s.twinkle && a > 0.15) {
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r * devicePixelRatio * 3, 0, Math.PI * 2)
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * devicePixelRatio * 3)
          g.addColorStop(0, `hsla(${s.hue},${s.sat}%,80%,${a * 0.35})`)
          g.addColorStop(1, 'transparent')
          ctx.fillStyle = g
          ctx.fill()
        }
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    />
  )
}
