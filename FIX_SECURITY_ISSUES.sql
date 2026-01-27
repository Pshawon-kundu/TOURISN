-- Fix Supabase Security Linter Errors
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Enable RLS on tables missing it
-- ============================================

-- Enable RLS on saved_places
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own saved places" ON public.saved_places;
DROP POLICY IF EXISTS "Users can insert their own saved places" ON public.saved_places;
DROP POLICY IF EXISTS "Users can delete their own saved places" ON public.saved_places;

-- Create policy for saved_places: users can only see their own saved places
CREATE POLICY "Users can view their own saved places"
ON public.saved_places
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved places"
ON public.saved_places
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved places"
ON public.saved_places
FOR DELETE
USING (auth.uid() = user_id);


-- Enable RLS on favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;

-- Create policy for favorites: users can only see their own favorites
CREATE POLICY "Users can view their own favorites"
ON public.favorites
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
ON public.favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
ON public.favorites
FOR DELETE
USING (auth.uid() = user_id);


-- Enable RLS on transport_bookings
ALTER TABLE public.transport_bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own transport bookings" ON public.transport_bookings;
DROP POLICY IF EXISTS "Users can create transport bookings" ON public.transport_bookings;
DROP POLICY IF EXISTS "Users can update their own transport bookings" ON public.transport_bookings;

-- Create policy for transport_bookings: users can see bookings they created
CREATE POLICY "Users can view their own transport bookings"
ON public.transport_bookings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create transport bookings"
ON public.transport_bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transport bookings"
ON public.transport_bookings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- Enable RLS on user_status_changes
ALTER TABLE public.user_status_changes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own status changes" ON public.user_status_changes;

-- Create policy for user_status_changes: users can only see their own status changes
CREATE POLICY "Users can view their own status changes"
ON public.user_status_changes
FOR SELECT
USING (auth.uid() = user_id);

-- Only system/admin can insert status changes (via backend service role)
-- No INSERT policy for regular users


-- ============================================
-- 2. Fix Security Definer View
-- ============================================

-- Recreate admin_dashboard_stats view with SECURITY INVOKER to fix linter warning
-- This will use the querying user's permissions instead of the view creator's
DROP VIEW IF EXISTS public.admin_dashboard_stats;

CREATE VIEW public.admin_dashboard_stats 
WITH (security_invoker=true)
AS
SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'traveler') as total_travelers,
  (SELECT COUNT(*) FROM users WHERE role = 'guide') as total_guides,
  (SELECT COUNT(*) FROM bookings) as total_bookings,
  (SELECT COUNT(*) FROM chat_rooms) as total_chats;

-- ============================================
-- 3. Verify RLS is enabled
-- ============================================

-- Check which tables have RLS enabled:
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check existing policies:
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
