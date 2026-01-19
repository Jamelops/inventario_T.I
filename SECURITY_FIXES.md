# 🔐 Plano de Segurança - Inventário MTU

**Data:** 19 de janeiro de 2026  
**Status:** Em Implementação  
**Versão:** 1.0.0  

---

## 📊 Resumo Executivo

Este documento contém todas as vulnerabilidades identificadas e suas correções para produção.

**Stack:** React + Supabase (auth + DB)  
**Prioridade:** Crítica

---

## ✅ VULNERABILIDADES CRÍTICAS

### 1️⃣ LOCALSTORAGE SEGURO (CRÍTICO → CORRIGINDO)

**Arquivo:** `src/integrations/supabase/client.ts`  
**Problema:** Token JWT armazenado em localStorage (vulnerável a XSS)

#### ❌ Status Atual:
```typescript
auth: {
  storage: localStorage,  // ❌ VULNERÁVEL
  persistSession: true,
  autoRefreshToken: true,
}
```

#### ✅ Solução - Usar SessionStorage + HttpOnly:

O Supabase com `persistSession: false` usa memory storage (melhor). Para produção, implementar:

```typescript
// src/integrations/supabase/client.ts
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: sessionStorage,  // ✅ Apenas durante sessão
    persistSession: false,    // ✅ Não persistir entre abas
    autoRefreshToken: true,
  }
});
```

**Por quê?**
- `sessionStorage`: Limitado à aba/janela atual
- `persistSession: false`: Força re-login ao fechar navegador
- Supabase envia token em cookies HttpOnly automaticamente

---

### 2️⃣ VALIDAÇÃO DE PROPRIEDADE (IDOR) - CRÍTICO

**Problema:** Qualquer usuário pode acessar dados de outro se adivinhar ID

#### ❌ Exemplo Vulnerável:
```typescript
// Seu código provavelmente faz assim:
const fetchAsset = async (assetId: string) => {
  const { data } = await supabase
    .from('assets')
    .select('*')
    .eq('id', assetId);
  // ❌ Sem validar se o ativo pertence ao usuário!
};
```

#### ✅ Solução - RLS (Row Level Security):

**Supabase Database → SQL Editor → Execute:**

```sql
-- 1. Habilithar RLS em todas as tabelas
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- 2. Política: Usuário vê apenas seus próprios ativos
CREATE POLICY "Users can view own assets" ON assets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets" ON assets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets" ON assets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets" ON assets
  FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Admins veem tudo
CREATE POLICY "Admins can view all assets" ON assets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete any asset" ON assets
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
```

#### Implementar no Frontend também (UX):

```typescript
// src/hooks/useAsset.ts (novo arquivo)
import { useAuth } from '@/contexts/AuthContext';

export const useAsset = () => {
  const { user, isAdmin } = useAuth();

  const fetchAsset = async (assetId: string) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single();

    // Backend (RLS) já bloqueia se não é dono
    // Frontend valida também para UX
    if (data && data.user_id !== user?.id && !isAdmin()) {
      throw new Error('Access denied');
    }

    return { data, error };
  };

  return { fetchAsset };
};
```

---

### 3️⃣ VALIDAÇÃO DE INPUT - CRÍTICO

**Problema:** Não há validação de tipos/formatos antes de enviar

#### ✅ Solução - Zod Schema:

```bash
npm install zod
```

```typescript
// src/schemas/asset.schema.ts (novo arquivo)
import { z } from 'zod';

export const AssetCreateSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Máximo 255 caracteres'),
  
  serialNumber: z.string()
    .min(1, 'Número de série é obrigatório')
    .regex(/^[A-Z0-9\-]+$/, 'Formato inválido'),
  
  price: z.number()
    .positive('Preço deve ser maior que 0')
    .max(999999999, 'Preço muito alto'),
  
  category: z.enum(['computador', 'impressora', 'mobile', 'outro']),
  
  status: z.enum(['ativo', 'inativo', 'descartado']).optional(),
  
  location: z.string().max(255).optional().nullable(),
});

export type AssetCreate = z.infer<typeof AssetCreateSchema>;
```

