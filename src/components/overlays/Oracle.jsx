/**
 * Oracle — Right-hand AI chat panel embedded in Dashboard layout.
 * Has full context of current screen + all profile data.
 */
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useGolemStore } from '../../store/useGolemStore'
import { callAI } from '../../lib/ai'

const DETAIL_LABELS = {
  natal: 'Natal Chart', tr: 'Transits', hd: 'Human Design', kab: 'Kabbalah',
  gk: 'Gene Keys', integral: 'Integral Map', pat: 'Patterns', mayan: 'Mayan Calendar',
  enn: 'Enneagram', chi: 'Chinese Zodiac', gem: 'Gematria', mbti: 'Myers-Briggs',
  egyptian: 'Egyptian', vedic: 'Vedic Astrology', tibetan: 'Tibetan', num: 'Numerology',
  dosha: 'Dosha', archetype: 'Archetype', lovelang: 'Love Language', timeline: 'Timeline',
  career: 'Career', golem: 'Golem', dating: 'Connections', aiagents: 'AI Agents',
}

const QUICK_PROMPTS_BY_CONTEXT = {
  natal: ['Read my Sun sign', 'What does my rising mean?', 'Moon energy today', 'Key aspects'],
  hd: ['My HD strategy', 'My authority', 'Defined centers', 'Living my design'],
  gk: ['Life\'s Work gate', 'Pearl sequence', 'Shadow to gift', 'Core wound'],
  num: ['Life Path meaning', 'Expression number', 'Soul urge', 'Personal year'],
  enn: ['My core fear', 'Growth direction', 'Wing influence', 'Instinctual variant'],
  timeline: ['Next major transit', 'Saturn return', 'Current dasha', 'Personal year cycle'],
  career: ['Best career paths', 'Work style', 'Leadership approach', 'Creative gifts'],
  vedic: ['Moon nakshatra', 'Dasha period', 'Lagna meaning', 'Planetary yogas'],
  default: ['My soul purpose', 'Key shadow work', 'What to focus now', 'Synthesis reading'],
}

function buildSystemPrompt(profile, people, activeDetail) {
  const section = activeDetail ? (DETAIL_LABELS[activeDetail] || activeDetail) : 'Dashboard overview'

  let prompt = `You are Oracle, the cosmic intelligence guide inside GOLEM — a multi-framework self-knowledge platform. You speak with depth, precision, and warmth. You synthesize insights across astrology, Human Design, numerology, Gene Keys, Kabbalah, Enneagram, and more.

## Current Context
The user is currently viewing: **${section}**
${activeDetail ? `Tailor your response to be relevant to ${section}. Reference specific data from their profile that relates to this framework.` : 'Give holistic, cross-framework insights.'}

## User Profile`

  if (profile?.name) prompt += `\nName: ${profile.name}`
  if (profile?.dob) prompt += `\nBorn: ${profile.dob}${profile.tob ? ` at ${profile.tob}` : ''}${profile.pob ? ` in ${profile.pob}` : ''}`
  if (profile?.sign && profile.sign !== '?') prompt += `\nSun: ${profile.sign}`
  if (profile?.moon && profile.moon !== '?') prompt += `\nMoon: ${profile.moon}`
  if (profile?.asc && profile.asc !== '?') prompt += `\nRising: ${profile.asc}`
  if (profile?.hdType && profile.hdType !== '?') prompt += `\nHD Type: ${profile.hdType}`
  if (profile?.hdProfile && profile.hdProfile !== '?') prompt += `\nHD Profile: ${profile.hdProfile}`
  if (profile?.hdAuth && profile.hdAuth !== '?') prompt += `\nHD Authority: ${profile.hdAuth}`
  if (profile?.lifePath && profile.lifePath !== '?') prompt += `\nLife Path: ${profile.lifePath}`
  if (profile?.enneagramType) prompt += `\nEnneagram: Type ${profile.enneagramType}${profile.enneagramWing ? `w${profile.enneagramWing}` : ''}`
  if (profile?.mbtiType) prompt += `\nMBTI: ${profile.mbtiType}`
  if (profile?.doshaType) prompt += `\nDosha: ${profile.doshaType}`
  if (profile?.archetypeType) prompt += `\nArchetype: ${profile.archetypeType}`
  if (profile?.loveLanguage) prompt += `\nLove Language: ${profile.loveLanguage}`

  if (people?.length > 0) {
    prompt += `\n\n## People in Their Life`
    for (const p of people) {
      prompt += `\n- ${p.name} (${p.rel || 'other'}): ${p.sign || '?'} Sun${p.hdType && p.hdType !== '?' ? `, ${p.hdType}` : ''}${p.dob ? `, born ${p.dob}` : ''}`
    }
  }

  prompt += `\n\n## Response Style
- Keep responses 2-5 sentences unless asked for more
- Be specific — reference their actual chart data, not generic descriptions
- Connect insights across frameworks when relevant
- Speak with the tone of a wise, warm guide — not a textbook`

  return prompt
}

