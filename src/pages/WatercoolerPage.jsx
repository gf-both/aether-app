import { useState, useEffect, useCallback, useRef } from 'react'
import { generateConstellationConversation } from '../lib/constellationWatercooler'
import { loadThreads, addThreads, clearThreads } from '../lib/watercoolerStore'
import { useGolemStore } from '../store/useGolemStore'
import { computePersonData } from '../hooks/useActiveProfile'

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

// ── Enneagram psychological data for narrative generation ──
const ENNEA = {
  1: {
    name: 'Reformer', shadow: 'repressed anger expressed as relentless correction',
    gift: 'moral integrity and a love that actually holds you to your best self',
    coping: 'corrects the world to manage inner tension',
    wound: 'believing they are fundamentally flawed and must earn their place',
    relPattern: 'holds partners to impossible standards while denying their own imperfections',
    yr1: 'brings discipline and clarity — the bond feels principled and real',
    yr2: 'criticism hardens into pattern; the partner feels perpetually evaluated, never enough',
    yr3: 'if they soften into acceptance, the gift fully arrives: unmatched reliability and a love that sees you with clear eyes',
  },
  2: {
    name: 'Helper', shadow: 'hidden resentment fermenting beneath compulsive giving',
    gift: 'unconditional warmth and the rare capacity to make someone feel truly held',
    coping: 'gives in order to be loved — turns service into a bid for worthiness',
    wound: 'believing they are only lovable when useful to others',
    relPattern: 'creates invisible debts through giving, then collapses when those go unrecognized',
    yr1: 'floods the bond with warmth and attentive presence — it feels like finally being held',
    yr2: 'resentment begins leaking through: the giving was never free, it was a contract',
    yr3: 'if they stop performing love and start receiving it, they become capable of genuine intimacy for the first time',
  },
  3: {
    name: 'Achiever', shadow: 'performing connection rather than inhabiting it',
    gift: 'infectious inspiration and the capacity to make partners feel like their best selves',
    coping: 'succeeds and excels to feel worthy of love',
    wound: 'believing their value is entirely conditional on what they produce',
    relPattern: 'optimizes the relationship like a project — efficient, impressive, emotionally absent',
    yr1: 'shows up magnetic and high-functioning — the relationship accelerates beautifully',
    yr2: 'the mask begins to slip; the partner wants the person, not the performance',
    yr3: 'if they reveal themselves underneath the achievement, the gift arrives: someone who genuinely builds alongside you',
  },
  4: {
    name: 'Individualist', shadow: 'melancholy and the compulsion to be extraordinary rather than present',
    gift: 'unmatched emotional depth and a presence that transforms everyone it truly touches',
    coping: 'withdraws into interiority when feeling ordinary, misunderstood, or suffocated',
    wound: 'believing they are fundamentally different from others and therefore unlovable as they are',
    relPattern: 'oscillates between longing for total union and retreating the moment it gets too close',
    yr1: 'is intensely present when feeling seen — the depth feels like recognition no one else has offered',
    yr2: 'the withdrawals deepen into a pattern the partner cannot navigate; closeness itself becomes the trigger',
    yr3: 'if they risk being ordinary and loved anyway, they discover that belonging does not require being exceptional',
  },
  5: {
    name: 'Investigator', shadow: 'emotional withdrawal behind the fortress of the intellect',
    gift: 'penetrating wisdom and a presence — when they choose to give it — that is unlike anything else',
    coping: 'retreats into ideas and analysis to avoid the terror of emotional depletion',
    wound: 'believing the world will always take more than they can regenerate',
    relPattern: 'disappears — not from cruelty but from a private fear of being emptied by intimacy',
    yr1: 'offers rare and precise intimacy in small doses that feel like treasure',
    yr2: 'the distance becomes a wall; the partner cannot reach them when presence is needed most',
    yr3: 'if they learn that being present does not drain them, they become one of the most devoted people alive',
  },
  6: {
    name: 'Loyalist', shadow: 'anxiety projected outward as perpetual doubt and unconscious testing',
    gift: 'fierce, hard-won loyalty and a courage that emerges precisely when everything is at stake',
    coping: 'tests the bond repeatedly to confirm it will not be withdrawn',
    wound: 'believing that the support they need will always ultimately disappear',
    relPattern: 'creates the very abandonment they fear by doubting until the partner finally breaks',
    yr1: 'warm and fiercely committed once trust forms — though the testing begins almost immediately',
    yr2: 'doubt escalates and becomes a distorting lens; they scan for betrayal that is not there',
    yr3: 'if they find genuine safety and stay in it, they become unshakeable — the most loyal partner imaginable',
  },
  7: {
    name: 'Enthusiast', shadow: 'compulsive escape into possibility as a strategy for avoiding pain',
    gift: 'expansive joy and the visionary capacity to make any future feel genuinely alive',
    coping: 'reframes, pivots, and accelerates when emotions turn heavy',
    wound: 'believing that remaining in pain will annihilate them',
    relPattern: 'leaves emotionally long before leaving physically — always one option away from the present',
    yr1: 'intoxicating — the bond feels like adventure, possibility, and oxygen',
    yr2: 'the lightness becomes avoidance; difficult truths are spun into plans rather than felt',
    yr3: 'if they stay when it is painful, they discover a depth in themselves they did not know was possible',
  },
  8: {
    name: 'Challenger', shadow: 'domination used as armor to protect a profound and hidden tenderness',
    gift: 'ferocious protectiveness and an uncompromising honesty that can forge something unbreakable',
    coping: 'escalates and controls to avoid the vulnerability of being hurt',
    wound: 'believing that softness will be weaponized against them the moment it is shown',
    relPattern: 'overwhelms the field until the partner either breaks or earns a trust that then becomes absolute',
    yr1: 'commands and protects simultaneously — the bond is magnetic and slightly destabilizing',
    yr2: 'the intensity either forges an unbreakable alliance or crushes everything in its path',
    yr3: 'if they let themselves be seen as tender, the full gift emerges: a fierce and devoted love like no other',
  },
  9: {
    name: 'Peacemaker', shadow: 'self-erasure performed as love, until there is no self left to give',
    gift: 'a unifying presence that can hold all sides of a conflict without collapsing',
    coping: 'merges with the partner and the relationship to avoid the threat of conflict',
    wound: 'believing their own needs and presence will disrupt or destroy everything',
    relPattern: 'disappears into the relationship while slowly suffocating from the loss of themselves',
    yr1: 'adapts perfectly — the bond feels easy, harmonious, effortless',
    yr2: 'the erased self begins surfacing through passive resistance and unexplained distance',
    yr3: 'if they reclaim their voice inside the bond, they become the rare partner who can love without consuming or being consumed',
  },
}

