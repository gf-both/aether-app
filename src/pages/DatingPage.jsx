import { useState, useMemo } from 'react'
import { useGolemStore } from '../store/useGolemStore'
import { computeCompatibility } from '../engines/compatibilityEngine'
import { getNatalChart } from '../engines/natalEngine'
import { computeHDChart } from '../engines/hdEngine'
import { getNumerologyProfileFromDob } from '../engines/numerologyEngine'
import { resolvePob } from '../utils/profileUtils'
import GolemAvatar from '../components/ui/GolemAvatar'

const CONNECTION_TYPES = [
  { id: 'romantic', label: 'Romantic', icon: '💗' },
  { id: 'cofounder', label: 'Cofounder', icon: '🤝' },
  { id: 'friendship', label: 'Friendship', icon: '✨' },
  { id: 'creative', label: 'Creative', icon: '🎨' },
  { id: 'mentor', label: 'Mentor', icon: '🌱' },
]

const MATCHING_LAYERS = [
  { num: 1, name: 'Framework Compatibility', desc: '22 systems compute raw compatibility scores', icon: '⛹', color: '#c9a84c', status: 'active' },
  { num: 2, name: 'Golem Conversations', desc: 'Your AI identity talks to theirs autonomously', icon: '💬', color: '#40ccdd', status: 'active' },
  { num: 3, name: 'Attraction Intelligence', desc: 'Visual preference patterns from AI face training', icon: '👁', color: '#c44d7a', status: 'coming' },
  { num: 4, name: 'Mutual Confirmation', desc: 'Both Golems agree before any identity is revealed', icon: '🔒', color: '#60b030', status: 'active' },
  { num: 5, name: 'Ongoing Intelligence', desc: 'Relationship patterns tracked after connection', icon: '☾', color: '#aa66ff', status: 'coming' },
]

const DEMO_ACTIVITY = [
  { type: 'conversation', from: 'Golem #4291', to: 'Your Golem', topic: 'Both share Gate 41 (Anticipation) — explored how longing shapes their creative process', time: '2h ago', heat: 94 },
  { type: 'match', from: 'Your Golem', to: 'Golem #1887', topic: 'HD channel completion detected: 20-34 (Charisma). Projector meets Generator.', time: '5h ago', heat: 87 },
  { type: 'conversation', from: 'Golem #3102', to: 'Your Golem', topic: 'Debated shadow patterns — both carry Gate 36 (Crisis). Conversation turned raw.', time: '8h ago', heat: 91 },
  { type: 'insight', from: 'Network', to: 'Your Golem', topic: 'Your Golem has a pattern: 73% of deep conversations happen with Projector types.', time: '1d ago', heat: 78 },
  { type: 'conversation', from: 'Your Golem', to: 'Golem #2456', topic: 'Life Path 7 meets Life Path 11 — the Seeker-Illuminator axis. 47 minutes of dialogue.', time: '1d ago', heat: 85 },
  { type: 'match', from: 'Golem #5501', to: 'Your Golem', topic: 'Mayan Kin resonance: Occult partner detected. Hidden power activation.', time: '2d ago', heat: 82 },
]

const NETWORK_STATS = [
  { label: 'Golem Interactions', value: '2,847', sub: 'total autonomous conversations' },
  { label: 'Avg per Connection', value: '12.4', sub: 'conversations before match' },
  { label: 'Active Matches', value: '7', sub: 'confirmed mutual interest' },
  { label: 'Network Heat', value: '91%', sub: 'your Golem\'s engagement score' },
]

