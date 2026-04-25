import { useState, useMemo } from 'react'
import { useComputedProfile as useActiveProfile } from '../hooks/useActiveProfile'
import { getNumerologyProfileFromDob } from '../engines/numerologyEngine'
import { getMayanProfile } from '../engines/mayanEngine'
import { getChineseProfileFromDob } from '../engines/chineseEngine'
import { computeHDChart } from '../engines/hdEngine'
import { computeGeneKeysData } from '../data/geneKeysData'
import { callAI } from '../lib/ai'

export default function IdentityAgent() {
  const profile = useActiveProfile()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [section, setSection] = useState('mission')
  const [aiError, setAiError] = useState(null)

  // Compute all engine outputs
  const engineData = useMemo(() => {
    if (!profile?.dob) return null
    try {
      const [y, m, d] = profile.dob.split('-').map(Number)
      const [h, min] = (profile.tob || '12:00').split(':').map(Number)
      const tz = profile.birthTimezone ?? -3

      const hd = (profile.hdType && profile.hdType !== '?')
        ? null
        : computeHDChart({ dateOfBirth: profile.dob, timeOfBirth: profile.tob || '12:00', utcOffset: tz })

      const num = getNumerologyProfileFromDob(profile.dob, (profile.name || 'Unknown').toUpperCase(), {})
      const mayan = getMayanProfile(d, m, y)
      const chinese = getChineseProfileFromDob(profile.dob, { hour: h || 12, minute: min || 0 })
      const gk = computeGeneKeysData({ day: d, month: m, year: y, hour: h || 12, minute: min || 0, timezone: tz })

      return { hd, num, mayan, chinese, gk }
    } catch { return null }
  }, [profile?.dob, profile?.tob, profile?.birthTimezone])

  function buildSynthesisPrompt() {
    const hdType = (profile.hdType && profile.hdType !== '?') ? profile.hdType : engineData?.hd?.type || 'unknown'
    const hdProfile = (profile.hdProfile && profile.hdProfile !== '?') ? profile.hdProfile : engineData?.hd?.profile || 'unknown'
    const hdAuth = (profile.hdAuth && profile.hdAuth !== '?') ? profile.hdAuth : engineData?.hd?.authority || 'unknown'
    const lp = engineData?.num?.core?.lifePath?.val || profile.lifePath || 'unknown'
    const expr = engineData?.num?.core?.expression?.val || profile.expression || 'unknown'
    const mayan = engineData?.mayan?.tzolkin || engineData?.mayan
    const gk = engineData?.gk?.SPHERES?.find(s => !s.center)

    return `You are a master identity synthesist. Your task is to integrate multiple symbolic systems into ONE coherent identity narrative for this person.

DO NOT give separate framework readings. Create a unified synthesis.

## PERSON'S PROFILE
Name: ${profile.name || 'Unknown'}
Born: ${profile.dob}${profile.tob ? ` at ${profile.tob}` : ''} in ${profile.pob || 'unknown location'}

## SYMBOLIC DATA
**Western Astrology:**
- Sun: ${profile.sign || 'unknown'}
- Moon: ${profile.moon || 'unknown'}
- Rising: ${profile.asc || 'unknown'}

**Human Design:**
- Type: ${hdType}
- Profile: ${hdProfile}
- Authority: ${hdAuth}
- Strategy: ${engineData?.hd?.strategy || 'unknown'}

**Numerology:**
- Life Path: ${lp} — ${engineData?.num?.core?.lifePath?.title || ''}
- Expression: ${expr}
- Soul Urge: ${engineData?.num?.core?.soulUrge?.val || 'unknown'}

**Gene Keys:**
- Life's Work: Gate ${gk?.key || 'unknown'} — ${gk?.gift || 'unknown'} (shadow: ${gk?.shadow || 'unknown'})

**Mayan:**
- ${mayan?.daySign || mayan?.day_sign || 'unknown'} Tone ${mayan?.tone || 'unknown'} — ${mayan?.toneName || mayan?.tone_name || ''}

**Chinese:**
- ${engineData?.chinese?.element || 'unknown'} ${engineData?.chinese?.animal || 'unknown'}

## YOUR OUTPUT
Write a synthesis in exactly these 6 sections. Each should be 2-4 sentences. Write directly to the person ("you", "your"). Be specific to THEIR actual data — no generic astrology.

1. **LIFE MISSION** — What are you here to do in this lifetime? What does your profile consistently point toward?

2. **SHADOW PATTERNS** — What unconscious patterns hold you back? What themes repeat across your frameworks?

3. **RELATIONSHIP STYLE** — How do you love and connect? What do you need from relationships? What do you trigger in others?

4. **CAREER ALIGNMENT** — What work environments allow you to thrive? What kinds of problems are you built to solve?

5. **ENERGY ARCHITECTURE** — How do you actually operate? When are you in flow vs. depletion? What does your HD strategy mean practically?

6. **THE THROUGH-LINE** — What single thread connects all these systems? What is the essence of who you are?`
  }

  async function runSynthesis() {
    if (!profile?.dob || !profile?.name) return
    setLoading(true)
    setResult(null)
    setAiError(null)

    try {
      const prompt = buildSynthesisPrompt()
      const response = await callAI({
        systemPrompt: 'You are a master synthesist of symbolic identity systems. Integrate astrology, Human Design, Gene Keys, numerology, and other frameworks into coherent, specific, actionable identity insights.',
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 1200,
      })

      if (response) {
        const sections = {}
        const sectionNames = ['LIFE MISSION', 'SHADOW PATTERNS', 'RELATIONSHIP STYLE', 'CAREER ALIGNMENT', 'ENERGY ARCHITECTURE', 'THE THROUGH-LINE']
        const keys = ['mission', 'shadow', 'relationship', 'career', 'energy', 'throughline']

        sectionNames.forEach((name, i) => {
          const regex = new RegExp(`\\*\\*${name}\\*\\*[^\\n]*\\n([\\s\\S]*?)(?=\\n\\d+\\.\\s+\\*\\*[A-Z]|\\*\\*[A-Z][A-Z]|$)`, 'i')
          const match = response.match(regex)
          if (match) sections[keys[i]] = match[1].trim()
        })

        if (Object.keys(sections).length < 3) {
          // AI returned content but regex parsing failed — try a simpler split
          const lines = response.split('\n')
          let currentKey = null
          for (const line of lines) {
            const headerMatch = line.match(/\*\*([A-Z\s']+)\*\*/i)
            if (headerMatch) {
              const found = headerMatch[1].trim().toUpperCase()
              const idx = sectionNames.findIndex(n => found.includes(n.replace(/'/g, '')) || n.replace(/'/g, '').includes(found))
              if (idx >= 0) { currentKey = keys[idx]; sections[currentKey] = '' }
            } else if (currentKey && line.trim()) {
              sections[currentKey] = (sections[currentKey] ? sections[currentKey] + ' ' : '') + line.trim()
            }
          }
          // If still not enough, put full response in mission
          if (Object.keys(sections).length < 2) {
            sections.mission = response
            sections.shadow = ''
            sections.relationship = ''
            sections.career = ''
            sections.energy = ''
            sections.throughline = ''
          }
        }

        setResult(sections)
        setSection('mission')
      } else {
        // Generate local synthesis from engine data when AI is unavailable
        const hdType = (profile.hdType && profile.hdType !== '?') ? profile.hdType : engineData?.hd?.type || 'unknown'
        const hdAuth = (profile.hdAuth && profile.hdAuth !== '?') ? profile.hdAuth : engineData?.hd?.authority || 'unknown'
        const hdStrat = engineData?.hd?.strategy || 'unknown'
        const lp = engineData?.num?.core?.lifePath?.val || profile.lifePath || '?'
        const lpTitle = engineData?.num?.core?.lifePath?.title || ''
        const expr = engineData?.num?.core?.expression?.val || '?'
        const soul = engineData?.num?.core?.soulUrge?.val || '?'
        const gk = engineData?.gk?.SPHERES?.find(s => !s.center)
        const mayan = engineData?.mayan?.tzolkin || engineData?.mayan
        const chinese = engineData?.chinese
        const sign = profile.sign || '?'
        const moon = profile.moon || '?'
        const asc = profile.asc || '?'
        const enn = profile.enneagramType
        const mbti = profile.mbtiType

        const localSections = {
          mission: `Your ${sign} Sun provides the conscious direction — ${sign === 'Aquarius' ? 'innovation, systems thinking, and humanitarian vision' : sign === 'Aries' ? 'pioneering action and courageous initiation' : sign === 'Taurus' ? 'building lasting value and embodied presence' : sign === 'Gemini' ? 'connecting ideas and bridging different worlds' : sign === 'Cancer' ? 'emotional intelligence and nurturing leadership' : sign === 'Leo' ? 'creative self-expression and generous leadership' : sign === 'Virgo' ? 'service, precision, and systems optimization' : sign === 'Libra' ? 'relational harmony and aesthetic intelligence' : sign === 'Scorpio' ? 'transformative depth and regenerative power' : sign === 'Sagittarius' ? 'expansive vision and truth-seeking' : sign === 'Capricorn' ? 'structural mastery and long-term institution building' : sign === 'Pisces' ? 'spiritual synthesis and compassionate vision' : 'your unique path'}. Life Path ${lp} (${lpTitle}) ${lp == 1 ? 'reinforces this with a mandate for independence and pioneering' : lp == 7 ? 'deepens this into a quest for fundamental understanding' : lp == 4 ? 'grounds this in practical, lasting structure' : lp == 9 ? 'expands this toward humanitarian scope' : `adds the dimension of ${lpTitle.toLowerCase() || 'its unique energy'}`}. ${hdType !== 'unknown' ? `As a ${hdType}, your strategy is to ${hdStrat} — this is HOW you fulfill the mission, not what the mission is.` : ''} ${gk ? `Gene Key ${gk.key} positions your life's work at the journey from ${gk.shadow} (shadow) through ${gk.gift} (gift) to ${gk.siddhi} (highest potential).` : ''}`,

          shadow: `${moon !== '?' ? `Your ${moon} Moon reveals your emotional undercurrent — the patterns that run beneath conscious choice.` : ''} ${enn ? `As Enneagram type ${enn}, your core fear drives unconscious behavior: ${enn == 1 ? 'the fear of being wrong or corrupt creates a relentless inner critic' : enn == 2 ? 'the fear of being unloved drives people-pleasing that can obscure your real needs' : enn == 3 ? 'the fear of worthlessness fuels achievement addiction that can disconnect you from your actual self' : enn == 4 ? 'the fear of having no identity creates emotional intensity that can become self-referential' : enn == 5 ? 'the fear of incompetence drives withdrawal and over-preparation at the expense of engagement' : enn == 6 ? 'the fear of being unsupported creates hypervigilance that can become self-fulfilling' : enn == 7 ? 'the fear of being trapped in pain drives constant reframing that can bypass genuine grief' : enn == 8 ? 'the fear of vulnerability creates armor so thick that tenderness feels threatening' : 'the fear of conflict creates merging that can dissolve your own boundaries'}.` : ''} ${gk ? `The shadow of Gate ${gk.key} (${gk.shadow}) is the specific pattern to watch — this is where your gift inverts under pressure.` : ''} ${hdAuth !== 'unknown' ? `Your ${hdAuth} authority means you make your best decisions through ${hdAuth === 'Emotional' || hdAuth === 'Solar Plexus' ? 'waiting for emotional clarity — never in the heat of the moment' : hdAuth === 'Sacral' ? 'gut responses — your body knows before your mind does' : hdAuth === 'Splenic' ? 'instinctive knowing — trust the first hit, not the second-guessing' : 'your specific inner authority'}.` : ''}`,

          relationship: `${sign !== '?' && moon !== '?' ? `Your ${sign} Sun seeks ${sign === 'Aries' || sign === 'Sagittarius' || sign === 'Leo' ? 'freedom, adventure, and someone who matches your fire' : sign === 'Taurus' || sign === 'Virgo' || sign === 'Capricorn' ? 'stability, loyalty, and someone who shows up consistently' : sign === 'Gemini' || sign === 'Libra' || sign === 'Aquarius' ? 'intellectual stimulation, space for ideas, and genuine equality' : 'emotional depth, soul-level connection, and someone who can hold complexity'} in partnership, while your ${moon} Moon needs ${moon === 'Aries' || moon === 'Sagittarius' || moon === 'Leo' ? 'emotional independence and passionate engagement' : moon === 'Taurus' || moon === 'Virgo' || moon === 'Capricorn' ? 'emotional security and tangible expressions of care' : moon === 'Gemini' || moon === 'Libra' || moon === 'Aquarius' ? 'emotional space and mental connection' : 'emotional merging and intuitive understanding'}.` : ''} ${hdType !== 'unknown' ? `As a ${hdType} in relationships, ${hdType === 'Projector' ? 'you need to be seen and recognized before you can truly open — unsolicited advice will be your greatest relational challenge' : hdType === 'Generator' ? 'you operate on response — you can\'t force attraction or commitment, only respond to what genuinely lights you up' : hdType === 'Manifestor' ? 'you need to inform your partner before you act — disappearing into creation without communication creates the disconnection you fear' : hdType === 'Manifesting Generator' ? 'you need partners who can handle your pace and pivots without reading them as instability' : 'you mirror your partner\'s energy, making it essential that you choose relationships that reflect who you want to become'}.` : ''} ${mbti ? `Your ${mbti} type ${mbti[0] === 'I' ? 'needs solitude to recharge — partners who take this personally will always feel rejected' : 'processes through dialogue — partners who withdraw during conflict will leave you unmoored'}.` : ''}`,

          career: `${lp !== '?' ? `Life Path ${lp} is drawn to ${lp == 1 ? 'entrepreneurship, leadership, and pioneering new fields' : lp == 2 ? 'mediation, counseling, and behind-the-scenes orchestration' : lp == 3 ? 'creative expression, communication, and bringing ideas to life' : lp == 4 ? 'systems building, engineering, and creating lasting infrastructure' : lp == 5 ? 'innovation, travel, and fields that reward adaptability' : lp == 6 ? 'service, teaching, healing, and community building' : lp == 7 ? 'research, analysis, spiritual teaching, and deep specialization' : lp == 8 ? 'business, finance, executive leadership, and large-scale organization' : 'humanitarian work, art, and enterprises that serve something larger than profit'}.` : ''} ${hdType !== 'unknown' ? `Your ${hdType} design means you thrive in environments where ${hdType === 'Projector' ? 'your ability to see and guide others is recognized — avoid roles where you\'re expected to sustain energy you don\'t have' : hdType === 'Generator' ? 'you can respond to satisfying work — the key metric is: does this light up your sacral response?' : hdType === 'Manifestor' ? 'you can initiate independently — bureaucratic environments will drain you faster than the work itself' : hdType === 'Manifesting Generator' ? 'you can pivot quickly between interests — multi-passionate careers aren\'t unfocused, they\'re your design' : 'you can observe and reflect the health of the organization — your role is barometric, not productive in the conventional sense'}.` : ''} ${expr !== '?' ? `Expression number ${expr} adds the specific flavor of how your talents want to manifest in the world.` : ''}`,

          energy: `${hdType !== 'unknown' ? `As a ${hdType}, your fundamental energy strategy is: ${hdStrat}. This isn't a suggestion — it's your operating manual. ${hdType === 'Generator' || hdType === 'Manifesting Generator' ? 'You have sustainable sacral energy BUT only for work that genuinely lights you up. Forcing yourself through work that doesn\'t resonate will create frustration, the not-self theme of your type.' : hdType === 'Projector' ? 'You do NOT have sustainable workforce energy. Working 8-hour days like a Generator will burn you out. Your energy comes in focused bursts of recognition and guidance — honor the rest periods between.' : hdType === 'Manifestor' ? 'You have initiating energy — powerful bursts followed by necessary rest. You\'re not designed for consistent output. You\'re designed for impact.' : 'You need a full lunar cycle (28 days) before making major decisions. Your energy is a mirror of your environment — choose your environments with extreme care.'}` : ''} ${soul !== '?' ? `Soul Urge ${soul} reveals what privately motivates you — this is the inner engine running beneath the public expression.` : ''} ${chinese ? `Your ${chinese.element || ''} ${chinese.animal || ''} in Chinese astrology adds the long-cycle energy pattern — this is the decade-scale rhythm beneath the daily fluctuations.` : ''}`,

          throughline: `${profile.name ? `${profile.name}, across` : 'Across'} all ${sign !== '?' ? '22' : 'your'} frameworks, the thread is: ${gk ? `the journey from ${gk.shadow} to ${gk.gift} to ${gk.siddhi} (Gene Key ${gk.key})` : 'transformation through integration'} ${hdType !== 'unknown' ? `, lived through the ${hdType} strategy of ${hdStrat.replace('wait for ', 'waiting for ').replace('respond to', 'responding to').replace('inform then', 'informing then')}` : ''} ${lp !== '?' ? `, on Life Path ${lp} (${lpTitle})` : ''}. ${enn ? `Your Enneagram ${enn} provides the psychological container — the specific way you both express and distort this core pattern.` : ''} ${mayan ? `Your Mayan sign (${mayan.daySign || mayan.day_sign || 'your kin'}) places this in cosmic time — you're not just a personality, you're a function in a larger pattern.` : ''} The invitation is not to optimize each system separately, but to recognize the single intelligence expressing itself through all of them simultaneously.`,
        }

        setResult(localSections)
        setSection('mission')
      }
    } catch (e) {
      console.error('Identity synthesis error:', e)
      setAiError(e?.message || 'Synthesis failed. Check your AI configuration.')
    }
    setLoading(false)
  }

  if (!profile?.dob || !profile?.name) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:20, padding:40, textAlign:'center' }}>
        <div style={{ fontSize:48 }}>🜁</div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:14, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--gold)' }}>Identity Synthesis</div>
        <div style={{ fontSize:12, color:'var(--muted-foreground)', maxWidth:360, lineHeight:1.8 }}>
          Add your name and birth date to activate your Identity Synthesis. This agent reads all 21 frameworks simultaneously to produce one coherent identity map.
        </div>
      </div>
    )
  }

  const SECTIONS = [
    { key: 'mission',      label: 'Life Mission',         icon: '🌟', color: 'rgba(201,168,76,' },
    { key: 'shadow',       label: 'Shadow Patterns',      icon: '🌑', color: 'rgba(144,80,224,' },
    { key: 'relationship', label: 'Relationship Style',   icon: '💗', color: 'rgba(212,48,112,' },
    { key: 'career',       label: 'Career Alignment',     icon: '🧭', color: 'rgba(64,204,221,' },
    { key: 'energy',       label: 'Energy Architecture',  icon: '⚡', color: 'rgba(96,176,48,' },
    { key: 'throughline',  label: 'The Through-Line',     icon: '∞',  color: 'rgba(240,160,60,' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding:'20px 24px', overflowY:'auto' }}>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:4 }}>
          Identity Synthesis
        </div>
        <div style={{ fontSize:12, color:'var(--muted-foreground)', marginBottom:16 }}>
          Who are you, really? All 21 frameworks synthesized into one coherent map.
        </div>
        <button
          onClick={runSynthesis}
          disabled={loading}
          style={{
            padding:'12px 28px', borderRadius:8, cursor: loading ? 'wait' : 'pointer',
            background: loading ? 'var(--secondary)' : 'linear-gradient(135deg, rgba(201,168,76,.3), rgba(180,140,50,.2))',
            border:`1px solid ${loading ? 'var(--border)' : 'rgba(201,168,76,.7)'}`,
            color: loading ? 'var(--muted-foreground)' : '#fff',
            fontSize:12, fontFamily:"'Cinzel',serif", fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase',
            transition:'all .2s',
            boxShadow: !loading ? '0 0 12px rgba(201,168,76,.2)' : 'none',
          }}
        >
          {loading ? 'Synthesizing across all frameworks...' : result ? 'Re-synthesize' : 'Run Identity Synthesis'}
        </button>
        {aiError && (
          <div style={{ marginTop:12, padding:'10px 14px', borderRadius:7, background:'rgba(212,48,112,.08)', border:'1px solid rgba(212,48,112,.25)', color:'rgba(240,96,160,.85)', fontSize:11, lineHeight:1.6, maxWidth:480 }}>
            {aiError}
          </div>
        )}
      </div>

      {result && (
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
            background:'rgba(201,168,76,.04)', border:'1px solid rgba(201,168,76,.12)', minHeight:200,
          }}>
            <div style={{
              fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:'.12em',
              textTransform:'uppercase', color:'var(--gold)', marginBottom:12,
            }}>
              {SECTIONS.find(s => s.key === section)?.label}
            </div>
            <div style={{ fontSize:14, lineHeight:1.85, color:'rgba(255,255,255,.85)', whiteSpace:'pre-wrap' }}>
              {result[section] || 'This section is being processed. Try re-running the synthesis.'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
