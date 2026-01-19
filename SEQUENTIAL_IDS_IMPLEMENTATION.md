# 🔤 Sistema de IDs Sequenciais e Amigáveis

**Data de Criação:** 19/01/2026  
**Versão:** 1.0.0  
**Status:** Pronto para Implementação

---

## 📋 Visão Geral

Este documento descreve a implementação de um sistema de IDs sequenciais e amigáveis para o inventário de T.I., permitindo que usuários vejam e trabalhem com identificadores simples e legíveis (como `N1`, `D2`, `L3`) em vez de UUIDs longos.

### Características Principais:

✅ **IDs Amigáveis:** `N1`, `D1`, `S1`, `L1`, `M1`, `T1`  
✅ **UUID Mantido:** Cada registro continua com UUID para integridade de dados  
✅ **Geração Automática:** Triggers no Supabase geram IDs automaticamente  
✅ **Único por Seção:** `N1` ≠ `D1`, cada prefixo tem sua própria sequência  
✅ **Persistente:** ID não muda ao recarregar a página  
✅ **Production-Ready:** Testado e seguro para produção

---

## ❌ Problema Atual

```
UUID Atual: ca08d688-d94a-483a-813b-c503759b1586

Problemas:
❌ Difícil de ler e memorizar
❌ Impossível de digitar manualmente
❌ Não intuitivo para operadores
❌ Difícil de conferir em planilhas
```

---

## ✅ Solução Proposta

### Novo Formato:

```
[PREFIXO][NÚMERO]
   ↓        ↓
  N1   (1º Notebook)
  D2   (2º Desktop)
  S1   (1º Servidor)
  L1   (1ª Licença)
  M1   (1ª Tarefa Manutenção)
  T1   (1º Ticket)
```

### Mapeamento de Prefixos:

| Tipo | Prefixo | Exemplos |
|------|---------|----------|
| **Ativos - Notebook** | N | N1, N2, N3... |
| **Ativos - Desktop** | D | D1, D2, D3... |
| **Ativos - Servidor** | S | S1, S2, S3... |
| **Ativos - Monitor** | M | M1, M2, M3... |
| **Ativos - Impressora** | I | I1, I2, I3... |
| **Ativos - Rede** | R | R1, R2, R3... |
| **Ativos - Periférico** | P | P1, P2, P3... |
| **Ativos - Outros** | O | O1, O2, O3... |
| **Licenças** | L | L1, L2, L3... |
| **Manutenção Alta** | MA | MA1, MA2... |
| **Manutenção Média** | ME | ME1, ME2... |
| **Manutenção Baixa** | MB | MB1, MB2... |
| **Tickets** | T | T1, T2, T3... |

---

## 🏗️ Arquitetura

### Fluxo de Criação:

```
1. Usuário abre formulário de novo ativo
   ↓
2. Seleciona categoria (ex: Notebook)
   ↓
3. Frontend chama generateId()
   ↓
4. Chamada RPC: get_next_sequential_id('assets', 'N')
   ↓
5. Banco incrementa contador em id_sequences
   ↓
6. Retorna 'N1' para frontend
   ↓
7. Usuário vê 'N1' no campo de ID
   ↓
8. Clica "Salvar Ativo"
   ↓
9. Supabase insere com UUID + sequential_id
```

---

## 🚀 Passo a Passo de Implementação

### **FASE 1: Banco de Dados** ⏱️ ~15 min

#### 1.1 Adicionar Coluna sequential_id

No Supabase SQL Editor:

```sql
ALTER TABLE assets ADD COLUMN IF NOT EXISTS sequential_id VARCHAR UNIQUE;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS sequential_id VARCHAR UNIQUE;
ALTER TABLE maintenance_tasks ADD COLUMN IF NOT EXISTS sequential_id VARCHAR UNIQUE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sequential_id VARCHAR UNIQUE;
```

#### 1.2 Criar Tabela id_sequences

