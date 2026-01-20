import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Wifi,
  Laptop,
  Building2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/PageHeader";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/tickets/TicketStatusBadge";
import { SLAIndicator } from "@/components/tickets/SLAIndicator";
import { useTickets } from "@/contexts/TicketContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import {
  Ticket,
  TicketStatus,
  TicketPriority,
  ticketStatusLabels,
  ticketPriorityLabels,
} from "@/types/tickets";
import { exportToExcel, formatDateTime, ExportColumn } from "@/lib/export-to-excel";

export default function Tickets() {
  const navigate = useNavigate();
  const { tickets = [], suppliers = [], getSupplierById, changeTicketStatus } = useTickets();
  const { profile } = useAuth();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [filterSupplier, setFilterSupplier] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const activeSuppliers = (suppliers || []).filter(s => s?.ativo);

  const filteredTickets = (tickets || []).filter((ticket) => {
    const matchesSearch =
      ticket.titulo.toLowerCase().includes(search.toLowerCase()) ||
      ticket.id.toLowerCase().includes(search.toLowerCase()) ||
      (ticket.protocoloExterno?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchesSupplier = filterSupplier === "all" || ticket.fornecedorId === filterSupplier;
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    const matchesPriority = filterPriority === "all" || ticket.prioridade === filterPriority;

    return matchesSearch && matchesSupplier && matchesStatus && matchesPriority;
  });

  const sortedTickets = [...filteredTickets].sort(
    (a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
  );

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    if (!profile) {
      toast.error('Erro ao identificar o usuário');
      return;
    }
    await changeTicketStatus(ticketId, newStatus, profile?.user_id || '', profile?.username || 'Usuário');
  };

  const getSupplierIcon = (fornecedorId: string) => {
    const supplier = getSupplierById?.(fornecedorId);
    if (!supplier) return <Laptop className="h-4 w-4 text-muted-foreground" />;
    
    if (supplier.categoria === 'operadora') {
      return <Wifi className="h-4 w-4 text-blue-500" />;
    }
    if (supplier.categoria === 'prodata') {
      return <Building2 className="h-4 w-4 text-purple-500" />;
    }
    return <Laptop className="h-4 w-4 text-muted-foreground" />;
  };

  const getSupplierName = (fornecedorId: string) => {
    return getSupplierById?.(fornecedorId)?.nome || 'Desconhecido';
  };

  const handleExportToExcel = () => {
    const columns: ExportColumn[] = [
      { header: 'ID', key: 'id' },
      { header: 'Título', key: 'titulo' },
      { header: 'Fornecedor', key: 'fornecedorId', format: (v) => getSupplierName(v) },
      { header: 'Status', key: 'status', format: (v) => ticketStatusLabels[v as TicketStatus] || v },
      { header: 'Prioridade', key: 'prioridade', format: (v) => ticketPriorityLabels[v as TicketPriority] || v },
      { header: 'SLA', key: 'slaDeadline', format: (v) => formatDateTime(v) },
      { header: 'Criado em', key: 'dataCriacao', format: (v) => formatDateTime(v) },
    ];
    exportToExcel(sortedTickets, columns, { filename: 'chamados', toast });
  };

  // Mobile card view
  const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {getSupplierIcon(ticket.fornecedorId)}
            <span className="text-sm font-medium">{ticket.id}</span>
          </div>
          <TicketPriorityBadge priority={ticket.prioridade} />
        </div>
        <h3 className="font-medium mb-2 line-clamp-2">{ticket.titulo}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <TicketStatusBadge status={ticket.status} />
          <span className="text-xs text-muted-foreground">
            {getSupplierName(ticket.fornecedorId)}
          </span>
        </div>
        <SLAIndicator slaDeadline={ticket.slaDeadline} status={ticket.status} />
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/tickets/${ticket.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/tickets/${ticket.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chamados de Suporte"
        description="Gerencie os chamados de suporte com operadoras e fornecedores"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Chamados" },
        ]}
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
              onClick={() => navigate("/tickets/new")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Chamado
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID, título ou protocolo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterSupplier} onValueChange={setFilterSupplier}>
              <SelectTrigger>
                <SelectValue placeholder="Fornecedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Fornecedores</SelectItem>
                {activeSuppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                {Object.entries(ticketStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Prioridades</SelectItem>
                {Object.entries(ticketPriorityLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {filteredTickets.length} chamado{filteredTickets.length !== 1 ? 's' : ''} encontrado{filteredTickets.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSupplierIcon(ticket.fornecedorId)}
                        <span className="line-clamp-1 max-w-[200px]">{ticket.titulo}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getSupplierName(ticket.fornecedorId)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="cursor-pointer">
                            <TicketStatusBadge status={ticket.status} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {Object.entries(ticketStatusLabels).map(([value, label]) => (
                            <DropdownMenuItem
                              key={value}
                              onClick={() => handleStatusChange(ticket.id, value as TicketStatus)}
                              disabled={ticket.status === value}
                            >
                              {label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <TicketPriorityBadge priority={ticket.prioridade} />
                    </TableCell>
                    <TableCell>
                      <SLAIndicator slaDeadline={ticket.slaDeadline} status={ticket.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(ticket.dataCriacao), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/tickets/${ticket.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedTickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum chamado encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {sortedTickets.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nenhum chamado encontrado.
              </p>
            ) : (
              sortedTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}