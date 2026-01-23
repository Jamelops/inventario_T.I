import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Edit,
  Wrench,
  Archive,
  Calendar,
  MapPin,
  User,
  Tag,
  Hash,
  DollarSign,
  Clock,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useData } from "@/contexts/DataContext";
import { useTicket } from "@/hooks/useTicket";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { HardwareSpecsDisplay } from "@/components/assets/HardwareSpecsDisplay";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import { useToast } from "@/hooks/use-toast";
import { useMaintenanceTasks } from "@/hooks/useMaintenanceTasks";
import { categoryLabels, maintenanceStatusLabels } from "@/types";

const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { assets, updateAsset, assetsLoading } = useData();
  const { maintenanceTasks } = useMaintenanceTasks();
  const { getTicketsByAssetId, getSupplierById } = useTicket();

  const asset = assets.find((a) => a.id === id);
  const assetMaintenances = maintenanceTasks.filter((t) => t.assetId === id);
  const assetTickets = getTicketsByAssetId(id || "");

  if (assetsLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-muted-foreground">Ativo nao encontrado</p>
        <Button onClick={() => navigate("/assets")}>Voltar para Ativos</Button>
      </div>
    );
  }

  const handleArchive = async () => {
    const success = await updateAsset(asset.id, { status: "arquivado" });
    if (success) {
      toast({
        title: "Ativo arquivado",
        description: `${asset.nome} foi arquivado com sucesso.`,
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Data invalida";
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar data:", dateString, error);
      return "Data invalida";
    }
  };

  const infoItems = [
    { icon: Tag, label: "Categoria", value: categoryLabels[asset.categoria] },
    { icon: Hash, label: "Numero de Serie", value: asset.numeroSerie },
    { icon: Calendar, label: "Data de Compra", value: formatDate(asset.dataCompra) },
    { icon: DollarSign, label: "Valor", value: formatCurrency(asset.valor) },
    { icon: MapPin, label: "Localizacao", value: asset.localizacao },
    { icon: User, label: "Responsavel", value: asset.responsavel },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/assets")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{asset.nome}</h1>
              <StatusBadge status={asset.status} />
            </div>
            <p className="text-muted-foreground">ID: {asset.id}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate(`/assets/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" onClick={() => navigate(`/maintenance/new?assetId=${id}`)}>
            <Wrench className="h-4 w-4 mr-2" />
            Agendar Manutencao
          </Button>
          <Button variant="outline" onClick={() => navigate(`/tickets/new?assetId=${id}`)}>
            <Headphones className="h-4 w-4 mr-2" />
            Abrir Chamado
          </Button>
          {asset.status !== "arquivado" && (
            <Button variant="outline" onClick={handleArchive}>
              <Archive className="h-4 w-4 mr-2" />
              Arquivar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informacoes Principais */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informacoes do Ativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-md">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {asset.descricao && (
              <>
                <Separator className="my-6" />
                <div>
                  <h4 className="font-medium mb-2">Descricao</h4>
                  <p className="text-muted-foreground">{asset.descricao}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Especificacoes de Hardware */}
        <HardwareSpecsDisplay specs={asset.especificacoes} categoria={asset.categoria} />

        {/* Historico de Manutencoes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Historico de Manutencoes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assetMaintenances.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhuma manutencao registrada para este ativo.
              </p>
            ) : (
              <div className="space-y-4">
                {assetMaintenances.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{task.descricao}</p>
                      <Badge
                        variant={
                          task.status === "concluido"
                            ? "default"
                            : task.status === "em_andamento"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {maintenanceStatusLabels[task.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Criado em {formatDate(task.dataCriacao)}
                    </p>
                    {task.notas && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {task.notas}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chamados Relacionados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              Chamados Relacionados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assetTickets.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhum chamado registrado para este ativo.
              </p>
            ) : (
              <div className="space-y-4">
                {assetTickets.slice(0, 5).map((ticket) => {
                  const supplier = getSupplierById(ticket.fornecedorId);
                  return (
                    <div
                      key={ticket.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{ticket.titulo}</p>
                        <TicketStatusBadge status={ticket.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {supplier?.nome || 'Desconhecido'} • {formatDate(ticket.dataCriacao)}
                      </p>
                    </div>
                  );
                })}
                {assetTickets.length > 5 && (
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => navigate(`/tickets?assetId=${id}`)}
                  >
                    Ver todos os {assetTickets.length} chamados
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetDetails;