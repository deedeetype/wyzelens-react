import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

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
    const { planId, userId } = JSON.parse(event.body || '{}');

    if (!planId || !userId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Missing planId or userId' }),
      };
    }

    // Price IDs from Stripe Dashboard (LIVE - updated Mar 10, 2026)
    const priceIds: Record<string, string> = {
      starter: process.env.STRIPE_PRICE_STARTER || 'price_1T9T5w01YX9kum4ITE9KZu7M',   // $8/month
      pro: process.env.STRIPE_PRICE_PRO || 'price_1T9T6g01YX9kum4IvuUKQBO0',           // $20/month
      business: process.env.STRIPE_PRICE_BUSINESS || 'price_1T9T7q01YX9kum4Itdj8MBrS', // $49/month
    };

    const priceId = priceIds[planId];
    if (!priceId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Invalid planId' }),
      };
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.URL || 'https://wyzelens-react.netlify.app'}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'https://wyzelens-react.netlify.app'}/pricing`,
      metadata: {
        userId,
        planId,
      },
      customer_email: event.headers['x-user-email'], // Pass from frontend
      allow_promotion_codes: true,
    });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error: any) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message }),
    };
  }
};