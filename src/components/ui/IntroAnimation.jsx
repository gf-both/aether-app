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
  // Dragon from scratch — enormous detailed head, serpentine body, flowing mane, tail flourish
  // Head is ~45% of all particles for maximum visual impact
  const pts = new Float32Array(count * 3)
  const j = () => (Math.random() - 0.5) * 0.025

  for (let i = 0; i < count; i++) {
    const t = Math.random()
    let x, y, z = (Math.random() - 0.5) * 0.06

    if (t < 0.12) {
      // ─── UPPER JAW / SNOUT ─── wide, forward-facing, defined edge
      const st = Math.random()
      const snoutLen = 0.5
      const snoutW = 0.35 * (1 - st * 0.4) // tapers toward tip
      const snoutH = 0.2 * (1 - st * 0.3)
      x = -1.2 - st * snoutLen
      y = 0.15 + (Math.random() - 0.5) * snoutH
      z = (Math.random() - 0.5) * snoutW
    } else if (t < 0.18) {
      // ─── LOWER JAW ─── hangs open slightly
      const st = Math.random()
      x = -1.2 - st * 0.4
      y = -0.1 - (1 - st) * 0.15 + j()
      z = (Math.random() - 0.5) * 0.3 * (1 - st * 0.3)
    } else if (t < 0.30) {
      // ─── HEAD MASS ─── large rounded cranium behind snout
      const a = Math.random() * TAU
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 0.35 + Math.random() * 0.1
      x = -0.85 + Math.sin(phi) * Math.cos(a) * r * 0.8
      y = 0.15 + Math.sin(phi) * Math.sin(a) * r * 0.7
      z = Math.cos(phi) * r * 0.6
    } else if (t < 0.34) {
      // ─── EYES ─── two bright clusters on sides of head
      const side = Math.random() < 0.5 ? 1 : -1
      const a = Math.random() * TAU
      const r = Math.random() * 0.06
      x = -1.05 + Math.cos(a) * r
      y = 0.25 + Math.sin(a) * r
      z = side * 0.22 + j()
    } else if (t < 0.37) {
      // ─── NOSTRILS ─── two small clusters at tip of snout
      const side = Math.random() < 0.5 ? 1 : -1
      const a = Math.random() * TAU
      const r = Math.random() * 0.04
      x = -1.65 + Math.cos(a) * r
      y = 0.12 + Math.sin(a) * r
      z = side * 0.08 + j()
    } else if (t < 0.45) {
      // ─── HORNS + CREST ─── two antler-like horns rising from top of head
      const st = Math.random()
      const side = Math.random() < 0.5 ? 1 : -1
      const hornLen = st
      x = -0.75 + st * 0.15 + j()
      y = 0.45 + hornLen * 0.55 + j()
      z = side * (0.15 + hornLen * 0.2) + j()
    } else if (t < 0.50) {
      // ─── WHISKERS / TENDRILS ─── flow from snout, long and curving
      const st = Math.random()
      const side = Math.random() < 0.5 ? 1 : -1
      x = -1.4 - st * 0.3 + j()
      y = -0.05 - st * 0.35 + j()
      z = side * (0.15 + st * 0.3) + j()
    } else if (t < 0.55) {
      // ─── MANE ─── flowing hair/flames along top of neck
      const st = Math.random()
      const bodyT = st * 0.3 // first part of body
      const spineX = -0.6 + bodyT * 3.5
      x = spineX + j()
      y = 0.3 + Math.random() * 0.35 + Math.sin(st * 4) * 0.1
      z = (Math.random() - 0.5) * 0.25
    } else if (t < 0.85) {
      // ─── BODY ─── serpentine S-curve, thick cloud, NO spine line
      const st = (t - 0.55) / 0.30
      // Spine path: smooth S going from head to tail
      const spX = -0.5 + st * 2.5
      const spY = Math.sin(st * Math.PI * 1.5) * 0.4
      const spZ = Math.cos(st * Math.PI * 0.8) * 0.3

      // Body gets thinner toward tail
      const bodyR = 0.22 * (1 - st * 0.55)
      // Random position in a disc around spine — minimum offset prevents spine line
      const angle = Math.random() * TAU
      const minOff = bodyR * 0.35
      const r = minOff + Math.random() * (bodyR - minOff)
      x = spX + Math.cos(angle) * r * 0.5
      y = spY + Math.sin(angle) * r
      z = spZ + Math.cos(angle + 1.5) * r * 0.5
    } else if (t < 0.92) {
      // ─── LEGS / CLAWS ─── four short legs with clawed feet
      const legIdx = Math.floor(Math.random() * 4)
      const st = Math.random()
      const legPositions = [
        { bx: -0.3, bz: 0.2 },  // front left
        { bx: -0.3, bz: -0.2 }, // front right
        { bx: 1.0, bz: 0.2 },   // rear left
        { bx: 1.0, bz: -0.2 },  // rear right
      ]
      const leg = legPositions[legIdx]
      const spY = Math.sin((leg.bx + 0.5) / 2.5 * Math.PI * 1.5) * 0.4
      x = leg.bx + j()
      y = spY - st * 0.35 + j()
      z = leg.bz + (st > 0.8 ? (Math.random() - 0.5) * 0.12 : 0) + j()
    } else {
      // ─── TAIL ─── tapers and curls upward with a flourish
      const st = (t - 0.92) / 0.08
      const tailX = 2.0 + st * 0.6
      const tailY = Math.sin((0.85 + st * 0.15) * Math.PI * 1.5) * 0.4 + st * 0.35
      const tailZ = Math.cos(st * Math.PI * 2) * 0.2
      const tailR = 0.08 * (1 - st * 0.6)
      const angle = Math.random() * TAU
      x = tailX + Math.cos(angle) * tailR * 0.4
      y = tailY + Math.sin(angle) * tailR
      z = tailZ + Math.cos(angle) * tailR * 0.3
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
  // Yin-Yang as TWO FISH swimming in a circle — the classic pisces interpretation
  // Each fish is a teardrop/comma shape: fat head tapering to a thin tail
  // Fish 1 (yang): head at top, tail curves right and down
  // Fish 2 (yin):  head at bottom, tail curves left and up
  // The two tails trace the S-curve naturally
  const pts = new Float32Array(count * 3)
  const R = 0.9

  // Fish shape: parametric teardrop — head is a filled circle, body tapers
  // t goes 0→1 from head center to tail tip
  function fishPoint(t, headX, headY, tailEndX, tailEndY, bodyDir, fatness) {
    // Bezier-ish path from head to tail with curve
    const midX = headX + bodyDir * R * 0.3
    const midY = (headY + tailEndY) * 0.5
    // Quadratic bezier: head → mid → tail
    const u = t
    const px = (1-u)*(1-u)*headX + 2*(1-u)*u*midX + u*u*tailEndX
    const py = (1-u)*(1-u)*headY + 2*(1-u)*u*midY + u*u*tailEndY
    // Width tapers: fat at head (t=0), thin at tail (t=1)
    const width = fatness * (1 - t * 0.85) * (0.7 + 0.3 * Math.cos(t * Math.PI * 0.5))
    return { px, py, width }
  }

  for (let i = 0; i < count; i++) {
    const t = i / count
    const z = (Math.random() - 0.5) * 0.05

    if (t < 0.12) {
      // ─── Outer circle ring ───
      const a = (t / 0.12) * TAU
      const thick = (Math.random() - 0.5) * 0.03
      pts[i*3] = Math.cos(a) * R + thick
      pts[i*3+1] = Math.sin(a) * R + thick
      pts[i*3+2] = z
    } else if (t < 0.42) {
      // ─── FISH 1 (Yang fish) — head at top, curving right ───
      const st = (t - 0.12) / 0.30
      const bodyT = Math.random() // random along fish body
      const { px, py, width } = fishPoint(bodyT, 0, R * 0.5, 0, -R * 0.5, 1, R * 0.42)
      // Random point within the fish width
      const angle = Math.random() * TAU
      const r = Math.random() * width
      pts[i*3] = px + Math.cos(angle) * r
      pts[i*3+1] = py + Math.sin(angle) * r * 0.6
      pts[i*3+2] = z
    } else if (t < 0.72) {
      // ─── FISH 2 (Yin fish) — head at bottom, curving left ───
      const st = (t - 0.42) / 0.30
      const bodyT = Math.random()
      const { px, py, width } = fishPoint(bodyT, 0, -R * 0.5, 0, R * 0.5, -1, R * 0.42)
      const angle = Math.random() * TAU
      const r = Math.random() * width
      pts[i*3] = px + Math.cos(angle) * r
      pts[i*3+1] = py + Math.sin(angle) * r * 0.6
      pts[i*3+2] = z
    } else if (t < 0.78) {
      // ─── Fish 1 EYE (dark dot in yang fish head) ───
      const a = Math.random() * TAU
      const r = Math.random() * R * 0.09
      pts[i*3] = Math.cos(a) * r
      pts[i*3+1] = R * 0.5 + Math.sin(a) * r
      pts[i*3+2] = z * 0.3
    } else if (t < 0.84) {
      // ─── Fish 2 EYE (light dot in yin fish head) ───
      const a = Math.random() * TAU
      const r = Math.random() * R * 0.09
      pts[i*3] = Math.cos(a) * r
      pts[i*3+1] = -R * 0.5 + Math.sin(a) * r
      pts[i*3+2] = z * 0.3
    } else if (t < 0.90) {
      // ─── Fish 1 TAIL FIN — fan out at the tip ───
      const st = Math.random()
      const spread = st * 0.2
      const side = (Math.random() - 0.5) * 2
      pts[i*3] = side * spread + (Math.random() - 0.5) * 0.03
      pts[i*3+1] = -R * 0.5 - st * 0.15 + (Math.random() - 0.5) * 0.04
      pts[i*3+2] = z
    } else if (t < 0.96) {
      // ─── Fish 2 TAIL FIN ───
      const st = Math.random()
      const spread = st * 0.2
      const side = (Math.random() - 0.5) * 2
      pts[i*3] = side * spread + (Math.random() - 0.5) * 0.03
      pts[i*3+1] = R * 0.5 + st * 0.15 + (Math.random() - 0.5) * 0.04
      pts[i*3+2] = z
    } else {
      // ─── Extra outer ring thickness ───
      const a = Math.random() * TAU
      const thick = (Math.random() - 0.5) * 0.035
      pts[i*3] = Math.cos(a) * R + thick
      pts[i*3+1] = Math.sin(a) * R + thick
      pts[i*3+2] = z
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
  { name: 'Dragon', generator: chineseDragon, label: 'Celestial Guardian · Chinese' },
  { name: 'Tree of Life', generator: treeOfLife, label: 'Etz Chaim · Kabbalistic' },
  { name: 'DNA Helix', generator: dnaHelix, label: 'Double Helix · The Code of Life' },
  { name: 'Yin Yang', generator: yinYang, label: 'Twin Fish · Taoist' },
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