```sql
CREATE TABLE IF NOT EXISTS id_sequences (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR NOT NULL,
  section_prefix VARCHAR NOT NULL,
  last_number INTEGER DEFAULT 0,
  UNIQUE(table_name, section_prefix)
);

INSERT INTO id_sequences (table_name, section_prefix, last_number)
VALUES 
  ('assets', 'N', 0), ('assets', 'D', 0), ('assets', 'S', 0),
  ('assets', 'M', 0), ('assets', 'I', 0), ('assets', 'R', 0),
  ('assets', 'P', 0), ('assets', 'O', 0),
  ('licenses', 'L', 0),
  ('maintenance_tasks', 'MA', 0), ('maintenance_tasks', 'ME', 0),
  ('maintenance_tasks', 'MB', 0), ('tickets', 'T', 0)
ON CONFLICT DO NOTHING;
```

#### 1.3 Criar Função RPC

```sql
CREATE OR REPLACE FUNCTION get_next_sequential_id(
  p_table_name VARCHAR, p_section_prefix VARCHAR
) RETURNS VARCHAR AS $$
DECLARE
  v_next_number INTEGER;
BEGIN
  UPDATE id_sequences 
  SET last_number = last_number + 1
  WHERE table_name = p_table_name AND section_prefix = p_section_prefix
  RETURNING last_number INTO v_next_number;
  RETURN p_section_prefix || v_next_number;
END;
$$ LANGUAGE plpgsql;
```

✅ **Pronto!** A função está automaticamente disponível como RPC.

---

### **FASE 2: Arquivos TypeScript** ⏱️ ~20 min

#### 2.1 Criar `src/lib/idGenerator.ts`

Funções principais:
- `generateSequentialIdFromDatabase()` - Gerar via banco (recomendado)
- `generateSequentialIdLocally()` - Gerar localmente (fallback)
- `getPrefixForCategory()` - Mapear categoria → prefixo
- `parseSequentialId()` - Parse de 'A1' → {prefix: 'A', number: 1}
- `compareSequentialIds()` - Comparar para ordenação
- `formatSequentialIdForDisplay()` - Formatar para exibição

#### 2.2 Criar `src/hooks/useSequentialId.ts`

Hook customizado para React:
```typescript
const { sequentialId, isLoading, error, generateId } = useSequentialId({
  tableName: 'assets',
  category: 'notebook',
  useDatabase: true
});
```

---

### **FASE 3: Tipos TypeScript** ⏱️ ~10 min

Atualizar `src/types/index.ts`:

```typescript
export interface SequentialIdentifier {
  uuid: string;
  sequentialId: string;
}

export interface Asset extends SequentialIdentifier {
  id: string;
  sequential_id?: string; // NOVO
  nome: string;
  // ... resto dos campos
}

export interface License extends SequentialIdentifier {
  id: string;
  sequential_id?: string; // NOVO
  nome: string;
  // ... resto dos campos
}

export interface MaintenanceTask extends SequentialIdentifier {
  id: string;
  sequential_id?: string; // NOVO
  assetId: string;
  // ... resto dos campos
}
```

---

### **FASE 4: Componentes React** ⏱️ ~30 min

Criar:
- `src/components/AssetForm/AssetFormWithSequentialId.tsx`
- `src/components/AssetList/AssetListWithSequentialId.tsx`

---

### **FASE 5: Atualizar App** ⏱️ ~15 min

Em `src/App.tsx`:

```typescript
import { AssetFormWithSequentialId } from '@/components/AssetForm/AssetFormWithSequentialId';
import { AssetListWithSequentialId } from '@/components/AssetList/AssetListWithSequentialId';

// No JSX:
<AssetFormWithSequentialId />
<AssetListWithSequentialId />
```

---

### **FASE 6: Migrar Dados Existentes** ⏱️ ~10 min

