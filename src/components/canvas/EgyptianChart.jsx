import { useEffect, useRef, useMemo } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { EGYPTIAN_SIGNS, EGYPTIAN_PROFILE, getEgyptianSign } from '../../data/egyptianData'

export default function EgyptianChart() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(-1)

  const primaryProfile = useAboveInsideStore(s => s.primaryProfile)
  const activeViewProfile = useAboveInsideStore(s => s.activeViewProfile)
  const profile = activeViewProfile || primaryProfile

  // Compute active sign dynamically from birth data
  const activeSign = useMemo(() => {
    if (!profile.dob) return EGYPTIAN_PROFILE.sign
    const [, m, d] = profile.dob.split('-').map(Number)
    return getEgyptianSign(d, m)?.name || EGYPTIAN_PROFILE.sign
  }, [profile.dob])

  const activeSignRef = useRef(activeSign)
  useEffect(() => { activeSignRef.current = activeSign }, [activeSign])

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    const getActiveSign = () => activeSignRef.current

    /* Egyptian palette */
    const GOLD = '#c9a84c'
    const SAND = '#b8a070'
    const DEEP_BLUE = '#0a1440'
    const LAPIS = '#1a3060'

    const handleMouseMove = (e) => {
      const r = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      const mx = e.clientX - r.left, my = e.clientY - r.top
      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * .38
      hovRef.current = -1
      EGYPTIAN_SIGNS.forEach((_, i) => {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
        const sx = cx + R * Math.cos(angle), sy = cy + R * Math.sin(angle)
        if (Math.hypot(mx - sx, my - sy) < R * .16) hovRef.current = i
      })
    }
    const handleMouseLeave = () => { hovRef.current = -1 }
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    /* Hieroglyphic-style symbols for each sign */
    const SIGN_GLYPHS = {
      'Nile': '\u{1F30A}',
      'Amun-Ra': '\u{2600}',
      'Mut': '\u{1F985}',
      'Geb': '\u{1F30D}',
      'Osiris': '\u{2625}',
      'Isis': '\u{1F451}',
      'Thoth': '\u{1F4DC}',
      'Horus': '\u{1F4A0}',
      'Anubis': '\u{1F43E}',
      'Seth': '\u{26A1}',
      'Bastet': '\u{1F408}',
      'Sekhmet': '\u{1F981}',
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W < 10 || H < 10) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      pulse += .008

      const activeSign = getActiveSign()
      const activeIdx = EGYPTIAN_SIGNS.findIndex(s => s.name === activeSign)

      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * .38
      const hovS = hovRef.current

      /* ---- Background radial glow (sandy/warm) ---- */
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.3)
      bg.addColorStop(0, 'rgba(180,140,60,.12)')
      bg.addColorStop(.5, 'rgba(100,70,30,.06)')
      bg.addColorStop(1, 'rgba(1,1,10,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2)
      ctx.fillStyle = bg
      ctx.fill()

      /* ---- Outer decorative border (Egyptian stepped pattern) ---- */
      const outerBorderR = R * 1.22
      ctx.beginPath()
      ctx.arc(cx, cy, outerBorderR, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(201,168,76,${.15 + .05 * Math.sin(pulse)})`
      ctx.lineWidth = 2
      ctx.stroke()

      /* Stepped decoration along outer border */
      const stepCount = 48
      for (let i = 0; i < stepCount; i++) {
        const angle = (i / stepCount) * Math.PI * 2
        const len = (i % 3 === 0) ? R * .04 : R * .02
        const x1 = cx + outerBorderR * Math.cos(angle)
        const y1 = cy + outerBorderR * Math.sin(angle)
        const x2 = cx + (outerBorderR + len) * Math.cos(angle)
        const y2 = cy + (outerBorderR + len) * Math.sin(angle)
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = (i % 3 === 0) ? 'rgba(201,168,76,.2)' : 'rgba(201,168,76,.08)'
        ctx.lineWidth = (i % 3 === 0) ? 1.2 : .6
        ctx.stroke()
      }

      /* ---- 12 Segments for zodiac signs ---- */
      const segArc = (Math.PI * 2) / 12
      EGYPTIAN_SIGNS.forEach((sign, i) => {
        const a0 = (i / 12) * Math.PI * 2 - Math.PI / 2 - segArc / 2
        const a1 = a0 + segArc
        const isActive = i === activeIdx
        const isHov = hovS === i

        /* Segment fill */
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, R * 1.18, a0, a1)
        ctx.closePath()
        if (isActive) {
          const glow = .16 + .08 * Math.sin(pulse * 1.5)
          ctx.fillStyle = `rgba(201,168,76,${glow})`
        } else if (isHov) {
          ctx.fillStyle = 'rgba(184,160,112,.08)'
        } else {
          ctx.fillStyle = `rgba(26,48,96,${.03 + (i % 2) * .02})`
        }
        ctx.fill()

        /* Segment border */
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, R * 1.18, a0, a1)
        ctx.closePath()
        ctx.strokeStyle = isActive ? 'rgba(201,168,76,.45)' : 'rgba(201,168,76,.08)'
        ctx.lineWidth = isActive ? 1.2 : .5
        ctx.stroke()

        /* Radial divider lines */
        ctx.beginPath()
        ctx.moveTo(cx + R * .65 * Math.cos(a0), cy + R * .65 * Math.sin(a0))
        ctx.lineTo(cx + R * 1.18 * Math.cos(a0), cy + R * 1.18 * Math.sin(a0))
        ctx.strokeStyle = 'rgba(201,168,76,.06)'
        ctx.lineWidth = .4
        ctx.stroke()

        /* Sign node at segment center */
        const midAngle = (i / 12) * Math.PI * 2 - Math.PI / 2
        const sx = cx + R * Math.cos(midAngle)
        const sy = cy + R * Math.sin(midAngle)
        const sr = R * .12

        /* Glow for active sign */
        if (isActive) {
          const aura = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 3)
          aura.addColorStop(0, `rgba(201,168,76,${.28 + .12 * Math.sin(pulse * 1.5)})`)
          aura.addColorStop(1, 'rgba(201,168,76,0)')
          ctx.beginPath()
          ctx.arc(sx, sy, sr * 3, 0, Math.PI * 2)
          ctx.fillStyle = aura
          ctx.fill()
        }

        /* Circle background */
        ctx.beginPath()
        ctx.arc(sx, sy, sr, 0, Math.PI * 2)
        if (isActive) {
          const cg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr)
          cg.addColorStop(0, 'rgba(201,168,76,.4)')
          cg.addColorStop(1, 'rgba(201,168,76,.12)')
          ctx.fillStyle = cg
          ctx.strokeStyle = `rgba(201,168,76,${isHov ? .9 : .65})`
        } else {
          ctx.fillStyle = isHov ? 'rgba(184,160,112,.08)' : 'rgba(10,20,64,.55)'
          ctx.strokeStyle = isHov ? sign.color + '66' : 'rgba(201,168,76,.1)'
        }
        ctx.fill()
        ctx.lineWidth = isActive ? 1.5 : .7
        ctx.stroke()

        /* Glyph/emoji inside circle */
        const glyph = SIGN_GLYPHS[sign.name] || '\u2726'
        const emSize = Math.max(10, sr * 1.05)
        ctx.font = `${emSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(glyph, sx, sy)

        /* Sign name label outside ring */
        const labelR = R * 1.32
        const lx = cx + labelR * Math.cos(midAngle)
        const ly = cy + labelR * Math.sin(midAngle)
        const labelSize = Math.max(6, R * .06)
        ctx.font = `${labelSize}px 'Cinzel',serif`
        ctx.fillStyle = isActive ? 'rgba(201,168,76,.9)' : isHov ? 'rgba(201,168,76,.6)' : 'rgba(184,160,112,.3)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(sign.name, lx, ly)

        /* Element indicator dot */
        const dotR = R * .82
        const dx = cx + dotR * Math.cos(midAngle)
        const dy = cy + dotR * Math.sin(midAngle)
        ctx.beginPath()
        ctx.arc(dx, dy, 3, 0, Math.PI * 2)
        ctx.fillStyle = sign.color + (isActive ? 'cc' : '44')
        ctx.fill()

        /* Element name on hover/active */
        if (isHov || isActive) {
          const elR = R * .74
          const ex = cx + elR * Math.cos(midAngle)
          const ey = cy + elR * Math.sin(midAngle)
          const elSize = Math.max(5, R * .04)
          ctx.font = `${elSize}px 'Inconsolata',monospace`
          ctx.fillStyle = isActive ? 'rgba(201,168,76,.55)' : 'rgba(184,160,112,.35)'
          ctx.fillText(sign.element, ex, ey)
        }
      })

      /* ---- Inner decorative ring (Egyptian geometric pattern) ---- */
      const innerRingR = R * .6
      ctx.beginPath()
      ctx.arc(cx, cy, innerRingR, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201,168,76,.12)'
      ctx.lineWidth = .8
      ctx.stroke()

      /* Geometric decoration: triangles around inner ring */
      const triCount = 24
      for (let i = 0; i < triCount; i++) {
        const angle = (i / triCount) * Math.PI * 2 + pulse * .15
        const triSize = R * .025
        const triX = cx + innerRingR * Math.cos(angle)
        const triY = cy + innerRingR * Math.sin(angle)
        ctx.beginPath()
        ctx.moveTo(
          triX + triSize * Math.cos(angle - Math.PI / 2),
          triY + triSize * Math.sin(angle - Math.PI / 2),
        )
        ctx.lineTo(
          triX + triSize * Math.cos(angle + Math.PI / 6),
          triY + triSize * Math.sin(angle + Math.PI / 6),
        )
        ctx.lineTo(
          triX + triSize * Math.cos(angle + Math.PI * 5 / 6),
          triY + triSize * Math.sin(angle + Math.PI * 5 / 6),
        )
        ctx.closePath()
        ctx.fillStyle = `rgba(201,168,76,${.04 + .02 * Math.sin(pulse + i)})`
        ctx.fill()
      }

      /* ---- Inner sacred geometry: four-pointed stars ---- */
      ctx.save()
      ctx.globalAlpha = .05
      for (let ring = 0; ring < 3; ring++) {
        const rr = innerRingR * (.35 + ring * .2)
        const pts = (ring + 1) * 4
        ctx.beginPath()
        for (let p = 0; p <= pts; p++) {
          const a = (p / pts) * Math.PI * 2 - Math.PI / 2 + pulse * (.2 + ring * .08)
          const rad = p % 2 === 0 ? rr : rr * .6
          const method = p === 0 ? 'moveTo' : 'lineTo'
          ctx[method](cx + rad * Math.cos(a), cy + rad * Math.sin(a))
        }
        ctx.closePath()
        ctx.strokeStyle = 'rgba(201,168,76,.8)'
        ctx.lineWidth = .6
        ctx.stroke()
      }
      ctx.restore()

      /* ---- Connecting lines: element affinities ---- */
      ctx.save()
      ctx.globalAlpha = .05
      ctx.setLineDash([2, 5])
      const elemGroups = {}
      EGYPTIAN_SIGNS.forEach((s, i) => {
        if (!elemGroups[s.element]) elemGroups[s.element] = []
        elemGroups[s.element].push(i)
      })
      Object.values(elemGroups).forEach(indices => {
        for (let j = 0; j < indices.length - 1; j++) {
          const a0 = (indices[j] / 12) * Math.PI * 2 - Math.PI / 2
          const a1 = (indices[j + 1] / 12) * Math.PI * 2 - Math.PI / 2
          ctx.beginPath()
          ctx.moveTo(cx + R * .65 * Math.cos(a0), cy + R * .65 * Math.sin(a0))
          ctx.lineTo(cx + R * .65 * Math.cos(a1), cy + R * .65 * Math.sin(a1))
          ctx.strokeStyle = 'rgba(201,168,76,.8)'
          ctx.lineWidth = .6
          ctx.stroke()
        }
      })
      ctx.setLineDash([])
      ctx.restore()

      /* ---- Center: Eye of Horus / Wadjet motif ---- */
      const centerR = R * .22
      /* Outer circle */
      ctx.beginPath()
      ctx.arc(cx, cy, centerR, 0, Math.PI * 2)
      const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerR)
      centerGrad.addColorStop(0, 'rgba(26,48,96,.9)')
      centerGrad.addColorStop(1, 'rgba(5,5,22,.95)')
      ctx.fillStyle = centerGrad
      ctx.fill()
      ctx.strokeStyle = `rgba(201,168,76,${.35 + .1 * Math.sin(pulse)})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      /* Inner ring */
      ctx.beginPath()
      ctx.arc(cx, cy, centerR * .7, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(201,168,76,${.15 + .05 * Math.sin(pulse * 1.3)})`
      ctx.lineWidth = .6
      ctx.stroke()

      /* Eye shape in center */
      const eyeW = centerR * .55
      const eyeH = centerR * .28
      ctx.beginPath()
      ctx.ellipse(cx, cy, eyeW, eyeH, 0, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(201,168,76,${.4 + .15 * Math.sin(pulse * 1.2)})`
      ctx.lineWidth = 1
      ctx.stroke()

      /* Pupil */
      ctx.beginPath()
      ctx.arc(cx, cy, centerR * .12, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(201,168,76,${.5 + .2 * Math.sin(pulse * 1.5)})`
      ctx.fill()

      /* ---- Center text below eye ---- */
      const signNameSize = Math.max(8, centerR * .45)
      ctx.font = `${signNameSize}px 'Cinzel',serif`
      ctx.fillStyle = `rgba(201,168,76,${.55 + .15 * Math.sin(pulse * .8)})`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(SIGN_GLYPHS[activeSign], cx, cy + centerR + signNameSize * .7)

      const nameSize = Math.max(7, centerR * .38)
      ctx.font = `${nameSize}px 'Cinzel',serif`
      ctx.fillStyle = 'rgba(201,168,76,.7)'
      ctx.fillText(activeSign.toUpperCase(), cx, cy + centerR + signNameSize * .7 + nameSize * 1.5)

      const subtitleSize = Math.max(6, centerR * .28)
      ctx.font = `${subtitleSize}px 'Inconsolata',monospace`
      ctx.fillStyle = 'rgba(184,160,112,.4)'
      const activeSignData = EGYPTIAN_SIGNS.find(s => s.name === activeSign) || EGYPTIAN_SIGNS.find(s => s.name === 'Mut')
      ctx.fillText((activeSignData?.element || '') + ' \u00B7 ' + (activeSignData?.planet || ''), cx, cy + centerR + signNameSize * .7 + nameSize * 1.5 + subtitleSize * 1.8)

      /* ---- Outer ring border ---- */
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.18, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201,168,76,.1)'
      ctx.lineWidth = .5
      ctx.stroke()

      /* ---- Hover tooltip ---- */
      if (hovS >= 0 && hovS !== activeIdx) {
        const sign = EGYPTIAN_SIGNS[hovS]
        const midAngle = (hovS / 12) * Math.PI * 2 - Math.PI / 2
        const tx = cx + R * .5 * Math.cos(midAngle)
        const ty = cy + R * .5 * Math.sin(midAngle)
        const tipSize = Math.max(7, R * .05)
        ctx.font = `${tipSize}px 'Cormorant Garamond',serif`
        ctx.fillStyle = 'rgba(255,230,180,.6)'
        ctx.textAlign = 'center'
        ctx.fillText(sign.traits.slice(0, 2).join(' \u00B7 '), tx, ty)
      }

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
