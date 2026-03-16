import { useAboveInsideStore } from '../store/useAboveInsideStore'
import { createCheckoutSession, createPortalSession, PLANS } from '../services/stripe'

function handleSubscribe(planId) {
  createCheckoutSession(planId)
}

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Begin your journey of self-discovery',
    features: [
      { text: 'Basic natal chart', available: true },
      { text: 'Sun, Moon, Rising signs', available: true },
      { text: 'Limited framework views (3 systems)', available: true },
      { text: 'Community access', available: true },
    ],
    cta: 'Current Plan',
    highlight: false,
  },
  {
    id: 'explorer',
    name: 'Explorer',
    price: '$1.99',
    period: '/month',
    description: 'Unlock the full spectrum of cosmic insight',
    features: [
      { text: 'All 14+ framework systems unlocked', available: true },
      { text: 'Full natal chart with aspects & houses', available: true },
      { text: 'Transit tracking', available: true },
      { text: 'Synastry (1 person)', available: true },
      { text: 'Integral Consciousness Map', available: true },
      { text: 'Export charts as images', available: true },
    ],
    cta: 'Start Exploring',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    id: 'practitioner',
    name: 'Practitioner',
    price: '$19.99',
    period: '/month',
    description: 'For professionals guiding others on their path',
    features: [
      { text: 'Everything in Explorer', available: true },
      { text: 'Unlimited client profiles', available: true },
      { text: 'Client portal with shared views', available: true, comingSoon: true },
      { text: 'Meeting notes & recorder', available: true, comingSoon: true },
      { text: 'AI-powered session assistant (Claude)', available: true, comingSoon: true },
      { text: 'Automated follow-ups', available: true, comingSoon: true },
      { text: 'Referral network access', available: true, comingSoon: true },
      { text: 'WhatsApp integration', available: true, comingSoon: true },
      { text: 'Priority support', available: true },
    ],
    cta: 'Go Professional',
    highlight: false,
  },
]

const S = {
  panel: {
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    padding: '40px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 36,
    background: 'var(--card)',
    color: 'var(--foreground)',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  header: {
    textAlign: 'center',
    maxWidth: 600,
  },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: 28,
    fontWeight: 600,
    letterSpacing: '.18em',
    color: 'var(--foreground)',
    marginBottom: 12,
    lineHeight: 1.3,
  },
  subtitle: {
    fontSize: 17,
    color: 'var(--muted-foreground)',
    lineHeight: 1.6,
    fontStyle: 'italic',
  },
  tiersRow: {
    display: 'flex',
    gap: 20,
    justifyContent: 'center',
    flexWrap: 'wrap',
    maxWidth: 1100,
    width: '100%',
  },
  card: {
    flex: '1 1 300px',
    maxWidth: 340,
    minWidth: 280,
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 18,
    padding: '28px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    position: 'relative',
    backdropFilter: 'blur(16px)',
    transition: 'all .35s ease',
    overflow: 'hidden',
  },
  cardHighlight: {
    border: '1px solid rgba(201,168,76,.45)',
    boxShadow: '0 0 40px var(--accent), inset 0 1px 0 var(--accent)',
    transform: 'scale(1.03)',
  },
  cardHoverGlow: {
    content: '""',
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    background: 'radial-gradient(ellipse at 50% 0%, var(--secondary) 0%, transparent 60%)',
  },
  badgePopular: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: '4px 12px',
    borderRadius: 20,
    background: 'var(--accent)',
    border: '1px solid rgba(201,168,76,.4)',
    fontFamily: "'Cinzel', serif",
    fontSize: 8,
    fontWeight: 600,
    letterSpacing: '.15em',
    textTransform: 'uppercase',
    color: 'var(--foreground)',
  },
  badgeComingSoon: {
    display: 'inline-block',
    padding: '2px 7px',
    borderRadius: 8,
    background: 'rgba(104,32,176,.12)',
    border: '1px solid rgba(144,80,224,.25)',
    fontFamily: "'Cinzel', serif",
    fontSize: 7,
    fontWeight: 600,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    color: 'var(--violet2)',
    marginLeft: 6,
    verticalAlign: 'middle',
  },
  tierName: {
    fontFamily: "'Cinzel', serif",
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: '.15em',
    color: 'var(--foreground)',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontFamily: "'Inconsolata', monospace",
    fontSize: 36,
    fontWeight: 700,
    color: 'var(--foreground)',
    lineHeight: 1,
  },
  period: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 14,
    color: 'var(--muted-foreground)',
  },
  description: {
    fontSize: 14,
    color: 'var(--muted-foreground)',
    lineHeight: 1.5,
    fontStyle: 'italic',
    minHeight: 42,
  },
  divider: {
    width: '100%',
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(201,168,76,.2), transparent)',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    flex: 1,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    fontSize: 13,
    color: 'var(--muted-foreground)',
    lineHeight: 1.4,
  },
  featureCheck: {
    flexShrink: 0,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: 'var(--accent)',
    border: '1px solid rgba(201,168,76,.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    color: 'var(--foreground)',
    marginTop: 1,
  },
  featureCheckHighlight: {
    background: 'rgba(201,168,76,.18)',
    border: '1px solid rgba(201,168,76,.4)',
  },
  ctaButton: {
    width: '100%',
    padding: '12px 20px',
    borderRadius: 12,
    background: 'var(--accent)',
    border: '1px solid rgba(201,168,76,.25)',
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '.15em',
    textTransform: 'uppercase',
    color: 'var(--foreground)',
    cursor: 'pointer',
    transition: 'all .25s ease',
    textAlign: 'center',
  },
  ctaButtonHighlight: {
    background: 'linear-gradient(135deg, rgba(201,168,76,.2), var(--accent))',
    border: '1px solid var(--ring)',
    boxShadow: '0 4px 20px var(--accent)',
  },
  ctaButtonCurrent: {
    background: 'var(--secondary)',
    border: '1px solid rgba(255,255,255,.1)',
    color: 'var(--muted-foreground)',
    cursor: 'default',
  },
  footer: {
    textAlign: 'center',
    maxWidth: 500,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
  },
  footerDivider: {
    width: 60,
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(201,168,76,.3), transparent)',
  },
  footerText: {
    fontFamily: "'Inconsolata', monospace",
    fontSize: 11,
    color: 'var(--muted-foreground)',
    letterSpacing: '.05em',
  },
  manageLink: {
    fontFamily: "'Cinzel', serif",
    fontSize: 10,
    letterSpacing: '.12em',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
    transition: 'color .2s',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  },
  comparisonNote: {
    fontSize: 12,
    color: 'var(--muted-foreground)',
    textAlign: 'center',
    maxWidth: 500,
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
}

