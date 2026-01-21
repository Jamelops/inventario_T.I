import ExcelJS from 'exceljs';

// Tipo CORRETO para configurar colunas customizadas
export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  format?: (value: any, row?: any) => string; // Função opcional para formatar o valor
}

// Interface para opções de exportação
export interface ExportOptions {
  filename: string;
  toast?: any; // Toast hook passado como parâmetro
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
    currency: 'BRL',
  }).format(num);
}

// Função principal de exportação
export async function exportToExcel(data: any[], columns: ExportColumn[], options: ExportOptions) {
  try {
    const toast = options?.toast;

    // Validação 1: Dados vazios
    if (!data || data.length === 0) {
      const message = 'Nenhum dado para exportar';

      if (toast && typeof toast.warning === 'function') {
        toast.warning(message, 5000);
      } else {
        alert(message);
      }
      return;
    }

    // Validação 2: Filename vazio
    if (!options || !options.filename) {
      const message = 'Nome do arquivo não fornecido';

      if (toast && typeof toast.error === 'function') {
        toast.error(message, 5000);
      } else {
        alert(message);
      }
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dados');

    // Se não houver colunas definidas, usar as chaves do primeiro objeto
    let finalColumns: ExportColumn[] = columns || [];

    if (finalColumns.length === 0) {
      const headers = Object.keys(data[0]);
      finalColumns = headers.map((header) => ({
        key: header,
        header: formatarHeader(header),
        width: 20,
      }));
    }

    // Configurar colunas
    worksheet.columns = finalColumns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 20,
    }));

    // Estilo do cabeçalho (azul com texto branco)
    const headerRow = worksheet.getRow(1);
    headerRow.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };

    // Adicionar dados
    data.forEach((item) => {
      const row: any = {};

      finalColumns.forEach((col) => {
        let value = item[col.key];

        // Usar format customizado se existir
        if (col.format) {
          value = col.format(value, item);
        } else {
          // Formatação automática por tipo
          if (value instanceof Date) {
            value = formatDate(value);
          } else if (typeof value === 'number' && col.header.toLowerCase().includes('valor')) {
            value = formatCurrency(value);
          }
        }

        row[col.key] = value || 'N/A';
      });

      worksheet.addRow(row);
    });

    // Ajustar altura das linhas
    worksheet.eachRow((row) => {
      row.height = 20;
    });

    // Gerar arquivo e fazer download
    const buffer = await workbook.xlsx.writeBuffer();

    // Usar método nativo do navegador para download
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${options.filename}-${new Date().toISOString().split('T')[0]}.xlsx`;

    // Adicionar ao DOM, clicar e remover
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    // ✅ SUCESSO - COM DURAÇÃO AUMENTADA (6 segundos)
    const successMessage = '✅ Arquivo exportado com sucesso!';

    if (toast && typeof toast.success === 'function') {
      toast.success(successMessage, 6000); // 6 segundos para o usuário ver
    } else {
      alert(successMessage);
    }
  } catch (error) {
    console.error('❌ ERRO ao exportar para Excel:', error);

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const finalMessage = `❌ Erro ao exportar: ${errorMessage}`;

    if (options.toast && typeof options.toast.error === 'function') {
      options.toast.error(finalMessage, 6000); // 6 segundos para o usuário ver
    } else {
      alert(finalMessage);
    }
  }
}

// Função auxiliar para formatar nomes de headers
function formatarHeader(header: string): string {
  return header
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
