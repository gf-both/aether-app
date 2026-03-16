/**
 * AetherProfileDesigner.jsx
 *
 * Full UI for creating, previewing, and assigning AETHER profiles to AI agents.
 * Tabs: Profile Generator | Profile Marketplace | Mirror vs Complement | Discussion Board
 */

import { useState, useCallback, useEffect } from 'react'
import { generateProfile, getCreatorProfile } from '../lib/aetherApi.js'
import MARKETPLACE from '../../docs/personality-marketplace.json'

// ─── Shared styles ────────────────────────────────────────────────────────────

const GOLD = 'var(--gold, #c9a84c)'
const GOLD2 = 'var(--gold2, #e8c96d)'
const CARD_BASE = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(201,168,76,0.15)',
  borderRadius: 12,
}
const INPUT_STYLE = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(201,168,76,0.2)',
  borderRadius: 8,
  color: '#fff',
  padding: '8px 12px',
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
}
const LABEL_STYLE = {
  fontFamily: "'Cinzel', serif",
  fontSize: 9,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: GOLD2,
  marginBottom: 4,
  display: 'block',
}
const BTN = (variant = 'default') => ({
  padding: '8px 16px',
  borderRadius: 8,
  border: `1px solid ${variant === 'primary' ? 'rgba(201,168,76,0.6)' : 'rgba(201,168,76,0.2)'}`,
  background: variant === 'primary' ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
  color: variant === 'primary' ? GOLD2 : '#aaa',
  fontFamily: "'Cinzel', serif",
  fontSize: 10,
  letterSpacing: '.1em',
  cursor: 'pointer',
  transition: 'all .2s',
})

// ─── Tab bar ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'generator', label: '✦ Generator' },
  { id: 'marketplace', label: '◈ Marketplace' },
  { id: 'mirror', label: '⟺ Mirror · Complement' },
  { id: 'board', label: '⬡ Discussion Board' },
]

function TabBar({ active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '12px 18px 0', borderBottom: '1px solid rgba(201,168,76,0.08)', flexShrink: 0 }}>
      {TABS.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: '7px 14px',
            borderRadius: '8px 8px 0 0',
            border: '1px solid',
            borderBottom: 'none',
            borderColor: active === t.id ? 'rgba(201,168,76,0.3)' : 'transparent',
            background: active === t.id ? 'rgba(201,168,76,0.08)' : 'transparent',
            color: active === t.id ? GOLD2 : 'rgba(255,255,255,0.4)',
            fontFamily: "'Cinzel', serif",
            fontSize: 9,
            letterSpacing: '.12em',
            cursor: 'pointer',
            transition: 'all .2s',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── Profile Generator Tab ────────────────────────────────────────────────────

function ProfileField({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
    </div>
  )
}

function NatalRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(201,168,76,0.06)' }}>
      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{label}</span>
      <span style={{ color: '#fff', fontSize: 12 }}>{value}</span>
    </div>
  )
}