export default function Oracle({ open, onClose }) {
  const primaryProfile = useGolemStore(s => s.primaryProfile)
  const activeViewProfile = useGolemStore(s => s.activeViewProfile)
  const profile = activeViewProfile || primaryProfile
  const activeDetail = useGolemStore(s => s.activeDetail)
  const people = useGolemStore(s => s.people)

  const contextLabel = activeDetail ? (DETAIL_LABELS[activeDetail] || activeDetail) : null

  const quickPrompts = QUICK_PROMPTS_BY_CONTEXT[activeDetail] || QUICK_PROMPTS_BY_CONTEXT.default

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const initializedRef = useRef(false)

  // Set initial welcome when opened
  useEffect(() => {
    if (open && messages.length === 0 && !initializedRef.current) {
      initializedRef.current = true
      const name = profile?.name || 'seeker'
      const hdType = profile?.hdType && profile.hdType !== '?' ? profile.hdType : null
      const sign = profile?.sign && profile.sign !== '?' ? profile.sign : null
      const greeting = `Welcome, ${name}. I am Oracle — your guide across all frameworks.${sign ? ` I see your ${sign} Sun` : ''}${hdType ? `${sign ? ' and' : ' I see'} your ${hdType} nature` : ''}. What calls to you today?`
      setMessages([{ id: 1, role: 'ai', text: greeting }])
    }
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  function handleInput(e) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim()
    if (!trimmed || typing) return

    const userMsg = { id: Date.now(), role: 'user', text: trimmed }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setTyping(true)

    try {
      const systemPrompt = buildSystemPrompt(profile, people, activeDetail)
      const aiMessages = newMessages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }))

      const response = await callAI({ systemPrompt, messages: aiMessages, maxTokens: 500 })
      const aiText = response || getFallbackResponse(trimmed, profile, activeDetail)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: aiText }])
    } catch (err) {
      console.error('Oracle error:', err)
      const fallback = getFallbackResponse(trimmed, profile, activeDetail)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: fallback }])
    }
    setTyping(false)
  }, [typing, messages, profile, people, activeDetail])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  if (!open) return null

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--card)', borderLeft: '1px solid var(--border)',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 12px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        <span style={{ fontSize: 18, color: 'var(--foreground)' }}>◈</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--card-foreground)', fontFamily: "'Cinzel', serif", letterSpacing: '.08em' }}>Oracle</div>
          <div style={{ fontSize: 9, color: 'var(--muted-foreground)', letterSpacing: '.06em' }}>cosmic intelligence</div>
        </div>
        <button onClick={onClose} title="Close Oracle" style={{
          width: 26, height: 26, borderRadius: 4,
          background: 'var(--secondary)', border: '1px solid var(--border)',
          color: 'var(--muted-foreground)', fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>
      </div>

      {/* Context chips */}
      <div style={{
        padding: '8px 14px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flexShrink: 0,
      }}>
        {contextLabel && (
          <span style={{
            padding: '3px 10px', borderRadius: 12,
            background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.25)',
            fontSize: 9, fontFamily: "'Cinzel', serif", letterSpacing: '.1em',
            color: 'var(--foreground)', textTransform: 'uppercase',
          }}>📍 {contextLabel}</span>
        )}
        <span style={{
          padding: '3px 10px', borderRadius: 12,
          background: 'var(--accent)', border: '1px solid var(--border)',
          fontSize: 9, fontFamily: 'inherit', letterSpacing: '.1em',
          color: 'var(--foreground)', textTransform: 'uppercase',
        }}>
          {profile?.sign && profile.sign !== '?' ? profile.sign : '✦'} {profile?.name || 'Seeker'}
        </span>
        {profile?.hdType && profile.hdType !== '?' && (
          <span style={{
            padding: '3px 10px', borderRadius: 12,
            background: 'var(--accent)', border: '1px solid var(--border)',
            fontSize: 9, fontFamily: 'inherit', letterSpacing: '.1em',
            color: 'var(--muted-foreground)', textTransform: 'uppercase',
          }}>{profile.hdType}</span>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: 14,
        display: 'flex', flexDirection: 'column', gap: 10,
        scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent',
      }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '90%',
            padding: '9px 13px',
            borderRadius: msg.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
            background: msg.role === 'user' ? 'var(--primary)' : 'var(--secondary)',
            border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
            fontSize: 13, lineHeight: 1.6,
            color: msg.role === 'user' ? 'var(--primary-foreground)' : 'var(--card-foreground)',
            whiteSpace: 'pre-wrap',
          }}>
            {msg.role === 'ai' && <span style={{ color: 'var(--muted-foreground)', fontSize: 10, marginRight: 4 }}>◈</span>}
            {msg.text}
          </div>
        ))}
        {typing && (
          <div style={{ alignSelf: 'flex-start', padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center' }}>
            <div className="oracle-dot" />
            <div className="oracle-dot" />
            <div className="oracle-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div style={{
        padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: 6,
        borderTop: '1px solid var(--border)', flexShrink: 0,
      }}>
        <div style={{
          width: '100%', fontSize: 9, letterSpacing: '.15em',
          color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: 2,
          fontFamily: "'Cinzel', serif",
        }}>Ask Oracle</div>
        {quickPrompts.map((prompt, i) => (
          <button key={i} onClick={() => sendMessage(prompt)} disabled={typing} style={{
            padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 4,
            fontSize: 10, letterSpacing: '.06em', color: 'var(--muted-foreground)',
            cursor: typing ? 'not-allowed' : 'pointer', transition: 'background-color .15s',
            background: 'var(--secondary)', fontFamily: 'inherit',
          }}>{prompt}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: 14, borderTop: '1px solid var(--border)',
        display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0,
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask Oracle anything…"
          rows={1}
          disabled={typing}
          style={{
            flex: 1, minHeight: 42, maxHeight: 120,
            background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 4,
            padding: '9px 12px', color: 'var(--foreground)', fontSize: 13,
            resize: 'none', outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || typing}
          title="Send (Enter)"
          style={{
            width: 38, height: 38, borderRadius: 4,
            background: 'var(--primary)', color: 'var(--primary-foreground)',
            border: 'none', fontSize: 16, cursor: input.trim() && !typing ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: !input.trim() || typing ? 0.4 : 1,
          }}
        >↑</button>
      </div>
    </div>
  )
}

// Fallback when AI is unavailable
function getFallbackResponse(text, profile, activeDetail) {
  const t = text.toLowerCase()
  const sign = profile?.sign && profile.sign !== '?' ? profile.sign : 'your Sun sign'
  const hdType = profile?.hdType && profile.hdType !== '?' ? profile.hdType : 'your HD type'
  const lp = profile?.lifePath && profile.lifePath !== '?' ? `Life Path ${profile.lifePath}` : 'your Life Path'

  if (t.includes('sun') || t.includes('sign') || t.includes('natal')) {
    return `Your ${sign} Sun carries a specific frequency of consciousness. It's not just personality — it's the lens through which your soul expresses in this lifetime. What specific aspect of your solar nature are you exploring?`
  }
  if (t.includes('human design') || t.includes('hd') || t.includes('strategy') || t.includes('authority')) {
    return `As a ${hdType}, your strategy and authority are your compass. Following them isn't about perfection — it's about alignment. Where do you feel most out of alignment right now?`
  }
  if (t.includes('purpose') || t.includes('soul') || t.includes('meaning')) {
    return `Your ${lp} and ${hdType} nature both point toward a unique expression of mastery. Purpose isn't a destination — it's the quality of attention you bring to each moment. What feels most alive in you right now?`
  }
  return `The patterns in your chart reveal a consistent theme across frameworks. Your ${sign} Sun, ${hdType} design, and ${lp} all weave together into a coherent story. What thread would you like to pull?`
}
