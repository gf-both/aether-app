import { useMemo } from 'react'
import { useAboveInsideStore } from '../store/useAboveInsideStore'
import { getNatalChart } from '../engines/natalEngine'

/**
 * useActiveProfile — always returns the currently active profile.
 * When viewing another person's chart (activeViewProfile), returns that.
 * When viewing your own, returns primaryProfile.
 * Use this hook in ALL components instead of reading store directly.
 */
export function useActiveProfile() {
  return useAboveInsideStore(s => s.activeViewProfile || s.primaryProfile)
}

/**
 * Always returns your own primary profile, regardless of who you're viewing.
 * Use for: Synastry (you are always one side), quiz results that belong to you.
 */
export function usePrimaryProfile() {
  return useAboveInsideStore(s => s.primaryProfile)
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
