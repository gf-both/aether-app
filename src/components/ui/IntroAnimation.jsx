import { useRef, useEffect, useState } from 'react'

/**
 * GOLEM Intro — 3D particle formation sequence.
 * Particles scatter → coalesce into a random sacred geometry figure → compress → burst → wordmark.
 * Figures: Sphere, Merkaba, Ankh, Mayan Pyramid, Chinese Dragon, Tree of Life, Hexagram
 * Replays every page refresh. Uses WebGL for consistent visual quality.
 */

const VERT = `
  attribute vec3 aPos;
  attribute vec3 aScatter;
  attribute float aSize;
  attribute float aPhase;
  attribute float aColorId;

  uniform float uTime;
  uniform float uProgress;
  uniform mat4 uProj;
  uniform mat4 uView;
  uniform float uDpr;
  uniform float uExplosion;

  varying float vAlpha;
  varying float vColorId;
  varying float vDepth;

  void main() {
    float t = uTime * 0.001;
    float id = aPhase;

    vec3 spherePos = aPos;
    vec3 scatterPos = aScatter * 4.0;

    // Coalesce: scattered → figure (progress 0→0.4)
    float coalesce = smoothstep(0.0, 0.4, uProgress);
    vec3 pos = mix(scatterPos, spherePos, coalesce);

    // Compress (progress 0.5→0.7)
    float compress = smoothstep(0.5, 0.7, uProgress);
    pos *= mix(1.0, 0.3, compress);

    // Slow rotation
    float angle = t * 0.3 + id * 0.1;
    float cosA = cos(angle), sinA = sin(angle);
    vec3 rotated = vec3(
      pos.x * cosA - pos.z * sinA,
      pos.y,
      pos.x * sinA + pos.z * cosA
    );

    // Explosion (progress 0.75→1.0)
    float explode = uExplosion;
    vec3 explodeDir = normalize(spherePos + vec3(sin(id*6.28), cos(id*4.5), sin(id*3.14+1.0)));
    rotated += explodeDir * explode * 5.0;

    vec4 mvPos = uView * vec4(rotated, 1.0);
    gl_Position = uProj * mvPos;

    // Depth for fade
    vDepth = clamp(-mvPos.z * 0.15, 0.0, 1.0);

    // Alpha: fade in during coalesce, bright when formed, fade in explosion
    float formed = smoothstep(0.35, 0.5, uProgress);
    float explodeFade = 1.0 - smoothstep(0.8, 1.0, uProgress);
    float breathe = 0.85 + 0.15 * sin(t * 2.0 + id * 6.28);
    vAlpha = mix(0.15, 0.9 * breathe, coalesce) * explodeFade * (0.6 + formed * 0.4);

    vColorId = aColorId;

    // Size: larger when scattered, smaller when formed
    float baseSize = aSize * uDpr;
    gl_PointSize = mix(baseSize * 1.5, baseSize * 0.8, formed) * (1.0 + explode * 2.0);
  }
`

const FRAG = `
  precision mediump float;
  varying float vAlpha;
  varying float vColorId;
  varying float vDepth;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;

    float core = exp(-d * d * 3.0);
    float halo = exp(-d * d * 0.6) * 0.4;
    float alpha = (core + halo) * vAlpha;

    vec3 col;
    if (vColorId < 0.3) col = vec3(0.88, 0.72, 0.35);
    else if (vColorId < 0.55) col = vec3(0.95, 0.85, 0.55);
    else if (vColorId < 0.7) col = vec3(0.55, 0.65, 0.88);
    else if (vColorId < 0.85) col = vec3(0.85, 0.35, 0.55);
    else col = vec3(0.25, 0.78, 0.68);

    col = mix(col, vec3(1.0, 0.98, 0.9), core * core * 0.7);
    col = mix(col, vec3(0.7, 0.7, 0.75), vDepth * 0.2);

    gl_FragColor = vec4(col, alpha);
  }
`

function createShader(gl, type, source) {
  const s = gl.createShader(type)
  gl.shaderSource(s, source)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error('Shader:', gl.getShaderInfoLog(s)); gl.deleteShader(s); return null }
  return s
}

function createProgram(gl, vs, fs) {
  const p = gl.createProgram()
  gl.attachShader(p, vs)
  gl.attachShader(p, fs)
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.error('Program:', gl.getProgramInfoLog(p)); return null }
  return p
}

