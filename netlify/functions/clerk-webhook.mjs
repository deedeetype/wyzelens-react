import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  // Validate environment variables first
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Environment check:', {
    hasWebhookSecret: !!WEBHOOK_SECRET,
    hasSupabaseUrl: !!SUPABASE_URL,
    hasSupabaseKey: !!SUPABASE_KEY,
    supabaseUrl: SUPABASE_URL?.substring(0, 30) + '...',
  });

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is missing');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook secret not configured' }),
    };
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Supabase credentials missing');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Supabase not configured' }),
    };
  }

  // Create Supabase client inside handler
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Get the headers
  const svix_id = event.headers['svix-id'];
  const svix_timestamp = event.headers['svix-timestamp'];
  const svix_signature = event.headers['svix-signature'];

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing svix headers' }),
    };
  }

  // Get the body
  const body = event.body;

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid signature' }),
    };
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log('Webhook event type:', eventType);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      console.error('No email found for user:', id);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No email found' }),
      };
    }

    console.log(`Processing ${eventType} for user:`, id, email);

    try {
      // Upsert user
      const { data, error } = await supabase
        .from('users')
        .upsert({
          clerk_id: id,
          email: email,
          name: `${first_name || ''} ${last_name || ''}`.trim() || email.split('@')[0],
        }, {
          onConflict: 'clerk_id'
        });

      if (error) {
        console.error('Error upserting user:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to upsert user', details: error.message }),
        };
      }

      console.log('User upserted successfully:', id);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'User upserted successfully', user_id: id }),
      };
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal server error', details: error.message }),
      };
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Webhook received', type: eventType }),
  };
};
