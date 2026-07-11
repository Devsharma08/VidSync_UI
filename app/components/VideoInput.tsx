"use client";

import { useState } from "react";

export type IngestAction = "analyze" | "metadata" | "transcripts" | "chapters";

interface VideoInputProps {
  onAction: (url: string, channelLink: string, action: IngestAction) => void;
  isLoading: boolean;
}

export default function VideoInput({ onAction, isLoading }: VideoInputProps) {
  const [url, setUrl] = useState("");
  const [channelLink, setChannelLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleTrigger = (action: IngestAction) => {
    setError(null);

    if (!url.trim()) {
      setError("Please enter a valid YouTube video URL.");
      return;
    }

    const ytRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/.*$/;
    if (!ytRegex.test(url.trim())) {
      setError("The URL format must match YouTube (e.g. youtube.com/watch?v=...)");
      return;
    }

    onAction(url.trim(), channelLink.trim(), action);
  };

  return (
    <div className="glass-panel hover:border-card-hover-border rounded-2xl p-6 shadow-2xl transition-all duration-500 hover:shadow-brand-red/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-brand-red/10 rounded-xl border border-brand-red/20 shadow-inner">
          <svg className="w-6 h-6 text-brand-red animate-pulse-grow" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
        <div>
          <h2 className="text-md font-bold tracking-wide text-gray-100 uppercase">VidSync Control Panel</h2>
          <p className="text-[11px] text-gray-400 font-medium">Ingest streams, translate transcripts, and query local AI.</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Video URL Input */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            YouTube Video or Stream URL <span className="text-brand-red">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. https://www.youtube.com/watch?v=5qap5aO4i9A"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="w-full bg-black/45 border border-card-border/80 rounded-xl px-4 py-3.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-red/60 focus:ring-1 focus:ring-brand-red/40 transition-all font-mono"
          />
        </div>

        {/* Optional Streamer Channel Link Input */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex justify-between">
            <span>Streamer Channel URL</span>
            <span className="text-gray-500 lowercase font-normal italic">optional</span>
          </label>
          <input
            type="text"
            placeholder="e.g. https://youtube.com/@freecodecamp"
            value={channelLink}
            onChange={(e) => setChannelLink(e.target.value)}
            disabled={isLoading}
            className="w-full bg-black/45 border border-card-border/80 rounded-xl px-4 py-3.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-indigo/60 focus:ring-1 focus:ring-brand-indigo/40 transition-all font-mono"
          />
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="text-xs text-brand-red bg-brand-red/10 border border-brand-red/20 rounded-xl p-4 font-medium">
            {error}
          </div>
        )}

        {/* Action Grid */}
        <div className="space-y-3 pt-2">
          {/* Main Action Button */}
          <button
            type="button"
            onClick={() => handleTrigger("analyze")}
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 ${
              isLoading
                ? "bg-gray-800/80 text-gray-500 cursor-not-allowed border border-gray-700/50"
                : "bg-gradient-to-r from-brand-red to-red-500 hover:from-brand-red-hover hover:to-red-600 text-white shadow-lg shadow-brand-red/20 hover:shadow-brand-red/35 active:scale-[0.985] border border-brand-red/30 cursor-pointer uppercase tracking-wider"
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Pipeline Running...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.473L21 9l-3.382-3.382-7.805 7.805z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.813 13.904l3.568 3.568" />
                </svg>
                <span>Run Ingest & Analysis Pipeline</span>
              </>
            )}
          </button>

          {/* Quick Actions Label */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-card-border/50"></div>
            <span className="flex-shrink mx-3 text-[9px] text-gray-500 uppercase tracking-widest font-bold">Or Quick Fetch Endpoints</span>
            <div className="flex-grow border-t border-card-border/50"></div>
          </div>

          {/* Sub Grid Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Action: Detail Check */}
            <button
              type="button"
              onClick={() => handleTrigger("metadata")}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-xl bg-black/35 border border-card-border/80 hover:border-brand-indigo/40 hover:bg-card-bg text-gray-300 hover:text-white transition-all text-[11px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <span>🔍</span> Metadata
            </button>

            {/* Action: Captions Check */}
            <button
              type="button"
              onClick={() => handleTrigger("transcripts")}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-xl bg-black/35 border border-card-border/80 hover:border-brand-emerald/40 hover:bg-card-bg text-gray-300 hover:text-white transition-all text-[11px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <span>📄</span> Captions
            </button>

            {/* Action: Chapters/Tags Check */}
            <button
              type="button"
              onClick={() => handleTrigger("chapters")}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-xl bg-black/35 border border-card-border/80 hover:border-brand-amber/40 hover:bg-card-bg text-gray-300 hover:text-white transition-all text-[11px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <span>🏷️</span> Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
