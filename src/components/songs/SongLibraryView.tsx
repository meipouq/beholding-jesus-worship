import React, { useState } from 'react';
import {
  Music,
  Search,
  Plus,
  Play,
  Tag,
  List,
  LayoutGrid,
  ChevronDown,
  UserPlus,
  MoreVertical,
  FileMusic,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';
import { Song } from '../../types';
import { useWorship } from '../../context/WorshipContext';
import { SongDetailModal } from './SongDetailModal';
import { SongEditModal } from './SongEditModal';
import { CategoryManagerModal } from './CategoryManagerModal';
import { AddToLineupModal } from './AddToLineupModal';

const KEYS = ['ALL', 'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

export const SongLibraryView: React.FC = () => {
  const {
    songs,
    categories,
    saveSong,
    deleteSong,
    playVideo,
    openChords
  } = useWorship();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedKey, setSelectedKey] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [openMenuSongId, setOpenMenuSongId] = useState<string | null>(null);

  // Modals state
  const [viewingSong, setViewingSong] = useState<Song | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [isManagingCats, setIsManagingCats] = useState(false);
  const [songToAddToLineup, setSongToAddToLineup] = useState<Song | null>(null);

  // Filter songs
  const filteredSongs = songs.filter((s) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || (
      s.title.toLowerCase().includes(q) ||
      (s.artist && s.artist.toLowerCase().includes(q)) ||
      (s.lyrics && s.lyrics.toLowerCase().includes(q)) ||
      (s.composer && s.composer.toLowerCase().includes(q))
    );
    const matchesCat = selectedCategory === 'ALL' || s.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesKey = selectedKey === 'ALL' || s.original_key === selectedKey;
    return matchesSearch && matchesCat && matchesKey;
  });

  return (
    <div className="space-y-4 pb-20 md:pb-8 max-w-7xl mx-auto">
      {/* Click-outside backdrop to dismiss 3-dots menus */}
      {openMenuSongId && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setOpenMenuSongId(null)}
        />
      )}

      {/* Top Header: Music Squircle with Amber Glow + Title & Subtitle */}
      <div className="flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-[22px] bg-[#181510] border border-[#E5AF45]/40 shadow-[0_0_18px_rgba(229,175,69,0.22)] flex items-center justify-center shrink-0">
          <Music className="w-7 h-7 text-[#E5AF45]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#FFF5E6] leading-tight tracking-tight">
            Song Library
          </h1>
          <p className="text-xs text-[#B8ADA0] mt-0.5 leading-snug">
            {songs.length} worship songs cataloged with lyrics, keys, chords & YouTube references
          </p>
        </div>
      </div>

      {/* Action Buttons: Categories & + Add Song */}
      <div className="grid grid-cols-2 gap-3 pt-0.5">
        <button
          onClick={() => setIsManagingCats(true)}
          className="py-3 px-4 rounded-full bg-[#181510] hover:bg-[#211C17] text-[#FFF5E6] text-xs sm:text-sm font-bold border border-[#E5AF45]/60 hover:border-[#E5AF45] shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer group"
        >
          <Tag className="w-4 h-4 text-[#E5AF45]" />
          <span>Categories</span>
        </button>

        <button
          onClick={() => setIsAddingSong(true)}
          className="py-3 px-4 rounded-full bg-gradient-to-r from-[#FFC85C] to-[#E5AF45] hover:from-[#FFD57E] hover:to-[#E5AF45] text-[#100E0B] text-xs sm:text-sm font-black shadow-[0_4px_16px_rgba(229,175,69,0.28)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#100E0B] stroke-[2.5]" />
          <span>Add Song</span>
        </button>
      </div>

      {/* Search & Filter Controls Container */}
      <div className="bg-[#181510] p-3 sm:p-4 rounded-[24px] border border-[#393027] space-y-3 shadow-sm">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#B8ADA0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, artist, composer or lyrics..."
            className="w-full text-xs sm:text-[13px] pl-10 pr-4 py-2.5 rounded-full border border-[#393027] bg-[#211C17] text-[#FFF5E6] focus:border-[#E5AF45] focus:outline-none transition-all placeholder:text-[#B8ADA0]/60 font-medium"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Key Selector Pill */}
          <div className="relative">
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="appearance-none bg-[#211C17] border border-[#393027] hover:border-[#E5AF45]/40 text-xs font-bold text-[#FFF5E6] pl-3.5 pr-8 py-2 rounded-xl focus:outline-none cursor-pointer shadow-2xs"
            >
              {KEYS.map((k) => (
                <option key={k} value={k} className="bg-[#211C17] text-[#FFF5E6]">
                  {k === 'ALL' ? 'Key: All Keys' : `Key: ${k}`}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#B8ADA0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* View Mode Toggle (List / Grid) */}
          <div className="flex items-center gap-1 bg-[#211C17] p-1 rounded-xl border border-[#393027]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#181510] text-[#E5AF45] border border-[#E5AF45] shadow-[0_0_8px_rgba(229,175,69,0.25)]'
                  : 'text-[#B8ADA0] hover:text-[#FFF5E6]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#181510] text-[#E5AF45] border border-[#E5AF45] shadow-[0_0_8px_rgba(229,175,69,0.25)]'
                  : 'text-[#B8ADA0] hover:text-[#FFF5E6]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-[#181510] text-[#E5AF45] border border-[#E5AF45] shadow-[0_0_10px_rgba(229,175,69,0.25)]'
              : 'bg-[#211C17] text-[#FFF5E6] border border-[#393027] hover:bg-[#29231C]'
          }`}
        >
          All Categories ({songs.length})
        </button>
        {categories.map((c) => {
          const count = songs.filter(s => s.category.toLowerCase() === c.name.toLowerCase()).length;
          const isSelected = selectedCategory.toLowerCase() === c.name.toLowerCase();
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#181510] text-[#E5AF45] border border-[#E5AF45] shadow-[0_0_10px_rgba(229,175,69,0.25)]'
                  : 'bg-[#211C17] text-[#FFF5E6] border border-[#393027] hover:bg-[#29231C]'
              }`}
            >
              {c.name} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Song List Content */}
      {songs.length === 0 ? (
        <div className="bg-[#211C17] rounded-3xl p-12 sm:p-16 text-center border border-[#393027] shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-[#181510] border border-[#393027] text-[#E5AF45] flex items-center justify-center mb-4 shadow-inner">
            <Music className="w-8 h-8 text-[#E5AF45]" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#FFF5E6]">Song Library is Empty</h3>
          <p className="text-xs text-[#B8ADA0] mt-1 max-w-md">
            Start building your worship team's central repertoire! Add your church's praise & worship songs with lyrics, chords, original keys, vocal keys, and YouTube references.
          </p>
          <button
            onClick={() => setIsAddingSong(true)}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FFC85C] to-[#E5AF45] text-[#100E0B] text-xs font-black shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#100E0B]" />
            <span>Add First Song</span>
          </button>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="bg-[#211C17] rounded-3xl p-12 text-center border border-[#393027] shadow-sm">
          <Music className="w-10 h-10 text-[#B8ADA0]/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#FFF5E6]">No songs found</h3>
          <p className="text-xs text-[#B8ADA0] mt-1 max-w-sm mx-auto">
            Try adjusting your search query, key filter, or category selector.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('ALL');
              setSelectedKey('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-2xl bg-[#29231C] hover:bg-[#393027] text-[#FFF5E6] border border-[#393027] text-xs font-bold transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW: Responsive 2-column on mobile, 3-col on tablet, 4-col on desktop */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredSongs.map((song) => {
            const hasVideo = !!song.youtube_url;

            const handlePlay = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (hasVideo) {
                playVideo(song.title, song.youtube_url!);
              } else {
                const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
                  `${song.title} ${song.artist || ''} worship song`
                )}`;
                playVideo(song.title, searchUrl);
              }
            };

            return (
              <div
                key={song.id}
                onClick={() => setViewingSong(song)}
                className={`bg-[#181510] hover:bg-[#1E1914] rounded-[22px] p-3.5 sm:p-4 border border-[#393027] hover:border-[#E5AF45]/50 shadow-sm relative transition-all cursor-pointer group flex flex-col justify-between ${
                  openMenuSongId === song.id ? 'z-30' : 'z-0'
                }`}
              >
                {/* Top Row: Key Badge on Left + 3-dots Menu on Right */}
                <div className="flex items-center justify-between gap-1.5 mb-2.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openChords(song);
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-[#14120F] text-[#E5AF45] border border-[#E5AF45]/50 shadow-[0_0_8px_rgba(229,175,69,0.12)] text-[10px] font-bold hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
                    title="Transpose & Chords"
                  >
                    Key: {song.original_key || 'C'}
                  </button>

                  {/* 3-dots Menu Button */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setOpenMenuSongId(openMenuSongId === song.id ? null : song.id)}
                      className="p-1 rounded-full text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C] transition-colors cursor-pointer"
                      title="Song Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuSongId === song.id && (
                      <div className="absolute right-0 top-7 w-44 bg-[#211C17] border border-[#393027] rounded-2xl shadow-2xl py-1.5 z-40 animate-fade-in text-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingSong(song);
                            setOpenMenuSongId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-[#FFF5E6] hover:bg-[#29231C] hover:text-[#E5AF45] flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#E5AF45]" />
                          <span>View Details & Lyrics</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openChords(song);
                            setOpenMenuSongId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-[#FFF5E6] hover:bg-[#29231C] hover:text-[#E5AF45] flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <FileMusic className="w-3.5 h-3.5 text-[#E5AF45]" />
                          <span>Chords & Transposer</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSong(song);
                            setOpenMenuSongId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-[#FFF5E6] hover:bg-[#29231C] hover:text-[#E5AF45] flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#E5AF45]" />
                          <span>Edit Song</span>
                        </button>
                        <div className="my-1 border-t border-[#393027]" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuSongId(null);
                            if (window.confirm(`Are you sure you want to delete "${song.title}" from the song library?`)) {
                              deleteSong(song.id);
                            }
                          }}
                          className="w-full text-left px-3 py-2 text-[#E57373] hover:bg-[#29231C] flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#E57373]" />
                          <span>Delete Song</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle: Title, Artist, and Category */}
                <div className="min-w-0 mb-3 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-[#FFF5E6] tracking-tight leading-snug group-hover:text-[#FFC85C] transition-colors line-clamp-2">
                    {song.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#B8ADA0] font-medium mt-1 truncate">
                    {song.artist?.trim() ? song.artist : (song.composer?.trim() ? song.composer : 'Worship Team Repertoire')}
                  </p>
                  <div className="mt-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#241F1A] text-[#B8ADA0] border border-[#393027] text-[10px] font-semibold tracking-wide inline-block truncate max-w-full">
                      {song.category}
                    </span>
                  </div>
                </div>

                {/* Bottom Row Actions in Grid: Play Icon Button + Compact Add to Lineup Button */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#393027]/60" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={handlePlay}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FFC85C] to-[#E5AF45] hover:from-[#FFD57E] hover:to-[#E5AF45] text-[#100E0B] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(229,175,69,0.25)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title="Play YouTube Video Reference"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#100E0B] text-[#100E0B] ml-0.5" />
                  </button>

                  <button
                    onClick={() => setSongToAddToLineup(song)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-[#211C17] hover:bg-[#29231C] border border-[#E5AF45]/60 hover:border-[#E5AF45] text-[#FFF5E6] flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer group/btn min-w-0"
                    title="Add to Lineup"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#E5AF45] shrink-0" />
                    <span className="text-[11px] font-bold text-[#FFF5E6] group-hover/btn:text-[#E5AF45] truncate">
                      + Lineup
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW: Wide 1-column layout (user's preferred table view) */
        <div className="space-y-3">
          {filteredSongs.map((song) => {
            const hasVideo = !!song.youtube_url;

            const handlePlay = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (hasVideo) {
                playVideo(song.title, song.youtube_url!);
              } else {
                const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
                  `${song.title} ${song.artist || ''} worship song`
                )}`;
                playVideo(song.title, searchUrl);
              }
            };

            return (
              <div
                key={song.id}
                onClick={() => setViewingSong(song)}
                className={`bg-[#181510] hover:bg-[#1E1914] rounded-[22px] p-4 sm:p-5 border border-[#393027] hover:border-[#E5AF45]/50 shadow-sm relative transition-all cursor-pointer group ${
                  openMenuSongId === song.id ? 'z-30' : 'z-0'
                }`}
              >
                {/* Top Right: 3-dots Menu Button */}
                <div className="absolute top-3.5 right-3.5 z-30" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setOpenMenuSongId(openMenuSongId === song.id ? null : song.id)}
                    className="p-1 rounded-full text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C] transition-colors cursor-pointer"
                    title="Song Options"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuSongId === song.id && (
                    <div className="absolute right-0 top-8 w-48 bg-[#211C17] border border-[#393027] rounded-2xl shadow-2xl py-1.5 z-40 animate-fade-in text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingSong(song);
                          setOpenMenuSongId(null);
                        }}
                        className="w-full text-left px-3.5 py-2 text-[#FFF5E6] hover:bg-[#29231C] hover:text-[#E5AF45] flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-[#E5AF45]" />
                        <span>View Details & Lyrics</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openChords(song);
                          setOpenMenuSongId(null);
                        }}
                        className="w-full text-left px-3.5 py-2 text-[#FFF5E6] hover:bg-[#29231C] hover:text-[#E5AF45] flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <FileMusic className="w-4 h-4 text-[#E5AF45]" />
                        <span>Chords & Transposer</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSong(song);
                          setOpenMenuSongId(null);
                        }}
                        className="w-full text-left px-3.5 py-2 text-[#FFF5E6] hover:bg-[#29231C] hover:text-[#E5AF45] flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4 text-[#E5AF45]" />
                        <span>Edit Song</span>
                      </button>
                      <div className="my-1 border-t border-[#393027]" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuSongId(null);
                          if (window.confirm(`Are you sure you want to delete "${song.title}" from the song library?`)) {
                            deleteSong(song.id);
                          }
                        }}
                        className="w-full text-left px-3.5 py-2 text-[#E57373] hover:bg-[#29231C] flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-[#E57373]" />
                        <span>Delete Song</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Song Title & Artist (Organized cleanly, always visible, zero overlap) */}
                <div className="pr-10 min-w-0">
                  <h3 className="text-base sm:text-[17px] font-bold text-[#FFF5E6] tracking-tight leading-snug group-hover:text-[#FFC85C] transition-colors truncate">
                    {song.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#B8ADA0] font-medium mt-0.5 truncate">
                    {song.artist?.trim() ? song.artist : (song.composer?.trim() ? song.composer : 'Worship Team Repertoire')}
                  </p>
                </div>

                {/* Bottom Row: Badges (Category & Key) on Left + Action Buttons on Right */}
                <div className="flex items-center justify-between gap-2.5 mt-3 pt-0.5">
                  {/* Badges: Category & Key */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-[#241F1A] text-[#B8ADA0] border border-[#393027] text-[11px] font-semibold tracking-wide">
                      {song.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openChords(song);
                      }}
                      className="px-3 py-1 rounded-full bg-[#14120F] text-[#E5AF45] border border-[#E5AF45]/50 shadow-[0_0_8px_rgba(229,175,69,0.12)] text-[11px] font-bold hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                      title="Transpose & Chords"
                    >
                      Key: {song.original_key || 'C'}
                    </button>
                  </div>

                  {/* Right Actions: Circular Play Button & "Add to Lineup" Pill Button */}
                  <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Circular Play Button */}
                    <button
                      onClick={handlePlay}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFC85C] to-[#E5AF45] hover:from-[#FFD57E] hover:to-[#E5AF45] text-[#100E0B] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(229,175,69,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      title="Play YouTube Video Reference"
                    >
                      <Play className="w-4 h-4 fill-[#100E0B] text-[#100E0B] ml-0.5" />
                    </button>

                    {/* Add to Lineup Pill Button */}
                    <button
                      onClick={() => setSongToAddToLineup(song)}
                      className="px-3 py-1.5 rounded-full bg-[#181510] hover:bg-[#211C17] border border-[#E5AF45]/70 hover:border-[#E5AF45] text-[#FFF5E6] flex items-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer group/btn"
                      title="Add to Lineup"
                    >
                      <UserPlus className="w-4 h-4 text-[#FFF5E6] group-hover/btn:text-[#E5AF45] shrink-0" />
                      <div className="text-left leading-none">
                        <span className="text-[10px] font-bold block text-[#FFF5E6] group-hover/btn:text-[#E5AF45] leading-tight">Add to</span>
                        <span className="text-[10px] font-bold block text-[#FFF5E6] group-hover/btn:text-[#E5AF45] leading-tight">Lineup</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {viewingSong && (
        <SongDetailModal
          song={viewingSong}
          onClose={() => setViewingSong(null)}
          onEdit={(s) => {
            setViewingSong(null);
            setEditingSong(s);
          }}
          onDelete={(id) => deleteSong(id)}
          onAddToLineup={(s) => {
            setViewingSong(null);
            setSongToAddToLineup(s);
          }}
        />
      )}

      {(isAddingSong || editingSong) && (
        <SongEditModal
          song={editingSong}
          onClose={() => {
            setIsAddingSong(false);
            setEditingSong(null);
          }}
          onSave={(s) => {
            saveSong(s);
            setIsAddingSong(false);
            setEditingSong(null);
          }}
        />
      )}

      {isManagingCats && (
        <CategoryManagerModal onClose={() => setIsManagingCats(false)} />
      )}

      {songToAddToLineup && (
        <AddToLineupModal
          song={songToAddToLineup}
          onClose={() => setSongToAddToLineup(null)}
        />
      )}
    </div>
  );
};
