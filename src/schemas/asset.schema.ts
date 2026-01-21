import { z } from 'zod';

/**
 * 🔐 SECURITY: Input validation schemas using Zod
 * These schemas validate all user inputs before sending to backend
 * Prevents injection attacks, malformed data, and ensures data integrity
 */

export const AssetCreateSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Máximo 255 caracteres')
    .trim(),

  serialNumber: z.string()
    .min(1, 'Número de série é obrigatório')
    .max(100, 'Máximo 100 caracteres')
    .regex(/^[A-Z0-9\-.]+$/i, 'Apenas letras, números, hífens e pontos permitidos')
    .toUpperCase(),

  price: z.number()
    .positive('Preço deve ser maior que 0')
    .max(999999999, 'Preço muito alto')
    .multipleOf(0.01, 'Máximo 2 casas decimais'),

  category: z.enum(
    ['computador', 'impressora', 'mobile', 'servidor', 'networking', 'outro'],
    { errorMap: () => ({ message: 'Categoria inválida' }) }
  ),

  status: z.enum(
    ['ativo', 'inativo', 'descartado', 'manutenção'],
    { errorMap: () => ({ message: 'Status inválido' }) }
  ).optional().default('ativo'),

  location: z.string()
    .max(255, 'Máximo 255 caracteres')
    .optional()
    .nullable()
    .transform(val => val || null),

  description: z.string()
    .max(1000, 'Máximo 1000 caracteres')
    .optional()
    .nullable(),

  department: z.string()
    .max(100, 'Máximo 100 caracteres')
    .optional()
    .nullable(),
});

export const AssetUpdateSchema = AssetCreateSchema.partial();

export type AssetCreate = z.infer<typeof AssetCreateSchema>;
export type AssetUpdate = z.infer<typeof AssetUpdateSchema>;

/**
 * License validation schema
 */
export const LicenseCreateSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Máximo 255 caracteres')
    .trim(),

  licenseKey: z.string()
    .min(5, 'Chave de licença muito curta')
    .max(255, 'Máximo 255 caracteres')
    .regex(/^[A-Z0-9-]+$/i, 'Formato de chave inválido'),

  expiryDate: z.string()
    .refine(date => new Date(date) > new Date(), 'Data de expiração deve ser no futuro'),

  cost: z.number()
    .positive('Custo deve ser maior que 0')
    .max(999999999, 'Custo muito alto'),

  status: z.enum(['ativo', 'expirado', 'revogado']).optional().default('ativo'),
});

export const LicenseUpdateSchema = LicenseCreateSchema.partial();

export type LicenseCreate = z.infer<typeof LicenseCreateSchema>;
export type LicenseUpdate = z.infer<typeof LicenseUpdateSchema>;

/**
 * Maintenance validation schema
 */
export const MaintenanceCreateSchema = z.object({
  assetId: z.string()
    .uuid('ID de ativo inválido'),

  description: z.string()
    .min(5, 'Descrição muito curta')
    .max(1000, 'Máximo 1000 caracteres'),

  startDate: z.string()
    .refine(date => new Date(date) <= new Date(), 'Data de início não pode ser no futuro'),

  endDate: z.string().optional(),

  cost: z.number()
    .nonnegative('Custo não pode ser negativo')
    .max(999999999, 'Custo muito alto')
    .optional(),

  status: z.enum(['agendada', 'em_progresso', 'concluida', 'cancelada']).optional(),
});

export const MaintenanceUpdateSchema = MaintenanceCreateSchema.partial();

export type MaintenanceCreate = z.infer<typeof MaintenanceCreateSchema>;
export type MaintenanceUpdate = z.infer<typeof MaintenanceUpdateSchema>;

/**
 * Profile validation schema
 */
export const ProfileUpdateSchema = z.object({
  username: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-z0-9_-]+$/i, 'Apenas letras, números, hífens e underscores'),

  email: z.string()
    .email('Email inválido'),
});

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

/**
 * Utility function for safe validation
 */
export const validateInput = <T>(schema: z.ZodSchema, data: unknown): { success: boolean; data?: T; errors?: z.ZodError } => {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error
    };
  }

  return {
    success: true,
    data: result.data as T
  };
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: z.ZodError): Record<string, string> => {
  const formatted: Record<string, string> = {};
  
  errors.errors.forEach(error => {
    const path = error.path.join('.');
    formatted[path] = error.message;
  });
  
  return formatted;
};
