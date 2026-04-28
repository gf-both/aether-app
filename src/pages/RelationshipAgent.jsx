import { useState, useEffect, useCallback } from 'react'
import { useComputedProfile, useComputedPeople } from '../hooks/useActiveProfile'
import { useGolemStore } from '../store/useGolemStore'
import { callAI } from '../lib/ai'

export default function RelationshipAgent() {
  const profile = useComputedProfile()
  const people = useComputedPeople()
  const relationshipAnalysis = useGolemStore(s => s.relationshipAnalysis)
  const setRelationshipAnalysis = useGolemStore(s => s.setRelationshipAnalysis)
  const [selectedPersonId, setSelectedPersonId] = useState(null)
  const [relType, setRelType] = useState('romantic')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [section, setSection] = useState('attraction')

  // Build persistence key from profile + person + relType
  const getRelKey = useCallback((personId, type) => {
    if (!profile?.dob || !personId) return null
    return `${profile.dob}::${personId}::${type}`
  }, [profile?.dob])

  // Load saved result when person or relType changes
  useEffect(() => {
    const key = getRelKey(selectedPersonId, relType)
    if (key && relationshipAnalysis[key]?.sections) {
      setResult(relationshipAnalysis[key].sections)
      setSection('attraction')
    } else {
      setResult(null)
    }
  }, [selectedPersonId, relType, getRelKey])

  const selectedPerson = people?.find(p => String(p.id) === String(selectedPersonId))

  function buildFallback(a, b, type) {
    const typeMap = { romantic: 'romantic', cofounder: 'cofounder', family: 'family', friendship: 'friendship', business: 'business' }
    const t = typeMap[type] || 'relationship'
    return {
      attraction: `${a.name} (${a.sign || '?'} Sun, ${a.hdType || '?'}) and ${b.name} (${b.sign || '?'} Sun, ${b.hdType || '?'}) are drawn together through a ${t} pull rooted in archetypal complementarity. The ${a.sign || 'solar'} and ${b.sign || 'lunar'} polarity creates natural magnetic tension. What each lacks, the other embodies — this pairing reflects a classic soul-recognition dynamic.`,
      shadow: `${a.name}'s ${a.moon || '?'} Moon meets ${b.name}'s ${b.moon || '?'} Moon — where these emotional currents diverge, unconscious friction emerges. ${a.name} may trigger ${b.name}'s core wound around autonomy; ${b.name} may awaken ${a.name}'s deeper need for recognition. The shadow material of each activates the other's unresolved patterns.`,
      communication: `${a.hdType || 'their'} and ${b.hdType || 'their'} Human Design types create a specific conversational rhythm. Where one speaks from authority, the other listens from reception. Their Mercury dynamics — shaped by ${a.sign || '?'} and ${b.sign || '?'} — determine whether information flows or becomes a site of misunderstanding. Direct expression is always more effective than inference here.`,
      power: `The ${a.hdType || '?'} and ${b.hdType || '?'} dynamic creates an asymmetry in how energy is initiated and received. In ${t} context, this tends toward a fluid exchange when both honor their strategies, or a power struggle when ego overrides design. ${a.name} leads through ${a.hdType === 'Generator' || a.hdType === 'Manifesting Generator' ? 'response' : 'invitation'}; ${b.name} through ${b.hdType === 'Generator' || b.hdType === 'Manifesting Generator' ? 'response' : 'projection or manifestation'}.`,
      pattern: `The repeating loop in this ${t} pairing is the cycle of resonance and rupture — deep connection followed by withdrawal or friction, then reconnection at a deeper level. The lesson offered is learning to remain present through difference rather than projecting onto the other. The gift of this relationship is the mirror it holds up to each person's unintegrated self.`,
    }
  }

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
        const key = getRelKey(selectedPersonId, relType)
        if (key) setRelationshipAnalysis(key, sections)
      } else {
        const fb = buildFallback(profile, selectedPerson, relType)
        setResult(fb)
        const key = getRelKey(selectedPersonId, relType)
        if (key) setRelationshipAnalysis(key, fb)
      }
      setSection('attraction')
    } catch (e) {
      console.error('Relationship analysis error:', e)
      const fb = buildFallback(profile, selectedPerson, relType)
      setResult(fb)
      const key = getRelKey(selectedPersonId, relType)
      if (key) setRelationshipAnalysis(key, fb)
    }
    setLoading(false)
  }

  if (!profile?.dob) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:16, padding:40, textAlign:'center' }}>
        <div style={{ fontSize:48 }}>💫</div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:14, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--gold)' }}>Relationship Patterns</div>
        <div style={{ fontSize:13, color:'var(--muted-foreground)', maxWidth:400, lineHeight:1.85 }}>
          Pick any person in your constellation. AI analyzes the dynamic — attraction, shadow triggers, power, communication. Add your birth date and at least one person to begin.
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
            padding:'12px 28px', borderRadius:8,
            cursor: (loading || !selectedPerson) ? 'not-allowed' : 'pointer',
            background: (loading || !selectedPerson) ? '#1a1a2e' : '#d43070',
            border: `2px solid ${(loading || !selectedPerson) ? '#333' : '#e84890'}`,
            color: (loading || !selectedPerson) ? '#555' : '#fff',
            fontSize:13, fontFamily:"'Cinzel',serif", fontWeight:700,
            letterSpacing:'.1em', textTransform:'uppercase',
            transition:'all .2s',
            boxShadow: (!loading && selectedPerson) ? '0 0 20px rgba(212,48,112,.4), 0 0 40px rgba(212,48,112,.15)' : 'none',
          }}
        >
          {loading ? 'Analyzing...' : '▶ Analyze Pattern'}
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
              <div style={{ fontSize:14, lineHeight:1.85, color:'var(--foreground)' }}>
                {result[section] || 'Section not found in response.'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            flex:1, padding:'20px', borderRadius:10,
            background:'rgba(212,48,112,.04)', border:'1px solid rgba(212,48,112,.15)',
            fontSize:13, lineHeight:1.85, color:'var(--foreground)', whiteSpace:'pre-wrap',
          }}>
            {result.raw}
          </div>
        )
      )}
    </div>
  )
}
