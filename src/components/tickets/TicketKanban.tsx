import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wifi,
  Laptop,
  Building2,
  Eye,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TicketStatusBadge, TicketPriorityBadge } from '@/components/tickets/TicketStatusBadge';
import { SLAIndicator } from '@/components/tickets/SLAIndicator';
import { Ticket, TicketSupplierConfig, ticketStatusLabels } from '@/types/tickets';

interface TicketKanbanProps {
  tickets: Ticket[];
  suppliers: TicketSupplierConfig[];
  getSupplierById: (id: string) => TicketSupplierConfig | undefined;
  onStatusChange: (ticketId: string, newStatus: string) => void;
}

const STATUSES = [
  { value: 'novo', label: 'Novo' },
  { value: 'atribuido', label: 'Atribuído' },
  { value: 'resolvido', label: 'Resolvido' },
  { value: 'encerrado', label: 'Encerrado' },
];

export function TicketKanban({
  tickets,
  suppliers,
  getSupplierById,
  onStatusChange,
}: TicketKanbanProps) {
  const navigate = useNavigate();

  const getSupplierIcon = (fornecedorId: string) => {
    const supplier = getSupplierById?.(fornecedorId);
    if (!supplier) return <Laptop className="h-3.5 w-3.5 text-muted-foreground" />;

    if (supplier.categoria === 'operadora') {
      return <Wifi className="h-3.5 w-3.5 text-blue-500" />;
    }
    if (supplier.categoria === 'prodata') {
      return <Building2 className="h-3.5 w-3.5 text-purple-500" />;
    }
    return <Laptop className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const getSupplierName = (fornecedorId: string) => {
    return getSupplierById?.(fornecedorId)?.nome || 'Desconhecido';
  };

  const ticketsByStatus = STATUSES.reduce(
    (acc, status) => {
      acc[status.value] = tickets.filter((t) => t.status === status.value);
      return acc;
    },
    {} as Record<string, Ticket[]>
  );

  const TicketCardContent = ({ ticket }: { ticket: Ticket }) => (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {getSupplierIcon(ticket.fornecedorId)}
          <span className="text-xs font-medium truncate">{ticket.id}</span>
        </div>
      </div>
      <p className="text-xs font-medium line-clamp-2 text-foreground">{ticket.titulo}</p>
      <div className="space-y-1">
        <div className="flex gap-1 flex-wrap">
          <TicketPriorityBadge priority={ticket.prioridade} />
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {getSupplierName(ticket.fornecedorId)}
        </p>
      </div>
      <div className="pt-1">
        <SLAIndicator slaDeadline={ticket.slaDeadline} status={ticket.status} />
      </div>
      <div className="flex gap-1 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs flex-1"
          onClick={() => navigate(`/tickets/${ticket.id}`)}
        >
          <Eye className="h-3 w-3 mr-1" />
          Ver
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs flex-1"
          onClick={() => navigate(`/tickets/${ticket.id}/edit`)}
        >
          <Edit className="h-3 w-3 mr-1" />
          Editar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map((status) => {
        const statusTickets = ticketsByStatus[status.value] || [];
        return (
          <div
            key={status.value}
            className="flex-shrink-0 w-80 flex flex-col"
          >
            {/* Column Header */}
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground">{status.label}</h3>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full font-medium">
                {statusTickets.length}
              </span>
            </div>

            {/* Column */}
            <div className="flex-1 bg-muted/30 rounded-lg p-3 min-h-96 border-2 border-transparent space-y-3">
              {statusTickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className="hover:shadow-md transition-all duration-150"
                >
                  <CardContent className="p-3">
                    <TicketCardContent ticket={ticket} />
                  </CardContent>
                </Card>
              ))}
              {statusTickets.length === 0 && (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <p className="text-xs text-center">Nenhum ticket nesta coluna</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
