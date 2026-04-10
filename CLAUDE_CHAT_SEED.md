# GOLEM — AI Business Partner Seed Document

## What is GOLEM?

GOLEM is a self-knowledge and relationship intelligence platform that integrates 22+ symbolic frameworks — astrology, Human Design, Gene Keys, Kabbalah, Mayan calendar, numerology, Enneagram, MBTI, Ayurvedic doshas, Chinese astrology, Egyptian calendar, Tibetan astrology, Vedic astrology, love languages, archetypes, career alignment, pattern recognition, gematria, Sabian symbols, Arabic parts, and more — into a single unified interface powered by AI.

Think of it as the "operating system for the inner life." Instead of going to 10 different apps or practitioners for different frameworks, GOLEM computes all of them simultaneously from a single birth profile and shows how they intersect, contradict, and deepen each other.

---

## Core Architecture

**Stack:**
- Frontend: React + Vite + Zustand (state persistence)
- Backend: Supabase (Postgres + Auth + Edge Functions)
- AI: Anthropic Claude (routed through Supabase edge functions in production)
- Deployment: Vercel
- GitHub repo: `gf-both/golem-app` (private)

**Local path:** `/Users/gastonfrydlewski/Documents/GOLEM`

**Current live URL:** `aether-app-ten.vercel.app` (Vercel project in process of being renamed to golem-app)

---

## What's Already Built

