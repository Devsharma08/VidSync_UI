"use client";

import { VideoDetails } from "../utils/video-api";

interface StreamMetadataProps {
  videoDetails: VideoDetails;
}

export default function StreamMetadata({ videoDetails }: StreamMetadataProps) {
  // Format the ISO publish date to a clean, readable local format
  const formatPublishDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "N/A";
      return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return "N/A";
    }
  };

  const isLive = !!videoDetails.isLiveStream;
  const videoId = videoDetails.id;
  const maxResUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : "";

  return (
    <div className="bg-gradient-to-br from-card-bg to-panel-bg border border-card-border/80 hover:border-brand-indigo/30 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-brand-indigo/5">
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail Preview Area */}
        <div className="relative md:w-80 h-48 md:h-auto bg-black/40 flex-shrink-0 border-b md:border-b-0 md:border-r border-card-border overflow-hidden group">
          {videoId ? (
            <img
              src={maxResUrl}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`) {
                  target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                }
              }}
              alt={videoDetails.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 bg-panel-bg">
              <span>No Thumbnail</span>
            </div>
          )}
          {/* Live Indicator overlay badge */}
          <div className="absolute top-4 left-4 flex gap-2">
            {isLive ? (
              <span className="bg-brand-red/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg backdrop-blur-sm animate-pulse-grow border border-brand-red/35">
                LIVE
              </span>
            ) : (
              <span className="bg-panel-bg/90 text-gray-200 text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border border-card-border">
                VOD / ARCHIVE
              </span>
            )}
          </div>
        </div>

        {/* Video Information Panel */}
        <div className="p-6 flex flex-col justify-between flex-grow space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-indigo bg-brand-indigo/10 px-2.5 py-1 rounded-md border border-brand-indigo/25">
                YouTube Ingested
              </span>
              <span className="text-xs text-gray-400 font-medium">
                Uploaded {formatPublishDate(videoDetails.publishedAt)}
              </span>
            </div>
            
            <h1 className="text-xl font-bold text-gray-100 leading-snug tracking-wide line-clamp-2 hover:text-white transition-colors">
              {videoDetails.title}
            </h1>
            
            <p className="text-sm font-medium text-brand-amber flex items-center gap-1">
              <span className="text-gray-400 text-xs">Channel:</span>
              <span className="underline cursor-pointer hover:text-yellow-400 transition-colors">{videoDetails.channelTitle}</span>
            </p>
          </div>

          {/* Description Snippet (Collapsible styled console box) */}
          <div className="bg-black/30 border border-card-border/60 rounded-xl p-4 max-h-32 overflow-y-auto text-xs text-gray-400 font-mono leading-relaxed custom-scrollbar">
            <span className="text-gray-500 uppercase tracking-widest block mb-1 text-[9px] font-semibold">Snippet log:</span>
            {videoDetails.description || "No video description available."}
          </div>
        </div>
      </div>
    </div>
  );
}
