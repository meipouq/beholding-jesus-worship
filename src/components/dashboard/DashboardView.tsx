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
  Megaphone,
  History,
  AlertCircle
} from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import { ServiceLineup } from '../../types';
import { LineupShareModal } from '../lineups/LineupShareModal';
import { FullLineupCard } from './FullLineupCard';
import { UpcomingServicesList } from './UpcomingServicesList';
import { ServiceHistorySection } from './ServiceHistorySection';
import { AnnouncementModal } from '../announcements/AnnouncementModal';
import {
  getSortedUpcomingLineups,
  getCompletedServiceHistory,
  getLineupLifecycleStatus
} from '../../utils/serviceSchedule';

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
    announcements,
    activities,
    saveAnnouncement,
    duplicateLineup,
    setActiveModule,
    setActiveLineupId,
    playVideo,
    openChords,
    currentUser
  } = useWorship();

  const [sharingLineup, setSharingLineup] = useState<ServiceLineup | null>(null);
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);

  // 1. Automatic upcoming lineup detection: sorted chronologically
  const upcomingLineups = getSortedUpcomingLineups(lineups);
  const primaryLineup = upcomingLineups[0];
  const otherUpcomingLineups = upcomingLineups.slice(1);

  // 2. Completed services history (reverse chronological)
  const historyLineups = getCompletedServiceHistory(lineups);

  // 3. User announcements (only published ones shown on dashboard)
  const publishedAnnouncements = announcements.filter(a => !a.status || a.status === 'published');

  // Next upcoming rehearsal / schedule
  const nextRehearsal = rehearsals[0];
  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  const vocalistsCount = members.filter(m => m.vocal_range !== 'Instrumentalist').length || members.length;

  const handleCreateLineup = () => {
    setActiveLineupId(null);
    setActiveModule('lineups');
  };

  const handleDuplicateLineup = (id: string) => {
    const duplicated = duplicateLineup(id);
    setActiveLineupId(duplicated.id);
    setActiveModule('lineups');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-7xl mx-auto">
      {/* =========================================================================
          DESKTOP HERO BANNER
         ========================================================================= */}
      <div className="hidden md:block relative overflow-hidden rounded-3xl border border-[#E8E2D7] shadow-card bg-[#1E1D1B] min-h-[210px] text-white">
        <div 
          className="absolute inset-0 bg-cover bg-[center_20%]"
          style={{ backgroundImage: `url('/images/team_welcome_hero.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#171615]/95 via-[#171615]/75 via-45% to-black/20" />

        <div className="relative z-10 p-7 sm:p-9 flex flex-col justify-center h-full max-w-xl">
          <span className="text-amber-300 text-[11px] tracking-widest uppercase font-bold drop-shadow-xs">
            Welcome to
          </span>
          <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white mt-1 leading-snug drop-shadow-sm">
            Beholding Jesus Worship Team
          </h1>
          <p className="text-amber-100/90 text-xs sm:text-[13px] italic font-serif mt-1.5 tracking-wide drop-shadow-xs">
            Plan. Prepare. Worship.
          </p>
        </div>
      </div>

      {/* =========================================================================
          MOBILE HERO & NEXT SERVICE CARDS
         ========================================================================= */}
      <div className="block md:hidden space-y-4">
        {/* Mobile Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-[#E8E2D7] shadow-card bg-[#1E1D1B] p-5 text-white min-h-[170px] flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-cover bg-[center_18%]"
            style={{ backgroundImage: `url('/images/team_welcome_hero.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 via-40% to-transparent" />
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white leading-tight drop-shadow-sm">
              Welcome Team!
            </h2>
            <p className="text-xs text-amber-100/90 italic font-serif mt-0.5 drop-shadow-xs">
              Together in Worship
            </p>
          </div>
        </div>

        {/* Mobile Next Service Card */}
        {primaryLineup ? (
          <FullLineupCard
            lineup={primaryLineup}
            songs={songs}
            members={members}
            onViewLineup={(lineupId) => {
              setActiveLineupId(lineupId);
              setActiveModule('lineups');
            }}
            onShareLineup={(l) => setSharingLineup(l)}
            onPlayVideo={playVideo}
            onOpenChords={openChords}
          />
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-[#E8E2D7] shadow-soft text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] border border-stone-200 text-stone-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6 text-amber-900" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">No Upcoming Service Lineup</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                All published upcoming services will automatically appear here based on scheduled date and time.
              </p>
            </div>
            <button
              onClick={handleCreateLineup}
              className="px-4 py-2.5 rounded-2xl bg-[#1E1D1B] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Create Service Lineup</span>
            </button>
          </div>
        )}

        {/* Mobile Upcoming Services List */}
        {otherUpcomingLineups.length > 0 && (
          <UpcomingServicesList
            lineups={otherUpcomingLineups}
            songs={songs}
            onSelectLineup={(id) => {
              setActiveLineupId(id);
              setActiveModule('lineups');
            }}
            onCreateLineup={handleCreateLineup}
          />
        )}

        {/* Mobile Service History Section */}
        {historyLineups.length > 0 && (
          <ServiceHistorySection
            historyLineups={historyLineups}
            songs={songs}
            onDuplicateLineup={handleDuplicateLineup}
            onShareLineup={(l) => setSharingLineup(l)}
          />
        )}
      </div>

      {/* =========================================================================
          STAT CARDS ROW (Desktop Only)
         ========================================================================= */}
      <div className="hidden md:grid md:grid-cols-4 gap-4">
        {/* Stat 1: Total Songs */}
        <div 
          onClick={() => setActiveModule('songs')}
          className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E8E2D7] shadow-soft hover:shadow-card transition-all cursor-pointer flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#1E1D1B] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Music2 className="w-5 h-5 text-amber-300" />
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
            <Users className="w-5 h-5 text-amber-300" />
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

        {/* Stat 3: Upcoming Rehearsal */}
        <div 
          onClick={() => setActiveModule('rehearsals')}
          className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E8E2D7] shadow-soft hover:shadow-card transition-all cursor-pointer flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#1E1D1B] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5 text-amber-300" />
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
            <CheckSquare className="w-5 h-5 text-amber-300" />
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
          MOBILE QUICK ACCESS GRID
         ========================================================================= */}
      <div className="block md:hidden space-y-4">
        <div>
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5 px-1">
            Quick Access
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => setActiveModule('songs')}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-stone-50 border border-[#E8E2D7] shadow-soft transition-all active:scale-95"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] group-hover:bg-[#1E1D1B] text-stone-800 group-hover:text-amber-300 flex items-center justify-center transition-all mb-1.5 shadow-2xs">
                <Music2 className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold text-stone-800">Songs</span>
            </button>

            <button
              onClick={() => setActiveModule('lineups')}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-stone-50 border border-[#E8E2D7] shadow-soft transition-all active:scale-95"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] group-hover:bg-[#1E1D1B] text-stone-800 group-hover:text-amber-300 flex items-center justify-center transition-all mb-1.5 shadow-2xs">
                <ListMusic className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold text-stone-800">Lineups</span>
            </button>

            <button
              onClick={() => setActiveModule('announcements')}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-stone-50 border border-[#E8E2D7] shadow-soft transition-all active:scale-95"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] group-hover:bg-[#1E1D1B] text-stone-800 group-hover:text-amber-300 flex items-center justify-center transition-all mb-1.5 shadow-2xs">
                <Megaphone className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold text-stone-800">Announce</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TWO-COLUMN MAIN SECTION: Left (Lineup & History) + Right (Announcements & Events)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* LEFT COLUMN: PRIMARY LINEUP, UPCOMING LIST & SERVICE HISTORY */}
        <div className="space-y-6 lg:col-span-7">
          {/* Primary Lineup Card (Desktop) */}
          <div className="hidden md:block">
            {primaryLineup ? (
              <FullLineupCard
                lineup={primaryLineup}
                songs={songs}
                members={members}
                onViewLineup={(lineupId) => {
                  setActiveLineupId(lineupId);
                  setActiveModule('lineups');
                }}
                onShareLineup={(l) => setSharingLineup(l)}
                onPlayVideo={playVideo}
                onOpenChords={openChords}
              />
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-[#E8E2D7] shadow-soft flex flex-col justify-center items-center text-center py-14">
                <div className="w-14 h-14 rounded-2xl bg-[#F8F5EE] border border-stone-200 text-stone-400 flex items-center justify-center mb-3">
                  <Calendar className="w-7 h-7 text-amber-900" />
                </div>
                <h3 className="text-base font-bold text-stone-900">No Upcoming Service Lineup Scheduled</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm">
                  Create and publish a worship service lineup. The system will automatically detect the nearest date and time, show its live countdown, and manage rotation.
                </p>
                <button
                  onClick={handleCreateLineup}
                  className="mt-5 py-3 px-5 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-amber-300" />
                  <span>Create Service Lineup</span>
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Services Section (Below Primary Service) */}
          <UpcomingServicesList
            lineups={otherUpcomingLineups}
            songs={songs}
            onSelectLineup={(id) => {
              setActiveLineupId(id);
              setActiveModule('lineups');
            }}
            onCreateLineup={handleCreateLineup}
          />

          {/* Service History Section (Preserved Completed Lineups) */}
          <ServiceHistorySection
            historyLineups={historyLineups}
            songs={songs}
            onDuplicateLineup={handleDuplicateLineup}
            onShareLineup={(l) => setSharingLineup(l)}
          />
        </div>

        {/* RIGHT COLUMN: DYNAMIC ANNOUNCEMENTS, UPCOMING EVENTS & RECENT ACTIVITY */}
        <div className="col-span-1 lg:col-span-5 space-y-5 sm:space-y-6">
          {/* =========================================================================
              ANNOUNCEMENTS CARD (Requirement 11: Dynamic, No Hardcoded Content)
             ========================================================================= */}
          <div className="bg-white rounded-3xl p-5 border border-[#E8E2D7] shadow-soft">
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#D4A359]" />
                <h3 className="text-sm font-bold text-stone-900">Team Announcements</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddingAnnouncement(true)}
                  className="flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-200/80 transition-colors cursor-pointer"
                  title="Add Announcement"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-700" />
                  <span>Add</span>
                </button>
                <button
                  onClick={() => setActiveModule('announcements')}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="mt-3.5 space-y-3">
              {publishedAnnouncements.length === 0 ? (
                <div className="py-6 text-center text-xs text-stone-500">
                  <p className="font-semibold text-stone-700">No announcements yet.</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Click "Add" above to create an announcement for the worship team.
                  </p>
                </div>
              ) : (
                publishedAnnouncements.slice(0, 3).map((ann) => (
                  <div
                    key={ann.id}
                    onClick={() => setActiveModule('announcements')}
                    className="p-3 rounded-2xl bg-[#FAF6F0] hover:bg-stone-50 border border-stone-200/80 transition-colors cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-stone-900 truncate flex-1">
                        {ann.title}
                      </h4>
                      {ann.is_important && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-red-100 text-red-800 border border-red-200 shrink-0">
                          Important
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                      <span>By {ann.author_name}</span>
                      <span>{new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

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
          DESKTOP BOTTOM QUICK ACCESS TOOLBAR
         ========================================================================= */}
      <div className="hidden md:grid grid-cols-6 gap-3.5 pt-2">
        <button
          onClick={() => setActiveModule('songs')}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-stone-800 group cursor-pointer"
        >
          <Music2 className="w-5 h-5 mb-2 text-stone-800 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Song Library</span>
        </button>

        <button
          onClick={handleCreateLineup}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-stone-800 group cursor-pointer"
        >
          <CalendarPlus className="w-5 h-5 mb-2 text-stone-800 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Create Lineup</span>
        </button>

        <button
          onClick={() => setActiveModule('rehearsals')}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-stone-800 group cursor-pointer"
        >
          <Calendar className="w-5 h-5 mb-2 text-stone-800 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Manage Rehearsal</span>
        </button>

        <button
          onClick={() => setActiveModule('vocalists')}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-stone-800 group cursor-pointer"
        >
          <Users className="w-5 h-5 mb-2 text-stone-800 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Team Directory</span>
        </button>

        <button
          onClick={() => setActiveModule('tasks')}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-stone-800 group cursor-pointer"
        >
          <CheckSquare className="w-5 h-5 mb-2 text-stone-800 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Tasks & Duties</span>
        </button>

        <button
          onClick={() => setActiveModule('announcements')}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#E8E2D7] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-stone-800 group cursor-pointer"
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

      {/* Add Announcement Modal */}
      {isAddingAnnouncement && (
        <AnnouncementModal
          announcement={null}
          onClose={() => setIsAddingAnnouncement(false)}
          onSave={(saved) => {
            saveAnnouncement(saved);
            setIsAddingAnnouncement(false);
          }}
        />
      )}
    </div>
  );
};
