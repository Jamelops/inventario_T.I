import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/hooks/use-toast";
import type { License, LicenseType, LicenseStatus } from "@/types";

const licenseSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  fornecedor: z.string().optional(),
  tipo: z.enum(["perpetua", "assinatura", "volume", "oem"]),
  quantidadeTotal: z.coerce.number().min(1, "Quantidade deve ser maior que zero"),
  quantidadeUsada: z.coerce.number().min(0, "Quantidade em uso deve ser positiva"),
  dataVencimento: z.string().min(1, "Data de vencimento é obrigatória"),
  notas: z.string().optional(),
});

type LicenseFormData = z.infer<typeof licenseSchema>;

const LicenseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { licenses, addLicense, updateLicense } = useData();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = Boolean(id);
  const existingLicense = isEditing ? licenses.find((l) => l.id === id) : null;

  const form = useForm<LicenseFormData>({
    resolver: zodResolver(licenseSchema),
    defaultValues: {
      nome: "",
      fornecedor: "",
      tipo: "assinatura" as LicenseType,
      quantidadeTotal: 1,
      quantidadeUsada: 0,
      dataVencimento: "",
      notas: "",
    },
  });

  useEffect(() => {
    if (existingLicense) {
      form.reset({
        nome: existingLicense.nome,
        fornecedor: existingLicense.fornecedor || "",
        tipo: existingLicense.tipo,
        quantidadeTotal: existingLicense.quantidadeTotal,
        quantidadeUsada: existingLicense.quantidadeUsada,
        dataVencimento: existingLicense.dataVencimento,
        notas: existingLicense.notas || "",
      });
    }
  }, [existingLicense, form]);

  const calculateStatus = (dataVencimento: string): LicenseStatus => {
    const expDate = new Date(dataVencimento);
    const today = new Date();
    const daysUntilExpiration = Math.ceil(
      (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiration < 0) return "vencida";
    if (daysUntilExpiration <= 30) return "vencendo";
    return "ativa";
  };

  const onSubmit = async (data: LicenseFormData) => {
    if (data.quantidadeUsada > data.quantidadeTotal) {
      form.setError("quantidadeUsada", {
        message: "Quantidade em uso não pode ser maior que a total",
      });
      return;
    }

    setIsLoading(true);
    try {
      const status = calculateStatus(data.dataVencimento);

      if (isEditing && existingLicense) {
        const success = await updateLicense(existingLicense.id, {
          ...data,
          status,
        });
        if (success) {
          navigate("/licenses");
        }
      } else {
        const result = await addLicense({
          nome: data.nome,
          tipo: data.tipo,
          quantidadeTotal: data.quantidadeTotal,
          quantidadeUsada: data.quantidadeUsada,
          dataVencimento: data.dataVencimento,
          status,
          fornecedor: data.fornecedor || undefined,
          notas: data.notas || undefined,
        });
        if (result) {
          navigate("/licenses");
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a licença.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const typeOptions: { value: LicenseType; label: string }[] = [
    { value: "assinatura", label: "Assinatura" },
    { value: "perpetua", label: "Perpétua" },
    { value: "volume", label: "Volume" },
    { value: "oem", label: "OEM" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/licenses")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={isEditing ? "Editar Licença" : "Nova Licença"}
          description={
            isEditing
              ? "Atualize as informações da licença"
              : "Preencha os dados para cadastrar uma nova licença"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Licença</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Software</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Microsoft Office 365" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fornecedor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornecedor</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Microsoft" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Licença</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {typeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataVencimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Vencimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantidadeTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade Total</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantidadeUsada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade em Uso</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informações adicionais sobre a licença..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/licenses")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Salvar"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LicenseForm;
