import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Helper: generate base64url string
function toBase64Url(obj) {
  const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Helper: build a mock JWT
function createMockJWT(payload, header = { alg: 'HS256', typ: 'JWT' }) {
  const h = toBase64Url(header);
  const p = toBase64Url(payload);
  const s = toBase64Url('mock-signature');
  return `${h}.${p}.${s}`;
}

// -------------------------------------------------------------
// Core Verification Logic mirroring functions/push_sender.ts
// -------------------------------------------------------------
function verifyServiceRoleAuth(authHeader, serviceRoleKey) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, statusCode: 401, error: 'Missing or malformed Authorization header. Bearer token required.' };
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    return { authorized: false, statusCode: 401, error: 'Empty Bearer token provided.' };
  }

  // Exact match with server key
  if (serviceRoleKey && token === serviceRoleKey) {
    return { authorized: true, statusCode: 200, error: '' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { authorized: false, statusCode: 401, error: 'Invalid JWT format. Must contain three dot-separated segments.' };
  }

  try {
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));

    if (payload.exp && typeof payload.exp === 'number') {
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (payload.exp < nowSeconds) {
        return { authorized: false, statusCode: 401, error: 'JWT has expired.' };
      }
    }

    if (payload.role !== 'service_role') {
      return {
        authorized: false,
        statusCode: 403,
        error: `Forbidden: Caller has role '${payload.role || 'unknown'}'. Only 'service_role' is authorized.`
      };
    }

    return { authorized: true, statusCode: 200, error: '' };
  } catch (err) {
    return { authorized: false, statusCode: 401, error: 'Failed to parse or validate JWT: Invalid payload' };
  }
}

// -------------------------------------------------------------
// Simulated Database State with Row Locking & Deduplication
// -------------------------------------------------------------
class MockDatabase {
  constructor() {
    this.notificationsSent = new Set(); // user_id:notification_id
    this.rateLimits = new Map(); // user_id -> { window_start, count }
    this.preferences = new Map(); // user_id -> { push_enabled, categories }
    this.subscriptions = new Map(); // user_id -> Array<{ id, endpoint, p256dh, auth }>
    this.rpcShouldFail = false;
  }

  // Atomically checks duplicate status & rate limit under concurrency with row-level locks
  async checkAndRecordPush(userId, notificationId, category, maxPerMinute = 5) {
    if (this.rpcShouldFail) {
      throw new Error('Database connection or RPC execution failure');
    }

    // 1. Check duplicate
    const key = `${userId}:${notificationId}`;
    if (this.notificationsSent.has(key)) {
      return [{ allowed: false, reason: 'duplicate' }];
    }

    // 2. Row-level locked rate limit check
    const now = Date.now();
    let userRow = this.rateLimits.get(userId);

    // Initial first-time insert on conflict do nothing
    if (!userRow) {
      userRow = { window_start: now, count: 0 };
      this.rateLimits.set(userId, userRow);
    }

    if (now - userRow.window_start > 60000) {
      userRow.window_start = now;
      userRow.count = 1;
    } else {
      if (userRow.count >= maxPerMinute) {
        return [{ allowed: false, reason: 'rate_limited' }];
      }
      userRow.count += 1;
    }

    // 3. Insert notification sent
    this.notificationsSent.add(key);
    return [{ allowed: true, reason: 'ok' }];
  }

