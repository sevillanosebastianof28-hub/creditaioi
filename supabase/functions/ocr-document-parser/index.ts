import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, imageBase64, documentType, extractedText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
