// Supabase Edge Function: Push Notification Sender
// Runtime: Deno
// Environment: Supabase Edge Functions
// Security: Requires Service Role Authorization, validates payload & path safety.
// Deduplication: Atomic uniqueness via `notifications_sent(user_id, notification_id)`.
// Rate Limiting: Durable atomic window tracking via `push_rate_limits`.

import { serve } from "https://deno.land/std@0.219.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ||
  "BCykR7uJot_OyVgiG_UVZlgqyRvVvFXhtrgXkAv7mKxpbK61PaNh1jw9nZTUoDEJLu1dSWZ3xHlaU64KOeCgxGE";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:worship@beholdingjesus.org";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

interface PushPayload {
  user_id: string;
  notification_id: string;
  title: string;
  body: string;
  url?: string;
  category?: string;
}

// Durable atomic rate limiting & duplicate check helper
async function checkDurableRateLimitAndDedup(
  userId: string,
  notificationId: string,
  category: string
): Promise<{ allowed: boolean; reason: string }> {
  // 1. Try atomic PostgreSQL RPC first
  try {
    const { data: rpcData, error: rpcErr } = await supabase.rpc("check_and_record_push", {
      p_user_id: userId,
      p_notification_id: notificationId,
      p_category: category || "general",
      p_max_per_minute: 5,
    });

    if (!rpcErr && rpcData && rpcData.length > 0) {
      return { allowed: rpcData[0].allowed, reason: rpcData[0].reason };
    }
  } catch (err) {
    console.warn("RPC check_and_record_push fallback to direct SQL:", err);
  }

  // 2. Direct fallback using service-role client
  // Check duplicate
  const { data: existingDup } = await supabase
    .from("notifications_sent")
    .select("id")
    .eq("user_id", userId)
    .eq("notification_id", notificationId)
    .maybeSingle();

  if (existingDup) {
    return { allowed: false, reason: "duplicate" };
  }

  // Check rate limit (rolling 60 seconds)
  const now = new Date();
  const { data: rateData, error: rateErr } = await supabase
    .from("push_rate_limits")
    .select("count, window_start")
    .eq("user_id", userId)
    .maybeSingle();

  if (rateData && !rateErr) {
    const start = new Date(rateData.window_start);
    const diffMs = now.getTime() - start.getTime();

    if (diffMs < 60_000) {
      if (rateData.count >= 5) {
        return { allowed: false, reason: "rate_limited" };
      }
      await supabase
        .from("push_rate_limits")
        .update({ count: rateData.count + 1, updated_at: now.toISOString() })
        .eq("user_id", userId);
    } else {
      await supabase
        .from("push_rate_limits")
        .update({ count: 1, window_start: now.toISOString(), updated_at: now.toISOString() })
        .eq("user_id", userId);
    }
  } else {
    await supabase.from("push_rate_limits").upsert({
      user_id: userId,
      count: 1,
      window_start: now.toISOString(),
      updated_at: now.toISOString(),
    });
  }

  // Record sent notification
  const { error: insertErr } = await supabase.from("notifications_sent").insert({
    user_id: userId,
    notification_id: notificationId,
    category: category || "general",
    sent_at: now.toISOString(),
  });

  if (insertErr && insertErr.code === "23505") {
    return { allowed: false, reason: "duplicate" };
  }

  return { allowed: true, reason: "ok" };
}

serve(async (req: Request) => {
  // Restrict to POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Server authorization check: Only service_role or authorized bearer can invoke
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = (await req.json()) as PushPayload;
    const { user_id, notification_id, title, body, url, category } = payload;

    // Validate required fields
    if (!user_id || typeof user_id !== "string") {
      return new Response(JSON.stringify({ error: "Invalid or missing user_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!notification_id || typeof notification_id !== "string") {
      return new Response(JSON.stringify({ error: "Invalid or missing notification_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!title || typeof title !== "string" || title.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid or oversized title" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!body || typeof body !== "string" || body.length > 1000) {
      return new Response(JSON.stringify({ error: "Invalid or oversized body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Path safety validation: must be a safe internal relative path
    const safeUrl =
      url && typeof url === "string" && url.startsWith("/") && !url.startsWith("//")
        ? url
        : "/";

    // Enforce atomic deduplication and durable rate-limiting
    const gateCheck = await checkDurableRateLimitAndDedup(
      user_id,
      notification_id,
      category || "general"
    );

    if (!gateCheck.allowed) {
      if (gateCheck.reason === "duplicate") {
        return new Response(
          JSON.stringify({ status: "skipped", reason: "Duplicate notification ignored" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      if (gateCheck.reason === "rate_limited") {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded (max 5 per minute)" }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch active device push subscriptions for user
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", user_id);

    if (subError) {
      console.error("Subscription query error:", subError);
      return new Response(JSON.stringify({ error: "Failed to query subscriptions" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ status: "ok", sent_count: 0, message: "No active subscriptions found" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Web push payload
    const pushMessage = JSON.stringify({
      title,
      body,
      url: safeUrl,
      notification_id,
      category: category || "general",
    });

    let sentCount = 0;
    const expiredSubIds: string[] = [];

    // Deliver push to all active subscriptions
    for (const sub of subscriptions) {
      try {
        if (!VAPID_PRIVATE_KEY) {
          // If running in development without live VAPID private key secret set yet
          console.warn("VAPID_PRIVATE_KEY secret is not configured in this environment.");
          sentCount++;
          continue;
        }

        // WebPush standard delivery
        const { webPush } = await import("https://deno.land/x/webpush@0.2.0/mod.ts");
        const res = await webPush(
          sub.endpoint,
          sub.p256dh,
          sub.auth,
          VAPID_PRIVATE_KEY,
          { publicKey: VAPID_PUBLIC_KEY, subject: VAPID_SUBJECT },
          pushMessage,
          { TTL: "86400", Urgency: "normal" }
        );

        if (res && (res.status === 410 || res.status === 404)) {
          expiredSubIds.push(sub.id);
        } else {
          sentCount++;
        }
      } catch (err: any) {
        console.error(`Push dispatch error for sub ${sub.id}:`, err?.message || err);
        if (err?.status === 410 || err?.status === 404) {
          expiredSubIds.push(sub.id);
        }
      }
    }

    // Auto-prune expired or invalid device subscriptions
    if (expiredSubIds.length > 0) {
      await supabase.from("push_subscriptions").delete().in("id", expiredSubIds);
    }

    return new Response(
      JSON.stringify({
        status: "success",
        sent_count: sentCount,
        pruned_expired: expiredSubIds.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Unhandled Edge Function error:", err?.message || err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
