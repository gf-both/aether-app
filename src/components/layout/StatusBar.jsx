import { useClock } from '../../hooks/useClock'

export default function StatusBar() {
  const time = useClock()
  return (
    <div className="statusbar">
      <span style={{ fontSize: 8, fontFamily: "'Cinzel',serif", letterSpacing: '.25em', color: 'var(--muted-foreground)', opacity: 0.4 }}>GOLEM</span>
      <div style={{ flex: 1 }} />
      <span className="ttime">{time}</span>
    </div>
  )
}
