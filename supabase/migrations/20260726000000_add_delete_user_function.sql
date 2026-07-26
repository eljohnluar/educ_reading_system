-- Create a security definer function to allow admins to delete users from auth.users
CREATE OR REPLACE FUNCTION delete_user_by_admin(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with high privileges to delete from auth schema
AS $$
BEGIN
  -- Security check: Verify that the caller is an administrator
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can delete users.';
  END IF;

  -- Deleting from auth.users automatically cascades to public.profiles and related progress/log tables
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;