```typescript
// src/pages/AssetForm.tsx (usar validação)
import { AssetCreateSchema } from '@/schemas/asset.schema';

const handleSubmit = async (formData: unknown) => {
  // Validar antes de enviar
  const validated = AssetCreateSchema.safeParse(formData);
  
  if (!validated.success) {
    // Mostrar erros de validação
    validated.error.errors.forEach(err => {
      toast.error(`${err.path.join('.')}: ${err.message}`);
    });
    return;
  }

  // Enviar dados validados
  const { error } = await supabase
    .from('assets')
    .insert([validated.data]);

  if (error) {
    toast.error('Erro ao criar ativo');
  } else {
    toast.success('Ativo criado com sucesso');
  }
};
```

---

### 4️⃣ RATE LIMITING - ALTO

**Problema:** Sem proteção contra brute force ou abuso

#### ✅ Solução - Supabase Edge Functions (Backend):

**Criar em Supabase → Edge Functions → create:**

```typescript
// supabase/functions/rate-limiter/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const RATE_LIMITS = {
  login: { attempts: 5, window: 15 * 60 * 1000 }, // 5 em 15min
  api: { requests: 100, window: 60 * 1000 }, // 100 em 1min
};

serve(async (req) => {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const action = req.headers.get("x-action") || "api";
  const limit = RATE_LIMITS[action as keyof typeof RATE_LIMITS] || RATE_LIMITS.api;

  // Verificar rate limit
  const { data: attempts } = await supabase
    .from("rate_limit_attempts")
    .select("count")
    .eq("ip", ip)
    .eq("action", action)
    .gte("created_at", new Date(Date.now() - limit.window).toISOString())
    .maybeSingle();

  const count = (attempts?.count || 0) + 1;

  if (count > limit.attempts) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Try again later." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // Registrar tentativa
  await supabase.from("rate_limit_attempts").insert([
    { ip, action, count }
  ]);

  return new Response(JSON.stringify({ allowed: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
```

#### Frontend - Implementar delay:

```typescript
// src/lib/api-client.ts (novo arquivo)
import { toast } from '@/hooks/useToast';

const createApiClient = () => {
  const requestQueue: Promise<any>[] = [];
  const MAX_CONCURRENT = 5;

  return {
    async request(fn: () => Promise<any>) {
      // Limitar requisições concorrentes
      if (requestQueue.length >= MAX_CONCURRENT) {
        await requestQueue[requestQueue.length - 1];
      }

      const promise = fn().catch(error => {
        if (error.status === 429) {
          toast.error('Muitas requisições. Aguarde...');
        }
        throw error;
      });

      requestQueue.push(promise);
      return promise;
    }
  };
};

export const apiClient = createApiClient();
```

---

### 5️⃣ ERROR HANDLING - MÉDIO

**Problema:** Erros expõem informações sensíveis

#### ✅ Solução - Tratamento genérico:

```typescript
// src/lib/error-handler.ts (novo arquivo)
export const handleApiError = (error: any) => {
  // Log completo no servidor (desenvolvimento)
  if (import.meta.env.DEV) {
    console.error('[API Error]', error);
  }

  // Mapear erros do Supabase para mensagens genéricas
  const errorMap: Record<string, string> = {
    'duplicate key value violates unique constraint': 'Esse registro já existe',
    'permission denied': 'Você não tem permissão',
    'new row violates row-level security policy': 'Acesso negado',
    'JWT expired': 'Sua sessão expirou. Faça login novamente',
  };

  let message = 'Erro ao processar requisição';
  
  for (const [key, value] of Object.entries(errorMap)) {
    if (error?.message?.includes(key)) {
      message = value;
      break;
    }
  }

  return {
    message,
    isGeneric: import.meta.env.PROD // Ocultar detalhes em produção
  };
};
```

```typescript
// Usar em qualquer lugar
try {
  await supabase.from('assets').insert([data]);
} catch (error) {
  const { message } = handleApiError(error);
  toast.error(message);
}
```

---

### 6️⃣ AUDIT LOGGING - MÉDIO

**Problema:** Sem rastreamento de ações

#### ✅ Solução - Criar tabela de auditoria:

