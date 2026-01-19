# 🚀 Toast - Guia Rápido

**Usar notificações toast é muito fácil!**

## 1 Minuto de Setup

```tsx
// 1. Importar
import { useToast } from '@/hooks/useToast';

// 2. Usar
const toast = useToast();

// 3. Chamar
toast.success('Pronto!');
```

## Exemplos de Uma Linha

```tsx
// ✅ Sucesso
toast.success('Cadastro realizado!');

// ❌ Erro
toast.error('Falha na conexão');

// ⚠️ Aviso
toast.warning('Essa ação não pode ser desfeita');

// ⓘ Informação
toast.info('Novos dados disponíveis');
```

## Duração Customizada

```tsx
// 5 segundos
toast.success('Mensagem', 5000);

// Não fecha (0 = infinito)
toast.error('Erro crítico!', 0);

// Padrão: 4 segundos
toast.info('Isto fecha em 4s');
```

## Em Ações

```tsx
const handleSave = async () => {
  try {
    await saveData();
    toast.success('Salvo!');
  } catch (error) {
    toast.error(error.message);
  }
};
```

## Carregamento

```tsx
const handleDelete = async (id) => {
  const id = toast.info('Deletando...', 0);
  try {
    await deleteItem(id);
    toast.removeToast(id);
    toast.success('Deletado!');
  } catch (error) {
    toast.removeToast(id);
    toast.error('Erro ao deletar');
  }
};
```

## 💤 Preguiça? Atalhos

### Para copiar-colar:

```tsx
// Success
toast.success('', 4000);

// Error
toast.error('', 4000);

// Warning
toast.warning('', 4000);

// Info
toast.info('', 4000);
```

---

**E pronto! 🎉**

Veja `TOAST_DOCUMENTATION.md` para detalhes completos.
