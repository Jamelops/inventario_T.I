import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Category } from '@/types';

type DbCategory = Tables<'asset_categories'>;
type DbCategoryInsert = TablesInsert<'asset_categories'>;
type DbCategoryUpdate = TablesUpdate<'asset_categories'>;

const dbToCategory = (db: DbCategory): Category => ({
  id: db.id,
  nome: db.nome,
  descricao: db.descricao || undefined,
  icone: db.icone || undefined,
});

const categoryToDbInsert = (
  category: Omit<Category, 'id'>,
  userId: string
): DbCategoryInsert => ({
  nome: category.nome,
  descricao: category.descricao || null,
  icone: category.icone || null,
  created_by: userId,
});

const categoryToDbUpdate = (updates: Partial<Category>): DbCategoryUpdate => {
  const dbUpdates: DbCategoryUpdate = {};
  if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
  if (updates.descricao !== undefined) dbUpdates.descricao = updates.descricao || null;
  if (updates.icone !== undefined) dbUpdates.icone = updates.icone || null;
  return dbUpdates;
};

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('asset_categories')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setCategories((data || []).map(dbToCategory));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to fetch categories:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user, fetchCategories]);

  const addCategory = async (
    category: Omit<Category, 'id'>
  ): Promise<Category | null> => {
    if (!user) return null;

    try {
      const dbInsert = categoryToDbInsert(category, user.id);
      const { data, error } = await supabase
        .from('asset_categories')
        .insert(dbInsert)
        .select()
        .single();

      if (error) throw error;

      const newCategory = dbToCategory(data);
      setCategories((prev) => [...prev, newCategory].sort((a, b) => a.nome.localeCompare(b.nome)));
      return newCategory;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to add category:', error);
      }
      return null;
    }
  };

  const updateCategory = async (
    id: string,
    updates: Partial<Category>
  ): Promise<boolean> => {
    try {
      const dbUpdates = categoryToDbUpdate(updates);
      const { error } = await supabase
        .from('asset_categories')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to update category:', error);
      }
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('asset_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to delete category:', error);
      }
      return false;
    }
  };

  const getCategoryById = (id: string): Category | undefined => {
    return categories.find((c) => c.id === id);
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    refetch: fetchCategories,
  };
}
