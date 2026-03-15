import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { DREAMSPELL_SEALS, GALACTIC_TONES, MAYAN_PROFILE, SEAL_COLORS, computeFullProfile } from '../../data/mayanData'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'

export default function MayanWheel() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const primaryProfile = useAboveInsideStore(s => s.primaryProfile)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    // Compute profile dynamically from stored birth date (dob = 'YYYY-MM-DD')
    let P = MAYAN_PROFILE
    if (primaryProfile?.dob) {
      const [y, m, d] = primaryProfile.dob.split('-').map(Number)
      if (y && m && d) P = computeFullProfile(y, m, d)
    }
    const activeSealIdx = P.sealNum - 1
    const activeToneIdx = P.toneNum - 1

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W < 10 || H < 10) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      pulse += .008

      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * .44

      // Background radial glow
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.1)
      bg.addColorStop(0, 'rgba(40,20,10,.25)')
      bg.addColorStop(.5, 'rgba(20,10,5,.12)')
      bg.addColorStop(1, 'rgba(1,1,10,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.1, 0, Math.PI * 2)
      ctx.fillStyle = bg
      ctx.fill()

      // Outer decorative ring
      ctx.beginPath()
      ctx.arc(cx, cy, R * .99, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201,168,76,.2)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // ---- OUTER RING: 20 Solar Seals ----
      const outerR = R * .97, innerDayR = R * .74
      for (let i = 0; i < 20; i++) {
        const a0 = (i / 20) * Math.PI * 2 - Math.PI / 2
        const a1 = ((i + 1) / 20) * Math.PI * 2 - Math.PI / 2
        const seal = DREAMSPELL_SEALS[i]
        const isActive = i === activeSealIdx
        const sealCol = SEAL_COLORS[seal.color] || '#888'

        ctx.beginPath()
        ctx.arc(cx, cy, outerR, a0, a1)
        ctx.arc(cx, cy, innerDayR, a1, a0, true)
        ctx.closePath()
        ctx.fillStyle = isActive
          ? `rgba(201,168,76,${.35 + .1 * Math.sin(pulse * 2)})`
          : sealCol + '0c'
        ctx.fill()
        ctx.strokeStyle = isActive ? 'rgba(201,168,76,.6)' : 'rgba(201,168,76,.1)'
        ctx.lineWidth = isActive ? 1.2 : .4
        ctx.stroke()

        // Radial divider
        ctx.beginPath()
        ctx.moveTo(cx + outerR * Math.cos(a0), cy + outerR * Math.sin(a0))
        ctx.lineTo(cx + innerDayR * Math.cos(a0), cy + innerDayR * Math.sin(a0))
        ctx.strokeStyle = 'rgba(201,168,76,.12)'
        ctx.lineWidth = .4
        ctx.stroke()

        // Seal name
        const aMid = (a0 + a1) / 2
        const textR = (outerR + innerDayR) / 2
        const tx = cx + textR * Math.cos(aMid)
        const ty = cy + textR * Math.sin(aMid)
        const fs = Math.max(6, R * .042)
        ctx.save()
        ctx.translate(tx, ty)
        ctx.rotate(aMid + Math.PI / 2)
        ctx.font = `${isActive ? 'bold ' : ''}${fs}px 'Cinzel',serif`
        ctx.fillStyle = isActive ? 'rgba(255,235,180,.95)' : sealCol + '88'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(seal.name, 0, 0)
        ctx.restore()

        // Direction dot on outer edge
        const dotAngle = aMid
        const dotDist = outerR + R * .025
        ctx.beginPath()
        ctx.arc(cx + dotDist * Math.cos(dotAngle), cy + dotDist * Math.sin(dotAngle), R * .015, 0, Math.PI * 2)
        ctx.fillStyle = isActive ? 'rgba(201,168,76,.7)' : sealCol + '30'
        ctx.fill()
      }

      // Ring separator
      ctx.beginPath()
      ctx.arc(cx, cy, innerDayR, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201,168,76,.18)'
      ctx.lineWidth = .8
      ctx.stroke()

      // ---- INNER RING: 13 Galactic Tones ----
      const toneOuterR = innerDayR - R * .015
      const toneInnerR = R * .42
      for (let i = 0; i < 13; i++) {
        const a0 = (i / 13) * Math.PI * 2 - Math.PI / 2
        const a1 = ((i + 1) / 13) * Math.PI * 2 - Math.PI / 2
        const tone = GALACTIC_TONES[i]
        const isActive = i === activeToneIdx

        ctx.beginPath()
        ctx.arc(cx, cy, toneOuterR, a0, a1)
        ctx.arc(cx, cy, toneInnerR, a1, a0, true)
        ctx.closePath()
        ctx.fillStyle = isActive
          ? `rgba(201,168,76,${.3 + .08 * Math.sin(pulse * 2.5 + 1)})`
          : `rgba(180,140,60,${.03 + (i % 2) * .02})`
        ctx.fill()
        ctx.strokeStyle = isActive ? 'rgba(201,168,76,.5)' : 'rgba(201,168,76,.08)'
        ctx.lineWidth = isActive ? 1 : .35
        ctx.stroke()

        // Radial divider
        ctx.beginPath()
        ctx.moveTo(cx + toneOuterR * Math.cos(a0), cy + toneOuterR * Math.sin(a0))
        ctx.lineTo(cx + toneInnerR * Math.cos(a0), cy + toneInnerR * Math.sin(a0))
        ctx.strokeStyle = 'rgba(201,168,76,.08)'
        ctx.lineWidth = .35
        ctx.stroke()

        // Tone number & name
        const aMid = (a0 + a1) / 2
        const numR = (toneOuterR + toneInnerR) / 2
        const nx = cx + numR * Math.cos(aMid)
        const ny = cy + numR * Math.sin(aMid)
        const numSize = Math.max(8, R * .055)
        ctx.font = `${isActive ? 'bold ' : ''}${numSize}px 'Cinzel',serif`
        ctx.fillStyle = isActive ? 'rgba(255,235,180,.95)' : 'rgba(201,168,76,.4)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(tone.number), nx, ny)

        if (R > 80) {
          const nameR = numR + R * .045
          const nnx = cx + nameR * Math.cos(aMid)
          const nny = cy + nameR * Math.sin(aMid)
          ctx.save()
          ctx.translate(nnx, nny)
          ctx.rotate(aMid + Math.PI / 2)
          ctx.font = `${Math.max(5, R * .032)}px 'Inconsolata',monospace`
          ctx.fillStyle = isActive ? 'rgba(255,235,180,.7)' : 'rgba(201,168,76,.22)'
          ctx.fillText(tone.name, 0, 0)
          ctx.restore()
        }
      }

      // Inner ring border
      ctx.beginPath()
      ctx.arc(cx, cy, toneInnerR, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201,168,76,.15)'
      ctx.lineWidth = .7
      ctx.stroke()

      // ---- CENTER: Oracle Cross ----
      const centerR = toneInnerR - R * .02
      const orbR = centerR * .42 // distance of oracle positions from center
      const dotSize = centerR * .22 // oracle dot size

      // Center glow
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerR * .7)
      cg.addColorStop(0, 'rgba(201,168,76,.15)')
      cg.addColorStop(.5, 'rgba(180,140,60,.05)')
      cg.addColorStop(1, 'rgba(1,1,10,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, centerR * .7, 0, Math.PI * 2)
      ctx.fillStyle = cg
      ctx.fill()

      // Oracle positions: [x,y, label, color, kin-entry]
      const oracle = P.oracle
      const positions = [
        [cx, cy,             'destiny',  'rgba(221,170,34,',  oracle.destiny],
        [cx, cy - orbR,      'guide',    'rgba(96,200,80,',   oracle.guide],
        [cx + orbR, cy,      'analog',   'rgba(201,168,76,',  oracle.analog],
        [cx - orbR, cy,      'antipode', 'rgba(220,60,60,',   oracle.antipode],
        [cx, cy + orbR,      'occult',   'rgba(64,204,221,',  oracle.occult],
      ]

      // Connecting lines from center to oracle positions
      for (let i = 1; i < 5; i++) {
        const [px, py,,colBase] = positions[i]
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(px, py)
        ctx.strokeStyle = colBase + '0.15)'
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Draw oracle dots
      positions.forEach(([px, py, role, colBase, entry], idx) => {
        const isCenter = idx === 0
        const dr = isCenter ? dotSize * 1.2 : dotSize * .8
        const gp = .2 + .1 * Math.sin(pulse + idx * 1.2)
        const sealCol = SEAL_COLORS[entry.seal.color]

        // Aura
        const aura = ctx.createRadialGradient(px, py, 0, px, py, dr * 2)
        aura.addColorStop(0, colBase + (isCenter ? (.3 + gp) : (.15 + gp * .5)) + ')')
        aura.addColorStop(1, colBase + '0)')
        ctx.beginPath()
        ctx.arc(px, py, dr * 2, 0, Math.PI * 2)
        ctx.fillStyle = aura
        ctx.fill()

        // Dot fill with seal color
        ctx.beginPath()
        ctx.arc(px, py, dr, 0, Math.PI * 2)
        ctx.fillStyle = isCenter ? `rgba(201,168,76,${.5 + gp})` : sealCol + (isCenter ? 'cc' : '66')
        ctx.fill()
        ctx.strokeStyle = isCenter ? 'rgba(255,230,150,.6)' : colBase + '0.4)'
        ctx.lineWidth = isCenter ? 1.5 : .8
        ctx.stroke()

        // Seal glyph or kin number
        const numS = isCenter ? Math.max(10, dr * .9) : Math.max(7, dr * .7)
        ctx.font = `bold ${numS}px 'Cinzel',serif`
        ctx.fillStyle = isCenter ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.85)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(entry.kin), px, py)

        // Seal name below dot
        if (R > 60) {
          const lblS = Math.max(5, dr * .35)
          ctx.font = `${lblS}px 'Inconsolata',monospace`
          ctx.fillStyle = isCenter ? 'rgba(255,235,180,.7)' : colBase + '0.5)'
          ctx.fillText(entry.seal.name, px, py + dr + lblS + 2)
        }
      })

      // Kin label above center
      const labelS = Math.max(6, R * .035)
      ctx.font = `${labelS}px 'Cinzel',serif`
      ctx.fillStyle = 'rgba(201,168,76,.45)'
      ctx.textAlign = 'center'
      ctx.fillText('KIN', cx, cy - dotSize * 1.2 - labelS - 2)

      // Signature below oracle
      if (R > 80) {
        const sigS = Math.max(6, R * .032)
        ctx.font = `${sigS}px 'Inconsolata',monospace`
        ctx.fillStyle = 'rgba(201,168,76,.35)'
        ctx.fillText(P.signature, cx, cy + orbR + dotSize + sigS * 2.5)
      }

      // ---- LEGEND ----
      const lx = 8, ly = H - 52
      const legS = Math.max(6, R * .04)
      const items = [
        ['\u25CF Guide', 'rgba(96,200,80,.6)'],
        ['\u25CF Analog', 'rgba(201,168,76,.5)'],
        ['\u25CF Antipode', 'rgba(220,60,60,.5)'],
        ['\u25CF Occult', 'rgba(64,204,221,.5)'],
      ]
      items.forEach(([label, color], i) => {
        ctx.fillStyle = color
        ctx.font = `${legS}px 'Inconsolata',monospace`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, lx, ly + i * (legS + 5))
      })

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
