import { Component } from 'react'

/**
 * ErrorBoundary — catches runtime errors and shows a recovery UI
 * instead of a blank white screen crash.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('AETHER crashed:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100vh', background: '#080614', gap: 20, padding: 40, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, letterSpacing: '.15em', textTransform: 'uppercase', color: '#c9a84c' }}>
            AETHER — Runtime Error
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', maxWidth: 420, lineHeight: 1.7 }}>
            Something crashed. This is usually caused by stale cached data from a recent update.
          </div>
          <div style={{ fontSize: 11, color: 'rgba(201,168,76,.5)', fontFamily: 'monospace', background: 'rgba(0,0,0,.3)', padding: '8px 16px', borderRadius: 6, maxWidth: 500, wordBreak: 'break-all' }}>
            {this.state.error?.message || 'Unknown error'}
          </div>
          <button
            onClick={() => { localStorage.clear(); window.location.reload() }}
            style={{
              padding: '12px 28px', borderRadius: 8, cursor: 'pointer',
              background: 'rgba(201,168,76,.15)', border: '1px solid rgba(201,168,76,.4)',
              color: '#c9a84c', fontSize: 12, fontFamily: "'Cinzel', serif",
              letterSpacing: '.1em', textTransform: 'uppercase',
            }}
          >
            Clear Cache &amp; Reload
          </button>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.2)' }}>
            This will reset your local data. Sign in after reload to restore your profile.
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
