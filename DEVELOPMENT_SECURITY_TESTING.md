# 🧪 Guia de Desenvolvimento Local com Testes de Segurança

**Data:** 19 de janeiro de 2026  
**Status:** Para desenvolvimento LOCAL (Seu PC)  
**Versão:** 1.0.0  
**Arthur Lima Almeida Prado**

---

## 🎯 Situação Atual

```
✅ Você está no seu PC testando
✅ Usando Supabase (cloud) como BD
✅ App rodando localmente
✅ Nada em produção ainda

Esta é a melhor hora para testar segurança!
```

---

## 🏗️ Arquitetura Local

```
Seu PC
├─ Node.js + npm
├─ React App (localhost:5173)
└─ Conectando em
   └─ Supabase (cloud)
      ├─ Database (PostgreSQL)
      ├─ Auth
      └─ Storage
```

---

## 📋 Checklist: Setup de Segurança para DEV

### Fase 1: Configuração Inicial (Agora)

#### 1.1 Criar arquivo `.env.local` (LOCAL - NÃO COMMIT)

```bash
# Criar na raiz do projeto
touch .env.local
```

**Conteúdo do `.env.local`:**

```env
# ⚠️ NUNCA COMMIT ESTE ARQUIVO
# Adicione ao .gitignore

# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=seu-anon-key-aqui

# Development
VITE_ENV=development
VITE_ENABLE_DEBUG=true
```

**Arquivo `.gitignore` (verificar se já tem):**

```bash
# Não deve incluir nenhuma chave
.env
.env.local
.env.*.local
```

#### 1.2 Instalar Dependências

```bash
# Já fez isso
npm install

# Verificar Zod instalado
npm list zod
# Esperado: zod@^3.22.0 ou superior
```

#### 1.3 Verificar Projeto

```bash
# Rodar projeto
npm run dev

# Abrir navegador
http://localhost:5173
```

---

## 🔐 Fase 2: Ativar RLS no Supabase (DEV)

### ⚠️ IMPORTANTE: Modo DEV vs Modo TESTE

**Se você quer testar SEM RLS:**
```
1. Pule esta fase por enquanto
2. Desenvolva normalmente
3. Depois ativa RLS para testes
```

**Se você quer testar COM RLS:**
```
1. Siga SUPABASE_SQL_GUIDE.md
2. Execute os scripts SQL
3. RLS ativado = Não consegue acessar dados de outros usuários
```

### Recomendação para DEV:

```
✅ FAZER (agora em dev):
  - Testar Zod validação
  - Testar error handler
  - Testar auditoria (logs)
  - Testar flow de login

⏸️ FAZER DEPOIS (antes de produção):
  - Ativar RLS
  - Testar IDOR
  - Teste de permissões
  - Teste multi-usuário
```

---

## 🧪 Fase 3: Testar Validação Zod Localmente

### 3.1 Criar Componente de Teste

**Criar arquivo: `src/pages/SecurityTest.tsx`**

