import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface HardwareSpecsFormProps {
  form: UseFormReturn<Record<string, unknown>>;
  categoria: string;
}

export function HardwareSpecsForm({ form, categoria }: HardwareSpecsFormProps) {
  const showSpecs = ['notebook', 'desktop', 'servidor'].includes(categoria);
  
  if (!showSpecs) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cpu className="h-5 w-5" />
          Especificações de Hardware
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="especificacoes.processador"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Processador</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Intel Core i7-1365U" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="especificacoes.memoriaRam"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Memória RAM</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 16GB DDR5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="especificacoes.armazenamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Armazenamento</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 512GB" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="especificacoes.tipoArmazenamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Armazenamento</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SSD">SSD</SelectItem>
                    <SelectItem value="HDD">HDD</SelectItem>
                    <SelectItem value="NVMe">NVMe</SelectItem>
                    <SelectItem value="RAID">RAID</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="especificacoes.placaVideo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa de Vídeo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: NVIDIA RTX 4060" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="especificacoes.sistemaOperacional"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sistema Operacional</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Windows 11 Pro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="especificacoes.portas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Portas</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 2x USB-C, 2x USB-A, HDMI" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="especificacoes.garantiaAte"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Garantia até</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
