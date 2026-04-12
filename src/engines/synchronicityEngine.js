// ─── Synchronicity Engine ─────────────────────────────────────────────────────
// Based on Jung's "acausal connecting principle" — meaningful coincidences that
// reveal the deep grammar of the psyche manifesting in external events.

export const SYNC_CATEGORIES = {
  number: {
    label: 'Numbers & Time',
    emoji: '∞',
    color: '#c9a84c',
    description: 'Repeating numbers, significant times, mathematical coincidences — the universe speaking in its most precise language.',
  },
  animal: {
    label: 'Animals & Nature',
    emoji: '🐾',
    color: '#5aaa70',
    description: 'Animal appearances, natural phenomena — messengers from the instinctual layer of the psyche.',
  },
  person: {
    label: 'People',
    emoji: '⊕',
    color: '#e07090',
    description: 'Unexpected meetings, someone appearing after thinking of them — the psyche projecting into relationship.',
  },
  word: {
    label: 'Words & Messages',
    emoji: '⟡',
    color: '#66cccc',
    description: 'A phrase heard in a song then in conversation, a book falling open to the right page — language as oracle.',
  },
  image: {
    label: 'Images & Symbols',
    emoji: '◎',
    color: '#e09040',
    description: 'A symbol appearing in multiple unrelated contexts — the psyche broadcasting its current constellation.',
  },
  dream: {
    label: 'Dream Echo',
    emoji: '✦',
    color: '#a070e0',
    description: 'A dream image or theme that manifests in waking life — the unconscious pre-viewing external reality.',
  },
  place: {
    label: 'Places',
    emoji: '🏔',
    color: '#7099cc',
    description: 'Arriving somewhere at exactly the right moment — the field of meaning organizing space itself.',
  },
  body: {
    label: 'Body & Health',
    emoji: '⬡',
    color: '#cc6677',
    description: 'Physical sensations or symptoms that coincide with external events — the body as a synchronicity receiver.',
  },
  tech: {
    label: 'Technology',
    emoji: '⟳',
    color: '#44aadd',
    description: 'Devices behaving strangely at charged moments, receiving a message at the exact right time — the digital field mirroring psyche.',
  },
  other: {
    label: 'Other',
    emoji: '✺',
    color: '#8899aa',
    description: 'Meaningful coincidences that don\'t fit neatly into a category — the uncategorizable nature of the acausal.',
  },
}

