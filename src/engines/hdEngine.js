/* ============================================================
   HUMAN DESIGN CALCULATION ENGINE
   Uses astronomy-engine for planetary positions.
   HD_OFFSET = 302.0° (empirically verified against reference charts)
   ============================================================ */

import * as Astronomy from 'astronomy-engine'

// ---- Gate Sequence (64 hexagrams mapped to zodiac) ----
const GATE_SEQUENCE = [
  41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,
  45,12,15,52,39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,
  28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60
]
const HD_OFFSET = 302.0 // gate 41 aligns here

function getGateAndLine(lon) {
  const adj = ((lon - HD_OFFSET) % 360 + 360) % 360
  const idx = Math.floor(adj / 5.625)
  const gate = GATE_SEQUENCE[idx]
  const posInGate = (adj % 5.625) / 5.625
  const line = Math.min(6, Math.ceil(posInGate * 6)) || 1
  return { gate, line }
}

// ---- Mean Ascending Lunar Node ----
function getLunarNodeLon(date) {
  const jd = (date.getTime() / 86400000) + 2440587.5
  const T = (jd - 2451545.0) / 36525
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000
  return ((omega % 360) + 360) % 360
}

// ---- Get all planetary positions for a given UTC Date ----
function getPlanets(date) {
  const result = {}
  const bodies = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']

  // Sun
  const sunLon = Astronomy.SunPosition(date).elon
  result.Sun = { lon: sunLon, ...getGateAndLine(sunLon) }

  // Earth = Sun + 180°
  const earthLon = (sunLon + 180) % 360
  result.Earth = { lon: earthLon, ...getGateAndLine(earthLon) }

  // Moon
  const moonLon = Astronomy.EclipticGeoMoon(date).lon
  result.Moon = { lon: moonLon, ...getGateAndLine(moonLon) }

  // Lunar Nodes
  const nodeLon = getLunarNodeLon(date)
  result.NorthNode = { lon: nodeLon, ...getGateAndLine(nodeLon) }
  result.SouthNode = { lon: (nodeLon + 180) % 360, ...getGateAndLine((nodeLon + 180) % 360) }

  // Other planets
  for (const body of bodies) {
    const vec = Astronomy.GeoVector(body, date, true)
    const lon = Astronomy.Ecliptic(vec).elon
    result[body] = { lon, ...getGateAndLine(lon) }
  }

  return result
}

// ---- Channel definitions ----
const CHANNEL_PAIRS = [
  [64,47],[61,24],[63,4],
  [17,62],[11,56],[43,23],
  [35,36],[12,22],[45,21],
  [33,13],[8,1],[31,7],[20,10],
  [16,48],
  [25,51],[46,29],[2,14],[15,5],
  [10,20],[7,31],[13,33],
  [21,45],[51,25],[26,44],[40,37],
  [34,57],[34,20],[34,10],
  [5,15],[14,2],[29,46],[9,52],[3,60],[42,53],[27,50],[59,6],
  [48,16],[57,34],[44,26],[50,27],[32,54],[28,38],[18,58],
  [36,35],[22,12],[37,40],[6,59],[49,19],[55,39],[30,41],
  [58,18],[38,28],[54,32],[53,42],[60,3],[52,9],[19,49],[39,55],[41,30]
]

// Map canonical channel key → [center1, center2]
const CHANNEL_CENTER_MAP = {
  '4-63':   ['HEAD','AJNA'],
  '24-61':  ['HEAD','AJNA'],
  '47-64':  ['HEAD','AJNA'],
  '23-43':  ['AJNA','THROAT'],
  '56-11':  ['AJNA','THROAT'],
  '62-17':  ['AJNA','THROAT'],
  '10-20':  ['G_SELF','THROAT'],
  '7-31':   ['G_SELF','THROAT'],
  '13-33':  ['G_SELF','THROAT'],
  '1-8':    ['G_SELF','THROAT'],
  '12-22':  ['THROAT','SOLAR'],
  '35-36':  ['THROAT','SOLAR'],
  '21-45':  ['THROAT','HEART'],
  '16-48':  ['THROAT','SPLEEN'],
  '2-14':   ['G_SELF','SACRAL'],
  '5-15':   ['G_SELF','SACRAL'],
  '29-46':  ['G_SELF','SACRAL'],
  '25-51':  ['G_SELF','HEART'],
  '26-44':  ['HEART','SPLEEN'],
  '37-40':  ['HEART','SOLAR'],
  '34-10':  ['SACRAL','G_SELF'],
  '34-20':  ['SACRAL','THROAT'],
  '34-57':  ['SACRAL','SPLEEN'],
  '3-60':   ['SACRAL','ROOT'],
  '9-52':   ['SACRAL','ROOT'],
  '27-50':  ['SACRAL','SPLEEN'],
  '42-53':  ['SACRAL','ROOT'],
  '59-6':   ['SACRAL','SOLAR'],
  '6-59':   ['SACRAL','SOLAR'],
  '14-2':   ['SACRAL','G_SELF'],
  '15-5':   ['SACRAL','G_SELF'],
  '46-29':  ['SACRAL','G_SELF'],
  '18-58':  ['SPLEEN','ROOT'],
  '28-38':  ['SPLEEN','ROOT'],
  '32-54':  ['SPLEEN','ROOT'],
  '44-26':  ['SPLEEN','HEART'],
  '50-27':  ['SPLEEN','SACRAL'],
  '57-34':  ['SPLEEN','SACRAL'],
  '19-49':  ['ROOT','SOLAR'],
  '30-41':  ['ROOT','SOLAR'],
  '39-55':  ['ROOT','SOLAR'],
  '41-30':  ['ROOT','SOLAR'],
  '49-19':  ['ROOT','SOLAR'],
  '55-39':  ['ROOT','SOLAR'],
  '52-9':   ['ROOT','SACRAL'],
  '53-42':  ['ROOT','SACRAL'],
  '60-3':   ['ROOT','SACRAL'],
  '38-28':  ['ROOT','SPLEEN'],
  '54-32':  ['ROOT','SPLEEN'],
  '58-18':  ['ROOT','SPLEEN'],
}

