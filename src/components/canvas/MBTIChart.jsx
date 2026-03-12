import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { MBTI_TYPES, MBTI_FUNCTIONS } from '../../data/mbtiData'

const FUNCTION_COLORS = {
  Ni: 'rgba(144,80,224,',   Ni_hex: '#9050e0',
  Ne: 'rgba(240,200,40,',   Ne_hex: '#f0c828',
  Si: 'rgba(90,140,180,',   Si_hex: '#5a8cb4',
  Se: 'rgba(220,120,40,',   Se_hex: '#dc7828',
  Ti: 'rgba(64,204,221,',   Ti_hex: '#40ccdd',
  Te: 'rgba(220,60,60,',    Te_hex: '#dc3c3c',
  Fi: 'rgba(180,120,220,',  Fi_hex: '#b478dc',
  Fe: 'rgba(96,200,80,',    Fe_hex: '#60c850',
}

const STACK_LABELS = ['Dominant', 'Auxiliary', 'Tertiary', 'Inferior']
const STACK_STRENGTHS = [1.0, 0.75, 0.45, 0.25]

export default function MBTIChart({ type }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(-1)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    const typeData = type ? MBTI_TYPES.find(t => t.code === type) : null
    const stack = typeData ? typeData.functions : null

    const handleMouseMove = (e) => {
      if (!stack) return
      const r = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const mx = e.clientX - r.left
      const my = e.clientY - r.top
      const W = canvas.width / dpr, H = canvas.height / dpr
      const barAreaX = W * .12
      const barAreaW = W * .76
      const barAreaY = H * .22
      const barH = H * .13
      const gap = H * .04
      hovRef.current = -1
      for (let i = 0; i < 4; i++) {
        const by = barAreaY + i * (barH + gap)
        if (mx >= barAreaX && mx <= barAreaX + barAreaW && my >= by && my <= by + barH) {
          hovRef.current = i
          break
        }
      }
    }
    const handleMouseLeave = () => { hovRef.current = -1 }
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr, H = canvas.height / dpr
      if (W < 10 || H < 10) { animRef.current = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      pulse += .015

      const cx = W / 2, cy = H / 2

      // Subtle radial background glow
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * .7)
      bgGrad.addColorStop(0, 'rgba(201,168,76,.025)')
      bgGrad.addColorStop(1, 'rgba(201,168,76,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, Math.min(W, H) * .7, 0, Math.PI * 2)
      ctx.fillStyle = bgGrad
      ctx.fill()

      if (!stack) {
        // Placeholder -- no type determined yet
        const glowAlpha = .3 + .15 * Math.sin(pulse * .8)

        // Decorative ring
        ctx.beginPath()
        ctx.arc(cx, cy, Math.min(W, H) * .28, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(201,168,76,${.12 + .06 * Math.sin(pulse)})`
        ctx.lineWidth = 1.2
        ctx.stroke()

        // Question mark
        ctx.font = `bold ${Math.max(36, Math.min(W, H) * .2)}px 'Cinzel',serif`
        ctx.fillStyle = `rgba(201,168,76,${glowAlpha})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('?', cx, cy - 8)

        // Invite text
        ctx.font = `${Math.max(9, Math.min(W, H) * .045)}px 'Cormorant Garamond',serif`
        ctx.fillStyle = 'rgba(170,180,200,.4)'
        ctx.fillText('Take the quiz to discover', cx, cy + Math.min(W, H) * .18)
        ctx.fillText('your cognitive type', cx, cy + Math.min(W, H) * .24)

        // Small MBTI label
        ctx.font = `${Math.max(7, Math.min(W, H) * .035)}px 'Cinzel',serif`
        ctx.fillStyle = `rgba(201,168,76,${.25 + .1 * Math.sin(pulse * 1.2)})`
        ctx.fillText('MBTI', cx, H * .08)

        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }

      // -- Type header --
      const headerY = H * .06
      ctx.font = `bold ${Math.max(14, W * .065)}px 'Cinzel',serif`
      ctx.fillStyle = `rgba(201,168,76,${.7 + .15 * Math.sin(pulse * .8)})`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(typeData.code, cx, headerY)

      // Nickname
      ctx.font = `${Math.max(8, W * .035)}px 'Cormorant Garamond',serif`
      ctx.fillStyle = 'rgba(170,180,200,.45)'
      ctx.fillText(typeData.nickname, cx, headerY + Math.max(14, W * .055))

      // -- Function stack bars --
      const barAreaX = W * .12
      const barAreaW = W * .76
      const barAreaY = H * .22
      const barH = H * .13
      const gap = H * .04
      const hovIdx = hovRef.current

      for (let i = 0; i < 4; i++) {
        const fnCode = stack[i]
        const fnData = MBTI_FUNCTIONS.find(f => f.code === fnCode)
        const colorBase = FUNCTION_COLORS[fnCode]
        const strength = STACK_STRENGTHS[i]
        const by = barAreaY + i * (barH + gap)
        const isHov = hovIdx === i
        const gp = .15 + .08 * Math.sin(pulse + i * .7)

        // Bar background track
        ctx.beginPath()
        ctx.roundRect(barAreaX, by, barAreaW, barH, 6)
        ctx.fillStyle = 'rgba(255,255,255,.02)'
        ctx.fill()
        ctx.strokeStyle = `rgba(255,255,255,${isHov ? .08 : .03})`
        ctx.lineWidth = .5
        ctx.stroke()

        // Filled bar
        const fillW = barAreaW * strength
        const barGrad = ctx.createLinearGradient(barAreaX, by, barAreaX + fillW, by)
        barGrad.addColorStop(0, colorBase + (isHov ? (.5 + gp) : (.3 + gp)) + ')')
        barGrad.addColorStop(1, colorBase + (isHov ? (.2 + gp * .5) : (.08 + gp * .3)) + ')')
        ctx.beginPath()
        ctx.roundRect(barAreaX, by, fillW, barH, 6)
        ctx.fillStyle = barGrad
        ctx.fill()

        // Bar glow on hover
        if (isHov) {
          const glowGrad = ctx.createLinearGradient(barAreaX, by, barAreaX + fillW, by)
          glowGrad.addColorStop(0, colorBase + '.15)')
          glowGrad.addColorStop(1, colorBase + '0)')
          ctx.beginPath()
          ctx.roundRect(barAreaX - 2, by - 2, fillW + 4, barH + 4, 8)
          ctx.fillStyle = glowGrad
          ctx.fill()
        }

        // Bar border
        ctx.beginPath()
        ctx.roundRect(barAreaX, by, fillW, barH, 6)
        ctx.strokeStyle = colorBase + (isHov ? '.5)' : '.25)')
        ctx.lineWidth = isHov ? 1.2 : .7
        ctx.stroke()

        // Function code label (inside bar left)
        const labelSize = Math.max(12, barH * .45)
        ctx.font = `bold ${labelSize}px 'Cinzel',serif`
        ctx.fillStyle = colorBase + (isHov ? '.95)' : '.8)')
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(fnCode, barAreaX + 10, by + barH / 2)

        // Function name (right of code)
        if (fnData) {
          ctx.font = `${Math.max(8, barH * .28)}px 'Cormorant Garamond',serif`
          ctx.fillStyle = `rgba(170,180,200,${isHov ? .7 : .45})`
          ctx.textAlign = 'left'
          ctx.fillText(fnData.name, barAreaX + 10 + labelSize * 1.8, by + barH / 2)
        }

        // Stack position label (right side)
        ctx.font = `${Math.max(7, barH * .22)}px 'Cinzel',serif`
        ctx.fillStyle = `rgba(201,168,76,${isHov ? .6 : .3})`
        ctx.textAlign = 'right'
        ctx.fillText(STACK_LABELS[i], barAreaX + barAreaW - 8, by + barH / 2)

        // Strength percentage (far right outside)
        ctx.font = `${Math.max(7, barH * .22)}px 'Inconsolata',monospace`
        ctx.fillStyle = colorBase + (isHov ? '.6)' : '.35)')
        ctx.textAlign = 'right'
        ctx.fillText(Math.round(strength * 100) + '%', barAreaX + barAreaW - 8, by + barH * .82)

        // Hover tooltip: show function description below bar
        if (isHov && fnData) {
          const descY = by + barH + 3
          ctx.font = `${Math.max(7, W * .028)}px 'Cormorant Garamond',serif`
          ctx.fillStyle = 'rgba(201,168,76,.45)'
          ctx.textAlign = 'left'
          // Truncate description to fit
          const desc = fnData.description
          const maxChars = Math.floor(barAreaW / (W * .015))
          const truncated = desc.length > maxChars ? desc.slice(0, maxChars) + '...' : desc
          ctx.fillText(truncated, barAreaX, descY)
        }
      }

      // -- Bottom: compatible types --
      if (typeData.compatible) {
        const compY = H * .88
        ctx.font = `${Math.max(6, W * .028)}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,.25)'
        ctx.textAlign = 'center'
        ctx.fillText('COMPATIBLE', cx, compY - 12)

        const compW = barAreaW / typeData.compatible.length
        typeData.compatible.forEach((c, i) => {
          const compType = MBTI_TYPES.find(t => t.code === c)
          const compColor = compType ? compType.color : 'rgba(201,168,76,'
          const compX = barAreaX + i * compW + compW / 2

          // Small dot
          ctx.beginPath()
          ctx.arc(compX, compY + 4, 3, 0, Math.PI * 2)
          ctx.fillStyle = compColor + (.3 + .1 * Math.sin(pulse + i)) + ')'
          ctx.fill()

          // Code
          ctx.font = `${Math.max(8, W * .032)}px 'Inconsolata',monospace`
          ctx.fillStyle = compColor + '.55)'
          ctx.textAlign = 'center'
          ctx.fillText(c, compX, compY + 18)
        })
      }

      // -- Legend corner --
      const legX = 6, legY = H - 16
      ctx.font = `${Math.max(6, W * .024)}px 'Inconsolata',monospace`
      ctx.fillStyle = 'rgba(170,180,200,.25)'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText('Cognitive Function Stack', legX, legY)

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [type])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
