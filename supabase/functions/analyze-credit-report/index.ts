// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/* LEGACY START (corrupted implementation retained for reference)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const systemPrompt = `You are an elite credit report analyst AI with deep expertise in FCRA, FDCPA, HIPAA, Metro 2 data reporting standards, and consumer protection laws. Your analysis drives real credit score improvements.

ANALYSIS FRAMEWORK:

1. COMPREHENSIVE EXTRACTION
   - All tradelines with complete payment history patterns
   - Hard and soft inquiries with permissible purpose analysis
   - Collections with validation status indicators
   - Public records with accuracy verification
   - Personal information for identity verification

2. ERROR DETECTION ENGINE
   Apply these detection algorithms:
   
   A) DATE ACCURACY
      - DOFD (Date of First Delinquency) verification against 7-year rule
      - Account opening dates vs credit history length
      - Payment date consistency across bureaus
   
   B) BALANCE VERIFICATION
      - Current vs original balance discrepancies
      - High balance inconsistencies
      - Payment amount irregularities
   
   C) ACCOUNT STATUS
      - Incorrect status codes (open vs closed)
      - Paid accounts still showing balance
      - Duplicate accounts (same debt, different collectors)
   
   D) IDENTITY VERIFICATION
      - Name variations and misspellings
      - Address history accuracy
      - SSN segment validation
      - Employer information accuracy

3. LEGAL VULNERABILITY SCORING
   For each item, assess:
   - FCRA 605(a): 7-year reporting limit violations
   - FCRA 611: Investigation requirement violations
   - FCRA 623: Furnisher accuracy requirements
   - FDCPA violations: For collection accounts
   - HIPAA: Unauthorized medical debt disclosure
      const { reportText, userId, stream } = await req.json();