// Normalize channel key (smaller-larger)
function channelKey(a, b) {
  return [Math.min(a, b), Math.max(a, b)].join('-')
}

// ---- Centers list ----
const ALL_CENTERS = ['HEAD','AJNA','THROAT','G_SELF','HEART','SACRAL','SPLEEN','SOLAR','ROOT']

// ---- Type determination ----
function determineType(definedCenters) {
  const has = c => definedCenters.has(c)
  if (has('SACRAL') && !has('THROAT')) return 'Generator'
  if (has('SACRAL') && has('THROAT')) {
    // Check if sacral connects to throat via channel
    return 'Manifesting Generator'
  }
  // No sacral defined
  if (!has('SACRAL')) {
    // Check if any motor (HEART/SOLAR/SACRAL/ROOT) is connected to THROAT
    const motorToThroat = has('HEART') || has('SOLAR')
    if (motorToThroat) {
      // More precise: check if motor center is defined AND connects to throat
      return 'Manifestor'
    }
    return 'Projector'
  }
  return 'Reflector'
}

// More precise type determination based on channel connections
function determineTypeFromChannels(activeChannels, definedCenters) {
  const has = c => definedCenters.has(c)
  // Reflector = no defined centers
  if (definedCenters.size === 0) return 'Reflector'
  // Has defined sacral
  if (has('SACRAL')) {
    // Is sacral connected to throat via channel? → Manifesting Generator
    const sacralToThroat = activeChannels.some(ch => {
      const centers = CHANNEL_CENTER_MAP[ch]
      if (!centers) return false
      return (centers.includes('SACRAL') && centers.includes('THROAT'))
    })
    if (sacralToThroat) return 'Manifesting Generator'
    return 'Generator'
  }
  // No sacral — check if motor connects to throat
  // Motors: HEART, SOLAR, ROOT (ROOT can connect via channel chain but typically
  // in HD the direct motor-to-throat matters: HEART→THROAT or SOLAR→THROAT)
  const motorCenters = ['HEART', 'SOLAR', 'ROOT']
  const throatMotorChannel = activeChannels.some(ch => {
    const centers = CHANNEL_CENTER_MAP[ch]
    if (!centers) return false
    return centers.includes('THROAT') && motorCenters.some(m => centers.includes(m))
  })
  if (throatMotorChannel && (has('HEART') || has('SOLAR') || has('ROOT'))) {
    return 'Manifestor'
  }
  return 'Projector'
}

// ---- Authority determination ----
function determineAuthority(definedCenters) {
  const has = c => definedCenters.has(c)
  if (has('SOLAR')) return 'Emotional'
  if (has('SACRAL')) return 'Sacral'
  if (has('SPLEEN')) return 'Splenic'
  if (has('HEART')) return 'Ego / Will'
  if (has('G_SELF')) return 'Self-Projected'
  return 'Mental' // AJNA / HEAD without motor
}

// ---- Definition type ----
function determineDefinition(definedCenters, activeChannels) {
  if (definedCenters.size === 0) return 'No Definition'

  // Build adjacency graph of defined centers
  const adj = {}
  for (const c of definedCenters) adj[c] = new Set()
  for (const ch of activeChannels) {
    const centers = CHANNEL_CENTER_MAP[ch]
    if (!centers) continue
    const [c1, c2] = centers
    if (definedCenters.has(c1) && definedCenters.has(c2)) {
      adj[c1].add(c2)
      adj[c2].add(c1)
    }
  }

  // Count connected components via BFS
  const visited = new Set()
  let components = 0
  for (const start of definedCenters) {
    if (visited.has(start)) continue
    components++
    const queue = [start]
    visited.add(start)
    while (queue.length > 0) {
      const node = queue.shift()
      for (const nb of (adj[node] || [])) {
        if (!visited.has(nb)) {
          visited.add(nb)
          queue.push(nb)
        }
      }
    }
  }

  if (components === 1) return 'Single'
  if (components === 2) return 'Split'
  if (components === 3) return 'Triple Split'
  return 'Quadruple Split'
}

