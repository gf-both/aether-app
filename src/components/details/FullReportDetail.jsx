import { useState, useCallback, useMemo } from 'react'
import { useGolemStore } from '../../store/useGolemStore'
import { useComputedProfile as useActiveProfile } from '../../hooks/useActiveProfile'

/* ── Engine imports (all 22+ systems) ─────────────────────────── */
import { getNatalChart } from '../../engines/natalEngine'
import { computeHDChart } from '../../engines/hdEngine'
import { getKabbalahProfile, profileToKabArgs } from '../../engines/kabbalahEngine'
import { getNumerologyProfileFromDob } from '../../engines/numerologyEngine'
import { computeGeneKeysData } from '../../data/geneKeysData'
import { computeFullProfile as computeMayanProfile } from '../../data/mayanData'
import { getChineseProfileFromDob } from '../../engines/chineseEngine'
import { getEgyptianSign } from '../../engines/egyptianEngine'
import { getTibetanProfile } from '../../engines/tibetanEngine'
import { getVedicChart } from '../../engines/vedicEngine'
import { getGematriaProfile } from '../../engines/gematriaEngine'
import { computeCycleProfile } from '../../engines/cycleEngine'
import { getRecommendedRituals } from '../../engines/ritualEngine'
import { getCareerAlignment } from '../../engines/careerAlignmentEngine'

/* ── Styles ───────────────────────────────────────────────────── */
const S = {
  panel: {
    width: '100%', height: '100%', overflowY: 'auto', padding: '24px 28px',
    display: 'flex', flexDirection: 'column', gap: 24,
    background: 'var(--card)', color: 'var(--foreground)',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: 'var(--muted-foreground)', paddingBottom: 8,
    borderBottom: '1px solid var(--accent)', marginBottom: 8,
  },
  glass: (extra = {}) => ({
    background: 'var(--secondary)', border: '1px solid var(--border)',
    borderRadius: 12, padding: 16, ...extra,
  }),
  badge: (color) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: 10,
    fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.1em',
    textTransform: 'uppercase', background: color + '20', border: `1px solid ${color}44`,
    color: color, flexShrink: 0,
  }),
  btn: (active, color = '#c9a84c') => ({
    padding: '12px 28px', borderRadius: 8, cursor: active ? 'pointer' : 'not-allowed',
    fontSize: 13, fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: '.1em',
    textTransform: 'uppercase', transition: 'all .15s',
    background: active ? color : '#1a1a2e',
    border: `2px solid ${active ? color : '#333'}`,
    color: active ? '#000' : '#555',
    boxShadow: active ? `0 0 16px ${color}55` : 'none',
    opacity: active ? 1 : 0.5,
  }),
  checkRow: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0',
    cursor: 'pointer', fontSize: 13,
  },
}

const GOLD = '#c9a84c'

