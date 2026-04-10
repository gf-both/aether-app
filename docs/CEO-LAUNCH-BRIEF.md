# GOLEM CEO Launch Brief
**Date:** 2026-04-09
**Author:** CEO Orchestrator Agent
**Status:** Phase 1 — MAKE IT WORK

---

## Executive Summary

GOLEM has a genuinely differentiated product — 22 working computation engines, a comprehensive UI, and production-ready infrastructure. No competitor is close to this depth. The problem is not what's built. The problem is that **none of the revenue-generating features work in production yet**.

The codebase audit reveals an 80% complete product that is 0% monetizable. The four blockers are: no AI synthesis in production, no payments, no onboarding flow, and no sharing mechanism. All four are solvable in 4 weeks.

**The $1M ARR plan requires 100,000 free users converting at 3% to Pro, plus 600 practitioners at $39/month, plus white-label API deals. Timeline: 18 months.**

---

## What the Audit Found

### Strengths (Genuine Competitive Advantages)
1. **22 computation engines** — 19 are production-quality, totaling 5,476 lines of core IP. Pure JS, no dependencies beyond astronomy-engine. This is the moat.
2. **Comprehensive UI** — 79 components, 23 detail panels, 24 canvas visualizations. Every framework has paired computation + visualization + interpretation.
3. **Database schema** — 8 tables with proper RLS, cascading deletes, auth triggers. Ready for multi-tenant use.
4. **AI routing chain** — Three-provider fallback (Ollama → Supabase → direct Anthropic). Graceful degradation. Production architecture in place.
5. **96.7% gross margin at scale** — Near-zero marginal cost. Infra costs ~$2,750/mo at $83K MRR.

### Gaps (Revenue Blockers)
| Gap | Severity | Fix Effort | Phase |
|-----|----------|-----------|-------|
| AI synthesis not connected in prod | **CRITICAL** | 1 day (deploy Anthropic key to Supabase) | 1 |
| No Stripe payments | **CRITICAL** | 1 week | 1 |
| No onboarding flow | **CRITICAL** | 1 week | 1 |
| No auth tested with real users | **HIGH** | 2 days | 1 |
| No shareable profile cards | **HIGH** | 1 week | 2 |
| URL still aether-app-ten | **MEDIUM** | 1 hour | 1 |
| Practitioner features incomplete | **MEDIUM** | 3 weeks | 3 |
| HD engine needs calibration | **LOW** | Blocked on third chart | Later |

---

## Revised Agent Structure

Upgraded from 5 agents ($10K target) to 6 agents ($1M target):

| Agent | Old Mandate | New Mandate |
|-------|-----------|-------------|
| `/ceo` | Coordinate agents | **Phase-sequence the $1M plan. Weekly briefs with revenue tracking.** |
| `/product` | Manage roadmap | **Ship Phase 1 in 4 weeks. Zero scaffolded features touching revenue.** |
| `/marketing` | Content strategy | **100K free users in 6 months. Own SEO for every framework keyword.** |
| `/finance` | Track revenue | **Own Stripe integration. Model unit economics. Track every dollar.** |
| `/community` | User support | **600 practitioners in 12 months. Practitioner community IS the business.** |
| `/launch` | *(NEW)* | **Waitlist → beta → launch day → ongoing operations. The gap between "built" and "known."** |

---

## Phase 1 Action Plan (Weeks 1-4)

### Week 1: Backend Goes Live
- Deploy Supabase with Anthropic key → AI works in prod
- Wire Google OAuth
- Test profile creation flow
- Remove dev seed data from prod build

### Week 2: Onboarding Flow
- New `/welcome` page: birth data entry → compute → wow moment → paywall
- One free AI synthesis paragraph (the hook)
- Profile persistence to Supabase

### Week 3: Payments
- Create Stripe products (Pro $12/mo, Practitioner $39/mo)
- Wire checkout + webhooks
- Gate AI features by subscription status

### Week 4: Polish + Soft Launch
- Custom domain
- Full flow test with 10 strangers
- Launch waitlist campaign

---

## Decisions Needed (Gaston)

1. **Domain:** What should the production URL be? Options: golem.app, golemapp.com, trygolem.com, or keep golem-app.vercel.app for now?

2. **Pro pricing:** $12/mo is the working model. Confirm or adjust. Annual option at $99/year ($8.25/mo effective)?

3. **Practitioner pricing:** $39/mo with $9/client add-on above 10 clients. Confirm?

4. **Free tier scope:** Current plan = all 22 computations free, AI synthesis paid. Is that right? (Giving away computation is aggressive but builds the funnel.)

5. **Launch timing:** With 4 weeks of dev work, are we targeting May 2026 soft launch?

6. **Supabase production project:** Is there an existing Supabase project, or does one need to be created? Need the project URL, anon key, and Anthropic API key set as secret.

---

## What Happens If We Execute

| Month | MRR | Free Users | Pro | Practitioners |
|-------|-----|-----------|-----|--------------|
| 1 (launch) | $144 | 200 | 12 | 0 |
| 3 | $1,200 | 2,000 | 80 | 5 |
| 6 | $5,000 | 15,000 | 300 | 30 |
| 9 | $15,000 | 40,000 | 800 | 100 |
| 12 | $35,000 | 70,000 | 1,800 | 300 |
| 18 | $83,000 | 100,000+ | 3,000 | 600 |

These numbers assume: organic-first growth, 3% free-to-Pro conversion, practitioner community building from month 3, and white-label API from month 12.

---

## Bottom Line

The product is 80% built and 0% monetized. The gap is not engineering — it's deployment and go-to-market. Four weeks of focused work closes the gap between "impressive demo" and "revenue-generating product." The agent structure is now calibrated for $1M, not $10K.

Phase 1 starts now.