function mat4Perspective(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2), nf = 1 / (near - far)
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0])
}

function mat4LookAt(eye, center, up) {
  const zx = eye[0]-center[0], zy = eye[1]-center[1], zz = eye[2]-center[2]
  let len = 1/Math.sqrt(zx*zx+zy*zy+zz*zz)
  const z0=zx*len, z1=zy*len, z2=zz*len
  const xx=up[1]*z2-up[2]*z1, xy=up[2]*z0-up[0]*z2, xz=up[0]*z1-up[1]*z0
  len = Math.sqrt(xx*xx+xy*xy+xz*xz)
  const x0=len?xx/len:0, x1=len?xy/len:0, x2=len?xz/len:0
  const y0=z1*x2-z2*x1, y1=z2*x0-z0*x2, y2=z0*x1-z1*x0
  return new Float32Array([x0,y0,z0,0, x1,y1,z1,0, x2,y2,z2,0,
    -(x0*eye[0]+x1*eye[1]+x2*eye[2]), -(y0*eye[0]+y1*eye[1]+y2*eye[2]), -(z0*eye[0]+z1*eye[1]+z2*eye[2]), 1])
}

// ─── Sacred geometry figure generators ──────────────────────
// Each returns Float32Array of [x,y,z] * COUNT points

function fibSphere(count, radius) {
  const pts = new Float32Array(count * 3)
  const ga = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y) * radius
    const theta = ga * i
    pts[i*3] = Math.cos(theta) * r
    pts[i*3+1] = y * radius
    pts[i*3+2] = Math.sin(theta) * r
  }
  return pts
}

function merkaba(count) {
  // Two interlocking tetrahedra — Star of David in 3D
  const pts = new Float32Array(count * 3)
  const s = 1.2
  // Tetrahedron vertices (up)
  const tetUp = [[0,s,0], [-s,-s*0.5,s*0.866], [s,-s*0.5,s*0.866], [0,-s*0.5,-s*0.866]]
  // Tetrahedron vertices (down — inverted)
  const tetDn = [[0,-s,0], [-s,s*0.5,-s*0.866], [s,s*0.5,-s*0.866], [0,s*0.5,s*0.866]]
  const edges = [[0,1],[0,2],[0,3],[1,2],[2,3],[3,1]]

  for (let i = 0; i < count; i++) {
    const t = i / count
    const tet = t < 0.5 ? tetUp : tetDn
    const edgeIdx = Math.floor((t % 0.5) * 2 * edges.length) % edges.length
    const [a, b] = edges[edgeIdx]
    const lerp = Math.random()
    // Add slight noise to fill the edges
    const jitter = 0.03
    pts[i*3]   = tet[a][0] * (1-lerp) + tet[b][0] * lerp + (Math.random()-0.5) * jitter
    pts[i*3+1] = tet[a][1] * (1-lerp) + tet[b][1] * lerp + (Math.random()-0.5) * jitter
    pts[i*3+2] = tet[a][2] * (1-lerp) + tet[b][2] * lerp + (Math.random()-0.5) * jitter
  }
  return pts
}

function ankh(count) {
  // Egyptian Ankh — loop on top, cross below
  const pts = new Float32Array(count * 3)
  const halfCount = count / 2
  for (let i = 0; i < count; i++) {
    const t = i / count
    let x, y, z
    if (t < 0.35) {
      // Oval loop (top)
      const angle = (t / 0.35) * Math.PI * 2
      x = Math.cos(angle) * 0.5
      y = Math.sin(angle) * 0.7 + 0.9
      z = 0
    } else if (t < 0.55) {
      // Vertical shaft
      const st = (t - 0.35) / 0.2
      x = 0
      y = 0.9 - st * 2.2
      z = 0
    } else if (t < 0.7) {
      // Horizontal crossbar
      const st = (t - 0.55) / 0.15
      x = (st - 0.5) * 1.4
      y = 0.1
      z = 0
    } else {
      // Fill with surface noise around the shape
      const angle = Math.random() * Math.PI * 2
      const r = 0.05 + Math.random() * 0.08
      const baseT = Math.random()
      if (baseT < 0.4) {
        const a2 = baseT / 0.4 * Math.PI * 2
        x = Math.cos(a2) * 0.5 + Math.cos(angle) * r
        y = Math.sin(a2) * 0.7 + 0.9 + Math.sin(angle) * r
      } else {
        x = Math.cos(angle) * r
        y = 0.9 - (baseT - 0.4) / 0.6 * 2.2
      }
      z = (Math.random() - 0.5) * 0.15
    }
    pts[i*3] = x; pts[i*3+1] = y; pts[i*3+2] = z
  }
  return pts
}

