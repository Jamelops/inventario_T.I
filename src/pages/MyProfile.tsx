import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Save, User, Mail, Shield, Lock } from 'lucide-react';

export default function MyProfile() {
  const { user, profile, userRole, loading, fetchProfileUsernames } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync form field when profile loads
      setUsername(profile.username);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || !username.trim()) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username: username.trim(), updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    setIsSaving(false);

    if (error) {
      return;
    }

    // Refresh usernames list
    fetchProfileUsernames();
  };

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      default:
        return 'Visualizador';
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pendente</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div>
      <PageHeader
        title="Minha Conta"
        description="Visualize e edite suas informações pessoais"
        breadcrumbs={[{ label: 'Minha Conta' }]}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {profile.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{profile.username}</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu nome"
                />
                <p className="text-xs text-muted-foreground">
                  Este nome será exibido em todo o sistema.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{profile.email}</span>
                </div>
                <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
              </div>

              <Button onClick={handleSave} disabled={isSaving || username === profile.username}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissões e Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Permissão</span>
              <Badge variant="outline">{getRoleLabel(userRole)}</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Status da Conta</span>
              {getStatusBadge(profile.status)}
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Membro desde</span>
              <span className="text-sm text-muted-foreground">
                {new Date(profile.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <Button 
              onClick={() => setIsChangePasswordOpen(true)}
              variant="outline"
              className="w-full mt-2"
            >
              <Lock className="h-4 w-4 mr-2" />
              Alterar Senha
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
