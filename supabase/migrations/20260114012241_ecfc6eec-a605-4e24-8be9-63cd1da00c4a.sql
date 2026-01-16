-- Drop the security definer view and recreate as regular view
DROP VIEW IF EXISTS public.profile_usernames;

-- Create a simple view (not security definer)
CREATE VIEW public.profile_usernames 
WITH (security_invoker = true)
AS SELECT id, user_id, username FROM profiles;

-- Grant access to the view
GRANT SELECT ON public.profile_usernames TO authenticated;

-- Add a policy to allow viewing all usernames (but not emails)
CREATE POLICY "Authenticated users can view all usernames via function"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- But we need to control which columns are visible
-- Since RLS works at row level, not column level, we'll use an RPC function instead
DROP VIEW IF EXISTS public.profile_usernames;

-- Create a function to get usernames only (more secure)
CREATE OR REPLACE FUNCTION public.get_all_usernames()
RETURNS TABLE(id uuid, user_id uuid, username text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, user_id, username FROM public.profiles ORDER BY username;
$$;

-- Remove the overly permissive policy we just added
DROP POLICY IF EXISTS "Authenticated users can view all usernames via function" ON public.profiles;