import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'

// Zone definitions mapped to body regions
const ZONES = [
  { id: 'crown',   label: 'Crown',       yf: .08, systems: ['Kether', 'Life Path', 'Crown Chakra'] },
  { id: 'third',   label: 'Third Eye',    yf: .16, systems: ['Enneagram', 'MBTI', 'Ajna'] },
  { id: 'throat',  label: 'Throat',       yf: .26, systems: ['Mercury', 'HD Authority', 'Vishuddha'] },
  { id: 'heart',   label: 'Heart',        yf: .37, systems: ['Sun Sign', 'Tiphareth', 'Gene Keys'] },
  { id: 'solar',   label: 'Solar Plexus', yf: .48, systems: ['Mars', 'HD Definition', 'Emotional'] },
  { id: 'sacral',  label: 'Sacral',       yf: .58, systems: ['Moon Sign', 'HD Type', 'Mayan Kin'] },
  { id: 'root',    label: 'Root',         yf: .70, systems: ['Saturn', 'Malkuth', 'Chinese Zodiac'] },
]

const ZONE_COLORS = {
  crown:  { base: 'rgba(144,80,224,',  glow: 'rgba(144,80,224,' },
  third:  { base: 'rgba(100,120,220,', glow: 'rgba(100,120,220,' },
  throat: { base: 'rgba(64,204,221,',  glow: 'rgba(64,204,221,' },
  heart:  { base: 'rgba(201,168,76,',  glow: 'rgba(201,168,76,' },
  solar:  { base: 'rgba(240,192,64,',  glow: 'rgba(240,192,64,' },
  sacral: { base: 'rgba(238,102,68,',  glow: 'rgba(238,102,68,' },
  root:   { base: 'rgba(212,48,112,',  glow: 'rgba(212,48,112,' },
}

