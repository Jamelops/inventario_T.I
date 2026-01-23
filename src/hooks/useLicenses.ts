import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { License } from '@/types';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type DbLicense = Tables<'licenses'>;
type DbLicenseInsert = TablesInsert<'licenses'>;
type DbLicenseUpdate = TablesUpdate<'licenses'>;

const dbToLicense = (dbLicense: DbLicense): License => ({
  id: dbLicense.id,
  nome: dbLicense.nome,
  tipo: dbLicense.tipo,
  quantidadeTotal: dbLicense.quantidade_total,
  quantidadeUsada: dbLicense.quantidade_usada,
  dataVencimento: dbLicense.data_vencimento,
  status: dbLicense.status as any,
  fornecedor: dbLicense.fornecedor || undefined,
  chave: dbLicense.chave || undefined,
  notas: dbLicense.notas || undefined,
  dataCriacao: dbLicense.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
  dataAtualizacao: dbLicense.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
});

const licenseToDbInsert = (license: Omit<License, 'id' | 'dataCriacao' | 'dataAtualizacao'>, userId: string): DbLicenseInsert => ({
  nome: license.nome,
  tipo: license.tipo,
  quantidade_total: license.quantidadeTotal,
  quantidade_usada: license.quantidadeUsada,
  data_vencimento: license.dataVencimento,
  status: license.status,
  fornecedor: license.fornecedor || null,
  chave: license.chave || null,
  notas: license.notas || null,
  created_by: userId,
});

const licenseToDbUpdate = (updates: Partial<License>): DbLicenseUpdate => {
  const dbUpdate: DbLicenseUpdate = {};

  if (updates.nome !== undefined) dbUpdate.nome = updates.nome;
  if (updates.tipo !== undefined) dbUpdate.tipo = updates.tipo;
  if (updates.quantidadeTotal !== undefined) dbUpdate.quantidade_total = updates.quantidadeTotal;
  if (updates.quantidadeUsada !== undefined) dbUpdate.quantidade_usada = updates.quantidadeUsada;
  if (updates.dataVencimento !== undefined) dbUpdate.data_vencimento = updates.dataVencimento;
  if (updates.status !== undefined) dbUpdate.status = updates.status;
  if (updates.fornecedor !== undefined) dbUpdate.fornecedor = updates.fornecedor || null;
  if (updates.chave !== undefined) dbUpdate.chave = updates.chave || null;
  if (updates.notas !== undefined) dbUpdate.notas = updates.notas || null;

  return dbUpdate;
};

export function useLicenses() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isApproved } = useAuth();

  const fetchLicenses = useCallback(async () => {
    if (!user || !isApproved) {
      setLicenses([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLicenses((data || []).map(dbToLicense));
    } catch (error: any) {
      console.error('Error fetching licenses:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar licenças',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, isApproved]);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  const addLicense = async (license: Omit<License, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<License | null> => {
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
        .from('licenses')
        .insert(licenseToDbInsert(license, user.id))
        .select()
        .single();

      if (error) throw error;

      const newLicense = dbToLicense(data);
      setLicenses(prev => [newLicense, ...prev]);
      toast({
        title: 'Sucesso',
        description: 'Licença criada com sucesso',
      });
      return newLicense;
    } catch (error: any) {
      console.error('Error adding license:', error);
      toast({
        title: 'Erro',
        description: `Erro ao criar licença: ${error.message}`,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateLicense = async (id: string, updates: Partial<License>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('licenses')
        .update(licenseToDbUpdate(updates))
        .eq('id', id);

      if (error) throw error;

      setLicenses(prev => prev.map(license =>
        license.id === id
          ? { ...license, ...updates, dataAtualizacao: new Date().toISOString().split('T')[0] }
          : license
      ));
      toast({
        title: 'Sucesso',
        description: 'Licença atualizada com sucesso',
      });
      return true;
    } catch (error: any) {
      console.error('Error updating license:', error);
      toast({
        title: 'Erro',
        description: `Erro ao atualizar licença: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteLicense = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('licenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLicenses(prev => prev.filter(license => license.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Licença excluída com sucesso',
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting license:', error);
      toast({
        title: 'Erro',
        description: `Erro ao excluir licença: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  const getLicenseById = (id: string): License | undefined => {
    return licenses.find(license => license.id === id);
  };

  return {
    licenses,
    loading,
    addLicense,
    updateLicense,
    deleteLicense,
    getLicenseById,
    refetch: fetchLicenses,
  };
}
