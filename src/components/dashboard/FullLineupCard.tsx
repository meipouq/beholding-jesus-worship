import React, { useState } from 'react';
import {
  Calendar,
  Music2,
  Users,
  Mic,
  Clock,
  Play,
  FileText,
  Share2,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  Radio
} from 'lucide-react';
import { ServiceLineup, Song } from '../../types';

interface FullLineupCardProps {
  lineup: ServiceLineup;
  songs: Song[];
  onViewLineup: (lineupId: string) => void;
  onShareLineup: (lineup: ServiceLineup) => void;
  onPlayVideo: (title: string, url: string) => void;
  onOpenChords: (song: Song) => void;
}

function formatServiceDate(dateStr?: string, timeStr?: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, monthIndex, day);
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      return `${weekday}, ${month} ${day}, ${year}${timeStr ? ` • ${timeStr}` : ''}`;
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
  const [isRosterExpanded, setIsRosterExpanded] = useState(true);

  // Group songs by category
  const categorizedSongs: { [category: string]: typeof lineup.songs } = {};
  if (lineup.songs && lineup.songs.length > 0) {
    lineup.songs.forEach((song) => {
      const cat = (song.category || 'General Worship').toUpperCase();
      if (!categorizedSongs[cat]) {
        categorizedSongs[cat] = [];
      }
      categorizedSongs[cat].push(song);
    });
  }

  const isPublished = lineup.status === 'published';
  const totalSongsCount = lineup.songs?.length || 0;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E8E2D7] shadow-soft space-y-4 sm:space-y-5 transition-all">
      {/* =========================================================================
          1. HEADER SECTION: Title, Date, Status, Author & Share Button
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-stone-100">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#1E1D1B] text-white shrink-0 shadow-2xs mt-0.5">
            <Calendar className="w-5 h-5 text-amber-200" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-900 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100/70 border border-amber-200/80">
                Next Service Lineup
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                  isPublished
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {isPublished ? 'Official Lineup' : 'Draft Setlist'}
              </span>
            </div>

            <h2 className="text-base sm:text-xl font-black text-stone-900 tracking-tight leading-tight">
              {lineup.title}
            </h2>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs text-stone-500">
              <span className="font-semibold text-stone-700">
                {formatServiceDate(lineup.service_date, lineup.service_time)}
              </span>
              {lineup.created_by && (
                <>
                  <span className="text-stone-300">•</span>
                  <span className="text-stone-600 font-medium">
                    Posted by <strong className="text-stone-800">{lineup.created_by}</strong>
                  </span>
                </>
              )}
            </div>

            {lineup.theme && (
              <div className="mt-2 text-xs italic font-serif text-amber-950/80 bg-amber-50/70 px-3 py-1 rounded-xl border border-amber-200/50 inline-block">
                Theme: "{lineup.theme}"
              </div>
            )}
          </div>
        </div>

        {/* Share as Photo Button */}
        <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
          <button
            onClick={() => onShareLineup(lineup)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-stone-200/80 text-stone-800 text-xs font-bold border border-stone-200 transition-all shadow-2xs hover:shadow-soft"
            title="Share Lineup / Save as Landscape Photo"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-800" />
            <span>Share / Photo</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. MINISTRY TEAM ROSTER STRIP: Worship Leader, Vocals, Band & Reminders
         ========================================================================= */}
      <div className="bg-[#FAF6F0] rounded-2xl p-3.5 sm:p-4 border border-[#EAE3D7] space-y-3">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-800" />
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Ministry Team on Duty
            </span>
          </div>
          <button
            onClick={() => setIsRosterExpanded(!isRosterExpanded)}
            className="text-[11px] font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1"
          >
            <span>{isRosterExpanded ? 'Hide Details' : 'Show Details'}</span>
            {isRosterExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isRosterExpanded && (
          <div className="space-y-3 pt-1 border-t border-stone-200/60 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Worship Leader */}
              <div className="bg-white/80 rounded-xl p-2.5 border border-stone-200/60">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-0.5">
                  <Mic className="w-3 h-3" />
                  <span>Worship Leader</span>
                </div>
                <div className="text-xs font-bold text-stone-900 truncate">
                  {lineup.worship_leader_name || 'TBA'}
                </div>
              </div>

              {/* Vocal Team */}
              <div className="bg-white/80 rounded-xl p-2.5 border border-stone-200/60">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-0.5">
                  <Users className="w-3 h-3" />
                  <span>Vocal Team ({lineup.assigned_vocalists?.length || 0})</span>
                </div>
                <div className="text-xs font-medium text-stone-800 line-clamp-2">
                  {lineup.assigned_vocalists && lineup.assigned_vocalists.length > 0
                    ? lineup.assigned_vocalists.map(v => v.name).join(', ')
                    : 'Worship Team Vocalists'}
                </div>
              </div>

              {/* Band & Musicians */}
              <div className="bg-white/80 rounded-xl p-2.5 border border-stone-200/60">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-0.5">
                  <Music2 className="w-3 h-3" />
                  <span>Band & Musicians</span>
                </div>
                <div className="text-xs font-medium text-stone-800 line-clamp-2">
                  {lineup.assigned_musicians && lineup.assigned_musicians.length > 0
                    ? lineup.assigned_musicians.map(m => `${m.name} (${m.instrument})`).join(', ')
                    : 'Worship Band'}
                </div>
              </div>
            </div>

            {/* Call Time & Service Notes */}
            {lineup.notes && (
              <div className="flex items-start gap-2 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/70 text-xs">
                <Clock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <div className="text-stone-700 leading-snug">
                  <strong className="text-amber-950 font-bold block mb-0.5">Call Time & Reminders:</strong>
                  <span className="italic whitespace-pre-line">{lineup.notes}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          3. WORSHIP SONGS SETLIST: Category Headers, Song Rows, Keys & YouTube Play Links
         ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-stone-800" />
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
              Worship Setlist ({totalSongsCount} {totalSongsCount === 1 ? 'Song' : 'Songs'})
            </h3>
          </div>
          <span className="text-[11px] text-stone-500 font-medium hidden sm:inline">
            Tap "Play Video" to rehearse on YouTube
          </span>
        </div>

        {totalSongsCount === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400 bg-[#FAF6F0]/60 rounded-2xl border border-dashed border-stone-200">
            No songs assigned to this lineup yet.
          </div>
        ) : (
          <div className="space-y-3.5">
            {Object.entries(categorizedSongs).map(([categoryName, songItems]) => (
              <div key={categoryName} className="space-y-2">
                {/* Category Header Bar */}
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#EFE8DC] text-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-800" />
                    <span className="text-[11px] font-bold tracking-wider uppercase">
                      {categoryName}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-stone-600">
                    {songItems.length} {songItems.length === 1 ? 'SONG' : 'SONGS'}
                  </span>
                </div>

                {/* Song Rows */}
                <div className="space-y-2 pl-0.5">
                  {songItems.map((item, idx) => {
                    const originalSong = songs.find(s => s.id === item.song_id);
                    const videoUrl = item.youtube_url || originalSong?.youtube_url;

                    return (
                      <div
                        key={item.id || `${item.song_id}-${idx}`}
                        className="rounded-2xl border border-stone-200/90 bg-[#FAF6F0]/70 hover:bg-[#FAF6F0] p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 transition-colors shadow-2xs"
                      >
                        {/* Song Details: Order, Title, Artist, Lead Vocalist */}
                        <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-6 h-6 rounded-full bg-[#1E1D1B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs mt-0.5 sm:mt-0">
                            {item.order || idx + 1}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => {
                                  if (originalSong) onOpenChords(originalSong);
                                }}
                                className="text-xs sm:text-sm font-bold text-stone-900 hover:text-amber-800 text-left leading-snug transition-colors truncate max-w-full"
                                title="Click to view Chords & Lyrics"
                              >
                                {item.title}
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-[11px] text-stone-500">
                              {item.artist && <span>{item.artist}</span>}
                              {item.assigned_vocalist_name && (
                                <>
                                  <span className="text-stone-300">•</span>
                                  <span className="text-amber-800 font-bold bg-amber-100/70 px-1.5 py-0.2 rounded-md">
                                    Lead: {item.assigned_vocalist_name}
                                  </span>
                                </>
                              )}
                              {item.notes && (
                                <>
                                  <span className="text-stone-300">•</span>
                                  <span className="italic text-stone-400">"{item.notes}"</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Song Actions: Key Badge + Play Video Button + Chords Button */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/60">
                          {/* Key Badge */}
                          <div className="px-2.5 py-1 rounded-xl bg-amber-100/80 text-amber-900 text-xs font-black border border-amber-300/80 shadow-2xs">
                            Key {item.selected_key || item.original_key || 'C'}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* YouTube Play Video Button */}
                            {videoUrl ? (
                              <button
                                onClick={() => onPlayVideo(item.title, videoUrl)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-2xs hover:shadow-soft active:scale-95"
                                title="Watch YouTube Rehearsal Video"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span className="text-[11px]">Play Video</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-stone-400 px-2 py-1 italic">
                                No Video
                              </span>
                            )}

                            {/* View Chords & Lyrics Button */}
                            {originalSong && (
                              <button
                                onClick={() => onOpenChords(originalSong)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200 shadow-2xs transition-colors"
                                title="View Chords & Lyrics"
                              >
                                <FileText className="w-3 h-3 text-stone-500" />
                                <span className="text-[11px] hidden sm:inline">Chords</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          4. FOOTER ACTIONS: View / Edit Full Lineup & Share as Photo
         ========================================================================= */}
      <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center gap-2.5">
        <button
          onClick={() => onViewLineup(lineup.id)}
          className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <span>Open Lineup Builder & Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onShareLineup(lineup)}
          className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-[#FAF6F0] hover:bg-amber-100/70 text-amber-900 border border-amber-200/90 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <Share2 className="w-3.5 h-3.5 text-amber-800" />
          <span>Save as Landscape Photo</span>
        </button>
      </div>
    </div>
  );
};
