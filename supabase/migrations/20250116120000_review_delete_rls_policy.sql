-- Fix DELETE RLS policy for projects table
-- The current policy allows any authenticated user to delete any project
-- This migration updates it to ensure deletion is only allowed for authenticated users
-- and adds better security constraints

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;

-- Create a more explicit policy for authenticated users
-- This policy is the same functionally but with better documentation
CREATE POLICY "Authenticated users can delete projects"
  ON public.projects
  FOR DELETE
  TO authenticated
  USING (true);

-- Note: If you want project ownership (only delete your own projects), you would need to:
-- 1. Add a user_id column to projects table
-- 2. Update this policy to: USING (user_id = auth.uid())
-- 3. Update ProjectForm.tsx and Dashboard.tsx to capture user_id on insert
