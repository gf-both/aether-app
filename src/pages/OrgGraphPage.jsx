import { useState, useEffect, useRef, useCallback } from 'react'
import { getAllAgents } from '../lib/watercoolerEngine'
import { callAI } from '../lib/ai'

// Role archetype color mapping
const ROLE_COLORS = {
  marketing: '#3b82f6', cmo: '#3b82f6', growth: '#3b82f6', brand: '#3b82f6', content: '#3b82f6',
  engineering: '#10b981', developer: '#10b981', tech: '#10b981', infrastructure: '#10b981', platform: '#10b981',
  design: '#a855f7', creative: '#a855f7', ux: '#a855f7', ui: '#a855f7',
  ops: '#f59e0b', operations: '#f59e0b', hr: '#f59e0b', finance: '#f59e0b', people: '#f59e0b', admin: '#f59e0b',
  strategy: '#ec4899', ceo: '#ec4899', founder: '#ec4899', vision: '#ec4899', product: '#ec4899', lead: '#ec4899',
}
const DEFAULT_COLOR = '#6b7280'

const LEGEND = [
  { label: 'Marketing/CMO', color: '#3b82f6' },
  { label: 'Engineering', color: '#10b981' },
  { label: 'Design', color: '#a855f7' },
  { label: 'Ops/HR/Finance', color: '#f59e0b' },
  { label: 'Strategy/Product', color: '#ec4899' },
  { label: 'Other', color: '#6b7280' },
]

function getRoleColor(role) {
  const lower = (role || '').toLowerCase()
  for (const [key, color] of Object.entries(ROLE_COLORS)) {
    if (lower.includes(key)) return color
  }
  return DEFAULT_COLOR
}

function getThreadData() {
  const threads = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('watercooler_threads')) {
      try {
        const data = JSON.parse(localStorage.getItem(key))
        if (Array.isArray(data)) threads.push(...data)
      } catch {}
    }
  }
  return threads
}

function buildGraphData(agents, threads) {
  // Count conversations per agent and edges between agents
  const convCounts = {}
  const edgeMap = {}
  const edgeTimestamps = {}

  agents.forEach(a => { convCounts[a.id] = 0 })

  threads.forEach(thread => {
    const participants = new Set()
    const msgs = thread.messages || thread.entries || []
    msgs.forEach(m => {
      const id = m.agentId || m.agent
      if (id && convCounts[id] !== undefined) {
        participants.add(id)
      }
    })
    participants.forEach(id => { convCounts[id] = (convCounts[id] || 0) + 1 })
    const parts = [...participants]
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const key = [parts[i], parts[j]].sort().join('|')
        edgeMap[key] = (edgeMap[key] || 0) + 1
        edgeTimestamps[key] = thread.timestamp || Date.now()
      }
    }
  })

  const edges = Object.entries(edgeMap).map(([key, weight]) => {
    const [source, target] = key.split('|')
    return { source, target, weight, timestamp: edgeTimestamps[key] }
  })

  return { convCounts, edges }
}

function findTopConnected(agents, edges, n = 3) {
  const connectionCount = {}
  agents.forEach(a => { connectionCount[a.id] = 0 })
  edges.forEach(e => {
    connectionCount[e.source] = (connectionCount[e.source] || 0) + e.weight
    connectionCount[e.target] = (connectionCount[e.target] || 0) + e.weight
  })
  return Object.entries(connectionCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([id]) => id)
}

