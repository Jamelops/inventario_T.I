import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wifi,
  Laptop,
  Building2,
  Eye,
  Edit,
  GripHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TicketStatusBadge, TicketPriorityBadge } from '@/components/tickets/TicketStatusBadge';
import { SLAIndicator } from '@/components/tickets/SLAIndicator';
import { Ticket, ticketStatusLabels } from '@/types/tickets';

interface TicketKanbanProps {
  tickets: Ticket[];
  suppliers: any[];
  getSupplierById: (id: string) => any;
  onStatusChange: (ticketId: string, newStatus: string) => void;
}

interface DragState {
  draggedTicket: Ticket | null;
  dragOffset: { x: number; y: number };
  draggingEl: HTMLElement | null;
  sourceCard: HTMLElement | null;
  isDragging: boolean;
}

const STATUSES = [
  { value: 'novo', label: 'Novo' },
  { value: 'atribuido', label: 'Atribuído' },
  { value: 'resolvido', label: 'Resolvido' },
  { value: 'encerrado', label: 'Encerrado' },
];

// 🔥 MODO DEBUG - Mudar para false se não quiser logs
const DEBUG = true;
const log = (msg: string, data?: any) => {
  if (DEBUG) {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    console.log(`[${timestamp}] 🎯 TicketKanban: ${msg}`, data || '');
  }
};

