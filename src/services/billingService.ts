/**
 * billingService.ts — Frontend API for Stripe billing
 * 
 * Connects the SubscriptionContext to the server-side Stripe integration.
 * All calls go through our Express server (never directly to Stripe).
 */

import type { SubscriptionTier } from '../contexts/SubscriptionContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ============================================================================
// TYPES
// ============================================================================

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export type BillingCycle = 'monthly' | 'annual';

// ============================================================================
// API CALLS
// ============================================================================

/**
 * Start a Stripe Checkout session for a new subscription.
 * Redirects the user to Stripe's hosted checkout page.
 */
export async function createCheckoutSession(
  tier: SubscriptionTier,
  billing: BillingCycle = 'monthly'
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/billing/create-checkout`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ tier, billing }),
  });

  const data = await res.json();

  if (!data.success || !data.url) {
    throw new Error(data.error || 'Failed to create checkout session');
  }

  // Redirect to Stripe Checkout
  window.location.href = data.url;
}

/**
 * Open the Stripe Customer Portal for managing subscriptions,
 * payment methods, and invoices.
 */
export async function openCustomerPortal(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/billing/create-portal`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (!data.success || !data.url) {
    throw new Error(data.error || 'Failed to open customer portal');
  }

  window.location.href = data.url;
}

/**
 * Fetch the current user's subscription status from the server.
 * Returns tier info synchronized with Stripe.
 */
export async function fetchSubscriptionStatus(): Promise<SubscriptionStatus> {
  const res = await fetch(`${API_BASE}/api/billing/status`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch subscription status');
  }

  return data.subscription;
}

/**
 * Handle post-checkout redirect.
 * Call this on dashboard mount to sync tier after Stripe checkout.
 */
export async function handleCheckoutReturn(): Promise<SubscriptionStatus | null> {
  const params = new URLSearchParams(window.location.search);
  const subscriptionParam = params.get('subscription');

  if (subscriptionParam === 'success') {
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);

    // Fetch updated status from server
    try {
      const status = await fetchSubscriptionStatus();
      return status;
    } catch {
      return null;
    }
  }

  if (subscriptionParam === 'cancelled') {
    window.history.replaceState({}, '', window.location.pathname);
  }

  return null;
}
