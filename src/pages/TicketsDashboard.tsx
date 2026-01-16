import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Ticket,
  AlertTriangle,
  Clock,
  Wifi,
  Building2,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { KPICard } from "@/components/shared/KPICard";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/tickets/TicketStatusBadge";
import { SLAIndicator } from "@/components/tickets/SLAIndicator";
import { useTickets } from "@/contexts/TicketContext";
import { ticketStatusLabels } from "@/types/tickets";

const COLORS = ["#3b82f6", "#22c55e", "#eab308", "#f97316", "#ef4444", "#8b5cf6"];

export default function TicketsDashboard() {
  const navigate = useNavigate();
  const { tickets, suppliers, getSupplierById } = useTickets();

  const stats = useMemo(() => {
    const openTickets = tickets.filter(
      (t) => t.status !== "resolvido" && t.status !== "encerrado"
    );
    const operadoraTickets = openTickets.filter((t) => {
      const supplier = getSupplierById(t.fornecedorId);
      return supplier?.categoria === 'operadora';
    });
    const prodataTickets = openTickets.filter((t) => {
      const supplier = getSupplierById(t.fornecedorId);
      return supplier?.categoria === 'prodata';
    });
    const criticalTickets = openTickets.filter(
      (t) => t.prioridade === "critica" || t.prioridade === "alta"
    );

    return {
      total: openTickets.length,
      operadoras: operadoraTickets.length,
      prodata: prodataTickets.length,
      critical: criticalTickets.length,
    };
  }, [tickets, getSupplierById]);

  const supplierChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach((ticket) => {
      const supplier = getSupplierById(ticket.fornecedorId);
      const label = supplier?.nome || 'Desconhecido';
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tickets, getSupplierById]);

  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach((ticket) => {
      const label = ticketStatusLabels[ticket.status];
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  const criticalTickets = useMemo(() => {
    const now = new Date();
    return tickets
      .filter((t) => t.status !== "resolvido" && t.status !== "encerrado")
      .map((t) => ({
        ...t,
        isOverdue: new Date(t.slaDeadline) < now,
        hoursRemaining: Math.floor(
          (new Date(t.slaDeadline).getTime() - now.getTime()) / (1000 * 60 * 60)
        ),
      }))
      .filter((t) => t.prioridade === "critica" || t.prioridade === "alta" || t.isOverdue)
      .sort((a, b) => a.hoursRemaining - b.hoursRemaining)
      .slice(0, 5);
  }, [tickets]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard de Chamados"
        description="Visão geral dos chamados de suporte"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Chamados", href: "/tickets" },
          { label: "Dashboard" },
        ]}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Chamados Abertos"
          value={stats.total}
          icon={<Ticket className="h-5 w-5" />}
          description="Total de chamados em andamento"
        />
        <KPICard
          title="Operadoras de Internet"
          value={stats.operadoras}
          icon={<Wifi className="h-5 w-5" />}
          description="Vivo, Claro, Oi, Tim"
        />
        <KPICard
          title="Prodata Mobility"
          value={stats.prodata}
          icon={<Building2 className="h-5 w-5" />}
          description="Sistema de bilhetagem"
        />
        <KPICard
          title="Chamados Críticos"
          value={stats.critical}
          icon={<AlertTriangle className="h-5 w-5" />}
          description="Prioridade alta ou crítica"
          className={stats.critical > 0 ? "border-red-200 bg-red-50 dark:bg-red-950/20" : ""}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chamados por Fornecedor</CardTitle>
          </CardHeader>
          <CardContent>
            {supplierChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={supplierChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {supplierChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhum chamado registrado
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chamados por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusChartData}>
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhum chamado registrado
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Critical Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Chamados Críticos
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/tickets")}>
            Ver todos
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {criticalTickets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum chamado crítico no momento 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {criticalTickets.map((ticket) => {
                const supplier = getSupplierById(ticket.fornecedorId);
                return (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{ticket.id}</span>
                        <TicketPriorityBadge priority={ticket.prioridade} />
                      </div>
                      <p className="text-sm truncate">{ticket.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {supplier?.nome || 'Desconhecido'} • {ticket.unidade}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <SLAIndicator slaDeadline={ticket.slaDeadline} status={ticket.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
