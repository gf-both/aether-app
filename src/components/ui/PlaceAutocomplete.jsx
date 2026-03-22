import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * PlaceAutocomplete — birth city input using Google Places API (New)
 * Uses REST autocomplete + place details (no legacy JS library needed)
 *
 * Props:
 * - value: string (current city name)
 * - onChange: function({ city, lat, lon, timezone }) — called when a place is selected
 * - placeholder: string
 * - className: string
 * - style: object
 */
export default function PlaceAutocomplete({ value, onChange, placeholder = 'City, Country', className, style }) {
  const [inputValue, setInputValue] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const sessionToken = useRef(crypto.randomUUID())

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || import.meta.env.VITE_GOOGLE_PLACES_API_KEY
  const hasApiKey = !!API_KEY

  useEffect(() => { setInputValue(value || '') }, [value])

  const fetchSuggestions = useCallback(async (input) => {
    if (!input || input.length < 2 || !hasApiKey) { setSuggestions([]); return }
    setLoading(true)
    try {
      const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
        },
        body: JSON.stringify({
          input,
          includedPrimaryTypes: ['locality', 'administrative_area_level_1'],
          sessionToken: sessionToken.current,
        }),
      })
      const data = await res.json()
      setSuggestions(data.suggestions || [])
    } catch { setSuggestions([]) }
    finally { setLoading(false) }
  }, [API_KEY, hasApiKey])

  function handleInput(e) {
    const v = e.target.value
    setInputValue(v)
    setShowDropdown(true)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 280)
  }

  async function selectPlace(suggestion) {
    const pred = suggestion.placePrediction
    const text = pred?.text?.text || ''
    setInputValue(text)
    setShowDropdown(false)
    setSuggestions([])

    if (!pred?.placeId) { onChange?.({ city: text, lat: 0, lon: 0, timezone: 0 }); return }

    // Fetch place details for lat/lon + timezone
    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${pred.placeId}?fields=displayName,location,utcOffsetMinutes`,
        { headers: { 'X-Goog-Api-Key': API_KEY, 'X-Goog-FieldMask': 'displayName,location,utcOffsetMinutes' } }
      )
      const place = await res.json()
      const lat = place.location?.latitude || 0
      const lon = place.location?.longitude || 0
      const timezone = place.utcOffsetMinutes != null ? place.utcOffsetMinutes / 60 : 0
      const city = place.displayName?.text || text

      // Refresh session token after selection (billing optimization)
      sessionToken.current = crypto.randomUUID()

      onChange?.({ city, lat, lon, timezone })
    } catch {
      onChange?.({ city: text, lat: 0, lon: 0, timezone: 0 })
    }
  }

  function handleBlur() {
    // Delay to allow click on suggestion
    setTimeout(() => setShowDropdown(false), 180)
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        value={inputValue}
        onChange={handleInput}
        onFocus={() => inputValue.length > 1 && setShowDropdown(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        style={style}
        autoComplete="off"
        spellCheck={false}
      />

      {/* Loading indicator */}
      {loading && (
        <span style={{
          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          fontSize: 10, opacity: 0.4, pointerEvents: 'none',
        }}>⏳</span>
      )}

      {/* Suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'var(--card, #1a1a2e)',
          border: '1px solid var(--border, rgba(255,255,255,0.1))',
          borderRadius: 8,
          marginTop: 4,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {suggestions.map((s, i) => {
            const pred = s.placePrediction
            const main = pred?.structuredFormat?.mainText?.text || pred?.text?.text || ''
            const secondary = pred?.structuredFormat?.secondaryText?.text || ''
            return (
              <div
                key={i}
                onMouseDown={() => selectPlace(s)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: i < suggestions.length - 1 ? '1px solid var(--border, rgba(255,255,255,0.05))' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 13, color: 'var(--foreground, #fff)' }}>{main}</span>
                {secondary && (
                  <span style={{ fontSize: 11, color: 'var(--muted-foreground, rgba(255,255,255,0.5))', marginLeft: 6 }}>
                    {secondary}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
