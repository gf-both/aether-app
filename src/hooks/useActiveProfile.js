import { useMemo } from 'react'
import { useGolemStore } from '../store/useGolemStore'
import { getNatalChart } from '../engines/natalEngine'
import { computeHDChart } from '../engines/hdEngine'
import { getNumerologyProfileFromDob } from '../engines/numerologyEngine'
import { resolvePob } from '../utils/profileUtils'

/**
 * computePersonData — pure function, computes sign/moon/asc/hdType/lifePath
 * for any person object that has dob. Safe to call in render or useMemo.
 */
export function computePersonData(raw) {
  if (!raw?.dob) return raw
  const p = { ...raw }

  // Always recompute sign/moon/asc from natal engine — never trust cached values
  // (cached values may be stale from a previous session or wrong computation)
  {
    try {
      const [y, m, d] = p.dob.split('-').map(Number)
      const [h, min] = (p.tob || '12:00').split(':').map(Number)
      const { lat, lon, tz } = resolvePob(p)
      const chart = getNatalChart({ day: d, month: m, year: y, hour: h || 12, minute: min || 0, lat, lon, timezone: tz })
      if (chart) {
        p.sign = chart.planets?.sun?.sign || '?'
        p.moon = chart.planets?.moon?.sign || '?'
        p.asc  = chart.angles?.asc?.sign || '?'
      }
    } catch {}
  }

  // Always recompute HD from engine
  {
    try {
      const hd = computeHDChart({ dateOfBirth: p.dob, timeOfBirth: p.tob || '12:00', utcOffset: p.birthTimezone ?? -3 })
      if (hd) {
        p.hdType    = hd.type
        p.hdProfile = hd.profile
        p.hdAuth    = hd.authority
        p.hdDef     = hd.definition
      }
    } catch {}
  }

  // Always recompute lifePath from engine
  {
    try {
      const num = getNumerologyProfileFromDob(p.dob, p.name || 'X', {})
      if (num?.core?.lifePath) p.lifePath = num.core.lifePath.val
    } catch {}
  }

  return p
}

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
 * useComputedProfile — like useActiveProfile but ALWAYS recomputes all fields
 * (sign, moon, asc, hdType, hdProfile, hdAuth, lifePath) from birth data.
 * Delegates to computePersonData() — the single source of truth for all engines.
 * Use in any component that needs computed cosmic data.
 */
export function useComputedProfile() {
  const raw = useGolemStore(s => s.activeViewProfile || s.primaryProfile)
  return useMemo(() => computePersonData(raw),
    [raw?.dob, raw?.tob, raw?.birthLat, raw?.birthLon, raw?.birthTimezone,
     raw?.name, raw?.pob, raw?.birthCity])
}

/**
 * Always returns your own primary profile, regardless of who you're viewing.
 * Use for: Synastry (you are always one side), quiz results that belong to you.
 */
export function usePrimaryProfile() {
  return useGolemStore(s => s.primaryProfile)
}

/**
 * useComputedPeople — returns the people array with computed fields (sign/moon/asc/hdType/lifePath)
 * filled in from each person's birth data, same as useComputedProfile does for primary.
 */
export function useComputedPeople() {
  const people = useGolemStore(s => s.people)
  return useMemo(
    () => (people || []).map(computePersonData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [people]
  )
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
