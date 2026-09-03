import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Prepara server/.env a partir del ejemplo y genera la clave de firma de las
 * sesiones en este equipo. La clave nunca sale de aquí ni queda en el historial.
 */
const serverDir = dirname(dirname(fileURLToPath(import.meta.url)));
const target = join(serverDir, '.env');
const template = join(serverDir, '.env.example');

if (existsSync(target)) {
  console.log('Ya existe server/.env, no se toca nada.');
  console.log('Si quieres empezar de cero, bórralo y vuelve a ejecutar este comando.');
  process.exit(0);
}

const secret = randomBytes(48).toString('hex');
const content = readFileSync(template, 'utf8').replace('JWT_SECRET=', `JWT_SECRET=${secret}`);

writeFileSync(target, content, 'utf8');

console.log('Listo: se creó server/.env con una clave de firma nueva.');
console.log('');
console.log('Falta un paso manual: abre server/.env y pega tu cadena de conexión');
console.log('en DATABASE_URL. La encuentras en Supabase, en Project Settings ->');
console.log('Database -> Session pooler, en formato URI, reemplazando');
console.log('[YOUR-PASSWORD] por la contraseña de la base que guardaste al crear el proyecto.');
