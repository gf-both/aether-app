// Import all engines and test 3 profiles
import { getNatalChart } from './engines/natalEngine.js'
import { getNumerologyProfile } from './engines/numerologyEngine.js'
import { getMayanProfile } from './engines/mayanEngine.js'
import { getChineseProfileFromDob } from './engines/chineseEngine.js'
import { getEgyptianSign } from './engines/egyptianEngine.js'
import { getGeneKeysProfile } from './engines/geneKeysEngine.js'
import { getKabbalahProfile } from './engines/kabbalahEngine.js'
import { getBiorhythms } from './engines/biorhythmEngine.js'
import { getTibetanProfile } from './engines/tibetanEngine.js'
import { getCelticTree } from './engines/celticTreeEngine.js'
import { getTarotBirthCards } from './engines/tarotEngine.js'
import { getGematriaProfile } from './engines/gematriaEngine.js'
import computeHDChart from './engines/hdEngine.js'
import { getVedicChart } from './engines/vedicEngine.js'

const profiles = [
  { name: 'Gaston Frydlewski', dob: '1981-01-23', tob: '22:10', lat: -34.6037, lon: -58.3816, timezone: -3 },
  { name: 'Maria Santos',       dob: '1995-06-15', tob: '08:30', lat: 40.7128,  lon: -74.0060,  timezone: -4 },
  { name: 'James Chen',         dob: '1972-11-08', tob: '14:45', lat: 51.5074,  lon: -0.1278,   timezone: 0  },
]

const results = {}

