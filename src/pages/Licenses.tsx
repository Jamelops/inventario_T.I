import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Calendar, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ExportButton } from '@/components/shared/ExportButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { licenseStatusLabels, licenseTypeLabels, LicenseStatus, LicenseType } from '@/types';
import { exportToExcel, formatDate, ExportColumn } from '@/lib/export-to-excel';

export default function Licenses() {
  const { licenses, licensesLoading } = useData();
  const { canEdit } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const userCanEdit = canEdit();

  if (licensesLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.nome.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || license.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportToExcel = () => {
    const columns: ExportColumn[] = [
      { header: 'ID', key: 'id' },
      { header: 'Nome', key: 'nome' },
      { header: 'Tipo', key: 'tipo', format: (v) => licenseTypeLabels[v as LicenseType] || v },
      { header: 'Quantidade Total', key: 'quantidadeTotal' },
      { header: 'Em Uso', key: 'quantidadeUsada' },
      { header: 'Disponível', key: 'quantidadeTotal', format: (v, row) => row.quantidadeTotal - row.quantidadeUsada },
      { header: 'Status', key: 'status', format: (v) => licenseStatusLabels[v as LicenseStatus] || v },
      { header: 'Data de Vencimento', key: 'dataVencimento', format: (v) => formatDate(v) },
    ];
    exportToExcel(filteredLicenses, columns, { filename: 'licencas' });
  };

  const getUsagePercent = (used: number, total: number) => Math.round((used / total) * 100);

  return (
    <div>
      <PageHeader
        title="Gerenciamento de Licenças"
        description={`${licenses.length} licenças cadastradas`}
        breadcrumbs={[{ label: 'Licenças' }]}
        actions={
          userCanEdit && (
            <div className="flex gap-2">
              <ExportButton onExport={handleExportToExcel} />
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Licença
              </Button>
            </div>
          )
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(licenseStatusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {filteredLicenses.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              title="Nenhuma licença encontrada"
              description="Comece adicionando sua primeira licença de software"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Software</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                  <TableHead>Uso</TableHead>
                  <TableHead className="hidden lg:table-cell">Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses.map(license => (
                  <TableRow key={license.id}>
                    <TableCell className="font-medium">{license.nome}</TableCell>
                    <TableCell className="hidden md:table-cell">{licenseTypeLabels[license.tipo]}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 min-w-32">
                        <div className="flex justify-between text-xs">
                          <span>{license.quantidadeUsada}/{license.quantidadeTotal}</span>
                          <span>{getUsagePercent(license.quantidadeUsada, license.quantidadeTotal)}%</span>
                        </div>
                        <Progress value={getUsagePercent(license.quantidadeUsada, license.quantidadeTotal)} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(license.dataVencimento).toLocaleDateString('pt-BR')}
                      </span>
                    </TableCell>
                    <TableCell><StatusBadge status={license.status} type="license" /></TableCell>
                    <TableCell>
                      {userCanEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Trash className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
