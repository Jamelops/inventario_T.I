# 🗄️ Guia Completo: Executar SQL Scripts no Supabase

**Data:** 19 de janeiro de 2026  
**Status:** Passo-a-passo com screenshots  
**Versão:** 1.0.0

---

## 📍 Passo 1: Acessar o Supabase Dashboard

### 1.1 Abrir Supabase

```
1. Ir para: https://supabase.com/dashboard
2. Fazer login com sua conta
3. Selecionar seu projeto "inventario_T.I"
```

### 1.2 Você deve ver esta tela:

```
┌─────────────────────────────────────────────────────┐
│ Supabase Dashboard                                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Seu Projeto > inventario_T.I                      │
│  ├─ Authentication                                 │
│  ├─ Database                                       │
│  │  ├─ Tables                                      │
│  │  ├─ Backups                                     │
│  │  └─ SQL Editor  ← CLIQUE AQUI                   │
│  ├─ Storage                                        │
│  └─ Vector                                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🖱️ Passo 2: Acessar SQL Editor

### 2.1 No menu esquerdo:

```
1. Clicar em "Database" (menu esquerdo)
2. Clicar em "SQL Editor"
```

### 2.2 Você verá:

```
┌─────────────────────────────────────────────────────┐
│ SQL Editor                                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Abas:                                              │
│  ├─ New Query  [+]                                 │
│  ├─ My Queries                                     │
│  └─ Quick Starters                                 │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Editor SQL aqui                             │   │
│  │                                             │   │
│  │                                             │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [Executar] ou (Ctrl + Enter)                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Passo 3: Copiar SQL Scripts

Abra o arquivo **[SECURITY_FIXES.md](./SECURITY_FIXES.md)** e procure pela seção:

### Seção 2️⃣: VALIDAÇÃO DE PROPRIEDADE (RLS)

```
Vá para SECURITY_FIXES.md
└─ Procure por "2️⃣ VALIDAÇÃO DE PROPRIEDADE"
└─ Copie cada bloco de SQL
```

---

## ✂️ Passo 4: Executar Scripts (Detalhado)

### Script 1: Enable RLS na tabela `assets`

**Copiar este SQL:**

```sql
-- Enable Row Level Security
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for assets
CREATE POLICY "Users can view own assets"
ON public.assets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all assets"
ON public.assets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can create own assets"
ON public.assets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets"
ON public.assets
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
ON public.assets
FOR DELETE
USING (auth.uid() = user_id);
```

**Passo-a-passo para executar:**

```
1. Colar o SQL no editor
2. Clicar em "Run" (botão verde no canto inferior)
   Ou pressionar: Ctrl + Enter
3. Esperar até ver: "✅ Success"
4. Se vir ❌ Erro:
   └─ Ver mensagem de erro
   └─ Verificar se a tabela "assets" existe
   └─ Verificar se a coluna "user_id" existe
```

### Script 2: Enable RLS na tabela `licenses`

**Copiar SQL similar para licenses:**

```sql
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own licenses"
ON public.licenses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all licenses"
ON public.licenses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can create own licenses"
ON public.licenses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own licenses"
ON public.licenses
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own licenses"
ON public.licenses
FOR DELETE
USING (auth.uid() = user_id);
```

### Script 3: Enable RLS na tabela `maintenance`

**Copiar SQL similar para maintenance:**

```sql
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own maintenance"
ON public.maintenance
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all maintenance"
ON public.maintenance
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can create own maintenance"
ON public.maintenance
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own maintenance"
ON public.maintenance
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own maintenance"
ON public.maintenance
FOR DELETE
USING (auth.uid() = user_id);
```

### Script 4: Criar Tabela de Auditoria

**Copiar SQL de SECURITY_FIXES.md (seção "6️⃣ AUDIT LOGGING"):**

```sql
-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  user_id UUID REFERENCES auth.users(id),
  changes JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for audit_logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can view own audit logs"
ON public.audit_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Insert-only for app logging
CREATE POLICY "App can log actions"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
```

---

## ✅ Como Saber se Funcionou

### Verde = Sucesso ✅

```
Você verá na tela:

✅ Executed successfully
Queries executed in 123ms
0 rows modified
```

### Vermelho = Erro ❌

```
Você verá:

❌ PostgreSQL error
relation "public.assets" does not exist
```

**Se der erro:**

