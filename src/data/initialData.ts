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

export const INITIAL_MEMBERS: TeamMember[] = [];

export const INITIAL_CATEGORIES: SongCategory[] = [
  { id: 'cat-1', name: 'Joyful', is_default: true },
  { id: 'cat-2', name: 'Fast Praise', is_default: true },
  { id: 'cat-3', name: 'Slow Worship', is_default: true },
  { id: 'cat-4', name: 'Solemn', is_default: true },
  { id: 'cat-5', name: 'Hymns', is_default: true },
  { id: 'cat-6', name: 'Intimate Worship', is_default: true },
  { id: 'cat-7', name: 'Uplifting', is_default: true },
  { id: 'cat-8', name: 'Thanksgiving', is_default: true },
  { id: 'cat-9', name: 'Tagalog Worship', is_default: true },
  { id: 'cat-10', name: 'English Worship', is_default: true },
];

export const INITIAL_SONGS: Song[] = [];

export const INITIAL_LINEUPS: ServiceLineup[] = [];

export const INITIAL_REHEARSALS: Rehearsal[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    name: 'General Worship Team',
    is_direct: false,
    channel_type: 'general',
    description: 'Main chat for general worship team fellowship, praise reports, and coordination.',
    participant_ids: [],
    unread_count: 0
  },
  {
    id: 'conv-2',
    name: 'Sunday Service Lineup',
    is_direct: false,
    channel_type: 'lineups',
    description: 'Discussion and notes specific to Sunday worship setlists and arrangements.',
    participant_ids: [],
    unread_count: 0
  },
  {
    id: 'conv-3',
    name: 'Vocalists & Harmonies',
    is_direct: false,
    channel_type: 'vocalists',
    description: 'Vocal warmups, key adjustments, and harmony assignments.',
    participant_ids: [],
    unread_count: 0
  },
  {
    id: 'conv-4',
    name: 'Band & Rhythm Section',
    is_direct: false,
    channel_type: 'band',
    description: 'Drum cues, bass grooves, electric guitar tones, and tempo sync.',
    participant_ids: [],
    unread_count: 0
  }
];

export const INITIAL_MESSAGES: ChatMessage[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_ACTIVITIES: TeamActivity[] = [];

export const INITIAL_RESOURCES: WorshipResource[] = [
  {
    id: 'res-1',
    title: 'Sunday Worship Chord Chart Packet',
    category: 'Chord Charts',
    file_url: '#',
    file_type: 'PDF',
    file_size: '1.2 MB',
    notes: 'Chord sheets and lead sheets template.',
    uploaded_by: 'Worship Team',
    created_at: '2025-11-16'
  },
  {
    id: 'res-2',
    title: 'Worship Team Standards & Ministry Covenant',
    category: 'Policy / Guidelines',
    file_url: '#',
    file_type: 'PDF',
    file_size: '850 KB',
    notes: 'Punctuality, spiritual preparation, and stage attire guidelines.',
    uploaded_by: 'Pastor John Eric Manjares',
    created_at: '2025-01-10'
  },
  {
    id: 'res-3',
    title: 'Beholding Jesus Sanctuary Stage Plot & Mic Map',
    category: 'Stage Plot',
    file_url: '#',
    file_type: 'PNG',
    file_size: '2.4 MB',
    notes: 'Positioning for vocalists, monitors, and direct boxes.',
    uploaded_by: 'Marcus Cruz',
    created_at: '2025-06-15'
  }
];
