import { useEffect, useRef, useMemo } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { useGolemStore } from '../../store/useGolemStore'
import { getTibetanProfile, TIBETAN_ELEMENT_NAMES_TIB } from '../../engines/tibetanEngine'

const ANIMALS = ['Horse','Sheep','Monkey','Bird','Dog','Pig','Mouse','Ox','Tiger','Rabbit','Dragon','Snake']
const ANIMAL_EMOJI = {
  Horse: '\u{1F40E}', Sheep: '\u{1F411}', Monkey: '\u{1F412}', Bird: '\u{1F426}',
  Dog: '\u{1F415}', Pig: '\u{1F416}', Mouse: '\u{1F401}', Ox: '\u{1F402}',
  Tiger: '\u{1F405}', Rabbit: '\u{1F407}', Dragon: '\u{1F409}', Snake: '\u{1F40D}',
}
const ELEM_COLORS = { Fire: '#e53935', Earth: '#d4a017', Iron: '#b0bec5', Water: '#1e88e5', Wood: '#4caf50' }
const MEWA_COLORS = {
  1: '#e0e0e0', 2: '#424242', 3: '#42a5f5', 4: '#66bb6a',
  5: '#fdd835', 6: '#eeeeee', 7: '#ef5350', 8: '#f5f5f5', 9: '#c62828',
}

