import { useState } from 'react'
import { useActiveProfile } from '../hooks/useActiveProfile'
import { useAboveInsideStore } from '../store/useAboveInsideStore'
import { callAI } from '../lib/ai'

export default function RelationshipAgent() {
  const profile = useActiveProfile()
  const people = useAboveInsideStore(s => s.people)
  const [selectedPersonId, setSelectedPersonId] = useState(null)
  const [relType, setRelType] = useState('romantic')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [section, setSection] = useState('attraction')

  const selectedPerson = people?.find(p => p.id === selectedPersonId)

  function buildRelationshipPrompt(personA, personB) {
    return `You are a master relationship pattern analyst. Analyze the dynamic between these two people using their symbolic profiles.

DO NOT give generic compatibility advice. Identify the SPECIFIC patterns, triggers, and dynamics unique to THIS pairing.

## PERSON A: ${personA.name}
- Sun: ${personA.sign || '?'}, Moon: ${personA.moon || '?'}, Rising: ${personA.asc || '?'}
- Human Design: ${personA.hdType || '?'} ${personA.hdProfile || ''}
- Life Path: ${personA.lifePath || '?'}

## PERSON B: ${personB.name}
- Sun: ${personB.sign || '?'}, Moon: ${personB.moon || '?'}, Rising: ${personB.asc || '?'}
- Human Design: ${personB.hdType || '?'} ${personB.hdProfile || ''}
- Life Path: ${personB.lifePath || '?'}

## RELATIONSHIP TYPE: ${relType}

## YOUR OUTPUT — 5 sections, 2-3 sentences each, specific to this pairing:

1. **ATTRACTION MECHANISM** — What pulls these two together? What is the archetypal resonance?

2. **SHADOW TRIGGERS** — What unconscious patterns does each person activate in the other? Where will conflict emerge?

3. **COMMUNICATION DYNAMIC** — How do they talk? Where do they understand each other and where do they miss?

4. **POWER DYNAMIC** — How does energy and authority flow? Who leads, who follows, who resists?

5. **THE PATTERN** — What is the repeating loop in this relationship? What lesson does it offer?`
  }

  async function runAnalysis() {
    if (!profile || !selectedPerson) return
    setLoading(true)
    setResult(null)

    try {
      const response = await callAI({
        systemPrompt: 'You are a relationship pattern analyst who integrates astrology, Human Design, and depth psychology to reveal the unconscious dynamics in human relationships.',
        messages: [{ role: 'user', content: buildRelationshipPrompt(profile, selectedPerson) }],
        maxTokens: 1000,
      })

      if (response) {
        const sections = {}
        const sectionNames = ['ATTRACTION MECHANISM', 'SHADOW TRIGGERS', 'COMMUNICATION DYNAMIC', 'POWER DYNAMIC', 'THE PATTERN']
        const keys = ['attraction', 'shadow', 'communication', 'power', 'pattern']

        sectionNames.forEach((name, i) => {
          const regex = new RegExp(`\\*\\*${name}\\*\\*[^\\n]*\\n([\\s\\S]*?)(?=\\n\\d+\\.\\s+\\*\\*[A-Z]|\\*\\*[A-Z][A-Z]|$)`, 'i')
          const match = response.match(regex)
          if (match) sections[keys[i]] = match[1].trim()
        })

        if (Object.keys(sections).length < 3) {
          sections.raw = response
        }

        setResult(sections)
        setSection('attraction')
      }
    } catch (e) {
      console.error('Relationship analysis error:', e)
    }
    setLoading(false)
  }

  if (!profile?.dob) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:16, padding:40, textAlign:'center' }}>
        <div style={{ fontSize:48 }}>💫</div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:14, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--gold)' }}>Relationship Patterns</div>
        <div style={{ fontSize:12, color:'var(--muted-foreground)', maxWidth:360, lineHeight:1.8 }}>
          Add your birth data and at least one person to your constellation to analyze relationship dynamics.
        </div>
      </div>
    )
  }

  const SECTIONS = [
    { key: 'attraction',    label: 'Attraction',     icon: '✨', color: 'rgba(212,48,112,' },
    { key: 'shadow',        label: 'Shadow Triggers', icon: '🌑', color: 'rgba(144,80,224,' },
    { key: 'communication', label: 'Communication',   icon: '💬', color: 'rgba(64,204,221,' },
    { key: 'power',         label: 'Power Dynamic',   icon: '⚖️', color: 'rgba(240,160,60,' },
    { key: 'pattern',       label: 'The Pattern',     icon: '🔄', color: 'rgba(201,168,76,' },
  ]

  const hasParsed = result && !result.raw

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding:'20px 24px', overflowY:'auto' }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:4 }}>
        Relationship Patterns
      </div>
      <div style={{ fontSize:12, color:'var(--muted-foreground)', marginBottom:20 }}>
        Why do you repeat this pattern? Select a person to analyze the dynamic.
      </div>

      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <select
          value={selectedPersonId || ''}
          onChange={e => setSelectedPersonId(e.target.value || null)}
          style={{
            padding:'8px 12px', borderRadius:7, background:'var(--secondary)',
            border:'1px solid var(--border)', color:'var(--foreground)',
            fontSize:12, fontFamily:'inherit', flex:1, minWidth:200,
          }}
        >
          <option value="">Select a person from your constellation...</option>
          {(people || []).map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.rel || 'other'})</option>
          ))}
        </select>

        <select
          value={relType}
          onChange={e => setRelType(e.target.value)}
          style={{
            padding:'8px 12px', borderRadius:7, background:'var(--secondary)',
            border:'1px solid var(--border)', color:'var(--foreground)',
            fontSize:12, fontFamily:'inherit',
          }}
        >
          <option value="romantic">Romantic</option>
          <option value="cofounder">Cofounder</option>
          <option value="family">Family</option>
          <option value="friendship">Friendship</option>
          <option value="business">Business</option>
        </select>

        <button
          onClick={runAnalysis}
          disabled={loading || !selectedPerson}
          style={{
            padding:'8px 20px', borderRadius:7,
            cursor: (loading || !selectedPerson) ? 'not-allowed' : 'pointer',
            background:'rgba(212,48,112,.1)', border:'1px solid rgba(212,48,112,.3)',
            color:'rgba(212,48,112,.9)', fontSize:12, fontFamily:"'Cinzel',serif",
            letterSpacing:'.08em', textTransform:'uppercase',
            opacity: !selectedPerson ? 0.5 : 1, transition:'all .2s',
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze Pattern'}
        </button>
      </div>

      {result && (
        hasParsed ? (
          <div style={{ display:'flex', gap:20, flex:1 }}>
            {/* Section nav */}
            <div style={{ width:180, flexShrink:0 }}>
              {SECTIONS.map(s => (
                <div
                  key={s.key}
                  onClick={() => setSection(s.key)}
                  style={{
                    display:'flex', alignItems:'center', gap:8, padding:'10px 12px',
                    borderRadius:7, cursor:'pointer', marginBottom:4,
                    background: section === s.key ? `${s.color}0.1)` : 'transparent',
                    border:`1px solid ${section === s.key ? `${s.color}0.3)` : 'transparent'}`,
                    transition:'all .15s',
                  }}
                >
                  <span style={{ fontSize:16 }}>{s.icon}</span>
                  <div style={{
                    fontSize:11, fontFamily:"'Cinzel',serif", textTransform:'uppercase',
                    letterSpacing:'.08em',
                    color: section === s.key ? 'var(--foreground)' : 'var(--muted-foreground)',
                  }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Content */}
            <div style={{
              flex:1, padding:'16px 20px', borderRadius:10,
              background:'rgba(212,48,112,.04)', border:'1px solid rgba(212,48,112,.12)', minHeight:200,
            }}>
              <div style={{
                fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:'.12em',
                textTransform:'uppercase', color:'rgba(212,48,112,.9)', marginBottom:12,
              }}>
                {SECTIONS.find(s => s.key === section)?.label}
              </div>
              <div style={{ fontSize:14, lineHeight:1.85, color:'rgba(255,255,255,.85)' }}>
                {result[section] || 'Section not found in response.'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            flex:1, padding:'20px', borderRadius:10,
            background:'rgba(212,48,112,.04)', border:'1px solid rgba(212,48,112,.15)',
            fontSize:13, lineHeight:1.85, color:'rgba(255,255,255,.85)', whiteSpace:'pre-wrap',
          }}>
            {result.raw}
          </div>
        )
      )}
    </div>
  )
}
