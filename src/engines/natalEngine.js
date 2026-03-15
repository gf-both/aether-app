/**
 * natalEngine.js
 * Pure JS natal chart calculation engine using astronomy-engine.
 * Computes planets, houses (Placidus), aspects, and angles for a birth chart.
 */
import * as Astronomy from 'astronomy-engine'

// ─── Constants ────────────────────────────────────────────────────────────────

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI

// Known North Node epoch: Jan 1, 2000 (J2000.0) — mean North Node ~125.044°
// Mean motion: −0.052954°/day (retrograde)
const NN_J2000_LON = 125.044
const NN_DAILY_MOTION = -0.052954

// Aspect definitions: [name, angle, orb]
const ASPECT_DEFS = [
  { aspect: 'conjunction', angle: 0, orb: 8 },
  { aspect: 'sextile', angle: 60, orb: 6 },
  { aspect: 'square', angle: 90, orb: 8 },
  { aspect: 'trine', angle: 120, orb: 8 },
  { aspect: 'opposition', angle: 180, orb: 8 },
]

// ─── Utility ──────────────────────────────────────────────────────────────────

function mod360(x) {
  return ((x % 360) + 360) % 360
}

function lonToSign(lon) {
  const idx = Math.floor(mod360(lon) / 30)
  const deg = mod360(lon) - idx * 30
  return { sign: SIGN_NAMES[idx], signIndex: idx, degree: deg }
}

function julianDayFromDate(date) {
  // date is a JS Date object
  const t = Astronomy.MakeTime(date)
  return t.tt + 2451545.0  // J2000 offset
}

/**
 * Compute ecliptic longitude of the Sun using SunPosition (geocentric ecliptic)
 */
function getSunLon(astroTime) {
  const pos = Astronomy.SunPosition(astroTime)
  return pos.elon
}

/**
 * Get ecliptic longitude for a planet body (geocentric).
 * For the Sun we use SunPosition; for the Moon we use EclipticGeoMoon;
 * for others we use GeoVector + Ecliptic (geocentric).
 */
function getPlanetLon(body, astroTime) {
  if (body === 'Sun') {
    return getSunLon(astroTime)
  }
  if (body === 'Moon') {
    const m = Astronomy.EclipticGeoMoon(astroTime)
    return mod360(m.lon)
  }
  // Use geocentric vector for all other bodies
  const gv = Astronomy.GeoVector(body, astroTime, true)
  const ecl = Astronomy.Ecliptic(gv)
  return mod360(ecl.elon)
}

/**
 * Determine if a planet is retrograde by comparing position 24h before and after.
 */
function isRetrograde(body, astroTime) {
  if (body === 'Sun' || body === 'Moon') return false
  const ms = astroTime.date.getTime()
  const t1 = Astronomy.MakeTime(new Date(ms - 24 * 3600 * 1000))
  const t2 = Astronomy.MakeTime(new Date(ms + 24 * 3600 * 1000))
  // Use geocentric longitude
  const gv1 = Astronomy.GeoVector(body, t1, true)
  const gv2 = Astronomy.GeoVector(body, t2, true)
  const lon1 = mod360(Astronomy.Ecliptic(gv1).elon)
  const lon2 = mod360(Astronomy.Ecliptic(gv2).elon)
  // Account for wrap-around at 0/360
  let delta = lon2 - lon1
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  return delta < 0
}

/**
 * Compute mean obliquity of the ecliptic for an AstroTime.
 * Uses IAU formula.
 */
function getMeanObliquity(astroTime) {
  const T = astroTime.tt / 36525.0  // Julian centuries from J2000
  // IAU 1980 formula (degrees)
  const eps = 23.439291111
    - 0.013004167 * T
    - 0.0000001639 * T * T
    + 0.0000005036 * T * T * T
  return eps
}

/**
 * Compute Local Sidereal Time (degrees) for a given UTC date and longitude.
 * Uses astronomy-engine SiderealTime (returns hours) + local offset.
 */
function getLocalSiderealTime(astroTime, lonDeg) {
  const gst = Astronomy.SiderealTime(astroTime)  // GMST in hours
  const lst = gst + lonDeg / 15.0
  return mod360(lst * 15)  // convert hours to degrees
}

/**
 * Compute RAMC (Right Ascension of Midheaven) in degrees.
 * RAMC = LST (in degrees)
 */
function getRAMC(astroTime, lonDeg) {
  return getLocalSiderealTime(astroTime, lonDeg)
}

/**
 * Compute MC (Midheaven) ecliptic longitude from RAMC and obliquity.
 * MC = arctan(tan(RAMC) / cos(obliquity))
 */
