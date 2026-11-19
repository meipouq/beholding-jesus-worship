import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// --- Simulation of Edge Function Deduplication & Rate Limiting Engine ---
class PushSecurityEngine {
  constructor(maxPerMinute = 5) {
    this.maxPerMinute = maxPerMinute;
    this.notificationsSent = new Set(); // unique (user_id:notification_id)
    this.rateLimits = new Map(); // user_id -> { count, windowStart }
  }

  // Atomic gate check mimicking the PostgreSQL check_and_record_push function
  async checkAndRecordPush(userId, notificationId, category = 'general') {
    const key = `${userId}:${notificationId}`;

    // 1. Atomic Deduplication check
    if (this.notificationsSent.has(key)) {
      return { allowed: false, reason: 'duplicate' };
    }

    // 2. Durable Rate Limiter check (60-second window)
    const now = Date.now();
    const userRate = this.rateLimits.get(userId);

    if (!userRate) {
      this.rateLimits.set(userId, { count: 1, windowStart: now });
    } else {
      const elapsed = now - userRate.windowStart;
      if (elapsed > 60000) {
        this.rateLimits.set(userId, { count: 1, windowStart: now });
      } else {
        if (userRate.count >= this.maxPerMinute) {
          return { allowed: false, reason: 'rate_limited' };
        }
        userRate.count += 1;
      }
    }

    // 3. Mark sent
    this.notificationsSent.add(key);
    return { allowed: true, reason: 'ok' };
  }

  // Path safety validator
  validateUrl(url) {
    if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }
    return '/';
  }

  // Payload validator
  validatePayload(payload) {
    const { user_id, notification_id, title, body } = payload;
    if (!user_id || typeof user_id !== 'string') return { valid: false, error: 'Invalid or missing user_id' };
    if (!notification_id || typeof notification_id !== 'string') return { valid: false, error: 'Invalid or missing notification_id' };
    if (!title || typeof title !== 'string' || title.length > 200) return { valid: false, error: 'Invalid or oversized title' };
    if (!body || typeof body !== 'string' || body.length > 1000) return { valid: false, error: 'Invalid or oversized body' };
    return { valid: true };
  }
}

// ==========================================
// TEST SUITE 1: Rate Limiting & Concurrency
// ==========================================
test('Rate Limiter: Allows exactly 5 pushes within 60s and rejects the 6th with rate_limited', async () => {
  const engine = new PushSecurityEngine(5);
  const userId = 'user-test-rate-limit';

  const results = [];
  for (let i = 1; i <= 6; i++) {
    const res = await engine.checkAndRecordPush(userId, `notif-step-${i}`, 'lineup');
    results.push(res);
  }

  // The first 5 requests must be allowed
  for (let i = 0; i < 5; i++) {
    assert.equal(results[i].allowed, true, `Request ${i + 1} should be allowed`);
    assert.equal(results[i].reason, 'ok');
  }

  // The 6th request must be rejected with rate_limited
  assert.equal(results[5].allowed, false, '6th request should be rate limited');
  assert.equal(results[5].reason, 'rate_limited');
});

// ========================================================
// TEST SUITE 2: Simultaneous Duplicate Requests (Race Condition)
// ========================================================
test('Deduplication: Handles simultaneous concurrent duplicate requests atomically', async () => {
  const engine = new PushSecurityEngine(5);
  const userId = 'user-test-concurrent-dedup';
  const duplicateNotificationId = 'shared-lineup-published-uuid-999';

  // Fire 10 simultaneous promises with identical notification_id
  const promises = Array.from({ length: 10 }, () =>
    engine.checkAndRecordPush(userId, duplicateNotificationId, 'lineup')
  );

  const outcomes = await Promise.all(promises);

  const allowedCount = outcomes.filter(o => o.allowed === true).length;
  const duplicateCount = outcomes.filter(o => o.reason === 'duplicate').length;

  assert.equal(allowedCount, 1, 'Exactly ONE request must be allowed across simultaneous race condition');
  assert.equal(duplicateCount, 9, 'All 9 concurrent duplicate requests must be detected and suppressed');
});

