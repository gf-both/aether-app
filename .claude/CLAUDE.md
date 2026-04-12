# GOLEM — Company & Agent Context

## What GOLEM Is
GOLEM is a self-knowledge and relationship intelligence platform. It integrates 22+ symbolic frameworks — astrology, Human Design, Gene Keys, Kabbalah, Mayan calendar, numerology, Enneagram, MBTI, Ayurvedic doshas, Chinese astrology, Egyptian calendar, Tibetan astrology, Vedic astrology, love languages, archetypes, career alignment, pattern recognition, gematria, Sabian symbols, Arabic parts, fixed stars, and a meta-synthesis engine — into a single unified interface powered by AI.

**Core premise:** Computation is the foundation, synthesis is the product. Any app can show you your sun sign. GOLEM computes your complete cosmic signature across 22 systems and uses AI to name the patterns that emerge when frameworks intersect, contradict, and deepen each other.

**Not a horoscope app.** An inner-life operating system.

## Revenue Target: $1M ARR ($83,333/month)

| Revenue Stream | Target MRR |
|---------------|-----------|
| Pro subscribers (3,000 × $12) | $36,000 |
| Practitioner subscribers (600 × $39) | $23,400 |
| White Label API (12 × $1,000 avg) | $12,000 |
| Practitioner client add-ons | $8,000 |
| Annual Pro plans | $4,125 |
| **Total** | **$83,525** |

**Timeline:** 18 months from Phase 1 launch.

## Team
| Name | Role | Decisions |
|------|------|-----------|
| Gaston Frydlewski | Founder / CEO / Sole Operator | Everything — product, pricing, launch, partnerships, capital |

## Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 7 + Zustand 5 + Tailwind 4 (CSS vars) |
| Backend | Supabase (Postgres + Auth + Edge Functions + RLS) |
| AI | Anthropic Claude (Haiku for speed, Sonnet for synthesis) |
| Deployment | Vercel (auto-deploy on push to main) |
| Payments | Stripe (integration in Phase 1) |
| Repo | `gf-both/golem-app` (private GitHub) |
| Local path | `/Users/gastonfrydlewski/Documents/GOLEM` |
| Live URL | `aether-app-ten.vercel.app` (renaming to golem-app) |

## Product Status: Alpha → Phase 1

### What's Production-Ready
- 22 computation engines (19 full, 3 quiz-based): 5,476 LOC of core IP
- Dashboard with 19 widgets, 23 detail panels, 24 canvas visualizations
- Supabase schema: 8 tables with RLS, auth triggers, indexes
- AI routing chain: Ollama → Supabase Edge → Anthropic fallback
- Build pipeline: Vite → dist/ → Vercel auto-deploy

### Critical Gaps (Blocking Revenue)
1. AI synthesis not connected in production (edge function needs Anthropic key)
2. No payments (Stripe scaffolded, not wired)
3. No onboarding flow (no guided first-run experience)
4. No shareable profile cards (viral loop missing)
5. URL still aether-app-ten.vercel.app

## Phase Plan

| Phase | Goal | Timeline | Exit Criteria |
|-------|------|----------|--------------|
| 1: Make It Work | Revenue loop ships | Weeks 1-4 | 10 strangers pay without help |
| 2: Make It Spread | Viral growth | Weeks 5-10 | 1,000 free users, 30 Pro |
| 3: Make It Stick | Practitioners adopt | Weeks 11-18 | 50 practitioners, $5K MRR |
| 4: Make It Scale | $1M ARR | Weeks 19-30 | $83K MRR |

## Agent Directory

9 agents in `.claude/agents/`. Each calibrated for the $1M ARR target.

### Business Agents
| Command | Agent | $1M Mandate |
|---------|-------|-------------|
| `/ceo` | CEO Orchestrator | Phase sequencing, weekly briefs, blocker removal, decision routing |
| `/product` | Product & Dev | Ship Phase 1 in 4 weeks. Zero scaffolded features in prod. Full codebase map. |
| `/marketing` | Marketing & Growth | 100K free users in 6 months. SEO dominance. Content engine. Viral loops. |
| `/finance` | Business & Finance | Stripe owner. Every dollar tracked. Monthly models. 96.7% margin target. |
| `/community` | Community & Support | 600 practitioners in 12 months. Practitioner community IS the business. |
| `/launch` | Launch & Operations | Waitlist, beta program, launch execution, analytics, email sequences. |

### Creative & Product Agents
| Command | Agent | Mandate |
|---------|-------|---------|
| `/ui` | UI Expert | Visual identity, interface design, dark cosmic aesthetic, component specs, responsive strategy |
| `/copy` | Copywriter | Every word GOLEM puts in front of users — headlines, microcopy, emails, AI prompts, CTAs |
| `/connections` | Connections PO | Golem Connections (dating/matching) — product vision, matching algorithm, user flows, photo enhancement |

### How to Use an Agent
1. Open Claude Code or Cowork in this repo
2. Reference the agent: `@agents/marketing-growth.md`
3. Or use the command shortcut: `/marketing`

### Agent Coordination
- `/ceo` orchestrates all agents and sets weekly priorities
- Marketing requests needing code → `/product`
- Revenue questions → `/finance`
- User feedback → `/community`
- Launch readiness → `/launch`
- UI/visual decisions → `/ui`
- Copy review → `/copy`
- Connections features → `/connections` → `/product` for implementation
- Cross-domain decisions → `/ceo` → Gaston if needed

## Voice & Tone
- Precise, not mystical-fluffy
- Framework-literate — correct terminology always
- Shadow-aware — name the wound, the pattern, the friction
- Integrative — show how frameworks connect
- Never: "horoscope," "zodiac vibes," "the stars say," "manifest"
- Always: pattern, synthesis, architecture, computation, framework intelligence

## Key Files
```
src/
  engines/          # 22 computation engines (CORE IP)
  pages/            # 18 pages (Dashboard, IdentityAgent, Watercooler, Dating, Practitioner, etc.)
  components/       # 79 components (canvas/, details/, ui/, overlays/, auth/, practitioner/)
  hooks/            # useActiveProfile, useComputedProfile
  store/            # useGolemStore.js (Zustand, key: golem-store)
  lib/              # ai.js (routing chain), supabase.js, stripe.js
  data/             # primaryProfile.js (DEV SEED — remove for prod)
supabase/
  migrations/       # 001_initial.sql (8 tables, RLS, triggers)
  functions/        # ai-chat/index.ts, image-gen/index.ts
docs/               # Benchmarks, personality standards, marketplace specs
```

## Context Self-Audit
After completing any substantial task:
1. Did product facts change? → Update this file
2. Did an agent need info it didn't have? → Update that agent's `.md`
3. Did the roadmap shift? → Update priority order here + `/ceo`
4. Did pricing or revenue model change? → Update `/finance` + this file
5. Did we hit a phase milestone? → Update phase status everywhere
