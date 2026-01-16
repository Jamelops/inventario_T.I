import { User } from '@/types';

/**
 * Mock users for UI display purposes only.
 * Real user authentication is handled by Supabase Auth.
 * This is used only for currentUser display in DataContext.
 */
export const mockUsers: User[] = [
  { id: 'USR-001', nome: 'Usuário TI', email: 'ti@empresa.com', role: 'admin', avatar: '' },
];
