import { useRef, useEffect, useCallback } from 'react'

/**
 * WebGL 3D Particle Field — Geodesic sphere formation with bloom glow.
 * Inspired by particles.casberry.in but adapted for cosmic gold palette.
 * GPU-accelerated point sprites with depth, additive bloom, mouse orbit control.
 *
 * Features:
 * - 8000+ particles forming a breathing geodesic sphere
 * - Additive blending for volumetric glow
 * - Mouse-driven orbit camera
 * - Particles drift and reform in organic breathing motion
 * - Warm gold / silver / rose color palette matching app design tokens
 */

const VERT = `
  attribute vec3 aPos;
  attribute vec3 aVel;
  attribute float aSize;
  attribute float aPhase;
  attribute float aColorId;

  uniform float uTime;
  uniform mat4 uProj;
  uniform mat4 uView;
  uniform float uDpr;
  uniform float uBreath;

  varying float vAlpha;
  varying float vColorId;
  varying float vDepth;

  void main() {
    float t = uTime * 0.001;
    float id = aPhase;

    // Sphere breathing: expand/contract
    float breathAmt = 0.92 + uBreath * 0.16;
    vec3 basePos = aPos * breathAmt;

    // Per-particle orbital drift
    float driftSpeed = 0.3 + fract(id * 0.731) * 0.5;
    float driftAmt = 0.04 + fract(id * 0.317) * 0.06;
    vec3 drift = vec3(
      sin(t * driftSpeed + id * 6.28) * driftAmt,
      cos(t * driftSpeed * 0.7 + id * 4.13) * driftAmt * 0.8,
      sin(t * driftSpeed * 0.5 + id * 2.71) * driftAmt * 0.6
    );

    // Some particles escape and orbit
    float escape = smoothstep(0.97, 1.0, fract(id * 3.71));
    vec3 orbitPos = basePos * (1.3 + escape * 0.5);
    float orbitAngle = t * 0.2 + id * 6.28;
    orbitPos.xz += vec2(cos(orbitAngle), sin(orbitAngle)) * escape * 0.3;

    vec3 pos = mix(basePos + drift, orbitPos + drift * 2.0, escape);

    // Apply view & projection
    vec4 viewPos = uView * vec4(pos, 1.0);
    gl_Position = uProj * viewPos;

    // Depth for fog & sizing
    float dist = -viewPos.z;
    vDepth = clamp((dist - 1.0) / 4.0, 0.0, 1.0);

    // Point size: perspective scaling
    float baseSize = aSize * (1.0 + escape * 2.0);
    gl_PointSize = baseSize * uDpr * (2.5 / max(dist, 0.5));

    // Alpha: twinkle + depth fade
    float twinkle = 0.6 + 0.4 * sin(t * (2.0 + fract(id * 1.37) * 4.0) + id * 6.28);
    float depthFade = 1.0 - vDepth * 0.6;
    vAlpha = twinkle * depthFade * (0.4 + escape * 0.6);
    vColorId = aColorId;
  }
`;

const FRAG = `
  precision mediump float;
  varying float vAlpha;
  varying float vColorId;
  varying float vDepth;

  void main() {
    // Soft circle with glow halo
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;

    float core = exp(-d * d * 3.0);
    float halo = exp(-d * d * 0.8) * 0.3;
    float alpha = (core + halo) * vAlpha;

    // Color palette based on colorId
    vec3 col;
    if (vColorId < 0.25) {
      // Warm gold (dominant)
      col = vec3(0.88, 0.72, 0.35);
    } else if (vColorId < 0.5) {
      // Light gold / cream
      col = vec3(0.95, 0.85, 0.55);
    } else if (vColorId < 0.7) {
      // Silver-blue
      col = vec3(0.55, 0.65, 0.88);
    } else if (vColorId < 0.85) {
      // Rose
      col = vec3(0.85, 0.35, 0.55);
    } else {
      // Teal / aqua
      col = vec3(0.25, 0.78, 0.68);
    }

    // White-hot core for bloom effect
    col = mix(col, vec3(1.0, 0.97, 0.9), core * core * 0.6);

    // Slight depth-based desaturation (atmospheric perspective)
    col = mix(col, vec3(0.7, 0.7, 0.75), vDepth * 0.25);

    gl_FragColor = vec4(col, alpha * 0.9);
  }
`;

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

// Fibonacci sphere for even point distribution (like geodesic)
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

// Simple 4x4 matrix helpers (avoid importing a math library)
function mat4Perspective(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2)
  const nf = 1 / (near - far)
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ])
}

function mat4LookAt(eye, center, up) {
  const zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2]
  let len = 1 / Math.sqrt(zx * zx + zy * zy + zz * zz)
  const z0 = zx * len, z1 = zy * len, z2 = zz * len
  const xx = up[1] * z2 - up[2] * z1, xy = up[2] * z0 - up[0] * z2, xz = up[0] * z1 - up[1] * z0
  len = Math.sqrt(xx * xx + xy * xy + xz * xz)
  const x0 = len ? xx / len : 0, x1 = len ? xy / len : 0, x2 = len ? xz / len : 0
  const y0 = z1 * x2 - z2 * x1, y1 = z2 * x0 - z0 * x2, y2 = z0 * x1 - z1 * x0
  return new Float32Array([
    x0, y0, z0, 0,
    x1, y1, z1, 0,
    x2, y2, z2, 0,
    -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]),
    -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]),
    -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]),
    1,
  ])
}

