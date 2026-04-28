import { useEffect, useRef, useMemo, useState } from 'react'
import { useCanvasResize } from '../../hooks/useCanvasResize'
import { useGolemStore } from '../../store/useGolemStore'
import { SPHERES, computeGeneKeysData } from '../../data/geneKeysData'

const TAU = Math.PI * 2

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

// Pre-generate energy particles
function createEnergyParticles(count) {
  return Array.from({ length: count }, () => ({
    t: Math.random(),
    speed: 0.002 + Math.random() * 0.004,
    size: 1 + Math.random() * 2,
    phase: Math.random() * TAU,
    brightness: 0.5 + Math.random() * 0.5,
  }))
}

// Hexagonal outline for the wheel silhouette
const HEXAGON_OUTLINE = (() => {
  const pts = []
  const N = 48
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * TAU - Math.PI / 2
    const r = 0.44 + 0.02 * Math.sin(a * 6) // subtle hex wobble
    pts.push([0.5 + r * Math.cos(a), 0.5 + r * Math.sin(a)])
  }
  return pts
})()

export default function GeneKeysWheel({ spheres: spheresProp }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef(null)
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

  // Initialize particles once
  useEffect(() => {
    if (!particlesRef.current && activeSpheres) {
      const outerCount = activeSpheres.filter(s => !s.center).length
      const pathCount = outerCount // one path per outer sphere to center
      const pairCount = Math.min(outerCount * (outerCount - 1) / 2, 15)
      particlesRef.current = {
        silhouette: createEnergyParticles(40),
        pathsToCenter: Array.from({ length: pathCount }, () => createEnergyParticles(6)),
        pathsBetween: Array.from({ length: pairCount }, () => createEnergyParticles(4)),
        sphereOrbiters: activeSpheres.map(() => createEnergyParticles(5)),
        iChingRing: createEnergyParticles(30),
      }
    }
  }, [activeSpheres])

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
      pulse += .014

      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * .42
      const particles = particlesRef.current

      // Empty state when no profile
      if (!activeSpheres) {
        ctx.font = `bold ${Math.max(11, R * .1)}px 'Cinzel',serif`
        ctx.fillStyle = 'rgba(201,168,76,0.4)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('\u2B21', cx, cy - R * .15)
        ctx.font = `${Math.max(9, R * .06)}px 'Cinzel',serif`
        ctx.fillText('Add birth date to activate', cx, cy + R * .1)
        ctx.restore()
        animRef.current = requestAnimationFrame(draw)
        return
      }

      // ─── 1. Silhouette as flowing particle stream ───
      if (particles) {
        for (const p of particles.silhouette) {
          p.t = (p.t + p.speed * 0.4) % 1
          const idx = p.t * (HEXAGON_OUTLINE.length - 1)
          const i0 = Math.floor(idx), i1 = Math.min(i0 + 1, HEXAGON_OUTLINE.length - 1)
          const frac = idx - i0
          const sx = (HEXAGON_OUTLINE[i0][0] * (1 - frac) + HEXAGON_OUTLINE[i1][0] * frac) * W
          const sy = (HEXAGON_OUTLINE[i0][1] * (1 - frac) + HEXAGON_OUTLINE[i1][1] * frac) * H

          const alpha = 0.06 + 0.04 * Math.sin(pulse + p.phase)
          const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, p.size * 2)
          grd.addColorStop(0, `rgba(96,176,48,${alpha})`)
          grd.addColorStop(1, 'transparent')
          ctx.beginPath(); ctx.arc(sx, sy, p.size * 2, 0, TAU); ctx.fillStyle = grd; ctx.fill()
        }
      }

      // ─── 2. Flower of life background ───
      ctx.save()
      ctx.globalAlpha = .05
      const fR = R * .3
      const flowerPts = [[0, 0], [1, 0], [-1, 0], [.5, .866], [-.5, .866], [.5, -.866], [-.5, -.866]]
      flowerPts.forEach(([px, py]) => {
        ctx.beginPath()
        ctx.arc(cx + px * fR, cy + py * fR, fR, 0, TAU)
        ctx.strokeStyle = 'rgba(201,168,76,.8)'
        ctx.lineWidth = .6
        ctx.stroke()
      })
      ctx.restore()

      // ─── 3. I-Ching ring with flowing particles ───
      ctx.save()
      ctx.globalAlpha = .15
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * TAU - Math.PI / 2
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

      // I-Ching ring particles
      if (particles) {
        for (const p of particles.iChingRing) {
          p.t = (p.t + p.speed * 0.3) % 1
          const angle = p.t * TAU - Math.PI / 2
          const ringR = R * .915 + Math.sin(pulse + p.phase) * R * .02
          const px = cx + Math.cos(angle) * ringR
          const py = cy + Math.sin(angle) * ringR
          const alpha = 0.08 + 0.05 * Math.sin(pulse * 1.5 + p.phase)
          const grd = ctx.createRadialGradient(px, py, 0, px, py, p.size * 1.5)
          grd.addColorStop(0, `rgba(201,168,76,${alpha})`)
          grd.addColorStop(1, 'transparent')
          ctx.beginPath(); ctx.arc(px, py, p.size * 1.5, 0, TAU); ctx.fillStyle = grd; ctx.fill()
        }
      }

      // Concentric rings
      ;[.78, .58, .38].forEach((rf, i) => {
        ctx.beginPath()
        ctx.arc(cx, cy, R * rf, 0, TAU)
        ctx.strokeStyle = `rgba(201,168,76,${[.08, .06, .04][i]})`
        ctx.lineWidth = .5
        ctx.stroke()
      })

      // ─── 4. Pathways with flowing energy particles ───
      const outerSpheres = activeSpheres.filter(s => !s.center)
      const centerSphere = activeSpheres.find(s => s.center)

      // Paths from outer to center with particles
      if (centerSphere && particles) {
        outerSpheres.forEach((s, oi) => {
          const x1 = s.xf * W, y1 = s.yf * H
          const x2 = centerSphere.xf * W, y2 = centerSphere.yf * H

          // Glowing path line
          ctx.shadowColor = 'rgba(96,176,48,0.3)'
          ctx.shadowBlur = 5
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
          ctx.strokeStyle = `rgba(96,176,48,${0.25 + 0.08 * Math.sin(pulse + oi)})`
          ctx.lineWidth = 1.5; ctx.stroke()
          ctx.shadowBlur = 0

          // Outer glow
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
          ctx.strokeStyle = `rgba(96,176,48,${0.06 + 0.03 * Math.sin(pulse)})`
          ctx.lineWidth = 6; ctx.stroke()

          // Flowing particles along path
          if (particles.pathsToCenter[oi]) {
            for (const p of particles.pathsToCenter[oi]) {
              p.t = (p.t + p.speed) % 1
              const px = x1 + (x2 - x1) * p.t
              const py = y1 + (y2 - y1) * p.t
              const alpha = 0.5 + 0.3 * Math.sin(pulse * 2 + p.phase)
              const r = p.size * (0.8 + 0.3 * Math.sin(pulse + p.phase))

              const grd = ctx.createRadialGradient(px, py, 0, px, py, r * 3)
              grd.addColorStop(0, `rgba(140,210,100,${alpha})`)
              grd.addColorStop(0.5, `rgba(96,176,48,${alpha * 0.3})`)
              grd.addColorStop(1, 'transparent')
              ctx.beginPath(); ctx.arc(px, py, r * 3, 0, TAU); ctx.fillStyle = grd; ctx.fill()
              // Core dot
              ctx.beginPath(); ctx.arc(px, py, r * 0.7, 0, TAU)
              ctx.fillStyle = `rgba(220,255,200,${alpha * 0.8})`; ctx.fill()
            }
          }
        })
      }

      // Paths between outer spheres with particles
      let pairIdx = 0
      for (let i = 0; i < outerSpheres.length && pairIdx < 15; i++) {
        for (let j = i + 1; j < outerSpheres.length && pairIdx < 15; j++) {
          const x1 = outerSpheres[i].xf * W, y1 = outerSpheres[i].yf * H
          const x2 = outerSpheres[j].xf * W, y2 = outerSpheres[j].yf * H

          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
          ctx.strokeStyle = `rgba(96,176,48,${0.10 + 0.04 * Math.sin(pulse + i + j)})`
          ctx.lineWidth = .7; ctx.stroke()

          // Flowing particles
          if (particles && particles.pathsBetween[pairIdx]) {
            for (const p of particles.pathsBetween[pairIdx]) {
              p.t = (p.t + p.speed * 0.8) % 1
              const px = x1 + (x2 - x1) * p.t
              const py = y1 + (y2 - y1) * p.t
              const alpha = 0.3 + 0.2 * Math.sin(pulse * 2 + p.phase)
              const r = p.size * 0.6

              const grd = ctx.createRadialGradient(px, py, 0, px, py, r * 2)
              grd.addColorStop(0, `rgba(96,176,48,${alpha})`)
              grd.addColorStop(1, 'transparent')
              ctx.beginPath(); ctx.arc(px, py, r * 2, 0, TAU); ctx.fillStyle = grd; ctx.fill()
            }
          }
          pairIdx++
        }
      }

      // ─── 5. Draw spheres as particle clusters ───
      const baseSr = R * .155
      activeSpheres.forEach((s, i) => {
        const x = s.xf * W, y = s.yf * H
        const sr = s.center ? baseSr * 1.1 : baseSr
        const glow = .3 + .12 * Math.sin(pulse * 1.5 + i * 1.3)
        const isHovered = hoveredSphereIndex === i
        // s.col = 'rgba(r,g,b,' — normalize to just RGB digits
        const rgb = s.col.replace('rgba(', '').replace(/,\s*$/, '')
        const rgba = (a) => `rgba(${rgb},${a})`

        // Aura glow
        const glowIntensity = isHovered ? glow * 1.5 : glow
        const aura = ctx.createRadialGradient(x, y, 0, x, y, sr * 2.8)
        aura.addColorStop(0, rgba(glowIntensity * .7))
        aura.addColorStop(0.4, rgba(glowIntensity * .25))
        aura.addColorStop(1, rgba(0))
        ctx.beginPath()
        ctx.arc(x, y, sr * 2.8, 0, TAU)
        ctx.fillStyle = aura
        ctx.fill()

        // Inner ring
        ctx.beginPath(); ctx.arc(x, y, sr * 1.1, 0, TAU)
        ctx.strokeStyle = rgba(isHovered ? 0.85 : 0.5)
        ctx.lineWidth = isHovered ? 2 : 1.2; ctx.stroke()

        // Sphere body
        const displaySr = isHovered ? sr * 1.15 : sr
        const sg = ctx.createRadialGradient(x - displaySr * .25, y - displaySr * .25, 0, x, y, displaySr)
        sg.addColorStop(0, rgba(0.55))
        sg.addColorStop(.6, rgba(0.3))
        sg.addColorStop(1, rgba(0.10))
        ctx.beginPath()
        ctx.arc(x, y, displaySr, 0, TAU)
        ctx.fillStyle = sg
        ctx.fill()
        ctx.strokeStyle = rgba(isHovered ? 0.95 : 0.6)
        ctx.lineWidth = isHovered ? 2 : 1.2
        ctx.stroke()

        // Orbiting particles
        if (particles && particles.sphereOrbiters[i]) {
          for (const p of particles.sphereOrbiters[i]) {
            p.t = (p.t + p.speed * 0.6) % 1
            const angle = p.t * TAU + p.phase
            const orbitR = sr * 1.5 + Math.sin(pulse + p.phase) * sr * 0.25
            const px = x + Math.cos(angle) * orbitR
            const py = y + Math.sin(angle) * orbitR
            const alpha = 0.45 + 0.25 * Math.sin(pulse * 1.5 + p.phase)

            ctx.beginPath(); ctx.arc(px, py, p.size * 0.6, 0, TAU)
            ctx.fillStyle = rgba(alpha); ctx.fill()
            const trail = ctx.createRadialGradient(px, py, 0, px, py, p.size * 1.8)
            trail.addColorStop(0, rgba(alpha * 0.35))
            trail.addColorStop(1, 'transparent')
            ctx.beginPath(); ctx.arc(px, py, p.size * 1.8, 0, TAU); ctx.fillStyle = trail; ctx.fill()
          }
        }

        // Key number in center of sphere
        const isDark = document.documentElement.classList.contains('dark')
        const fontSize = Math.max(9, displaySr * .65)
        ctx.font = `bold ${fontSize}px 'Cinzel',serif`
        // Drop shadow for readability
        ctx.fillStyle = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(s.key), x + 0.5, y + 0.5)
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(26,26,46,0.9)'
        ctx.fillText(String(s.key), x, y)

        // Role label outside sphere
        if (!s.center) {
          const labelSize = Math.max(8, sr * .44)
          ctx.font = `${labelSize}px 'Cinzel',serif`
          // Drop shadow
          ctx.fillStyle = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)'
          const above = s.yf <= .5
          const rawLabelY = above ? y - sr - labelSize * 1.4 : y + sr + labelSize * 1.6
          const labelY = Math.max(labelSize * 1.5, Math.min(H - labelSize, rawLabelY))
          ctx.fillText(s.role, x + 0.5, labelY + 0.5)
          ctx.fillStyle = rgba(0.85)
          ctx.fillText(s.role, x, labelY)

          // Line number
          const lineSize = Math.max(7, sr * .36)
          ctx.font = `${lineSize}px 'Inconsolata',monospace`
          ctx.fillStyle = isDark ? 'rgba(201,168,76,.5)' : 'rgba(120,100,50,.6)'
          const lineY = above ? labelY - lineSize * 1.6 : labelY + lineSize * 1.8
          const clampedLineY = Math.max(lineSize, Math.min(H - 2, lineY))
          ctx.fillText('Line ' + s.line, x, clampedLineY)
        }
      })

      // ─── 6. Hover tooltip ───
      if (hoveredSphereIndex !== null) {
        const hoveredSphere = activeSpheres[hoveredSphereIndex]
        const geneData = GENE_KEYS_DATA[hoveredSphere.key]

        if (geneData) {
          const hx = hoveredSphere.xf * W
          const hy = hoveredSphere.yf * H
          const sr = hoveredSphere.center ? baseSr * 1.1 : baseSr

          const tooltipPadding = 12
          const tooltipLineHeight = 18
          const tooltipWidth = 200
          const tooltipHeight = tooltipLineHeight * 5 + tooltipPadding * 2

          let tooltipY = hy - sr * 1.5 - tooltipHeight - 10
          if (tooltipY < 20) tooltipY = hy + sr * 1.5 + 10

          let tooltipX = hx - tooltipWidth / 2
          if (tooltipX < 10) tooltipX = 10
          if (tooltipX + tooltipWidth > W - 10) tooltipX = W - tooltipWidth - 10

          ctx.fillStyle = 'rgba(20,20,30,.92)'
          ctx.beginPath()
          ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 6)
          ctx.fill()

          const hRgb = hoveredSphere.col.replace('rgba(', '').replace(/,\s*$/, '')
          ctx.strokeStyle = `rgba(${hRgb},0.7)`
          ctx.lineWidth = 1.5
          ctx.stroke()

          ctx.font = "bold 14px 'Cinzel',serif"
          ctx.fillStyle = 'rgba(255,255,255,0.95)'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'top'
          ctx.fillText(hoveredSphere.role, tooltipX + tooltipPadding, tooltipY + tooltipPadding)

          ctx.font = "12px 'Inconsolata',monospace"
          ctx.fillStyle = 'rgba(201,168,76,.85)'
          ctx.fillText(`Key ${hoveredSphere.key} | Line ${hoveredSphere.line}`, tooltipX + tooltipPadding, tooltipY + tooltipPadding + tooltipLineHeight)

          ctx.font = "11px 'Cinzel',serif"
          ctx.fillStyle = 'rgba(220,60,60,.75)'
          ctx.fillText(`Shadow: ${geneData.shadow}`, tooltipX + tooltipPadding, tooltipY + tooltipPadding + tooltipLineHeight * 2)

          ctx.fillStyle = 'rgba(64,204,221,.75)'
          ctx.fillText(`Gift: ${geneData.gift}`, tooltipX + tooltipPadding, tooltipY + tooltipPadding + tooltipLineHeight * 3)

          ctx.fillStyle = 'rgba(201,168,76,.75)'
          ctx.fillText(`Siddhi: ${geneData.siddhi}`, tooltipX + tooltipPadding, tooltipY + tooltipPadding + tooltipLineHeight * 4)

          ctx.font = "10px 'Cinzel',serif"
          ctx.fillStyle = 'rgba(180,180,200,.65)'
          ctx.fillText(`I-Ching: ${geneData.iching}`, tooltipX + tooltipPadding, tooltipY + tooltipPadding + tooltipLineHeight * 5)
        }
      }

      // ─── 7. Legend ───
      const isDarkLegend = document.documentElement.classList.contains('dark')
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
        ctx.fillStyle = isDarkLegend ? 'rgba(170,180,200,.65)' : 'rgba(90,74,48,.7)'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, lx + legSize * 3, ly + i * (legSize + 6) + legSize * .4)
      })

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [activeSpheres, hoveredSphereIndex])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
