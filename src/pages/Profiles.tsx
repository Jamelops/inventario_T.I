import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { UserCreationModal } from '@/components/UserCreationModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, CheckCircle, Clock, XCircle, Shield, Mail } from 'lucide-react';

interface FullProfile {
  id: string;
  user_id: string;
  username: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'manager' | 'viewer';
}

export default function Profiles() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<FullProfile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [activatingEmail, setActivatingEmail] = useState<string | null>(null);
  const [showUserCreationModal, setShowUserCreationModal] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Check auth and permissions
  useEffect(() => {
    if (loading) return;

    // If not authenticated, redirect to auth
    if (!user) {
      navigate('/auth');
      return;
    }

    // If not admin, redirect to home
    if (!isAdmin()) {
      navigate('/');
      return;
    }

    // Auth check complete
    setHasCheckedAuth(true);
  }, [user, loading, isAdmin, navigate]);

  // Only fetch if auth check passed
  useEffect(() => {
    if (!hasCheckedAuth) return;

    fetchProfiles();
    fetchUserRoles();
  }, [hasCheckedAuth]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to fetch profiles:', error);
        }
        return;
      }
      setProfiles(data as FullProfile[]);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to fetch user roles:', error);
        }
        return;
      }
      setUserRoles(data as UserRole[]);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching roles:', error);
      }
    }
  };

  const updateProfileStatus = async (userId: string, status: 'pending' | 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('user_id', userId);

    if (error) {
      return;
    }
    fetchProfiles();
  };

  const activateUserEmail = async (userEmail: string) => {
    setActivatingEmail(userEmail);
    try {
      const { data, error: supabaseError } = await supabase.rpc('confirm_user_email', {
        user_email: userEmail,
      });

      if (supabaseError) {
        console.error('Erro ao ativar email:', supabaseError);
        toast({
          title: 'Erro',
          description: 'Erro ao ativar email do usuário',
          variant: 'destructive',
        });
        return;
      }

      if (data?.success) {
        toast({
          title: 'Sucesso',
          description: 'Email ativado com sucesso!',
        });
        fetchProfiles();
      } else {
        toast({
          title: 'Erro',
          description: data?.error || 'Erro desconhecido ao ativar email',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Erro:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao ativar email',
        variant: 'destructive',
      });
    } finally {
      setActivatingEmail(null);
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'manager' | 'viewer') => {
    // Check if role exists
    const existingRole = userRoles.find(r => r.user_id === userId);
    
    if (existingRole) {
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);

      if (error) {
        return;
      }
    } else {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) {
        return;
      }
    }

    fetchUserRoles();
  };

  const getUserRole = (userId: string) => {
    return userRoles.find(r => r.user_id === userId)?.role || 'viewer';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pendente</Badge>;
    }
  };

  // Show loading during auth check
  if (loading || !hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Should not reach here if not admin (redirect happens in useEffect)
  if (!isAdmin()) {
    return null;
  }

  const pendingProfiles = profiles.filter(p => p.status === 'pending');
  const approvedProfiles = profiles.filter(p => p.status === 'approved');
  const rejectedProfiles = profiles.filter(p => p.status === 'rejected');

  return (
    <>
      <PageHeader
        title="Gerenciamento de Usuários"
        description="Aprove, rejeite e gerencie permissões de usuários"
        breadcrumbs={[{ label: 'Usuários' }]}
        actions={
          <Button
            size="sm"
            onClick={() => setShowUserCreationModal(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Usuário
          </Button>
        }
      />

      <UserCreationModal
        isOpen={showUserCreationModal}
        onClose={() => setShowUserCreationModal(false)}
        onSuccess={fetchProfiles}
      />

      <div>
        {/* Pending Approvals */}
        {pendingProfiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Aguardando Aprovação ({pendingProfiles.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingProfiles.map((profile) => (
                <Card key={profile.id} className="border-amber-200 bg-amber-50/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-amber-100 text-amber-800">
                          {profile.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{profile.username}</CardTitle>
                        <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Solicitado em {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => updateProfileStatus(profile.user_id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="flex-1"
                          onClick={() => updateProfileStatus(profile.user_id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => activateUserEmail(profile.email)}
                        disabled={activatingEmail === profile.email}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        {activatingEmail === profile.email ? 'Ativando...' : 'Ativar Email'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Approved Users */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Usuários Ativos ({approvedProfiles.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {approvedProfiles.map((profile) => {
              const role = getUserRole(profile.user_id);
              return (
                <Card key={profile.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {profile.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base truncate">{profile.username}</CardTitle>
                          {role === 'admin' && <Shield className="h-4 w-4 text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Permissão:</span>
                      <Select value={role} onValueChange={(value) => updateUserRole(profile.user_id, value as any)}>
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Gerente</SelectItem>
                          <SelectItem value="viewer">Visualizador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      {getStatusBadge(profile.status)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Rejected Users */}
        {rejectedProfiles.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Usuários Rejeitados ({rejectedProfiles.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rejectedProfiles.map((profile) => (
                <Card key={profile.id} className="opacity-60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {profile.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{profile.username}</CardTitle>
                        <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => updateProfileStatus(profile.user_id, 'approved')}
                    >
                      Reativar Usuário
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {profiles.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum usuário cadastrado ainda.</p>
          </div>
        )}
      </div>
    </>
  );
}