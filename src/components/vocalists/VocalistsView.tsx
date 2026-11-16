import React, { useState } from 'react';
import {
  Users,
  Mic,
  Plus,
  Key,
  Phone,
  Mail,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Edit2,
  Trash2,
  Music2
} from 'lucide-react';
import { TeamMember } from '../../types';
import { useWorship } from '../../context/WorshipContext';
import { VocalistModal } from './VocalistModal';
import { VocalKeyMatrixModal } from './VocalKeyMatrixModal';

export const VocalistsView: React.FC = () => {
  const { members, saveMember, deleteMember, songs } = useWorship();
  const [search, setSearch] = useState('');
  const [selectedRange, setSelectedRange] = useState('ALL');
  const [editingVocalist, setEditingVocalist] = useState<TeamMember | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [keyMatrixVocalist, setKeyMatrixVocalist] = useState<TeamMember | null>(null);

  const vocalists = members.filter(m => m.vocal_range !== 'Instrumentalist');

  const filtered = vocalists.filter(v => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || v.name.toLowerCase().includes(q) || v.role_title.toLowerCase().includes(q);
    const matchesRange = selectedRange === 'ALL' || v.vocal_range.toLowerCase() === selectedRange.toLowerCase();
    return matchesSearch && matchesRange;
  });

  const getAvailabilityBadge = (status: TeamMember['availability']) => {
    switch (status) {
      case 'Available':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Available</span>;
      case 'Rehearsal Only':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Rehearsal Only</span>;
      case 'Traveling':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Traveling</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-5 pb-20 md:pb-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-[#1E1D1B] text-white shadow-2xs">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
              Vocalists & Vocal Keys
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Directory of team vocalists, individual vocal ranges, and custom song key mappings
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold shadow-soft transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vocalist</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8E2D7] shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vocalists by name or role..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-[#F8F5EE]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'Soprano', 'Mezzo-Soprano', 'Alto', 'Tenor', 'Baritone', 'Bass'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedRange === range
                  ? 'bg-[#1E1D1B] text-white shadow-2xs'
                  : 'bg-[#F2ECE1] text-stone-700 hover:bg-stone-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Vocalist Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-[#E8E2D7] shadow-soft">
          <div className="w-12 h-12 rounded-2xl bg-[#F8F5EE] border border-stone-200 text-stone-400 flex items-center justify-center mx-auto mb-3">
            <Mic className="w-6 h-6 text-amber-800" />
          </div>
          <h3 className="text-base font-bold text-stone-900">
            {vocalists.length === 0 ? 'No Vocalists in Directory Yet' : 'No Vocalists Match Filter'}
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {vocalists.length === 0
              ? 'Start building your team! Add yourself and worship vocalists with individual vocal ranges, contact details, and custom profile pictures.'
              : 'Try clearing your search query or choosing "ALL" ranges.'}
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="mt-4 px-4 py-2.5 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vocalist</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((vocalist) => {
            // Count mapped songs
            const mappedSongsCount = songs.filter(s => s.vocal_keys && s.vocal_keys[vocalist.id]).length;

            return (
              <div
                key={vocalist.id}
                className="bg-white rounded-3xl p-5 border border-[#E8E2D7] shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-[#1E1D1B] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs overflow-hidden">
                        {vocalist.avatar && vocalist.avatar.includes('/') ? (
                          <img
                            src={vocalist.avatar}
                            alt={vocalist.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          vocalist.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-stone-900 truncate">
                          {vocalist.name}
                        </h3>
                        <p className="text-xs text-stone-500 font-medium truncate">
                          {vocalist.role_title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingVocalist(vocalist)}
                        className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Remove ${vocalist.name} from vocalists directory?`)) {
                            deleteMember(vocalist.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Range & Status Badges */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#EFE8DC] text-stone-800 text-[10px] font-bold uppercase tracking-wider">
                      {vocalist.vocal_range}
                    </span>
                    {getAvailabilityBadge(vocalist.availability)}
                  </div>

                  {/* Notes */}
                  {vocalist.notes && (
                    <p className="text-[11px] text-stone-600 mt-2.5 bg-[#FAF6F0] p-2.5 rounded-xl border border-stone-200/60 leading-relaxed italic">
                      "{vocalist.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                    <Music2 className="w-3.5 h-3.5 text-amber-800" />
                    <span><strong>{mappedSongsCount}</strong> custom keys</span>
                  </div>

                  <button
                    onClick={() => setKeyMatrixVocalist(vocalist)}
                    className="px-3.5 py-2 rounded-xl bg-[#FAF6F0] hover:bg-[#1E1D1B] text-stone-800 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-[#E8E2D7]"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Manage Keys</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {(isAdding || editingVocalist) && (
        <VocalistModal
          vocalist={editingVocalist}
          onClose={() => {
            setIsAdding(false);
            setEditingVocalist(null);
          }}
          onSave={(saved) => {
            saveMember(saved);
            setIsAdding(false);
            setEditingVocalist(null);
          }}
        />
      )}

      {keyMatrixVocalist && (
        <VocalKeyMatrixModal
          vocalist={keyMatrixVocalist}
          onClose={() => setKeyMatrixVocalist(null)}
        />
      )}
    </div>
  );
};
