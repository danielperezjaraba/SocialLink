import type { PlanId } from '@/configs/plans';
import * as authApi from '@/services/api/authApi';
import { AuthError } from '@/services/errors';
import * as guest from '@/services/local/localAuthService';
import {
  clearSession,
  getSessionMode,
  getToken,
  startGuestSession,
  startRemoteSession,
} from '@/services/session';
import type { User, UserProfile } from '@/services/types';

export { AuthError };

/**
 * Punto de entrada único para las pantallas. Decide, según cómo se entró, si la
 * operación va contra la API o contra el navegador, de modo que ni el editor ni
 * los formularios tengan que saber en qué modalidad está la persona.
 */

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  profile: UserProfile;
  institution?: string;
};

export async function register(input: RegisterInput): Promise<User> {
  const { token, user } = await authApi.register({
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    profile: input.profile,
    institution: input.institution?.trim() ?? '',
  });

  startRemoteSession(token);
  return user;
}

export async function login(email: string, password: string): Promise<User> {
  const { token, user } = await authApi.login(email.trim().toLowerCase(), password);
  startRemoteSession(token);
  return user;
}

/** Sesión de exploración: permite probar el editor sin crear una cuenta. */
export async function continueAsGuest(): Promise<User> {
  startGuestSession();
  return guest.startGuest();
}

export async function getCurrentUser(): Promise<User | null> {
  const mode = getSessionMode();

  if (mode === 'guest') return guest.getGuest();
  if (mode !== 'remote' || !getToken()) return null;

  try {
    return await authApi.fetchCurrentUser();
  } catch {
    // Token vencido, cuenta eliminada o servidor caído: se vuelve al inicio en
    // lugar de dejar la aplicación atrapada en una sesión que ya no sirve.
    clearSession();
    return null;
  }
}

export async function logout(): Promise<void> {
  if (getSessionMode() === 'guest') guest.endGuest();
  clearSession();
}

/**
 * No recibe identificador: la cuenta que se modifica es siempre la de la sesión
 * en curso, y el servidor la deduce del token. Así no hay forma de pedir un
 * cambio sobre la cuenta de otra persona.
 */
export async function updateUser(
  patch: Partial<Pick<User, 'name' | 'profile' | 'institution' | 'plan'>>,
): Promise<User> {
  if (getSessionMode() === 'guest') return guest.updateGuest(patch);
  return authApi.updateCurrentUser(patch);
}

export async function changePlan(plan: PlanId): Promise<User> {
  return updateUser({ plan });
}
