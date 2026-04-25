import { useRef, useEffect } from 'react'

/**
 * RitualParticles — WebGL particle formation that renders a tradition's
 * sacred geometry. Reuses the same shader approach as IntroAnimation
 * but runs continuously with gentle breathing animation.
 *
 * Props:
 *   tradition - tradition key: 'vedic','buddhist','kabbalah','sufi','egyptian','mayan','hermetic','celtic','tibetan','taoist','shamanic','yogic'
 *   active - whether the ritual is in progress (controls animation intensity)
 */

const VERT = `
  attribute vec3 aPos;
  attribute float aSize;
  attribute float aPhase;
  attribute float aColorId;

  uniform float uTime;
  uniform mat4 uProj;
  uniform mat4 uView;
  uniform float uDpr;
  uniform float uBreathe;

  varying float vAlpha;
  varying float vColorId;

  void main() {
    float t = uTime * 0.001;
    vec3 pos = aPos;

    // Gentle breathing
    float breathe = 1.0 + uBreathe * 0.06 * sin(t * 1.5 + aPhase * 6.28);
    pos *= breathe;

    // Slow rotation
    float angle = t * 0.2;
    float c = cos(angle), s = sin(angle);
    pos = vec3(pos.x * c - pos.z * s, pos.y, pos.x * s + pos.z * c);

    // Gentle float
    pos.y += sin(t * 0.8 + aPhase * 3.14) * 0.02;

    vec4 mvPos = uView * vec4(pos, 1.0);
    gl_Position = uProj * mvPos;

    float depth = clamp(-mvPos.z * 0.12, 0.0, 1.0);
    vAlpha = (0.5 + 0.4 * sin(t * 1.2 + aPhase * 6.28)) * (1.0 - depth * 0.3);
    vColorId = aColorId;

    gl_PointSize = aSize * uDpr * (0.8 + 0.2 * sin(t + aPhase * 6.28));
  }
`

const FRAG = `
  precision mediump float;
  varying float vAlpha;
  varying float vColorId;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float core = exp(-d * d * 3.0);
    float halo = exp(-d * d * 0.6) * 0.4;
    float alpha = (core + halo) * vAlpha * 0.7;

    vec3 col;
    if (vColorId < 0.25) col = vec3(0.88, 0.72, 0.35);      // gold
    else if (vColorId < 0.5) col = vec3(0.95, 0.85, 0.55);   // light gold
    else if (vColorId < 0.7) col = vec3(0.55, 0.65, 0.88);   // blue
    else if (vColorId < 0.85) col = vec3(0.85, 0.35, 0.55);  // rose
    else col = vec3(0.25, 0.78, 0.68);                       // teal

    col = mix(col, vec3(1.0, 0.98, 0.9), core * core * 0.5);
    gl_FragColor = vec4(col, alpha);
  }
`

// ─── Shape generators per tradition ─────────────────────────

