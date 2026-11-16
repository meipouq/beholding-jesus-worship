import React from 'react';
import { X, ExternalLink, Play, AlertCircle } from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';

export const YouTubePlayerModal: React.FC = () => {
  const { activeVideo, closeVideo } = useWorship();

  if (!activeVideo) return null;

  // Extract YouTube ID
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes('embed/')) {
        return url;
      }
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
      } else if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const embedUrl = getEmbedUrl(activeVideo.url);
  const isEmbeddable = embedUrl.includes('youtube.com/embed/');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={closeVideo}
    >
      <div
        className="bg-[#181716] rounded-3xl max-w-2xl w-full p-4 md:p-5 shadow-modal border border-stone-800 animate-slide-up text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-7 h-7 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
              <Play className="w-3.5 h-3.5 fill-current" />
            </div>
            <h3 className="text-sm font-bold truncate">
              {activeVideo.title} — Audio / Video Reference
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={activeVideo.url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 text-xs flex items-center gap-1 transition-colors"
              title="Open directly in YouTube"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={closeVideo}
              className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="mt-4 aspect-video w-full rounded-2xl overflow-hidden bg-black border border-stone-800">
          {isEmbeddable ? (
            <iframe
              src={embedUrl}
              title={activeVideo.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
              <p className="text-sm font-semibold mb-3">Reference URL</p>
              <a
                href={activeVideo.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open External Video Link
              </a>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400">
          <span>Beholding Jesus Worship Team • Reference Player</span>
          <span className="truncate max-w-[240px]">{activeVideo.url}</span>
        </div>
      </div>
    </div>
  );
};
