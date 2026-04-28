import { useMemo } from 'react'
import { useGolemStore } from '../../store/useGolemStore'
import { computePersonData } from '../../hooks/useActiveProfile'
import { REL_CONFIG } from '../../data/primaryProfile'
import { isRomantic, romanticFramework, familyFramework, computeSynastryFramework, BOND_STYLES } from '../../data/synastryFrameworks'
import { getSynastryReport, getBirthParams } from '../../engines/synastryEngine'
import { getGeneKeysProfile, GENE_KEYS_DATA } from '../../engines/geneKeysEngine'
import { getNumerologyProfileFromDob } from '../../engines/numerologyEngine'
import { getKabbalahProfile, profileToKabArgs } from '../../engines/kabbalahEngine'
import SynastryWheel from '../canvas/SynastryWheel'
import ScoreRow from '../ui/ScoreRow'

const HIGHLIGHT_TERMS = /\b(Venus|Mars|Moon|North Node|Pluto|Saturn|Chiron|Soul Contract|shadow integration|Sacred Partnership|Life Path \S+|Sephirah \S+|wisdom transmission|frequency of Anticipation|ego to beauty|mirror each other's gifts|Sibling Circuit of Perseverance)\b/

function highlightTerms(text) {
  const parts = text.split(HIGHLIGHT_TERMS)
  return parts.map((part, i) =>
    HIGHLIGHT_TERMS.test(part)
      ? <span key={i}>{part}</span>
      : part
  )
}

function getProfile(id, primaryProfile, people) {
  if (id === null) return primaryProfile
  return people.find((p) => p.id === id) || primaryProfile
}

function SelectorChips({ slot, currentId, primaryProfile, people, onSelect }) {
  return (
    <div className="pp-select-row">
      <div
        className={`psel-chip${currentId === null ? ' sel' : ''}`}
        onClick={() => onSelect(slot, null)}
      >
        {primaryProfile.name.split(' ')[0]}
      </div>
      {people.map((p) => (
        <div
          key={p.id}
          className={`psel-chip${currentId === p.id ? ' sel' : ''}`}
          onClick={() => onSelect(slot, p.id)}
        >
          {p.name.split(' ')[0]}
        </div>
      ))}
    </div>
  )
}

function ScoreSection({ headerLabel, headerColor, scores, insight, aName, bName }) {
  return (
    <div className="score-section">
      <div style={{ fontFamily: 'inherit', fontSize: '8px', letterSpacing: '.15em', color: headerColor, marginBottom: '4px' }}>
        {headerLabel}
      </div>
      {scores.map((s, i) => (
        <ScoreRow key={i} label={s.label} val={s.pct ? `${s.pct}%` : s.val} gradient={s.gradient} />
      ))}
      {insight && (
        <div className="score-insight">
          {highlightTerms(insight(aName, bName))}
        </div>
      )}
    </div>
  )
}

function CompositeGrid({ items }) {
  return (
    <div className="composite-grid">
      {items.map((item, i) => (
        <div key={i} className="comp-item">
          <div className="comp-icon">{item.icon}</div>
          <div className="comp-title">{item.title}</div>
          <div className="comp-val">{item.val}</div>
          <div className="comp-sub">{item.sub}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Bond Type Badge ──────────────────────────────────────────────────────────
function BondBadge({ bondType }) {
  if (!bondType) return null
  const style = BOND_STYLES[bondType.key] || BOND_STYLES.meaningful
  return (
    <div style={{
      gridColumn: '1/4', padding: '18px 20px', borderRadius: 12,
      background: style.bg, border: `1px solid ${style.border}`,
      boxShadow: `0 0 24px ${style.glow}`,
      display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4,
    }}>
      <div style={{ fontSize: 32 }}>{bondType.emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 600,
          letterSpacing: '.12em', textTransform: 'uppercase', color: bondType.color,
          marginBottom: 4,
        }}>
          {bondType.label} Bond
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 13, lineHeight: 1.6,
          color: 'var(--muted-foreground)',
        }}>
          {bondType.desc}
        </div>
      </div>
      {bondType.exactAspects > 0 && (
        <div style={{
          padding: '4px 10px', borderRadius: 8,
          background: 'rgba(240,192,64,.08)', border: '1px solid rgba(240,192,64,.15)',
          fontFamily: "'Inconsolata',monospace", fontSize: 10, color: '#f0c040',
          whiteSpace: 'nowrap',
        }}>
          {bondType.exactAspects} exact aspect{bondType.exactAspects > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

// ─── Relationship Themes ──────────────────────────────────────────────────────
function ThemesSection({ themes }) {
  if (!themes || themes.length === 0) return null
  return (
    <div style={{
      gridColumn: '1/4', display: 'flex', gap: 10, marginBottom: 4,
    }}>
      {themes.map((theme, i) => (
        <div key={i} style={{
          flex: 1, padding: '14px 16px', borderRadius: 10,
          background: 'rgba(201,168,76,.03)', border: '1px solid rgba(201,168,76,.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>{theme.icon}</span>
            <span style={{
              fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.15em',
              textTransform: 'uppercase', color: 'var(--foreground)', opacity: .8,
            }}>{theme.label}</span>
            <span style={{
              marginLeft: 'auto', fontFamily: "'Inconsolata',monospace",
              fontSize: 10, color: 'var(--muted-foreground)',
            }}>{theme.strength}%</span>
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond',serif", fontSize: 12, lineHeight: 1.6,
            color: 'var(--muted-foreground)',
          }}>
            {theme.desc}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Narrative Prose Block ────────────────────────────────────────────────────
function NarrativeBlock({ title, icon, text, color }) {
  if (!text) return null
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 10,
      background: 'rgba(201,168,76,.02)', border: '1px solid rgba(201,168,76,.06)',
      marginBottom: 6,
    }}>
      <div style={{
        fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.18em',
        textTransform: 'uppercase', color: color || 'rgba(201,168,76,.5)',
        marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {icon && <span style={{ fontSize: 12 }}>{icon}</span>}
        {title}
      </div>
      <div style={{
        fontFamily: "'Cormorant Garamond',serif", fontSize: 13, lineHeight: 1.7,
        color: 'var(--muted-foreground)',
      }}>
        {text}
      </div>
    </div>
  )
}

// ─── Growth Edges Section ─────────────────────────────────────────────────────
function GrowthEdgesSection({ edges }) {
  if (!edges || edges.length === 0) return null
  return (
    <div style={{
      gridColumn: '1/4', padding: '16px 18px', borderRadius: 10,
      background: 'rgba(212,64,112,.03)', border: '1px solid rgba(212,64,112,.08)',
      marginTop: 4,
    }}>
      <div style={{
        fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.2em',
        textTransform: 'uppercase', color: 'rgba(212,64,112,.6)',
        marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ fontSize: 12 }}>🗡️</span> Growth Edges
      </div>
      {edges.map((edge, i) => (
        <div key={i} style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 12.5, lineHeight: 1.7,
          color: 'var(--muted-foreground)', marginBottom: i < edges.length - 1 ? 10 : 0,
          paddingLeft: 12, borderLeft: '2px solid rgba(212,64,112,.15)',
        }}>
          {edge}
        </div>
      ))}
    </div>
  )
}

// ─── Timing Windows Section ──────────────────────────────────────────────────
function TimingSection({ timing }) {
  if (!timing || timing.length === 0) return null
  const typeColors = {
    activation: '#f0c040', romance: '#d43070', transformation: '#9050e0',
    challenge: '#e8a040', growth: '#40ccdd',
  }
  return (
    <div style={{
      gridColumn: '1/4', padding: '16px 18px', borderRadius: 10,
      background: 'rgba(64,204,221,.03)', border: '1px solid rgba(64,204,221,.08)',
      marginTop: 4,
    }}>
      <div style={{
        fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.2em',
        textTransform: 'uppercase', color: 'rgba(64,204,221,.6)',
        marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ fontSize: 12 }}>⏳</span> Bond Timing Windows
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {timing.map((win, i) => (
          <div key={i} style={{
            padding: '12px 14px', borderRadius: 8,
            background: (typeColors[win.type] || '#999') + '06',
            border: '1px solid ' + (typeColors[win.type] || '#999') + '18',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>{win.icon}</span>
              <span style={{
                fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: '.12em',
                textTransform: 'uppercase', color: typeColors[win.type] || '#999',
              }}>{win.label}</span>
            </div>
            <div style={{
              fontFamily: "'Inconsolata',monospace", fontSize: 11, color: 'var(--foreground)',
              marginBottom: 6, opacity: .8,
            }}>{win.period}</div>
            <div style={{
              fontFamily: "'Cormorant Garamond',serif", fontSize: 11.5, lineHeight: 1.6,
              color: 'var(--muted-foreground)',
            }}>{win.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SynSummary({ a, b, aName, bName, report }) {
  if (!report) return null
  const overall = report.overall || 50
  const SIGN_EL = { Aries:'fire', Taurus:'earth', Gemini:'air', Cancer:'water', Leo:'fire', Virgo:'earth', Libra:'air', Scorpio:'water', Sagittarius:'fire', Capricorn:'earth', Aquarius:'air', Pisces:'water' }
  const elA = a.sign && SIGN_EL[a.sign], elB = b.sign && SIGN_EL[b.sign]
  const hdA = a.hdType && a.hdType !== '?' ? a.hdType : null
  const hdB = b.hdType && b.hdType !== '?' ? b.hdType : null
  const level = overall >= 80 ? 'Exceptional' : overall >= 65 ? 'Strong' : overall >= 50 ? 'Moderate' : 'Challenging'
  const levelColor = overall >= 80 ? '#60b030' : overall >= 65 ? '#c9a84c' : overall >= 50 ? '#e8a040' : '#d44070'

  return (
    <div style={{ gridColumn: '1/4', padding: '14px 16px', borderRadius: 8, background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.1)', marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,.5)' }}>Synthesis</span>
        <span style={{ fontSize: 18, fontWeight: 300, fontFamily: "'Inconsolata',monospace", color: levelColor }}>{overall}%</span>
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--muted-foreground)', fontFamily: "'Cormorant Garamond',serif" }}>
        <strong style={{ color: levelColor }}>{level} compatibility</strong> between {aName} and {bName}.
        {a.sign && b.sign ? ` ${a.sign} and ${b.sign} ${elA === elB ? `share ${elA} energy — instant recognition and shared language` : (elA==='fire'&&elB==='air')||(elA==='air'&&elB==='fire') ? 'create a dynamic of ideas and action — air feeds fire' : (elA==='earth'&&elB==='water')||(elA==='water'&&elB==='earth') ? 'nourish each other — emotion meets form' : `bring ${elA} and ${elB} into contact — productive tension that drives growth`}.` : ''}
        {hdA && hdB ? ` ${hdA}/${hdB} ${hdA===hdB ? 'mirror — same operating system, different expression' : 'complement — different strategies create a complete circuit'}.` : ''}
        {report.categories ? ` Strongest area: ${Object.entries(report.categories).sort((x,y) => y[1]-x[1])[0]?.[0] || 'overall harmony'}.` : ''}
        {` ${overall >= 65 ? 'The foundational compatibility is strong — the work is in navigating the growth edges.' : 'The challenge is real but so is the potential for transformation — this dynamic won\'t let either person stay comfortable.'}`}
      </div>
    </div>
  )
}

/* ─── Composite Systems Section ─────────────────────────────────────────────── */
// Shows side-by-side comparisons for Gene Keys, Numerology, and Kabbalah
const compStyle = {
  card: { background: 'rgba(201,168,76,.03)', border: '1px solid rgba(201,168,76,.1)', borderRadius: 10, padding: '14px 16px' },
  sysTitle: { fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 10 },
  pairRow: { display: 'flex', gap: 8, marginBottom: 8, alignItems: 'stretch' },
  personCard: (color) => ({
    flex: 1, padding: '10px 12px', borderRadius: 8,
    background: color + '06', border: '1px solid ' + color + '18',
    display: 'flex', flexDirection: 'column', gap: 4,
  }),
  label: { fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '.15em', textTransform: 'uppercase', opacity: .6 },
  val: { fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 600 },
  sub: { fontFamily: "'Inconsolata',monospace", fontSize: 10, opacity: .6 },
  matchBadge: (color) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 9,
    fontFamily: "'Inconsolata',monospace", background: color + '12', border: '1px solid ' + color + '30', color,
  }),
}

function CompositeSystemsSection({ a, b, aName, bName }) {
  // Compute Gene Keys for both profiles
  const gkData = useMemo(() => {
    try {
      const extract = (p) => {
        if (!p?.dob) return null
        const [year, month, day] = p.dob.split('-').map(Number)
        const tob = p.tob || '12:00'
        const [hour, minute] = tob.split(':').map(Number)
        return getGeneKeysProfile({ day, month, year, hour: hour || 12, minute: minute || 0, timezone: p.birthTimezone ?? -3 })
      }
      return { a: extract(a), b: extract(b) }
    } catch { return { a: null, b: null } }
  }, [a?.dob, a?.tob, b?.dob, b?.tob])

  // Compute Numerology for both profiles
  const numData = useMemo(() => {
    try {
      const extract = (p) => {
        if (!p?.dob) return null
        return getNumerologyProfileFromDob(p.dob, p.name || '')
      }
      return { a: extract(a), b: extract(b) }
    } catch { return { a: null, b: null } }
  }, [a?.dob, a?.name, b?.dob, b?.name])

  // Compute Kabbalah for both profiles
  const kabData = useMemo(() => {
    try {
      const extract = (p) => {
        if (!p?.dob) return null
        const args = profileToKabArgs(p)
        if (!args) return null
        return getKabbalahProfile(args)
      }
      return { a: extract(a), b: extract(b) }
    } catch { return { a: null, b: null } }
  }, [a?.dob, a?.tob, b?.dob, b?.tob])

  const gkA = gkData.a?.spheres, gkB = gkData.b?.spheres
  const numA = numData.a, numB = numData.b
  const kabA = kabData.a, kabB = kabData.b

  // Gene Keys sphere names
  const sphereNames = ['lifesWork', 'evolution', 'radiance', 'purpose']
  const sphereLabels = { lifesWork: "Life's Work", evolution: 'Evolution', radiance: 'Radiance', purpose: 'Purpose' }

  // Check for shared Gene Keys gates
  const gkShared = gkA && gkB
    ? sphereNames.filter(s => {
        const gatesA = sphereNames.map(n => gkA[n]?.gate)
        return gatesA.includes(gkB[s]?.gate)
      })
    : []

  return (
    <div style={{ gridColumn: '1/4', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
      {/* Section header */}
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.25em', textTransform: 'uppercase', color: 'rgba(201,168,76,.5)', borderTop: '1px solid rgba(201,168,76,.08)', paddingTop: 12 }}>
        Composite Framework Analysis
      </div>

      {/* Gene Keys Comparison */}
      {gkA && gkB && (
        <div style={compStyle.card}>
          <div style={{ ...compStyle.sysTitle, color: '#9050e0' }}>⬡ Gene Keys Comparison</div>
          {sphereNames.map(sphere => {
            const sA = gkA[sphere], sB = gkB[sphere]
            if (!sA || !sB) return null
            const dA = GENE_KEYS_DATA[sA.gate] || {}
            const dB = GENE_KEYS_DATA[sB.gate] || {}
            const shared = sA.gate === sB.gate
            return (
              <div key={sphere} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ ...compStyle.label, color: '#9050e0' }}>{sphereLabels[sphere]}</span>
                  {shared && <span style={compStyle.matchBadge('#60b030')}>Shared Gate</span>}
                </div>
                <div style={compStyle.pairRow}>
                  <div style={compStyle.personCard('#50b4dc')}>
                    <div style={{ ...compStyle.label, color: '#50b4dc' }}>{aName}</div>
                    <div style={{ ...compStyle.val, color: '#50b4dc' }}>Gate {sA.gate}.{sA.line}</div>
                    <div style={compStyle.sub}>{dA.shadow} → {dA.gift} → {dA.siddhi}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 14, opacity: .3 }}>⟷</div>
                  <div style={compStyle.personCard('#d43070')}>
                    <div style={{ ...compStyle.label, color: '#d43070' }}>{bName}</div>
                    <div style={{ ...compStyle.val, color: '#d43070' }}>Gate {sB.gate}.{sB.line}</div>
                    <div style={compStyle.sub}>{dB.shadow} → {dB.gift} → {dB.siddhi}</div>
                  </div>
                </div>
              </div>
            )
          })}
          {gkShared.length > 0 && (
            <div style={{ fontSize: 11, color: '#60b030', fontStyle: 'italic', marginTop: 4 }}>
              {gkShared.length} shared gate{gkShared.length > 1 ? 's' : ''} — deep karmic resonance in the Gene Keys field.
            </div>
          )}
        </div>
      )}

      {/* Numerology Comparison */}
      {numA && numB && (
        <div style={compStyle.card}>
          <div style={{ ...compStyle.sysTitle, color: '#40ccdd' }}>∞ Numerology Comparison</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
            {/* Header row */}
            <div style={{ ...compStyle.label, color: '#50b4dc', textAlign: 'center' }}>{aName}</div>
            <div />
            <div style={{ ...compStyle.label, color: '#d43070', textAlign: 'center' }}>{bName}</div>
            {/* Life Path */}
            {[
              { label: 'Life Path', keyA: numA.lifePath, keyB: numB.lifePath },
              { label: 'Expression', keyA: numA.expression, keyB: numB.expression },
              { label: 'Soul Urge', keyA: numA.soulUrge, keyB: numB.soulUrge },
              { label: 'Personality', keyA: numA.personality, keyB: numB.personality },
              { label: 'Birthday', keyA: numA.birthday, keyB: numB.birthday },
            ].filter(r => r.keyA != null && r.keyB != null).map((row, i) => {
              const match = row.keyA === row.keyB
              return [
                <div key={`a${i}`} style={{ textAlign: 'center', fontFamily: "'Cinzel',serif", fontSize: 16, color: '#50b4dc' }}>{row.keyA}</div>,
                <div key={`l${i}`} style={{ textAlign: 'center', padding: '3px 10px', borderRadius: 8, background: match ? 'rgba(96,176,48,.08)' : 'rgba(255,255,255,.02)', border: match ? '1px solid rgba(96,176,48,.2)' : '1px solid rgba(255,255,255,.05)' }}>
                  <div style={{ fontFamily: "'Inconsolata',monospace", fontSize: 9, opacity: .5 }}>{row.label}</div>
                  {match && <div style={{ fontSize: 8, color: '#60b030' }}>Match</div>}
                </div>,
                <div key={`b${i}`} style={{ textAlign: 'center', fontFamily: "'Cinzel',serif", fontSize: 16, color: '#d43070' }}>{row.keyB}</div>,
              ]
            })}
          </div>
          {numA.lifePath != null && numB.lifePath != null && (
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', marginTop: 10 }}>
              Combined vibration: Life Path {numA.lifePath} + {numB.lifePath} = {((numA.lifePath + numB.lifePath) % 9) || 9} — {
                numA.lifePath === numB.lifePath ? 'mirrored paths amplify each other\'s lessons'
                : Math.abs(numA.lifePath - numB.lifePath) <= 2 ? 'adjacent frequencies create natural resonance'
                : 'complementary numbers bring balance through contrast'
              }.
            </div>
          )}
        </div>
      )}

      {/* Kabbalah Comparison */}
      {kabA && kabB && (
        <div style={compStyle.card}>
          <div style={{ ...compStyle.sysTitle, color: '#c9a84c' }}>✡ Kabbalah Path Comparison</div>
          <div style={compStyle.pairRow}>
            <div style={compStyle.personCard('#50b4dc')}>
              <div style={{ ...compStyle.label, color: '#50b4dc' }}>{aName}</div>
              {kabA.sephiroth?.slice(0, 3).map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...compStyle.sub, color: '#50b4dc' }}>{s.name}</span>
                  <span style={{ fontFamily: "'Inconsolata',monospace", fontSize: 10, opacity: .5 }}>{s.value || s.score || ''}</span>
                </div>
              ))}
              {kabA.lifePath && <div style={compStyle.sub}>Path: {kabA.lifePath.name || kabA.lifePath}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 14, opacity: .3 }}>⟷</div>
            <div style={compStyle.personCard('#d43070')}>
              <div style={{ ...compStyle.label, color: '#d43070' }}>{bName}</div>
              {kabB.sephiroth?.slice(0, 3).map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...compStyle.sub, color: '#d43070' }}>{s.name}</span>
                  <span style={{ fontFamily: "'Inconsolata',monospace", fontSize: 10, opacity: .5 }}>{s.value || s.score || ''}</span>
                </div>
              ))}
              {kabB.lifePath && <div style={compStyle.sub}>Path: {kabB.lifePath.name || kabB.lifePath}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RomanticContent({ a, b, aName, bName, report }) {
  // Use computed framework if report available, fall back to static
  const computed = report ? computeSynastryFramework(report, true) : null
  const fw = computed || romanticFramework

  // Build dynamic HD items from actual computed profiles (computePersonData fills hdType/hdProfile/hdAuth)
  const hdA = a?.hdType && a.hdType !== '?' ? a.hdType : null
  const hdB = b?.hdType && b.hdType !== '?' ? b.hdType : null
  const profA = a?.hdProfile && a.hdProfile !== '?' ? a.hdProfile : null
  const profB = b?.hdProfile && b.hdProfile !== '?' ? b.hdProfile : null
  const authA = a?.hdAuth && a.hdAuth !== '?' ? a.hdAuth : null
  const authB = b?.hdAuth && b.hdAuth !== '?' ? b.hdAuth : null
  const defA = a?.hdDef || null
  const defB = b?.hdDef || null

  const hdItems = (hdA || hdB) ? [
    { icon: '⚡', title: 'Type Chemistry', val: `${hdA || '?'} + ${hdB || '?'}`, sub: hdA === hdB ? 'Same type — deep mutual recognition' : 'Different strategies create complementary flow' },
    { icon: '🔮', title: 'Profile Harmony', val: profA && profB ? `${profA} meets ${profB}` : '—', sub: profA && profB ? 'Profile lines create unique relational karma' : 'Add birth times for profile data' },
    { icon: '💫', title: 'Authority Dance', val: `${authA || '?'} × ${authB || '?'}`, sub: authA === authB ? 'Same authority — natural timing alignment' : 'Different decision-making rhythms — must honor both' },
    { icon: '✨', title: 'Definition Bridge', val: defA && defB ? `${defA} + ${defB}` : '—', sub: 'How your energy bodies connect and complete each other' },
    { icon: '🌊', title: `${aName}'s Design`, val: hdA || '?', sub: profA ? `${profA} · ${authA || '?'} authority` : 'Profile pending' },
    { icon: '🎯', title: `${bName}'s Design`, val: hdB || '?', sub: profB ? `${profB} · ${authB || '?'} authority` : 'Profile pending' },
  ] : fw.hdSection.items(a, b, aName, bName)

  // Extract deep insights from report
  const bondType = report?.bondType || null
  const themes = report?.themes || []
  const narratives = report?.narratives || {}
  const timing = report?.timing || []

  return (
    <>
      {/* Bond Type Badge */}
      <BondBadge bondType={bondType} />

      {/* Relationship Themes */}
      <ThemesSection themes={themes} />

      {/* Synthesis Summary */}
      <SynSummary a={a} b={b} aName={aName} bName={bName} report={report} />

      {/* Composite Wheel - spans 2 rows */}
      <div className="syn-card" style={{ gridColumn: 1, gridRow: '1/3' }}>
        <div className="syn-ch"><span className="syn-ct">Composite Chart · Midpoint Wheel</span><span>💕</span></div>
        <div className="syn-cb"><SynastryWheel mode="romantic" nameA={aName} nameB={bName} chartA={report?.chartA} chartB={report?.chartB} aspects={report?.aspects} /></div>
      </div>

      {/* Venus-Mars */}
      <div className="syn-card" style={{ gridColumn: 2, gridRow: 1 }}>
        <div className="syn-ch"><span className="syn-ct">♀ Venus–Mars Attraction Analysis</span><span>♀</span></div>
        <div className="syn-cb">
          <ScoreSection
            headerLabel={fw.sections[0].headerLabel}
            headerColor={fw.sections[0].headerColor}
            scores={fw.sections[0].scores}
            insight={fw.sections[0].insight}
            aName={aName} bName={bName}
          />
          {narratives.categories?.attraction && (
            <NarrativeBlock text={narratives.categories.attraction} color="rgba(240,96,160,.5)" />
          )}
        </div>
      </div>

      {/* Soul Depth */}
      <div className="syn-card" style={{ gridColumn: 2, gridRow: 2 }}>
        <div className="syn-ch"><span className="syn-ct">☽ Emotional &amp; Soul Depth</span><span>☽</span></div>
        <div className="syn-cb">
          <ScoreSection
            headerLabel={fw.sections[1].headerLabel}
            headerColor={fw.sections[1].headerColor}
            scores={fw.sections[1].scores}
            insight={fw.sections[1].insight}
            aName={aName} bName={bName}
          />
          {narratives.categories?.emotional && (
            <NarrativeBlock text={narratives.categories.emotional} color="rgba(64,204,221,.5)" />
          )}
        </div>
      </div>

      {/* HD Compatibility */}
      <div className="syn-card" style={{ gridColumn: 3, gridRow: 1 }}>
        <div className="syn-ch"><span className="syn-ct">◈ Human Design Compatibility</span><span>◈</span></div>
        <div className="syn-cb">
          <CompositeGrid items={hdItems} />
        </div>
      </div>

      {/* Multi-System */}
      <div className="syn-card" style={{ gridColumn: 3, gridRow: 2 }}>
        <div className="syn-ch"><span className="syn-ct">⬡ Gene Keys Resonance · ∞ Numerology</span><span>⬡</span></div>
        <div className="syn-cb">
          <ScoreSection
            headerLabel={fw.multiSystemSection.headerLabel}
            headerColor={fw.multiSystemSection.headerColor}
            scores={fw.multiSystemSection.scores}
            insight={fw.multiSystemSection.insight}
            aName={aName} bName={bName}
          />
        </div>
      </div>

      {/* Deep Narrative Sections */}
      {narratives.categories?.karmic && (
        <div style={{ gridColumn: '1/4' }}>
          <NarrativeBlock title="Karmic Architecture" icon="📜" text={narratives.categories.karmic} color="rgba(187,102,255,.5)" />
        </div>
      )}
      {narratives.categories?.depth && (
        <div style={{ gridColumn: '1/4' }}>
          <NarrativeBlock title="Shadow & Depth" icon="🌑" text={narratives.categories.depth} color="rgba(144,80,224,.5)" />
        </div>
      )}
      {narratives.categories?.healing && (
        <div style={{ gridColumn: '1/4' }}>
          <NarrativeBlock title="Healing Potential" icon="💚" text={narratives.categories.healing} color="rgba(96,176,48,.5)" />
        </div>
      )}

      {/* Growth Edges */}
      <GrowthEdgesSection edges={narratives.growthEdges} />

      {/* Timing Windows */}
      <TimingSection timing={timing} />

      {/* Composite Framework Comparisons */}
      <CompositeSystemsSection a={a} b={b} aName={aName} bName={bName} />
    </>
  )
}

function FamilyContent({ a, b, aName, bName, report }) {
  const fw = familyFramework
  const rel = b.rel || 'other'
  const isParentRel = rel === 'father' || rel === 'mother'

  // Compute framework from real data if available
  const computed = report ? computeSynastryFramework(report, false) : null

  const karma = computed
    ? { ...fw.getKarmaSection(isParentRel, aName, bName, b.sign), ...computed.karmaSectionData }
    : fw.getKarmaSection(isParentRel, aName, bName, b.sign)
  const gen = computed
    ? { ...fw.getGenerationalSection(isParentRel, aName, bName, b.sign), ...computed.genSectionData }
    : fw.getGenerationalSection(isParentRel, aName, bName, b.sign)

  // HD items — build dynamic items from computed profiles (computePersonData fills hdType)
  // The synastry report's chartA/B don't have HD data, so build from the computed profiles directly
  const hdA = a?.hdType && a.hdType !== '?' ? a.hdType : null
  const hdB = b?.hdType && b.hdType !== '?' ? b.hdType : null
  const profA = a?.hdProfile && a.hdProfile !== '?' ? a.hdProfile : null
  const profB = b?.hdProfile && b.hdProfile !== '?' ? b.hdProfile : null
  const authA = a?.hdAuth && a.hdAuth !== '?' ? a.hdAuth : null
  const authB = b?.hdAuth && b.hdAuth !== '?' ? b.hdAuth : null

  const hdItems = (hdA || hdB) ? [
    { icon: '⚡', title: `${aName}'s Type`, val: hdA || '?', sub: profA ? `Profile ${profA}` : 'Unknown profile' },
    { icon: '⚡', title: `${bName}'s Type`, val: hdB || '?', sub: profB ? `Profile ${profB}` : 'Unknown profile' },
    { icon: '🔗', title: 'Energy Dynamic', val: hdA === hdB ? 'Mirror — same operating system' : `${hdA || '?'} + ${hdB || '?'}`, sub: hdA === hdB ? 'Same type creates deep mutual understanding' : 'Different strategies create a complete circuit' },
    { icon: '🌀', title: 'Authority Dance', val: `${authA || '?'} × ${authB || '?'}`, sub: authA === authB ? 'Shared decision rhythm — natural alignment' : 'Different timing creates productive tension' },
    { icon: '🏛️', title: isParentRel ? 'Conditioning Pattern' : 'Sibling Resonance', val: isParentRel ? `${bName} defines ${aName}'s open centers` : 'Mutual definition exchange', sub: isParentRel ? 'Deep imprint during formative years' : 'You complete each other\'s energy circuit' },
    { icon: '🎯', title: 'Profile Karma', val: profA && profB ? `${profA} meets ${profB}` : 'Profiles pending', sub: 'Life themes interact through shared lineage' },
  ] : fw.hdSection.items(isParentRel, aName, bName)

  // Multi-system scores — use computed when available
  const msScores = computed?.multiSystemScores
    ? computed.multiSystemScores
    : fw.multiSystemSection.getScores(isParentRel)
  const msInsight = computed?.multiSystemInsight
    ? computed.multiSystemInsight
    : fw.multiSystemSection.getInsight(isParentRel, aName, bName)

  // Extract deep insights from report
  const bondType = report?.bondType || null
  const themes = report?.themes || []
  const narratives = report?.narratives || {}
  const timing = report?.timing || []

  return (
    <>
      {/* Bond Type Badge */}
      <BondBadge bondType={bondType} />

      {/* Relationship Themes */}
      <ThemesSection themes={themes} />

      <SynSummary a={a || {}} b={b} aName={aName} bName={bName} report={report} />
      <div className="syn-card" style={{ gridColumn: 1, gridRow: '1/3' }}>
        <div className="syn-ch"><span className="syn-ct">Family Composite Chart · Karmic Axis</span><span>🧬</span></div>
        <div className="syn-cb"><SynastryWheel mode="family" nameA={aName} nameB={bName} chartA={report?.chartA} chartB={report?.chartB} aspects={report?.aspects} /></div>
      </div>

      <div className="syn-card" style={{ gridColumn: 2, gridRow: 1 }}>
        <div className="syn-ch"><span className="syn-ct">🧬 {karma.title}</span></div>
        <div className="syn-cb">
          <div className="score-section">
            <div style={{ fontFamily: 'inherit', fontSize: '8px', letterSpacing: '.15em', color: karma.headerColor, marginBottom: '4px' }}>
              {karma.headerLabel}
            </div>
            {karma.scores.map((s, i) => (
              <ScoreRow key={i} label={s.label} val={`${s.pct}%`} gradient={s.gradient} />
            ))}
            <div className="score-insight">
              <span>{karma.insight}</span>
            </div>
          </div>
          {narratives.categories?.karmic && (
            <NarrativeBlock text={narratives.categories.karmic} color="rgba(64,204,221,.5)" />
          )}
        </div>
      </div>

      <div className="syn-card" style={{ gridColumn: 2, gridRow: 2 }}>
        <div className="syn-ch"><span className="syn-ct">🌳 {gen.title}</span></div>
        <div className="syn-cb">
          <div className="score-section">
            <div style={{ fontFamily: 'inherit', fontSize: '8px', letterSpacing: '.15em', color: gen.headerColor, marginBottom: '4px' }}>
              {gen.headerLabel}
            </div>
            {gen.scores.map((s, i) => (
              <ScoreRow key={i} label={s.label} val={`${s.pct}%`} gradient={s.gradient} />
            ))}
            <div className="score-insight">
              <span>{gen.insight}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="syn-card" style={{ gridColumn: 3, gridRow: 1 }}>
        <div className="syn-ch"><span className="syn-ct">◈ HD Family Mechanics</span><span>◈</span></div>
        <div className="syn-cb">
          <CompositeGrid items={hdItems} />
        </div>
      </div>

      <div className="syn-card" style={{ gridColumn: 3, gridRow: 2 }}>
        <div className="syn-ch"><span className="syn-ct">✡ Kabbalah · ∞ Numerology · ⬡ Gene Keys</span></div>
        <div className="syn-cb">
          <div className="score-section">
            <div style={{ fontFamily: 'inherit', fontSize: '8px', letterSpacing: '.15em', color: fw.multiSystemSection.headerColor, marginBottom: '4px' }}>
              {fw.multiSystemSection.headerLabel}
            </div>
            {msScores.map((s, i) => (
              <ScoreRow key={i} label={s.label} val={s.pct ? `${s.pct}%` : s.val} gradient={s.gradient} />
            ))}
            <div className="score-insight">
              <span>{msInsight}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Narrative Sections */}
      {narratives.categories?.depth && (
        <div style={{ gridColumn: '1/4' }}>
          <NarrativeBlock title="Family Shadow & Depth" icon="🌑" text={narratives.categories.depth} color="rgba(144,80,224,.5)" />
        </div>
      )}
      {narratives.categories?.healing && (
        <div style={{ gridColumn: '1/4' }}>
          <NarrativeBlock title="Healing Inheritance" icon="💚" text={narratives.categories.healing} color="rgba(96,176,48,.5)" />
        </div>
      )}

      {/* Growth Edges */}
      <GrowthEdgesSection edges={narratives.growthEdges} />

      {/* Timing Windows */}
      <TimingSection timing={timing} />

      {/* Composite Framework Comparisons */}
      <CompositeSystemsSection a={a} b={b} aName={aName} bName={bName} />
    </>
  )
}

export function SynastryInner({ onClose }) {
  const primaryProfile = useGolemStore((s) => s.primaryProfile)
  const people = useGolemStore((s) => s.people)
  const synSelA = useGolemStore((s) => s.synSelA)
  const synSelB = useGolemStore((s) => s.synSelB)
  const setSynSel = useGolemStore((s) => s.setSynSel)

  const rawA = getProfile(synSelA, primaryProfile, people)
  const rawB = synSelB !== null ? getProfile(synSelB, primaryProfile, people) : null

  // Always compute through single source of truth so HD/sign/lifePath are filled
  const a = useMemo(() => computePersonData(rawA), [rawA?.dob, rawA?.tob, rawA?.birthLat, rawA?.birthLon, rawA?.birthTimezone, rawA?.name, synSelA])
  const b = useMemo(() => rawB ? computePersonData(rawB) : null, [rawB?.dob, rawB?.tob, rawB?.birthLat, rawB?.birthLon, rawB?.birthTimezone, rawB?.name, synSelB])

  const aName = a.name?.split(' ')[0] || 'You'
  const bName = b ? b.name?.split(' ')[0] || 'Person' : 'Select Person'

  const cfgA = rawA === primaryProfile ? null : (REL_CONFIG[rawA.rel] || REL_CONFIG.other)
  const cfgB = rawB ? (REL_CONFIG[rawB.rel] || REL_CONFIG.other) : null

  const hasSelection = b && synSelA !== synSelB
  const romantic = hasSelection && (isRomantic(b.rel) || isRomantic(a.rel || ''))

  // Compute real synastry report when two people are selected
  // Use synSelA/synSelB as deps to guarantee recompute on person switch
  const synastryReport = useMemo(() => {
    if (!hasSelection || !a || !b) return null
    try {
      const paramsA = getBirthParams(a)
      const paramsB = getBirthParams(b)
      if (!paramsA || !paramsB) return null
      return getSynastryReport(paramsA, paramsB)
    } catch (err) {
      console.warn('[SynastryPanel] Engine error:', err)
      return null
    }
  }, [hasSelection, synSelA, synSelB, a?.dob, b?.dob, a?.tob, b?.tob])

  return (
    <div className="synastry-panel">
      <div className="syn-header">
        <span className="syn-title">{'\u2295'} Synastry {'\u00B7'} Composite Analysis</span>

        {/* Person A */}
        <div className="syn-select">
          <div className="syn-avatar" style={{ borderColor: 'var(--foreground)', background: 'var(--accent)' }}>
            {rawA.emoji || cfgA?.emoji || '\u2726'}
          </div>
          <div>
            <div style={{ fontFamily: 'inherit', fontSize: '10px', color: 'var(--foreground)' }}>{aName}</div>
            <SelectorChips slot="A" currentId={synSelA} primaryProfile={primaryProfile} people={people} onSelect={setSynSel} />
          </div>
        </div>

        <div className="syn-vs">vs</div>

        {/* Person B */}
        <div className="syn-select">
          <div className="syn-avatar" style={{ borderColor: 'var(--rose2)', background: 'rgba(212,48,112,.1)' }}>
            {rawB ? (rawB.emoji || cfgB?.emoji || '?') : '?'}
          </div>
          <div>
            <div style={{ fontFamily: 'inherit', fontSize: '10px', color: 'var(--rose2)' }}>{bName}</div>
            <SelectorChips slot="B" currentId={synSelB} primaryProfile={primaryProfile} people={people} onSelect={setSynSel} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 10 }}>
          <div
            className={`rel-badge ${hasSelection ? (romantic ? 'rel-romantic' : 'rel-family') : ''}`}
            style={!hasSelection ? { opacity: .4 } : synastryReport?.bondType ? { borderColor: synastryReport.bondType.color + '40', background: synastryReport.bondType.color + '10' } : {}}
          >
            {hasSelection
              ? synastryReport?.bondType
                ? `${synastryReport.bondType.emoji} ${synastryReport.bondType.label} Bond`
                : (romantic ? '\u2640 Romantic Synastry' : '\u25C8 Family Synastry')
              : 'No Selection'}
            {synastryReport && <span style={{ marginLeft: 8, opacity: 0.85, color: synastryReport.bondType?.color || 'inherit' }}>{synastryReport.overall}%</span>}
          </div>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '7.5px', color: 'var(--muted-foreground)' }}>
            {hasSelection
              ? synastryReport?.themes?.length > 0
                ? synastryReport.themes.map(t => t.label).join(' \u00B7 ')
                : (romantic ? 'Venus/Mars \u00B7 Soul Contracts \u00B7 Composite Chart' : 'Karmic Bonds \u00B7 Family Karma \u00B7 Generational Patterns')
              : 'Choose people to compare'}
          </div>
        </div>

        <div style={{ flex: 1 }} />
        {onClose && <div className="pp-close" onClick={onClose}>{'\u2715'}</div>}
      </div>

      <div className="syn-body">
        {hasSelection ? (
          romantic
            ? <RomanticContent a={a} b={b} aName={aName} bName={bName} report={synastryReport} />
            : <FamilyContent a={a} b={b} aName={aName} bName={bName} report={synastryReport} />
        ) : (
          <div style={{ gridColumn: '1/4', gridRow: '1/3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, opacity: .35 }}>
            <div style={{ fontSize: 48 }}>{'\u2295'}</div>
            <div style={{ fontFamily: 'inherit', fontSize: '13px', letterSpacing: '.25em', color: 'var(--foreground)' }}>Select Two People to Begin</div>
            <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>Choose profiles from the selectors above</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SynastryPanel({ open, onClose }) {
  return (
    <div className={`overlay${open ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <SynastryInner onClose={onClose} />
    </div>
  )
}
