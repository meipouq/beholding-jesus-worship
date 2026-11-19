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
import { formatDisplayTime } from '../../utils/timeFormat';

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
    const displayServiceTime = formatDisplayTime(lineup.service_time) || lineup.service_time;
    text += `🗓️ ${formattedDate || lineup.service_date}${displayServiceTime ? ` • ${displayServiceTime}` : ''}\n`;
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
    const targetWidth = isLandscape ? 1040 : 640;

    // Ensure all web fonts are fully loaded
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (fontErr) {
        console.warn('Font readiness check skipped:', fontErr);
      }
    }

    // Fix Tailwind CSS Preflight (img { display: block }) which corrupts html2canvas FontMetrics baseline calculation
    // and causes all rendered text to be pushed downward by 20-30px
    const style = document.createElement('style');
    style.id = 'html2canvas-fontmetrics-fix';
    style.innerHTML = `img { display: inline-block !important; }`;
    document.head.appendChild(style);

    try {
      return await html2canvas(cardRef.current, {
        scale: 2, // 2x gives crystal-clear 1280px / 2080px resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: isDark ? '#100E0B' : '#FAF6F0',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: targetWidth + 200,
        windowHeight: cardRef.current.scrollHeight + 300,
        onclone: (clonedDoc) => {
          // Inject inline-block img rule in the cloned document as well
          const cloneStyle = clonedDoc.createElement('style');
          cloneStyle.innerHTML = `img { display: inline-block !important; }`;
          clonedDoc.head.appendChild(cloneStyle);

          // Isolate cloned card from mobile viewport constraints and scroll offsets
          const clonedCard = clonedDoc.querySelector('[data-export-card="true"]') as HTMLElement;
          if (clonedCard && clonedCard.parentElement) {
            clonedCard.parentElement.style.display = 'block';
            clonedCard.parentElement.style.padding = '0';
            clonedCard.parentElement.style.margin = '0';
            clonedCard.parentElement.style.overflow = 'visible';
            clonedCard.parentElement.scrollLeft = 0;
            clonedCard.parentElement.scrollTop = 0;
            clonedCard.style.margin = '0 auto';
            clonedCard.style.position = 'relative';
            clonedCard.style.left = '0';
            clonedCard.style.top = '0';
          }
        }
      });
    } finally {
      style.remove();
    }
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
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#211C17] rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-[#393027] animate-slide-up overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="p-3.5 sm:p-5 border-b border-[#393027] bg-[#181510] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#29231C] border border-[#393027] text-[#E5AF45] flex items-center justify-center shadow-sm shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#FFF5E6] leading-tight">
                Share Lineup & Save as Photo
              </h2>
              <p className="text-xs text-[#B8ADA0] mt-0.5">
                Download a high-resolution landscape photo card or copy formatted text for Messenger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Orientation Toggle: Landscape / Portrait */}
            <div className="flex items-center p-1 bg-[#29231C] border border-[#393027] rounded-xl">
              <button
                onClick={() => setOrientation('landscape')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isLandscape
                    ? 'bg-[#E5AF45] text-[#100E0B] shadow-sm'
                    : 'text-[#B8ADA0] hover:text-[#FFF5E6]'
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
                    ? 'bg-[#E5AF45] text-[#100E0B] shadow-sm'
                    : 'text-[#B8ADA0] hover:text-[#FFF5E6]'
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
            <div className="flex items-center p-1 bg-[#29231C] border border-[#393027] rounded-xl">
              <button
                onClick={() => setThemeMode('dark')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isDark ? 'bg-[#E5AF45] text-[#100E0B] shadow-sm' : 'text-[#B8ADA0] hover:text-[#FFF5E6]'
                }`}
                title="Midnight Black Theme"
              >
                Midnight
              </button>
              <button
                onClick={() => setThemeMode('warm')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isDark ? 'bg-[#E5AF45] text-[#100E0B] shadow-sm' : 'text-[#B8ADA0] hover:text-[#FFF5E6]'
                }`}
                title="Warm Beige Theme"
              >
                Warm
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="p-3 sm:px-6 bg-[#181510] border-b border-[#393027] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Download as Photo */}
            <button
              onClick={handleDownloadPhoto}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#E5AF45] hover:bg-[#FFC85C] text-[#100E0B] text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#100E0B]" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Save as Photo ({isLandscape ? 'Landscape PNG' : 'Portrait PNG'})</span>
            </button>

            {/* Copy Image to Clipboard */}
            <button
              onClick={handleCopyImage}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#29231C] hover:bg-[#393027] text-[#FFF5E6] text-xs font-bold border border-[#393027] shadow-sm transition-all"
            >
              {copiedImage ? (
                <>
                  <Check className="w-4 h-4 text-[#79BB8B]" />
                  <span className="text-[#79BB8B]">Image Copied!</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 text-[#E5AF45]" />
                  <span>Copy Photo</span>
                </>
              )}
            </button>

            {/* Native Mobile Share Sheet */}
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                onClick={handleNativeShare}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#29231C] hover:bg-[#393027] text-[#FFF5E6] text-xs font-bold border border-[#393027] shadow-sm transition-all"
              >
                {shareSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-[#79BB8B]" />
                    <span className="text-[#79BB8B]">Shared!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-[#E5AF45]" />
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
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#29231C] hover:bg-[#393027] text-[#E5AF45] text-xs font-bold border border-[#393027] shadow-sm transition-all"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-[#79BB8B]" />
                  <span className="text-[#79BB8B]">Text Copied!</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 text-[#E5AF45]" />
                  <span>Copy for Messenger</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Small Screen HD Hint */}
        <div className="px-4 py-1.5 bg-[#181510] border-b border-[#393027] text-[11px] text-[#B8ADA0] font-semibold flex items-center justify-between">
          <span>↔️ Swipe horizontally to preview full card</span>
          <span className="text-[10px] text-[#E5AF45] font-bold bg-[#29231C] border border-[#393027] px-2 py-0.5 rounded-md">
            HD Output: {isLandscape ? '1040px Landscape' : '640px Portrait'}
          </span>
        </div>

        {/* Card Preview Container */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-6 md:p-8 bg-[#100E0B] flex justify-center items-start">
          {/* THE EXPORTABLE GRAPHIC CARD */}
          <div
            ref={cardRef}
            data-export-card="true"
            style={{
              width: isLandscape ? '1040px' : '640px',
              minWidth: isLandscape ? '1040px' : '640px',
              maxWidth: isLandscape ? '1040px' : '640px',
              backgroundColor: isDark ? '#100E0B' : '#FAF6F0',
              color: isDark ? '#FFF5E6' : '#1C1917',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              border: isDark ? '1px solid #393027' : '1px solid #E6DFD3',
              borderRadius: '24px',
              padding: isLandscape ? '32px 36px' : '32px 32px',
              boxShadow: isDark
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
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
                  marginBottom: '8px',
                  lineHeight: '16px'
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: isDark ? '#E5AF45' : '#B45309',
                    whiteSpace: 'nowrap'
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
                    color: isDark ? '#B8ADA0' : '#78716C',
                    whiteSpace: 'nowrap'
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
                  marginTop: '4px'
                }}
              >
                <h1
                  style={{
                    fontSize: isLandscape ? '26px' : '24px',
                    fontWeight: '800',
                    color: isDark ? '#FFF5E6' : '#1C1917',
                    letterSpacing: '-0.02em',
                    lineHeight: '32px',
                    margin: 0,
                    marginRight: '12px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1
                  }}
                >
                  {lineup.title || 'Sunday Lineup'}
                </h1>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '26px',
                    lineHeight: '26px',
                    padding: '0 14px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    backgroundColor: isPublished
                      ? (isDark ? 'rgba(121, 187, 139, 0.15)' : '#DCFCE7')
                      : (isDark ? 'rgba(229, 175, 69, 0.15)' : '#FEF3C7'),
                    color: isPublished
                      ? (isDark ? '#79BB8B' : '#166534')
                      : (isDark ? '#E5AF45' : '#92400E'),
                    border: isPublished
                      ? (isDark ? '1px solid rgba(121, 187, 139, 0.4)' : '1px solid #86EFAC')
                      : (isDark ? '1px solid rgba(229, 175, 69, 0.4)' : '1px solid #FCD34D'),
                    boxSizing: 'border-box',
                    flexShrink: 0
                  }}
                >
                  {isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              {/* Subtitle: Date • Count of Songs • Service Time (Single clean string, no wrapping) */}
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: isDark ? '#B8ADA0' : '#78716C',
                  marginTop: '6px',
                  lineHeight: '20px',
                  whiteSpace: 'nowrap'
                }}
              >
                {`${formattedDate} • ${totalSongsCount} ${totalSongsCount === 1 ? 'song' : 'songs'}${formatDisplayTime(lineup.service_time) ? ` • ${formatDisplayTime(lineup.service_time)}` : (lineup.service_time ? ` • ${lineup.service_time}` : '')}`}
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
                  backgroundColor: isDark ? '#211C17' : '#F5EFE6',
                  border: isDark ? '1px solid #393027' : '1px solid #E5DFD5',
                  boxSizing: 'border-box'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '28px',
                    marginBottom: ((lineup.assigned_vocalists && lineup.assigned_vocalists.length > 0) || (lineup.assigned_musicians && lineup.assigned_musicians.length > 0)) ? '10px' : '0'
                  }}
                >
                  {lineup.worship_leader_name && (
                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '26px',
                          lineHeight: '26px',
                          padding: '0 10px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: '800',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: isDark ? '#E5AF45' : '#92400E',
                          backgroundColor: isDark ? '#29231C' : '#FEF3C7',
                          border: isDark ? '1px solid #594017' : '1px solid #FCD34D',
                          marginRight: '10px',
                          boxSizing: 'border-box',
                          flexShrink: 0
                        }}
                      >
                        ⭐ {(lineup.worship_leaders && lineup.worship_leaders.length > 1) ? 'LEADERS' : 'LEADER'}
                      </span>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: isDark ? '#FFF5E6' : '#1C1917',
                          lineHeight: '26px',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                      >
                        {lineup.worship_leader_name}
                      </span>
                    </div>
                  )}

                  {lineup.theme && (
                    <div
                      style={{
                        fontSize: '12px',
                        fontStyle: 'italic',
                        color: isDark ? '#FFC85C' : '#78350F',
                        lineHeight: '26px',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                    >
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
                      paddingTop: '8px',
                      borderTop: isDark ? '1px solid #393027' : '1px solid #EAE3D7'
                    }}
                  >
                    {lineup.assigned_vocalists && lineup.assigned_vocalists.length > 0 && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', marginRight: (lineup.assigned_musicians && lineup.assigned_musicians.length > 0) ? '16px' : '0' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', color: isDark ? '#E5AF45' : '#92400E', lineHeight: '24px', marginRight: '6px' }}>
                          🎤 VOCALS:
                        </span>
                        {lineup.assigned_vocalists.map((v) => (
                          <span
                            key={v.id || v.name}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '24px',
                              lineHeight: '24px',
                              padding: '0 8px',
                              borderRadius: '6px',
                              backgroundColor: isDark ? '#181510' : '#FFFFFF',
                              border: isDark ? '1px solid #393027' : '1px solid #D6CEBE',
                              color: isDark ? '#FFF5E6' : '#292524',
                              fontSize: '11px',
                              fontWeight: '600',
                              marginRight: '6px',
                              marginBottom: '4px',
                              boxSizing: 'border-box'
                            }}
                          >
                            {v.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {lineup.assigned_musicians && lineup.assigned_musicians.length > 0 && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', color: isDark ? '#E5AF45' : '#92400E', lineHeight: '24px', marginRight: '6px' }}>
                          🎸 BAND:
                        </span>
                        {lineup.assigned_musicians.map((m) => (
                          <span
                            key={m.id || m.name}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '24px',
                              lineHeight: '24px',
                              padding: '0 8px',
                              borderRadius: '6px',
                              backgroundColor: isDark ? '#181510' : '#FFFFFF',
                              border: isDark ? '1px solid #393027' : '1px solid #D6CEBE',
                              color: isDark ? '#FFF5E6' : '#292524',
                              fontSize: '11px',
                              fontWeight: '600',
                              marginRight: '6px',
                              marginBottom: '4px',
                              boxSizing: 'border-box'
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
                  color: isDark ? '#B8ADA0' : '#A8A29E',
                  backgroundColor: isDark ? '#211C17' : '#FFFFFF',
                  borderRadius: '18px',
                  border: isDark ? '1px dashed #393027' : '1px dashed #D6CEBE',
                  marginTop: '20px'
                }}
              >
                No songs added to this service lineup yet.
              </div>
            ) : (
              <div style={{ marginTop: '20px' }}>
                {Object.entries(categorizedSongs).map(([categoryName, songItems]) => (
                  <div key={categoryName} style={{ marginBottom: '18px' }}>
                    {/* Category Header Row: JOYFUL        2 SONGS */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 4px',
                        lineHeight: '18px',
                        marginBottom: '10px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: '800',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: isDark ? '#FFF5E6' : '#292524'
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
                          color: isDark ? '#B8ADA0' : '#78716C'
                        }}
                      >
                        {songItems.length} {songItems.length === 1 ? 'SONG' : 'SONGS'}
                      </span>
                    </div>

                    {/* Songs Container: Solid Flexbox with percentage/wrap, zero CSS Grid bugs */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between'
                      }}
                    >
                      {songItems.map((song) => {
                        const selectedKey = song.selected_key || song.original_key || 'G';
                        const isTwoCol = isLandscape && (lineup.songs?.length || 0) > 3;

                        return (
                          <div
                            key={song.id}
                            style={{
                              width: isTwoCol ? 'calc(50% - 6px)' : '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              marginBottom: '10px',
                              borderRadius: '16px',
                              backgroundColor: isDark ? '#211C17' : '#FFFFFF',
                              border: isDark
                                ? '1px solid #393027'
                                : '1px solid #E7E1D6',
                              boxSizing: 'border-box'
                            }}
                          >
                            {/* Left: Square KEY Badge (Centering perfected for high-res canvas) */}
                            <div
                              style={{
                                width: '48px',
                                height: '48px',
                                minWidth: '48px',
                                minHeight: '48px',
                                borderRadius: '12px',
                                backgroundColor: isDark ? '#29231C' : '#FEF3C7',
                                border: isDark ? '1px solid #594017' : '1px solid #F59E0B',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxSizing: 'border-box',
                                padding: '4px 0',
                                marginRight: '14px'
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '9px',
                                  fontWeight: '800',
                                  letterSpacing: '0.08em',
                                  textTransform: 'uppercase',
                                  color: isDark ? '#E5AF45' : '#B45309',
                                  lineHeight: '11px',
                                  height: '11px',
                                  display: 'block',
                                  textAlign: 'center'
                                }}
                              >
                                KEY
                              </span>
                              <span
                                style={{
                                  fontSize: '16px',
                                  fontWeight: '800',
                                  color: isDark ? '#FFF5E6' : '#78350F',
                                  lineHeight: '20px',
                                  height: '20px',
                                  display: 'block',
                                  textAlign: 'center',
                                  marginTop: '2px'
                                }}
                              >
                                {selectedKey}
                              </span>
                            </div>

                            {/* Center: Song Title & Subtitle (Clean block typography, zero clipping) */}
                            <div style={{ flex: 1, minWidth: 0, marginRight: '14px' }}>
                              <div
                                style={{
                                  fontSize: '15px',
                                  fontWeight: '700',
                                  color: isDark ? '#FFF5E6' : '#1C1917',
                                  lineHeight: '22px',
                                  marginBottom: '2px',
                                  display: 'block',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {song.title}
                              </div>
                              <div
                                style={{
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  color: isDark ? '#E5AF45' : '#92400E',
                                  lineHeight: '20px',
                                  display: 'block',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                <span>
                                  Lead: {song.assigned_vocalist_name || lineup.worship_leader_name || 'Worship Leader'}
                                </span>
                                {song.artist && (
                                  <span style={{ color: isDark ? '#B8ADA0' : '#78716C', fontWeight: '400', marginLeft: '6px' }}>
                                    • {song.artist}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Right: Circular Gold Play Icon (Perfect geometry & centered) */}
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                minWidth: '34px',
                                minHeight: '34px',
                                borderRadius: '50%',
                                backgroundColor: '#E5AF45',
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
                                  fill: '#100E0B',
                                  stroke: '#100E0B',
                                  strokeWidth: '1.5',
                                  marginLeft: '2px',
                                  display: 'block'
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
                  padding: '12px 16px',
                  borderRadius: '14px',
                  backgroundColor: isDark ? '#211C17' : '#F5EFE6',
                  border: isDark ? '1px solid #393027' : '1px solid #E5DFD5',
                  fontSize: '11px',
                  color: isDark ? '#B8ADA0' : '#57534E',
                  lineHeight: '20px',
                  boxSizing: 'border-box'
                }}
              >
                <span style={{ fontWeight: '700', color: isDark ? '#E5AF45' : '#92400E', marginRight: '6px' }}>
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
                borderTop: isDark ? '1px solid #393027' : '1px solid #EAE3D7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxSizing: 'border-box'
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: isDark ? '#B8ADA0' : '#78716C',
                  fontStyle: 'italic',
                  lineHeight: '20px',
                  marginRight: '12px'
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
                  color: isDark ? '#E5AF45' : '#B45309',
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  lineHeight: '20px'
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
