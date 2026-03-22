/**
 * IntroAnimation.jsx
 * GOLEM opening sequence — cosmos to consciousness.
 * Solar system → iris → void → GOLEM wordmark.
 * Only shows on first visit (localStorage flag).
 * ~6 seconds. Skippable on click/tap.
 */

import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'golem_intro_seen'

// Orbital data: [radius, speed (deg/s), size, color]
const ORBITS = [
  { r: 60,  speed: 88,  size: 3,   color: '#b0b0c0' }, // Mercury
  { r: 95,  speed: 55,  size: 4,   color: '#e8c870' }, // Venus
  { r: 135, speed: 36,  size: 5,   color: '#5b9bd5' }, // Earth
  { r: 180, speed: 19,  size: 4,   color: '#c1440e' }, // Mars
  { r: 250, speed: 8,   size: 8,   color: '#c88b3a' }, // Jupiter
]

export default function IntroAnimation({ onComplete }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const [phase, setPhase] = useState('solar') // solar | zoom | iris | wordmark | done
  const [wordmarkChars, setWordmarkChars] = useState([])
  const [opacity, setOpacity] = useState(1)
  const phaseRef = useRef('solar')

  // Skip on click
  function skip() {
    localStorage.setItem(STORAGE_KEY, '1')
    cancelAnimationFrame(rafRef.current)
    setOpacity(0)
    setTimeout(onComplete, 400)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Star field
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2,
      a: Math.random() * 0.7 + 0.3,
    }))

    let angles = ORBITS.map(() => Math.random() * 360)
    let zoomScale = 1
    let irisOpacity = 0
    let solarOpacity = 1

    function drawStars(alpha = 1) {
      stars.forEach(s => {
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.a * alpha})`
        ctx.fill()
      })
    }

    function drawSolarSystem(cx, cy, scale, alpha) {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(cx, cy)
      ctx.scale(scale, scale)

      // Orbital paths
      ORBITS.forEach(o => {
        ctx.beginPath()
        ctx.arc(0, 0, o.r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      })

      // Sun
      const sunGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 28)
      sunGlow.addColorStop(0, 'rgba(255,220,80,1)')
      sunGlow.addColorStop(0.4, 'rgba(255,160,40,0.8)')
      sunGlow.addColorStop(1, 'rgba(255,100,0,0)')
      ctx.beginPath()
      ctx.arc(0, 0, 28, 0, Math.PI * 2)
      ctx.fillStyle = sunGlow
      ctx.fill()

      // Planets
      ORBITS.forEach((o, i) => {
        const rad = angles[i] * Math.PI / 180
        const px = Math.cos(rad) * o.r
        const py = Math.sin(rad) * o.r
        ctx.beginPath()
        ctx.arc(px, py, o.size / 2, 0, Math.PI * 2)
        ctx.fillStyle = o.color
        ctx.fill()
      })

      ctx.restore()
    }

    function drawIris(cx, cy, radius, alpha) {
      if (alpha <= 0) return
      ctx.save()
      ctx.globalAlpha = alpha

      // Outer iris ring
      const gradient = ctx.createRadialGradient(cx, cy, radius * 0.15, cx, cy, radius)
      gradient.addColorStop(0, 'rgba(0,0,0,1)')
      gradient.addColorStop(0.12, 'rgba(20,20,20,1)')
      gradient.addColorStop(0.15, 'rgba(60,60,60,1)')
      gradient.addColorStop(0.5, 'rgba(80,80,80,0.9)')
      gradient.addColorStop(0.85, 'rgba(40,40,40,0.8)')
      gradient.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Fibrous iris texture — radial lines
      const numFibers = 120
      for (let i = 0; i < numFibers; i++) {
        const angle = (i / numFibers) * Math.PI * 2
        const inner = radius * 0.18 + Math.random() * radius * 0.05
        const outer = radius * 0.75 + Math.random() * radius * 0.15
        const wobble = (Math.random() - 0.5) * 0.15

        ctx.beginPath()
        ctx.moveTo(
          cx + Math.cos(angle + wobble) * inner,
          cy + Math.sin(angle + wobble) * inner
        )
        ctx.lineTo(
          cx + Math.cos(angle) * outer,
          cy + Math.sin(angle) * outer
        )
        ctx.strokeStyle = `rgba(${100 + Math.random()*60},${100 + Math.random()*60},${100 + Math.random()*60},${0.3 + Math.random() * 0.4})`
        ctx.lineWidth = 0.4 + Math.random() * 0.6
        ctx.stroke()
      }

      // Pupil
      const pupilGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.15)
      pupilGrad.addColorStop(0, 'rgba(0,0,0,1)')
      pupilGrad.addColorStop(1, 'rgba(0,0,0,1)')
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 0.15, 0, Math.PI * 2)
      ctx.fillStyle = pupilGrad
      ctx.fill()

      ctx.restore()
    }

    function animate(ts) {
      if (!startRef.current) startRef.current = ts
      const elapsed = (ts - startRef.current) / 1000 // seconds

      const W = canvas.width
      const H = canvas.height
      const cx = W / 2
      const cy = H / 2

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)

      // Phase timing
      // 0.0-0.5s: fade in stars + solar
      // 0.5-3.0s: solar system animating
      // 3.0-4.5s: zoom into sun, iris fades in
      // 4.5-5.5s: iris fills screen, pupil expands
      // 5.5-6.5s: wordmark appears from void
      // 6.5s: complete

      const fadeIn = Math.min(1, elapsed / 0.5)
      drawStars(fadeIn * (elapsed < 3.5 ? 1 : Math.max(0, 1 - (elapsed - 3.5) / 0.8)))

      if (elapsed < 4.5) {
        // Rotate planets
        ORBITS.forEach((o, i) => {
          angles[i] = (angles[i] + o.speed * 0.016) % 360
        })

        // Solar system zoom
        let solarAlpha = fadeIn
        if (elapsed > 3.0) solarAlpha = Math.max(0, 1 - (elapsed - 3.0) / 1.2)
        const zoom = elapsed > 3.0 ? 1 + (elapsed - 3.0) * 0.8 : 1
        drawSolarSystem(cx, cy, zoom, solarAlpha)
      }

      if (elapsed > 3.2) {
        // Iris fade in
        const irisAlpha = Math.min(1, (elapsed - 3.2) / 1.0)
        const irisRadius = Math.min(W, H) * 0.28 + Math.max(0, (elapsed - 4.2) / 0.8) * Math.min(W, H) * 0.22
        drawIris(cx, cy, irisRadius, irisAlpha)
      }

      if (elapsed > 5.0) {
        // Pupil expands to fill screen
        const expandT = Math.min(1, (elapsed - 5.0) / 0.8)
        const voidR = Math.min(W, H) * 0.04 + expandT * Math.max(W, H) * 0.8
        ctx.beginPath()
        ctx.arc(cx, cy, voidR, 0, Math.PI * 2)
        ctx.fillStyle = '#000'
        ctx.fill()
      }

      if (elapsed > 5.6 && phaseRef.current !== 'wordmark' && phaseRef.current !== 'done') {
        phaseRef.current = 'wordmark'
        setPhase('wordmark')
        const letters = 'GOLEM'.split('')
        letters.forEach((l, i) => {
          setTimeout(() => {
            setWordmarkChars(prev => [...prev, l])
          }, i * 120)
        })
        setTimeout(() => {
          phaseRef.current = 'done'
          setPhase('done')
          localStorage.setItem(STORAGE_KEY, '1')
          setTimeout(() => {
            setOpacity(0)
            setTimeout(onComplete, 600)
          }, 800)
        }, 800 + letters.length * 120)
      }

      if (elapsed < 7.5) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div
      onClick={skip}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        cursor: 'pointer',
        transition: 'opacity 0.6s ease',
        opacity,
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* GOLEM wordmark */}
      {phase === 'wordmark' || phase === 'done' ? (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(48px, 10vw, 96px)',
            fontWeight: 700,
            letterSpacing: '0.3em',
            color: '#fff',
            textShadow: '0 0 40px rgba(255,255,255,0.4), 0 0 80px rgba(201,168,76,0.2)',
          }}>
            {wordmarkChars.map((l, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  animation: 'fadeUp 0.4s ease forwards',
                  animationDelay: `${i * 0.05}s`,
                  opacity: 0,
                }}
              >
                {l}
              </span>
            ))}
          </div>
          <div style={{
            marginTop: 12,
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(10px, 1.5vw, 14px)',
            letterSpacing: '0.4em',
            color: 'rgba(255,255,255,0.4)',
            opacity: phase === 'done' ? 1 : 0,
            transition: 'opacity 0.6s ease 0.4s',
          }}>
            KNOW THYSELF
          </div>
        </div>
      ) : null}

      {/* Skip hint */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        right: 32,
        fontSize: 11,
        letterSpacing: '0.15em',
        color: 'rgba(255,255,255,0.25)',
        fontFamily: 'sans-serif',
      }}>
        TAP TO SKIP
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
