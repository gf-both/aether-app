import { useState, useEffect, useCallback } from 'react'

const PAPERCLIP_BASE = 'http://127.0.0.1:3100/api'
const COMPANY_ID = 'a77349ed-897c-476d-ad7e-50efb377090c'

const STATUS_COLORS = {
  idle: 'var(--muted-foreground)',
  running: 'var(--lime2, #b8f26b)',
  error: 'var(--rose2, #f87171)',
  paused: 'var(--gold, #c9a84c)',
  active: 'var(--lime2, #b8f26b)',
}

const PRIORITY_COLORS = {
  critical: 'var(--rose2, #f87171)',
  high: 'var(--gold2, #e6c84c)',
  medium: 'var(--aqua2, #67e8f9)',
  low: 'var(--text3, #6b7280)',
}

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

const ICON_MAP = {
  rocket: '🚀', terminal: '💻', brain: '🧠', chart: '📊', design: '🎨',
  star: '⭐', shield: '🛡️', lightning: '⚡', book: '📚', eye: '👁️',
  heart: '💚', gem: '💎', crown: '👑', cog: '⚙️', globe: '🌐',
  magic: '✨', tree: '🌳', diamond: '◈',
}

function getIcon(iconName) {
  return ICON_MAP[iconName] || '◈'
}

// Parse AETHER identity from heartbeat prompt
function parseAether(prompt) {
  if (!prompt) return null
  const match = prompt.match(/AETHER IDENTITY \((.+?)\):([\s\S]*?)(?:Full profile:|$)/)
  if (!match) return null
  const archetypeEmoji = match[1]
  const body = match[2]
  const sunMatch = body.match(/☉ (\w+)/)
  const moonMatch = body.match(/☽ (\w+)/)
  const ascMatch = body.match(/↑ (\w+)/)
  const lpMatch = body.match(/LP (\d+)/)
  const gkMatch = body.match(/GK: Gate (\d+)/)
  const mayanMatch = body.match(/Mayan: (.+?)(?:\n|$)/)
  const giftMatch = body.match(/Gift: (.+?)(?:\n|$)/)
  const shadowMatch = body.match(/Shadow: (.+?)(?:\n|$)/)
  const creatorMatch = body.match(/Creator: (.+?)(?:\n|$)/)
  return {
    archetypeEmoji,
    sun: sunMatch?.[1],
    moon: moonMatch?.[1],
    asc: ascMatch?.[1],
    lp: lpMatch?.[1],
    gk: gkMatch?.[1],
    mayan: mayanMatch?.[1],
    gift: giftMatch?.[1],
    shadow: shadowMatch?.[1],
    creator: creatorMatch?.[1],
  }
}

// Extract Wendy reading from heartbeat prompt (the description after ---AETHER IDENTITY)
function parseWendy(prompt) {
  if (!prompt) return null
  const giftMatch = prompt.match(/Gift: (.+?)(?:\n|$)/)
  const shadowMatch = prompt.match(/Shadow: (.+?)(?:\n|$)/)
  return { gift: giftMatch?.[1], shadow: shadowMatch?.[1] }
}

// MOCK fallback data
const MOCK_COMPANY = {
  id: COMPANY_ID,
  name: 'Above + Inside',
  description: 'Dual SaaS platform for spiritual self-discovery',
  status: 'active',
  issuePrefix: 'AET',
  issueCounter: 59,
  budgetMonthlyCents: 50000,
  spentMonthlyCents: 0,
}

