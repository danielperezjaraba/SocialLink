import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from '../shared/errors';

/**
 * Valida el cuerpo de la petición y lo reemplaza por la versión ya tipada, de
 * modo que los controladores nunca trabajen con datos sin verificar.
 */
export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details: Record<string, string> = {};
      for (const issue of result.error.issues) {
        details[issue.path.join('.') || 'body'] = issue.message;
      }
      next(new ValidationError('Los datos enviados no son válidos.', details));
      return;
    }

    req.body = result.data;
    next();
  };
}
