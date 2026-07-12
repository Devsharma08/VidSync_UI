export interface VideoDetails {
   id: string;
   title: string;
   description: string;
   thumbnail: string;
   channelTitle: string;
   channelId?: string;
   publishedAt?: string;
   viewCount?: string | number;
   likeCount?: string | number;
   commentCount?: string | number;
   isLiveStream: {
      actualStartTime?: string;
      actualLiveChatId?: string;
   };
}

export interface TimelineEvent {
   type: 'VOICE' | 'CHAT';
   timestamp: number;
   author?: string;
   message: string;
}

export interface TimelineBlock {
   startInSeconds: number;
   endInSeconds: number;
   events: TimelineEvent[];
   combinedText: string;
   embedding?: number[];
}

export interface Chapter {
   timestamp: string;
   seconds: number;
   highlightText: string;
}

export interface AnalysisResult {
   videoId: string;
   videoDetails: VideoDetails;
   summary: string;
   timelineBlocks: TimelineBlock[];
   markdownTimeline: string;
   totalEvents: number;
}

// API base URL — points directly to the deployed backend
export const API_BASE_URL = 'https://vidsync.docs.devsharma.dev';

/**
 * Custom fetch reader to parse Server-Sent Events (SSE) from a POST response stream.

 * It parses streams line-by-line, decodes them, and calls a callback for each chunk of data.
 */

export async function streamPostSSE(url: string, body: any, onMessage: (data: any) => void): Promise<void> {
   const res = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(body)
   })

   if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
   }

   const reader = res.body?.getReader();
   if (!reader) throw new Error('No response body');

   const decoder = new TextDecoder('utf-8');
   let buffer = "";
   while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      // decode the binary stream chunk to text and append to current buffer
      buffer += decoder.decode(value, { stream: true });

      // sse are separated by double new-lines (\n\n)
      const lines = buffer.split('\n\n');

      // update buffer with last (possibly incomplete line)
      buffer = lines.pop() || '';
      for (const line of lines) {
         const cleanLine = line.trim();
         if (!cleanLine) continue;

         // extract the payload string following 'data:' label
         if (cleanLine.startsWith('data:')) {
            const rawJson = cleanLine.substring(5).trim();
            try {
               const parseData = JSON.parse(rawJson);
               onMessage(parseData);
            } catch (err) {
               console.error('Failed to parse SSE data', err);
            }
         }
      }

      // Process each complete line
   }


}