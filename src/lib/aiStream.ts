export type AiStreamEvent<T = unknown> = {
  type: 'status' | 'delta' | 'result' | 'error';
  message?: string;
  result?: T;
  analysisType?: string;
};

export async function readAiStream<T>(
  response: Response,
  onEvent?: (event: AiStreamEvent<T>) => void
): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const isEventStream = contentType.includes('text/event-stream');

  if (!response.ok && !isEventStream) {
    let errorText = 'AI request failed';
    try {
      const text = await response.text();
      const parsed = JSON.parse(text);
      errorText = parsed.error || text || errorText;
    } catch {
      // If parsing fails, use default error
    }
    throw new Error(errorText);
  }

  if (!isEventStream) {
    const data = await response.json();
    if (data?.error) {
      throw new Error(data.error);
    }
    if (data?.result !== undefined) {
      return data.result as T;
    }
    return data as T;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No stream available');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let lastResult: T | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        
        // Handle both 'data:' and 'event:' prefixes
        if (line.startsWith('event: ')) {
          continue; // Skip event type lines
        }
        
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const event = JSON.parse(jsonStr) as AiStreamEvent<T>;
          onEvent?.(event);

          if (event.type === 'error') {
            throw new Error(event.message || 'Stream error');
          }

          if (event.type === 'result') {
            lastResult = event.result as T;
          }
        } catch (parseError) {
          console.warn('Failed to parse stream event:', jsonStr, parseError);
          // Continue processing other events
        }
      }
    }
  } catch (error) {
    // Ensure reader is cancelled on error
    await reader.cancel();
    throw error;
  }

  if (lastResult !== null) {
    return lastResult;
  }

  throw new Error('Stream ended without result');
}
