import React, { useState } from 'react';
import {
  ListMusic,
  Plus,
  Calendar,
  Clock,
  User,
  Copy,
  Printer,
  Edit2,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Share2
} from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import { ServiceLineup } from '../../types';
import { LineupBuilderView } from './LineupBuilderView';
import { LineupPrintModal } from './LineupPrintModal';
import { LineupShareModal } from './LineupShareModal';

export const LineupsListView: React.FC = () => {
  const {
    lineups,
    activeLineupId,
    setActiveLineupId,
    deleteLineup,
    duplicateLineup,
    currentUser
  } = useWorship();

  const [isBuilding, setIsBuilding] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'published' | 'draft'>('ALL');
  const [printingLineup, setPrintingLineup] = useState<ServiceLineup | null>(null);
  const [sharingLineup, setSharingLineup] = useState<ServiceLineup | null>(null);

  // If in builder mode, render LineupBuilderView
  if (isBuilding) {
    return (
      <LineupBuilderView
        lineupId={activeLineupId}
        onBack={() => setIsBuilding(false)}
      />
    );
  }

  const filteredLineups = lineups.filter(l => {
    if (selectedStatus === 'ALL') return true;
    return l.status === selectedStatus;
  });

  const handleCreateNew = () => {
    setActiveLineupId(null);
    setIsBuilding(true);
  };

  const handleEdit = (id: string) => {
    setActiveLineupId(id);
    setIsBuilding(true);
  };

  return (
    <div className="space-y-5 pb-20 md:pb-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#283827] text-white flex items-center justify-center shrink-0 shadow-soft">
            <ListMusic className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-stone-900 leading-tight">
              Service Lineups
            </h1>
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
              Plan, organize, and publish worship sets with vocal keys and YouTube references.
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#283827] hover:bg-[#1E2B1D] text-white text-xs font-bold shadow-soft transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Service Lineup</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedStatus('ALL')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
            selectedStatus === 'ALL'
              ? 'bg-[#283827] text-white shadow-soft'
              : 'bg-[#F3ECE1] text-stone-700 hover:bg-[#EBE2D4]'
          }`}
        >
          All Lineups ({lineups.length})
        </button>
        <button
          onClick={() => setSelectedStatus('published')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
            selectedStatus === 'published'
              ? 'bg-[#283827] text-white shadow-soft'
              : 'bg-[#F3ECE1] text-stone-700 hover:bg-[#EBE2D4]'
          }`}
        >
          Published ({lineups.filter(l => l.status === 'published').length})
        </button>
        <button
          onClick={() => setSelectedStatus('draft')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
            selectedStatus === 'draft'
              ? 'bg-[#283827] text-white shadow-soft'
              : 'bg-[#F3ECE1] text-stone-700 hover:bg-[#EBE2D4]'
          }`}
        >
          Drafts ({lineups.filter(l => l.status === 'draft').length})
        </button>
      </div>

      {/* Lineup Cards */}
      {filteredLineups.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-[#E8E2D7] shadow-soft flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-[#F8F5EE] border border-stone-200 text-stone-400 flex items-center justify-center mb-4 shadow-inner">
            <ListMusic className="w-8 h-8 text-[#283827]" />
          </div>
          <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">No Service Lineups Yet</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-md">
            Create and organize worship sets with songs, assigned vocalists, song categories, custom vocal keys, and YouTube references.
          </p>
          <button
            onClick={handleCreateNew}
            className="mt-5 flex items-center gap-2 px-6 py-3 rounded-full bg-[#283827] hover:bg-[#1E2B1D] text-white text-xs font-bold shadow-soft transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create First Lineup</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLineups.map((lineup) => (
          <div
            key={lineup.id}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EFE7DA] shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Top: Status, Songs Count & Quick Icons */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    lineup.status === 'published'
                      ? 'bg-[#D1FAE5] text-[#047857]'
                      : 'bg-[#FEF3C7] text-[#92400E]'
                  }`}>
                    {lineup.status}
                  </span>
                  <span className="text-xs text-[#8C827A] font-semibold">
                    {lineup.songs?.length || 0} Songs
                  </span>
                </div>

                {/* 4 Clean Action Icons matching design */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSharingLineup(lineup)}
                    className="p-1.5 rounded-lg text-[#8C7A6B] hover:text-[#283827] hover:bg-stone-100 transition-colors"
                    title="Share Lineup / Save as Photo"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPrintingLineup(lineup)}
                    className="p-1.5 rounded-lg text-[#8C7A6B] hover:text-[#283827] hover:bg-stone-100 transition-colors"
                    title="Print Setlist"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const dup = duplicateLineup(lineup.id);
                      alert(`Lineup duplicated as "${dup.title}"`);
                    }}
                    className="p-1.5 rounded-lg text-[#8C7A6B] hover:text-[#283827] hover:bg-stone-100 transition-colors"
                    title="Duplicate Lineup"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete lineup "${lineup.title}"?`)) {
                        deleteLineup(lineup.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-[#8C7A6B] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Lineup"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title in Serif Font */}
              <h3 className="text-xl sm:text-2xl font-serif text-stone-900 mt-2.5 leading-snug">
                {lineup.title}
              </h3>

              {/* Service Date & Time */}
              <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 mt-1.5">
                <Calendar className="w-4 h-4 text-[#8C7A6B]" />
                <span>{lineup.service_date} • {lineup.service_time}</span>
              </div>

              {/* Worship Leader & Author Row */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-stone-100/90">
                <div className="text-xs">
                  <span className="text-stone-400 font-medium">Worship Leader:</span>{' '}
                  <strong className="text-stone-900 font-bold">{lineup.worship_leader_name || 'TBD'}</strong>
                </div>
                {lineup.created_by && (
                  <span className="text-xs font-bold text-[#8A5828] px-3 py-0.5 rounded-full bg-[#FDF3E3] border border-[#FBE0B8]">
                    By {lineup.created_by.split(' ')[0]}
                  </span>
                )}
              </div>

              {/* Songs Preview as Soft Cream Pills */}
              <div className="mt-3 space-y-1.5">
                {lineup.songs?.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="flex items-center justify-between text-xs py-2 px-3.5 rounded-full bg-[#FAF6EF]"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="text-stone-400 font-medium text-xs w-3">{idx + 1}</span>
                      <span className="font-bold text-stone-900 truncate">{s.title}</span>
                    </div>
                    <span className="font-bold text-[#9A6B3A] shrink-0 text-xs">
                      Key {s.selected_key || s.original_key || 'G'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Button: Deep Forest Green Pill */}
            <div className="pt-4 mt-2">
              <button
                onClick={() => handleEdit(lineup.id)}
                className="w-full py-3 px-5 rounded-full bg-[#283827] hover:bg-[#1E2B1D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-soft active:scale-[0.99] transition-all"
              >
                <span>Edit & Organize Lineup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Print Modal */}
      {printingLineup && (
        <LineupPrintModal
          lineup={printingLineup}
          onClose={() => setPrintingLineup(null)}
        />
      )}

      {/* Share / Save Photo Modal */}
      {sharingLineup && (
        <LineupShareModal
          lineup={sharingLineup}
          onClose={() => setSharingLineup(null)}
        />
      )}
    </div>
  );
};
