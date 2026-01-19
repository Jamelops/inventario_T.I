# 🔐 Checklist de Segurança - Inventário MTU

> **Status:** Em Implementação | **Data:** 19 de janeiro de 2026

---

## 🗓️ ANTES DE IMPLEMENTAR

- [ ] Ler [SECURITY_FIXES.md](./SECURITY_FIXES.md) completamente
- [ ] Ler [SECURITY_IMPLEMENTATION_GUIDE.md](./SECURITY_IMPLEMENTATION_GUIDE.md) completamente
- [ ] Entender as 10 vulnerabilidades identificadas
- [ ] Ter acesso ao Supabase dashboard
- [ ] Ter Node.js e npm instalados

---

## 🚀 SEMANA 1: SETUP INICIAL

### Instalação

```bash
# [ ] Instalar Zod
npm install zod

# [ ] Verificar versão
npm list zod
# Esperado: zod@^3.22.0 ou superior
```

### Teste de sessionStorage

- [ ] Abrir a aplicação
- [ ] Abrir Chrome DevTools (F12)
- [ ] Ir para "Application" > "Storage"
- [ ] Verificar:
  - [ ] localStorage vazio ou sem token
  - [ ] sessionStorage com token (sess_...)
  - [ ] sessionStorage limpa ao fechar aba

### SQL Scripts - RLS

No Supabase Dashboard > SQL Editor:

- [ ] Copiar script de SECURITY_FIXES.md (seção "2️⃣ VALIDAÇÃO DE PROPRIEDADE")
- [ ] Executar para `assets` table
- [ ] Executar para `licenses` table
- [ ] Executar para `maintenance` table
- [ ] Executar para `tickets` table (se existir)
- [ ] Verificar policies criadas:
  - [ ] "Users can view own records"
  - [ ] "Admins can view all"
  - [ ] "Users can create own records"
  - [ ] "Users can update own records"
  - [ ] "Users can delete own records"

### SQL Scripts - Auditoria

No Supabase Dashboard > SQL Editor:

- [ ] Copiar script de SECURITY_FIXES.md (seção "6️⃣ AUDIT LOGGING")
- [ ] Executar para criar table `audit_logs`
- [ ] Verificar table criada:
  - [ ] Colunas corretas
  - [ ] Índices criados
  - [ ] RLS habilitado

### Teste de RLS

- [ ] Logar como usuário A
- [ ] Criar ativo
- [ ] Logar como usuário B
- [ ] Tentar acessar ativo do usuário A
- [ ] Resultado esperado: Erro de permissão
- [ ] [Resultado: ____________________]

---

## 🟠 SEMANA 2: INTEGRAÇÃO DE VALIDAÇÃO

### Asset Form

- [ ] Copiar código de SECURITY_IMPLEMENTATION_GUIDE.md
- [ ] Importar `AssetCreateSchema`
- [ ] Importar `validateInput`
- [ ] Adicionar validação no `handleSubmit`
- [ ] Adicionar mensagens de erro para o usuário
- [ ] Testar com dados válidos:
  - [ ] Form valida
  - [ ] Ativo criado
  - [ ] Redirecionamento funciona
- [ ] Testar com dados inválidos:
  - [ ] Erro exibido
  - [ ] Nenhuma requisição enviada

### License Form

- [ ] Criar `src/schemas/license.schema.ts`
  - [ ] Copiar padrão de `asset.schema.ts`
  - [ ] Adaptar para campos de license
- [ ] Importar em LicenseForm
- [ ] Adicionar validação
- [ ] Testar

### Maintenance Form (se existir)

- [ ] Criar `src/schemas/maintenance.schema.ts`
- [ ] Importar em MaintenanceForm
- [ ] Adicionar validação
- [ ] Testar

### Integração de Error Handler

- [ ] Importar `handleApiError` em AssetForm
- [ ] Importar em LicenseForm
- [ ] Importar em MaintenanceForm
- [ ] Envolver try-catch com `handleApiError`
- [ ] Testar erro:
  - [ ] Mensagem genérica exibida
  - [ ] Erro real não exposto

---

## 🟡 SEMANA 3: AUDITORIA

### Auditoria de Criação

- [ ] Importar `logSuccess` em AssetForm
- [ ] Adicionar após criar ativo:
  ```typescript
  await logSuccess('CREATE_ASSET', 'assets', newAsset.id);
  ```
- [ ] Testar:
  - [ ] Criar ativo
  - [ ] Verificar `audit_logs` no Supabase
  - [ ] Log registrado corretamente

### Auditoria de Atualização

- [ ] Importar `logSuccess`, `createChangeAuditTrail` em AssetEdit
- [ ] Adicionar após atualizar:
  ```typescript
  const changes = createChangeAuditTrail(oldData, newData);
  await logSuccess('UPDATE_ASSET', 'assets', assetId, changes);
  ```
- [ ] Testar: Verificar `before`/`after` no log

### Auditoria de Deleção

- [ ] Importar `logSuccess` em delete button
- [ ] Adicionar após deletar:
  ```typescript
  await logSuccess('DELETE_ASSET', 'assets', assetId);
  ```
- [ ] Testar: Verificar log no Supabase

### Dashboard de Auditoria

- [ ] Criar página simples para ver logs:
  - [ ] `src/pages/AuditLogs.tsx`
  - [ ] Exibir tabela de `audit_logs`
  - [ ] Filtrar por data
  - [ ] Filtrar por ação
- [ ] Testar acesso (admin only)

