# VidSync — AI Stream Intel Terminal (Frontend)

[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vid-sync-ui.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)

A cinematic, dark-mode intelligence dashboard for VidSync — an AI-powered multimodal YouTube stream analysis platform. The UI streams real-time pipeline progress, renders timeline analytics, drives local RAG Q&A conversations, and displays audience sentiment scoring — all via Server-Sent Events from the deployed backend.

---

## Live Demo

| Environment | URL |
|---|---|
| Production | [https://vidsync.devsharma.dev](https://vidsync.devsharma.dev) |
| Vercel Mirror | [https://vid-sync-ui.vercel.app](https://vid-sync-ui.vercel.app) |

---

## Features

- **Full Pipeline Ingest** — Run background BullMQ jobs for transcript parsing, chat extraction, vector embedding, AI summarization, and sentiment scoring from a single URL input
- **Streaming AI Summary** — On-demand SSE-streamed Ollama summaries in Detailed / Normal / Short modes with live character count
- **Semantic RAG Q&A** — Ask natural language questions about any ingested video timeline block
- **Sentiment Dashboard** — Audience comment tone analysis (positive / neutral / negative %) powered by Grok API
- **Chapter Analytics** — Concept shift detection and keyword tagging across timeline segments
- **Cinematic UI** — Bento-box landing, scanline overlay, flowing border shimmer, animated vignette, status-ping indicators
- **Centered Loading Modal** — Full-screen overlay with animated SVG progress ring and live task messages
- **SEO Optimized** — Full Open Graph, Twitter Card, web app manifest, and favicon

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Vanilla CSS + custom design tokens |
| Data Streaming | Server-Sent Events (SSE) via custom `streamPostSSE` |
| Package Manager | pnpm |
| Deployment | Vercel |

---

## Project Structure

```
VidSync_UI/
├── app/
│   ├── components/
│   │   ├── AnalysisProgress.tsx   # Fullscreen centered loading overlay
│   │   ├── AnalyticsDashboard.tsx # Chapter + keyword analytics panel
│   │   ├── ChatRag.tsx            # RAG Q&A streaming chat interface
│   │   ├── StreamMetadata.tsx     # Video metadata + thumbnail panel
│   │   └── VideoInput.tsx         # URL input + pipeline options
│   ├── utils/
│   │   └── video-api.ts           # VideoDetails types + streamPostSSE
│   ├── globals.css                # Design tokens, animations, bento styles
│   ├── layout.tsx                 # Root layout + full SEO metadata
│   └── page.tsx                   # Main dashboard page
├── public/
│   ├── icon.png                   # App icon / favicon
│   ├── apple-touch-icon.png       # iOS home screen icon
│   └── site.webmanifest           # PWA manifest
└── next.config.ts
```

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build
```

> The app connects to the deployed backend at `https://vidsync.docs.devsharma.dev`. No local backend is required to run the UI.

---

## Deployment

Deployed on **Vercel** via automatic GitHub pushes to `main`. No extra build config needed.

```bash
git push origin main
```
