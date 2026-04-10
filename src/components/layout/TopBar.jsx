import { useState, useRef, useEffect } from 'react'
import { signOut } from '../../lib/auth'
import { useGolemStore } from '../../store/useGolemStore'
import { useClock } from '../../hooks/useClock'

const NAV_SECTIONS = [
  { icon: '\u2609', label: 'Natal Chart', widget: 'natal' },
  { icon: '\u263D', label: 'Transits', widget: 'tr' },
  null,
  { icon: '\u25C8', label: 'Human Design', widget: 'hd' },
  { icon: '\u2721', label: 'Kabbalah', widget: 'kab' },
  null,
  { icon: '\u221E', label: 'Numerology', widget: 'num' },
  { icon: '\u2B21', label: 'Gene Keys', widget: 'gk' },
  null,
  { icon: '🔺', label: 'Mayan Calendar', widget: 'mayan' },
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
  { icon: '\u2728', label: 'GOLEM', widget: 'golem' },
]

function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const activeDetail = useGolemStore((s) => s.activeDetail)
  const setActiveDetail = useGolemStore((s) => s.setActiveDetail)
  const setActiveNav = useGolemStore((s) => s.setActiveNav)
  const setActivePanel = useGolemStore((s) => s.setActivePanel)

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

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDOB(dob) {
  if (!dob) return '?'
  try {
    const d = new Date(dob + 'T12:00:00')
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  } catch { return dob }
}

