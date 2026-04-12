import { useState, useEffect, useRef } from "react";

// ─── Starfield Background ───
function Starfield() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight * 5);
    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random() * 0.5 + 0.2,
    }));
    ctx.clearRect(0, 0, w, h);
    stars.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${s.a})`;
      ctx.fill();
    });
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight * 5;
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Animated counter ───
function Counter({ end, suffix = "", duration = 2000 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          let start = 0;
          const step = end / (duration / 16);
          const id = setInterval(() => {
            start += step;
            if (start >= end) {
              setVal(end);
              clearInterval(id);
            } else setVal(Math.floor(start));
          }, 16);
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return (
    <span ref={ref} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {val}
      {suffix}
    </span>
  );
}

// ─── Section wrapper ───
function Section({ children, id, style = {} }) {
  return (
    <section
      id={id}
      style={{
        position: "relative",
        zIndex: 1,
        padding: "100px 24px",
        maxWidth: 1280,
        margin: "0 auto",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

// ─── Framework badge ───
function Badge({ icon, name, color }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 100,
        border: `1px solid ${color}33`,
        background: `${color}0a`,
        color: color,
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: "0.02em",
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      {name}
    </div>
  );
}

// ─── Compatibility card (for Connections) ───
function MatchCard({ score, label, patterns, growth, shadow, gradient }) {
  return (
    <div
      style={{
        background: "#12121a",
        border: "1px solid #ffffff0d",
        borderRadius: 16,
        padding: 32,
        flex: "1 1 340px",
        minWidth: 300,
        maxWidth: 420,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: gradient,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${gradient})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 700,
            color: "#0a0a0f",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {score}
        </div>
        <div>
          <div style={{ color: "#e8e6e1", fontSize: 18, fontWeight: 600 }}>{label}</div>
          <div style={{ color: "#9a9a9a", fontSize: 13, marginTop: 2 }}>Compatibility Score</div>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: "#c9a84c", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 8 }}>
          TOP PATTERNS
        </div>
        {patterns.map((p, i) => (
          <div key={i} style={{ color: "#e8e6e1", fontSize: 14, marginBottom: 6, paddingLeft: 12, borderLeft: "2px solid #c9a84c33" }}>
            {p}
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ color: "#3aafa9", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 4 }}>
          GROWTH
        </div>
        <div style={{ color: "#9a9a9a", fontSize: 13, lineHeight: 1.5 }}>{growth}</div>
      </div>
      <div>
        <div style={{ color: "#c44569", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 4 }}>
          SHADOW DYNAMIC
        </div>
        <div style={{ color: "#9a9a9a", fontSize: 13, lineHeight: 1.5 }}>{shadow}</div>
      </div>
    </div>
  );
}

// ─── Main App ───
export default function GolemHomepage() {
  const [scrollY, setScrollY] = useState(0);
  const [email, setEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBg = scrollY > 60 ? "rgba(10,10,15,0.95)" : "transparent";
  const navBorder = scrollY > 60 ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent";

  return (
    <div
      style={{
        background: "#0a0a0f",
        color: "#e8e6e1",
        fontFamily: "'Inter', -apple-system, sans-serif",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <Starfield />

      {/* ━━━ NAVIGATION ━━━ */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: navBg,
          borderBottom: navBorder,
          backdropFilter: scrollY > 60 ? "blur(16px)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #c9a84c, #7c5cbf)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 800,
              color: "#0a0a0f",
            }}
          >
            G
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>GOLEM</span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Frameworks", "Connections", "Practitioners", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                color: "#9a9a9a",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#e8e6e1")}
              onMouseLeave={(e) => (e.target.style.color = "#9a9a9a")}
            >
              {item}
            </a>
          ))}
          <a
            href="#compute"
            style={{
              background: "#c9a84c",
              color: "#0a0a0f",
              padding: "8px 20px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#d4b55c")}
            onMouseLeave={(e) => (e.target.style.background = "#c9a84c")}
          >
            Compute Your Profile
          </a>
        </div>
      </nav>

      {/* ━━━ HERO ━━━ */}
      <Section id="hero" style={{ paddingTop: 180, paddingBottom: 120, textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: 100,
            border: "1px solid #c9a84c33",
            background: "#c9a84c0a",
            color: "#c9a84c",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            marginBottom: 32,
          }}
        >
          22 FRAMEWORKS · ONE PROFILE · AI SYNTHESIS
        </div>
        <h1
          style={{
            fontSize: "clamp(40px, 7vw, 80px)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: 24,
            background: "linear-gradient(135deg, #e8e6e1 30%, #c9a84c 70%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          The inner-life
          <br />
          operating system.
        </h1>
        <p
          style={{
            fontSize: 20,
            color: "#9a9a9a",
            maxWidth: 600,
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          GOLEM computes your complete identity across 22 symbolic frameworks — then uses AI to name
          the patterns that no single system reveals alone.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="#compute"
            style={{
              background: "#c9a84c",
              color: "#0a0a0f",
              padding: "16px 32px",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 0 40px #c9a84c33",
              transition: "all 0.2s",
            }}
          >
            Compute Your Profile — Free
          </a>
          <a
            href="#frameworks"
            style={{
              border: "1px solid #c9a84c44",
              color: "#c9a84c",
              padding: "16px 32px",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            See All 22 Frameworks
          </a>
        </div>
        <div
          style={{
            marginTop: 60,
            display: "flex",
            justifyContent: "center",
            gap: 48,
            flexWrap: "wrap",
          }}
        >
          {[
            { n: 22, s: "", l: "Frameworks" },
            { n: 5476, s: "", l: "Lines of Computation" },
            { n: 96, s: "%", l: "Accuracy Target" },
          ].map((item) => (
            <div key={item.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#c9a84c" }}>
                <Counter end={item.n} suffix={item.s} />
              </div>
              <div style={{ fontSize: 13, color: "#5a5a6a", marginTop: 4 }}>{item.l}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ━━━ FRAMEWORKS GRID ━━━ */}
      <Section id="frameworks">
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            22 engines. One cosmic signature.
          </h2>
          <p style={{ color: "#9a9a9a", fontSize: 18, maxWidth: 600, margin: "0 auto" }}>
            Every other app gives you a slice. GOLEM computes the whole picture — then shows you
            where the frameworks agree, contradict, and deepen each other.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          {[
            { icon: "☉", name: "Natal Chart", color: "#c9a84c" },
            { icon: "◇", name: "Human Design", color: "#7c5cbf" },
            { icon: "🧬", name: "Gene Keys", color: "#3aafa9" },
            { icon: "🔢", name: "Numerology", color: "#c9a84c" },
            { icon: "🌀", name: "Mayan Calendar", color: "#c44569" },
            { icon: "☯", name: "Chinese Astrology", color: "#d4a843" },
            { icon: "✡", name: "Kabbalah", color: "#7c5cbf" },
            { icon: "⚝", name: "Vedic Astrology", color: "#c9a84c" },
            { icon: "◎", name: "Enneagram", color: "#3aafa9" },
            { icon: "◻", name: "MBTI", color: "#9a9a9a" },
            { icon: "🌿", name: "Ayurvedic Dosha", color: "#3aafa9" },
            { icon: "♡", name: "Love Languages", color: "#c44569" },
            { icon: "⚔", name: "Archetypes", color: "#7c5cbf" },
            { icon: "↗", name: "Career Alignment", color: "#c9a84c" },
            { icon: "⊕", name: "Synastry", color: "#c44569" },
            { icon: "☥", name: "Egyptian Calendar", color: "#d4a843" },
            { icon: "◈", name: "Tibetan Astrology", color: "#7c5cbf" },
            { icon: "✧", name: "Sabian Symbols", color: "#c9a84c" },
            { icon: "☽", name: "Arabic Parts", color: "#9a9a9a" },
            { icon: "★", name: "Fixed Stars", color: "#c9a84c" },
            { icon: "א", name: "Gematria", color: "#7c5cbf" },
            { icon: "∞", name: "Pattern Engine", color: "#3aafa9" },
          ].map((f) => (
            <Badge key={f.name} {...f} />
          ))}
        </div>
      </Section>

      {/* ━━━ HOW IT WORKS ━━━ */}
      <Section id="how">
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Computation is free. Intelligence is the product.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {[
            {
              step: "01",
              title: "Enter your birth data",
              desc: "Date, time, city. One input. That's all GOLEM needs to compute your complete cosmic signature across every framework.",
              color: "#c9a84c",
            },
            {
              step: "02",
              title: "22 engines compute simultaneously",
              desc: "Natal chart, Human Design, Gene Keys, Numerology, Mayan Kin, Chinese Pillars, Vedic nakshatras, and 15 more — all from one birth profile.",
              color: "#7c5cbf",
            },
            {
              step: "03",
              title: "AI names the pattern",
              desc: "Claude synthesizes what no human practitioner can hold: the intersection of 22 systems pointing to the same wound, the same gift, the same through-line.",
              color: "#3aafa9",
            },
          ].map((s) => (
            <div
              key={s.step}
              style={{
                background: "#12121a",
                border: "1px solid #ffffff0d",
                borderRadius: 16,
                padding: 32,
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  color: s.color,
                  opacity: 0.3,
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: 16,
                }}
              >
                {s.step}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
              <p style={{ color: "#9a9a9a", fontSize: 15, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ━━━ AI SYNTHESIS ━━━ */}
      <Section id="synthesis">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#7c5cbf",
                letterSpacing: "0.08em",
                marginBottom: 16,
              }}
            >
              AI SYNTHESIS
            </div>
            <h2
              style={{
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: 20,
              }}
            >
              Not what you are.
              <br />
              <span style={{ color: "#c9a84c" }}>Why you are.</span>
            </h2>
            <p style={{ color: "#9a9a9a", fontSize: 16, lineHeight: 1.7, marginBottom: 24 }}>
              Any app can tell you you're a Projector. GOLEM tells you that your 3/5 Profile's
              experiential drive conflicts with your Splenic authority's instant knowing — and that
              this tension maps exactly to your Gene Key 41's shadow of Fantasizing and your
              Enneagram 4's wound of Deficiency. Three frameworks. One pattern. Named.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Badge icon="🧠" name="Identity Agent" color="#7c5cbf" />
              <Badge icon="♡" name="Relationship Agent" color="#c44569" />
              <Badge icon="↗" name="Life Direction Agent" color="#3aafa9" />
              <Badge icon="⚡" name="Career Oracle" color="#c9a84c" />
            </div>
          </div>
          <div
            style={{
              background: "#12121a",
              border: "1px solid #ffffff0d",
              borderRadius: 16,
              padding: 32,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              lineHeight: 1.8,
              color: "#9a9a9a",
            }}
          >
            <div style={{ color: "#7c5cbf", marginBottom: 8 }}>// Identity Synthesis</div>
            <div style={{ color: "#e8e6e1" }}>
              <span style={{ color: "#c9a84c" }}>Life Mission:</span> Your 3/5 Splenic Projector
              profile is designed to guide through lived experience — not theory. The tension between
              your experiential nature (line 3) and your projection field (line 5) creates a pattern
              where others see you as having answers you're still discovering.
            </div>
            <div style={{ marginTop: 16, color: "#e8e6e1" }}>
              <span style={{ color: "#c44569" }}>Shadow Pattern:</span> Gene Key 41 (Fantasizing)
              + Enneagram 4 (Deficiency) + Projector bitterness when uninvited. These three systems
              point to the same core wound: the belief that the real life is somewhere else.
            </div>
            <div style={{ marginTop: 16, color: "#e8e6e1" }}>
              <span style={{ color: "#3aafa9" }}>Through-Line:</span> Your Kabbalah path crosses
              Tiphereth (beauty through balance) while your Mayan Kin 230 activates in order to
              love. The synthesis: your deepest growth comes through accepting where you are as the
              place where the work is.
            </div>
          </div>
        </div>
      </Section>

      {/* ━━━ GOLEM CONNECTIONS (DATING) ━━━ */}
      <Section id="connections" style={{ paddingTop: 120 }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#c44569",
              letterSpacing: "0.08em",
              marginBottom: 16,
            }}
          >
            GOLEM CONNECTIONS
          </div>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            Pattern-matching, not swipe-matching.
          </h2>
          <p style={{ color: "#9a9a9a", fontSize: 18, maxWidth: 640, margin: "0 auto" }}>
            Every dating app starts with a photo and hopes compatibility follows. GOLEM starts with
            the deepest compatibility analysis ever built — 22 frameworks computing how two people's
            patterns interact — and reveals the person only after both recognize something real.
          </p>
        </div>

        {/* How Connections Works */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            marginBottom: 60,
          }}
        >
          {[
            {
              phase: "Anonymous Match",
              icon: "◇",
              desc: "See the compatibility pattern — top framework alignments, growth dynamics, shadow warnings. No photo. No name. Just the truth of how two cosmic signatures interact.",
              color: "#7c5cbf",
            },
            {
              phase: "Mutual Interest",
              icon: "♡",
              desc: "Both sides say 'I want to know who this is.' Photos reveal — enhanced with your HD type border, constellation overlay, and framework signature. The person behind the pattern.",
              color: "#c44569",
            },
            {
              phase: "Deep Connection",
              icon: "∞",
              desc: "Chat opens with your compatibility narrative as context. Ask GOLEM about your communication styles, conflict patterns, or year-ahead predictions. Relationships that deepen.",
              color: "#3aafa9",
            },
          ].map((p) => (
            <div
              key={p.phase}
              style={{
                background: "#12121a",
                border: "1px solid #ffffff0d",
                borderRadius: 16,
                padding: 32,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 40,
                  marginBottom: 16,
                  color: p.color,
                }}
              >
                {p.icon}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: p.color }}>
                {p.phase}
              </h3>
              <p style={{ color: "#9a9a9a", fontSize: 14, lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Sample Match Cards */}
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <MatchCard
            score={91}
            label="Profound Pattern Match"
            gradient="linear-gradient(135deg, #c9a84c, #7c5cbf)"
            patterns={[
              "HD: Your Generator sacral responds to their Projector recognition — sustainable energy exchange",
              "Gene Keys: Their Gate 22 (Grace) directly complements your Gate 47 (Transmutation) — the wound one carries, the other transforms",
              "Enneagram: 4w5 + 7w6 growth arrows point toward each other — you grow into what the other already offers",
            ]}
            growth="This pairing activates deep creative output. Their strategic vision meets your capacity for sustained creation. Year 2 brings a shared project."
            shadow="Projector bitterness meets Generator frustration when the recognition cycle breaks. The fix: explicit invitations, not assumed availability."
          />
          <MatchCard
            score={73}
            label="Deep Resonance"
            gradient="linear-gradient(135deg, #3aafa9, #7c5cbf)"
            patterns={[
              "Synastry: Venus conjunct Moon (emotional-romantic alignment within 2°)",
              "Numerology: Life Path 7 + 9 — the seeker and the humanitarian, complementary missions",
              "Mayan: Your Kin 230 (Dog, Tone 3) activates their Kin 86 (Warrior, Tone 8) — challenge and commitment",
            ]}
            growth="Both patterns point toward intellectual intimacy as the gateway. Physical connection follows mental resonance, not the reverse."
            shadow="Chinese astrology shows Fire + Water — transformation potential but also steam. Temperature regulation is the ongoing work."
          />
        </div>

        {/* Comparison */}
        <div
          style={{
            marginTop: 60,
            background: "#12121a",
            border: "1px solid #ffffff0d",
            borderRadius: 16,
            padding: 40,
          }}
        >
          <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>
            Why this isn't another dating app
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <div>
              <div style={{ color: "#5a5a6a", fontSize: 13, fontWeight: 600, marginBottom: 12, letterSpacing: "0.05em" }}>
                EVERY OTHER APP
              </div>
              {[
                "Match on photos → discover incompatibility later",
                "Self-reported personality prompts",
                "1 framework maximum (astrology, if any)",
                "Shallow compatibility: 'You're both Leos!'",
                "Swipe mechanics designed for addiction, not connection",
              ].map((t, i) => (
                <div key={i} style={{ color: "#5a5a6a", fontSize: 14, padding: "8px 0", borderBottom: "1px solid #ffffff06", display: "flex", gap: 8 }}>
                  <span style={{ color: "#c44569" }}>✕</span> {t}
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: "#c9a84c", fontSize: 13, fontWeight: 600, marginBottom: 12, letterSpacing: "0.05em" }}>
                GOLEM CONNECTIONS
              </div>
              {[
                "Match on 22-framework synthesis → reveal identity after resonance",
                "Computed from birth data — can't be gamed",
                "22 frameworks weighted by compatibility science",
                "Deep pattern: shadow/gift dynamics, growth predictions, year forecasts",
                "Designed for depth — fewer matches, higher quality, real connection",
              ].map((t, i) => (
                <div key={i} style={{ color: "#e8e6e1", fontSize: 14, padding: "8px 0", borderBottom: "1px solid #ffffff06", display: "flex", gap: 8 }}>
                  <span style={{ color: "#c9a84c" }}>◆</span> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ━━━ PRACTITIONERS ━━━ */}
      <Section id="practitioners">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#3aafa9", letterSpacing: "0.08em", marginBottom: 16 }}>
              FOR PRACTITIONERS
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 20 }}>
              Your clients, across
              <br />
              <span style={{ color: "#3aafa9" }}>every framework.</span>
            </h2>
            <p style={{ color: "#9a9a9a", fontSize: 16, lineHeight: 1.7, marginBottom: 24 }}>
              You're a Human Design analyst who also studies Gene Keys. Or an astrologer who
              integrates Enneagram. GOLEM gives you one dashboard with every framework computed,
              every client profiled, and AI-powered session prep that connects what you already know
              to what you haven't seen yet.
            </p>
            {[
              "Multi-client framework dashboard",
              "AI-powered session prep and client briefings",
              "Branded PDF reports for your practice",
              "Practitioner directory — clients find you",
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3aafa9" }} />
                <span style={{ color: "#e8e6e1", fontSize: 15 }}>{f}</span>
              </div>
            ))}
          </div>
          <div
            style={{
              background: "#12121a",
              border: "1px solid #ffffff0d",
              borderRadius: 16,
              padding: 32,
            }}
          >
            <div style={{ fontSize: 13, color: "#5a5a6a", marginBottom: 16 }}>
              Practitioner Dashboard Preview
            </div>
            {[
              { name: "Sarah M.", type: "Generator 4/6", gk: "Gate 55 — Freedom", score: "Session 12" },
              { name: "Marcus L.", type: "Projector 1/3", gk: "Gate 36 — Humanity", score: "Session 3" },
              { name: "Anika R.", type: "Manifestor 5/1", gk: "Gate 22 — Grace", score: "New Client" },
            ].map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 0",
                  borderBottom: "1px solid #ffffff08",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                  <div style={{ color: "#7c5cbf", fontSize: 13 }}>{c.type}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#3aafa9", fontSize: 13 }}>{c.gk}</div>
                  <div style={{ color: "#5a5a6a", fontSize: 12 }}>{c.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ━━━ PRICING ━━━ */}
      <Section id="pricing">
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Computation is free. Intelligence is paid.
          </h2>
          <p style={{ color: "#9a9a9a", fontSize: 18, maxWidth: 600, margin: "0 auto" }}>
            Every profile computation is free, forever. 22 frameworks, no paywall. When you want the
            AI to tell you what it all means — that's Pro.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {[
            {
              name: "Free",
              price: "$0",
              period: "forever",
              desc: "Full 22-framework computation",
              features: [
                "Complete cosmic signature",
                "All 22 framework widgets",
                "Basic detail panels",
                "1 profile",
              ],
              cta: "Start Free",
              highlight: false,
            },
            {
              name: "Pro",
              price: "$12",
              period: "/month",
              desc: "AI synthesis + full intelligence",
              features: [
                "Everything in Free",
                "AI Identity Agent",
                "AI Relationship Agent",
                "Golem Connections (dating)",
                "Unlimited people",
                "Shareable cosmic signature cards",
                "Full detail panels + export",
              ],
              cta: "Unlock Intelligence",
              highlight: true,
            },
            {
              name: "Practitioner",
              price: "$39",
              period: "/month",
              desc: "Client intelligence platform",
              features: [
                "Everything in Pro",
                "Client dashboard (10 included)",
                "AI session prep + briefings",
                "Branded PDF reports",
                "Practitioner directory listing",
                "Additional clients: $9/mo each",
              ],
              cta: "Start Your Practice",
              highlight: false,
            },
          ].map((tier) => (
            <div
              key={tier.name}
              style={{
                background: tier.highlight ? "#1a1a26" : "#12121a",
                border: tier.highlight ? "1px solid #c9a84c44" : "1px solid #ffffff0d",
                borderRadius: 16,
                padding: 32,
                position: "relative",
                boxShadow: tier.highlight ? "0 0 60px #c9a84c11" : "none",
              }}
            >
              {tier.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#c9a84c",
                    color: "#0a0a0f",
                    padding: "4px 16px",
                    borderRadius: 100,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  MOST POPULAR
                </div>
              )}
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{tier.name}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: tier.highlight ? "#c9a84c" : "#e8e6e1" }}>
                  {tier.price}
                </span>
                <span style={{ color: "#5a5a6a", fontSize: 14 }}>{tier.period}</span>
              </div>
              <p style={{ color: "#9a9a9a", fontSize: 14, marginBottom: 24 }}>{tier.desc}</p>
              {tier.features.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    marginBottom: 10,
                    fontSize: 14,
                    color: "#e8e6e1",
                  }}
                >
                  <span style={{ color: "#c9a84c", fontSize: 12 }}>◆</span>
                  {f}
                </div>
              ))}
              <a
                href="#compute"
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: 24,
                  padding: "14px 24px",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: "none",
                  transition: "all 0.2s",
                  background: tier.highlight ? "#c9a84c" : "transparent",
                  color: tier.highlight ? "#0a0a0f" : "#c9a84c",
                  border: tier.highlight ? "none" : "1px solid #c9a84c44",
                }}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </Section>

      {/* ━━━ CTA / WAITLIST ━━━ */}
      <Section id="compute" style={{ textAlign: "center", paddingBottom: 120 }}>
        <div
          style={{
            background: "linear-gradient(135deg, #12121a, #1a1a26)",
            border: "1px solid #c9a84c22",
            borderRadius: 24,
            padding: "60px 40px",
            maxWidth: 640,
            margin: "0 auto",
            boxShadow: "0 0 80px #c9a84c0a",
          }}
        >
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
            Compute your cosmic signature.
          </h2>
          <p style={{ color: "#9a9a9a", fontSize: 16, marginBottom: 32, maxWidth: 440, margin: "0 auto 32px" }}>
            Enter your birth data. 22 engines compute simultaneously. See the pattern you've never
            seen — in under 3 seconds.
          </p>
          <div style={{ display: "flex", gap: 12, maxWidth: 440, margin: "0 auto" }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                padding: "14px 16px",
                borderRadius: 10,
                border: "1px solid #ffffff15",
                background: "#0a0a0f",
                color: "#e8e6e1",
                fontSize: 15,
                outline: "none",
              }}
            />
            <button
              style={{
                padding: "14px 24px",
                borderRadius: 10,
                background: "#c9a84c",
                color: "#0a0a0f",
                fontSize: 15,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Join Waitlist
            </button>
          </div>
          <div style={{ color: "#5a5a6a", fontSize: 12, marginTop: 16 }}>
            Free to compute. Always. First 100 get 30 days Pro free.
          </div>
        </div>
      </Section>

      {/* ━━━ FOOTER ━━━ */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid #ffffff08",
          padding: "40px 24px",
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>GOLEM</div>
          <div style={{ color: "#5a5a6a", fontSize: 13 }}>
            The inner-life operating system. Above + Inside.
          </div>
        </div>
        <div style={{ color: "#5a5a6a", fontSize: 13 }}>
          © 2026 GOLEM · Built in Punta del Este
        </div>
      </footer>
    </div>
  );
}
