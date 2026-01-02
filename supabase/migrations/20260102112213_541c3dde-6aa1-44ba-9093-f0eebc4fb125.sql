-- 1. Create dispute_letters table for letter persistence
CREATE TABLE public.dispute_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_item_id UUID REFERENCES public.dispute_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  letter_type TEXT NOT NULL,
  letter_content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMP WITH TIME ZONE,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create score_history table for persistent tracking
CREATE TABLE public.score_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  experian INTEGER,
  equifax INTEGER,
  transunion INTEGER,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'manual'
);

-- 3. Create tasks table for VA workflow
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id),
  assigned_to UUID,
  client_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  ai_generated BOOLEAN DEFAULT false,
  related_dispute_id UUID REFERENCES public.dispute_items(id),
  related_letter_id UUID REFERENCES public.dispute_letters(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Create bureau_responses table for response tracking
CREATE TABLE public.bureau_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_item_id UUID REFERENCES public.dispute_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  bureau TEXT NOT NULL,
  response_type TEXT NOT NULL,
  response_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  outcome TEXT,
  response_content TEXT,
  file_path TEXT,
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.dispute_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bureau_responses ENABLE ROW LEVEL SECURITY;

-- Dispute letters policies
CREATE POLICY "Users can view own letters" ON public.dispute_letters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own letters" ON public.dispute_letters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own letters" ON public.dispute_letters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Agency owners can view client letters" ON public.dispute_letters FOR SELECT USING (
  has_role(auth.uid(), 'agency_owner'::app_role) AND EXISTS (
    SELECT 1 FROM profiles WHERE profiles.user_id = dispute_letters.user_id AND profiles.agency_id = get_user_agency_id(auth.uid())
  )
);
CREATE POLICY "VAs can view assigned client letters" ON public.dispute_letters FOR SELECT USING (
  has_role(auth.uid(), 'va_staff'::app_role) AND EXISTS (
    SELECT 1 FROM va_assignments WHERE va_assignments.va_user_id = auth.uid() AND va_assignments.client_user_id = dispute_letters.user_id
  )
);

-- Score history policies
CREATE POLICY "Users can view own score history" ON public.score_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own score history" ON public.score_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Agency owners can view client scores" ON public.score_history FOR SELECT USING (
  has_role(auth.uid(), 'agency_owner'::app_role) AND EXISTS (
    SELECT 1 FROM profiles WHERE profiles.user_id = score_history.user_id AND profiles.agency_id = get_user_agency_id(auth.uid())
  )
);

-- Tasks policies
CREATE POLICY "Agency owners can manage all tasks" ON public.tasks FOR ALL USING (
  has_role(auth.uid(), 'agency_owner'::app_role) AND agency_id = get_user_agency_id(auth.uid())
);
CREATE POLICY "VAs can view assigned tasks" ON public.tasks FOR SELECT USING (
  has_role(auth.uid(), 'va_staff'::app_role) AND assigned_to = auth.uid()
);
CREATE POLICY "VAs can update assigned tasks" ON public.tasks FOR UPDATE USING (
  has_role(auth.uid(), 'va_staff'::app_role) AND assigned_to = auth.uid()
);
CREATE POLICY "Clients can view own tasks" ON public.tasks FOR SELECT USING (client_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Bureau responses policies
CREATE POLICY "Users can manage own responses" ON public.bureau_responses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Agency owners can view client responses" ON public.bureau_responses FOR SELECT USING (
  has_role(auth.uid(), 'agency_owner'::app_role) AND EXISTS (
    SELECT 1 FROM profiles WHERE profiles.user_id = bureau_responses.user_id AND profiles.agency_id = get_user_agency_id(auth.uid())
  )
);
CREATE POLICY "VAs can view assigned client responses" ON public.bureau_responses FOR SELECT USING (
  has_role(auth.uid(), 'va_staff'::app_role) AND EXISTS (
    SELECT 1 FROM va_assignments WHERE va_assignments.va_user_id = auth.uid() AND va_assignments.client_user_id = bureau_responses.user_id
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_dispute_letters_updated_at BEFORE UPDATE ON public.dispute_letters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;