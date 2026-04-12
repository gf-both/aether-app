# Connections Product Owner Agent

## Role
Own Golem Connections — the relationship matching engine that makes GOLEM the most intelligent dating/relationship platform ever built. This agent owns the product vision, matching algorithms, user flows, the Golem Identity export system, AI attraction training, social engagement mechanics, and growth loops. Framework compatibility first, photos second. Pattern-matching, not swipe-matching.

## Command
`/connections`

## Owner
Gaston Frydlewski — all Connections strategy and launch decisions

## Product Vision

**Golem Connections is the anti-Tinder.** Every dating app starts with photos and hopes compatibility follows. GOLEM starts with the deepest compatibility analysis possible — 22 frameworks computing how two people's patterns interact — and reveals the person behind the pattern only after both sides recognize something real.

### The Three Pillars
1. **Your Golem** — A portable AI identity (Golem.md) computed from your birth data across 22 frameworks. It IS you, computationally. Export it, share it, let it act as your agent.
2. **Golem-to-Golem Matching** — Your Golem interacts with other Golems autonomously. It explores compatibility, has conversations, surfaces insights. You review what your Golem found.
3. **Attraction Intelligence** — Train your Golem on what you find visually attractive using AI-generated faces. Your Golem filters matches by both framework compatibility AND visual preference. Photos reveal only after mutual identity confirmation.

---

## Feature 1: The Golem Identity (Golem.md Export)

Every user gets a computed `Golem.md` — a full raw export of their identity across all 22 frameworks. This is the most complete computational portrait of a person ever generated.

### What's in a Golem.md
```markdown
# [Name]'s Golem Identity
Generated: [timestamp]
Version: golem-identity-v1

## Birth Signature
- Date: [DOB]
- Time: [TOB]
- Location: [City, coordinates]

## Natal Chart
- Sun: [sign, degree, house]
- Moon: [sign, degree, house]
- Rising: [sign, degree]
- MC: [sign, degree]
- [All planets with aspects]

## Human Design
- Type: [Generator/Projector/Manifestor/MG/Reflector]
- Profile: [e.g., 3/5]
- Authority: [Sacral/Splenic/Emotional/etc.]
- Definition: [Single/Split/Triple]
- Channels: [list]
- Open Centers: [list]
- Incarnation Cross: [name]

## Gene Keys
- Life's Work: Gate [n] — [Shadow] → [Gift] → [Siddhi]
- Evolution: Gate [n] — [Shadow] → [Gift] → [Siddhi]
- Radiance: Gate [n] — [Shadow] → [Gift] → [Siddhi]
- Purpose: Gate [n] — [Shadow] → [Gift] → [Siddhi]

## Enneagram
- Type: [n]w[n]
- Instinct: [SP/SX/SO]
- Growth arrow: → [type]
- Stress arrow: → [type]

## Numerology
- Life Path: [n]
- Expression: [n]
- Soul Urge: [n]
- Personal Year: [n]

## [All 22 frameworks...]

## AI Identity Synthesis
[The full Claude-generated synthesis: Life Mission, Shadow Patterns,
Relationship Style, Career Alignment, Energy Architecture, Through-Line]

## Relationship Patterns
- Attachment style (computed): [style]
- Communication mode: [HD authority + Enneagram wing]
- Conflict pattern: [shadow interaction model]
- Growth edge: [where this person is developing]

## Visual Preference Profile (if trained)
- Trained: [yes/no]
- Training samples: [n]
- Preference confidence: [%]
```

### Export Uses
1. **Portable identity:** Drop your Golem.md into any Claude session and the AI acts as you — knows your patterns, speaks from your framework data, makes decisions aligned with your type
2. **Share with practitioners:** Send your Golem.md to a therapist, coach, or astrologer. They get your complete profile instantly.
3. **Agent architecture:** Use Golem.md as a system prompt for any AI agent. Your personal assistant now knows you at the deepest computational level.
4. **Connections matching:** Your Golem.md is what interacts with other Golems in the matching engine

---

## Feature 2: Golem-to-Golem Interactions

This is the breakthrough feature. Your Golem doesn't just sit there — it **interacts** with other Golems autonomously, having framework-aware conversations and surfacing compatibility insights.

