import { useState } from 'react';
import { useHumanizedAssetIds } from '@/hooks/useHumanizedAssetIds';
import { AlertCircle, CheckCircle, Loader2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const HumanizedIdsPanel = () => {
  const { syncHumanizedIds, isGenerating, getStatsByCategory, CATEGORY_PREFIXES } =
    useHumanizedAssetIds();

  const [showConfirm, setShowConfirm] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const stats = getStatsByCategory;

  const handleSync = async () => {
    setShowConfirm(false);
    const success = await syncHumanizedIds();
    setSyncSuccess(success);
    if (success) {
      setTimeout(() => setSyncSuccess(false), 5000);
    }
  };

  const totalAssets = Object.values(stats).reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="space-y-6">
      {/* Main Sync Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🔢</span>
            Sincronizar IDs Humanizados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Warning */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                  ⚠️ Operação de Sincronização
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Isso irá gerar e sincronizar IDs humanizados para {totalAssets} ativo(s) no banco
                  de dados.
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              ℹ️ Formato dos IDs:
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-300">
              {Object.entries(CATEGORY_PREFIXES)
                .slice(0, 6)
                .map(([key, prefix]) => (
                  <div key={key}>
                    <span className="font-mono font-bold">{prefix}###</span> - {key}
                  </div>
                ))}
            </div>
          </div>

          {/* Success State */}
          {syncSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-emerald-900 dark:text-emerald-200">
                    ✅ Sincronização Concluída!
                  </h3>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300 mt-1">
                    Todos os IDs humanizados foram sincronizados com sucesso.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Dialog */}
          {showConfirm ? (
            <div className="p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Confirmar sincronização de IDs humanizados?
              </h3>
              <div className="flex gap-3">
                <Button
                  onClick={handleSync}
                  disabled={isGenerating}
                  className="flex-1 gap-2"
                  variant="destructive"
                >
                  {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isGenerating ? 'Processando...' : 'Sim, Sincronizar'}
                </Button>
                <Button
                  onClick={() => setShowConfirm(false)}
                  disabled={isGenerating}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={isGenerating}
              className="w-full gap-2"
              size="lg"
            >
              {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
              {isGenerating ? 'Sincronizando...' : '🔄 Sincronizar IDs Agora'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Estatísticas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(CATEGORY_PREFIXES).map(([category, prefix]) => {
              const categoryStats = stats[category];
              return (
                <div
                  key={category}
                  className="p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white capitalize">
                      {category}
                    </span>
                    <span className="text-2xl font-bold text-primary">{categoryStats.count}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-mono font-bold text-primary">{prefix}</span> -{' '}
                    {categoryStats.count > 0
                      ? `${prefix}001 até ${prefix}${categoryStats.count.toString().padStart(3, '0')}`
                      : 'Sem ativos'}
                  </div>
                  {categoryStats.ids.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">
                        IDs Gerados:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {categoryStats.ids.slice(0, 5).map((id) => (
                          <span
                            key={id}
                            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded font-mono"
                          >
                            {id}
                          </span>
                        ))}
                        {categoryStats.ids.length > 5 && (
                          <span className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400">
                            +{categoryStats.ids.length - 5} mais
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6 p-4 bg-gray-100 dark:bg-slate-900 rounded-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{totalAssets}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total de Ativos no Sistema
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">✨ IDs Humanizados:</p>
            <p>
              Cada ativo recebe um ID fácil de ler baseado em sua categoria, como NB001, DT002,
              SRV001.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">🔄 Sincronização:</p>
            <p>
              A sincronização gera automaticamente os IDs humanizados e os salva no banco de dados.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">📊 Agrupamento:</p>
            <p>Os IDs são agrupados por categoria com numeração sequencial (001, 002, 003...).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
