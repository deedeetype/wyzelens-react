import { Handler } from '@netlify/functions';
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';
import type { WebhookEvent } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler: Handler = async (event) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
  }

  // Get the headers
  const svix_id = event.headers['svix-id'];
  const svix_timestamp = event.headers['svix-timestamp'];
  const svix_signature = event.headers['svix-signature'];

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return {
      statusCode: 400,
      body: 'Error occurred -- no svix headers',
    };
  }

  // Get the body
  const body = event.body;

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body!, {
      'svix-id': svix_id as string,
      'svix-timestamp': svix_timestamp as string,
      'svix-signature': svix_signature as string,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return {
      statusCode: 400,
      body: 'Error occurred',
    };
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No email found' }),
      };
    }

    try {
      // Upsert profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: id,
          email: email,
          full_name: `${first_name || ''} ${last_name || ''}`.trim() || email.split('@')[0],
          subscription_tier: 'free',
          subscription_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', id);

      if (error) {
        console.error('Error upserting profile:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to upsert profile' }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Profile upserted successfully' }),
      };
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      };
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Webhook received' }),
  };
};