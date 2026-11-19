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
        className="bg-[#1F1F21] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#35312B] animate-slide-up text-[#F5F0E6]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#35312B]">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#D9A441]" />
            <h2 className="text-base font-bold text-[#F5F0E6]">Lineup Change History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#AAA5A0] hover:text-[#F5F0E6] hover:bg-[#262626]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
          {(!lineup.history || lineup.history.length === 0) ? (
            <p className="text-xs text-[#AAA5A0] text-center py-6">No change history recorded.</p>
          ) : (
            lineup.history.map((h) => (
              <div key={h.id} className="p-3 rounded-2xl bg-[#161616] border border-[#35312B] text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#F5F0E6]">{h.user_name}</span>
                  <span className="text-[10px] text-[#AAA5A0] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#D9A441]" />
                    {h.timestamp}
                  </span>
                </div>
                <p className="text-[#AAA5A0] mt-1 leading-snug">{h.action}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