// Repeating number meanings — angel numbers, sacred numerology
export const NUMBER_MEANINGS = {
  '0':    { label: '0',    meaning: 'Pure potential, the void before creation, the Alpha and Omega. A call to connect with the infinite source.', color: '#cccccc' },
  '1':    { label: '1',    meaning: 'Unity, new beginnings, solo power. You are whole. Trust yourself to begin.', color: '#c9a84c' },
  '11':   { label: '11',   meaning: 'The Awakening Code. A gateway is open between your intentions and reality. Heightened intuition, alignment with higher self. Watch your thoughts.', color: '#ffd040' },
  '22':   { label: '22',   meaning: 'The Master Builder. What you envision can be made real. You have the power to manifest on the material plane.', color: '#c9a84c' },
  '33':   { label: '33',   meaning: 'The Master Teacher. Compassion, healing, service. Your gifts are needed — share them.', color: '#88cc88' },
  '111':  { label: '111',  meaning: 'A manifestation portal. Your thoughts are seeds. The gate between mind and form is thin — choose your focus carefully.', color: '#ffdd44' },
  '222':  { label: '222',  meaning: 'Trust, balance, divine timing. You are exactly where you need to be. Hold the vision; it is taking root.', color: '#88aaff' },
  '333':  { label: '333',  meaning: 'The Trinity activates — mind, body, spirit in alignment. Creative energy is high. Express yourself.', color: '#cc88ff' },
  '444':  { label: '444',  meaning: 'Sacred foundation. You are supported. Angelic or ancestral presence surrounds you. Build with confidence.', color: '#66aacc' },
  '555':  { label: '555',  meaning: 'Radical change is approaching. Surrender resistance. The transformation underway is ultimately in your favor.', color: '#ff9955' },
  '666':  { label: '666',  meaning: 'Rebalance. You may be over-focused on material concerns or lower-frequency thoughts. Return to center and spirit.', color: '#cc5555' },
  '777':  { label: '777',  meaning: 'Mystical alignment. Lucky convergence. Your spiritual path is validated — you are exactly on track.', color: '#aa88ff' },
  '888':  { label: '888',  meaning: 'Infinite abundance, the cosmic figure-eight. Karmic cycles closing in your favor. Financial or energetic abundance approaching.', color: '#c9a84c' },
  '999':  { label: '999',  meaning: 'Completion. A major chapter closes. Something must end for the new to enter. Release with gratitude.', color: '#cc7799' },
  '1010': { label: '1010', meaning: 'Spiritual evolution and divine order. You are supported in your awakening. New cycles begin from a higher level.', color: '#88ccff' },
  '1111': { label: '1111', meaning: 'The Master Gateway. Maximum synchronicity density — the veil between dimensions is thin. A portal of intention and awakening. You are seen.', color: '#ffffff' },
  '1212': { label: '1212', meaning: 'Completion of a spiritual cycle. New Earth energies. Balanced masculine/feminine. You are ready for the next chapter.', color: '#aaddff' },
  '1234': { label: '1234', meaning: 'Sequential steps, life progressing exactly as it should. One thing is leading naturally to the next.', color: '#c9a84c' },
  '2222': { label: '2222', meaning: 'Amplified trust and patience. Divine timing is perfect. Everything is being orchestrated. Breathe.', color: '#88aaff' },
  '3333': { label: '3333', meaning: 'Amplified creative and spiritual alignment. The Ascended Masters walk with you. You are guided.', color: '#cc88ff' },
  '4444': { label: '4444', meaning: 'Amplified angelic support. Immense invisible assistance surrounds your path right now.', color: '#66aacc' },
  '5555': { label: '5555', meaning: 'Maximum change energy. A total transformation of your situation is imminent. Trust the upheaval.', color: '#ff9955' },
  '9999': { label: '9999', meaning: 'The great completion. An entire era of your life is ending. Prepare for a profound rebirth.', color: '#cc7799' },
}

// Detect significant number patterns in text
export function detectNumbers(text) {
  if (!text) return []
  const found = new Set()
  // Match time patterns like 11:11, 3:33 and sequences of repeated digits
  const timePattern = /\b(\d{1,2}):(\d{2})\b/g
  let m
  while ((m = timePattern.exec(text)) !== null) {
    const h = m[1].padStart(2, '0')
    const min = m[2]
    const combined = h + min
    if (NUMBER_MEANINGS[combined]) found.add(combined)
    // Check if digits repeat: 11:11 → 1111
    const stripped = combined.replace(/0/g, '')
    if (new Set(stripped.split('')).size === 1 && combined.length > 1) found.add(combined)
  }
  // Match standalone number sequences
  const numPattern = /\b(\d{2,4})\b/g
  while ((m = numPattern.exec(text)) !== null) {
    const n = m[1]
    if (NUMBER_MEANINGS[n]) found.add(n)
    // Detect repeating digit patterns not in dict
    if (new Set(n.split('')).size === 1) found.add(n)
  }
  return [...found]
}

// Stable pseudo-random position for a star, seeded by entry id
export function starPosition(id, W, H, padding = 0.12) {
  const a = ((id * 1234567891) >>> 0) % 100000
  const b = ((id * 9876543211) >>> 0) % 100000
  const x = padding + (a / 100000) * (1 - 2 * padding)
  const y = padding + (b / 100000) * (1 - 2 * padding)
  return { x: x * W, y: y * H }
}

