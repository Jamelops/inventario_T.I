# 🔐 Guia de Implementação de Segurança

**Data:** 19 de janeiro de 2026  
**Status:** Implementação em andamento  
**Versão:** 1.0.0

---

## ✅ O Que Foi Implementado

### 🚀 Commits de Segurança Realizados:

```
78603ad - docs: add comprehensive security fixes and hardening guide
3847989 - security: use sessionStorage instead of localStorage for JWT tokens
c3ee17b - feat: add comprehensive input validation schemas with Zod
a36cecf - feat: add secure error handling utility with message sanitization
82eb12f - feat: add comprehensive audit logging and security event tracking
```

### Arquivos Criados:

1. **📄 SECURITY_FIXES.md** - Documentação completa das vulnerabilidades e correções
2. **src/schemas/asset.schema.ts** - Validação de inputs com Zod
3. **src/lib/error-handler.ts** - Tratamento seguro de erros
4. **src/lib/audit.ts** - Auditoria e logging de ações
5. **src/integrations/supabase/client.ts** - Config segura de auth (sessionStorage)

---

## 🔉 Como Usar as Novas Utilidades

### 1️⃣ Validação de Inputs

```typescript
// Em qualquer componente de forma
import { AssetCreateSchema, validateInput } from '@/schemas/asset.schema';
import { useToast } from '@/hooks/useToast';

const MyAssetForm = () => {
  const { toast } = useToast();

  const handleSubmit = async (formData) => {
    // Validar antes de enviar
    const result = validateInput(AssetCreateSchema, formData);
    
    if (!result.success) {
      // Mostrar erros de validação
      result.errors?.errors.forEach(error => {
        const path = error.path.join('.');
        toast.error(`${path}: ${error.message}`);
      });
      return;
    }

    // Dados validados, enviar para Supabase
    const { data, error } = await supabase
      .from('assets')
      .insert([result.data]);

    if (error) {
      handleApiError(error);
    } else {
      await logSuccess('CREATE_ASSET', 'assets', data[0].id);
      toast.success('Ativo criado com sucesso!');
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(new FormData(e.currentTarget));
    }}>
      {/* Form fields */}
    </form>
  );
};
```

### 2️⃣ Tratamento de Erros

```typescript
// Em qualquer lugar que faz requisições
import { handleApiError } from '@/lib/error-handler';
import { logFailure } from '@/lib/audit';

const fetchAssets = async () => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*');

    if (error) throw error;
    
    return data;
  } catch (error) {
    // Trata o erro e mostra mensagem amigável
    handleApiError(error, { showToast: true });
    
    // Log de auditoria
    await logFailure('VIEW_ASSET', 'assets', error as Error);
  }
};
```

### 3️⃣ Auditoria de Ações

```typescript
// Em operações CRUD
import { logSuccess, logFailure, createChangeAuditTrail } from '@/lib/audit';

const updateAsset = async (assetId: string, newData: any) => {
  try {
    const oldData = await fetchCurrentAsset(assetId);
    const changes = createChangeAuditTrail(oldData, newData);

    const { data, error } = await supabase
      .from('assets')
      .update(newData)
      .eq('id', assetId);

    if (error) throw error;

    // Log sucesso com histórico de mudanças
    await logSuccess('UPDATE_ASSET', 'assets', assetId, changes);
    
    return data;
  } catch (error) {
    await logFailure('UPDATE_ASSET', 'assets', error as Error, assetId);
    throw error;
  }
};
```

---

## 📊 Próximos Passos de Implementação

### 🔴 Crítico (Esta semana):

#### 1. Ativar Row Level Security (RLS) no Supabase

```
Ya feito no SECURITY_FIXES.md
Você precisa executar os SQL scripts no Supabase
```

**Como fazer:**
- Ir para: Supabase Dashboard → SQL Editor
- Copiar SQL do SECURITY_FIXES.md (seção "2️⃣ VALIDAÇÃO DE PROPRIEDADE")
- Executar cada script

#### 2. Integrar validação em TODOS os forms

```typescript
// Exemplo para Assets (adapte para outros formulários)
// src/pages/AssetForm.tsx

import { AssetCreateSchema } from '@/schemas/asset.schema';
import { validateInput } from '@/schemas/asset.schema';
import { handleApiError } from '@/lib/error-handler';
import { logSuccess } from '@/lib/audit';

const handleSaveAsset = async (formData: unknown) => {
  // 1. Validar
  const validation = validateInput(AssetCreateSchema, formData);
  if (!validation.success) {
    // Mostrar erros
    return;
  }

  // 2. Enviar
  try {
    const { data, error } = await supabase
      .from('assets')
      .insert([validation.data]);
    
    if (error) throw error;
    
    // 3. Auditar
    await logSuccess('CREATE_ASSET', 'assets', data[0].id);
    
    return data;
  } catch (error) {
    handleApiError(error);
  }
};
```

#### 3. Criar tabela de auditoria no Supabase

```
Execute os SQL scripts do SECURITY_FIXES.md (seção "6️⃣ AUDIT LOGGING")
```

### 🜟 Alto (Próximas 2 semanas):

#### 1. Instalar Zod (se ainda não tem)

```bash
npm install zod
```

#### 2. Criar schemas para TODAS as tabelas

