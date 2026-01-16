import { useState, useCallback } from 'react';
import { useToast } from '@/contexts/ToastContext';

export interface ExportOptions {
  fileName?: string;
  sheetName?: string;
  data: any[];
  columns?: string[];
}

export interface ExportState {
  isLoading: boolean;
  progress: number;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

export function useExport() {
  const [state, setState] = useState<ExportState>({
    isLoading: false,
    progress: 0,
    status: 'idle',
    error: null,
  });

  const { showSuccess, showError } = useToast();

  const simulateProgress = useCallback(
    (onProgressUpdate: (progress: number) => void) => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 30;
        if (currentProgress > 90) currentProgress = 90;
        onProgressUpdate(currentProgress);
      }, 300);
      return interval;
    },
    []
  );

  const exportToExcel = useCallback(
    async (options: ExportOptions) => {
      const { fileName = 'dados.xlsx', sheetName = 'Dados', data, columns } =
        options;

      setState({
        isLoading: true,
        progress: 0,
        status: 'loading',
        error: null,
      });

      try {
        // Simulate progress
        const progressInterval = simulateProgress((progress) => {
          setState((prev) => ({ ...prev, progress: Math.round(progress) }));
        });

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Dynamic import XLSX
        const XLSX = await import('xlsx');

        // Prepare data
        const worksheet = XLSX.utils.json_to_sheet(data, { header: columns });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Update progress
        clearInterval(progressInterval);
        setState((prev) => ({ ...prev, progress: 100 }));

        // Write file
        await new Promise((resolve) => setTimeout(resolve, 500));
        XLSX.writeFile(workbook, fileName);

        // Success state
        setState({
          isLoading: false,
          progress: 100,
          status: 'success',
          error: null,
        });

        // Show toast
        showSuccess(
          `Arquivo "${fileName}" exportado com sucesso!`,
          4000
        );

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido';

        clearInterval();
        setState({
          isLoading: false,
          progress: 0,
          status: 'error',
          error: errorMessage,
        });

        showError(
          `Erro ao exportar: ${errorMessage}`,
          4000
        );

        return false;
      }
    },
    [simulateProgress, showSuccess, showError]
  );

  const exportToCSV = useCallback(
    async (options: Omit<ExportOptions, 'sheetName'>) => {
      const { fileName = 'dados.csv', data } = options;

      setState({
        isLoading: true,
        progress: 0,
        status: 'loading',
        error: null,
      });

      try {
        const progressInterval = simulateProgress((progress) => {
          setState((prev) => ({ ...prev, progress: Math.round(progress) }));
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(worksheet);

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);

        clearInterval(progressInterval);
        setState({
          isLoading: false,
          progress: 100,
          status: 'success',
          error: null,
        });

        showSuccess(`Arquivo "${fileName}" exportado com sucesso!`, 4000);
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido';

        clearInterval();
        setState({
          isLoading: false,
          progress: 0,
          status: 'error',
          error: errorMessage,
        });

        showError(`Erro ao exportar: ${errorMessage}`, 4000);
        return false;
      }
    },
    [simulateProgress, showSuccess, showError]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      status: 'idle',
      error: null,
    });
  }, []);

  return {
    ...state,
    exportToExcel,
    exportToCSV,
    reset,
  };
}
