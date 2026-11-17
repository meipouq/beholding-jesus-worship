import React, { useState, useRef } from 'react';
import {
  X,
  Share2,
  Download,
  Check,
  Image as ImageIcon,
  MessageCircle,
  Loader2,
  Mic,
  Music2,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { ServiceLineup, TeamMember } from '../../types';
import { useWorship } from '../../context/WorshipContext';
import { Logo } from '../common/Logo';

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

  const { members } = useWorship();

  const cardRef = useRef<HTMLDivElement>(null);

  const isLandscape = orientation === 'landscape';
  const isDark = themeMode === 'dark';

  // Helper to resolve full member info by id or name
  const findMember = (idOrName?: string) => {
    if (!idOrName || !members || members.length === 0) return undefined;
    const clean = idOrName.trim().toLowerCase();
    return members.find(
      (m) => m.id === idOrName || m.name.trim().toLowerCase() === clean
    );
  };

  const getInitials = (name?: string): string => {
    if (!name) return 'W';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getVocalRangeStyleShare = (range?: string, dark?: boolean) => {
    const r = (range || '').toLowerCase();
    if (r.includes('soprano') && !r.includes('mezzo')) {
      return {
        bg: dark ? '#38161E' : '#FDF2F8',
        text: dark ? '#F472B6' : '#9D174D',
        border: dark ? '#831843' : '#FBCFE8',
        dot: '#EC4899',
        label: 'Soprano'
      };
    }
    if (r.includes('mezzo')) {
      return {
        bg: dark ? '#28153A' : '#FAF5FF',
        text: dark ? '#C084FC' : '#7E22CE',
        border: dark ? '#6B21A8' : '#E9D5FF',
        dot: '#A855F7',
        label: 'Mezzo'
      };
    }
    if (r.includes('alto')) {
      return {
        bg: dark ? '#342111' : '#FFFBEB',
        text: dark ? '#FBBF24' : '#92400E',
        border: dark ? '#78350F' : '#FDE68A',
        dot: '#F59E0B',
        label: 'Alto'
      };
    }
    if (r.includes('tenor')) {
      return {
        bg: dark ? '#102336' : '#F0F9FF',
        text: dark ? '#38BDF8' : '#0369A1',
        border: dark ? '#075985' : '#BAE6FD',
        dot: '#0EA5E9',
        label: 'Tenor'
      };
    }
    if (r.includes('baritone')) {
      return {
        bg: dark ? '#1C1635' : '#F5F3FF',
        text: dark ? '#A78BFA' : '#5B21B6',
        border: dark ? '#4C1D95' : '#DDD6FE',
        dot: '#8B5CF6',
        label: 'Baritone'
      };
    }
    if (r.includes('bass')) {
      return {
        bg: dark ? '#0E281F' : '#ECFDF5',
        text: dark ? '#34D399' : '#065F46',
        border: dark ? '#065F46' : '#A7F3D0',
        dot: '#10B981',
        label: 'Bass'
      };
    }
    return {
      bg: dark ? '#242220' : '#F5F5F4',
      text: dark ? '#D6D3D1' : '#57534E',
      border: dark ? '#3F3B36' : '#E7E5E4',
      dot: '#78716C',
      label: range || 'Vocalist'
    };
  };

  const getInstrumentEmoji = (inst?: string) => {
    const i = (inst || '').toLowerCase();
    if (i.includes('key') || i.includes('piano') || i.includes('synth')) return '🎹';
    if (i.includes('drum') || i.includes('percussion')) return '🥁';
    if (i.includes('bass')) return '🎸';
    if (i.includes('guitar')) return '🎸';
    return '🎵';
  };

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
      backgroundColor: isDark ? '#141312' : '#FAF6F0',
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
          {/* THE EXPORTABLE GRAPHIC CARD */}
          <div
            ref={cardRef}
            style={{
              width: isLandscape ? '1040px' : '100%',
              minWidth: isLandscape ? '1040px' : 'auto',
              maxWidth: isLandscape ? '1040px' : '540px',
              backgroundColor: isDark ? '#141312' : '#FAF6F0',
              color: isDark ? '#F5F2EB' : '#1C1917',
              border: isDark ? '1px solid #2B2824' : '1px solid #E6DFD3',
              borderRadius: '26px',
              padding: isLandscape ? '28px 32px' : '32px 28px',
              boxShadow: isDark
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.45)'
                : '0 20px 40px -10px rgba(120, 53, 15, 0.08)',
              boxSizing: 'border-box'
            }}
          >
            {/* Top Emblem & Header Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '16px',
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
                    Worship Ministry Service Setlist
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    backgroundColor: isDark ? '#262320' : '#EFE8DC',
                    border: isDark ? '1px solid #3F3B36' : '1px solid #D6CEBE',
                    color: isDark ? '#D6D3D1' : '#57534E',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.04em'
                  }}
                >
                  {lineup.songs?.length || 0} {(lineup.songs?.length || 0) === 1 ? 'Song' : 'Songs'}
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
            </div>

            {/* Service Title & Date Headline */}
            <div style={{ textAlign: 'center', paddingTop: '16px', paddingBottom: '18px' }}>
              <h1
                style={{
                  fontSize: isLandscape ? '24px' : '22px',
                  fontWeight: '900',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  color: isDark ? '#FFFFFF' : '#1C1917',
                  lineHeight: '1.25',
                  margin: 0
                }}
              >
                {lineup.title}
              </h1>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 18px',
                    borderRadius: '9999px',
                    backgroundColor: isDark ? '#262320' : '#EFE8DC',
                    border: isDark ? '1px solid #3F3B36' : '1px solid #D6CEBE',
                    color: isDark ? '#FDE68A' : '#78350F',
                    fontSize: '12px',
                    fontWeight: '700',
                    lineHeight: '18px'
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    style={{
                      width: '14px',
                      height: '14px',
                      stroke: isDark ? '#FDE68A' : '#78350F',
                      fill: 'none',
                      strokeWidth: '2.2',
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      marginRight: '6px'
                    }}
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>
                    {formattedDate || lineup.service_date} • {lineup.service_time}
                  </span>
                </div>
              </div>

              {lineup.theme && (
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: '12px',
                    fontStyle: 'italic',
                    color: isDark ? '#D6D3D1' : '#57534E'
                  }}
                >
                  Theme: "{lineup.theme}"
                </div>
              )}
            </div>

            {/* Main Organized Content Layout */}
            <div
              style={{
                display: isLandscape ? 'grid' : 'block',
                gridTemplateColumns: isLandscape ? '330px 1fr' : '1fr',
                gap: '20px',
                alignItems: 'start'
              }}
            >
              {/* LEFT COLUMN: Service Roster & Key Information */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: isLandscape ? '0' : '20px'
                }}
              >
                {/* 1. Worship Leader Spotlight Card */}
                {(() => {
                  const leaderMem = findMember(lineup.worship_leader_id) || findMember(lineup.worship_leader_name);
                  const leaderTitle = lineup.worship_leader_name || leaderMem?.name || 'TBA';
                  const leaderVocal = leaderMem?.vocal_range || 'Lead Vocalist';

                  return (
                    <div
                      style={{
                        backgroundColor: isDark ? '#221E1B' : '#FAF6F0',
                        border: isDark ? '1px solid #78350F' : '1px solid #E6DBC9',
                        borderRadius: '18px',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      {/* Leader Initials Badge with Gold Ring */}
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '14px',
                          backgroundColor: '#F59E0B',
                          color: '#1C1917',
                          fontWeight: '900',
                          fontSize: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                        }}
                      >
                        {getInitials(leaderTitle)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '9px',
                            fontWeight: '800',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: isDark ? '#FBBF24' : '#92400E',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginBottom: '2px'
                          }}
                        >
                          <span>⭐</span>
                          <span>WORSHIP LEADER & HOST</span>
                        </div>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: '800',
                            color: isDark ? '#FFFFFF' : '#1C1917',
                            lineHeight: '1.25',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {leaderTitle}
                        </div>
                        <div
                          style={{
                            fontSize: '10px',
                            fontWeight: '600',
                            color: isDark ? '#D6D3D1' : '#78716C',
                            marginTop: '2px'
                          }}
                        >
                          {leaderVocal} • Platform Ministry Lead
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Vocal Team Section */}
                <div
                  style={{
                    backgroundColor: isDark ? '#1C1A18' : '#FFFFFF',
                    border: isDark ? '1px solid #2B2824' : '1px solid #E5DFD5',
                    borderRadius: '18px',
                    padding: '14px 16px'
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: isDark ? '#FBBF24' : '#92400E',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', stroke: 'currentColor', fill: 'none', strokeWidth: '2.5' }}>
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                      </svg>
                      <span>VOCAL TEAM</span>
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: '700', color: isDark ? '#A8A29E' : '#78716C' }}>
                      {lineup.assigned_vocalists?.length || 0} VOICES
                    </span>
                  </div>

                  {lineup.assigned_vocalists && lineup.assigned_vocalists.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {lineup.assigned_vocalists.map((v) => {
                        const mInfo = findMember(v.id) || findMember(v.name);
                        const vocalRange = v.vocal_range || mInfo?.vocal_range || 'Vocalist';
                        const styleRange = getVocalRangeStyleShare(vocalRange, isDark);

                        // Check lead songs
                        const leadSong = (lineup.songs || []).find(
                          (s) =>
                            (s.assigned_vocalist_id && s.assigned_vocalist_id === v.id) ||
                            (s.assigned_vocalist_name &&
                              s.assigned_vocalist_name.toLowerCase() === v.name.toLowerCase())
                        );

                        return (
                          <div
                            key={v.id || v.name}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '5px 8px',
                              borderRadius: '10px',
                              backgroundColor: isDark ? '#262320' : '#FAF7F2',
                              border: isDark ? '1px solid #332F2A' : '1px solid #EAE3D7'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                              <div
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '8px',
                                  backgroundColor: isDark ? '#3D3833' : '#E5DFD5',
                                  color: isDark ? '#F5F5F4' : '#1C1917',
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                {getInitials(v.name)}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: isDark ? '#FFFFFF' : '#1C1917',
                                    lineHeight: '1.2',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {v.name}
                                </div>
                                {leadSong && (
                                  <div
                                    style={{
                                      fontSize: '9px',
                                      fontWeight: '700',
                                      color: isDark ? '#FBBF24' : '#92400E',
                                      lineHeight: '1.2',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    Lead: "{leadSong.title}"
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Range Badge */}
                            <div
                              style={{
                                fontSize: '9px',
                                fontWeight: '800',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                backgroundColor: styleRange.bg,
                                color: styleRange.text,
                                border: `1px solid ${styleRange.border}`,
                                textTransform: 'uppercase',
                                flexShrink: 0,
                                marginLeft: '6px'
                              }}
                            >
                              {styleRange.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: isDark ? '#A8A29E' : '#78716C', fontStyle: 'italic' }}>
                      Worship Team Vocalists
                    </div>
                  )}
                </div>

                {/* 3. Band & Musicians Card */}
                <div
                  style={{
                    backgroundColor: isDark ? '#1C1A18' : '#FFFFFF',
                    border: isDark ? '1px solid #2B2824' : '1px solid #E5DFD5',
                    borderRadius: '18px',
                    padding: '14px 16px'
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: isDark ? '#FBBF24' : '#92400E',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', stroke: 'currentColor', fill: 'none', strokeWidth: '2.5' }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>BAND & MUSICIANS</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {lineup.assigned_musicians && lineup.assigned_musicians.length > 0 ? (
                      lineup.assigned_musicians.map((m) => (
                        <div
                          key={m.id || `${m.name}-${m.instrument}`}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '10px',
                            backgroundColor: isDark ? '#262320' : '#FAF7F2',
                            border: isDark ? '1px solid #332F2A' : '1px solid #EAE3D7',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span style={{ fontSize: '13px' }}>{getInstrumentEmoji(m.instrument)}</span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '10px', fontWeight: '800', color: isDark ? '#FFFFFF' : '#1C1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {m.name}
                            </div>
                            <div style={{ fontSize: '9px', color: isDark ? '#A8A29E' : '#78716C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {m.instrument}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      [
                        { icon: '🎹', title: 'Keyboards' },
                        { icon: '🎸', title: 'Acoustic / Lead' },
                        { icon: '🎸', title: 'Bass Guitar' },
                        { icon: '🥁', title: 'Drums' }
                      ].map((item) => (
                        <div
                          key={item.title}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '10px',
                            backgroundColor: isDark ? '#262320' : '#FAF7F2',
                            border: isDark ? '1px solid #332F2A' : '1px solid #EAE3D7',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span style={{ fontSize: '13px' }}>{item.icon}</span>
                          <div style={{ fontSize: '10px', fontWeight: '700', color: isDark ? '#D6D3D1' : '#44403C' }}>
                            {item.title}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 4. Call Time & Reminders Card */}
                {lineup.notes && (
                  <div
                    style={{
                      backgroundColor: isDark ? '#1C1A18' : '#FFFFFF',
                      border: isDark ? '1px solid #2B2824' : '1px solid #E5DFD5',
                      borderRadius: '18px',
                      padding: '12px 16px'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '9px',
                        fontWeight: '800',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: isDark ? '#FBBF24' : '#92400E',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <svg viewBox="0 0 24 24" style={{ width: '11px', height: '11px', stroke: 'currentColor', fill: 'none', strokeWidth: '2.5' }}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>STAGE PREP & CALL TIME</span>
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontStyle: 'italic',
                        color: isDark ? '#D6D3D1' : '#57534E',
                        lineHeight: '1.4',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {lineup.notes}
                    </div>
                  </div>
                )}

                {/* Scripture Verse Box */}
                <div
                  style={{
                    backgroundColor: isDark ? '#231F1B' : '#F4EEE4',
                    border: isDark ? '1px solid #363029' : '1px solid #E6DDD0',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontStyle: 'italic',
                      color: isDark ? '#FDE68A' : '#78350F',
                      lineHeight: '1.4'
                    }}
                  >
                    "Let everything that has breath praise the LORD."
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      letterSpacing: '0.06em',
                      color: isDark ? '#A8A29E' : '#78716C',
                      marginTop: '3px'
                    }}
                  >
                    — PSALM 150:6
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Worship Songs Setlist */}
              <div>
                {Object.keys(songsByCategory).length === 0 ? (
                  <div
                    style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      fontSize: '13px',
                      color: isDark ? '#78716C' : '#A8A29E',
                      backgroundColor: isDark ? '#1C1A18' : '#FFFFFF',
                      borderRadius: '18px',
                      border: isDark ? '1px solid #2B2824' : '1px solid #E5DFD5'
                    }}
                  >
                    No songs added to this service lineup yet.
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isDark ? '#FBBF24' : '#B45309'
                            }}
                          />
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
                        </div>
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

                      {/* Song Items Grid */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            isLandscape && (lineup.songs?.length || 0) > 4 ? '1fr 1fr' : '1fr',
                          gap: '8px'
                        }}
                      >
                        {songItems.map((song, i) => (
                          <div
                            key={song.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              padding: '10px 14px',
                              borderRadius: '14px',
                              backgroundColor: isDark ? '#1C1A18' : '#FFFFFF',
                              border: isDark ? '1px solid #2B2824' : '1px solid #E7E1D6'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                              {/* Order Number Circle */}
                              <div
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  minWidth: '26px',
                                  borderRadius: '50%',
                                  backgroundColor: isDark ? '#282420' : '#F5EFE6',
                                  color: isDark ? '#FBBF24' : '#78350F',
                                  border: isDark ? '1px solid #443F38' : '1px solid #DDD5C7',
                                  fontSize: '12px',
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
                                    fontSize: '14px',
                                    fontWeight: '800',
                                    color: isDark ? '#FFFFFF' : '#1C1917',
                                    lineHeight: '1.3',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {song.title}
                                </div>
                                {(song.artist || song.assigned_vocalist_name) && (
                                  <div
                                    style={{
                                      fontSize: '11px',
                                      color: isDark ? '#A8A29E' : '#78716C',
                                      lineHeight: '1.3',
                                      marginTop: '2px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
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

                            {/* Key Tag */}
                            <div style={{ flexShrink: 0 }}>
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '4px 10px',
                                  borderRadius: '10px',
                                  backgroundColor: isDark ? '#2E2012' : '#FEF3C7',
                                  border: isDark ? '1px solid #78350F' : '1px solid #FCD34D',
                                  color: isDark ? '#FDE68A' : '#92400E',
                                  fontSize: '12px',
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
            </div>

            {/* Bottom Footer & Signature */}
            <div
              style={{
                marginTop: '24px',
                paddingTop: '16px',
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
                  lineHeight: '1.4'
                }}
              >
                Beholding Jesus Church • Worship Ministry Lineup
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
