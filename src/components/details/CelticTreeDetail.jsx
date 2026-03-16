import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { getCelticTreeProfile, CELTIC_TREES } from '../../engines/celticTreeEngine'

const ELEMENT_COLORS = {
  Air:   { main: 'rgba(64,204,221,1)',  bg: 'rgba(64,204,221,.08)',  border: 'rgba(64,204,221,.22)'  },
  Fire:  { main: 'rgba(255,120,60,1)',  bg: 'rgba(255,120,60,.08)',  border: 'rgba(255,120,60,.22)'  },
  Water: { main: 'rgba(80,140,220,1)',  bg: 'rgba(80,140,220,.08)',  border: 'rgba(80,140,220,.22)'  },
  Earth: { main: 'rgba(120,180,80,1)',  bg: 'rgba(120,180,80,.08)',  border: 'rgba(120,180,80,.22)'  },
  All:   { main: 'rgba(201,168,76,1)',  bg: 'var(--accent)',  border: 'rgba(201,168,76,.22)'  },
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
  badge: (bg, border, color) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: 12,
    fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.1em',
    textTransform: 'uppercase', background: bg, border: `1px solid ${border}`, color,
  }),
  keyVal: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '6px 0', borderBottom: '1px solid var(--secondary)',
  },
}

function TreeCard({ tree, label, accent = false }) {
  if (!tree) return null
  const elCol = ELEMENT_COLORS[tree.element] || ELEMENT_COLORS.Air
  const col   = accent
    ? { main: 'rgba(201,168,76,1)', bg: 'var(--secondary)', border: 'rgba(201,168,76,.25)' }
    : { main: elCol.main, bg: elCol.bg, border: elCol.border }

  const fmt = ([m, d]) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${months[m - 1]} ${d}`
  }

  return (
    <div style={{ ...S.glass, background: col.bg, borderColor: col.border }}>
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.25em',
        textTransform: 'uppercase', color: col.main + 'aa', marginBottom: 10,
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 12, flexShrink: 0,
          background: col.bg, border: `2px solid ${col.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
        }}>
          🌿
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: accent ? 20 : 16, color: col.main, letterSpacing: '.12em',
          }}>
            {tree.name}
          </div>
          <div style={{
            fontFamily: "'Inconsolata', monospace", fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2,
          }}>
            Ogham: {tree.ogham}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', marginTop: 4, lineHeight: 1.5 }}>
            {tree.meaning}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={S.badge(elCol.bg, elCol.border, elCol.main)}>{tree.element}</span>
            <span style={S.badge('var(--accent)', 'rgba(201,168,76,.2)', 'var(--muted-foreground)')}>{tree.planet}</span>
            <span style={S.badge('var(--secondary)', 'rgba(255,255,255,.1)', 'var(--muted-foreground)')}>{tree.keyword}</span>
          </div>
          <div style={{
            fontFamily: "'Inconsolata', monospace", fontSize: 10, color: 'var(--muted-foreground)', marginTop: 6,
          }}>
            {fmt(tree.startDate)} — {fmt(tree.endDate)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CelticTreeDetail() {
  const primaryProfile = useAboveInsideStore((s) => s.primaryProfile)
  const activeViewProfile = useAboveInsideStore((s) => s.activeViewProfile)
  const activeProfile = activeViewProfile || primaryProfile

  let profile
  if (activeProfile?.dob) {
    const [y, m, d] = activeProfile.dob.split('-').map(Number)
    profile = getCelticTreeProfile({ day: d, month: m, year: y })
  } else {
    profile = getCelticTreeProfile({ day: 23, month: 1, year: 1981 })
  }

  const { birthTree, currentTree, yearTree } = profile

  const elCol = ELEMENT_COLORS[birthTree?.element] || ELEMENT_COLORS.Air

  const fmt = ([m, d]) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${months[m - 1]} ${d}`
  }

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>🌳 Celtic Tree Calendar</div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          Ogham tree zodiac — 13 lunar months of the Celtic year
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
          <span style={S.badge('var(--accent)', 'rgba(201,168,76,.2)', 'var(--muted-foreground)')}>
            {birthTree?.name} · {birthTree?.ogham}
          </span>
          <span style={S.badge(elCol.bg, elCol.border, elCol.main)}>
            {birthTree?.element} · {birthTree?.planet}
          </span>
        </div>
      </div>

      {/* BIRTH TREE */}
      <div>
        <div style={S.sectionTitle}>Your Birth Tree</div>
        <TreeCard tree={birthTree} label="Birth Tree — Your Ogham Sign" accent />
      </div>

      {/* KEY ATTRIBUTES */}
      <div>
        <div style={S.sectionTitle}>Tree Profile</div>
        <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            ['Tree Name', birthTree?.name],
            ['Ogham Letter', birthTree?.ogham],
            ['Season', `${fmt(birthTree?.startDate || [0,0])} – ${fmt(birthTree?.endDate || [0,0])}`],
            ['Element', birthTree?.element],
            ['Planet', birthTree?.planet],
            ['Keyword', birthTree?.keyword],
            ['Meaning', birthTree?.meaning],
          ].map(([label, val], i) => (
            <div key={i} style={S.keyVal}>
              <span style={{
                fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em',
                textTransform: 'uppercase', color: 'var(--muted-foreground)', minWidth: 120,
              }}>{label}</span>
              <span style={{
                fontFamily: i < 2 ? "'Inconsolata', monospace" : "'Cormorant Garamond', serif",
                fontSize: i === 6 ? 13 : 12,
                color: i === 0 ? 'var(--foreground)' : i === 2 ? elCol.main : 'var(--foreground)',
                fontStyle: i === 6 ? 'italic' : 'normal',
              }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* INTERPRETATION */}
      <div>
        <div style={S.sectionTitle}>Your Tree Reading</div>
        <div style={S.interpretation}>
          Born under the <span style={{ color: 'var(--foreground)' }}>{birthTree?.name}</span> ({birthTree?.ogham}), you carry the essence of{' '}
          <span style={{ color: elCol.main }}>{birthTree?.meaning?.toLowerCase()}</span>. As a child of{' '}
          <span style={{ color: elCol.main }}>{birthTree?.element}</span> and the planet{' '}
          <span style={{ color: 'var(--foreground)' }}>{birthTree?.planet}</span>, your soul's keyword is{' '}
          <span style={{ color: 'var(--foreground)' }}>{birthTree?.keyword}</span>.{' '}
          The {birthTree?.name} stands as a sacred guardian in the Celtic tradition — its Ogham letter,{' '}
          {birthTree?.ogham}, is carved into the ancient standing stones as a living symbol of your lineage.
        </div>
      </div>

      {/* CURRENT & YEAR TREES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={S.sectionTitle}>Current Tree Month</div>
          <TreeCard tree={currentTree} label="Current Season" />
        </div>
        <div>
          <div style={S.sectionTitle}>Year Tree</div>
          <TreeCard tree={yearTree} label="Year Influence" />
        </div>
      </div>

      {/* ALL 13 TREES */}
      <div>
        <div style={S.sectionTitle}>The 13 Sacred Trees</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {CELTIC_TREES.filter(t => t.name !== 'Mistletoe').map((tree, i) => {
            const isActive = tree.name === birthTree?.name
            const ec = ELEMENT_COLORS[tree.element] || ELEMENT_COLORS.Air
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
                borderRadius: 8,
                background: isActive ? 'rgba(201,168,76,.06)' : 'var(--secondary)',
                border: `1px solid ${isActive ? 'rgba(201,168,76,.2)' : 'var(--secondary)'}`,
              }}>
                <span style={{ fontSize: 14 }}>🌿</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontFamily: "'Cinzel', serif", fontSize: 11,
                      color: isActive ? 'var(--foreground)' : 'var(--foreground)',
                      letterSpacing: '.08em',
                    }}>{tree.name}</span>
                    <span style={{
                      fontFamily: "'Inconsolata', monospace", fontSize: 9,
                      color: isActive ? 'var(--muted-foreground)' : 'var(--muted-foreground)',
                    }}>{tree.ogham}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2 }}>
                    {fmt(tree.startDate)} – {fmt(tree.endDate)} · {tree.keyword}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={S.badge(ec.bg, ec.border, ec.main)}>{tree.element}</span>
                </div>
              </div>
            )
          })}
          {/* Mistletoe special */}
          {(() => {
            const mistletoe = CELTIC_TREES.find(t => t.name === 'Mistletoe')
            const isActive  = mistletoe?.name === birthTree?.name
            return (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
                borderRadius: 8, marginTop: 4,
                background: isActive ? 'rgba(201,168,76,.06)' : 'rgba(201,168,76,.02)',
                border: `1px solid ${isActive ? 'rgba(201,168,76,.2)' : 'var(--accent)'}`,
              }}>
                <span style={{ fontSize: 14 }}>🌟</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.08em',
                      color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                    }}>{mistletoe?.name}</span>
                    <span style={{
                      fontFamily: "'Inconsolata', monospace", fontSize: 9, color: 'var(--muted-foreground)',
                    }}>{mistletoe?.ogham}</span>
                    <span style={S.badge('var(--accent)', 'rgba(201,168,76,.2)', 'var(--muted-foreground)')}>Sacred Day</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2 }}>
                    Dec 24 · Winter Solstice threshold · {mistletoe?.keyword}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
