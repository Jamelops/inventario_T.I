import { Badge } from '@/components/ui/badge';
import {
  TicketStatus,
  TicketPriority,
  ticketStatusLabels,
  ticketPriorityLabels,
} from '@/types/tickets';
import { cn } from '@/lib/utils';

interface TicketStatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

const statusColors: Record<TicketStatus, string> = {
  aberto: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  em_andamento: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  aguardando_terceiro: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  resolvido: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  encerrado: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  return (
    <Badge className={cn(statusColors[status], 'font-medium', className)}>
      {ticketStatusLabels[status]}
    </Badge>
  );
}

interface TicketPriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

const priorityColors: Record<TicketPriority, string> = {
  baixa: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  media: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  alta: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critica: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function TicketPriorityBadge({ priority, className }: TicketPriorityBadgeProps) {
  return (
    <Badge className={cn(priorityColors[priority], 'font-medium', className)}>
      {ticketPriorityLabels[priority]}
    </Badge>
  );
}
