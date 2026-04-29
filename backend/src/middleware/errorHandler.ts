import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/AppError';
import { DuplicateEmailError } from '../errors/AppError';
import type { ErrorResponseBody } from '../types/api';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ValidationError) {
    const body: ErrorResponseBody = {
      message: err.message,
      error: err.details,
    };
    res.status(400).json(body);
    return;
  }
  if (err instanceof DuplicateEmailError) {
    const body: ErrorResponseBody = {
      message: err.message,
      error: 'EMAIL_DUPLICATE',
    };
    res.status(400).json(body);
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = err as any;
  if (e?.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      message: 'Invalid file',
      error: 'File size must not exceed 10MB',
    } satisfies ErrorResponseBody);
    return;
  }
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({
    message: 'Internal server error',
    error: e?.message ?? 'Unexpected error',
  } satisfies ErrorResponseBody);
}
