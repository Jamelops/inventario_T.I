import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Download, Loader } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
  progress?: number;
  status?: 'idle' | 'loading' | 'success' | 'error';
  fileName?: string;
  fileSize?: string;
  errorMessage?: string;
  onRetry?: () => void;
}

export function ExportModal({
  isOpen,
  onClose,
  title = 'Exportando dados',
  description = 'Por favor, aguarde enquanto seus dados são processados...',
  isLoading = false,
  progress = 0,
  status = 'idle',
  fileName = 'dados.xlsx',
  fileSize = '2.4 MB',
  errorMessage = 'Ocorreu um erro ao exportar os dados',
  onRetry,
}: ExportModalProps) {
  const { showSuccess, showError } = useToast();
  const [isVisible, setIsVisible] = useState(isOpen);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible && !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black transition-opacity duration-300
          ${isOpen ? 'opacity-50' : 'opacity-0'}
          ${isOpen ? '' : 'pointer-events-none'}
        `}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`
          fixed inset-0 flex items-center justify-center p-4 z-50
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div
          className={`
            bg-white dark:bg-gray-800 rounded-xl shadow-2xl
            max-w-md w-full p-8
            transform transition-all duration-300
            ${isOpen ? 'scale-100' : 'scale-95'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          {status !== 'loading' && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Idle / Loading State */}
          {status === 'idle' || status === 'loading' ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="relative w-20 h-20 bg-blue-50 dark:bg-blue-950 rounded-full flex items-center justify-center">
                  {status === 'loading' ? (
                    <Loader className="w-10 h-10 text-blue-500 animate-spin" />
                  ) : (
                    <Download className="w-10 h-10 text-blue-500" />
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
                {title}
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                {description}
              </p>

              {/* Progress Bar */}
              {status === 'loading' && progress > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progresso
                    </span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-teal-500 h-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Loading Tips */}
              {status === 'loading' && (
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    Não feche esta janela durante a exportação
                  </p>
                </div>
              )}

              {/* Cancel Button */}
              {status === 'idle' && (
                <button
                  onClick={handleClose}
                  className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </>
          ) : null}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="relative w-20 h-20 bg-green-50 dark:bg-green-950 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500 animate-bounce" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
                Exportação Concluída!
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Seus dados foram exportados com sucesso.
              </p>

              {/* File Info */}
              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100 text-sm">
                      {fileName}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400">
                      {fileSize}
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Fechar
              </button>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="relative w-20 h-20 bg-red-50 dark:bg-red-950 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
                Erro na Exportação
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                {errorMessage}
              </p>

              {/* Error Details */}
              <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Por favor, tente novamente mais tarde ou entre em contato com o suporte se o problema persistir.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Tentar Novamente
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default ExportModal;
