import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  CheckCircle,
  HelpCircle,
  XCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  List,
  CalendarDays,
  FileText,
  Edit2,
  Trash2
} from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import { Rehearsal } from '../../types';
import { RehearsalModal } from './RehearsalModal';

export const RehearsalsView: React.FC = () => {
  const {
    rehearsals,
    saveRehearsal,
    deleteRehearsal,
    updateRsvp,
    currentUser,
    setActiveLineupId,
    setActiveModule
  } = useWorship();

  const [viewMode, setViewMode] = useState<'agenda' | 'month'>('agenda');
  const [editingRehearsal, setEditingRehearsal] = useState<Rehearsal | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Month navigation
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // Nov 2025

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Sorted rehearsals
  const sortedRehearsals = [...rehearsals].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-5 pb-20 md:pb-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-[#181510] border border-[#393027] text-[#E5AF45] shadow-sm">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#FFF5E6] leading-tight">
              Rehearsals & Schedules
            </h1>
            <p className="text-xs text-[#B8ADA0] mt-0.5">
              Coordinate sound checks, rehearsals, service dates, and team RSVP attendance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-[#181510] p-1 rounded-2xl border border-[#393027] shadow-sm">
            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'agenda' ? 'bg-[#E5AF45] text-[#100E0B] shadow-sm' : 'text-[#B8ADA0] hover:text-[#FFF5E6]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'month' ? 'bg-[#E5AF45] text-[#100E0B] shadow-sm' : 'text-[#B8ADA0] hover:text-[#FFF5E6]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#E5AF45] to-[#D69F35] hover:from-[#FFC85C] hover:to-[#E5AF45] text-[#100E0B] text-xs font-black shadow-[0_4px_16px_rgba(229,175,69,0.25)] hover:shadow-[0_6px_22px_rgba(229,175,69,0.38)] transition-all shrink-0 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Event</span>
          </button>
        </div>
      </div>

      {viewMode === 'agenda' ? (
        /* AGENDA LIST VIEW */
        sortedRehearsals.length === 0 ? (
          <div className="bg-[#211C17] rounded-3xl p-12 sm:p-16 text-center border border-[#393027] shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-[#181510] border border-[#393027] text-[#E5AF45] flex items-center justify-center mb-4 shadow-inner">
              <CalendarIcon className="w-8 h-8 text-[#E5AF45]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#FFF5E6]">No Rehearsals or Services Scheduled</h3>
            <p className="text-xs text-[#B8ADA0] mt-1 max-w-md">
              Schedule your worship team practices, weekend sound checks, Sunday services, or fellowship meetings with attendance RSVP tracking.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#E5AF45] hover:bg-[#FFC85C] text-[#100E0B] text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule First Event</span>
            </button>
          </div>
        ) : (
        <div className="space-y-4">
          {sortedRehearsals.map((reh) => {
            const dateObj = new Date(reh.date);
            const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
            const dayNum = reh.date.split('-')[2] || dateObj.getDate();
            const myRsvp = reh.participants?.find(p => p.member_id === currentUser.id)?.rsvp || 'pending';

            const goingCount = reh.participants?.filter(p => p.rsvp === 'going').length || 0;
            const maybeCount = reh.participants?.filter(p => p.rsvp === 'maybe').length || 0;
            const cantGoCount = reh.participants?.filter(p => p.rsvp === 'cant_go').length || 0;

            return (
              <div
                key={reh.id}
                className="bg-[#211C17] rounded-3xl p-5 sm:p-6 border border-[#393027] hover:border-[#E5AF45]/50 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left: Date badge + Event Details */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Calendar Date Block */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#181510] border border-[#393027] flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#E5AF45] tracking-wider">
                      {monthStr}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#FFF5E6] leading-none">
                      {dayNum}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#29231C] text-[#E5AF45] border border-[#393027] text-[10px] font-bold uppercase tracking-wider">
                        {reh.type}
                      </span>
                      <span className="text-xs text-[#B8ADA0] font-medium">
                        {new Date(reh.date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#FFF5E6] leading-snug">
                      {reh.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-[#B8ADA0] flex-wrap pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#E5AF45]" />
                        <span>{reh.start_time} – {reh.end_time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#E5AF45]" />
                        <span>{reh.venue}</span>
                      </div>
                    </div>

                    {reh.prep_notes && (
                      <p className="text-[11px] text-[#B8ADA0] mt-2 bg-[#181510] p-2.5 rounded-xl border border-[#393027] italic leading-relaxed">
                        "{reh.prep_notes}"
                      </p>
                    )}

                    {/* Participants & Attendance Summary */}
                    <div className="pt-2 flex items-center gap-3 text-xs text-[#B8ADA0] flex-wrap">
                      <span className="font-semibold text-[#FFF5E6]">Attendance:</span>
                      <span className="text-[#79BB8B] font-bold bg-emerald-950/40 px-2 py-0.5 rounded-md border border-[#79BB8B]/30">
                        {goingCount} Going
                      </span>
                      {maybeCount > 0 && (
                        <span className="text-[#FFC85C] font-semibold bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-800/40">
                          {maybeCount} Maybe
                        </span>
                      )}
                      {cantGoCount > 0 && (
                        <span className="text-[#E57373] font-semibold bg-red-950/40 px-2 py-0.5 rounded-md border border-[#E57373]/30">
                          {cantGoCount} Can't Go
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Personal RSVP Controls & Management */}
                <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#393027]">
                  {/* My RSVP Pill Buttons */}
                  <div className="w-full sm:w-auto">
                    <span className="text-[10px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1 text-left sm:text-right">
                      Your RSVP:
                    </span>
                    <div className="flex items-center gap-1.5 bg-[#181510] p-1 rounded-2xl border border-[#393027]">
                      <button
                        onClick={() => updateRsvp(reh.id, currentUser.id, 'going')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          myRsvp === 'going'
                            ? 'bg-[#79BB8B] text-[#100E0B] shadow-sm'
                            : 'text-[#B8ADA0] hover:text-[#79BB8B]'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Going</span>
                      </button>

                      <button
                        onClick={() => updateRsvp(reh.id, currentUser.id, 'maybe')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          myRsvp === 'maybe'
                            ? 'bg-[#FFC85C] text-[#100E0B] shadow-sm'
                            : 'text-[#B8ADA0] hover:text-[#FFC85C]'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Maybe</span>
                      </button>

                      <button
                        onClick={() => updateRsvp(reh.id, currentUser.id, 'cant_go')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          myRsvp === 'cant_go'
                            ? 'bg-[#E57373] text-[#100E0B] shadow-sm'
                            : 'text-[#B8ADA0] hover:text-[#E57373]'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Can't</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions & Lineup Link */}
                  <div className="flex items-center gap-2">
                    {reh.lineup_id && (
                      <button
                        onClick={() => {
                          setActiveLineupId(reh.lineup_id!);
                          setActiveModule('lineups');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#29231C] hover:bg-[#E5AF45] text-[#FFF5E6] hover:text-[#100E0B] text-xs font-bold border border-[#393027] transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Setlist</span>
                      </button>
                    )}

                    <button
                      onClick={() => setEditingRehearsal(reh)}
                      className="p-1.5 rounded-xl text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C]"
                      title="Edit Event"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete event "${reh.title}"?`)) {
                          deleteRehearsal(reh.id);
                        }
                      }}
                      className="p-1.5 rounded-xl text-[#B8ADA0] hover:text-[#E57373] hover:bg-red-950/30"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )
      ) : (
        /* MONTH CALENDAR VIEW */
        <div className="bg-[#211C17] rounded-3xl p-6 border border-[#393027] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-[#393027]">
            <h2 className="text-base font-bold text-[#FFF5E6]">
              {monthName} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-xl hover:bg-[#29231C] text-[#B8ADA0] hover:text-[#FFF5E6]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-xl hover:bg-[#29231C] text-[#B8ADA0] hover:text-[#FFF5E6]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="font-bold text-[#B8ADA0] uppercase tracking-wider py-1">
                {d}
              </div>
            ))}

            {Array.from({ length: 35 }).map((_, i) => {
              const day = i - 5; // offset for Nov 2025 (Nov 1 is Saturday)
              const isValidDay = day > 0 && day <= 30;
              const dateStr = `2025-11-${String(day).padStart(2, '0')}`;
              const dayEvents = rehearsals.filter(r => r.date === dateStr);

              return (
                <div
                  key={i}
                  className={`min-h-[85px] p-2 rounded-2xl border text-left flex flex-col justify-between transition-colors ${
                    isValidDay
                      ? 'bg-[#181510] border-[#393027] hover:border-[#E5AF45]/50'
                      : 'bg-[#100E0B]/30 border-transparent opacity-20'
                  }`}
                >
                  <span className={`text-xs font-bold ${isValidDay ? 'text-[#FFF5E6]' : 'text-[#B8ADA0]/30'}`}>
                    {isValidDay ? day : ''}
                  </span>

                  {dayEvents.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => setEditingRehearsal(ev)}
                      className="p-1 rounded-lg bg-[#100E0B] border border-[#E5AF45]/50 text-[#E5AF45] text-[10px] font-bold truncate mt-1 cursor-pointer shadow-sm"
                      title={`${ev.title} (${ev.start_time})`}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {(isAdding || editingRehearsal) && (
        <RehearsalModal
          rehearsal={editingRehearsal}
          onClose={() => {
            setIsAdding(false);
            setEditingRehearsal(null);
          }}
          onSave={(saved) => {
            saveRehearsal(saved);
            setIsAdding(false);
            setEditingRehearsal(null);
          }}
        />
      )}
    </div>
  );
};