function ProfileSwitcher() {
  const profile = useGolemStore((s) => s.primaryProfile)
  const people = useGolemStore((s) => s.people)
  const activeViewProfile = useGolemStore((s) => s.activeViewProfile)
  const setActiveViewProfile = useGolemStore((s) => s.setActiveViewProfile)
  const setActiveDetail = useGolemStore((s) => s.setActiveDetail)
  const setActiveNav = useGolemStore((s) => s.setActiveNav)
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
        enneagramType: p.enneagramType || null,
        enneagramWing: p.enneagramWing || null,
        mbtiType: p.mbtiType || null,
        doshaType: p.doshaType || null,
        archetypeType: p.archetypeType || null,
        loveLanguage: p.loveLanguage || null,
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

function ControlCenter() {
  const layoutMode = useGolemStore((s) => s.layoutMode)
  const setLayoutMode = useGolemStore((s) => s.setLayoutMode)
  const theme = useGolemStore((s) => s.theme)
  const themeStyle = useGolemStore((s) => s.themeStyle)
  const themeMode = useGolemStore((s) => s.themeMode)
  const setTheme = useGolemStore((s) => s.setTheme)
  const showWidgetManager = useGolemStore((s) => s.showWidgetManager)
  const setShowWidgetManager = useGolemStore((s) => s.setShowWidgetManager)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const isDay = themeMode === 'day' || theme === 'light'

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const LAYOUTS = [
    { id: 'grid', label: 'Grid', icon: '\u2637' },
    { id: 'focus', label: 'Focus', icon: '\u25CE' },
    { id: 'stream', label: 'Stream', icon: '\u2261' },
  ]

  const THEME_DOTS = [
    { id: 'cosmic', color: '#c9a84c', label: 'Cosmic' },
    { id: 'parchment', color: '#d4a84c', label: 'Parchment' },
    { id: 'crystal', color: '#00c8ff', label: 'Crystal' },
    { id: 'nebula', color: '#ffb830', label: 'Nebula' },
    { id: 'manuscript', color: '#8b6820', label: 'Manuscript' },
  ]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 30, height: 30, borderRadius: 7,
          background: open ? 'var(--accent)' : 'var(--secondary)',
          border: `1px solid ${open ? 'var(--ring)' : 'var(--border)'}`,
          cursor: 'pointer', fontSize: 14, transition: 'all .2s',
          color: open ? 'var(--foreground)' : 'var(--muted-foreground)',
        }}
        title="Controls"
      >{'\u2699'}</div>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 6, zIndex: 300,
          background: 'var(--popover)', border: '1px solid var(--border)',
          borderRadius: 12, backdropFilter: 'blur(20px)',
          padding: 0, minWidth: 220, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          {/* Layout Section */}
          <div style={{ padding: '12px 16px 8px' }}>
            <div style={{ fontSize: 8, fontFamily: "'Cinzel',serif", letterSpacing: '.2em', color: 'var(--muted-foreground)', marginBottom: 8, textTransform: 'uppercase' }}>Layout</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {LAYOUTS.map(l => (
                <div
                  key={l.id}
                  onClick={() => setLayoutMode(l.id)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, textAlign: 'center',
                    cursor: 'pointer', transition: 'all .15s',
                    background: l.id === layoutMode ? 'var(--accent)' : 'transparent',
                    border: `1px solid ${l.id === layoutMode ? 'var(--ring)' : 'rgba(255,255,255,.06)'}`,
                  }}
                >
                  <div style={{ fontSize: 16, marginBottom: 2 }}>{l.icon}</div>
                  <div style={{ fontSize: 9, fontFamily: "'Cinzel',serif", letterSpacing: '.06em', color: l.id === layoutMode ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{l.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 16px' }} />

          {/* Theme Section */}
          <div style={{ padding: '8px 16px' }}>
            <div style={{ fontSize: 8, fontFamily: "'Cinzel',serif", letterSpacing: '.2em', color: 'var(--muted-foreground)', marginBottom: 8, textTransform: 'uppercase' }}>Theme</div>
            {/* Day/Night toggle */}
            <div
              onClick={() => setTheme(themeStyle || 'cosmic', isDay ? 'night' : 'day')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                background: 'var(--secondary)', border: '1px solid var(--border)',
                marginBottom: 10, transition: 'all .15s',
              }}
            >
              <span style={{ fontSize: 11, fontFamily: "'Cinzel',serif", letterSpacing: '.06em', color: 'var(--foreground)' }}>
                {isDay ? '\u2600 Day Mode' : '\uD83C\uDF19 Night Mode'}
              </span>
              <span style={{ fontSize: 9, color: 'var(--muted-foreground)' }}>tap to switch</span>
            </div>
            {/* Theme style dots */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', padding: '4px 0' }}>
              {THEME_DOTS.map(t => (
                <div
                  key={t.id}
                  onClick={() => setTheme(t.id, themeMode || 'night')}
                  title={t.label}
                  style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: t.color, cursor: 'pointer',
                    border: `2px solid ${themeStyle === t.id ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.15)'}`,
                    boxShadow: themeStyle === t.id ? `0 0 10px ${t.color}60` : 'none',
                    transition: 'all .2s',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 16px' }} />

          {/* Widget Manager toggle */}
          <div
            onClick={() => { setShowWidgetManager(!showWidgetManager); setOpen(false) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', cursor: 'pointer', transition: 'all .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 14 }}>{'\u26A1'}</span>
            <div>
              <div style={{ fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: '.06em', color: 'var(--foreground)' }}>Widget Manager</div>
              <div style={{ fontSize: 8, color: 'var(--muted-foreground)' }}>{showWidgetManager ? 'Currently open' : 'Show/hide widgets'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SignInButton() {
  const user = useGolemStore((s) => s.user)
  const setShowAuthModal = useGolemStore((s) => s.setShowAuthModal)
  const setUser = useGolemStore((s) => s.setUser)
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
        {'\u2726'} Sign In
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
  const setActiveDetail = useGolemStore((s) => s.setActiveDetail)
  const setActiveNav = useGolemStore((s) => s.setActiveNav)
  const oracleOpen = useGolemStore((s) => s.oracleOpen)
  const setOracleOpen = useGolemStore((s) => s.setOracleOpen)
  const time = useClock()

  return (
    <div className="tb">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <HamburgerMenu />
        <span className="tb-brand" style={{ cursor: 'pointer' }} onClick={() => { setActiveDetail(null); setActiveNav('dashboard') }}>GOLEM</span>
        <ProfileSwitcher />
      </div>
      <div className="tb-chips">
        <button
          className={`oracle-toggle-btn${oracleOpen ? ' active' : ''}`}
          onClick={() => setOracleOpen(!oracleOpen)}
          title="Oracle AI"
        >
          {'\u25C8'}
        </button>
        <ControlCenter />
        <SignInButton />
        <span className="ttime">{time}</span>
      </div>
    </div>
  )
}