function drawHumanSilhouette(ctx, cx, cy, scale, pulse) {
  ctx.save()
  ctx.translate(cx, cy)
  const s = scale

  // Outer aura glow
  const auraR = s * 1.15
  const aura = ctx.createRadialGradient(0, -s * .15, 0, 0, -s * .15, auraR)
  aura.addColorStop(0, `rgba(201,168,76,${.04 + .02 * Math.sin(pulse)})`)
  aura.addColorStop(.6, `rgba(144,80,224,${.02 + .01 * Math.sin(pulse * 1.3)})`)
  aura.addColorStop(1, 'transparent')
  ctx.beginPath(); ctx.arc(0, -s * .15, auraR, 0, Math.PI * 2)
  ctx.fillStyle = aura; ctx.fill()

  // Body outline with gradient stroke
  ctx.beginPath()
  // Head
  ctx.arc(0, -s * .58, s * .12, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(201,168,76,.03)'
  ctx.fill()
  ctx.strokeStyle = `rgba(201,168,76,${.25 + .08 * Math.sin(pulse)})`
  ctx.lineWidth = 1.2; ctx.stroke()

  // Neck
  ctx.beginPath()
  ctx.moveTo(-s * .04, -s * .46)
  ctx.lineTo(s * .04, -s * .46)

  // Shoulders
  ctx.lineTo(s * .22, -s * .36)
  // Right arm
  ctx.quadraticCurveTo(s * .28, -s * .28, s * .26, -s * .14)
  ctx.quadraticCurveTo(s * .25, -s * .02, s * .22, s * .08)
  // Right side torso
  ctx.quadraticCurveTo(s * .18, s * .14, s * .16, s * .22)
  // Right hip
  ctx.quadraticCurveTo(s * .17, s * .30, s * .18, s * .34)
  // Right leg
  ctx.quadraticCurveTo(s * .16, s * .48, s * .14, s * .62)
  ctx.quadraticCurveTo(s * .13, s * .72, s * .12, s * .82)
  // Right foot
  ctx.lineTo(s * .16, s * .84)
  ctx.lineTo(s * .16, s * .86)
  ctx.lineTo(s * .08, s * .86)

  // Cross bottom
  ctx.lineTo(s * .08, s * .82)
  ctx.lineTo(s * .02, s * .62)

  // Center
  ctx.lineTo(0, s * .50)

  // Left leg mirror
  ctx.lineTo(-s * .02, s * .62)
  ctx.lineTo(-s * .08, s * .82)
  ctx.lineTo(-s * .08, s * .86)
  ctx.lineTo(-s * .16, s * .86)
  ctx.lineTo(-s * .16, s * .84)
  ctx.lineTo(-s * .12, s * .82)
  ctx.quadraticCurveTo(-s * .13, s * .72, -s * .14, s * .62)
  ctx.quadraticCurveTo(-s * .16, s * .48, -s * .18, s * .34)
  ctx.quadraticCurveTo(-s * .17, s * .30, -s * .16, s * .22)
  ctx.quadraticCurveTo(-s * .18, s * .14, -s * .22, s * .08)
  ctx.quadraticCurveTo(-s * .25, -s * .02, -s * .26, -s * .14)
  ctx.quadraticCurveTo(-s * .28, -s * .28, -s * .22, -s * .36)
  ctx.lineTo(-s * .04, -s * .46)
  ctx.closePath()

  // Fill body with subtle gradient
  const bodyGrad = ctx.createLinearGradient(0, -s * .58, 0, s * .86)
  bodyGrad.addColorStop(0, `rgba(144,80,224,${.04 + .015 * Math.sin(pulse)})`)
  bodyGrad.addColorStop(.3, `rgba(201,168,76,${.04 + .015 * Math.sin(pulse * 1.2)})`)
  bodyGrad.addColorStop(.6, `rgba(238,102,68,${.03 + .01 * Math.sin(pulse * .8)})`)
  bodyGrad.addColorStop(1, `rgba(212,48,112,${.04 + .01 * Math.sin(pulse * 1.5)})`)
  ctx.fillStyle = bodyGrad; ctx.fill()

  // Body outline stroke
  ctx.strokeStyle = `rgba(201,168,76,${.18 + .06 * Math.sin(pulse)})`
  ctx.lineWidth = .8; ctx.stroke()

  // Spine / central channel
  ctx.beginPath()
  ctx.moveTo(0, -s * .58)
  ctx.lineTo(0, s * .50)
  ctx.strokeStyle = `rgba(201,168,76,${.08 + .04 * Math.sin(pulse)})`
  ctx.lineWidth = .6
  ctx.setLineDash([3, 4])
  ctx.stroke()
  ctx.setLineDash([])

  ctx.restore()
}

function drawEnergyCenter(ctx, x, y, r, colors, pulse, phaseOffset, active, label) {
  const phase = pulse + phaseOffset
  const intensity = active ? 1 : .35

  // Outer glow
  if (active) {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 3)
    glow.addColorStop(0, colors.glow + (.15 + .08 * Math.sin(phase)) * intensity + ')')
    glow.addColorStop(1, 'transparent')
    ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2)
    ctx.fillStyle = glow; ctx.fill()
  }

  // Inner ring
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
  const inner = ctx.createRadialGradient(x, y, 0, x, y, r)
  inner.addColorStop(0, colors.base + (.35 + .12 * Math.sin(phase)) * intensity + ')')
  inner.addColorStop(1, colors.base + (.08 * intensity) + ')')
  ctx.fillStyle = inner; ctx.fill()
  ctx.strokeStyle = colors.base + (.5 + .15 * Math.sin(phase)) * intensity + ')'
  ctx.lineWidth = active ? 1.2 : .5
  ctx.stroke()

  // Core dot
  ctx.beginPath(); ctx.arc(x, y, r * .25, 0, Math.PI * 2)
  ctx.fillStyle = colors.base + (.7 * intensity) + ')'
  ctx.fill()
}

