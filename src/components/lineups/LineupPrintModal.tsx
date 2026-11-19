import React from 'react';
import { X, Printer, Music2 } from 'lucide-react';
import { ServiceLineup, Song } from '../../types';
import { useWorship } from '../../context/WorshipContext';
import { formatDisplayTime } from '../../utils/timeFormat';

interface LineupPrintModalProps {
  lineup: ServiceLineup;
  onClose: () => void;
}

export const LineupPrintModal: React.FC<LineupPrintModalProps> = ({ lineup, onClose }) => {
  const { songs } = useWorship();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5 animate-fade-in no-print"
      onClick={onClose}
    >
      <div
        className="bg-[#211C17] rounded-3xl max-w-3xl w-full h-[92vh] flex flex-col shadow-2xl border border-[#393027] animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 border-b border-[#393027] bg-[#181510] flex items-center justify-between no-print">
          <div>
            <h2 className="text-base font-bold text-[#FFF5E6]">Printable Worship Setlist</h2>
            <p className="text-xs text-[#B8ADA0]">Formatted for music stands & sound booth</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E5AF45] hover:bg-[#FFC85C] text-[#100E0B] text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Setlist</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document */}
        <div className="p-8 sm:p-10 overflow-y-auto flex-1 font-serif text-black bg-white print:p-0 print:m-0">
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-black uppercase tracking-widest font-sans">
              Beholding Jesus Worship Team
            </h1>
            <p className="text-xs uppercase tracking-wider text-stone-600 mt-1 font-sans">
              Worship Service Setlist • Order of Praise
            </p>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs font-sans font-bold">
              <span>{lineup.title}</span>
              <span>•</span>
              <span>{lineup.service_date}</span>
              <span>•</span>
              <span>{formatDisplayTime(lineup.service_time) || lineup.service_time}</span>
            </div>
            {lineup.theme && (
              <p className="text-xs italic text-stone-700 mt-1">
                Theme: "{lineup.theme}"
              </p>
            )}
          </div>

          {/* Service Roster Summary */}
          <div className="grid grid-cols-2 gap-4 pb-4 mb-6 border-b border-stone-300 font-sans text-xs">
            <div>
              <span className="font-bold text-stone-700 uppercase block mb-1">
                {(lineup.worship_leaders && lineup.worship_leaders.length > 1) ? 'Worship Leaders:' : 'Worship Leader:'}
              </span>
              <p className="font-bold">{lineup.worship_leader_name}</p>
              {lineup.assigned_vocalists && lineup.assigned_vocalists.length > 0 && (
                <div className="mt-2">
                  <span className="font-bold text-stone-700 uppercase block mb-0.5">Vocal Team:</span>
                  <p className="text-stone-700">{lineup.assigned_vocalists.map(v => v.name).join(', ')}</p>
                </div>
              )}
            </div>

            <div>
              {lineup.assigned_musicians && lineup.assigned_musicians.length > 0 && (
                <div>
                  <span className="font-bold text-stone-700 uppercase block mb-1">Band & Rhythm Section:</span>
                  <p className="text-stone-700">
                    {lineup.assigned_musicians.map(m => `${m.name} (${m.instrument})`).join(', ')}
                  </p>
                </div>
              )}
              {lineup.notes && (
                <div className="mt-2">
                  <span className="font-bold text-stone-700 uppercase block mb-0.5">Instructions:</span>
                  <p className="text-stone-600 italic">{lineup.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Categorized Song Table */}
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider font-sans border-b border-black pb-1">
              Song Lineup ({lineup.songs.length} Songs)
            </h2>

            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-400 text-[11px] font-bold text-stone-600 uppercase">
                  <th className="py-2 w-8">#</th>
                  <th className="py-2">Song Title & Artist</th>
                  <th className="py-2">Section</th>
                  <th className="py-2 text-center w-16">Key</th>
                  <th className="py-2">Lead / Vocalist</th>
                  <th className="py-2">Transition / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {lineup.songs.map((item, idx) => (
                  <tr key={item.id} className="py-3">
                    <td className="py-2.5 font-bold">{idx + 1}</td>
                    <td className="py-2.5">
                      <div className="font-bold text-sm leading-tight">{item.title}</div>
                      <div className="text-[11px] text-stone-600">{item.artist}</div>
                    </td>
                    <td className="py-2.5">
                      <span className="font-bold uppercase text-[10px] px-2 py-0.5 border border-stone-400 rounded">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2.5 text-center font-black text-sm">
                      {item.selected_key || item.original_key}
                    </td>
                    <td className="py-2.5 text-stone-800 font-medium">
                      {item.assigned_vocalist_name || lineup.worship_leader_name || '—'}
                    </td>
                    <td className="py-2.5 text-stone-600 italic">
                      {item.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Verse */}
          <div className="mt-12 pt-4 border-t border-stone-300 text-center font-sans text-[11px] text-stone-500">
            "Let the word of Christ dwell in you richly, teaching and admonishing one another in all wisdom, singing psalms and hymns and spiritual songs, with thankfulness in your hearts to God." — Colossians 3:16
          </div>
        </div>
      </div>
    </div>
  );
};
