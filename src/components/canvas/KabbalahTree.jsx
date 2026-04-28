import { useEffect, useRef, useMemo } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { SEPHIROTH, PATHS, PATH_COLORS } from '../../data/kabbalahData'
import { getKabbalahProfile, profileToKabArgs } from '../../engines/kabbalahEngine'
import { useComputedProfile as useActiveProfile } from '../../hooks/useActiveProfile'

const TAU = Math.PI * 2

// Pre-generate energy particles for paths and sephiroth
function createParticles(count) {
  return Array.from({ length: count }, () => ({
    t: Math.random(),
    speed: 0.002 + Math.random() * 0.004,
    size: 1 + Math.random() * 2,
    phase: Math.random() * TAU,
    brightness: 0.5 + Math.random() * 0.5,
  }))
}

// Tree silhouette outline — stylized shield/vesica shape around the tree
const SILHOUETTE = [
  [.50,.01],[.42,.03],[.35,.06],[.25,.12],[.18,.18],[.14,.25],[.12,.33],
  [.13,.42],[.15,.50],[.14,.58],[.13,.66],[.15,.72],[.18,.78],[.22,.84],
  [.28,.88],[.35,.92],[.42,.95],[.50,.98],
  [.58,.95],[.65,.92],[.72,.88],[.78,.84],[.82,.78],[.85,.72],[.87,.66],
  [.86,.58],[.85,.50],[.87,.42],[.88,.33],[.86,.25],[.82,.18],[.75,.12],
  [.65,.06],[.58,.03],[.50,.01],
]

