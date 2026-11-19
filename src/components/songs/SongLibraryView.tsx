import React, { useState } from 'react';
import {
  Music2,
  Search,
  Filter,
  Plus,
  Play,
  FileMusic,
  PlusCircle,
  Tag,
  Grid,
  List,
  Sparkles,
  ExternalLink,
  Mic,
  Trash2
} from 'lucide-react';
import { Song } from '../../types';
import { useWorship } from '../../context/WorshipContext';
import { SongDetailModal } from './SongDetailModal';
import { SongEditModal } from './SongEditModal';
import { CategoryManagerModal } from './CategoryManagerModal';
import { AddToLineupModal } from './AddToLineupModal';

const KEYS = ['ALL', 'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

export const SongLibraryView: React.FC = () => {
  const {
    songs,
    categories,
    saveSong,
    deleteSong,
    playVideo,
    openChords,
    members
  } = useWorship();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedKey, setSelectedKey] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [viewingSong, setViewingSong] = useState<Song | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [isManagingCats, setIsManagingCats] = useState(false);
  const [songToAddToLineup, setSongToAddToLineup] = useState<Song | null>(null);

  // Filter songs
  const filteredSongs = songs.filter((s) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || (
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      (s.lyrics && s.lyrics.toLowerCase().includes(q)) ||
      (s.composer && s.composer.toLowerCase().includes(q))
    );
    const matchesCat = selectedCategory === 'ALL' || s.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesKey = selectedKey === 'ALL' || s.original_key === selectedKey;
    return matchesSearch && matchesCat && matchesKey;
  });

  return (
    <div className="space-y-5 pb-20 md:pb-8 max-w-7xl mx-auto">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#181510] border border-[#393027] text-[#E5AF45] shadow-sm">
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#FFF5E6] leading-tight">
                Song Library
              </h1>
              <p className="text-xs text-[#B8ADA0] mt-0.5">
                {songs.length} worship songs cataloged with lyrics, keys, chords & YouTube references
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setIsManagingCats(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#211C17] hover:bg-[#29231C] text-[#FFF5E6] text-xs font-extrabold border border-[#393027] shadow-sm active:scale-[0.98] transition-all group"
          >
            <Tag className="w-4 h-4 text-[#E5AF45] transition-colors" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setIsAddingSong(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#E5AF45] to-[#D69F35] hover:from-[#FFC85C] hover:to-[#E5AF45] text-[#100E0B] text-xs font-black shadow-[0_4px_16px_rgba(229,175,69,0.25)] hover:shadow-[0_6px_22px_rgba(229,175,69,0.38)] active:scale-[0.98] transition-all group cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#100E0B] group-hover:rotate-90 transition-transform duration-200" />
            <span>Add Song</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#211C17] p-4 rounded-3xl border border-[#393027] shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#B8ADA0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, artist, composer or lyrics..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:border-[#E5AF45] focus:outline-none transition-all placeholder:text-[#B8ADA0]/60"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Key Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#181510] px-3 py-1.5 rounded-2xl border border-[#393027] shrink-0">
              <span className="text-[11px] font-bold text-[#B8ADA0]">Key:</span>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#E5AF45] focus:outline-none cursor-pointer"
              >
                {KEYS.map((k) => (
                  <option key={k} value={k} className="bg-[#211C17] text-[#FFF5E6]">
                    {k === 'ALL' ? 'All Keys' : `Key of ${k}`}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#181510] p-1 rounded-2xl border border-[#393027] shrink-0">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'table' ? 'bg-[#E5AF45] text-[#100E0B] shadow-sm font-bold' : 'text-[#B8ADA0] hover:text-[#FFF5E6]'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'grid' ? 'bg-[#E5AF45] text-[#100E0B] shadow-sm font-bold' : 'text-[#B8ADA0] hover:text-[#FFF5E6]'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-[#E5AF45] text-[#100E0B] shadow-sm'
                : 'bg-[#181510] text-[#B8ADA0] border border-[#393027] hover:bg-[#29231C] hover:text-[#FFF5E6]'
            }`}
          >
            All Categories ({songs.length})
          </button>
          {categories.map((c) => {
            const count = songs.filter(s => s.category.toLowerCase() === c.name.toLowerCase()).length;
            const isSelected = selectedCategory.toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#E5AF45] text-[#100E0B] shadow-sm'
                    : 'bg-[#181510] text-[#B8ADA0] border border-[#393027] hover:bg-[#29231C] hover:text-[#FFF5E6]'
                }`}
              >
                {c.name} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Song List Content */}
      {songs.length === 0 ? (
        <div className="bg-[#211C17] rounded-3xl p-12 sm:p-16 text-center border border-[#393027] shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-[#181510] border border-[#393027] text-[#E5AF45] flex items-center justify-center mb-4 shadow-inner">
            <Music2 className="w-8 h-8 text-[#E5AF45]" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#FFF5E6]">Song Library is Empty</h3>
          <p className="text-xs text-[#B8ADA0] mt-1 max-w-md">
            Start building your worship team's central repertoire! Add your church's praise & worship songs with lyrics, chords, original keys, vocal keys, and YouTube references.
          </p>
          <button
            onClick={() => setIsAddingSong(true)}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#E5AF45] hover:bg-[#FFC85C] text-[#100E0B] text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Song</span>
          </button>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="bg-[#211C17] rounded-3xl p-12 text-center border border-[#393027] shadow-sm">
          <Music2 className="w-10 h-10 text-[#B8ADA0]/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#FFF5E6]">No songs found</h3>
          <p className="text-xs text-[#B8ADA0] mt-1 max-w-sm mx-auto">
            Try adjusting your search query, key filter, or category selector.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('ALL');
              setSelectedKey('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-2xl bg-[#29231C] hover:bg-[#393027] text-[#FFF5E6] border border-[#393027] text-xs font-bold transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-[#211C17] rounded-3xl border border-[#393027] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181510] border-b border-[#393027] text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Song Title & Artist</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Original Key</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Tempo / Time</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Vocal Keys</th>
                  <th className="py-3.5 px-4 text-right pr-4 sm:pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#393027]">
                {filteredSongs.map((song) => {
                  const vocalKeysCount = Object.keys(song.vocal_keys || {}).length;

                  return (
                    <tr
                      key={song.id}
                      onClick={() => setViewingSong(song)}
                      className="hover:bg-[#29231C] transition-colors cursor-pointer group"
                    >
                      {/* Title & Artist */}
                      <td className="py-3 px-4 sm:px-6">
                        <div className="font-bold text-[#FFF5E6] group-hover:text-[#E5AF45] text-xs sm:text-sm">
                          {song.title}
                        </div>
                        <div className="text-[11px] text-[#B8ADA0] font-medium flex items-center gap-2">
                          <span>{song.artist}</span>
                          {song.created_by && (
                            <span className="text-[10px] text-[#E5AF45] bg-[#100E0B] px-1.5 py-0.2 rounded border border-[#E5AF45]/30">
                              Added by {song.created_by.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#29231C] text-[#E5AF45] border border-[#393027] text-[10px] font-bold tracking-wider uppercase">
                          {song.category}
                        </span>
                      </td>

                      {/* Original Key */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block font-black text-[#E5AF45] px-2 py-0.5 bg-[#100E0B] rounded-lg border border-[#E5AF45]/60">
                          {song.original_key}
                        </span>
                      </td>

                      {/* Tempo / Time */}
                      <td className="py-3 px-4 hidden sm:table-cell text-[#B8ADA0] font-medium text-[11px]">
                        {song.tempo_bpm ? `${song.tempo_bpm} BPM` : '—'} • {song.time_signature || '4/4'}
                      </td>

                      {/* Vocal Keys count */}
                      <td className="py-3 px-4 hidden md:table-cell">
                        {vocalKeysCount > 0 ? (
                          <div className="flex items-center gap-1 text-[11px] text-[#E5AF45] font-semibold">
                            <Mic className="w-3.5 h-3.5" />
                            <span>{vocalKeysCount} key{vocalKeysCount > 1 ? 's' : ''} mapped</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#B8ADA0]/60">Default key</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 pr-4 sm:pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Play Video Button */}
                          {song.youtube_url && (
                            <button
                              onClick={() => playVideo(song.title, song.youtube_url!)}
                              className="w-7 h-7 rounded-full border border-[#E5AF45]/60 text-[#E5AF45] hover:bg-[#E5AF45] hover:text-[#100E0B] flex items-center justify-center transition-all shadow-sm"
                              title="Play Video"
                            >
                              <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                            </button>
                          )}

                          {/* Chords / Transpose Button */}
                          <button
                            onClick={() => openChords(song)}
                            className="w-7 h-7 rounded-full bg-[#29231C] border border-[#393027] hover:bg-[#E5AF45] text-[#FFF5E6] hover:text-[#100E0B] flex items-center justify-center transition-all shadow-sm"
                            title="View Chords & Transpose"
                          >
                            <FileMusic className="w-3.5 h-3.5" />
                          </button>

                          {/* Add to Lineup */}
                          <button
                            onClick={() => setSongToAddToLineup(song)}
                            className="w-7 h-7 rounded-full bg-[#29231C] border border-[#393027] hover:bg-[#E5AF45] text-[#FFF5E6] hover:text-[#100E0B] flex items-center justify-center transition-all shadow-sm"
                            title="Add to Lineup"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Song */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${song.title}" from the song library?`)) {
                                deleteSong(song.id);
                              }
                            }}
                            className="w-7 h-7 rounded-full bg-red-950/30 hover:bg-[#E57373] text-[#E57373] hover:text-[#100E0B] flex items-center justify-center transition-all border border-[#E57373]/30 shadow-sm"
                            title="Delete Song from Library"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map((song) => (
            <div
              key={song.id}
              onClick={() => setViewingSong(song)}
              className="bg-[#211C17] p-5 rounded-3xl border border-[#393027] hover:border-[#E5AF45]/50 shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-lg bg-[#29231C] text-[#E5AF45] border border-[#393027] text-[10px] font-bold tracking-wider uppercase">
                    {song.category}
                  </span>
                  <span className="text-xs font-black text-[#E5AF45] px-2 py-0.5 bg-[#100E0B] rounded-lg border border-[#E5AF45]/60">
                    Key {song.original_key}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#FFF5E6] group-hover:text-[#E5AF45]">
                  {song.title}
                </h3>
                <p className="text-xs text-[#B8ADA0] font-medium mt-0.5">
                  {song.artist}
                </p>
                {song.created_by && (
                  <span className="inline-block mt-1 text-[10px] text-[#E5AF45] bg-[#100E0B] px-2 py-0.5 rounded-full border border-[#E5AF45]/40 font-semibold">
                    Added by {song.created_by.split(' ')[0]}
                  </span>
                )}

                {song.song_notes && (
                  <p className="text-[11px] text-[#B8ADA0] mt-2 line-clamp-2 italic">
                    "{song.song_notes}"
                  </p>
                )}
              </div>

              {/* Bottom Card Controls */}
              <div className="pt-4 mt-3 border-t border-[#393027] flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <span className="text-[11px] text-[#B8ADA0] font-medium">
                  {song.tempo_bpm ? `${song.tempo_bpm} BPM` : '4/4'}
                </span>

                <div className="flex items-center gap-1.5">
                  {song.youtube_url && (
                    <button
                      onClick={() => playVideo(song.title, song.youtube_url!)}
                      className="w-7 h-7 rounded-full border border-[#E5AF45]/60 text-[#E5AF45] hover:bg-[#E5AF45] hover:text-[#100E0B] flex items-center justify-center transition-all shadow-sm"
                      title="Play Reference"
                    >
                      <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                    </button>
                  )}

                  <button
                    onClick={() => openChords(song)}
                    className="p-1.5 rounded-full bg-[#29231C] border border-[#393027] hover:bg-[#E5AF45] text-[#FFF5E6] hover:text-[#100E0B] transition-all shadow-sm"
                    title="Chords & Lyrics"
                  >
                    <FileMusic className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setSongToAddToLineup(song)}
                    className="p-1.5 rounded-full bg-[#29231C] border border-[#393027] hover:bg-[#E5AF45] text-[#FFF5E6] hover:text-[#100E0B] transition-all shadow-sm"
                    title="Add to Lineup"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Song */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${song.title}" from the song library?`)) {
                        deleteSong(song.id);
                      }
                    }}
                    className="p-1.5 rounded-full bg-red-950/30 hover:bg-[#E57373] text-[#E57373] hover:text-[#100E0B] transition-all shadow-sm border border-[#E57373]/30"
                    title="Delete Song from Library"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {viewingSong && (
        <SongDetailModal
          song={viewingSong}
          onClose={() => setViewingSong(null)}
          onEdit={(s) => {
            setViewingSong(null);
            setEditingSong(s);
          }}
          onDelete={(id) => deleteSong(id)}
          onAddToLineup={(s) => {
            setViewingSong(null);
            setSongToAddToLineup(s);
          }}
        />
      )}

      {(isAddingSong || editingSong) && (
        <SongEditModal
          song={editingSong}
          onClose={() => {
            setIsAddingSong(false);
            setEditingSong(null);
          }}
          onSave={(s) => {
            saveSong(s);
            setIsAddingSong(false);
            setEditingSong(null);
          }}
        />
      )}

      {isManagingCats && (
        <CategoryManagerModal onClose={() => setIsManagingCats(false)} />
      )}

      {songToAddToLineup && (
        <AddToLineupModal
          song={songToAddToLineup}
          onClose={() => setSongToAddToLineup(null)}
        />
      )}
    </div>
  );
};
