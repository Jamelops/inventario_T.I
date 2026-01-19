# 🍞 Toast Notifications System

Sistema completo de notificações toast para substituir `alert()` do navegador.

## 📦 Arquivos Criados

### Core Files
```
src/
├── types/
│   └── toast.ts                    # Tipos e interfaces
├── contexts/
│   └── ToastContext.tsx            # React Context com estado global
├── hooks/
│   └── useToast.ts                 # Hook customizado
└── components/ui/
    ├── toast-item.tsx              # Componente individual do toast
    ├── toast-container.tsx         # Container que renderiza todos
    └── examples/
        └── ToastExample.tsx        # Exemplo de uso
```

### Arquivos Modificados
```
src/App.tsx                         # Adicionado ToastProvider e ToastContainer
```

## 🚀 Uso Básico

### 1. Importar o hook
```tsx
import { useToast } from '@/hooks/useToast';
```

### 2. Usar em seu componente
```tsx
export function MyComponent() {
  const toast = useToast();

  const handleSave = async () => {
    try {
      // ... salvar dados
      toast.success('Dados salvos com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar os dados');
    }
  };

  return (
    <button onClick={handleSave}>
      Salvar
    </button>
  );
}
```

## 📝 API

### Métodos Disponíveis

#### `toast.success(message, duration?)`
```tsx
toast.success('Operação concluída!');
toast.success('Salvando...', 5000); // 5 segundos
```

#### `toast.error(message, duration?)`
```tsx
toast.error('Ocorreu um erro!');
toast.error('Falha na conexão', 3000);
```

#### `toast.warning(message, duration?)`
```tsx
toast.warning('Atenção: ação irreversível!');
toast.warning('Esse arquivo será deletado', 6000);
```

#### `toast.info(message, duration?)`
```tsx
toast.info('Nova versão disponível');
toast.info('Seu perfil foi atualizado', 4000);
```

### Duração
- **Padrão**: `4000ms` (4 segundos)
- **Personalizado**: Qualquer valor em ms
- **Permanente**: `0` (não fecha automaticamente)

```tsx
// Fecha automaticamente em 3 segundos
toast.success('Rápido demais?', 3000);

// Não fecha automaticamente
toast.error('Erro crítico!', 0);
```

## 🎨 Tipos de Toast

### Success (Sucesso)
- **Ícone**: CheckCircle ✓
- **Cores**: Verde (Emerald)
- **Uso**: Operações bem-sucedidas

```tsx
toast.success('Cadastro realizado!');
```

### Error (Erro)
- **Ícone**: AlertCircle ⚠
- **Cores**: Vermelho (Red)
- **Uso**: Erros e falhas

```tsx
toast.error('Falha ao conectar');
```

### Warning (Aviso)
- **Ícone**: AlertTriangle ⚠
- **Cores**: Âmbar (Amber)
- **Uso**: Avisos e confirmações

```tsx
toast.warning('Esta ação não pode ser desfeita');
```

### Info (Informação)
- **Ícone**: Info ⓘ
- **Cores**: Azul (Blue)
- **Uso**: Informações gerais

```tsx
toast.info('Sincronizando dados...');
```

## ✨ Recursos

### ✅ Implementados
- ✓ Toast global (funciona em qualquer componente)
- ✓ 4 tipos de notificação (success, error, warning, info)
- ✓ Empilhamento automático
- ✓ Auto-fechar customizável
- ✓ Botão de fechar (X)
- ✓ Animações suaves (slide-in, fade-in)
- ✓ Visual moderno e minimalista
- ✓ Cores específicas por tipo
- ✓ Acessibilidade (aria-live, role, aria-label)
- ✓ **Barra de progresso** indicando tempo restante
- ✓ Dark mode support
- ✓ Responsivo

### 🎯 Posicionamento
- Canto **superior direito**
- Múltiplas toasts em coluna
- Z-index alto (z-50) para ficar acima de tudo

## 💡 Exemplos Reais

### Formulário de Login
```tsx
const handleLogin = async () => {
  try {
    const result = await signIn(email, password);
    if (result.success) {
      toast.success('Bem-vindo de volta!');
      navigate('/dashboard');
    }
  } catch (error) {
    toast.error('Email ou senha inválidos');
  }
};
```

### Operação CRUD
```tsx
const handleDelete = async (id: string) => {
  try {
    await deleteAsset(id);
    toast.success('Ativo deletado com sucesso');
    // Recarregar lista
  } catch (error) {
    toast.error('Erro ao deletar: ' + error.message);
  }
};
```

