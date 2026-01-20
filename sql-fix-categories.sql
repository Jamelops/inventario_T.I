-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL UNIQUE,
  descricao TEXT,
  cor VARCHAR(7) DEFAULT '#6B7280',
  criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create asset_categories junction table
CREATE TABLE IF NOT EXISTS asset_categories (
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (asset_id, category_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_nome ON categories(nome);
CREATE INDEX IF NOT EXISTS idx_asset_categories_asset ON asset_categories(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_categories_category ON asset_categories(category_id);

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can manage categories" ON categories;
CREATE POLICY "Only admins can manage categories" ON categories
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can update categories" ON categories
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can delete categories" ON categories
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Policies for asset_categories
DROP POLICY IF EXISTS "Anyone can view asset categories" ON asset_categories;
CREATE POLICY "Anyone can view asset categories" ON asset_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their asset categories" ON asset_categories;
CREATE POLICY "Users can manage their asset categories" ON asset_categories
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM assets WHERE id = asset_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their asset categories" ON asset_categories
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM assets WHERE id = asset_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their asset categories" ON asset_categories
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM assets WHERE id = asset_id AND user_id = auth.uid()
  ));

-- Insert some default categories
INSERT INTO categories (nome, descricao, cor) VALUES
  ('Computador', 'Computadores pessoais e desktops', '#3B82F6'),
  ('Notebook', 'Laptops e notebooks', '#8B5CF6'),
  ('Impressora', 'Impressoras e copiadoras', '#F59E0B'),
  ('Monitor', 'Monitores e telas', '#10B981'),
  ('Teclado', 'Teclados e periféricos de entrada', '#EC4899'),
  ('Mouse', 'Mouses e trackpads', '#14B8A6'),
  ('Rede', 'Equipamentos de rede', '#6366F1'),
  ('Servidor', 'Servidores e infraestrutura', '#DC2626'),
  ('Outros', 'Outros equipamentos', '#6B7280')
ON CONFLICT (nome) DO NOTHING;