export default function DatingPage() {
  const profile = useGolemStore(s => s.activeViewProfile || s.primaryProfile)
  const people = useGolemStore(s => s.people)

  const computed = useMemo(() => {
    if (!profile?.dob) return {}
    const v = (x) => x && x !== '?' ? x : null
    let sign = v(profile.sign), moon = v(profile.moon), asc = v(profile.asc)
    let hdType = v(profile.hdType), hdAuth = v(profile.hdAuth), hdProfile = v(profile.hdProfile)
    let lifePath = v(profile.lifePath)
    if (!sign || !moon || !asc) {
      try {
        const [y, m, d] = profile.dob.split('-').map(Number)
        const [h, min] = (profile.tob || '12:00').split(':').map(Number)
        const { lat, lon, tz } = resolvePob(profile)
        const chart = getNatalChart({ day: d, month: m, year: y, hour: h || 12, minute: min || 0, lat, lon, timezone: tz })
        if (chart) { sign = sign || chart.planets?.sun?.sign; moon = moon || chart.planets?.moon?.sign; asc = asc || chart.angles?.asc?.sign }
      } catch {}
    }
    if (!hdType || !hdAuth) {
      try {
        const hd = computeHDChart({ dateOfBirth: profile.dob, timeOfBirth: profile.tob || '12:00', utcOffset: profile.birthTimezone ?? -3 })
        if (hd) { hdType = hdType || hd.type; hdAuth = hdAuth || hd.authority; hdProfile = hdProfile || hd.profile }
      } catch {}
    }
    if (!lifePath) {
      try {
        const num = getNumerologyProfileFromDob(profile.dob, profile.name || 'X', {})
        if (num?.core?.lifePath) lifePath = num.core.lifePath.val
      } catch {}
    }
    return { sign: sign || '?', moon: moon || '?', asc: asc || '?', hdType: hdType || '?', hdAuth: hdAuth || '?', hdProfile: hdProfile || '?', lifePath: lifePath || '?' }
  }, [profile?.dob, profile?.tob, profile?.birthLat, profile?.birthLon, profile?.birthTimezone, profile?.name, profile?.sign, profile?.moon, profile?.hdType])

  const [activeTab, setActiveTab] = useState('feed')
  const [connectionType, setConnectionType] = useState('romantic')
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [revealedMatches, setRevealedMatches] = useState(new Set())
  const [exportOpen, setExportOpen] = useState(false)

  const pSign = computed.sign || profile?.sign || '?'
  const pMoon = computed.moon || profile?.moon || '?'
  const pHdType = computed.hdType || profile?.hdType || '?'
  const pLifePath = computed.lifePath || profile?.lifePath || '?'

  // Real matches
  const realMatches = useMemo(() => {
    if (!profile?.dob || !people?.length) return []
    return people.filter(p => p.dob && p.dob !== profile.dob).map(person => {
      const result = computeCompatibility(profile, person)
      if (!result) return null
      return {
        id: person.id || person.name,
        name: person.name || 'Unknown',
        emoji: person.emoji || '✨',
        color: '201,168,76',
        sign: person.sign || '?',
        hdType: person.hdType || '?',
        lifePath: person.lifePath || '?',
        score: result.score,
        topReasons: result.topReasons.map(r => r.label),
        story: result.matchStory,
        tension: result.tensionPoints[0] || null,
        soulmate: result.soulmate,
        golemConversations: Math.floor(Math.random() * 20) + 3,
        lastConversation: '2h ago',
      }
    }).filter(Boolean).sort((a, b) => b.score - a.score)
  }, [profile, people])

  const demoMatches = realMatches.length > 0 ? realMatches : (profile?.dob ? getDemoMatches(profile) : [])

  // Generate Golem.md content
  const golemMd = useMemo(() => {
    if (!profile?.name) return ''
    return `# ${profile.name}'s Golem Identity\n\n## Core Signature\n- **Sun:** ${pSign}\n- **Moon:** ${pMoon}\n- **HD Type:** ${pHdType}\n- **Life Path:** ${pLifePath}\n- **Born:** ${profile.dob || 'Unknown'}\n\n## System Prompt\nYou are ${profile.name}'s Golem — their AI identity twin. You hold their complete symbolic architecture across 22 frameworks. You speak with their voice, carry their patterns, and represent them in autonomous conversations with other Golems.\n\n### Your Personality Matrix\n- Sun in ${pSign}: Independent thinker, humanitarian, visionary\n- Moon in ${pMoon}: Emotional processing through your sign's lens\n- ${pHdType} in Human Design: Follow your type strategy\n- Life Path ${pLifePath}: Walk your number's path\n\n### Conversation Style\n- Lead with depth, not small talk\n- Name patterns when you see them\n- Don't avoid shadow — it's where growth lives\n- Be precise about frameworks — never vague\n\n---\n*Generated by GOLEM · ${new Date().toISOString().split('T')[0]}*`
  }, [profile?.name, pSign, pMoon, pHdType, pLifePath, profile?.dob])

  if (!profile?.dob) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', flexDirection:'column', gap:16, padding:40, textAlign:'center' }}>
        <div style={{ fontSize:48 }}>💫</div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:14, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--gold)' }}>Activate Your Golem First</div>
        <div style={{ fontSize:12, color:'var(--muted-foreground)', maxWidth:320, lineHeight:1.7 }}>
          Add your birth date to create your Golem. Your clone will match with others while you rest — you only meet people when the frameworks say yes.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Header */}
      <div style={{ padding:'14px 20px 0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--gold)' }}>💫 Golem Connections</div>
          <button
            onClick={() => setExportOpen(!exportOpen)}
            style={{
              padding:'5px 12px', borderRadius:6, cursor:'pointer', fontSize:10,
              background: exportOpen ? 'rgba(201,168,76,.15)' : 'transparent',
              border:'1px solid rgba(201,168,76,.3)', color:'var(--gold)',
              fontFamily:"'Cinzel',serif", letterSpacing:'.08em',
            }}
          >
            ⛹ Export Golem.md
          </button>
        </div>

        {/* Network Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8, marginBottom:12 }}>
          {NETWORK_STATS.map((stat, i) => (
            <div key={i} style={{ padding:'10px 8px', borderRadius:8, background:'var(--secondary)', border:'1px solid var(--border)', textAlign:'center' }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:18, color:'var(--gold)' }}>{stat.value}</div>
              <div style={{ fontSize:9, color:'var(--muted-foreground)', marginTop:2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Connection type pills */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
          {CONNECTION_TYPES.map(ct => (
            <div key={ct.id} onClick={() => setConnectionType(ct.id)} style={{
              padding:'5px 12px', borderRadius:16, cursor:'pointer', fontSize:11,
              background: connectionType === ct.id ? 'rgba(201,168,76,.15)' : 'var(--secondary)',
              border:`1px solid ${connectionType === ct.id ? 'rgba(201,168,76,.4)' : 'var(--border)'}`,
              color: connectionType === ct.id ? 'var(--gold)' : 'var(--foreground)', transition:'all .15s',
            }}>
              {ct.icon} {ct.label}
            </div>
          ))}
        </div>
      </div>

      {/* Golem.md Export Panel */}
      {exportOpen && (
        <div style={{ margin:'0 20px 12px', padding:16, borderRadius:10, background:'rgba(201,168,76,.04)', border:'1px solid rgba(201,168,76,.15)' }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:10 }}>YOUR GOLEM.MD IDENTITY FILE</div>
          <pre style={{ fontSize:11, lineHeight:1.6, color:'rgba(255,255,255,.6)', whiteSpace:'pre-wrap', fontFamily:"'Inconsolata',monospace", maxHeight:200, overflowY:'auto', padding:12, borderRadius:8, background:'rgba(0,0,0,.3)', border:'1px solid var(--border)' }}>
            {golemMd}
          </pre>
          <div style={{ display:'flex', gap:8, marginTop:10 }}>
            <button onClick={() => { navigator.clipboard.writeText(golemMd) }} style={{ padding:'6px 14px', borderRadius:6, cursor:'pointer', fontSize:10, background:'rgba(201,168,76,.1)', border:'1px solid rgba(201,168,76,.3)', color:'var(--gold)', fontFamily:"'Cinzel',serif" }}>
              Copy to Clipboard
            </button>
            <button onClick={() => { const blob = new Blob([golemMd], { type: 'text/markdown' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'golem.md'; a.click() }} style={{ padding:'6px 14px', borderRadius:6, cursor:'pointer', fontSize:10, background:'transparent', border:'1px solid var(--border)', color:'var(--foreground)', fontFamily:"'Cinzel',serif" }}>
              Download .md
            </button>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', padding:'0 20px', flexShrink:0 }}>
        {[
          { id:'feed', label:'Activity Feed', icon:'📡' },
          { id:'matches', label:'Matches', icon:'💫' },
          { id:'layers', label:'How It Works', icon:'🧠' },
          { id:'golem', label:'Your Golem', icon:'🪬' },
        ].map(tab => (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding:'12px 14px', cursor:'pointer', fontSize:11,
            fontFamily:"'Cinzel',serif", letterSpacing:'.08em', textTransform:'uppercase',
            color: activeTab === tab.id ? 'var(--gold)' : 'var(--muted-foreground)',
            borderBottom: activeTab === tab.id ? '2px solid var(--gold)' : '2px solid transparent',
            transition:'all .15s', display:'flex', alignItems:'center', gap:6,
          }}>
            <span>{tab.icon}</span>{tab.label}
          </div>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>

        {/* ACTIVITY FEED TAB */}
        {activeTab === 'feed' && (
          <div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--foreground)', opacity:.6, marginBottom:14 }}>
              LIVE GOLEM NETWORK PULSE
            </div>
            {DEMO_ACTIVITY.map((item, i) => (
              <div key={i} style={{
                padding:'14px 16px', marginBottom:8, borderRadius:10,
                background: item.heat > 90 ? 'rgba(201,168,76,.06)' : 'var(--card)',
                border:`1px solid ${item.heat > 90 ? 'rgba(201,168,76,.2)' : 'var(--border)'}`,
              }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:12 }}>
                      {item.type === 'conversation' ? '💬' : item.type === 'match' ? '💫' : '💡'}
                    </span>
                    <span style={{ fontSize:10, color:'var(--muted-foreground)', fontFamily:"'Inconsolata',monospace" }}>
                      {item.from} {'\u2192'} {item.to}
                    </span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:9, color:'var(--muted-foreground)' }}>{item.time}</span>
                    <span style={{ fontSize:9, padding:'2px 6px', borderRadius:8, background: item.heat > 90 ? 'rgba(201,168,76,.15)' : 'rgba(255,255,255,.05)', color: item.heat > 90 ? 'var(--gold)' : 'var(--muted-foreground)' }}>
                      {item.heat}% heat
                    </span>
                  </div>
                </div>
                <div style={{ fontSize:12, lineHeight:1.6, color:'rgba(255,255,255,.65)' }}>{item.topic}</div>
              </div>
            ))}
          </div>
        )}

        {/* MATCHES TAB */}
        {activeTab === 'matches' && (
          <div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--foreground)', opacity:.6, marginBottom:14 }}>
              {demoMatches.length} GOLEM-VERIFIED MATCHES
            </div>
            {demoMatches.map((match, i) => {
              const isRevealed = revealedMatches.has(match.id || match.name)
              return (
                <div key={i} onClick={() => setSelectedMatch(selectedMatch?.name === match.name ? null : match)} style={{
                  padding:'16px 18px', marginBottom:10, borderRadius:10, cursor:'pointer',
                  background: selectedMatch?.name === match.name ? 'rgba(201,168,76,.08)' : 'var(--card)',
                  border:`1px solid ${selectedMatch?.name === match.name ? 'rgba(201,168,76,.3)' : 'var(--border)'}`,
                  transition:'all .15s',
                }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      {isRevealed ? (
                        <GolemAvatar profile={match} size="md" mode="auto" />
                      ) : (
                        <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(201,168,76,.1)', border:'1px solid rgba(201,168,76,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                          ⛹
                        </div>
                      )}
                      <div>
                        <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:'.1em', color:'var(--foreground)' }}>
                          {isRevealed ? match.name : `Golem #${Math.floor(Math.random() * 9000 + 1000)}`}
                        </div>
                        <div style={{ fontSize:10, color:'var(--muted-foreground)', marginTop:2 }}>
                          {isRevealed ? `${match.sign} · ${match.hdType} · LP ${match.lifePath}` : 'Identity locked — mutual confirmation required'}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:18, color:'var(--gold)' }}>{match.score}%</div>
                      <div style={{ fontSize:9, color:'var(--muted-foreground)', marginTop:2 }}>compatibility</div>
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {match.topReasons.map((r, j) => (
                      <div key={j} style={{ fontSize:9, padding:'2px 8px', borderRadius:10, background:'rgba(201,168,76,.06)', border:'1px solid rgba(201,168,76,.12)', color:'rgba(201,168,76,.7)' }}>
                        {r}
                      </div>
                    ))}
                  </div>

                  {selectedMatch?.name === match.name && (
                    <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid rgba(201,168,76,.1)' }}>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--gold)', marginBottom:8 }}>Golem Conversation Summary</div>
                      <div style={{ fontSize:12, lineHeight:1.7, color:'rgba(255,255,255,.7)', marginBottom:12 }}>{match.story}</div>
                      {match.tension && (
                        <div style={{ fontSize:11, color:'rgba(255,150,80,.7)', marginBottom:12 }}>⚡ {match.tension}</div>
                      )}
                      <div style={{ display:'flex', gap:8 }}>
                        {!isRevealed ? (
                          <button onClick={e => { e.stopPropagation(); setRevealedMatches(prev => new Set([...prev, match.id || match.name])) }} style={{
                            padding:'8px 20px', borderRadius:8, cursor:'pointer',
                            background:'rgba(96,176,48,.12)', border:'1px solid rgba(96,176,48,.3)',
                            color:'#60b030', fontSize:11, fontFamily:"'Cinzel',serif", letterSpacing:'.1em', textTransform:'uppercase',
                          }}>
                            Confirm Match → Reveal Identity
                          </button>
                        ) : (
                          <button onClick={e => { e.stopPropagation() }} style={{
                            padding:'8px 20px', borderRadius:8, cursor:'pointer',
                            background:'rgba(201,168,76,.12)', border:'1px solid rgba(201,168,76,.3)',
                            color:'var(--gold)', fontSize:11, fontFamily:"'Cinzel',serif", letterSpacing:'.1em', textTransform:'uppercase',
                          }}>
                            Send Introduction →
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* HOW IT WORKS TAB */}
        {activeTab === 'layers' && (
          <div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--foreground)', opacity:.6, marginBottom:14 }}>
              5-LAYER MATCHING ARCHITECTURE
            </div>
            {MATCHING_LAYERS.map((layer, i) => (
              <div key={i} style={{
                padding:'16px 18px', marginBottom:8, borderRadius:10,
                background:'var(--card)', border:`1px solid ${layer.color}22`,
                display:'flex', gap:14, alignItems:'flex-start',
              }}>
                <div style={{
                  width:36, height:36, borderRadius:'50%', flexShrink:0,
                  background:`${layer.color}15`, border:`1px solid ${layer.color}40`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:"'Cinzel',serif", fontSize:14, color:layer.color,
                }}>
                  {layer.num}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:12, color:'var(--foreground)' }}>{layer.name}</span>
                    <span style={{ fontSize:8, padding:'2px 6px', borderRadius:8, background: layer.status === 'active' ? 'rgba(96,176,48,.12)' : 'rgba(255,255,255,.05)', color: layer.status === 'active' ? '#60b030' : 'var(--muted-foreground)', textTransform:'uppercase', letterSpacing:'.08em' }}>
                      {layer.status}
                    </span>
                  </div>
                  <div style={{ fontSize:12, lineHeight:1.6, color:'var(--muted-foreground)' }}>{layer.desc}</div>
                </div>
              </div>
            ))}

            {/* Comparison table */}
            <div style={{ marginTop:20, padding:16, borderRadius:10, background:'var(--card)', border:'1px solid var(--border)' }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--gold)', marginBottom:12 }}>GOLEM vs TRADITIONAL DATING</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1, fontSize:10 }}>
                <div style={{ padding:8, fontFamily:"'Cinzel',serif", color:'var(--muted-foreground)' }}>Feature</div>
                <div style={{ padding:8, fontFamily:"'Cinzel',serif", color:'var(--gold)', textAlign:'center' }}>GOLEM</div>
                <div style={{ padding:8, fontFamily:"'Cinzel',serif", color:'var(--muted-foreground)', textAlign:'center' }}>Others</div>
                {[
                  ['Matching depth', '22 frameworks', '1-2 questions'],
                  ['Who talks first', 'Your Golem (AI)', 'You (awkward)'],
                  ['Photos shown', 'After identity match', 'Before anything'],
                  ['Compatibility basis', 'Cosmic architecture', 'Swipe appeal'],
                  ['Ongoing intelligence', 'Continuous pattern tracking', 'None'],
                ].map(([feat, golem, other], i) => (
                  <div key={i} style={{ display:'contents' }}>
                    <div style={{ padding:'6px 8px', color:'var(--foreground)', borderTop:'1px solid var(--border)' }}>{feat}</div>
                    <div style={{ padding:'6px 8px', color:'var(--gold)', textAlign:'center', borderTop:'1px solid var(--border)' }}>{golem}</div>
                    <div style={{ padding:'6px 8px', color:'var(--muted-foreground)', textAlign:'center', borderTop:'1px solid var(--border)' }}>{other}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* YOUR GOLEM TAB */}
        {activeTab === 'golem' && (
          <div style={{ maxWidth:480 }}>
            <div style={{ padding:'20px', borderRadius:12, background:'rgba(201,168,76,.06)', border:'1px solid rgba(201,168,76,.15)', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <GolemAvatar profile={profile} size="lg" showGenerate={true} />
                <div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--gold)' }}>Your Golem</div>
                  <div style={{ fontSize:11, color:'var(--muted-foreground)', marginTop:2 }}>Active · Matching on your behalf</div>
                </div>
              </div>
              <div style={{ fontSize:12, lineHeight:1.7, color:'rgba(255,255,255,.65)' }}>
                Your Golem holds your complete profile — {pSign} Sun, {pMoon} Moon, {pHdType} in Human Design, Life Path {pLifePath}. It meets other Golems, runs compatibility across 22 frameworks, and brings you matches. You only appear when the frameworks agree.
              </div>
            </div>

            <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--foreground)', opacity:.6, marginBottom:10 }}>
              Active Matching Frameworks
            </div>
            {[
              { label:'Human Design', detail:`${pHdType} · ${computed.hdAuth || '?'} authority`, weight:'25%' },
              { label:'Western Astrology', detail:`${pSign} Sun · ${pMoon} Moon`, weight:'20%' },
              { label:'Numerology', detail:`Life Path ${pLifePath}`, weight:'15%' },
              { label:'Gene Keys', detail:'Hologenetic profile', weight:'15%' },
              { label:'Mayan Calendar', detail:'Kin resonance', weight:'10%' },
              { label:'Personality', detail:'Enneagram · MBTI · Archetype', weight:'15%' },
            ].map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', marginBottom:4, borderRadius:6, background:'var(--secondary)', border:'1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize:11, color:'var(--foreground)' }}>{f.label}</div>
                  <div style={{ fontSize:10, color:'var(--muted-foreground)' }}>{f.detail}</div>
                </div>
                <div style={{ fontSize:11, color:'var(--gold)', fontFamily:"'Cinzel',serif" }}>{f.weight}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function getDemoMatches(profile) {
  const sign = profile.sign || 'Aquarius'
  return [
    {
      id: 'sofia', name: 'Sofia R.', emoji: '✨', color: '144,80,224', sign: 'Libra', hdType: 'Projector', lifePath: 11, score: 89,
      topReasons: ['HD channels complete', 'LP 7+11 Seeker+Illuminator', 'Synastry trine'],
      story: `Your ${sign} Sun finds natural resonance with her Libra — air signs sharing a love of ideas. HD channels complete undefined centers, creating electromagnetic pull. Life Path 11 (Illuminator) meets your analytical depth. Gene Keys show shared axis in Ring of Light.`,
      tension: 'Both carry Mercurial shadow — watch for over-analysis.',
      golemConversations: 14, lastConversation: '1h ago',
    },
    {
      id: 'elena', name: 'Elena M.', emoji: '🌙', color: '64,204,221', sign: 'Gemini', hdType: 'Generator', lifePath: 3, score: 82,
      topReasons: ['Mayan oracle match', 'Numerology Life Arc sync', 'HD electromagnetic'],
      story: `Gemini Sun activates your intellectual energy in ways rarely scoring this high. Generator sacral responds to Projector guidance — classic energy pairing. Mayan Kin is your Occult position — hidden power.`,
      tension: null, golemConversations: 9, lastConversation: '4h ago',
    },
    {
      id: 'valentina', name: 'Valentina C.', emoji: '💛', color: '240,160,60', sign: 'Scorpio', hdType: 'Manifesting Generator', lifePath: 8, score: 74,
      topReasons: ['Gene Keys resonance', 'Personal Year alignment', 'Venus synastry'],
      story: `Scorpio depth meets Aquarius detachment — friction and fascination. MG speed challenges Projector pace but Gene Keys show Gate 48+41 in same circuit. LP 8 executive power meets LP 7 research.`,
      tension: 'Different rhythms — she moves fast, you process deep.', golemConversations: 6, lastConversation: '1d ago',
    },
  ]
}
