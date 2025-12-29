import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const providerPrompts: Record<string, string> = {
  smartcredit: "This is a SmartCredit credit report. Extract all data including 3-bureau scores, tradelines, collections, inquiries, and negative items.",
  identityiq: "This is an IdentityIQ credit report. Extract all data including credit scores, tradelines, collections, inquiries, and negative items.",
  privacyguard: "This is a PrivacyGuard credit report. Extract all data including credit scores, tradelines, collections, inquiries, and negative items.",
  creditkarma: "This is a Credit Karma credit report screenshot. Extract all visible data including credit scores (TransUnion/Equifax), account details, and any negative marks.",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { action, imageBase64, documentType, extractedText, filePath, provider, userId } = requestBody;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Handle file upload parsing from storage
    if (filePath && userId) {
      console.log(`OCR Document Parser: Processing file from storage - ${filePath}`);
      
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Supabase credentials not configured");
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Download the file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('credit-reports')
        .download(filePath);

      if (downloadError) {
        console.error("Download error:", downloadError);
        throw new Error(`Failed to download file: ${downloadError.message}`);
      }

      // Convert file to base64 using Deno's base64 encoder (handles large files)
      const arrayBuffer = await fileData.arrayBuffer();
      const base64 = base64Encode(arrayBuffer);
      
      // Determine file type
      const fileExtension = filePath.split('.').pop()?.toLowerCase();
      const mimeType = fileExtension === 'pdf' ? 'application/pdf' : 
                       fileExtension === 'png' ? 'image/png' : 'image/jpeg';
      
      const providerHint = providerPrompts[provider] || "Extract all credit report data.";
      
      const systemPrompt = `You are an expert Credit Report Parser AI with OCR capabilities. ${providerHint}

Extract ALL of the following information:

1. **Personal Information**: Name, address, SSN (last 4 only), DOB
2. **Credit Scores**: All bureaus with scores and dates
3. **Tradelines**: For each account extract:
   - Creditor name
   - Account number (last 4)
   - Account type (credit card, auto, mortgage, etc.)
   - Current balance
   - Credit limit / Original amount
   - Payment status (current, late, charged-off, etc.)
   - Date opened
   - Date of last activity
   - Payment history pattern
4. **Collections**: Original creditor, collection agency, amount, date opened
5. **Inquiries**: Company name, date, hard vs soft inquiry
6. **Public Records**: Bankruptcies, judgments, liens
7. **Negative Items**: Identify ALL negative items with:
   - What the item is
   - Which bureau(s) it appears on
   - Why it's negative
   - Whether it appears disputable (data inaccuracies, duplicates, outdated info)

Return a JSON object with this structure:
{
  "personalInfo": { "name": "", "address": "", "ssn4": "", "dob": "" },
  "scores": { "experian": null, "equifax": null, "transunion": null },
  "tradelines": [{ "creditor": "", "accountNumber": "", "accountType": "", "balance": 0, "creditLimit": 0, "status": "", "dateOpened": "", "lastActivity": "", "paymentHistory": "" }],
  "collections": [{ "creditor": "", "originalCreditor": "", "amount": 0, "dateOpened": "", "status": "" }],
  "inquiries": [{ "creditor": "", "date": "", "type": "hard|soft" }],
  "publicRecords": [{ "type": "", "date": "", "amount": 0, "status": "" }],
  "negativeItems": [{ "creditor": "", "type": "", "bureau": "", "reason": "", "disputable": true, "disputeReason": "" }],
  "summary": { "totalAccounts": 0, "negativeCount": 0, "collectionsCount": 0, "inquiryCount": 0, "onTimePaymentPercentage": 0 }
}`;

      console.log("Sending to AI for analysis...");

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
            {
              role: "user",
              content: [
                { type: "text", text: "Parse this credit report and extract all data into the specified JSON format. Be thorough and identify all disputable items." },
                { 
                  type: "image_url", 
                  image_url: { 
                    url: `data:${mimeType};base64,${base64}`
                  } 
                }
              ]
            }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      console.log("AI Response received, parsing JSON...");

      // Parse the AI response
      let analysis;
      try {
        const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || 
                          aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          analysis = { rawText: aiResponse };
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        analysis = { rawText: aiResponse };
      }

      // Build summary data
      const summary = {
        totalAccounts: (analysis.tradelines?.length || 0) + (analysis.collections?.length || 0),
        negativeCount: analysis.negativeItems?.length || 0,
        collectionsCount: analysis.collections?.length || 0,
        inquiryCount: analysis.inquiries?.length || 0,
        onTimePaymentPercentage: analysis.summary?.onTimePaymentPercentage || 95,
        ...analysis.summary
      };

      // Build disputable items list
      const disputableItems = (analysis.negativeItems || [])
        .filter((item: any) => item.disputable)
        .map((item: any) => ({
          creditor: item.creditor,
          type: item.type,
          bureau: item.bureau,
          reason: item.reason,
          disputeReason: item.disputeReason,
        }));

      console.log(`OCR Document Parser: Completed. Found ${disputableItems.length} disputable items.`);

      return new Response(JSON.stringify({ 
        success: true,
        rawText: aiResponse,
        analysis,
        summary,
        disputableItems,
        provider,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Original action-based handling for other use cases
    let systemPrompt = "";
    let userPrompt = "";
    let includeImage = false;

    switch (action) {
      case "parse_credit_report":
        systemPrompt = `You are a Credit Report Parser AI with OCR capabilities. Extract and structure data from credit report images or text.

Extract ALL of the following:
1. Personal Information (name, address, SSN last 4, DOB)
2. Credit Scores (all bureaus)
3. Tradelines (creditor, account type, balance, status, payment history, dates)
4. Collections (creditor, amount, date, status)
5. Inquiries (creditor, date, type)
6. Public Records (type, date, amount)
7. Negative Items (identify all negatives with reasons)

Provide structured JSON output with:
- personalInfo: {name, address, ssn4, dob}
- scores: [{bureau, score, date}]
- tradelines: [{creditor, accountType, accountNumber, balance, creditLimit, status, opened, lastReported, paymentHistory}]
- collections: [{creditor, originalCreditor, amount, dateOpened, status}]
- inquiries: [{creditor, date, type}]
- publicRecords: [{type, date, amount, status}]
- negativeItems: [{item, reason, bureau, impact, disputable}]
- summary: {totalAccounts, negativeCount, collectionsCount, inquiryCount}`;

        if (imageBase64) {
          includeImage = true;
          userPrompt = `Parse this credit report image and extract all data into structured format.`;
        } else if (extractedText) {
          userPrompt = `Parse this credit report text and extract all data:

${extractedText}`;
        } else {
          throw new Error("Either imageBase64 or extractedText is required");
        }
        break;

      case "parse_id_document":
        systemPrompt = `You are an ID Document Parser AI. Extract information from ID documents (driver's license, passport, state ID) for identity verification.

Extract:
- Full legal name
- Date of birth
- Address (if present)
- Document number
- Expiration date
- State/Country of issue
- Document type

Provide structured JSON output with:
- documentType: Type of ID
- fullName: {firstName, middleName, lastName}
- dateOfBirth: DOB
- address: Full address if present
- documentNumber: ID number (partially redacted for security)
- expirationDate: Expiry date
- issuingAuthority: State or country
- isExpired: Boolean
- isValid: Initial validity assessment
- warnings: Any concerns about the document`;

        if (imageBase64) {
          includeImage = true;
          userPrompt = `Parse this ID document image and extract identity information for verification.`;
        } else {
          throw new Error("imageBase64 is required for ID parsing");
        }
        break;

      case "parse_bureau_letter":
        systemPrompt = `You are a Bureau Response Letter Parser. Extract outcome information from credit bureau response letters.

Extract:
- Which bureau sent the letter
- Date of the letter
- Items addressed and their outcomes
- Required follow-up actions
- Verification method used
- Reinvestigation results

Provide structured JSON output with:
- bureau: Bureau name
- letterDate: Date on letter
- referenceNumber: If present
- items: [{creditor, accountNumber, outcome, details}]
- overallResult: Summary of outcomes
- nextSteps: Required actions
- deadline: Any response deadlines
- verificationMethod: How items were verified`;

        if (imageBase64) {
          includeImage = true;
          userPrompt = `Parse this bureau response letter and extract all outcome information.`;
        } else if (extractedText) {
          userPrompt = `Parse this bureau response letter text:

${extractedText}`;
        } else {
          throw new Error("Either imageBase64 or extractedText is required");
        }
        break;

      case "parse_proof_document":
        systemPrompt = `You are a Proof Document Parser. Extract information from supporting documents like utility bills, bank statements, or proof of address.

Extract relevant information for credit dispute support:
- Document type
- Account holder name
- Address shown
- Date of document
- Key details that prove identity/address

Provide structured JSON output with:
- documentType: Type of proof document
- accountHolderName: Name on document
- address: Address shown
- documentDate: Date of document
- provider: Company/institution name
- isValidProof: Whether it meets requirements
- expirationConcerns: If document is too old
- extractedDetails: Other relevant info`;

        if (imageBase64) {
          includeImage = true;
          userPrompt = `Parse this proof document and extract relevant information for credit dispute support.`;
        } else if (extractedText) {
          userPrompt = `Parse this proof document text:

${extractedText}`;
        } else {
          throw new Error("Either imageBase64 or extractedText is required");
        }
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`OCR Document Parser: Processing ${action}${includeImage ? ' with image' : ''}`);

    // Build messages array
    const messages: any[] = [
      { role: "system", content: systemPrompt }
    ];

    if (includeImage && imageBase64) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { 
            type: "image_url", 
            image_url: { 
              url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` 
            } 
          }
        ]
      });
    } else {
      messages.push({ role: "user", content: userPrompt });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    let result;
    try {
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || 
                        aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        result = { rawText: aiResponse };
      }
    } catch {
      result = { rawText: aiResponse };
    }

    console.log(`OCR Document Parser: Completed ${action}`);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in ocr-document-parser:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
