// src/lib/export-to-excel.ts

import ExcelJS from 'exceljs';

// Tipo CORRETO para configurar colunas customizadas
export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  format?: (value: any, row?: any) => string; // Função opcional para formatar o valor
}

// Tipo para opcoes de exportacao
export interface ExportOptions {
  filename?: string;
  sheetName?: string;
}

// Função para formatar data
export function formatDate(date: any): string {
  if (!date) return 'N/A';
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString('pt-BR');
  }
  if (date instanceof Date) {
    return date.toLocaleDateString('pt-BR');
  }
  return 'N/A';
}

// Função para formatar data e hora
export function formatDateTime(date: any): string {
  if (!date) return 'N/A';
  if (typeof date === 'string') {
    return new Date(date).toLocaleString('pt-BR');
  }
  if (date instanceof Date) {
    return date.toLocaleString('pt-BR');
  }
  return 'N/A';
}

// Função para formatar moeda
export function formatCurrency(value: any): string {
  if (!value) return 'R$ 0,00';
  const num = parseFloat(value);
  if (isNaN(num)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(num);
}

// Função auxiliar para formatar nomes de headers
function formatarHeader(header: string): string {
  return header
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Função principal de exportação
export async function exportToExcel(
  data: any[],
  columns: ExportColumn[],
  options?: ExportOptions
) {
  try {
    // Validacoes
    if (!data || data.length === 0) {
      alert('Nenhum dado para exportar');
      return;
    }

    if (!columns || columns.length === 0) {
      alert('Nenhuma coluna definida para exportacao');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheetName = options?.sheetName || 'Dados';
    const worksheet = workbook.addWorksheet(sheetName);

    // Validar que finalColumns e um array
    const finalColumns: ExportColumn[] = Array.isArray(columns) ? columns : [];
    
    if (finalColumns.length === 0) {
      throw new Error('Colunas devem ser um array nao vazio');
    }

    // Configurar colunas no worksheet
    worksheet.columns = finalColumns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width || 20
    }));

    // Estilo do cabecalho (azul com texto branco)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { 
      bold: true, 
      color: { argb: 'FFFFFFFF' } 
    };
    headerRow.fill = { 
      type: 'pattern', 
      pattern: 'solid', 
      fgColor: { argb: 'FF2563EB' } 
    };

    // Adicionar dados
    data.forEach((item) => {
      const row: any = {};
      
      finalColumns.forEach(col => {
        let value = item[col.key];
        
        // Usar formato customizado se existir
        if (col.format && typeof col.format === 'function') {
          try {
            value = col.format(value, item);
          } catch (error) {
            console.error(`Erro ao formatar coluna ${col.key}:`, error);
            value = String(value || 'N/A');
          }
        } else {
          // Formatacao automatica por tipo
          if (value instanceof Date) {
            value = formatDate(value);
          } else if (typeof value === 'number' && col.header.toLowerCase().includes('valor')) {
            value = formatCurrency(value);
          } else if (value !== null && value !== undefined) {
            value = String(value);
          } else {
            value = 'N/A';
          }
        }
        
        row[col.key] = value;
      });
      
      worksheet.addRow(row);
    });

    // Ajustar altura das linhas
    worksheet.eachRow((row) => {
      row.height = 20;
    });

    // Gerar arquivo e fazer download
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Usar metodo nativo do navegador para download
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Usar filename das opcoes ou criar padrao
    const filename = options?.filename || 'exportacao';
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `${filename}-${timestamp}.xlsx`;
    
    // Adicionar ao DOM, clicar e remover
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    alert('Arquivo exportado com sucesso!');

  } catch (error) {
    console.error('Erro detalhado ao exportar para Excel:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    alert(`Erro ao exportar: ${errorMessage}`);
  }
}
