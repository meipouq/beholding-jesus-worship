import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageService } from './storage';
import { ServiceLineup, Announcement } from '../types';
import { formatDisplayTime } from '../utils/timeFormat';

let supabaseClient: SupabaseClient | null = null;
let currentSupabaseUrl = '';
let currentSupabaseKey = '';

// Exact whitelisted columns for each Supabase table to prevent PGRST204 schema cache errors
const TABLE_COLUMNS: Record<string, string[]> = {
  team_members: [
    'id', 'name', 'email', 'avatar', 'role_title', 'vocal_range',
    'instrument', 'notes', 'availability', 'phone', 'created_at'
  ],
  songs: [
    'id', 'title', 'artist', 'composer', 'genre', 'category', 'original_key',
    'tempo_bpm', 'time_signature', 'youtube_url', 'spotify_url', 'lyrics',
    'chords', 'song_notes', 'vocal_keys', 'created_by', 'updated_by', 'created_at', 'updated_at'
  ],
  service_lineups: [
    'id', 'title', 'service_date', 'service_time', 'worship_leader_id',
    'worship_leader_name', 'assigned_vocalists', 'assigned_musicians',
    'status', 'theme', 'notes', 'songs', 'history', 'created_by', 'updated_by',
    'created_at', 'updated_at'
  ],
  song_categories: [
    'id', 'name', 'is_default', 'created_at'
  ],
  rehearsals: [
    'id', 'title', 'type', 'date', 'start_time', 'end_time', 'venue',
    'prep_notes', 'lineup_id', 'participants', 'created_by', 'created_at'
  ],
  tasks: [
    'id', 'title', 'description', 'assigned_to_id', 'assigned_to_name',
    'due_date', 'priority', 'status', 'notes', 'created_by', 'created_at', 'updated_at'
  ],
  announcements: [
    'id', 'title', 'content', 'attachments', 'author_id', 'author_name',
    'author_avatar', 'is_pinned', 'is_important', 'status', 'event_date', 'event_time', 'created_at', 'updated_at'
  ],
  church_members_auth: [
    'id', 'username', 'name', 'email', 'role', 'role_title', 'avatar',
    'bio', 'salt', 'password_hash', 'failed_attempts', 'lockout_until',
    'created_at', 'updated_at'
  ],
  push_subscriptions: [
    'id', 'user_id', 'endpoint', 'p256dh', 'auth', 'user_agent', 'platform', 'created_at', 'updated_at'
  ],
  push_preferences: [
    'user_id', 'push_enabled', 'categories', 'updated_at'
  ]
};

export function sanitizeRecordForSupabase(table: string, record: any): any {
  if (!record || typeof record !== 'object') return record;
  const allowed = TABLE_COLUMNS[table];
  const sanitized: Record<string, any> = {};

  if (allowed) {
    for (const key of allowed) {
      if (key in record && record[key] !== undefined) {
        sanitized[key] = record[key];
      }
    }
  } else {
    Object.assign(sanitized, record);
    delete sanitized.joined_at;
  }

  // Ensure table specific required defaults to satisfy database NOT NULL constraints
  if (table === 'songs') {
    if (!sanitized.created_by) sanitized.created_by = 'Worship Team';
    if (!sanitized.updated_by) sanitized.updated_by = sanitized.created_by;
    if (!sanitized.category) sanitized.category = 'Joyful';
    if (!sanitized.original_key) sanitized.original_key = 'G';
  } else if (table === 'tasks') {
    if (!sanitized.assigned_to_name) sanitized.assigned_to_name = 'Worship Member';
    if (!sanitized.due_date) sanitized.due_date = new Date().toISOString().slice(0, 10);
    if (!sanitized.created_by) sanitized.created_by = 'Worship Lead';
  } else if (table === 'announcements') {
    if (!sanitized.author_name) sanitized.author_name = 'Worship Ministry';
    if (sanitized.event_time) {
      sanitized.event_time = formatDisplayTime(sanitized.event_time) || null;
    }
  } else if (table === 'service_lineups') {
    if (!sanitized.worship_leader_name) sanitized.worship_leader_name = 'Worship Leader';
    if (!sanitized.created_by) sanitized.created_by = 'Worship Leader';
    if (!sanitized.updated_by) sanitized.updated_by = sanitized.created_by;
    sanitized.service_time = formatDisplayTime(sanitized.service_time) || '9:00 AM';
    // Database schema constraint allows 'draft' and 'published'
    if (sanitized.status === 'cancelled') {
      sanitized.status = 'draft';
      if (!sanitized.notes?.includes('[CANCELLED]')) {
        sanitized.notes = sanitized.notes ? `[CANCELLED] ${sanitized.notes}` : '[CANCELLED]';
      }
    } else if (sanitized.status === 'completed') {
      sanitized.status = 'published';
      if (!sanitized.notes?.includes('[COMPLETED]')) {
        sanitized.notes = sanitized.notes ? `[COMPLETED] ${sanitized.notes}` : '[COMPLETED]';
      }
    } else if (sanitized.status === 'upcoming' || sanitized.status === 'ongoing') {
      sanitized.status = 'published';
    } else if (sanitized.status !== 'draft') {
      sanitized.status = 'published';
    }
  } else if (table === 'rehearsals') {
    sanitized.start_time = formatDisplayTime(sanitized.start_time) || '4:00 PM';
    sanitized.end_time = formatDisplayTime(sanitized.end_time) || '6:00 PM';
  } else if (table === 'team_members') {
    if (!sanitized.vocal_range) sanitized.vocal_range = 'Alto';
    if (!sanitized.availability) sanitized.availability = 'Available';
    // Protect database from massive base64 payloads (>50KB) that cause quota exhaustion
    if (sanitized.avatar && typeof sanitized.avatar === 'string' && sanitized.avatar.startsWith('data:image/') && sanitized.avatar.length > 50000) {
      console.warn('Excessively large avatar string detected in team_members (>50KB). Resetting to initials to protect egress quota.');
      sanitized.avatar = sanitized.name ? sanitized.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'TM';
    }
  }

  return sanitized;
}

