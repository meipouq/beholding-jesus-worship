import React, { useState } from 'react';
import { X, Calendar, Plus, Check } from 'lucide-react';
import { Song, ServiceLineup, LineupSongItem } from '../../types';
import { useWorship } from '../../context/WorshipContext';

interface AddToLineupModalProps {
  song: Song | null;
  onClose: () => void;
}

export const AddToLineupModal: React.FC<AddToLineupModalProps> = ({ song, onClose }) => {
  const { lineups, saveLineup, members } = useWorship();
  const [selectedLineupId, setSelectedLineupId] = useState(lineups[0]?.id || '');
  const [selectedKey, setSelectedKey] = useState(song?.original_key || 'G');
  const [category, setCategory] = useState(song?.category || 'JOYFUL');
  const [vocalistId, setVocalistId] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  if (!song) return null;

  const targetLineup = lineups.find(l => l.id === selectedLineupId);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLineup) return;

    const assignedVocalist = members.find(m => m.id === vocalistId);

    const newItem: LineupSongItem = {
      id: `ls-${Date.now()}`,
      song_id: song.id,
      title: song.title,
      artist: song.artist,
      category: category.toUpperCase(),
      original_key: song.original_key,
      selected_key: selectedKey,
      assigned_vocalist_id: vocalistId || undefined,
      assigned_vocalist_name: assignedVocalist ? assignedVocalist.name : undefined,
      youtube_url: song.youtube_url,
      notes: notes.trim() || undefined,
      order: (targetLineup.songs?.length || 0) + 1
    };

    const updatedLineup: ServiceLineup = {
      ...targetLineup,
      songs: [...(targetLineup.songs || []), newItem]
    };

    saveLineup(updatedLineup);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

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
          <div>
            <h2 className="text-base font-bold text-stone-900">Add to Service Lineup</h2>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">{song.title} • {song.artist}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-stone-900">Added to Lineup Successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleAdd} className="mt-4 space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Select Service Lineup *
              </label>
              <select
                value={selectedLineupId}
                onChange={(e) => setSelectedLineupId(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
              >
                {lineups.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} ({l.service_date} • {l.service_time}) - {l.status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Lineup Section / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white font-bold"
                >
                  <option value="JOYFUL">JOYFUL</option>
                  <option value="SOLEMN">SOLEMN</option>
                  <option value="UPLIFTING">UPLIFTING</option>
                  <option value="CALL TO WORSHIP">CALL TO WORSHIP</option>
                  <option value="OFFERTORY">OFFERTORY</option>
                  <option value="CLOSING">CLOSING</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Selected Key
                </label>
                <input
                  type="text"
                  value={selectedKey}
                  onChange={(e) => setSelectedKey(e.target.value)}
                  placeholder="Key of G"
                  className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Assigned Lead Vocalist (Optional)
              </label>
              <select
                value={vocalistId}
                onChange={(e) => setVocalistId(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
              >
                <option value="">None / Unassigned</option>
                {members.filter(m => m.vocal_range !== 'Instrumentalist').map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.vocal_range})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Arrangement / Transition Note
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Drums build up into chorus, acoustic into bridge"
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#1E1D1B] hover:bg-stone-800 text-white transition-colors"
              >
                Add to Lineup
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
