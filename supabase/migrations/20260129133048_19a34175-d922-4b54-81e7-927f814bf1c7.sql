-- Create table for AI interaction logging (for future fine-tuning)
CREATE TABLE public.ai_interaction_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  interaction_type TEXT NOT NULL, -- 'dispute_eligibility', 'credit_explanation', 'letter_generation', etc.
  
  -- Input data
  user_input TEXT NOT NULL,
  context_retrieved JSONB, -- RAG context that was used
  
  -- Classifier output (Model 2 equivalent)
  eligibility_decision TEXT CHECK (eligibility_decision IN ('eligible', 'conditionally_eligible', 'not_eligible', 'insufficient_information')),
  classifier_confidence DECIMAL(3,2), -- 0.00 to 1.00
  classifier_reasoning JSONB, -- Structured reasoning factors
  
  -- Response output (Model 1 equivalent)  
  response_generated TEXT,
  response_structure JSONB, -- Parsed structured response
  
  -- Metadata for fine-tuning
  dispute_type TEXT, -- 'collections', 'late_payments', 'charge_offs', 'inquiries', etc.
  account_type TEXT, -- 'revolving', 'installment', 'collection', etc.
  bureau TEXT, -- 'experian', 'equifax', 'transunion'
  compliance_flags TEXT[], -- Any compliance warnings triggered
  was_refused BOOLEAN DEFAULT false, -- If system refused to answer
  refusal_reason TEXT,
  
  -- Quality signals
  user_feedback TEXT CHECK (user_feedback IN ('helpful', 'not_helpful', 'incorrect', 'unclear')),
  agent_override BOOLEAN DEFAULT false, -- If VA overrode the AI decision
  agent_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processing_time_ms INTEGER, -- Latency tracking
  
  -- Fine-tuning readiness
  is_training_ready BOOLEAN DEFAULT false, -- Marked as verified for training
  training_label TEXT -- Human-verified correct label
);

-- Enable RLS
ALTER TABLE public.ai_interaction_logs ENABLE ROW LEVEL SECURITY;

-- Agency owners and VAs can view logs for their agency's clients
CREATE POLICY "Agency staff can view AI logs"
ON public.ai_interaction_logs
FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN profiles p ON p.user_id = auth.uid()
    JOIN profiles client_p ON client_p.user_id = ai_interaction_logs.user_id
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('agency_owner', 'va_staff')
    AND p.agency_id = client_p.agency_id
  )
);

-- System can insert logs
CREATE POLICY "System can insert AI logs"
ON public.ai_interaction_logs
FOR INSERT
WITH CHECK (true);

-- Agency owners can update logs (for feedback/training labels)
CREATE POLICY "Agency owners can update logs"
ON public.ai_interaction_logs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'agency_owner'
  )
);

-- Create indexes for fine-tuning queries
CREATE INDEX idx_ai_logs_interaction_type ON public.ai_interaction_logs(interaction_type);
CREATE INDEX idx_ai_logs_dispute_type ON public.ai_interaction_logs(dispute_type);
CREATE INDEX idx_ai_logs_eligibility ON public.ai_interaction_logs(eligibility_decision);
CREATE INDEX idx_ai_logs_training_ready ON public.ai_interaction_logs(is_training_ready) WHERE is_training_ready = true;
CREATE INDEX idx_ai_logs_created_at ON public.ai_interaction_logs(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE public.ai_interaction_logs IS 'Stores all AI interactions for audit, analytics, and future model fine-tuning. Tracks both classifier decisions and generated responses.';