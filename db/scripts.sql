-- ============================================
-- SISTEMA DE IDs HUMANIZADOS - SCRIPT COMPLETO
-- ============================================

-- PARTE 1: Criar Tabelas
CREATE TABLE IF NOT EXISTS ativos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_humanizado VARCHAR(20),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('notebook', 'desktop', 'servidor', 'outro')),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    localizacao VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    criado_em TIMESTAMP DEFAULT now(),
    atualizado_em TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sequencias_humanas (
    id SERIAL PRIMARY KEY,
    tipo_ativo VARCHAR(50) NOT NULL UNIQUE,
    proximo_numero INTEGER DEFAULT 1,
    prefixo VARCHAR(5) NOT NULL,
    descricao VARCHAR(255),
    atualizado_em TIMESTAMP DEFAULT now()
);

-- PARTE 2: Inserir Tipos Padrão
INSERT INTO sequencias_humanas (tipo_ativo, proximo_numero, prefixo, descricao)
VALUES 
    ('notebook', 1, 'N', 'Notebooks e Laptops'),
    ('desktop', 1, 'D', 'Computadores Desktop'),
    ('servidor', 1, 'S', 'Servidores'),
    ('outro', 1, 'O', 'Outros Ativos')
ON CONFLICT (tipo_ativo) DO NOTHING;

-- PARTE 3: Criar Índices
CREATE INDEX IF NOT EXISTS idx_ativos_codigo ON ativos(codigo_humanizado);
CREATE INDEX IF NOT EXISTS idx_ativos_tipo ON ativos(tipo);
CREATE INDEX IF NOT EXISTS idx_ativos_status ON ativos(status);

-- PARTE 4: Criar Função
CREATE OR REPLACE FUNCTION gerar_codigo_humanizado()
RETURNS VARCHAR AS $$
DECLARE
    v_tipo VARCHAR;
    v_proximo_numero INTEGER;
    v_prefixo VARCHAR;
    v_codigo VARCHAR;
BEGIN
    -- Obter tipo da tabela NEW (referência ao registro que está sendo inserido)
    v_tipo := NEW.tipo;
    
    -- Buscar sequência para este tipo
    SELECT proximo_numero, prefixo
    INTO v_proximo_numero, v_prefixo
    FROM sequencias_humanas
    WHERE tipo_ativo = v_tipo
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tipo de ativo % não configurado', v_tipo;
    END IF;
    
    -- Gerar código
    v_codigo := v_prefixo || v_proximo_numero;
    
    -- Incrementar contador
    UPDATE sequencias_humanas
    SET proximo_numero = proximo_numero + 1,
        atualizado_em = now()
    WHERE tipo_ativo = v_tipo;
    
    RETURN v_codigo;
END;
$$ LANGUAGE plpgsql;

-- PARTE 5: Criar Trigger
CREATE OR REPLACE FUNCTION trg_ativos_codigo_humanizado()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_humanizado IS NULL THEN
        NEW.codigo_humanizado := gerar_codigo_humanizado();
    END IF;
    NEW.atualizado_em := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ativos_codigo_humanizado ON ativos;
CREATE TRIGGER trg_ativos_codigo_humanizado
BEFORE INSERT ON ativos
FOR EACH ROW
EXECUTE FUNCTION trg_ativos_codigo_humanizado();

-- PARTE 6: Migração de Dados Existentes (se houver)
-- Descomente se você tem dados antigos
/*
UPDATE ativos
SET codigo_humanizado = NULL
WHERE codigo_humanizado IS NULL;
*/

-- PARTE 7: Adicionar Constraint NOT NULL (após migração)
-- ALTER TABLE ativos ALTER COLUMN codigo_humanizado SET NOT NULL;

-- FIM DO SCRIPT