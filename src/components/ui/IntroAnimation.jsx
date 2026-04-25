import { useRef, useEffect, useState } from 'react'

const TAU = Math.PI * 2

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

    // Extended timing: shape stays formed longer
    // 0.0→0.3:  coalesce (scatter → form)
    // 0.3→0.7:  FORMED — shape holds, rotates, breathes (40% of duration = ~4.8s)
    // 0.7→0.82: compress
    // 0.82→1.0: explosion + dissolve

    float coalesce = smoothstep(0.0, 0.3, uProgress);
    vec3 pos = mix(scatterPos, spherePos, coalesce);

    // Compress (progress 0.7→0.82)
    float compress = smoothstep(0.7, 0.82, uProgress);
    pos *= mix(1.0, 0.3, compress);

    // Slow rotation — slightly faster during formed phase for visual interest
    float rotSpeed = uProgress > 0.3 && uProgress < 0.7 ? 0.5 : 0.3;
    float angle = t * rotSpeed + id * 0.1;
    float cosA = cos(angle), sinA = sin(angle);
    vec3 rotated = vec3(
      pos.x * cosA - pos.z * sinA,
      pos.y,
      pos.x * sinA + pos.z * cosA
    );

    // Gentle Y-axis tilt during formed phase for 3D depth
    if (uProgress > 0.3 && uProgress < 0.7) {
      float tiltAngle = sin(t * 0.2) * 0.15;
      float cT = cos(tiltAngle), sT = sin(tiltAngle);
      rotated = vec3(rotated.x, rotated.y * cT - rotated.z * sT, rotated.y * sT + rotated.z * cT);
    }

    // Explosion (progress 0.82→1.0)
    float explode = uExplosion;
    vec3 explodeDir = normalize(spherePos + vec3(sin(id*6.28), cos(id*4.5), sin(id*3.14+1.0)));
    rotated += explodeDir * explode * 5.0;

    vec4 mvPos = uView * vec4(rotated, 1.0);
    gl_Position = uProj * mvPos;

    vDepth = clamp(-mvPos.z * 0.15, 0.0, 1.0);

    // Alpha: bright during formed phase, breathes gently
    float formed = smoothstep(0.25, 0.35, uProgress);
    float explodeFade = 1.0 - smoothstep(0.85, 1.0, uProgress);
    float breathe = 0.85 + 0.15 * sin(t * 2.0 + id * 6.28);
    vAlpha = mix(0.15, 0.95 * breathe, coalesce) * explodeFade * (0.6 + formed * 0.4);

    vColorId = aColorId;

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
  // Merkaba: two interlocking regular tetrahedra forming a 3D Star of David
  // Uses exact coordinates for regular tetrahedra inscribed in a sphere
  const pts = new Float32Array(count * 3)
  const R = 1.2 // circumscribed sphere radius

  // Regular tetrahedron pointing UP — vertices on a sphere of radius R
  // Apex at top, equilateral triangle base below
  const sq2 = Math.sqrt(2), sq3 = Math.sqrt(3), sq6 = Math.sqrt(6)
  const tetUp = [
    [0, R, 0],                                                      // apex (top)
    [R * 2 * sq2 / 3, -R / 3, 0],                                   // base front
    [-R * sq2 / 3, -R / 3, R * sq6 / 3],                            // base back-right
    [-R * sq2 / 3, -R / 3, -R * sq6 / 3],                           // base back-left
  ]
  // Regular tetrahedron pointing DOWN — inverted and rotated 60° around Y
  const tetDn = [
    [0, -R, 0],                                                     // apex (bottom)
    [-R * 2 * sq2 / 3, R / 3, 0],                                   // base front
    [R * sq2 / 3, R / 3, -R * sq6 / 3],                             // base back-right
    [R * sq2 / 3, R / 3, R * sq6 / 3],                              // base back-left
  ]

  const faces = [[0,1,2], [0,2,3], [0,3,1], [1,2,3]]

  // Barycentric random point on triangle
  function randTri(v0, v1, v2) {
    let u = Math.random(), w = Math.random()
    if (u + w > 1) { u = 1 - u; w = 1 - w }
    const s = 1 - u - w
    return [v0[0]*s+v1[0]*u+v2[0]*w, v0[1]*s+v1[1]*u+v2[1]*w, v0[2]*s+v1[2]*u+v2[2]*w]
  }

  for (let i = 0; i < count; i++) {
    const t = i / count
    const tet = t < 0.5 ? tetUp : tetDn
    const r = Math.random()

    if (r < 0.55) {
      // 55% on faces — solid triangular surfaces
      const fi = Math.floor(Math.random() * 4)
      const [a, b, c] = faces[fi]
      const p = randTri(tet[a], tet[b], tet[c])
      pts[i*3] = p[0]; pts[i*3+1] = p[1]; pts[i*3+2] = p[2]
    } else if (r < 0.85) {
      // 30% on edges — crisp definition lines
      const edgeList = [[0,1],[0,2],[0,3],[1,2],[2,3],[3,1]]
      const [a, b] = edgeList[Math.floor(Math.random() * 6)]
      const lerp = Math.random()
      pts[i*3]   = tet[a][0]*(1-lerp) + tet[b][0]*lerp
      pts[i*3+1] = tet[a][1]*(1-lerp) + tet[b][1]*lerp
      pts[i*3+2] = tet[a][2]*(1-lerp) + tet[b][2]*lerp
    } else {
      // 15% on vertices — bright points at corners
      const vi = Math.floor(Math.random() * 4)
      pts[i*3] = tet[vi][0]; pts[i*3+1] = tet[vi][1]; pts[i*3+2] = tet[vi][2]
    }

    // Very subtle jitter
    pts[i*3]   += (Math.random()-0.5) * 0.012
    pts[i*3+1] += (Math.random()-0.5) * 0.012
    pts[i*3+2] += (Math.random()-0.5) * 0.012
  }
  return pts
}

