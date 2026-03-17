# UX Overhaul Plan — Above + Inside (Golem App)
*Senior UX/UI Assessment — March 2026*

---

## 1. Executive Summary

- **The app is technically impressive but UX-unfinished**: 14+ beautiful canvas charts exist, but there's no onboarding, no empty states, no user journey — a new visitor is dropped into a dense cosmic dashboard pre-loaded with Gaston's hardcoded data.
- **Navigation architecture is fractured**: Sidebar (desktop icon rail) + TopBar hamburger create two competing navigation systems; mobile is completely unaddressed (sidebar icons are tiny, no bottom nav).
- **Cognitive overload is the dominant UX problem**: All frameworks shown simultaneously with no hierarchy, no "start here," no progressive disclosure — the app feels complex rather than empowering.
- **Conversion infrastructure is weak**: The Pricing page is buried as a nav item, upgrade moments are absent from the user flow, and the $1.99 Explorer tier is dramatically underpriced for its value.
- **AI Chat is the killer feature — and it's a stub**: The Claude integration is canned responses behind a paywall pop-up; this is the most differentiating feature and needs to be the hero, not a hidden premium add-on.

---

## 2. Critical Issues (Must Fix Before Launch)

### Issue 1 — No Onboarding / Empty State
**Severity: Launch Blocker**

A new user who signs up sees pre-loaded data for "Gaston Frydlewski." There is no onboarding screen, no "enter your birth data" moment, no explanation of what the app does. First-time users will be confused or creeped out by someone else's data.

**Fix**: Gate the dashboard behind a lightweight onboarding flow (3 steps: name + birthday + what interests you most). Use empty states that explain each widget's value before data is entered.

---

### Issue 2 — Widget Drag/Drop is Completely Undiscoverable
**Severity: Launch Blocker**

The widget reorder feature exists (Zustand store has `widgetOrder`, `setWidgetOrder`) but there is no visual affordance — no drag handles, no shake-mode, no tooltip, nothing. Users will never find it.

**Fix**: Add a subtle grip icon (⠿) on hover for each widget card. Show a one-time tooltip ("Drag to reorder") on first dashboard load. Or simplify: replace drag-drop with a visible Widget Manager modal that lists frameworks with toggle + reorder arrows.

---

### Issue 3 — Double Navigation System Creates Confusion
**Severity: High**

The sidebar (icon rail, desktop only) and the TopBar hamburger menu both list all 20+ sections. They behave differently (sidebar can toggle detail views, hamburger just jumps). This creates a confusing mental model: "Am I using the sidebar or the hamburger?"

**Fix**: Consolidate. On desktop: sidebar is primary nav. Hamburger disappears or becomes "Quick Jump" only for deep links. On mobile: sidebar hides, hamburger becomes bottom-sheet nav.

---

### Issue 4 — Hardcoded / Demo Data with No Clear Indication
**Severity: High**

