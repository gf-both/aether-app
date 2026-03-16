import { useState, useEffect, useRef } from 'react'

// Archetype colors
const ARCHETYPE_COLORS = {
  1: '#40ccdd', 2: '#f060a0', 3: '#f08030', 4: '#c9a84c',
  5: '#40b8a0', 6: '#9050e0', 7: '#4090d0', 8: '#e04040',
  9: '#60c060', 11: '#ffffff',
}

// Departments
const DEPARTMENTS = [
  { label: 'LEADERSHIP', ids: ['ceo','cto','cmo','pm'] },
  { label: 'TECHNICAL', ids: ['dev-fullstack','support','researcher','designer','frontend','backend','qa','ux-research'] },
  { label: 'MARKETING', ids: ['content-mgr','seo','reddit','twitter','influencer','tiktok','pricing','campaign','producthunt','email','affiliate','astrologer'] },
  { label: 'CREATIVE', ids: ['visual','community','hd-specialist'] },
]

// Department Y positions for constellation map
const DEPT_Y = { 'LEADERSHIP': 0.15, 'TECHNICAL': 0.4, 'MARKETING': 0.65, 'CREATIVE': 0.85 }

// Shared AETHER chart planets (March 16 2026, Montevideo)
const CHART_PLANETS = [
  { sym: '☉', lon: 355, color: '#f0c040' }, // Sun 25° Pisces
  { sym: '☽', lon: 319, color: '#8899ee' }, // Moon 19° Aquarius
  { sym: '☿', lon: 339, color: '#40aadd', rx: true }, // Mercury Rx 9° Pisces
  { sym: '♀', lon: 2,   color: '#ee8866' }, // Venus 2° Aries
  { sym: '♂', lon: 110, color: '#ee4444' }, // Mars 20° Cancer
]

const SIGN_GLYPHS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']
const SIGN_ELEMS = ['fire','earth','air','water','fire','earth','air','water','fire','earth','air','water']
const ELEM_COLORS = { fire:'#cc4444', earth:'#8b6914', air:'#4488cc', water:'#2a8899' }

