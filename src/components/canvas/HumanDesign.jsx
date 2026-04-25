import { useEffect, useRef, useMemo } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { useGolemStore } from '../../store/useGolemStore'
import { computeHDChart } from '../../engines/hdEngine'
import { CENTERS, GATES } from '../../data/hdData'

const TAU = Math.PI * 2

// Map engine center names to canvas CENTERS array indices
const CENTER_NAME_TO_INDEX = {
  HEAD: 0, AJNA: 1, THROAT: 2, G_SELF: 3, HEART: 4,
  SACRAL: 5, SPLEEN: 6, SOLAR: 7, ROOT: 8,
}

const CANVAS_CHANNELS = [
  [0, 1], [1, 2], [2, 3], [3, 5], [3, 4],
  [5, 8], [6, 5], [4, 7], [7, 8], [6, 8], [2, 7],
]

const CANVAS_CHANNEL_CENTERS = [
  ['HEAD', 'AJNA'], ['AJNA', 'THROAT'], ['THROAT', 'G_SELF'],
  ['G_SELF', 'SACRAL'], ['G_SELF', 'HEART'], ['SACRAL', 'ROOT'],
  ['SPLEEN', 'SACRAL'], ['HEART', 'SOLAR'], ['SOLAR', 'ROOT'],
  ['SPLEEN', 'ROOT'], ['THROAT', 'SOLAR'],
]

function isChannelDefined(activeChs, c1, c2) {
  return activeChs.some(ch =>
    (ch.centers[0] === c1 && ch.centers[1] === c2) ||
    (ch.centers[0] === c2 && ch.centers[1] === c1)
  )
}

// Body silhouette as particle stream
const SILHOUETTE = [
  [.42,.03],[.38,.05],[.36,.08],[.35,.12],[.36,.16],[.38,.18],
  [.40,.20],[.39,.22],[.38,.24],[.28,.28],[.22,.30],[.18,.33],[.16,.36],
  [.15,.40],[.16,.44],[.18,.48],[.22,.52],[.24,.56],[.26,.60],[.27,.65],[.28,.70],
  [.30,.75],[.32,.80],[.33,.85],[.34,.88],[.35,.92],[.36,.96],
  [.40,.97],[.44,.97],[.46,.97],[.50,.97],[.54,.97],[.56,.97],[.60,.97],
  [.64,.97],[.66,.96],[.67,.92],[.68,.88],[.67,.85],[.68,.80],[.70,.75],
  [.73,.70],[.74,.65],[.74,.60],[.76,.56],[.78,.52],[.82,.48],[.84,.44],[.85,.40],
  [.84,.36],[.82,.33],[.78,.30],[.72,.28],[.62,.24],[.61,.22],[.60,.20],
  [.62,.18],[.64,.16],[.65,.12],[.64,.08],[.62,.05],[.58,.03],
  [.54,.015],[.50,.01],[.46,.015],[.42,.03],
]

// Pre-generate energy particles for channels
function createEnergyParticles(count) {
  return Array.from({ length: count }, () => ({
    t: Math.random(),          // position along channel (0-1)
    speed: 0.002 + Math.random() * 0.004,
    size: 1 + Math.random() * 2,
    phase: Math.random() * TAU,
    brightness: 0.5 + Math.random() * 0.5,
  }))
}

