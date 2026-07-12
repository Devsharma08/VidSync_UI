"use client";

interface AnalysisProgressProps {
  statusMessage: string;
  percentage: number;
}

export default function AnalysisProgress({ statusMessage, percentage }: AnalysisProgressProps) {
  const isActive = statusMessage && statusMessage !== "Analysis completed!";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center" style={{ backdropFilter: 'blur(6px)', background: 'rgba(8,9,12,0.75)' }}>
      {/* Ambient glow blobs */}
      <div className="absolute w-[420px] h-[420px] rounded-full bg-brand-indigo/10 blur-[100px] pointer-events-none animate-pulse-slow-glow" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-brand-red/8 blur-[80px] pointer-events-none animate-pulse-slow-glow" style={{ animationDelay: '2s' }} />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-card-bg border border-card-border/80 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6 overflow-hidden animate-modal-in border-shimmer">
        {/* Subtle top scanline sheen */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-indigo/50 to-transparent" />

        {/* Ring spinner */}
        <div className="relative flex items-center justify-center w-24 h-24">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full border-2 border-brand-indigo/15" />
          {/* Spinning arc */}
          <svg className="absolute inset-0 w-full h-full animate-spin" viewBox="0 0 96 96" fill="none">
            <circle
              cx="48" cy="48" r="44"
              stroke="url(#progressGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2.76 * percentage} ${276 - 2.76 * percentage}`}
              strokeDashoffset="69"
            />
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center percentage */}
          <span className="text-2xl font-black text-white font-mono tabular-nums">{percentage}%</span>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-indigo">
            {isActive ? "Pipeline Execution Active" : "Completing..."}
          </p>
          <h3 className="text-lg font-bold text-white leading-snug">
            VidSync Ingest Running
          </h3>
        </div>

        {/* Status message box */}
        <div className="w-full bg-panel-bg border border-card-border/70 rounded-xl p-4 flex items-start gap-3">
          <div className="space-y-0.5 min-w-0">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Current Task</p>
            <p className="text-sm font-semibold text-gray-200 leading-snug">
              {statusMessage || "Waiting to initialize stream analysis..."}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-panel-bg rounded-full overflow-hidden border border-card-border/50">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              background: 'linear-gradient(90deg, #6366f1, #ef4444, #10b981)'
            }}
          />
        </div>

        {/* Bottom shimmer line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-red/40 to-transparent" />
      </div>
    </div>
  );
}
