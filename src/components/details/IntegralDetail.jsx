import { useActiveProfile } from '../../hooks/useActiveProfile'
import IntegralFigure from '../canvas/IntegralFigure'

const ZONES = [
  {
    id: 'crown', label: 'Crown Center', icon: '\u2727', color: 'var(--violet2)',
    colBase: 'rgba(144,80,224,',
    systems: [
      { framework: 'Kabbalah', value: 'Kether (Crown)', desc: 'The source of divine will, connection to transcendent awareness and the origin point of consciousness.' },
      { framework: 'Numerology', value: null, desc: 'Your Life Path number reveals the overarching theme and purpose of your incarnation.' },
      { framework: 'Chakra', value: 'Sahasrara', desc: 'Thousand-petaled lotus. Connection to cosmic consciousness and the infinite.' },
    ],
  },
  {
    id: 'third', label: 'Third Eye Center', icon: '\u25CE', color: 'var(--muted-foreground)',
    colBase: 'rgba(100,120,220,',
    systems: [
      { framework: 'Enneagram', value: null, desc: 'Your core personality type reveals how you perceive and interact with reality at the deepest level.' },
      { framework: 'MBTI', value: null, desc: 'Your cognitive function stack determines how you process information and make decisions.' },
      { framework: 'Chakra', value: 'Ajna', desc: 'Command center. Intuition, insight, and the capacity to see beyond the veil of illusion.' },
    ],
  },
  {
    id: 'throat', label: 'Throat Center', icon: '\u25C8', color: 'var(--aqua2)',
    colBase: 'rgba(64,204,221,',
    systems: [
      { framework: 'Astrology', value: null, desc: 'Mercury governs communication, thought patterns, and how you process and share information.' },
      { framework: 'Human Design', value: null, desc: 'Your Authority determines how you make correct decisions aligned with your true nature.' },
      { framework: 'Chakra', value: 'Vishuddha', desc: 'Purification. Authentic self-expression, truth-speaking, and creative manifestation through word.' },
    ],
  },
  {
    id: 'heart', label: 'Heart Center', icon: '\u2609', color: 'var(--foreground)',
    colBase: 'rgba(201,168,76,',
    systems: [
      { framework: 'Astrology', value: null, desc: 'Your Sun sign represents your core identity, life force, and the central organizing principle of your psyche.' },
      { framework: 'Kabbalah', value: 'Tiphareth (Beauty)', desc: 'The heart of the Tree of Life. The integrator of all opposites -- beauty born from balance.' },
      { framework: 'Gene Keys', value: null, desc: 'Your Purpose sphere reveals the highest expression of your creative genius when fully awakened.' },
    ],
  },
  {
    id: 'solar', label: 'Solar Plexus Center', icon: '\u2642', color: 'var(--foreground)',
    colBase: 'rgba(240,192,64,',
    systems: [
      { framework: 'Human Design', value: null, desc: 'Your Definition type reveals how energy flows through your bodygraph and how you process experience.' },
      { framework: 'Human Design', value: null, desc: 'Your Profile describes the costume you wear and the role you play in the grand theater of life.' },
      { framework: 'Chakra', value: 'Manipura', desc: 'Lustrous gem. Personal power, will, determination, and the fire of transformation.' },
    ],
  },
  {
    id: 'sacral', label: 'Sacral Center', icon: '\u263D', color: 'var(--rose2)',
    colBase: 'rgba(238,102,68,',
    systems: [
      { framework: 'Astrology', value: null, desc: 'Your Moon sign reveals your emotional nature, instinctive reactions, and the subconscious patterns that drive you.' },
      { framework: 'Human Design', value: null, desc: 'Your Type is the most fundamental aspect of your design -- it determines your aura and life strategy.' },
      { framework: 'Mayan', value: null, desc: 'Your Mayan Kin represents your galactic signature and cosmic mission in this incarnation.' },
    ],
  },
  {
    id: 'root', label: 'Root Center', icon: '\u2644', color: 'var(--rose)',
    colBase: 'rgba(212,48,112,',
    systems: [
      { framework: 'Astrology', value: null, desc: 'Your Ascendant (Rising sign) is the mask you wear, your physical appearance, and how the world first perceives you.' },
      { framework: 'Kabbalah', value: 'Malkuth (Kingdom)', desc: 'The physical realm and embodied presence. Grounded manifestation -- bringing the spiritual into matter.' },
      { framework: 'Chinese', value: null, desc: 'Your Chinese zodiac animal reveals deep ancestral patterns, yearly rhythms, and earthly nature.' },
    ],
  },
]

