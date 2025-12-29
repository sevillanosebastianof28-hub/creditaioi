-- Create storage bucket for credit report uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('credit-reports', 'credit-reports', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policy: Users can upload their own credit reports
CREATE POLICY "Users can upload their own credit reports"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'credit-reports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy: Users can view their own credit reports
CREATE POLICY "Users can view their own credit reports"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'credit-reports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy: Users can delete their own credit reports
CREATE POLICY "Users can delete their own credit reports"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'credit-reports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create table to store AI analysis results
CREATE TABLE public.credit_report_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_path TEXT,
  raw_text TEXT,
  analysis_result JSONB,
  disputable_items JSONB,
  summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_report_analyses ENABLE ROW LEVEL SECURITY;

-- Users can view their own analyses
CREATE POLICY "Users can view their own credit analyses"
ON public.credit_report_analyses
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own analyses
CREATE POLICY "Users can create their own credit analyses"
ON public.credit_report_analyses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own analyses
CREATE POLICY "Users can update their own credit analyses"
ON public.credit_report_analyses
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own analyses
CREATE POLICY "Users can delete their own credit analyses"
ON public.credit_report_analyses
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_credit_report_analyses_updated_at
BEFORE UPDATE ON public.credit_report_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();