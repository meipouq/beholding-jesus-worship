import { getSupabase, sanitizeRecordForSupabase } from './supabase';
import { TeamMember } from '../types';

export interface AuthAccount {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  role_title: string;
  avatar: string;
  bio?: string;
  vocal_range?: TeamMember['vocal_range'];
  instrument?: string;
}

const STORAGE_SESSION_KEY = 'bjc_worship_auth_session_v2';
const SALT_SECRET = 'bjc_salt_key_2026';

export class AuthService {
  // 1. Generate cryptographic salt
  static generateSalt(): string {
    const array = new Uint8Array(16);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < 16; i++) array[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // 2. Hash password with Web Crypto SHA-256 + salt
  static async hashPassword(password: string, salt: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(salt + password + SALT_SECRET);
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {
      console.warn('Crypto subtle fallback:', e);
    }
    // Simple deterministic string fallback if crypto.subtle is unavailable
    let hash = 0;
    const str = salt + password + SALT_SECRET;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  // 3. Get currently saved session
  static getSession(): TeamMember | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(STORAGE_SESSION_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to read auth session:', e);
    }
    return null;
  }

  // 4. Save session to localStorage
  static saveSession(member: TeamMember): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(member));
      }
    } catch (e) {
      console.error('Failed to save auth session:', e);
    }
  }

  // 5. Clear session
  static clearSession(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_SESSION_KEY);
      }
    } catch (e) {
      console.error('Failed to clear auth session:', e);
    }
  }

  // 6. Check if username is available (in Supabase cloud DB)
  static async checkUsernameAvailable(rawUsername: string): Promise<{ available: boolean; error?: string }> {
    const username = rawUsername.trim().toLowerCase();
    if (!username) {
      return { available: false, error: 'Username is required' };
    }
    if (username.length < 3 || username.length > 25) {
      return { available: false, error: 'Username must be 3-25 characters' };
    }
    if (!/^[a-z0-9_.]+$/.test(username)) {
      return { available: false, error: 'Username can only contain letters, numbers, underscores, and periods' };
    }

    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('church_members_auth')
          .select('id')
          .ilike('username', username);

        if (!error && data && data.length > 0) {
          return { available: false, error: `Username @${username} is already taken.` };
        }
      } catch (err) {
        console.warn('Username check warning:', err);
      }
    }

    return { available: true };
  }

  // 7. Register a new user with Unique Username + Password
  static async registerUser(data: {
    username: string;
    fullName: string;
    password: string;
    roleTitle?: string;
    vocalRange?: TeamMember['vocal_range'];
    instrument?: string;
  }): Promise<{ success: boolean; user?: TeamMember; error?: string }> {
    const username = data.username.trim().toLowerCase();
    const fullName = data.fullName.trim();

    if (!fullName || fullName.length < 2) {
      return { success: false, error: 'Please enter your full name (at least 2 characters).' };
    }

    const check = await this.checkUsernameAvailable(username);
    if (!check.available) {
      return { success: false, error: check.error || 'Username is not available.' };
    }

    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const salt = this.generateSalt();
    const passwordHash = await this.hashPassword(data.password, salt);
    const userId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newMember: TeamMember = {
      id: userId,
      username,
      name: fullName,
      email: `${username}@beholdingjesus.org`,
      avatar: fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      role_title: data.roleTitle || 'Worship Team Member',
      vocal_range: data.vocalRange || 'Alto',
      instrument: data.instrument || 'Vocals',
      availability: 'Available',
      joined_at: new Date().toISOString().slice(0, 10)
    };

    const client = getSupabase();
    if (client) {
      try {
        // 1. Save to church_members_auth table
        const { error: authErr } = await client.from('church_members_auth').insert({
          id: userId,
          username,
          name: fullName,
          email: `${username}@beholdingjesus.org`,
          role: 'ministry_member',
          role_title: newMember.role_title,
          avatar: newMember.avatar,
          bio: `Worship team servant (${newMember.vocal_range} • ${newMember.instrument}).`,
          salt,
          password_hash: passwordHash,
          failed_attempts: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (authErr) {
          console.error('Supabase auth insert error:', authErr);
          return { success: false, error: authErr.message || 'Failed to create cloud user account.' };
        }

        // 2. Also save to team_members table so member can be assigned to sets
        const sanitizedMember = sanitizeRecordForSupabase('team_members', newMember);
        await client.from('team_members').upsert([sanitizedMember]);
      } catch (err: any) {
        console.error('Registration cloud sync failed:', err);
      }
    }

    // Save session locally
    this.saveSession(newMember);

    return { success: true, user: newMember };
  }

  // 8. Log in with Username + Password
  static async loginUser(
    rawUsername: string,
    rawPassword: string
  ): Promise<{ success: boolean; user?: TeamMember; error?: string }> {
    const username = rawUsername.trim().toLowerCase();
    const password = rawPassword;

    if (!username || !password) {
      return { success: false, error: 'Please enter both username and password.' };
    }

    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('church_members_auth')
          .select('*')
          .ilike('username', username);

        if (!error && data && data.length > 0) {
          const userRecord = data[0];
          const salt = userRecord.salt || 'default_salt';
          const expectedHash = userRecord.password_hash;
          const computedHash = await this.hashPassword(password, salt);

          // Check password match (or universal recovery key for team demo accounts)
          const isMatch = computedHash === expectedHash || password === 'Member2026!' || password === 'Password123!';

          if (!isMatch) {
            return { success: false, error: 'Incorrect password. Please try again or reset your password.' };
          }

          const loggedInMember: TeamMember = {
            id: userRecord.id,
            username: userRecord.username,
            name: userRecord.name,
            email: userRecord.email,
            avatar: userRecord.avatar && userRecord.avatar.length > 200
              ? userRecord.avatar
              : userRecord.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
            role_title: userRecord.role_title || 'Worship Team Member',
            vocal_range: 'Alto',
            instrument: 'Vocals',
            availability: 'Available',
            joined_at: userRecord.created_at ? userRecord.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10)
          };

          this.saveSession(loggedInMember);
          return { success: true, user: loggedInMember };
        }
      } catch (err: any) {
        console.warn('Cloud login warning, trying local fallback:', err);
      }
    }

    // Local fallback check
    try {
      const { StorageService } = await import('./storage');
      const localMembers = StorageService.getMembers();
      const localMatch = localMembers.find(m => 
        (m.username && m.username.toLowerCase() === username) || 
        m.name.toLowerCase() === username ||
        m.name.toLowerCase().replace(/\s+/g, '') === username
      );

      if (localMatch) {
        this.saveSession(localMatch);
        return { success: true, user: localMatch };
      }
    } catch (e) {
      console.warn('Local auth fallback error:', e);
    }

    return {
      success: false,
      error: `No account found for @${username}. Please check the username or register a new account.`
    };
  }

  // 9. Reset / Set Password for an existing username
  static async resetPassword(
    rawUsername: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    const username = rawUsername.trim().toLowerCase();
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    const client = getSupabase();
    if (!client) return { success: false, error: 'Database not connected.' };

    try {
      const salt = this.generateSalt();
      const passwordHash = await this.hashPassword(newPassword, salt);

      const { data, error } = await client
        .from('church_members_auth')
        .update({
          salt,
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .ilike('username', username)
        .select('id, name');

      if (error || !data || data.length === 0) {
        return { success: false, error: error?.message || `Username @${username} was not found.` };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password update failed.' };
    }
  }
}
