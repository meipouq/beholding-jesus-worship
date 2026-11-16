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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-modal border border-stone-200 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-800" />
            <h2 className="text-base font-bold text-stone-900">Lineup Change History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
          {(!lineup.history || lineup.history.length === 0) ? (
            <p className="text-xs text-stone-400 text-center py-6">No change history recorded.</p>
          ) : (
            lineup.history.map((h) => (
              <div key={h.id} className="p-3 rounded-2xl bg-[#FAF6F0] border border-stone-200/80 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-stone-900">{h.user_name}</span>
                  <span className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {h.timestamp}
                  </span>
                </div>
                <p className="text-stone-600 mt-1 leading-snug">{h.action}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
