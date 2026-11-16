import React, { useState, useRef } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Image as ImageIcon,
  MessageCircle,
  Calendar,
  Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { ServiceLineup } from '../../types';
import { Logo } from '../common/Logo';

interface LineupShareModalProps {
  lineup: ServiceLineup;
  onClose: () => void;
}

export const LineupShareModal: React.FC<LineupShareModalProps> = ({ lineup, onClose }) => {
  const [themeMode, setThemeMode] = useState<'dark' | 'warm'>('dark');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // Group songs by category
  const songsByCategory = (lineup.songs || []).reduce((acc, song) => {
    const cat = song.category?.toUpperCase() || 'GENERAL';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(song);
    return acc;
  }, {} as Record<string, typeof lineup.songs>);

  // Format date nicely (e.g. "Sun, Nov 29, 2026")
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  const formattedDate = formatDateDisplay(lineup.service_date);

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
    Object.entries(songsByCategory).forEach(([category, songsList]) => {
      text += `\n[ ${category} ]\n`;
      songsList.forEach((s) => {
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
      backgroundColor: themeMode === 'dark' ? '#141312' : '#FAF6F0',
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
      const filename = `Beholding_Jesus_Setlist_${lineup.service_date.replace(/-/g, '_')}.png`;

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

  const isDark = themeMode === 'dark';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-modal border border-stone-200 animate-slide-up overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-[#FAF6F0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E1D1B] text-white flex items-center justify-center shadow-2xs">
              <Share2 className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                Share Lineup & Save as Photo
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Download a high-resolution photo card or copy formatted text for Messenger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <div className="flex items-center p-1 bg-stone-200/70 rounded-xl">
              <button
                onClick={() => setThemeMode('dark')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  isDark ? 'bg-[#1E1D1B] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Sleek Dark Theme"
              >
                Charcoal
              </button>
              <button
                onClick={() => setThemeMode('warm')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
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
              <span>Save as Photo (PNG)</span>
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

        {/* Card Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#EBE4D8] flex justify-center items-start">
          {/* THE EXPORTABLE GRAPHIC CARD */}
          <div
            ref={cardRef}
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: isDark ? '#141312' : '#FAF6F0',
              color: isDark ? '#F5F2EB' : '#1C1917',
              border: isDark ? '1px solid #2B2824' : '1px solid #E6DFD3',
              borderRadius: '28px',
              padding: '32px 28px',
              boxShadow: isDark
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.45)'
                : '0 20px 40px -10px rgba(120, 53, 15, 0.08)'
            }}
          >
            {/* Top Emblem & Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '18px',
                borderBottom: isDark ? '1px solid #282522' : '1px solid #EAE3D7'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Logo variant={isDark ? 'light' : 'dark'} size="md" showText={false} />
                <div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '800',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: isDark ? '#FDE68A' : '#78350F'
                    }}
                  >
                    BEHOLDING JESUS
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: isDark ? '#A8A29E' : '#78716C',
                      marginTop: '2px'
                    }}
                  >
                    Worship Team Lineup
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  backgroundColor: lineup.status === 'published'
                    ? (isDark ? '#064E3B' : '#DCFCE7')
                    : (isDark ? '#78350F' : '#FEF3C7'),
                  border: lineup.status === 'published'
                    ? (isDark ? '1px solid #059669' : '1px solid #86EFAC')
                    : (isDark ? '1px solid #D97706' : '1px solid #FCD34D'),
                  color: lineup.status === 'published'
                    ? (isDark ? '#A7F3D0' : '#166534')
                    : (isDark ? '#FDE68A' : '#92400E'),
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                {lineup.status === 'published' ? 'OFFICIAL LINEUP' : 'DRAFT SETLIST'}
              </div>
            </div>

            {/* Service Title & Date Banner */}
            <div style={{ textAlign: 'center', paddingTop: '24px', paddingBottom: '20px' }}>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: '900',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  color: isDark ? '#FFFFFF' : '#1C1917',
                  lineHeight: '1.25'
                }}
              >
                {lineup.title}
              </h1>

              {/* Exact explicit inline styling for Date & Time Badge */}
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '7px 20px',
                    borderRadius: '9999px',
                    backgroundColor: isDark ? '#262320' : '#EFE8DC',
                    border: isDark ? '1px solid #3F3B36' : '1px solid #D6CEBE',
                    color: isDark ? '#FDE68A' : '#78350F',
                    fontSize: '13px',
                    fontWeight: '700',
                    lineHeight: '20px',
                    textAlign: 'center'
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    style={{
                      width: '15px',
                      height: '15px',
                      stroke: isDark ? '#FDE68A' : '#78350F',
                      fill: 'none',
                      strokeWidth: '2.2',
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      display: 'inline-block',
                      verticalAlign: '-2px',
                      marginRight: '6px'
                    }}
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span style={{ color: isDark ? '#FDE68A' : '#78350F', fontWeight: '700' }}>
                    {formattedDate || lineup.service_date} • {lineup.service_time}
                  </span>
                </div>
              </div>

              {lineup.theme && (
                <div
                  style={{
                    marginTop: '10px',
                    fontSize: '12px',
                    fontStyle: 'italic',
                    color: isDark ? '#A8A29E' : '#78716C'
                  }}
                >
                  Theme: "{lineup.theme}"
                </div>
              )}
            </div>

            {/* Ministry Team Roster Box */}
            <div
              style={{
                backgroundColor: isDark ? '#1C1A18' : '#FFFFFF',
                border: isDark ? '1px solid #2B2824' : '1px solid #E5DFD5',
                borderRadius: '18px',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: isDark ? '#FBBF24' : '#92400E',
                    marginBottom: '3px'
                  }}
                >
                  WORSHIP LEADER
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: isDark ? '#FFFFFF' : '#1C1917',
                    lineHeight: '1.3'
                  }}
                >
                  {lineup.worship_leader_name || 'TBA'}
                </div>

                {lineup.assigned_vocalists && lineup.assigned_vocalists.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: isDark ? '#FBBF24' : '#92400E',
                        marginBottom: '3px'
                      }}
                    >
                      VOCAL TEAM
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: isDark ? '#D6D3D1' : '#44403C',
                        lineHeight: '1.4'
                      }}
                    >
                      {lineup.assigned_vocalists.map(v => v.name).join(', ')}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: isDark ? '#FBBF24' : '#92400E',
                      marginBottom: '3px'
                    }}
                  >
                    BAND & MUSICIANS
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: isDark ? '#D6D3D1' : '#44403C',
                      lineHeight: '1.4'
                    }}
                  >
                    {lineup.assigned_musicians && lineup.assigned_musicians.length > 0
                      ? lineup.assigned_musicians.map(m => `${m.name} (${m.instrument})`).join(', ')
                      : 'Worship Band'}
                  </div>
                </div>

                {lineup.notes && (
                  <div style={{ marginTop: '10px' }}>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: isDark ? '#FBBF24' : '#92400E',
                        marginBottom: '3px'
                      }}
                    >
                      CALL TIME / REMINDERS
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontStyle: 'italic',
                        color: isDark ? '#A8A29E' : '#78716C',
                        lineHeight: '1.3'
                      }}
                    >
                      {lineup.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Song Setlist Sections */}
            <div>
              {Object.keys(songsByCategory).length === 0 ? (
                <div
                  style={{
                    padding: '32px 0',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: isDark ? '#78716C' : '#A8A29E'
                  }}
                >
                  No songs in this service lineup yet.
                </div>
              ) : (
                Object.entries(songsByCategory).map(([categoryName, songItems]) => (
                  <div key={categoryName} style={{ marginBottom: '14px' }}>
                    {/* Category Label */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 14px',
                        borderRadius: '10px',
                        backgroundColor: isDark ? '#262320' : '#EFE8DC',
                        border: isDark ? '1px solid #36322D' : '1px solid #E2D9CB',
                        marginBottom: '8px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: isDark ? '#FDE68A' : '#78350F'
                        }}
                      >
                        {categoryName}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          color: isDark ? '#A8A29E' : '#78716C'
                        }}
                      >
                        {songItems.length} {songItems.length === 1 ? 'SONG' : 'SONGS'}
                      </span>
                    </div>

                    {/* Song Cards */}
                    <div>
                      {songItems.map((song, i) => (
                        <div
                          key={song.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '14px',
                            padding: '12px 18px',
                            borderRadius: '16px',
                            backgroundColor: isDark ? '#1C1A18' : '#FFFFFF',
                            border: isDark ? '1px solid #2B2824' : '1px solid #E7E1D6',
                            marginBottom: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                minWidth: '28px',
                                borderRadius: '50%',
                                backgroundColor: isDark ? '#282420' : '#F5EFE6',
                                color: isDark ? '#FBBF24' : '#78350F',
                                border: isDark ? '1px solid #443F38' : '1px solid #DDD5C7',
                                fontSize: '13px',
                                fontWeight: '800',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: '1'
                              }}
                            >
                              {song.order || i + 1}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: '15px',
                                  fontWeight: '800',
                                  color: isDark ? '#FFFFFF' : '#1C1917',
                                  lineHeight: '1.4'
                                }}
                              >
                                {song.title}
                              </div>
                              {(song.artist || song.assigned_vocalist_name) && (
                                <div
                                  style={{
                                    fontSize: '12px',
                                    color: isDark ? '#A8A29E' : '#78716C',
                                    lineHeight: '1.3',
                                    marginTop: '2px'
                                  }}
                                >
                                  {song.artist && <span>{song.artist}</span>}
                                  {song.artist && song.assigned_vocalist_name && <span> • </span>}
                                  {song.assigned_vocalist_name && (
                                    <span style={{ color: isDark ? '#FDE68A' : '#92400E', fontWeight: '700' }}>
                                      Lead: {song.assigned_vocalist_name}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ flexShrink: 0 }}>
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '5px 14px',
                                borderRadius: '12px',
                                backgroundColor: isDark ? '#2E2012' : '#FEF3C7',
                                border: isDark ? '1px solid #78350F' : '1px solid #FCD34D',
                                color: isDark ? '#FDE68A' : '#92400E',
                                fontSize: '13px',
                                fontWeight: '800',
                                letterSpacing: '0.04em',
                                lineHeight: '1'
                              }}
                            >
                              Key {song.selected_key || song.original_key || 'C'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Footer & Scripture */}
            <div
              style={{
                marginTop: '28px',
                paddingTop: '18px',
                borderTop: isDark ? '1px solid #282522' : '1px solid #EAE3D7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: isDark ? '#A8A29E' : '#78716C',
                  fontStyle: 'italic',
                  lineHeight: '1.4',
                  maxWidth: '320px'
                }}
              >
                "Let everything that has breath praise the LORD." — Psalm 150:6
              </div>

              <div
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontStyle: 'italic',
                  fontWeight: '600',
                  fontSize: '17px',
                  color: isDark ? '#FBBF24' : '#B45309',
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
