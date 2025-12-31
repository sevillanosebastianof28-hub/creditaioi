-- Create table for client credit goals
CREATE TABLE public.client_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_score INTEGER NOT NULL,
  target_date DATE,
  goal_type TEXT NOT NULL DEFAULT 'general',
  current_score INTEGER,
  ai_roadmap JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for AI chat messages
CREATE TABLE public.ai_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for AI predictions cache
CREATE TABLE public.ai_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prediction_type TEXT NOT NULL,
  item_id UUID,
  prediction_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable RLS
ALTER TABLE public.client_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;

-- Client goals policies
CREATE POLICY "Users can manage own goals" ON public.client_goals FOR ALL USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can manage own chat" ON public.ai_chat_messages FOR ALL USING (auth.uid() = user_id);

-- Predictions policies
CREATE POLICY "Users can view own predictions" ON public.ai_predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert predictions" ON public.ai_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add updated_at trigger for goals
CREATE TRIGGER update_client_goals_updated_at
  BEFORE UPDATE ON public.client_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();