export function TicketKanban({
  tickets,
  suppliers,
  getSupplierById,
  onStatusChange,
}: TicketKanbanProps) {
  const navigate = useNavigate();
  const dragStateRef = useRef<DragState>({
    draggedTicket: null,
    dragOffset: { x: 0, y: 0 },
    draggingEl: null,
    sourceCard: null,
    isDragging: false,
  });

  // 🔥 DEBUG: Log na montagem
  useEffect(() => {
    log('✅ TicketKanban MONTADO - Listeners sendo configurados...');
  }, []);

  // 🔥 NOVO: Global listeners sempre ativas para drag robusto
  useEffect(() => {
    log('⚙️ Configurando listeners globais (mousemove + mouseup)');

    const handleMouseMove = (e: MouseEvent) => {
      // 🔥 DEBUG: Log apenas quando realmente arrastando
      if (dragStateRef.current.isDragging) {
        const { dragOffset, draggingEl } = dragStateRef.current;

        if (!draggingEl) {
          log('⚠️ Clone não existe durante mousemove!');
          return;
        }

        // Atualizar posição do clone
        if (e.clientX !== 0 || e.clientY !== 0) {
          draggingEl.style.left = e.clientX - dragOffset.x + 'px';
          draggingEl.style.top = e.clientY - dragOffset.y + 'px';
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // 🔥 DEBUG: Log quando solta
      if (dragStateRef.current.isDragging) {
        log('🛑 Mouse UP - Finalizando arraste');

        dragStateRef.current.isDragging = false;
        const { draggingEl, sourceCard } = dragStateRef.current;

        // Remove clone
        if (draggingEl?.parentNode) {
          log('🗑️ Removendo clone do DOM');
          draggingEl.parentNode.removeChild(draggingEl);
        }

        // Restore source card
        if (sourceCard) {
          log('♻️ Restaurando opacity do card original');
          sourceCard.style.opacity = '1';
          sourceCard.style.transition = 'opacity 200ms ease-out';
        }

        // Limpar estado
        dragStateRef.current = {
          draggedTicket: null,
          dragOffset: { x: 0, y: 0 },
          draggingEl: null,
          sourceCard: null,
          isDragging: false,
        };
      }
    };

    // 🔥 CRÍTICO: Adicionar listeners GLOBALMENTE
    log('📌 Adicionando listeners ao document');
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // 🔥 DEBUG: Verificar que listeners foram adicionados
    log('✅ Listeners adicionados com sucesso!');

    // Cleanup
    return () => {
      log('🧹 Removendo listeners (component desmontando)');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []); // ✅ Array VAZIO = listeners SEMPRE ativos

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

  const handleDragStart = (e: React.DragEvent, ticket: Ticket) => {
    log(`🚀 DragStart iniciado - Ticket: ${ticket.id}`, ticket);

    const card = e.currentTarget as HTMLElement;

    e.dataTransfer!.effectAllowed = 'move';

    try {
      e.dataTransfer!.setData('text/plain', ticket.id);
      log('✅ setData executado com sucesso');
    } catch (err) {
      log('❌ setData FALHOU:', err);
    }

    // Create a high-fidelity clone
    const clone = card.cloneNode(true) as HTMLElement;

    // Style the clone
    clone.style.position = 'fixed';
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = '9999';
    clone.style.opacity = '0.95';
    clone.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.15)';
    clone.style.transform = 'scale(1.05)';
    clone.style.transition = 'none';
    clone.style.width = card.offsetWidth + 'px';
    clone.style.borderRadius = card.style.borderRadius || '8px';
    clone.classList.add('drag-preview');

    log('🎨 Clone criado e estilizado');

    // Calculate position
    const rect = card.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    clone.style.left = e.clientX - offsetX + 'px';
    clone.style.top = e.clientY - offsetY + 'px';

    log('📍 Posição do clone calculada', {
      clientX: e.clientX,
      clientY: e.clientY,
      offsetX,
      offsetY,
    });

    document.body.appendChild(clone);
    log('✅ Clone adicionado ao DOM');

    // 🔥 CRÍTICO: Atualizar state IMEDIATAMENTE
    dragStateRef.current = {
      draggedTicket: ticket,
      dragOffset: { x: offsetX, y: offsetY },
      draggingEl: clone,
      sourceCard: card,
      isDragging: true, // FLAG ATIVA
    };

    log('🚩 Flag isDragging = TRUE', {
      hasClone: !!clone,
      hasSourceCard: !!card,
      isDragging: dragStateRef.current.isDragging,
    });

    // Visual feedback
    card.style.opacity = '0.4';
    card.style.transition = 'opacity 150ms ease-out';
    log('👁️ Card original tornando transparente');
  };

  // 🔥 handleDrag é APENAS fallback para o evento drag nativo
  // O mousemove global é o principal
  const handleDrag = (e: React.DragEvent) => {
    if (!dragStateRef.current.isDragging || !dragStateRef.current.draggingEl) {
      return;
    }

    const { dragOffset, draggingEl } = dragStateRef.current;

    if (e.clientX !== 0 || e.clientY !== 0) {
      draggingEl.style.left = e.clientX - dragOffset.x + 'px';
      draggingEl.style.top = e.clientY - dragOffset.y + 'px';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    log('⏹️ DragEnd acionado');
    dragStateRef.current.isDragging = false;

    const { draggingEl, sourceCard } = dragStateRef.current;

    // Remove clone
    if (draggingEl?.parentNode) {
      log('🗑️ Removendo clone no dragEnd');
      draggingEl.parentNode.removeChild(draggingEl);
    }

    // Restore source card
    if (sourceCard) {
      log('♻️ Restaurando card no dragEnd');
      sourceCard.style.opacity = '1';
      sourceCard.style.transition = 'opacity 200ms ease-out';
    }

    // Clear state
    dragStateRef.current = {
      draggedTicket: null,
      dragOffset: { x: 0, y: 0 },
      draggingEl: null,
      sourceCard: null,
      isDragging: false,
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    log(`📥 Drop acionado - Status alvo: ${targetStatus}`);

    const ticket = dragStateRef.current.draggedTicket;
    if (ticket) {
      log(`✅ Chamando onStatusChange: ${ticket.id} → ${targetStatus}`);
      onStatusChange(ticket.id, targetStatus);
    } else {
      log('❌ Nenhum ticket arrastado!');
    }
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
        <GripHorizontal className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
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

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status.value)}
              className="flex-1 bg-muted/30 rounded-lg p-3 min-h-96 border-2 border-dashed border-transparent hover:border-primary/30 transition-colors space-y-3"
            >
              {statusTickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, ticket)}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-150"
                >
                  <CardContent className="p-3">
                    <TicketCardContent ticket={ticket} />
                  </CardContent>
                </Card>
              ))}
              {statusTickets.length === 0 && (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <p className="text-xs text-center">Arraste tickets aqui</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}