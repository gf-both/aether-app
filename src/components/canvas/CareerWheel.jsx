import { useEffect, useRef, useMemo } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { getNatalChart } from '../../engines/natalEngine'
import { computeHDChart } from '../../engines/hdEngine'
import { getNumerologyProfileFromDob } from '../../engines/numerologyEngine'
import { getMayanProfile } from '../../engines/mayanEngine'
import { getGeneKeysProfile } from '../../engines/geneKeysEngine'
import { getCelticTree } from '../../engines/celticTreeEngine'
import { getCareerAlignment } from '../../engines/careerAlignmentEngine'

const CATEGORIES = ['Leadership', 'Technical', 'Creative', 'Growth', 'Analytical', 'Strategy']
const CATEGORY_COLORS = {
  Leadership:  '#c9a84c',
  Technical:   '#4dccd8',
  Creative:    '#d43070',
  Growth:      '#60c850',
  Analytical:  '#9050e0',
  Strategy:    '#e08840',
}

function parseDOB(dob) {
  if (!dob) return null
  const [y, m, d] = dob.split('-').map(Number)
  return { year: y, month: m, day: d }
}
function parseTOB(tob) {
  if (!tob) return { hour: 0, minute: 0 }
  const [h, m] = tob.split(':').map(Number)
  return { hour: h || 0, minute: m || 0 }
}

export default function CareerWheel() {
  const canvasRef = useRef(null)
  const primaryProfile = useAboveInsideStore(s => s.primaryProfile)
  const activeViewProfile = useAboveInsideStore(s => s.activeViewProfile)
  const profile = activeViewProfile || primaryProfile
  const { width, height } = useCanvasResize(canvasRef)

  const alignment = useMemo(() => {
    try {
      const dob = parseDOB(profile.dob)
      const tob = parseTOB(profile.tob)
      if (!dob) return null

      const natal = getNatalChart({
        day: dob.day, month: dob.month, year: dob.year,
        hour: tob.hour, minute: tob.minute,
        lat: profile.birthLat ?? -34.6037,
        lon: profile.birthLon ?? -58.3816,
        timezone: profile.birthTimezone ?? -3,
      })

      const hd = computeHDChart({
        dateOfBirth: profile.dob,
        timeOfBirth: profile.tob || '00:00',
        utcOffset: profile.birthTimezone ?? -3,
      })

      const numerology = getNumerologyProfileFromDob(
        profile.dob,
        profile.name?.toUpperCase() || 'GASTON FRYDLEWSKI',
        { currentYear: new Date().getFullYear(), currentMonth: new Date().getMonth() + 1, currentDay: new Date().getDate() }
      )

      const mayanRaw = getMayanProfile(dob.day, dob.month, dob.year)
      const mayan = mayanRaw ? {
        tzolkin: {
          daySign: mayanRaw.tzolkin?.daySign,
          tone: mayanRaw.tzolkin?.tone?.number ?? mayanRaw.tzolkin?.tone,
        }
      } : null

      const gkRaw = getGeneKeysProfile({ day: dob.day, month: dob.month, year: dob.year, hour: tob.hour, minute: tob.minute, timezone: profile.birthTimezone ?? -3 })
      const geneKeys = gkRaw ? { spheres: gkRaw.spheres } : null
      const celtic = getCelticTree ? getCelticTree({ day: dob.day, month: dob.month }) : null

      return getCareerAlignment({ natal, hd, numerology, mayan, geneKeys, celtic })
    } catch (e) {
      console.warn('CareerWheel error:', e)
      return null
    }
  }, [profile.dob, profile.tob, profile.name, profile.birthLat, profile.birthLon, profile.birthTimezone])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const cx = W / 2
    const cy = H / 2
    const R = Math.min(W, H) * 0.38

    ctx.clearRect(0, 0, W, H)

    const catScores = alignment?.categoryScores || {}
    const n = CATEGORIES.length
    const angleStep = (2 * Math.PI) / n
    const startAngle = -Math.PI / 2 // start at top

    // Draw background rings
    for (let ring = 1; ring <= 4; ring++) {
      const r = R * (ring / 4)
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const angle = startAngle + i * angleStep
        const x = cx + r * Math.cos(angle)
        const y = cy + r * Math.sin(angle)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.strokeStyle = ring === 4 ? 'rgba(201,168,76,0.3)' : 'rgba(201,168,76,0.1)'
      ctx.lineWidth = ring === 4 ? 1.5 : 0.8
      ctx.stroke()
    }

    // Draw spoke lines
    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle))
      ctx.strokeStyle = 'rgba(201,168,76,0.2)'
      ctx.lineWidth = 0.8
      ctx.stroke()
    }

    // Draw filled polygon (alignment scores)
    if (alignment) {
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const cat = CATEGORIES[i]
        const score = (catScores[cat] || 0) / 100
        const angle = startAngle + i * angleStep
        const r = R * score
        const x = cx + r * Math.cos(angle)
        const y = cy + r * Math.sin(angle)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fillStyle = 'rgba(201,168,76,0.12)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(201,168,76,0.8)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw colored dots at each axis
      for (let i = 0; i < n; i++) {
        const cat = CATEGORIES[i]
        const score = (catScores[cat] || 0) / 100
        const angle = startAngle + i * angleStep
        const r = R * score
        const x = cx + r * Math.cos(angle)
        const y = cy + r * Math.sin(angle)
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = CATEGORY_COLORS[cat] || '#c9a84c'
        ctx.fill()
      }
    }

    // Labels
    const labelR = R * 1.22
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (let i = 0; i < n; i++) {
      const cat = CATEGORIES[i]
      const score = catScores[cat] || 0
      const angle = startAngle + i * angleStep
      const lx = cx + labelR * Math.cos(angle)
      const ly = cy + labelR * Math.sin(angle)

      ctx.font = `700 ${Math.max(8, Math.min(10, W * 0.026))}px 'Cinzel', serif`
      ctx.fillStyle = CATEGORY_COLORS[cat] || 'rgba(201,168,76,0.9)'
      ctx.fillText(cat.toUpperCase(), lx, ly - 7)

      ctx.font = `${Math.max(9, Math.min(11, W * 0.028))}px 'Cormorant Garamond', Georgia, serif`
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.fillText(`${score}%`, lx, ly + 7)
    }

    // Center label
    if (alignment?.primaryCategory) {
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `600 ${Math.max(8, Math.min(10, W * 0.024))}px 'Cinzel', serif`
      ctx.fillStyle = 'rgba(201,168,76,0.7)'
      ctx.fillText('CAREER', cx, cy - 10)
      ctx.font = `600 ${Math.max(9, Math.min(11, W * 0.028))}px 'Cinzel', serif`
      ctx.fillStyle = 'rgba(201,168,76,1)'
      ctx.fillText(alignment.primaryCategory.toUpperCase(), cx, cy + 8)
    }
  }, [alignment, width, height])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