// Analyze patterns across all synchronicity entries
export function analyzeSyncPatterns(syncs) {
  if (!syncs || syncs.length === 0) return null

  // Category breakdown
  const catCount = {}
  for (const s of syncs) {
    catCount[s.category] = (catCount[s.category] || 0) + 1
  }

  // Dominant category
  const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]

  // Average intensity
  const avgIntensity = syncs.reduce((sum, s) => sum + (s.intensity || 3), 0) / syncs.length

  // Moon phase breakdown
  const moonCount = {}
  for (const s of syncs) {
    if (s.moonPhase) moonCount[s.moonPhase] = (moonCount[s.moonPhase] || 0) + 1
  }
  const peakMoon = Object.entries(moonCount).sort((a, b) => b[1] - a[1])[0]

  // Most frequent numbers
  const numCount = {}
  for (const s of syncs) {
    for (const n of (s.numbers || [])) {
      numCount[n] = (numCount[n] || 0) + 1
    }
  }
  const topNumbers = Object.entries(numCount).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Detect threads: groups of entries that share linked ids or tags
  const threads = buildThreads(syncs)

  // Density: syncs per week over last 4 weeks
  const now = new Date()
  const weeks = [0, 0, 0, 0]
  for (const s of syncs) {
    const d = new Date(s.date)
    const daysAgo = Math.floor((now - d) / 864e5)
    const weekIdx = Math.floor(daysAgo / 7)
    if (weekIdx < 4) weeks[weekIdx]++
  }

  return {
    total: syncs.length,
    catCount,
    topCat: topCat ? topCat[0] : null,
    avgIntensity: Math.round(avgIntensity * 10) / 10,
    peakMoon: peakMoon ? peakMoon[0] : null,
    topNumbers,
    threads,
    weeklyDensity: weeks.reverse(), // oldest → newest
  }
}

// Group synchronicities into threads (chains of linked entries)
export function buildThreads(syncs) {
  const idToSync = Object.fromEntries(syncs.map(s => [s.id, s]))
  const visited = new Set()
  const threads = []

  for (const s of syncs) {
    if (visited.has(s.id) || !s.linked?.length) continue
    // BFS to find the full connected component
    const thread = []
    const queue = [s.id]
    while (queue.length) {
      const id = queue.shift()
      if (visited.has(id) || !idToSync[id]) continue
      visited.add(id)
      thread.push(idToSync[id])
      for (const linkedId of (idToSync[id].linked || [])) {
        if (!visited.has(linkedId)) queue.push(linkedId)
      }
    }
    if (thread.length > 1) threads.push(thread.sort((a, b) => a.date.localeCompare(b.date)))
  }

  return threads.sort((a, b) => b.length - a.length)
}

// Generate a new synchronicity entry
export function createSyncEntry({ title = '', description = '', category = 'other', intensity = 3, tags = [], linked = [] } = {}) {
  const date = new Date().toISOString().slice(0, 10)
  const numbers = detectNumbers(description)
  const moonPhase = getMoonPhaseForSync(date)
  return {
    id: Date.now(),
    date,
    title,
    description,
    category,
    intensity,
    tags,
    numbers,
    linked,
    moonPhase: moonPhase.name,
    moonEmoji: moonPhase.emoji,
  }
}

function getMoonPhaseForSync(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date()
  const ref = new Date('2000-01-06T18:14:00Z')
  const synodicMonth = 29.53058867
  const elapsed = (date - ref) / (1000 * 60 * 60 * 24)
  const phase = ((elapsed % synodicMonth) + synodicMonth) % synodicMonth
  const normalized = phase / synodicMonth
  if (normalized < 0.0625) return { name: 'New Moon', emoji: '🌑' }
  if (normalized < 0.1875) return { name: 'Waxing Crescent', emoji: '🌒' }
  if (normalized < 0.3125) return { name: 'First Quarter', emoji: '🌓' }
  if (normalized < 0.4375) return { name: 'Waxing Gibbous', emoji: '🌔' }
  if (normalized < 0.5625) return { name: 'Full Moon', emoji: '🌕' }
  if (normalized < 0.6875) return { name: 'Waning Gibbous', emoji: '🌖' }
  if (normalized < 0.8125) return { name: 'Last Quarter', emoji: '🌗' }
  return { name: 'Waning Crescent', emoji: '🌘' }
}