const MOCK_AGENTS = [
  { id: '1', name: 'CEO', role: 'ceo', title: 'Chief Executive Officer', icon: 'crown', status: 'idle', reportsTo: null, budgetMonthlyCents: 5000, spentMonthlyCents: 0, adapterType: 'claude_local', adapterConfig: { heartbeatPrompt: 'AETHER IDENTITY (👑 Visionary Leader):\n☉ Aries | ☽ Leo | ↑ Sagittarius | LP 1\nGK: Gate 1 | Mayan: Imix 1\nGift: Sees the whole before the parts.\nShadow: Moves too fast for the team.\nCreator: Mirror mode' } },
  { id: '2', name: 'CMO', role: 'cmo', title: 'Growth & Marketing', icon: 'rocket', status: 'idle', reportsTo: '1', budgetMonthlyCents: 3000, spentMonthlyCents: 0, adapterType: 'claude_local', adapterConfig: { heartbeatPrompt: 'AETHER IDENTITY (📖 Mythic Storyteller):\n☉ Gemini | ☽ Pisces | ↑ Sagittarius | LP 3\nGK: Gate 41 | Mayan: Ik 3\nGift: Gives people a language for experiences they\'ve never had words for.\nShadow: Story without substance is hollow.\nCreator: Complement mode' } },
  { id: '3', name: 'Dev — Full Stack', role: 'engineer', title: 'Senior Full Stack Engineer', icon: 'terminal', status: 'idle', reportsTo: '1', budgetMonthlyCents: 5000, spentMonthlyCents: 0, adapterType: 'claude_local', adapterConfig: { heartbeatPrompt: 'AETHER IDENTITY (🎨 Creative Coder):\n☉ Libra | ☽ Taurus | ↑ Pisces | LP 6\nGK: Gate 8 | Mayan: Ix 6\nGift: Makes technology feel human.\nShadow: Perfectionism. Ship the 80%, polish in v2.\nCreator: Complement mode' } },
]

const MOCK_ISSUES = [
  { id: '1', identifier: 'AET-1', title: 'Launch Product Hunt campaign', status: 'in-progress', priority: 'high', assigneeAgentId: '2', createdAt: new Date().toISOString() },
  { id: '2', identifier: 'AET-2', title: 'Build SEO keyword strategy', status: 'backlog', priority: 'critical', assigneeAgentId: null, createdAt: new Date().toISOString() },
  { id: '3', identifier: 'AET-3', title: 'Design pricing page', status: 'todo', priority: 'medium', assigneeAgentId: '3', createdAt: new Date().toISOString() },
]

