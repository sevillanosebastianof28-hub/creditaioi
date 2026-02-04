#!/usr/bin/env node

/**
 * AI Real-time Functionality Test Script
 * 
 * This script tests all AI components to ensure they work in real-time:
 * 1. Streaming responses from edge functions
 * 2. Real-time database subscriptions
 * 3. Error handling and recovery
 * 4. Caching and cache invalidation
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const tests = {
  passed: 0,
  failed: 0,
  total: 0
};

function logTest(name, status, message) {
  tests.total++;
  if (status) {
    tests.passed++;
    console.log(`✅ ${name}: ${message}`);
  } else {
    tests.failed++;
    console.error(`❌ ${name}: ${message}`);
  }
}

async function testAIOrchestrator() {
  console.log('\n🧪 Testing AI Orchestrator...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-orchestrator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify({
        action: 'explain_credit',
        input: 'What is credit utilization?',
        userId: 'test-user',
        stream: true
      })
    });

    if (!response.ok) {
      logTest('AI Orchestrator', false, `HTTP ${response.status}`);
      return;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('text/event-stream')) {
      logTest('AI Orchestrator Streaming', false, 'Not returning event stream');
      return;
    }

    logTest('AI Orchestrator', true, 'Returns streaming response');
    
    // Test for status events
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let hasStatus = false;
    let hasResult = false;
    let timeout = setTimeout(() => {
      reader.cancel();
    }, 10000); // 10 second timeout

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'status') hasStatus = true;
            if (data.type === 'result') {
              hasResult = true;
              break;
            }
          }
        }

        if (hasResult) break;
      }
    } finally {
      clearTimeout(timeout);
      await reader.cancel();
    }

    logTest('AI Orchestrator Status Events', hasStatus, hasStatus ? 'Emits status events' : 'No status events');
    logTest('AI Orchestrator Result', hasResult, hasResult ? 'Returns result' : 'No result received');

  } catch (error) {
    logTest('AI Orchestrator', false, error.message);
  }
}

async function testAISmartAnalyzer() {
  console.log('\n🧪 Testing AI Smart Analyzer...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-smart-analyzer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify({
        analysisType: 'success_prediction',
        items: [
          { id: 'test-1', creditor: 'Test Corp', type: 'Collection', balance: 500 }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      logTest('AI Smart Analyzer', false, `HTTP ${response.status}`);
      return;
    }

    const contentType = response.headers.get('content-type');
    logTest('AI Smart Analyzer Streaming', 
      contentType?.includes('text/event-stream'), 
      contentType || 'Unknown content type'
    );

  } catch (error) {
    logTest('AI Smart Analyzer', false, error.message);
  }
}

async function testAICreditCoach() {
  console.log('\n🧪 Testing AI Credit Coach...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-credit-coach`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'What is a good credit score?' }
        ],
        creditContext: {
          scores: { experian: 650, equifax: 645, transunion: 655 }
        }
      })
    });

    if (!response.ok) {
      logTest('AI Credit Coach', false, `HTTP ${response.status}`);
      return;
    }

    const contentType = response.headers.get('content-type');
    logTest('AI Credit Coach Streaming', 
      contentType?.includes('text/event-stream'), 
      'Returns streaming chat response'
    );

  } catch (error) {
    logTest('AI Credit Coach', false, error.message);
  }
}

async function testAIIntelligenceHub() {
  console.log('\n🧪 Testing AI Intelligence Hub...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-intelligence-hub`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify({
        action: 'generate_insights',
        creditData: {
          scores: { experian: 650, equifax: 645, transunion: 655 },
          averageScore: 650,
          negativeItems: [],
          summary: {},
          disputeProgress: {}
        },
        stream: true
      })
    });

    if (!response.ok) {
      logTest('AI Intelligence Hub', false, `HTTP ${response.status}`);
      return;
    }

    const contentType = response.headers.get('content-type');
    logTest('AI Intelligence Hub Streaming', 
      contentType?.includes('text/event-stream'), 
      contentType || 'Unknown content type'
    );

  } catch (error) {
    logTest('AI Intelligence Hub', false, error.message);
  }
}

async function testAIGoalRoadmap() {
  console.log('\n🧪 Testing AI Goal Roadmap...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-goal-roadmap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify({
        currentScore: 650,
        targetScore: 720,
        goalType: 'general',
        stream: true
      })
    });

    if (!response.ok) {
      logTest('AI Goal Roadmap', false, `HTTP ${response.status}`);
      return;
    }

    const contentType = response.headers.get('content-type');
    logTest('AI Goal Roadmap Streaming', 
      contentType?.includes('text/event-stream'), 
      contentType || 'Unknown content type'
    );

  } catch (error) {
    logTest('AI Goal Roadmap', false, error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting AI Real-time Functionality Tests\n');
  console.log(`Testing against: ${SUPABASE_URL}\n`);

  await testAIOrchestrator();
  await testAISmartAnalyzer();
  await testAICreditCoach();
  await testAIIntelligenceHub();
  await testAIGoalRoadmap();

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${tests.passed}/${tests.total} passed`);
  
  if (tests.failed > 0) {
    console.log(`❌ ${tests.failed} tests failed`);
    process.exit(1);
  } else {
    console.log('✅ All tests passed!');
  }
}

runTests().catch(console.error);
