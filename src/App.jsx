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
