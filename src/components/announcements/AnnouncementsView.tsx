import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Pin,
  AlertCircle,
  Calendar,
  User,
  Edit2,
  Trash2
} from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import { Announcement } from '../../types';
import { AnnouncementModal } from './AnnouncementModal';

export const AnnouncementsView: React.FC = () => {
  const { announcements, saveAnnouncement, deleteAnnouncement } = useWorship();
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Sort pinned first, then by date
  const sorted = [...announcements].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-5 pb-20 md:pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-[#1E1D1B] text-white shadow-2xs">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
              Team Announcements
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Official updates, schedules, rehearsals, and important notices for the Worship Team
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold shadow-soft transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Announcements Stream */}
      <div className="space-y-4">
        {sorted.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#E8E2D7] shadow-soft text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F8F5EE] border border-stone-200 text-stone-400 flex items-center justify-center mb-4 shadow-inner">
              <Megaphone className="w-8 h-8 text-amber-900/70" />
            </div>
            <h3 className="text-base font-bold text-stone-900">No Announcements Yet</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md">
              Keep the team aligned! Post official updates, Sunday call times, rehearsal schedules, or important ministry guidelines here.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold shadow-soft transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Post First Announcement</span>
            </button>
          </div>
        ) : (
          sorted.map((ann) => (
          <div
            key={ann.id}
            className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-soft ${
              ann.is_pinned
                ? 'border-amber-300/80 bg-gradient-to-br from-white to-amber-50/20'
                : 'border-[#E8E2D7]'
            }`}
          >
            {/* Announcement Top Bar */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 flex-wrap">
                {ann.is_pinned && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                    <Pin className="w-3 h-3" />
                    <span>PINNED</span>
                  </span>
                )}
                {ann.is_important && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold border border-red-200">
                    <AlertCircle className="w-3 h-3" />
                    <span>IMPORTANT</span>
                  </span>
                )}
                <span className="text-xs text-stone-400 font-medium">
                  {new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingAnn(ann)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete announcement "${ann.title}"?`)) {
                      deleteAnnouncement(ann.id);
                    }
                  }}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Announcement Title & Content */}
            <div className="pt-3">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                {ann.title}
              </h2>
              <div className="mt-3 text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-wrap font-sans">
                {ann.content}
              </div>
            </div>

            {/* Author Footer */}
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#1E1D1B] text-white flex items-center justify-center font-bold text-[10px]">
                  {ann.author_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <span>Posted by <strong className="text-stone-800">{ann.author_name}</strong></span>
              </div>
              <span className="text-[11px] text-stone-400">
                Beholding Jesus Worship Team Notice
              </span>
            </div>
          </div>
        )))}
      </div>

      {(isAdding || editingAnn) && (
        <AnnouncementModal
          announcement={editingAnn}
          onClose={() => {
            setIsAdding(false);
            setEditingAnn(null);
          }}
          onSave={(saved) => {
            saveAnnouncement(saved);
            setIsAdding(false);
            setEditingAnn(null);
          }}
        />
      )}
    </div>
  );
};
