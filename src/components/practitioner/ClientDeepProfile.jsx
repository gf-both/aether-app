/**
 * ClientDeepProfile.jsx
 * Comprehensive deep-profile view of a client's full profile.
 * Designed for practitioners to use during sessions or preparation.
 */

import { useState, useMemo } from 'react'
import { buildFullProfile } from '../../engines/patternEngine.js'

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  container: {
    height: '100%',
    overflow: 'auto',
    fontFamily: "'Cormorant Garamond',serif",
    color: 'var(--foreground)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '20px 24px 0',
    borderBottom: '1px solid var(--accent)',
    flexShrink: 0,
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  clientName: {
    fontFamily: "'Cinzel',serif",
    fontSize: '20px',
    letterSpacing: '.12em',
    color: 'var(--foreground)',
    marginBottom: '4px',
  },
  clientMeta: {
    fontSize: '12px',
    color: 'var(--muted-foreground)',
    letterSpacing: '.04em',
  },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '10px',
    letterSpacing: '.06em',
    background: 'var(--secondary)',
    border: '1px solid var(--accent)',
    color: 'var(--foreground)',
    fontFamily: "'Cinzel',serif",
  },
  actionBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '10px',
    fontFamily: "'Cinzel',serif",
    letterSpacing: '.08em',
    background: 'rgba(201,168,76,.06)',
    border: '1px solid var(--accent)',
    color: 'var(--foreground)',
    cursor: 'pointer',
    transition: 'all .2s',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    padding: '0 0 10px 0',
    fontSize: '11px',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
    display: 'block',
    letterSpacing: '.04em',
  },
  tabs: {
    display: 'flex',
    gap: '0',
    padding: '14px 24px 0',
  },
  tab: (active) => ({
    padding: '8px 16px',
    fontSize: '10px',
    fontFamily: "'Cinzel',serif",
    letterSpacing: '.08em',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--foreground)' : '2px solid transparent',
    color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
    marginBottom: '-1px',
    transition: 'all .2s',
    textTransform: 'uppercase',
  }),
  tabContent: {
    padding: '24px',
    flex: 1,
    overflow: 'auto',
  },
  sectionTitle: {
    fontFamily: "'Cinzel',serif",
    fontSize: '11px',
    letterSpacing: '.18em',
    color: 'var(--foreground)',
    marginBottom: '14px',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, var(--accent), transparent)',
    margin: '20px 0',
  },
  card: {
    background: 'var(--secondary)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '10px',
  },
  miniCard: {
    background: 'var(--secondary)',
    border: '1px solid rgba(255,255,255,.05)',
    borderRadius: '10px',
    padding: '12px',
  },
}

// ─── Pattern Card ─────────────────────────────────────────────────────────────