function mayanPyramid(count) {
  // Stepped pyramid with 5 levels
  const pts = new Float32Array(count * 3)
  const levels = 5
  for (let i = 0; i < count; i++) {
    const t = i / count
    const level = Math.floor(t * levels)
    const levelT = (t * levels) % 1
    const halfSize = 1.2 - level * 0.2
    const yBase = -0.8 + level * 0.35
    const yTop = yBase + 0.3

    // Distribute on edges of each level
    const face = Math.floor(levelT * 4)
    const edgeT = (levelT * 4) % 1
    const h = yBase + Math.random() * (yTop - yBase)
    let x, z

    switch (face) {
      case 0: x = -halfSize + edgeT * 2 * halfSize; z = -halfSize; break
      case 1: x = halfSize; z = -halfSize + edgeT * 2 * halfSize; break
      case 2: x = halfSize - edgeT * 2 * halfSize; z = halfSize; break
      default: x = -halfSize; z = halfSize - edgeT * 2 * halfSize; break
    }

    // Add noise
    x += (Math.random() - 0.5) * 0.05
    z += (Math.random() - 0.5) * 0.05

    pts[i*3] = x; pts[i*3+1] = h; pts[i*3+2] = z
  }
  return pts
}

function chineseDragon(count) {
  // Sinuous S-curve dragon body with head and tail flourishes
  const pts = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const t = i / count
    // Spine: S-curve
    const spineT = t * 4 - 2 // -2 to 2
    const sx = spineT * 0.6
    const sy = Math.sin(spineT * Math.PI * 0.8) * 0.6
    const sz = Math.cos(spineT * Math.PI * 0.5) * 0.4

    // Body radius varies — thick in middle, thin at ends
    const bodyR = 0.15 + 0.25 * Math.sin(t * Math.PI) // 0 at ends, max at center

    // Head (first 15%)
    let hx = 0, hy = 0, hz = 0
    if (t < 0.15) {
      const ht = t / 0.15
      hx = (Math.random() - 0.5) * (0.4 - ht * 0.2)
      hy = (Math.random() - 0.5) * (0.5 - ht * 0.3) + 0.15
      hz = (Math.random() - 0.5) * 0.3
    }

    // Whiskers/horns (particles near head extend upward)
    if (t < 0.08) {
      const wt = t / 0.08
      hy += (1 - wt) * 0.4
      hx += Math.sin(wt * 6) * 0.15
    }

    // Tail flourish (last 10%)
    if (t > 0.9) {
      const tt = (t - 0.9) / 0.1
      hz += Math.sin(tt * Math.PI * 3) * 0.3 * tt
      hy += Math.cos(tt * Math.PI * 2) * 0.2 * tt
    }

    const angle = Math.random() * Math.PI * 2
    const r = Math.random() * bodyR

    pts[i*3]   = sx + Math.cos(angle) * r * 0.5 + hx
    pts[i*3+1] = sy + Math.sin(angle) * r + hy
    pts[i*3+2] = sz + (Math.random() - 0.5) * bodyR + hz
  }
  return pts
}