```typescript
// Adicionar em src/schemas/
// - license.schema.ts
// - maintenance.schema.ts
// - ticket.schema.ts
// etc
```

#### 3. Implementar RLS em TODOS os endpoints

```sql
-- Para cada tabela, criar:
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own records" ON <table>
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all" ON <table>
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
```

---

## 🗣️ Exemplo Completo: CRUD Seguro

```typescript
// src/hooks/useSecureAsset.ts

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AssetCreateSchema, AssetUpdateSchema, validateInput } from '@/schemas/asset.schema';
import { handleApiError } from '@/lib/error-handler';
import { logSuccess, logFailure } from '@/lib/audit';
import { useToast } from '@/hooks/useToast';

export const useSecureAsset = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // CREATE
  const createAsset = async (data: unknown) => {
    // Validar
    const result = validateInput(AssetCreateSchema, data);
    if (!result.success) {
      result.errors?.errors.forEach(e => {
        toast.error(`${e.path.join('.')}: ${e.message}`);
      });
      return null;
    }

    try {
      // Adicionar user_id automaticamente
      const payload = {
        ...result.data,
        user_id: user?.id,
      };

      const { data: newAsset, error } = await supabase
        .from('assets')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      await logSuccess('CREATE_ASSET', 'assets', newAsset.id);
      toast.success('Ativo criado com sucesso!');

      return newAsset;
    } catch (error) {
      handleApiError(error);
      await logFailure('CREATE_ASSET', 'assets', error as Error);
      return null;
    }
  };

  // READ
  const getAsset = async (assetId: string) => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', assetId)
        .single();

      if (error) throw error;
      // RLS garante que só dados do usuário são retornados
      return data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  };

  // UPDATE
  const updateAsset = async (assetId: string, data: unknown) => {
    const result = validateInput(AssetUpdateSchema, data);
    if (!result.success) {
      result.errors?.errors.forEach(e => {
        toast.error(`${e.path.join('.')}: ${e.message}`);
      });
      return null;
    }

    try {
      const { data: updated, error } = await supabase
        .from('assets')
        .update(result.data)
        .eq('id', assetId)
        .select()
        .single();

      if (error) throw error;

      await logSuccess('UPDATE_ASSET', 'assets', assetId, result.data);
      toast.success('Ativo atualizado!');

      return updated;
    } catch (error) {
      handleApiError(error);
      await logFailure('UPDATE_ASSET', 'assets', error as Error, assetId);
      return null;
    }
  };

  // DELETE
  const deleteAsset = async (assetId: string) => {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      await logSuccess('DELETE_ASSET', 'assets', assetId);
      toast.success('Ativo deletado!');

      return true;
    } catch (error) {
      handleApiError(error);
      await logFailure('DELETE_ASSET', 'assets', error as Error, assetId);
      return false;
    }
  };

  return {
    createAsset,
    getAsset,
    updateAsset,
    deleteAsset,
  };
};
```

### Usar no componente:

```typescript
// src/pages/AssetForm.tsx

const AssetForm = () => {
  const { createAsset, updateAsset } = useSecureAsset();

  const handleSubmit = async (formData: any) => {
    const asset = await createAsset(formData);
    if (asset) {
      navigate(`/assets/${asset.id}`);
    }
  };

  return (
    <form onSubmit={e => {
      e.preventDefault();
      handleSubmit(new FormData(e.currentTarget));
    }}>
      {/* Form fields */}
    </form>
  );
};
```

---

## ✅ Checklist de Execução

### Semana 1:
- [ ] Instalar `npm install zod`
- [ ] Executar SQL do RLS no Supabase (SECURITY_FIXES.md)
- [ ] Executar SQL de auditoria no Supabase
- [ ] Testar sessionStorage (abrir DevTools, verificar localStorage vazio)

### Semana 2:
- [ ] Integrar validação em AssetForm
- [ ] Integrar validação em LicenseForm
- [ ] Criar outros schemas (maintenance, ticket)
- [ ] Testar com dados inválidos

### Semana 3:
- [ ] Integrar erro handler em todos os componentes
- [ ] Testar mensagens de erro genéricas
- [ ] Verificar logs de auditoria no Supabase
- [ ] Fazer teste de segurança básico

### Antes de Produção:
- [ ] Pentesting básico
- [ ] Revisão de código de segurança
- [ ] Teste de IDOR (tentar acessar dados de outro usuário)
- [ ] Teste de injection (tentar SQL injection, XSS)

---

## 📋 Referências

- [SECURITY_FIXES.md](./SECURITY_FIXES.md) - Documentação completa de vuln
- [Zod Documentation](https://zod.dev/)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 🚀 Status Final

- ✅ Documentação de vulnerabilidades: **PRONTO**
- ✅ Utilidades de segurança: **PRONTO**
- 🔘 Implementação em componentes: **EM ANDAMENTO**
- 🔘 RLS no Supabase: **AGUARDANDO** (execute SQL)
- 🔘 Testes de segurança: **PLANEJADO**

---

**Criado por:** Arthur Lima Almeida Prado  
**Data:** 19 de janeiro de 2026  
**Versão:** 1.0.0  
**Status:** 🚀 PRONTO PARA IMPLEMENTAÇÃO