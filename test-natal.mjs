// Test natal chart for Gaston Frydlewski
// Birth: January 23, 1981, 10:10 PM, Buenos Aires, Argentina
// Lat: -34.6037, Lon: -58.3816, UTC-3

import { getNatalChart } from './src/engines/natalEngine.js'

const chart = getNatalChart({
  day: 23,
  month: 1,
  year: 1981,
  hour: 22,      // 10:10 PM
  minute: 10,
  lat: -34.6037,
  lon: -58.3816,
  timezone: -3,
})

console.log('=== NATAL CHART VALIDATION ===')
console.log()
console.log('META:', JSON.stringify(chart.meta, null, 2))
console.log()
console.log('PLANETS:')
for (const [key, p] of Object.entries(chart.planets)) {
  const ret = p.retrograde ? ' Rx' : ''
  console.log(`  ${key.padEnd(12)} ${String(Math.floor(p.degree)).padStart(2)}° ${p.sign.padEnd(14)} (lon: ${p.lon.toFixed(2)})${ret}`)
}
console.log()
console.log('ANGLES:')
for (const [key, a] of Object.entries(chart.angles)) {
  console.log(`  ${key.padEnd(6)} ${String(Math.floor(a.degree)).padStart(2)}° ${a.sign.padEnd(14)} (lon: ${a.lon.toFixed(2)})`)
}
console.log()
console.log('HOUSES (Placidus):')
for (const h of chart.houses) {
  console.log(`  H${String(h.house).padStart(2)}: ${String(Math.floor(h.degree)).padStart(2)}° ${h.sign}`)
}
console.log()
console.log('ASPECTS:')
for (const a of chart.aspects) {
  const dir = a.applying ? '(applying)' : '(separating)'
  console.log(`  ${a.planet1.padEnd(10)} ${a.aspect.padEnd(12)} ${a.planet2.padEnd(10)} orb: ${a.orb.toFixed(2)}° ${dir}`)
}

// Validation
console.log()
console.log('=== VALIDATION CHECKS ===')
const expected = {
  sun:     { sign: 'Aquarius', degMin: 3, degMax: 5 },
  moon:    { sign: 'Virgo',    degMin: 17, degMax: 20 },
  mercury: { sign: 'Aquarius', degMin: 18, degMax: 21 },
  venus:   { sign: 'Capricorn', degMin: 14, degMax: 18 },
  mars:    { sign: 'Aquarius', degMin: 18, degMax: 21 },
  jupiter: { sign: 'Libra',   degMin: 8, degMax: 12 },
  saturn:  { sign: 'Libra',   degMin: 8, degMax: 12 },
  uranus:  { sign: 'Scorpio', degMin: 27, degMax: 30 },
  neptune: { sign: 'Sagittarius', degMin: 22, degMax: 26 },
  pluto:   { sign: 'Libra',   degMin: 22, degMax: 26 },
}

let allPass = true
for (const [key, exp] of Object.entries(expected)) {
  const p = chart.planets[key]
  const signOk = p.sign === exp.sign
  const degOk = p.degree >= exp.degMin && p.degree <= exp.degMax
  const ok = signOk && degOk
  if (!ok) allPass = false
  console.log(`  ${ok ? '✓' : '✗'} ${key.padEnd(10)}: ${p.sign} ${p.degree.toFixed(1)}°  ${ok ? 'PASS' : 'FAIL (expected ' + exp.sign + ' ' + exp.degMin + '-' + exp.degMax + '°)'}`)
}

const asc = chart.angles.asc
const ascOk = asc.sign === 'Virgo' && asc.degree >= 15 && asc.degree <= 21
if (!ascOk) allPass = false
console.log(`  ${ascOk ? '✓' : '✗'} ASC       : ${asc.sign} ${asc.degree.toFixed(1)}°  ${ascOk ? 'PASS' : 'FAIL (expected Virgo ~18°)'}`)

console.log()
console.log(allPass ? '✅ ALL CHECKS PASSED' : '⚠️  SOME CHECKS FAILED')
