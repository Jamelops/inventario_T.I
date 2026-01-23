import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Asset, HardwareSpecs } from '@/types';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type DbAsset = Tables<'assets'>;
type DbAssetInsert = TablesInsert<'assets'>;
type DbAssetUpdate = TablesUpdate<'assets'>;

// Convert database asset to application Asset type
const dbToAsset = (dbAsset: DbAsset): Asset => ({
  id: dbAsset.id,
  nome: dbAsset.nome || '',
  categoria: (dbAsset.categoria as Asset['categoria']) || 'outros',
  status: (dbAsset.status as Asset['status']) || 'ativo',
  numeroSerie: dbAsset.numero_serie || '',
  dataCompra: dbAsset.data_compra || '',
  valor: dbAsset.valor || 0,
  localizacao: dbAsset.localizacao || '',
  responsavel: dbAsset.responsavel || '',
  descricao: dbAsset.descricao || undefined,
  fornecedor: dbAsset.fornecedor || undefined,
  tags: dbAsset.tags || undefined,
  especificacoes: dbAsset.especificacoes as HardwareSpecs | undefined,
  dataCriacao: dbAsset.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
  dataAtualizacao: dbAsset.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
});

// Convert application Asset to database insert type
const assetToDbInsert = (asset: Omit<Asset, 'id' | 'dataCriacao' | 'dataAtualizacao'>, userId: string): DbAssetInsert => ({
  nome: asset.nome,
  categoria: asset.categoria,
  status: asset.status,
  numero_serie: asset.numeroSerie,
  data_compra: asset.dataCompra,
  valor: asset.valor || 0,
  localizacao: asset.localizacao,
  responsavel: asset.responsavel,
  descricao: asset.descricao || null,
  fornecedor: asset.fornecedor || null,
  tags: asset.tags || null,
  especificacoes: asset.especificacoes ? JSON.parse(JSON.stringify(asset.especificacoes)) : null,
  created_by: userId,
  user_id: userId,
});

// Convert application Asset update to database update type
const assetToDbUpdate = (updates: Partial<Asset>): DbAssetUpdate => {
  const dbUpdate: DbAssetUpdate = {};

  if (updates.nome !== undefined) dbUpdate.nome = updates.nome;
  if (updates.categoria !== undefined) dbUpdate.categoria = updates.categoria;
  if (updates.status !== undefined) dbUpdate.status = updates.status;
  if (updates.numeroSerie !== undefined) dbUpdate.numero_serie = updates.numeroSerie;
  if (updates.dataCompra !== undefined) dbUpdate.data_compra = updates.dataCompra;
  if (updates.valor !== undefined) dbUpdate.valor = updates.valor || 0;
  if (updates.localizacao !== undefined) dbUpdate.localizacao = updates.localizacao;
  if (updates.responsavel !== undefined) dbUpdate.responsavel = updates.responsavel;
  if (updates.descricao !== undefined) dbUpdate.descricao = updates.descricao || null;
  if (updates.fornecedor !== undefined) dbUpdate.fornecedor = updates.fornecedor || null;
  if (updates.tags !== undefined) dbUpdate.tags = updates.tags || null;
  if (updates.especificacoes !== undefined) dbUpdate.especificacoes = updates.especificacoes ? JSON.parse(JSON.stringify(updates.especificacoes)) : null;

  return dbUpdate;
};

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isApproved } = useAuth();

  const fetchAssets = useCallback(async () => {
    if (!user || !isApproved) {
      setAssets([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets((data || []).map(dbToAsset));
    } catch (error: unknown) {
      console.error('Error fetching assets:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar ativos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, isApproved]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const addAsset = async (asset: Omit<Asset, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Asset | null> => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('assets')
        .insert(assetToDbInsert(asset, user.id))
        .select()
        .single();

      if (error) throw error;

      const newAsset = dbToAsset(data);
      setAssets(prev => [newAsset, ...prev]);
      toast({
        title: 'Sucesso',
        description: 'Ativo criado com sucesso',
      });
      return newAsset;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      console.error('Error adding asset:', error);
      toast({
        title: 'Erro',
        description: `Erro ao criar ativo: ${message}`,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateAsset = async (id: string, updates: Partial<Asset>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('assets')
        .update(assetToDbUpdate(updates))
        .eq('id', id);

      if (error) throw error;

      setAssets(prev => prev.map(asset =>
        asset.id === id
          ? { ...asset, ...updates, dataAtualizacao: new Date().toISOString().split('T')[0] }
          : asset
      ));
      toast({
        title: 'Sucesso',
        description: 'Ativo atualizado com sucesso',
      });
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      console.error('Error updating asset:', error);
      toast({
        title: 'Erro',
        description: `Erro ao atualizar ativo: ${message}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteAsset = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAssets(prev => prev.filter(asset => asset.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Ativo excluído com sucesso',
      });
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      console.error('Error deleting asset:', error);
      toast({
        title: 'Erro',
        description: `Erro ao excluir ativo: ${message}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  const getAssetById = (id: string): Asset | undefined => {
    return assets.find(asset => asset.id === id);
  };

  return {
    assets,
    loading,
    addAsset,
    updateAsset,
    deleteAsset,
    getAssetById,
    refetch: fetchAssets,
  };
}
