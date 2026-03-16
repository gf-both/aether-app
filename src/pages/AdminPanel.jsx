import { useRef, useEffect, useState } from 'react'
import { useAboveInsideStore } from '../store/useAboveInsideStore'

const ADMIN_EMAIL = 'gf@both.ventures'

// ─── Architecture Diagram ───────────────────────────────────────────────────

function ArchitectureDiagram() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W = canvas.width / dpr
    const H = canvas.height / dpr
    const ctx = canvas.getContext('2d')
    ctx.save()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    const GOLD   = '#c9a84c'
    const AQUA   = '#40ccdd'
    const VIOLET = '#9050e0'
    const ROSE   = '#d43070'
    const LIME   = '#60c060'
    const MUTED  = 'rgba(255,255,255,.5)'

    const layers = [
      { y: 20,  h: 70,  label: 'USER PROFILE',              color: GOLD,   sub: 'Birth Data · Self-Knowledge · People · Profiles' },
      { y: 120, h: 200, label: 'CALCULATION ENGINES (20)',   color: AQUA,   sub: null },
      { y: 350, h: 80,  label: 'AI INTELLIGENCE LAYER',      color: VIOLET, sub: 'Golem · AI Guide · Wendy · Compatibility Engine' },
      { y: 460, h: 70,  label: 'PRODUCT SURFACES',           color: LIME,   sub: 'Dashboard · Dating · Career · Timeline · Synastry · AI Agents' },
    ]

    const padding = 30

    layers.forEach(layer => {
      ctx.fillStyle = layer.color + '10'
      ctx.strokeStyle = layer.color + '40'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(padding, layer.y, W - padding * 2, layer.h, 8)
      else ctx.rect(padding, layer.y, W - padding * 2, layer.h)
      ctx.fill()
      ctx.stroke()

      ctx.font = `bold 11px 'Cinzel', serif`
      ctx.fillStyle = layer.color
      ctx.textAlign = 'left'
      ctx.fillText(layer.label, padding + 12, layer.y + 18)

      if (layer.sub) {
        ctx.font = `10px ui-sans-serif`
        ctx.fillStyle = MUTED
        ctx.fillText(layer.sub, padding + 12, layer.y + 34)
      }
    })

    const engines = [
      // Row 1: Astronomical
      { name: 'Natal',      col: GOLD,   x: 0.08 },
      { name: 'Transits',   col: GOLD,   x: 0.18 },
      { name: 'Vedic',      col: GOLD,   x: 0.28 },
      { name: 'Synastry',   col: GOLD,   x: 0.38 },
      { name: 'Arabic',     col: GOLD,   x: 0.48 },
      { name: 'Sabian',     col: GOLD,   x: 0.58 },
      { name: 'Fixed★',    col: GOLD,   x: 0.68 },
      { name: 'Biorhythm',  col: GOLD,   x: 0.80 },
      // Row 2: Symbolic
      { name: 'Numerology', col: AQUA,   x: 0.08 },
      { name: 'Gematria',   col: AQUA,   x: 0.20 },
      { name: 'Mayan',      col: AQUA,   x: 0.31 },
      { name: 'Chinese',    col: AQUA,   x: 0.42 },
      { name: 'Egyptian',   col: AQUA,   x: 0.53 },
      { name: 'Tarot',      col: AQUA,   x: 0.63 },
      { name: 'Celtic',     col: AQUA,   x: 0.72 },
      { name: 'Tibetan',    col: AQUA,   x: 0.82 },
      // Row 3: Energy + Pattern
      { name: 'HD',         col: VIOLET, x: 0.08 },
      { name: 'Gene Keys',  col: VIOLET, x: 0.18 },
      { name: 'Kabbalah',   col: VIOLET, x: 0.30 },
      { name: 'Enneagram',  col: VIOLET, x: 0.43 },
      { name: 'MBTI',       col: VIOLET, x: 0.54 },
      { name: 'Dosha',      col: VIOLET, x: 0.63 },
      { name: 'Archetype',  col: VIOLET, x: 0.72 },
      { name: 'Patterns',   col: ROSE,   x: 0.84 },
    ]

    const eLayerY = 130
    const rowH = 55
    const rowEngines = [engines.slice(0, 8), engines.slice(8, 16), engines.slice(16)]

    rowEngines.forEach((row, ri) => {
      row.forEach(eng => {
        const ex = padding + eng.x * (W - padding * 2)
        const ey = eLayerY + ri * rowH + 20

        ctx.beginPath()
        ctx.arc(ex, ey, 14, 0, Math.PI * 2)
        ctx.fillStyle = eng.col + '20'
        ctx.fill()
        ctx.strokeStyle = eng.col + '60'
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.font = `7px ui-sans-serif`
        ctx.fillStyle = eng.col
        ctx.textAlign = 'center'
        ctx.fillText(eng.name, ex, ey + 22)
      })
    })

    const arrowX = W / 2
    ;[{ from: 88, to: 118 }, { from: 318, to: 348 }, { from: 428, to: 458 }].forEach(({ from, to }) => {
      ctx.beginPath()
      ctx.moveTo(arrowX, from)
      ctx.lineTo(arrowX, to)
      ctx.strokeStyle = 'rgba(201,168,76,.3)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 3])
      ctx.stroke()
      ctx.setLineDash([])

      ctx.beginPath()
      ctx.moveTo(arrowX, to)
      ctx.lineTo(arrowX - 5, to - 8)
      ctx.lineTo(arrowX + 5, to - 8)
      ctx.closePath()
      ctx.fillStyle = 'rgba(201,168,76,.4)'
      ctx.fill()
    })

    ctx.restore()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={560}
      style={{ display: 'block', width: '100%', maxWidth: 800, height: 'auto' }}
    />
  )
}