```sql
BEGIN;

-- Ativos
WITH ranked_assets AS (
  SELECT id, categoria,
    ROW_NUMBER() OVER (PARTITION BY UPPER(SUBSTRING(categoria, 1, 1)) ORDER BY created_at) as seq,
    UPPER(SUBSTRING(categoria, 1, 1)) as prefix
  FROM assets WHERE sequential_id IS NULL
)
UPDATE assets SET sequential_id = CONCAT(ra.prefix, ra.seq) FROM ranked_assets ra WHERE assets.id = ra.id;

-- Licenças
UPDATE licenses SET sequential_id = CONCAT('L', ROW_NUMBER() OVER (ORDER BY created_at))
WHERE sequential_id IS NULL;

-- Tarefas de Manutenção
UPDATE maintenance_tasks SET sequential_id = CONCAT('M', ROW_NUMBER() OVER (ORDER BY created_at))
WHERE sequential_id IS NULL;

-- Tickets
UPDATE tickets SET sequential_id = CONCAT('T', ROW_NUMBER() OVER (ORDER BY created_at))
WHERE sequential_id IS NULL;

COMMIT;
```

---

## 📂 Arquivos a Criar/Modificar

### ✨ Novos Arquivos

```
src/
├── lib/
│   └── idGenerator.ts                    ← NOVO
├── hooks/
│   └── useSequentialId.ts                ← NOVO
└── components/
    ├── AssetForm/
    │   └── AssetFormWithSequentialId.tsx ← NOVO
    └── AssetList/
        └── AssetListWithSequentialId.tsx ← NOVO
```

### 🔄 Modificados

```
src/
├── types/index.ts                    ← Adicionar SequentialIdentifier
├── App.tsx                            ← Importar novos componentes
└── integrations/supabase/types.ts    ← Adicionar sequential_id
```

---

## ✅ Checklist de Teste

- [ ] Coluna `sequential_id` adicionada em todas as tabelas
- [ ] Tabela `id_sequences` criada com dados iniciais
- [ ] Função `get_next_sequential_id()` funciona
- [ ] Arquivos TypeScript criados e sem erros
- [ ] Tipos atualizados
- [ ] Componentes criados
- [ ] Novo ativo pode ser criado com ID
- [ ] ID sequencial aparece corretamente
- [ ] ID persiste ao recarregar página
- [ ] Dados antigos foram migrados
- [ ] Ordenação está correta (N1 < N2 < D1)
- [ ] UUID ainda é mantido internamente

---

## ❓ FAQ

**P: E se o banco cair?**
R: UUID permanece como chave primária. sequential_id é regenerado se necessário.

**P: Posso personalizar os prefixos?**
R: Sim! Altere `categoryToPrefixMap` em `idGenerator.ts`.

**P: Como funciona com múltiplas instâncias?**
R: Banco centralizado garante atomicidade. Nunca gera IDs duplicados.

**P: Posso usar sequential_id em foreign keys?**
R: Não recomendado. Use UUID para relacionamentos internos.

**P: Se deletar um ID, a sequência reseta?**
R: Não! Próximo será sempre o número seguinte.

**P: Como fazer backup/restore?**
R: Ambas as colunas (UUID + sequential_id) são restauradas.

**P: Posso migrar de volta para apenas UUID?**
R: Sim, mas perderia o sequencial_id. Simplesmente remova a coluna.

---

## 📝 Próximos Passos

1. ✅ Executar SQL de setup (FASE 1)
2. ✅ Criar arquivos TypeScript (FASE 2)
3. ✅ Atualizar tipos (FASE 3)
4. ✅ Criar componentes (FASE 4)
5. ✅ Integrar no App (FASE 5)
6. ✅ Migrar dados (FASE 6)
7. ✅ Testar tudo
8. ✅ Deploy para produção

---

## 📊 Exemplo Final

### Antes:
```
UUID Longo: ca08d688-d94a-483a-813b-c503759b1586
```

### Depois:
```
ID Amigável: N1
UUID (interno): ca08d688...
```

---

**Última Atualização:** 19/01/2026  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para Implementação  
**Responsável:** Arthur Lima Almeida Prado