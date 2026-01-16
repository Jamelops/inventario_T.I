import { Package, Wrench, DollarSign, AlertTriangle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useData } from '@/contexts/DataContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardCustomizer } from '@/components/dashboard/DashboardCustomizer';
import { categoryLabels, DashboardWidget } from '@/types';
import { useMaintenanceTasks } from '@/hooks/useMaintenanceTasks';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Dashboard() {
  const { assets, licenses, dashboardConfig, updateDashboardConfig, assetsLoading, licensesLoading } = useData();
  const { maintenanceTasks, loading: maintenanceLoading } = useMaintenanceTasks();

  if (assetsLoading || licensesLoading || maintenanceLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate KPIs
  const totalAssets = assets.length;
  const assetsInMaintenance = assets.filter(a => a.status === 'manutencao').length;
  const expiredLicenses = licenses.filter(l => l.status === 'vencida' || l.status === 'vencendo').length;
  const totalValue = assets.reduce((sum, a) => sum + a.valor, 0);

  // Category distribution for pie chart
  const categoryData = Object.entries(
    assets.reduce((acc, asset) => {
      acc[asset.categoria] = (acc[asset.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name: categoryLabels[name as keyof typeof categoryLabels] || name,
    value,
  }));

  // Upcoming items
  const upcomingLicenses = licenses
    .filter(l => l.status === 'vencendo' || l.status === 'vencida')
    .slice(0, 5);

  const pendingTasks = maintenanceTasks
    .filter(t => t.status === 'pendente' || t.status === 'em_andamento')
    .slice(0, 5);

  const handleUpdateWidgets = (widgets: DashboardWidget[]) => {
    updateDashboardConfig({ widgets });
  };

  const visibleWidgets = dashboardConfig.widgets
    .filter(w => w.visible)
    .sort((a, b) => a.order - b.order);

  const isWidgetVisible = (id: string) => visibleWidgets.some(w => w.id === id);

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'kpis':
        return (
          <div key="kpis" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <KPICard
              title="Total de Ativos"
              value={totalAssets}
              icon={<Package className="h-4 w-4" />}
              trend={{ value: 5, label: 'vs mês anterior' }}
            />
            <KPICard
              title="Em Manutenção"
              value={assetsInMaintenance}
              icon={<Wrench className="h-4 w-4" />}
              description="ativos"
            />
            <KPICard
              title="Licenças com Alerta"
              value={expiredLicenses}
              icon={<AlertTriangle className="h-4 w-4" />}
              description="precisam de atenção"
            />
            <KPICard
              title="Valor Total"
              value={`R$ ${totalValue.toLocaleString('pt-BR')}`}
              icon={<DollarSign className="h-4 w-4" />}
              trend={{ value: 12, label: 'investido' }}
            />
          </div>
        );

      case 'chart':
        return (
          <Card key="chart">
            <CardHeader>
              <CardTitle className="text-lg">Distribuição por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );

      case 'licenses':
        return (
          <Card key="licenses">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Licenças Vencendo</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/licenses">Ver todas</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingLicenses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma licença próxima do vencimento</p>
              ) : (
                <div className="space-y-3">
                  {upcomingLicenses.map(license => (
                    <div key={license.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium text-sm">{license.nome}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Vence em {new Date(license.dataVencimento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <StatusBadge status={license.status} type="license" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'maintenance':
        return (
          <Card key="maintenance" className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Manutenções Pendentes</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/maintenance">Ver todas</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma manutenção pendente</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {pendingTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium text-sm">{task.assetNome}</p>
                        <p className="text-xs text-muted-foreground">{task.descricao}</p>
                      </div>
                      <StatusBadge status={task.status} type="maintenance" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral do inventário de TI"
        actions={
          <div className="flex gap-2">
            <DashboardCustomizer
              widgets={dashboardConfig.widgets}
              onUpdateWidgets={handleUpdateWidgets}
            />
            <Button asChild>
              <Link to="/assets">Gerenciar Ativos</Link>
            </Button>
          </div>
        }
      />

      {/* KPIs - sempre primeiro se visível */}
      {isWidgetVisible('kpis') && renderWidget('kpis')}

      {/* Grid para os demais widgets */}
      <div className="grid gap-6 lg:grid-cols-2">
        {visibleWidgets
          .filter(w => w.id !== 'kpis')
          .map(widget => renderWidget(widget.id))}
      </div>
    </div>
  );
}
