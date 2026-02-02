import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const letterTemplates: Record<string, string> = {
  fcra_605b: `Generate a FCRA Section 605(b) dispute letter requesting removal of the item due to the 7-year reporting limit or inaccurate date of first delinquency.`,
  
  debt_validation: `Generate a FDCPA debt validation request letter demanding the collector provide complete documentation proving the debt is valid, including the original creditor, amount owed, and chain of ownership.`,
  
  hipaa_medical: `Generate a HIPAA-based medical debt dispute letter citing the creditor's failure to obtain proper authorization before reporting to credit bureaus.`,
  
  goodwill: `Generate a goodwill adjustment letter with an empathetic, professional tone requesting removal of late payments due to temporary hardship, emphasizing the customer's otherwise excellent payment history.`,
  
  data_breach: `Generate a data breach dispute letter citing potential identity theft or data compromise, requesting verification of all account information and documentation.`,
  
  identity_theft: `Generate an identity theft affidavit letter with FTC identity theft report reference, demanding immediate removal of fraudulent accounts.`,
  
  factual_dispute: `Generate a factual dispute letter citing specific inaccuracies in the reported information and demanding investigation under FCRA Section 611.`,
  
  collection_validation: `Generate a collection account validation letter under FDCPA Section 809, demanding complete documentation within 30 days.`,
  
  inquiry_removal: `Generate an unauthorized inquiry removal request citing lack of permissible purpose under FCRA Section 604.`,
  
  experian_backdoor: `Generate a letter to Experian's NCAC (National Consumer Assistance Center) requesting e-OSCAR investigation bypass and manual review.`
};

const systemPrompt = `You are an expert credit repair letter writer. Generate professional, legally-sound dispute letters that are:
1. Specific to the dispute reason and applicable law
2. Firm but professional in tone
3. Include all legally required elements
4. Reference specific account details provided
5. Include clear demands and deadlines where applicable

Format the letter with:
- Today's date
- Placeholder for sender's name and address: [YOUR NAME], [YOUR ADDRESS], [CITY, STATE ZIP]
- Bureau/creditor address placeholder: [BUREAU/CREDITOR NAME], [ADDRESS]
- Account reference number placeholder: [ACCOUNT NUMBER]
- Clear subject line
- Professional salutation
- Body paragraphs with specific legal citations
- Clear action requests
- Professional closing
- Signature line

Do NOT include any markdown formatting. Output plain text only.`;

