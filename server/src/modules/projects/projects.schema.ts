import { z } from 'zod';

const entityDataSchema = z.object({
  shape: z.enum(['male', 'female', 'unknown', 'pregnancy', 'resource']),
  name: z.string().max(160).default(''),
  age: z.string().max(20).default(''),
  sex: z.enum(['', 'M', 'F', 'X']).default(''),
  birthDate: z.string().max(20).default(''),
  occupation: z.string().max(160).default(''),
  kinship: z.string().max(160).default(''),
  cohabits: z.boolean().default(true),
  deceased: z.boolean().default(false),
  isIndex: z.boolean().default(false),
  notes: z.string().max(2000).default(''),
});

/**
 * El lienzo añade a cada figura datos propios de dibujo (medidas, selección).
 * Al no declararlos, el validador los descarta y a la base solo llega el
 * contenido del caso.
 */
const nodeSchema = z.object({
  id: z.string().min(1).max(64),
  type: z.literal('entity').default('entity'),
  position: z.object({ x: z.number().finite(), y: z.number().finite() }),
  data: entityDataSchema,
});

const edgeSchema = z.object({
  id: z.string().min(1).max(64),
  type: z.literal('relation').default('relation'),
  source: z.string().min(1).max(64),
  target: z.string().min(1).max(64),
  sourceHandle: z.string().max(64).nullish(),
  targetHandle: z.string().max(64).nullish(),
  data: z.object({
    relation: z.enum([
      'union',
      'cohabitation',
      'separation',
      'divorce',
      'child',
      'adoption',
      'strong',
      'weak',
      'conflictive',
      'stressful',
      'none',
    ]),
    note: z.string().max(2000).default(''),
  }),
});

/** Los topes evitan que una petición manipulada intente escribir un diagrama enorme. */
export const diagramSchema = z.object({
  nodes: z.array(nodeSchema).max(300, 'El diagrama supera las 300 figuras.'),
  edges: z.array(edgeSchema).max(600, 'El diagrama supera los 600 vínculos.'),
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'El proyecto necesita un nombre.').max(160),
  kind: z.enum(['genograma', 'familiograma', 'ecomapa']),
  description: z.string().trim().max(500).default(''),
  diagram: diagramSchema,
});

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1, 'El proyecto necesita un nombre.').max(160).optional(),
    description: z.string().trim().max(500).optional(),
    diagram: diagramSchema.optional(),
  })
  .refine((patch) => Object.values(patch).some((value) => value !== undefined), {
    message: 'No enviaste ningún cambio.',
  });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
