import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useGolemStore } from './store/useGolemStore'
import ErrorBoundary from './components/ui/ErrorBoundary'
import Dashboard from './pages/Dashboard'
import ProfilePanel from './components/overlays/ProfilePanel'
import SynastryPanel from './components/overlays/SynastryPanel'
import AIChatPanel from './components/overlays/AIChatPanel'
import Oracle from './components/overlays/Oracle'
import AuthModal from './components/auth/AuthModal'
import Starfield from './components/ui/Starfield'
import Cursor from './components/ui/Cursor'
import { onAuthStateChange, getUser } from './lib/auth'
import { getUserProfile } from './lib/db'

function AuthSync() {
  const { setUser, setUserProfile, setAuthLoading, loadProfilesFromDB } = useGolemStore()

  useEffect(() => {
    let cancelled = false

    getUser().then(async user => {
      if (cancelled) return
      setUser(user)
      if (user) {
        const { data } = await getUserProfile(user.id)
        if (cancelled) return
        setUserProfile(data)
        await loadProfilesFromDB(user.id)
      }
      if (!cancelled) setAuthLoading(false)
    })

    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (cancelled) return
      const user = session?.user || null
      setUser(user)
      if (user) {
        const { data } = await getUserProfile(user.id)
        if (cancelled) return
        setUserProfile(data)
        await loadProfilesFromDB(user.id)
      }
    })

    return () => { cancelled = true; subscription.unsubscribe() }
  }, [])

  return null
}

function OverlayManager() {
  const { activePanel, setActivePanel, showAuthModal, setShowAuthModal, oracleOpen, setOracleOpen } = useGolemStore()
  return createPortal(
    <>
      <ProfilePanel open={activePanel === 'profile'} onClose={() => setActivePanel(null)} />
      <SynastryPanel open={activePanel === 'synastry'} onClose={() => setActivePanel(null)} />
      <AIChatPanel open={activePanel === 'aichat'} onClose={() => setActivePanel(null)} />
      <Oracle open={oracleOpen} onClose={() => setOracleOpen(false)} />
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>,
    document.body
  )
}

function ThemeSync() {
  const theme = useGolemStore((s) => s.theme)
  useEffect(() => {
    const html = document.documentElement

    // Keep data-theme for any legacy references
    html.setAttribute('data-theme', theme)

    // Paperclip dark/light class — determines base chrome colors
    const isLight = theme?.endsWith('-day') || theme === 'light'
    html.classList.toggle('dark', !isLight)

    // Remove all theme-* classes, add current one
    const themeClasses = Array.from(html.classList).filter(c => c.startsWith('theme-'))
    themeClasses.forEach(c => html.classList.remove(c))
    html.classList.add(`theme-${theme}`)

    // Clear any inline styles (let CSS vars take over)
    document.body.style.background = ''
    document.body.style.color = ''
    html.style.background = ''
    html.style.color = ''
  }, [theme])
  return null
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthSync />
      <ThemeSync />
      <Starfield />
      <Dashboard />
      <OverlayManager />
      <Cursor />
    </ErrorBoundary>
  )
}
