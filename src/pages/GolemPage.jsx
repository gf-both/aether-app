import { useState, useRef, useEffect } from 'react'
import { useAboveInsideStore } from '../store/useAboveInsideStore'

export default function GolemPage() {
  const profile = useAboveInsideStore(s => s.activeViewProfile || s.primaryProfile)
  const [messages, setMessages] = useState(() => [
    { role: 'golem', text: getWelcome(profile) }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function getWelcome(p) {
    if (!p?.name) return "I'm your Golem. I speak as you. Ask me anything."
    return `I'm ${p.name}'s Golem. I hold your profile — ${p.sign || '?'} Sun, Life Path ${p.lifePath || '?'}, ${p.hdType || '?'} in Human Design. I speak from your values. What do you want to explore?`
  }

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const systemPrompt = buildGolemPrompt(profile)
      const response = await callGolem(systemPrompt, userMsg, messages)
      setMessages(m => [...m, { role: 'golem', text: response }])
    } catch (e) {
      setMessages(m => [...m, { role: 'golem', text: "I couldn't respond right now. Try again." }])
    }
    setLoading(false)
  }

  function buildGolemPrompt(p) {
    return `You ARE ${p?.name || 'this person'}. Not an assistant to them — you ARE them.

Your profile:
- Sun: ${p?.sign || 'unknown'}
- Moon: ${p?.moon || 'unknown'}
- Rising: ${p?.asc || 'unknown'}
- Human Design: ${p?.hdType || 'unknown'} ${p?.hdProfile || ''} with ${p?.hdAuth || 'unknown'} authority
- Life Path: ${p?.lifePath || 'unknown'}
- Expression: ${p?.expression || 'unknown'}

You think like them, have their blind spots, speak from their values.
Speak in first person: "I would...", "My instinct is...", "I notice I tend to..."
Be honest including about blind spots. You are a reflection, not an advisor.
Keep responses concise — 2-4 sentences unless depth is needed.`
  }

  async function callGolem(systemPrompt, userMessage, history) {
    const profileName = profile?.name || 'you'
    const sign = profile?.sign || 'unknown'
    return `[Golem AI: This response would come from Claude with ${profileName}'s profile as the system prompt. Sun in ${sign}, speaking from their values and blind spots. Integration coming soon.]`
  }

  if (!profile?.dob) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', flexDirection:'column', gap:12, opacity:.5 }}>
        <div style={{ fontSize: 40 }}>🪬</div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--gold)' }}>Add your birth date to activate Golem</div>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding: '16px 20px 12px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, flexShrink:0 }}>
        <span style={{ fontSize:24 }}>🪬</span>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:13, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--gold)' }}>Golem</div>
          <div style={{ fontSize:10, color:'var(--muted-foreground)', marginTop:2 }}>Speaking as {profile.name || 'you'}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:10, paddingBottom:8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '78%',
            padding: '10px 14px',
            borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
            background: m.role === 'user' ? 'var(--accent)' : 'rgba(201,168,76,.08)',
            border: m.role === 'user' ? '1px solid var(--border)' : '1px solid rgba(201,168,76,.15)',
            fontSize: 13,
            color: m.role === 'user' ? 'var(--foreground)' : 'rgba(255,255,255,.85)',
            lineHeight: 1.6,
          }}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf:'flex-start', padding:'10px 14px', borderRadius:'12px 12px 12px 2px', background:'rgba(201,168,76,.05)', border:'1px solid rgba(201,168,76,.1)', fontSize:12, color:'rgba(201,168,76,.4)', fontStyle:'italic' }}>
            thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display:'flex', gap:8, flexShrink:0, paddingTop:8, borderTop:'1px solid var(--border)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask your Golem..."
          style={{
            flex:1, padding:'10px 14px', borderRadius:8,
            background:'var(--secondary)', border:'1px solid var(--border)',
            color:'var(--foreground)', fontSize:13, outline:'none',
            fontFamily:'inherit',
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          style={{
            padding:'10px 18px', borderRadius:8, cursor:'pointer',
            background: input.trim() ? 'rgba(201,168,76,.15)' : 'var(--secondary)',
            border:'1px solid rgba(201,168,76,.2)',
            color:'var(--gold)', fontSize:13, fontFamily:'inherit',
            transition:'all .15s',
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
