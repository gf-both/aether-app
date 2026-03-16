import { useState, useRef, useEffect, useMemo } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { useClock } from '../../hooks/useClock'
import { SEPHIROTH } from '../../data/kabbalahData'
import { getNatalChart } from '../../engines/natalEngine'
import { getNumerologyProfileFromDob } from '../../engines/numerologyEngine'
import { getMayanProfile } from '../../engines/mayanEngine'
import { getChineseProfileFromDob } from '../../engines/chineseEngine'
import { computeHDChart } from '../../engines/hdEngine'
import { resolvePob } from '../../utils/profileUtils'

const HD_PROFILE_LABELS = {
  '1/3': 'Investigator/Martyr', '1/4': 'Investigator/Opportunist',
  '2/4': 'Hermit/Opportunist',  '2/5': 'Hermit/Heretic',
  '3/5': 'Martyr/Heretic',      '3/6': 'Martyr/Role Model',
  '4/6': 'Opportunist/Role Model', '4/1': 'Opportunist/Investigator',
  '5/1': 'Heretic/Investigator', '5/2': 'Heretic/Hermit',
  '6/2': 'Role Model/Hermit',   '6/3': 'Role Model/Martyr',
}

const NAV_SECTIONS = [
  { icon: '\u25CE', label: 'Integral Map', widget: 'integral' },
  null,
  { icon: '\u2609', label: 'Natal Chart', widget: 'natal' },
  { icon: '\u263D', label: 'Transits', widget: 'tr' },
  null,
  { icon: '\u25C8', label: 'Human Design', widget: 'hd' },
  { icon: '\u2721', label: 'Kabbalah', widget: 'kab' },
  null,
  { icon: '\u221E', label: 'Numerology', widget: 'num' },
  { icon: '\u2B21', label: 'Gene Keys', widget: 'gk' },
  null,
  { icon: '\uD83C\uDF38', label: 'Mayan Calendar', widget: 'mayan' },
  { icon: '\u262F', label: 'Enneagram', widget: 'enn' },
  { icon: '\uD83D\uDC09', label: 'Chinese Zodiac', widget: 'chi' },
  null,
  { icon: '\uD83D\uDD20', label: 'Gematria', widget: 'gem' },
  { icon: '\uD83D\uDD78', label: 'Patterns', widget: 'pat' },
  null,
  { icon: '\uD83E\uDDE0', label: 'Myers-Briggs', widget: 'mbti' },
  { icon: '\uD83C\uDFDB', label: 'Egyptian', widget: 'egyptian' },
  null,
  { icon: '\u2295', label: 'Synastry', widget: 'synastry' },
  { icon: '\uD83D\uDC64', label: 'Profiles', widget: 'profile' },
  null,
  { icon: '\uD83D\uDC8E', label: 'Pricing', widget: 'pricing' },
  null,
  { icon: '\uD83E\uDEEC', label: 'Golem', widget: 'golem' },
  { icon: '\uD83E\uDDED', label: 'Career', widget: 'career' },
  null,
  { icon: '\uD83D\uDCAC', label: 'AI Guide', panel: 'aichat' },
  { icon: '\uD83C\uDFE5', label: 'Practitioner', widget: 'practitioner' },
  { icon: '\uD83D\uDCCB', label: 'Client Portal', widget: 'client' },
  null,
  { icon: '\u2728', label: 'AETHER', widget: 'aether' },
  { icon: '\uD83C\uDFDB\uFE0F', label: 'Company', widget: 'company' },
]