/* ── All report sections with their data sources ──────────────── */
const ALL_SECTIONS = [
  { id: 'identity', label: 'Identity Agent Synthesis', icon: '⬡', storeKey: 'identityResult', category: 'AI Agents' },
  { id: 'natal', label: 'Natal Astrology', icon: '☉', engine: 'natal', category: 'Core Structural' },
  { id: 'hd', label: 'Human Design', icon: '△', engine: 'hd', category: 'Core Structural' },
  { id: 'kab', label: 'Kabbalah', icon: '✡', engine: 'kab', category: 'Core Structural' },
  { id: 'gk', label: 'Gene Keys', icon: '⬢', engine: 'gk', category: 'Core Structural' },
  { id: 'num', label: 'Numerology', icon: '∞', engine: 'num', category: 'Sacred Mathematics' },
  { id: 'gem', label: 'Gematria', icon: 'א', engine: 'gem', category: 'Sacred Mathematics' },
  { id: 'mayan', label: 'Mayan Calendar', icon: '⊿', engine: 'mayan', category: 'Archetypal' },
  { id: 'chi', label: 'Chinese Zodiac', icon: '☰', engine: 'chi', category: 'Archetypal' },
  { id: 'egyptian', label: 'Egyptian Astrology', icon: '𓂀', engine: 'egyptian', category: 'Archetypal' },
  { id: 'vedic', label: 'Vedic Astrology', icon: 'ॐ', engine: 'vedic', category: 'Eastern Wisdom' },
  { id: 'tibetan', label: 'Tibetan Astrology', icon: '☸', engine: 'tibetan', category: 'Eastern Wisdom' },
  { id: 'enn', label: 'Enneagram', icon: '⊘', storeKey: 'enneagramType', category: 'Self Knowledge' },
  { id: 'mbti', label: 'Myers-Briggs', icon: '⧫', storeKey: 'mbtiType', category: 'Self Knowledge' },
  { id: 'dosha', label: 'Ayurvedic Dosha', icon: '❦', storeKey: 'doshaType', category: 'Self Knowledge' },
  { id: 'archetype', label: 'Archetype', icon: '⊞', storeKey: 'archetypeType', category: 'Self Knowledge' },
  { id: 'lovelang', label: 'Love Language', icon: '♡', storeKey: 'loveLanguage', category: 'Self Knowledge' },
  { id: 'career', label: 'Career Alignment', icon: '⎈', engine: 'career', category: 'YOU' },
  { id: 'cycle', label: 'Cycle & Moon', icon: '◑', engine: 'cycle', category: 'Self Knowledge' },
  { id: 'palm', label: 'Palm Reading', icon: '✋', storeKey: 'palmReading', category: 'Self Knowledge' },
  { id: 'ritual', label: 'Rituals', icon: '◬', engine: 'ritual', category: 'YOU' },
]

/* ── Compute section data ─────────────────────────────────────── */
function computeSectionData(section, profile, store) {
  try {
    if (section.storeKey) {
      // Quiz-based or AI-generated data from store
      if (section.storeKey === 'identityResult') {
        const result = store.identityResults?.[profile?.name] || store.identityResult
        return result || null
      }
      if (section.storeKey === 'palmReading') return store.palmReading || null
      // For quiz types, check the profile
      const val = profile?.[section.storeKey]
      return val ? { type: val, source: 'profile' } : null
    }

    if (!section.engine) return null

    const dob = profile?.dob
    if (!dob && section.engine !== 'ritual') return null

    switch (section.engine) {
      case 'natal': {
        if (!profile?.birthTime || !profile?.birthLat) return { partial: true, note: 'Birth time and location needed for full natal chart' }
        const d = new Date(dob)
        const [hh, mm] = (profile.birthTime || '12:00').split(':').map(Number)
        return getNatalChart({ day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear(), hour: hh, minute: mm, lat: profile.birthLat, lon: profile.birthLng || profile.birthLon, timezone: profile.timezone || 0 }) || null
      }
      case 'hd': {
        if (!profile?.birthTime || !profile?.birthLat) return { partial: true, note: 'Birth time and location needed' }
        try { return computeHDChart({ dateOfBirth: dob, timeOfBirth: profile.birthTime, utcOffset: profile.timezone || 0 }) || null }
        catch { return null }
      }
      case 'kab': {
        try {
          const kabArgs = profileToKabArgs(profile)
          return getKabbalahProfile(kabArgs) || null
        } catch { return null }
      }
      case 'num': {
        return getNumerologyProfileFromDob(dob) || null
      }
      case 'gk': {
        return computeGeneKeysData(dob) || null
      }
      case 'mayan': {
        const d = new Date(dob)
        return computeMayanProfile(d.getFullYear(), d.getMonth() + 1, d.getDate()) || null
      }
      case 'chi': {
        return getChineseProfileFromDob(dob) || null
      }
      case 'egyptian': {
        const de = new Date(dob)
        return getEgyptianSign(de.getDate(), de.getMonth() + 1) || null
      }
      case 'tibetan': {
        const dt = new Date(dob)
        return getTibetanProfile({ day: dt.getDate(), month: dt.getMonth() + 1, year: dt.getFullYear(), gender: profile?.gender }) || null
      }
      case 'vedic': {
        if (!profile?.birthTime || !profile?.birthLat) return { partial: true, note: 'Birth time and location needed' }
        const dv = new Date(dob)
        const [hvv, mvv] = (profile.birthTime || '12:00').split(':').map(Number)
        return getVedicChart({ day: dv.getDate(), month: dv.getMonth() + 1, year: dv.getFullYear(), hour: hvv, minute: mvv, lat: profile.birthLat, lon: profile.birthLng || profile.birthLon, timezone: profile.timezone || 0 }) || null
      }
      case 'gem': {
        const d2 = new Date(dob)
        return getGematriaProfile({ fullName: profile?.name || '', day: d2.getDate(), month: d2.getMonth() + 1, year: d2.getFullYear() }) || null
      }
      case 'cycle': {
        try { return computeCycleProfile(dob) || null }
        catch { return null }
      }
      case 'career': {
        return getCareerAlignment(profile) || null
      }
      case 'ritual': {
        return getRecommendedRituals(profile) || null
      }
      default: return null
    }
  } catch (e) {
    console.warn(`Error computing ${section.id}:`, e)
    return null
  }
}