// ─── Engines Data ────────────────────────────────────────────────────────────

const ENGINES = [
  { name: 'natalEngine',           status: '✅', input: 'day/month/year/hour/minute/lat/lon/tz',     output: 'planets, houses, aspects, angles',                                    notes: 'Placidus houses, 12 planets + Chiron' },
  { name: 'hdEngine',              status: '✅', input: 'dateOfBirth/timeOfBirth/utcOffset',         output: 'type, authority, profile, channels, centers, gates',                  notes: 'I Ching gate calculation' },
  { name: 'geneKeysEngine',        status: '✅', input: 'day/month/year/hour/minute/timezone',       output: '4 spheres, SPHERES array, GK_LIST',                                   notes: "Life's Work, Evolution, Radiance, Purpose" },
  { name: 'kabbalahEngine',        status: '✅', input: 'dob/name/hour/minute/lat/lon/tz',           output: '10 sephiroth scores, paths, pillars',                                  notes: '' },
  { name: 'mayanEngine',           status: '✅', input: 'day/month/year',                            output: 'Tzolkin (sign+tone+kin), Haab, Long Count',                            notes: 'GMT correlation 584344 (Dreamspell)' },
  { name: 'numerologyEngine',      status: '✅', input: 'dob/fullName',                              output: 'LP, Expression, SoulUrge, Birthday, Personality, Maturity, Pinnacles, Challenges', notes: 'Pythagorean + Chaldean' },
  { name: 'chineseEngine',         status: '✅', input: 'dob/tob',                                   output: 'animal, element, yinYang, 4 pillars',                                  notes: 'BaZi, CNY-aware' },
  { name: 'egyptianEngine',        status: '✅', input: 'month/day',                                 output: 'Egyptian sign + deity',                                               notes: 'Date-range lookup' },
  { name: 'gematriaEngine',        status: '✅', input: 'fullName/day/month/year',                   output: 'Hebrew/Pythagorean/Chaldean/Ordinal totals, letter breakdown',          notes: '' },
  { name: 'synastryEngine',        status: '✅', input: 'two profiles',                              output: 'cross aspects, composite, compatibility %',                            notes: '' },
  { name: 'sabianEngine',          status: '✅', input: 'natal chart',                               output: '360 Sabian Symbols per degree',                                        notes: '' },
  { name: 'arabicPartsEngine',     status: '✅', input: 'natal chart',                               output: '10 Lots (Fortune, Spirit, Love...)',                                   notes: '' },
  { name: 'vedicEngine',           status: '✅', input: 'day/month/year/hour/minute/lat/lon/tz',     output: 'Lahiri ayanamsa, nakshatras, Vimshottari Dasha',                       notes: '' },
  { name: 'patternEngine',         status: '✅', input: 'full profile',                              output: 'cross-framework alignments, patterns',                                 notes: '' },
  { name: 'compatibilityEngine',   status: '✅', input: 'two profiles',                              output: 'score 0-100, breakdown, match story',                                  notes: '6 dimensions, weighted' },
  { name: 'biorhythmEngine',       status: '✅', input: 'dob/date',                                  output: 'physical/emotional/intellectual cycles',                               notes: '23/28/33 day cycles' },
  { name: 'tarotEngine',           status: '✅', input: 'dob',                                       output: 'Major Arcana birth cards',                                             notes: '' },
  { name: 'celticTreeEngine',      status: '✅', input: 'month/day',                                 output: 'Ogham tree sign',                                                      notes: '13 months' },
  { name: 'tibetanEngine',         status: '⚠️', input: 'dob',                                       output: 'Losar calendar, mewa square',                                          notes: 'Basic implementation' },
  { name: 'fixedStarsEngine',      status: '✅', input: 'natal chart',                               output: '20 major star conjunctions',                                           notes: '1.5° orb' },
  { name: 'aetherEngine',          status: '✅', input: 'creation timestamp + location',             output: 'Full AETHER profile for AI agents',                                    notes: 'AETHER identity system' },
  { name: 'careerAlignmentEngine', status: '✅', input: 'profile',                                   output: 'role recommendations by HD+LP',                                        notes: '' },
]