4. SCORE IMPACT MODELING
   Use this impact matrix:
   - Collections (0-6 months): 80-100 points
   - Collections (6-24 months): 50-80 points
   - Collections (24+ months): 30-50 points
   - Late payments (30 days): 15-30 points
   - Late payments (60+ days): 30-60 points
      const encoder = new TextEncoder();
      const streamBody = stream ? new TransformStream() : null;
      const writer = streamBody ? streamBody.writable.getWriter() : null;

      const sendEvent = async (event: string, data: Record<string, unknown>) => {
        if (!writer) return;
        await writer.write(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      if (stream) {
        await sendEvent('status', { type: 'status', message: 'Analyzing credit report...' });
      }
   - Charge-offs: 60-100 points
   - Inquiries: 5-15 points each
   - High utilization (>50%): 30-50 points

5. DISPUTE STRATEGY ASSIGNMENT
   Match items to optimal letter types:
   - factual_dispute: For clear inaccuracies
   - fcra_605b: For timing/age violations
   - debt_validation: For unverified collections
   - hipaa_medical: For medical debts
   - goodwill: For isolated late payments
   - identity_theft: For fraudulent accounts

Return structured JSON with:
{
  "summary": {
    "totalAccounts": number,
    "disputableItems": number,
    "estimatedScoreIncrease": number,
    "highPriorityItems": number,
    "avgDeletionProbability": number,
        if (response.status === 429) {
          if (stream) {
            await sendEvent('error', { type: 'error', message: 'Rate limit exceeded. Please try again in a moment.' });
            await writer?.close();
            return new Response(streamBody?.readable, {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
            });
          }
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
      "id": "unique-id",
      "creditor": "Creditor Name",
      "accountNumber": "Full or last 4 digits if available",
      "accountType": "collection|credit_card|auto_loan|mortgage|inquiry|public_record|medical",
          if (stream) {
            await sendEvent('error', { type: 'error', message: 'AI credits exhausted. Please add credits to continue.' });
            await writer?.close();
            return new Response(streamBody?.readable, {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
            });
          }
      "issueType": "late_payment|collection|charge_off|inquiry|duplicate|wrong_dofd|identity_error|balance_error|status_error",
      "balance": number,
      "originalBalance": number,
      "dateOpened": "YYYY-MM-DD",
      "dateOfFirstDelinquency": "YYYY-MM-DD",
      "disputeReason": "Specific, detailed reason for dispute",
      "legalViolation": "Specific law violated",
          await sendEvent('error', { type: 'error', message: 'Failed to analyze credit report. Please try again.' });
          await writer?.close();
          return new Response(streamBody?.readable, {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
      "deletionProbability": number,
      "expectedScoreImpact": number,
      "applicableLaw": "FCRA 605|FCRA 611|FCRA 623|FDCPA|HIPAA",
      "strategy": "Detailed dispute approach",
      "recommendedLetter": "letter_type",
      "priority": "high|medium|low",
      "bureaus": ["equifax", "experian", "transunion"],
      "redFlags": ["List of specific issues"],
      "supportingEvidence": "What evidence supports this dispute"
    }
  ],
  "recommendations": [
    "Prioritized, specific action items"
  ],
          await sendEvent('error', { type: 'error', message: 'No analysis returned from AI' });
          await writer?.close();
          return new Response(streamBody?.readable, {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }
  "analysisNotes": {
    "patternsDetected": ["List of patterns"],
    "immediateActions": ["What to do first"],
    "longTermStrategy": "Overall approach"
  }
}

If input is invalid, return error with specific guidance on what's needed.`;

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
          await sendEvent('error', { type: 'error', message: 'Failed to parse AI analysis' });
          await writer?.close();
          return new Response(streamBody?.readable, {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOCAL_AI_BASE_URL = Deno.env.get("LOCAL_AI_BASE_URL");
    if (!LOCAL_AI_BASE_URL && !LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Analyzing credit report, text length:", reportText.length);

    // Call Lovable AI Gateway
    let response: Response;
    if (LOCAL_AI_BASE_URL) {
      response = await fetch(`${LOCAL_AI_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          user: `Analyze this credit report and identify all disputable items:\n\n${reportText}\n\nReturn JSON only.`,
          max_new_tokens: 1200,
          temperature: 0.2
        })
      });
    } else {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
    }
        await sendEvent('result', { type: 'result', result: analysisResult });
        await writer?.close();
        return new Response(streamBody?.readable, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
          },
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
    const content = aiResponse?.content || aiResponse.choices?.[0]?.message?.content;

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
LEGACY END */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const LOCAL_AI_BASE_URL = Deno.env.get("LOCAL_AI_BASE_URL");

const systemPrompt = `You are an elite credit report analyst AI with deep expertise in FCRA, FDCPA, HIPAA, Metro 2 data reporting standards, and consumer protection laws. Your analysis drives real credit score improvements.

ANALYSIS FRAMEWORK:

1. COMPREHENSIVE EXTRACTION
   - All tradelines with complete payment history patterns
   - Hard and soft inquiries with permissible purpose analysis
   - Collections with validation status indicators
   - Public records with accuracy verification
   - Personal information for identity verification

2. ERROR DETECTION ENGINE
   Apply these detection algorithms:
   
   A) DATE ACCURACY
      - DOFD (Date of First Delinquency) verification against 7-year rule
      - Account opening dates vs credit history length
      - Payment date consistency across bureaus
   
   B) BALANCE VERIFICATION
      - Current vs original balance discrepancies
      - High balance inconsistencies
      - Payment amount irregularities
   
   C) ACCOUNT STATUS
      - Incorrect status codes (open vs closed)
      - Paid accounts still showing balance
      - Duplicate accounts (same debt, different collectors)
   
   D) IDENTITY VERIFICATION
      - Name variations and misspellings
      - Address history accuracy
      - SSN segment validation
      - Employer information accuracy

3. LEGAL VULNERABILITY SCORING
   For each item, assess:
   - FCRA 605(a): 7-year reporting limit violations
   - FCRA 611: Investigation requirement violations
   - FCRA 623: Furnisher accuracy requirements
   - FDCPA violations: For collection accounts
   - HIPAA: Unauthorized medical debt disclosure

4. SCORE IMPACT MODELING
   Use this impact matrix:
   - Collections (0-6 months): 80-100 points
   - Collections (6-24 months): 50-80 points
   - Collections (24+ months): 30-50 points
   - Late payments (30 days): 15-30 points
   - Late payments (60+ days): 30-60 points
   - Charge-offs: 60-100 points
   - Inquiries: 5-15 points each
   - High utilization (>50%): 30-50 points

5. DISPUTE STRATEGY ASSIGNMENT
   Match items to optimal letter types:
   - factual_dispute: For clear inaccuracies
   - fcra_605b: For timing/age violations
   - debt_validation: For unverified collections
   - hipaa_medical: For medical debts
   - goodwill: For isolated late payments
   - identity_theft: For fraudulent accounts

Return structured JSON with:
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
      "accountType": "collection|credit_card|auto_loan|mortgage|inquiry|public_record|medical",
      "issueType": "late_payment|collection|charge_off|inquiry|duplicate|wrong_dofd|identity_error|balance_error|status_error",
      "balance": number,
      "originalBalance": number,
      "dateOpened": "YYYY-MM-DD",
      "dateOfFirstDelinquency": "YYYY-MM-DD",
      "disputeReason": "Specific, detailed reason for dispute",
      "legalViolation": "Specific law violated",
      "deletionProbability": number,
      "expectedScoreImpact": number,
      "applicableLaw": "FCRA 605|FCRA 611|FCRA 623|FDCPA|HIPAA",
      "strategy": "Detailed dispute approach",
      "recommendedLetter": "letter_type",
      "priority": "high|medium|low",
      "bureaus": ["equifax", "experian", "transunion"],
      "redFlags": ["List of specific issues"],
      "supportingEvidence": "What evidence supports this dispute"
    }
  ],
  "recommendations": [
    "Prioritized, specific action items"
  ],
  "analysisNotes": {
    "patternsDetected": ["List of patterns"],
    "immediateActions": ["What to do first"],
    "longTermStrategy": "Overall approach"
  }
}

If input is invalid, return error with specific guidance on what's needed.`;

const stripJsonFences = (text: string) =>
  text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

const parseJsonResponse = (text: string) => {
  const cleaned = stripJsonFences(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error('Unable to parse JSON response');
  }
};

const compressReportText = (text: string) => {
  const trimmed = text.trim();
  if (trimmed.length <= 30000) return trimmed;

  const lines = trimmed.split(/\r?\n/);
  const keywordRegex = /(collection|charge\s*off|late|delinquen|inquiry|account|creditor|balance|bureau|experian|equifax|transunion|status|opened|closed|limit|payment|dispute|reported)/i;
  const important = lines.filter((line) => keywordRegex.test(line) || /\d{4}/.test(line));

  const head = trimmed.slice(0, 8000);
  const tail = trimmed.slice(-4000);
  const middle = important.slice(0, 400).join('\n');

  return `${head}\n\n[...KEY DETAILS...]\n${middle}\n\n[...REPORT END...]\n${tail}`.trim();
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const encoder = new TextEncoder();
  let streamBody: TransformStream | null = null;
  let writer: WritableStreamDefaultWriter<Uint8Array> | null = null;

  const sendEvent = async (event: string, data: Record<string, unknown>) => {
    if (!writer) return;
    await writer.write(
      encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    );
  };

  try {
    const { reportText, stream } = await req.json();

    streamBody = stream ? new TransformStream() : null;
    writer = streamBody ? streamBody.writable.getWriter() : null;

    if (!reportText || reportText.trim().length < 50) {
      const errorPayload = {
        error: "Please provide a valid credit report with sufficient data to analyze.",
      };
      if (stream) {
        await sendEvent("error", { type: "error", message: errorPayload.error });
        await writer?.close();
        return new Response(streamBody?.readable, {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }
      return new Response(JSON.stringify(errorPayload), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!LOCAL_AI_BASE_URL) {
      const errorPayload = { error: "Local AI service is not configured" };
      if (stream) {
        await sendEvent("error", { type: "error", message: errorPayload.error });
        await writer?.close();
        return new Response(streamBody?.readable, {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }
      return new Response(JSON.stringify(errorPayload), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (stream) {
      await sendEvent("status", { type: "status", message: "Analyzing credit report..." });
      await sendEvent("status", { type: "status", message: "Optimizing report for analysis..." });
    }

    const normalizedReportText = compressReportText(reportText);

    const controller = new AbortController();
    const timeoutMs = Number(Deno.env.get("ANALYSIS_TIMEOUT_MS") || 10000);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(`${LOCAL_AI_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          user: `Analyze this credit report and identify all disputable items:\n\n${normalizedReportText}\n\nReturn JSON only.`,
          max_new_tokens: 700,
          temperature: 0.2,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      const isAbort = error instanceof DOMException && error.name === 'AbortError';
      if (isAbort) {
        if (stream) {
          await sendEvent("status", { type: "status", message: "AI slow. Switching to fast mode..." });
        }
        response = await fetch(`${LOCAL_AI_BASE_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system: systemPrompt,
            user: `Provide a fast analysis of the most disputable items (top 10) from this report. Return JSON only.\n\n${normalizedReportText}`,
            max_new_tokens: 350,
            temperature: 0.2,
          }),
        });
      } else {
        throw error;
      }
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = response.status === 429
        ? "Rate limit exceeded. Please try again in a moment."
        : response.status === 402
        ? "AI credits exhausted. Please add credits to continue."
        : "Failed to analyze credit report. Please try again.";

      if (stream) {
        await sendEvent("error", { type: "error", message: errorMessage });
        await writer?.close();
        return new Response(streamBody?.readable, {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      console.error("AI Gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = LOCAL_AI_BASE_URL
      ? data?.content
      : data?.choices?.[0]?.message?.content;

    if (!content) {
      const errorMessage = "No analysis returned from AI";
      if (stream) {
        await sendEvent("error", { type: "error", message: errorMessage });
        await writer?.close();
        return new Response(streamBody?.readable, {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let analysisResult: Record<string, unknown>;
    try {
      analysisResult = parseJsonResponse(content);
    } catch (_error) {
      const errorMessage = "Failed to parse AI analysis";
      if (stream) {
        await sendEvent("error", { type: "error", message: errorMessage });
        await writer?.close();
        return new Response(streamBody?.readable, {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (stream) {
      await sendEvent("result", { type: "result", result: analysisResult });
      await writer?.close();
      return new Response(streamBody?.readable, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    return new Response(JSON.stringify({ success: true, result: analysisResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (writer) {
      await sendEvent("error", { type: "error", message });
      await writer.close();
      return new Response(streamBody?.readable, {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