```typescript
import { useState } from 'react';
import { validateInput, AssetCreateSchema } from '@/schemas/asset.schema';
import { useToast } from '@/hooks/useToast';

export const SecurityTest = () => {
  const { toast } = useToast();
  const [testData, setTestData] = useState({
    name: '',
    description: '',
    serial_number: '',
  });

  const handleTestValidation = () => {
    // Teste 1: Dados válidos
    const validData = {
      name: 'Laptop Dell',
      description: 'Intel i7',
      serial_number: 'ABC123',
    };

    const result = validateInput(AssetCreateSchema, validData);

    if (result.success) {
      toast.success('✅ Validação passou!');
      console.log('Dados válidos:', result.data);
    } else {
      toast.error('❌ Validação falhou');
      console.error('Erros:', result.errors?.errors);
    }
  };

  const handleTestInvalidData = () => {
    // Teste 2: Dados inválidos
    const invalidData = {
      name: '', // Campo obrigatório vazio
      description: null,
      serial_number: 123, // Esperado string
    };

    const result = validateInput(AssetCreateSchema, invalidData);

    if (!result.success) {
      toast.error('✅ Detectou erro corretamente!');
      result.errors?.errors.forEach(error => {
        console.log(`Campo: ${error.path.join('.')} - Erro: ${error.message}`);
      });
    }
  };

  const handleTestXSS = () => {
    // Teste 3: Tentativa de XSS
    const xssData = {
      name: '<script>alert("XSS")</script>',
      description: '<img src=x onerror="alert(1)">',
      serial_number: 'normal',
    };

    const result = validateInput(AssetCreateSchema, xssData);

    if (!result.success) {
      toast.success('✅ XSS bloqueado pela validação!');
    } else {
      toast.warning('⚠️ XSS passou... Verificar schema');
    }
  };

  const handleTestSQLInjection = () => {
    // Teste 4: Tentativa de SQL Injection
    const sqlData = {
      name: "'; DROP TABLE assets; --",
      description: 'normal',
      serial_number: 'normal',
    };

    const result = validateInput(AssetCreateSchema, sqlData);

    if (!result.success) {
      toast.success('✅ SQL Injection bloqueado!');
    } else {
      toast.warning('⚠️ SQL passou... Mas backend protege');
    }
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">🧪 Testes de Segurança</h1>

      <div className="bg-blue-50 p-4 rounded border border-blue-200">
        <p className="font-semibold">Teste 1: Dados Válidos</p>
        <p className="text-sm text-gray-600">Validação deve PASSAR</p>
        <button
          onClick={handleTestValidation}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Testar Válidos
        </button>
      </div>

      <div className="bg-red-50 p-4 rounded border border-red-200">
        <p className="font-semibold">Teste 2: Dados Inválidos</p>
        <p className="text-sm text-gray-600">Validação deve FALHAR</p>
        <button
          onClick={handleTestInvalidData}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Testar Inválidos
        </button>
      </div>

      <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
        <p className="font-semibold">Teste 3: XSS (Cross-Site Scripting)</p>
        <p className="text-sm text-gray-600">Deve BLOQUEAR script tags</p>
        <button
          onClick={handleTestXSS}
          className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Testar XSS
        </button>
      </div>

      <div className="bg-purple-50 p-4 rounded border border-purple-200">
        <p className="font-semibold">Teste 4: SQL Injection</p>
        <p className="text-sm text-gray-600">Deve BLOQUEAR comandos SQL</p>
        <button
          onClick={handleTestSQLInjection}
          className="mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Testar SQL Injection
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <p className="font-semibold text-sm">Console (Abra F12 para ver detalhes)</p>
        <p className="text-xs text-gray-600 mt-2">Clique nos botões acima e veja os logs no console do navegador (F12 > Console)</p>
      </div>
    </div>
  );
};
```

### 3.2 Adicionar Rota para Testes

**Em `src/router/AppRoutes.tsx` ou similar:**

```typescript
import { SecurityTest } from '@/pages/SecurityTest';

export const routes = [
  // ... suas rotas
  {
    path: '/security-test',
    element: <SecurityTest />,
  },
];
```

### 3.3 Testar Localmente

```bash
# 1. Rodar projeto
npm run dev

# 2. Abrir
http://localhost:5173/security-test

# 3. Clicar em cada botão
# 4. Abrir DevTools (F12)
# 5. Ver resultados no console
```

---

## 🔍 Fase 4: Testar Error Handler

**Criar: `src/pages/ErrorHandlingTest.tsx`**

```typescript
import { useState } from 'react';
import { handleApiError } from '@/lib/error-handler';
import { useToast } from '@/hooks/useToast';

export const ErrorHandlingTest = () => {
  const { toast } = useToast();

  const handleTestDatabaseError = () => {
    const error = {
      message: 'FATAL: remaining connection slots are reserved for non-replication superuser connections',
      code: 'PGRST116',
    };

    console.error('Error original:', error);
    handleApiError(error as any, { showToast: true });
    // Deve mostrar mensagem genérica, não a original
  };

  const handleTestNetworkError = () => {
    const error = new Error('Failed to fetch from api.example.com');
    console.error('Error original:', error);
    handleApiError(error, { showToast: true });
  };

  const handleTestValidationError = () => {
    const error = {
      message: 'Invalid input: email must be a valid email address',
    };
    console.error('Error original:', error);
    handleApiError(error as any, { showToast: true });
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">🚨 Testes de Error Handler</h1>

      <div className="bg-red-50 p-4 rounded border border-red-200">
        <p className="font-semibold">Teste 1: Database Error</p>
        <p className="text-sm text-gray-600">Deve mostrar mensagem genérica</p>
        <button
          onClick={handleTestDatabaseError}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Simular Erro de BD
        </button>
      </div>

      <div className="bg-orange-50 p-4 rounded border border-orange-200">
        <p className="font-semibold">Teste 2: Network Error</p>
        <button
          onClick={handleTestNetworkError}
          className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Simular Erro de Rede
        </button>
      </div>

      <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
        <p className="font-semibold">Teste 3: Validation Error</p>
        <button
          onClick={handleTestValidationError}
          className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Simular Erro de Validação
        </button>
      </div>

      <div className="bg-blue-50 p-4 rounded border border-blue-200">
        <p className="font-semibold text-sm">O que deve acontecer:</p>
        <ul className="text-sm text-gray-700 mt-2 list-disc list-inside space-y-1">
          <li>✅ Toast exibe "Algo deu errado, tente novamente"</li>
          <li>✅ No console, vemos erro original (dev)</li>
          <li>❌ Não expor detalhes da BD ao usuário</li>
          <li>❌ Não mostrar caminhos de arquivo</li>
        </ul>
      </div>
    </div>
  );
};
```

