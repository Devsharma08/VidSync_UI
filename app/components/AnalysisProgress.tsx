"use client";

interface AnalysisProgressProps {
  statusMessage: string;
  percentage: number;
}

export default function AnalysisProgress({ statusMessage, percentage }: AnalysisProgressProps) {
  // Determine if we are actively processing
  const isActive = statusMessage && statusMessage !== "Analysis completed!";

  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Glowing pulse indicator using our CSS animation */}
          {isActive ? (
            <div className="w-3 h-3 rounded-full bg-brand-red animate-pulse-grow" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-brand-emerald" />
          )}
          <span className="text-sm font-medium tracking-wide text-gray-200">
            {isActive ? "Pipeline Execution Active" : "Pipeline Idle"}
          </span>
        </div>
        <span className="text-xs font-mono text-gray-400 bg-panel-bg px-2.5 py-1 rounded-md border border-card-border">
          {percentage}% Complete
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-2.5 bg-panel-bg rounded-full overflow-hidden border border-card-border">
        <div
          className="h-full bg-gradient-to-r from-brand-indigo via-brand-red to-brand-emerald transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Current Step Description */}
      <div className="flex items-start gap-3 bg-panel-bg/50 border border-card-border/60 rounded-lg p-3.5">
        {isActive && (
          <svg className="animate-spin h-4 w-4 text-brand-indigo mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Current Operations Task</p>
          <p className="text-sm font-semibold text-gray-200">
            {statusMessage || "Waiting to initialize stream analysis..."}
          </p>
        </div>
      </div>
    </div>
  );
}
