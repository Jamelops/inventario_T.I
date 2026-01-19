import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from './useToast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export const useRenumberIds = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  const renumber = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Buscar seções
      const { data: sections, error: fetchError } = await supabase
        .from('sections')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      if (!sections || sections.length === 0) {
        toast.warning('Nenhuma seção encontrada');
        setIsLoading(false);
        return;
      }

      toast.info(`Encontradas ${sections.length} seções. Processando...`);

      // Criar mapa de IDs antigos -> novos
      const idMap: Record<string, number> = {};
      sections.forEach((section, index) => {
        idMap[section.id] = index + 1;
      });

      // Atualizar seções
      let updatedCount = 0;
      for (const section of sections) {
        const newId = idMap[section.id];
        const { error: updateError } = await supabase
          .from('sections')
          .update({ id: newId, display_id: newId })
          .eq('id', section.id);

        if (updateError) throw updateError;
        updatedCount++;
      }

      toast.success(`✅ ${updatedCount} seções renumeradas`);

      // Atualizar referências em outras tabelas
      const { data: references, error: refFetchError } = await supabase
        .from('content')
        .select('id, section_id');

      if (refFetchError) throw refFetchError;

      let referencesUpdated = 0;
      if (references && references.length > 0) {
        for (const ref of references) {
          if (ref.section_id && idMap[ref.section_id]) {
            const { error: refError } = await supabase
              .from('content')
              .update({ section_id: idMap[ref.section_id] })
              .eq('id', ref.id);

            if (refError) throw refError;
            referencesUpdated++;
          }
        }
        toast.success(`✅ ${referencesUpdated} referências atualizadas`);
      }

      setSuccess(true);
      toast.success('🎉 Renumeração concluída com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`❌ Erro: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { renumber, isLoading, error, success };
};
