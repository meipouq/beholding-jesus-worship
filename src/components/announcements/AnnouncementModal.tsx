import React, { useState } from 'react';
import { X, Megaphone, Pin, AlertCircle } from 'lucide-react';
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
  const [isPinned, setIsPinned] = useState(announcement?.is_pinned || false);
  const [isImportant, setIsImportant] = useState(announcement?.is_important || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const saved: Announcement = {
      id: announcement?.id || `ann-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      author_id: announcement?.author_id || currentUser.id,
      author_name: announcement?.author_name || currentUser.name,
      author_avatar: announcement?.author_avatar || currentUser.avatar,
      is_pinned: isPinned,
      is_important: isImportant,
      created_at: announcement?.created_at || new Date().toISOString()
    };

    onSave(saved);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-modal border border-stone-200 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-800" />
            <h2 className="text-base font-bold text-stone-900">
              {announcement ? 'Edit Announcement' : 'Publish Announcement'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
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
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 font-semibold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Message Content *
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full announcement details for the worship team..."
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div className="flex items-center gap-5 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded text-amber-800 focus:ring-amber-500"
              />
              <Pin className="w-3.5 h-3.5 text-amber-800" />
              <span>Pin to top of board</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
              <input
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Mark as High Priority</span>
            </label>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#1E1D1B] hover:bg-stone-800 text-white transition-colors"
            >
              {announcement ? 'Save Changes' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
