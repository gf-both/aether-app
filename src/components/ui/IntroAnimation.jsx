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
  // Egyptian Ankh — ring sits directly on crossbar, no rod between them
  // Torus loop on top, crossbar at loop base, shaft extends down from crossbar
  const pts = new Float32Array(count * 3)
  const tubeR = 0.12
  const crossY = 0.15 // crossbar Y = loop bottom — no gap

  for (let i = 0; i < count; i++) {
    const t = Math.random()
    let x, y, z

    if (t < 0.40) {
      // ─── TORUS LOOP — sits on top of crossbar ───
      const loopAngle = Math.random() * TAU
      const tubeAngle = Math.random() * TAU
      const Rx = 0.42, Ry = 0.55
      const cx = Math.cos(loopAngle) * Rx
      const cy = Math.sin(loopAngle) * Ry + crossY + Ry // center above crossbar
      const nx = -Math.sin(loopAngle)
      const tr = tubeR * (0.7 + Math.random() * 0.3)
      x = cx + nx * Math.cos(tubeAngle) * tr * 0.6
      y = cy + Math.sin(tubeAngle) * tr * 0.5
      z = Math.cos(tubeAngle) * tr
    } else if (t < 0.70) {
      // ─── VERTICAL SHAFT — extends down from crossbar ───
      const st = Math.random()
      const shaftY = crossY - st * 1.7
      const angle = Math.random() * TAU
      const r = tubeR * (0.6 + Math.random() * 0.4)
      x = Math.cos(angle) * r * 0.5
      y = shaftY
      z = Math.sin(angle) * r * 0.5
    } else if (t < 0.88) {
      // ─── HORIZONTAL CROSSBAR — at loop base ───
      const st = Math.random()
      const barX = (st - 0.5) * 1.3
      const angle = Math.random() * TAU
      const r = tubeR * (0.55 + Math.random() * 0.45)
      x = barX
      y = crossY + Math.cos(angle) * r * 0.4
      z = Math.sin(angle) * r * 0.5
    } else {
      // ─── JOINT where crossbar meets shaft + loop base ───
      const angle = Math.random() * TAU
      const phi = Math.acos(2 * Math.random() - 1)
      const r = tubeR * 1.2
      x = Math.sin(phi) * Math.cos(angle) * r * 0.5
      y = crossY + Math.sin(phi) * Math.sin(angle) * r * 0.4
      z = Math.cos(phi) * r * 0.5
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
      // ─── UPPER JAW / SNOUT ─── starts flush with head front, tapers forward
      const st = Math.random()
      const snoutLen = 0.55
      const taper = 1 - st * 0.45
      const angle = Math.random() * TAU
      const shell = 0.85 + Math.random() * 0.15
      x = -1.15 - st * snoutLen // starts at head front edge
      y = 0.15 + Math.sin(angle) * 0.12 * taper * shell
      z = Math.cos(angle) * 0.18 * taper * shell
      if (Math.random() < 0.3) y += 0.04 * taper
    } else if (t < 0.13) {
      // ─── LOWER JAW ─── hangs open
      const st = Math.random()
      const taper = 1 - st * 0.35
      x = -1.15 - st * 0.42
      y = -0.08 - (1 - st) * 0.18
      z = (Math.random() - 0.5) * 0.28 * taper
      if (Math.random() < 0.25) {
        y -= 0.04 + Math.random() * 0.06
        z = (Math.random() - 0.5) * 0.16 * taper
      }
    } else if (t < 0.17) {
      // ─── TEETH ─── fang clusters along both jaws
      const toothIdx = Math.floor(Math.random() * 8)
      const st = toothIdx / 8
      const side = Math.random() < 0.5 ? 1 : -1
      const isUpper = Math.random() < 0.5
      x = -1.15 - st * 0.35 + jj()
      y = isUpper ? (0.08 - Math.random() * 0.08) : (-0.12 - Math.random() * 0.1)
      z = side * (0.06 + st * 0.04) + jj()
    } else if (t < 0.27) {
      // ─── HEAD MASS ─── large cranium, surface sphere shell
      const a = Math.random() * TAU
      const phi = Math.acos(2 * Math.random() - 1)
      const shell = 0.8 + Math.random() * 0.2
      const r = 0.38 * shell
      x = -0.80 + Math.sin(phi) * Math.cos(a) * r * 0.9
      y = 0.18 + Math.sin(phi) * Math.sin(a) * r * 0.75
      z = Math.cos(phi) * r * 0.65
    } else if (t < 0.31) {
      // ─── EYES ─── bright clusters with pupils
      const side = Math.random() < 0.5 ? 1 : -1
      const isPupil = Math.random() < 0.4
      const a = Math.random() * TAU
      const r = isPupil ? Math.random() * 0.025 : (0.03 + Math.random() * 0.04)
      x = -0.96 + Math.cos(a) * r
      y = 0.28 + Math.sin(a) * r
      z = side * 0.23 + jj()
    } else if (t < 0.33) {
      // ─── NOSTRILS ─── two flared openings with smoke wisps
      const side = Math.random() < 0.5 ? 1 : -1
      const isSmoke = Math.random() < 0.3
      if (isSmoke) {
        x = -1.7 - Math.random() * 0.2
        y = 0.12 + (Math.random() - 0.5) * 0.1
        z = side * 0.06 + (Math.random() - 0.5) * 0.08
      } else {
        const a = Math.random() * TAU
        const r = Math.random() * 0.045
        x = -1.62 + Math.cos(a) * r
        y = 0.12 + Math.sin(a) * r
        z = side * 0.09 + jj()
      }
    } else if (t < 0.39) {
      // ─── HORNS ─── two branching antler-like horns, each with 2-3 tines
      const side = Math.random() < 0.5 ? 1 : -1
      const st = Math.random()
      const branch = Math.random()
      const hornBase = { x: -0.65, y: 0.5 }
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
      x = -1.35 - st * 0.35 + j()
      y = -0.05 - st * 0.4 - (isOuter ? st * 0.1 : 0)
      z = side * (0.1 + st * spread) + j()
    } else if (t < 0.46) {
      // ─── FLAME BREATH ─── wispy particles trailing from mouth
      const st = Math.random()
      x = -1.65 - st * 0.45
      y = 0.02 + (Math.random() - 0.5) * (0.12 + st * 0.2)
      z = (Math.random() - 0.5) * (0.1 + st * 0.18)
    } else if (t < 0.49) {
      // ─── NECK ─── thick tube connecting head mass to body spine
      const st = Math.random()
      const neckX = -0.80 + st * 0.35 // -0.80 (head) to -0.45 (body start)
      const neckY = 0.18 - st * 0.12 + (Math.random() - 0.5) * 0.08
      const neckZ = (Math.random() - 0.5) * 0.25
      const angle = Math.random() * TAU
      const neckR = 0.18 * (1 - st * 0.2)
      const shell = 0.6 + Math.random() * 0.4
      x = neckX + Math.cos(angle) * neckR * shell * 0.3
      y = neckY + Math.sin(angle) * neckR * shell * 0.5
      z = neckZ + Math.cos(angle + 1) * neckR * shell * 0.3
    } else if (t < 0.55) {
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
    } else if (t < 0.84) {
      // ─── BODY ─── serpentine S-curve, DENSE tube of particles
      const st = (t - 0.59) / 0.25
      const sp = spine(st)
      // Body gets thinner toward tail, base thickness increased for leg connection
      const bodyR = 0.36 * (1 - st * 0.5)
      // Surface-biased distribution (80% near surface for definition)
      const angle = Math.random() * TAU
      const surfaceBias = Math.random() < 0.8
      const minOff = surfaceBias ? bodyR * 0.65 : bodyR * 0.2
      const r = minOff + Math.random() * (bodyR - minOff)
      x = sp.x + Math.cos(angle) * r * 0.6
      y = sp.y + Math.sin(angle) * r
      z = sp.z + Math.cos(angle + 1.5) * r * 0.7
    } else if (t < 0.90) {
      // ─── LEGS / CLAWS ─── four muscular legs with 3-toed claws
      const legIdx = Math.floor(Math.random() * 4)
      const st = Math.random()
      // Leg positions: bz is the OFFSET from spine z (left/right side)
      const legDefs = [
        { bodyT: 0.08, side:  1 },  // front left
        { bodyT: 0.08, side: -1 },  // front right
        { bodyT: 0.58, side:  1 },  // rear left
        { bodyT: 0.58, side: -1 },  // rear right
      ]
      const leg = legDefs[legIdx]
      const sp = spine(leg.bodyT)
      // Legs extend outward from spine z, not fixed position
      const legZTarget = sp.z + leg.side * 0.28
      const legXTarget = sp.x
      const legThick = 0.10 * (1 - st * 0.35)
      const angle = Math.random() * TAU
      let x_leg = legXTarget + Math.cos(angle) * legThick * 0.35
      let y_leg = sp.y - st * 0.38 + Math.sin(angle) * legThick * 0.35
      let z_leg = legZTarget + jj()

      // Blend into body at top of leg (shoulder/hip joint) — wide blend zone
      if (st < 0.35) {
        const blendT = st / 0.35 // 0→1 over blend zone
        const bodyBlend = 1 - blendT
        x_leg = x_leg * blendT + sp.x * bodyBlend
        z_leg = z_leg * blendT + sp.z * bodyBlend
        // Extra width at shoulder/hip for muscular connection
        x_leg += (Math.random() - 0.5) * 0.12 * bodyBlend
        z_leg += (Math.random() - 0.5) * 0.10 * bodyBlend
        y_leg += 0.04 * bodyBlend // slight upward pull toward body
      }

      x = x_leg
      y = y_leg
      z = z_leg

      // Claws at bottom — three toes spread
      if (st > 0.82) {
        const toe = Math.floor(Math.random() * 3) - 1
        x += toe * 0.04 + jj()
        y -= 0.04
        z += toe * 0.03 * leg.side
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

// yinYang function removed permanently

function omSymbol(count) {
  // Om ॐ — full 3D volumetric figure. Every stroke is a thick tube with
  // real depth, not flat jittered lines. Looks solid from every angle.
  const pts = new Float32Array(count * 3)
  const R = 0.1 // tube radius

  // Helper: place particle on a tube around a centerline point
  function tube(cx, cy, cz, radius) {
    const a = Math.random() * TAU
    const r = radius * (0.5 + Math.random() * 0.5)
    return {
      x: cx + Math.cos(a) * r * 0.6,
      y: cy + Math.sin(a) * r * 0.5,
      z: (cz || 0) + Math.cos(a + 1.5) * r * 0.6,
    }
  }

  for (let i = 0; i < count; i++) {
    const t = Math.random()
    let p

    if (t < 0.22) {
      // ─── BELLY CURL — 3D tube forming the "3" shape ───
      const st = Math.random()
      let cx, cy
      if (st < 0.5) {
        const a = (st / 0.5) * Math.PI + Math.PI * 0.5
        cx = -0.25 + Math.cos(a) * 0.34
        cy = -0.15 + Math.sin(a) * 0.27
      } else {
        const a = ((st - 0.5) / 0.5) * Math.PI - Math.PI * 0.5
        cx = -0.25 + Math.cos(a) * 0.30
        cy = -0.55 + Math.sin(a) * 0.24
      }
      p = tube(cx, cy, 0, R)
    } else if (t < 0.40) {
      // ─── TOP ARCH — 3D tube sweeping over the belly ───
      const st = Math.random()
      const a = st * Math.PI
      const cx = Math.cos(a) * 0.62
      const cy = 0.25 + Math.sin(a) * 0.38
      p = tube(cx, cy, 0, R)
    } else if (t < 0.52) {
      // ─── TAIL SWOOSH — 3D bezier tube curving down-right ───
      const st = Math.random()
      const u = st
      const cx = (1-u)*(1-u)*0.55 + 2*(1-u)*u*0.82 + u*u*0.88
      const cy = (1-u)*(1-u)*0.2 + 2*(1-u)*u*0.32 + u*u*-0.22
      p = tube(cx, cy, 0, R)
    } else if (t < 0.60) {
      // ─── CONNECTING HOOK — 3D tube linking belly to arch ───
      const st = Math.random()
      const cx = -0.55 + (-0.6 - -0.55) * st
      const cy = -0.15 + (0.25 - -0.15) * st + Math.sin(st * Math.PI) * 0.08
      p = tube(cx, cy, 0, R * 0.9)
    } else if (t < 0.72) {
      // ─── VERTICAL STEM — 3D cylinder going straight up ───
      const st = Math.random()
      const cy = -0.3 + st * 0.9
      p = tube(0.50, cy, 0, R)
    } else if (t < 0.86) {
      // ─── CRESCENT MOON — 3D tube arc above stem ───
      const st = Math.random()
      const a = st * Math.PI + Math.PI
      const cx = 0.50 + Math.cos(a) * 0.22
      const cy = 0.72 + Math.sin(a) * 0.14
      p = tube(cx, cy, 0, R * 0.8)
    } else {
      // ─── BINDU — full 3D sphere above crescent ───
      const a = Math.random() * TAU
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 0.1 * (0.5 + Math.random() * 0.5)
      p = {
        x: 0.50 + Math.sin(phi) * Math.cos(a) * r,
        y: 0.92 + Math.sin(phi) * Math.sin(a) * r,
        z: Math.cos(phi) * r,
      }
    }

    pts[i*3] = p.x; pts[i*3+1] = p.y; pts[i*3+2] = p.z
  }
  return pts
}

const FIGURES = [
  { name: 'Geodesic Sphere', generator: (n) => fibSphere(n, 1.0), label: 'Universal Form' },
  { name: 'Merkaba', generator: merkaba, label: 'Light Vehicle · Hebrew' },
  { name: 'Ankh', generator: ankh, label: 'Key of Life · Egyptian', particles: 14000 },
  { name: 'Stepped Pyramid', generator: mayanPyramid, label: 'Temple of Time · Mayan' },
  { name: 'Dragon', generator: chineseDragon, label: 'Celestial Guardian · Chinese', particles: 20000 },
  { name: 'Tree of Life', generator: treeOfLife, label: 'Etz Chaim · Kabbalistic' },
  { name: 'DNA Helix', generator: dnaHelix, label: 'Double Helix · The Code of Life' },
  // Yin Yang removed
  { name: 'Om', generator: omSymbol, label: 'Aum · The Primordial Sound · Sanskrit', particles: 14000 },
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
          fontSize: 'clamp(12px, 2.5vw, 18px)',
          fontWeight: 600,
          letterSpacing: '0.5em',
          color: 'rgba(201,168,76,0.85)',
          textShadow: '0 0 20px rgba(201,168,76,0.3), 0 0 50px rgba(201,168,76,0.1)',
          marginTop: 8,
        }}>
          KNOW THYSELF
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={(e) => { e.stopPropagation(); setOpacity(0); setTimeout(() => onComplete?.(), 500) }}
        style={{
          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          fontSize: 10, letterSpacing: '.2em', color: 'rgba(201,168,76,0.6)',
          fontFamily: "'Cinzel',serif", textTransform: 'uppercase',
          background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)',
          borderRadius: 20, padding: '8px 28px', cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.target.style.background = 'rgba(201,168,76,0.15)'; e.target.style.color = 'rgba(201,168,76,0.9)' }}
        onMouseLeave={e => { e.target.style.background = 'rgba(201,168,76,0.08)'; e.target.style.color = 'rgba(201,168,76,0.6)' }}
      >
        Skip
      </button>
    </div>
  )
}