export default function PricingPage() {
  const subscription = useAboveInsideStore((s) => s.subscription)

  return (
    <div style={S.panel}>
      {/* Header */}
      <div style={S.header}>
        <h1 style={S.title}>Choose Your Path</h1>
        <p style={S.subtitle}>
          From personal exploration to professional practice, unlock the tools
          that illuminates your journey, transforms from within.
        </p>
      </div>

      {/* Tier Cards */}
      <div style={S.tiersRow}>
        {TIERS.map((tier) => {
          const isHighlight = tier.highlight
          const isCurrent = subscription === tier.id

          return (
            <div
              key={tier.id}
              style={{
                ...S.card,
                ...(isHighlight ? S.cardHighlight : {}),
              }}
              onMouseEnter={(e) => {
                if (!isHighlight) {
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,.3)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(201,168,76,.06)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isHighlight) {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = ''
                }
              }}
            >
              {/* Glow overlay */}
              <div style={S.cardHoverGlow} />

              {/* Popular badge */}
              {tier.badge && <div style={S.badgePopular}>{tier.badge}</div>}

              {/* Tier name */}
              <div style={S.tierName}>{tier.name}</div>

              {/* Price */}
              <div style={S.priceRow}>
                <span style={S.price}>{tier.price}</span>
                <span style={S.period}>{tier.period}</span>
              </div>

              {/* Description */}
              <div style={S.description}>{tier.description}</div>

              {/* Divider */}
              <div style={S.divider} />

              {/* Features */}
              <div style={S.featureList}>
                {tier.features.map((feat, i) => (
                  <div key={i} style={S.featureItem}>
                    <div
                      style={{
                        ...S.featureCheck,
                        ...(isHighlight ? S.featureCheckHighlight : {}),
                      }}
                    >
                      {'\u2713'}
                    </div>
                    <span>
                      {feat.text}
                      {feat.comingSoon && (
                        <span style={S.badgeComingSoon}>Coming Soon</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                style={{
                  ...S.ctaButton,
                  ...(isHighlight ? S.ctaButtonHighlight : {}),
                  ...(isCurrent ? S.ctaButtonCurrent : {}),
                }}
                onClick={() => {
                  if (!isCurrent && tier.id !== 'free') {
                    handleSubscribe(tier.id)
                  }
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) {
                    e.currentTarget.style.background = isHighlight
                      ? 'linear-gradient(135deg, rgba(201,168,76,.3), rgba(201,168,76,.18))'
                      : 'var(--accent)'
                    e.currentTarget.style.borderColor = 'var(--ring)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) {
                    if (isHighlight) {
                      e.currentTarget.style.background = S.ctaButtonHighlight.background
                      e.currentTarget.style.borderColor = S.ctaButtonHighlight.border.split(' ').pop()
                    } else {
                      e.currentTarget.style.background = S.ctaButton.background
                      e.currentTarget.style.borderColor = S.ctaButton.border.split(' ').pop()
                    }
                  }
                }}
              >
                {isCurrent ? '\u2713 Current Plan' : tier.cta}
              </button>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={S.footer}>
        <div style={S.footerDivider} />
        <div style={S.footerText}>
          Powered by Stripe. Cancel anytime.
        </div>
        <div
          style={S.manageLink}
          onClick={() => createPortalSession()}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted-foreground)' }}
        >
          Manage Subscription
        </div>
        <p style={S.comparisonNote}>
          All plans include access to the community. Upgrade or downgrade at any time
          with no hidden fees. Your cosmic data is always yours.
        </p>
      </div>
    </div>
  )
}
