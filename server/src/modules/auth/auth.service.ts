import bcrypt from 'bcryptjs';
import { signToken } from '../../middleware/authenticate';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../shared/errors';
import type { PublicUser } from '../../shared/types';
import * as usersRepository from '../users/users.repository';
import type { LoginInput, RegisterInput } from './auth.schema';

/**
 * Coste del hash. Diez rondas es el equilibrio habitual: encarece lo suficiente
 * un ataque por fuerza bruta sin volver lento el inicio de sesión.
 */
const SALT_ROUNDS = 10;

export type Session = { token: string; user: PublicUser };

export async function register(input: RegisterInput): Promise<Session> {
  if (await usersRepository.findByEmail(input.email)) {
    throw new ConflictError('Ya existe una cuenta registrada con ese correo.');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  try {
    const row = await usersRepository.insertUser({
      name: input.name,
      email: input.email,
      passwordHash,
      profile: input.profile,
      institution: input.institution,
    });

    return { token: signToken(row.id), user: usersRepository.toPublicUser(row) };
  } catch (error) {
    // Dos registros simultáneos con el mismo correo: la restricción única de la
    // base es la que decide, y aquí se traduce a un mensaje entendible.
    if (isUniqueViolation(error)) {
      throw new ConflictError('Ya existe una cuenta registrada con ese correo.');
    }
    throw error;
  }
}

export async function login(input: LoginInput): Promise<Session> {
  const row = await usersRepository.findByEmail(input.email);

  // El mismo mensaje para correo inexistente y contraseña incorrecta: así la
  // respuesta no revela qué correos están registrados.
  const genericFailure = new UnauthorizedError('El correo o la contraseña no coinciden.');

  if (!row?.password_hash) throw genericFailure;

  const matches = await bcrypt.compare(input.password, row.password_hash);
  if (!matches) throw genericFailure;

  return { token: signToken(row.id), user: usersRepository.toPublicUser(row) };
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const row = await usersRepository.findById(userId);
  if (!row) throw new NotFoundError('La cuenta ya no existe.');
  return usersRepository.toPublicUser(row);
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
}
