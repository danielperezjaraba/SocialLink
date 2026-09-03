import type { NextFunction, Request, RequestHandler, Response } from 'express';

type Attempt = { count: number; resetAt: number };

/**
 * Limitador por ventana fija, en memoria. Frena los intentos automatizados
 * contra el inicio de sesión sin añadir dependencias. Si algún día la API corre
 * en varias instancias, este conteo tendrá que moverse a un almacén compartido.
 */
export function rateLimit(options: { windowMs: number; max: number; message: string }): RequestHandler {
  const attempts = new Map<string, Attempt>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip ?? 'desconocido';

    // Limpieza oportunista: evita que el mapa crezca sin control.
    if (attempts.size > 5_000) {
      for (const [entry, value] of attempts) {
        if (value.resetAt <= now) attempts.delete(entry);
      }
    }

    const current = attempts.get(key);

    if (!current || current.resetAt <= now) {
      attempts.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    current.count += 1;

    if (current.count > options.max) {
      const seconds = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader('Retry-After', seconds);
      res.status(429).json({ error: 'TOO_MANY_REQUESTS', message: options.message });
      return;
    }

    next();
  };
}
