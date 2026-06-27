"use client";

import { useState } from "react";

interface VideoInputProps {
  onAnalyze: (url: string, channelLink: string) => void;
  isLoading: boolean;
}

export default function VideoInput({ onAnalyze, isLoading }: VideoInputProps) {
  // Initialize with empty strings instead of undefined
  const [url, setUrl] = useState("");
  const [channelLink, setChannelLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("Please enter a valid YouTube video URL.");
      return;
    }

    // Basic YouTube URL regex validation
    const ytRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/.*$/;
    if (!ytRegex.test(url.trim())) {
      setError("The URL format must match YouTube (e.g. youtube.com/watch?v=...)");
      return;
    }

    // Now safe to trim both because they are guaranteed strings!
    onAnalyze(url.trim(), channelLink.trim());
  };

  return (
    <div className="bg-card-bg border border-card-border hover:border-card-hover-border rounded-xl p-6 shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-5">
        {/* Youtube Premium Icon (SVG) */}
        <svg className="w-8 h-8 text-brand-red animate-pulse-glow" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        <div>
          <h2 className="text-lg font-semibold tracking-wide text-gray-100">Ingest YouTube Stream</h2>
          <p className="text-xs text-gray-400">Compile transcripts, comments, and perform semantic analyses.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Video URL Input */}
        <div>
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            YouTube Video or Stream URL <span className="text-brand-red">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. https://www.youtube.com/watch?v=5qap5aO4i9A"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="w-full bg-panel-bg border border-card-border rounded-lg px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
          />
        </div>

        {/* Optional Streamer Channel Link Input */}
        <div>
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Streamer Channel URL <span className="text-gray-500">(Optional - for tracking streamer replies)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. https://youtube.com/@freecodecamp"
            value={channelLink}
            onChange={(e) => setChannelLink(e.target.value)}
            disabled={isLoading}
            className="w-full bg-panel-bg border border-card-border rounded-lg px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo transition-all"
          />
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="text-xs text-brand-red bg-brand-red/10 border border-brand-red/20 rounded-md p-3">
            {error}
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
            isLoading
              ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
              : "bg-brand-red hover:bg-brand-red-hover text-white shadow-lg shadow-brand-red/20 hover:shadow-brand-red/35 active:scale-[0.99] border border-transparent"
          }`}
        >
          {isLoading ? (
            <>
              {/* Spinner Icon */}
              <svg className="animate-spin h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Ingesting & Parsing...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.473L21 9l-3.382-3.382-7.805 7.805z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.813 13.904l3.568 3.568" />
              </svg>
              <span>Analyze Stream</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