// ─── Features Data ───────────────────────────────────────────────────────────

const FEATURES = [
  { section: 'Dashboard',            features: ['Grid layout', 'Bento layout', 'Focus layout', 'Magazine layout', 'Widget manager', 'Drag-drop reorder', 'Row grouping'],                   status: '✅' },
  { section: 'Golem',                features: ['Clone', 'Complement', 'Antagonist', 'Custom golems', 'Profile editor', 'Claude AI wired', 'Right profile panel'],                          status: '✅' },
  { section: 'Dating',               features: ['Clone matching', 'Compatibility scores', 'Match Story', 'Preferences tab', 'Geolocation toggle', 'IG/LinkedIn fields', 'Real engine wired'], status: '✅' },
  { section: 'AI Agents',            features: ['27 agent roster', 'Mini natal chart', 'Constellation map', 'AETHER profiles'],                                                              status: '✅' },
  { section: 'Wendy',                features: ['OCI score', '5 diagnoses', 'Weekly voice report', 'Team constellation'],                                                                    status: '✅' },
  { section: 'Career',               features: ['HD work style', 'Best roles', 'Ideal environment', 'Life Path theme'],                                                                      status: '✅' },
  { section: 'Settings',             features: ['Layout switcher', 'Theme switcher', 'Widget manager', 'Data reset'],                                                                        status: '✅' },
  { section: 'Profiles',             features: ['Primary profile', 'People/constellation', 'All self-knowledge fields', 'Supabase sync'],                                                    status: '✅' },
  { section: 'Scheduling Bot',       features: ['Google Calendar integration', 'Google Maps location', 'HD-aware timing', 'Public booking page'],                                            status: '📋 Specced' },
  { section: 'Clone Dating Backend', features: ['Real matching queue', 'Supabase clone_matches table', 'Production API'],                                                                    status: '📋 Specced' },
  { section: 'Supabase Auth',        features: ['Signup/Login', 'Google OAuth', 'Protected routes', 'DB sync'],                                                                              status: '🔧 In Progress' },
  { section: 'Stripe',               features: ['Explorer tier $1.99', 'Practitioner $19.99', 'Checkout', 'Feature gating'],                                                                 status: '⏳ Pending' },
]

// ─── Health Data ─────────────────────────────────────────────────────────────

