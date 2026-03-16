import { useState, useRef, useEffect } from 'react'
import { useAboveInsideStore } from '../store/useAboveInsideStore'

export default function GolemPage() {
  const profile = useAboveInsideStore(s => s.activeViewProfile || s.primaryProfile)
  const setPrimaryProfile = useAboveInsideStore(s => s.setPrimaryProfile)

  // Local editable profile state (user can tweak while chatting)
  const [editProfile, setEditProfile] = useState({
    name: profile?.name || '',
    sign: profile?.sign || '',
    moon: profile?.moon || '',
    asc: profile?.asc || '',
    hdType: profile?.hdType || '',
    hdProfile: profile?.hdProfile || '',
    hdAuth: profile?.hdAuth || '',
    hdDef: profile?.hdDef || '',
    lifePath: profile?.lifePath || '',
    expression: profile?.expression || '',
    crossGK: profile?.crossGK || '',
    dob: profile?.dob || '',
    tob: profile?.tob || '',
  })

  // Sync editProfile when profile changes externally
  useEffect(() => {
    if (profile) {
      setEditProfile({
        name: profile.name || '',
        sign: profile.sign || '',
        moon: profile.moon || '',
        asc: profile.asc || '',
        hdType: profile.hdType || '',
        hdProfile: profile.hdProfile || '',
        hdAuth: profile.hdAuth || '',
        hdDef: profile.hdDef || '',
        lifePath: profile.lifePath || '',
        expression: profile.expression || '',
        crossGK: profile.crossGK || '',
        dob: profile.dob || '',
        tob: profile.tob || '',
      })
    }
  }, [profile?.dob, profile?.name])

  const [messages, setMessages] = useState(() => [
    { role: 'golem', text: getWelcome(profile) }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function getWelcome(p) {
    if (!p?.name) return "I'm your Golem. I speak as you. Ask me anything."
    return `I'm ${p.name}'s Golem — ${p.sign || '?'} Sun, ${p.hdType || '?'} in Human Design, Life Path ${p.lifePath || '?'}. I speak from your values and your blind spots. What do you want to explore?`
  }

  function buildGolemPrompt(p) {
    return `You ARE ${p?.name || 'this person'}. Not an assistant to them — you ARE them.

Your profile:
- Name: ${p.name}
- Sun: ${p.sign || 'unknown'}, Moon: ${p.moon || 'unknown'}, Rising: ${p.asc || 'unknown'}
- Human Design: ${p.hdType || 'unknown'} ${p.hdProfile || ''} with ${p.hdAuth || 'unknown'} authority, ${p.hdDef || 'unknown'} definition
- Life Path: ${p.lifePath || 'unknown'}, Expression: ${p.expression || 'unknown'}
- Gene Keys cross: ${p.crossGK || 'unknown'}

Speak in first person: "I would...", "My instinct is...", "I notice I tend to..."
Be honest including about blind spots. You are a reflection tool, not an advisor.
Keep responses concise — 2-4 sentences unless depth is explicitly needed.`
  }

  async function callGolem(systemPrompt, userMessage) {
    // Placeholder — ready for Claude integration
    const name = editProfile.name || 'you'
    const sign = editProfile.sign || 'unknown'
    const hdType = editProfile.hdType || 'unknown'
    const lifePath = editProfile.lifePath || '?'

    // Simulate a thoughtful first-person response
    const responses = [
      `As ${name}, with my ${sign} Sun and ${hdType} design, my instinct here is to go deeper before acting. Life Path ${lifePath} means I need to understand the system fully before I move.`,
      `I notice I tend to over-analyze this kind of situation. The ${hdType} in me wants to wait for the right moment, but the ${sign} energy pushes toward action. My honest answer: both are true, and the tension between them is where I do my best work.`,
      `My blind spot here is probably perfectionism — I want the conditions to be right before I commit. Life Path ${lifePath} teaches me that the depth I seek requires patience I don't always feel.`,
    ]
    return responses[messages.length % responses.length]
  }

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setLoading(true)
    try {
      const response = await callGolem(buildGolemPrompt(editProfile), userMsg)
      setMessages(m => [...m, { role: 'golem', text: response }])
    } catch {
      setMessages(m => [...m, { role: 'golem', text: "I couldn't respond right now. Try again." }])
    }
    setLoading(false)
  }

  function saveProfile() {
    setPrimaryProfile(editProfile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    // Reset welcome message with updated profile
    setMessages([{ role: 'golem', text: getWelcome(editProfile) }])
  }

  function Field({ label, field, placeholder, type = 'text' }) {
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: 4, fontFamily: "'Cinzel',serif" }}>{label}</div>
        <input
          type={type}
          value={editProfile[field]}
          onChange={e => setEditProfile(prev => ({ ...prev, [field]: e.target.value }))}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '7px 10px', borderRadius: 6, boxSizing: 'border-box',
            background: 'var(--secondary)', border: '1px solid var(--border)',
            color: 'var(--foreground)', fontSize: 12, outline: 'none', fontFamily: 'inherit',
          }}
        />
      </div>
    )
  }

  function HDTypeSelect() {
    const types = ['Generator', 'Manifesting Generator', 'Projector', 'Manifestor', 'Reflector']
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: 4, fontFamily: "'Cinzel',serif" }}>HD Type</div>
        <select
          value={editProfile.hdType}
          onChange={e => setEditProfile(prev => ({ ...prev, hdType: e.target.value }))}
          style={{
            width: '100%', padding: '7px 10px', borderRadius: 6,
            background: 'var(--secondary)', border: '1px solid var(--border)',
            color: 'var(--foreground)', fontSize: 12, outline: 'none', fontFamily: 'inherit',
          }}
        >
          <option value="">Select type...</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <span style={{ fontSize: 20 }}>🪬</span>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gold)' }}>Golem</div>
        <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginLeft: 4 }}>speaking as {editProfile.name || 'you'} · edit profile to adjust voice</div>
      </div>

      {/* Split pane */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT: Profile editor */}
        <div style={{
          width: 260, flexShrink: 0, borderRight: '1px solid var(--border)',
          overflowY: 'auto', padding: '16px 14px',
          background: 'rgba(0,0,0,.15)',
        }}>
          <div style={{ fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold)', opacity: .7, marginBottom: 14, fontFamily: "'Cinzel',serif" }}>
            Profile
          </div>

          <Field label="Name" field="name" placeholder="Your name" />
          <Field label="Date of birth" field="dob" placeholder="YYYY-MM-DD" />
          <Field label="Time of birth" field="tob" placeholder="HH:MM" />

          <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />

          <Field label="Sun sign" field="sign" placeholder="e.g. Aquarius" />
          <Field label="Moon sign" field="moon" placeholder="e.g. Virgo" />
          <Field label="Rising sign" field="asc" placeholder="e.g. Virgo" />

          <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />

          <HDTypeSelect />
          <Field label="HD Profile" field="hdProfile" placeholder="e.g. 3/5" />
          <Field label="HD Authority" field="hdAuth" placeholder="e.g. Emotional" />
          <Field label="HD Definition" field="hdDef" placeholder="e.g. Split" />

          <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />

          <Field label="Life Path" field="lifePath" placeholder="e.g. 7" />
          <Field label="Expression" field="expression" placeholder="e.g. 1" />
          <Field label="Gene Keys Cross" field="crossGK" placeholder="e.g. 41/31|28/27" />

          <button
            onClick={saveProfile}
            style={{
              width: '100%', marginTop: 14, padding: '9px', borderRadius: 7, cursor: 'pointer',
              background: saved ? 'rgba(96,176,48,.15)' : 'rgba(201,168,76,.1)',
              border: `1px solid ${saved ? 'rgba(96,176,48,.4)' : 'rgba(201,168,76,.3)'}`,
              color: saved ? 'rgba(96,176,48,.9)' : 'var(--gold)',
              fontSize: 11, fontFamily: "'Cinzel',serif", letterSpacing: '.1em',
              textTransform: 'uppercase', transition: 'all .2s',
            }}
          >
            {saved ? '✓ Saved' : 'Apply to Golem'}
          </button>
        </div>

        {/* RIGHT: Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%', padding: '10px 14px',
                borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: m.role === 'user' ? 'var(--accent)' : 'rgba(201,168,76,.07)',
                border: m.role === 'user' ? '1px solid var(--border)' : '1px solid rgba(201,168,76,.15)',
                fontSize: 13, color: m.role === 'user' ? 'var(--foreground)' : 'rgba(255,255,255,.85)',
                lineHeight: 1.65,
              }}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: '12px 12px 12px 2px', background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.08)', fontSize: 12, color: 'rgba(201,168,76,.4)', fontStyle: 'italic' }}>
                thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 16px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask your Golem..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 8,
                background: 'var(--secondary)', border: '1px solid var(--border)',
                color: 'var(--foreground)', fontSize: 13, outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                padding: '10px 18px', borderRadius: 8, cursor: input.trim() ? 'pointer' : 'default',
                background: input.trim() ? 'rgba(201,168,76,.15)' : 'var(--secondary)',
                border: '1px solid rgba(201,168,76,.2)',
                color: 'var(--gold)', fontSize: 13, fontFamily: 'inherit', transition: 'all .15s',
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
