# AI Real-time Implementation Guide

## Overview

All AI components in CreditAI now support **real-time streaming** and **intelligent caching** for optimal performance and user experience.

## Key Features

### 1. **Streaming Responses**
All AI edge functions support server-sent events (SSE) for real-time streaming:
- Status updates during processing
- Incremental results
- Error notifications
- Processing completion

### 2. **Real-time Database Subscriptions**
AI predictions are cached in Supabase and automatically sync across all clients:
- `ai_predictions` table stores cached results
- Real-time subscriptions via Postgres changes
- Automatic cache invalidation on expiry
- Multi-device synchronization

### 3. **Intelligent Caching**
Each AI component implements smart caching:
- **AI Insights**: 6 hours
- **Dispute Predictions**: 12 hours
- **Bureau Forecasts**: 6 hours (per bureau)
- **Goal Roadmaps**: 24 hours (per goal configuration)
- **Smart Prioritization**: Uses real-time subscription

## Architecture

```
┌─────────────────┐
│  UI Components  │ (React)
└────────┬────────┘
         │
         ├─── useAIPredictionsRealtime() ──> Real-time subscriptions
         │
         └─── readAiStream() ──────────────> Stream processing
                     │
                     ↓
         ┌───────────────────────┐
         │   Edge Functions      │ (Deno)
         │  - ai-orchestrator    │
         │  - ai-smart-analyzer  │
         │  - ai-credit-coach    │
         │  - ai-intelligence-hub│
         │  - ai-goal-roadmap    │
         └───────────┬───────────┘
                     │
                     ├──> Streaming SSE responses
                     │
                     └──> Cache to ai_predictions
                              │
                              ↓
                      ┌──────────────┐
                      │  Supabase    │
                      │  Realtime    │
                      └──────────────┘
```

## Components

### AICommandCenter
**Real-time Features:**
- Streams AI insights generation
- Caches insights for 6 hours
- Auto-refreshes on cache invalidation
- Shows live status during analysis

**Usage:**
```tsx
import { AICommandCenter } from '@/components/ai/AICommandCenter';

<AICommandCenter />
```

### AIDisputePredictor
**Real-time Features:**
- Streams success predictions
- Caches predictions for 12 hours
- Real-time subscription to prediction updates
- Visual probability indicators

**Usage:**
```tsx
import { AIDisputePredictor } from '@/components/ai/AIDisputePredictor';

<AIDisputePredictor />
```

### AIBureauForecaster
**Real-time Features:**
- Streams bureau response forecasts
- Per-bureau caching (6 hours)
- Real-time updates when new data arrives
- Estimated response dates

**Usage:**
```tsx
import { AIBureauForecaster } from '@/components/ai/AIBureauForecaster';

<AIBureauForecaster />
```

### AISmartPrioritization
**Real-time Features:**
- Streams item prioritization
- Real-time subscription via useAIPredictionsRealtime
- Auto-refreshes when items change
- Score impact calculations

**Usage:**
```tsx
import { AISmartPrioritization } from '@/components/ai/AISmartPrioritization';

<AISmartPrioritization />
```

### AIGoalRoadmap
**Real-time Features:**
- Streams roadmap generation
- 24-hour caching per goal configuration
- Real-time milestone tracking
- Progress visualization

**Usage:**
```tsx
import { AIGoalRoadmap } from '@/components/ai/AIGoalRoadmap';

<AIGoalRoadmap />
```

### AICreditCoach
**Real-time Features:**
- Streams chat responses token-by-token
- Contextual awareness of credit data
- Real-time typing indicators
- Message history persistence

**Usage:**
```tsx
import { AICreditCoach } from '@/components/ai/AICreditCoach';

<AICreditCoach />
```

## Hooks

### useAIPredictionsRealtime
Core hook for real-time AI predictions with caching.

**Features:**
- Automatic Supabase real-time subscriptions
- Intelligent cache management
- Expiry-based auto-refresh
- Type-safe prediction data

**Example:**
```typescript
import { useAIPredictionsRealtime } from '@/hooks/useAIPredictions';

function MyComponent() {
  const { getCachedPrediction, cachePrediction } = useAIPredictionsRealtime<MyDataType>();

  // Load cached data
  useEffect(() => {
    const load = async () => {
      const cached = await getCachedPrediction('my_prediction_type');
      if (cached) {
        setData(cached.prediction_data);
      }
    };
    load();
  }, [getCachedPrediction]);

  // Save new prediction
  const runAnalysis = async () => {
    const result = await fetchAnalysis();
    await cachePrediction('my_prediction_type', result, 'optional-item-id', 6);
  };
}
```

