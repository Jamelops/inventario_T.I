import { useState } from 'react';
import { useRenumberIds } from '@/hooks/useRenumberIds';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export const RenumberIdsPanel = () => {
  const { renumber, isLoading, error, success } = useRenumberIds();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = async () => {
    setShowConfirm(false);
    await renumber();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🔢 Renumerar IDs de Seções
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Converter IDs de UUIDs para números sequenciais (1, 2, 3...)
        </p>
      </div>

      {/* Warning Box */}
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
              ⚠️ Ação Irreversível
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-300 mb-2">
              Esta operação irá renumerar todos os IDs de seções no banco de dados.
            </p>
            <ul className="text-sm text-amber-800 dark:text-amber-300 list-disc list-inside space-y-1">
              <li>Faça um backup antes</li>
              <li>A operação não pode ser desfeita automaticamente</li>
              <li>Todas as referências serão atualizadas automaticamente</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
          ✍️ O que acontecerá:
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
          <li>IDs serão renumerados de 1 em diante</li>
          <li>Ordem: criadas mais antigas primeiro</li>
          <li>Referências em outras tabelas serão atualizadas</li>
          <li>Toast notifications mostrarão progresso</li>
        </ul>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                ❌ Erro
              </h3>
              <p className="text-sm text-red-800 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-200">
                ✅ Renumeração Concluída!
              </h3>
              <p className="text-sm text-emerald-800 dark:text-emerald-300 mt-1">
                Todos os IDs foram renumerados com sucesso. Verifique os toast notifications para detalhes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Tem certeza? Esta ação não pode ser desfeita.
          </h3>
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Processando...' : 'Sim, Renumerar Agora'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:bg-gray-400 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Main Button */}
      {!showConfirm && !success && (
        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLoading ? 'Processando...' : '🔄 Iniciar Renumeração'}
          </button>
        </div>
      )}

      {/* Success Action Button */}
      {success && (
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
          >
            🔄 Recarregar Página
          </button>
          <button
            onClick={() => {
              setShowConfirm(false);
              // Reset states
              window.location.href = '/';
            }}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
          >
            ↗️ Ir para Home
          </button>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-6 p-4 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
        <p className="font-semibold mb-2">📚 Informações Técnicas:</p>
        <ul className="space-y-1 list-disc list-inside text-xs">
          <li>Conectado ao Supabase automaticamente</li>
          <li>Toast notifications mostram progresso em tempo real</li>
          <li>Referências em outras tabelas são atualizadas automaticamente</li>
          <li>Veã o console do navegador para detalhes técnicos</li>
        </ul>
      </div>
    </div>
  );
};