/* ── Format section data to readable text ─────────────────────── */
function formatSectionHTML(section, data) {
  if (!data) return '<p class="empty">Not yet computed — run this section in GOLEM to populate.</p>'
  if (data.partial) return `<p class="partial">${data.note || 'Partial data — additional input needed.'}</p>`

  // Generic object-to-HTML renderer
  function renderObj(obj, depth = 0) {
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
      return `<span>${String(obj)}</span>`
    }
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '<span>—</span>'
      return '<ul>' + obj.map(item =>
        typeof item === 'object' && item !== null
          ? '<li>' + renderObj(item, depth + 1) + '</li>'
          : `<li>${String(item)}</li>`
      ).join('') + '</ul>'
    }
    if (typeof obj === 'object' && obj !== null) {
      const entries = Object.entries(obj).filter(([k]) => !k.startsWith('_'))
      if (entries.length === 0) return '<span>—</span>'
      // For top level, use a definition-list style
      return '<div class="obj-grid">' + entries.map(([k, v]) => {
        const label = k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()
        const val = typeof v === 'object' && v !== null ? renderObj(v, depth + 1) : String(v ?? '—')
        return `<div class="obj-row"><span class="obj-key">${label}</span><span class="obj-val">${val}</span></div>`
      }).join('') + '</div>'
    }
    return '<span>—</span>'
  }

  // Special handling for Identity Agent
  if (section.id === 'identity') {
    if (typeof data === 'string') return `<div class="identity-text">${data.replace(/\n/g, '<br>')}</div>`
    if (data.synthesis || data.summary) {
      return `<div class="identity-text">${(data.synthesis || data.summary || '').replace(/\n/g, '<br>')}</div>`
    }
  }

  // Special handling for palm reading
  if (section.id === 'palm') {
    let html = ''
    if (data.handShape) {
      html += `<div class="subsection"><h4>Hand Shape: ${data.handShape.type || '—'}</h4><p>${data.handShape.description || ''}</p></div>`
    }
    if (data.majorLines) {
      html += '<div class="subsection"><h4>Major Lines</h4>'
      for (const [key, val] of Object.entries(data.majorLines)) {
        const label = key.replace(/([A-Z])/g, ' $1').trim()
        html += `<div class="line-entry"><strong>${label}:</strong> ${val.observed || '—'}<br><em>${val.interpretation || ''}</em></div>`
      }
      html += '</div>'
    }
    if (data.synthesis) {
      html += `<div class="subsection"><h4>Synthesis</h4><p>${data.synthesis.lifePath || ''}</p>`
      if (data.synthesis.keyThemes?.length) html += `<p><strong>Key Themes:</strong> ${data.synthesis.keyThemes.join(', ')}</p>`
      if (data.synthesis.strengths?.length) html += `<p><strong>Strengths:</strong> ${data.synthesis.strengths.join(', ')}</p>`
      if (data.synthesis.advice) html += `<p><em>${data.synthesis.advice}</em></p>`
      html += '</div>'
    }
    return html || renderObj(data)
  }

  // For quiz-based with just a type
  if (data.source === 'profile' && data.type) {
    return `<p class="quiz-result"><strong>Result:</strong> ${typeof data.type === 'object' ? JSON.stringify(data.type) : data.type}</p>`
  }

  return renderObj(data)
}

