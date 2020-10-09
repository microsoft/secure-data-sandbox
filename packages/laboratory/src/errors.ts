import * as express from 'express';

import {
  EntityNotFoundError,
  ForbiddenError,
  IllegalOperationError,
  ValidationError,
} from '@microsoft/sds';

export function setErrorStatus(
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (err instanceof EntityNotFoundError) {
    res.statusCode = 404;
  } else if (
    err instanceof IllegalOperationError ||
    err instanceof ValidationError
  ) {
    res.statusCode = 400;
  } else if (err instanceof ForbiddenError) {
    res.statusCode = 403;
  }
  next(err);
}
