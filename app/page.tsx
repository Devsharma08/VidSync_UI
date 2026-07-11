"use client";

import { useState } from "react";
import VideoInput, { IngestAction } from "./components/VideoInput";
import AnalysisProgress from "./components/AnalysisProgress";
import StreamMetadata from "./components/StreamMetadata";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import TimelineBlocksList from "./components/TimelineBlocksList";
import ChatRag from "./components/ChatRag";
import { streamPostSSE, VideoDetails, TimelineBlock, Chapter } from "./utils/video-api";

type Tab = "metadata" | "analytics" | "timeline" | "chat-qa" | "summary";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Active Workspace Data States
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [timelineBlocks, setTimelineBlocks] = useState<TimelineBlock[]>([]);
  const [summaryText, setSummaryText] = useState("");
  const [analytics, setAnalytics] = useState<{
    suggestedTags: string[];
    totalWordsProcessed: number;
    chapters: Chapter[];
  } | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<Tab>("metadata");

  const handleAction = async (url: string, channelLink: string, action: IngestAction) => {
    setIsLoading(true);
    setError(null);
    setStatusMessage("Initializing request...");
    setPercentage(5);
    setVideoUrl(url);

    // Reset previous states depending on action to prevent stale views
    if (action === "analyze") {
      setVideoDetails(null);
      setTimelineBlocks([]);
      setSummaryText("");
      setAnalytics(null);
    } else if (action === "metadata") {
      setVideoDetails(null);
    } else if (action === "transcripts") {
      setSummaryText("");
      setTimelineBlocks([]);
    } else if (action === "chapters") {
      setAnalytics(null);
    }

    try {
      if (action === "metadata") {
        await streamPostSSE(
          "/api/video/detail",
          { url },
          (data) => {
            if (data.message) {
              setStatusMessage(data.message);
              setPercentage((prev) => Math.min(prev + 20, 85));
            }
            if (data.success && data.video) {
              setVideoDetails(data.video);
              setStatusMessage("Metadata fetched successfully!");
              setPercentage(100);
              setActiveTab("metadata");
              setIsLoading(false);
            }
            if (data.status === "error") {
              setError(data.message || "Failed to retrieve video details.");
              setIsLoading(false);
            }
          }
        );
      } else if (action === "transcripts") {
        await streamPostSSE(
          "/api/transcript",
          { url },
          (data) => {
            if (data.status === "progress" && data.message) {
              setStatusMessage(data.message);
              setPercentage((prev) => Math.min(prev + 25, 80));
            }
            if (data.status === "completed" && data.success) {
              setSummaryText(data.translatedText || "");
              
              // Map timelineSegments to pseudo voice blocks so they can render under timeline
              if (Array.isArray(data.timelineSegments)) {
                const mappedBlocks: TimelineBlock[] = data.timelineSegments.map(
                  (seg: any) => ({
                    startInSeconds: seg.startInSeconds,
                    endInSeconds: seg.startInSeconds + seg.durationInSeconds,
                    events: [
                      {
                        type: "VOICE",
                        timestamp: seg.startInSeconds,
                        message: seg.text,
                      },
                    ],
                    combinedText: seg.text,
                  })
                );
                setTimelineBlocks(mappedBlocks);
              }

              setStatusMessage("Transcript retrieved and translated!");
              setPercentage(100);
              setActiveTab("summary");
              setIsLoading(false);
            }
            if (data.status === "failure") {
              setError(data.message || "Failed to fetch closed caption transcript.");
              setIsLoading(false);
            }
          }
        );
      } else if (action === "chapters") {
        await streamPostSSE(
          "/api/process-outcomes",
          { url },
          (data) => {
            if (data.status === "progress" && data.message) {
              setStatusMessage(data.message);
              setPercentage((prev) => Math.min(prev + 20, 80));
            }
            if (data.status === "completed" && data.success) {
              setAnalytics({
                suggestedTags: data.analytics.suggestedTags || [],
                totalWordsProcessed: data.analytics.totalWordsProcessed || 0,
                chapters: data.analytics.chapters || [],
              });
              setStatusMessage("Chapters and keywords generated successfully!");
              setPercentage(100);
              setActiveTab("analytics");
              setIsLoading(false);
            }
            if (data.status === "failure") {
              setError(data.message || "Failed to process video outcomes.");
              setIsLoading(false);
            }
          }
        );
      } else if (action === "analyze") {
        // Pseudo percentage increments for BullMQ background stages
        let stepCount = 0;
        await streamPostSSE(
          "/api/video/analyze",
          { url, channelLink },
          (data) => {
            if (data.message) {
              setStatusMessage(data.message);
              stepCount += 1;
              setPercentage(Math.min(10 + stepCount * 12, 90));
            }
            if (data.success) {
              setVideoDetails(data.videoDetails);
              setSummaryText(data.summary || "");
              setTimelineBlocks(data.timelineBlocks || []);
              
              setStatusMessage("Analysis completed!");
              setPercentage(100);
              setActiveTab("timeline");
              setIsLoading(false);
            }
            if (data.status === "error") {
              setError(data.message || "Failed to complete queue operations.");
              setIsLoading(false);
            }
          }
        );
      }
    } catch (err: any) {
      console.error("[page.tsx] Execution error:", err);
      setError(err.message || "Connection timeout or proxy reject event.");
      setIsLoading(false);
    }
  };

  const hasData = videoDetails || timelineBlocks.length > 0 || summaryText || analytics;

  return (
    <main className="min-h-screen bg-transparent text-gray-100 flex flex-col font-sans">
      {/* Premium Header */}
      <header className="border-b border-card-border/40 bg-black/30 backdrop-blur-md sticky top-0 z-30 px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-red via-brand-indigo to-brand-emerald flex items-center justify-center font-bold text-lg shadow-lg text-white">
            VS
          </div>
          <div>
            <h1 className="text-md font-bold tracking-wider uppercase text-gray-100 flex items-center gap-2">
              VidSync Console <span className="text-[10px] bg-brand-indigo/15 text-brand-indigo font-bold px-2 py-0.5 rounded border border-brand-indigo/25">v1.2.0</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-medium">Post-Stream Live Analysis & Semantic Q&A</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
            Redis Queue Status: Online
          </span>
        </div>
      </header>

      {/* Outer Layout Grid */}
      <div className="flex-grow p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Hand side inputs and logs */}
        <div className="lg:col-span-1 space-y-6">
          <VideoInput onAction={handleAction} isLoading={isLoading} />
          
          {isLoading && (
            <AnalysisProgress statusMessage={statusMessage} percentage={percentage} />
          )}

          {error && (
            <div className="bg-brand-red/10 border border-brand-red/25 rounded-xl p-5 shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-brand-red font-semibold text-sm">
                <span>⚠️</span> Pipeline Operation Failed
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-mono">{error}</p>
            </div>
          )}

          {/* Quick instructions panel */}
          <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">Quick Guide</h3>
            <ul className="text-xs text-gray-400 space-y-2 list-disc pl-4 leading-relaxed">
              <li>Use **Pipeline Analysis** to run background jobs (captions parsing, chat extraction, concept vector indexing, summaries compilation).</li>
              <li>Use the **Quick Actions** to interact with standalone backend endpoints without queuing workloads in BullMQ.</li>
              <li>Ask direct Q&A about video events using the **RAG Q&A chat panel** once blocks are structured.</li>
            </ul>
          </div>
        </div>

        {/* Right Hand side details display workspace */}
        <div className="lg:col-span-2 space-y-6">
          {!hasData && !isLoading && (
            <div className="h-[450px] bg-card-bg border border-card-border border-dashed rounded-xl flex flex-col items-center justify-center text-center p-8 space-y-4">
              <span className="text-4xl">📡</span>
              <div>
                <h3 className="text-sm font-semibold text-gray-300">Ingest Terminal Idle</h3>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  Submit a valid YouTube link in the control panel to start fetching data logs, chapters, and Q&A chat pipelines.
                </p>
              </div>
            </div>
          )}

          {hasData && (
            <div className="space-y-4">
              {/* Tab Navigation header */}
              <div className="bg-card-bg border border-card-border rounded-xl p-2 shadow-md flex flex-wrap gap-1">
                {videoDetails && (
                  <button
                    onClick={() => setActiveTab("metadata")}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      activeTab === "metadata"
                        ? "bg-panel-bg border border-card-border text-brand-indigo shadow-sm"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    🔍 Metadata
                  </button>
                )}

                {analytics && (
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      activeTab === "analytics"
                        ? "bg-panel-bg border border-card-border text-brand-amber shadow-sm"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    📊 Chapters & Tags
                  </button>
                )}

                {timelineBlocks.length > 0 && (
                  <>
                    <button
                      onClick={() => setActiveTab("timeline")}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        activeTab === "timeline"
                          ? "bg-panel-bg border border-card-border text-brand-emerald shadow-sm"
                          : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      📅 Timeline Blocks
                    </button>
                    <button
                      onClick={() => setActiveTab("chat-qa")}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        activeTab === "chat-qa"
                          ? "bg-panel-bg border border-card-border text-brand-indigo shadow-sm"
                          : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      🤖 Interactive Q&A
                    </button>
                  </>
                )}

                {summaryText && (
                  <button
                    onClick={() => setActiveTab("summary")}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      activeTab === "summary"
                        ? "bg-panel-bg border border-card-border text-brand-red shadow-sm"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    📝 Analytical Summary
                  </button>
                )}
              </div>

              {/* Tab Workspace Panels */}
              <div className="transition-all duration-300">
                {activeTab === "metadata" && videoDetails && (
                  <StreamMetadata videoDetails={videoDetails} />
                )}

                {activeTab === "analytics" && analytics && (
                  <AnalyticsDashboard
                    suggestedTags={analytics.suggestedTags}
                    totalWordsProcessed={analytics.totalWordsProcessed}
                    chapters={analytics.chapters}
                  />
                )}

                {activeTab === "timeline" && timelineBlocks.length > 0 && (
                  <TimelineBlocksList blocks={timelineBlocks} />
                )}

                {activeTab === "chat-qa" && timelineBlocks.length > 0 && (
                  <ChatRag videoUrl={videoUrl} timelineBlocks={timelineBlocks} />
                )}

                {activeTab === "summary" && summaryText && (
                  <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-card-border pb-3">
                      <span className="text-lg">📝</span>
                      <h3 className="text-md font-bold text-gray-100">AI Summary Logs</h3>
                    </div>
                    <div className="text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-wrap bg-panel-bg p-5 rounded-lg border border-card-border/80 max-h-[500px] overflow-y-auto">
                      {summaryText}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
