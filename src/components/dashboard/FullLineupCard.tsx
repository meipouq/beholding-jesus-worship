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
  Award,
  Star,
  CheckCircle2
} from 'lucide-react';
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

// Helper: Vocal range color badges
function getVocalRangeBadge(range?: string) {
  const r = (range || '').toLowerCase();
  if (r.includes('soprano') && !r.includes('mezzo')) {
    return {
      bg: 'bg-rose-50 text-rose-800 border-rose-200/90',
      dot: 'bg-rose-500',
      label: 'Soprano'
    };
  }
  if (r.includes('mezzo')) {
    return {
      bg: 'bg-purple-50 text-purple-800 border-purple-200/90',
      dot: 'bg-purple-500',
      label: 'Mezzo-Soprano'
    };
  }
  if (r.includes('alto')) {
    return {
      bg: 'bg-amber-50 text-amber-900 border-amber-200/90',
      dot: 'bg-amber-500',
      label: 'Alto'
    };
  }
  if (r.includes('tenor')) {
    return {
      bg: 'bg-sky-50 text-sky-800 border-sky-200/90',
      dot: 'bg-sky-500',
      label: 'Tenor'
    };
  }
  if (r.includes('baritone')) {
    return {
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-200/90',
      dot: 'bg-indigo-500',
      label: 'Baritone'
    };
  }
  if (r.includes('bass')) {
    return {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
      dot: 'bg-emerald-500',
      label: 'Bass'
    };
  }
  return {
    bg: 'bg-stone-100 text-stone-700 border-stone-200',
    dot: 'bg-stone-400',
    label: range || 'Vocalist'
  };
}

// Helper: Instrument emoji/icon
function getInstrumentBadge(inst?: string) {
  const i = (inst || '').toLowerCase();
  if (i.includes('key') || i.includes('piano') || i.includes('synth')) {
    return { icon: '🎹', title: 'Keyboards / Piano' };
  }
  if (i.includes('drum') || i.includes('percussion') || i.includes('beat')) {
    return { icon: '🥁', title: 'Drums & Percussion' };
  }
  if (i.includes('bass')) {
    return { icon: '🎸', title: 'Bass Guitar' };
  }
  if (i.includes('guitar') || i.includes('acoustic') || i.includes('lead') || i.includes('electric')) {
    return { icon: '🎸', title: 'Acoustic / Electric Guitar' };
  }
  return { icon: '🎵', title: inst || 'Instrumentalist' };
}

