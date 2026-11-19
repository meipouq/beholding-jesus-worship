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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#211C17] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#393027] animate-slide-up overflow-hidden text-[#FFF5E6]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#393027] bg-[#181510] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#29231C] text-[#E5AF45] border border-[#393027] text-[11px] font-bold uppercase tracking-wider">
                {song.category}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#100E0B] text-[#E5AF45] border border-[#E5AF45]/50">
                Key of {song.original_key}
              </span>
              {song.tempo_bpm && (
                <span className="text-xs text-[#B8ADA0] font-medium">
                  {song.tempo_bpm} BPM • {song.time_signature || '4/4'}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#FFF5E6] mt-1.5">
              {song.title}
            </h2>
            <p className="text-xs text-[#B8ADA0] font-medium">
              By {song.artist} {song.composer ? `• Comp: ${song.composer}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(song)}
              className="p-2 rounded-xl text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C] transition-colors"
              title="Edit Song"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl text-[#B8ADA0] hover:text-[#E57373] hover:bg-red-950/30 transition-colors"
              title="Delete Song"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-[#FFF5E6]">
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {song.youtube_url && (
              <button
                onClick={() => playVideo(song.title, song.youtube_url!)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-red-950/40 border border-red-800/40 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold transition-all shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Reference</span>
              </button>
            )}

            <button
              onClick={() => openChords(song)}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#E5AF45] hover:bg-[#FFC85C] text-[#100E0B] text-xs font-bold transition-all shadow-sm"
            >
              <FileMusic className="w-3.5 h-3.5" />
              <span>Chords & Transpose</span>
            </button>

            <button
              onClick={() => onAddToLineup(song)}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#29231C] hover:bg-[#393027] text-[#FFF5E6] text-xs font-bold transition-all border border-[#393027] col-span-2 sm:col-span-1 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#E5AF45]" />
              <span>Add to Lineup</span>
            </button>
          </div>

          {/* Vocal Keys Assignment Matrix */}
          {Object.keys(song.vocal_keys || {}).length > 0 && (
            <div className="p-4 rounded-2xl bg-[#181510] border border-[#393027]">
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-4 h-4 text-[#E5AF45]" />
                <h3 className="text-xs font-bold text-[#FFF5E6] uppercase tracking-wider">
                  Vocal Keys by Singer
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(song.vocal_keys).map(([vocalistId, vKey]) => {
                  const vocalist = members.find(m => m.id === vocalistId);
                  return (
                    <div
                      key={vocalistId}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#211C17] border border-[#393027] text-xs"
                    >
                      <span className="font-semibold text-[#FFF5E6] truncate">
                        {vocalist ? vocalist.name : 'Vocalist'}
                      </span>
                      <span className="font-black text-[#E5AF45] px-2 py-0.5 bg-[#100E0B] rounded-lg border border-[#E5AF45]/40">
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
            <div className="p-3.5 rounded-2xl bg-[#181510] border border-[#393027] text-xs">
              <span className="font-bold text-[#E5AF45] block mb-1">Arrangement / Performance Notes:</span>
              <p className="text-[#B8ADA0] leading-relaxed">{song.song_notes}</p>
            </div>
          )}

          {/* Lyrics Preview */}
          <div>
            <h3 className="text-xs font-bold text-[#B8ADA0] uppercase tracking-wider mb-2">
              Lyrics
            </h3>
            <div className="p-4 rounded-2xl bg-[#181510] border border-[#393027] font-sans text-xs leading-relaxed whitespace-pre-wrap text-[#FFF5E6] max-h-64 overflow-y-auto">
              {song.lyrics || 'No lyrics added yet.'}
            </div>
          </div>

          {/* Audit Trail / Accountability */}
          <div className="pt-2 border-t border-[#393027] flex items-center justify-between text-[11px] text-[#B8ADA0]">
            <span>Added by: <strong className="text-[#FFF5E6]">{song.created_by}</strong></span>
            <span>Last updated by: <strong className="text-[#FFF5E6]">{song.updated_by}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
