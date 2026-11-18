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
  Share2,
  Ban,
  RotateCcw,
  Radio
} from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import { ServiceLineup } from '../../types';
import { LineupBuilderView } from './LineupBuilderView';
import { LineupPrintModal } from './LineupPrintModal';
import { LineupShareModal } from './LineupShareModal';
import { getLineupLifecycleStatus, ComputedLineupStatus } from '../../utils/serviceSchedule';

export const LineupsListView: React.FC = () => {
  const {
    lineups,
    activeLineupId,
    setActiveLineupId,
    deleteLineup,
    duplicateLineup,
    cancelLineup,
    publishLineup,
    completeLineup,
    currentUser
  } = useWorship();

  const [isBuilding, setIsBuilding] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'upcoming' | 'completed' | 'draft' | 'cancelled'>('ALL');
  const [printingLineup, setPrintingLineup] = useState<ServiceLineup | null>(null);
  const [sharingLineup, setSharingLineup] = useState<ServiceLineup | null>(null);

  // If in builder mode, render LineupBuilderView (100% PRESERVED)
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
    const computed = getLineupLifecycleStatus(l);
    if (selectedStatus === 'upcoming') {
      return computed === 'upcoming' || computed === 'ongoing';
    }
    if (selectedStatus === 'completed') {
      return computed === 'completed';
    }
    if (selectedStatus === 'draft') {
      return computed === 'draft';
    }
    if (selectedStatus === 'cancelled') {
      return computed === 'cancelled';
    }
    return true;
  });

  const handleCreateNew = () => {
    setActiveLineupId(null);
    setIsBuilding(true);
  };

  const handleEdit = (id: string) => {
    setActiveLineupId(id);
    setIsBuilding(true);
  };

  const upcomingCount = lineups.filter(l => {
    const s = getLineupLifecycleStatus(l);
    return s === 'upcoming' || s === 'ongoing';
  }).length;

  const completedCount = lineups.filter(l => getLineupLifecycleStatus(l) === 'completed').length;
  const draftCount = lineups.filter(l => l.status === 'draft').length;
  const cancelledCount = lineups.filter(l => l.status === 'cancelled').length;

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
              Plan, organize, and schedule worship sets with vocal keys and YouTube references.
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#283827] hover:bg-[#1E2B1D] text-white text-xs font-bold shadow-soft transition-all self-start sm:self-auto active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Service Lineup</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedStatus('ALL')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedStatus === 'ALL'
              ? 'bg-[#283827] text-white shadow-soft'
              : 'bg-[#F3ECE1] text-stone-700 hover:bg-[#EBE2D4]'
          }`}
        >
          All Lineups ({lineups.length})
        </button>
        <button
          onClick={() => setSelectedStatus('upcoming')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedStatus === 'upcoming'
              ? 'bg-[#283827] text-white shadow-soft'
              : 'bg-[#F3ECE1] text-stone-700 hover:bg-[#EBE2D4]'
          }`}
        >
          Upcoming ({upcomingCount})
        </button>
        <button
          onClick={() => setSelectedStatus('completed')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedStatus === 'completed'
              ? 'bg-[#283827] text-white shadow-soft'
              : 'bg-[#F3ECE1] text-stone-700 hover:bg-[#EBE2D4]'
          }`}
        >
          Completed History ({completedCount})
        </button>
        <button
          onClick={() => setSelectedStatus('draft')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedStatus === 'draft'
              ? 'bg-[#283827] text-white shadow-soft'
              : 'bg-[#F3ECE1] text-stone-700 hover:bg-[#EBE2D4]'
          }`}
        >
          Drafts ({draftCount})
        </button>
        {cancelledCount > 0 && (
          <button
            onClick={() => setSelectedStatus('cancelled')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'cancelled'
                ? 'bg-rose-900 text-white shadow-soft'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Cancelled ({cancelledCount})
          </button>
        )}
      </div>

      {/* Lineup Cards */}
      {filteredLineups.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-[#E8E2D7] shadow-soft flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-[#F8F5EE] border border-stone-200 text-stone-400 flex items-center justify-center mb-4 shadow-inner">
            <ListMusic className="w-8 h-8 text-[#283827]" />
          </div>
          <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">No Service Lineups Found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-md">
            Create and organize worship sets with songs, assigned vocalists, song categories, custom vocal keys, and YouTube references.
          </p>
          <button
            onClick={handleCreateNew}
            className="mt-5 flex items-center gap-2 px-6 py-3 rounded-full bg-[#283827] hover:bg-[#1E2B1D] text-white text-xs font-bold shadow-soft transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create First Lineup</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLineups.map((lineup) => {
            const computedStatus = getLineupLifecycleStatus(lineup);

            return (
              <div
                key={lineup.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EFE7DA] shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Top: Status, Songs Count & Quick Icons */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {computedStatus === 'ongoing' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                          <Radio className="w-3 h-3 text-amber-600" />
                          <span>Ongoing</span>
                        </span>
                      ) : computedStatus === 'upcoming' ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#D1FAE5] text-[#047857] border border-emerald-300">
                          Upcoming
                        </span>
                      ) : computedStatus === 'completed' ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-300">
                          Completed
                        </span>
                      ) : computedStatus === 'cancelled' ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                          Cancelled
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FEF3C7] text-[#92400E] border border-amber-200">
                          Draft
                        </span>
                      )}

                      <span className="text-xs text-[#8C827A] font-semibold">
                        {lineup.songs?.length || 0} Songs
                      </span>
                    </div>

                    {/* Quick Action Icons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSharingLineup(lineup)}
                        className="p-1.5 rounded-lg text-[#8C7A6B] hover:text-[#283827] hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Share Lineup / Save as Photo"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPrintingLineup(lineup)}
                        className="p-1.5 rounded-lg text-[#8C7A6B] hover:text-[#283827] hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Print Setlist"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const dup = duplicateLineup(lineup.id);
                          alert(`Lineup duplicated as "${dup.title}"`);
                        }}
                        className="p-1.5 rounded-lg text-[#8C7A6B] hover:text-[#283827] hover:bg-stone-100 transition-colors cursor-pointer"
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
                        className="p-1.5 rounded-lg text-[#8C7A6B] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
                      <span className="text-stone-400 font-medium">{(lineup.worship_leaders && lineup.worship_leaders.length > 1) ? 'Worship Leaders:' : 'Worship Leader:'}</span>{' '}
                      <strong className="text-stone-900 font-bold">{lineup.worship_leader_name || 'TBD'}</strong>
                    </div>
                    {lineup.created_by && (
                      <span className="text-xs font-bold text-[#8A5828] px-3 py-0.5 rounded-full bg-[#FDF3E3] border border-[#FBE0B8]">
                        By {lineup.created_by.split(' ')[0]}
                      </span>
                    )}
                  </div>

                  {/* Songs Preview */}
                  <div className="mt-3 space-y-1.5">
                    {lineup.songs?.map((s, idx) => (
                      <div
                        key={s.id || idx}
                        className="flex items-center justify-between text-xs py-2 px-3.5 rounded-full bg-[#FAF6EF]"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="text-stone-400 font-medium text-xs w-3">{idx + 1}</span>
                          <span className="font-bold text-stone-900 truncate">{s.title}</span>
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-full shrink-0">
                            Lead: {s.assigned_vocalist_name || lineup.worship_leader_name || 'Leader'}
                          </span>
                        </div>
                        <span className="font-bold text-[#9A6B3A] shrink-0 text-xs">
                          Key {s.selected_key || s.original_key || 'G'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Strip: Edit / Cancel / Re-publish */}
                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {lineup.status === 'cancelled' ? (
                      <button
                        onClick={() => publishLineup(lineup.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors cursor-pointer"
                        title="Re-activate service lineup"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Re-publish</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (window.confirm(`Cancel service "${lineup.title}"? The next upcoming service will automatically become primary.`)) {
                            cancelLineup(lineup.id);
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-stone-500 hover:text-rose-700 bg-stone-100 hover:bg-rose-50 border border-stone-200 hover:border-rose-300 transition-colors cursor-pointer"
                        title="Cancel this service"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancel Service</span>
                      </button>
                    )}

                    {computedStatus !== 'completed' && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Mark service "${lineup.title}" as completed? It will be archived in Service History.`)) {
                            completeLineup(lineup.id);
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-stone-600 hover:text-emerald-800 bg-stone-100 hover:bg-emerald-50 border border-stone-200 transition-colors cursor-pointer"
                        title="Mark as completed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Complete</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleEdit(lineup.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#283827] hover:bg-[#1E2B1D] text-white text-xs font-bold shadow-soft transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Edit & Organize Lineup</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share / Save as Photo Modal */}
      {sharingLineup && (
        <LineupShareModal
          lineup={sharingLineup}
          onClose={() => setSharingLineup(null)}
        />
      )}

      {/* Print Setlist Modal */}
      {printingLineup && (
        <LineupPrintModal
          lineup={printingLineup}
          onClose={() => setPrintingLineup(null)}
        />
      )}
    </div>
  );
};
