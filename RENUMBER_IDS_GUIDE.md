# 🔢 Guia: Renumerar IDs de Seções

**Data:** 19 de janeiro de 2026  
**Objetivo:** Mudar IDs de UUIDs (e7e7a322...) para números sequenciais (1, 2, 3...)  
**Versão:** 1.0.0

---

## 🎯 O Que Faz Este Script

```
ANTES:
ID: e7e7a322-469f-4600-9701-da3f069737dc
ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
ID: xyz9876-5432-1098-dcba-fedcba987654

DEPOIS:
ID: 1
ID: 2
ID: 3
```

---

## ✅ Pré-requisitos

```bash
✅ Node.js instalado
✅ npm instalado
✅ Variáveis de ambiente configuradas
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
✅ Pasta scripts/ criada
```

---

## 🚀 Como Usar (3 Passos)

### Passo 1: Instalar Dependência

```bash
# Se ainda não tem @supabase/supabase-js instalado
npm install @supabase/supabase-js
```

### Passo 2: Preparar Script

```bash
# O script já está em:
# scripts/renumber-section-ids.js

# Adicionar ao package.json (scripts):
{
  "scripts": {
    "renumber-ids": "node scripts/renumber-section-ids.js"
  }
}
```

### Passo 3: Executar

```bash
# Opção 1: Com npm
npm run renumber-ids

# Opção 2: Direto com node
node scripts/renumber-section-ids.js
```

---

## 📊 O Que Acontece

### Execução Normal

```
$ npm run renumber-ids

🔄 Iniciando renumeração de IDs de seções...
📋 Encontradas 5 seções
📝 Mapa de renumeração:
  e7e7a322-469f-4600-9701-da3f069737dc → 1
  a1b2c3d4-e5f6-7890-abcd-ef1234567890 → 2
  xyz9876-5432-1098-dcba-fedcba987654 → 3
  ... (mais seções)

🔄 Atualizando seções...
✅ Seção 1 → ID 1
✅ Seção 2 → ID 2
✅ Seção 3 → ID 3

🔄 Atualizando referências em outras tabelas...
✅ Atualizado content 1
✅ Atualizado content 2

✅ Renumeração concluída!
```

### Se Houver Erro

```
❌ Variáveis de ambiente não encontradas!
Defina: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
```

**Solução:**
```bash
# Verificar .env.local
cat .env.local

# Deve ter:
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

---

## 🔄 O Script Faz Isso

### 1️⃣ Conecta ao Supabase

```typescript
const supabase = createClient(supabaseUrl, supabaseKey);
```

### 2️⃣ Busca Todas as Seções

```sql
SELECT * FROM sections
ORDER BY created_at ASC
```

### 3️⃣ Cria Mapa de IDs

```
e7e7a322-469f-4600-9701-da3f069737dc → 1
a1b2c3d4-e5f6-7890-abcd-ef1234567890 → 2
xyz9876-5432-1098-dcba-fedcba987654 → 3
```

### 4️⃣ Atualiza as Seções

```sql
UPDATE sections 
SET id = 1, display_id = 1 
WHERE id = 'e7e7a322-469f-4600-9701-da3f069737dc'
```

### 5️⃣ Atualiza Referências

```sql
-- Se houver conteúdo linkado à seção
UPDATE content
SET section_id = 1
WHERE section_id = 'e7e7a322-469f-4600-9701-da3f069737dc'
```

---

## ⚠️ Avisos Importantes

### ❗ Fazer Backup Antes

```bash
# No Supabase Dashboard:
# 1. Ir em: Database > Backups
# 2. Criar backup manual
# 3. Esperar completar
# 4. Depois executar script
```

### ❗ Não Executar em Produção Sem Teste

```
1. Testar localmente primeiro
2. Testar em ambiente de staging
3. Depois em produção
```

### ❗ Desabilitar RLS Temporariamente (Opcional)

```sql
-- Se tiver RLS, pode precisar desabilitar:
ALTER TABLE sections DISABLE ROW LEVEL SECURITY;

