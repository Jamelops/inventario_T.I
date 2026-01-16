-- Fix all RLS policies to be PERMISSIVE instead of RESTRICTIVE
-- PostgreSQL syntax: CREATE POLICY name ON table AS PERMISSIVE FOR command TO role USING/WITH CHECK

-- ==================== PROFILES TABLE ====================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles AS PERMISSIVE
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ==================== USER_ROLES TABLE ====================

DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role"
ON public.user_roles AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles AS PERMISSIVE
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
ON public.user_roles AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
ON public.user_roles AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
ON public.user_roles AS PERMISSIVE
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- ==================== ASSETS TABLE ====================

DROP POLICY IF EXISTS "Users can view their own assets" ON public.assets;
CREATE POLICY "Users can view their own assets"
ON public.assets AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Managers and admins can view all assets" ON public.assets;
CREATE POLICY "Managers and admins can view all assets"
ON public.assets AS PERMISSIVE
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

DROP POLICY IF EXISTS "Users can insert their own assets" ON public.assets;
CREATE POLICY "Users can insert their own assets"
ON public.assets AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own assets" ON public.assets;
CREATE POLICY "Users can update their own assets"
ON public.assets AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Managers and admins can update all assets" ON public.assets;
CREATE POLICY "Managers and admins can update all assets"
ON public.assets AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

DROP POLICY IF EXISTS "Users can delete their own assets" ON public.assets;
CREATE POLICY "Users can delete their own assets"
ON public.assets AS PERMISSIVE
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Admins can delete any asset" ON public.assets;
CREATE POLICY "Admins can delete any asset"
ON public.assets AS PERMISSIVE
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- ==================== LICENSES TABLE ====================

DROP POLICY IF EXISTS "Users can view their own licenses" ON public.licenses;
CREATE POLICY "Users can view their own licenses"
ON public.licenses AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Managers and admins can view all licenses" ON public.licenses;
CREATE POLICY "Managers and admins can view all licenses"
ON public.licenses AS PERMISSIVE
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

DROP POLICY IF EXISTS "Users can insert their own licenses" ON public.licenses;
CREATE POLICY "Users can insert their own licenses"
ON public.licenses AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own licenses" ON public.licenses;
CREATE POLICY "Users can update their own licenses"
ON public.licenses AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Managers and admins can update all licenses" ON public.licenses;
CREATE POLICY "Managers and admins can update all licenses"
ON public.licenses AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

DROP POLICY IF EXISTS "Users can delete their own licenses" ON public.licenses;
CREATE POLICY "Users can delete their own licenses"
ON public.licenses AS PERMISSIVE
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Admins can delete any license" ON public.licenses;
CREATE POLICY "Admins can delete any license"
ON public.licenses AS PERMISSIVE
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- ==================== MAINTENANCE_TASKS TABLE ====================

DROP POLICY IF EXISTS "Users can view their own maintenance tasks" ON public.maintenance_tasks;
CREATE POLICY "Users can view their own maintenance tasks"
ON public.maintenance_tasks AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Managers and admins can view all maintenance tasks" ON public.maintenance_tasks;
CREATE POLICY "Managers and admins can view all maintenance tasks"
ON public.maintenance_tasks AS PERMISSIVE
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

DROP POLICY IF EXISTS "Users can insert their own maintenance tasks" ON public.maintenance_tasks;
CREATE POLICY "Users can insert their own maintenance tasks"
ON public.maintenance_tasks AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own maintenance tasks" ON public.maintenance_tasks;
CREATE POLICY "Users can update their own maintenance tasks"
ON public.maintenance_tasks AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Managers and admins can update all maintenance tasks" ON public.maintenance_tasks;
CREATE POLICY "Managers and admins can update all maintenance tasks"
ON public.maintenance_tasks AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

DROP POLICY IF EXISTS "Users can delete their own maintenance tasks" ON public.maintenance_tasks;
CREATE POLICY "Users can delete their own maintenance tasks"
ON public.maintenance_tasks AS PERMISSIVE
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Admins can delete any maintenance task" ON public.maintenance_tasks;
CREATE POLICY "Admins can delete any maintenance task"
ON public.maintenance_tasks AS PERMISSIVE
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));