function getMC(ramc, oblDeg) {
  const ramcRad = ramc * DEG2RAD
  const oblRad = oblDeg * DEG2RAD
  let mc = Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(oblRad)) * RAD2DEG
  if (Math.cos(ramcRad) < 0) {
    mc += 180
  }
  return mod360(mc)
}

/**
 * Compute ASC (Ascendant) ecliptic longitude.
 * Standard formula using obliquity, latitude, and RAMC.
 *
 * The ascendant is the ecliptic degree rising on the eastern horizon.
 * It must be in the eastern hemisphere of the chart (90° ± 90° from MC+90°).
 *
 * Key insight: at the ASC, the ecliptic crosses the horizon from below.
 * The formula gives two solutions 180° apart; we pick the one in the correct quadrant.
 * For northern latitudes: if RAMC in 0-180, ASC is in 270-90 quadrant (roughly).
 * For southern latitudes: mirrored.
 *
 * Most reliable approach: ASC is the point where ecliptic and horizon intersect on the east.
 * The eastern horizon corresponds to RA = RAMC + 6h = RAMC + 90°.
 */
function getASC(ramc, oblDeg, latDeg) {
  const ramcRad = ramc * DEG2RAD
  const oblRad = oblDeg * DEG2RAD
  const latRad = latDeg * DEG2RAD

  const y = -Math.cos(ramcRad)
  const x = Math.sin(ramcRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad)
  let asc = Math.atan2(y, x) * RAD2DEG
  asc = mod360(asc)

  // Quadrant correction using RAMC parity:
  // When cos(RAMC) > 0 (RAMC in 270-90, i.e. near midnight), ASC needs +180°
  // to be in the correct rising hemisphere.
  // Standard rule: RAMC quadrant determines which root to take.
  //   if RAMC is in (90, 270) => the atan2 result needs no correction
  //   if RAMC is in (270, 90) => add 180°
  const ramcMod = mod360(ramc)
  if (ramcMod > 270 || ramcMod < 90) {
    asc = mod360(asc + 180)
  }

  return asc
}

/**
 * Compute Placidus house cusps.
 * Returns array of 12 ecliptic longitudes (houses 1–12).
 *
 * Uses iterative Placidus semi-arc method.
 * Each cusp is found by solving: RA(lon) = RAMC ± fraction × SA(lon)
 * where SA = 90 ± AD(lon), and AD = arcsin(tan(lat)×tan(dec(lon)))
 *
 * Verified against Swiss Ephemeris for Gaston's chart.
 */
function getPlacidusHouses(ramc, oblDeg, latDeg) {
  const oblRad = oblDeg * DEG2RAD
  const latRad = latDeg * DEG2RAD

  // MC and IC
  const mc = getMC(ramc, oblDeg)
  const ic = mod360(mc + 180)

  // ASC and DSC
  const asc = getASC(ramc, oblDeg, latDeg)
  const dsc = mod360(asc + 180)

  /** Convert RA to ecliptic longitude (no declination needed, using ecliptic formula) */
  function lonFromRA(raDeg) {
    const raRad = mod360(raDeg) * DEG2RAD
    let lon = Math.atan2(Math.sin(raRad), Math.cos(raRad) * Math.cos(oblRad)) * RAD2DEG
    return mod360(lon)
  }

  /** Diurnal Semi-Arc for a given ecliptic longitude */
  function getDSA(lonDeg) {
    const lonRad = lonDeg * DEG2RAD
    const dec = Math.asin(Math.sin(oblRad) * Math.sin(lonRad))
    const sinAD = Math.tan(latRad) * Math.tan(dec)
    if (Math.abs(sinAD) >= 1) return 90  // circumpolar / never sets
    const AD = Math.asin(Math.min(1, Math.max(-1, sinAD))) * RAD2DEG
    return 90 + AD
  }

  /** Nocturnal Semi-Arc = 180 - DSA */
  function getNSA(lonDeg) { return 180 - getDSA(lonDeg) }

  /**
   * Iterative solver for Placidus cusps.
   * getRATarget(lon) returns the RA that this cusp should equal given its own DSA.
   * initialLon: starting estimate for ecliptic longitude.
   */
  function iterSolve(getRATarget, initialLon) {
    let lon = mod360(initialLon)
    for (let i = 0; i < 50; i++) {
      const target = getRATarget(lon)
      const newLon = lonFromRA(target)
      const diff = mod360(newLon - lon + 180) - 180
      if (Math.abs(diff) < 0.0001) break
      lon = mod360(lon + diff * 0.5)  // damped iteration
    }
    return mod360(lon)
  }

  // Houses 11, 12: above horizon, MC→ASC arc, trisected by DSA
  const h11 = iterSolve(lon => ramc + (1/3) * getDSA(lon), mod360(mc + 22))
  const h12 = iterSolve(lon => ramc + (2/3) * getDSA(lon), mod360(mc + 44))

  // Houses 2, 3: below horizon, IC→DSC arc, trisected by NSA (from IC side)
  const h2 = iterSolve(lon => ramc + 180 - (2/3) * getNSA(lon), mod360(ic + 44))
  const h3 = iterSolve(lon => ramc + 180 - (1/3) * getNSA(lon), mod360(ic + 22))

  // Houses 5, 6: below horizon, IC→DSC arc, on the DSC side
  const h5 = iterSolve(lon => ramc + 180 + (1/3) * getNSA(lon), mod360(dsc - 44))
  const h6 = iterSolve(lon => ramc + 180 + (2/3) * getNSA(lon), mod360(dsc - 22))

  // Houses 8, 9: above horizon, DSC→MC arc, trisected by DSA (from DSC side)
  const h8 = iterSolve(lon => mod360(ramc + 360 - (2/3) * getDSA(lon)), mod360(mc - 44))
  const h9 = iterSolve(lon => mod360(ramc + 360 - (1/3) * getDSA(lon)), mod360(mc - 22))

  // Return 12 cusps in order (house 1 = index 0)
  return [asc, h2, h3, ic, h5, h6, dsc, h8, h9, mc, h11, h12]
}

