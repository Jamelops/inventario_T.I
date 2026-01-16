-- Create asset_status enum
CREATE TYPE public.asset_status AS ENUM ('ativo', 'inativo', 'manutencao', 'arquivado');

-- Create asset_category enum
CREATE TYPE public.asset_category AS ENUM ('notebook', 'desktop', 'servidor', 'monitor', 'impressora', 'rede', 'periferico', 'outros');

-- Create license_status enum
CREATE TYPE public.license_status AS ENUM ('ativa', 'vencendo', 'vencida', 'cancelada');

-- Create license_type enum
CREATE TYPE public.license_type AS ENUM ('perpetua', 'assinatura', 'volume', 'oem');

-- Create assets table
CREATE TABLE public.assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  legacy_id text, -- For migration from localStorage
  nome text NOT NULL,
  categoria asset_category NOT NULL,
  status asset_status NOT NULL DEFAULT 'ativo',
  numero_serie text NOT NULL,
  data_compra date NOT NULL,
  valor numeric(12,2) NOT NULL DEFAULT 0,
  localizacao text NOT NULL,
  responsavel text NOT NULL,
  descricao text,
  fornecedor text,
  tags text[] DEFAULT '{}',
  especificacoes jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT assets_nome_length CHECK (char_length(nome) <= 255),
  CONSTRAINT assets_numero_serie_length CHECK (char_length(numero_serie) <= 100),
  CONSTRAINT assets_localizacao_length CHECK (char_length(localizacao) <= 255),
  CONSTRAINT assets_responsavel_length CHECK (char_length(responsavel) <= 100),
  CONSTRAINT assets_descricao_length CHECK (char_length(descricao) <= 1000),
  CONSTRAINT assets_fornecedor_length CHECK (char_length(fornecedor) <= 255)
);

-- Create licenses table
CREATE TABLE public.licenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  legacy_id text, -- For migration from localStorage
  nome text NOT NULL,
  tipo license_type NOT NULL,
  quantidade_total integer NOT NULL DEFAULT 0,
  quantidade_usada integer NOT NULL DEFAULT 0,
  data_vencimento date NOT NULL,
  status license_status NOT NULL DEFAULT 'ativa',
  fornecedor text,
  chave text,
  notas text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT licenses_nome_length CHECK (char_length(nome) <= 255),
  CONSTRAINT licenses_fornecedor_length CHECK (char_length(fornecedor) <= 255),
  CONSTRAINT licenses_chave_length CHECK (char_length(chave) <= 500),
  CONSTRAINT licenses_notas_length CHECK (char_length(notas) <= 2000),
  CONSTRAINT licenses_quantidade_check CHECK (quantidade_usada <= quantidade_total)
);

-- Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Assets RLS Policies
-- Users can view their own assets
CREATE POLICY "Users can view their own assets"
ON public.assets
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

-- Managers and admins can view all assets
CREATE POLICY "Managers and admins can view all assets"
ON public.assets
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Users can insert their own assets
CREATE POLICY "Users can insert their own assets"
ON public.assets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Users can update their own assets
CREATE POLICY "Users can update their own assets"
ON public.assets
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Managers and admins can update all assets
CREATE POLICY "Managers and admins can update all assets"
ON public.assets
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Users can delete their own assets
CREATE POLICY "Users can delete their own assets"
ON public.assets
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Admins can delete any asset
CREATE POLICY "Admins can delete any asset"
ON public.assets
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Licenses RLS Policies
-- Users can view their own licenses
CREATE POLICY "Users can view their own licenses"
ON public.licenses
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

-- Managers and admins can view all licenses
CREATE POLICY "Managers and admins can view all licenses"
ON public.licenses
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Users can insert their own licenses
CREATE POLICY "Users can insert their own licenses"
ON public.licenses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Users can update their own licenses
CREATE POLICY "Users can update their own licenses"
ON public.licenses
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Managers and admins can update all licenses
CREATE POLICY "Managers and admins can update all licenses"
ON public.licenses
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Users can delete their own licenses
CREATE POLICY "Users can delete their own licenses"
ON public.licenses
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Admins can delete any license
CREATE POLICY "Admins can delete any license"
ON public.licenses
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at triggers
CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON public.assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at
BEFORE UPDATE ON public.licenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_assets_created_by ON public.assets(created_by);
CREATE INDEX idx_assets_status ON public.assets(status);
CREATE INDEX idx_assets_categoria ON public.assets(categoria);
CREATE INDEX idx_licenses_created_by ON public.licenses(created_by);
CREATE INDEX idx_licenses_status ON public.licenses(status);
CREATE INDEX idx_licenses_data_vencimento ON public.licenses(data_vencimento);