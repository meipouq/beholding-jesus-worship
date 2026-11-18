export interface TeamMember {
  id: string;
  username?: string;
  name: string;
  email: string;
  avatar: string;
  role_title: string;
  vocal_range: 'Soprano' | 'Mezzo-Soprano' | 'Alto' | 'Tenor' | 'Baritone' | 'Bass' | 'Instrumentalist';
  instrument?: string;
  notes?: string;
  availability: 'Available' | 'Rehearsal Only' | 'Traveling' | 'On Break';
  phone?: string;
  joined_at?: string;
}

export interface SongCategory {
  id: string;
  name: string;
  is_default?: boolean;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  composer?: string;
  genre?: string;
  category: string; // Joyful, Fast Praise, Slow Worship, Solemn, Hymns, Intimate Worship, Uplifting, Thanksgiving, Tagalog Worship, English Worship, etc.
  original_key: string;
  tempo_bpm?: number;
  time_signature?: string;
  youtube_url?: string;
  spotify_url?: string;
  lyrics: string;
  chords?: string;
  song_notes?: string;
  vocal_keys: Record<string, string>; // vocalist_id -> key (e.g. { "m-1": "D", "m-2": "C" })
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface LineupSongItem {
  id: string;
  song_id: string;
  title: string;
  artist: string;
  category: string;
  original_key: string;
  selected_key: string;
  assigned_vocalist_id?: string;
  assigned_vocalist_name?: string;
  youtube_url?: string;
  notes?: string;
  order: number;
}

export interface LineupHistoryItem {
  id: string;
  action: string;
  user_name: string;
  timestamp: string;
}

export interface ServiceLineup {
  id: string;
  title: string; // e.g. "Sunday Worship Service"
  service_date: string; // YYYY-MM-DD
  service_time: string; // "9:00 AM"
  worship_leader_id: string;
  worship_leader_name: string;
  assigned_vocalists: Array<{
    id: string;
    name: string;
    role?: string;
    vocal_range?: string;
    avatar?: string;
  }>;
  assigned_musicians: Array<{
    id: string;
    name: string;
    instrument: string;
    avatar?: string;
  }>;
  status: 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  songs: LineupSongItem[];
  theme?: string;
  notes?: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  history: LineupHistoryItem[];
}

export interface RehearsalParticipant {
  member_id: string;
  member_name: string;
  rsvp: 'going' | 'maybe' | 'cant_go' | 'pending';
}

export interface Rehearsal {
  id: string;
  title: string;
  type: 'Worship Rehearsal' | 'Sunday Service' | 'Soundcheck' | 'Team Meeting' | 'Special Event';
  date: string; // YYYY-MM-DD
  start_time: string; // "4:00 PM"
  end_time: string; // "6:00 PM"
  venue: string; // "Main Sanctuary"
  prep_notes: string;
  lineup_id?: string;
  participants: RehearsalParticipant[];
  created_by: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to_id: string;
  assigned_to_name: string;
  due_date: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementAttachment {
  name: string;
  url: string;
  type: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  attachments?: AnnouncementAttachment[];
  author_id: string;
  author_name: string;
  author_avatar: string;
  is_pinned: boolean;
  is_important: boolean;
  status?: 'draft' | 'published';
  event_date?: string;
  event_time?: string;
  created_at: string;
  updated_at?: string;
}

export interface ChatAttachment {
  url: string;
  name: string;
  type: 'image' | 'file';
  size?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  content: string;
  attachments?: ChatAttachment[];
  reply_to?: {
    id: string;
    sender_name: string;
    content: string;
  };
  reactions: Record<string, string[]>; // emoji -> array of user_names e.g. { "🙏": ["John", "Sarah"] }
  created_at: string;
}

export interface Conversation {
  id: string;
  name: string;
  is_direct: boolean;
  channel_type?: 'general' | 'lineups' | 'vocalists' | 'band' | 'prayer';
  description?: string;
  participant_ids: string[];
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'lineup' | 'song' | 'rehearsal' | 'task' | 'announcement';
  link_module?: string;
  is_read: boolean;
  created_at: string;
}

export interface TeamActivity {
  id: string;
  user_name: string;
  user_avatar: string;
  action: string;
  timestamp: string;
  target?: string;
}

export interface WorshipResource {
  id: string;
  title: string;
  category: 'Chord Charts' | 'Vocal Guide' | 'Audio Track' | 'Stage Plot' | 'Policy / Guidelines';
  file_url: string;
  file_type: string;
  file_size: string;
  notes?: string;
  uploaded_by: string;
  created_at: string;
}