export default function HumanDesign() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef(null)
  const profile = useGolemStore(s => s.activeViewProfile || s.primaryProfile)

  const chart = useMemo(() => {
    try {
      const { dob, tob } = profile || {}
      if (!dob) return null
      const utcOffset = profile?.birthTimezone ?? -3
      return computeHDChart({ dateOfBirth: dob, timeOfBirth: tob || '00:00', utcOffset })
    } catch (e) {
      console.error('HD chart computation error:', e)
      return null
    }
  }, [profile?.dob, profile?.tob, profile?.birthTimezone])

  // Initialize energy particles (once)
  useEffect(() => {
    if (!particlesRef.current) {
      particlesRef.current = {
        channels: CANVAS_CHANNELS.map(() => createEnergyParticles(8)),
        silhouette: createEnergyParticles(60),
        centerOrbiters: CENTERS.map(() => createEnergyParticles(6)),
      }
    }
  }, [])

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    if (!chart) {
      function drawEmpty() {
        const dpr = window.devicePixelRatio || 1
        const W = canvas.width / dpr, H = canvas.height / dpr
        const ctx = canvas.getContext('2d')
        ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H)
        const R = Math.min(W, H) * .4
        ctx.font = `bold ${Math.max(11, R * .12)}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,0.4)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('◈', W/2, H/2 - R * .15)
        ctx.font = `${Math.max(9, R * .07)}px 'Cinzel',serif`
        ctx.fillText('Add birth date to activate', W/2, H/2 + R * .1)
        ctx.restore()
        animRef.current = requestAnimationFrame(drawEmpty)
      }
      drawEmpty()
      return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
    }

    const centersDefined = CENTERS.map(c => {
      const engineKey = c.name === 'G/SELF' ? 'G_SELF' : c.name
      return chart.centers[engineKey]?.defined ?? false
    })

    const channelsDefined = CANVAS_CHANNEL_CENTERS.map(([c1, c2]) =>
      isChannelDefined(chart.activeChannels, c1, c2)
    )

    const profileLabel = `${chart.profile} · ${chart.type.toUpperCase()}`

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W < 10 || H < 10) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      pulse += 0.018
      const sz = Math.min(W, H) * 0.068
      const particles = particlesRef.current

      // ─── 1. Silhouette as flowing particle stream ───
      if (particles) {
        for (const p of particles.silhouette) {
          p.t = (p.t + p.speed * 0.5) % 1
          const idx = p.t * (SILHOUETTE.length - 1)
          const i0 = Math.floor(idx), i1 = Math.min(i0 + 1, SILHOUETTE.length - 1)
          const frac = idx - i0
          const sx = (SILHOUETTE[i0][0] * (1 - frac) + SILHOUETTE[i1][0] * frac) * W
          const sy = (SILHOUETTE[i0][1] * (1 - frac) + SILHOUETTE[i1][1] * frac) * H

          const alpha = 0.08 + 0.06 * Math.sin(pulse + p.phase)
          const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, p.size * 2)
          grd.addColorStop(0, `rgba(100,120,180,${alpha})`)
          grd.addColorStop(1, 'transparent')
          ctx.beginPath(); ctx.arc(sx, sy, p.size * 2, 0, TAU); ctx.fillStyle = grd; ctx.fill()
        }
      }

      // ─── 2. Channels as energy streams ───
      CANVAS_CHANNELS.forEach(([ai, bi], i) => {
        const cA = CENTERS[ai], cB = CENTERS[bi]
        const x1 = cA.xf * W, y1 = cA.yf * H
        const x2 = cB.xf * W, y2 = cB.yf * H
        const def = channelsDefined[i]

        if (def) {
          // Defined channel: glowing line with energy particles flowing through
          // Base glow
          ctx.shadowColor = 'rgba(80,80,220,0.4)'
          ctx.shadowBlur = 8
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
          ctx.strokeStyle = `rgba(100,110,220,${0.5 + 0.12 * Math.sin(pulse + ai)})`
          ctx.lineWidth = 2.5; ctx.stroke()
          ctx.shadowBlur = 0

          // Outer glow line
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
          ctx.strokeStyle = `rgba(100,110,220,${0.12 + 0.05 * Math.sin(pulse)})`
          ctx.lineWidth = 8; ctx.stroke()

          // Flowing particles along channel
          if (particles) {
            for (const p of particles.channels[i]) {
              p.t = (p.t + p.speed) % 1
              const px = x1 + (x2 - x1) * p.t
              const py = y1 + (y2 - y1) * p.t
              const alpha = 0.6 + 0.3 * Math.sin(pulse * 2 + p.phase)
              const r = p.size * (0.8 + 0.3 * Math.sin(pulse + p.phase))

              const grd = ctx.createRadialGradient(px, py, 0, px, py, r * 3)
              grd.addColorStop(0, `rgba(160,170,255,${alpha})`)
              grd.addColorStop(0.5, `rgba(100,110,220,${alpha * 0.4})`)
              grd.addColorStop(1, 'transparent')
              ctx.beginPath(); ctx.arc(px, py, r * 3, 0, TAU); ctx.fillStyle = grd; ctx.fill()
              // Core
              ctx.beginPath(); ctx.arc(px, py, r * 0.8, 0, TAU)
              ctx.fillStyle = `rgba(200,210,255,${alpha * 0.9})`; ctx.fill()
            }
          }
        } else {
          // Undefined channel: faint dotted line
          ctx.setLineDash([3, 5])
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
          ctx.strokeStyle = 'rgba(65,75,125,0.12)'; ctx.lineWidth = 0.8; ctx.stroke()
          ctx.setLineDash([])
        }
      })

      // ─── 3. Centers as particle clusters ───
      CENTERS.forEach((c, i) => {
        const x = c.xf * W, y = c.yf * H, r = sz
        const defined = centersDefined[i]
        const cB = c.col // color base like 'rgba(r,g,b,'

        if (defined) {
          // Aura — large soft glow
          const glow = 0.22 + 0.08 * Math.sin(pulse + i * 0.7)
          const aura = ctx.createRadialGradient(x, y, 0, x, y, r * 3)
          aura.addColorStop(0, cB + (glow * 0.9) + ')')
          aura.addColorStop(0.4, cB + (glow * 0.3) + ')')
          aura.addColorStop(1, cB + '0)')
          ctx.beginPath(); ctx.arc(x, y, r * 3, 0, TAU); ctx.fillStyle = aura; ctx.fill()

          // Inner ring
          ctx.beginPath(); ctx.arc(x, y, r * 1.1, 0, TAU)
          ctx.strokeStyle = cB + (0.4 + glow) + ')'; ctx.lineWidth = 1.5; ctx.stroke()

          // Filled center with gradient
          const inner = ctx.createRadialGradient(x, y, 0, x, y, r)
          inner.addColorStop(0, cB + '0.5)')
          inner.addColorStop(1, cB + '0.15)')
          ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = inner; ctx.fill()

          // Orbiting particles
          if (particles) {
            for (const p of particles.centerOrbiters[i]) {
              p.t = (p.t + p.speed * 0.7) % 1
              const angle = p.t * TAU + p.phase
              const orbitR = r * 1.6 + Math.sin(pulse + p.phase) * r * 0.3
              const px = x + Math.cos(angle) * orbitR
              const py = y + Math.sin(angle) * orbitR
              const alpha = 0.5 + 0.3 * Math.sin(pulse * 1.5 + p.phase)

              ctx.beginPath(); ctx.arc(px, py, p.size * 0.7, 0, TAU)
              ctx.fillStyle = cB + alpha.toFixed(2) + ')'; ctx.fill()
              // Tiny trail
              const trail = ctx.createRadialGradient(px, py, 0, px, py, p.size * 2)
              trail.addColorStop(0, cB + (alpha * 0.4).toFixed(2) + ')')
              trail.addColorStop(1, 'transparent')
              ctx.beginPath(); ctx.arc(px, py, p.size * 2, 0, TAU); ctx.fillStyle = trail; ctx.fill()
            }
          }
        } else {
          // Undefined: subtle outline only
          ctx.beginPath(); ctx.arc(x, y, r, 0, TAU)
          ctx.strokeStyle = 'rgba(75,85,135,0.18)'; ctx.lineWidth = 0.7; ctx.stroke()
          ctx.fillStyle = 'rgba(28,34,68,0.08)'; ctx.fill()
        }

        // Center name — always visible
        const fs = Math.max(7, sz * 0.5)
        ctx.font = `bold ${fs}px 'Cinzel',serif`
        ctx.fillStyle = defined ? cB + '0.85)' : 'rgba(75,85,135,0.3)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(c.name === 'G/SELF' ? 'G' : c.name.substring(0, 3), x, y)
      })

      // ─── 4. Gate numbers ───
      GATES.forEach(({ x: gx, y: gy, g }) => {
        const fs = Math.max(6, sz * 0.35)
        ctx.font = `${fs}px 'Inconsolata',monospace`
        ctx.fillStyle = `rgba(201,168,76,${0.25 + 0.08 * Math.sin(pulse * 0.5 + g)})`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(g, gx * W, gy * H)
      })

      // ─── 5. Profile label ───
      const lblFs = Math.max(10, W * 0.028)
      ctx.font = `bold ${lblFs}px 'Cinzel',serif`
      ctx.fillStyle = 'rgba(64,204,221,0.6)'
      ctx.textAlign = 'center'
      ctx.fillText(profileLabel, W * 0.5, H * 0.94)

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [chart])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