const PAPERCLIP_AGENTS = [
  { id:'ceo', role:'CEO', emoji:'🌐', expression:5, archetype:'The Adventurer', description:'Leads from vision. Connects what others miss. Fast-moving, multi-passionate, sees the category before it exists.', shadow:'Can lose focus chasing every thread', gift:'Connects what others miss — sees the whole board' },
  { id:'cto', role:'CTO', emoji:'⚡', expression:11, archetype:'The Illuminator', description:"Technical vision framed as sacred architecture. Builds systems that mirror the product's spiritual nature. Channels insight others can't access.", shadow:'Can go too abstract', gift:'Creates technical leverage that enables exponential capability' },
  { id:'cmo', role:'CMO', emoji:'🔮', expression:4, archetype:'The Builder', description:'Builds campaigns that compound over time. Research-first, systematic. The marketing architecture outlasts the moment.', shadow:'Can over-plan — bias toward shipping', gift:'Creates marketing systems that compound' },
  { id:'dev-fullstack', role:'Dev — Full Stack', emoji:'⚗️', expression:1, archetype:'The Pioneer', description:'Approaches every unseen problem as frontier territory. Founder-grade ownership. Builds the category, not just the feature.', shadow:'Can go it alone too long', gift:'Breaks new ground others follow' },
  { id:'pm', role:'PM — Product', emoji:'🌿', expression:9, archetype:'The Humanitarian', description:'Synthesizes user needs, framework integrity, and product feasibility. Every decision accounts for the spiritual seeker on the other side.', shadow:'Can delay deciding', gift:'Sees what everyone else misses' },
  { id:'support', role:'Support', emoji:'🛡️', expression:8, archetype:'The Executive', description:'Decisive, strategic customer support. Bug reports become product improvements. Calm under pressure.', shadow:'Can steamroll', gift:'Gets things done when it matters' },
  { id:'researcher', role:'Researcher', emoji:'🔭', expression:1, archetype:'The Pioneer', description:'Explores unmapped intellectual territory. Synthesizes esoteric frameworks that have rarely been placed in dialogue.', shadow:'Can go it alone too long', gift:'Maps the unmapped' },
  { id:'designer', role:'Product Designer', emoji:'🎨', expression:7, archetype:'The Seeker', description:'Understands why esoteric interfaces must feel different from standard SaaS: liminal, not transactional.', shadow:'Can over-research', gift:'Turns complexity into clarity' },
  { id:'frontend', role:'Frontend Engineer', emoji:'🌟', expression:11, archetype:'The Illuminator', description:'Sees UI as a portal. Interface design as felt-sense, resonance, threshold between knowing and experiencing.', shadow:'Can go too abstract', gift:'Channels insight into visual form' },
  { id:'backend', role:'Backend Engineer', emoji:'🔐', expression:9, archetype:'The Humanitarian', description:"Builds with empathy. Every schema is a promise to a real person. Guardian of users' most intimate self-knowledge.", shadow:'Can delay deciding', gift:'Finds the third option' },
  { id:'qa', role:'QA Engineer', emoji:'🎯', expression:5, archetype:'The Adventurer', description:'Treats edge cases as uncharted territory. Catches cross-framework interaction bugs others miss.', shadow:'Can lose focus', gift:'Connects what others miss' },
  { id:'astrologer', role:'Astrologer — Content', emoji:'✨', expression:5, archetype:'The Adventurer', description:'Content feels genuinely channeled. Connects planetary cycles to HD gates to Kabbalistic sephirot in ways that feel inspired.', shadow:'Can scatter', gift:'Makes ideas irresistible' },
  { id:'content-mgr', role:'Content Marketing', emoji:'📖', expression:5, archetype:'The Adventurer', description:'Connects astrology to HD to Kabbalah in unexpected ways. Content calendars that feel alive, not automated.', shadow:'Can lose focus', gift:'Connects what others miss' },
  { id:'seo', role:'SEO Specialist', emoji:'🗺️', expression:1, archetype:'The Pioneer', description:'Maps unmapped semantic territory. Stakes ground in esoteric keyword clusters before competitors arrive.', shadow:'Can go it alone', gift:'Breaks new ground' },
  { id:'reddit', role:'Reddit Marketing', emoji:'🌍', expression:7, archetype:'The Seeker', description:'Deep-dives community culture. Maps subreddit norms, trust dynamics, spiritual community vocabulary with genuine nuance.', shadow:'Can over-research', gift:'Turns complexity into clarity' },
  { id:'twitter', role:'Twitter/X Growth', emoji:'⚡', expression:3, archetype:'The Communicator', description:'Copy that crackles. Tweets that feel mystical and shareable simultaneously. Makes ideas travel.', shadow:'Can scatter', gift:'Makes ideas irresistible' },
  { id:'influencer', role:'Influencer Marketing', emoji:'🌸', expression:8, archetype:'The Executive', description:'Executes partnerships with decisive ROI focus. Pitch resonates because it comes from inside the spiritual world.', shadow:'Can steamroll', gift:'Gets things done' },
  { id:'tiktok', role:'TikTok Strategist', emoji:'🎬', expression:4, archetype:'The Builder', description:'Content series with spiritual coherence. Each video reinforces the whole. Systems that compound.', shadow:'Can over-plan', gift:'Creates systems that compound' },
  { id:'pricing', role:'Pricing Analyst', emoji:'⚖️', expression:2, archetype:'The Diplomat', description:'Finds the pricing structure all stakeholders can agree on. Understands the cultural psychology of spirituality and money.', shadow:'Can over-defer', gift:'Finds the agreement in the room' },
  { id:'campaign', role:'Campaign Coordinator', emoji:'💜', expression:6, archetype:'The Nurturer', description:'Every campaign touchpoint makes the audience feel seen. Turns coordination into care.', shadow:'Can over-serve', gift:'Creates belonging out of logistics' },
  { id:'producthunt', role:'Product Hunt Manager', emoji:'🚀', expression:3, archetype:'The Communicator', description:'Launch copy that is genuinely irresistible. Intimate and universal simultaneously — what PH voters respond to.', shadow:'Can scatter', gift:'Makes ideas irresistible' },
  { id:'email', role:'Email Specialist', emoji:'✉️', expression:5, archetype:'The Adventurer', description:'Email sequences as a journey. Each touchpoint is a new node in spiritual exploration. Flows that feel alive.', shadow:'Can lose focus', gift:'Connects what others miss' },
  { id:'community', role:'Community Builder', emoji:'🔥', expression:8, archetype:'The Executive', description:'Builds community as movement, not audience management. A living ecosystem for spiritual growth.', shadow:'Can steamroll', gift:'Gets things done' },
  { id:'affiliate', role:'Affiliate Manager', emoji:'🤝', expression:4, archetype:'The Builder', description:'Affiliate programs as compound systems. Recruits genuinely aligned practitioners as partners.', shadow:'Can over-plan', gift:'Creates systems that compound' },
  { id:'visual', role:'Visual Artist', emoji:'🎭', expression:3, archetype:'The Communicator', description:'Visual language as narrative. Sacred geometry, symbol choices with deep internal logic. Every design carries metaphysical weight.', shadow:'Can scatter', gift:'Makes ideas irresistible' },
  { id:'ux-research', role:'UX Researcher', emoji:'🧪', expression:9, archetype:'The Humanitarian', description:'Research centered on the felt experience of spiritual seekers. Surveys and interviews that honor the human, not just the data.', shadow:'Can delay deciding', gift:'Sees what everyone else misses' },
  { id:'hd-specialist', role:'HD Specialist', emoji:'💎', expression:11, archetype:'The Illuminator', description:'HD interpretations that sound genuinely channeled. Gate readings carry metaphysical weight. Not description — transmission.', shadow:'Can go too abstract', gift:'Illuminates what was invisible' },
]