function treeOfLife(count) {
  // 10 Sephirot connected by 22 paths
  const seph = [
    [0, 1.5, 0],    // Keter
    [-0.6, 1.0, 0], // Chokmah
    [0.6, 1.0, 0],  // Binah
    [-0.6, 0.4, 0], // Chesed
    [0.6, 0.4, 0],  // Gevurah
    [0, 0.1, 0],    // Tiferet
    [-0.6, -0.4, 0],// Netzach
    [0.6, -0.4, 0], // Hod
    [0, -0.7, 0],   // Yesod
    [0, -1.2, 0],   // Malkut
  ]
  const paths = [[0,1],[0,2],[1,3],[2,4],[1,5],[2,5],[3,5],[4,5],[3,6],[4,7],[5,6],[5,7],[6,8],[7,8],[8,9],[5,8],[0,5],[3,7],[4,6],[1,2],[6,9],[7,9]]
  const pts = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const t = i / count
    if (t < 0.3) {
      // Sephirot spheres
      const si = Math.floor((t / 0.3) * seph.length) % seph.length
      const r = 0.12
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pts[i*3]   = seph[si][0] + r * Math.sin(phi) * Math.cos(theta)
      pts[i*3+1] = seph[si][1] + r * Math.sin(phi) * Math.sin(theta)
      pts[i*3+2] = seph[si][2] + r * Math.cos(phi)
    } else {
      // Paths between sephirot
      const pi = Math.floor(((t - 0.3) / 0.7) * paths.length) % paths.length
      const [a, b] = paths[pi]
      const lerp = Math.random()
      const jitter = 0.02
      pts[i*3]   = seph[a][0] * (1-lerp) + seph[b][0] * lerp + (Math.random()-0.5) * jitter
      pts[i*3+1] = seph[a][1] * (1-lerp) + seph[b][1] * lerp + (Math.random()-0.5) * jitter
      pts[i*3+2] = seph[a][2] * (1-lerp) + seph[b][2] * lerp + (Math.random()-0.5) * jitter
    }
  }
  return pts
}

function hexagram(count) {
  // Star of David — two overlapping triangles
  const pts = new Float32Array(count * 3)
  const s = 1.1
  const triUp = [[0, s, 0], [-s*0.866, -s*0.5, 0], [s*0.866, -s*0.5, 0]]
  const triDn = [[0, -s, 0], [-s*0.866, s*0.5, 0], [s*0.866, s*0.5, 0]]

  for (let i = 0; i < count; i++) {
    const t = i / count
    const tri = t < 0.5 ? triUp : triDn
    const edge = Math.floor((t % 0.5) * 6) % 3
    const a = tri[edge], b = tri[(edge + 1) % 3]
    const lerp = Math.random()
    const depth = (Math.random() - 0.5) * 0.1
    pts[i*3]   = a[0] * (1-lerp) + b[0] * lerp + (Math.random()-0.5) * 0.03
    pts[i*3+1] = a[1] * (1-lerp) + b[1] * lerp + (Math.random()-0.5) * 0.03
    pts[i*3+2] = depth
  }
  return pts
}

// ─── Figure catalog ─────────────────────────────────────────
const FIGURES = [
  { name: 'Geodesic Sphere', generator: (n) => fibSphere(n, 1.0), label: 'Universal Form' },
  { name: 'Merkaba', generator: merkaba, label: 'Light Vehicle · Hebrew' },
  { name: 'Ankh', generator: ankh, label: 'Key of Life · Egyptian' },
  { name: 'Stepped Pyramid', generator: mayanPyramid, label: 'Temple of Time · Mayan' },
  { name: 'Dragon', generator: chineseDragon, label: 'Celestial Guardian · Chinese' },
  { name: 'Tree of Life', generator: treeOfLife, label: 'Etz Chaim · Kabbalistic' },
  { name: 'Hexagram', generator: hexagram, label: 'Star of David · Sacred Geometry' },
]

