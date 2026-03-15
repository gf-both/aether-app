import { useEffect, useRef, useMemo } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { computeHDChart } from '../../engines/hdEngine'
import { CENTERS, GATES } from '../../data/hdData'

// Traditional bodygraph silhouette path (normalized 0-1 coordinates)
const SILHOUETTE = [
  [.42,.03],[.38,.05],[.36,.08],[.35,.12],[.36,.16],[.38,.18],
  [.40,.20],[.39,.22],[.38,.24],
  [.28,.28],[.22,.30],[.18,.33],[.16,.36],
  [.15,.40],[.16,.44],[.18,.48],
  [.22,.52],[.24,.56],[.26,.60],[.27,.65],[.28,.70],
  [.30,.75],[.32,.80],[.33,.85],[.34,.88],[.35,.92],[.36,.96],
  [.40,.97],[.44,.97],
  [.46,.97],[.50,.97],[.54,.97],[.56,.97],[.60,.97],
  [.64,.97],[.66,.96],[.67,.92],[.68,.88],[.67,.85],[.68,.80],[.70,.75],
  [.73,.70],[.74,.65],[.74,.60],[.76,.56],[.78,.52],
  [.82,.48],[.84,.44],[.85,.40],
  [.84,.36],[.82,.33],[.78,.30],[.72,.28],
  [.62,.24],[.61,.22],[.60,.20],
  [.62,.18],[.64,.16],[.65,.12],[.64,.08],[.62,.05],[.58,.03],
  [.54,.015],[.50,.01],[.46,.015],[.42,.03],
]

// Map engine center names to canvas CENTERS array indices
const CENTER_NAME_TO_INDEX = {
  HEAD: 0, AJNA: 1, THROAT: 2, G_SELF: 3, HEART: 4,
  SACRAL: 5, SPLEEN: 6, SOLAR: 7, ROOT: 8,
}

// Canvas channel definitions: [centerIndexA, centerIndexB]
const CANVAS_CHANNELS = [
  [0, 1], // HEAD - AJNA
  [1, 2], // AJNA - THROAT
  [2, 3], // THROAT - G_SELF
  [3, 5], // G_SELF - SACRAL
  [3, 4], // G_SELF - HEART
  [5, 8], // SACRAL - ROOT
  [6, 5], // SPLEEN - SACRAL
  [4, 7], // HEART - SOLAR
  [7, 8], // SOLAR - ROOT
  [6, 8], // SPLEEN - ROOT
  [2, 7], // THROAT - SOLAR
]

// Which engine center pairs correspond to each canvas channel
const CANVAS_CHANNEL_CENTERS = [
  ['HEAD', 'AJNA'],
  ['AJNA', 'THROAT'],
  ['THROAT', 'G_SELF'],
  ['G_SELF', 'SACRAL'],
  ['G_SELF', 'HEART'],
  ['SACRAL', 'ROOT'],
  ['SPLEEN', 'SACRAL'],
  ['HEART', 'SOLAR'],
  ['SOLAR', 'ROOT'],
  ['SPLEEN', 'ROOT'],
  ['THROAT', 'SOLAR'],
]

function isChannelDefined(activeChs, c1, c2) {
  return activeChs.some(ch =>
    (ch.centers[0] === c1 && ch.centers[1] === c2) ||
    (ch.centers[0] === c2 && ch.centers[1] === c1)
  )
}

