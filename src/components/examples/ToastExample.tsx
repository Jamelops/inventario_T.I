import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';

export function ToastExample() {
  const toast = useToast();

  return (
    <div className="flex flex-col gap-3 p-6 bg-card rounded-lg border">
      <h3 className="text-lg font-semibold">Exemplos de Toast Notifications</h3>
      <p className="text-sm text-muted-foreground">
        Clique nos botões abaixo para testar os diferentes tipos de notificações:
      </p>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Button
          onClick={() => toast.success('Sucesso! Operação realizada com éxito.')}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Success
        </Button>

        <Button
          onClick={() => toast.error('Erro! Ocorreu um problema na operação.')}
          className="bg-red-600 hover:bg-red-700"
        >
          Error
        </Button>

        <Button
          onClick={() => toast.warning('Atenção! Verifique seus dados antes de continuar.')}
          className="bg-amber-600 hover:bg-amber-700"
        >
          Warning
        </Button>

        <Button
          onClick={() => toast.info('Informação: Seu cadastro foi atualizado.')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Info
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Button
          onClick={() => toast.success('Toast de 10 segundos', 10000)}
          variant="outline"
        >
          Success (10s)
        </Button>

        <Button
          onClick={() => toast.error('Toast permanente', 0)}
          variant="outline"
        >
          Error (Permanente)
        </Button>
      </div>

      <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
        <p className="font-mono text-xs">
          {`const toast = useToast();
toast.success("Mensagem de sucesso");
toast.error("Mensagem de erro");
toast.warning("Mensagem de aviso");
toast.info("Mensagem de informação");

// Com duração customizada:
toast.success("Mensagem", 5000); // 5 segundos`}
        </p>
      </div>
    </div>
  );
}
