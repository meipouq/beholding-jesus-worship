import React from 'react';
import {
  X,
  Play,
  FileMusic,
  PlusCircle,
  ExternalLink,
  Edit,
  Trash2,
  Clock,
  Mic,
  Calendar
} from 'lucide-react';
import { Song } from '../../types';
import { useWorship } from '../../context/WorshipContext';

interface SongDetailModalProps {
  song: Song | null;
  onClose: () => void;
  onEdit: (song: Song) => void;
  onDelete: (id: string) => void;
  onAddToLineup: (song: Song) => void;
}

export const SongDetailModal: React.FC<SongDetailModalProps> = ({
  song,
  onClose,
  onEdit,
  onDelete,
  onAddToLineup
}) => {
  const { playVideo, openChords, members } = useWorship();

  if (!song) return null;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${song.title}"?`)) {
      onDelete(song.id);
      onClose();
    }
  };

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
        <div className="p-5 sm:p-6 border-b border-stone-100 bg-[#FAF6F0] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#EDE4D5] text-[#1F1E1D] text-[11px] font-bold uppercase tracking-wider">
                {song.category}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                Key of {song.original_key}
              </span>
              {song.tempo_bpm && (
                <span className="text-xs text-stone-500 font-medium">
                  {song.tempo_bpm} BPM • {song.time_signature || '4/4'}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1.5">
              {song.title}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              By {song.artist} {song.composer ? `• Comp: ${song.composer}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(song)}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
              title="Edit Song"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete Song"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-stone-800">
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {song.youtube_url && (
              <button
                onClick={() => playVideo(song.title, song.youtube_url!)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Reference</span>
              </button>
            )}

            <button
              onClick={() => openChords(song)}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              <FileMusic className="w-3.5 h-3.5" />
              <span>Chords & Transpose</span>
            </button>

            <button
              onClick={() => onAddToLineup(song)}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all border border-stone-200 col-span-2 sm:col-span-1"
            >
              <PlusCircle className="w-3.5 h-3.5 text-stone-700" />
              <span>Add to Lineup</span>
            </button>
          </div>

          {/* Vocal Keys Assignment Matrix */}
          {Object.keys(song.vocal_keys || {}).length > 0 && (
            <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8E2D7]">
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-4 h-4 text-amber-800" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Vocal Keys by Singer
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(song.vocal_keys).map(([vocalistId, vKey]) => {
                  const vocalist = members.find(m => m.id === vocalistId);
                  return (
                    <div
                      key={vocalistId}
                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200 text-xs"
                    >
                      <span className="font-semibold text-stone-700 truncate">
                        {vocalist ? vocalist.name : 'Vocalist'}
                      </span>
                      <span className="font-black text-amber-900 px-2 py-0.5 bg-amber-50 rounded-lg">
                        Key {vKey}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Song Notes */}
          {song.song_notes && (
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
              <span className="font-bold text-stone-700 block mb-1">Arrangement / Performance Notes:</span>
              <p className="text-stone-600 leading-relaxed">{song.song_notes}</p>
            </div>
          )}

          {/* Lyrics Preview */}
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Lyrics
            </h3>
            <div className="p-4 rounded-2xl bg-[#F8F5EE] border border-stone-200/80 font-sans text-xs leading-relaxed whitespace-pre-wrap text-stone-700 max-h-64 overflow-y-auto">
              {song.lyrics || 'No lyrics added yet.'}
            </div>
          </div>

          {/* Audit Trail / Accountability */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
            <span>Added by: <strong className="text-stone-600">{song.created_by}</strong></span>
            <span>Last updated by: <strong className="text-stone-600">{song.updated_by}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
