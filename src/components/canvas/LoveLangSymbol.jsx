import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { useGolemStore } from '../../store/useGolemStore'
import { LOVE_LANGUAGES } from '../../engines/loveLangEngine'

const COLORS = {
  words: '#e8c547',
  acts:  '#47c8e8',
  gifts: '#e847a8',
  time:  '#47e88c',
  touch: '#c847e8',
}

export default function LoveLangSymbol() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(-1)
  const loveLanguage = useGolemStore((s) => s.loveLanguage)

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    const activeLang = loveLanguage
      ? LOVE_LANGUAGES.find(l => l.name === loveLanguage)
      : null
    const activeIdx = activeLang
      ? LOVE_LANGUAGES.findIndex(l => l.id === activeLang.id)
      : -1

    const handleMouseMove = (e) => {
      const r = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const mx = e.clientX - r.left, my = e.clientY - r.top
      const W = canvas.width / dpr, H = canvas.height / dpr
      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * .34
      hovRef.current = -1
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2
        const petalR = R * .72
        const px = cx + petalR * Math.cos(angle)
        const py = cy + petalR * Math.sin(angle)
        if (Math.hypot(mx - px, my - py) < R * .28) { hovRef.current = i; break }
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
      pulse += .012

      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * .34
      const hovI = hovRef.current

      // Empty state
      if (!activeLang) {
        // Faint rotating petals placeholder
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2 - Math.PI / 2 + pulse * .15
          const petalR = R * .5
          const px = cx + petalR * Math.cos(angle)
          const py = cy + petalR * Math.sin(angle)
          const lang = LOVE_LANGUAGES[i]
          const color = COLORS[lang.id]
          ctx.beginPath()
          ctx.ellipse(px, py, R * .22, R * .12, angle + Math.PI / 2, 0, Math.PI * 2)
          ctx.fillStyle = color.replace('#', 'rgba(') ? `${color}15` : 'rgba(201,168,76,0.06)'
          // Convert hex to rgba
          const r2 = parseInt(color.slice(1, 3), 16)
          const g2 = parseInt(color.slice(3, 5), 16)
          const b2 = parseInt(color.slice(5, 7), 16)
          ctx.fillStyle = `rgba(${r2},${g2},${b2},${.06 + .02 * Math.sin(pulse + i)})`
          ctx.fill()
        }

        ctx.font = `bold ${Math.max(11, R * .08)}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,0.4)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Take the Love Language Quiz', cx, cy - 10)
        ctx.font = `${Math.max(9, R * .055)}px ui-sans-serif, system-ui`
        ctx.fillStyle = 'rgba(201,168,76,0.25)'
        ctx.fillText('to activate', cx, cy + 14)
        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }

      // Background radial glow
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.5)
      bgGrad.addColorStop(0, 'rgba(201,168,76,.04)')
      bgGrad.addColorStop(1, 'rgba(201,168,76,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.5, 0, Math.PI * 2)
      ctx.fillStyle = bgGrad
      ctx.fill()

      // Outer ring
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.12, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(201,168,76,${.12 + .04 * Math.sin(pulse)})`
      ctx.lineWidth = .5
      ctx.stroke()

      // Inner ring
      ctx.beginPath()
      ctx.arc(cx, cy, R * .22, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(201,168,76,${.15 + .05 * Math.sin(pulse * .8)})`
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw five petals
      for (let i = 0; i < 5; i++) {
        const lang = LOVE_LANGUAGES[i]
        const color = COLORS[lang.id]
        const cr = parseInt(color.slice(1, 3), 16)
        const cg = parseInt(color.slice(3, 5), 16)
        const cb = parseInt(color.slice(5, 7), 16)
        const isActive = i === activeIdx
        const isHov = hovI === i
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2
        const petalDist = R * .62
        const px = cx + petalDist * Math.cos(angle)
        const py = cy + petalDist * Math.sin(angle)

        const petalPulse = .08 * Math.sin(pulse * 1.1 + i * 1.25)

        // Petal shape — ellipse
        const petalW = R * (.26 + (isActive ? .06 : 0) + (isHov ? .03 : 0) + (isActive ? petalPulse : 0))
        const petalH = R * (.42 + (isActive ? .08 : 0) + (isHov ? .04 : 0) + (isActive ? petalPulse * 1.3 : 0))

        // Glow for active petal
        if (isActive) {
          const glowR = petalH * 1.3
          const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR)
          glow.addColorStop(0, `rgba(${cr},${cg},${cb},${.25 + .1 * Math.sin(pulse * 1.2)})`)
          glow.addColorStop(.6, `rgba(${cr},${cg},${cb},.06)`)
          glow.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)
          ctx.beginPath()
          ctx.arc(px, py, glowR, 0, Math.PI * 2)
          ctx.fillStyle = glow
          ctx.fill()
        }

        // Petal body
        ctx.save()
        ctx.translate(px, py)
        ctx.rotate(angle + Math.PI / 2)
        ctx.beginPath()
        ctx.ellipse(0, 0, petalW, petalH, 0, 0, Math.PI * 2)

        const baseAlpha = isActive ? .35 : isHov ? .2 : .1
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, petalH)
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},${baseAlpha + (isActive ? petalPulse * .5 : 0)})`)
        grad.addColorStop(1, `rgba(${cr},${cg},${cb},${baseAlpha * .2})`)
        ctx.fillStyle = grad
        ctx.fill()

        // Petal border
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${isActive ? .6 + petalPulse * 2 : isHov ? .35 : .18})`
        ctx.lineWidth = isActive ? 1.8 : .8
        ctx.stroke()
        ctx.restore()

        // Connection line from center to petal
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(px, py)
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${isActive ? .2 : .06})`
        ctx.lineWidth = isActive ? 1.2 : .5
        ctx.stroke()

        // Emoji
        const emojiSize = isActive ? Math.max(16, R * .14) : Math.max(12, R * .1)
        ctx.font = `${emojiSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(lang.emoji, px, py - (isActive ? 8 : 4))

        // Label — language name
        const labelSize = isActive ? Math.max(8, R * .065) : Math.max(7, R * .05)
        ctx.font = `${isActive ? 'bold ' : ''}${labelSize}px 'Cinzel',serif`
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${isActive ? .9 : isHov ? .7 : .5})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Split name into lines if too long
        const words = lang.name.split(' ')
        if (words.length > 2) {
          const mid = Math.ceil(words.length / 2)
          const line1 = words.slice(0, mid).join(' ')
          const line2 = words.slice(mid).join(' ')
          ctx.fillText(line1, px, py + (isActive ? 10 : 8))
          ctx.fillText(line2, px, py + (isActive ? 10 : 8) + labelSize + 2)
        } else {
          ctx.fillText(lang.name, px, py + (isActive ? 10 : 8))
        }

        // Hover tooltip
        if (isHov && !isActive) {
          const tipY = py + (isActive ? 10 : 8) + labelSize + (words.length > 2 ? labelSize + 6 : 4)
          ctx.font = `${Math.max(7, R * .04)}px 'Inconsolata',monospace`
          ctx.fillStyle = `rgba(${cr},${cg},${cb},.45)`
          ctx.fillText(lang.desc, px, tipY)
        }
      }

      // Center — active language display
      if (activeLang) {
        const centerSize = Math.max(20, R * .18)
        ctx.font = `${centerSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(activeLang.emoji, cx, cy - 6)

        ctx.font = `bold ${Math.max(8, R * .06)}px 'Cinzel',serif`
        const ac = COLORS[activeLang.id]
        const acr = parseInt(ac.slice(1, 3), 16)
        const acg = parseInt(ac.slice(3, 5), 16)
        const acb = parseInt(ac.slice(5, 7), 16)
        ctx.fillStyle = `rgba(${acr},${acg},${acb},${.7 + .15 * Math.sin(pulse * .8)})`
        ctx.fillText(activeLang.name, cx, cy + centerSize * .55)
      }

      // Subtle rotation indicator — small dots on outer ring
      for (let i = 0; i < 5; i++) {
        const lang = LOVE_LANGUAGES[i]
        const color = COLORS[lang.id]
        const cr2 = parseInt(color.slice(1, 3), 16)
        const cg2 = parseInt(color.slice(3, 5), 16)
        const cb2 = parseInt(color.slice(5, 7), 16)
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2
        const dx = cx + R * 1.12 * Math.cos(angle)
        const dy = cy + R * 1.12 * Math.sin(angle)
        ctx.beginPath()
        ctx.arc(dx, dy, i === activeIdx ? 3.5 : 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${cr2},${cg2},${cb2},${i === activeIdx ? .7 : .2})`
        ctx.fill()
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
  }, [loveLanguage])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
