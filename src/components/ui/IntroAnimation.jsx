/**
 * IntroAnimation.jsx — Solar System → Heliocentric Vortex
 *
 * Phase 1 (0–2.5s): Top-down view of solar system orbiting the sun
 * Phase 2 (2.5–4.0s): Camera tilts to side, sun begins moving through space
 * Phase 3 (4.0–5.2s): Heliocentric vortex — planets spiral in sun's wake
 * Phase 4 (5.2–6.5s): GOLEM wordmark rises, fade out
 *
 * Pure Canvas 2D — no dependencies.
 * Only shows on first visit (localStorage key: golem_intro_seen_v4).
 */

import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'golem_intro_seen_v4'

// Planet data — semi-major axis (AU relative), orbital period (years), visual
const PLANETS = [
  { r: 0.39, period: 0.24, color: '#b0b0b0', size: 2.2,  name: 'Mercury' },
  { r: 0.72, period: 0.62, color: '#e8d4a0', size: 3.5,  name: 'Venus'   },
  { r: 1.00, period: 1.00, color: '#4488ee', size: 4.0,  name: 'Earth'   },
  { r: 1.52, period: 1.88, color: '#cc5533', size: 3.2,  name: 'Mars'    },
  { r: 2.60, period: 5.00, color: '#d4b080', size: 7.5,  name: 'Jupiter' },
  { r: 3.50, period: 9.00, color: '#d4c090', size: 6.5,  name: 'Saturn'  },
]

// Stars background
function genStars(n) {
  const s = []
  for (let i = 0; i < n; i++) {
    s.push({
      x: Math.random(),
      y: Math.random(),
      r: 0.3 + Math.random() * 1.2,
      a: 0.2 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
    })
  }
  return s
}

const STARS = genStars(800)

