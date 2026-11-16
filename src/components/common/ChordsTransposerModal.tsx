import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Printer,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Music,
  Share2,
  ChevronUp,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';

const SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALE_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function transposeChord(chord: string, semitones: number): string {
  return chord.replace(/[A-G][#b]?/g, (root) => {
    let index = SCALE.indexOf(root);
    if (index === -1) {
      index = SCALE_FLATS.indexOf(root);
    }
    if (index === -1) return root;

    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;
    return SCALE[newIndex];
  });
}

function transposeText(text: string, semitones: number): string {
  if (semitones === 0) return text;
  // Match chord lines or chord tokens inside brackets or lines with mostly chords
  return text.split('\n').map(line => {
    // If line has brackets like [Verse 1] or [Chorus], keep it
    if (/^\[.*\]$/.test(line.trim())) {
      return line;
    }
    // Transpose chords in chord-heavy lines
    const isChordLine = line.trim().split(/\s+/).every(token => 
      /^[A-G][#b]?(m|maj|min|sus|dim|aug|add)?[0-9]?(\/[A-G][#b]?)?$/.test(token)
    );
    if (isChordLine) {
      return line.replace(/[A-G][#b]?(m|maj|min|sus|dim|aug|add)?[0-9]?(\/[A-G][#b]?)?/g, (token) => {
        const parts = token.split('/');
        const transposedRoot = transposeChord(parts[0], semitones);
        if (parts.length > 1) {
          const transposedBass = transposeChord(parts[1], semitones);
          return `${transposedRoot}/${transposedBass}`;
        }
        return transposedRoot;
      });
    }
    return line;
  }).join('\n');
}

export const ChordsTransposerModal: React.FC = () => {
  const { activeSongChords, closeChords, members } = useWorship();
  const [semitones, setSemitones] = useState(0);
  const [fontSize, setFontSize] = useState(14);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSemitones(0);
    setIsAutoScrolling(false);
  }, [activeSongChords]);

  // Auto-scroll loop
  useEffect(() => {
    if (!isAutoScrolling) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop += scrollSpeed;
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isAutoScrolling, scrollSpeed]);

  if (!activeSongChords) return null;

  const currentKey = transposeChord(activeSongChords.original_key, semitones);
  const displayedChords = transposeText(activeSongChords.chords || activeSongChords.lyrics, semitones);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      onClick={closeChords}
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full h-[90vh] flex flex-col shadow-modal border border-stone-200 animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-[#FAF6F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#EDE4D5] text-[#1F1E1D] font-bold text-[10px] tracking-wider uppercase">
                {activeSongChords.category}
              </span>
              <span className="text-xs text-stone-500">
                {activeSongChords.tempo_bpm ? `${activeSongChords.tempo_bpm} BPM • ` : ''}
                {activeSongChords.time_signature || '4/4'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 mt-1">
              {activeSongChords.title}
            </h2>
            <p className="text-xs text-stone-500">{activeSongChords.artist}</p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Key Transpose Control */}
            <div className="flex items-center bg-white rounded-xl border border-stone-300 p-1 shadow-2xs">
              <span className="text-[11px] font-bold px-2 text-stone-600">Key:</span>
              <span className="text-xs font-black text-amber-900 px-1.5 py-0.5 bg-amber-50 rounded-lg min-w-7 text-center">
                {currentKey}
              </span>
              <div className="flex items-center border-l border-stone-200 ml-1.5 pl-1 gap-0.5">
                <button
                  onClick={() => setSemitones(s => s - 1)}
                  className="p-1 hover:bg-stone-100 rounded text-stone-600"
                  title="Transpose Down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSemitones(0)}
                  className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-700"
                  title="Reset to Original Key"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setSemitones(s => s + 1)}
                  className="p-1 hover:bg-stone-100 rounded text-stone-600"
                  title="Transpose Up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Font Size Adjuster */}
            <div className="flex items-center bg-white rounded-xl border border-stone-300 p-1 shadow-2xs">
              <button
                onClick={() => setFontSize(f => Math.max(11, f - 1))}
                className="p-1 hover:bg-stone-100 rounded text-stone-600"
                title="Decrease Font Size"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-semibold px-1.5 text-stone-600">{fontSize}px</span>
              <button
                onClick={() => setFontSize(f => Math.min(22, f + 1))}
                className="p-1 hover:bg-stone-100 rounded text-stone-600"
                title="Increase Font Size"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Auto-Scroll Toggle */}
            <button
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition-all ${
                isAutoScrolling
                  ? 'bg-amber-800 text-white border-amber-900'
                  : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {isAutoScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoScrolling ? 'Pause' : 'Auto-Scroll'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 shadow-2xs"
              title="Print Chord Chart"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={closeChords}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Vocal Keys Notice Banner */}
        {Object.keys(activeSongChords.vocal_keys || {}).length > 0 && (
          <div className="px-5 py-2.5 bg-amber-50/70 border-b border-amber-200/60 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="font-bold text-amber-900 shrink-0">Assigned Vocal Keys:</span>
            <div className="flex items-center gap-2 shrink-0">
              {Object.entries(activeSongChords.vocal_keys).map(([vocalistId, vKey]) => {
                const member = members.find(m => m.id === vocalistId);
                return (
                  <span
                    key={vocalistId}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-amber-200 text-stone-800 font-medium"
                  >
                    <span>{member ? member.name.split(' ')[0] : 'Vocalist'}:</span>
                    <strong className="text-amber-800 font-bold">{vKey}</strong>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Chords Content Body */}
        <div
          ref={scrollRef}
          className="flex-1 p-6 overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed select-text"
          style={{ fontSize: `${fontSize}px` }}
        >
          {displayedChords}
        </div>

        {/* Bottom Status */}
        <div className="px-5 py-2 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-[11px] text-stone-400">
          <span>Beholding Jesus Worship Team • Setlist Chords</span>
          {semitones !== 0 && (
            <span className="text-amber-700 font-semibold">
              Transposed {semitones > 0 ? `+${semitones}` : semitones} semitone(s) from original ({activeSongChords.original_key})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
