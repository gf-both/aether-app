import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAboveInsideStore } from './store/useAboveInsideStore'
import Dashboard from './pages/Dashboard'
import ProfilePanel from './components/overlays/ProfilePanel'
import SynastryPanel from './components/overlays/SynastryPanel'
import AIChatPanel from './components/overlays/AIChatPanel'
import Starfield from './components/ui/Starfield'
import Cursor from './components/ui/Cursor'

function OverlayManager() {
  const { activePanel, setActivePanel } = useAboveInsideStore()
  return createPortal(
    <>
      <ProfilePanel open={activePanel === 'profile'} onClose={() => setActivePanel(null)} />
      <SynastryPanel open={activePanel === 'synastry'} onClose={() => setActivePanel(null)} />
      <AIChatPanel open={activePanel === 'aichat'} onClose={() => setActivePanel(null)} />
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
      'dark': '#01010a', 'light': '#f5f2ec',
    }
    document.body.style.background = bgMap[theme] || '#01010a'
    document.documentElement.style.background = bgMap[theme] || '#01010a'
    // Update text color
    const textMap = {
      'parchment-day': '#2a1a0a', 'crystal-day': '#1e293b',
    }
    document.body.style.color = textMap[theme] || ''
  }, [theme])
  return null
}

export default function App() {
  return (
    <>
      <ThemeSync />
      <Starfield />
      <Dashboard />
      <OverlayManager />
      <Cursor />
    </>
  )
}