export default function IntroAnimation({ onComplete }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const [wordmarkVisible, setWordmarkVisible] = useState(false)
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const [containerOpacity, setContainerOpacity] = useState(1)
  const triggeredRef = useRef(false)

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

    // Planet trails for heliocentric phase
    const trails = PLANETS.map(() => [])

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function easeInOut(x) {
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
    }
    function clamp01(x) { return Math.max(0, Math.min(1, x)) }
    function lerp(a, b, t) { return a + (b - a) * t }

    function animate(ts) {
      if (!startRef.current) startRef.current = ts
      const t = (ts - startRef.current) / 1000

      const W = canvas.width, H = canvas.height
      const cx = W / 2, cy = H / 2

      ctx.clearRect(0, 0, W, H)

      // ── Background: deep space ──
      ctx.fillStyle = '#000007'
      ctx.fillRect(0, 0, W, H)

      const globalFade = clamp01(t / 0.5)

      // Stars
      STARS.forEach(s => {
        const twinkle = 0.6 + Math.sin(t * 0.8 + s.phase) * 0.4
        ctx.beginPath()
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220,230,255,${s.a * twinkle * globalFade})`
        ctx.fill()
      })

      // ── Phase timing ──
      // Phase 1: top-down  [0 – 2.5s]
      // Phase 2: tilt      [2.5 – 4.0s]
      // Phase 3: helio     [4.0 – 5.2s]
      // Phase 4: wordmark  [5.2+]

      // How far we've tilted (0=top-down, 1=side)
      const tiltProg = easeInOut(clamp01((t - 2.5) / 1.5))
      // Camera angle: top-down is 90° above horizon → tilt to 18°
      const camAngle = lerp(Math.PI / 2, Math.PI * 0.1, tiltProg)

      // Heliocentric phase progress
      const helioProg = clamp01((t - 4.0) / 1.2)

      // Orbital scale — the AU scaling to pixels
      const maxR = PLANETS[PLANETS.length - 1].r
      const systemRadius = Math.min(W, H) * 0.38
      const auToPx = systemRadius / maxR

      // Speed multiplier: faster in top-down, slows in helio
      const orbitSpeed = t < 2.5 ? 0.8 : lerp(0.8, 0.25, tiltProg)

      // Sun position: stationary during top-down, then moves in helio phase
      const sunSpeed = helioProg > 0 ? helioProg * helioProg * 0.35 : 0
      const sunX = cx + Math.cos(t * 0.0 - Math.PI * 0.5) * sunSpeed * W * 0.001 * (t - 4.0) * W * 0.05
      const sunY = cy - helioProg * H * 0.18  // sun drifts upward as we see it travel

      // ── Draw orbital rings (top-down / tilting) ──
      if (helioProg < 0.7) {
        const ringAlpha = clamp01(1 - helioProg * 1.5) * globalFade
        PLANETS.forEach(p => {
          const rx = p.r * auToPx
          // Perspective: Y squishes with camera angle
          const ry = rx * Math.sin(camAngle)
          ctx.beginPath()
          ctx.ellipse(sunX, sunY, rx, ry, 0, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255,255,255,${0.06 * ringAlpha})`
          ctx.lineWidth = 0.7
          ctx.stroke()
        })
      }

      // ── Draw planets ──
      PLANETS.forEach((p, i) => {
        const angle = (t * orbitSpeed * (2 * Math.PI) / p.period) + (i * Math.PI * 0.3)
        const rx = p.r * auToPx
        const ry = rx * Math.sin(camAngle)

        let px, py
        if (helioProg < 0.01) {
          // Pure orbital (top-down / tilt)
          px = sunX + Math.cos(angle) * rx
          py = sunY + Math.sin(angle) * ry
        } else {
          // Heliocentric: planet orbits moving sun
          // Sun is moving, planet position is orbit around sun's current pos
          px = sunX + Math.cos(angle) * rx * 0.7
          py = sunY + Math.sin(angle) * ry * 0.7
        }

        // Record trail for heliocentric phase
        if (helioProg > 0) {
          trails[i].push({ x: px, y: py, t })
          // Trim old trail points
          const maxAge = 1.8
          while (trails[i].length > 0 && t - trails[i][0].t > maxAge) trails[i].shift()

          // Draw trail
          if (trails[i].length > 2) {
            ctx.beginPath()
            ctx.moveTo(trails[i][0].x, trails[i][0].y)
            for (let k = 1; k < trails[i].length; k++) {
              const age = t - trails[i][k].t
              const trailAlpha = (1 - age / maxAge) * 0.35 * helioProg
              ctx.lineTo(trails[i][k].x, trails[i][k].y)
            }
            ctx.strokeStyle = p.color + '88'
            ctx.lineWidth = 1.2
            ctx.stroke()

            // Draw fading dots along trail
            for (let k = 0; k < trails[i].length; k += 4) {
              const age = t - trails[i][k].t
              const a = (1 - age / maxAge) * 0.4 * helioProg
              ctx.beginPath()
              ctx.arc(trails[i][k].x, trails[i][k].y, p.size * 0.3, 0, Math.PI * 2)
              ctx.fillStyle = p.color + Math.round(a * 255).toString(16).padStart(2, '0')
              ctx.fill()
            }
          }
        }

        // Draw planet
        const pAlpha = globalFade * (helioProg > 0.9 ? clamp01(1 - (helioProg - 0.9) * 10) : 1)
        const glowR = p.size * 3
        const g = ctx.createRadialGradient(px, py, 0, px, py, glowR)
        g.addColorStop(0, p.color + 'ff')
        g.addColorStop(0.4, p.color + '99')
        g.addColorStop(1, p.color + '00')
        ctx.beginPath()
        ctx.arc(px, py, glowR, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.globalAlpha = pAlpha
        ctx.fill()

        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()

        // Saturn ring
        if (i === 5) {
          ctx.save()
          ctx.translate(px, py)
          ctx.scale(1, Math.sin(camAngle) * 0.35 + 0.15)
          ctx.beginPath()
          ctx.ellipse(0, 0, p.size * 2.2, p.size * 2.2, 0, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(212,192,144,${0.45 * pAlpha})`
          ctx.lineWidth = 2
          ctx.stroke()
          ctx.restore()
        }

        ctx.globalAlpha = 1
      })

      // ── Sun ──
      {
        const sunAlpha = globalFade
        // Outer corona
        const corona = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 80)
        corona.addColorStop(0, `rgba(255,240,180,${0.15 * sunAlpha})`)
        corona.addColorStop(0.4, `rgba(255,200,80,${0.05 * sunAlpha})`)
        corona.addColorStop(1, `rgba(255,140,0,0)`)
        ctx.beginPath()
        ctx.arc(sunX, sunY, 80, 0, Math.PI * 2)
        ctx.fillStyle = corona
        ctx.fill()

        // Sun body
        const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 22)
        sunGlow.addColorStop(0, `rgba(255,255,220,${sunAlpha})`)
        sunGlow.addColorStop(0.4, `rgba(255,220,80,${sunAlpha})`)
        sunGlow.addColorStop(1, `rgba(255,140,0,${0.8 * sunAlpha})`)
        ctx.beginPath()
        ctx.arc(sunX, sunY, 22, 0, Math.PI * 2)
        ctx.fillStyle = sunGlow
        ctx.fill()

        // Sun travel trail in helio phase
        if (helioProg > 0) {
          const trailLen = Math.min(W * 0.4, helioProg * W * 0.5)
          const sunTrail = ctx.createLinearGradient(sunX, sunY, sunX, sunY + trailLen)
          sunTrail.addColorStop(0, `rgba(255,200,80,${0.18 * helioProg})`)
          sunTrail.addColorStop(1, `rgba(255,140,0,0)`)
          ctx.beginPath()
          ctx.arc(sunX, sunY + trailLen * 0.3, trailLen * 0.12, 0, Math.PI * 2)
          ctx.fillStyle = sunTrail
          ctx.globalAlpha = helioProg * 0.3
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }

      // ── Trigger wordmark ──
      if (t > 5.2 && !triggeredRef.current) {
        triggeredRef.current = true
        setWordmarkVisible(true)
        setTimeout(() => setSubtitleVisible(true), 600)
        setTimeout(() => {
          localStorage.setItem(STORAGE_KEY, '1')
          setContainerOpacity(0)
          setTimeout(onComplete, 700)
        }, 2000)
      }

      if (t < 8) rafRef.current = requestAnimationFrame(animate)
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
        background: '#000007',
        cursor: 'pointer',
        opacity: containerOpacity,
        transition: 'opacity 0.7s ease',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* GOLEM wordmark */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        gap: 14,
      }}>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(52px, 11vw, 104px)',
          fontWeight: 700,
          letterSpacing: '0.35em',
          color: '#fff',
          textShadow: '0 0 60px rgba(255,255,255,0.3), 0 0 120px rgba(201,168,76,0.2)',
          opacity: wordmarkVisible ? 1 : 0,
          transform: wordmarkVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}>
          GOLEM
        </div>

        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(9px, 1.4vw, 13px)',
          letterSpacing: '0.5em',
          color: 'rgba(255,255,255,0.35)',
          opacity: subtitleVisible ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}>
          KNOW THYSELF
        </div>
      </div>

      {/* Skip hint */}
      <div style={{
        position: 'absolute',
        bottom: 28,
        right: 32,
        fontSize: 11,
        letterSpacing: '0.15em',
        color: 'rgba(255,255,255,0.2)',
        fontFamily: "'Cinzel', serif",
      }}>
        TAP TO SKIP
      </div>
    </div>
  )
}