function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const activeDetail = useAboveInsideStore((s) => s.activeDetail)
  const setActiveDetail = useAboveInsideStore((s) => s.setActiveDetail)
  const setActiveNav = useAboveInsideStore((s) => s.setActiveNav)
  const setActivePanel = useAboveInsideStore((s) => s.setActivePanel)

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  function handleClick(item) {
    if (item.panel) {
      setActivePanel(item.panel)
    } else if (item.widget) {
      setActiveDetail(item.widget)
      setActiveNav(item.widget)
    }
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }} className="hamburger-menu">
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 30, height: 30, borderRadius: 7,
          background: open ? 'var(--accent)' : 'var(--secondary)',
          border: `1px solid ${open ? 'var(--ring)' : 'var(--border)'}`,
          cursor: 'pointer', fontSize: 16, transition: 'all .2s',
          color: open ? 'var(--foreground)' : 'var(--muted-foreground)',
          flexShrink: 0,
        }}
        title="All Sections"
      >
        {'\u2630'}
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 200,
          background: 'var(--popover)', border: '1px solid var(--border)',
          borderRadius: 10, backdropFilter: 'blur(16px)',
          overflow: 'hidden', minWidth: 200, maxHeight: 500, overflowY: 'auto',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {/* Dashboard link */}
          <div
            onClick={() => { setActiveDetail(null); setActiveNav('dashboard'); setOpen(false) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 16px', cursor: 'pointer',
              fontSize: 12, fontFamily: 'inherit',
              letterSpacing: '.06em',
              color: !activeDetail ? 'var(--foreground)' : 'var(--foreground)',
              background: !activeDetail ? 'var(--accent)' : 'transparent',
              borderBottom: '1px solid rgba(201,168,76,.06)',
              transition: 'all .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.background = !activeDetail ? 'var(--accent)' : 'transparent'}
          >
            <span style={{ fontSize: 14, minWidth: 20, textAlign: 'center' }}>{'\u2302'}</span>
            Dashboard
          </div>
          {NAV_SECTIONS.map((item, i) => {
            if (!item) return <div key={i} style={{ height: 1, background: 'rgba(201,168,76,.06)', margin: '2px 12px' }} />
            const isActive = activeDetail === item.widget
            return (
              <div
                key={item.label}
                onClick={() => handleClick(item)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 16px', cursor: 'pointer',
                  fontSize: 11, fontFamily: 'inherit',
                  letterSpacing: '.06em',
                  color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.background = isActive ? 'var(--accent)' : 'transparent'}
              >
                <span style={{ fontSize: 14, minWidth: 20, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
                {isActive && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--foreground)' }}>{'\u2713'}</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const LAYOUTS = [
  { id: 'grid', label: 'Grid', icon: '\u2637' },
  { id: 'bento', label: 'Bento', icon: '\u2B1A' },
  { id: 'focus', label: 'Focus', icon: '\u25CE' },
  { id: 'magazine', label: 'Magazine', icon: '\u2630' },
  { id: 'cosmic', label: 'Cosmic', icon: '\u2726' },
]

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDOB(dob) {
  if (!dob) return '?'
  try {
    const d = new Date(dob + 'T12:00:00')
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  } catch { return dob }
}

function LayoutSwitcher() {
  const layoutMode = useAboveInsideStore((s) => s.layoutMode)
  const setLayoutMode = useAboveInsideStore((s) => s.setLayoutMode)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const current = LAYOUTS.find(l => l.id === layoutMode) || LAYOUTS[0]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 6,
          background: 'var(--accent)', border: '1px solid rgba(201,168,76,.2)',
          cursor: 'pointer', fontSize: 10, fontFamily: 'inherit',
          letterSpacing: '.08em', color: 'var(--foreground)', whiteSpace: 'nowrap',
          transition: 'all .2s',
        }}
      >
        <span style={{ fontSize: 13 }}>{current.icon}</span>
        {current.label}
        <span style={{ fontSize: 8, opacity: .5, marginLeft: 2 }}>{open ? '\u25B2' : '\u25BC'}</span>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 200,
          background: 'var(--popover)', border: '1px solid var(--border)',
          borderRadius: 8, backdropFilter: 'blur(16px)',
          overflow: 'hidden', minWidth: 140,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {LAYOUTS.map(l => (
            <div
              key={l.id}
              onClick={() => { setLayoutMode(l.id); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', cursor: 'pointer',
                fontSize: 11, fontFamily: 'inherit',
                letterSpacing: '.06em',
                color: l.id === layoutMode ? 'var(--foreground)' : 'var(--muted-foreground)',
                background: l.id === layoutMode ? 'var(--accent)' : 'transparent',
                transition: 'all .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.background = l.id === layoutMode ? 'var(--accent)' : 'transparent'}
            >
              <span style={{ fontSize: 14 }}>{l.icon}</span>
              {l.label}
              {l.id === layoutMode && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--foreground)' }}>{'\u2713'}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProfileSwitcher() {
  const profile = useAboveInsideStore((s) => s.primaryProfile)
  const people = useAboveInsideStore((s) => s.people)
  const activeViewProfile = useAboveInsideStore((s) => s.activeViewProfile)
  const setActiveViewProfile = useAboveInsideStore((s) => s.setActiveViewProfile)
  const setActivePanel = useAboveInsideStore((s) => s.setActivePanel)
  const setActiveDetail = useAboveInsideStore((s) => s.setActiveDetail)
  const setActiveNav = useAboveInsideStore((s) => s.setActiveNav)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const allProfiles = [
    { ...profile, _isPrimary: true },
    ...people,
  ]

  function switchTo(p) {
    if (p._isPrimary) {
      setActiveViewProfile(null)
    } else {
      setActiveViewProfile({
        id: p.id,
        name: p.name,
        dob: p.dob || '',
        tob: p.tob || '',
        pob: p.pob || '',
        birthLat: p.birthLat || 0,
        birthLon: p.birthLon || 0,
        birthTimezone: p.birthTimezone || 0,
        emoji: p.emoji || '\u2726',
        sign: p.sign || '?',
        asc: p.asc || '?',
        moon: p.moon || '?',
        hdType: p.hdType || '?',
        hdProfile: p.hdProfile || '?',
        hdAuth: p.hdAuth || '?',
        hdDef: p.hdDef || '?',
        lifePath: p.lifePath || '?',
        crossGK: p.crossGK || '?',
        _isPerson: true,
      })
    }
    setOpen(false)
  }

  const displayProfile = activeViewProfile || profile
  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 0 }}>
      {activeViewProfile && (
        <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: 'var(--foreground)', border: '1px solid var(--bg)' }} title="Viewing secondary profile" />
      )}
      <div className="active-profile-bar" onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
        <div className="apb-avatar">{displayProfile.emoji}</div>
        <div style={{ minWidth: 0 }}>
          <div className="apb-name" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {displayProfile.name}
            <span style={{ fontSize: 7, opacity: .5 }}>{open ? '\u25B2' : '\u25BC'}</span>
          </div>
          <div className="apb-detail">
            {displayProfile.hdType} {displayProfile.hdProfile} &middot; {formatDOB(profile.dob)} &middot; {profile.tob || '?'} &middot; {profile.pob}
          </div>
        </div>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 200,
          background: 'var(--popover)', border: '1px solid var(--border)',
          borderRadius: 8, backdropFilter: 'blur(16px)',
          overflow: 'hidden', minWidth: 240, maxHeight: 320, overflowY: 'auto',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {/* Reset to primary */}
          {activeViewProfile && (
            <div
              onClick={() => { setActiveViewProfile(null); setOpen(false); }}
              style={{
                padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                background: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ fontSize: 14 }}>↩</span>
              <div>
                <div style={{ fontSize: 11, fontFamily: 'inherit', color: 'var(--foreground)', letterSpacing: '.04em' }}>Return to My Profile</div>
                <div style={{ fontSize: 9, color: 'var(--muted-foreground)' }}>Switch back to primary profile</div>
              </div>
            </div>
          )}
          {allProfiles.map((p, i) => {
            const isActive = p.name === profile.name
            return (
              <div
                key={p.id || i}
                onClick={() => switchTo(p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 14px', cursor: 'pointer',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.background = isActive ? 'var(--accent)' : 'transparent'}
              >
                <span style={{ fontSize: 16 }}>{p.emoji || '\u2726'}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 11, fontFamily: 'inherit', letterSpacing: '.04em',
                    color: isActive ? 'var(--foreground)' : 'var(--foreground)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {p.name}
                    {p._isPrimary && <span style={{ fontSize: 8, color: 'var(--muted-foreground)', marginLeft: 6 }}>PRIMARY</span>}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--muted-foreground)' }}>
                    {p.sign || '?'} &middot; {formatDOB(p.dob)} {p.rel ? `\u00B7 ${p.rel}` : ''}
                  </div>
                </div>
                {isActive && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--foreground)' }}>{'\u2713'}</span>}
              </div>
            )
          })}
          <div
            onClick={() => { setActiveDetail('profile'); setActiveNav('profile'); setOpen(false) }}
            style={{
              padding: '8px 14px', cursor: 'pointer', borderTop: '1px solid var(--accent)',
              fontSize: 10, fontFamily: 'inherit', letterSpacing: '.08em',
              color: 'var(--foreground)', textAlign: 'center', transition: 'all .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            + Manage Profiles
          </div>
        </div>
      )}
    </div>
  )
}

function ThemeToggle() {
  const theme = useAboveInsideStore((s) => s.theme)
  const themeStyle = useAboveInsideStore((s) => s.themeStyle)
  const themeMode = useAboveInsideStore((s) => s.themeMode)
  const setTheme = useAboveInsideStore((s) => s.setTheme)
  const [showPicker, setShowPicker] = useState(false)
  const ref = useRef(null)

  const isDay = themeMode === 'day' || theme === 'light'
  const style = themeStyle || 'cosmic'

  // Accent dot color per theme style
  const dotColors = { cosmic: '#c9a84c', parchment: '#d4a84c', crystal: '#00c8ff', nebula: '#ffb830', manuscript: '#8b6820' }
  const dotColor = dotColors[style] || '#c9a84c'

  useEffect(() => {
    if (!showPicker) return
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowPicker(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [showPicker])

  function toggleMode() {
    const newMode = isDay ? 'night' : 'day'
    setTheme(style, newMode)
  }

  const THEMES = [
    { id: 'cosmic', name: 'Cosmic Void', description: 'Deep space',
      night: { bg: '#01010a', accent: '#c9a84c', text: '#e8e0d0' },
      day: { bg: '#0f0820', accent: '#d4a547', text: '#f0ece4' } },
    { id: 'parchment', name: 'Sacred Parchment', description: 'Ancient grimoire',
      night: { bg: '#0d0805', accent: '#d4a84c', text: '#e8dcc4' },
      day: { bg: '#f5e8c8', accent: '#8b6014', text: '#2a1a0a' } },
    { id: 'crystal', name: 'Crystal Matrix', description: 'Quantum clarity',
      night: { bg: '#060810', accent: '#00c8ff', text: '#e2e8f0' },
      day: { bg: '#f8faff', accent: '#4f46e5', text: '#1e293b' } },
    { id: 'nebula', name: 'Nebula', description: 'Cosmic depths',
      night: { bg: '#08060f', accent: '#ffb830', text: '#e8dcc8' },
      day: { bg: '#0d0b1a', accent: '#c9a84c', text: '#e8dcc8' } },
    { id: 'manuscript', name: 'Manuscript', description: 'Luminous parchment',
      night: { bg: '#0d0805', accent: '#d4a84c', text: '#e8dcc4' },
      day: { bg: '#f5f0e8', accent: '#8b6820', text: '#2a2520' } },
  ]

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>
      {/* Theme style dot — opens picker */}
      <div
        onClick={() => setShowPicker(!showPicker)}
        title="Theme Picker"
        style={{
          width: 12, height: 12, borderRadius: '50%',
          background: dotColor,
          border: `2px solid ${showPicker ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.2)'}`,
          cursor: 'pointer', flexShrink: 0,
          boxShadow: `0 0 8px ${dotColor}`,
          transition: 'all .2s',
        }}
      />
      {/* Day/night toggle */}
      <div
        onClick={toggleMode}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: 7,
          background: isDay ? 'var(--accent)' : 'var(--secondary)',
          border: `1px solid ${isDay ? 'var(--ring)' : 'var(--border)'}`,
          cursor: 'pointer', fontSize: 14, transition: 'all .2s',
        }}
        title={isDay ? 'Switch to night' : 'Switch to day'}
      >
        {isDay ? '☀️' : '🌙'}
      </div>

      {/* Theme picker dropdown */}
      {showPicker && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 6, zIndex: 300,
          background: 'var(--popover)', border: '1px solid var(--border)',
          borderRadius: 12, backdropFilter: 'blur(20px)',
          padding: 16, minWidth: 580,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          <div style={{ fontFamily: 'inherit', fontSize: 9, letterSpacing: '.2em', color: 'var(--foreground)', marginBottom: 12, textAlign: 'center', textTransform: 'uppercase' }}>
            ✦ Select Theme ✦
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
            {THEMES.map(t => (
              <div key={t.id}>
                <div style={{ fontFamily: 'inherit', fontSize: 8, letterSpacing: '.12em', color: 'var(--muted-foreground)', textAlign: 'center', marginBottom: 6, textTransform: 'uppercase' }}>
                  {t.name}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['night', 'day'].map(mode => {
                    const colors = t[mode]
                    const isActive = themeStyle === t.id && themeMode === mode
                    return (
                      <div
                        key={mode}
                        onClick={() => { setTheme(t.id, mode); setShowPicker(false) }}
                        style={{
                          flex: 1, height: 70, borderRadius: 8, overflow: 'hidden',
                          background: colors.bg, cursor: 'pointer',
                          border: `2px solid ${isActive ? colors.accent : 'rgba(255,255,255,.1)'}`,
                          boxShadow: isActive ? `0 0 12px ${colors.accent}50` : 'none',
                          transition: 'all .2s', position: 'relative',
                        }}
                      >
                        {/* Mini card preview */}
                        <div style={{
                          position: 'absolute', inset: '8px 6px',
                          background: `rgba(${t.id === 'parchment' && mode === 'day' ? '0,0,0' : '255,255,255'},.06)`,
                          borderRadius: 4, border: `1px solid ${colors.accent}40`,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                        }}>
                          <div style={{ width: 14, height: 2, background: colors.accent, borderRadius: 1 }} />
                          <div style={{ width: 10, height: 1, background: colors.text, borderRadius: 1, opacity: .5 }} />
                          <div style={{ width: 12, height: 1, background: colors.text, borderRadius: 1, opacity: .3 }} />
                        </div>
                        {/* Mode label */}
                        <div style={{
                          position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center',
                          fontSize: 7, fontFamily: 'inherit', letterSpacing: '.1em',
                          color: colors.text, opacity: .7, textTransform: 'uppercase',
                        }}>{mode}</div>
                        {isActive && (
                          <div style={{
                            position: 'absolute', top: 3, right: 3,
                            width: 8, height: 8, borderRadius: '50%', background: colors.accent,
                            boxShadow: `0 0 6px ${colors.accent}`,
                          }} />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div style={{ fontSize: 8, color: 'var(--muted-foreground)', textAlign: 'center', marginTop: 4, fontStyle: 'italic' }}>{t.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function WidgetManagerToggle() {
  const showWidgetManager = useAboveInsideStore((s) => s.showWidgetManager)
  const setShowWidgetManager = useAboveInsideStore((s) => s.setShowWidgetManager)
  return (
    <div
      onClick={() => setShowWidgetManager(!showWidgetManager)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 7,
        background: showWidgetManager ? 'var(--accent)' : 'var(--secondary)',
        border: `1px solid ${showWidgetManager ? 'var(--ring)' : 'var(--border)'}`,
        cursor: 'pointer', fontSize: 13, transition: 'all .2s',
        color: showWidgetManager ? 'var(--foreground)' : 'var(--muted-foreground)',
      }}
      title="Widget Manager"
    >
      {'\u2699'}
    </div>
  )
}

function SignInButton() {
  const user = useAboveInsideStore((s) => s.user)
  const setShowAuthModal = useAboveInsideStore((s) => s.setShowAuthModal)
  const setUser = useAboveInsideStore((s) => s.setUser)
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  if (!user) {
    return (
      <div
        onClick={() => setShowAuthModal(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 12px', borderRadius: 7,
          background: 'var(--accent)',
          border: '1px solid var(--ring)',
          cursor: 'pointer', fontSize: 10,
          fontFamily: 'inherit', letterSpacing: '.1em',
          color: 'var(--foreground)', whiteSpace: 'nowrap',
          transition: 'all .2s', textTransform: 'uppercase',
        }}
        title="Sign in to save your data"
      >
        ✦ Sign In
      </div>
    )
  }

  // Logged in — show avatar/email with dropdown
  const initials = (user.email || '?')[0].toUpperCase()
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(201,168,76,.3), var(--accent))',
          border: '1px solid var(--ring)',
          cursor: 'pointer', fontSize: 11,
          fontFamily: 'inherit', color: 'var(--foreground)',
          flexShrink: 0,
        }}
        title={user.email}
      >
        {initials}
      </div>
      {menuOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 200,
          background: 'var(--popover)', border: '1px solid var(--border)',
          borderRadius: 8, backdropFilter: 'blur(16px)',
          minWidth: 180, overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--accent)' }}>
            <div style={{ fontSize: 10, fontFamily: 'inherit', color: 'var(--foreground)', letterSpacing: '.06em' }}>Signed in as</div>
            <div style={{ fontSize: 9, color: 'var(--muted-foreground)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{user.email}</div>
          </div>
          <div
            onClick={async () => {
              const { signOut } = await import('../../lib/auth')
              await signOut()
              setUser(null)
              setMenuOpen(false)
            }}
            style={{
              padding: '9px 14px', cursor: 'pointer', fontSize: 10,
              fontFamily: 'inherit', letterSpacing: '.06em',
              color: 'var(--muted-foreground)', transition: 'all .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Sign Out
          </div>
        </div>
      )}
    </div>
  )
}

export default function TopBar() {
  const primaryProfile = useAboveInsideStore((s) => s.primaryProfile)
  const activeViewProfile = useAboveInsideStore((s) => s.activeViewProfile)
  const profile = activeViewProfile || primaryProfile
  const setActivePanel = useAboveInsideStore((s) => s.setActivePanel)
  const setActiveDetail = useAboveInsideStore((s) => s.setActiveDetail)
  const setActiveNav = useAboveInsideStore((s) => s.setActiveNav)
  const oracleOpen = useAboveInsideStore((s) => s.oracleOpen)
  const setOracleOpen = useAboveInsideStore((s) => s.setOracleOpen)
  const time = useClock()

  // Compute chart live when profile fields are missing (e.g. newly added people)
  const computedChart = useMemo(() => {
    if (!profile?.dob) return null
    if (profile.sign && profile.sign !== '?' && profile.moon && profile.moon !== '?') return null // already computed
    try {
      const [y, m, d] = profile.dob.split('-').map(Number)
      const [h, min] = (profile.tob || '12:00').split(':').map(Number)
      const { lat, lon, tz } = resolvePob(profile)
      return getNatalChart({ day: d, month: m, year: y, hour: h||12, minute: min||0, lat, lon, timezone: tz })
    } catch { return null }
  }, [profile?.dob, profile?.tob, profile?.birthLat, profile?.birthLon, profile?.birthTimezone, profile?.sign, profile?.pob])

  const computedNumerology = useMemo(() => {
    if (!profile?.dob || !profile?.name) return null
    try { return getNumerologyProfileFromDob(profile.dob, profile.name.toUpperCase(), {}) }
    catch { return null }
  }, [profile?.dob, profile?.name])

  const computedHD = useMemo(() => {
    if (!profile?.dob || (profile.hdType && profile.hdType !== '?')) return null
    try { return computeHDChart({ dateOfBirth: profile.dob, timeOfBirth: profile.tob || '12:00', utcOffset: profile.birthTimezone ?? -3 }) }
    catch { return null }
  }, [profile?.dob, profile?.tob, profile?.birthTimezone, profile?.hdType])

  const computedMayan = useMemo(() => {
    if (!profile?.dob) return null
    try {
      const [y, m, d] = profile.dob.split('-').map(Number)
      return getMayanProfile(d, m, y)
    } catch { return null }
  }, [profile?.dob])

  const computedChinese = useMemo(() => {
    if (!profile?.dob) return null
    try {
      const [,, ] = profile.dob.split('-').map(Number)
      const [h, min] = (profile.tob || '12:00').split(':').map(Number)
      return getChineseProfileFromDob(profile.dob, { hour: h||12, minute: min||0 })
    } catch { return null }
  }, [profile?.dob, profile?.tob])

  const v = (x) => (x && x !== '?' && x !== '??' ? x : null)
  const displaySign = v(profile?.sign) || computedChart?.planets?.sun?.sign || '?'
  const displayMoon = v(profile?.moon) || computedChart?.planets?.moon?.sign || '?'
  const displayAsc  = v(profile?.asc)  || computedChart?.angles?.asc?.sign  || '?'
  const displayLP   = v(profile?.lifePath) || computedNumerology?.core?.lifePath?.val || '?'
  const displayHDType    = v(profile?.hdType)    || computedHD?.type    || '?'
  const displayHDProfile = v(profile?.hdProfile) || (computedHD?.profile ? `${computedHD.profile}` : '?')
  const displayHDAuth    = v(profile?.hdAuth)    || computedHD?.authority || '?'
  const displayMayanSign = computedMayan?.tzolkin?.daySign || '?'
  const displayMayanTone = computedMayan?.tzolkin?.toneName || '?'
  const displayMayanKin  = computedMayan?.tzolkin?.kinNumber || '?'
  const displayChinese   = computedChinese ? `${computedChinese.element} ${computedChinese.animal}` : '?'

  // Derive dynamic values instead of hardcoding
  const hdProfileLabel = HD_PROFILE_LABELS[displayHDProfile] || displayHDProfile
  const activeSephira = SEPHIROTH?.find(s => s.active) || null
  const sephiraChip = activeSephira ? `${activeSephira.name} ${activeSephira.ratio}` : null

  return (
    <div className="tb">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <HamburgerMenu />
        <span className="tb-brand" style={{ cursor: 'pointer' }} onClick={() => { setActiveDetail(null); setActiveNav('dashboard') }}>AETHER</span>
        <ProfileSwitcher />
        <LayoutSwitcher />
      </div>
      <div className="tb-chips">
        <div className="chip chip-g">{'\u2609'} {displaySign} &middot; &uarr; {displayAsc} &middot; {'\u263D'} {displayMoon}</div>
        <div className="chip chip-b" title={`Human Design: ${displayHDType} · ${displayHDProfile} · ${displayHDAuth}`}>{'\u25C8'} {displayHDType} &middot; {displayHDProfile}</div>
        <div className="chip chip-r">{'\u221E'} LP {displayLP}</div>
        {displayMayanSign !== '?' && <div className="chip chip-v" title="Mayan Calendar">🌸 {displayMayanSign} &middot; {displayMayanTone} &middot; Kin {displayMayanKin}</div>}
        {displayChinese !== '?' && <div className="chip chip-g" title="Chinese Zodiac">🐉 {displayChinese}</div>}
        {sephiraChip && (
          <div className="chip chip-v" title="Kabbalah — Active Sephira">{'\u2721'} {sephiraChip}</div>
        )}
        <div className="chip chip-b" onClick={() => { setActiveDetail('synastry'); setActiveNav('synastry') }}>{'\u2295'} Synastry</div>
        <ThemeToggle />
        <button
          className={`oracle-toggle-btn${oracleOpen ? ' active' : ''}`}
          onClick={() => setOracleOpen(!oracleOpen)}
          title="Oracle AI"
        >
          ◈
        </button>
        <WidgetManagerToggle />
        <SignInButton />
        <span className="ttime">{time}</span>
      </div>
    </div>
  )
}
