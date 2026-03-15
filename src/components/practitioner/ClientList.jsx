import { useState } from 'react'
import { MOCK_CLIENTS, HD_TYPE_COLORS, HD_TYPE_EMOJIS } from '../../data/practitionerData'

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  searchInput: {
    flex: 1,
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '13px',
    color: 'var(--text1)',
    outline: 'none',
    transition: 'border .2s',
  },
  filterBtn: {
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontFamily: "'Cinzel',serif",
    fontSize: '9px',
    letterSpacing: '.1em',
    color: 'var(--text2)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    transition: 'all .2s',
  },
  filterBtnActive: {
    background: 'rgba(201,168,76,.12)',
    border: '1px solid rgba(201,168,76,.3)',
    color: 'var(--gold)',
  },
  clientCard: {
    background: 'rgba(255,255,255,.025)',
    border: '1px solid rgba(255,255,255,.06)',
    borderRadius: '10px',
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'all .2s',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Cinzel',serif",
    fontSize: '13px',
    fontWeight: '600',
    flexShrink: 0,
  },
  clientInfo: {
    flex: 1,
    minWidth: 0,
  },
  clientNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '3px',
  },
  clientName: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text1)',
  },
  hdTypeBadge: {
    fontSize: '10px',
    fontFamily: "'Cinzel',serif",
    letterSpacing: '.05em',
    padding: '2px 7px',
    borderRadius: '20px',
    border: '1px solid',
  },
  clientMeta: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '12px',
    color: 'var(--text3)',
    letterSpacing: '.03em',
  },
  clientDates: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '11px',
    color: 'var(--text3)',
    marginTop: '3px',
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  arrowBtn: {
    background: 'rgba(201,168,76,.1)',
    border: '1px solid rgba(201,168,76,.2)',
    borderRadius: '6px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--gold)',
    fontSize: '14px',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all .2s',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: '14px',
    color: 'var(--text3)',
  },
}

const STATUS_COLORS = {
  active: 'var(--lime2)',
  pending: 'var(--gold2)',
  inactive: 'var(--text3)',
}

const FILTERS = ['All', 'Active', 'Generator', 'Projector', 'Manifestor', 'Reflector']

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ClientList({ onSelectClient }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = MOCK_CLIENTS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.hdType.toLowerCase().includes(search.toLowerCase()) ||
      c.birthCity.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' ||
      filter === 'Active' && c.status === 'active' ||
      c.hdType.includes(filter)
    return matchSearch && matchFilter
  })

  return (
    <div style={s.container}>
      {/* Search + Filter Row */}
      <div style={s.headerRow}>
        <input
          style={s.searchInput}
          placeholder="Search clients…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              style={{ ...s.filterBtn, ...(filter === f ? s.filterBtnActive : {}) }}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Client Cards */}
      {filtered.length === 0 ? (
        <div style={s.emptyState}>No clients match your search</div>
      ) : (
        filtered.map(client => {
          const typeColor = HD_TYPE_COLORS[client.hdType] || 'var(--gold)'
          const emoji = HD_TYPE_EMOJIS[client.hdType] || '✦'
          const lastSession = client.sessions.length > 0
            ? client.sessions.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
            : null
          return (
            <div
              key={client.id}
              style={s.clientCard}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(201,168,76,.25)'
                e.currentTarget.style.background = 'rgba(201,168,76,.04)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,.06)'
                e.currentTarget.style.background = 'rgba(255,255,255,.025)'
                e.currentTarget.style.transform = 'none'
              }}
              onClick={() => onSelectClient && onSelectClient(client)}
            >
              {/* Avatar */}
              <div style={{
                ...s.avatar,
                background: `${typeColor}22`,
                border: `1px solid ${typeColor}44`,
                color: typeColor,
              }}>
                {emoji}
              </div>

              {/* Info */}
              <div style={s.clientInfo}>
                <div style={s.clientNameRow}>
                  <span style={s.clientName}>{client.name}</span>
                  <span style={{
                    ...s.hdTypeBadge,
                    color: typeColor,
                    borderColor: `${typeColor}44`,
                    background: `${typeColor}11`,
                  }}>
                    {client.hdType} {client.hdProfile}
                  </span>
                </div>
                <div style={s.clientMeta}>
                  Life Path {client.lifePath} · {client.birthCity}
                </div>
                <div style={s.clientDates}>
                  {lastSession ? `Last: ${formatDate(lastSession)}` : 'No sessions yet'}
                  {client.nextSession && ` · Next: ${formatDate(client.nextSession)}`}
                </div>
              </div>

              {/* Status + Arrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ ...s.statusDot, background: STATUS_COLORS[client.status] || 'var(--text3)' }} />
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: '9px', letterSpacing: '.1em', color: STATUS_COLORS[client.status], textTransform: 'uppercase' }}>
                    {client.status}
                  </span>
                </div>
                <div
                  style={s.arrowBtn}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(201,168,76,.25)'
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,.5)'
                    e.stopPropagation()
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(201,168,76,.1)'
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,.2)'
                  }}
                >
                  →
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
