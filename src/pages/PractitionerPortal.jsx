import { useState } from 'react'
import PractitionerDashboard from '../components/practitioner/PractitionerDashboard'
import ClientList from '../components/practitioner/ClientList'
import SessionMode from '../components/practitioner/SessionMode'
import ClientDeepProfile from '../components/practitioner/ClientDeepProfile'
import MultiSystemView from '../components/practitioner/MultiSystemView'
import { MOCK_CLIENTS } from '../data/practitionerData'

const s = {
  container: {
    height: '100%',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--app-bg, #0d0d14)',
  },
  containerSession: {
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--app-bg, #0d0d14)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px 16px',
    borderBottom: '1px solid rgba(201,168,76,.1)',
    flexShrink: 0,
  },
  title: {
    fontFamily: "'Cinzel',serif",
    fontSize: '16px',
    letterSpacing: '.3em',
    color: 'var(--gold)',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '13px',
    color: 'var(--text3)',
    letterSpacing: '.05em',
    marginTop: '2px',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
  },
  actionBtn: {
    background: 'rgba(201,168,76,.1)',
    border: '1px solid rgba(201,168,76,.3)',
    borderRadius: '8px',
    padding: '8px 16px',
    fontFamily: "'Cinzel',serif",
    fontSize: '10px',
    letterSpacing: '.15em',
    color: 'var(--gold)',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'all .2s',
  },
  content: {
    padding: '20px 24px',
    flex: 1,
    overflow: 'auto',
  },
  sectionDivider: {
    height: '1px',
    background: 'linear-gradient(90deg, rgba(201,168,76,.15), transparent)',
    margin: '28px 0 20px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontFamily: "'Cinzel',serif",
    fontSize: '11px',
    letterSpacing: '.25em',
    color: 'var(--gold)',
    textTransform: 'uppercase',
  },
  clientCount: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '12px',
    color: 'var(--text3)',
  },
  navTabs: {
    display: 'flex',
    gap: '4px',
    padding: '0 24px 0',
    borderBottom: '1px solid rgba(255,255,255,.05)',
    flexShrink: 0,
  },
  navTab: (active) => ({
    padding: '10px 16px',
    fontSize: '10px',
    fontFamily: "'Cinzel',serif",
    letterSpacing: '.08em',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    borderBottom: active ? '2px solid var(--gold)' : '2px solid transparent',
    color: active ? 'var(--gold)' : 'var(--text3)',
    marginBottom: '-1px',
    transition: 'all .2s',
    textTransform: 'uppercase',
  }),
}

export default function PractitionerPortal() {
  const [activeClient, setActiveClient] = useState(null)
  const [view, setView] = useState('dashboard') // 'dashboard' | 'session' | 'deep-profile' | 'compare'

  function handleSelectClient(client) {
    setActiveClient(client)
    setView('session')
  }

  function handleViewDeepProfile(client) {
    setActiveClient(client)
    setView('deep-profile')
  }

  function handleBack() {
    setActiveClient(null)
    setView('dashboard')
  }

  // Session Mode: full-screen session interface
  if (view === 'session' && activeClient) {
    return (
      <div style={s.containerSession}>
        <SessionMode client={activeClient} onBack={handleBack} />
      </div>
    )
  }

  // Deep Profile: full-screen client blueprint
  if (view === 'deep-profile' && activeClient) {
    return (
      <div style={s.containerSession}>
        <ClientDeepProfile
          client={activeClient}
          sessions={activeClient.sessions || []}
          onBack={handleBack}
        />
      </div>
    )
  }

  // Compare view
  if (view === 'compare') {
    return (
      <div style={s.container}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={s.title}>Practitioner HQ</div>
            <div style={s.subtitle}>Practice Management · Sessions · Revenue</div>
          </div>
          <div style={s.headerActions}>
            <button
              style={{ ...s.actionBtn, background: 'rgba(255,255,255,.04)', borderColor: 'rgba(255,255,255,.1)', color: 'var(--text2)' }}
              onClick={handleBack}
            >
              ← Back
            </button>
          </div>
        </div>
        {/* Nav */}
        <div style={s.navTabs}>
          {[
            { id: 'dashboard', label: '⊞ Dashboard' },
            { id: 'compare', label: '⚖️ Compare' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setView(tab.id); setActiveClient(null) }}
              style={s.navTab(view === tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <MultiSystemView clients={MOCK_CLIENTS} />
        </div>
      </div>
    )
  }

  // Dashboard + Client List view
  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.title}>Practitioner HQ</div>
          <div style={s.subtitle}>Practice Management · Sessions · Revenue</div>
        </div>
        <div style={s.headerActions}>
          <button
            style={s.actionBtn}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,168,76,.1)'}
          >
            + New Session
          </button>
          <button
            style={{ ...s.actionBtn, background: 'rgba(144,80,224,.1)', borderColor: 'rgba(144,80,224,.3)', color: 'rgba(144,80,224,.9)' }}
            onClick={() => setView('compare')}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(144,80,224,.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(144,80,224,.1)'}
          >
            ⚖️ Compare
          </button>
          <button
            style={{ ...s.actionBtn, background: 'rgba(255,255,255,.04)', borderColor: 'rgba(255,255,255,.1)', color: 'var(--text2)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = 'var(--text1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = 'var(--text2)' }}
          >
            + Client
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={s.content}>
        {/* Dashboard: Revenue + Upcoming + Activity */}
        <PractitionerDashboard />

        {/* Divider */}
        <div style={s.sectionDivider} />

        {/* Client List */}
        <div style={s.sectionHeader}>
          <div style={s.sectionTitle}>Clients</div>
          <div style={s.clientCount}>{MOCK_CLIENTS.length} active · Click to start session · 🔮 for deep profile</div>
        </div>
        <ClientList
          onSelectClient={handleSelectClient}
          onViewDeepProfile={handleViewDeepProfile}
        />
      </div>
    </div>
  )
}
