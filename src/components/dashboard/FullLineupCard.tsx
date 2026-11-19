import React from 'react';
import { Play, Pencil, Share2, Music2, Star, Users, Radio, CheckCircle2 } from 'lucide-react';
import { ServiceLineup, Song, TeamMember } from '../../types';
import { ServiceCountdownTimer } from './ServiceCountdownTimer';
import { getLineupLifecycleStatus } from '../../utils/serviceSchedule';
import { formatDisplayTime } from '../../utils/timeFormat';

interface FullLineupCardProps {
  lineup: ServiceLineup;
  songs: Song[];
  members?: TeamMember[];
  onViewLineup: (lineupId: string) => void;
  onShareLineup: (lineup: ServiceLineup) => void;
  onPlayVideo: (title: string, url: string) => void;
  onOpenChords: (song: Song) => void;
  cardPosition?: 'primary' | 'secondary';
  badgeLabel?: string;
  showCountdown?: boolean;
}

// Format date nicely (e.g. "Sunday, Nov 29, 2026")
function formatHeroDate(dateStr?: string, timeStr?: string): string {
  if (!dateStr) return 'Upcoming Sunday';
  const displayTime = timeStr ? formatDisplayTime(timeStr) : null;
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, monthIndex, day);
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      return `${weekday}, ${monthName} ${day}, ${year}${displayTime ? ` • ${displayTime}` : ''}`;
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
  onOpenChords,
  cardPosition = 'primary',
  badgeLabel,
  showCountdown
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

  // Determine top header badge label
  const resolvedBadgeLabel = badgeLabel || (
    cardPosition === 'secondary'
      ? `UPCOMING SERVICE 2 • ${(lineup.title || 'SUNDAY LINEUP').toUpperCase()}`
      : lifecycleStatus === 'ongoing'
      ? `ONGOING SERVICE • ${(lineup.title || 'SUNDAY LINEUP').toUpperCase()}`
      : `PRIMARY WORSHIP SERVICE • ${(lineup.title || 'SUNDAY LINEUP').toUpperCase()}`
  );

  const shouldRenderCountdown = showCountdown ?? (cardPosition !== 'secondary');
  const isFeatured = cardPosition === 'primary';

  return (
    <div className="relative group/featured">
      {/* Outer subtle champagne-gold ambient glow behind the first card corners */}
      {isFeatured && (
        <div
          aria-hidden="true"
          className="absolute -inset-1 sm:-inset-1.5 rounded-[30px] bg-gradient-to-b from-[#E5AF45]/22 via-[#E5AF45]/8 to-transparent blur-xl pointer-events-none select-none opacity-85 transition-opacity duration-300"
        />
      )}

      {/* Main Card */}
      <div
        className={`relative rounded-3xl p-5 sm:p-7 text-[#FFF5E6] space-y-5 transition-all overflow-hidden ${
          isFeatured
            ? 'bg-gradient-to-b from-[#251F19] via-[#211C17] to-[#1E1914] border border-[#E5AF45]/40 hover:border-[#E5AF45]/60 shadow-[0_0_30px_rgba(229,175,69,0.15),0_12px_40px_rgba(0,0,0,0.65)]'
            : 'bg-[#211C17] border border-[#393027] shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
        }`}
      >
        {/* Subtle Gold Corner Glow Highlights (Top-Left and Top-Right Corners) */}
        {isFeatured && (
          <>
            {/* Top-Left Corner Radial Glow */}
            <div
              aria-hidden="true"
              className="absolute -top-10 -left-10 w-48 h-48 rounded-full pointer-events-none select-none bg-[radial-gradient(circle,rgba(229,175,69,0.22)_0%,rgba(255,200,92,0.1)_35%,transparent_70%)] blur-2xl"
            />
            {/* Top-Right Corner Radial Glow */}
            <div
              aria-hidden="true"
              className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none select-none bg-[radial-gradient(circle,rgba(229,175,69,0.22)_0%,rgba(255,200,92,0.1)_35%,transparent_70%)] blur-2xl"
            />
            {/* Top Edge Champagne Gold Sheen */}
            <div
              aria-hidden="true"
              className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-[#FFC85C]/60 to-transparent pointer-events-none select-none"
            />
          </>
        )}

        {/* =========================================================================
            1. HEADER SECTION: Status, Title, Date, Share
           ========================================================================= */}
      <div>
        {/* Top Micro Label & Share Button */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] text-[#E5AF45] uppercase">
            {resolvedBadgeLabel}
          </span>
          <button
            onClick={() => onShareLineup(lineup)}
            className="text-[#B8ADA0] hover:text-[#E5AF45] transition-colors p-1 cursor-pointer"
            title="Share Lineup / Save as Photo"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Main Title Row with Dynamic Status Badge */}
        <div className="flex items-center justify-between gap-3 mt-1.5 flex-wrap">
          <h2 data-testid={cardPosition === 'secondary' ? 'secondary-lineup-title' : 'primary-lineup-title'} className="text-xl sm:text-2xl font-bold text-[#FFF5E6] tracking-tight leading-tight">
            {lineup.title || 'Sunday Worship Service'}
          </h2>

          {/* Dynamic Status Badge */}
          {lifecycleStatus === 'ongoing' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#E5AF45]/15 text-[#FFC85C] border border-[#E5AF45]/30 animate-pulse">
              <Radio className="w-3.5 h-3.5 text-[#E5AF45]" />
              <span>Ongoing Service</span>
            </span>
          ) : lifecycleStatus === 'completed' ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#29231C] text-[#B8ADA0] border border-[#393027]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#79BB8B]" />
              <span>Completed</span>
            </span>
          ) : lifecycleStatus === 'published' || lifecycleStatus === 'upcoming' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#79BB8B]/15 text-[#79BB8B] border border-[#79BB8B]/30">
              <span className="w-2 h-2 rounded-full bg-[#79BB8B] animate-pulse" />
              <span>Upcoming</span>
            </span>
          ) : lifecycleStatus === 'cancelled' ? (
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#E57373]/15 text-[#E57373] border border-[#E57373]/30">
              Cancelled
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider bg-[#29231C] text-[#B8ADA0] border border-[#393027]">
              Draft
            </span>
          )}
        </div>

        {/* Subtitle: Date • Count of Songs */}
        <p className="text-xs sm:text-sm text-[#B8ADA0] font-medium mt-1">
          {formattedDate} • {totalSongsCount} {totalSongsCount === 1 ? 'song' : 'songs'}
        </p>
      </div>

      {/* =========================================================================
          2. LIVE COUNTDOWN TIMER (Rendered on primary service only)
         ========================================================================= */}
      {shouldRenderCountdown && (
        <ServiceCountdownTimer lineup={lineup} />
      )}

      {/* =========================================================================
          3. WORSHIP LEADER & ASSIGNED SINGERS
         ========================================================================= */}
      <div className="p-3.5 rounded-2xl bg-[#181510] border border-[#393027] space-y-2.5">
        {/* Worship Leader */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#E5AF45]/15 border border-[#E5AF45]/30 text-[#E5AF45] text-xs font-bold">
              <Star className="w-3.5 h-3.5 text-[#E5AF45] fill-[#E5AF45]" />
              <span>{(lineup.worship_leaders && lineup.worship_leaders.length > 1) ? 'LEADERS' : 'LEADER'}</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#FFF5E6]">
              {lineup.worship_leader_name || leader?.name || 'Assigned Leader'}
            </span>
          </div>

          {lineup.theme && (
            <span className="text-[11px] text-[#E5AF45] italic font-serif">
              Theme: "{lineup.theme}"
            </span>
          )}
        </div>

        {/* Assigned Singers / Vocalists */}
        {lineup.assigned_vocalists && lineup.assigned_vocalists.length > 0 && (
          <div className="flex items-center gap-2 pt-1 border-t border-[#393027] flex-wrap">
            <div className="flex items-center gap-1 text-[#B8ADA0] text-[11px] font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Singers:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lineup.assigned_vocalists.map((v) => (
                <span
                  key={v.id}
                  className="px-2 py-0.5 rounded-lg bg-[#211C17] border border-[#393027] text-[10px] sm:text-[11px] font-medium text-[#FFF5E6]"
                >
                  {v.name} {v.vocal_range ? <span className="text-[#E5AF45]">({v.vocal_range})</span> : ''}
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
        <div className="py-10 text-center rounded-2xl bg-[#181510] border border-dashed border-[#393027] p-6 space-y-2">
          <Music2 className="w-8 h-8 text-[#B8ADA0] mx-auto mb-2" />
          <p className="text-sm font-bold text-[#FFF5E6]">No songs in this setlist yet</p>
          <p className="text-xs text-[#B8ADA0] max-w-sm mx-auto">
            Click "Edit Lineup" below to add songs, set musical keys, and add YouTube video references.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(categorizedSongs).map(([categoryName, songItems]) => (
            <div key={categoryName} className="space-y-2">
              {/* Category Header Row: JOYFUL                    2 SONGS */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#E5AF45] tracking-wider uppercase">
                  {categoryName}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#B8ADA0] tracking-wider uppercase">
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
                      className="group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#181510] hover:bg-[#29231C] border border-[#393027] hover:border-[#E5AF45]/50 transition-all duration-200 gap-3"
                    >
                      {/* Left: Key Square Badge */}
                      <button
                        onClick={() => originalSong && onOpenChords(originalSong)}
                        className="w-12 h-12 rounded-xl bg-[#100E0B] border border-[#E5AF45]/50 group-hover:border-[#FFC85C] text-[#E5AF45] flex flex-col items-center justify-center shrink-0 transition-all shadow-[0_0_10px_rgba(229,175,69,0.12)] hover:scale-105 active:scale-95 cursor-pointer"
                        title="Click to transpose and view chords"
                      >
                        <span className="text-[9px] font-bold tracking-wider text-[#E5AF45] uppercase leading-none">
                          KEY
                        </span>
                        <span className="text-sm sm:text-base font-extrabold text-[#FFF5E6] leading-tight">
                          {selectedKey}
                        </span>
                      </button>

                      {/* Middle: Title, Lead Singer, Artist */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-[15px] font-bold text-[#FFF5E6] tracking-tight truncate group-hover:text-[#FFC85C] transition-colors">
                            {item.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs mt-0.5 min-w-0 flex-wrap">
                          <span className="text-[11px] sm:text-xs font-bold text-[#E5AF45] truncate shrink-0">
                            Lead: {item.assigned_vocalist_name || lineup.worship_leader_name || 'Worship Leader'}
                          </span>
                          {item.artist && (
                            <span className="text-[11px] text-[#B8ADA0] truncate">
                              • {item.artist}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Golden Circular Play Button */}
                      <button
                        onClick={() => handlePlaySong(item)}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-[#E5AF45] to-[#D69F35] hover:from-[#FFC85C] hover:to-[#E5AF45] text-[#100E0B] flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(229,175,69,0.35)] cursor-pointer"
                        title="Play YouTube video"
                      >
                        <Play className="w-3.5 h-3.5 fill-[#100E0B] text-[#100E0B] ml-0.5" />
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
      <div className="border-t border-[#393027] pt-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-[#B8ADA0] font-medium">
            Manage and edit this worship lineup
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#29231C] text-[#E5AF45] border border-[#393027] text-[10px] font-bold tracking-wider uppercase">
            Admin editable
          </span>
        </div>

        <button
          onClick={() => onViewLineup(lineup.id)}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#E5AF45] to-[#D69F35] hover:from-[#FFC85C] hover:to-[#E5AF45] text-[#100E0B] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(229,175,69,0.25)] hover:shadow-[0_6px_22px_rgba(229,175,69,0.4)] active:scale-[0.99] cursor-pointer"
        >
          <Pencil className="w-4 h-4 text-[#100E0B] stroke-[2.5]" />
          <span>Edit Lineup</span>
        </button>
      </div>
    </div>
  </div>
  );
};