/* ---- shared styles ---- */
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
  subHeading: {
    fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, letterSpacing: '.15em',
    textTransform: 'uppercase', color: 'var(--foreground)', marginBottom: 8,
  },
  mono: {
    fontFamily: "'Inconsolata', monospace", fontSize: 12, fontWeight: 500, color: 'var(--foreground)',
  },
  monoSm: {
    fontFamily: "'Inconsolata', monospace", fontSize: 11, color: 'var(--muted-foreground)',
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
    borderRadius: 8, background: 'var(--secondary)',
    border: '1px solid var(--border)', transition: 'background .2s',
  },
  glass: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 13, padding: 18, backdropFilter: 'blur(12px)',
  },
  badge: (bg, border, color) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: 12,
    fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.1em',
    textTransform: 'uppercase', background: bg, border: `1px solid ${border}`, color,
  }),
  interpretation: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--muted-foreground)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'var(--accent)', border: '1px solid var(--border)',
  },
}

export default function IntegralDetail() {
  const profile = useActiveProfile()

  // Fill in dynamic values
  const filledZones = ZONES.map(z => {
    const systems = z.systems.map(sys => {
      let value = sys.value
      switch (z.id) {
        case 'crown':
          if (sys.framework === 'Numerology') value = `Life Path ${profile.lifePath || '?'}`
          break
        case 'third':
          if (sys.framework === 'Enneagram') value = 'Type ? (take quiz)'
          if (sys.framework === 'MBTI') value = profile.mbtiType || 'Not determined'
          break
        case 'throat':
          if (sys.framework === 'Astrology') value = `Mercury in ${profile.sign || '?'}`
          if (sys.framework === 'Human Design') value = `${profile.hdAuth || '?'} Authority`
          break
        case 'heart':
          if (sys.framework === 'Astrology') value = `Sun in ${profile.sign || '?'}`
          if (sys.framework === 'Gene Keys') value = `Key ${profile.crossGK?.split('|')[0]?.split('/')[0] || '?'}`
          break
        case 'solar':
          if (sys.framework === 'Human Design' && sys.desc.includes('Definition')) value = `${profile.hdDef || '?'} Definition`
          if (sys.framework === 'Human Design' && sys.desc.includes('Profile')) value = `Profile ${profile.hdProfile || '?'}`
          break
        case 'sacral':
          if (sys.framework === 'Astrology') value = `Moon in ${profile.moon || '?'}`
          if (sys.framework === 'Human Design') value = `${profile.hdType || '?'}`
          if (sys.framework === 'Mayan') value = 'Galactic Kin'
          break
        case 'root':
          if (sys.framework === 'Astrology') value = `${profile.asc || '?'} Rising`
          if (sys.framework === 'Chinese') value = 'Metal Rooster'
          break
      }
      return { ...sys, value: value || sys.value }
    })
    return { ...z, systems }
  })

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>{'\u25CE'} Integral Consciousness Map</div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          A diagnostic scan of your consciousness -- all systems unified through the body
        </div>
      </div>

      {/* INTERACTIVE FIGURE */}
      <div>
        <div style={S.sectionTitle}>Consciousness Body Map</div>
        <div style={{
          ...S.glass, padding: 0, overflow: 'hidden',
          height: 500, position: 'relative',
        }}>
          <IntegralFigure />
        </div>
      </div>

      {/* CONSCIOUSNESS ZONES */}
      <div>
        <div style={S.sectionTitle}>Energy Centers &amp; System Integration</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filledZones.map((z) => (
            <div key={z.id} style={{
              ...S.glass,
              borderColor: z.colBase + '.15)',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20, color: z.color }}>{z.icon}</span>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 600,
                  letterSpacing: '.1em', color: z.color,
                }}>{z.label}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {z.systems.map((sys, si) => (
                  <div key={si} style={{
                    ...S.row,
                    flexDirection: 'column', alignItems: 'stretch', gap: 4,
                    padding: '10px 14px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={S.badge(
                        z.colBase + '.08)', z.colBase + '.2)', z.color,
                      )}>{sys.framework}</span>
                      <span style={{
                        ...S.mono, color: z.color, fontSize: 13,
                      }}>{sys.value}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.5 }}>
                      {sys.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INTEGRATION ANALYSIS */}
      <div>
        <div style={S.sectionTitle}>Integration Analysis</div>
        <div style={S.interpretation}>
          Your Integral Consciousness Map reveals a <span style={{ color: 'var(--foreground)' }}>strongly activated central channel</span> --
          the crown-to-root spine of awareness is fully lit, indicating a soul path focused on
          embodied integration. The <span style={{ color: 'var(--aqua2)' }}>{profile.hdType || '?'} strategy</span> operates
          through the throat center, while your <span style={{ color: 'var(--violet2)' }}>Life Path {profile.lifePath || '?'}</span> provides
          the crown directive. The heart center, ruled by your <span style={{ color: 'var(--foreground)' }}>{profile.sign || '?'} Sun</span> and
          aligned with Tiphareth, is the great integrator -- all systems converge here.
          Your <span style={{ color: 'var(--rose2)' }}>{profile.moon || '?'} Moon</span> anchors the sacral center,
          giving emotional depth to the {profile.hdDef || '?'} definition pattern of your bodygraph.
          The task is not to master each system separately, but to feel how they all describe
          <span style={{ color: 'var(--foreground)' }}> one unified field of consciousness</span> -- yours.
        </div>
      </div>
    </div>
  )
}
