import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const systemPrompt = `You are an expert credit report analyst AI. Your job is to analyze credit reports and identify disputable items, errors, and opportunities for credit score improvement.

When analyzing a credit report, you must:
1. Extract all tradelines (accounts), inquiries, collections, and public records
2. Identify errors, inaccuracies, and legally disputable items
3. For each disputable item, provide:
   - The creditor/account name
   - The type of issue (late payment, collection, inquiry, etc.)
   - The specific error or reason for dispute
   - Estimated deletion probability (0-100%)
   - Expected score impact if removed (+X points)
   - The applicable law (FCRA, FDCPA, HIPAA, etc.)
   - Recommended dispute strategy

4. Look for:
   - Wrong dates of first delinquency (DOFD)
   - Duplicate accounts
   - Accounts not belonging to the consumer
   - Outdated information (>7 years for most items)
   - Inaccurate balances or payment history
   - Unauthorized inquiries
   - Medical debts reported without authorization
   - Identity mismatches

Return your analysis as a JSON object with this exact structure:
{
  "summary": {
    "totalAccounts": number,
    "disputableItems": number,
    "estimatedScoreIncrease": number,
    "highPriorityItems": number,
    "avgDeletionProbability": number
  },
  "items": [
    {
      "id": "unique-id",
      "creditor": "Creditor Name",
      "accountType": "collection|credit_card|auto_loan|mortgage|inquiry|public_record",
      "issueType": "late_payment|collection|charge_off|inquiry|duplicate|wrong_dofd|identity_error",
      "balance": number,
      "disputeReason": "Specific reason for dispute",
      "deletionProbability": number,
      "expectedScoreImpact": number,
      "applicableLaw": "FCRA 605|FCRA 611|FDCPA|HIPAA",
      "strategy": "Recommended dispute approach",
      "priority": "high|medium|low",
      "bureaus": ["equifax", "experian", "transunion"]
    }
  ],
  "recommendations": [
    "Prioritized action items for the client"
  ]
}

If the input is not a valid credit report or doesn't contain analyzable data, return:
{
  "error": "Description of what's wrong with the input",
  "summary": null,
  "items": [],
  "recommendations": []
}`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportText, userId } = await req.json();

    if (!reportText || reportText.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid credit report with sufficient data to analyze." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Analyzing credit report, text length:", reportText.length);

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this credit report and identify all disputable items:\n\n${reportText}` }
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to analyze credit report. Please try again." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "No analysis returned from AI" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("AI response received, parsing...");

    // Extract JSON from the response (handle markdown code blocks)
    let analysisResult;
    try {
      // Try to extract JSON from markdown code block
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : content.trim();
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.log("Raw content:", content);
      
      // Return the raw content for debugging
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse AI analysis",
          rawContent: content.substring(0, 500)
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store the analysis in the database if userId is provided
    if (userId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        await supabase.from('credit_report_analyses').insert({
          user_id: userId,
          raw_text: reportText.substring(0, 50000), // Limit stored text
          analysis_result: analysisResult,
          disputable_items: analysisResult.items,
          summary: analysisResult.summary,
        });
        
        console.log("Analysis saved to database");
      } catch (dbError) {
        console.error("Failed to save analysis to database:", dbError);
        // Continue anyway - analysis was successful
      }
    }

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in analyze-credit-report function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
