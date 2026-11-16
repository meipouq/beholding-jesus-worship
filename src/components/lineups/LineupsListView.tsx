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
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-[#1E1D1B] text-white shadow-2xs">
            <ListMusic className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
              Service Lineups
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Plan, organize, and publish worship sets with vocal keys and YouTube references
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold shadow-soft transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Service Lineup</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedStatus('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            selectedStatus === 'ALL'
              ? 'bg-[#1E1D1B] text-white shadow-2xs'
              : 'bg-[#F2ECE1] text-stone-700 hover:bg-stone-200'
          }`}
        >
          All Lineups ({lineups.length})
        </button>
        <button
          onClick={() => setSelectedStatus('published')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            selectedStatus === 'published'
              ? 'bg-[#1E1D1B] text-white shadow-2xs'
              : 'bg-[#F2ECE1] text-stone-700 hover:bg-stone-200'
          }`}
        >
          Published ({lineups.filter(l => l.status === 'published').length})
        </button>
        <button
          onClick={() => setSelectedStatus('draft')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            selectedStatus === 'draft'
              ? 'bg-[#1E1D1B] text-white shadow-2xs'
              : 'bg-[#F2ECE1] text-stone-700 hover:bg-stone-200'
          }`}
        >
          Drafts ({lineups.filter(l => l.status === 'draft').length})
        </button>
      </div>

      {/* Lineup Cards */}
      {filteredLineups.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-[#E8E2D7] shadow-soft flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-[#F8F5EE] border border-stone-200 text-stone-400 flex items-center justify-center mb-4 shadow-inner">
            <ListMusic className="w-8 h-8 text-amber-900/70" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900">No Service Lineups Yet</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-md">
            Create and organize worship sets with songs, assigned vocalists, song categories, custom vocal keys, and YouTube references.
          </p>
          <button
            onClick={handleCreateNew}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold shadow-soft transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Lineup</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLineups.map((lineup) => (
          <div
            key={lineup.id}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D7] shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Top */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      lineup.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {lineup.status}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">
                      {lineup.songs?.length || 0} Songs
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900 mt-1 leading-snug">
                    {lineup.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-800" />
                    <span>{lineup.service_date} • {lineup.service_time}</span>
                  </div>
                </div>

                {/* Quick Action Icons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSharingLineup(lineup)}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-amber-800 hover:bg-amber-50"
                    title="Share Lineup / Save as Photo"
                  >
                    <Share2 className="w-4 h-4 text-amber-800" />
                  </button>
                  <button
                    onClick={() => setPrintingLineup(lineup)}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100"
                    title="Print Setlist"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const dup = duplicateLineup(lineup.id);
                      alert(`Lineup duplicated as "${dup.title}"`);
                    }}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete lineup "${lineup.title}"?`)) {
                        deleteLineup(lineup.id);
                      }
                    }}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Author, Worship Leader & Assigned Vocalists */}
              <div className="py-2.5 text-xs text-stone-600 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-stone-400 font-medium">Worship Leader:</span>{' '}
                    <strong className="text-stone-800">{lineup.worship_leader_name}</strong>
                  </div>
                  {lineup.created_by && (
                    <span className="text-[10px] font-bold text-amber-800 px-2 py-0.5 rounded-full bg-amber-100/70 border border-amber-200/80">
                      By {lineup.created_by.split(' ')[0]}
                    </span>
                  )}
                </div>
                {lineup.assigned_vocalists && lineup.assigned_vocalists.length > 0 && (
                  <div className="truncate">
                    <span className="text-stone-400 font-medium">Vocalists:</span>{' '}
                    <span>{lineup.assigned_vocalists.map(v => v.name.split(' ')[0]).join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Songs Preview */}
              <div className="py-2 space-y-1">
                {lineup.songs?.slice(0, 4).map((s, idx) => (
                  <div key={s.id} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-xl bg-[#FAF6F0]">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="text-stone-400 font-bold text-[11px] w-3">{idx + 1}</span>
                      <span className="font-semibold text-stone-800 truncate">{s.title}</span>
                    </div>
                    <span className="font-bold text-amber-900 shrink-0 text-[11px]">
                      Key {s.selected_key || s.original_key}
                    </span>
                  </div>
                ))}
                {lineup.songs && lineup.songs.length > 4 && (
                  <p className="text-[11px] text-stone-400 text-center pt-1 font-medium">
                    +{lineup.songs.length - 4} more songs
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-4 mt-2 border-t border-stone-100">
              <button
                onClick={() => handleEdit(lineup.id)}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
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
