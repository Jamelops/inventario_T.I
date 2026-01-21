import { RenumberIdsPanel } from '@/components/admin/RenumberIdsPanel';

/**
 * Página de Administração - Renumerar IDs
 *
 * Rota sugerida: /admin/renumber-ids
 *
 * Exemplo de uso:
 * 1. Adicione no seu router:
 *    import { AdminRenumberIds } from '@/pages/AdminRenumberIds';
 *
 *    {
 *      path: '/admin/renumber-ids',
 *      element: <AdminRenumberIds />,
 *      // adicione autenticação/autorização se necessário
 *    }
 *
 * 2. Acesse via: http://localhost:5173/admin/renumber-ids
 */
export const AdminRenumberIds = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          💫 Painel Administrativo
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Gerenciar IDs e configurações do banco de dados
        </p>
      </div>

      {/* Main Content */}
      <RenumberIdsPanel />

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>🔐 Este painel requer permissão de administrador</p>
        <p className="mt-2">Data: {new Date().toLocaleDateString('pt-BR')}</p>
      </div>
    </div>
  );
};