export function getSupabase(): SupabaseClient | null {
  const config = StorageService.getSupabaseConfig();
  if (!config.url || !config.key) {
    return null;
  }
  
  if (!supabaseClient || currentSupabaseUrl !== config.url || currentSupabaseKey !== config.key) {
    try {
      supabaseClient = createClient(config.url, config.key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });
      currentSupabaseUrl = config.url;
      currentSupabaseKey = config.key;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseClient;
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = createClient(url, key);
    const { error } = await testClient.from('songs').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "songs" does not exist')) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected successfully to Supabase!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection failed' };
  }
}

// Push all local items to Supabase
export async function pushAllToSupabase(): Promise<{ success: boolean; message: string }> {
  const client = getSupabase();
  if (!client) {
    return { success: false, message: 'Supabase client is not configured.' };
  }

  try {
    const members = StorageService.getMembers().map(m => sanitizeRecordForSupabase('team_members', m));
    const categories = StorageService.getCategories().map(c => sanitizeRecordForSupabase('song_categories', c));
    const songs = StorageService.getSongs().map(s => sanitizeRecordForSupabase('songs', s));
    const lineups = StorageService.getLineups().map(l => sanitizeRecordForSupabase('service_lineups', l));
    const rehearsals = StorageService.getRehearsals().map(r => sanitizeRecordForSupabase('rehearsals', r));
    const tasks = StorageService.getTasks().map(t => sanitizeRecordForSupabase('tasks', t));
    const announcements = StorageService.getAnnouncements().map(a => sanitizeRecordForSupabase('announcements', a));

    if (members.length > 0) {
      const { error } = await client.from('team_members').upsert(members);
      if (error) console.warn('Push team_members warning:', error.message);
    }

    if (categories.length > 0) {
      const { error } = await client.from('song_categories').upsert(categories);
      if (error) console.warn('Push song_categories warning:', error.message);
    }

    if (songs.length > 0) {
      const { error } = await client.from('songs').upsert(songs);
      if (error) console.warn('Push songs warning:', error.message);
    }

    if (lineups.length > 0) {
      const { error } = await client.from('service_lineups').upsert(lineups);
      if (error) console.warn('Push service_lineups warning:', error.message);
    }

    if (rehearsals.length > 0) {
      const { error } = await client.from('rehearsals').upsert(rehearsals);
      if (error) console.warn('Push rehearsals warning:', error.message);
    }

    if (tasks.length > 0) {
      const { error } = await client.from('tasks').upsert(tasks);
      if (error) console.warn('Push tasks warning:', error.message);
    }

    if (announcements.length > 0) {
      const { error } = await client.from('announcements').upsert(announcements);
      if (error) console.warn('Push announcements warning:', error.message);
    }

    return {
      success: true,
      message: `Successfully uploaded ${songs.length} songs, ${lineups.length} lineups, ${members.length} vocalists, and tasks to Supabase!`
    };
  } catch (err: any) {
    console.error('Push to Supabase failed:', err);
    return { success: false, message: err.message || 'Failed to upload to Supabase' };
  }
}

