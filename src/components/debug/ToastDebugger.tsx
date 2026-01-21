import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';

export function ToastDebugger() {
  const toast = useToast();

  const handleTestSuccess = () => {
    console.log('%c[ToastDebugger] Chamando toast.success()', 'color: green; font-weight: bold;');
    toast.success('✅ Teste de sucesso!');
  };

  const handleTestError = () => {
    console.log('%c[ToastDebugger] Chamando toast.error()', 'color: red; font-weight: bold;');
    toast.error('❌ Teste de erro!');
  };

  const handleTestWarning = () => {
    console.log('%c[ToastDebugger] Chamando toast.warning()', 'color: orange; font-weight: bold;');
    toast.warning('⚠️ Teste de aviso!');
  };

  const handleTestInfo = () => {
    console.log('%c[ToastDebugger] Chamando toast.info()', 'color: blue; font-weight: bold;');
    toast.info('ℹ️ Teste de informação!');
  };

  const handleTestEmpty = () => {
    console.log(
      '%c[ToastDebugger] Chamando toast.success com string vazia',
      'color: gray; font-weight: bold;'
    );
    toast.success('');
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border">
      <h3 className="font-bold mb-3 text-sm">🧪 Toast Debugger</h3>
      <div className="flex flex-col gap-2">
        <Button size="sm" onClick={handleTestSuccess} className="text-xs">
          Success
        </Button>
        <Button size="sm" onClick={handleTestError} variant="destructive" className="text-xs">
          Error
        </Button>
        <Button size="sm" onClick={handleTestWarning} variant="outline" className="text-xs">
          Warning
        </Button>
        <Button size="sm" onClick={handleTestInfo} variant="outline" className="text-xs">
          Info
        </Button>
        <Button size="sm" onClick={handleTestEmpty} variant="ghost" className="text-xs">
          Empty
        </Button>
      </div>
      <p className="text-xs mt-3 text-muted-foreground">Abra o Console (F12) para ver logs</p>
    </div>
  );
}
