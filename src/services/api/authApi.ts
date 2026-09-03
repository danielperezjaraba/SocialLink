import type { PlanId } from '@/configs/plans';
import { AuthError } from '@/services/errors';
import { ApiError, request } from '@/services/httpClient';
import type { User, UserProfile } from '@/services/types';

export type SessionResponse = { token: string; user: User };

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  profile: UserProfile;
  institution: string;
};

/**
 * Los rechazos previsibles del servidor (correo repetido, contraseña incorrecta)
 * se convierten en `AuthError` para que los formularios los muestren tal cual.
 */
function toAuthError(error: unknown): never {
  if (error instanceof ApiError && (error.status === 401 || error.status === 409)) {
    throw new AuthError(error.message);
  }
  throw error;
}

export async function register(payload: RegisterPayload): Promise<SessionResponse> {
  try {
    return await request<SessionResponse>('/auth/register', {
      method: 'POST',
      body: payload,
      auth: false,
    });
  } catch (error) {
    return toAuthError(error);
  }
}

export async function login(email: string, password: string): Promise<SessionResponse> {
  try {
    return await request<SessionResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
  } catch (error) {
    return toAuthError(error);
  }
}

export async function fetchCurrentUser(): Promise<User> {
  const { user } = await request<{ user: User }>('/auth/me');
  return user;
}

export type ProfilePatch = {
  name?: string;
  profile?: UserProfile;
  institution?: string;
  plan?: PlanId;
};

export async function updateCurrentUser(patch: ProfilePatch): Promise<User> {
  const { user } = await request<{ user: User }>('/users/me', { method: 'PATCH', body: patch });
  return user;
}
