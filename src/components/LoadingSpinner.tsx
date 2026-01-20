export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-slate-900">
      <div className="flex flex-col items-center gap-6">
        {/* Optimized spinner with reduced repaints */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary opacity-75 animate-spin" style={{ animationDuration: '0.8s' }}></div>
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-primary opacity-50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
        </div>
        
        {/* Animated text */}
        <div className="text-center">
          <p className="text-sm font-medium text-text-secondary mb-1">Carregando sessão...</p>
          <p className="text-xs text-text-secondary opacity-60">Aguarde um momento</p>
        </div>
      </div>
    </div>
  );
}

export function MiniLoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin" style={{ animationDuration: '0.6s' }}></div>
      </div>
    </div>
  );
}
