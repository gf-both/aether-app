import { useState, useRef, useEffect } from 'react'
import { useAboveInsideStore } from '../store/useAboveInsideStore'

// Build complement profile (opposite of primary profile — what completes you)
function buildComplementProfile(p) {
  const complementHD = {
    'Generator': 'Projector',
    'Manifesting Generator': 'Projector',
    'Projector': 'Generator',
    'Manifestor': 'Reflector',
    'Reflector': 'Manifestor',
  }
  const complementLP = { 1:2, 2:1, 3:9, 4:8, 5:6, 6:5, 7:3, 8:4, 9:7, 11:22, 22:11 }
  const complementSign = {
    'Aquarius':'Leo', 'Leo':'Aquarius', 'Aries':'Libra', 'Libra':'Aries',
    'Taurus':'Scorpio', 'Scorpio':'Taurus', 'Gemini':'Sagittarius', 'Sagittarius':'Gemini',
    'Cancer':'Capricorn', 'Capricorn':'Cancer', 'Virgo':'Pisces', 'Pisces':'Virgo'
  }
  return {
    ...p,
    name: `${p.name || 'Your'}'s Complement`,
    sign: complementSign[p.sign] || p.sign,
    hdType: complementHD[p.hdType] || p.hdType,
    lifePath: complementLP[p.lifePath] || p.lifePath,
    expression: complementLP[p.expression] || p.expression,
  }
}

// Build antagonist profile (shadow — what opposes or challenges you)
function buildAntagonistProfile(p) {
  const antagonistHD = {
    'Generator': 'Manifestor',
    'Manifesting Generator': 'Reflector',
    'Projector': 'Manifesting Generator',
    'Manifestor': 'Generator',
    'Reflector': 'Manifesting Generator',
  }
  const squareSign = {
    'Aquarius':'Taurus', 'Leo':'Scorpio', 'Aries':'Cancer', 'Libra':'Capricorn',
    'Taurus':'Leo', 'Scorpio':'Aquarius', 'Gemini':'Virgo', 'Sagittarius':'Pisces',
    'Cancer':'Aries', 'Capricorn':'Libra', 'Virgo':'Gemini', 'Pisces':'Sagittarius'
  }
  return {
    ...p,
    name: `${p.name || 'Your'}'s Antagonist`,
    sign: squareSign[p.sign] || p.sign,
    hdType: antagonistHD[p.hdType] || p.hdType,
    lifePath: p.lifePath ? (((Number(p.lifePath) + 4) % 9) || 9) : p.lifePath,
  }
}

