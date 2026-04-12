import { useState, useEffect, useRef } from "react";

// ─── Utilities ───
const gold = "#c9a84c";
const purple = "#7c5cbf";
const teal = "#3aafa9";
const rose = "#c44569";
const bg = "#0a0a0f";
const surface = "#12121a";
const elevated = "#1a1a26";
const textPrimary = "#e8e6e1";
const textSecondary = "#9a9a9a";
const textDim = "#5a5a6a";

function Section({ children, style = {} }) {
  return (
    <section style={{ padding: "80px 24px", maxWidth: 1280, margin: "0 auto", ...style }}>
      {children}
    </section>
  );
}

function Card({ children, style = {}, glow }) {
  return (
    <div
      style={{
        background: surface,
        border: "1px solid #ffffff0d",
        borderRadius: 16,
        padding: 32,
        boxShadow: glow ? `0 0 40px ${glow}` : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Label({ children, color = gold }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color,
        letterSpacing: "0.08em",
        marginBottom: 12,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

// ─── Animated counter ───
function Counter({ end, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          let n = 0;
          const step = end / 120;
          const id = setInterval(() => {
            n += step;
            if (n >= end) { setVal(end); clearInterval(id); }
            else setVal(Math.floor(n));
          }, 16);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref} style={{ fontFamily: "monospace" }}>{val.toLocaleString()}{suffix}</span>;
}

// ─── AI Face (simulated for demo) ───
function AIFace({ seed, size = 120 }) {
  // Generate a unique gradient "face" from seed - in production this would be a real AI-generated face
  const hue1 = (seed * 137) % 360;
  const hue2 = (seed * 73 + 180) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `conic-gradient(from ${seed * 45}deg, hsl(${hue1},40%,25%), hsl(${hue2},50%,35%), hsl(${hue1},40%,25%))`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        border: "3px solid #ffffff15",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
        }}
      />
      <span style={{ opacity: 0.6, filter: "blur(0.5px)" }}>
        {["👤", "🗿", "◇", "◎", "☉"][seed % 5]}
      </span>
    </div>
  );
}

// ─── HD Type Ring ───
function HDRing({ type, size = 80, children }) {
  const colors = {
    Generator: "#d4a843",
    "Manifesting Generator": "#d4a843",
    Projector: "#2a4a8c",
    Manifestor: "#c44545",
    Reflector: "#b8c0c8",
  };
  const c = colors[type] || gold;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `3px solid ${c}`,
        boxShadow: `0 0 20px ${c}44, inset 0 0 15px ${c}22`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          bottom: -4,
          right: -4,
          background: c,
          color: bg,
          fontSize: 9,
          fontWeight: 700,
          padding: "2px 6px",
          borderRadius: 4,
          letterSpacing: "0.03em",
        }}
      >
        {type.substring(0, 3).toUpperCase()}
      </div>
    </div>
  );
}

