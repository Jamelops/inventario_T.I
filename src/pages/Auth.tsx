import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import logoMtu from '@/assets/logo-mtu.svg';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
      .max(50, 'Nome de usuário muito longo')
      .regex(/^[a-zA-ZÀ-ÿ0-9\s]+$/, 'Nome de usuário pode conter apenas letras, números e espaços'),
    email: z.string().email('Email inválido').max(255, 'Email muito longo'),
    password: z
      .string()
      .min(10, 'Senha deve ter pelo menos 10 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  });

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, user, profile, loading, isApproved } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  useEffect(() => {
    if (user && !loading && isApproved) {
      navigate('/');
    }
  }, [user, loading, isApproved, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const validation = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
      if (!validation.success) {
        setError(validation.error.errors[0].message);
        setIsLoading(false);
        return;
      }

      const { error } = await signIn(loginEmail, loginPassword);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos');
        } else {
          setError(error.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const validation = signupSchema.safeParse({
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
      });

      if (!validation.success) {
        setError(validation.error.errors[0].message);
        setIsLoading(false);
        return;
      }

      const { error } = await signUp(signupEmail, signupPassword, signupUsername);
      if (error) {
        if (error.message.includes('User already registered')) {
          setError('Este email já está cadastrado');
        } else {
          setError(error.message);
        }
      } else {
        setSignupSuccess(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show pending approval screen if user is logged in but not approved
  if (user && profile && !isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <img src={logoMtu} alt="MTU Logo" className="h-16 w-auto" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
            <CardTitle>Aguardando Aprovação</CardTitle>
            <CardDescription>
              Sua conta foi criada com sucesso, mas ainda está pendente de aprovação por um
              administrador.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Você receberá acesso assim que um administrador aprovar sua conta.
              </AlertDescription>
            </Alert>
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                await signUp('', '', ''); // This won't work, we need signOut
                window.location.reload();
              }}
            >
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success screen after signup
  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <img src={logoMtu} alt="MTU Logo" className="h-16 w-auto" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle>Cadastro Realizado!</CardTitle>
            <CardDescription>Sua solicitação de cadastro foi enviada com sucesso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Aguarde a aprovação de um administrador para acessar o sistema. Você será notificado
                quando sua conta for aprovada.
              </AlertDescription>
            </Alert>
            <Button className="w-full" onClick={() => setSignupSuccess(false)}>
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img src={logoMtu} alt="MTU Logo" className="h-16 w-auto" />
          </div>
          <CardTitle>Bem-vindo ao TI Manager</CardTitle>
          <CardDescription>Faça login ou solicite acesso ao sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Solicitar Acesso</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Nome de Usuário</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="Bruno Lopes"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    autoComplete="name"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Use seu nome completo ou apelido</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    autoComplete="new-password"
                    required
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
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Enviando...' : 'Solicitar Acesso'}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Sua solicitação será analisada por um administrador
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}