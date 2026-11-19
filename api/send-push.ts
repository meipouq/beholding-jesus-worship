import * as webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl(): string {
  let url = (
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://qemwqoamnvswfffzxqkv.supabase.co'
  ).trim();

  // Discard dead/obsolete project URLs
  if (url.includes('rhdonxpn') || url.includes('rpeevqhw')) {
    url = 'https://qemwqoamnvswfffzxqkv.supabase.co';
  }

  // Auto-fix typo like ttps://
  if (url.startsWith('ttps://')) {
    url = 'h' + url;
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  return url;
}

function getSupabaseKey(): string {
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    'sb_publishable_Tv9Zb_xjkXsGN3bvQ-Z9NA_5VAJvGUs'
  ).trim();
  return key;
}

const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  'BCykR7uJot_OyVgiG_UVZlgqyRvVvFXhtrgXkAv7mKxpbK61PaNh1jw9nZTUoDEJLu1dSWZ3xHlaU64KOeCgxGE';
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  'mSo6XQx4kB_bjlNmxnaeQviJpbvATDFcCwIRCSFtQbA';
const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || 'mailto:worship@beholdingjesus.org';

export default async function handler(req: any, res: any) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const supabase = createClient(getSupabaseUrl(), getSupabaseKey(), {
      auth: { persistSession: false },
    });
    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      try {
        bodyData = JSON.parse(bodyData);
      } catch (e) {
        // ignore parse error
      }
    }

    const { title, body, url, category, notification_id } = bodyData || {};

    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required.' });
    }

    // Configure web-push with VAPID keys
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    // 1. Fetch all registered device subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (subError) {
      console.error('Failed to query push_subscriptions:', subError);
      return res.status(500).json({
        error: 'Database error fetching subscriptions',
        details: subError.message,
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No push subscriptions currently registered.',
        sentCount: 0,
        failedCount: 0,
        total: 0,
      });
    }

    // 2. Fetch user preferences to check opt-outs
    const { data: preferences } = await supabase
      .from('push_preferences')
      .select('*');

    const prefMap = new Map<string, any>();
    if (preferences) {
      for (const p of preferences) {
        prefMap.set(p.user_id, p);
      }
    }

    // 3. Filter subscriptions based on user preferences
    const targetCategory = category || 'general';
    const eligibleSubscriptions = subscriptions.filter((sub) => {
      const userPref = prefMap.get(sub.user_id);
      if (userPref) {
        if (userPref.push_enabled === false) return false;
        if (
          targetCategory &&
          userPref.categories &&
          userPref.categories[targetCategory] === false
        ) {
          return false;
        }
      }
      return true;
    });

    // 4. Construct Web Push payload
    const pushPayload = JSON.stringify({
      title: title,
      body: body,
      url: url || '/',
      category: targetCategory,
      notification_id: notification_id || `push-${Date.now()}`,
    });

    let sentCount = 0;
    let failedCount = 0;
    const pruneEndpoints: string[] = [];

    // 5. Broadcast to each device
    const sendPromises = eligibleSubscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          pushPayload,
          {
            TTL: 60 * 60 * 24, // 24 hours
          }
        );
        sentCount++;
      } catch (err: any) {
        failedCount++;
        console.warn(
          `Push failed for endpoint ${sub.endpoint.slice(0, 30)}...:`,
          err?.message || err
        );
        // If Apple APNs / Google FCM reports endpoint is dead (404 or 410 Gone)
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          pruneEndpoints.push(sub.endpoint);
        }
      }
    });

    await Promise.all(sendPromises);

    // Prune dead subscriptions in background
    if (pruneEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', pruneEndpoints);
    }

    return res.status(200).json({
      success: true,
      sentCount,
      failedCount,
      total: eligibleSubscriptions.length,
    });
  } catch (err: any) {
    console.error('send-push handler exception:', err);
    return res.status(500).json({
      error: 'Internal push dispatch error',
      details: err?.message || 'Unknown error',
    });
  }
}
