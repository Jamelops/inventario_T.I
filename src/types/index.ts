// Tipos principais do sistema de gerenciamento de ativos

export type AssetStatus = 'ativo' | 'inativo' | 'manutencao' | 'arquivado';
export type AssetCategory = 'notebook' | 'desktop' | 'servidor' | 'monitor' | 'impressora' | 'rede' | 'periferico' | 'outros';
export type LicenseStatus = 'ativa' | 'vencendo' | 'vencida' | 'cancelada';
export type LicenseType = 'perpetua' | 'assinatura' | 'volume' | 'oem';
export type MaintenancePriority = 'alta' | 'media' | 'baixa';
export type MaintenanceStatus = 'pendente' | 'em_andamento' | 'concluido' | 'arquivado';
export type UserRole = 'admin' | 'manager' | 'viewer';

// Especificações de hardware para notebooks, desktops e servidores
export interface HardwareSpecs {
  processador?: string;
  memoriaRam?: string;
  armazenamento?: string;
  placaVideo?: string;
  sistemaOperacional?: string;
  tipoArmazenamento?: 'SSD' | 'HDD' | 'NVMe' | 'RAID';
  portas?: string;
  garantiaAte?: string;
}

export interface Asset {
  id: string;
  nome: string;
  categoria: AssetCategory;
  status: AssetStatus;
  numeroSerie: string;
  dataCompra: string;
  valor: number;
  localizacao: string;
  responsavel: string;
  descricao?: string;
  fornecedor?: string;
  tags?: string[];
  especificacoes?: HardwareSpecs;
  dataCriacao: string;
  dataAtualizacao: string;
}

// Configuração de widgets da dashboard
export interface DashboardWidget {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

export interface DashboardConfig {
  widgets: DashboardWidget[];
}

export interface License {
  id: string;
  nome: string;
  tipo: LicenseType;
  quantidadeTotal: number;
  quantidadeUsada: number;
  dataVencimento: string;
  status: LicenseStatus;
  fornecedor?: string;
  chave?: string;
  notas?: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface MaintenanceTask {
  id: string;
  assetId: string;
  assetNome: string;
  descricao: string;
  responsavel: string;
  responsavelEmail?: string;
  prioridade: MaintenancePriority;
  status: MaintenanceStatus;
  dataAgendada: string;
  dataConclusao?: string;
  notas?: string;
  localManutencao?: string;
  situacaoEquipamento?: string;
  observacao?: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Category {
  id: string;
  nome: string;
  descricao?: string;
  icone?: string;
}

// Labels em português
export const statusLabels: Record<AssetStatus, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  manutencao: 'Em Manutenção',
  arquivado: 'Arquivado',
};

export const categoryLabels: Record<AssetCategory, string> = {
  notebook: 'Notebook',
  desktop: 'Desktop',
  servidor: 'Servidor',
  monitor: 'Monitor',
  impressora: 'Impressora',
  rede: 'Equipamento de Rede',
  periferico: 'Periférico',
  outros: 'Outros',
};

export const licenseStatusLabels: Record<LicenseStatus, string> = {
  ativa: 'Ativa',
  vencendo: 'Vencendo',
  vencida: 'Vencida',
  cancelada: 'Cancelada',
};

export const licenseTypeLabels: Record<LicenseType, string> = {
  perpetua: 'Perpétua',
  assinatura: 'Assinatura',
  volume: 'Volume',
  oem: 'OEM',
};

export const priorityLabels: Record<MaintenancePriority, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

export const maintenanceStatusLabels: Record<MaintenanceStatus, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  arquivado: 'Arquivado',
};

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  viewer: 'Visualizador',
};
