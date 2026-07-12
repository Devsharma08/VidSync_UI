"use client";

import { useState, useEffect } from "react";
import VideoInput, { IngestAction } from "./components/VideoInput";
import AnalysisProgress from "./components/AnalysisProgress";
import StreamMetadata from "./components/StreamMetadata";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import TimelineBlocksList from "./components/TimelineBlocksList";
import ChatRag from "./components/ChatRag";
import { streamPostSSE, VideoDetails, TimelineBlock, Chapter } from "./utils/video-api";

type Tab = "metadata" | "analytics" | "timeline" | "chat-qa" | "summary" | "sentiment";

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
  const [sentiment, setSentiment] = useState<{
    rating: number;
    positive: number;
    neutral: number;
    negative: number;
    summary: string;
  } | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Tab State
  const [activeTab, setActiveTab] = useState<Tab>("metadata");

  // Summary mode: detailed (~4000 chars), normal (~2000 chars), short (~800 chars)
  const [summaryMode, setSummaryMode] = useState<"detailed" | "normal" | "short">("normal");

  // Navigation and transition states
  const [view, setView] = useState<"home" | "dashboard">("home");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    if (view === "home") {
      const handleScroll = () => {
        if (window.scrollY > 80) {
          setShowFeatures(true);
        }
      };
      window.addEventListener("scroll", handleScroll);
      // Fallback if already scrolled
      if (window.scrollY > 80) {
        setShowFeatures(true);
      }
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [view]);

  const services = [
    { 
      name: "Metadata Fetch", 
      icon: "🔍", 
      color: "border-brand-indigo text-brand-indigo", 
      desc: "Retrieve channel handles, view counts, and stream details instantly.",
      bgGrad: "rgba(99, 102, 241, 0.12)",
      glowClass: "hover-glow-indigo",
      titleColor: "text-indigo-400"
    },
    { 
      name: "Captions Parser", 
      icon: "📄", 
      color: "border-brand-emerald text-brand-emerald", 
      desc: "Download and parse timed transcripts with multi-language fallback support.",
      bgGrad: "rgba(16, 185, 129, 0.12)",
      glowClass: "hover-glow-emerald",
      titleColor: "text-emerald-400"
    },
    { 
      name: "Chapter Analytics", 
      icon: "🏷️", 
      color: "border-brand-amber text-brand-amber", 
      desc: "Summarize major concept shifts and chapters via local AI processors.",
      bgGrad: "rgba(245, 158, 11, 0.12)",
      glowClass: "hover-glow-amber",
      titleColor: "text-amber-400"
    },
    { 
      name: "Interactive Q&A", 
      icon: "🤖", 
      color: "border-cyan-500 text-cyan-400", 
      desc: "Ask questions and query timeline contexts semantics using RAG embeddings.",
      bgGrad: "rgba(6, 182, 212, 0.12)",
      glowClass: "hover-glow-cyan",
      titleColor: "text-cyan-400"
    },
    { 
      name: "Sentiment Score", 
      icon: "🎭", 
      color: "border-pink-500 text-pink-400", 
      desc: "Evaluate comment sections using local Gemma configurations for sentiment ratios.",
      bgGrad: "rgba(236, 72, 153, 0.12)",
      glowClass: "hover-glow-pink",
      titleColor: "text-pink-400"
    },
    { 
      name: "AI Summary", 
      icon: "📝", 
      color: "border-brand-red text-brand-red", 
      desc: "Compile progressive analytical summaries on-demand via the SSE endpoint.",
      bgGrad: "rgba(239, 68, 68, 0.12)",
      glowClass: "hover-glow-red",
      titleColor: "text-red-400"
    },
  ];

  const enterDashboard = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setView("dashboard");
      setIsTransitioning(false);
    }, 850);
  };

  const handleAction = async (
    url: string,
    channelLink: string,
    action: IngestAction,
    options?: { fetchChat: boolean; generateEmbeddings: boolean; generateSummary: boolean; analyzeSentiment: boolean }
  ) => {
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
      setSentiment(null);
      setRecommendations([]);
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
          { url, channelLink, options },
          (data) => {
            if (data.message) {
              setStatusMessage(data.message);
              stepCount += 1;
              setPercentage(Math.min(10 + stepCount * 12, 90));
            }
            if (data.success) {
              console.log("[page.tsx] Ingest pipeline success payload:", data);
              setVideoDetails(data.videoDetails);
              setSummaryText(data.summary || "");
              setTimelineBlocks(data.timelineBlocks || []);
              setSentiment(data.sentiment || null);
              setRecommendations(data.recommendations || []);
              
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
      } else if (action === "summarize") {
        let accumulatedSummary = "";
        await streamPostSSE(
          "/api/ai/summarize",
          { url, mode: summaryMode },
          (data) => {
            if (data.status === "progress" && data.message) {
              setStatusMessage(data.message);
              if (data.percentage) {
                setPercentage(data.percentage);
              }
            }
            if (data.status === "token" && data.chunkText) {
              accumulatedSummary += data.chunkText;
              setSummaryText(accumulatedSummary);
            }
            if (data.status === "completed") {
              setSummaryText(data.summary || accumulatedSummary);
              setStatusMessage("Summary generated successfully!");
              setPercentage(100);
              setActiveTab("summary");
              setIsLoading(false);
            }
            if (data.status === "failure") {
              setError(data.message || "Failed to generate analytical summary.");
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

  const hasData = videoDetails || timelineBlocks.length > 0 || summaryText || analytics || sentiment || recommendations.length > 0;

  if (view === "home") {
    return (
      <main className="min-h-screen bg-transparent text-gray-100 flex flex-col font-sans relative overflow-x-hidden">
        {/* Glowing Mesh Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-brand-indigo/10 blur-[100px] pointer-events-none animate-pulse-slow-glow" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-brand-red/5 blur-[90px] pointer-events-none animate-pulse-slow-glow" />

        {/* Section 1: Hero Landing (100vh) */}
        <section className="h-screen flex flex-col items-center justify-center relative p-6 text-center z-10 w-full max-w-7xl mx-auto">
          <div className="space-y-6 animate-fade-up-hero w-full">
            <h1 className="text-[13vw] font-black tracking-tighter animate-text-sheen drop-shadow-2xl select-none leading-none w-full">
              VidSync
            </h1>
            <p className="text-sm md:text-md text-gray-300 font-medium tracking-wide max-w-xl mx-auto leading-relaxed">
              An advanced AI-powered multimodal stream ingest terminal. Decouple transcriptions, query timeline contexts semantically via local RAG, and map comment section sentiment.
            </p>
          </div>
          
          {/* Scroll Down Indicator */}
          <div className="absolute bottom-12 flex flex-col items-center gap-2 animate-bounce text-gray-500 hover:text-gray-400 cursor-default select-none text-xs">
            <span>Scroll Down to Console Features</span>
            <span className="text-base">↓</span>
          </div>
        </section>

        {/* Section 2: Features Grid (Bento Box Style, screen-wide jigsaw layout) */}
        <section className="max-w-7xl mx-auto w-full px-6 py-24 z-10 space-y-12 min-h-[90vh] flex flex-col justify-center">
          <div className="space-y-3 px-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-100 flex items-center gap-2.5">
              Powering Your Ingest Pipeline
            </h2>
            <p className="text-xs md:text-sm text-gray-400 max-w-xl">
              VidSync connects local models and YouTube services to parse live replay files asynchronously.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {services.map((svc, i) => {
              // Bento Box Grid spans to form a mathematically perfect, gapless rectangle jigsaw:
              // Card 0: col-span-2 row-span-1 h-[190px]
              // Card 1: col-span-1 row-span-2 h-[404px] (spans Rows 1 & 2 on the right column)
              // Card 2: col-span-1 row-span-1 h-[190px]
              // Card 3: col-span-1 row-span-1 h-[190px]
              // Card 4: col-span-2 row-span-1 h-[190px]
              // Card 5: col-span-1 row-span-1 h-[190px]
              const spans = [
                "col-span-1 md:col-span-2 row-span-1 h-[190px]",
                "col-span-1 md:col-span-1 row-span-2 h-[190px] md:h-[404px]",
                "col-span-1 md:col-span-1 row-span-1 h-[190px]",
                "col-span-1 md:col-span-1 row-span-1 h-[190px]",
                "col-span-1 md:col-span-2 row-span-1 h-[190px]",
                "col-span-1 md:col-span-1 row-span-1 h-[190px]"
              ];
              const spanClass = spans[i] || "col-span-1";

              return (
                <div
                  key={svc.name}
                  className={`bento-card rounded-3xl p-8 shadow-2xl flex flex-col justify-center transition-all duration-1000 ease-out relative overflow-hidden group ${svc.glowClass} ${spanClass} ${
                    showFeatures 
                      ? "translate-x-0 opacity-100" 
                      : "translate-x-[200px] opacity-0"
                  }`}
                  style={{ 
                    transitionDelay: `${i * 150}ms`,
                    backgroundImage: `linear-gradient(135deg, ${svc.bgGrad} 0%, rgba(13, 14, 18, 0.95) 100%), url('data:image/svg+xml;utf8,<svg width="40" height="40" fill="none" stroke="rgba(255,255,255,0.012)" stroke-width="1" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40"/></svg>')`
                  }}
                >
                  {/* Dim background icon watermark at the top-right */}
                  <div className="absolute top-4 right-6 text-7xl font-black text-white/[0.03] select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-110">
                    {svc.icon}
                  </div>

                  <div className="flex flex-col justify-center text-left pl-6 relative z-10">
                    <h3 className={`text-xl md:text-2xl font-black leading-tight tracking-wide ${svc.titleColor}`}>{svc.name}</h3>
                    <p className="text-xs text-gray-400 mt-3 leading-relaxed max-w-xl">{svc.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Footer */}
        <footer className={`border-t border-card-border/40 py-10 text-center text-xs text-gray-500 font-mono z-10 transition-opacity duration-1000 ${
          showFeatures ? "opacity-100" : "opacity-0"
        }`}>
          v1.2.0 • Powered by Ollama & Gemma3 • App Data: /home/devsharma08/.gemini
        </footer>

        {/* Floating Rotating Menu in Bottom-Right Corner */}
        <div className="fixed bottom-6 right-6 md:bottom-12 md:right-12 z-50 w-[180px] h-[180px] flex items-center justify-center">
          
          {/* Rotating Ring Container */}
          <div className={`absolute inset-0 flex items-center justify-center ${isTransitioning ? '' : 'animate-spin-circle'}`} style={{ transition: 'transform 0.8s ease-in-out' }}>
            {services.map((svc, i) => {
              const angle = i * 60;
              return (
                <div
                  key={svc.name}
                  className="absolute flex items-center justify-center"
                  style={{
                    transform: `rotate(${angle + (isTransitioning ? 720 : 0)}deg) translate(${isTransitioning ? 0 : 70}px) rotate(-${angle + (isTransitioning ? 720 : 0)}deg) scale(${isTransitioning ? 0 : 1})`,
                    transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s'
                  }}
                >
                  {/* Service Icon Node (No labels, w-12 h-12, text-xl) */}
                  <div className={`w-12 h-12 rounded-full glass-panel border ${svc.color} flex items-center justify-center shadow-lg ${isTransitioning ? '' : 'animate-spin-circle-reverse'}`}>
                    <span className="text-lg">{svc.icon}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Central Trigger FAB */}
          <button
            onClick={enterDashboard}
            disabled={isTransitioning}
            className={`w-14 h-14 rounded-full bg-gradient-to-tr from-brand-red via-brand-indigo to-brand-emerald p-[1.5px] transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-brand-indigo/35 z-20 cursor-pointer ${
              isTransitioning ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
            }`}
          >
            <div className="w-full h-full rounded-full bg-panel-bg flex items-center justify-center font-bold text-[10px] uppercase tracking-wider text-gray-200">
              Go
            </div>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-gray-100 flex flex-col font-sans dashboard-vignette relative">
      {/* Outer Layout Grid */}
      <div className="flex-grow p-4 md:p-6 max-w-[1600px] mx-auto w-full flex flex-col">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between border-b border-card-border/40 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("home")}
              className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors cursor-pointer border border-card-border/80 bg-black/45 hover:bg-black/75 px-3 py-2 rounded-xl"
            >
              <span>←</span> Hub
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-lg font-black tracking-tighter animate-text-sheen select-none">VidSync</span>
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest border border-card-border/60 px-2 py-0.5 rounded-md">Intel Terminal v1.2</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald status-ping" />
              BullMQ Worker
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald status-ping" />
              <span className="text-[11px] font-mono text-gray-400">Queue Node Online</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0" style={{ maxHeight: 'calc(100vh - 110px)' }}>
          {/* Left sidebar — scrollable internally */}
          <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 110px)' }}>
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

          </div>

          {/* Right workspace — 3 cols wide, scrollable */}
          <div className="lg:col-span-3 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 110px)' }}>
            {!hasData && !isLoading && (
              <div className="bg-card-bg border border-card-border rounded-3xl p-8 shadow-2xl flex flex-col space-y-6 animate-fade-up-hero">
                <div className="flex items-center gap-3 border-b border-card-border/60 pb-4">
                  <span className="text-3xl">📡</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">Ingest Terminal Workspace</h3>
                    <p className="text-xs text-gray-400">Welcome to the VidSync intelligence operations centre.</p>
                  </div>
                </div>
                
                <div className="space-y-4 text-left">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-brand-indigo font-mono">Quick Ingestion Guide</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bento-card p-6 rounded-2xl border border-card-border bg-black/20 flex flex-col justify-between min-h-[160px] hover:border-indigo-500/30 hover:shadow-brand-indigo/5">
                      <div className="text-indigo-400 text-sm font-bold">01. Pipeline Jobs</div>
                      <p className="text-[11px] text-gray-400 leading-relaxed mt-2">
                        Use <span className="text-white font-semibold">Pipeline Analysis</span> to run background jobs (captions parsing, chat extraction, concept vector indexing, summaries compilation).
                      </p>
                    </div>
                    <div className="bento-card p-6 rounded-2xl border border-card-border bg-black/20 flex flex-col justify-between min-h-[160px] hover:border-emerald-500/30 hover:shadow-brand-emerald/5">
                      <div className="text-emerald-400 text-sm font-bold">02. Quick Actions</div>
                      <p className="text-[11px] text-gray-400 leading-relaxed mt-2">
                        Use the <span className="text-white font-semibold">Quick Actions</span> to interact with standalone backend endpoints without queuing workloads in BullMQ.
                      </p>
                    </div>
                    <div className="bento-card p-6 rounded-2xl border border-card-border bg-black/20 flex flex-col justify-between min-h-[160px] hover:border-amber-500/30 hover:shadow-brand-amber/5">
                      <div className="text-amber-400 text-sm font-bold">03. RAG Q&A</div>
                      <p className="text-[11px] text-gray-400 leading-relaxed mt-2">
                        Ask direct Q&A about video events using the <span className="text-white font-semibold">RAG Q&A chat panel</span> once blocks are structured.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-panel-bg p-5 rounded-2xl border border-card-border/40 text-xs text-gray-400 leading-relaxed flex items-center gap-3 text-left">
                  <span className="text-lg">💡</span>
                  <span>
                    To begin, paste a valid YouTube video or stream link in the panel on the left and select the components to run.
                  </span>
                </div>
              </div>
            )}

            {hasData && (
              <div className="space-y-4">
                {/* Tab Navigation header */}
                <div className="bg-card-bg border border-card-border rounded-xl p-2 shadow-md flex flex-nowrap gap-1 overflow-x-auto">
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

                  {(sentiment || recommendations.length > 0) && (
                    <button
                      onClick={() => setActiveTab("sentiment")}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        activeTab === "sentiment"
                          ? "bg-panel-bg border border-card-border text-brand-amber shadow-sm"
                          : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      🎭 Audience Sentiment & Suggestions
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
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex-shrink-0 ${
                        activeTab === "summary"
                          ? "bg-panel-bg border border-card-border text-brand-red shadow-sm"
                          : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      📝 Analytical Summary
                    </button>
                  )}
                  {/* Summary tab always visible once it's the active tab, mode can be changed */}
                  {!summaryText && activeTab === "summary" && (
                    <button
                      onClick={() => setActiveTab("summary")}
                      className="px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex-shrink-0 bg-panel-bg border border-card-border text-brand-red shadow-sm"
                    >
                      📝 Analytical Summary
                    </button>
                  )}
                </div>

                {/* Tab Workspace Panels */}
                <div className="transition-all duration-300">
                  {activeTab === "metadata" && videoDetails && (
                    <div className="border-shimmer rounded-2xl">
                      <StreamMetadata videoDetails={videoDetails} />
                    </div>
                  )}

                  {activeTab === "analytics" && analytics && (
                    <div className="border-shimmer rounded-2xl">
                      <AnalyticsDashboard
                        suggestedTags={analytics.suggestedTags}
                        totalWordsProcessed={analytics.totalWordsProcessed}
                        chapters={analytics.chapters}
                      />
                    </div>
                  )}

                  {activeTab === "sentiment" && (sentiment || recommendations.length > 0) && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Sentiment Analysis Gauge Card */}
                      {sentiment && (
                        <div className="lg:col-span-2 bg-card-bg border border-card-border rounded-xl p-6 shadow-xl space-y-4">
                          <div className="flex items-center justify-between border-b border-card-border pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🎭</span>
                              <h3 className="text-md font-bold text-gray-100">Audience Sentiment Analysis</h3>
                            </div>
                            <div className="flex items-center gap-1.5 bg-brand-amber/10 border border-brand-amber/20 px-2.5 py-1 rounded-lg text-brand-amber font-bold text-xs">
                              <span>⭐</span> {sentiment.rating.toFixed(1)} / 5.0
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* Positive Bar */}
                            <div>
                              <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-1">
                                <span>Positive Reactions</span>
                                <span className="text-brand-emerald">{sentiment.positive}%</span>
                              </div>
                              <div className="w-full bg-black/35 rounded-full h-2 border border-card-border/50">
                                <div className="bg-brand-emerald h-full rounded-full transition-all duration-500" style={{ width: `${sentiment.positive}%` }} />
                              </div>
                            </div>

                            {/* Neutral Bar */}
                            <div>
                              <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-1">
                                <span>Neutral / Questions</span>
                                <span className="text-brand-indigo">{sentiment.neutral}%</span>
                              </div>
                              <div className="w-full bg-black/35 rounded-full h-2 border border-card-border/50">
                                <div className="bg-brand-indigo h-full rounded-full transition-all duration-500" style={{ width: `${sentiment.neutral}%` }} />
                              </div>
                            </div>

                            {/* Negative Bar */}
                            <div>
                              <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-1">
                                <span>Critical / Negative</span>
                                <span className="text-brand-red">{sentiment.negative}%</span>
                              </div>
                              <div className="w-full bg-black/35 rounded-full h-2 border border-card-border/50">
                                <div className="bg-brand-red h-full rounded-full transition-all duration-500" style={{ width: `${sentiment.negative}%` }} />
                              </div>
                            </div>

                            {/* Sentiment Summary */}
                            <div className="mt-6 bg-panel-bg p-4.5 rounded-xl border border-card-border/60 text-sm text-gray-300 leading-relaxed italic">
                              "{sentiment.summary}"
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Related Video Suggestions sidebar */}
                      {recommendations.length > 0 && (
                        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-xl space-y-4">
                          <div className="flex items-center gap-2 border-b border-card-border pb-3">
                            <span className="text-lg">📡</span>
                            <h3 className="text-md font-bold text-gray-100">Better Content Suggestions</h3>
                          </div>
                          
                          <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
                            {recommendations.map((rec) => (
                              <a
                                key={rec.id}
                                href={`https://youtube.com/watch?v=${rec.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex gap-3 bg-panel-bg hover:bg-black/25 border border-card-border hover:border-brand-indigo/40 rounded-xl p-2.5 transition-all group cursor-pointer text-left block"
                              >
                                <div className="relative flex-shrink-0 w-24 h-14 bg-black rounded-lg overflow-hidden border border-card-border">
                                  <img
                                    src={rec.thumbnailUrl}
                                    alt={rec.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                                  />
                                </div>
                                <div className="flex flex-col justify-center min-w-0">
                                  <h4 className="text-[11px] font-semibold text-gray-200 line-clamp-2 leading-tight group-hover:text-white transition-colors">
                                    {rec.title}
                                  </h4>
                                  <span className="text-[9px] text-gray-400 mt-1 truncate">{rec.channelTitle}</span>
                                  <span className="text-[9px] text-brand-indigo font-semibold mt-0.5 font-mono">
                                    {rec.viewCount >= 1000000 
                                      ? `${(rec.viewCount / 1000000).toFixed(1)}M views` 
                                      : rec.viewCount >= 1000 
                                        ? `${(rec.viewCount / 1000).toFixed(0)}K views` 
                                        : `${rec.viewCount} views`}
                                  </span>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "timeline" && timelineBlocks.length > 0 && (
                    <TimelineBlocksList blocks={timelineBlocks} />
                  )}

                  {activeTab === "chat-qa" && timelineBlocks.length > 0 && (
                    <ChatRag videoUrl={videoUrl} timelineBlocks={timelineBlocks} />
                  )}

                  {activeTab === "summary" && (
                    <div className="bg-card-bg border border-card-border rounded-2xl shadow-2xl overflow-hidden">
                      {/* Summary mode selector header */}
                      <div className="px-6 pt-6 pb-4 border-b border-card-border/60 flex flex-col gap-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📝</span>
                            <h3 className="text-md font-bold text-gray-100">AI Summary Generation</h3>
                          </div>
                          {summaryText && (
                            <span className="text-[10px] font-mono text-gray-500 bg-panel-bg border border-card-border px-2.5 py-1 rounded-lg">
                              {summaryText.length.toLocaleString()} chars generated
                            </span>
                          )}
                        </div>
                        {/* Mode pill selector */}
                        <div className="flex gap-2 flex-wrap items-center">
                          {([
                            { key: "detailed", label: "Detailed", hint: "~4 000 chars", color: "text-brand-indigo border-brand-indigo/40 bg-brand-indigo/10" },
                            { key: "normal",   label: "Normal",   hint: "~2 000 chars", color: "text-brand-emerald border-brand-emerald/40 bg-brand-emerald/10" },
                            { key: "short",    label: "Short",    hint: "~800 chars",   color: "text-brand-amber border-brand-amber/40 bg-brand-amber/10" },
                          ] as const).map(({ key, label, hint, color }) => (
                            <button
                              key={key}
                              onClick={() => setSummaryMode(key)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                                summaryMode === key
                                  ? color
                                  : "text-gray-500 border-card-border hover:text-gray-300 hover:border-card-hover-border"
                              }`}
                            >
                              {label}
                              <span className="opacity-60 font-normal">{hint}</span>
                            </button>
                          ))}
                          
                          <div className="ml-auto">
                            <button
                              onClick={() => handleAction(videoUrl, "", "summarize")}
                              disabled={isLoading}
                              className="bg-brand-red hover:bg-brand-red-hover text-white px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-brand-red/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                            >
                              {isLoading ? (
                                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              ) : (
                                <span>▶</span>
                              )}
                              <span>Generate</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Summary text body */}
                      {summaryText ? (
                        <div className="p-6">
                          <div className="text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-wrap bg-panel-bg p-5 rounded-xl border border-card-border/80 max-h-[500px] overflow-y-auto">
                            {summaryText}
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 flex flex-col items-center justify-center gap-3 text-center min-h-[200px]">
                          <span className="text-3xl opacity-40">📝</span>
                          <p className="text-sm text-gray-500">No summary generated yet.</p>
                          <p className="text-xs text-gray-600">Select a mode above then click <span className="text-gray-400 font-semibold">Generate</span> to create a live summary.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
