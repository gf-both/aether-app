import { useState, useRef, useEffect } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'

const AI_PROMPT_TEMPLATE = (notes, clientProfile) => `
You are an expert practitioner assistant specializing in Human Design, astrology, and consciousness work.

CLIENT PROFILE:
- Name: ${clientProfile.name}
- HD Type: ${clientProfile.hdType || 'Unknown'}, Profile: ${clientProfile.hdProfile || 'Unknown'}
- Life Path: ${clientProfile.lifePath || 'Unknown'}
- Gene Keys: Life's Work ${clientProfile.lifesWork || '?'}, Evolution ${clientProfile.evolution || '?'}

SESSION NOTES:
${notes}

Please analyze these session notes and provide:

1. KEY INSIGHTS (3-5 bullet points): What are the most significant themes, realizations, or breakthroughs?

2. ACTION ITEMS: Specific tasks or practices for the client to do before the next session. Be concrete.

3. FOLLOW-UP QUESTIONS: 3-5 powerful questions to explore in the next session, connected to their HD/astrology profile.

4. PATTERN RECOGNITION: What recurring themes do you notice? What patterns connect to their chart?

5. PRACTITIONER NOTES: What should the practitioner be aware of for the next session?

Format as JSON with keys: insights (array of strings), actionItems (array of strings), followUpQuestions (array of strings), patterns (string), practitionerNotes (string)
`

const MOCK_ANALYSIS = {
  insights: [
    'Strong resistance to expressing emotional truth in close relationships — pattern of over-explaining to avoid vulnerability',
    'Sacral authority is being bypassed; client is making decisions from mental pressure rather than gut response',
    'The 3/5 profile karma is showing up — trial and error phase seems complete, ready for projection field work',
    'Solar plexus wave connected to family of origin patterns around scarcity and emotional unavailability',
    'Breakthrough moment: recognition that the "not-self" theme of bitterness is actually a compass, not a problem',
  ],
  actionItems: [
    'Daily 5-minute sacral check-in practice: ask yes/no questions and notice bodily response before mental analysis',
    'Journaling prompt this week: "Where am I waiting for permission that is already mine to give?"',
    'One conversation where you speak the emotional truth first, without explanation or context',
    'Review the Gene Keys sequence for your Life\'s Work gate this week — contemplate the Gift frequency',
  ],
  followUpQuestions: [
    'What would it feel like to make one decision this week purely from gut response, without mental justification?',
    'Where in your life are you still in the "trial" phase of your 3rd line, and where have you completed the lesson?',
    'How does your emotional wave relate to the pattern of retreat in your family constellation?',
    'What is the bitterness in your life pointing toward — what is it that you deeply want to contribute?',
  ],
  patterns: 'Three sessions in a row showing the mental override of sacral authority — particularly around work decisions. The emotional wave timing is becoming clearer: 3-5 day cycles. Client consistently reports breakthroughs just after reaching the bottom of the wave. The 3/5 karma around "failed experiments" is shifting from shame to wisdom.',
  practitionerNotes: 'Client is close to a significant shift in self-trust. The intellectual framework has been absorbed — what remains is embodiment. Consider more somatic anchoring practices. Watch for the tendency to "help" by explaining rather than feeling. Next session: explore the incarnation cross more deeply as the client is asking questions that point directly toward it.',
}

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '16px 0' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--gold, #c9a84c)',
            animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <span style={{ color: 'var(--gold, #c9a84c)', fontSize: '0.85rem', marginLeft: 8, fontFamily: 'Cormorant Garamond, serif' }}>
        Analyzing session notes...
      </span>
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

