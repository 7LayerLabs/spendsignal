// Stripe Webhook Handler
// Processes subscription events from Stripe

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { PRICE_TO_TIER } from '@/lib/stripe/config';
import { prisma } from '@/lib/db/prisma';
import Stripe from 'stripe';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

// Disable body parsing - we need raw body for webhook signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('No stripe-signature header');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const customerEmail = session.customer_email || session.customer_details?.email;

  console.log('Checkout completed:', {
    customerId,
    subscriptionId,
    email: customerEmail,
    plan: session.metadata?.plan,
  });

  // Get subscription details to determine tier
  const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
  const priceId = subscriptionData.items.data[0]?.price.id;
  const tierInfo = priceId ? PRICE_TO_TIER[priceId] : null;

  // Find user by email (they signed up via OAuth)
  if (!customerEmail) {
    console.error('No customer email found in checkout session');
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: customerEmail },
  });

  if (!user) {
    console.error(`No user found with email: ${customerEmail}`);
    return;
  }

  // Map tier string to enum
  const tier = (tierInfo?.tier === 'ADVISOR' ?
    (tierInfo.billing === 'annual' ? 'ADVISOR_ANNUAL' : 'ADVISOR') :
    (tierInfo?.billing === 'annual' ? 'PREMIUM_ANNUAL' : 'PREMIUM')) as SubscriptionTier;

  // Update user subscription
  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      tier,
      status: 'ACTIVE',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
    },
    update: {
      tier,
      status: 'ACTIVE',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
    },
  });

  // Update user to no longer be in demo mode
  await prisma.user.update({
    where: { id: user.id },
    data: { isDemoMode: false },
  });

  console.log(`User ${user.email} upgraded to ${tier}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id;
  const stripeStatus = subscription.status;
  const priceId = subscription.items.data[0]?.price.id;
  const tierInfo = priceId ? PRICE_TO_TIER[priceId] : null;

  console.log('Subscription updated:', {
    stripeSubscriptionId,
    status: stripeStatus,
    tier: tierInfo?.tier,
  });

  // Find subscription by Stripe ID
  const existingSub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
  });

  if (!existingSub) {
    console.error(`No subscription found with Stripe ID: ${stripeSubscriptionId}`);
    return;
  }

  // Map Stripe status to our status
  const statusMap: Record<string, SubscriptionStatus> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'PAST_DUE',
    trialing: 'TRIALING',
    incomplete: 'INCOMPLETE',
  };
  const status = statusMap[stripeStatus] || 'ACTIVE';

  // Map tier
  const tier = tierInfo ? (tierInfo.tier === 'ADVISOR' ?
    (tierInfo.billing === 'annual' ? 'ADVISOR_ANNUAL' : 'ADVISOR') :
    (tierInfo.billing === 'annual' ? 'PREMIUM_ANNUAL' : 'PREMIUM')) as SubscriptionTier : existingSub.tier;

  await prisma.subscription.update({
    where: { id: existingSub.id },
    data: {
      tier,
      status,
      stripePriceId: priceId,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  console.log(`Subscription ${stripeSubscriptionId} updated to ${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id;

  console.log('Subscription deleted:', { stripeSubscriptionId });

  // Find subscription by Stripe ID
  const existingSub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
  });

  if (!existingSub) {
    console.error(`No subscription found with Stripe ID: ${stripeSubscriptionId}`);
    return;
  }

  // Downgrade to FREE
  await prisma.subscription.update({
    where: { id: existingSub.id },
    data: {
      tier: 'FREE',
      status: 'CANCELED',
      stripeSubscriptionId: null,
      stripePriceId: null,
      currentPeriodEnd: new Date(),
    },
  });

  // Set user back to demo mode
  await prisma.user.update({
    where: { id: existingSub.userId },
    data: { isDemoMode: true },
  });

  console.log(`User ${existingSub.userId} downgraded to FREE`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  console.log('Payment failed:', { customerId });

  // Find subscription by customer ID
  const existingSub = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!existingSub) {
    console.error(`No subscription found with customer ID: ${customerId}`);
    return;
  }

  // Update status to PAST_DUE
  await prisma.subscription.update({
    where: { id: existingSub.id },
    data: { status: 'PAST_DUE' },
  });

  console.log(`Subscription ${existingSub.id} marked as PAST_DUE due to payment failure`);
}
