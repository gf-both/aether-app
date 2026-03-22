import { supabase } from './supabase'

const SIGN_VISUALS = {
  Aries: { color: 'crimson-gold', energy: 'dynamic fire, fierce upward flames dancing around the figure' },
  Taurus: { color: 'emerald-earth', energy: 'lush solidity, verdant crystalline formations grounding the figure' },
  Gemini: { color: 'silver-air', energy: 'dual light streams, shimmering twin reflections in silver mist' },
  Cancer: { color: 'moonlight silver-blue', energy: 'oceanic mist, lunar tides rippling through the aura' },
  Leo: { color: 'solar gold-amber', energy: 'radiant crown energy, blazing solar corona emanating outward' },
  Virgo: { color: 'crystalline white-green', energy: 'precise sacred geometry, luminous lattice structures' },
  Libra: { color: 'rose-gold', energy: 'aesthetic harmony, symmetrical light fractals in perfect balance' },
  Scorpio: { color: 'obsidian-purple', energy: 'magnetic intensity, deep vortex of violet-black power' },
  Sagittarius: { color: 'indigo-fire', energy: 'vast horizon, arrow of light piercing infinite starfields' },
  Capricorn: { color: 'dark granite-silver', energy: 'mountain structure, ancient stone pillars of authority' },
  Aquarius: { color: 'electric blue-violet', energy: 'starfield and lightning, crackling electric aura' },
  Pisces: { color: 'iridescent aquamarine', energy: 'dissolving ocean mist, bioluminescent depth currents' },
}

const HD_ENERGY = {
  Generator: 'warm steady glow radiating from the core, contained power humming with life force',
  'Manifesting Generator': 'multiple light streams in kinetic motion, rapid energy bursts spiraling outward',
  Projector: 'focused beam of awareness cutting through darkness, a guiding ray of concentrated light',
  Manifestor: 'initiating burst of cosmic force, commanding aura of sovereign authority',
  Reflector: 'mirror-like translucence reflecting all colors, lunar iridescence shifting and shimmering',
}

export function buildCosmicPrompt(profile) {
  const sign = profile.sign || 'Aquarius'
  const hdType = profile.hdType || 'Projector'
  const rising = profile.asc || profile.rising || null

  const sv = SIGN_VISUALS[sign] || SIGN_VISUALS.Aquarius
  const hd = HD_ENERGY[hdType] || HD_ENERGY.Projector

  const sunPart = `Bathed in ${sv.color} light. ${sv.energy}.`
  const hdPart = `Energy quality: ${hd}.`
  const risingPart = rising ? `Presence shaped by ${rising} rising — ${getRisingQuality(rising)}.` : ''

  return `A cosmic portrait of a gender-neutral human figure. ${sunPart} ${hdPart} ${risingPart} Ethereal spiritual art style. Dark cosmic background with subtle star field. Cinematic lighting. No text, no letters. Single figure centered. Highly detailed, painterly.`
}

function getRisingQuality(rising) {
  const qualities = {
    Aries: 'bold angular silhouette, warrior stance',
    Taurus: 'grounded earthy presence, solid and serene',
    Gemini: 'quicksilver outline, playful duality',
    Cancer: 'soft nurturing glow, protective shell',
    Leo: 'regal posture, mane-like radiance',
    Virgo: 'refined precise edges, crystalline clarity',
    Libra: 'graceful symmetry, diplomatic poise',
    Scorpio: 'piercing magnetic gaze, shadowed depth',
    Sagittarius: 'expansive open stance, explorer energy',
    Capricorn: 'commanding upright structure, ancient authority',
    Aquarius: 'futuristic detached aura, electric outline',
    Pisces: 'dreamy dissolving edges, fluid transparency',
  }
  return qualities[rising] || 'subtle ethereal presence'
}

function getCacheHash(profile) {
  const raw = (profile.dob || '') + (profile.hdType || '') + (profile.sign || '')
  return btoa(raw).slice(0, 12)
}

export function getAvatarFromCache(profileId) {
  try {
    const url = localStorage.getItem(`avatar_cosmic_${profileId}`) || localStorage.getItem(`avatar_photo_${profileId}`)
    return url || null
  } catch { return null }
}

export function saveAvatarToCache(profileId, url) {
  try { localStorage.setItem(`avatar_cosmic_${profileId}`, url) } catch {}
}

export async function generateCosmicAvatar(profile) {
  const hash = getCacheHash(profile)
  const cached = getAvatarFromCache(hash)
  if (cached) return { url: cached, prompt: null, cached: true }

  const prompt = buildCosmicPrompt(profile)

  try {
    const { data, error } = await supabase.functions.invoke('image-gen', {
      body: { prompt, image_size: 'square_hd', num_images: 1, num_inference_steps: 4 },
    })
    if (error || !data?.url) return { url: null, prompt, cached: false }
    saveAvatarToCache(hash, data.url)
    return { url: data.url, prompt, cached: false }
  } catch {
    return { url: null, prompt, cached: false }
  }
}

export async function generatePhotoAvatar(photos, profile) {
  const id = profile.id || 'default'
  const cached = localStorage.getItem(`avatar_photo_${id}`)
  if (cached) return { url: cached, cached: true }

  // TODO: IP-Adapter stylization when FAL_API_KEY available
  // For now store the first uploaded photo as avatar
  if (photos?.[0]) {
    try { localStorage.setItem(`avatar_photo_${id}`, photos[0]) } catch {}
    return { url: photos[0], cached: false }
  }
  return { url: null, cached: false }
}