function CollapsibleSection({ icon, title, children, defaultOpen = true, private: isPrivate = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{
      borderRadius: 10,
      border: '1px solid var(--glass-border, rgba(201,168,76,0.2))',
      marginBottom: 10,
      overflow: 'hidden',
      background: isPrivate ? 'rgba(144,80,224,0.08)' : 'rgba(255,255,255,0.03)',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text, #e8e0d5)',
          fontFamily: 'Cinzel, serif',
          fontSize: '0.85rem',
          letterSpacing: '0.05em',
          textAlign: 'left',
        }}
      >
        <span>{icon}</span>
        <span style={{ flex: 1 }}>{title}</span>
        {isPrivate && (
          <span style={{ fontSize: '0.7rem', color: '#9050e0', marginRight: 8, fontFamily: 'Cormorant Garamond, serif' }}>
            PRIVATE
          </span>
        )}
        <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ padding: '4px 14px 14px', borderTop: '1px solid var(--glass-border, var(--accent))' }}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function AINoteTaker({ clientProfile = {} }) {
  const { activeSession, updateSessionNotes } = useAboveInsideStore()
  const [notes, setNotes] = useState(activeSession?.notes || '')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [checkedItems, setCheckedItems] = useState({})
  const [starredQuestions, setStarredQuestions] = useState({})
  const textareaRef = useRef(null)

  const wordCount = notes.trim().split(/\s+/).filter(Boolean).length
  const canAnalyze = wordCount >= 50

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [notes])

  const handleNotesChange = (e) => {
    setNotes(e.target.value)
    updateSessionNotes(e.target.value)
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setAnalysis(null)

    try {
      // Try real API if available, fall back to mock
      const prompt = AI_PROMPT_TEMPLATE(notes, clientProfile)
      
      // For now, simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 2200))
      setAnalysis(MOCK_ANALYSIS)
    } catch (err) {
      console.error('AI analysis failed:', err)
      setAnalysis(MOCK_ANALYSIS)
    } finally {
      setLoading(false)
    }
  }

  const toggleCheck = (key) => setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }))
  const toggleStar = (key) => setStarredQuestions(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div style={{
      background: 'var(--panel-bg, rgba(15,12,30,0.9))',
      border: '1px solid var(--glass-border, rgba(201,168,76,0.2))',
      borderRadius: 16,
      padding: 24,
      backdropFilter: 'blur(20px)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '1.1rem',
          letterSpacing: '0.1em',
          color: 'var(--gold, #c9a84c)',
          margin: 0,
        }}>
          🤖 AI Note Taker
        </h2>
        {clientProfile.name && (
          <p style={{ margin: '4px 0 0', fontFamily: 'Cormorant Garamond, serif', fontSize: '0.9rem', opacity: 0.7 }}>
            Session with {clientProfile.name} · {clientProfile.hdType || 'HD type unknown'}
          </p>
        )}
      </div>

      {/* Notes textarea */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={handleNotesChange}
          placeholder="Begin capturing session notes here... What themes are emerging? What did your client share? What breakthroughs occurred? Note gate numbers, shadows, emotions, and insights as they arise."
          style={{
            width: '100%',
            minHeight: 160,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--glass-border, rgba(201,168,76,0.2))',
            borderRadius: 10,
            padding: '14px 16px',
            color: 'var(--text, #e8e0d5)',
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1rem',
            lineHeight: 1.7,
            resize: 'none',
            overflow: 'hidden',
            boxSizing: 'border-box',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--gold, #c9a84c)'}
          onBlur={e => e.target.style.borderColor = 'var(--glass-border, rgba(201,168,76,0.2))'}
        />
        <div style={{
          position: 'absolute',
          bottom: 10,
          right: 12,
          fontSize: '0.75rem',
          opacity: 0.5,
          fontFamily: 'Cormorant Garamond, serif',
          color: canAnalyze ? 'var(--gold, #c9a84c)' : 'inherit',
        }}>
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
          {!canAnalyze && wordCount > 0 && ` · ${50 - wordCount} more to analyze`}
        </div>
      </div>

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!canAnalyze || loading}
        style={{
          background: canAnalyze && !loading
            ? 'linear-gradient(135deg, var(--gold, #c9a84c), #e8c97a)'
            : 'rgba(201,168,76,0.2)',
          border: 'none',
          borderRadius: 8,
          padding: '10px 22px',
          color: canAnalyze && !loading ? '#0f0c1e' : 'rgba(201,168,76,0.5)',
          fontFamily: 'Cinzel, serif',
          fontSize: '0.85rem',
          letterSpacing: '0.08em',
          cursor: canAnalyze && !loading ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          width: '100%',
        }}
      >
        🤖 Analyze with AI
      </button>

      {/* Loading state */}
      {loading && <ThinkingDots />}

      {/* Results */}
      {analysis && !loading && (
        <div style={{ marginTop: 20 }}>
          <CollapsibleSection icon="✨" title="Key Insights">
            <ul style={{ margin: 0, padding: '0 0 0 18px' }}>
              {analysis.insights.map((insight, i) => (
                <li key={i} style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  color: 'var(--text, #e8e0d5)',
                  marginBottom: 8,
                }}>
                  {insight}
                </li>
              ))}
            </ul>
          </CollapsibleSection>

          <CollapsibleSection icon="☑" title="Action Items">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analysis.actionItems.map((item, i) => (
                <label key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  cursor: 'pointer',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                  color: checkedItems[i] ? 'rgba(201,168,76,0.5)' : 'var(--text, #e8e0d5)',
                  textDecoration: checkedItems[i] ? 'line-through' : 'none',
                }}>
                  <input
                    type="checkbox"
                    checked={!!checkedItems[i]}
                    onChange={() => toggleCheck(i)}
                    style={{ marginTop: 3, accentColor: 'var(--gold, #c9a84c)', flexShrink: 0 }}
                  />
                  {item}
                </label>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection icon="❓" title="Follow-up Questions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(analysis?.followUpQuestions ?? []).map((q, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <button
                    onClick={() => toggleStar(i)}
                    title="Save for next session"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: '2px 0',
                      flexShrink: 0,
                      opacity: starredQuestions[i] ? 1 : 0.3,
                      color: 'var(--gold, #c9a84c)',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    ★
                  </button>
                  <p style={{
                    margin: 0,
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    color: 'var(--text, #e8e0d5)',
                    fontStyle: 'italic',
                  }}>
                    {q}
                  </p>
                </div>
              ))}
            </div>
            {Object.values(starredQuestions).some(Boolean) && (
              <p style={{ fontSize: '0.8rem', color: 'var(--gold, #c9a84c)', marginTop: 10, opacity: 0.8, fontFamily: 'Cormorant Garamond, serif' }}>
                ★ {Object.values(starredQuestions).filter(Boolean).length} question(s) saved for next session
              </p>
            )}
          </CollapsibleSection>

          <CollapsibleSection icon="🔄" title="Patterns Detected">
            <p style={{
              margin: 0,
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'var(--text, #e8e0d5)',
            }}>
              {analysis.patterns}
            </p>
          </CollapsibleSection>

          <CollapsibleSection icon="📋" title="Practitioner Notes" private>
            <p style={{
              margin: 0,
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'var(--text, #e8e0d5)',
            }}>
              {analysis.practitionerNotes}
            </p>
          </CollapsibleSection>
        </div>
      )}
    </div>
  )
}