export default function KabbalahTree() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef(null)

  const profile = useActiveProfile()

  const sephirothLive = useMemo(() => {
    const args = profileToKabArgs(profile)
    if (!args) return null
    try {
      const result = getKabbalahProfile(args)
      return SEPHIROTH.map(s => {
        const computed = result.sephiroth.find(r => r.name === s.name)
        return computed ? { ...s, active: computed.active } : s
      })
    } catch {
      return null
    }
  }, [profile?.dob, profile?.tob, profile?.birthLat, profile?.birthLon, profile?.birthTimezone])

  // Initialize particles once
  useEffect(() => {
    if (!particlesRef.current) {
      particlesRef.current = {
        paths: PATHS.map(() => createParticles(6)),
        sephOrbiters: SEPHIROTH.map(() => createParticles(5)),
        silhouette: createParticles(50),
        pillarParticles: [createParticles(12), createParticles(12), createParticles(12)],
      }
    }
  }, [])

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    if (!sephirothLive) {
      function drawEmpty() {
        const dpr = window.devicePixelRatio || 1
        const W = canvas.width / dpr, H = canvas.height / dpr
        const ctx = canvas.getContext('2d')
        ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H)
        const R = Math.min(W, H) * .4
        ctx.font = `bold ${Math.max(11, R * .12)}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,0.4)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('✡', W/2, H/2 - R * .15)
        ctx.font = `${Math.max(9, R * .07)}px 'Cinzel',serif`
        ctx.fillText('Add birth date to activate', W/2, H/2 + R * .1)
        ctx.restore()
        animRef.current = requestAnimationFrame(drawEmpty)
      }
      drawEmpty()
      return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W < 10 || H < 10) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      pulse += 0.018

      const padX = W * 0.03
      const padY = H * 0.02
      const graphW = W - padX * 2
      const graphH = H - padY * 2

      function tx(xf) { return padX + xf * graphW }
      function ty(yf) { return padY + yf * graphH }

      const sz = Math.min(graphW, graphH) * 0.055
      const particles = particlesRef.current

      // ─── 1. Silhouette as flowing particle stream ───
      if (particles) {
        for (const p of particles.silhouette) {
          p.t = (p.t + p.speed * 0.4) % 1
          const idx = p.t * (SILHOUETTE.length - 1)
          const i0 = Math.floor(idx), i1 = Math.min(i0 + 1, SILHOUETTE.length - 1)
          const frac = idx - i0
          const sx = tx(SILHOUETTE[i0][0] * (1 - frac) + SILHOUETTE[i1][0] * frac)
          const sy = ty(SILHOUETTE[i0][1] * (1 - frac) + SILHOUETTE[i1][1] * frac)

          const alpha = 0.06 + 0.04 * Math.sin(pulse + p.phase)
          const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, p.size * 2)
          grd.addColorStop(0, `rgba(180,160,100,${alpha})`)
          grd.addColorStop(1, 'transparent')
          ctx.beginPath(); ctx.arc(sx, sy, p.size * 2, 0, TAU); ctx.fillStyle = grd; ctx.fill()
        }
      }

      // ─── 2. Three Pillars as faint particle streams ───
      const pillars = [
        { x: 0.18, y0: 0.12, y1: 0.88, col: '180,80,220' },   // Severity (left)
        { x: 0.50, y0: 0.02, y1: 0.98, col: '255,240,200' },   // Balance (center)
        { x: 0.82, y0: 0.12, y1: 0.88, col: '64,204,221' },    // Mercy (right)
      ]
      if (particles) {
        pillars.forEach((pil, pi) => {
          for (const p of particles.pillarParticles[pi]) {
            p.t = (p.t + p.speed * 0.3) % 1
            const px = tx(pil.x) + Math.sin(pulse * 0.5 + p.phase) * 2
            const py = ty(pil.y0 + p.t * (pil.y1 - pil.y0))
            const alpha = 0.05 + 0.03 * Math.sin(pulse + p.phase)
            const grd = ctx.createRadialGradient(px, py, 0, px, py, p.size * 1.5)
            grd.addColorStop(0, `rgba(${pil.col},${alpha})`)
            grd.addColorStop(1, 'transparent')
            ctx.beginPath(); ctx.arc(px, py, p.size * 1.5, 0, TAU); ctx.fillStyle = grd; ctx.fill()
          }
        })
      }

      // ─── 3. Paths as energy streams ───
      PATHS.forEach(([ai, bi, num, ck], i) => {
        const sA = sephirothLive[ai], sB = sephirothLive[bi]
        const x1 = tx(sA.xf), y1 = ty(sA.yf)
        const x2 = tx(sB.xf), y2 = ty(sB.yf)
        const active = sA.active && sB.active
        const pathCol = PATH_COLORS[ck]

        if (active) {
          // Parse color for the path
          let lineCol = 'rgba(201,168,76,'
          let lineRGB = '201,168,76'
          if (ck === 'teal') { lineCol = 'rgba(0,184,160,'; lineRGB = '0,184,160' }
          else if (ck === 'pink') { lineCol = 'rgba(224,64,160,'; lineRGB = '224,64,160' }
          else if (ck === 'blue') { lineCol = 'rgba(68,136,255,'; lineRGB = '68,136,255' }

          // Base glow
          ctx.shadowColor = lineCol + '0.3)'
          ctx.shadowBlur = 6
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
          ctx.strokeStyle = lineCol + `${0.4 + 0.1 * Math.sin(pulse + ai)})`
          ctx.lineWidth = 2; ctx.stroke()
          ctx.shadowBlur = 0

          // Outer glow
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
          ctx.strokeStyle = lineCol + `${0.08 + 0.04 * Math.sin(pulse)})`
          ctx.lineWidth = 7; ctx.stroke()

          // Flowing particles along path
          if (particles) {
            for (const p of particles.paths[i]) {
              p.t = (p.t + p.speed) % 1
              const px = x1 + (x2 - x1) * p.t
              const py = y1 + (y2 - y1) * p.t
              const alpha = 0.5 + 0.3 * Math.sin(pulse * 2 + p.phase)
              const r = p.size * (0.8 + 0.3 * Math.sin(pulse + p.phase))

              const grd = ctx.createRadialGradient(px, py, 0, px, py, r * 3)
              grd.addColorStop(0, `rgba(${lineRGB},${alpha})`)
              grd.addColorStop(0.5, `rgba(${lineRGB},${alpha * 0.3})`)
              grd.addColorStop(1, 'transparent')
              ctx.beginPath(); ctx.arc(px, py, r * 3, 0, TAU); ctx.fillStyle = grd; ctx.fill()
              // Core
              ctx.beginPath(); ctx.arc(px, py, r * 0.7, 0, TAU)
              ctx.fillStyle = `rgba(255,250,230,${alpha * 0.8})`; ctx.fill()
            }
          }

          // Path number at midpoint
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
          if (ck != null) {
            ctx.beginPath(); ctx.arc(mx, my, 6.5, 0, TAU)
            ctx.fillStyle = 'rgba(5,5,22,0.88)'; ctx.fill()
            ctx.strokeStyle = lineCol + '0.7)'; ctx.lineWidth = 0.8; ctx.stroke()
            ctx.font = "bold 7px 'Inconsolata',monospace"
            ctx.fillStyle = 'rgba(255,240,200,0.88)'
          } else {
            ctx.font = "6.5px 'Inconsolata',monospace"
            ctx.fillStyle = 'rgba(201,168,76,0.4)'
          }
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(num, mx, my)
        } else {
          // Inactive path: faint dotted
          ctx.setLineDash([3, 5])
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
          ctx.strokeStyle = 'rgba(65,75,125,0.10)'; ctx.lineWidth = 0.7; ctx.stroke()
          ctx.setLineDash([])
        }
      })

      // ─── 4. Da'ath (hidden sephirah) ───
      const dax = tx(0.50), day = ty(0.29), dar = sz * 0.7
      ctx.beginPath(); ctx.arc(dax, day, dar, 0, TAU)
      ctx.strokeStyle = `rgba(150,80,220,${0.18 + 0.08 * Math.sin(pulse)})`
      ctx.lineWidth = 0.6; ctx.setLineDash([2, 3]); ctx.stroke(); ctx.setLineDash([])
      const daFs = Math.max(5.5, sz * 0.45)
      ctx.font = `${daFs}px 'Cinzel',serif`; ctx.fillStyle = 'rgba(150,80,220,0.3)'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText("Da'ath", dax, day + dar + Math.max(7, sz * 0.5))

      // ─── 5. Sephiroth as particle clusters ───
      sephirothLive.forEach((s, idx) => {
        const x = tx(s.xf), y = ty(s.yf)
        const r = sz * (s.name === 'Kether' ? 1.2 : s.name === 'Tiphareth' || s.name === 'Malkuth' ? 1.1 : 1)
        // s.col = 'rgba(r,g,b' (no comma, no paren) — extract just the RGB part
        const rgb = s.col.replace('rgba(', '')
        const rgba = (a) => `rgba(${rgb},${a})`

        if (s.active) {
          // Aura glow
          const glow = 0.20 + 0.08 * Math.sin(pulse + idx * 0.7)
          const aura = ctx.createRadialGradient(x, y, 0, x, y, r * 2.8)
          aura.addColorStop(0, rgba(glow * 0.9))
          aura.addColorStop(0.4, rgba(glow * 0.3))
          aura.addColorStop(1, rgba(0))
          ctx.beginPath(); ctx.arc(x, y, r * 2.8, 0, TAU); ctx.fillStyle = aura; ctx.fill()

          // Inner ring
          ctx.beginPath(); ctx.arc(x, y, r * 1.1, 0, TAU)
          ctx.strokeStyle = rgba(0.35 + glow); ctx.lineWidth = 1.2; ctx.stroke()

          // Filled center with gradient
          const inner = ctx.createRadialGradient(x, y, 0, x, y, r)
          inner.addColorStop(0, rgba(0.45))
          inner.addColorStop(1, rgba(0.12))
          ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = inner; ctx.fill()

          // Orbiting particles
          if (particles) {
            for (const p of particles.sephOrbiters[idx]) {
              p.t = (p.t + p.speed * 0.6) % 1
              const angle = p.t * TAU + p.phase
              const orbitR = r * 1.5 + Math.sin(pulse + p.phase) * r * 0.25
              const px = x + Math.cos(angle) * orbitR
              const py = y + Math.sin(angle) * orbitR
              const alpha = 0.45 + 0.25 * Math.sin(pulse * 1.5 + p.phase)

              ctx.beginPath(); ctx.arc(px, py, p.size * 0.6, 0, TAU)
              ctx.fillStyle = rgba(alpha); ctx.fill()
              const trail = ctx.createRadialGradient(px, py, 0, px, py, p.size * 1.8)
              trail.addColorStop(0, rgba(alpha * 0.35))
              trail.addColorStop(1, 'transparent')
              ctx.beginPath(); ctx.arc(px, py, p.size * 1.8, 0, TAU); ctx.fillStyle = trail; ctx.fill()
            }
          }
        } else {
          // Inactive: subtle outline
          ctx.beginPath(); ctx.arc(x, y, r, 0, TAU)
          ctx.strokeStyle = 'rgba(65,78,138,0.18)'; ctx.lineWidth = 0.6; ctx.stroke()
          ctx.fillStyle = 'rgba(18,22,55,0.08)'; ctx.fill()
        }

        // Glyph — centered in sephirah
        const glyphFs = Math.max(8, r * 0.85)
        ctx.font = `${glyphFs}px serif`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        if (s.active) {
          ctx.fillStyle = 'rgba(0,0,0,0.4)'
          ctx.fillText(s.glyph, x + 0.5, y + 0.5)
          ctx.fillStyle = 'rgba(255,255,255,0.92)'
        } else {
          ctx.fillStyle = 'rgba(65,78,138,0.35)'
        }
        ctx.fillText(s.glyph, x, y)

        // Sephirah name below
        const nameFs = Math.max(6, sz * 0.55)
        ctx.font = `bold ${nameFs}px 'Cinzel',serif`
        if (s.active) {
          ctx.fillStyle = 'rgba(0,0,0,0.4)'
          ctx.fillText(s.name, x + 0.5, y + r * 1.5 + 0.5)
          ctx.fillStyle = rgba(0.75)
        } else {
          ctx.fillStyle = 'rgba(65,78,138,0.22)'
        }
        ctx.fillText(s.name, x, y + r * 1.5)

        // Number
        const numFs = Math.max(5, sz * 0.4)
        ctx.font = `${numFs}px 'Inconsolata',monospace`
        ctx.fillStyle = s.active ? 'rgba(201,168,76,0.45)' : 'rgba(65,78,138,0.18)'
        ctx.fillText(s.num, x - r * 0.7, y - r * 0.7)
      })

      // ─── 6. Title label ───
      const lblFs = Math.max(10, graphW * 0.035)
      ctx.font = `bold ${lblFs}px 'Cinzel',serif`
      ctx.textAlign = 'center'
      const lblY = ty(0.98)
      ctx.fillStyle = 'rgba(0,0,0,0.4)'
      ctx.fillText('TREE OF LIFE', tx(0.5) + 0.5, lblY + 0.5)
      ctx.fillStyle = 'rgba(201,168,76,0.6)'
      ctx.fillText('TREE OF LIFE', tx(0.5), lblY)

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [sephirothLive])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