function usePaperclip() {
  const [data, setData] = useState({ company: null, agents: [], issues: [], loading: true, error: null })

  const fetchAll = useCallback(async () => {
    try {
      const [company, agents, issues] = await Promise.all([
        fetch(`${PAPERCLIP_BASE}/companies/${COMPANY_ID}`).then(r => r.json()),
        fetch(`${PAPERCLIP_BASE}/companies/${COMPANY_ID}/agents`).then(r => r.json()),
        fetch(`${PAPERCLIP_BASE}/companies/${COMPANY_ID}/issues`).then(r => r.json()),
      ])
      setData({ company, agents: Array.isArray(agents) ? agents : [], issues: Array.isArray(issues) ? issues : [], loading: false, error: null })
    } catch (e) {
      setData({ company: MOCK_COMPANY, agents: MOCK_AGENTS, issues: MOCK_ISSUES, loading: false, error: 'Using mock data (Paperclip offline)' })
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { ...data, refetch: fetchAll }
}

// ── Panel base style ──
const panel = {
  background: 'var(--panel-bg, rgba(10,10,30,.7))',
  border: '1px solid var(--glass-border, var(--accent))',
  borderRadius: 12,
}

// ── TABS ──
const TABS = [
  { id: 'dashboard', icon: '◈', label: 'Dashboard' },
  { id: 'agents', icon: '👥', label: 'Agents' },
  { id: 'issues', icon: '📋', label: 'Issues' },
  { id: 'orgchart', icon: '🌳', label: 'Org Chart' },
  { id: 'budget', icon: '📊', label: 'Budget' },
  { id: 'aether', icon: '✨', label: 'AETHER' },
]

// ─────────────────────────────────────────────
// Dashboard Tab
// ─────────────────────────────────────────────
function DashboardTab({ company, agents, issues }) {
  const activeAgents = agents.filter(a => a.status === 'running').length
  const openIssues = issues.filter(i => i.status !== 'done' && i.status !== 'cancelled').length
  const totalBudget = agents.reduce((s, a) => s + (a.budgetMonthlyCents || 0), 0)
  const spentBudget = agents.reduce((s, a) => s + (a.spentMonthlyCents || 0), 0)
  const criticalIssues = issues.filter(i => i.priority === 'critical' && i.status !== 'done').length

  const recentIssues = [...issues].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 8)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Agents', value: agents.length, sub: `${activeAgents} running`, color: 'var(--foreground)' },
          { label: 'Open Issues', value: openIssues, sub: `${criticalIssues} critical`, color: criticalIssues > 0 ? 'var(--rose2, #f87171)' : 'var(--lime2, #b8f26b)' },
          { label: 'Monthly Budget', value: `$${(totalBudget / 100).toFixed(0)}`, sub: 'allocated', color: 'var(--aqua2, #67e8f9)' },
          { label: 'Spent This Mo', value: `$${(spentBudget / 100).toFixed(0)}`, sub: `${totalBudget > 0 ? ((spentBudget / totalBudget) * 100).toFixed(0) : 0}% used`, color: 'var(--text2, #a0a0c0)' },
        ].map(stat => (
          <div key={stat.label} style={{ ...panel, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Cinzel',serif", letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Cinzel',serif" }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 3 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Company info + recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16 }}>
        <div style={{ ...panel, padding: 20 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: 'var(--foreground)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            {company?.name || 'Above + Inside Co.'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.6, marginBottom: 14 }}>
            {company?.description || 'Dual SaaS for spiritual self-discovery'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Status', value: company?.status || 'active', badge: true },
              { label: 'Issue Prefix', value: company?.issuePrefix || 'AET' },
              { label: 'Issues Created', value: company?.issueCounter || 0 },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderBottom: '1px solid rgba(201,168,76,.06)', paddingBottom: 4 }}>
                <span style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
                {row.badge
                  ? <span style={{ background: 'rgba(184,242,107,.1)', color: 'var(--lime2, #b8f26b)', borderRadius: 4, padding: '1px 7px', fontSize: 10 }}>{String(row.value).toUpperCase()}</span>
                  : <span style={{ color: 'var(--muted-foreground)' }}>{row.value}</span>
                }
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...panel, padding: 20 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: 'var(--foreground)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 14 }}>Recent Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
            {recentIssues.length === 0
              ? <div style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>No recent activity</div>
              : recentIssues.map(issue => (
                <div key={issue.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--secondary)' }}>
                  <span style={{ fontSize: 9, color: PRIORITY_COLORS[issue.priority] || 'var(--muted-foreground)', fontWeight: 700, minWidth: 22 }}>●</span>
                  <span style={{ fontSize: 10, color: 'var(--muted-foreground)', minWidth: 50 }}>{issue.identifier}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted-foreground)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.title}</span>
                  <StatusPill status={issue.status} />
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Agent status overview */}
      <div style={{ ...panel, padding: 20 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: 'var(--foreground)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 14 }}>Agent Status Overview</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {agents.map(agent => (
            <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--secondary)', borderRadius: 8, border: '1px solid var(--accent)' }}>
              <span style={{ fontSize: 14 }}>{getIcon(agent.icon)}</span>
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{agent.name}</span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[agent.status] || 'var(--muted-foreground)', display: 'inline-block' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// StatusPill helper
// ─────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    'backlog': { bg: 'rgba(107,114,128,.15)', color: 'var(--muted-foreground)', label: 'Backlog' },
    'todo': { bg: 'rgba(103,232,249,.08)', color: 'var(--aqua2, #67e8f9)', label: 'Todo' },
    'in-progress': { bg: 'var(--accent)', color: 'var(--foreground)', label: 'In Progress' },
    'done': { bg: 'rgba(184,242,107,.08)', color: 'var(--lime2, #b8f26b)', label: 'Done' },
    'cancelled': { bg: 'rgba(248,113,113,.08)', color: 'var(--rose2, #f87171)', label: 'Cancelled' },
    'idle': { bg: 'rgba(107,114,128,.12)', color: 'var(--muted-foreground)', label: 'Idle' },
    'running': { bg: 'rgba(184,242,107,.1)', color: 'var(--lime2, #b8f26b)', label: 'Running' },
    'error': { bg: 'rgba(248,113,113,.12)', color: 'var(--rose2, #f87171)', label: 'Error' },
    'paused': { bg: 'var(--accent)', color: 'var(--foreground)', label: 'Paused' },
  }
  const s = map[status] || { bg: 'rgba(107,114,128,.1)', color: 'var(--muted-foreground)', label: status || 'unknown' }
  return (
    <span style={{ fontSize: 9, background: s.bg, color: s.color, borderRadius: 4, padding: '2px 6px', fontFamily: "'Cinzel',serif", letterSpacing: '.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

// ─────────────────────────────────────────────
// Agents Tab
// ─────────────────────────────────────────────
function AgentsTab({ agents }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]))
  const filtered = agents.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || (a.title || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search agents..."
          style={{ flex: 1, padding: '7px 12px', background: 'var(--secondary)', border: '1px solid var(--accent)', borderRadius: 8, color: 'var(--muted-foreground)', fontSize: 12, outline: 'none' }}
        />
        {['all', 'idle', 'running', 'error', 'paused'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(201,168,76,.2)',
            background: statusFilter === s ? 'var(--accent)' : 'transparent',
            color: statusFilter === s ? 'var(--foreground)' : 'var(--muted-foreground)',
            fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer'
          }}>{s}</button>
        ))}
      </div>

      {/* Agent cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {filtered.map(agent => {
          const aether = parseAether(agent.adapterConfig?.heartbeatPrompt)
          const parent = agentMap[agent.reportsTo]
          const budget = (agent.budgetMonthlyCents || 0) / 100
          const spent = (agent.spentMonthlyCents || 0) / 100

          return (
            <div key={agent.id} style={{ ...panel, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{getIcon(agent.icon)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, color: 'var(--foreground)', letterSpacing: '.08em' }}>{agent.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 1 }}>{agent.title || agent.role}</div>
                </div>
                <StatusPill status={agent.status} />
              </div>

              {/* Aether identity */}
              {aether && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'var(--secondary)', borderRadius: 8, border: '1px solid var(--accent)' }}>
                  <span style={{ fontSize: 14 }}>{aether.archetypeEmoji?.split(' ')[0]}</span>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--gold2, #e6c84c)' }}>{aether.archetypeEmoji?.replace(/[^a-zA-Z\s]/g, '').trim()}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted-foreground)' }}>☉ {aether.sun} · ☽ {aether.moon} · LP {aether.lp}</div>
                  </div>
                </div>
              )}

              {/* Meta info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 10 }}>
                <div style={{ color: 'var(--muted-foreground)' }}>Budget: <span style={{ color: 'var(--muted-foreground)' }}>${budget}/mo</span></div>
                <div style={{ color: 'var(--muted-foreground)' }}>Spent: <span style={{ color: 'var(--muted-foreground)' }}>${spent}</span></div>
                <div style={{ color: 'var(--muted-foreground)' }}>Adapter: <span style={{ color: 'var(--muted-foreground)' }}>{agent.adapterType || 'local'}</span></div>
                {parent && <div style={{ color: 'var(--muted-foreground)' }}>Reports to: <span style={{ color: 'var(--muted-foreground)' }}>{parent.name}</span></div>}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                {[
                  { label: '▶ Run', color: 'var(--lime2, #b8f26b)' },
                  { label: '📄 AETHER', color: 'var(--foreground)' },
                  { label: '✏️ Edit', color: 'var(--muted-foreground)' },
                ].map(btn => (
                  <button key={btn.label} style={{
                    flex: 1, padding: '5px 0', background: 'var(--secondary)', border: '1px solid var(--accent)',
                    borderRadius: 6, color: btn.color, fontSize: 10, cursor: 'pointer', fontFamily: "'Cinzel',serif", letterSpacing: '.06em'
                  }}>{btn.label}</button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 13, padding: 40 }}>No agents found</div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Issues Tab
// ─────────────────────────────────────────────
function IssuesTab({ issues, agents }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')

  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]))

  const filtered = issues.filter(issue => {
    const matchStatus = statusFilter === 'all' || issue.status === statusFilter
    const matchPriority = priorityFilter === 'all' || issue.priority === priorityFilter
    const matchAssignee = assigneeFilter === 'all'
      || (assigneeFilter === 'unassigned' && !issue.assigneeAgentId)
      || issue.assigneeAgentId === assigneeFilter
    return matchStatus && matchPriority && matchAssignee
  }).sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9))

  const statusCounts = {}
  issues.forEach(i => { statusCounts[i.status] = (statusCounts[i.status] || 0) + 1 })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Status summary pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['backlog', 'todo', 'in-progress', 'done'].map(s => (
          <div key={s} style={{ ...panel, padding: '6px 14px', cursor: 'pointer', opacity: statusFilter !== 'all' && statusFilter !== s ? 0.5 : 1 }}
            onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}>
            <StatusPill status={s} />
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)', marginLeft: 6 }}>{statusCounts[s] || 0}</span>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: "'Cinzel',serif" }}>PRIORITY</span>
          {['all', 'critical', 'high', 'medium', 'low'].map(p => (
            <button key={p} onClick={() => setPriorityFilter(p)} style={{
              padding: '4px 10px', borderRadius: 6, border: '1px solid var(--accent)',
              background: priorityFilter === p ? 'var(--accent)' : 'transparent',
              color: p === 'all' ? (priorityFilter === 'all' ? 'var(--foreground)' : 'var(--muted-foreground)') : PRIORITY_COLORS[p],
              fontSize: 10, cursor: 'pointer', fontFamily: "'Cinzel',serif", textTransform: 'uppercase', letterSpacing: '.06em'
            }}>{p}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto' }}>
          <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: "'Cinzel',serif" }}>ASSIGNEE</span>
          <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} style={{
            background: 'rgba(10,10,30,.8)', border: '1px solid var(--accent)', borderRadius: 6,
            color: 'var(--muted-foreground)', fontSize: 11, padding: '4px 8px', cursor: 'pointer'
          }}>
            <option value="all">All</option>
            <option value="unassigned">Unassigned</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>

      {/* Issue list */}
      <div style={{ ...panel, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 140px 90px 90px', gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--accent)', fontSize: 9, color: 'var(--muted-foreground)', fontFamily: "'Cinzel',serif", letterSpacing: '.1em', textTransform: 'uppercase' }}>
          <div>ID</div>
          <div>Title</div>
          <div>Assignee</div>
          <div>Priority</div>
          <div>Status</div>
        </div>
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          {filtered.map((issue, idx) => {
            const assignee = issue.assigneeAgentId ? agentMap[issue.assigneeAgentId] : null
            return (
              <div key={issue.id} style={{
                display: 'grid', gridTemplateColumns: '70px 1fr 140px 90px 90px', gap: 8,
                padding: '10px 16px', borderBottom: '1px solid var(--secondary)',
                background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.01)',
                alignItems: 'center',
                transition: 'background .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.01)'}
              >
                <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{issue.identifier}</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.title}</div>
                <div style={{ fontSize: 10, color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {assignee ? <><span style={{ marginRight: 4 }}>{getIcon(assignee.icon)}</span>{assignee.name}</> : <span style={{ opacity: 0.5 }}>Unassigned</span>}
                </div>
                <div>
                  <span style={{ fontSize: 10, color: PRIORITY_COLORS[issue.priority] || 'var(--muted-foreground)', fontFamily: "'Cinzel',serif", letterSpacing: '.05em', textTransform: 'uppercase' }}>
                    {issue.priority || '—'}
                  </span>
                </div>
                <div><StatusPill status={issue.status} /></div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 12, padding: 32 }}>No issues match filters</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Org Chart Tab
// ─────────────────────────────────────────────
function OrgChartTab({ agents }) {
  // Build tree structure
  const agentMap = Object.fromEntries(agents.map(a => [a.id, { ...a, children: [] }]))
  const roots = []

  agents.forEach(a => {
    if (a.reportsTo && agentMap[a.reportsTo]) {
      agentMap[a.reportsTo].children.push(agentMap[a.id])
    } else {
      roots.push(agentMap[a.id])
    }
  })

  function OrgNode({ node, depth = 0 }) {
    const aether = parseAether(node.adapterConfig?.heartbeatPrompt)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Node card */}
        <div style={{
          ...panel, padding: '10px 14px', minWidth: 130, maxWidth: 160, textAlign: 'center',
          position: 'relative', cursor: 'default',
          boxShadow: depth === 0 ? '0 0 20px var(--accent)' : 'none',
          borderColor: depth === 0 ? 'rgba(201,168,76,.4)' : 'var(--accent)',
        }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>{getIcon(node.icon)}</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, color: 'var(--foreground)', letterSpacing: '.08em', marginBottom: 2 }}>{node.name}</div>
          <div style={{ fontSize: 9, color: 'var(--muted-foreground)', marginBottom: 4 }}>{node.title || node.role}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[node.status] || 'var(--muted-foreground)', display: 'inline-block' }} />
            {aether && <span style={{ fontSize: 11 }}>{aether.archetypeEmoji?.split(' ')[0]}</span>}
          </div>
        </div>

        {/* Children */}
        {node.children.length > 0 && (
          <div style={{ position: 'relative', marginTop: 0 }}>
            {/* Vertical connector from parent */}
            <div style={{ width: 1, height: 24, background: 'rgba(201,168,76,.2)', margin: '0 auto' }} />

            {/* Horizontal line spanning all children */}
            {node.children.length > 1 && (
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: `calc(100% - 160px)`, height: 1, background: 'rgba(201,168,76,.2)' }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
              {node.children.map(child => (
                <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 1, height: 24, background: 'rgba(201,168,76,.2)', margin: '0 auto' }} />
                  <OrgNode node={child} depth={depth + 1} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', padding: 20, minHeight: 400 }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: 'var(--foreground)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 24 }}>
        Reporting Hierarchy — {agents.length} Agents
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        {roots.map(root => <OrgNode key={root.id} node={root} depth={0} />)}
      </div>
      {agents.length === 0 && <div style={{ color: 'var(--muted-foreground)', textAlign: 'center', padding: 40 }}>No agents to display</div>}
    </div>
  )
}

// ─────────────────────────────────────────────
// Budget Tab
// ─────────────────────────────────────────────
function BudgetTab({ agents, company }) {
  const totalBudget = agents.reduce((s, a) => s + (a.budgetMonthlyCents || 0), 0)
  const totalSpent = agents.reduce((s, a) => s + (a.spentMonthlyCents || 0), 0)
  const sorted = [...agents].sort((a, b) => (b.budgetMonthlyCents || 0) - (a.budgetMonthlyCents || 0))
  const mostExpensive = sorted[0]
  const mostActive = agents.reduce((best, a) => ((a.spentMonthlyCents || 0) > (best?.spentMonthlyCents || 0) ? a : best), null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Total summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Allocated', value: `$${(totalBudget / 100).toFixed(0)}/mo`, color: 'var(--foreground)' },
          { label: 'Total Spent', value: `$${(totalSpent / 100).toFixed(2)}`, color: totalSpent > 0 ? 'var(--rose2, #f87171)' : 'var(--lime2, #b8f26b)' },
          { label: 'Remaining', value: `$${((totalBudget - totalSpent) / 100).toFixed(2)}`, color: 'var(--aqua2, #67e8f9)' },
        ].map(s => (
          <div key={s.label} style={{ ...panel, padding: '14px 18px' }}>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: "'Cinzel',serif", letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: "'Cinzel',serif" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Highlights */}
      {(mostExpensive || mostActive) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {mostExpensive && (
            <div style={{ ...panel, padding: '12px 16px', borderColor: 'rgba(230,200,76,.25)' }}>
              <div style={{ fontSize: 10, color: 'var(--gold2, #e6c84c)', fontFamily: "'Cinzel',serif", letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>💰 Most Expensive</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{getIcon(mostExpensive.icon)}</span>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{mostExpensive.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--foreground)' }}>${(mostExpensive.budgetMonthlyCents / 100).toFixed(0)}/mo</div>
                </div>
              </div>
            </div>
          )}
          {mostActive && mostActive.spentMonthlyCents > 0 && (
            <div style={{ ...panel, padding: '12px 16px', borderColor: 'rgba(184,242,107,.2)' }}>
              <div style={{ fontSize: 10, color: 'var(--lime2, #b8f26b)', fontFamily: "'Cinzel',serif", letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>⚡ Most Active</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{getIcon(mostActive.icon)}</span>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{mostActive.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--lime2, #b8f26b)' }}>${(mostActive.spentMonthlyCents / 100).toFixed(2)} spent</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Per-agent budget table */}
      <div style={{ ...panel, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--accent)', fontFamily: "'Cinzel',serif", fontSize: 10, color: 'var(--foreground)', letterSpacing: '.12em', textTransform: 'uppercase' }}>
          Agent Budget Breakdown
        </div>
        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          {sorted.map((agent, idx) => {
            const budget = agent.budgetMonthlyCents || 0
            const spent = agent.spentMonthlyCents || 0
            const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0
            return (
              <div key={agent.id} style={{
                padding: '12px 16px', borderBottom: '1px solid var(--secondary)',
                background: agent === mostExpensive ? 'var(--secondary)' : 'transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>{getIcon(agent.icon)}</span>
                  <span style={{ flex: 1, fontSize: 12, color: 'var(--muted-foreground)' }}>{agent.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{agent.title}</span>
                  <span style={{ fontSize: 12, color: 'var(--foreground)', minWidth: 60, textAlign: 'right' }}>${(budget / 100).toFixed(0)}/mo</span>
                  <span style={{ fontSize: 11, color: 'var(--muted-foreground)', minWidth: 60, textAlign: 'right' }}>
                    ${(spent / 100).toFixed(2)} spent
                  </span>
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: pct > 80 ? 'var(--rose2, #f87171)' : pct > 50 ? 'var(--foreground)' : 'var(--lime2, #b8f26b)',
                    borderRadius: 2, transition: 'width .5s ease',
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// AETHER Profiles Tab
// ─────────────────────────────────────────────
function AetherTab({ agents, company }) {
  const [archetypeFilter, setArchetypeFilter] = useState('all')
  const [rebalancing, setRebalancing] = useState(false)
  const [rebalanceMsg, setRebalanceMsg] = useState(null)

  const agentsWithAether = agents.map(a => ({
    ...a,
    aether: parseAether(a.adapterConfig?.heartbeatPrompt),
  }))

  const archetypes = ['all', ...new Set(agentsWithAether.map(a => a.aether?.archetypeEmoji?.split(' ')[0]).filter(Boolean))]

  const filtered = agentsWithAether.filter(a => {
    if (archetypeFilter === 'all') return true
    return a.aether?.archetypeEmoji?.startsWith(archetypeFilter)
  })

  async function handleRebalance() {
    setRebalancing(true)
    setRebalanceMsg(null)
    try {
      // Find Wendy (look for agent with name containing Wendy)
      const wendy = agents.find(a => a.name.toLowerCase().includes('wendy')) || agents[0]
      const res = await fetch(`${PAPERCLIP_BASE}/companies/${COMPANY_ID}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'WENDY: Rebalance Org — Review Team AETHER Profiles',
          description: `Gaston has requested an org rebalancing.\n\nReview all ${agents.length} agent AETHER profiles and recommend:\n1. Which agents are energetically misaligned with their roles\n2. What's missing from the team constellation\n3. Which pairings create the most synergy\n4. Specific role adjustments to optimize the org\n\nProvide a full team reading with actionable recommendations.`,
          priority: 'high',
          status: 'backlog',
          assigneeAgentId: wendy?.id || null,
        }),
      })
      if (res.ok) {
        setRebalanceMsg('✓ Issue created and assigned to Wendy')
      } else {
        setRebalanceMsg('Issue created (response: ' + res.status + ')')
      }
    } catch (e) {
      setRebalanceMsg('⚠ Could not reach Paperclip — issue not created')
    }
    setRebalancing(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filter + action bar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          {archetypes.map(a => (
            <button key={a} onClick={() => setArchetypeFilter(a)} style={{
              padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(201,168,76,.2)',
              background: archetypeFilter === a ? 'var(--accent)' : 'transparent',
              color: archetypeFilter === a ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: 12, cursor: 'pointer',
            }}>{a === 'all' ? 'All Archetypes' : a}</button>
          ))}
        </div>
        <button
          onClick={handleRebalance}
          disabled={rebalancing}
          style={{
            padding: '8px 18px', borderRadius: 8, background: 'var(--accent)',
            border: '1px solid rgba(201,168,76,.3)', color: 'var(--foreground)',
            fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '.1em',
            textTransform: 'uppercase', cursor: rebalancing ? 'wait' : 'pointer',
            opacity: rebalancing ? 0.7 : 1,
          }}>
          {rebalancing ? '⟳ Creating...' : '⚖ Rebalance Org'}
        </button>
      </div>
      {rebalanceMsg && (
        <div style={{ ...panel, padding: '10px 16px', fontSize: 12, color: rebalanceMsg.startsWith('✓') ? 'var(--lime2, #b8f26b)' : 'var(--foreground)' }}>
          {rebalanceMsg}
        </div>
      )}

      {/* AETHER cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {filtered.map(agent => {
          const a = agent.aether
          return (
            <div key={agent.id} style={{ ...panel, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{a?.archetypeEmoji?.split(' ')[0] || getIcon(agent.icon)}</span>
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, color: 'var(--foreground)', letterSpacing: '.08em' }}>{agent.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--gold2, #e6c84c)', marginTop: 2 }}>
                    {a?.archetypeEmoji?.replace(/^\S+\s*/, '') || agent.title}
                  </div>
                </div>
              </div>

              {a ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 10, background: 'var(--secondary)', borderRadius: 8, padding: '8px 10px' }}>
                    <div><span style={{ color: 'var(--muted-foreground)' }}>☉ </span><span style={{ color: 'var(--muted-foreground)' }}>{a.sun}</span></div>
                    <div><span style={{ color: 'var(--muted-foreground)' }}>☽ </span><span style={{ color: 'var(--muted-foreground)' }}>{a.moon}</span></div>
                    <div><span style={{ color: 'var(--muted-foreground)' }}>↑ </span><span style={{ color: 'var(--muted-foreground)' }}>{a.asc}</span></div>
                    <div><span style={{ color: 'var(--muted-foreground)' }}>LP </span><span style={{ color: 'var(--muted-foreground)' }}>{a.lp}</span></div>
                    {a.gk && <div><span style={{ color: 'var(--muted-foreground)' }}>GK </span><span style={{ color: 'var(--muted-foreground)' }}>Gate {a.gk}</span></div>}
                    {a.mayan && <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--muted-foreground)' }}>Mayan: </span><span style={{ color: 'var(--muted-foreground)' }}>{a.mayan}</span></div>}
                  </div>

                  {a.gift && (
                    <div style={{ fontSize: 11, color: 'var(--lime2, #b8f26b)', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--muted-foreground)' }}>Gift: </span>{a.gift}
                    </div>
                  )}
                  {a.shadow && (
                    <div style={{ fontSize: 11, color: 'var(--rose2, #f87171)', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--muted-foreground)' }}>Shadow: </span>{a.shadow}
                    </div>
                  )}
                  {a.creator && (
                    <div style={{ fontSize: 10, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                      Creator: <span style={{ color: 'var(--aqua2, #67e8f9)' }}>{a.creator}</span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>No AETHER profile found</div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 13, padding: 40 }}>No profiles match filter</div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Main CompanyPage component
// ─────────────────────────────────────────────
export default function CompanyPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { company, agents, issues, loading, error, refetch } = usePaperclip()

  const tabContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 28, animation: 'spin 2s linear infinite' }}>◈</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: 'var(--muted-foreground)', letterSpacing: '.12em' }}>LOADING COMPANY DATA</div>
        </div>
      )
    }
    switch (activeTab) {
      case 'dashboard': return <DashboardTab company={company} agents={agents} issues={issues} />
      case 'agents': return <AgentsTab agents={agents} />
      case 'issues': return <IssuesTab issues={issues} agents={agents} />
      case 'orgchart': return <OrgChartTab agents={agents} />
      case 'budget': return <BudgetTab agents={agents} company={company} />
      case 'aether': return <AetherTab agents={agents} company={company} />
      default: return null
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: '1px solid var(--accent)', flexShrink: 0,
        background: 'rgba(5,5,20,.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🏛️</span>
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, color: 'var(--foreground)', letterSpacing: '.12em', textTransform: 'uppercase' }}>
              {company?.name || 'Above + Inside Co.'}
            </div>
            {error && <div style={{ fontSize: 9, color: 'var(--gold2, #e6c84c)', opacity: 0.7 }}>{error}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={refetch} style={{
            padding: '6px 14px', borderRadius: 8, background: 'transparent',
            border: '1px solid rgba(201,168,76,.2)', color: 'var(--muted-foreground)',
            fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.1em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}>↺ Refresh</button>
          <button style={{
            padding: '6px 14px', borderRadius: 8, background: 'var(--accent)',
            border: '1px solid rgba(201,168,76,.3)', color: 'var(--foreground)',
            fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.1em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}>+ New Agent</button>
          <button style={{
            padding: '6px 10px', borderRadius: 8, background: 'transparent',
            border: '1px solid var(--accent)', color: 'var(--muted-foreground)',
            fontSize: 12, cursor: 'pointer',
          }}>⚙</button>
        </div>
      </div>

      {/* Body: sidebar nav + content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left nav */}
        <div style={{ width: 160, borderRight: '1px solid var(--accent)', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
          {TABS.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 16px', cursor: 'pointer',
                background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                borderLeft: activeTab === tab.id ? '2px solid var(--foreground)' : '2px solid transparent',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = 'var(--secondary)' }}
              onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 14 }}>{tab.icon}</span>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: activeTab === tab.id ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                {tab.label}
              </span>
            </div>
          ))}

          <div style={{ flex: 1 }} />

          {/* Agent count badge */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--accent)' }}>
            <div style={{ fontSize: 9, color: 'var(--muted-foreground)', fontFamily: "'Cinzel',serif", letterSpacing: '.08em' }}>
              {agents.length} AGENTS · {issues.filter(i => i.status !== 'done').length} OPEN
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <style>{`
            @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
          `}</style>
          {tabContent()}
        </div>
      </div>
    </div>
  )
}
