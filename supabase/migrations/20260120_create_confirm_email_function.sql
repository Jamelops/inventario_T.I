-- =====================================================
-- CREATE ADMIN FUNCTION TO CONFIRM EMAIL WITHOUT VERIFICATION
-- =====================================================

CREATE OR REPLACE FUNCTION public.confirm_user_email(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_id UUID;
  result JSON;
BEGIN
  -- Get user_id from email
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN JSON_BUILD_OBJECT('error', 'User not found', 'success', false);
  END IF;

  -- Update user to mark email as confirmed
  UPDATE auth.users 
  SET email_confirmed_at = NOW(),
      updated_at = NOW()
  WHERE id = user_id;

  RETURN JSON_BUILD_OBJECT(
    'success', true,
    'user_id', user_id,
    'message', 'Email confirmed successfully'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN JSON_BUILD_OBJECT(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.confirm_user_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_user_email(TEXT) TO service_role;