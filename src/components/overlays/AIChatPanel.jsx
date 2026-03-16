import { useState, useRef, useEffect } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
// Note: setActiveDetail / setActiveNav used for paywall navigation

/* ── Canned AI responses based on profile data ── */
const CANNED_RESPONSES = [
  (p) => `As an ${p.sign} Sun with ${p.moon} Moon and ${p.asc} Rising, your consciousness map reveals a fascinating tension between intellectual innovation and grounded service. Your ${p.sign} Sun drives you toward humanitarian ideals and unconventional thinking, while your ${p.moon} Moon and ${p.asc} Ascendant ground this vision in meticulous, practical expression. This is a rare combination that allows you to channel visionary ideas into tangible, helpful frameworks.`,
  (p) => `Your Human Design profile as a ${p.hdProfile} ${p.hdType} with ${p.hdAuth} Authority is deeply significant. The ${p.hdType} archetype means you're designed to guide and direct energy, not generate it. Your ${p.hdAuth} Authority asks you to ride your emotional wave before making decisions \u2014 never act in the heat of the moment. The 3/5 profile means you learn through experimentation (Line 3) and are projected upon as a problem-solver (Line 5). People see you as someone who can fix things, and your experiential wisdom validates this projection.`,
  (p) => `Life Path ${p.lifePath} in numerology reveals you as The Seeker \u2014 someone driven by an insatiable quest for truth, wisdom, and deeper understanding. Combined with your ${p.sign} Sun, this creates a double emphasis on intellectual exploration and unconventional paths to knowledge. You're not satisfied with surface-level answers; you need to understand the underlying patterns and mechanics of reality itself.`,
  (p) => `Looking at your Gene Keys cross (${p.crossGK}), there's a beautiful evolutionary arc at play. Gate 41 is the gate of Contraction \u2014 the pressure to begin new experiences. Gate 31 is Leadership through Influence. Together with Gates 28 (The Game Player) and 27 (Caring/Nurturing), your incarnation cross speaks to a life purpose centered on initiating transformative experiences that lead others into deeper self-knowledge and care.`,
  (p) => `The integration between your ${p.hdType} design and ${p.sign} Sun creates what I call a "Visionary Guide" archetype. You're here to see what others cannot, wait for recognition, and then share your unique perspective. The key challenge is patience \u2014 both your ${p.sign} nature and ${p.hdType} strategy require waiting, but for different reasons. ${p.sign} waits for the right moment of innovation; the ${p.hdType} waits for invitation and recognition.`,
  (p) => `Your ${p.moon} Moon suggests that emotionally, you process through analysis and service. You feel most secure when you can be useful, when things are organized, and when you can see how the pieces fit together. This is actually a perfect emotional foundation for someone with ${p.hdAuth} Authority \u2014 your emotional wave can be processed through the Virgoan lens of discernment and practical assessment.`,
  (p) => `From a Kabbalistic perspective, your chart strongly resonates with Tiphareth \u2014 the sphere of Beauty and Harmony at the center of the Tree of Life. This is the balancing point between the higher spiritual aspirations (your ${p.sign} vision) and the grounded material expression (your ${p.asc} practicality). Tiphareth asks you to find the golden mean, the beautiful synthesis between all polarities in your chart.`,
  (p) => `Your cross-framework patterns reveal a consistent theme: you're a bridge between systems. In astrology, ${p.sign} bridges the individual and the collective. In Human Design, the ${p.hdType} bridges awareness and action. In Numerology, Life Path ${p.lifePath} bridges the seen and unseen. In the Gene Keys, your activation sequence bridges contraction (41) with leadership (31). You are, in essence, a living bridge between different dimensions of consciousness.`,
]

/**
 * Stub for Claude API integration.
 * TODO: Requires VITE_ANTHROPIC_API_KEY or backend proxy endpoint.
 * In production, this should call a backend endpoint that proxies to the
 * Anthropic Messages API to keep the API key secure.
 *
 * @param {Array} messages - Chat message history [{role, content}]
 * @param {Object} profileContext - User profile data from useAboveInsideStore
 * @returns {Promise<string>} AI response text
 */
