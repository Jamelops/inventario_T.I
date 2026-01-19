# ⚡ Referência Rápida: Executar SQL no Supabase

> **TL;DR (Muito Longo; Não Li)**

---

## 💫 5 Passos Rápidos

### 1️⃣ Abrir Supabase
```
https://supabase.com/dashboard
└─ Selecionar projeto "inventario_T.I"
└─ Clicar em "Database" (esquerda)
└─ Clicar em "SQL Editor"
```

### 2️⃣ Copiar SQL
```
1. Abrir: SECURITY_FIXES.md
2. Procurar por: "2️⃣ VALIDAÇÃO DE PROPRIEDADE"
3. Copiar cada bloco de SQL
```

### 3️⃣ Colar no Editor
```
1. Clicar na área branca do editor
2. Ctrl+V (colar)
3. Ver SQL aparecer
```

### 4️⃣ Executar
```
1. Clicar botão "Run" (verde)
   OU
2. Pressionar: Ctrl + Enter
```

### 5️⃣ Verificar Resultado
```
✅ "Executed successfully" = Funcionou!
❌ "ERROR" = Ver mensagem e troubleshoot
```

---

## 📑 Scripts Ordem de Execução

### Ordem correta:

```
1️⃣ Assets RLS
   └─ ALTER TABLE assets ENABLE ROW LEVEL SECURITY
   └─ 5 CREATE POLICY commands

2️⃣ Licenses RLS
   └─ ALTER TABLE licenses ENABLE ROW LEVEL SECURITY
   └─ 5 CREATE POLICY commands

3️⃣ Maintenance RLS
   └─ ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY
   └─ 5 CREATE POLICY commands

4️⃣ Audit Logs Table
   └─ CREATE TABLE audit_logs
   └─ CREATE INDEXES
   └─ CREATE POLICIES para audit_logs
```

---

## 🗄️ Minhas Tabelas

**Se tiver outras tabelas além de assets, licenses, maintenance:**

Aplicar o mesmo padrão para cada uma:

```sql
ALTER TABLE public.SEU_TABELA_AQUI ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own records"
ON public.SEU_TABELA_AQUI
FOR SELECT
USING (auth.uid() = user_id);

-- ... outras policies
```

---

## ✅ Teste Rápido

Depois de executar, rodar este SQL para verificar:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('assets', 'licenses', 'maintenance');
```

**Resultado esperado:**
```
tablename    | rowsecurity
─────────────┼────────────
assets       | t
licenses     | t
maintenance  | t
```

Se aparecer `f` em vez de `t`, significa RLS não foi ativado.

---

## ❌ Erros Comuns

| Erro | Solução |
|------|--------|
| `relation does not exist` | Tabela não existe - criar antes |
| `column does not exist` | Coluna `user_id` falta - adicionar |
| `policy already exists` | Delete policy antiga: `DROP POLICY "Nome" ON tabela;` |
| `permission denied` | Mudar role do usuário em Settings > Members |

---

## 🗣️ Detalhado

**Para guia COMPLETO:** → [SUPABASE_SQL_GUIDE.md](./SUPABASE_SQL_GUIDE.md)

---

## 🎉 Sucesso!

Quando VER **✅ Executed successfully** em TODOS os scripts:

```
✅ RLS ativado
✅ Policies criadas
✅ Auditoria funcionando
✅ Próximo: Integrar em componentes
```

---

**Criado por:** Arthur Lima Almeida Prado  
**Data:** 19 de janeiro de 2026