1. **Tabela não existe:**
   - Ir para "Database" > "Tables"
   - Verificar se "assets" existe
   - Se não existir, criar antes

2. **Coluna não existe:**
   - Clicar na tabela em "Tables"
   - Verificar se coluna "user_id" existe
   - Se não existir, adicionar coluna primeiro

3. **Policy já existe:**
   - Apagar a policy antiga
   - Executar novamente

---

## 🧪 Passo 5: Testar RLS

### Verificar se RLS está ativada:

```sql
-- Executar este SQL para verificar
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('assets', 'licenses', 'maintenance');
```

**Resultado esperado:**

```
tablename    | rowsecurity
─────────────┼─────────────
assets       | t           (true = ativado)
licenses     | t           (true = ativado)
maintenance  | t           (true = ativado)
```

### Verificar policies criadas:

```sql
-- Ver todas as policies
SELECT policyname, tablename, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

**Resultado esperado:**

```
policyname                      | tablename    | qual
────────────────────────────────┼──────────────┼────
Users can view own assets       | assets       | SELECT
Admins can view all assets      | assets       | SELECT
Users can create own assets     | assets       | INSERT
Users can update own assets     | assets       | UPDATE
Users can delete own assets     | assets       | DELETE
... (mais policies para licenses e maintenance)
```

---

## 🔍 Passo 6: Verificar Auditoria

### Verificar se tabela foi criada:

```sql
SELECT * FROM public.audit_logs LIMIT 1;
```

**Resultado:**

```
id | action | resource_type | resource_id | user_id | ...
───┼────────┼───────────────┼─────────────┼─────────┼───
   |        |               |             |         | (vazio = criado com sucesso)
```

### Verificar indexes:

```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'audit_logs';
```

**Resultado esperado:**

```
indexname
──────────────────────────────────
idx_audit_logs_user_id
idx_audit_logs_action
idx_audit_logs_created_at
idx_audit_logs_resource
```

---

## 📊 Checklist de Execução

```
[ ] Acessar Supabase Dashboard
[ ] Ir para SQL Editor
[ ] Executar script RLS para assets
[ ] Executar script RLS para licenses
[ ] Executar script RLS para maintenance
[ ] Executar script de criação de audit_logs
[ ] Verificar com SELECT (ver RLS ativado)
[ ] Verificar policies criadas
[ ] Testar auditoria (INSERT teste)
[ ] Pronto para produção ✅
```

---

## 🆘 Troubleshooting

### Problema 1: "relation does not exist"

```
Erro: ERROR: relation "public.assets" does not exist

Solução:
1. Ir para Database > Tables
2. Verificar se tabela existe
3. Se não, criar com:

CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Problema 2: "column does not exist"

```
Erro: ERROR: column "user_id" does not exist

Solução:
1. Ir para Database > Tables > assets
2. Clicar em "New column"
3. Nome: user_id
4. Tipo: UUID
5. Referência: auth.users > id
6. Criar
7. Executar script RLS novamente
```

### Problema 3: "policy already exists"

```
Erro: ERROR: policy "Users can view own assets" for table "assets" already exists

Solução:
1. Executar para deletar:

DROP POLICY "Users can view own assets" ON public.assets;
DROP POLICY "Admins can view all assets" ON public.assets;
... (deletar todas as policies)

2. Executar o script completo novamente
```

### Problema 4: Sem acesso ao SQL Editor

```
Especialmente se você é apenas membro do projeto

Solução:
1. Pedir ao owner para dar acesso
2. Owner vai em Settings > Members
3. Mudar seu role para "Developer" ou "Admin"
4. Tentar novamente
```

---

## 🎯 Próximos Passos

Depois que todos os scripts forem executados com sucesso:

```
✅ RLS ativado em assets
✅ RLS ativado em licenses
✅ RLS ativado em maintenance
✅ Tabela audit_logs criada
✅ Policies criadas
✅ Índices criados

Próximo:
└─ Integrar validação Zod em componentes
└─ Integrar error handler
└─ Integrar audit logging em CRUD
└─ Testar com 2 usuários
```

---

## 📞 Dúvidas?

**Se algo não funcionar:**

1. Ver error message completo
2. Copiar error para Google
3. Revisar SECURITY_FIXES.md
4. Abrir issue no GitHub

---

**Criado por:** Arthur Lima Almeida Prado  
**Data:** 19 de janeiro de 2026  
**Versão:** 1.0.0  
**Status:** ✅ PRONTO PARA USAR
