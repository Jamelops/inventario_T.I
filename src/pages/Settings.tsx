import { Link } from 'react-router-dom';
import { ChevronRight, FolderOpen, Shield, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  viewer: 'Visualizador',
};

export default function Settings() {
  const { categories = [] } = useData();
  const { userRole, isAdmin } = useAuth();
  const { suppliers = [] } = useTickets();
  
  const activeSuppliers = suppliers.filter(s => s.ativo);

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações do sistema"
        breadcrumbs={[{ label: 'Configurações' }]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seu Perfil de Acesso
            </CardTitle>
            <CardDescription>Nível de permissão atual no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Perfil:</span>
                <Badge variant={userRole === 'admin' ? 'default' : userRole === 'manager' ? 'secondary' : 'outline'}>
                  {userRole ? roleLabels[userRole] : 'Carregando...'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {userRole === 'admin' && 'Acesso total ao sistema, incluindo gerenciamento de usuários e configurações.'}
                {userRole === 'manager' && 'Pode criar e editar recursos, sem acesso às configurações avançadas.'}
                {userRole === 'viewer' && 'Apenas visualização, sem permissão de edição.'}
                {!userRole && 'Carregando permissões...'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Categorias de Ativos
              </CardTitle>
              <CardDescription>{categories?.length || 0} categorias configuradas</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/categories">
                Gerenciar
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories && categories.length > 0 ? (
                <>
                  {categories.slice(0, 4).map(cat => (
                    <div key={cat.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium text-sm">{cat.nome}</p>
                        <p className="text-xs text-muted-foreground">{cat.descricao}</p>
                      </div>
                    </div>
                  ))}
                  {categories.length > 4 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{categories.length - 4} categorias...
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma categoria configurada</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Fornecedores de Chamados
              </CardTitle>
              <CardDescription>{activeSuppliers?.length || 0} fornecedores ativos</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/settings/suppliers">
                Gerenciar
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeSuppliers && activeSuppliers.length > 0 ? (
                <>
                  {activeSuppliers.slice(0, 4).map(supplier => (
                    <div key={supplier.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium text-sm">{supplier.nome}</p>
                        <p className="text-xs text-muted-foreground">SLA: {supplier.slaHoras} horas</p>
                      </div>
                    </div>
                  ))}
                  {activeSuppliers.length > 4 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{activeSuppliers.length - 4} fornecedores...
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum fornecedor ativo</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