All profile data (Gaston's birth chart, transits, HD bodygraph) is hardcoded in `primaryProfile.js`. The TopBar shows real-looking data (specific planetary degrees, transit percentages) that will be wrong for any other user.

**Fix**: Engines exist and are real (natalEngine, hdEngine, etc.) but birth data entry doesn't recalculate charts. Connect the Profile panel's "Save" to a recalculation trigger. Until then, show a banner: "Using demo data — add your birth info to see your chart."

---

### Issue 5 — Mobile is Non-Functional
**Severity: High**

The layout uses CSS Grid with a fixed sidebar column and fixed card heights (440px). On any screen under 900px wide, everything breaks. The canvas charts don't resize gracefully. The TopBar chips overflow on small screens.

**Fix**: Implement mobile-first layout: hide sidebar, show bottom navigation, stack cards vertically, make canvas charts height-responsive to viewport.

---

## 3. Navigation & IA Redesign

### Current Structure (Broken)
```
Sidebar (icon rail) ──→ 20+ items, no grouping, scrolls
TopBar hamburger ──────→ same 20+ items, duplicate
TopBar chips ──────────→ some framework data shortcuts
```

### Proposed New Structure

```
PRIMARY NAVIGATION (5 destinations max):
  🏠  Home (Dashboard overview)
  ✨  My Charts (framework selector)
  🤖  AI Guide (chat + insights)
  👥  People (profiles + synastry)
  ⚙️  Settings (pricing, account)

SECONDARY (inside My Charts):
  ┌─ Western Astrology ──→ Natal, Transits, Vedic
  ├─ Energy Systems ─────→ Human Design, Gene Keys, Kabbalah
  ├─ Numerology & Cycles → Numerology, Mayan, Egyptian
  ├─ Personality ────────→ Enneagram, MBTI, Chinese Zodiac, Patterns
  └─ Meta & Synthesis ───→ Integral Map, Gematria, Synastry
```

### Desktop: Icon Sidebar (Revised)
- Keep icon rail but reduce to 5 primary icons
- Group indicator (colored dot) shows which category is active
- Hovering expands to show category label inline (not just tooltip)
- Bottom: Profile avatar + Settings gear

### Mobile: Bottom Navigation
- 5-tab bottom bar: Home | Charts | AI | People | More
- "More" opens a sheet with all 14+ framework names
- No sidebar on mobile

### Framework Category Grouping
Each framework gets a category tag: `western` | `energy` | `numerology` | `personality` | `meta`

The dashboard can then filter/group by category. Users can tap "Energy Systems" to see only HD, Gene Keys, and Kabbalah side-by-side.

---

## 4. Onboarding Flow Redesign

### The Problem
There is zero onboarding. The app immediately shows 14 charts with someone else's data.

### Proposed 4-Step Onboarding

**Step 0 — Splash (optional, 2 seconds)**
> Full-screen: animated starfield, "Above + Inside" wordmark, tagline "Your complete cosmic blueprint."
> [Begin →] button

---

**Step 1 — Tell Us About You**
```
┌─────────────────────────────────────────────┐
│  ✨ Let's build your cosmic blueprint        │
│                                             │
│  Your Name                                  │
│  [________________________]                 │
│                                             │
│  Date of Birth                              │
│  [Jan ▾] [23 ▾] [1981 ▾]                   │
│                                             │
│  Time of Birth (optional — helps accuracy)  │
│  [10:10 PM ▾]  ℹ️ Why does this matter?     │
│                                             │
│  Place of Birth                             │
│  [Buenos Aires, Argentina___]  🔍           │
│                                             │
│  [Continue →]                               │
└─────────────────────────────────────────────┘
```

**Trust-building micro-copy**: "We calculate everything locally in your browser. Your birth data never leaves your device."

---

**Step 2 — What Interests You Most?** (helps prioritize dashboard)
```
┌─────────────────────────────────────────────┐
│  What draws you to self-discovery?          │
│  (Select all that apply)                    │
│                                             │
│  ☽ Astrology & Planets                      │
│  ◈ Human Design & Energy                   │
│  ∞ Numerology & Patterns                   │
│  ☯ Eastern Systems                          │
│  🧠 Personality Types (MBTI/Enneagram)      │
│  🌀 All of the above                        │
│                                             │
│  [Back] [Continue →]                        │
└─────────────────────────────────────────────┘
```

**Purpose**: Personalize which frameworks appear first on the dashboard. Also feeds AI Guide with context.

---

**Step 3 — Quick Preview**
> Show an animated preview of their natal wheel calculating in real-time.
> Display: "You are [Sign], Rising [Asc], Moon in [Moon]"
> Show 2-3 other quick facts (HD type, Life Path, Mayan sign)
```
┌─────────────────────────────────────────────┐
│  🌟 Your Blueprint is Ready                  │
│                                             │
│  ♒ Aquarius Sun  ♍ Virgo Rising            │
│  ♍ Virgo Moon    Life Path 7               │
│                                             │
│  You're a Projector (Human Design)          │
│  Your Mayan sign is Blue Storm              │
│                                             │
│  [Explore Your Full Blueprint →]            │
└─────────────────────────────────────────────┘
```

---

### Trust-Building Moments Throughout
- "Calculated in your browser" badge on Step 1
- "No credit card required" in footer
- Link to privacy policy on data collection step
- Tooltip explaining why birth time matters (improves Ascendant, House accuracy)

### Progressive Disclosure
- Time of birth: optional (gray asterisk, not required)
- Place of birth: can be approximate city name initially
- MBTI/Enneagram: prompt these only when user clicks those sections (quiz flow already exists)
- Advanced features (Synastry, Practitioner): only revealed after basic setup complete

---

## 5. Dashboard Redesign

### Current Problems
- 14+ widgets shown simultaneously at 440px height each = ~6,000px of scrolling
- All categories mixed together (natal wheel next to gematria next to MBTI)
- No "start here" entry point
- No hierarchy of importance
- Empty states are absent

### Proposed Dashboard Architecture

#### View 1: Overview (Default, First Tab)
Shows the 4 most important insights across all systems:

```
┌─────────────────────────────────────────────────┐
│ TODAY'S COSMIC WEATHER                          │
│  🌞 Sun Trine Moon — excellent creative flow    │
│  ♄ Saturn entering your 7th house (12 days)    │
│                                                 │
│ YOUR ESSENCE (Key facts, 2-col grid)            │
│  ♒ Aquarius Sun     ◈ Projector (HD)           │
│  ♍ Virgo Rising     ∞ Life Path 7              │
│  ♍ Virgo Moon       🌀 Gene Keys 41/31         │
│                                                 │
│ ACTIVE TRANSIT SPOTLIGHT                        │
│  [NatalWheel focused on current transits]       │
│                                                 │
│ AI INSIGHT OF THE DAY                           │
│  "Your 3/5 Projector profile is in an          │
│   inviting season right now..."  [Ask more →]  │
└─────────────────────────────────────────────────┘
```

#### View 2: Category Tabs
Five tabs across top: `Overview | Western | Energy | Numerology | Personality`

**Western tab**: Full-size Natal Wheel → Transit tracker → Vedic (collapsible)
**Energy tab**: Human Design bodygraph (large) → Gene Keys wheel → Kabbalah tree
**Numerology tab**: Numerology grid → Mayan wheel → Egyptian → Gematria
**Personality tab**: Enneagram → MBTI → Chinese Zodiac → Patterns web

Each tab shows its frameworks at natural size with proper spacing.

#### View 3: Full Grid (Power User Mode)
Current dense grid, but with:
- Category row headers with color coding
- Proper empty states
- Reduced default height (300px instead of 440px) with "expand" affordance

### Empty State Design
When no birth data is entered, each widget shows:
```
┌──────────────────────┐
│                      │
│    ♒                │
│                      │
│ Add your birth date  │
│ to reveal your       │
│ Natal Chart          │
│                      │
│  [Add Birth Data]    │
└──────────────────────┘
```

### Mobile Dashboard Layout
- Single column, scroll vertically
- "Overview" card at top (always visible, 280px height)
- Swipeable category sections below
- Each framework = collapsible card (taps to expand)
- Canvas charts scale to screen width

---

## 6. AI Chat Experience Design

### Current State
- Canned responses (random rotation from 8 pre-written strings)
- Full-screen overlay modal
- Paywall for free users
- Good suggested prompts

### Ideal AI Chat Architecture

#### System Prompt Strategy
When calling Claude, inject full profile context:
```
You are an AI consciousness guide for {name}. Here is their complete profile:

WESTERN ASTROLOGY:
- Sun: {sign}, Moon: {moon}, Rising: {asc}
- Current transits: [list active aspects]

HUMAN DESIGN:
- Type: {hdType}, Profile: {hdProfile}
- Authority: {hdAuth}, Definition: {hdDef}

NUMEROLOGY:
- Life Path: {lifePath}, Expression: {expression}

GENE KEYS:
- Incarnation Cross: {crossGK}
- Activation Sequence keys: [...]

MAYAN/CHINESE/ENNEAGRAM:
[if available]

USER'S CURRENT QUESTION/CONTEXT:
[last 3 messages for continuity]

Guidelines:
- Be specific to their data, not generic
- Reference multiple frameworks when relevant
- Offer follow-up questions
- Depth over breadth
- Warm but not sycophantic
```

#### UI Pattern: Persistent Side Panel (Not Modal)
Instead of a full-screen overlay, make AI Guide a **resizable right-panel** that stays open while the user explores charts. This enables:
- User asks a question → sees the relevant chart answer on the left
- "Show me my HD bodygraph while you explain my authority" → chart + explanation side by side

```
┌──────────────────┬────────────────────┐
│   NATAL WHEEL    │  AI GUIDE          │
│                  │                    │
│   [chart]        │  You asked about   │
│                  │  your Moon...      │
│                  │                    │
│                  │  💬 Ask follow-up  │
└──────────────────┴────────────────────┘
```

#### Proactive Insights (Not Just Reactive Chat)
Show a daily insight card on the dashboard, not just in the chat:
- "Today: Mercury trine your natal Moon — good for communication. Ask me more →"
- "This week: You're entering a 9-day emotional wave bottom (HD authority). What does this mean? →"

#### Suggested Prompts (Context-Aware)
Current: 4 static prompts.
Improved: Generate 3 contextual suggestions based on active transits and current date:
```
Given today is March 15, 2026 and Saturn is approaching their 7th house:
→ "What does Saturn transiting my 7th house mean for relationships?"
→ "How does my 3/5 Projector profile handle Saturn transits?"
→ "Is this a good time to start a new relationship?"
```

#### "Ask Your Chart" Feature Spec
- **Trigger**: Tap any element in any canvas chart (planet, sephira, gate, hexagram)
- **Behavior**: Chat opens with pre-filled context: "Tell me about [Venus in Sagittarius, 2nd house] in my chart"
- **Implementation**: Each canvas chart emits `onElementClick(element, context)` event that the AI panel subscribes to

---

## 7. Practitioner Mode UX

### Current State
The PractitionerPortal.jsx has excellent mock data structure: client list, session history, follow-ups, referral network. But it's all in a single scrolling page with no workflow.

### Proposed Practitioner Workflow

#### Pre-Session Flow
1. **Client List** → tap client → see their mini-profile + last session summary
2. **Load Chart** → opens their chart view (all frameworks) in a focused mode
3. **Session Notes** → side panel with notes + action items from last session

#### During-Session Mode (New)
A **Session Mode** that:
- Shows client's chart full-screen (left) + notes/insights (right)
- Can switch between frameworks with single tap
- Records session notes in real-time
- AI assistant available for "explain this gate to me in 30 seconds"

```
[Session with: Elena Vasquez]  [⏱ 0:23]  [End Session]
┌─────────────────────┬──────────────────────────────┐
│  ELENA'S CHARTS     │  SESSION NOTES               │
│  [Switch framework] │  • Working on Gate 41 shadow  │
│                     │  • Mentioned financial blocks  │
│  [HD Bodygraph]     │                               │
│                     │  AI SUGGESTION:               │
│  ← Natal  Kabbalah→│  "Gate 41 shadow = Contraction│
│                     │   Ask: where do you feel the  │
│                     │   most resistance right now?" │
└─────────────────────┴──────────────────────────────┘
```

#### Synastry / Comparison View
- Tap client → "Compare with me" option
- Shows split view: practitioner (left) vs client (right) for any framework
- Overlay mode shows compatibility aspects highlighted
- Current `SynastryPanel.jsx` exists but needs clearer entry point

#### Report Generation
After session:
1. Auto-summarize session notes with AI
2. Generate PDF report with:
   - Client's key chart details (chosen frameworks)
   - Session summary
   - Action items
   - Next session recommendations
3. Send via WhatsApp (integration stub exists in `services/whatsapp.js`)

#### Client Portal (Client-Facing)
The `ClientPortal.jsx` exists. Clients should see:
- Their chart(s) shared by practitioner
- Session summaries (read-only)
- Recommended reading/resources
- Ability to ask the AI guide about their own chart

---

## 8. Component-Level Improvements

### Sidebar
**Current issues:**
- 20+ icon items with no grouping
- Tooltip-only labels (8px font, hard to read)
- Duplicate of TopBar hamburger menu
- Pricing and AI Guide mixed with frameworks

**Changes:**
1. Reduce to 5 primary icons: Home, Charts, AI Guide, People, Settings
2. "Charts" icon expands to category flyout: Western | Energy | Numerology | Personality | Meta
3. Remove Pricing from nav — surface it contextually (upgrade prompts)
4. Active indicator: colored left border matching category color
5. Bottom section: Profile avatar (with initials fallback), Settings
6. Add tooltips with full labels (current 8px font is too small — increase to 10px minimum)

### TopBar
**Current issues:**
- Too much information density: brand + profile switcher + layout switcher + 5 chips + theme + widget manager + clock
- Chips show hardcoded values (Tiphareth 13/8, Martyr/Heretic)
- Profile switcher drops user names if truncated

**Changes:**
1. Move Layout Switcher to a more obvious dashboard control (floating button or header)
2. Chips: show only 3 most important (Sun/Moon/Rising, HD type, Life Path) — hide others behind "more"
3. Fix hardcoded "Martyr/Heretic" and "Tiphareth 13/8" — pull from engines
4. On mobile: collapse to just brand + profile avatar + hamburger

### Dashboard
**Changes:**
1. Add tab bar at top: Overview | Western | Energy | Numerology | Personality
2. Reduce default card height from 440px to 320px (expand affordance on click)
3. Row headers: make them sticky on scroll
4. Add category color coding on each card's left border
5. Add empty state for each widget when no birth data
6. "Drag to reorder" hint on first load (one-time)
7. Layout switcher: make Grid/Bento/Focus more distinct with visual previews

### Detail Panels
**Current issues:**
- "Full Profile" header is generic — doesn't tell user what they're looking at
- No way to navigate between detail views without going back to dashboard
- Back button exists but isn't always visible

**Changes:**
1. Add breadcrumb: Dashboard > Western Astrology > Natal Chart
2. Previous/Next arrows to navigate between frameworks in same category
3. "Ask AI about this" button in each detail panel header
4. Share/Export button (chart as image, or brief summary to clipboard)
5. Make panel scrollable with sticky chart at top, interpretations below

### Overlay Panels (AI Chat, Profile, Synastry, Quizzes)
**Current issues:**
- All use fixed `680px` width with `94vw` clamp — too narrow on large screens
- Backdrop click closes them — can cause accidental dismissal
- Profile panel has no "did save" confirmation (saveFlash exists but may not be obvious enough)

**Changes:**
1. AI Chat: Make it a side panel (right-side drawer) not a centered modal
2. Profile Panel: Add a confirmation toast on save ("Profile saved ✓")
3. Synastry Panel: Improve the two-person selector UI
4. Add keyboard shortcut hint at bottom of each overlay (Esc to close)

### Pricing Page
**Current issues:**
- Buried as sidebar nav item (between "Patterns" and "AI Guide")
- "Most Popular" on $1.99 plan feels forced — it's very cheap
- "Coming Soon" appears on 6 of 9 Practitioner features — this undermines trust
- CTA for Free is "Current Plan" — no action, no upgrade nudge

**Changes:**
1. Surface upgrade prompts contextually: when free user tries to access locked features
2. Reframe "Coming Soon" as "In Development" or use a timeline: "Q2 2026"
3. Add social proof: "Join 1,200+ seekers" (or accurate number)
4. Free plan CTA: "Start Free → Upgrade anytime"
5. Practitioner plan: Add a "Book Demo" option for practitioners who want to see it first
6. Annual pricing toggle (saves ~20%) — increases commitment and LTV
7. Remove from sidebar; surface via upgrade prompts and Settings → Billing

---

## 9. Visual Design Direction

### Color System Audit
**Strengths:**
- The gold (#c9a84c) + deep purple + aqua palette is distinctive and premium
- Dark void background (#01010a) creates excellent contrast for glowing charts
- Color-coded chart elements (Design red / Personality blue in HD) are functional

**Issues:**
- CSS variables are mostly used but some components have hardcoded rgba values (makes theming brittle)
- Light theme implementation is incomplete (gaps in --light-* variables)
- Some text at 7-8px is below accessibility minimums (WCAG 2.1 requires min 12px for body)

**Recommendations:**
1. Systematize: `--color-[category]-[weight]` pattern for all colors
2. Semantic tokens: `--text-primary`, `--text-secondary`, `--text-muted`, `--border-subtle`, `--border-emphasis`
3. Minimum text: 11px for labels, 13px for body copy — never below
4. Category color tokens: `--western-color: #c9a84c`, `--energy-color: #9050e0`, `--numerology-color: #40ccdd`, `--personality-color: #d43070`
5. Light mode: warm cream (#f8f3e8) background instead of white — preserves mystical feel

### Typography Recommendations
**Current stack:**
- Cinzel (headings/labels) — excellent choice, sacred geometry feel
- Cormorant Garamond (body) — beautiful but 12px is too small for reading
- Inconsolata (monospace/data) — good for technical data

**Recommendations:**
1. Cinzel: keep for all titles and labels. Reduce letter-spacing in smaller sizes (current .18em at 10px is too wide)
2. Cormorant Garamond body text: minimum 14px for readable prose (currently 12px in chat bubbles)
3. Add a fourth face for UI elements: Inter or DM Sans — for buttons, chips, form labels
4. Establish a type scale:
   - `--text-xs: 10px` (Cinzel labels)
   - `--text-sm: 12px` (Inconsolata data)
   - `--text-base: 14px` (Cormorant body)
   - `--text-lg: 16px` (Cormorant paragraphs)
   - `--text-xl: 20-32px` (Cinzel headings)

### Motion/Animation Guidelines
**Current:** `fadeUp` and `panelIn` keyframes — good foundation.

**Add:**
1. **Chart entrance**: Natal wheel draws from center outward (SVG path animation, not just opacity). Each planet "arrives" with a brief pulse.
2. **Framework transitions**: When switching between frameworks, use a brief crossfade + scale (not instant). Duration: 200-250ms, easing: cubic-bezier(0.4, 0, 0.2, 1).
3. **Data loading shimmer**: When calculating charts, show animated shimmer placeholders.
4. **Hover micro-interactions**: Cards already have translateY(-4px) on hover — keep this. Add a subtle golden glow expansion.
5. **Reduce motion**: Honor `prefers-reduced-motion` — skip all entrance animations, use opacity only.

### Dark Mode Optimization
The app is natively dark — this is correct for the brand. Issues:
1. Some `rgba(255,255,255,.02)` backgrounds are nearly invisible — increase contrast
2. White borders at `.04` opacity disappear on some monitors — use `.08` minimum
3. Focus states (form inputs) need visible focus rings — currently missing
4. Canvas charts need to be tested on both AMOLED (true black) and LCD (dark gray) backgrounds

---

## 10. Mobile Strategy

### Which Frameworks Work on Mobile
**Good candidates for mobile:**
- Numerology (small number grid, works in single column)
- Transits (list view, scrollable)
- Enneagram (simple symbol, readable labels)
- MBTI (bars, clean layout)
- Gematria (text-heavy, single column)
- AI Chat (purpose-built for mobile interaction)

**Need redesign for mobile:**
- Natal Wheel (complex, needs at minimum 320px canvas — works on most phones)
- Human Design bodygraph (very dense, may need simplified mobile view)
- Kabbalah Tree (highly detailed, needs pinch-to-zoom)
- Gene Keys Wheel (circular, needs minimum 300px)
- Synastry Wheel (2 charts overlaid — challenging on mobile)

**Mobile-first recommendation for HD:**
- Show mobile-optimized "list view" by default (Design vs Personality columns as simple lists)
- Tap to see full bodygraph with pinch-to-zoom

### Bottom Navigation (Mobile)
```
┌─────────────────────────────────────────┐
│                                         │
│          [App Content Area]             │
│                                         │
├─────────────────────────────────────────┤
│  🏠    ✨    🤖    👥    ⚙️             │
│ Home Charts Guide People Settings      │
└─────────────────────────────────────────┘
```

Active tab: filled icon + gold underline.

### Touch Interactions for Canvas Charts
1. **Tap**: Opens tooltip/popover with element name and brief interpretation
2. **Double-tap**: Enters "focus mode" — single element highlighted, others dimmed
3. **Pinch-to-zoom**: On dense charts (HD, Kabbalah, Synastry)
4. **Long press**: "Ask AI about this" shortcut
5. **Swipe left/right**: Navigate between frameworks in same category

### Responsive Breakpoints
- `< 640px`: Mobile — bottom nav, single column, simplified charts
- `640–1024px`: Tablet — sidebar icon rail (narrower), 2-column grid
- `> 1024px`: Desktop — full sidebar, multi-column grid, side-by-side panels

---

## 11. Priority Roadmap

### Tier 1 — Do Now (Pre-Launch Blockers)

| Priority | Task | Effort |
|----------|------|--------|
| P0 | Onboarding flow (3-step birth data entry) | 3-4 days |
| P0 | Empty states for all widgets (no data entered) | 1-2 days |
| P0 | Remove hardcoded data as default — show "Demo Mode" banner | 2 hours |
| P0 | Mobile: bottom navigation + responsive card layout | 3-4 days |
| P1 | Consolidate navigation (sidebar primary, hamburger secondary on desktop) | 1 day |
| P1 | Fix min font size (7-8px labels → 11px minimum) | 4 hours |
| P1 | Widget drag affordance (add grip icon, or replace with visible widget manager) | 4 hours |
| P1 | AI Chat: move to side panel; inject real profile context into system prompt | 2 days |
| P1 | Pricing: remove from sidebar; add contextual upgrade prompts at lock gates | 1 day |

### Tier 2 — Do Next (First 30 Days Post-Launch)

| Priority | Task | Effort |
|----------|------|--------|
| P2 | Dashboard tab bar (Overview / Western / Energy / Numerology / Personality) | 2 days |
| P2 | Connect Profile save → recalculate charts via engines | 3 days |
| P2 | "Ask AI about this" tap target on canvas chart elements | 2 days |
| P2 | Breadcrumb navigation in detail views + prev/next framework | 1 day |
| P2 | Practitioner Session Mode (focused chart + notes side-by-side) | 3 days |
| P2 | Daily AI insight card on Overview dashboard | 1 day |
| P2 | Context-aware suggested prompts in AI chat | 2 days |
| P2 | HD mobile view: list mode + tap to see bodygraph | 2 days |
| P2 | Annual billing option on pricing (20% discount) | 4 hours |

### Tier 3 — Later (60-90 Days)

| Priority | Task | Effort |
|----------|------|--------|
| P3 | PDF report generation for practitioners | 1 week |
| P3 | Orbital / Magazine layout views (mockups exist) | 3 days |
| P3 | Chart entrance animations (draw-in, not just fade-up) | 2 days |
| P3 | Light mode completion | 2 days |
| P3 | Pinch-to-zoom on canvas charts (mobile) | 3 days |
| P3 | Synastry comparison view improvements | 2 days |
| P3 | Progress/journey tracking (which frameworks have you explored?) | 2 days |
| P3 | Shareable chart links (generate read-only URL for a chart) | 3 days |
| P3 | Social proof + testimonials on pricing page | 1 day |

---

## 12. Quick Wins (< 1 Hour Each)

1. **Add "Demo Mode" banner** — A dismissible banner at the top of the dashboard when using default data: "Viewing demo data · Add your birth info to see your chart →" (links to Profile panel)

2. **Increase minimum font size to 11px** — Global CSS change: replace all `font-size:7px`, `font-size:8px`, `font-size:9px` occurrences in detail panels and sidebar tooltips. Big accessibility win.

3. **Remove "Pricing" and "Practitioner" from sidebar nav items** — These don't belong in the same icon rail as frameworks. Surface Pricing via a subtle gold "✨ Upgrade" button at sidebar bottom. Practitioners can access their portal from Settings or a role indicator.

4. **Add keyboard shortcut hints** — In the AI Chat panel footer, add "Press Enter to send · Shift+Enter for new line". Small but makes the panel feel more polished.

5. **Fix hardcoded copy in TopBar chips** — "Martyr/Heretic" and "Tiphareth 13/8" appear to be hardcoded strings. Replace with dynamic values from profile store or clearly mark as demo.

6. **Add category badges to dashboard card headers** — Tiny pill badges: `WESTERN`, `ENERGY`, `PERSONALITY` etc. on each widget's `.ch` header. Takes 30 minutes, dramatically improves visual hierarchy.

7. **Improve AI Chat welcome message** — Current: generic intro. Better: personalize with profile data. "Welcome, Gaston. As an Aquarius Sun Projector with Life Path 7, your blueprint reveals..." (profile already available in component).

8. **Add "Upgrade" CTA to AI Chat paywall** — Current paywall just says "Upgrade to Explorer" — not a real button click, and no price. Make it a functional button that navigates to the Pricing page.

9. **Add a "Copy chart summary" button** to each Detail panel — A single button that copies a text summary (3-5 key facts) to clipboard. Requires no backend. Practitioners love this.

10. **Fix the TopBar active-profile-bar overflow on small screens** — The `apb-detail` text shows full birth data string and overflows on screens < 1200px. Add `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` with a max-width constraint.

---

## Appendix: Competitive Landscape Notes

### Co-Star
- Radical minimalism: white background, black text, no embellishment
- Narrative-first: everything expressed in prose sentences, not charts
- Daily horoscope is the hero — provides "reason to return daily"
- Onboarding: 5-step, collects birth data, explains why time matters

**Lesson**: A daily "reason to return" hook is essential. Golem lacks this. Daily transit insight on the dashboard would address this gap.

### The Pattern
- Long-form personality narrative as primary content
- "Patterns" = deep behavioral descriptions (not charts)
- Strong emotional resonance — users feel "seen"
- Freemium with aggressive upgrade moments

**Lesson**: Interpretive text matters as much as charts. Golem's charts are beautiful but interpretation is shallow. AI Guide should produce The Pattern-quality prose.

### Human Design Apps (Jovian Archive, Genetic Matrix)
- Information-dense, expert-oriented
- Not onboarding-friendly — assume prior knowledge
- Genetic Matrix is more visual but still complex
- No mobile optimization

**Lesson**: Golem is better than these in visual design. Golem should position as "HD for everyone" — approachable first, deep second.

### astro.com
- The gold standard for accuracy and data depth
- Completely technical UI — looks like 2003
- Zero personality or brand feel
- Professionals use it for data, not experience

**Lesson**: There is a clear gap in the market for beautiful, accurate astrology that doesn't sacrifice visual experience. Golem is on the right track. Execution of onboarding and discoverability is the missing piece.

### Sanctuary
- Mobile-first daily astrology content
- Push notifications as engagement driver
- Subscription-gated deeper content
- Modern UI but shallow on frameworks

**Lesson**: Mobile-first with push notifications drives retention. Golem should build mobile early, and consider weekly "cosmic briefing" notifications.

---

*Document generated: March 2026*  
*Next review: After Tier 1 implementation*
