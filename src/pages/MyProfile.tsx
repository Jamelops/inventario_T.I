import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MyProfile() {
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <Button variant="outline" onClick={handleLogout}>
          Sair
        </Button>
      </div>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>{profile.username}</CardTitle>
            <CardDescription>{profile.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-muted-foreground capitalize">
                {profile.status === 'approved' && 'Aprovado'}
                {profile.status === 'pending' && 'Aguardando aprovação'}
                {profile.status === 'rejected' && 'Rejeitado'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Membro desde</p>
              <p className="text-sm text-muted-foreground">
                {new Date(profile.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}