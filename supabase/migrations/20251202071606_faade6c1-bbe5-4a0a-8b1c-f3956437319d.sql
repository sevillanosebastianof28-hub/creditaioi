-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('client', 'agency_owner', 'va_staff');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  agency_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create agencies table
CREATE TABLE public.agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key for agency_id in profiles
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_agency 
FOREIGN KEY (agency_id) REFERENCES public.agencies(id) ON DELETE SET NULL;

-- Create VA assignments table (for assigning VAs to clients)
CREATE TABLE public.va_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  va_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (va_user_id, client_user_id)
);

-- Create SmartCredit connections table
CREATE TABLE public.smartcredit_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  connected_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  connection_status TEXT DEFAULT 'disconnected',
  access_token_encrypted TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.va_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smartcredit_connections ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Function to get user's agency_id
CREATE OR REPLACE FUNCTION public.get_user_agency_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT agency_id
  FROM public.profiles
  WHERE user_id = _user_id
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Agency owners can view profiles in their agency"
ON public.profiles FOR SELECT
USING (
  public.has_role(auth.uid(), 'agency_owner') AND 
  agency_id = public.get_user_agency_id(auth.uid())
);

CREATE POLICY "VAs can view assigned client profiles"
ON public.profiles FOR SELECT
USING (
  public.has_role(auth.uid(), 'va_staff') AND
  EXISTS (
    SELECT 1 FROM public.va_assignments
    WHERE va_user_id = auth.uid() AND client_user_id = profiles.user_id
  )
);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- User roles RLS policies
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role during signup"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Agencies RLS policies
CREATE POLICY "Agency owners can view own agency"
ON public.agencies FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Agency members can view their agency"
ON public.agencies FOR SELECT
USING (
  id = public.get_user_agency_id(auth.uid())
);

CREATE POLICY "Agency owners can insert agency"
ON public.agencies FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Agency owners can update own agency"
ON public.agencies FOR UPDATE
USING (owner_id = auth.uid());

-- VA assignments RLS policies
CREATE POLICY "Agency owners can manage VA assignments"
ON public.va_assignments FOR ALL
USING (
  public.has_role(auth.uid(), 'agency_owner') AND
  agency_id = public.get_user_agency_id(auth.uid())
);

CREATE POLICY "VAs can view their assignments"
ON public.va_assignments FOR SELECT
USING (va_user_id = auth.uid());

CREATE POLICY "Clients can view their VA assignment"
ON public.va_assignments FOR SELECT
USING (client_user_id = auth.uid());

-- SmartCredit connections RLS policies
CREATE POLICY "Users can view own SmartCredit connection"
ON public.smartcredit_connections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own SmartCredit connection"
ON public.smartcredit_connections FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Agency owners can view client connections"
ON public.smartcredit_connections FOR SELECT
USING (
  public.has_role(auth.uid(), 'agency_owner') AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = smartcredit_connections.user_id
    AND profiles.agency_id = public.get_user_agency_id(auth.uid())
  )
);

CREATE POLICY "VAs can view assigned client connections"
ON public.smartcredit_connections FOR SELECT
USING (
  public.has_role(auth.uid(), 'va_staff') AND
  EXISTS (
    SELECT 1 FROM public.va_assignments
    WHERE va_user_id = auth.uid() AND client_user_id = smartcredit_connections.user_id
  )
);

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agencies_updated_at
BEFORE UPDATE ON public.agencies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();