-- Drop existing conflicting policies first
DROP POLICY IF EXISTS "Managers and admins can view all licenses" ON public.licenses;
DROP POLICY IF EXISTS "Users can view own or assigned tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can update own or assigned tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can view own or assigned tasks" ON public.maintenance_tasks;
DROP POLICY IF EXISTS "Users can update own or assigned tasks" ON public.maintenance_tasks;
DROP POLICY IF EXISTS "Users can view own or assigned assets" ON public.assets;
DROP POLICY IF EXISTS "Users can update own or assigned assets" ON public.assets;
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.asset_categories;
DROP POLICY IF EXISTS "Authenticated users can view active suppliers" ON public.ticket_suppliers;
DROP POLICY IF EXISTS "Managers can view all suppliers" ON public.ticket_suppliers;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can create licenses" ON public.licenses;

-- Fix 2: Make licenses table license keys only visible to managers/admins, not creators
CREATE POLICY "Managers and admins can view all licenses" ON public.licenses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'manager')
  )
);

-- Users can still insert their own licenses
CREATE POLICY "Authenticated users can create licenses" ON public.licenses
FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Fix 3: Add policy for tickets so responsavel_id can view tickets assigned to them
CREATE POLICY "Users can view own or assigned tickets" ON public.tickets
FOR SELECT USING (
  auth.uid() = created_by 
  OR auth.uid() = responsavel_id
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'manager')
  )
);

-- Fix 4: Allow ticket responsavel to update tickets assigned to them
CREATE POLICY "Users can update own or assigned tickets" ON public.tickets
FOR UPDATE USING (
  auth.uid() = created_by 
  OR auth.uid() = responsavel_id
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'manager')
  )
);

-- Fix 5: Add responsible_id to maintenance_tasks and allow access
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS responsible_id UUID REFERENCES auth.users(id);

-- Update maintenance_tasks policies to include responsible_id
CREATE POLICY "Users can view own or assigned tasks" ON public.maintenance_tasks
FOR SELECT USING (
  auth.uid() = created_by 
  OR auth.uid() = responsible_id
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Users can update own or assigned tasks" ON public.maintenance_tasks
FOR UPDATE USING (
  auth.uid() = created_by 
  OR auth.uid() = responsible_id
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'manager')
  )
);

-- Fix 6: Add responsible_id to assets and allow access by responsible party
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES auth.users(id);

CREATE POLICY "Users can view own or assigned assets" ON public.assets
FOR SELECT USING (
  auth.uid() = created_by 
  OR auth.uid() = responsavel_id
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Users can update own or assigned assets" ON public.assets
FOR UPDATE USING (
  auth.uid() = created_by 
  OR auth.uid() = responsavel_id
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'manager')
  )
);

-- Fix 7: Make asset_categories readable by all authenticated users (reference data)
CREATE POLICY "Authenticated users can view categories" ON public.asset_categories
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix 8: Make ticket_suppliers readable by all authenticated users
CREATE POLICY "Authenticated users can view active suppliers" ON public.ticket_suppliers
FOR SELECT USING (auth.uid() IS NOT NULL AND ativo = true);

-- Managers/admins can view all suppliers including inactive
CREATE POLICY "Managers can view all suppliers" ON public.ticket_suppliers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'manager')
  )
);