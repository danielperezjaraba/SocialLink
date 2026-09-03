import { z } from 'zod';

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2, 'El nombre es muy corto.').max(120).optional(),
    profile: z.enum(['estudiante', 'docente', 'profesional']).optional(),
    institution: z.string().trim().max(160).optional(),
    // Mientras no exista pasarela de pago, el cambio de plan se hace directo.
    // Cuando se integre el cobro, este campo debe salir de aquí y moverse a un
    // endpoint que solo escriba tras confirmar el pago.
    plan: z.enum(['free', 'premium', 'institucional']).optional(),
  })
  .refine((patch) => Object.values(patch).some((value) => value !== undefined), {
    message: 'No enviaste ningún cambio.',
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
