/**
 * AIAgentsPage.jsx — Constellation
 *
 * Displays the user's personal constellation: their primary profile
 * plus all the people they've added. No AI org agents.
 */

import { useState } from 'react'
import { useGolemStore } from '../store/useGolemStore'

const REL_COLORS = {
  partner: '#d43070', spouse: '#f0a03c',
  'ex-spouse': '#a03050', 'ex-partner': '#a03050',
  mother: '#d43070', father: '#40ccdd',
  sibling: '#9050e0', child: '#60b030',
  grandparent: '#40a0cc', 'close-friend': '#6450ff',
  friend: '#8844ff', colleague: '#60a0c8',
  mentor: '#9050e0', 'business-partner': '#c9a84c',
  other: '#888',
}

function getRelColor(p) {
  if (p._isPrimary) return '#c9a84c'
  return REL_COLORS[p.rel] || '#888'
}

function hexToRgb(hex) {
  if (!hex || !hex.startsWith('#')) return '201,168,76'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

function profileSummary(p) {
  const parts = []
  if (p.sign && p.sign !== '?') parts.push(`${p.sign} Sun`)
  if (p.moon && p.moon !== '?') parts.push(`${p.moon} Moon`)
  if (p.asc && p.asc !== '?') parts.push(`${p.asc} Rising`)
  if (p.hdType && p.hdType !== '?') parts.push(p.hdType)
  if (p.lifePath && p.lifePath !== '?') parts.push(`LP ${p.lifePath}`)
  if (p.enneagramType) parts.push(`E${p.enneagramType}`)
  if (p.mbtiType) parts.push(p.mbtiType)
  return parts.join(' · ') || null
}

function ProfileCard({ p, index, selected, onSelect }) {
  const color = getRelColor(p)
  const isSelected = selected === index
  const summary = profileSummary(p)

  return (
    <div
      onClick={() => onSelect(isSelected ? null : index)}
      style={{
        padding: '16px 18px', borderRadius: 12, cursor: 'pointer',
        background: isSelected ? `rgba(${hexToRgb(color)},.08)` : 'var(--card, #111)',
        border: `1px solid ${isSelected ? color : 'var(--border, #222)'}`,
        transition: 'all .15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: summary ? 10 : 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `rgba(${hexToRgb(color)},.12)`,
          border: `1.5px solid ${color}`, fontSize: 18, flexShrink: 0,
        }}>
          {p.emoji || (p._isPrimary ? '✦' : '👤')}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {p.name}
          </div>
          <div style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 1 }}>
            {p._isPrimary ? 'You' : (p.rel || 'other')}
          </div>
        </div>
      </div>
      {summary && (
        <div style={{ fontSize: 11, color: 'var(--muted-foreground, #777)', lineHeight: 1.65 }}>
          {summary}
        </div>
      )}
    </div>
  )
}

function ProfileDetail({ p, onClose }) {
  const color = getRelColor(p)
  const rows = [
    { label: 'Sun',        value: p.sign !== '?' ? p.sign : null },
    { label: 'Moon',       value: p.moon !== '?' ? p.moon : null },
    { label: 'Rising',     value: p.asc !== '?' ? p.asc : null },
    { label: 'HD Type',    value: p.hdType !== '?' ? p.hdType : null },
    { label: 'HD Profile', value: p.hdProfile !== '?' ? p.hdProfile : null },
    { label: 'HD Auth',    value: p.hdAuth !== '?' ? p.hdAuth : null },
    { label: 'Life Path',  value: p.lifePath !== '?' ? p.lifePath : null },
    { label: 'Gene Keys',  value: p.crossGK !== '?' ? p.crossGK : null },
    { label: 'Enneagram',  value: p.enneagramType ? `Type ${p.enneagramType}${p.enneagramWing ? `w${p.enneagramWing}` : ''}` : null },
    { label: 'MBTI',       value: p.mbtiType || null },
    { label: 'Dosha',      value: p.doshaType || null },
    { label: 'Archetype',  value: p.archetypeType || null },
    { label: 'Love Lang',  value: p.loveLanguage || null },
  ].filter(r => r.value)

  return (
    <div style={{
      width: 280, borderLeft: '1px solid var(--border, #222)',
      padding: '20px', overflowY: 'auto', flexShrink: 0,
      background: 'var(--background)', display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gold, #c9a84c)' }}>
          Profile
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', fontSize: 20, padding: 0, lineHeight: 1 }}>×</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `rgba(${hexToRgb(color)},.12)`, border: `2px solid ${color}`, fontSize: 24,
        }}>
          {p.emoji || '✦'}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--foreground)' }}>{p.name}</div>
          <div style={{ fontSize: 11, color, textTransform: 'uppercase', letterSpacing: '.07em', marginTop: 2 }}>
            {p._isPrimary ? 'You' : (p.rel || 'other')}
          </div>
          {p.dob && (
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>
              {p.dob}{p.pob ? ` · ${p.pob}` : ''}
            </div>
          )}
        </div>
      </div>

      {rows.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map(r => (
            <div key={r.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 10px', borderRadius: 6, background: 'rgba(255,255,255,.03)',
            }}>
              <span style={{ fontSize: 10, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{r.label}</span>
              <span style={{ fontSize: 12, color: 'var(--foreground)', fontWeight: 500 }}>{r.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center', padding: '20px 0' }}>
          No profile data yet
        </div>
      )}
    </div>
  )
}

export default function AIAgentsPage() {
  const primaryProfile = useGolemStore(s => s.primaryProfile)
  const people = useGolemStore(s => s.people) || []
  const setActiveDetail = useGolemStore(s => s.setActiveDetail)
  const [selected, setSelected] = useState(null)

  const all = [
    { ...primaryProfile, _isPrimary: true },
    ...people,
  ].filter(p => p.name)

  if (all.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', gap: 16, padding: 40, textAlign: 'center',
      }}>
        <div style={{ fontSize: 48 }}>✦</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold, #c9a84c)' }}>
          Constellation
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', maxWidth: 360, lineHeight: 1.85 }}>
          Complete your profile and add people to build your personal constellation.
        </div>
        <button
          onClick={() => setActiveDetail('profile')}
          style={{
            padding: '8px 22px', borderRadius: 8,
            border: '1px solid rgba(201,168,76,.4)', background: 'rgba(201,168,76,.08)',
            color: 'var(--gold, #c9a84c)', cursor: 'pointer',
            fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.1em',
          }}
        >
          Open Profiles
        </button>
      </div>
    )
  }

  const selectedProfile = selected !== null ? all[selected] : null

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gold, #c9a84c)', marginBottom: 4 }}>
          Constellation
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 20 }}>
          {all.length} {all.length === 1 ? 'profile' : 'profiles'} · your personal constellation
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {all.map((p, i) => (
            <ProfileCard key={p.id || i} p={p} index={i} selected={selected} onSelect={setSelected} />
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selectedProfile && (
        <ProfileDetail p={selectedProfile} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
