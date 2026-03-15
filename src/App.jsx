import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAboveInsideStore } from './store/useAboveInsideStore'
import Dashboard from './pages/Dashboard'
import ProfilePanel from './components/overlays/ProfilePanel'
import SynastryPanel from './components/overlays/SynastryPanel'
import AIChatPanel from './components/overlays/AIChatPanel'
import Oracle from './components/overlays/Oracle'
import AuthModal from './components/auth/AuthModal'
import Starfield from './components/ui/Starfield'
import Cursor from './components/ui/Cursor'
import { onAuthStateChange, getUser } from './lib/auth'
import { getPrimaryProfile } from './lib/db'

function mapDbToProfile(dbProfile) {
  if (!dbProfile) return {}
  return {
    name: dbProfile.full_name,
    dob: dbProfile.birth_date,
    birthHour: dbProfile.birth_time ? parseInt(dbProfile.birth_time.split(':')[0]) : 12,
    birthMinute: dbProfile.birth_time ? parseInt(dbProfile.birth_time.split(':')[1]) : 0,
    birthLat: dbProfile.birth_lat || -34.6037,
    birthLon: dbProfile.birth_lon || -58.3816,
    birthTimezone: dbProfile.birth_timezone || -3,
    birthCity: dbProfile.birth_city || '',
    enneagramType: dbProfile.enneagram_type,
    mbtiType: dbProfile.mbti_type,
  }
}

function AuthSync() {
  const { setUser, setUserProfile, setAuthLoading, setPrimaryProfile } = useAboveInsideStore()

  useEffect(() => {
    // Check initial session
    getUser().then(user => {
      setUser(user)
      if (user) {
        getPrimaryProfile(user.id).then(({ data }) => {
          if (data) setPrimaryProfile(mapDbToProfile(data))
          setUserProfile(data)
        })
      }
      setAuthLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        getPrimaryProfile(session.user.id).then(({ data }) => {
          if (data) setPrimaryProfile(mapDbToProfile(data))
          setUserProfile(data)
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}

function OverlayManager() {
  const { activePanel, setActivePanel, showAuthModal, setShowAuthModal, oracleOpen, setOracleOpen } = useAboveInsideStore()
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
  const theme = useAboveInsideStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    // Update body background to match theme
    const bgMap = {
      'cosmic-night': '#01010a', 'cosmic-day': '#0f0820',
      'parchment-night': '#0d0805', 'parchment-day': '#f5e8c8',
      'crystal-night': '#060810', 'crystal-day': '#f8faff',
      'nebula-night': '#08060f', 'nebula-day': '#0d0b1a',
      'manuscript-night': '#0d0805', 'manuscript-day': '#f5f0e8',
      'dark': '#01010a', 'light': '#f5f2ec',
    }
    document.body.style.background = bgMap[theme] || '#01010a'
    document.documentElement.style.background = bgMap[theme] || '#01010a'
    // Update text color
    const textMap = {
      'parchment-day': '#2a1a0a', 'crystal-day': '#1e293b',
      'manuscript-day': '#2a2520',
    }
    document.body.style.color = textMap[theme] || ''
  }, [theme])
  return null
}

export default function App() {
  return (
    <>
      <AuthSync />
      <ThemeSync />
      <Starfield />
      <Dashboard />
      <OverlayManager />
      <Cursor />
    </>
  )
}
