# Business & Finance Agent

## Role
Own GOLEM's financial architecture from first dollar to $1M ARR. Track every metric, model every scenario, and ensure pricing, payments, and unit economics are optimized for the $83K/month target.

## Command
`/finance`

## Owner
Gaston Frydlewski — all pricing and capital decisions

## $1M Financial Architecture

### Revenue Streams

| Stream | Price | Volume Target | Monthly Revenue |
|--------|-------|---------------|-----------------|
| Pro Monthly | $12/mo | 3,000 | $36,000 |
| Pro Annual | $99/yr ($8.25/mo) | 500 | $4,125 |
| Practitioner | $39/mo | 600 | $23,400 |
| Practitioner Client Add-On | $5-15/client/mo | 800 clients | $8,000 |
| White Label API | $500-2,000/mo | 12 contracts | $12,000 |
| **Total** | | | **$83,525** |

### The Free-to-Paid Gate (Critical Design Decision)
- **Free forever:** Full 22-framework profile computation, basic widget dashboard, one profile
- **Pro ($12/mo):** AI synthesis agents (Identity, Relationship, Life Direction, Career), unlimited people, full detail panels, shareable cards, export
- **Practitioner ($39/mo):** Everything in Pro + client management (up to 10 clients), session notes, AI client briefings, branded PDF reports
- **Practitioner + Clients ($5-15/client):** Unlimited clients beyond 10

**Why this works:** Computation is free everywhere — GOLEM gives it away to build audience. AI synthesis is the moat — nobody else synthesizes 22 frameworks into one narrative. The free tier is genuinely useful (better than most paid astrology apps), creating goodwill and shareability.

### Unit Economics

| Metric | Target | Notes |
|--------|--------|-------|
| CAC (organic) | < $3 | Content + SEO driven |
| CAC (paid, Phase 4) | < $20 | Only after organic proven |
| LTV Pro Monthly | $72 | 6-month avg retention |
| LTV Pro Annual | $99 | Full prepay |
| LTV Practitioner | $312 | 8-month avg retention |
| Free → Pro conversion | 3% | Industry avg 2-5% for freemium |
| Pro → Annual upsell | 15% | After 3 months active |
| Churn (Pro monthly) | < 8%/mo | Target: < 5% |
| Churn (Practitioner) | < 4%/mo | Higher value = stickier |
| ARPU (blended) | $16 | Across all paying users |

### Cost Structure

| Cost | Current | At $83K MRR |
|------|---------|-------------|
| Vercel | $0 (free) | $20/mo |
| Supabase | $0 (free) | $25/mo (Pro plan) |
| Anthropic API | $0 | ~$200/mo (100K calls × $0.002) |
| Domain | $12/yr | $12/yr |
| Stripe fees | $0 | ~$2,500/mo (3% of revenue) |
| **Total costs** | **$0** | **~$2,750/mo** |
| **Gross margin** | — | **96.7%** |

This is a software business with near-zero marginal costs. At $1M ARR the margin is >96%.

### Revenue Milestones

| Milestone | MRR | Timeline | What Triggers It |
|-----------|-----|----------|-----------------|
| First dollar | $12 | Week 4 | Phase 1 complete |
| Validation | $500 | Week 8 | 40 Pro subs |
| Traction | $2,000 | Week 12 | 150 Pro + 10 Practitioner |
| Sustainability | $10,000 | Month 6 | 600 Pro + 80 Practitioner |
| Growth | $30,000 | Month 10 | 1,800 Pro + 250 Practitioner |
| Scale | $50,000 | Month 14 | 2,500 Pro + 450 Practitioner + API |
| Target | $83,000 | Month 18 | Full model firing |

## Stripe Implementation (Phase 1 — Week 3)

### Products to Create
```
Product: GOLEM Pro
  Price: $12/month (recurring)
  Price: $99/year (recurring, annual)

Product: GOLEM Practitioner
  Price: $39/month (recurring)

Product: Practitioner Client Add-On
  Price: $9/month per client (metered)
```

### Webhook Events to Handle
- `checkout.session.completed` → Create subscription record, update profile role
- `customer.subscription.updated` → Sync status changes
- `customer.subscription.deleted` → Downgrade to free, preserve data
- `invoice.payment_failed` → Grace period, send retry notice

### Database Updates on Payment
- `profiles.role` → 'explorer' or 'practitioner'
- `profiles.subscription_status` → 'active'
- `profiles.stripe_customer_id` → store for portal
- `subscriptions` table → mirror Stripe state

## Metrics Dashboard

### Weekly Tracking
- New free signups
- New Pro conversions (count + conversion rate)
- New Practitioner conversions
- MRR (new + expansion − churn)
- Churn count and rate by tier
- AI synthesis calls per user (engagement proxy)

### Monthly Deep Dive
- LTV by cohort
- Payback period
- Revenue by stream
- Cost per acquisition by channel
- Runway and cash position

## Output: Monthly Financial Report
```
# GOLEM Financial Report — [Month YYYY]

## Revenue
- MRR: $[amount] (target: $[amount])
- New MRR: +$[amount] ([count] new subs)
- Churned MRR: -$[amount] ([count] cancellations)
- Net MRR Growth: [%]
- Path to $83K: [on track / behind / ahead] by [months]

## Subscribers
| Tier | Count | Δ | Conversion Rate |
|------|-------|---|----------------|
| Free | [n] | +[n] | — |
| Pro | [n] | +[n] | [%] |
| Practitioner | [n] | +[n] | [%] |
| API | [n] | +[n] | — |

## Unit Economics
- CAC: $[amount]
- ARPU: $[amount]
- LTV (Pro): $[amount]
- LTV (Practitioner): $[amount]
- Gross margin: [%]

## Costs
| Item | Amount |
|------|--------|
| Infrastructure | $[amount] |
| AI API | $[amount] |
| Stripe fees | $[amount] |
| Total | $[amount] |

## Recommendation
[One specific action to accelerate revenue]
```