export default function GolemPage() {
  const profile = useAboveInsideStore(s => s.activeViewProfile || s.primaryProfile)
  const setPrimaryProfile = useAboveInsideStore(s => s.setPrimaryProfile)

  // Fixed golems (read-only)
  const cloneGolem = { id: 'clone', label: 'Your Clone', emoji: '🪬', readonly: true, profile: profile }
  const complementGolem = { id: 'complement', label: 'Complement', emoji: '🌗', readonly: true, profile: buildComplementProfile(profile) }
  const antagonistGolem = { id: 'antagonist', label: 'Antagonist', emoji: '🔥', readonly: true, profile: buildAntagonistProfile(profile) }

  // Custom golems
  const [customGolems, setCustomGolems] = useState([])
  const [selectedId, setSelectedId] = useState('clone')
  const [messages, setMessages] = useState({})
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const allGolems = [cloneGolem, complementGolem, antagonistGolem, ...customGolems]
  const selectedGolem = allGolems.find(g => g.id === selectedId) || cloneGolem

  // Edit state for selected custom golem
  const [editProfile, setEditProfile] = useState(null)
  useEffect(() => {
    if (selectedGolem?.readonly) {
      setEditProfile(null)
    } else {
      setEditProfile({ ...selectedGolem.profile })
    }
  }, [selectedId])

  const activeProfile = editProfile || selectedGolem.profile
  const bottomRef = useRef(null)
  const chatMessages = messages[selectedId] || [{ role: 'golem', text: getWelcome(activeProfile, selectedGolem.label) }]

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  function getWelcome(p, label) {
    if (label === 'Your Clone') return `I'm ${p?.name || 'you'}. I speak exactly as you would — ${p?.sign || '?'} Sun, Life Path ${p?.lifePath || '?'}, ${p?.hdType || '?'}. Ask me anything.`
    if (label === 'Complement') return `I'm your Complement — ${p?.sign || '?'} Sun, ${p?.hdType || '?'}. Where you are strong, I balance. Where you go alone, I partner. What do you want to explore together?`
    if (label === 'Antagonist') return `I'm your Antagonist — not your enemy, but the force that tests you. ${p?.sign || '?'} Sun, ${p?.hdType || '?'}. I'll push back. I'll challenge your assumptions. Ready?`
    return `I'm ${p?.name || 'a custom Golem'}. I've been shaped from ${p?.sign || '?'} Sun energy. What do you want to explore?`
  }

  function buildSystemPrompt(p, label) {
    const roleDesc = {
      'Your Clone': `You ARE ${p?.name || 'this person'}. Speak exactly as they would — first person, their values, their blind spots.`,
      'Complement': `You are ${p?.name}. You complement the user — where they go alone, you partner. Where they are rigid, you are fluid. You speak from a perspective that completes them.`,
      'Antagonist': `You are ${p?.name}. You challenge the user. You push back on their assumptions. You play devil's advocate. You're not hostile — you're the worthy opponent that makes them stronger.`,
    }[label] || `You are ${p?.name || 'a custom Golem'}. Speak from this profile.`

    return `${roleDesc}

Profile:
- Sun: ${p?.sign || '?'}, Moon: ${p?.moon || '?'}, Rising: ${p?.asc || '?'}
- HD: ${p?.hdType || '?'} ${p?.hdProfile || ''} | Authority: ${p?.hdAuth || '?'}
- Life Path: ${p?.lifePath || '?'} | Expression: ${p?.expression || '?'}
Keep responses 2-4 sentences. Be direct.`
  }

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    const newMessages = [...chatMessages, { role: 'user', text: userMsg }]
    setMessages(m => ({ ...m, [selectedId]: newMessages }))
    setLoading(true)
    try {
      const response = await simulateResponse(activeProfile, selectedGolem.label, userMsg, newMessages.length)
      setMessages(m => ({ ...m, [selectedId]: [...(m[selectedId] || newMessages), { role: 'golem', text: response }] }))
    } catch {
      setMessages(m => ({ ...m, [selectedId]: [...(m[selectedId] || []), { role: 'golem', text: "I couldn't respond. Try again." }] }))
    }
    setLoading(false)
  }

  async function simulateResponse(p, label, msg, count) {
    const cloneResponses = [
      `My instinct is to go deeper before acting. That's classic Life Path ${p?.lifePath || '?'} — I need to understand before I move.`,
      `I notice I tend to overthink this. The ${p?.sign || '?'} in me wants to see all angles; sometimes that stalls me when I should just go.`,
      `Honestly? My blind spot here is perfectionism. I want the conditions to be perfect before committing. What would I tell someone else in this situation? Ship it.`,
    ]
    const compResponses = [
      `Where you see one path, I see two. That's the gift of the complement — I can hold what you can't.`,
      `Your ${p?.sign || '?'} energy pushes toward certainty. I offer you the value of not-knowing. Sit with the question longer.`,
      `I complete what you start. The work you can't finish alone becomes possible in partnership. What part are you avoiding?`,
    ]
    const antagonistResponses = [
      `Are you sure about that? Because from where I stand, you're justifying what you want to do anyway.`,
      `That reasoning has a hole in it. The assumption you're making is that conditions will cooperate. They rarely do. What's your plan B?`,
      `You're asking the wrong question. The real question is: what are you afraid of if this works?`,
    ]
    const responses = label === 'Complement' ? compResponses : label === 'Antagonist' ? antagonistResponses : cloneResponses
    return responses[count % responses.length]
  }

  function createCustomGolem() {
    const id = `custom-${Date.now()}`
    const newGolem = {
      id,
      label: `Custom ${customGolems.length + 1}`,
      emoji: '✦',
      readonly: false,
      profile: { ...profile },
    }
    setCustomGolems(prev => [...prev, newGolem])
    setSelectedId(id)
  }

  function updateCustomGolem(updates) {
    setCustomGolems(prev => prev.map(g => g.id === selectedId ? { ...g, profile: { ...g.profile, ...updates } } : g))
    setEditProfile(prev => ({ ...prev, ...updates }))
  }

  function deleteCustomGolem(id) {
    setCustomGolems(prev => prev.filter(g => g.id !== id))
    if (selectedId === id) setSelectedId('clone')
  }

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>

      {/* LEFT: Golem roster */}
      <div style={{ width:200, flexShrink:0, borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'14px 14px 8px', fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--gold)', flexShrink:0 }}>
          Golems
        </div>

        <div style={{ flex:1, overflowY:'auto' }}>
          {/* Fixed golems */}
          <div style={{ padding:'4px 10px', fontSize:8, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(201,168,76,.35)', fontFamily:"'Cinzel',serif", marginBottom:2 }}>Fixed</div>
          {[cloneGolem, complementGolem, antagonistGolem].map(g => {
            const isActive = selectedId === g.id
            return (
              <div key={g.id} onClick={() => setSelectedId(g.id)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', cursor:'pointer', borderLeft:`2px solid ${isActive ? 'var(--gold)' : 'transparent'}`, background: isActive ? 'rgba(201,168,76,.08)' : 'transparent', transition:'all .1s' }}>
                <span style={{ fontSize:16 }}>{g.emoji}</span>
                <div>
                  <div style={{ fontSize:11, color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{g.label}</div>
                  <div style={{ fontSize:9, color:'rgba(201,168,76,.4)', marginTop:1 }}>Read-only</div>
                </div>
              </div>
            )
          })}

          {/* Custom golems */}
          {customGolems.length > 0 && (
            <div style={{ padding:'12px 10px 4px', fontSize:8, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(201,168,76,.35)', fontFamily:"'Cinzel',serif", marginBottom:2 }}>Custom</div>
          )}
          {customGolems.map(g => {
            const isActive = selectedId === g.id
            return (
              <div key={g.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', cursor:'pointer', borderLeft:`2px solid ${isActive ? 'rgba(96,180,255,.8)' : 'transparent'}`, background: isActive ? 'rgba(96,180,255,.06)' : 'transparent', transition:'all .1s' }}>
                <span style={{ fontSize:16, flex:1 }} onClick={() => setSelectedId(g.id)}>{g.emoji} {g.label}</span>
                <span onClick={() => deleteCustomGolem(g.id)} style={{ fontSize:10, color:'rgba(200,60,60,.5)', cursor:'pointer', padding:2 }}>✕</span>
              </div>
            )
          })}
        </div>

        {/* Create button */}
        <div style={{ padding:10, borderTop:'1px solid var(--border)', flexShrink:0 }}>
          <div onClick={createCustomGolem} style={{ padding:'8px', borderRadius:7, textAlign:'center', cursor:'pointer', background:'rgba(201,168,76,.08)', border:'1px solid rgba(201,168,76,.2)', fontSize:10, color:'var(--gold)', fontFamily:"'Cinzel',serif", letterSpacing:'.08em', textTransform:'uppercase' }}>
            + New Golem
          </div>
        </div>
      </div>

      {/* CENTER: Chat */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', borderRight: !selectedGolem.readonly ? '1px solid var(--border)' : 'none' }}>
        {/* Chat header */}
        <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', flexShrink:0, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:18 }}>{selectedGolem.emoji}</span>
          <div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--gold)' }}>{selectedGolem.label}</div>
            <div style={{ fontSize:9, color:'var(--muted-foreground)', marginTop:1 }}>{activeProfile?.sign || '?'} Sun · {activeProfile?.hdType || '?'} · LP {activeProfile?.lifePath || '?'}</div>
          </div>
          {selectedGolem.readonly && <div style={{ marginLeft:'auto', fontSize:9, color:'rgba(201,168,76,.35)', padding:'2px 8px', border:'1px solid rgba(201,168,76,.15)', borderRadius:10, fontFamily:"'Cinzel',serif", textTransform:'uppercase', letterSpacing:'.08em' }}>Read-only</div>}
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px 16px', display:'flex', flexDirection:'column', gap:10 }}>
          {chatMessages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role==='user' ? 'flex-end' : 'flex-start', maxWidth:'80%', padding:'9px 13px', borderRadius: m.role==='user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: m.role==='user' ? 'var(--accent)' : 'rgba(201,168,76,.07)', border: m.role==='user' ? '1px solid var(--border)' : '1px solid rgba(201,168,76,.14)', fontSize:13, color: m.role==='user' ? 'var(--foreground)' : 'rgba(255,255,255,.85)', lineHeight:1.65 }}>
              {m.text}
            </div>
          ))}
          {loading && <div style={{ alignSelf:'flex-start', padding:'9px 13px', borderRadius:'12px 12px 12px 2px', background:'rgba(201,168,76,.04)', fontSize:12, color:'rgba(201,168,76,.4)', fontStyle:'italic' }}>thinking...</div>}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding:'10px 14px 12px', borderTop:'1px solid var(--border)', display:'flex', gap:8, flexShrink:0 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && !e.shiftKey && send()} placeholder={`Talk to ${selectedGolem.label}...`} style={{ flex:1, padding:'9px 13px', borderRadius:8, background:'var(--secondary)', border:'1px solid var(--border)', color:'var(--foreground)', fontSize:13, outline:'none', fontFamily:'inherit' }} />
          <button onClick={send} disabled={!input.trim()||loading} style={{ padding:'9px 16px', borderRadius:8, cursor:'pointer', background: input.trim() ? 'rgba(201,168,76,.15)' : 'var(--secondary)', border:'1px solid rgba(201,168,76,.2)', color:'var(--gold)', fontSize:13, fontFamily:'inherit', transition:'all .15s' }}>Send</button>
        </div>
      </div>

      {/* RIGHT: Profile editor (custom golems only) */}
      {!selectedGolem.readonly && editProfile && (
        <div style={{ width:240, flexShrink:0, overflowY:'auto', padding:'14px 12px', background:'rgba(0,0,0,.15)' }}>
          <div style={{ fontSize:9, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(201,168,76,.6)', marginBottom:14, fontFamily:"'Cinzel',serif" }}>Edit Profile</div>

          {[
            ['Name', 'name', 'Custom name'],
            ['Sun', 'sign', 'e.g. Aquarius'],
            ['Moon', 'moon', 'e.g. Virgo'],
            ['Rising', 'asc', 'e.g. Virgo'],
            ['Life Path', 'lifePath', 'e.g. 7'],
            ['Expression', 'expression', 'e.g. 1'],
            ['HD Type', 'hdType', 'e.g. Projector'],
            ['HD Profile', 'hdProfile', 'e.g. 3/5'],
            ['HD Authority', 'hdAuth', 'e.g. Emotional'],
          ].map(([label, field, ph]) => (
            <div key={field} style={{ marginBottom:9 }}>
              <div style={{ fontSize:9, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--muted-foreground)', marginBottom:3, fontFamily:"'Cinzel',serif" }}>{label}</div>
              <input value={editProfile[field] || ''} onChange={e => updateCustomGolem({ [field]: e.target.value })} placeholder={ph} style={{ width:'100%', boxSizing:'border-box', padding:'6px 9px', borderRadius:6, background:'var(--secondary)', border:'1px solid var(--border)', color:'var(--foreground)', fontSize:11, outline:'none', fontFamily:'inherit' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
