import { useEffect, useRef, useMemo, useState } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { useGolemStore } from '../../store/useGolemStore'
import { SPHERES, computeGeneKeysData } from '../../data/geneKeysData'

// Gene Keys data lookup
const GENE_KEYS_DATA = {
  1:  { shadow: 'Entropy',          gift: 'Freshness',       siddhi: 'Beauty',           iching: 'The Creative' },
  2:  { shadow: 'Dislocation',      gift: 'Orientation',     siddhi: 'Unity',            iching: 'The Receptive' },
  3:  { shadow: 'Chaos',            gift: 'Innovation',      siddhi: 'Innocence',        iching: 'Difficulty at the Beginning' },
  4:  { shadow: 'Intolerance',      gift: 'Understanding',   siddhi: 'Forgiveness',      iching: 'Youthful Folly' },
  5:  { shadow: 'Impatience',       gift: 'Patience',        siddhi: 'Timelessness',     iching: 'Waiting' },
  6:  { shadow: 'Conflict',         gift: 'Diplomacy',       siddhi: 'Peace',            iching: 'Conflict' },
  7:  { shadow: 'Division',         gift: 'Guidance',        siddhi: 'Virtue',           iching: 'The Army' },
  8:  { shadow: 'Mediocrity',       gift: 'Style',           siddhi: 'Exquisiteness',    iching: 'Holding Together' },
  9:  { shadow: 'Inertia',          gift: 'Determination',   siddhi: 'Invincibility',    iching: 'The Taming Power of the Small' },
  10: { shadow: 'Self-Obsession',   gift: 'Naturalness',     siddhi: 'Being',            iching: 'Treading' },
  11: { shadow: 'Obscurity',        gift: 'Idealism',        siddhi: 'Light',            iching: 'Peace' },
  12: { shadow: 'Vanity',           gift: 'Discrimination',  siddhi: 'Purity',           iching: 'Standstill' },
  13: { shadow: 'Discord',          gift: 'Empathy',         siddhi: 'Cosmic Memory',    iching: 'Fellowship' },
  14: { shadow: 'Compromise',       gift: 'Competence',      siddhi: 'Bounteousness',    iching: 'Possession in Great Measure' },
  15: { shadow: 'Dullness',         gift: 'Magnetism',       siddhi: 'Florescence',      iching: 'Modesty' },
  16: { shadow: 'Indifference',     gift: 'Versatility',     siddhi: 'Mastery',          iching: 'Enthusiasm' },
  17: { shadow: 'Opinion',          gift: 'Far-Sightedness', siddhi: 'Omniscience',      iching: 'Following' },
  18: { shadow: 'Judgment',         gift: 'Integrity',       siddhi: 'Perfection',       iching: 'Work on What Has Been Spoiled' },
  19: { shadow: 'Co-Dependence',    gift: 'Sensitivity',     siddhi: 'Sacrifice',        iching: 'Approach' },
  20: { shadow: 'Superficiality',   gift: 'Self-Assurance',  siddhi: 'Presence',         iching: 'Contemplation' },
  21: { shadow: 'Control',          gift: 'Authority',       siddhi: 'Valour',           iching: 'Biting Through' },
  22: { shadow: 'Dishonour',        gift: 'Graciousness',    siddhi: 'Grace',            iching: 'Grace' },
  23: { shadow: 'Complexity',       gift: 'Simplicity',      siddhi: 'Quintessence',     iching: 'Splitting Apart' },
  24: { shadow: 'Addiction',        gift: 'Invention',       siddhi: 'Silence',          iching: 'Return' },
  25: { shadow: 'Constriction',     gift: 'Acceptance',      siddhi: 'Universal Love',   iching: 'Innocence' },
  26: { shadow: 'Pride',            gift: 'Artfulness',      siddhi: 'Invisibility',     iching: 'The Taming Power of the Great' },
  27: { shadow: 'Selfishness',      gift: 'Altruism',        siddhi: 'Selflessness',     iching: 'Nourishment' },
  28: { shadow: 'Purposelessness',  gift: 'Totality',        siddhi: 'Immortality',      iching: 'Preponderance of the Great' },
  29: { shadow: 'Half-Heartedness', gift: 'Commitment',      siddhi: 'Devotion',         iching: 'The Abysmal' },
  30: { shadow: 'Desire',           gift: 'Lightness',       siddhi: 'Rapture',          iching: 'The Clinging' },
  31: { shadow: 'Arrogance',        gift: 'Leadership',      siddhi: 'Humility',         iching: 'Influence' },
  32: { shadow: 'Failure',          gift: 'Preservation',    siddhi: 'Veneration',       iching: 'Duration' },
  33: { shadow: 'Forgetting',       gift: 'Mindfulness',     siddhi: 'Revelation',       iching: 'Retreat' },
  34: { shadow: 'Force',            gift: 'Strength',        siddhi: 'Majesty',          iching: 'The Power of the Great' },
  35: { shadow: 'Hunger',           gift: 'Adventure',       siddhi: 'Boundlessness',    iching: 'Progress' },
  36: { shadow: 'Turbulence',       gift: 'Humanity',        siddhi: 'Compassion',       iching: 'Darkening of the Light' },
  37: { shadow: 'Weakness',         gift: 'Equality',        siddhi: 'Tenderness',       iching: 'The Family' },
  38: { shadow: 'Struggle',         gift: 'Perseverance',    siddhi: 'Honour',           iching: 'Opposition' },
  39: { shadow: 'Provocation',      gift: 'Dynamism',        siddhi: 'Liberation',       iching: 'Obstruction' },
  40: { shadow: 'Exhaustion',       gift: 'Resolve',         siddhi: 'Divine Will',      iching: 'Deliverance' },
  41: { shadow: 'Fantasy',          gift: 'Anticipation',    siddhi: 'Emanation',        iching: 'Decrease' },
  42: { shadow: 'Expectation',      gift: 'Detachment',      siddhi: 'Celebration',      iching: 'Increase' },
  43: { shadow: 'Deafness',         gift: 'Insight',         siddhi: 'Epiphany',         iching: 'Breakthrough' },
  44: { shadow: 'Interference',     gift: 'Teamwork',        siddhi: 'Synarchy',         iching: 'Coming to Meet' },
  45: { shadow: 'Dominance',        gift: 'Synergy',         siddhi: 'Communion',        iching: 'Gathering Together' },
  46: { shadow: 'Seriousness',      gift: 'Delight',         siddhi: 'Ecstasy',          iching: 'Pushing Upward' },
  47: { shadow: 'Oppression',       gift: 'Transmutation',   siddhi: 'Transfiguration',  iching: 'Exhaustion' },
  48: { shadow: 'Inadequacy',       gift: 'Resourcefulness', siddhi: 'Wisdom',           iching: 'The Well' },
  49: { shadow: 'Reaction',         gift: 'Revolution',      siddhi: 'Rebirth',          iching: 'Revolution' },
  50: { shadow: 'Corruption',       gift: 'Equilibrium',     siddhi: 'Harmony',          iching: 'The Cauldron' },
  51: { shadow: 'Agitation',        gift: 'Initiative',      siddhi: 'Awakening',        iching: 'The Arousing' },
  52: { shadow: 'Stress',           gift: 'Restraint',       siddhi: 'Stillness',        iching: 'Keeping Still' },
  53: { shadow: 'Immaturity',       gift: 'Expansion',       siddhi: 'Superabundance',   iching: 'Development' },
  54: { shadow: 'Greed',            gift: 'Aspiration',      siddhi: 'Ascension',        iching: 'The Marrying Maiden' },
  55: { shadow: 'Victimisation',    gift: 'Freedom',         siddhi: 'Freedom',          iching: 'Abundance' },
  56: { shadow: 'Distraction',      gift: 'Enrichment',      siddhi: 'Intoxication',     iching: 'The Wanderer' },
  57: { shadow: 'Unease',           gift: 'Intuition',       siddhi: 'Clarity',          iching: 'The Gentle' },
  58: { shadow: 'Dissatisfaction',  gift: 'Vitality',        siddhi: 'Bliss',            iching: 'The Joyous' },
  59: { shadow: 'Dishonesty',       gift: 'Intimacy',        siddhi: 'Transparency',     iching: 'Dispersion' },
  60: { shadow: 'Limitation',       gift: 'Realism',         siddhi: 'Justice',          iching: 'Limitation' },
  61: { shadow: 'Psychosis',        gift: 'Inspiration',     siddhi: 'Sanctity',         iching: 'Inner Truth' },
  62: { shadow: 'Intellect',        gift: 'Precision',       siddhi: 'Impeccability',    iching: 'Preponderance of the Small' },
  63: { shadow: 'Doubt',            gift: 'Inquiry',         siddhi: 'Truth',            iching: 'After Completion' },
  64: { shadow: 'Confusion',        gift: 'Imagination',     siddhi: 'Illumination',     iching: 'Before Completion' },
}

