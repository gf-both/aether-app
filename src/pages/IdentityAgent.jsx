import { useState, useMemo } from 'react'
import { useActiveProfile } from '../hooks/useActiveProfile'
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
          sections.raw = response
        }

        setResult(sections)
        setSection('mission')
      }
    } catch (e) {
      console.error('Identity synthesis error:', e)
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
            background: loading ? 'var(--secondary)' : 'rgba(201,168,76,.12)',
            border:`1px solid ${loading ? 'var(--border)' : 'rgba(201,168,76,.4)'}`,
            color: loading ? 'var(--muted-foreground)' : 'var(--gold)',
            fontSize:12, fontFamily:"'Cinzel',serif", letterSpacing:'.1em', textTransform:'uppercase',
            transition:'all .2s',
          }}
        >
          {loading ? 'Synthesizing across all frameworks...' : result ? 'Re-synthesize' : 'Run Identity Synthesis'}
        </button>
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
            {result.raw ? (
              <div style={{ fontSize:13, lineHeight:1.8, color:'var(--foreground)', whiteSpace:'pre-wrap' }}>
                {result.raw}
              </div>
            ) : (
              <>
                <div style={{
                  fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:'.12em',
                  textTransform:'uppercase', color:'var(--gold)', marginBottom:12,
                }}>
                  {SECTIONS.find(s => s.key === section)?.label}
                </div>
                <div style={{ fontSize:14, lineHeight:1.85, color:'rgba(255,255,255,.85)' }}>
                  {result[section] || 'Section not found in response.'}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
