import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/useToast';

export function ToastProgressBar() {
  const { toasts } = useToast();
  const [progress, setProgress] = useState(100);

  // Pega o primeiro toast ativo
  const activeToast = toasts.length > 0 ? toasts[0] : null;
  const duration = activeToast?.duration || 4000;

  // Cores por tipo de toast
  const colorMap = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
  };

  const progressColor = activeToast ? colorMap[activeToast.type as keyof typeof colorMap] : 'bg-gray-300';

  // Anima a barra de progresso
  useEffect(() => {
    if (!activeToast || duration <= 0) {
      setProgress(100);
      return;
    }

    setProgress(100);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 50));
        return newProgress > 0 ? newProgress : 0;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [activeToast?.id, duration]);

  // Se não há toast ativo, não mostra nada
  if (!activeToast) return null;

  return (
    <div
      className="h-1 w-full fixed top-0 left-0 z-[9998] bg-transparent"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full transition-all ${progressColor}`}
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}