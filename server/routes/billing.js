/**
 * Stripe Subscription Routes — /api/billing
 * 
 * Endpoints:
 *   POST /api/billing/create-checkout    — Start a new subscription checkout
 *   POST /api/billing/create-portal      — Customer portal for managing subscription
 *   POST /api/billing/webhook            — Stripe webhook handler (raw body)
 *   GET  /api/billing/status             — Current user's subscription status
 * 
 * Environment variables required:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   STRIPE_PRICE_PRO_MONTHLY
 *   STRIPE_PRICE_PRO_ANNUAL
 *   STRIPE_PRICE_FAMILY_MONTHLY
 *   STRIPE_PRICE_FAMILY_ANNUAL
 *   STRIPE_PRICE_CLINICAL_MONTHLY
 *   STRIPE_PRICE_CLINICAL_ANNUAL
 */
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Lazy-require Stripe — allows the server to start even if stripe isn't installed yet
let stripe;
function getStripe() {
  if (!stripe) {
    const Stripe = require('stripe');
    stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

// ============================================================================
// PRICE ID MAP — Maps tier + billing cycle to Stripe Price IDs
// ============================================================================

const PRICE_MAP = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL,
  family_monthly: process.env.STRIPE_PRICE_FAMILY_MONTHLY,
  family_annual: process.env.STRIPE_PRICE_FAMILY_ANNUAL,
  clinical_monthly: process.env.STRIPE_PRICE_CLINICAL_MONTHLY,
  clinical_annual: process.env.STRIPE_PRICE_CLINICAL_ANNUAL,
};

// ============================================================================
// POST /create-checkout — Start a Stripe Checkout session
// ============================================================================

router.post('/create-checkout', authenticateToken, async (req, res) => {
  try {
    const { tier, billing = 'monthly' } = req.body;
    const priceKey = `${tier}_${billing}`;
    const priceId = PRICE_MAP[priceKey];

    if (!priceId) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid plan: ${priceKey}. Available: ${Object.keys(PRICE_MAP).join(', ')}` 
      });
    }

    const user = req.user; // from auth middleware
    const stripeClient = getStripe();

    // Find or create Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripeClient.customers.create({
        email: user.email,
        metadata: { userId: user.id.toString() },
      });
      customerId = customer.id;

      // Store customer ID in database
      const { getPool } = require('../config/database');
      const pool = getPool();
      await pool.execute(
        'UPDATE users SET stripe_customer_id = ? WHERE id = ?',
        [customerId, user.id]
      );
    }

    // Create checkout session
    const session = await stripeClient.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?subscription=success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?subscription=cancelled`,
      metadata: {
        userId: user.id.toString(),
        tier,
        billing,
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error('[Billing] Checkout error:', error);
    res.status(500).json({ success: false, error: 'Failed to create checkout session' });
  }
});

// ============================================================================
// POST /create-portal — Customer self-service portal
// ============================================================================

router.post('/create-portal', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user.stripe_customer_id) {
      return res.status(400).json({ success: false, error: 'No active subscription' });
    }

    const stripeClient = getStripe();
    const session = await stripeClient.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error('[Billing] Portal error:', error);
    res.status(500).json({ success: false, error: 'Failed to create portal session' });
  }
});

// ============================================================================
// GET /status — Current subscription status
// ============================================================================

router.get('/status', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    // Default to free tier
    const status = {
      tier: 'free',
      status: 'active',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };

    if (!user.stripe_customer_id) {
      return res.json({ success: true, subscription: status });
    }

    const stripeClient = getStripe();
    const subscriptions = await stripeClient.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length > 0) {
      const sub = subscriptions.data[0];
      status.tier = sub.metadata?.tier || determineTierFromPrice(sub.items.data[0]?.price?.id);
      status.status = sub.status;
      status.currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
      status.cancelAtPeriodEnd = sub.cancel_at_period_end;
    }

    res.json({ success: true, subscription: status });
  } catch (error) {
    console.error('[Billing] Status error:', error);
    res.status(500).json({ success: false, error: 'Failed to get subscription status' });
  }
});

// ============================================================================
// POST /webhook — Stripe webhook handler (raw body required)
// ============================================================================

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Billing] STRIPE_WEBHOOK_SECRET not set');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;
  try {
    const stripeClient = getStripe();
    event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('[Billing] Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  const { getPool } = require('../config/database');
  const pool = getPool();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;

        if (userId && tier) {
          await pool.execute(
            'UPDATE users SET subscription_tier = ?, stripe_customer_id = ? WHERE id = ?',
            [tier, session.customer, userId]
          );
          console.log(`[Billing] ✅ User ${userId} upgraded to ${tier}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customer = await getStripe().customers.retrieve(subscription.customer);
        const userId = customer.metadata?.userId;

        if (userId) {
          const tier = subscription.metadata?.tier || determineTierFromPrice(subscription.items.data[0]?.price?.id);
          const isActive = ['active', 'trialing'].includes(subscription.status);
          
          await pool.execute(
            'UPDATE users SET subscription_tier = ? WHERE id = ?',
            [isActive ? tier : 'free', userId]
          );
          console.log(`[Billing] 🔄 User ${userId} subscription updated to ${isActive ? tier : 'free'}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customer = await getStripe().customers.retrieve(subscription.customer);
        const userId = customer.metadata?.userId;

        if (userId) {
          await pool.execute(
            'UPDATE users SET subscription_tier = ? WHERE id = ?',
            ['free', userId]
          );
          console.log(`[Billing] ❌ User ${userId} subscription cancelled → free`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.warn(`[Billing] ⚠️ Payment failed for customer ${invoice.customer}`);
        // In production: send email notification
        break;
      }

      default:
        // Unhandled event type
        break;
    }
  } catch (error) {
    console.error(`[Billing] Webhook handler error for ${event.type}:`, error);
  }

  res.json({ received: true });
});

// ============================================================================
// HELPER — Determine tier from Stripe Price ID
// ============================================================================

function determineTierFromPrice(priceId) {
  if (!priceId) return 'free';
  for (const [key, value] of Object.entries(PRICE_MAP)) {
    if (value === priceId) return key.split('_')[0];
  }
  return 'free';
}

module.exports = router;
