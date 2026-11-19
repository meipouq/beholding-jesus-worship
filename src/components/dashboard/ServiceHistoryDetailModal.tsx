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
import { formatDisplayTime } from '../../utils/timeFormat';

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
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#211C17] rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-modal border border-[#393027] animate-slide-up max-h-[90vh] overflow-y-auto text-[#FFF5E6]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#393027] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#181510] border border-[#393027] text-[#E5AF45] flex items-center justify-center shrink-0 shadow-2xs">
              <History className="w-5 h-5 text-[#E5AF45]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-[#FFF5E6] leading-tight">
                  {lineup.title}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#29231C] text-[#B8ADA0] border border-[#393027]">
                  Completed & Archived
                </span>
              </div>
              <p className="text-xs text-[#B8ADA0] mt-0.5">
                {lineup.service_date}{formatDisplayTime(lineup.service_time) ? ` • ${formatDisplayTime(lineup.service_time)}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-Only Protection Banner */}
        <div className="my-4 p-3 rounded-2xl bg-[#181510] border border-[#393027] text-[#B8ADA0] flex items-center gap-2.5 text-xs font-medium">
          <Lock className="w-4 h-4 text-[#E5AF45] shrink-0" />
          <span>
            <strong className="text-[#FFF5E6]">Read-Only Historical Record:</strong> This service has concluded. Completed lineups are permanently preserved in service history and cannot be accidentally modified.
          </span>
        </div>

        {/* Key Ministry Team Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Worship Leader */}
          <div className="p-3.5 rounded-2xl bg-[#181510] border border-[#393027]">
            <span className="text-[10px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
              {(lineup.worship_leaders && lineup.worship_leaders.length > 1) ? 'Worship Leaders' : 'Worship Leader'}
            </span>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#E5AF45] fill-[#E5AF45]" />
              <span className="text-xs font-bold text-[#FFF5E6]">
                {lineup.worship_leader_name}
              </span>
            </div>
          </div>

          {/* Assigned Vocalists */}
          <div className="p-3.5 rounded-2xl bg-[#181510] border border-[#393027]">
            <span className="text-[10px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
              Assigned Singers ({lineup.assigned_vocalists?.length || 0})
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {lineup.assigned_vocalists && lineup.assigned_vocalists.length > 0 ? (
                lineup.assigned_vocalists.map((v) => (
                  <span
                    key={v.id}
                    className="px-2 py-0.5 rounded-lg bg-[#29231C] border border-[#393027] text-[11px] font-semibold text-[#FFF5E6]"
                  >
                    {v.name} {v.vocal_range ? `(${v.vocal_range})` : ''}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#B8ADA0]">No vocalists recorded</span>
              )}
            </div>
          </div>
        </div>

        {/* Theme & Notes (if any) */}
        {(lineup.theme || lineup.notes) && (
          <div className="mb-5 space-y-2">
            {lineup.theme && (
              <div className="p-3 rounded-2xl bg-[#181510] border border-[#393027] text-xs">
                <span className="font-bold text-[#B8ADA0]">Theme / Sermon: </span>
                <span className="text-[#E5AF45] italic font-serif">"{lineup.theme}"</span>
              </div>
            )}
            {lineup.notes && (
              <div className="p-3 rounded-2xl bg-[#181510] border border-[#393027] text-xs">
                <span className="font-bold text-[#B8ADA0] block mb-0.5">Instructions & Notes:</span>
                <p className="text-[#FFF5E6] whitespace-pre-wrap">{lineup.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Historical Song Lineup & Keys Used */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-[#E5AF45] uppercase tracking-wider">
              Song Lineup & Musical Keys Used ({lineup.songs?.length || 0})
            </h4>
            <span className="text-[11px] text-[#B8ADA0] font-medium">Order of Worship</span>
          </div>

          {lineup.songs && lineup.songs.length > 0 ? (
            <div className="space-y-2">
              {lineup.songs.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3 rounded-2xl bg-[#181510] border border-[#393027] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-[#29231C] border border-[#393027] text-[#FFF5E6] font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#FFF5E6] truncate">
                          {item.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#29231C] text-[#E5AF45] border border-[#393027] uppercase">
                          {item.category || 'Worship'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#B8ADA0] truncate">
                        <strong className="text-[#E5AF45] font-semibold">Lead: {item.assigned_vocalist_name || lineup.worship_leader_name}</strong> {item.artist ? `• ${item.artist}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Keys Used Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-[9px] text-[#B8ADA0] block font-bold uppercase">Key Used</span>
                      <span className="px-2.5 py-1 rounded-xl bg-[#100E0B] border border-[#393027] text-[#E5AF45] font-mono text-xs font-bold shadow-2xs">
                        {item.selected_key || item.original_key || 'G'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#B8ADA0] py-4 text-center">No songs recorded for this service.</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-5 mt-5 border-t border-[#393027] flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => onShare(lineup)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#29231C] hover:bg-[#333] border border-[#393027] text-[#FFF5E6] text-xs font-bold transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#E5AF45]" />
            <span>Share & Photo</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDuplicate(lineup.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#E5AF45] hover:bg-[#FFC85C] text-[#100E0B] text-xs font-bold transition-all shadow-soft cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#100E0B]" />
              <span>Duplicate as New Service</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-[#29231C] hover:bg-[#333] border border-[#393027] text-[#FFF5E6] text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
