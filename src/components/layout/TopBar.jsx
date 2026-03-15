import { useState, useRef, useEffect } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { useClock } from '../../hooks/useClock'
import { SEPHIROTH } from '../../data/kabbalahData'

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
  { icon: '\uD83D\uDCAE', label: 'Mayan Calendar', widget: 'mayan' },
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
  { icon: '\uD83D\uDCAC', label: 'AI Guide', panel: 'aichat' },
  { icon: '\uD83C\uDFE5', label: 'Practitioner', widget: 'practitioner' },
  { icon: '\uD83D\uDCCB', label: 'Client Portal', widget: 'client' },
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
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 30, height: 30, borderRadius: 7,
          background: open ? 'rgba(201,168,76,.15)' : 'rgba(255,255,255,.04)',
          border: `1px solid ${open ? 'rgba(201,168,76,.35)' : 'rgba(255,255,255,.08)'}`,
          cursor: 'pointer', fontSize: 16, transition: 'all .2s',
          color: open ? 'var(--gold)' : 'var(--text2)',
          flexShrink: 0,
        }}
        title="All Sections"
      >
        {'\u2630'}
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 200,
          background: 'var(--dropdown-bg)', border: '1px solid var(--dropdown-border)',
          borderRadius: 10, backdropFilter: 'blur(16px)',
          overflow: 'hidden', minWidth: 200, maxHeight: 500, overflowY: 'auto',
          boxShadow: 'var(--dropdown-shadow)',
        }}>
          {/* Dashboard link */}
          <div
            onClick={() => { setActiveDetail(null); setActiveNav('dashboard'); setOpen(false) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 16px', cursor: 'pointer',
              fontSize: 12, fontFamily: "'Cinzel',serif",
              letterSpacing: '.06em',
              color: !activeDetail ? 'var(--gold)' : 'var(--text)',
              background: !activeDetail ? 'rgba(201,168,76,.1)' : 'transparent',
              borderBottom: '1px solid rgba(201,168,76,.06)',
              transition: 'all .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,.08)'}
            onMouseLeave={e => e.currentTarget.style.background = !activeDetail ? 'rgba(201,168,76,.1)' : 'transparent'}
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
                  fontSize: 11, fontFamily: "'Cinzel',serif",
                  letterSpacing: '.06em',
                  color: isActive ? 'var(--gold)' : 'var(--text2)',
                  background: isActive ? 'rgba(201,168,76,.1)' : 'transparent',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,.08)'}
                onMouseLeave={e => e.currentTarget.style.background = isActive ? 'rgba(201,168,76,.1)' : 'transparent'}
              >
                <span style={{ fontSize: 14, minWidth: 20, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
                {isActive && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--gold)' }}>{'\u2713'}</span>}
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
          background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.2)',
          cursor: 'pointer', fontSize: 10, fontFamily: "'Cinzel',serif",
          letterSpacing: '.08em', color: 'var(--gold)', whiteSpace: 'nowrap',
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
          background: 'var(--dropdown-bg)', border: '1px solid var(--dropdown-border)',
          borderRadius: 8, backdropFilter: 'blur(16px)',
          overflow: 'hidden', minWidth: 140,
          boxShadow: 'var(--dropdown-shadow)',
        }}>
          {LAYOUTS.map(l => (
            <div
              key={l.id}
              onClick={() => { setLayoutMode(l.id); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', cursor: 'pointer',
                fontSize: 11, fontFamily: "'Cinzel',serif",
                letterSpacing: '.06em',
                color: l.id === layoutMode ? 'var(--gold)' : 'var(--text2)',
                background: l.id === layoutMode ? 'rgba(201,168,76,.1)' : 'transparent',
                transition: 'all .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,.08)'}
              onMouseLeave={e => e.currentTarget.style.background = l.id === layoutMode ? 'rgba(201,168,76,.1)' : 'transparent'}
            >
              <span style={{ fontSize: 14 }}>{l.icon}</span>
              {l.label}
              {l.id === layoutMode && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--gold)' }}>{'\u2713'}</span>}
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
  const setPrimaryProfile = useAboveInsideStore((s) => s.setPrimaryProfile)
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

  const [originalPrimary] = useState(() => ({ ...profile }))

  const allProfiles = [
    { ...originalPrimary, _isPrimary: true },
    ...people,
  ]

  function switchTo(p) {
    if (p._isPrimary) {
      setPrimaryProfile(originalPrimary)
    } else {
      setPrimaryProfile({
        name: p.name, dob: p.dob, tob: p.tob || '', pob: p.pob || '',
        emoji: p.emoji || '\u2726', sign: p.sign || '?',
        asc: p.asc || '?', moon: p.moon || '?',
        hdType: p.hdType || '?', hdProfile: p.hdProfile || '?',
        hdAuth: p.hdAuth || '?', hdDef: p.hdDef || '?',
        lifePath: p.lifePath || '?', crossGK: p.crossGK || '?',
      })
    }
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 0 }}>
      <div className="active-profile-bar" onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
        <div className="apb-avatar">{profile.emoji}</div>
        <div style={{ minWidth: 0 }}>
          <div className="apb-name" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {profile.name}
            <span style={{ fontSize: 7, opacity: .5 }}>{open ? '\u25B2' : '\u25BC'}</span>
          </div>
          <div className="apb-detail">
            {profile.hdType} {profile.hdProfile} &middot; {formatDOB(profile.dob)} &middot; {profile.tob || '?'} &middot; {profile.pob}
          </div>
        </div>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 200,
          background: 'var(--dropdown-bg)', border: '1px solid var(--dropdown-border)',
          borderRadius: 8, backdropFilter: 'blur(16px)',
          overflow: 'hidden', minWidth: 240, maxHeight: 320, overflowY: 'auto',
          boxShadow: 'var(--dropdown-shadow)',
        }}>
          {allProfiles.map((p, i) => {
            const isActive = p.name === profile.name
            return (
              <div
                key={p.id || i}
                onClick={() => switchTo(p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 14px', cursor: 'pointer',
                  background: isActive ? 'rgba(201,168,76,.1)' : 'transparent',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,.08)'}
                onMouseLeave={e => e.currentTarget.style.background = isActive ? 'rgba(201,168,76,.1)' : 'transparent'}
              >
                <span style={{ fontSize: 16 }}>{p.emoji || '\u2726'}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 11, fontFamily: "'Cinzel',serif", letterSpacing: '.04em',
                    color: isActive ? 'var(--gold)' : 'var(--text)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {p.name}
                    {p._isPrimary && <span style={{ fontSize: 8, color: 'var(--text2)', marginLeft: 6 }}>PRIMARY</span>}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text2)' }}>
                    {p.sign || '?'} &middot; {formatDOB(p.dob)} {p.rel ? `\u00B7 ${p.rel}` : ''}
                  </div>
                </div>
                {isActive && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--gold)' }}>{'\u2713'}</span>}
              </div>
            )
          })}
          <div
            onClick={() => { setActiveDetail('profile'); setActiveNav('profile'); setOpen(false) }}
            style={{
              padding: '8px 14px', cursor: 'pointer', borderTop: '1px solid rgba(201,168,76,.1)',
              fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: '.08em',
              color: 'var(--gold)', textAlign: 'center', transition: 'all .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,.08)'}
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
  const dotColors = { cosmic: '#c9a84c', parchment: '#d4a84c', crystal: '#00c8ff' }
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
    { id: 'cosmic', name: 'Cosmic Void', description: 'Deep space observatory',
      night: { bg: '#01010a', accent: '#c9a84c', text: '#e8e0d0' },
      day: { bg: '#0f0820', accent: '#d4a547', text: '#f0ece4' } },
    { id: 'parchment', name: 'Sacred Parchment', description: 'Ancient manuscript',
      night: { bg: '#0d0805', accent: '#d4a84c', text: '#e8dcc4' },
      day: { bg: '#f5e8c8', accent: '#8b6014', text: '#2a1a0a' } },
    { id: 'crystal', name: 'Crystal Matrix', description: 'Quantum clarity',
      night: { bg: '#060810', accent: '#00c8ff', text: '#e2e8f0' },
      day: { bg: '#f8faff', accent: '#4f46e5', text: '#1e293b' } },
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
          background: isDay ? 'rgba(201,168,76,.15)' : 'rgba(255,255,255,.04)',
          border: `1px solid ${isDay ? 'rgba(201,168,76,.35)' : 'rgba(255,255,255,.08)'}`,
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
          background: 'var(--dropdown-bg)', border: '1px solid var(--dropdown-border)',
          borderRadius: 12, backdropFilter: 'blur(20px)',
          padding: 16, minWidth: 460,
          boxShadow: 'var(--dropdown-shadow)',
        }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.2em', color: 'var(--gold)', marginBottom: 12, textAlign: 'center', textTransform: 'uppercase' }}>
            Select Theme
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {THEMES.map(t => (
              <div key={t.id}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.12em', color: 'var(--text2)', textAlign: 'center', marginBottom: 6, textTransform: 'uppercase' }}>
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
                          fontSize: 7, fontFamily: "'Cinzel',serif", letterSpacing: '.1em',
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
                <div style={{ fontSize: 8, color: 'var(--text3)', textAlign: 'center', marginTop: 4, fontStyle: 'italic' }}>{t.description}</div>
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
        background: showWidgetManager ? 'rgba(201,168,76,.15)' : 'rgba(255,255,255,.04)',
        border: `1px solid ${showWidgetManager ? 'rgba(201,168,76,.35)' : 'rgba(255,255,255,.08)'}`,
        cursor: 'pointer', fontSize: 13, transition: 'all .2s',
        color: showWidgetManager ? 'var(--gold)' : 'var(--text3)',
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
          background: 'rgba(201,168,76,.1)',
          border: '1px solid rgba(201,168,76,.35)',
          cursor: 'pointer', fontSize: 10,
          fontFamily: "'Cinzel',serif", letterSpacing: '.1em',
          color: 'var(--gold)', whiteSpace: 'nowrap',
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
          background: 'linear-gradient(135deg, rgba(201,168,76,.3), rgba(201,168,76,.1))',
          border: '1px solid rgba(201,168,76,.5)',
          cursor: 'pointer', fontSize: 11,
          fontFamily: "'Cinzel',serif", color: 'var(--gold)',
          flexShrink: 0,
        }}
        title={user.email}
      >
        {initials}
      </div>
      {menuOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 200,
          background: 'var(--dropdown-bg)', border: '1px solid var(--dropdown-border)',
          borderRadius: 8, backdropFilter: 'blur(16px)',
          minWidth: 180, overflow: 'hidden',
          boxShadow: 'var(--dropdown-shadow)',
        }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(201,168,76,.1)' }}>
            <div style={{ fontSize: 10, fontFamily: "'Cinzel',serif", color: 'var(--gold)', letterSpacing: '.06em' }}>Signed in as</div>
            <div style={{ fontSize: 9, color: 'var(--text2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{user.email}</div>
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
              fontFamily: "'Cinzel',serif", letterSpacing: '.06em',
              color: 'var(--text2)', transition: 'all .15s',
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
  const profile = useAboveInsideStore((s) => s.primaryProfile)
  const setActivePanel = useAboveInsideStore((s) => s.setActivePanel)
  const setActiveDetail = useAboveInsideStore((s) => s.setActiveDetail)
  const setActiveNav = useAboveInsideStore((s) => s.setActiveNav)
  const time = useClock()

  // Derive dynamic values instead of hardcoding
  const hdProfileLabel = HD_PROFILE_LABELS[profile.hdProfile] || profile.hdProfile
  const activeSephira = SEPHIROTH?.find(s => s.active) || null
  const sephiraChip = activeSephira ? `${activeSephira.name} ${activeSephira.ratio}` : null

  return (
    <div className="tb">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <HamburgerMenu />
        <span className="tb-brand" style={{ cursor: 'pointer' }} onClick={() => { setActiveDetail(null); setActiveNav('dashboard') }}>ABOVE + INSIDE</span>
        <ProfileSwitcher />
        <LayoutSwitcher />
      </div>
      <div className="tb-chips">
        <div className="chip chip-g">{'\u2609'} {profile.sign} &middot; &uarr; {profile.asc} &middot; {'\u263D'} {profile.moon}</div>
        <div className="chip chip-b" title={`Human Design: ${hdProfileLabel}`}>{'\u25C8'} {profile.hdType} &middot; {profile.hdProfile} &middot; {hdProfileLabel}</div>
        <div className="chip chip-r">{'\u221E'} Life Path {profile.lifePath}</div>
        {sephiraChip && (
          <div className="chip chip-v" title="Kabbalah — Active Sephira">{'\u2721'} {sephiraChip}</div>
        )}
        <div className="chip chip-b" onClick={() => { setActiveDetail('synastry'); setActiveNav('synastry') }}>{'\u2295'} Synastry</div>
        <ThemeToggle />
        <WidgetManagerToggle />
        <SignInButton />
        <span className="ttime">{time}</span>
      </div>
    </div>
  )
}