export default function ParticleField() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0, down: false })
  const cameraRef = useRef({ theta: 0.3, phi: 0.8, dist: 3.2 })
  const rafRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    const w = window.innerWidth, h = window.innerHeight
    mouseRef.current.x = (e.clientX / w) * 2 - 1
    mouseRef.current.y = -((e.clientY / h) * 2 - 1)

    // Orbit camera with mouse position (no click needed — subtle)
    cameraRef.current.theta = 0.3 + mouseRef.current.x * 0.4
    cameraRef.current.phi = 0.8 + mouseRef.current.y * 0.3
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
    })
    if (!gl) return

    const vs = createShader(gl, gl.VERTEX_SHADER, VERT)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const prog = createProgram(gl, vs, fs)
    if (!prog) return
    gl.useProgram(prog)

    // Particle count — geodesic sphere
    const SPHERE_COUNT = 6000
    const AMBIENT_COUNT = 2000
    const TOTAL = SPHERE_COUNT + AMBIENT_COUNT

    // Generate sphere particles (Fibonacci distribution)
    const spherePos = fibSphere(SPHERE_COUNT, 1.0)

    // Generate ambient dust particles
    const positions = new Float32Array(TOTAL * 3)
    const velocities = new Float32Array(TOTAL * 3)
    const sizes = new Float32Array(TOTAL)
    const phases = new Float32Array(TOTAL)
    const colorIds = new Float32Array(TOTAL)

    // Fill sphere particles
    for (let i = 0; i < SPHERE_COUNT; i++) {
      positions[i * 3] = spherePos[i * 3]
      positions[i * 3 + 1] = spherePos[i * 3 + 1]
      positions[i * 3 + 2] = spherePos[i * 3 + 2]
      sizes[i] = Math.random() * 2.5 + 0.8
      phases[i] = Math.random()
      // Color: mostly gold, some accents
      const r = Math.random()
      colorIds[i] = r < 0.45 ? Math.random() * 0.25
        : r < 0.7 ? 0.25 + Math.random() * 0.25
        : r < 0.85 ? 0.5 + Math.random() * 0.2
        : r < 0.93 ? 0.7 + Math.random() * 0.15
        : 0.85 + Math.random() * 0.15
    }

    // Fill ambient dust
    for (let i = SPHERE_COUNT; i < TOTAL; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 1.5 + Math.random() * 2.5
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
      sizes[i] = Math.random() * 1.2 + 0.3
      phases[i] = Math.random()
      colorIds[i] = Math.random() * 0.5 // gold family
    }

    // Create buffers
    function makeBuf(data, attr, size) {
      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(prog, attr)
      if (loc >= 0) {
        gl.enableVertexAttribArray(loc)
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
      }
      return buf
    }

    const bufs = [
      makeBuf(positions, 'aPos', 3),
      makeBuf(velocities, 'aVel', 3),
      makeBuf(sizes, 'aSize', 1),
      makeBuf(phases, 'aPhase', 1),
      makeBuf(colorIds, 'aColorId', 1),
    ]

    // Uniforms
    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uProj = gl.getUniformLocation(prog, 'uProj')
    const uView = gl.getUniformLocation(prog, 'uView')
    const uDpr = gl.getUniformLocation(prog, 'uDpr')
    const uBreath = gl.getUniformLocation(prog, 'uBreath')

    // GL state
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE) // Additive for bloom
    gl.disable(gl.DEPTH_TEST)

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    function draw(time) {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const aspect = window.innerWidth / window.innerHeight

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      // Camera orbit (auto-rotate + mouse influence)
      const cam = cameraRef.current
      const autoTheta = time * 0.00008
      const theta = cam.theta + autoTheta
      const phi = Math.max(0.2, Math.min(Math.PI - 0.2, cam.phi))
      const dist = cam.dist

      const eye = [
        dist * Math.sin(phi) * Math.cos(theta),
        dist * Math.cos(phi),
        dist * Math.sin(phi) * Math.sin(theta),
      ]

      // Breathing animation
      const breath = Math.sin(time * 0.0008) * 0.5 + 0.5

      // Matrices
      const proj = mat4Perspective(Math.PI / 4, aspect, 0.1, 50)
      const view = mat4LookAt(eye, [0, 0, 0], [0, 1, 0])

      gl.uniform1f(uTime, time)
      gl.uniformMatrix4fv(uProj, false, proj)
      gl.uniformMatrix4fv(uView, false, view)
      gl.uniform1f(uDpr, dpr)
      gl.uniform1f(uBreath, breath)

      gl.drawArrays(gl.POINTS, 0, TOTAL)
      rafRef.current = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      bufs.forEach(b => gl.deleteBuffer(b))
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [handleMouseMove])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
