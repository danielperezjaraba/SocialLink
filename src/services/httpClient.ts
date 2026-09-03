import { clearSession, getToken } from '@/services/session';

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Las rutas públicas, como el catálogo de planes, no envían token. */
  auth?: boolean;
};

type ErrorPayload = { message?: string; error?: string };

/**
 * Punto único de contacto con la API: añade el token, interpreta los errores del
 * servidor y traduce los fallos de red a un mensaje que la interfaz pueda mostrar.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      'No pudimos contactar el servidor. Revisa tu conexión o que la API esté encendida.',
      0,
      'NETWORK_ERROR',
    );
  }

  if (response.status === 204) return undefined as T;

  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    // Un token vencido o alterado deja de servir: se descarta la sesión para
    // que la aplicación devuelva a la persona al inicio en lugar de insistir.
    if (response.status === 401) clearSession();

    const detail = (payload ?? {}) as ErrorPayload;
    throw new ApiError(
      detail.message ?? 'Ocurrió un error al comunicarse con el servidor.',
      response.status,
      detail.error ?? 'UNKNOWN',
    );
  }

  return payload as T;
}
