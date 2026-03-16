import { useEffect, useRef, useState } from 'react'

/**
 * PlaceAutocomplete — birth city input with Google Places Autocomplete
 *
 * Props:
 * - value: string (current city name)
 * - onChange: function({ city, lat, lon, timezone }) — called when a place is selected
 * - placeholder: string
 * - className: string
 * - style: object
 */
export default function PlaceAutocomplete({ value, onChange, placeholder = 'City, Country', className, style }) {
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const [inputValue, setInputValue] = useState(value || '')

  const hasApiKey =
    !!import.meta.env.VITE_GOOGLE_PLACES_API_KEY &&
    !import.meta.env.VITE_GOOGLE_PLACES_API_KEY.includes('placeholder')

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  useEffect(() => {
    if (!hasApiKey) return

    if (!window.google?.maps?.places) {
      const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => initAutocomplete()
      document.head.appendChild(script)
    } else {
      initAutocomplete()
    }

    function initAutocomplete() {
      if (!inputRef.current || !window.google?.maps?.places) return

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'],
        fields: ['name', 'geometry', 'address_components', 'formatted_address', 'utc_offset_minutes'],
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (!place.geometry) return

        const lat = place.geometry.location.lat()
        const lon = place.geometry.location.lng()
        const timezone = place.utc_offset_minutes != null
          ? place.utc_offset_minutes / 60
          : 0

        const city = place.name || place.formatted_address || inputRef.current.value

        setInputValue(city)
        onChange?.({ city, lat, lon, timezone })
      })

      autocompleteRef.current = autocomplete
    }

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [hasApiKey])

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        placeholder={hasApiKey ? placeholder : placeholder}
        className={className}
        style={style}
        autoComplete="off"
        title={hasApiKey ? '🔍 Autocomplete enabled' : 'Type city manually (no API key set)'}
      />
      {hasApiKey && (
        <span style={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 10,
          opacity: 0.4,
          pointerEvents: 'none',
          userSelect: 'none',
        }}>🔍</span>
      )}
    </div>
  )
}
