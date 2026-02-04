# AI Real-time Implementation Checklist

Use this checklist to verify all AI components are working correctly in real-time.

## ✅ Pre-Deployment Verification

### Environment Setup
- [ ] `VITE_SUPABASE_URL` is set
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` is set
- [ ] Supabase project has real-time enabled
- [ ] `ai_predictions` table exists with RLS policies
- [ ] Edge functions are deployed

### Edge Functions
- [ ] ai-orchestrator supports `stream: true`
- [ ] ai-smart-analyzer supports `stream: true`
- [ ] ai-credit-coach returns SSE stream
- [ ] ai-intelligence-hub supports `stream: true`
- [ ] ai-goal-roadmap supports `stream: true`
- [ ] All functions return `Content-Type: text/event-stream`
- [ ] Status events are emitted before results
- [ ] Error events are properly formatted

### React Components

#### AICommandCenter
- [ ] Imports `useAIPredictionsRealtime`
- [ ] Loads cached insights on mount
- [ ] Caches results for 6 hours
- [ ] Shows status messages during analysis
- [ ] Handles errors gracefully

#### AIDisputePredictor
- [ ] Imports `useAIPredictionsRealtime`
- [ ] Loads cached predictions on mount
- [ ] Caches results for 12 hours
- [ ] Shows status messages during prediction
- [ ] Handles missing items

#### AIBureauForecaster
- [ ] Imports `useAIPredictionsRealtime`
- [ ] Loads cached forecasts on bureau change
- [ ] Caches results for 6 hours per bureau
- [ ] Shows status messages during forecast
- [ ] Handles no active disputes

#### AISmartPrioritization
- [ ] Uses `useAIPredictionsRealtime`
- [ ] Loads cached prioritization on mount
- [ ] Real-time subscription active
- [ ] Shows status messages during analysis

#### AIGoalRoadmap
- [ ] Imports `useAIPredictionsRealtime`
- [ ] Loads cached roadmap on goal change
- [ ] Caches results for 24 hours
- [ ] Cache key includes goal type and target
- [ ] Shows status messages during generation

#### AICreditCoach
- [ ] Streams chat responses token-by-token
- [ ] Shows typing indicator during streaming
- [ ] Handles rate limits
- [ ] Scrolls to latest message

### Hooks & Utilities

#### useAIPredictionsRealtime
- [ ] Returns `getCachedPrediction` function
- [ ] Returns `cachePrediction` function
- [ ] Returns `fetchPredictions` function
- [ ] Real-time subscription is created
- [ ] Subscription cleanup on unmount
- [ ] Filter by user_id works
- [ ] Expiry checking works

#### readAiStream
- [ ] Handles SSE streams
- [ ] Handles non-streaming responses
- [ ] Emits status events
- [ ] Emits result events
- [ ] Throws on error events
- [ ] Proper reader cleanup
- [ ] Handles malformed events gracefully

### Database

#### ai_predictions Table
- [ ] Table exists in Supabase
- [ ] Columns: id, user_id, prediction_type, item_id, prediction_data, created_at, expires_at
- [ ] RLS policies allow user to read own predictions
- [ ] RLS policies allow user to insert/update own predictions
- [ ] Real-time is enabled for table
- [ ] Indexes exist on user_id and prediction_type

## 🧪 Testing Procedures

### Manual Testing

#### Test AI Command Center
1. Navigate to dashboard with AI Command Center
2. Click "Run AI Analysis"
3. Verify status message appears
4. Verify insights load within 10 seconds
5. Refresh page
6. Verify cached insights load instantly
7. Open in another browser/device
8. Verify insights sync across devices

#### Test Dispute Predictor
1. Navigate to disputes page
2. Ensure there are negative items
3. Click "Predict Success"
4. Verify status messages appear
5. Verify predictions display
6. Refresh page
7. Verify cached predictions load instantly

#### Test Bureau Forecaster
1. Navigate to disputes page
2. Ensure active disputes exist
3. Select a bureau
4. Click "Forecast"
5. Verify status messages appear
6. Verify forecasts display
7. Change bureau
8. Verify different cache loads

#### Test Goal Roadmap
1. Navigate to goal setting
2. Enter target score
3. Select goal type
4. Click "Generate Roadmap"
5. Verify status messages appear
6. Verify roadmap displays
7. Change goal
8. Verify new roadmap generates

#### Test Credit Coach
1. Open AI Credit Coach chat
2. Send a message
3. Verify typing indicator
4. Verify token-by-token streaming
5. Send follow-up message
6. Verify context is maintained

### Automated Testing

Run the test suite:
```bash
node scripts/test-ai-realtime.js
```

Expected output:
```
✅ AI Orchestrator: Returns streaming response
✅ AI Orchestrator Status Events: Emits status events
✅ AI Orchestrator Result: Returns result
✅ AI Smart Analyzer Streaming: text/event-stream
✅ AI Credit Coach Streaming: Returns streaming chat response
✅ AI Intelligence Hub Streaming: text/event-stream
✅ AI Goal Roadmap Streaming: text/event-stream