// Map from lowercase planet key to astronomy-engine Body name
const KEY_TO_BODY = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune',
  pluto: 'Pluto', northNode: null,  // northNode uses mean motion, no body lookup
}

/**
 * Get future ecliptic longitude by lowercase key.
 */
function getPlanetLonByKey(key, astroTime) {
  if (key === 'northNode') {
    return getNorthNodeLon(astroTime)
  }
  const body = KEY_TO_BODY[key]
  if (!body) return null
  return getPlanetLon(body, astroTime)
}

/**
 * Compute aspects between all planet pairs.
 */
function computeAspects(planetLons, astroTime) {
  const aspects = []
  const names = Object.keys(planetLons)

  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const p1 = names[i]
      const p2 = names[j]
      const lon1 = planetLons[p1]
      const lon2 = planetLons[p2]

      let diff = Math.abs(mod360(lon1 - lon2))
      if (diff > 180) diff = 360 - diff

      for (const asp of ASPECT_DEFS) {
        const orb = Math.abs(diff - asp.angle)
        if (orb <= asp.orb) {
          // Determine applying/separating: compare current orb vs orb 24h later
          const ms = astroTime.date.getTime()
          const tFut = Astronomy.MakeTime(new Date(ms + 24 * 3600 * 1000))
          const lon1f = getPlanetLonByKey(p1, tFut)
          const lon2f = getPlanetLonByKey(p2, tFut)
          let diffFut = (lon1f !== null && lon2f !== null)
            ? Math.abs(mod360(lon1f - lon2f))
            : diff
          if (diffFut > 180) diffFut = 360 - diffFut
          const orbFut = Math.abs(diffFut - asp.angle)
          const applying = orbFut < orb

          aspects.push({
            planet1: p1,
            planet2: p2,
            aspect: asp.aspect,
            orb: Math.round(orb * 100) / 100,
            applying,
          })
          break
        }
      }
    }
  }

  return aspects
}

/**
 * Compute North Node longitude using mean motion from J2000.
 */
