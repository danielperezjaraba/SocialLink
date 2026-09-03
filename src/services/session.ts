const TOKEN_KEY = 'sociallink.token';
const MODE_KEY = 'sociallink.mode';

/**
 * La aplicación funciona de dos maneras. Con cuenta, todo viaja al servidor y
 * queda en la base de datos. En modo exploración, nada sale del navegador: así
 * se puede probar el editor sin registrarse y sin ocupar la base con pruebas.
 */
export type SessionMode = 'remote' | 'guest';

export function getSessionMode(): SessionMode | null {
  const mode = localStorage.getItem(MODE_KEY);
  return mode === 'remote' || mode === 'guest' ? mode : null;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function startRemoteSession(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(MODE_KEY, 'remote');
}

export function startGuestSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.setItem(MODE_KEY, 'guest');
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(MODE_KEY);
}

export function isGuestSession(): boolean {
  return getSessionMode() === 'guest';
}
