import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageService } from './storage';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const config = StorageService.getSupabaseConfig();
  if (!config.url || !config.key) {
    return null;
  }
  
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(config.url, config.key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });
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
    const members = StorageService.getMembers();
    const categories = StorageService.getCategories();
    const songs = StorageService.getSongs();
    const lineups = StorageService.getLineups();
    const rehearsals = StorageService.getRehearsals();
    const tasks = StorageService.getTasks();
    const announcements = StorageService.getAnnouncements();

    if (members.length > 0) {
      const { error } = await client.from('team_members').upsert(members);
      if (error) throw error;
    }

    if (categories.length > 0) {
      const { error } = await client.from('song_categories').upsert(categories);
      if (error) throw error;
    }

    if (songs.length > 0) {
      const { error } = await client.from('songs').upsert(songs);
      if (error) throw error;
    }

    if (lineups.length > 0) {
      const { error } = await client.from('service_lineups').upsert(lineups);
      if (error) throw error;
    }

    if (rehearsals.length > 0) {
      const { error } = await client.from('rehearsals').upsert(rehearsals);
      if (error) throw error;
    }

    if (tasks.length > 0) {
      const { error } = await client.from('tasks').upsert(tasks);
      if (error) throw error;
    }

    if (announcements.length > 0) {
      const { error } = await client.from('announcements').upsert(announcements);
      if (error) throw error;
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
      { data: members },
      { data: categories },
      { data: songs },
      { data: lineups },
      { data: rehearsals },
      { data: tasks },
      { data: announcements }
    ] = await Promise.all([
      client.from('team_members').select('*'),
      client.from('song_categories').select('*'),
      client.from('songs').select('*'),
      client.from('service_lineups').select('*'),
      client.from('rehearsals').select('*'),
      client.from('tasks').select('*'),
      client.from('announcements').select('*')
    ]);

    if (members && members.length > 0) {
      StorageService.setMembers(members);
      totalPulled += members.length;
    }
    if (categories && categories.length > 0) {
      StorageService.setCategories(categories);
    }
    if (songs && songs.length > 0) {
      StorageService.setSongs(songs);
      totalPulled += songs.length;
    }
    if (lineups && lineups.length > 0) {
      StorageService.setLineups(lineups);
      totalPulled += lineups.length;
    }
    if (rehearsals && rehearsals.length > 0) {
      StorageService.setRehearsals(rehearsals);
      totalPulled += rehearsals.length;
    }
    if (tasks && tasks.length > 0) {
      StorageService.setTasks(tasks);
      totalPulled += tasks.length;
    }
    if (announcements && announcements.length > 0) {
      StorageService.setAnnouncements(announcements);
      totalPulled += announcements.length;
    }

    return {
      success: true,
      count: totalPulled,
      message: `Pulled ${totalPulled} items from Supabase cloud database!`
    };
  } catch (err: any) {
    console.error('Pull from Supabase failed:', err);
    return { success: false, count: 0, message: err.message || 'Failed to pull from Supabase' };
  }
}

// Asynchronous single-record sync helpers
export async function syncRecordToSupabase(table: string, record: any): Promise<void> {
  const client = getSupabase();
  if (!client) return;
  try {
    await client.from(table).upsert(record);
  } catch (err) {
    console.warn(`Background sync to ${table} failed:`, err);
  }
}

export async function deleteRecordFromSupabase(table: string, id: string): Promise<void> {
  const client = getSupabase();
  if (!client) return;
  try {
    await client.from(table).delete().eq('id', id);
  } catch (err) {
    console.warn(`Background delete from ${table} failed:`, err);
  }
}