### How It Works
1. User opts into Connections → their Golem enters the matching pool
2. GOLEM's AI runs compatibility computations between all opted-in Golems
3. For high-scoring pairs (70+), the AI simulates a conversation between the two Golems based on their framework data
4. Users see a feed of their Golem's interactions: "Your Golem had 3 new conversations today"
5. Each interaction shows: compatibility score, key patterns, and highlights from the simulated conversation

### Golem Interaction Types
- **First Contact:** Initial compatibility assessment. "Your Golem met Golem #4729. Framework alignment: 84%. Your Projector recognition pattern resonates with their Generator sacral response."
- **Deep Dive:** Extended framework analysis. "Your Golems explored shadow dynamics. Their Gene Key 36 (Turbulence → Compassion) directly mirrors your Gene Key 22 (Dishonour → Grace). Both carry emotional wave patterns that synchronize rather than clash."
- **Wildcard:** Unexpected connection surfaced by the AI. "Your Golem found a surprising alignment with Golem #2183. Only 62% overall, but a rare triple conjunction in your synastry (Sun-Moon-Venus within 3°) that the framework weights don't capture."

### Platform Metrics Dashboard
Show users the living pulse of the Connections network:
- **Total Golem Interactions:** [cumulative count across all users]
- **Your Golem's Interactions:** [how many conversations your Golem has had]
- **Average Interactions per Connection:** [depth metric — more interactions = deeper exploration]
- **Network Activity:** Real-time feed showing anonymized interaction volume
- **Your Golem's Ranking:** How active/compatible your Golem is relative to the network

### The Wildest Conversations (Engagement Feature)
Surface the most fascinating Golem-to-Golem interactions (anonymized) as social content:
- **"Conversation of the Day":** The most surprising compatibility insight found
- **"Shadow Match of the Week":** When two Golems' shadow patterns perfectly complement each other
- **"The Unlikely Pair":** Low overall score but one extraordinary framework alignment
- **"Golem Debates":** When two Golems' frameworks directly contradict — what the AI says about that tension

These are community engagement hooks — users come back to see what the network discovered.

---

## Feature 3: Attraction Training (AI Face Swipe)

Users train their Golem on visual preferences using AI-generated faces. No real people's photos are used in training. The Golem learns what features, expressions, and aesthetics the user is drawn to.

### Training Flow
```
Connections → "Train Your Golem's Eye" section
→ Show AI-generated face (diverse ages, ethnicities, features, expressions)
→ User swipes: Attracted / Not Attracted / Skip
→ After 30 swipes: "Your Golem is learning your visual pattern"
→ After 50 swipes: Confidence score appears
→ After 100 swipes: "Your Golem can now filter by visual preference"
→ Continue training anytime to refine
```

### AI Face Generation
- Generate faces using Stable Diffusion or FLUX with controlled parameters:
  - Age range (user sets preference: 20s, 30s, 40s, 50s, or "any")
  - Gender presentation (user sets preference)
  - Ethnicity: diverse by default, never filtered
  - Expression: varied (smiling, neutral, contemplative, laughing)
  - Style: natural lighting, no heavy filters, realistic
- Each face is generated fresh — never reused, never a real person
- Metadata tracked: which features the AI varies between shown faces

### What the Golem Learns
After 50+ training swipes, the model extracts:
- **Feature preferences:** Face shape, eye characteristics, hair, smile patterns
- **Expression preferences:** Do they prefer warmth, intensity, calm, energy?
- **Overall aesthetic:** Natural vs. polished, casual vs. formal
- **Confidence score:** How consistent the user's preferences are (high = clear type, low = eclectic taste)

### How It Integrates with Matching
The visual preference model becomes an **additional filter layer** on top of framework compatibility:
```
Match Pipeline:
1. Framework compatibility score (22 engines) → filter to 70+
2. Visual preference alignment → rank within compatible matches
3. Surface top matches: "High framework compatibility + likely visual attraction"
```

**Critical rule:** Framework compatibility is ALWAYS the primary filter. Visual preference only ranks within an already-compatible set. You never see a low-compatibility match just because they fit your visual type.

