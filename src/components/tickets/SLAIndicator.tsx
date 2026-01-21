import { differenceInHours, differenceInMinutes, isPast, format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TicketStatus } from '@/types/tickets';

interface SLAIndicatorProps {
  slaDeadline: string;
  status: TicketStatus;
  className?: string;
  showDetails?: boolean;
}

export function SLAIndicator({
  slaDeadline,
  status,
  className,
  showDetails = false,
}: SLAIndicatorProps) {
  try {
    const deadline = new Date(slaDeadline);

    // Validate that the date is valid
    if (!isValid(deadline)) {
      throw new Error('Invalid SLA deadline date');
    }

    const now = new Date();
    const isResolved = status === 'resolvido' || status === 'encerrado';
    const isExpired = isPast(deadline) && !isResolved;

    const hoursRemaining = differenceInHours(deadline, now);
    const minutesRemaining = differenceInMinutes(deadline, now) % 60;

    const getStatusInfo = () => {
      if (isResolved) {
        return {
          icon: CheckCircle,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900',
          label: 'Resolvido',
        };
      }

      if (isExpired) {
        const hoursOverdue = Math.abs(hoursRemaining);
        return {
          icon: AlertTriangle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900',
          label: `SLA estourado há ${hoursOverdue}h`,
        };
      }

      if (hoursRemaining <= 4) {
        return {
          icon: Clock,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-100 dark:bg-orange-900',
          label: `${hoursRemaining}h ${minutesRemaining}m restantes`,
        };
      }

      if (hoursRemaining <= 12) {
        return {
          icon: Clock,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900',
          label: `${hoursRemaining}h restantes`,
        };
      }

      return {
        icon: Clock,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        label: `${hoursRemaining}h restantes`,
      };
    };

    const statusInfo = getStatusInfo();
    const Icon = statusInfo.icon;

    if (showDetails) {
      return (
        <div className={cn('space-y-1', className)}>
          <div className={cn('flex items-center gap-2 text-sm', statusInfo.color)}>
            <Icon className="h-4 w-4" />
            <span className="font-medium">{statusInfo.label}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Prazo: {format(deadline, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
      );
    }

    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
          statusInfo.bgColor,
          statusInfo.color,
          className
        )}
      >
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </div>
    );
  } catch (error) {
    console.error('Error in SLAIndicator:', error);

    // Fallback UI when date is invalid
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
          'bg-muted text-muted-foreground',
          className
        )}
      >
        <Clock className="h-3 w-3" />
        SLA indisponível
      </div>
    );
  }
}
