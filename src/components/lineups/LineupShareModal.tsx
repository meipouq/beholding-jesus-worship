import React, { useState, useRef } from 'react';
import {
  X,
  Share2,
  Download,
  Check,
  Image as ImageIcon,
  MessageCircle,
  Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { ServiceLineup } from '../../types';

interface LineupShareModalProps {
  lineup: ServiceLineup;
  onClose: () => void;
}

export const LineupShareModal: React.FC<LineupShareModalProps> = ({ lineup, onClose }) => {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [themeMode, setThemeMode] = useState<'dark' | 'warm'>('dark');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const isLandscape = orientation === 'landscape';
  const isDark = themeMode === 'dark';

  // Helper to format date nicely
  const formatHeroDate = (dateStr?: string): string => {
    if (!dateStr) return 'Upcoming Service';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, monthIndex, day);
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatHeroDate(lineup.service_date);
  const totalSongsCount = lineup.songs?.length || 0;
  const isPublished = lineup.status === 'published';

  // Group songs dynamically into categories (e.g. JOYFUL, SOLEMN)
  const categorizedSongs: { [category: string]: typeof lineup.songs } = {};
  if (lineup.songs && lineup.songs.length > 0) {
    lineup.songs.forEach((song) => {
      const cat = (song.category || 'JOYFUL').trim().toUpperCase();
      if (!categorizedSongs[cat]) {
        categorizedSongs[cat] = [];
      }
      categorizedSongs[cat].push(song);
    });
  }

  // Generate formatted text for Messenger / SMS
  const generateMessengerText = () => {
    let text = `✝️ BEHOLDING JESUS – WORSHIP TEAM\n`;
    text += `📋 ${lineup.title.toUpperCase()}\n`;
    text += `🗓️ ${formattedDate || lineup.service_date} • ${lineup.service_time}\n`;
    if (lineup.theme) {
      text += `✨ Theme: "${lineup.theme}"\n`;
    }
    text += `\n🎤 Worship Leader: ${lineup.worship_leader_name}\n`;
    if (lineup.assigned_vocalists && lineup.assigned_vocalists.length > 0) {
      text += `👥 Vocal Team: ${lineup.assigned_vocalists.map(v => v.name).join(', ')}\n`;
    }
    if (lineup.assigned_musicians && lineup.assigned_musicians.length > 0) {
      text += `🎸 Band: ${lineup.assigned_musicians.map(m => `${m.name} (${m.instrument})`).join(', ')}\n`;
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🎵 WORSHIP SERVICE SETLIST:\n`;

    let songNum = 1;
    Object.entries(categorizedSongs).forEach(([category, songsList]) => {
      text += `\n[ ${category} ]\n`;
      (songsList || []).forEach((s) => {
        const key = s.selected_key || s.original_key;
        text += `${songNum}. ${s.title} (Key ${key})`;
        if (s.assigned_vocalist_name) {
          text += ` — ${s.assigned_vocalist_name}`;
        }
        text += `\n`;
        if (s.youtube_url) {
          text += `   ▶️ ${s.youtube_url}\n`;
        }
        if (s.notes) {
          text += `   📝 Note: ${s.notes}\n`;
        }
        songNum++;
      });
    });

    if (lineup.notes) {
      text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      text += `📌 REMINDERS / CALL TIME:\n${lineup.notes}\n`;
    }

    text += `\n"Let everything that has breath praise the LORD." — Psalm 150:6\n`;
    text += `✨ For His Glory!\n`;

    return text;
  };

  const handleCopyText = async () => {
    try {
      const text = generateMessengerText();
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.error('Copy text failed:', err);
    }
  };

  // Render high-res PNG image from cardRef
  const generateCanvas = async () => {
    if (!cardRef.current) return null;
    return await html2canvas(cardRef.current, {
      scale: 3, // Ultra-sharp 3x resolution for high-DPI clarity
      useCORS: true,
      allowTaint: true,
      backgroundColor: isDark ? '#18181B' : '#FAF6F0',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: cardRef.current.scrollWidth,
      windowHeight: cardRef.current.scrollHeight
    });
  };

  // Download Photo
  const handleDownloadPhoto = async () => {
    try {
      setIsExporting(true);
      const canvas = await generateCanvas();
      if (!canvas) return;

      const image = canvas.toDataURL('image/png');
      const filename = `Beholding_Jesus_Setlist_${isLandscape ? 'Landscape_' : ''}${lineup.service_date.replace(/-/g, '_')}.png`;

      const link = document.createElement('a');
      link.href = image;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating photo:', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    try {
      setIsExporting(true);
      const canvas = await generateCanvas();
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          // @ts-ignore
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2500);
        } catch (clipErr) {
          console.warn('Clipboard write image not supported on this browser, downloading instead:', clipErr);
          handleDownloadPhoto();
        } finally {
          setIsExporting(false);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Error copying image:', err);
      setIsExporting(false);
    }
  };

  // Native Share (Mobile sheet e.g. Messenger, AirDrop, Messages)
  const handleNativeShare = async () => {
    try {
      setIsExporting(true);
      const canvas = await generateCanvas();

      if (canvas && navigator.share) {
        canvas.toBlob(async (blob) => {
          if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'setlist.png', { type: 'image/png' })] })) {
            const file = new File([blob], `Worship_Setlist_${lineup.service_date}.png`, { type: 'image/png' });
            await navigator.share({
              files: [file],
              title: `Beholding Jesus Lineup - ${lineup.title}`,
              text: generateMessengerText()
            });
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 2500);
          } else {
            // Text fallback
            await navigator.share({
              title: `Beholding Jesus Lineup - ${lineup.title}`,
              text: generateMessengerText()
            });
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 2500);
          }
        }, 'image/png');
      } else {
        handleCopyText();
      }
    } catch (err) {
      console.log('Share canceled or error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-modal border border-stone-200 animate-slide-up overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="p-3.5 sm:p-5 border-b border-stone-200 bg-[#FAF6F0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E1D1B] text-white flex items-center justify-center shadow-2xs shrink-0">
              <Share2 className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                Share Lineup & Save as Photo
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Download a high-resolution landscape photo card or copy formatted text for Messenger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Orientation Toggle: Landscape / Portrait */}
            <div className="flex items-center p-1 bg-stone-200/70 rounded-xl">
              <button
                onClick={() => setOrientation('landscape')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isLandscape
                    ? 'bg-[#1E1D1B] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Landscape (Recommended for presentation & widescreen)"
              >
                <svg viewBox="0 0 20 14" className="w-3.5 h-2.5 fill-current">
                  <rect width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span>Landscape</span>
              </button>
              <button
                onClick={() => setOrientation('portrait')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isLandscape
                    ? 'bg-[#1E1D1B] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Portrait (Mobile story format)"
              >
                <svg viewBox="0 0 14 20" className="w-2.5 h-3.5 fill-current">
                  <rect width="14" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span>Portrait</span>
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center p-1 bg-stone-200/70 rounded-xl">
              <button
                onClick={() => setThemeMode('dark')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isDark ? 'bg-[#1E1D1B] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Sleek Dark Theme"
              >
                Charcoal
              </button>
              <button
                onClick={() => setThemeMode('warm')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isDark ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Warm Beige Theme"
              >
                Warm
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="p-3 sm:px-6 bg-[#F5EFE6] border-b border-stone-200/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Download as Photo */}
            <button
              onClick={handleDownloadPhoto}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-soft disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              ) : (
                <Download className="w-4 h-4 text-amber-300" />
              )}
              <span>Save as Photo ({isLandscape ? 'Landscape PNG' : 'Portrait PNG'})</span>
            </button>

            {/* Copy Image to Clipboard */}
            <button
              onClick={handleCopyImage}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold border border-stone-300 shadow-2xs transition-all"
            >
              {copiedImage ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Image Copied!</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 text-stone-600" />
                  <span>Copy Photo</span>
                </>
              )}
            </button>

            {/* Native Mobile Share Sheet */}
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                onClick={handleNativeShare}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold border border-stone-300 shadow-2xs transition-all"
              >
                {shareSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Shared!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-stone-600" />
                    <span>Share to Apps</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Messenger Text */}
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold border border-amber-300/80 shadow-2xs transition-all"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span className="text-emerald-900">Text Copied!</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 text-amber-800" />
                  <span>Copy for Messenger</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Small Screen Landscape Hint */}
        {isLandscape && (
          <div className="px-4 py-1.5 bg-[#EFE8DC] border-b border-stone-200 text-[11px] text-stone-600 font-semibold flex items-center justify-between xl:hidden">
            <span>↔️ Swipe horizontally to preview entire landscape card</span>
            <span className="text-[10px] text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
              Export format: 1040px Landscape HD
            </span>
          </div>
        )}

        {/* Card Preview Container */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-6 md:p-8 bg-[#EBE4D8] flex justify-center items-start">
          {/* THE EXPORTABLE GRAPHIC CARD - EXACT MATCH TO SUNDAY LINEUP CARD */}
          <div
            ref={cardRef}
            style={{
              width: isLandscape ? '1040px' : '100%',
              minWidth: isLandscape ? '1040px' : 'auto',
              maxWidth: isLandscape ? '1040px' : '600px',
              backgroundColor: isDark ? '#18181B' : '#FAF6F0',
              color: isDark ? '#FFFFFF' : '#1C1917',
              border: isDark ? '1px solid #27272A' : '1px solid #E6DFD3',
              borderRadius: '24px',
              padding: isLandscape ? '32px 36px' : '28px 24px',
              boxShadow: isDark
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.55)'
                : '0 20px 40px -10px rgba(120, 53, 15, 0.08)',
              boxSizing: 'border-box'
            }}
          >
            {/* =========================================================================
                1. HEADER SECTION: WORSHIP • SUNDAY SERVICE | Title | Published | Date
               ========================================================================= */}
            <div>
              {/* Top Micro Label */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px'
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: isDark ? '#E5A93C' : '#B45309'
                  }}
                >
                  WORSHIP • {lineup.title ? lineup.title.toUpperCase() : 'SUNDAY SERVICE'}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: isDark ? '#71717A' : '#78716C'
                  }}
                >
                  BEHOLDING JESUS CHURCH
                </span>
              </div>

              {/* Main Title Row with Status Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginTop: '4px'
                }}
              >
                <h1
                  style={{
                    fontSize: isLandscape ? '26px' : '22px',
                    fontWeight: '800',
                    color: isDark ? '#FFFFFF' : '#1C1917',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.2',
                    margin: 0
                  }}
                >
                  {lineup.title || 'Sunday Lineup'}
                </h1>

                <span
                  style={{
                    padding: '4px 14px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    backgroundColor: isPublished
                      ? (isDark ? '#122A1E' : '#DCFCE7')
                      : (isDark ? '#2E200F' : '#FEF3C7'),
                    color: isPublished
                      ? (isDark ? '#4ADE80' : '#166534')
                      : (isDark ? '#FBBF24' : '#92400E'),
                    border: isPublished
                      ? (isDark ? '1px solid #166534' : '1px solid #86EFAC')
                      : (isDark ? '1px solid #854D0E' : '1px solid #FCD34D'),
                    flexShrink: 0
                  }}
                >
                  {isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              {/* Subtitle: Date • Count of Songs */}
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: isDark ? '#A1A1AA' : '#78716C',
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{formattedDate}</span>
                <span>•</span>
                <span>
                  {totalSongsCount} {totalSongsCount === 1 ? 'song' : 'songs'}
                </span>
                {lineup.service_time && (
                  <>
                    <span>•</span>
                    <span>{lineup.service_time}</span>
                  </>
                )}
              </div>
            </div>

            {/* =========================================================================
                2. MINISTRY TEAM & THEME STRIP (Zero overlaps, clean wrapped pills)
               ========================================================================= */}
            {(lineup.worship_leader_name || lineup.theme || (lineup.assigned_vocalists && lineup.assigned_vocalists.length > 0) || (lineup.assigned_musicians && lineup.assigned_musicians.length > 0)) && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  backgroundColor: isDark ? '#222225' : '#F5EFE6',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #E5DFD5',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  {lineup.worship_leader_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: isDark ? '#E5A93C' : '#92400E',
                          backgroundColor: isDark ? '#2D261C' : '#FEF3C7',
                          border: isDark ? '1px solid #594017' : '1px solid #FCD34D',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        ⭐ LEADER
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: isDark ? '#FFFFFF' : '#1C1917' }}>
                        {lineup.worship_leader_name}
                      </span>
                    </div>
                  )}

                  {lineup.theme && (
                    <div style={{ fontSize: '12px', fontStyle: 'italic', color: isDark ? '#FDE68A' : '#78350F' }}>
                      Theme: "{lineup.theme}"
                    </div>
                  )}
                </div>

                {/* Vocalists & Musicians wrap row */}
                {((lineup.assigned_vocalists && lineup.assigned_vocalists.length > 0) || (lineup.assigned_musicians && lineup.assigned_musicians.length > 0)) && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px',
                      paddingTop: '6px',
                      borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #EAE3D7'
                    }}
                  >
                    {lineup.assigned_vocalists && lineup.assigned_vocalists.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', color: isDark ? '#E5A93C' : '#92400E' }}>
                          🎤 VOCALS:
                        </span>
                        {lineup.assigned_vocalists.map((v) => (
                          <span
                            key={v.id || v.name}
                            style={{
                              fontSize: '11px',
                              fontWeight: '600',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                              border: isDark ? '1px solid #332F2A' : '1px solid #D6CEBE',
                              color: isDark ? '#E4E4E7' : '#292524'
                            }}
                          >
                            {v.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {lineup.assigned_musicians && lineup.assigned_musicians.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginLeft: (lineup.assigned_vocalists && lineup.assigned_vocalists.length > 0) ? '12px' : '0' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', color: isDark ? '#E5A93C' : '#92400E' }}>
                          🎸 BAND:
                        </span>
                        {lineup.assigned_musicians.map((m) => (
                          <span
                            key={m.id || m.name}
                            style={{
                              fontSize: '11px',
                              fontWeight: '600',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                              border: isDark ? '1px solid #332F2A' : '1px solid #D6CEBE',
                              color: isDark ? '#E4E4E7' : '#292524'
                            }}
                          >
                            {m.name} ({m.instrument})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =========================================================================
                3. CATEGORIZED SONGS SETLIST (Exact Match to Sunday Lineup Card)
               ========================================================================= */}
            {totalSongsCount === 0 ? (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: isDark ? '#71717A' : '#A8A29E',
                  backgroundColor: isDark ? '#222225' : '#FFFFFF',
                  borderRadius: '18px',
                  border: isDark ? '1px dashed #3F3F46' : '1px dashed #D6CEBE',
                  marginTop: '20px'
                }}
              >
                No songs added to this service lineup yet.
              </div>
            ) : (
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {Object.entries(categorizedSongs).map(([categoryName, songItems]) => (
                  <div key={categoryName} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Category Header Row: JOYFUL        2 SONGS */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 4px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: '800',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: isDark ? '#E4E4E7' : '#292524'
                        }}
                      >
                        {categoryName}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: isDark ? '#71717A' : '#78716C'
                        }}
                      >
                        {songItems.length} {songItems.length === 1 ? 'SONG' : 'SONGS'}
                      </span>
                    </div>

                    {/* Songs Grid: 2 clean columns in landscape, 1 in portrait */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          isLandscape && (lineup.songs?.length || 0) > 3
                            ? 'repeat(2, minmax(0, 1fr))'
                            : '1fr',
                        gap: '10px'
                      }}
                    >
                      {songItems.map((song) => {
                        const selectedKey = song.selected_key || song.original_key || 'G';
                        const hasVideo = !!song.youtube_url;

                        return (
                          <div
                            key={song.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '14px',
                              padding: '12px 16px',
                              borderRadius: '16px',
                              backgroundColor: isDark ? '#222225' : '#FFFFFF',
                              border: isDark
                                ? '1px solid rgba(255, 255, 255, 0.06)'
                                : '1px solid #E7E1D6',
                              boxSizing: 'border-box'
                            }}
                          >
                            {/* Left: Square KEY Badge (Exact match to Sunday Lineup Card) */}
                            <div
                              style={{
                                width: '46px',
                                height: '46px',
                                minWidth: '46px',
                                minHeight: '46px',
                                borderRadius: '12px',
                                backgroundColor: isDark ? '#2D261C' : '#FEF3C7',
                                border: isDark ? '1px solid #594017' : '1px solid #F59E0B',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '9px',
                                  fontWeight: '800',
                                  letterSpacing: '0.06em',
                                  textTransform: 'uppercase',
                                  color: isDark ? '#E5A93C' : '#B45309',
                                  lineHeight: '1',
                                  marginBottom: '2px'
                                }}
                              >
                                KEY
                              </span>
                              <span
                                style={{
                                  fontSize: '16px',
                                  fontWeight: '800',
                                  color: isDark ? '#FDF8F0' : '#78350F',
                                  lineHeight: '1'
                                }}
                              >
                                {selectedKey}
                              </span>
                            </div>

                            {/* Center: Song Title & Subtitle */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: '15px',
                                  fontWeight: '700',
                                  color: isDark ? '#FFFFFF' : '#1C1917',
                                  lineHeight: '1.25',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {song.title}
                              </div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  color: isDark ? '#A1A1AA' : '#78716C',
                                  lineHeight: '1.25',
                                  marginTop: '3px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <span>{hasVideo ? 'YouTube video' : 'YouTube reference'}</span>
                                {song.assigned_vocalist_name && (
                                  <>
                                    <span style={{ margin: '0 5px', color: isDark ? '#52525B' : '#A8A29E' }}>•</span>
                                    <span style={{ color: isDark ? '#FDE68A' : '#92400E', fontWeight: '600' }}>
                                      Lead: {song.assigned_vocalist_name}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Right: Circular Gold Play Icon (Exact match to Sunday Lineup Card) */}
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                minWidth: '32px',
                                minHeight: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#D4A359',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                style={{
                                  width: '13px',
                                  height: '13px',
                                  fill: '#18181B',
                                  stroke: '#18181B',
                                  strokeWidth: '1.5',
                                  marginLeft: '2px'
                                }}
                              >
                                <polygon points="6 3 20 12 6 21 6 3" />
                              </svg>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reminders / Call Time if provided */}
            {lineup.notes && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: isDark ? '#222225' : '#F5EFE6',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #E5DFD5',
                  fontSize: '11px',
                  color: isDark ? '#D4D4D8' : '#57534E',
                  lineHeight: '1.4'
                }}
              >
                <span style={{ fontWeight: '700', color: isDark ? '#E5A93C' : '#92400E', marginRight: '6px' }}>
                  📌 STAGE PREP & CALL TIME:
                </span>
                <span>{lineup.notes}</span>
              </div>
            )}

            {/* =========================================================================
                4. BOTTOM FOOTER & SIGNATURE
               ========================================================================= */}
            <div
              style={{
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: isDark ? '1px solid #27272A' : '1px solid #EAE3D7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: isDark ? '#A1A1AA' : '#78716C',
                  fontStyle: 'italic',
                  lineHeight: '1.4'
                }}
              >
                Beholding Jesus Worship Team • Together in Worship
              </div>

              <div
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontStyle: 'italic',
                  fontWeight: '600',
                  fontSize: '16px',
                  color: isDark ? '#E5A93C' : '#B45309',
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                For His Glory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
