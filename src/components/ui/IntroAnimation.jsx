/**
 * IntroAnimation.jsx — Constellation Assembly
 *
 * Particles drift from void, coalesce into a sphere, GOLEM wordmark rises.
 * ~5 seconds total. Tap anywhere to skip.
 * Only shows on first visit.
 */

import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'golem_intro_seen_v3'
const PARTICLE_COUNT = 1400

// Fibonacci sphere distribution
function fibonacciSphere(n) {
  const pts = []
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = phi * i
    pts.push({ x: r * Math.cos(theta), y, z: r * Math.sin(theta) })
  }
  return pts
}

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

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const spherePts = fibonacciSphere(PARTICLE_COUNT)

    // Each particle: sphere target + random start position (scattered from center)
    const particles = spherePts.map((sp, i) => {
      const scatter = 3.5
      return {
        tx: sp.x,  // target on sphere (unit)
        ty: sp.y,
        tz: sp.z,
        sx: (Math.random() - 0.5) * scatter,  // start: scattered
        sy: (Math.random() - 0.5) * scatter,
        sz: (Math.random() - 0.5) * scatter,
        // visual
        baseSize: 0.6 + Math.random() * 1.2,
        hue: Math.random() < 0.6 ? 42 + Math.random() * 12  // gold
           : Math.random() < 0.5 ? 200 + Math.random() * 20  // silver-blue
           : 30 + Math.random() * 10,                          // amber
        brightness: 0.55 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
      }
    })

    function animate(ts) {
      if (!startRef.current) startRef.current = ts
      const t = (ts - startRef.current) / 1000

      const W = canvas.width
      const H = canvas.height
      const cx = W / 2
      const cy = H / 2
      const radius = Math.min(W, H) * 0.28

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)

      // Timeline:
      // 0.0 - 0.3  : fade in
      // 0.3 - 2.2  : particles gather from scatter into sphere
      // 2.2 - 3.5  : sphere holds, rotates, breathes
      // 3.5 - 4.2  : sphere fades to void, wordmark shown (via state)
      // 4.2 - 5.0  : wordmark + subtitle, then done

      const globalFade = Math.min(1, t / 0.3)

      // Gather progress (ease in-out)
      const gatherRaw = Math.max(0, Math.min(1, (t - 0.3) / 1.9))
      const gather = gatherRaw < 0.5
        ? 2 * gatherRaw * gatherRaw
        : 1 - Math.pow(-2 * gatherRaw + 2, 2) / 2

      // Sphere rotation
      const rotY = t * 0.22
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
      const tiltX = 0.22
      const cosTilt = Math.cos(tiltX), sinTilt = Math.sin(tiltX)

      // Breath pulse
      const breath = 1 + Math.sin(t * 1.8 + 0.5) * 0.025

      // Particle alpha: fade out after t=3.5
      let particleAlpha = globalFade
      if (t > 3.5) particleAlpha = Math.max(0, 1 - (t - 3.5) / 0.6)

      if (particleAlpha > 0) {
        particles.forEach(p => {
          // Interpolate from scatter to sphere
          const wx = p.sx + (p.tx - p.sx) * gather
          const wy = p.sy + (p.ty - p.sy) * gather
          const wz = p.sz + (p.tz - p.sz) * gather

          // Scale to radius + breath
          const rx = wx * radius * breath
          const ry = wy * radius * breath
          const rz = wz * radius * breath

          // Rotate Y
          const rx2 = rx * cosY + rz * sinY
          const rz2 = -rx * sinY + rz * cosY

          // Tilt X
          const ry2 = ry * cosTilt - rz2 * sinTilt
          const rz3 = ry * sinTilt + rz2 * cosTilt

          // Perspective project
          const fov = 900
          const z = fov + rz3
          const px = cx + rx2 * (fov / z)
          const py = cy + ry2 * (fov / z)

          // Depth shading
          const depth = (rz3 / radius + 1) / 2  // 0=back, 1=front
          const twinkle = 0.75 + Math.sin(t * 1.4 + p.phase) * 0.25
          const size = p.baseSize * (0.5 + depth * 0.8) * twinkle * (fov / z)
          const bright = p.brightness * (0.4 + depth * 0.6) * twinkle * particleAlpha

          // Color
          const lightness = 55 + p.brightness * 30
          ctx.beginPath()
          ctx.arc(px, py, Math.max(0.3, size), 0, Math.PI * 2)

          // Soft glow
          const g = ctx.createRadialGradient(px, py, 0, px, py, size * 2.5)
          g.addColorStop(0, `hsla(${p.hue},80%,${lightness}%,${bright})`)
          g.addColorStop(0.4, `hsla(${p.hue},70%,${lightness - 10}%,${bright * 0.5})`)
          g.addColorStop(1, `hsla(${p.hue},60%,${lightness - 20}%,0)`)
          ctx.fillStyle = g
          ctx.fill()
        })
      }

      // Trigger wordmark
      if (t > 3.6 && !triggeredRef.current) {
        triggeredRef.current = true
        setWordmarkVisible(true)
        setTimeout(() => setSubtitleVisible(true), 600)
        setTimeout(() => {
          localStorage.setItem(STORAGE_KEY, '1')
          setContainerOpacity(0)
          setTimeout(onComplete, 700)
        }, 1800)
      }

      if (t < 6) rafRef.current = requestAnimationFrame(animate)
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
        right: 28,
        fontSize: 10,
        letterSpacing: '0.18em',
        color: 'rgba(255,255,255,0.2)',
        fontFamily: 'sans-serif',
        userSelect: 'none',
      }}>
        TAP TO SKIP
      </div>
    </div>
  )
}
