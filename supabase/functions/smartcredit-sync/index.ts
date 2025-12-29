import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate AI-analyzed credit report data
async function generateCreditReportData(userId: string) {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    console.error("LOVABLE_API_KEY not set, using demo data");
    return generateDemoData();
  }

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a credit report analysis AI. Generate a realistic credit report analysis with scores and disputable items. Return ONLY valid JSON with this exact structure:
{
  "scores": {
    "experian": <number 550-750>,
    "equifax": <number 550-750>,
    "transunion": <number 550-750>
  },
  "previousScores": {
    "experian": <number, 20-50 points lower than current>,
    "equifax": <number, 20-50 points lower than current>,
    "transunion": <number, 20-50 points lower than current>
  },
  "negativeItems": [
    {
      "id": "<uuid>",
      "creditor": "<creditor name>",
      "bureau": "<Experian|Equifax|TransUnion|All Three>",
      "type": "<Late Payment|Collection|Charge-Off|Medical Collection|Inquiry>",
      "status": "<pending|in_progress|deleted|verified>",
      "balance": <number or null>,
      "dateOpened": "<YYYY-MM-DD>",
      "disputeReason": "<reason for dispute>",
      "deletionProbability": <0.0-1.0>
    }
  ],
  "inquiries": [
    {
      "creditor": "<name>",
      "date": "<YYYY-MM-DD>",
      "bureau": "<bureau name>"
    }
  ],
  "summary": {
    "totalAccounts": <number>,
    "negativeAccounts": <number>,
    "onTimePayments": <percentage number>,
    "creditUtilization": <percentage number>,
    "avgAccountAge": "<X years Y months>",
    "totalDebt": <number>
  },
  "scoreHistory": [
    {"date": "<YYYY-MM-DD>", "experian": <number>, "equifax": <number>, "transunion": <number>}
  ]
}
Generate 4-8 negative items with varied statuses. Include 3-5 inquiries. Score history should have 5 entries going back 5 months.`
          },
          {
            role: "user",
            content: `Generate a credit report analysis for user ${userId}. Make it realistic with a mix of collection accounts, late payments, and inquiries. Current scores should be in the 600-680 range.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status);
      return generateDemoData();
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return generateDemoData();
  } catch (error) {
    console.error("Error calling AI:", error);
    return generateDemoData();
  }
}

