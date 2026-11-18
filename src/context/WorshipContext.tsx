import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
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
import { StorageService } from '../services/storage';
import { pullAllFromSupabase, syncRecordToSupabase, deleteRecordFromSupabase, getSupabase } from '../services/supabase';
import { AuthService } from '../services/auth';

export type AppModule = 
  | 'dashboard'
  | 'songs'
  | 'vocalists'
  | 'lineups'
  | 'rehearsals'
  | 'tasks'
  | 'announcements'
  | 'resources';

interface WorshipContextType {
  // Navigation & View State
  activeModule: AppModule;
  setActiveModule: (module: AppModule) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Active User / Auth Portal
  currentUser: TeamMember;
  setCurrentUser: (member: TeamMember) => void;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isUserModalOpen: boolean; // Alias for backward compatibility
  setIsUserModalOpen: (open: boolean) => void;
  loginUser: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (data: {
    username: string;
    fullName: string;
    password: string;
    roleTitle?: string;
    vocalRange?: TeamMember['vocal_range'];
    instrument?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;

  // Modals & Players
  activeVideo: { title: string; url: string } | null;
  playVideo: (title: string, url: string) => void;
  closeVideo: () => void;
  activeSongChords: Song | null;
  openChords: (song: Song) => void;
  closeChords: () => void;

  // Songs & Categories
  songs: Song[];
  categories: SongCategory[];
  saveSong: (song: Song) => void;
  deleteSong: (id: string) => void;
  saveCategory: (category: SongCategory) => void;
  deleteCategory: (id: string) => void;
  checkDuplicateSong: (title: string, artist: string, currentId?: string) => Song | undefined;

  // Vocalists & Vocal Keys
  members: TeamMember[];
  saveMember: (member: TeamMember) => void;
  deleteMember: (id: string) => void;
  updateVocalKey: (songId: string, vocalistId: string, key: string) => void;

  // Service Lineups
  lineups: ServiceLineup[];
  activeLineupId: string | null;
  setActiveLineupId: (id: string | null) => void;
  saveLineup: (lineup: ServiceLineup, notify?: boolean) => void;
  deleteLineup: (id: string) => void;
  duplicateLineup: (id: string) => ServiceLineup;

  // Rehearsals & Schedule
  rehearsals: Rehearsal[];
  saveRehearsal: (rehearsal: Rehearsal) => void;
  deleteRehearsal: (id: string) => void;
  updateRsvp: (rehearsalId: string, memberId: string, status: 'going' | 'maybe' | 'cant_go') => void;

  // Tasks
  tasks: Task[];
  saveTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;

  // Announcements
  announcements: Announcement[];
  saveAnnouncement: (announcement: Announcement) => void;
  deleteAnnouncement: (id: string) => void;

  // Notifications & Activity
  notifications: NotificationItem[];
  unreadNotifCount: number;
  markNotifRead: (id: string) => void;
  markAllNotifsRead: () => void;
  activities: TeamActivity[];

  // Resources
  resources: WorshipResource[];
  saveResource: (resource: WorshipResource) => void;
  deleteResource: (id: string) => void;
}

const WorshipContext = createContext<WorshipContextType | undefined>(undefined);

export const WorshipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<AppModule>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<TeamMember>(() => {
    return AuthService.getSession() || StorageService.getCurrentUser();
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!AuthService.getSession();
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Modals
  const [activeVideo, setActiveVideo] = useState<{ title: string; url: string } | null>(null);
  const [activeSongChords, setActiveSongChords] = useState<Song | null>(null);

  // Entities
  const [members, setMembers] = useState<TeamMember[]>(StorageService.getMembers());
  const [categories, setCategories] = useState<SongCategory[]>(StorageService.getCategories());
  const [songs, setSongs] = useState<Song[]>(StorageService.getSongs());
  const [lineups, setLineups] = useState<ServiceLineup[]>(StorageService.getLineups());
  const [activeLineupId, setActiveLineupId] = useState<string | null>('lineup-1');
  const [rehearsals, setRehearsals] = useState<Rehearsal[]>(StorageService.getRehearsals());
  const [tasks, setTasks] = useState<Task[]>(StorageService.getTasks());
  const [announcements, setAnnouncements] = useState<Announcement[]>(StorageService.getAnnouncements());
  const [notifications, setNotifications] = useState<NotificationItem[]>(StorageService.getNotifications());
  const [activities, setActivities] = useState<TeamActivity[]>(StorageService.getActivities());
  const [resources, setResources] = useState<WorshipResource[]>(StorageService.getResources());

  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  // Multi-device real-time sync with Supabase
  useEffect(() => {
    // 1. Initial & Continuous Pull
    const syncAll = () => {
      pullAllFromSupabase().then((res) => {
        if (res.success) {
          setMembers(StorageService.getMembers());
          setCategories(StorageService.getCategories());
          setSongs(StorageService.getSongs());
          setLineups(StorageService.getLineups());
          setRehearsals(StorageService.getRehearsals());
          setTasks(StorageService.getTasks());
          setAnnouncements(StorageService.getAnnouncements());
        }
      }).catch((err) => {
        console.warn('Supabase sync note:', err);
      });
    };

    syncAll();

    // 2. Subscribe to Supabase Realtime channel for instant broadcast across devices
    const client = getSupabase();
    let channel: any = null;
    if (client) {
      try {
        channel = client
          .channel('worship-team-realtime')
          .on('postgres_changes', { event: '*', schema: 'public' }, () => {
            syncAll();
          })
          .subscribe();
      } catch (e) {
        console.warn('Realtime subscription error:', e);
      }
    }

    // 3. Ultra-responsive 4-second auto-poll fallback
    const interval = setInterval(syncAll, 4000);

    return () => {
      clearInterval(interval);
      if (client && channel) {
        client.removeChannel(channel);
      }
    };
  }, []);

  const playVideo = (title: string, url: string) => {
    setActiveVideo({ title, url });
  };

  const closeVideo = () => {
    setActiveVideo(null);
  };

  const openChords = (song: Song) => {
    setActiveSongChords(song);
  };

  const closeChords = () => {
    setActiveSongChords(null);
  };

  const handleSetCurrentUser = (member: TeamMember) => {
    setCurrentUser(member);
    StorageService.setCurrentUser(member);
    AuthService.saveSession(member);
  };

  const loginUser = async (username: string, password: string) => {
    const res = await AuthService.loginUser(username, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      StorageService.setCurrentUser(res.user);
      logActivity('logged in as author', `@${res.user.username}`);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
    return res;
  };

  const registerUser = async (data: {
    username: string;
    fullName: string;
    password: string;
    roleTitle?: string;
    vocalRange?: TeamMember['vocal_range'];
    instrument?: string;
  }) => {
    const res = await AuthService.registerUser(data);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      StorageService.setCurrentUser(res.user);
      setMembers(StorageService.saveMember(res.user));
      logActivity('registered new worship member', `@${res.user.username}`);
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
    }
    return res;
  };

  const logoutUser = () => {
    AuthService.clearSession();
    setIsAuthenticated(false);
  };

  const logActivity = (action: string, target?: string) => {
    const act: TeamActivity = {
      id: `act-${Date.now()}`,
      user_name: currentUser.name,
      user_avatar: currentUser.avatar,
      action,
      timestamp: 'Just now',
      target
    };
    const updated = StorageService.addActivity(act);
    setActivities(updated);
  };

  // Songs & Categories
  const saveSong = (song: Song) => {
    const isNew = !songs.some(s => s.id === song.id);
    const updatedSong: Song = {
      ...song,
      created_by: song.created_by || currentUser.name,
      updated_by: currentUser.name,
      updated_at: new Date().toISOString()
    };
    if (isNew) {
      updatedSong.created_at = new Date().toISOString();
    }
    const updated = StorageService.saveSong(updatedSong);
    setSongs(updated);
    logActivity(isNew ? 'added song' : 'updated song', updatedSong.title);
    syncRecordToSupabase('songs', updatedSong);

    if (isNew) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'New Song Added',
        message: `${currentUser.name} added "${updatedSong.title}" by ${updatedSong.artist} (${updatedSong.category}).`,
        type: 'song',
        link_module: 'songs',
        is_read: false,
        created_at: 'Just now'
      };
      setNotifications(StorageService.addNotification(notif));
    }
  };

  const deleteSong = (id: string) => {
    const song = songs.find(s => s.id === id);
    const updated = StorageService.deleteSong(id);
    setSongs(updated);
    if (song) {
      logActivity('deleted song', song.title);
    }
    deleteRecordFromSupabase('songs', id);
  };

  const saveCategory = (cat: SongCategory) => {
    const updated = StorageService.saveCategory(cat);
    setCategories(updated);
    syncRecordToSupabase('song_categories', cat);
  };

  const deleteCategory = (id: string) => {
    const updated = StorageService.deleteCategory(id);
    setCategories(updated);
    deleteRecordFromSupabase('song_categories', id);
  };

  const checkDuplicateSong = (title: string, artist: string, currentId?: string) => {
    const cleanTitle = title.trim().toLowerCase();
    const cleanArtist = artist.trim().toLowerCase();
    return songs.find(s => 
      s.id !== currentId &&
      s.title.trim().toLowerCase() === cleanTitle &&
      s.artist.trim().toLowerCase() === cleanArtist
    );
  };

  // Team Members
  const saveMember = (member: TeamMember) => {
    const updated = StorageService.saveMember(member);
    setMembers(updated);
    logActivity('updated team member profile', member.name);
    syncRecordToSupabase('team_members', member);
  };

  const deleteMember = (id: string) => {
    const member = members.find(m => m.id === id);
    const updated = StorageService.deleteMember(id);
    setMembers(updated);
    if (member) {
      logActivity('removed team member', member.name);
    }
    deleteRecordFromSupabase('team_members', id);
  };

  const updateVocalKey = (songId: string, vocalistId: string, key: string) => {
    const song = songs.find(s => s.id === songId);
    if (!song) return;
    const vocalKeys = { ...song.vocal_keys, [vocalistId]: key };
    const updatedSong = { ...song, vocal_keys: vocalKeys, updated_by: currentUser.name, updated_at: new Date().toISOString() };
    saveSong(updatedSong);
  };

  // Service Lineups
  const saveLineup = (lineup: ServiceLineup, notify = false) => {
    const isNew = !lineups.some(l => l.id === lineup.id);
    const updatedLineup: ServiceLineup = {
      ...lineup,
      created_by: lineup.created_by || currentUser.name,
      updated_by: currentUser.name,
      updated_at: new Date().toISOString(),
      history: isNew
        ? [
            {
              id: `h-${Date.now()}`,
              action: 'Created worship set',
              user_name: currentUser.name,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        : notify
        ? [
            ...(lineup.history || []),
            {
              id: `h-${Date.now()}`,
              action: lineup.status === 'published' ? 'Published worship set' : 'Updated lineup',
              user_name: currentUser.name,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        : (lineup.history || [])
    };
    if (isNew) {
      updatedLineup.created_at = new Date().toISOString();
    }
    const updated = StorageService.saveLineup(updatedLineup);
    setLineups(updated);
    if (isNew || notify) {
      logActivity(isNew ? 'created service lineup' : 'saved service lineup', updatedLineup.title);
    }
    syncRecordToSupabase('service_lineups', updatedLineup);

    if (notify) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: updatedLineup.status === 'published' ? 'Service Lineup Published!' : 'Lineup Updated',
        message: `${updatedLineup.title} for ${updatedLineup.service_date} (${updatedLineup.songs.length} songs) posted by ${currentUser.name}.`,
        type: 'lineup',
        link_module: 'lineups',
        is_read: false,
        created_at: 'Just now'
      };
      setNotifications(StorageService.addNotification(notif));
    }
  };

  const deleteLineup = (id: string) => {
    const updated = StorageService.deleteLineup(id);
    setLineups(updated);
    deleteRecordFromSupabase('service_lineups', id);
    if (activeLineupId === id) {
      setActiveLineupId(updated[0]?.id || null);
    }
  };

  const duplicateLineup = (id: string): ServiceLineup => {
    const original = lineups.find(l => l.id === id);
    if (!original) throw new Error('Lineup not found');
    const newLineup: ServiceLineup = {
      ...original,
      id: `lineup-${Date.now()}`,
      title: `${original.title} (Copy)`,
      status: 'draft',
      created_by: currentUser.name,
      updated_by: currentUser.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      history: [{
        id: `h-${Date.now()}`,
        action: `Duplicated from ${original.title}`,
        user_name: currentUser.name,
        timestamp: 'Just now'
      }]
    };
    const updated = StorageService.saveLineup(newLineup);
    setLineups(updated);
    setActiveLineupId(newLineup.id);
    syncRecordToSupabase('service_lineups', newLineup);
    return newLineup;
  };

  // Rehearsals & RSVP
  const saveRehearsal = (rehearsal: Rehearsal) => {
    const isNew = !rehearsals.some(r => r.id === rehearsal.id);
    const updatedRehearsal: Rehearsal = {
      ...rehearsal,
      created_by: rehearsal.created_by || currentUser.name
    };
    const updated = StorageService.saveRehearsal(updatedRehearsal);
    setRehearsals(updated);
    logActivity('scheduled rehearsal', rehearsal.title);
    syncRecordToSupabase('rehearsals', updatedRehearsal);

    if (isNew) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Rehearsal Scheduled',
        message: `${rehearsal.title} on ${rehearsal.date} at ${rehearsal.start_time} (${rehearsal.venue}) by ${currentUser.name}.`,
        type: 'rehearsal',
        link_module: 'rehearsals',
        is_read: false,
        created_at: 'Just now'
      };
      setNotifications(StorageService.addNotification(notif));
    }
  };

  const deleteRehearsal = (id: string) => {
    const updated = StorageService.deleteRehearsal(id);
    setRehearsals(updated);
    deleteRecordFromSupabase('rehearsals', id);
  };

  const updateRsvp = (rehearsalId: string, memberId: string, status: 'going' | 'maybe' | 'cant_go') => {
    const rehearsal = rehearsals.find(r => r.id === rehearsalId);
    if (!rehearsal) return;
    const participantIndex = rehearsal.participants.findIndex(p => p.member_id === memberId);
    let updatedParticipants = [...rehearsal.participants];
    if (participantIndex >= 0) {
      updatedParticipants[participantIndex] = {
        ...updatedParticipants[participantIndex],
        rsvp: status
      };
    } else {
      const member = members.find(m => m.id === memberId);
      if (member) {
        updatedParticipants.push({
          member_id: member.id,
          member_name: member.name,
          rsvp: status
        });
      }
    }
    const updatedRehearsal = {
      ...rehearsal,
      participants: updatedParticipants
    };
    saveRehearsal(updatedRehearsal);
  };

  // Tasks
  const saveTask = (task: Task) => {
    const isNew = !tasks.some(t => t.id === task.id);
    const updatedTask: Task = {
      ...task,
      updated_at: new Date().toISOString()
    };
    if (isNew) {
      updatedTask.created_by = currentUser.name;
      updatedTask.created_at = new Date().toISOString();
    }
    const updated = StorageService.saveTask(updatedTask);
    setTasks(updated);
    logActivity(isNew ? 'created new task' : 'updated task', task.title);
    syncRecordToSupabase('tasks', updatedTask);

    if (isNew && task.assigned_to_id !== currentUser.id) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Task Assigned to You',
        message: `${currentUser.name} assigned you: ${task.title}. Due ${task.due_date}.`,
        type: 'task',
        link_module: 'tasks',
        is_read: false,
        created_at: 'Just now'
      };
      setNotifications(StorageService.addNotification(notif));
    }
  };

  const deleteTask = (id: string) => {
    const updated = StorageService.deleteTask(id);
    setTasks(updated);
    deleteRecordFromSupabase('tasks', id);
  };

  const toggleTaskStatus = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const nextStatus: Record<string, Task['status']> = {
      'Pending': 'In Progress',
      'In Progress': 'Completed',
      'Completed': 'Pending'
    };
    const updatedTask: Task = {
      ...task,
      status: nextStatus[task.status] || 'Pending',
      updated_at: new Date().toISOString()
    };
    if (updatedTask.status === 'Completed') {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
    }
    saveTask(updatedTask);
  };

  // Announcements
  const saveAnnouncement = (ann: Announcement) => {
    const isNew = !announcements.some(a => a.id === ann.id);
    const updatedAnn: Announcement = {
      ...ann,
      author_id: ann.author_id || currentUser.id,
      author_name: ann.author_name || currentUser.name,
      author_avatar: ann.author_avatar || currentUser.avatar
    };
    const updated = StorageService.saveAnnouncement(updatedAnn);
    setAnnouncements(updated);
    logActivity(isNew ? 'published announcement' : 'updated announcement', ann.title);
    syncRecordToSupabase('announcements', updatedAnn);

    if (isNew) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: ann.is_important ? 'Important Announcement' : 'New Announcement',
        message: `${ann.title} - posted by ${currentUser.name}`,
        type: 'announcement',
        link_module: 'announcements',
        is_read: false,
        created_at: 'Just now'
      };
      setNotifications(StorageService.addNotification(notif));
    }
  };

  const deleteAnnouncement = (id: string) => {
    const updated = StorageService.deleteAnnouncement(id);
    setAnnouncements(updated);
    deleteRecordFromSupabase('announcements', id);
  };

  // Notifications
  const markNotifRead = (id: string) => {
    const updated = StorageService.markNotificationRead(id);
    setNotifications(updated);
  };

  const markAllNotifsRead = () => {
    const updated = StorageService.markAllNotificationsRead();
    setNotifications(updated);
  };

  // Resources
  const saveResource = (res: WorshipResource) => {
    const updatedResource = {
      ...res,
      uploaded_by: res.uploaded_by || currentUser.name
    };
    const updated = StorageService.saveResource(updatedResource);
    setResources(updated);
  };

  const deleteResource = (id: string) => {
    const updated = StorageService.deleteResource(id);
    setResources(updated);
  };

  return (
    <WorshipContext.Provider
      value={{
        activeModule,
        setActiveModule,
        searchQuery,
        setSearchQuery,
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        isAuthenticated,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isUserModalOpen: isAuthModalOpen,
        setIsUserModalOpen: setIsAuthModalOpen,
        loginUser,
        registerUser,
        logoutUser,
        activeVideo,
        playVideo,
        closeVideo,
        activeSongChords,
        openChords,
        closeChords,
        songs,
        categories,
        saveSong,
        deleteSong,
        saveCategory,
        deleteCategory,
        checkDuplicateSong,
        members,
        saveMember,
        deleteMember,
        updateVocalKey,
        lineups,
        activeLineupId,
        setActiveLineupId,
        saveLineup,
        deleteLineup,
        duplicateLineup,
        rehearsals,
        saveRehearsal,
        deleteRehearsal,
        updateRsvp,
        tasks,
        saveTask,
        deleteTask,
        toggleTaskStatus,
        announcements,
        saveAnnouncement,
        deleteAnnouncement,
        notifications,
        unreadNotifCount,
        markNotifRead,
        markAllNotifsRead,
        activities,
        resources,
        saveResource,
        deleteResource
      }}
    >
      {children}
    </WorshipContext.Provider>
  );
};

export const useWorship = () => {
  const context = useContext(WorshipContext);
  if (!context) {
    throw new Error('useWorship must be used within a WorshipProvider');
  }
  return context;
};