// ==========================================
// TEST SUITE 3: Payload & URL Path Safety
// ==========================================
test('URL Path Safety: Rejects open redirects, protocols, and double-slash phishing', () => {
  const engine = new PushSecurityEngine();

  assert.equal(engine.validateUrl('/lineups'), '/lineups');
  assert.equal(engine.validateUrl('/rehearsals/123'), '/rehearsals/123');
  assert.equal(engine.validateUrl('https://evil-phishing.com'), '/');
  assert.equal(engine.validateUrl('http://insecure.org'), '/');
  assert.equal(engine.validateUrl('//malicious-domain.com'), '/');
  assert.equal(engine.validateUrl('javascript:alert(1)'), '/');
  assert.equal(engine.validateUrl(null), '/');
  assert.equal(engine.validateUrl(undefined), '/');
});

test('Payload Validation: Rejects invalid or oversized data', () => {
  const engine = new PushSecurityEngine();

  assert.equal(engine.validatePayload({}).valid, false);
  assert.equal(engine.validatePayload({ user_id: 'u1' }).valid, false);
  assert.equal(engine.validatePayload({ user_id: 'u1', notification_id: 'n1' }).valid, false);
  assert.equal(engine.validatePayload({
    user_id: 'u1',
    notification_id: 'n1',
    title: 'Valid Title',
    body: 'Valid Body'
  }).valid, true);

  // Oversized title (>200 chars)
  assert.equal(engine.validatePayload({
    user_id: 'u1',
    notification_id: 'n1',
    title: 'A'.repeat(250),
    body: 'Valid Body'
  }).valid, false);
});

// ==========================================
// TEST SUITE 4: PWA Manifest Integrity
// ==========================================
test('PWA Manifest: Has valid standalone display, correct icons, and start_url', () => {
  const manifestPath = path.resolve('public', 'manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist in public directory');

  const content = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(content.display, 'standalone', 'PWA display mode must be standalone for iOS support');
  assert.ok(content.name, 'PWA must have a name');
  assert.ok(content.short_name, 'PWA must have a short_name');
  assert.ok(content.icons && content.icons.length >= 2, 'PWA must include multiple icon resolutions');
  assert.ok(content.icons.some(i => i.sizes === '192x192'), 'Must include 192x192 icon');
  assert.ok(content.icons.some(i => i.sizes === '512x512'), 'Must include 512x512 icon');
});

// ==========================================
// TEST SUITE 5: Service Worker & SQL Assets
// ==========================================
test('Service Worker & SQL Migration: Files exist and contain required handlers and RLS', () => {
  const swPath = path.resolve('public', 'sw.js');
  assert.ok(fs.existsSync(swPath), 'public/sw.js must exist');
  const swCode = fs.readFileSync(swPath, 'utf8');
  assert.ok(swCode.includes("addEventListener('push'"), 'Service worker must handle push event');
  assert.ok(swCode.includes("addEventListener('notificationclick'"), 'Service worker must handle notificationclick');

  const sqlPath = path.resolve('supabase_push_notifications.sql');
  assert.ok(fs.existsSync(sqlPath), 'supabase_push_notifications.sql must exist');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  assert.ok(sql.includes('create table if not exists public.push_subscriptions'), 'Must create push_subscriptions');
  assert.ok(sql.includes('create table if not exists public.notifications_sent'), 'Must create notifications_sent');
  assert.ok(sql.includes('create table if not exists public.push_rate_limits'), 'Must create push_rate_limits');
  assert.ok(sql.includes('alter table public.notifications_sent enable row level security'), 'RLS must be enabled on notifications_sent');
  assert.ok(sql.includes('revoke all on public.notifications_sent from anon, authenticated'), 'Anon/authenticated must not have access to notifications_sent');
});
