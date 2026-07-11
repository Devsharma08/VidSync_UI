"use client";

import { useState } from "react";
import { TimelineBlock, TimelineEvent } from "../utils/video-api";

interface TimelineBlocksListProps {
  blocks: TimelineBlock[];
  onSeek?: (seconds: number) => void;
}

export default function TimelineBlocksList({ blocks = [], onSeek }: TimelineBlocksListProps) {
  const [filterType, setFilterType] = useState<"all" | "chat" | "voice">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const formatSeconds = (totalSecs: number) => {
    if (totalSecs === undefined || totalSecs === null || isNaN(totalSecs)) return "00:00";
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Filter blocks according to selected filter types and user search query text
  const filteredBlocks = blocks.filter((block) => {
    if (!block) return false;
    // Search query matching
    const matchesSearch =
      searchQuery.trim() === "" ||
      (block.combinedText || "").toLowerCase().includes(searchQuery.toLowerCase());

    // Type checking
    if (filterType === "all") return matchesSearch;
    if (filterType === "chat") {
      return (
        matchesSearch &&
        Array.isArray(block.events) &&
        block.events.some((event) => event?.type === "CHAT")
      );
    }
    if (filterType === "voice") {
      return (
        matchesSearch &&
        Array.isArray(block.events) &&
        block.events.some((event) => event?.type === "VOICE")
      );
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filtering Header Toolbar */}
      <div className="bg-card-bg border border-card-border rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-md font-bold text-gray-100">Timeline Block Ingests</h2>
          <p className="text-xs text-gray-400">Chronological 2-minute compiled segments of speech and aligned chat logs.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Text Search Input */}
          <input
            type="text"
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48 bg-panel-bg border border-card-border rounded-lg px-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-indigo transition-all"
          />

          {/* Filter Pills */}
          <div className="flex items-center bg-panel-bg p-1 rounded-lg border border-card-border">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-brand-indigo text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              All Blocks
            </button>
            <button
              onClick={() => setFilterType("chat")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                filterType === "chat"
                  ? "bg-brand-red text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              With Chat
            </button>
            <button
              onClick={() => setFilterType("voice")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                filterType === "voice"
                  ? "bg-brand-emerald text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Only Speech
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Blocks Scroller */}
      {filteredBlocks.length === 0 ? (
        <div className="text-center py-16 bg-card-bg border border-card-border rounded-xl text-gray-500 text-sm shadow-xl">
          No matching timeline segments located.
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {filteredBlocks.map((block, idx) => {
            if (!block) return null;
            const blockEvents = Array.isArray(block.events) ? block.events : [];
            const hasChat = blockEvents.some((e) => e?.type === "CHAT");
            const voiceEvents = blockEvents.filter((e) => e?.type === "VOICE");
            const chatEvents = blockEvents.filter((e) => e?.type === "CHAT");

            return (
              <div
                key={idx}
                className="bg-card-bg border border-card-border hover:border-card-hover-border rounded-xl p-5 shadow-xl transition-all duration-300 grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                {/* Block Timestamp Info */}
                <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-card-border pb-3 md:pb-0 md:pr-4 flex md:flex-col justify-between md:justify-start gap-2">
                  <div>
                    <span
                      onClick={() => onSeek?.(block.startInSeconds ?? 0)}
                      className="font-mono text-sm font-bold text-brand-indigo bg-brand-indigo/10 border border-brand-indigo/20 px-3 py-1 rounded cursor-pointer hover:bg-brand-indigo hover:text-white transition-all inline-block"
                    >
                      {formatSeconds(block.startInSeconds ?? 0)} - {formatSeconds(block.endInSeconds ?? 0)}
                    </span>
                    <span className="block text-[10px] text-gray-500 font-mono mt-2">
                      Duration: 120s
                    </span>
                  </div>

                  <div className="flex md:flex-col gap-1.5 md:mt-auto">
                    {hasChat && (
                      <span className="text-[10px] font-bold text-brand-red bg-brand-red/10 border border-brand-red/20 px-2 py-0.5 rounded text-center">
                        💬 Streamer Chat Inside
                      </span>
                    )}
                    {block.embedding && (
                      <span className="text-[10px] font-bold text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-2 py-0.5 rounded text-center">
                        🎯 Embeddings Cached
                      </span>
                    )}
                  </div>
                </div>

                {/* Block Content (Spoken voice transcript & synchronized comments) */}
                <div className="md:col-span-3 space-y-4">
                  {/* Spoken transcript box */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1.5">
                      🗣️ Spoken Transcript
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed font-sans">
                      {voiceEvents.length > 0
                        ? voiceEvents.map((e) => e?.message || "").join(" ")
                        : "No voice audio was detected during this segment."}
                    </p>
                  </div>

                  {/* Comments/Live replies list */}
                  {chatEvents.length > 0 && (
                    <div className="pt-3 border-t border-card-border/60">
                      <h4 className="text-xs uppercase tracking-wider text-brand-red/80 font-semibold mb-2">
                        💬 Synchronized Streamer Chats
                      </h4>
                      <div className="space-y-2">
                        {chatEvents.map((chat, chatIdx) => {
                          if (!chat) return null;
                          return (
                            <div
                              key={chatIdx}
                              className="bg-panel-bg/70 border border-card-border rounded-lg p-2.5 text-xs flex items-start gap-2.5 hover:border-brand-red/35 transition-colors"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-red mt-1.5 flex-shrink-0" />
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-200">
                                    {chat.author || "Anonymous"}
                                  </span>
                                  <span className="text-[10px] text-gray-500 font-mono">
                                    at {formatSeconds(chat.timestamp ?? 0)}
                                  </span>
                                </div>
                                <p className="text-gray-400 italic">"{chat.message || ""}"</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
