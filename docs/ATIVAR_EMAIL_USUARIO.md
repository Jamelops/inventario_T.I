# Guia: Ativar Email do Usuário sem Verificação

## 📋 Resumo

Agora você pode **ativar o email de um usuário sem exigir verificação**! Isso é útil quando você quer aprovar usuários manualmente no admin.

## 🔧 Como Funciona

### Frontend (React)

Na página `src/pages/Profiles.tsx`, foi adicionado um novo botão **"Ativar Email"** na seção de usuários pendentes:

```tsx
<Button
  size="sm"
  variant="outline"
  className="w-full"
  onClick={() => activateUserEmail(profile.email)}
  disabled={activatingEmail === profile.email}
>
  <Mail className="h-4 w-4 mr-1" />
  {activatingEmail === profile.email ? 'Ativando...' : 'Ativar Email'}
</Button>
```

### Backend (Supabase RPC)

Foi criada uma função RPC chamada `confirm_user_email` que:

1. Recebe o email do usuário
2. Encontra o usuário na tabela `auth.users`
3. Define `email_confirmed_at` como a data/hora atual
4. Retorna sucesso ou erro em JSON

## 📝 Passos para Usar

### 1️⃣ Aplicar a Migração no Supabase

Execute o SQL em `supabase/migrations/20260120_create_confirm_email_function.sql` no seu Supabase:

```sql
CREATE OR REPLACE FUNCTION public.confirm_user_email(user_email TEXT)
RETURNS JSON
-- ... (veja o arquivo completo)
```

**Opções de execução:**

**A) Via Supabase Dashboard (Recomendado):**
1. Abra [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Crie uma nova query
5. Cole todo o conteúdo do arquivo `20260120_create_confirm_email_function.sql`
6. Clique em **Run**

**B) Via Supabase CLI:**
```bash
supabase migration list
supabase db push  # Isso vai rodar as migrations automaticamente
```

### 2️⃣ Usar no Dashboard Admin

1. Abra a página **Gerenciamento de Usuários**
2. Na seção **"Aguardando Aprovação"**, você verá cada usuário com um novo botão **"Ativar Email"**
3. Clique no botão para ativar o email daquele usuário
4. O botão mostrará **"Ativando..."** enquanto processa
5. Aparecerá um alert com a confirmação

## 🔐 Segurança

- A função RPC usa `SECURITY DEFINER` para ter permissão de modificar a tabela `auth.users`
- Apenas usuários **autenticados** (`authenticated`) podem chamar essa função
- É recomendado adicionar uma verificação de **admin** no lado do servidor também

## ❌ Troubleshooting

### "Error: function confirm_user_email does not exist"

**Solução:** A migração não foi executada. Execute o SQL no Supabase Dashboard conforme descrito no Passo 1.

### "Error: function confirm_user_email(text) requires authentication"

**Solução:** Verifique se você está logado no aplicativo com uma conta de admin.

### "User not found"

**Solução:** O email digitado não existe no banco de dados. Verifique se o email está correto.

## 📚 Fluxo Completo

```
Usuário solicita acesso
    ↓
  ❌ Email NÃO confirmado (normal no Supabase)
    ↓
Admin aprova na página de Profiles
    ↓
Admin clica "Ativar Email"
    ↓
Função RPC marca email como confirmado
    ↓
✅ Usuário pode fazer login normalmente
```

## 🎯 Próximos Passos

- [ ] Adicionar validação de admin na função RPC
- [ ] Adicionar log de auditoria (quem ativou e quando)
- [ ] Enviar email de confirmação automática após ativar
- [ ] Adicionar opção de reenviar email de verificação

---

**Última atualização:** 20 de janeiro de 2026