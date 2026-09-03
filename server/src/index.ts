import { createApp } from './app';
import { pool, verifyConnection } from './config/db';
import { env } from './config/env';

async function main(): Promise<void> {
  await verifyConnection();

  const server = createApp().listen(env.PORT, () => {
    console.log(`API de SocialLink escuchando en http://localhost:${env.PORT}`);
    console.log(`Origen autorizado: ${env.corsOrigins.join(', ')}`);
  });

  // Cierre ordenado: deja terminar las peticiones en curso y suelta el pool
  // antes de salir, para no dejar conexiones colgando en Supabase.
  const shutdown = (signal: string) => {
    console.log(`\n${signal} recibido, cerrando el servidor.`);
    server.close(() => {
      pool.end().finally(() => process.exit(0));
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\nNo se pudo iniciar la API: ${message}`);
  console.error(
    'Revisa que DATABASE_URL en server/.env sea la cadena de conexión de Supabase y que la contraseña sea correcta.\n',
  );
  process.exit(1);
});