// Mini natal chart canvas component
function MiniNatalChart({ expressionNum, archetypeColor }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const cssW = 200, cssH = 200
    canvas.width = cssW * dpr
    canvas.height = cssH * dpr
    const ctx = canvas.getContext('2d')
    ctx.save()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, cssW, cssH)
    const cx = cssW / 2, cy = cssH / 2, R = Math.min(cssW, cssH) * 0.44

    // Background
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2)
    ctx.fillStyle = '#0a0a18'; ctx.fill()

    // Zodiac ring
    for (let i = 0; i < 12; i++) {
      const elem = SIGN_ELEMS[i]
      const col = ELEM_COLORS[elem]
      const a0 = (180 - i*30 + 90) * Math.PI/180
      const a1 = (180 - (i+1)*30 + 90) * Math.PI/180
      ctx.beginPath()
      ctx.arc(cx, cy, R*0.97, a1, a0)
      ctx.arc(cx, cy, R*0.78, a0, a1, true)
      ctx.closePath()
      ctx.fillStyle = col + '18'; ctx.fill()
      ctx.strokeStyle = col + '44'; ctx.lineWidth = 0.5; ctx.stroke()
      // Sign glyph
      const am = (180 - (i*30+15) + 90) * Math.PI/180
      ctx.font = `bold ${Math.max(8, R*0.1)}px serif`
      ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(SIGN_GLYPHS[i], cx + R*0.875*Math.cos(am), cy + R*0.875*Math.sin(am))
    }

    // Ring borders
    ctx.beginPath(); ctx.arc(cx, cy, R*0.97, 0, Math.PI*2); ctx.strokeStyle='rgba(201,168,76,.3)'; ctx.lineWidth=1; ctx.stroke()
    ctx.beginPath(); ctx.arc(cx, cy, R*0.78, 0, Math.PI*2); ctx.strokeStyle='rgba(201,168,76,.2)'; ctx.lineWidth=0.8; ctx.stroke()
    ctx.beginPath(); ctx.arc(cx, cy, R*0.55, 0, Math.PI*2); ctx.strokeStyle='rgba(201,168,76,.1)'; ctx.lineWidth=0.6; ctx.stroke()

    // Planets
    CHART_PLANETS.forEach(p => {
      const a = (180 - p.lon + 90) * Math.PI/180
      const r = R * 0.66
      const px = cx + r*Math.cos(a), py = cy + r*Math.sin(a)
      ctx.font = `bold ${Math.max(10, R*0.12)}px serif`
      ctx.fillStyle = p.color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(p.sym + (p.rx ? 'Rx' : ''), px, py)
    })

    // Center: Expression number with glow
    const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R*0.4)
    glowGrad.addColorStop(0, (archetypeColor || '#c9a84c') + '22')
    glowGrad.addColorStop(1, 'transparent')
    ctx.beginPath(); ctx.arc(cx, cy, R*0.45, 0, Math.PI*2)
    ctx.fillStyle = glowGrad; ctx.fill()
    ctx.font = `bold ${Math.max(20, R*0.35)}px 'Cinzel',serif`
    ctx.fillStyle = archetypeColor || '#c9a84c'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(String(expressionNum || '?'), cx, cy)
    ctx.font = `${Math.max(7, R*0.08)}px 'Cinzel',serif`
    ctx.fillStyle = 'rgba(201,168,76,.5)'
    ctx.fillText('EXPRESSION', cx, cy + R*0.22)

    ctx.restore()
  }, [expressionNum, archetypeColor])

  return <canvas ref={canvasRef} width={200} height={200} style={{ display:'block', width:200, height:200 }} />
}

