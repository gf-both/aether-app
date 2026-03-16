import { useMemo } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { getTibetanProfile } from '../../engines/tibetanEngine'

const ELEM_COLORS = {
  Fire:  '#e84040',
  Earth: '#d4a017',
  Iron:  '#aabbcc',
  Water: '#4488cc',
  Wood:  '#44aa66',
  Metal: '#aabbcc',
}

const MEWA_COLORS = {
  White:      '#ddeeff',
  Black:      '#8899aa',
  Blue:       '#4488ee',
  Green:      '#44aa66',
  Yellow:     '#e8c040',
  Red:        '#ee4444',
  'Maroon/Red': '#cc3344',
}

const S = {
  panel: {
    width: '100%', height: '100%', overflowY: 'auto', padding: '24px 28px',
    display: 'flex', flexDirection: 'column', gap: 28,
    background: 'var(--card)', color: 'var(--foreground)',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: 'var(--muted-foreground)', paddingBottom: 8,
    borderBottom: '1px solid var(--accent)', marginBottom: 4,
  },
  heading: {
    fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 600, letterSpacing: '.18em',
    color: 'var(--foreground)', marginBottom: 4,
  },
  glass: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 13, padding: 18, backdropFilter: 'blur(12px)',
  },
  interpretation: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--muted-foreground)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'var(--accent)', border: '1px solid var(--border)',
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
    borderRadius: 8, background: 'var(--secondary)', border: '1px solid var(--border)',
  },
  badge: (bg, border, color) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: 12,
    fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.1em',
    textTransform: 'uppercase', background: bg, border: `1px solid ${border}`, color,
  }),
}

export default function TibetanDetail() {
  const primaryProfile = useAboveInsideStore(s => s.primaryProfile)
  const activeViewProfile = useAboveInsideStore(s => s.activeViewProfile)
  const activeProfile = activeViewProfile || primaryProfile

  const profile = useMemo(() => {
    try {
      const dob = activeProfile?.dob || '1981-01-23'
      const [year, month, day] = dob.split('-').map(Number)
      return getTibetanProfile({ day, month, year })
    } catch (e) {
      return null
    }
  }, [activeProfile?.dob])

  if (!profile) return null

  const animalColor = ELEM_COLORS[profile.animalProfile?.element] || 'var(--foreground)'
  const elemColor = ELEM_COLORS[profile.element] || 'var(--foreground)'
  const mewaColor = MEWA_COLORS[profile.mewaMeaning?.color?.split('/')[0]] || '#c9a84c'

  return (
    <div style={S.panel}>
      {/* Header */}
      <div>
        <div style={S.heading}>☸ Tibetan Astrology</div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          Losar calendar · 60-year cycle · Mewa magic square · Elemental year
        </div>
      </div>

      {/* Core identity */}
      <div>
        <div style={S.sectionTitle}>Tibetan Birth Year</div>
        <div style={{ ...S.glass, textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: 26, letterSpacing: '.15em',
            color: 'var(--foreground)', marginBottom: 6,
          }}>
            {profile.fullLabel}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
            Tibetan Year {profile.tibetanYear} · {profile.yinYang} Polarity
          </div>
        </div>
      </div>

      {/* Animal + Element */}
      <div>
        <div style={S.sectionTitle}>Animal & Element</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Animal */}
          <div style={{
            ...S.glass,
            borderColor: `${animalColor}33`,
            background: `${animalColor}0a`,
          }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', color: `${animalColor}99`, textTransform: 'uppercase', marginBottom: 6 }}>Animal</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: animalColor, marginBottom: 8, letterSpacing: '.1em' }}>
              {profile.animal}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
              {profile.animalProfile?.quality}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', marginTop: 6 }}>
              Challenge: {profile.animalProfile?.challenge}
            </div>
          </div>

          {/* Element */}
          <div style={{
            ...S.glass,
            borderColor: `${elemColor}33`,
            background: `${elemColor}0a`,
          }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', color: `${elemColor}99`, textTransform: 'uppercase', marginBottom: 6 }}>Element</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: elemColor, marginBottom: 8, letterSpacing: '.1em' }}>
              {profile.element}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
              Year polarity: <span style={{ color: 'var(--foreground)' }}>{profile.yinYang}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', marginTop: 6 }}>
              60-year Tibetan cycle
            </div>
          </div>
        </div>
      </div>

      {/* Mewa */}
      <div>
        <div style={S.sectionTitle}>Mewa — Magic Square</div>
        <div style={{ ...S.row, gap: 18 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 12, flexShrink: 0,
            background: `${mewaColor}15`, border: `2px solid ${mewaColor}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Cinzel', serif", fontSize: 28, color: mewaColor, fontWeight: 700,
          }}>
            {profile.mewaNumber}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: mewaColor, letterSpacing: '.08em' }}>
                Mewa {profile.mewaNumber} — {profile.mewaMeaning?.color}
              </span>
              <span style={S.badge(`${mewaColor}15`, `${mewaColor}33`, mewaColor)}>
                {profile.mewaMeaning?.element}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
              {profile.mewaMeaning?.meaning}
            </div>
          </div>
        </div>
      </div>

      {/* Reading */}
      <div>
        <div style={S.sectionTitle}>Elemental Reading</div>
        <div style={S.interpretation}>
          Born in a <span style={{ color: elemColor }}>{profile.element}</span> year,
          you carry the qualities of the <span style={{ color: animalColor }}>{profile.animal}</span> — {profile.animalProfile?.quality?.toLowerCase()}.
          The <span style={{ color: 'var(--foreground)' }}>{profile.yinYang}</span> polarity shapes
          how this energy flows in your life. Your Mewa{' '}
          <span style={{ color: mewaColor }}>{profile.mewaNumber} ({profile.mewaMeaning?.color})</span>{' '}
          brings {profile.mewaMeaning?.meaning?.toLowerCase()}, operating as the inner
          magic square governing your life's pattern within the 9-year cycle.
        </div>
      </div>
    </div>
  )
}
