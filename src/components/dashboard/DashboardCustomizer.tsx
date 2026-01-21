import { useState } from 'react';
import { Settings2, GripVertical, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DashboardWidget } from '@/types';

interface DashboardCustomizerProps {
  widgets: DashboardWidget[];
  onUpdateWidgets: (widgets: DashboardWidget[]) => void;
}

const defaultWidgets: DashboardWidget[] = [
  { id: 'kpis', title: 'KPIs', visible: true, order: 0 },
  { id: 'chart', title: 'Gráfico de Categorias', visible: true, order: 1 },
  { id: 'licenses', title: 'Licenças Vencendo', visible: true, order: 2 },
  { id: 'maintenance', title: 'Manutenções Pendentes', visible: true, order: 3 },
];

export function DashboardCustomizer({ widgets, onUpdateWidgets }: DashboardCustomizerProps) {
  const [localWidgets, setLocalWidgets] = useState<DashboardWidget[]>(widgets);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleToggleVisibility = (id: string) => {
    setLocalWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w)));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newWidgets = [...localWidgets];
    const draggedWidget = newWidgets[draggedIndex];
    newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(index, 0, draggedWidget);

    // Update order
    newWidgets.forEach((w, i) => {
      w.order = i;
    });

    setLocalWidgets(newWidgets);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    onUpdateWidgets(localWidgets);
  };

  const handleReset = () => {
    setLocalWidgets(defaultWidgets);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Personalizar
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Personalizar Dashboard</SheetTitle>
          <SheetDescription>
            Arraste para reordenar e use os switches para mostrar/ocultar widgets.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-2">
          {localWidgets
            .sort((a, b) => a.order - b.order)
            .map((widget, index) => (
              <div
                key={widget.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-3 rounded-lg border bg-card cursor-move transition-colors ${
                  draggedIndex === index ? 'border-primary bg-accent' : ''
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 flex items-center justify-between">
                  <Label
                    htmlFor={`widget-${widget.id}`}
                    className={`cursor-pointer ${!widget.visible ? 'text-muted-foreground' : ''}`}
                  >
                    {widget.title}
                  </Label>
                  <div className="flex items-center gap-2">
                    {widget.visible ? (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Switch
                      id={`widget-${widget.id}`}
                      checked={widget.visible}
                      onCheckedChange={() => handleToggleVisibility(widget.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>

        <SheetFooter className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Salvar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export { defaultWidgets };
