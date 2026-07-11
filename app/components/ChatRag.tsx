"use client";

import { useState, useRef, useEffect } from "react";
import { streamPostSSE, TimelineBlock } from "../utils/video-api";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface ChatRagProps {
  videoUrl: string;
  timelineBlocks: TimelineBlock[];
}

export default function ChatRag({ videoUrl, timelineBlocks }: ChatRagProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat list on new message updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const handleSend = async (textToSend: string) => {
    const queryText = textToSend.trim();
    if (!queryText || isStreaming) return;

    setQuestion("");
    setIsStreaming(true);
    setStreamingText("");

    // Add user message to log
    setMessages((prev) => [...prev, { role: "user", text: queryText }]);

    try {
      let accumulatedText = "";
      await streamPostSSE(
        "/api/ai/query",
        {
          url: videoUrl,
          question: queryText,
          timelineBlocks: timelineBlocks,
        },
        (data) => {
          if (data.status === "token" && data.text) {
            accumulatedText += data.text;
            setStreamingText(accumulatedText);
          } else if (data.status === "completed") {
            // Save final streaming output
            setMessages((prev) => [
              ...prev,
              { role: "assistant", text: accumulatedText },
            ]);
            setStreamingText("");
            setIsStreaming(false);
          } else if (data.status === "error") {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", text: "⚠️ An error occurred during query execution." },
            ]);
            setStreamingText("");
            setIsStreaming(false);
          }
        }
      );
    } catch (err: any) {
      console.error("[ChatRag] Stream error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `⚠️ Connection failure: ${err.message}` },
      ]);
      setIsStreaming(false);
    }
  };

  const samplePrompts = [
    "What was the main topic discussed in this segment?",
    "Did the streamer address any errors or bugs?",
    "List the key takeaways or highlights.",
  ];

  return (
    <div className="bg-card-bg border border-card-border rounded-xl shadow-xl flex flex-col h-[550px] overflow-hidden">
      {/* Chat header */}
      <div className="bg-panel-bg/85 border-b border-card-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🤖</span>
          <div>
            <h2 className="text-md font-bold text-gray-100">Local AI Q&A (RAG Q&A)</h2>
            <p className="text-xs text-gray-400">Ask questions referenced against similarity-ranked vector blocks.</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald px-2 py-0.5 rounded uppercase">
          gemma3:1b Active
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-grow p-6 overflow-y-auto space-y-4">
        {messages.length === 0 && !streamingText && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-5 max-w-md mx-auto">
            <span className="text-4xl">👋</span>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-200">Start an AI Consultation</h3>
              <p className="text-xs text-gray-400">
                Ollama compiles embeddings in-memory. Ask details directly linked to video captions and chat timestamps.
              </p>
            </div>

            {/* Sample Prompts */}
            <div className="w-full space-y-2">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left bg-panel-bg border border-card-border hover:border-brand-indigo/60 rounded-lg p-3 text-xs text-gray-300 hover:text-white transition-all cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Render Message Logs */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed shadow ${
                msg.role === "user"
                  ? "bg-brand-indigo text-white rounded-br-none"
                  : "bg-panel-bg border border-card-border text-gray-200 rounded-bl-none"
              }`}
            >
              <div className="text-[10px] text-gray-400/85 font-mono mb-0.5 font-bold uppercase tracking-wider">
                {msg.role === "user" ? "You" : "VidSync AI"}
              </div>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {/* Live streaming text token bubble */}
        {streamingText && (
          <div className="flex justify-start">
            <div className="max-w-[85%] bg-panel-bg border border-card-border text-gray-200 rounded-xl rounded-bl-none px-4 py-3 text-sm leading-relaxed shadow">
              <div className="text-[10px] text-gray-400/85 font-mono mb-0.5 font-bold uppercase tracking-wider">
                VidSync AI (writing...)
              </div>
              <p className="whitespace-pre-wrap">{streamingText}</p>
            </div>
          </div>
        )}

        {/* Streaming Placeholder spinner */}
        {isStreaming && !streamingText && (
          <div className="flex justify-start items-center gap-2 text-xs text-gray-400 bg-panel-bg border border-card-border px-3 py-2 rounded-lg w-max shadow">
            <svg className="animate-spin h-3.5 w-3.5 text-brand-indigo" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>AI generating context...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Form area */}
      <div className="border-t border-card-border p-4 bg-panel-bg/40">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(question);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder={
              isStreaming
                ? "Waiting for AI model response..."
                : "Ask a question about the video transcript/chat..."
            }
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isStreaming}
            className="flex-grow bg-panel-bg border border-card-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isStreaming || !question.trim()}
            className="bg-brand-indigo hover:bg-brand-indigo/85 text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
