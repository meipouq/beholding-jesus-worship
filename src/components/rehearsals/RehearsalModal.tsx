import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Rehearsal, TeamMember } from '../../types';
import { useWorship } from '../../context/WorshipContext';

interface RehearsalModalProps {
  rehearsal: Rehearsal | null;
  onClose: () => void;
  onSave: (reh: Rehearsal) => void;
}

export const RehearsalModal: React.FC<RehearsalModalProps> = ({
  rehearsal,
  onClose,
  onSave
}) => {
  const { members, currentUser, lineups } = useWorship();

  const [title, setTitle] = useState(rehearsal?.title || 'Worship Rehearsal');
  const [type, setType] = useState<Rehearsal['type']>(rehearsal?.type || 'Worship Rehearsal');
  const [date, setDate] = useState(rehearsal?.date || new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState(rehearsal?.start_time || '4:00 PM');
  const [endTime, setEndTime] = useState(rehearsal?.end_time || '6:00 PM');
  const [venue, setVenue] = useState(rehearsal?.venue || 'Main Sanctuary');
  const [prepNotes, setPrepNotes] = useState(rehearsal?.prep_notes || '');
  const [lineupId, setLineupId] = useState(rehearsal?.lineup_id || '');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    rehearsal?.participants?.map(p => p.member_id) || members.map(m => m.id)
  );

  const toggleParticipant = (id: string) => {
    if (selectedParticipants.includes(id)) {
      setSelectedParticipants(selectedParticipants.filter(pId => pId !== id));
    } else {
      setSelectedParticipants([...selectedParticipants, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const participants = members
      .filter(m => selectedParticipants.includes(m.id))
      .map(m => {
        const existing = rehearsal?.participants?.find(p => p.member_id === m.id);
        return {
          member_id: m.id,
          member_name: m.name,
          rsvp: existing ? existing.rsvp : ('pending' as const)
        };
      });

    const saved: Rehearsal = {
      id: rehearsal?.id || `reh-${Date.now()}`,
      title: title.trim(),
      type,
      date,
      start_time: startTime,
      end_time: endTime,
      venue: venue.trim(),
      prep_notes: prepNotes.trim(),
      lineup_id: lineupId || undefined,
      participants,
      created_by: rehearsal?.created_by || currentUser.name,
      created_at: rehearsal?.created_at || new Date().toISOString()
    };

    onSave(saved);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#211C17] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#393027] animate-slide-up max-h-[90vh] overflow-y-auto text-[#FFF5E6]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#393027]">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#E5AF45]" />
            <h2 className="text-base font-bold text-[#FFF5E6]">
              {rehearsal ? 'Edit Schedule / Rehearsal' : 'Schedule Rehearsal or Service'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Worship Rehearsal"
                className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:outline-none focus:border-[#E5AF45] font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Event Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:outline-none focus:border-[#E5AF45] font-medium"
              >
                <option value="Worship Rehearsal" className="bg-[#211C17] text-[#FFF5E6]">Worship Rehearsal</option>
                <option value="Sunday Service" className="bg-[#211C17] text-[#FFF5E6]">Sunday Service</option>
                <option value="Soundcheck" className="bg-[#211C17] text-[#FFF5E6]">Soundcheck</option>
                <option value="Team Meeting" className="bg-[#211C17] text-[#FFF5E6]">Team Meeting</option>
                <option value="Special Event" className="bg-[#211C17] text-[#FFF5E6]">Special Event</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:outline-none focus:border-[#E5AF45] font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="4:00 PM"
                className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none focus:border-[#E5AF45]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                End Time
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="6:00 PM"
                className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none focus:border-[#E5AF45]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
              Venue / Location
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Main Sanctuary"
              className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none focus:border-[#E5AF45]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
              Link to Service Lineup (Optional)
            </label>
            <select
              value={lineupId}
              onChange={(e) => setLineupId(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:outline-none focus:border-[#E5AF45]"
            >
              <option value="" className="bg-[#211C17] text-[#B8ADA0]">None / General Rehearsal</option>
              {lineups.map(l => (
                <option key={l.id} value={l.id} className="bg-[#211C17] text-[#FFF5E6]">
                  {l.title} ({l.service_date})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1.5">
              Assigned Team Participants
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {members.map(m => {
                const isSelected = selectedParticipants.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleParticipant(m.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#E5AF45] text-[#100E0B] shadow-sm'
                        : 'bg-[#181510] text-[#B8ADA0] border border-[#393027] hover:bg-[#29231C] hover:text-[#FFF5E6]'
                    }`}
                  >
                    {m.name.split(' ')[0]} ({m.vocal_range})
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
              Preparation Notes / What to Bring
            </label>
            <textarea
              rows={3}
              value={prepNotes}
              onChange={(e) => setPrepNotes(e.target.value)}
              placeholder="e.g. Bring in-ear earphones, review chords for song 2 & 3"
              className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none focus:border-[#E5AF45]"
            />
          </div>

          <div className="pt-3 border-t border-[#393027] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#E5AF45] hover:bg-[#FFC85C] text-[#100E0B] transition-colors shadow-sm"
            >
              {rehearsal ? 'Save Changes' : 'Schedule Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
