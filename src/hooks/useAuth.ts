import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import type { AuthContextType } from '@/contexts/AuthContext';

/**
 * Hook para acessar o contexto de autenticação
 * @returns AuthContextType com user, session, profile, etc.
 * @throws Error se usado fora de um AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Make sure AuthProvider is wrapping your component tree.'
    );
  }
  
  return context;
}
