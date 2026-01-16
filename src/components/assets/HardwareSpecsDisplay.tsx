import { Cpu, HardDrive, Monitor, Database, Server, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HardwareSpecs } from '@/types';

interface HardwareSpecsDisplayProps {
  specs?: HardwareSpecs;
  categoria: string;
}

export function HardwareSpecsDisplay({ specs, categoria }: HardwareSpecsDisplayProps) {
  const showSpecs = ['notebook', 'desktop', 'servidor'].includes(categoria);
  
  if (!showSpecs || !specs) {
    return null;
  }

  const specItems = [
    { icon: Cpu, label: 'Processador', value: specs.processador },
    { icon: Database, label: 'Memória RAM', value: specs.memoriaRam },
    { icon: HardDrive, label: 'Armazenamento', value: specs.armazenamento },
    { icon: Server, label: 'Tipo', value: specs.tipoArmazenamento },
    { icon: Monitor, label: 'Placa de Vídeo', value: specs.placaVideo },
    { icon: Monitor, label: 'Sistema Operacional', value: specs.sistemaOperacional },
    { icon: Server, label: 'Portas', value: specs.portas },
    { icon: Calendar, label: 'Garantia até', value: specs.garantiaAte },
  ].filter(item => item.value);

  if (specItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          Especificações de Hardware
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specItems.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-md">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