function PatternCard({ pattern }) {
  const [expanded, setExpanded] = useState(false)
  const baseColor = pattern.color || 'rgba(201,168,76,'

  return (
    <div
      style={{
        background: `${baseColor}0.05)`,
        border: `1px solid ${baseColor}0.2)`,
        borderRadius: '12px',
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all .2s',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <span style={{ fontSize: '18px' }}>{pattern.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'Cinzel',serif",
            fontSize: '11px',
            letterSpacing: '.08em',
            color: `${baseColor}0.9)`,
          }}>
            {pattern.name.toUpperCase()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
            {pattern.description}
          </div>
        </div>
        <div style={{
          padding: '2px 8px',
          borderRadius: '10px',
          fontSize: '9px',
          fontFamily: "'Cinzel',serif",
          letterSpacing: '.06em',
          background: `${baseColor}0.1)`,
          border: `1px solid ${baseColor}0.25)`,
          color: `${baseColor}0.8)`,
          flexShrink: 0,
        }}>
          {pattern.strength}
        </div>
      </div>

      {/* Contributors */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
        {pattern.contributors.map((c, i) => (
          <span key={i} style={{
            fontSize: '9px',
            padding: '2px 6px',
            borderRadius: '6px',
            background: `${baseColor}0.06)`,
            border: `1px solid ${baseColor}0.15)`,
            color: `${baseColor}0.7)`,
          }}>
            {c}
          </span>
        ))}
      </div>

      {/* Insight (expanded) */}
      {expanded && pattern.insight && (
        <div style={{
          marginTop: '10px',
          padding: '10px 12px',
          borderRadius: '8px',
          background: `${baseColor}0.04)`,
          border: `1px solid ${baseColor}0.1)`,
          fontSize: '12px',
          color: 'var(--muted-foreground)',
          lineHeight: 1.7,
          fontStyle: 'italic',
        }}>
          {pattern.insight}
        </div>
      )}
      <div style={{ textAlign: 'right', fontSize: '9px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
        {expanded ? 'collapse ▲' : 'practitioner insight ▼'}
      </div>
    </div>
  )
}

// ─── Mini System Card ─────────────────────────────────────────────────────────

function MiniCard({ label, icon, primary, secondary, tertiary, color = 'rgba(201,168,76,' }) {
  return (
    <div style={{
      ...s.miniCard,
      borderColor: `${color}0.12)`,
      background: `${color}0.03)`,
    }}>
      <div style={{
        fontFamily: "'Cinzel',serif",
        fontSize: '9px',
        letterSpacing: '.1em',
        color: `${color}0.7)`,
        marginBottom: '8px',
        textTransform: 'uppercase',
      }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: '15px', color: 'var(--foreground)', lineHeight: 1.3 }}>{primary || '—'}</div>
      {secondary && <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px' }}>{secondary}</div>}
      {tertiary && <div style={{ fontSize: '10px', color: 'var(--muted-foreground)', marginTop: '2px', opacity: 0.7 }}>{tertiary}</div>}
    </div>
  )
}

// ─── Session Timeline ─────────────────────────────────────────────────────────

function SessionTimeline({ sessions = [] }) {
  if (!sessions.length) {
    return (
      <div style={{ ...s.card, textAlign: 'center', padding: '40px', color: 'var(--muted-foreground)', fontSize: '13px' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
        No sessions recorded yet.
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute',
        left: '18px',
        top: '8px',
        bottom: '8px',
        width: '1px',
        background: 'linear-gradient(180deg, rgba(201,168,76,.3), var(--secondary))',
      }} />
      <div style={{ paddingLeft: '46px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {[...sessions].reverse().map((session, i) => (
          <div key={session.id || i} style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '-35px',
              top: '8px',
              width: '11px',
              height: '11px',
              borderRadius: '50%',
              background: 'var(--foreground)',
              border: '2px solid rgba(201,168,76,.3)',
              boxShadow: '0 0 8px rgba(201,168,76,.3)',
            }} />
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: '10px', color: 'var(--foreground)', letterSpacing: '.06em' }}>
                  Session #{sessions.length - i}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>
                  {session.date} {session.duration ? `· ${session.duration} min` : ''}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.6, marginBottom: '10px' }}>
                {session.notes || session.summary}
              </div>
              {session.frameworks && session.frameworks.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                  {session.frameworks.map((fw, f) => (
                    <span key={f} style={{
                      ...s.badge,
                      fontSize: '9px',
                      padding: '1px 6px',
                      background: 'rgba(144,80,224,.07)',
                      border: '1px solid rgba(144,80,224,.15)',
                      color: 'rgba(144,80,224,.8)',
                    }}>
                      {fw}
                    </span>
                  ))}
                </div>
              )}
              {session.actionItems && session.actionItems.length > 0 && (
                <div style={{ borderTop: '1px solid var(--secondary)', paddingTop: '8px' }}>
                  {session.actionItems.map((item, j) => (
                    <div key={j} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      fontSize: '11px',
                      color: item.done ? 'var(--muted-foreground)' : 'var(--muted-foreground)',
                      textDecoration: item.done ? 'line-through' : 'none',
                      padding: '2px 0',
                    }}>
                      <span style={{ color: item.done ? '#7bc043' : 'var(--muted-foreground)', fontSize: '11px' }}>
                        {item.done ? '✓' : '○'}
                      </span>
                      {item.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Family Tab ───────────────────────────────────────────────────────────────

function FamilyTab({ _client }) {
  return (
    <div>
      <div style={s.sectionTitle}><span>🌳</span> Family Constellation</div>
      <div style={{ ...s.card, marginBottom: '16px', fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
        Family constellation mapping reveals inherited patterns, ancestral wounds, and relational dynamics.
        Cross-reference natal 4th/8th house, HD definition patterns, Gene Keys Purpose sphere, and karmic numbers.
      </div>
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted-foreground)', fontSize: '13px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌳</div>
        Open the Family Constellation panel to map this client's family system.
        <br />
        <span style={{ fontSize: '11px' }}>Add family members from the People section to enable cross-system constellation analysis.</span>
      </div>
    </div>
  )
}

// ─── Blueprint Overview Tab ───────────────────────────────────────────────────

function BlueprintOverview({ fullProfile, client }) {
  const { natal, hd, geneKeys, numerology, mayan, enneagram, mbti, patterns = [] } = fullProfile

  const sunSign = natal?.planets?.sun?.sign || client.sign || '—'
  const moonSign = natal?.planets?.moon?.sign || '—'
  const ascSign = natal?.angles?.asc?.sign || client.asc || '—'
  const hdType = hd?.type || client.hdType || '—'
  const hdProfile = hd?.profile || client.hdProfile || '—'
  const hdAuthority = hd?.authority || client.hdAuth || '—'
  const lifePath = numerology?.core?.lifePath?.val || client.lifePath || '—'
  const gkLifesWork = geneKeys?.spheres?.lifesWork?.gate || '—'
  const mayanKin = mayan ? `${mayan.tzolkin?.daySign || ''} ${mayan.tzolkin?.tone || ''}` : '—'

  return (
    <div>
      {/* Key signatures */}
      <div style={{ ...s.card, marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {sunSign !== '—' && <span style={s.badge}>☀ {sunSign} Sun</span>}
          {moonSign !== '—' && <span style={s.badge}>☽ {moonSign} Moon</span>}
          {ascSign !== '—' && <span style={s.badge}>⬆ {ascSign} Rising</span>}
          {hdType !== '—' && (
            <span style={{ ...s.badge, background: 'rgba(212,48,112,.07)', borderColor: 'rgba(212,48,112,.2)', color: 'rgba(212,48,112,.8)' }}>
              ◈ {hdType} {hdProfile}
            </span>
          )}
          {hdAuthority !== '—' && (
            <span style={{ ...s.badge, background: 'rgba(212,48,112,.07)', borderColor: 'rgba(212,48,112,.2)', color: 'rgba(212,48,112,.8)' }}>
              {hdAuthority}
            </span>
          )}
          {lifePath !== '—' && (
            <span style={{ ...s.badge, background: 'rgba(64,204,221,.07)', borderColor: 'rgba(64,204,221,.2)', color: 'rgba(64,204,221,.8)' }}>
              ∞ Life Path {lifePath}
            </span>
          )}
          {gkLifesWork !== '—' && (
            <span style={{ ...s.badge, background: 'rgba(96,176,48,.07)', borderColor: 'rgba(96,176,48,.2)', color: 'rgba(96,176,48,.8)' }}>
              ✦ Gene Key {gkLifesWork}
            </span>
          )}
          {mayanKin !== '—' && <span style={s.badge}>◎ Mayan {mayanKin}</span>}
          {mbti && (
            <span style={{ ...s.badge, background: 'rgba(240,160,60,.07)', borderColor: 'rgba(240,160,60,.2)', color: 'rgba(240,160,60,.8)' }}>
              🧠 {mbti}
            </span>
          )}
          {enneagram?.type && <span style={s.badge}>⬡ Enneagram {enneagram.type}</span>}
        </div>
      </div>

      {/* Patterns */}
      <div style={s.sectionTitle}><span>🔮</span> Cross-System Pattern Analysis</div>
      {patterns.length === 0 ? (
        <div style={{ ...s.card, textAlign: 'center', padding: '28px', color: 'var(--muted-foreground)', fontSize: '12px' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</div>
          No strong patterns detected yet.
          Add birth time, MBTI, and Enneagram type to improve pattern detection.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {patterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} />
          ))}
        </div>
      )}

      {/* Numerology grid */}
      {numerology && (
        <>
          <div style={s.divider} />
          <div style={s.sectionTitle}><span>∞</span> Numerology Core Numbers</div>
          <div style={s.grid3}>
            {[
              { label: 'Life Path', val: numerology.core?.lifePath?.val },
              { label: 'Expression', val: numerology.core?.expression?.val },
              { label: 'Soul Urge', val: numerology.core?.soulUrge?.val },
              { label: 'Personality', val: numerology.core?.personality?.val },
              { label: 'Birthday', val: numerology.core?.birthday?.val },
              { label: 'Maturity', val: numerology.core?.maturity?.val },
            ].filter(n => n.val).map((n) => (
              <MiniCard
                key={n.label}
                label={n.label}
                icon="∞"
                primary={String(n.val)}
                color="rgba(64,204,221,"
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── All Systems Grid Tab ─────────────────────────────────────────────────────

function AllSystemsGrid({ fullProfile, client }) {
  const { natal, hd, geneKeys, numerology, mayan, enneagram, mbti } = fullProfile

  const cards = [
    {
      label: 'Natal Chart', icon: '☀', color: 'rgba(240,160,60,',
      primary: `${natal?.planets?.sun?.sign || client.sign || '—'} Sun`,
      secondary: `${natal?.planets?.moon?.sign || '—'} Moon · ${natal?.angles?.asc?.sign || '—'} Rising`,
      tertiary: natal ? `${Object.values(natal.planets || {}).length} planets calculated` : null,
    },
    {
      label: 'Human Design', icon: '◈', color: 'rgba(212,48,112,',
      primary: `${hd?.type || client.hdType || '—'} ${hd?.profile || client.hdProfile || ''}`.trim(),
      secondary: hd?.authority || client.hdAuth || '—',
      tertiary: hd?.definition || '—',
    },
    {
      label: 'Gene Keys', icon: '✦', color: 'rgba(96,176,48,',
      primary: `Gate ${geneKeys?.spheres?.lifesWork?.gate || '—'}`,
      secondary: geneKeys?.spheres?.lifesWork?.giftKeyword || "Life's Work",
      tertiary: geneKeys ? `Evol: ${geneKeys.spheres?.evolution?.gate}` : null,
    },
    {
      label: 'Numerology', icon: '∞', color: 'rgba(64,204,221,',
      primary: `LP ${numerology?.core?.lifePath?.val || client.lifePath || '—'}`,
      secondary: `Exp ${numerology?.core?.expression?.val || '—'} · SU ${numerology?.core?.soulUrge?.val || '—'}`,
    },
    {
      label: 'Mayan Calendar', icon: '◎', color: 'rgba(201,168,76,',
      primary: mayan ? `${mayan.tzolkin?.daySign} ${mayan.tzolkin?.tone}` : '—',
      secondary: mayan ? `Haab: ${mayan.haab?.month}` : null,
      tertiary: mayan?.tzolkin?.toneKeyword || null,
    },
    { label: 'Enneagram', icon: '⬡', color: 'rgba(144,80,224,', primary: enneagram ? `Type ${enneagram.type}` : '—', secondary: 'Personality type' },
    { label: 'MBTI', icon: '🧠', color: 'rgba(240,160,60,', primary: mbti || '—', secondary: 'Cognitive profile' },
    { label: 'Vedic Nakshatra', icon: '🌙', color: 'rgba(64,204,221,', primary: '—', secondary: 'Moon nakshatra' },
    { label: 'Kabbalah', icon: '✡', color: 'rgba(201,168,76,', primary: '—', secondary: 'Tree of Life' },
    { label: 'Chinese BaZi', icon: '☯', color: 'rgba(212,48,112,', primary: '—', secondary: 'Four pillars' },
    { label: 'Tarot Birth Card', icon: '🃏', color: 'rgba(144,80,224,', primary: '—', secondary: 'Major arcana' },
    { label: 'Celtic Tree', icon: '🌿', color: 'rgba(96,176,48,', primary: '—', secondary: 'Celtic calendar' },
    { label: 'Egyptian Sign', icon: '𓂀', color: 'rgba(240,160,60,', primary: '—', secondary: 'Egyptian astrology' },
  ]

  return (
    <div>
      <div style={s.sectionTitle}><span>🌐</span> All Esoteric Systems</div>
      <div style={s.grid3}>
        {cards.map((card, i) => <MiniCard key={i} {...card} />)}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClientDeepProfile({ client, sessions = [], onBack }) {
  const [activeTab, setActiveTab] = useState('overview')

  // Support both tob and birthHour/birthMinute formats
  const tob = useMemo(() => {
    if (client?.tob) return client.tob
    if (client?.birthHour !== undefined) {
      return `${String(client.birthHour).padStart(2, '0')}:${String(client.birthMinute || 0).padStart(2, '0')}`
    }
    return '12:00'
  }, [client])

  const fullProfile = useMemo(() => {
    if (!client?.dob) return { patterns: [] }
    try {
      return buildFullProfile({
        name: client.name,
        dob: client.dob,
        tob,
        lat: client.birthLat || 0,
        lon: client.birthLon || 0,
        timezone: client.birthTimezone || 0,
        enneagram: client.enneagram,
        mbti: client.mbti,
      })
    } catch (e) {
      console.warn('[ClientDeepProfile] buildFullProfile error:', e)
      return { patterns: [] }
    }
  }, [client, tob])

  const tabs = [
    { id: 'overview', label: 'Blueprint Overview', icon: '🔮' },
    { id: 'systems', label: 'All Systems', icon: '🌐' },
    { id: 'sessions', label: 'Session History', icon: '📝' },
    { id: 'family', label: 'Family Constellation', icon: '🌳' },
  ]

  if (!client) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
        No client selected.
      </div>
    )
  }

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerTop}>
          <div>
            {onBack && (
              <button onClick={onBack} style={s.backBtn}>← Back to Clients</button>
            )}
            <div style={s.clientName}>
              {client.emoji || '✨'} {(client.name || 'Client').toUpperCase()}
            </div>
            <div style={s.clientMeta}>
              {client.dob && `Born ${client.dob}`}
              {(client.birthCity || client.pob) && ` · ${client.birthCity || client.pob}`}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
              {client.sign && <span style={s.badge}>{client.sign}</span>}
              {client.hdType && (
                <span style={{ ...s.badge, background: 'rgba(212,48,112,.07)', borderColor: 'rgba(212,48,112,.2)', color: 'rgba(212,48,112,.8)' }}>
                  {client.hdType} {client.hdProfile || ''}
                </span>
              )}
              {client.lifePath && (
                <span style={{ ...s.badge, background: 'rgba(64,204,221,.07)', borderColor: 'rgba(64,204,221,.2)', color: 'rgba(64,204,221,.8)' }}>
                  LP {client.lifePath}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignSelf: 'flex-start' }}>
            <button style={s.actionBtn}>✏️ Edit</button>
            <button style={s.actionBtn}>🔗 Share</button>
            <button style={s.actionBtn}>📄 PDF</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={s.tab(activeTab === tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={s.tabContent}>
        {activeTab === 'overview' && (
          <BlueprintOverview fullProfile={fullProfile} client={client} />
        )}
        {activeTab === 'systems' && (
          <AllSystemsGrid fullProfile={fullProfile} client={client} />
        )}
        {activeTab === 'sessions' && (
          <div>
            <div style={s.sectionTitle}><span>📝</span> Session History</div>
            <SessionTimeline sessions={sessions} />
          </div>
        )}
        {activeTab === 'family' && (
          <FamilyTab client={client} />
        )}
      </div>
    </div>
  )
}
