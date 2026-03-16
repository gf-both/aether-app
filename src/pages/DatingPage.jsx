import { useState } from 'react'
import { useAboveInsideStore } from '../store/useAboveInsideStore'

export default function DatingPage() {
  const profile = useAboveInsideStore(s => s.activeViewProfile || s.primaryProfile)
  const [geoEnabled, setGeoEnabled] = useState(true)
  const [geoRange, setGeoRange] = useState(100)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [activeTab, setActiveTab] = useState('matches') // 'matches' | 'golem' | 'preferences'

  // Preferences state
  const [relType, setRelType] = useState([])
  const [ageRange, setAgeRange] = useState('')
  const [openToKids, setOpenToKids] = useState('')
  const [hasKids, setHasKids] = useState('')
  const [religion, setReligion] = useState([])
  const [igHandle, setIgHandle] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [prefSaved, setPrefSaved] = useState(false)

  function toggleMulti(arr, setArr, val) {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  function savePreferences() {
    // In production: persist to Supabase profile
    setPrefSaved(true)
    setTimeout(() => setPrefSaved(false), 2000)
  }

  // Demo matches — in production these would come from the compatibility engine
  const demoMatches = profile?.dob ? getDemoMatches(profile) : []

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
      {/* Tab bar */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', padding:'0 20px', flexShrink:0 }}>
        {[
          { id:'matches', label:'Matches', icon:'💫' },
          { id:'golem', label:'Your Golem', icon:'🪬' },
          { id:'preferences', label:'Preferences', icon:'⚙' },
        ].map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding:'12px 16px', cursor:'pointer', fontSize:12,
              fontFamily:"'Cinzel',serif", letterSpacing:'.08em', textTransform:'uppercase',
              color: activeTab === tab.id ? 'var(--gold)' : 'var(--muted-foreground)',
              borderBottom: activeTab === tab.id ? '2px solid var(--gold)' : '2px solid transparent',
              transition:'all .15s', display:'flex', alignItems:'center', gap:6,
            }}
          >
            <span>{tab.icon}</span>{tab.label}
          </div>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>

        {/* MATCHES TAB */}
        {activeTab === 'matches' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--foreground)', opacity:.7 }}>
                {demoMatches.length} Golem Matches Found
              </div>
              <div style={{ fontSize:10, color:'var(--muted-foreground)' }}>
                Your Golem is active · matching {geoEnabled ? `within ${geoRange}km` : 'globally'}
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {demoMatches.map((match, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedMatch(selectedMatch?.name === match.name ? null : match)}
                  style={{
                    padding:'16px 18px', borderRadius:10, cursor:'pointer',
                    background: selectedMatch?.name === match.name ? 'rgba(201,168,76,.08)' : 'var(--card)',
                    border:`1px solid ${selectedMatch?.name === match.name ? 'rgba(201,168,76,.3)' : 'var(--border)'}`,
                    transition:'all .15s',
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:`rgba(${match.color},.15)`, border:`1px solid rgba(${match.color},.3)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                        {match.emoji}
                      </div>
                      <div>
                        <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:'.1em', color:'var(--foreground)' }}>{match.name}</div>
                        <div style={{ fontSize:10, color:'var(--muted-foreground)', marginTop:2 }}>{match.sign} · {match.hdType} · LP {match.lifePath}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:18, color:'var(--gold)' }}>{match.score}%</div>
                      <div style={{ fontSize:9, color:'var(--muted-foreground)', marginTop:2 }}>compatibility</div>
                    </div>
                  </div>

                  {/* Top match reasons */}
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {match.topReasons.map((r, j) => (
                      <div key={j} style={{ fontSize:9, padding:'2px 8px', borderRadius:10, background:'rgba(201,168,76,.06)', border:'1px solid rgba(201,168,76,.12)', color:'rgba(201,168,76,.7)' }}>
                        {r}
                      </div>
                    ))}
                  </div>

                  {/* Expanded match story */}
                  {selectedMatch?.name === match.name && (
                    <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid rgba(201,168,76,.1)' }}>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--gold)', marginBottom:8 }}>Match Story</div>
                      <div style={{ fontSize:12, lineHeight:1.7, color:'rgba(255,255,255,.7)', marginBottom:12 }}>{match.story}</div>

                      {match.tension && (
                        <div style={{ fontSize:11, color:'rgba(255,150,80,.7)', marginBottom:12 }}>
                          ⚡ Tension point: {match.tension}
                        </div>
                      )}

                      <button
                        onClick={e => { e.stopPropagation(); alert(`Introduction sent to ${match.name}'s Golem. They'll be notified.`) }}
                        style={{
                          padding:'8px 20px', borderRadius:8, cursor:'pointer',
                          background:'rgba(201,168,76,.12)', border:'1px solid rgba(201,168,76,.3)',
                          color:'var(--gold)', fontSize:11, fontFamily:"'Cinzel',serif",
                          letterSpacing:'.1em', textTransform:'uppercase',
                        }}
                      >
                        Request Introduction →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GOLEM TAB */}
        {activeTab === 'golem' && (
          <div style={{ maxWidth:480 }}>
            <div style={{ padding:'20px', borderRadius:12, background:'rgba(201,168,76,.06)', border:'1px solid rgba(201,168,76,.15)', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <span style={{ fontSize:32 }}>🪬</span>
                <div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--gold)' }}>Your Golem</div>
                  <div style={{ fontSize:11, color:'var(--muted-foreground)', marginTop:2 }}>Active · Matching on your behalf</div>
                </div>
              </div>
              <div style={{ fontSize:12, lineHeight:1.7, color:'rgba(255,255,255,.65)' }}>
                Your Golem holds your complete profile — {profile.sign || '?'} Sun, {profile.moon || '?'} Moon, {profile.hdType || '?'} in Human Design, Life Path {profile.lifePath || '?'}. It meets other Golems, runs compatibility scores across 21 frameworks, and brings you the best matches. You only appear when the frameworks agree.
              </div>
            </div>

            <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--foreground)', opacity:.6, marginBottom:10 }}>
              Active Matching Frameworks
            </div>
            {[
              { label:'Human Design', detail:`${profile.hdType || '?'} · ${profile.hdAuth || '?'} authority`, weight:'25%' },
              { label:'Western Astrology', detail:`${profile.sign || '?'} Sun · ${profile.moon || '?'} Moon`, weight:'20%' },
              { label:'Numerology', detail:`Life Path ${profile.lifePath || '?'}`, weight:'15%' },
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

        {/* SETTINGS TAB */}
        {activeTab === 'preferences' && (
          <div style={{ maxWidth:480 }}>

            {/* Social handles */}
            <PrefSection title="Social Profiles">
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:10, color:'var(--muted-foreground)', marginBottom:5 }}>Instagram handle</div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:12, color:'var(--muted-foreground)' }}>@</span>
                  <input
                    value={igHandle}
                    onChange={e => setIgHandle(e.target.value)}
                    placeholder="yourhandle"
                    style={{ flex:1, padding:'8px 12px', borderRadius:7, background:'var(--secondary)', border:'1px solid var(--border)', color:'var(--foreground)', fontSize:12, outline:'none', fontFamily:'inherit' }}
                  />
                </div>
              </div>
              <div>
                <div style={{ fontSize:10, color:'var(--muted-foreground)', marginBottom:5 }}>LinkedIn URL</div>
                <input
                  value={linkedinUrl}
                  onChange={e => setLinkedinUrl(e.target.value)}
                  placeholder="linkedin.com/in/yourprofile"
                  style={{ width:'100%', boxSizing:'border-box', padding:'8px 12px', borderRadius:7, background:'var(--secondary)', border:'1px solid var(--border)', color:'var(--foreground)', fontSize:12, outline:'none', fontFamily:'inherit' }}
                />
              </div>
            </PrefSection>

            {/* Location */}
            <PrefSection title="Location">
              <div style={{ padding:'12px 14px', borderRadius:8, background:'var(--secondary)', border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: geoEnabled ? 12 : 0 }}>
                  <div>
                    <div style={{ fontSize:12, color:'var(--foreground)' }}>Distance filter</div>
                    <div style={{ fontSize:10, color:'var(--muted-foreground)', marginTop:2 }}>{geoEnabled ? `Within ${geoRange}km` : 'Matching globally'}</div>
                  </div>
                  <div onClick={() => setGeoEnabled(!geoEnabled)} style={{ width:40, height:22, borderRadius:11, cursor:'pointer', background: geoEnabled ? 'rgba(201,168,76,.4)' : 'var(--border)', position:'relative', transition:'all .2s' }}>
                    <div style={{ position:'absolute', top:2, left: geoEnabled ? 20 : 2, width:16, height:16, borderRadius:'50%', background:'var(--foreground)', transition:'left .2s' }} />
                  </div>
                </div>
                {geoEnabled && (
                  <div>
                    <input type="range" min={10} max={500} value={geoRange} onChange={e => setGeoRange(Number(e.target.value))} style={{ width:'100%', accentColor:'var(--gold)' }} />
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'var(--muted-foreground)' }}>
                      <span>10km</span><span style={{ color:'var(--gold)' }}>{geoRange}km</span><span>500km</span>
                    </div>
                  </div>
                )}
              </div>
            </PrefSection>

            {/* Relationship type — multi-select, stateful */}
            <PrefSection title="Looking For">
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {['Serious', 'Casual', 'Friendship', 'Open relationship', 'Still figuring out'].map(opt => (
                  <PrefChip key={opt} label={opt} active={relType.includes(opt)} onClick={() => toggleMulti(relType, setRelType, opt)} />
                ))}
              </div>
            </PrefSection>

            {/* Age range — single select */}
            <PrefSection title="Age Range">
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {['18–24', '25–34', '35–44', '45–54', '55+', 'Open'].map(opt => (
                  <PrefChip key={opt} label={opt} active={ageRange === opt} onClick={() => setAgeRange(ageRange === opt ? '' : opt)} />
                ))}
              </div>
            </PrefSection>

            {/* Kids */}
            <PrefSection title="Children">
              <div style={{ marginBottom:8 }}>
                <div style={{ fontSize:10, color:'var(--muted-foreground)', marginBottom:5 }}>I have kids</div>
                <div style={{ display:'flex', gap:6 }}>
                  {['Yes', 'No', 'Prefer not to say'].map(opt => (
                    <PrefChip key={opt} label={opt} active={hasKids === opt} onClick={() => setHasKids(hasKids === opt ? '' : opt)} />
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize:10, color:'var(--muted-foreground)', marginBottom:5 }}>Open to partner with kids</div>
                <div style={{ display:'flex', gap:6 }}>
                  {['Yes', 'No', 'Depends'].map(opt => (
                    <PrefChip key={opt} label={opt} active={openToKids === opt} onClick={() => setOpenToKids(openToKids === opt ? '' : opt)} />
                  ))}
                </div>
              </div>
            </PrefSection>

            {/* Spiritual / religious */}
            <PrefSection title="Spiritual Inclination">
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {['Spiritual (non-religious)', 'Religious', 'Agnostic', 'Atheist', 'Open to all'].map(opt => (
                  <PrefChip key={opt} label={opt} active={religion.includes(opt)} onClick={() => toggleMulti(religion, setReligion, opt)} />
                ))}
              </div>
            </PrefSection>

            {/* Save */}
            <button
              onClick={savePreferences}
              style={{
                marginTop:20, width:'100%', padding:'11px', borderRadius:8, cursor:'pointer',
                background: prefSaved ? 'rgba(96,176,48,.15)' : 'rgba(201,168,76,.1)',
                border:`1px solid ${prefSaved ? 'rgba(96,176,48,.4)' : 'rgba(201,168,76,.3)'}`,
                color: prefSaved ? 'rgba(96,176,48,.9)' : 'var(--gold)',
                fontSize:11, fontFamily:"'Cinzel',serif", letterSpacing:'.1em', textTransform:'uppercase', transition:'all .2s',
              }}
            >
              {prefSaved ? '✓ Preferences Saved' : 'Save Preferences'}
            </button>
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
      name: 'Sofia R.',
      emoji: '✨',
      color: '144,80,224',
      sign: 'Libra',
      hdType: 'Projector',
      lifePath: 11,
      score: 89,
      topReasons: ['HD channels complete', 'LP 7+11 Seeker+Illuminator', 'Synastry trine'],
      story: `Your ${sign} Sun finds natural resonance with Sofia's Libra — air signs that share a love of ideas and connection. Your HD channels complete each other's undefined centers, creating an electromagnetic pull that the compatibility engine flagged immediately. Her Life Path 11 (Illuminator) meets your analytical depth in exactly the way the Seeker-Illuminator pairing predicts: you go deep, she channels. The Gene Keys show a shared axis in the Ring of Light.`,
      tension: 'Both profiles have Mercurial shadow — watch for over-analysis before acting.',
    },
    {
      name: 'Elena M.',
      emoji: '🌙',
      color: '64,204,221',
      sign: 'Gemini',
      hdType: 'Generator',
      lifePath: 3,
      score: 82,
      topReasons: ['Mayan oracle match', 'Numerology Life Arc sync', 'HD electromagnetic'],
      story: `Elena's Gemini Sun activates your Aquarius intellectual energy in a way that rarely shows up in compatibility scores this high. Her Generator sacral responds to your Projector guidance — the classic pairing where her energy runs your vision. The Mayan compatibility is remarkable: her Kin is your Occult (hidden power) position, meaning she represents the aspect of yourself you rarely access consciously.`,
      tension: null,
    },
    {
      name: 'Valentina C.',
      emoji: '💛',
      color: '240,160,60',
      sign: 'Scorpio',
      hdType: 'Manifesting Generator',
      lifePath: 8,
      score: 74,
      topReasons: ['Gene Keys resonance', 'Personal Year alignment', 'Venus synastry'],
      story: `A more complex match — Scorpio's depth meets Aquarius's detachment, which creates friction and fascination simultaneously. Her MG speed challenges your Projector pace, but the Gene Keys show profound complementarity: her Gate 48 (Depth) and your Gate 41 (Anticipation) are in the same circuit. Her LP 8 executive power is what your LP 7 research orientation needs when it's time to act.`,
      tension: 'Different rhythms — she moves fast, you process deep. Requires explicit communication.',
    },
  ]
}