// GeneKeysWheel uses SPHERES derived from the engine (via geneKeysData.js).
// To render a custom profile, pass a `spheres` prop (array of sphere objects).
// Default falls back to the statically-computed default profile.

export default function GeneKeysWheel({ spheres: spheresProp }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const [hoveredSphereIndex, setHoveredSphereIndex] = useState(null)
  const profile = useGolemStore((s) => s.activeViewProfile || s.primaryProfile)

  const computedSpheres = useMemo(() => {
    if (spheresProp) return spheresProp
    if (!profile?.dob) return null
    try {
      const [year, month, day] = (profile.dob || '').split('-').map(Number)
      const tob = profile.tob || '00:00'
      const [hour, minute] = tob.split(':').map(Number)
      const timezone = profile.birthTimezone ?? -3
      const { SPHERES: computed } = computeGeneKeysData({ day, month, year, hour: hour || 0, minute: minute || 0, timezone })
      return computed
    } catch (e) {
      console.error('GeneKeysWheel compute error:', e)
      return null
    }
  }, [spheresProp, profile?.dob, profile?.tob, profile?.birthTimezone])

  const activeSpheres = computedSpheres

  useCanvasResize(canvasRef)

  // Polyfill for ctx.roundRect if not available
  useEffect(() => {
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        const minSize = Math.min(w, h)
        if (r > minSize / 2) r = minSize / 2
        this.beginPath()
        this.moveTo(x + r, y)
        this.arcTo(x + w, y, x + w, y + h, r)
        this.arcTo(x + w, y + h, x, y + h, r)
        this.arcTo(x, y + h, x, y, r)
        this.arcTo(x, y, x + w, y, r)
        this.closePath()
      }
    }
  }, [])

  // Handle mouse movement for hover detection
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !activeSpheres) return

    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const mx = (e.clientX - rect.left)
      const my = (e.clientY - rect.top)

      const W = canvas.width / dpr
      const H = canvas.height / dpr
      const R = Math.min(W, H) * .42
      const baseSr = R * .155

      // Check distance to each sphere
      let foundIndex = null
      for (let i = 0; i < activeSpheres.length; i++) {
        const s = activeSpheres[i]
        const sx = s.xf * W
        const sy = s.yf * H
        const sr = s.center ? baseSr * 1.1 : baseSr

        const dx = mx - sx
        const dy = my - sy
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist <= sr * 1.3) {
          foundIndex = i
          break
        }
      }

      setHoveredSphereIndex(foundIndex)
      canvas.style.cursor = foundIndex !== null ? 'pointer' : 'default'
    }

    function handleMouseLeave() {
      setHoveredSphereIndex(null)
      canvas.style.cursor = 'default'
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [activeSpheres])

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

      // Empty state when no profile
      if (!activeSpheres) {
        ctx.font = `bold ${Math.max(11, R * .1)}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,0.4)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('⬡', cx, cy - R * .15)
        ctx.font = `${Math.max(9, R * .06)}px 'Cinzel',serif`
        ctx.fillText('Add birth date to activate', cx, cy + R * .1)
        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }

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
      const baseSr = R * .155
      activeSpheres.forEach((s, i) => {
        const x = s.xf * W, y = s.yf * H
        const sr = s.center ? baseSr * 1.1 : baseSr
        const glow = .3 + .12 * Math.sin(pulse * 1.5 + i * 1.3)
        const isHovered = hoveredSphereIndex === i

        // Aura glow (brighter when hovered)
        const glowIntensity = isHovered ? glow * 1.5 : glow
        const aura = ctx.createRadialGradient(x, y, 0, x, y, sr * 2.2)
        aura.addColorStop(0, s.col + (glowIntensity * .7) + ')')
        aura.addColorStop(1, s.col + '0)')
        ctx.beginPath()
        ctx.arc(x, y, sr * 2.2, 0, Math.PI * 2)
        ctx.fillStyle = aura
        ctx.fill()

        // Sphere body (scale up when hovered)
        const displaySr = isHovered ? sr * 1.15 : sr
        const sg = ctx.createRadialGradient(x - displaySr * .25, y - displaySr * .25, 0, x, y, displaySr)
        sg.addColorStop(0, s.col + '0.6)')
        sg.addColorStop(.6, s.col + '0.35)')
        sg.addColorStop(1, s.col + '0.12)')
        ctx.beginPath()
        ctx.arc(x, y, displaySr, 0, Math.PI * 2)
        ctx.fillStyle = sg
        ctx.fill()
        ctx.strokeStyle = s.col + (isHovered ? '0.95)' : '0.6)')
        ctx.lineWidth = isHovered ? 2 : 1.2
        ctx.stroke()

        // Key number in center of sphere
        const fontSize = Math.max(9, displaySr * .65)
        ctx.font = `bold ${fontSize}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(255,255,255,.92)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(s.key), x, y)

        // Role label outside sphere
        if (!s.center) {
          const labelSize = Math.max(8, sr * .44)
          ctx.font = `${labelSize}px 'Cinzel',serif`
          ctx.fillStyle = s.col + '0.85)'
          // Position labels: above sphere if in top half, below if bottom half
          const above = s.yf <= .5
          const rawLabelY = above ? y - sr - labelSize * 1.4 : y + sr + labelSize * 1.6
          // Clamp to canvas bounds
          const labelY = Math.max(labelSize * 1.5, Math.min(H - labelSize, rawLabelY))
          ctx.fillText(s.role, x, labelY)

          // Line number
          const lineSize = Math.max(7, sr * .36)
          ctx.font = `${lineSize}px 'Inconsolata',monospace`
          ctx.fillStyle = 'rgba(201,168,76,.5)'
          const lineY = above ? labelY - lineSize * 1.6 : labelY + lineSize * 1.8
          const clampedLineY = Math.max(lineSize, Math.min(H - 2, lineY))
          ctx.fillText('Line ' + s.line, x, clampedLineY)
        }
      })

      // Hover tooltip
      if (hoveredSphereIndex !== null) {
        const hoveredSphere = activeSpheres[hoveredSphereIndex]
        const geneData = GENE_KEYS_DATA[hoveredSphere.key]

        if (geneData) {
          const hx = hoveredSphere.xf * W
          const hy = hoveredSphere.yf * H
          const baseSr = R * .155
          const sr = hoveredSphere.center ? baseSr * 1.1 : baseSr

          // Tooltip box dimensions
          const tooltipPadding = 12
          const tooltipLineHeight = 18
          const tooltipWidth = 200
          const tooltipHeight = tooltipLineHeight * 5 + tooltipPadding * 2

          // Position tooltip above sphere if possible, otherwise below
          let tooltipY = hy - sr * 1.5 - tooltipHeight - 10
          if (tooltipY < 20) {
            tooltipY = hy + sr * 1.5 + 10
          }

          // Center horizontally on sphere
          let tooltipX = hx - tooltipWidth / 2
          if (tooltipX < 10) tooltipX = 10
          if (tooltipX + tooltipWidth > W - 10) tooltipX = W - tooltipWidth - 10

          // Dark semi-transparent background
          ctx.fillStyle = 'rgba(20,20,30,.92)'
          ctx.beginPath()
          ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 6)
          ctx.fill()

          // Border glow
          ctx.strokeStyle = hoveredSphere.col + '0.7)'
          ctx.lineWidth = 1.5
          ctx.stroke()

          // Title: Role name
          ctx.font = `bold 14px 'Cinzel',serif`
          ctx.fillStyle = 'rgba(255,255,255,.95)'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'top'
          ctx.fillText(hoveredSphere.role, tooltipX + tooltipPadding, tooltipY + tooltipPadding)

          // Key + Line
          ctx.font = `12px 'Inconsolata',monospace`
          ctx.fillStyle = 'rgba(201,168,76,.85)'
          ctx.fillText(`Key ${hoveredSphere.key} | Line ${hoveredSphere.line}`, tooltipX + tooltipPadding, tooltipY + tooltipPadding + tooltipLineHeight)

          // Shadow → Gift
          ctx.font = `11px 'Cinzel',serif`
          ctx.fillStyle = 'rgba(220,60,60,.75)'
          ctx.fillText(`Shadow: ${geneData.shadow}`, tooltipX + tooltipPadding, tooltipY + tooltipPadding + tooltipLineHeight * 2)

          ctx.fillStyle = 'rgba(64,204,221,.75)'
          ctx.fillText(`Gift: ${geneData.gift}`, tooltipX + tooltipPadding, tooltipY + tooltipPadding + tooltipLineHeight * 3)

          ctx.fillStyle = 'rgba(201,168,76,.75)'
          ctx.fillText(`Siddhi: ${geneData.siddhi}`, tooltipX + tooltipPadding, tooltipY + tooltipPadding + tooltipLineHeight * 4)

          // I-Ching (smaller text)
          ctx.font = `10px 'Cinzel',serif`
          ctx.fillStyle = 'rgba(180,180,200,.65)'
          ctx.fillText(`I-Ching: ${geneData.iching}`, tooltipX + tooltipPadding, tooltipY + tooltipPadding + tooltipLineHeight * 5)
        }
      }

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
  }, [profile?.dob, profile?.tob, profile?.birthTimezone, hoveredSphereIndex])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
