// Stripe integration for ABOVE + INSIDE
// Requires VITE_STRIPE_PUBLISHABLE_KEY environment variable

const PLANS = {
  explorer: {
    name: 'Explorer',
    priceId: 'price_explorer_monthly', // Replace with actual Stripe Price ID
    amount: 199, // cents
  },
  practitioner: {
    name: 'Practitioner',
    priceId: 'price_practitioner_monthly', // Replace with actual Stripe Price ID
    amount: 1999, // cents
  },
}

export async function createCheckoutSession(planId) {
  // TODO: Implement when Stripe account is created
  // 1. Call your backend to create a Stripe Checkout Session
  // 2. Redirect to Stripe Checkout
  console.log(`Creating checkout session for plan: ${planId}`)
  alert(
    `Stripe integration pending. Plan: ${PLANS[planId]?.name || planId}\n\nTo complete setup:\n1. Create a Stripe account at stripe.com\n2. Create products and prices\n3. Add VITE_STRIPE_PUBLISHABLE_KEY to .env\n4. Set up a backend endpoint for creating checkout sessions`
  )
}

export async function createPortalSession() {
  // TODO: Redirect to Stripe Customer Portal for subscription management
  console.log('Creating portal session...')
  alert(
    'Stripe Customer Portal integration pending.\nThis will allow users to manage their subscription.'
  )
}

export { PLANS }