const HEALTH_CHECKS = [
  { label: 'Build',                status: 'pass', detail: 'npx vite build ✓' },
  { label: 'Widget Health Check',  status: 'pass', detail: 'No empty deps, no hardcoded data' },
  { label: 'Profile Switching',    status: 'pass', detail: 'useActiveProfile() hook deployed' },
  { label: 'Engine Tests (14)',    status: 'pass', detail: '3 profiles × 14 engines = all different' },
  { label: 'Mayan Calendar',       status: 'pass', detail: 'GMT 584344 — Chicchan/Tone 10 verified' },
  { label: 'Golem AI',             status: 'warn', detail: 'Needs VITE_ANTHROPIC_API_KEY in .env.local' },
  { label: 'Google OAuth',         status: 'warn', detail: 'Needs Google Cloud Console setup' },
  { label: 'Supabase Auth',        status: 'warn', detail: 'Tables created, auth not fully wired' },
  { label: 'Knowledge Base',       status: 'warn', detail: 'KB files building now' },
]

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  page: {
    padding: '24px',
    maxWidth: 1100,
    margin: '0 auto',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    color: 'rgba(255,255,255,0.87)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: '#c9a84c',
    margin: 0,
  },
  badge: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.1em',
    background: 'rgba(201,168,76,0.15)',
    border: '1px solid rgba(201,168,76,0.3)',
    color: '#c9a84c',
    borderRadius: 4,
    padding: '2px 8px',
  },
  tabs: {
    display: 'flex',
    gap: 4,
    marginBottom: 24,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: 0,
  },
  tab: (active) => ({
    padding: '8px 18px',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.06em',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: active ? '#c9a84c' : 'rgba(255,255,255,0.4)',
    borderBottom: active ? '2px solid #c9a84c' : '2px solid transparent',
    marginBottom: -1,
    transition: 'color 0.15s',
  }),
  panel: {
    minHeight: 400,
  },
  // Engines tab
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12,
  },
  th: {
    textAlign: 'left',
    padding: '8px 12px',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: 'rgba(255,255,255,0.4)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  td: {
    padding: '9px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    verticalAlign: 'top',
    lineHeight: 1.5,
  },
  engineName: {
    fontFamily: 'ui-monospace, monospace',
    fontSize: 11,
    color: '#40ccdd',
  },
  // Features tab
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 12,
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 8,
    padding: '14px 16px',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.8,
  },
  featureDot: {
    color: 'rgba(255,255,255,0.2)',
    marginRight: 6,
  },
  // Health tab
  healthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 10,
  },
  healthCard: (status) => ({
    background: status === 'pass' ? 'rgba(96,192,96,0.05)' : 'rgba(255,180,0,0.05)',
    border: `1px solid ${status === 'pass' ? 'rgba(96,192,96,0.2)' : 'rgba(255,180,0,0.2)'}`,
    borderRadius: 8,
    padding: '12px 14px',
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  }),
  healthDot: (status) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: status === 'pass' ? '#60c060' : '#ffb400',
    marginTop: 4,
    flexShrink: 0,
    boxShadow: `0 0 6px ${status === 'pass' ? '#60c060' : '#ffb400'}`,
  }),
  healthLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  healthDetail: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  // Access denied
  denied: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    gap: 12,
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14,
  },
  statusBadge: (s) => ({
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.08em',
    padding: '2px 8px',
    borderRadius: 4,
    background: s === '✅'
      ? 'rgba(96,192,96,0.12)'
      : s.includes('Progress')
        ? 'rgba(64,204,221,0.12)'
        : s.includes('Specced')
          ? 'rgba(201,168,76,0.12)'
          : 'rgba(255,180,0,0.1)',
    color: s === '✅'
      ? '#60c060'
      : s.includes('Progress')
        ? '#40ccdd'
        : s.includes('Specced')
          ? '#c9a84c'
          : '#ffb400',
    border: `1px solid ${s === '✅'
      ? 'rgba(96,192,96,0.25)'
      : s.includes('Progress')
        ? 'rgba(64,204,221,0.25)'
        : s.includes('Specced')
          ? 'rgba(201,168,76,0.25)'
          : 'rgba(255,180,0,0.25)'}`,
  }),
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('architecture')
  const userEmail = useAboveInsideStore((s) => s.user?.email || '')

  if (userEmail && userEmail.toLowerCase() !== ADMIN_EMAIL) {
    return (
      <div style={s.denied}>
        <span style={{ fontSize: 32 }}>🔒</span>
        <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Access Denied</span>
        <span style={{ fontSize: 12 }}>This panel is restricted to admin users.</span>
      </div>
    )
  }

  const TABS = [
    { id: 'architecture', label: '⬡ Architecture' },
    { id: 'engines',      label: '⚙ Engines' },
    { id: 'features',     label: '✦ Features' },
    { id: 'health',       label: '💓 Health' },
  ]

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Admin Panel</h1>
        <span style={s.badge}>INTERNAL</span>
      </div>

      <div style={s.tabs}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            style={s.tab(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={s.panel}>
        {activeTab === 'architecture' && <TabArchitecture />}
        {activeTab === 'engines'      && <TabEngines />}
        {activeTab === 'features'     && <TabFeatures />}
        {activeTab === 'health'       && <TabHealth />}
      </div>
    </div>
  )
}

