import React from 'react';
import { Play, Pencil, Share2, Music2, Star, Users, Radio, CheckCircle2 } from 'lucide-react';
import { ServiceLineup, Song, TeamMember } from '../../types';
import { ServiceCountdownTimer } from './ServiceCountdownTimer';
import { getLineupLifecycleStatus } from '../../utils/serviceSchedule';

interface FullLineupCardProps {
  lineup: ServiceLineup;
  songs: Song[];
  members?: TeamMember[];
  onViewLineup: (lineupId: string) => void;
  onShareLineup: (lineup: ServiceLineup) => void;
  onPlayVideo: (title: string, url: string) => void;
  onOpenChords: (song: Song) => void;
}

// Format date nicely (e.g. "Sunday, Nov 29, 2026")
function formatHeroDate(dateStr?: string, timeStr?: string): string {
  if (!dateStr) return 'Upcoming Sunday';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, monthIndex, day);
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      return `${weekday}, ${monthName} ${day}, ${year}${timeStr ? ` • ${timeStr}` : ''}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export const FullLineupCard: React.FC<FullLineupCardProps> = ({
  lineup,
  songs,
  members,
  onViewLineup,
  onShareLineup,
  onPlayVideo,
  onOpenChords
}) => {
  const lifecycleStatus = getLineupLifecycleStatus(lineup);
  const totalSongsCount = lineup.songs?.length || 0;
  const formattedDate = formatHeroDate(lineup.service_date, lineup.service_time);

  // Group songs dynamically into categories (e.g. JOYFUL, SOLEMN)
  const categorizedSongs: { [category: string]: typeof lineup.songs } = {};
  if (lineup.songs && lineup.songs.length > 0) {
    lineup.songs.forEach((song) => {
      const cat = (song.category || 'JOYFUL').trim().toUpperCase();
      if (!categorizedSongs[cat]) {
        categorizedSongs[cat] = [];
      }
      categorizedSongs[cat].push(song);
    });
  }

  // Handle Play Button click
  const handlePlaySong = (item: (typeof lineup.songs)[0]) => {
    const originalSong = songs.find((s) => s.id === item.song_id);
    const videoUrl = item.youtube_url || originalSong?.youtube_url;

    if (videoUrl) {
      onPlayVideo(item.title, videoUrl);
    } else {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${item.title} worship song`
      )}`;
      onPlayVideo(item.title, searchUrl);
    }
  };

  const leader = members?.find(m => m.id === lineup.worship_leader_id);

  return (
    <div className="bg-[#18181B] rounded-3xl p-5 sm:p-7 border border-[#27272A] shadow-2xl text-white space-y-5 transition-all">
      {/* =========================================================================
          1. HEADER SECTION: Status, Title, Date, Share
         ========================================================================= */}
      <div>
        {/* Top Micro Label & Share Button */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] text-[#E5A93C] uppercase">
            PRIMARY WORSHIP SERVICE • {lineup.title ? lineup.title.toUpperCase() : 'SUNDAY LINEUP'}
          </span>
          <button
            onClick={() => onShareLineup(lineup)}
            className="text-stone-400 hover:text-[#E5A93C] transition-colors p-1 cursor-pointer"
            title="Share Lineup / Save as Photo"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Main Title Row with Dynamic Status Badge */}
        <div className="flex items-center justify-between gap-3 mt-1.5 flex-wrap">
          <h2 data-testid="primary-lineup-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
            {lineup.title || 'Sunday Worship Service'}
          </h2>

          {/* Dynamic Status Badge */}
          {lifecycleStatus === 'ongoing' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Ongoing Service</span>
            </span>
          ) : lifecycleStatus === 'completed' ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-stone-800 text-stone-300 border border-stone-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Completed</span>
            </span>
          ) : lifecycleStatus === 'published' || lifecycleStatus === 'upcoming' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#122A1E] text-[#4ADE80] border border-[#166534]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Upcoming</span>
            </span>
          ) : lifecycleStatus === 'cancelled' ? (
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-950/70 text-rose-300 border border-rose-800">
              Cancelled
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider bg-[#2E200F] text-[#FBBF24] border border-[#854D0E]">
              Draft
            </span>
          )}
        </div>

        {/* Subtitle: Date • Count of Songs */}
        <p className="text-xs sm:text-sm text-stone-400 font-medium mt-1">
          {formattedDate} • {totalSongsCount} {totalSongsCount === 1 ? 'song' : 'songs'}
        </p>
      </div>

      {/* =========================================================================
          2. LIVE COUNTDOWN TIMER
         ========================================================================= */}
      <ServiceCountdownTimer lineup={lineup} />

      {/* =========================================================================
          3. WORSHIP LEADER & ASSIGNED SINGERS
         ========================================================================= */}
      <div className="p-3.5 rounded-2xl bg-[#222225] border border-stone-800/90 space-y-2.5">
        {/* Worship Leader */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#2E200F] border border-amber-600/40 text-amber-300 text-xs font-bold">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{(lineup.worship_leaders && lineup.worship_leaders.length > 1) ? 'LEADERS' : 'LEADER'}</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-white">
              {lineup.worship_leader_name || leader?.name || 'Assigned Leader'}
            </span>
          </div>

          {lineup.theme && (
            <span className="text-[11px] text-amber-200/80 italic font-serif">
              Theme: "{lineup.theme}"
            </span>
          )}
        </div>

        {/* Assigned Singers / Vocalists */}
        {lineup.assigned_vocalists && lineup.assigned_vocalists.length > 0 && (
          <div className="flex items-center gap-2 pt-1 border-t border-stone-800/60 flex-wrap">
            <div className="flex items-center gap-1 text-stone-400 text-[11px] font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Singers:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lineup.assigned_vocalists.map((v) => (
                <span
                  key={v.id}
                  className="px-2 py-0.5 rounded-lg bg-[#18181B] border border-stone-700/80 text-[10px] sm:text-[11px] font-medium text-stone-200"
                >
                  {v.name} {v.vocal_range ? <span className="text-amber-400/90">({v.vocal_range})</span> : ''}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          4. DYNAMIC CATEGORIZED SONGS SETLIST (JOYFUL, SOLEMN, ETC.)
         ========================================================================= */}
      {totalSongsCount === 0 ? (
        <div className="py-10 text-center rounded-2xl bg-[#222225] border border-dashed border-stone-800 p-6 space-y-2">
          <Music2 className="w-8 h-8 text-stone-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-stone-200">No songs in this setlist yet</p>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Click "Edit Lineup" below to add songs, set musical keys, and add YouTube video references.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(categorizedSongs).map(([categoryName, songItems]) => (
            <div key={categoryName} className="space-y-2">
              {/* Category Header Row: JOYFUL                    2 SONGS */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-stone-200 tracking-wider uppercase">
                  {categoryName}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-stone-500 tracking-wider uppercase">
                  {songItems.length} {songItems.length === 1 ? 'SONG' : 'SONGS'}
                </span>
              </div>

              {/* Song Cards List */}
              <div className="space-y-2">
                {songItems.map((item, idx) => {
                  const originalSong = songs.find((s) => s.id === item.song_id);
                  const selectedKey = item.selected_key || item.original_key || 'G';
                  const hasVideo = !!(item.youtube_url || originalSong?.youtube_url);

                  return (
                    <div
                      key={item.id || `${item.song_id}-${idx}`}
                      className="group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#222225] hover:bg-[#28282C] border border-[#2E2E32] hover:border-[#D4A359]/60 transition-all duration-200 gap-3"
                    >
                      {/* Left: Key Square Badge */}
                      <button
                        onClick={() => originalSong && onOpenChords(originalSong)}
                        className="w-12 h-12 rounded-xl bg-[#2E2214] border border-[#7C4D1D] group-hover:border-[#D4A359] text-[#F3B755] flex flex-col items-center justify-center shrink-0 transition-all shadow-inner hover:scale-105 active:scale-95 cursor-pointer"
                        title="Click to transpose and view chords"
                      >
                        <span className="text-[9px] font-bold tracking-wider text-[#A67C52] uppercase leading-none">
                          KEY
                        </span>
                        <span className="text-sm sm:text-base font-extrabold leading-tight">
                          {selectedKey}
                        </span>
                      </button>

                      {/* Middle: Title, Lead Singer, Artist */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-[15px] font-bold text-white tracking-tight truncate group-hover:text-[#F3B755] transition-colors">
                            {item.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs mt-0.5 min-w-0 flex-wrap">
                          <span className="text-[11px] sm:text-xs font-bold text-[#F3B755] truncate shrink-0">
                            Lead: {item.assigned_vocalist_name || lineup.worship_leader_name || 'Worship Leader'}
                          </span>
                          {item.artist && (
                            <span className="text-[11px] text-stone-400 truncate">
                              • {item.artist}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Golden Circular Play Button */}
                      <button
                        onClick={() => handlePlaySong(item)}
                        className="w-8 h-8 rounded-full bg-[#D4A359] hover:bg-[#E5A93C] text-stone-950 flex items-center justify-center shrink-0 transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                        title="Play YouTube video"
                      >
                        <Play className="w-3.5 h-3.5 fill-stone-950 text-stone-950 ml-0.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          5. BOTTOM MANAGE STRIP & EDIT LINEUP BUTTON
         ========================================================================= */}
      <div className="border-t border-stone-800/80 pt-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-stone-400 font-medium">
            Manage and edit this worship lineup
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#381E12] text-[#FB923C] border border-[#7C2D12] text-[10px] font-bold tracking-wider uppercase">
            Admin editable
          </span>
        </div>

        <button
          onClick={() => onViewLineup(lineup.id)}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#D4A359] hover:bg-[#E5A93C] text-stone-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
        >
          <Pencil className="w-4 h-4 text-stone-950 stroke-[2.5]" />
          <span>Edit Lineup</span>
        </button>
      </div>
    </div>
  );
};
