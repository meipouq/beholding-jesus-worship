import React from 'react';
import {
  X,
  History,
  Lock,
  Calendar,
  Clock,
  Star,
  Users,
  Music2,
  Copy,
  Printer,
  Share2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { ServiceLineup, Song } from '../../types';

interface ServiceHistoryDetailModalProps {
  lineup: ServiceLineup;
  songs: Song[];
  onClose: () => void;
  onDuplicate: (lineupId: string) => void;
  onShare: (lineup: ServiceLineup) => void;
}

export const ServiceHistoryDetailModal: React.FC<ServiceHistoryDetailModalProps> = ({
  lineup,
  songs,
  onClose,
  onDuplicate,
  onShare
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-modal border border-stone-200 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E1D1B] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <History className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 leading-tight">
                  {lineup.title}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-300">
                  Completed & Archived
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {lineup.service_date} • {lineup.service_time}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-Only Protection Banner */}
        <div className="my-4 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-900 flex items-center gap-2.5 text-xs font-medium">
          <Lock className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Read-Only Historical Record:</strong> This service has concluded. Completed lineups are permanently preserved in service history and cannot be accidentally modified.
          </span>
        </div>

        {/* Key Ministry Team Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Worship Leader */}
          <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-stone-200/80">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Worship Leader
            </span>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span className="text-xs font-bold text-stone-900">
                {lineup.worship_leader_name}
              </span>
            </div>
          </div>

          {/* Assigned Vocalists */}
          <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-stone-200/80">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Assigned Singers ({lineup.assigned_vocalists?.length || 0})
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {lineup.assigned_vocalists && lineup.assigned_vocalists.length > 0 ? (
                lineup.assigned_vocalists.map((v) => (
                  <span
                    key={v.id}
                    className="px-2 py-0.5 rounded-lg bg-white border border-stone-200 text-[11px] font-semibold text-stone-800"
                  >
                    {v.name} {v.vocal_range ? `(${v.vocal_range})` : ''}
                  </span>
                ))
              ) : (
                <span className="text-xs text-stone-400">No vocalists recorded</span>
              )}
            </div>
          </div>
        </div>

        {/* Theme & Notes (if any) */}
        {(lineup.theme || lineup.notes) && (
          <div className="mb-5 space-y-2">
            {lineup.theme && (
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                <span className="font-bold text-stone-700">Theme / Sermon: </span>
                <span className="text-stone-900 italic font-serif">"{lineup.theme}"</span>
              </div>
            )}
            {lineup.notes && (
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                <span className="font-bold text-stone-700 block mb-0.5">Instructions & Notes:</span>
                <p className="text-stone-600 whitespace-pre-wrap">{lineup.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Historical Song Lineup & Keys Used */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider">
              Song Lineup & Musical Keys Used ({lineup.songs?.length || 0})
            </h4>
            <span className="text-[11px] text-stone-400 font-medium">Order of Worship</span>
          </div>

          {lineup.songs && lineup.songs.length > 0 ? (
            <div className="space-y-2">
              {lineup.songs.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3 rounded-2xl bg-[#FAF6F0] border border-stone-200/90 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-stone-200/80 text-stone-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {item.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100/70 text-amber-900 border border-amber-200/50 uppercase">
                          {item.category || 'Worship'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">
                        {item.artist} {item.assigned_vocalist_name ? `• Lead: ${item.assigned_vocalist_name}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Keys Used Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-[9px] text-stone-400 block font-bold uppercase">Key Used</span>
                      <span className="px-2.5 py-1 rounded-xl bg-[#1E1D1B] text-amber-300 font-mono text-xs font-bold shadow-2xs">
                        {item.selected_key || item.original_key || 'G'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400 py-4 text-center">No songs recorded for this service.</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-5 mt-5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => onShare(lineup)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share & Photo</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDuplicate(lineup.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-soft"
            >
              <Copy className="w-3.5 h-3.5 text-amber-300" />
              <span>Duplicate as New Service</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
