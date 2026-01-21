import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { z } from 'zod';

const signupSchema = z.object({
  username: z.string()
    .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
    .max(50, 'Nome de usuário muito longo')
    .regex(/^[a-zA-ZÀ-ÿ0-9\s]+$/, 'Nome de usuário pode conter apenas letras, números e espaços'),
  email: z.string().email('Email inválido').max(255, 'Email muito longo'),
  password: z.string()
    .min(10, 'Senha deve ter pelo menos 10 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

interface UserSignupFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function UserSignupForm({ onSuccess, onClose }: UserSignupFormProps) {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const validation = signupSchema.safeParse({
        username,
        email,
        password,
        confirmPassword,
      });
      
      if (!validation.success) {
        setError(validation.error.errors[0].message);
        setIsLoading(false);
        return;
      }

      const { error: signupError } = await signUp(email, password, username);
      if (signupError) {
        if (signupError.message.includes('User already registered')) {
          setError('Este email já está cadastrado');
        } else {
          setError(signupError.message);
        }
      } else {
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError(null);
        onSuccess?.();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="signup-username">Nome de Usuário</Label>
        <Input
          id="signup-username"
          type="text"
          placeholder="Bruno Lopes"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Use seu nome completo ou apelido
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Senha</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Mínimo 10 caracteres, com maiúscula, minúscula e número
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-confirm">Confirmar Senha</Label>
        <Input
          id="signup-confirm"
          type="password"
          placeholder="Repita sua senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={isLoading}
        >
          {isLoading ? 'Criando usuário...' : 'Criar Usuário'}
        </Button>
        {onClose && (
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}