/* ── Generate printable HTML ──────────────────────────────────── */
function generateReportHTML(profile, sections, sectionData) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const sectionsByCategory = {}
  sections.forEach(s => {
    const cat = s.category || 'Other'
    if (!sectionsByCategory[cat]) sectionsByCategory[cat] = []
    sectionsByCategory[cat].push(s)
  })

  let body = ''
  for (const [category, catSections] of Object.entries(sectionsByCategory)) {
    body += `<div class="category"><h2>${category}</h2>`
    for (const section of catSections) {
      const data = sectionData[section.id]
      body += `
        <div class="section">
          <h3><span class="section-icon">${section.icon}</span> ${section.label}</h3>
          ${formatSectionHTML(section, data)}
        </div>
      `
    }
    body += '</div>'
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>GOLEM — Full Profile Report — ${profile?.name || 'Unknown'}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  @page {
    size: A4;
    margin: 20mm 18mm;
  }

  body {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 11pt;
    line-height: 1.7;
    color: #1a1a2e;
    background: #fff;
    padding: 0;
  }

  .cover {
    page-break-after: always;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 90vh;
    text-align: center;
    padding: 60px 40px;
  }

  .cover-logo {
    font-family: 'Cinzel', serif;
    font-size: 48pt;
    font-weight: 700;
    letter-spacing: 0.3em;
    color: #c9a84c;
    margin-bottom: 8px;
  }

  .cover-sub {
    font-family: 'Cinzel', serif;
    font-size: 10pt;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #666;
    margin-bottom: 48px;
  }

  .cover-name {
    font-family: 'Cinzel', serif;
    font-size: 24pt;
    font-weight: 600;
    color: #1a1a2e;
    margin-bottom: 12px;
  }

  .cover-dob {
    font-size: 13pt;
    color: #666;
    margin-bottom: 8px;
  }

  .cover-date {
    font-size: 10pt;
    color: #999;
    margin-top: 48px;
    font-style: italic;
  }

  .cover-line {
    width: 120px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #c9a84c, transparent);
    margin: 24px auto;
  }

  .toc {
    page-break-after: always;
    padding: 40px 0;
  }

  .toc h2 {
    font-family: 'Cinzel', serif;
    font-size: 14pt;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #c9a84c;
    border-bottom: 1px solid #c9a84c;
    padding-bottom: 8px;
    margin-bottom: 24px;
  }

  .toc-category {
    font-family: 'Cinzel', serif;
    font-size: 10pt;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #333;
    margin: 16px 0 8px;
  }

  .toc-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0 4px 16px;
    font-size: 11pt;
    color: #444;
  }

  .toc-icon {
    width: 20px;
    text-align: center;
    font-size: 12pt;
  }

  .toc-status {
    margin-left: auto;
    font-size: 8pt;
    color: #999;
    font-style: italic;
  }

  .category h2 {
    font-family: 'Cinzel', serif;
    font-size: 14pt;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #c9a84c;
    border-bottom: 2px solid #c9a84c;
    padding-bottom: 8px;
    margin: 32px 0 20px;
    page-break-after: avoid;
  }

  .section {
    margin-bottom: 24px;
    page-break-inside: avoid;
  }

  .section h3 {
    font-family: 'Cinzel', serif;
    font-size: 12pt;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: #1a1a2e;
    border-bottom: 1px solid #ddd;
    padding-bottom: 6px;
    margin-bottom: 12px;
    page-break-after: avoid;
  }

  .section-icon {
    margin-right: 8px;
  }

  .empty {
    color: #bbb;
    font-style: italic;
    padding: 12px 16px;
    background: #f8f8f8;
    border: 1px dashed #ddd;
    border-radius: 6px;
  }

  .partial {
    color: #e69500;
    font-style: italic;
    padding: 12px 16px;
    background: #fffbf0;
    border: 1px solid #f0d080;
    border-radius: 6px;
  }

  .quiz-result {
    padding: 8px 0;
  }

  .obj-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 4px;
    padding: 4px 0;
  }

  .obj-row {
    display: flex;
    gap: 8px;
    padding: 3px 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .obj-key {
    font-weight: 600;
    text-transform: capitalize;
    color: #555;
    min-width: 140px;
    flex-shrink: 0;
    font-size: 10pt;
  }

  .obj-val {
    color: #333;
    flex: 1;
  }

  .subsection {
    margin: 12px 0;
    padding: 12px;
    background: #fafafa;
    border-radius: 6px;
  }

  .subsection h4 {
    font-family: 'Cinzel', serif;
    font-size: 10pt;
    font-weight: 600;
    color: #c9a84c;
    margin-bottom: 8px;
  }

  .line-entry {
    margin: 8px 0;
    padding-left: 12px;
    border-left: 2px solid #c9a84c44;
  }

  .identity-text {
    line-height: 1.8;
    font-size: 11pt;
  }

  ul {
    padding-left: 20px;
    margin: 4px 0;
  }

  li { margin: 2px 0; }

  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid #ddd;
    text-align: center;
    font-size: 9pt;
    color: #bbb;
    font-style: italic;
  }

  @media print {
    body { padding: 0; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>

<!-- Cover Page -->
<div class="cover">
  <div class="cover-logo">GOLEM</div>
  <div class="cover-sub">Self-Knowledge Operating System</div>
  <div class="cover-line"></div>
  <div class="cover-name">${profile?.name || 'Profile'}</div>
  <div class="cover-dob">${profile?.dob ? new Date(profile.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</div>
  ${profile?.birthPlace ? `<div class="cover-dob">${profile.birthPlace}</div>` : ''}
  <div class="cover-line"></div>
  <div class="cover-date">Generated ${dateStr}</div>
  <div class="cover-date" style="margin-top:4px; font-size:8pt;">22 Symbolic Frameworks · AI Synthesis · ${sections.length} Sections</div>
</div>

<!-- Table of Contents -->
<div class="toc">
  <h2>Table of Contents</h2>
  ${Object.entries(sectionsByCategory).map(([cat, secs]) => `
    <div class="toc-category">${cat}</div>
    ${secs.map(s => `
      <div class="toc-item">
        <span class="toc-icon">${s.icon}</span>
        <span>${s.label}</span>
        <span class="toc-status">${sectionData[s.id] ? (sectionData[s.id].partial ? 'partial' : 'computed') : 'pending'}</span>
      </div>
    `).join('')}
  `).join('')}
</div>

<!-- Report Body -->
${body}

<!-- Footer -->
<div class="footer">
  GOLEM — Know Thyself · Computation is the foundation, synthesis is the product · ${dateStr}
</div>

</body>
</html>`
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Main Component                                                */
/* ═══════════════════════════════════════════════════════════════ */
export default function FullReportDetail() {
  const profile = useActiveProfile()
  const store = useGolemStore()

  const [selectedSections, setSelectedSections] = useState(
    ALL_SECTIONS.map(s => s.id)
  )
  const [generating, setGenerating] = useState(false)

  const toggleSection = (id) => {
    setSelectedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedSections.length === ALL_SECTIONS.length) {
      setSelectedSections([])
    } else {
      setSelectedSections(ALL_SECTIONS.map(s => s.id))
    }
  }

  // Compute status for each section
  const sectionStatus = useMemo(() => {
    const status = {}
    ALL_SECTIONS.forEach(section => {
      const data = computeSectionData(section, profile, store)
      status[section.id] = {
        hasData: !!data && !data.partial,
        partial: data?.partial,
        data,
      }
    })
    return status
  }, [profile, store])

  const computedCount = Object.values(sectionStatus).filter(s => s.hasData).length
  const totalCount = ALL_SECTIONS.length

  /* ── Generate Report ────────────────────────────────────────── */
  const generateReport = useCallback(() => {
    setGenerating(true)

    try {
      const sections = ALL_SECTIONS.filter(s => selectedSections.includes(s.id))
      const sectionData = {}
      sections.forEach(s => {
        sectionData[s.id] = sectionStatus[s.id]?.data || null
      })

      const html = generateReportHTML(profile, sections, sectionData)

      // Open in new window for printing
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(html)
        win.document.close()
        // Auto-trigger print dialog after a brief delay
        setTimeout(() => {
          win.print()
        }, 800)
      }
    } finally {
      setGenerating(false)
    }
  }, [selectedSections, profile, sectionStatus])

  // Group sections by category for display
  const categories = useMemo(() => {
    const cats = {}
    ALL_SECTIONS.forEach(s => {
      const cat = s.category || 'Other'
      if (!cats[cat]) cats[cat] = []
      cats[cat].push(s)
    })
    return cats
  }, [])

  return (
    <div style={S.panel}>
      {/* Header */}
      <div style={S.glass({ borderColor: GOLD + '44', background: GOLD + '08' })}>
        <div style={S.sectionTitle}>Full GOLEM Report</div>
        <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--muted-foreground)' }}>
          Generate a comprehensive PDF report across all {totalCount} symbolic frameworks.
          Sections you haven't computed yet will appear as placeholders in the report.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          <span style={S.badge(GOLD)}>{computedCount} of {totalCount} computed</span>
          <span style={S.badge('#4caf50')}>{selectedSections.length} selected for report</span>
        </div>
      </div>

      {/* Profile Info */}
      <div style={S.glass()}>
        <div style={S.sectionTitle}>Report Subject</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--foreground)' }}>{profile?.name || 'No name set'}</div>
          {profile?.dob && <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Born: {new Date(profile.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>}
          {profile?.birthPlace && <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Location: {profile.birthPlace}</div>}
          {profile?.birthTime && <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Time: {profile.birthTime}</div>}
        </div>
      </div>

      {/* Section Selection */}
      <div style={S.glass()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={S.sectionTitle}>Select Sections</div>
          <div
            onClick={toggleAll}
            style={{
              fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
              color: GOLD, cursor: 'pointer', padding: '4px 10px', borderRadius: 6,
              border: `1px solid ${GOLD}44`, background: GOLD + '10',
            }}
          >
            {selectedSections.length === totalCount ? 'Deselect All' : 'Select All'}
          </div>
        </div>

        {Object.entries(categories).map(([cat, sections]) => (
          <div key={cat} style={{ marginBottom: 16 }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase',
              color: 'var(--muted-foreground)', marginBottom: 6, paddingLeft: 4,
            }}>
              {cat}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sections.map(section => {
                const status = sectionStatus[section.id]
                const checked = selectedSections.includes(section.id)
                return (
                  <div
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    style={S.checkRow}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: `1.5px solid ${checked ? GOLD : 'var(--border)'}`,
                      background: checked ? GOLD + '30' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .15s', fontSize: 10, color: GOLD,
                    }}>
                      {checked ? '✓' : ''}
                    </div>
                    <span style={{ fontSize: 14 }}>{section.icon}</span>
                    <span style={{ flex: 1, color: 'var(--foreground)' }}>{section.label}</span>
                    <span style={S.badge(
                      status?.hasData ? '#4caf50' : status?.partial ? '#ff9800' : '#555'
                    )}>
                      {status?.hasData ? 'ready' : status?.partial ? 'partial' : 'pending'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Generate Button */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <div
          onClick={() => selectedSections.length > 0 && !generating && generateReport()}
          style={S.btn(selectedSections.length > 0 && !generating, GOLD)}
        >
          {generating ? 'Generating...' : `Download Report (${selectedSections.length} sections)`}
        </div>
      </div>

      {/* How it works */}
      <div style={S.glass({ opacity: 0.7 })}>
        <div style={{ fontSize: 11, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
          The report opens in a new window with your browser's Print dialog.
          Select "Save as PDF" to download. All computed sections will include full data;
          uncomputed sections will show as placeholders you can fill in later by running those sections in GOLEM.
        </div>
      </div>
    </div>
  )
}
