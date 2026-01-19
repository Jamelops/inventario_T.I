# 🔗 Integração do Hook useRenumberIds

**Data:** 19 de janeiro de 2026  
**Status:** ✅ PRONTO PARA USAR  
**Versão:** 1.0.0

---

## 📋 Arquivos Criados

```
src/
  ├─ hooks/
  │  └─ useRenumberIds.ts          # Hook principal
  ├─ components/
  │  └─ admin/
  │     └─ RenumberIdsPanel.tsx    # Componente UI
  └─ pages/
     └─ AdminRenumberIds.tsx    # Página da rota
```

---

## 🚀 Como Integrar (3 Passos)

### Passo 1: Adicionar Rota no Router

**Abra seu arquivo de rotas principal (ex: `src/routes.tsx` ou `src/App.tsx`):**

```tsx
import { AdminRenumberIds } from '@/pages/AdminRenumberIds';

const routes = [
  // ... suas outras rotas
  
  // Adicionar isso:
  {
    path: '/admin/renumber-ids',
    element: <AdminRenumberIds />,
    // Opcional: adicione proteção:
    // beforeEnter: (to, from, next) => {
    //   if (isAdmin) next();
    //   else next('/login');
    // }
  }
];
```

**Se usar React Router v6:**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminRenumberIds } from '@/pages/AdminRenumberIds';

function AppRoutes() {
  return (
    <Routes>
      {/* Suas rotas existentes */}
      
      {/* Nova rota */}
      <Route path="/admin/renumber-ids" element={<AdminRenumberIds />} />
    </Routes>
  );
}
```

### Passo 2: Acessar a Página

```
http://localhost:5173/admin/renumber-ids
```

### Passo 3: Usar o Botão

```
1. Abra a página
2. Leia os avisos
3. Clique em "Iniciar Renumeração"
4. Confirme no diálogo
5. Aguarde (toast notifications mostram progresso)
6. Recarregue a página quando terminar
```

---

## 📋 O Que Cada Arquivo Faz

### `useRenumberIds.ts` - Hook

```typescript
const { renumber, isLoading, error, success } = useRenumberIds();

// Métodos:
renumber()     // Executa a renumeração

// Estados:
isLoading      // boolean - se está processando
error          // string | null - mensagem de erro
success        // boolean - se completou com sucesso
```

**Características:**
- ✅ Integrado com `useToast` (Toast Notifications)
- ✅ Busca seções do Supabase
- ✅ Renumera de 1 em diante
- ✅ Atualiza referências
- ✅ Mostra progresso em tempo real

### `RenumberIdsPanel.tsx` - Componente

```typescript
<RenumberIdsPanel />
```

**Inclui:**
- ✅ Botão para iniciar
- ✅ Diálogo de confirmação
- ✅ Avisos de segurança
- ✅ Estados de carregamento
- ✅ Feedback visual (erro/sucesso)
- ✅ Dark mode support
- ✅ Design responsivo

### `AdminRenumberIds.tsx` - Página

```typescript
<AdminRenumberIds />
```

**Fornece:**
- ✅ Página completa com layout
- ✅ Header e footer
- ✅ Gradiente de fundo
- ✅ Pronto para rota

---

## 📚 Exemplos de Uso

### Usar Diretamente em um Componente

```tsx
import { useRenumberIds } from '@/hooks/useRenumberIds';

const MyComponent = () => {
  const { renumber, isLoading, error, success } = useRenumberIds();

  return (
    <div>
      <button onClick={renumber} disabled={isLoading}>
        {isLoading ? 'Carregando...' : 'Renumerar'}
      </button>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">✅ Sucesso!</p>}
    </div>
  );
};
```

### Uso Avançado com Lógica Customizada

```tsx
import { useRenumberIds } from '@/hooks/useRenumberIds';
import { useCallback } from 'react';

const AdvancedComponent = () => {
  const { renumber, isLoading } = useRenumberIds();

  const handleRenumber = useCallback(async () => {
    // Lógica antes
    console.log('Início...');
    
    // Executar renumeração
    await renumber();
    
    // Lógica depois
    console.log('Fim!');
  }, [renumber]);

  return (
    <button onClick={handleRenumber} disabled={isLoading}>
      Processar
    </button>
  );
};
```

---

## 🗑️ Customizações

### Mudar Estilos do Componente

**Em `RenumberIdsPanel.tsx`, edite as classes Tailwind:**

```tsx
// Mudar cor do botão
className="... bg-blue-600 hover:bg-blue-700 ..."
// Para:
className="... bg-green-600 hover:bg-green-700 ..."

// Mudar tamanho
className="... text-2xl ..."
// Para:
className="... text-3xl ..."
```

### Adicionar Proteção de Acesso

**Na rota:**

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

<Route 
  path="/admin/renumber-ids" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminRenumberIds />
    </ProtectedRoute>
  } 
/>
```

**Ou no hook:**

```tsx
export const useRenumberIds = () => {
  const { user } = useAuth();
  
  // Verificar permissão
  if (user?.role !== 'admin') {
    throw new Error('Sem permissão');
  }
  
  // ... resto do código
};
```

### Alterar Mensagens de Toast

**Em `useRenumberIds.ts`:**

```tsx
// Mudar:
toast.info(`Encontradas ${sections.length} seções...`);

// Para:
toast.info(`🔠 Total de ${sections.length} seções para processar`);
```

---

## 🔠 Como o Hook Funciona