**Supabase → SQL Editor:**

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para queries rápidas
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- RLS: Admins veem tudo, usuários veem apenas suas ações
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT
  USING (user_id = auth.uid());
```

```typescript
// src/lib/audit.ts (novo arquivo)
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const logAudit = async (action: string, resourceType: string, resourceId?: string, changes?: any) => {
  const { user } = useAuth();
  
  if (!user) return;

  const { error } = await supabase.from('audit_logs').insert([
    {
      user_id: user.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      changes: changes || null,
      ip_address: await getClientIp(),
      user_agent: navigator.userAgent,
    }
  ]);

  if (error && import.meta.env.DEV) {
    console.error('Failed to log audit', error);
  }
};

// Usar:
// await logAudit('DELETE', 'asset', assetId);
```

---

### 7️⃣ CSRF PROTECTION - ALTO

**Problema:** Requisições POST podem vir de sites maliciosos

#### ✅ Solução - SameSite Cookie (Supabase já configura):

O Supabase já envia cookies com `SameSite=Lax`. Garantir:

```typescript
// src/integrations/supabase/client.ts
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: sessionStorage,
    persistSession: false,
    autoRefreshToken: true,
  }
});
// ✅ Supabase configura SameSite automaticamente
```

Alternativa: Implementar token CSRF manualmente

```typescript
// src/lib/csrf.ts
import crypto from 'crypto';

export const generateCSRFToken = () => crypto.randomBytes(32).toString('hex');

export const validateCSRFToken = (token: string, stored: string) => {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(stored));
};
```

---

## 🔐 MELHORIAS DE SEGURANÇA ADICIONAIS

### 8️⃣ Headers HTTP

**Se você tiver backend personalizado, adicionar:**

```typescript
// backend (Express/Node)
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "https:"],
      connectSrc: ["'self'", "https://[seu-supabase].supabase.co"],
    },
  },
}));

// Headers adicionais
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

---

### 9️⃣ MONITORAMENTO

```typescript
// src/lib/monitoring.ts (novo arquivo)
export const monitorSuspiciousActivity = (action: string, metadata: any) => {
  // Em produção, enviar para serviço de monitoramento
  if (import.meta.env.PROD) {
    // Enviar para: Sentry, LogRocket, Datadog, etc
    console.log('[Monitoring]', { action, metadata, timestamp: new Date() });
  }
};

// Detectar possíveis ataques
export const detectAnomalies = (user: any) => {
  const suspiciousPatterns = [
    user?.device_changed_recently,
    user?.multiple_failed_logins,
    user?.unusual_location,
  ];

  if (suspiciousPatterns.some(p => p)) {
    monitorSuspiciousActivity('SUSPICIOUS_ACTIVITY', { user });
    // Requerer re-autenticação
  }
};
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Crítico (Esta semana):
- [ ] Ativar RLS em todas as tabelas
- [ ] Trocar localStorage para sessionStorage
- [ ] Adicionar schemas Zod para validação
- [ ] Implementar error handling genérico
- [ ] Audit logging (criar tabela + função)

### Alto (Próximas 2 semanas):
- [ ] Rate limiting (Edge Functions)
- [ ] CSRF token (se tiver backend)
- [ ] Security headers
- [ ] Monitoramento de atividades
- [ ] Testes de segurança

### Médio (Próximo mês):
- [ ] Teste de penetração
- [ ] Security audit completo
- [ ] Training de segurança para o time
- [ ] Documentação de segurança
- [ ] Backup & disaster recovery

---

## 🎯 PRÓXIMOS PASSOS

### 1. Hoje:
```bash
# Instalar dependências
npm install zod
```

### 2. Esta semana:
- [ ] Ativar RLS no Supabase
- [ ] Criar schemas Zod
- [ ] Atualizar client.ts

### 3. Antes de produção:
- [ ] Teste E2E de segurança
- [ ] Revisão de código (security)
- [ ] Pentesting básico

---

## 📞 CONTATO & DÚVIDAS

Qualquer dúvida ou problema na implementação, me avise! 🚀

**Status Final:** ✅ **PRONTO PARA HARDENING**

---

**Criado por:** Arthur Lima Almeida Prado  
**Data:** 19 de janeiro de 2026  
**Versão:** 1.0.0