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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      letterType, 
      disputableItem, 
      clientInfo,
      customInstructions 
    } = await req.json();

    if (!letterType || !disputableItem) {
      return new Response(
        JSON.stringify({ error: "Letter type and disputable item are required" }),
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

    const templateInstructions = letterTemplates[letterType] || letterTemplates.factual_dispute;

    const userPrompt = `${templateInstructions}

Account Details:
- Creditor/Account: ${disputableItem.creditor || 'Unknown'}
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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
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
        JSON.stringify({ error: "Failed to generate letter. Please try again." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const letterContent = aiResponse.choices?.[0]?.message?.content;

    if (!letterContent) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "No letter generated" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Letter generated successfully");

    return new Response(
      JSON.stringify({ 
        letter: letterContent,
        letterType,
        creditor: disputableItem.creditor,
        bureaus: disputableItem.bureaus || ['equifax', 'experian', 'transunion']
      }),
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
