import { HumanizedIdsPanel } from '@/components/admin/HumanizedIdsPanel';
import { PageHeader } from '@/components/shared/PageHeader';

/**
 * Página de Administração - IDs Humanizados
 * 
 * Rota sugerida: /admin/humanized-ids
 * 
 * Exemplo de uso:
 * 1. Adicione no seu router:
 *    import { AdminHumanizedIds } from '@/pages/AdminHumanizedIds';
 *    
 *    {
 *      path: '/admin/humanized-ids',
 *      element: <AdminHumanizedIds />,
 *      // adicione autenticação/autorização se necessário
 *    }
 * 
 * 2. Acesse via: http://localhost:5173/admin/humanized-ids
 */
export const AdminHumanizedIds = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gerenciar IDs Humanizados"
        description="Sincronize e configure IDs humanizados para seus ativos (NB001, DT002, etc.)"
      />
      <HumanizedIdsPanel />
    </div>
  );
};