for (const p of profiles) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`PROFILE: ${p.name} (${p.dob})`)
  console.log('='.repeat(60))
  
  const [y, m, d] = p.dob.split('-').map(Number)
  const [h, min] = p.tob.split(':').map(Number)
  
  const r = {}

  // 1. Natal chart
  try {
    const chart = getNatalChart({ day: d, month: m, year: y, hour: h, minute: min, lat: p.lat, lon: p.lon, timezone: p.timezone })
    r.natal = `Sun=${chart.planets?.sun?.sign} Moon=${chart.planets?.moon?.sign} ASC=${chart.angles?.asc?.sign}`
    console.log(`NATAL: ${r.natal}`)
  } catch(e) { r.natal = `ERROR: ${e.message}`; console.log(`NATAL ERROR: ${e.message}`) }
  
  // 2. Numerology — correct API: getNumerologyProfile({ day, month, year, fullName })
  try {
    const num = getNumerologyProfile({ day: d, month: m, year: y, fullName: p.name.toUpperCase() })
    r.numerology = `LP=${num.core?.lifePath?.val} Expr=${num.core?.expression?.val} SoulUrge=${num.core?.soulUrge?.val}`
    console.log(`NUMEROLOGY: ${r.numerology}`)
  } catch(e) { r.numerology = `ERROR: ${e.message}`; console.log(`NUMEROLOGY ERROR: ${e.message}`) }
  
  // 3. Mayan — correct API: getMayanProfile(day, month, year)
  try {
    const mayan = getMayanProfile(d, m, y)
    r.mayan = `Kin=${mayan.tzolkin?.kinNumber} Sign=${mayan.tzolkin?.daySign} Tone=${mayan.tzolkin?.tone}`
    console.log(`MAYAN: ${r.mayan}`)
  } catch(e) { r.mayan = `ERROR: ${e.message}`; console.log(`MAYAN ERROR: ${e.message}`) }
  
  // 4. Chinese
  try {
    const chinese = getChineseProfileFromDob(p.dob, { hour: h, minute: min })
    r.chinese = `${chinese.element} ${chinese.animal} (${chinese.yinYang})`
    console.log(`CHINESE: ${r.chinese}`)
  } catch(e) { r.chinese = `ERROR: ${e.message}`; console.log(`CHINESE ERROR: ${e.message}`) }
  
  // 5. Egyptian
  try {
    const sign = getEgyptianSign(m, d)
    r.egyptian = `${sign?.name || JSON.stringify(sign)}`
    console.log(`EGYPTIAN: ${r.egyptian}`)
  } catch(e) { r.egyptian = `ERROR: ${e.message}`; console.log(`EGYPTIAN ERROR: ${e.message}`) }
  
  // 6. Gene Keys — correct API: getGeneKeysProfile({ day, month, year, hour, minute, timezone })
  try {
    const gk = getGeneKeysProfile({ day: d, month: m, year: y, hour: h, minute: min, timezone: p.timezone })
    // returns gk.spheres.lifesWork, gk.spheres.evolution
    const lw = gk?.spheres?.lifesWork || gk?.lifeWork
    const ev = gk?.spheres?.evolution || gk?.evolution
    r.geneKeys = `LifeWork=Gate${lw?.gate} Evolution=Gate${ev?.gate}`
    console.log(`GENE KEYS: ${r.geneKeys}`)
  } catch(e) { r.geneKeys = `ERROR: ${e.message}`; console.log(`GENE KEYS ERROR: ${e.message}`) }
  
  // 7. Kabbalah — correct API: getKabbalahProfile({ day, month, year, hour, minute, timezone })
  try {
    const kab = getKabbalahProfile({ day: d, month: m, year: y, hour: h, minute: min, timezone: p.timezone })
    // returns sephiroth array + dominantPillar
    const topSeph = kab?.sephiroth?.filter(s => s.active).sort((a,b) => b.score - a.score)[0]
    r.kabbalah = `DominantPillar=${kab?.dominantPillar} TopSephira=${topSeph?.name} TreeBalance=${kab?.treeBalance}`
    console.log(`KABBALAH: ${r.kabbalah}`)
  } catch(e) { r.kabbalah = `ERROR: ${e.message}`; console.log(`KABBALAH ERROR: ${e.message}`) }

  // 8. Human Design
  try {
    const hd = computeHDChart({ dateOfBirth: p.dob, timeOfBirth: p.tob, utcOffset: p.timezone })
    r.hd = `Type=${hd.type} Profile=${hd.profile} Authority=${hd.authority}`
    console.log(`HD: ${r.hd}`)
  } catch(e) { r.hd = `ERROR: ${e.message}`; console.log(`HD ERROR: ${e.message}`) }

  // 9. Vedic
  try {
    const vedic = getVedicChart({ day: d, month: m, year: y, hour: h, minute: min, lat: p.lat, lon: p.lon, timezone: p.timezone })
    r.vedic = `Sun=${vedic.sunSign || vedic.planets?.sun?.sign} Moon=${vedic.moonSign || vedic.planets?.moon?.sign}`
    console.log(`VEDIC: ${r.vedic}`)
  } catch(e) { r.vedic = `ERROR: ${e.message}`; console.log(`VEDIC ERROR: ${e.message}`) }

  // 10. Tibetan — correct API: getTibetanProfile({ day, month, year })
  try {
    const tib = getTibetanProfile({ day: d, month: m, year: y })
    r.tibetan = `Element=${tib.element} Animal=${tib.animal}`
    console.log(`TIBETAN: ${r.tibetan}`)
  } catch(e) { r.tibetan = `ERROR: ${e.message}`; console.log(`TIBETAN ERROR: ${e.message}`) }

  // 11. Celtic Tree — correct API: getCelticTree({ day, month })
  try {
    const celtic = getCelticTree({ day: d, month: m })
    r.celtic = `${celtic?.name || celtic?.tree || JSON.stringify(celtic)}`
    console.log(`CELTIC TREE: ${r.celtic}`)
  } catch(e) { r.celtic = `ERROR: ${e.message}`; console.log(`CELTIC ERROR: ${e.message}`) }

  // 12. Tarot Birth Cards — correct API: getTarotBirthCards({ day, month, year })
  try {
    const tarot = getTarotBirthCards({ day: d, month: m, year: y })
    r.tarot = `${tarot?.primaryCard?.name || tarot?.birthCard?.name || JSON.stringify(tarot).slice(0,60)}`
    console.log(`TAROT: ${r.tarot}`)
  } catch(e) { r.tarot = `ERROR: ${e.message}`; console.log(`TAROT ERROR: ${e.message}`) }

  // 13. Gematria — correct API: getGematriaProfile({ fullName, day, month, year })
  try {
    const gem = getGematriaProfile({ fullName: p.name, day: d, month: m, year: y })
    const pyth = gem?.methods?.pythagorean?.fullName?.total
    r.gematria = `Pythagorean=${pyth} ${JSON.stringify(gem?.methods && Object.keys(gem.methods)).slice(0,40)}`
    console.log(`GEMATRIA: ${r.gematria}`)
  } catch(e) { r.gematria = `ERROR: ${e.message}`; console.log(`GEMATRIA ERROR: ${e.message}`) }

  // 14. Biorhythm — correct API: getBiorhythms({ day, month, year })
  // returns { cycles: { physical: { value }, emotional, intellectual }, date, daysSinceBirth }
  try {
    const bio = getBiorhythms({ day: d, month: m, year: y })
    const phys = bio.physical?.value ?? bio.cycles?.physical?.value
    const emot = bio.emotional?.value ?? bio.cycles?.emotional?.value
    const intel = bio.intellectual?.value ?? bio.cycles?.intellectual?.value
    r.biorhythm = `Phys=${phys?.toFixed(3)} Emot=${emot?.toFixed(3)} Intel=${intel?.toFixed(3)} Days=${bio.daysSinceBirth}`
    console.log(`BIORHYTHM: ${r.biorhythm}`)
  } catch(e) { r.biorhythm = `ERROR: ${e.message}`; console.log(`BIORHYTHM ERROR: ${e.message}`) }

  results[p.name] = r
}

// Summary comparison
console.log(`\n${'='.repeat(60)}`)
console.log('COMPARISON SUMMARY')
console.log('='.repeat(60))

const engines = Object.keys(results[profiles[0].name] || {})
for (const eng of engines) {
  const vals = profiles.map(p => results[p.name]?.[eng])
  const allSame = vals.every(v => v === vals[0])
  const anyError = vals.some(v => v?.startsWith('ERROR'))
  const status = anyError ? '❌ ERROR' : allSame ? '⚠️  SAME' : '✅ DIFF'
  console.log(`${status} ${eng.toUpperCase().padEnd(15)} ${vals.map(v => (v||'').slice(0,35)).join(' | ')}`)
}