```
1. Usuário clica botão
   ↓
2. Hook chama renumber()
   ↓
3. Conecta ao Supabase
   ↓
4. Busca todas as seções
   ↓
5. Cria mapa de IDs
   e7e7a322... → 1
   a1b2c3d4... → 2
   xyz98765... → 3
   ↓
6. Atualiza cada seção
   UPDATE sections SET id = 1 WHERE id = 'e7e7a322...'
   ↓
7. Atualiza referências
   UPDATE content SET section_id = 1 WHERE section_id = 'e7e7a322...'
   ↓
8. Retorna sucesso
   ↓
9. Toast notifications mostram resultado
```

---

## ⚠️ Avisos Importantes

### 🔐 Segurança

```
⚠️ NÃO coloque em producão sem proteção
✅ Use autenticação/autorização
✅ Restrinja a apenas administradores
✅ Log todas as execuções
```

### 💾 Backup

```
⚠️ SEMPRE faça backup antes
✅ Supabase Dashboard > Database > Backups
✅ Create Manual Backup
✅ Espere completar
```

### 🔄 Reverter

```
Se der errado:
1. Ir a Supabase Dashboard
2. Database > Backups
3. Clicar no backup anterior
4. Restore
```

---

## 💁 Estrutura de Dados

### Antes

```sql
sections:
id                                    | name
--------------------------------------+----------
e7e7a322-469f-4600-9701-da3f069737dc | Home
a1b2c3d4-e5f6-7890-abcd-ef1234567890 | About
xyz9876-5432-1098-dcba-fedcba987654  | Products
```

### Depois

```sql
sections:
id | name      | display_id
---+-----------+----------
1  | Home      | 1
2  | About     | 2
3  | Products  | 3
```

---

## 🧪 Testando

### 1. Testar em Staging

```bash
# Se tiver ambiente staging
npm run build:staging
npm run deploy:staging

# Testar em: https://staging.seu-app.com/admin/renumber-ids
```

### 2. Testar Localmente

```bash
# Clonar banco em local (se possível)
# Ou usar banco de teste

# Abrir página local
http://localhost:5173/admin/renumber-ids

# Executar com IDs de teste
```

### 3. Verificar Resultado

```sql
-- No Supabase SQL Editor:
SELECT id, name, display_id FROM sections ORDER BY id ASC;

-- Deve mostrar:
id | name      | display_id
---+-----------+----------
1  | Home      | 1
2  | About     | 2
3  | Products  | 3
```

---

## 🔠 Fluxograma

```
┌─────────────────────────┐
│  Página Admin aberta    │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────┐
│ Usuário clica botão    │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────┐
│  Diálogo de confirma   │
└────────────┬────────────┘
             │
         SIM │ NÃO
             │────│
             ↓     ↓
        Hook      Cancelar
        Run       └─┐
             │
             ↓
┌─────────────────────────┐
│ Buscando seções...     │
│ (Toast info)            │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────┐
│ Processando...          │
│ (isLoading = true)      │
└────────────┬────────────┘
             │
          E │ Erro
             │────┐
             ↓     ↓
        Sucesso  Error State
        Toast    (Toast error)
        Sucesso  └──────┐
             │        │
             ↓        ↓
    ┌──────────┴────────┐
    │                  │
    ↓                  ↓
  Sucesso           Erro
  State             State
  └──┐              └──┐
     │                 │
     ↓                 ↓
Botão        Botão
Recarregar   Tentar
Página       Novamente
```

---

## 💫 Checklist de Deploy

```
[ ] Fazer backup no Supabase
[ ] Testar em staging
[ ] Testar localmente
[ ] Adicionar rota no router
[ ] Adicionar proteção (autenticação/autorização)
[ ] Testar navegação
[ ] Testar renumeração
[ ] Verificar toast notifications
[ ] Deploy em produção
[ ] Monitorar logs
[ ] Comunicar aos usuários
```

---

## 😫 Troubleshooting

### Problema: "Nenhuma seção encontrada"

```
Causa: Tabela vazia ou sem dados

Solução:
1. Verificar no Supabase
   SELECT COUNT(*) FROM sections;
2. Se vazio, adicionar dados de teste
3. Tentar novamente
```

### Problema: "Permission denied"

```
Causa: Usuário sem permissão

Solução:
1. Verificar chave Supabase (.env)
2. Verificar RLS policies
3. Usar chave admin se necessário
```

### Problema: Hook não encontrado

```
Causa: Caminho de import errado

Solução:
 import { useRenumberIds } from '@/hooks/useRenumberIds';
```

### Problema: Toast não aparece

```
Causa: ToastProvider não está no App

Solução:
1. Verificar App.tsx
2. Confirmar ToastProvider está lá
3. Confirmar ToastContainer está no DOM
```

---

## 📚 Referências

- `useToast.ts` - Hook de Toast Notifications
- `RENUMBER_IDS_GUIDE.md` - Guia do Script
- `TOAST_DOCUMENTATION.md` - Documentação de Toasts

---

## 🙋 Suporte

Tem dúvidas?

1. Verifique os logs do console (F12)
2. Leia os toast notifications
3. Confira este documento
4. Verifique `RENUMBER_IDS_GUIDE.md`

---

**Criado por:** Arthur Lima Almeida Prado  
**Data:** 19 de janeiro de 2026  
**Versão:** 1.0.0  
**Status:** ✅ PRONTO PARA PRODUÇÃO
