import React from 'react';
import { Play, Pencil, Share2, Music2 } from 'lucide-react';
import { ServiceLineup, Song, TeamMember } from '../../types';

interface FullLineupCardProps {
  lineup: ServiceLineup;
  songs: Song[];
  members?: TeamMember[];
  onViewLineup: (lineupId: string) => void;
  onShareLineup: (lineup: ServiceLineup) => void;
  onPlayVideo: (title: string, url: string) => void;
  onOpenChords: (song: Song) => void;
}

// Format date nicely (e.g. "November 22")
function formatHeroDate(dateStr?: string): string {
  if (!dateStr) return 'Upcoming Sunday';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, monthIndex, day);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export const FullLineupCard: React.FC<FullLineupCardProps> = ({
  lineup,
  songs,
  onViewLineup,
  onShareLineup,
  onPlayVideo,
  onOpenChords
}) => {
  const isPublished = lineup.status === 'published';
  const totalSongsCount = lineup.songs?.length || 0;
  const formattedDate = formatHeroDate(lineup.service_date);

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
      // If no video URL yet, search on YouTube or prompt user to edit
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${item.title} worship song`
      )}`;
      onPlayVideo(item.title, searchUrl);
    }
  };

  return (
    <div className="bg-[#18181B] rounded-3xl p-5 sm:p-7 border border-[#27272A] shadow-2xl text-white space-y-6 transition-all">
      {/* =========================================================================
          1. HEADER SECTION: WORSHIP • SUNDAY SERVICE | Title | Published | Date
         ========================================================================= */}
      <div>
        {/* Top Micro Label */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] text-[#E5A93C] uppercase">
            WORSHIP • {lineup.title ? lineup.title.toUpperCase() : 'SUNDAY SERVICE'}
          </span>
          <button
            onClick={() => onShareLineup(lineup)}
            className="text-stone-400 hover:text-[#E5A93C] transition-colors p-1"
            title="Share Lineup / Save as Photo"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Main Title Row with Status Badge */}
        <div className="flex items-center justify-between gap-3 mt-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
            {lineup.title || 'Sunday Lineup'}
          </h2>

          <span
            className={`px-3 py-0.5 rounded-full text-[11px] font-semibold tracking-wider ${
              isPublished
                ? 'bg-[#122A1E] text-[#4ADE80] border border-[#166534]'
                : 'bg-[#2E200F] text-[#FBBF24] border border-[#854D0E]'
            }`}
          >
            {isPublished ? 'Published' : 'Draft'}
          </span>
        </div>

        {/* Subtitle: Date • Count of Songs */}
        <p className="text-xs sm:text-sm text-stone-400 font-medium mt-1">
          {formattedDate} • {totalSongsCount} {totalSongsCount === 1 ? 'song' : 'songs'}
        </p>
      </div>

      {/* =========================================================================
          2. DYNAMIC CATEGORIZED SONGS SETLIST (JOYFUL, SOLEMN, ETC.)
         ========================================================================= */}
      {totalSongsCount === 0 ? (
        <div className="py-12 text-center rounded-2xl bg-[#222225] border border-dashed border-stone-800 p-6 space-y-2">
          <Music2 className="w-8 h-8 text-stone-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-stone-200">No songs in this setlist yet</p>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Click "Edit Sunday Lineup" below to add songs, set musical keys, and add YouTube video references.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(categorizedSongs).map(([categoryName, songItems]) => (
            <div key={categoryName} className="space-y-2.5">
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
              <div className="space-y-2.5">
                {songItems.map((item, idx) => {
                  const originalSong = songs.find((s) => s.id === item.song_id);
                  const selectedKey = item.selected_key || item.original_key || 'G';
                  const hasVideo = !!(item.youtube_url || originalSong?.youtube_url);

                  return (
                    <div
                      key={item.id || `${item.song_id}-${idx}`}
                      className="bg-[#222225] hover:bg-[#27272B] rounded-2xl p-3 sm:p-3.5 border border-white/5 transition-all flex items-center justify-between gap-3 shadow-xs"
                    >
                      {/* Left: Square KEY Badge */}
                      <div className="w-12 h-12 rounded-xl bg-[#2D261C] border border-[#594017] flex flex-col items-center justify-center shrink-0 shadow-inner">
                        <span className="text-[9px] font-extrabold text-[#E5A93C] uppercase tracking-wider leading-none mb-0.5">
                          KEY
                        </span>
                        <span className="text-base font-extrabold text-[#FDF8F0] leading-none">
                          {selectedKey}
                        </span>
                      </div>

                      {/* Center: Song Title & YouTube Video Subtitle */}
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => {
                            if (originalSong) {
                              onOpenChords(originalSong);
                            } else {
                              handlePlaySong(item);
                            }
                          }}
                          className="text-left font-bold text-sm sm:text-base text-white hover:text-[#E5A93C] tracking-tight leading-snug truncate block max-w-full transition-colors"
                          title="Click to view Chords & Lyrics"
                        >
                          {item.title}
                        </button>

                        <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-400">
                          <button
                            onClick={() => handlePlaySong(item)}
                            className="hover:text-stone-200 transition-colors truncate"
                          >
                            {hasVideo ? 'YouTube video' : 'YouTube reference'}
                          </button>
                          {item.assigned_vocalist_name && (
                            <>
                              <span className="text-stone-600">•</span>
                              <span className="text-stone-400 truncate">
                                Lead: {item.assigned_vocalist_name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: Golden Circular Play Button */}
                      <button
                        onClick={() => handlePlaySong(item)}
                        className="w-8 h-8 rounded-full bg-[#D4A359] hover:bg-[#E5A93C] text-stone-950 flex items-center justify-center shrink-0 transition-transform hover:scale-105 active:scale-95 shadow-md"
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
          3. BOTTOM MANAGE STRIP & EDIT SUNDAY LINEUP BUTTON (Matches Image 2)
         ========================================================================= */}
      <div className="border-t border-stone-800/80 pt-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-stone-400 font-medium">
            Manage this week's worship set
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#381E12] text-[#FB923C] border border-[#7C2D12] text-[10px] font-bold tracking-wider uppercase">
            Admin editable
          </span>
        </div>

        <button
          onClick={() => onViewLineup(lineup.id)}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#D4A359] hover:bg-[#E5A93C] text-stone-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
        >
          <Pencil className="w-4 h-4 text-stone-950 stroke-[2.5]" />
          <span>Edit Sunday Lineup</span>
        </button>
      </div>
    </div>
  );
};
