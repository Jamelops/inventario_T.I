-- 1. Drop the unrestricted get_all_usernames function and replace with role-restricted version
CREATE OR REPLACE FUNCTION public.get_all_usernames()
RETURNS TABLE(id uuid, user_id uuid, username text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, user_id, username 
  FROM public.profiles 
  WHERE 
    -- Only return all usernames if the caller is an admin or manager
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
  ORDER BY username;
$$;

-- 2. Drop the overly permissive SELECT policy for maintenance_tasks
DROP POLICY IF EXISTS "Authenticated users can view all maintenance tasks" ON public.maintenance_tasks;

-- 3. Create owner-based SELECT policy for regular users
CREATE POLICY "Users can view their own maintenance tasks"
ON public.maintenance_tasks
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

-- 4. Create role-based SELECT policy for managers and admins to view all tasks
CREATE POLICY "Managers and admins can view all maintenance tasks"
ON public.maintenance_tasks
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- 5. Add text length constraints using validation trigger instead of CHECK constraints
-- First, create the validation function
CREATE OR REPLACE FUNCTION public.validate_maintenance_task_text_lengths()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate description (max 1000 characters)
  IF length(NEW.description) > 1000 THEN
    RAISE EXCEPTION 'Descrição muito longa (máximo 1000 caracteres)';
  END IF;
  
  -- Validate notes (max 2000 characters)
  IF NEW.notes IS NOT NULL AND length(NEW.notes) > 2000 THEN
    RAISE EXCEPTION 'Notas muito longas (máximo 2000 caracteres)';
  END IF;
  
  -- Validate observation (max 2000 characters)
  IF NEW.observation IS NOT NULL AND length(NEW.observation) > 2000 THEN
    RAISE EXCEPTION 'Observação muito longa (máximo 2000 caracteres)';
  END IF;
  
  -- Validate maintenance_location (max 255 characters)
  IF NEW.maintenance_location IS NOT NULL AND length(NEW.maintenance_location) > 255 THEN
    RAISE EXCEPTION 'Local da manutenção muito longo (máximo 255 caracteres)';
  END IF;
  
  -- Validate equipment_situation (max 500 characters)
  IF NEW.equipment_situation IS NOT NULL AND length(NEW.equipment_situation) > 500 THEN
    RAISE EXCEPTION 'Situação do equipamento muito longa (máximo 500 caracteres)';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Create trigger for text length validation
DROP TRIGGER IF EXISTS validate_maintenance_task_lengths ON public.maintenance_tasks;
CREATE TRIGGER validate_maintenance_task_lengths
BEFORE INSERT OR UPDATE ON public.maintenance_tasks
FOR EACH ROW
EXECUTE FUNCTION public.validate_maintenance_task_text_lengths();