// Pull all items from Supabase and save to local storage
export async function pullAllFromSupabase(): Promise<{ success: boolean; count: number; message: string }> {
  const client = getSupabase();
  if (!client) {
    return { success: false, count: 0, message: 'Supabase client is not configured.' };
  }

  try {
    let totalPulled = 0;

    const [
      { data: members, error: memErr },
      { data: categories, error: catErr },
      { data: songs, error: songErr },
      { data: lineups, error: linErr },
      { data: rehearsals, error: rehErr },
      { data: tasks, error: taskErr },
      { data: announcements, error: annErr }
    ] = await Promise.all([
      client.from('team_members').select('*'),
      client.from('song_categories').select('*'),
      client.from('songs').select('*'),
      client.from('service_lineups').select('*'),
      client.from('rehearsals').select('*'),
      client.from('tasks').select('*'),
      client.from('announcements').select('*')
    ]);

    // Live sync: whether array is empty (due to deletions) or populated, update local storage!
    if (!memErr && Array.isArray(members)) {
      StorageService.setMembers(members);
      totalPulled += members.length;
    }
    if (!catErr && Array.isArray(categories) && categories.length > 0) {
      StorageService.setCategories(categories);
    }
    if (!songErr && Array.isArray(songs)) {
      StorageService.setSongs(songs);
      totalPulled += songs.length;
    }
    if (!linErr && Array.isArray(lineups)) {
      const normalizedLineups = lineups.map(l => {
        if (l.status === 'draft' && (l.notes?.includes('[CANCELLED]') || l.history?.some((h: any) => h?.action?.toLowerCase().includes('cancel')))) {
          return { ...l, status: 'cancelled' };
        }
        if ((l.status === 'published' || l.status === 'completed') && (l.notes?.includes('[COMPLETED]') || l.history?.some((h: any) => h?.action?.toLowerCase().includes('complete')))) {
          return { ...l, status: 'completed' };
        }
        return l;
      });
      StorageService.setLineups(normalizedLineups);
      totalPulled += lineups.length;
    }
    if (!rehErr && Array.isArray(rehearsals)) {
      StorageService.setRehearsals(rehearsals);
      totalPulled += rehearsals.length;
    }
    if (!taskErr && Array.isArray(tasks)) {
      StorageService.setTasks(tasks);
      totalPulled += tasks.length;
    }
    if (!annErr && Array.isArray(announcements)) {
      StorageService.setAnnouncements(announcements);
      totalPulled += announcements.length;
    }

    return {
      success: true,
      count: totalPulled,
      message: `Synchronized ${totalPulled} items with Supabase cloud database!`
    };
  } catch (err: any) {
    console.error('Pull from Supabase failed:', err);
    return { success: false, count: 0, message: err.message || 'Failed to pull from Supabase' };
  }
}

// Asynchronous single-record sync helpers with column whitelist and self-healing retries
export async function syncRecordToSupabase(table: string, rawRecord: any): Promise<{ success: boolean; error?: any }> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase client not available' };
  try {
    let sanitized = sanitizeRecordForSupabase(table, rawRecord);
    let { error } = await client.from(table).upsert(sanitized);

    // Dynamic recovery: If Postgres reports an unknown column (PGRST204)
    if (error && error.code === 'PGRST204') {
      const match = error.message?.match(/Could not find the '([^']+)' column/);
      if (match && match[1]) {
        const col = match[1];
        delete sanitized[col];
        const retry = await client.from(table).upsert(sanitized);
        error = retry.error;
      }
    }

    // Dynamic recovery: If foreign key constraint failed (Postgres code 23503), sanitize foreign key references and retry
    if (error && error.code === '23503') {
      const fkFields = ['worship_leader_id', 'assigned_to_id', 'author_id', 'sender_id', 'lineup_id'];
      for (const fk of fkFields) {
        if (fk in sanitized) sanitized[fk] = null;
      }
      const retry = await client.from(table).upsert(sanitized);
      error = retry.error;
    }

    if (error) {
      console.warn(`Supabase upsert on ${table} error:`, error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.warn(`Background sync to ${table} failed:`, err);
    return { success: false, error: err };
  }
}

export async function deleteRecordFromSupabase(table: string, id: string): Promise<{ success: boolean; error?: any }> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase client not available' };
  try {
    const { error } = await client.from(table).delete().eq('id', id);
    if (error) {
      console.warn(`Background delete from ${table} error:`, error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.warn(`Background delete from ${table} failed:`, err);
    return { success: false, error: err };
  }
}