---

## 🟗️ TESTES DE SEGURANça

### Teste 1: IDOR (Insecure Direct Object Reference)

```
Scenario: Tentar acessar ativo de outro usuário

[ ] Logar como User A
[ ] Criar ativo (ID: abc123)
[ ] Copiar URL: /assets/abc123
[ ] Logar como User B
[ ] Tentar acessar: /assets/abc123
[ ] Resultado esperado: ❌ Erro de permissão
[ ] Resultado real: ____________________
```

### Teste 2: SQL Injection

```
Scenario: Tentar injetar SQL no form

[ ] Abrir Asset Form
[ ] No campo nome, digitar: '; DROP TABLE assets; --
[ ] Clicar em salvar
[ ] Resultado esperado: ❌ Erro de validação
[ ] Resultado real: ____________________
```

### Teste 3: XSS (Cross-Site Scripting)

```
Scenario: Tentar injetar JavaScript

[ ] Abrir Asset Form
[ ] No campo descrição, digitar: <script>alert('XSS')</script>
[ ] Clicar em salvar
[ ] Resultado esperado: ❌ Erro de validação
[ ] Resultado real: ____________________
[ ] Verificar: Script nunca executou
```

### Teste 4: Validação de Campos

```
Scenario: Campos obrigatórios

[ ] Abrir Asset Form
[ ] Deixar campos em branco
[ ] Clicar em salvar
[ ] Resultado esperado: ❌ Erro de validação
[ ] Resultado real: ____________________

Scenario: Campo de email inválido

[ ] Digitar email: "invalido@"
[ ] Clicar em salvar
[ ] Resultado esperado: ❌ Erro de validação
[ ] Resultado real: ____________________
```

### Teste 5: Token Expiração

```
Scenario: Usar app após token expirar

[ ] Logar na aplicação
[ ] Abrir DevTools > Application > Cookies
[ ] Encontrar cookie de sessão
[ ] Deletar o cookie
[ ] Tentar criar ativo
[ ] Resultado esperado: ❌ Redirecionado para login
[ ] Resultado real: ____________________
```

### Teste 6: Rate Limiting

```
Scenario: Muitas requisições rápidas

[ ] Abrir Console (F12)
[ ] Executar:
    for(let i=0; i<100; i++) {
      fetch('/api/assets', {method: 'POST', body: ...})
    }
[ ] Resultado esperado: 🔈 Status 429 (Too Many Requests)
[ ] Resultado real: ____________________
```

---

## 📋 ANTES DE PRODUÇÃO

### Review de Código

- [ ] Todos os endpoints usam RLS
- [ ] Não há console.log() com dados sensíveis
- [ ] Não há try-catch vazio
- [ ] Todos os forms usam Zod
- [ ] Todos os erros são tratados com handleApiError
- [ ] Todos os CRUD logam em audit_logs
- [ ] Nenhuma chave API no código
- [ ] .env.example atualizado (sem secrets)

### Segurança

- [ ] localStorage não tem tokens
- [ ] sessionStorage limpa ao fechar aba
- [ ] HTTPS ativado
- [ ] SameSite cookies configurado
- [ ] CORS configurado corretamente
- [ ] CSP headers presentes

### Dados

- [ ] Backup completo realizado
- [ ] Dados sensíveis criptografados
- [ ] LGPD compliant
- [ ] Política de privacidade atualizada
- [ ] Termos de serviço atualizados

### Documentação

- [ ] README.md atualizado
- [ ] CONTRIBUTING.md criado
- [ ] SECURITY.md criado
- [ ] LOG_RETENTION.md criado
- [ ] INCIDENT_RESPONSE.md criado

### Deploy

- [ ] Environment variables corretos
- [ ] Database migrations aplicadas
- [ ] RLS policies ativas
- [ ] Logs centralizados (Sentry/LogRocket)
- [ ] Monitoring configurado
- [ ] Alertas configurados

---

## 🏆 PÓS-DEPLOY

- [ ] Monitorar logs por 24h
- [ ] Verificar performance
- [ ] Verificar erros
- [ ] Coletar feedback dos usuários
- [ ] Documentar lições aprendidas
- [ ] Agendar follow-up de segurança (30 dias)

---

## 🗣️ NOTAS

### Se Algo Não Funcionar:

1. Verificar console do navegador (F12 > Console)
2. Verificar console do servidor (DevTools do Supabase)
3. Revisar SECURITY_FIXES.md para a seção relevante
4. Revisar SECURITY_IMPLEMENTATION_GUIDE.md para exemplos
5. Abrir issue com detalhes

### Dicas de Debug:

```typescript
// Ver RLS funcionando
const { data, error } = await supabase
  .from('assets')
  .select('*');
console.log('Erro RLS:', error); // Deve mostrar permission denied

// Ver auditoria
const { data: logs } = await supabase
  .from('audit_logs')
  .select('*')
  .limit(10);
console.log('Logs:', logs);

// Ver validação
const result = validateInput(AssetCreateSchema, data);
console.log('Erros:', result.errors?.errors);
```

---

## ✅ Conclusão

Ao completar este checklist, a aplicação estará:

- ✅ Protegida contra IDOR
- ✅ Com validação de inputs
- ✅ Com auditoria completa
- ✅ Com error handling seguro
- ✅ Com testes de segurança
- ✅ Pronta para produção

---

**Criado por:** Arthur Lima Almeida Prado  
**Data:** 19 de janeiro de 2026  
**Versão:** 1.0.0
