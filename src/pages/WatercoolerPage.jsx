import { useState, useEffect, useCallback, useRef } from 'react'
import { generateConstellationConversation } from '../lib/constellationWatercooler'
import { loadThreads, addThreads, clearThreads } from '../lib/watercoolerStore'
import { useGolemStore } from '../store/useGolemStore'

// ── Relationship colors ──
const REL_COLORS = {
  partner: '#d43070', spouse: '#f0a03c', 'ex-spouse': '#b03050', 'ex-partner': '#b03050',
  mother: '#d43070', father: '#40ccdd', sibling: '#9050e0', child: '#60b030',
  grandparent: '#40ccdd', 'close-friend': '#6450ff', friend: '#8844ff',
  colleague: '#60a0c8', mentor: '#9050e0', 'business-partner': '#c9a84c',
  other: '#6b7280',
}
function getRelColor(rel) { return REL_COLORS[rel] || '#c9a84c' }

function buildGraphData(profiles, threads) {
  const convCounts = {}
  const edgeMap = {}
  const edgeTimestamps = {}
  profiles.forEach(p => { convCounts[String(p.id || p.name)] = 0 })
  threads.forEach(thread => {
    const participants = new Set()
    if (thread.participants) {
      thread.participants.forEach(p => {
        const key = String(p.id)
        if (convCounts[key] !== undefined) participants.add(key)
      })
    }
    thread.messages?.forEach(m => {
      const key = String(m.agentId || m.agent || '')
      if (convCounts[key] !== undefined) participants.add(key)
    })
    participants.forEach(id => { convCounts[id] = (convCounts[id] || 0) + 1 })
    const parts = [...participants]
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const key = [parts[i], parts[j]].sort().join('|')
        edgeMap[key] = (edgeMap[key] || 0) + 1
        edgeTimestamps[key] = thread.createdAt || Date.now()
      }
    }
  })
  const edges = Object.entries(edgeMap).map(([key, weight]) => {
    const [source, target] = key.split('|')
    return { source, target, weight, timestamp: edgeTimestamps[key] }
  })
  return { convCounts, edges }
}

