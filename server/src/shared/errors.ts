/** Error de dominio: ya sabe con qué código HTTP debe responderse. */
export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'La sesión no es válida o expiró.') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/** Se usa también cuando el recurso existe pero no pertenece a quien lo pide. */
export class NotFoundError extends AppError {
  constructor(message = 'El recurso solicitado no existe.') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class PlanLimitError extends AppError {
  constructor(message: string) {
    super(message, 403, 'PLAN_LIMIT');
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    readonly details: Record<string, string>,
  ) {
    super(message, 422, 'VALIDATION_ERROR');
  }
}