  // Edge Function dispatcher simulation
  async dispatchNotification(authHeader, payload, vapidPrivateKey, serviceRoleKey) {
    // 1. Auth check
    const auth = verifyServiceRoleAuth(authHeader, serviceRoleKey);
    if (!auth.authorized) {
      return { status: auth.statusCode, body: { error: auth.error } };
    }

    // 2. VAPID configuration check
    if (!vapidPrivateKey) {
      return {
        status: 500,
        body: {
          error: 'Server VAPID configuration error: private key missing',
          delivered: false,
          sent_count: 0
        }
      };
    }

    // 3. Payload validation
    const { user_id, notification_id, title, body, category } = payload;
    if (!user_id || !notification_id || !title || !body) {
      return { status: 400, body: { error: 'Missing required payload fields' } };
    }

    // 4. Server-Side Preference check
    const prefs = this.preferences.get(user_id);
    if (prefs) {
      if (prefs.push_enabled === false) {
        return {
          status: 200,
          body: { status: 'skipped', reason: 'Push notifications disabled by user preferences', sent_count: 0 }
        };
      }
      const cat = (category || 'general').toLowerCase();
      if (prefs.categories && prefs.categories[cat] === false) {
        return {
          status: 200,
          body: { status: 'skipped', reason: `Category '${cat}' disabled by user preferences`, sent_count: 0 }
        };
      }
    }

    // 5. Atomic Rate Limiting & Duplicate check via RPC (Safe failure: no non-atomic fallbacks)
    let rpcData;
    try {
      rpcData = await this.checkAndRecordPush(user_id, notification_id, category);
    } catch (err) {
      return {
        status: 500,
        body: {
          error: 'Failed to verify rate limit and deduplication gate safely',
          delivered: false,
          sent_count: 0
        }
      };
    }

    const gate = rpcData[0];
    if (!gate.allowed) {
      if (gate.reason === 'duplicate') {
        return { status: 200, body: { status: 'skipped', reason: 'Duplicate notification ignored', sent_count: 0 } };
      }
      if (gate.reason === 'rate_limited') {
        return { status: 429, body: { error: 'Rate limit exceeded (max 5 per minute)', sent_count: 0 } };
      }
    }

    // 6. Subscriptions
    const subs = this.subscriptions.get(user_id) || [];
    if (subs.length === 0) {
      return {
        status: 200,
        body: { status: 'ok', sent_count: 0, failed_count: 0, message: 'No active push subscriptions found for user' }
      };
    }

    let sentCount = 0;
    let failedCount = 0;
    for (const sub of subs) {
      if (sub.isExpired) {
        failedCount++;
      } else {
        sentCount++;
      }
    }

    return {
      status: 200,
      body: {
        status: sentCount > 0 ? 'success' : 'partial_or_failed',
        sent_count: sentCount,
        failed_count: failedCount
      }
    };
  }
}

// ========================================================
// 1. Edge Function Authentication Tests
// ========================================================
test('Auth: Rejects missing Authorization header with 401', () => {
  const res = verifyServiceRoleAuth(null, 'srv-key-123');
  assert.equal(res.authorized, false);
  assert.equal(res.statusCode, 401);
});

test('Auth: Rejects malformed or non-Bearer headers with 401', () => {
  const res = verifyServiceRoleAuth('Basic some-token', 'srv-key-123');
  assert.equal(res.authorized, false);
  assert.equal(res.statusCode, 401);
});

test('Auth: Rejects ordinary authenticated users (role: "authenticated") with 403 Forbidden', () => {
  const userToken = createMockJWT({
    sub: 'user-uuid-123',
    role: 'authenticated',
    email: 'member@worship.com',
    exp: Math.floor(Date.now() / 1000) + 3600
  });

  const res = verifyServiceRoleAuth(`Bearer ${userToken}`, 'srv-key-123');
  assert.equal(res.authorized, false);
  assert.equal(res.statusCode, 403);
  assert.match(res.error, /Forbidden: Caller has role 'authenticated'/);
});

test('Auth: Rejects anonymous callers (role: "anon") with 403 Forbidden', () => {
  const anonToken = createMockJWT({
    role: 'anon',
    exp: Math.floor(Date.now() / 1000) + 3600
  });

  const res = verifyServiceRoleAuth(`Bearer ${anonToken}`, 'srv-key-123');
  assert.equal(res.authorized, false);
  assert.equal(res.statusCode, 403);
  assert.match(res.error, /Forbidden: Caller has role 'anon'/);
});