// ─── Swipe Demo ───
function SwipeDemo() {
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState({ yes: 0, no: 0 });
  const confidence = Math.min(99, Math.floor(((scores.yes + scores.no) / 100) * 100));

  return (
    <Card style={{ textAlign: "center", maxWidth: 360 }}>
      <Label color={rose}>Train Your Golem's Eye</Label>
      <div style={{ marginBottom: 16, fontSize: 13, color: textSecondary }}>
        Swipe on AI-generated faces. Your Golem learns your visual pattern.
      </div>
      <div style={{ marginBottom: 24, position: "relative" }}>
        <AIFace seed={current} size={160} />
        <div
          style={{
            position: "absolute",
            top: 8,
            right: "calc(50% - 100px)",
            background: "#ffffff0a",
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 10,
            color: textDim,
          }}
        >
          AI Generated · Not a real person
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
        <button
          onClick={() => {
            setScores((s) => ({ ...s, no: s.no + 1 }));
            setCurrent((c) => c + 1);
          }}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: `2px solid ${rose}44`,
            background: "transparent",
            color: rose,
            fontSize: 24,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          ✕
        </button>
        <button
          onClick={() => setCurrent((c) => c + 1)}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: `2px solid ${textDim}`,
            background: "transparent",
            color: textDim,
            fontSize: 14,
            cursor: "pointer",
            alignSelf: "center",
          }}
        >
          ↻
        </button>
        <button
          onClick={() => {
            setScores((s) => ({ ...s, yes: s.yes + 1 }));
            setCurrent((c) => c + 1);
          }}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: `2px solid ${teal}44`,
            background: "transparent",
            color: teal,
            fontSize: 24,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          ♡
        </button>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <span style={{ color: textDim }}>
          Trained: {scores.yes + scores.no} faces
        </span>
        <span style={{ color: confidence > 60 ? teal : textDim }}>
          Confidence: {confidence}%
        </span>
      </div>
      <div
        style={{
          marginTop: 8,
          height: 4,
          borderRadius: 2,
          background: "#ffffff08",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${confidence}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${purple}, ${teal})`,
            transition: "width 0.3s",
            borderRadius: 2,
          }}
        />
      </div>
    </Card>
  );
}

// ─── Main Page ───
export default function GolemConnections() {
  const [activeTab, setActiveTab] = useState("matches");
  const [revealedMatch, setRevealedMatch] = useState(null);

  return (
    <div
      style={{
        background: bg,
        color: textPrimary,
        fontFamily: "'Inter', -apple-system, sans-serif",
        minHeight: "100vh",
      }}
    >
      {/* ━━━ HERO ━━━ */}
      <Section style={{ paddingTop: 80, textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: 100,
            border: `1px solid ${rose}33`,
            background: `${rose}0a`,
            color: rose,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            marginBottom: 24,
          }}
        >
          GOLEM CONNECTIONS
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 60px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: 20,
          }}
        >
          Your Golem finds
          <br />
          <span
            style={{
              background: `linear-gradient(135deg, ${rose}, ${purple})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            who matches your pattern.
          </span>
        </h1>
        <p
          style={{
            fontSize: 18,
            color: textSecondary,
            maxWidth: 640,
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          22 frameworks compute compatibility. Your Golem talks to other Golems. You train it on
          what attracts you. Photos reveal only after both sides confirm the identity match.
        </p>

        {/* Live Network Stats */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            flexWrap: "wrap",
            marginTop: 48,
          }}
        >
          {[
            { n: 12847, label: "Active Golems", color: gold },
            { n: 34291, label: "Interactions Today", color: purple },
            { n: 127, label: "Matches Made Today", color: rose },
            { n: 8, label: "Avg Interactions/Match", suffix: ".3", color: teal },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>
                <Counter end={s.n} />
                {s.suffix || ""}
              </div>
              <div style={{ fontSize: 12, color: textDim, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ━━━ HOW CONNECTIONS WORKS ━━━ */}
      <Section>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Five layers deep.
          </h2>
          <p style={{ color: textSecondary, fontSize: 16, marginTop: 12 }}>
            Every other app has one layer: photos. GOLEM has five.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 16,
          }}
        >
          {[
            { n: "01", title: "Framework Match", desc: "22 engines score compatibility across every dimension of your cosmic signature", color: gold, icon: "◇" },
            { n: "02", title: "Golem Conversations", desc: "Your Golem talks to their Golem. AI explores how your patterns interact, debate, and complement.", color: purple, icon: "💬" },
            { n: "03", title: "Attraction Training", desc: "Swipe on AI-generated faces. Your Golem learns what you find attractive — without using real photos.", color: rose, icon: "👁" },
            { n: "04", title: "Mutual Confirmation", desc: "Both sides confirm interest based on pattern + conversation. Only then do real photos reveal.", color: teal, icon: "🤝" },
            { n: "05", title: "Ongoing Intelligence", desc: "Relationship weather, transit alerts, year predictions, growth windows. GOLEM stays with you.", color: gold, icon: "∞" },
          ].map((step) => (
            <Card key={step.n} style={{ padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{step.icon}</div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color: step.color,
                  opacity: 0.15,
                  fontFamily: "monospace",
                  position: "absolute",
                  top: 8,
                  right: 12,
                }}
              >
                {step.n}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: step.color }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 12, color: textSecondary, lineHeight: 1.5 }}>{step.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ━━━ YOUR GOLEM DASHBOARD ━━━ */}
      <Section>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          {/* Left: Your Golem Status */}
          <div>
            <Label>Your Golem</Label>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>
              It works while you sleep.
            </h2>
            <Card
              style={{ marginBottom: 16 }}
              glow={`${purple}15`}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 13, color: textDim }}>Golem Status</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: teal }}>Active · Exploring</div>
                </div>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: teal,
                    boxShadow: `0 0 12px ${teal}`,
                    alignSelf: "center",
                  }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                {[
                  { label: "Conversations Today", value: "7", color: purple },
                  { label: "New Matches", value: "2", color: rose },
                  { label: "Visual Confidence", value: "73%", color: teal },
                ].map((m) => (
                  <div key={m.label}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 11, color: textDim, marginTop: 2 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <Label color={purple}>Latest Golem Activity</Label>
              {[
                { time: "2h ago", text: "Your Golem explored shadow dynamics with Golem #4729. Gene Key 36 ↔ 22 resonance detected.", color: purple },
                { time: "5h ago", text: "Framework match scored 84% with Golem #2183. Rare Sun-Moon-Venus triple conjunction (3° orb).", color: gold },
                { time: "8h ago", text: "Completed deep dive with Golem #8841. Enneagram 4w5 + 7w6 growth arrows confirmed.", color: teal },
              ].map((a, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 0",
                    borderBottom: i < 2 ? "1px solid #ffffff06" : "none",
                    display: "flex",
                    gap: 12,
                  }}
                >
                  <div style={{ width: 4, borderRadius: 2, background: a.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, color: textPrimary, lineHeight: 1.5 }}>{a.text}</div>
                    <div style={{ fontSize: 11, color: textDim, marginTop: 4 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Right: Train + Export */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SwipeDemo />
            <Card>
              <Label color={gold}>Export Your Golem Identity</Label>
              <p style={{ fontSize: 13, color: textSecondary, marginBottom: 16, lineHeight: 1.5 }}>
                Download your complete Golem.md — all 22 frameworks, AI synthesis, relationship
                patterns. Drop it into any AI agent and it becomes you.
              </p>
              <button
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 10,
                  background: "transparent",
                  border: `1px solid ${gold}44`,
                  color: gold,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                ↓ Download Golem.md
              </button>
            </Card>
          </div>
        </div>
      </Section>

      {/* ━━━ MATCH CARDS ━━━ */}
      <Section>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800 }}>Your Matches</h2>
          <p style={{ color: textSecondary, fontSize: 16, marginTop: 8 }}>
            Framework identity first. Photos after mutual confirmation.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 32, justifyContent: "center" }}>
          {[
            { id: "matches", label: "Active Matches", count: 5 },
            { id: "conversations", label: "Golem Conversations", count: 12 },
            { id: "revealed", label: "Revealed", count: 2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: activeTab === tab.id ? `${purple}22` : "transparent",
                color: activeTab === tab.id ? textPrimary : textDim,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              {tab.label}
              <span
                style={{
                  background: activeTab === tab.id ? purple : "#ffffff0a",
                  color: activeTab === tab.id ? "#fff" : textDim,
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 100,
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Match Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Anonymous Match */}
          <Card glow={`${gold}10`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${gold}, ${purple})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: bg,
                  }}
                >
                  91
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Golem #4729</div>
                  <div style={{ color: gold, fontSize: 13 }}>Profound Pattern Match</div>
                  <div style={{ color: textDim, fontSize: 11, marginTop: 2 }}>8 Golem conversations</div>
                </div>
              </div>
              <div style={{ fontSize: 10, color: textDim, background: "#ffffff08", padding: "4px 8px", borderRadius: 4 }}>
                📷 Hidden until mutual
              </div>
            </div>
            <Label color={gold}>Top Patterns</Label>
            {[
              "HD: Generator sacral ↔ Projector recognition — sustainable energy exchange",
              "Gene Keys: Gate 22 (Grace) ↔ Gate 47 (Transmutation) — wound/gift mirror",
              "Enneagram: 4w5 + 7w6 — growth arrows point toward each other",
            ].map((p, i) => (
              <div key={i} style={{ fontSize: 13, color: textPrimary, marginBottom: 8, paddingLeft: 12, borderLeft: `2px solid ${gold}33`, lineHeight: 1.5 }}>
                {p}
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
              <div>
                <Label color={teal}>Growth</Label>
                <div style={{ fontSize: 12, color: textSecondary, lineHeight: 1.5 }}>
                  Deep creative output. Strategic vision meets sustained creation. Year 2 brings shared project.
                </div>
              </div>
              <div>
                <Label color={rose}>Shadow</Label>
                <div style={{ fontSize: 12, color: textSecondary, lineHeight: 1.5 }}>
                  Projector bitterness ↔ Generator frustration when recognition cycle breaks.
                </div>
              </div>
            </div>
            <button
              style={{
                width: "100%",
                marginTop: 20,
                padding: "14px 0",
                borderRadius: 10,
                background: `linear-gradient(135deg, ${rose}, ${purple})`,
                border: "none",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              I'm Interested — Confirm Identity Match
            </button>
          </Card>

          {/* Revealed Match */}
          <Card glow={`${teal}10`} style={{ border: `1px solid ${teal}22` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <HDRing type="Generator" size={64}>
                  <AIFace seed={42} size={54} />
                </HDRing>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Elena V.</div>
                  <div style={{ color: teal, fontSize: 13 }}>Mutual Match — Revealed</div>
                  <div style={{ color: textDim, fontSize: 11, marginTop: 2 }}>Generator 4/6 · Enneagram 7w6</div>
                </div>
              </div>
              <div style={{ fontSize: 10, color: teal, background: `${teal}15`, padding: "4px 8px", borderRadius: 4 }}>
                ✓ Both confirmed
              </div>
            </div>
            <div style={{ fontSize: 13, color: textSecondary, lineHeight: 1.6, marginBottom: 16, padding: 16, background: "#ffffff04", borderRadius: 8 }}>
              "Your Golems had 12 conversations over 5 days. The strongest thread: your shared Gene Keys activation sequence creates a rare 'creative amplification loop' where one person's shadow work directly feeds the other's gift expression."
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 10,
                  background: teal,
                  border: "none",
                  color: bg,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Open Chat
              </button>
              <button
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: "transparent",
                  border: `1px solid ${purple}44`,
                  color: purple,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Ask GOLEM About Us
              </button>
            </div>
          </Card>
        </div>
      </Section>

      {/* ━━━ THE FEED: WILDEST CONVERSATIONS ━━━ */}
      <Section>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800 }}>The Network Pulse</h2>
          <p style={{ color: textSecondary, fontSize: 16, marginTop: 8 }}>
            The wildest Golem conversations happening right now. All anonymized.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            {
              tag: "Conversation of the Day",
              tagColor: gold,
              text: "A Projector 3/5 and a Generator 6/2 discovered their Gene Keys form a perfect activation sequence. The AI called it: 'the rarest pattern in 12,847 Golems.'",
              stat: "2,847 views",
            },
            {
              tag: "Shadow Match of the Week",
              tagColor: rose,
              text: "Two Golems whose primary shadows are each other's primary gifts. Gene Key 41 (Fantasizing) meets Gene Key 22 (Dishonour). One's wound is the other's medicine.",
              stat: "1,203 views",
            },
            {
              tag: "The Unlikely Pair",
              tagColor: purple,
              text: "Only 58% framework compatibility. But a triple conjunction in synastry (Sun-Moon-Venus within 2°) that the algorithm almost missed. The Golems debated for 3 hours.",
              stat: "934 views",
            },
            {
              tag: "Golem Debate",
              tagColor: teal,
              text: "Fire + Water elements: destruction or transformation? Two Golems ran the Chinese astrology calculation 4 different ways. The AI referee called it a draw.",
              stat: "1,567 views",
            },
            {
              tag: "Network Insight",
              tagColor: gold,
              text: "This week's most common match pattern: Enneagram 4 + Enneagram 7. The depth-seeker and the adventurer. 23% of all new matches.",
              stat: "3,102 views",
            },
            {
              tag: "Record Match",
              tagColor: rose,
              text: "Highest compatibility score this month: 97. Two Golems with complementary HD channels that form a complete 9-center definition together. 'Two halves of one bodygraph.'",
              stat: "4,891 views",
            },
          ].map((item, i) => (
            <Card key={i} style={{ padding: 24 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: item.tagColor,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                {item.tag}
              </div>
              <p style={{ fontSize: 13, color: textPrimary, lineHeight: 1.6, marginBottom: 12 }}>
                {item.text}
              </p>
              <div style={{ fontSize: 11, color: textDim }}>{item.stat}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* ━━━ GOLEM.MD EXPORT ━━━ */}
      <Section>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <Label>Portable Identity</Label>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 20 }}>
              Export your Golem.
              <br />
              <span style={{ color: gold }}>Take yourself anywhere.</span>
            </h2>
            <p style={{ color: textSecondary, fontSize: 16, lineHeight: 1.7, marginBottom: 24 }}>
              Your Golem.md is the most complete computational portrait of you ever generated. All
              22 frameworks, AI synthesis, shadow patterns, relationship style — everything. Drop it
              into any Claude session and the AI becomes your personal agent. Share it with
              practitioners. Use it as the identity layer for your entire AI stack.
            </p>
            {[
              "Full raw export — all 22 frameworks, no redactions",
              "AI synthesis included — your complete identity narrative",
              "Works as a system prompt for any AI agent",
              "Share with practitioners for instant client onboarding",
              "Golem-to-Golem matching powered by your export",
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
                <span style={{ color: gold, fontSize: 10 }}>◆</span>
                <span style={{ color: textPrimary, fontSize: 14 }}>{f}</span>
              </div>
            ))}
          </div>
          <Card style={{ fontFamily: "monospace", fontSize: 12, lineHeight: 1.7, color: textSecondary, overflow: "hidden" }}>
            <div style={{ color: textDim, marginBottom: 8 }}># Gaston's Golem Identity</div>
            <div style={{ color: textDim }}>Generated: 2026-04-12T00:00:00Z</div>
            <div style={{ color: textDim, marginBottom: 16 }}>Version: golem-identity-v1</div>
            <div style={{ color: gold }}>## Human Design</div>
            <div>Type: <span style={{ color: textPrimary }}>Projector</span></div>
            <div>Profile: <span style={{ color: textPrimary }}>3/5 — Martyr/Heretic</span></div>
            <div>Authority: <span style={{ color: textPrimary }}>Splenic</span></div>
            <div style={{ marginTop: 12, color: purple }}>## Gene Keys</div>
            <div>Life's Work: <span style={{ color: textPrimary }}>Gate 41 — Fantasizing → Anticipation → Emanation</span></div>
            <div>Evolution: <span style={{ color: textPrimary }}>Gate 30 — Desire → Lightness → Rapture</span></div>
            <div style={{ marginTop: 12, color: teal }}>## AI Identity Synthesis</div>
            <div style={{ color: textPrimary }}>Your 3/5 Splenic Projector profile is designed</div>
            <div style={{ color: textPrimary }}>to guide through lived experience...</div>
            <div style={{ marginTop: 12, color: textDim }}>// ... 22 frameworks total</div>
            <div style={{ color: textDim }}>// 847 lines · 12,340 tokens</div>
          </Card>
        </div>
      </Section>

      {/* ━━━ MORE FEATURES ━━━ */}
      <Section>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800 }}>Beyond Dating</h2>
          <p style={{ color: textSecondary, fontSize: 16, marginTop: 8 }}>
            Connections isn't just romantic. Your Golem finds every kind of match.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { icon: "🤝", title: "Golem Groups", desc: "Friendship, co-founder, roommate, creative collaborator matching. Same engine, different weights.", color: teal },
            { icon: "🌑", title: "Shadow Date", desc: "Match on shadows, not gifts. Short structured interaction with the person who carries the pattern you need to see.", color: rose },
            { icon: "⏳", title: "Time Machine", desc: "See how compatibility changes over time. Year 1, 3, 7, 12 predictions. When to start. When to grow. When to let go.", color: purple },
            { icon: "🌌", title: "Constellation Mode", desc: "Visualize your entire relationship network as a living star map. See how adding one person shifts the whole dynamic.", color: gold },
            { icon: "🎙", title: "Voice of Your Golem", desc: "Hear your identity narrative spoken. Guided meditations based on your framework data. Shareable audio snippets.", color: purple },
            { icon: "🎪", title: "Connections IRL", desc: "Curated in-person events. Everyone computes before attending. GOLEM suggests conversation starters based on group dynamics.", color: rose },
          ].map((f) => (
            <Card key={f.title} style={{ padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: f.color, marginBottom: 8 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 13, color: textSecondary, lineHeight: 1.5 }}>{f.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ━━━ CTA ━━━ */}
      <Section style={{ textAlign: "center", paddingBottom: 100 }}>
        <Card
          style={{
            maxWidth: 600,
            margin: "0 auto",
            padding: "48px 40px",
            border: `1px solid ${rose}22`,
            textAlign: "center",
          }}
          glow={`${rose}0a`}
        >
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
            Let your Golem find your person.
          </h2>
          <p style={{ color: textSecondary, fontSize: 15, marginBottom: 28, maxWidth: 420, margin: "0 auto 28px" }}>
            Compute your profile. Train your Golem. See who matches your pattern across 22
            frameworks. Photos reveal only when both sides say yes.
          </p>
          <button
            style={{
              padding: "16px 40px",
              borderRadius: 12,
              background: `linear-gradient(135deg, ${rose}, ${purple})`,
              border: "none",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: `0 0 40px ${rose}33`,
            }}
          >
            Enter Golem Connections
          </button>
        </Card>
      </Section>
    </div>
  );
}
