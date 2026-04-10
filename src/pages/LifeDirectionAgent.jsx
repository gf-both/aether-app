import { useState, useMemo } from 'react'
import { useComputedProfile as useActiveProfile } from '../hooks/useActiveProfile'
import { getNumerologyProfileFromDob } from '../engines/numerologyEngine'
import { computeHDChart } from '../engines/hdEngine'
import { callAI } from '../lib/ai'

// Derive personal year from dob + current year
function getPersonalYear(dob, referenceDate = new Date()) {
  if (!dob) return null
  const [, m, d] = dob.split('-').map(Number)
  const year = referenceDate.getFullYear()
  const digits = `${d}${m}${year}`.split('').map(Number)
  let sum = digits.reduce((a, b) => a + b, 0)
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = String(sum).split('').map(Number).reduce((a, b) => a + b, 0)
  }
  return sum
}

function getCurrentYear() {
  return new Date().getFullYear()
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const PERSONAL_YEAR_THEMES = {
  1: 'New beginnings, planting seeds, independence',
  2: 'Partnerships, patience, emotional sensitivity',
  3: 'Creativity, self-expression, expansion',
  4: 'Building, discipline, laying foundations',
  5: 'Change, freedom, unexpected shifts',
  6: 'Responsibility, home, relationships, service',
  7: 'Introspection, spiritual depth, inner knowing',
  8: 'Power, abundance, manifestation, authority',
  9: 'Completion, releasing, clearing the old',
  11: 'Illumination, spiritual awakening, higher purpose',
  22: 'Master builder — legacy-scale work, global impact',
}

export default function LifeDirectionAgent() {
  const profile = useActiveProfile()
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [section, setSection] = useState('phase')

  const engineData = useMemo(() => {
    if (!profile?.dob) return null
    try {
      const personalYear = getPersonalYear(profile.dob)
      const num = getNumerologyProfileFromDob(profile.dob, (profile.name || 'Unknown').toUpperCase(), {})
      const tz = profile.birthTimezone ?? -3
      const hd = (profile.hdType && profile.hdType !== '?')
        ? null
        : computeHDChart({ dateOfBirth: profile.dob, timeOfBirth: profile.tob || '12:00', utcOffset: tz })
      return { personalYear, num, hd }
    } catch { return null }
  }, [profile?.dob, profile?.tob, profile?.birthTimezone])

  function buildDirectionPrompt() {
    const now = new Date()
    const personalYear = engineData?.personalYear
    const personalYearTheme = PERSONAL_YEAR_THEMES[personalYear] || ''
    const lp = engineData?.num?.core?.lifePath?.val || profile.lifePath || 'unknown'
    const hdType = (profile.hdType && profile.hdType !== '?') ? profile.hdType : engineData?.hd?.type || 'unknown'
    const hdStrategy = engineData?.hd?.strategy || 'unknown'
    const age = profile.dob ? Math.floor((now - new Date(profile.dob)) / (365.25 * 24 * 3600 * 1000)) : 'unknown'

    return `You are a master life strategist who reads symbolic timing cycles to give precise, actionable guidance.

Your job: synthesize ${profile.name || 'this person'}'s life purpose + current timing cycles into specific direction for RIGHT NOW.

## PERSON
Name: ${profile.name || 'Unknown'}
Born: ${profile.dob}${profile.tob ? ` at ${profile.tob}` : ''} in ${profile.pob || 'unknown'}
Age now: ${age}
Today's date: ${formatDate(now)}

## TIMING DATA
- Personal Year: ${personalYear} — ${personalYearTheme}
- Year: ${getCurrentYear()}
- Sun Sign: ${profile.sign || 'unknown'}
- Moon: ${profile.moon || 'unknown'}
- Rising: ${profile.asc || 'unknown'}

## LIFE PURPOSE DATA
- Life Path: ${lp}
- Human Design Type: ${hdType}
- HD Strategy: ${hdStrategy}
- HD Authority: ${(profile.hdAuth && profile.hdAuth !== '?') ? profile.hdAuth : engineData?.hd?.authority || 'unknown'}
- HD Profile: ${(profile.hdProfile && profile.hdProfile !== '?') ? profile.hdProfile : engineData?.hd?.profile || 'unknown'}
${question ? `\n## SPECIFIC QUESTION FROM THE PERSON\n"${question}"\nAnswer this question directly in the DECISION CLARITY section using their symbolic profile.` : ''}

## YOUR OUTPUT — 5 sections, 3-4 sentences each. Be specific. Avoid vague generalities.

1. **CURRENT PHASE** — What major life cycle are they in right now? What is the developmental task of this phase? What is trying to complete, and what is trying to be born?

2. **THIS YEAR'S THEME** — Based on Personal Year ${personalYear} and current astrology: what is the dominant theme of ${getCurrentYear()} for this person? What must they focus on vs. let go?

3. **DECISION CLARITY** — ${question ? `Answer their question: "${question}" using their symbolic frameworks.` : 'Given their current cycle and life purpose, what type of decisions is this a good time to make — and what type should be deferred?'}

4. **TIMING WINDOWS** — What is opening right now that they should step into? What is closing that they need to release? Be specific about the current moment.

5. **THE ACTION** — What is the ONE specific thing this person should do or stop doing in the next 30 days, based on everything above? Make it concrete and actionable.`
  }

  async function runAnalysis() {
    if (!profile?.dob || !profile?.name) return
    setLoading(true)
    setResult(null)

    try {
      const response = await callAI({
        systemPrompt: 'You are a life direction strategist who synthesizes astrological timing, numerological cycles, and Human Design strategy to give precise, actionable guidance for this moment in a person\'s life.',
        messages: [{ role: 'user', content: buildDirectionPrompt() }],
        maxTokens: 1200,
      })

      if (response) {
        const sections = {}
        const sectionNames = ['CURRENT PHASE', "THIS YEAR'S THEME", 'DECISION CLARITY', 'TIMING WINDOWS', 'THE ACTION']
        const keys = ['phase', 'yeartheme', 'decision', 'timing', 'action']

        sectionNames.forEach((name, i) => {
          const escaped = name.replace(/'/g, "[''`']?")
          const regex = new RegExp(`\\*\\*${escaped}\\*\\*[^\\n]*\\n([\\s\\S]*?)(?=\\n\\d+\\.\\s+\\*\\*[A-Z]|\\*\\*[A-Z][A-Z]|$)`, 'i')
          const match = response.match(regex)
          if (match) sections[keys[i]] = match[1].trim()
        })

        if (Object.keys(sections).length < 3) {
          sections.raw = response
        }

        setResult(sections)
        setSection('phase')
      }
    } catch (e) {
      console.error('Life direction error:', e)
    }
    setLoading(false)
  }

  if (!profile?.dob || !profile?.name) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:20, padding:40, textAlign:'center' }}>
        <div style={{ fontSize:48 }}>🧭</div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:14, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--gold)' }}>Life Direction</div>
        <div style={{ fontSize:12, color:'var(--muted-foreground)', maxWidth:360, lineHeight:1.8 }}>
          Add your name and birth date to activate Life Direction guidance. This agent reads your timing cycles and life purpose to show where you are and where to go next.
        </div>
      </div>
    )
  }

  const SECTIONS = [
    { key: 'phase',     label: 'Current Phase',    icon: '🌀', color: 'rgba(96,176,48,' },
    { key: 'yeartheme', label: "This Year's Theme", icon: '📅', color: 'rgba(201,168,76,' },
    { key: 'decision',  label: 'Decision Clarity',  icon: '⚖️', color: 'rgba(64,204,221,' },
    { key: 'timing',    label: 'Timing Windows',    icon: '⏳', color: 'rgba(144,80,224,' },
    { key: 'action',    label: 'The Action',         icon: '🎯', color: 'rgba(240,80,60,' },
  ]

  const hasParsed = result && !result.raw
  const personalYear = engineData?.personalYear

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding:'20px 24px', overflowY:'auto' }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:4 }}>
        Life Direction
      </div>
      <div style={{ fontSize:12, color:'var(--muted-foreground)', marginBottom:16 }}>
        Where should your life go from here? Current timing cycles + life purpose synthesized.
        {personalYear && (
          <span style={{ marginLeft:8, color:'var(--gold)', opacity:.7 }}>
            Personal Year {personalYear} — {PERSONAL_YEAR_THEMES[personalYear]}
          </span>
        )}
      </div>

      {/* Optional question input */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:11, color:'var(--muted-foreground)', marginBottom:6, letterSpacing:'.05em' }}>
          Optional: Ask a specific question (career, relationship, move, timing...)
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && runAnalysis()}
            placeholder="e.g. Should I launch my business this year?"
            style={{
              flex:1, padding:'9px 14px', borderRadius:7,
              background:'var(--secondary)', border:'1px solid var(--border)',
              color:'var(--foreground)', fontSize:12, fontFamily:'inherit',
              outline:'none',
            }}
          />
          <button
            onClick={runAnalysis}
            disabled={loading}
            style={{
              padding:'9px 22px', borderRadius:7, cursor: loading ? 'wait' : 'pointer',
              background: loading ? 'var(--secondary)' : 'rgba(96,176,48,.1)',
              border:`1px solid ${loading ? 'var(--border)' : 'rgba(96,176,48,.4)'}`,
              color: loading ? 'var(--muted-foreground)' : 'rgba(96,176,48,.9)',
              fontSize:12, fontFamily:"'Cinzel',serif", letterSpacing:'.08em', textTransform:'uppercase',
              transition:'all .2s',
            }}
          >
            {loading ? 'Reading cycles...' : result ? 'Re-read' : 'Get Direction'}
          </button>
        </div>
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
              background:'rgba(96,176,48,.04)', border:'1px solid rgba(96,176,48,.12)', minHeight:200,
            }}>
              <div style={{
                fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:'.12em',
                textTransform:'uppercase', color:'rgba(96,176,48,.9)', marginBottom:12,
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
            background:'rgba(96,176,48,.04)', border:'1px solid rgba(96,176,48,.15)',
            fontSize:13, lineHeight:1.85, color:'rgba(255,255,255,.85)', whiteSpace:'pre-wrap',
          }}>
            {result.raw}
          </div>
        )
      )}
    </div>
  )
}
