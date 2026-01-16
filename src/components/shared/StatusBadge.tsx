import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AssetStatus, LicenseStatus, MaintenanceStatus, MaintenancePriority, statusLabels, licenseStatusLabels, maintenanceStatusLabels, priorityLabels } from '@/types';

interface StatusBadgeProps {
  status: AssetStatus | LicenseStatus | MaintenanceStatus;
  type?: 'asset' | 'license' | 'maintenance';
  className?: string;
}

const statusColors: Record<string, string> = {
  // Asset status
  ativo: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  inativo: 'bg-slate-100 text-slate-700 border-slate-200',
  manutencao: 'bg-amber-100 text-amber-700 border-amber-200',
  arquivado: 'bg-slate-100 text-slate-500 border-slate-200',
  
  // License status
  ativa: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  vencendo: 'bg-amber-100 text-amber-700 border-amber-200',
  vencida: 'bg-red-100 text-red-700 border-red-200',
  cancelada: 'bg-slate-100 text-slate-500 border-slate-200',
  
  // Maintenance status
  pendente: 'bg-sky-100 text-sky-700 border-sky-200',
  em_andamento: 'bg-violet-100 text-violet-700 border-violet-200',
  concluido: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export function StatusBadge({ status, type = 'asset', className }: StatusBadgeProps) {
  const getLabel = () => {
    if (type === 'license') return licenseStatusLabels[status as LicenseStatus];
    if (type === 'maintenance') return maintenanceStatusLabels[status as MaintenanceStatus];
    return statusLabels[status as AssetStatus];
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        'font-medium',
        statusColors[status] || 'bg-slate-100 text-slate-700 border-slate-200',
        className
      )}
    >
      {getLabel()}
    </Badge>
  );
}

interface PriorityBadgeProps {
  priority: MaintenancePriority;
  className?: string;
}

const priorityColors: Record<MaintenancePriority, string> = {
  alta: 'bg-red-100 text-red-700 border-red-200',
  media: 'bg-amber-100 text-amber-700 border-amber-200',
  baixa: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge 
      variant="outline"
      className={cn(
        'font-medium',
        priorityColors[priority],
        className
      )}
    >
      {priorityLabels[priority]}
    </Badge>
  );
}
