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
          <div className="p-2.5 rounded-2xl bg-[#1E1D1B] text-white shadow-2xs">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
              Rehearsals & Schedules
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Coordinate sound checks, rehearsals, service dates, and team RSVP attendance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-white p-1 rounded-2xl border border-stone-200/90 shadow-soft">
            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'agenda' ? 'bg-[#1E1D1B] text-white shadow-2xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'month' ? 'bg-[#1E1D1B] text-white shadow-2xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold shadow-soft transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Event</span>
          </button>
        </div>
      </div>

      {viewMode === 'agenda' ? (
        /* AGENDA LIST VIEW */
        sortedRehearsals.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-[#E8E2D7] shadow-soft flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-[#F8F5EE] border border-stone-200 text-stone-400 flex items-center justify-center mb-4 shadow-inner">
              <CalendarIcon className="w-8 h-8 text-amber-900/70" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900">No Rehearsals or Services Scheduled</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md">
              Schedule your worship team practices, weekend sound checks, Sunday services, or fellowship meetings with attendance RSVP tracking.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold shadow-soft transition-all"
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
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D7] shadow-soft hover:shadow-card transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left: Date badge + Event Details */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Calendar Date Block */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F8F5EE] border border-stone-200 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] sm:text-[11px] font-bold text-amber-900 tracking-wider">
                      {monthStr}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-stone-900 leading-none">
                      {dayNum}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#EFE8DC] text-stone-800 text-[10px] font-bold uppercase tracking-wider">
                        {reh.type}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        {new Date(reh.date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                      {reh.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-stone-500 flex-wrap pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{reh.start_time} – {reh.end_time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{reh.venue}</span>
                      </div>
                    </div>

                    {reh.prep_notes && (
                      <p className="text-[11px] text-stone-600 mt-2 bg-[#FAF6F0] p-2.5 rounded-xl border border-stone-200/70 italic leading-relaxed">
                        "{reh.prep_notes}"
                      </p>
                    )}

                    {/* Participants & Attendance Summary */}
                    <div className="pt-2 flex items-center gap-3 text-xs text-stone-500 flex-wrap">
                      <span className="font-semibold text-stone-700">Attendance:</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {goingCount} Going
                      </span>
                      {maybeCount > 0 && (
                        <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {maybeCount} Maybe
                        </span>
                      )}
                      {cantGoCount > 0 && (
                        <span className="text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                          {cantGoCount} Can't Go
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Personal RSVP Controls & Management */}
                <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                  {/* My RSVP Pill Buttons */}
                  <div className="w-full sm:w-auto">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1 text-left sm:text-right">
                      Your RSVP:
                    </span>
                    <div className="flex items-center gap-1.5 bg-[#F8F5EE] p-1 rounded-2xl border border-stone-200">
                      <button
                        onClick={() => updateRsvp(reh.id, currentUser.id, 'going')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          myRsvp === 'going'
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'text-stone-600 hover:text-emerald-800'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Going</span>
                      </button>

                      <button
                        onClick={() => updateRsvp(reh.id, currentUser.id, 'maybe')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          myRsvp === 'maybe'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'text-stone-600 hover:text-amber-700'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Maybe</span>
                      </button>

                      <button
                        onClick={() => updateRsvp(reh.id, currentUser.id, 'cant_go')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          myRsvp === 'cant_go'
                            ? 'bg-red-600 text-white shadow-2xs'
                            : 'text-stone-600 hover:text-red-700'
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
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Setlist</span>
                      </button>
                    )}

                    <button
                      onClick={() => setEditingRehearsal(reh)}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100"
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
                      className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50"
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
        <div className="bg-white rounded-3xl p-6 border border-[#E8E2D7] shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <h2 className="text-base font-bold text-stone-900">
              {monthName} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="font-bold text-stone-400 uppercase tracking-wider py-1">
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
                      ? 'bg-[#FAF6F0]/60 border-stone-200/80 hover:bg-[#FAF6F0]'
                      : 'bg-stone-50/30 border-transparent opacity-25'
                  }`}
                >
                  <span className={`text-xs font-bold ${isValidDay ? 'text-stone-800' : 'text-stone-300'}`}>
                    {isValidDay ? day : ''}
                  </span>

                  {dayEvents.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => setEditingRehearsal(ev)}
                      className="p-1 rounded-lg bg-[#1E1D1B] text-white text-[10px] font-bold truncate mt-1 cursor-pointer shadow-2xs"
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
