-- Create enum types for tickets
CREATE TYPE public.ticket_type AS ENUM (
  'internet_fora',
  'link_intermitente',
  'sistema_prodata_fora',
  'validador_travando',
  'hardware',
  'software',
  'outro'
);

CREATE TYPE public.ticket_status AS ENUM (
  'aberto',
  'em_andamento',
  'aguardando_terceiro',
  'resolvido',
  'encerrado'
);

CREATE TYPE public.ticket_priority AS ENUM (
  'baixa',
  'media',
  'alta',
  'critica'
);

CREATE TYPE public.ticket_interaction_type AS ENUM (
  'comentario',
  'ligacao',
  'email',
  'retorno_fornecedor',
  'mudanca_status'
);

CREATE TYPE public.supplier_category AS ENUM (
  'operadora',
  'prodata',
  'fornecedor_ti',
  'outro'
);

-- Create ticket_suppliers table
CREATE TABLE public.ticket_suppliers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL CHECK (char_length(nome) <= 200),
  categoria public.supplier_category NOT NULL,
  sla_horas integer NOT NULL DEFAULT 72,
  ativo boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on ticket_suppliers
ALTER TABLE public.ticket_suppliers ENABLE ROW LEVEL SECURITY;

-- RLS policies for ticket_suppliers
CREATE POLICY "Users can view their own suppliers"
  ON public.ticket_suppliers FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Managers and admins can view all suppliers"
  ON public.ticket_suppliers FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Users can insert their own suppliers"
  ON public.ticket_suppliers FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own suppliers"
  ON public.ticket_suppliers FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Managers and admins can update all suppliers"
  ON public.ticket_suppliers FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Users can delete their own suppliers"
  ON public.ticket_suppliers FOR DELETE
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete any supplier"
  ON public.ticket_suppliers FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Create tickets table
CREATE TABLE public.tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL CHECK (char_length(titulo) <= 500),
  descricao text NOT NULL CHECK (char_length(descricao) <= 5000),
  fornecedor_id uuid REFERENCES public.ticket_suppliers(id) ON DELETE SET NULL,
  tipo public.ticket_type NOT NULL,
  status public.ticket_status NOT NULL DEFAULT 'aberto',
  prioridade public.ticket_priority NOT NULL DEFAULT 'media',
  unidade text NOT NULL CHECK (char_length(unidade) <= 200),
  asset_id text,
  asset_nome text,
  protocolo_externo text CHECK (char_length(protocolo_externo) <= 100),
  contato_fornecedor jsonb DEFAULT '{}'::jsonb,
  responsavel_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  responsavel_nome text NOT NULL CHECK (char_length(responsavel_nome) <= 200),
  sla_deadline timestamp with time zone NOT NULL,
  data_resolucao timestamp with time zone,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- RLS policies for tickets
CREATE POLICY "Users can view their own tickets"
  ON public.tickets FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Managers and admins can view all tickets"
  ON public.tickets FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Users can insert their own tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tickets"
  ON public.tickets FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Managers and admins can update all tickets"
  ON public.tickets FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Users can delete their own tickets"
  ON public.tickets FOR DELETE
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete any ticket"
  ON public.tickets FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Create ticket_interactions table
CREATE TABLE public.ticket_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name text NOT NULL CHECK (char_length(user_name) <= 200),
  message text NOT NULL CHECK (char_length(message) <= 5000),
  type public.ticket_interaction_type NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on ticket_interactions
ALTER TABLE public.ticket_interactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for ticket_interactions (follow parent ticket access)
CREATE POLICY "Users can view interactions for their tickets"
  ON public.ticket_interactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.tickets 
    WHERE tickets.id = ticket_interactions.ticket_id 
    AND tickets.created_by = auth.uid()
  ));

CREATE POLICY "Managers and admins can view all interactions"
  ON public.ticket_interactions FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Users can insert interactions for their tickets"
  ON public.ticket_interactions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tickets 
    WHERE tickets.id = ticket_interactions.ticket_id 
    AND tickets.created_by = auth.uid()
  ));

CREATE POLICY "Managers and admins can insert interactions"
  ON public.ticket_interactions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Create asset_categories table
CREATE TABLE public.asset_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL CHECK (char_length(nome) <= 200),
  descricao text CHECK (char_length(descricao) <= 1000),
  icone text CHECK (char_length(icone) <= 100),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on asset_categories
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for asset_categories
CREATE POLICY "Users can view their own categories"
  ON public.asset_categories FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Managers and admins can view all categories"
  ON public.asset_categories FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Users can insert their own categories"
  ON public.asset_categories FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own categories"
  ON public.asset_categories FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Managers and admins can update all categories"
  ON public.asset_categories FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Users can delete their own categories"
  ON public.asset_categories FOR DELETE
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete any category"
  ON public.asset_categories FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Add updated_at triggers
CREATE TRIGGER update_ticket_suppliers_updated_at
  BEFORE UPDATE ON public.ticket_suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_asset_categories_updated_at
  BEFORE UPDATE ON public.asset_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_fornecedor_id ON public.tickets(fornecedor_id);
CREATE INDEX idx_ticket_interactions_ticket_id ON public.ticket_interactions(ticket_id);
CREATE INDEX idx_ticket_suppliers_created_by ON public.ticket_suppliers(created_by);
CREATE INDEX idx_asset_categories_created_by ON public.asset_categories(created_by);