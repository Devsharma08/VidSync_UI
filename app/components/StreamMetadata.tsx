"use client";

import { VideoDetails } from "../utils/video-api";

interface StreamMetadataProps {
  videoDetails: VideoDetails;
}

// Strip HTML tags and decode common HTML entities from raw YouTube text
function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatNumber(n: string | number | undefined): string {
  const num = Number(n || 0);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

export default function StreamMetadata({ videoDetails }: StreamMetadataProps) {
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
  const hqUrl    = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`    : "";
  const cleanDescription = stripHtml(videoDetails.description || "");

  return (
    <div className="bg-gradient-to-br from-card-bg to-panel-bg border border-card-border/80 hover:border-brand-indigo/30 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-brand-indigo/5 flex flex-col">

      {/* Full-width Thumbnail */}
      <div className="relative w-full h-52 md:h-64 bg-black/40 overflow-hidden group flex-shrink-0">
        {videoId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={maxResUrl}
            alt={videoDetails.title || "Video Thumbnail"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="eager"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (!img.src.includes("hqdefault")) img.src = hqUrl;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 bg-panel-bg">
            <span>No Thumbnail</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

        {/* Live / VOD badge */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
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

        {/* Title overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h1 className="text-base md:text-lg font-bold text-white leading-snug tracking-wide line-clamp-2 drop-shadow-lg">
            {videoDetails.title}
          </h1>
        </div>
      </div>

      {/* Metadata + Stats Row */}
      <div className="px-5 pt-4 pb-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-card-border/60">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Channel</span>
          <span className="text-xs font-semibold text-brand-amber truncate max-w-[180px]">{videoDetails.channelTitle}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Published</span>
          <span className="text-xs text-gray-300 font-medium">{formatPublishDate(videoDetails.publishedAt)}</span>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <span className="flex items-center gap-1 text-[11px] text-gray-300 font-medium">
            <span>👁</span> {formatNumber(videoDetails.viewCount)}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-gray-300 font-medium">
            <span>♥</span> {formatNumber(videoDetails.likeCount)}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-gray-300 font-medium">
            <span>💬</span> {formatNumber(videoDetails.commentCount)}
          </span>
        </div>
      </div>

      {/* Full-width Snippet Log */}
      <div className="px-5 py-4">
        <span className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-bold block mb-2">Snippet Log</span>
        <div className="bg-black/30 border border-card-border/60 rounded-xl p-4 max-h-44 overflow-y-auto text-xs text-gray-400 font-mono leading-relaxed whitespace-pre-wrap">
          {cleanDescription || "No video description available."}
        </div>
      </div>
    </div>
  );
}
