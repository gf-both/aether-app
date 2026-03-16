import { useEffect, useRef, useMemo } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { getNumerologyProfileFromDob } from '../../engines/numerologyEngine'

const COLORS = [
  '#c9a84c', // Life Path
  '#4dccd8', // Expression
  '#c44d7a', // Soul Urge
  '#a060e0', // Master (M11 or M22)
  '#88cc55', // Birthday (reduced)
  '#e09040', // Maturity
  '#7030b0', // Pinnacle active
  '#99ccee', // Personality
  '#ee6644', // Pinnacle I
  '#e8cc50', // Pinnacle II
]

export default function NumerologyBars() {
  const canvasRef = useRef(null)
  const profile = useAboveInsideStore((s) => s.activeViewProfile || s.primaryProfile)

  const { nums, labs } = useMemo(() => {
    try {
      const now = new Date()
      const dob = profile?.dob || ''
      const fullName = profile?.name
        ? profile.name.toUpperCase()
        : ''
      if (!dob || !fullName) return { nums: new Array(10).fill(0), labs: ['LP','Ex','SU','M—','BD','Mt','Pn','Pe','P1','P2'] }

      const p = getNumerologyProfileFromDob(dob, fullName, {
        currentYear:  now.getFullYear(),
        currentMonth: now.getMonth() + 1,
        currentDay:   now.getDate(),
      })

      const { core, pinnacles, extended } = p

      // Build bar data: value + label pairs
      const bars = [
        { n: core.lifePath.val,    l: 'LP'   },
        { n: core.expression.val,  l: 'Ex'   },
        { n: core.soulUrge.val,    l: 'SU'   },
        // Master number in name (or 0)
        { n: extended.masterNumbers[0] || 0,  l: `M${extended.masterNumbers[0] || '—'}` },
        { n: core.birthday.reduced, l: 'BD'  },
        { n: core.maturity.val,    l: 'Mt'   },
        // Active pinnacle
        { n: pinnacles[extended.activePhaseIndex]?.num || 0, l: 'Pn'  },
        { n: core.personality.val, l: 'Pe'   },
        { n: pinnacles[0]?.num || 0, l: 'P1' },
        { n: pinnacles[1]?.num || 0, l: 'P2' },
      ]

      return {
        nums: bars.map(b => b.n),
        labs: bars.map(b => b.l),
      }
    } catch (e) {
      console.error('NumerologyBars engine error:', e)
      // Fallback to hardcoded values
      return {
        nums: [7, 1, 3, 22, 5, 8, 6, 7, 6, 6],
        labs: ['LP', 'Ex', 'SU', 'M22', 'BD', 'Mt', 'Pn', 'Pe', 'P1', 'P2'],
      }
    }
  }, [profile?.dob, profile?.name])

  useCanvasResize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr
      const H = canvas.height / dpr
      if (W === 0 || H === 0) return
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const bw = W / nums.length
      const pad = 3

      nums.forEach((n, i) => {
        const maxN = 22
        const h = (n / maxN) * (H - 14)
        const x = i * bw + pad
        const bWidth = bw - pad * 2
        const col = COLORS[i] || '#888'

        const g = ctx.createLinearGradient(0, H - h, 0, H)
        g.addColorStop(0, col + 'ee')
        g.addColorStop(1, col + '44')

        ctx.beginPath()
        if (ctx.roundRect) ctx.roundRect(x, H - h, bWidth, h, 2.5)
        else ctx.rect(x, H - h, bWidth, h)
        ctx.fillStyle = g
        ctx.fill()

        ctx.font = '6.5px Inconsolata,monospace'
        ctx.fillStyle = col
        ctx.textAlign = 'center'
        ctx.fillText(n || '', i * bw + bw / 2, H - h - 2)

        ctx.fillStyle = 'rgba(100,110,150,.45)'
        ctx.fillText(labs[i], i * bw + bw / 2, H - 1)
      })

      ctx.restore()
    }

    const ro = new ResizeObserver(() => draw())
    ro.observe(canvas)
    draw()
    return () => { ro.disconnect() }
  }, [nums, labs])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '50px', flexShrink: 0, borderRadius: '7px' }}
    />
  )
}
