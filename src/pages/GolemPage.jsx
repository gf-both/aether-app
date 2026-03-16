import { useState, useRef, useEffect, useMemo } from 'react'
import { useAboveInsideStore } from '../store/useAboveInsideStore'
import { getNatalChart } from '../engines/natalEngine'
import { getNumerologyProfileFromDob } from '../engines/numerologyEngine'

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

  const computedChart = useMemo(() => {
    const p = profile
    if (!p?.dob) return null
    try {
      const [y,m,d] = p.dob.split('-').map(Number)
      const [h,min] = (p.tob||'12:00').split(':').map(Number)
      return getNatalChart({ day:d, month:m, year:y, hour:h||12, minute:min||0, lat:p.birthLat||0, lon:p.birthLon||0, timezone:p.birthTimezone||0 })
    } catch { return null }
  }, [profile?.dob, profile?.tob, profile?.birthLat, profile?.birthLon, profile?.birthTimezone])

  const computedNumerology = useMemo(() => {
    if (!profile?.dob || !profile?.name) return null
    try { return getNumerologyProfileFromDob(profile.dob, profile.name.toUpperCase(), {}) }
    catch { return null }
  }, [profile?.dob, profile?.name])

  const displaySign = profile?.sign && profile.sign !== '?' ? profile.sign : computedChart?.planets?.sun?.sign || '?'
  const displayMoon = profile?.moon && profile.moon !== '?' ? profile.moon : computedChart?.planets?.moon?.sign || '?'
  const displayAsc = profile?.asc && profile.asc !== '?' ? profile.asc : computedChart?.angles?.asc?.sign || '?'
  const displayLP = profile?.lifePath && profile.lifePath !== '?' ? profile.lifePath : computedNumerology?.lifePath?.val || '?'
  const displayHDType = profile?.hdType && profile.hdType !== '?' ? profile.hdType : '?'

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
      const systemPrompt = buildSystemPrompt(activeProfile, selectedGolem.label)
      const response = await callGolem(systemPrompt, userMsg, chatMessages)
      setMessages(m => ({ ...m, [selectedId]: [...(m[selectedId] || newMessages), { role: 'golem', text: response }] }))
    } catch (err) {
      console.error('Golem error:', err)
      const fallback = err?.message?.includes('API key')
        ? "I'm dormant — no key to animate me. Set VITE_ANTHROPIC_API_KEY to wake me."
        : "I'm having trouble connecting right now. My essence is here — try again in a moment."
      setMessages(m => ({ ...m, [selectedId]: [...(m[selectedId] || []), { role: 'golem', text: fallback }] }))
    }
    setLoading(false)
  }

  async function callGolem(systemPrompt, userMessage, history) {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey || apiKey.startsWith('sk-ant-REPLACE')) {
      throw new Error('No Anthropic API key configured')
    }

    // Build messages array from history + new user message
    const messagesForClaude = [
      ...history
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role === 'golem' ? 'assistant' : 'user', content: m.text })),
      { role: 'user', content: userMessage },
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 300,
        system: systemPrompt,
        messages: messagesForClaude,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err?.error?.message || `API error ${response.status}`)
    }

    const data = await response.json()
    return data.content[0].text
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
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', borderRight:'1px solid var(--border)' }}>
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

      {/* RIGHT: Golem Profile */}
      <div style={{
        width: 240, flexShrink: 0, borderLeft: '1px solid var(--border)',
        overflowY: 'auto', padding: '16px 14px', background: 'rgba(0,0,0,.12)',
      }}>
        <div style={{ fontSize:9, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(201,168,76,.6)', marginBottom:14, fontFamily:"'Cinzel',serif" }}>
          {selectedGolem.label} Profile
        </div>
        <div style={{ textAlign:'center', fontSize:48, marginBottom:12 }}>{selectedGolem.emoji}</div>
        {[
          ['Name', activeProfile?.name || '—'],
          ['☉ Sun', displaySign],
          ['☽ Moon', displayMoon],
          ['↑ Rising', displayAsc],
          ['◈ HD Type', displayHDType],
          ['◈ HD Profile', activeProfile?.hdProfile || '?'],
          ['◈ Authority', activeProfile?.hdAuth || '?'],
          ['∞ Life Path', String(displayLP)],
          ['Expression', activeProfile?.expression || '?'],
          ['Gene Keys', activeProfile?.crossGK || '?'],
          ['Dosha', activeProfile?.doshaType || '—'],
          ['Archetype', activeProfile?.archetypeType || '—'],
          ['Love Lang', activeProfile?.loveLanguage || '—'],
          ['MBTI', activeProfile?.mbtiType || '—'],
          ['Enneagram', activeProfile?.enneagramType ? `Type ${activeProfile.enneagramType}` : '—'],
        ].map(([label, value]) => (
          <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:'1px solid rgba(201,168,76,.05)', fontSize:10 }}>
            <div style={{ color:'rgba(201,168,76,.5)', fontFamily:"'Cinzel',serif", fontSize:9 }}>{label}</div>
            <div style={{ color:'var(--foreground)', textAlign:'right', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{String(value)}</div>
          </div>
        ))}
        <div style={{ marginTop:16, padding:'10px', borderRadius:7, background:'rgba(201,168,76,.05)', border:'1px solid rgba(201,168,76,.1)', fontSize:10, color:'rgba(255,255,255,.55)', lineHeight:1.6 }}>
          {selectedGolem.label === 'Your Clone' && 'Exact mirror of your profile. Speaks as you.'}
          {selectedGolem.label === 'Complement' && 'Your energetic opposite. Completes what you lack.'}
          {selectedGolem.label === 'Antagonist' && 'The force that challenges you. Pushes back.'}
          {!['Your Clone','Complement','Antagonist'].includes(selectedGolem.label) && 'Custom golem. Edit profile to shape this voice.'}
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