function findTopConnected(profiles, edges, n = 3) {
  const counts = {}
  profiles.forEach(p => { counts[String(p.id || p.name)] = 0 })
  edges.forEach(e => {
    counts[e.source] = (counts[e.source] || 0) + e.weight
    counts[e.target] = (counts[e.target] || 0) + e.weight
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n).map(([id]) => id)
}


// ── Feed Styles ──
const S = {
  page: {
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    fontFamily: "'Cormorant Garamond', Georgia, serif", background: 'var(--background, #0a0a0f)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1.25rem 2rem 0.75rem', flexShrink: 0,
  },
  titleBlock: { display: 'flex', flexDirection: 'column' },
  title: {
    fontSize: '1.6rem', fontFamily: "'Cinzel', serif",
    color: 'var(--foreground, #e0e0e0)', letterSpacing: '.1em',
  },
  subtitle: {
    color: 'var(--muted-foreground, #888)', fontSize: '0.85rem',
    marginTop: '0.15rem', fontStyle: 'italic',
  },
  controls: { display: 'flex', gap: '0.6rem', alignItems: 'center' },
  btn: {
    padding: '0.4rem 1.2rem', borderRadius: '6px', border: '1px solid var(--border, #333)',
    background: 'var(--card, #111)', color: 'var(--foreground, #e0e0e0)', cursor: 'pointer',
    fontFamily: "'Cinzel', serif", fontSize: '0.8rem', letterSpacing: '.05em',
  },
  btnPrimary: {
    padding: '0.4rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(147,51,234,0.5)',
    background: 'rgba(147,51,234,0.15)', color: '#c084fc', cursor: 'pointer',
    fontFamily: "'Cinzel', serif", fontSize: '0.8rem',
  },
  btnActive: {
    padding: '0.4rem 1.2rem', borderRadius: '6px', border: '1px solid #c9a84c',
    background: 'rgba(201,168,76,0.1)', color: '#c9a84c', cursor: 'pointer',
    fontFamily: "'Cinzel', serif", fontSize: '0.8rem',
  },
  feed: {
    flex: 1, overflowY: 'auto', padding: '0 2rem 2rem',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
  },
  empty: {
    textAlign: 'center', color: 'var(--muted-foreground, #888)',
    padding: '4rem 1rem', fontSize: '1rem',
  },
  thread: {
    background: 'var(--card, #111)', border: '1px solid var(--border, #222)',
    borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color .15s',
  },
  threadHeader: {
    padding: '0.65rem 1rem', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap',
  },
  chips: { display: 'flex', gap: '0.3rem', flexWrap: 'wrap' },
  chip: {
    display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
    padding: '0.1rem 0.45rem', borderRadius: '999px',
    background: 'rgba(255,255,255,0.06)', fontSize: '0.72rem',
    color: 'var(--foreground, #ddd)', whiteSpace: 'nowrap',
  },
  topicLabel: { fontSize: '0.78rem', color: 'var(--muted-foreground, #888)', fontStyle: 'italic' },
  timestamp: { fontSize: '0.68rem', color: 'var(--muted-foreground, #666)', whiteSpace: 'nowrap' },
  messages: { padding: '0 1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  bubble: { padding: '0.45rem 0.7rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' },
  bubbleName: { fontSize: '0.68rem', color: 'var(--muted-foreground, #999)', marginBottom: '0.1rem', fontWeight: 600 },
  bubbleText: { fontSize: '0.88rem', color: 'var(--foreground, #ddd)', lineHeight: 1.45 },
  skeleton: {
    background: 'var(--card, #111)', border: '1px solid var(--border, #222)',
    borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
  },
  skelLine: {
    height: '0.85rem', borderRadius: '4px',
    background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite',
  },
  // ── Microfish canvas ──
  fishWrap: { position: 'relative', flex: 1, overflow: 'hidden', background: '#0a0a0f' },
  fishCanvas: { width: '100%', height: '100%', display: 'block' },
  fishTopLeft: { position: 'absolute', top: 14, left: 18, zIndex: 10 },
  fishTitle: { fontSize: 18, fontWeight: 700, color: '#c9a84c', fontFamily: 'monospace', letterSpacing: 3 },
  fishSubtitle: { fontSize: 11, color: '#666', fontFamily: 'monospace', marginTop: 3 },
  fishTopRight: { position: 'absolute', top: 14, right: 18, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 3 },
  fishLegendItem: { display: 'flex', alignItems: 'center', gap: 5 },
  fishLegendDot: { width: 8, height: 8, borderRadius: '50%' },
  fishLegendLabel: { fontSize: 10, color: '#777', fontFamily: 'monospace' },
  fishBottomRight: { position: 'absolute', bottom: 80, right: 18, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 5 },
  fishCtrlBtn: {
    width: 34, height: 34, border: '1px solid #333', borderRadius: 6,
    background: 'rgba(20,20,30,0.9)', color: '#ccc', fontSize: 16,
    cursor: 'pointer', fontFamily: 'monospace',
  },
  fishTimeline: { position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 10, textAlign: 'center' },
  fishTimelineTrack: { display: 'flex', gap: 6 },
  fishYearBtn: {
    padding: '7px 16px', border: '1px solid #333', borderRadius: 8,
    background: 'rgba(20,20,30,0.9)', color: '#888', fontSize: 12,
    fontFamily: 'monospace', cursor: 'pointer',
  },
  fishYearBtnActive: { borderColor: '#c9a84c', color: '#c9a84c', background: 'rgba(201,168,76,0.1)' },
  fishSimulating: { marginTop: 6, color: '#c9a84c', fontSize: 11, fontFamily: 'monospace' },
  fishNarrative: {
    position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)',
    maxWidth: 560, padding: '10px 18px', background: 'rgba(10,10,15,0.92)',
    border: '1px solid #333', borderRadius: 10, color: '#bbb', fontSize: 12,
    fontFamily: 'monospace', lineHeight: 1.5, textAlign: 'center', zIndex: 10,
  },
  fishTooltip: {
    position: 'fixed', padding: '9px 13px', background: 'rgba(10,10,20,0.97)',
    border: '1px solid #c9a84c', borderRadius: 8, zIndex: 999, pointerEvents: 'none',
  },
  fishTooltipName: { color: '#e0e0e0', fontSize: 12, fontWeight: 600 },
  fishTooltipRole: { color: '#9333ea', fontSize: 10, fontFamily: 'monospace', marginTop: 2 },
  fishTooltipStat: { color: '#c9a84c', fontSize: 10, fontFamily: 'monospace', marginTop: 3 },
}

function formatTime(ts) {
  return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ── Thread component ──
function Thread({ thread }) {
  const [open, setOpen] = useState(false)
  const preview = thread.messages?.[0]
  const remaining = (thread.messages?.length || 0) - 1
  return (
    <div style={S.thread} onClick={() => setOpen(o => !o)}>
      <div style={S.threadHeader}>
        <div style={S.chips}>
          {thread.participants.map(p => (
            <span key={p.id} style={S.chip}>{p.emoji} {p.name.split('—')[0].trim().slice(0, 18)}</span>
          ))}
        </div>
        <span style={S.topicLabel}>{thread.topic}</span>
        <span style={S.timestamp}>{formatTime(thread.createdAt)}</span>
      </div>
      {preview && !open && (
        <div style={{ padding: '0 1rem 0.6rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>{preview.agentEmoji}</span>
            <div>
              <span style={{ ...S.bubbleName, display: 'inline', marginRight: '0.35rem' }}>{preview.agentName}:</span>
              <span style={{ ...S.bubbleText, display: 'inline', color: '#999', fontSize: '0.82rem' }}>
                {preview.text.length > 120 ? preview.text.slice(0, 120) + '…' : preview.text}
              </span>
            </div>
          </div>
          {remaining > 0 && (
            <div style={{ fontSize: '0.68rem', color: '#666', paddingLeft: '1.8rem', marginTop: '0.15rem' }}>
              +{remaining} more ↓
            </div>
          )}
        </div>
      )}
      {open && (
        <div style={S.messages}>
          {thread.messages.map((m, i) => (
            <div key={i} style={S.bubble}>
              <div style={S.bubbleName}>{m.agentEmoji} {m.agentName}</div>
              <div style={S.bubbleText}>{m.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SkeletonThread() {
  return (
    <div style={S.skeleton}>
      <div style={{ ...S.skelLine, width: '60%' }} />
      <div style={{ ...S.skelLine, width: '80%' }} />
      <div style={{ ...S.skelLine, width: '45%' }} />
    </div>
  )
}

// ── Microfish canvas view ──
function MicrofishView({ threads, profiles }) {
  const canvasRef = useRef(null)
  const nodesRef = useRef([])
  const edgesRef = useRef([])
  const animRef = useRef(null)
  const pausedRef = useRef(false)
  const scaleRef = useRef(1)
  const hoverRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const topRef = useRef([])

  const [edgeCount, setEdgeCount] = useState(0)
  const [paused, setPaused] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const [scale, setScale] = useState(1)

  // Init
  useEffect(() => {
    if (!profiles.length) return
    const { convCounts, edges } = buildGraphData(profiles, threads)
    setEdgeCount(edges.length)
    edgesRef.current = edges
    topRef.current = findTopConnected(profiles, edges)

    const radius = 200
    nodesRef.current = profiles.map((p, i) => {
      const id = String(p.id || p.name)
      const angle = (2 * Math.PI * i) / profiles.length
      return {
        id, name: p.name, rel: p._isPrimary ? 'you' : (p.rel || 'other'), emoji: p.emoji || '✦',
        x: radius * Math.cos(angle) + (Math.random() - 0.5) * 30,
        y: radius * Math.sin(angle) + (Math.random() - 0.5) * 30,
        vx: 0, vy: 0,
        influence: Math.max(1, convCounts[id] || 1),
        color: p._isPrimary ? '#c9a84c' : getRelColor(p.rel),
        phase: Math.random() * Math.PI * 2,
      }
    })
  }, [threads, profiles])

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      canvas.width = canvas.parentElement?.clientWidth || 800
      canvas.height = canvas.parentElement?.clientHeight || 600
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)

    let frame = 0
    function tick() {
      animRef.current = requestAnimationFrame(tick)
      if (pausedRef.current) return
      frame++
      const W = canvas.width, H = canvas.height
      const nodes = nodesRef.current
      const edges = edgesRef.current
      const s = scaleRef.current

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x
          const dy = nodes[j].y - nodes[i].y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = 700 / (dist * dist)
          const fx = (dx / dist) * force, fy = (dy / dist) * force
          nodes[i].vx -= fx; nodes[i].vy -= fy
          nodes[j].vx += fx; nodes[j].vy += fy
        }
      }
      // Attraction
      const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))
      edges.forEach(e => {
        const a = nodeMap[e.source], b = nodeMap[e.target]
        if (!a || !b) return
        const dx = b.x - a.x, dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = dist * 0.003 * e.weight
        a.vx += (dx / dist) * force; a.vy += (dy / dist) * force
        b.vx -= (dx / dist) * force; b.vy -= (dy / dist) * force
      })
      // Center + drift
      nodes.forEach(n => {
        n.vx -= n.x * 0.001; n.vy -= n.y * 0.001
        n.vx *= 0.9; n.vy *= 0.9
        n.x += n.vx; n.y += n.vy
        n.x += Math.sin(frame * 0.01 + n.phase) * 0.3
        n.y += Math.cos(frame * 0.013 + n.phase) * 0.2
      })

      // Draw
      ctx.fillStyle = '#0a0a0f'
      ctx.fillRect(0, 0, W, H)
      ctx.save()
      ctx.translate(W / 2, H / 2)
      ctx.scale(s, s)

      const now = Date.now()
      // Edges
      edges.forEach(e => {
        const a = nodeMap[e.source], b = nodeMap[e.target]
        if (!a || !b) return
        const age = (now - (e.timestamp || now)) / (1000 * 60 * 60 * 24 * 30)
        const opacity = Math.max(0.07, 0.45 - age * 0.05)
        ctx.beginPath()
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = `rgba(201,168,76,${opacity})`
        ctx.lineWidth = Math.min(4, 0.4 + e.weight * 0.7)
        ctx.stroke()
      })

      // Nodes
      const top3 = topRef.current
      nodes.forEach(n => {
        const r = Math.max(8, 5 + n.influence * 2.5)
        const isTop = top3.includes(n.id)
        if (isTop) {
          const glow = ctx.createRadialGradient(n.x, n.y, r, n.x, n.y, r * 2.8)
          glow.addColorStop(0, `${n.color}55`); glow.addColorStop(1, `${n.color}00`)
          ctx.beginPath(); ctx.arc(n.x, n.y, r * 2.8, 0, Math.PI * 2)
          ctx.fillStyle = glow; ctx.fill()
        }
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fillStyle = n.color + 'cc'; ctx.fill()
        ctx.strokeStyle = n.color; ctx.lineWidth = 1.5; ctx.stroke()
        ctx.fillStyle = '#ddd'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText(n.name.split(' ')[0], n.x, n.y + r + 14)
      })
      ctx.restore()

      // Hover
      const mx = (mouseRef.current.x - W / 2) / s
      const my = (mouseRef.current.y - H / 2) / s
      let hoveredNode = null
      for (const n of nodes) {
        const r = Math.max(8, 5 + n.influence * 2.5)
        const dx = mx - n.x, dy = my - n.y
        if (dx * dx + dy * dy < (r + 8) * (r + 8)) { hoveredNode = n; break }
      }
      hoverRef.current = hoveredNode
    }

    tick()
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect() }
  }, [])

  useEffect(() => { pausedRef.current = paused }, [paused])
  useEffect(() => { scaleRef.current = scale }, [scale])

  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    setTooltip(hoverRef.current ? { x: e.clientX, y: e.clientY, node: hoverRef.current } : null)
  }, [])

  if (!profiles.length) {
    return (
      <div style={{ ...S.fishWrap, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
        <div style={{ fontSize:32 }}>🐟</div>
        <div style={{ color:'#888', fontFamily:'monospace', fontSize:13 }}>Add people to your constellation to see the graph</div>
      </div>
    )
  }

  return (
    <div style={S.fishWrap}>
      <canvas ref={canvasRef} style={S.fishCanvas} onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)} />

      <div style={S.fishTopLeft}>
        <div style={S.fishTitle}>🐟 FISHBOWL</div>
        <div style={S.fishSubtitle}>{profiles.length} people · {edgeCount} connections</div>
      </div>

      <div style={S.fishBottomRight}>
        <button style={S.fishCtrlBtn} onClick={() => setScale(s => Math.min(3, s + 0.2))}>+</button>
        <button style={S.fishCtrlBtn} onClick={() => setScale(s => Math.max(0.3, s - 0.2))}>−</button>
        <button style={S.fishCtrlBtn} onClick={() => setPaused(p => !p)}>{paused ? '▶' : '⏸'}</button>
      </div>

      {tooltip && (
        <div style={{ ...S.fishTooltip, left: tooltip.x + 12, top: tooltip.y - 40 }}>
          <div style={S.fishTooltipName}>{tooltip.node.emoji} {tooltip.node.name}</div>
          <div style={S.fishTooltipRole}>{tooltip.node.rel}</div>
          <div style={S.fishTooltipStat}>Dialogues: {tooltip.node.influence}</div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ──
export default function WatercoolerPage() {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('feed') // 'feed' | 'microfish'

  const primaryProfile = useGolemStore((s) => s.primaryProfile)
  const people = useGolemStore((s) => s.people)

  const allProfiles = [
    { ...primaryProfile, _isPrimary: true },
    ...(people || []),
  ].filter(p => p.name)

  useEffect(() => { setThreads(loadThreads()) }, [])

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    try {
      const convoThread = await generateConstellationConversation(allProfiles)
      if (convoThread) {
        setThreads(prev => [convoThread, ...prev])
        addThreads([convoThread])
      }
    } finally { setLoading(false) }
  }, [allProfiles])

  const handleClear = useCallback(() => { setThreads(clearThreads()) }, [])

  return (
    <div style={S.page}>
      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.9} }`}</style>

      <div style={S.header}>
        <div style={S.titleBlock}>
          <div style={S.title}>🐟 Fishbowl</div>
          <div style={S.subtitle}>
            {allProfiles.length < 2
              ? 'Add people in Profiles to start the dialogues'
              : `Your constellation speaks · ${allProfiles.length} profiles`}
          </div>
        </div>
        <div style={S.controls}>
          <button
            style={view === 'feed' ? S.btnActive : S.btn}
            onClick={() => setView('feed')}
          >Feed</button>
          <button
            style={view === 'microfish' ? S.btnActive : S.btn}
            onClick={() => setView('microfish')}
          >🐟 Graph</button>
          {view === 'feed' && (
            <>
              <button style={S.btnPrimary} onClick={handleGenerate} disabled={loading || allProfiles.length < 2}>
                {loading ? 'Generating…' : 'Generate'}
              </button>
              {threads.length > 0 && (
                <button style={S.btn} onClick={handleClear}>Clear</button>
              )}
            </>
          )}
        </div>
      </div>

      {view === 'microfish' ? (
        <MicrofishView threads={threads} profiles={allProfiles} />
      ) : (
        <div style={S.feed}>
          {loading && threads.length === 0 && (<><SkeletonThread /><SkeletonThread /><SkeletonThread /></>)}
          {!loading && threads.length === 0 && (
            <div style={S.empty}>
              {allProfiles.length < 2
                ? 'Add people to your constellation in Profiles to unlock golem dialogues.'
                : 'Your constellation golems are ready to talk. Hit Generate to begin.'}
            </div>
          )}
          {threads.map(t => <Thread key={t.id} thread={t} />)}
        </div>
      )}
    </div>
  )
}
