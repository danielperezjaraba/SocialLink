import { z } from 'zod';

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'El correo es obligatorio.')
  .email('Escribe un correo válido.');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es muy corto.').max(120),
  email,
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(128, 'La contraseña es demasiado larga.'),
  profile: z.enum(['estudiante', 'docente', 'profesional']),
  institution: z.string().trim().max(160).default(''),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Escribe tu contraseña.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
