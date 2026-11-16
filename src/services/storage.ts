import {
  TeamMember,
  SongCategory,
  Song,
  ServiceLineup,
  Rehearsal,
  Task,
  Announcement,
  NotificationItem,
  TeamActivity,
  WorshipResource
} from '../types';

import {
  INITIAL_MEMBERS,
  INITIAL_CATEGORIES,
  INITIAL_SONGS,
  INITIAL_LINEUPS,
  INITIAL_REHEARSALS,
  INITIAL_TASKS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITIES,
  INITIAL_RESOURCES
} from '../data/initialData';

const STORAGE_KEYS = {
  CURRENT_USER: 'bjc_worship_current_user',
  MEMBERS: 'bjc_worship_members',
  CATEGORIES: 'bjc_worship_categories',
  SONGS: 'bjc_worship_songs',
  LINEUPS: 'bjc_worship_lineups',
  REHEARSALS: 'bjc_worship_rehearsals',
  TASKS: 'bjc_worship_tasks',
  ANNOUNCEMENTS: 'bjc_worship_announcements',
  NOTIFICATIONS: 'bjc_worship_notifications',
  ACTIVITIES: 'bjc_worship_activities',
  RESOURCES: 'bjc_worship_resources',
  SUPABASE_CONFIG: 'bjc_worship_supabase_config'
};

const CLEAN_SLATE_KEY = 'bjc_worship_clean_slate_v6';

// Purge previously cached hardcoded members, tasks, announcements, messages, songs, lineups on first run
function initializeCleanSlate(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (!localStorage.getItem(CLEAN_SLATE_KEY)) {
        localStorage.removeItem(STORAGE_KEYS.MEMBERS);
        localStorage.removeItem(STORAGE_KEYS.SONGS);
        localStorage.removeItem(STORAGE_KEYS.LINEUPS);
        localStorage.removeItem(STORAGE_KEYS.REHEARSALS);
        localStorage.removeItem(STORAGE_KEYS.TASKS);
        localStorage.removeItem(STORAGE_KEYS.ANNOUNCEMENTS);
        localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
        localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.setItem(CLEAN_SLATE_KEY, 'true');
      }
    }
  } catch (e) {
    console.error('Clean slate check error:', e);
  }
}

initializeCleanSlate();

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

