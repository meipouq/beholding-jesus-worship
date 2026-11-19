import React, { useState, useEffect } from 'react';
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

  // Real-time timer to trigger automatic promotion/rotation the exact second a service reaches its end time
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Automatic upcoming lineup detection: sorted chronologically (1st and 2nd positions)
  const upcomingLineups = getSortedUpcomingLineups(lineups, currentTime);
  const primaryLineup = upcomingLineups[0];
  const secondaryLineup = upcomingLineups[1];
  const remainingUpcomingLineups = upcomingLineups.slice(2);

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
      <div className="hidden md:block relative overflow-hidden rounded-3xl border border-[#35312B] shadow-card bg-[#161616] min-h-[210px] text-[#F5F0E6]">
        <div 
          className="absolute inset-0 bg-cover bg-[center_20%]"
          style={{ backgroundImage: `url('/images/team_welcome_hero.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101010]/95 via-[#101010]/75 via-45% to-black/30" />

        <div className="relative z-10 p-7 sm:p-9 flex flex-col justify-center h-full max-w-xl">
          <span className="text-[#D9A441] text-[11px] tracking-widest uppercase font-bold drop-shadow-xs">
            Welcome to
          </span>
          <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-[#F5F0E6] mt-1 leading-snug drop-shadow-sm">
            Beholding Jesus Worship Team
          </h1>
          <p className="text-[#AAA5A0] text-xs sm:text-[13px] italic font-serif mt-1.5 tracking-wide drop-shadow-xs">
            Plan. Prepare. Worship.
          </p>
        </div>
      </div>

      {/* =========================================================================
          MOBILE HERO & NEXT SERVICE CARDS
         ========================================================================= */}
      <div className="block md:hidden space-y-4">
        {/* Mobile Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-[#35312B] shadow-card bg-[#161616] p-5 text-[#F5F0E6] min-h-[170px] flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-cover bg-[center_18%]"
            style={{ backgroundImage: `url('/images/team_welcome_hero.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 via-40% to-transparent" />
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-[#F5F0E6] leading-tight drop-shadow-sm">
              Welcome Team!
            </h2>
            <p className="text-xs text-[#D9A441] italic font-serif mt-0.5 drop-shadow-xs">
              Together in Worship
            </p>
          </div>
        </div>

        {/* Mobile Next 2 Upcoming Service Cards */}
        {primaryLineup ? (
          <div className="space-y-4">
            {/* Primary Upcoming / Ongoing Service (Card 1 with Countdown) */}
            <FullLineupCard
              lineup={primaryLineup}
              songs={songs}
              members={members}
              cardPosition="primary"
              showCountdown={true}
              onViewLineup={(lineupId) => {
                setActiveLineupId(lineupId);
                setActiveModule('lineups');
              }}
              onShareLineup={(l) => setSharingLineup(l)}
              onPlayVideo={playVideo}
              onOpenChords={openChords}
            />

            {/* Second Upcoming Service (Card 2 without duplicate countdown) */}
            {secondaryLineup && (
              <FullLineupCard
                lineup={secondaryLineup}
                songs={songs}
                members={members}
                cardPosition="secondary"
                showCountdown={false}
                onViewLineup={(lineupId) => {
                  setActiveLineupId(lineupId);
                  setActiveModule('lineups');
                }}
                onShareLineup={(l) => setSharingLineup(l)}
                onPlayVideo={playVideo}
                onOpenChords={openChords}
              />
            )}
          </div>
        ) : (
          <div className="bg-[#1F1F21] rounded-3xl p-6 border border-[#35312B] shadow-soft text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#161616] border border-[#35312B] text-[#D9A441] flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6 text-[#D9A441]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F5F0E6]">No Upcoming Service Lineup</h3>
              <p className="text-xs text-[#AAA5A0] mt-0.5">
                All published upcoming services will automatically appear here based on scheduled date and time.
              </p>
            </div>
            <button
              onClick={handleCreateLineup}
              className="px-4 py-2.5 rounded-2xl bg-[#D9A441] text-[#101010] hover:bg-[#F5C15D] text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 text-[#101010]" />
              <span>Create Service Lineup</span>
            </button>
          </div>
        )}

        {/* Mobile Remaining Upcoming Services List (3rd service onwards) */}
        {remainingUpcomingLineups.length > 0 && (
          <UpcomingServicesList
            lineups={remainingUpcomingLineups}
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
          className="bg-[#1F1F21] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#35312B] shadow-soft hover:shadow-card hover:border-[#D9A441]/40 transition-all cursor-pointer flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#161616] border border-[#35312B] text-[#D9A441] flex items-center justify-center shrink-0 shadow-2xs">
            <Music2 className="w-5 h-5 text-[#D9A441]" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-[#AAA5A0] uppercase tracking-wider block">
              Total Songs
            </span>
            <span className="text-2xl font-bold text-[#F5F0E6]">
              {songs.length}
            </span>
          </div>
        </div>

        {/* Stat 2: Vocalists */}
        <div 
          onClick={() => setActiveModule('vocalists')}
          className="bg-[#1F1F21] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#35312B] shadow-soft hover:shadow-card hover:border-[#D9A441]/40 transition-all cursor-pointer flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#161616] border border-[#35312B] text-[#D9A441] flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-5 h-5 text-[#D9A441]" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-[#AAA5A0] uppercase tracking-wider block">
              Vocalists
            </span>
            <span className="text-2xl font-bold text-[#F5F0E6]">
              {vocalistsCount}
            </span>
          </div>
        </div>

        {/* Stat 3: Upcoming Rehearsal */}
        <div 
          onClick={() => setActiveModule('rehearsals')}
          className="bg-[#1F1F21] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#35312B] shadow-soft hover:shadow-card hover:border-[#D9A441]/40 transition-all cursor-pointer flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#161616] border border-[#35312B] text-[#D9A441] flex items-center justify-center shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5 text-[#D9A441]" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-[#AAA5A0] uppercase tracking-wider block">
              Upcoming Rehearsal
            </span>
            <span className="text-base font-bold text-[#F5F0E6] leading-tight">
              {nextRehearsal ? `${formatServiceDate(nextRehearsal.date).split(', ')[1]?.split(' • ')[0] || nextRehearsal.date}, ${nextRehearsal.start_time}` : 'None Scheduled'}
            </span>
          </div>
        </div>

        {/* Stat 4: Pending Tasks */}
        <div 
          onClick={() => setActiveModule('tasks')}
          className="bg-[#1F1F21] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#35312B] shadow-soft hover:shadow-card hover:border-[#D9A441]/40 transition-all cursor-pointer flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#161616] border border-[#35312B] text-[#D9A441] flex items-center justify-center shrink-0 shadow-2xs">
            <CheckSquare className="w-5 h-5 text-[#D9A441]" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-[#AAA5A0] uppercase tracking-wider block">
              Pending Tasks
            </span>
            <span className="text-2xl font-bold text-[#F5F0E6]">
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
          <h3 className="text-xs font-bold text-[#AAA5A0] uppercase tracking-wider mb-2.5 px-1">
            Quick Access
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => setActiveModule('songs')}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1F1F21] hover:bg-[#262626] border border-[#35312B] hover:border-[#D9A441]/40 shadow-soft transition-all active:scale-95 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#161616] border border-[#35312B] text-[#D9A441] flex items-center justify-center transition-all mb-1.5 shadow-2xs">
                <Music2 className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold text-[#F5F0E6]">Songs</span>
            </button>

            <button
              onClick={() => setActiveModule('lineups')}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1F1F21] hover:bg-[#262626] border border-[#35312B] hover:border-[#D9A441]/40 shadow-soft transition-all active:scale-95 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#161616] border border-[#35312B] text-[#D9A441] flex items-center justify-center transition-all mb-1.5 shadow-2xs">
                <ListMusic className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold text-[#F5F0E6]">Lineups</span>
            </button>

            <button
              onClick={() => setActiveModule('announcements')}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1F1F21] hover:bg-[#262626] border border-[#35312B] hover:border-[#D9A441]/40 shadow-soft transition-all active:scale-95 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#161616] border border-[#35312B] text-[#D9A441] flex items-center justify-center transition-all mb-1.5 shadow-2xs">
                <Megaphone className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold text-[#F5F0E6]">Announce</span>
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
          {/* Primary & Secondary Lineup Cards (Desktop) */}
          <div className="hidden md:block space-y-5">
            {primaryLineup ? (
              <>
                {/* 1st Position: Primary Upcoming / Ongoing Service Card */}
                <FullLineupCard
                  lineup={primaryLineup}
                  songs={songs}
                  members={members}
                  cardPosition="primary"
                  showCountdown={true}
                  onViewLineup={(lineupId) => {
                    setActiveLineupId(lineupId);
                    setActiveModule('lineups');
                  }}
                  onShareLineup={(l) => setSharingLineup(l)}
                  onPlayVideo={playVideo}
                  onOpenChords={openChords}
                />

                {/* 2nd Position: Second-nearest Upcoming Service Card */}
                {secondaryLineup && (
                  <FullLineupCard
                    lineup={secondaryLineup}
                    songs={songs}
                    members={members}
                    cardPosition="secondary"
                    showCountdown={false}
                    onViewLineup={(lineupId) => {
                      setActiveLineupId(lineupId);
                      setActiveModule('lineups');
                    }}
                    onShareLineup={(l) => setSharingLineup(l)}
                    onPlayVideo={playVideo}
                    onOpenChords={openChords}
                  />
                )}
              </>
            ) : (
              <div className="bg-[#1F1F21] rounded-3xl p-8 border border-[#35312B] shadow-soft flex flex-col justify-center items-center text-center py-14">
                <div className="w-14 h-14 rounded-2xl bg-[#161616] border border-[#35312B] text-[#D9A441] flex items-center justify-center mb-3 shadow-2xs">
                  <Calendar className="w-7 h-7 text-[#D9A441]" />
                </div>
                <h3 className="text-base font-bold text-[#F5F0E6]">No Upcoming Service Lineup Scheduled</h3>
                <p className="text-xs text-[#AAA5A0] mt-1 max-w-sm">
                  Create and publish a worship service lineup. The system will automatically detect the nearest date and time, show its live countdown, and manage rotation.
                </p>
                <button
                  onClick={handleCreateLineup}
                  className="mt-5 py-3 px-5 rounded-2xl bg-[#D9A441] hover:bg-[#F5C15D] text-[#101010] text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-[#101010]" />
                  <span>Create Service Lineup</span>
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Services Section (3rd service onwards) */}
          {remainingUpcomingLineups.length > 0 && (
            <UpcomingServicesList
              lineups={remainingUpcomingLineups}
              songs={songs}
              onSelectLineup={(id) => {
                setActiveLineupId(id);
                setActiveModule('lineups');
              }}
              onCreateLineup={handleCreateLineup}
            />
          )}

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
          <div className="bg-[#1F1F21] rounded-3xl p-5 border border-[#35312B] shadow-soft">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#35312B]">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#D9A441]" />
                <h3 className="text-sm font-bold text-[#F5F0E6]">Team Announcements</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddingAnnouncement(true)}
                  className="flex items-center gap-1 text-xs font-bold text-[#D9A441] hover:text-[#F5C15D] bg-[#262626] hover:bg-[#2f2f2f] px-2.5 py-1 rounded-xl border border-[#35312B] transition-colors cursor-pointer"
                  title="Add Announcement"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D9A441]" />
                  <span>Add</span>
                </button>
                <button
                  onClick={() => setActiveModule('announcements')}
                  className="text-xs font-semibold text-[#AAA5A0] hover:text-[#F5F0E6] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="mt-3.5 space-y-3">
              {publishedAnnouncements.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#AAA5A0]">
                  <p className="font-semibold text-[#F5F0E6]">No announcements yet.</p>
                  <p className="text-[11px] text-[#AAA5A0] mt-0.5">
                    Click "Add" above to create an announcement for the worship team.
                  </p>
                </div>
              ) : (
                publishedAnnouncements.slice(0, 3).map((ann) => (
                  <div
                    key={ann.id}
                    onClick={() => setActiveModule('announcements')}
                    className="p-3 rounded-2xl bg-[#161616] hover:bg-[#262626] border border-[#35312B] transition-colors cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#F5F0E6] truncate flex-1">
                        {ann.title}
                      </h4>
                      {ann.is_important && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-[#E57373]/20 text-[#E57373] border border-[#E57373]/40 shrink-0">
                          Important
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#AAA5A0] line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#AAA5A0]/80 pt-0.5">
                      <span>By {ann.author_name}</span>
                      <span>{new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Events Card */}
          <div className="bg-[#1F1F21] rounded-3xl p-5 border border-[#35312B] shadow-soft">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#35312B]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D9A441]" />
                <h3 className="text-sm font-bold text-[#F5F0E6]">Upcoming Events</h3>
              </div>
              <button
                onClick={() => setActiveModule('rehearsals')}
                className="text-xs font-semibold text-[#AAA5A0] hover:text-[#F5F0E6] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3.5 space-y-3">
              {rehearsals.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#AAA5A0]">
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
                      className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-[#262626] transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#161616] border border-[#35312B] flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-[#D9A441] tracking-wider">
                          {monthStr}
                        </span>
                        <span className="text-base font-extrabold text-[#F5F0E6] leading-none">
                          {dayNum}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#F5F0E6] truncate">
                          {event.title}
                        </h4>
                        <p className="text-[11px] text-[#AAA5A0] mt-0.5 truncate">
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
          <div className="bg-[#1F1F21] rounded-3xl p-5 border border-[#35312B] shadow-soft">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#35312B]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D9A441]" />
                <h3 className="text-sm font-bold text-[#F5F0E6]">Recent Activity</h3>
              </div>
              <button
                onClick={() => setActiveModule('announcements')}
                className="text-xs font-semibold text-[#AAA5A0] hover:text-[#F5F0E6] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3.5 space-y-3">
              {activities.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#AAA5A0]">
                  No recent activities yet.
                </div>
              ) : (
                activities.slice(0, 3).map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#161616] border border-[#35312B] text-[#D9A441] flex items-center justify-center text-xs font-bold shrink-0">
                      {act.user_avatar && act.user_avatar.length <= 3
                        ? act.user_avatar
                        : act.user_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#F5F0E6] leading-tight">
                        <span className="font-semibold text-[#F5F0E6]">{act.action}</span>
                      </p>
                      <span className="text-[10px] text-[#AAA5A0] mt-0.5 block">
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
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#1F1F21] border border-[#35312B] hover:border-[#D9A441]/40 hover:bg-[#262626] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-[#F5F0E6] group cursor-pointer"
        >
          <Music2 className="w-5 h-5 mb-2 text-[#D9A441] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Song Library</span>
        </button>

        <button
          onClick={handleCreateLineup}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#1F1F21] border border-[#35312B] hover:border-[#D9A441]/40 hover:bg-[#262626] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-[#F5F0E6] group cursor-pointer"
        >
          <CalendarPlus className="w-5 h-5 mb-2 text-[#D9A441] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Create Lineup</span>
        </button>

        <button
          onClick={() => setActiveModule('rehearsals')}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#1F1F21] border border-[#35312B] hover:border-[#D9A441]/40 hover:bg-[#262626] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-[#F5F0E6] group cursor-pointer"
        >
          <Calendar className="w-5 h-5 mb-2 text-[#D9A441] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Manage Rehearsal</span>
        </button>

        <button
          onClick={() => setActiveModule('vocalists')}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#1F1F21] border border-[#35312B] hover:border-[#D9A441]/40 hover:bg-[#262626] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-[#F5F0E6] group cursor-pointer"
        >
          <Users className="w-5 h-5 mb-2 text-[#D9A441] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Team Directory</span>
        </button>

        <button
          onClick={() => setActiveModule('tasks')}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#1F1F21] border border-[#35312B] hover:border-[#D9A441]/40 hover:bg-[#262626] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-[#F5F0E6] group cursor-pointer"
        >
          <CheckSquare className="w-5 h-5 mb-2 text-[#D9A441] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Tasks & Duties</span>
        </button>

        <button
          onClick={() => setActiveModule('announcements')}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#1F1F21] border border-[#35312B] hover:border-[#D9A441]/40 hover:bg-[#262626] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-[#F5F0E6] group cursor-pointer"
        >
          <FileText className="w-5 h-5 mb-2 text-[#D9A441] group-hover:scale-110 transition-transform" />
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
