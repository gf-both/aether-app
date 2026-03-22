import { useState, useEffect } from 'react'
import { getAvatarFromCache, generateCosmicAvatar } from '../../lib/avatarEngine'

const SIGN_COLORS = {
  Aries: '220,50,50',
  Taurus: '50,180,80',
  Gemini: '180,190,210',
  Cancer: '140,170,220',
  Leo: '230,180,40',
  Virgo: '160,210,170',
  Libra: '210,170,140',
  Scorpio: '120,40,160',
  Sagittarius: '80,60,200',
  Capricorn: '100,100,120',
  Aquarius: '60,120,230',
  Pisces: '100,200,200',
}

const SIGN_EMOJI = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
}

const SIZES = { sm: 32, md: 64, lg: 128, xl: 256 }

export default function GolemAvatar({ profile, size = 'md', mode = 'auto', showGenerate, onGenerated, style }) {
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(false)
  const [hovered, setHovered] = useState(false)

  const px = SIZES[size] || SIZES.md
  const sign = profile?.sign || null
  const color = SIGN_COLORS[sign] || '201,168,76'

  useEffect(() => {
    if (!profile) return
    const cached = getAvatarFromCache(profile.id || 'default')
    if (cached) setAvatarUrl(cached)
  }, [profile?.id, profile?.sign])

  async function handleGenerate() {
    if (generating) return
    setGenerating(true)
    setError(false)
    try {
      const result = await generateCosmicAvatar(profile)
      if (result?.url) {
        setAvatarUrl(result.url)
        onGenerated?.(result)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    }
    setGenerating(false)
  }

  const glowIntensity = hovered ? 0.5 : 0.25
  const scale = hovered ? 'scale(1.05)' : 'scale(1)'

  // No DOB — show emoji fallback
  if (!profile?.dob) {
    return (
      <div style={{ width: px, height: px, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,168,76,.15), rgba(120,80,200,.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: px * 0.4, flexShrink: 0, ...style }}>
        {profile?.emoji || '✦'}
      </div>
    )
  }

  // Has avatar URL — show image
  if (avatarUrl && !error) {
    return (
      <div style={{ position: 'relative', flexShrink: 0, ...style }}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <div style={{
          width: px, height: px, borderRadius: '50%', overflow: 'hidden',
          boxShadow: `0 0 ${px * 0.3}px rgba(${color},${glowIntensity})`,
          border: `2px solid rgba(${color},0.4)`,
          transition: 'all .2s', transform: scale,
        }}>
          <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => { setError(true); setAvatarUrl(null) }} />
        </div>
      </div>
    )
  }

  // Generating state
  if (generating) {
    return (
      <div style={{ width: px, height: px, borderRadius: '50%', background: `radial-gradient(circle, rgba(${color},.2), rgba(${color},.05))`, border: `2px solid rgba(${color},0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: 'golem-avatar-pulse 1.5s ease-in-out infinite', ...style }}>
        <style>{`@keyframes golem-avatar-pulse { 0%,100% { opacity:.6; transform:scale(1) } 50% { opacity:1; transform:scale(1.04) } }`}</style>
        <span style={{ fontSize: px * 0.25, opacity: 0.7 }}>✦</span>
      </div>
    )
  }

  // Has DOB but no avatar — show sign + glow + optional generate
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, ...style }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{
        width: px, height: px, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${color},.2), rgba(${color},.05))`,
        border: `2px solid rgba(${color},0.3)`,
        boxShadow: `0 0 ${px * 0.25}px rgba(${color},${glowIntensity})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: px * 0.4, transition: 'all .2s', transform: scale,
      }}>
        {SIGN_EMOJI[sign] || profile?.emoji || '✦'}
      </div>
      {showGenerate && (
        <button onClick={handleGenerate} style={{
          padding: '3px 10px', borderRadius: 10, fontSize: 9, cursor: 'pointer',
          background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.25)',
          color: 'var(--gold)', fontFamily: "'Cinzel',serif", letterSpacing: '.06em',
        }}>
          Generate ✦
        </button>
      )}
    </div>
  )
}
