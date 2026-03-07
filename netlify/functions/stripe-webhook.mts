import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

console.log('Webhook init - SUPABASE_URL:', SUPABASE_URL ? 'configured' : 'MISSING');
console.log('Webhook init - SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? 'configured' : 'MISSING');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('CRITICAL: Missing Supabase configuration!');
}

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_KEY!
);

export const handler: Handler = async (event) => {
  console.log('Stripe webhook received:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers));
  
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return {
      statusCode: 500,
      body: 'Webhook secret not configured',
    };
  }

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body!, sig!, webhookSecret);
    console.log('Webhook event type:', stripeEvent.type);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  // Handle the event
  switch (stripeEvent.type) {
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      const { userId, planId } = session.metadata || {};

      console.log('Processing checkout.session.completed for userId:', userId, 'planId:', planId);
      
      if (userId && planId) {
        try {
          // Update user subscription in Supabase
          const { data, error } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: userId,
              plan: planId,
              status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id'
            })
            .select()
            .single();

          if (error) {
            console.error('Failed to update subscription:', error);
          } else {
            console.log('Subscription updated successfully:', data);
          }

          // Note: users table doesn't track subscription_tier/status directly
          // All subscription data is in user_subscriptions table
          console.log('Subscription tracking handled via user_subscriptions table');
        } catch (error) {
          console.error('Database error:', error);
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = stripeEvent.data.object as Stripe.Subscription;
      
      // Find user by stripe_subscription_id
      const { data: subs } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (subs) {
        // Downgrade to free
        await supabase
          .from('user_subscriptions')
          .update({
            plan: 'free',
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', subs.user_id);

        console.log('Subscription cancelled, downgraded to free plan');
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = stripeEvent.data.object as Stripe.Subscription;
      
      console.log('Processing subscription.updated:', subscription.id);
      console.log('Status:', subscription.status, 'Cancel at period end:', subscription.cancel_at_period_end);
      
      // Handle subscription updates (e.g., plan changes, cancellations)
      const { data: subs } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (subs) {
        const updateData: any = {
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end || false,
          updated_at: new Date().toISOString(),
        };
        
        // Track billing period
        if (subscription.current_period_start) {
          updateData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString();
        }
        if (subscription.current_period_end) {
          updateData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
        }
        
        await supabase
          .from('user_subscriptions')
          .update(updateData)
          .eq('user_id', subs.user_id);

        console.log('Subscription updated:', {
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null
        });
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${stripeEvent.type}`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};