export const StorageService = {
  // Current User
  getCurrentUser(): TeamMember {
    const current = getItem<TeamMember | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (current) return current;

    const members = this.getMembers();
    if (members.length > 0) {
      setItem(STORAGE_KEYS.CURRENT_USER, members[0]);
      return members[0];
    }

    // Default guest profile when no members exist yet
    const guestUser: TeamMember = {
      id: 'member-me',
      name: 'Worship Member',
      email: 'member@beholdingjesus.org',
      avatar: 'WM',
      role_title: 'Worship Team Member',
      vocal_range: 'Alto',
      instrument: 'Vocals',
      availability: 'Available',
      joined_at: new Date().toISOString().slice(0, 10)
    };
    return guestUser;
  },

  setCurrentUser(user: TeamMember): void {
    setItem(STORAGE_KEYS.CURRENT_USER, user);
  },

  // Members / Vocalists
  getMembers(): TeamMember[] {
    return getItem<TeamMember[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  },

  setMembers(members: TeamMember[]): void {
    setItem(STORAGE_KEYS.MEMBERS, members);
  },

  saveMember(member: TeamMember): TeamMember[] {
    const members = this.getMembers();
    const index = members.findIndex(m => m.id === member.id);
    let updated: TeamMember[];
    if (index >= 0) {
      updated = [...members];
      updated[index] = member;
    } else {
      updated = [member, ...members];
    }
    setItem(STORAGE_KEYS.MEMBERS, updated);
    return updated;
  },

  deleteMember(id: string): TeamMember[] {
    const members = this.getMembers().filter(m => m.id !== id);
    setItem(STORAGE_KEYS.MEMBERS, members);
    return members;
  },

  // Categories
  getCategories(): SongCategory[] {
    return getItem<SongCategory[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  setCategories(categories: SongCategory[]): void {
    setItem(STORAGE_KEYS.CATEGORIES, categories);
  },

  saveCategory(category: SongCategory): SongCategory[] {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    let updated: SongCategory[];
    if (index >= 0) {
      updated = [...categories];
      updated[index] = category;
    } else {
      updated = [...categories, category];
    }
    setItem(STORAGE_KEYS.CATEGORIES, updated);
    return updated;
  },

  deleteCategory(id: string): SongCategory[] {
    const categories = this.getCategories().filter(c => c.id !== id);
    setItem(STORAGE_KEYS.CATEGORIES, categories);
    return categories;
  },

  // Songs
  getSongs(): Song[] {
    return getItem<Song[]>(STORAGE_KEYS.SONGS, INITIAL_SONGS);
  },

  setSongs(songs: Song[]): void {
    setItem(STORAGE_KEYS.SONGS, songs);
  },

  saveSong(song: Song): Song[] {
    const songs = this.getSongs();
    const index = songs.findIndex(s => s.id === song.id);
    let updated: Song[];
    if (index >= 0) {
      updated = [...songs];
      updated[index] = song;
    } else {
      updated = [song, ...songs];
    }
    setItem(STORAGE_KEYS.SONGS, updated);
    return updated;
  },

  deleteSong(id: string): Song[] {
    const songs = this.getSongs().filter(s => s.id !== id);
    setItem(STORAGE_KEYS.SONGS, songs);
    return songs;
  },

  // Service Lineups
  getLineups(): ServiceLineup[] {
    return getItem<ServiceLineup[]>(STORAGE_KEYS.LINEUPS, INITIAL_LINEUPS);
  },

  setLineups(lineups: ServiceLineup[]): void {
    setItem(STORAGE_KEYS.LINEUPS, lineups);
  },

  saveLineup(lineup: ServiceLineup): ServiceLineup[] {
    const lineups = this.getLineups();
    const index = lineups.findIndex(l => l.id === lineup.id);
    let updated: ServiceLineup[];
    if (index >= 0) {
      updated = [...lineups];
      updated[index] = lineup;
    } else {
      updated = [lineup, ...lineups];
    }
    setItem(STORAGE_KEYS.LINEUPS, updated);
    return updated;
  },

  deleteLineup(id: string): ServiceLineup[] {
    const lineups = this.getLineups().filter(l => l.id !== id);
    setItem(STORAGE_KEYS.LINEUPS, lineups);
    return lineups;
  },

  // Rehearsals & Calendar
  getRehearsals(): Rehearsal[] {
    return getItem<Rehearsal[]>(STORAGE_KEYS.REHEARSALS, INITIAL_REHEARSALS);
  },

  setRehearsals(rehearsals: Rehearsal[]): void {
    setItem(STORAGE_KEYS.REHEARSALS, rehearsals);
  },

  saveRehearsal(rehearsal: Rehearsal): Rehearsal[] {
    const rehearsals = this.getRehearsals();
    const index = rehearsals.findIndex(r => r.id === rehearsal.id);
    let updated: Rehearsal[];
    if (index >= 0) {
      updated = [...rehearsals];
      updated[index] = rehearsal;
    } else {
      updated = [rehearsal, ...rehearsals];
    }
    setItem(STORAGE_KEYS.REHEARSALS, updated);
    return updated;
  },

  deleteRehearsal(id: string): Rehearsal[] {
    const rehearsals = this.getRehearsals().filter(r => r.id !== id);
    setItem(STORAGE_KEYS.REHEARSALS, rehearsals);
    return rehearsals;
  },

  // Tasks
  getTasks(): Task[] {
    return getItem<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  },

  setTasks(tasks: Task[]): void {
    setItem(STORAGE_KEYS.TASKS, tasks);
  },

  saveTask(task: Task): Task[] {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    let updated: Task[];
    if (index >= 0) {
      updated = [...tasks];
      updated[index] = task;
    } else {
      updated = [task, ...tasks];
    }
    setItem(STORAGE_KEYS.TASKS, updated);
    return updated;
  },

  deleteTask(id: string): Task[] {
    const tasks = this.getTasks().filter(t => t.id !== id);
    setItem(STORAGE_KEYS.TASKS, tasks);
    return tasks;
  },

  // Announcements
  getAnnouncements(): Announcement[] {
    return getItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  },

  setAnnouncements(announcements: Announcement[]): void {
    setItem(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
  },

  saveAnnouncement(announcement: Announcement): Announcement[] {
    const announcements = this.getAnnouncements();
    const index = announcements.findIndex(a => a.id === announcement.id);
    let updated: Announcement[];
    if (index >= 0) {
      updated = [...announcements];
      updated[index] = announcement;
    } else {
      updated = [announcement, ...announcements];
    }
    setItem(STORAGE_KEYS.ANNOUNCEMENTS, updated);
    return updated;
  },

  deleteAnnouncement(id: string): Announcement[] {
    const announcements = this.getAnnouncements().filter(a => a.id !== id);
    setItem(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
    return announcements;
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    return getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  addNotification(notif: NotificationItem): NotificationItem[] {
    const notifs = [notif, ...this.getNotifications()];
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return notifs;
  },

  markNotificationRead(id: string): NotificationItem[] {
    const notifs = this.getNotifications().map(n => n.id === id ? { ...n, is_read: true } : n);
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return notifs;
  },

  markAllNotificationsRead(): NotificationItem[] {
    const notifs = this.getNotifications().map(n => ({ ...n, is_read: true }));
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return notifs;
  },

  // Activities
  getActivities(): TeamActivity[] {
    return getItem<TeamActivity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  },

  addActivity(act: TeamActivity): TeamActivity[] {
    const acts = [act, ...this.getActivities()].slice(0, 30);
    setItem(STORAGE_KEYS.ACTIVITIES, acts);
    return acts;
  },

  // Resources
  getResources(): WorshipResource[] {
    return getItem<WorshipResource[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
  },

  saveResource(res: WorshipResource): WorshipResource[] {
    const resources = this.getResources();
    const index = resources.findIndex(r => r.id === res.id);
    let updated: WorshipResource[];
    if (index >= 0) {
      updated = [...resources];
      updated[index] = res;
    } else {
      updated = [res, ...resources];
    }
    setItem(STORAGE_KEYS.RESOURCES, updated);
    return updated;
  },

  deleteResource(id: string): WorshipResource[] {
    const resources = this.getResources().filter(r => r.id !== id);
    setItem(STORAGE_KEYS.RESOURCES, resources);
    return resources;
  },

  // Supabase Configuration
  getSupabaseConfig(): { url: string; key: string } {
    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
    const stored = getItem(STORAGE_KEYS.SUPABASE_CONFIG, { url: '', key: '' });
    return {
      url: stored.url || envUrl || 'https://rpeevqhwwbqixuaxhsot.supabase.co',
      key: stored.key || envKey || 'sb_publishable_kHVMAKw9XSrvQ69xIH2gmw_9RcvlYO6'
    };
  },

  saveSupabaseConfig(config: { url: string; key: string }): void {
    setItem(STORAGE_KEYS.SUPABASE_CONFIG, config);
  },

  // Full Database Export and Import for Backups
  exportDatabaseJSON(): string {
    const backup = {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      church: 'Beholding Jesus - Worship Team',
      data: {
        members: this.getMembers(),
        categories: this.getCategories(),
        songs: this.getSongs(),
        lineups: this.getLineups(),
        rehearsals: this.getRehearsals(),
        tasks: this.getTasks(),
        announcements: this.getAnnouncements(),
        notifications: this.getNotifications(),
        activities: this.getActivities(),
        resources: this.getResources()
      }
    };
    return JSON.stringify(backup, null, 2);
  },

  importDatabaseJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.data) throw new Error('Invalid backup format: missing data property');
      const { data } = parsed;
      if (Array.isArray(data.members)) setItem(STORAGE_KEYS.MEMBERS, data.members);
      if (Array.isArray(data.categories)) setItem(STORAGE_KEYS.CATEGORIES, data.categories);
      if (Array.isArray(data.songs)) setItem(STORAGE_KEYS.SONGS, data.songs);
      if (Array.isArray(data.lineups)) setItem(STORAGE_KEYS.LINEUPS, data.lineups);
      if (Array.isArray(data.rehearsals)) setItem(STORAGE_KEYS.REHEARSALS, data.rehearsals);
      if (Array.isArray(data.tasks)) setItem(STORAGE_KEYS.TASKS, data.tasks);
      if (Array.isArray(data.announcements)) setItem(STORAGE_KEYS.ANNOUNCEMENTS, data.announcements);
      if (Array.isArray(data.notifications)) setItem(STORAGE_KEYS.NOTIFICATIONS, data.notifications);
      if (Array.isArray(data.activities)) setItem(STORAGE_KEYS.ACTIVITIES, data.activities);
      if (Array.isArray(data.resources)) setItem(STORAGE_KEYS.RESOURCES, data.resources);
      return true;
    } catch (err) {
      console.error('Failed to import database JSON:', err);
      return false;
    }
  },

  resetToDefault(): void {
    setItem(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    setItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    setItem(STORAGE_KEYS.SONGS, INITIAL_SONGS);
    setItem(STORAGE_KEYS.LINEUPS, INITIAL_LINEUPS);
    setItem(STORAGE_KEYS.REHEARSALS, INITIAL_REHEARSALS);
    setItem(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    setItem(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    setItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setItem(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
    setItem(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
  }
};