function getNorthNodeLon(astroTime) {
  // Days since J2000.0 (noon Jan 1 2000 UTC)
  const j2000Days = astroTime.tt  // astronomy-engine tt is Julian days from J2000
  const lon = mod360(NN_J2000_LON + NN_DAILY_MOTION * j2000Days)
  return lon
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Compute a full natal chart.
 *
 * @param {Object} params
 * @param {number} params.day         Birth day (1–31)
 * @param {number} params.month       Birth month (1–12)
 * @param {number} params.year        Birth year
 * @param {number} params.hour        Birth hour (local, 0–23)
 * @param {number} params.minute      Birth minute (0–59)
 * @param {number} params.lat         Latitude (decimal degrees, S = negative)
 * @param {number} params.lon         Longitude (decimal degrees, W = negative)
 * @param {number} params.timezone    UTC offset in hours (e.g. -3 for Buenos Aires)
 *
 * @returns {Object} Full natal chart data
 */
export function getNatalChart({ day, month, year, hour, minute, lat, lon, timezone }) {
  // 1. Convert local time to UTC
  const localTotalMinutes = hour * 60 + minute
  const utcTotalMinutes = localTotalMinutes - timezone * 60

  let utcYear = year, utcMonth = month, utcDay = day
  let utcHour = Math.floor(utcTotalMinutes / 60)
  let utcMinute = Math.round(utcTotalMinutes % 60)

  // Handle minute overflow
  if (utcMinute < 0) { utcMinute += 60; utcHour -= 1 }
  if (utcMinute >= 60) { utcMinute -= 60; utcHour += 1 }

  // Handle day rollover
  if (utcHour < 0) {
    utcHour += 24
    const prevDay = new Date(utcYear, utcMonth - 1, utcDay - 1)
    utcYear = prevDay.getFullYear()
    utcMonth = prevDay.getMonth() + 1
    utcDay = prevDay.getDate()
  } else if (utcHour >= 24) {
    utcHour -= 24
    const nextDay = new Date(utcYear, utcMonth - 1, utcDay + 1)
    utcYear = nextDay.getFullYear()
    utcMonth = nextDay.getMonth() + 1
    utcDay = nextDay.getDate()
  }

  const utcDate = new Date(Date.UTC(utcYear, utcMonth - 1, utcDay, utcHour, utcMinute, 0))
  const astroTime = Astronomy.MakeTime(utcDate)

  // 2. Compute planetary longitudes
  const bodyMap = {
    sun:     'Sun',
    moon:    'Moon',
    mercury: 'Mercury',
    venus:   'Venus',
    mars:    'Mars',
    jupiter: 'Jupiter',
    saturn:  'Saturn',
    uranus:  'Uranus',
    neptune: 'Neptune',
    pluto:   'Pluto',
  }

  const planets = {}
  for (const [key, body] of Object.entries(bodyMap)) {
    const lonVal = getPlanetLon(body, astroTime)
    const { sign, signIndex, degree } = lonToSign(lonVal)
    const retrograde = isRetrograde(body, astroTime)
    planets[key] = { lon: Math.round(lonVal * 1000) / 1000, sign, signIndex, degree: Math.round(degree * 1000) / 1000, retrograde }
  }

  // North Node (mean)
  const nnLon = getNorthNodeLon(astroTime)
  const nnSign = lonToSign(nnLon)
  planets.northNode = { lon: Math.round(nnLon * 1000) / 1000, ...nnSign, degree: Math.round(nnSign.degree * 1000) / 1000, retrograde: true }

  // 3. Compute angles
  const obliquity = getMeanObliquity(astroTime)
  const ramc = getRAMC(astroTime, lon)
  const mcLon = getMC(ramc, obliquity)
  const ascLon = getASC(ramc, obliquity, lat)
  const descLon = mod360(ascLon + 180)
  const icLon = mod360(mcLon + 180)

  const angles = {
    asc:  { lon: Math.round(ascLon * 1000) / 1000,  ...lonToSign(ascLon) },
    mc:   { lon: Math.round(mcLon * 1000) / 1000,   ...lonToSign(mcLon) },
    desc: { lon: Math.round(descLon * 1000) / 1000, ...lonToSign(descLon) },
    ic:   { lon: Math.round(icLon * 1000) / 1000,   ...lonToSign(icLon) },
  }

  // Round degree in angles
  for (const k of Object.keys(angles)) {
    angles[k].degree = Math.round(angles[k].degree * 1000) / 1000
  }

  // 4. Compute Placidus houses
  const cuspLons = getPlacidusHouses(ramc, obliquity, lat)
  const houses = cuspLons.map((cLon, i) => {
    const { sign, signIndex, degree } = lonToSign(cLon)
    return { house: i + 1, lon: Math.round(cLon * 1000) / 1000, sign, signIndex, degree: Math.round(degree * 1000) / 1000 }
  })

  // 5. Compute aspects
  const allLons = {}
  for (const [k, v] of Object.entries(planets)) {
    allLons[k] = v.lon
  }
  const aspects = computeAspects(allLons, astroTime)

  // 6. Meta
  const pad = (n) => String(n).padStart(2, '0')
  const birthDate = `${year}-${pad(month)}-${pad(day)}`
  const birthTime = `${pad(hour)}:${pad(minute)}`
  const utcDateTime = `${utcYear}-${pad(utcMonth)}-${pad(utcDay)}T${pad(utcHour)}:${pad(utcMinute)}:00Z`

  return {
    planets,
    angles,
    houses,
    aspects,
    meta: {
      birthDate,
      birthTime,
      lat,
      lon,
      timezone,
      utcDateTime,
    },
  }
}
