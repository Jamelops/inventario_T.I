-- Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert maintenance tasks" ON public.maintenance_tasks;
DROP POLICY IF EXISTS "Authenticated users can update maintenance tasks" ON public.maintenance_tasks;
DROP POLICY IF EXISTS "Authenticated users can delete maintenance tasks" ON public.maintenance_tasks;

-- Create more secure policies for maintenance_tasks
CREATE POLICY "Users can insert their own maintenance tasks" 
ON public.maintenance_tasks 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own maintenance tasks" 
ON public.maintenance_tasks 
FOR UPDATE 
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own maintenance tasks" 
ON public.maintenance_tasks 
FOR DELETE 
TO authenticated
USING (auth.uid() = created_by);