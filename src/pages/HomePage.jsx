import { useState, useEffect, useRef } from 'react'

// --- Utility: Intersection Observer for scroll reveal ---
function useScrollReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true) }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

function RevealSection({ children, delay = 0, style = {} }) {
  const [ref, visible] = useScrollReveal()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      transition: `all 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  )
}

// --- Counter animation ---
function AnimCounter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0)
  const [ref, visible] = useScrollReveal()
  useEffect(() => {
    if (!visible) return
    let start = 0
    const step = end / (duration / 16)
    const interval = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(interval) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(interval)
  }, [visible, end, duration])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

const FRAMEWORKS = [
  { name: 'Western Astrology', icon: '☉', color: '#f0c040' },
  { name: 'Human Design', icon: '◈', color: '#40ccdd' },
  { name: 'Gene Keys', icon: '⬡', color: '#c44d7a' },
  { name: 'Kabbalah', icon: '✡', color: '#aa66ff' },
  { name: 'Numerology', icon: '#', color: '#e09040' },
  { name: 'Mayan Calendar', icon: '🔺', color: '#cc3333' },
  { name: 'Enneagram', icon: '⊙', color: '#64ccdd' },
  { name: 'MBTI', icon: '🧠', color: '#88cc55' },
  { name: 'Ayurvedic Dosha', icon: '☬', color: '#60b030' },
  { name: 'Chinese Astrology', icon: '🐉', color: '#cfd8dc' },
  { name: 'Egyptian Calendar', icon: '🏛', color: '#e8c040' },
  { name: 'Tibetan Astrology', icon: '☸', color: '#e8a040' },
  { name: 'Vedic / Jyotish', icon: '🪷', color: '#a060e0' },
  { name: 'Love Languages', icon: '💗', color: '#c44d7a' },
  { name: 'Jungian Archetypes', icon: '🎭', color: '#7030b0' },
  { name: 'Career Alignment', icon: '◆', color: '#88aacc' },
  { name: 'Pattern Recognition', icon: '🕸', color: '#e09040' },
  { name: 'Gematria', icon: '🔠', color: '#99ccee' },
  { name: 'Sabian Symbols', icon: '✦', color: '#ddaa88' },
  { name: 'Arabic Parts', icon: '★', color: '#aabb88' },
  { name: 'Fixed Stars', icon: '✶', color: '#88ddcc' },
  { name: 'Cycle · Moon', icon: '☽', color: '#c44d7a' },
]

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div style={{ width: '100%', minHeight: '100vh', overflowY: 'auto', overflowX: 'hidden', position: 'relative', zIndex: 1 }}>

      {/* ═══════════════ HERO ═══════════════ */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', position: 'relative' }}>
        {/* Gradient overlay for readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(5,3,15,0.3) 0%, rgba(5,3,15,0.8) 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <RevealSection>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(10px, 2vw, 13px)', letterSpacing: '0.6em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)', marginBottom: 24 }}>
              22 FRAMEWORKS · ONE INTELLIGENCE
            </div>
          </RevealSection>

          <RevealSection delay={0.2}>
            <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(40px, 10vw, 90px)', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(201,168,76,0.9)', margin: '0 0 16px', textShadow: '0 0 60px rgba(201,168,76,0.2), 0 0 120px rgba(201,168,76,0.05)', lineHeight: 1.1 }}>
              GOLEM
            </h1>
          </RevealSection>

          <RevealSection delay={0.4}>
            <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 'clamp(16px, 3vw, 24px)', color: 'rgba(255,255,255,0.55)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6, fontStyle: 'italic' }}>
              Computation is the foundation. Synthesis is the product. Any app can show you your sun sign. GOLEM computes your complete cosmic signature across 22 systems and names the patterns that emerge.
            </p>
          </RevealSection>

          <RevealSection delay={0.6}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginBottom: 48, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(28px, 5vw, 48px)', color: '#c9a84c' }}><AnimCounter end={22} /></div>
                <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.4)' }}>Frameworks</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(28px, 5vw, 48px)', color: '#c9a84c' }}><AnimCounter end={5476} /></div>
                <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.4)' }}>Lines of Core IP</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(28px, 5vw, 48px)', color: '#c9a84c' }}><AnimCounter end={96} suffix="%" /></div>
                <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.4)' }}>Gross Margin</div>
              </div>
            </div>
          </RevealSection>

          <RevealSection delay={0.8}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.3)', cursor: 'pointer', animation: 'pulse 2s ease-in-out infinite' }}>
              SCROLL TO EXPLORE ↓
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════ FRAMEWORKS GRID ═══════════════ */}
      <section style={{ padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <RevealSection>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(24px, 5vw, 42px)', color: 'var(--foreground)', letterSpacing: '.15em', marginBottom: 12 }}>
              22 COMPUTATION ENGINES
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
              Not interpretations. Computations. Each engine takes your birth data and produces a mathematically precise symbolic map.
            </p>
          </div>
        </RevealSection>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {FRAMEWORKS.map((fw, i) => (
            <RevealSection key={fw.name} delay={i * 0.04}>
              <div style={{
                padding: '16px 12px', borderRadius: 10, textAlign: 'center',
                background: 'rgba(255,255,255,0.02)', border: `1px solid ${fw.color}22`,
                backdropFilter: 'blur(8px)', transition: 'all 0.3s',
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${fw.color}15`; e.currentTarget.style.borderColor = `${fw.color}44`; e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = `${fw.color}22`; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{fw.icon}</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '.1em', color: fw.color }}>{fw.name}</div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <RevealSection>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(24px, 5vw, 42px)', color: 'var(--foreground)', letterSpacing: '.15em', marginBottom: 12 }}>
              HOW GOLEM WORKS
            </div>
          </div>
        </RevealSection>

        {[
          { num: '01', title: 'COMPUTE', desc: 'Enter your birth date, time, and place. 22 engines run simultaneously — natal chart, Human Design body graph, Gene Keys hologenetic profile, Mayan Kin, numerology core, and 17 more. Pure mathematics. No guessing.', color: '#c9a84c' },
          { num: '02', title: 'SYNTHESIZE', desc: 'AI reads every framework together. Not separately — together. The Gene Keys shadow that echoes your Enneagram wound. The HD gate that mirrors your Kabbalah path. The patterns no single system can see alone.', color: '#40ccdd' },
          { num: '03', title: 'EVOLVE', desc: 'Your Golem grows as you do. Transits shift. Personal years turn. Moon phases correlate with your cycle. GOLEM tracks the living architecture of your becoming — not a static snapshot, but a dynamic map.', color: '#c44d7a' },
        ].map((step, i) => (
          <RevealSection key={step.num} delay={i * 0.15}>
            <div style={{ display: 'flex', gap: 24, marginBottom: 48, alignItems: 'flex-start' }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 48, color: step.color, opacity: 0.3, flexShrink: 0, lineHeight: 1 }}>{step.num}</div>
              <div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 16, letterSpacing: '.2em', color: step.color, marginBottom: 8 }}>{step.title}</div>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: 0 }}>{step.desc}</p>
              </div>
            </div>
          </RevealSection>
        ))}
      </section>

      {/* ═══════════════ AI SYNTHESIS ═══════════════ */}
      <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <RevealSection>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(20px, 4vw, 32px)', color: 'var(--foreground)', letterSpacing: '.12em', marginBottom: 16 }}>
                AI THAT READS ALL 22 SYSTEMS AT ONCE
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
                Other apps interpret one system at a time. GOLEM feeds your complete symbolic architecture to Claude — every gate, every number, every archetype — in a single synthesis call. The AI names patterns that emerge only when frameworks intersect, contradict, and deepen each other.
              </p>
              <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Shadow naming', 'Cross-framework patterns', 'Timing intelligence', 'Relationship synthesis'].map(tag => (
                  <span key={tag} style={{ padding: '4px 12px', borderRadius: 12, fontSize: 10, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(201,168,76,0.7)' }}>{tag}</span>
                ))}
              </div>
            </div>
            <div style={{ padding: 20, borderRadius: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(201,168,76,0.12)', fontFamily: "'Inconsolata',monospace", fontSize: 11, lineHeight: 1.8, color: 'rgba(255,255,255,0.5)' }}>
              <span style={{ color: '#c9a84c' }}>golem.synthesize</span>({'{'}<br/>
              &nbsp;&nbsp;natal: <span style={{ color: '#40ccdd' }}>"Aquarius Sun, Cancer Moon"</span>,<br/>
              &nbsp;&nbsp;hd: <span style={{ color: '#40ccdd' }}>"2/4 Projector, Splenic"</span>,<br/>
              &nbsp;&nbsp;geneKeys: <span style={{ color: '#40ccdd' }}>"Gate 41.4 → Anticipation"</span>,<br/>
              &nbsp;&nbsp;numerology: <span style={{ color: '#40ccdd' }}>"LP 7 · Exp 1 · SU 3"</span>,<br/>
              &nbsp;&nbsp;mayan: <span style={{ color: '#40ccdd' }}>"Kin 111 Blue Resonant Monkey"</span>,<br/>
              &nbsp;&nbsp;<span style={{ color: 'rgba(255,255,255,0.3)' }}>// ...17 more systems</span><br/>
              {'}'}) <span style={{ color: '#60b030' }}>→</span> <span style={{ color: '#c44d7a' }}>synthesis</span>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ═══════════════ CONNECTIONS ═══════════════ */}
      <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <RevealSection>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(24px, 5vw, 42px)', color: 'var(--foreground)', letterSpacing: '.15em', marginBottom: 12 }}>
              GOLEM CONNECTIONS
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
              Your Golem meets other Golems autonomously. Framework compatibility first. Photos revealed only after identity confirmation. The anti-dating app.
            </p>
          </div>
        </RevealSection>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { phase: 'FRAMEWORK MATCH', desc: '22 systems compute raw compatibility. HD channels, Gene Keys circuits, Numerology arcs, Mayan Kin resonance.', icon: '⬡', color: '#c9a84c' },
            { phase: 'GOLEM CONVERSATION', desc: 'Your AI identity talks to theirs. Explores depths. Names shadows. Tests chemistry. You sleep.', icon: '💬', color: '#40ccdd' },
            { phase: 'IDENTITY REVEAL', desc: 'Both Golems agree. Only then: names, photos, connection. Identity earned, not swiped.', icon: '🔓', color: '#60b030' },
          ].map((p, i) => (
            <RevealSection key={p.phase} delay={i * 0.15}>
              <div style={{ padding: 24, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: `1px solid ${p.color}22`, textAlign: 'center', height: '100%' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{p.icon}</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.15em', color: p.color, marginBottom: 10 }}>{p.phase}</div>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ═══════════════ PRACTITIONERS ═══════════════ */}
      <section style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <RevealSection>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(24px, 5vw, 42px)', color: 'var(--foreground)', letterSpacing: '.15em', marginBottom: 12 }}>
              FOR PRACTITIONERS
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
              Run sessions with every framework at your fingertips. AI note-taking. Client deep profiles. Pattern mining across your entire practice.
            </p>
          </div>
        </RevealSection>

        <RevealSection delay={0.2}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {[
              { title: 'Multi-System View', desc: 'See all 22 frameworks for any client in one screen', icon: '◈' },
              { title: 'AI Session Notes', desc: 'Claude transcribes and highlights framework-relevant insights', icon: '📝' },
              { title: 'Pattern Mining', desc: 'Discover cross-framework patterns across your entire client base', icon: '🕸' },
            ].map(feat => (
              <div key={feat.title} style={{ padding: 20, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,168,76,0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{feat.icon}</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: 'var(--gold)', letterSpacing: '.1em', marginBottom: 6 }}>{feat.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{feat.desc}</div>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ═══════════════ PRICING ═══════════════ */}
      <section style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <RevealSection>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(24px, 5vw, 42px)', color: 'var(--foreground)', letterSpacing: '.15em', marginBottom: 12 }}>
              CHOOSE YOUR PATH
            </div>
          </div>
        </RevealSection>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { name: 'FREE', price: '$0', desc: 'All 22 computations. See your complete map.', features: ['22 framework engines', 'Interactive dashboard', 'Basic pattern view', 'Golem Connections (limited)'], color: 'rgba(255,255,255,0.5)', border: 'var(--border)' },
            { name: 'PRO', price: '$12/mo', desc: 'AI synthesis unlocked. Your Golem speaks.', features: ['Everything in Free', 'AI cross-framework synthesis', 'Full Connections access', 'Golem.md export', 'Cycle + Moon tracking'], color: '#c9a84c', border: 'rgba(201,168,76,0.4)', highlight: true },
            { name: 'PRACTITIONER', price: '$39/mo', desc: 'Run your practice with GOLEM intelligence.', features: ['Everything in Pro', 'Unlimited client profiles', 'Multi-system session view', 'AI note-taking', 'Pattern mining', 'White-label reports'], color: '#40ccdd', border: 'rgba(64,204,221,0.3)' },
          ].map((tier, i) => (
            <RevealSection key={tier.name} delay={i * 0.1}>
              <div style={{
                padding: 28, borderRadius: 12, textAlign: 'center', height: '100%',
                background: tier.highlight ? 'rgba(201,168,76,0.04)' : 'rgba(255,255,255,0.01)',
                border: `1px solid ${tier.border}`,
                position: 'relative',
              }}>
                {tier.highlight && (
                  <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', padding: '3px 12px', borderRadius: 10, background: 'rgba(201,168,76,0.2)', fontSize: 9, letterSpacing: '.15em', color: '#c9a84c', fontFamily: "'Cinzel',serif" }}>MOST POPULAR</div>
                )}
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: '.2em', color: tier.color, marginBottom: 8 }}>{tier.name}</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 36, color: 'var(--foreground)', marginBottom: 8 }}>{tier.price}</div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20, lineHeight: 1.6 }}>{tier.desc}</p>
                <div style={{ textAlign: 'left' }}>
                  {tier.features.map(f => (
                    <div key={f} style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      ✓ {f}
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ═══════════════ CTA / WAITLIST ═══════════════ */}
      <section style={{ padding: '100px 24px 120px', textAlign: 'center' }}>
        <RevealSection>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(24px, 6vw, 48px)', color: 'var(--foreground)', letterSpacing: '.15em', marginBottom: 16 }}>
            KNOW THYSELF
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'rgba(255,255,255,0.4)', maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Not a horoscope app. An inner-life operating system. Join the waitlist.
          </p>
        </RevealSection>

        <RevealSection delay={0.2}>
          {!submitted ? (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', maxWidth: 400, margin: '0 auto', flexWrap: 'wrap' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)',
                  color: 'var(--foreground)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
                  minWidth: '200px',
                }}
              />
              <button
                onClick={() => { if (email) setSubmitted(true) }}
                style={{
                  padding: '12px 24px', borderRadius: 8, cursor: 'pointer',
                  background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)',
                  color: '#c9a84c', fontSize: 12, fontFamily: "'Cinzel',serif",
                  letterSpacing: '.1em', textTransform: 'uppercase',
                }}
              >
                JOIN
              </button>
            </div>
          ) : (
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: '.15em', color: '#60b030' }}>
              ✓ YOU'RE IN. WE'LL BE IN TOUCH.
            </div>
          )}
        </RevealSection>

        <div style={{ marginTop: 80, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.3em', color: 'rgba(201,168,76,0.15)', textTransform: 'uppercase' }}>
          GOLEM · 22 FRAMEWORKS · ONE INTELLIGENCE · KNOW THYSELF
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
