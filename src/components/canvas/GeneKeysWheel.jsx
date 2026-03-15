import { useEffect, useRef } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { SPHERES } from '../../data/geneKeysData'

// GeneKeysWheel uses SPHERES derived from the engine (via geneKeysData.js).
// To render a custom profile, pass a `spheres` prop (array of sphere objects).
// Default falls back to the statically-computed default profile (Gaston).

export default function GeneKeysWheel({ spheres: spheresProp }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const activeSpheres = spheresProp || SPHERES

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

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
      const R = Math.min(W, H) * .42

      // Flower of life background
      ctx.save()
      ctx.globalAlpha = .06
      const fR = R * .3
      const flowerPts = [[0, 0], [1, 0], [-1, 0], [.5, .866], [-.5, .866], [.5, -.866], [-.5, -.866]]
      flowerPts.forEach(([px, py]) => {
        ctx.beginPath()
        ctx.arc(cx + px * fR, cy + py * fR, fR, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(201,168,76,.8)'
        ctx.lineWidth = .6
        ctx.stroke()
      })
      ctx.restore()

      // I-Ching ring (64 hexagrams)
      ctx.save()
      ctx.globalAlpha = .15
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * Math.PI * 2 - Math.PI / 2
        const rO = R * .98, rI = R * .85
        const a0 = a - Math.PI / 68, a1 = a + Math.PI / 68
        ctx.beginPath()
        ctx.arc(cx, cy, rO, a0, a1)
        ctx.arc(cx, cy, rI, a1, a0, true)
        ctx.closePath()
        const isKey = i % 8 === 0
        ctx.strokeStyle = `rgba(201,168,76,${isKey ? .6 : .25})`
        ctx.lineWidth = isKey ? .5 : .35
        ctx.stroke()
        if (isKey) {
          const tR = R * .91
          ctx.fillStyle = 'rgba(201,168,76,.4)'
          ctx.font = `${Math.max(5, R * .05)}px Inconsolata,monospace`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(i + 1, cx + tR * Math.cos(a), cy + tR * Math.sin(a))
        }
      }
      ctx.restore()

      // Concentric rings
      ;[.78, .58, .38].forEach((rf, i) => {
        ctx.beginPath()
        ctx.arc(cx, cy, R * rf, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(201,168,76,${[.08, .06, .04][i]})`
        ctx.lineWidth = .5
        ctx.stroke()
      })

      // Pathways between spheres
      const outerSpheres = activeSpheres.filter(s => !s.center)
      const centerSphere = activeSpheres.find(s => s.center)

      // Connect all outer spheres to center
      if (centerSphere) {
        outerSpheres.forEach(s => {
          ctx.beginPath()
          ctx.moveTo(s.xf * W, s.yf * H)
          ctx.lineTo(centerSphere.xf * W, centerSphere.yf * H)
          ctx.strokeStyle = 'rgba(140,110,70,.2)'
          ctx.lineWidth = .7
          ctx.stroke()
        })
      }

      // Connect outer spheres to each other
      for (let i = 0; i < outerSpheres.length; i++) {
        for (let j = i + 1; j < outerSpheres.length; j++) {
          ctx.beginPath()
          ctx.moveTo(outerSpheres[i].xf * W, outerSpheres[i].yf * H)
          ctx.lineTo(outerSpheres[j].xf * W, outerSpheres[j].yf * H)
          ctx.strokeStyle = 'rgba(96,176,48,.15)'
          ctx.lineWidth = .5
          ctx.stroke()
        }
      }

      // Draw spheres
      const baseSr = R * .13
      activeSpheres.forEach((s, i) => {
        const x = s.xf * W, y = s.yf * H
        const sr = s.center ? baseSr * 1.1 : baseSr
        const glow = .3 + .12 * Math.sin(pulse * 1.5 + i * 1.3)

        // Aura glow
        const aura = ctx.createRadialGradient(x, y, 0, x, y, sr * 2.2)
        aura.addColorStop(0, s.col + (glow * .7) + ')')
        aura.addColorStop(1, s.col + '0)')
        ctx.beginPath()
        ctx.arc(x, y, sr * 2.2, 0, Math.PI * 2)
        ctx.fillStyle = aura
        ctx.fill()

        // Sphere body
        const sg = ctx.createRadialGradient(x - sr * .25, y - sr * .25, 0, x, y, sr)
        sg.addColorStop(0, s.col + '0.6)')
        sg.addColorStop(.6, s.col + '0.35)')
        sg.addColorStop(1, s.col + '0.12)')
        ctx.beginPath()
        ctx.arc(x, y, sr, 0, Math.PI * 2)
        ctx.fillStyle = sg
        ctx.fill()
        ctx.strokeStyle = s.col + '0.6)'
        ctx.lineWidth = 1.2
        ctx.stroke()

        // Key number in center of sphere
        const fontSize = Math.max(9, sr * .65)
        ctx.font = `bold ${fontSize}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(255,255,255,.92)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(s.key), x, y)

        // Role label outside sphere
        if (!s.center) {
          const labelSize = Math.max(7, sr * .48)
          ctx.font = `${labelSize}px 'Cinzel',serif`
          ctx.fillStyle = s.col + '0.75)'
          // Position labels relative to sphere location
          const labelY = s.yf < .4 ? y - sr - labelSize * 1.2
            : s.yf > .6 ? y + sr + labelSize * 1.4
            : y - sr - labelSize * 1.1
          ctx.fillText(s.role, x, labelY)

          // Line number
          const lineSize = Math.max(6, sr * .38)
          ctx.font = `${lineSize}px 'Inconsolata',monospace`
          ctx.fillStyle = 'rgba(201,168,76,.4)'
          const lineY = s.yf < .4 ? labelY - lineSize * 1.5 : labelY + lineSize * 1.6
          ctx.fillText('Line ' + s.line, x, lineY)
        }
      })

      // Legend
      const lx = 8, ly = H - 42
      const legSize = Math.max(6, R * .048)
      const items = [
        ['Shadow', 'rgba(220,60,60,.65)'],
        ['Gift', 'rgba(64,204,221,.65)'],
        ['Siddhi', 'rgba(201,168,76,.55)'],
      ]
      items.forEach(([label, color], i) => {
        ctx.fillStyle = color
        ctx.fillRect(lx, ly + i * (legSize + 6), legSize * 2.5, legSize * .8)
        ctx.font = `${legSize}px Cinzel,serif`
        ctx.fillStyle = 'rgba(170,180,200,.55)'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, lx + legSize * 3, ly + i * (legSize + 6) + legSize * .4)
      })

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