// ---- Incarnation Cross ----
// Cross = Personality Sun gate / Personality Earth gate | Design Sun gate / Design Earth gate
const CROSS_NAMES = {
  '41/31|28/27': 'Right Angle Cross of the Unexpected',
  '1/2|4/49':   'Right Angle Cross of the Sphinx',
  '13/7|1/2':   'Right Angle Cross of the Vessel of Love',
  '10/15|18/17':'Right Angle Cross of the Four Ways',
  // Add more as needed — the primary cross for Gaston is the key one
}

function getIncarnationCross(personality, design) {
  const pSun   = personality.Sun.gate
  const pEarth = personality.Earth.gate
  const dSun   = design.Sun.gate
  const dEarth = design.Earth.gate
  const key = `${pSun}/${pEarth}|${dSun}/${dEarth}`
  const name = CROSS_NAMES[key] || `Cross ${pSun}/${pEarth}|${dSun}/${dEarth}`
  return { key, name, gates: [pSun, pEarth, dSun, dEarth] }
}

// ---- Main export ----
export function getHDChart({ day, month, year, hour, minute, lat, lon, timezone }) {
  // Convert local time to UTC
  const utcOffset = typeof timezone === 'number' ? timezone : -3
  const localMs = Date.UTC(year, month - 1, day, hour, minute, 0)
  const utcMs = localMs - utcOffset * 3600 * 1000
  const birthDate = new Date(utcMs)

  // Design date: find when Sun was 88° before birth
  const birthSunLon = Astronomy.SunPosition(birthDate).elon
  const designSunTarget = ((birthSunLon - 88) % 360 + 360) % 360
  const searchStart = new Date(birthDate.getTime() - 100 * 24 * 3600 * 1000)
  const designAstroDate = Astronomy.SearchSunLongitude(designSunTarget, searchStart, 200)
  const designDate = designAstroDate.date

  // Get planetary positions
  const personality = getPlanets(birthDate)
  const design = getPlanets(designDate)

  // Collect all active gates
  const personalityGates = new Set(Object.values(personality).map(p => p.gate))
  const designGates = new Set(Object.values(design).map(p => p.gate))
  const allGates = new Set([...personalityGates, ...designGates])

  // Find active channels (deduplicated)
  const seen = new Set()
  const activeChannels = []
  for (const [a, b] of CHANNEL_PAIRS) {
    const key = channelKey(a, b)
    if (!seen.has(key) && allGates.has(a) && allGates.has(b)) {
      seen.add(key)
      activeChannels.push(key)
    }
  }

  // Determine defined centers
  const definedCenters = new Set()
  for (const ch of activeChannels) {
    const centers = CHANNEL_CENTER_MAP[ch]
    if (centers) {
      definedCenters.add(centers[0])
      definedCenters.add(centers[1])
    }
  }

  // Derive HD properties
  const type = determineTypeFromChannels(activeChannels, definedCenters)
  const authority = determineAuthority(definedCenters)
  const definition = determineDefinition(definedCenters, activeChannels)
  const profile = `${personality.Sun.line}/${design.Sun.line}`
  const cross = getIncarnationCross(personality, design)

  // Strategy by type
  const strategyMap = {
    'Generator': 'Wait to Respond',
    'Manifesting Generator': 'Wait to Respond',
    'Projector': 'Wait for the Invitation',
    'Manifestor': 'Inform and Initiate',
    'Reflector': 'Wait a Lunar Cycle',
  }

  // Not-self theme
  const notSelfMap = {
    'Generator': 'Frustration',
    'Manifesting Generator': 'Frustration / Anger',
    'Projector': 'Bitterness',
    'Manifestor': 'Anger',
    'Reflector': 'Disappointment',
  }

  // Signature
  const signatureMap = {
    'Generator': 'Satisfaction',
    'Manifesting Generator': 'Satisfaction / Peace',
    'Projector': 'Success',
    'Manifestor': 'Peace',
    'Reflector': 'Surprise',
  }

  return {
    // Dates
    birthDate: birthDate.toISOString(),
    designDate: designDate.toISOString(),

    // Planetary positions
    personality,
    design,

    // Gates
    personalityGates: [...personalityGates].sort((a, b) => a - b),
    designGates: [...designGates].sort((a, b) => a - b),
    allGates: [...allGates].sort((a, b) => a - b),

    // Channels
    activeChannels,

    // Centers
    definedCenters: [...definedCenters],
    undefinedCenters: ALL_CENTERS.filter(c => !definedCenters.has(c)),

    // Profile and type
    type,
    strategy: strategyMap[type] || '',
    authority,
    definition,
    profile,
    notSelf: notSelfMap[type] || '',
    signature: signatureMap[type] || '',
    cross,
  }
}
