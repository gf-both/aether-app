/**
 * profileUtils.js — shared utilities for profile data resolution
 * Extracted from component bodies to prevent stale closure issues and crashes
 */

/**
 * Resolve lat/lon/timezone from a profile object.
 * Falls back to city-name lookup if coordinates not set.
 */
export function resolvePob(p) {
  if (p?.birthLat && p.birthLat !== 0) {
    return { lat: p.birthLat, lon: p.birthLon || 0, tz: p.birthTimezone ?? 0 }
  }
  const pob = (p?.pob || '').toLowerCase()
  if (pob.includes('buenos aires')) return { lat: -34.6037, lon: -58.3816, tz: -3 }
  if (pob.includes('montevideo'))   return { lat: -34.9011, lon: -56.1645, tz: -3 }
  if (pob.includes('new york'))     return { lat:  40.7128, lon: -74.0060, tz: -5 }
  if (pob.includes('london'))       return { lat:  51.5074, lon:  -0.1278, tz:  0 }
  if (pob.includes('paris'))        return { lat:  48.8566, lon:   2.3522, tz:  1 }
  if (pob.includes('madrid'))       return { lat:  40.4168, lon:  -3.7038, tz:  1 }
  if (pob.includes('bogota'))       return { lat:   4.7110, lon: -74.0721, tz: -5 }
  if (pob.includes('lima'))         return { lat: -12.0464, lon: -77.0428, tz: -5 }
  if (pob.includes('santiago'))     return { lat: -33.4489, lon: -70.6693, tz: -3 }
  if (pob.includes('mexico'))       return { lat:  19.4326, lon: -99.1332, tz: -6 }
  if (pob.includes('sao paulo') || pob.includes('são paulo')) return { lat: -23.5505, lon: -46.6333, tz: -3 }
  if (pob.includes('rio de janeiro') || pob.includes('rio')) return { lat: -22.9068, lon: -43.1729, tz: -3 }
  if (pob.includes('toronto'))      return { lat:  43.6532, lon: -79.3832, tz: -5 }
  if (pob.includes('chicago'))      return { lat:  41.8781, lon: -87.6298, tz: -6 }
  if (pob.includes('los angeles'))  return { lat:  34.0522, lon: -118.2437, tz: -8 }
  if (pob.includes('berlin'))       return { lat:  52.5200, lon:  13.4050, tz:  1 }
  if (pob.includes('amsterdam'))    return { lat:  52.3676, lon:   4.9041, tz:  1 }
  if (pob.includes('rome'))         return { lat:  41.9028, lon:  12.4964, tz:  1 }
  if (pob.includes('moscow'))       return { lat:  55.7558, lon:  37.6173, tz:  3 }
  if (pob.includes('tokyo'))        return { lat:  35.6762, lon: 139.6503, tz:  9 }
  if (pob.includes('beijing'))      return { lat:  39.9042, lon: 116.4074, tz:  8 }
  if (pob.includes('mumbai'))       return { lat:  19.0760, lon:  72.8777, tz:  5.5 }
  if (pob.includes('sydney'))       return { lat: -33.8688, lon: 151.2093, tz: 11 }
  if (pob.includes('tel aviv'))     return { lat:  32.0853, lon:  34.7818, tz:  2 }
  if (pob.includes('cairo'))        return { lat:  30.0444, lon:  31.2357, tz:  2 }
  return { lat: 0, lon: 0, tz: p?.birthTimezone ?? 0 }
}

/**
 * Safely get a value — returns null if '?' or '??' or empty
 */
export function safeVal(v) {
  if (!v || v === '?' || v === '??' || v === '') return null
  return v
}
