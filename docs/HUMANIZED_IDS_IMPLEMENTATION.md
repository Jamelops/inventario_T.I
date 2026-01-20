# 🆔 Guia de Implementação - IDs Humanizados

## Visão Geral

O sistema de IDs humanizados converte IDs técnicos (UUIDs) em identificadores amigáveis baseados na categoria do ativo.

**Exemplos:**
- Notebooks: `NB001`, `NB002`, `NB003`
- Desktops: `DT001`, `DT002`, `DT003`
- Servidores: `SRV001`, `SRV002`, `SRV003`
- Monitores: `MON001`, `MON002`
- Impressoras: `PRT001`, `PRT002`

---

## 🚀 Implementação Passo a Passo

### 1. Arquivo `src/hooks/useHumanizedAssetIds.ts`

Este hook fornece todas as funcionalidades para gerenciar IDs humanizados:

```typescript
import { useHumanizedAssetIds } from '@/hooks/useHumanizedAssetIds';

const MyComponent = () => {
  const {
    generateHumanizedId,        // Gera um ID para um ativo
    getNextSequenceNumber,      // Próximo número sequencial da categoria
    generateAllHumanizedIds,    // Gera todos os IDs
    getHumanizedId,             // Obtém ID de um ativo
    getStatsByCategory,         // Estatísticas por categoria
    syncHumanizedIds,           // Sincroniza com banco de dados
    isGenerating,               // Estado do carregamento
    CATEGORY_PREFIXES,          // Mapa de prefixos
  } = useHumanizedAssetIds();
};
```

### 2. Componente `HumanizedIdBadge`

Use este componente para exibir IDs humanizados com estilo:

```tsx
import { HumanizedIdBadge } from '@/components/shared/HumanizedIdBadge';

<HumanizedIdBadge 
  assetId="uuid-do-ativo"
  category="notebook"
  humanizedId="NB001"
/>
```

### 3. Página Admin: `AdminHumanizedIds`

Use a página administrativa para sincronizar IDs:

```tsx
import { AdminHumanizedIds } from '@/pages/AdminHumanizedIds';

// Adicione no seu router:
{
  path: '/admin/humanized-ids',
  element: <AdminHumanizedIds />,
}
```

Acesse em: `http://localhost:5173/admin/humanized-ids`

---

## 📊 Exemplo: Integração em Assets.tsx

Atualize sua página de Assets para exibir IDs humanizados:

```tsx
import { HumanizedIdBadge } from '@/components/shared/HumanizedIdBadge';

<TableCell>
  <HumanizedIdBadge 
    assetId={asset.id}
    category={asset.categoria}
    humanizedId={asset.humanizedId}
  />
</TableCell>
```

---

## 🔧 Configurar Prefixos Personalizados

Você pode modificar os prefixos em `useHumanizedAssetIds.ts`:

```typescript
const CATEGORY_PREFIXES: Record<string, string> = {
  'notebook': 'NB',      // Seu prefixo aqui
  'desktop': 'DT',
  'servidor': 'SRV',
  'monitor': 'MON',
  'impressora': 'PRT',
  'router': 'RTR',
  'switch': 'SWT',
  'outro': 'OTH',
};
```

---

## 📈 Funcionalidades Principais

### Gerar ID Humanizado

```typescript
const { generateHumanizedId } = useHumanizedAssetIds();

const id = generateHumanizedId('notebook', 5); // Retorna: NB005
```

### Obter Próximo Número Sequencial

```typescript
const { getNextSequenceNumber } = useHumanizedAssetIds();

const nextNum = getNextSequenceNumber('notebook'); // Retorna: 3 (se há NB001, NB002)
```

### Sincronizar IDs com Banco de Dados

```typescript
const { syncHumanizedIds } = useHumanizedAssetIds();

const success = await syncHumanizedIds(); // Retorna: true/false
```

### Obter Estatísticas

```typescript
const { getStatsByCategory } = useHumanizedAssetIds();

// Retorna:
// {
//   notebook: { count: 5, ids: ['NB001', 'NB002', ...] },
//   desktop: { count: 3, ids: ['DT001', 'DT002', ...] },
//   ...
// }
```

---

## 🗄️ Schema do Banco de Dados

Certifique-se de que sua tabela `assets` tem estes campos:

```sql
ALTER TABLE assets ADD COLUMN IF NOT EXISTS humanized_id VARCHAR(20) UNIQUE;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Índice para busca rápida
CREATE INDEX idx_assets_humanized_id ON assets(humanized_id);
```

---

## 🎨 Cores por Categoria

As cores são aplicadas automaticamente no `HumanizedIdBadge`:

| Categoria | Cor | Prefixo |
|-----------|-----|----------|
| Notebook | Azul | NB |
| Desktop | Roxo | DT |
| Servidor | Vermelho | SRV |
| Monitor | Verde | MON |
| Impressora | Amarelo | PRT |
| Router | Índigo | RTR |
| Switch | Ciano | SWT |
| Outro | Cinza | OTH |

---

## 🔄 Fluxo de Sincronização

```
1. Usuário clica em "Sincronizar IDs" no admin panel
   ↓
2. Sistema lê todos os ativos do Supabase
   ↓
3. Agrupa por categoria
   ↓
4. Gera IDs humanizados sequenciais (NB001, NB002, etc.)
   ↓
5. Atualiza cada ativo no banco de dados
   ↓
6. Exibe toast com sucesso/erro
```

---

## 📝 Exemplo de Uso Completo

```tsx
import { useHumanizedAssetIds } from '@/hooks/useHumanizedAssetIds';
import { HumanizedIdBadge } from '@/components/shared/HumanizedIdBadge';

export function MyAssetList() {
  const { syncHumanizedIds, isGenerating } = useHumanizedAssetIds();
  const { assets } = useData();

  return (
    <div>
      <button 
        onClick={() => syncHumanizedIds()}
        disabled={isGenerating}
      >
        {isGenerating ? 'Sincronizando...' : 'Sincronizar IDs'}
      </button>

      <table>
        <tbody>
          {assets.map(asset => (
            <tr key={asset.id}>
              <td>
                <HumanizedIdBadge 
                  assetId={asset.id}
                  category={asset.categoria}
                  humanizedId={asset.humanizedId}
                />
              </td>
              <td>{asset.nome}</td>
              <td>{asset.responsavel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### "Erro ao sincronizar IDs"
- ✅ Verifique a conexão com Supabase
- ✅ Verifique as permissões da tabela `assets`
- ✅ Veja o console do navegador para detalhes

### "IDs não aparecem na listagem"
- ✅ Execute a sincronização primeiro
- ✅ Verifique se o campo `humanized_id` existe no banco
- ✅ Recarregue a página

### "Prefixos incorretos"
- ✅ Edite o `CATEGORY_PREFIXES` em `useHumanizedAssetIds.ts`
- ✅ Execute a sincronização novamente

---

## 📚 Referências

- Hook: `src/hooks/useHumanizedAssetIds.ts`
- Componente Panel: `src/components/admin/HumanizedIdsPanel.tsx`
- Badge: `src/components/shared/HumanizedIdBadge.tsx`
- Página Admin: `src/pages/AdminHumanizedIds.tsx`

---

**Status:** ✅ Pronto para Produção
**Versão:** 1.0.0
**Data:** 20/01/2026
