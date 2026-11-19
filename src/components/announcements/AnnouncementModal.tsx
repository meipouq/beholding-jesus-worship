import React, { useState } from 'react';
import { X, Megaphone, Pin, AlertCircle, Calendar, Clock } from 'lucide-react';
import { Announcement } from '../../types';
import { useWorship } from '../../context/WorshipContext';
import { formatDisplayTime, isValidTime } from '../../utils/timeFormat';

interface AnnouncementModalProps {
  announcement: Announcement | null;
  onClose: () => void;
  onSave: (ann: Announcement) => void;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  announcement,
  onClose,
  onSave
}) => {
  const { currentUser } = useWorship();

  const [title, setTitle] = useState(announcement?.title || '');
  const [content, setContent] = useState(announcement?.content || '');
  const [eventDate, setEventDate] = useState(announcement?.event_date || '');
  const [eventTime, setEventTime] = useState(announcement?.event_time || '');
  const [timeError, setTimeError] = useState<string | null>(null);
  const [status, setStatus] = useState<'published' | 'draft'>(announcement?.status || 'published');
  const [isPinned, setIsPinned] = useState(announcement?.is_pinned || false);
  const [isImportant, setIsImportant] = useState(announcement?.is_important || false);

  const handleTimeBlur = () => {
    if (!eventTime.trim()) {
      setTimeError(null);
      return;
    }
    const formatted = formatDisplayTime(eventTime);
    if (formatted) {
      setEventTime(formatted);
      setTimeError(null);
    } else {
      setTimeError('Invalid time (e.g. 8:00 AM, 1:00 PM, or 14:00)');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    let formattedTime: string | undefined = undefined;
    if (eventTime.trim()) {
      const parsed = formatDisplayTime(eventTime);
      if (!parsed) {
        setTimeError('Invalid time (e.g. 8:00 AM, 1:00 PM, or 14:00)');
        return;
      }
      formattedTime = parsed;
    }

    const saved: Announcement = {
      id: announcement?.id || `ann-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      event_date: eventDate || undefined,
      event_time: formattedTime,
      status,
      author_id: announcement?.author_id || currentUser.id,
      author_name: announcement?.author_name || currentUser.name,
      author_avatar: announcement?.author_avatar || currentUser.avatar,
      is_pinned: isPinned,
      is_important: isImportant,
      created_at: announcement?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onSave(saved);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#211C17] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-[#393027] animate-slide-up max-h-[92vh] overflow-y-auto text-[#FFF5E6]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-[#393027]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#181510] border border-[#393027] text-[#E5AF45] flex items-center justify-center shadow-sm">
              <Megaphone className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#FFF5E6] leading-tight">
                {announcement ? 'Edit Announcement' : 'Create New Announcement'}
              </h2>
              <p className="text-[11px] text-[#B8ADA0] font-medium">
                Author: {currentUser.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Title */}
          <div>
            <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
              Announcement Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunday Lineup Finalized & Call Time"
              className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none focus:border-[#E5AF45] font-semibold"
            />
          </div>

          {/* Content / Description */}
          <div>
            <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
              Message Description *
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full announcement details for the worship ministry..."
              className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none focus:border-[#E5AF45] leading-relaxed"
            />
          </div>

          {/* Date & Time (Optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#E5AF45]" />
                <span>Event Date</span>
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:outline-none focus:border-[#E5AF45] font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#E5AF45]" />
                <span>Event Time</span>
              </label>
              <input
                type="text"
                value={eventTime}
                onChange={(e) => {
                  setEventTime(e.target.value);
                  if (timeError) setTimeError(null);
                }}
                onBlur={handleTimeBlur}
                placeholder="e.g. 8:00 AM"
                className={`w-full text-xs p-2.5 rounded-2xl border bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none font-medium transition-colors ${
                  timeError ? 'border-[#E57373] focus:border-[#E57373]' : 'border-[#393027] focus:border-[#E5AF45]'
                }`}
              />
              {timeError && (
                <p className="text-[10px] text-[#E57373] mt-1 font-semibold flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{timeError}</span>
                </p>
              )}
            </div>
          </div>

          {/* Publication Status Selector */}
          <div>
            <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1.5">
              Publication Status
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#181510] p-1 rounded-2xl border border-[#393027]">
              <button
                type="button"
                onClick={() => setStatus('published')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  status === 'published'
                    ? 'bg-[#29231C] text-[#79BB8B] border border-[#79BB8B]/30 shadow-sm'
                    : 'text-[#B8ADA0] hover:text-[#FFF5E6]'
                }`}
              >
                ● Published
              </button>
              <button
                type="button"
                onClick={() => setStatus('draft')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  status === 'draft'
                    ? 'bg-[#29231C] text-[#FFC85C] border border-amber-800/40 shadow-sm'
                    : 'text-[#B8ADA0] hover:text-[#FFF5E6]'
                }`}
              >
                Draft (Unpublished)
              </button>
            </div>
          </div>

          {/* Priority & Pin Options */}
          <div className="flex items-center gap-5 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#FFF5E6]">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded text-[#E5AF45] focus:ring-[#E5AF45] cursor-pointer"
              />
              <Pin className="w-3.5 h-3.5 text-[#E5AF45]" />
              <span>Pin to top</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#FFF5E6]">
              <input
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className="w-4 h-4 rounded text-[#E57373] focus:ring-[#E57373] cursor-pointer"
              />
              <AlertCircle className="w-3.5 h-3.5 text-[#E57373]" />
              <span>Important notice</span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#393027] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#E5AF45] hover:bg-[#FFC85C] text-[#100E0B] shadow-sm transition-all active:scale-95"
            >
              {announcement ? 'Save Changes' : status === 'published' ? 'Publish Announcement' : 'Save Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
