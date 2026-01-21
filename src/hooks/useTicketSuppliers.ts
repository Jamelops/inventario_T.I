import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type DbTicketSupplier = Tables<'ticket_suppliers'>;
type DbTicketSupplierInsert = TablesInsert<'ticket_suppliers'>;
type DbTicketSupplierUpdate = TablesUpdate<'ticket_suppliers'>;

export interface TicketSupplier {
  id: string;
  nome: string;
  categoria: 'operadora' | 'prodata' | 'fornecedor_ti' | 'outro';
  slaHoras: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

const dbToSupplier = (db: DbTicketSupplier): TicketSupplier => ({
  id: db.id,
  nome: db.nome,
  categoria: db.categoria,
  slaHoras: db.sla_horas,
  ativo: db.ativo,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

const supplierToDbInsert = (
  supplier: Omit<TicketSupplier, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): DbTicketSupplierInsert => ({
  nome: supplier.nome,
  categoria: supplier.categoria,
  sla_horas: supplier.slaHoras,
  ativo: supplier.ativo,
  created_by: userId,
});

const supplierToDbUpdate = (updates: Partial<TicketSupplier>): DbTicketSupplierUpdate => {
  const dbUpdates: DbTicketSupplierUpdate = {};
  if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
  if (updates.categoria !== undefined) dbUpdates.categoria = updates.categoria;
  if (updates.slaHoras !== undefined) dbUpdates.sla_horas = updates.slaHoras;
  if (updates.ativo !== undefined) dbUpdates.ativo = updates.ativo;
  return dbUpdates;
};

export function useTicketSuppliers() {
  const [suppliers, setSuppliers] = useState<TicketSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ticket_suppliers')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setSuppliers((data || []).map(dbToSupplier));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to fetch suppliers:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSuppliers();
    }
  }, [user, fetchSuppliers]);

  const addSupplier = async (
    supplier: Omit<TicketSupplier, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TicketSupplier | null> => {
    if (!user) return null;

    try {
      const dbInsert = supplierToDbInsert(supplier, user.id);
      const { data, error } = await supabase
        .from('ticket_suppliers')
        .insert(dbInsert)
        .select()
        .single();

      if (error) throw error;

      const newSupplier = dbToSupplier(data);
      setSuppliers((prev) => [...prev, newSupplier].sort((a, b) => a.nome.localeCompare(b.nome)));
      return newSupplier;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to add supplier:', error);
      }
      return null;
    }
  };

  const updateSupplier = async (id: string, updates: Partial<TicketSupplier>): Promise<boolean> => {
    try {
      const dbUpdates = supplierToDbUpdate(updates);
      const { error } = await supabase.from('ticket_suppliers').update(dbUpdates).eq('id', id);

      if (error) throw error;

      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
        )
      );
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to update supplier:', error);
      }
      return false;
    }
  };

  const deleteSupplier = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('ticket_suppliers').delete().eq('id', id);

      if (error) throw error;

      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to delete supplier:', error);
      }
      return false;
    }
  };

  const getSupplierById = (id: string): TicketSupplier | undefined => {
    return suppliers.find((s) => s.id === id);
  };

  return {
    suppliers,
    loading,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    refetch: fetchSuppliers,
  };
}
