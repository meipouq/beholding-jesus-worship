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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      onClick={closeChords}
    >
      <div
        className="bg-[#1F1F21] rounded-3xl max-w-3xl w-full h-[90vh] flex flex-col shadow-2xl border border-[#35312B] text-[#F5F0E6] animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#35312B] bg-[#161616] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#262626] text-[#D9A441] border border-[#35312B] font-bold text-[10px] tracking-wider uppercase">
                {activeSongChords.category}
              </span>
              <span className="text-xs text-[#AAA5A0]">
                {activeSongChords.tempo_bpm ? `${activeSongChords.tempo_bpm} BPM • ` : ''}
                {activeSongChords.time_signature || '4/4'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#F5F0E6] mt-1">
              {activeSongChords.title}
            </h2>
            <p className="text-xs text-[#AAA5A0]">{activeSongChords.artist}</p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Key Transpose Control */}
            <div className="flex items-center bg-[#1F1F21] rounded-xl border border-[#35312B] p-1 shadow-2xs">
              <span className="text-[11px] font-bold px-2 text-[#AAA5A0]">Key:</span>
              <span className="text-xs font-black text-[#101010] px-1.5 py-0.5 bg-[#D9A441] rounded-lg min-w-7 text-center">
                {currentKey}
              </span>
              <div className="flex items-center border-l border-[#35312B] ml-1.5 pl-1 gap-0.5">
                <button
                  onClick={() => setSemitones(s => s - 1)}
                  className="p-1 hover:bg-[#262626] rounded text-[#AAA5A0] hover:text-[#F5F0E6]"
                  title="Transpose Down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSemitones(0)}
                  className="p-1 hover:bg-[#262626] rounded text-[#AAA5A0]/60 hover:text-[#D9A441]"
                  title="Reset to Original Key"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setSemitones(s => s + 1)}
                  className="p-1 hover:bg-[#262626] rounded text-[#AAA5A0] hover:text-[#F5F0E6]"
                  title="Transpose Up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Font Size Adjuster */}
            <div className="flex items-center bg-[#1F1F21] rounded-xl border border-[#35312B] p-1 shadow-2xs">
              <button
                onClick={() => setFontSize(f => Math.max(11, f - 1))}
                className="p-1 hover:bg-[#262626] rounded text-[#AAA5A0] hover:text-[#F5F0E6]"
                title="Decrease Font Size"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-semibold px-1.5 text-[#F5F0E6]">{fontSize}px</span>
              <button
                onClick={() => setFontSize(f => Math.min(22, f + 1))}
                className="p-1 hover:bg-[#262626] rounded text-[#AAA5A0] hover:text-[#F5F0E6]"
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
                  ? 'bg-[#D9A441] text-[#101010] border-[#D9A441]'
                  : 'bg-[#1F1F21] border-[#35312B] text-[#AAA5A0] hover:text-[#F5F0E6] hover:bg-[#262626]'
              }`}
            >
              {isAutoScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoScrolling ? 'Pause' : 'Auto-Scroll'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-[#1F1F21] border border-[#35312B] hover:bg-[#262626] text-[#AAA5A0] hover:text-[#F5F0E6] shadow-2xs"
              title="Print Chord Chart"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={closeChords}
              className="p-2 rounded-xl text-[#AAA5A0] hover:text-[#F5F0E6] hover:bg-[#262626]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Vocal Keys Notice Banner */}
        {Object.keys(activeSongChords.vocal_keys || {}).length > 0 && (
          <div className="px-5 py-2.5 bg-[#161616] border-b border-[#35312B] flex items-center gap-2 overflow-x-auto text-xs">
            <span className="font-bold text-[#D9A441] shrink-0">Assigned Vocal Keys:</span>
            <div className="flex items-center gap-2 shrink-0">
              {Object.entries(activeSongChords.vocal_keys).map(([vocalistId, vKey]) => {
                const member = members.find(m => m.id === vocalistId);
                return (
                  <span
                    key={vocalistId}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1F1F21] border border-[#35312B] text-[#F5F0E6] font-medium"
                  >
                    <span>{member ? member.name.split(' ')[0] : 'Vocalist'}:</span>
                    <strong className="text-[#D9A441] font-bold">{vKey}</strong>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Chords Content Body */}
        <div
          ref={scrollRef}
          className="flex-1 p-6 overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed select-text bg-[#101010] text-[#F5F0E6]"
          style={{ fontSize: `${fontSize}px` }}
        >
          {displayedChords}
        </div>

        {/* Bottom Status */}
        <div className="px-5 py-2 border-t border-[#35312B] bg-[#161616] flex items-center justify-between text-[11px] text-[#AAA5A0]">
          <span>Beholding Jesus Worship Team • Setlist Chords</span>
          {semitones !== 0 && (
            <span className="text-[#D9A441] font-semibold">
              Transposed {semitones > 0 ? `+${semitones}` : semitones} semitone(s) from original ({activeSongChords.original_key})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