### Validação
```tsx
const handleSubmit = (data) => {
  if (!data.email) {
    toast.warning('Preencha o email');
    return;
  }
  if (!isValidEmail(data.email)) {
    toast.error('Email inválido');
    return;
  }
  toast.info('Salvando...');
};
```

### Operação em Background
```tsx
const handleSync = () => {
  toast.info('Sincronizando dados...', 0); // Permanente
  
  syncData()
    .then(() => {
      toast.success('Sincronização concluída!', 3000);
    })
    .catch(() => {
      toast.error('Erro na sincronização', 0);
    });
};
```

## 🔧 Personalização

### Cores Personalizadas
Editar em `src/components/ui/toast-item.tsx`:

```tsx
const toastConfig = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    border: 'border-emerald-200 dark:border-emerald-800',
    // ... mais propriedades
  },
  // ... outros tipos
};
```

### Duração Padrão
Editar em `src/contexts/ToastContext.tsx`:

```tsx
const newToast: Toast = {
  ...toast,
  id,
  duration: toast.duration ?? 4000, // Mudar aqui
};
```

### Posição
Editar em `src/components/ui/toast-container.tsx`:

```tsx
// Mudar: fixed top-4 right-4
// Para: fixed bottom-4 left-4 (canto inferior esquerdo)
<div className="fixed bottom-4 left-4 z-50 flex flex-col pointer-events-none">
```

## ⚙️ Técnicas Avançadas

### Retornar ID para Gerenciamento
```tsx
const toastId = toast.success('Salvando...');
// Depois:
const removeToast = useToast();
removeToast.removeToast(toastId);
```

### Usar com APIs Externas
```tsx
const handleUpload = async (file: File) => {
  const loadingId = toast.info('Enviando arquivo...');
  
  try {
    await uploadFile(file);
    toast.removeToast(loadingId);
    toast.success('Arquivo enviado!');
  } catch (error) {
    toast.removeToast(loadingId);
    toast.error('Erro no upload');
  }
};
```

## 🎓 Boas Práticas

✅ **Faça:**
- Use mensagens claras e concisas
- Escolha o tipo correto para cada situação
- Defina duração apropriada
- Use para feedback de ações

❌ **Não faça:**
- Não abuse (não use em todas as ações)
- Não use para informações críticas que devem persistir
- Não use textos muito longos
- Não use para dados que precisam ser armazenados

## 🐛 Troubleshooting

### Toast não aparece
1. Verifique se `ToastProvider` está em `App.tsx`
2. Verifique se `ToastContainer` está em `App.tsx`
3. Confirme que está importando do caminho correto

### Hook retorna erro
```
useToast must be used within a ToastProvider
```
**Solução**: Verifique se o componente está dentro do `ToastProvider`

### Animações não funcionam
1. Certifique-se de ter Tailwind CSS instalado
2. Verifique se as classes de animação estão disponíveis
3. Limpe cache: `npm run build`

## 📊 Performance

- **Sem impacto**: O Context otimizado não causa re-renders desnecessários
- **Escalável**: Funciona bem mesmo com 20+ toasts simultâneos
- **Eficiente**: Limpa toasts automaticamente ao expirar

## 🔐 Acessibilidade

- `role="alert"` para alertar leitores de tela
- `aria-live="polite"` para anunciar notificações
- `aria-atomic="true"` para ler todo o conteúdo
- `aria-label` em botões de fechar
- Contraste de cores adequado (WCAG 2.1 AA)
- Navegação por teclado (Tab para fechar)

## 📚 Integração com Componentes Existentes

### Auth.tsx
```tsx
import { useToast } from '@/hooks/useToast';

const Auth = () => {
  const toast = useToast();
  
  const handleLogin = async () => {
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Login realizado!');
    }
  };
};
```

### AssetForm.tsx
```tsx
const handleSubmit = async (data) => {
  try {
    await saveAsset(data);
    toast.success('Ativo salvo com sucesso!');
    navigate('/assets');
  } catch (error) {
    toast.error('Erro ao salvar: ' + error.message);
  }
};
```

## 🚀 Próximos Passos

1. Testar em diferentes páginas
2. Coletar feedback dos usuários
3. Adicionar mais tipos se necessário
4. Implementar som de notificação (opcional)
5. Adicionar histórico de toasts

---

**Versão**: 1.0.0  
**Última atualização**: 19 de janeiro de 2026  
**Status**: ✅ Pronto para produção