function generateShape(tradition, count) {
  const pts = new Float32Array(count * 3)
  const TAU = Math.PI * 2

  switch (tradition) {
    case 'vedic':
    case 'yogic': {
      // Sri Yantra — 9 interlocking triangles (simplified as concentric triangle rings)
      for (let i = 0; i < count; i++) {
        const t = i / count
        const ring = Math.floor(t * 5)
        const a = (t * 5 % 1) * TAU
        const r = 0.3 + ring * 0.18
        const flip = ring % 2 === 0 ? 1 : -1
        const tri = Math.floor(a / (TAU / 3))
        const edgeT = (a % (TAU / 3)) / (TAU / 3)
        const a1 = tri * TAU / 3 - Math.PI / 2
        const a2 = (tri + 1) * TAU / 3 - Math.PI / 2
        pts[i*3]   = (Math.cos(a1) * (1-edgeT) + Math.cos(a2) * edgeT) * r
        pts[i*3+1] = (Math.sin(a1) * (1-edgeT) + Math.sin(a2) * edgeT) * r * flip
        pts[i*3+2] = (Math.random() - 0.5) * 0.05
      }
      break
    }
    case 'buddhist': {
      // Dharma wheel — 8-spoked wheel
      for (let i = 0; i < count; i++) {
        const t = i / count
        if (t < 0.3) {
          // Rim
          const a = t / 0.3 * TAU
          const r = 0.9
          pts[i*3] = Math.cos(a) * r; pts[i*3+1] = Math.sin(a) * r; pts[i*3+2] = 0
        } else if (t < 0.5) {
          // Hub
          const a = (t - 0.3) / 0.2 * TAU
          const r = 0.2
          pts[i*3] = Math.cos(a) * r; pts[i*3+1] = Math.sin(a) * r; pts[i*3+2] = 0
        } else {
          // 8 spokes
          const spoke = Math.floor((t - 0.5) / 0.5 * 8)
          const st = ((t - 0.5) / 0.5 * 8) % 1
          const a = spoke * TAU / 8
          const r = 0.2 + st * 0.7
          pts[i*3] = Math.cos(a) * r; pts[i*3+1] = Math.sin(a) * r; pts[i*3+2] = (Math.random()-0.5)*0.03
        }
      }
      break
    }
    case 'kabbalah':
    case 'hermetic': {
      // Tree of Life
      const seph = [[0,1.3,0],[-0.5,0.9,0],[0.5,0.9,0],[-0.5,0.35,0],[0.5,0.35,0],[0,0.05,0],[-0.5,-0.35,0],[0.5,-0.35,0],[0,-0.65,0],[0,-1.1,0]]
      const paths = [[0,1],[0,2],[1,3],[2,4],[1,5],[2,5],[3,5],[4,5],[3,6],[4,7],[5,6],[5,7],[6,8],[7,8],[8,9],[5,8]]
      for (let i = 0; i < count; i++) {
        const t = i / count
        if (t < 0.35) {
          const si = Math.floor(t / 0.35 * seph.length) % seph.length
          const r = 0.1, th = Math.random()*TAU, ph = Math.acos(2*Math.random()-1)
          pts[i*3]=seph[si][0]+r*Math.sin(ph)*Math.cos(th); pts[i*3+1]=seph[si][1]+r*Math.sin(ph)*Math.sin(th); pts[i*3+2]=r*Math.cos(ph)
        } else {
          const pi = Math.floor((t-0.35)/0.65*paths.length)%paths.length
          const [a,b]=paths[pi]; const l=Math.random()
          pts[i*3]=seph[a][0]*(1-l)+seph[b][0]*l+(Math.random()-0.5)*0.02
          pts[i*3+1]=seph[a][1]*(1-l)+seph[b][1]*l+(Math.random()-0.5)*0.02
          pts[i*3+2]=(Math.random()-0.5)*0.02
        }
      }
      break
    }
    case 'sufi': {
      // Whirling spiral — expanding helix
      for (let i = 0; i < count; i++) {
        const t = i / count
        const angle = t * TAU * 6
        const r = 0.1 + t * 0.9
        const y = (t - 0.5) * 1.5
        pts[i*3] = Math.cos(angle) * r; pts[i*3+1] = y; pts[i*3+2] = Math.sin(angle) * r
      }
      break
    }
    case 'egyptian': {
      // Ankh
      for (let i = 0; i < count; i++) {
        const t = i / count
        if (t < 0.35) {
          const a = t / 0.35 * TAU
          pts[i*3] = Math.cos(a)*0.4; pts[i*3+1] = Math.sin(a)*0.6+0.7; pts[i*3+2] = (Math.random()-0.5)*0.08
        } else if (t < 0.6) {
          const st = (t-0.35)/0.25
          pts[i*3] = (Math.random()-0.5)*0.06; pts[i*3+1] = 0.7-st*1.8; pts[i*3+2] = (Math.random()-0.5)*0.06
        } else {
          const st = (t-0.6)/0.4
          pts[i*3] = (st-0.5)*1.2; pts[i*3+1] = 0.05+(Math.random()-0.5)*0.06; pts[i*3+2] = (Math.random()-0.5)*0.06
        }
      }
      break
    }
    case 'mayan': {
      // Stepped pyramid
      const levels = 5
      for (let i = 0; i < count; i++) {
        const t = i / count
        const lev = Math.floor(t * levels)
        const half = 1.0 - lev * 0.18
        const yBase = -0.7 + lev * 0.3
        const face = Math.floor((t * levels % 1) * 4)
        const et = (t * levels * 4) % 1
        let x, z
        switch (face) {
          case 0: x=-half+et*2*half; z=-half; break
          case 1: x=half; z=-half+et*2*half; break
          case 2: x=half-et*2*half; z=half; break
          default: x=-half; z=half-et*2*half
        }
        pts[i*3]=x+(Math.random()-0.5)*0.04; pts[i*3+1]=yBase+Math.random()*0.25; pts[i*3+2]=z+(Math.random()-0.5)*0.04
      }
      break
    }
    case 'celtic': {
      // Celtic knot (triquetra)
      for (let i = 0; i < count; i++) {
        const t = i / count
        const a = t * TAU
        const r = 0.7
        // Three interlocking loops
        const loop = Math.floor(t * 3)
        const offset = loop * TAU / 3
        const la = a * 3 + offset
        pts[i*3] = (Math.cos(la) + Math.cos(la*2)*0.3) * 0.5
        pts[i*3+1] = (Math.sin(la) + Math.sin(la*2)*0.3) * 0.5
        pts[i*3+2] = Math.sin(la*3) * 0.1
      }
      break
    }
    case 'tibetan': {
      // Endless knot
      for (let i = 0; i < count; i++) {
        const t = i / count
        const a = t * TAU * 4
        pts[i*3] = Math.sin(a * 2) * 0.6 * Math.cos(a * 0.5)
        pts[i*3+1] = Math.cos(a * 3) * 0.6
        pts[i*3+2] = Math.sin(a) * 0.15
      }
      break
    }
    case 'taoist': {
      // Yin-yang with orbit
      for (let i = 0; i < count; i++) {
        const t = i / count
        if (t < 0.5) {
          // Outer circle
          const a = t / 0.5 * TAU
          pts[i*3] = Math.cos(a) * 0.9; pts[i*3+1] = Math.sin(a) * 0.9; pts[i*3+2] = 0
        } else if (t < 0.75) {
          // Top S-curve
          const st = (t - 0.5) / 0.25
          const a = st * Math.PI
          pts[i*3] = Math.cos(a) * 0.45; pts[i*3+1] = Math.sin(a) * 0.45 + 0.45; pts[i*3+2] = 0
        } else {
          // Bottom S-curve
          const st = (t - 0.75) / 0.25
          const a = st * Math.PI + Math.PI
          pts[i*3] = Math.cos(a) * 0.45; pts[i*3+1] = Math.sin(a) * 0.45 - 0.45; pts[i*3+2] = 0
        }
        pts[i*3+2] += (Math.random()-0.5) * 0.05
      }
      break
    }
    case 'shamanic': {
      // Medicine wheel / drum circle
      for (let i = 0; i < count; i++) {
        const t = i / count
        if (t < 0.4) {
          // Outer circle
          const a = t / 0.4 * TAU
          pts[i*3] = Math.cos(a) * 0.9; pts[i*3+1] = Math.sin(a) * 0.9; pts[i*3+2] = (Math.random()-0.5)*0.05
        } else if (t < 0.6) {
          // 4 cardinal direction spokes
          const spoke = Math.floor((t-0.4)/0.2*4)
          const st = ((t-0.4)/0.2*4)%1
          const a = spoke * TAU / 4
          pts[i*3] = Math.cos(a)*st*0.85; pts[i*3+1] = Math.sin(a)*st*0.85; pts[i*3+2] = 0
        } else {
          // Inner circle + center point
          const a = (t-0.6)/0.4 * TAU
          const r = 0.3 + Math.random() * 0.15
          pts[i*3] = Math.cos(a)*r; pts[i*3+1] = Math.sin(a)*r; pts[i*3+2] = (Math.random()-0.5)*0.08
        }
      }
      break
    }
    default: {
      // Default sphere
      const ga = Math.PI * (3 - Math.sqrt(5))
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2
        const r = Math.sqrt(1 - y * y) * 0.9
        const theta = ga * i
        pts[i*3] = Math.cos(theta) * r; pts[i*3+1] = y * 0.9; pts[i*3+2] = Math.sin(theta) * r
      }
    }
  }
  return pts
}

