import { useEffect, useRef, useMemo } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { useGolemStore } from '../../store/useGolemStore'
import { CHINESE_ANIMALS, FIVE_ELEMENTS } from '../../data/chineseData'
import { getChineseProfileFromDob } from '../../engines/chineseEngine'

export default function ChineseZodiac() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(-1)
  const profile = useGolemStore((s) => s.activeViewProfile || s.primaryProfile)

  const CHINESE_PROFILE = useMemo(() => {
    try {
      const dob = profile?.dob || ''
      const tob = profile?.tob || '12:00'
      if (!dob) return null
      const [hour, minute] = (tob || '12:00').split(':').map(Number)
      return getChineseProfileFromDob(dob, { hour: isNaN(hour) ? 12 : hour, minute: isNaN(minute) ? 0 : minute })
    } catch (e) {
      console.error('ChineseEngine error:', e)
      return null
    }
  }, [profile?.dob, profile?.tob])

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    const activeAnimal = CHINESE_PROFILE?.animal || ''
    const activeIdx = CHINESE_ANIMALS.findIndex(a => a.name === activeAnimal)

    const handleMouseMove = (e) => {
      const r = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      const mx = e.clientX - r.left, my = e.clientY - r.top
      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * .38
      hovRef.current = -1
      CHINESE_ANIMALS.forEach((_, i) => {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
        const sx = cx + R * Math.cos(angle), sy = cy + R * Math.sin(angle)
        if (Math.hypot(mx - sx, my - sy) < R * .16) hovRef.current = i
      })
    }
    const handleMouseLeave = () => { hovRef.current = -1 }
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    /* Element color map */
    const ELEM_COLORS = { Wood: '#4caf50', Fire: '#e53935', Earth: '#d4a017', Metal: '#cfd8dc', Water: '#1e88e5' }

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W < 10 || H < 10) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      pulse += .012

      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * .38
      const hovS = hovRef.current

      // Empty state when no birth date / profile
      if (!CHINESE_PROFILE || !CHINESE_PROFILE.animal) {
        ctx.font = `bold ${Math.max(11, R * .06)}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,0.4)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Add birth date to activate', cx, cy - 10)
        ctx.font = `${Math.max(9, R * .04)}px ui-sans-serif, system-ui`
        ctx.fillStyle = 'rgba(201,168,76,0.25)'
        ctx.fillText('Chinese Zodiac', cx, cy + 14)
        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }

      /* ---- Outer ring (12 segments) ---- */
      const segArc = (Math.PI * 2) / 12
      CHINESE_ANIMALS.forEach((animal, i) => {
        const a0 = (i / 12) * Math.PI * 2 - Math.PI / 2 - segArc / 2
        const a1 = a0 + segArc
        const isActive = i === activeIdx
        const isHov = hovS === i
        const elemCol = ELEM_COLORS[animal.fixedElement] || '#ccc'

        /* Segment fill */
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, R * 1.18, a0, a1)
        ctx.closePath()
        if (isActive) {
          const glow = .14 + .06 * Math.sin(pulse * 1.5)
          ctx.fillStyle = `rgba(201,168,76,${glow})`
        } else if (isHov) {
          ctx.fillStyle = 'rgba(201,168,76,.06)'
        } else {
          ctx.fillStyle = 'rgba(255,255,255,.01)'
        }
        ctx.fill()

        /* Segment border */
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, R * 1.18, a0, a1)
        ctx.closePath()
        ctx.strokeStyle = isActive ? 'rgba(201,168,76,.4)' : 'rgba(201,168,76,.08)'
        ctx.lineWidth = isActive ? 1.2 : .5
        ctx.stroke()

        /* Animal circle at segment center */
        const midAngle = (i / 12) * Math.PI * 2 - Math.PI / 2
        const sx = cx + R * Math.cos(midAngle)
        const sy = cy + R * Math.sin(midAngle)
        const sr = R * .12

        /* Glow for active */
        if (isActive) {
          const aura = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 2.8)
          aura.addColorStop(0, `rgba(201,168,76,${.25 + .1 * Math.sin(pulse * 1.5)})`)
          aura.addColorStop(1, 'rgba(201,168,76,0)')
          ctx.beginPath()
          ctx.arc(sx, sy, sr * 2.8, 0, Math.PI * 2)
          ctx.fillStyle = aura
          ctx.fill()
        }

        /* Circle background */
        ctx.beginPath()
        ctx.arc(sx, sy, sr, 0, Math.PI * 2)
        if (isActive) {
          const cg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr)
          cg.addColorStop(0, 'rgba(201,168,76,.35)')
          cg.addColorStop(1, 'rgba(201,168,76,.1)')
          ctx.fillStyle = cg
          ctx.strokeStyle = `rgba(201,168,76,${isHov ? .9 : .6})`
        } else {
          ctx.fillStyle = isHov ? 'var(--border)' : 'rgba(10,10,30,.5)'
          ctx.strokeStyle = isHov ? elemCol + '88' : 'rgba(201,168,76,.12)'
        }
        ctx.fill()
        ctx.lineWidth = isActive ? 1.5 : .7
        ctx.stroke()

        /* Emoji inside circle */
        const emSize = Math.max(10, sr * 1.1)
        ctx.font = `${emSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(animal.emoji, sx, sy)

        /* Animal name label outside ring */
        const isDarkAnimal = document.documentElement.classList.contains('dark')
        const labelR = R * 1.30
        const lx = cx + labelR * Math.cos(midAngle)
        const ly = cy + labelR * Math.sin(midAngle)
        const labelSize = Math.max(6, R * .065)
        ctx.font = `${labelSize}px 'Cinzel',serif`
        ctx.fillStyle = isActive ? 'rgba(201,168,76,.9)' : isHov ? 'rgba(201,168,76,.6)' : (isDarkAnimal ? 'rgba(170,180,200,.45)' : 'rgba(90,74,48,.5)')
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(animal.name, lx, ly)

        /* Branch character */
        const isDarkBranch = document.documentElement.classList.contains('dark')
        const branchR = R * 1.40
        const bx = cx + branchR * Math.cos(midAngle)
        const by = cy + branchR * Math.sin(midAngle)
        const branchSize = Math.max(5, R * .05)
        ctx.font = `${branchSize}px serif`
        ctx.fillStyle = isActive ? 'rgba(201,168,76,.5)' : (isDarkBranch ? 'rgba(170,180,200,.28)' : 'rgba(90,74,48,.35)')
        ctx.fillText(animal.branch, bx, by)

        /* Element dot */
        const dotR = R * .82
        const dx = cx + dotR * Math.cos(midAngle)
        const dy = cy + dotR * Math.sin(midAngle)
        ctx.beginPath()
        ctx.arc(dx, dy, 3, 0, Math.PI * 2)
        ctx.fillStyle = elemCol + (isActive ? 'cc' : '44')
        ctx.fill()

        /* Yin/Yang indicator */
        if (isHov || isActive) {
          const yyR = R * .76
          const yx = cx + yyR * Math.cos(midAngle)
          const yy = cy + yyR * Math.sin(midAngle)
          const yySize = Math.max(5, R * .04)
          ctx.font = `${yySize}px 'Inconsolata',monospace`
          ctx.fillStyle = isActive ? 'rgba(201,168,76,.55)' : 'rgba(170,180,200,.35)'
          ctx.fillText(animal.yinYang, yx, yy)
        }
      })

      /* ---- Inner ring: 5 Elements ---- */
      const innerR = R * .55
      FIVE_ELEMENTS.forEach((elem, i) => {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2
        const ex = cx + innerR * Math.cos(angle)
        const ey = cy + innerR * Math.sin(angle)
        const er = R * .09
        const isProfileElem = elem.name === CHINESE_PROFILE.element
        const glow = .25 + .1 * Math.sin(pulse * 1.2 + i * 1.4)

        /* Aura for active element */
        if (isProfileElem) {
          const ea = ctx.createRadialGradient(ex, ey, 0, ex, ey, er * 2.5)
          ea.addColorStop(0, elem.color + Math.round(glow * 80).toString(16).padStart(2, '0'))
          ea.addColorStop(1, elem.color + '00')
          ctx.beginPath()
          ctx.arc(ex, ey, er * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = ea
          ctx.fill()
        }

        /* Element circle */
        ctx.beginPath()
        ctx.arc(ex, ey, er, 0, Math.PI * 2)
        const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, er)
        eg.addColorStop(0, elem.color + (isProfileElem ? '55' : '22'))
        eg.addColorStop(1, elem.color + (isProfileElem ? '18' : '08'))
        ctx.fillStyle = eg
        ctx.fill()
        ctx.strokeStyle = elem.color + (isProfileElem ? '88' : '28')
        ctx.lineWidth = isProfileElem ? 1.2 : .6
        ctx.stroke()

        /* Chinese character */
        const charSize = Math.max(10, er * .9)
        ctx.font = `${charSize}px serif`
        ctx.fillStyle = elem.color + (isProfileElem ? 'dd' : '66')
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(elem.chinese, ex, ey)

        /* Element name */
        const isDarkElem = document.documentElement.classList.contains('dark')
        const nlR = innerR + er + Math.max(6, R * .05)
        const nx = cx + nlR * Math.cos(angle)
        const ny = cy + nlR * Math.sin(angle)
        const nSize = Math.max(6, R * .048)
        ctx.font = `${nSize}px 'Cinzel',serif`
        ctx.fillStyle = isProfileElem ? elem.color + 'aa' : (isDarkElem ? elem.color + '66' : elem.color + '55')
        ctx.fillText(elem.name, nx, ny)
      })

      /* ---- Connecting lines between elements (generative cycle) ---- */
      ctx.save()
      ctx.globalAlpha = .08
      ctx.setLineDash([2, 4])
      for (let i = 0; i < 5; i++) {
        const a0 = (i / 5) * Math.PI * 2 - Math.PI / 2
        const a1 = ((i + 1) % 5 / 5) * Math.PI * 2 - Math.PI / 2
        ctx.beginPath()
        ctx.moveTo(cx + innerR * Math.cos(a0), cy + innerR * Math.sin(a0))
        ctx.lineTo(cx + innerR * Math.cos(a1), cy + innerR * Math.sin(a1))
        ctx.strokeStyle = 'rgba(201,168,76,.8)'
        ctx.lineWidth = .8
        ctx.stroke()
      }
      ctx.setLineDash([])
      ctx.restore()

      /* ---- Center: Yin-Yang symbol ---- */
      const yyR = R * .18
      // Outer circle
      ctx.beginPath()
      ctx.arc(cx, cy, yyR, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(5,5,22,.85)'
      ctx.fill()
      ctx.strokeStyle = `rgba(201,168,76,${.3 + .1 * Math.sin(pulse)})`
      ctx.lineWidth = 1.2
      ctx.stroke()

      // Yin half (dark, right)
      ctx.beginPath()
      ctx.arc(cx, cy, yyR - 2, Math.PI * -.5, Math.PI * .5)
      ctx.arc(cx, cy - (yyR - 2) / 2, (yyR - 2) / 2, Math.PI * .5, Math.PI * -.5, true)
      ctx.arc(cx, cy + (yyR - 2) / 2, (yyR - 2) / 2, Math.PI * -.5, Math.PI * .5)
      ctx.fillStyle = 'rgba(200,185,140,.12)'
      ctx.fill()

      // Yang half (light, left)
      ctx.beginPath()
      ctx.arc(cx, cy, yyR - 2, Math.PI * .5, Math.PI * 1.5)
      ctx.arc(cx, cy + (yyR - 2) / 2, (yyR - 2) / 2, Math.PI * 1.5, Math.PI * .5, true)
      ctx.arc(cx, cy - (yyR - 2) / 2, (yyR - 2) / 2, Math.PI * .5, Math.PI * 1.5)
      ctx.fillStyle = 'rgba(201,168,76,.22)'
      ctx.fill()

      // Dots
      ctx.beginPath()
      ctx.arc(cx, cy - (yyR - 2) / 2, (yyR - 2) * .12, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(200,185,140,.18)'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx, cy + (yyR - 2) / 2, (yyR - 2) * .12, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(201,168,76,.35)'
      ctx.fill()

      /* ---- Center text ---- */
      // Chinese character
      const charCenterSize = Math.max(14, yyR * .55)
      ctx.font = `${charCenterSize}px serif`
      ctx.fillStyle = `rgba(201,168,76,${.5 + .15 * Math.sin(pulse * .8)})`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(CHINESE_PROFILE.branchCn || '申', cx, cy + yyR + charCenterSize * .9)

      // "Metal Monkey" (or dynamic label)
      const labelCSize = Math.max(7, yyR * .36)
      ctx.font = `${labelCSize}px 'Cinzel',serif`
      ctx.fillStyle = 'rgba(201,168,76,.65)'
      ctx.fillText(CHINESE_PROFILE.yearPillar ? CHINESE_PROFILE.yearPillar.label : `${CHINESE_PROFILE.element} ${CHINESE_PROFILE.animal}`, cx, cy + yyR + charCenterSize * .9 + labelCSize * 1.6)

      // Stem + branch label
      const stemSize = Math.max(6, yyR * .28)
      ctx.font = `${stemSize}px 'Inconsolata',monospace`
      ctx.fillStyle = 'rgba(170,180,200,.35)'
      const stemLabel = CHINESE_PROFILE.stemCn && CHINESE_PROFILE.branchCn
        ? `${CHINESE_PROFILE.stemCn}${CHINESE_PROFILE.branchCn}  ${CHINESE_PROFILE.stem} ${CHINESE_PROFILE.branch}`
        : '庚申  Gēng Shēn'
      ctx.fillText(stemLabel, cx, cy + yyR + charCenterSize * .9 + labelCSize * 1.6 + stemSize * 1.8)

      /* ---- Outer ring border ---- */
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.18, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201,168,76,.1)'
      ctx.lineWidth = .5
      ctx.stroke()

      /* ---- Hover tooltip ---- */
      if (hovS >= 0 && hovS !== activeIdx) {
        const animal = CHINESE_ANIMALS[hovS]
        const midAngle = (hovS / 12) * Math.PI * 2 - Math.PI / 2
        const tx = cx + R * .55 * Math.cos(midAngle)
        const ty = cy + R * .55 * Math.sin(midAngle)
        const tipSize = Math.max(7, R * .05)
        ctx.font = `${tipSize}px 'Cormorant Garamond',serif`
        ctx.fillStyle = 'rgba(255,230,180,.6)'
        ctx.textAlign = 'center'
        ctx.fillText(animal.traits.slice(0, 2).join(' \u00B7 '), tx, ty)
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
  }, [profile?.dob, profile?.tob])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
