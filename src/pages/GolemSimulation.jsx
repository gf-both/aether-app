import { useState } from 'react'
import { useComputedProfile } from '../hooks/useActiveProfile'
import { useGolemStore } from '../store/useGolemStore'
import { runCompatibilitySimulation } from '../lib/golemConversation'

const SCENARIOS = [
  { id: 'romantic', label: 'Romantic', icon: '💗', desc: 'Dating and relationship compatibility' },
  { id: 'cofounder', label: 'Cofounder', icon: '🤝', desc: 'Business partnership dynamics' },
  { id: 'friendship', label: 'Friendship', icon: '✨', desc: 'Deep friendship potential' },
  { id: 'team', label: 'Team', icon: '⚡', desc: 'Working relationship dynamics' },
]

export default function GolemSimulation() {
  const profile = useComputedProfile()
  const people = useGolemStore(s => s.people) || []
  const setActiveDetail = useGolemStore(s => s.setActiveDetail)
  const [selectedId, setSelectedId] = useState(null)
  const [relType, setRelType] = useState('romantic')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentPhase, setCurrentPhase] = useState('')

  const selectedPerson = (people || []).find(p => String(p.id) === String(selectedId))

  async function runSim() {
    if (!profile || !selectedPerson) return
    setLoading(true)
    setResult(null)

    const phaseLabels = {
      firstimpression: 'First impression...',
      connection: 'Finding connection...',
      conflict: 'Testing conflict...',
      vulnerability: 'Opening up...',
      future: 'Projecting future...'
    }

    try {
      // Simulate phase progress
      const phases = ['firstimpression', 'connection', 'conflict', 'vulnerability', 'future']
      let phaseIdx = 0
      const progressInterval = setInterval(() => {
        if (phaseIdx < phases.length) {
          setCurrentPhase(phaseLabels[phases[phaseIdx]] || 'Analyzing...')
          phaseIdx++
        }
      }, 3000)

      const simResult = await runCompatibilitySimulation(profile, selectedPerson, relType)
      clearInterval(progressInterval)
      setCurrentPhase('Analysis complete')
      setResult(simResult)
    } catch (e) {
      console.error('Simulation error:', e)
      setResult({ error: e.message })
    }
    setLoading(false)
  }

  if (!profile?.dob) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:16, padding:40, textAlign:'center' }}>
        <div style={{ fontSize:48 }}>🔮</div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:14, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--gold)' }}>Golem Simulation</div>
        <div style={{ fontSize:13, color:'var(--muted-foreground)', maxWidth:400, lineHeight:1.85 }}>5-phase compatibility test. Your golem meets theirs under controlled conditions — first impression through future projection, scored. Add your birth date and people to begin.</div>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding:'20px 24px', overflowY:'auto' }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:4 }}>Golem Simulation</div>
      <div style={{ fontSize:12, color:'var(--muted-foreground)', marginBottom:20 }}>Pick a person. Choose the relationship type. Your golems run 5 phases and get scored.</div>

      {/* Scenario type */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {SCENARIOS.map(s => (
          <div key={s.id} onClick={() => setRelType(s.id)} style={{
            padding:'6px 14px', borderRadius:16, cursor:'pointer', fontSize:11,
            background: relType === s.id ? 'rgba(201,168,76,.15)' : 'var(--secondary)',
            border:`1px solid ${relType === s.id ? 'rgba(201,168,76,.4)' : 'var(--border)'}`,
            color: relType === s.id ? 'var(--gold)' : 'var(--foreground)',
            transition:'all .15s',
          }}>
            {s.icon} {s.label}
          </div>
        ))}
      </div>

      {/* Empty constellation warning */}
      {people.length === 0 && (
        <div style={{ padding:'14px 18px', borderRadius:10, background:'rgba(201,168,76,.06)', border:'1px solid rgba(201,168,76,.2)', marginBottom:16, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:20 }}>👥</span>
          <div>
            <div style={{ fontSize:12, color:'var(--gold)', fontWeight:600, marginBottom:3 }}>No one in your constellation yet</div>
            <div style={{ fontSize:11, color:'var(--muted-foreground)', lineHeight:1.6 }}>
              Add people to simulate with them. Go to{' '}
              <span
                onClick={() => setActiveDetail('profile')}
                style={{ color:'var(--gold)', cursor:'pointer', textDecoration:'underline' }}
              >Profiles</span>
              {' '}→ Add Person.
            </div>
          </div>
        </div>
      )}

      {/* Person selector */}
      <div style={{ display:'flex', gap:10, marginBottom:12, alignItems:'center' }}>
        <div style={{ padding:'10px 14px', borderRadius:8, background:'rgba(201,168,76,.06)', border:'1px solid rgba(201,168,76,.2)', fontSize:12, color:'var(--gold)', whiteSpace:'nowrap', flexShrink:0 }}>
          🪬 {profile.name || 'You'}
        </div>
        <div style={{ fontSize:18, color:'var(--muted-foreground)', flexShrink:0 }}>↔</div>
        <select
          value={selectedId || ''}
          onChange={e => setSelectedId(e.target.value || null)}
          style={{ flex:1, minWidth:0, padding:'10px 14px', borderRadius:8, background:'var(--secondary)', border:'1px solid var(--border)', color:'var(--foreground)', fontSize:12, fontFamily:'inherit' }}
        >
          <option value="">{(people || []).length === 0 ? 'No one in constellation yet — add people in Profiles' : 'Select from constellation...'}</option>
          {(people || []).map(p => <option key={p.id} value={p.id}>{p.name} ({p.rel || 'other'})</option>)}
        </select>
      </div>

      <button
        onClick={runSim}
        disabled={loading || !selectedPerson}
        style={{
          width:'100%', padding:'12px 20px', borderRadius:8, marginBottom:20,
          cursor: loading ? 'wait' : !selectedPerson ? 'not-allowed' : 'pointer',
          background: !selectedPerson ? '#1a1a2e' : '#7040c0',
          border: `2px solid ${!selectedPerson ? '#333' : '#9060e0'}`,
          color: !selectedPerson ? '#555' : '#fff',
          fontSize:13, fontFamily:"'Cinzel',serif", letterSpacing:'.1em', textTransform:'uppercase',
          fontWeight:700, transition:'all .2s',
          boxShadow: selectedPerson && !loading ? '0 0 20px rgba(144,80,224,.4), 0 0 40px rgba(144,80,224,.15)' : 'none',
        }}
      >
        {loading ? (currentPhase || 'Running…') : 'Run Simulation'}
      </button>

      {/* Results */}
      {result && !result.error && (
        <div>
          {/* Score */}
          {result.score != null && (
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:48, color:'var(--gold)' }}>{result.score}%</div>
              <div style={{ fontSize:11, color:'var(--muted-foreground)', textTransform:'uppercase', letterSpacing:'.1em' }}>Compatibility</div>
            </div>
          )}

          {/* Analysis */}
          {result.analysis && (
            <div style={{ padding:'16px 20px', borderRadius:10, background:'rgba(144,80,224,.05)', border:'1px solid rgba(144,80,224,.15)', fontSize:13, lineHeight:1.85, color:'rgba(255,255,255,.85)', marginBottom:20, whiteSpace:'pre-wrap' }}>
              {result.analysis}
            </div>
          )}

          {/* Exchanges */}
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(201,168,76,.5)', marginBottom:12 }}>Simulation Exchange</div>
          {(result.exchanges || []).map((ex, i) => (
            <div key={i} style={{ marginBottom:16 }}>
              <div style={{ fontSize:9, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(201,168,76,.4)', marginBottom:8 }}>
                {ex.phase}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ alignSelf:'flex-start', maxWidth:'75%', padding:'8px 12px', borderRadius:'10px 10px 10px 2px', background:'rgba(201,168,76,.07)', border:'1px solid rgba(201,168,76,.15)', fontSize:12, lineHeight:1.6 }}>
                  <span style={{ fontSize:9, color:'var(--gold)', display:'block', marginBottom:4 }}>{profile.name}</span>
                  {ex.golemA}
                </div>
                <div style={{ alignSelf:'flex-end', maxWidth:'75%', padding:'8px 12px', borderRadius:'10px 10px 2px 10px', background:'rgba(212,48,112,.07)', border:'1px solid rgba(212,48,112,.15)', fontSize:12, lineHeight:1.6 }}>
                  <span style={{ fontSize:9, color:'rgba(212,48,112,.8)', display:'block', marginBottom:4 }}>{selectedPerson?.name}</span>
                  {ex.golemB}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {result?.error && (
        <div style={{ padding:'16px 20px', borderRadius:10, background:'rgba(220,48,48,.05)', border:'1px solid rgba(220,48,48,.2)', fontSize:12, color:'rgba(220,100,100,.8)' }}>
          Simulation error: {result.error}
        </div>
      )}
    </div>
  )
}
