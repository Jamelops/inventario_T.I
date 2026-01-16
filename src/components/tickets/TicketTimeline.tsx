import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, Phone, Mail, RefreshCw, ArrowRightLeft } from "lucide-react";
import { TicketInteraction, ticketInteractionTypeLabels } from "@/types/tickets";
import { cn } from "@/lib/utils";

interface TicketTimelineProps {
  interactions: TicketInteraction[];
}

const interactionIcons: Record<TicketInteraction['type'], React.ElementType> = {
  comentario: MessageSquare,
  ligacao: Phone,
  email: Mail,
  retorno_fornecedor: RefreshCw,
  mudanca_status: ArrowRightLeft,
};

const interactionColors: Record<TicketInteraction['type'], string> = {
  comentario: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  ligacao: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  email: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  retorno_fornecedor: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
  mudanca_status: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export function TicketTimeline({ interactions }: TicketTimelineProps) {
  const sortedInteractions = [...interactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (sortedInteractions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Nenhuma interação registrada ainda.
      </p>
    );
  }

  return (
    <div className="relative space-y-4">
      {/* Vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />

      {sortedInteractions.map((interaction) => {
        const Icon = interactionIcons[interaction.type];
        
        return (
          <div key={interaction.id} className="relative flex gap-4 pl-10">
            {/* Icon */}
            <div
              className={cn(
                "absolute left-0 p-2 rounded-full",
                interactionColors[interaction.type]
              )}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{interaction.userName}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(interaction.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                {ticketInteractionTypeLabels[interaction.type]}
              </div>
              <p className="text-sm">{interaction.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
