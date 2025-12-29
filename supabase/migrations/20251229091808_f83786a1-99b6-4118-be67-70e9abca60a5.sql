-- Create enum for dispute status
CREATE TYPE public.dispute_status AS ENUM ('pending', 'in_progress', 'responded', 'verified', 'deleted', 'updated', 'failed');

-- Create enum for bureau type
CREATE TYPE public.bureau_type AS ENUM ('experian', 'equifax', 'transunion');

-- Create dispute_rounds table to track each round of disputes
CREATE TABLE public.dispute_rounds (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    round_number INTEGER NOT NULL DEFAULT 1,
    status dispute_status NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    ai_recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dispute_items table for individual items in each round
CREATE TABLE public.dispute_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    round_id UUID NOT NULL REFERENCES public.dispute_rounds(id) ON DELETE CASCADE,
    client_id UUID NOT NULL,
    bureau bureau_type NOT NULL,
    creditor_name TEXT NOT NULL,
    account_number TEXT,
    dispute_reason TEXT NOT NULL,
    letter_type TEXT NOT NULL,
    letter_content TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    response_received_at TIMESTAMP WITH TIME ZONE,
    outcome dispute_status NOT NULL DEFAULT 'pending',
    outcome_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create outcome_tracking table for AI learning
CREATE TABLE public.outcome_tracking (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    dispute_item_id UUID REFERENCES public.dispute_items(id) ON DELETE SET NULL,
    bureau bureau_type NOT NULL,
    letter_type TEXT NOT NULL,
    creditor_name TEXT,
    dispute_reason TEXT NOT NULL,
    outcome dispute_status NOT NULL,
    days_to_response INTEGER,
    success_factors JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bureau_patterns table for tracking bureau-specific patterns
CREATE TABLE public.bureau_patterns (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    bureau bureau_type NOT NULL,
    pattern_type TEXT NOT NULL,
    pattern_data JSONB NOT NULL,
    success_rate DECIMAL(5,2),
    sample_size INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(bureau, pattern_type)
);

-- Enable RLS
ALTER TABLE public.dispute_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outcome_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bureau_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dispute_rounds
CREATE POLICY "Agency owners can manage dispute rounds"
ON public.dispute_rounds
FOR ALL
USING (has_role(auth.uid(), 'agency_owner'));

CREATE POLICY "VAs can view and update assigned client rounds"
ON public.dispute_rounds
FOR ALL
USING (
    has_role(auth.uid(), 'va_staff') AND 
    EXISTS (
        SELECT 1 FROM va_assignments 
        WHERE va_user_id = auth.uid() AND client_user_id = dispute_rounds.client_id
    )
);

CREATE POLICY "Clients can view own rounds"
ON public.dispute_rounds
FOR SELECT
USING (client_id = auth.uid());

-- RLS Policies for dispute_items
CREATE POLICY "Agency owners can manage dispute items"
ON public.dispute_items
FOR ALL
USING (has_role(auth.uid(), 'agency_owner'));

CREATE POLICY "VAs can manage assigned client items"
ON public.dispute_items
FOR ALL
USING (
    has_role(auth.uid(), 'va_staff') AND 
    EXISTS (
        SELECT 1 FROM va_assignments 
        WHERE va_user_id = auth.uid() AND client_user_id = dispute_items.client_id
    )
);

CREATE POLICY "Clients can view own items"
ON public.dispute_items
FOR SELECT
USING (client_id = auth.uid());

-- RLS Policies for outcome_tracking (agency-wide learning)
CREATE POLICY "Agency owners can manage outcomes"
ON public.outcome_tracking
FOR ALL
USING (has_role(auth.uid(), 'agency_owner'));

CREATE POLICY "VAs can view outcomes"
ON public.outcome_tracking
FOR SELECT
USING (has_role(auth.uid(), 'va_staff'));

-- RLS Policies for bureau_patterns (agency-wide patterns)
CREATE POLICY "Agency owners can manage patterns"
ON public.bureau_patterns
FOR ALL
USING (has_role(auth.uid(), 'agency_owner'));

CREATE POLICY "Staff can view patterns"
ON public.bureau_patterns
FOR SELECT
USING (has_role(auth.uid(), 'agency_owner') OR has_role(auth.uid(), 'va_staff'));

-- Create triggers for updated_at
CREATE TRIGGER update_dispute_rounds_updated_at
BEFORE UPDATE ON public.dispute_rounds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dispute_items_updated_at
BEFORE UPDATE ON public.dispute_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();