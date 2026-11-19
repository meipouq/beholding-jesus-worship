import React from 'react';
import { X, History, Clock } from 'lucide-react';
import { ServiceLineup } from '../../types';

interface LineupHistoryModalProps {
  lineup: ServiceLineup;
  onClose: () => void;
}

export const LineupHistoryModal: React.FC<LineupHistoryModalProps> = ({ lineup, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#211C17] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#393027] animate-slide-up text-[#FFF5E6]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#393027]">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#E5AF45]" />
            <h2 className="text-base font-bold text-[#FFF5E6]">Lineup Change History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
          {(!lineup.history || lineup.history.length === 0) ? (
            <p className="text-xs text-[#B8ADA0] text-center py-6">No change history recorded.</p>
          ) : (
            lineup.history.map((h) => (
              <div key={h.id} className="p-3 rounded-2xl bg-[#181510] border border-[#393027] text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#FFF5E6]">{h.user_name}</span>
                  <span className="text-[10px] text-[#B8ADA0] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#E5AF45]" />
                    {h.timestamp}
                  </span>
                </div>
                <p className="text-[#B8ADA0] mt-1 leading-snug">{h.action}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