function compileShader(gl, type, src) {
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null }
  return s
}

function mat4Persp(fov, asp, n, f) {
  const ff = 1/Math.tan(fov/2), nf = 1/(n-f)
  return new Float32Array([ff/asp,0,0,0, 0,ff,0,0, 0,0,(f+n)*nf,-1, 0,0,2*f*n*nf,0])
}

function mat4Look(e, c, u) {
  const zx=e[0]-c[0], zy=e[1]-c[1], zz=e[2]-c[2]
  let l=1/Math.sqrt(zx*zx+zy*zy+zz*zz)
  const z0=zx*l,z1=zy*l,z2=zz*l
  const xx=u[1]*z2-u[2]*z1, xy=u[2]*z0-u[0]*z2, xz=u[0]*z1-u[1]*z0
  l=Math.sqrt(xx*xx+xy*xy+xz*xz)
  const x0=l?xx/l:0,x1=l?xy/l:0,x2=l?xz/l:0
  const y0=z1*x2-z2*x1,y1=z2*x0-z0*x2,y2=z0*x1-z1*x0
  return new Float32Array([x0,y0,z0,0, x1,y1,z1,0, x2,y2,z2,0,
    -(x0*e[0]+x1*e[1]+x2*e[2]),-(y0*e[0]+y1*e[1]+y2*e[2]),-(z0*e[0]+z1*e[1]+z2*e[2]),1])
}

