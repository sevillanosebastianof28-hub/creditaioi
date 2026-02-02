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
    const errorText = await response.text();
    throw new Error(errorText || 'AI request failed');
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
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (!jsonStr) continue;

      const event = JSON.parse(jsonStr) as AiStreamEvent<T>;
      onEvent?.(event);

      if (event.type === 'error') {
        throw new Error(event.message || 'Stream error');
      }

      if (event.type === 'result') {
        return event.result as T;
      }
    }
  }

  throw new Error('Stream ended without result');
}
