import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId } = JSON.parse(event.body || '{}');

    if (!userId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Missing userId' }),
      };
    }

    // Fetch user's subscription from Supabase to get Stripe customer ID
    console.log('[PORTAL] Fetching subscription for userId:', userId);
    
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/user_subscriptions?user_id=eq.${userId}&select=stripe_customer_id`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    );

    const data = await response.json();
    
    console.log('[PORTAL] Supabase response status:', response.status);
    console.log('[PORTAL] Supabase response data:', JSON.stringify(data, null, 2));
    
    // Check for Supabase error response
    if (data.error || data.message) {
      console.error('[PORTAL] Supabase error:', data);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ 
          error: 'Database error', 
          details: data.error || data.message 
        }),
      };
    }
    
    // Check if data is an array with at least one result
    if (!Array.isArray(data) || data.length === 0) {
      console.error('[PORTAL] No subscription found. Response:', data);
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ 
          error: 'No active subscription found',
          debug: { userId, responseType: typeof data, dataLength: Array.isArray(data) ? data.length : 'not-array' }
        }),
      };
    }
    
    const subscription = data[0];
    
    if (!subscription?.stripe_customer_id) {
      console.error('[PORTAL] Missing stripe_customer_id. Subscription:', subscription);
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ 
          error: 'No Stripe customer ID found',
          debug: { subscription }
        }),
      };
    }

    const customerId = subscription.stripe_customer_id;
    console.log('[PORTAL] Creating portal session for customer:', customerId);

    // Create Stripe billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.URL || 'https://wyzelens.com'}/dashboard`,
    });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error: any) {
    console.error('Portal session error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
