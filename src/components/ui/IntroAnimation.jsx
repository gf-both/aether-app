/**
 * IntroAnimation.jsx
 * GOLEM opening sequence — the deeper truth.
 *
 * Phase 1: Textbook solar system (flat circular orbits, top-down)
 * Phase 2: THE REVEAL — transforms into helical vortex model
 *           Sun moves through space, planets spiral behind it
 * Phase 3: Zoom into the sun surface
 * Phase 4: Cross-dissolve → iris (fibrous, detailed)
 * Phase 5: Pupil expands to fill screen → void
 * Phase 6: GOLEM wordmark rises from the void
 *
 * "Nos enseñaron un modelo falso" — so did every self-knowledge system.
 * GOLEM shows you the real one.
 *
 * Only shows on first visit. Tap anywhere to skip.
 */

import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'golem_intro_seen_v2'

// Orbital periods relative to Earth (smaller = faster)
const PLANETS = [
  { name: 'Mercury', r: 55,  period: 0.24, size: 2.5, color: '#aaaaaa' },
  { name: 'Venus',   r: 80,  period: 0.62, size: 3.5, color: '#e8d070' },
  { name: 'Earth',   r: 110, period: 1.00, size: 4,   color: '#4a8fd4' },
  { name: 'Mars',    r: 148, period: 1.88, size: 3,   color: '#c1440e' },
  { name: 'Jupiter', r: 210, period: 11.9, size: 9,   color: '#c88b3a' },
  { name: 'Saturn',  r: 275, period: 29.5, size: 7,   color: '#e2c97e' },
]