// ─── Tab: Architecture ────────────────────────────────────────────────────────

function TabArchitecture() {
  return (
    <div>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
        Full product architecture — user data flows down through 20 calculation engines,
        into the AI intelligence layer, then surfaces across all product pages.
      </p>
      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 16, display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
        <ArchitectureDiagram />
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 11 }}>
        {[
          { col: '#c9a84c', label: 'Astronomical' },
          { col: '#40ccdd', label: 'Symbolic' },
          { col: '#9050e0', label: 'Esoteric / Personality' },
          { col: '#d43070', label: 'Pattern' },
          { col: '#60c060', label: 'Product Surfaces' },
        ].map(({ col, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: col, opacity: 0.7 }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Engines ─────────────────────────────────────────────────────────────

function TabEngines() {
  const pass = ENGINES.filter(e => e.status === '✅').length
  const warn = ENGINES.filter(e => e.status !== '✅').length

  return (
    <div>
      <div style={{ marginBottom: 14, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
        <span style={{ color: '#60c060', fontWeight: 700 }}>{pass} active</span>
        {warn > 0 && <> · <span style={{ color: '#ffb400', fontWeight: 700 }}>{warn} partial</span></>}
        {' '}· {ENGINES.length} engines total
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>ENGINE</th>
              <th style={s.th}>STATUS</th>
              <th style={s.th}>INPUT</th>
              <th style={s.th}>OUTPUT</th>
              <th style={s.th}>NOTES</th>
            </tr>
          </thead>
          <tbody>
            {ENGINES.map(eng => (
              <tr key={eng.name} style={{ ':hover': { background: 'rgba(255,255,255,0.02)' } }}>
                <td style={{ ...s.td, ...s.engineName }}>{eng.name}</td>
                <td style={s.td}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: eng.status === '✅' ? '#60c060' : '#ffb400',
                  }}>
                    {eng.status}
                  </span>
                </td>
                <td style={{ ...s.td, fontSize: 11, color: 'rgba(255,255,255,0.5)', maxWidth: 200 }}>{eng.input}</td>
                <td style={{ ...s.td, fontSize: 11, color: 'rgba(255,255,255,0.7)', maxWidth: 240 }}>{eng.output}</td>
                <td style={{ ...s.td, fontSize: 11, color: 'rgba(255,255,255,0.35)', maxWidth: 180 }}>{eng.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Tab: Features ────────────────────────────────────────────────────────────

function TabFeatures() {
  const done    = FEATURES.filter(f => f.status === '✅').length
  const pending = FEATURES.filter(f => f.status !== '✅').length

  return (
    <div>
      <div style={{ marginBottom: 14, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
        <span style={{ color: '#60c060', fontWeight: 700 }}>{done} complete</span>
        {' · '}
        <span style={{ color: '#ffb400', fontWeight: 700 }}>{pending} in-flight</span>
        {' '}· {FEATURES.length} sections total
      </div>
      <div style={s.grid}>
        {FEATURES.map(f => (
          <div key={f.section} style={s.card}>
            <div style={s.cardTitle}>
              <span style={{ color: 'rgba(255,255,255,0.85)' }}>{f.section}</span>
              <span style={s.statusBadge(f.status)}>{f.status}</span>
            </div>
            <ul style={s.featureList}>
              {f.features.map(feat => (
                <li key={feat}>
                  <span style={s.featureDot}>·</span>
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Health ──────────────────────────────────────────────────────────────

function TabHealth() {
  const passing = HEALTH_CHECKS.filter(c => c.status === 'pass').length
  const warning = HEALTH_CHECKS.filter(c => c.status === 'warn').length

  return (
    <div>
      <div style={{ marginBottom: 14, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
        <span style={{ color: '#60c060', fontWeight: 700 }}>{passing} passing</span>
        {' · '}
        <span style={{ color: '#ffb400', fontWeight: 700 }}>{warning} warnings</span>
      </div>
      <div style={s.healthGrid}>
        {HEALTH_CHECKS.map(check => (
          <div key={check.label} style={s.healthCard(check.status)}>
            <div style={s.healthDot(check.status)} />
            <div>
              <div style={s.healthLabel}>{check.label}</div>
              <div style={s.healthDetail}>{check.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
