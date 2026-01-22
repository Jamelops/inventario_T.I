// Tipos do módulo de Chamados de Suporte

export interface TicketSupplierConfig {
  id: string;
  nome: string;
  categoria: 'operadora' | 'prodata' | 'fornecedor_ti' | 'outro';
  slaHoras: number;
  ativo: boolean;
}

export type TicketType = 
  | 'internet_fora' 
  | 'link_intermitente' 
  | 'sistema_prodata_fora' 
  | 'validador_travando' 
  | 'hardware' 
  | 'software' 
  | 'outro';

export type TicketStatus = 
  | 'aberto' 
  | 'em_andamento' 
  | 'aguardando_terceiro' 
  | 'resolvido' 
  | 'encerrado';

export type TicketPriority = 'baixa' | 'media' | 'alta' | 'critica';

export interface TicketInteraction {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  message: string;
  type: 'comentario' | 'ligacao' | 'email' | 'retorno_fornecedor' | 'mudanca_status';
  createdAt: string;
}

export interface SupplierContact {
  nome?: string;
  telefone?: string;
  email?: string;
}

export interface Ticket {
  id: string;
  titulo: string;
  descricao: string;
  fornecedorId: string;
  tipo: TicketType;
  status: TicketStatus;
  prioridade: TicketPriority;
  unidade: string;
  assetId?: string;
  assetNome?: string;
  protocoloExterno?: string;
  contatoFornecedor?: SupplierContact;
  responsavelId: string;
  responsavelNome: string;
  slaDeadline: string;
  dataCriacao: string;
  dataAtualizacao: string;
  dataResolucao?: string;
  interactions: TicketInteraction[];
}

export const ticketTypeLabels: Record<TicketType, string> = {
  internet_fora: 'Internet Fora',
  link_intermitente: 'Link Intermitente',
  sistema_prodata_fora: 'Sistema Prodata Fora',
  validador_travando: 'Validador Travando',
  hardware: 'Hardware',
  software: 'Software',
  outro: 'Outro',
};

export const ticketStatusLabels: Record<TicketStatus, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em Andamento',
  aguardando_terceiro: 'Aguardando Terceiro',
  resolvido: 'Resolvido',
  encerrado: 'Encerrado',
};

export const ticketPriorityLabels: Record<TicketPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

export const ticketInteractionTypeLabels: Record<TicketInteraction['type'], string> = {
  comentario: 'Comentário',
  ligacao: 'Ligação',
  email: 'E-mail',
  retorno_fornecedor: 'Retorno do Fornecedor',
  mudanca_status: 'Mudança de Status',
};

export const supplierCategoryLabels: Record<TicketSupplierConfig['categoria'], string> = {
  operadora: 'Operadora',
  prodata: 'Prodata',
  fornecedor_ti: 'Fornecedor de TI',
  outro: 'Outro',
};