export default function RitualParticles({ tradition = 'vedic', active = false }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const tradRef = useRef(tradition)

  useEffect(() => {
    tradRef.current = tradition
  }, [tradition])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false })
    if (!gl) return

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const COUNT = 4000
    const positions = generateShape(tradition, COUNT)
    const sizes = new Float32Array(COUNT)
    const phases = new Float32Array(COUNT)
    const colorIds = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      sizes[i] = Math.random() * 2.5 + 1
      phases[i] = Math.random()
      colorIds[i] = Math.random()
    }

    function makeBuf(data, attr, sz) {
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(prog, attr)
      if (loc >= 0) { gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, sz, gl.FLOAT, false, 0, 0) }
      return buf
    }
    const bufs = [makeBuf(positions,'aPos',3), makeBuf(sizes,'aSize',1), makeBuf(phases,'aPhase',1), makeBuf(colorIds,'aColorId',1)]

    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uProj = gl.getUniformLocation(prog, 'uProj')
    const uView = gl.getUniformLocation(prog, 'uView')
    const uDpr = gl.getUniformLocation(prog, 'uDpr')
    const uBreathe = gl.getUniformLocation(prog, 'uBreathe')

    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE); gl.disable(gl.DEPTH_TEST)

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    function draw(time) {
      resize()
      const dpr = Math.min(window.devicePixelRatio, 2)
      const aspect = canvas.offsetWidth / (canvas.offsetHeight || 1)

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      const eye = [0, 0.3, 3.0]
      const proj = mat4Persp(Math.PI / 5, aspect, 0.1, 50)
      const view = mat4Look(eye, [0, 0, 0], [0, 1, 0])

      gl.uniform1f(uTime, time)
      gl.uniformMatrix4fv(uProj, false, proj)
      gl.uniformMatrix4fv(uView, false, view)
      gl.uniform1f(uDpr, dpr)
      gl.uniform1f(uBreathe, active ? 1.0 : 0.4)

      gl.drawArrays(gl.POINTS, 0, COUNT)
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      bufs.forEach(b => gl.deleteBuffer(b))
      gl.deleteProgram(prog); gl.deleteShader(vs); gl.deleteShader(fs)
    }
  }, [tradition])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}
