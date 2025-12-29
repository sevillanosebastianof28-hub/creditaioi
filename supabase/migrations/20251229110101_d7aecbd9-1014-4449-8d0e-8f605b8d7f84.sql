-- Create client_documents table for real document uploads
CREATE TABLE public.client_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  document_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

-- Users can manage their own documents
CREATE POLICY "Users can view own documents" ON public.client_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.client_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.client_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Agency owners can view client documents
CREATE POLICY "Agency owners can view client documents" ON public.client_documents
  FOR SELECT USING (
    has_role(auth.uid(), 'agency_owner'::app_role) AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = client_documents.user_id
      AND profiles.agency_id = get_user_agency_id(auth.uid())
    )
  );

-- VAs can view assigned client documents
CREATE POLICY "VAs can view assigned client documents" ON public.client_documents
  FOR SELECT USING (
    has_role(auth.uid(), 'va_staff'::app_role) AND
    EXISTS (
      SELECT 1 FROM va_assignments
      WHERE va_assignments.va_user_id = auth.uid()
      AND va_assignments.client_user_id = client_documents.user_id
    )
  );

-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('client-documents', 'client-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for client documents bucket
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'client-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'client-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'client-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );