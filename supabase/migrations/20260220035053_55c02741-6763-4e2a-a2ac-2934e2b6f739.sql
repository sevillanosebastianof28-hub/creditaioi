
-- Create a trigger function to auto-create profile and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _first_name text;
  _last_name text;
  _role app_role;
  _agency_name text;
  _agency_id uuid;
BEGIN
  _first_name := NEW.raw_user_meta_data ->> 'first_name';
  _last_name := NEW.raw_user_meta_data ->> 'last_name';
  _role := (NEW.raw_user_meta_data ->> 'role')::app_role;
  _agency_name := NEW.raw_user_meta_data ->> 'agency_name';

  -- Default role to client if not specified
  IF _role IS NULL THEN
    _role := 'client';
  END IF;

  -- Create agency first if agency_owner
  IF _role = 'agency_owner' AND _agency_name IS NOT NULL AND _agency_name != '' THEN
    INSERT INTO public.agencies (name, owner_id, email)
    VALUES (_agency_name, NEW.id, NEW.email)
    RETURNING id INTO _agency_id;
  END IF;

  -- Create profile
  INSERT INTO public.profiles (user_id, first_name, last_name, email, agency_id)
  VALUES (NEW.id, _first_name, _last_name, NEW.email, _agency_id);

  -- Create role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
