import { MOCK_REVENUE, MOCK_ACTIVITY, MOCK_CLIENTS } from '../../data/practitionerData'
import RevenuePanel from './RevenuePanel'

const s = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: '16px',
    marginBottom: '20px',
  },
  panel: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
  },
  sectionTitle: {
    fontFamily: "'Cinzel',serif",
    fontSize: '11px',
    letterSpacing: '.2em',
    color: 'var(--foreground)',
    textTransform: 'uppercase',
    marginBottom: '14px',
  },
  upcomingItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '10px',
    paddingBottom: '10px',
    borderBottom: '1px solid var(--secondary)',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--lime2)',
    marginTop: '5px',
    flexShrink: 0,
  },
  sessionTime: {
    fontFamily: "'Cinzel',serif",
    fontSize: '12px',
    color: 'var(--foreground)',
  },
  sessionClient: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '13px',
    color: 'var(--text1)',
  },
  sessionDuration: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '11px',
    color: 'var(--muted-foreground)',
  },
  dayLabel: {
    fontFamily: "'Cinzel',serif",
    fontSize: '9px',
    letterSpacing: '.15em',
    color: 'var(--muted-foreground)',
    textTransform: 'uppercase',
    marginBottom: '8px',
    marginTop: '4px',
  },
  activityItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  activityIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'var(--accent)',
    border: '1px solid rgba(201,168,76,.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    flexShrink: 0,
  },
  activityTime: {
    fontFamily: "'Cinzel',serif",
    fontSize: '9px',
    letterSpacing: '.1em',
    color: 'var(--muted-foreground)',
    textTransform: 'uppercase',
    marginBottom: '2px',
  },
  activityText: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '13px',
    color: 'var(--muted-foreground)',
  },
  calBtn: {
    background: 'var(--accent)',
    border: '1px solid rgba(201,168,76,.2)',
    borderRadius: '6px',
    padding: '6px 14px',
    fontFamily: "'Cinzel',serif",
    fontSize: '9px',
    letterSpacing: '.12em',
    color: 'var(--foreground)',
    cursor: 'pointer',
    textTransform: 'uppercase',
    marginTop: '10px',
    transition: 'all .2s',
  },
}

const UPCOMING = [
  { day: 'Today, March 15', sessions: [
    { time: '2:00 PM', client: 'Elena Vasquez', duration: '60 min', type: 'Projector' },
    { time: '4:30 PM', client: 'Marco Reyes', duration: '90 min', type: 'Generator' },
  ]},
  { day: 'Tomorrow, March 16', sessions: [
    { time: '10:00 AM', client: 'Sofia Leal', duration: '60 min', type: 'MG' },
  ]},
]

export default function PractitionerDashboard({ onNewSession, onViewClient }) {
  const completionRate = Math.round((MOCK_REVENUE.currentMonth.sessions / (MOCK_REVENUE.currentMonth.sessions + 1)) * 100)

  return (
    <div>
      {/* Stats + Upcoming Grid */}
      <div style={s.grid}>
        {/* Revenue (compact) */}
        <RevenuePanel />

        {/* Right Column: Upcoming + Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Upcoming Sessions */}
          <div style={s.panel}>
            <div style={s.sectionTitle}>Upcoming Sessions</div>
            {UPCOMING.map(group => (
              <div key={group.day}>
                <div style={s.dayLabel}>{group.day}</div>
                {group.sessions.map((sess, i) => (
                  <div key={i} style={s.upcomingItem}>
                    <div style={s.dot} />
                    <div>
                      <div style={s.sessionTime}>{sess.time}</div>
                      <div style={s.sessionClient}>{sess.client}</div>
                      <div style={s.sessionDuration}>{sess.duration} · {sess.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button
              style={s.calBtn}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
            >
              View Calendar →
            </button>
          </div>

          {/* Recent Activity */}
          <div style={s.panel}>
            <div style={s.sectionTitle}>Recent Activity</div>
            {MOCK_ACTIVITY.map((item, i) => (
              <div key={i} style={s.activityItem}>
                <div style={s.activityIcon}>{item.icon}</div>
                <div>
                  <div style={s.activityTime}>{item.time}</div>
                  <div style={s.activityText}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