function ankh(count) {
  // Egyptian Ankh — CLOSED oval loop on top (full circle, no gap, no interior fill)
  // T-cross below. No dot in the middle.
  const pts = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const t = i / count
    let x, y, z = (Math.random() - 0.5) * 0.06

    if (t < 0.35) {
      // Full closed oval loop — complete circle, no skip
      const angle = (t / 0.35) * TAU
      const rx = 0.42, ry = 0.55
      x = Math.cos(angle) * rx + (Math.random() - 0.5) * 0.025
      y = Math.sin(angle) * ry + 0.7 + (Math.random() - 0.5) * 0.025
    } else if (t < 0.6) {
      // Vertical shaft — from bottom of loop down
      const st = (t - 0.35) / 0.25
      x = (Math.random() - 0.5) * 0.05
      y = 0.15 - st * 1.7
      z = (Math.random() - 0.5) * 0.05
    } else if (t < 0.75) {
      // Horizontal crossbar
      const st = (t - 0.6) / 0.15
      x = (st - 0.5) * 1.2
      y = -0.15 + (Math.random() - 0.5) * 0.05
      z = (Math.random() - 0.5) * 0.05
    } else {
      // Thicken: extra particles along loop and cross edges only (NO interior fill)
      const part = Math.random()
      if (part < 0.45) {
        // Loop edge thickening
        const a = Math.random() * TAU
        x = Math.cos(a) * 0.42 + (Math.random() - 0.5) * 0.04
        y = Math.sin(a) * 0.55 + 0.7 + (Math.random() - 0.5) * 0.04
      } else if (part < 0.75) {
        // Shaft thickening
        x = (Math.random() - 0.5) * 0.05
        y = 0.15 - Math.random() * 1.7
      } else {
        // Crossbar thickening
        x = (Math.random() - 0.5) * 1.2
        y = -0.15 + (Math.random() - 0.5) * 0.05
      }
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
  // Dragon — hyper-detailed, particles distributed densely across entire body
  // Head ~35%, body ~35%, details (mane, scales, legs, tail, breath) ~30%
  // Every section uses surface-based distribution for sharp definition
  const pts = new Float32Array(count * 3)
  const j = () => (Math.random() - 0.5) * 0.02
  const jj = () => (Math.random() - 0.5) * 0.012 // fine jitter for details

  // Spine path helper — smooth S-curve from neck to tail
  function spine(st) {
    return {
      x: -0.5 + st * 2.8,
      y: Math.sin(st * Math.PI * 1.6) * 0.42,
      z: Math.cos(st * Math.PI * 0.9) * 0.3,
    }
  }

  for (let i = 0; i < count; i++) {
    const t = Math.random()
    let x, y, z = (Math.random() - 0.5) * 0.05

    if (t < 0.08) {
      // ─── UPPER JAW / SNOUT ─── long, tapering, ridged
      const st = Math.random()
      const snoutLen = 0.55
      const taper = 1 - st * 0.45
      // Surface shell distribution
      const angle = Math.random() * TAU
      const shell = 0.85 + Math.random() * 0.15
      x = -1.25 - st * snoutLen
      y = 0.15 + Math.sin(angle) * 0.12 * taper * shell
      z = Math.cos(angle) * 0.18 * taper * shell
      // Add jaw ridge bumps
      if (Math.random() < 0.3) y += 0.04 * taper
    } else if (t < 0.13) {
      // ─── LOWER JAW ─── open, with teeth line
      const st = Math.random()
      const taper = 1 - st * 0.35
      x = -1.25 - st * 0.42
      y = -0.08 - (1 - st) * 0.18
      z = (Math.random() - 0.5) * 0.28 * taper
      // Teeth: sharp point clusters along jaw edge
      if (Math.random() < 0.25) {
        y -= 0.04 + Math.random() * 0.06
        z = (Math.random() - 0.5) * 0.16 * taper
      }
    } else if (t < 0.17) {
      // ─── TEETH ─── individual fang clusters along both jaws
      const toothIdx = Math.floor(Math.random() * 8)
      const st = toothIdx / 8
      const side = Math.random() < 0.5 ? 1 : -1
      const isUpper = Math.random() < 0.5
      x = -1.25 - st * 0.35 + jj()
      y = isUpper ? (0.08 - Math.random() * 0.08) : (-0.12 - Math.random() * 0.1)
      z = side * (0.06 + st * 0.04) + jj()
    } else if (t < 0.27) {
      // ─── HEAD MASS ─── large cranium, surface-distributed sphere shell
      const a = Math.random() * TAU
      const phi = Math.acos(2 * Math.random() - 1)
      const shell = 0.8 + Math.random() * 0.2
      const r = 0.38 * shell
      x = -0.85 + Math.sin(phi) * Math.cos(a) * r * 0.85
      y = 0.18 + Math.sin(phi) * Math.sin(a) * r * 0.75
      z = Math.cos(phi) * r * 0.65
    } else if (t < 0.31) {
      // ─── EYES ─── bright clusters with pupils (dense center, diffuse glow)
      const side = Math.random() < 0.5 ? 1 : -1
      const isPupil = Math.random() < 0.4
      const a = Math.random() * TAU
      const r = isPupil ? Math.random() * 0.025 : (0.03 + Math.random() * 0.04)
      x = -1.06 + Math.cos(a) * r
      y = 0.28 + Math.sin(a) * r
      z = side * 0.23 + jj()
    } else if (t < 0.33) {
      // ─── NOSTRILS ─── two flared openings with smoke wisps
      const side = Math.random() < 0.5 ? 1 : -1
      const isSmoke = Math.random() < 0.3
      if (isSmoke) {
        x = -1.8 - Math.random() * 0.2
        y = 0.12 + (Math.random() - 0.5) * 0.1
        z = side * 0.06 + (Math.random() - 0.5) * 0.08
      } else {
        const a = Math.random() * TAU
        const r = Math.random() * 0.045
        x = -1.72 + Math.cos(a) * r
        y = 0.12 + Math.sin(a) * r
        z = side * 0.09 + jj()
      }
    } else if (t < 0.39) {
      // ─── HORNS ─── two branching antler-like horns, each with 2-3 tines
      const side = Math.random() < 0.5 ? 1 : -1
      const st = Math.random()
      const branch = Math.random()
      const hornBase = { x: -0.72, y: 0.5 }
      if (branch < 0.5) {
        // Main horn shaft
        x = hornBase.x + st * 0.2 + jj()
        y = hornBase.y + st * 0.6 + jj()
        z = side * (0.15 + st * 0.18) + jj()
      } else if (branch < 0.8) {
        // Forward tine
        const bt = Math.random()
        x = hornBase.x + 0.1 - bt * 0.15 + jj()
        y = hornBase.y + 0.3 + bt * 0.25 + jj()
        z = side * (0.2 + bt * 0.1) + jj()
      } else {
        // Rear tine
        const bt = Math.random()
        x = hornBase.x + 0.15 + bt * 0.12 + jj()
        y = hornBase.y + 0.25 + bt * 0.2 + jj()
        z = side * (0.22 + bt * 0.15) + jj()
      }
    } else if (t < 0.42) {
      // ─── WHISKERS / TENDRILS ─── four long flowing tendrils from chin
      const tendrilIdx = Math.floor(Math.random() * 4)
      const st = Math.random()
      const side = tendrilIdx < 2 ? 1 : -1
      const isOuter = tendrilIdx % 2 === 0
      const spread = isOuter ? 0.35 : 0.2
      x = -1.45 - st * 0.35 + j()
      y = -0.05 - st * 0.4 - (isOuter ? st * 0.1 : 0)
      z = side * (0.1 + st * spread) + j()
    } else if (t < 0.46) {
      // ─── FLAME BREATH ─── wispy particles trailing from mouth
      const st = Math.random()
      x = -1.75 - st * 0.45
      y = 0.02 + (Math.random() - 0.5) * (0.12 + st * 0.2)
      z = (Math.random() - 0.5) * (0.1 + st * 0.18)
    } else if (t < 0.52) {
      // ─── MANE ─── dense flowing hair/flames from neck down upper back
      const st = Math.random()
      const bodyT = st * 0.35
      const sp = spine(bodyT)
      const flameH = 0.3 + Math.random() * 0.3 + Math.sin(st * 5) * 0.08
      x = sp.x + j()
      y = sp.y + flameH
      z = sp.z + (Math.random() - 0.5) * 0.22
    } else if (t < 0.56) {
      // ─── SPINE RIDGES ─── bony dorsal plates along entire back
      const st = Math.random()
      const sp = spine(st)
      const ridgeH = 0.12 * (1 - st * 0.4) * (0.5 + 0.5 * Math.abs(Math.sin(st * 25)))
      x = sp.x + jj()
      y = sp.y + 0.15 + ridgeH
      z = sp.z + jj()
    } else if (t < 0.59) {
      // ─── BELLY SCALES ─── lighter underside texture
      const st = Math.random()
      const sp = spine(st)
      const bellyW = 0.18 * (1 - st * 0.5)
      x = sp.x + (Math.random() - 0.5) * bellyW * 0.5
      y = sp.y - 0.15 - Math.random() * 0.08
      z = sp.z + (Math.random() - 0.5) * bellyW
    } else if (t < 0.82) {
      // ─── BODY ─── serpentine S-curve, DENSE tube of particles
      const st = (t - 0.59) / 0.23
      const sp = spine(st)
      // Body gets thinner toward tail
      const bodyR = 0.24 * (1 - st * 0.5)
      // Surface-biased distribution (80% near surface for definition)
      const angle = Math.random() * TAU
      const surfaceBias = Math.random() < 0.8
      const minOff = surfaceBias ? bodyR * 0.65 : bodyR * 0.2
      const r = minOff + Math.random() * (bodyR - minOff)
      x = sp.x + Math.cos(angle) * r * 0.55
      y = sp.y + Math.sin(angle) * r
      z = sp.z + Math.cos(angle + 1.5) * r * 0.55
    } else if (t < 0.90) {
      // ─── LEGS / CLAWS ─── four muscular legs with 3-toed claws
      const legIdx = Math.floor(Math.random() * 4)
      const st = Math.random()
      const legPositions = [
        { bx: -0.25, bz: 0.22, bodyT: 0.08 },
        { bx: -0.25, bz: -0.22, bodyT: 0.08 },
        { bx: 1.15, bz: 0.22, bodyT: 0.58 },
        { bx: 1.15, bz: -0.22, bodyT: 0.58 },
      ]
      const leg = legPositions[legIdx]
      const sp = spine(leg.bodyT)
      const legThick = 0.06 * (1 - st * 0.4)
      const angle = Math.random() * TAU
      x = leg.bx + Math.cos(angle) * legThick * 0.3
      y = sp.y - st * 0.38 + Math.sin(angle) * legThick * 0.3
      z = leg.bz + jj()
      // Claws at bottom — three toes spread
      if (st > 0.82) {
        const toe = Math.floor(Math.random() * 3) - 1
        x += toe * 0.04 + jj()
        y -= 0.04
        z += toe * 0.03 * (leg.bz > 0 ? 1 : -1)
      }
    } else {
      // ─── TAIL ─── long, tapering, spiraling upward with tuft at end
      const st = (t - 0.90) / 0.10
      const sp = spine(0.85 + st * 0.15)
      const tailExt = st * 0.7
      const tailX = sp.x + tailExt
      const tailY = sp.y + st * 0.4 + Math.sin(st * TAU) * 0.12
      const tailZ = sp.z + Math.cos(st * TAU * 1.5) * 0.18
      const tailR = 0.09 * (1 - st * 0.55)
      const angle = Math.random() * TAU
      x = tailX + Math.cos(angle) * tailR * 0.4
      y = tailY + Math.sin(angle) * tailR
      z = tailZ + Math.cos(angle) * tailR * 0.35
      // Tail tuft — bushy flame at tip
      if (st > 0.85) {
        const tuftR = 0.08 + Math.random() * 0.06
        x += (Math.random() - 0.5) * tuftR
        y += (Math.random() - 0.5) * tuftR
        z += (Math.random() - 0.5) * tuftR
      }
    }

    pts[i*3] = x; pts[i*3+1] = y; pts[i*3+2] = z
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
function dnaHelix(count) {
  // Double helix — two intertwined sine/cosine strands with cross-bars
  const pts = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const t = i / count
    if (t < 0.4) {
      // Strand A (sine)
      const st = t / 0.4
      const y = (st - 0.5) * 2.4
      const angle = st * Math.PI * 6
      pts[i*3] = Math.cos(angle) * 0.4
      pts[i*3+1] = y
      pts[i*3+2] = Math.sin(angle) * 0.4
    } else if (t < 0.8) {
      // Strand B (cosine, offset by pi)
      const st = (t - 0.4) / 0.4
      const y = (st - 0.5) * 2.4
      const angle = st * Math.PI * 6 + Math.PI
      pts[i*3] = Math.cos(angle) * 0.4
      pts[i*3+1] = y
      pts[i*3+2] = Math.sin(angle) * 0.4
    } else {
      // Cross-bars (base pairs connecting the two strands)
      const st = (t - 0.8) / 0.2
      const barIdx = Math.floor(st * 12)
      const barT = (st * 12) % 1
      const y = (barIdx / 12 - 0.5) * 2.4
      const angle = (barIdx / 12) * Math.PI * 6
      const ax = Math.cos(angle) * 0.4, az = Math.sin(angle) * 0.4
      const bx = Math.cos(angle + Math.PI) * 0.4, bz = Math.sin(angle + Math.PI) * 0.4
      pts[i*3] = ax * (1 - barT) + bx * barT
      pts[i*3+1] = y + (Math.random() - 0.5) * 0.02
      pts[i*3+2] = az * (1 - barT) + bz * barT
    }
    pts[i*3] += (Math.random() - 0.5) * 0.015
    pts[i*3+1] += (Math.random() - 0.5) * 0.015
    pts[i*3+2] += (Math.random() - 0.5) * 0.015
  }
  return pts
}

function yinYang(count) {
  // Yin-Yang as a full 3D SPHERE made of TWO FISH
  // The classic yin-yang S-curve is mapped onto the sphere surface:
  // Fish 1 (Yang) owns one half, Fish 2 (Yin) owns the other.
  // Each fish head bulges into the other's hemisphere.
  // The dividing S-curve creates the iconic shape when viewed from any angle.
  // Eyes are small spherical clusters inside each fish's head territory.
  // Tail fins fan out where each fish tapers to nothing.
  const pts = new Float32Array(count * 3)
  const R = 1.0

  // The S-curve boundary on the sphere: at latitude phi (0=top, PI=bottom),
  // the boundary longitude shifts sinusoidally. Points on one side = fish 1,
  // other side = fish 2. The sine creates the classic S.
  // Fish heads are the bulging lobes at top and bottom.

  for (let i = 0; i < count; i++) {
    const t = Math.random()

    if (t < 0.38) {
      // ─── FISH 1 (Yang) — sphere surface, one side of S-curve ───
      // Generate random point on sphere, keep if in Fish 1 territory
      // Fish 1 head at top (phi near 0), tail tapers toward bottom
      let x, y, z2
      for (let attempt = 0; attempt < 8; attempt++) {
        const phi = Math.acos(2 * Math.random() - 1) // 0 to PI
        const theta = Math.random() * TAU
        // S-curve boundary: shifts by sin(phi) — head bulges at poles
        const sCurve = Math.sin(phi) * R * 0.5
        const boundary = sCurve
        const px = R * Math.sin(phi) * Math.cos(theta)
        const py = R * Math.cos(phi) // top = +1, bottom = -1
        const pz = R * Math.sin(phi) * Math.sin(theta)
        // Fish 1 owns: theta side where cos(theta) > boundary/R adjusted
        // Simplified: Fish 1 = points where x > sin(phi)*cos(phi)*0.5
        const sDiv = Math.sin(phi * 2) * 0.3
        if (px > sDiv * R || attempt === 7) {
          // Shell bias — 75% near surface for definition
          const shell = Math.random() < 0.75 ? (0.88 + Math.random() * 0.12) : (0.5 + Math.random() * 0.5)
          x = px * shell; y = py * shell; z2 = pz * shell
          break
        }
        x = px; y = py; z2 = pz
      }
      pts[i*3] = x; pts[i*3+1] = y; pts[i*3+2] = z2

    } else if (t < 0.76) {
      // ─── FISH 2 (Yin) — opposite side of S-curve ───
      let x, y, z2
      for (let attempt = 0; attempt < 8; attempt++) {
        const phi = Math.acos(2 * Math.random() - 1)
        const theta = Math.random() * TAU
        const px = R * Math.sin(phi) * Math.cos(theta)
        const py = R * Math.cos(phi)
        const pz = R * Math.sin(phi) * Math.sin(theta)
        const sDiv = Math.sin(phi * 2) * 0.3
        if (px <= sDiv * R || attempt === 7) {
          const shell = Math.random() < 0.75 ? (0.88 + Math.random() * 0.12) : (0.5 + Math.random() * 0.5)
          x = px * shell; y = py * shell; z2 = pz * shell
          break
        }
        x = px; y = py; z2 = pz
      }
      pts[i*3] = x; pts[i*3+1] = y; pts[i*3+2] = z2

    } else if (t < 0.82) {
      // ─── S-CURVE DIVIDING LINE — dense particles tracing the boundary ───
      const phi = Math.random() * Math.PI
      const sDiv = Math.sin(phi * 2) * 0.3
      const theta = Math.atan2(0, sDiv) // on the dividing plane
      const px = sDiv * R
      const py = R * Math.cos(phi)
      const pz = (Math.random() - 0.5) * 0.06 // thin line
      // Project onto sphere surface
      const len = Math.sqrt(px*px + py*py + pz*pz) || 1
      const shell = R / len * (0.95 + Math.random() * 0.05)
      pts[i*3] = px * shell
      pts[i*3+1] = py * shell
      pts[i*3+2] = pz * shell

    } else if (t < 0.86) {
      // ─── FISH 1 EYE — small sphere in upper hemisphere, offset into fish 1 territory ───
      // Eye sits where fish 1 head is (top, slightly to the right)
      const a = Math.random() * TAU
      const phi2 = Math.acos(2 * Math.random() - 1)
      const eyeR = 0.09
      const cx = 0.15, cy = 0.45, cz = 0
      pts[i*3] = cx + Math.sin(phi2) * Math.cos(a) * eyeR
      pts[i*3+1] = cy + Math.sin(phi2) * Math.sin(a) * eyeR
      pts[i*3+2] = cz + Math.cos(phi2) * eyeR

    } else if (t < 0.90) {
      // ─── FISH 2 EYE — small sphere in lower hemisphere, offset into fish 2 territory ───
      const a = Math.random() * TAU
      const phi2 = Math.acos(2 * Math.random() - 1)
      const eyeR = 0.09
      const cx = -0.15, cy = -0.45, cz = 0
      pts[i*3] = cx + Math.sin(phi2) * Math.cos(a) * eyeR
      pts[i*3+1] = cy + Math.sin(phi2) * Math.sin(a) * eyeR
      pts[i*3+2] = cz + Math.cos(phi2) * eyeR

    } else if (t < 0.95) {
      // ─── FISH 1 TAIL FINS — fan out at bottom where fish 1 tapers ───
      const st = Math.random()
      const fanAngle = (Math.random() - 0.5) * 1.2
      const finR = R * (0.85 + st * 0.15)
      const finTheta = fanAngle * 0.4
      pts[i*3] = Math.sin(finTheta) * finR * 0.4 + 0.15
      pts[i*3+1] = -R * 0.75 - st * 0.25
      pts[i*3+2] = Math.cos(fanAngle) * st * 0.2

    } else {
      // ─── FISH 2 TAIL FINS — fan out at top where fish 2 tapers ───
      const st = Math.random()
      const fanAngle = (Math.random() - 0.5) * 1.2
      const finR = R * (0.85 + st * 0.15)
      const finTheta = fanAngle * 0.4
      pts[i*3] = Math.sin(finTheta) * finR * 0.4 - 0.15
      pts[i*3+1] = R * 0.75 + st * 0.25
      pts[i*3+2] = Math.cos(fanAngle) * st * 0.2
    }
  }
  return pts
}

function omSymbol(count) {
  // Om ॐ — from scratch. VERY THICK strokes. NO lines crossing.
  // Layout: everything separated so strokes never overlap.
  // 1. Bottom belly curl (large "3" shape) — left side, lower
  // 2. Top arch — sweeps from left over to right, sits ABOVE the belly
  // 3. Tail swoosh — extends right from the arch, curves down
  // 4. Vertical stem — on the right, goes straight up (NO crossing the arch)
  // 5. Crescent — sits above the stem, open upward
  // 6. Bindu dot — above the crescent
  const pts = new Float32Array(count * 3)
  // Extra thick jitter for all strokes
  const j = () => (Math.random() - 0.5) * 0.06

  for (let i = 0; i < count; i++) {
    const t = i / count
    const z = (Math.random() - 0.5) * 0.04

    if (t < 0.22) {
      // ─── BELLY CURL — the large lower "3" or backwards "ε" ───
      // Two half-circles stacked: upper bump opens right, lower bump opens right
      const st = (t / 0.22)
      if (st < 0.5) {
        // Upper bump
        const a = (st / 0.5) * Math.PI + Math.PI * 0.5 // π/2 → 3π/2
        const cx = -0.25, cy = -0.15
        pts[i*3] = cx + Math.cos(a) * 0.32 + j()
        pts[i*3+1] = cy + Math.sin(a) * 0.25 + j()
      } else {
        // Lower bump (slightly smaller)
        const a = ((st - 0.5) / 0.5) * Math.PI - Math.PI * 0.5 // -π/2 → π/2
        const cx = -0.25, cy = -0.55
        pts[i*3] = cx + Math.cos(a) * 0.28 + j()
        pts[i*3+1] = cy + Math.sin(a) * 0.22 + j()
      }
      pts[i*3+2] = z
    } else if (t < 0.40) {
      // ─── TOP ARCH — big sweeping curve sitting above the belly ───
      // Arc from left to right, positioned clearly above belly
      const st = (t - 0.22) / 0.18
      const a = st * Math.PI * 1.0 + Math.PI * 0.0 // 0 → π
      const cx = 0, cy = 0.25
      pts[i*3] = cx + Math.cos(a) * 0.6 + j()
      pts[i*3+1] = cy + Math.sin(a) * 0.35 + j()
      pts[i*3+2] = z
    } else if (t < 0.52) {
      // ─── TAIL SWOOSH — extends from right side of arch, curves down ───
      // Starts where arch ends (right side ~0.6, 0.25), swoops down and right
      const st = (t - 0.40) / 0.12
      const startX = 0.55, startY = 0.2
      const endX = 0.85, endY = -0.2
      // Quadratic curve swooping
      const midX = 0.8, midY = 0.3
      const u = st
      pts[i*3] = (1-u)*(1-u)*startX + 2*(1-u)*u*midX + u*u*endX + j()
      pts[i*3+1] = (1-u)*(1-u)*startY + 2*(1-u)*u*midY + u*u*endY + j()
      pts[i*3+2] = z
    } else if (t < 0.60) {
      // ─── CONNECTING HOOK — small curve linking belly top to arch left ───
      // Goes from top of belly curl up to left end of arch
      const st = (t - 0.52) / 0.08
      const startX = -0.55, startY = -0.15
      const endX = -0.6, endY = 0.25
      pts[i*3] = startX + (endX - startX) * st + j() * 0.7
      pts[i*3+1] = startY + (endY - startY) * st + Math.sin(st * Math.PI) * 0.08 + j() * 0.7
      pts[i*3+2] = z
    } else if (t < 0.72) {
      // ─── VERTICAL STEM — right side, goes straight up from tail area ───
      // Positioned at x≈0.5, clearly to the right of the arch peak
      // Starts below the tail and goes up to near crescent — NO crossing
      const st = (t - 0.60) / 0.12
      pts[i*3] = 0.50 + j() * 0.6
      pts[i*3+1] = -0.3 + st * 0.9 + j() * 0.6  // -0.3 to 0.6
      pts[i*3+2] = z
    } else if (t < 0.86) {
      // ─── CRESCENT MOON — open arc above the stem ───
      // Positioned at (0.5, 0.72), opening upward like a cup
      const st = (t - 0.72) / 0.14
      const a = st * Math.PI + Math.PI  // π → 2π (bottom half = cup shape)
      const cx = 0.50, cy = 0.72
      pts[i*3] = cx + Math.cos(a) * 0.2 + j() * 0.7
      pts[i*3+1] = cy + Math.sin(a) * 0.12 + j() * 0.7
      pts[i*3+2] = z
    } else {
      // ─── BINDU (dot) — above crescent, filled circle ───
      const a = Math.random() * TAU
      const r = Math.random() * 0.08
      pts[i*3] = 0.50 + Math.cos(a) * r
      pts[i*3+1] = 0.92 + Math.sin(a) * r
      pts[i*3+2] = z * 0.3
    }
  }
  return pts
}

const FIGURES = [
  { name: 'Geodesic Sphere', generator: (n) => fibSphere(n, 1.0), label: 'Universal Form' },
  { name: 'Merkaba', generator: merkaba, label: 'Light Vehicle · Hebrew' },
  { name: 'Ankh', generator: ankh, label: 'Key of Life · Egyptian' },
  { name: 'Stepped Pyramid', generator: mayanPyramid, label: 'Temple of Time · Mayan' },
  { name: 'Dragon', generator: chineseDragon, label: 'Celestial Guardian · Chinese', particles: 20000 },
  { name: 'Tree of Life', generator: treeOfLife, label: 'Etz Chaim · Kabbalistic' },
  { name: 'DNA Helix', generator: dnaHelix, label: 'Double Helix · The Code of Life' },
  { name: 'Yin Yang', generator: yinYang, label: 'Twin Fish · Taoist', particles: 12000 },
  { name: 'Om', generator: omSymbol, label: 'Aum · The Primordial Sound · Sanskrit' },
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

    const figure = figureRef.current
    const COUNT = figure.particles || 8000
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

    const DURATION = 15000 // 15 seconds — shape holds ~7s

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

      const explosionFactor = progress > 0.82 ? (progress - 0.82) / 0.18 : 0

      gl.uniform1f(uTime, time)
      gl.uniform1f(uProgress, progress)
      gl.uniformMatrix4fv(uProj, false, proj)
      gl.uniformMatrix4fv(uView, false, view)
      gl.uniform1f(uDpr, dpr)
      gl.uniform1f(uExplosion, explosionFactor)

      gl.drawArrays(gl.POINTS, 0, COUNT)

      if (progress > 0.55 && phase === 0) setPhase(1) // Show wordmark while shape is still formed
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