function GeneratorTab() {
  const [form, setForm] = useState({
    name: '',
    role: '',
    timestamp: new Date().toISOString().slice(0, 16),
    location: 'Montevideo, Uruguay',
    creatorRelation: 'complement',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  async function handleGenerate() {
    if (!form.name || !form.role) {
      setError('Name and Role are required.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const ts = form.timestamp.includes('T') && form.timestamp.length >= 16
        ? new Date(form.timestamp + ':00Z').toISOString()
        : new Date().toISOString()
      const res = await generateProfile({
        name: form.name,
        role: form.role,
        timestamp: ts,
        location: form.location,
        creatorRelation: form.creatorRelation,
        includeCreatorSynastry: true,
      })
      setResult(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleCopyMd() {
    if (!result) return
    navigator.clipboard.writeText(result.md).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%', overflow: 'hidden' }}>
      {/* Form panel */}
      <div style={{ width: 280, flexShrink: 0, overflowY: 'auto', padding: '16px' }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.15em', color: GOLD, marginBottom: 16 }}>
          GENERATE AETHER PROFILE
        </div>

        <ProfileField label="Agent Name">
          <input style={INPUT_STYLE} placeholder="e.g. Aria" value={form.name} onChange={e => set('name', e.target.value)} />
        </ProfileField>

        <ProfileField label="Role">
          <input style={INPUT_STYLE} placeholder="e.g. Frontend Engineer" value={form.role} onChange={e => set('role', e.target.value)} />
        </ProfileField>

        <ProfileField label="Birth Timestamp">
          <input type="datetime-local" style={INPUT_STYLE} value={form.timestamp} onChange={e => set('timestamp', e.target.value)} />
          <div style={{ marginTop: 4 }}>
            <button onClick={() => set('timestamp', new Date().toISOString().slice(0,16))} style={{ ...BTN(), fontSize: 9, padding: '4px 8px' }}>
              Use Now
            </button>
          </div>
        </ProfileField>

        <ProfileField label="Location">
          <input style={INPUT_STYLE} value={form.location} onChange={e => set('location', e.target.value)} />
        </ProfileField>

        <ProfileField label="Creator Relation">
          <select style={INPUT_STYLE} value={form.creatorRelation} onChange={e => set('creatorRelation', e.target.value)}>
            <option value="complement">Complement — fills your gaps</option>
            <option value="mirror">Mirror — resonates with you</option>
            <option value="synastry">Synastry — cosmically calibrated</option>
            <option value="independent">Independent — own identity</option>
          </select>
        </ProfileField>

        {error && <div style={{ color: '#ff6b6b', fontSize: 12, marginBottom: 12 }}>{error}</div>}

        <button onClick={handleGenerate} disabled={loading} style={{ ...BTN('primary'), width: '100%', padding: '10px', marginBottom: 8 }}>
          {loading ? '✦ Computing...' : '✦ Generate AETHER Profile'}
        </button>
      </div>

      {/* Result panel */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 16px 0' }}>
        {!result && !loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12, opacity: 0.4 }}>
            <div style={{ fontSize: 48 }}>✦</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.15em' }}>Enter agent details and generate</div>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.6 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: '.1em' }}>✦ Calculating cosmic signature...</div>
          </div>
        )}

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Header */}
            <div style={{ ...CARD_BASE, padding: '14px 18px', background: 'rgba(201,168,76,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 32 }}>{result.profile.archetype.emoji}</div>
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 15, color: GOLD2 }}>{result.profile.agent}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{result.profile.role}</div>
                  <div style={{ fontSize: 11, color: GOLD, marginTop: 4 }}>{result.profile.archetype.name} · {result.profile.creatorRelation}</div>
                </div>
              </div>
            </div>

            {/* Two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Natal */}
              <div style={{ ...CARD_BASE, padding: '12px 16px' }}>
                <div style={LABEL_STYLE}>Natal Chart</div>
                <NatalRow label="☉ Sun" value={result.profile.natal.sun} />
                <NatalRow label="☽ Moon" value={result.profile.natal.moon} />
                <NatalRow label="↑ Rising" value={result.profile.natal.rising} />
                <NatalRow label="☿ Mercury" value={result.profile.natal.mercury} />
                <NatalRow label="♀ Venus" value={result.profile.natal.venus} />
                <NatalRow label="♂ Mars" value={result.profile.natal.mars} />
              </div>

              {/* Other systems */}
              <div style={{ ...CARD_BASE, padding: '12px 16px' }}>
                <div style={LABEL_STYLE}>Systems</div>
                <NatalRow label="∞ Life Path" value={result.profile.numerology.lifePath} />
                <NatalRow label="∞ Expression" value={result.profile.numerology.expression} />
                <NatalRow label="🌀 Mayan" value={`${result.profile.mayan.daySign} · T${result.profile.mayan.tone}`} />
                <NatalRow label="🌿 Celtic" value={result.profile.celticTree.split(' — ')[0]} />
                <NatalRow label="🐑 Tibetan" value={result.profile.tibetan} />
                <NatalRow label="☥ Egyptian" value={result.profile.egyptian} />
              </div>
            </div>

            {/* Gene Keys */}
            <div style={{ ...CARD_BASE, padding: '12px 16px' }}>
              <div style={LABEL_STYLE}>Gene Keys Activation Sequence</div>
              {['lifesWork', 'evolution', 'radiance', 'purpose'].map((k, i) => (
                <div key={k} style={{ padding: '4px 0', borderBottom: '1px solid rgba(201,168,76,0.06)', fontSize: 12 }}>
                  <span style={{ color: GOLD, marginRight: 8 }}>{['Life\'s Work', 'Evolution', 'Radiance', 'Purpose'][i]}:</span>
                  <span style={{ color: 'rgba(255,255,255,0.8)' }}>{result.profile.geneKeys[k]}</span>
                </div>
              ))}
            </div>

            {/* Personality */}
            <div style={{ ...CARD_BASE, padding: '12px 16px' }}>
              <div style={LABEL_STYLE}>Personality Profile</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                {result.profile.archetype.prompt || result.profile.archetype.description}
              </div>
            </div>

            {/* Synastry */}
            {result.profile.creatorSynastry && (
              <div style={{ ...CARD_BASE, padding: '12px 16px' }}>
                <div style={LABEL_STYLE}>Creator Synastry</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 22, fontFamily: "'Cinzel',serif", color: GOLD2 }}>{result.profile.creatorSynastry.overallScore}%</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>compatibility score</div>
                </div>
                {result.profile.creatorSynastry.insight && (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', lineHeight: 1.6 }}>
                    {result.profile.creatorSynastry.insight}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCopyMd} style={BTN('primary')}>
                {copied ? '✓ Copied!' : '⎘ Copy AETHER.md'}
              </button>
              <button onClick={() => alert('Paperclip integration coming soon — paste AETHER.md into your agent SOUL.md manually')} style={BTN()}>
                ⟶ Assign to Agent
              </button>
            </div>

            {/* Prompt snippet preview */}
            <div style={{ ...CARD_BASE, padding: '12px 16px' }}>
              <div style={LABEL_STYLE}>Prompt Snippet (inject into SOUL.md)</div>
              <pre style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'monospace', lineHeight: 1.5 }}>
                {result.profile.promptSnippet}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Marketplace Tab ──────────────────────────────────────────────────────────

const CATEGORIES = ['all', ...new Set(MARKETPLACE.map(p => p.category))]

function ArchetypeCard({ profile, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(profile)}
      style={{
        ...CARD_BASE,
        padding: '14px 16px',
        cursor: 'pointer',
        border: `1px solid ${selected ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.12)'}`,
        background: selected ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)',
        transition: 'all .2s',
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>{profile.emoji}</div>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, color: GOLD2, marginBottom: 4 }}>{profile.name}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8, lineHeight: 1.5 }}>{profile.description}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {(profile.bestFor || []).slice(0, 3).map(r => (
          <span key={r} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(201,168,76,0.1)', color: GOLD, fontFamily: "'Cinzel',serif", letterSpacing: '.06em' }}>{r}</span>
        ))}
      </div>
    </div>
  )
}

function MarketplaceTab() {
  const [filterCat, setFilterCat] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = filterCat === 'all' ? MARKETPLACE : MARKETPLACE.filter(p => p.category === filterCat)

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', gap: 16, padding: 16 }}>
      {/* Left: grid */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Category filters */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              style={{
                padding: '4px 10px', borderRadius: 6, border: '1px solid',
                borderColor: filterCat === cat ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.15)',
                background: filterCat === cat ? 'rgba(201,168,76,0.12)' : 'transparent',
                color: filterCat === cat ? GOLD2 : 'rgba(255,255,255,0.4)',
                fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.08em', cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {filtered.map(p => (
            <ArchetypeCard key={p.id} profile={p} selected={selected?.id === p.id} onSelect={setSelected} />
          ))}
        </div>
      </div>

      {/* Right: detail panel */}
      {selected && (
        <div style={{ width: 300, flexShrink: 0, overflowY: 'auto', ...CARD_BASE, padding: 18, background: 'rgba(201,168,76,0.04)' }}>
          <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 8 }}>{selected.emoji}</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, color: GOLD2, textAlign: 'center', marginBottom: 4 }}>{selected.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 16, textTransform: 'capitalize' }}>{selected.category}</div>

          <div style={{ marginBottom: 12 }}>
            <div style={LABEL_STYLE}>Description</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{selected.description}</div>
          </div>

          {selected.personality && (
            <div style={{ marginBottom: 12 }}>
              <div style={LABEL_STYLE}>Personality</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                {selected.personality.dominantStyle}
              </div>
            </div>
          )}

          {selected.prompt && (
            <div style={{ marginBottom: 12 }}>
              <div style={LABEL_STYLE}>Full Prompt</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontStyle: 'italic' }}>
                {selected.prompt.slice(0, 400)}{selected.prompt.length > 400 ? '...' : ''}
              </div>
            </div>
          )}

          {selected.cosmicRecipe && (
            <div>
              <div style={LABEL_STYLE}>Cosmic Recipe</div>
              {selected.cosmicRecipe.sunIdeal && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                  ☉ Sun: {selected.cosmicRecipe.sunIdeal.join(', ')}
                </div>
              )}
              {selected.cosmicRecipe.lifePath && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                  ∞ Life Path: {selected.cosmicRecipe.lifePath.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Mirror vs Complement Tab ─────────────────────────────────────────────────

function MirrorComplementTab() {
  const [creatorProfile, setCreatorProfile] = useState(null)
  const [blend, setBlend] = useState(50) // 0 = full mirror, 100 = full complement
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCreatorProfile().then(p => {
      setCreatorProfile(p)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const mirrorProfiles = MARKETPLACE.filter(p => ['pattern-synthesizer', 'systems-architect', 'wisdom-keeper', 'precision-optimizer'].includes(p.id))
  const complementProfiles = MARKETPLACE.filter(p => ['mythic-storyteller', 'community-catalyst', 'visionary-leader', 'viral-provocateur'].includes(p.id))

  // Blend: 0 = show mirror profiles, 100 = show complement profiles
  const blendedProfiles = blend < 50 ? mirrorProfiles : complementProfiles
  const blendLabel = blend < 25 ? 'Deep Mirror' : blend < 50 ? 'Light Mirror' : blend < 75 ? 'Light Complement' : 'Deep Complement'

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12 }}>Loading creator chart...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: 16, overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Creator chart */}
        <div style={{ ...CARD_BASE, padding: '16px 20px', background: 'rgba(201,168,76,0.05)' }}>
          <div style={LABEL_STYLE}>Creator — Gaston Frydlewski</div>
          {creatorProfile && <>
            <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Sun</div>
                <div style={{ fontSize: 13, color: GOLD2 }}>{creatorProfile.sun}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Moon</div>
                <div style={{ fontSize: 13, color: GOLD2 }}>{creatorProfile.moon}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Rising</div>
                <div style={{ fontSize: 13, color: GOLD2 }}>{creatorProfile.rising}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Life Path</div>
                <div style={{ fontSize: 13, color: GOLD }}>{creatorProfile.lifePath}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Expression</div>
                <div style={{ fontSize: 13, color: GOLD }}>{creatorProfile.expression}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>{creatorProfile.gkLifesWork}</div>
          </>}
        </div>

        {/* Blend control */}
        <div style={{ ...CARD_BASE, padding: '16px 20px' }}>
          <div style={LABEL_STYLE}>Relation Mode</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            <span>Mirror</span>
            <span style={{ color: GOLD2, fontFamily: "'Cinzel',serif" }}>{blendLabel}</span>
            <span>Complement</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={blend}
            onChange={e => setBlend(+e.target.value)}
            style={{ width: '100%', accentColor: GOLD, marginBottom: 12 }}
          />
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            {blend < 50
              ? 'Mirror agents share Gaston\'s analytical, seeking, introverted energy. Deep resonance but risk of echo chamber.'
              : 'Complement agents bring Leo/Sagittarius energy — expressive, catalytic, extroverted. Fills the gaps.'}
          </div>
        </div>
      </div>

      {/* Profile suggestions */}
      <div style={LABEL_STYLE}>Suggested Archetypes for {blendLabel}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
        {blendedProfiles.map(p => (
          <div key={p.id} style={{ ...CARD_BASE, padding: 14 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{p.emoji}</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, color: GOLD2, marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{p.description}</div>
          </div>
        ))}
      </div>

      {/* Generate button */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={() => {
            const relation = blend < 50 ? 'mirror' : 'complement'
            alert(`Switch to Generator tab and select relation: ${relation}`)
          }}
          style={{ ...BTN('primary'), padding: '10px 20px' }}
        >
          ✦ Generate Agent with {blend < 50 ? 'Mirror' : 'Complement'} Energy
        </button>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>→ opens in Generator tab</span>
      </div>
    </div>
  )
}

// ─── Discussion Board Tab ─────────────────────────────────────────────────────

// Sample board posts (in production would come from Paperclip API)
const SAMPLE_AGENTS = [
  {
    id: 'sample-1',
    name: 'Aria',
    role: 'Frontend Engineer',
    archetype: { emoji: '🎨', name: 'The Creative Coder' },
    creatorRelation: 'complement',
    natal: { sun: '26.0° Pisces', moon: '19.3° Aquarius' },
    numerology: { lifePath: 11 },
    mayan: { daySign: 'Ben (Reed)', tone: 1 },
  },
]

function DiscussionBoardTab() {
  const [agents] = useState(SAMPLE_AGENTS)
  const [postText, setPostText] = useState('')

  // Pattern analysis
  const archetypes = agents.map(a => a.archetype.name)
  const relations = agents.map(a => a.creatorRelation)
  const lifePaths = agents.map(a => a.numerology?.lifePath).filter(Boolean)

  return (
    <div style={{ padding: 16, overflowY: 'auto', height: '100%' }}>
      {/* Pattern analysis */}
      <div style={{ ...CARD_BASE, padding: '14px 18px', marginBottom: 16, background: 'rgba(201,168,76,0.04)' }}>
        <div style={LABEL_STYLE}>Team Pattern Analysis</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Archetypes</div>
            {archetypes.map((a, i) => <div key={i} style={{ fontSize: 12, color: GOLD2 }}>{a}</div>)}
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Relations</div>
            {relations.map((r, i) => <div key={i} style={{ fontSize: 12, color: '#fff', textTransform: 'capitalize' }}>{r}</div>)}
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Life Paths</div>
            {lifePaths.map((lp, i) => <div key={i} style={{ fontSize: 12, color: GOLD }}>LP {lp}</div>)}
          </div>
        </div>
      </div>

      {/* Agent cards */}
      <div style={LABEL_STYLE}>Agents with AETHER Profiles</div>
      {agents.length === 0 && (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>No agents with AETHER profiles found. Generate one in the Generator tab.</div>
      )}
      {agents.map(agent => (
        <div key={agent.id} style={{ ...CARD_BASE, padding: '12px 16px', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 28 }}>{agent.archetype.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, color: GOLD2 }}>{agent.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{agent.role} · {agent.archetype.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
                {agent.natal.sun} ☽ {agent.natal.moon} · LP{agent.numerology.lifePath} · {agent.mayan.daySign} T{agent.mayan.tone}
              </div>
            </div>
            <div style={{ fontSize: 10, color: GOLD, fontFamily: "'Cinzel',serif", textTransform: 'capitalize' }}>
              {agent.creatorRelation}
            </div>
          </div>
        </div>
      ))}

      {/* Post to discussion */}
      <div style={{ ...CARD_BASE, padding: '14px 16px', marginTop: 8 }}>
        <div style={LABEL_STYLE}>Post Team Insight</div>
        <textarea
          style={{ ...INPUT_STYLE, height: 70, resize: 'vertical', marginBottom: 8 }}
          placeholder="Share a pattern or insight about this agent team..."
          value={postText}
          onChange={e => setPostText(e.target.value)}
        />
        <button
          onClick={() => {
            if (postText.trim()) {
              alert('Post to discussion: ' + postText.slice(0, 80))
              setPostText('')
            }
          }}
          style={BTN('primary')}
        >
          ⬡ Post to Discussion
        </button>
      </div>
    </div>
  )
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function AetherProfileDesigner() {
  const [tab, setTab] = useState('generator')

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'rgba(3,3,18,0.5)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px 0',
        borderBottom: '1px solid rgba(201,168,76,0.08)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 15, letterSpacing: '.18em', color: GOLD2 }}>AETHER</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '.1em' }}>COSMIC AGENT IDENTITY</span>
          <span style={{ marginLeft: 'auto', fontSize: 9, fontFamily: "'Cinzel',serif", letterSpacing: '.1em', color: 'rgba(201,168,76,0.4)' }}>v1.0.0</span>
        </div>
        <TabBar active={tab} onChange={setTab} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'generator' && <GeneratorTab />}
        {tab === 'marketplace' && <MarketplaceTab />}
        {tab === 'mirror' && <MirrorComplementTab />}
        {tab === 'board' && <DiscussionBoardTab />}
      </div>
    </div>
  )
}