---

## 📊 Fase 5: Testar sessionStorage

**Criar: `src/pages/StorageTest.tsx`**

```typescript
export const StorageTest = () => {
  const handleCheckStorage = () => {
    console.log('=== STORAGE CHECK ===');

    // localStorage (deve estar vazio ou sem token)
    const localStorage_content = Object.entries(localStorage);
    console.log('localStorage:', localStorage_content);
    localStorage_content.forEach(([key, value]) => {
      if (key.includes('token') || key.includes('auth') || key.includes('key')) {
        console.error('❌ AVISO: Token em localStorage!', key);
      }
    });

    // sessionStorage (deve ter token)
    const sessionStorage_content = Object.entries(sessionStorage);
    console.log('sessionStorage:', sessionStorage_content);
    sessionStorage_content.forEach(([key, value]) => {
      if (key.includes('token') || key.includes('auth')) {
        console.log('✅ Token em sessionStorage (correto)');
      }
    });
  };

  const handleOpenDevTools = () => {
    alert('Pressione F12 > Application > Storage');
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">💾 Testes de Storage</h1>

      <div className="bg-blue-50 p-4 rounded border border-blue-200">
        <p className="font-semibold">Como Verificar:</p>
        <ol className="text-sm text-gray-700 mt-2 list-decimal list-inside space-y-1">
          <li>Pressione F12 (abrir DevTools)</li>
          <li>Vá para aba "Application" ou "Storage"</li>
          <li>Expanda "Storage" (esquerda)</li>
          <li>Clique em "Local Storage" → seu site</li>
          <li>Verificar se NÃO tem token</li>
          <li>Clique em "Session Storage" → seu site</li>
          <li>Verificar se TEM token (sess_...)</li>
        </ol>
      </div>

      <div className="bg-green-50 p-4 rounded border border-green-200">
        <p className="font-semibold">Teste Automático:</p>
        <button
          onClick={handleCheckStorage}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Verificar Storage (ver console)
        </button>
      </div>

      <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
        <p className="font-semibold text-sm">O que deve acontecer:</p>
        <ul className="text-sm text-gray-700 mt-2 list-disc list-inside space-y-1">
          <li>✅ localStorage vazio ou sem tokens</li>
          <li>✅ sessionStorage com token da sessão</li>
          <li>✅ Token desaparece ao fechar aba</li>
          <li>✅ Sessionéio iniciada em nova aba</li>
        </ul>
      </div>
    </div>
  );
};
```

---

## 🚀 Fase 6: Testar Auditoria (Localmente)

**Criar: `src/pages/AuditTest.tsx`**

