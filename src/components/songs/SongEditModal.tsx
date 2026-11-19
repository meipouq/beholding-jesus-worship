import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Plus, Trash2, Mic, Music, Video } from 'lucide-react';
import { Song, SongCategory } from '../../types';
import { useWorship } from '../../context/WorshipContext';

const KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
];

interface SongEditModalProps {
  song: Song | null;
  onClose: () => void;
  onSave: (song: Song) => void;
}

export const SongEditModal: React.FC<SongEditModalProps> = ({
  song,
  onClose,
  onSave
}) => {
  const { categories, members, checkDuplicateSong, currentUser } = useWorship();

  const [title, setTitle] = useState(song ? song.title : '');
  const [artist, setArtist] = useState(song ? song.artist : '');
  const [composer, setComposer] = useState(song?.composer || '');
  const [genre, setGenre] = useState(song?.genre || '');
  const [category, setCategory] = useState(song ? song.category : (categories[0]?.name || 'Joyful'));
  const [originalKey, setOriginalKey] = useState(song ? song.original_key : 'G');
  const [tempoBpm, setTempoBpm] = useState<number | undefined>(song?.tempo_bpm);
  const [timeSignature, setTimeSignature] = useState(song?.time_signature || '4/4');
  const [youtubeUrl, setYoutubeUrl] = useState(song?.youtube_url || '');
  const [spotifyUrl, setSpotifyUrl] = useState(song?.spotify_url || '');
  const [lyrics, setLyrics] = useState(song?.lyrics || '');
  const [chords, setChords] = useState(song?.chords || '');
  const [songNotes, setSongNotes] = useState(song?.song_notes || '');
  const [vocalKeys, setVocalKeys] = useState<Record<string, string>>(song?.vocal_keys || {});

  // Duplicate warning
  const duplicate = title ? checkDuplicateSong(title, artist, song?.id) : undefined;

  const handleVocalKeyChange = (vocalistId: string, key: string) => {
    if (!key) {
      const next = { ...vocalKeys };
      delete next[vocalistId];
      setVocalKeys(next);
    } else {
      setVocalKeys({
        ...vocalKeys,
        [vocalistId]: key
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    const newSong: Song = {
      id: song ? song.id : `song-${Date.now()}`,
      title: title.trim(),
      artist: artist.trim(),
      composer: composer.trim() || undefined,
      genre: genre.trim() || undefined,
      category,
      original_key: originalKey,
      tempo_bpm: tempoBpm ? Number(tempoBpm) : undefined,
      time_signature: timeSignature,
      youtube_url: youtubeUrl.trim() || undefined,
      spotify_url: spotifyUrl.trim() || undefined,
      lyrics: lyrics.trim(),
      chords: chords.trim() || undefined,
      song_notes: songNotes.trim() || undefined,
      vocal_keys: vocalKeys,
      created_by: song ? song.created_by : currentUser.name,
      updated_by: currentUser.name,
      created_at: song ? song.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(newSong);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#211C17] rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#393027] animate-slide-up overflow-hidden text-[#FFF5E6]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#393027] bg-[#181510] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-[#E5AF45]" />
            <h2 className="text-lg font-bold text-[#FFF5E6]">
              {song ? 'Edit Worship Song' : 'Add New Worship Song'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Duplicate Song Warning Banner */}
          {duplicate && (
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#FFC85C] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#FFC85C]">Possible Duplicate Song Detected</h4>
                <p className="text-[11px] text-[#FFF5E6]/90 mt-0.5">
                  A song named <strong>"{duplicate.title}"</strong> by <strong>{duplicate.artist}</strong> is already in the library ({duplicate.category}, Key {duplicate.original_key}). You can still save if this is a different arrangement.
                </p>
              </div>
            </div>
          )}

          {/* Title & Artist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Song Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ang Lahat Ay Magsasaya"
                className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none focus:border-[#E5AF45]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Artist / Original Performer *
              </label>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Malayang Pilipino / Praise Classic"
                className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none focus:border-[#E5AF45]"
              />
            </div>
          </div>

          {/* Category & Key & Tempo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:outline-none focus:border-[#E5AF45]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name} className="bg-[#211C17] text-[#FFF5E6]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Original Key *
              </label>
              <select
                value={originalKey}
                onChange={(e) => setOriginalKey(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#E5AF45] focus:outline-none focus:border-[#E5AF45] font-bold"
              >
                {KEYS.map((k) => (
                  <option key={k} value={k} className="bg-[#211C17] text-[#E5AF45]">
                    Key of {k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Tempo (BPM)
              </label>
              <input
                type="number"
                value={tempoBpm || ''}
                onChange={(e) => setTempoBpm(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="120"
                className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none focus:border-[#E5AF45]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Time Signature
              </label>
              <select
                value={timeSignature}
                onChange={(e) => setTimeSignature(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:outline-none focus:border-[#E5AF45]"
              >
                <option value="4/4" className="bg-[#211C17] text-[#FFF5E6]">4/4</option>
                <option value="3/4" className="bg-[#211C17] text-[#FFF5E6]">3/4</option>
                <option value="6/8" className="bg-[#211C17] text-[#FFF5E6]">6/8</option>
                <option value="2/4" className="bg-[#211C17] text-[#FFF5E6]">2/4</option>
              </select>
            </div>
          </div>

          {/* Links (YouTube & Spotify) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                YouTube Reference Link
              </label>
              <div className="relative flex items-center">
                <Video className="w-4 h-4 text-red-500 absolute left-3 pointer-events-none" />
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full text-xs pl-9 pr-3 py-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none focus:border-[#E5AF45]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Composer / Genre (Optional)
              </label>
              <input
                type="text"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                placeholder="e.g. Tagalog Praise / Contemporary"
                className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none focus:border-[#E5AF45]"
              />
            </div>
          </div>

          {/* Individual Vocalist Keys Section */}
          <div className="p-4 rounded-2xl bg-[#181510] border border-[#393027] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#E5AF45]" />
                <h3 className="text-xs font-bold text-[#FFF5E6] uppercase tracking-wider">
                  Individual Vocal Keys by Singer
                </h3>
              </div>
              <span className="text-[10px] text-[#B8ADA0]">
                Independent of Original Key ({originalKey})
              </span>
            </div>
            <p className="text-[11px] text-[#B8ADA0]">
              Assign specific keys for each singer for this song. Changing one key will not alter other singers' keys.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {members.filter(m => m.vocal_range !== 'Instrumentalist').map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#211C17] border border-[#393027] text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="w-6 h-6 rounded-full bg-[#100E0B] text-[#E5AF45] border border-[#E5AF45]/40 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {member.name[0]}
                    </span>
                    <span className="truncate font-semibold text-[#FFF5E6]">
                      {member.name} ({member.vocal_range})
                    </span>
                  </div>

                  <select
                    value={vocalKeys[member.id] || ''}
                    onChange={(e) => handleVocalKeyChange(member.id, e.target.value)}
                    className="text-xs font-bold p-1 rounded-lg border border-[#E5AF45]/50 bg-[#100E0B] text-[#E5AF45]"
                  >
                    <option value="" className="bg-[#211C17] text-[#B8ADA0]">Default ({originalKey})</option>
                    {KEYS.map((k) => (
                      <option key={k} value={k} className="bg-[#211C17] text-[#E5AF45]">
                        Key of {k}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Chords & Lyrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Chords & Lead Sheet
              </label>
              <textarea
                rows={7}
                value={chords}
                onChange={(e) => setChords(e.target.value)}
                placeholder="[Verse 1]&#10;G             C&#10;Ang lahat ay magsasaya..."
                className="w-full text-xs font-mono p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none focus:border-[#E5AF45]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Lyrics (Formatted by Verse / Chorus)
              </label>
              <textarea
                rows={7}
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="[Verse 1]&#10;Ang lahat ay magsasaya&#10;Papurihan ang Diyos Ama..."
                className="w-full text-xs font-sans p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none focus:border-[#E5AF45]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
              Song & Arrangement Notes
            </label>
            <input
              type="text"
              value={songNotes}
              onChange={(e) => setSongNotes(e.target.value)}
              placeholder="e.g. Build up drums on bridge, transition smoothly into next song"
              className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none focus:border-[#E5AF45]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#393027] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#E5AF45] hover:bg-[#FFC85C] text-[#100E0B] transition-colors shadow-sm"
            >
              {song ? 'Update Song' : 'Add to Song Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
