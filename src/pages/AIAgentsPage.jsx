import { useState } from 'react'

export default function AIAgentsPage() {
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ padding:'20px 24px', overflowY:'auto', height:'100%' }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:4 }}>
        AI Agents
      </div>
      <div style={{ fontSize:11, color:'var(--muted-foreground)', marginBottom:20 }}>
        The Paperclip team — 27 agents with AETHER identity profiles
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10 }}>
        {PAPERCLIP_AGENTS.map(agent => (
          <div
            key={agent.id}
            onClick={() => setSelected(selected?.id === agent.id ? null : agent)}
            style={{
              padding:'12px 14px', borderRadius:8, cursor:'pointer',
              background: selected?.id === agent.id ? 'rgba(201,168,76,.12)' : 'var(--card)',
              border: `1px solid ${selected?.id === agent.id ? 'rgba(201,168,76,.4)' : 'var(--border)'}`,
              transition:'all .15s',
            }}
          >
            <div style={{ fontSize:18, marginBottom:6 }}>{agent.emoji}</div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--foreground)', marginBottom:3 }}>{agent.role}</div>
            <div style={{ fontSize:10, color:'var(--muted-foreground)' }}>Exp {agent.expression} · {agent.archetype}</div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ marginTop:20, padding:'16px 18px', borderRadius:10, background:'rgba(201,168,76,.06)', border:'1px solid rgba(201,168,76,.2)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <span style={{ fontSize:28 }}>{selected.emoji}</span>
            <div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--gold)' }}>{selected.role}</div>
              <div style={{ fontSize:10, color:'var(--muted-foreground)', marginTop:2 }}>Expression {selected.expression} · {selected.archetype}</div>
            </div>
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.7)', lineHeight:1.7 }}>{selected.description}</div>
          <div style={{ marginTop:10, display:'flex', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:10, color:'rgba(201,168,76,.6)', padding:'3px 8px', border:'1px solid rgba(201,168,76,.15)', borderRadius:10 }}>Shadow: {selected.shadow}</span>
            <span style={{ fontSize:10, color:'rgba(96,180,80,.6)', padding:'3px 8px', border:'1px solid rgba(96,180,80,.15)', borderRadius:10 }}>Gift: {selected.gift}</span>
          </div>
        </div>
      )}
    </div>
  )
}

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
