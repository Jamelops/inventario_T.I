import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Category } from '@/types';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type DbCategory = Tables<'categories'>;
type DbCategoryInsert = TablesInsert<'categories'>;
type DbCategoryUpdate = TablesUpdate<'categories'>;

const dbToCategory = (dbCategory: DbCategory): Category => ({
  id: dbCategory.id,
  nome: dbCategory.nome,
  descricao: dbCategory.descricao || undefined,
  cor: dbCategory.cor || '#6B7280',
});

const categoryToDbInsert = (category: Omit<Category, 'id'>): DbCategoryInsert => ({
  nome: category.nome,
  descricao: category.descricao || null,
  cor: category.cor || '#6B7280',
});

const categoryToDbUpdate = (updates: Partial<Category>): DbCategoryUpdate => {
  const dbUpdate: DbCategoryUpdate = {};

  if (updates.nome !== undefined) dbUpdate.nome = updates.nome;
  if (updates.descricao !== undefined) dbUpdate.descricao = updates.descricao || null;
  if (updates.cor !== undefined) dbUpdate.cor = updates.cor || '#6B7280';

  return dbUpdate;
};

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isApproved } = useAuth();

  const fetchCategories = useCallback(async () => {
    if (!user || !isApproved) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setCategories((data || []).map(dbToCategory));
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, [user, isApproved]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (category: Omit<Category, 'id'>): Promise<Category | null> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryToDbInsert(category))
        .select()
        .single();

      if (error) throw error;

      const newCategory = dbToCategory(data);
      setCategories((prev) => [...prev, newCategory].sort((a, b) => a.nome.localeCompare(b.nome)));
      toast.success('Categoria criada com sucesso');
      return newCategory;
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error('Erro ao criar categoria: ' + error.message);
      return null;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(categoryToDbUpdate(updates))
        .eq('id', id);

      if (error) throw error;

      setCategories((prev) =>
        prev.map((category) => (category.id === id ? { ...category, ...updates } : category))
      );
      toast.success('Categoria atualizada com sucesso');
      return true;
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error('Erro ao atualizar categoria: ' + error.message);
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);

      if (error) throw error;

      setCategories((prev) => prev.filter((category) => category.id !== id));
      toast.success('Categoria excluída com sucesso');
      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao excluir categoria: ' + error.message);
      return false;
    }
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
}
