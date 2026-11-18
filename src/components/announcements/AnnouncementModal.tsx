import React, { useState } from 'react';
import { X, Megaphone, Pin, AlertCircle, Calendar, Clock } from 'lucide-react';
import { Announcement } from '../../types';
import { useWorship } from '../../context/WorshipContext';

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
  const [status, setStatus] = useState<'published' | 'draft'>(announcement?.status || 'published');
  const [isPinned, setIsPinned] = useState(announcement?.is_pinned || false);
  const [isImportant, setIsImportant] = useState(announcement?.is_important || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const saved: Announcement = {
      id: announcement?.id || `ann-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      event_date: eventDate || undefined,
      event_time: eventTime || undefined,
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
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-modal border border-stone-200 animate-slide-up max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#1E1D1B] text-white flex items-center justify-center shadow-2xs">
              <Megaphone className="w-4.5 h-4.5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                {announcement ? 'Edit Announcement' : 'Create New Announcement'}
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                Author: {currentUser.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Title */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Announcement Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunday Lineup Finalized & Call Time"
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 bg-[#FAF6F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 font-semibold"
            />
          </div>

          {/* Content / Description */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Message Description *
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full announcement details for the worship ministry..."
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 bg-[#FAF6F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 leading-relaxed"
            />
          </div>

          {/* Date & Time (Optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Event Date</span>
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-2xl border border-stone-300 bg-[#FAF6F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>Event Time</span>
              </label>
              <input
                type="text"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                placeholder="e.g. 8:00 AM"
                className="w-full text-xs p-2.5 rounded-2xl border border-stone-300 bg-[#FAF6F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 font-medium"
              />
            </div>
          </div>

          {/* Publication Status Selector */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
              Publication Status
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#F0E9DC] p-1 rounded-2xl border border-[#E4DCD0]">
              <button
                type="button"
                onClick={() => setStatus('published')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  status === 'published'
                    ? 'bg-white text-emerald-800 shadow-soft'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                ● Published
              </button>
              <button
                type="button"
                onClick={() => setStatus('draft')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  status === 'draft'
                    ? 'bg-white text-amber-900 shadow-soft'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Draft (Unpublished)
              </button>
            </div>
          </div>

          {/* Priority & Pin Options */}
          <div className="flex items-center gap-5 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded text-amber-800 focus:ring-amber-500 cursor-pointer"
              />
              <Pin className="w-3.5 h-3.5 text-amber-800" />
              <span>Pin to top</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
              <input
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
              />
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Important notice</span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#1E1D1B] hover:bg-stone-800 text-white shadow-soft transition-all active:scale-95"
            >
              {announcement ? 'Save Changes' : status === 'published' ? 'Publish Announcement' : 'Save Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