function generateDemoData() {
  const baseExperian = 640 + Math.floor(Math.random() * 40);
  const baseEquifax = 635 + Math.floor(Math.random() * 40);
  const baseTransunion = 638 + Math.floor(Math.random() * 40);
  
  return {
    scores: {
      experian: baseExperian,
      equifax: baseEquifax,
      transunion: baseTransunion
    },
    previousScores: {
      experian: baseExperian - 25 - Math.floor(Math.random() * 20),
      equifax: baseEquifax - 28 - Math.floor(Math.random() * 20),
      transunion: baseTransunion - 22 - Math.floor(Math.random() * 20)
    },
    negativeItems: [
      {
        id: crypto.randomUUID(),
        creditor: "Capital One",
        bureau: "Experian",
        type: "Late Payment",
        status: "in_progress",
        balance: 2450,
        dateOpened: "2023-06-15",
        disputeReason: "Inaccurate payment history reported",
        deletionProbability: 0.65
      },
      {
        id: crypto.randomUUID(),
        creditor: "Midland Credit Management",
        bureau: "All Three",
        type: "Collection",
        status: "pending",
        balance: 1875,
        dateOpened: "2022-11-20",
        disputeReason: "Debt validation required - no original agreement",
        deletionProbability: 0.78
      },
      {
        id: crypto.randomUUID(),
        creditor: "Medical Associates",
        bureau: "Equifax",
        type: "Medical Collection",
        status: "deleted",
        balance: 450,
        dateOpened: "2023-01-10",
        disputeReason: "Insurance should have covered - billing error",
        deletionProbability: 0.92
      },
      {
        id: crypto.randomUUID(),
        creditor: "Chase Bank",
        bureau: "TransUnion",
        type: "Charge-Off",
        status: "pending",
        balance: 3200,
        dateOpened: "2022-08-05",
        disputeReason: "Account closed in good standing - reporting error",
        deletionProbability: 0.55
      },
      {
        id: crypto.randomUUID(),
        creditor: "Portfolio Recovery",
        bureau: "Experian",
        type: "Collection",
        status: "in_progress",
        balance: 890,
        dateOpened: "2023-03-22",
        disputeReason: "Duplicate account - already paid original creditor",
        deletionProbability: 0.82
      }
    ],
    inquiries: [
      { creditor: "Auto Loan Direct", date: "2024-09-15", bureau: "Experian" },
      { creditor: "Credit One Bank", date: "2024-08-22", bureau: "TransUnion" },
      { creditor: "Synchrony Bank", date: "2024-07-10", bureau: "Equifax" },
      { creditor: "Wells Fargo", date: "2024-06-05", bureau: "Experian" }
    ],
    summary: {
      totalAccounts: 12,
      negativeAccounts: 5,
      onTimePayments: 87,
      creditUtilization: 42,
      avgAccountAge: "4 years 3 months",
      totalDebt: 8865
    },
    scoreHistory: [
      { date: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], experian: baseExperian - 65, equifax: baseEquifax - 60, transunion: baseTransunion - 58 },
      { date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], experian: baseExperian - 48, equifax: baseEquifax - 45, transunion: baseTransunion - 42 },
      { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], experian: baseExperian - 35, equifax: baseEquifax - 32, transunion: baseTransunion - 30 },
      { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], experian: baseExperian - 20, equifax: baseEquifax - 18, transunion: baseTransunion - 15 },
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], experian: baseExperian, equifax: baseEquifax, transunion: baseTransunion }
    ]
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, connectionData, reportData } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case "init_connection": {
        const { data: existing } = await supabase
          .from('smartcredit_connections')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (existing) {
          const { error } = await supabase
            .from('smartcredit_connections')
            .update({ connection_status: 'pending' })
            .eq('user_id', userId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('smartcredit_connections')
            .insert({ user_id: userId, connection_status: 'pending' });
          if (error) throw error;
        }

        console.log(`SmartCredit: Initialized connection for user ${userId}`);

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Connection initialized',
          oauthUrl: `https://smartcredit.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(supabaseUrl + '/functions/v1/smartcredit-callback')}&state=${userId}`
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "complete_connection": {
        const { error } = await supabase
          .from('smartcredit_connections')
          .update({
            connection_status: 'connected',
            connected_at: new Date().toISOString(),
            access_token_encrypted: connectionData?.accessToken,
          })
          .eq('user_id', userId);

        if (error) throw error;

        console.log(`SmartCredit: Completed connection for user ${userId}`);

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Connection completed'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "sync_report": {
        // Generate AI-analyzed credit data
        console.log(`SmartCredit: Generating credit report for user ${userId}`);
        const creditData = reportData || await generateCreditReportData(userId);
        
        // Update last sync time
        const { error: updateError } = await supabase
          .from('smartcredit_connections')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('user_id', userId);

        if (updateError) throw updateError;

        // Delete existing analysis for this user (keep latest only)
        await supabase
          .from('credit_report_analyses')
          .delete()
          .eq('user_id', userId);

        // Store the new analysis
        const { error: analysisError } = await supabase
          .from('credit_report_analyses')
          .insert({
            user_id: userId,
            raw_text: JSON.stringify(creditData),
            summary: creditData.summary || {},
            disputable_items: creditData.negativeItems || [],
            analysis_result: creditData,
          });

        if (analysisError) throw analysisError;

        console.log(`SmartCredit: Synced report for user ${userId}`);

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Report synced',
          lastSyncAt: new Date().toISOString(),
          creditData
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_report": {
        // Fetch the latest credit report analysis
        const { data, error } = await supabase
          .from('credit_report_analyses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        return new Response(JSON.stringify({ 
          success: true,
          hasReport: !!data,
          report: data?.analysis_result || null,
          lastUpdated: data?.updated_at || null
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "disconnect": {
        const { error } = await supabase
          .from('smartcredit_connections')
          .update({
            connection_status: 'disconnected',
            access_token_encrypted: null,
          })
          .eq('user_id', userId);

        if (error) throw error;

        console.log(`SmartCredit: Disconnected for user ${userId}`);

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Disconnected successfully'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_status": {
        const { data, error } = await supabase
          .from('smartcredit_connections')
          .select('connection_status, connected_at, last_sync_at')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        // Also check if we have report data
        const { data: reportData } = await supabase
          .from('credit_report_analyses')
          .select('id, updated_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return new Response(JSON.stringify({ 
          success: true, 
          status: data?.connection_status || 'not_connected',
          connectedAt: data?.connected_at,
          lastSyncAt: data?.last_sync_at,
          hasReport: !!reportData,
          reportUpdatedAt: reportData?.updated_at
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: unknown) {
    console.error("Error in smartcredit-sync:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
