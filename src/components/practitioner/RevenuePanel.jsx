import { useState } from 'react'
import { MOCK_REVENUE } from '../../data/practitionerData'

const s = {
  panel: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
  },
  title: {
    fontFamily: "'Cinzel',serif",
    fontSize: '11px',
    letterSpacing: '.2em',
    color: 'var(--foreground)',
    textTransform: 'uppercase',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '20px',
  },
  statCard: {
    background: 'var(--secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '12px',
  },
  statValue: {
    fontFamily: "'Cinzel',serif",
    fontSize: '20px',
    color: 'var(--foreground)',
    marginBottom: '2px',
  },
  statLabel: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '12px',
    color: 'var(--muted-foreground)',
    letterSpacing: '.05em',
  },
  statDelta: {
    fontSize: '10px',
    color: 'var(--lime2)',
    marginTop: '2px',
  },
  sectionLabel: {
    fontFamily: "'Cinzel',serif",
    fontSize: '9px',
    letterSpacing: '.15em',
    color: 'var(--muted-foreground)',
    textTransform: 'uppercase',
    marginBottom: '10px',
    marginTop: '16px',
  },
  clientRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  clientName: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '13px',
    color: 'var(--text1)',
    width: '70px',
    flexShrink: 0,
  },
  barContainer: {
    flex: 1,
    height: '18px',
    background: 'var(--secondary)',
    borderRadius: '4px',
    overflow: 'hidden',
    position: 'relative',
  },
  barAmount: {
    fontFamily: "'Cinzel',serif",
    fontSize: '10px',
    color: 'var(--muted-foreground)',
    width: '50px',
    textAlign: 'right',
    flexShrink: 0,
  },
  historyRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '6px',
    height: '50px',
    marginBottom: '4px',
  },
  exportBtn: {
    background: 'var(--accent)',
    border: '1px solid rgba(201,168,76,.3)',
    borderRadius: '6px',
    padding: '6px 14px',
    fontFamily: "'Cinzel',serif",
    fontSize: '9px',
    letterSpacing: '.12em',
    color: 'var(--foreground)',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'all .2s',
  },
}

export default function RevenuePanel() {
  const [copied, setCopied] = useState(false)
  const rev = MOCK_REVENUE
  const maxRevenue = Math.max(...rev.byClient.map(c => c.revenue))
  const maxHistory = Math.max(...rev.history.map(h => h.revenue))
  const pctChange = Math.round(((rev.currentMonth.total - rev.lastMonth.total) / rev.lastMonth.total) * 100)

  function handleExport() {
    const text = [
      'REVENUE SUMMARY',
      `Period: March 2026`,
      `Total Revenue: $${rev.currentMonth.total.toLocaleString()}`,
      `Sessions Completed: ${rev.currentMonth.sessions}`,
      `New Clients: ${rev.currentMonth.newClients}`,
      `Avg Session Value: $${rev.currentMonth.avgSession}`,
      '',
      'BY CLIENT:',
      ...rev.byClient.map(c => `  ${c.name}: $${c.revenue} (${c.sessions} sessions)`),
      '',
      'MONTHLY TREND:',
      ...rev.history.map(h => `  ${h.month}: $${h.revenue}`),
    ].join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={s.panel}>
      <div style={s.title}>
        <span>Revenue Overview</span>
        <button style={s.exportBtn} onClick={handleExport}>
          {copied ? '✓ Copied' : '↗ Export'}
        </button>
      </div>

      {/* Stats Grid */}
      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={s.statValue}>${rev.currentMonth.total.toLocaleString()}</div>
          <div style={s.statLabel}>This Month</div>
          <div style={s.statDelta}>↑ {pctChange}% vs last month</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statValue}>{rev.currentMonth.sessions}</div>
          <div style={s.statLabel}>Sessions</div>
          <div style={{ ...s.statDelta, color: 'var(--foreground)' }}>+{rev.currentMonth.sessions - rev.lastMonth.sessions} vs last</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statValue}>{rev.currentMonth.newClients}</div>
          <div style={s.statLabel}>New Clients</div>
          <div style={{ ...s.statDelta, color: 'var(--foreground)' }}>+{rev.currentMonth.newClients - rev.lastMonth.newClients} vs last</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statValue}>${rev.currentMonth.avgSession}</div>
          <div style={s.statLabel}>Avg Session</div>
          <div style={{ ...s.statDelta, color: 'var(--muted-foreground)' }}>+${rev.currentMonth.avgSession - rev.lastMonth.avgSession} vs last</div>
        </div>
      </div>

      {/* Revenue by Client */}
      <div style={s.sectionLabel}>Revenue by Client</div>
      {rev.byClient.map((client) => {
        const pct = (client.revenue / maxRevenue) * 100
        return (
          <div key={client.name} style={s.clientRow}>
            <div style={s.clientName}>{client.name}</div>
            <div style={s.barContainer}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, rgba(201,168,76,.6), rgba(201,168,76,.3))',
                borderRadius: '4px',
                transition: 'width .5s ease',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '6px',
              }}>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,.5)', fontFamily: "'Cinzel',serif", whiteSpace: 'nowrap' }}>
                  {client.sessions} sessions
                </span>
              </div>
            </div>
            <div style={s.barAmount}>${client.revenue}</div>
          </div>
        )
      })}

      {/* Monthly Trend */}
      <div style={s.sectionLabel}>Monthly Trend</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '60px' }}>
        {rev.history.map((item) => {
          const heightPct = (item.revenue / maxHistory) * 100
          return (
            <div key={item.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{
                width: '100%',
                height: `${heightPct}%`,
                background: 'linear-gradient(0deg, rgba(201,168,76,.7), rgba(201,168,76,.3))',
                borderRadius: '3px 3px 0 0',
                transition: 'height .5s ease',
              }} />
              <span style={{ fontSize: '9px', color: 'var(--muted-foreground)', fontFamily: "'Cinzel',serif" }}>{item.month}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
