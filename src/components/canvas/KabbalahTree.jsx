import { useEffect, useRef, useMemo } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { SEPHIROTH, PATHS, PATH_COLORS } from '../../data/kabbalahData'
import { getKabbalahProfile, profileToKabArgs } from '../../engines/kabbalahEngine'
import { useComputedProfile as useActiveProfile } from '../../hooks/useActiveProfile'

export default function KabbalahTree() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const hovRef = useRef(-1)

  const profile = useActiveProfile()

  // Compute live active states from birth data; fall back to static SEPHIROTH if engine throws
  const sephirothLive = useMemo(() => {
    const args = profileToKabArgs(profile)
    if (!args) return null // no profile data — show empty state
    try {
      const result = getKabbalahProfile(args)
      return SEPHIROTH.map(s => {
        const computed = result.sephiroth.find(r => r.name === s.name)
        return computed ? { ...s, active: computed.active } : s
      })
    } catch {
      return null
    }
  }, [profile?.dob, profile?.tob, profile?.birthLat, profile?.birthLon, profile?.birthTimezone])

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    const handleMouseMove = (e) => {
      const r = canvas.getBoundingClientRect()
      const mx = e.clientX - r.left, my = e.clientY - r.top
      hovRef.current = -1
      sephirothLive.forEach((s, i) => {
        if (Math.hypot(mx - s.xf * (canvas.width / window.devicePixelRatio), my - s.yf * (canvas.height / window.devicePixelRatio)) < 20) hovRef.current = i
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
      pulse += .018

      // Empty state when no profile
      if (!sephirothLive) {
        const R = Math.min(W, H) * .4
        ctx.font = `bold ${Math.max(11, R * .12)}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,0.4)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('✡', W/2, H/2 - R * .15)
        ctx.font = `${Math.max(9, R * .07)}px 'Cinzel',serif`
        ctx.fillText('Add birth date to activate', W/2, H/2 + R * .1)
        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }

      const sr = Math.min(W, H) * .05
      const hovS = hovRef.current

      // Pillar lines
      ;[[W * .18, H * .12, H * .88, 'rgba(180,80,220,.04)'], [W * .5, H * .04, H * .96, 'rgba(255,255,255,.022)'], [W * .8, H * .12, H * .88, 'rgba(64,204,221,.04)']].forEach(([x, y0, y1, col]) => {
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.stroke()
      })

      // Paths
      PATHS.forEach(([ai, bi, num, ck]) => {
        const sA = sephirothLive[ai], sB = sephirothLive[bi]
        const ax = sA.xf * W, ay = sA.yf * H, bx = sB.xf * W, by = sB.yf * H
        const active = sA.active && sB.active
        const col = PATH_COLORS[ck] || (active ? 'rgba(201,168,76,.3)' : 'rgba(75,85,140,.11)')
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by)
        ctx.setLineDash([])
        ctx.strokeStyle = col; ctx.lineWidth = ck != null ? 1.8 : .7; ctx.stroke()
        if (active || ck != null) {
          const mx2 = (ax + bx) / 2, my2 = (ay + by) / 2
          const bubble = ck != null
          if (bubble) {
            ctx.beginPath(); ctx.arc(mx2, my2, 6.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(5,5,22,.88)'; ctx.fill()
            ctx.strokeStyle = col.replace('.68)', '.85)').replace('.58)', '.75)'); ctx.lineWidth = .8; ctx.stroke()
            ctx.font = "bold 7px 'Inconsolata',monospace"; ctx.fillStyle = 'rgba(255,240,200,.88)'
          } else {
            ctx.font = "6.5px 'Inconsolata',monospace"; ctx.fillStyle = 'rgba(201,168,76,.4)'
          }
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(num, mx2, my2)
        }
      })

      // Da'ath
      const dax = W * .5, day = H * .29, dar = sr * .56
      ctx.beginPath(); ctx.arc(dax, day, dar, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(150,80,220,${.22 + .09 * Math.sin(pulse)})`; ctx.lineWidth = .6
      ctx.setLineDash([2, 3]); ctx.stroke(); ctx.setLineDash([])
      ctx.font = "6px 'Cinzel',serif"; ctx.fillStyle = 'rgba(150,80,220,.38)'; ctx.textAlign = 'center'
      ctx.fillText("3", W * .46, H * .285); ctx.fillText("Da'ath", dax, day + dar + 8)

      // Sephiroth
      sephirothLive.forEach((s, idx) => {
        const x = s.xf * W, y = s.yf * H
        const r = sr * (s.name === 'Kether' ? 1.18 : s.name === 'Tiphareth' || s.name === 'Malkuth' ? 1.08 : 1)
        const hov = hovS === idx
        const gp = .22 + .11 * Math.sin(pulse + idx * .7)
        if (s.active) {
          const aura = ctx.createRadialGradient(x, y, 0, x, y, r * 2.6)
          aura.addColorStop(0, s.col + (hov ? .38 : gp) + ')'); aura.addColorStop(1, s.col + '0)')
          ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, Math.PI * 2); ctx.fillStyle = aura; ctx.fill()
        }
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
        if (s.active) {
          const fg = ctx.createRadialGradient(x, y, 0, x, y, r)
          fg.addColorStop(0, s.col + '0.42)'); fg.addColorStop(1, s.col + '0.1)')
          ctx.fillStyle = fg; ctx.fill(); ctx.strokeStyle = s.col + (hov ? '1)' : '0.7)')
        } else {
          ctx.fillStyle = 'rgba(18,22,55,.25)'; ctx.fill(); ctx.strokeStyle = 'rgba(65,78,138,.28)'
        }
        ctx.lineWidth = s.active ? 1.2 : .55; ctx.stroke()
        ctx.font = `${r * .85}px serif`; ctx.fillStyle = s.active ? s.col + (hov ? '1)' : '0.82)') : 'rgba(65,78,138,.38)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s.glyph, x, y)
        ctx.font = `${r * .4}px 'Inconsolata',monospace`; ctx.fillStyle = s.active ? 'rgba(201,168,76,.5)' : 'rgba(65,78,138,.22)'
        ctx.fillText(s.num, x - r * .62, y - r * .62)
        ctx.font = `${Math.max(6.5, r * .52)}px 'Cinzel',serif`; ctx.fillStyle = s.active ? s.col + (hov ? '1)' : '0.55)') : 'rgba(65,78,138,.25)'
        ctx.fillText(s.name, x, y + r * 1.5)
        ctx.font = `${Math.max(5.5, r * .4)}px 'Inconsolata',monospace`; ctx.fillStyle = s.active ? 'rgba(201,168,76,.4)' : 'rgba(65,78,138,.18)'
        ctx.fillText(s.ratio, x, y + r * 2.0)
        if (hov && s.active) {
          ctx.font = `${r * .44}px 'Cormorant Garamond',serif`; ctx.fillStyle = 'rgba(255,230,180,.65)'; ctx.fillText(s.attr, x, y - r * 1.85)
        }
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
  }, [profile?.dob, profile?.tob, profile?.birthLat, profile?.birthLon, profile?.birthTimezone])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