export default function OrgGraphPage() {
  const canvasRef = useRef(null)
  const nodesRef = useRef([])
  const edgesRef = useRef([])
  const animRef = useRef(null)
  const pausedRef = useRef(false)
  const scaleRef = useRef(1)
  const hoverRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const topRef = useRef([])

  const [agents, setAgents] = useState([])
  const [edgeCount, setEdgeCount] = useState(0)
  const [paused, setPaused] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const [year, setYear] = useState(0)
  const [simulating, setSimulating] = useState(false)
  const [narrative, setNarrative] = useState('')
  const [evolutionCache, setEvolutionCache] = useState({})
  const [scale, setScale] = useState(1)

  // Initialize graph data
  useEffect(() => {
    const allAgents = getAllAgents()
    setAgents(allAgents)
    const threads = getThreadData()
    const { convCounts, edges } = buildGraphData(allAgents, threads)
    setEdgeCount(edges.length)
    edgesRef.current = edges

    const top3 = findTopConnected(allAgents, edges)
    topRef.current = top3

    // Initialize node positions in a circle
    const cx = 0, cy = 0, radius = 250
    nodesRef.current = allAgents.map((agent, i) => {
      const angle = (2 * Math.PI * i) / allAgents.length
      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        emoji: agent.emoji,
        x: cx + radius * Math.cos(angle) + (Math.random() - 0.5) * 40,
        y: cy + radius * Math.sin(angle) + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        influence: Math.max(1, convCounts[agent.id] || 1),
        color: getRoleColor(agent.role),
        phase: Math.random() * Math.PI * 2,
      }
    })

    // Load cached evolutions
    const cache = {}
    for (let y = 1; y <= 3; y++) {
      const stored = localStorage.getItem(`orgEvolution_Y${y}`)
      if (stored) {
        try { cache[y] = JSON.parse(stored) } catch {}
      }
    }
    setEvolutionCache(cache)
  }, [])

  // Force simulation + render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      canvas.width = canvas.parentElement.clientWidth
      canvas.height = canvas.parentElement.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let frame = 0
    function tick() {
      animRef.current = requestAnimationFrame(tick)
      if (pausedRef.current) return
      frame++

      const W = canvas.width, H = canvas.height
      const nodes = nodesRef.current
      const edges = edgesRef.current
      const s = scaleRef.current

      // Forces
      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x
          const dy = nodes[j].y - nodes[i].y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = 800 / (dist * dist)
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          nodes[i].vx -= fx
          nodes[i].vy -= fy
          nodes[j].vx += fx
          nodes[j].vy += fy
        }
      }

      // Attraction along edges
      const nodeMap = {}
      nodes.forEach(n => { nodeMap[n.id] = n })
      edges.forEach(e => {
        const a = nodeMap[e.source], b = nodeMap[e.target]
        if (!a || !b) return
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = dist * 0.003 * e.weight
        a.vx += (dx / dist) * force
        a.vy += (dy / dist) * force
        b.vx -= (dx / dist) * force
        b.vy -= (dy / dist) * force
      })

      // Centering
      nodes.forEach(n => {
        n.vx -= n.x * 0.001
        n.vy -= n.y * 0.001
      })

      // Integrate
      nodes.forEach(n => {
        n.vx *= 0.9
        n.vy *= 0.9
        n.x += n.vx
        n.y += n.vy
        // Sin-wave drift
        n.x += Math.sin(frame * 0.01 + n.phase) * 0.3
        n.y += Math.cos(frame * 0.013 + n.phase) * 0.2
      })

      // Render
      ctx.fillStyle = '#0a0a0f'
      ctx.fillRect(0, 0, W, H)
      ctx.save()
      ctx.translate(W / 2, H / 2)
      ctx.scale(s, s)

      // Draw edges
      const now = Date.now()
      edges.forEach(e => {
        const a = nodeMap[e.source], b = nodeMap[e.target]
        if (!a || !b) return
        const age = (now - (e.timestamp || now)) / (1000 * 60 * 60 * 24 * 30) // months
        const opacity = Math.max(0.08, 0.5 - age * 0.05)
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = `rgba(201, 168, 76, ${opacity})`
        ctx.lineWidth = Math.min(4, 0.5 + e.weight * 0.8)
        ctx.stroke()
      })

      // Draw alliance/tension edges for evolution years
      const currentEvolution = evolutionCacheRef.current
      if (currentEvolution) {
        if (currentEvolution.alliances) {
          currentEvolution.alliances.forEach(([a, b]) => {
            const na = nodeMap[a], nb = nodeMap[b]
            if (!na || !nb) return
            ctx.beginPath()
            ctx.moveTo(na.x, na.y)
            ctx.lineTo(nb.x, nb.y)
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)'
            ctx.lineWidth = 2
            ctx.setLineDash([4, 4])
            ctx.stroke()
            ctx.setLineDash([])
          })
        }
        if (currentEvolution.tensions) {
          currentEvolution.tensions.forEach(([a, b]) => {
            const na = nodeMap[a], nb = nodeMap[b]
            if (!na || !nb) return
            ctx.beginPath()
            ctx.moveTo(na.x, na.y)
            ctx.lineTo(nb.x, nb.y)
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'
            ctx.lineWidth = 2
            ctx.setLineDash([2, 6])
            ctx.stroke()
            ctx.setLineDash([])
          })
        }
      }

      // Draw nodes
      const top3 = topRef.current
      nodes.forEach(n => {
        const r = Math.max(8, 5 + n.influence * 3)
        const isTop = top3.includes(n.id)

        // Golden glow for top 3
        if (isTop) {
          const glow = ctx.createRadialGradient(n.x, n.y, r, n.x, n.y, r * 2.5)
          glow.addColorStop(0, 'rgba(201, 168, 76, 0.35)')
          glow.addColorStop(1, 'rgba(201, 168, 76, 0)')
          ctx.beginPath()
          ctx.arc(n.x, n.y, r * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = glow
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fillStyle = n.color
        ctx.fill()
        if (isTop) {
          ctx.strokeStyle = '#c9a84c'
          ctx.lineWidth = 2
          ctx.stroke()
        }

        // Label
        ctx.fillStyle = '#e0e0e0'
        ctx.font = '10px monospace'
        ctx.textAlign = 'center'
        const shortName = n.name.split('—')[0].split('-')[0].trim().split(' ')[0]
        ctx.fillText(shortName, n.x, n.y + r + 14)
      })

      ctx.restore()

      // Hover detection
      const mx = (mouseRef.current.x - W / 2) / s
      const my = (mouseRef.current.y - H / 2) / s
      let hoveredNode = null
      for (const n of nodes) {
        const r = Math.max(8, 5 + n.influence * 3)
        const dx = mx - n.x, dy = my - n.y
        if (dx * dx + dy * dy < (r + 5) * (r + 5)) {
          hoveredNode = n
          break
        }
      }
      hoverRef.current = hoveredNode
    }

    tick()
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // Keep refs in sync
  const evolutionCacheRef = useRef(null)
  useEffect(() => {
    evolutionCacheRef.current = year > 0 ? evolutionCache[year] : null
  }, [year, evolutionCache])

  useEffect(() => { pausedRef.current = paused }, [paused])
  useEffect(() => { scaleRef.current = scale }, [scale])

  // Apply evolution data to node influences
  useEffect(() => {
    if (year === 0 || !evolutionCache[year]) return
    const evo = evolutionCache[year]
    if (evo.influences) {
      nodesRef.current.forEach(n => {
        if (evo.influences[n.id] !== undefined) {
          n.influence = evo.influences[n.id]
        }
      })
    }
    setNarrative(evo.narrative || '')
  }, [year, evolutionCache])

  // Reset influences at year 0
  useEffect(() => {
    if (year === 0) {
      const threads = getThreadData()
      const { convCounts } = buildGraphData(agents, threads)
      nodesRef.current.forEach(n => {
        n.influence = Math.max(1, convCounts[n.id] || 1)
      })
      setNarrative('')
    }
  }, [year, agents])

  // Mouse tracking for hover
  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    mouseRef.current = { x, y }
    const hovered = hoverRef.current
    if (hovered) {
      setTooltip({ x: e.clientX, y: e.clientY, node: hovered })
    } else {
      setTooltip(null)
    }
  }, [])

  // Simulate year evolution
  async function simulateYear(y) {
    setSimulating(true)
    const agentSummary = agents.map(a => `${a.id}: ${a.name} (${a.role})`).join('\n')
    const prompt = `You are simulating the organizational evolution of a 27-agent AI company called Paperclip Maximizers.

Here are the agents:
${agentSummary}

Simulate YEAR ${y} of evolution. Which agents gained influence? Which lost it? What alliances formed? What tensions emerged?

Return ONLY valid JSON (no markdown, no backticks):
{"influences":{"agent-id":number_1_to_10},"alliances":[["id1","id2"]],"tensions":[["id1","id2"]],"narrative":"A 2-3 sentence narrative of what happened this year."}`

    const result = await callAI({
      systemPrompt: 'You are an organizational dynamics simulator. Return only valid JSON.',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 1200,
    })

    if (result) {
      try {
        const cleaned = result.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
        const data = JSON.parse(cleaned)
        localStorage.setItem(`orgEvolution_Y${y}`, JSON.stringify(data))
        setEvolutionCache(prev => ({ ...prev, [y]: data }))
        setYear(y)
      } catch (e) {
        console.error('Failed to parse evolution:', e)
      }
    }
    setSimulating(false)
  }

  return (
    <div style={S.container}>
      {/* Canvas */}
      <div style={S.canvasWrap}>
        <canvas
          ref={canvasRef}
          style={S.canvas}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        />
      </div>

      {/* Top-left: title + stats */}
      <div style={S.topLeft}>
        <div style={S.title}>◈ MICROFISH</div>
        <div style={S.subtitle}>{agents.length} agents · {edgeCount} edges</div>
      </div>

      {/* Top-right: legend */}
      <div style={S.topRight}>
        {LEGEND.map(l => (
          <div key={l.label} style={S.legendItem}>
            <span style={{ ...S.legendDot, backgroundColor: l.color }} />
            <span style={S.legendLabel}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Bottom-right: zoom + pause */}
      <div style={S.bottomRight}>
        <button style={S.ctrlBtn} onClick={() => setScale(s => Math.min(3, s + 0.2))}>+</button>
        <button style={S.ctrlBtn} onClick={() => setScale(s => Math.max(0.3, s - 0.2))}>−</button>
        <button style={S.ctrlBtn} onClick={() => setPaused(p => !p)}>
          {paused ? '▶' : '⏸'}
        </button>
      </div>

      {/* Bottom timeline */}
      <div style={S.timeline}>
        <div style={S.timelineTrack}>
          {[0, 1, 2, 3].map(y => (
            <button
              key={y}
              style={{
                ...S.yearBtn,
                ...(year === y ? S.yearBtnActive : {}),
              }}
              onClick={() => {
                if (y > 0 && !evolutionCache[y]) {
                  simulateYear(y)
                } else {
                  setYear(y)
                }
              }}
              disabled={simulating}
            >
              {y === 0 ? 'Now' : `Year ${y}`}
              {y > 0 && !evolutionCache[y] && ' ⟡'}
            </button>
          ))}
        </div>
        {simulating && <div style={S.simulating}>Simulating evolution…</div>}
      </div>

      {/* Narrative */}
      {narrative && (
        <div style={S.narrative}>
          {narrative}
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div style={{ ...S.tooltip, left: tooltip.x + 12, top: tooltip.y - 40 }}>
          <div style={S.tooltipName}>{tooltip.node.emoji} {tooltip.node.name}</div>
          <div style={S.tooltipRole}>{tooltip.node.role}</div>
          <div style={S.tooltipStat}>Influence: {tooltip.node.influence}</div>
        </div>
      )}
    </div>
  )
}

const S = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: '#0a0a0f',
    overflow: 'hidden',
  },
  canvasWrap: {
    position: 'absolute',
    inset: 0,
  },
  canvas: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
  topLeft: {
    position: 'absolute',
    top: 16,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#c9a84c',
    fontFamily: 'monospace',
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  topRight: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    display: 'inline-block',
  },
  legendLabel: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'monospace',
  },
  bottomRight: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  ctrlBtn: {
    width: 36,
    height: 36,
    border: '1px solid #333',
    borderRadius: 6,
    background: 'rgba(20,20,30,0.85)',
    color: '#ccc',
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'monospace',
  },
  timeline: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    textAlign: 'center',
  },
  timelineTrack: {
    display: 'flex',
    gap: 8,
  },
  yearBtn: {
    padding: '8px 18px',
    border: '1px solid #333',
    borderRadius: 8,
    background: 'rgba(20,20,30,0.85)',
    color: '#aaa',
    fontSize: 13,
    fontFamily: 'monospace',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  yearBtnActive: {
    borderColor: '#c9a84c',
    color: '#c9a84c',
    background: 'rgba(201, 168, 76, 0.1)',
  },
  simulating: {
    marginTop: 8,
    color: '#c9a84c',
    fontSize: 12,
    fontFamily: 'monospace',
    animation: 'pulse 1.5s infinite',
  },
  narrative: {
    position: 'absolute',
    bottom: 70,
    left: '50%',
    transform: 'translateX(-50%)',
    maxWidth: 600,
    padding: '12px 20px',
    background: 'rgba(10,10,15,0.9)',
    border: '1px solid #333',
    borderRadius: 10,
    color: '#ccc',
    fontSize: 13,
    fontFamily: 'monospace',
    lineHeight: 1.5,
    textAlign: 'center',
    zIndex: 10,
  },
  tooltip: {
    position: 'fixed',
    padding: '10px 14px',
    background: 'rgba(15,15,25,0.95)',
    border: '1px solid #c9a84c',
    borderRadius: 8,
    zIndex: 100,
    pointerEvents: 'none',
  },
  tooltipName: {
    color: '#e0e0e0',
    fontSize: 13,
    fontWeight: 600,
  },
  tooltipRole: {
    color: '#9333ea',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  tooltipStat: {
    color: '#c9a84c',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 4,
  },
}
