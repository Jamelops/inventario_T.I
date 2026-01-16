import { useState } from 'react';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/types';

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory, assets } = useData();
  const { canEdit } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '' });

  const userCanEdit = canEdit();

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ nome: category.nome, descricao: category.descricao || '' });
    } else {
      setEditingCategory(null);
      setFormData({ nome: '', descricao: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({ nome: '', descricao: '' });
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome da categoria é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (editingCategory) {
      const success = await updateCategory(editingCategory.id, {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || undefined,
      });
      if (success) {
        toast({
          title: 'Categoria atualizada',
          description: `${formData.nome} foi atualizada com sucesso.`,
        });
      }
    } else {
      const newCat = await addCategory({
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || undefined,
      });
      if (newCat) {
        toast({
          title: 'Categoria criada',
          description: `${formData.nome} foi adicionada com sucesso.`,
        });
      }
    }
    handleCloseDialog();
  };

  const handleOpenDeleteDialog = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deletingCategory) {
      const assetsUsingCategory = assets.filter(a => a.categoria === deletingCategory.id);
      if (assetsUsingCategory.length > 0) {
        toast({
          title: 'Não é possível excluir',
          description: `Esta categoria possui ${assetsUsingCategory.length} ativo(s) associado(s).`,
          variant: 'destructive',
        });
      } else {
        const success = await deleteCategory(deletingCategory.id);
        if (success) {
          toast({
            title: 'Categoria excluída',
            description: `${deletingCategory.nome} foi excluída com sucesso.`,
          });
        }
      }
    }
    setIsDeleteDialogOpen(false);
    setDeletingCategory(null);
  };

  const getCategoryAssetCount = (categoryId: string) => {
    return assets.filter(a => a.categoria === categoryId).length;
  };

  return (
    <div>
      <PageHeader
        title="Categorias de Ativos"
        description="Gerencie as categorias disponíveis para classificar os ativos"
        breadcrumbs={[{ label: 'Configurações', href: '/settings' }, { label: 'Categorias' }]}
        actions={
          userCanEdit && (
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          )
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const assetCount = getCategoryAssetCount(category.id);
          return (
            <Card key={category.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FolderOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{category.nome}</CardTitle>
                      <CardDescription className="text-xs">
                        {assetCount} {assetCount === 1 ? 'ativo' : 'ativos'}
                      </CardDescription>
                    </div>
                  </div>
                  {userCanEdit && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleOpenDeleteDialog(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              {category.descricao && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{category.descricao}</p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Dialog de Criação/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Atualize as informações da categoria'
                : 'Preencha os dados para criar uma nova categoria'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Categoria</Label>
              <Input
                id="nome"
                placeholder="Ex: Smartphones"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva brevemente esta categoria..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingCategory ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A categoria "{deletingCategory?.nome}" será
              permanentemente removida do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
