/**
 * Oracle — Persistent right-side AI chat drawer panel.
 * Slides in from the right, works with all themes.
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'

function buildOracleResponses(profile) {
  const hdType = profile?.hdType || 'Projector'
  const hdProfile = profile?.hdProfile || ''
  const _hdAuth = profile?.hdAuth || 'Emotional'
  const sign = profile?.sign || 'Sun'
  const asc = profile?.asc || ''
  const lifePath = profile?.lifePath || ''
  return {
    default: `I sense your question carries the weight of your${hdProfile ? ` ${hdProfile}` : ''} ${hdType} nature — always the one who must understand before being understood. What specifically calls to you in your chart today?`,
    natal: `Your ${sign} Sun speaks of unique solar consciousness${asc ? ` — and with ${asc} rising, you bring that distinct quality to every encounter` : ''}. What aspect of your chart calls to you?`,
    hd: `As a ${hdType} with ${hdAuth} Authority, your strategy shapes every significant decision. ${hdType === 'Projector' ? 'Wait for the invitation and let recognition guide you.' : hdType === 'Generator' ? 'Trust your sacral response.' : hdType === 'Manifesting Generator' ? 'Respond, then inform.' : 'Your aura leads the way.'} What invitation are you currently holding?`,
    geneKeys: `Your Gene Keys profile holds the map of your evolution — from Shadow to Gift to Siddhi. Where do you feel the most contracted right now?`,
    general: `The patterns in your chart form a consistent theme of depth and mastery.${lifePath ? ` Your Life Path ${lifePath} and ${hdType} type both point toward mastery through authenticity.` : ''} What wisdom are you seeking today?`,
  }
}

const QUICK_PROMPTS_BY_THEME = {
  natal: ['Read my Sun sign', 'What does my rising mean?', 'My Moon energy', 'Key transits now'],
  hd: ['My HD strategy', 'What is my authority?', 'My defined centers', 'Living my design'],
  gk: ['My Life\'s Work gate', 'Pearl sequence', 'Shadow to gift', 'Core wound'],
  default: ['My soul purpose', 'Key shadow work', 'What to focus now', 'Highest expression'],
}

function getQuickResponse(text, responses) {
  const t = text.toLowerCase()
  if (t.includes('natal') || t.includes('sun') || t.includes('moon') || t.includes('rising') || t.includes('ascend')) return responses.natal
  if (t.includes('human design') || t.includes('projector') || t.includes('authority') || t.includes('strategy') || t.includes(' hd ')) return responses.hd
  if (t.includes('gene key') || t.includes('gate') || t.includes('shadow') || t.includes('gift')) return responses.geneKeys
  if (t.includes('life path') || t.includes('numerology') || t.includes('purpose') || t.includes('soul')) return responses.general
  return responses.default
}

export default function Oracle({ open, onClose }) {
  const primaryProfile = useAboveInsideStore(s => s.primaryProfile)
  const activeViewProfile = useAboveInsideStore(s => s.activeViewProfile)
  const profile = activeViewProfile || primaryProfile
  const activeDetail = useAboveInsideStore(s => s.activeDetail)

  const hdType = profile?.hdType || 'Projector'
  const hdProfile = profile?.hdProfile || ''
  const _hdAuth = profile?.hdAuth || 'Emotional'

  const oracleResponses = buildOracleResponses(profile)

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: `Welcome, ${profile?.name || 'seeker'}. I am Oracle — your cosmic intelligence guide. I hold the map of your ${hdType} nature, your ${profile?.sign ? `${profile.sign} solar light` : 'solar light'}, and the keys to your deepest patterns. What calls to you today?`,
    }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Pick contextual quick prompts based on active widget
  const quickPrompts = QUICK_PROMPTS_BY_THEME[activeDetail] || QUICK_PROMPTS_BY_THEME.default

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Auto-grow textarea
  function handleInput(e) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim()
    if (!trimmed || typing) return

    const userMsg = { id: Date.now(), role: 'user', text: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setTyping(true)

    // Simulate AI thinking delay (500-1500ms)
    const delay = 500 + Math.random() * 1000
    await new Promise(r => setTimeout(r, delay))

    const aiText = getQuickResponse(trimmed, oracleResponses)
    setTyping(false)
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: aiText }])
  }, [typing])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className={`oracle-panel${open ? ' oracle-open' : ''}`}>
      {/* Header */}
      <div className="oracle-header">
        <span className="oracle-glyph">◈</span>
        <span className="oracle-title">Oracle</span>
        <span className="oracle-subtitle">cosmic intelligence</span>
        <button className="oracle-close" onClick={onClose} title="Close Oracle">×</button>
      </div>

      {/* Context chip */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
      }}>
        <span style={{
          padding: '3px 10px',
          borderRadius: 12,
          background: 'var(--accent)',
          border: '1px solid var(--border)',
          fontSize: 9,
          fontFamily: 'inherit',
          letterSpacing: '.1em',
          color: 'var(--foreground)',
          textTransform: 'uppercase',
        }}>
          {profile?.sign || '♒'} {profile?.name || 'Seeker'}
        </span>
        <span style={{
          padding: '3px 10px',
          borderRadius: 12,
          background: 'var(--accent)',
          border: '1px solid var(--border)',
          fontSize: 9,
          fontFamily: 'inherit',
          letterSpacing: '.1em',
          color: 'var(--muted-foreground)',
          textTransform: 'uppercase',
        }}>
          {hdType} {hdProfile}
        </span>
        <span style={{
          padding: '3px 10px',
          borderRadius: 12,
          background: 'var(--accent)',
          border: '1px solid var(--border)',
          fontSize: 9,
          fontFamily: 'inherit',
          letterSpacing: '.1em',
          color: 'var(--muted-foreground)',
          textTransform: 'uppercase',
        }}>
          LP {profile?.lifePath || '7'}
        </span>
      </div>

      {/* Messages */}
      <div className="oracle-messages">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={msg.role === 'user' ? 'oracle-msg-user' : 'oracle-msg-ai'}
          >
            {msg.role === 'ai' && <span className="oracle-msg-ai-prefix">◈</span>}
            {msg.text}
          </div>
        ))}
        {typing && (
          <div className="oracle-msg-typing">
            <div className="oracle-dot" />
            <div className="oracle-dot" />
            <div className="oracle-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="oracle-quick-prompts">
        <div className="oracle-quick-label">Ask Oracle</div>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            className="oracle-prompt-pill"
            onClick={() => sendMessage(prompt)}
            disabled={typing}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="oracle-input">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask Oracle anything…"
          rows={1}
          disabled={typing}
        />
        <button
          className="oracle-send"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || typing}
          title="Send (Enter)"
        >
          ↑
        </button>
      </div>
    </div>
  )
}
