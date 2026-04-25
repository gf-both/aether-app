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
      } else {
        // Local fallback synthesis from engine data
        const personalYear = engineData?.personalYear
        const pyTheme = PERSONAL_YEAR_THEMES[personalYear] || 'transition and growth'
        const lp = engineData?.num?.core?.lifePath?.val || profile.lifePath || '?'
        const lpTitle = engineData?.num?.core?.lifePath?.title || ''
        const hdType = (profile.hdType && profile.hdType !== '?') ? profile.hdType : engineData?.hd?.type || '?'
        const hdStrategy = engineData?.hd?.strategy || ''
        const hdAuth = (profile.hdAuth && profile.hdAuth !== '?') ? profile.hdAuth : engineData?.hd?.authority || ''
        const age = profile.dob ? Math.floor((new Date() - new Date(profile.dob)) / (365.25 * 24 * 3600 * 1000)) : '?'
        const sign = profile.sign || '?'

        const localSections = {
          phase: `At ${age}, you are ${age >= 27 && age <= 30 ? 'in or near your Saturn Return — the foundational life restructuring that demands you stop living by inherited rules and start living by your own' : age >= 41 && age <= 44 ? 'in your Uranus Opposition — the mid-life awakening where everything not authentically yours begins to feel intolerable' : age >= 36 && age <= 38 ? 'at the Life Path maturation point — the skills you\'ve been developing are ready for their first real application' : age >= 50 && age <= 52 ? 'approaching your Chiron Return — the wound you\'ve carried since childhood is ready to become your teaching' : 'in a developmental phase where your core patterns are becoming visible enough to work with consciously'}. ${hdType !== '?' ? `Your ${hdType} design at this age means ${hdType === 'Projector' ? 'recognition is arriving based on work you\'ve already done — don\'t chase, let it come' : hdType === 'Generator' ? 'you\'re refining what actually satisfies you vs. what merely keeps you busy' : hdType === 'Manifestor' ? 'the initiations you make now have more impact than at any previous point' : hdType === 'Manifesting Generator' ? 'you\'re learning which of your many paths to prune and which to double down on' : 'the patterns you\'ve been absorbing from your environment are crystallizing into wisdom'}.` : ''} Life Path ${lp} (${lpTitle}) adds ${lp == 7 ? 'the requirement for solitude and deep reflection before the next phase opens' : lp == 1 ? 'the pressure to lead rather than follow — delegation is the current lesson' : lp == 4 ? 'the need for structural foundation — nothing lasting can be built on what hasn\'t been properly grounded' : 'its specific developmental arc to this moment'}.`,

          yeartheme: `Personal Year ${personalYear}: ${pyTheme}. ${personalYear == 1 ? 'This is a year of beginnings — plant seeds, don\'t harvest. What you initiate now sets the tone for the next 9-year cycle.' : personalYear == 9 ? 'This is a year of completion and release — everything not aligned with your next cycle is asking to be let go. Resist the urge to start new things.' : personalYear == 5 ? 'This is a year of change and freedom — the structures that felt safe last year now feel constraining. Travel, experiment, break patterns.' : personalYear == 7 ? 'This is your sabbatical year — go inward. Study, reflect, seek understanding. External achievement is not the point.' : personalYear == 8 ? 'This is your power year — financial and material manifestation peaks. Step into authority. Make the big moves.' : `The energy of ${personalYear} asks you to ${pyTheme.toLowerCase()}`}. ${sign !== '?' ? `Your ${sign} Sun filters this year's energy through ${sign === 'Capricorn' || sign === 'Virgo' || sign === 'Taurus' ? 'a practical lens — results matter more than intentions' : sign === 'Aries' || sign === 'Leo' || sign === 'Sagittarius' ? 'an action-oriented lens — move first, strategize second' : sign === 'Gemini' || sign === 'Libra' || sign === 'Aquarius' ? 'an intellectual lens — understand it before you commit' : 'an intuitive lens — feel your way through rather than forcing a plan'}.` : ''}`,

          decision: question
            ? `Regarding "${question}": ${hdType !== '?' ? `Your ${hdType} strategy says ${hdStrategy} — apply this to this specific decision.` : ''} ${hdAuth ? `Your ${hdAuth} authority means you should ${hdAuth === 'Emotional' || hdAuth === 'Solar Plexus' ? 'NOT decide this impulsively — wait for emotional clarity over 2-3 days minimum' : hdAuth === 'Sacral' ? 'check your gut response — does your body say yes (expansive) or no (contractive)?' : hdAuth === 'Splenic' ? 'trust your initial instinct — the first hit is usually right, the second-guessing usually wrong' : 'consult your specific authority before committing'}.` : ''} Personal Year ${personalYear} ${personalYear <= 3 ? 'supports new initiatives' : personalYear >= 7 ? 'favors reflection over action' : 'is neutral on timing — the question is alignment, not timing'}.`
            : `Personal Year ${personalYear} ${personalYear == 1 || personalYear == 5 || personalYear == 8 ? 'is a strong decision-making year — trust bold moves' : personalYear == 7 || personalYear == 9 ? 'favors releasing old commitments over making new ones' : 'supports measured, intentional choices'}. ${hdType !== '?' ? `As a ${hdType}, your best decisions come from ${hdStrategy} — never from pressure, urgency, or other people\'s timelines.` : 'Make decisions from your center, not from external pressure.'}`,

          timing: `Right now, Personal Year ${personalYear} is ${personalYear <= 4 ? 'in the building phase of the 9-year cycle — momentum is growing' : personalYear <= 6 ? 'at the midpoint — consolidation and relationship dynamics are prominent' : 'in the release phase — completion energy is strong'}. ${age >= 27 && age <= 30 ? 'Your Saturn Return is the dominant timing event — everything else is secondary to this structural reckoning.' : age >= 41 && age <= 44 ? 'Your Uranus Opposition is creating liberation pressure — what feels like crisis is actually freedom trying to arrive.' : `At ${age}, you're in a phase where ${lp == 7 ? 'inner work pays more dividends than external action' : lp == 8 ? 'material mastery is available if you claim it' : 'consistent effort compounds'}.`} ${hdType === 'Reflector' ? 'Wait a full lunar cycle (28 days) before any major commitment.' : hdType === 'Projector' ? 'The invitations worth accepting are the ones that recognize what you uniquely see.' : ''}`,

          action: `${hdType !== '?' ? `As a ${hdType}: ${hdType === 'Generator' ? 'this month, practice saying NO to everything that doesn\'t produce a sacral "uh-huh." Track what genuinely lights you up vs. what you do from obligation' : hdType === 'Projector' ? 'this month, stop initiating. Let people come to you. When they do, share your insight. When they don\'t, rest and study' : hdType === 'Manifestor' ? 'this month, initiate ONE thing you\'ve been holding back on — but inform the people affected BEFORE you act' : hdType === 'Manifesting Generator' ? 'this month, complete one project before starting another. Your superpower is speed — your kryptonite is abandoning things at 80%' : 'this month, journal every evening about whose energy you absorbed today — learn to separate your feelings from others\''}` : `This month, focus on ${personalYear == 1 ? 'starting one thing that scares you' : personalYear == 9 ? 'letting go of one thing that no longer serves you' : 'one action aligned with your core purpose'}`}. ${lp !== '?' ? `Life Path ${lp} reminds you: ${lp == 7 ? 'the answer you\'re seeking won\'t come from more information — it will come from stillness' : lp == 1 ? 'you don\'t need permission — you need conviction' : lp == 4 ? 'build the system, then trust it — stop rebuilding from scratch' : 'your path has its own intelligence — cooperate with it'}.` : ''}`,
        }

        setResult(localSections)
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
              padding:'12px 28px', borderRadius:8, cursor: loading ? 'wait' : 'pointer',
              background: loading ? '#1a1a2e' : '#3a8a20',
              border: `2px solid ${loading ? '#333' : '#50b030'}`,
              color: loading ? '#555' : '#fff',
              fontSize:13, fontFamily:"'Cinzel',serif", fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase',
              transition:'all .2s',
              boxShadow: !loading ? '0 0 20px rgba(96,176,48,.35), 0 0 40px rgba(96,176,48,.12)' : 'none',
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
