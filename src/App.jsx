import { createPortal } from 'react-dom'
import { useAetherStore } from './store/useAetherStore'
import Dashboard from './pages/Dashboard'
import ProfilePanel from './components/overlays/ProfilePanel'
import SynastryPanel from './components/overlays/SynastryPanel'
import Starfield from './components/ui/Starfield'
import Cursor from './components/ui/Cursor'

function OverlayManager() {
  const { activePanel, setActivePanel } = useAetherStore()
  return createPortal(
    <>
      <ProfilePanel open={activePanel === 'profile'} onClose={() => setActivePanel(null)} />
      <SynastryPanel open={activePanel === 'synastry'} onClose={() => setActivePanel(null)} />
    </>,
    document.body
  )
}

export default function App() {
  return (
    <>
      <Starfield />
      <Dashboard />
      <OverlayManager />
      <Cursor />
    </>
  )
}
