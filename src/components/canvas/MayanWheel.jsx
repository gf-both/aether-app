import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { DREAMSPELL_SEALS, GALACTIC_TONES, MAYAN_PROFILE, SEAL_COLORS, computeFullProfile } from '../../data/mayanData'
import { useComputedProfile as useActiveProfile } from '../../hooks/useActiveProfile'

const DAY_SIGN_EMOJI = {
  'Imix': '🐊', 'Ik': '💨', 'Akbal': '🌙', 'Kan': '🌱', 'Chicchan': '🐍',
  'Cimi': '💀', 'Manik': '🦌', 'Lamat': '⭐', 'Muluc': '🌕', 'Oc': '🐕',
  'Chuen': '🐒', 'Eb': '🛤️', 'Ben': '🎋', 'Ix': '🐆', 'Men': '🦅',
  'Cib': '🦅', 'Caban': '🌍', 'Etznab': '🪞', 'Cauac': '⛈️', 'Ahau': '☀️',
}

const TONE_NAMES = {
  1: 'Magnetic', 2: 'Lunar', 3: 'Electric', 4: 'Self-Existing',
  5: 'Overtone', 6: 'Rhythmic', 7: 'Resonant', 8: 'Galactic',
  9: 'Solar', 10: 'Planetary', 11: 'Spectral', 12: 'Crystal', 13: 'Cosmic'
}

