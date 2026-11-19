import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Pin,
  AlertCircle,
  Calendar,
  Clock,
  User,
  Edit2,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import { Announcement } from '../../types';
import { AnnouncementModal } from './AnnouncementModal';

export const AnnouncementsView: React.FC = () => {
  const {
    announcements,
    saveAnnouncement,
    deleteAnnouncement,
    publishAnnouncement,
    unpublishAnnouncement
  } = useWorship();

  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [tabFilter, setTabFilter] = useState<'published' | 'draft' | 'all'>('published');

  // Filter based on tab
  const filtered = announcements.filter((ann) => {
    const isPub = !ann.status || ann.status === 'published';
    if (tabFilter === 'published') return isPub;
    if (tabFilter === 'draft') return ann.status === 'draft';
    return true;
  });

  // Sort pinned first, then by date descending
  const sorted = [...filtered].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const publishedCount = announcements.filter(a => !a.status || a.status === 'published').length;
  const draftCount = announcements.filter(a => a.status === 'draft').length;

  return (
    <div className="space-y-5 pb-20 md:pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#181510] border border-[#393027] text-[#E5AF45] flex items-center justify-center shadow-sm shrink-0">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#FFF5E6] leading-tight">
              Team Announcements
            </h1>
            <p className="text-xs text-[#B8ADA0] mt-0.5">
              Official ministry updates, schedules, and important notices for the Worship Team
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#E5AF45] to-[#D69F35] hover:from-[#FFC85C] hover:to-[#E5AF45] text-[#100E0B] text-xs font-black shadow-[0_4px_16px_rgba(229,175,69,0.25)] hover:shadow-[0_6px_22px_rgba(229,175,69,0.38)] transition-all self-start sm:self-auto active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#100E0B] stroke-[2.5]" />
          <span>Add Announcement</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setTabFilter('published')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            tabFilter === 'published'
              ? 'bg-[#E5AF45] text-[#100E0B] shadow-sm'
              : 'bg-[#181510] text-[#B8ADA0] border border-[#393027] hover:bg-[#29231C] hover:text-[#FFF5E6]'
          }`}
        >
          Published ({publishedCount})
        </button>
        <button
          onClick={() => setTabFilter('draft')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            tabFilter === 'draft'
              ? 'bg-[#E5AF45] text-[#100E0B] shadow-sm'
              : 'bg-[#181510] text-[#B8ADA0] border border-[#393027] hover:bg-[#29231C] hover:text-[#FFF5E6]'
          }`}
        >
          Drafts ({draftCount})
        </button>
        <button
          onClick={() => setTabFilter('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            tabFilter === 'all'
              ? 'bg-[#E5AF45] text-[#100E0B] shadow-sm'
              : 'bg-[#181510] text-[#B8ADA0] border border-[#393027] hover:bg-[#29231C] hover:text-[#FFF5E6]'
          }`}
        >
          All ({announcements.length})
        </button>
      </div>

      {/* Announcements Stream */}
      <div className="space-y-4">
        {sorted.length === 0 ? (
          <div className="bg-[#211C17] rounded-3xl p-10 sm:p-14 border border-[#393027] shadow-sm text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#181510] border border-[#393027] text-[#E5AF45] flex items-center justify-center mb-4 shadow-inner">
              <Megaphone className="w-8 h-8 text-[#E5AF45]" />
            </div>
            <h3 className="text-base font-bold text-[#FFF5E6]">No announcements yet.</h3>
            <p className="text-xs text-[#B8ADA0] mt-1 max-w-md">
              Keep the worship team aligned! Post official updates, call times, rehearsal schedules, or ministry guidelines.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#E5AF45] hover:bg-[#FFC85C] text-[#100E0B] text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#100E0B]" />
              <span>Add Announcement</span>
            </button>
          </div>
        ) : (
          sorted.map((ann) => {
            const isDraft = ann.status === 'draft';

            return (
              <div
                key={ann.id}
                className={`bg-[#211C17] rounded-3xl p-5 sm:p-6 border transition-all shadow-sm space-y-3.5 ${
                  ann.is_pinned
                    ? 'border-[#E5AF45]/50 bg-gradient-to-br from-[#211C17] to-[#29231C]'
                    : isDraft
                    ? 'border-dashed border-amber-600/40 bg-[#181510]'
                    : 'border-[#393027] hover:border-[#E5AF45]/50'
                }`}
              >
                {/* Top Row: Badges, Date, Actions */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#393027] flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isDraft ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-950/40 text-[#FFC85C] text-[10px] font-extrabold border border-amber-800/40 uppercase tracking-wider">
                        DRAFT (UNPUBLISHED)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/40 text-[#79BB8B] text-[10px] font-extrabold border border-[#79BB8B]/30 uppercase tracking-wider">
                        PUBLISHED
                      </span>
                    )}

                    {ann.is_pinned && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/40 text-[#FFC85C] text-[10px] font-bold border border-amber-800/40">
                        <Pin className="w-3 h-3" />
                        <span>PINNED</span>
                      </span>
                    )}

                    {ann.is_important && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-950/40 text-[#E57373] text-[10px] font-bold border border-[#E57373]/30">
                        <AlertCircle className="w-3 h-3" />
                        <span>IMPORTANT</span>
                      </span>
                    )}

                    <span className="text-xs text-[#B8ADA0] font-medium">
                      Posted: {new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Actions: Publish / Unpublish, Edit, Delete */}
                  <div className="flex items-center gap-1.5">
                    {isDraft ? (
                      <button
                        onClick={() => publishAnnouncement(ann.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-[#79BB8B] border border-[#79BB8B]/30 text-xs font-bold transition-colors cursor-pointer"
                        title="Publish this announcement"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#79BB8B]" />
                        <span>Publish</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => unpublishAnnouncement(ann.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#29231C] hover:bg-[#393027] text-[#B8ADA0] hover:text-[#FFF5E6] border border-[#393027] text-xs font-bold transition-colors cursor-pointer"
                        title="Unpublish to draft"
                      >
                        <EyeOff className="w-3.5 h-3.5 text-[#B8ADA0]" />
                        <span>Unpublish</span>
                      </button>
                    )}

                    <button
                      onClick={() => setEditingAnn(ann)}
                      className="p-1.5 rounded-xl text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C] transition-colors cursor-pointer"
                      title="Edit Announcement"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete announcement "${ann.title}"?`)) {
                          deleteAnnouncement(ann.id);
                        }
                      }}
                      className="p-1.5 rounded-xl text-[#B8ADA0] hover:text-[#E57373] hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Announcement Title & Description */}
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#FFF5E6] leading-snug">
                    {ann.title}
                  </h2>
                  <div className="mt-2.5 text-xs sm:text-sm text-[#B8ADA0] leading-relaxed whitespace-pre-wrap font-sans">
                    {ann.content}
                  </div>
                </div>

                {/* Event Schedule Details (if provided) */}
                {(ann.event_date || ann.event_time) && (
                  <div className="p-3 rounded-2xl bg-[#181510] border border-[#393027] flex items-center gap-3 text-xs text-[#FFF5E6] font-medium">
                    {ann.event_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#E5AF45]" />
                        <span>{ann.event_date}</span>
                      </div>
                    )}
                    {ann.event_time && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#E5AF45]" />
                        <span>{ann.event_time}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Author Footer */}
                <div className="pt-3 border-t border-[#393027] flex items-center justify-between text-xs text-[#B8ADA0] flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#100E0B] text-[#E5AF45] border border-[#E5AF45]/40 flex items-center justify-center font-bold text-[10px]">
                      {ann.author_name ? ann.author_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'BJ'}
                    </div>
                    <span>Created by <strong className="text-[#FFF5E6]">{ann.author_name || 'Ministry Leader'}</strong></span>
                  </div>
                  <span className="text-[11px] text-[#B8ADA0]/60">
                    Beholding Jesus Worship Team
                  </span>
                </div>
              </div>
            );
          })
        )}
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
