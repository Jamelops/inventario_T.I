import { Bell, Search, User, ChevronDown, LogOut, UserCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useMaintenanceTasks } from '@/hooks/useMaintenanceTasks';

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  viewer: 'Visualizador',
};

export function AppHeader() {
  const navigate = useNavigate();
  const { licenses } = useData();
  const { profile, userRole, signOut, isAdmin } = useAuth();
  const { tasks } = useMaintenanceTasks();

  // Calculate notifications
  const expiringLicenses = licenses.filter(l => l.status === 'vencendo' || l.status === 'vencida').length;
  const pendingMaintenance = tasks.filter(t => t.status === 'pendente').length;
  const totalNotifications = expiringLicenses + pendingMaintenance;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const displayName = profile?.username || 'Usuário';
  const displayRole = userRole ? roleLabels[userRole] : 'Carregando...';

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b border-border bg-background px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar ativos, licenças..."
            className="w-64 pl-9 lg:w-80"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {totalNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {totalNotifications}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {expiringLicenses > 0 && (
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="font-medium">Licenças vencendo</span>
                <span className="text-xs text-muted-foreground">
                  {expiringLicenses} licença(s) precisam de atenção
                </span>
              </DropdownMenuItem>
            )}
            {pendingMaintenance > 0 && (
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="font-medium">Manutenções pendentes</span>
                <span className="text-xs text-muted-foreground">
                  {pendingMaintenance} tarefa(s) aguardando início
                </span>
              </DropdownMenuItem>
            )}
            {totalNotifications === 0 && (
              <DropdownMenuItem disabled>
                Nenhuma notificação
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden flex-col items-start text-left md:flex">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-muted-foreground">{displayRole}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/my-profile')}>
              <UserCircle className="h-4 w-4 mr-2" />
              Minha Conta
            </DropdownMenuItem>
            {isAdmin() && (
              <DropdownMenuItem onClick={() => navigate('/profiles')}>
                <Users className="h-4 w-4 mr-2" />
                Usuários
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
