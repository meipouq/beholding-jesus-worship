import React from 'react';
import { Calendar, Clock, Star, Users, ArrowRight, ListMusic, Plus } from 'lucide-react';
import { ServiceLineup, Song } from '../../types';
import { calculateServiceCountdown } from '../../utils/serviceSchedule';

interface UpcomingServicesListProps {
  lineups: ServiceLineup[];
  songs: Song[];
  onSelectLineup: (lineupId: string) => void;
  onCreateLineup: () => void;
}

function formatReadableDate(dateStr?: string, timeStr?: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      return `${weekday}, ${monthName} ${day}, ${year}${timeStr ? ` • ${timeStr}` : ''}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export const UpcomingServicesList: React.FC<UpcomingServicesListProps> = ({
  lineups,
  songs,
  onSelectLineup,
  onCreateLineup
}) => {
  return (
    <div className="bg-[#211C17] rounded-3xl p-5 sm:p-6 border border-[#393027] shadow-soft space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#393027]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#181510] border border-[#393027] text-[#E5AF45] flex items-center justify-center shadow-2xs">
            <Calendar className="w-4.5 h-4.5 text-[#E5AF45]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#FFF5E6] leading-tight">
              Upcoming Services
            </h3>
            <p className="text-[11px] text-[#B8ADA0] font-medium">
              Chronologically scheduled worship line-ups
            </p>
          </div>
        </div>

        <button
          onClick={onCreateLineup}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181510] hover:bg-[#29231C] text-[#E5AF45] hover:text-[#FFC85C] border border-[#393027] text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
          title="Create New Service Lineup"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Schedule Service</span>
        </button>
      </div>

      {/* List of upcoming services */}
      {lineups.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-2xl bg-[#181510] border border-dashed border-[#393027]">
          <ListMusic className="w-8 h-8 text-[#B8ADA0] mx-auto mb-2 opacity-70" />
          <p className="text-xs font-bold text-[#FFF5E6]">No other upcoming services scheduled</p>
          <p className="text-[11px] text-[#B8ADA0] mt-0.5 max-w-xs mx-auto">
            The next nearest published service is displayed above. Additional services will automatically appear here in chronological order.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {lineups.map((lineup) => {
            const cd = calculateServiceCountdown(lineup);
            const totalSongs = lineup.songs?.length || 0;

            return (
              <div
                key={lineup.id}
                onClick={() => onSelectLineup(lineup.id)}
                className="group p-4 rounded-2xl bg-[#181510] hover:bg-[#29231C] border border-[#393027] hover:border-[#E5AF45]/50 shadow-2xs hover:shadow-soft transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#FFF5E6] group-hover:text-[#FFC85C] transition-colors">
                      {lineup.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#79BB8B]/15 text-[#79BB8B] border border-[#79BB8B]/30">
                      Published
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#29231C] text-[#E5AF45] border border-[#393027]">
                      In {cd.days > 0 ? `${cd.days}d ` : ''}{cd.hours}h {cd.minutes}m
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#B8ADA0] font-medium flex-wrap">
                    <div className="flex items-center gap-1 text-[#B8ADA0]">
                      <Clock className="w-3.5 h-3.5 text-[#B8ADA0]" />
                      <span>{formatReadableDate(lineup.service_date, lineup.service_time)}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[#E5AF45] fill-[#E5AF45]" />
                      <span className="font-semibold text-[#FFF5E6]">
                        Leader: {lineup.worship_leader_name}
                      </span>
                    </div>
                    <span>•</span>
                    <span className="text-[#B8ADA0]">
                      {totalSongs} {totalSongs === 1 ? 'song' : 'songs'}
                    </span>
                  </div>

                  {lineup.theme && (
                    <p className="text-[11px] text-[#E5AF45] italic font-serif truncate">
                      Theme: "{lineup.theme}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLineup(lineup.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#29231C] group-hover:bg-[#E5AF45] text-[#FFF5E6] group-hover:text-[#100E0B] border border-[#393027] group-hover:border-[#E5AF45] text-xs font-bold transition-all shadow-2xs group-hover:shadow-soft cursor-pointer"
                  >
                    <span>View Setlist</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
