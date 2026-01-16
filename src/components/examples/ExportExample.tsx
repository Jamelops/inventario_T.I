import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import { useExport } from '@/hooks/useExport';
import { useToast } from '@/contexts/ToastContext';
import { ExportModal } from '@/components/ui/ExportModal';

// Example data structure
const SAMPLE_DATA = [
  {
    id: '001',
    nome: 'Notebook Dell',
    categoria: 'Computadores',
    status: 'Ativo',
    dataCompra: '2023-01-15',
    valor: 'R$ 3.500,00',
  },
  {
    id: '002',
    nome: 'Monitor LG 24\"',
    categoria: 'Periféricos',
    status: 'Ativo',
    dataCompra: '2023-02-20',
    valor: 'R$ 1.200,00',
  },
  {
    id: '003',
    nome: 'Teclado Mecânico',
    categoria: 'Periféricos',
    status: 'Inativo',
    dataCompra: '2022-06-10',
    valor: 'R$ 450,00',
  },
  {
    id: '004',
    nome: 'Mouse sem fio',
    categoria: 'Periféricos',
    status: 'Ativo',
    dataCompra: '2023-03-05',
    valor: 'R$ 150,00',
  },
];

export function ExportExample() {
  const { isLoading, progress, status, exportToExcel } = useExport();
  const { showWarning, showInfo } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExportClick = () => {
    setIsModalOpen(true);
    handleExport();
  };

  const handleExport = async () => {
    try {
      const success = await exportToExcel({
        fileName: 'inventario_mtu.xlsx',
        sheetName: 'Inventário',
        data: SAMPLE_DATA,
        columns: [
          'id',
          'nome',
          'categoria',
          'status',
          'dataCompra',
          'valor',
        ],
      });

      if (success) {
        showInfo('Arquivo pronto para download', 3000);
      }
    } catch (error) {
      showWarning('Verifique se a XLSX está instalada', 4000);
    }
  };

  const handleRetry = () => {
    handleExport();
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Exemplo de Exportação
        </h1>

        {/* Export Button */}
        <button
          onClick={handleExportClick}
          disabled={isLoading}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium
            transition-all duration-200
            ${isLoading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'}
          `}
        >
          <FileDown className="w-5 h-5" />
          {isLoading ? 'Exportando...' : 'Exportar para Excel'}
        </button>

        {/* Data Preview */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Dados a Exportar
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    ID
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Nome
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Categoria
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_DATA.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {item.id}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {item.nome}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {item.categoria}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'Ativo'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {item.valor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Dica:</strong> Clique no botão acima para exportar os dados
            para um arquivo Excel. A notificação de sucesso aparecerá no canto
            inferior direito.
          </p>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Exportando inventário"
        description="Por favor, aguarde enquanto seus dados são processados..."
        isLoading={isLoading}
        progress={progress}
        status={status}
        fileName="inventario_mtu.xlsx"
        fileSize="1.2 MB"
        onRetry={handleRetry}
      />
    </div>
  );
}

export default ExportExample;
