import React, { useState } from 'react';
import { History, Clock, Star, Users, ArrowRight, Music2, CheckCircle2 } from 'lucide-react';
import { ServiceLineup, Song } from '../../types';
import { ServiceHistoryDetailModal } from './ServiceHistoryDetailModal';

interface ServiceHistorySectionProps {
  historyLineups: ServiceLineup[];
  songs: Song[];
  onDuplicateLineup: (lineupId: string) => void;
  onShareLineup: (lineup: ServiceLineup) => void;
}

export const ServiceHistorySection: React.FC<ServiceHistorySectionProps> = ({
  historyLineups,
  songs,
  onDuplicateLineup,
  onShareLineup
}) => {
  const [selectedHistoryLineup, setSelectedHistoryLineup] = useState<ServiceLineup | null>(null);

  return (
    <div className="bg-[#1F1F21] rounded-3xl p-5 sm:p-6 border border-[#35312B] shadow-soft space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#35312B]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#161616] border border-[#35312B] text-[#D9A441] flex items-center justify-center shadow-2xs">
            <History className="w-4.5 h-4.5 text-[#D9A441]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#F5F0E6] leading-tight">
              Service History
            </h3>
            <p className="text-[11px] text-[#AAA5A0] font-medium">
              Completed worship services preserved permanently
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-[#AAA5A0] bg-[#161616] px-3 py-1 rounded-full border border-[#35312B]">
          {historyLineups.length} {historyLineups.length === 1 ? 'Service' : 'Services'}
        </span>
      </div>

      {historyLineups.length === 0 ? (
        <div className="py-7 px-4 text-center rounded-2xl bg-[#161616] border border-dashed border-[#35312B]">
          <History className="w-7 h-7 text-[#AAA5A0] mx-auto mb-1.5 opacity-60" />
          <p className="text-xs font-bold text-[#F5F0E6]">No completed services yet</p>
          <p className="text-[11px] text-[#AAA5A0] mt-0.5 max-w-xs mx-auto">
            When an upcoming service reaches its scheduled end time, it is automatically marked as Completed and preserved here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {historyLineups.map((lineup) => {
            const songCount = lineup.songs?.length || 0;
            const uniqueKeys = Array.from(new Set(lineup.songs?.map(s => s.selected_key || s.original_key).filter(Boolean)));

            return (
              <div
                key={lineup.id}
                onClick={() => setSelectedHistoryLineup(lineup)}
                className="group p-4 rounded-2xl bg-[#161616] hover:bg-[#262626] border border-[#35312B] hover:border-[#D9A441]/50 shadow-2xs hover:shadow-soft transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#F5F0E6] group-hover:text-[#F5C15D] transition-colors">
                      {lineup.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#262626] text-[#AAA5A0] border border-[#35312B]">
                      Completed
                    </span>
                    <span className="text-xs text-[#AAA5A0] font-medium">
                      {lineup.service_date} • {lineup.service_time}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#AAA5A0] font-medium flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[#D9A441] fill-[#D9A441]" />
                      <span className="font-semibold text-[#F5F0E6]">
                        {lineup.worship_leader_name}
                      </span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#AAA5A0]" />
                      <span>{lineup.assigned_vocalists?.length || 0} Singers</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Music2 className="w-3.5 h-3.5 text-[#AAA5A0]" />
                      <span>{songCount} {songCount === 1 ? 'song' : 'songs'}</span>
                    </div>
                  </div>

                  {uniqueKeys.length > 0 && (
                    <div className="flex items-center gap-1 pt-0.5">
                      <span className="text-[10px] text-[#AAA5A0] font-bold uppercase tracking-wider">Keys Used:</span>
                      <div className="flex items-center gap-1">
                        {uniqueKeys.map(k => (
                          <span key={k} className="px-1.5 py-0.2 rounded-md bg-[#101010] border border-[#35312B] text-[10px] font-mono font-bold text-[#D9A441]">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHistoryLineup(lineup);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#262626] group-hover:bg-[#D9A441] text-[#F5F0E6] group-hover:text-[#101010] border border-[#35312B] group-hover:border-[#D9A441] text-xs font-bold transition-all shadow-2xs group-hover:shadow-soft cursor-pointer"
                  >
                    <span>Review Lineup & Keys</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedHistoryLineup && (
        <ServiceHistoryDetailModal
          lineup={selectedHistoryLineup}
          songs={songs}
          onClose={() => setSelectedHistoryLineup(null)}
          onDuplicate={(lineupId) => {
            setSelectedHistoryLineup(null);
            onDuplicateLineup(lineupId);
          }}
          onShare={(lineup) => {
            setSelectedHistoryLineup(null);
            onShareLineup(lineup);
          }}
        />
      )}
    </div>
  );
};
