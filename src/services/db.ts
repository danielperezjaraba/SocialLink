import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Project } from '@/services/types';

/**
 * Almacén del navegador, usado solo por la sesión de exploración. Las cuentas
 * reales guardan todo en el servidor; aquí únicamente viven los borradores de
 * quien está probando la herramienta sin registrarse.
 */
interface SocialLinkDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
    indexes: { 'by-owner': string };
  };
}

const DB_NAME = 'sociallink';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<SocialLinkDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<SocialLinkDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SocialLinkDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains('projects')) {
          const projects = db.createObjectStore('projects', { keyPath: 'id' });
          projects.createIndex('by-owner', 'ownerId');
        }

        // La versión 1 guardaba cuentas y contraseñas derivadas en el navegador.
        // Ahora esa responsabilidad es del servidor, así que ese almacén se
        // elimina y de paso desaparecen las credenciales que hubieran quedado.
        // Se accede sin tipar porque 'users' ya no existe en el esquema actual.
        const legacy = db as unknown as IDBPDatabase;
        if (oldVersion < 2 && legacy.objectStoreNames.contains('users')) {
          legacy.deleteObjectStore('users');
        }
      },
    });
  }
  return dbPromise;
}
