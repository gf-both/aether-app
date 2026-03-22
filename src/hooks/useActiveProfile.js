import { useMemo } from 'react'
import { useGolemStore } from '../store/useGolemStore'
import { getNatalChart } from '../engines/natalEngine'
import { computeHDChart } from '../engines/hdEngine'
import { getNumerologyProfileFromDob } from '../engines/numerologyEngine'
import { resolvePob } from '../utils/profileUtils'

/**
 * useActiveProfile — always returns the currently active profile.
 * When viewing another person's chart (activeViewProfile), returns that.
 * When viewing your own, returns primaryProfile.
 * Use this hook in ALL components instead of reading store directly.
 */
export function useActiveProfile() {
  return useGolemStore(s => s.activeViewProfile || s.primaryProfile)
}

/**
 * useComputedProfile — like useActiveProfile but auto-computes missing fields
 * (sign, moon, asc, hdType, hdProfile, hdAuth, lifePath) from birth data.
 * Use in any component that needs computed cosmic data.
 */
export function useComputedProfile() {
  const raw = useGolemStore(s => s.activeViewProfile || s.primaryProfile)

  return useMemo(() => {
    if (!raw?.dob) return raw
    const p = { ...raw }

    // Compute natal chart fields if missing
    if (!p.sign || p.sign === '?' || !p.moon || p.moon === '?') {
      try {
        const [y, m, d] = p.dob.split('-').map(Number)
        const [h, min] = (p.tob || '12:00').split(':').map(Number)
        const { lat, lon, tz } = resolvePob(p)
        const chart = getNatalChart({ day: d, month: m, year: y, hour: h || 12, minute: min || 0, lat, lon, timezone: tz })
        if (chart) {
          p.sign = p.sign && p.sign !== '?' ? p.sign : (chart.planets?.sun?.sign || '?')
          p.moon = p.moon && p.moon !== '?' ? p.moon : (chart.planets?.moon?.sign || '?')
          p.asc  = p.asc  && p.asc  !== '?' ? p.asc  : (chart.angles?.asc?.sign || '?')
        }
      } catch {}
    }

    // Compute HD fields if missing
    if (!p.hdType || p.hdType === '?') {
      try {
        const hd = computeHDChart({
          dateOfBirth: p.dob,
          timeOfBirth: p.tob || '12:00',
          utcOffset: p.birthTimezone ?? -3,
        })
        if (hd) {
          p.hdType    = hd.type
          p.hdProfile = hd.profile
          p.hdAuth    = hd.authority
          p.hdDef     = hd.definition
        }
      } catch {}
    }

    // Compute Life Path if missing
    if (!p.lifePath || p.lifePath === '?') {
      try {
        const num = getNumerologyProfileFromDob(p.dob, p.name || 'X', {})
        if (num?.core?.lifePath) p.lifePath = num.core.lifePath.val
      } catch {}
    }

    return p
  }, [raw?.dob, raw?.tob, raw?.birthLat, raw?.birthLon, raw?.birthTimezone,
      raw?.hdType, raw?.lifePath, raw?.sign, raw?.moon, raw?.asc])
}

/**
 * Always returns your own primary profile, regardless of who you're viewing.
 * Use for: Synastry (you are always one side), quiz results that belong to you.
 */
export function usePrimaryProfile() {
  return useGolemStore(s => s.primaryProfile)
}

/**
 * Returns a computed natal chart for the given profile, memoized by birth data.
 * Returns null if profile has no dob.
 */
export function useProfileChart(profile) {
  return useMemo(() => {
    if (!profile?.dob) return null
    try {
      const [y, m, d] = profile.dob.split('-').map(Number)
      const [h, min] = (profile.tob || '12:00').split(':').map(Number)
      return getNatalChart({
        day: d, month: m, year: y,
        hour: h || 12, minute: min || 0,
        lat: profile.birthLat || 0, lon: profile.birthLon || 0,
        timezone: profile.birthTimezone || 0
      })
    } catch { return null }
  }, [profile?.dob, profile?.tob, profile?.birthLat, profile?.birthLon, profile?.birthTimezone])
}
