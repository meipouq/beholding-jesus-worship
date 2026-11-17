import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Music2,
  Plus,
  Play,
  FileMusic,
  ArrowUp,
  ArrowDown,
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
  Share2
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

  // Find lineup or initialize new
  const existingLineup = lineups.find(l => l.id === lineupId);

  const [title, setTitle] = useState(existingLineup?.title || 'Sunday Worship Service');
  const [serviceDate, setServiceDate] = useState(existingLineup?.service_date || new Date().toISOString().slice(0, 10));
  const [serviceTime, setServiceTime] = useState(existingLineup?.service_time || '9:00 AM');
  const [worshipLeaderId, setWorshipLeaderId] = useState(existingLineup?.worship_leader_id || currentUser.id);
  const [theme, setTheme] = useState(existingLineup?.theme || '');
  const [notes, setNotes] = useState(existingLineup?.notes || '');
  const [status, setStatus] = useState<'draft' | 'published'>(existingLineup?.status || 'draft');
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

  const currentWorkingLineup: ServiceLineup = {
    id: existingLineup?.id || `preview-${Date.now()}`,
    title,
    service_date: serviceDate,
    service_time: serviceTime,
    worship_leader_id: worshipLeaderId,
    worship_leader_name: leader.name,
    assigned_vocalists: members.filter(m => selectedVocalistIds.includes(m.id)).map(m => ({ id: m.id, name: m.name, role: m.role_title })),
    assigned_musicians: existingLineup?.assigned_musicians || [],
    status,
    theme: theme || undefined,
    notes: notes || undefined,
    songs: lineupSongs,
    created_by: existingLineup?.created_by || currentUser.name,
    updated_by: currentUser.name,
    created_at: existingLineup?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    history: existingLineup?.history || []
  };

  useEffect(() => {
    if (existingLineup) {
      setTitle(existingLineup.title);
      setServiceDate(existingLineup.service_date);
      setServiceTime(existingLineup.service_time);
      setWorshipLeaderId(existingLineup.worship_leader_id);
      setTheme(existingLineup.theme || '');
      setNotes(existingLineup.notes || '');
      setStatus(existingLineup.status);
      setLineupSongs(existingLineup.songs || []);
      setSelectedVocalistIds(existingLineup.assigned_vocalists?.map(v => v.id) || []);
    }
  }, [existingLineup]);

  // Add existing song from library
  const handleAddSongFromLibrary = (song: Song) => {
    const defaultVocalKey = song.vocal_keys?.[worshipLeaderId] || song.original_key;
    const newItem: LineupSongItem = {
      id: `ls-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      song_id: song.id,
      title: song.title,
      artist: song.artist,
      category: (song.category || 'JOYFUL').toUpperCase(),
      original_key: song.original_key,
      selected_key: defaultVocalKey,
      assigned_vocalist_id: worshipLeaderId,
      assigned_vocalist_name: leader.name,
      youtube_url: song.youtube_url,
      order: lineupSongs.length + 1
    };
    setLineupSongs([...lineupSongs, newItem]);
    setIsSongPickerOpen(false);
  };

  // Reorder songs up or down
  const moveSong = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lineupSongs.length) return;
    const reordered = [...lineupSongs];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    // update order numbers
    const updated = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setLineupSongs(updated);
  };

  // Remove song
  const removeSong = (id: string) => {
    const filtered = lineupSongs.filter(s => s.id !== id);
    const updated = filtered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setLineupSongs(updated);
  };

  // Update item field
  const updateSongItem = (id: string, updates: Partial<LineupSongItem>) => {
    setLineupSongs(lineupSongs.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Toggle vocalist selection
  const toggleVocalist = (id: string) => {
    if (selectedVocalistIds.includes(id)) {
      setSelectedVocalistIds(selectedVocalistIds.filter(vId => vId !== id));
    } else {
      setSelectedVocalistIds([...selectedVocalistIds, id]);
    }
  };

  // Save or Publish
  const handleSave = (newStatus: 'draft' | 'published') => {
    const assignedVocalists = members
      .filter(m => selectedVocalistIds.includes(m.id))
      .map(m => ({
        id: m.id,
        name: m.name,
        role: m.role_title,
        vocal_range: m.vocal_range,
        avatar: m.avatar
      }));

    const savedLineup: ServiceLineup = {
      id: existingLineup?.id || `lineup-${Date.now()}`,
      title: title.trim(),
      service_date: serviceDate,
      service_time: serviceTime,
      worship_leader_id: worshipLeaderId,
      worship_leader_name: leader.name,
      assigned_vocalists: assignedVocalists,
      assigned_musicians: existingLineup?.assigned_musicians || [],
      status: newStatus,
      theme: theme.trim() || undefined,
      notes: notes.trim() || undefined,
      songs: lineupSongs,
      history: existingLineup?.history || [],
      created_by: existingLineup ? existingLineup.created_by : currentUser.name,
      updated_by: currentUser.name,
      created_at: existingLineup ? existingLineup.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveLineup(savedLineup, true);
    setStatus(newStatus);
    alert(newStatus === 'published' ? 'Lineup published to the team successfully!' : 'Lineup draft saved successfully!');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-7xl mx-auto">
      {/* Top Header & Organized Action Buttons Panel */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E2D7] shadow-soft space-y-4">
        {/* Top Header Row: Back Button, Title & Status */}
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-black border border-stone-200/90 shadow-2xs hover:shadow-soft active:scale-[0.98] transition-all flex items-center gap-1.5 shrink-0 group"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform text-sm">←</span>
              <span>Back</span>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-black text-stone-900 leading-tight truncate">
                  {title || 'Service Lineup'}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${
                    status === 'published'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
                📅 {serviceDate} • ⏰ {serviceTime} • 👤 Leader: {leader.name}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar (Responsive: Balanced grid on mobile, sleek inline row on desktop) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-100">
          {/* Utility Tools (History, Print, Duplicate, Delete) */}
          <div className="flex items-center gap-2 order-2 sm:order-1 flex-wrap">
            {existingLineup && (
              <>
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(true)}
                  className="p-2.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 border border-stone-200/90 shadow-2xs hover:shadow-soft active:scale-95 transition-all"
                  title="View Change History"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintOpen(true)}
                  className="p-2.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 border border-stone-200/90 shadow-2xs hover:shadow-soft active:scale-95 transition-all"
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
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border border-stone-200/90 text-xs font-bold shadow-2xs hover:shadow-soft active:scale-95 transition-all"
                  title="Duplicate Lineup"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Duplicate</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete lineup "${existingLineup.title}"?`)) {
                      deleteLineup(existingLineup.id);
                      onBack();
                    }
                  }}
                  className="p-2.5 rounded-2xl bg-white hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-stone-200/90 hover:border-rose-200 shadow-2xs hover:shadow-soft active:scale-95 transition-all"
                  title="Delete Entire Lineup"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 order-1 sm:order-2 w-full sm:w-auto">
            {/* On Mobile: Share & Save Draft side-by-side */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="py-2.5 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-950 border border-amber-300/80 text-xs font-black shadow-2xs hover:shadow-soft active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 sm:gap-2 group"
                title="Share Lineup / Save as Landscape Photo"
              >
                <Share2 className="w-4 h-4 text-amber-800 group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">Share & Photo</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave('draft')}
                className="py-2.5 px-3.5 sm:px-4 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-black border border-stone-300/90 shadow-2xs hover:shadow-soft flex items-center justify-center gap-1.5 sm:gap-2 active:scale-[0.98] transition-all group"
              >
                <Save className="w-4 h-4 text-stone-600 group-hover:text-stone-900 transition-colors shrink-0" />
                <span className="truncate">Save Draft</span>
              </button>
            </div>

            {/* Publish Lineup (Full-width on mobile, side-by-side on desktop) */}
            <button
              type="button"
              onClick={() => handleSave('published')}
              className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-[#18181B] to-[#27272A] hover:from-[#222225] hover:to-[#323237] text-white text-xs font-black shadow-soft hover:shadow-md ring-1 ring-white/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-all group"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
              <span>Publish Lineup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Service Details Configuration Box */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D7] shadow-soft space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b border-stone-100">
          <Sparkles className="w-3.5 h-3.5 text-amber-800" />
          <h2 className="text-xs font-black text-stone-900 uppercase tracking-wider">
            Service Information & Worship Team
          </h2>
        </div>

        {/* Service Title */}
        <div>
          <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
            Service Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sunday Worship Service"
            className="w-full text-xs p-3 rounded-2xl border border-stone-300 bg-white font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 min-h-[44px]"
          />
        </div>

        {/* Aligned Date & Time Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Service Date *
            </label>
            <input
              type="date"
              required
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 bg-white text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-stone-400 min-h-[44px]"
              style={{ WebkitAppearance: 'none' }}
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Service Time *
            </label>
            <input
              type="text"
              required
              value={serviceTime}
              onChange={(e) => setServiceTime(e.target.value)}
              placeholder="9:00 AM"
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 bg-white text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-stone-400 min-h-[44px]"
            />
          </div>
        </div>

        {/* Worship Leader & Sermon Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Worship Leader *
            </label>
            <select
              value={worshipLeaderId}
              onChange={(e) => setWorshipLeaderId(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 bg-white font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 min-h-[44px] cursor-pointer"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role_title})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Sermon / Worship Theme (Optional)
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. Unwavering Faithfulness of God"
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 bg-white font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 min-h-[44px]"
            />
          </div>
        </div>

        {/* Assigned Vocalists Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
              Assigned Vocalists for this Service:
            </label>
            <span className="text-[10px] text-stone-400 font-medium">
              Tap to select / unselect
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {members.filter(m => m.vocal_range !== 'Instrumentalist').map((v) => {
              const isSelected = selectedVocalistIds.includes(v.id);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => toggleVocalist(v.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#1E1D1B] text-white border-[#1E1D1B] shadow-2xs'
                      : 'bg-[#FAF6F0] text-stone-700 hover:bg-[#EFE8DC] border-stone-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-stone-300'}`} />
                  <span>{v.name}</span>
                  <span className="opacity-75 text-[10px]">({v.vocal_range})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructions / Notes */}
        <div>
          <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
            General Team Instructions & Preparation Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Call time 8:00 AM sharp. Vocalists review bridge transitions."
            className="w-full text-xs p-3 rounded-2xl border border-stone-300 bg-white font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 min-h-[44px]"
          />
        </div>
      </div>

      {/* Song Lineup List Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D7] shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
              Order of Songs ({lineupSongs.length})
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Rearrange songs, set individual vocal keys, and add transition notes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSongPickerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-100/70 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all border border-amber-200"
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>Select from Library</span>
            </button>

            <button
              onClick={() => setIsInlineSongCreateOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Song Inline</span>
            </button>
          </div>
        </div>

        {/* Songs Items */}
        {lineupSongs.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-stone-200 rounded-2xl">
            <Music2 className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-stone-600">Your lineup currently has no songs</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Click "Select from Library" or "Create Song Inline" above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lineupSongs.map((item, index) => {
              const originalSong = songs.find(s => s.id === item.song_id);
              const isExpanded = expandedSongId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-stone-200 bg-[#FAF6F0]/70 hover:bg-[#FAF6F0] transition-colors p-3.5 sm:p-4 space-y-3"
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
                            className="p-1 rounded hover:bg-white text-stone-500 disabled:opacity-20 disabled:pointer-events-none"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSong(index, 'down')}
                            disabled={index === lineupSongs.length - 1}
                            className="p-1 rounded hover:bg-white text-stone-500 disabled:opacity-20 disabled:pointer-events-none"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="w-6 h-6 rounded-full bg-[#1E1D1B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {item.order}
                        </span>
                      </div>

                      {/* Title, Category Select & Key */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                            {item.title}
                          </h4>
                          {/* Inline Category Select */}
                          <select
                            value={item.category}
                            onChange={(e) => updateSongItem(item.id, { category: e.target.value })}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#EFE8DC] text-stone-800 border-none focus:outline-none cursor-pointer shrink-0"
                          >
                            {CATEGORIES.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {item.artist} • Orig Key: <strong>{item.original_key}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Key, Media & DELETE Actions Bar (Symmetrical on mobile & desktop) */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/60 shrink-0 flex-wrap">
                      {/* Selected Key Dropdown */}
                      <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-stone-400">Key:</span>
                        <select
                          value={item.selected_key}
                          onChange={(e) => updateSongItem(item.id, { selected_key: e.target.value })}
                          className="text-xs font-black text-amber-900 bg-transparent focus:outline-none cursor-pointer"
                        >
                          {KEYS.map(k => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Play Video Reference */}
                        {item.youtube_url && (
                          <button
                            type="button"
                            onClick={() => playVideo(item.title, item.youtube_url!)}
                            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white text-[11px] font-bold transition-colors shadow-2xs flex items-center gap-1"
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
                            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-stone-100 hover:bg-[#1E1D1B] text-stone-600 hover:text-white text-[11px] font-bold transition-colors shadow-2xs flex items-center gap-1"
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
                          className="p-1.5 rounded-xl hover:bg-stone-200/70 text-stone-600 border border-stone-200/60 bg-white"
                          title="Toggle Details & Notes"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {/* PROMINENT DELETE BUTTON FOR EVERY SONG */}
                        <button
                          type="button"
                          onClick={() => removeSong(item.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200/90 text-xs font-bold transition-all shadow-2xs active:scale-95 shrink-0"
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
                    <div className="pt-3 border-t border-stone-200/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-slide-up">
                      <div>
                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                          Song Title:
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateSongItem(item.id, { title: e.target.value })}
                          placeholder="Song Title"
                          className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                          YouTube Video / Reference URL:
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="url"
                            value={item.youtube_url || ''}
                            onChange={(e) => updateSongItem(item.id, { youtube_url: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white"
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
                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
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
                          className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white"
                        >
                          <option value="">Unassigned</option>
                          {members.filter(m => m.vocal_range !== 'Instrumentalist').map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.vocal_range})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                          Transition / Arrangement Note:
                        </label>
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={(e) => updateSongItem(item.id, { notes: e.target.value })}
                          placeholder="e.g. Drums build up, Pastor prayers after chorus 2"
                          className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white"
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

      {/* Song Picker Modal from Library */}
      {isSongPickerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in"
          onClick={() => setIsSongPickerOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-modal border border-stone-200 animate-slide-up overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-stone-100 bg-[#FAF6F0] flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">Add Song from Library</h3>
              <button
                onClick={() => setIsSongPickerOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-stone-100">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={songPickerSearch}
                  onChange={(e) => setSongPickerSearch(e.target.value)}
                  placeholder="Search song to add..."
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-[#F8F5EE]"
                />
              </div>
            </div>

            <div className="p-3 overflow-y-auto space-y-2 flex-1">
              {songs.length === 0 ? (
                <div className="py-8 px-4 text-center text-xs text-stone-500 flex flex-col items-center justify-center">
                  <Music2 className="w-8 h-8 text-stone-300 mb-2" />
                  <p className="font-bold text-stone-700">No songs in library yet</p>
                  <p className="text-[11px] text-stone-400 mt-0.5 mb-3">Create a new song to add directly to this lineup.</p>
                  <button
                    onClick={() => {
                      setIsSongPickerOpen(false);
                      setIsInlineSongCreateOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#1E1D1B] hover:bg-stone-800 text-white font-bold text-xs shadow-2xs transition-all"
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
                      className="p-3 rounded-2xl bg-[#FAF6F0] hover:bg-[#F2ECE1] transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-stone-900">{song.title}</h4>
                        <p className="text-[11px] text-stone-500">{song.artist} • {song.category}</p>
                      </div>
                      <span className="font-black text-amber-900 px-2 py-0.5 bg-white rounded-lg border border-amber-200">
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