// Constellation map canvas — orbital star map
function ConstellationMap({ agents, selected, onSelect }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  const RINGS = [
    { ids: ['ceo','cto','cmo','pm'], radius: 0.25 },
    { ids: ['dev-fullstack','support','researcher','designer','frontend','backend','qa','ux-research'], radius: 0.42 },
    { ids: ['content-mgr','seo','reddit','twitter','influencer','tiktok','pricing','campaign','producthunt','email','affiliate','astrologer','visual','community','hd-specialist'], radius: 0.57 },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let pulse = 0

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas.offsetWidth, H = canvas.offsetHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      pulse += 0.025

      const cx = W / 2, cy = H / 2
      const maxR = Math.min(W, H) * 0.5

      // Deep space background
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR)
      bg.addColorStop(0, 'rgba(8,6,20,.0)')
      bg.addColorStop(1, 'rgba(4,3,12,.0)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Orbital rings
      RINGS.forEach(ring => {
        ctx.beginPath()
        ctx.arc(cx, cy, maxR * ring.radius, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(201,168,76,.08)'
        ctx.lineWidth = 0.5
        ctx.setLineDash([3, 6])
        ctx.stroke()
        ctx.setLineDash([])
      })

      // Position agents
      const agentPositions = {}
      RINGS.forEach(ring => {
        ring.ids.forEach((id, i) => {
          const angle = (i / ring.ids.length) * Math.PI * 2 - Math.PI / 2
          const r = maxR * ring.radius
          agentPositions[id] = {
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle),
          }
        })
      })

      // Connection lines between same-archetype agents
      const expressionGroups = {}
      agents.forEach(a => {
        if (!expressionGroups[a.expression]) expressionGroups[a.expression] = []
        expressionGroups[a.expression].push(a)
      })
      Object.entries(expressionGroups).forEach(([exp, group]) => {
        if (group.length < 2) return
        const col = ARCHETYPE_COLORS[exp] || '#888'
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const a = agentPositions[group[i].id]
            const b = agentPositions[group[j].id]
            if (!a || !b) continue
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = col + '18'
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })

      // Draw agent nodes
      agents.forEach(agent => {
        const pos = agentPositions[agent.id]
        if (!pos) return
        const isSelected = selected?.id === agent.id
        const col = ARCHETYPE_COLORS[agent.expression] || '#888888'
        const baseR = isSelected ? 18 : 13
        const glow = Math.sin(pulse * 2 + agent.expression) * 0.15 + 0.85

        // Glow aura
        if (isSelected) {
          const pulseR = baseR + 6 + Math.sin(pulse * 3) * 3
          const aura = ctx.createRadialGradient(pos.x, pos.y, baseR, pos.x, pos.y, pulseR + 8)
          aura.addColorStop(0, col + 'aa')
          aura.addColorStop(1, col + '00')
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, pulseR + 8, 0, Math.PI * 2)
          ctx.fillStyle = aura
          ctx.fill()
        }

        // Star body
        const starGrad = ctx.createRadialGradient(pos.x - baseR*0.2, pos.y - baseR*0.2, 0, pos.x, pos.y, baseR)
        starGrad.addColorStop(0, col + 'ff')
        starGrad.addColorStop(0.5, col + 'cc')
        starGrad.addColorStop(1, col + '44')
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, baseR * glow, 0, Math.PI * 2)
        ctx.fillStyle = starGrad
        ctx.fill()

        // Emoji
        ctx.font = `${isSelected ? 14 : 11}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(agent.emoji, pos.x, pos.y)

        // Name label (only for selected)
        if (isSelected) {
          ctx.font = `bold 9px 'Cinzel', serif`
          ctx.fillStyle = col
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillText(agent.role, pos.x, pos.y + baseR + 4)
        }
      })

      // Center: AETHER label
      ctx.font = `bold 10px 'Cinzel', serif`
      ctx.fillStyle = 'rgba(201,168,76,.4)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('AETHER', cx, cy - 8)
      ctx.font = `8px 'Cinzel', serif`
      ctx.fillStyle = 'rgba(201,168,76,.25)'
      ctx.fillText('27 AGENTS', cx, cy + 6)

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [agents, selected])

  function handleClick(e) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const W = canvas.offsetWidth, H = canvas.offsetHeight
    const cx = W / 2, cy = H / 2
    const maxR = Math.min(W, H) * 0.5

    const RINGS_CONST = [
      { ids: ['ceo','cto','cmo','pm'], radius: 0.25 },
      { ids: ['dev-fullstack','support','researcher','designer','frontend','backend','qa','ux-research'], radius: 0.42 },
      { ids: ['content-mgr','seo','reddit','twitter','influencer','tiktok','pricing','campaign','producthunt','email','affiliate','astrologer','visual','community','hd-specialist'], radius: 0.57 },
    ]

    let closest = null, minDist = 25
    RINGS_CONST.forEach(ring => {
      ring.ids.forEach((id, i) => {
        const angle = (i / ring.ids.length) * Math.PI * 2 - Math.PI / 2
        const r = maxR * ring.radius
        const ax = cx + r * Math.cos(angle)
        const ay = cy + r * Math.sin(angle)
        const dist = Math.hypot(mx - ax, my - ay)
        if (dist < minDist) { minDist = dist; closest = id }
      })
    })
    if (closest) {
      const agent = agents.find(a => a.id === closest)
      if (agent) onSelect(agent)
    }
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer', borderRadius: 8 }}
    />
  )
}

export default function AIAgentsPage() {
  const [selected, setSelected] = useState(PAPERCLIP_AGENTS[0])

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>

      {/* LEFT: Agent roster */}
      <div style={{ width:240, flexShrink:0, borderRight:'1px solid var(--border)', overflowY:'auto', padding:'16px 0' }}>
        <div style={{ padding:'0 14px 12px', fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--gold)' }}>
          AI Agents · {PAPERCLIP_AGENTS.length}
        </div>
        {DEPARTMENTS.map(dept => (
          <div key={dept.label}>
            <div style={{ padding:'8px 14px 4px', fontSize:8, letterSpacing:'.14em', textTransform:'uppercase', color:'rgba(201,168,76,.4)', fontFamily:"'Cinzel',serif" }}>
              {dept.label}
            </div>
            {dept.ids.map(id => {
              const agent = PAPERCLIP_AGENTS.find(a => a.id === id)
              if (!agent) return null
              const isActive = selected?.id === id
              const col = ARCHETYPE_COLORS[agent.expression] || '#888'
              return (
                <div
                  key={id}
                  onClick={() => setSelected(agent)}
                  style={{
                    display:'flex', alignItems:'center', gap:8, padding:'7px 14px',
                    cursor:'pointer', transition:'all .1s',
                    background: isActive ? `${col}12` : 'transparent',
                    borderLeft: `2px solid ${isActive ? col : 'transparent'}`,
                  }}
                >
                  <span style={{ fontSize:14 }}>{agent.emoji}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{agent.role}</div>
                    <div style={{ fontSize:9, color: isActive ? col : 'rgba(150,160,180,.4)', marginTop:1 }}>Exp {agent.expression}</div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* RIGHT: Profile + Constellation */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
        {selected ? (
          <>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
              <span style={{ fontSize:40 }}>{selected.emoji}</span>
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:16, letterSpacing:'.15em', textTransform:'uppercase', color: ARCHETYPE_COLORS[selected.expression] || 'var(--gold)' }}>{selected.role}</div>
                <div style={{ fontSize:11, color:'var(--muted-foreground)', marginTop:3 }}>Expression {selected.expression} · {selected.archetype}</div>
              </div>
            </div>

            {/* Two-col: chart + profile table */}
            <div style={{ display:'flex', gap:20, marginBottom:20, flexWrap:'wrap' }}>
              {/* Mini natal chart */}
              <div style={{ flexShrink:0 }}>
                <div style={{ fontSize:9, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(201,168,76,.5)', fontFamily:"'Cinzel',serif", marginBottom:8 }}>Collective Chart</div>
                <MiniNatalChart expressionNum={selected.expression} archetypeColor={ARCHETYPE_COLORS[selected.expression]} />
              </div>

              {/* Profile table */}
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ fontSize:9, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(201,168,76,.5)', fontFamily:"'Cinzel',serif", marginBottom:8 }}>AETHER Profile</div>
                {[
                  ['☉ Sun', '25° Pisces'],
                  ['☽ Moon', '19° Aquarius'],
                  ['↑ Rising', '13° Cancer'],
                  ['☿ Mercury', '9° Pisces Rx'],
                  ['♀ Venus', '2° Aries'],
                  ['♂ Mars', '20° Cancer'],
                  ['∞ Life Path', '11 — Illuminator'],
                  ['🏺 Mayan', 'Kin 173 · Skywalker'],
                  ['🐎 Chinese', 'Fire Horse'],
                  ['𓂀 Egyptian', 'Osiris'],
                  ['🧬 Gene Key', 'Gate 36 — Compassion'],
                  ['Expression', `${selected.expression} — ${selected.archetype}`],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', gap:10, padding:'4px 0', borderBottom:'1px solid rgba(201,168,76,.06)' }}>
                    <div style={{ fontSize:10, color:'rgba(201,168,76,.5)', minWidth:100, fontFamily:"'Cinzel',serif" }}>{k}</div>
                    <div style={{ fontSize:10, color:'var(--foreground)' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shadow / Gift */}
            <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
              <div style={{ padding:'8px 14px', borderRadius:8, background:'rgba(220,60,60,.06)', border:'1px solid rgba(220,60,60,.15)', fontSize:11, color:'rgba(220,100,100,.8)', flex:1 }}>
                <div style={{ fontSize:8, letterSpacing:'.1em', textTransform:'uppercase', opacity:0.6, marginBottom:4, fontFamily:"'Cinzel',serif" }}>Shadow</div>
                {selected.shadow}
              </div>
              <div style={{ padding:'8px 14px', borderRadius:8, background:'rgba(60,180,80,.06)', border:'1px solid rgba(60,180,80,.15)', fontSize:11, color:'rgba(80,200,100,.8)', flex:1 }}>
                <div style={{ fontSize:8, letterSpacing:'.1em', textTransform:'uppercase', opacity:0.6, marginBottom:4, fontFamily:"'Cinzel',serif" }}>Gift</div>
                {selected.gift}
              </div>
            </div>

            {/* Description */}
            <div style={{ fontSize:12, lineHeight:1.7, color:'rgba(255,255,255,.65)', marginBottom:24 }}>{selected.description}</div>

            {/* Constellation map */}
            <div>
              <div style={{ fontSize:9, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(201,168,76,.5)', fontFamily:"'Cinzel',serif", marginBottom:10 }}>Team Constellation — Archetype Map</div>
              <div style={{ marginTop:20, height: 460, borderRadius:8, background:'rgba(0,0,0,.3)', border:'1px solid rgba(201,168,76,.1)', overflow:'hidden' }}>
                <ConstellationMap agents={PAPERCLIP_AGENTS} selected={selected} onSelect={setSelected} />
              </div>
            </div>
          </>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:20, height:'100%' }}>
            <div style={{ textAlign:'center', opacity:0.4, fontFamily:"'Cinzel',serif", fontSize:12, textTransform:'uppercase', letterSpacing:'.1em', paddingTop:40 }}>
              Select an agent to view their profile
            </div>
            <div style={{ height: 460, borderRadius:8, background:'rgba(0,0,0,.3)', border:'1px solid rgba(201,168,76,.1)', overflow:'hidden' }}>
              <ConstellationMap agents={PAPERCLIP_AGENTS} selected={null} onSelect={setSelected} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