async function sendToClaudeAPI(messages, profileContext) {
  // TODO: Implement actual Claude API call via backend proxy
  // Example endpoint: POST /api/chat
  // Body: { messages, profileContext }
  // Headers: { Authorization: `Bearer ${import.meta.env.VITE_ANTHROPIC_API_KEY}` }
  //
  // const response = await fetch('/api/chat', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     model: 'claude-sonnet-4-20250514',
  //     messages,
  //     system: `You are an AI consciousness guide. The user's profile: ${JSON.stringify(profileContext)}`,
  //   }),
  // })
  // const data = await response.json()
  // return data.content[0].text

  // For now, return canned responses personalized with profile data
  await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 1800))
  const idx = Math.floor(Math.random() * CANNED_RESPONSES.length)
  return CANNED_RESPONSES[idx](profileContext)
}

function buildWelcomeMessage(profile) {
  const name = profile?.name?.split(' ')[0] || 'Seeker'
  const sign = profile?.sign || '?'
  const moon = profile?.moon || '?'
  const asc = profile?.asc || '?'
  const hdType = profile?.hdType || '?'
  const hdProfile = profile?.hdProfile || '?'
  const lifePath = profile?.lifePath || '?'
  return {
    role: 'assistant',
    content: `Welcome, ${name}. As a ${sign} Sun with ${moon} Moon and ${asc} Rising, your cosmic blueprint runs deep.\n\nYou are a ${hdType} (${hdProfile} profile) in Human Design, with Life Path ${lifePath} — a rare combination that speaks to a life of ${hdType === 'Projector' ? 'guiding others with wisdom and discernment' : hdType === 'Generator' ? 'building and responding with sacral energy' : hdType === 'Manifesting Generator' ? 'initiating and pivoting with multi-passionate drive' : hdType === 'Manifestor' ? 'initiating and creating impact' : 'reflection and sampling life experiences'}.\n\nI have access to your full multi-framework profile. Ask me anything about your chart, current transits, life purpose, or how your different systems interconnect.`,
  }
}

const SUGGESTED_PROMPTS = [
  'What does my Sun-Moon-Rising combination reveal?',
  'How do my Human Design and astrology interact?',
  'What is my life purpose across all frameworks?',
  'Explain my Gene Keys incarnation cross',
]