-- Executar script

-- Depois habilitar novamente:
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
```

---

## ✅ Verificar Se Funcionou

### No Supabase Dashboard

```
1. Ir em: Database > Tables > sections
2. Clicar em: sections
3. Ver coluna "id"
4. Deve mostrar: 1, 2, 3, 4, 5, ...
```

### Com SQL Query

```sql
SELECT id, name FROM sections
ORDER BY id ASC;
```

**Resultado esperado:**
```
id | name
---+----------
1  | Home
2  | About
3  | Products
4  | Contact
```

---

## 🐛 Troubleshooting

### Problema: "relation sections does not exist"

```
Erro:
  "ERROR: relation \"public.sections\" does not exist"

Solução:
  - Tabela "sections" não existe
  - Criar tabela primeiro:

CREATE TABLE public.sections (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  display_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Problema: "Permission denied"

```
Erro:
  "Permission denied"

Solução:
  - Usuário não tem permissão
  - Usar role de admin:
    - Ir a Settings > Database > Roles
    - Usar chave de admin (server-only)
  - Ou desabilitar RLS temporariamente
```

### Problema: "Nenhuma seção encontrada"

```
Erro:
  "ℹ️  Nenhuma seção encontrada"

Solução:
  - Tabela vazia
  - Verificar:
    - SELECT COUNT(*) FROM sections;
  - Adicionar dados de teste:

INSERT INTO sections (name) VALUES
('Seção 1'),
('Seção 2'),
('Seção 3');
```

---

## 📝 Script Customizado

### Se Precisa Renumerar de Forma Diferente

**Começar em 100:**

```javascript
// Linha no script:
idMap[section.id] = index + 100; // Começa em 100
```

**Renumerar Seções Específicas:**

```javascript
// Adicionar filtro:
const { data: sections, error: fetchError } = await supabase
  .from('sections')
  .select('*')
  .eq('type', 'main') // Só seções do tipo 'main'
  .order('created_at', { ascending: true });
```

**Manter IDs Antigos Também:**

```javascript
// Em vez de UPDATE, criar coluna nova:
.update({ new_id: newId })
// Depois migrar se necessário
```

---

## 🔄 Reverter Mudanças (Se Necessário)

### Usar Backup

```
1. Supabase Dashboard
2. Database > Backups
3. Clicar no backup anterior
4. Restore
```

### Script de Reverter (Manual)

```sql
-- Tabela de IDs antigos necessária
-- Se tiver backup de mapeamento:
UPDATE sections
SET id = old_id
FROM sections_id_mapping
WHERE sections.new_id = sections_id_mapping.new_id;
```

---

## 📊 Exemplo Completo

### Antes

```
Supabase Database:
sections table:

id                                    | name      | created_at
--------------------------------------+-----------+------------
e7e7a322-469f-4600-9701-da3f069737dc | Home      | 2024-01-15
a1b2c3d4-e5f6-7890-abcd-ef1234567890 | About     | 2024-01-16
xyz9876-5432-1098-dcba-fedcba987654  | Products  | 2024-01-17
```

### Executar Script

```bash
npm run renumber-ids
```

### Depois

```
Supabase Database:
sections table:

id | name      | created_at      | display_id
---+-----------+-----------------+----------
1  | Home      | 2024-01-15      | 1
2  | About     | 2024-01-16      | 2
3  | Products  | 2024-01-17      | 3
```

---

## ✅ Checklist Final

```
[ ] Fazer backup no Supabase
[ ] Verificar variáveis de ambiente
[ ] Instalar @supabase/supabase-js
[ ] Adicionar npm script
[ ] Executar: npm run renumber-ids
[ ] Verificar resultados no Supabase
[ ] Testar aplicação
[ ] Confirmar IDs funcionando
```

---

**Criado por:** Arthur Lima Almeida Prado  
**Data:** 19 de janeiro de 2026  
**Versão:** 1.0.0  
**Status:** ✅ PRONTO PARA USO