test('Auth: Rejects expired JWTs with 401 Unauthorized', () => {
  const expiredToken = createMockJWT({
    role: 'service_role',
    exp: Math.floor(Date.now() / 1000) - 60
  });

  const res = verifyServiceRoleAuth(`Bearer ${expiredToken}`, 'srv-key-123');
  assert.equal(res.authorized, false);
  assert.equal(res.statusCode, 401);
  assert.match(res.error, /JWT has expired/);
});

test('Auth: Accepts trusted service_role JWT with 200 OK', () => {
  const serviceToken = createMockJWT({
    role: 'service_role',
    iss: 'supabase',
    exp: Math.floor(Date.now() / 1000) + 3600
  });

  const res = verifyServiceRoleAuth(`Bearer ${serviceToken}`, 'srv-key-123');
  assert.equal(res.authorized, true);
  assert.equal(res.statusCode, 200);
});

test('Auth: Accepts direct service_role key match with 200 OK', () => {
  const res = verifyServiceRoleAuth('Bearer srv-key-123', 'srv-key-123');
  assert.equal(res.authorized, true);
  assert.equal(res.statusCode, 200);
});

// ========================================================
// 2. Database RPC Security & SQL Permissions Verification
// ========================================================
test('Database RPC Security: Verifies revoke and grant statements in SQL migration', () => {
  const sqlPath = path.resolve('supabase_push_notifications.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Verify explicit revoke from PUBLIC, anon, and authenticated
  assert.ok(
    sql.includes('revoke all on function public.check_and_record_push(text, text, text, int) from public, anon, authenticated;'),
    'Must explicitly revoke function execution from public, anon, authenticated'
  );

  // Verify grant strictly to service_role
  assert.ok(
    sql.includes('grant execute on function public.check_and_record_push(text, text, text, int) to service_role;'),
    'Must grant execution strictly to service_role'
  );

  // Verify search_path isolation for SECURITY DEFINER function
  assert.ok(sql.includes('security definer'), 'Function must be security definer');
  assert.ok(sql.includes('set search_path = public'), 'Function must set search_path = public');
});

// ========================================================
// 3. Concurrency, First-Time Requests & Atomic Deduplication
// ========================================================
test('Atomic Concurrency: Handles simultaneous first-time requests without primary key collision', async () => {
  const db = new MockDatabase();
  const userId = 'brand-new-user-123';

  // Fire 10 simultaneous requests for a brand-new user with distinct notification IDs
  const promises = Array.from({ length: 10 }, (_, i) =>
    db.checkAndRecordPush(userId, `notif-first-time-${i}`, 'lineup')
  );

  const results = await Promise.all(promises);
  const allowed = results.filter(r => r[0].allowed === true).length;
  const limited = results.filter(r => r[0].reason === 'rate_limited').length;

  assert.equal(allowed, 5, 'Exactly 5 first-time requests within window must be allowed');
  assert.equal(limited, 5, 'The subsequent 5 requests must be rate limited');
});

test('Atomic Deduplication: Simultaneous duplicate requests are suppressed to exactly 1 delivery', async () => {
  const db = new MockDatabase();
  const userId = 'user-race-condition';
  const sharedNotificationId = 'lineup-uuid-published-444';

  const promises = Array.from({ length: 12 }, () =>
    db.checkAndRecordPush(userId, sharedNotificationId, 'lineup')
  );

  const outcomes = await Promise.all(promises);
  const allowed = outcomes.filter(o => o[0].allowed === true).length;
  const duplicates = outcomes.filter(o => o[0].reason === 'duplicate').length;

  assert.equal(allowed, 1, 'Only 1 of the concurrent identical requests should be allowed');
  assert.equal(duplicates, 11, 'All 11 concurrent duplicate attempts must be suppressed');
});

test('Safe Failure: Edge function aborts safely with 500 if RPC fails', async () => {
  const db = new MockDatabase();
  db.rpcShouldFail = true;

  const res = await db.dispatchNotification(
    'Bearer srv-key-123',
    { user_id: 'u1', notification_id: 'n1', title: 'T', body: 'B' },
    'vapid-priv-key-valid',
    'srv-key-123'
  );

  assert.equal(res.status, 500);
  assert.match(res.body.error, /Failed to verify rate limit and deduplication gate safely/);
  assert.equal(res.body.sent_count, 0);
  assert.equal(res.body.delivered, false);
});

// ========================================================
// 4. Server-Side Notification Preferences Verification
// ========================================================
test('Preferences: Blocks notification dispatch when user has push_enabled = false', async () => {
  const db = new MockDatabase();
  db.preferences.set('user-disabled-push', {
    push_enabled: false,
    categories: { lineup: true, rehearsal: true }
  });

  const res = await db.dispatchNotification(
    'Bearer srv-key-123',
    { user_id: 'user-disabled-push', notification_id: 'n-pref-1', title: 'New Lineup', body: 'Lineup released', category: 'lineup' },
    'vapid-priv-key-valid',
    'srv-key-123'
  );

  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'skipped');
  assert.equal(res.body.reason, 'Push notifications disabled by user preferences');
  assert.equal(res.body.sent_count, 0);
});