/* ── Styles ── */
const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(2,2,18,.85)', backdropFilter: 'blur(16px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: 0, pointerEvents: 'none',
    transition: 'opacity .3s ease',
  },
  overlayOpen: {
    opacity: 1, pointerEvents: 'auto',
  },
  panel: {
    width: '680px', maxWidth: '94vw', height: '82vh', maxHeight: '82vh',
    background: 'linear-gradient(170deg, rgba(8,8,32,.97), rgba(4,4,20,.99))',
    border: '1px solid rgba(201,168,76,.15)',
    borderRadius: '16px', display: 'flex', flexDirection: 'column',
    overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(201,168,76,.06)',
    animation: 'fadeUp .35s ease backwards',
  },
  header: {
    padding: '14px 20px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', borderBottom: '1px solid rgba(201,168,76,.1)',
    flexShrink: 0,
  },
  title: {
    fontFamily: "'Cinzel',serif", fontSize: '12px', letterSpacing: '.15em',
    color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '10px',
  },
  badge: {
    padding: '3px 10px', borderRadius: '12px', fontSize: '8px',
    letterSpacing: '.1em', fontFamily: "'Cinzel',serif",
    background: 'linear-gradient(135deg, rgba(201,168,76,.15), rgba(201,168,76,.05))',
    border: '1px solid rgba(201,168,76,.25)', color: 'var(--gold2)',
  },
  close: {
    width: '28px', height: '28px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', borderRadius: '50%', cursor: 'pointer',
    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
    color: 'var(--text2)', fontSize: '13px', transition: 'all .2s',
  },
  messagesArea: {
    flex: 1, overflow: 'auto', padding: '16px 20px',
    display: 'flex', flexDirection: 'column', gap: '12px',
  },
  msgBubble: {
    maxWidth: '85%', padding: '12px 16px', borderRadius: '14px',
    fontSize: '12.5px', lineHeight: '1.65',
    fontFamily: "'Cormorant Garamond',serif",
    animation: 'fadeUp .3s ease backwards',
  },
  userBubble: {
    alignSelf: 'flex-end', textAlign: 'right',
    background: 'rgba(201,168,76,.06)',
    border: '1px solid rgba(201,168,76,.2)',
    color: 'var(--text)',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    background: 'rgba(64,204,221,.04)',
    border: '1px solid rgba(64,204,221,.15)',
    color: 'var(--text)',
  },
  inputBar: {
    padding: '12px 16px', borderTop: '1px solid rgba(201,168,76,.1)',
    display: 'flex', gap: '10px', alignItems: 'flex-end', flexShrink: 0,
  },
  textarea: {
    flex: 1, background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.1)', borderRadius: '12px',
    padding: '10px 14px', color: 'var(--text)', fontSize: '12px',
    fontFamily: "'Cormorant Garamond',serif",
    resize: 'none', outline: 'none', minHeight: '42px', maxHeight: '120px',
    lineHeight: '1.5', transition: 'border-color .2s',
  },
  sendBtn: {
    width: '42px', height: '42px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: '16px', flexShrink: 0, transition: 'all .2s',
    background: 'linear-gradient(135deg, rgba(201,168,76,.2), rgba(201,168,76,.08))',
    border: '1px solid rgba(201,168,76,.3)',
  },
  sendBtnDisabled: {
    opacity: 0.4, cursor: 'default',
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.08)',
  },
  typing: {
    alignSelf: 'flex-start', padding: '10px 16px', borderRadius: '14px',
    background: 'rgba(64,204,221,.04)', border: '1px solid rgba(64,204,221,.12)',
    display: 'flex', gap: '5px', alignItems: 'center',
  },
  typingDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: 'rgba(64,204,221,.5)',
  },
  suggestionsRow: {
    display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 20px 12px',
  },
  suggestChip: {
    padding: '6px 12px', borderRadius: '20px', fontSize: '10px',
    fontFamily: "'Cormorant Garamond',serif",
    background: 'rgba(201,168,76,.05)', border: '1px solid rgba(201,168,76,.12)',
    color: 'var(--gold2)', cursor: 'pointer', transition: 'all .2s',
    letterSpacing: '.02em',
  },
  paywall: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', flex: 1, gap: '16px', padding: '40px',
    textAlign: 'center',
  },
  paywallIcon: {
    fontSize: '40px', opacity: 0.5,
  },
  paywallTitle: {
    fontFamily: "'Cinzel',serif", fontSize: '16px', letterSpacing: '.15em',
    color: 'var(--gold)',
  },
  paywallText: {
    fontFamily: "'Cormorant Garamond',serif", fontSize: '14px',
    color: 'var(--text2)', lineHeight: 1.6, maxWidth: '360px',
  },
  paywallBtn: {
    padding: '10px 28px', borderRadius: '24px',
    background: 'linear-gradient(135deg, rgba(201,168,76,.2), rgba(201,168,76,.08))',
    border: '1px solid rgba(201,168,76,.35)',
    fontFamily: "'Cinzel',serif", fontSize: '11px', letterSpacing: '.12em',
    color: 'var(--gold)', cursor: 'pointer', transition: 'all .2s',
  },
}

