import { differenceInHours, differenceInMinutes, isPast, format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TicketStatus } from "@/types/tickets";

interface SLAIndicatorProps {
  slaDeadline: string | null | undefined;
  status: TicketStatus;
  className?: string;
  showDetails?: boolean;
}

export function SLAIndicator({ slaDeadline, status, className, showDetails = false }: SLAIndicatorProps) {
  // Handle null, undefined, or empty string
  if (!slaDeadline) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
          "bg-muted text-muted-foreground",
          className
        )}
      >
        <Clock className="h-3 w-3" />
        SLA não definido
      </div>
    );
  }

  let deadline: Date | null = null;
  let statusInfo:
    | {
        icon: typeof Clock;
        color: string;
        bgColor: string;
        label: string;
      }
    | null = null;
  let hasError = false;
  let invalidDeadline = false;

  try {
    // Try to parse the date string
    let parsedDeadline: Date;
    try {
      // Try ISO string first
      parsedDeadline = parseISO(slaDeadline.toString().trim());

      // If it fails, try new Date()
      if (!isValid(parsedDeadline)) {
        parsedDeadline = new Date(slaDeadline);
      }
    } catch (e) {
      parsedDeadline = new Date(slaDeadline);
    }

    // Validate that the date is valid
    if (!isValid(parsedDeadline)) {
      invalidDeadline = true;
    } else {
      deadline = parsedDeadline;
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

      statusInfo = getStatusInfo();
    }
  } catch (error) {
    console.error('Error in SLAIndicator:', error, 'slaDeadline:', slaDeadline);
    hasError = true;
  }

  if (hasError) {
    // Fallback UI when something goes wrong
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
          "bg-muted text-muted-foreground",
          className
        )}
      >
        <Clock className="h-3 w-3" />
        SLA indisponível
      </div>
    );
  }

  if (invalidDeadline || !deadline || !statusInfo) {
    console.warn('Invalid SLA deadline date:', slaDeadline);
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
          "bg-muted text-muted-foreground",
          className
        )}
      >
        <Clock className="h-3 w-3" />
        SLA inválido
      </div>
    );
  }

  const Icon = statusInfo.icon;

  if (showDetails) {
    return (
      <div className={cn("space-y-1", className)}>
        <div className={cn("flex items-center gap-2 text-sm", statusInfo.color)}>
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
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
        statusInfo.bgColor,
        statusInfo.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {statusInfo.label}
    </div>
  );
}