### 22 Computation Engines (src/engines/)
All written from scratch in pure JS, using `astronomy-engine` for ephemeris:
- `natalEngine` — Sun, Moon, Rising, MC, house cusps (tropical)
- `hdEngine` — Full Human Design chart: type, profile, authority, definition, channels, centers, incarnation cross
- `geneKeysEngine` — Hologenetic Profile (Life's Work, Evolution, Radiance, Purpose)
- `numerologyEngine` — Life Path, Expression, Soul Urge, Personal Year, etc.
- `mayanEngine` — Tzolkin (day sign + tone), Haab, Long Count, kin number
- `chineseEngine` — Year/Month/Day/Hour animal, element, stem/branch (Four Pillars)
- `vedicEngine` — Jyotish (sidereal), nakshatras, dashas
- `tibetanEngine` — Tibetan year animal, element
- `egyptianEngine` — Egyptian decanic calendar
- `kabbalahEngine` — Sephirot mapping, Tree of Life path
- `gematriaEngine` — Hebrew gematria of name
- `synastryEngine` — Compatibility scoring between two charts
- `compatibilityEngine` — Multi-framework compatibility analysis
- `doshaEngine` — Ayurvedic Prakriti (Vata/Pitta/Kapha)
- `archetypeEngine` — Jungian archetypes from chart patterns
- `patternEngine` — Cross-framework pattern detection
- `careerAlignmentEngine` — HD + numerology + enneagram career match
- `loveLangEngine` — Love language from chart patterns
- `arabicPartsEngine` — Arabic parts (Part of Fortune, etc.)
- `sabianEngine` — Sabian symbols for each degree
- `fixedStarsEngine` — Nearest fixed star conjunctions
- `golemEngine` — The meta-synthesis engine

### UI Pages
- **Dashboard** — Main hub with 20+ widget cards. Clicking any card opens its detail panel. Includes drag-to-reorder widget grid.
- **Identity Agent** — AI synthesis of all 21 frameworks into one coherent identity narrative (6 sections: Life Mission, Shadow Patterns, Relationship Style, Career Alignment, Energy Architecture, The Through-Line)
- **Relationship Agent** (Watercooler/Fishbowl) — Multi-person dynamic: year 1/2/3 predictions based on Enneagram shadow/gift evolution, relationship patterns
- **Life Direction Agent** — Timeline + personal year arc analysis
- **Golem Connections** (DatingPage) — Compatibility matching between users (UI redesign pending)
- **Golem Simulation** — Constellation dialogue: AI conversations between archetype representations of people
- **Practitioner Portal** — For therapists/coaches to run multi-client sessions
- **AI Agents Page** — Hub for all AI-powered tools
- **Settings** — Profile management, widget ordering, theme
- **Company / Pricing / Client Portal** — B2B and subscription pages (scaffolded)

### Widget Detail Panels (src/components/details/)
Each framework has a full detail panel:
- HD Detail: Ravechart bodygraph, Mechanics tab, Variables & PHS tab
- Gene Keys Detail: Hologenetic profile wheel, shadow/gift/siddhi
- Numerology Detail: Core numbers + personal year calendar
- Mayan Detail: Tzolkin wheel, Long Count, Haab
- Natal Detail: Natal wheel with aspects, house interpretations
- Transits Detail: Live transit table updating per profile switch
- Chinese Detail: Four Pillars, year/month/day/hour animals
- Dosha Detail: Vata/Pitta/Kapha bars + Tridoshic support
- Enneagram Detail: Wing, instinct, shadow/gift/wound
- MBTI Detail: 16 types + cognitive functions
- Love Language Detail: Primary/secondary breakdown
- Kabbalah Detail: Tree of Life path
- Pattern Detail: Cross-framework shadow pattern detection
- Career Alignment Detail: HD type + numerology + Enneagram match
- Timeline Detail: Major life periods with vedic dashas
- Archetype Detail: Jungian shadow/light archetypes
- Synastry Detail: Two-chart overlay + compatibility score

### State Management (Zustand)
- `primaryProfile` — your own birth profile (computed on first load from seed data)
- `people` — array of people you've added (family, friends, partners)
- `activeViewProfile` — which profile is currently being viewed
- `widgetOrder` — user-customized dashboard card order
- Store key: `golem-store` (localStorage persist)

### AI Layer (src/lib/ai.js)
Priority fallback chain:
1. Ollama (local, only on localhost)
2. Supabase edge function `ai-chat`
3. Direct Anthropic API key (dev fallback)

All AI calls return null gracefully when no backend is configured — no crashes.

---

## Current Known Issues / In Progress

- Vercel project URL still showing as `aether-app-ten.vercel.app` (renamed in dashboard but old URL persists — Vercel keeps both active)
- HD Profile calibration: Gaston correctly shows 3/5. Mariquel hardcoded to 2/4 (engine offset gives wrong line for her birth date). Full calibration needs a third known chart.
- Golem Connections section needs full redesign (compatibility layers, matching UI, user-to-user interaction)
- No real-time multi-user features yet (Supabase realtime not wired up)
- Supabase edge function `ai-chat` needs to be deployed with Anthropic key for AI to work in production

---

## What the Business Needs to Be

### The Product Vision
GOLEM is not a horoscope app. It's an inner-life operating system. The difference:
- **Horoscope apps**: Give you pre-written content for your sun sign
- **GOLEM**: Computes a unique, mathematically derived profile across 22 systems, then uses AI to synthesize contradictions, name patterns, and generate personalized insight that no human practitioner could hold simultaneously

### Target Users
1. **Self-discovery seekers** — people who use multiple apps (Co-Star, Bazi, Gene Keys book, HD generator) and want everything in one place
2. **Coaches and therapists** — practitioners who want a multi-framework client intelligence tool (Practitioner Portal)
3. **Couples and relationship explorers** — synastry, compatibility, shadow/gift dynamic mapping
4. **Spiritual entrepreneurs** — people building their personal brand around their archetype/profile

### Revenue Model
- **Freemium**: Compute your profile free, lock AI synthesis behind subscription
- **Pro**: Full AI agents (Identity, Relationship, Life Direction), unlimited people, practitioner tools
- **Practitioner tier**: Client management, session notes, multi-client profiles
- **White label**: License the engine to other apps (later)

### Differentiation
- **Depth**: No competitor has 22 working computational engines in one place
- **AI synthesis**: Not "here's your Gene Keys" but "here's how your Gene Key 41 shadow of Fantasizing connects to your Enneagram 4's wound of Deficiency and your Projector strategy's bitterness"
- **Relational intelligence**: The fishbowl/watercooler multi-person dynamic doesn't exist anywhere else
- **Privacy-first**: All computation is local/edge, no birth data sent to third parties

---

## Access Credentials Needed (for AI assistant to operate fully)

### GitHub
- **Repo**: `https://github.com/gf-both/golem-app`
- **Access needed**: Read/write to main branch, ability to create branches and PRs
- **How to grant**: Add collaborator or use fine-grained PAT with `contents:write` scope

### Vercel
- **Project**: `golem-app` (being renamed from `aether-app-ten`)
- **Access needed**: View deployments, read env vars, trigger deploys
- **How to grant**: Team member invite, or Vercel API token scoped to project

### Supabase
- **Project**: Needs to be set up / renamed to GOLEM
- **Access needed**:
  - Database: read/write to `profiles`, `people`, `sessions` tables
  - Edge Functions: deploy and invoke `ai-chat` function
  - Auth: view users
- **How to grant**: Service role key (keep secure) + project URL + anon key
- **Edge function needs**: Anthropic API key as Supabase secret (`ANTHROPIC_API_KEY`)

### Anthropic API
- **Model in use**: `claude-haiku-4-5` for speed/cost, `claude-sonnet-4-6` for synthesis quality
- **How to grant**: Add API key to Supabase secrets (not in frontend code)
- **Usage pattern**: ~1200 tokens per synthesis call, ~400 tokens for quick reads

### Local Dev Environment
- **Path**: `/Users/gastonfrydlewski/Documents/GOLEM`
- **Run**: `npm run dev` (Vite dev server, port 5173)
- **Build**: `npm run build` → output to `dist/`
- **Deploy**: `git push origin main` → Vercel auto-deploys

---

## Key Files to Know

```
src/
  data/primaryProfile.js    ← DEV SEED profiles (Gaston + Mariquel) — remove for production
  engines/hdEngine.js       ← Human Design computation (HD_OFFSET=301.0625)
  engines/natalEngine.js    ← Natal chart (ASC fix: MC-relative quadrant correction)
  hooks/useActiveProfile.js ← computePersonData(), useComputedProfile()
  store/useGolemStore.js    ← Zustand store, key: 'golem-store'
  lib/ai.js                 ← AI routing (Ollama→Supabase→Anthropic fallback chain)
  lib/supabase.js           ← Supabase client
  pages/Dashboard.jsx       ← Main app shell, widget grid, detail panels
  pages/IdentityAgent.jsx   ← "Who Am I Really?" synthesis page
  pages/WatercoolerPage.jsx ← Relationship fishbowl, year predictions
  pages/DatingPage.jsx      ← Golem Connections (needs redesign)
vercel.json                 ← Cache headers (no-cache on index.html)
```

---

## What to Build Next (Priority Order)

1. **Golem Connections redesign** — Compatibility analysis at multiple levels (astro, HD, Enneagram, numerology), match scoring, "connection request" social layer, engagement hooks
2. **Supabase persistence** — Save profiles to DB, sync across devices, auth with Google
3. **Subscription + payments** — Stripe integration for Pro tier
4. **HD engine calibration** — Third known chart needed to validate HD_OFFSET, profile line boundary precision
5. **Practitioner Portal completion** — Client list, session notes, multi-client AI briefing
6. **Mobile responsiveness** — Currently desktop-first layout needs responsive redesign
7. **Onboarding flow** — Guided first-run: enter birth data → show wow moment → upsell Pro

---

## Tone and Philosophy

GOLEM is built for people who take their inner life seriously — not astrology meme consumers. The language is precise, respectful of the frameworks, never dumbed down. Think: what a deeply knowledgeable practitioner who holds 22 frameworks simultaneously would say to their most serious client.

The AI synthesis is NOT:
- Generic sun-sign content
- Positive affirmation pablum
- Safe and non-specific

It IS:
- Specific to the actual computed data (your Gate 41.3, not "as a Projector generally...")
- Shadow-aware (names the wound, the coping pattern, the relational friction)
- Integrative (shows how framework A and framework B point to the same underlying pattern)
- Growth-oriented (what to move toward, not just what you are)
