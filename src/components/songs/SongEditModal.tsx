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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-modal border border-stone-200 animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-100 bg-[#FAF6F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-amber-800" />
            <h2 className="text-lg font-bold text-stone-900">
              {song ? 'Edit Worship Song' : 'Add New Worship Song'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Duplicate Song Warning Banner */}
          {duplicate && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">Possible Duplicate Song Detected</h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  A song named <strong>"{duplicate.title}"</strong> by <strong>{duplicate.artist}</strong> is already in the library ({duplicate.category}, Key {duplicate.original_key}). You can still save if this is a different arrangement.
                </p>
              </div>
            </div>
          )}

          {/* Title & Artist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Song Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ang Lahat Ay Magsasaya"
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Artist / Original Performer *
              </label>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Malayang Pilipino / Praise Classic"
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          {/* Category & Key & Tempo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Original Key *
              </label>
              <select
                value={originalKey}
                onChange={(e) => setOriginalKey(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white font-bold"
              >
                {KEYS.map((k) => (
                  <option key={k} value={k}>
                    Key of {k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Tempo (BPM)
              </label>
              <input
                type="number"
                value={tempoBpm || ''}
                onChange={(e) => setTempoBpm(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="120"
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Time Signature
              </label>
              <select
                value={timeSignature}
                onChange={(e) => setTimeSignature(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
              >
                <option value="4/4">4/4</option>
                <option value="3/4">3/4</option>
                <option value="6/8">6/8</option>
                <option value="2/4">2/4</option>
              </select>
            </div>
          </div>

          {/* Links (YouTube & Spotify) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                YouTube Reference Link
              </label>
              <div className="relative flex items-center">
                <Video className="w-4 h-4 text-red-600 absolute left-3 pointer-events-none" />
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full text-xs pl-9 pr-3 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Composer / Genre (Optional)
              </label>
              <input
                type="text"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                placeholder="e.g. Tagalog Praise / Contemporary"
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          {/* Individual Vocalist Keys Section (Core Feature C) */}
          <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8E2D7] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-amber-800" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Individual Vocal Keys by Singer
                </h3>
              </div>
              <span className="text-[10px] text-stone-500">
                Independent of Original Key ({originalKey})
              </span>
            </div>
            <p className="text-[11px] text-stone-600">
              Assign specific keys for each singer for this song. Changing one key will not alter other singers' keys.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {members.filter(m => m.vocal_range !== 'Instrumentalist').map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="w-6 h-6 rounded-full bg-[#1E1D1B] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {member.name[0]}
                    </span>
                    <span className="truncate font-semibold text-stone-800">
                      {member.name} ({member.vocal_range})
                    </span>
                  </div>

                  <select
                    value={vocalKeys[member.id] || ''}
                    onChange={(e) => handleVocalKeyChange(member.id, e.target.value)}
                    className="text-xs font-bold p-1 rounded-lg border border-stone-300 bg-amber-50/50 text-amber-900"
                  >
                    <option value="">Default ({originalKey})</option>
                    {KEYS.map((k) => (
                      <option key={k} value={k}>
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
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Chords & Lead Sheet
              </label>
              <textarea
                rows={7}
                value={chords}
                onChange={(e) => setChords(e.target.value)}
                placeholder="[Verse 1]&#10;G             C&#10;Ang lahat ay magsasaya..."
                className="w-full text-xs font-mono p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Lyrics (Formatted by Verse / Chorus)
              </label>
              <textarea
                rows={7}
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="[Verse 1]&#10;Ang lahat ay magsasaya&#10;Papurihan ang Diyos Ama..."
                className="w-full text-xs font-sans p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Song & Arrangement Notes
            </label>
            <input
              type="text"
              value={songNotes}
              onChange={(e) => setSongNotes(e.target.value)}
              placeholder="e.g. Build up drums on bridge, transition smoothly into next song"
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#1E1D1B] hover:bg-stone-800 text-white transition-colors shadow-sm"
            >
              {song ? 'Update Song' : 'Add to Song Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