export default function IntegralFigure() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(-1)
  const profile = useAboveInsideStore((s) => s.primaryProfile)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    // Build data labels from profile
    const zoneData = {
      crown:  [`LP ${profile.lifePath || '?'}`, profile.crossGK ? 'Kether \u2713' : 'Kether', '\u2727 Crown'],
      third:  [profile.mbtiType || 'MBTI ?', 'Ennea ?', '\u2609 Third Eye'],
      throat: [`\u263F ${profile.sign || '?'}`, `Auth: ${profile.hdAuth || '?'}`, '\u25CE Throat'],
      heart:  [`\u2609 ${profile.sign || '?'}`, 'Tiphareth \u2713', `GK ${profile.crossGK?.split('|')[0]?.split('/')[0] || '?'}`],
      solar:  [`Def: ${profile.hdDef || '?'}`, `Prof: ${profile.hdProfile || '?'}`, '\u2642 Solar'],
      sacral: [`\u263D ${profile.moon || '?'}`, `${profile.hdType || '?'}`, 'Sacral'],
      root:   [`Asc: ${profile.asc || '?'}`, 'Malkuth \u2713', '\u2644 Root'],
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left, my = e.clientY - rect.top
      const dpr = window.devicePixelRatio
      const W = canvas.width / dpr, H = canvas.height / dpr
      const figCx = W * .5, figTop = H * .08, figH = H * .82
      hovRef.current = -1
      ZONES.forEach((z, i) => {
        const zy = figTop + z.yf * figH
        if (Math.abs(my - zy) < figH * .045 && Math.abs(mx - figCx) < W * .35) {
          hovRef.current = i
        }
      })
    }
    const handleMouseLeave = () => { hovRef.current = -1 }
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    function draw() {
      const dpr = window.devicePixelRatio
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W === 0 || H === 0) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      pulse += .015
      const hov = hovRef.current

      const figCx = W * .5
      const figTop = H * .06
      const figH = H * .86
      const figScale = Math.min(W * .38, figH * .52)

      // Background subtle radial
      const bg = ctx.createRadialGradient(figCx, H * .4, 0, figCx, H * .4, Math.max(W, H) * .7)
      bg.addColorStop(0, 'rgba(20,10,50,.25)')
      bg.addColorStop(1, 'rgba(1,1,10,.05)')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

      // Draw scanning lines (diagnostic feel)
      for (let i = 0; i < 12; i++) {
        const lineY = figTop + (i / 11) * figH
        ctx.beginPath()
        ctx.moveTo(W * .08, lineY)
        ctx.lineTo(W * .92, lineY)
        ctx.strokeStyle = `rgba(201,168,76,${.02 + .01 * Math.sin(pulse + i * .5)})`
        ctx.lineWidth = .3
        ctx.stroke()
      }

      // Human silhouette
      drawHumanSilhouette(ctx, figCx, figTop + figH * .42, figScale, pulse)

      // Energy centers (chakra dots along spine)
      ZONES.forEach((z, i) => {
        const zy = figTop + z.yf * figH
        const r = Math.min(W, H) * .022
        const colors = ZONE_COLORS[z.id]
        const isHov = hov === i
        const active = true // All centers active for now

        drawEnergyCenter(ctx, figCx, zy, isHov ? r * 1.4 : r, colors, pulse, i * .9, active, z.label)

        // Zone label (left side)
        ctx.font = `bold ${Math.max(9, W * .018)}px 'Cinzel',serif`
        ctx.fillStyle = colors.base + (isHov ? '.9)' : '.5)')
        ctx.textAlign = 'right'
        ctx.fillText(z.label.toUpperCase(), figCx - figScale * .32, zy + 3)

        // Data labels (right side)
        const data = zoneData[z.id]
        if (data) {
          ctx.font = `${Math.max(8, W * .015)}px 'Inconsolata',monospace`
          ctx.textAlign = 'left'
          const startX = figCx + figScale * .32
          data.forEach((d, di) => {
            ctx.fillStyle = colors.base + (isHov ? '.85)' : '.4)')
            ctx.fillText(d, startX, zy - 8 + di * 12)
          })
        }

        // Connecting lines from center to labels
        ctx.beginPath()
        ctx.moveTo(figCx - r * 1.5, zy)
        ctx.lineTo(figCx - figScale * .28, zy)
        ctx.strokeStyle = colors.base + (isHov ? '.25)' : '.08)')
        ctx.lineWidth = .5; ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(figCx + r * 1.5, zy)
        ctx.lineTo(figCx + figScale * .28, zy)
        ctx.strokeStyle = colors.base + (isHov ? '.25)' : '.08)')
        ctx.lineWidth = .5; ctx.stroke()

        // Hover detail panel
        if (isHov) {
          const panelW = W * .32
          const panelH = 42
          const panelX = figCx - panelW / 2
          const panelY = zy + r * 2.5

          ctx.fillStyle = 'rgba(5,5,22,.92)'
          ctx.strokeStyle = colors.base + '.35)'
          ctx.lineWidth = .8
          ctx.beginPath()
          ctx.roundRect(panelX, panelY, panelW, panelH, 6)
          ctx.fill(); ctx.stroke()

          ctx.font = `bold ${W * .02}px 'Cinzel',serif`
          ctx.fillStyle = colors.base + '.9)'
          ctx.textAlign = 'center'
          ctx.fillText(z.label + ' Center', figCx, panelY + 16)

          ctx.font = `${W * .016}px 'Inconsolata',monospace`
          ctx.fillStyle = 'rgba(200,215,255,.65)'
          ctx.fillText(z.systems.join(' \u00B7 '), figCx, panelY + 32)
        }
      })

      // Title at top
      ctx.font = `bold ${Math.max(11, W * .024)}px 'Cinzel',serif`
      ctx.fillStyle = `rgba(201,168,76,${.35 + .1 * Math.sin(pulse * .5)})`
      ctx.textAlign = 'center'
      ctx.fillText('INTEGRAL CONSCIOUSNESS MAP', figCx, H * .035)

      // Profile name at bottom
      ctx.font = `${Math.max(9, W * .018)}px 'Cinzel',serif`
      ctx.fillStyle = 'rgba(201,168,76,.25)'
      ctx.textAlign = 'center'
      ctx.fillText(profile.name || 'Unknown', figCx, H * .97)

      // Side system indicators
      const sideLabels = [
        { label: 'ASTROLOGY', col: 'rgba(201,168,76,', y: .2 },
        { label: 'HUMAN DESIGN', col: 'rgba(64,204,221,', y: .35 },
        { label: 'KABBALAH', col: 'rgba(144,80,224,', y: .5 },
        { label: 'NUMEROLOGY', col: 'rgba(212,48,112,', y: .65 },
        { label: 'GENE KEYS', col: 'rgba(238,102,68,', y: .8 },
      ]
      sideLabels.forEach((sl) => {
        ctx.save()
        ctx.translate(W * .03, H * sl.y)
        ctx.rotate(-Math.PI / 2)
        ctx.font = `${Math.max(6, W * .012)}px 'Cinzel',serif`
        ctx.fillStyle = sl.col + '.2)'
        ctx.textAlign = 'center'
        ctx.fillText(sl.label, 0, 0)
        ctx.restore()
      })

      // Right side labels
      const rightLabels = [
        { label: 'ENNEAGRAM', col: 'rgba(100,120,220,', y: .25 },
        { label: 'MAYAN', col: 'rgba(170,120,60,', y: .4 },
        { label: 'CHINESE', col: 'rgba(220,60,60,', y: .55 },
        { label: 'EGYPTIAN', col: 'rgba(232,192,64,', y: .7 },
        { label: 'MBTI', col: 'rgba(80,200,160,', y: .85 },
      ]
      rightLabels.forEach((sl) => {
        ctx.save()
        ctx.translate(W * .97, H * sl.y)
        ctx.rotate(Math.PI / 2)
        ctx.font = `${Math.max(6, W * .012)}px 'Cinzel',serif`
        ctx.fillStyle = sl.col + '.2)'
        ctx.textAlign = 'center'
        ctx.fillText(sl.label, 0, 0)
        ctx.restore()
      })

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [profile])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
