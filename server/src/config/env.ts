import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().min(1, 'Falta la cadena de conexión a la base de datos.'),
  JWT_SECRET: z.string().min(32, 'La clave de firma debe tener al menos 32 caracteres.'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const detail = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  console.error(
    `\nNo se pudo iniciar la API porque la configuración está incompleta:\n${detail}\n\n` +
      'Copia server/.env.example como server/.env y completa los valores.\n',
  );
  process.exit(1);
}

export const env = {
  ...parsed.data,
  /** Orígenes autorizados a consumir la API, separados por comas en la variable. */
  corsOrigins: parsed.data.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  isProduction: parsed.data.NODE_ENV === 'production',
};
