-- Add unique constraint on user_id for credit_report_analyses to support upsert
ALTER TABLE public.credit_report_analyses 
ADD CONSTRAINT credit_report_analyses_user_id_key UNIQUE (user_id);