export default function IntroAnimation({ onComplete }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const [phase, setPhase] = useState('running')
  const [wordmarkChars, setWordmarkChars] = useState([])
  const [containerOpacity, setContainerOpacity] = useState(1)
  const phaseRef = useRef('running')
  const wordmarkTriggered = useRef(false)

  function skip() {
    localStorage.setItem(STORAGE_KEY, '1')
    cancelAnimationFrame(rafRef.current)
    setContainerOpacity(0)
    setTimeout(onComplete, 500)
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

    // Star field — fixed positions
    const stars = Array.from({ length: 280 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.3,
      a: Math.random() * 0.6 + 0.2,
    }))

    // Planet angles start spread out
    const angles = PLANETS.map((_, i) => (i / PLANETS.length) * Math.PI * 2)

    function drawStars(alpha) {
      const W = canvas.width, H = canvas.height
      stars.forEach(s => {
        ctx.beginPath()
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.a * alpha})`
        ctx.fill()
      })
    }

    function drawSun(cx, cy, size, glowAlpha = 1) {
      // Outer corona glow
      const corona = ctx.createRadialGradient(cx, cy, size * 0.5, cx, cy, size * 3.5)
      corona.addColorStop(0, `rgba(255,180,40,${0.35 * glowAlpha})`)
      corona.addColorStop(0.5, `rgba(255,120,0,${0.1 * glowAlpha})`)
      corona.addColorStop(1, `rgba(255,80,0,0)`)
      ctx.beginPath()
      ctx.arc(cx, cy, size * 3.5, 0, Math.PI * 2)
      ctx.fillStyle = corona
      ctx.fill()

      // Sun body
      const sunGrad = ctx.createRadialGradient(cx - size * 0.2, cy - size * 0.2, 0, cx, cy, size)
      sunGrad.addColorStop(0, '#fff8e0')
      sunGrad.addColorStop(0.3, '#ffe060')
      sunGrad.addColorStop(0.7, '#ffaa20')
      sunGrad.addColorStop(1, '#ff6000')
      ctx.beginPath()
      ctx.arc(cx, cy, size, 0, Math.PI * 2)
      ctx.fillStyle = sunGrad
      ctx.fill()
    }

    // ── PHASE 1: Flat circular solar system (top-down) ──────────────────────
    function drawFlatSystem(cx, cy, alpha, t) {
      ctx.save()
      ctx.globalAlpha = alpha

      // Orbital rings
      PLANETS.forEach(p => {
        ctx.beginPath()
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.07)'
        ctx.lineWidth = 0.6
        ctx.stroke()
      })

      // Sun
      drawSun(cx, cy, 18, alpha)

      // Planets on circular orbits
      PLANETS.forEach((p, i) => {
        const speed = (2 * Math.PI) / (p.period * 8)  // compress time
        const angle = angles[i] + t * speed
        const px = cx + Math.cos(angle) * p.r
        const py = cy + Math.sin(angle) * p.r
        ctx.beginPath()
        ctx.arc(px, py, p.size / 2, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
        // Small glow
        const g = ctx.createRadialGradient(px, py, 0, px, py, p.size)
        g.addColorStop(0, p.color + 'aa')
        g.addColorStop(1, p.color + '00')
        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      })

      ctx.restore()
    }

    // ── PHASE 2: Helical vortex model ───────────────────────────────────────
    // Sun moves through space (left to right at an angle, tilted ~30° to ecliptic)
    // Planets spiral behind it — the real solar system motion
    function drawHelicalSystem(cx, cy, alpha, t, progress) {
      ctx.save()
      ctx.globalAlpha = alpha

      const sunSpeed = 220     // px per "second" of animation time — the sun's velocity
      const helixLen = 600     // total trail length visible
      const tiltAngle = -0.28  // ~16° tilt (ecliptic to galactic plane approximation)

      // Sun current position — moves diagonally across screen
      const sunX = cx - 200 + progress * sunSpeed
      const sunY = cy + Math.sin(tiltAngle) * (progress * sunSpeed)

      // Draw the path of the sun (galactic direction)
      ctx.save()
      ctx.beginPath()
      const pathStart = sunX - helixLen
      const pathStartY = sunY - Math.sin(tiltAngle) * helixLen
      ctx.moveTo(pathStart, pathStartY)
      ctx.lineTo(sunX + 80, sunY + Math.sin(tiltAngle) * 80)
      ctx.strokeStyle = 'rgba(255,200,80,0.12)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 8])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()

      // Draw planetary helical trails
      PLANETS.forEach((p, i) => {
        const orbitalPeriod = p.period * 2.5  // in animation-seconds

        // Draw helix trail for each planet
        ctx.beginPath()
        let first = true
        const trailPoints = 180

        for (let step = 0; step <= trailPoints; step++) {
          // Past positions: step=0 is furthest back, step=trailPoints is current
          const frac = step / trailPoints
          const pastProgress = progress - (1 - frac) * 1.2

          // Sun position at that past time
          const pastSunX = cx - 200 + pastProgress * sunSpeed
          const pastSunY = cy + Math.sin(tiltAngle) * (pastProgress * sunSpeed)

          // Planet's orbital angle at that past time
          const orbitalAngle = angles[i] + pastProgress * (2 * Math.PI / orbitalPeriod)

          // Rotate orbit to be roughly perpendicular to sun's direction
          // Planet spirals in a plane tilted ~60° to our view
          const cosA = Math.cos(orbitalAngle) * p.r
          const sinA = Math.sin(orbitalAngle) * p.r * 0.35  // foreshortening = perspective

          const px = pastSunX + cosA
          const py = pastSunY + sinA

          const trailAlpha = frac * 0.6

          if (first) {
            ctx.moveTo(px, py)
            first = false
          } else {
            ctx.lineTo(px, py)
          }
        }

        ctx.strokeStyle = `rgba(${hexToRgb(p.color)},0.25)`
        ctx.lineWidth = 0.8
        ctx.stroke()

        // Current planet dot
        const curAngle = angles[i] + progress * (2 * Math.PI / orbitalPeriod)
        const cpx = sunX + Math.cos(curAngle) * p.r
        const cpy = sunY + Math.sin(curAngle) * p.r * 0.35
        ctx.beginPath()
        ctx.arc(cpx, cpy, p.size / 2, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
      })

      // Draw the Sun in its current position
      drawSun(sunX, sunY, 16, alpha)

      ctx.restore()
    }

    function hexToRgb(hex) {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `${r},${g},${b}`
    }

    // ── PHASE 3: Iris ────────────────────────────────────────────────────────
    // Pre-generate iris fibers (consistent, not random each frame)
    const irisFibers = Array.from({ length: 160 }, () => ({
      angle: Math.random() * Math.PI * 2,
      innerFrac: 0.17 + Math.random() * 0.06,
      outerFrac: 0.7 + Math.random() * 0.25,
      wobble: (Math.random() - 0.5) * 0.12,
      r: 90 + Math.random() * 70,
      g: 90 + Math.random() * 70,
      b: 90 + Math.random() * 70,
      alpha: 0.25 + Math.random() * 0.45,
      width: 0.3 + Math.random() * 0.7,
    }))

    function drawIris(cx, cy, radius, alpha) {
      if (alpha <= 0 || radius <= 0) return
      ctx.save()
      ctx.globalAlpha = alpha

      // Base iris
      const base = ctx.createRadialGradient(cx, cy, radius * 0.15, cx, cy, radius)
      base.addColorStop(0, 'rgba(0,0,0,1)')
      base.addColorStop(0.13, 'rgba(15,15,15,1)')
      base.addColorStop(0.18, 'rgba(55,55,55,1)')
      base.addColorStop(0.55, 'rgba(75,75,75,0.95)')
      base.addColorStop(0.88, 'rgba(35,35,35,0.9)')
      base.addColorStop(1, 'rgba(0,0,0,0.7)')
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fillStyle = base
      ctx.fill()

      // Fibrous texture
      irisFibers.forEach(f => {
        const inner = radius * f.innerFrac
        const outer = radius * f.outerFrac
        ctx.beginPath()
        ctx.moveTo(
          cx + Math.cos(f.angle + f.wobble) * inner,
          cy + Math.sin(f.angle + f.wobble) * inner
        )
        ctx.lineTo(
          cx + Math.cos(f.angle) * outer,
          cy + Math.sin(f.angle) * outer
        )
        ctx.strokeStyle = `rgba(${f.r},${f.g},${f.b},${f.alpha})`
        ctx.lineWidth = f.width
        ctx.stroke()
      })

      // Pupil
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 0.155, 0, Math.PI * 2)
      ctx.fillStyle = '#000'
      ctx.fill()

      // Subtle limbal ring
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 0.97, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(0,0,0,0.8)'
      ctx.lineWidth = radius * 0.06
      ctx.stroke()

      ctx.restore()
    }

    // ── Main animation loop ──────────────────────────────────────────────────
    function animate(ts) {
      if (!startRef.current) startRef.current = ts
      const t = (ts - startRef.current) / 1000  // seconds elapsed

      const W = canvas.width
      const H = canvas.height
      const cx = W / 2
      const cy = H / 2

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)

      // ── Timeline ──────────────────────────────────────────
      // 0.0 - 0.6  : fade in stars + flat system
      // 0.6 - 2.8  : flat circular system animating
      // 2.8 - 3.4  : transition: flat fades, helix fades in
      // 3.4 - 6.0  : helical vortex animating, sun moving
      // 6.0 - 7.2  : zoom toward sun, helix fades, sun fills
      // 7.2 - 8.4  : iris cross-dissolve
      // 8.4 - 9.6  : iris fills screen, pupil expands
      // 9.6 - 10.0 : pure void
      // 10.0+      : wordmark

      const fadeIn = Math.min(1, t / 0.6)

      // Star visibility
      let starAlpha = fadeIn
      if (t > 6.5) starAlpha *= Math.max(0, 1 - (t - 6.5) / 0.8)
      drawStars(starAlpha)

      // ── Flat system ──
      if (t < 3.8) {
        let flatAlpha = fadeIn
        if (t > 2.8) flatAlpha = Math.max(0, 1 - (t - 2.8) / 0.7)
        if (flatAlpha > 0) drawFlatSystem(cx, cy, flatAlpha, t)
      }

      // ── Helical system ──
      if (t > 2.6 && t < 7.5) {
        const helixFadeIn = Math.min(1, (t - 2.6) / 0.9)
        let helixAlpha = helixFadeIn
        if (t > 6.2) helixAlpha = Math.max(0, 1 - (t - 6.2) / 0.9)
        const helixProgress = Math.max(0, t - 3.4) * 0.18  // controls sun movement speed
        if (helixAlpha > 0) drawHelicalSystem(cx, cy, helixAlpha, t, helixProgress)
      }

      // ── Sun zoom (fills screen) ──
      if (t > 6.0 && t < 8.4) {
        const zoomT = Math.min(1, (t - 6.0) / 1.4)
        const sunSize = 16 + zoomT * Math.max(W, H) * 0.65
        const sunAlpha = Math.min(1, zoomT * 2) * Math.max(0, 1 - (t - 7.4) / 0.8)
        if (sunAlpha > 0) {
          // Sun zooming from moving position back to center
          const sunX = cx + (1 - zoomT) * 80  // drifts back to center
          const sunY = cy + (1 - zoomT) * -20
          drawSun(sunX, sunY, sunSize, sunAlpha)
        }
      }

      // ── Iris ──
      if (t > 7.0) {
        const irisFadeIn = Math.min(1, (t - 7.0) / 0.9)
        const irisBaseR = Math.min(W, H) * 0.3
        const irisGrow = t > 8.2 ? Math.min(1, (t - 8.2) / 0.9) : 0
        const irisR = irisBaseR + irisGrow * Math.min(W, H) * 0.25
        drawIris(cx, cy, irisR, irisFadeIn)
      }

      // ── Pupil expands to void ──
      if (t > 9.0) {
        const voidT = Math.min(1, (t - 9.0) / 0.8)
        const voidR = Math.min(W, H) * 0.045 + voidT * Math.max(W, H) * 1.1
        ctx.beginPath()
        ctx.arc(cx, cy, voidR, 0, Math.PI * 2)
        ctx.fillStyle = '#000'
        ctx.fill()
      }

      // ── Trigger wordmark ──
      if (t > 10.0 && !wordmarkTriggered.current) {
        wordmarkTriggered.current = true
        setPhase('wordmark')
        const letters = 'GOLEM'.split('')
        letters.forEach((l, i) => {
          setTimeout(() => setWordmarkChars(prev => [...prev, l]), i * 130)
        })
        setTimeout(() => {
          localStorage.setItem(STORAGE_KEY, '1')
          setPhase('done')
          setTimeout(() => {
            setContainerOpacity(0)
            setTimeout(onComplete, 700)
          }, 1000)
        }, 900 + letters.length * 130)
      }

      if (t < 13) rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const showWordmark = phase === 'wordmark' || phase === 'done'

  return (
    <div
      onClick={skip}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        cursor: 'pointer',
        opacity: containerOpacity,
        transition: 'opacity 0.7s ease',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* GOLEM wordmark */}
      {showWordmark && (
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
            fontSize: 'clamp(52px, 11vw, 104px)',
            fontWeight: 700,
            letterSpacing: '0.35em',
            color: '#fff',
            textShadow: '0 0 60px rgba(255,255,255,0.35), 0 0 120px rgba(201,168,76,0.18)',
          }}>
            {wordmarkChars.map((l, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  opacity: 0,
                  animation: 'gLetterIn 0.5s ease forwards',
                }}
              >
                {l}
              </span>
            ))}
          </div>

          <div style={{
            marginTop: 14,
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(9px, 1.4vw, 13px)',
            letterSpacing: '0.5em',
            color: 'rgba(255,255,255,0.35)',
            opacity: phase === 'done' ? 1 : 0,
            transition: 'opacity 0.8s ease 0.5s',
          }}>
            KNOW THYSELF
          </div>
        </div>
      )}

      {/* Skip hint */}
      <div style={{
        position: 'absolute',
        bottom: 28,
        right: 28,
        fontSize: 10,
        letterSpacing: '0.18em',
        color: 'rgba(255,255,255,0.2)',
        fontFamily: 'sans-serif',
        userSelect: 'none',
      }}>
        TAP TO SKIP
      </div>

      <style>{`
        @keyframes gLetterIn {
          from { opacity: 0; transform: translateY(16px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
