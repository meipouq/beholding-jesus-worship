import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  User,
  Users,
  Music,
  Music2,
  Plus,
  Play,
  FileMusic,
  FileText,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Trash2,
  Save,
  CheckCircle2,
  Copy,
  Printer,
  History,
  Sparkles,
  Search,
  X,
  Mic,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Share2,
  Send,
  Check
} from 'lucide-react';
import { ServiceLineup, LineupSongItem, Song, TeamMember } from '../../types';
import { useWorship } from '../../context/WorshipContext';
import { LineupHistoryModal } from './LineupHistoryModal';
import { LineupPrintModal } from './LineupPrintModal';
import { LineupShareModal } from './LineupShareModal';
import { SongEditModal } from '../songs/SongEditModal';

const KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
];

const CATEGORIES = ['JOYFUL', 'SOLEMN', 'UPLIFTING', 'FAST PRAISE', 'SLOW WORSHIP', 'HYMNS', 'CALL TO WORSHIP', 'OFFERTORY', 'CLOSING'];

interface LineupBuilderViewProps {
  lineupId: string | null;
  onBack: () => void;
}

export const LineupBuilderView: React.FC<LineupBuilderViewProps> = ({ lineupId, onBack }) => {
  const {
    lineups,
    songs,
    members,
    saveLineup,
    deleteLineup,
    duplicateLineup,
    playVideo,
    openChords,
    saveSong,
    currentUser
  } = useWorship();

  // Stable ID for the lineup being edited or created
  const [currentLineupId, setCurrentLineupId] = useState<string>(() => lineupId || `lineup-${Date.now()}`);
  const loadedLineupIdRef = useRef<string | null>(null);

  // Find existing lineup
  const existingLineup = lineups.find(l => l.id === (lineupId || currentLineupId));

  const [title, setTitle] = useState(existingLineup?.title || 'Sunday Worship Service');
  const [serviceDate, setServiceDate] = useState(existingLineup?.service_date || new Date().toISOString().slice(0, 10));
  const [serviceTime, setServiceTime] = useState(existingLineup?.service_time || '9:00 AM');
  // Helper to format multiple leaders into a readable string
  const formatLeaderNames = (ids: string[]): string => {
    const list = members.filter(m => ids.includes(m.id));
    if (list.length === 0) return currentUser.name;
    if (list.length === 1) return list[0].name;
    if (list.length === 2) return `${list[0].name} & ${list[1].name}`;
    return `${list[0].name}, ${list[1].name} & ${list[2].name}`;
  };

  const [selectedLeaderIds, setSelectedLeaderIds] = useState<string[]>(() => {
    if (existingLineup?.worship_leaders && existingLineup.worship_leaders.length > 0) {
      return existingLineup.worship_leaders.map(l => l.id).slice(0, 3);
    }
    if (existingLineup?.worship_leader_id) {
      return [existingLineup.worship_leader_id];
    }
    return [currentUser.id];
  });
  const worshipLeaderId = selectedLeaderIds[0] || currentUser.id;
  const [theme, setTheme] = useState(existingLineup?.theme || '');
  const [notes, setNotes] = useState(existingLineup?.notes || '');
  const [status, setStatus] = useState<ServiceLineup['status']>(existingLineup?.status || 'draft');
  const [lineupSongs, setLineupSongs] = useState<LineupSongItem[]>(existingLineup?.songs || []);
  const [selectedVocalistIds, setSelectedVocalistIds] = useState<string[]>(
    existingLineup?.assigned_vocalists?.map(v => v.id) || [currentUser.id]
  );

  // Expanded song rows
  const [expandedSongId, setExpandedSongId] = useState<string | null>(null);

  // Modals
  const [isSongPickerOpen, setIsSongPickerOpen] = useState(false);
  const [isInlineSongCreateOpen, setIsInlineSongCreateOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [songPickerSearch, setSongPickerSearch] = useState('');

  const leader = members.find(m => m.id === worshipLeaderId) || currentUser;

  // Initialize state once when lineupId is loaded or changes, NEVER re-initialize on background polling updates!
  useEffect(() => {
    if (lineupId) {
      if (existingLineup && loadedLineupIdRef.current !== lineupId) {
        loadedLineupIdRef.current = lineupId;
        setCurrentLineupId(existingLineup.id);
        setTitle(existingLineup.title);
        setServiceDate(existingLineup.service_date);
        setServiceTime(existingLineup.service_time);
        if (existingLineup.worship_leaders && existingLineup.worship_leaders.length > 0) {
          setSelectedLeaderIds(existingLineup.worship_leaders.map(l => l.id).slice(0, 3));
        } else if (existingLineup.worship_leader_id) {
          setSelectedLeaderIds([existingLineup.worship_leader_id]);
        }
        setTheme(existingLineup.theme || '');
        setNotes(existingLineup.notes || '');
        setStatus(existingLineup.status);
        setLineupSongs(existingLineup.songs || []);
        setSelectedVocalistIds(existingLineup.assigned_vocalists?.map(v => v.id) || []);
      }
    } else {
      if (loadedLineupIdRef.current !== 'new') {
        loadedLineupIdRef.current = 'new';
      }
    }
  }, [lineupId, existingLineup]);

  // Construct current working lineup object
  const getWorkingLineup = (
    currentSongs: LineupSongItem[],
    overrides?: Partial<ServiceLineup>
  ): ServiceLineup => {
    const assignedVocalists = members
      .filter(m => selectedVocalistIds.includes(m.id))
      .map(m => ({
        id: m.id,
        name: m.name,
        role: m.role_title,
        vocal_range: m.vocal_range,
        avatar: m.avatar
      }));

    const worshipLeadersData = members
      .filter(m => selectedLeaderIds.includes(m.id))
      .slice(0, 3)
      .map(m => ({
        id: m.id,
        name: m.name,
        role: m.role_title,
        avatar: m.avatar
      }));

    return {
      id: currentLineupId,
      title: title.trim() || 'Sunday Worship Service',
      service_date: serviceDate,
      service_time: serviceTime,
      worship_leader_id: selectedLeaderIds[0] || currentUser.id,
      worship_leader_name: formatLeaderNames(selectedLeaderIds),
      worship_leaders: worshipLeadersData,
      assigned_vocalists: assignedVocalists,
      assigned_musicians: existingLineup?.assigned_musicians || [],
      status,
      theme: theme.trim() || undefined,
      notes: notes.trim() || undefined,
      songs: currentSongs,
      history: existingLineup?.history || [],
      created_by: existingLineup ? existingLineup.created_by : currentUser.name,
      updated_by: currentUser.name,
      created_at: existingLineup ? existingLineup.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides
    };
  };

  const currentWorkingLineup = getWorkingLineup(lineupSongs);

  // Add existing song from library
  const handleAddSongFromLibrary = (song: Song) => {
    const primaryLeaderId = selectedLeaderIds[0] || currentUser.id;
    const defaultVocalKey = song.vocal_keys?.[primaryLeaderId] || song.original_key;
    const primaryLeader = members.find(m => m.id === primaryLeaderId) || currentUser;
    const newItem: LineupSongItem = {
      id: `ls-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      song_id: song.id,
      title: song.title,
      artist: song.artist,
      category: (song.category || 'JOYFUL').toUpperCase(),
      original_key: song.original_key,
      selected_key: defaultVocalKey,
      assigned_vocalist_id: primaryLeaderId,
      assigned_vocalist_name: primaryLeader.name,
      youtube_url: song.youtube_url,
      order: lineupSongs.length + 1
    };
    const updatedSongs = [...lineupSongs, newItem];
    setLineupSongs(updatedSongs);
    setIsSongPickerOpen(false);

    // Persist immediately so addition survives polling, refresh & navigation
    const saved = getWorkingLineup(updatedSongs);
    saveLineup(saved, false);
  };

  // Reorder songs up or down
  const moveSong = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lineupSongs.length) return;
    const reordered = [...lineupSongs];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    const updatedSongs = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setLineupSongs(updatedSongs);

    // Persist immediately
    const saved = getWorkingLineup(updatedSongs);
    saveLineup(saved, false);
  };

  // Remove song
  const removeSong = (id: string) => {
    const filtered = lineupSongs.filter(s => s.id !== id);
    const updatedSongs = filtered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setLineupSongs(updatedSongs);

    // Persist immediately so deletion survives polling, refresh & navigation
    const saved = getWorkingLineup(updatedSongs);
    saveLineup(saved, false);
  };

  // Update song item fields (title, key, category, vocalist, transition notes, youtube)
  const updateSongItem = (id: string, updates: Partial<LineupSongItem>) => {
    const updatedSongs = lineupSongs.map(s => s.id === id ? { ...s, ...updates } : s);
    setLineupSongs(updatedSongs);

    // Persist immediately
    const saved = getWorkingLineup(updatedSongs);
    saveLineup(saved, false);
  };

  // Toggle vocalist selection
  const toggleVocalist = (id: string) => {
    let nextVocalistIds: string[];
    if (selectedVocalistIds.includes(id)) {
      nextVocalistIds = selectedVocalistIds.filter(vId => vId !== id);
    } else {
      nextVocalistIds = [...selectedVocalistIds, id];
    }
    setSelectedVocalistIds(nextVocalistIds);

    const updatedVocalists = members
      .filter(m => nextVocalistIds.includes(m.id))
      .map(m => ({
        id: m.id,
        name: m.name,
        role: m.role_title,
        vocal_range: m.vocal_range,
        avatar: m.avatar
      }));

    const saved = getWorkingLineup(lineupSongs, { assigned_vocalists: updatedVocalists });
    saveLineup(saved, false);
  };

  // Toggle worship leader selection (minimum 1, maximum 3)
  const toggleLeader = (id: string) => {
    let nextLeaderIds: string[];
    if (selectedLeaderIds.includes(id)) {
      if (selectedLeaderIds.length <= 1) {
        // Keep at least 1 leader
        return;
      }
      nextLeaderIds = selectedLeaderIds.filter(lId => lId !== id);
    } else {
      if (selectedLeaderIds.length >= 3) {
        // Enforce maximum 3 worship leaders
        return;
      }
      nextLeaderIds = [...selectedLeaderIds, id];
    }
    setSelectedLeaderIds(nextLeaderIds);

    const worshipLeadersData = members
      .filter(m => nextLeaderIds.includes(m.id))
      .slice(0, 3)
      .map(m => ({
        id: m.id,
        name: m.name,
        role: m.role_title,
        avatar: m.avatar
      }));

    const formattedName = formatLeaderNames(nextLeaderIds);

    const saved = getWorkingLineup(lineupSongs, {
      worship_leader_id: nextLeaderIds[0] || currentUser.id,
      worship_leader_name: formattedName,
      worship_leaders: worshipLeadersData
    });
    saveLineup(saved, false);
  };

  // Auto-save on blur
  const handleBlurSave = () => {
    const saved = getWorkingLineup(lineupSongs);
    saveLineup(saved, false);
  };

  // Handle Back
  const handleBack = () => {
    const saved = getWorkingLineup(lineupSongs);
    saveLineup(saved, false);
    onBack();
  };

  // Save Draft or Publish
  const handleSave = (newStatus: 'draft' | 'published') => {
    const savedLineup = getWorkingLineup(lineupSongs, { status: newStatus });
    saveLineup(savedLineup, newStatus === 'published');
    setStatus(newStatus);
    alert(newStatus === 'published' ? 'Lineup published to the team successfully!' : 'Lineup draft saved successfully!');
  };

  return (
    <div className="space-y-5 pb-20 md:pb-8 max-w-3xl mx-auto text-[#F5F0E6]">
      {/* Top Header Row with Circle Back Button & Utility Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-[#1F1F21] border border-[#35312B] shadow-soft flex items-center justify-center text-[#F5F0E6] hover:bg-[#262626] active:scale-95 transition-all shrink-0 cursor-pointer"
          title="Back to Lineups"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Existing Lineup Utility Icons */}
        <div className="flex items-center gap-1.5">
          {existingLineup && (
            <>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className="p-2 rounded-full bg-[#1F1F21] hover:bg-[#262626] text-[#AAA5A0] hover:text-[#F5F0E6] border border-[#35312B] shadow-2xs active:scale-95 transition-all cursor-pointer"
                title="View Change History"
              >
                <History className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsPrintOpen(true)}
                className="p-2 rounded-full bg-[#1F1F21] hover:bg-[#262626] text-[#AAA5A0] hover:text-[#F5F0E6] border border-[#35312B] shadow-2xs active:scale-95 transition-all cursor-pointer"
                title="Print Setlist"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const dup = duplicateLineup(existingLineup.id);
                  alert(`Lineup duplicated as "${dup.title}"`);
                }}
                className="p-2 rounded-full bg-[#1F1F21] hover:bg-[#262626] text-[#AAA5A0] hover:text-[#F5F0E6] border border-[#35312B] shadow-2xs active:scale-95 transition-all cursor-pointer"
                title="Duplicate Lineup"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete lineup "${existingLineup.title}"?`)) {
                    deleteLineup(existingLineup.id);
                    onBack();
                  }
                }}
                className="p-2 rounded-full bg-[#1F1F21] hover:bg-[#E57373]/15 text-[#AAA5A0] hover:text-[#E57373] border border-[#35312B] shadow-2xs active:scale-95 transition-all cursor-pointer"
                title="Delete Entire Lineup"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Center Sacred Cross, Lineups Title & Italic Subtitle */}
      <div className="text-center space-y-0.5 pt-1 pb-2">
        <div className="flex items-center justify-center gap-3">
          <span className="w-10 h-[1px] bg-gradient-to-r from-transparent to-[#D9A441]/60" />
          <span className="text-[#D9A441] text-xl font-serif leading-none select-none">†</span>
          <span className="w-10 h-[1px] bg-gradient-to-l from-transparent to-[#D9A441]/60" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#F5F0E6] tracking-tight">
          Lineups
        </h1>
        <p className="font-serif italic text-xs sm:text-sm text-[#AAA5A0] tracking-wide">
          Plan. Worship. Serve.
        </p>
      </div>

      {/* Form Fields Stack (Matching Image 2) */}
      <div className="space-y-4">
        {/* Service Title */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-[#D9A441]" />
            <label className="text-xs font-bold text-[#F5F0E6]">
              Service Title *
            </label>
          </div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleBlurSave}
            placeholder="e.g. Sunday Worship Service"
            className="w-full text-xs font-bold px-4 py-3 rounded-2xl border border-[#35312B] bg-[#161616] text-[#F5F0E6] shadow-2xs placeholder:text-[#AAA5A0]/50 focus:outline-none focus:ring-2 focus:ring-[#D9A441]/20 focus:border-[#D9A441]"
          />
        </div>

        {/* Worship Leaders (Max 3) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D9A441]" />
              <label className="text-xs font-bold text-[#F5F0E6]">
                Worship Leaders * <span className="text-[#D9A441] font-semibold text-[11px]">({selectedLeaderIds.length}/3 selected)</span>
              </label>
            </div>
            <span className="text-[10px] text-[#AAA5A0] font-medium">
              {selectedLeaderIds.length >= 3 ? 'Max 3 reached' : 'Select up to 3 leaders'}
            </span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {members.map((m) => {
              const isSelected = selectedLeaderIds.includes(m.id);
              const isMaxReached = selectedLeaderIds.length >= 3 && !isSelected;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleLeader(m.id)}
                  disabled={isMaxReached}
                  className={`py-2 px-3.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 border cursor-pointer ${
                    isSelected
                      ? 'bg-[#D9A441] text-[#101010] border-[#D9A441] shadow-2xs ring-1 ring-[#D9A441]/30 font-bold'
                      : isMaxReached
                      ? 'bg-[#161616] text-[#AAA5A0]/40 border-[#35312B]/40 cursor-not-allowed opacity-50'
                      : 'bg-[#1F1F21] text-[#AAA5A0] hover:text-[#F5F0E6] hover:bg-[#262626] border-[#35312B] shadow-2xs'
                  } active:scale-95`}
                  title={isMaxReached ? 'Maximum 3 worship leaders allowed' : undefined}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#101010] border border-[#101010] text-[#D9A441]'
                        : 'border border-[#AAA5A0]/50 bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3] text-[#D9A441]" />}
                  </span>
                  <span>{m.name}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-[#101010]/80' : 'text-[#AAA5A0]'}`}>
                    ({m.role_title})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sermon / Worship Theme */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Music className="w-4 h-4 text-[#D9A441]" />
            <label className="text-xs font-bold text-[#F5F0E6]">
              Sermon / Worship Theme (Optional)
            </label>
          </div>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            onBlur={handleBlurSave}
            placeholder="e.g. Unwavering Faithfulness of God"
            className="w-full text-xs font-medium px-4 py-3 rounded-2xl border border-[#35312B] bg-[#161616] text-[#F5F0E6] shadow-2xs placeholder:text-[#AAA5A0]/50 focus:outline-none focus:ring-2 focus:ring-[#D9A441]/20 focus:border-[#D9A441]"
          />
        </div>

        {/* Assigned Vocalists for This Service */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D9A441]" />
              <label className="text-xs font-bold text-[#F5F0E6]">
                Assigned Vocalists for This Service
              </label>
            </div>
            <span className="text-[10px] text-[#AAA5A0] font-medium">
              Tap to select / unselect
            </span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {members.filter(m => m.vocal_range !== 'Instrumentalist').map((v) => {
              const isSelected = selectedVocalistIds.includes(v.id);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => toggleVocalist(v.id)}
                  className={`py-2 px-3.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 border cursor-pointer ${
                    isSelected
                      ? 'bg-[#D9A441] text-[#101010] border-[#D9A441] shadow-2xs ring-1 ring-[#D9A441]/30 font-bold'
                      : 'bg-[#1F1F21] text-[#AAA5A0] hover:text-[#F5F0E6] hover:bg-[#262626] border-[#35312B]'
                  } active:scale-95`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#101010] border border-[#101010] text-[#D9A441]'
                        : 'border border-[#AAA5A0]/50 bg-transparent'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#D9A441]" />}
                  </span>
                  <span>{v.name}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-[#101010]/80' : 'text-[#AAA5A0]'}`}>({v.vocal_range})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* General Team Instructions & Preparation Notes */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <FileText className="w-4 h-4 text-[#D9A441]" />
            <label className="text-xs font-bold text-[#F5F0E6]">
              General Team Instructions & Preparation Notes
            </label>
          </div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleBlurSave}
            placeholder="e.g. Call time 8:00 AM sharp. Vocalists review bridge."
            className="w-full text-xs font-medium px-4 py-3 rounded-2xl border border-[#35312B] bg-[#161616] text-[#F5F0E6] shadow-2xs placeholder:text-[#AAA5A0]/50 focus:outline-none focus:ring-2 focus:ring-[#D9A441]/20 focus:border-[#D9A441]"
          />
        </div>

        {/* Service Date & Time Card */}
        <div className="bg-[#161616] rounded-3xl p-4 sm:p-5 border border-[#35312B] space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D9A441]" />
            <label className="text-xs font-bold text-[#F5F0E6]">
              Service Date & Time *
            </label>
          </div>
          <div className="bg-[#1F1F21] rounded-2xl border border-[#35312B] flex items-center divide-x divide-[#35312B] shadow-2xs overflow-hidden">
            {/* Date Picker */}
            <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 relative">
              <Calendar className="w-4 h-4 text-[#AAA5A0] shrink-0" />
              <input
                type="date"
                required
                value={serviceDate}
                onChange={(e) => {
                  setServiceDate(e.target.value);
                  const saved = getWorkingLineup(lineupSongs, { service_date: e.target.value });
                  saveLineup(saved, false);
                }}
                className="w-full text-xs font-semibold text-[#F5F0E6] bg-transparent focus:outline-none cursor-pointer"
                style={{ WebkitAppearance: 'none' }}
              />
            </div>
            {/* Time Picker */}
            <div className="flex-1 flex items-center justify-between gap-2 px-3.5 py-2.5 relative">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Clock className="w-4 h-4 text-[#AAA5A0] shrink-0" />
                <input
                  type="text"
                  required
                  value={serviceTime}
                  onChange={(e) => setServiceTime(e.target.value)}
                  onBlur={handleBlurSave}
                  placeholder="9:00 AM"
                  className="w-full text-xs font-semibold text-[#F5F0E6] bg-transparent focus:outline-none"
                />
              </div>
              <ChevronDown className="w-4 h-4 text-[#AAA5A0] shrink-0 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Order of Songs Section */}
      <div className="space-y-3 pt-1">
        {/* Champagne Gold Accent Header Banner */}
        <div className="bg-[#1F1F21] rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 text-[#F5F0E6] flex items-center justify-between border border-[#35312B] shadow-sm">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-[#D9A441]" />
            <span className="font-bold text-sm text-[#F5F0E6]">
              Order of Songs ({lineupSongs.length})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsInlineSongCreateOpen(true)}
            className="bg-[#262626] hover:bg-[#D9A441] text-[#D9A441] hover:text-[#101010] border border-[#D9A441]/40 rounded-full px-3.5 py-1.5 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Song Inline</span>
          </button>
        </div>

        {/* Select from Library Pill Button */}
        <button
          type="button"
          onClick={() => setIsSongPickerOpen(true)}
          className="bg-[#D9A441] hover:bg-[#F5C15D] text-[#101010] rounded-full px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-all self-start"
        >
          <Music2 className="w-3.5 h-3.5" />
          <span>Select from Library</span>
        </button>

        {/* Empty State or Songs List */}
        {lineupSongs.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-[#35312B] bg-[#161616] p-8 sm:p-10 text-center space-y-1.5">
            <Music2 className="w-7 h-7 text-[#D9A441]/70 mx-auto mb-1.5" />
            <p className="font-bold text-xs text-[#F5F0E6]">Your lineup currently has no songs</p>
            <p className="text-[11px] text-[#AAA5A0]">Click "Select from Library" or "Create Song Inline" above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lineupSongs.map((item, index) => {
              const originalSong = songs.find(s => s.id === item.song_id);
              const isExpanded = expandedSongId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#35312B] bg-[#161616] hover:border-[#D9A441]/50 transition-colors p-3.5 sm:p-4 space-y-3 shadow-sm"
                >
                  {/* Song Row Main Bar - Responsive & Non-overlapping */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Song Details (Order, Move, Title, Category, Artist) */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Order and Move Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveSong(index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-[#262626] text-[#AAA5A0] hover:text-[#F5F0E6] disabled:opacity-20 disabled:pointer-events-none"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSong(index, 'down')}
                            disabled={index === lineupSongs.length - 1}
                            className="p-1 rounded hover:bg-[#262626] text-[#AAA5A0] hover:text-[#F5F0E6] disabled:opacity-20 disabled:pointer-events-none"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="w-6 h-6 rounded-full bg-[#101010] border border-[#D9A441]/60 text-[#D9A441] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                          {item.order}
                        </span>
                      </div>

                      {/* Title, Category Select & Key */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-[#F5F0E6] leading-snug">
                            {item.title}
                          </h4>
                          {/* Inline Category Select */}
                          <select
                            value={item.category}
                            onChange={(e) => updateSongItem(item.id, { category: e.target.value })}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#262626] text-[#D9A441] border border-[#35312B] focus:border-[#D9A441] focus:outline-none cursor-pointer shrink-0"
                          >
                            {CATEGORIES.map(c => (
                              <option key={c} value={c} className="bg-[#1F1F21] text-[#F5F0E6]">{c}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] flex-wrap mt-0.5">
                          <span className="text-[#D9A441] font-bold">
                            Lead: <span className="text-[#F5F0E6] font-bold">{item.assigned_vocalist_name || formatLeaderNames(selectedLeaderIds)}</span>
                          </span>
                          <span className="text-[#35312B]">•</span>
                          <span className="text-[#AAA5A0] truncate">{item.artist}</span>
                          <span className="text-[#35312B]">•</span>
                          <span className="text-[#AAA5A0] text-[10px]">Orig: <strong className="text-[#D9A441]">{item.original_key}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Key, Media & DELETE Actions Bar */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#35312B] shrink-0 flex-wrap">
                      {/* Selected Key Dropdown */}
                      <div className="flex items-center gap-1 bg-[#101010] px-2.5 py-1.5 rounded-xl border border-[#D9A441]/50 shadow-sm">
                        <span className="text-[10px] font-bold text-[#AAA5A0]">Key:</span>
                        <select
                          value={item.selected_key}
                          onChange={(e) => updateSongItem(item.id, { selected_key: e.target.value })}
                          className="text-xs font-black text-[#D9A441] bg-transparent focus:outline-none cursor-pointer"
                        >
                          {KEYS.map(k => (
                            <option key={k} value={k} className="bg-[#1F1F21] text-[#D9A441]">{k}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Play Video Reference */}
                        {item.youtube_url && (
                          <button
                            type="button"
                            onClick={() => playVideo(item.title, item.youtube_url!)}
                            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-red-950/40 border border-red-800/40 hover:bg-red-600 text-red-400 hover:text-white text-[11px] font-bold transition-colors flex items-center gap-1"
                            title="Play YouTube Video"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span className="hidden sm:inline text-[10px]">Video</span>
                          </button>
                        )}

                        {/* View Chords */}
                        {originalSong && (
                          <button
                            type="button"
                            onClick={() => openChords(originalSong)}
                            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-[#262626] border border-[#35312B] hover:bg-[#D9A441] text-[#F5F0E6] hover:text-[#101010] text-[11px] font-bold transition-colors shadow-sm flex items-center gap-1"
                            title="Open Chords & Lyrics"
                          >
                            <FileMusic className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[10px]">Chords</span>
                          </button>
                        )}

                        {/* Toggle Details button */}
                        <button
                          type="button"
                          onClick={() => setExpandedSongId(isExpanded ? null : item.id)}
                          className="p-1.5 rounded-xl hover:bg-[#262626] text-[#AAA5A0] border border-[#35312B] bg-[#1F1F21]"
                          title="Toggle Details & Notes"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {/* PROMINENT DELETE BUTTON FOR EVERY SONG */}
                        <button
                          type="button"
                          onClick={() => removeSong(item.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-950/30 hover:bg-[#E57373] text-[#E57373] hover:text-[#101010] border border-[#E57373]/30 text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
                          title="Remove this song from lineup"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Section: Vocalist Assignment, YouTube URL & Transition Notes */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-[#35312B] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-slide-up">
                      <div>
                        <label className="text-[10px] font-bold text-[#AAA5A0] uppercase tracking-wider block mb-1">
                          Song Title:
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateSongItem(item.id, { title: e.target.value })}
                          placeholder="Song Title"
                          className="w-full text-xs p-2 rounded-xl border border-[#35312B] bg-[#1F1F21] text-[#F5F0E6] focus:border-[#D9A441] focus:outline-none font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#AAA5A0] uppercase tracking-wider block mb-1">
                          Video Reference Link:
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="url"
                            value={item.youtube_url || ''}
                            onChange={(e) => updateSongItem(item.id, { youtube_url: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full text-xs p-2 rounded-xl border border-[#35312B] bg-[#1F1F21] text-[#F5F0E6] focus:border-[#D9A441] focus:outline-none"
                          />
                          {item.youtube_url && (
                            <button
                              type="button"
                              onClick={() => playVideo(item.title, item.youtube_url!)}
                              className="p-2 rounded-xl bg-red-600 text-white shrink-0 hover:bg-red-700 transition-colors"
                              title="Test Play Video"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#AAA5A0] uppercase tracking-wider block mb-1">
                          Assigned Lead Singer for this Song:
                        </label>
                        <select
                          value={item.assigned_vocalist_id || ''}
                          onChange={(e) => {
                            const vId = e.target.value;
                            const vMember = members.find(m => m.id === vId);
                            // If this vocalist has a preset key for this song, pre-select it!
                            const presetKey = originalSong?.vocal_keys?.[vId];
                            updateSongItem(item.id, {
                              assigned_vocalist_id: vId || undefined,
                              assigned_vocalist_name: vMember ? vMember.name : undefined,
                              selected_key: presetKey || item.selected_key
                            });
                          }}
                          className="w-full text-xs p-2 rounded-xl border border-[#35312B] bg-[#1F1F21] text-[#F5F0E6] focus:border-[#D9A441] focus:outline-none"
                        >
                          <option value="" className="bg-[#1F1F21] text-[#AAA5A0]">Unassigned</option>
                          {members.filter(m => m.vocal_range !== 'Instrumentalist').map(m => (
                            <option key={m.id} value={m.id} className="bg-[#1F1F21] text-[#F5F0E6]">
                              {m.name} ({m.vocal_range})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#AAA5A0] uppercase tracking-wider block mb-1">
                          Transition / Arrangement Note:
                        </label>
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={(e) => updateSongItem(item.id, { notes: e.target.value })}
                          placeholder="e.g. Drums build up, Pastor prayers after chorus 2"
                          className="w-full text-xs p-2 rounded-xl border border-[#35312B] bg-[#1F1F21] text-[#F5F0E6] focus:border-[#D9A441] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="py-3 px-4 rounded-full bg-[#1F1F21] hover:bg-[#262626] text-[#F5F0E6] border border-[#35312B] text-xs font-bold shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            title="Share Lineup / Save as Landscape Photo"
          >
            <Share2 className="w-4 h-4 text-[#D9A441] group-hover:scale-110 transition-transform" />
            <span>Share & Photo</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('draft')}
            className="py-3 px-4 rounded-full bg-[#1F1F21] hover:bg-[#262626] text-[#F5F0E6] text-xs font-bold border border-[#35312B] shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 text-[#AAA5A0]" />
            <span>Save Draft</span>
          </button>
        </div>

        {/* Full-width Champagne Gold Publish Button */}
        <button
          type="button"
          onClick={() => handleSave('published')}
          className="w-full py-3.5 px-6 rounded-full bg-[#D9A441] hover:bg-[#F5C15D] text-[#101010] text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all group"
        >
          <Send className="w-4 h-4 stroke-[2.2] group-hover:translate-x-0.5 transition-transform" />
          <span>Publish Lineup</span>
        </button>
      </div>

      {/* Song Picker Modal from Library */}
      {isSongPickerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in"
          onClick={() => setIsSongPickerOpen(false)}
        >
          <div
            className="bg-[#1F1F21] rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#35312B] animate-slide-up overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#35312B] bg-[#161616] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F5F0E6]">Add Song from Library</h3>
              <button
                onClick={() => setIsSongPickerOpen(false)}
                className="p-1 rounded-full text-[#AAA5A0] hover:text-[#F5F0E6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-[#35312B] bg-[#1F1F21]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#AAA5A0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={songPickerSearch}
                  onChange={(e) => setSongPickerSearch(e.target.value)}
                  placeholder="Search song to add..."
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#35312B] bg-[#161616] text-[#F5F0E6] placeholder:text-[#AAA5A0]/60 focus:border-[#D9A441] focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 overflow-y-auto space-y-2 flex-1">
              {songs.length === 0 ? (
                <div className="py-8 px-4 text-center text-xs text-[#AAA5A0] flex flex-col items-center justify-center">
                  <Music2 className="w-8 h-8 text-[#AAA5A0]/40 mb-2" />
                  <p className="font-bold text-[#F5F0E6]">No songs in library yet</p>
                  <p className="text-[11px] text-[#AAA5A0] mt-0.5 mb-3">Create a new song to add directly to this lineup.</p>
                  <button
                    onClick={() => {
                      setIsSongPickerOpen(false);
                      setIsInlineSongCreateOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#D9A441] hover:bg-[#F5C15D] text-[#101010] font-bold text-xs shadow-sm transition-all"
                  >
                    + Create New Song
                  </button>
                </div>
              ) : (
                songs
                  .filter(s => s.title.toLowerCase().includes(songPickerSearch.toLowerCase()) || s.artist.toLowerCase().includes(songPickerSearch.toLowerCase()))
                  .map(song => (
                    <div
                      key={song.id}
                      onClick={() => handleAddSongFromLibrary(song)}
                      className="p-3 rounded-2xl bg-[#161616] hover:bg-[#262626] border border-transparent hover:border-[#D9A441]/40 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-[#F5F0E6]">{song.title}</h4>
                        <p className="text-[11px] text-[#AAA5A0]">{song.artist} • {song.category}</p>
                      </div>
                      <span className="font-black text-[#D9A441] px-2 py-0.5 bg-[#101010] rounded-lg border border-[#D9A441]/50">
                        Key {song.original_key}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inline Song Creator Modal (Requirement: Create a new song without leaving the lineup builder!) */}
      {isInlineSongCreateOpen && (
        <SongEditModal
          song={null}
          onClose={() => setIsInlineSongCreateOpen(false)}
          onSave={(newSong) => {
            saveSong(newSong);
            handleAddSongFromLibrary(newSong);
            setIsInlineSongCreateOpen(false);
          }}
        />
      )}

      {/* History Modal */}
      {isHistoryOpen && existingLineup && (
        <LineupHistoryModal
          lineup={existingLineup}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}

      {/* Print Setlist Modal */}
      {isPrintOpen && existingLineup && (
        <LineupPrintModal
          lineup={existingLineup}
          onClose={() => setIsPrintOpen(false)}
        />
      )}

      {/* Share / Save as Photo Modal */}
      {isShareOpen && (
        <LineupShareModal
          lineup={currentWorkingLineup}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  );
};
