import { useRef, useEffect, useState } from 'react'

/**
 * GOLEM Intro — 3D particle formation sequence.
 * Particles scatter → coalesce into geodesic sphere → compress → burst → wordmark.
 * Uses same WebGL approach as ParticleField for visual consistency.
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

    // Phase blending: scattered → sphere → compressed → exploded
    vec3 spherePos = aPos;
    vec3 scatterPos = aScatter * 4.0;

    // Coalesce: scattered → sphere (progress 0→0.4)
    float coalesce = smoothstep(0.0, 0.4, uProgress);
    vec3 pos = mix(scatterPos, spherePos, coalesce);

    // Compress (progress 0.5→0.7)
    float compress = smoothstep(0.5, 0.7, uProgress);
    float expand = smoothstep(0.7, 0.75, uProgress);
    float scale = 1.0 - compress * 0.6 + expand * 0.6;
    pos *= scale;

    // Explosion (progress 0.75→1.0)
    float explosion = smoothstep(0.75, 1.0, uProgress) * uExplosion;
    vec3 explodeDir = normalize(aPos + vec3(0.001));
    pos += explodeDir * explosion * 3.0;

    // Gentle breathing once formed
    float breath = sin(t * 0.8) * 0.05 * coalesce;
    pos *= 1.0 + breath;

    // Per-particle drift
    float drift = 0.03 * (1.0 - coalesce * 0.7);
    pos += vec3(
      sin(t * 0.5 + id * 6.28) * drift,
      cos(t * 0.3 + id * 4.13) * drift,
      sin(t * 0.4 + id * 2.71) * drift
    );

    vec4 viewPos = uView * vec4(pos, 1.0);
    gl_Position = uProj * viewPos;

    float dist = -viewPos.z;
    vDepth = clamp((dist - 1.0) / 5.0, 0.0, 1.0);

    float baseSize = aSize * (1.0 + explosion * 2.0);
    gl_PointSize = baseSize * uDpr * (2.8 / max(dist, 0.5));

    float twinkle = 0.5 + 0.5 * sin(t * (2.0 + fract(id * 1.37) * 3.0) + id * 6.28);
    float depthFade = 1.0 - vDepth * 0.5;

    // Brighter during compression
    float intensityBoost = 1.0 + compress * 0.8 - explosion * 0.3;
    vAlpha = twinkle * depthFade * 0.7 * intensityBoost;
    vColorId = aColorId;
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
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('Shader:', gl.getShaderInfoLog(s))
    gl.deleteShader(s)
    return null
  }
  return s
}

function createProgram(gl, vs, fs) {
  const p = gl.createProgram()
  gl.attachShader(p, vs)
  gl.attachShader(p, fs)
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error('Program:', gl.getProgramInfoLog(p))
    return null
  }
  return p
}

function fibSphere(count, radius) {
  const pts = new Float32Array(count * 3)
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y) * radius
    const theta = goldenAngle * i
    pts[i * 3] = Math.cos(theta) * r
    pts[i * 3 + 1] = y * radius
    pts[i * 3 + 2] = Math.sin(theta) * r
  }
  return pts
}

function mat4Perspective(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2)
  const nf = 1 / (near - far)
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0])
}

function mat4LookAt(eye, center, up) {
  const zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2]
  let len = 1 / Math.sqrt(zx * zx + zy * zy + zz * zz)
  const z0 = zx * len, z1 = zy * len, z2 = zz * len
  const xx = up[1] * z2 - up[2] * z1, xy = up[2] * z0 - up[0] * z2, xz = up[0] * z1 - up[1] * z0
  len = Math.sqrt(xx * xx + xy * xy + xz * xz)
  const x0 = len ? xx / len : 0, x1 = len ? xy / len : 0, x2 = len ? xz / len : 0
  const y0 = z1 * x2 - z2 * x1, y1 = z2 * x0 - z0 * x2, y2 = z0 * x1 - z1 * x0
  return new Float32Array([x0, y0, z0, 0, x1, y1, z1, 0, x2, y2, z2, 0,
    -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]),
    -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]),
    -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]), 1])
}

export default function IntroAnimation({ onComplete }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const [phase, setPhase] = useState(0) // 0=particles, 1=wordmark, 2=done
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    localStorage.setItem('golem_intro_seen_v4', '1')
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
    const spherePos = fibSphere(COUNT, 1.0)
    const scatterPos = new Float32Array(COUNT * 3)
    const sizes = new Float32Array(COUNT)
    const phases = new Float32Array(COUNT)
    const colorIds = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      // Random scatter positions (sphere around origin, radius 2-6)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2 + Math.random() * 4
      scatterPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      scatterPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      scatterPos[i * 3 + 2] = r * Math.cos(phi)
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
      makeBuf(spherePos, 'aPos', 3),
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

    const DURATION = 7000 // 7 seconds total

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

      // Camera slowly pulls back
      const camDist = 3.5 - progress * 0.3
      const camAngle = progress * 0.5
      const eye = [
        camDist * Math.sin(0.3 + camAngle * 0.3) * Math.sin(0.8),
        camDist * Math.cos(0.8),
        camDist * Math.sin(0.8) * Math.cos(0.3 + camAngle * 0.3),
      ]

      const proj = mat4Perspective(Math.PI / 4, aspect, 0.1, 50)
      const view = mat4LookAt(eye, [0, 0, 0], [0, 1, 0])

      // Explosion factor (ramps up after burst)
      const explosionFactor = progress > 0.75 ? (progress - 0.75) / 0.25 : 0

      gl.uniform1f(uTime, time)
      gl.uniform1f(uProgress, progress)
      gl.uniformMatrix4fv(uProj, false, proj)
      gl.uniformMatrix4fv(uView, false, view)
      gl.uniform1f(uDpr, dpr)
      gl.uniform1f(uExplosion, explosionFactor)

      gl.drawArrays(gl.POINTS, 0, COUNT)

      // Phase transitions
      if (progress > 0.65 && phase === 0) setPhase(1) // Show wordmark
      if (progress >= 1) {
        setPhase(2)
        // Fade out
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