export default function AIChatPanel({ open, onClose }) {
  const primaryProfile = useAboveInsideStore((s) => s.primaryProfile)
  const activeViewProfile = useAboveInsideStore((s) => s.activeViewProfile)
  const profile = activeViewProfile || primaryProfile
  const userPlan = useAboveInsideStore((s) => s.userPlan)
  const setActiveDetail = useAboveInsideStore((s) => s.setActiveDetail)
  const setActiveNav = useAboveInsideStore((s) => s.setActiveNav)

  const [messages, setMessages] = useState(() => [buildWelcomeMessage(profile)])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const isFreeUser = !userPlan || userPlan === 'free'

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Auto-resize textarea
  function handleInputChange(e) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  async function handleSend(text) {
    const msg = (text || input).trim()
    if (!msg || isTyping) return

    setInput('')
    setShowSuggestions(false)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    const userMsg = { role: 'user', content: msg }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setIsTyping(true)

    try {
      const response = await sendToClaudeAPI(updatedMessages, profile)
      setMessages((prev) => [...prev, { role: 'assistant', content: response }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I apologize, but I encountered an issue processing your question. Please try again.' },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{ ...styles.overlay, ...(open ? styles.overlayOpen : {}) }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={styles.panel}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.title}>
            <span style={{ fontSize: '14px' }}>{'\u2726'}</span>
            AI Consciousness Guide &mdash; Powered by Claude
            <span style={styles.badge}>Premium Feature</span>
          </div>
          <div style={styles.close} onClick={onClose}>{'\u2715'}</div>
        </div>

        {isFreeUser ? (
          /* Paywall for free users */
          <div style={styles.paywall}>
            <div style={styles.paywallIcon}>{'\u2726'}</div>
            <div style={styles.paywallTitle}>AI Consciousness Guide</div>
            <div style={styles.paywallText}>
              Unlock personalized AI-powered insights about your astrological profile,
              Human Design, Gene Keys, and cross-framework patterns. Your AI guide has
              full access to your consciousness map and can answer any question about
              your cosmic blueprint.
            </div>
            <div style={{ ...styles.paywallText, fontSize: '12px', marginTop: '-4px' }}>
              This feature requires the <span style={{ color: 'var(--gold)' }}>Explorer plan ($1.99/mo)</span>
            </div>
            <div
              style={styles.paywallBtn}
              onClick={() => { onClose(); setActiveDetail('pricing'); setActiveNav('pricing') }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,168,76,.2)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,.5)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(201,168,76,.2), rgba(201,168,76,.08))'; e.currentTarget.style.borderColor = 'rgba(201,168,76,.35)' }}
            >
              ✦ Upgrade to Explorer — $1.99/mo
            </div>
          </div>
        ) : (
          <>
            {/* Messages area */}
            <div style={styles.messagesArea}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.msgBubble,
                    ...(msg.role === 'user' ? styles.userBubble : styles.aiBubble),
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div style={{
                      fontFamily: "'Cinzel',serif", fontSize: '8px', letterSpacing: '.12em',
                      color: 'rgba(64,204,221,.5)', marginBottom: '6px',
                    }}>
                      {'\u2726'} AI GUIDE
                    </div>
                  )}
                  {msg.content}
                </div>
              ))}
              {isTyping && (
                <div style={styles.typing}>
                  <div style={{ ...styles.typingDot, animation: 'pulse 1.2s ease infinite' }} />
                  <div style={{ ...styles.typingDot, animation: 'pulse 1.2s ease infinite .2s' }} />
                  <div style={{ ...styles.typingDot, animation: 'pulse 1.2s ease infinite .4s' }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts */}
            {showSuggestions && messages.length <= 1 && (
              <div style={styles.suggestionsRow}>
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <div
                    key={i}
                    style={styles.suggestChip}
                    onClick={() => handleSend(prompt)}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(201,168,76,.12)'
                      e.target.style.borderColor = 'rgba(201,168,76,.25)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(201,168,76,.05)'
                      e.target.style.borderColor = 'rgba(201,168,76,.12)'
                    }}
                  >
                    {prompt}
                  </div>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div style={styles.inputBar}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <textarea
                  ref={textareaRef}
                  style={styles.textarea}
                  placeholder="Ask about your consciousness map..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,.3)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,.1)' }}
                />
                <div style={{ fontSize: '9px', color: 'var(--text3)', fontFamily: "'Inconsolata',monospace", paddingLeft: '2px' }}>
                  ↵ Enter to send &nbsp;·&nbsp; Shift+↵ for new line
                </div>
              </div>
              <div
                style={{
                  ...styles.sendBtn,
                  ...(!input.trim() || isTyping ? styles.sendBtnDisabled : {}),
                  alignSelf: 'flex-start',
                }}
                onClick={() => handleSend()}
                onMouseEnter={(e) => {
                  if (input.trim() && !isTyping) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(201,168,76,.35), rgba(201,168,76,.15))'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = input.trim() && !isTyping
                    ? 'linear-gradient(135deg, rgba(201,168,76,.2), rgba(201,168,76,.08))'
                    : 'rgba(255,255,255,.04)'
                }}
              >
                {'\u2726'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
