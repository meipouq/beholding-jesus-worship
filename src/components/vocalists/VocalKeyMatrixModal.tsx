import React, { useState } from 'react';
import { X, Search, Mic, Music, Check, RotateCcw } from 'lucide-react';
import { TeamMember, Song } from '../../types';
import { useWorship } from '../../context/WorshipContext';

const KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
];

interface VocalKeyMatrixModalProps {
  vocalist: TeamMember;
  onClose: () => void;
}

export const VocalKeyMatrixModal: React.FC<VocalKeyMatrixModalProps> = ({ vocalist, onClose }) => {
  const { songs, updateVocalKey } = useWorship();
  const [search, setSearch] = useState('');

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.artist.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-modal border border-stone-200 animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-100 bg-[#FAF6F0] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E1D1B] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {vocalist.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900">{vocalist.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {vocalist.vocal_range}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Manage personal vocal keys for each worship song
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-stone-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search songs to map keys..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-[#F8F5EE]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
        </div>

        {/* Matrix List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2 flex-1 divide-y divide-stone-100">
          {filteredSongs.map((song) => {
            const assignedKey = song.vocal_keys?.[vocalist.id] || '';
            const isCustom = Boolean(assignedKey && assignedKey !== song.original_key);

            return (
              <div
                key={song.id}
                className="pt-2.5 pb-2.5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 truncate">{song.title}</span>
                    <span className="text-[10px] text-stone-400 font-medium px-1.5 py-0.5 rounded bg-stone-100">
                      {song.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Original Song Key: <strong className="text-stone-700">{song.original_key}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={assignedKey}
                    onChange={(e) => updateVocalKey(song.id, vocalist.id, e.target.value)}
                    className={`text-xs font-bold py-1.5 px-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                      isCustom
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-black'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    <option value="">Default ({song.original_key})</option>
                    {KEYS.map((k) => (
                      <option key={k} value={k}>
                        Key of {k}
                      </option>
                    ))}
                  </select>

                  {assignedKey && (
                    <button
                      onClick={() => updateVocalKey(song.id, vocalist.id, '')}
                      className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                      title="Reset to default original key"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>Changes are saved instantly to the database.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1E1D1B] hover:bg-stone-800 text-white font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
