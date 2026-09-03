import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../shared/errors';

declare module 'express-serve-static-core' {
  interface Request {
    /** Identificador de la persona autenticada, puesto por este middleware. */
    userId?: string;
  }
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '7d' });
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Falta el token de sesión.'));
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET);
    const userId = typeof payload === 'string' ? null : payload.sub;

    if (typeof userId !== 'string') {
      next(new UnauthorizedError());
      return;
    }

    req.userId = userId;
    next();
  } catch {
    next(new UnauthorizedError());
  }
}

/** Atajo para los controladores, que solo se montan detrás de `authenticate`. */
export function requireUserId(req: Request): string {
  if (!req.userId) throw new UnauthorizedError();
  return req.userId;
}