export default function HumanDesign() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const primaryProfile = useAboveInsideStore(s => s.primaryProfile)

  // Compute HD chart from stored birth data
  const chart = useMemo(() => {
    try {
      const { dob, tob } = primaryProfile
      if (!dob) return null
      // Determine UTC offset from pob (default to -3 for Buenos Aires)
      const utcOffset = -3
      return computeHDChart({ dateOfBirth: dob, timeOfBirth: tob || '00:00', utcOffset })
    } catch (e) {
      console.error('HD chart computation error:', e)
      return null
    }
  }, [primaryProfile])

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    // Build center defined states from engine output
    const centersDefined = chart
      ? CENTERS.map(c => {
          const engineKey = c.name === 'G/SELF' ? 'G_SELF' : c.name
          return chart.centers[engineKey]?.defined ?? c.defined
        })
      : CENTERS.map(c => c.defined)

    // Build channel defined states
    const channelsDefined = chart
      ? CANVAS_CHANNEL_CENTERS.map(([c1, c2]) => isChannelDefined(chart.activeChannels, c1, c2))
      : CANVAS_CHANNELS.map(() => false)

    const profileLabel = chart
      ? `${chart.profile} · ${chart.type.toUpperCase()}`
      : '3/5 · PROJECTOR'

    function drawCenter(ctx, name, xf, yf, shape, defined, cB, W, H, sz, pulse) {
      const x = xf * W, y = yf * H, r = sz
      const glow = defined ? (.22 + .07 * Math.sin(pulse)) : 0
      ctx.save()

      if (defined) {
        const aura = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5)
        aura.addColorStop(0, cB + (glow * .8) + ')')
        aura.addColorStop(.5, cB + (glow * .3) + ')')
        aura.addColorStop(1, cB + '0)')
        ctx.beginPath()
        ctx.arc(x, y, r * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = aura
        ctx.fill()
      }

      ctx.beginPath()
      if (shape === 'tri_up') {
        ctx.moveTo(x, y - r * 1.3); ctx.lineTo(x + r * 1.2, y + r * .8); ctx.lineTo(x - r * 1.2, y + r * .8); ctx.closePath()
      } else if (shape === 'tri_down') {
        ctx.moveTo(x, y + r * 1.3); ctx.lineTo(x + r * 1.2, y - r * .8); ctx.lineTo(x - r * 1.2, y - r * .8); ctx.closePath()
      } else if (shape === 'diamond') {
        ctx.moveTo(x, y - r * 1.35); ctx.lineTo(x + r * 1.35, y); ctx.lineTo(x, y + r * 1.35); ctx.lineTo(x - r * 1.35, y); ctx.closePath()
      } else if (shape === 'rect') {
        ctx.roundRect(x - r * 1.3, y - r * .85, r * 2.6, r * 1.7, r * .2)
      } else if (shape === 'tri_left') {
        ctx.moveTo(x - r * 1.3, y); ctx.lineTo(x + r * .8, y - r * 1.2); ctx.lineTo(x + r * .8, y + r * 1.2); ctx.closePath()
      } else if (shape === 'tri_right') {
        ctx.moveTo(x + r * 1.3, y); ctx.lineTo(x - r * .8, y - r * 1.2); ctx.lineTo(x - r * .8, y + r * 1.2); ctx.closePath()
      }

      if (defined) {
        const fg = ctx.createRadialGradient(x, y, 0, x, y, r * 1.2)
        fg.addColorStop(0, cB + '0.55)'); fg.addColorStop(1, cB + '0.2)')
        ctx.fillStyle = fg; ctx.fill()
        ctx.strokeStyle = cB + (0.7 + glow * .2) + ')'; ctx.lineWidth = 1.8
      } else {
        ctx.fillStyle = 'rgba(28,34,68,.2)'; ctx.fill()
        ctx.strokeStyle = 'rgba(75,85,135,.25)'; ctx.lineWidth = .8
      }
      ctx.stroke()

      const fs = Math.max(7, sz * .52)
      ctx.font = `bold ${fs}px 'Cinzel',serif`
      ctx.fillStyle = defined ? cB + (0.85 + glow * .1) + ')' : 'rgba(75,85,135,.35)'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(name, x, y)
      ctx.restore()
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W < 10 || H < 10) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      pulse += .018
      const sz = Math.min(W, H) * .068

      // Human silhouette
      ctx.beginPath()
      ctx.moveTo(SILHOUETTE[0][0] * W, SILHOUETTE[0][1] * H)
      for (let i = 1; i < SILHOUETTE.length; i++) {
        const [x1, y1] = SILHOUETTE[i]
        const [x0, y0] = SILHOUETTE[i - 1]
        const cpx = (x0 + x1) / 2 * W, cpy = (y0 + y1) / 2 * H
        ctx.quadraticCurveTo(x0 * W, y0 * H, cpx, cpy)
      }
      ctx.closePath()
      const sGrad = ctx.createLinearGradient(W * .5, 0, W * .5, H)
      sGrad.addColorStop(0, `rgba(64,204,221,${.02 + .01 * Math.sin(pulse * .5)})`)
      sGrad.addColorStop(.5, `rgba(80,80,200,${.025 + .01 * Math.sin(pulse * .7)})`)
      sGrad.addColorStop(1, `rgba(201,168,76,${.02 + .008 * Math.sin(pulse)})`)
      ctx.fillStyle = sGrad; ctx.fill()
      ctx.strokeStyle = `rgba(120,130,170,${.08 + .03 * Math.sin(pulse * .4)})`
      ctx.lineWidth = .8; ctx.stroke()

      // Channels
      CANVAS_CHANNELS.forEach(([ai, bi], i) => {
        const cA = CENTERS[ai], cBc = CENTERS[bi]
        const x1 = cA.xf * W, y1 = cA.yf * H
        const x2 = cBc.xf * W, y2 = cBc.yf * H
        const def = channelsDefined[i]
        if (def) {
          const grad = ctx.createLinearGradient(x1, y1, x2, y2)
          const alpha = .55 + .1 * Math.sin(pulse + ai)
          grad.addColorStop(0, `rgba(80,80,200,${alpha})`)
          grad.addColorStop(1, `rgba(80,80,200,${alpha * .8})`)
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
          ctx.strokeStyle = grad; ctx.lineWidth = 3; ctx.stroke()
        } else {
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
          ctx.strokeStyle = 'rgba(65,75,125,.15)'; ctx.lineWidth = 1; ctx.stroke()
        }
      })

      // Gate numbers
      GATES.forEach(({ x, y, g }) => {
        const fs = Math.max(6.5, sz * .38)
        ctx.font = `${fs}px 'Inconsolata',monospace`
        ctx.fillStyle = 'rgba(201,168,76,.35)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(g, x * W, y * H)
      })

      // Centers
      CENTERS.forEach((c, i) => drawCenter(ctx, c.name, c.xf, c.yf, c.shape, centersDefined[i], c.col, W, H, sz, pulse))

      // Bottom label
      const lblFs = Math.max(10, W * .028)
      ctx.font = `bold ${lblFs}px 'Cinzel',serif`
      ctx.fillStyle = 'rgba(64,204,221,.6)'
      ctx.textAlign = 'center'
      ctx.fillText(profileLabel, W * .5, H * .94)

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [chart])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
