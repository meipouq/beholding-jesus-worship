import React, { useState } from 'react';
import {
  Music2,
  Users,
  Calendar,
  CheckSquare,
  Play,
  ArrowRight,
  PlusCircle,
  ListMusic,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  Share2,
  CheckCircle2,
  Plus,
  CalendarPlus,
  BarChart3,
  ImageIcon
} from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import { ServiceLineup } from '../../types';
import { LineupShareModal } from '../lineups/LineupShareModal';
import { FullLineupCard } from './FullLineupCard';

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

export const DashboardView: React.FC = () => {
  const {
    songs,
    members,
    rehearsals,
    tasks,
    lineups,
    activities,
    setActiveModule,
    setActiveLineupId,
    playVideo,
    openChords,
    currentUser
  } = useWorship();

  // Find the primary upcoming lineup (or the first published/draft lineup)
  const currentLineup = lineups.find(l => l.status === 'published') || lineups[0];
  const [sharingLineup, setSharingLineup] = useState<ServiceLineup | null>(null);

  // Next upcoming rehearsal / schedule
  const nextRehearsal = rehearsals[0];
  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  const vocalistsCount = members.filter(m => m.vocal_range !== 'Instrumentalist').length || members.length;

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-7xl mx-auto">
      {/* =========================================================================
          DESKTOP HERO BANNER (Matches Reference Image)
         ========================================================================= */}
      <div className="hidden md:block relative overflow-hidden rounded-3xl border border-[#E8E2D7] shadow-card bg-[#1E1D1B] min-h-[175px] text-white">
        {/* Background Image with Clean Sunset Cross */}
        <div 
          className="absolute inset-0 bg-cover bg-right"
          style={{ backgroundImage: `url('/images/clean_hero_desktop.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#171615] via-[#171615]/85 via-45% to-transparent" />

        <div className="relative z-10 p-7 sm:p-9 flex flex-col justify-center h-full max-w-xl">
          <span className="text-stone-300 text-[11px] tracking-widest uppercase font-semibold">
            Welcome to
          </span>
          <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white mt-1 leading-snug">
            Beholding Jesus Worship Team
          </h1>
          <p className="text-amber-100/90 text-xs sm:text-[13px] italic font-serif mt-1.5 tracking-wide">
            Plan. Prepare. Worship.
          </p>
        </div>
      </div>

      {/* =========================================================================
          MOBILE HERO & NEXT SERVICE CARDS (Matches Phone View in Reference)
         ========================================================================= */}
      <div className="block md:hidden space-y-4">
        {/* Mobile Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-[#E8E2D7] shadow-card bg-[#1E1D1B] p-5 text-white min-h-[140px] flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-cover bg-right"
            style={{ backgroundImage: `url('/images/clean_hero_mobile.png')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#171615] via-[#171615]/75 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white leading-tight">
              Welcome Team!
            </h2>
            <p className="text-xs text-stone-300 italic font-serif mt-0.5">
              Together in Worship
            </p>
          </div>
        </div>

        {/* Mobile Next Service Card - Full View with YouTube Play Links & Details */}
        {currentLineup ? (
          <FullLineupCard
            lineup={currentLineup}
            songs={songs}
            onViewLineup={(lineupId) => {
              setActiveLineupId(lineupId);
              setActiveModule('lineups');
            }}
            onShareLineup={(l) => setSharingLineup(l)}
            onPlayVideo={playVideo}
            onOpenChords={openChords}
          />
        ) : (
          <div className="bg-white rounded-3xl p-5 border border-[#E8E2D7] shadow-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#F8F5EE] border border-[#E8E2D7] text-stone-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Next Service
                </span>
                <span className="text-xs font-bold text-stone-600">
                  No Service Lineup Scheduled
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveLineupId(null);
                setActiveModule('lineups');
              }}
              className="px-3.5 py-2 rounded-xl bg-[#1E1D1B] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          STAT CARDS ROW (Desktop Only, Matches Reference Image)
         ========================================================================= */}
      <div className="hidden md:grid md:grid-cols-4 gap-4">
        {/* Stat 1: Total Songs */}
        <div 
          onClick={() => setActiveModule('songs')}
          className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E8E2D7] shadow-soft hover:shadow-card transition-all cursor-pointer flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#1E1D1B] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Music2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">
              Total Songs
            </span>
            <span className="text-2xl font-bold text-stone-900">
              {songs.length}
            </span>
          </div>
        </div>

        {/* Stat 2: Vocalists */}
        <div 
          onClick={() => setActiveModule('vocalists')}
          className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E8E2D7] shadow-soft hover:shadow-card transition-all cursor-pointer flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#1E1D1B] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">
              Vocalists
            </span>
            <span className="text-2xl font-bold text-stone-900">
              {vocalistsCount}
            </span>
          </div>
        </div>

        {/* Stat 3: Upcoming Rehearsal (Dynamic) */}
        <div 
          onClick={() => setActiveModule('rehearsals')}
          className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E8E2D7] shadow-soft hover:shadow-card transition-all cursor-pointer flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#1E1D1B] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">
              Upcoming Rehearsal
            </span>
            <span className="text-base font-bold text-stone-900 leading-tight">
              {nextRehearsal ? `${formatServiceDate(nextRehearsal.date).split(', ')[1]?.split(' • ')[0] || nextRehearsal.date}, ${nextRehearsal.start_time}` : 'None Scheduled'}
            </span>
          </div>
        </div>

        {/* Stat 4: Pending Tasks */}
        <div 
          onClick={() => setActiveModule('tasks')}
          className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E8E2D7] shadow-soft hover:shadow-card transition-all cursor-pointer flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#1E1D1B] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">
              Pending Tasks
            </span>
            <span className="text-2xl font-bold text-stone-900">
              {pendingTasksCount}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE QUICK ACCESS GRID (Matches Phone View in Reference Image)
         ========================================================================= */}
      <div className="block md:hidden space-y-4">
        <div>
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5 px-1">
            Quick Access
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => setActiveModule('songs')}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:bg-stone-50 transition-colors"
            >
              <Music2 className="w-5 h-5 text-stone-800 mb-1.5" />
              <span className="text-[11px] font-semibold text-stone-800 text-center">Song Library</span>
            </button>

            <button
              onClick={() => setActiveModule('vocalists')}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:bg-stone-50 transition-colors"
            >
              <Users className="w-5 h-5 text-stone-800 mb-1.5" />
              <span className="text-[11px] font-semibold text-stone-800 text-center">Vocalists</span>
            </button>

            <button
              onClick={() => setActiveModule('rehearsals')}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:bg-stone-50 transition-colors"
            >
              <Calendar className="w-5 h-5 text-stone-800 mb-1.5" />
              <span className="text-[11px] font-semibold text-stone-800 text-center">Rehearsal</span>
            </button>

            <button
              onClick={() => setActiveModule('tasks')}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:bg-stone-50 transition-colors"
            >
              <CheckSquare className="w-5 h-5 text-stone-800 mb-1.5" />
              <span className="text-[11px] font-semibold text-stone-800 text-center">Tasks</span>
            </button>

            <button
              onClick={() => setActiveModule('lineups')}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:bg-stone-50 transition-colors"
            >
              <ListMusic className="w-5 h-5 text-stone-800 mb-1.5" />
              <span className="text-[11px] font-semibold text-stone-800 text-center">Lineups</span>
            </button>

            <button
              onClick={() => setActiveModule('announcements')}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:bg-stone-50 transition-colors"
            >
              <FileText className="w-5 h-5 text-stone-800 mb-1.5" />
              <span className="text-[11px] font-semibold text-stone-800 text-center">Announce</span>
            </button>
          </div>
        </div>

        {/* Mobile Upcoming Events Section (Matches Mobile Reference) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2.5">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Upcoming Events
            </h3>
            <button
              onClick={() => setActiveModule('rehearsals')}
              className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {nextRehearsal ? (
            <div
              onClick={() => setActiveModule('rehearsals')}
              className="bg-white rounded-2xl p-3.5 border border-[#E8E2D7] shadow-soft flex items-center gap-3 cursor-pointer hover:bg-stone-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F8F5EE] border border-[#E8E2D7] flex items-center justify-center text-stone-800 shrink-0">
                <Calendar className="w-5 h-5 text-stone-800" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-stone-900 truncate">
                  {nextRehearsal.title}
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                  {(() => {
                    const parts = nextRehearsal.date.split('-');
                    if (parts.length === 3) {
                      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
                      const month = d.toLocaleDateString('en-US', { month: 'short' });
                      return `${weekday}, ${month} ${parts[2]} • ${nextRehearsal.start_time}`;
                    }
                    return `${nextRehearsal.date} • ${nextRehearsal.start_time}`;
                  })()}
                </p>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  Participants: {nextRehearsal.participants?.length || 0}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-4 text-center text-xs text-stone-400 border border-[#E8E2D7]">
              No upcoming events scheduled.
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          TWO-COLUMN MAIN SECTION (Lineup Card & Right Column)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* LEFT COLUMN: ACTIVE LINEUP FULL CARD OR EMPTY STATE (Desktop) */}
        <div className="hidden md:block lg:col-span-7">
          {currentLineup ? (
            <FullLineupCard
              lineup={currentLineup}
              songs={songs}
              onViewLineup={(lineupId) => {
                setActiveLineupId(lineupId);
                setActiveModule('lineups');
              }}
              onShareLineup={(l) => setSharingLineup(l)}
              onPlayVideo={playVideo}
              onOpenChords={openChords}
            />
          ) : (
            /* Empty State when Lineup is Deleted */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D7] shadow-soft flex flex-col justify-center items-center text-center py-14">
              <div className="w-14 h-14 rounded-2xl bg-[#F8F5EE] border border-stone-200 text-stone-400 flex items-center justify-center mb-3">
                <Calendar className="w-7 h-7 text-amber-900" />
              </div>
              <h3 className="text-base font-bold text-stone-900">No Service Lineup Scheduled</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                All previous lineups have been deleted. You can create a new worship service lineup for any date with songs, vocal keys, and team assignments.
              </p>
              <button
                onClick={() => {
                  setActiveLineupId(null);
                  setActiveModule('lineups');
                }}
                className="mt-5 py-3 px-5 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Service Lineup</span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: UPCOMING EVENTS & RECENT ACTIVITY */}
        <div className="col-span-1 lg:col-span-5 space-y-5 sm:space-y-6">
          {/* Upcoming Events Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#E8E2D7] shadow-soft">
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-stone-800" />
                <h3 className="text-sm font-bold text-stone-900">Upcoming Events</h3>
              </div>
              <button
                onClick={() => setActiveModule('rehearsals')}
                className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3.5 space-y-3">
              {rehearsals.length === 0 ? (
                <div className="py-6 text-center text-xs text-stone-400">
                  No upcoming events scheduled.
                </div>
              ) : (
                rehearsals.slice(0, 3).map((event) => {
                  const parts = event.date.split('-');
                  let monthStr = 'NOV';
                  let dayNum = event.date;
                  if (parts.length === 3) {
                    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                    monthStr = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                    dayNum = parts[2];
                  }

                  return (
                    <div
                      key={event.id}
                      onClick={() => setActiveModule('rehearsals')}
                      className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      {/* Date Block */}
                      <div className="w-12 h-12 rounded-2xl bg-[#F8F5EE] border border-stone-200 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-stone-500 tracking-wider">
                          {monthStr}
                        </span>
                        <span className="text-base font-extrabold text-stone-900 leading-none">
                          {dayNum}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {event.title}
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                          {event.start_time} – {event.venue}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#E8E2D7] shadow-soft">
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-stone-800" />
                <h3 className="text-sm font-bold text-stone-900">Recent Activity</h3>
              </div>
              <button
                onClick={() => setActiveModule('announcements')}
                className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3.5 space-y-3">
              {activities.length === 0 ? (
                <div className="py-6 text-center text-xs text-stone-400">
                  No recent activities yet.
                </div>
              ) : (
                activities.slice(0, 3).map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1E1D1B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {act.user_avatar && act.user_avatar.length <= 3
                        ? act.user_avatar
                        : act.user_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-stone-800 leading-tight">
                        <span className="font-semibold text-stone-900">{act.action}</span>
                      </p>
                      <span className="text-[10px] text-stone-400 mt-0.5 block">
                        {act.timestamp}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DESKTOP BOTTOM QUICK ACCESS TOOLBAR (Matches Reference Image)
         ========================================================================= */}
      <div className="hidden md:grid grid-cols-6 gap-3.5 pt-2">
        <button
          onClick={() => setActiveModule('songs')}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-stone-800 group"
        >
          <Music2 className="w-5 h-5 mb-2 text-stone-800 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Song Library</span>
        </button>

        <button
          onClick={() => {
            setActiveLineupId(null);
            setActiveModule('lineups');
          }}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-stone-800 group"
        >
          <CalendarPlus className="w-5 h-5 mb-2 text-stone-800 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Create Lineup</span>
        </button>

        <button
          onClick={() => setActiveModule('rehearsals')}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-stone-800 group"
        >
          <Calendar className="w-5 h-5 mb-2 text-stone-800 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Manage Rehearsal</span>
        </button>

        <button
          onClick={() => setActiveModule('vocalists')}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-stone-800 group"
        >
          <Users className="w-5 h-5 mb-2 text-stone-800 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Team Directory</span>
        </button>

        <button
          onClick={() => setActiveModule('tasks')}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-stone-800 group"
        >
          <CheckSquare className="w-5 h-5 mb-2 text-stone-800 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Tasks & Duties</span>
        </button>

        <button
          onClick={() => setActiveModule('announcements')}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-stone-800 group"
        >
          <FileText className="w-5 h-5 mb-2 text-stone-800 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Announcements</span>
        </button>
      </div>

      {/* Share / Save as Photo Modal */}
      {sharingLineup && (
        <LineupShareModal
          lineup={sharingLineup}
          onClose={() => setSharingLineup(null)}
        />
      )}
    </div>
  );
};
