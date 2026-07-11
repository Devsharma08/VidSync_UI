"use client";

import { Chapter } from "../utils/video-api";

interface AnalyticsDashboardProps {
  suggestedTags?: string[];
  totalWordsProcessed?: number;
  chapters?: Chapter[];
  onSeek?: (seconds: number) => void;
}

export default function AnalyticsDashboard({
  suggestedTags = [],
  totalWordsProcessed = 0,
  chapters = [],
  onSeek,
}: AnalyticsDashboardProps) {
  // Format seconds into digital display (hh:mm:ss)
  const formatSeconds = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = Math.floor(totalSecs % 60);

    const pad = (num: number) => String(num).padStart(2, "0");

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chapters/Highlights Section */}
      <div className="lg:col-span-2 bg-card-bg border border-card-border rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-card-border pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📅</span>
            <div>
              <h2 className="text-lg font-bold text-gray-100">Auto-Generated Chapters</h2>
              <p className="text-xs text-gray-400">Semantic transition nodes parsed from stream transcriptions.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-panel-bg border border-card-border px-2 py-1 rounded text-brand-amber uppercase font-semibold tracking-wider">
            {chapters.length} Chapters
          </span>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-12 bg-panel-bg/40 border border-dashed border-card-border/60 rounded-lg text-gray-500 text-sm">
            No auto-chapters available for this video structure.
          </div>
        ) : (
          <div className="relative border-l-2 border-brand-indigo/30 ml-4 pl-6 space-y-6 max-h-[500px] overflow-y-auto pr-2">
            {chapters.map((chapter, index) => (
              <div key={index} className="relative group">
                {/* Timeline Bullet Anchor */}
                <div 
                  className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-2 border-brand-indigo bg-card-bg group-hover:bg-brand-indigo transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center"
                  onClick={() => onSeek?.(chapter.seconds)}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo group-hover:bg-white" />
                </div>

                <div className="bg-panel-bg border border-card-border hover:border-card-hover-border rounded-lg p-4 transition-all duration-300">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span 
                      onClick={() => onSeek?.(chapter.seconds)}
                      className="font-mono text-xs font-bold text-brand-indigo bg-brand-indigo/10 border border-brand-indigo/20 px-2 py-0.5 rounded cursor-pointer hover:bg-brand-indigo hover:text-white transition-all"
                    >
                      {chapter.timestamp || formatSeconds(chapter.seconds)}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">Chapter #{index + 1}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
                    {chapter.highlightText}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Tags & Analytics Stats */}
      <div className="space-y-6">
        {/* Processing Statistics */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-card-border pb-3">
            <span className="text-lg">📊</span>
            <h3 className="text-md font-bold text-gray-100">Processing Stats</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-panel-bg border border-card-border rounded-lg p-3.5 text-center">
              <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">
                Words Counted
              </span>
              <span className="text-xl font-bold font-mono text-brand-emerald">
                {totalWordsProcessed.toLocaleString()}
              </span>
            </div>
            <div className="bg-panel-bg border border-card-border rounded-lg p-3.5 text-center">
              <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">
                Avg. Speed
              </span>
              <span className="text-xl font-bold font-mono text-brand-indigo">
                {totalWordsProcessed > 0 ? `${Math.round(totalWordsProcessed / 150)} min` : "0 min"}
              </span>
            </div>
          </div>
        </div>

        {/* Suggested Keyword Tags */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-card-border pb-3">
            <span className="text-lg">🏷️</span>
            <h3 className="text-md font-bold text-gray-100">AI Suggested Tags</h3>
          </div>
          {suggestedTags.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No keywords extracted yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-panel-bg border border-card-border text-gray-300 hover:text-white hover:border-brand-indigo/60 transition-all cursor-default select-none"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
