import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { AppError, NotFoundError, ValidationError } from '../shared/errors';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError('La ruta solicitada no existe.'));
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.status).json({
      error: error.code,
      message: error.message,
      ...(error instanceof ValidationError ? { details: error.details } : {}),
    });
    return;
  }

  // Cualquier otra cosa es un fallo no previsto: se registra completo en el
  // servidor y hacia afuera solo sale un mensaje genérico.
  console.error('Error no controlado:', error);

  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'Ocurrió un error inesperado en el servidor.',
    ...(env.isProduction ? {} : { detail: error instanceof Error ? error.message : String(error) }),
  });
}
