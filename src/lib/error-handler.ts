/**
 * 🔐 SECURITY: Error handling utility
 * Prevents exposure of sensitive information in error messages
 * Maps backend errors to user-friendly messages
 */

import type { Toast } from 'sonner';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface HandleErrorOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  fallbackMessage?: string;
  toastFn?: (message: string) => void;
}

/**
 * Map of sensitive error patterns to user-friendly messages
 * Prevents exposing database structure, queries, or internal details
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
  // Database errors
  'duplicate key value': 'Esse registro já existe',
  'unique constraint': 'Esse valor já foi utilizado',
  'not-null constraint': 'Este campo é obrigatório',
  'foreign key constraint': 'Referência inválida',
  'permission denied': 'Você não tem permissão para esta ação',
  'relation does not exist': 'Recurso não encontrado',
  'syntax error': 'Erro na requisição (dados inválidos)',

  // Auth errors
  'new row violates row-level security': 'Acesso negado a este recurso',
  'jwt expired': 'Sua sessão expirou. Por favor, faça login novamente',
  'jwt malformed': 'Token inválido',
  'invalid password': 'Email ou senha incorretos',
  'user not found': 'Email ou senha incorretos',
  'user already exists': 'Este email já está cadastrado',
  'authentication failed': 'Falha na autenticação',
  'email not confirmed': 'Por favor, confirme seu email antes de acessar',
  'user not identified': 'Você precisa estar autenticado para acessar isso',

  // Network errors
  'network error': 'Erro de conexão. Verifique sua internet',
  timeout: 'Requisição expirou. Tente novamente',
  'failed to fetch': 'Falha ao conectar com o servidor',

  // Rate limiting
  'too many requests': 'Muitas requisiões. Por favor, aguarde alguns minutos',
  'rate limit exceeded': 'Limite de requisiões excedido',
};

/**
 * Extract user-friendly error message from API error
 */
const getUserMessage = (error: any): string => {
  // If it's already a user-friendly message, return it
  if (typeof error === 'string') {
    return error;
  }

  const errorMessage =
    error?.message || error?.error || JSON.stringify(error) || 'Erro desconhecido';
  const errorMessageLower = errorMessage.toLowerCase();

  // Check against known error patterns
  for (const [pattern, message] of Object.entries(ERROR_MESSAGE_MAP)) {
    if (errorMessageLower.includes(pattern.toLowerCase())) {
      return message;
    }
  }

  // If it's a custom user message (from Zod validation, etc), return it
  if (error?.userMessage) {
    return error.userMessage;
  }

  // Default fallback
  return 'Algo deu errado. Por favor, tente novamente';
};

/**
 * Main error handler function
 * Use this in try-catch blocks throughout the app
 * 
 * IMPORTANT: Pass toastFn from components to avoid Rules of Hooks violations
 * Example:
 *   const { toast } = useToast();
 *   handleApiError(error, { showToast: true, toastFn: (msg) => toast.error(msg) });
 */
export const handleApiError = (
  error: any,
  options: HandleErrorOptions = {}
): ApiError => {
  const {
    showToast = true,
    logToConsole = import.meta.env.DEV,
    fallbackMessage = 'Erro ao processar requisição',
    toastFn,
  } = options;

  // Log full error in development only
  if (logToConsole && import.meta.env.DEV) {
    console.error('[API Error]', {
      timestamp: new Date().toISOString(),
      error,
      stack: error?.stack,
    });
  }

  // Log sanitized error in production (to monitoring service)
  if (import.meta.env.PROD) {
    // Send to error tracking service (Sentry, LogRocket, etc)
    // sendToErrorTracking({ error, timestamp: new Date() });
  }

  const userMessage = getUserMessage(error) || fallbackMessage;
  const statusCode = error?.status || error?.statusCode || 500;

  const apiError: ApiError = {
    message: userMessage,
    status: statusCode,
    code: error?.code,
  };

  // Show toast notification if toastFn is provided
  if (showToast && toastFn) {
    toastFn(userMessage);
  }

  return apiError;
};

/**
 * Handle specific error types
 */
export const handleErrorByType = (error: any) => {
  const status = error?.status || error?.statusCode;

  switch (status) {
    case 400:
      return {
        message: 'Dados inválidos. Verifique o formulário',
        severity: 'warning',
      };

    case 401:
      return {
        message: 'Sua sessão expirou. Por favor, faça login novamente',
        severity: 'error',
        action: 'logout',
      };

    case 403:
      return {
        message: 'Você não tem permissão para acessar isto',
        severity: 'error',
        action: 'redirect_home',
      };

    case 404:
      return {
        message: 'Recurso não encontrado',
        severity: 'error',
        action: 'redirect_back',
      };

    case 409:
      return {
        message: 'Esse registro já existe',
        severity: 'warning',
      };

    case 429:
      return {
        message: 'Muitas requisições. Por favor, aguarde',
        severity: 'error',
      };

    case 500:
    case 502:
    case 503:
      return {
        message: 'Erro no servidor. Tente novamente mais tarde',
        severity: 'error',
      };

    default:
      return {
        message: 'Algo deu errado',
        severity: 'error',
      };
  }
};

/**
 * Safe error logging (doesn't expose sensitive data)
 */
export const safeLogError = (context: string, error: any) => {
  if (import.meta.env.PROD) {
    // In production, send to error tracking service
    console.log(`[${context}] Error occurred at ${new Date().toISOString()}`);
    // sendToMonitoring(context, error);
  } else {
    // In development, log full details
    console.error(`[${context}]`, error);
  }
};

/**
 * Create a safe error for API responses
 */
export const createSafeApiError = (error: any) => {
  return {
    error: {
      message: getUserMessage(error),
      ...(import.meta.env.DEV && { originalError: error.message }),
    },
  };
};
