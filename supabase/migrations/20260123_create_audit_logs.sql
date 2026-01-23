-- =====================================================
-- CREATE AUDIT LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  user_id UUID,
  changes JSONB,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  metadata JSONB,
  ip_address TEXT
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow only admins/managers to read audit logs (no broad SELECT)
CREATE POLICY "Admins and managers can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- No INSERT/UPDATE/DELETE policies for authenticated/anon.
-- Service role bypasses RLS for Edge Function inserts.
