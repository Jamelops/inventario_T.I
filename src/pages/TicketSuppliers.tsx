import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTickets } from "@/hooks/useTicketsContext";
import { useToast } from "@/hooks/use-toast";
import { TicketSupplier } from '@/hooks/useTicketSuppliers';

export default function TicketSuppliers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useTickets();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<TicketSupplier | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "fornecedor_ti" as TicketSupplier["categoria"],
    slaHoras: 24,
    ativo: true,
  });

  const openNewDialog = () => {
    setEditingSupplier(null);
    setFormData({ nome: "", categoria: "fornecedor_ti", slaHoras: 24, ativo: true });
    setIsDialogOpen(true);
  };

  const openEditDialog = (supplier: TicketSupplier) => {
    setEditingSupplier(supplier);
    setFormData({
      nome: supplier.nome,
      categoria: supplier.categoria,
      slaHoras: supplier.slaHoras,
      ativo: supplier.ativo,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, formData);
      toast({ title: "Fornecedor atualizado", description: `${formData.nome} foi atualizado.` });
    } else {
      await addSupplier(formData);
      toast({ title: "Fornecedor adicionado", description: `${formData.nome} foi adicionado.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (supplier: { id: string; nome: string }) => {
    const success = await deleteSupplier(supplier.id);
    if (success) {
      toast({ title: "Fornecedor removido", description: `${supplier.nome} foi removido.` });
    } else {
      toast({ title: "Erro", description: "Não foi possível remover o fornecedor.", variant: "destructive" });
    }
  };

  const supplierCategoryLabels: Record<string, string> = {
    operadora: 'Operadora',
    prodata: 'Prodata',
    fornecedor_ti: 'Fornecedor de TI',
    outro: 'Outro',
  };

  const groupedSuppliers = suppliers.reduce((acc, s) => {
    if (!acc[s.categoria]) acc[s.categoria] = [];
    acc[s.categoria].push(s);
    return acc;
  }, {} as Record<string, TicketSupplier[]>);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fornecedores de Chamados"
        description="Gerencie os fornecedores disponíveis para chamados de suporte"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Configurações", href: "/settings" },
          { label: "Fornecedores" },
        ]}
        actions={
          <Button onClick={openNewDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Fornecedor
          </Button>
        }
      />

      {Object.entries(groupedSuppliers).map(([categoria, categorySuppliers]) => (
        <Card key={categoria}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {supplierCategoryLabels[categoria as keyof typeof supplierCategoryLabels]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categorySuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{supplier.nome}</span>
                    <Badge variant="outline">SLA: {supplier.slaHoras}h</Badge>
                    {!supplier.ativo && <Badge variant="secondary">Inativo</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(supplier)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(supplier)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSupplier ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do fornecedor"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(v) => setFormData({ ...formData, categoria: v as typeof formData.categoria })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(supplierCategoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>SLA (horas)</Label>
              <Input
                type="number"
                value={formData.slaHoras}
                onChange={(e) => setFormData({ ...formData, slaHoras: parseInt(e.target.value) || 24 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.ativo}
                onCheckedChange={(v) => setFormData({ ...formData, ativo: v })}
              />
              <Label>Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}