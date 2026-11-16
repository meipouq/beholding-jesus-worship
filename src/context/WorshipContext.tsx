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
  Conversation,
  ChatMessage,
  NotificationItem,
  TeamActivity,
  WorshipResource
} from '../types';
import { StorageService } from '../services/storage';
import { pullAllFromSupabase, syncRecordToSupabase, deleteRecordFromSupabase } from '../services/supabase';

export type AppModule = 
  | 'dashboard'
  | 'songs'
  | 'vocalists'
  | 'lineups'
  | 'rehearsals'
  | 'tasks'
  | 'chat'
  | 'announcements'
  | 'resources'
  | 'settings';

interface WorshipContextType {
  // Navigation & View State
  activeModule: AppModule;
  setActiveModule: (module: AppModule) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Active User / Access
  currentUser: TeamMember;
  setCurrentUser: (member: TeamMember) => void;
  isUserModalOpen: boolean;
  setIsUserModalOpen: (open: boolean) => void;

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

  // Team Chat
  conversations: Conversation[];
  messages: ChatMessage[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  saveConversation: (conv: Conversation) => void;
  sendMessage: (content: string, attachments?: any[], replyTo?: any) => void;
  toggleReaction: (messageId: string, emoji: string) => void;

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

  // Backup & Reset
  exportBackup: () => void;
  importBackup: (jsonStr: string) => boolean;
  resetAllData: () => void;
}

const WorshipContext = createContext<WorshipContextType | undefined>(undefined);

export const WorshipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<AppModule>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<TeamMember>(StorageService.getCurrentUser());
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

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
  const [conversations, setConversations] = useState<Conversation[]>(StorageService.getConversations());
  const [messages, setMessages] = useState<ChatMessage[]>(StorageService.getMessages());
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-1');
  const [notifications, setNotifications] = useState<NotificationItem[]>(StorageService.getNotifications());
  const [activities, setActivities] = useState<TeamActivity[]>(StorageService.getActivities());
  const [resources, setResources] = useState<WorshipResource[]>(StorageService.getResources());

  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  // On startup: check if Supabase is connected and pull shared team records
  useEffect(() => {
    pullAllFromSupabase().then((res) => {
      if (res.success && res.count > 0) {
        setMembers(StorageService.getMembers());
        setCategories(StorageService.getCategories());
        setSongs(StorageService.getSongs());
        setLineups(StorageService.getLineups());
        setRehearsals(StorageService.getRehearsals());
        setTasks(StorageService.getTasks());
        setAnnouncements(StorageService.getAnnouncements());
      }
    }).catch((err) => {
      console.warn('Initial Supabase pull note:', err);
    });
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
  };

  const logActivity = (action: string, target?: string) => {
    const act: TeamActivity = {
      id: `act-${Date.now()}`,
      user_name: `${currentUser.name.split(' ')[0]} ${action}`,
      user_avatar: currentUser.avatar,
      action: `${currentUser.name.split(' ')[0]} ${action}`,
      timestamp: 'Just now',
      target
    };
    const updated = StorageService.addActivity(act);
    setActivities(updated);
  };

  // Songs
  const saveSong = (song: Song) => {
    const isNew = !songs.some(s => s.id === song.id);
    const updatedSong: Song = {
      ...song,
      updated_by: currentUser.name,
      updated_at: new Date().toISOString()
    };
    if (isNew) {
      updatedSong.created_by = currentUser.name;
      updatedSong.created_at = new Date().toISOString();
    }
    const updated = StorageService.saveSong(updatedSong);
    setSongs(updated);
    logActivity(isNew ? 'added a new song' : 'updated song', song.title);
    syncRecordToSupabase('songs', updatedSong);
  };

  const deleteSong = (id: string) => {
    const song = songs.find(s => s.id === id);
    const updated = StorageService.deleteSong(id);
    setSongs(updated);
    if (song) logActivity('deleted song', song.title);
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

  const checkDuplicateSong = (title: string, artist: string, currentId?: string): Song | undefined => {
    const cleanTitle = title.trim().toLowerCase();
    const cleanArtist = artist.trim().toLowerCase();
    return songs.find(s => {
      if (currentId && s.id === currentId) return false;
      const sTitle = s.title.trim().toLowerCase();
      const sArtist = s.artist.trim().toLowerCase();
      return sTitle === cleanTitle && (sArtist === cleanArtist || sArtist.includes(cleanArtist) || cleanArtist.includes(sArtist));
    });
  };

  // Vocalists & Vocal Keys
  const saveMember = (member: TeamMember) => {
    const isFirstMember = members.length === 0 || currentUser.id === 'member-me';
    const updated = StorageService.saveMember(member);
    setMembers(updated);
    if (isFirstMember) {
      handleSetCurrentUser(member);
    }
    logActivity('added vocalist to team', member.name);
    syncRecordToSupabase('team_members', member);
  };

  const deleteMember = (id: string) => {
    const updated = StorageService.deleteMember(id);
    setMembers(updated);
    deleteRecordFromSupabase('team_members', id);
    if (currentUser.id === id) {
      if (updated.length > 0) {
        handleSetCurrentUser(updated[0]);
      } else {
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
        handleSetCurrentUser(guestUser);
      }
    }
  };

  const updateVocalKey = (songId: string, vocalistId: string, key: string) => {
    const song = songs.find(s => s.id === songId);
    if (!song) return;
    const updatedVocalKeys = {
      ...song.vocal_keys,
      [vocalistId]: key
    };
    saveSong({
      ...song,
      vocal_keys: updatedVocalKeys
    });
  };

  // Lineups
  const saveLineup = (lineup: ServiceLineup, notify = false) => {
    const isNew = !lineups.some(l => l.id === lineup.id);
    const historyItem = {
      id: `h-${Date.now()}`,
      action: isNew ? 'Created lineup' : (lineup.status === 'published' ? 'Published lineup update' : 'Saved lineup draft'),
      user_name: currentUser.name,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    const updatedLineup: ServiceLineup = {
      ...lineup,
      updated_by: currentUser.name,
      updated_at: new Date().toISOString(),
      history: [historyItem, ...(lineup.history || [])]
    };

    if (isNew) {
      updatedLineup.created_by = currentUser.name;
      updatedLineup.created_at = new Date().toISOString();
    }

    const updated = StorageService.saveLineup(updatedLineup);
    setLineups(updated);
    logActivity(lineup.status === 'published' ? 'published the service lineup' : 'saved lineup draft', lineup.title);
    syncRecordToSupabase('service_lineups', updatedLineup);

    if (lineup.status === 'published') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#A67C52', '#D4AF37', '#1F1E1D', '#EFE8DC']
      });
    }

    if (notify || (lineup.status === 'published' && isNew)) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: lineup.status === 'published' ? 'Lineup Published' : 'Lineup Updated',
        message: `${currentUser.name} updated the lineup for ${lineup.title} (${lineup.service_date}).`,
        type: 'lineup',
        link_module: 'lineups',
        is_read: false,
        created_at: 'Just now'
      };
      const updatedNotifs = StorageService.addNotification(notif);
      setNotifications(updatedNotifs);
    }
  };

  const deleteLineup = (id: string) => {
    const lineupToDelete = lineups.find(l => l.id === id);
    const updated = StorageService.deleteLineup(id);
    setLineups(updated);
    deleteRecordFromSupabase('service_lineups', id);
    if (activeLineupId === id) {
      setActiveLineupId(updated[0]?.id || null);
    }
    if (lineupToDelete) {
      logActivity('deleted service lineup', lineupToDelete.title);
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
    const updated = StorageService.saveRehearsal(rehearsal);
    setRehearsals(updated);
    logActivity('scheduled rehearsal', rehearsal.title);
    syncRecordToSupabase('rehearsals', rehearsal);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Rehearsal Scheduled',
      message: `${rehearsal.title} on ${rehearsal.date} at ${rehearsal.start_time} (${rehearsal.venue}).`,
      type: 'rehearsal',
      link_module: 'rehearsals',
      is_read: false,
      created_at: 'Just now'
    };
    setNotifications(StorageService.addNotification(notif));
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
    const updated = StorageService.saveAnnouncement(ann);
    setAnnouncements(updated);
    logActivity(isNew ? 'published announcement' : 'updated announcement', ann.title);
    syncRecordToSupabase('announcements', ann);

    if (isNew) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: ann.is_important ? 'Important Announcement' : 'New Announcement',
        message: `${ann.title} - posted by ${ann.author_name}`,
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

  // Chat
  const saveConversation = (conv: Conversation) => {
    const updated = StorageService.saveConversation(conv);
    setConversations(updated);
    setActiveConversationId(conv.id);
    logActivity('created chat channel', conv.name);
  };

  const sendMessage = (content: string, attachments?: any[], replyTo?: any) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: activeConversationId,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sender_avatar: currentUser.avatar,
      content,
      attachments: attachments || [],
      reply_to: replyTo,
      reactions: {},
      created_at: new Date().toISOString()
    };
    const updatedMsgs = StorageService.saveMessage(newMsg);
    setMessages(updatedMsgs);
    setConversations(StorageService.getConversations());
    logActivity('posted a message', content.substring(0, 30));
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;
    const currentReactions = { ...msg.reactions };
    const userList = currentReactions[emoji] || [];
    const hasReacted = userList.includes(currentUser.name);

    if (hasReacted) {
      currentReactions[emoji] = userList.filter(name => name !== currentUser.name);
      if (currentReactions[emoji].length === 0) {
        delete currentReactions[emoji];
      }
    } else {
      currentReactions[emoji] = [...userList, currentUser.name];
    }

    const updatedMsg = { ...msg, reactions: currentReactions };
    const updated = StorageService.updateMessage(updatedMsg);
    setMessages([...updated]);
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
    const updated = StorageService.saveResource(res);
    setResources(updated);
  };

  const deleteResource = (id: string) => {
    const updated = StorageService.deleteResource(id);
    setResources(updated);
  };

  // Backups
  const exportBackup = () => {
    const jsonStr = StorageService.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Beholding-Jesus-Worship-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importBackup = (jsonStr: string): boolean => {
    const ok = StorageService.importDatabaseJSON(jsonStr);
    if (ok) {
      setMembers(StorageService.getMembers());
      setCategories(StorageService.getCategories());
      setSongs(StorageService.getSongs());
      setLineups(StorageService.getLineups());
      setRehearsals(StorageService.getRehearsals());
      setTasks(StorageService.getTasks());
      setAnnouncements(StorageService.getAnnouncements());
      setConversations(StorageService.getConversations());
      setMessages(StorageService.getMessages());
      setNotifications(StorageService.getNotifications());
      setActivities(StorageService.getActivities());
      setResources(StorageService.getResources());
      return true;
    }
    return false;
  };

  const resetAllData = () => {
    StorageService.resetToDefault();
    setMembers(StorageService.getMembers());
    setCategories(StorageService.getCategories());
    setSongs(StorageService.getSongs());
    setLineups(StorageService.getLineups());
    setRehearsals(StorageService.getRehearsals());
    setTasks(StorageService.getTasks());
    setAnnouncements(StorageService.getAnnouncements());
    setConversations(StorageService.getConversations());
    setMessages(StorageService.getMessages());
    setNotifications(StorageService.getNotifications());
    setActivities(StorageService.getActivities());
    setResources(StorageService.getResources());
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
        isUserModalOpen,
        setIsUserModalOpen,
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
        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        saveConversation,
        sendMessage,
        toggleReaction,
        notifications,
        unreadNotifCount,
        markNotifRead,
        markAllNotifsRead,
        activities,
        resources,
        saveResource,
        deleteResource,
        exportBackup,
        importBackup,
        resetAllData,
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