function buildYearNarrative(profiles, edges, year) {
  if (!year || !profiles.length) return null

  const primary = profiles.find(p => p._isPrimary) || profiles[0]
  const focal =
    profiles.find(p => !p._isPrimary && ['partner', 'spouse'].includes(p.rel)) ||
    profiles.find(p => !p._isPrimary && ['ex-spouse', 'ex-partner'].includes(p.rel)) ||
    profiles.find(p => !p._isPrimary && ['close-friend', 'friend'].includes(p.rel)) ||
    profiles.find(p => !p._isPrimary)

  if (!focal) return null

  const An = primary.name?.split(' ')[0] || 'You'
  const Bn = focal.name?.split(' ')[0] || 'them'
  const isEx = ['ex-spouse', 'ex-partner'].includes(focal.rel)

  const Ae = ENNEA[primary.enneagramType]
  const Be = ENNEA[focal.enneagramType]
  const hasBoth = Ae && Be

  // HD supplement (if computed)
  const Ahd = primary.hdType && primary.hdType !== '?' ? primary.hdType : null
  const Bhd = focal.hdType && focal.hdType !== '?' ? focal.hdType : null
  const hdLine = Ahd && Bhd
    ? ` Energetically: ${An} as a ${Ahd} meeting ${Bn} as a ${Bhd} — two different modes of moving through the world.`
    : Ahd ? ` ${An}'s ${Ahd} energy shapes how this dynamic moves.` : ''

  if (year === 1) {
    if (hasBoth) {
      return (
        `In the first year, ${An}'s ${Ae.name} pattern meets ${Bn}'s ${Be.name} shadow. ` +
        `${An} ${Ae.yr1}. ${Bn} ${Be.yr1}. ` +
        `The field is still lit by projection — what they see in each other is more mirror than person. ` +
        `${An}'s core wound (${Ae.wound}) has not yet been touched; ${Bn}'s (${Be.wound}) remains below the surface.` +
        `${hdLine} ` +
        `The gift beginning to emerge between them: ${Ae.gift} in contact with ${Be.gift}.`
      )
    }
    return (
      `In the first year, the bond between ${An} and ${Bn} is still building its grammar. ` +
      `What they offer each other has not yet been tested — the connection is real but has not yet met the real versions of each person.` +
      `${hdLine}`
    )
  }

  if (year === 2) {
    if (hasBoth) {
      return (
        `At two years, the shadow is no longer hidden. ` +
        `${An}'s pattern — ${Ae.relPattern} — has become visible and legible to ${Bn}. ` +
        `${Bn}'s pattern — ${Be.relPattern} — has done the same. ` +
        `${An} ${Ae.yr2}. ${Bn} ${Be.yr2}. ` +
        `The wound at the center of the bond: ${An}'s ${Ae.wound} colliding with ${Bn}'s ${Be.wound}. ` +
        `This is the year most bonds either transform or dissolve — the question is whether both people can see their pattern clearly enough to choose differently.` +
        (isEx ? ` If this is where the bond ended, it was not failure — it was the pattern completing itself.` : '')
      )
    }
    return (
      `At two years, the constellation has met the real. The version of ${Bn} that ${An} imagined has given way to the person who actually exists — with their shadows intact. ` +
      `What has been built is either structural or it is theater.` +
      (isEx ? ` If the bond ended here, it held its shape exactly as long as it was meant to.` : '')
    )
  }

  if (year === 3) {
    if (hasBoth) {
      const transformA = `${An} has moved toward ${Ae.yr3}`
      const transformB = `${Bn} has moved toward ${Be.yr3}`
      const giftLine = isEx
        ? `What ${An} carries forward from contact with ${Bn}'s ${Be.shadow}: a deeper relationship with ${Ae.gift}. What the rupture taught: that the wound (${Ae.wound}) needed to be seen before it could be moved through.`
        : `${transformA}. ${transformB}. The gifts that required the wound to emerge — ${Ae.gift} and ${Be.gift} — are now legible to each other, perhaps for the first time.`
      return (
        `At three years, the field has stabilized into truth. ` +
        giftLine +
        ` Three years is long enough for the pattern to have been seen, resisted, surrendered to, or transformed. ` +
        `What remains — or what was released — is not what was easiest. It is what was most real.`
      )
    }
    return (
      `At three years, ${An}'s constellation has reached its true form. ` +
      `The bonds that endured are not circumstantial — they are structural. ` +
      `What was released made space. What remained proved itself.` +
      (isEx ? ` ${Bn}'s chapter is complete — not erased, but integrated.` : ` ${Bn} has become part of the permanent architecture.`)
    )
  }

  return null
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
  const yearRef = useRef(0)

  const [edgeCount, setEdgeCount] = useState(0)
  const [paused, setPaused] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const [scale, setScale] = useState(1)
  const [year, setYear] = useState(0)

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
      const yr = yearRef.current
      const ym = 1 + yr * 0.5 // year multiplier for influence
      // Edges
      edges.forEach(e => {
        const a = nodeMap[e.source], b = nodeMap[e.target]
        if (!a || !b) return
        const age = (now - (e.timestamp || now)) / (1000 * 60 * 60 * 24 * 30)
        const opacity = Math.max(0.07, Math.min(0.75, (0.45 - age * 0.05) * ym))
        ctx.beginPath()
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = yr > 0 ? `rgba(144,80,224,${opacity})` : `rgba(201,168,76,${opacity})`
        ctx.lineWidth = Math.min(5, (0.4 + e.weight * 0.7) * (1 + yr * 0.3))
        ctx.stroke()
      })

      // Nodes
      const top3 = topRef.current
      nodes.forEach(n => {
        const r = Math.max(8, (5 + n.influence * 2.5) * Math.sqrt(ym))
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
  useEffect(() => { yearRef.current = year }, [year])

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

      {/* Year timeline */}
      <div style={S.fishTimeline}>
        <div style={S.fishTimelineTrack}>
          {['Now', '+1 yr', '+2 yr', '+3 yr'].map((label, i) => (
            <button
              key={i}
              style={{ ...S.fishYearBtn, ...(year === i ? S.fishYearBtnActive : {}) }}
              onClick={() => setYear(i)}
            >{label}</button>
          ))}
        </div>
        {year > 0 && (
          <div style={S.fishSimulating}>
            ◈ Projecting constellation evolution · {year} year{year > 1 ? 's' : ''} forward
          </div>
        )}
      </div>

      {year > 0 && (
        <div style={S.fishNarrative}>{buildYearNarrative(profiles, edgesRef.current, year)}</div>
      )}

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
    { ...computePersonData(primaryProfile), _isPrimary: true },
    ...(people || []).map(computePersonData),
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
