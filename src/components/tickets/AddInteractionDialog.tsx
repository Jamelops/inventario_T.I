import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { TicketInteraction, ticketInteractionTypeLabels } from "@/types/tickets";
import { useAuth } from "@/contexts/AuthContext";
import { useTickets } from "@/contexts/TicketContext";
import { useToast } from "@/hooks/use-toast";

interface AddInteractionDialogProps {
  ticketId: string;
}

type InteractionType = Exclude<TicketInteraction['type'], 'mudanca_status'>;

export function AddInteractionDialog({ ticketId }: AddInteractionDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<InteractionType>('comentario');
  const [message, setMessage] = useState('');
  
  const { profile } = useAuth();
  const { addInteraction } = useTickets();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!message.trim()) {
      toast({
        title: "Erro",
        description: "A mensagem é obrigatória.",
        variant: "destructive",
      });
      return;
    }

    addInteraction(ticketId, {
      userId: profile?.user_id || '',
      userName: profile?.username || 'Usuário',
      message: message.trim(),
      type,
    });

    toast({
      title: "Interação adicionada",
      description: "A interação foi registrada com sucesso.",
    });

    setMessage('');
    setType('comentario');
    setOpen(false);
  };

  const interactionTypes: InteractionType[] = ['comentario', 'ligacao', 'email', 'retorno_fornecedor'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Interação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Interação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo de Interação</Label>
            <Select value={type} onValueChange={(value) => setType(value as InteractionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {interactionTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {ticketInteractionTypeLabels[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descreva a interação..."
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Adicionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