export default function TibetanWheel() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const profile = useGolemStore((s) => s.activeViewProfile || s.primaryProfile)

  const tib = useMemo(() => {
    if (!profile?.dob) return null
    try {
      const [y, m, d] = profile.dob.split('-').map(Number)
      if (!y || !m || !d) return null
      return getTibetanProfile({ day: d, month: m, year: y })
    } catch { return null }
  }, [profile?.dob])

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0
    let mandalaAngle = 0

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W < 10 || H < 10) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      pulse += 0.01
      mandalaAngle += 0.001

      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * 0.44

      // Empty state
      if (!tib) {
        ctx.font = `bold ${Math.max(11, R * 0.06)}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,0.4)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Add birth date to activate', cx, cy - R * 0.07)
        ctx.font = `${Math.max(9, R * 0.04)}px ui-sans-serif, system-ui`
        ctx.fillStyle = 'rgba(201,168,76,0.2)'
        ctx.fillText('Tibetan Astrology', cx, cy + R * 0.07)
        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }

      const activeIdx = ANIMALS.indexOf(tib.animal)
      const elemColor = ELEM_COLORS[tib.element] || '#c9a84c'
      const mewaColor = MEWA_COLORS[tib.mewaNumber] || '#c9a84c'

      // Background radial glow
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.15)
      bg.addColorStop(0, 'rgba(40,20,10,.2)')
      bg.addColorStop(0.5, 'rgba(20,10,5,.08)')
      bg.addColorStop(1, 'rgba(1,1,10,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2)
      ctx.fillStyle = bg
      ctx.fill()

      // ---- Rotating mandala decorative lines ----
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(mandalaAngle)
      const mandalaR = R * 0.98
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2
        const inner = mandalaR * 0.35
        const outer = mandalaR * (i % 2 === 0 ? 0.42 : 0.39)
        ctx.beginPath()
        ctx.moveTo(inner * Math.cos(a), inner * Math.sin(a))
        ctx.lineTo(outer * Math.cos(a), outer * Math.sin(a))
        ctx.strokeStyle = `rgba(201,168,76,${0.06 + 0.03 * Math.sin(pulse + i * 0.5)})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
      // Mandala concentric petals
      for (let ring = 0; ring < 3; ring++) {
        const rr = mandalaR * (0.28 + ring * 0.05)
        const petals = 8 + ring * 4
        for (let j = 0; j < petals; j++) {
          const pa = (j / petals) * Math.PI * 2
          const px = rr * Math.cos(pa), py = rr * Math.sin(pa)
          const petalSize = R * (0.02 - ring * 0.003)
          ctx.beginPath()
          ctx.arc(px, py, petalSize, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(201,168,76,${0.04 + 0.02 * Math.sin(pulse * 1.5 + j + ring)})`
          ctx.fill()
        }
      }
      ctx.restore()

      // Outer ring border
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.99, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201,168,76,.18)'
      ctx.lineWidth = 1.2
      ctx.stroke()

      // ---- 12 Animals around the wheel ----
      const animalR = R * 0.82
      const segArc = (Math.PI * 2) / 12
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
        const a0 = angle - segArc / 2
        const a1 = angle + segArc / 2
        const isActive = i === activeIdx
        const animalName = ANIMALS[i]

        // Segment arc fill
        ctx.beginPath()
        ctx.arc(cx, cy, R * 0.98, a0, a1)
        ctx.arc(cx, cy, R * 0.66, a1, a0, true)
        ctx.closePath()
        if (isActive) {
          const glow = 0.15 + 0.07 * Math.sin(pulse * 1.5)
          ctx.fillStyle = `rgba(201,168,76,${glow})`
        } else {
          ctx.fillStyle = 'rgba(255,255,255,.01)'
        }
        ctx.fill()
        ctx.strokeStyle = isActive ? 'rgba(201,168,76,.45)' : 'rgba(201,168,76,.07)'
        ctx.lineWidth = isActive ? 1.2 : 0.4
        ctx.stroke()

        // Radial dividers
        ctx.beginPath()
        ctx.moveTo(cx + R * 0.98 * Math.cos(a0), cy + R * 0.98 * Math.sin(a0))
        ctx.lineTo(cx + R * 0.66 * Math.cos(a0), cy + R * 0.66 * Math.sin(a0))
        ctx.strokeStyle = 'rgba(201,168,76,.08)'
        ctx.lineWidth = 0.4
        ctx.stroke()

        // Active animal golden glow aura
        if (isActive) {
          const sx = cx + animalR * Math.cos(angle), sy = cy + animalR * Math.sin(angle)
          const aura = ctx.createRadialGradient(sx, sy, 0, sx, sy, R * 0.16)
          aura.addColorStop(0, `rgba(201,168,76,${0.25 + 0.1 * Math.sin(pulse * 1.5)})`)
          aura.addColorStop(1, 'rgba(201,168,76,0)')
          ctx.beginPath()
          ctx.arc(sx, sy, R * 0.16, 0, Math.PI * 2)
          ctx.fillStyle = aura
          ctx.fill()
        }

        // Animal emoji
        const ax = cx + animalR * Math.cos(angle), ay = cy + animalR * Math.sin(angle)
        const emSize = Math.max(10, R * 0.1)
        ctx.font = `${emSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(ANIMAL_EMOJI[animalName] || '', ax, ay)

        // Animal name outside ring
        const labelR = R * 1.08
        const lx = cx + labelR * Math.cos(angle), ly = cy + labelR * Math.sin(angle)
        const labelSize = Math.max(6, R * 0.055)
        ctx.font = `${isActive ? 'bold ' : ''}${labelSize}px 'Cinzel',serif`
        ctx.fillStyle = isActive ? 'rgba(255,235,180,.95)' : 'rgba(170,180,200,.3)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(animalName, lx, ly)
      }

      // Inner ring border
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.66, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201,168,76,.15)'
      ctx.lineWidth = 0.7
      ctx.stroke()

      // ---- 5 Elements ring ----
      const elemR = R * 0.53
      const ELEMENTS = ['Fire', 'Earth', 'Iron', 'Water', 'Wood']
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2
        const ex = cx + elemR * Math.cos(angle), ey = cy + elemR * Math.sin(angle)
        const er = R * 0.065
        const isActive = ELEMENTS[i] === tib.element
        const ec = ELEM_COLORS[ELEMENTS[i]]
        const glowA = 0.25 + 0.1 * Math.sin(pulse * 1.2 + i * 1.4)

        if (isActive) {
          const ea = ctx.createRadialGradient(ex, ey, 0, ex, ey, er * 2.8)
          ea.addColorStop(0, ec + Math.round(glowA * 80).toString(16).padStart(2, '0'))
          ea.addColorStop(1, ec + '00')
          ctx.beginPath()
          ctx.arc(ex, ey, er * 2.8, 0, Math.PI * 2)
          ctx.fillStyle = ea
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(ex, ey, er, 0, Math.PI * 2)
        const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, er)
        eg.addColorStop(0, ec + (isActive ? '55' : '22'))
        eg.addColorStop(1, ec + (isActive ? '18' : '08'))
        ctx.fillStyle = eg
        ctx.fill()
        ctx.strokeStyle = ec + (isActive ? '88' : '28')
        ctx.lineWidth = isActive ? 1.2 : 0.6
        ctx.stroke()

        // Element name
        const enSize = Math.max(6, R * 0.042)
        ctx.font = `${enSize}px 'Cinzel',serif`
        ctx.fillStyle = ec + (isActive ? 'cc' : '55')
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(ELEMENTS[i], ex, ey - er - enSize * 0.7)

        // Tibetan name
        const tibNameSize = Math.max(5, R * 0.032)
        ctx.font = `${tibNameSize}px 'Inconsolata',monospace`
        ctx.fillStyle = ec + (isActive ? '88' : '33')
        ctx.fillText(TIBETAN_ELEMENT_NAMES_TIB[i], ex, ey + er + tibNameSize * 0.7)
      }

      // Element connecting lines (generative cycle)
      ctx.save()
      ctx.globalAlpha = 0.06
      ctx.setLineDash([2, 4])
      for (let i = 0; i < 5; i++) {
        const a0 = (i / 5) * Math.PI * 2 - Math.PI / 2
        const a1 = ((i + 1) % 5 / 5) * Math.PI * 2 - Math.PI / 2
        ctx.beginPath()
        ctx.moveTo(cx + elemR * Math.cos(a0), cy + elemR * Math.sin(a0))
        ctx.lineTo(cx + elemR * Math.cos(a1), cy + elemR * Math.sin(a1))
        ctx.strokeStyle = 'rgba(201,168,76,.8)'
        ctx.lineWidth = 0.8
        ctx.stroke()
      }
      ctx.setLineDash([])
      ctx.restore()

      // ---- Center mandala area ----
      const centerR = R * 0.28

      // Center circle background
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerR)
      cg.addColorStop(0, 'rgba(201,168,76,.12)')
      cg.addColorStop(0.6, 'rgba(10,10,30,.6)')
      cg.addColorStop(1, 'rgba(5,5,22,.85)')
      ctx.beginPath()
      ctx.arc(cx, cy, centerR, 0, Math.PI * 2)
      ctx.fillStyle = cg
      ctx.fill()
      ctx.strokeStyle = `rgba(201,168,76,${0.3 + 0.1 * Math.sin(pulse)})`
      ctx.lineWidth = 1.2
      ctx.stroke()

      // Active animal emoji (large, center)
      const centerEmoji = ANIMAL_EMOJI[tib.animal] || ''
      const centerEmojiSize = Math.max(18, centerR * 0.6)
      ctx.font = `${centerEmojiSize}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(centerEmoji, cx, cy - centerR * 0.2)

      // Full label below emoji
      const labelSize = Math.max(7, centerR * 0.2)
      ctx.font = `bold ${labelSize}px 'Cinzel',serif`
      ctx.fillStyle = 'rgba(255,235,180,.95)'
      ctx.fillText(tib.fullLabel.toUpperCase(), cx, cy + centerR * 0.18)

      // Tibetan Year
      const yearSize = Math.max(6, centerR * 0.15)
      ctx.font = `${yearSize}px 'Inconsolata',monospace`
      ctx.fillStyle = 'rgba(201,168,76,.55)'
      ctx.fillText(`Year ${tib.tibetanYear}`, cx, cy + centerR * 0.4)

      // ---- Mewa number display (bottom-right of center) ----
      const mewaX = cx + centerR * 0.75, mewaY = cy + centerR * 0.75
      const mewaR = R * 0.08
      // Pulsing aura
      const mewaGlow = ctx.createRadialGradient(mewaX, mewaY, 0, mewaX, mewaY, mewaR * 2.5)
      mewaGlow.addColorStop(0, mewaColor + Math.round((0.3 + 0.1 * Math.sin(pulse * 2)) * 255).toString(16).padStart(2, '0'))
      mewaGlow.addColorStop(1, mewaColor + '00')
      ctx.beginPath()
      ctx.arc(mewaX, mewaY, mewaR * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = mewaGlow
      ctx.fill()

      ctx.beginPath()
      ctx.arc(mewaX, mewaY, mewaR, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(5,5,22,.9)'
      ctx.fill()
      ctx.strokeStyle = mewaColor + '88'
      ctx.lineWidth = 1.2
      ctx.stroke()

      const mewaNumSize = Math.max(10, mewaR * 1.1)
      ctx.font = `bold ${mewaNumSize}px 'Cinzel',serif`
      ctx.fillStyle = mewaColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(tib.mewaNumber), mewaX, mewaY)

      // "Mewa" label
      const mewaLblSize = Math.max(5, mewaR * 0.4)
      ctx.font = `${mewaLblSize}px 'Cinzel',serif`
      ctx.fillStyle = 'rgba(201,168,76,.5)'
      ctx.fillText('MEWA', mewaX, mewaY + mewaR + mewaLblSize + 2)

      // ---- Yin/Yang (Male/Female) indicator (top-left of center) ----
      const yyX = cx - centerR * 0.75, yyY = cy - centerR * 0.75
      const yyR = R * 0.06
      ctx.beginPath()
      ctx.arc(yyX, yyY, yyR, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(5,5,22,.85)'
      ctx.fill()
      ctx.strokeStyle = `rgba(201,168,76,${0.4 + 0.15 * Math.sin(pulse * 1.2)})`
      ctx.lineWidth = 1
      ctx.stroke()

      const yySymbol = tib.yinYang === 'Male' ? '\u2642' : '\u2640'
      const yySymSize = Math.max(10, yyR * 1.3)
      ctx.font = `${yySymSize}px sans-serif`
      ctx.fillStyle = 'rgba(201,168,76,.8)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(yySymbol, yyX, yyY)

      const yyLblSize = Math.max(5, yyR * 0.5)
      ctx.font = `${yyLblSize}px 'Cinzel',serif`
      ctx.fillStyle = 'rgba(201,168,76,.45)'
      ctx.fillText(tib.yinYang.toUpperCase(), yyX, yyY + yyR + yyLblSize + 2)

      // ---- Element color indicator (top-right of center) ----
      const elemIndX = cx + centerR * 0.75, elemIndY = cy - centerR * 0.75
      const elemIndR = R * 0.055
      ctx.beginPath()
      ctx.arc(elemIndX, elemIndY, elemIndR, 0, Math.PI * 2)
      const eig = ctx.createRadialGradient(elemIndX, elemIndY, 0, elemIndX, elemIndY, elemIndR)
      eig.addColorStop(0, elemColor + '88')
      eig.addColorStop(1, elemColor + '22')
      ctx.fillStyle = eig
      ctx.fill()
      ctx.strokeStyle = elemColor + 'aa'
      ctx.lineWidth = 1
      ctx.stroke()

      const elemLblSize = Math.max(5, elemIndR * 0.55)
      ctx.font = `${elemLblSize}px 'Cinzel',serif`
      ctx.fillStyle = elemColor + 'cc'
      ctx.textAlign = 'center'
      ctx.fillText(tib.element.toUpperCase(), elemIndX, elemIndY + elemIndR + elemLblSize + 2)

      // ---- Signature label (top-right corner) ----
      if (R > 80) {
        const sigS = Math.max(7, R * 0.036)
        ctx.font = `${sigS}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,.35)'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'top'
        ctx.fillText('Tibetan Astrology', W - 8, 8)
      }

      // ---- Mewa color label (bottom-left) ----
      if (R > 60) {
        const legS = Math.max(6, R * 0.038)
        ctx.font = `${legS}px 'Inconsolata',monospace`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'bottom'
        ctx.fillStyle = mewaColor + '88'
        ctx.fillText(`Mewa ${tib.mewaNumber}: ${tib.mewaMeaning.color}`, 8, H - 22)
        ctx.fillStyle = 'rgba(201,168,76,.35)'
        ctx.fillText(tib.mewaMeaning.meaning, 8, H - 8)
      }

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [tib])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