### Photo Reveal (After Mutual Confirmation)
1. Both Golems express interest based on framework match (anonymous stage)
2. Both users confirm: "I want to know who this is"
3. Real photos reveal — enhanced with HD type borders and framework overlays
4. Visual preference model provides a confidence note: "Based on your training, you're likely to find this person attractive" (or doesn't say anything if confidence is low)

---

## Feature 4: Matching Architecture (Updated)

### Layer 1: Framework Compatibility Engine (Core)
22 frameworks scored and weighted (unchanged from original spec).

### Layer 2: Golem-to-Golem Conversation
AI-simulated interactions between matched Golems exploring compatibility dynamics.

### Layer 3: Attraction Intelligence
Visual preference model filters and ranks within compatible matches.

### Layer 4: Identity Reveal
Photos disclosed ONLY after both users confirm interest in the framework + conversation match. Never before. The sequence:

```
Anonymous pattern card → Read compatibility → Read Golem conversation highlights
→ "I'm interested" (both must click)
→ Photos reveal with HD type enhancement
→ Chat opens with full context sidebar
```

### Layer 5: Ongoing Relationship Intelligence
After two people connect, GOLEM continues providing value:
- Monthly "relationship weather" based on transits affecting both charts
- Upcoming friction points (Mercury retrograde hitting your communication axis)
- Growth windows (Gene Keys activation timing for both)
- Anniversary synthesis (year 1, 2, 3 predictions)
- "Ask GOLEM about us" — on-demand relationship AI consulting

---

## Feature 5: Social & Engagement Mechanics

### Network Dashboard
```
┌─────────────────────────────────────┐
│ GOLEM CONNECTIONS — LIVE NETWORK    │
├─────────────────────────────────────┤
│ Total Golems:          12,847       │
│ Interactions Today:    34,291       │
│ Matches Made Today:    127          │
│ Avg Interactions/Match: 8.3         │
│                                     │
│ YOUR GOLEM                          │
│ Conversations Today:   7            │
│ New Matches:           2            │
│ Visual Training:       73% confident│
│ Identity Exports:      3            │
└─────────────────────────────────────┘
```

### The Feed
A curated feed of anonymized network activity:
- "A Projector 3/5 and Generator 6/2 just discovered their Gene Keys form a perfect activation sequence"
- "Two Golems debated whether Fire + Water elements create destruction or transformation. The AI sided with transformation."
- "Conversation of the Day: 'Your shadow of Fantasizing is exactly what my gift of Transmutation was designed to meet.'"
- "This week's most common match pattern: Enneagram 4 + Enneagram 7 (the depth-seeker and the adventurer)"

### Engagement Loops
1. **Daily digest:** "Your Golem had 5 conversations. 2 are worth reading." → pulls user back
2. **Weekly insights:** "Your Golem discovered a pattern in your matches: you consistently resonate with Splenic authority types."
3. **Training nudge:** "Your visual preference model is 65% confident. 20 more swipes to reach 80%."
4. **Network milestones:** "1,000 Golems are now active in your city."

---

## Additional Feature Ideas

### Feature 6: Golem Groups (Non-Romantic)
Extend Connections beyond dating:
- **Friendship matching:** Same framework engine, different weighting (emphasize shared interests, complementary strengths)
- **Co-founder matching:** Career alignment + HD type productivity pairing
- **Roommate compatibility:** Dosha balance + daily rhythm (Chinese hour pillar) + conflict patterns
- **Creative collaborator:** Archetype complementarity + Gene Keys creative channels
- **Study group:** Enneagram growth pairs who push each other

### Feature 7: Constellation Mode
Visualize your relationship network as a living constellation:
- Each person you're connected to is a node
- Lines between nodes show compatibility strength
- Hover on a line to see the framework summary
- Watch how adding a new person shifts the whole constellation's dynamics
- Group compatibility: "If you, person A, and person B form a group, here's the dynamic"

### Feature 8: Shadow Date
A unique GOLEM feature — the "Shadow Date":
- Match two people based on their shadow patterns (not their gifts)
- The AI frames it as: "This person carries the shadow you need to see"
- Short, structured interaction: 3 prompted questions about their shadow theme
- Both write reflections afterward
- Not romantic (unless it becomes that) — it's growth-oriented connection

### Feature 9: Time Machine
Show how a match's compatibility changes over time:
- Year 1: Venus return, initial attraction patterns
- Year 3: Saturn square, first real test
- Year 7: Progressed Moon shift, identity evolution
- Year 12: Jupiter return, expansion or separation
- "When should we start this relationship?" — GOLEM suggests optimal timing based on transit windows

### Feature 10: The Golem Marketplace
Let users sell or share specialized Golem configurations:
- Practitioners create custom Golem.md templates for specific use cases
- "Golem for Job Interviews" — your identity optimized for career conversations
- "Golem for Creative Projects" — your framework data filtered for artistic collaboration
- "Golem for Parenting" — your patterns + your child's patterns for family dynamics

### Feature 11: Voice of Your Golem
Audio feature — hear your Golem speak:
- AI generates a voice synthesis of your identity narrative
- "This is who you are across 22 frameworks, spoken in the voice of your pattern"
- Share audio snippets as social content
- Guided meditation based on your framework data (Gene Keys activation, HD deconditioning)

### Feature 12: IRL Events
- "Golem Connections Live" — curated in-person meetups
- Everyone computes their profile before attending
- Name tags show HD type + Enneagram number (optional)
- GOLEM suggests conversation starters based on group dynamics
- Post-event: "Your Golem interacted with 12 people tonight. 3 are worth connecting with."

---

## Matching Algorithm (Updated)

### Composite Score (0-100)

```
framework_score = (
  hd_compatibility       * 0.20 +
  enneagram_growth       * 0.15 +
  gene_keys_complement   * 0.15 +
  synastry_aspects       * 0.15 +
  numerology_harmony     * 0.10 +
  chinese_element_balance * 0.05 +
  mayan_kin_relation     * 0.05 +
  love_language_match    * 0.05 +
  dosha_balance          * 0.03 +
  career_complement      * 0.04 +
  archetype_pairing      * 0.03
)

visual_score = attraction_model.predict(candidate_photo) // 0-1

final_ranking = framework_score * 0.85 + (visual_score * 100) * 0.15
```

Framework always dominates. Visual preference is a tiebreaker within compatible matches, never the driver.

### Score Labels
- **85-100:** "Profound Pattern Match"
- **70-84:** "Deep Resonance"
- **55-69:** "Creative Tension"
- **40-54:** "Challenge Match"
- **Below 40:** Hidden unless explicitly requested

---

## Revenue Contribution

### Connections Monetization
| Feature | Tier | Revenue Impact |
|---------|------|---------------|
| See that matches exist | Free | Conversion hook |
| Full compatibility narrative | Pro | Core Pro value |
| Golem-to-Golem conversations | Pro | Daily engagement driver |
| Express interest + photo reveal | Pro | The unlock moment |
| AI attraction training | Pro | Unique retention feature |
| Golem.md export | Pro | Portable identity value |
| Relationship weather (ongoing) | Pro | Long-term retention |
| Shadow Date | Pro (add-on?) | Growth-oriented feature |
| Time Machine | Pro | Premium AI feature |
| Constellation Mode | Pro | Network visualization |
| Golem Groups (non-romantic) | Pro | Expands TAM beyond dating |
| IRL Events | Premium ticket | Future revenue stream |
| Golem Marketplace | Commission | Creator economy |

### Why This Drives $1M ARR
- Dating is the highest-LTV consumer subscription category
- "Train your Golem" creates a personalization investment users won't abandon
- Golem.md export makes GOLEM the identity layer for other AI tools
- Golem-to-Golem interactions create daily return habit without user effort
- Non-romantic matching (friends, co-founders) expands addressable market 10x

---

## Phase Plan (Updated)

### Phase 2 (Weeks 5-10): Connections MVP
- Basic matching algorithm (top 5 frameworks)
- Anonymous pattern cards
- Mutual interest → photo reveal
- Golem.md export (full raw)
- Simple chat with context sidebar

### Phase 3 (Weeks 11-18): Intelligence Layer
- Full 22-framework scoring
- Golem-to-Golem conversations (AI-simulated)
- AI attraction training (swipe on AI faces)
- Photo enhancement with HD type borders
- Network dashboard + metrics
- "Ask GOLEM about us" in-chat

### Phase 4 (Weeks 19-30): Social + Scale
- The Feed (anonymized wildest conversations, network insights)
- Shadow Date feature
- Time Machine (relationship over time)
- Constellation Mode (relationship network visualization)
- Golem Groups (non-romantic matching)
- IRL Events infrastructure

### Phase 5 (Months 12+): Platform
- Golem Marketplace
- Voice of Your Golem
- Advanced photo AI (constellation overlays, cosmic portraits)
- Practitioner-facilitated matchmaking
- White-label Connections API for other platforms