📊 Test Results: 7/7 passed
✅ All tests passed!
```

### Performance Testing

#### Caching Effectiveness
- [ ] First request takes 2-5 seconds
- [ ] Cached request takes < 100ms
- [ ] Cache persists across page refreshes
- [ ] Cache expires correctly based on TTL

#### Streaming Performance
- [ ] First status event within 500ms
- [ ] Status events during processing
- [ ] Result event within reasonable time
- [ ] No memory leaks during streaming

#### Real-time Sync
- [ ] Updates appear on other devices < 1 second
- [ ] Multiple users don't interfere
- [ ] Subscription reconnects on disconnect

## 🐛 Debugging

### Common Issues

#### Streaming Not Working
```bash
# Check response headers
curl -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"stream":true}' \
  $URL/functions/v1/ai-orchestrator -v
```

Expected: `Content-Type: text/event-stream`

#### Cache Not Persisting
```sql
-- Check ai_predictions table
SELECT * FROM ai_predictions 
WHERE user_id = 'your-user-id' 
ORDER BY created_at DESC 
LIMIT 10;
```

#### Real-time Not Syncing
```javascript
// Check in browser console
const { data, error } = await supabase
  .from('ai_predictions')
  .select('*')
  .eq('user_id', user.id);

console.log('Predictions:', data);
```

### Browser Console Checks

Open DevTools and verify:
- [ ] No CORS errors
- [ ] WebSocket connection active (for real-time)
- [ ] No 429 rate limit errors
- [ ] No uncaught exceptions during streaming

### Network Tab Checks

In DevTools Network tab:
- [ ] Request has `stream: true` in body
- [ ] Response type is `text/event-stream`
- [ ] Status codes are 200 (not 500/502)
- [ ] Events are visible in Preview tab

## 📊 Success Metrics

After implementation, you should see:

- **API Call Reduction**: 60-80% fewer AI API calls
- **Response Time**: < 1 second to first status event
- **Cache Hit Rate**: > 70% for repeated requests
- **User Experience**: Real-time feedback during processing
- **Multi-device Sync**: < 1 second sync time
- **Error Rate**: < 1% of requests

## 🚀 Production Readiness

Before deploying to production:

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console errors during normal operation
- [ ] Caching working correctly
- [ ] Real-time subscriptions active
- [ ] Error handling tested
- [ ] Rate limiting tested
- [ ] Documentation complete
- [ ] Team trained on new features

## 📝 Sign-off

- [ ] Developer: Implementation complete
- [ ] QA: Testing passed
- [ ] Product: Features approved
- [ ] DevOps: Infrastructure ready

---

**Date Completed**: __________

**Verified By**: __________

**Notes**:
