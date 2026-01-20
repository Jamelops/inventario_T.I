import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Eye, Edit, Wrench, Archive, MoreHorizontal } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { categoryLabels, AssetCategory, AssetStatus, statusLabels } from '@/types';
import { exportToExcel, formatCurrency, ExportColumn } from '@/lib/export-to-excel';

export default function Assets() {
  const { assets, assetsLoading } = useData();
  const { canEdit } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const userCanEdit = canEdit();

  if (assetsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.nome.toLowerCase().includes(search.toLowerCase()) ||
      asset.id.toLowerCase().includes(search.toLowerCase()) ||
      asset.numeroSerie.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || asset.categoria === categoryFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleExportToExcel = async () => {
    const columns: ExportColumn[] = [
      { header: 'ID', key: 'id' },
      { header: 'Nome', key: 'nome' },
      { 
        header: 'Categoria', 
        key: 'categoria',
        format: (value: any) => {
          return categoryLabels[value as AssetCategory] || value;
        }
      },
      { 
        header: 'Status', 
        key: 'status',
        format: (value: any) => {
          return statusLabels[value as AssetStatus] || value;
        }
      },
      { header: 'Responsável', key: 'responsavel' },
      { 
        header: 'Valor', 
        key: 'valor',
        format: (value: any) => formatCurrency(value)
      },
    ];

    await exportToExcel(filteredAssets, columns, { filename: 'ativos', toast });
  };

  return (
    <>
      <PageHeader 
        title="Inventário de Ativos"
        description={`${assets.length} ativos cadastrados`}
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportToExcel}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar para Excel
            </Button>
            <Button 
              size="sm"
              onClick={() => navigate('/assets/new')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Ativo
            </Button>
          </div>
        }
      />
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search and Filters Row */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, ID ou número de série..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {filteredAssets.length === 0 ? (
              <EmptyState 
                title="Nenhum ativo encontrado"
                description="Comece adicionando um novo ativo ao sistema"
                action={() => navigate('/assets/new')}
                actionLabel="Novo Ativo"
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map(asset => (
                      <TableRow 
                        key={asset.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/assets/${asset.id}`)}
                      >
                        <TableCell className="font-mono text-sm">{asset.id}</TableCell>
                        <TableCell className="font-medium">{asset.nome}</TableCell>
                        <TableCell>{categoryLabels[asset.categoria]}</TableCell>
                        <TableCell>
                          <StatusBadge status={asset.status} />
                        </TableCell>
                        <TableCell>{asset.responsavel}</TableCell>
                        <TableCell>R$ {asset.valor.toLocaleString('pt-BR')}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  navigate(`/assets/${asset.id}`); 
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              {userCanEdit && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      navigate(`/assets/${asset.id}/edit`); 
                                    }}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Wrench className="w-4 h-4 mr-2" />
                                    Manutenção
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Archive className="w-4 h-4 mr-2" />
                                    Arquivar
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
