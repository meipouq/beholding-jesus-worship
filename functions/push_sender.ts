// Supabase Edge Function: Push Notification Sender
// Uses Deno runtime. VAPID keys are managed via environment variables.
// Duplicate prevention via `notifications_sent` unique (user_id, notification_id).
// Durable rate limiting via `push_rate_limits` table.

import { serve } from "https://deno.land/std@0.219.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY"); // <-- required
if (!supabaseUrl || !supabaseKey || !vapidPrivateKey) {
  console.error("Missing required env vars");
  Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// Helper: enforce rate limit (max 5 pushes per minute per user)
async function checkRateLimit(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("push_rate_limits")
    .select("count, last_sent")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") { // table may not exist yet
    console.warn("Rate limit check error", error);
    return false;
  }
  const now = new Date();
  if (!data) {
    // first record
    await supabase.from("push_rate_limits").insert({ user_id: userId, count: 1, last_sent: now.toISOString() });
    return true;
  }
  const lastSent = new Date(data.last_sent);
  const diffMs = now.getTime() - lastSent.getTime();
  if (diffMs < 60_000) {
    if (data.count >= 5) return false;
    await supabase.from("push_rate_limits").update({ count: data.count + 1, last_sent: now.toISOString() }).eq("user_id", userId);
    return true;
  }
  // reset count after a minute
  await supabase.from("push_rate_limits").update({ count: 1, last_sent: now.toISOString() }).eq("user_id", userId);
  return true;
}

// Main handler
serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }
  const payload = await req.json();
  const { user_id, notification_id, title, body, url, category } = payload;
  if (!user_id || !notification_id || !title) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  // Verify user preferences (simplified – assumes a table `push_preferences` exists)
  const { data: pref, error: prefErr } = await supabase
    .from("push_preferences")
    .select("push_enabled, categories")
    .eq("user_id", user_id)
    .single();
  if (prefErr) {
    console.warn("Preference lookup failed", prefErr);
    return new Response(JSON.stringify({ error: "Preference error" }), { status: 500 });
  }
  if (!pref?.push_enabled || (pref?.categories && !pref.categories.includes(category))) {
    return new Response(JSON.stringify({ status: "skipped", reason: "preferences" }), { status: 200 });
  }

  // Rate limiting
  const allowed = await checkRateLimit(user_id);
  if (!allowed) {
    return new Response(JSON.stringify({ status: "rate_limited" }), { status: 429 });
  }

  // Duplicate check – atomic upsert
  const { error: dupErr } = await supabase
    .from("notifications_sent")
    .upsert({ user_id, notification_id }, { onConflict: ["user_id", "notification_id"] });
  if (dupErr && dupErr.code !== "23505") {
    console.error("Duplication insert error", dupErr);
    return new Response(JSON.stringify({ error: "duplication error" }), { status: 500 });
  }
  if (dupErr && dupErr.code === "23505") {
    // duplicate – silently ignore
    return new Response(JSON.stringify({ status: "duplicate" }), { status: 200 });
  }

  // Fetch subscription(s) for the user
  const { data: subs, error: subErr } = await supabase.from("push_subscriptions").select("endpoint, keys").eq("user_id", user_id);
  if (subErr) {
    console.error("Subscription fetch error", subErr);
    return new Response(JSON.stringify({ error: "subscriptions fetch error" }), { status: 500 });
  }

  const subscription = subs?.[0];
  if (!subscription) {
    return new Response(JSON.stringify({ status: "no_subscription" }), { status: 200 });
  }

  // Build Web Push payload using VAPID credentials
  const pushPayload = JSON.stringify({ title, body, url, tag: notification_id });
  const pushHeaders = {
    TTL: "60",
    Urgency: "normal",
  };

  // Use the Web Push library (deno.land) – lightweight implementation
  const { webPush } = await import("https://deno.land/x/webpush@0.2.0/mod.ts");
  try {
    await webPush(
      subscription.endpoint,
      subscription.keys.p256dh,
      subscription.keys.auth,
      vapidPrivateKey,
      { publicKey: Deno.env.get("VAPID_PUBLIC_KEY") ?? "" },
      pushPayload,
      pushHeaders,
    );
    return new Response(JSON.stringify({ status: "sent" }), { status: 200 });
  } catch (e) {
    console.error("Push send error", e);
    return new Response(JSON.stringify({ error: "push send failed" }), { status: 500 });
  }
});
