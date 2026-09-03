import { Pool, type PoolClient } from 'pg';
import { env } from './env';

/**
 * Supabase exige TLS y limita las conexiones simultáneas en el plan gratuito,
 * por eso el pool se mantiene pequeño.
 */
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on('error', (error) => {
  console.error('Error inesperado en el pool de conexiones:', error.message);
});

/**
 * Ejecuta varias sentencias como una sola unidad: si alguna falla, ninguna queda
 * aplicada. Es lo que permite reemplazar un diagrama completo sin dejarlo a medias.
 */
export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function verifyConnection(): Promise<void> {
  const { rows } = await pool.query<{ version: string }>('SELECT version()');
  console.log(`Conectado a PostgreSQL: ${rows[0].version.split(',')[0]}`);
}