```typescript
import { useEffect, useState } from 'react';
import { logSuccess } from '@/lib/audit';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';

export const AuditTest = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);

  const handleCreateTestLog = async () => {
    try {
      // Logar uma ação de teste
      await logSuccess('CREATE_ASSET', 'assets', 'test-id-123');
      toast.success('Log criado!');
      // Recarregar logs
      await fetchLogs();
    } catch (error) {
      toast.error('Erro ao criar log');
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">📋 Testes de Auditoria</h1>

      <div className="bg-blue-50 p-4 rounded border border-blue-200">
        <p className="font-semibold">Pré-requisito:</p>
        <p className="text-sm text-gray-600">Tabela audit_logs criada no Supabase</p>
        <p className="text-sm text-gray-600 mt-2">Se ainda não criou:</p>
        <p className="text-xs font-mono bg-gray-100 p-2 rounded mt-2">
          Siga SUPABASE_SQL_GUIDE.md
        </p>
      </div>

      <button
        onClick={handleCreateTestLog}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Criar Log de Teste
      </button>

      <button
        onClick={fetchLogs}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-2"
      >
        Recarregar Logs
      </button>

      <div className="mt-4">
        <h2 className="font-semibold mb-2">Logs Recentes ({logs.length}):</h2>
        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhum log ainda...</p>
          ) : (
            <div className="space-y-2 text-sm">
              {logs.map((log) => (
                <div key={log.id} className="border-l-4 border-blue-500 pl-3 py-1">
                  <p className="font-semibold">{log.action}</p>
                  <p className="text-gray-600 text-xs">Recurso: {log.resource_type}</p>
                  <p className="text-gray-600 text-xs">Sucesso: {log.success ? '✅' : '❌'}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded border border-green-200">
        <p className="font-semibold text-sm">Se funcionou:</p>
        <ul className="text-sm text-gray-700 mt-2 list-disc list-inside space-y-1">
          <li>✅ Botão "Criar Log" mostra toast de sucesso</li>
          <li>✅ Logs aparecem na tabela</li>
          <li>✅ Timestamps corretos</li>
          <li>✅ Pronto para auditoria em produção</li>
        </ul>
      </div>
    </div>
  );
};
```

---

## 📋 Checklist: Testes Locais

### Antes de Adicionar RLS:

```
[ ] Zod validação funcionando
    [ ] Testes válidos passam
    [ ] Testes inválidos falham
    [ ] XSS bloqueado
    [ ] SQL injection bloqueado

[ ] Error handler funcionando
    [ ] Mensagens genéricas exibidas
    [ ] Detalhes não expontos
    [ ] Toast mostrando erros

[ ] Storage seguro
    [ ] localStorage vazio
    [ ] sessionStorage com token
    [ ] Token desaparece ao fechar aba

[ ] Auditoria funcionando
    [ ] Logs criados no Supabase
    [ ] Timestamps corretos
    [ ] Ações registradas
```

### Depois de Adicionar RLS:

```
[ ] RLS ativado em todas tabelas
[ ] Policies criadas
[ ] Tabela audit_logs funcional
[ ] Testes com 2 usuários (IDOR)
    [ ] User A vê só seus dados
    [ ] User B não consegue acessar dados de User A
[ ] Pronto para produção
```

---

## 🎉 Próximos Passos

### Esta Semana (Dev):

```
1. [ ] Criar componentes de teste (SecurityTest, ErrorHandlingTest, etc)
2. [ ] Executar todos os testes
3. [ ] Verificar console (F12)
4. [ ] Anotar qualquer problema
```

### Próxima Semana (RLS):

```
1. [ ] Ativar RLS no Supabase (SQL scripts)
2. [ ] Testar com 2 usuários
3. [ ] Teste de IDOR
4. [ ] Ajustar se necessário
```

### Antes de Produção:

```
1. [ ] Remover componentes de teste
2. [ ] Integrar segurança em componentes reais
3. [ ] Teste final de ponta-a-ponta
4. [ ] Deploy!
```

---

## 📚 Referências

| Documento | Uso |
|-----------|-----|
| SECURITY_FIXES.md | Entender vulnerabilidades |
| SECURITY_IMPLEMENTATION_GUIDE.md | Como integrar em produção |
| SUPABASE_SQL_GUIDE.md | Executar scripts RLS |
| SECURITY_CHECKLIST.md | Checklist completo |
| Este arquivo | Testar localmente |

---

## 🚀 Status

```
Você está aqui: 🟢 DESENVOLVIMENTO LOCAL
       ↓
    Testes em Dev ✅
       ↓
   RLS em DEV (Supabase) ⏳
       ↓
 Testes Multi-Usuário ⏳
       ↓
   Deploy Produção ⏳
```

---

**Criado por:** Arthur Lima Almeida Prado  
**Data:** 19 de janeiro de 2026  
**Versão:** 1.0.0  
**Status:** 🚀 PARA DESENVOLVIMENTO LOCAL