export default function MayanWheel({ classicalDaySign, classicalTone, classicalKin }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const profile = useActiveProfile()

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    const hasDob = !!(profile?.dob)
    const hasClassical = !!(classicalDaySign)

    // Only compute if we have real data — never fall back to static profile
    let P = null
    if (hasDob) {
      const [y, m, d] = profile.dob.split('-').map(Number)
      if (y && m && d) P = computeFullProfile(y, m, d)
    }
    const activeSealIdx = P ? P.sealNum - 1 : -1
    const activeToneIdx = P ? P.toneNum - 1 : -1

    // Use classical data if provided, else fall back to Dreamspell
    const centerDaySign = classicalDaySign || P?.seal?.name || ''
    const centerTone = classicalTone || P?.toneNum || 1
    const centerKin = classicalKin || P?.kin || 0
    const centerEmoji = DAY_SIGN_EMOJI[centerDaySign] || '✨'
    const centerToneName = TONE_NAMES[centerTone] || ''

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

      // Empty state when no profile dob and no explicit data
      if (!hasDob && !hasClassical) {
        ctx.font = `bold ${Math.max(11, R * .06)}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,0.4)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Add birth date to activate', cx, cy - R * .07)
        ctx.font = `${Math.max(9, R * .04)}px ui-sans-serif, system-ui`
        ctx.fillStyle = 'rgba(201,168,76,0.2)'
        ctx.fillText('Open Profile to add data', cx, cy + R * .07)
        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }

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

      // ---- CENTER: Day Sign info + Oracle Cross ----
      const centerR = toneInnerR - R * .02
      const orbR = centerR * .38
      const dotSize = centerR * .2

      // Center glow
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerR * .7)
      cg.addColorStop(0, 'rgba(201,168,76,.18)')
      cg.addColorStop(.5, 'rgba(180,140,60,.06)')
      cg.addColorStop(1, 'rgba(1,1,10,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, centerR * .7, 0, Math.PI * 2)
      ctx.fillStyle = cg
      ctx.fill()

      // ---- CENTER DISPLAY: Day Sign Name + Emoji + Tone ----
      const centerCircleR = orbR * .85
      // Draw center circle background
      ctx.beginPath()
      ctx.arc(cx, cy, centerCircleR, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(201,168,76,.06)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(201,168,76,.3)'
      ctx.lineWidth = 1.2
      ctx.stroke()

      // Emoji (large, centered)
      const emojiSize = Math.max(16, centerCircleR * .55)
      ctx.font = `${emojiSize}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(centerEmoji, cx, cy - centerCircleR * .22)

      // Day Sign name
      const nameSize = Math.max(9, centerCircleR * .22)
      ctx.font = `bold ${nameSize}px 'Cinzel',serif`
      ctx.fillStyle = 'rgba(255,235,180,.95)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(centerDaySign.toUpperCase(), cx, cy + centerCircleR * .15)

      // Tone number
      const toneDisplaySize = Math.max(8, centerCircleR * .2)
      ctx.font = `${toneDisplaySize}px 'Cinzel',serif`
      ctx.fillStyle = 'rgba(201,168,76,.8)'
      ctx.fillText(`Tone ${centerTone}`, cx, cy + centerCircleR * .38)

      // Tone name
      if (R > 80) {
        const toneNameSize = Math.max(6, centerCircleR * .14)
        ctx.font = `${toneNameSize}px 'Inconsolata',monospace`
        ctx.fillStyle = 'rgba(201,168,76,.5)'
        ctx.fillText(centerToneName, cx, cy + centerCircleR * .55)
      }

      // Kin number (small, bottom of center circle)
      const kinSize = Math.max(5, centerCircleR * .13)
      ctx.font = `${kinSize}px 'Inconsolata',monospace`
      ctx.fillStyle = 'rgba(201,168,76,.35)'
      ctx.fillText(`Kin ${centerKin}`, cx, cy + centerCircleR * .72)

      // ---- ORACLE CROSS (Dreamspell) around center ----
      const oracle = P.oracle
      const oraclePositions = [
        [cx, cy - orbR - centerCircleR * .1,  'guide',    'rgba(96,200,80,',   oracle.guide],
        [cx + orbR + centerCircleR * .1, cy,  'analog',   'rgba(201,168,76,',  oracle.analog],
        [cx - orbR - centerCircleR * .1, cy,  'antipode', 'rgba(220,60,60,',   oracle.antipode],
        [cx, cy + orbR + centerCircleR * .1,  'occult',   'rgba(64,204,221,',  oracle.occult],
      ]

      // Connecting lines from center edge to oracle dots
      oraclePositions.forEach(([px, py,, colBase]) => {
        const angle = Math.atan2(py - cy, px - cx)
        const startX = cx + centerCircleR * Math.cos(angle)
        const startY = cy + centerCircleR * Math.sin(angle)
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(px, py)
        ctx.strokeStyle = colBase + '0.2)'
        ctx.lineWidth = .8
        ctx.setLineDash([3, 3])
        ctx.stroke()
        ctx.setLineDash([])
      })

      // Draw oracle dots
      oraclePositions.forEach(([px, py, role, colBase, entry], idx) => {
        const dr = dotSize * .72
        const gp = .15 + .08 * Math.sin(pulse + idx * 1.2)
        const sealCol = SEAL_COLORS[entry.seal.color]

        // Aura
        const aura = ctx.createRadialGradient(px, py, 0, px, py, dr * 2)
        aura.addColorStop(0, colBase + (.18 + gp) + ')')
        aura.addColorStop(1, colBase + '0)')
        ctx.beginPath()
        ctx.arc(px, py, dr * 2, 0, Math.PI * 2)
        ctx.fillStyle = aura
        ctx.fill()

        // Dot
        ctx.beginPath()
        ctx.arc(px, py, dr, 0, Math.PI * 2)
        ctx.fillStyle = sealCol + '88'
        ctx.fill()
        ctx.strokeStyle = colBase + '0.5)'
        ctx.lineWidth = .8
        ctx.stroke()

        // Kin number
        const numS = Math.max(6, dr * .75)
        ctx.font = `bold ${numS}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(255,255,255,.9)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(entry.kin), px, py)

        // Seal name below dot
        if (R > 70) {
          const lblS = Math.max(5, dr * .38)
          ctx.font = `${lblS}px 'Inconsolata',monospace`
          ctx.fillStyle = colBase + '0.55)'
          ctx.fillText(entry.seal.name, px, py + dr + lblS + 2)
        }
      })

      // ---- LEGEND (bottom-left) ----
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

      // ---- Signature label (top-right) ----
      if (R > 80) {
        const sigS = Math.max(7, R * .036)
        ctx.font = `${sigS}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,.4)'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'top'
        ctx.fillText(P.signature, W - 8, 8)
      }

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [classicalDaySign, classicalTone, classicalKin, profile])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
