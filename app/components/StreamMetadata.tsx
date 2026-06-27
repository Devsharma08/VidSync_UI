"use client";

import { VideoDetails } from "../utils/video-api";

interface StreamMetadataProps {
  videoDetails: VideoDetails;
}

export default function StreamMetadata({ videoDetails }: StreamMetadataProps) {
  // Format the ISO publish date to a clean, readable local format
  const formatPublishDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const isLive = !!videoDetails.isLiveStream;

  return (
    <div className="bg-card-bg border border-card-border hover:border-card-hover-border rounded-xl overflow-hidden shadow-xl transition-all duration-300">
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail Preview Area */}
        <div className="relative md:w-80 h-48 md:h-auto bg-black flex-shrink-0 border-b md:border-b-0 md:border-r border-card-border">
          <img
            src={videoDetails.thumbnail || "/api/placeholder/400/225"}
            alt={videoDetails.title}
            className="w-full h-full object-cover"
          />
          {/* Live Indicator overlay badge */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isLive ? (
              <span className="bg-brand-red text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-md animate-pulse-grow">
                LIVE
              </span>
            ) : (
              <span className="bg-gray-800/80 text-gray-200 text-xs font-medium px-2.5 py-1 rounded shadow-md backdrop-blur-sm">
                VOD / ARCHIVE
              </span>
            )}
          </div>
        </div>

        {/* Video Information Panel */}
        <div className="p-6 flex flex-col justify-between flex-grow space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-brand-indigo bg-brand-indigo/10 px-2 py-0.5 rounded border border-brand-indigo/20">
                YouTube Video Ingested
              </span>
              <span className="text-xs text-gray-400">
                Uploaded {formatPublishDate(videoDetails.publishedAt)}
              </span>
            </div>
            
            <h1 className="text-xl font-bold text-gray-100 leading-snug tracking-wide line-clamp-2">
              {videoDetails.title}
            </h1>
            
            <p className="text-sm font-medium text-brand-amber">
              Channel: <span className="underline cursor-pointer">{videoDetails.channelTitle}</span>
            </p>
          </div>

          {/* Description Snippet (Collapsible styled console box) */}
          <div className="bg-panel-bg/60 border border-card-border/80 rounded-lg p-3 max-h-24 overflow-y-auto text-xs text-gray-400 font-mono leading-relaxed">
            <span className="text-gray-500 uppercase tracking-widest block mb-1 text-[10px]">Snippet log:</span>
            {videoDetails.description || "No video description available."}
          </div>
        </div>
      </div>
    </div>
  );
}
