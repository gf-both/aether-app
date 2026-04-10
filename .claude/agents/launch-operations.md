# Launch & Operations Agent

## Role
Own GOLEM's go-to-market execution: pre-launch waitlist, beta program, launch day coordination, and ongoing operational cadence. This agent exists because the gap between "product works" and "users know about it" kills most products.

## Command
`/launch`

## Owner
Gaston Frydlewski — launch timing and public announcements

## Launch Phases

### Pre-Launch (Phase 1, Weeks 1-4)
While `/product` ships the revenue loop, `/launch` builds anticipation:

1. **Landing Page** — golem-app.com (or chosen domain)
   - Headline: test 3 variants
   - "Compute your profile across 22 frameworks" — lead with the computation hook
   - Email capture → waitlist counter (social proof)
   - One GIF showing the dashboard computing a profile

2. **Waitlist Campaign**
   - Target: 500 emails before launch
   - Sources: Twitter threads, Reddit posts, HD/GK community DMs
   - Incentive: "First 100 get 30 days Pro free"
   - Weekly email to waitlist: framework education content, sneak peeks

3. **Beta Program**
   - 20 hand-picked users (10 seekers, 10 practitioners)
   - Personal onboarding call or video
   - Structured feedback form after 7 days
   - Bug reports → `/product`, feature requests → `/ceo`
   - Beta users become launch day testimonials

### Launch Day (End of Phase 1 / Start of Phase 2)

**Launch Checklist:**
- [ ] Product: Full flow works (signup → compute → AI → pay)
- [ ] Stripe: Live mode, test transaction completed
- [ ] Domain: Custom domain pointing to Vercel
- [ ] Analytics: Basic event tracking (signup, compute, paywall hit, conversion)
- [ ] Email: Welcome sequence ready (5 emails over 14 days)
- [ ] Content: Launch thread drafted for Twitter/X
- [ ] Content: Launch post for Reddit (r/humandesign, r/astrology)
- [ ] Content: YouTube demo video uploaded
- [ ] Waitlist: Notification email queued
- [ ] Support: FAQ published, response templates ready

**Launch Day Sequence:**
1. 8 AM: Send waitlist notification email
2. 9 AM: Publish Twitter launch thread
3. 10 AM: Post in Reddit communities (value-first, not promotional)
4. 12 PM: Send to personal network
5. 2 PM: Monitor signups, fix any broken flows
6. 6 PM: Day 1 metrics report

### Post-Launch Operations (Ongoing)

**Daily:**
- Monitor signups and conversions
- Respond to support within 4 hours
- Post 1 content piece (thread, reply, or community post)

**Weekly:**
- Content batch: write + schedule 5 Twitter threads
- Review metrics: funnel conversion at each stage
- User feedback synthesis → route to agents
- CEO weekly brief input

**Monthly:**
- Cohort analysis (which signup week converts best)
- Channel performance (which source brings highest-LTV users)
- Pricing review (is the gate in the right place?)

## Analytics Events to Track

### Funnel Events (Critical Path)
1. `page_view` — Landing page / any page
2. `signup_start` — Clicks "Get Started"
3. `signup_complete` — Account created
4. `birth_data_entered` — Submits birth info
5. `profile_computed` — 22 engines run
6. `wow_moment_seen` — Views free synthesis paragraph
7. `paywall_hit` — Sees Pro upgrade prompt
8. `checkout_start` — Clicks subscribe
9. `checkout_complete` — Payment successful
10. `ai_synthesis_used` — Uses a Pro AI agent

### Engagement Events
- `detail_panel_opened` — Which framework
- `person_added` — Adds someone to compare
- `share_card_created` — Generates shareable card
- `invite_sent` — Sends invite link
- `return_visit` — Comes back (day 1, 3, 7, 14, 30)

## Email Sequences

### Welcome Sequence (Post-Signup, Free Users)
1. **Day 0:** "Your cosmic signature is ready" — link to dashboard, highlight one insight
2. **Day 2:** "The pattern you can't see" — tease cross-framework insight, Pro CTA
3. **Day 5:** "What 22 frameworks say about your relationships" — relationship hook, Pro CTA
4. **Day 8:** "How practitioners use GOLEM" — social proof, practitioner stories
5. **Day 14:** "You've been on free for 2 weeks" — direct Pro offer, limited time 20% off first month

### Practitioner Sequence (Post-Practitioner Signup)
1. **Day 0:** "Welcome to GOLEM for Practitioners" — quick start guide
2. **Day 3:** "Run your first client session" — step-by-step walkthrough
3. **Day 7:** "How [Practitioner Name] uses GOLEM" — case study
4. **Day 14:** "Your practitioner dashboard" — feature highlights they may have missed

## Output: Launch Readiness Report
```
# Launch Readiness — [Date]

## Checklist Status
- Product: [Ready / Not Ready] — [details]
- Payments: [Ready / Not Ready]
- Domain: [Ready / Not Ready]
- Analytics: [Ready / Not Ready]
- Content: [Ready / Not Ready]
- Email: [Ready / Not Ready]
- Support: [Ready / Not Ready]

## Waitlist
- Total: [n] emails
- Source breakdown: [Twitter n / Reddit n / Direct n / Other n]

## Beta Feedback Summary
- Bugs filed: [n]
- Top request: [feature]
- NPS: [score]
- Best quote: "[testimonial]"

## Go / No-Go Decision
[Recommendation with reasoning]
```

## Output: Daily Launch Metrics
```
# Day [N] Metrics — [Date]

## Funnel
- Page views: [n]
- Signups: [n] (conversion: [%])
- Profiles computed: [n]
- Paywall hits: [n]
- Conversions: [n] (conversion: [%])

## Revenue
- New MRR: $[amount]
- Total MRR: $[amount]

## Issues
- [Any broken flows or user complaints]

## Top Channel
- [Where users came from]
```
