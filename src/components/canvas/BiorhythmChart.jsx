import { useEffect, useRef } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { getBiorhythms } from '../../engines/biorhythmEngine'

const COLORS = {
  physical:     '#ff6b6b',
  emotional:    '#40ccdd',
  intellectual: '#c9a84c',
}

export default function BiorhythmChart() {
  const canvasRef   = useRef(null)
  const primaryProfile = useAboveInsideStore((s) => s.primaryProfile)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W   = canvas.offsetWidth  || 400
    const H   = canvas.offsetHeight || 260

    canvas.width  = W * window.devicePixelRatio
    canvas.height = H * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    ctx.clearRect(0, 0, W, H)

    // Background
    ctx.fillStyle = 'rgba(10,10,18,0)'
    ctx.fillRect(0, 0, W, H)

    // Parse birth date
    let dob = primaryProfile?.dob
    let bio
    if (dob) {
      const [y, m, d] = dob.split('-').map(Number)
      bio = getBiorhythms({ day: d, month: m, year: y })
    } else {
      bio = getBiorhythms({ day: 23, month: 1, year: 1981 })
    }

    const PAD_L = 36, PAD_R = 16, PAD_T = 20, PAD_B = 36
    const chartW = W - PAD_L - PAD_R
    const chartH = H - PAD_T - PAD_B
    const midY   = PAD_T + chartH / 2

    const days = 30

    // Grid — faint vertical lines every 5 days
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth   = 1
    for (let i = 0; i <= days; i += 5) {
      const x = PAD_L + (i / days) * chartW
      ctx.beginPath()
      ctx.moveTo(x, PAD_T)
      ctx.lineTo(x, PAD_T + chartH)
      ctx.stroke()
    }

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth   = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(PAD_L, midY)
    ctx.lineTo(PAD_L + chartW, midY)
    ctx.stroke()
    ctx.setLineDash([])

    // Y axis labels
    ctx.font        = '9px Inconsolata, monospace'
    ctx.fillStyle   = 'rgba(255,255,255,0.3)'
    ctx.textAlign   = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText('+1', PAD_L - 4, PAD_T + 4)
    ctx.fillText('0',  PAD_L - 4, midY)
    ctx.fillText('−1', PAD_L - 4, PAD_T + chartH - 4)

    // X axis labels
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'top'
    for (const label of ['-15', '-10', '-5', '0', '+5', '+10', '+15']) {
      const idx = parseInt(label) + 15
      const x   = PAD_L + (idx / days) * chartW
      ctx.fillText(label, x, PAD_T + chartH + 4)
    }

    // Draw curve helper
    function drawCurve(data, color) {
      ctx.strokeStyle = color
      ctx.lineWidth   = 2
      ctx.shadowColor = color
      ctx.shadowBlur  = 6
      ctx.beginPath()
      data.forEach((pt, i) => {
        const x = PAD_L + (i / (days - 1)) * chartW
        const y = midY - (pt.value * chartH / 2)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    drawCurve(bio.chartData.physical,     COLORS.physical)
    drawCurve(bio.chartData.emotional,    COLORS.emotional)
    drawCurve(bio.chartData.intellectual, COLORS.intellectual)

    // Today line (index 15 = center)
    const todayX = PAD_L + (15 / days) * chartW
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth   = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(todayX, PAD_T)
    ctx.lineTo(todayX, PAD_T + chartH)
    ctx.stroke()
    ctx.setLineDash([])

    // "Today" label
    ctx.font      = '8px Cinzel, serif'
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.textAlign = 'center'
    ctx.fillText('today', todayX, PAD_T - 6)

    // Dots at today's values
    const cycles = [
      { key: 'physical',     color: COLORS.physical },
      { key: 'emotional',    color: COLORS.emotional },
      { key: 'intellectual', color: COLORS.intellectual },
    ]
    cycles.forEach(({ key, color }) => {
      const val = bio.cycles[key].value
      const y   = midY - (val * chartH / 2)
      ctx.beginPath()
      ctx.arc(todayX, y, 4, 0, Math.PI * 2)
      ctx.fillStyle   = color
      ctx.shadowColor = color
      ctx.shadowBlur  = 10
      ctx.fill()
      ctx.shadowBlur  = 0
    })
  }, [primaryProfile])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 8, right: 12,
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        {[
          { label: 'Physical',     color: COLORS.physical },
          { label: 'Emotional',    color: COLORS.emotional },
          { label: 'Intellectual', color: COLORS.intellectual },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 16, height: 2, background: color, borderRadius: 2 }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inconsolata, monospace' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