export default function IntroAnimation({ onComplete }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const [phase, setPhase] = useState(0)
  const [opacity, setOpacity] = useState(1)

  // Pick a random figure each time
  const figureRef = useRef(FIGURES[Math.floor(Math.random() * FIGURES.length)])

  useEffect(() => {
    // NO localStorage skip — replays every refresh
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false })
    if (!gl) { onComplete?.(); return }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERT)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) { onComplete?.(); return }
    const prog = createProgram(gl, vs, fs)
    if (!prog) { onComplete?.(); return }
    gl.useProgram(prog)

    const COUNT = 8000
    const figure = figureRef.current
    const figurePos = figure.generator(COUNT)
    const scatterPos = new Float32Array(COUNT * 3)
    const sizes = new Float32Array(COUNT)
    const phases = new Float32Array(COUNT)
    const colorIds = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2 + Math.random() * 4
      scatterPos[i*3] = r * Math.sin(phi) * Math.cos(theta)
      scatterPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta)
      scatterPos[i*3+2] = r * Math.cos(phi)
      sizes[i] = Math.random() * 3 + 1
      phases[i] = Math.random()
      const rr = Math.random()
      colorIds[i] = rr < 0.4 ? Math.random() * 0.3 : rr < 0.65 ? 0.3 + Math.random() * 0.25 : rr < 0.8 ? 0.55 + Math.random() * 0.15 : rr < 0.92 ? 0.7 + Math.random() * 0.15 : 0.85 + Math.random() * 0.15
    }

    function makeBuf(data, attr, size) {
      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(prog, attr)
      if (loc >= 0) { gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0) }
      return buf
    }

    const bufs = [
      makeBuf(figurePos, 'aPos', 3),
      makeBuf(scatterPos, 'aScatter', 3),
      makeBuf(sizes, 'aSize', 1),
      makeBuf(phases, 'aPhase', 1),
      makeBuf(colorIds, 'aColorId', 1),
    ]

    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uProgress = gl.getUniformLocation(prog, 'uProgress')
    const uProj = gl.getUniformLocation(prog, 'uProj')
    const uView = gl.getUniformLocation(prog, 'uView')
    const uDpr = gl.getUniformLocation(prog, 'uDpr')
    const uExplosion = gl.getUniformLocation(prog, 'uExplosion')

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    gl.disable(gl.DEPTH_TEST)

    const DURATION = 7000

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    function draw(time) {
      if (!startRef.current) startRef.current = time
      const elapsed = time - startRef.current
      const progress = Math.min(elapsed / DURATION, 1)

      const dpr = Math.min(window.devicePixelRatio, 2)
      const aspect = window.innerWidth / window.innerHeight

      gl.clearColor(0.02, 0.01, 0.05, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      const camDist = 3.5 - progress * 0.3
      const camAngle = progress * 0.5
      const eye = [
        camDist * Math.sin(0.3 + camAngle * 0.3) * Math.sin(0.8),
        camDist * Math.cos(0.8),
        camDist * Math.sin(0.8) * Math.cos(0.3 + camAngle * 0.3),
      ]

      const proj = mat4Perspective(Math.PI / 4, aspect, 0.1, 50)
      const view = mat4LookAt(eye, [0, 0, 0], [0, 1, 0])

      const explosionFactor = progress > 0.75 ? (progress - 0.75) / 0.25 : 0

      gl.uniform1f(uTime, time)
      gl.uniform1f(uProgress, progress)
      gl.uniformMatrix4fv(uProj, false, proj)
      gl.uniformMatrix4fv(uView, false, view)
      gl.uniform1f(uDpr, dpr)
      gl.uniform1f(uExplosion, explosionFactor)

      gl.drawArrays(gl.POINTS, 0, COUNT)

      if (progress > 0.65 && phase === 0) setPhase(1)
      if (progress >= 1) {
        setPhase(2)
        setTimeout(() => setOpacity(0), 200)
        setTimeout(() => onComplete?.(), 900)
        return
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      bufs.forEach(b => gl.deleteBuffer(b))
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [onComplete])

  const figure = figureRef.current

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgb(5,3,15)',
        opacity, transition: 'opacity 0.7s ease-out',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={() => { setOpacity(0); setTimeout(() => onComplete?.(), 500) }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Wordmark overlay */}
      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(36px, 8vw, 72px)',
          fontWeight: 700,
          letterSpacing: '0.4em',
          color: 'rgba(201,168,76,0.9)',
          textShadow: '0 0 40px rgba(201,168,76,0.3), 0 0 80px rgba(201,168,76,0.1)',
        }}>
          GOLEM
        </div>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(10px, 2vw, 14px)',
          letterSpacing: '0.5em',
          color: 'rgba(201,168,76,0.4)',
          marginTop: 8,
        }}>
          KNOW THYSELF
        </div>
        {/* Figure name */}
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(9px, 1.5vw, 12px)',
          letterSpacing: '0.3em',
          color: 'rgba(201,168,76,0.25)',
          marginTop: 16,
          fontStyle: 'italic',
        }}>
          {figure.name} · {figure.label}
        </div>
      </div>

      {/* Skip hint */}
      <div style={{
        position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
        fontSize: 10, letterSpacing: '.2em', color: 'rgba(201,168,76,0.2)',
        fontFamily: "'Cinzel',serif", textTransform: 'uppercase',
      }}>
        tap to skip
      </div>
    </div>
  )
}