### useAIOrchestrator
Main orchestrator for AI operations with streaming support.

**Example:**
```typescript
import { useAIOrchestrator } from '@/hooks/useAIOrchestrator';

function MyComponent() {
  const { orchestrate, isProcessing, statusMessage } = useAIOrchestrator();

  const handleAnalysis = async () => {
    const result = await orchestrate(
      'analyze_report',
      'Analyze this credit report',
      { bureau: 'experian' }
    );
  };

  return (
    <div>
      {isProcessing && <p>{statusMessage}</p>}
    </div>
  );
}
```

## Utilities

### readAiStream
Low-level utility for processing server-sent events.

**Features:**
- Handles both streaming and non-streaming responses
- Error recovery and retry logic
- Event-based status updates
- Type-safe result extraction

**Example:**
```typescript
import { readAiStream } from '@/lib/aiStream';

const response = await fetch('/api/ai-function', {
  body: JSON.stringify({ stream: true })
});

const result = await readAiStream<MyResultType>(response, (event) => {
  if (event.type === 'status') {
    console.log('Status:', event.message);
  }
});
```

## Edge Function Implementation

All edge functions follow this pattern for streaming:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { stream } = await req.json();
  
  if (stream) {
    const encoder = new TextEncoder();
    const streamBody = new TransformStream();
    const writer = streamBody.writable.getWriter();

    const sendEvent = async (event: string, data: Record<string, unknown>) => {
      await writer.write(
        encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
      );
    };

    await sendEvent('status', { type: 'status', message: 'Processing...' });
    
    // ... do AI processing ...
    
    await sendEvent('result', { type: 'result', result: yourResult });
    await writer.close();

    return new Response(streamBody.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  }
  
  // Non-streaming response
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" }
  });
});
```

## Testing

Run the comprehensive test suite:

```bash
node scripts/test-ai-realtime.js
```

This tests:
- ✅ All edge functions return streaming responses
- ✅ Status events are emitted
- ✅ Results are properly formatted
- ✅ Error handling works correctly
- ✅ Content-Type headers are correct

## Performance Optimization

### Caching Strategy
1. **Short-lived predictions** (6 hours): Bureau forecasts, AI insights
2. **Medium-lived predictions** (12 hours): Dispute success predictions
3. **Long-lived predictions** (24 hours): Goal roadmaps

### Real-time Efficiency
- Subscriptions only active when component is mounted
- Automatic cleanup on unmount
- Debounced cache updates
- Conditional re-fetching based on expiry

## Error Handling

All components implement comprehensive error handling:

1. **Network errors**: Retry with exponential backoff
2. **Stream errors**: Graceful degradation to cached data
3. **Parse errors**: Logged and skipped, processing continues
4. **Timeout errors**: 10-second default timeout with cancellation

## Monitoring

### Real-time Connection Monitor
Add to your app to monitor AI connection status:

```tsx
import { AIRealtimeMonitor } from '@/components/ai/AIRealtimeMonitor';

function App() {
  return (
    <>
      <AIRealtimeMonitor />
      {/* rest of app */}
    </>
  );
}
```

### Status Indicators
Use the status indicator component for visual feedback:

```tsx
import { AIStatusIndicator } from '@/components/ai/AIStatusIndicator';

<AIStatusIndicator 
  status="loading" 
  message="Analyzing credit report..." 
  progress={65} 
/>
```

## Best Practices

1. **Always enable streaming** for AI operations
2. **Cache results** to reduce API calls
3. **Show status messages** during processing
4. **Handle errors gracefully** with user-friendly messages
5. **Implement loading states** for better UX
6. **Use real-time subscriptions** for multi-device sync
7. **Monitor connection status** in production
8. **Test streaming** before deploying

## Troubleshooting

### Streaming not working
- Check Content-Type header is `text/event-stream`
- Verify `stream: true` is passed in request
- Check browser console for CORS errors

### Cache not updating
- Verify expiry time is set correctly
- Check Supabase real-time is enabled
- Ensure user is authenticated

### Real-time subscription issues
- Check Supabase project settings
- Verify table RLS policies
- Check browser console for subscription errors

## Future Enhancements

- [ ] WebSocket support for bidirectional communication
- [ ] Progressive streaming for large datasets
- [ ] Compression for streaming responses
- [ ] Client-side prediction interpolation
- [ ] Advanced caching strategies (LRU, TTL)
- [ ] Offline support with service workers
