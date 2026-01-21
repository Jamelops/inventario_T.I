import { useState, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from './useToast';
import { useData } from '@/contexts/DataContext';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

interface HumanizedIdMap {
  [key: string]: {
    [key: string]: string; // prefix -> humanizedId
  };
}

// Mapa de categorias para prefixos humanizados
const CATEGORY_PREFIXES: Record<string, string> = {
  notebook: 'NB', // Notebook
  desktop: 'DT', // Desktop
  servidor: 'SRV', // Servidor
  monitor: 'MON', // Monitor
  teclado: 'KBD', // Keyboard
  mouse: 'MSE', // Mouse
  impressora: 'PRT', // Printer
  router: 'RTR', // Router
  switch: 'SWT', // Switch
  outro: 'OTH', // Other
};

export const useHumanizedAssetIds = () => {
  const { assets } = useData();
  const toast = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Gera um ID humanizado para um ativo
   * Exemplo: NB001, DT002, SRV001
   */
  const generateHumanizedId = useCallback((category: string, sequenceNumber: number): string => {
    const prefix = CATEGORY_PREFIXES[category] || CATEGORY_PREFIXES['outro'];
    return `${prefix}${sequenceNumber.toString().padStart(3, '0')}`;
  }, []);

  /**
   * Calcula o próximo número sequencial para uma categoria
   */
  const getNextSequenceNumber = useCallback(
    (category: string): number => {
      const assetsInCategory = assets.filter((a) => a.categoria === category);
      const humanizedIds = assetsInCategory
        .map((a) => a.humanizedId || '')
        .filter((id) => id.startsWith(CATEGORY_PREFIXES[category] || CATEGORY_PREFIXES['outro']));

      if (humanizedIds.length === 0) return 1;

      // Extrai números dos IDs humanizados
      const numbers = humanizedIds
        .map((id) => parseInt(id.replace(/[A-Z]/g, ''), 10))
        .filter((n) => !isNaN(n))
        .sort((a, b) => b - a);

      return numbers.length > 0 ? numbers[0] + 1 : 1;
    },
    [assets]
  );

  /**
   * Gera IDs humanizados para todos os ativos
   * Agrupa por categoria e numera sequencialmente
   */
  const generateAllHumanizedIds = useCallback((): HumanizedIdMap => {
    const idMap: HumanizedIdMap = {};
    const sequenceCounters: Record<string, number> = {};

    // Inicializar contadores
    Object.keys(CATEGORY_PREFIXES).forEach((category) => {
      sequenceCounters[category] = 1;
    });

    assets.forEach((asset) => {
      const category = asset.categoria;
      const sequence = sequenceCounters[category] || 1;
      const humanizedId = generateHumanizedId(category, sequence);

      idMap[asset.id] = {
        humanizedId,
        category,
        sequence: sequence.toString(),
      };

      sequenceCounters[category]++;
    });

    return idMap;
  }, [assets, generateHumanizedId]);

  /**
   * Busca o ID humanizado de um ativo pelo ID interno
   */
  const getHumanizedId = useCallback(
    (assetId: string): string => {
      const asset = assets.find((a) => a.id === assetId);
      return asset?.humanizedId || 'N/A';
    },
    [assets]
  );

  /**
   * Retorna estatísticas de IDs humanizados por categoria
   */
  const getStatsByCategory = useMemo(() => {
    const stats: Record<string, { count: number; ids: string[] }> = {};

    Object.keys(CATEGORY_PREFIXES).forEach((category) => {
      const categoryAssets = assets.filter((a) => a.categoria === category);
      stats[category] = {
        count: categoryAssets.length,
        ids: categoryAssets
          .map((a) => a.humanizedId || '')
          .filter((id) => id.length > 0)
          .sort(),
      };
    });

    return stats;
  }, [assets]);

  /**
   * Sincroniza IDs humanizados no banco de dados
   */
  const syncHumanizedIds = async (): Promise<boolean> => {
    setIsGenerating(true);
    try {
      const idMap = generateAllHumanizedIds();
      let updated = 0;
      let failed = 0;

      toast.info('🔄 Sincronizando IDs humanizados...');

      for (const [assetId, data] of Object.entries(idMap)) {
        const { error } = await supabase
          .from('assets')
          .update({
            humanized_id: data.humanizedId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', assetId);

        if (error) {
          failed++;
          console.error(`Erro ao atualizar ${assetId}:`, error);
        } else {
          updated++;
        }
      }

      if (failed === 0) {
        toast.success(`✅ ${updated} ativos sincronizados com sucesso!`);
        return true;
      } else {
        toast.warning(`⚠️ ${updated} sincronizados, ${failed} falharam`);
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`❌ Erro: ${message}`);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateHumanizedId,
    getNextSequenceNumber,
    generateAllHumanizedIds,
    getHumanizedId,
    getStatsByCategory,
    syncHumanizedIds,
    isGenerating,
    CATEGORY_PREFIXES,
  };
};