const stripMarkdown = (text: string) =>
  text.replace(/```[\s\S]*?```/g, '').replace(/[*_`#>-]/g, '').trim();

const buildFallbackLetter = (item: any, templateInstructions: string) => {
  const today = new Date().toLocaleDateString();
  const bureaus = item.bureaus?.join(', ') || 'All three bureaus';
  return [
    today,
    '',
    '[YOUR NAME]',
    '[YOUR ADDRESS]',
    '[CITY, STATE ZIP]',
    '',
    '[BUREAU/CREDITOR NAME]',
    '[ADDRESS]',
    '',
    `Re: Dispute of ${item.creditor || 'Account'} – ${item.accountNumber || '[ACCOUNT NUMBER]'}`,
    '',
    'To Whom It May Concern,',
    '',
    templateInstructions,
    '',
    `Account Details:`,
    `- Creditor/Account: ${item.creditor || 'Unknown'}`,
    `- Account Type: ${item.accountType || 'Unknown'}`,
    `- Account Number: ${item.accountNumber || '[ACCOUNT NUMBER]'}`,
    `- Balance: $${item.balance || 0}`,
    `- Issue Type: ${item.issueType || 'Unknown'}`,
    `- Dispute Reason: ${item.disputeReason || 'Inaccurate information'}`,
    `- Applicable Law: ${item.applicableLaw || 'FCRA'}`,
    `- Bureaus to Send To: ${bureaus}`,
    '',
    'I am requesting a prompt investigation under the Fair Credit Reporting Act. Please verify the accuracy of the above information and remove or correct any inaccurate or unverifiable data.',
    '',
    'Please provide written confirmation of the results of your investigation.',
    '',
    'Sincerely,',
    '',
    '[YOUR NAME]'
  ].join('\n');
};

const ensureLetterFormatting = (content: string, item: any, templateInstructions: string) => {
  const clean = stripMarkdown(content);
  const lineBreaks = clean.split('\n').filter(Boolean).length;
  if (lineBreaks < 6) {
    return buildFallbackLetter(item, templateInstructions);
  }
  return clean;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      letterType, 
      disputableItem, 
      clientInfo,
      customInstructions,
      stream,
      maxWaitMs,
      fastMode,
      forceTemplate
    } = await req.json();

    if (!letterType || !disputableItem) {
      return new Response(
        JSON.stringify({ error: "Letter type and disputable item are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOCAL_AI_BASE_URL = Deno.env.get("LOCAL_AI_BASE_URL");
    if (!LOCAL_AI_BASE_URL) {
      console.error("LOCAL_AI_BASE_URL is not configured");
      return new Response(
        JSON.stringify({ error: "Local AI service is not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const templateInstructions = letterTemplates[letterType] || letterTemplates.factual_dispute;

    const encoder = new TextEncoder();
    const streamBody = stream ? new TransformStream() : null;
    const writer = streamBody ? streamBody.writable.getWriter() : null;

    const sendEvent = async (event: string, data: Record<string, unknown>) => {
      if (!writer) return;
      await writer.write(
        encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
      );
    };

    if (forceTemplate) {
      const fallback = buildFallbackLetter(disputableItem, templateInstructions);
      if (stream) {
        const chunkSize = 800;
        for (let i = 0; i < fallback.length; i += chunkSize) {
          await sendEvent('delta', { type: 'delta', delta: fallback.slice(i, i + chunkSize) });
        }
        await sendEvent('result', {
          type: 'result',
          result: {
            letter: fallback,
            letterType,
            creditor: disputableItem.creditor,
            bureaus: disputableItem.bureaus || ['equifax', 'experian', 'transunion']
          }
        });
        await writer?.close();
        return new Response(streamBody?.readable, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
          },
        });
      }

      return new Response(JSON.stringify({
        letter: fallback,
        letterType,
        creditor: disputableItem.creditor,
        bureaus: disputableItem.bureaus || ['equifax', 'experian', 'transunion'],
        fallbackUsed: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userPrompt = `${templateInstructions}

Account Details:
- Creditor/Account: ${disputableItem.creditor || 'Unknown'}
- Account Number: ${disputableItem.accountNumber || '[ACCOUNT NUMBER]'}
- Account Type: ${disputableItem.accountType || 'Unknown'}
- Balance: $${disputableItem.balance || 0}
- Issue Type: ${disputableItem.issueType || 'Unknown'}
- Dispute Reason: ${disputableItem.disputeReason || 'Inaccurate information'}
- Applicable Law: ${disputableItem.applicableLaw || 'FCRA'}
- Bureaus to Send To: ${disputableItem.bureaus?.join(', ') || 'All three bureaus'}

${clientInfo ? `Client Context:
- Name: ${clientInfo.name || '[CLIENT NAME]'}
- Previous disputes: ${clientInfo.previousDisputes || 'None on record'}
` : ''}

${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}

Generate a complete, ready-to-send dispute letter.`;

    console.log("Generating dispute letter, type:", letterType);

    if (stream) {
      await sendEvent('status', { type: 'status', message: 'Analyzing dispute details...' });
      await sendEvent('status', { type: 'status', message: 'Drafting dispute letter...' });
    }

    let response: Response | null = null;
    let aiError: string | null = null;
    const controller = new AbortController();
    const defaultTimeout = Number(Deno.env.get("LETTER_GEN_TIMEOUT_MS") || 30000);
    const requestedTimeout = typeof maxWaitMs === 'number' ? maxWaitMs : defaultTimeout;
    const timeoutMs = Math.min(Math.max(requestedTimeout, 2000), fastMode ? 12000 : 30000);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      response = await fetch(`${LOCAL_AI_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          user: userPrompt,
          max_new_tokens: fastMode ? 200 : 350,
          temperature: 0.2
        }),
        signal: controller.signal
      });
    } catch (error) {
      aiError = error instanceof Error ? error.message : "Unknown AI error";
    } finally {
      clearTimeout(timeout);
    }

    if (!response) {
      const fallback = buildFallbackLetter(disputableItem, templateInstructions);

      if (stream) {
        await sendEvent('status', { type: 'status', message: 'AI response delayed. Using verified template...' });
        const chunkSize = 800;
        for (let i = 0; i < fallback.length; i += chunkSize) {
          await sendEvent('delta', { type: 'delta', delta: fallback.slice(i, i + chunkSize) });
        }
        await sendEvent('result', {
          type: 'result',
          result: {
            letter: fallback,
            letterType,
            creditor: disputableItem.creditor,
            bureaus: disputableItem.bureaus || ['equifax', 'experian', 'transunion']
          }
        });
        await writer?.close();
        return new Response(streamBody?.readable, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
          },
        });
      }

      return new Response(JSON.stringify({
        letter: fallback,
        letterType,
        creditor: disputableItem.creditor,
        bureaus: disputableItem.bureaus || ['equifax', 'experian', 'transunion'],
        fallbackUsed: true,
        error: aiError || "AI response delayed"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
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
      }
      
      if (response.status === 402) {
        if (stream) {
          await sendEvent('error', { type: 'error', message: 'AI credits exhausted. Please add credits to continue.' });
          await writer?.close();
          return new Response(streamBody?.readable, {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (stream) {
        await sendEvent('error', { type: 'error', message: 'Failed to generate letter. Please try again.' });
        await writer?.close();
        return new Response(streamBody?.readable, {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      return new Response(
        JSON.stringify({ error: "Failed to generate letter. Please try again." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const letterContent = aiResponse?.content || aiResponse.choices?.[0]?.message?.content;

    if (!letterContent) {
      console.error("No content in AI response");
      if (stream) {
        await sendEvent('error', { type: 'error', message: 'No letter generated' });
        await writer?.close();
        return new Response(streamBody?.readable, {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }
      return new Response(
        JSON.stringify({ error: "No letter generated" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Letter generated successfully");

    const formattedLetter = ensureLetterFormatting(letterContent, disputableItem, templateInstructions);

    const result = {
      letter: formattedLetter,
      letterType,
      creditor: disputableItem.creditor,
      bureaus: disputableItem.bureaus || ['equifax', 'experian', 'transunion']
    };

    if (stream) {
      await sendEvent('status', { type: 'status', message: 'Finalizing letter format...' });
      await sendEvent('status', { type: 'status', message: 'Streaming draft...' });

      const chunkSize = 800;
      for (let i = 0; i < formattedLetter.length; i += chunkSize) {
        const chunk = formattedLetter.slice(i, i + chunkSize);
        await sendEvent('delta', { type: 'delta', delta: chunk });
      }

      await sendEvent('result', { type: 'result', result });
      await writer?.close();
      return new Response(streamBody?.readable, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        },
      });
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in generate-dispute-letter function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