// Helper: Generate Initials
function getInitials(name?: string): string {
  if (!name) return 'W';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const FullLineupCard: React.FC<FullLineupCardProps> = ({
  lineup,
  songs,
  members = [],
  onViewLineup,
  onShareLineup,
  onPlayVideo,
  onOpenChords
}) => {
  const [isRosterExpanded, setIsRosterExpanded] = useState(true);

  // Helper to resolve full member info by id or name
  const findMember = (idOrName?: string) => {
    if (!idOrName || !members || members.length === 0) return undefined;
    const clean = idOrName.trim().toLowerCase();
    return members.find(
      (m) => m.id === idOrName || m.name.trim().toLowerCase() === clean
    );
  };

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

  // Resolve Worship Leader info
  const leaderMember = findMember(lineup.worship_leader_id) || findMember(lineup.worship_leader_name);
  const leaderName = lineup.worship_leader_name || leaderMember?.name || 'TBA';
  const leaderVocalRange = leaderMember?.vocal_range || 'Lead Vocalist';
  const leaderAvatar = leaderMember?.avatar;

  // Resolve Vocal Team
  const assignedVocalists = lineup.assigned_vocalists || [];
  const assignedMusicians = lineup.assigned_musicians || [];

  // Total Team Members Count
  const totalServants = (leaderName && leaderName !== 'TBA' ? 1 : 0) + assignedVocalists.length + (assignedMusicians.length || 4);

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
          2. UPGRADED HIGH-AESTHETIC MINISTRY TEAM ROSTER (MAIN APP HIGHLIGHT)
         ========================================================================= */}
      <div className="bg-gradient-to-br from-[#FAF7F2] via-[#F5EEE4] to-[#FAF7F2] rounded-3xl p-4 sm:p-5 border border-[#E5DDD0] shadow-2xs space-y-4">
        {/* Roster Title Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#1E1D1B] text-amber-300 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-stone-900 uppercase tracking-wider">
                  Ministry Team Roster
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100/90 text-amber-900 border border-amber-300/80">
                  {totalServants} Servants on Duty
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
                Sanctuary team appointed for praise, adoration & musical excellence
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRosterExpanded(!isRosterExpanded)}
            className="text-[11px] font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 bg-white/70 hover:bg-white px-2.5 py-1 rounded-xl border border-stone-200 transition-colors"
          >
            <span>{isRosterExpanded ? 'Collapse' : 'Expand Roster'}</span>
            {isRosterExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isRosterExpanded && (
          <div className="space-y-4 pt-1 border-t border-stone-200/80 animate-fade-in">
            {/* ---------------------------------------------------------------------
                A. FEATURED WORSHIP LEADER SPOTLIGHT CARD
               --------------------------------------------------------------------- */}
            <div className="bg-gradient-to-r from-[#1E1D1B] via-[#2A2723] to-[#1E1D1B] text-white rounded-2xl p-3.5 sm:p-4 border border-amber-500/30 shadow-md relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  {/* Leader Avatar / Initials with Gold Halo */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ring-2 ring-amber-400 ring-offset-2 ring-offset-[#1E1D1B] overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 text-[#1E1D1B] font-black text-base sm:text-lg flex items-center justify-center shadow-md">
                      {leaderAvatar ? (
                        <img
                          src={leaderAvatar}
                          alt={leaderName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // fallback to initials on error
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{getInitials(leaderName)}</span>
                      )}
                    </div>
                    <div
                      className="absolute -bottom-1 -right-1 bg-amber-400 text-stone-950 p-1 rounded-full shadow-2xs border border-[#1E1D1B]"
                      title="Worship Leader"
                    >
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </div>
                  </div>

                  {/* Leader Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-300 uppercase tracking-widest">
                      <Award className="w-3 h-3" />
                      <span>Worship Leader & Service Host</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-snug truncate mt-0.5">
                      {leaderName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-stone-300">
                      <span className="px-2 py-0.5 rounded-lg bg-white/10 text-amber-200 font-bold text-[10px] border border-amber-300/20">
                        {leaderVocalRange}
                      </span>
                      <span className="text-[11px] text-stone-300 italic hidden sm:inline">
                        Leading sanctuary into His holy presence
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Badge */}
                <div className="hidden sm:flex flex-col items-end justify-center shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/15 px-3 py-1.5 rounded-xl border border-amber-400/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-amber-400" />
                    <span>Platform Lead</span>
                  </span>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------------------------
                B. INDIVIDUAL VOCAL TEAM CARDS
               --------------------------------------------------------------------- */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Mic className="w-3.5 h-3.5 text-amber-800" />
                  <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
                    Vocal Team
                  </span>
                  <span className="text-[10px] font-bold text-stone-500">
                    ({assignedVocalists.length} {assignedVocalists.length === 1 ? 'Voice' : 'Voices'})
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-stone-500 italic hidden sm:inline">
                  Harmonies & Leading Voices
                </span>
              </div>

              {assignedVocalists.length === 0 ? (
                <div className="p-3 bg-white/80 rounded-2xl border border-stone-200/70 text-center text-xs text-stone-500">
                  No vocalists assigned yet • Vocal team will be listed here.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {assignedVocalists.map((v) => {
                    const mInfo = findMember(v.id) || findMember(v.name);
                    const vocalRange = v.vocal_range || mInfo?.vocal_range || 'Vocalist';
                    const avatarUrl = v.avatar || mInfo?.avatar;
                    const rangeStyle = getVocalRangeBadge(vocalRange);

                    // Check if this vocalist leads any song in this lineup
                    const leadingSongs = lineup.songs.filter(
                      (s) =>
                        (s.assigned_vocalist_id && s.assigned_vocalist_id === v.id) ||
                        (s.assigned_vocalist_name &&
                          s.assigned_vocalist_name.toLowerCase() === v.name.toLowerCase())
                    );

                    return (
                      <div
                        key={v.id || v.name}
                        className="bg-white rounded-2xl p-3 border border-stone-200/90 shadow-2xs hover:shadow-soft hover:border-amber-300/80 transition-all flex items-center justify-between gap-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Avatar / Initials */}
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EFE8DC] to-[#DFD6C7] text-stone-800 font-bold text-xs flex items-center justify-center shrink-0 border border-stone-200 overflow-hidden">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={v.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span>{getInitials(v.name)}</span>
                            )}
                          </div>

                          {/* Vocalist Name & Lead Song indicator */}
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-stone-900 leading-tight truncate">
                              {v.name}
                            </h5>
                            {leadingSongs.length > 0 ? (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 mt-0.5 truncate">
                                <Mic className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">Lead: "{leadingSongs[0].title}"</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-stone-400 block mt-0.5">
                                Sanctuary Harmony
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Vocal Range Pill */}
                        <div
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border shrink-0 flex items-center gap-1 ${rangeStyle.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${rangeStyle.dot}`} />
                          <span>{rangeStyle.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ---------------------------------------------------------------------
                C. INDIVIDUAL BAND & MUSICIANS CARDS
               --------------------------------------------------------------------- */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Music2 className="w-3.5 h-3.5 text-amber-800" />
                  <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
                    Band & Instrumentalists
                  </span>
                  <span className="text-[10px] font-bold text-stone-500">
                    ({assignedMusicians.length > 0 ? assignedMusicians.length : '4'} Instruments)
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-stone-500 italic hidden sm:inline">
                  Sanctuary Rhythm & Melody
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {assignedMusicians.length > 0 ? (
                  assignedMusicians.map((m) => {
                    const badge = getInstrumentBadge(m.instrument);
                    return (
                      <div
                        key={m.id || `${m.name}-${m.instrument}`}
                        className="bg-white rounded-2xl p-3 border border-stone-200/90 shadow-2xs flex items-center gap-2.5"
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-base flex items-center justify-center shrink-0 border border-amber-200/60">
                          {badge.icon}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-stone-900 truncate leading-tight">
                            {m.name}
                          </h5>
                          <span className="text-[10px] text-stone-500 block truncate">
                            {badge.title}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Elegant sanctuary standard band layout if no custom musicians specified
                  [
                    { icon: '🎹', role: 'Keyboards / Piano', status: 'Worship Band' },
                    { icon: '🎸', role: 'Acoustic / Lead Guitar', status: 'Worship Band' },
                    { icon: '🎸', role: 'Bass Guitar', status: 'Worship Band' },
                    { icon: '🥁', role: 'Drums & Percussion', status: 'Worship Band' }
                  ].map((inst) => (
                    <div
                      key={inst.role}
                      className="bg-white/90 rounded-2xl p-2.5 border border-stone-200/80 shadow-2xs flex items-center gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-stone-100 text-base flex items-center justify-center shrink-0 border border-stone-200">
                        {inst.icon}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-stone-800 truncate leading-tight">
                          {inst.role}
                        </h5>
                        <span className="text-[10px] text-stone-400 block">
                          {inst.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ---------------------------------------------------------------------
                D. CALL TIME & STAGE PREPARATION SCHEDULE
               --------------------------------------------------------------------- */}
            <div className="bg-amber-50/90 rounded-2xl p-3.5 border border-amber-200/80 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-xl bg-amber-200/80 text-amber-900 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h5 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                      Stage Prep & Service Schedule
                    </h5>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
                      Praise & Prayer Prior to Service
                    </span>
                  </div>

                  {lineup.notes ? (
                    <p className="text-xs text-stone-700 whitespace-pre-line leading-relaxed italic pt-0.5">
                      "{lineup.notes}"
                    </p>
                  ) : (
                    <p className="text-xs text-stone-600 leading-relaxed pt-0.5">
                      Call time for soundcheck and prayer: <strong>45 minutes prior to service start</strong>. Please ensure all instruments and vocal harmonies are rehearsed.
                    </p>
                  )}
                </div>
              </div>
            </div>
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
                    const originalSong = songs.find((s) => s.id === item.song_id);
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