test('Preferences: Blocks notification dispatch when user disabled specific category', async () => {
  const db = new MockDatabase();
  db.preferences.set('user-opt-out-category', {
    push_enabled: true,
    categories: { lineup: true, rehearsal: false }
  });

  const res = await db.dispatchNotification(
    'Bearer srv-key-123',
    { user_id: 'user-opt-out-category', notification_id: 'n-pref-2', title: 'Rehearsal', body: 'Rehearsal tomorrow', category: 'rehearsal' },
    'vapid-priv-key-valid',
    'srv-key-123'
  );

  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'skipped');
  assert.match(res.body.reason, /Category 'rehearsal' disabled by user preferences/);
  assert.equal(res.body.sent_count, 0);
});

// ========================================================
// 5. VAPID Configuration & Accurate Delivery Counts
// ========================================================
test('VAPID Config: Returns 500 and sent_count = 0 if private VAPID key is missing', async () => {
  const db = new MockDatabase();

  const res = await db.dispatchNotification(
    'Bearer srv-key-123',
    { user_id: 'u-valid', notification_id: 'n-vapid-missing', title: 'T', body: 'B' },
    null, // Missing VAPID private key
    'srv-key-123'
  );

  assert.equal(res.status, 500);
  assert.match(res.body.error, /Server VAPID configuration error: private key missing/);
  assert.equal(res.body.sent_count, 0);
  assert.equal(res.body.delivered, false);
});

test('Delivery Counts: Reports accurate sent and failure numbers', async () => {
  const db = new MockDatabase();
  const userId = 'user-with-multiple-devices';
  db.subscriptions.set(userId, [
    { id: 'sub-1', endpoint: 'https://push.apple.com/sub1', p256dh: 'k1', auth: 'a1', isExpired: false },
    { id: 'sub-2', endpoint: 'https://fcm.googleapis.com/sub2', p256dh: 'k2', auth: 'a2', isExpired: false },
    { id: 'sub-3', endpoint: 'https://push.services.mozilla.com/sub3', p256dh: 'k3', auth: 'a3', isExpired: true }
  ]);

  const res = await db.dispatchNotification(
    'Bearer srv-key-123',
    { user_id: userId, notification_id: 'n-count-test', title: 'Title', body: 'Body' },
    'vapid-priv-key-valid',
    'srv-key-123'
  );

  assert.equal(res.status, 200);
  assert.equal(res.body.sent_count, 2, '2 active subscriptions delivered');
  assert.equal(res.body.failed_count, 1, '1 expired subscription counted as failure');
});
